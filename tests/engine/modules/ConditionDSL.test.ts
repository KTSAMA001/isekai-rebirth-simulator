import { describe, it, expect } from 'vitest'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'
import { makeState, makeWorld } from '../../helpers'

const dsl = new ConditionDSL()

function ctx(stateOverrides?: Parameters<typeof makeState>[0]) {
  return { state: makeState(stateOverrides), world: makeWorld() }
}

describe('ConditionDSL', () => {
  describe('基础运算', () => {
    it('空字符串返回 true', () => {
      expect(dsl.evaluate('', ctx())).toBe(true)
    })

    it('纯空格返回 true', () => {
      expect(dsl.evaluate('   ', ctx())).toBe(true)
    })
  })

  describe('属性比较', () => {
    it('attribute.str >= 5', () => {
      expect(dsl.evaluate('attribute.str>=5', ctx({ attributes: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(true)
    })

    it('attribute.str > 5 (5 不满足)', () => {
      expect(dsl.evaluate('attribute.str>5', ctx({ attributes: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(false)
    })

    it('attribute.str == 10', () => {
      expect(dsl.evaluate('attribute.str==10', ctx({ attributes: { str: 10, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(true)
    })

    it('attribute.str != 10', () => {
      expect(dsl.evaluate('attribute.str!=10', ctx({ attributes: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(true)
    })

    it('attribute.str <= 3', () => {
      expect(dsl.evaluate('attribute.str<=3', ctx({ attributes: { str: 2, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(true)
    })

    it('attribute.str < 5', () => {
      expect(dsl.evaluate('attribute.str<5', ctx({ attributes: { str: 4, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(true)
    })
  })

  describe('属性峰值比较', () => {
    it('attribute.peak.str >= 15', () => {
      const c = ctx({ attributePeaks: { str: 15, int: 5, chr: 5, luk: 5, mag: 5 } })
      expect(dsl.evaluate('attribute.peak.str>=15', c)).toBe(true)
    })
  })

  describe('age / lifespan / hp', () => {
    it('age >= 18', () => {
      expect(dsl.evaluate('age>=18', ctx({ age: 20 }))).toBe(true)
      expect(dsl.evaluate('age>=18', ctx({ age: 10 }))).toBe(false)
    })

    it('lifespan >= 80', () => {
      expect(dsl.evaluate('lifespan>=80', ctx({ effectiveMaxAge: 85 }))).toBe(true)
      expect(dsl.evaluate('lifespan>=80', ctx({ effectiveMaxAge: 50 }))).toBe(false)
    })

    it('hp < 30', () => {
      expect(dsl.evaluate('hp<30', ctx({ hp: 20 }))).toBe(true)
      expect(dsl.evaluate('hp<30', ctx({ hp: 50 }))).toBe(false)
    })
  })

  describe('has 查询', () => {
    it('has.talent.xxx', () => {
      expect(dsl.evaluate('has.talent.brave', ctx({ talents: { selected: ['brave'], draftPool: [], inherited: [] } }))).toBe(true)
      expect(dsl.evaluate('has.talent.brave', ctx())).toBe(false)
    })

    it('has.event.xxx', () => {
      expect(dsl.evaluate('has.event.birth', ctx({ triggeredEvents: new Set(['birth']) }))).toBe(true)
      expect(dsl.evaluate('has.event.birth', ctx())).toBe(false)
    })

    it('has.achievement.xxx', () => {
      expect(dsl.evaluate('has.achievement.first_win', ctx({ achievements: { unlocked: ['first_win'], progress: {} } }))).toBe(true)
    })

    it('has.flag.xxx', () => {
      expect(dsl.evaluate('has.flag.married', ctx({ flags: new Set(['married']) }))).toBe(true)
      expect(dsl.evaluate('has.flag.married', ctx())).toBe(false)
    })

    it('has.counter.xxx (counter > 0)', () => {
      expect(dsl.evaluate('has.counter.kills', ctx({ counters: new Map([['kills', 3]]) }))).toBe(true)
      expect(dsl.evaluate('has.counter.kills', ctx({ counters: new Map([['kills', 0]]) }))).toBe(false)
    })
  })

  describe('flag 查询', () => {
    it('flag:married', () => {
      expect(dsl.evaluate('flag:married', ctx({ flags: new Set(['married']) }))).toBe(true)
      expect(dsl.evaluate('flag:married', ctx())).toBe(false)
    })
  })

  describe('event.count', () => {
    it('event.count.battle >= 3', () => {
      const c = ctx({
        eventLog: [
          { age: 1, eventId: 'battle', title: '', description: '', effects: [] },
          { age: 2, eventId: 'battle', title: '', description: '', effects: [] },
          { age: 3, eventId: 'battle', title: '', description: '', effects: [] },
        ],
      })
      expect(dsl.evaluate('event.count.battle>=3', c)).toBe(true)
      expect(dsl.evaluate('event.count.battle>=4', c)).toBe(false)
    })
  })

  describe('achievement.count', () => {
    it('achievement.count >= 2', () => {
      const c = ctx({ achievements: { unlocked: ['a1', 'a2', 'a3'], progress: {} } })
      expect(dsl.evaluate('achievement.count>=2', c)).toBe(true)
    })
  })

  describe('character.race / character.gender', () => {
    it('character.race == human', () => {
      expect(dsl.evaluate('character.race==human', ctx({ character: { name: '测试', race: 'human' } }))).toBe(true)
      expect(dsl.evaluate('character.race==elf', ctx({ character: { name: '测试', race: 'human' } }))).toBe(false)
    })

    it('character.gender == female', () => {
      expect(dsl.evaluate('character.gender==female', ctx({ character: { name: '测试', gender: 'female' } }))).toBe(true)
      expect(dsl.evaluate('character.gender==male', ctx({ character: { name: '测试', gender: 'female' } }))).toBe(false)
    })
  })

  describe('counter 比较', () => {
    it('counter.kills >= 5', () => {
      const c = ctx({ counters: new Map([['kills', 5]]) })
      expect(dsl.evaluate('counter.kills>=5', c)).toBe(true)
      expect(dsl.evaluate('counter.kills>=6', c)).toBe(false)
    })
  })

  describe('逻辑运算', () => {
    it('AND: attribute.str>=5 & attribute.int>=5', () => {
      expect(dsl.evaluate('attribute.str>=5 & attribute.int>=5', ctx())).toBe(true)
      expect(dsl.evaluate('attribute.str>=5 & attribute.int>=10', ctx())).toBe(false)
    })

    it('OR: attribute.str>=20 | attribute.int>=3', () => {
      expect(dsl.evaluate('attribute.str>=20 | attribute.int>=3', ctx())).toBe(true)
    })

    it('括号组合: (attribute.str>=5 | attribute.str<=2) & age>=1', () => {
      expect(dsl.evaluate('(attribute.str>=5 | attribute.str<=2) & age>=1', ctx())).toBe(true)
    })

    it('复合条件: has.talent.brave & attribute.str>=10', () => {
      const c = ctx({
        talents: { selected: ['brave'], draftPool: [], inherited: [] },
        attributes: { str: 12, int: 5, chr: 5, luk: 5, mag: 5 },
      })
      expect(dsl.evaluate('has.talent.brave & attribute.str>=10', c)).toBe(true)
    })
  })

  describe('AST 解析', () => {
    it('解析简单比较', () => {
      const ast = dsl.parse('age>=18')
      expect(ast).toMatchObject({ type: 'comparison', attr: 'age', op: '>=', value: 18 })
    })

    it('解析 AND 逻辑', () => {
      const ast = dsl.parse('age>=18 & hp>0')
      expect(ast.type).toBe('and')
    })

    it('解析 OR 逻辑', () => {
      const ast = dsl.parse('age>=18 | age<=1')
      expect(ast.type).toBe('or')
    })

    it('解析 has 节点', () => {
      const ast = dsl.parse('has.talent.brave')
      expect(ast).toMatchObject({ type: 'has', kind: 'talent', id: 'brave' })
    })

    it('解析 flag 节点', () => {
      const ast = dsl.parse('flag:married')
      expect(ast).toMatchObject({ type: 'flag', name: 'married' })
    })

    it('解析负数值', () => {
      const ast = dsl.parse('attribute.str>=-3')
      expect(ast).toMatchObject({ type: 'comparison', attr: 'attribute.str', op: '>=', value: -3 })
    })
  })

  describe('边界和高级场景', () => {
    it('单独标识符视为布尔检查 (> 0)', () => {
      // 有属性值 > 0 时返回 true
      expect(dsl.evaluate('attribute.str', ctx({ attributes: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(true)
      // 属性值 = 0 时返回 false
      expect(dsl.evaluate('attribute.str', ctx({ attributes: { str: 0, int: 5, chr: 5, luk: 5, mag: 5 } }))).toBe(false)
    })

    it('不存在的属性默认为 0', () => {
      expect(dsl.evaluate('attribute.nonexistent>=0', ctx())).toBe(true)
      expect(dsl.evaluate('attribute.nonexistent>0', ctx())).toBe(false)
    })

    it('不存在的计数器默认为 0', () => {
      expect(dsl.evaluate('counter.nonexistent>=0', ctx())).toBe(true)
      expect(dsl.evaluate('counter.nonexistent>0', ctx())).toBe(false)
    })

    it('不存在的种族默认为空字符串', () => {
      // race 未设置时默认 '' → 与任何种族名不等
      expect(dsl.evaluate('character.race==human', ctx({ character: { name: '测试', race: undefined, gender: undefined } }))).toBe(false)
      expect(dsl.evaluate('character.race!=human', ctx({ character: { name: '测试', race: undefined, gender: undefined } }))).toBe(true)
    })

    it('嵌套括号表达式', () => {
      const c = ctx({
        age: 25,
        hp: 50,
        attributes: { str: 10, int: 8, chr: 5, luk: 5, mag: 5 },
      })
      expect(dsl.evaluate('((attribute.str>=10 & attribute.int>=5) | hp<=0) & age>=18', c)).toBe(true)
    })

    it('多个 OR 条件', () => {
      const c = ctx({ age: 5 })
      expect(dsl.evaluate('age>=100 | age>=50 | age>=1', c)).toBe(true)
    })

    it('多个 AND 条件', () => {
      const c = ctx({
        age: 20,
        hp: 50,
        attributes: { str: 5, int: 5, chr: 5, luk: 5, mag: 5 },
      })
      expect(dsl.evaluate('age>=1 & hp>=1 & attribute.str>=1', c)).toBe(true)
    })

    it('!= 操作符用于字符串', () => {
      expect(dsl.evaluate('character.race!=human', ctx({ character: { name: '测试', race: 'elf' } }))).toBe(true)
      expect(dsl.evaluate('character.race!=human', ctx({ character: { name: '测试', race: 'human' } }))).toBe(false)
    })

    it('event.count 为 0 时返回 false (>=1)', () => {
      expect(dsl.evaluate('event.count.battle>=1', ctx())).toBe(false)
    })

    it('has 查询不存在的类型返回 false', () => {
      expect(dsl.evaluate('has.unknown.thing', ctx())).toBe(false)
    })
  })
})
