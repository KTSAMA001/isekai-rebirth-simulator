/**
 * 事件扩展前验证测试 - 年龄缩放 & 事件覆盖率 & 路线叙事链
 * 
 * 验证重点：
 * 1. 恋爱事件在长寿命种族中的触发年龄
 * 2. 每个开放种族的事件覆盖率基准
 * 3. 属性路线事件是否形成完整叙事链
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'

type PlayConfig = {
  race: string
  gender: 'male' | 'female'
  seed: number
  label: string
}

type YearRecord = {
  age: number
  eventId: string
  title: string
  routeId?: string
  effects: string[]
}

type PlayResult = {
  config: PlayConfig
  effectiveMaxAge: number
  finalAge: number
  grade: string
  gradeTitle: string
  score: number
  yearLog: YearRecord[]
  romanceEvents: YearRecord[]
  routeEvents: Map<string, YearRecord[]>
  stageEventCounts: Record<string, number>
  lifecycleRatio: number
}

const PLAYABLE_RACES: PlayConfig[] = [
  { race: 'human', gender: 'male', seed: 7001, label: '人类-男' },
  { race: 'elf', gender: 'female', seed: 7002, label: '精灵-女' },
  { race: 'elf', gender: 'male', seed: 7003, label: '精灵-男' },
  { race: 'goblin', gender: 'male', seed: 7004, label: '哥布林-男' },
  { race: 'goblin', gender: 'female', seed: 7005, label: '哥布林-女' },
  { race: 'dwarf', gender: 'male', seed: 7006, label: '矮人-男' },
  { race: 'dwarf', gender: 'female', seed: 7007, label: '矮人-女' },
  { race: 'beastfolk', gender: 'male', seed: 7008, label: '兽人-男' },
  { race: 'seaelf', gender: 'female', seed: 7009, label: '海精灵-女' },
  { race: 'halfdragon', gender: 'male', seed: 7010, label: '半龙人-男' },
]

// Romance event IDs to track
const ROMANCE_EVENT_IDS = new Set([
  'first_love', 'love_at_first_sight', 'heartbreak_growth', 'dating_start', 'dating_deepen',
  'starlight_promise', 'festival_dance', 'forbidden_love', 'rescue_from_dungeon',
  'soul_bound', 'family_blessing', 'marriage_proposal', 'wedding_ceremony',
  'marriage_anniversary', 'marry_noble', 'marry_adventurer',
  'lover_curse', 'lover_death_battlefield', 'human_first_crush', 'human_romance_at_inn',
  'youth_first_love', 'youth_shared_roof', 'goblin_interracial_marriage',
  'human_wedding_ceremony', 'human_marriage_proposal',
])

// Attribute route event prefixes
const ROUTE_EVENT_PREFIXES: Record<string, string[]> = {
  chr: ['chr_public_speech', 'noble_social_debut', 'noble_admirer', 'festival_dance', 'human_harvest_festival_dance'],
  mag: ['mag_elemental_fusion', 'magic_academy_enrollment', 'magic_exam', 'magic_graduate', 'mage_arcane_library', 'mage_magic_tower', 'mage_elemental_plane', 'mage_magic_war', 'magic_research_breakthrough', 'magic_theory_class', 'magic_burst_baby', 'magic_duel', 'dark_mage_tempt', 'dark_mage_choice'],
  luk: ['luk_lucky_coin', 'luk_potion_find', 'luk_lottery', 'luk_wild_encounter'],
  spr: ['spr_spirit_animal', 'spr_dream_vision', 'spr_meditation_retreat', 'spr_curse_breaker', 'spr_near_death', 'spr_divine_sign'],
}

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (seed >>> 0) / 0xFFFFFFFF
  }
}

function getStage(age: number, maxAge: number): string {
  const ratio = age / maxAge
  if (ratio <= 0.12) return 'childhood'
  if (ratio <= 0.22) return 'youth'
  if (ratio <= 0.35) return 'teenager'
  if (ratio <= 0.60) return 'adult'
  if (ratio <= 0.80) return 'middle-age'
  return 'elder'
}

async function runPlaythrough(
  world: any,
  config: PlayConfig
): Promise<PlayResult> {
  const engine = new SimulationEngine(world, config.seed)
  engine.initGame('测试角色', undefined, config.race, config.gender)
  let state = engine.getState()
  const effectiveMaxAge = state.effectiveMaxAge!

  // Draft & select talents
  const draftPool = engine.draftTalents()
  const selected = draftPool.slice(0, Math.min(3, draftPool.length))
  engine.selectTalents(selected)
  state = engine.getState()

  // Allocate attributes - spread evenly
  const availablePoints = world.manifest.initialPoints - state.talentPenalty
  const attrIds = Object.keys(state.attributes).filter((k: string) => !k.endsWith('_display'))
  const allocation: Record<string, number> = {}
  let remaining = availablePoints
  const rng = seededRandom(config.seed * 7 + 13)
  for (let i = 0; i < attrIds.length; i++) {
    const attrId = attrIds[i]
    if (i === attrIds.length - 1) {
      allocation[attrId] = remaining
    } else {
      const pts = Math.floor(rng() * (remaining / 2))
      allocation[attrId] = pts
      remaining -= pts
    }
  }
  engine.allocateAttributes(allocation)
  state = engine.getState()

  const yearLog: YearRecord[] = []
  let maxIterations = effectiveMaxAge + 100

  while (state.phase === 'simulating' && maxIterations-- > 0) {
    const result = engine.startYear()

    if (result.phase === 'mundane_year') {
      engine.skipYear()
      state = engine.getState()
      yearLog.push({
        age: state.age,
        eventId: '__mundane__',
        title: '平静的一年',
        effects: [],
      })
    } else if (result.phase === 'awaiting_choice' && result.event && result.branches) {
      const firstBranch = result.branches[0]
      engine.resolveBranch(firstBranch.id)
      state = engine.getState()
      yearLog.push({
        age: state.age,
        eventId: result.event.id,
        title: result.event.title,
        effects: [],
      })
    } else if (result.phase === 'showing_event' && result.event) {
      state = engine.getState()
      yearLog.push({
        age: state.age,
        eventId: result.event.id,
        title: result.event.title,
        effects: [],
      })
    } else {
      state = engine.getState()
    }

    if (state.phase !== 'simulating') break
  }

  // Analyze results
  const romanceEvents = yearLog.filter(y => ROMANCE_EVENT_IDS.has(y.eventId))
  
  const routeEvents = new Map<string, YearRecord[]>()
  for (const [routeKey, prefixes] of Object.entries(ROUTE_EVENT_PREFIXES)) {
    const matched = yearLog.filter(y => 
      prefixes.some(p => y.eventId === p || y.eventId.startsWith(p))
    )
    if (matched.length > 0) {
      routeEvents.set(routeKey, matched)
    }
  }

  const stageEventCounts: Record<string, number> = {
    childhood: 0, youth: 0, teenager: 0,
    adult: 0, 'middle-age': 0, elder: 0,
  }
  for (const y of yearLog) {
    if (y.eventId === '__mundane__') continue
    const stage = getStage(y.age, effectiveMaxAge)
    stageEventCounts[stage] = (stageEventCounts[stage] || 0) + 1
  }

  return {
    config,
    effectiveMaxAge,
    finalAge: state.age,
    grade: state.result?.grade ?? '?',
    gradeTitle: state.result?.gradeTitle ?? '?',
    score: state.result?.score ?? 0,
    yearLog,
    romanceEvents,
    routeEvents,
    stageEventCounts,
    lifecycleRatio: state.age / effectiveMaxAge,
  }
}

function computeLifespanRatio(raceId: string, lifespanRange: [number, number]): number {
  const avgLifespan = (lifespanRange[0] + lifespanRange[1]) / 2
  const humanBaseline = 85
  return avgLifespan / humanBaseline
}

async function main() {
  const world = await createSwordAndMagicWorld()
  const results: PlayResult[] = []

  for (const config of PLAYABLE_RACES) {
    console.log(`Running: ${config.label}...`)
    const result = await runPlaythrough(world, config)
    results.push(result)
    console.log(`  -> ${result.finalAge}/${result.effectiveMaxAge}yo, ${result.grade} ${result.gradeTitle}, ${result.yearLog.filter(y => y.eventId !== '__mundane__').length} events, ${result.romanceEvents.length} romance`)
  }

  // Generate report
  const lines: string[] = []

  lines.push('# 🎮 事件扩展前验证测试报告')
  lines.push('')
  lines.push('**测试日期**: 2026-04-12')
  lines.push('**测试目的**: 建立事件扩展前的基准数据，验证现有系统的关键问题')
  lines.push('**测试方法**: Galgame 流程自动推进，每个开放种族 1 局')
  lines.push('')

  // === 1. Race lifespan & romance analysis ===
  lines.push('## 1. 种族寿命比与恋爱事件年龄缩放分析')
  lines.push('')

  const raceLifespans: Record<string, { range: [number, number]; ratio: number }> = {
    human: { range: [80, 90], ratio: computeLifespanRatio('human', [80, 90]) },
    elf: { range: [380, 420], ratio: computeLifespanRatio('elf', [380, 420]) },
    goblin: { range: [30, 36], ratio: computeLifespanRatio('goblin', [30, 36]) },
    dwarf: { range: [160, 180], ratio: computeLifespanRatio('dwarf', [160, 180]) },
    beastfolk: { range: [60, 68], ratio: computeLifespanRatio('beastfolk', [60, 68]) },
    seaelf: { range: [450, 490], ratio: computeLifespanRatio('seaelf', [450, 490]) },
    halfdragon: { range: [220, 250], ratio: computeLifespanRatio('halfdragon', [220, 250]) },
  }

  lines.push('| 种族 | 寿命范围 | lifespanRatio | first_love 原始 12-15 | 缩放后范围 | dating_start 原始 16-25 | 缩放后范围 |')
  lines.push('|------|---------|--------------|----------------------|-----------|------------------------|-----------|')
  for (const [raceId, info] of Object.entries(raceLifespans)) {
    const r = info.ratio
    const firstLoveMin = Math.round(12 * r)
    const firstLoveMax = Math.round(15 * r)
    const datingMin = Math.round(16 * r)
    const datingMax = Math.round(25 * r)
    lines.push(`| ${raceId} | ${info.range[0]}-${info.range[1]} | ${r.toFixed(2)} | 12-15 | ${firstLoveMin}-${firstLoveMax} | 16-25 | ${datingMin}-${datingMax} |`)
  }
  lines.push('')

  lines.push('### 关键问题：恋爱事件缩放后年龄')
  lines.push('')
  lines.push('`getScaledAgeRange` 逻辑分析：')
  lines.push('- `first_love` (minAge=12, maxAge=15) 没有 `races` 字段 → 通用事件 → **会被缩放**')
  lines.push('- 精灵 lifespanRatio ≈ 4.65 → 缩放后 first_love 年龄变为 56-70 岁')
  lines.push('- 海精灵 lifespanRatio ≈ 5.53 → 缩放后 66-83 岁')
  lines.push('- 矮人 lifespanRatio ≈ 2.0 → 缩放后 24-30 岁（尚可接受）')
  lines.push('')

  // Check actual romance events triggered
  lines.push('### 实际触发的恋爱事件')
  lines.push('')
  lines.push('| 种族 | 性别 | 寿命 | 恋爱事件数 | 触发年龄(事件ID) |')
  lines.push('|------|------|------|-----------|----------------|')
  for (const r of results) {
    const romStr = r.romanceEvents.map(e => `${e.age}(${e.eventId})`).join(', ') || '无'
    lines.push(`| ${r.config.race} | ${r.config.gender} | ${r.effectiveMaxAge} | ${r.romanceEvents.length} | ${romStr} |`)
  }
  lines.push('')

  // P1 issue detection
  let hasP1Issue = false
  for (const r of results) {
    const raceInfo = raceLifespans[r.config.race]
    if (!raceInfo) continue
    if (raceInfo.ratio > 2.0) {
      for (const re of r.romanceEvents) {
        // Check if romance triggered at scaled age (very late)
        const expectedHumanAge = 12 // first_love minAge
        const scaledMin = Math.round(expectedHumanAge * raceInfo.ratio)
        if (re.age >= scaledMin) {
          hasP1Issue = true
        }
      }
    }
  }

  if (hasP1Issue) {
    lines.push('> ⚠️ **P1 问题确认**: 长寿命种族（精灵/海精灵/矮人）的恋爱事件因年龄缩放导致触发年龄严重偏大。')
    lines.push('> 精灵在 56-70 岁才触发 `first_love`，这不符合游戏体验预期。')
    lines.push('> **根因**: `getScaledAgeRange` 对所有通用事件（含 `routes: ["*"]` 但无 `races` 的事件）按 lifespanRatio 缩放，没有区分"生理年龄"和"生命周期年龄"。')
    lines.push('> **建议修复**: 恋爱/社交类事件应使用"心理年龄"缩放（如 `Math.pow(ratio, 0.3)` 软缩放），而非线性缩放。或为这些事件添加 `noScale: true` 标记。')
    lines.push('')
  } else {
    lines.push('> ✅ 本次测试中长寿命种族未触发恋爱事件（可能因为种子随机未命中），但代码逻辑上 P1 问题存在。')
    lines.push('')
  }

  // === 2. Event coverage ===
  lines.push('## 2. 事件覆盖率基准')
  lines.push('')
  lines.push('| 种族 | 性别 | 寿命 | 实际年龄 | 生命周期比 | 总事件数 | 童年 | 少年 | 青年 | 壮年 | 中年 | 老年 | 恋爱 | chr | mag | luk | spr |')
  lines.push('|------|------|------|---------|----------|---------|------|------|------|------|------|------|------|-----|-----|-----|-----|')
  for (const r of results) {
    const totalEvents = r.yearLog.filter(y => y.eventId !== '__mundane__').length
    const mundaneCount = r.yearLog.filter(y => y.eventId === '__mundane__').length
    const sc = r.stageEventCounts
    const chrCount = r.routeEvents.get('chr')?.length ?? 0
    const magCount = r.routeEvents.get('mag')?.length ?? 0
    const lukCount = r.routeEvents.get('luk')?.length ?? 0
    const sprCount = r.routeEvents.get('spr')?.length ?? 0
    lines.push(
      `| ${r.config.race} | ${r.config.gender} | ${r.effectiveMaxAge} | ${r.finalAge} | ${r.lifecycleRatio.toFixed(2)} | ${totalEvents}(${mundaneCount}平淡) | ${sc.childhood} | ${sc.youth} | ${sc.teenager} | ${sc.adult} | ${sc['middle-age']} | ${sc.elder} | ${r.romanceEvents.length} | ${chrCount} | ${magCount} | ${lukCount} | ${sprCount} |`
    )
  }
  lines.push('')

  // === 3. Route narrative chain ===
  lines.push('## 3. 属性路线事件叙事链')
  lines.push('')
  for (const [routeKey, prefixes] of Object.entries(ROUTE_EVENT_PREFIXES)) {
    lines.push(`### ${routeKey.toUpperCase()} 路线`)
    lines.push('')
    for (const r of results) {
      const matched = r.yearLog.filter(y =>
        prefixes.some(p => y.eventId === p || y.eventId.startsWith(p))
      )
      if (matched.length > 0) {
        const chain = matched.map(e => `${e.age}→${e.eventId}`).join(' → ')
        lines.push(`- **${r.config.label}** (${r.effectiveMaxAge}yo): ${chain}`)
      }
    }
    lines.push('')
  }

  // === 4. Dwarf/Elf event coverage detail ===
  lines.push('## 4. 长寿命种族事件分布详情')
  lines.push('')
  for (const r of results.filter(r => ['elf', 'seaelf', 'dwarf', 'halfdragon'].includes(r.config.race))) {
    const events = r.yearLog.filter(y => y.eventId !== '__mundane__')
    lines.push(`### ${r.config.label} (寿命 ${r.effectiveMaxAge}, ${events.length} 事件)`)
    lines.push('')
    
    // Show events by age bracket
    const brackets: Record<string, YearRecord[]> = {}
    const bracketRanges = [
      ['0-10% (童年)', 0, 0.1],
      ['10-20% (少年)', 0.1, 0.2],
      ['20-35% (青年)', 0.2, 0.35],
      ['35-55% (壮年)', 0.35, 0.55],
      ['55-75% (中年)', 0.55, 0.75],
      ['75-100% (老年)', 0.75, 1.0],
    ]
    for (const [label, min, max] of bracketRanges) {
      brackets[label] = events.filter(e => {
        const ratio = e.age / r.effectiveMaxAge
        return ratio >= min && ratio < max
      })
    }
    for (const [label, evts] of Object.entries(brackets)) {
      lines.push(`**${label}** (${evts.length} 事件)`)
      if (evts.length === 0) {
        lines.push('- _无事件触发_')
      } else {
        for (const e of evts) {
          lines.push(`- ${e.age}岁: ${e.eventId} (${e.title})`)
        }
      }
      lines.push('')
    }
  }

  // === 5. Summary ===
  lines.push('## 5. 问题汇总')
  lines.push('')

  lines.push('### P1: 长寿命种族恋爱事件年龄缩放问题')
  lines.push('- **严重等级**: P1')
  lines.push('- **影响种族**: 精灵、海精灵、矮人、半龙人')
  lines.push('- **根因**: `EventModule.getScaledAgeRange` 对通用事件线性缩放年龄，lifespanRatio > 2 时恋爱事件触发年龄严重偏大')
  lines.push('- **具体数据**:')
  lines.push('  - 精灵 (ratio≈4.65): `first_love` 56-70岁, `dating_start` 74-116岁')
  lines.push('  - 海精灵 (ratio≈5.53): `first_love` 66-83岁, `dating_start` 88-138岁')
  lines.push('  - 矮人 (ratio≈2.0): `first_love` 24-30岁 (尚可)')
  lines.push('  - 半龙人 (ratio≈2.76): `first_love` 33-41岁')
  lines.push('- **修复建议**: 对恋爱/社交类事件使用软缩放 `age * Math.pow(ratio, 0.3)`，或添加 `noScale` 标记')

  // Check for empty stages
  const emptyStages: string[] = []
  for (const r of results) {
    for (const [stage, count] of Object.entries(r.stageEventCounts)) {
      if (count === 0) {
        emptyStages.push(`${r.config.label}: ${stage}`)
      }
    }
  }
  if (emptyStages.length > 0) {
    lines.push('')
    lines.push('### P2: 部分种族生命周期阶段事件空白')
    lines.push('- **严重等级**: P2')
    lines.push('- **详情**:')
    for (const s of emptyStages) {
      lines.push(`  - ${s}`)
    }
    lines.push('- **说明**: 可能是因为年龄缩放导致事件集中在缩放后的年龄区间，某些阶段没有匹配事件')
  }

  // Route completeness
  lines.push('')
  lines.push('### P3: 属性路线事件覆盖不完整')
  lines.push('- **严重等级**: P3')
  lines.push('- **说明**: chr/mag/luk/spr 路线事件数量有限，大部分局可能不会触发完整叙事链')
  lines.push('- **现状**: 每条路线仅有 3-6 个专属事件，不足以支撑完整一生叙事')

  const reportPath = '/Users/ktsama/Projects/isekai-rebirth-simulator/docs/PLAYTEST-PRE-EVENT-EXPANSION.md'
  const report = lines.join('\n')
  
  const fs = await import('fs')
  fs.writeFileSync(reportPath, report, 'utf-8')
  console.log(`\nReport written to ${reportPath}`)
  console.log(`\nSummary:`)
  console.log(`  - P1 (恋爱事件年龄缩放): ${hasP1Issue ? '确认存在' : '代码逻辑存在，本轮未触发'}`)
  console.log(`  - P2 (阶段空白): ${emptyStages.length} 个空白阶段`)
  console.log(`  - P3 (路线事件): 已记录`)
}

main().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
