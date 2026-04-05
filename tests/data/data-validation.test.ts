/**
 * 数据验证测试 — 验证所有 JSON 数据文件的结构完整性
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'

const DATA_DIR = resolve(__dirname, '../../data/sword-and-magic')

function loadJson(filename: string) {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'))
}

function loadEventsDir(): any[] {
  const eventsDir = join(DATA_DIR, 'events')
  const files = readdirSync(eventsDir).filter(f => f.endsWith('.json'))
  const allEvents: any[] = []
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(eventsDir, file), 'utf-8'))
    allEvents.push(...data)
  }
  return allEvents
}

describe('数据文件校验', () => {
  describe('manifest.json', () => {
    it('存在且结构正确', () => {
      const manifest = loadJson('manifest.json')
      expect(manifest.id).toBeDefined()
      expect(manifest.name).toBeDefined()
      expect(typeof manifest.maxAge).toBe('number')
      expect(typeof manifest.initialPoints).toBe('number')
      expect(typeof manifest.talentDraftCount).toBe('number')
      expect(typeof manifest.talentSelectCount).toBe('number')
      expect(manifest.files).toBeDefined()
      expect(manifest.files.attributes).toBeDefined()
      expect(manifest.files.talents).toBeDefined()
      expect(manifest.files.events).toBeDefined()
      expect(manifest.files.achievements).toBeDefined()
    })
  })

  describe('attributes.json', () => {
    let attributes: any[]

    beforeAll(() => {
      attributes = loadJson('attributes.json')
    })

    it('是非空数组', () => {
      expect(Array.isArray(attributes)).toBe(true)
      expect(attributes.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const attr of attributes) {
        expect(attr.id).toBeDefined()
        expect(attr.name).toBeDefined()
        expect(typeof attr.min).toBe('number')
        expect(typeof attr.max).toBe('number')
        expect(typeof attr.defaultValue).toBe('number')
        expect(attr.min).toBeLessThanOrEqual(attr.max)
        expect(attr.defaultValue).toBeGreaterThanOrEqual(attr.min)
        expect(attr.defaultValue).toBeLessThanOrEqual(attr.max)
      }
    })

    it('无重复ID', () => {
      const ids = attributes.map((a: any) => a.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('talents.json', () => {
    let talents: any[]

    beforeAll(() => {
      talents = loadJson('talents.json')
    })

    it('是非空数组', () => {
      expect(Array.isArray(talents)).toBe(true)
      expect(talents.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const t of talents) {
        expect(t.id).toBeDefined()
        expect(t.name).toBeDefined()
        expect(['common', 'rare', 'legendary']).toContain(t.rarity)
        expect(Array.isArray(t.effects)).toBe(true)
      }
    })

    it('无重复ID', () => {
      const ids = talents.map((t: any) => t.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('互斥引用的天赋存在', () => {
      const idSet = new Set(talents.map((t: any) => t.id))
      for (const t of talents) {
        if (t.mutuallyExclusive) {
          for (const exId of t.mutuallyExclusive) {
            expect(idSet.has(exId)).toBe(true)
          }
        }
      }
    })

    it('出身类天赋都属于同一 exclusiveGroup', () => {
      const originIds = [
        'peasant_birth', 'town_kid', 'apprentice', 'forest_child', 'merchant_blood',
        'noble_born', 'orphan', 'street_rascal', 'monastery_upbringing', 'fisherman_child',
        'traveling_minstrel', 'blacksmith_apprentice', 'healer_lineage', 'stable_boy', 'tavern_child',
      ]
      for (const id of originIds) {
        const talent = talents.find((t: any) => t.id === id)
        expect(talent).toBeDefined()
        expect(talent.exclusiveGroup).toBe('origin')
      }
    })
  })

  describe('events (全部事件文件)', () => {
    let allEvents: any[]

    beforeAll(() => {
      allEvents = loadEventsDir()
    })

    it('事件总数 > 0', () => {
      expect(allEvents.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const e of allEvents) {
        expect(e.id).toBeDefined()
        expect(e.title).toBeDefined()
        expect(typeof e.minAge).toBe('number')
        expect(typeof e.maxAge).toBe('number')
        expect(typeof e.weight).toBe('number')
        expect(e.weight).toBeGreaterThan(0)
        expect(e.minAge).toBeLessThanOrEqual(e.maxAge)
        expect(Array.isArray(e.effects)).toBe(true)
      }
    })

    it('无重复ID', () => {
      const ids = allEvents.map((e: any) => e.id)
      const duplicates = ids.filter((id: string, i: number) => ids.indexOf(id) !== i)
      expect(duplicates).toEqual([])
    })

    it('出生事件存在且 minAge/maxAge 正确', () => {
      const birthEvents = allEvents.filter((e: any) => e.id.startsWith('birth_'))
      expect(birthEvents.length).toBeGreaterThan(0)
      for (const be of birthEvents) {
        expect(be.minAge).toBeLessThanOrEqual(1)
        expect(be.maxAge).toBeLessThanOrEqual(1)
      }
    })

    it('分支事件结构正确', () => {
      const branchEvents = allEvents.filter((e: any) => e.branches && e.branches.length > 0)
      for (const e of branchEvents) {
        for (const b of e.branches) {
          expect(b.id).toBeDefined()
          expect(b.title).toBeDefined()
          expect(Array.isArray(b.effects)).toBe(true)
        }
      }
    })

    it('事件效果 type 都是合法值', () => {
      const validTypes = new Set([
        'modify_attribute', 'set_attribute', 'add_talent', 'trigger_event',
        'set_flag', 'remove_flag', 'modify_hp', 'set_counter',
        'modify_counter', 'grant_item', 'modify_max_hp_bonus',
      ])
      for (const e of allEvents) {
        for (const fx of e.effects) {
          expect(validTypes.has(fx.type)).toBe(true)
        }
        if (e.branches) {
          for (const b of e.branches) {
            for (const fx of b.effects) {
              expect(validTypes.has(fx.type)).toBe(true)
            }
          }
        }
      }
    })

    it('种族变体引用的种族合理', () => {
      const races = loadJson('races.json') as any[]
      const raceIds = new Set(races.map((r: any) => r.id))
      for (const e of allEvents) {
        if (e.raceVariants) {
          for (const raceId of Object.keys(e.raceVariants)) {
            expect(raceIds.has(raceId)).toBe(true)
          }
        }
      }
    })

    it('双胞胎出生事件需要双生魂天赋', () => {
      const twinEvent = allEvents.find((e: any) => e.id === 'human_twin_birth')
      expect(twinEvent).toBeDefined()
      expect(twinEvent.include).toContain('has.talent.twin_souls')
    })

    it('parent 状态既可由婚后生育获得，也可由收养获得', () => {
      const childbirthEvent = allEvents.find((e: any) => e.id === 'adult_first_child')
      expect(childbirthEvent).toBeDefined()
      expect(childbirthEvent.include).toContain('has.flag.married')
      expect(childbirthEvent.exclude).toContain('has.flag.parent')
      expect(childbirthEvent.effects.some((fx: any) => fx.type === 'set_flag' && fx.target === 'parent')).toBe(true)

      const adoptEvent = allEvents.find((e: any) => e.id === 'mid_adopt_orphan')
      const adoptBranch = adoptEvent?.branches?.find((branch: any) => branch.id === 'adopt_take')
      expect(adoptBranch).toBeDefined()
      expect(adoptBranch.effects.some((fx: any) => fx.type === 'set_flag' && fx.target === 'parent')).toBe(true)
    })

    it('家庭相关晚年事件必须要求 parent 状态', () => {
      const peacefulEnd = allEvents.find((e: any) => e.id === 'peaceful_end')
      const grandchildStory = allEvents.find((e: any) => e.id === 'human_grandchild_story')
      const familyPhoto = allEvents.find((e: any) => e.id === 'human_family_photo')
      const grandchildLaughter = allEvents.find((e: any) => e.id === 'human_grandchild_laughter')

      expect(peacefulEnd.include).toContain('has.flag.parent')
      expect(grandchildStory.include).toBe('has.flag.parent')
      expect(familyPhoto.include).toBe('has.flag.parent')
      expect(grandchildLaughter.include).toBe('has.flag.parent')
    })

    it('明确年龄语义事件不能被跨种族年龄缩放扭曲', () => {
      const centenarianEvent = allEvents.find((e: any) => e.id === 'centenarian_celebration')
      const midlifeReview = allEvents.find((e: any) => e.id === 'mid_legacy_review')

      expect(centenarianEvent).toBeDefined()
      expect(centenarianEvent.races).toEqual(['human'])
      expect(centenarianEvent.minAge).toBe(100)
      expect(centenarianEvent.maxAge).toBe(100)
      expect(centenarianEvent.include).toBe('age == 100')

      expect(midlifeReview).toBeDefined()
      expect(midlifeReview.description).not.toContain('五十岁')
      expect(midlifeReview.raceVariants?.elf?.description).toContain('人生的中段')
    })

    it('独自降生与童年照料者文案保持一致', () => {
      const stealSweets = allEvents.find((e: any) => e.id === 'steal_sweets')
      const birthFile = loadJson('events/birth.json')
      const wildBirth = birthFile
        .flatMap((event: any) => event.branches ?? [])
        .find((branch: any) => branch.id === 'wild_orphan')

      expect(wildBirth).toBeDefined()
      expect(wildBirth.successText).toContain('新的家')
      expect(stealSweets).toBeDefined()
      expect(stealSweets.description).toContain('照顾你的大人')
      expect(stealSweets.description).not.toContain('妈妈')
    })
  })

  describe('achievements.json', () => {
    let achievements: any[]

    beforeAll(() => {
      achievements = loadJson('achievements.json')
    })

    it('是非空数组', () => {
      expect(Array.isArray(achievements)).toBe(true)
      expect(achievements.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const a of achievements) {
        expect(a.id).toBeDefined()
        expect(a.name).toBeDefined()
        expect(typeof a.condition).toBe('string')
        expect(a.condition.length).toBeGreaterThan(0)
        expect(a.category).toBeDefined()
      }
    })

    it('无重复ID', () => {
      const ids = achievements.map((a: any) => a.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('条件字符串可被 DSL 解析', async () => {
      const { ConditionDSL } = await import('@/engine/modules/ConditionDSL')
      const dsl = new ConditionDSL()
      for (const a of achievements) {
        // 解析应不抛异常
        expect(() => dsl.parse(a.condition)).not.toThrow()
      }
    })
  })

  describe('races.json', () => {
    let races: any[]

    beforeAll(() => {
      races = loadJson('races.json')
    })

    it('是非空数组', () => {
      expect(Array.isArray(races)).toBe(true)
      expect(races.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const r of races) {
        expect(r.id).toBeDefined()
        expect(r.name).toBeDefined()
        expect(Array.isArray(r.lifespanRange)).toBe(true)
        expect(r.lifespanRange).toHaveLength(2)
        expect(r.lifespanRange[0]).toBeLessThanOrEqual(r.lifespanRange[1])
        expect(typeof r.playable).toBe('boolean')
      }
    })

    it('无重复ID', () => {
      const ids = races.map((r: any) => r.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('专属天赋引用存在', () => {
      const talents = loadJson('talents.json') as any[]
      const talentIds = new Set(talents.map((t: any) => t.id))
      for (const r of races) {
        if (r.exclusiveTalents) {
          for (const tid of r.exclusiveTalents) {
            expect(talentIds.has(tid)).toBe(true)
          }
        }
        if (r.genderModifiers) {
          for (const gm of r.genderModifiers) {
            if (gm.exclusiveTalents) {
              for (const tid of gm.exclusiveTalents) {
                expect(talentIds.has(tid)).toBe(true)
              }
            }
          }
        }
      }
    })
  })

  describe('presets.json', () => {
    let presets: any[]

    beforeAll(() => {
      presets = loadJson('presets.json')
    })

    it('是非空数组', () => {
      expect(Array.isArray(presets)).toBe(true)
      expect(presets.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const p of presets) {
        expect(p.id).toBeDefined()
        expect(p.name).toBeDefined()
        expect(typeof p.locked).toBe('boolean')
      }
    })

    it('无重复ID', () => {
      const ids = presets.map((p: any) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('items.json', () => {
    let items: any[]

    beforeAll(() => {
      items = loadJson('items.json')
    })

    it('是非空数组', () => {
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)
    })

    it('每项包含必要字段', () => {
      for (const item of items) {
        expect(item.id).toBeDefined()
        expect(item.name).toBeDefined()
        expect(['common', 'rare', 'legendary']).toContain(item.rarity)
        expect(Array.isArray(item.effects)).toBe(true)
      }
    })

    it('无重复ID', () => {
      const ids = items.map((i: any) => i.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('rules.json', () => {
    it('结构正确', () => {
      const rules = loadJson('rules.json')
      expect(rules.grades).toBeDefined()
      expect(Array.isArray(rules.grades)).toBe(true)
      expect(rules.grades.length).toBeGreaterThan(0)
      for (const g of rules.grades) {
        expect(typeof g.minScore).toBe('number')
        expect(g.grade).toBeDefined()
        expect(g.title).toBeDefined()
      }
    })
  })

  describe('跨文件引用完整性', () => {
    it('事件中 grant_item 引用的物品存在', () => {
      const allEvents = loadEventsDir()
      const items = loadJson('items.json') as any[]
      const itemIds = new Set(items.map((i: any) => i.id))

      for (const e of allEvents) {
        for (const fx of e.effects) {
          if (fx.type === 'grant_item') {
            expect(itemIds.has(fx.target)).toBe(true)
          }
        }
        if (e.branches) {
          for (const b of e.branches) {
            for (const fx of b.effects) {
              if (fx.type === 'grant_item') {
                expect(itemIds.has(fx.target)).toBe(true)
              }
            }
          }
        }
      }
    })

    it('事件中 trigger_event 引用的事件存在', () => {
      const allEvents = loadEventsDir()
      const eventIds = new Set(allEvents.map((e: any) => e.id))

      for (const e of allEvents) {
        for (const fx of e.effects) {
          if (fx.type === 'trigger_event') {
            expect(eventIds.has(fx.target)).toBe(true)
          }
        }
        if (e.branches) {
          for (const b of e.branches) {
            for (const fx of b.effects) {
              if (fx.type === 'trigger_event') {
                expect(eventIds.has(fx.target)).toBe(true)
              }
            }
          }
        }
      }
    })

    it('事件中 modify_attribute 引用的属性存在', () => {
      const allEvents = loadEventsDir()
      const attributes = loadJson('attributes.json') as any[]
      const attrIds = new Set(attributes.map((a: any) => a.id))

      for (const e of allEvents) {
        for (const fx of e.effects) {
          if (fx.type === 'modify_attribute' || fx.type === 'set_attribute') {
            expect(attrIds.has(fx.target)).toBe(true)
          }
        }
      }
    })
  })
})
