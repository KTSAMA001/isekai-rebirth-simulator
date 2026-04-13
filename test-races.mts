/**
 * 全种族验证脚本 — 4种族 × 10局 = 40局
 * 运行: npx tsx test-races.mts
 */
import { createSwordAndMagicWorld } from './src/worlds/sword-and-magic/index'
import { SimulationEngine } from './src/engine/core/SimulationEngine'
import { ConditionDSL } from './src/engine/modules/ConditionDSL'
import type { WorldEventDef } from './src/engine/core/types'

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const GAMES_PER_RACE = 10
const MAX_YEARS = 600

// 关键词检测
const AGING_KEYWORDS = ['衰老', '暮年', '黄昏', '苍老', '油尽灯枯', '岁月不饶人', '力不从心', '风烛残年', '迟暮', '回忆一生', '最后一战', '人生暮色', '临终', '弥留']
const LAX_AGING_KEYWORDS = ['白发', '老', '逝去', '永别']
const ELDER_LIFE_REVIEW = ['回忆一生', '最后一战', '人生暮色', '生命的黄昏', '一生总结', '回顾一生']
const MARRIAGE_KEYWORDS = ['结婚', '婚姻', '嫁', '娶', '成亲', '婚礼', '婚']
const CHILD_EVENT_KEYWORDS = ['幼年', '童年', '小儿', '婴儿', '幼儿园', '小学', '玩伴']

interface EventIssue {
  age: number
  eventId: string
  title: string
  description: string
  reason: string
  severity: 'P1' | 'P2' | 'P3'
}

interface GameChronicle {
  race: string
  gameNum: number
  lifespan: number
  eventCount: number
  issues: EventIssue[]
  chronicle: Array<{ age: number; eventId: string; title: string; description: string; effects: string[] }>
}

function checkEvent(
  age: number,
  event: WorldEventDef,
  race: string,
  flags: Set<string>,
  raceDef: any
): EventIssue[] {
  const issues: EventIssue[] = []
  const desc = event.description || ''
  const title = event.title || ''
  const fullText = title + desc

  const lifespanRange = raceDef?.lifespanRange || [65, 85]
  const median = (lifespanRange[0] + lifespanRange[1]) / 2
  const lifeRatio = age / median

  // P1: 严重衰老/临终描述不应在 lifeRatio < 0.7 出现
  for (const kw of AGING_KEYWORDS) {
    if (fullText.includes(kw) && lifeRatio < 0.7) {
      issues.push({
        age, eventId: event.id, title, description: desc,
        reason: `"${kw}" 在 age=${age}, lifeRatio=${lifeRatio.toFixed(2)} (<0.7), ${race}(median=${median}) 年龄太轻`,
        severity: 'P1'
      })
      break
    }
  }

  // P1: 临终/人生回顾事件不应在 lifeRatio < 0.85 触发
  for (const kw of ELDER_LIFE_REVIEW) {
    if (fullText.includes(kw) && lifeRatio < 0.85) {
      issues.push({
        age, eventId: event.id, title, description: desc,
        reason: `"${kw}" 在 age=${age}, lifeRatio=${lifeRatio.toFixed(2)} (<0.85), 过早触发人生回顾`,
        severity: 'P1'
      })
      break
    }
  }

  // P1: family_dinner 应在已婚且有孩子后触发
  if (event.id.includes('family_dinner')) {
    const hasMarried = flags.has('married') || flags.has('has_spouse')
    const hasChild = flags.has('has_child') || flags.has('child_born')
    if (!hasMarried || !hasChild) {
      issues.push({
        age, eventId: event.id, title, description: desc,
        reason: `family_dinner age=${age}, married=${hasMarried}, hasChild=${hasChild}`,
        severity: 'P1'
      })
    }
  }

  // P2: 轻度衰老关键词（白发/老）在 lifeRatio < 0.5 时出现
  for (const kw of LAX_AGING_KEYWORDS) {
    if (fullText.includes(kw) && lifeRatio < 0.5) {
      issues.push({
        age, eventId: event.id, title, description: desc,
        reason: `"${kw}" 在 age=${age}, lifeRatio=${lifeRatio.toFixed(2)} (<0.5), 偏早`,
        severity: 'P2'
      })
      break
    }
  }

  // P2: 结婚年龄合理性
  for (const kw of MARRIAGE_KEYWORDS) {
    if (fullText.includes(kw)) {
      const minMarryAge = race === 'elf' ? 30 : race === 'dwarf' ? 30 : race === 'goblin' ? 8 : 16
      if (age < minMarryAge) {
        issues.push({
          age, eventId: event.id, title, description: desc,
          reason: `"${kw}" age=${age}, ${race} 最小合理年龄 ~${minMarryAge}`,
          severity: 'P2'
        })
        break
      }
    }
  }

  // P3: 童年事件描述在超出童年期出现
  for (const kw of CHILD_EVENT_KEYWORDS) {
    if (fullText.includes(kw) && age > lifespanRange[0] * 0.25) {
      issues.push({
        age, eventId: event.id, title, description: desc,
        reason: `童年描述"${kw}" age=${age}, 超出童年期`,
        severity: 'P3'
      })
      break
    }
  }

  return issues
}

function resolveAnyBranch(engine: SimulationEngine, branches: any[], state: any, world: any): boolean {
  const dsl = new ConditionDSL()
  // 按优先级尝试：无条件的 → 条件满足的 → 任意
  const noCondition = branches.find((b: any) => !b.requireCondition)
  if (noCondition) {
    try { engine.resolveBranch(noCondition.id); return true } catch {}
  }
  for (const b of branches) {
    try { engine.resolveBranch(b.id); return true } catch {}
  }
  return false
}

async function runGame(world: any, race: string, gameNum: number, seed: number): Promise<GameChronicle> {
  const engine = new SimulationEngine(world, seed)
  const raceDef = world.races?.find((r: any) => r.id === race)
  engine.initGame(`Test_${race}_${gameNum}`, undefined, race, 'male')

  const drafted = engine.draftTalents()
  if (drafted.length > 0) engine.selectTalents([drafted[0]])

  const s = engine.getState() as any
  const attrKeys = Object.keys(s.attributes)
  const totalPoints = world.manifest.initialPoints - (s.talentPenalty || 0)
  const perAttr = Math.floor(totalPoints / attrKeys.length)
  const allocation: Record<string, number> = {}
  for (const k of attrKeys) allocation[k] = perAttr
  engine.allocateAttributes(allocation)

  const chronicle: GameChronicle['chronicle'] = []
  const allIssues: EventIssue[] = []
  let years = 0

  while (years < MAX_YEARS) {
    const cs = engine.getState() as any
    if (cs.phase === 'finished') break

    try {
      const result = engine.startYear()

      if (result.phase === 'awaiting_choice' && result.branches && result.branches.length > 0) {
        const cs2 = engine.getState() as any
        if (!resolveAnyBranch(engine, result.branches, cs2, world)) {
          break // 无法选择任何分支
        }
      }

      const ns = engine.getState() as any
      const lastLog = ns.eventLog[ns.eventLog.length - 1]
      if (lastLog && lastLog.age === ns.age && lastLog.eventId !== '__mundane__') {
        const eventDef = world.index.eventsById.get(lastLog.eventId)
        if (eventDef) {
          const issues = checkEvent(lastLog.age, eventDef, race, ns.flags, raceDef)
          allIssues.push(...issues)
          chronicle.push({
            age: lastLog.age,
            eventId: lastLog.eventId,
            title: lastLog.title || eventDef.title,
            description: lastLog.description || eventDef.description,
            effects: lastLog.effects || []
          })
        }
      }
    } catch (e: any) {
      console.error(`  ERROR at year ${years}: ${e.message}`)
      break
    }

    years++
    if ((engine.getState() as any).phase === 'finished') break
  }

  const finalState = engine.getState() as any
  return { race, gameNum, lifespan: finalState.age, eventCount: chronicle.length, issues: allIssues, chronicle }
}

async function main() {
  console.log('=== 全种族验证测试 (4种族 × 10局) ===\n')
  const world = await createSwordAndMagicWorld()
  const allResults: GameChronicle[] = []
  const raceStats: Record<string, { lifespans: number[]; events: number; issues: number; p1: number; p2: number; p3: number }> = {}

  for (const race of RACES) {
    raceStats[race] = { lifespans: [], events: 0, issues: 0, p1: 0, p2: 0, p3: 0 }
    const raceDef = world.races?.find((r: any) => r.id === race)
    console.log(`\n${'='.repeat(70)}`)
    console.log(`种族: ${raceDef?.name || race} | 寿命范围 [${raceDef?.lifespanRange?.join(', ')}] | maxLifespan=${raceDef?.maxLifespan}`)
    console.log(`${'='.repeat(70)}`)

    for (let i = 0; i < GAMES_PER_RACE; i++) {
      const seed = 1000 + i * 7919 + RACES.indexOf(race) * 31
      const result = await runGame(world, race, i + 1, seed)
      allResults.push(result)

      const st = raceStats[race]
      st.lifespans.push(result.lifespan)
      st.events += result.eventCount
      st.issues += result.issues.length
      st.p1 += result.issues.filter(x => x.severity === 'P1').length
      st.p2 += result.issues.filter(x => x.severity === 'P2').length
      st.p3 += result.issues.filter(x => x.severity === 'P3').length

      console.log(`\n--- ${race} #${i + 1} | seed=${seed} | 寿命=${result.lifespan} | 事件=${result.eventCount} ---`)
      for (const entry of result.chronicle) {
        const issue = result.issues.find(iss => iss.age === entry.age && iss.eventId === entry.eventId)
        if (issue) {
          console.log(`  ⚠️  [${entry.age}岁] ${entry.title}`)
          console.log(`      ${entry.description.substring(0, 70)}`)
          console.log(`      ❌ [${issue.severity}] ${issue.reason}`)
        } else {
          console.log(`  ✅ [${entry.age}岁] ${entry.title}: ${entry.description.substring(0, 70)}`)
        }
      }
      if (result.issues.length === 0) console.log('  (无问题)')
    }
  }

  // === 汇总 ===
  console.log(`\n\n${'#'.repeat(80)}`)
  console.log('# 汇总报告')
  console.log(`${'#'.repeat(80)}`)

  for (const race of RACES) {
    const st = raceStats[race]
    const ls = st.lifespans
    const min = Math.min(...ls), max = Math.max(...ls)
    const avg = (ls.reduce((a, b) => a + b, 0) / ls.length).toFixed(1)
    const raceDef = world.races?.find((r: any) => r.id === race)
    const [lo, hi] = raceDef?.lifespanRange || [65, 85]
    const inRange = ls.filter(l => l >= lo && l <= hi).length
    const below = ls.filter(l => l < lo).length
    const above = ls.filter(l => l > hi).length

    console.log(`\n【${raceDef?.name || race}】 range=[${lo}, ${hi}], maxLifespan=${raceDef?.maxLifespan}`)
    console.log(`  寿命: min=${min} max=${max} avg=${avg}`)
    console.log(`  分布: 范围内=${inRange}/10 | 早亡(<${lo})=${below} | 长寿(>${hi})=${above}`)
    console.log(`  事件: 总计=${st.events}, 平均=${(st.events / 10).toFixed(1)}/局`)
    console.log(`  问题: P1=${st.p1} P2=${st.p2} P3=${st.p3} 总计=${st.issues}`)
  }

  const allIssues = allResults.flatMap(r => r.issues)
  if (allIssues.length > 0) {
    console.log(`\n${'#'.repeat(80)}`)
    console.log(`# 问题明细 (${allIssues.length}个)`)
    console.log(`${'#'.repeat(80)}`)
    for (const iss of [...allIssues].sort((a, b) => a.severity.localeCompare(b.severity) || a.age - b.age)) {
      const game = allResults.find(r => r.issues.includes(iss))
      console.log(`  [${iss.severity}] ${game?.race}#${game?.gameNum} age=${iss.age} "${iss.title}"`)
      console.log(`         ${iss.reason}`)
    }
  } else {
    console.log('\n🎉 全部通过！')
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
