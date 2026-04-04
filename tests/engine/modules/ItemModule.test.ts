import { describe, it, expect } from 'vitest'
import { ItemModule } from '@/engine/modules/ItemModule'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'
import { makeWorld, makeItem, makeState } from '../../helpers'
import type { ItemEffectDef } from '@/engine/core/types'

function createModule(items: ReturnType<typeof makeItem>[]) {
  const world = makeWorld({ items })
  const dsl = new ConditionDSL()
  return new ItemModule(world, dsl)
}

describe('ItemModule', () => {
  describe('grantItem()', () => {
    it('成功获取物品', () => {
      const items = [makeItem('sword', { acquireText: '获得了剑！' })]
      const mod = createModule(items)
      const state = makeState()
      const result = mod.grantItem(state, 'sword')
      expect(result.success).toBe(true)
      expect(result.message).toBe('获得了剑！')
      expect(state.inventory.items).toHaveLength(1)
      expect(state.inventory.items[0].itemId).toBe('sword')
    })

    it('物品不存在时失败', () => {
      const mod = createModule([])
      const state = makeState()
      const result = mod.grantItem(state, 'nonexistent')
      expect(result.success).toBe(false)
    })

    it('背包已满时失败', () => {
      const items = [makeItem('sword')]
      const mod = createModule(items)
      const state = makeState({
        inventory: {
          items: Array.from({ length: 5 }, (_, i) => ({ itemId: `item${i}`, acquiredAge: 1 })),
          maxSlots: 5,
        },
      })
      const result = mod.grantItem(state, 'sword')
      expect(result.success).toBe(false)
      expect(result.message).toBe('背包已满')
    })

    it('重复获取同ID物品失败', () => {
      const items = [makeItem('sword')]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'sword', acquiredAge: 1 }], maxSlots: 5 },
      })
      const result = mod.grantItem(state, 'sword')
      expect(result.success).toBe(false)
      expect(result.message).toBe('已拥有该物品')
    })
  })

  describe('getHpRegenBonus()', () => {
    it('计算HP恢复加成', () => {
      const items = [
        makeItem('ring', {
          effects: [{ type: 'hp_regen_bonus', value: 3 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'ring', acquiredAge: 1 }], maxSlots: 5 },
      })
      expect(mod.getHpRegenBonus(state)).toBe(3)
    })

    it('无物品时返回0', () => {
      const mod = createModule([])
      const state = makeState()
      expect(mod.getHpRegenBonus(state)).toBe(0)
    })
  })

  describe('getHpCapModifier()', () => {
    it('计算HP上限修正', () => {
      const items = [
        makeItem('cursed_ring', {
          effects: [{ type: 'hp_cap_modifier', value: -0.2 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'cursed_ring', acquiredAge: 1 }], maxSlots: 5 },
      })
      expect(mod.getHpCapModifier(state)).toBe(-0.2)
    })
  })

  describe('getDamageReduction()', () => {
    it('计算伤害减免', () => {
      const items = [
        makeItem('shield', {
          effects: [{ type: 'damage_reduction', value: 0.2 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'shield', acquiredAge: 1 }], maxSlots: 5 },
      })
      expect(mod.getDamageReduction(state)).toBe(0.2)
    })
  })

  describe('getAttributeGrowth()', () => {
    it('计算属性被动成长', () => {
      const items = [
        makeItem('training_ring', {
          effects: [{ type: 'attr_passive_growth', target: 'str', value: 0.5 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'training_ring', acquiredAge: 1 }], maxSlots: 5 },
      })
      const growth = mod.getAttributeGrowth(state)
      expect(growth.str).toBe(0.5)
    })
  })

  describe('checkDeathSave()', () => {
    it('存在免死效果时返回恢复值', () => {
      const items = [
        makeItem('phoenix', {
          effects: [{ type: 'death_save', value: 50 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'phoenix', acquiredAge: 1 }], maxSlots: 5 },
      })
      expect(mod.checkDeathSave(state)).toBe(50)
    })

    it('无免死效果时返回0', () => {
      const mod = createModule([])
      const state = makeState()
      expect(mod.checkDeathSave(state)).toBe(0)
    })
  })

  describe('consumeDeathSave()', () => {
    it('消耗免死物品并返回恢复值', () => {
      const items = [
        makeItem('phoenix', {
          effects: [{ type: 'death_save', value: 50 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        inventory: { items: [{ itemId: 'phoenix', acquiredAge: 1 }], maxSlots: 5 },
      })
      const hp = mod.consumeDeathSave(state)
      expect(hp).toBe(50)
      expect(state.inventory.items).toHaveLength(0) // 物品被移除
    })

    it('无免死物品时返回0', () => {
      const mod = createModule([])
      const state = makeState()
      expect(mod.consumeDeathSave(state)).toBe(0)
    })
  })

  describe('getFlatHpBonus()', () => {
    it('返回一次性HP加成', () => {
      const items = [
        makeItem('potion', {
          effects: [{ type: 'hp_flat_bonus', value: 20 } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      expect(mod.getFlatHpBonus('potion')).toBe(20)
    })

    it('不存在的物品返回0', () => {
      const mod = createModule([])
      expect(mod.getFlatHpBonus('nonexistent')).toBe(0)
    })
  })

  describe('getActiveEffects() 条件过滤', () => {
    it('条件满足时效果生效', () => {
      const items = [
        makeItem('conditional_ring', {
          effects: [{
            type: 'hp_regen_bonus',
            value: 5,
            condition: 'hp<50',
          } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        hp: 30,
        inventory: { items: [{ itemId: 'conditional_ring', acquiredAge: 1 }], maxSlots: 5 },
      })
      expect(mod.getHpRegenBonus(state)).toBe(5)
    })

    it('条件不满足时效果不生效', () => {
      const items = [
        makeItem('conditional_ring', {
          effects: [{
            type: 'hp_regen_bonus',
            value: 5,
            condition: 'hp<50',
          } as ItemEffectDef],
        }),
      ]
      const mod = createModule(items)
      const state = makeState({
        hp: 80,
        inventory: { items: [{ itemId: 'conditional_ring', acquiredAge: 1 }], maxSlots: 5 },
      })
      expect(mod.getHpRegenBonus(state)).toBe(0)
    })
  })
})
