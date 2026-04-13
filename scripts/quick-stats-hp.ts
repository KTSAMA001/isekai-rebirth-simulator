/**
 * HP 深度统计 — 可玩种族 (human/elf/goblin/dwarf) × 男女 × 15局
 * 追踪：HP逐年变化、巅峰、死因、评分
 */
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { GameState, Gender } from '../src/engine/core/types'

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const GENDERS: Gender[] = ['male', 'female']
const GAMES_PER_COMBO = 15
const TOTAL = RACES.length * GENDERS.length * GAMES_PER_COMBO

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface HPRecord {
  age: number
  hp: number
  maxHpBonus: number
  hpRegen: number  // approximate net regen this year
  eventId?: string
}

interface GameResult {
  race: string
  gender: string
  lifespan: number
  score: number
  grade: string
  peakSum: number
  initAttrs: Record<string, number>
  deathCause: string  // 'natural' | 'event' | 'near_death'
  hpRecords: HPRecord[]
  deathEventId?: string
  effectiveMaxAge: number
  initHp: number
  peakHp: number
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
  const initAttrs = { ...initState.attributes }
  const initHp = initState.hp
  let peakHp = initHp
  let deathCause = 'natural'  // default: died of natural aging
  let deathEventId: string | undefined

  const hpRecords: HPRecord[] = []
  // Record age 0
  hpRecords.push({ age: 0, hp: initHp, maxHpBonus: 0, hpRegen: 0 })
  let prevHp = initHp

  for (let year = 0; year < 600; year++) {
    const s = engine.getState()
    if (s.hp <= 0 || s.phase === 'finished') break

    const yr = engine.startYear()
    const s2 = engine.getState()
    const curHp = s2.hp

    // Determine if this year had an event that caused HP damage
    let eventId: string | undefined
    if (yr.event) eventId = yr.event.id

    // Check if this was a death caused by event damage (not gradual aging)
    // Heuristic: if HP dropped by > 5 in a single year due to event
    const hpDelta = curHp - prevHp
    const hpRecord: HPRecord = {
      age: s2.age,
      hp: curHp,
      maxHpBonus: s2.maxHpBonus,
      hpRegen: hpDelta,
      eventId: eventId,
    }
    hpRecords.push(hpRecord)
    prevHp = curHp
    if (curHp > peakHp) peakHp = curHp

    if (s2.hp <= 0 || s2.phase === 'finished') {
      // Determine death cause
      if (eventId) {
        deathEventId = eventId
        // Check if this was an elder natural death event
        if (eventId === 'elder_natural_death') {
          deathCause = 'natural'
        } else {
          deathCause = 'event'
        }
      } else if (s2.flags.has('near_death') && curHp <= 0) {
        deathCause = 'near_death'
      } else {
        deathCause = 'natural'
      }
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
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world, world.evaluations)
  const result = evaluator.calculate(finalState)

  return {
    race, gender,
    lifespan: finalState.age,
    score: result.score,
    grade: result.grade,
    peakSum: result.details.totalAttributePeakSum,
    initAttrs,
    deathCause,
    deathEventId,
    hpRecords,
    effectiveMaxAge: finalState.effectiveMaxAge,
    initHp,
    peakHp,
  }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function pct(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.floor(sorted.length * p / 100)
  return sorted[Math.min(idx, sorted.length - 1)]
}

function pad(n: number, w: number): string { return String(n).padStart(w) }
function padF(n: number, w: number, d: number): string { return n.toFixed(d).padStart(w) }

const raceNames: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林', dwarf: '矮人'
}

async function main() {
  console.log(`HP 深度统计: ${RACES.length} 可玩种族 x ${GENDERS.length} 性别 x ${GAMES_PER_COMBO} 局 = ${TOTAL} 局\n`)

  const results: GameResult[] = []
  let idx = 0

  for (const race of RACES) {
    for (const gender of GENDERS) {
      for (let g = 0; g < GAMES_PER_COMBO; g++) {
        const seed = 20000 + idx * 7919
        const r = await runOne(seed, race, gender)
        results.push(r)
        idx++
        process.stdout.write('\r' + idx + '/' + TOTAL)
      }
    }
  }
  console.log('\n')

  const attrIds = Object.keys(results[0].initAttrs)

  // ==================== 1. 开局属性 ====================
  console.log('='.repeat(80))
  console.log('1. 开局属性 (默认值 + 种族修正 + 性别修正)')
  console.log('='.repeat(80))
  const header = attrIds.map(a => a.padStart(4)).join(' | ')
  console.log('种族     | 性别 | 初始HP | ' + header)
  console.log('-'.repeat(80))

  const seen = new Set<string>()
  for (const r of results) {
    const key = r.race + '-' + r.gender
    if (seen.has(key)) continue
    seen.add(key)
    const gSym = r.gender === 'male' ? 'M' : 'F'
    const vals = attrIds.map(a => pad(r.initAttrs[a] ?? 0, 4)).join(' | ')
    console.log(`${(raceNames[r.race] ?? r.race).padEnd(8)} | ${gSym.padStart(4)} | ${pad(r.initHp, 6)} | ${vals}`)
  }

  // ==================== 2. HP 初始值、巅峰值、最终值 ====================
  console.log('\n' + '='.repeat(80))
  console.log('2. HP 统计 (初始/巅峰/最终)')
  console.log('='.repeat(80))
  console.log('种族     | 性别 | 初始HP | 巅峰HP        | 死亡HP(中位) | 寿命(中位)')
  console.log('-'.repeat(80))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const gSym = gender === 'male' ? 'M' : 'F'
      const initHps = group.map(r => r.initHp)
      const peakHps = group.map(r => r.peakHp)
      const deathHps = group.map(r => r.hpRecords[r.hpRecords.length - 1]?.hp ?? 0)
      const lifespans = group.map(r => r.lifespan)

      const avgInit = initHps.reduce((a, b) => a + b, 0) / initHps.length
      const avgPeak = peakHps.reduce((a, b) => a + b, 0) / peakHps.length
      const medDeath = median(deathHps)
      const medLife = median(lifespans)

      console.log(
        `${(raceNames[race] ?? race).padEnd(8)} | ${gSym.padStart(4)} | ${padF(avgInit, 6, 1)} | ${padF(avgPeak, 12, 1)} | ${pad(medDeath, 12)} | ${pad(medLife, 10)}`
      )
    }
  }

  // ==================== 3. HP 逐年变化曲线 (关键节点) ====================
  console.log('\n' + '='.repeat(100))
  console.log('3. HP 逐年变化曲线 (每种族取中位数局的关键节点)')
  console.log('='.repeat(100))

  for (const race of RACES) {
    const raceResults = results.filter(r => r.race === race)
    // Find median lifespan game
    const lifespans = raceResults.map(r => r.lifespan).sort((a, b) => a - b)
    const medLife = lifespans[Math.floor(lifespans.length / 2)]
    const medGame = raceResults.find(r => r.lifespan === medLife) ?? raceResults[0]

    const effMax = medGame.effectiveMaxAge
    const samples: number[] = []
    // Sample at key life ratios: 0, 0.1, 0.2, ..., 0.9, 0.95, 1.0
    for (let p = 0; p <= 100; p += 10) {
      if (p === 100) samples.push(effMax)
      else samples.push(Math.floor(effMax * p / 100))
    }

    console.log(`\n${raceNames[race]} (中位局: 寿命${medLife}, effectiveMaxAge=${effMax}, 初始HP=${medGame.initHp}, 巅峰HP=${medGame.peakHp})`)
    console.log(`${'Age'.padStart(6)} | ${'LifeRatio'.padStart(10)} | ${'HP'.padStart(6)} | ${'ΔHP'.padStart(6)} | 事件`)

    for (const sampleAge of samples) {
      const record = medGame.hpRecords.find(r => r.age === sampleAge) ??
        medGame.hpRecords.reduce((prev, cur) =>
          Math.abs(cur.age - sampleAge) < Math.abs(prev.age - sampleAge) ? cur : prev,
          medGame.hpRecords[0]!
        )
      if (!record) continue
      const ratio = (record.age / effMax).toFixed(2)
      const delta = record.hpRegen >= 0 ? `+${record.hpRegen}` : `${record.hpRegen}`
      const evt = record.eventId ? record.eventId.substring(0, 25) : ''
      console.log(`${pad(record.age, 6)} | ${ratio.padStart(10)} | ${pad(record.hp, 6)} | ${delta.padStart(6)} | ${evt}`)
    }
  }

  // ==================== 4. 寿命统计 ====================
  console.log('\n' + '='.repeat(80))
  console.log('4. 寿命统计')
  console.log('='.repeat(80))
  console.log('种族     | 性别 | min | 10% | 25% | 中位 | 75% | 90% | max | 平均')
  console.log('-'.repeat(90))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const ls = group.map(r => r.lifespan)
      const gSym = gender === 'male' ? 'M' : 'F'
      const avg = ls.reduce((a, b) => a + b, 0) / ls.length
      console.log(
        `${(raceNames[race] ?? race).padEnd(8)} | ${gSym.padStart(4)} | ${pad(Math.min(...ls), 4)} | ${pad(pct(ls, 10), 4)} | ${pad(pct(ls, 25), 4)} | ${pad(median(ls), 5)} | ${pad(pct(ls, 75), 4)} | ${pad(pct(ls, 90), 4)} | ${pad(Math.max(...ls), 4)} | ${padF(avg, 6, 1)}`
      )
    }
  }

  // ==================== 5. 评分统计 ====================
  console.log('\n' + '='.repeat(80))
  console.log('5. 评分统计')
  console.log('='.repeat(80))
  console.log('种族     | 性别 | min | 中位 | 平均   | max | 评级分布')
  console.log('-'.repeat(80))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const sc = group.map(r => r.score)
      const gSym = gender === 'male' ? 'M' : 'F'
      const gradeDist: Record<string, number> = {}
      for (const r of group) gradeDist[r.grade] = (gradeDist[r.grade] ?? 0) + 1
      const gradeStr = Object.entries(gradeDist).map(([g, c]) => g + 'x' + c).join(' ')
      const avg = sc.reduce((a, b) => a + b, 0) / sc.length
      console.log(
        `${(raceNames[race] ?? race).padEnd(8)} | ${gSym.padStart(4)} | ${pad(Math.min(...sc), 4)} | ${pad(median(sc), 5)} | ${padF(avg, 6, 1)} | ${pad(Math.max(...sc), 4)} | ${gradeStr}`
      )
    }
  }

  // ==================== 6. 死因分析 ====================
  console.log('\n' + '='.repeat(80))
  console.log('6. 死因分析')
  console.log('='.repeat(80))
  console.log('种族     | 性别 | 自然衰老 | 事件致死 | 濒死致死 | 总数')
  console.log('-'.repeat(60))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const gSym = gender === 'male' ? 'M' : 'F'
      const natural = group.filter(r => r.deathCause === 'natural').length
      const event = group.filter(r => r.deathCause === 'event').length
      const neardeath = group.filter(r => r.deathCause === 'near_death').length
      console.log(
        `${(raceNames[race] ?? race).padEnd(8)} | ${gSym.padStart(4)} | ${pad(natural, 8)} | ${pad(event, 8)} | ${pad(neardeath, 8)} | ${group.length}`
      )
    }
  }

  // ==================== 7. 满寿率 ====================
  console.log('\n' + '='.repeat(80))
  console.log('7. 满寿率 (寿命 >= effectiveMaxAge * 0.9)')
  console.log('='.repeat(80))

  for (const race of RACES) {
    const raceGroup = results.filter(r => r.race === race)
    const nearFullLife = raceGroup.filter(r => r.lifespan >= r.effectiveMaxAge * 0.9).length
    const pct = (nearFullLife / raceGroup.length * 100).toFixed(1)
    console.log(`${(raceNames[race] ?? race).padEnd(8)}: ${nearFullLife}/${raceGroup.length} = ${pct}%`)
  }

  // ==================== 8. 评分寿命分量分析 ====================
  console.log('\n' + '='.repeat(80))
  console.log('8. 评分公式分析 (score = peakSum*1.2 + lifespan*0.3 + items*3 + route*15)')
  console.log('='.repeat(80))

  for (const race of RACES) {
    const raceGroup = results.filter(r => r.race === race)
    const avgPeak = raceGroup.reduce((s, r) => s + r.peakSum, 0) / raceGroup.length
    const avgLife = raceGroup.reduce((s, r) => s + r.lifespan, 0) / raceGroup.length
    const attrComponent = avgPeak * 1.2
    const lifeComponent = avgLife * 0.3
    console.log(`${(raceNames[race] ?? race).padEnd(8)}: 峰值属性×1.2=${padF(attrComponent, 8, 1)} | 寿命×0.3=${padF(lifeComponent, 8, 1)} | 寿命占评分比=${(lifeComponent / (attrComponent + lifeComponent) * 100).toFixed(1)}%`)
  }
}

main().catch(console.error)
