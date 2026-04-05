/**
 * worldStore — 世界管理
 * 管理已注册的世界列表和当前选中的世界
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WorldInstance } from '@/engine/core/types'
import { worldRegistry } from '@/engine/world/WorldRegistry'

export const useWorldStore = defineStore('world', () => {
  const worlds = ref<WorldInstance[]>([])
  const currentWorldId = ref<string | null>(null)

  /** 初始化内置世界 */
  async function initBuiltinWorlds() {
    const { createSwordAndMagicWorld } = await import('@/worlds/sword-and-magic')
    const swordAndMagic = createSwordAndMagicWorld()
    worldRegistry.register(await swordAndMagic)
    worlds.value = worldRegistry.getAll()
  }

  /** 选择世界 */
  function selectWorld(worldId: string) {
    if (worldRegistry.has(worldId)) {
      currentWorldId.value = worldId
    }
  }

  /** 获取当前世界实例 */
  function getCurrentWorld(): WorldInstance | undefined {
    if (!currentWorldId.value) return undefined
    return worldRegistry.get(currentWorldId.value)
  }

  /** 按 ID 获取世界实例 */
  function getWorldById(worldId: string): WorldInstance | undefined {
    return worldRegistry.get(worldId)
  }

  return {
    worlds,
    currentWorldId,
    initBuiltinWorlds,
    selectWorld,
    getCurrentWorld,
    getWorldById,
  }
})
