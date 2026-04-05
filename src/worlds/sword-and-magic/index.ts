/**
 * 剑与魔法世界 — 注册入口
 */
import { createWorldInstance } from '../../engine/world/WorldInstance'
import { loadWorldData } from './data-loader'

/** 创建剑与魔法世界实例 */
export async function createSwordAndMagicWorld() {
  const data = await loadWorldData()
  const world = createWorldInstance(
    data.manifest,
    data.attributes,
    data.talents,
    data.events,
    data.achievements,
    data.items,
    data.presets,
    data.scoringRule,
    data.races
  )
  world.evaluations = data.evaluations
  return world
}
