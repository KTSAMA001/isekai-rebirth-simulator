/**
 * SimulationEngine — 推演引擎（编排中心）
 * 管理一整局游戏的生命周期：
 * initGame → draftTalents → selectTalents → allocateAttributes → simulateYear × N → finish
 */

import type { EventEffect, GameState, LifeRoute, WorldInstance, WorldEventDef, YearResult } from './types'
import { RandomProvider } from './RandomProvider'
import { AttributeModule } from '../modules/AttributeModule'
import { TalentModule } from '../modules/TalentModule'
import { EventModule } from '../modules/EventModule'
import { ConditionDSL } from '../modules/ConditionDSL'
import { EvaluatorModule } from '../modules/EvaluatorModule'
import { AchievementModule } from '../modules/AchievementModule'
import { ItemModule } from '../modules/ItemModule'

/** 生成简短唯一 ID */
function generatePlayId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export class SimulationEngine {
  private state!: GameState
  private world: WorldInstance
  private random: RandomProvider
  private attrModule: AttributeModule
  private talentModule: TalentModule
  private eventModule: EventModule
  private evaluatorModule: EvaluatorModule
  private achievementModule: AchievementModule
  private itemModule: ItemModule
  private dsl: ConditionDSL
  /** 基于初始体魄的固定恢复量（allocateAttributes 时计算，不再随属性成长增长） */
  private initialStrRegen = 1
  /** 当前激活的路线 */
  private activeRoute: LifeRoute | null = null
  /** 已触发的路线锚点事件（key = "routeId:eventId"） */
  private routeAnchorsTriggered: Set<string> = new Set()

  constructor(world: WorldInstance, seed?: number) {
    this.world = world
    this.random = new RandomProvider(seed ?? Date.now())
    this.dsl = new ConditionDSL()
    this.attrModule = new AttributeModule(world)
    this.talentModule = new TalentModule(world, this.random)
    this.eventModule = new EventModule(world, this.random, this.dsl, this.attrModule)
    this.evaluatorModule = new EvaluatorModule(world)
    this.achievementModule = new AchievementModule(world, this.dsl)
    this.itemModule = new ItemModule(world, this.dsl)
  }

  /** 初始化新游戏 */
  initGame(characterName: string, presetId?: string): GameState {
    const attrs = this.attrModule.initAttributes()
    const peaks: Record<string, number> = {}
    for (const key of Object.keys(attrs)) {
      peaks[key] = attrs[key]
    }

    this.state = {
      meta: {
        worldId: this.world.manifest.id,
        seed: this.random.saveState(),
        playId: generatePlayId(),
        startedAt: Date.now(),
        presetId,
      },
      character: {
        name: characterName || '无名之人',
      },
      attributes: attrs,
      attributeHistory: [this.attrModule.snapshot(attrs, 0)],
      attributePeaks: peaks,
      talents: {
        selected: [],
        draftPool: [],
        inherited: [],
      },
      age: 0,
      hp: 0, // 会在下面重新计算
      flags: new Set<string>(),
      counters: new Map<string, number>(),
      triggeredEvents: new Set<string>(),
      eventLog: [],
      achievements: {
        unlocked: [],
        progress: {},
      },
      inventory: { items: [], maxSlots: 3 },
      phase: 'talent-draft',
    }

    // 初始 HP = 20 + 体魄×3
    this.state.hp = this.computeInitHp()

    // 初始化路线系统
    this.activeRoute = null
    this.routeAnchorsTriggered = new Set()

    return this.getState()
  }

  /** 抽取天赋 */
  draftTalents(): string[] {
    if (this.state.phase !== 'talent-draft') {
      throw new Error(`当前阶段 ${this.state.phase} 不允许抽取天赋`)
    }

    const { drafted } = this.talentModule.draftTalents(
      [],
      this.state.talents.inherited,
      this.world.manifest.talentDraftCount
    )

    this.state = {
      ...this.state,
      talents: {
        ...this.state.talents,
        draftPool: drafted,
      },
      phase: 'attribute-allocate',
    }

    return drafted
  }

  /** 选择天赋 */
  selectTalents(talentIds: string[]): GameState {
    const { selected, conflicts } = this.talentModule.selectTalents(
      this.state.talents.draftPool,
      talentIds,
      this.world.manifest.talentSelectCount
    )

    if (conflicts.length > 0) {
      console.warn(`[天赋] 互斥冲突已自动解决: ${conflicts.join('; ')}`)
    }

    // 应用天赋属性修改
    const modifications = this.talentModule.getImmediateEffects(selected)
    const { attributes, peaks } = this.attrModule.modify(
      this.state.attributes,
      this.state.attributePeaks,
      modifications
    )

    this.state = {
      ...this.state,
      talents: {
        ...this.state.talents,
        selected,
      },
      attributes,
      attributePeaks: peaks,
    }

    return this.getState()
  }

  /** 分配属性 */
  allocateAttributes(allocation: Record<string, number>): GameState {
    if (this.state.phase !== 'attribute-allocate') {
      throw new Error(`当前阶段 ${this.state.phase} 不允许分配属性`)
    }

    const { attributes, remaining } = this.attrModule.allocate(
      this.state.attributes,
      allocation,
      this.world.manifest.initialPoints
    )

    if (remaining < 0) {
      throw new Error(`超出可分配点数`)
    }

    // 更新峰值
    const peaks = { ...this.state.attributePeaks }
    for (const key of Object.keys(attributes)) {
      if (attributes[key] > (peaks[key] ?? 0)) {
        peaks[key] = attributes[key]
      }
    }

    // 根据（天赋+分配后的）属性计算初始 HP
    this.state.hp = this.computeInitHp()
    // 固定每年的恢复量（基于初始体魄，不随成长增长）
    const initStr = attributes['str'] ?? 0
    this.initialStrRegen = 1 + Math.floor(initStr / 3)

    this.state = {
      ...this.state,
      attributes,
      attributePeaks: peaks,
      attributeHistory: [this.attrModule.snapshot(attributes, 0)],
      phase: 'simulating',
    }

    return this.getState()
  }

  // ==================== Galgame 化三步流程 ====================

  /** 根据属性计算初始 HP：20 + 体魄×3 */
  private computeInitHp(): number {
    const str = this.state.attributes['str'] ?? 0
    return 20 + str * 3
  }

  /** 每年恢复 HP：基于初始体魄（不随属性成长增长），软上限控制 */
  private regenHp(): void {
    const regen = this.initialStrRegen
    const initHp = this.computeInitHp()
    // 软上限：初始HP × 1.5 + 年龄×0.5，避免高体魄角色HP无限膨胀
    const softCap = Math.floor(initHp * 1.5 + this.state.age * 0.5)
    // 物品HP恢复加成
    const itemBonus = this.itemModule.getHpRegenBonus(this.state)
    // 物品HP软上限修正
    const capModifier = this.itemModule.getHpCapModifier(this.state)
    const modifiedCap = Math.max(softCap * (1 + capModifier), 20)
    const newHp = Math.min(this.state.hp + regen + itemBonus, modifiedCap)
    this.state = {
      ...this.state,
      hp: newHp,
    }
  }

  /** 缓存：startYear 产生的待处理事件 */
  private pendingYearEvent: import('./types').WorldEventDef | null = null

  /** 开始一年：年龄+1，获取事件，返回年度结果 */
  startYear(): YearResult {
    if (this.state.phase !== 'simulating') {
      throw new Error(`当前阶段 ${this.state.phase} 不允许推演`)
    }

    // 新的一年：恢复部分 HP（上一年受伤的恢复）
    this.regenHp()

    // 年龄 +1
    let newState = {
      ...this.state,
      age: this.state.age + 1,
    }

    // 检查天赋年龄触发效果
    const talentEffects = this.talentModule.getActiveEffects(
      newState.talents.selected,
      newState.age,
      newState
    )

    // 应用天赋触发效果
    if (talentEffects.length > 0) {
      for (const effect of talentEffects) {
        if (effect.type === 'modify_attribute' && effect.value !== undefined) {
          const result = this.attrModule.modify(
            newState.attributes,
            newState.attributePeaks,
            [{ attribute: effect.target, value: effect.value }]
          )
          newState = { ...newState, attributes: result.attributes, attributePeaks: result.peaks }
        }
      }
    }

    this.state = newState

    // 获取候选事件
    const candidates = this.eventModule.getCandidates(this.state.age, this.state)

    // 路线系统：检查路线切换
    this.updateRoute()

    // 路线系统：检查强制锚点事件
    const anchorEvent = this.checkMandatoryAnchor()
    if (anchorEvent) {
      // 锚点事件强制触发，跳过正常选择
      this.pendingYearEvent = anchorEvent
      this.state = {
        ...this.state,
        triggeredEvents: new Set([...this.state.triggeredEvents, anchorEvent.id]),
      }
      if (anchorEvent.branches && anchorEvent.branches.length > 0) {
        return { phase: 'awaiting_choice', event: anchorEvent, branches: anchorEvent.branches }
      }
      // 无分支锚点直接执行
      const effectTexts = this.eventModule.applyEffectsOnState(anchorEvent.effects, this.state)
      const logEntry = { age: this.state.age, eventId: anchorEvent.id, title: anchorEvent.title, description: anchorEvent.description, effects: effectTexts }
      this.state = { ...this.state, eventLog: [...this.state.eventLog, logEntry] }
      this.pendingYearEvent = null
      this.postYearProcess()
      return { phase: 'showing_event', event: anchorEvent, effectTexts, logEntry }
    }

    if (candidates.length === 0) {
      // 平淡年
      this.pendingYearEvent = null
      return { phase: 'mundane_year', event: null }
    }

    // 动态权重选择：应用 weightModifiers + minor 降权
    const ctx = { state: this.state, world: this.world }
    const scored = candidates.map(e => {
      let w = e.weight
      if (e.weightModifiers) {
        for (const mod of e.weightModifiers) {
          if (this.dsl.evaluate(mod.condition, ctx)) {
            w *= mod.weightMultiplier
          }
        }
      }
      // minor 事件降权，减少填充事件干扰
      if ((e.priority ?? 'minor') === 'minor') {
        w *= 0.7
      }
      return { event: e, weight: w }
    })
    let event: WorldEventDef | null = this.random.weightedPick(scored, s => s.weight).event
    if (!event) {
      this.pendingYearEvent = null
      return { phase: 'mundane_year', event: null }
    }
    this.pendingYearEvent = event

    // 记录已触发
    this.state = {
      ...this.state,
      triggeredEvents: new Set([...this.state.triggeredEvents, event.id]),
    }

    if (event.branches && event.branches.length > 0) {
      // 有分支 → 需要玩家选择
      return {
        phase: 'awaiting_choice',
        event,
        branches: event.branches,
      }
    }

    // 无分支的普通事件 → 应用效果，显示结果
    const clonedState = this.cloneState(this.state)
    const effectTexts = this.eventModule.applyEffectsOnState(event.effects, clonedState)

    // 记录日志
    const logEntry = {
      age: this.state.age,
      eventId: event.id,
      title: event.title,
      description: event.description,
      effects: effectTexts,
    }
    clonedState.eventLog = [...this.state.eventLog, logEntry]

    this.state = clonedState
    this.pendingYearEvent = null

    // 后处理（快照、成就、死亡检查）
    this.postYearProcess()

    return {
      phase: 'showing_event',
      event,
      effectTexts,
      logEntry,
    }
  }

  /** 玩家选择分支，应用效果 */
  resolveBranch(branchId: string): YearResult {
    if (!this.pendingYearEvent) {
      throw new Error('没有待处理的分支事件')
    }

    const event = this.pendingYearEvent
    const branch = event.branches?.find(b => b.id === branchId)
    if (!branch) {
      throw new Error(`分支 ${branchId} 不存在`)
    }

    let isSuccess: boolean | undefined
    let riskRolled = false
    let chosenEffects: EventEffect[]
    let resultText: string | undefined

    // 风险判定
    if (branch.riskCheck) {
      riskRolled = true
      const rc = branch.riskCheck
      const attrValue = this.state.attributes[rc.attribute] ?? 0
      const scale = rc.scale ?? 3
      const x = (attrValue - rc.difficulty) / scale
      const chance = 1 / (1 + Math.exp(-x))
      isSuccess = this.random.chance(chance)

      if (isSuccess) {
        chosenEffects = [...event.effects, ...branch.effects]
        resultText = branch.successText
      } else {
        chosenEffects = [...event.effects, ...(branch.failureEffects ?? branch.effects)]
        resultText = branch.failureText
      }
    } else {
      // 确定性结果
      chosenEffects = [...event.effects, ...branch.effects]
    }

    // 处理物品获取
    const grantItemMessages: string[] = []
    for (const fx of chosenEffects) {
      if (fx.type === 'grant_item') {
        const result = this.itemModule.grantItem(this.state, fx.target)
        grantItemMessages.push(result.message)
        if (result.success) {
          const hpBonus = this.itemModule.getFlatHpBonus(fx.target)
          if (hpBonus > 0) {
            this.state = { ...this.state, hp: this.state.hp + hpBonus }
          }
        }
      }
    }

    const clonedState = this.cloneState(this.state)
    const effectTexts = this.eventModule.applyEffectsOnState(chosenEffects, clonedState)

    // 追加物品获取提示文本
    for (const msg of grantItemMessages) {
      effectTexts.push(msg)
    }

    // 如果有风险判定结果文本，追加到效果文本
    if (resultText) {
      effectTexts.push(resultText)
    }

    // 记录日志
    const logEntry = {
      age: this.state.age,
      eventId: event.id,
      title: event.title,
      description: event.description,
      effects: effectTexts,
      branchId,
    }
    clonedState.eventLog = [...this.state.eventLog, logEntry]

    this.state = clonedState
    this.pendingYearEvent = null

    // 后处理（不含 HP 恢复——HP 恢复移到下一次 startYear）
    this.postYearProcessNoRegen()

    return {
      phase: 'showing_event',
      event,
      effectTexts,
      logEntry,
      isSuccess,
      riskRolled,
    }
  }

  /** 跳过平淡年 */
  skipYear(): YearResult {
    this.pendingYearEvent = null

    // 后处理（HP恢复已在 startYear 年初完成）
    this.postYearProcessCore()

    return {
      phase: 'mundane_year',
      event: null,
      logEntry: {
        age: this.state.age,
        eventId: '__mundane__',
        title: '平静的一年',
        description: '什么特别的事都没发生，平平淡淡地度过了。',
        effects: [],
      },
    }
  }

  /** 年度后处理：快照、成就、死亡检查（HP恢复已在 startYear 年初统一完成） */
  private postYearProcess(): void {
    this.postYearProcessCore()
  }

  /** 年度后处理（不含 HP 恢复）—— 用于 resolveBranch 之后 */
  private postYearProcessNoRegen(): void {
    this.postYearProcessCore()
  }

  /** 后处理核心逻辑：快照、成就、死亡检查 */
  private postYearProcessCore(): void {
    const snapshot = this.attrModule.snapshot(this.state.attributes, this.state.age)
    let newState = {
      ...this.state,
      attributeHistory: [...this.state.attributeHistory, snapshot],
    }

    // 物品被动属性成长
    const growth = this.itemModule.getAttributeGrowth(newState)
    for (const [attrId, bonus] of Object.entries(growth)) {
      if (bonus > 0) {
        const current = newState.attributes[attrId] ?? 0
        const peak = newState.attributePeaks[attrId] ?? 0
        const max = this.world.attributes.find(a => a.id === attrId)?.max ?? 99
        const newAttr = Math.min(Math.floor(current + bonus), max)
        const newPeak = Math.max(peak, newAttr)
        newState = {
          ...newState,
          attributes: { ...newState.attributes, [attrId]: newAttr },
          attributePeaks: { ...newState.attributePeaks, [attrId]: newPeak },
        }
      }
    }

    // 检查成就
    const newAchievements = this.achievementModule.checkAchievements(newState)
    if (newAchievements.length > 0) {
      newState = {
        ...newState,
        achievements: {
          unlocked: [...newState.achievements.unlocked, ...newAchievements],
          progress: { ...newState.achievements.progress },
        },
      }
    }

    // 濒死判定：HP ≤ 10 且 > 0 时，有概率直接死亡或奇迹生还
    if (newState.hp > 0 && newState.hp <= 10) {
      const roll = this.random.next()
      if (roll < 0.25) {
        // 25% 概率直接死亡
        newState = { ...newState, hp: 0 }
      } else if (roll < 0.40) {
        // 15% 概率奇迹生还，恢复 HP
        newState = { ...newState, hp: newState.hp + 15 }
        newState.flags = new Set([...newState.flags, 'miracle_survival'])
      } else {
        // 60% 挂上濒死标记，继续
        newState.flags = new Set([...newState.flags, 'near_death'])
      }
    }

    // 免死效果检查
    if (newState.hp <= 0) {
      const deathSaveHp = this.itemModule.consumeDeathSave(newState)
      if (deathSaveHp > 0) {
        newState = { ...newState, hp: deathSaveHp }
      }
    }

    // 检查死亡
    const dead = newState.hp <= 0 || newState.age >= this.world.manifest.maxAge
    if (dead) {
      newState = { ...newState, phase: 'finished' }
      const result = this.evaluatorModule.calculate(newState)
      newState = {
        ...newState,
        result: {
          score: result.score,
          grade: result.grade,
          gradeTitle: result.gradeTitle,
          gradeDescription: result.gradeDescription,
          lifespan: newState.age,
        },
      }
    }

    this.state = newState
  }

  /** 深克隆 GameState */
  private cloneState(state: GameState): GameState {
    return {
      ...state,
      attributes: { ...state.attributes },
      attributePeaks: { ...state.attributePeaks },
      talents: {
        selected: [...state.talents.selected],
        draftPool: [...state.talents.draftPool],
        inherited: [...state.talents.inherited],
      },
      flags: new Set(state.flags),
      counters: new Map(state.counters),
      triggeredEvents: new Set(state.triggeredEvents),
      eventLog: [...state.eventLog],
      achievements: {
        unlocked: [...state.achievements.unlocked],
        progress: { ...state.achievements.progress },
      },
      inventory: {
        ...state.inventory,
        items: [...state.inventory.items],
      },
      attributeHistory: [...state.attributeHistory],
    }
  }

  // ==================== 路线系统 ====================

  /** 更新当前路线（检查退出与进入） */
  private updateRoute(): void {
    const ctx = { state: this.state, world: this.world }
    const routes = this.world.manifest.routes ?? []

    // 检查当前路线是否应该退出
    if (this.activeRoute && this.activeRoute.exitCondition) {
      if (this.dsl.evaluate(this.activeRoute.exitCondition, ctx)) {
        this.activeRoute = null
      }
    }

    // 检查是否有新路线可以进入
    if (!this.activeRoute) {
      let bestRoute: LifeRoute | null = null
      let fallbackRoute: LifeRoute | null = null

      for (const route of routes) {
        // 无 enterCondition 的路线作为 fallback 候选
        if (!route.enterCondition) {
          if (!fallbackRoute || route.priority > fallbackRoute.priority) {
            fallbackRoute = route
          }
          continue
        }
        if (this.dsl.evaluate(route.enterCondition, ctx)) {
          if (!bestRoute || route.priority > bestRoute.priority) {
            bestRoute = route
          }
        }
      }

      // 没有匹配的条件路线时，使用 fallback 路线
      const chosenRoute = bestRoute ?? fallbackRoute
      if (chosenRoute) {
        this.activeRoute = chosenRoute
        // 设置路线入场 flag
        if (chosenRoute.entryFlags && chosenRoute.entryFlags.length > 0) {
          const newFlags = new Set(this.state.flags)
          for (const f of chosenRoute.entryFlags) newFlags.add(f)
          this.state = { ...this.state, flags: newFlags }
        }
      }
    }
  }

  /** 检查当前路线是否有强制锚点事件需要触发 */
  private checkMandatoryAnchor(): WorldEventDef | null {
    if (!this.activeRoute) return null
    for (const anchor of this.activeRoute.anchorEvents) {
      if (!anchor.mandatory) continue
      const anchorKey = `${this.activeRoute.id}:${anchor.eventId}`
      if (this.routeAnchorsTriggered.has(anchorKey)) continue
      if (this.state.age < anchor.minAge || this.state.age > anchor.maxAge) continue
      // 检查事件是否满足条件
      const event = this.world.index.eventsById.get(anchor.eventId)
      if (!event) continue
      if (event.unique && this.state.triggeredEvents.has(event.id)) continue
      if (event.include && !this.dsl.evaluate(event.include, { state: this.state, world: this.world })) continue
      if (event.exclude && this.dsl.evaluate(event.exclude, { state: this.state, world: this.world })) continue
      if (event.prerequisites && !event.prerequisites.every(p => this.dsl.evaluate(p, { state: this.state, world: this.world }))) continue
      if (event.mutuallyExclusive && event.mutuallyExclusive.some(m => this.dsl.evaluate(m, { state: this.state, world: this.world }))) continue
      // 找到强制锚点
      this.routeAnchorsTriggered.add(anchorKey)
      return event
    }
    return null
  }

  /** 获取当前激活的路线（供外部查询） */
  getActiveRoute(): LifeRoute | null {
    return this.activeRoute
  }

  /** 推演一年（向后兼容，保留原有接口） */
  simulateYear(branchChoices?: Record<string, string>): GameState {
    if (this.state.phase !== 'simulating') {
      throw new Error(`当前阶段 ${this.state.phase} 不允许推演`)
    }

    // 年龄 +1
    let newState = {
      ...this.state,
      age: this.state.age + 1,
    }

    // 检查天赋年龄触发效果
    const talentEffects = this.talentModule.getActiveEffects(
      newState.talents.selected,
      newState.age,
      newState
    )

    // 应用天赋触发效果
    if (talentEffects.length > 0) {
      for (const effect of talentEffects) {
        if (effect.type === 'modify_attribute' && effect.value !== undefined) {
          const result = this.attrModule.modify(
            newState.attributes,
            newState.attributePeaks,
            [{ attribute: effect.target, value: effect.value }]
          )
          newState = { ...newState, attributes: result.attributes, attributePeaks: result.peaks }
        } else if (effect.type === 'add_event') {
          // 天赋触发事件（在事件阶段处理）
        }
      }
    }

    // 获取并执行事件
    const candidates = this.eventModule.getCandidates(newState.age, newState)
    const event = this.eventModule.pickEvent(candidates)

    if (event) {
      const branchId = branchChoices?.[event.id]
      newState = this.eventModule.resolveEvent(event, newState, branchId)
    }

    // 检查死亡条件
    const dead = newState.hp <= 0 || newState.age >= this.world.manifest.maxAge

    // 记录属性快照
    const snapshot = this.attrModule.snapshot(newState.attributes, newState.age)
    newState = {
      ...newState,
      attributeHistory: [...newState.attributeHistory, snapshot],
    }

    // 检查成就
    const newAchievements = this.achievementModule.checkAchievements(newState)
    if (newAchievements.length > 0) {
      newState = {
        ...newState,
        achievements: {
          unlocked: [...newState.achievements.unlocked, ...newAchievements],
          progress: { ...newState.achievements.progress },
        },
      }
    }

    if (dead) {
      newState = { ...newState, phase: 'finished' }
      const result = this.evaluatorModule.calculate(newState)
      newState = {
        ...newState,
        result: {
          score: result.score,
          grade: result.grade,
          gradeTitle: result.gradeTitle,
          gradeDescription: result.gradeDescription,
          lifespan: newState.age,
        },
      }
    }

    this.state = newState
    return this.getState()
  }

  /** 完成游戏，生成结算 */
  finish(): GameState {
    if (this.state.phase !== 'simulating' && this.state.phase !== 'finished') {
      throw new Error(`当前阶段 ${this.state.phase} 不允许结算`)
    }

    const result = this.evaluatorModule.calculate(this.state)
    this.state = {
      ...this.state,
      phase: 'finished',
      result: {
        score: result.score,
        grade: result.grade,
        gradeTitle: result.gradeTitle,
        gradeDescription: result.gradeDescription,
        lifespan: this.state.age,
      },
    }

    return this.getState()
  }

  /** 获取当前状态（只读副本） */
  getState(): Readonly<GameState> {
    return this.state
  }

  /** 获取世界实例 */
  getWorld(): WorldInstance {
    return this.world
  }

  /** 获取随机数生成器 */
  getRandom(): RandomProvider {
    return this.random
  }
}
