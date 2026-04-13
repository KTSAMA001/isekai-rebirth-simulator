/**
 * QA Phase 1 验证 — 种族衰老/事件合理性
 *
 * 验证项：
 * 1. 人类寿命范围（目标大部分 65-85，少数早亡/长寿）
 * 2. 人类：无 50 岁前 eventId 含 "elder" 的事件
 * 3. 精灵：elder 事件触发年龄 > 275
 * 4. 哥布林：无 12 岁前 eventId 含 "elder" 或 "middle" 的事件
 * 5. 全种族：记录享年分布
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import type { Gender, WorldInstance } from '@/engine/core/types'

// ==================== 配置 ====================

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const RACE_NAMES: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林', dwarf: '矮人',
}

const GENDERS: Gender[] = ['male', 'female']
const PRESETS = ['random_1', 'random_2', 'random_3'] as const
const SIMS_PER_RACE = 5
const SEEDS = [1, 2, 3, 4, 5]

// 人类寿命合理范围
const HUMAN_EXPECTED_MIN = 65
const HUMAN_EXPECTED_MAX = 85
const HUMAN_TOLERANCE_MIN = 40  // 允许少数早亡的底线
const HUMAN_TOLERANCE_MAX = 100 // 允许少数长寿的上限

// ==================== 模拟结果接口 ====================

interface SimResult {
  race: string
  gender: Gender
  seed: number
  deathAge: number
  events: Array<{ age: number; eventId: string; title: string }>
  agingHints: Array<{ age: number; hint: string }>
}

// ==================== 核心模拟函数 ====================

function runGame(world: WorldInstance, race: string, gender: Gender, seed: number): SimResult {
  const engine = new SimulationEngine(world, seed)
  engine.initGame('Test', 'random_1', race, gender)

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

  const events: SimResult['events'] = []
  const agingHints: SimResult['agingHints'] = []
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
      if (stuckCount > 5) break
    } else {
      stuckCount = 0
      prevAge = currentState.age
    }
    maxIter--
  }

  if (engine.getState().phase !== 'finished') engine.finish()

  const finalState = engine.getState()
  const deathAge = finalState.result?.lifespan ?? finalState.age

  // 从 eventLog 提取事件
  for (const log of finalState.eventLog) {
    if (log.eventId === '__mundane__') continue
    events.push({ age: log.age, eventId: log.eventId, title: log.title })
  }

  return { race, gender, seed, deathAge, events, agingHints }
}

// ==================== 检查函数 ====================

/** 检查项 1: 人类寿命范围（大部分 65-85，少数 40-100） */
function checkHumanLifespan(results: SimResult[]) {
  const humanAges = results.filter(r => r.race === 'human').map(r => r.deathAge)
  const inRange = humanAges.filter(a => a >= HUMAN_EXPECTED_MIN && a <= HUMAN_EXPECTED_MAX).length
  const outOfTolerance = humanAges.filter(a => a < HUMAN_TOLERANCE_MIN || a > HUMAN_TOLERANCE_MAX)
  return { humanAges, inRange, outOfTolerance, total: humanAges.length }
}

/** 检查项 2: 人类 50 岁前 elder 事件 */
function checkHumanElderBefore50(results: SimResult[]) {
  const violations: Array<{ seed: number; age: number; eventId: string; title: string }> = []
  for (const r of results) {
    if (r.race !== 'human') continue
    for (const evt of r.events) {
      if (evt.eventId.includes('elder') && evt.age < 50) {
        violations.push({ seed: r.seed, age: evt.age, eventId: evt.eventId, title: evt.title })
      }
    }
  }
  return violations
}

/** 检查项 3: 精灵 elder 事件年龄 >= 350（lifeStage elder 起始） */
function checkElfElderAfter275(results: SimResult[]) {
  const violations: Array<{ seed: number; age: number; eventId: string; title: string }> = []
  const records: Array<{ seed: number; age: number; eventId: string }> = []
  for (const r of results) {
    if (r.race !== 'elf') continue
    for (const evt of r.events) {
      if (evt.eventId.includes('elder')) {
        records.push({ seed: r.seed, age: evt.age, eventId: evt.eventId })
        if (evt.age < 350) {
          violations.push({ seed: r.seed, age: evt.age, eventId: evt.eventId, title: evt.title })
        }
      }
    }
  }
  return { violations, records }
}

/** 检查项 4: 哥布林 12 岁前无 elder/middle 事件 */
function checkGoblinEarlyElderMiddle(results: SimResult[]) {
  const violations: Array<{ seed: number; age: number; eventId: string; title: string }> = []
  for (const r of results) {
    if (r.race !== 'goblin') continue
    for (const evt of r.events) {
      if (evt.age < 12 && (evt.eventId.includes('elder') || evt.eventId.includes('middle'))) {
        violations.push({ seed: r.seed, age: evt.age, eventId: evt.eventId, title: evt.title })
      }
    }
  }
  return violations
}

// ==================== 测试 ====================

describe('QA Phase 1 — 种族衰老/事件合理性验证', () => {
  let world: WorldInstance
  let allResults: SimResult[] = []

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events,
      data.achievements, data.items ?? [], data.presets, data.scoringRule, data.races
    )
    world.evaluations = data.evaluations
  })

  // ==================== 批量模拟 ====================

  describe('批量模拟（4 种族 × 5 局）', () => {
    for (const race of RACES) {
      describe(`${RACE_NAMES[race]}`, () => {
        const raceResults: SimResult[] = []

        for (let i = 0; i < SIMS_PER_RACE; i++) {
          const seed = SEEDS[i]
          const gender = GENDERS[i % 2]

          it(`#${i + 1} (${gender === 'male' ? '♂' : '♀'}, seed=${seed})`, () => {
            const result = runGame(world, race, gender, seed)
            raceResults.push(result)
            allResults.push(result)

            console.log(
              `  🎲 ${RACE_NAMES[race]} #${i + 1}: ` +
              `享年=${result.deathAge} ` +
              `事件数=${result.events.length} ` +
              `agingHints=${result.agingHints.length}`
            )

            expect(result.deathAge).toBeGreaterThan(0)
          })
        }

        // 种族汇总
        it(`${RACE_NAMES[race]} 汇总`, () => {
          const ages = raceResults.map(r => r.deathAge)
          const avg = ages.reduce((a, b) => a + b, 0) / ages.length
          const min = Math.min(...ages)
          const max = Math.max(...ages)

          console.log(`\n  📊 ${RACE_NAMES[race]} 汇总:`)
          console.log(`     享年: ${ages.join(', ')} (平均 ${avg.toFixed(1)}, 范围 ${min}~${max})`)
        })
      })
    }
  })

  // ==================== 检查项 1: 人类寿命范围 ====================
  describe('检查项 1: 人类寿命范围 (65-85 大部分, 40-100 容忍)', () => {
    it('人类寿命大部分在 65-85 范围内', () => {
      const { humanAges, inRange, outOfTolerance, total } = checkHumanLifespan(allResults)

      console.log('\n📋 检查项 1: 人类寿命范围')
      console.log('─'.repeat(80))
      console.log(`    享年: ${humanAges.join(', ')}`)
      console.log(`    目标范围 65-85: ${inRange}/${total} 局达标`)
      if (outOfTolerance.length > 0) {
        console.log(`    ⚠️ 超出容忍范围 (40-100): ${outOfTolerance.join(', ')}`)
      }

      // "大部分"意味着至少 60% 在 65-85 范围
      const ratio = inRange / total
      const pass = ratio >= 0.6 && outOfTolerance.length === 0
      console.log(`  ${pass ? '✅' : '❌'} ${ratio >= 0.6 ? '大部分' : '不足60%'}在 65-85, ${outOfTolerance.length === 0 ? '无' : '有'}超出容忍`)

      // 软断言：容忍范围外的不应存在
      expect(outOfTolerance.length, `人类有 ${outOfTolerance.length} 局超出容忍范围`).toBe(0)
      // 软断言：大部分应在目标范围
      expect(ratio, `仅 ${inRange}/${total} 局在 65-85 范围 (需 >=60%)`).toBeGreaterThanOrEqual(0.6)
    })
  })

  // ==================== 检查项 2: 人类 50 岁前 elder 事件 ====================
  describe('检查项 2: 人类无 50 岁前 elder 事件', () => {
    it('人类无 50 岁前 eventId 含"elder"的事件', () => {
      const violations = checkHumanElderBefore50(allResults)

      console.log('\n📋 检查项 2: 人类 elder 事件 (阈值: 50岁)')
      console.log('─'.repeat(80))

      const humanResults = allResults.filter(r => r.race === 'human')
      for (const r of humanResults) {
        const elderEvents = r.events.filter(e => e.eventId.includes('elder'))
        if (elderEvents.length > 0) {
          for (const evt of elderEvents) {
            const flag = evt.age < 50 ? '⚠️过早' : '✅合理'
            console.log(`    ${flag} seed=${r.seed} ${evt.age}岁: ${evt.eventId} — ${evt.title}`)
          }
        } else {
          console.log(`    — seed=${r.seed}: 无 elder 事件`)
        }
      }

      if (violations.length === 0) {
        console.log(`  ✅ 通过: 无违规`)
      } else {
        console.log(`  ❌ 失败: ${violations.length} 项违规`)
      }

      expect(violations.length, `人类 50 岁前有 ${violations.length} 个 elder 事件`).toBe(0)
    })
  })

  // ==================== 检查项 3: 精灵 elder > 275 ====================
  describe('检查项 3: 精灵 elder 事件触发年龄 > 275', () => {
    it('精灵 elder 事件触发年龄 > 275', () => {
      const { violations, records } = checkElfElderAfter275(allResults)

      console.log('\n📋 检查项 3: 精灵 elder 事件 (阈值: 275岁)')
      console.log('─'.repeat(80))

      if (records.length === 0) {
        console.log('    无 elder 事件触发（5 局均未触发）')
      } else {
        for (const rec of records) {
          const flag = rec.age <= 275 ? '⚠️过早' : '✅合理'
          console.log(`    ${flag} seed=${rec.seed} ${rec.age}岁: ${rec.eventId}`)
        }
      }

      if (violations.length === 0) {
        console.log(`  ✅ 通过: 无违规${records.length > 0 ? ` (${records.length} 条 elder 事件均 > 275)` : ''}`)
      } else {
        console.log(`  ❌ 失败: ${violations.length} 项违规`)
      }

      expect(violations.length, `精灵有 ${violations.length} 个 elder 事件在 ≤275 岁触发`).toBe(0)
    })
  })

  // ==================== 检查项 4: 哥布林 12 岁前无 elder/middle ====================
  describe('检查项 4: 哥布林无 12 岁前 elder/middle 事件', () => {
    it('哥布林无 12 岁前 eventId 含"elder"或"middle"的事件', () => {
      const violations = checkGoblinEarlyElderMiddle(allResults)

      console.log('\n📋 检查项 4: 哥布林 elder/middle 事件 (阈值: 12岁)')
      console.log('─'.repeat(80))

      const goblinResults = allResults.filter(r => r.race === 'goblin')
      for (const r of goblinResults) {
        const earlyEvents = r.events.filter(e =>
          e.age < 12 && (e.eventId.includes('elder') || e.eventId.includes('middle'))
        )
        if (earlyEvents.length > 0) {
          for (const evt of earlyEvents) {
            console.log(`    ⚠️ seed=${r.seed} ${evt.age}岁: ${evt.eventId} — ${evt.title}`)
          }
        } else {
          console.log(`    ✅ seed=${r.seed}: 12岁前无 elder/middle 事件`)
        }
      }

      if (violations.length === 0) {
        console.log(`  ✅ 通过: 无违规`)
      } else {
        console.log(`  ❌ 失败: ${violations.length} 项违规`)
      }

      expect(violations.length, `哥布林 12 岁前有 ${violations.length} 个 elder/middle 事件`).toBe(0)
    })
  })

  // ==================== 检查项 5: 全种族享年分布 ====================
  describe('检查项 5: 全种族享年分布', () => {
    it('输出全种族享年分布', () => {
      console.log('\n📋 检查项 5: 全种族享年分布')
      console.log('─'.repeat(80))

      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const ages = rr.map(r => r.deathAge).sort((a, b) => a - b)
        const avg = ages.reduce((a, b) => a + b, 0) / ages.length
        const min = Math.min(...ages)
        const max = Math.max(...ages)

        console.log(`  ${RACE_NAMES[race]}: [${ages.join(', ')}]`)
        console.log(`    最小=${min} 最大=${max} 平均=${avg.toFixed(1)}`)
      }

      // 总汇总表
      console.log('\n' + '═'.repeat(80))
      console.log('  Phase 1 验证汇总')
      console.log('═'.repeat(80))

      for (const race of RACES) {
        const rr = allResults.filter(r => r.race === race)
        const ages = rr.map(r => r.deathAge)
        const avg = ages.reduce((a, b) => a + b, 0) / ages.length
        console.log(
          `  ${RACE_NAMES[race].padEnd(6)} | ` +
          `${ages.map(a => String(a).padStart(4)).join(', ')} | ` +
          `avg=${avg.toFixed(1)}`
        )
      }

      // 检查结果汇总
      const h = checkHumanLifespan(allResults)
      const v2 = checkHumanElderBefore50(allResults)
      const v3 = checkElfElderAfter275(allResults).violations
      const v4 = checkGoblinEarlyElderMiddle(allResults)

      console.log('\n  验证结果:')
      console.log(`    ${h.outOfTolerance.length === 0 && h.inRange / h.total >= 0.6 ? '✅' : '❌'} 检查项 1 (人类寿命 65-85): ${h.inRange}/${h.total}达标${h.outOfTolerance.length > 0 ? `, ${h.outOfTolerance.length}超容忍` : ''}`)
      console.log(`    ✅/❌ 检查项 2 (人类 elder < 50):  ${v2.length === 0 ? '✅ 通过' : `❌ ${v2.length} 项违规`}`)
      console.log(`    ✅/❌ 检查项 3 (精灵 elder ≤ 275): ${v3.length === 0 ? '✅ 通过' : `❌ ${v3.length} 项违规`}`)
      console.log(`    ✅/❌ 检查项 4 (哥布林 elder/middle < 12): ${v4.length === 0 ? '✅ 通过' : `❌ ${v4.length} 项违规`}`)
      console.log(`    📊 检查项 5 (享年分布): 已记录（共 ${allResults.length} 局）`)

      console.log('\n' + '═'.repeat(80))

      // 占位断言
      expect(true).toBe(true)
    })
  })
})
