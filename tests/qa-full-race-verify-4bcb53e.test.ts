/**
 * QA 全种族验证 — commit 4bcb53e (fix/debt-event-condition)
 *
 * 核心架构：
 * - effectiveMaxAge = 50%-100% of maxLifespan (宽范围随机)
 * - HP sigmoid 基于 medianDeathAge (lifespanRange 中值)
 * - personalSigmoidMid = 0.55 ± 0.15 (个体差异)
 * - 事件年龄缩放基于 effectiveMaxAge
 * - family_dinner DSL: has.flag.married&has.flag.parent
 *
 * 种族数据：
 * - human:   lifespanRange=[40,60],  maxLifespan=100, median=50
 * - elf:     lifespanRange=[250,400], maxLifespan=500, median=325
 * - goblin:  lifespanRange=[20,35],  maxLifespan=60,  median=27.5
 * - dwarf:   lifespanRange=[150,250], maxLifespan=400, median=200
 *
 * effectiveMaxAge 范围（50%-100% of maxLifespan）：
 * - human:   [50, 100]
 * - elf:     [250, 500]
 * - goblin:  [30, 60]
 * - dwarf:   [200, 400]
 *
 * 检查项：
 * 1. 寿命分布：大部分人死在 lifespanRange 内，但有少数低于下限（早亡/夭折）和少数超出上限（长寿）
 * 2. 不应该 100% 死在 lifespanRange 内（之前的问题）
 * 3. 衰老提示和衰老事件年龄是否合理（人类不应 33 岁衰老加剧）
 * 4. family_dinner 是否在有孩子后触发
 * 5. 事件时间线合理性（童年→青年→成年→老年）
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

// 种族寿命范围（来自 races.json）
const LIFESPAN_RANGES: Record<string, [number, number]> = {
  human: [40, 60],
  elf: [250, 400],
  goblin: [20, 35],
  dwarf: [150, 250],
}

// 种族 maxLifespan（来自 races.json，commit 4bcb53e）
const MAX_LIFESPANS: Record<string, number> = {
  human: 100, elf: 500, goblin: 60, dwarf: 400,
}

// medianDeathAge = (lifespanRange[0] + lifespanRange[1]) / 2
const MEDIAN_DEATH_AGES: Record<string, number> = {
  human: 50, elf: 325, goblin: 27.5, dwarf: 200,
}

// effectiveMaxAge 应在 [maxLifespan*0.5, maxLifespan] 范围内
function expectedMaxAgeRange(race: string): [number, number] {
  const max = MAX_LIFESPANS[race]
  return [Math.floor(max * 0.5), max]
}

// 衰老事件 ID 前缀
const AGING_EVENT_IDS = new Set([
  'elder_illness', 'elder_frail', 'elder_memory_fade', 'elder_final_illness',
  'elder_natural_death', 'mid_physical_decline', 'mid_goblin_aging',
  'first_white_hair',
])

// family_dinner 事件
const FAMILY_DINNER_ID = 'family_dinner'

// 父母/婚姻 flag 设置事件
const PARENT_FLAG_EVENTS = new Set([
  'adult_first_child', 'family_blessing', 'mid_adopt_orphan', 'human_child_born',
])

// 时间线阶段定义（按 minAge 划分）
function classifyEventAge(age: number, effectiveMaxAge: number): string {
  const ratio = age / effectiveMaxAge
  if (ratio <= 0.1) return 'childhood'
  if (ratio <= 0.25) return 'youth'
  if (ratio <= 0.6) return 'adult'
  return 'elder'
}

// ==================== 模拟结果接口 ====================

interface SimDetail {
  race: string
  run: number
  effectiveMaxAge: number
  personalSigmoidMid: number
  deathAge: number
  lifespanMin: number
  lifespanMax: number
  medianDeathAge: number
  inRange: boolean
  earlyDeath: boolean
  longLived: boolean
  agingEventBeforeThreshold: { eventId: string; age: number } | null
  familyDinnerTriggered: boolean
  familyDinnerAge: number | null
  hadChild: boolean
  hadChildAge: number | null
  timelinePhases: string[]
  timelineEvents: Array<{ age: number; eventId: string; title: string }>
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
  let familyDinnerTriggered = false
  let familyDinnerAge: number | null = null
  let hadChild = false
  let hadChildAge: number | null = null
  let agingEventBeforeThreshold: { eventId: string; age: number } | null = null

  // 衰老阈值：基于 medianDeathAge 的 70%，而非 lifespanRange 下限
  // 人类 median=50 → 阈值=35; 精灵 median=325 → 阈值=227
  const agingThreshold = Math.floor(medianDeathAge * 0.7)

  let maxIter = 2000
  let prevAge = 0
  let stuckCount = 0

  while (engine.getState().phase === 'simulating' && maxIter > 0) {
    const yearResult = engine.startYear()

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
  const phases = new Set<string>()
  for (const log of finalState.eventLog) {
    if (log.eventId === '__mundane__') continue

    const phase = classifyEventAge(log.age, effectiveMaxAge)
    phases.add(phase)
    timelineEvents.push({ age: log.age, eventId: log.eventId, title: log.title })

    // 检查衰老事件是否在阈值前触发
    if (AGING_EVENT_IDS.has(log.eventId) && log.age < agingThreshold) {
      if (!agingEventBeforeThreshold) {
        agingEventBeforeThreshold = { eventId: log.eventId, age: log.age }
      }
    }

    // 检查 family_dinner
    if (log.eventId === FAMILY_DINNER_ID) {
      familyDinnerTriggered = true
      familyDinnerAge = log.age
    }

    // 检查是否获得孩子（记录首次设置 parent flag 的事件）
    if (PARENT_FLAG_EVENTS.has(log.eventId) && hadChildAge === null) {
      hadChild = true
      hadChildAge = log.age
    }
  }

  // 检查寿命分布
  const inRange = deathAge >= lifespanMin && deathAge <= lifespanMax
  const earlyDeath = deathAge < lifespanMin
  const longLived = deathAge > lifespanMax

  // 有效年龄卡住
  const [expMin, expMax] = expectedMaxAgeRange(race)
  if (effectiveMaxAge < expMin || effectiveMaxAge > expMax) {
    anomalies.push(`effectiveMaxAge=${effectiveMaxAge} 超出期望范围 [${expMin}, ${expMax}]`)
  }

  // family_dinner 在有孩子之后触发
  if (familyDinnerTriggered && hadChildAge !== null && familyDinnerAge !== null) {
    if (familyDinnerAge < hadChildAge) {
      anomalies.push(`family_dinner(${familyDinnerAge}岁)在孩子事件(${hadChildAge}岁)之前触发`)
    }
  }

  // 无任何事件
  if (deathAge > 10 && phases.size === 0) {
    anomalies.push('无任何事件触发')
  }

  return {
    race,
    run: runIdx,
    effectiveMaxAge,
    personalSigmoidMid: 0, // 不从外部暴露，仅记录
    deathAge,
    lifespanMin,
    lifespanMax,
    medianDeathAge,
    inRange,
    earlyDeath,
    longLived,
    agingEventBeforeThreshold,
    familyDinnerTriggered,
    familyDinnerAge,
    hadChild,
    hadChildAge,
    timelinePhases: Array.from(phases),
    timelineEvents,
    anomalies,
    grade: finalState.result?.grade ?? '?',
    score: finalState.result?.score ?? 0,
  }
}

// ==================== 测试 ====================

describe('QA 全种族验证 — commit 4bcb53e', () => {
  let world: WorldInstance

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events,
      data.achievements, data.items ?? [], data.presets, data.scoringRule, data.races
    )
    world.evaluations = data.evaluations
  })

  // ==================== 验证 0: family_dinner DSL ====================
  describe('验证 0: family_dinner DSL', () => {
    it('family_dinner 事件使用 & 运算符', () => {
      const dinnerEvent = world.index.eventsById.get('family_dinner')
      expect(dinnerEvent).toBeDefined()
      expect(dinnerEvent!.include).toContain('&')
      expect(dinnerEvent!.include).toBe('has.flag.married&has.flag.parent')
    })
  })

  // ==================== 验证 0b: 种族数据确认 ====================
  describe('验证 0b: 种族数据确认', () => {
    it('maxLifespan 数据正确 (4bcb53e)', () => {
      for (const race of RACES) {
        const raceDef = world.races.find(r => r.id === race)
        expect(raceDef).toBeDefined()
        expect(raceDef!.maxLifespan, `${race} maxLifespan`).toBe(MAX_LIFESPANS[race])
        expect(raceDef!.lifespanRange, `${race} lifespanRange`).toEqual(LIFESPAN_RANGES[race])
      }
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

            let rangeIcon = '✅'
            if (result.earlyDeath) rangeIcon = '💀早亡'
            else if (result.longLived) rangeIcon = '🌿长寿'

            const agingStatus = result.agingEventBeforeThreshold
              ? `⚠️ 衰老@${result.agingEventBeforeThreshold.age}(${result.agingEventBeforeThreshold.eventId})`
              : '✅'
            const dinnerStatus = result.familyDinnerTriggered
              ? `@${result.familyDinnerAge}`
              : '—'

            console.log(
              `  🎲 ${RACE_NAMES[race]} #${i + 1}: ` +
              `effMaxAge=${result.effectiveMaxAge} ` +
              `享年=${result.deathAge}(${rangeIcon} [${result.lifespanMin}~${result.lifespanMax}]) ` +
              `衰老=${agingStatus} ` +
              `家庭晚餐=${dinnerStatus} ` +
              `评分=${result.score} ${result.grade}` +
              (result.anomalies.length > 0 ? ` ⚠️ ${result.anomalies.join('; ')}` : '')
            )

            // 硬性断言
            expect(result.deathAge).toBeGreaterThan(0)
            expect(result.effectiveMaxAge).toBeGreaterThan(0)

            // effectiveMaxAge 范围断言
            const [expMin, expMax] = expectedMaxAgeRange(race)
            expect(result.effectiveMaxAge, `${race} effectiveMaxAge=${result.effectiveMaxAge} 应在 [${expMin}, ${expMax}] 内`).toBeGreaterThanOrEqual(expMin)
            expect(result.effectiveMaxAge, `${race} effectiveMaxAge=${result.effectiveMaxAge} 应在 [${expMin}, ${expMax}] 内`).toBeLessThanOrEqual(expMax)
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
          const agingBeforeThreshold = raceResults.filter(r => r.agingEventBeforeThreshold !== null).length
          const dinnerTriggered = raceResults.filter(r => r.familyDinnerTriggered).length

          console.log(`\n  📊 ${RACE_NAMES[race]} 汇总:`)
          console.log(`     寿命配置: [${LIFESPAN_RANGES[race][0]}, ${LIFESPAN_RANGES[race][1]}], median=${MEDIAN_DEATH_AGES[race]}, maxLifespan=${MAX_LIFESPANS[race]}`)
          console.log(`     effectiveMaxAge: ${raceResults.map(r => r.effectiveMaxAge).sort((a,b)=>a-b).join(', ')}`)
          console.log(`     实际享年: ${min}~${max} (平均 ${avg.toFixed(1)})`)
          console.log(`     在寿命范围内: ${inRangeCount}/${SIMS_PER_RACE} | 早亡: ${earlyDeathCount} | 长寿: ${longLivedCount}`)
          console.log(`     阈值前衰老事件: ${agingBeforeThreshold}/${SIMS_PER_RACE}`)
          console.log(`     family_dinner 触发: ${dinnerTriggered}/${SIMS_PER_RACE}`)
          const withAnomalies = raceResults.filter(r => r.anomalies.length > 0)
          if (withAnomalies.length > 0) {
            console.log(`     异常局: ${withAnomalies.length}/${SIMS_PER_RACE}`)
            for (const a of withAnomalies) {
              console.log(`       ⚠️ #${a.run}: ${a.anomalies.join('; ')}`)
            }
          }
        })
      })
    }

    // ==================== 总汇总报告 ====================
    it('输出全种族汇总报告', () => {
      console.log('\n' + '═'.repeat(110))
      console.log('  QA 全种族验证报告 — commit 4bcb53e (fix/debt-event-condition)')
      console.log('═'.repeat(110))

      // 表 1: effectiveMaxAge + 享年 + 寿命范围
      console.log('\n📋 表 1: 每局详细数据')
      console.log('─'.repeat(110))
      console.log(
        '种族     | #  | effMaxAge | 享年 | 范围       | 分布   | 衰老过早        | family_dinner | 评分 | 等级 | 异常'
      )
      console.log('─'.repeat(110))

      for (const r of allResults) {
        let distIcon = '✅范围内'
        if (r.earlyDeath) distIcon = '💀早亡'
        else if (r.longLived) distIcon = '🌿长寿'

        const agingStr = r.agingEventBeforeThreshold
          ? `⚠️ ${r.agingEventBeforeThreshold.age}岁`
          : '✅'
        const dinnerStr = r.familyDinnerTriggered
          ? `✅ ${r.familyDinnerAge}岁`
          : '—'
        const anomalyStr = r.anomalies.length > 0 ? `⚠️ ${r.anomalies[0]}` : ''

        console.log(
          `${RACE_NAMES[r.race].padEnd(8)} | ${String(r.run).padStart(2)} | ` +
          `${String(r.effectiveMaxAge).padStart(8)} | ${String(r.deathAge).padStart(4)} | ` +
          `${String(r.lifespanMin).padStart(3)}~${String(r.lifespanMax).padStart(3)} | ` +
          `${distIcon.padEnd(6)} | ${agingStr.padEnd(15)} | ${dinnerStr.padEnd(14)} | ` +
          `${String(r.score).padStart(4)} | ${r.grade.padEnd(4)} | ${anomalyStr}`
        )
      }

      // 表 2: 种族汇总
      console.log('\n\n📊 表 2: 种族汇总')
      console.log('─'.repeat(110))
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const ages = rr.map(r => r.deathAge)
        const avg = ages.reduce((a, b) => a + b, 0) / ages.length
        const min = Math.min(...ages)
        const max = Math.max(...ages)
        const inRange = rr.filter(r => r.inRange).length
        const earlyDeath = rr.filter(r => r.earlyDeath).length
        const longLived = rr.filter(r => r.longLived).length
        const agingBefore = rr.filter(r => r.agingEventBeforeThreshold !== null).length
        const dinnerOk = rr.filter(r => {
          if (!r.familyDinnerTriggered) return true
          if (r.hadChildAge !== null && r.familyDinnerAge !== null && r.familyDinnerAge >= r.hadChildAge) return true
          return false
        }).length
        const dinnerCount = rr.filter(r => r.familyDinnerTriggered).length
        const anomalyCount = rr.filter(r => r.anomalies.length > 0).length

        console.log(`\n  ${RACE_NAMES[race]} (${SIMS_PER_RACE}局):`)
        console.log(`    maxLifespan=${MAX_LIFESPANS[race]}, medianDeath=${MEDIAN_DEATH_AGES[race]}, lifespanRange=[${LIFESPAN_RANGES[race][0]}, ${LIFESPAN_RANGES[race][1]}]`)
        console.log(`    effectiveMaxAge 范围: [${Math.min(...rr.map(r=>r.effectiveMaxAge))}, ${Math.max(...rr.map(r=>r.effectiveMaxAge))}]`)
        console.log(`    享年: ${min}~${max} (平均 ${avg.toFixed(1)})`)
        console.log(`    分布: 范围内=${inRange}/${SIMS_PER_RACE} | 早亡=${earlyDeath} | 长寿=${longLived}`)
        console.log(`    阈值前衰老事件: ${agingBefore}/${SIMS_PER_RACE}`)
        console.log(`    family_dinner: 触发${dinnerCount}次, 正确顺序${dinnerOk}/${dinnerCount}`)
        console.log(`    异常: ${anomalyCount}/${SIMS_PER_RACE}`)

        // 关键检查项 1: 不应该 100% 在范围内
        if (inRange === SIMS_PER_RACE) {
          console.log(`    ⚠️ 警告: 100% 死在 lifespanRange 内，早亡/长寿分布缺失`)
        } else {
          console.log(`    ✅ 有 ${earlyDeath} 例早亡和 ${longLived} 例长寿，分布自然`)
        }
      }

      // ==================== 检查项 3: 衰老事件合理性 ====================
      console.log('\n\n📋 检查项 3: 衰老事件年龄合理性')
      console.log('─'.repeat(110))
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const agingEvents: Array<{ run: number; eventId: string; age: number }> = []
        for (const r of rr) {
          for (const evt of r.timelineEvents) {
            if (AGING_EVENT_IDS.has(evt.eventId)) {
              agingEvents.push({ run: r.run, eventId: evt.eventId, age: evt.age })
            }
          }
        }
        if (agingEvents.length > 0) {
          console.log(`  ${RACE_NAMES[race]} 衰老事件:`)
          for (const ae of agingEvents.sort((a, b) => a.age - b.age)) {
            const threshold = Math.floor(MEDIAN_DEATH_AGES[race] * 0.7)
            const flag = ae.age < threshold ? '⚠️过早' : '✅合理'
            console.log(`    #${ae.run}: ${ae.eventId} @ ${ae.age}岁 (阈值=${threshold}, ${flag})`)
          }
        } else {
          console.log(`  ${RACE_NAMES[race]}: 无衰老事件触发`)
        }
      }

      // ==================== 检查项 4: family_dinner ====================
      console.log('\n\n📋 检查项 4: family_dinner 触发顺序')
      console.log('─'.repeat(110))
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
          console.log(`  ${RACE_NAMES[race]}: 未触发 family_dinner（无结婚或有孩子事件）`)
        }
      }

      // ==================== 检查项 5: 事件时间线 ====================
      console.log('\n\n📋 检查项 5: 事件时间线')
      console.log('─'.repeat(110))
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        console.log(`  ${RACE_NAMES[race]}:`)
        for (const r of rr) {
          const phases = r.timelinePhases
          const phaseStr = phases.length > 0 ? phases.join('→') : '无事件'
          const timelineOk = phases.includes('childhood') || phases.includes('youth') || phases.includes('adult') || r.deathAge <= 10
          console.log(`    #${r.run}: 享年=${r.deathAge} 阶段=[${phaseStr}] ${timelineOk ? '✅' : '⚠️无合理阶段'}`)
        }
      }

      // ==================== 最终判定 ====================
      console.log('\n\n' + '═'.repeat(110))
      console.log('  最终判定')
      console.log('═'.repeat(110))

      const criticalAnomalies = allResults.filter(r =>
        r.anomalies.some(a => a.includes('年龄卡住') || a.includes('effectiveMaxAge') || a.includes('之前触发'))
      )

      // 检查项 1 & 2: 分布检查
      let distributionOk = true
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const inRange = rr.filter(r => r.inRange).length
        if (inRange === SIMS_PER_RACE) {
          console.log(`  ⚠️ ${RACE_NAMES[race]}: 100% 在范围内，早亡/长寿缺失`)
          distributionOk = false
        }
      }
      if (distributionOk) {
        console.log('  ✅ 检查项 1&2: 所有种族都有早亡/长寿分布，不 100% 在 lifespanRange 内')
      }

      // 检查项 3: 人类衰老
      const humanAgingBefore35 = allResults.filter(r =>
        r.race === 'human' && r.agingEventBeforeThreshold !== null && r.agingEventBeforeThreshold.age < 33
      )
      if (humanAgingBefore35.length === 0) {
        console.log('  ✅ 检查项 3: 人类无 33 岁前衰老加剧')
      } else {
        console.log(`  ⚠️ 检查项 3: 人类 ${humanAgingBefore35.length} 例 33 岁前衰老加剧`)
      }

      // 致命异常
      if (criticalAnomalies.length === 0) {
        console.log('  ✅ 无致命异常')
      } else {
        console.log('  ❌ 致命异常:')
        for (const a of criticalAnomalies) {
          console.log(`    ${RACE_NAMES[a.race]} #${a.run}: ${a.anomalies.join('; ')}`)
        }
      }

      console.log('\n' + '═'.repeat(110))

      // 硬性断言
      expect(criticalAnomalies.length, `致命异常: ${JSON.stringify(criticalAnomalies.map(a => a.anomalies))}`).toBe(0)
    })
  })
})
