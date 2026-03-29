/**
 * 定向测试：grant_item 物品获取提示文本是否显示在 effectTexts 中
 * 场景：dragon_slay_attempt 的惨胜分支 → dragon_scale
 */
import { describe, it, expect } from 'vitest'
import { createSwordAndMagicWorld } from '../../src/worlds/sword-and-magic'
import { SimulationEngine } from '../../src/engine/core/SimulationEngine'
import type { WorldEventDef } from '../../src/engine/core/types'

describe('grant_item 提示文本', () => {
  it('resolveBranch 中 grant_item 的 acquireText 出现在 effectTexts', () => {
    const world = createSwordAndMagicWorld()
    const engine = new SimulationEngine(world, 42)

    // 初始化游戏
    engine.initGame('测试勇者')
    const drafted = engine.draftTalents()
    engine.selectTalents(drafted.slice(0, 2))
    // 分配属性：高体魄以满足 dragon_slay_attempt 的 include 条件（str >= 14）
    engine.allocateAttributes({ str: 14, mag: 0, spr: 0, chr: 0, mny: 0, lck: 0 })

    // 通过 (engine as any) 设置 pendingYearEvent 和状态，模拟 dragon_slay_attempt 已触发
    const dragonEvent = world.index.eventsById.get('dragon_slay_attempt') as WorldEventDef
    expect(dragonEvent).toBeDefined()

    // 手动设为 simulating 阶段 + 合适年龄 + pending 事件
    const state = engine.getState()
    const anyEngine = engine as any
    anyEngine.state = {
      ...state,
      age: 25,
      hp: 100,
      phase: 'simulating',
      triggeredEvents: new Set([...state.triggeredEvents, 'dragon_slay_attempt']),
    }
    anyEngine.pendingYearEvent = dragonEvent

    // 选择惨胜分支
    const result = engine.resolveBranch('dragon_near_death')

    // 验证：effectTexts 中包含龙鳞护符的获取提示
    expect(result.effectTexts).toBeDefined()
    expect(result.effectTexts!.length).toBeGreaterThan(0)
    expect(result.effectTexts!.some(t => t.includes('龙鳞护符'))).toBe(true)

    // 验证：物品确实被添加到 inventory
    const finalState = engine.getState()
    expect(finalState.inventory.items.some(s => s.itemId === 'dragon_scale')).toBe(true)
  })

  it('背包已满时 grant_item 失败消息也出现在 effectTexts', () => {
    const world = createSwordAndMagicWorld()
    const engine = new SimulationEngine(world, 42)

    engine.initGame('测试勇者')
    const drafted = engine.draftTalents()
    engine.selectTalents(drafted.slice(0, 2))
    engine.allocateAttributes({ str: 14, mag: 0, spr: 0, chr: 0, mny: 0, lck: 0 })

    const dragonEvent = world.index.eventsById.get('dragon_slay_attempt') as WorldEventDef
    expect(dragonEvent).toBeDefined()

    const state = engine.getState()
    const anyEngine = engine as any
    // 填满背包（maxSlots=3）
    anyEngine.state = {
      ...state,
      age: 25,
      hp: 100,
      phase: 'simulating',
      triggeredEvents: new Set([...state.triggeredEvents, 'dragon_slay_attempt']),
      inventory: {
        items: [
          { itemId: 'dummy1', acquiredAge: 20 },
          { itemId: 'dummy2', acquiredAge: 21 },
          { itemId: 'dummy3', acquiredAge: 22 },
        ],
        maxSlots: 3,
      },
    }
    anyEngine.pendingYearEvent = dragonEvent

    const result = engine.resolveBranch('dragon_near_death')

    // 验证：失败消息出现在 effectTexts
    expect(result.effectTexts).toBeDefined()
    expect(result.effectTexts!.some(t => t.includes('背包已满') || t.includes('已拥有'))).toBe(true)
  })
})
