/**
 * 50轮综合测试脚本 — 完整数值分析
 * 运行: npx tsx scripts/test-comprehensive-50.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { AttributeSnapshot } from '../src/engine/core/types'

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface RoundData {
  round: number
  seed: number
  peakSum: number
  lifespan: number
  currentScore: number
  currentGrade: number
  /** 完整事件链（含分支选择+属性变化） */
  eventChain: EventChainEntry[]
  /** 属性历史快照（每岁） */
  attrHistory: AttributeSnapshot[]
  /** 最终属性值 */
  finalAttrs: Record<string, number>
  /** 属性峰值 */
  peaks: Record<string, number>
  /** 最终 flags */
  flags: Set<string>
  /** 物品数量 */
  itemCount: number
}

interface EventChainEntry {
  age: number
  eventId: string
  eventTitle: string
  branchId?: string
  branchTitle?: string
  effectTexts: string[]
  /** 触发此事件后各属性的变化量 */
  attrDelta: Record<string, number>
  /** 触发此事件后各属性的绝对值 */
  attrAfter: Record<string, number>
}

function runOneGame(seed: number, roundNum: number): RoundData {
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

  const eventChain: EventChainEntry[] = []

  // Simulate until death or maxAge=100
  for (let year = 0; year < 100; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0) break
    if (stateBefore.phase === 'finished') break

    // 记录事件前属性
    const attrsBefore = { ...stateBefore.attributes }

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()

    if (stateAfter.hp <= 0 || stateAfter.phase === 'finished') {
      // 记录最后的事件（如果有）
      if (yearResult.logEntry) {
        const attrsAfter = { ...stateAfter.attributes }
        const delta: Record<string, number> = {}
        for (const key of attrs) {
          delta[key] = (attrsAfter[key] ?? 0) - (attrsBefore[key] ?? 0)
        }
        eventChain.push({
          age: stateAfter.age,
          eventId: yearResult.logEntry.eventId,
          eventTitle: yearResult.logEntry.title,
          branchId: yearResult.logEntry.branchId,
          effectTexts: yearResult.logEntry.effects ?? [],
          attrDelta: delta,
          attrAfter: attrsAfter,
        })
      }
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
        const branch = pick(available)
        engine.resolveBranch(branch.id)

        // 记录事件+分支
        const stateResolved = engine.getState()
        const attrsAfter = { ...stateResolved.attributes }
        const delta: Record<string, number> = {}
        for (const key of attrs) {
          delta[key] = (attrsAfter[key] ?? 0) - (attrsBefore[key] ?? 0)
        }
        eventChain.push({
          age: stateResolved.age,
          eventId: yearResult.event.id,
          eventTitle: yearResult.event.title,
          branchId: branch.id,
          branchTitle: branch.title,
          effectTexts: yearResult.event.effects.map(e => e.description ?? `${e.type} ${e.target} ${e.value}`),
          attrDelta: delta,
          attrAfter: attrsAfter,
        })
      }
    } else if (yearResult.phase === 'showing_event' && yearResult.logEntry) {
      const attrsAfter = { ...stateAfter.attributes }
      const delta: Record<string, number> = {}
      for (const key of attrs) {
        delta[key] = (attrsAfter[key] ?? 0) - (attrsBefore[key] ?? 0)
      }
      eventChain.push({
        age: stateAfter.age,
        eventId: yearResult.logEntry.eventId,
        eventTitle: yearResult.logEntry.title,
        branchId: yearResult.logEntry.branchId,
        effectTexts: yearResult.logEntry.effects ?? [],
        attrDelta: delta,
        attrAfter: attrsAfter,
      })
    }
    // mundane_year: 不记录
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world)
  const result = evaluator.calculate(finalState)

  return {
    round: roundNum,
    seed,
    peakSum: result.details.totalAttributePeakSum,
    lifespan: result.details.lifespan,
    currentScore: result.score,
    currentGrade: 0, // will set later
    eventChain,
    attrHistory: finalState.attributeHistory,
    finalAttrs: { ...finalState.attributes },
    peaks: { ...finalState.attributePeaks },
    flags: finalState.flags,
    itemCount: finalState.inventory.items.length,
  }
}

function gradeForScore(score: number): string {
  if (score >= 300) return 'SS'
  if (score >= 220) return 'S'
  if (score >= 160) return 'A'
  if (score >= 100) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

function stddev(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length)
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function getAttrAtAge(history: AttributeSnapshot[], age: number, attrId: string): number {
  // Find the snapshot closest to (≤) the given age
  let result = 0
  for (const snap of history) {
    if (snap.age <= age) {
      result = snap.values[attrId] ?? 0
    }
  }
  return result
}

function main() {
  const N = 50
  const data: RoundData[] = []
  const ATTRS = ['chr', 'int', 'str', 'mny', 'spr', 'mag', 'luk']
  const ATTR_NAMES: Record<string, string> = {
    chr: '魅力', int: '智慧', str: '体魄', mny: '家境', spr: '灵魂', mag: '魔力', luk: '运势',
  }

  console.log(`📊 异世界重生模拟器 — 50轮综合数值测试`)
  console.log(`日期: ${new Date().toISOString()}`)
  console.log(`评分公式: peakSum×0.8 + lifespan×0.5 + items×3`)
  console.log(`评级阈值: D<60, C<100, B<160, A<220, S<300, SS≥300\n`)

  for (let i = 1; i <= N; i++) {
    const seed = 1000 + i * 7919
    const d = runOneGame(seed, i)
    d.currentGrade = d.currentScore
    data.push(d)
    const grade = gradeForScore(d.currentScore)
    console.log(`R${String(i).padStart(2)} | ${grade} | score=${String(d.currentScore.toFixed(1)).padStart(7)} | peakSum=${String(d.peakSum).padStart(3)} | age=${String(d.lifespan).padStart(3)} | items=${d.itemCount}`)
  }

  // ======================== 1. 评分分布 ========================
  console.log('\n' + '='.repeat(70))
  console.log('## 1. 评分分布')
  console.log('='.repeat(70))

  const scores = data.map(d => d.currentScore).sort((a, b) => a - b)
  const gradeOrder = ['D', 'C', 'B', 'A', 'S', 'SS']
  const gradeCounts: Record<string, number> = { D: 0, C: 0, B: 0, A: 0, S: 0, SS: 0 }
  for (const d of data) {
    gradeCounts[gradeForScore(d.currentScore)]++
  }

  console.log('\n评级分布:')
  for (const g of gradeOrder) {
    const count = gradeCounts[g]
    const bar = '█'.repeat(count) + '░'.repeat(Math.max(0, 10 - count))
    console.log(`  ${g}: ${String(count).padStart(2)}/${N} (${String(Math.round(count / N * 100)).padStart(3)}%) ${bar}`)
  }

  console.log(`\n评分统计:`)
  console.log(`  min=${scores[0].toFixed(1)}  max=${scores[N - 1].toFixed(1)}  median=${scores[Math.floor(N / 2)].toFixed(1)}  avg=${mean(scores).toFixed(1)}  stddev=${stddev(scores).toFixed(1)}`)

  // 评分公式验证（抽查几轮）
  console.log('\n评分公式验证（前5轮）:')
  for (let i = 0; i < 5; i++) {
    const d = data[i]
    const expected = d.peakSum * 0.8 + d.lifespan * 0.5 + d.itemCount * 3
    console.log(`  R${i + 1}: peakSum=${d.peakSum}×0.8=${(d.peakSum * 0.8).toFixed(1)} + lifespan=${d.lifespan}×0.5=${(d.lifespan * 0.5).toFixed(1)} + items=${d.itemCount}×3=${d.itemCount * 3} = ${expected.toFixed(1)} (actual=${d.currentScore}) ${Math.abs(expected - d.currentScore) < 0.5 ? '✅' : '❌'}`)
  }

  // ======================== 2. 属性数值分析 ========================
  console.log('\n' + '='.repeat(70))
  console.log('## 2. 属性数值分析')
  console.log('='.repeat(70))

  console.log('\n--- 最终属性统计 ---')
  for (const attr of ATTRS) {
    const values = data.map(d => d.finalAttrs[attr] ?? 0)
    const peaks = data.map(d => d.peaks[attr] ?? 0)
    const finalMean = mean(values)
    const finalStd = stddev(values)
    const peakMean = mean(peaks)
    const peakStd = stddev(peaks)
    const maxVal = Math.max(...values)
    const minVal = Math.min(...values)
    const maxPeak = Math.max(...peaks)
    const hitCap = data.filter(d => (d.peaks[attr] ?? 0) >= 99).length
    console.log(`  ${ATTR_NAMES[attr]} (${attr}):`)
    console.log(`    最终值: min=${minVal} max=${maxVal} avg=${finalMean.toFixed(1)} stddev=${finalStd.toFixed(1)}`)
    console.log(`    峰  值: min=${Math.min(...peaks)} max=${maxPeak} avg=${peakMean.toFixed(1)} stddev=${peakStd.toFixed(1)}`)
    console.log(`    触顶(≥99): ${hitCap}/${N} (${Math.round(hitCap / N * 100)}%)`)
  }

  // 关键节点属性快照
  console.log('\n--- 关键年龄节点属性均值（基于峰值） ---')
  const keyAges = [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const aliveAtAge: Record<number, number> = {}
  for (const age of keyAges) {
    aliveAtAge[age] = data.filter(d => d.lifespan >= age).length
  }

  console.log(`\n${'Age'.padStart(4)} | ${'Alive'.padStart(5)} | ${ATTRS.map(a => ATTR_NAMES[a].padStart(6)).join(' | ')}`)
  console.log('-'.repeat(4 + 3 + 5 + 3 + ATTRS.length * 9))
  for (const age of keyAges) {
    const alive = data.filter(d => d.lifespan >= age)
    if (alive.length === 0) continue
    const vals = ATTRS.map(attr => mean(alive.map(d => getAttrAtAge(d.attrHistory, age, attr))).toFixed(1).padStart(6))
    console.log(`${String(age).padStart(4)} | ${String(alive.length).padStart(5)}/${N} | ${vals.join(' | ')}`)
  }

  // 属性增长最快的年龄段
  console.log('\n--- 属性增长最快的年龄段（平均每10年增量） ---')
  const ageRanges: [number, number][] = [[0, 10], [10, 20], [20, 30], [30, 40], [40, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 100]]
  for (const attr of ATTRS) {
    console.log(`  ${ATTR_NAMES[attr]} (${attr}):`)
    for (const [start, end] of ageRanges) {
      const alive = data.filter(d => d.lifespan >= end)
      if (alive.length < 3) continue
      const growth = mean(alive.map(d => getAttrAtAge(d.attrHistory, end, attr) - getAttrAtAge(d.attrHistory, start, attr)))
      if (Math.abs(growth) > 0.01) {
        console.log(`    ${String(start).padStart(2)}-${String(end).padStart(2)}: ${growth > 0 ? '+' : ''}${growth.toFixed(2)}/10yr`)
      }
    }
  }

  // ======================== 3. 事件触发分析 ========================
  console.log('\n' + '='.repeat(70))
  console.log('## 3. 事件触发分析')
  console.log('='.repeat(70))

  const eventFreq: Record<string, number> = {}
  const eventTitles: Record<string, string> = {}
  for (const d of data) {
    for (const entry of d.eventChain) {
      eventFreq[entry.eventId] = (eventFreq[entry.eventId] || 0) + 1
      if (!eventTitles[entry.eventId]) eventTitles[entry.eventId] = entry.eventTitle
    }
  }

  // 获取所有事件 ID（从世界数据中）
  const world = createSwordAndMagicWorld()
  const allEventIds = new Set(world.events.map(e => e.id))
  const triggeredIds = new Set(Object.keys(eventFreq))
  const neverTriggered = [...allEventIds].filter(id => !triggeredIds.has(id))

  console.log(`\n事件池: ${allEventIds.size} 个定义事件`)
  console.log(`已触发: ${triggeredIds.size} 个不同事件`)
  console.log(`从未触发: ${neverTriggered.length} 个事件`)

  // Top 20 高频事件
  console.log('\n--- 高频事件 Top 20 ---')
  const sorted = Object.entries(eventFreq).sort((a, b) => b[1] - a[1])
  for (const [eid, count] of sorted.slice(0, 20)) {
    const pct = Math.round(count / N * 100)
    const title = eventTitles[eid] ?? eid
    console.log(`  ${count.toString().padStart(2)}/${N} (${String(pct).padStart(3)}%) ${eid.padEnd(35)} ${title}`)
  }

  // 未触发事件
  console.log('\n--- 从未触发的事件 ---')
  const eventById = new Map(world.events.map(e => [e.id, e]))
  for (const eid of neverTriggered.sort()) {
    const def = eventById.get(eid)
    const title = def?.title ?? eid
    const ageRange = def ? `[${def.minAge}-${def.maxAge}]` : ''
    const weight = def?.weight ?? '-'
    const unique = def?.unique ? 'unique' : 'repeatable'
    const prereqs = def?.prerequisites?.length ?? 0
    console.log(`  ${eid.padEnd(35)} ${title.padEnd(20)} age=${ageRange.padEnd(7)} w=${String(weight).padStart(5)} ${unique.padEnd(12)} prereqs=${prereqs}`)
  }

  // ======================== 4. 寿命与评分关系 ========================
  console.log('\n' + '='.repeat(70))
  console.log('## 4. 寿命与评分关系')
  console.log('='.repeat(70))

  const lifespans = data.map(d => d.lifespan).sort((a, b) => a - b)

  // 寿命分布
  console.log('\n--- 寿命分布 ---')
  const lifespanBuckets: [string, number, number][] = [
    ['<20 (夭折)', 0, 19],
    ['20-39 (早逝)', 20, 39],
    ['40-59 (中年)', 40, 59],
    ['60-79 (长寿)', 60, 79],
    ['80-99 (高寿)', 80, 99],
    ['100 (满寿)', 100, 100],
  ]
  for (const [label, min, max] of lifespanBuckets) {
    const bucket = data.filter(d => d.lifespan >= min && d.lifespan <= max)
    if (bucket.length === 0) continue
    const avgScore = mean(bucket.map(d => d.currentScore))
    console.log(`  ${label.padEnd(12)}: ${String(bucket.length).padStart(2)}/${N} (${Math.round(bucket.length / N * 100)}%)  avg_score=${avgScore.toFixed(1)}`)
  }

  // 相关性
  const lifespanArr = data.map(d => d.lifespan)
  const scoreArr = data.map(d => d.currentScore)
  const n = N
  const lsMean = mean(lifespanArr)
  const scMean = mean(scoreArr)
  let covariance = 0
  let lsVar = 0
  let scVar = 0
  for (let i = 0; i < n; i++) {
    const ld = lifespanArr[i] - lsMean
    const sd = scoreArr[i] - scMean
    covariance += ld * sd
    lsVar += ld * ld
    scVar += sd * sd
  }
  const correlation = covariance / Math.sqrt(lsVar * scVar)

  console.log(`\n寿命-评分皮尔逊相关系数: ${correlation.toFixed(4)}`)
  console.log(`  ${Math.abs(correlation) > 0.7 ? '🔴 强相关' : Math.abs(correlation) > 0.4 ? '🟡 中等相关' : '🟢 弱相关'}`)

  // 早死 vs 长寿 对比
  console.log('\n--- 早死 (<40岁) vs 长寿 (>80岁) 属性收益对比 ---')
  const earlyDeaths = data.filter(d => d.lifespan < 40)
  const longLives = data.filter(d => d.lifespan > 80)

  function printGroup(label: string, group: RoundData[]) {
    console.log(`\n  ${label} (${group.length}轮):`)
    for (const attr of ATTRS) {
      const peakVals = group.map(d => d.peaks[attr] ?? 0)
      console.log(`    ${ATTR_NAMES[attr]} peak: avg=${mean(peakVals).toFixed(1)} min=${Math.min(...peakVals)} max=${Math.max(...peakVals)}`)
    }
    console.log(`    avg_score=${mean(group.map(d => d.currentScore)).toFixed(1)}  avg_lifespan=${mean(group.map(d => d.lifespan)).toFixed(1)}`)
  }

  printGroup('早死组 (<40岁)', earlyDeaths)
  printGroup('长寿组 (>80岁)', longLives)

  // 满寿碾压检测
  const fullLives = data.filter(d => d.lifespan >= 100)
  const nonFullLives = data.filter(d => d.lifespan < 100)
  if (fullLives.length > 0 && nonFullLives.length > 0) {
    const fullAvgScore = mean(fullLives.map(d => d.currentScore))
    const nonFullAvgScore = mean(nonFullLives.map(d => d.currentScore))
    const fullAvgGrade = gradeForScore(fullAvgScore)
    const nonFullAvgGrade = gradeForScore(nonFullAvgScore)
    console.log(`\n满寿碾压检测:`)
    console.log(`  满寿组(${fullLives.length}轮): avg_score=${fullAvgScore.toFixed(1)} avg_grade≈${fullAvgGrade}`)
    console.log(`  非满寿组(${nonFullLives.length}轮): avg_score=${nonFullAvgScore.toFixed(1)} avg_grade≈${nonFullAvgGrade}`)
    console.log(`  差距: ${(fullAvgScore - nonFullAvgScore).toFixed(1)} 分`)
    // 检查非满寿中是否有超过满寿最低分的
    const fullMinScore = Math.min(...fullLives.map(d => d.currentScore))
    const nonFullAboveFullMin = nonFullLives.filter(d => d.currentScore > fullMinScore).length
    console.log(`  非满寿中超过满寿最低分(${fullMinScore.toFixed(1)})的: ${nonFullAboveFullMin}/${nonFullLives.length}`)
    if (nonFullAboveFullMin === 0) {
      console.log(`  🔴 问题: 活到100岁必定碾压所有非满寿角色`)
    }
  }

  // ======================== 5. 详细事件链 ========================
  console.log('\n' + '='.repeat(70))
  console.log('## 5. 5轮详细事件链')
  console.log('='.repeat(70))

  // 选择5轮有代表性的：最高分、最低分、最长寿命、最短寿命、中位数
  const sortedByScore = [...data].sort((a, b) => b.currentScore - a.currentScore)
  const sortedByLife = [...data].sort((a, b) => b.lifespan - a.lifespan)
  const representative = [
    sortedByScore[0],    // 最高分
    sortedByScore[N - 1], // 最低分
    sortedByLife[0],     // 最长寿命
    sortedByLife[N - 1], // 最短寿命
    data[Math.floor(N / 2)], // 中位数
  ].filter((d, i, arr) => arr.findIndex(x => x.round === d.round) === i) // deduplicate

  for (const d of representative.slice(0, 5)) {
    const grade = gradeForScore(d.currentScore)
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`R${d.round} (seed=${d.seed}) | ${grade} | score=${d.currentScore.toFixed(1)} | peakSum=${d.peakSum} | age=${d.lifespan} | items=${d.itemCount}`)
    console.log(`天赋: (seed=${d.seed})`)
    console.log(`属性最终: chr=${d.finalAttrs.chr} int=${d.finalAttrs.int} str=${d.finalAttrs.str} mny=${d.finalAttrs.mny} spr=${d.finalAttrs.spr} mag=${d.finalAttrs.mag} luk=${d.finalAttrs.luk}`)
    console.log(`属性峰值: chr=${d.peaks.chr} int=${d.peaks.int} str=${d.peaks.str} mny=${d.peaks.mny} spr=${d.peaks.spr} mag=${d.peaks.mag} luk=${d.peaks.luk}`)
    console.log(`\n事件链 (${d.eventChain.length}个事件):`)

    for (const entry of d.eventChain) {
      const branch = entry.branchId ? ` → [${entry.branchTitle ?? entry.branchId}]` : ''
      const deltas = Object.entries(entry.attrDelta)
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${ATTR_NAMES[k] ?? k}${v > 0 ? '+' : ''}${v}`)
        .join(', ')
      console.log(`  age=${String(entry.age).padStart(3)}  ${entry.eventTitle}${branch}`)
      if (deltas) console.log(`          属性变化: ${deltas}`)
    }
  }

  // ======================== 6. 发现的问题 ========================
  console.log('\n' + '='.repeat(70))
  console.log('## 6. 发现的问题')
  console.log('='.repeat(70))

  const issues: { severity: string; desc: string }[] = []

  // 检查1: S/SS比例
  const sCount = (gradeCounts['S'] ?? 0) + (gradeCounts['SS'] ?? 0)
  if (sCount / N > 0.15) {
    issues.push({ severity: 'P2', desc: `S+评级比例过高: ${sCount}/${N} (${Math.round(sCount / N * 100)}%)，期望≤10%` })
  }
  if (sCount / N < 0.02) {
    issues.push({ severity: 'P3', desc: `S+评级比例过低: ${sCount}/${N} (${Math.round(sCount / N * 100)}%)，可能缺乏追求高分的动力` })
  }

  // 检查2: D级比例
  const dCount = gradeCounts['D'] ?? 0
  if (dCount / N > 0.3) {
    issues.push({ severity: 'P2', desc: `D级比例过高: ${dCount}/${N} (${Math.round(dCount / N * 100)}%)，新手体验可能差` })
  }

  // 检查3: 评分分布均匀性（不应该全集中在某个等级）
  const maxGradeCount = Math.max(...Object.values(gradeCounts))
  const maxGradeName = Object.entries(gradeCounts).find(([_, c]) => c === maxGradeCount)?.[0]
  if (maxGradeCount / N > 0.6) {
    issues.push({ severity: 'P1', desc: `评级分布严重偏斜: ${maxGradeName}级占${maxGradeCount}/${N} (${Math.round(maxGradeCount / N * 100)}%)` })
  }

  // 检查4: 属性溢出
  for (const attr of ATTRS) {
    const hitCap = data.filter(d => (d.peaks[attr] ?? 0) >= 99).length
    if (hitCap / N > 0.3) {
      issues.push({ severity: 'P2', desc: `${ATTR_NAMES[attr]}(${attr})峰值触顶率过高: ${hitCap}/${N} (${Math.round(hitCap / N * 100)}%)，导致属性区分度不足` })
    }
  }

  // 检查5: 满寿碾压
  if (fullLives.length > 0 && nonFullLives.length > 0) {
    const fullMin = Math.min(...fullLives.map(d => d.currentScore))
    const nonFullAbove = nonFullLives.filter(d => d.currentScore > fullMin).length
    if (nonFullAbove === 0 && fullLives.length >= 2) {
      issues.push({ severity: 'P1', desc: `满寿碾压问题: 所有非满寿角色的评分都低于满寿最低分(${fullMin.toFixed(1)})，活到100岁是获得高分的唯一路径` })
    }
  }

  // 检查6: 死亡年龄分布（不应该太多角色在很小年龄死亡）
  const babyDeaths = data.filter(d => d.lifespan <= 10).length
  if (babyDeaths / N > 0.2) {
    issues.push({ severity: 'P2', desc: `婴儿期死亡率过高: ${babyDeaths}/${N} (${Math.round(babyDeaths / N * 100)}%) 在10岁前死亡` })
  }

  // 检查7: 事件覆盖率
  if (neverTriggered.length > allEventIds.size * 0.5) {
    issues.push({ severity: 'P3', desc: `事件覆盖率低: ${neverTriggered.length}/${allEventIds.size} (${Math.round(neverTriggered.length / allEventIds.size * 100)}%) 事件从未触发，可能权重或条件设置不合理` })
  }

  // 检查8: 寿命与评分相关性过高
  if (Math.abs(correlation) > 0.8) {
    issues.push({ severity: 'P1', desc: `寿命与评分相关系数过高(${correlation.toFixed(4)})，属性成长对评分的影响被寿命掩盖` })
  }

  // 检查9: 某些属性完全无用（平均值太低且方差太小）
  for (const attr of ATTRS) {
    const peaks = data.map(d => d.peaks[attr] ?? 0)
    if (mean(peaks) < 5 && stddev(peaks) < 5) {
      issues.push({ severity: 'P3', desc: `${ATTR_NAMES[attr]}(${attr})成长几乎为零: avg_peak=${mean(peaks).toFixed(1)} stddev=${stddev(peaks).toFixed(1)}` })
    }
  }

  // 检查10: 评分标准差太小说明同质化
  if (stddev(scores) < 15) {
    issues.push({ severity: 'P2', desc: `评分标准差过低(${stddev(scores).toFixed(1)})，角色同质化严重，缺少差异化体验` })
  }

  if (issues.length === 0) {
    console.log('\n  ✅ 未发现明显问题')
  } else {
    for (const issue of issues.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5)
    })) {
      console.log(`  [${issue.severity}] ${issue.desc}`)
    }
  }

  // 验证之前的修复
  console.log('\n--- 修复验证 ---')
  console.log(`  commit f27a097（增幅缩减，S+ 比例 70%→50%）:`)
  console.log(`    当前 S+ 比例: ${sCount}/${N} = ${Math.round(sCount / N * 100)}%`)
  console.log(`    ${sCount / N <= 0.5 ? '✅ 修复生效' : '❌ 修复未生效或需要进一步调整'}`)

  // 最终汇总
  console.log('\n' + '='.repeat(70))
  console.log('测试完成')
  console.log('='.repeat(70))
}

main()
