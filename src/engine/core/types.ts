/**
 * 异世界重生模拟器 — 核心类型定义
 * 所有引擎模块共享的接口和类型
 */

// ==================== 世界包数据格式 ====================

/** 属性定义 */
export interface WorldAttributeDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  min: number
  max: number
  defaultValue: number
  hidden?: boolean
  group?: string
}

/** 天赋稀有度 */
export type TalentRarity = 'common' | 'rare' | 'legendary'

/** 天赋效果 */
export interface TalentEffect {
  type: 'modify_attribute' | 'add_event' | 'trigger_on_age' | 'multiply_attribute'
  target: string
  value?: number
  age?: number
  condition?: string
  probability?: number
  description: string
}

/** 天赋定义 */
export interface WorldTalentDef {
  id: string
  name: string
  description: string
  rarity: TalentRarity
  icon: string
  effects: TalentEffect[]
  conditions?: string
  mutuallyExclusive?: string[]
  replaceTalent?: string
  inheritable?: boolean
  flavorText?: string
  /** 抽取权重，默认按稀有度：common=100, rare=10, legendary=1 */
  draftWeight?: number
}

/** 事件效果 */
export interface EventEffect {
  type: 'modify_attribute' | 'set_attribute' | 'add_talent' | 'trigger_event' | 'set_flag' | 'modify_hp' | 'set_counter' | 'modify_counter'
  target: string
  value: number
  probability?: number
  condition?: string
  description?: string
}

/** 风险判定配置 */
export interface RiskCheck {
  /** 判定依据的属性ID（如 str, mag, chr） */
  attribute: string
  /** 难度值：属性达到此值时成功率约 50% */
  difficulty: number
  /**
   * 曲线陡度（默认 3）
   * 越大 → 曲线越陡，接近开关判定
   * 越小 → 曲线越平缓，属性差距影响更线性
   */
  scale?: number
}

/** 事件分支 */
export interface EventBranch {
  id: string
  title: string
  description: string
  probability?: number
  effects: EventEffect[]
  nextEvents?: string[]
  /** 选择此分支的前置条件 */
  requireCondition?: string
  /** 风险判定（可选，有风险的选择才需要） */
  riskCheck?: RiskCheck
  /** 失败时的效果（如果 riskCheck 存在且判定失败时使用，否则使用 effects） */
  failureEffects?: EventEffect[]
  /** 成功时的描述文字 */
  successText?: string
  /** 失败时的描述文字 */
  failureText?: string
}

/** 事件优先级 */
export type EventPriority = 'critical' | 'major' | 'minor'

/** 事件定义 */
export interface WorldEventDef {
  id: string
  title: string
  description: string
  minAge: number
  maxAge: number
  weight: number
  include?: string
  exclude?: string
  effects: EventEffect[]
  branches?: EventBranch[]
  isBad?: boolean
  tag?: string
  unique?: boolean
  /** 事件优先级：critical=有分支必须选 / major=需确认 / minor=可自动跳过 */
  priority?: EventPriority
  /** 前置条件：全部满足才进入候选池 */
  prerequisites?: string[]
  /** 互斥条件：满足任一则排除 */
  mutuallyExclusive?: string[]
  /** 动态权重修饰符 */
  weightModifiers?: Array<{
    condition: string
    weightMultiplier: number
  }>
}

/** 成就定义 */
export interface WorldAchievementDef {
  id: string
  name: string
  description: string
  icon: string
  hidden: boolean
  condition: string
  category: string
  reward?: string
}

/** 评分分段 */
export interface ScoreGrade {
  minScore: number
  maxScore: number
  grade: string
  title: string
  description: string
}

/** 评分规则 */
export interface WorldScoringRule {
  grades: ScoreGrade[]
}

/** 角色预设 */
export interface WorldPresetDef {
  id: string
  name: string
  title: string
  description: string
  attributes: Record<string, number>
  talents?: string[]
  locked: boolean
  unlockCondition?: string
}

/** 世界包清单 */
export interface WorldManifest {
  id: string
  name: string
  subtitle: string
  description: string
  version: string
  author: string
  icon: string
  banner: string
  theme: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  tags: string[]
  maxAge: number
  initialPoints: number
  talentDraftCount: number
  talentSelectCount: number
  files: {
    attributes: string
    talents: string
    events: string
    achievements: string
    presets: string
    rules: string
  }
  routes?: LifeRoute[]
}

// ==================== 运行时实例 ====================

/** 已加载世界的运行时表示 */
export interface WorldInstance {
  manifest: WorldManifest
  attributes: WorldAttributeDef[]
  talents: WorldTalentDef[]
  events: WorldEventDef[]
  achievements: WorldAchievementDef[]
  presets: WorldPresetDef[]
  scoringRule: WorldScoringRule
  /** 索引映射，加速查找 */
  index: {
    attributesById: Map<string, WorldAttributeDef>
    talentsById: Map<string, WorldTalentDef>
    eventsById: Map<string, WorldEventDef>
  }
}

// ==================== 游戏状态 ====================

/** 事件日志条目 */
export interface EventLogEntry {
  age: number
  eventId: string
  title: string
  description: string
  effects: string[]
  branchId?: string
}

/** 属性快照 */
export interface AttributeSnapshot {
  age: number
  values: Record<string, number>
}

/** 游戏阶段 */
export type GamePhase = 'init' | 'talent-draft' | 'attribute-allocate' | 'simulating' | 'finished'

/** 游戏结算结果 */
export interface GameResult {
  score: number
  grade: string
  gradeTitle: string
  gradeDescription: string
  lifespan: number
}

/** 游戏状态 */
export interface GameState {
  meta: {
    worldId: string
    seed: number
    playId: string
    startedAt: number
    presetId?: string
  }
  character: {
    name: string
    gender?: string
  }
  attributes: Record<string, number>
  attributeHistory: AttributeSnapshot[]
  attributePeaks: Record<string, number>
  talents: {
    selected: string[]
    draftPool: string[]
    inherited: string[]
  }
  age: number
  hp: number
  flags: Set<string>
  counters: Map<string, number>
  triggeredEvents: Set<string>
  eventLog: EventLogEntry[]
  achievements: {
    unlocked: string[]
    progress: Record<string, number>
  }
  phase: GamePhase
  result?: GameResult
  /** 当前年份需要玩家选择的事件分支 */
  pendingBranch?: {
    eventId: string
    eventTitle: string
    eventDescription: string
    branches: EventBranch[]
  }
}

// ==================== 条件 DSL ====================

/** 比较操作符 */
export type CompareOp = '==' | '!=' | '>=' | '<=' | '>' | '<'

/** 条件 AST 节点 */
export type ConditionAST =
  | { type: 'comparison'; attr: string; op: CompareOp; value: number | string }
  | { type: 'and'; children: ConditionAST[] }
  | { type: 'or'; children: ConditionAST[] }
  | { type: 'has'; kind: string; id: string }
  | { type: 'flag'; name: string }
  | { type: 'literal'; value: boolean }

/** 条件求值上下文 */
export interface ConditionContext {
  state: GameState
  world: WorldInstance
}

// ==================== 年度推演结果 ====================

/** 年度阶段（用于 galgame 化逐年交互） */
export type YearPhase = 'awaiting_choice' | 'showing_event' | 'mundane_year'

/** 年度推演结果 */
export interface YearResult {
  /** 当年阶段 */
  phase: YearPhase
  /** 触发的事件（无事件时为 null） */
  event: WorldEventDef | null
  /** 可选分支（仅 phase=awaiting_choice 时有值） */
  branches?: EventBranch[]
  /** 事件效果描述文本 */
  effectTexts?: string[]
  /** 当年日志条目 */
  logEntry?: EventLogEntry
  /** 风险判定的结果（仅 riskCheck 时有值） */
  isSuccess?: boolean
  /** 是否进行了风险判定 */
  riskRolled?: boolean
}

// ==================== 生命周期路线 ====================

/** 路线锚点事件 */
export interface RouteAnchor {
  eventId: string
  minAge: number
  maxAge: number
  mandatory: boolean
}

/** 生命周期路线定义 */
export interface LifeRoute {
  id: string
  name: string
  description: string
  enterCondition?: string
  exitCondition?: string
  priority: number
  anchorEvents: RouteAnchor[]
  entryFlags?: string[]
  exclusiveEvents?: string[]
}

// ==================== 评分结果 ====================

/** 评分详情 */
export interface EvaluationResult {
  score: number
  grade: string
  gradeTitle: string
  gradeDescription: string
  details: {
    totalAttributePeakSum: number
    lifespan: number
    breakdown: { category: string; value: number }[]
  }
}
