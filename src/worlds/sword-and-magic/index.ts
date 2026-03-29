/**
 * 剑与魔法世界 — 注册入口
 */
import { createWorldInstance } from '../../engine/world/WorldInstance'
import { loadWorldData } from './data-loader'

/** 创建剑与魔法世界实例 */
export function createSwordAndMagicWorld() {
  const { manifest, attributes, talents, events, achievements, items, presets, scoringRule } = loadWorldData()
  return createWorldInstance(
    manifest,
    attributes,
    talents,
    events,
    achievements,
    items,
    presets,
    scoringRule
  )
}
