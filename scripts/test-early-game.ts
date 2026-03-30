/**
 * 早期游戏体验分析 — 10 轮，输出逐年属性变化和事件链条
 * 重点：早期事件条件是否可达、属性成长是否合理
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

interface YearSnapshot {
  age: number
  attrs: Record<string, number>
  hp: number
  eventId: string | null
  branchId: string | null
  phase: string
  availableCount: number
  totalBranches: number
  lockedCount: number
}

interface GameResult {
  lifespan: number
  score: number
  grade: string
  peakSum: number
  years: YearSnapshot[]
  finalFlags: string[]
}

function runOneGame(seed: number): GameResult {
  const world = createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)
  engine.initGame('测试角色')

  // 3 random talents
  const drafted = engine.draftTalents()
  const selected = drafted.slice(0, 3)
  engine.selectTalents(selected)

  // attribute allocation: random 1-5 spread, total 20
  const attrs = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const allocation: Record<string, number> = {}
  let remaining = 20
  for (const attr of attrs) {
    const val = Math.min(rand(1, 5), remaining - (attrs.length - attrs.indexOf(attr) - 1))
    allocation[attr] = Math.max(1, val)
    remaining -= allocation[attr]
  }
  engine.allocateAttributes(allocation)

  const years: YearSnapshot[] = []
  const initAttrs = { ...engine.getState().attributes }
  const initHp = engine.getState().hp

  // Record initial state (age 0)
  years.push({
    age: 0, attrs: { ...initAttrs }, hp: initHp,
    eventId: null, branchId: null, phase: 'init',
    availableCount: 0, totalBranches: 0, lockedCount: 0,
  })

  for (let year = 0; year < 100; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0) break

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()

    if (stateAfter.hp <= 0) {
      years.push({
        age: stateAfter.age, attrs: { ...stateAfter.attributes }, hp: stateAfter.hp,
        eventId: yearResult.event?.id ?? 'death', branchId: null,
        phase: 'death', availableCount: 0, totalBranches: 0, lockedCount: 0,
      })
      break
    }

    const totalBranches = yearResult.branches?.length ?? 0
    let availableCount = 0
    let lockedCount = 0
    let chosenBranchId: string | null = null

    if (yearResult.phase === 'awaiting_choice' && yearResult.event && yearResult.branches && yearResult.branches.length > 0) {
      const available = yearResult.branches.filter(b => {
        if (!b.requireCondition) return true
        const cond = b.requireCondition
        const a = stateAfter.attributes
        const flags = stateAfter.flags
        const attrMatch = [...cond.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]
        for (const m of attrMatch) {
          const val = a[m[1]] ?? 0
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
      availableCount = available.length
      lockedCount = totalBranches - availableCount

      if (available.length > 0) {
        const branch = pick(available)
        chosenBranchId = branch.id
        engine.resolveBranch(branch.id)
      }
    } else if (yearResult.phase === 'showing_event') {
      // mundane year, auto continue
    }

    const finalState = engine.getState()
    years.push({
      age: finalState.age,
      attrs: { ...finalState.attributes },
      hp: finalState.hp,
      eventId: yearResult.event?.id ?? (yearResult.phase === 'mundane_year' ? 'mundane' : null),
      branchId: chosenBranchId,
      phase: yearResult.phase,
      availableCount,
      totalBranches,
      lockedCount,
    })
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world)
  const result = evaluator.calculate(finalState)

  return {
    lifespan: finalState.age,
    score: result.score,
    grade: result.grade,
    peakSum: result.details.totalAttributePeakSum,
    years,
    finalFlags: [...finalState.flags],
  }
}

function main() {
  const N = 10
  console.log(`=== 早期游戏体验分析 — ${N} 轮 ===\n`)

  for (let i = 1; i <= N; i++) {
    const seed = 1000 + i * 7919
    const game = runOneGame(seed)

    console.log(`\n${'═'.repeat(60)}`)
    console.log(`🎮 第 ${i} 局 (seed=${seed}) — ${game.grade}级, ${game.lifespan}岁, peakSum=${game.peakSum}`)
    console.log(`${'═'.repeat(60)}`)

    // Initial attributes
    const init = game.years[0]
    console.log(`\n📋 初始属性: str=${init.attrs.str} mag=${init.attrs.mag} int=${init.attrs.int} spr=${init.attrs.spr} chr=${init.attrs.chr} mny=${init.attrs.mny} luk=${init.attrs.luk}  HP=${init.hp}`)

    // Per-year table (focus on first 30 years)
    console.log(`\n📊 逐年变化 (前30年):`)
    console.log(`年龄 | STR MAG INT SPR CHR MNY LUK |  HP  | 事件 | 可选/总数`)
    console.log(`-----|---------------------------|------|------|----------`)

    for (const y of game.years) {
      if (y.age === 0) continue
      if (y.age > 30) break
      const a = y.attrs
      const attrStr = `${String(a.str).padStart(2)}  ${String(a.mag).padStart(2)}  ${String(a.int).padStart(2)}  ${String(a.spr).padStart(2)}  ${String(a.chr).padStart(2)}  ${String(a.mny).padStart(2)}  ${String(a.luk).padStart(2)}`
      const hpStr = String(y.hp).padStart(3)
      const evt = (y.eventId ?? '-').slice(0, 25).padEnd(25)
      const avStr = y.totalBranches > 0 ? `${y.availableCount}/${y.totalBranches}` : '-'
      const lockWarn = y.lockedCount > 0 && y.availableCount === 0 ? ' ⚠️全锁!' : (y.lockedCount > 0 ? ` 🔒${y.lockedCount}` : '')
      console.log(`${String(y.age).padStart(3)}  | ${attrStr} | ${hpStr} | ${evt} | ${avStr}${lockWarn}`)
    }

    // Summary for later years
    if (game.lifespan > 30) {
      const age30 = game.years.find(y => y.age === 30)
      if (age30) {
        console.log(`\n... 30岁时属性: str=${age30.attrs.str} mag=${age30.attrs.mag} int=${age30.attrs.int} spr=${age30.attrs.spr} chr=${age30.attrs.chr} mny=${age30.attrs.mny} luk=${age30.attrs.luk}`)
      }
    }

    // Event chain analysis
    const events = game.years.filter(y => y.eventId && y.eventId !== 'mundane' && y.eventId !== 'death')
    console.log(`\n🔗 事件链条 (${events.length}个事件):`)
    for (const e of events) {
      const lock = e.lockedCount > 0 && e.availableCount === 0 ? ' [全锁!]' : ''
      const partial = e.lockedCount > 0 ? ` [🔒${e.lockedCount}锁]` : ''
      const branch = e.branchId ? ` → ${e.branchId}` : ''
      console.log(`  ${String(e.age).padStart(3)}岁: ${e.eventId}${branch}${lock}${partial}`)
    }

    // Key metrics
    const allLocked = game.years.filter(y => y.totalBranches > 0 && y.availableCount === 0)
    const partialLocked = game.years.filter(y => y.totalBranches > 0 && y.lockedCount > 0 && y.availableCount > 0)
    const mundaneYears = game.years.filter(y => y.phase === 'mundane_year' || y.eventId === 'mundane')

    console.log(`\n📈 统计: 事件=${events.length}, 平年=${mundaneYears.length}, 全锁=${allLocked.length}, 部分锁=${partialLocked.length}`)
    console.log(`   最终: str=${game.years[game.years.length-1].attrs.str} mag=${game.years[game.years.length-1].attrs.mag} int=${game.years[game.years.length-1].attrs.int} spr=${game.years[game.years.length-1].attrs.spr} chr=${game.years[game.years.length-1].attrs.chr} mny=${game.years[game.years.length-1].attrs.mny} luk=${game.years[game.years.length-1].attrs.luk}`)
    console.log(`   flags: ${game.finalFlags.join(', ') || '(无)'}`)
  }

  // Cross-game summary
  console.log(`\n\n${'█'.repeat(60)}`)
  console.log(`📊 跨局汇总`)
  console.log(`${'█'.repeat(60)}`)
}

main()
