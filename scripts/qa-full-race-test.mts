/**
 * QA 全种族完整流程测试
 * 
 * 对每个可玩种族各跑 10 局模拟（共 40 局），
 * 使用随机属性分配策略，记录详细数据并汇总分析。
 * 
 * 运行方式: npx tsx scripts/qa-full-race-test.mts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createWorldInstance } from '../src/engine/world/WorldInstance'
import { ConditionDSL } from '../src/engine/modules/ConditionDSL'
import type {
  WorldEventDef, WorldManifest, WorldAttributeDef, WorldTalentDef,
  WorldAchievementDef, WorldItemDef, WorldPresetDef, WorldScoringRule,
  WorldRaceDef as IWorldRaceDef, EventBranch, GameState,
} from '../src/engine/core/types'

// ==================== 加载世界数据 ====================
import { default as manifestData } from '../data/sword-and-magic/manifest.json'
import { default as attributesData } from '../data/sword-and-magic/attributes.json'
import { default as talentsData } from '../data/sword-and-magic/talents.json'
import { default as itemsData } from '../data/sword-and-magic/items.json'
import { default as achievementsData } from '../data/sword-and-magic/achievements.json'
import { default as evaluationsData } from '../data/sword-and-magic/evaluations.json'
import { default as presetsData } from '../data/sword-and-magic/presets.json'
import { default as rulesData } from '../data/sword-and-magic/rules.json'
import { default as eventsBirthData } from '../data/sword-and-magic/events/birth.json'
import { default as eventsChildhoodData } from '../data/sword-and-magic/events/childhood.json'
import { default as eventsYouthData } from '../data/sword-and-magic/events/youth.json'
import { default as eventsTeenagerData } from '../data/sword-and-magic/events/teenager.json'
import { default as eventsAdultData } from '../data/sword-and-magic/events/adult.json'
import { default as eventsMiddleAgeData } from '../data/sword-and-magic/events/middle-age.json'
import { default as eventsElderData } from '../data/sword-and-magic/events/elder.json'
import { default as racesData } from '../data/sword-and-magic/races.json'

// rules.json maxScore 特殊处理
const scoringRule = rulesData as any
for (const grade of scoringRule.grades) {
  if (grade.maxScore === null) grade.maxScore = Infinity
}

const allEvents: WorldEventDef[] = [
  ...eventsBirthData, ...eventsChildhoodData, ...eventsYouthData,
  ...eventsTeenagerData, ...eventsAdultData, ...eventsMiddleAgeData,
  ...eventsElderData,
] as WorldEventDef[]

const races = racesData as IWorldRaceDef[]

const world = createWorldInstance(
  manifestData as unknown as WorldManifest,
  attributesData as unknown as WorldAttributeDef[],
  talentsData as unknown as WorldTalentDef[],
  allEvents,
  achievementsData as unknown as WorldAchievementDef[],
  itemsData as unknown as WorldItemDef[],
  presetsData as unknown as WorldPresetDef[],
  scoringRule as unknown as WorldScoringRule,
  races,
) as any
;(world as any).evaluations = evaluationsData

// ==================== 配置 ====================
const RUNS_PER_RACE = 10
const playableRaces = races.filter(r => r.playable !== false)

// 种族寿命范围配置（用于分析）
const LIFESPAN_CONFIG: Record<string, { range: [number, number]; rangeWidth: number; median: number }> = {}
for (const race of races) {
  const [min, max] = race.lifespanRange
  LIFESPAN_CONFIG[race.id] = {
    range: race.lifespanRange,
    rangeWidth: max - min,
    median: (min + max) / 2,
  }
}

// ==================== 接口定义 ====================
interface DetailedSimResult {
  raceId: string
  raceName: string
  runIndex: number
  gender: string
  finalAge: number
  causeOfDeath: string    // 推断的死因
  eventCount: number      // 经历事件数
  uniqueEventCount: number // 去重事件数
  routeChanges: string[]  // 路线变更记录
  finalRoute: string | null
  score: number
  grade: string
  gradeTitle: string
  peakAttributes: Record<string, number>
  finalHp: number
  nearDeathCount: number  // 濒死标记次数
}

// ==================== 工具函数 ====================
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function stddev(arr: number[]): number {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}

/** 随机分配属性点（模拟真实玩家行为，不完全均匀也不全投一个） */
function randomAllocation(totalPoints: number, attrIds: string[]): Record<string, number> {
  const allocation: Record<string, number> = {}
  // 先给每个属性 1-3 点基础值
  for (const id of attrIds) {
    allocation[id] = Math.floor(Math.random() * 3) + 1
  }
  let used = Object.values(allocation).reduce((s, v) => s + v, 0)
  let remaining = totalPoints - used

  // 剩余点数随机分配
  while (remaining > 0) {
    // 随机选一个属性，加 1-3 点
    const id = attrIds[Math.floor(Math.random() * attrIds.length)]
    const add = Math.min(remaining, Math.floor(Math.random() * 3) + 1)
    allocation[id] = (allocation[id] ?? 0) + add
    remaining -= add
  }

  // 如果超出总点数，按比例削减
  const total = Object.values(allocation).reduce((s, v) => s + v, 0)
  if (total > totalPoints) {
    const ratio = totalPoints / total
    for (const id of attrIds) {
      allocation[id] = Math.max(0, Math.floor((allocation[id] ?? 0) * ratio))
    }
  }

  return allocation
}

/** 选一个条件满足的分支 */
function pickAvailableBranch(engine: SimulationEngine, branches: EventBranch[]): EventBranch | null {
  const dsl = new ConditionDSL()
  const currentState = engine.getState()
  const ctx = { state: currentState, world }

  // 优先选没有前置条件的分支
  for (const b of branches) {
    if (!b.requireCondition) return b
  }
  // 否则找第一个条件满足的
  for (const b of branches) {
    if (b.requireCondition) {
      const conditions = b.requireCondition.split(',').map(c => c.trim())
      if (conditions.every(c => dsl.evaluate(c, ctx))) return b
    }
  }
  return branches[0]
}

// ==================== 核心模拟 ====================
function runSimulation(race: IWorldRaceDef, runIndex: number): DetailedSimResult {
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female'
  const preset = world.presets.find((p: any) => !p.locked) ?? world.presets[0]

  const engine = new SimulationEngine(world as any)
  engine.initGame(`QA-Test-${race.id}-${runIndex}`, preset?.id, race.id, gender)

  // 抽取天赋
  const drafted = engine.draftTalents()
  const selectCount = world.manifest.talentSelectCount
  engine.selectTalents(drafted.slice(0, selectCount))

  // 随机分配属性
  const state = engine.getState()
  const attrIds = world.attributes
    .map((a: any) => a.id)
    .filter((id: string) => !world.attributes.find((a: any) => a.id === id)?.hidden)
  const effectivePoints = world.manifest.initialPoints - (state as any).talentPenalty
  const allocation = randomAllocation(Math.max(0, effectivePoints), attrIds)
  engine.allocateAttributes(allocation)

  // 模拟主循环
  const routeHistory: string[] = []
  let lastRoute: string | null = null
  let prevAge = 0

  const MAX_YEARS = 600
  for (let year = 0; year < MAX_YEARS; year++) {
    const currentAge = engine.getState().age

    const yearResult = engine.startYear()

    // 检查结束
    if (engine.getState().phase === 'finished') break

    // 跟踪路线变更
    const currentRoute = engine.getActiveRoute()
    const currentRouteId = currentRoute ? currentRoute.id : null
    if (currentRouteId !== lastRoute) {
      if (currentRouteId) {
        routeHistory.push(`${currentAge}: ${currentRouteId}`)
      }
      lastRoute = currentRouteId
    }

    // 处理事件
    if ((yearResult as any).phase === 'awaiting_choice' && (yearResult as any).branches?.length > 0) {
      const branch = pickAvailableBranch(engine, (yearResult as any).branches)
      if (branch) {
        engine.resolveBranch(branch.id)
        if (engine.getState().phase === 'finished') break
      }
    }

    if ((yearResult as any).phase === 'mundane_year' || (yearResult as any).phase === 'showing_event') {
      engine.skipYear()
      if (engine.getState().phase === 'finished') break
    }

    prevAge = currentAge
  }

  const finalState = engine.getState()

  // 推断死因
  let causeOfDeath: string
  if (finalState.hp <= 0 && finalState.flags.has('near_death')) {
    causeOfDeath = 'HP耗尽(事件后濒死)'
  } else if (finalState.hp <= 0) {
    causeOfDeath = 'HP耗尽'
  } else if (finalState.flags.has('near_death')) {
    causeOfDeath = '濒死死亡'
  } else {
    causeOfDeath = '自然死亡'
  }

  // 统计事件
  const eventLog = finalState.eventLog
  const eventCount = eventLog.length
  const uniqueEvents = new Set(eventLog.map((e: any) => e.eventId))
  const uniqueEventCount = uniqueEvents.size

  // 濒死次数
  const nearDeathCount = finalState.flags.has('near_death') ? 1 : 0

  return {
    raceId: race.id,
    raceName: race.name,
    runIndex,
    gender,
    finalAge: finalState.age,
    causeOfDeath,
    eventCount,
    uniqueEventCount,
    routeChanges: routeHistory,
    finalRoute: lastRoute,
    score: finalState.result?.score ?? -1,
    grade: finalState.result?.grade ?? '?',
    gradeTitle: finalState.result?.gradeTitle ?? '?',
    peakAttributes: finalState.attributePeaks ?? {},
    finalHp: finalState.hp,
    nearDeathCount,
  }
}

// ==================== 主逻辑 ====================
console.log('═'.repeat(80))
console.log('  异世界重生模拟器 — QA 全种族完整流程测试')
console.log(`  分支: fix/debt-event-condition | 时间: ${new Date().toISOString()}`)
console.log(`  种族: ${playableRaces.map(r => `${r.icon}${r.name}`).join(', ')} × ${RUNS_PER_RACE}局`)
console.log('═'.repeat(80))
console.log()

const allResults: DetailedSimResult[] = []

for (const race of playableRaces) {
  console.log(`▶ ${race.icon} ${race.name} (${race.id}) — ${RUNS_PER_RACE} 局模拟中...`)
  const raceResults: DetailedSimResult[] = []

  for (let i = 0; i < RUNS_PER_RACE; i++) {
    try {
      const result = runSimulation(race, i + 1)
      raceResults.push(result)
      allResults.push(result)
      process.stdout.write(`  #${i + 1} → ${result.finalAge}岁 [${result.causeOfDeath}] ${result.gradeTitle} 评${result.score}\n`)
    } catch (err: any) {
      console.error(`  #${i + 1} → ❌ 错误: ${err.message}`)
    }
  }
  console.log()
}

// ==================== 每局详细记录 ====================
console.log('═'.repeat(80))
console.log('  📋 每局详细记录')
console.log('═'.repeat(80))

for (const race of playableRaces) {
  const raceResults = allResults.filter(r => r.raceId === race.id)
  if (raceResults.length === 0) continue

  console.log(`\n${race.icon} ${race.name} (${raceResults.length} 局)`)
  console.log('─'.repeat(70))

  for (const r of raceResults) {
    // 找最高属性
    const peakEntries = Object.entries(r.peakAttributes)
      .filter(([k]) => !['hidden'].includes(k))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    const peakStr = peakEntries.map(([k, v]) => `${k}=${v}`).join(', ')
    const routeStr = r.routeChanges.length > 0
      ? r.routeChanges.join(' → ')
      : '无路线'

    console.log(`  #${r.runIndex} [${r.gender}] ${r.finalAge}岁 | ${r.causeOfDeath} | ${r.eventCount}事件(${r.uniqueEventCount}去重) | ${r.gradeTitle}(${r.score}分) | 峰值: ${peakStr}`)
    console.log(`    路线: ${routeStr} | 终局路线: ${r.finalRoute ?? '无'} | HP: ${r.finalHp}`)
  }
}

// ==================== 按种族汇总 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📊 按种族汇总统计')
console.log('═'.repeat(80))

interface RaceSummary {
  raceId: string
  raceName: string
  icon: string
  ages: number[]
  scores: number[]
  eventCounts: number[]
  causeOfDeath: Record<string, number>
  grades: Record<string, number>
  routeDistribution: Record<string, number>
  avgLifespan: number
  medianLifespan: number
  minLifespan: number
  maxLifespan: number
  stddevLifespan: number
  lifespanRange: [number, number]
  rangeWidth: number
  medianToRangeRatio: number
  medianToConfigMedianRatio: number
}

const summaries: RaceSummary[] = []

for (const race of playableRaces) {
  const raceResults = allResults.filter(r => r.raceId === race.id)
  if (raceResults.length === 0) continue

  const ages = raceResults.map(r => r.finalAge)
  const scores = raceResults.map(r => r.score)
  const eventCounts = raceResults.map(r => r.eventCount)

  // 死因统计
  const deathCauses: Record<string, number> = {}
  for (const r of raceResults) {
    deathCauses[r.causeOfDeath] = (deathCauses[r.causeOfDeath] ?? 0) + 1
  }

  // 评级统计
  const gradeDist: Record<string, number> = {}
  for (const r of raceResults) {
    gradeDist[r.gradeTitle] = (gradeDist[r.gradeTitle] ?? 0) + 1
  }

  // 路线统计
  const routeDist: Record<string, number> = {}
  for (const r of raceResults) {
    const route = r.finalRoute ?? '无路线'
    routeDist[route] = (routeDist[route] ?? 0) + 1
  }

  const config = LIFESPAN_CONFIG[race.id]
  const avg = mean(ages)
  const med = median(ages)

  const summary: RaceSummary = {
    raceId: race.id,
    raceName: race.name,
    icon: race.icon,
    ages,
    scores,
    eventCounts,
    causeOfDeath: deathCauses,
    grades: gradeDist,
    routeDistribution: routeDist,
    avgLifespan: avg,
    medianLifespan: med,
    minLifespan: Math.min(...ages),
    maxLifespan: Math.max(...ages),
    stddevLifespan: stddev(ages),
    lifespanRange: config.range,
    rangeWidth: config.rangeWidth,
    medianToRangeRatio: config.rangeWidth > 0 ? (med - config.range[0]) / config.rangeWidth : 0,
    medianToConfigMedianRatio: config.median > 0 ? med / config.median : 0,
  }
  summaries.push(summary)

  console.log(`\n${race.icon} ${race.name}`)
  console.log('─'.repeat(70))
  console.log(`  寿命配置: [${config.range[0]}, ${config.range[1]}] (宽度=${config.rangeWidth}, 中值=${config.median})`)
  console.log(`  寿命均值:   ${avg.toFixed(1)} 岁`)
  console.log(`  寿命中位数: ${med} 岁`)
  console.log(`  寿命范围:   ${Math.min(...ages)} ~ ${Math.max(...ages)} 岁 (σ=${stddev(ages).toFixed(1)})`)
  console.log(`  中位数在 range 位置: ${(summary.medianToRangeRatio * 100).toFixed(1)}%`)
  console.log(`  中位数/配置中值:     ${(summary.medianToConfigMedianRatio * 100).toFixed(1)}%`)
  console.log(`  评分均值:   ${mean(scores).toFixed(1)}`)
  console.log(`  评分范围:   ${Math.min(...scores)} ~ ${Math.max(...scores)}`)
  console.log(`  事件数均值: ${mean(eventCounts).toFixed(1)} (范围: ${Math.min(...eventCounts)} ~ ${Math.max(...eventCounts)})`)
  console.log(`  死因分布:   ${Object.entries(deathCauses).map(([k, v]) => `${k}(${v})`).join(', ')}`)
  console.log(`  评级分布:   ${Object.entries(gradeDist).map(([k, v]) => `${k}(${v})`).join(', ')}`)
  console.log(`  路线分布:   ${Object.entries(routeDist).map(([k, v]) => `${k}(${v})`).join(', ')}`)
}

// ==================== 汇总对比表 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📋 种族对比汇总表')
console.log('═'.repeat(80))

console.log(`
| 种族 | 寿命配置 | 均值 | 中位数 | 范围 | σ | 中位数/range位置 | 中位数/配置中值 | 事件均值 | 评分均值 |
|------|----------|------|--------|------|---|-----------------|---------------|---------|---------|`)

for (const s of summaries) {
  console.log(
    `| ${s.icon} ${s.raceName} | [${s.lifespanRange[0]},${s.lifespanRange[1]}] | ${s.avgLifespan.toFixed(1)} | ${s.medianLifespan} | ${s.minLifespan}~${s.maxLifespan} | ${s.stddevLifespan.toFixed(1)} | ${(s.medianToRangeRatio * 100).toFixed(1)}% | ${(s.medianToConfigMedianRatio * 100).toFixed(1)}% | ${mean(s.eventCounts).toFixed(1)} | ${mean(s.scores).toFixed(1)} |`
  )
}

// ==================== 寿命中位数在 range 内的位置分析 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📊 寿命中位数在 lifespanRange 内的位置分析')
console.log('═'.repeat(80))

for (const s of summaries) {
  const position = s.medianToRangeRatio
  const positionPct = (position * 100).toFixed(1)
  let verdict: string

  // D&D 建议长寿种族中位数在 55-65% 位置
  if (s.raceId === 'elf') {
    if (position >= 0.50 && position <= 0.70) {
      verdict = '✅ 符合 D&D 长寿种族建议范围 (55-65%)'
    } else if (position < 0.50) {
      verdict = '⚠️ 偏前段，死亡过早'
    } else {
      verdict = '⚠️ 偏后段，死亡过晚'
    }
  } else if (s.raceId === 'goblin') {
    if (position >= 0.40 && position <= 0.70) {
      verdict = '✅ 体验可接受'
    } else if (position < 0.40) {
      verdict = '⚠️ 寿命太短，可能体验不足'
    } else {
      verdict = '⚠️ 偏长寿'
    }
  } else {
    // 人类和矮人：40-70% 可接受
    if (position >= 0.40 && position <= 0.70) {
      verdict = '✅ 合理范围'
    } else if (position < 0.40) {
      verdict = '⚠️ 偏早死'
    } else {
      verdict = '⚠️ 偏长寿'
    }
  }

  console.log(`\n${s.icon} ${s.raceName}:`)
  console.log(`  range [${s.lifespanRange[0]}, ${s.lifespanRange[1]}], 中位数 ${s.medianLifespan}`)
  console.log(`  位置: ${positionPct}% (${s.lifespanRange[0] + Math.round(s.medianToRangeRatio * s.rangeWidth)} / ${s.rangeWidth})`)
  console.log(`  ${verdict}`)
}

// ==================== 评级分布表 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📊 评级分布表')
console.log('═'.repeat(80))

// 收集所有出现过的评级
const allGradeTitles = [...new Set(allResults.map(r => r.gradeTitle))]
console.log(`\n| 种族 | ${allGradeTitles.map(g => g).join(' | ')} |`)
console.log(`|------|${allGradeTitles.map(() => '---').join('|')}|`)

for (const s of summaries) {
  const raceResults = allResults.filter(r => r.raceId === s.raceId)
  const counts = allGradeTitles.map(g => {
    const c = raceResults.filter(r => r.gradeTitle === g).length
    return c > 0 ? `${c}` : '-'
  })
  console.log(`| ${s.icon} ${s.raceName} | ${counts.join(' | ')} |`)
}

// ==================== 死因分布表 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📊 死因分布表')
console.log('═'.repeat(80))

const allCauses = [...new Set(allResults.map(r => r.causeOfDeath))]
console.log(`\n| 种族 | ${allCauses.map(c => c).join(' | ')} |`)
console.log(`|------|${allCauses.map(() => '---').join('|')}|`)

for (const s of summaries) {
  const raceResults = allResults.filter(r => r.raceId === s.raceId)
  const counts = allCauses.map(c => {
    const cnt = raceResults.filter(r => r.causeOfDeath === c).length
    return cnt > 0 ? `${cnt}` : '-'
  })
  console.log(`| ${s.icon} ${s.raceName} | ${counts.join(' | ')} |`)
}

// ==================== 路线分布表 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📊 最终路线分布表')
console.log('═'.repeat(80))

const allRoutes = [...new Set(allResults.map(r => r.finalRoute ?? '无路线'))]
console.log(`\n| 种族 | ${allRoutes.map(r => r).join(' | ')} |`)
console.log(`|------|${allRoutes.map(() => '---').join('|')}|`)

for (const s of summaries) {
  const raceResults = allResults.filter(r => r.raceId === s.raceId)
  const counts = allRoutes.map(r => {
    const cnt = raceResults.filter(res => (res.finalRoute ?? '无路线') === r).length
    return cnt > 0 ? `${cnt}` : '-'
  })
  console.log(`| ${s.icon} ${s.raceName} | ${counts.join(' | ')} |`)
}

// ==================== 综合分析结论 ====================
console.log('\n' + '═'.repeat(80))
console.log('  🔬 QA 综合分析结论')
console.log('═'.repeat(80))

const issues: string[] = []

// 1. 精灵寿命检查
const elfSummary = summaries.find(s => s.raceId === 'elf')
if (elfSummary) {
  const ratio = elfSummary.medianToRangeRatio
  if (ratio < 0.55 || ratio > 0.65) {
    issues.push(`精灵寿命中位数在 range 的 ${(ratio * 100).toFixed(1)}%，偏离 D&D 建议 55-65% 范围`)
  } else {
    console.log('\n✅ 精灵寿命中位数在 D&D 建议的 55-65% 范围内')
  }
  // 精灵事件密度
  const elfEventDensity = mean(elfSummary.eventCounts) / elfSummary.avgLifespan
  if (elfEventDensity < 0.02) {
    issues.push(`精灵事件密度过低: ${elfEventDensity.toFixed(4)} 事件/年 (${mean(elfSummary.eventCounts).toFixed(1)} 事件 / ${elfSummary.avgLifespan.toFixed(0)} 年)`)
  } else {
    console.log(`✅ 精灵事件密度: ${elfEventDensity.toFixed(4)} 事件/年`)
  }
}

// 2. 哥布林寿命检查
const goblinSummary = summaries.find(s => s.raceId === 'goblin')
if (goblinSummary) {
  if (mean(goblinSummary.eventCounts) < 5) {
    issues.push(`哥布林平均事件数 ${mean(goblinSummary.eventCounts).toFixed(1)}，可能体验不足`)
  } else {
    console.log(`✅ 哥布林平均事件数 ${mean(goblinSummary.eventCounts).toFixed(1)}，体验基本充足`)
  }
  // 早死率
  const earlyDeaths = goblinSummary.ages.filter(a => a < goblinSummary.lifespanRange[0]).length
  if (earlyDeaths > goblinSummary.ages.length * 0.3) {
    issues.push(`哥布林早死率 ${(earlyDeaths / goblinSummary.ages.length * 100).toFixed(0)}% (低于寿命下限)，过高`)
  }
}

// 3. 事件密度检查
for (const s of summaries) {
  const density = mean(s.eventCounts) / s.avgLifespan
  if (density > 0.15) {
    issues.push(`${s.icon} ${s.raceName} 事件密度过高: ${density.toFixed(4)} 事件/年`)
  } else if (density < 0.03 && s.raceId !== 'elf') {
    issues.push(`${s.icon} ${s.raceName} 事件密度过低: ${density.toFixed(4)} 事件/年`)
  }
}

// 4. 评分平衡检查
const allScores = allResults.map(r => r.score)
const scoreStd = stddev(allScores)
if (scoreStd < 50) {
  issues.push(`评分方差过小 (σ=${scoreStd.toFixed(1)})，区分度不足`)
}

// 5. 各种族评分差异
for (const s of summaries) {
  const sAvg = mean(s.scores)
  const allAvg = mean(allScores)
  const deviation = Math.abs(sAvg - allAvg) / allAvg
  if (deviation > 0.5) {
    issues.push(`${s.icon} ${s.raceName} 评分均值 ${sAvg.toFixed(1)} 偏离全局均值 ${allAvg.toFixed(1)} 达 ${(deviation * 100).toFixed(0)}%`)
  }
}

// 6. 路线覆盖检查
for (const s of summaries) {
  const noRouteCount = allResults.filter(r => r.raceId === s.raceId && !r.finalRoute).length
  if (noRouteCount > s.ages.length * 0.5) {
    issues.push(`${s.icon} ${s.raceName} 有 ${noRouteCount}/${s.ages.length} 局无路线，路线系统可能未被充分触发`)
  }
}

// 7. 寿命异常检查
for (const s of summaries) {
  const belowMin = s.ages.filter(a => a < s.lifespanRange[0]).length
  const aboveMax = s.ages.filter(a => a > s.lifespanRange[1]).length
  if (belowMin > s.ages.length * 0.3) {
    issues.push(`${s.icon} ${s.raceName} 有 ${belowMin}/${s.ages.length} 局低于寿命下限 (${s.lifespanRange[0]})`)
  }
  if (aboveMax > 0) {
    issues.push(`${s.icon} ${s.raceName} 有 ${aboveMax} 局超过寿命上限 (${s.lifespanRange[1]})，HP 系统可能未能有效控制`)
  }
}

console.log()
if (issues.length === 0) {
  console.log('🎉 未发现严重问题，所有种族表现正常！')
} else {
  console.log(`⚠️ 发现 ${issues.length} 个问题：`)
  for (let i = 0; i < issues.length; i++) {
    const severity = issues[i].includes('过高') || issues[i].includes('严重') ? '🔴' :
                     issues[i].includes('过低') || issues[i].includes('偏离') || issues[i].includes('不足') ? '🟡' : '🟢'
    console.log(`  ${severity} [${i + 1}] ${issues[i]}`)
  }
}

// ==================== 原始数据输出 ====================
console.log('\n' + '═'.repeat(80))
console.log('  📄 原始 CSV 数据')
console.log('═'.repeat(80))
console.log('race,raceId,runIndex,gender,age,causeOfDeath,eventCount,uniqueEvents,score,grade,gradeTitle,finalRoute')
for (const r of allResults) {
  const route = r.finalRoute ?? 'none'
  // 转义 CSV
  const grade = r.gradeTitle.includes(',') ? `"${r.gradeTitle}"` : r.gradeTitle
  const cause = r.causeOfDeath.includes(',') ? `"${r.causeOfDeath}"` : r.causeOfDeath
  console.log(`${r.raceName},${r.raceId},${r.runIndex},${r.gender},${r.finalAge},${cause},${r.eventCount},${r.uniqueEventCount},${r.score},${r.grade},${grade},${route}`)
}

console.log('\n✅ 测试完成！')
