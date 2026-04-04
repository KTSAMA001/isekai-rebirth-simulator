/**
 * TalentModule — 天赋系统
 * 管理天赋抽取、选择、效果触发
 */

import type { WorldInstance, GameState, TalentEffect, Gender } from '../core/types'
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
    count: number,
    raceId?: string,
    gender?: Gender,
    presetId?: string
  ): { drafted: string[]; replacements: { original: string; replacement: string }[] } {
    // 构建可用天赋池（排除已继承的）
    const inheritedSet = new Set(inheritedTalents)
    const available = this.world.talents.filter(t => !inheritedSet.has(t.id))

    // 查找种族专属天赋ID
    const exclusiveIds: string[] = []
    if (raceId && this.world.races) {
      const raceDef = this.world.races.find(r => r.id === raceId)
      if (raceDef?.exclusiveTalents) {
        exclusiveIds.push(...raceDef.exclusiveTalents)
      }
      // 性别专属天赋
      if (gender && raceDef?.genderModifiers) {
        const gm = raceDef.genderModifiers.find(g => g.gender === gender)
        if (gm?.exclusiveTalents) {
          exclusiveIds.push(...gm.exclusiveTalents)
        }
      }
    }
    // 预设专属天赋
    if (presetId) {
      const presetDef = this.world.presets.find(p => p.id === presetId)
      if (presetDef?.exclusiveTalents) {
        exclusiveIds.push(...presetDef.exclusiveTalents)
      }
    }

    // 按权重抽取（排除专属天赋；排除当前种族被禁的天赋；按种族/性别/预设过滤）
    const exclusiveSet = new Set(exclusiveIds)
    const normalPool = available.filter(t => {
      // 排除专属天赋（它们保底加入）
      if (exclusiveSet.has(t.id)) return false
      // 种族白名单
      if (t.requireRace?.length && (!raceId || !t.requireRace.includes(raceId))) return false
      // 性别限定
      if (t.requireGender && t.requireGender !== gender) return false
      // 预设限定
      if (t.requirePreset?.length && (!presetId || !t.requirePreset.includes(presetId))) return false
      return true
    })
    const normalCount = Math.max(0, count - exclusiveIds.length)
    const drafted = this.random.pickN(normalPool, normalCount).map(t => t.id)

    // 专属天赋保底加入
    drafted.push(...exclusiveIds.filter(id => !inheritedSet.has(id)))

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

  /** 选择天赋（处理互斥 — 自动跳过冲突天赋，保留先选的） */
  selectTalents(
    draftPool: string[],
    selections: string[],
    maxCount: number
  ): { selected: string[]; conflicts: string[] } {
    const conflicts: string[] = []
    const selected: string[] = []
    const acceptedSet = new Set<string>()

    for (const id of selections) {
      if (selected.length >= maxCount) break

      const def = this.world.index.talentsById.get(id)

      // 检查是否与已接受的天赋互斥
      let isConflicting = false
      if (def?.mutuallyExclusive) {
        for (const excludeId of def.mutuallyExclusive) {
          if (acceptedSet.has(excludeId)) {
            conflicts.push(`${id} 与 ${excludeId} 互斥，已跳过 ${id}`)
            isConflicting = true
            break
          }
        }
      }

      // 反向检查：已接受的天赋是否声明了与当前天赋互斥
      if (!isConflicting) {
        for (const acceptedId of acceptedSet) {
          const acceptedDef = this.world.index.talentsById.get(acceptedId)
          if (acceptedDef?.mutuallyExclusive?.includes(id)) {
            conflicts.push(`${acceptedId} 与 ${id} 互斥，已跳过 ${id}`)
            isConflicting = true
            break
          }
        }
      }

      if (!isConflicting) {
        selected.push(id)
        acceptedSet.add(id)
      }
    }

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
