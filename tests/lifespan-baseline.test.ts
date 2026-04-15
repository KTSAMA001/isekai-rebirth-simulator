/**
 * 寿命分布基准测试
 * 跑 500 次/种族完整模拟，统计死亡年龄分布
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import type { Gender, WorldInstance } from '@/engine/core/types'

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const SIM_COUNT = 500

const RACE_NAMES: Record<string, string> = {
  human: '人类',
  elf: '精灵',
  goblin: '哥布林',
  dwarf: '矮人',
}

// 种族 lifespanRange（来自 races.json）
const LIFESPAN_RANGES: Record<string, [number, number]> = {
  human: [65, 85],
  elf: [250, 400],
  goblin: [20, 35],
  dwarf: [150, 250],
}

function runFullSimulation(world: WorldInstance, race: string): number {
  const engine = new SimulationEngine(world)
  const preset = 'random_1'
  const gender: Gender = 'male'

  engine.initGame('Test', preset, race, gender)

  // 抽天赋
  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, 3))

  // 分配属性
  const state = engine.getState()
  const visibleAttrs = world.attributes.filter(a => !a.hidden)
  const pointsPerAttr = Math.floor((world.manifest.initialPoints - state.talentPenalty) / visibleAttrs.length)
  const allocation: Record<string, number> = {}
  for (const attr of visibleAttrs) {
    allocation[attr.id] = pointsPerAttr
  }
  engine.allocateAttributes(allocation)

  // 模拟到死
  let maxIter = 2000
  let prevAge = 0
  let stagnant = 0

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
        } catch { continue }
      }
      if (!resolved) engine.skipYear()
    } else if (yearResult.phase === 'mundane_year') {
      engine.skipYear()
    }

    const s = engine.getState()
    if (s.age === prevAge) {
      stagnant++
      if (stagnant > 5) break
    } else {
      stagnant = 0
      prevAge = s.age
    }
    maxIter--
  }

  const final = engine.getState()
  if (final.phase !== 'finished') engine.finish()
  return engine.getState().result!.lifespan
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

describe('寿命分布基准测试', () => {
  let world: WorldInstance

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events,
      data.achievements, data.items ?? [], data.presets, data.scoringRule, data.races
    )
    world.evaluations = data.evaluations
  })

  for (const race of RACES) {
    it(`${RACE_NAMES[race]} ${SIM_COUNT} 次模拟寿命分布`, { timeout: 120000 }, () => {
      const ages: number[] = []
      for (let i = 0; i < SIM_COUNT; i++) {
        ages.push(runFullSimulation(world, race))
      }

      ages.sort((a, b) => a - b)
      const min = ages[0]
      const max = ages[ages.length - 1]
      const mean = ages.reduce((a, b) => a + b, 0) / ages.length
      const median = percentile(ages, 50)
      const p5 = percentile(ages, 5)
      const p10 = percentile(ages, 10)
      const p25 = percentile(ages, 25)
      const p75 = percentile(ages, 75)
      const p90 = percentile(ages, 90)
      const p95 = percentile(ages, 95)

      const [rangeMin, rangeMax] = LIFESPAN_RANGES[race]
      const withinRange = ages.filter(a => a >= rangeMin && a <= rangeMax).length
      const belowRange = ages.filter(a => a < rangeMin).length
      const aboveRange = ages.filter(a => a > rangeMax).length

      console.log(`\n========== ${RACE_NAMES[race]} 寿命分布 (${SIM_COUNT}次) ==========`)
      console.log(`  lifespanRange: [${rangeMin}, ${rangeMax}]`)
      console.log(`  最小=${min}, 最大=${max}`)
      console.log(`  平均=${mean.toFixed(1)}, 中位数=${median.toFixed(1)}`)
      console.log(`  分位数: P5=${p5}, P10=${p10}, P25=${p25}, P50=${median}, P75=${p75}, P90=${p90}, P95=${p95}`)
      console.log(`  范围内: ${withinRange}/${SIM_COUNT} (${(withinRange/SIM_COUNT*100).toFixed(1)}%)`)
      console.log(`  低于下限: ${belowRange}/${SIM_COUNT} (${(belowRange/SIM_COUNT*100).toFixed(1)}%)`)
      console.log(`  高于上限: ${aboveRange}/${SIM_COUNT} (${(aboveRange/SIM_COUNT*100).toFixed(1)}%)`)

      // 直方图（10个桶）
      const bucketCount = 10
      const bucketSize = (max - min) / bucketCount || 1
      const buckets: number[] = new Array(bucketCount).fill(0)
      for (const a of ages) {
        const idx = Math.min(Math.floor((a - min) / bucketSize), bucketCount - 1)
        buckets[idx]++
      }
      console.log(`  直方图:`)
      for (let i = 0; i < bucketCount; i++) {
        const lo = (min + i * bucketSize).toFixed(0)
        const hi = (min + (i + 1) * bucketSize).toFixed(0)
        const bar = '█'.repeat(Math.ceil(buckets[i] / SIM_COUNT * 50))
        console.log(`    ${lo.padStart(5)}-${hi.padStart(5)}: ${bar} (${buckets[i]})`)
      }

      // 基本断言
      expect(min).toBeGreaterThan(0)
    })
  }
})
