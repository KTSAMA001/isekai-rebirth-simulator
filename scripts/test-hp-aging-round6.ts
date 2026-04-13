/**
 * 第六轮 HP 衰老系统验证
 * 验证短寿命补偿系数调整后（3→4）各种族死亡年龄分布
 * 每种族 15 轮，共 60 轮
 * 
 * 运行: npx tsx scripts/test-hp-aging-round6.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'

// ==================== 配置 ====================

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
type RaceId = typeof RACES[number]

const RUNS_PER_RACE = 15

// 配置寿命中值（种族lifespanRange的中点）
const MEDIAN_LIFESPAN: Record<RaceId, number> = {
  human: 85,
  elf: 400,
  goblin: 33,
  dwarf: 170,
}

// 过滤阈值：低于此年龄的死亡视为事件意外死亡（非衰老），单独统计
const EVENT_DEATH_THRESHOLD = 15

// ==================== 工具函数 ====================

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ==================== 核心模拟 ====================

interface SimResult {
  race: RaceId
  runNum: number
  deathAge: number
  causeOfDeath: string
  initHp: number
  effectiveMaxAge: number
}

async function runOneGame(race: string, seed: number): Promise<SimResult> {
  const world = await createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)

  engine.initGame('测试角色', undefined, race)

  // Draft + select talents (pick first 3 non-conflicting)
  const drafted = engine.draftTalents()
  const mutuallyExclusivePairs: [string, string][] = [
    ['dragon_blood', 'demon_heritage'],
  ]
  const selected: string[] = []
  for (const id of drafted) {
    if (selected.length >= 3) break
    const isConflicting = mutuallyExclusivePairs.some(([a, b]) =>
      (id === a && selected.includes(b)) || (id === b && selected.includes(a))
    )
    if (!isConflicting) {
      selected.push(id)
    }
  }
  engine.selectTalents(selected)

  // Allocate attributes: total 20, each 1-10
  const attrs = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const allocation: Record<string, number> = {}
  let remaining = 20
  for (const attr of attrs) {
    const val = Math.min(randInt(1, 5), remaining - (attrs.length - attrs.indexOf(attr) - 1))
    allocation[attr] = Math.max(1, val)
    remaining -= allocation[attr]
  }
  for (const attr of attrs) {
    const add = Math.min(remaining, 10 - allocation[attr])
    allocation[attr] += add
    remaining -= add
    if (remaining <= 0) break
  }

  engine.allocateAttributes(allocation)
  const stateAfterAlloc = engine.getState()
  const initHp = stateAfterAlloc.hp
  const effectiveMaxAge = stateAfterAlloc.effectiveMaxAge ?? 100

  // Simulate until death
  const maxYears = 600 // 足够覆盖精灵
  let causeOfDeath = ''
  for (let year = 0; year < maxYears; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0) {
      causeOfDeath = `HP归零 于 ${stateBefore.age} 岁`
      break
    }

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()

    if (stateAfter.hp <= 0) {
      causeOfDeath = `HP归零 于 ${stateAfter.age} 岁`
      break
    }

    if (yearResult.phase === 'awaiting_choice' && yearResult.event && yearResult.branches && yearResult.branches.length > 0) {
      const available = yearResult.branches.filter(b => {
        if (!b.requireCondition) return true
        const cond = b.requireCondition
        const attrs2 = stateAfter.attributes
        const flags = stateAfter.flags

        const attrMatch = [...cond.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]
        for (const m of attrMatch) {
          const val = attrs2[m[1]] ?? 0
          const num = parseInt(m[3])
          if (m[2] === '>=' && !(val >= num)) return false
          if (m[2] === '>' && !(val > num)) return false
          if (m[2] === '<=' && !(val <= num)) return false
          if (m[2] === '<' && !(val < num)) return false
          if (m[2] === '==' && !(val === num)) return false
        }

        const flagMatch = [...cond.matchAll(/has\.flag\.(\w+)/g)]
        for (const m of flagMatch) {
          if (!flags.has(m[1])) return false
        }

        return true
      })

      if (available.length > 0) {
        engine.resolveBranch(pick(available).id)
      }
    }

    if (year === maxYears - 1) {
      causeOfDeath = `达到最大模拟年数 ${maxYears}`
    }
  }

  const finalState = engine.getState()
  return {
    race: race as RaceId,
    runNum: 0,
    deathAge: finalState.age,
    causeOfDeath: causeOfDeath || `模拟结束 ${finalState.age} 岁`,
    initHp,
    effectiveMaxAge,
  }
}

// ==================== 统计 ====================

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// ==================== 主程序 ====================

async function main() {
  console.log('═'.repeat(80))
  console.log('第六轮 HP 衰老系统验证 — 短寿命补偿系数 3→4')
  console.log('═'.repeat(80))
  console.log()
  console.log(`配置: 每种族 ${RUNS_PER_RACE} 轮，共 ${RACES.length * RUNS_PER_RACE} 轮`)
  console.log(`短寿命补偿公式: shortLifespanDecay = max(0, round(4 * (1 - maxAge/200)))`)
  console.log('  哥布林: +3/年 (maxAge≈33, 4×0.835≈3.34→3)')
  console.log('  人类:   +2/年 (maxAge≈85, 4×0.575≈2.30→2)')
  console.log('  矮人:   +1/年 (maxAge≈170, 4×0.15≈0.60→1)')
  console.log('  精灵:   +0/年 (maxAge≈400, 4×(-1.0)=0→0)')
  console.log()

  const raceNames: Record<RaceId, string> = {
    human: '人类',
    elf: '精灵',
    goblin: '哥布林',
    dwarf: '矮人',
  }

  const results: SimResult[] = []
  let runCount = 0

  for (const race of RACES) {
    console.log(`━━━ ${raceNames[race]} (${race}) ━━━`)
    for (let i = 0; i < RUNS_PER_RACE; i++) {
      const seed = Date.now() * 1000 + runCount * 7 + i * 13 + Math.floor(Math.random() * 100000)
      const result = await runOneGame(race, seed)
      result.runNum = i + 1
      results.push(result)
      runCount++
      const lifeRatio = (result.deathAge / result.effectiveMaxAge * 100).toFixed(0)
      process.stdout.write(`  #${String(i + 1).padStart(2, '0')} 死亡=${String(result.deathAge).padStart(3)}岁 (maxAge=${result.effectiveMaxAge}, lifeRatio=${lifeRatio}%, hp=${result.initHp})\n`)
    }
    console.log()
  }

  // ==================== 统计输出 ====================
  console.log('═'.repeat(80))
  console.log('📊 统计结果')
  console.log('═'.repeat(80))

  for (const race of RACES) {
    const raceResults = results.filter(r => r.race === race)
    const allAges = raceResults.map(r => r.deathAge)
    const normalDeaths = allAges.filter(a => a >= EVENT_DEATH_THRESHOLD)
    const earlyDeaths = allAges.filter(a => a < EVENT_DEATH_THRESHOLD)

    const allMed = median(allAges)
    const allAvg = mean(allAges)
    const allPct = ((allMed / MEDIAN_LIFESPAN[race]) * 100).toFixed(1)

    const normalMed = normalDeaths.length > 0 ? median(normalDeaths) : 0
    const normalAvg = normalDeaths.length > 0 ? mean(normalDeaths) : 0
    const normalPct = normalDeaths.length > 0 ? ((normalMed / MEDIAN_LIFESPAN[race]) * 100).toFixed(1) : 'N/A'

    const allInRange = allMed / MEDIAN_LIFESPAN[race] >= 0.70 && allMed / MEDIAN_LIFESPAN[race] <= 0.85
    const normalInRange = normalMed / MEDIAN_LIFESPAN[race] >= 0.70 && normalMed / MEDIAN_LIFESPAN[race] <= 0.85

    console.log()
    console.log(`  ${raceNames[race]} (配置中值: ${MEDIAN_LIFESPAN[race]})`)
    console.log(`  ┌─────────┬────────┬────────┬────────┬──────┬──────┬──────────┬──────┐`)
    console.log(`  │ 数据集  │  均值  │ 中位数 │  最小  │ 最大  │  早死  │ 比率%   │ 状态 │`)
    console.log(`  ├─────────┼────────┼────────┼────────┼──────┼──────┼──────────┼──────┤`)
    console.log(`  │ 全部    │ ${String(allAvg.toFixed(1)).padStart(6)} │ ${String(allMed).padStart(6)} │ ${String(Math.min(...allAges)).padStart(6)} │ ${String(Math.max(...allAges)).padStart(4)} │ ${String(earlyDeaths.length).padStart(2)}例  │ ${String(allPct).padStart(6)}%  │ ${allInRange ? '✅' : '⚠️'}   │`)
    if (earlyDeaths.length > 0) {
      console.log(`  │ 过滤早死│ ${String(normalAvg.toFixed(1)).padStart(6)} │ ${String(normalMed).padStart(6)} │ ${String(Math.min(...normalDeaths)).padStart(6)} │ ${String(Math.max(...normalDeaths)).padStart(4)} │  -    │ ${String(normalPct).padStart(6)}%  │ ${normalInRange ? '✅' : '⚠️'}   │`)
    }
    console.log(`  └─────────┴────────┴────────┴────────┴──────┴──────┴──────────┴──────┘`)

    if (earlyDeaths.length > 0) {
      const earlyDetails = raceResults.filter(r => r.deathAge < EVENT_DEATH_THRESHOLD)
      console.log(`  ⚠️ 早死详情 (事件意外，非衰老): ${earlyDetails.map(r => `${r.deathAge}岁`).join(', ')}`)
    }

    console.log(`  数据: [${allAges.sort((a, b) => a - b).join(', ')}]`)
  }

  // ==================== 总结 ====================
  console.log()
  console.log('═'.repeat(80))
  console.log('📋 总结')
  console.log('═'.repeat(80))
  console.log()

  // 构建汇总表
  console.log('  种族     │ 配置中值 │ 全部中位数 │ 全部比率 │ 过滤中位数 │ 过滤比率 │ 判定')
  console.log('  ─────────┼──────────┼───────────┼─────────┼───────────┼─────────┼──────')

  let passCount = 0
  let totalCount = 0

  for (const race of RACES) {
    const raceResults = results.filter(r => r.race === race)
    const allAges = raceResults.map(r => r.deathAge)
    const normalDeaths = allAges.filter(a => a >= EVENT_DEATH_THRESHOLD)

    const allMed = median(allAges)
    const allPct = (allMed / MEDIAN_LIFESPAN[race]) * 100
    const normalMed = normalDeaths.length > 0 ? median(normalDeaths) : allMed
    const normalPct = (normalMed / MEDIAN_LIFESPAN[race]) * 100

    // 判定标准：使用过滤后数据（排除事件早死）
    const pass = normalPct >= 70 && normalPct <= 85
    if (pass) passCount++
    totalCount++

    const allPctStr = allPct.toFixed(1).padStart(5)
    const normalPctStr = normalPct.toFixed(1).padStart(5)
    const verdict = pass ? '✅ 通过' : '⚠️ 偏低'

    console.log(`  ${raceNames[race].padEnd(6)}  │ ${String(MEDIAN_LIFESPAN[race]).padStart(8)} │ ${String(allMed).padStart(9)} │ ${allPctStr}%  │ ${String(normalMed).padStart(9)} │ ${normalPctStr}%  │ ${verdict}`)
  }

  console.log()
  if (passCount === totalCount) {
    console.log(`  ✅ 全部 ${totalCount} 个种族通过验证（过滤早死后，中位数/配置中值在 70%-85%）`)
  } else {
    console.log(`  ⚠️ ${passCount}/${totalCount} 个种族通过验证`)
  }
  console.log()
  console.log('═'.repeat(80))
}

main()
