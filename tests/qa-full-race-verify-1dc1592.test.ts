/**
 * QA 全种族验证 — commit 1dc1592 (fix/debt-event-condition)
 *
 * 核心架构变更验证：
 * - effectiveMaxAge 基于 maxLifespan（人类 80-100，精灵 600-750，哥布林 48-60，矮人 360-450）
 * - HP 衰减 sigmoid 基于 medianDeathAge（lifespanRange 中值：人类 50，精灵 325，哥布林 27.5，矮人 200）
 * - 事件年龄缩放基于 effectiveMaxAge
 * - family_dinner DSL 已改为 & 运算符
 *
 * 测试：4个可玩种族各 10 局，对每局记录：
 * 1. effectiveMaxAge、实际享年
 * 2. 寿命是否在 lifespanRange 内
 * 3. 是否有 40 岁前（人类）触发的衰老事件
 * 4. family_dinner 是否在有孩子后触发
 * 5. 事件时间线是否合理（童年→青年→成年→老年）
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import type { Gender, EventLogEntry } from '@/engine/core/types'
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

// 种族 maxLifespan（来自 races.json）
const MAX_LIFESPANS: Record<string, number> = {
  human: 100, elf: 750, goblin: 60, dwarf: 450,
}

// medianDeathAge = (lifespanRange[0] + lifespanRange[1]) / 2
const MEDIAN_DEATH_AGES: Record<string, number> = {
  human: 50, elf: 325, goblin: 27.5, dwarf: 200,
}

// effectiveMaxAge 应在 [maxLifespan*0.8, maxLifespan] 范围内
function expectedMaxAgeRange(race: string): [number, number] {
  const max = MAX_LIFESPANS[race]
  return [Math.floor(max * 0.8), max]
}

// 衰老事件 ID 前缀（elder 开头 + middle-age 中的衰老相关）
const AGING_EVENT_IDS = new Set([
  'elder_illness', 'elder_frail', 'elder_memory_fade', 'elder_final_illness',
  'elder_natural_death', 'mid_physical_decline', 'mid_goblin_aging',
  'first_white_hair', // "第一根白发"
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
  deathAge: number
  lifespanMin: number
  lifespanMax: number
  medianDeathAge: number
  inRange: boolean
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

  // 衰老阈值：人类 40 岁前不应触发衰老事件，其他种族用 medianDeathAge * 0.8
  const agingThreshold = race === 'human' ? 40 : Math.floor(medianDeathAge * 0.8)

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

    // 检查是否获得孩子
    if (PARENT_FLAG_EVENTS.has(log.eventId)) {
      hadChild = true
      hadChildAge = log.age
    }
  }

  // 验证项 2：寿命是否在 lifespanRange 内（允许 20% 宽容）
  const inRange = deathAge >= lifespanMin && deathAge <= lifespanMax
  if (!inRange) {
    const lowerTolerance = lifespanMin * 0.8
    const upperTolerance = lifespanMax * 1.3
    if (deathAge < lowerTolerance) {
      anomalies.push(`早死: ${deathAge}岁 < 寿命下限${lifespanMin}（80%宽容: ${Math.floor(lowerTolerance)}）`)
    }
    if (deathAge > upperTolerance) {
      anomalies.push(`超龄: ${deathAge}岁 > 寿命上限${lifespanMax}（130%宽容: ${Math.floor(upperTolerance)}）`)
    }
  }

  // 验证项 4：family_dinner 在有孩子之后触发
  if (familyDinnerTriggered && hadChildAge !== null && familyDinnerAge !== null) {
    if (familyDinnerAge < hadChildAge) {
      anomalies.push(`family_dinner(${familyDinnerAge}岁)在孩子事件(${hadChildAge}岁)之前触发`)
    }
  }

  // 验证项 5：时间线合理性
  const phaseList = Array.from(phases)
  // 基本期望：至少有 childhood 或 youth 阶段的事件（除非早死）
  if (deathAge > 10 && phaseList.length === 0) {
    anomalies.push('无任何事件触发')
  }

  // 验证 effectiveMaxAge 范围
  const [expectedMin, expectedMax] = expectedMaxAgeRange(race)
  if (effectiveMaxAge < expectedMin || effectiveMaxAge > expectedMax) {
    anomalies.push(`effectiveMaxAge=${effectiveMaxAge} 超出期望范围 [${expectedMin}, ${expectedMax}]`)
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
    agingEventBeforeThreshold,
    familyDinnerTriggered,
    familyDinnerAge,
    hadChild,
    hadChildAge,
    timelinePhases: phaseList,
    timelineEvents,
    anomalies,
    grade: finalState.result?.grade ?? '?',
    score: finalState.result?.score ?? 0,
  }
}

// ==================== 测试 ====================

describe('QA 全种族验证 — commit 1dc1592', () => {
  let world: WorldInstance

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events,
      data.achievements, data.items ?? [], data.presets, data.scoringRule, data.races
    )
    world.evaluations = data.evaluations
  })

  // ==================== 验证 0: family_dinner DSL & 运算符 ====================
  describe('验证 0: family_dinner DSL & 运算符', () => {
    it('family_dinner 事件使用 & 运算符', () => {
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

            const rangeStatus = result.inRange ? '✅' : '⚠️'
            const agingStatus = result.agingEventBeforeThreshold
              ? `⚠️ 衰老@${result.agingEventBeforeThreshold.age}(${result.agingEventBeforeThreshold.eventId})`
              : '✅'
            const dinnerStatus = result.familyDinnerTriggered
              ? `@${result.familyDinnerAge}`
              : '—'

            console.log(
              `  🎲 ${RACE_NAMES[race]} #${i + 1}: ` +
              `effMaxAge=${result.effectiveMaxAge} ` +
              `享年=${result.deathAge}(${rangeStatus} [${result.lifespanMin}~${result.lifespanMax}]) ` +
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
            expect(result.effectiveMaxAge, `effectiveMaxAge=${result.effectiveMaxAge} 应在 [${expMin}, ${expMax}] 内`).toBeGreaterThanOrEqual(expMin)
            expect(result.effectiveMaxAge, `effectiveMaxAge=${result.effectiveMaxAge} 应在 [${expMin}, ${expMax}] 内`).toBeLessThanOrEqual(expMax)
          })
        }

        // 种族汇总
        it(`${RACE_NAMES[race]} 汇总`, () => {
          const ages = raceResults.map(r => r.deathAge)
          const avg = ages.reduce((a, b) => a + b, 0) / ages.length
          const min = Math.min(...ages)
          const max = Math.max(...ages)
          const inRangeCount = raceResults.filter(r => r.inRange).length
          const agingBeforeThreshold = raceResults.filter(r => r.agingEventBeforeThreshold !== null).length
          const dinnerTriggered = raceResults.filter(r => r.familyDinnerTriggered).length
          const allAnomalies = raceResults.filter(r => r.anomalies.length > 0)

          console.log(`\n  📊 ${RACE_NAMES[race]} 汇总:`)
          console.log(`     寿命配置: [${LIFESPAN_RANGES[race][0]}, ${LIFESPAN_RANGES[race][1]}], median=${MEDIAN_DEATH_AGES[race]}, maxLifespan=${MAX_LIFESPANS[race]}`)
          console.log(`     effectiveMaxAge: ${raceResults.map(r => r.effectiveMaxAge).sort((a,b)=>a-b).join(', ')}`)
          console.log(`     实际享年: ${min}~${max} (平均 ${avg.toFixed(1)})`)
          console.log(`     在寿命范围内: ${inRangeCount}/${SIMS_PER_RACE}`)
          console.log(`     阈值前衰老事件: ${agingBeforeThreshold}/${SIMS_PER_RACE}`)
          console.log(`     family_dinner 触发: ${dinnerTriggered}/${SIMS_PER_RACE}`)
          console.log(`     异常局: ${allAnomalies.length}/${SIMS_PER_RACE}`)
          for (const a of allAnomalies) {
            console.log(`       ⚠️ #${a.run}: ${a.anomalies.join('; ')}`)
          }
        })
      })
    }

    // ==================== 总汇总报告 ====================
    it('输出全种族汇总报告', () => {
      console.log('\n' + '═'.repeat(100))
      console.log('  QA 全种族验证报告 — commit 1dc1592 (fix/debt-event-condition)')
      console.log('═'.repeat(100))

      // 表 1: effectiveMaxAge + 享年 + 寿命范围
      console.log('\n📋 表 1: effectiveMaxAge & 享年')
      console.log('─'.repeat(100))
      console.log(
        '种族     | #  | effectiveMaxAge | 享年 | 寿命范围   | 范围内 | 衰老过早 | family_dinner | 评分 | 等级 | 异常'
      )
      console.log('─'.repeat(100))

      for (const r of allResults) {
        const agingStr = r.agingEventBeforeThreshold
          ? `⚠️ ${r.agingEventBeforeThreshold.age}岁`
          : '✅'
        const dinnerStr = r.familyDinnerTriggered
          ? `✅ ${r.familyDinnerAge}岁`
          : '—'
        const rangeStr = r.inRange ? '✅' : '⚠️'
        const anomalyStr = r.anomalies.length > 0 ? `⚠️ ${r.anomalies[0]}` : ''

        console.log(
          `${RACE_NAMES[r.race].padEnd(8)} | ${String(r.run).padStart(2)} | ` +
          `${String(r.effectiveMaxAge).padStart(15)} | ${String(r.deathAge).padStart(4)} | ` +
          `${String(r.lifespanMin).padStart(2)}~${String(r.lifespanMax).padEnd(3)} | ` +
          `${rangeStr}     | ${agingStr.padEnd(12)} | ${dinnerStr.padEnd(14)} | ` +
          `${String(r.score).padStart(4)} | ${r.grade.padEnd(4)} | ${anomalyStr}`
        )
      }

      // 表 2: 种族汇总
      console.log('\n\n📊 表 2: 种族汇总')
      console.log('─'.repeat(100))
      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const ages = rr.map(r => r.deathAge)
        const avg = ages.reduce((a, b) => a + b, 0) / ages.length
        const min = Math.min(...ages)
        const max = Math.max(...ages)
        const inRange = rr.filter(r => r.inRange).length
        const agingBefore = rr.filter(r => r.agingEventBeforeThreshold !== null).length
        const dinnerOk = rr.filter(r => {
          // family_dinner 应该在有孩子之后触发才算正确
          if (!r.familyDinnerTriggered) return true // 未触发不算异常
          if (r.hadChildAge !== null && r.familyDinnerAge !== null && r.familyDinnerAge >= r.hadChildAge) return true
          return false
        }).length
        const dinnerCount = rr.filter(r => r.familyDinnerTriggered).length
        const anomalyCount = rr.filter(r => r.anomalies.length > 0).length

        console.log(`\n  ${RACE_NAMES[race]} (${SIMS_PER_RACE}局):`)
        console.log(`    maxLifespan=${MAX_LIFESPANS[race]}, medianDeath=${MEDIAN_DEATH_AGES[race]}, lifespanRange=[${LIFESPAN_RANGES[race][0]}, ${LIFESPAN_RANGES[race][1]}]`)
        console.log(`    effectiveMaxAge 范围: [${Math.min(...rr.map(r=>r.effectiveMaxAge))}, ${Math.max(...rr.map(r=>r.effectiveMaxAge))}]`)
        console.log(`    享年: ${min}~${max} (平均 ${avg.toFixed(1)})`)
        console.log(`    寿命范围内: ${inRange}/${SIMS_PER_RACE} (${(inRange/SIMS_PER_RACE*100).toFixed(0)}%)`)
        console.log(`    阈值前衰老事件: ${agingBefore}/${SIMS_PER_RACE}`)
        console.log(`    family_dinner: 触发${dinnerCount}次, 正确顺序${dinnerOk}/${dinnerCount}`)
        console.log(`    异常: ${anomalyCount}/${SIMS_PER_RACE}`)
      }

      // 最终判定
      console.log('\n\n' + '═'.repeat(100))
      const totalAnomalies = allResults.filter(r => r.anomalies.length > 0)
      const criticalAnomalies = totalAnomalies.filter(r =>
        r.anomalies.some(a => a.includes('年龄卡住') || a.includes('effectiveMaxAge'))
      )

      if (criticalAnomalies.length === 0) {
        console.log('  ✅ 通过：无致命异常。所有 effectiveMaxAge 在预期范围内。')
      } else {
        console.log('  ❌ 失败：发现致命异常：')
        for (const a of criticalAnomalies) {
          console.log(`    ⚠️ ${RACE_NAMES[a.race]} #${a.run}: ${a.anomalies.join('; ')}`)
        }
      }

      // 软性报告
      const agingBeforeAny = allResults.filter(r => r.agingEventBeforeThreshold !== null)
      if (agingBeforeAny.length > 0) {
        console.log('\n  ⚠️ 衰老事件过早触发（需人工确认是否合理）：')
        for (const a of agingBeforeAny) {
          console.log(`    ${RACE_NAMES[a.race]} #${a.run}: ${a.agingEventBeforeThreshold!.eventId} @ ${a.agingEventBeforeThreshold!.age}岁`)
        }
      }

      const outOfRange = allResults.filter(r => !r.inRange)
      if (outOfRange.length > 0) {
        console.log('\n  ⚠️ 寿命超出范围（需人工确认是否合理）：')
        for (const a of outOfRange) {
          console.log(`    ${RACE_NAMES[a.race]} #${a.run}: ${a.deathAge}岁 (范围 [${a.lifespanMin}, ${a.lifespanMax}])`)
        }
      }

      console.log('\n' + '═'.repeat(100))

      // 硬性断言
      expect(criticalAnomalies.length, `致命异常: ${JSON.stringify(criticalAnomalies.map(a => a.anomalies))}`).toBe(0)
    })
  })
})
