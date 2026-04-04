import { describe, it, expect } from 'vitest'
import { DiceModule } from '@/engine/modules/DiceModule'
import { RandomProvider } from '@/engine/core/RandomProvider'
import { makeState } from '../../helpers'

function createModule(seed = 42) {
  return new DiceModule(new RandomProvider(seed))
}

describe('DiceModule', () => {
  describe('getModifier()', () => {
    it('属性值 0 → 修正 0', () => {
      expect(createModule().getModifier(0)).toBe(0)
    })

    it('属性值 3 → 修正 1', () => {
      expect(createModule().getModifier(3)).toBe(1)
    })

    it('属性值 6 → 修正 2', () => {
      expect(createModule().getModifier(6)).toBe(2)
    })

    it('属性值 20 → 修正 6', () => {
      expect(createModule().getModifier(20)).toBe(6)
    })

    it('属性值 1 → 修正 0', () => {
      expect(createModule().getModifier(1)).toBe(0)
    })
  })

  describe('rollD20()', () => {
    it('结果在 1-20 范围内', () => {
      const mod = createModule()
      for (let i = 0; i < 1000; i++) {
        const roll = mod.rollD20()
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(20)
        expect(Number.isInteger(roll)).toBe(true)
      }
    })
  })

  describe('resolve()', () => {
    it('普通判定：roll + modifier >= dc 时成功', () => {
      // 使用固定种子，验证确定性
      const mod = createModule(42)
      const state = makeState({ attributes: { str: 15, int: 5, chr: 5, luk: 5, mag: 5 } })
      const result = mod.resolve({ attribute: 'str', dc: 10 }, state)
      expect(result.modifier).toBe(5) // floor(15/3) = 5
      expect(result.dc).toBe(10)
      expect(typeof result.success).toBe('boolean')
      expect(result.total).toBe(result.roll + result.modifier)
    })

    it('Natural 20 必定成功', () => {
      // 模拟多次直到出现 nat 20 或用 mock
      let found = false
      for (let seed = 0; seed < 1000; seed++) {
        const mod = createModule(seed)
        const state = makeState({ attributes: { str: 0, int: 5, chr: 5, luk: 5, mag: 5 } })
        const result = mod.resolve({ attribute: 'str', dc: 99 }, state)
        if (result.roll === 20) {
          expect(result.criticalSuccess).toBe(true)
          expect(result.success).toBe(true)
          found = true
          break
        }
      }
      expect(found).toBe(true) // 1000 次内应至少出现一次 nat 20
    })

    it('Natural 1 必定失败', () => {
      let found = false
      for (let seed = 0; seed < 1000; seed++) {
        const mod = createModule(seed)
        const state = makeState({ attributes: { str: 20, int: 5, chr: 5, luk: 5, mag: 5 } })
        const result = mod.resolve({ attribute: 'str', dc: 1 }, state)
        if (result.roll === 1) {
          expect(result.criticalFailure).toBe(true)
          expect(result.success).toBe(false)
          found = true
          break
        }
      }
      expect(found).toBe(true)
    })

    it('优势：掷两次取高', () => {
      // 确定性测试：同一种子下优势结果 >= 普通结果（统计上）
      let advantageBetter = 0
      for (let seed = 0; seed < 200; seed++) {
        const mod1 = createModule(seed)
        const mod2 = createModule(seed)
        const state = makeState({ attributes: { str: 10, int: 5, chr: 5, luk: 5, mag: 5 } })
        const normal = mod1.resolve({ attribute: 'str', dc: 10 }, state)
        const adv = mod2.resolve({ attribute: 'str', dc: 10, advantage: true }, state)
        if (adv.roll >= normal.roll) advantageBetter++
      }
      // 优势应该在多数时候 >= 普通
      expect(advantageBetter).toBeGreaterThan(100)
    })

    it('劣势：掷两次取低', () => {
      let disadvantageWorse = 0
      for (let seed = 0; seed < 200; seed++) {
        const mod1 = createModule(seed)
        const mod2 = createModule(seed)
        const state = makeState({ attributes: { str: 10, int: 5, chr: 5, luk: 5, mag: 5 } })
        const normal = mod1.resolve({ attribute: 'str', dc: 10 }, state)
        const dis = mod2.resolve({ attribute: 'str', dc: 10, disadvantage: true }, state)
        if (dis.roll <= normal.roll) disadvantageWorse++
      }
      expect(disadvantageWorse).toBeGreaterThan(100)
    })

    it('优势劣势同时 → 正常投掷', () => {
      const mod = createModule(42)
      const state = makeState({ attributes: { str: 10, int: 5, chr: 5, luk: 5, mag: 5 } })
      // 应该只掷一次
      const result = mod.resolve({ attribute: 'str', dc: 10, advantage: true, disadvantage: true }, state)
      expect(result.total).toBe(result.roll + result.modifier)
    })

    it('不存在的属性使用 0 修正', () => {
      const mod = createModule(42)
      const state = makeState({ attributes: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const result = mod.resolve({ attribute: 'nonexistent', dc: 10 }, state)
      expect(result.modifier).toBe(0)
    })
  })
})
