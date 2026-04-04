import { describe, it, expect } from 'vitest'
import { cloneState } from '@/engine/core/stateUtils'
import { makeState } from '../../helpers'

describe('cloneState', () => {
  it('克隆后与原始值相等', () => {
    const state = makeState()
    const cloned = cloneState(state)
    // 基本属性检查
    expect(cloned.age).toBe(state.age)
    expect(cloned.hp).toBe(state.hp)
    expect(cloned.attributes).toEqual(state.attributes)
    expect(cloned.character).toEqual(state.character)
  })

  it('克隆对象是独立的（修改克隆不影响原始）', () => {
    const state = makeState({ attributes: { str: 10, int: 8 } })
    const cloned = cloneState(state)
    cloned.attributes.str = 20
    expect(state.attributes.str).toBe(10)
  })

  it('深克隆 Set 类型字段', () => {
    const state = makeState({ flags: new Set(['flag_a', 'flag_b']) })
    const cloned = cloneState(state)
    cloned.flags.add('flag_c')
    expect(state.flags.has('flag_c')).toBe(false)
    expect(cloned.flags.has('flag_c')).toBe(true)
  })

  it('深克隆 Map 类型字段', () => {
    const state = makeState({ counters: new Map([['kills', 5]]) })
    const cloned = cloneState(state)
    cloned.counters.set('kills', 99)
    expect(state.counters.get('kills')).toBe(5)
  })

  it('深克隆 triggeredEvents Set', () => {
    const state = makeState({ triggeredEvents: new Set(['evt_1']) })
    const cloned = cloneState(state)
    cloned.triggeredEvents.add('evt_2')
    expect(state.triggeredEvents.has('evt_2')).toBe(false)
  })

  it('深克隆数组字段（eventLog、talents）', () => {
    const state = makeState({
      eventLog: [{ age: 1, eventId: 'e1', title: '', description: '', effects: [] }],
      talents: { selected: ['t1'], draftPool: ['t2'], inherited: [] },
    })
    const cloned = cloneState(state)
    cloned.eventLog.push({ age: 2, eventId: 'e2', title: '', description: '', effects: [] })
    cloned.talents.selected.push('t3')
    expect(state.eventLog).toHaveLength(1)
    expect(state.talents.selected).toEqual(['t1'])
  })

  it('深克隆 achievements 字段', () => {
    const state = makeState({
      achievements: { unlocked: ['ach1'], progress: { ach2: 50 } },
    })
    const cloned = cloneState(state)
    cloned.achievements.unlocked.push('ach3')
    cloned.achievements.progress.ach2 = 100
    expect(state.achievements.unlocked).toEqual(['ach1'])
    expect(state.achievements.progress.ach2).toBe(50)
  })

  it('深克隆 inventory 字段', () => {
    const state = makeState({
      inventory: { items: [{ itemId: 'sword', acquiredAge: 10 }], maxSlots: 5 },
    })
    const cloned = cloneState(state)
    cloned.inventory.items.push({ itemId: 'shield', acquiredAge: 12 })
    expect(state.inventory.items).toHaveLength(1)
  })

  it('深克隆 pendingBranch', () => {
    const state = makeState({
      pendingBranch: {
        eventId: 'e1',
        eventTitle: '测试',
        eventDescription: '',
        branches: [
          { id: 'b1', title: '', description: '', effects: [{ type: 'modify_hp', target: 'hp', value: -10 }] },
        ],
      },
    })
    const cloned = cloneState(state)
    cloned.pendingBranch!.branches[0].effects.push({ type: 'set_flag', target: 'test', value: 0 })
    expect(state.pendingBranch!.branches[0].effects).toHaveLength(1)
  })

  it('pendingBranch 为 undefined 时正常处理', () => {
    const state = makeState({ pendingBranch: undefined })
    const cloned = cloneState(state)
    expect(cloned.pendingBranch).toBeUndefined()
  })
})
