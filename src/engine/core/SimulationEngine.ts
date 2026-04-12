/**
 * SimulationEngine — 推演引擎（编排中心）
 * 管理一整局游戏的生命周期：
 * initGame → draftTalents → selectTalents → allocateAttributes → simulateYear × N → finish
 */

import type { EventEffect, GameState, Gender, LifeRoute, WorldInstance, WorldEventDef, YearResult, DiceCheckResult } from './types'
import { RandomProvider } from './RandomProvider'
import { cloneState } from './stateUtils'
import { AttributeModule } from '../modules/AttributeModule'
import { TalentModule } from '../modules/TalentModule'
import { EventModule } from '../modules/EventModule'
import { ConditionDSL } from '../modules/ConditionDSL'
import { EvaluatorModule } from '../modules/EvaluatorModule'
import { AchievementModule } from '../modules/AchievementModule'
import { ItemModule } from '../modules/ItemModule'
import { DiceModule } from '../modules/DiceModule'

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
  private diceModule: DiceModule
  private dsl: ConditionDSL
  /** 基于初始体魄的固定恢复量（allocateAttributes 时计算，不再随属性成长增长） */
  private initialStrRegen = 1
  /** 当前激活的路线 */
  private activeRoute: LifeRoute | null = null
  /** 已触发的路线锚点事件（key = "routeId:eventId"） */
  private routeAnchorsTriggered: Set<string> = new Set()
  /** 本局实际最大年龄（受种族寿命范围影响） */
  private effectiveMaxAge = 0
  private personalSigmoidMid = 0
  /** 童年 HP 伤害保护年龄阈值（modify_hp 中使用） */
  static readonly CHILDHOOD_HP_PROTECTION_AGE = 15
  /** 童年死亡保护年龄阈值（濒死判定中使用） */
  static readonly CHILDHOOD_DEATH_PROTECTION_AGE = 10

  /** 从已保存的状态恢复引擎 */
  static restoreFromState(state: GameState, world: WorldInstance): SimulationEngine {
    const engine = new SimulationEngine(world, state.meta.seed)
    engine.state = state

    // 恢复随机数状态
    if (typeof state.meta.seed === 'number') {
      engine.random.restoreState(state.meta.seed)
    }

    // 从第一个属性快照重建 initialStrRegen
    const firstSnapshot = state.attributeHistory[0]
    const initStr = firstSnapshot?.values?.['str'] ?? state.attributes['str'] ?? 0
    engine.initialStrRegen = Math.max(1, 1 + Math.floor(initStr / 3))

    // 重建 routeAnchorsTriggered：已触发过的锚点事件不再重复触发
    const routes = world.manifest.routes ?? []
    for (const route of routes) {
      for (const anchor of route.anchorEvents) {
        if (state.triggeredEvents.has(anchor.eventId)) {
          engine.routeAnchorsTriggered.add(`${route.id}:${anchor.eventId}`)
        }
      }
    }

    // 恢复种族寿命上限
    engine.effectiveMaxAge = state.effectiveMaxAge ?? world.manifest.maxAge
    engine.personalSigmoidMid = (state as any).personalSigmoidMid ?? 0.55

    // 重建 activeRoute：根据当前状态重新评估路线条件
    engine.updateRoute()

    return engine
  }

  constructor(world: WorldInstance, seed?: number) {
    this.world = world
    this.random = new RandomProvider(seed ?? (Date.now() * 1000 + Math.floor(Math.random() * 1000000)))
    this.dsl = new ConditionDSL()
    this.attrModule = new AttributeModule(world)
    this.talentModule = new TalentModule(world, this.random)
    this.itemModule = new ItemModule(world, this.dsl)
    this.eventModule = new EventModule(world, this.random, this.dsl, this.attrModule, this.itemModule)
    this.evaluatorModule = new EvaluatorModule(world, world.evaluations)
    this.achievementModule = new AchievementModule(world, this.dsl)
    this.diceModule = new DiceModule(this.random)
  }

  /** 初始化新游戏 */
  initGame(characterName: string, presetId?: string, race?: string, gender?: Gender): GameState {
    // 查找预设
    const preset = presetId ? this.world.presets.find(p => p.id === presetId) : undefined
    const attrs = this.attrModule.initAttributes()
    const peaks: Record<string, number> = {}

    // 应用预设属性加成
    if (preset?.attributes) {
      for (const [k, v] of Object.entries(preset.attributes)) {
        attrs[k] = (attrs[k] ?? 0) + v
      }
    }

    // 应用种族属性修正
    const raceDef = race ? this.world.races?.find(r => r.id === race) : undefined
    if (raceDef) {
      for (const mod of raceDef.attributeModifiers) {
        attrs[mod.attributeId] = (attrs[mod.attributeId] ?? 0) + mod.value
      }
      // 应用种族×性别属性修正
      if (gender && raceDef.genderModifiers) {
        const genderMod = raceDef.genderModifiers.find(g => g.gender === gender)
        if (genderMod?.attributeModifiers) {
          for (const mod of genderMod.attributeModifiers) {
            attrs[mod.attributeId] = (attrs[mod.attributeId] ?? 0) + mod.value
          }
        }
      }
    }

    for (const key of Object.keys(attrs)) {
      peaks[key] = attrs[key]
    }

    // 计算本局有效年龄上限：基于理论极限寿命(maxLifespan)，而非中位寿命(lifespanRange)
    // lifespanRange 用于显示和评分，effectiveMaxAge 用于 HP 衰减和事件系统
    // 这样 33 岁的人类不会被当成"老年人"，但大部分人仍会在 lifespanRange 内死亡
    if (raceDef?.maxLifespan) {
      // effectiveMaxAge 决定 HP 衰减曲线 + 事件缩放
      // 宽范围随机(50%-100%)：产生夭折、早亡、长寿的自然分布
      // lifespanRange 是中位区间，大部分人死在里面，但不是所有人
      const max = raceDef.maxLifespan
      this.effectiveMaxAge = Math.floor(max * 0.5 + this.random.next() * max * 0.5)
      // 个体衰减差异：sigmoid 中点 0.55 ± 0.15
      this.personalSigmoidMid = 0.55 + (this.random.next() - 0.5) * 0.3
    } else if (raceDef?.lifespanRange) {
      this.effectiveMaxAge = raceDef.lifespanRange[1]
    } else {
      this.effectiveMaxAge = this.world.manifest.maxAge
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
        gender,
        race,
      },
      attributes: attrs,
      attributeHistory: [this.attrModule.snapshot(attrs, 0)],
      attributePeaks: peaks,
      talents: {
        selected: [],
        draftPool: [],
        inherited: preset?.talents ?? [],
      },
      age: 0,
      hp: 0, // 会在下面重新计算
      maxHpBonus: 0,
      flags: new Set<string>(),
      counters: new Map<string, number>(),
      triggeredEvents: new Set<string>(),
      eventLog: [],
      achievements: {
        unlocked: [],
        progress: {},
      },
      inventory: { items: [], maxSlots: 3 },
      talentPenalty: 0,
      effectiveMaxAge: this.effectiveMaxAge,
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
      this.world.manifest.talentDraftCount,
      this.state.character.race,
      this.state.character.gender,
      this.state.meta.presetId
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
    // 预设天赋（inherited）自动加入已选
    const allSelected = [...this.state.talents.inherited, ...talentIds]
    const uniqueSelected = [...new Set(allSelected)]

    const { selected, conflicts } = this.talentModule.selectTalents(
      this.state.talents.draftPool,
      uniqueSelected,
      (this.world.manifest.talentSelectCount + this.state.talents.inherited.length)
    )

    if (conflicts.length > 0) {
      console.warn(`[天赋] 互斥冲突已自动解决: ${conflicts.join('; ')}`)
    }

    // 处理天赋效果：正值直接加到属性上，负值扣减可分配点数
    let penalty = 0
    const talentAttrs: Record<string, number> = {}
    for (const id of selected) {
      const def = this.world.index.talentsById.get(id)
      if (!def) continue
      for (const eff of def.effects) {
        if (eff.type === 'modify_attribute' && eff.value !== undefined) {
          if (eff.value < 0) {
            penalty += Math.abs(eff.value)
          } else {
            talentAttrs[eff.target] = (talentAttrs[eff.target] ?? 0) + eff.value
          }
        }
      }
    }

    // 应用天赋正值加成到属性
    let attrs = { ...this.state.attributes }
    for (const [attrId, bonus] of Object.entries(talentAttrs)) {
      attrs[attrId] = (attrs[attrId] ?? 0) + bonus
    }

    this.state = {
      ...this.state,
      attributes: attrs,
      talents: {
        ...this.state.talents,
        selected,
      },
      talentPenalty: penalty,
    }

    return this.getState()
  }

  /** 分配属性 */
  allocateAttributes(allocation: Record<string, number>): GameState {
    if (this.state.phase !== 'attribute-allocate') {
      throw new Error(`当前阶段 ${this.state.phase} 不允许分配属性`)
    }

    const effectivePoints = this.world.manifest.initialPoints - this.state.talentPenalty
    const { attributes, remaining } = this.attrModule.allocate(
      this.state.attributes,
      allocation,
      effectivePoints
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
    this.initialStrRegen = Math.max(1, 1 + Math.floor(initStr / 3))

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

  /** 根据属性计算初始 HP：25 + 体魄×3 */
  private computeInitHp(): number {
    const str = this.state.attributes['str'] ?? 0
    return Math.max(25, 25 + str * 3)
  }

  /** 每年恢复 HP：基于初始体魄（不随属性成长增长），软上限控制 + 连续年龄衰减
   *  所有衰老阈值基于 lifeRatio（age / effectiveMaxAge），适配不同种族寿命
   *  使用 sigmoid 平滑过渡 + 二次加速，确保角色在 lifespanRange 范围内自然死亡
   */
  private regenHp(): void {
    const initHp = this.computeInitHp()
    // 每年恢复量，上限为初始HP的12%（至少3），体魄只影响初始HP不影响恢复速度
    const regen = Math.min(this.initialStrRegen, Math.max(3, Math.floor(initHp * 0.12)))
    const age = this.state.age
    const maxAge = this.effectiveMaxAge
    const lifeRatio = age / maxAge

    // 软上限：巅峰期(lifeRatio≤0.35)为 ×1.1，之后逐步衰减
    // 到 lifeRatio=1.0 降至 ×0.7，最低 ×0.3
    const primeAge = maxAge * 0.35
    const declinePerYear = 0.4 / (maxAge * 0.65)
    const softCapMultiplier = Math.max(1.1 - Math.max(0, age - primeAge) * declinePerYear, 0.3)
    const softCap = Math.max(Math.floor(initHp * softCapMultiplier), 5)
    // 物品HP恢复加成
    const itemBonus = this.itemModule.getHpRegenBonus(this.state)
    // 物品HP软上限修正
    const capModifier = this.itemModule.getHpCapModifier(this.state)
    const modifiedCap = Math.max(softCap * (1 + capModifier) + (this.state.maxHpBonus ?? 0), 5)

    // 衰减分三段：sigmoid 平滑过渡 + 二次加速 + 超龄惩罚
    // 衰减比例基于中位寿命（lifespanRange中值），而非理论极限（effectiveMaxAge）
    // 这样人类在 40-50 岁（中位寿命 ~50）开始明显衰减，在 40-60 岁区间死亡
    const raceDef = this.world.races?.find((r: { id: string }) => r.id === this.state.character.race)
    const medianDeath = raceDef?.lifespanRange ? (raceDef.lifespanRange[0] + raceDef.lifespanRange[1]) / 2 : maxAge * 0.6
    const decayRatio = age / medianDeath

    // sigmoid 中点：基于中位寿命，个体差异在 initGame 时已随机确定
    const sigmoidMid = this.personalSigmoidMid
    const sigmoidK = 10
    const sigmoidValue = 1 / (1 + Math.exp(-sigmoidK * (decayRatio - sigmoidMid)))
    const sigmoidDecay = Math.floor(5 * sigmoidValue)

    // 二次加速: decayRatio>0.5 后加速
    let quadScaleBase = 3500 / medianDeath
    if (medianDeath < 45) {
      quadScaleBase *= 1.5
    }
    if (medianDeath >= 200) {
      quadScaleBase *= 0.8
    }
    const quadScale = Math.max(quadScaleBase, 10)
    const quadFactor = Math.max(0, decayRatio - 0.5) ** 2 * quadScale
    const quadDecay = Math.floor(quadFactor)

    let ageDecay = sigmoidDecay + quadDecay

    // 单年衰减上限：防止突然死亡，确保死亡过程渐进
    const maxDecayRatio = medianDeath < 50 ? 0.25 : medianDeath < 100 ? 0.20 : 0.15
    const maxYearlyDecay = Math.max(Math.floor(initHp * maxDecayRatio), 12)
    ageDecay = Math.min(ageDecay, maxYearlyDecay)

    // 童年前期无衰减（F-2-1）：10岁以下角色不因自然衰减死亡
    if (age < SimulationEngine.CHILDHOOD_DEATH_PROTECTION_AGE) {
      ageDecay = 0
    }

    // 超出预期寿命：严重惩罚，确保不永生
    if (lifeRatio > 1.0) {
      const overageRatio = lifeRatio - 1.0
      const overageDecay = Math.floor(overageRatio * 60)
      // overage 也受单年上限约束
      ageDecay = Math.min(ageDecay + overageDecay, maxYearlyDecay * 2)
    }

    const rawNewHp = Math.min(this.state.hp + regen - ageDecay + itemBonus, modifiedCap)
    // 单年 HP 净变化上限：固定 20，不与当前 HP 挂钩
    // 避免高 HP 角色单年损失过大
    const maxNetLoss = Math.max(Math.floor(initHp * maxDecayRatio), 12)
    const clampedNewHp = Math.max(rawNewHp, this.state.hp - maxNetLoss)
    // 长寿种族 HP 平台期下限：lifeRatio < 0.5 时 HP 不低于 initHp*30%
    // 防止长寿种族因随机事件叠加在生命前期暴毙
    let bufferedHp = clampedNewHp
    if (medianDeath >= 200 && decayRatio < 0.5 && clampedNewHp < initHp * 0.3 && clampedNewHp > 0) {
      bufferedHp = Math.max(clampedNewHp, Math.floor(initHp * 0.3))
    }
    // 条件恢复（C-2）：物品提供的 conditional_regen（HP<阈值时额外恢复）
    let finalHp = bufferedHp
    if (finalHp > 0 && finalHp < modifiedCap) {
      const conditionalBonus = this.itemModule.getConditionalRegen({
        ...this.state,
        hp: clampedNewHp,
      })
      if (conditionalBonus > 0) {
        finalHp = Math.min(clampedNewHp + conditionalBonus, modifiedCap)
      }
    }
    this.state = {
      ...this.state,
      hp: Math.max(0, finalHp),
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

    // 年龄 +1，重置年度 HP 损失追踪
    let newState = {
      ...this.state,
      age: this.state.age + 1,
      yearlyHpLoss: 0,
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
        if ((effect.type === 'modify_attribute' || effect.type === 'trigger_on_age') && effect.value !== undefined) {
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

    // 衰老提示（在所有返回路径中使用）
    const agingHint = this.getAgingHint()

    // 路线系统：检查路线切换（必须在 getCandidates 之前，确保入口 flag 对事件筛选可见）
    this.updateRoute()

    // 获取候选事件（此时 state 已包含路线入口 flag）
    const candidates = this.eventModule.getCandidates(this.state.age, this.state, this.activeRoute ? [this.activeRoute] : null)

    // 路线系统：检查强制锚点事件
    let mutableAnchorEvent = this.checkMandatoryAnchor()
    if (mutableAnchorEvent) {
      // 锚点事件强制触发，跳过正常选择
      this.pendingYearEvent = mutableAnchorEvent
      this.state = {
        ...this.state,
        triggeredEvents: new Set([...this.state.triggeredEvents, mutableAnchorEvent.id]),
      }
      if (mutableAnchorEvent.branches && mutableAnchorEvent.branches.length > 0) {
        return { phase: 'awaiting_choice', event: mutableAnchorEvent, branches: mutableAnchorEvent.branches, agingHint: agingHint || undefined }
      }
      // 无分支锚点直接执行
      const effectTexts = this.eventModule.applyEffectsOnState(mutableAnchorEvent.effects, this.state)
      const logEntry = { age: this.state.age, eventId: mutableAnchorEvent.id, title: mutableAnchorEvent.title, description: mutableAnchorEvent.description, effects: effectTexts }
      this.state = { ...this.state, eventLog: [...this.state.eventLog, logEntry] }
      this.pendingYearEvent = null
      this.postYearProcess()
      return { phase: 'showing_event', event: mutableAnchorEvent, effectTexts, logEntry, agingHint: agingHint || undefined }
    }

    // === Age 1 强制 birth 事件 ===
    if (this.state.age === 1 && candidates.length > 0) {
      const birthEvents = candidates.filter(e => e.id.startsWith('birth_'))
      if (birthEvents.length > 0) {
        let birthEvent = this.eventModule.pickEvent(birthEvents)
        if (birthEvent) {
        this.pendingYearEvent = birthEvent
        this.state = {
          ...this.state,
          triggeredEvents: new Set([...this.state.triggeredEvents, birthEvent.id]),
        }
        if (birthEvent.branches && birthEvent.branches.length > 0) {
          return { phase: 'awaiting_choice', event: birthEvent, branches: birthEvent.branches, agingHint: agingHint || undefined }
        }
        const effectTexts = this.eventModule.applyEffectsOnState(birthEvent.effects, this.state)
        const logEntry = { age: this.state.age, eventId: birthEvent.id, title: birthEvent.title, description: birthEvent.description, effects: effectTexts }
        this.state = { ...this.state, eventLog: [...this.state.eventLog, logEntry] }
        this.pendingYearEvent = null
        this.postYearProcess()
        return { phase: 'showing_event', event: birthEvent, effectTexts, logEntry, agingHint: agingHint || undefined }
        }
      }
    }

    if (candidates.length === 0) {
      // 平淡年：仍需执行年度后处理（死亡检查等）
      this.pendingYearEvent = null
      this.postYearProcess()
      return { phase: 'mundane_year', event: null, agingHint: agingHint || undefined }
    }

    // 动态权重选择：tag属性亲和力 + weightModifiers + minor降权
    const ctx = { state: this.state, world: this.world }
    const attrs = this.state.attributes
    const scored = candidates.map(e => {
      let w = e.weight

      // === Tag-Attribute Affinity ===
      // 事件tag与角色属性的匹配度，软性影响触发概率
      const tag = e.tag ?? ''
      if (tag === 'magic') {
        w *= this.tagAffinity(attrs, 'mag', 'spr')
      } else if (tag === 'combat') {
        w *= this.tagAffinity(attrs, 'str', 'luk')
      } else if (tag === 'social') {
        w *= this.tagAffinity(attrs, 'chr', 'mny')
      } else if (tag === 'exploration') {
        w *= this.tagAffinity(attrs, 'luk', 'spr')
      } else if (tag === 'epic') {
        // epic事件看灵魂（精神强度）
        w *= this.tagAffinity(attrs, 'spr', 'int')
      }
      // 'life' tag不加成（birth事件应均匀分布）

      // 显式 weightModifiers
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
      // 路线权重衰减：角色在同一路线家族中 tier 越高，低 tier 事件权重越低
      if (this.activeRoute && e.routes && e.routes.length > 0 && !e.routes.includes('*')) {
        const eventTier = this.activeRoute.tier ?? 0
        // 找事件匹配路线的 tier
        const routes = this.world.manifest.routes ?? []
        let eventRouteTier = 0
        for (const r of routes) {
          if (e.routes.includes(r.id)) {
            eventRouteTier = Math.max(eventRouteTier, r.tier ?? 0)
          }
        }
        if (this.activeRoute.tier != null && this.activeRoute.tier > eventRouteTier) {
          w *= Math.pow(0.5, this.activeRoute.tier - eventRouteTier)
        }
      }
      return { event: e, weight: w }
    })
    let event: WorldEventDef | null = this.random.weightedPick(scored, s => s.weight).event
    if (!event) {
      this.pendingYearEvent = null
      return { phase: 'mundane_year', event: null, agingHint: agingHint || undefined }
    }
    this.pendingYearEvent = event

    // 记录已触发
    this.state = {
      ...this.state,
      triggeredEvents: new Set([...this.state.triggeredEvents, event.id]),
    }

    if (event.branches && event.branches.length > 0) {
      return {
        phase: 'awaiting_choice',
        event,
        branches: event.branches,
        agingHint: agingHint || undefined,
      }
    }

    // 无分支的普通事件 → 应用效果，显示结果
    // 先处理物品获取（必须在 cloneState 之前，因为 grantItem 直接修改 this.state）
    const grantItemMessages: string[] = []
    for (const fx of event.effects) {
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

    const clonedState = cloneState(this.state)
    const effectTexts = this.eventModule.applyEffectsOnState(event.effects, clonedState)

    // 追加物品获取提示文本
    for (const msg of grantItemMessages) {
      effectTexts.push(msg)
    }

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
      agingHint: agingHint || undefined,
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

    // 引擎层强制校验分支前置条件（UI 层已锁定，此为安全兜底）
    if (branch.requireCondition) {
      const ctx = { state: this.state, world: this.world }
      const conditions = branch.requireCondition.split(',').map(c => c.trim())
      const allMet = conditions.every(c => this.dsl.evaluate(c, ctx))
      if (!allMet) {
        throw new Error(`分支 ${branchId} 的前置条件不满足: ${branch.requireCondition}`)
      }
    }

    // 资源消耗校验与扣除
    if (branch.cost) {
      const currentValue = this.state.attributes[branch.cost.attribute] ?? 0
      if (currentValue < branch.cost.amount) {
        throw new Error(`分支 ${branchId} 资源不足: ${branch.cost.attribute} 需要 ${branch.cost.amount}，当前 ${currentValue}`)
      }
      // 扣除资源
      const result = this.attrModule.modify(
        this.state.attributes,
        this.state.attributePeaks,
        [{ attribute: branch.cost.attribute, value: -branch.cost.amount }]
      )
      this.state = { ...this.state, attributes: result.attributes, attributePeaks: result.peaks }
    }

    let isSuccess: boolean | undefined
    let riskRolled = false
    let chosenEffects: EventEffect[]
    let resultText: string | undefined
    let diceCheckResult: DiceCheckResult | undefined

    // D20 骰判定（优先级高于旧版 riskCheck）
    if (branch.diceCheck) {
      riskRolled = true
      diceCheckResult = this.diceModule.resolve(branch.diceCheck, this.state)
      isSuccess = diceCheckResult.success

      if (isSuccess) {
        chosenEffects = [...event.effects, ...branch.effects]
        resultText = branch.successText
      } else {
        chosenEffects = [...event.effects, ...(branch.failureEffects ?? branch.effects)]
        resultText = branch.failureText
      }
    }
    // 旧版风险判定（向后兼容）
    else if (branch.riskCheck) {
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

    const clonedState = cloneState(this.state)
    const effectTexts = this.eventModule.applyEffectsOnState(chosenEffects, clonedState)

    // 追加物品获取提示文本
    for (const msg of grantItemMessages) {
      effectTexts.push(msg)
    }

    // 如果有风险判定结果文本，追加到效果文本
    if (resultText) {
      effectTexts.push(resultText)
    }

    // 记录日志（含分支详情，用于故事导出）
    const logEntry: import('./types').EventLogEntry = {
      age: this.state.age,
      eventId: event.id,
      title: event.title,
      description: event.description,
      effects: effectTexts,
      branchId,
      branchTitle: branch.title,
      branchDescription: branch.description,
      resultText,
      riskRolled,
      isSuccess,
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
      diceCheckResult,
    }
  }

  /** 根据生命周期阶段生成衰老提示文本 */
  private getAgingHint(): string {
    // 基于中位寿命（lifespanRange 中值）而非理论极限
    // 这样人类在 30-40 岁开始出现轻微衰老提示，50+ 岁出现明显衰老
    const raceDef = this.world.races?.find((r: { id: string }) => r.id === this.state.character.race)
    const medianDeath = raceDef?.lifespanRange ? (raceDef.lifespanRange[0] + raceDef.lifespanRange[1]) / 2 : this.effectiveMaxAge * 0.6
    const lifeProgress = this.state.age / medianDeath
    if (lifeProgress > 0.92) return '你已经油尽灯枯，每一次呼吸都弥足珍贵。'
    if (lifeProgress > 0.85) return '岁月不饶人，你感到生命在流逝。'
    if (lifeProgress > 0.78) return '你的身体越来越不听使唤，生病后恢复得很慢。'
    if (lifeProgress > 0.7) return '你开始感到力不从心，体力大不如前。'
    if (lifeProgress > 0.62) return '你发现爬楼梯都会微微气喘了。'
    if (lifeProgress > 0.55) return '鬓角多了几根白发，你假装没注意到。'
    if (lifeProgress > 0.45) return '你注意到自己恢复得不如从前快了。'
    if (lifeProgress > 0.38) return '你开始怀念年轻时的充沛精力。'
    return ''
  }

  /** 跳过平淡年 */
  skipYear(): YearResult {
    this.pendingYearEvent = null

    // 后处理（HP恢复已在 startYear 年初完成）
    this.postYearProcessCore()

    const agingHint = this.getAgingHint()

    return {
      phase: 'mundane_year',
      event: null,
      agingHint: agingHint || undefined,
      logEntry: {
        age: this.state.age,
        eventId: '__mundane__',
        title: '平静的一年',
        description: '什么特别的事都没发生，平平淡淡地度过了。' + (agingHint ? '\n' + agingHint : ''),
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

  /** 检查并写回本轮新解锁的成就 */
  private applyAchievements(state: GameState): GameState {
    const newAchievements = this.achievementModule.checkAchievements(state)
    if (newAchievements.length === 0) return state

    return {
      ...state,
      achievements: {
        unlocked: [...state.achievements.unlocked, ...newAchievements],
        progress: { ...state.achievements.progress },
      },
    }
  }

  /** 濒死判定：动态阈值 + 概率分层
   *  童年保护（F-2-2）：10岁以下不触发濒死随机死亡
   */
  private nearDeathCheck(state: GameState): GameState {
    if (state.hp <= 0 || state.age < SimulationEngine.CHILDHOOD_DEATH_PROTECTION_AGE) return state
    const nearDeathThreshold = Math.max(8, Math.floor(this.computeInitHp() * 0.15))
    if (state.hp > nearDeathThreshold) return state

    const roll = this.random.next()
    const halfThreshold = Math.floor(nearDeathThreshold * 0.5)
    let newState = state

    if (state.hp <= halfThreshold) {
      // 极度濒死：35% 死亡 / 20% 奇迹(+20) / 45% 标记
      if (roll < 0.35) {
        newState = { ...state, hp: 0 }
      } else if (roll < 0.55) {
        newState = { ...state, hp: state.hp + 20 }
        newState.flags = new Set([...newState.flags, 'miracle_survival'])
      } else {
        newState.flags = new Set([...newState.flags, 'near_death'])
      }
    } else {
      // 轻度濒死：10% 死亡 / 20% 奇迹(+15) / 15% 小幅恢复(+5) / 55% 标记
      if (roll < 0.10) {
        newState = { ...state, hp: 0 }
      } else if (roll < 0.30) {
        newState = { ...state, hp: state.hp + 15 }
        newState.flags = new Set([...newState.flags, 'miracle_survival'])
      } else if (roll < 0.45) {
        newState = { ...state, hp: state.hp + 5 }
      } else {
        newState.flags = new Set([...newState.flags, 'near_death'])
      }
    }
    return newState
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
        const newAttr = Math.floor(current + bonus)
        const newPeak = Math.max(peak, newAttr)
        newState = {
          ...newState,
          attributes: { ...newState.attributes, [attrId]: newAttr },
          attributePeaks: { ...newState.attributePeaks, [attrId]: newPeak },
        }
      }
    }

    // 检查成就
    newState = this.applyAchievements(newState)

    // 濒死判定：动态阈值 + 概率分层
    newState = this.nearDeathCheck(newState)

    // 免死效果检查
    if (newState.hp <= 0) {
      const deathSaveHp = this.itemModule.consumeDeathSave(newState)
      if (deathSaveHp > 0) {
        newState = { ...newState, hp: deathSaveHp }
      }
    }

    // 检查死亡（纯 HP 驱动，寿命通过 HP 自然衰减控制）
    const dead = newState.hp <= 0
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
          evaluations: result.evaluations,
        },
      }
      newState = this.applyAchievements(newState)
    }

    this.state = newState
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

    // 每帧都检查是否有更高优先级的路线可以进入
    // 即使已有 activeRoute（如 commoner），也应允许升级到职业路线
    let bestRoute: LifeRoute | null = null
    let fallbackRoute: LifeRoute | null = null

    for (const route of routes) {
      // 无 enterCondition 的路线作为 fallback 候选（如 commoner）
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

    // 决定目标路线：有条件匹配的用条件路线，否则用 fallback
    const targetRoute = bestRoute ?? fallbackRoute
    // 只在路线实际变更时更新（避免每帧重复设 flag）
    if (targetRoute && (!this.activeRoute || this.activeRoute.id !== targetRoute.id)) {
      this.activeRoute = targetRoute
      // 设置路线入场 flag
      if (targetRoute.entryFlags && targetRoute.entryFlags.length > 0) {
        const newFlags = new Set(this.state.flags)
        for (const f of targetRoute.entryFlags) newFlags.add(f)
        this.state = { ...this.state, flags: newFlags }
      }
    }
    // 无任何路线匹配时保持当前（不应发生，至少有 commoner fallback）
    if (!this.activeRoute && fallbackRoute) {
      this.activeRoute = fallbackRoute
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

  /** Tag-Attribute Affinity：根据属性计算tag匹配度乘数
   *  primaryAttr高 → 更可能触发对应tag的事件
   *  公式: 1 + (primary - 10) / 30, 范围约 0.67~2.0
   *  次要属性贡献20%权重
   */
  private tagAffinity(
    attrs: Record<string, number>,
    primaryAttr: string,
    secondaryAttr: string
  ): number {
    const primary = attrs[primaryAttr] ?? 0
    const secondary = attrs[secondaryAttr] ?? 0
    const primaryMul = 1 + (primary - 10) / 30
    const secondaryMul = 1 + (secondary - 10) / 30 * 0.2
    // 混合：80%主属性 + 20%次属性，基准1.0
    return 0.8 * primaryMul + 0.2 * secondaryMul
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

    // HP 恢复与衰减
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
        if ((effect.type === 'modify_attribute' || effect.type === 'trigger_on_age') && effect.value !== undefined) {
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
    const candidates = this.eventModule.getCandidates(newState.age, newState, this.activeRoute ? [this.activeRoute] : null)
    const event = this.eventModule.pickEvent(candidates, this.activeRoute ? [this.activeRoute] : null)

    if (event) {
      const branchId = branchChoices?.[event.id]
      const hpBeforeEvent = newState.hp
      newState = this.eventModule.resolveEvent(event, newState, branchId)
      // HP 保护已由 EventModule.modify_hp 内部统一处理，无需外层 clamp
    }

    // 濒死判定：动态阈值 + 概率分层
    newState = this.nearDeathCheck(newState)

    // 免死效果检查
    if (newState.hp <= 0) {
      const deathSaveHp = this.itemModule.consumeDeathSave(newState)
      if (deathSaveHp > 0) {
        newState = { ...newState, hp: deathSaveHp }
      }
    }

    // 检查死亡条件（纯 HP 驱动）
    const dead = newState.hp <= 0

    // 记录属性快照
    const snapshot = this.attrModule.snapshot(newState.attributes, newState.age)
    newState = {
      ...newState,
      attributeHistory: [...newState.attributeHistory, snapshot],
    }

    // 检查成就
    newState = this.applyAchievements(newState)

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
          evaluations: result.evaluations,
        },
      }
      newState = this.applyAchievements(newState)
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
        evaluations: result.evaluations,
      },
    }

    this.state = this.applyAchievements(this.state)

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
