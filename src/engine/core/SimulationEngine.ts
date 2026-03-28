/**
 * SimulationEngine — 推演引擎（编排中心）
 * 管理一整局游戏的生命周期：
 * initGame → draftTalents → selectTalents → allocateAttributes → simulateYear × N → finish
 */

import type { GameState, WorldInstance } from './types'
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
      hp: 100,
      maxHp: 999,
      flags: new Set<string>(),
      triggeredEvents: new Set<string>(),
      eventLog: [],
      achievements: {
        unlocked: [],
        progress: {},
      },
      phase: 'talent-draft',
    }

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

    this.state = {
      ...this.state,
      attributes,
      attributePeaks: peaks,
      attributeHistory: [this.attrModule.snapshot(attributes, 0)],
      phase: 'simulating',
    }

    return this.getState()
  }

  /** 推演一年 */
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
