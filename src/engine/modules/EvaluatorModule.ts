/**
 * EvaluatorModule — 评分系统 + 人生评价
 * 根据属性/事件/flag 匹配人生评价，最多返回 3 条
 */

import type { WorldInstance, GameState, EvaluationResult } from '../core/types'

export interface LifeEvaluation {
  id: string
  title: string
  description: string
  rarity: 'common' | 'rare' | 'legendary'
  priority: number
  condition?: string
}

export class EvaluatorModule {
  private world: WorldInstance
  private evaluations: LifeEvaluation[]

  constructor(world: WorldInstance, evaluations?: LifeEvaluation[]) {
    this.world = world
    this.evaluations = evaluations ?? []
  }

  /** 计算最终得分 + 匹配人生评价 */
  calculate(state: GameState): EvaluationResult & { evaluations: LifeEvaluation[] } {
    const scoreResult = this.calculateScore(state)
    const matchedEvals = this.matchEvaluations(state)
    return { ...scoreResult, evaluations: matchedEvals }
  }

  /** 纯分数计算 */
  private calculateScore(state: GameState): EvaluationResult {
    const visibleAttrs = this.world.attributes.filter(a => !a.hidden && a.group !== 'hidden')
    const totalAttributePeakSum = visibleAttrs.reduce(
      (sum, def) => sum + (state.attributePeaks[def.id] ?? 0),
      0
    )
    const lifespan = state.age

    const attrScore = totalAttributePeakSum * 1.2
    // 寿命得分：按种族归一化的寿命比例，压缩长寿种族优势
    const effectiveMaxAge = state.effectiveMaxAge ?? this.world.manifest.maxAge
    const lifespanRatio = Math.min(state.age / effectiveMaxAge, 1.2)
    const lifespanScore = lifespanRatio * 60
    const itemScore = state.inventory.items.length * 5
    // 路线加分：每激活一条路线 +20 分
    const routeFlags = ['on_adventurer_path', 'on_knight_path', 'on_mage_path', 'on_merchant_path', 'on_scholar_path']
    const routeBonus = routeFlags.reduce((bonus, flag) => bonus + (state.flags.has(flag) ? 20 : 0), 0)
    const score = attrScore + lifespanScore + itemScore + routeBonus

    const grade = this.world.scoringRule.grades.find(
      g => score >= g.minScore && (g.maxScore === null || score < g.maxScore)
    ) ?? this.world.scoringRule.grades[this.world.scoringRule.grades.length - 1]

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

  /** 匹配人生评价（最多 3 条，按 priority 降序） */
  private matchEvaluations(state: GameState): LifeEvaluation[] {
    const matched: LifeEvaluation[] = []

    for (const eva of this.evaluations) {
      if (!eva.condition || this.evalCondition(eva.condition, state)) {
        matched.push(eva)
      }
    }

    matched.sort((a, b) => b.priority - a.priority)
    return matched.slice(0, 3)
  }

  /**
   * 简化版条件求值，支持：
   *   attribute.xxx >= N / > N / <= N / == N
   *   has.flag.xxx
   *   !has.flag.xxx
   *   state.age >= N
   *   state.hp <= N
   *   state.eventLog.length >= N
   *   state.inventory.items.length >= N
   *   state.inventory.items.some(condition)  → 暂不支持嵌套，写简单版
   *   & (AND) | (OR) 用括号分组
   */
  private evalCondition(expr: string, state: GameState): boolean {
    // 处理 OR (|) 分割
    if (expr.includes('|')) {
      // 简单处理：按 | 分割，任一为 true 即可
      // 注意不要拆分括号内的 |
      const parts = this.splitLogical(expr, '|')
      return parts.some(p => this.evalCondition(p.trim(), state))
    }

    // 处理 AND (&) 分割
    if (expr.includes('&')) {
      const parts = this.splitLogical(expr, '&')
      return parts.every(p => this.evalCondition(p.trim(), state))
    }

    const trimmed = expr.trim()

    // NOT
    if (trimmed.startsWith('!')) {
      return !this.evalCondition(trimmed.substring(1).trim(), state)
    }

    // has.flag.xxx
    if (trimmed.startsWith('has.flag.')) {
      return state.flags.has(trimmed.substring('has.flag.'.length))
    }

    // attribute.xxx >= N
    const attrMatch = trimmed.match(/^attribute\.(\w+)\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (attrMatch) {
      const attrId = attrMatch[1]
      const op = attrMatch[2]
      const val = Number(attrMatch[3])
      const peak = state.attributePeaks[attrId] ?? 0
      return this.compare(peak, op, val)
    }

    // state.age
    const ageMatch = trimmed.match(/^state\.age\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (ageMatch) return this.compare(state.age, ageMatch[1], Number(ageMatch[2]))

    // state.hp
    const hpMatch = trimmed.match(/^state\.hp\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (hpMatch) return this.compare(state.hp, hpMatch[1], Number(hpMatch[2]))

    // state.eventLog.length
    const logMatch = trimmed.match(/^state\.eventLog\.length\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (logMatch) return this.compare(state.eventLog.length, logMatch[1], Number(logMatch[2]))

    // state.inventory.items.length
    const invMatch = trimmed.match(/^state\.inventory\.items\.length\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (invMatch) return this.compare(state.inventory.items.length, invMatch[1], Number(invMatch[2]))

    // state.birth == 'xxx'
    const birthMatch = trimmed.match(/^state\.birth\s*==\s*['"](\w+)['"]$/)
    if (birthMatch) {
      // Check if birth preset matches (look at meta)
      return state.meta.presetId === birthMatch[1]
    }

    // state.lifespan >= N (same as state.age at end of game)
    const lifeMatch = trimmed.match(/^state\.lifespan\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (lifeMatch) return this.compare(state.age, lifeMatch[1], Number(lifeMatch[2]))

    // state.inventory.items.some(i => i.prop op value)
    // state.inventory.items.every(i => i.prop op value)
    const arrayMethodMatch = trimmed.match(
      /^state\.inventory\.items\.(some|every)\(\s*(\w+)\s*=>\s*(.+)\)$/
    )
    if (arrayMethodMatch) {
      const method = arrayMethodMatch[1] as 'some' | 'every'
      const body = arrayMethodMatch[3].trim()
      // 解析 lambda body: param.prop op value
      const bodyMatch = body.match(/^\w+\.(\w+)\s*(==|!=|>=|<=|>|<)\s*['"]?(\w+)['"]?$/)
      if (bodyMatch) {
        const propName = bodyMatch[1]
        const op = bodyMatch[2]
        const targetValue = bodyMatch[3]
        const itemsById = this.world.index.itemsById
        const test = (slot: typeof state.inventory.items[number]) => {
          const itemDef = itemsById.get(slot.itemId)
          if (!itemDef) return false
          const actual = (itemDef as unknown as Record<string, unknown>)[propName]
          if (typeof actual === 'number') {
            return this.compare(actual, op, Number(targetValue))
          }
          // 字符串属性比较
          if (op === '==') return String(actual) === targetValue
          if (op === '!=') return String(actual) !== targetValue
          return false
        }
        return method === 'some'
          ? state.inventory.items.some(test)
          : state.inventory.items.every(test)
      }
    }

    // Unknown condition → default false
    console.warn(`[Evaluator] Unknown condition: ${trimmed}`)
    return false
  }

  private compare(a: number, op: string, b: number): boolean {
    switch (op) {
      case '>=': return a >= b
      case '>': return a > b
      case '<=': return a <= b
      case '<': return a < b
      case '==': return a === b
      default: return false
    }
  }

  /** 按逻辑运算符分割，但不拆分括号内的内容 */
  private splitLogical(expr: string, op: string): string[] {
    const parts: string[] = []
    let depth = 0
    let current = ''
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') depth++
      else if (expr[i] === ')') depth--
      if (depth === 0 && expr.substring(i, i + op.length) === op) {
        parts.push(current)
        current = ''
        i += op.length - 1
      } else {
        current += expr[i]
      }
    }
    if (current.trim()) parts.push(current)
    return parts
  }
}
