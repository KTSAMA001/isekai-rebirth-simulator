/**
 * TalentModule — 天赋系统
 * 管理天赋抽取、选择、效果触发
 */

import type { WorldInstance, GameState, TalentEffect } from '../core/types'
import type { RandomProvider } from '../core/RandomProvider'

export class TalentModule {
  private world: WorldInstance
  private random: RandomProvider

  constructor(world: WorldInstance, random: RandomProvider) {
    this.world = world
    this.random = random
  }

  /** 抽取天赋池 */
  draftTalents(
    existingTalents: string[],
    inheritedTalents: string[],
    count: number
  ): { drafted: string[]; replacements: { original: string; replacement: string }[] } {
    // 构建可用天赋池（排除已继承的）
    const inheritedSet = new Set(inheritedTalents)
    const available = this.world.talents.filter(t => !inheritedSet.has(t.id))

    // 按权重抽取
    const drafted = this.random.pickN(
      available,
      count
    ).map(t => t.id)

    // 处理替换天赋
    const replacements: { original: string; replacement: string }[] = []
    const finalDrafted: string[] = []

    for (const talentId of drafted) {
      const def = this.world.index.talentsById.get(talentId)
      if (def?.replaceTalent && existingTalents.includes(def.replaceTalent)) {
        finalDrafted.push(def.replaceTalent)
        replacements.push({ original: talentId, replacement: def.replaceTalent })
      } else {
        finalDrafted.push(talentId)
      }
    }

    // 加入继承天赋
    for (const id of inheritedTalents) {
      if (!finalDrafted.includes(id)) {
        finalDrafted.push(id)
      }
    }

    return { drafted: finalDrafted, replacements }
  }

  /** 选择天赋（处理互斥） */
  selectTalents(
    draftPool: string[],
    selections: string[],
    maxCount: number
  ): { selected: string[]; conflicts: string[] } {
    const conflicts: string[] = []
    const selected: string[] = []

    // 检查互斥
    const selectionSet = new Set(selections)
    for (const id of selections) {
      const def = this.world.index.talentsById.get(id)
      if (def?.mutuallyExclusive) {
        for (const excludeId of def.mutuallyExclusive) {
          if (selectionSet.has(excludeId)) {
            conflicts.push(`${id} 与 ${excludeId} 互斥`)
          }
        }
      }
    }

    if (conflicts.length > 0) {
      return { selected: [], conflicts }
    }

    // 限制数量
    selected.push(...selections.slice(0, maxCount))
    return { selected, conflicts }
  }

  /** 获取天赋在当前年龄的触发效果 */
  getActiveEffects(
    talentIds: string[],
    age: number,
    state: GameState
  ): TalentEffect[] {
    const effects: TalentEffect[] = []

    for (const id of talentIds) {
      const def = this.world.index.talentsById.get(id)
      if (!def) continue

      for (const effect of def.effects) {
        // trigger_on_age 类型：检查年龄匹配
        if (effect.type === 'trigger_on_age' && effect.age === age) {
          effects.push(effect)
        }
      }
    }

    return effects
  }

  /** 获取天赋的属性修改效果（一次性，在天赋选择时应用） */
  getImmediateEffects(talentIds: string[]): { attribute: string; value: number }[] {
    const modifications: { attribute: string; value: number }[] = []

    for (const id of talentIds) {
      const def = this.world.index.talentsById.get(id)
      if (!def) continue

      for (const effect of def.effects) {
        if (effect.type === 'modify_attribute' && effect.value !== undefined) {
          modifications.push({ attribute: effect.target, value: effect.value })
        }
      }
    }

    return modifications
  }

  /** 获取可继承天赋列表 */
  getInheritable(lastGameTalents: string[]): string[] {
    return lastGameTalents.filter(id => {
      const def = this.world.index.talentsById.get(id)
      return def?.inheritable === true
    })
  }
}
