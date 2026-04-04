import { describe, it, expect } from 'vitest'
import { RandomProvider } from '@/engine/core/RandomProvider'

describe('RandomProvider', () => {
  describe('确定性', () => {
    it('相同种子产生相同序列', () => {
      const rng1 = new RandomProvider(42)
      const rng2 = new RandomProvider(42)
      for (let i = 0; i < 100; i++) {
        expect(rng1.next()).toBe(rng2.next())
      }
    })

    it('不同种子产生不同序列', () => {
      const rng1 = new RandomProvider(42)
      const rng2 = new RandomProvider(123)
      const same = Array.from({ length: 20 }, () => rng1.next() === rng2.next())
      // 20 次中至少有一次不同
      expect(same.some(s => !s)).toBe(true)
    })
  })

  describe('next()', () => {
    it('返回 [0, 1) 范围的值', () => {
      const rng = new RandomProvider(1)
      for (let i = 0; i < 1000; i++) {
        const v = rng.next()
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    })
  })

  describe('nextInt(min, max)', () => {
    it('返回 [min, max] 范围的整数', () => {
      const rng = new RandomProvider(7)
      for (let i = 0; i < 500; i++) {
        const v = rng.nextInt(3, 10)
        expect(v).toBeGreaterThanOrEqual(3)
        expect(v).toBeLessThanOrEqual(10)
        expect(Number.isInteger(v)).toBe(true)
      }
    })

    it('min == max 时始终返回该值', () => {
      const rng = new RandomProvider(99)
      for (let i = 0; i < 20; i++) {
        expect(rng.nextInt(5, 5)).toBe(5)
      }
    })
  })

  describe('weightedPick()', () => {
    it('空数组抛异常', () => {
      const rng = new RandomProvider(1)
      expect(() => rng.weightedPick([], () => 1)).toThrow('空数组')
    })

    it('单元素始终返回该元素', () => {
      const rng = new RandomProvider(1)
      for (let i = 0; i < 10; i++) {
        expect(rng.weightedPick(['only'], () => 1)).toBe('only')
      }
    })

    it('权重为0时均匀分布', () => {
      const rng = new RandomProvider(42)
      const items = ['a', 'b', 'c']
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      for (let i = 0; i < 3000; i++) {
        counts[rng.weightedPick(items, () => 0)]++
      }
      // 每项应大致均匀（约 1000 次）
      for (const k of Object.keys(counts)) {
        expect(counts[k]).toBeGreaterThan(500)
      }
    })

    it('高权重项被选中的概率更大', () => {
      const rng = new RandomProvider(42)
      const items = [
        { id: 'rare', weight: 1 },
        { id: 'common', weight: 99 },
      ]
      const counts = { rare: 0, common: 0 }
      for (let i = 0; i < 5000; i++) {
        const picked = rng.weightedPick(items, it => it.weight)
        counts[picked.id as 'rare' | 'common']++
      }
      expect(counts.common).toBeGreaterThan(counts.rare * 5)
    })
  })

  describe('pickN()', () => {
    it('返回指定数量的不重复元素', () => {
      const rng = new RandomProvider(42)
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const picked = rng.pickN(items, 3)
      expect(picked).toHaveLength(3)
      // 不重复
      expect(new Set(picked).size).toBe(3)
      // 都来自原数组
      for (const p of picked) {
        expect(items).toContain(p)
      }
    })

    it('count > items.length 时返回全部', () => {
      const rng = new RandomProvider(1)
      const items = ['a', 'b']
      const picked = rng.pickN(items, 10)
      expect(picked).toHaveLength(2)
    })

    it('不修改原数组', () => {
      const rng = new RandomProvider(1)
      const items = [1, 2, 3, 4, 5]
      const original = [...items]
      rng.pickN(items, 3)
      expect(items).toEqual(original)
    })
  })

  describe('shuffle()', () => {
    it('保持元素不变仅序改变', () => {
      const rng = new RandomProvider(42)
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const shuffled = rng.shuffle([...items])
      expect(shuffled.sort((a, b) => a - b)).toEqual(items)
    })

    it('原地修改数组', () => {
      const rng = new RandomProvider(10)
      const items = [1, 2, 3, 4, 5]
      const result = rng.shuffle(items)
      expect(result).toBe(items)
    })
  })

  describe('chance()', () => {
    it('probability=0 始终返回 false', () => {
      const rng = new RandomProvider(1)
      for (let i = 0; i < 100; i++) {
        expect(rng.chance(0)).toBe(false)
      }
    })

    it('probability=1 始终返回 true', () => {
      const rng = new RandomProvider(1)
      for (let i = 0; i < 100; i++) {
        expect(rng.chance(1)).toBe(true)
      }
    })

    it('probability=0.5 接近一半命中', () => {
      const rng = new RandomProvider(42)
      let hits = 0
      const total = 10000
      for (let i = 0; i < total; i++) {
        if (rng.chance(0.5)) hits++
      }
      const ratio = hits / total
      expect(ratio).toBeGreaterThan(0.45)
      expect(ratio).toBeLessThan(0.55)
    })
  })

  describe('状态保存/恢复', () => {
    it('restoreState 后序列与保存时一致', () => {
      const rng = new RandomProvider(42)
      // 消耗一些随机数
      for (let i = 0; i < 50; i++) rng.next()
      const saved = rng.saveState()
      const expected = Array.from({ length: 10 }, () => rng.next())

      // 恢复状态
      rng.restoreState(saved)
      const actual = Array.from({ length: 10 }, () => rng.next())
      expect(actual).toEqual(expected)
    })
  })
})
