/**
 * ItemModule — 物品系统模块
 * 管理物品获取、效果计算、免死判定等
 */

import type { WorldInstance, GameState, ItemEffectDef } from '../core/types'
import type { ConditionDSL } from './ConditionDSL'

export class ItemModule {
  private world: WorldInstance
  private dsl: ConditionDSL

  constructor(world: WorldInstance, dsl: ConditionDSL) {
    this.world = world
    this.dsl = dsl
  }

  /** 给玩家添加物品，返回成功/失败和描述 */
  grantItem(state: GameState, itemId: string): { success: boolean; message: string } {
    const itemDef = this.world.index.itemsById.get(itemId)
    if (!itemDef) return { success: false, message: `物品 ${itemId} 不存在` }
    if (state.inventory.items.length >= state.inventory.maxSlots) {
      return { success: false, message: '背包已满' }
    }
    // 检查是否已拥有（同ID物品不能重复获取）
    if (state.inventory.items.some(s => s.itemId === itemId)) {
      return { success: false, message: '已拥有该物品' }
    }
    state.inventory = {
      ...state.inventory,
      items: [...state.inventory.items, { itemId, acquiredAge: state.age }],
    }
    return { success: true, message: itemDef.acquireText }
  }

  /** 获取玩家所有物品的生效效果（过滤条件） */
  getActiveEffects(state: GameState): ItemEffectDef[] {
    const effects: ItemEffectDef[] = []
    for (const slot of state.inventory.items) {
      const def = this.world.index.itemsById.get(slot.itemId)
      if (!def) continue
      const ctx = { state, world: this.world }
      for (const fx of def.effects) {
        if (fx.condition && !this.dsl.evaluate(fx.condition, ctx)) continue
        effects.push(fx)
      }
    }
    return effects
  }

  /** 计算HP恢复修正（每年调用一次） */
  getHpRegenBonus(state: GameState): number {
    return this.getActiveEffects(state)
      .filter(e => e.type === 'hp_regen_bonus')
      .reduce((sum, e) => sum + e.value, 0)
  }

  /** 计算HP软上限修正因子（负数=降低上限） */
  getHpCapModifier(state: GameState): number {
    return this.getActiveEffects(state)
      .filter(e => e.type === 'hp_cap_modifier')
      .reduce((sum, e) => sum + e.value, 0)
  }

  /** 计算HP伤害减免因子（0.2=减免20%） */
  getDamageReduction(state: GameState): number {
    return this.getActiveEffects(state)
      .filter(e => e.type === 'damage_reduction')
      .reduce((sum, e) => sum + e.value, 0)
  }

  /** 计算判定加成 */
  getSkillCheckBonus(state: GameState): number {
    return this.getActiveEffects(state)
      .filter(e => e.type === 'skill_check_bonus')
      .reduce((sum, e) => sum + e.value, 0)
  }

  /** 计算属性被动成长（返回 Record<attrId, bonusPerYear>） */
  getAttributeGrowth(state: GameState): Record<string, number> {
    const growth: Record<string, number> = {}
    for (const fx of this.getActiveEffects(state)) {
      if (fx.type === 'attr_passive_growth' && fx.target) {
        growth[fx.target] = (growth[fx.target] || 0) + fx.value
      }
    }
    return growth
  }

  /** 检查是否有免死效果，如果有返回恢复HP值，否则返回0 */
  checkDeathSave(state: GameState): number {
    for (const slot of state.inventory.items) {
      const def = this.world.index.itemsById.get(slot.itemId)
      if (!def) continue
      for (const fx of def.effects) {
        if (fx.type === 'death_save') {
          return fx.value
        }
      }
    }
    return 0
  }

  /** 消耗免死效果（HP归零时调用） */
  consumeDeathSave(state: GameState): number {
    for (let i = 0; i < state.inventory.items.length; i++) {
      const slot = state.inventory.items[i]
      const def = this.world.index.itemsById.get(slot.itemId)
      if (!def) continue
      for (const fx of def.effects) {
        if (fx.type === 'death_save') {
          // 移除该物品
          state.inventory = {
            ...state.inventory,
            items: state.inventory.items.filter((_, idx) => idx !== i),
          }
          return fx.value
        }
      }
    }
    return 0
  }

  /** 条件HP恢复（HP变化后调用，返回恢复量） */
  getConditionalRegen(state: GameState): number {
    let total = 0
    for (const fx of this.getActiveEffects(state)) {
      if (fx.type === 'conditional_regen') {
        const ctx = { state, world: this.world }
        if (!fx.condition || this.dsl.evaluate(fx.condition, ctx)) {
          total += fx.value
        }
      }
    }
    return total
  }

  /** 一次性HP加成（获取物品时调用） */
  getFlatHpBonus(itemId: string): number {
    const def = this.world.index.itemsById.get(itemId)
    if (!def) return 0
    return def.effects
      .filter(e => e.type === 'hp_flat_bonus')
      .reduce((sum, e) => sum + e.value, 0)
  }
}
