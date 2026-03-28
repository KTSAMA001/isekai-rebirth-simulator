/**
 * WorldRegistry — 世界注册中心
 * 管理可用世界列表（内置 + 外部加载）
 */

import type { WorldInstance } from '../core/types'

class WorldRegistryImpl {
  private worlds: Map<string, WorldInstance> = new Map()

  /** 注册世界实例 */
  register(world: WorldInstance): void {
    this.worlds.set(world.manifest.id, world)
  }

  /** 获取世界实例 */
  get(worldId: string): WorldInstance | undefined {
    return this.worlds.get(worldId)
  }

  /** 获取所有已注册世界 */
  getAll(): WorldInstance[] {
    return Array.from(this.worlds.values())
  }

  /** 检查世界是否已注册 */
  has(worldId: string): boolean {
    return this.worlds.has(worldId)
  }

  /** 注销世界 */
  unregister(worldId: string): void {
    this.worlds.delete(worldId)
  }
}

/** 全局单例 */
export const worldRegistry = new WorldRegistryImpl()
