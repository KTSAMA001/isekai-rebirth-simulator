/**
 * AchievementModule — 成就系统
 * 检查成就条件，记录解锁状态
 */

import type { WorldInstance, GameState } from '../core/types'
import type { ConditionDSL } from './ConditionDSL'

export class AchievementModule {
  private world: WorldInstance
  private dsl: ConditionDSL

  constructor(world: WorldInstance, dsl: ConditionDSL) {
    this.world = world
    this.dsl = dsl
  }

  /** 检查本局是否解锁新成就，返回新解锁的成就 ID */
  checkAchievements(state: GameState): string[] {
    const ctx = { state, world: this.world }
    const newlyUnlocked: string[] = []
    const playerRace = state.character.race
    const playerGender = state.character.gender

    for (const ach of this.world.achievements) {
      // 已解锁则跳过
      if (state.achievements.unlocked.includes(ach.id)) continue
      // 种族过滤：成就指定了种族列表时，玩家种族必须在其中
      if (ach.races && ach.races.length > 0 && playerRace) {
        if (!ach.races.includes(playerRace)) continue
      }
      // 性别过滤：成就指定了性别列表时，玩家性别必须在其中
      if (ach.genders && ach.genders.length > 0 && playerGender) {
        if (!ach.genders.includes(playerGender)) continue
      }
      // 检查条件
      if (this.dsl.evaluate(ach.condition, ctx)) {
        newlyUnlocked.push(ach.id)
      }
    }

    return newlyUnlocked
  }
}
