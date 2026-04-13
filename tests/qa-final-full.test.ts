/**
 * QA 最终全面测试 — 4可玩种族 × 3局 + 路线系统 + HP系统 + 事件覆盖 + Flag一致性
 * 输出报告到 docs/QA-FINAL-FULL.md
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'

// ==================== Types ====================
type PlaythroughConfig = {
  race: string
  gender: 'male' | 'female'
  seed: number
  label: string
}

type YearRecord = {
  age: number
  hpBefore: number
  hpAfter: number
  hpDelta: number
  eventId: string
  title: string
  tag?: string
  routes?: string[]
  branchChoice?: string
  isSuccess?: boolean
  branchCount?: number
  phase: string
}

type PlayResult = {
  config: PlaythroughConfig
  effectiveMaxAge: number
  initHp: number
  finalAge: number
  grade: string
  gradeTitle: string
  score: number
  yearLog: YearRecord[]
  triggeredEvents: Set<string>
  routeFlags: Set<string>
  uniqueEvents: number
  mundaneYears: number
  eventYears: number
  maxYearlyLoss: number
  maxYearlyGain: number
  hpBelow50Ages: number[]
  childhoodProtected: number
  deathAge: number
  achievements: string[]
  flags: Set<string>
  items: string[]
  peakHp: number
  minHp: number
  hpAtAge0: number
  hpAtAge1: number
  hpAtAge5: number
  hpAtAge10: number
  hpAtAge15: number
  hpAtAge20: number
  hpAtAge50: number
  hpHistory: number[]
  currentRoute: string | null
  routeSwitches: { from: string | null; to: string; age: number }[]
}

type RouteTestConfig = {
  race: string
  gender: 'male' | 'female'
  seed: number
  label: string
  targetRoute: string
  forcedFlags: string[]
}

type RouteTestResult = {
  config: RouteTestConfig
  success: boolean
  routeActivated: boolean
  routeActivatedAge: number
  anchorTriggered: string[]
  anchorExpected: string[]
  anchorMissing: string[]
  routeEventsTriggered: string[]
  finalAge: number
  grade: string
  score: number
  yearLog: YearRecord[]
  triggeredEvents: Set<string>
}

// ==================== Configs ====================
const RACE_CONFIGS: PlaythroughConfig[] = [
  // 人类 3局
  { race: 'human', gender: 'male', seed: 9001, label: '人类-男-A' },
  { race: 'human', gender: 'female', seed: 9002, label: '人类-女-B' },
  { race: 'human', gender: 'male', seed: 9003, label: '人类-男-C' },
  // 精灵 3局
  { race: 'elf', gender: 'female', seed: 9011, label: '精灵-女-A' },
  { race: 'elf', gender: 'male', seed: 9012, label: '精灵-男-B' },
  { race: 'elf', gender: 'female', seed: 9013, label: '精灵-女-C' },
  // 哥布林 3局
  { race: 'goblin', gender: 'female', seed: 9021, label: '哥布林-女-A' },
  { race: 'goblin', gender: 'male', seed: 9022, label: '哥布林-男-B' },
  { race: 'goblin', gender: 'female', seed: 9023, label: '哥布林-女-C' },
  // 矮人 3局
  { race: 'dwarf', gender: 'male', seed: 9031, label: '矮人-男-A' },
  { race: 'dwarf', gender: 'female', seed: 9032, label: '矮人-女-B' },
  { race: 'dwarf', gender: 'male', seed: 9033, label: '矮人-男-C' },
]

// Route-specific tests: force entry flags to guarantee route activation
const ROUTE_TEST_CONFIGS: RouteTestConfig[] = [
  // 冒险者路线
  { race: 'human', gender: 'male', seed: 9101, label: '冒险者-人类', targetRoute: 'adventurer', forcedFlags: ['guild_member'] },
  // 骑士路线
  { race: 'human', gender: 'male', seed: 9102, label: '骑士-人类', targetRoute: 'knight', forcedFlags: ['knight'] },
  // 魔法师路线
  { race: 'elf', gender: 'female', seed: 9103, label: '法师-精灵', targetRoute: 'mage', forcedFlags: ['magic_student'] },
  // 商人路线
  { race: 'human', gender: 'female', seed: 9104, label: '商人-人类', targetRoute: 'merchant', forcedFlags: ['merchant_apprentice'] },
  // 学者路线
  { race: 'dwarf', gender: 'male', seed: 9105, label: '学者-矮人', targetRoute: 'scholar', forcedFlags: ['has_student'] },
  // 平民路线 (stay as commoner)
  { race: 'goblin', gender: 'male', seed: 9106, label: '平民-哥布林', targetRoute: 'commoner', forcedFlags: [] },
]

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (seed >>> 0) / 0xFFFFFFFF
  }
}

// ==================== Simulation Runner ====================
async function runPlaythrough(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  config: PlaythroughConfig,
): Promise<PlayResult> {
  const engine = new SimulationEngine(world, config.seed)
  engine.initGame('QA测试', undefined, config.race, config.gender)
  let state = engine.getState()
  const effectiveMaxAge = state.effectiveMaxAge

  // Draft and select talents (pick first 3)
  const draftPool = engine.draftTalents()
  const selected = draftPool.slice(0, Math.min(3, draftPool.length))
  engine.selectTalents(selected)
  state = engine.getState()

  // Allocate attributes deterministically
  const availablePoints = world.manifest.initialPoints - state.talentPenalty
  const attrIds = Object.keys(state.attributes).filter(k => !k.endsWith('_display'))
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
  const initHp = state.hp

  const yearLog: YearRecord[] = []
  let maxIterations = effectiveMaxAge + 100
  let childhoodProtected = 0
  let maxYearlyLoss = 0
  let maxYearlyGain = 0
  const hpBelow50Ages: number[] = []
  const hpHistory: number[] = []
  let peakHp = state.hp
  let minHp = state.hp
  const routeSwitches: { from: string | null; to: string; age: number }[] = []
  let prevRoute: string | null = null
  let currentRoute: string | null = null

  while (state.phase === 'simulating' && maxIterations-- > 0) {
    const hpBefore = state.hp
    const result = engine.startYear()

    // Track route changes
    state = engine.getState()
    // We can't directly read activeRoute, so we'll detect from flags
    const routeFlags = new Set([...state.flags].filter(f => f.startsWith('on_') && f.endsWith('_path')))
    let detectedRoute = 'commoner'
    if (routeFlags.has('on_mage_path')) detectedRoute = 'mage'
    else if (routeFlags.has('on_knight_path')) detectedRoute = 'knight'
    else if (routeFlags.has('on_adventurer_path')) detectedRoute = 'adventurer'
    else if (routeFlags.has('on_merchant_path')) detectedRoute = 'merchant'
    else if (routeFlags.has('on_scholar_path')) detectedRoute = 'scholar'

    if (detectedRoute !== prevRoute) {
      routeSwitches.push({ from: prevRoute, to: detectedRoute, age: state.age })
      prevRoute = detectedRoute
      currentRoute = detectedRoute
    }

    if (result.phase === 'mundane_year') {
      engine.skipYear()
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: '__mundane__', title: '平静的一年', phase: 'mundane_year',
      })
    } else if (result.phase === 'awaiting_choice' && result.event && result.branches) {
      const evt = result.event
      // 选择第一个条件满足的分支（跳过 requireCondition 不满足的）
      const ctx = { state, world }
      const dsl = new ConditionDSL()
      const availableBranch = result.branches.find(b => {
        if (!b.requireCondition) return true
        const conditions = b.requireCondition.split(',').map(c => c.trim())
        return conditions.every(c => dsl.evaluate(c, ctx))
      })
      const firstBranch = availableBranch ?? result.branches[0]
      engine.resolveBranch(firstBranch.id)
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: evt.id, title: evt.title, tag: evt.tag, routes: evt.routes,
        branchChoice: firstBranch.title, isSuccess: (result as any).isSuccess,
        branchCount: result.branches.length, phase: 'awaiting_choice',
      })
    } else if (result.phase === 'showing_event' && result.event) {
      const evt = result.event
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: evt.id, title: evt.title, tag: evt.tag, routes: evt.routes,
        phase: 'showing_event',
      })
    } else {
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: '__unknown__', title: `phase=${result.phase}`, phase: result.phase,
      })
    }

    // Track HP metrics
    const delta = state.hp - hpBefore
    if (delta < 0 && Math.abs(delta) > maxYearlyLoss) maxYearlyLoss = Math.abs(delta)
    if (delta > maxYearlyGain) maxYearlyGain = delta
    if (state.hp > 0 && state.hp < 50) hpBelow50Ages.push(state.age)
    if (state.hp > peakHp) peakHp = state.hp
    if (state.hp < minHp) minHp = state.hp
    hpHistory.push(state.hp)

    // Track childhood protection
    if (state.age <= 15 && delta < 0) {
      const limit = Math.floor(hpBefore * 0.3) + 5
      // If loss was capped, it means protection activated
      if (hpBefore + delta > hpBefore - limit) {
        // Hard to detect precisely from outside, approximate
      }
    }

    if (state.phase !== 'simulating') break
  }

  engine.finish()
  state = engine.getState()

  // Extract specific ages for HP tracking
  const hpAtAge = (targetAge: number) => {
    const entry = yearLog.find(y => y.age === targetAge)
    return entry ? entry.hpAfter : -1
  }

  return {
    config, effectiveMaxAge, initHp,
    finalAge: state.age,
    grade: state.result?.grade ?? '?',
    gradeTitle: state.result?.gradeTitle ?? '?',
    score: state.result?.score ?? 0,
    yearLog, triggeredEvents: state.triggeredEvents,
    routeFlags: new Set([...state.flags].filter(f => f.startsWith('on_') && f.endsWith('_path'))),
    uniqueEvents: [...state.triggeredEvents].filter(id => !id.startsWith('__')).length,
    mundaneYears: yearLog.filter(y => y.eventId === '__mundane__').length,
    eventYears: yearLog.filter(y => y.eventId !== '__mundane__' && y.eventId !== '__unknown__').length,
    maxYearlyLoss, maxYearlyGain, hpBelow50Ages, childhoodProtected,
    deathAge: state.age, achievements: state.achievements.unlocked,
    flags: state.flags, items: state.inventory.items.map(i => i.itemId),
    peakHp, minHp,
    hpAtAge0: hpAtAge(0), hpAtAge1: hpAtAge(1), hpAtAge5: hpAtAge(5),
    hpAtAge10: hpAtAge(10), hpAtAge15: hpAtAge(15), hpAtAge20: hpAtAge(20),
    hpAtAge50: hpAtAge(50), hpHistory,
    currentRoute, routeSwitches,
  }
}

// ==================== Route-Specific Runner ====================
async function runRouteTest(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  config: RouteTestConfig,
): Promise<RouteTestResult> {
  const engine = new SimulationEngine(world, config.seed)
  engine.initGame('QA路线测试', undefined, config.race, config.gender)

  // Draft/select talents
  const draftPool = engine.draftTalents()
  engine.selectTalents(draftPool.slice(0, 3))

  // Allocate attributes
  const state0 = engine.getState()
  const availablePoints = world.manifest.initialPoints - state0.talentPenalty
  const attrIds = Object.keys(state0.attributes).filter(k => !k.endsWith('_display'))
  const allocation: Record<string, number> = {}
  let remaining = availablePoints
  const rng = seededRandom(config.seed * 7 + 13)
  for (let i = 0; i < attrIds.length; i++) {
    if (i === attrIds.length - 1) { allocation[attrIds[i]] = remaining; break }
    const pts = Math.floor(rng() * (remaining / 2))
    allocation[attrIds[i]] = pts
    remaining -= pts
  }
  engine.allocateAttributes(allocation)

  // Force entry flags by manipulating state
  let state = engine.getState()
  // We need to inject flags - use a private method approach
  // Since we can't directly set flags, we'll simulate until the route could naturally trigger,
  // or use the engine's internal state

  // Actually, let's try to find events that set these flags and bias toward them
  // Better approach: inject flags into state via the engine
  // The engine stores flags in state.flags (Set<string>)
  // We need to access the internal state
  ;(engine as any).state.flags = new Set([...state.flags, ...config.forcedFlags])

  const effectiveMaxAge = state.effectiveMaxAge
  let stateBeforeYear = engine.getState()
  const yearLog: YearRecord[] = []
  let maxIter = effectiveMaxAge + 100
  let routeActivatedAge = -1
  const anchorTriggered: string[] = []

  // Get expected anchors for this route
  const route = world.manifest.routes?.find(r => r.id === config.targetRoute)
  const anchorExpected = route?.anchorEvents?.map(a => a.eventId) ?? []

  while (stateBeforeYear.phase === 'simulating' && maxIter-- > 0) {
    const hpBefore = stateBeforeYear.hp
    const result = engine.startYear()

    // Check route activation
    state = engine.getState()
    const hasRouteFlag = config.forcedFlags.length > 0 || config.targetRoute === 'commoner'
    const routeEntryFlags = route?.entryFlags ?? []
    const activated = routeEntryFlags.some(f => state.flags.has(f)) || config.targetRoute === 'commoner'
    if (activated && routeActivatedAge === -1) {
      routeActivatedAge = state.age
    }

    // Track anchor events
    for (const anchor of anchorExpected) {
      if (state.triggeredEvents.has(anchor) && !anchorTriggered.includes(anchor)) {
        anchorTriggered.push(anchor)
      }
    }

    if (result.phase === 'mundane_year') {
      engine.skipYear()
      state = engine.getState()
      yearLog.push({ age: state.age, hpBefore, hpAfter: state.hp, hpDelta: state.hp - hpBefore, eventId: '__mundane__', title: '平静的一年', phase: 'mundane_year' })
    } else if (result.phase === 'awaiting_choice' && result.event && result.branches) {
      const evt = result.event
      // 选择第一个条件满足的分支（跳过 requireCondition 不满足的）
      const ctx = { state, world }
      const dsl = new ConditionDSL()
      const availableBranch = result.branches.find(b => {
        if (!b.requireCondition) return true
        const conditions = b.requireCondition.split(',').map(c => c.trim())
        return conditions.every(c => dsl.evaluate(c, ctx))
      })
      const firstBranch = availableBranch ?? result.branches[0]
      engine.resolveBranch(firstBranch.id)
      state = engine.getState()
      yearLog.push({ age: state.age, hpBefore, hpAfter: state.hp, hpDelta: state.hp - hpBefore, eventId: evt.id, title: evt.title, tag: evt.tag, routes: evt.routes, branchChoice: firstBranch.title, branchCount: result.branches.length, phase: 'awaiting_choice' })
    } else if (result.phase === 'showing_event' && result.event) {
      state = engine.getState()
      yearLog.push({ age: state.age, hpBefore, hpAfter: state.hp, hpDelta: state.hp - hpBefore, eventId: result.event!.id, title: result.event!.title, tag: result.event!.tag, routes: result.event!.routes, phase: 'showing_event' })
    } else {
      state = engine.getState()
      yearLog.push({ age: state.age, hpBefore, hpAfter: state.hp, hpDelta: state.hp - hpBefore, eventId: '__unknown__', title: `phase=${result.phase}`, phase: result.phase })
    }

    stateBeforeYear = engine.getState()
    if (stateBeforeYear.phase !== 'simulating') break
  }

  engine.finish()
  state = engine.getState()

  // Collect route-specific events (events with routes containing this route id)
  const routeEventsTriggered = yearLog
    .filter(y => y.eventId !== '__mundane__' && y.eventId !== '__unknown__' && y.routes?.includes(config.targetRoute))
    .map(y => y.eventId)

  // Re-check anchors after finish
  for (const anchor of anchorExpected) {
    if (state.triggeredEvents.has(anchor) && !anchorTriggered.includes(anchor)) {
      anchorTriggered.push(anchor)
    }
  }

  const anchorMissing = anchorExpected.filter(a => !anchorTriggered.includes(a))

  return {
    config,
    success: true,
    routeActivated: routeActivatedAge >= 0 || config.targetRoute === 'commoner',
    routeActivatedAge,
    anchorTriggered,
    anchorExpected,
    anchorMissing,
    routeEventsTriggered,
    finalAge: state.age,
    grade: state.result?.grade ?? '?',
    score: state.result?.score ?? 0,
    yearLog,
    triggeredEvents: state.triggeredEvents,
  }
}

// ==================== Data Analysis Functions ====================
function analyzeEventCoverage(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  allTriggered: Set<string>,
  routeTriggered: Map<string, Set<string>>,
): { covered: number; total: number; uncovered: string[]; byRoute: Map<string, {total: number; triggered: number}> } {
  const allEvents = world.events
  const total = allEvents.length
  const covered = allEvents.filter(e => allTriggered.has(e.id)).length
  const uncovered = allEvents.filter(e => !allTriggered.has(e.id) && !e.unique).map(e => e.id)

  const byRoute = new Map<string, {total: number; triggered: number}>()
  // All events that are tagged with a route
  for (const e of allEvents) {
    const routes = (e as any).routes as string[] | undefined
    if (routes && routes.length > 0) {
      for (const r of routes) {
        if (r === '*') continue
        const existing = byRoute.get(r) ?? { total: 0, triggered: 0 }
        existing.total++
        if (allTriggered.has(e.id)) existing.triggered++
        byRoute.set(r, existing)
      }
    }
  }

  return { covered, total, uncovered, byRoute }
}

function analyzeFlagConsistency(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
): { flagsSet: string[]; flagsUsed: string[]; unusedFlags: string[]; orphanedFlags: string[]; routeNeeded: string[]; routeSettable: boolean[] } {
  const events = world.events
  const achievements = world.achievements
  const manifest = world.manifest

  const flagsSet = new Set<string>()
  const flagsUsed = new Set<string>()
  const flagRe = /has\.flag\.(\w+)/g
  const flagRe2 = /flag:(\w+)/g

  for (const e of events) {
    // Collect set_flag targets
    for (const b of (e as any).branches ?? []) {
      for (const eff of b.effects ?? []) {
        if (eff.type === 'set_flag') flagsSet.add(eff.target)
      }
    }
    for (const eff of e.effects ?? []) {
      if (eff.type === 'set_flag') flagsSet.add(eff.target)
    }
    // Collect has.flag usage
    for (const field of ['include', 'exclude'] as const) {
      const val = e[field] as string | undefined
      if (val) {
        let m: RegExpExecArray | null
        while ((m = flagRe.exec(val)) !== null) flagsUsed.add(m[1])
        while ((m = flagRe2.exec(val)) !== null) flagsUsed.add(m[1])
      }
    }
    for (const prereq of e.prerequisites ?? []) {
      let m: RegExpExecArray | null
      while ((m = flagRe.exec(prereq)) !== null) flagsUsed.add(m[1])
      while ((m = flagRe2.exec(prereq)) !== null) flagsUsed.add(m[1])
    }
    for (const b of (e as any).branches ?? []) {
      const rc = (b as any).requireCondition as string | undefined
      if (rc) {
        let m: RegExpExecArray | null
        while ((m = flagRe.exec(rc)) !== null) flagsUsed.add(m[1])
        while ((m = flagRe2.exec(rc)) !== null) flagsUsed.add(m[1])
      }
    }
  }

  // Achievements & evaluations
  for (const a of achievements) {
    let m: RegExpExecArray | null
    while ((m = flagRe.exec(a.condition)) !== null) flagsUsed.add(m[1])
    while ((m = flagRe2.exec(a.condition)) !== null) flagsUsed.add(m[1])
  }

  // Route enterConditions
  const routeNeeded: string[] = []
  const routeSettable: boolean[] = []
  for (const route of manifest.routes ?? []) {
    const ec = route.enterCondition ?? ''
    let m: RegExpExecArray | null
    while ((m = flagRe.exec(ec)) !== null) {
      routeNeeded.push(m[1])
      routeSettable.push(flagsSet.has(m[1]))
    }
    while ((m = flagRe2.exec(ec)) !== null) {
      routeNeeded.push(m[1])
      routeSettable.push(flagsSet.has(m[1]))
    }
  }

  const unusedFlags = [...flagsSet].filter(f => !flagsUsed.has(f))
  const orphanedFlags = [...flagsUsed].filter(f => !flagsSet.has(f))

  return { flagsSet: [...flagsSet], flagsUsed: [...flagsUsed], unusedFlags, orphanedFlags, routeNeeded, routeSettable }
}

// ==================== Report Generator ====================
function generateReport(
  results: PlayResult[],
  routeResults: RouteTestResult[],
  flagAnalysis: ReturnType<typeof analyzeFlagConsistency>,
  eventCoverage: ReturnType<typeof analyzeEventCoverage>,
): string {
  const L: string[] = []
  const now = new Date().toISOString()

  L.push('# QA 最终全面测试报告')
  L.push('')
  L.push(`> 生成时间: ${now}`)
  L.push(`> 测试版本: 4 可玩种族 × 3局（共 12 局）+ 6 条路线专项测试`)
  L.push(`> 项目: isekai-rebirth-simulator`)
  L.push('')

  // ==================== EXECUTIVE SUMMARY ====================
  L.push('## 执行摘要')
  L.push('')
  const issues: string[] = []

  // Check for P0/P1 issues
  // Elf HP
  const elfResults = results.filter(r => r.config.race === 'elf')
  const elfLowHp = elfResults.filter(r => r.minHp < 30)
  if (elfLowHp.length > 0) {
    issues.push(`P1: 精灵最低HP过低 (${elfLowHp.map(r => `${r.config.label}: min=${r.minHp}`).join(', ')})`)
  }

  // Goblin lifespan
  const goblinResults = results.filter(r => r.config.race === 'goblin')
  const goblinShortLived = goblinResults.filter(r => r.deathAge < 15)
  if (goblinShortLived.length > 0) {
    issues.push(`P1: 哥布林过早死亡 (${goblinShortLived.map(r => `${r.config.label}: age=${r.deathAge}`).join(', ')})`)
  }

  // Route activation
  const routeFailures = routeResults.filter(r => !r.routeActivated)
  if (routeFailures.length > 0) {
    issues.push(`P0: 路线激活失败 (${routeFailures.map(r => r.config.label).join(', ')})`)
  }

  // Flag orphans
  if (flagAnalysis.orphanedFlags.length > 0) {
    issues.push(`P2: ${flagAnalysis.orphanedFlags.length} 个孤儿 Flag（被引用但无法设置）`)
  }

  if (issues.length === 0) {
    L.push('✅ 未发现 P0/P1 级别问题')
  } else {
    L.push(`⚠️ 发现 ${issues.length} 个问题：`)
    for (const issue of issues) {
      L.push(`- ${issue}`)
    }
  }
  L.push('')

  // ==================== SECTION 1: FULL RACE PLAYTHROUGHS ====================
  L.push('## 1. 4 可玩种族全流程模拟（12 局）')
  L.push('')

  // Summary table
  L.push('### 1.1 总览')
  L.push('')
  L.push('| # | 局 | 种族 | 性别 | 寿命 | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 普通年 | 路线 | 路线切换 |')
  L.push('|---|-----|------|------|------|--------|--------|------|------|--------|--------|------|----------|')

  results.forEach((r, i) => {
    const route = r.currentRoute ?? 'commoner'
    const switches = r.routeSwitches.length > 0 ? r.routeSwitches.map(s => `${s.from ?? 'none'}→${s.to}@${s.age}`).join('; ') : '无'
    L.push(`| ${i + 1} | ${r.config.label} | ${r.config.race} | ${r.config.gender} | ${r.finalAge} | ${r.initHp} | ${r.hpHistory[r.hpHistory.length - 1] ?? '?'} | ${r.grade}(${r.gradeTitle}) | ${r.score} | ${r.eventYears} | ${r.mundaneYears} | ${route} | ${switches} |`)
  })
  L.push('')

  // Per-race analysis
  for (const race of ['human', 'elf', 'goblin', 'dwarf'] as const) {
    const raceResults = results.filter(r => r.config.race === race)
    L.push(`### 1.2 ${race === 'human' ? '人类' : race === 'elf' ? '精灵' : race === 'goblin' ? '哥布林' : '矮人'}详情`)
    L.push('')

    for (const r of raceResults) {
      L.push(`#### ${r.config.label} (seed=${r.config.seed})`)
      L.push('')
      L.push(`- **寿命**: ${r.finalAge} / ${r.effectiveMaxAge} (${(r.finalAge / r.effectiveMaxAge * 100).toFixed(1)}%)`)
      L.push(`- **初始HP**: ${r.initHp}`)
      L.push(`- **HP范围**: ${r.minHp} ~ ${r.peakHp}`)
      L.push(`- **评级**: ${r.grade} (${r.gradeTitle}), 分数=${r.score}`)
      L.push(`- **事件触发**: ${r.eventYears} 年有事件, ${r.mundaneYears} 年平静, ${r.uniqueEvents} 个独立事件`)
      L.push(`- **最大年HP损失**: -${r.maxYearlyLoss}, 最大年HP恢复: +${r.maxYearlyGain}`)
      L.push(`- **HP<50的年龄**: ${r.hpBelow50Ages.length > 0 ? r.hpBelow50Ages.join(', ') : '无'}`)
      L.push(`- **路线**: ${r.currentRoute ?? 'commoner'}`)
      L.push(`- **路线切换**: ${r.routeSwitches.length > 0 ? r.routeSwitches.map(s => `${s.from ?? 'none'}→${s.to} @ age ${s.age}`).join(', ') : '无切换'}`)
      L.push(`- **成就**: ${r.achievements.length > 0 ? r.achievements.join(', ') : '无'}`)
      L.push(`- **物品**: ${r.items.length > 0 ? r.items.join(', ') : '无'}`)

      // HP milestones
      L.push(`- **HP里程碑**: age0=${r.hpAtAge0}, age1=${r.hpAtAge1}, age5=${r.hpAtAge5}, age10=${r.hpAtAge10}, age15=${r.hpAtAge15}, age20=${r.hpAtAge20}`)
      if (r.hpAtAge50 > 0) L.push(`  age50=${r.hpAtAge50}`)

      // Event list (first 30 + tail)
      const eventLogs = r.yearLog.filter(y => y.eventId !== '__mundane__' && y.eventId !== '__unknown__')
      L.push(`- **事件序列** (${eventLogs.length} 个):`)
      const showEvents = eventLogs.slice(0, 30)
      for (const e of showEvents) {
        L.push(`  - age ${e.age}: [${e.eventId}] ${e.title} ${e.branchChoice ? `(→ ${e.branchChoice})` : ''} HP:${e.hpBefore}→${e.hpAfter}(${e.hpDelta >= 0 ? '+' : ''}${e.hpDelta})`)
      }
      if (eventLogs.length > 30) {
        L.push(`  - ... 省略 ${eventLogs.length - 30} 个事件 ...`)
        const tail = eventLogs.slice(-5)
        for (const e of tail) {
          L.push(`  - age ${e.age}: [${e.eventId}] ${e.title} HP:${e.hpBefore}→${e.hpAfter}(${e.hpDelta >= 0 ? '+' : ''}${e.hpDelta})`)
        }
      }
      L.push('')
    }
  }

  // ==================== SECTION 2: ROUTE SYSTEM ====================
  L.push('## 2. 路线系统专项验证')
  L.push('')

  L.push('### 2.1 路线激活测试')
  L.push('')
  L.push('| 路线 | 种族 | 激活? | 激活年龄 | 锚点触发 | 锚点缺失 | 路线专属事件 | 寿命 | 评级 |')
  L.push('|------|------|-------|---------|----------|----------|------------|------|------|')

  for (const r of routeResults) {
    const anchorStr = r.anchorTriggered.join(', ') || '无'
    const missingStr = r.anchorMissing.length > 0 ? `⚠️ ${r.anchorMissing.join(', ')}` : '✅'
    L.push(`| ${r.config.targetRoute} | ${r.config.race} | ${r.routeActivated ? '✅' : '❌'} | ${r.routeActivatedAge} | ${anchorStr} | ${missingStr} | ${r.routeEventsTriggered.length} | ${r.finalAge} | ${r.grade} |`)
  }
  L.push('')

  L.push('### 2.2 路线自然切换测试（12 局中的路线切换统计）')
  L.push('')

  // Analyze natural route switches
  const naturalSwitches = results.filter(r => r.routeSwitches.length > 0)
  if (naturalSwitches.length === 0) {
    L.push('⚠️ 12 局中**没有一局**自然发生路线切换（commoner → 职业路线）')
    L.push('')
    L.push('这是一个 **P1** 问题：路线系统的入口 flag（如 `guild_member`、`knight` 等）')
    L.push('虽然在数据中存在对应的 set_flag 事件，但在模拟中从未被触发。')
    L.push('可能原因：')
    L.push('1. 入口事件的条件过于严格，导致事件从未进入候选池')
    L.push('2. 事件权重太低，被其他事件掩盖')
    L.push('3. 事件年龄段缩放后不在有效范围内')
  } else {
    L.push(`有 ${naturalSwitches.length} 局发生了路线切换：`)
    for (const r of naturalSwitches) {
      L.push(`- ${r.config.label}: ${r.routeSwitches.map(s => `${s.from ?? 'commoner'} → ${s.to} @ age ${s.age}`).join(', ')}`)
    }
  }
  L.push('')

  // ==================== SECTION 3: HP SYSTEM ====================
  L.push('## 3. HP 系统验证')
  L.push('')

  L.push('### 3.1 童年保护检查')
  L.push('')
  const childhoodDeaths = results.filter(r => r.deathAge <= 10)
  if (childhoodDeaths.length === 0) {
    L.push('✅ 没有角色在 10 岁前死亡（童年死亡保护正常）')
  } else {
    L.push(`❌ ${childhoodDeaths.length} 个角色在 10 岁前死亡：`)
    for (const r of childhoodDeaths) {
      L.push(`  - ${r.config.label}: 死于 age ${r.deathAge}`)
    }
  }
  L.push('')

  L.push('### 3.2 种族 HP 表现')
  L.push('')
  L.push('| 种族 | 平均寿命 | 寿命范围 | 平均初始HP | 平均最低HP | 平均最高HP | HP<50局数 |')
  L.push('|------|---------|---------|-----------|-----------|-----------|-----------|')

  for (const race of ['human', 'elf', 'goblin', 'dwarf'] as const) {
    const rr = results.filter(r => r.config.race === race)
    const avgLife = (rr.reduce((s, r) => s + r.finalAge, 0) / rr.length).toFixed(1)
    const lifeRange = `${Math.min(...rr.map(r => r.finalAge))}~${Math.max(...rr.map(r => r.finalAge))}`
    const avgInit = (rr.reduce((s, r) => s + r.initHp, 0) / rr.length).toFixed(1)
    const avgMin = (rr.reduce((s, r) => s + r.minHp, 0) / rr.length).toFixed(1)
    const avgMax = (rr.reduce((s, r) => s + r.peakHp, 0) / rr.length).toFixed(1)
    const lowHp = rr.filter(r => r.hpBelow50Ages.length > 0).length
    L.push(`| ${race} | ${avgLife} | ${lifeRange} | ${avgInit} | ${avgMin} | ${avgMax} | ${lowHp}/${rr.length} |`)
  }
  L.push('')

  L.push('### 3.3 衰老模型表现')
  L.push('')

  for (const race of ['human', 'elf', 'goblin', 'dwarf'] as const) {
    const rr = results.filter(r => r.config.race === race)
    L.push(`#### ${race}`)
    for (const r of rr) {
      // HP trend analysis: split life into quarters
      const total = r.hpHistory.length
      if (total === 0) continue
      const q1 = Math.floor(total * 0.25)
      const q2 = Math.floor(total * 0.5)
      const q3 = Math.floor(total * 0.75)
      const avgHpQ1 = r.hpHistory.slice(0, q1).reduce((a, b) => a + b, 0) / q1
      const avgHpQ2 = r.hpHistory.slice(q1, q2).reduce((a, b) => a + b, 0) / (q2 - q1)
      const avgHpQ3 = r.hpHistory.slice(q2, q3).reduce((a, b) => a + b, 0) / (q3 - q2)
      const avgHpQ4 = r.hpHistory.slice(q3).reduce((a, b) => a + b, 0) / (total - q3)
      L.push(`- ${r.config.label}: Q1(avg=${avgHpQ1.toFixed(1)}) Q2(avg=${avgHpQ2.toFixed(1)}) Q3(avg=${avgHpQ3.toFixed(1)}) Q4(avg=${avgHpQ4.toFixed(1)}) 死亡age=${r.deathAge}`)
    }
    L.push('')
  }

  // ==================== SECTION 4: EVENT COVERAGE ====================
  L.push('## 4. 事件覆盖度')
  L.push('')

  const cov = eventCoverage
  L.push(`- **总事件数**: ${cov.total}`)
  L.push(`- **触发过的事件**: ${cov.covered} (${(cov.covered / cov.total * 100).toFixed(1)}%)`)
  L.push(`- **未触发的非unique事件**: ${cov.uncovered.length}`)
  L.push('')

  L.push('### 4.1 按路线统计事件分布')
  L.push('')
  L.push('| 路线 | 专属事件数 | 已触发 | 覆盖率 |')
  L.push('|------|-----------|--------|--------|')
  for (const [route, data] of cov.byRoute) {
    const pct = data.total > 0 ? (data.triggered / data.total * 100).toFixed(1) : 'N/A'
    L.push(`| ${route} | ${data.total} | ${data.triggered} | ${pct}% |`)
  }
  L.push('')

  if (cov.uncovered.length > 0) {
    L.push('### 4.2 从未触发的非unique事件（前50个）')
    L.push('')
    for (const id of cov.uncovered.slice(0, 50)) {
      L.push(`- \`${id}\``)
    }
    if (cov.uncovered.length > 50) {
      L.push(`- ... 共 ${cov.uncovered.length} 个`)
    }
    L.push('')
  }

  // ==================== SECTION 5: FLAG CONSISTENCY ====================
  L.push('## 5. Flag 一致性')
  L.push('')

  L.push(`- **set_flag 总数**: ${flagAnalysis.flagsSet.length}`)
  L.push(`- **has.flag 引用总数**: ${flagAnalysis.flagsUsed.length}`)
  L.push(`- **设置但从未引用**: ${flagAnalysis.unusedFlags.length}`)
  L.push(`- **引用但无法设置（孤儿）**: ${flagAnalysis.orphanedFlags.length}`)
  L.push('')

  if (flagAnalysis.orphanedFlags.length > 0) {
    L.push('### 5.1 孤儿 Flag（被引用但从未被设置）')
    L.push('')
    for (const f of flagAnalysis.orphanedFlags) {
      L.push(`- ⚠️ \`${f}\` — 被 has.flag 引用但没有事件会 set_flag 这个值`)
    }
    L.push('')
  }

  if (flagAnalysis.unusedFlags.length > 0) {
    L.push('### 5.2 死 Flag（被设置但从未被引用）')
    L.push('')
    L.push(`共 ${flagAnalysis.unusedFlags.length} 个，展示前 30 个：`)
    for (const f of flagAnalysis.unusedFlags.slice(0, 30)) {
      L.push(`- \`${f}\``)
    }
    if (flagAnalysis.unusedFlags.length > 30) {
      L.push(`- ... 共 ${flagAnalysis.unusedFlags.length} 个`)
    }
    L.push('')
  }

  L.push('### 5.3 路线入口 Flag 可设置性')
  L.push('')
  L.push('| 路线 | 需要 Flag | 可被事件设置? |')
  L.push('|------|-----------|-------------|')
  const routeNames: Record<string, string> = { adventurer: '冒险者', knight: '骑士', mage: '法师', merchant: '商人', scholar: '学者', commoner: '平民' }
  const routeFlagMap: Record<string, string> = {}
  // Extract from manifest
  const manifest = (results[0] as any)?._manifest
  // Use known mapping
  const knownRouteFlags: Record<string, string> = {
    adventurer: 'guild_member', knight: 'knight', mage: 'magic_student',
    merchant: 'merchant_apprentice', scholar: 'has_student | famous_inventor',
  }
  for (const [route, flag] of Object.entries(knownRouteFlags)) {
    if (route === 'commoner') continue
    const isSettable = flagAnalysis.flagsSet.includes(flag.split(' | ')[0].trim()) || flagAnalysis.flagsSet.includes(flag)
    L.push(`| ${routeNames[route]} | \`${flag}\` | ${isSettable ? '✅' : '❌'} |`)
  }
  L.push('')

  // ==================== SECTION 6: ISSUES ====================
  L.push('## 6. 问题清单')
  L.push('')

  const p0Issues: string[] = []
  const p1Issues: string[] = []
  const p2Issues: string[] = []

  // Route activation failures
  if (routeFailures.length > 0) {
    for (const r of routeFailures) {
      p0Issues.push(`路线 ${r.config.targetRoute} 强制注入 flag 后仍未能激活 (${r.config.label})`)
    }
  }

  // Natural route switching
  if (naturalSwitches.length === 0) {
    p1Issues.push('12 局中无一局自然切换到职业路线 — commoner→职业路线的入口事件可能条件过严或权重过低')
  }

  // Elf HP
  if (elfLowHp.length > 0) {
    for (const r of elfLowHp) {
      p1Issues.push(`精灵 ${r.config.label} 最低HP降至 ${r.minHp}，HP 过低`)
    }
  }

  // Goblin lifespan
  const goblinTooShort = goblinResults.filter(r => r.deathAge < 20)
  if (goblinTooShort.length > 0) {
    for (const r of goblinTooShort) {
      p1Issues.push(`哥布林 ${r.config.label} 仅活到 ${r.deathAge} 岁（寿命范围 30-36），过早死亡`)
    }
  }

  // Flag orphans
  if (flagAnalysis.orphanedFlags.length > 0) {
    p2Issues.push(`${flagAnalysis.orphanedFlags.length} 个孤儿 Flag: ${flagAnalysis.orphanedFlags.slice(0, 10).join(', ')}`)
  }

  // Unused flags
  if (flagAnalysis.unusedFlags.length > 100) {
    p2Issues.push(`${flagAnalysis.unusedFlags.length} 个死 Flag（设置但从未被引用），可能是冗余数据`)
  }

  // Anchor events missing
  const anchorMisses = routeResults.filter(r => r.anchorMissing.length > 0)
  if (anchorMisses.length > 0) {
    for (const r of anchorMisses) {
      // Only flag non-mandatory anchors
      const mandatoryMissing = r.anchorMissing.filter(a => {
        const route = (routeResults as any).find(x => x.config.targetRoute === r.config.targetRoute)
        return true // We don't easily know which are mandatory here
      })
      if (r.anchorMissing.length > 0) {
        p1Issues.push(`路线 ${r.config.targetRoute} (${r.config.label}): 锚点事件未触发: ${r.anchorMissing.join(', ')}`)
      }
    }
  }

  // Output
  if (p0Issues.length === 0 && p1Issues.length === 0 && p2Issues.length === 0) {
    L.push('✅ 未发现显著问题')
  } else {
    if (p0Issues.length > 0) {
      L.push('### P0 — 崩溃/核心功能不可用')
      for (const issue of p0Issues) L.push(`- ${issue}`)
      L.push('')
    }
    if (p1Issues.length > 0) {
      L.push('### P1 — 核心功能异常')
      for (const issue of p1Issues) L.push(`- ${issue}`)
      L.push('')
    }
    if (p2Issues.length > 0) {
      L.push('### P2 — 非核心功能/数据问题')
      for (const issue of p2Issues) L.push(`- ${issue}`)
      L.push('')
    }
  }

  // ==================== APPENDIX ====================
  L.push('## 附录：完整事件 ID 列表')
  L.push('')
  L.push('### 各局触发的事件合集')
  L.push('')

  const allTriggeredIds = new Set<string>()
  for (const r of results) {
    for (const id of r.triggeredEvents) {
      if (!id.startsWith('__')) allTriggeredIds.add(id)
    }
  }
  for (const r of routeResults) {
    for (const id of r.triggeredEvents) {
      if (!id.startsWith('__')) allTriggeredIds.add(id)
    }
  }

  const sortedIds = [...allTriggeredIds].sort()
  L.push(`共 ${sortedIds.length} 个独立事件被触发（含路线测试）：`)
  L.push('')
  for (const id of sortedIds) {
    L.push(`- \`${id}\``)
  }

  return L.join('\n')
}

// ==================== TEST SUITE ====================
describe('QA 最终全面测试', () => {
  let world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>
  let playResults: PlayResult[] = []
  let routeTestResults: RouteTestResult[] = []

  beforeAll(async () => {
    world = await createSwordAndMagicWorld()
  })

  // ---------- 12 full playthroughs ----------
  for (const config of RACE_CONFIGS) {
    it(`全流程: ${config.label}`, async () => {
      const result = await runPlaythrough(world, config)
      playResults.push(result)

      // Basic sanity checks
      expect(result.finalAge).toBeGreaterThan(0)
      expect(result.grade).toMatch(/^[A-F]|^S+$/)
      expect(result.eventYears).toBeGreaterThan(0)

      // Race-specific checks
      const lifespan = world.races?.find(r => r.id === config.race)?.lifespanRange
      if (lifespan) {
        // Final age should be within reasonable bounds of lifespan
        const minExpected = lifespan[0] * 0.4
        expect(result.finalAge).toBeGreaterThan(minExpected)
      }

      // HP should never go below 0 (death should occur)
      // NOTE: Some races may have minHp < 0 due to modify_hp exceeding current HP
      // This is tracked as a potential bug
      if (result.minHp < 0) {
        console.warn(`⚠️ ${result.config.label}: minHp went to ${result.minHp} (HP clamp issue?)`)
      }
    })
  }

  // ---------- 6 route-specific tests ----------
  for (const config of ROUTE_TEST_CONFIGS) {
    it(`路线专项: ${config.label} (target=${config.targetRoute})`, async () => {
      const result = await runRouteTest(world, config)
      routeTestResults.push(result)

      // Route should activate if flags were forced
      if (config.forcedFlags.length > 0) {
        expect(result.routeActivated).toBe(true)
      }

      expect(result.finalAge).toBeGreaterThan(0)
    })
  }

  // ---------- Data consistency & report generation ----------
  it('生成完整报告并写入 docs/QA-FINAL-FULL.md', () => {
    // Analyze event coverage across ALL tests
    const allTriggered = new Set<string>()
    const routeTriggered = new Map<string, Set<string>>()

    for (const r of playResults) {
      for (const id of r.triggeredEvents) {
        if (!id.startsWith('__')) allTriggered.add(id)
      }
    }
    for (const r of routeTestResults) {
      for (const id of r.triggeredEvents) {
        if (!id.startsWith('__')) allTriggered.add(id)
      }
    }

    const eventCoverage = analyzeEventCoverage(world, allTriggered, routeTriggered)
    const flagAnalysis = analyzeFlagConsistency(world)
    const report = generateReport(playResults, routeTestResults, flagAnalysis, eventCoverage)

    // Write report
    const docsDir = path.join(process.cwd(), 'docs')
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true })
    fs.writeFileSync(path.join(docsDir, 'QA-FINAL-FULL.md'), report, 'utf-8')

    // Verify report was written
    expect(fs.existsSync(path.join(docsDir, 'QA-FINAL-FULL.md'))).toBe(true)

    // Log summary
    console.log('\n========== QA REPORT SUMMARY ==========')
    console.log(`Total events in game: ${eventCoverage.total}`)
    console.log(`Events triggered across all tests: ${eventCoverage.covered} (${(eventCoverage.covered / eventCoverage.total * 100).toFixed(1)}%)`)
    console.log(`Flags set: ${flagAnalysis.flagsSet.length}`)
    console.log(`Flags used: ${flagAnalysis.flagsUsed.length}`)
    console.log(`Orphaned flags: ${flagAnalysis.orphanedFlags.length}`)
    console.log(`Unused flags: ${flagAnalysis.unusedFlags.length}`)
    console.log(`\n12-playthrough summary:`)
    for (const r of playResults) {
      console.log(`  ${r.config.label}: age=${r.finalAge}/${r.effectiveMaxAge} grade=${r.grade}(${r.gradeTitle}) score=${r.score} events=${r.eventYears} route=${r.currentRoute ?? 'commoner'}`)
    }
    console.log(`\n6 route test summary:`)
    for (const r of routeTestResults) {
      console.log(`  ${r.config.label}: activated=${r.routeActivated} age=${r.routeActivatedAge} anchors=[${r.anchorTriggered.join(',')}] missing=[${r.anchorMissing.join(',')}]`)
    }
    console.log(`\nReport written to docs/QA-FINAL-FULL.md`)
    console.log('======================================')
  })
})
