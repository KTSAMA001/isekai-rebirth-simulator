import { describe, it, expect } from 'vitest'
import { AchievementModule } from '@/engine/modules/AchievementModule'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'
import { makeWorld, makeAchievement, makeState } from '../../helpers'

function createModule(achievements: ReturnType<typeof makeAchievement>[]) {
  const world = makeWorld({ achievements })
  const dsl = new ConditionDSL()
  return new AchievementModule(world, dsl)
}

describe('AchievementModule', () => {
  describe('checkAchievements()', () => {
    it('条件满足时解锁成就', () => {
      const achievements = [
        makeAchievement('ach1', 'age>=18'),
      ]
      const mod = createModule(achievements)
      const state = makeState({ age: 20 })
      const unlocked = mod.checkAchievements(state)
      expect(unlocked).toContain('ach1')
    })

    it('条件不满足时不解锁', () => {
      const achievements = [
        makeAchievement('ach1', 'age>=18'),
      ]
      const mod = createModule(achievements)
      const state = makeState({ age: 10 })
      const unlocked = mod.checkAchievements(state)
      expect(unlocked).not.toContain('ach1')
    })

    it('已解锁的成就不重复', () => {
      const achievements = [
        makeAchievement('ach1', 'age>=1'),
      ]
      const mod = createModule(achievements)
      const state = makeState({
        age: 20,
        achievements: { unlocked: ['ach1'], progress: {} },
      })
      const unlocked = mod.checkAchievements(state)
      expect(unlocked).not.toContain('ach1')
    })

    it('种族限定成就：匹配种族时可解锁', () => {
      const achievements = [
        makeAchievement('elf_ach', 'age>=1', { races: ['elf'] }),
      ]
      const mod = createModule(achievements)

      const elfState = makeState({ character: { name: '测试', race: 'elf' } })
      expect(mod.checkAchievements(elfState)).toContain('elf_ach')

      const humanState = makeState({ character: { name: '测试', race: 'human' } })
      expect(mod.checkAchievements(humanState)).not.toContain('elf_ach')
    })

    it('性别限定成就：匹配性别时可解锁', () => {
      const achievements = [
        makeAchievement('female_ach', 'age>=1', { genders: ['female'] }),
      ]
      const mod = createModule(achievements)

      const femaleState = makeState({ character: { name: '测试', gender: 'female' } })
      expect(mod.checkAchievements(femaleState)).toContain('female_ach')

      const maleState = makeState({ character: { name: '测试', gender: 'male' } })
      expect(mod.checkAchievements(maleState)).not.toContain('female_ach')
    })

    it('多条件成就', () => {
      const achievements = [
        makeAchievement('strong_adult', 'age>=18 & attribute.str>=15'),
      ]
      const mod = createModule(achievements)

      const good = makeState({ age: 20, attributes: { str: 15, int: 5, chr: 5, luk: 5, mag: 5 } })
      expect(mod.checkAchievements(good)).toContain('strong_adult')

      const tooYoung = makeState({ age: 10, attributes: { str: 15, int: 5, chr: 5, luk: 5, mag: 5 } })
      expect(mod.checkAchievements(tooYoung)).not.toContain('strong_adult')
    })

    it('flag 条件成就', () => {
      const achievements = [
        makeAchievement('married', 'flag:married'),
      ]
      const mod = createModule(achievements)
      const state = makeState({ flags: new Set(['married']) })
      expect(mod.checkAchievements(state)).toContain('married')
    })

    it('has.talent 条件成就', () => {
      const achievements = [
        makeAchievement('brave_soul', 'has.talent.brave'),
      ]
      const mod = createModule(achievements)
      const state = makeState({ talents: { selected: ['brave'], draftPool: [], inherited: [] } })
      expect(mod.checkAchievements(state)).toContain('brave_soul')
    })

    it('多个成就同时检查', () => {
      const achievements = [
        makeAchievement('ach1', 'age>=1'),
        makeAchievement('ach2', 'age>=18'),
        makeAchievement('ach3', 'attribute.str>=100'), // 不可能
      ]
      const mod = createModule(achievements)
      const state = makeState({ age: 20 })
      const unlocked = mod.checkAchievements(state)
      expect(unlocked).toContain('ach1')
      expect(unlocked).toContain('ach2')
      expect(unlocked).not.toContain('ach3')
    })
  })
})
