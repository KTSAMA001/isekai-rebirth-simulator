/**
 * QA 全种族验证 — commit b314a57 (fix/debt-event-condition)
 *
 * 核心架构：
 * - effectiveMaxAge = 50%-100% of maxLifespan
 * - HP sigmoid 基于 medianDeathAge (lifespanRange 中值)
 * - personalSigmoidMid = 0.55 ± 0.15
 * - 事件年龄缩放基于 effectiveMaxAge
 * - family_dinner DSL: has.flag.married&has.flag.parent
 *
 * 种族数据（b314a57）：
 * - human:   lifespanRange=[65,85],  maxLifespan=100, median=75
 * - elf:     lifespanRange=[250,400], maxLifespan=500, median=325
 * - goblin:  lifespanRange=[20,35],  maxLifespan=60,  median=27.5
 * - dwarf:   lifespanRange=[150,250], maxLifespan=400, median=200
 *
 * 验证项：
 * A. 人类享年分布：大部分在 65-85，不应 100% 集中
 * B. 事件描述合理性检查（elder 事件不早衰、agingHint 关键词不早衰）
 * C. family_dinner：只在 parent flag 设置后触发
 * D. 哥布林/精灵/矮人寿命分布只记录
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import type { Gender } from '@/engine/core/types'
import type { WorldInstance } from '@/engine/core/types'

// ==================== 配置 ====================

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const RACE_NAMES: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林', dwarf: '矮人',
}

const PRESETS = ['random_1', 'random_2', 'random_3'] as const
const GENDERS: Gender[] = ['male', 'female']
const SIMS_PER_RACE = 10

// 种族寿命范围（来自 races.json, commit b314a57）
const LIFESPAN_RANGES: Record<string, [number, number]> = {
  human: [65, 85],
  elf: [250, 400],
  goblin: [20, 35],
  dwarf: [150, 250],
}

// 种族 maxLifespan
const MAX_LIFESPANS: Record<string, number> = {
  human: 100, elf: 500, goblin: 60, dwarf: 400,
}

// medianDeathAge
const MEDIAN_DEATH_AGES: Record<string, number> = {
  human: 75, elf: 325, goblin: 27.5, dwarf: 200,
}

// effectiveMaxAge 范围 [50%, 100%] of maxLifespan
function expectedMaxAgeRange(race: string): [number, number] {
  const max = MAX_LIFESPANS[race]
  return [Math.floor(max * 0.5), max]
}

// 衰老关键词（用于 agingHint 检查）
const SEVERE_AGING_KEYWORDS = ['油尽灯枯', '黄昏', '衰老']

// family_dinner 事件 ID
const FAMILY_DINNER_ID = 'family_dinner'

// parent flag 设置事件
const PARENT_FLAG_EVENTS = new Set([
  'adult_first_child', 'family_blessing', 'mid_adopt_orphan', 'human_child_born',
])

// ==================== 模拟结果接口 ====================

interface SimDetail {
  race: string
  run: number
  effectiveMaxAge: number
  deathAge: number
  lifespanMin: number
  lifespanMax: number
  medianDeathAge: number
  inRange: boolean
  earlyDeath: boolean
  longLived: boolean
  elderEventBefore50: Array<{ eventId: string; age: number }>
  agingHintAnomalies: Array<{ age: number; hint: string }>
  familyDinnerTriggered: boolean
  familyDinnerAge: number | null
  hadChild: boolean
  hadChildAge: number | null
  timelineEvents: Array<{ age: number; eventId: string; title: string }>
  agingHints: Array<{ age: number; hint: string }>
  anomalies: string[]
  grade: string
  score: number
}

// ==================== 核心模拟函数 ====================

function runDetailedSimulation(world: WorldInstance, race: string, preset: string, gender: Gender, runIdx: number): SimDetail {
  const engine = new SimulationEngine(world)
  const presetDef = world.presets.find(p => p.id === preset)
  const name = presetDef?.name ?? 'Test'

  engine.initGame(name, preset, race, gender)
  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, 3))

  const state = engine.getState()
  const visibleAttrs = world.attributes.filter(a => !a.hidden)
  const pointsPerAttr = Math.floor((world.manifest.initialPoints - state.talentPenalty) / visibleAttrs.length)
  const allocation: Record<string, number> = {}
  for (const attr of visibleAttrs) {
    allocation[attr.id] = pointsPerAttr
  }
  engine.allocateAttributes(allocation)

  const initState = engine.getState()
  const effectiveMaxAge = initState.effectiveMaxAge ?? world.manifest.maxAge
  const [lifespanMin, lifespanMax] = LIFESPAN_RANGES[race]
  const medianDeathAge = MEDIAN_DEATH_AGES[race]

  const anomalies: string[] = []
  const timelineEvents: SimDetail['timelineEvents'] = []
  const agingHints: SimDetail['agingHints'] = []
  const elderEventBefore50: SimDetail['elderEventBefore50'] = []
  const agingHintAnomalies: SimDetail['agingHintAnomalies'] = []
  let familyDinnerTriggered = false
  let familyDinnerAge: number | null = null
  let hadChild = false
  let hadChildAge: number | null = null

  let maxIter = 3000
  let prevAge = 0
  let stuckCount = 0

  while (engine.getState().phase === 'simulating' && maxIter > 0) {
    const yearResult = engine.startYear()

    // 记录 agingHint
    if (yearResult.agingHint) {
      agingHints.push({ age: engine.getState().age, hint: yearResult.agingHint })
    }

    if (yearResult.phase === 'awaiting_choice') {
      const branches = yearResult.branches!
      let resolved = false
      for (const branch of branches) {
        try {
          engine.resolveBranch(branch.id)
          resolved = true
          break
        } catch {
          continue
        }
      }
      if (!resolved) engine.skipYear()
    } else if (yearResult.phase === 'mundane_year') {
      engine.skipYear()
    }

    const currentState = engine.getState()
    if (currentState.age === prevAge) {
      stuckCount++
      if (stuckCount > 5) { anomalies.push(`年龄卡在 ${currentState.age}`); break }
    } else { stuckCount = 0; prevAge = currentState.age }
    maxIter--
  }

  if (engine.getState().phase !== 'finished') engine.finish()

  const finalState = engine.getState()
  const deathAge = finalState.result?.lifespan ?? finalState.age

  // 分析事件日志
  for (const log of finalState.eventLog) {
    if (log.eventId === '__mundane__') continue

    timelineEvents.push({ age: log.age, eventId: log.eventId, title: log.title })

    // 检查 B: elder 事件 + 人类 age < 50
    if (race === 'human' && log.eventId.includes('elder') && log.age < 50) {
      elderEventBefore50.push({ eventId: log.eventId, age: log.age })
    }

    // 检查 family_dinner
    if (log.eventId === FAMILY_DINNER_ID) {
      familyDinnerTriggered = true
      familyDinnerAge = log.age
    }

    // 检查 parent flag
    if (PARENT_FLAG_EVENTS.has(log.eventId) && hadChildAge === null) {
      hadChild = true
      hadChildAge = log.age
    }
  }

  // 检查 B: agingHint 严重衰老关键词 + 人类 age < 50
  if (race === 'human') {
    for (const ah of agingHints) {
      if (ah.age < 50) {
        for (const kw of SEVERE_AGING_KEYWORDS) {
          if (ah.hint.includes(kw)) {
            agingHintAnomalies.push({ age: ah.age, hint: ah.hint })
            break
          }
        }
      }
    }
  }

  // 寿命分布
  const inRange = deathAge >= lifespanMin && deathAge <= lifespanMax
  const earlyDeath = deathAge < lifespanMin
  const longLived = deathAge > lifespanMax

  // effectiveMaxAge 范围
  const [expMin, expMax] = expectedMaxAgeRange(race)
  if (effectiveMaxAge < expMin || effectiveMaxAge > expMax) {
    anomalies.push(`effectiveMaxAge=${effectiveMaxAge} 超出期望范围 [${expMin}, ${expMax}]`)
  }

  // 检查 C: family_dinner 在 parent 之后
  if (familyDinnerTriggered && hadChildAge !== null && familyDinnerAge !== null) {
    if (familyDinnerAge < hadChildAge) {
      anomalies.push(`family_dinner(${familyDinnerAge}岁)在孩子事件(${hadChildAge}岁)之前触发`)
    }
  }

  // 人类 elder 事件异常
  if (elderEventBefore50.length > 0) {
    anomalies.push(`elder 事件在 50 岁前触发: ${elderEventBefore50.map(e => `${e.eventId}@${e.age}岁`).join(', ')}`)
  }

  // 人类 agingHint 异常
  if (agingHintAnomalies.length > 0) {
    anomalies.push(`agingHint 严重衰老词在 50 岁前出现: ${agingHintAnomalies.map(a => `${a.age}岁 "${a.hint}"`).join('; ')}`)
  }

  return {
    race,
    run: runIdx,
    effectiveMaxAge,
    deathAge,
    lifespanMin,
    lifespanMax,
    medianDeathAge,
    inRange,
    earlyDeath,
    longLived,
    elderEventBefore50,
    agingHintAnomalies,
    familyDinnerTriggered,
    familyDinnerAge,
    hadChild,
    hadChildAge,
    timelineEvents,
    agingHints,
    anomalies,
    grade: finalState.result?.grade ?? '?',
    score: finalState.result?.score ?? 0,
  }
}

// ==================== 辅助：打印编年史 ====================

function printChronicle(r: SimDetail) {
  const name = RACE_NAMES[r.race]
  console.log(`\n  📜 ${name} #${r.run} 编年史 (effMaxAge=${r.effectiveMaxAge}, 享年=${r.deathAge}):`)
  for (const evt of r.timelineEvents) {
    const marker = evt.eventId.includes('elder') && r.race === 'human' && evt.age < 50 ? ' ⚠️EARLY' : ''
    console.log(`    ${String(evt.age).padStart(3)}岁 | ${evt.eventId.padEnd(35)} | ${evt.title}${marker}`)
  }
  // agingHints
  if (r.race === 'human') {
    for (const ah of r.agingHints) {
      const flag = ah.age < 50 && SEVERE_AGING_KEYWORDS.some(kw => ah.hint.includes(kw)) ? ' ⚠️' : ''
      console.log(`    ${String(ah.age).padStart(3)}岁 | [agingHint]                          | ${ah.hint}${flag}`)
    }
  }
}

// ==================== 测试 ====================

describe('QA 全种族验证 — commit b314a57', () => {
  let world: WorldInstance

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events,
      data.achievements, data.items ?? [], data.presets, data.scoringRule, data.races
    )
    world.evaluations = data.evaluations
  })

  // ==================== 验证 0: 种族数据确认 ====================
  describe('验证 0: 种族数据确认 (b314a57)', () => {
    it('lifespanRange 和 maxLifespan 正确', () => {
      for (const race of RACES) {
        const raceDef = world.races.find(r => r.id === race)
        expect(raceDef).toBeDefined()
        expect(raceDef!.maxLifespan, `${race} maxLifespan`).toBe(MAX_LIFESPANS[race])
        expect(raceDef!.lifespanRange, `${race} lifespanRange`).toEqual(LIFESPAN_RANGES[race])
      }
    })
  })

  // ==================== 验证 0b: family_dinner DSL ====================
  describe('验证 0b: family_dinner DSL', () => {
    it('family_dinner 使用 & 运算符', () => {
      const dinnerEvent = world.index.eventsById.get('family_dinner')
      expect(dinnerEvent).toBeDefined()
      expect(dinnerEvent!.include).toContain('&')
      expect(dinnerEvent!.include).toBe('has.flag.married&has.flag.parent')
    })
  })

  // ==================== 主测试：4种族各10局 ====================
  describe('全种族批量模拟（每种族 10 局）', () => {
    const allResults: SimDetail[] = []

    for (const race of RACES) {
      describe(`${RACE_NAMES[race]}`, () => {
        const raceResults: SimDetail[] = []

        for (let i = 0; i < SIMS_PER_RACE; i++) {
          const preset = PRESETS[i % PRESETS.length]
          const gender = i % 2 === 0 ? 'male' : 'female'

          it(`#${i + 1} (${gender === 'male' ? '♂' : '♀'})`, () => {
            const result = runDetailedSimulation(world, race, preset, gender, i + 1)
            raceResults.push(result)
            allResults.push(result)

            // 打印每局概要
            let rangeIcon = '✅'
            if (result.earlyDeath) rangeIcon = '💀早亡'
            else if (result.longLived) rangeIcon = '🌿长寿'

            const elderStatus = result.elderEventBefore50.length > 0
              ? `⚠️ elder@${result.elderEventBefore50.map(e => e.age).join(',')}`
              : '✅'
            const hintStatus = result.agingHintAnomalies.length > 0
              ? `⚠️ hint@${result.agingHintAnomalies.map(a => a.age).join(',')}`
              : '✅'

            console.log(
              `  🎲 ${RACE_NAMES[race]} #${i + 1}: ` +
              `effMaxAge=${result.effectiveMaxAge} ` +
              `享年=${result.deathAge}(${rangeIcon} [${result.lifespanMin}~${result.lifespanMax}]) ` +
              `elder=${elderStatus} hint=${hintStatus} ` +
              `评分=${result.score} ${result.grade}` +
              (result.anomalies.length > 0 ? ` ⚠️ ${result.anomalies.join('; ')}` : '')
            )

            // 硬性断言
            expect(result.deathAge).toBeGreaterThan(0)
            expect(result.effectiveMaxAge).toBeGreaterThan(0)

            const [expMin, expMax] = expectedMaxAgeRange(race)
            expect(result.effectiveMaxAge, `${race} effectiveMaxAge=${result.effectiveMaxAge} 应在 [${expMin}, ${expMax}] 内`)
              .toBeGreaterThanOrEqual(expMin)
            expect(result.effectiveMaxAge, `${race} effectiveMaxAge=${result.effectiveMaxAge} 应在 [${expMin}, ${expMax}] 内`)
              .toBeLessThanOrEqual(expMax)
          })
        }

        // 种族汇总
        it(`${RACE_NAMES[race]} 汇总`, () => {
          const ages = raceResults.map(r => r.deathAge)
          const avg = ages.reduce((a, b) => a + b, 0) / ages.length
          const min = Math.min(...ages)
          const max = Math.max(...ages)
          const inRangeCount = raceResults.filter(r => r.inRange).length
          const earlyDeathCount = raceResults.filter(r => r.earlyDeath).length
          const longLivedCount = raceResults.filter(r => r.longLived).length
          const elderBefore50 = raceResults.filter(r => r.elderEventBefore50.length > 0).length
          const hintAnomalies = raceResults.filter(r => r.agingHintAnomalies.length > 0).length
          const dinnerTriggered = raceResults.filter(r => r.familyDinnerTriggered).length

          console.log(`\n  📊 ${RACE_NAMES[race]} 汇总:`)
          console.log(`     寿命配置: [${LIFESPAN_RANGES[race][0]}, ${LIFESPAN_RANGES[race][1]}], median=${MEDIAN_DEATH_AGES[race]}, maxLifespan=${MAX_LIFESPANS[race]}`)
          console.log(`     effectiveMaxAge: ${raceResults.map(r => r.effectiveMaxAge).sort((a, b) => a - b).join(', ')}`)
          console.log(`     实际享年: ${min}~${max} (平均 ${avg.toFixed(1)})`)
          console.log(`     在寿命范围内: ${inRangeCount}/${SIMS_PER_RACE} | 早亡: ${earlyDeathCount} | 长寿: ${longLivedCount}`)
          if (race === 'human') {
            console.log(`     elder 事件 < 50岁: ${elderBefore50}/${SIMS_PER_RACE}`)
            console.log(`     agingHint 严重词 < 50岁: ${hintAnomalies}/${SIMS_PER_RACE}`)
          }
          console.log(`     family_dinner 触发: ${dinnerTriggered}/${SIMS_PER_RACE}`)
          const withAnomalies = raceResults.filter(r => r.anomalies.length > 0)
          if (withAnomalies.length > 0) {
            console.log(`     异常局: ${withAnomalies.length}/${SIMS_PER_RACE}`)
            for (const a of withAnomalies) {
              console.log(`       ⚠️ #${a.run}: ${a.anomalies.join('; ')}`)
            }
          }

          // 打印人类编年史
          if (race === 'human') {
            console.log(`\n  📖 人类编年史详情:`)
            for (const r of raceResults) {
              printChronicle(r)
            }
          }
        })
      })
    }

    // ==================== 总汇总报告 ====================
    it('输出全种族汇总报告', () => {
      console.log('\n' + '═'.repeat(120))
      console.log('  QA 全种族验证报告 — commit b314a57 (fix: human lifespanRange [65,85] — most people live 65-85, few reach 100)')
      console.log('═'.repeat(120))

      // 表 1: 每局详细数据
      console.log('\n📋 表 1: 每局详细数据')
      console.log('─'.repeat(120))
      console.log(
        '种族     | #  | effMaxAge | 享年  | 范围        | 分布     | elder<50      | hint<50       | family_dinner | 评分 | 等级'
      )
      console.log('─'.repeat(120))

      for (const r of allResults) {
        let distIcon = '✅范围内'
        if (r.earlyDeath) distIcon = '💀早亡'
        else if (r.longLived) distIcon = '🌿长寿'

        const elderStr = r.elderEventBefore50.length > 0
          ? `⚠️ ${r.elderEventBefore50.map(e => `${e.age}岁`).join(',')}`
          : '✅'
        const hintStr = r.agingHintAnomalies.length > 0
          ? `⚠️ ${r.agingHintAnomalies.map(a => `${a.age}岁`).join(',')}`
          : '✅'
        const dinnerStr = r.familyDinnerTriggered
          ? `✅ ${r.familyDinnerAge}岁`
          : '—'

        console.log(
          `${RACE_NAMES[r.race].padEnd(8)} | ${String(r.run).padStart(2)} | ` +
          `${String(r.effectiveMaxAge).padStart(8)} | ${String(r.deathAge).padStart(5)} | ` +
          `${String(r.lifespanMin).padStart(3)}~${String(r.lifespanMax).padStart(3)} | ` +
          `${distIcon.padEnd(8)} | ${elderStr.padEnd(14)} | ${hintStr.padEnd(14)} | ` +
          `${dinnerStr.padEnd(14)} | ${String(r.score).padStart(4)} | ${r.grade}`
        )
      }

      // 表 2: 种族汇总
      console.log('\n\n📊 表 2: 种族汇总')
      console.log('─'.repeat(120))
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const ages = rr.map(r => r.deathAge)
        const avg = ages.reduce((a, b) => a + b, 0) / ages.length
        const min = Math.min(...ages)
        const max = Math.max(...ages)
        const inRange = rr.filter(r => r.inRange).length
        const earlyDeath = rr.filter(r => r.earlyDeath).length
        const longLived = rr.filter(r => r.longLived).length
        const elderBefore50 = rr.filter(r => r.elderEventBefore50.length > 0).length
        const hintBefore50 = rr.filter(r => r.agingHintAnomalies.length > 0).length
        const dinnerCount = rr.filter(r => r.familyDinnerTriggered).length
        const dinnerOk = rr.filter(r => {
          if (!r.familyDinnerTriggered) return true
          if (r.hadChildAge !== null && r.familyDinnerAge !== null && r.familyDinnerAge >= r.hadChildAge) return true
          return false
        }).length
        const anomalyCount = rr.filter(r => r.anomalies.length > 0).length

        console.log(`\n  ${RACE_NAMES[race]} (${SIMS_PER_RACE}局):`)
        console.log(`    maxLifespan=${MAX_LIFESPANS[race]}, medianDeath=${MEDIAN_DEATH_AGES[race]}, lifespanRange=[${LIFESPAN_RANGES[race][0]}, ${LIFESPAN_RANGES[race][1]}]`)
        console.log(`    effectiveMaxAge 范围: [${Math.min(...rr.map(r => r.effectiveMaxAge))}, ${Math.max(...rr.map(r => r.effectiveMaxAge))}]`)
        console.log(`    享年: ${min}~${max} (平均 ${avg.toFixed(1)})`)
        console.log(`    分布: 范围内=${inRange}/${SIMS_PER_RACE} | 早亡=${earlyDeath} | 长寿=${longLived}`)
        if (race === 'human') {
          console.log(`    elder 事件 < 50岁: ${elderBefore50}/${SIMS_PER_RACE}`)
          console.log(`    agingHint 严重词 < 50岁: ${hintBefore50}/${SIMS_PER_RACE}`)
        }
        console.log(`    family_dinner: 触发${dinnerCount}次, 正确顺序${dinnerOk}/${dinnerCount}`)
        console.log(`    异常: ${anomalyCount}/${SIMS_PER_RACE}`)
      }

      // ==================== 检查项 A: 人类寿命分布 ====================
      console.log('\n\n📋 检查项 A: 人类寿命分布')
      console.log('─'.repeat(120))
      const humanResults = allResults.filter(r => r.race === 'human')
      const humanInRange = humanResults.filter(r => r.inRange).length
      const humanEarly = humanResults.filter(r => r.earlyDeath).length
      const humanLong = humanResults.filter(r => r.longLived).length
      console.log(`  在 [65, 85] 内: ${humanInRange}/${SIMS_PER_RACE}`)
      console.log(`  早亡 (<65): ${humanEarly}/${SIMS_PER_RACE}`)
      console.log(`  长寿 (>85): ${humanLong}/${SIMS_PER_RACE}`)
      if (humanInRange === SIMS_PER_RACE) {
        console.log(`  ⚠️ 警告: 100% 集中在 [65,85]，分布不自然`)
      } else if (humanInRange >= SIMS_PER_RACE * 0.6) {
        console.log(`  ✅ 大部分在 [65,85] 内，有 ${humanEarly + humanLong} 例超出`)
      } else {
        console.log(`  ⚠️ 只有 ${humanInRange}/${SIMS_PER_RACE} 在 [65,85] 内，分布偏低`)
      }

      // ==================== 检查项 B: elder 事件年龄 ====================
      console.log('\n\n📋 检查项 B: 人类 elder 事件年龄合理性')
      console.log('─'.repeat(120))
      const allElderEvents: Array<{ run: number; eventId: string; age: number }> = []
      for (const r of humanResults) {
        for (const evt of r.timelineEvents) {
          if (evt.eventId.includes('elder')) {
            allElderEvents.push({ run: r.run, eventId: evt.eventId, age: evt.age })
          }
        }
      }
      if (allElderEvents.length > 0) {
        for (const ae of allElderEvents.sort((a, b) => a.age - b.age)) {
          const flag = ae.age < 50 ? '⚠️过早' : '✅合理'
          console.log(`    #${ae.run}: ${ae.eventId.padEnd(35)} @ ${ae.age}岁 (阈值=50, ${flag})`)
        }
      } else {
        console.log('    无 elder 事件触发')
      }

      // ==================== 检查项 B2: agingHint 严重衰老词 ====================
      console.log('\n\n📋 检查项 B2: 人类 agingHint 严重衰老关键词')
      console.log('─'.repeat(120))
      const allSevereHints: Array<{ run: number; age: number; hint: string }> = []
      for (const r of humanResults) {
        for (const ah of r.agingHints) {
          for (const kw of SEVERE_AGING_KEYWORDS) {
            if (ah.hint.includes(kw)) {
              allSevereHints.push({ run: r.run, age: ah.age, hint: ah.hint })
              break
            }
          }
        }
      }
      for (const sh of allSevereHints.sort((a, b) => a.age - b.age)) {
        const flag = sh.age < 50 ? '⚠️过早' : '✅合理'
        console.log(`    #${sh.run}: ${sh.age}岁 "${sh.hint}" (${flag})`)
      }
      if (allSevereHints.length === 0) {
        console.log('    无严重衰老关键词出现')
      }

      // ==================== 检查项 C: family_dinner ====================
      console.log('\n\n📋 检查项 C: family_dinner 触发顺序（所有种族）')
      console.log('─'.repeat(120))
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race && r.familyDinnerTriggered)
        if (rr.length > 0) {
          console.log(`  ${RACE_NAMES[race]}:`)
          for (const r of rr) {
            const childAge = r.hadChildAge ?? '?'
            const ok = r.hadChildAge !== null && r.familyDinnerAge !== null && r.familyDinnerAge >= r.hadChildAge
            console.log(`    #${r.run}: 孩子@${childAge}岁, family_dinner@${r.familyDinnerAge}岁 → ${ok ? '✅正确' : '⚠️顺序错误'}`)
          }
        } else {
          console.log(`  ${RACE_NAMES[race]}: 未触发 family_dinner`)
        }
      }

      // ==================== 检查项 D: 非人类寿命分布 ====================
      console.log('\n\n📋 检查项 D: 非人类寿命分布（仅记录）')
      console.log('─'.repeat(120))
      for (const race of ['elf', 'goblin', 'dwarf'] as const) {
        const rr = allResults.filter(r => r.race === race)
        const ages = rr.map(r => r.deathAge).sort((a, b) => a - b)
        const avg = ages.reduce((a, b) => a + b, 0) / ages.length
        const inRange = rr.filter(r => r.inRange).length
        console.log(`  ${RACE_NAMES[race]}: ${ages.join(', ')} (平均 ${avg.toFixed(1)}, 在 [${LIFESPAN_RANGES[race][0]},${LIFESPAN_RANGES[race][1]}] 内: ${inRange}/${SIMS_PER_RACE})`)
      }

      // ==================== 最终判定 ====================
      console.log('\n\n' + '═'.repeat(120))
      console.log('  最终判定')
      console.log('═'.repeat(120))

      // A: 人类分布
      if (humanInRange >= SIMS_PER_RACE * 0.6 && humanInRange < SIMS_PER_RACE) {
        console.log(`  ✅ 检查项 A: 人类大部分(${humanInRange}/${SIMS_PER_RACE})在 [65,85]，有早亡/长寿分布`)
      } else if (humanInRange === SIMS_PER_RACE) {
        console.log(`  ⚠️ 检查项 A: 100% 在 [65,85]，无分布扩散`)
      } else {
        console.log(`  ⚠️ 检查项 A: 只有 ${humanInRange}/${SIMS_PER_RACE} 在 [65,85]，过少`)
      }

      // B: elder 事件
      const humanElderBefore50 = humanResults.filter(r => r.elderEventBefore50.length > 0).length
      if (humanElderBefore50 === 0) {
        console.log(`  ✅ 检查项 B: 人类无 elder 事件在 50 岁前触发`)
      } else {
        console.log(`  ⚠️ 检查项 B: 人类 ${humanElderBefore50} 局有 elder 事件在 50 岁前触发`)
      }

      // B2: agingHint
      const humanHintAnomalies = humanResults.filter(r => r.agingHintAnomalies.length > 0).length
      if (humanHintAnomalies === 0) {
        console.log(`  ✅ 检查项 B2: 人类无严重衰老 agingHint 在 50 岁前出现`)
      } else {
        console.log(`  ⚠️ 检查项 B2: 人类 ${humanHintAnomalies} 局有严重衰老词在 50 岁前出现`)
      }

      // C: family_dinner
      const dinnerOrderErrors = allResults.filter(r =>
        r.familyDinnerTriggered && r.hadChildAge !== null && r.familyDinnerAge !== null && r.familyDinnerAge < r.hadChildAge
      ).length
      if (dinnerOrderErrors === 0) {
        console.log(`  ✅ 检查项 C: family_dinner 均在 parent flag 设置后触发`)
      } else {
        console.log(`  ❌ 检查项 C: ${dinnerOrderErrors} 局 family_dinner 在 parent flag 设置前触发`)
      }

      // 致命异常
      const criticalAnomalies = allResults.filter(r =>
        r.anomalies.some(a => a.includes('年龄卡住') || a.includes('effectiveMaxAge'))
      )
      if (criticalAnomalies.length === 0) {
        console.log('  ✅ 无致命异常（卡住/范围越界）')
      } else {
        console.log('  ❌ 致命异常:')
        for (const a of criticalAnomalies) {
          console.log(`    ${RACE_NAMES[a.race]} #${a.run}: ${a.anomalies.join('; ')}`)
        }
      }

      console.log('\n' + '═'.repeat(120))

      // 硬性断言：无致命异常
      expect(criticalAnomalies.length, `致命异常: ${JSON.stringify(criticalAnomalies.map(a => a.anomalies))}`).toBe(0)
    })
  })
})
