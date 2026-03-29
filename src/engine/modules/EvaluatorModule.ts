/**
 * EvaluatorModule — 评分系统
 * 根据世界评分规则计算最终得分和评级
 */

import type { WorldInstance, GameState, EvaluationResult } from '../core/types'

export class EvaluatorModule {
  private world: WorldInstance

  constructor(world: WorldInstance) {
    this.world = world
  }

  /** 计算最终得分 */
  calculate(state: GameState): EvaluationResult {
    // 计算属性峰值总和（排除隐藏属性）
    const visibleAttrs = this.world.attributes.filter(a => !a.hidden && a.group !== 'hidden')
    const totalAttributePeakSum = visibleAttrs.reduce(
      (sum, def) => sum + (state.attributePeaks[def.id] ?? 0),
      0
    )
    const lifespan = state.age

    // 计算分数：属性峰值加权 + 寿命奖励 + 物品奖励 + 路线奖励
    // 20局统计：peakSum 22-104 median 59, lifespan 4-80 median 41
    const attrScore = totalAttributePeakSum * 0.8
    const lifespanScore = lifespan * 0.5
    const itemScore = state.inventory.items.length * 3
    const itemCount = state.inventory.items.length
    // 路线奖励：基于已触发的锚点数量加分
    let routeBonus = 0
    const score = attrScore + lifespanScore + itemScore + routeBonus

    // 确定评级
    const grade = this.world.scoringRule.grades.find(
      g => score >= g.minScore && score < g.maxScore
    ) ?? this.world.scoringRule.grades[this.world.scoringRule.grades.length - 1]

    // 分类统计
    const breakdown: { category: string; value: number }[] = []
    const groups = new Map<string, number>()
    for (const def of visibleAttrs) {
      const group = def.group ?? 'other'
      groups.set(group, (groups.get(group) ?? 0) + (state.attributePeaks[def.id] ?? 0))
    }
    for (const [category, value] of groups) {
      breakdown.push({ category, value })
    }

    return {
      score: Math.round(score * 10) / 10,
      grade: grade.grade,
      gradeTitle: grade.title,
      gradeDescription: grade.description,
      details: {
        totalAttributePeakSum,
        lifespan,
        breakdown,
      },
    }
  }
}
