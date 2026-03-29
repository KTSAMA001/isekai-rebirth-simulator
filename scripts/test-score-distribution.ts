/**
 * 评分分布统计脚本 — 跑 N 局收集 peakSum 和 lifespan 数据
 * 运行: npx tsx scripts/test-score-distribution.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface ScoreData {
  peakSum: number
  lifespan: number
  currentScore: number
  currentGrade: string
}

function runOneGame(seed: number): ScoreData {
  const world = createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)

  engine.initGame('测试角色')

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
    if (!isConflicting) selected.push(id)
  }
  engine.selectTalents(selected)

  const attrs = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const allocation: Record<string, number> = {}
  let remaining = 20
  for (const attr of attrs) {
    const val = Math.min(rand(1, 5), remaining - (attrs.length - attrs.indexOf(attr) - 1))
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

  // Simulate until death or 80
  for (let year = 0; year < 80; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0) break

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()

    if (stateAfter.hp <= 0) break
    if (stateAfter.age >= 80) break

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
        const branch = pick(available)
        engine.resolveBranch(branch.id)
      }
    }
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world)
  const result = evaluator.calculate(finalState)

  return {
    peakSum: result.details.totalAttributePeakSum,
    lifespan: result.details.lifespan,
    currentScore: result.score,
    currentGrade: result.grade,
  }
}

function main() {
  const N = 20
  const data: ScoreData[] = []

  console.log(`📊 评分分布统计 — ${N} 局\n`)
  console.log('局 | peakSum | lifespan | score | grade')
  console.log('---|---------|----------|-------|-----')

  for (let i = 1; i <= N; i++) {
    const seed = 1000 + i * 7919
    const d = runOneGame(seed)
    data.push(d)
    console.log(`${String(i).padStart(2)} | ${String(d.peakSum).padStart(7)} | ${String(d.lifespan).padStart(8)} | ${String(d.currentScore).padStart(5)} | ${d.currentGrade}`)
  }

  console.log('\n--- 统计 ---')

  const peakSums = data.map(d => d.peakSum).sort((a, b) => a - b)
  const lifespans = data.map(d => d.lifespan).sort((a, b) => a - b)
  const scores = data.map(d => d.currentScore).sort((a, b) => a - b)

  console.log(`\npeakSum:   min=${peakSums[0]}  max=${peakSums[N-1]}  median=${peakSums[Math.floor(N/2)]}  avg=${(peakSums.reduce((a,b)=>a+b,0)/N).toFixed(1)}`)
  console.log(`lifespan:  min=${lifespans[0]}  max=${lifespans[N-1]}  median=${lifespans[Math.floor(N/2)]}  avg=${(lifespans.reduce((a,b)=>a+b,0)/N).toFixed(1)}`)
  console.log(`score:     min=${scores[0]}  max=${scores[N-1]}  median=${scores[Math.floor(N/2)]}  avg=${(scores.reduce((a,b)=>a+b,0)/N).toFixed(1)}`)

  // 分级统计
  const gradeCounts = new Map<string, number>()
  for (const d of data) {
    gradeCounts.set(d.currentGrade, (gradeCounts.get(d.currentGrade) ?? 0) + 1)
  }
  console.log('\n当前评级分布:')
  for (const [grade, count] of gradeCounts) {
    const pct = Math.round(count / N * 100)
    console.log(`  ${grade}: ${count}/${N} (${pct}%)`)
  }

  // 分位数
  console.log('\nscore 分位数:')
  for (const p of [10, 25, 50, 75, 90]) {
    const idx = Math.floor(N * p / 100)
    console.log(`  P${p}: ${scores[Math.min(idx, N-1)]}`)
  }
}

main()
