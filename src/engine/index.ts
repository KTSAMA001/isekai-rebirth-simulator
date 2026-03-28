/**
 * 引擎模块统一导出
 */
export type { GameState, WorldInstance, WorldManifest, WorldAttributeDef, WorldTalentDef, WorldEventDef, WorldAchievementDef, WorldScoringRule, WorldPresetDef, TalentEffect, EventEffect, EventBranch, EventLogEntry, EvaluationResult, ConditionContext, GamePhase } from './core/types'
export { RandomProvider } from './core/RandomProvider'
export { SimulationEngine } from './core/SimulationEngine'
export { ConditionDSL } from './modules/ConditionDSL'
export { AttributeModule } from './modules/AttributeModule'
export { TalentModule } from './modules/TalentModule'
export { EventModule } from './modules/EventModule'
export { EvaluatorModule } from './modules/EvaluatorModule'
export { AchievementModule } from './modules/AchievementModule'
