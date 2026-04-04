/**
 * DiceModule — D20 骰判定系统
 * 参考博德之门3的 Ability Check 机制：
 * - 掷 D20 + 属性修正值 >= DC 则成功
 * - Natural 20 = 大成功（必定成功）
 * - Natural 1 = 大失败（必定失败）
 * - 优势/劣势：掷两次取高/低
 *
 * 属性修正值计算：floor(属性值 / 3)
 * （属性范围 0-20 对应修正 0~+6，比 DND 的 10 基准制更适合本游戏的 0-20 分配制）
 */

import type { DiceCheck, DiceCheckResult, GameState } from '../core/types'
import type { RandomProvider } from '../core/RandomProvider'

export class DiceModule {
  private random: RandomProvider

  constructor(random: RandomProvider) {
    this.random = random
  }

  /**
   * 计算属性修正值
   * 本游戏属性范围 0-20（初始分配），后续可通过事件成长
   * 修正值 = floor(属性值 / 3)
   * 0→+0, 3→+1, 6→+2, 9→+3, 12→+4, 15→+5, 18→+6, 20→+6
   */
  getModifier(attributeValue: number): number {
    return Math.floor(attributeValue / 3)
  }

  /**
   * 掷 D20（1-20）
   */
  rollD20(): number {
    return Math.floor(this.random.next() * 20) + 1
  }

  /**
   * 执行一次 D20 骰判定
   * @param check - 判定配置
   * @param state - 当前游戏状态
   * @returns 判定结果
   */
  resolve(check: DiceCheck, state: GameState): DiceCheckResult {
    const attributeValue = state.attributes[check.attribute] ?? 0
    const modifier = this.getModifier(attributeValue)

    let roll: number

    if (check.advantage && !check.disadvantage) {
      // 优势：掷两次取高
      const roll1 = this.rollD20()
      const roll2 = this.rollD20()
      roll = Math.max(roll1, roll2)
    } else if (check.disadvantage && !check.advantage) {
      // 劣势：掷两次取低
      const roll1 = this.rollD20()
      const roll2 = this.rollD20()
      roll = Math.min(roll1, roll2)
    } else {
      // 正常或优势劣势抵消
      roll = this.rollD20()
    }

    const criticalSuccess = roll === 20
    const criticalFailure = roll === 1

    const total = roll + modifier

    // Natural 20 必定成功，Natural 1 必定失败
    let success: boolean
    if (criticalSuccess) {
      success = true
    } else if (criticalFailure) {
      success = false
    } else {
      success = total >= check.dc
    }

    return {
      success,
      roll,
      modifier,
      total,
      dc: check.dc,
      criticalSuccess,
      criticalFailure,
    }
  }
}
