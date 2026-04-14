import { describe, it, expect } from 'vitest'
import { AttributeModule } from '@/engine/modules/AttributeModule'
import { makeWorld, makeAttributeDefs } from '../../helpers'

function createModule() {
  const world = makeWorld()
  return new AttributeModule(world)
}

describe('AttributeModule', () => {
  describe('initAttributes()', () => {
    it('初始化所有属性为默认值', () => {
      const mod = createModule()
      const attrs = mod.initAttributes()
      expect(attrs.str).toBe(5)
      expect(attrs.int).toBe(5)
      expect(attrs.chr).toBe(5)
      expect(attrs.luk).toBe(5)
      expect(attrs.mag).toBe(5)
      expect(attrs.hp_display).toBe(100)
    })
  })

  describe('allocate()', () => {
    it('正确分配属性点', () => {
      const mod = createModule()
      const current = { str: 5, int: 5, chr: 5, luk: 5, mag: 5, hp_display: 100 }
      const result = mod.allocate(current, { str: 5, int: 3 }, 20)
      expect(result.attributes.str).toBe(10)
      expect(result.attributes.int).toBe(8)
      expect(result.remaining).toBe(12)
    })

    it('属性无上限，自由增长', () => {
      const mod = createModule()
      const current = { str: 18, int: 5, chr: 5, luk: 5, mag: 5, hp_display: 100 }
      const result = mod.allocate(current, { str: 10 }, 20)
      // 不再 clamp，18 + 10 = 28
      expect(result.attributes.str).toBe(28)
      expect(result.remaining).toBe(10)
    })

    it('出生属性下限保护，allocate 结果 clamp 到 0', () => {
      const mod = createModule()
      const current = { str: 2, int: 5, chr: 5, luk: 5, mag: 5, hp_display: 100 }
      const result = mod.allocate(current, { str: -10 }, 20)
      // 2 + (-10) = -8 → clamp 到 0
      expect(result.attributes.str).toBe(0)
    })

    it('忽略 hidden 属性的分配', () => {
      const mod = createModule()
      const current = { str: 5, int: 5, chr: 5, luk: 5, mag: 5, hp_display: 100 }
      const result = mod.allocate(current, { hp_display: 50 }, 20)
      // hp_display 是 hidden，不应被分配
      expect(result.attributes.hp_display).toBe(100)
      expect(result.remaining).toBe(20)
    })
  })

  describe('modify()', () => {
    it('增加属性并更新峰值', () => {
      const mod = createModule()
      const attrs = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const peaks = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const result = mod.modify(attrs, peaks, [{ attribute: 'str', value: 3 }])
      expect(result.attributes.str).toBe(8)
      expect(result.peaks.str).toBe(8)
    })

    it('减少属性可以为负数', () => {
      const mod = createModule()
      const attrs = { str: 2, int: 5, chr: 5, luk: 5, mag: 5 }
      const peaks = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const result = mod.modify(attrs, peaks, [{ attribute: 'str', value: -10 }])
      expect(result.attributes.str).toBe(-8)
      // 峰值不变
      expect(result.peaks.str).toBe(5)
    })

    it('多个修改同时应用', () => {
      const mod = createModule()
      const attrs = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const peaks = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const result = mod.modify(attrs, peaks, [
        { attribute: 'str', value: 5 },
        { attribute: 'int', value: -2 },
      ])
      expect(result.attributes.str).toBe(10)
      expect(result.attributes.int).toBe(3)
    })

    it('不存在的属性跳过', () => {
      const mod = createModule()
      const attrs = { str: 5 }
      const peaks = { str: 5 }
      const result = mod.modify(attrs, peaks, [{ attribute: 'nonexistent', value: 99 }])
      expect(result.attributes.str).toBe(5)
    })

    it('不修改原对象', () => {
      const mod = createModule()
      const attrs = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const peaks = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      mod.modify(attrs, peaks, [{ attribute: 'str', value: 10 }])
      expect(attrs.str).toBe(5) // 原对象未变
    })
  })

  describe('set()', () => {
    it('设置绝对值并更新峰值', () => {
      const mod = createModule()
      const attrs = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const peaks = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const result = mod.set(attrs, peaks, 'str', 15)
      expect(result.attributes.str).toBe(15)
      expect(result.peaks.str).toBe(15)
    })

    it('无上限，不 clamp', () => {
      const mod = createModule()
      const attrs = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const peaks = { str: 5, int: 5, chr: 5, luk: 5, mag: 5 }
      const result = mod.set(attrs, peaks, 'str', 999)
      expect(result.attributes.str).toBe(999)
    })

    it('不存在的属性返回原值', () => {
      const mod = createModule()
      const attrs = { str: 5 }
      const peaks = { str: 5 }
      const result = mod.set(attrs, peaks, 'nonexistent', 10)
      expect(result.attributes).toEqual(attrs)
    })
  })

  describe('snapshot()', () => {
    it('返回属性快照', () => {
      const mod = createModule()
      const snap = mod.snapshot({ str: 10, int: 8 }, 25)
      expect(snap.age).toBe(25)
      expect(snap.values.str).toBe(10)
    })

    it('快照是独立副本', () => {
      const mod = createModule()
      const attrs = { str: 10 }
      const snap = mod.snapshot(attrs, 1)
      attrs.str = 20
      expect(snap.values.str).toBe(10)
    })
  })

  describe('getVisibleAttributes()', () => {
    it('排除 hidden 属性', () => {
      const mod = createModule()
      const visible = mod.getVisibleAttributes()
      expect(visible.every(a => !a.hidden)).toBe(true)
      expect(visible.find(a => a.id === 'hp_display')).toBeUndefined()
    })
  })
})
