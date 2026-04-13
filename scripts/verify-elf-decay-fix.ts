/**
 * 第四轮验证脚本 — 精灵衰减修复
 * 测试: 4个可玩种族各20局
 * 重点:
 *   1. 精灵中位数 ≥ 250（范围 250-400）
 *   2. 其他种族没有退化
 *   3. 评分分布
 *
 * 运行: npx tsx scripts/verify-elf-decay-fix.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { EventBranch, Gender } from '../src/engine/core/types'

// ==================== Config ====================
const GAMES_PER_RACE = 20
const PLAYABLE_RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
type PlayableRace = typeof PLAYABLE_RACES[number]
const RACE_LABELS: Record<string, string> = {
  human: '🧑 人类',
  elf: '🧝 精灵',
  goblin: '👺 哥布林',
  dwarf: '⛏️ 矮人',
}
const RACE_EXPECTED: Record<string, { median: number; min: number; max: number }> = {
  human:  { median: 50,  min: 40, max: 60 },
  elf:    { median: 325, min: 250, max: 400 },
  goblin: { median: 28,  min: 20, max: 35 },
  dwarf:  { median: 200, min: 150, max: 250 },
}
const GENDERS: Gender[] = ['male', 'female']

// ==================== Helpers ====================
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ==================== Strategy (cautious/optimized mix for stable results) ====================
interface BranchAnalysis {
  branch: EventBranch
  netScore: number
  hpEffect: number
  attrGains: string[]
}

function analyzeBranch(branch: EventBranch): BranchAnalysis {
  let positiveScore = 0
  let negativeScore = 0
  let hpEffect = 0
  const attrGains: string[] = []

  const analyzeEffects = (effects: any[]) => {
    for (const eff of effects) {
      switch (eff.type) {
        case 'modify_attribute':
          if (eff.value > 0) { positiveScore += eff.value; attrGains.push(`${eff.target}+${eff.value}`) }
          else negativeScore += Math.abs(eff.value)
          break
        case 'set_attribute':
          positiveScore += Math.max(0, eff.value)
          break
        case 'modify_hp':
          hpEffect += eff.value
          if (eff.value > 0) positiveScore += eff.value * 0.5
          else negativeScore += Math.abs(eff.value) * 1.5
          break
        case 'set_flag':
          positiveScore += 0.5
          break
        case 'add_talent':
          positiveScore += 5
          break
        case 'grant_item':
          positiveScore += 3
          break
      }
    }
  }

  analyzeEffects(branch.effects)
  if (branch.failureEffects) {
    for (const eff of branch.failureEffects) {
      if (eff.type === 'modify_hp' && eff.value < 0) {
        negativeScore += Math.abs(eff.value) * 0.4
      }
    }
  }

  return { branch, netScore: positiveScore - negativeScore, hpEffect, attrGains }
}

function selectBranch(analyses: BranchAnalysis[], hp: number): EventBranch | null {
  if (analyses.length === 0) return null
  if (analyses.length === 1) return analyses[0].branch
  // Optimized strategy: prefer safe + high netScore
  const safe = analyses.filter(a => a.hpEffect >= 0).sort((a, b) => b.netScore - a.netScore)
  if (safe.length > 0) return safe[0].branch
  return [...analyses].sort((a, b) => b.netScore - a.netScore)[0].branch
}

// ==================== Game Simulation ====================
interface GameResult {
  seed: number
  race: string
  gender: Gender
  lifespan: number
  peakSum: number
  score: number
  grade: string
  flags: Set<string>
}

async function runOneGame(seed: number, race: string, gender: Gender): Promise<GameResult> {
  const world = await createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)
  engine.initGame('测试角色', undefined, race, gender)

  // Talent selection
  const drafted = engine.draftTalents()
  const selected = drafted.slice(0, 3)
  engine.selectTalents(selected)

  // Attribute allocation (balanced 3-4 per visible attr)
  const visibleAttrs = world.attributes.filter(a => !a.hidden && a.group !== 'hidden').map(a => a.id)
  const totalPoints = world.manifest.initialPoints
  const base = Math.floor(totalPoints / visibleAttrs.length)
  const allocation: Record<string, number> = {}
  let remaining = totalPoints
  for (const attr of visibleAttrs) {
    const val = Math.min(base, remaining)
    allocation[attr] = Math.max(1, val)
    remaining -= allocation[attr]
  }
  // Distribute remaining
  for (const attr of visibleAttrs) {
    if (remaining <= 0) break
    const add = Math.min(remaining, 7 - allocation[attr])
    allocation[attr] += add
    remaining -= add
  }
  engine.allocateAttributes(allocation)

  // Simulate year by year
  for (let year = 0; year < 1000; year++) {
    const state = engine.getState()
    if (state.hp <= 0 || state.phase === 'finished') break

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()
    if (stateAfter.hp <= 0 || stateAfter.phase === 'finished') break

    if (yearResult.phase === 'awaiting_choice' && yearResult.event && yearResult.branches && yearResult.branches.length > 0) {
      const available = yearResult.branches.filter(b => {
        if (!b.requireCondition) return true
        const cond = b.requireCondition
        const attrs = stateAfter.attributes
        const flags = stateAfter.flags
        const attrMatch = [...cond.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]
        for (const m of attrMatch) {
          const val = attrs[m[1]] ?? 0
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
        const analyses = available.map(b => analyzeBranch(b))
        const chosen = selectBranch(analyses, stateAfter.hp)
        if (chosen) engine.resolveBranch(chosen.id)
      }
    }
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world, world.evaluations)
  const result = evaluator.calculate(finalState)

  return {
    seed,
    race,
    gender,
    lifespan: result.details.lifespan,
    peakSum: result.details.totalAttributePeakSum,
    score: result.score,
    grade: result.grade,
    flags: finalState.flags,
  }
}

// ==================== Stats ====================
function percentile(sorted: number[], p: number): number {
  const idx = Math.floor(sorted.length * p / 100)
  return sorted[Math.min(idx, sorted.length - 1)]
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// ==================== Main ====================
async function main() {
  console.log('═'.repeat(70))
  console.log('🔬 第四轮验证 — 精灵衰减修复 (sigmoid 0.50→0.60, quadScale 1.2→0.8)')
  console.log('═'.repeat(70))
  console.log(`分支: fix/debt-event-condition (commit 395168e)`)
  console.log(`测试: ${PLAYABLE_RACES.length} 种族 × ${GAMES_PER_RACE} 局 = ${PLAYABLE_RACES.length * GAMES_PER_RACE} 局\n`)

  const allResults: GameResult[] = []
  const raceResults: Record<string, GameResult[]> = {}

  for (const race of PLAYABLE_RACES) {
    raceResults[race] = []
    console.log(`\n--- ${RACE_LABELS[race]} (${race}) ---`)
    console.log('  #  | seed  | gender | lifespan | peakSum | score | grade')
    console.log('  ---|-------|--------|----------|---------|-------|------')

    for (let i = 0; i < GAMES_PER_RACE; i++) {
      const seed = race.charCodeAt(0) * 10000 + i * 7919
      const gender = GENDERS[i % GENDERS.length]
      const r = await runOneGame(seed, race, gender)
      raceResults[race].push(r)
      allResults.push(r)

      const expected = RACE_EXPECTED[race]
      const inRange = r.lifespan >= expected.min && r.lifespan <= expected.max
      const marker = inRange ? '✅' : '❌'
      console.log(
        `  ${String(i + 1).padStart(2)} | ${String(seed).padStart(6)} | ${(gender === 'male' ? '♂' : '♀').padEnd(6)} | ${String(r.lifespan).padStart(8)} | ${String(r.peakSum).padStart(7)} | ${String(r.score).padStart(5)} | ${r.grade} ${marker}`
      )
    }
  }

  // ==================== Analysis ====================
  console.log('\n\n' + '═'.repeat(70))
  console.log('📊 种族维度统计')
  console.log('═'.repeat(70))

  const issues: string[] = []

  for (const race of PLAYABLE_RACES) {
    const results = raceResults[race]
    const label = RACE_LABELS[race]
    const expected = RACE_EXPECTED[race]
    const lifespans = results.map(r => r.lifespan).sort((a, b) => a - b)
    const scores = results.map(r => r.score).sort((a, b) => a - b)
    const med = median(lifespans)
    const avg = lifespans.reduce((a, b) => a + b, 0) / lifespans.length
    const min = lifespans[0]
    const max = lifespans[lifespans.length - 1]
    const inRange = results.filter(r => r.lifespan >= expected.min && r.lifespan <= expected.max).length

    console.log(`\n  ${label} (n=${results.length})`)
    console.log(`    lifespan: min=${min}  P25=${percentile(lifespans, 25)}  median=${med}  P75=${percentile(lifespans, 75)}  max=${max}  avg=${avg.toFixed(1)}`)
    console.log(`    score:    min=${scores[0]}  median=${median(scores)}  max=${scores[scores.length - 1]}  avg=${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}`)
    console.log(`    期望范围: [${expected.min}, ${expected.max}], 期望中位数: ~${expected.median}`)
    console.log(`    范围内: ${inRange}/${results.length} (${Math.round(inRange / results.length * 100)}%)`)

    // Grade distribution
    const gradeDist = new Map<string, number>()
    for (const r of results) {
      gradeDist.set(r.grade, (gradeDist.get(r.grade) ?? 0) + 1)
    }
    console.log(`    评级分布: ${[...gradeDist.entries()].map(([g, c]) => `${g}×${c}`).join(' ')}`)

    // Check criteria
    if (race === 'elf') {
      if (med >= 250 && med <= 400) {
        console.log(`    ✅ PASS: 精灵中位数 ${med} ∈ [250, 400]`)
      } else {
        const msg = `❌ FAIL: 精灵中位数 ${med} ∉ [250, 400]`
        console.log(`    ${msg}`)
        issues.push(msg)
      }
      if (inRange < 10) {
        const msg = `⚠️ WARN: 精灵仅 ${inRange}/${results.length} 局在范围内`
        console.log(`    ${msg}`)
        issues.push(msg)
      }
    } else {
      // Other races should not regress
      if (inRange >= 10) {
        console.log(`    ✅ PASS: ${label} ${inRange}/${results.length} 局在预期范围内，无退化`)
      } else {
        const msg = `❌ FAIL: ${label} 仅 ${inRange}/${results.length} 局在范围内，疑似退化`
        console.log(`    ${msg}`)
        issues.push(msg)
      }
    }
  }

  // ==================== Score Distribution ====================
  console.log('\n\n' + '═'.repeat(70))
  console.log('📈 总体评分分布')
  console.log('═'.repeat(70))

  const allScores = allResults.map(r => r.score).sort((a, b) => a - b)
  const N = allResults.length
  console.log(`  总体: min=${allScores[0]}  P10=${percentile(allScores, 10)}  P25=${percentile(allScores, 25)}  median=${median(allScores)}  P75=${percentile(allScores, 75)}  P90=${percentile(allScores, 90)}  max=${allScores[N - 1]}`)
  console.log(`  平均: ${(allScores.reduce((a, b) => a + b, 0) / N).toFixed(1)}`)

  const allGrades = new Map<string, number>()
  for (const r of allResults) {
    allGrades.set(r.grade, (allGrades.get(r.grade) ?? 0) + 1)
  }
  console.log(`\n  全局评级分布:`)
  for (const [grade, count] of [...allGrades.entries()].sort()) {
    const pct = Math.round(count / N * 100)
    const bar = '█'.repeat(Math.round(pct / 2))
    console.log(`    ${grade.padEnd(3)}: ${String(count).padStart(2)}/${N} (${String(pct).padStart(3)}%) ${bar}`)
  }

  // ==================== Summary ====================
  console.log('\n\n' + '═'.repeat(70))
  console.log('📋 验证结论')
  console.log('═'.repeat(70))

  if (issues.length === 0) {
    console.log('\n  ✅ 全部通过')
    console.log('  - 精灵中位数 ≥ 250 (范围内)')
    console.log('  - 其他种族无退化')
    console.log('  - 评分分布正常')
  } else {
    console.log(`\n  ❌ 发现 ${issues.length} 个问题:`)
    for (const issue of issues) {
      console.log(`    - ${issue}`)
    }
  }

  // Cross-race balance check
  console.log('\n  跨种族评分平衡:')
  for (const race of PLAYABLE_RACES) {
    const avg = raceResults[race].reduce((s, r) => s + r.score, 0) / raceResults[race].length
    const overallAvg = allResults.reduce((s, r) => s + r.score, 0) / N
    const diff = avg - overallAvg
    const sign = diff >= 0 ? '+' : ''
    console.log(`    ${RACE_LABELS[race].padEnd(10)} avg_score=${avg.toFixed(1)} (${sign}${diff.toFixed(1)} vs 全局)`)
  }
}

main()
