/**
 * 评分分布统计脚本 v2 — 策略引擎分支选择
 * 运行: npx tsx scripts/test-score-distribution.ts
 *
 * 改造：用5种"玩家性格"策略引擎代替纯随机选择，
 * 记录每次分支选择的理由，并按性格维度汇总对比。
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { EvaluatorModule } from '../src/engine/modules/EvaluatorModule'
import type { EventBranch, EventEffect } from '../src/engine/core/types'

// ==================== 工具函数 ====================

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ==================== 策略引擎 ====================

type Personality = 'aggressive' | 'cautious' | 'optimized' | 'story' | 'random'

const PERSONALITIES: Personality[] = ['aggressive', 'cautious', 'optimized', 'story', 'random']
const PERSONALITY_LABELS: Record<Personality, string> = {
  aggressive: '⚔️ 冒险型',
  cautious: '🛡️ 谨慎型',
  optimized: '🧮 最优型',
  story: '📖 叙事型',
  random: '🎲 随机型',
}

const STORY_KEYWORDS = ['龙', '神', '深渊', '宝藏', '魔法', '传说', '神器', '恶魔', '天使',
  'dragon', 'god', 'abyss', 'treasure', 'magic', 'legend', 'artifact', 'demon', 'angel',
  'ancient', 'forbidden', 'mysterious', 'secret', 'ruin', 'curse', 'divine', 'sacred',
  'dragon', 'dark', 'light', 'spirit', 'soul', 'destiny', 'prophecy', 'herald',
  '禁忌', '神秘', '秘密', '遗迹', '诅咒', '神圣', '灵魂', '命运', '预言']

interface BranchAnalysis {
  branch: EventBranch
  positiveScore: number
  negativeScore: number
  netScore: number
  hasRisk: boolean
  storyScore: number
  hpEffect: number
  flagEffects: string[]  // set_flag / remove_flag targets
  attrGains: string[]    // positive attribute modifications
}

/**
 * 分析单个分支的收益
 */
function analyzeBranch(branch: EventBranch): BranchAnalysis {
  let positiveScore = 0
  let negativeScore = 0
  let hpEffect = 0
  let storyScore = 0
  const flagEffects: string[] = []
  const attrGains: string[] = []

  const analyzeEffects = (effects: EventEffect[]) => {
    for (const eff of effects) {
      switch (eff.type) {
        case 'modify_attribute': {
          if (eff.value > 0) {
            positiveScore += eff.value
            attrGains.push(`${eff.target}+${eff.value}`)
          } else if (eff.value < 0) {
            negativeScore += Math.abs(eff.value)
          }
          break
        }
        case 'set_attribute': {
          positiveScore += Math.max(0, eff.value)
          break
        }
        case 'modify_hp': {
          hpEffect += eff.value
          if (eff.value > 0) positiveScore += eff.value * 0.5
          else negativeScore += Math.abs(eff.value) * 1.5  // HP loss weighted more
          break
        }
        case 'set_flag': {
          flagEffects.push(eff.target)
          positiveScore += 0.5  // flags are valuable for unlocking content
          break
        }
        case 'remove_flag': {
          flagEffects.push(`-${eff.target}`)
          break
        }
        case 'add_talent': {
          positiveScore += 5  // talents are very valuable
          break
        }
        case 'trigger_event': {
          positiveScore += 1  // chaining events is good
          break
        }
        case 'grant_item': {
          positiveScore += 3  // items are valuable
          break
        }
        case 'set_counter':
        case 'modify_counter': {
          positiveScore += 0.2
          break
        }
      }
    }
  }

  analyzeEffects(branch.effects)
  // Also consider failure effects (weighted down by ~50% chance)
  if (branch.failureEffects) {
    for (const eff of branch.failureEffects) {
      if (eff.type === 'modify_hp' && eff.value < 0) {
        negativeScore += Math.abs(eff.value) * 0.4
      }
    }
  }

  // Story score: count keyword matches in branch title/description
  const combinedText = `${branch.title} ${branch.description}`.toLowerCase()
  for (const kw of STORY_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) storyScore++
  }

  return {
    branch,
    positiveScore,
    negativeScore,
    netScore: positiveScore - negativeScore,
    hasRisk: !!branch.riskCheck,
    storyScore,
    hpEffect,
    flagEffects,
    attrGains,
  }
}

/**
 * 策略引擎：根据性格选择分支
 */
function strategySelect(
  personality: Personality,
  analyses: BranchAnalysis[],
  attrs: Record<string, number>,
  hp: number,
  age: number,
): { selected: BranchAnalysis; reason: string } {
  if (analyses.length === 1) {
    return { selected: analyses[0], reason: '唯一可选' }
  }

  switch (personality) {
    case 'aggressive': return aggressiveSelect(analyses, attrs)
    case 'cautious': return cautiousSelect(analyses, attrs, hp, age)
    case 'optimized': return optimizedSelect(analyses, attrs)
    case 'story': return storySelect(analyses)
    case 'random': return randomSelect(analyses)
  }
}

function aggressiveSelect(analyses: BranchAnalysis[], attrs: Record<string, number>) {
  // 高风险高回报：优先选有风险判定的，然后选 netScore 最高的
  const withRisk = analyses.filter(a => a.hasRisk)
  if (withRisk.length > 0) {
    // Pick the highest netScore among risky options
    const sorted = [...withRisk].sort((a, b) => b.netScore - a.netScore)
    const chosen = sorted[0]
    const topAttr = chosen.attrGains.length > 0 ? chosen.attrGains[0] : ''
    const reason = `有风险判定敢冒险, ${topAttr || '收益'+'+'+chosen.positiveScore.toFixed(1)}`
    return { selected: chosen, reason }
  }

  // No risk: pick highest netScore (even if risky on hp)
  const sorted = [...analyses].sort((a, b) => b.netScore - a.netScore)
  const chosen = sorted[0]
  const reason = `无风险选最高收益(${chosen.netScore.toFixed(1)}), ${chosen.attrGains.slice(0,2).join(', ') || '无属性增益'}`
  return { selected: chosen, reason }
}

function cautiousSelect(analyses: BranchAnalysis[], attrs: Record<string, number>, hp: number, age: number) {
  // 安全优先：避免 HP 损失，偏好正面增益
  const safe = analyses.filter(a => a.hpEffect >= 0 && !a.hasRisk)
  if (safe.length > 0) {
    // Among safe, pick highest positive score
    const sorted = [...safe].sort((a, b) => b.positiveScore - a.positiveScore)
    const chosen = sorted[0]
    const reason = `安全选项(${chosen.positiveScore.toFixed(1)}增益, hp${chosen.hpEffect>=0?'+':''}${chosen.hpEffect}), ${chosen.attrGains.slice(0,2).join(', ') || '保守策略'}`
    return { selected: chosen, reason }
  }

  // All options have some risk; pick least negative
  const sorted = [...analyses].sort((a, b) => a.negativeScore - b.negativeScore)
  const chosen = sorted[0]
  const reason = `无完全安全选项, 选最小损失(${chosen.negativeScore.toFixed(1)})`
  return { selected: chosen, reason }
}

function optimizedSelect(analyses: BranchAnalysis[], attrs: Record<string, number>) {
  // 最优型：计算每个分支对当前最低属性的补益
  const scored = analyses.map(a => {
    let bonus = a.netScore
    // Bonus for improving lowest attributes
    for (const gain of a.attrGains) {
      const match = gain.match(/(\w+)\+(\d+\.?\d*)/)
      if (match) {
        const attr = match[1]
        const val = parseFloat(match[2])
        const current = attrs[attr] ?? 0
        // Lower current attr = higher priority
        const scarcityBonus = (10 - Math.min(current, 10)) / 10 * val * 0.3
        bonus += scarcityBonus
      }
    }
    return { analysis: a, weightedScore: bonus }
  })

  scored.sort((a, b) => b.weightedScore - a.weightedScore)
  const chosen = scored[0].analysis
  const reason = `最优收益(${chosen.netScore.toFixed(1)}), ${chosen.attrGains.slice(0,2).join(', ') || '无属性'}`
  return { selected: chosen, reason }
}

function storySelect(analyses: BranchAnalysis[]) {
  // 叙事型：优先选故事分数最高的
  const sorted = [...analyses].sort((a, b) => b.storyScore - a.storyScore)
  // If all have 0 story score, fall back to netScore
  if (sorted[0].storyScore === 0) {
    const byNet = [...analyses].sort((a, b) => b.netScore - a.netScore)
    const chosen = byNet[0]
    const reason = `无叙事关键词, 选收益最高(${chosen.netScore.toFixed(1)})`
    return { selected: chosen, reason }
  }
  const chosen = sorted[0]
  const reason = `叙事关键词命中(${chosen.storyScore}分), ${chosen.flagEffects.length > 0 ? '新flag:'+chosen.flagEffects[0] : chosen.attrGains[0] || '有趣'}`
  return { selected: chosen, reason }
}

function randomSelect(analyses: BranchAnalysis[]) {
  const chosen = pick(analyses)
  return { selected: chosen, reason: '纯随机对照组' }
}

// ==================== 数据结构 ====================

interface DecisionLog {
  age: number
  eventId: string
  branchId: string
  personality: Personality
  reason: string
  alternatives: string[]
}

interface ScoreData {
  peakSum: number
  lifespan: number
  currentScore: number
  currentGrade: string
  personality: Personality
  eventLog: { age: number; eventId: string; branchId?: string }[]
  flags: Set<string>
  decisions: DecisionLog[]
}

// ==================== 游戏模拟 ====================

function runOneGame(seed: number, personality: Personality): ScoreData {
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

  const decisions: DecisionLog[] = []

  // Simulate until death or maxAge (引擎内部会处理死亡判定)
  for (let year = 0; year < 500; year++) {
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
        // Analyze all available branches
        const analyses = available.map(b => analyzeBranch(b))

        // Strategy engine selects
        const { selected, reason } = strategySelect(
          personality,
          analyses,
          stateAfter.attributes,
          stateAfter.hp,
          stateAfter.age,
        )

        engine.resolveBranch(selected.branch.id)

        decisions.push({
          age: stateAfter.age,
          eventId: yearResult.event.id,
          branchId: selected.branch.id,
          personality,
          reason,
          alternatives: analyses.filter(a => a.branch.id !== selected.branch.id).map(a => a.branch.id),
        })
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
    personality,
    eventLog: finalState.eventLog.map(e => ({ age: e.age, eventId: e.eventId, branchId: (e as any).branchId })),
    flags: finalState.flags,
    decisions,
  }
}

// ==================== 主逻辑 ====================

function main() {
  const GAMES_PER_PERSONALITY = 4
  const N = PERSONALITIES.length * GAMES_PER_PERSONALITY  // 20
  const data: ScoreData[] = []

  console.log(`📊 评分分布统计 v2 — 策略引擎分支选择`)
  console.log(`   ${PERSONALITIES.length} 种性格 × ${GAMES_PER_PERSONALITY} 局 = ${N} 局\n`)

  // Run all games
  let gameIdx = 0
  const personalitySeeds: Record<Personality, number[]> = { aggressive: [], cautious: [], optimized: [], story: [], random: [] }

  for (const personality of PERSONALITIES) {
    for (let j = 0; j < GAMES_PER_PERSONALITY; j++) {
      const seed = 1000 + gameIdx * 7919
      personalitySeeds[personality].push(seed)
      gameIdx++
    }
  }

  // === Run games with decision log ===
  console.log('局 | 性格     | peakSum | lifespan | score | grade')
  console.log('---|----------|---------|----------|-------|------')

  gameIdx = 0
  for (const personality of PERSONALITIES) {
    for (let j = 0; j < GAMES_PER_PERSONALITY; j++) {
      const seed = personalitySeeds[personality][j]
      const d = runOneGame(seed, personality)
      data.push(d)
      const label = PERSONALITY_LABELS[personality]
      console.log(`${String(gameIdx + 1).padStart(2)} | ${label.padEnd(10)}| ${String(d.peakSum).padStart(7)} | ${String(d.lifespan).padStart(8)} | ${String(d.currentScore).padStart(5)} | ${d.currentGrade}`)
      gameIdx++
    }
  }

  // === 决策日志 ===
  console.log('\n' + '='.repeat(80))
  console.log('📋 决策日志（策略引擎分支选择记录）')
  console.log('='.repeat(80))

  for (const d of data) {
    const gameLabel = PERSONALITY_LABELS[d.personality]
    console.log(`\n--- ${gameLabel} age=${d.lifespan} grade=${d.currentGrade} ---`)
    for (const dec of d.decisions) {
      const alts = dec.alternatives.length > 0 ? ` | 备选: ${dec.alternatives.join(', ')}` : ''
      console.log(`  age=${String(dec.age).padStart(2)} ${dec.eventId} → ${dec.branchId} | ${dec.personality} | ${dec.reason}${alts}`)
    }
    if (d.decisions.length === 0) {
      console.log('  (无分支选择)')
    }
  }

  // === 总体统计 ===
  console.log('\n' + '='.repeat(80))
  console.log('📈 总体统计')
  console.log('='.repeat(80))

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

  // === 性格维度对比 ===
  console.log('\n' + '='.repeat(80))
  console.log('🎭 性格维度对比')
  console.log('='.repeat(80))

  for (const personality of PERSONALITIES) {
    const games = data.filter(d => d.personality === personality)
    const label = PERSONALITY_LABELS[personality]
    const avgScore = games.reduce((s, d) => s + d.currentScore, 0) / games.length
    const avgLifespan = games.reduce((s, d) => s + d.lifespan, 0) / games.length
    const avgPeak = games.reduce((s, d) => s + d.peakSum, 0) / games.length

    const gradeDist = new Map<string, number>()
    for (const d of games) {
      gradeDist.set(d.currentGrade, (gradeDist.get(d.currentGrade) ?? 0) + 1)
    }
    const gradeStr = [...gradeDist.entries()].map(([g, c]) => `${g}×${c}`).join(' ')

    const minScore = Math.min(...games.map(d => d.currentScore))
    const maxScore = Math.max(...games.map(d => d.currentScore))
    const minLife = Math.min(...games.map(d => d.lifespan))
    const maxLife = Math.max(...games.map(d => d.lifespan))

    console.log(`\n  ${label} (${games.length}局):`)
    console.log(`    avg_score=${avgScore.toFixed(1)} [${minScore}-${maxScore}]  avg_lifespan=${avgLifespan.toFixed(1)} [${minLife}-${maxLife}]  avg_peak=${avgPeak.toFixed(1)}`)
    console.log(`    评级分布: ${gradeStr}`)
    console.log(`    总决策数: ${games.reduce((s, d) => s + d.decisions.length, 0)}`)
  }

  // 性格间差异显著性 (简单 ANOVA-like check)
  console.log('\n  --- 性格间差异 ---')
  const personalityScores: Record<Personality, number[]> = {} as any
  for (const p of PERSONALITIES) {
    personalityScores[p] = data.filter(d => d.personality === p).map(d => d.currentScore)
  }
  const overallAvg = scores.reduce((a, b) => a + b, 0) / N
  console.log(`  全局avg_score: ${overallAvg.toFixed(1)}`)
  for (const p of PERSONALITIES) {
    const avg = personalityScores[p].reduce((a, b) => a + b, 0) / personalityScores[p].length
    const diff = avg - overallAvg
    const sign = diff >= 0 ? '+' : ''
    console.log(`    ${PERSONALITY_LABELS[p]}: ${avg.toFixed(1)} (${sign}${diff.toFixed(1)})`)
  }

  // === 分支选择覆盖率分析 ===
  console.log('\n' + '='.repeat(80))
  console.log('🔀 分支选择覆盖率分析')
  console.log('='.repeat(80))

  // Track which branches were selected by which personalities
  const branchSelections: Record<string, { count: number; personalities: Set<Personality>; eventId: string }> = {}
  const allBranchesSeen: Record<string, string[]> = {} // eventId -> branchId[]

  for (const d of data) {
    for (const dec of d.decisions) {
      const key = `${dec.eventId} → ${dec.branchId}`
      if (!branchSelections[key]) {
        branchSelections[key] = { count: 0, personalities: new Set(), eventId: dec.eventId }
      }
      branchSelections[key].count++
      branchSelections[key].personalities.add(dec.personality)
    }
    for (const dec of d.decisions) {
      if (!allBranchesSeen[dec.eventId]) allBranchesSeen[dec.eventId] = []
      if (!allBranchesSeen[dec.eventId].includes(dec.branchId)) {
        allBranchesSeen[dec.eventId].push(dec.branchId)
      }
    }
  }

  // 1. "必选项" — all 5 personalities chose the same branch
  console.log('\n  ⚠️ 疑似"必选项"（被所有5种性格都选了的分支）:')
  const mandatoryBranches = Object.entries(branchSelections)
    .filter(([, v]) => v.personalities.size >= 5)
    .sort((a, b) => b[1].count - a[1].count)
  if (mandatoryBranches.length === 0) {
    console.log('    (无)')
  } else {
    for (const [key, info] of mandatoryBranches) {
      console.log(`    ${key}: ${info.count}次, 性格覆盖${info.personalities.size}/5`)
    }
  }

  // 2. "废选项" — branch that was available but never selected by anyone
  // We can't directly track "available but not selected", but we can track branches
  // that appear in alternatives but never as the selected choice
  const selectedBranchIds = new Set(Object.keys(branchSelections).map(k => k.split(' → ')[1]))
  const neverSelected: string[] = []
  for (const d of data) {
    for (const dec of d.decisions) {
      for (const alt of dec.alternatives) {
        if (!selectedBranchIds.has(alt) && !neverSelected.includes(alt)) {
          neverSelected.push(alt)
        }
      }
    }
  }
  console.log(`\n  🚫 从未被选中的分支 (${neverSelected.length}个):`)
  if (neverSelected.length === 0) {
    console.log('    (无 — 所有出现过的分支都至少被选过一次)')
  } else {
    for (const bid of neverSelected) {
      console.log(`    ${bid}`)
    }
  }

  // 3. Per-event branch diversity
  console.log('\n  📊 每个事件的分支多样性:')
  const eventBranchStats = new Map<string, { total: number; selected: Set<string>; perPersonality: Record<string, Set<string>> }>()
  for (const d of data) {
    for (const dec of d.decisions) {
      if (!eventBranchStats.has(dec.eventId)) {
        eventBranchStats.set(dec.eventId, { total: 0, selected: new Set(), perPersonality: {} as any })
      }
      const stat = eventBranchStats.get(dec.eventId)!
      stat.total++
      stat.selected.add(dec.branchId)
      if (!stat.perPersonality[dec.personality]) stat.perPersonality[dec.personality] = new Set()
      stat.perPersonality[dec.personality].add(dec.branchId)
    }
  }
  const diversityEntries = [...eventBranchStats.entries()].sort((a, b) => b[1].total - a[1].total)
  for (const [eventId, stat] of diversityEntries) {
    const diversityRatio = stat.selected.size / (allBranchesSeen[eventId]?.length || 1)
    const perP = Object.entries(stat.perPersonality).map(([p, s]) => `${p.slice(0,4)}=[${[...s].join(',')}]`).join(' ')
    console.log(`    ${eventId}: ${stat.total}次触发, ${stat.selected.size}/${allBranchesSeen[eventId]?.length || '?'}分支被选(${(diversityRatio*100).toFixed(0)}%) | ${perP}`)
  }

  // === 路线入口事件接受率 ===
  console.log('\n' + '='.repeat(80))
  console.log('🚪 路线入口事件接受率（按性格）')
  console.log('='.repeat(80))

  // Known route entry events (accept vs decline pattern)
  const routeEntryEvents: Record<string, { acceptBranches: string[]; declineBranches: string[] }> = {
    'guild_recruitment': { acceptBranches: ['join_guild'], declineBranches: ['hesitate_guild', 'refuse'] },
    'royal_summon': { acceptBranches: ['accept_knight'], declineBranches: ['decline_knight'] },
    'knight_examination': { acceptBranches: ['knight_pass', 'knight_clever'], declineBranches: ['knight_give_up'] },
    'hero_journey_start': { acceptBranches: ['accept_hero_journey'], declineBranches: ['refuse_hero_journey'] },
    'dark_mage_tempt': { acceptBranches: ['accept_power'], declineBranches: ['reject_fight', 'escape_dark'] },
    'magic_graduate': { acceptBranches: ['continue_research', 'become_advisor'], declineBranches: ['leave_academy'] },
  }

  for (const [eventId, { acceptBranches, declineBranches }] of Object.entries(routeEntryEvents)) {
    console.log(`\n  ${eventId}:`)
    const relevant = data.filter(d => d.decisions.some(dec => dec.eventId === eventId))
    if (relevant.length === 0) {
      console.log('    未触发过')
      continue
    }

    const perPersonality: Record<Personality, { accept: number; decline: number }> = { aggressive: { accept: 0, decline: 0 }, cautious: { accept: 0, decline: 0 }, optimized: { accept: 0, decline: 0 }, story: { accept: 0, decline: 0 }, random: { accept: 0, decline: 0 } }

    for (const d of relevant) {
      for (const dec of d.decisions) {
        if (dec.eventId !== eventId) continue
        if (acceptBranches.includes(dec.branchId)) {
          perPersonality[dec.personality].accept++
        } else if (declineBranches.includes(dec.branchId)) {
          perPersonality[dec.personality].decline++
        }
      }
    }

    for (const p of PERSONALITIES) {
      const total = perPersonality[p].accept + perPersonality[p].decline
      if (total === 0) continue
      const pct = Math.round(perPersonality[p].accept / total * 100)
      console.log(`    ${PERSONALITY_LABELS[p].padEnd(12)} 接受 ${perPersonality[p].accept}/${total} (${pct}%)`)
    }
  }

  // === 详细事件日志 ===
  console.log('\n' + '='.repeat(80))
  console.log('📜 详细事件日志 + 关联分析')
  console.log('='.repeat(80))

  for (let i = 0; i < N; i++) {
    const d = data[i]
    const label = PERSONALITY_LABELS[d.personality]
    console.log(`\n--- R${String(i+1).padStart(2)} ${label} (age=${d.lifespan}, grade=${d.currentGrade}) ---`)
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
  console.log('\n' + '='.repeat(80))
  console.log('🔗 事件关联分析')
  console.log('='.repeat(80))

  // 1. 链式事件检测
  const chainPairs: Record<string, number> = {}

  for (const d of data) {
    const events = d.eventLog
    for (let a = 0; a < events.length; a++) {
      for (let b = a + 1; b < events.length; b++) {
        const pair = `${events[a].eventId} → ${events[b].eventId}`
        chainPairs[pair] = (chainPairs[pair] || 0) + 1
      }
    }
  }

  console.log('\n--- 常见事件序列（≥2次） ---')
  const sorted = Object.entries(chainPairs).filter(([,c]) => c >= 2).sort((a,b) => b[1] - a[1])
  for (const [pair, count] of sorted.slice(0, 30)) {
    console.log(`  ${pair}: ${count}次`)
  }

  // 2. 前置Flag问题检测
  console.log('\n--- 前置Flag问题检测 ---')
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

  let flagIssues = 0
  for (const d of data) {
    const eventIds = new Set(d.eventLog.map(e => e.eventId))
    for (const [eventId, requiredFlag] of Object.entries(knownChains)) {
      if (eventIds.has(eventId) && !d.flags.has(requiredFlag) && !eventIds.has(requiredFlag.replace('has.flag.',''))) {
        flagIssues++
      }
    }
  }
  if (flagIssues === 0) {
    console.log('  ✅ 未检测到前置Flag问题')
  } else {
    console.log(`  ⚠️ 检测到 ${flagIssues} 个潜在前置Flag问题`)
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

  // === 最终总结 ===
  console.log('\n' + '='.repeat(80))
  console.log('📋 验证报告总结')
  console.log('='.repeat(80))

  // 1. Mandatory branches
  if (mandatoryBranches.length > 0) {
    console.log(`\n⚠️  必选项问题: ${mandatoryBranches.length} 个分支被所有5种性格选择`)
    for (const [key, info] of mandatoryBranches) {
      console.log(`    - ${key}`)
    }
  } else {
    console.log('\n✅ 必选项: 无分支被所有性格都选，分支设计合理')
  }

  // 2. Unused branches
  if (neverSelected.length > 0) {
    console.log(`\n⚠️  废选项问题: ${neverSelected.length} 个分支从未被选中`)
    for (const bid of neverSelected) {
      console.log(`    - ${bid}`)
    }
  } else {
    console.log('\n✅ 废选项: 所有出现过的分支都至少被选过一次')
  }

  // 3. Personality variance
  const scoreVars = PERSONALITIES.map(p => {
    const games = data.filter(d => d.personality === p)
    return { personality: p, avgScore: games.reduce((s, d) => s + d.currentScore, 0) / games.length, avgLifespan: games.reduce((s, d) => s + d.lifespan, 0) / games.length }
  })
  const maxScoreAvg = Math.max(...scoreVars.map(v => v.avgScore))
  const minScoreAvg = Math.min(...scoreVars.map(v => v.avgScore))
  const scoreRange = maxScoreAvg - minScoreAvg
  const maxLifeAvg = Math.max(...scoreVars.map(v => v.avgLifespan))
  const minLifeAvg = Math.min(...scoreVars.map(v => v.avgLifespan))
  const lifeRange = maxLifeAvg - minLifeAvg

  console.log(`\n📊 性格差异化:`)
  console.log(`    评分差异: ${scoreRange.toFixed(1)} 分 (min=${minScoreAvg.toFixed(1)}, max=${maxScoreAvg.toFixed(1)})`)
  console.log(`    寿命差异: ${lifeRange.toFixed(1)} 年 (min=${minLifeAvg.toFixed(1)}, max=${maxLifeAvg.toFixed(1)})`)
  if (scoreRange > 10 || lifeRange > 5) {
    console.log(`    ✅ 性格对游戏结果有明显影响`)
  } else {
    console.log(`    ⚠️  性格对游戏结果影响较小，策略引擎区分度不足`)
  }

  // 4. Flag issues
  if (flagIssues === 0) {
    console.log('\n✅ 前置Flag: 未检测到问题')
  } else {
    console.log(`\n⚠️  前置Flag: ${flagIssues} 个潜在问题`)
  }

  // 5. Best & worst personality
  const best = scoreVars.reduce((a, b) => a.avgScore > b.avgScore ? a : b)
  const worst = scoreVars.reduce((a, b) => a.avgScore < b.avgScore ? a : b)
  console.log(`\n🏆 最优性格: ${PERSONALITY_LABELS[best.personality]} (avg_score=${best.avgScore.toFixed(1)})`)
  console.log(`💀 最差性格: ${PERSONALITY_LABELS[worst.personality]} (avg_score=${worst.avgScore.toFixed(1)})`)
}

main()
