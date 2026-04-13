/**
 * 第二轮平衡验证脚本
 * 4个可玩种族 × 30局，随机属性分配，策略引擎分支选择
 * 重点验证：
 *   1. 精灵 σ 是否降到 <70
 *   2. 评分种族间差距是否缩小（目标差距<200）
 *   3. 人类/哥布林中位数是否仍然合理
 *
 * 运行: npx tsx scripts/balance-v2.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { EventBranch, EventEffect, Gender } from '../src/engine/core/types'

// ==================== 工具函数 ====================

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ==================== 策略引擎 (simplified: random personality per game) ====================

type Personality = 'aggressive' | 'cautious' | 'optimized' | 'story' | 'random'

const STORY_KEYWORDS = ['龙', '神', '深渊', '宝藏', '魔法', '传说', '神器', '恶魔', '天使',
  'dragon', 'god', 'abyss', 'treasure', 'magic', 'legend', 'artifact', 'demon', 'angel',
  'ancient', 'forbidden', 'mysterious', 'secret', 'ruin', 'curse', 'divine', 'sacred',
  '禁忌', '神秘', '遗迹', '诅咒', '神圣', '灵魂', '命运', '预言']

interface BranchAnalysis {
  branch: EventBranch
  positiveScore: number
  negativeScore: number
  netScore: number
  hasRisk: boolean
  storyScore: number
  hpEffect: number
  attrGains: string[]
}

function analyzeBranch(branch: EventBranch): BranchAnalysis {
  let positiveScore = 0, negativeScore = 0, hpEffect = 0, storyScore = 0
  const attrGains: string[] = []

  const analyzeEffects = (effects: EventEffect[]) => {
    for (const eff of effects) {
      switch (eff.type) {
        case 'modify_attribute': {
          if (eff.value > 0) { positiveScore += eff.value; attrGains.push(`${eff.target}+${eff.value}`) }
          else if (eff.value < 0) negativeScore += Math.abs(eff.value)
          break
        }
        case 'set_attribute': { positiveScore += Math.max(0, eff.value); break }
        case 'modify_hp': {
          hpEffect += eff.value
          if (eff.value > 0) positiveScore += eff.value * 0.5
          else negativeScore += Math.abs(eff.value) * 1.5
          break
        }
        case 'set_flag': { positiveScore += 0.5; break }
        case 'remove_flag': { break }
        case 'add_talent': { positiveScore += 5; break }
        case 'trigger_event': { positiveScore += 1; break }
        case 'grant_item': { positiveScore += 3; break }
        case 'set_counter':
        case 'modify_counter': { positiveScore += 0.2; break }
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

  const combinedText = `${branch.title} ${branch.description}`.toLowerCase()
  for (const kw of STORY_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) storyScore++
  }

  return { branch, positiveScore, negativeScore, netScore: positiveScore - negativeScore, hasRisk: !!branch.riskCheck, storyScore, hpEffect, attrGains }
}

function strategySelect(personality: Personality, analyses: BranchAnalysis[], attrs: Record<string, number>, hp: number, age: number): BranchAnalysis {
  if (analyses.length === 1) return analyses[0]

  switch (personality) {
    case 'aggressive': {
      const withRisk = analyses.filter(a => a.hasRisk)
      const pool = withRisk.length > 0 ? withRisk : analyses
      return [...pool].sort((a, b) => b.netScore - a.netScore)[0]
    }
    case 'cautious': {
      const safe = analyses.filter(a => a.hpEffect >= 0 && !a.hasRisk)
      const pool = safe.length > 0 ? safe : analyses
      return [...pool].sort((a, b) => b.positiveScore - a.positiveScore)[0]
    }
    case 'optimized': {
      const scored = analyses.map(a => {
        let bonus = a.netScore
        for (const gain of a.attrGains) {
          const match = gain.match(/(\w+)\+(\d+\.?\d*)/)
          if (match) {
            const current = attrs[match[1]] ?? 0
            bonus += (10 - Math.min(current, 10)) / 10 * parseFloat(match[2]) * 0.3
          }
        }
        return { analysis: a, weightedScore: bonus }
      })
      return scored.sort((a, b) => b.weightedScore - a.weightedScore)[0].analysis
    }
    case 'story': {
      const sorted = [...analyses].sort((a, b) => b.storyScore - a.storyScore)
      return sorted[0].storyScore > 0 ? sorted[0] : [...analyses].sort((a, b) => b.netScore - a.netScore)[0]
    }
    case 'random': return pick(analyses)
  }
}

// ==================== 游戏模拟 ====================

interface GameResult {
  score: number
  grade: string
  lifespan: number
  peakSum: number
  race: string
  personality: Personality
}

const PERSONALITIES: Personality[] = ['aggressive', 'cautious', 'optimized', 'story', 'random']
const PLAYABLE_RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const RACE_LABELS: Record<string, string> = { human: '🧑 人类', elf: '🧝 精灵', goblin: '👺 哥布林', dwarf: '⛏️ 矮人' }

async function runOneGame(seed: number, personality: Personality, race: string, gender: Gender): Promise<GameResult> {
  const world = await createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)

  engine.initGame('测试角色', undefined, race, gender)

  // Draft talents (pick up to 3, exclude conflicts)
  const drafted = engine.draftTalents()
  const conflicts: [string, string][] = [['dragon_blood', 'demon_heritage']]
  const selected: string[] = []
  for (const id of drafted) {
    if (selected.length >= 3) break
    if (!conflicts.some(([a, b]) => (id === a && selected.includes(b)) || (id === b && selected.includes(a)))) {
      selected.push(id)
    }
  }
  engine.selectTalents(selected)

  // Random attribute allocation
  const visibleAttrs = world.attributes.filter(a => !a.hidden && a.group !== 'hidden').map(a => a.id)
  const totalPoints = world.manifest.initialPoints
  const allocation: Record<string, number> = {}
  let remaining = totalPoints
  for (let i = 0; i < visibleAttrs.length; i++) {
    const val = Math.min(rand(1, 5), remaining - (visibleAttrs.length - i - 1))
    allocation[visibleAttrs[i]] = Math.max(1, val)
    remaining -= allocation[visibleAttrs[i]]
  }
  for (const attr of visibleAttrs) {
    const add = Math.min(remaining, 10 - allocation[attr])
    allocation[attr] += add
    remaining -= add
    if (remaining <= 0) break
  }
  engine.allocateAttributes(allocation)

  // Simulate
  for (let year = 0; year < 600; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0 || stateBefore.phase === 'finished') break

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()
    if (stateAfter.hp <= 0 || stateAfter.phase === 'finished') break

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
        const analyses = available.map(b => analyzeBranch(b))
        const chosen = strategySelect(personality, analyses, stateAfter.attributes, stateAfter.hp, stateAfter.age)
        engine.resolveBranch(chosen.branch.id)
      }
    }
  }

  const finalState = engine.getState()
  const evaluator = new EvaluatorModule(world, world.evaluations)
  const result = evaluator.calculate(finalState)

  return {
    score: result.score,
    grade: result.grade,
    lifespan: result.details.lifespan,
    peakSum: result.details.totalAttributePeakSum,
    race,
    personality,
  }
}

// ==================== 统计工具 ====================

function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  return { min: sorted[0], max: sorted[n - 1], mean, median, std, p10: sorted[Math.floor(n * 0.1)], p25: sorted[Math.floor(n * 0.25)], p75: sorted[Math.floor(n * 0.75)], p90: sorted[Math.floor(n * 0.9)] }
}

// ==================== 主逻辑 ====================

async function main() {
  const GAMES_PER_RACE = 30
  const GENDERS: Gender[] = ['male', 'female']
  const TOTAL = GAMES_PER_RACE * PLAYABLE_RACES.length

  console.log(`📊 第二轮平衡验证`)
  console.log(`   ${PLAYABLE_RACES.length} 种族 × ${GAMES_PER_RACE} 局 = ${TOTAL} 局`)
  console.log(`   commit: 88d057d (fix/debt-event-condition)`)
  console.log()

  const allResults: GameResult[] = []

  let idx = 0
  for (const race of PLAYABLE_RACES) {
    for (let j = 0; j < GAMES_PER_RACE; j++) {
      const seed = 5000 + idx * 7919
      const gender = GENDERS[idx % 2]
      const personality = PERSONALITIES[idx % PERSONALITIES.length]
      const r = await runOneGame(seed, personality, race, gender)
      allResults.push(r)
      idx++
      // Progress indicator
      if ((idx) % 10 === 0) {
        console.log(`   进度: ${idx}/${TOTAL}`)
      }
    }
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log(`📈 种族评分分布统计`)
  console.log(`${'='.repeat(80)}\n`)

  const raceResults: Record<string, GameResult[]> = {}
  for (const race of PLAYABLE_RACES) {
    raceResults[race] = allResults.filter(r => r.race === race)
  }

  // Per-race stats
  const raceStatsMap: Record<string, ReturnType<typeof stats>> = {}
  for (const race of PLAYABLE_RACES) {
    const games = raceResults[race]
    const scores = games.map(g => g.score)
    const lifespans = games.map(g => g.lifespan)
    const peakSums = games.map(g => g.peakSum)
    const scoreStats = stats(scores)
    const lifeStats = stats(lifespans)
    const peakStats = stats(peakSums)

    raceStatsMap[race] = scoreStats

    // Grade distribution
    const gradeCounts = new Map<string, number>()
    for (const g of games) {
      gradeCounts.set(g.grade, (gradeCounts.get(g.grade) ?? 0) + 1)
    }
    const gradeStr = [...gradeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([g, c]) => `${g}×${c}`).join(' ')

    console.log(`${RACE_LABELS[race]} (${games.length}局):`)
    console.log(`  score:  mean=${scoreStats.mean.toFixed(1)}  median=${scoreStats.median.toFixed(1)}  σ=${scoreStats.std.toFixed(1)}  range=[${scoreStats.min}, ${scoreStats.max}]`)
    console.log(`  P10=${scoreStats.p10}  P25=${scoreStats.p25}  P75=${scoreStats.p75}  P90=${scoreStats.p90}`)
    console.log(`  life:   mean=${lifeStats.mean.toFixed(1)}  median=${lifeStats.median.toFixed(1)}  σ=${lifeStats.std.toFixed(1)}`)
    console.log(`  peak:   mean=${peakStats.mean.toFixed(1)}  median=${peakStats.median.toFixed(1)}`)
    console.log(`  评级:   ${gradeStr}`)
    console.log()
  }

  // ==================== 验证指标 ====================

  console.log(`${'='.repeat(80)}`)
  console.log(`🎯 平衡验证指标`)
  console.log(`${'='.repeat(80)}\n`)

  // 1. 精灵 σ 检查
  const elfStats = raceStatsMap['elf']
  const elfSigmaCheck = elfStats.std < 70
  console.log(`[1] 精灵 score σ: ${elfStats.std.toFixed(1)}  目标: <70  ${elfSigmaCheck ? '✅ PASS' : '❌ FAIL'}`)

  // 2. 种族间评分差距
  const medians = PLAYABLE_RACES.map(r => raceStatsMap[r].median)
  const maxMedian = Math.max(...medians)
  const minMedian = Math.min(...medians)
  const medianGap = maxMedian - minMedian
  const gapCheck = medianGap < 200
  console.log(`[2] 种族中位数差距: ${medianGap.toFixed(1)}  目标: <200  ${gapCheck ? '✅ PASS' : '❌ FAIL'}`)
  for (const race of PLAYABLE_RACES) {
    console.log(`    ${RACE_LABELS[race]}: median=${raceStatsMap[race].median.toFixed(1)}`)
  }

  // 3. 人类/哥布林中位数合理性
  const humanMedian = raceStatsMap['human'].median
  const goblinMedian = raceStatsMap['goblin'].median
  const humanReasonable = humanMedian >= 100 && humanMedian <= 500
  const goblinReasonable = goblinMedian >= 100 && goblinMedian <= 500
  console.log(`[3] 人类 median: ${humanMedian.toFixed(1)}  目标: [100, 500]  ${humanReasonable ? '✅ PASS' : '⚠️ REVIEW'}`)
  console.log(`[3] 哥布林 median: ${goblinMedian.toFixed(1)}  目标: [100, 500]  ${goblinReasonable ? '✅ PASS' : '⚠️ REVIEW'}`)

  // 4. 额外指标
  console.log(`\n[4] 额外指标:`)
  for (const race of PLAYABLE_RACES) {
    const s = raceStatsMap[race]
    // Coefficient of variation
    const cv = (s.std / s.mean * 100).toFixed(1)
    console.log(`    ${RACE_LABELS[race]}: CV=${cv}%  mean=${s.mean.toFixed(1)}  σ=${s.std.toFixed(1)}`)
  }

  // 5. 种族间均值差距
  const means = PLAYABLE_RACES.map(r => raceStatsMap[r].mean)
  const maxMean = Math.max(...means)
  const minMean = Math.min(...means)
  const meanGap = maxMean - minMean
  const meanGapCheck = meanGap < 200
  console.log(`\n[5] 种族均值差距: ${meanGap.toFixed(1)}  目标: <200  ${meanGapCheck ? '✅ PASS' : '⚠️ REVIEW'}`)

  // 6. 评级分布
  console.log(`\n[6] 总体评级分布:`)
  const totalGradeCounts = new Map<string, number>()
  for (const r of allResults) {
    totalGradeCounts.set(r.grade, (totalGradeCounts.get(r.grade) ?? 0) + 1)
  }
  for (const [grade, count] of [...totalGradeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    const pct = (count / TOTAL * 100).toFixed(1)
    console.log(`    ${grade}: ${count}/${TOTAL} (${pct}%)`)
  }

  // ==================== 总结 ====================

  const passCount = [elfSigmaCheck, gapCheck, humanReasonable, goblinReasonable, meanGapCheck].filter(Boolean).length
  const totalChecks = 5

  console.log(`\n${'='.repeat(80)}`)
  console.log(`📋 验证总结`)
  console.log(`${'='.repeat(80)}`)
  console.log(`   通过: ${passCount}/${totalChecks}`)
  if (passCount === totalChecks) {
    console.log(`   🎉 所有验证通过！平衡调整达标。`)
  } else {
    console.log(`   ⚠️  存在未达标项，请查看上方详细数据。`)
  }
}

main()
