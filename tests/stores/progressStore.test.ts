import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useProgressStore } from '@/stores/progressStore'

const storage = new Map<string, string>()

const localStorageMock = {
  getItem(key: string) {
    return storage.has(key) ? storage.get(key)! : null
  },
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
  removeItem(key: string) {
    storage.delete(key)
  },
  clear() {
    storage.clear()
  },
}

describe('progressStore', () => {
  beforeEach(() => {
    storage.clear()
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', localStorageMock)
  })

  it('漆黑之子在解锁世界破坏者成就后可用', () => {
    const store = useProgressStore()
    store.recordGameCompletion('play-1', ['dark_lord_ach'])

    expect(store.isPresetUnlocked('worldbreaker_preset', 96)).toBe(true)
  })

  it('漆黑之子在解锁终焉与新生成就后可用', () => {
    const store = useProgressStore()
    store.recordGameCompletion('play-1', ['world_breaker_ach'])

    expect(store.isPresetUnlocked('worldbreaker_preset', 96)).toBe(true)
  })

  it('未达成终焉线成就时仍保持锁定', () => {
    const store = useProgressStore()
    store.recordGameCompletion('play-1', ['dragon_slayer_ach', 'mage_path'])

    expect(store.isPresetUnlocked('worldbreaker_preset', 96)).toBe(false)
  })
})