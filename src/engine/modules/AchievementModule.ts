/**
 * AchievementModule — 成就系统
 * 检查成就条件，记录解锁状态
 */

import type { WorldInstance, GameState } from '../core/types'
import type { ConditionDSL } from './ConditionDSL'

export class AchievementModule {
  constructor(
    private world: WorldInstance,
    private dsl: ConditionDSL
  ) {}

  /** 检查本局是否解锁新成就，返回新解锁的成就 ID */
  checkAchievements(state: GameState): string[] {
    const ctx = { state, world: this.world }
    const newlyUnlocked: string[] = []

    for (const ach of this.world.achievements) {
      // 已解锁则跳过
      if (state.achievements.unlocked.includes(ach.id)) continue
      // 检查条件
      if (this.dsl.evaluate(ach.condition, ctx)) {
        newlyUnlocked.push(ach.id)
      }
    }

    return newlyUnlocked
  }
}
