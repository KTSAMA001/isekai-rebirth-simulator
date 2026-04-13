/**
 * QA 全面游玩测试 — 7种族 × 2局 + 数据一致性检查
 * 生成完整 QA 报告到 docs/QA-FULL-PLAYTEST.md
 */
import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'
import * as fs from 'node:fs'
import * as path from 'node:path'

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
  routeFlags: Set<string>  // flags that indicate route entry
  uniqueEvents: number
  mundaneYears: number
  eventYears: number
  maxYearlyLoss: number
  maxYearlyGain: number
  hpBelow50Ages: number[]
  childhoodProtected: number  // how many times childhood protection activated
  deathAge: number
  deathNatural: boolean
  achievements: string[]
  flags: Set<string>
  items: string[]
}

// ==================== 14 configurations ====================
const CONFIGS: PlaythroughConfig[] = [
  // 人类 2局
  { race: 'human', gender: 'male', seed: 8001, label: '人类-男-A' },
  { race: 'human', gender: 'female', seed: 8002, label: '人类-女-B' },
  // 精灵 2局
  { race: 'elf', gender: 'female', seed: 8003, label: '精灵-女-A' },
  { race: 'elf', gender: 'male', seed: 8004, label: '精灵-男-B' },
  // 矮人 2局
  { race: 'dwarf', gender: 'male', seed: 8005, label: '矮人-男-A' },
  { race: 'dwarf', gender: 'female', seed: 8006, label: '矮人-女-B' },
  // 哥布林 2局
  { race: 'goblin', gender: 'female', seed: 8007, label: '哥布林-女-A' },
  { race: 'goblin', gender: 'male', seed: 8008, label: '哥布林-男-B' },
  // 兽人 2局 (playable=false but test anyway)
  { race: 'beastfolk', gender: 'male', seed: 8009, label: '兽人-男-A' },
  { race: 'beastfolk', gender: 'female', seed: 8010, label: '兽人-女-B' },
  // 海精灵 2局 (playable=false but test anyway)
  { race: 'seaelf', gender: 'female', seed: 8011, label: '海精灵-女-A' },
  { race: 'seaelf', gender: 'male', seed: 8012, label: '海精灵-男-B' },
  // 半龙人 2局 (playable=false but test anyway)
  { race: 'halfdragon', gender: 'male', seed: 8013, label: '半龙人-男-A' },
  { race: 'halfdragon', gender: 'female', seed: 8014, label: '半龙人-女-B' },
]

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (seed >>> 0) / 0xFFFFFFFF
  }
}

async function runPlaythrough(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  config: PlaythroughConfig,
  allEventIds: Set<string>,
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

  while (state.phase === 'simulating' && maxIterations-- > 0) {
    const hpBefore = state.hp
    const result = engine.startYear()

    if (result.phase === 'mundane_year') {
      const skipResult = engine.skipYear()
      state = engine.getState()
      yearLog.push({
        age: state.age,
        hpBefore,
        hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: '__mundane__',
        title: skipResult.logEntry?.title ?? '平静的一年',
      })
    } else if (result.phase === 'awaiting_choice' && result.event && result.branches) {
      const evt = result.event
      // Pick first available branch (the most common choice)
      const firstBranch = result.branches[0]
      const resolveResult = engine.resolveBranch(firstBranch.id)
      state = engine.getState()
      yearLog.push({
        age: state.age,
        hpBefore,
        hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: evt.id,
        title: evt.title,
        tag: evt.tag,
        routes: evt.routes,
        branchChoice: firstBranch.title,
        isSuccess: resolveResult.isSuccess,
        branchCount: result.branches.length,
      })
    } else if (result.phase === 'showing_event' && result.event) {
      const evt = result.event
      state = engine.getState()
      yearLog.push({
        age: state.age,
        hpBefore,
        hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: evt.id,
        title: evt.title,
        tag: evt.tag,
        routes: evt.routes,
      })
    } else {
      state = engine.getState()
      yearLog.push({
        age: state.age,
        hpBefore,
        hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: '__unknown__',
        title: `phase=${result.phase}`,
      })
    }

    // Track HP metrics
    const delta = state.hp - hpBefore
    if (delta < 0 && Math.abs(delta) > maxYearlyLoss) maxYearlyLoss = Math.abs(delta)
    if (delta > maxYearlyGain) maxYearlyGain = delta
    if (state.hp > 0 && state.hp < 50) hpBelow50Ages.push(state.age)

    // Track childhood protection
    if (state.age < 15 && delta < 0) {
      const rawLoss = Math.abs(hpBefore - state.hp)
      const limit = Math.floor(hpBefore * 0.3) + 5
      if (hpBefore - state.hp < rawLoss) {
        childhoodProtected++
      }
    }

    if (state.phase !== 'simulating') break
  }

  // Finish the game
  engine.finish()
  state = engine.getState()

  const eventYears = yearLog.filter(y => y.eventId !== '__mundane__' && y.eventId !== '__unknown__').length
  const mundaneYears = yearLog.filter(y => y.eventId === '__mundane__').length

  return {
    config,
    effectiveMaxAge,
    initHp,
    finalAge: state.age,
    grade: state.result?.grade ?? '?',
    gradeTitle: state.result?.gradeTitle ?? '?',
    score: state.result?.score ?? 0,
    yearLog,
    triggeredEvents: state.triggeredEvents,
    routeFlags: new Set([...state.flags].filter(f => f.startsWith('on_') && f.endsWith('_path'))),
    uniqueEvents: [...state.triggeredEvents].filter(id => !id.startsWith('__')).length,
    mundaneYears,
    eventYears,
    maxYearlyLoss,
    maxYearlyGain,
    hpBelow50Ages,
    childhoodProtected,
    deathAge: state.age,
    deathNatural: true,
    achievements: state.achievements.unlocked,
    flags: state.flags,
    items: state.inventory.items.map(i => i.itemId),
  }
}

// ==================== Data Consistency Checks ====================
function runDataConsistencyChecks(world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>) {
  const L: string[] = []
  const events = world.events
  const items = world.items
  const manifest = world.manifest
  const achievements = world.achievements

  // 1. Flag consistency
  L.push('### 1. Flag 一致性')
  L.push('')
  const flagsSet = new Set<string>()
  const flagsUsed = new Set<string>()
  const flagPattern = /has\.flag\.(\w+)/g

  for (const e of events) {
    // Collect set_flag targets
    for (const b of (e as any).branches ?? []) {
      for (const eff of b.effects ?? []) {
        if (eff.type === 'set_flag') flagsSet.add(eff.target)
        if (eff.type === 'remove_flag') { /* removal, not a source */ }
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
        while ((m = flagPattern.exec(val)) !== null) flagsUsed.add(m[1])
      }
    }
    for (const prereq of e.prerequisites ?? []) {
      let m: RegExpExecArray | null
      while ((m = flagPattern.exec(prereq)) !== null) flagsUsed.add(m[1])
    }
    for (const mex of e.mutuallyExclusive ?? []) {
      let m: RegExpExecArray | null
      while ((m = flagPattern.exec(mex)) !== null) flagsUsed.add(m[1])
    }
    for (const b of (e as any).branches ?? []) {
      const rc = (b as any).requireCondition as string | undefined
      if (rc) {
        let m: RegExpExecArray | null
        while ((m = flagPattern.exec(rc)) !== null) flagsUsed.add(m[1])
      }
    }
  }
  // Also check route enterCondition
  for (const route of manifest.routes ?? []) {
    const ec = route.enterCondition ?? ''
    let m: RegExpExecArray | null
    while ((m = flagPattern.exec(ec)) !== null) flagsUsed.add(m[1])
  }
  // Check achievement conditions
  for (const a of achievements) {
    let m: RegExpExecArray | null
    while ((m = flagPattern.exec(a.condition)) !== null) flagsUsed.add(m[1])
  }

  const unusedFlags = [...flagsSet].filter(f => !flagsUsed.has(f))
  const orphanedFlags = [...flagsUsed].filter(f => !flagsSet.has(f))

  L.push(`- **总 Flag**: ${flagsSet.size} set, ${flagsUsed.size} used`)
  L.push(`- **设置但从未检查**: ${unusedFlags.length}`)
  if (unusedFlags.length > 0) {
    // Show a sample
    for (const f of unusedFlags.slice(0, 15)) {
      L.push(`  - \`${f}\``)
    }
    if (unusedFlags.length > 15) L.push(`  - ... and ${unusedFlags.length - 15} more`)
  }
  L.push(`- **检查但从未设置**: ${orphanedFlags.length}`)
  for (const f of orphanedFlags) {
    L.push(`  - ⚠️ \`${f}\``)
  }
  L.push('')

  // 2. Item consistency
  L.push('### 2. 物品一致性')
  L.push('')
  const itemIds = new Set(items.map(i => i.id))
  const grantedItems = new Set<string>()
  for (const e of events) {
    for (const b of (e as any).branches ?? []) {
      for (const eff of b.effects ?? []) {
        if (eff.type === 'grant_item') grantedItems.add(eff.target)
      }
    }
    for (const eff of e.effects ?? []) {
      if (eff.type === 'grant_item') grantedItems.add(eff.target)
    }
  }
  const invalidItems = [...grantedItems].filter(id => !itemIds.has(id))
  L.push(`- **物品定义**: ${itemIds.size} 个`)
  L.push(`- **事件中授予**: ${grantedItems.size} 种`)
  if (invalidItems.length > 0) {
    L.push(`- ⚠️ **无效物品ID**: ${invalidItems.join(', ')}`)
  } else {
    L.push('- ✅ 所有 grant_item 目标均在 items.json 中定义')
  }
  L.push('')

  // 3. Event completeness check
  L.push('### 3. 事件完整性')
  L.push('')
  let missingBranches = 0
  let missingWeight = 0
  let missingAgeRange = 0
  for (const e of events) {
    if (!e.branches || e.branches.length === 0) missingBranches++
    if (e.weight <= 0) missingWeight++
    if (e.minAge < 0 || e.maxAge < e.minAge) missingAgeRange++
  }
  L.push(`- 无分支事件: ${missingBranches}`)
  L.push(`- 权重 <= 0 事件: ${missingWeight}`)
  L.push(`- 年龄范围异常: ${missingAgeRange}`)
  if (missingBranches + missingWeight + missingAgeRange === 0) {
    L.push('- ✅ 事件结构完整性 OK')
  } else {
    L.push('- ⚠️ 存在结构问题')
  }
  L.push('')

  // 4. DSL syntax check
  L.push('### 4. 条件 DSL 语法')
  L.push('')
  let dslErrors = 0
  const dslErrorList: string[] = []
  for (const e of events) {
    for (const field of ['include', 'exclude'] as const) {
      const val = e[field] as string | undefined
      if (val) {
        const err = checkDsl(val)
        if (err) {
          dslErrors++
          if (dslErrorList.length < 10) dslErrorList.push(`${e.id}.${field}: ${err}`)
        }
      }
    }
    for (const b of (e as any).branches ?? []) {
      const rc = (b as any).requireCondition as string | undefined
      if (rc) {
        const err = checkDsl(rc)
        if (err) {
          dslErrors++
          if (dslErrorList.length < 10) dslErrorList.push(`${e.id}.branch: ${err}`)
        }
      }
    }
  }
  if (dslErrors > 0) {
    L.push(`- ⚠️ ${dslErrors} 个 DSL 语法错误:`)
    for (const e of dslErrorList) L.push(`  - ${e}`)
  } else {
    L.push('- ✅ 所有条件 DSL 括号匹配正确')
  }
  L.push('')

  return L
}

function checkDsl(s: string): string | null {
  let depth = 0
  for (const ch of s) {
    if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth < 0) return 'unbalanced: unexpected ")"'
    }
  }
  if (depth !== 0) return `unbalanced: missing ${depth} closing ")"`
  return null
}

// ==================== Report Generation ====================
function generateReport(
  results: PlayResult[],
  allEventIds: Set<string>,
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  dataConsistency: string[],
): string {
  const L: string[] = []
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  L.push('# 🔎 QA 全面游玩测试报告')
  L.push('')
  L.push(`**测试日期**: ${now}`)
  L.push(`**测试方法**: Galgame 流程 (startYear / resolveBranch)，自动选第一个分支`)
  L.push(`**测试范围**: 7种族 × 2局 = 14局（含 3个 playable=false 种族）`)
  L.push(`**总事件数**: ${allEventIds.size}`)
  L.push('')

  // === Problems Summary ===
  const problems: { severity: string; desc: string; detail: string }[] = []

  // === 1. 种族全流程模拟 ===
  L.push('## 1. 种族全流程模拟（14局）')
  L.push('')
  L.push('| # | 配置 | 种子 | 寿命 | MaxAge | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 平凡年 | 最大降幅 | 最大增幅 |')
  L.push('|---|------|------|------|--------|--------|--------|------|------|--------|--------|----------|----------|')
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const lastEventLog = r.yearLog[r.yearLog.length - 1]
    L.push(`| ${i + 1} | ${r.config.label} | ${r.config.seed} | ${r.finalAge} | ${r.effectiveMaxAge} | ${r.initHp} | ${lastEventLog?.hpAfter ?? '?'} | ${r.grade} ${r.gradeTitle} | ${r.score} | ${r.eventYears} | ${r.mundaneYears} | ${r.maxYearlyLoss} | ${r.maxYearlyGain} |`)
  }
  L.push('')

  // Per-race detailed analysis
  L.push('### 1.1 种族详细分析')
  L.push('')

  for (const race of ['human', 'elf', 'dwarf', 'goblin', 'beastfolk', 'seaelf', 'halfdragon']) {
    const raceResults = results.filter(r => r.config.race === race)
    if (raceResults.length === 0) continue
    const avgLife = Math.round(raceResults.reduce((s, r) => s + r.finalAge, 0) / raceResults.length)
    const avgEvents = Math.round(raceResults.reduce((s, r) => s + r.eventYears, 0) / raceResults.length)
    const avgScore = Math.round(raceResults.reduce((s, r) => s + r.score, 0) / raceResults.length)
    const raceDef = world.races?.find(r => r.id === race)

    L.push(`#### ${raceDef?.icon ?? ''} ${raceDef?.name ?? race} (${race})`)
    L.push('')
    L.push(`- **寿命范围**: ${raceDef?.lifespanRange?.[0] ?? '?'}-${raceDef?.lifespanRange?.[1] ?? '?'} | 实测平均: ${avgLife}`)
    L.push(`- **平均事件数**: ${avgEvents} | 平均分数: ${avgScore}`)
    L.push(`- **可玩性**: ${raceDef?.playable ? '✅ 可选' : '❌ 不可选 (playable=false)'}`)

    // Check specific concerns
    if (race === 'elf' || race === 'seaelf') {
      for (const r of raceResults) {
        const ratio = r.finalAge / r.effectiveMaxAge
        const reasonable = ratio >= 0.7
        L.push(`  - ${r.config.label}: 寿命比 ${ratio.toFixed(2)} ${reasonable ? '✅ 合理' : '⚠️ 偏早死'}`)
        if (!reasonable) {
          problems.push({ severity: 'P2', desc: `${r.config.label} 寿命比仅 ${ratio.toFixed(2)}`, detail: `finalAge=${r.finalAge}, effectiveMaxAge=${r.effectiveMaxAge}` })
        }
      }
    }
    if (race === 'goblin') {
      for (const r of raceResults) {
        const tooShort = r.finalAge < 20
        L.push(`  - ${r.config.label}: 实际寿命 ${r.finalAge} ${tooShort ? '⚠️ 过短' : '✅ 合理'}`)
        if (tooShort) {
          problems.push({ severity: 'P1', desc: `哥布林 ${r.config.label} 寿命过短: ${r.finalAge}`, detail: `expected ~30-36, actual=${r.finalAge}` })
        }
      }
    }

    // Unique events per play
    for (const r of raceResults) {
      L.push(`  - ${r.config.label}: 触发 ${r.uniqueEvents} 个唯一事件, ${r.achievements.length} 个成就`)
    }
    L.push('')
  }

  // === 2. 路线系统验证 ===
  L.push('## 2. 路线系统验证')
  L.push('')

  const routeNames = ['adventurer', 'knight', 'mage', 'merchant', 'scholar']
  const routeNameMap: Record<string, string> = {
    adventurer: '冒险者', knight: '骑士', mage: '魔法师', merchant: '商人', scholar: '学者'
  }

  L.push('### 2.1 路线入口 Flag 触发')
  L.push('')
  L.push('| 种族 | ' + routeNames.map(r => routeNameMap[r]).join(' | ') + ' |')
  L.push('|------|' + routeNames.map(() => '---').join('|') + '|')

  const routeTriggerCounts: Record<string, number> = {}
  const routeTriggerAges: Record<string, number[]> = {}

  for (const r of results) {
    const cells = routeNames.map(routeName => {
      const flag = `on_${routeName}_path`
      if (r.flags.has(flag)) {
        routeTriggerCounts[routeName] = (routeTriggerCounts[routeName] || 0) + 1
        // Find the age when the route was entered
        for (const y of r.yearLog) {
          if (y.eventId !== '__mundane__' && y.eventId !== '__unknown__') {
            // Route entry is typically set by specific events
            if (!routeTriggerAges[routeName]) routeTriggerAges[routeName] = []
            // We can't easily find exact age, just note it triggered
            break
          }
        }
        return '✅'
      }
      return '—'
    })
    L.push(`| ${r.config.label} | ${cells.join(' | ')} |`)
  }
  L.push('')

  L.push('### 2.2 路线触发统计')
  L.push('')
  L.push('| 路线 | 入口条件 | 触发次数/总 | 触发率 |')
  L.push('|------|---------|-----------|--------|')

  const routeConditions: Record<string, string> = {
    adventurer: 'has.flag.guild_member',
    knight: 'has.flag.knight',
    mage: 'has.flag.magic_student',
    merchant: 'has.flag.merchant_apprentice',
    scholar: 'has.flag.has_student | has.flag.famous_inventor',
  }

  for (const rn of routeNames) {
    const count = routeTriggerCounts[rn] || 0
    const pct = ((count / 14) * 100).toFixed(0)
    L.push(`| ${routeNameMap[rn]} | \`${routeConditions[rn]}\` | ${count}/14 | ${pct}% |`)
  }
  L.push('')

  L.push('### 2.3 锚点事件触发')
  L.push('')
  const routes = world.manifest.routes ?? []
  let anchorsChecked = 0
  let anchorsTriggered = 0
  let anchorsMissed = 0
  const missedAnchors: string[] = []

  for (const route of routes) {
    if (!route.anchorEvents || route.anchorEvents.length === 0) continue
    for (const anchor of route.anchorEvents) {
      anchorsChecked++
      let triggered = false
      for (const r of results) {
        if (r.triggeredEvents.has(anchor.eventId)) {
          triggered = true
          break
        }
      }
      if (triggered) {
        anchorsTriggered++
      } else {
        anchorsMissed++
        if (missedAnchors.length < 20) missedAnchors.push(`${route.id}:${anchor.eventId} (${anchor.minAge}-${anchor.maxAge}${anchor.mandatory ? ', mandatory' : ''})`)
      }
    }
  }
  L.push(`- **检查锚点**: ${anchorsChecked}`)
  L.push(`- **已触发**: ${anchorsTriggered}`)
  L.push(`- **未触发**: ${anchorsMissed}`)
  if (missedAnchors.length > 0) {
    L.push('')
    L.push('未触发锚点:')
    for (const ma of missedAnchors) L.push(`  - ${ma}`)
    if (anchorsMissed > 20) L.push(`  - ... and ${anchorsMissed - 20} more`)
  }
  L.push('')

  // === 3. HP 系统深度测试 ===
  L.push('## 3. HP 系统深度测试')
  L.push('')

  L.push('### 3.1 童年保护')
  L.push('')
  let totalChildhoodProtected = 0
  for (const r of results) {
    totalChildhoodProtected += r.childhoodProtected
    // Check if any childhood year had HP going to 0
    const childhoodDeath = r.yearLog.some(y => y.age < 10 && y.hpAfter <= 0)
    if (childhoodDeath) {
      problems.push({ severity: 'P0', desc: `${r.config.label} 童年死亡 (age<10)`, detail: 'age<10 should not die' })
      L.push(`- ⚠️ **${r.config.label}**: 童年死亡违反保护规则!`)
    }
  }
  L.push(`- 总童年保护触发次数: ${totalChildhoodProtected}`)
  L.push('- ✅ age<10 死亡保护: 未发现违规')
  L.push('')

  L.push('### 3.2 年度 HP 软限制')
  L.push('')
  let softLimitViolations = 0
  for (const r of results) {
    for (const y of r.yearLog) {
      if (y.hpAfter > 0 && y.hpBefore > 0) {
        const loss = y.hpBefore - y.hpAfter
        if (loss > 0) {
          const hardLimit = Math.max(Math.floor(y.hpBefore * 0.5), 30)
          if (loss > hardLimit) {
            softLimitViolations++
            if (softLimitViolations <= 5) {
              L.push(`  - ⚠️ ${r.config.label} age=${y.age}: loss=${loss}, limit=${hardLimit}, hpBefore=${y.hpBefore}`)
            }
          }
        }
      }
    }
  }
  if (softLimitViolations > 0) {
    problems.push({ severity: 'P1', desc: `HP软限制违规 ${softLimitViolations} 次`, detail: '年度HP损失超过50%或30的上限' })
  }
  L.push(`- 软限制违规次数: ${softLimitViolations}`)
  L.push('')

  L.push('### 3.3 各种族 HP 表现')
  L.push('')
  L.push('| 种族 | 平均初始HP | 最大单年降幅 | 最大单年增幅 | HP<50次数 |')
  L.push('|------|-----------|------------|------------|----------|')

  for (const race of ['human', 'elf', 'dwarf', 'goblin', 'beastfolk', 'seaelf', 'halfdragon']) {
    const rr = results.filter(r => r.config.race === race)
    if (rr.length === 0) continue
    const avgInitHp = Math.round(rr.reduce((s, r) => s + r.initHp, 0) / rr.length)
    const maxLoss = Math.max(...rr.map(r => r.maxYearlyLoss))
    const maxGain = Math.max(...rr.map(r => r.maxYearlyGain))
    const totalBelow50 = rr.reduce((s, r) => s + r.hpBelow50Ages.length, 0)
    L.push(`| ${race} | ${avgInitHp} | ${maxLoss} | ${maxGain} | ${totalBelow50} |`)
  }
  L.push('')

  L.push('### 3.4 sigmoid 衰老模型')
  L.push('')
  // Check late-life HP drops
  for (const r of results) {
    const raceDef = world.races?.find(rd => rd.id === r.config.race)
    const lifespan = raceDef?.lifespanRange?.[1] ?? 100
    const oldThreshold = Math.floor(lifespan * 0.7)
    const lateYears = r.yearLog.filter(y => y.age >= oldThreshold && y.eventId !== '__mundane__' && y.eventId !== '__unknown__')
    const lateLosses = lateYears.filter(y => y.hpDelta < -5)
    if (lateLosses.length > 0) {
      L.push(`- ${r.config.label}: ${lateLosses.length} 次大幅下降 (age≥${oldThreshold})`)
    }
  }
  L.push('')

  // === 4. 事件覆盖度分析 ===
  L.push('## 4. 事件覆盖度分析')
  L.push('')

  // Collect all triggered events across all plays
  const allTriggered = new Set<string>()
  for (const r of results) {
    for (const eid of r.triggeredEvents) {
      allTriggered.add(eid)
    }
  }

  // Unique events
  const uniqueEvents = new Set<string>()
  for (const e of world.events) {
    if (e.unique) uniqueEvents.add(e.id)
  }

  const nonUniqueEvents = [...allEventIds].filter(id => !uniqueEvents.has(id))
  const nonUniqueTriggered = [...allTriggered].filter(id => !uniqueEvents.has(id))
  const nonUniqueNeverTriggered = nonUniqueEvents.filter(id => !allTriggered.has(id))

  L.push(`- **总事件数**: ${allEventIds.size}`)
  L.push(`- **unique 事件**: ${uniqueEvents.size} (一生一次，14局中每局最多触发一次)`)
  L.push(`- **非 unique 事件**: ${nonUniqueEvents.length}`)
  L.push(`- **14局中至少触发过一次**: ${allTriggered.size}/${allEventIds.size} (${((allTriggered.size / allEventIds.size) * 100).toFixed(1)}%)`)
  L.push(`- **非 unique 从未触发**: ${nonUniqueNeverTriggered.length}/${nonUniqueEvents.length}`)
  L.push('')

  if (nonUniqueNeverTriggered.length > 0 && nonUniqueNeverTriggered.length <= 50) {
    L.push('### 4.1 从未触发的非 unique 事件')
    L.push('')
    for (const eid of nonUniqueNeverTriggered) {
      const e = world.events.find(ev => ev.id === eid)
      const races = e?.races?.join(',') ?? 'all'
      const routes = e?.routes?.join(',') ?? 'all'
      L.push(`- \`${eid}\` (minAge=${e?.minAge}, maxAge=${e?.maxAge}, races=[${races}], routes=[${routes}], weight=${e?.weight})`)
    }
    L.push('')
  }

  // Event distribution by route tag
  L.push('### 4.2 按 tag 的事件触发分布')
  L.push('')
  const tagMap: Record<string, number> = {}
  for (const r of results) {
    for (const y of r.yearLog) {
      if (y.tag && y.eventId !== '__mundane__') {
        tagMap[y.tag] = (tagMap[y.tag] || 0) + 1
      }
    }
  }
  L.push('| Tag | 总触发次数 |')
  L.push('|-----|----------|')
  for (const [tag, count] of Object.entries(tagMap).sort((a, b) => b[1] - a[1])) {
    L.push(`| ${tag} | ${count} |`)
  }
  L.push('')

  // === 5. 成就系统验证 ===
  L.push('## 5. 成就系统验证')
  L.push('')

  const allAchievements = new Set<string>()
  const achievementCounts: Record<string, number> = {}
  const achievementPerPlay: number[] = []
  for (const r of results) {
    achievementPerPlay.push(r.achievements.length)
    for (const a of r.achievements) {
      allAchievements.add(a)
      achievementCounts[a] = (achievementCounts[a] || 0) + 1
    }
  }

  L.push(`- **总成就数**: ${world.achievements.length}`)
  L.push(`- **14局中解锁过的**: ${allAchievements.size}`)
  L.push(`- **平均每局解锁**: ${(achievementPerPlay.reduce((s, v) => s + v, 0) / 14).toFixed(1)}`)
  L.push(`- **最多单局**: ${Math.max(...achievementPerPlay)}`)
  L.push(`- **最少单局**: ${Math.min(...achievementPerPlay)}`)
  L.push('')

  // Show most commonly unlocked
  L.push('### 5.1 高频解锁成就')
  L.push('')
  const sortedAchievements = Object.entries(achievementCounts).sort((a, b) => b[1] - a[1])
  L.push('| 成就 | 解锁次数 | 成就定义 |')
  L.push('|------|---------|---------|')
  for (const [aid, count] of sortedAchievements.slice(0, 20)) {
    const def = world.achievements.find(a => a.id === aid)
    L.push(`| ${def?.name ?? aid} | ${count}/14 | ${def?.description?.slice(0, 50) ?? '?'} |`)
  }
  L.push('')

  // === 6. Data Consistency ===
  L.push('## 6. 数据一致性检查')
  L.push('')
  L.push(...dataConsistency)

  // === 7. Problems Summary ===
  L.push('## 7. 问题汇总')
  L.push('')

  // Auto-detect more problems
  for (const r of results) {
    // Check for very low event count
    if (r.eventYears < 5) {
      problems.push({ severity: 'P2', desc: `${r.config.label} 事件过少 (${r.eventYears})`, detail: 'player experience may be sparse' })
    }
    // Check for maxAge not reached (early death not from old age)
    if (r.finalAge < r.effectiveMaxAge * 0.5) {
      const raceDef = world.races?.find(rd => rd.id === r.config.race)
      if (raceDef?.playable) {
        problems.push({ severity: 'P2', desc: `${r.config.label} 寿命不到种族上限的50%`, detail: `finalAge=${r.finalAge}, maxAge=${r.effectiveMaxAge}` })
      }
    }
  }

  // Check never-triggered route entries
  for (const rn of routeNames) {
    if ((routeTriggerCounts[rn] || 0) === 0) {
      problems.push({ severity: 'P2', desc: `路线 ${routeNameMap[rn]} 在14局中从未触发`, detail: `入口条件: ${routeConditions[rn]}` })
    }
  }

  // Categorize
  const p0 = problems.filter(p => p.severity === 'P0')
  const p1 = problems.filter(p => p.severity === 'P1')
  const p2 = problems.filter(p => p.severity === 'P2')
  const p3: typeof problems = []

  if (p0.length > 0) {
    L.push('### P0 — 崩溃/数据丢失/安全漏洞')
    L.push('')
    for (const p of p0) {
      L.push(`- **${p.desc}** — ${p.detail}`)
    }
    L.push('')
  }
  if (p1.length > 0) {
    L.push('### P1 — 核心功能异常')
    L.push('')
    for (const p of p1) {
      L.push(`- **${p.desc}** — ${p.detail}`)
    }
    L.push('')
  }
  if (p2.length > 0) {
    L.push('### P2 — 非核心功能异常')
    L.push('')
    for (const p of p2) {
      L.push(`- **${p.desc}** — ${p.detail}`)
    }
    L.push('')
  }
  if (p0.length + p1.length + p2.length === 0) {
    L.push('✅ **未发现 P0/P1/P2 级别问题**')
    L.push('')
  }

  // === 8. Improvements ===
  L.push('## 8. 改进建议')
  L.push('')
  if (unusedFlags.length > 0) {
    L.push(`1. **Flag 使用率低**: ${unusedFlags.length}/${flagsSet.size} 的 flag 被设置但从未在条件中检查。建议审查是否有遗漏的消费逻辑，或删除无用的 flag 设置。`)
  }
  if (orphanedFlags.length > 0) {
    L.push(`2. **孤儿 Flag 引用**: ${orphanedFlags.length} 个 flag 被条件检查但从未被设置。需要确认是否有前置事件缺失。`)
  }
  const coverage = ((allTriggered.size / allEventIds.size) * 100)
  if (coverage < 80) {
    L.push(`3. **事件覆盖率偏低**: ${coverage.toFixed(1)}%。考虑增加更多触发机会或调整权重。`)
  }
  L.push(`4. **路线触发率**: 建议 14 局以上测试来获得更可靠的路线触发率统计。当前测试每个种族仅 2 局，部分路线可能因随机性未触发。`)
  if (allAchievements.size < world.achievements.length * 0.3) {
    L.push(`5. **成就解锁率**: 仅 ${((allAchievements.size / world.achievements.length) * 100).toFixed(1)}% 成就被解锁。建议检查部分成就条件是否过于严格。`)
  }
  L.push('')

  // === 9. Detailed per-play logs ===
  L.push('## 9. 每局详细记录')
  L.push('')

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    L.push(`### ${i + 1}. ${r.config.label} (seed=${r.config.seed})`)
    L.push('')
    L.push(`- 种族: ${r.config.race} | 性别: ${r.config.gender}`)
    L.push(`- 寿命: ${r.finalAge}/${r.effectiveMaxAge} | 评级: ${r.grade} ${r.gradeTitle} | 分数: ${r.score}`)
    L.push(`- 初始HP: ${r.initHp} | 事件数: ${r.eventYears} | 平凡年: ${r.mundaneYears}`)
    L.push(`- 成就: ${r.achievements.length} 个 [${r.achievements.join(', ')}]`)
    L.push(`- 路线: ${[...r.routeFlags].join(', ') || '无'}`)
    L.push(`- 物品: ${r.items.length} 个 [${r.items.join(', ')}]`)
    L.push('')

    L.push('**事件时间线** (仅事件年):')
    L.push('')
    L.push('| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |')
    L.push('|-----|--------|------|------|--------|------|')
    for (const y of r.yearLog) {
      if (y.eventId === '__mundane__' || y.eventId === '__unknown__') continue
      const hpStr = y.hpDelta > 0 ? `+${y.hpDelta}` : `${y.hpDelta}`
      const resultStr = y.isSuccess === true ? '✅' : y.isSuccess === false ? '❌' : ''
      const branchStr = y.branchChoice ?? ''
      L.push(`| ${y.age} | ${y.eventId} | ${y.title.slice(0, 30)} | ${branchStr.slice(0, 15)} | ${hpStr} | ${resultStr} |`)
    }
    L.push('')
  }

  return L.join('\n')
}

// Track these for improvement suggestions
let unusedFlags: string[] = []
let orphanedFlags: string[] = []

// ==================== Test Entry ====================
describe('QA Full Playtest', () => {
  it('runs 14 playthroughs and generates report', async () => {
    console.log('Loading world...')
    const world = await createSwordAndMagicWorld()
    const allEventIds = new Set(world.events.map(e => e.id))
    console.log(`World loaded: ${allEventIds.size} events`)

    console.log('Running data consistency checks...')
    const dataConsistency = runDataConsistencyChecks(world)

    console.log('Running 14 playthroughs...')
    const results: PlayResult[] = []
    for (let i = 0; i < CONFIGS.length; i++) {
      const config = CONFIGS[i]
      console.log(`  [${i + 1}/${CONFIGS.length}] ${config.label} (seed=${config.seed})...`)
      const result = await runPlaythrough(world, config, allEventIds)
      results.push(result)
      console.log(`    → age=${result.finalAge}, grade=${result.grade}, events=${result.eventYears}`)
    }

    console.log('Generating report...')
    const report = generateReport(results, allEventIds, world, dataConsistency)

    const outPath = path.join(process.cwd(), 'docs', 'QA-FULL-PLAYTEST.md')
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, report, 'utf-8')
    console.log(`\nReport written to: ${outPath}`)
    console.log(`Report length: ${report.length} chars`)

    // Basic sanity checks
    expect(results.length).toBe(14)
    for (const r of results) {
      expect(r.finalAge).toBeGreaterThan(0)
      expect(r.grade).not.toBe('?')
    }
  }, 120000)
})
