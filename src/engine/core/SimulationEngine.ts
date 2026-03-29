/**
 * SimulationEngine — 推演引擎（编排中心）
 * 管理一整局游戏的生命周期：
 * initGame → draftTalents → selectTalents → allocateAttributes → simulateYear × N → finish
 */

import type { EventEffect, GameState, WorldInstance, YearResult } from './types'
import { RandomProvider } from './RandomProvider'
import { AttributeModule } from '../modules/AttributeModule'
import { TalentModule } from '../modules/TalentModule'
import { EventModule } from '../modules/EventModule'
import { ConditionDSL } from '../modules/ConditionDSL'
import { EvaluatorModule } from '../modules/EvaluatorModule'
import { AchievementModule } from '../modules/AchievementModule'

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
  private dsl: ConditionDSL

  constructor(world: WorldInstance, seed?: number) {
    this.world = world
    this.random = new RandomProvider(seed ?? Date.now())
    this.dsl = new ConditionDSL()
    this.attrModule = new AttributeModule(world)
    this.talentModule = new TalentModule(world, this.random)
    this.eventModule = new EventModule(world, this.random, this.dsl, this.attrModule)
    this.evaluatorModule = new EvaluatorModule(world)
    this.achievementModule = new AchievementModule(world, this.dsl)
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
      maxHpBonus: 0,
      hp: 0, // 会在下面重新计算
      maxHp: 0,
      flags: new Set<string>(),
      triggeredEvents: new Set<string>(),
      eventLog: [],
      achievements: {
        unlocked: [],
        progress: {},
      },
      phase: 'talent-draft',
    }

    // 根据初始属性计算 maxHp 和 hp
    this.state.maxHp = this.computeMaxHp()
    this.state.hp = this.state.maxHp

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
      throw new Error(`天赋冲突: ${conflicts.join(', ')}`)
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

    // 计算动态 HP 上限并初始化 HP
    this.state.maxHp = this.computeMaxHp()
    this.state.hp = this.state.maxHp

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

  /** 根据属性动态计算 HP 上限：50 + 体魄*10 + 灵魂*5 + maxHpBonus */
  private computeMaxHp(): number {
    const str = this.state.attributes['str'] ?? 0
    const spr = this.state.attributes['spr'] ?? 0
    return 50 + str * 10 + spr * 5 + this.state.maxHpBonus
  }

  /** 重新计算 maxHp，夹紧 hp，并恢复部分 HP */
  private recalcMaxHpAndRegen(): void {
    const newMaxHp = this.computeMaxHp()
    // 每年恢复：取 max(str*2, 5) 和 maxHp*10% 中较大者
    const regen = Math.max(
      Math.max((this.state.attributes['str'] ?? 0) * 2, 5),
      Math.floor(newMaxHp * 0.1)
    )
    const newHp = Math.min(
      newMaxHp,
      this.state.hp + regen
    )
    this.state = {
      ...this.state,
      maxHp: newMaxHp,
      hp: Math.max(0, newHp),
    }
  }

  /** 缓存：startYear 产生的待处理事件 */
  private pendingYearEvent: import('./types').WorldEventDef | null = null

  /** 开始一年：年龄+1，获取事件，返回年度结果 */
  startYear(): YearResult {
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
        }
      }
    }

    this.state = newState

    // 获取候选事件
    const candidates = this.eventModule.getCandidates(this.state.age, this.state)

    if (candidates.length === 0) {
      // 平淡年
      this.pendingYearEvent = null
      return { phase: 'mundane_year', event: null }
    }

    // 按优先级排序，优先选 critical/major
    const sorted = [...candidates].sort((a, b) => {
      const priorityOrder = { critical: 0, major: 1, minor: 2 }
      const pa = priorityOrder[a.priority ?? 'minor']
      const pb = priorityOrder[b.priority ?? 'minor']
      return pa - pb
    })

    // 取最高优先级的事件
    const event = sorted[0]
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

    const clonedState = this.cloneState(this.state)
    const effectTexts = this.eventModule.applyEffectsOnState(chosenEffects, clonedState)

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

    // 后处理
    this.postYearProcess()

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

    // 后处理
    this.postYearProcess()

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

  /** 年度后处理：HP重算/恢复、快照、成就、死亡检查 */
  private postYearProcess(): void {
    // 重新计算 maxHp 并恢复部分 HP
    this.recalcMaxHpAndRegen()

    // 记录属性快照
    const snapshot = this.attrModule.snapshot(this.state.attributes, this.state.age)
    let newState = {
      ...this.state,
      attributeHistory: [...this.state.attributeHistory, snapshot],
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
      triggeredEvents: new Set(state.triggeredEvents),
      eventLog: [...state.eventLog],
      achievements: {
        unlocked: [...state.achievements.unlocked],
        progress: { ...state.achievements.progress },
      },
      attributeHistory: [...state.attributeHistory],
    }
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
