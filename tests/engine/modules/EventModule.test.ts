import { describe, it, expect } from 'vitest'
import { EventModule } from '@/engine/modules/EventModule'
import { AttributeModule } from '@/engine/modules/AttributeModule'
import { ItemModule } from '@/engine/modules/ItemModule'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'
import { RandomProvider } from '@/engine/core/RandomProvider'
import { makeWorld, makeEvent, makeState } from '../../helpers'

function createModule(events: ReturnType<typeof makeEvent>[], seed = 42) {
  const world = makeWorld({ events })
  const rng = new RandomProvider(seed)
  const dsl = new ConditionDSL()
  const attrMod = new AttributeModule(world)
  const itemMod = new ItemModule(world, dsl)
  return { module: new EventModule(world, rng, dsl, attrMod, itemMod), world }
}

describe('EventModule', () => {
  describe('getCandidates()', () => {
    it('只返回当前年龄范围内的事件', () => {
      const events = [
        makeEvent('e1', { minAge: 1, maxAge: 10 }),
        makeEvent('e2', { minAge: 20, maxAge: 30 }),
        makeEvent('e3', { minAge: 1, maxAge: 100 }),
      ]
      const { module } = createModule(events)
      const state = makeState({ age: 5 })
      const candidates = module.getCandidates(5, state)
      expect(candidates.map(e => e.id)).toContain('e1')
      expect(candidates.map(e => e.id)).not.toContain('e2')
      expect(candidates.map(e => e.id)).toContain('e3')
    })

    it('unique 事件不会重复触发', () => {
      const events = [makeEvent('e_unique', { unique: true })]
      const { module } = createModule(events)
      const state = makeState({ triggeredEvents: new Set(['e_unique']) })
      const candidates = module.getCandidates(5, state)
      expect(candidates).toHaveLength(0)
    })

    it('种族过滤', () => {
      const events = [
        makeEvent('e_human', { races: ['human'] }),
        makeEvent('e_elf', { races: ['elf'] }),
        makeEvent('e_all'),
      ]
      const { module } = createModule(events)
      const state = makeState({ character: { name: '测试', race: 'human', gender: 'male' } })
      const candidates = module.getCandidates(5, state)
      expect(candidates.map(e => e.id)).toContain('e_human')
      expect(candidates.map(e => e.id)).not.toContain('e_elf')
      expect(candidates.map(e => e.id)).toContain('e_all')
    })

    it('性别过滤', () => {
      const events = [
        makeEvent('e_male', { genders: ['male'] }),
        makeEvent('e_female', { genders: ['female'] }),
      ]
      const { module } = createModule(events)
      const state = makeState({ character: { name: '测试', race: 'human', gender: 'male' } })
      const candidates = module.getCandidates(5, state)
      expect(candidates.map(e => e.id)).toContain('e_male')
      expect(candidates.map(e => e.id)).not.toContain('e_female')
    })

    it('include 条件过滤', () => {
      const events = [
        makeEvent('e_brave', { include: 'has.talent.brave' }),
      ]
      const { module } = createModule(events)
      const stateWithTalent = makeState({ talents: { selected: ['brave'], draftPool: [], inherited: [] } })
      const stateWithout = makeState()
      expect(module.getCandidates(5, stateWithTalent)).toHaveLength(1)
      expect(module.getCandidates(5, stateWithout)).toHaveLength(0)
    })

    it('exclude 条件过滤', () => {
      const events = [
        makeEvent('e1', { exclude: 'flag:dead' }),
      ]
      const { module } = createModule(events)
      const stateAlive = makeState()
      const stateDead = makeState({ flags: new Set(['dead']) })
      expect(module.getCandidates(5, stateAlive)).toHaveLength(1)
      expect(module.getCandidates(5, stateDead)).toHaveLength(0)
    })

    it('按优先级排序', () => {
      const events = [
        makeEvent('e_minor', { priority: 'minor', weight: 100 }),
        makeEvent('e_critical', { priority: 'critical', weight: 1 }),
        makeEvent('e_major', { priority: 'major', weight: 50 }),
      ]
      const { module } = createModule(events)
      const candidates = module.getCandidates(5, makeState())
      expect(candidates[0].id).toBe('e_critical')
      expect(candidates[1].id).toBe('e_major')
      expect(candidates[2].id).toBe('e_minor')
    })
  })

  describe('年龄缩放', () => {
    it('出生事件 (maxAge<=1) 不缩放', () => {
      const events = [makeEvent('birth', { minAge: 0, maxAge: 1 })]
      const { module } = createModule(events)
      // 哥布林寿命 30，缩放比例 30/85 ≈ 0.35
      const state = makeState({ age: 1, effectiveMaxAge: 30, character: { name: '测试', race: 'goblin' } })
      const candidates = module.getCandidates(1, state)
      expect(candidates).toHaveLength(1) // 不缩放，age=1 仍在 [0,1] 范围
    })

    it('通用事件使用绝对年龄范围', () => {
      // 新版使用生命阶段系统，通用事件不再按寿命比例缩放
      const events = [makeEvent('adult_event', { minAge: 20, maxAge: 30 })]
      const { module } = createModule(events)
      // age=120 超出了 [20, 30]，不匹配
      const state = makeState({ age: 120, effectiveMaxAge: 500, character: { name: '测试', race: 'elf' } })
      expect(module.getCandidates(120, state)).toHaveLength(0)
      // age=25 在 [20, 30] 内，匹配
      expect(module.getCandidates(25, state)).toHaveLength(1)
    })
  })

  describe('pickEvent()', () => {
    it('空候选列表返回 null', () => {
      const { module } = createModule([])
      expect(module.pickEvent([])).toBeNull()
    })

    it('按权重选择事件', () => {
      const events = [
        makeEvent('high', { weight: 1000 }),
        makeEvent('low', { weight: 1 }),
      ]
      const { module } = createModule(events)
      const counts: Record<string, number> = { high: 0, low: 0 }
      for (let seed = 0; seed < 200; seed++) {
        const { module: mod } = createModule(events, seed)
        const picked = mod.pickEvent(events)
        if (picked) counts[picked.id]++
      }
      expect(counts.high).toBeGreaterThan(counts.low)
    })
  })

  describe('resolveEvent()', () => {
    it('执行事件效果并记录日志', () => {
      const events = [
        makeEvent('e1', {
          effects: [{ type: 'modify_attribute', target: 'str', value: 3, description: 'str+3' }],
        }),
      ]
      const { module } = createModule(events)
      const state = makeState()
      const newState = module.resolveEvent(events[0], state)
      expect(newState.attributes.str).toBe(8) // 5 + 3
      expect(newState.eventLog).toHaveLength(1)
      expect(newState.eventLog[0].eventId).toBe('e1')
      expect(newState.triggeredEvents.has('e1')).toBe(true)
    })

    it('不修改原状态', () => {
      const events = [
        makeEvent('e1', {
          effects: [{ type: 'modify_attribute', target: 'str', value: 10, description: '' }],
        }),
      ]
      const { module } = createModule(events)
      const state = makeState()
      module.resolveEvent(events[0], state)
      expect(state.attributes.str).toBe(5) // 原状态不变
    })

    it('set_flag 效果', () => {
      const events = [
        makeEvent('e1', {
          effects: [{ type: 'set_flag', target: 'married', value: 0, description: '结婚了' }],
        }),
      ]
      const { module } = createModule(events)
      const newState = module.resolveEvent(events[0], makeState())
      expect(newState.flags.has('married')).toBe(true)
    })

    it('modify_hp 效果', () => {
      const events = [
        makeEvent('e1', {
          effects: [{ type: 'modify_hp', target: 'hp', value: -20, description: '' }],
        }),
      ]
      const { module } = createModule(events)
      const newState = module.resolveEvent(events[0], makeState({ hp: 100 }))
      expect(newState.hp).toBe(80)
    })

    it('HP 不会低于 0', () => {
      const events = [
        makeEvent('e1', {
          effects: [{ type: 'modify_hp', target: 'hp', value: -200, description: '' }],
        }),
      ]
      const { module } = createModule(events)
      const newState = module.resolveEvent(events[0], makeState({ hp: 50 }))
      expect(newState.hp).toBeGreaterThanOrEqual(0)
    })

    it('set_counter / modify_counter 效果', () => {
      const events = [
        makeEvent('e1', {
          effects: [
            { type: 'set_counter', target: 'kills', value: 5, description: '' },
          ],
        }),
      ]
      const { module } = createModule(events)
      const newState = module.resolveEvent(events[0], makeState())
      expect(newState.counters.get('kills')).toBe(5)
    })

    it('分支事件：无选择时设置 pendingBranch', () => {
      const events = [
        makeEvent('e1', {
          branches: [
            { id: 'b1', title: '选择A', description: '', effects: [{ type: 'modify_hp', target: 'hp', value: 10, description: '' }] },
            { id: 'b2', title: '选择B', description: '', effects: [{ type: 'modify_hp', target: 'hp', value: -10, description: '' }] },
          ],
        }),
      ]
      const { module } = createModule(events)
      const newState = module.resolveEvent(events[0], makeState())
      expect(newState.pendingBranch).toBeDefined()
      expect(newState.pendingBranch!.eventId).toBe('e1')
      expect(newState.pendingBranch!.branches).toHaveLength(2)
    })

    it('分支事件：选择分支时应用分支效果', () => {
      const events = [
        makeEvent('e1', {
          branches: [
            { id: 'b1', title: '选择A', description: '', effects: [{ type: 'modify_attribute', target: 'str', value: 5, description: '' }] },
          ],
        }),
      ]
      const { module } = createModule(events)
      const newState = module.resolveEvent(events[0], makeState(), 'b1')
      expect(newState.attributes.str).toBe(10) // 5 + 5
    })

    it('种族变体覆盖文本和效果', () => {
      const events = [
        makeEvent('e1', {
          title: '通用标题',
          description: '通用描述',
          effects: [{ type: 'modify_attribute', target: 'str', value: 1, description: '' }],
          raceVariants: {
            elf: {
              title: '精灵标题',
              description: '精灵描述',
              effects: [{ type: 'modify_attribute', target: 'mag', value: 3, description: '' }],
            },
          },
        }),
      ]
      const { module } = createModule(events)
      const state = makeState({ character: { name: '测试', race: 'elf', gender: 'male' } })
      const newState = module.resolveEvent(events[0], state)
      // 精灵变体的效果应替代通用效果
      expect(newState.eventLog[0].title).toBe('精灵标题')
      expect(newState.attributes.mag).toBe(8) // 5 + 3
    })

    it('性别变体覆盖文本', () => {
      const events = [
        makeEvent('e1', {
          title: '通用标题',
          genderVariants: {
            female: {
              title: '女性标题',
            },
          } as any,
        }),
      ]
      const { module } = createModule(events)
      const state = makeState({ character: { name: '测试', race: 'human', gender: 'female' } })
      const newState = module.resolveEvent(events[0], state)
      expect(newState.eventLog[0].title).toBe('女性标题')
    })
  })

  describe('applyEffectsOnState()', () => {
    it('概率效果：probability=0 不触发', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState()
      const texts = module.applyEffectsOnState(
        [{ type: 'modify_attribute', target: 'str', value: 10, probability: 0, description: '' }],
        state
      )
      expect(state.attributes.str).toBe(5) // 未改变
    })

    it('条件效果：条件不满足不触发', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState()
      module.applyEffectsOnState(
        [{ type: 'modify_attribute', target: 'str', value: 10, condition: 'age>=50', description: '' }],
        state
      )
      expect(state.attributes.str).toBe(5) // age=1 不满足
    })

    it('条件效果：条件满足时触发', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState({ age: 50 })
      module.applyEffectsOnState(
        [{ type: 'modify_attribute', target: 'str', value: 3, condition: 'age>=50', description: '+3体魄' }],
        state
      )
      expect(state.attributes.str).toBe(8)
    })

    it('modify_max_hp_bonus 效果', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState({ maxHpBonus: 0 })
      module.applyEffectsOnState(
        [{ type: 'modify_max_hp_bonus', target: 'hp_max', value: 10, description: '' }],
        state
      )
      expect(state.maxHpBonus).toBe(10)
    })

    it('trigger_event 效果', () => {
      const events = [
        makeEvent('trigger_src'),
        makeEvent('triggered_evt', {
          effects: [{ type: 'modify_attribute', target: 'int', value: 2, description: '' }],
        }),
      ]
      const { module } = createModule(events)
      const state = makeState()
      module.applyEffectsOnState(
        [{ type: 'trigger_event', target: 'triggered_evt', value: 0, description: '' }],
        state
      )
      // trigger_event 应将目标事件的效果也应用
      expect(state.triggeredEvents.has('triggered_evt')).toBe(true)
    })

    it('set_counter 效果', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState()
      module.applyEffectsOnState(
        [{ type: 'set_counter', target: 'kills', value: 10, description: '' }],
        state
      )
      expect(state.counters.get('kills')).toBe(10)
    })

    it('modify_counter 效果', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState({ counters: new Map([['kills', 5]]) })
      module.applyEffectsOnState(
        [{ type: 'modify_counter', target: 'kills', value: 3, description: '' }],
        state
      )
      expect(state.counters.get('kills')).toBe(8)
    })

    it('多个效果按顺序应用', () => {
      const events = [makeEvent('dummy')]
      const { module } = createModule(events)
      const state = makeState()
      const texts = module.applyEffectsOnState(
        [
          { type: 'modify_attribute', target: 'str', value: 3, description: '力量+3' },
          { type: 'modify_attribute', target: 'int', value: 2, description: '智慧+2' },
          { type: 'set_flag', target: 'trained', value: 0, description: '受过训练' },
        ],
        state
      )
      expect(state.attributes.str).toBe(8)
      expect(state.attributes.int).toBe(7)
      expect(state.flags.has('trained')).toBe(true)
      expect(texts.length).toBeGreaterThan(0)
    })
  })

  describe('getCandidates() 高级过滤', () => {
    it('prerequisites 全部满足才通过', () => {
      const events = [
        makeEvent('quest', {
          prerequisites: ['has.talent.brave', 'attribute.str>=10'],
        }),
      ]
      const { module } = createModule(events)
      // 不满足
      const state1 = makeState({ talents: { selected: ['brave'], draftPool: [], inherited: [] } })
      expect(module.getCandidates(5, state1)).toHaveLength(0)
      // 满足
      const state2 = makeState({
        talents: { selected: ['brave'], draftPool: [], inherited: [] },
        attributes: { str: 10, int: 5, chr: 5, luk: 5, mag: 5 },
      })
      expect(module.getCandidates(5, state2)).toHaveLength(1)
    })

    it('mutuallyExclusive 已触发则排除', () => {
      const events = [
        makeEvent('path_a', {
          mutuallyExclusive: ['has.event.path_b'],
        }),
      ]
      const { module } = createModule(events)
      const state1 = makeState()
      expect(module.getCandidates(5, state1)).toHaveLength(1)
      const state2 = makeState({ triggeredEvents: new Set(['path_b']) })
      expect(module.getCandidates(5, state2)).toHaveLength(0)
    })
  })
})
