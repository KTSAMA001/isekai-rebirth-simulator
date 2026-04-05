/**
 * ConditionDSL — 条件 DSL 递归下降解析器 & 求值器
 *
 * 语法：
 *   expression := or_expr
 *   or_expr    := and_expr ( '|' and_expr )*
 *   and_expr   := atom ( '&' atom )*
 *   atom       := '(' expression ')' | comparison
 *   comparison := identifier op value
 *   identifier := 'attribute.id' | 'age' | 'has.talent.id' | 'flag.name' |
 *                 'event.count.id' | 'achievement.count' | 'lifespan' |
 *                 'result.score' | 'result.grade' | 'result.lifespan'
 *   op         := '==' | '!=' | '>=' | '<=' | '>' | '<'
 *   value      := number | string
 */

import type { ConditionAST, CompareOp, ConditionContext } from '../core/types'

export class ConditionDSL {
  /** 在上下文中求值条件字符串 */
  evaluate(expr: string, ctx: ConditionContext): boolean {
    if (!expr || expr.trim() === '') return true
    const ast = this.parse(expr.trim())
    return this.evalNode(ast, ctx)
  }

  /** 解析条件字符串为 AST */
  parse(expr: string): ConditionAST {
    const parser = new DSLParser(expr)
    return parser.parseExpression()
  }

  /** 求值 AST 节点 */
  private evalNode(node: ConditionAST, ctx: ConditionContext): boolean {
    switch (node.type) {
      case 'literal':
        return node.value
      case 'and':
        return node.children.every(c => this.evalNode(c, ctx))
      case 'or':
        return node.children.some(c => this.evalNode(c, ctx))
      case 'has':
        return this.evalHas(node.kind, node.id, ctx)
      case 'flag':
        return ctx.state.flags.has(node.name)
      case 'comparison':
        return this.evalComparison(node.attr, node.op, node.value, ctx)
      default:
        return false
    }
  }

  private evalHas(kind: string, id: string, ctx: ConditionContext): boolean {
    switch (kind) {
      case 'talent':
        return ctx.state.talents.selected.includes(id)
      case 'event':
        return ctx.state.triggeredEvents.has(id)
      case 'achievement':
        return ctx.state.achievements.unlocked.includes(id)
      case 'flag':
        return ctx.state.flags.has(id)
      case 'counter':
        return (ctx.state.counters.get(id) ?? 0) > 0
      default:
        return false
    }
  }

  private evalComparison(attr: string, op: CompareOp, value: number | string, ctx: ConditionContext): boolean {
    const actual = this.resolveValue(attr, ctx)
    if (typeof actual === 'number' && typeof value === 'number') {
      return this.compareNumbers(actual, op, value)
    }
    return this.compareValues(actual, op, value)
  }

  private resolveValue(attr: string, ctx: ConditionContext): number | string {
    // attribute.id — 当前属性值
    if (attr.startsWith('attribute.')) {
      const field = attr.substring('attribute.'.length)
      // attribute.peak.id — 属性峰值
      if (field.startsWith('peak.')) {
        const peakId = field.substring('peak.'.length)
        return ctx.state.attributePeaks[peakId] ?? 0
      }
      return ctx.state.attributes[field] ?? 0
    }
    // age
    if (attr === 'age') return ctx.state.age
    // lifespan / result.lifespan — 实际活到的岁数；仅结算后可用
    if (attr === 'lifespan' || attr === 'result.lifespan') {
      return ctx.state.result?.lifespan ?? Number.NaN
    }
    // result.score / result.grade — 仅在结算后存在
    if (attr === 'result.score') return ctx.state.result?.score ?? Number.NaN
    if (attr === 'result.grade') return ctx.state.result?.grade ?? ''
    // event.count.id
    if (attr.startsWith('event.count.')) {
      const eventId = attr.substring('event.count.'.length)
      return ctx.state.eventLog.filter(e => e.eventId === eventId).length
    }
    // achievement.count
    if (attr === 'achievement.count') {
      return ctx.state.achievements.unlocked.length
    }
    // hp
    if (attr === 'hp') return ctx.state.hp
    // character.race / character.gender — 角色种族和性别
    if (attr === 'character.race') return ctx.state.character.race ?? ''
    if (attr === 'character.gender') return ctx.state.character.gender ?? ''
    // counter.id — 计数器值
    if (attr.startsWith('counter.')) {
      const counterId = attr.substring('counter.'.length)
      return ctx.state.counters.get(counterId) ?? 0
    }
    return 0
  }

  private compareNumbers(a: number, op: CompareOp, b: number): boolean {
    if (Number.isNaN(a) || Number.isNaN(b)) return false
    switch (op) {
      case '==': return a === b
      case '!=': return a !== b
      case '>=': return a >= b
      case '<=': return a <= b
      case '>':  return a > b
      case '<':  return a < b
    }
  }

  private compareValues(a: unknown, op: CompareOp, b: unknown): boolean {
    switch (op) {
      case '==': return a === b
      case '!=': return a !== b
      default: return false
    }
  }
}

/** 内部解析器 */
class DSLParser {
  private pos = 0
  private expr: string

  constructor(expr: string) {
    this.expr = expr
  }

  parseExpression(): ConditionAST {
    return this.parseOr()
  }

  private parseOr(): ConditionAST {
    const children: ConditionAST[] = [this.parseAnd()]
    while (this.peek() === '|') {
      this.advance()
      children.push(this.parseAnd())
    }
    return children.length === 1 ? children[0] : { type: 'or', children }
  }

  private parseAnd(): ConditionAST {
    const children: ConditionAST[] = [this.parseAtom()]
    while (this.peek() === '&') {
      this.advance()
      children.push(this.parseAtom())
    }
    return children.length === 1 ? children[0] : { type: 'and', children }
  }

  private parseAtom(): ConditionAST {
    this.skipSpaces()
    // 括号
    if (this.peek() === '(') {
      this.advance()
      const inner = this.parseOr()
      this.skipSpaces()
      if (this.peek() === ')') this.advance()
      return inner
    }
    // flag:name
    if (this.expr.startsWith('flag:', this.pos)) {
      this.pos += 5
      const name = this.readUntil(' ', ')', '&', '|')
      return { type: 'flag', name }
    }
    // has.talent.id / has.event.id
    if (this.expr.startsWith('has.', this.pos)) {
      this.pos += 4
      const kind = this.readUntil('.')
      this.advance() // skip .
      const id = this.readUntil(' ', ')', '&', '|')
      return { type: 'has', kind, id }
    }
    // 普通比较
    return this.parseComparison()
  }

  private parseComparison(): ConditionAST {
    this.skipSpaces()
    const attr = this.readIdentifier()
    this.skipSpaces()
    if (!attr) {
      return { type: 'literal', value: true }
    }
    // 如果后面没有操作符，视为布尔检查
    const op = this.readOp()
    if (!op) {
      // 单独标识符作为布尔：attribute.xxx > 0
      return { type: 'comparison', attr, op: '>', value: 0 }
    }
    this.skipSpaces()
    const value = this.readValue()
    return { type: 'comparison', attr, op, value }
  }

  private readIdentifier(): string {
    let result = ''
    while (this.pos < this.expr.length) {
      const c = this.expr[this.pos]
      if (/[a-zA-Z0-9_.]/.test(c)) {
        result += c
        this.pos++
      } else {
        break
      }
    }
    return result
  }

  private readOp(): CompareOp | null {
    const two = this.expr.substring(this.pos, this.pos + 2)
    if (['==', '!=', '>=', '<='].includes(two)) {
      this.pos += 2
      return two as CompareOp
    }
    const one = this.expr[this.pos]
    if (one === '>' || one === '<') {
      this.pos++
      return one as CompareOp
    }
    return null
  }

  private readValue(): number | string {
    this.skipSpaces()
    // 数字（含负号）
    let numStr = ''
    const start = this.pos
    if (this.expr[this.pos] === '-') {
      numStr += '-'
      this.pos++
    }
    while (this.pos < this.expr.length && /[0-9.]/.test(this.expr[this.pos])) {
      numStr += this.expr[this.pos]
      this.pos++
    }
    if (numStr && numStr !== '-') {
      return parseFloat(numStr)
    }
    // 字符串：读取直到分隔符
    this.pos = start
    let strVal = ''
    while (this.pos < this.expr.length) {
      const c = this.expr[this.pos]
      if (c === ' ' || c === ')' || c === '&' || c === '|') break
      strVal += c
      this.pos++
    }
    return strVal.trim()
  }

  private readUntil(...stops: string[]): string {
    let result = ''
    while (this.pos < this.expr.length) {
      const c = this.expr[this.pos]
      if (stops.includes(c) || c === '') break
      result += c
      this.pos++
    }
    return result.trim()
  }

  private peek(): string {
    this.skipSpaces()
    return this.expr[this.pos] ?? ''
  }

  private advance(): string {
    const c = this.expr[this.pos] ?? ''
    this.pos++
    return c
  }

  private skipSpaces(): void {
    while (this.pos < this.expr.length && this.expr[this.pos] === ' ') {
      this.pos++
    }
  }
}
