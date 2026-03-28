/**
 * WorldInstance 工厂 — 构建运行时世界实例
 * 从原始数据创建带索引的 WorldInstance
 */

import type {
  WorldInstance as IWorldInstance,
  WorldManifest,
  WorldAttributeDef,
  WorldTalentDef,
  WorldEventDef,
  WorldAchievementDef,
  WorldPresetDef,
  WorldScoringRule,
} from '../core/types'

/** 构建世界实例 */
export function createWorldInstance(
  manifest: WorldManifest,
  attributes: WorldAttributeDef[],
  talents: WorldTalentDef[],
  events: WorldEventDef[],
  achievements: WorldAchievementDef[],
  presets: WorldPresetDef[],
  scoringRule: WorldScoringRule
): IWorldInstance {
  // 构建索引
  const attributesById = new Map<string, WorldAttributeDef>()
  for (const attr of attributes) {
    attributesById.set(attr.id, attr)
  }

  const talentsById = new Map<string, WorldTalentDef>()
  for (const talent of talents) {
    talentsById.set(talent.id, talent)
  }

  const eventsById = new Map<string, WorldEventDef>()
  for (const event of events) {
    eventsById.set(event.id, event)
  }

  return {
    manifest,
    attributes,
    talents,
    events,
    achievements,
    presets,
    scoringRule,
    index: {
      attributesById,
      talentsById,
      eventsById,
    },
  }
}
