/**
 * WorldInstance 工厂函数测试
 */
import { describe, it, expect } from 'vitest'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import { makeAttributeDefs, makeScoringRule, makeTalent, makeEvent, makeAchievement, makeItem, makeRace } from '../../helpers'
import type { WorldManifest } from '@/engine/core/types'

function makeManifest(overrides?: Partial<WorldManifest>): WorldManifest {
  return {
    id: 'test',
    name: '测试世界',
    subtitle: '',
    description: '',
    version: '1.0',
    author: 'test',
    icon: '',
    banner: '',
    theme: { primary: '#000', secondary: '#fff', background: '#eee', text: '#333' },
    tags: [],
    maxAge: 100,
    initialPoints: 20,
    talentDraftCount: 10,
    talentSelectCount: 3,
    files: { attributes: '', talents: '', events: '', achievements: '', presets: '', rules: '' },
    ...overrides,
  }
}

describe('createWorldInstance()', () => {
  it('正确构建世界实例', () => {
    const attrs = makeAttributeDefs()
    const talents = [makeTalent('t1')]
    const events = [makeEvent('e1')]
    const achievements = [makeAchievement('a1', 'age>=1')]
    const items = [makeItem('i1')]
    const presets = [{ id: 'p1', name: '预设', description: '', icon: '', talents: [] }]
    const rule = makeScoringRule()
    const manifest = makeManifest()

    const world = createWorldInstance(manifest, attrs, talents, events, achievements, items, presets, rule)

    expect(world.manifest.id).toBe('test')
    expect(world.attributes).toBe(attrs)
    expect(world.talents).toBe(talents)
    expect(world.events).toBe(events)
    expect(world.achievements).toBe(achievements)
    expect(world.items).toBe(items)
    expect(world.presets).toBe(presets)
    expect(world.scoringRule).toBe(rule)
  })

  it('索引映射正确构建', () => {
    const attrs = makeAttributeDefs()
    const talents = [makeTalent('t1'), makeTalent('t2')]
    const events = [makeEvent('e1'), makeEvent('e2')]
    const items = [makeItem('i1')]

    const world = createWorldInstance(makeManifest(), attrs, talents, events, [], items, [], makeScoringRule())

    // 属性索引
    expect(world.index.attributesById.get('str')?.id).toBe('str')
    expect(world.index.attributesById.get('int')?.id).toBe('int')
    expect(world.index.attributesById.size).toBe(attrs.length)

    // 天赋索引
    expect(world.index.talentsById.get('t1')?.id).toBe('t1')
    expect(world.index.talentsById.size).toBe(2)

    // 事件索引
    expect(world.index.eventsById.get('e1')?.id).toBe('e1')
    expect(world.index.eventsById.size).toBe(2)

    // 物品索引
    expect(world.index.itemsById.get('i1')?.id).toBe('i1')
  })

  it('items 默认为空数组', () => {
    const world = createWorldInstance(
      makeManifest(),
      makeAttributeDefs(),
      [], [], [], undefined as any, [], makeScoringRule()
    )
    expect(world.items).toEqual([])
    expect(world.index.itemsById.size).toBe(0)
  })

  it('races 可选参数', () => {
    const races = [makeRace('elf')]
    const world = createWorldInstance(
      makeManifest(),
      makeAttributeDefs(),
      [], [], [], [], [], makeScoringRule(),
      races
    )
    expect(world.races).toBe(races)
  })

  it('重复 ID 后者覆盖前者', () => {
    const talents = [
      makeTalent('dup', { name: '第一个' }),
      makeTalent('dup', { name: '第二个' }),
    ]
    const world = createWorldInstance(
      makeManifest(),
      makeAttributeDefs(),
      talents, [], [], [], [], makeScoringRule()
    )
    expect(world.index.talentsById.get('dup')?.name).toBe('第二个')
  })

  it('空数据集不报错', () => {
    const world = createWorldInstance(
      makeManifest(),
      [], [], [], [], [], [], makeScoringRule()
    )
    expect(world.index.attributesById.size).toBe(0)
    expect(world.index.talentsById.size).toBe(0)
    expect(world.index.eventsById.size).toBe(0)
    expect(world.index.itemsById.size).toBe(0)
  })
})
