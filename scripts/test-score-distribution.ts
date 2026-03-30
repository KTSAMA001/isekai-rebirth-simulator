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
  eventLog: { age: number; eventId: string; branchId?: string }[]
  flags: Set<string>
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

  // Simulate until death or maxAge
  for (let year = 0; year < 100; year++) {
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
    eventLog: finalState.eventLog.map(e => ({ age: e.age, eventId: e.eventId, branchId: (e as any).branchId })),
    flags: finalState.flags,
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

  // === 详细事件日志 ===
  console.log('\n' + '='.repeat(60))
  console.log('详细事件日志 + 关联分析')
  console.log('='.repeat(60))

  for (let i = 0; i < N; i++) {
    const d = data[i]
    console.log(`\n--- R${String(i+1).padStart(2)} (age=${d.lifespan}, grade=${d.currentGrade}) ---`)
    for (const ev of d.eventLog) {
      const branch = ev.branchId ? ` [${ev.branchId}]` : ''
      console.log(`  age=${String(ev.age).padStart(2)}  ${ev.eventId}${branch}`)
    }
    const flagArr = [...d.flags].filter(f => !f.startsWith('triggered_') && !f.startsWith('near_') && !f.startsWith('miracle_'))
    if (flagArr.length > 0) {
      console.log(`  最终flags: ${flagArr.join(', ')}`)
    }
  }

  // === 事件关联分析 ===
  console.log('\n' + '='.repeat(60))
  console.log('事件关联分析')
  console.log('='.repeat(60))

  // 1. 链式事件检测：同一局中先后出现的有前置关系的事件
  const chainPairs: Record<string, number> = {}
  const knownChains: Record<string, string> = {
    'bullied': 'bullied_child',
    'bullied_repeat': 'bullied_child',
    'bullied_fight_back': 'bullied_child',
    'heartbreak_growth': 'heartbroken',
    'first_love': 'first_love',
    'love_at_first_sight': 'first_love',
    'marry_noble': 'married',
    'marry_adventurer': 'married',
    'family_blessing': 'parent',
    'lover_death_battlefield': 'married',
    'widowed_wanderer': 'widowed',
    'starlight_promise': 'in_relationship',
    'rescue_from_dungeon': 'in_relationship',
    'soul_bound': 'in_relationship',
  }

  for (const d of data) {
    const events = d.eventLog
    for (let a = 0; a < events.length; a++) {
      for (let b = a + 1; b < events.length; b++) {
        const pair = `${events[a].eventId} → ${events[b].eventId}`
        chainPairs[pair] = (chainPairs[pair] || 0) + 1
      }
    }
  }

  // 输出出现2次以上的连续事件对
  console.log('\n--- 常见事件序列（≥2次） ---')
  const sorted = Object.entries(chainPairs).filter(([,c]) => c >= 2).sort((a,b) => b[1] - a[1])
  for (const [pair, count] of sorted.slice(0, 30)) {
    console.log(`  ${pair}: ${count}次`)
  }

  // 2. 有前置flag但没触发前置事件的情况
  console.log('\n--- 前置Flag问题检测 ---')
  for (const d of data) {
    const eventIds = new Set(d.eventLog.map(e => e.eventId))
    for (const [eventId, requiredFlag] of Object.entries(knownChains)) {
      if (eventIds.has(eventId) && !d.flags.has(requiredFlag) && !eventIds.has(requiredFlag.replace('has.flag.',''))) {
        // Check if the flag was set by an earlier event in the same game
        const flagSetByEvent = d.eventLog.some(e => {
          return e.eventId === 'bullied' || e.eventId === 'bullied_repeat' || 
                 e.eventId === 'first_love' || e.eventId === 'love_at_first_sight' ||
                 e.eventId === 'marry_noble' || e.eventId === 'marry_adventurer'
        })
        console.log(`  R${data.indexOf(d)+1}: ${eventId} 触发了但缺 ${requiredFlag} flag`)
      }
    }
  }

  // 3. 事件触发频率
  console.log('\n--- 全部事件触发频率 ---')
  const eventFreq: Record<string, number> = {}
  for (const d of data) {
    for (const ev of d.eventLog) {
      eventFreq[ev.eventId] = (eventFreq[ev.eventId] || 0) + 1
    }
  }
  const freqSorted = Object.entries(eventFreq).sort((a,b) => b[1] - a[1])
  for (const [eid, count] of freqSorted) {
    const pct = Math.round(count / N * 100)
    console.log(`  ${eid}: ${count}/${N} (${pct}%)`)
  }
}

main()
