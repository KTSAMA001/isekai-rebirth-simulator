import { describe, it, expect } from 'vitest'
import { EvaluatorModule } from '@/engine/modules/EvaluatorModule'
import { makeWorld, makeState } from '../../helpers'

function createModule(evaluations?: any[]) {
  const world = makeWorld()
  return new EvaluatorModule(world, evaluations)
}

describe('EvaluatorModule', () => {
  describe('calculate()', () => {
    it('返回评分和评级', () => {
      const mod = createModule()
      const state = makeState({
        age: 50,
        attributePeaks: { str: 15, int: 10, chr: 8, luk: 5, mag: 12 },
      })
      const result = mod.calculate(state)
      expect(result.score).toBeGreaterThan(0)
      expect(result.grade).toBeDefined()
      expect(result.gradeTitle).toBeDefined()
    })

    it('评分包含属性峰值加成', () => {
      const mod = createModule()
      const low = makeState({
        age: 10,
        attributePeaks: { str: 0, int: 0, chr: 0, luk: 0, mag: 0 },
      })
      const high = makeState({
        age: 10,
        attributePeaks: { str: 20, int: 20, chr: 20, luk: 20, mag: 20 },
      })
      const lowResult = mod.calculate(low)
      const highResult = mod.calculate(high)
      expect(highResult.score).toBeGreaterThan(lowResult.score)
    })

    it('寿命影响评分', () => {
      const mod = createModule()
      const young = makeState({ age: 10, attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const old = makeState({ age: 80, attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      expect(mod.calculate(old).score).toBeGreaterThan(mod.calculate(young).score)
    })

    it('物品数量影响评分', () => {
      const mod = createModule()
      const noItems = makeState({ attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const withItems = makeState({
        attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 },
        inventory: {
          items: [{ itemId: 'a', acquiredAge: 1 }, { itemId: 'b', acquiredAge: 2 }],
          maxSlots: 5,
        },
      })
      expect(mod.calculate(withItems).score).toBeGreaterThan(mod.calculate(noItems).score)
    })

    it('路线加分', () => {
      const mod = createModule()
      const noRoute = makeState({ attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const withRoute = makeState({
        attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 },
        flags: new Set(['on_adventurer_path', 'on_mage_path']),
      })
      expect(mod.calculate(withRoute).score).toBeGreaterThan(mod.calculate(noRoute).score)
    })

    it('评级等级映射正确', () => {
      const mod = createModule()
      // 极低分 → F
      const lowState = makeState({
        age: 1,
        attributePeaks: { str: 0, int: 0, chr: 0, luk: 0, mag: 0 },
      })
      expect(mod.calculate(lowState).grade).toBe('F')
    })
  })

  describe('人生评价匹配', () => {
    it('匹配条件符合的评价', () => {
      const evaluations = [
        { id: 'long_life', title: '长寿', description: '', rarity: 'common' as const, priority: 1, condition: 'state.age >= 70' },
        { id: 'short_life', title: '天折', description: '', rarity: 'common' as const, priority: 2, condition: 'state.age <= 10' },
      ]
      const mod = createModule(evaluations)
      const state = makeState({ age: 80, attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const result = mod.calculate(state)
      expect(result.evaluations.map(e => e.id)).toContain('long_life')
      expect(result.evaluations.map(e => e.id)).not.toContain('short_life')
    })

    it('最多返回3条评价', () => {
      const evaluations = Array.from({ length: 10 }, (_, i) => ({
        id: `eval_${i}`,
        title: '',
        description: '',
        rarity: 'common' as const,
        priority: i,
      }))
      const mod = createModule(evaluations)
      const state = makeState({ attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const result = mod.calculate(state)
      expect(result.evaluations.length).toBeLessThanOrEqual(3)
    })

    it('按优先级降序排列', () => {
      const evaluations = [
        { id: 'low', title: '', description: '', rarity: 'common' as const, priority: 1 },
        { id: 'high', title: '', description: '', rarity: 'common' as const, priority: 10 },
        { id: 'mid', title: '', description: '', rarity: 'common' as const, priority: 5 },
      ]
      const mod = createModule(evaluations)
      const state = makeState({ attributePeaks: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } })
      const result = mod.calculate(state)
      expect(result.evaluations[0].id).toBe('high')
      expect(result.evaluations[1].id).toBe('mid')
      expect(result.evaluations[2].id).toBe('low')
    })
  })
})
