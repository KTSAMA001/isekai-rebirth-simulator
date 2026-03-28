/**
 * Mulberry32 PRNG — 可控随机数生成器
 * 支持 seed 确定性回放
 */
export class RandomProvider {
  private state: number

  constructor(private seed: number) {
    this.state = seed
  }

  /** 返回 [0, 1) 的浮点数 */
  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** 返回 [min, max] 的整数 */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /** 从数组中按权重随机选一个 */
  weightedPick<T>(items: T[], getWeight: (item: T) => number): T {
    if (items.length === 0) {
      throw new Error('weightedPick: 空数组')
    }
    const weights = items.map(getWeight)
    const total = weights.reduce((a, b) => a + b, 0)
    if (total <= 0) {
      // 所有权重为0时均匀随机
      return items[this.nextInt(0, items.length - 1)]
    }
    let r = this.next() * total
    for (let i = 0; i < items.length; i++) {
      r -= weights[i]
      if (r <= 0) return items[i]
    }
    return items[items.length - 1]
  }

  /** 从数组中随机选 N 个不重复元素 */
  pickN<T>(items: T[], count: number): T[] {
    const shuffled = this.shuffle([...items])
    return shuffled.slice(0, Math.min(count, items.length))
  }

  /** 洗牌（Fisher-Yates） */
  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return items
  }

  /** 按概率触发 */
  chance(probability: number): boolean {
    return this.next() < probability
  }

  /** 保存状态 */
  saveState(): number {
    return this.state
  }

  /** 恢复状态 */
  restoreState(state: number): void {
    this.state = state
  }
}
