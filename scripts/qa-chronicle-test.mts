/**
 * QA 编年史验证 — 全种族事件年龄合理性检查
 * 
 * 对人类、精灵、哥布林、矮人各跑 3 局完整模拟（共 12 局），
 * 输出完整编年史并检查事件触发年龄合理性。
 * 
 * 运行方式: npx tsx scripts/qa-chronicle-test.mts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createWorldInstance } from '../src/engine/world/WorldInstance'
import { ConditionDSL } from '../src/engine/modules/ConditionDSL'
import type {
  WorldManifest, WorldAttributeDef, WorldTalentDef,
  WorldAchievementDef, WorldItemDef, WorldPresetDef, WorldScoringRule,
  WorldRaceDef as IWorldRaceDef, EventBranch,
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

const allEvents = [
  ...eventsBirthData, ...eventsChildhoodData, ...eventsYouthData,
  ...eventsTeenagerData, ...eventsAdultData, ...eventsMiddleAgeData,
  ...eventsElderData,
]

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
const RUNS_PER_RACE = 3
const TARGET_RACES = ['human', 'elf', 'goblin', 'dwarf']
const playableRaces = races.filter(r => TARGET_RACES.includes(r.id))

// ==================== 工具函数 ====================

/** 随机分配属性点 */
function randomAllocation(totalPoints: number, attrIds: string[]): Record<string, number> {
  const allocation: Record<string, number> = {}
  for (const id of attrIds) {
    allocation[id] = Math.floor(Math.random() * 3) + 1
  }
  let used = Object.values(allocation).reduce((s, v) => s + v, 0)
  let remaining = totalPoints - used
  while (remaining > 0) {
    const id = attrIds[Math.floor(Math.random() * attrIds.length)]
    const add = Math.min(remaining, Math.floor(Math.random() * 3) + 1)
    allocation[id] = (allocation[id] ?? 0) + add
    remaining -= add
  }
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
  for (const b of branches) {
    if (!b.requireCondition) return b
  }
  for (const b of branches) {
    if (b.requireCondition) {
      const conditions = b.requireCondition.split(',').map(c => c.trim())
      if (conditions.every(c => dsl.evaluate(c, ctx))) return b
    }
  }
  return branches[0]
}

/** 关键词分类 */
const ELDER_KEYWORDS = ['衰老', '黄昏', '迟暮', '永恒之眠', '寿命尽头', '最后的', '临终', '暮年', '老去', '年迈', '归乡', '晚年', '终章', '遗产', '墓碑', '安息']
const CHILDHOOD_KEYWORDS = ['童年', '幼年', '孩提', '少年', '学艺', '启蒙', '玩耍', '顽皮', '父母', '小伙伴', '玩具', '少年宫']
const COMBAT_KEYWORDS = ['最后一战', '决斗', '对战', '挑战']

// ==================== 模拟函数 ====================

interface RunResult {
  raceId: string
  raceName: string
  raceIcon: string
  runIndex: number
  effectiveMaxAge: number
  finalAge: number
  gender: string
  score: number
  grade: string
  gradeTitle: string
  chronicle: Array<{ age: number; eventId: string; title: string; branchTitle?: string }>
  flags: Set<string>
  hasChild: boolean
  isMarried: boolean
  anomalies: string[]
}

function runSimulation(race: IWorldRaceDef, runIndex: number): RunResult {
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female'
  const preset = world.presets.find((p: any) => !p.locked) ?? world.presets[0]

  const engine = new SimulationEngine(world as any)
  engine.initGame(`QA-Chronicle-${race.id}-${runIndex}`, preset?.id, race.id, gender)

  const drafted = engine.draftTalents()
  const selectCount = world.manifest.talentSelectCount
  engine.selectTalents(drafted.slice(0, selectCount))

  const state = engine.getState()
  const attrIds = world.attributes
    .map((a: any) => a.id)
    .filter((id: string) => !world.attributes.find((a: any) => a.id === id)?.hidden)
  const effectivePoints = world.manifest.initialPoints - (state as any).talentPenalty
  const allocation = randomAllocation(Math.max(0, effectivePoints), attrIds)
  engine.allocateAttributes(allocation)

  const anomalies: string[] = []
  const MAX_YEARS = 800

  for (let year = 0; year < MAX_YEARS; year++) {
    const currentAge = engine.getState().age

    const yearResult = engine.startYear()

    if (engine.getState().phase === 'finished') break

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
  }

  const finalState = engine.getState()
  const effectiveMaxAge = (finalState as any).effectiveMaxAge ?? 0
  const chronicle = finalState.eventLog.map((e: any) => ({
    age: e.age,
    eventId: e.eventId,
    title: e.title,
    branchTitle: e.branchTitle,
  }))

  // 检查项
  const hasChild = finalState.flags.has('parent') || finalState.flags.has('has_child') || finalState.flags.has('child')
  const isMarried = finalState.flags.has('married')

  // 检查 family_dinner 只在有孩子后触发
  const familyDinnerEvents = chronicle.filter(e => e.eventId.includes('family_dinner'))
  for (const fd of familyDinnerEvents) {
    // 查找此事件之前的 parent flag 事件
    const parentEvents = chronicle.filter(e => e.age <= fd.age && (
      e.eventId.includes('birth_child') || e.eventId.includes('child_born') ||
      e.eventId.includes('have_child') || e.title.includes('孩子') || e.title.includes('诞生') ||
      e.eventId.includes('parent')
    ))
    if (parentEvents.length === 0 && !hasChild) {
      anomalies.push(`[P1] family_dinner 在无孩子时触发 (age=${fd.age})`)
    }
  }

  // 检查老年事件不应在壮年触发
  const lifeRatio = effectiveMaxAge > 0 ? finalState.age / effectiveMaxAge : 1
  for (const event of chronicle) {
    const eventRatio = effectiveMaxAge > 0 ? event.age / effectiveMaxAge : 0

    // 老年类事件在 lifeRatio < 0.6 时触发
    const isElderEvent = ELDER_KEYWORDS.some(k => event.title.includes(k))
    if (isElderEvent && eventRatio < 0.5) {
      anomalies.push(`[P2] 老年事件"${event.title}"在壮年触发 (age=${event.age}, ratio=${(eventRatio * 100).toFixed(0)}%, <50%)`)
    }

    // 童年事件在成人后触发（对人类 age>18, 精灵 age>80）
    const isChildEvent = CHILDHOOD_KEYWORDS.some(k => event.title.includes(k))
    if (isChildEvent && event.age > race.lifespanRange[0] * 0.4) {
      // 只在明显不合理时报告
      const threshold = race.id === 'elf' ? 100 : race.id === 'goblin' ? 10 : race.id === 'dwarf' ? 80 : 18
      if (event.age > threshold) {
        anomalies.push(`[P3] 童年事件"${event.title}"在${event.age}岁触发 (种族阈值=${threshold})`)
      }
    }
  }

  // 寿命检查
  const [minLife, maxLife] = race.lifespanRange
  if (finalState.age < minLife) {
    anomalies.push(`[P2] 寿命${finalState.age}低于 lifespanRange 下限${minLife}`)
  }
  if (finalState.age > race.maxLifespan && race.maxLifespan) {
    anomalies.push(`[P1] 寿命${finalState.age}超过 maxLifespan${race.maxLifespan}`)
  }

  return {
    raceId: race.id,
    raceName: race.name,
    raceIcon: race.icon,
    runIndex,
    effectiveMaxAge,
    finalAge: finalState.age,
    gender,
    score: finalState.result?.score ?? -1,
    grade: finalState.result?.grade ?? '?',
    gradeTitle: finalState.result?.gradeTitle ?? '?',
    chronicle,
    flags: finalState.flags,
    hasChild,
    isMarried,
    anomalies,
  }
}

// ==================== 主流程 ====================

console.log('═'.repeat(90))
console.log('  异世界重生模拟器 — QA 编年史验证（全种族 × 3局）')
console.log(`  分支: fix/debt-event-condition | Commit: 7d4680e`)
console.log(`  时间: ${new Date().toISOString()}`)
console.log('═'.repeat(90))
console.log()

const allResults: RunResult[] = []

for (const race of playableRaces) {
  console.log(`\n${'█'.repeat(90)}`)
  console.log(`  ${race.icon} ${race.name} (${race.id})`)
  console.log(`  lifespanRange: [${race.lifespanRange[0]}, ${race.lifespanRange[1]}] | maxLifespan: ${race.maxLifespan ?? 'N/A'}`)
  console.log(`${'█'.repeat(90)}`)

  for (let i = 0; i < RUNS_PER_RACE; i++) {
    const result = runSimulation(race, i + 1)
    allResults.push(result)

    // 输出编年史
    console.log(`\n  ── 第 ${i + 1} 局 [${result.gender}] ──`)
    console.log(`  effectiveMaxAge: ${result.effectiveMaxAge} | 实际享年: ${result.finalAge} | 评级: ${result.gradeTitle}(${result.score}分)`)

    if (result.chronicle.length === 0) {
      console.log('  （无事件）')
    } else {
      console.log(`  编年史 (${result.chronicle.length} 个事件):`)
      for (const event of result.chronicle) {
        const ratio = result.effectiveMaxAge > 0 ? (event.age / result.effectiveMaxAge * 100).toFixed(0) : '?'
        const branch = event.branchTitle ? ` → ${event.branchTitle}` : ''
        console.log(`    ${String(event.age).padStart(4)}岁 [${ratio}%] ${event.title}${branch}`)
      }
    }

    // 输出异常
    if (result.anomalies.length > 0) {
      console.log(`  ⚠️ 异常:`)
      for (const a of result.anomalies) {
        console.log(`    ${a}`)
      }
    } else {
      console.log('  ✅ 无异常')
    }
  }
}

// ==================== 种族汇总 ====================

console.log(`\n\n${'═'.repeat(90)}`)
console.log('  📊 种族汇总')
console.log('═'.repeat(90))

for (const raceId of TARGET_RACES) {
  const race = races.find(r => r.id === raceId)!
  const results = allResults.filter(r => r.raceId === raceId)

  console.log(`\n${race.icon} ${race.name} (${results.length} 局)`)
  console.log(`  lifespanRange: [${race.lifespanRange[0]}, ${race.lifespanRange[1]}] | maxLifespan: ${race.maxLifespan ?? 'N/A'}`)

  const ages = results.map(r => r.finalAge)
  const emaValues = results.map(r => r.effectiveMaxAge)
  const events = results.flatMap(r => r.chronicle)
  const anomalies = results.flatMap(r => r.anomalies)

  console.log(`  effectiveMaxAge: ${emaValues.join(', ')} (min=${Math.min(...emaValues)}, max=${Math.max(...emaValues)})`)
  console.log(`  实际享年: ${ages.join(', ')} (min=${Math.min(...ages)}, max=${Math.max(...ages)})`)

  // lifespanRange 命中率
  const [minL, maxL] = race.lifespanRange
  const inRange = ages.filter(a => a >= minL && a <= maxL).length
  console.log(`  lifespanRange 命中: ${inRange}/${results.length} 局`)

  // 事件统计
  const uniqueEventIds = new Set(events.map(e => e.eventId))
  console.log(`  总事件数: ${events.length} (去重: ${uniqueEventIds.size})`)

  // family_dinner 检查
  const fdEvents = events.filter(e => e.eventId.includes('family_dinner'))
  if (fdEvents.length > 0) {
    console.log(`  family_dinner 触发: ${fdEvents.length} 次`)
    for (const fd of fdEvents) {
      console.log(`    age=${fd.age} ${fd.title}`)
    }
  } else {
    console.log(`  family_dinner: 未触发（可能无婚姻或无孩子）`)
  }

  // 异常汇总
  const raceAnomalies = results.flatMap(r => r.anomalies)
  if (raceAnomalies.length === 0) {
    console.log(`  ✅ 种族整体无异常`)
  } else {
    console.log(`  ⚠️ 种族异常 (${raceAnomalies.length}):`)
    for (const a of raceAnomalies) {
      console.log(`    ${a}`)
    }
  }
}

// ==================== 全局结论 ====================

console.log(`\n\n${'═'.repeat(90)}`)
console.log('  🔬 QA 最终结论')
console.log('═'.repeat(90))

const allAnomalies = allResults.flatMap(r => r.anomalies)
if (allAnomalies.length === 0) {
  console.log('\n  🎉 12 局模拟全部通过，未发现异常！')
} else {
  const p1 = allAnomalies.filter(a => a.startsWith('[P1]')).length
  const p2 = allAnomalies.filter(a => a.startsWith('[P2]')).length
  const p3 = allAnomalies.filter(a => a.startsWith('[P3]')).length
  console.log(`\n  ⚠️ 发现 ${allAnomalies.length} 个异常 (P1=${p1}, P2=${p2}, P3=${p3})`)
  console.log()
  for (const a of allAnomalies) {
    console.log(`    ${a}`)
  }
}

// ==================== CSV 原始数据 ====================
console.log(`\n\n${'═'.repeat(90)}`)
console.log('  📄 原始 CSV')
console.log('═'.repeat(90))
console.log('race,raceId,run,gender,effectiveMaxAge,finalAge,score,gradeTitle,anomalyCount')
for (const r of allResults) {
  console.log(`${r.raceName},${r.raceId},${r.runIndex},${r.gender},${r.effectiveMaxAge},${r.finalAge},${r.score},${r.gradeTitle},${r.anomalies.length}`)
}

// 事件编年史 CSV
console.log('\n# Chronicle CSV: race,run,age,agePct,eventId,title,branchTitle')
for (const r of allResults) {
  for (const e of r.chronicle) {
    const pct = r.effectiveMaxAge > 0 ? (e.age / r.effectiveMaxAge * 100).toFixed(0) : '?'
    const title = e.title.includes(',') ? `"${e.title}"` : e.title
    console.log(`${r.raceName},${r.runIndex},${e.age},${pct}%,${e.eventId},${title},${e.branchTitle ?? ''}`)
  }
}

console.log('\n✅ 编年史验证完成！')
