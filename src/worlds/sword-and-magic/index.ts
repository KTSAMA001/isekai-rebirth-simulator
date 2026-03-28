/**
 * 剑与魔法世界 — 注册入口
 */
import { createWorldInstance } from '../../engine/world/WorldInstance'
import { manifest } from './manifest'
import { attributes } from './attributes'
import { talents } from './talents'
import { events } from './events'
import { achievements } from './achievements'
import { presets } from './presets'
import { scoringRule } from './rules'

/** 创建剑与魔法世界实例 */
export function createSwordAndMagicWorld() {
  return createWorldInstance(
    manifest,
    attributes,
    talents,
    events,
    achievements,
    presets,
    scoringRule
  )
}
