import { describe, it, expect } from 'vitest'
import { TalentModule } from '@/engine/modules/TalentModule'
import { RandomProvider } from '@/engine/core/RandomProvider'
import { makeWorld, makeTalent, makeRace, makeState } from '../../helpers'

function createModule(talents: ReturnType<typeof makeTalent>[], options?: {
  races?: ReturnType<typeof makeRace>[]
  presets?: { id: string; name: string; title: string; description: string; attributes: Record<string, number>; locked: boolean; exclusiveTalents?: string[] }[]
}, seed = 42) {
  const world = makeWorld({ talents, races: options?.races, presets: options?.presets ?? [] })
  return new TalentModule(world, new RandomProvider(seed))
}

describe('TalentModule', () => {
  describe('draftTalents()', () => {
    it('从可用池中抽取指定数量天赋', () => {
      const talents = Array.from({ length: 20 }, (_, i) => makeTalent(`t${i}`))
      const mod = createModule(talents)
      const { drafted } = mod.draftTalents([], [], 5)
      expect(drafted).toHaveLength(5)
      // 全部是有效天赋ID
      for (const id of drafted) {
        expect(talents.some(t => t.id === id)).toBe(true)
      }
    })

    it('排除已继承天赋', () => {
      const talents = [makeTalent('t1'), makeTalent('t2'), makeTalent('t3')]
      const mod = createModule(talents)
      const { drafted } = mod.draftTalents([], ['t1'], 3)
      // t1 应作为继承天赋加入，不从普通池中抽
      expect(drafted).toContain('t1')
    })

    it('种族专属天赋保底加入', () => {
      const talents = [
        makeTalent('normal1'),
        makeTalent('normal2'),
        makeTalent('elf_exclusive'),
      ]
      const races = [makeRace('elf', { exclusiveTalents: ['elf_exclusive'] })]
      const mod = createModule(talents, { races })
      const { drafted } = mod.draftTalents([], [], 5, 'elf')
      expect(drafted).toContain('elf_exclusive')
    })

    it('性别专属天赋保底加入', () => {
      const talents = [
        makeTalent('normal1'),
        makeTalent('female_talent'),
      ]
      const races = [makeRace('human', {
        genderModifiers: [{ gender: 'female', exclusiveTalents: ['female_talent'] }],
      })]
      const mod = createModule(talents, { races })
      const { drafted } = mod.draftTalents([], [], 5, 'human', 'female')
      expect(drafted).toContain('female_talent')
    })

    it('预设专属天赋保底加入', () => {
      const talents = [
        makeTalent('normal1'),
        makeTalent('noble_talent'),
      ]
      const presets = [{
        id: 'noble',
        name: '贵族',
        title: '',
        description: '',
        attributes: {},
        locked: false,
        exclusiveTalents: ['noble_talent'],
      }]
      const mod = createModule(talents, { presets })
      const { drafted } = mod.draftTalents([], [], 5, undefined, undefined, 'noble')
      expect(drafted).toContain('noble_talent')
    })

    it('种族白名单过滤', () => {
      const talents = [
        makeTalent('elf_only', { requireRace: ['elf'] }),
        makeTalent('universal'),
      ]
      const mod = createModule(talents)
      const { drafted } = mod.draftTalents([], [], 5, 'human')
      // elf_only 不应该出现在人类的抽取池中
      expect(drafted).not.toContain('elf_only')
    })

    it('性别限定过滤', () => {
      const talents = [
        makeTalent('male_only', { requireGender: 'male' }),
        makeTalent('universal'),
      ]
      const mod = createModule(talents)
      const { drafted } = mod.draftTalents([], [], 5, undefined, 'female')
      expect(drafted).not.toContain('male_only')
    })
  })

  describe('selectTalents()', () => {
    it('选择指定数量的天赋', () => {
      const talents = [makeTalent('t1'), makeTalent('t2'), makeTalent('t3')]
      const mod = createModule(talents)
      const { selected } = mod.selectTalents(['t1', 't2', 't3'], ['t1', 't2'], 2)
      expect(selected).toEqual(['t1', 't2'])
    })

    it('超出最大数量时截断', () => {
      const talents = [makeTalent('t1'), makeTalent('t2'), makeTalent('t3')]
      const mod = createModule(talents)
      const { selected } = mod.selectTalents(['t1', 't2', 't3'], ['t1', 't2', 't3'], 2)
      expect(selected).toHaveLength(2)
    })

    it('互斥天赋：后选的被跳过', () => {
      const talents = [
        makeTalent('warrior', { mutuallyExclusive: ['mage'] }),
        makeTalent('mage', { mutuallyExclusive: ['warrior'] }),
      ]
      const mod = createModule(talents)
      const { selected, conflicts } = mod.selectTalents(['warrior', 'mage'], ['warrior', 'mage'], 3)
      expect(selected).toEqual(['warrior'])
      expect(conflicts.length).toBeGreaterThan(0)
    })

    it('反向互斥检查', () => {
      const talents = [
        makeTalent('a', { mutuallyExclusive: ['b'] }),
        makeTalent('b'),
      ]
      const mod = createModule(talents)
      const { selected, conflicts } = mod.selectTalents(['a', 'b'], ['a', 'b'], 3)
      expect(selected).toEqual(['a'])
      expect(conflicts.length).toBeGreaterThan(0)
    })

    it('同 exclusiveGroup 的天赋只能选择一个', () => {
      const talents = [
        makeTalent('origin_a', { exclusiveGroup: 'origin' }),
        makeTalent('origin_b', { exclusiveGroup: 'origin' }),
        makeTalent('normal'),
      ]
      const mod = createModule(talents)
      const { selected, conflicts } = mod.selectTalents(['origin_a', 'origin_b', 'normal'], ['origin_a', 'origin_b', 'normal'], 3)
      expect(selected).toEqual(['origin_a', 'normal'])
      expect(conflicts.length).toBeGreaterThan(0)
    })
  })

  describe('getActiveEffects()', () => {
    it('返回当前年龄的触发效果', () => {
      const talents = [
        makeTalent('t1', {
          effects: [
            { type: 'trigger_on_age', target: 'str', age: 10, value: 3, description: '+3 str' },
            { type: 'trigger_on_age', target: 'int', age: 20, value: 2, description: '+2 int' },
          ],
        }),
      ]
      const mod = createModule(talents)
      const state = makeState()
      const effects = mod.getActiveEffects(['t1'], 10, state)
      expect(effects).toHaveLength(1)
      expect(effects[0].age).toBe(10)
    })

    it('无匹配年龄时返回空', () => {
      const talents = [
        makeTalent('t1', {
          effects: [{ type: 'trigger_on_age', target: 'str', age: 50, value: 1, description: '' }],
        }),
      ]
      const mod = createModule(talents)
      const effects = mod.getActiveEffects(['t1'], 10, makeState())
      expect(effects).toHaveLength(0)
    })
  })

  describe('getImmediateEffects()', () => {
    it('返回属性修改效果', () => {
      const talents = [
        makeTalent('t1', {
          effects: [{ type: 'modify_attribute', target: 'str', value: 5, description: '' }],
        }),
      ]
      const mod = createModule(talents)
      const mods = mod.getImmediateEffects(['t1'])
      expect(mods).toEqual([{ attribute: 'str', value: 5 }])
    })

    it('忽略非 modify_attribute 效果', () => {
      const talents = [
        makeTalent('t1', {
          effects: [
            { type: 'trigger_on_age', target: 'str', age: 10, value: 1, description: '' },
            { type: 'modify_attribute', target: 'int', value: 2, description: '' },
          ],
        }),
      ]
      const mod = createModule(talents)
      const mods = mod.getImmediateEffects(['t1'])
      expect(mods).toHaveLength(1)
      expect(mods[0].attribute).toBe('int')
    })
  })

  describe('getInheritable()', () => {
    it('返回可继承天赋', () => {
      const talents = [
        makeTalent('t1', { inheritable: true }),
        makeTalent('t2', { inheritable: false }),
        makeTalent('t3'),
      ]
      const mod = createModule(talents)
      const inheritable = mod.getInheritable(['t1', 't2', 't3'])
      expect(inheritable).toEqual(['t1'])
    })
  })
})
