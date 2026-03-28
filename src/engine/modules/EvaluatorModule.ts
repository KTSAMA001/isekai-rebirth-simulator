/**
 * EvaluatorModule — 评分系统
 * 根据世界评分规则计算最终得分和评级
 */

import type { WorldInstance, GameState, EvaluationResult } from '../core/types'

export class EvaluatorModule {
  constructor(private world: WorldInstance) {}

  /** 计算最终得分 */
  calculate(state: GameState): EvaluationResult {
    // 计算属性峰值总和（排除隐藏属性）
    const visibleAttrs = this.world.attributes.filter(a => !a.hidden && a.group !== 'hidden')
    const totalAttributePeakSum = visibleAttrs.reduce(
      (sum, def) => sum + (state.attributePeaks[def.id] ?? 0),
      0
    )
    const lifespan = state.age

    // 计算分数：属性峰值总和 * 2 + 寿命 / 2
    const score = totalAttributePeakSum * 2 + lifespan / 2

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
