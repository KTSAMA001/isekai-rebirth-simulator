/**
 * WorldRegistry 单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { worldRegistry } from '@/engine/world/WorldRegistry'
import { makeWorld } from '../../helpers'

describe('WorldRegistry', () => {
  beforeEach(() => {
    // 清空注册表（注销所有已注册的世界）
    for (const w of worldRegistry.getAll()) {
      worldRegistry.unregister(w.manifest.id)
    }
  })

  describe('register() / get()', () => {
    it('注册并获取世界', () => {
      const world = makeWorld()
      worldRegistry.register(world)
      expect(worldRegistry.get('test-world')).toBe(world)
    })

    it('未注册的世界返回 undefined', () => {
      expect(worldRegistry.get('nonexistent')).toBeUndefined()
    })

    it('重复注册覆盖旧值', () => {
      const world1 = makeWorld()
      const world2 = makeWorld() // 相同 manifest.id
      worldRegistry.register(world1)
      worldRegistry.register(world2)
      expect(worldRegistry.get('test-world')).toBe(world2)
    })
  })

  describe('has()', () => {
    it('已注册返回 true', () => {
      worldRegistry.register(makeWorld())
      expect(worldRegistry.has('test-world')).toBe(true)
    })

    it('未注册返回 false', () => {
      expect(worldRegistry.has('nonexistent')).toBe(false)
    })
  })

  describe('getAll()', () => {
    it('返回所有已注册世界', () => {
      const world1 = makeWorld()
      worldRegistry.register(world1)
      expect(worldRegistry.getAll()).toHaveLength(1)
      expect(worldRegistry.getAll()[0]).toBe(world1)
    })

    it('空注册表返回空数组', () => {
      expect(worldRegistry.getAll()).toHaveLength(0)
    })
  })

  describe('unregister()', () => {
    it('注销已注册世界', () => {
      worldRegistry.register(makeWorld())
      expect(worldRegistry.has('test-world')).toBe(true)
      worldRegistry.unregister('test-world')
      expect(worldRegistry.has('test-world')).toBe(false)
    })

    it('注销不存在的世界不报错', () => {
      expect(() => worldRegistry.unregister('nonexistent')).not.toThrow()
    })
  })
})
