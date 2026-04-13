/**
 * 快速数值统计 — 各种族×性别组合的属性、寿命、评分
 * 运行: npx tsx scripts/quick-stats.ts
 */
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { GameState, Gender } from '../src/engine/core/types'

const RACES = ['human', 'elf', 'goblin', 'dwarf', 'beastfolk', 'seaelf', 'halfdragon']
const GENDERS: Gender[] = ['male', 'female']
const GAMES_PER_COMBO = 10
const TOTAL = RACES.length * GENDERS.length * GAMES_PER_COMBO

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface GameResult {
  race: string
  gender: string
  lifespan: number
  score: number
  grade: string
  peakSum: number
  initAttrs: Record<string, number>
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

  for (let year = 0; year < 600; year++) {
    const s = engine.getState()
    if (s.hp <= 0 || s.phase === 'finished') break

    const yr = engine.startYear()
    const s2 = engine.getState()

    if (s2.hp <= 0 || s2.phase === 'finished') break

    if (yr.phase === 'awaiting_choice' && yr.branches && yr.branches.length > 0) {
      const state = engine.getState()
      const flags = state.flags
      const attrs = state.attributes
      // 选第一个条件满足的分支，全不满足则选第一个无条件分支
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
      try { engine.resolveBranch(chosen.id) } catch { /* 跳过 */ }
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
  }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function pad(n: number, w: number): string { return String(n).padStart(w) }
function padF(n: number, w: number, d: number): string { return n.toFixed(d).padStart(w) }

const raceNames: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林',
  dwarf: '矮人', beastfolk: '兽人', seaelf: '海精灵', halfdragon: '半龙人'
}

async function main() {
  console.log('数值统计: ' + RACES.length + '种族 x ' + GENDERS.length + '性别 x ' + GAMES_PER_COMBO + '局 = ' + TOTAL + '局\n')

  const results: GameResult[] = []
  let idx = 0

  for (const race of RACES) {
    for (const gender of GENDERS) {
      for (let g = 0; g < GAMES_PER_COMBO; g++) {
        const seed = 10000 + idx * 7919
        const r = await runOne(seed, race, gender)
        results.push(r)
        idx++
        process.stdout.write('\r' + idx + '/' + TOTAL)
      }
    }
  }
  console.log('\n')

  const attrIds = Object.keys(results[0].initAttrs)

  // 1. 开局属性
  console.log('='.repeat(70))
  console.log('1. 开局属性 (默认值 + 种族修正 + 性别修正)')
  console.log('='.repeat(70))
  const header = attrIds.map(a => a.padStart(4)).join(' | ')
  console.log('种族     | 性别 | ' + header)
  console.log('-'.repeat(70))

  const seen = new Set<string>()
  for (const r of results) {
    const key = r.race + '-' + r.gender
    if (seen.has(key)) continue
    seen.add(key)
    const gSym = r.gender === 'male' ? 'M' : 'F'
    const vals = attrIds.map(a => pad(r.initAttrs[a] ?? 0, 4)).join(' | ')
    console.log((raceNames[r.race] ?? r.race).padEnd(8) + ' | ' + gSym.padStart(4) + ' | ' + vals)
  }

  // 2. 寿命统计
  console.log('\n' + '='.repeat(70))
  console.log('2. 寿命统计')
  console.log('='.repeat(70))
  console.log('种族     | 性别 | 最小 | 中位数 | 平均   | 最大 | 局数')
  console.log('-'.repeat(60))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const ls = group.map(r => r.lifespan)
      const gSym = gender === 'male' ? 'M' : 'F'
      const avg = (ls.reduce((a, b) => a + b, 0) / ls.length)
      console.log(
        (raceNames[race] ?? race).padEnd(8) + ' | ' + gSym.padStart(4) + ' | ' +
        pad(Math.min(...ls), 4) + ' | ' + pad(median(ls), 5) + ' | ' +
        padF(avg, 6, 1) + ' | ' + pad(Math.max(...ls), 4) + ' | ' + group.length
      )
    }
  }

  const allLs = results.map(r => r.lifespan)
  const allAvg = allLs.reduce((a, b) => a + b, 0) / allLs.length
  console.log('-'.repeat(60))
  console.log('总计     | 全部 | ' + pad(Math.min(...allLs), 4) + ' | ' + pad(median(allLs), 5) + ' | ' + padF(allAvg, 6, 1) + ' | ' + pad(Math.max(...allLs), 4) + ' | ' + results.length)

  // 3. 评分统计
  console.log('\n' + '='.repeat(70))
  console.log('3. 评分统计')
  console.log('='.repeat(70))
  console.log('种族     | 性别 | 最小 | 中位数 | 平均   | 最大 | 评级分布')
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
        (raceNames[race] ?? race).padEnd(8) + ' | ' + gSym.padStart(4) + ' | ' +
        pad(Math.min(...sc), 4) + ' | ' + pad(median(sc), 5) + ' | ' +
        padF(avg, 6, 1) + ' | ' + pad(Math.max(...sc), 4) + ' | ' + gradeStr
      )
    }
  }

  // 4. 属性峰值
  console.log('\n' + '='.repeat(70))
  console.log('4. 属性峰值总和')
  console.log('='.repeat(70))
  console.log('种族     | 性别 | 最小 | 中位数 | 平均   | 最大')
  console.log('-'.repeat(60))

  for (const race of RACES) {
    for (const gender of GENDERS) {
      const group = results.filter(r => r.race === race && r.gender === gender)
      const pk = group.map(r => r.peakSum)
      const gSym = gender === 'male' ? 'M' : 'F'
      const avg = pk.reduce((a, b) => a + b, 0) / pk.length
      console.log(
        (raceNames[race] ?? race).padEnd(8) + ' | ' + gSym.padStart(4) + ' | ' +
        pad(Math.min(...pk), 4) + ' | ' + pad(median(pk), 5) + ' | ' +
        padF(avg, 6, 1) + ' | ' + pad(Math.max(...pk), 4)
      )
    }
  }
}

main().catch(console.error)
