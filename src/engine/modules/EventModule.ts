/**
 * EventModule — 事件系统
 * 候选筛选 + 权重随机 + 效果执行 + 分支事件
 */

import type {
  WorldInstance,
  GameState,
  WorldEventDef,
  EventEffect,
  EventLogEntry,
  LifeRoute,
} from '../core/types'
import type { RandomProvider } from '../core/RandomProvider'
import { cloneState } from '../core/stateUtils'
import type { ConditionDSL } from './ConditionDSL'
import type { AttributeModule } from './AttributeModule'

export class EventModule {
  private world: WorldInstance
  private random: RandomProvider
  private dsl: ConditionDSL
  private attrModule: AttributeModule

  /** 人类基准寿命（[70,100] 中点），用于跨种族年龄缩放 */
  private static readonly HUMAN_BASELINE_LIFESPAN = 85

  constructor(
    world: WorldInstance,
    random: RandomProvider,
    dsl: ConditionDSL,
    attrModule: AttributeModule
  ) {
    this.world = world
    this.random = random
    this.dsl = dsl
    this.attrModule = attrModule
  }

  /**
   * 计算事件的等效年龄范围（按种族寿命比例缩放）
   * - 出生/婴儿事件（maxAge <= 1）：不缩放，确保所有种族第一年都能触发
   * - 种族专属事件（races 只包含当前种族）：不缩放，已用种族实际年龄
   * - 通用事件/多种族事件：以人类寿命为基准按比例缩放
   */
  private getScaledAgeRange(event: WorldEventDef, playerRace: string | undefined, lifespanRatio: number): [number, number] {
    // 出生/婴儿事件不缩放：游戏首个时间刻 age=1，缩放会导致短寿命种族无法触发
    if (event.maxAge <= 1) {
      return [event.minAge, event.maxAge]
    }
    // 种族专属事件不需要缩放
    const isRaceExclusive = event.races && event.races.length === 1 && event.races[0] === playerRace
    if (isRaceExclusive || lifespanRatio === 1) {
      return [event.minAge, event.maxAge]
    }
    return [
      Math.round(event.minAge * lifespanRatio),
      Math.round(event.maxAge * lifespanRatio),
    ]
  }

  /** 获取当前年龄可触发的事件候选列表 */
  getCandidates(age: number, state: GameState, activeRoutes?: LifeRoute[] | null): WorldEventDef[] {
    const ctx = { state, world: this.world }
    const playerRace = state.character.race
    const playerGender = state.character.gender
    // 寿命缩放比例：角色实际寿命 / 人类基准寿命
    const lifespanRatio = (state.effectiveMaxAge ?? EventModule.HUMAN_BASELINE_LIFESPAN) / EventModule.HUMAN_BASELINE_LIFESPAN

    return this.world.events.filter(event => {
      // 年龄范围（按种族寿命比例缩放）
      const [scaledMin, scaledMax] = this.getScaledAgeRange(event, playerRace, lifespanRatio)
      if (age < scaledMin || age > scaledMax) return false
      // unique 事件去重
      if (event.unique && state.triggeredEvents.has(event.id)) return false
      // 种族过滤：事件指定了种族列表时，玩家种族必须在其中
      if (event.races && event.races.length > 0 && playerRace) {
        if (!event.races.includes(playerRace)) return false
      }
      // 性别过滤：事件指定了性别列表时，玩家性别必须在其中
      if (event.genders && event.genders.length > 0 && playerGender) {
        if (!event.genders.includes(playerGender)) return false
      }
      // include 条件
      if (event.include && !this.dsl.evaluate(event.include, ctx)) return false
      // exclude 条件
      if (event.exclude && this.dsl.evaluate(event.exclude, ctx)) return false
      // prerequisites 过滤
      if (event.prerequisites) {
        const allMet = event.prerequisites.every(p => this.dsl.evaluate(p, ctx))
        if (!allMet) return false
      }
      // mutuallyExclusive 过滤
      if (event.mutuallyExclusive) {
        const anyMet = event.mutuallyExclusive.some(m => this.dsl.evaluate(m, ctx))
        if (anyMet) return false
      }
      // 路线过滤：事件标记了 routes 且不是 ["*"] 时，检查当前激活路线
      if (event.routes && event.routes.length > 0 && !event.routes.includes('*')) {
        if (activeRoutes && activeRoutes.length > 0) {
          const routeIds = new Set(activeRoutes.map(r => r.id))
          const mode = event.routeMode ?? 'any'
          if (mode === 'all') {
            if (!event.routes.every(r => routeIds.has(r))) return false
          } else {
            if (!event.routes.some(r => routeIds.has(r))) return false
          }
        } else {
          // 没有激活路线（commoner），非通用事件不可触发
          return false
        }
      }
      return true
    }).sort((a, b) => {
      // 按优先级排序：critical > major > minor
      const order = { critical: 0, major: 1, minor: 2 }
      const pa = order[a.priority ?? 'minor']
      const pb = order[b.priority ?? 'minor']
      if (pa !== pb) return pa - pb
      // 同优先级按权重降序
      return b.weight - a.weight
    })
  }

  /** 从候选中选择一个事件（权重随机 + 路线衰减） */
  pickEvent(candidates: WorldEventDef[], activeRoutes?: LifeRoute[] | null): WorldEventDef | null {
    if (candidates.length === 0) return null

    // 无激活路线时，直接用原始权重
    if (!activeRoutes || activeRoutes.length === 0) {
      return this.random.weightedPick(candidates, e => e.weight)
    }

    // 计算路线权重衰减：角色在同一路线家族中 tier 越高，低 tier 事件权重越低
    const weighted = candidates.map(event => {
      let w = event.weight
      if (event.routes && event.routes.length > 0 && !event.routes.includes('*')) {
        const routeIds = new Set(activeRoutes.map(r => r.id))
        // 找事件匹配的路线中最高 tier
        let eventMaxTier = 0
        for (const ar of activeRoutes) {
          if (event.routes!.includes(ar.id)) {
            eventMaxTier = Math.max(eventMaxTier, ar.tier ?? 0)
          }
        }
        // 检查角色在同一路线家族中是否有更高 tier 的路线
        for (const ar of activeRoutes) {
          const arTier = ar.tier ?? 0
          if (arTier > eventMaxTier && (event.routes!.includes(ar.id) || this.isSameRouteFamily(ar, event.routes!))) {
            w *= Math.pow(0.5, arTier - eventMaxTier)
          }
        }
      }
      return { event, weight: Math.max(0.1, w) }
    })

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
    let rand = this.random.next() * totalWeight
    for (const { event, weight } of weighted) {
      rand -= weight
      if (rand <= 0) return event
    }
    return weighted[0].event
  }

  /** 判断两个路线是否属于同一路线家族（通过 parentRoute 链追踪） */
  private isSameRouteFamily(route: LifeRoute, targetIds: string[], visited: string[] = []): boolean {
    if (targetIds.includes(route.id)) return true
    if (route.parentRoute) {
      if (visited.includes(route.parentRoute)) return false
      // 简化判断：只检查直接父子关系
      return targetIds.includes(route.parentRoute)
    }
    return false
  }

  /** 解析种族/性别变体，返回覆盖后的事件视图 */
  private resolveVariants(event: WorldEventDef, state: GameState): {
    title: string
    description: string
    branches?: typeof event.branches
    effects: EventEffect[]
  } {
    let title = event.title
    let description = event.description
    let branches = event.branches
    let effects = [...event.effects]

    // 种族变体覆盖
    const playerRace = state.character.race
    if (playerRace && event.raceVariants?.[playerRace]) {
      const rv = event.raceVariants[playerRace]
      if (rv.title) title = rv.title
      if (rv.description) description = rv.description
      if (rv.branches) branches = rv.branches
      if (rv.effects) effects = [...rv.effects]
    }

    // 性别变体覆盖（仅覆盖文本，不覆盖分支/效果）
    const playerGender = state.character.gender
    if (playerGender && event.genderVariants?.[playerGender]) {
      const gv = event.genderVariants[playerGender]
      if (gv.title) title = gv.title
      if (gv.description) description = gv.description
    }

    return { title, description, branches, effects }
  }

  /** 执行一个事件，返回状态更新 */
  resolveEvent(
    event: WorldEventDef,
    state: GameState,
    branchId?: string
  ): GameState {
    const newState = cloneState(state)

    // 记录已触发
    newState.triggeredEvents = new Set([...state.triggeredEvents, event.id])

    // 解析种族/性别变体
    const resolved = this.resolveVariants(event, newState)

    // 收集实际效果
    let effects: EventEffect[] = [...resolved.effects]
    let chosenBranchId = branchId

    // 处理分支
    if (resolved.branches && resolved.branches.length > 0) {
      if (branchId) {
        // 玩家已选择分支
        const branch = resolved.branches.find(b => b.id === branchId)
        if (branch) {
          effects = [...effects, ...branch.effects]
        }
      } else {
        // 需要玩家选择 - 设置 pendingBranch
        newState.pendingBranch = {
          eventId: event.id,
          eventTitle: resolved.title,
          eventDescription: resolved.description,
          branches: resolved.branches,
        }
        // 先应用基础效果
        const effectTexts = this.applyEffects(effects, newState)
        newState.eventLog = [
          ...state.eventLog,
          {
            age: state.age,
            eventId: event.id,
            title: resolved.title,
            description: resolved.description,
            effects: effectTexts,
          },
        ]
        return newState
      }
    }

    // 应用效果
    const effectTexts = this.applyEffects(effects, newState)

    // 记录日志
    const logEntry: EventLogEntry = {
      age: state.age,
      eventId: event.id,
      title: resolved.title,
      description: resolved.description,
      effects: effectTexts,
      branchId: chosenBranchId,
    }
    newState.eventLog = [...state.eventLog, logEntry]

    return newState
  }

  /** 应用效果列表到状态（公开版本，供 SimulationEngine 调用） */
  applyEffectsOnState(effects: EventEffect[], state: GameState): string[] {
    return this.applyEffects(effects, state)
  }

  /** 应用效果列表到状态 */
  private applyEffects(effects: EventEffect[], state: GameState): string[] {
    const ctx = { state, world: this.world }
    const texts: string[] = []

    for (const effect of effects) {
      // 概率检查
      if (effect.probability !== undefined && !this.random.chance(effect.probability)) {
        continue
      }
      // 条件检查
      if (effect.condition && !this.dsl.evaluate(effect.condition, ctx)) {
        continue
      }

      const text = this.applyEffect(effect, state)
      if (text) texts.push(text)
    }

    return texts
  }

  /** 应用单个效果 */
  private applyEffect(effect: EventEffect, state: GameState): string {
    switch (effect.type) {
      case 'modify_attribute': {
        const result = this.attrModule.modify(
          state.attributes,
          state.attributePeaks,
          [{ attribute: effect.target, value: effect.value }]
        )
        state.attributes = result.attributes
        state.attributePeaks = result.peaks
        const sign = effect.value >= 0 ? '+' : ''
        const def = this.world.index.attributesById.get(effect.target)
        return effect.description ?? `${def?.name ?? effect.target} ${sign}${effect.value}`
      }
      case 'set_attribute': {
        const result = this.attrModule.set(
          state.attributes,
          state.attributePeaks,
          effect.target,
          effect.value
        )
        state.attributes = result.attributes
        state.attributePeaks = result.peaks
        return effect.description ?? `${this.world.index.attributesById.get(effect.target)?.name ?? effect.target} 设为 ${effect.value}`
      }
      case 'modify_hp': {
        const hpBefore = state.hp
        state.hp = Math.max(0, state.hp + effect.value)
        // 致命打击：单次伤害超过当前 HP 的 50%，额外扣 10 HP
        if (effect.value < 0 && Math.abs(effect.value) > hpBefore * 0.5) {
          state.hp = Math.max(0, state.hp - 10)
          return `${effect.description ?? `HP ${effect.value}`}；致命打击！额外 HP -10`
        }
        return effect.description ?? `HP ${effect.value >= 0 ? '+' : ''}${effect.value}`
      }
      case 'set_flag': {
        state.flags = new Set([...state.flags, effect.target])
        return effect.description ?? ''
      }
      case 'remove_flag': {
        const newFlags = new Set(state.flags)
        newFlags.delete(effect.target)
        state.flags = newFlags
        return effect.description ?? ''
      }
      case 'add_talent': {
        if (!state.talents.selected.includes(effect.target)) {
          state.talents.selected = [...state.talents.selected, effect.target]
        }
        return effect.description ?? `获得天赋: ${effect.target}`
      }
      case 'set_counter': {
        state.counters = new Map([...state.counters, [effect.target, effect.value]])
        return effect.description ?? `计数器 ${effect.target} 设为 ${effect.value}`
      }
      case 'modify_counter': {
        const current = state.counters.get(effect.target) ?? 0
        const newVal = current + effect.value
        state.counters = new Map([...state.counters, [effect.target, newVal]])
        const sign = effect.value >= 0 ? '+' : ''
        return effect.description ?? `计数器 ${effect.target} ${sign}${effect.value}`
      }
      case 'grant_item': {
        // 物品获取由 SimulationEngine 处理
        return effect.description ?? ''
      }
      case 'trigger_event': {
        // 触发后续事件
        const nextEvent = this.world.index.eventsById.get(effect.target)
        if (nextEvent) {
          const innerState = this.resolveEvent(nextEvent, state)
          // 选择性合并内部事件结果（避免 Object.assign 覆盖整个 state 引用）
          state.hp = innerState.hp
          state.attributes = innerState.attributes
          state.attributePeaks = innerState.attributePeaks
          state.flags = innerState.flags
          state.counters = innerState.counters
          state.talents = innerState.talents
          state.maxHpBonus = innerState.maxHpBonus
          state.eventLog = innerState.eventLog
          state.triggeredEvents = innerState.triggeredEvents
          state.inventory = innerState.inventory
        }
        return effect.description ?? `触发事件: ${effect.target}`
      }
      case 'modify_max_hp_bonus': {
        state.maxHpBonus = (state.maxHpBonus ?? 0) + effect.value
        const sign = effect.value >= 0 ? '+' : ''
        return effect.description ?? `HP上限加成 ${sign}${effect.value}`
      }
      default:
        return ''
    }
  }
}
