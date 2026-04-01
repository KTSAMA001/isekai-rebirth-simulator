/**
 * 最终验证脚本 — 阶段5
 * 运行: npx tsx scripts/test-final-validation.ts
 * 输出：评级分布、属性统计、寿命-评分相关系数、90+存活、路线激活
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

interface RunResult {
  grade: string
  score: number
  lifespan: number
  peakSum: number
  finalAttrs: Record<string, number>
  flags: Set<string>
  activeRoute: string | null
  routeHistory: string[] // 记录每局中曾经激活过的路线
}

function runOneGame(seed: number): RunResult {
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

  // 模拟直到死亡（不限制80岁，允许活到100+）
  for (let year = 0; year < 120; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0) break

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()

    if (stateAfter.hp <= 0) break

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
  const route = engine.getActiveRoute()

  // 追踪曾经进入过的路线（通过entryFlag推断）
  const routeEntryFlagMap: Record<string, string> = {
    mage: 'on_mage_path',
    knight: 'on_knight_path',
    adventurer: 'on_adventurer_path',
    merchant: 'on_merchant_path',
    scholar: 'on_scholar_path',
  }
  const routeHistory: string[] = []
  for (const [routeId, entryFlag] of Object.entries(routeEntryFlagMap)) {
    if (finalState.flags.has(entryFlag)) {
      routeHistory.push(routeId)
    }
  }
  if (routeHistory.length === 0) routeHistory.push('commoner')

  return {
    grade: result.grade,
    score: result.score,
    lifespan: result.details.lifespan,
    peakSum: result.details.totalAttributePeakSum,
    finalAttrs: { ...finalState.attributes },
    flags: finalState.flags,
    activeRoute: route ? route.id : null,
    routeHistory,
  }
}

// 皮尔逊相关系数
function pearson(x: number[], y: number[]): number {
  const n = x.length
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  return dx2 === 0 || dy2 === 0 ? 0 : num / Math.sqrt(dx2 * dy2)
}

function main() {
  const N = 50
  const data: RunResult[] = []

  console.log(`📊 最终验证 — ${N} 局模拟\n`)

  for (let i = 1; i <= N; i++) {
    const seed = 2000 + i * 3571
    const r = runOneGame(seed)
    data.push(r)
    console.log(`#${String(i).padStart(2)} age=${String(r.lifespan).padStart(3)} score=${String(r.score).padStart(6)} grade=${r.grade} routes=${r.routeHistory.join('+')}`)
  }

  // 1. 评级分布
  console.log('\n' + '='.repeat(50))
  console.log('1. 评级分布')
  console.log('='.repeat(50))
  const gradeOrder = ['S', 'A', 'B', 'C', 'D']
  const gradeCounts = new Map<string, number>()
  for (const d of data) {
    gradeCounts.set(d.grade, (gradeCounts.get(d.grade) ?? 0) + 1)
  }
  for (const g of gradeOrder) {
    const c = gradeCounts.get(g) ?? 0
    if (c > 0) console.log(`  ${g}: ${c}/${N} (${(c / N * 100).toFixed(0)}%)`)
  }
  // 其他未列出的评级
  for (const [g, c] of gradeCounts) {
    if (!gradeOrder.includes(g)) console.log(`  ${g}: ${c}/${N} (${(c / N * 100).toFixed(0)}%)`)
  }

  // 2. 各属性最终均值和标准差
  console.log('\n' + '='.repeat(50))
  console.log('2. 各属性最终均值和标准差')
  console.log('='.repeat(50))
  const attrNames = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const attrLabels: Record<string, string> = {
    str: '体魄', mag: '魔力', int: '智力', spr: '灵魂', chr: '魅力', mny: '财富', luk: '运气',
  }
  for (const attr of attrNames) {
    const vals = data.map(d => d.finalAttrs[attr] ?? 0)
    const mean = vals.reduce((a, b) => a + b, 0) / N
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / N)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    console.log(`  ${attrLabels[attr]}(${attr}): mean=${mean.toFixed(1)} std=${std.toFixed(1)} min=${min} max=${max}`)
  }

  // 3. 寿命-评分相关系数
  console.log('\n' + '='.repeat(50))
  console.log('3. 寿命-评分相关系数')
  console.log('='.repeat(50))
  const lifespans = data.map(d => d.lifespan)
  const scores = data.map(d => d.score)
  const corr = pearson(lifespans, scores)
  console.log(`  Pearson r(lifespan, score) = ${corr.toFixed(4)}`)

  // 4. 90+ 岁存活数量
  console.log('\n' + '='.repeat(50))
  console.log('4. 90+ 岁存活数量')
  console.log('='.repeat(50))
  const alive90 = data.filter(d => d.lifespan >= 90).length
  const alive80 = data.filter(d => d.lifespan >= 80).length
  const alive70 = data.filter(d => d.lifespan >= 70).length
  console.log(`  ≥70岁: ${alive70}/${N} (${(alive70 / N * 100).toFixed(0)}%)`)
  console.log(`  ≥80岁: ${alive80}/${N} (${(alive80 / N * 100).toFixed(0)}%)`)
  console.log(`  ≥90岁: ${alive90}/${N} (${(alive90 / N * 100).toFixed(0)}%)`)

  // 寿命分布
  const lifespanMean = lifespans.reduce((a, b) => a + b, 0) / N
  const lifespanStd = Math.sqrt(lifespans.reduce((a, b) => a + (b - lifespanMean) ** 2, 0) / N)
  console.log(`  寿命均值: ${lifespanMean.toFixed(1)} ± ${lifespanStd.toFixed(1)}`)

  // 5. 路线激活情况
  console.log('\n' + '='.repeat(50))
  console.log('5. 路线激活情况')
  console.log('='.repeat(50))
  const routeCounts = new Map<string, number>()
  for (const d of data) {
    for (const r of d.routeHistory) {
      routeCounts.set(r, (routeCounts.get(r) ?? 0) + 1)
    }
  }
  const allRoutes = ['commoner', 'mage', 'knight', 'adventurer', 'merchant', 'scholar']
  for (const r of allRoutes) {
    const count = routeCounts.get(r) ?? 0
    if (count > 0) console.log(`  ${r}: ${count}/${N} (${(count / N * 100).toFixed(0)}%)`)
  }

  // 路线组合统计
  const comboCounts = new Map<string, number>()
  for (const d of data) {
    const key = d.routeHistory.join('+')
    comboCounts.set(key, (comboCounts.get(key) ?? 0) + 1)
  }
  console.log('\n  路线组合分布:')
  for (const [combo, count] of [...comboCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${combo}: ${count}/${N} (${(count / N * 100).toFixed(0)}%)`)
  }

  // 路线相关flag详细检测
  console.log('\n  路线入场flag检测:')
  const routeEntryFlags = [
    'magic_student', 'knight', 'guild_member', 'merchant_apprentice',
    'has_student', 'famous_inventor',
  ]
  for (const f of routeEntryFlags) {
    const count = data.filter(d => d.flags.has(f)).length
    if (count > 0) console.log(`    ${f}: ${count}/${N} (${(count / N * 100).toFixed(0)}%)`)
  }

  // 评分汇总
  console.log('\n' + '='.repeat(50))
  console.log('评分汇总')
  console.log('='.repeat(50))
  const scoreMean = scores.reduce((a, b) => a + b, 0) / N
  const scoreStd = Math.sqrt(scores.reduce((a, b) => a + (b - scoreMean) ** 2, 0) / N)
  const sortedScores = [...scores].sort((a, b) => a - b)
  console.log(`  mean=${scoreMean.toFixed(1)} std=${scoreStd.toFixed(1)}`)
  console.log(`  min=${sortedScores[0].toFixed(1)} max=${sortedScores[N - 1].toFixed(1)}`)
  console.log(`  P25=${sortedScores[Math.floor(N * 0.25)].toFixed(1)} P50=${sortedScores[Math.floor(N * 0.5)].toFixed(1)} P75=${sortedScores[Math.floor(N * 0.75)].toFixed(1)}`)
}

main()
