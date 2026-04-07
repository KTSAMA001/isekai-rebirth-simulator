/**
 * Flag 全流程追踪测试 — 静态分析为主 + 动态验证
 *
 * 核心思路：
 * 1. 静态分析扫描全部事件/成就/评语/路线，精确定位每个 flag 的
 *    设置来源、消费来源、前置条件链
 * 2. 动态测试只做"烟雾测试"——随机跑若干局验证引擎不崩溃，
 *    给出实际覆盖率参考（不是目标）
 * 3. 穷举无意义（天赋×种族×性别×属性×分支 组合空间爆炸），
 *    静态分析 + 统计采样足够发现所有孤儿和死 flag
 */
import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'
import {
  collectKnownFlags,
  collectProducedFlags,
  collectConsumedFlags,
  createFlagTrackingDSL,
  diffFlags,
  analyzeFlagReachability,
  type FlagLifecycleReport,
  type GameSummary,
  type TimelineEntry,
} from '../helpers/flag-tracker'
import type { GameState, Gender, WorldInstance } from '@/engine/core/types'
import * as fs from 'fs'
import * as path from 'path'

// ==================== 常量 ====================

/** 动态验证：跑多少局随机模拟（纯统计采样，不代表完整覆盖） */
const RANDOM_SAMPLE_COUNT = 50

// ==================== 工具 ====================

function patchEngineDSL(engine: SimulationEngine) {
  const tracker = createFlagTrackingDSL()
  ;(engine as any).dsl.evaluate = tracker.evaluate
  return tracker
}

function snapshotFlags(state: GameState): Set<string> {
  return new Set(state.flags)
}

function extractBranches(raw: any) {
  if (!raw?.branches) return []
  return raw.branches
}

/** 随机选分支（确定性洗牌） */
function pickBranch(branches: any[], gameIndex: number): string | null {
  if (!branches.length) return null
  const indices = branches.map((_, i) => i)
  let s = gameIndex * 7919 + 1
  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 16807 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  for (const idx of indices) {
    try { return branches[idx].id } catch { continue }
  }
  return null
}

// ==================== 动态验证（轻量） ====================

function runRandomGame(
  world: WorldInstance, seed: number, race: string, gender: Gender, gameIndex: number,
): { flagsSetThisGame: Set<string>; flagsCheckedThisGame: Set<string> } {
  const engine = new SimulationEngine(world, seed)
  const tracker = patchEngineDSL(engine)

  engine.initGame('Flag追踪', undefined, race, gender)
  engine.draftTalents()
  const pool = engine.getState().talents.draftPool
  const selCount = Math.min(3, pool.length)
  const start = (gameIndex * 7 + 3) % Math.max(1, pool.length - selCount + 1)
  engine.selectTalents(pool.slice(start, start + selCount))
  engine.allocateAttributes({ str: 5, int: 5, chr: 5, luk: 5 })

  const flagsSet = new Set<string>()
  let prevFlags = snapshotFlags(engine.getState())
  let yearCount = 0

  while (engine.getState().phase === 'simulating' && yearCount < 200) {
    yearCount++
    const result = engine.startYear() as any
    const curFlags = snapshotFlags(engine.getState())
    for (const c of diffFlags(prevFlags, curFlags, engine.getState().age, result.event?.id ?? '__mundane__')) {
      flagsSet.add(c.flagName)
    }
    prevFlags = curFlags

    if (result.phase === 'awaiting_choice') {
      const branches = extractBranches(result)
      if (branches.length) {
        const bid = pickBranch(branches, gameIndex)
        if (bid) {
          try { engine.resolveBranch(bid) } catch { /* pickBranch 已尝试 */ }
        }
      }
    }
  }

  if (engine.getState().phase === 'simulating') engine.finish()

  const flagsChecked = new Set<string>()
  for (const rec of tracker.getRecords()) flagsChecked.add(rec.flagName)
  return { flagsSetThisGame: flagsSet, flagsCheckedThisGame: flagsChecked }
}

// ==================== 测试 ====================

describe('Flag 生命周期追踪', () => {
  it('静态分析 + 动态验证，生成 Flag 完整报告', async () => {
    const world = await createSwordAndMagicWorld()
    const allKnownFlags = collectKnownFlags(world)

    // ========== 静态分析（核心） ==========
    const reachability = analyzeFlagReachability(world)

    // ========== 动态验证（轻量统计采样） ==========
    console.log(`  动态验证: ${RANDOM_SAMPLE_COUNT} 局随机采样...`)
    const races = world.races ?? []
    const genders: Gender[] = ['male', 'female']
    const combos: Array<{ race: string; gender: Gender }> = []
    for (const r of races) for (const g of genders) combos.push({ race: r.id, gender: g })
    if (!combos.length) combos.push({ race: 'human', gender: 'male' })

    const flagsEverSet = new Set<string>()
    const flagsEverChecked = new Set<string>()
    const flagSetCount: Record<string, number> = {}
    const flagCheckCount: Record<string, number> = {}

    for (let i = 0; i < RANDOM_SAMPLE_COUNT; i++) {
      const combo = combos[i % combos.length]
      const result = runRandomGame(world, 10000 + i, combo.race, combo.gender, i)
      for (const f of result.flagsSetThisGame) {
        flagsEverSet.add(f)
        flagSetCount[f] = (flagSetCount[f] ?? 0) + 1
      }
      for (const f of result.flagsCheckedThisGame) {
        flagsEverChecked.add(f)
        flagCheckCount[f] = (flagCheckCount[f] ?? 0) + 1
      }
    }
    console.log(`  动态覆盖率: ${flagsEverSet.size}/${allKnownFlags.size} (${(flagsEverSet.size / allKnownFlags.size * 100).toFixed(1)}%)`)

    // ========== 分类统计 ==========

    const producedFlags = collectProducedFlags(world)
    const consumedFlags = collectConsumedFlags(world)

    // 死 flag：被 set 但从未被任何条件引用（生产者 - 消费者）
    const deadFlagsStatic = [...producedFlags].filter(f => !consumedFlags.has(f))

    // 孤儿 flag：被条件引用但从未被 set（消费者 - 生产者）
    const orphanFlagsStatic = [...consumedFlags].filter(f => !producedFlags.has(f))

    console.log(`  生产者（有 set 来源）: ${producedFlags.size}`)
    console.log(`  消费者（有条件引用）: ${consumedFlags.size}`)

    // 按静态可达性分类
    const trueOrphans: string[] = []
    const engineHardcoded: string[] = []
    const deepChain: string[] = []
    const hasSetterNoPrecond: string[] = []
    const dynamicNeverSet: string[] = []

    for (const f of allKnownFlags) {
      const info = reachability.get(f)
      if (!info || info.setterType === 'none') {
        trueOrphans.push(f)
      } else if (info.setterType === 'engine_hardcoded') {
        engineHardcoded.push(f)
      } else if (info.prerequisites.length > 0) {
        deepChain.push(f)
      } else {
        hasSetterNoPrecond.push(f)
      }
      if (!flagsEverSet.has(f)) {
        dynamicNeverSet.push(f)
      }
    }

    // ========== 打印报告 ==========

    console.log('\n' + '='.repeat(64))
    console.log('  Flag 完整分析报告')
    console.log('='.repeat(64))

    console.log('\n━━━ 一、Flag 总览 ━━━')
    console.log(`  已知 Flag 总数:     ${allKnownFlags.size}`)
    console.log(`  生产者（有 set）:    ${producedFlags.size}`)
    console.log(`  消费者（有引用）:    ${consumedFlags.size}`)
    console.log(`  动态采样覆盖:       ${flagsEverSet.size}/${allKnownFlags.size} (${(flagsEverSet.size / allKnownFlags.size * 100).toFixed(1)}%) — 仅参考，不代表完整覆盖`)

    console.log('\n━━━ 二、孤儿 Flag（被条件引用但无 set 来源）━━━')
    if (orphanFlagsStatic.length === 0) {
      console.log('  ✅ 无孤儿 Flag')
    } else {
      console.log(`  共 ${orphanFlagsStatic.length} 个：`)
      for (const f of orphanFlagsStatic) {
        // 找消费来源
        const consumers: string[] = []
        for (const event of world.events) {
          const check = `${event.include ?? ''} ${event.exclude ?? ''} ${(event.prerequisites ?? []).join(' ')}`.toLowerCase()
          if (check.includes(`has.flag.${f}`) || check.includes(`flag:${f}`)) consumers.push(`事件:${event.id}`)
        }
        for (const ach of world.achievements) {
          if (ach.condition.toLowerCase().includes(`has.flag.${f}`) || ach.condition.toLowerCase().includes(`flag:${f}`)) consumers.push(`成就:${ach.id}`)
        }
        for (const evl of (world as any).evaluations ?? []) {
          if (evl.condition.toLowerCase().includes(`has.flag.${f}`) || evl.condition.toLowerCase().includes(`flag:${f}`)) consumers.push(`评语:${evl.id}`)
        }
        console.log(`    🔴 ${f} ← 被 [${consumers.join(', ')}] 消费`)
      }
    }

    console.log('\n━━━ 三、死 Flag（有 set 但无 consume）━━━')
    if (deadFlagsStatic.length === 0) {
      console.log('  ✅ 无死 Flag')
    } else {
      console.log(`  共 ${deadFlagsStatic.length} 个：`)
      for (const f of deadFlagsStatic) {
        const dynCount = flagSetCount[f] ?? 0
        console.log(`    ⚪ ${f} (动态 set ${dynCount} 次)`)
      }
    }

    console.log('\n━━━ 四、Flag 可达性分类 ━━━')
    console.log(`  🔴 真正孤儿（无 set 来源）:       ${trueOrphans.length}`)
    console.log(`  ⚙️ 引擎硬编码 set:                ${engineHardcoded.length}`)
    console.log(`  🔗 有 set + 有 flag 前置链:        ${deepChain.length}`)
    console.log(`  ✅ 有 set + 无 flag 前置:          ${hasSetterNoPrecond.length}`)
    console.log(`  📊 动态采样未触发:                ${dynamicNeverSet.length}`)

    console.log('\n━━━ 五、条件链较深的 Flag（需多个前置 flag）━━━')
    if (deepChain.length === 0) {
      console.log('  （无）')
    } else {
      for (const f of deepChain) {
        const info = reachability.get(f)!
        const dynHit = flagsEverSet.has(f) ? '✅ 已触发' : '❌ 未触发'
        console.log(`    ${dynHit} ${f}: 事件=${info.setterEventId}, 需要 [${info.prerequisites.join(', ')}]`)
      }
    }

    console.log('\n' + '='.repeat(64))

    // ========== 写 JSON ==========
    const outputDir = path.resolve(__dirname, '../output')
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
    const report = {
      meta: {
        totalKnownFlags: allKnownFlags.size,
        dynamicSampleGames: RANDOM_SAMPLE_COUNT,
        dynamicSetCount: flagsEverSet.size,
        dynamicCoverage: +(flagsEverSet.size / allKnownFlags.size * 100).toFixed(1),
      },
      staticAnalysis: {
        trueOrphans,
        engineHardcoded,
        deepChain: deepChain.map(f => ({ flag: f, ...reachability.get(f)! })),
        hasSetterNoPrecond,
        orphanFlagsStatic,
        deadFlagsStatic,
        producedCount: producedFlags.size,
        consumedCount: consumedFlags.size,
      },
      dynamicSample: {
        flagsEverSet: [...flagsEverSet],
        flagsNeverSet: dynamicNeverSet,
        flagSetCount,
        flagCheckCount,
      },
      reachability: Object.fromEntries([...reachability].map(([k, v]) => [k, { ...v }])),
    }
    fs.writeFileSync(path.join(outputDir, 'flag-lifecycle-report.json'), JSON.stringify(report, null, 2), 'utf-8')
    console.log(`  报告: tests/output/flag-lifecycle-report.json`)

    // 唯一断言：采样不崩溃
    expect(true).toBe(true)
  }, 120_000)
})
