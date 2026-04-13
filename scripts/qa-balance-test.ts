/**
 * QA 平衡测试 — 扩展版
 * 每种族×性别 20 局，输出详细 HP 曲线与事件伤害统计
 */
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { GameState, Gender } from '../src/engine/core/types'

const RACES = ['human', 'elf', 'goblin', 'dwarf', 'beastfolk', 'seaelf', 'halfdragon']
const GENDERS: Gender[] = ['male', 'female']
const GAMES_PER_COMBO = 20
const TOTAL = RACES.length * GENDERS.length * GAMES_PER_COMBO

const raceNames: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林',
  dwarf: '矮人', beastfolk: '兽人', seaelf: '海精灵', halfdragon: '半龙人'
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface GameResult {
  race: string
  gender: string
  lifespan: number
  effectiveMaxAge: number
  score: number
  grade: string
  peakSum: number
  initHp: number
  finalHp: number
  hpTrajectory: number[]   // every 10% of life: HP at 0%, 10%, 20%... 100%+
  deathEvent: string | null
  totalHpLoss: number       // cumulative HP loss from events
  totalHpGain: number       // cumulative HP gain from events
  eventCount: number
  ageDecayStartAge: number  // when ageDecay first becomes > 0
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function stddev(arr: number[]): number {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}

async function runOne(seed: number, race: string, gender: Gender): Promise<GameResult> {
  const world = await createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)

  engine.initGame('test', undefined, race, gender)

  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, 3))

  const visibleAttrs = world.attributes.filter(a => !a.hidden && a.group !== 'hidden')
  const attrIds = visibleAttrs.map(a => a.id)
  const allocation: Record<string, number> = {}
  let remaining = 20
  for (const id of attrIds) {
    const val = Math.min(rand(1, 4), remaining - (attrIds.length - attrIds.indexOf(id) - 1))
    allocation[id] = Math.max(1, val)
    remaining -= allocation[id]
  }
  for (const id of attrIds) {
    if (remaining <= 0) break
    const add = Math.min(remaining, 5 - allocation[id])
    allocation[id] += add
    remaining -= add
  }
  engine.allocateAttributes(allocation)

  const initState = engine.getState()
  const initHp = initState.hp
  const effectiveMaxAge = (initState as any).effectiveMaxAge ?? 85

  // Record HP trajectory at lifeRatio milestones
  const hpMilestones: Map<number, number> = new Map()
  hpMilestones.set(0, initHp)

  let totalHpLoss = 0
  let totalHpGain = 0
  let eventCount = 0
  let deathEvent: string | null = null
  let ageDecayStartAge = -1

  // Compute when ageDecay starts (lifeRatio >= 0.68)
  const decayStartAge = Math.floor(effectiveMaxAge * 0.68)

  for (let year = 0; year < 700; year++) {
    const s = engine.getState()
    if (s.hp <= 0 || s.phase === 'finished') {
      deathEvent = s.eventLog.length > 0 ? s.eventLog[s.eventLog.length - 1]?.eventId ?? 'hp_depleted' : 'hp_depleted'
      break
    }

    const prevHp = s.hp
    const yr = engine.startYear()
    const s2 = engine.getState()

    if (s2.hp <= 0 || s2.phase === 'finished') {
      deathEvent = s.eventLog.length > 0 ? s.eventLog[s.eventLog.length - 1]?.eventId ?? 'hp_depleted' : 'hp_depleted'
      break
    }

    if (yr.phase === 'awaiting_choice' && yr.branches && yr.branches.length > 0) {
      const state = engine.getState()
      const flags = state.flags
      const attrs = state.attributes
      let chosen = yr.branches[0]
      for (const b of yr.branches) {
        if (!b.requireCondition) { chosen = b; break }
        const cond = b.requireCondition
        const attrMatch = [...cond.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]
        let met = true
        for (const m of attrMatch) {
          const val = attrs[m[1]] ?? 0
          const num = parseInt(m[3])
          if (m[2] === '>=' && !(val >= num)) met = false
          if (m[2] === '>' && !(val > num)) met = false
          if (m[2] === '<=' && !(val <= num)) met = false
          if (m[2] === '<' && !(val < num)) met = false
          if (m[2] === '==' && !(val === num)) met = false
        }
        const flagMatch = [...cond.matchAll(/has\.flag\.(\w+)/g)]
        for (const m of flagMatch) { if (!flags.has(m[1])) met = false }
        if (met) { chosen = b; break }
      }
      try { engine.resolveBranch(chosen.id) } catch { /* skip */ }
    }

    // Track event HP effects
    const finalState = engine.getState()
    const hpDelta = finalState.hp - prevHp - (/* regen happens before */ 0)
    if (yr.event) {
      eventCount++
      if (finalState.hp < prevHp + 1) { // lost HP (more than just natural decay)
        const loss = prevHp + 1 - finalState.hp
        if (loss > 0) totalHpLoss += loss
      }
    }

    // Record milestones
    const lifeRatio = finalState.age / effectiveMaxAge
    const milestonePct = Math.floor(lifeRatio * 10) * 10
    if (milestonePct > 0 && !hpMilestones.has(milestonePct)) {
      hpMilestones.set(milestonePct, finalState.hp)
    }
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world, world.evaluations)
  const result = evaluator.calculate(finalState)

  // Determine ageDecay start
  ageDecayStartAge = decayStartAge

  const hpTrajectory: number[] = []
  for (let pct = 0; pct <= 150; pct += 10) {
    hpTrajectory.push(hpMilestones.get(pct) ?? -1)
  }

  return {
    race, gender,
    lifespan: finalState.age,
    effectiveMaxAge,
    score: result.score,
    grade: result.grade,
    peakSum: result.details.totalAttributePeakSum,
    initHp,
    finalHp: finalState.hp,
    hpTrajectory,
    deathEvent,
    totalHpLoss,
    totalHpGain,
    eventCount,
    ageDecayStartAge,
  }
}

async function main() {
  console.log(`QA 平衡测试: ${RACES.length}种族 × ${GENDERS.length}性别 × ${GAMES_PER_COMBO}局 = ${TOTAL}局\n`)
  console.log('='.repeat(90))

  const results: GameResult[] = []
  let idx = 0

  for (const race of RACES) {
    for (const gender of GENDERS) {
      for (let g = 0; g < GAMES_PER_COMBO; g++) {
        const seed = 20000 + idx * 9973
        const r = await runOne(seed, race, gender)
        results.push(r)
        idx++
        process.stdout.write(`\r${idx}/${TOTAL} ${raceNames[race]} ${gender === 'male' ? '♂' : '♀'} #${g + 1} life=${r.lifespan}/${r.effectiveMaxAge} score=${r.score} ${r.grade}`)
      }
    }
  }
  console.log('\n')

  // === SECTION 1: Lifespan Analysis ===
  console.log('# 1. 寿命分析')
  console.log('='.repeat(90))
  console.log(`种族      | 性别 | 寿命范围     | 中位 | 平均(σ)      | 寿命范围设定  | 中位/寿命上限`)
  console.log('-'.repeat(90))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const ls = group.map(r => r.lifespan)
      const maxAges = group.map(r => r.effectiveMaxAge)
      const gSym = gender === 'male' ? '♂' : '♀'
      const avg = ls.reduce((a, b) => a + b, 0) / ls.length
      const sd = stddev(ls)
      const med = median(ls)
      const avgMaxAge = maxAges.reduce((a, b) => a + b, 0) / maxAges.length
      const minLs = Math.min(...ls)
      const maxLs = Math.max(...ls)
      const ratio = (med / avgMaxAge * 100).toFixed(1)

      // Get lifespan range from races.json (use first entry's effectiveMaxAge as representative)
      const repMax = group[0].effectiveMaxAge

      console.log(
        `${(raceNames[race] ?? race).padEnd(9)}| ${gSym}    | ${String(minLs).padStart(3)}-${String(maxLs).padStart(3)}       | ${String(med).padStart(4)} | ${avg.toFixed(1).padStart(6)}(${sd.toFixed(1).padStart(5)}) | ${String(group[0].effectiveMaxAge).padStart(3)}           | ${ratio}%`
      )
    }
  }

  // === SECTION 2: Score Analysis ===
  console.log('\n# 2. 评分分析')
  console.log('='.repeat(90))
  console.log(`种族      | 性别 | 分数范围       | 中位 | 平均(σ)      | 评级分布`)
  console.log('-'.repeat(90))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const sc = group.map(r => r.score)
      const gSym = gender === 'male' ? '♂' : '♀'
      const avg = sc.reduce((a, b) => a + b, 0) / sc.length
      const sd = stddev(sc)
      const med = median(sc)
      const gradeDist: Record<string, number> = {}
      for (const r of group) gradeDist[r.grade] = (gradeDist[r.grade] ?? 0) + 1
      const gradeStr = Object.entries(gradeDist)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([g, c]) => `${g}×${c}`)
        .join(' ')

      console.log(
        `${(raceNames[race] ?? race).padEnd(9)}| ${gSym}    | ${String(Math.min(...sc)).padStart(3)}-${String(Math.max(...sc)).padStart(3)}         | ${String(med).padStart(5)} | ${avg.toFixed(1).padStart(6)}(${sd.toFixed(1).padStart(5)}) | ${gradeStr}`
      )
    }
  }

  // === SECTION 3: Score Decomposition ===
  console.log('\n# 3. 评分分解 (属性分 vs 寿命分)')
  console.log('='.repeat(90))
  console.log(`种族      | 性别 | 平均属性峰值 | 属性分(×1.2) | 平均寿命 | 寿命分(×0.3) | 寿命分占比`)
  console.log('-'.repeat(90))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const gSym = gender === 'male' ? '♂' : '♀'
      const avgPeak = group.reduce((s, r) => s + r.peakSum, 0) / group.length
      const avgLife = group.reduce((s, r) => s + r.lifespan, 0) / group.length
      const attrScore = avgPeak * 1.2
      const lifeScore = avgLife * 0.3
      const total = attrScore + lifeScore
      const lifePct = total > 0 ? (lifeScore / total * 100).toFixed(1) : '0.0'

      console.log(
        `${(raceNames[race] ?? race).padEnd(9)}| ${gSym}    | ${avgPeak.toFixed(1).padStart(13)} | ${attrScore.toFixed(1).padStart(12)} | ${avgLife.toFixed(1).padStart(8)} | ${lifeScore.toFixed(1).padStart(12)} | ${lifePct}%`
      )
    }
  }

  // === SECTION 4: HP System Analysis ===
  console.log('\n# 4. HP 系统分析')
  console.log('='.repeat(90))
  console.log(`种族      | 性别 | 初始HP | 衰老起始 | HP轨迹(0%,10%,20%...100%,110%)`)
  console.log('-'.repeat(90))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const gSym = gender === 'male' ? '♂' : '♀'
      const avgInitHp = group.reduce((s, r) => s + r.initHp, 0) / group.length

      // Average HP at each milestone
      const trajLen = group[0].hpTrajectory.length
      const avgTraj: number[] = []
      for (let i = 0; i < trajLen; i++) {
        const vals = group.map(r => r.hpTrajectory[i]).filter(v => v >= 0)
        if (vals.length > 0) {
          avgTraj.push(vals.reduce((a, b) => a + b, 0) / vals.length)
        } else {
          avgTraj.push(NaN)
        }
      }
      const trajStr = avgTraj.map(v => isNaN(v) ? '---' : v.toFixed(0)).join(', ')

      console.log(
        `${(raceNames[race] ?? race).padEnd(9)}| ${gSym}    | ${avgInitHp.toFixed(0).padStart(6)} | ${(group[0].ageDecayStartAge).toString().padStart(6)} | ${trajStr}`
      )
    }
  }

  // === SECTION 5: Event Damage Analysis ===
  console.log('\n# 5. 事件伤害分析')
  console.log('='.repeat(90))
  console.log(`种族      | 性别 | 平均事件数 | 总HP损失(平均) | 死因分布`)
  console.log('-'.repeat(90))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const gSym = gender === 'male' ? '♂' : '♀'
      const avgEvents = group.reduce((s, r) => s + r.eventCount, 0) / group.length
      const avgLoss = group.reduce((s, r) => s + r.totalHpLoss, 0) / group.length

      const deathCauses: Record<string, number> = {}
      for (const r of group) {
        const cause = r.deathEvent ?? 'unknown'
        deathCauses[cause] = (deathCauses[cause] ?? 0) + 1
      }
      const causeStr = Object.entries(deathCauses)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([c, n]) => `${c}×${n}`)
        .join(' ')

      console.log(
        `${(raceNames[race] ?? race).padEnd(9)}| ${gSym}    | ${avgEvents.toFixed(1).padStart(11)} | ${avgLoss.toFixed(1).padStart(14)} | ${causeStr}`
      )
    }
  }

  // === SECTION 6: Key Findings ===
  console.log('\n# 6. 关键发现')
  console.log('='.repeat(90))

  // 6a. Characters exceeding lifespan range
  const exceeders = results.filter(r => r.lifespan > r.effectiveMaxAge)
  const pctExceed = (exceeders.length / results.length * 100).toFixed(1)
  console.log(`超出设定寿命上限: ${exceeders.length}/${results.length} (${pctExceed}%)`)

  for (const race of RACES) {
    const raceExceeders = results.filter(r => r.race === race && r.lifespan > r.effectiveMaxAge)
    if (raceExceeders.length > 0) {
      console.log(`  ${raceNames[race]}: ${raceExceeders.length}/${results.filter(r => r.race === race).length} 超出, 最大超出 ${Math.max(...raceExceeders.map(r => r.lifespan - r.effectiveMaxAge))} 年`)
    }
  }

  // 6b. Score disparity
  const elfScores = results.filter(r => r.race === 'elf').map(r => r.score)
  const goblinScores = results.filter(r => r.race === 'goblin').map(r => r.score)
  const seaelfScores = results.filter(r => r.race === 'seaelf').map(r => r.score)
  const elfAvg = elfScores.reduce((a, b) => a + b, 0) / elfScores.length
  const goblinAvg = goblinScores.reduce((a, b) => a + b, 0) / goblinScores.length
  const seaelfAvg = seaelfScores.reduce((a, b) => a + b, 0) / seaelfScores.length
  console.log(`\n评分差距:`)
  console.log(`  精灵平均: ${elfAvg.toFixed(1)} vs 哥布林平均: ${goblinAvg.toFixed(1)} = ${(elfAvg / goblinAvg).toFixed(2)}x 差距`)
  console.log(`  海精灵平均: ${seaelfAvg.toFixed(1)} vs 哥布林平均: ${goblinAvg.toFixed(1)} = ${(seaelfAvg / goblinAvg).toFixed(2)}x 差距`)

  // 6c. Lifespan distribution
  console.log(`\n寿命/寿命上限比分布:`)
  for (const race of RACES) {
    const raceResults = results.filter(r => r.race === race)
    const ratios = raceResults.map(r => r.lifespan / r.effectiveMaxAge)
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length
    const maxRatio = Math.max(...ratios)
    const minRatio = Math.min(...ratios)
    const pctOver1 = ratios.filter(r => r > 1.0).length / ratios.length * 100
    const pctOver09 = ratios.filter(r => r > 0.9).length / ratios.length * 100
    console.log(`  ${raceNames[race].padEnd(9)}: 平均比 ${avgRatio.toFixed(3)}, 范围 ${minRatio.toFixed(3)}-${maxRatio.toFixed(3)}, >90%: ${pctOver09.toFixed(0)}%, >100%: ${pctOver1.toFixed(0)}%`)
  }

  // 6d. All-SS races
  const allSS = results.filter(r => r.grade === 'SS')
  console.log(`\nSS 评级分布:`)
  for (const race of RACES) {
    const raceResults = results.filter(r => r.race === race)
    const ssCount = raceResults.filter(r => r.grade === 'SS').length
    const sCount = raceResults.filter(r => r.grade === 'S').length
    const aCount = raceResults.filter(r => r.grade === 'A').length
    console.log(`  ${raceNames[race].padEnd(9)}: SS×${ssCount} S×${sCount} A×${aCount} other×${raceResults.length - ssCount - sCount - aCount} / ${raceResults.length}`)
  }

  // 6e. HP at death
  console.log(`\n死亡时 HP (大多数应该=0):`)
  for (const race of RACES) {
    const raceResults = results.filter(r => r.race === race)
    const hpAtDeath = raceResults.map(r => r.finalHp)
    const diedAtZero = hpAtDeath.filter(h => h <= 0).length
    console.log(`  ${raceNames[race].padEnd(9)}: HP=0 死亡 ${diedAtZero}/${raceResults.length}`)
  }

  console.log('\n测试完成。')
}

main().catch(console.error)
