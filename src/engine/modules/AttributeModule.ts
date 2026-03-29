/**
 * AttributeModule — 属性系统
 * 管理属性的定义、初始值分配、运行时修改、峰值追踪
 */

import type { WorldInstance, AttributeSnapshot } from '../core/types'

export class AttributeModule {
  private world: WorldInstance

  constructor(world: WorldInstance) {
    this.world = world
  }

  /** 初始化属性（全部置为默认值） */
  initAttributes(): Record<string, number> {
    const attrs: Record<string, number> = {}
    for (const def of this.world.attributes) {
      attrs[def.id] = def.defaultValue
    }
    return attrs
  }

  /** 分配初始属性点 */
  allocate(
    currentAttrs: Record<string, number>,
    allocation: Record<string, number>,
    totalPoints: number
  ): { attributes: Record<string, number>; remaining: number } {
    const attrs = { ...currentAttrs }
    let used = 0

    for (const def of this.world.attributes) {
      if (def.hidden) continue
      const allocated = allocation[def.id] ?? 0
      const base = currentAttrs[def.id] ?? def.defaultValue
      const newVal = base + allocated
      const clamped = Math.max(def.min, Math.min(def.max, newVal))
      const actual = clamped - base
      used += Math.max(0, actual)
      attrs[def.id] = clamped
    }

    return {
      attributes: attrs,
      remaining: Math.max(0, totalPoints - used),
    }
  }

  /** 修改属性值（带范围裁剪和峰值追踪） */
  modify(
    currentAttrs: Record<string, number>,
    peaks: Record<string, number>,
    modifications: { attribute: string; value: number }[]
  ): { attributes: Record<string, number>; peaks: Record<string, number> } {
    const attrs = { ...currentAttrs }
    const newPeaks = { ...peaks }

    for (const mod of modifications) {
      const def = this.world.index.attributesById.get(mod.attribute)
      if (!def) continue

      const newVal = (attrs[mod.attribute] ?? 0) + mod.value
      attrs[mod.attribute] = Math.max(def.min, Math.min(def.max, newVal))

      // 更新峰值
      if (attrs[mod.attribute] > (newPeaks[mod.attribute] ?? 0)) {
        newPeaks[mod.attribute] = attrs[mod.attribute]
      }
    }

    return { attributes: attrs, peaks: newPeaks }
  }

  /** 设置属性值（绝对值） */
  set(
    currentAttrs: Record<string, number>,
    peaks: Record<string, number>,
    target: string,
    value: number
  ): { attributes: Record<string, number>; peaks: Record<string, number> } {
    const attrs = { ...currentAttrs }
    const newPeaks = { ...peaks }
    const def = this.world.index.attributesById.get(target)
    if (!def) return { attributes: attrs, peaks: newPeaks }

    attrs[target] = Math.max(def.min, Math.min(def.max, value))
    if (attrs[target] > (newPeaks[target] ?? 0)) {
      newPeaks[target] = attrs[target]
    }
    return { attributes: attrs, peaks: newPeaks }
  }

  /** 获取属性快照 */
  snapshot(attrs: Record<string, number>, age: number): AttributeSnapshot {
    return { age, values: { ...attrs } }
  }

  /** 获取可见属性定义列表 */
  getVisibleAttributes() {
    return this.world.attributes.filter(a => !a.hidden)
  }
}
