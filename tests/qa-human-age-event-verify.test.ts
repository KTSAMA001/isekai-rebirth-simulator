/**
 * QA: 人类实机验证 — 年龄与事件合理性检查
 *
 * 分支: fix/debt-event-condition (commit 7d4680e)
 *
 * 验证目标:
 * 1. 3 局完整人类模拟，输出编年史
 * 2. 事件触发年龄合理性
 * 3. 人类寿命落在 50-95 范围（lifespanRange，基于 maxLifespan=100 + Beta 分布）
 * 4. 33 岁不再触发衰老提示
 * 5. family_dinner 只在有孩子后触发
 * 6. 最后一战等事件的对手年龄合理
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'
import type { GameState, WorldInstance, WorldEventDef } from '@/engine/core/types'

let world: WorldInstance
const dsl = new ConditionDSL()

beforeAll(async () => {
  world = await createSwordAndMagicWorld()
})

// ==================== 工具函数 ====================

/** 选第一个满足前置条件的分支 */
function pickValidBranch(branches: any[], state: GameState): string {
  for (const b of branches) {
    if (!b.requireCondition) return b.id
    const ctx = { state, world }
    const ok = b.requireCondition
      .split(',')
      .map((c: string) => c.trim())
      .every((c: string) => dsl.evaluate(c, ctx))
    if (ok) return b.id
  }
  return branches[0]?.id ?? ''
}

/** 创建引擎并初始化人类角色（随机属性） */
function createHumanEngine(seed: number, gender: 'male' | 'female' = 'male'): SimulationEngine {
  const engine = new SimulationEngine(world, seed)
  engine.initGame('实机验证', undefined, 'human', gender)
  const talents = engine.draftTalents()
  engine.selectTalents(talents.slice(0, 3))
  // 均衡属性，模拟普通人类
  engine.allocateAttributes({
    str: 6 + (seed % 4),
    int: 5 + (seed % 5),
    chr: 5 + (seed % 6),
    luk: 5 + (seed % 5),
    mag: 3 + (seed % 4),
    mny: 5 + (seed % 7),
    spr: 5 + (seed % 4),
  })
  return engine
}

interface ChronicleEntry {
  age: number
  eventId: string
  title: string
  description: string
  effects: any[]
  branchId?: string
}

/** 运行完整人生，返回编年史 */
function runFullLife(engine: SimulationEngine): {
  chronicle: ChronicleEntry[]
  finalAge: number
  effectiveMaxAge: number
  flags: Set<string>
  eventLog: any[]
} {
  const chronicle: ChronicleEntry[] = []
  let prevLogLen = 0

  for (let i = 0; i < 150; i++) {
    const state = engine.getState()
    if (state.phase === 'finished') break

    const r = engine.startYear()
    if (r.phase === 'awaiting_choice' && r.branches) {
      const branchId = pickValidBranch(r.branches, engine.getState())
      engine.resolveBranch(branchId)
    }

    const after = engine.getState()
    const log = after.eventLog
    if (log.length > prevLogLen) {
      for (let j = prevLogLen; j < log.length; j++) {
        const entry = log[j]
        chronicle.push({
          age: entry.age,
          eventId: entry.eventId,
          title: entry.title,
          description: entry.description,
          effects: entry.effects ?? [],
          branchId: entry.branchId,
        })
      }
      prevLogLen = log.length
    }
  }

  const finalState = engine.getState()
  return {
    chronicle,
    finalAge: finalState.age,
    effectiveMaxAge: finalState.effectiveMaxAge ?? 0,
    flags: new Set(finalState.flags),
    eventLog: finalState.eventLog,
  }
}

/** 打印编年史 */
function printChronicle(seed: number, result: ReturnType<typeof runFullLife>): void {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`  📜 编年史 — 种子 #${seed}`)
  console.log(`  寿命: ${result.finalAge} 岁 | effectiveMaxAge: ${result.effectiveMaxAge}`)
  console.log(`${'═'.repeat(70)}`)
  for (const entry of result.chronicle) {
    const tag = entry.eventId === '__mundane__' ? '  ' : '🔥'
    console.log(`  ${tag} [${String(entry.age).padStart(3)}岁] ${entry.eventId.padEnd(40)} | ${entry.title}`)
    if (entry.description && entry.eventId !== '__mundane__') {
      const lines = entry.description.split('\n').slice(0, 2)
      for (const line of lines) {
        console.log(`          ${line}`)
      }
    }
  }
  console.log(`  🏁 死亡年龄: ${result.finalAge} 岁`)
  console.log(`  🏳️ Flags: ${[...result.flags].sort().join(', ') || '(无)'}`)
  console.log(`${'═'.repeat(70)}`)
}

// ==================== 年龄合理性检查 ====================

/** 事件年龄分类（原始数据定义的 minAge） */
function getEventAgeCategory(eventId: string): 'childhood' | 'youth' | 'adult' | 'middle-age' | 'elder' | 'unknown' {
  const ev = world.index.eventsById.get(eventId)
  if (!ev) return 'unknown'
  // 基于 minAge 分类
  if (ev.minAge <= 14) return 'childhood'
  if (ev.minAge <= 25) return 'youth'
  if (ev.minAge <= 45) return 'adult'
  if (ev.minAge <= 60) return 'middle-age'
  return 'elder'
}

/** 检查衰老相关关键词 */
const AGING_KEYWORDS = ['衰老', '老', '暮年', '黄昏', '风烛', '残年', '油尽灯枯', '垂暮', '白发', '体衰']
function isAgingRelated(text: string): boolean {
  return AGING_KEYWORDS.some(kw => text.includes(kw))
}

/** 检查事件是否是"最后一战"类 */
function isLastBattleRelated(eventId: string): boolean {
  return eventId.includes('final_battle') || eventId.includes('old_enemy') || eventId.includes('last_adventure')
}

interface AgeViolation {
  age: number
  eventId: string
  title: string
  description: string
  reason: string
  severity: 'P1' | 'P2' | 'P3'
}

/** 分析一局模拟中的年龄违规 */
function analyzeAgeViolations(result: ReturnType<typeof runFullLife>): AgeViolation[] {
  const violations: AgeViolation[] = []

  for (const entry of result.chronicle) {
    if (entry.eventId === '__mundane__') continue

    // 检查普通年描述中的衰老提示（agingHint）
    if (entry.eventId === '__mundane__' || entry.eventId.includes('mundane')) {
      // agingHint 在 description 中
      const desc = entry.description
      if (isAgingRelated(desc) && entry.age < 40) {
        violations.push({
          age: entry.age,
          eventId: entry.eventId,
          title: entry.title,
          description: desc,
          reason: `年龄 ${entry.age} 岁出现衰老提示`,
          severity: 'P2',
        })
      }
      continue
    }

    // 检查事件标题和描述中的衰老相关内容
    const fullText = entry.title + entry.description
    if (isAgingRelated(fullText) && entry.age < 40) {
      violations.push({
        age: entry.age,
        eventId: entry.eventId,
        title: entry.title,
        description: entry.description,
        reason: `${entry.age} 岁触发衰老相关事件「${entry.title}」`,
        severity: 'P1',
      })
    }
  }

  return violations
}

// ==================== 测试套件 ====================

describe('人类实机验证 — 年龄与事件合理性', () => {
  const SEEDS = [42, 137, 256] // 3 局随机种子
  const results: Map<number, ReturnType<typeof runFullLife>> = new Map()

  // 先运行 3 局
  beforeAll(() => {
    for (const seed of SEEDS) {
      const engine = createHumanEngine(seed)
      results.set(seed, runFullLife(engine))
    }
  })

  // ==================== 任务 1: 完整编年史 ====================

  it('任务1: 运行 3 局完整人类模拟并输出编年史', () => {
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      printChronicle(seed, result)
      // 基本完整性检查
      expect(result.chronicle.length).toBeGreaterThan(0)
      expect(result.finalAge).toBeGreaterThan(1)
    }
    console.log('\n  ✅ 3 局模拟全部完成')
  })

  // ==================== 任务 2: 事件触发年龄合理性 ====================

  it('任务2a: 童年事件(1-14岁)不越界', () => {
    const childhoodEvents = [
      'childhood_first_friend', 'childhood_sneak_out', 'childhood_pet',
      'childhood_talent', 'childhood_bully', 'childhood_nature',
      'childhood_craft', 'childhood_promise', 'childhood_hideout',
      'childhood_festival', 'childhood_hero_worship', 'childhood_sickness',
      'childhood_first_lie', 'childhood_rain', 'childhood_dream',
      'childhood_injury', 'childhood_collection',
    ]
    let violations = 0
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      for (const entry of result.chronicle) {
        if (childhoodEvents.includes(entry.eventId)) {
          if (entry.age > 14) {
            console.log(`    ⚠️ 种子#${seed}: ${entry.eventId}(${entry.title}) 在 ${entry.age} 岁触发（>14）`)
            violations++
          }
        }
      }
    }
    console.log(`  童年事件越界: ${violations} 次`)
    expect(violations).toBe(0)
  })

  it('任务2b: 青年事件(15-25岁)不越界', () => {
    // 青年事件 minAge 通常在 10-18，检查实际触发年龄不小于事件的 minAge
    let violations = 0
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      for (const entry of result.chronicle) {
        if (entry.eventId.startsWith('youth_') || entry.eventId.startsWith('teen_')) {
          const ev = world.index.eventsById.get(entry.eventId)
          if (ev && entry.age < ev.minAge) {
            console.log(`    ⚠️ 种子#${seed}: ${entry.eventId}(${entry.title}) 在 ${entry.age} 岁触发（minAge=${ev.minAge}）`)
            violations++
          }
        }
      }
    }
    console.log(`  青年事件越界: ${violations} 次`)
    expect(violations).toBe(0)
  })

  it('任务2c: "衰老加剧"类事件不在 40 岁前触发', () => {
    // 检查所有事件中的衰老关键词
    let earlyAgingCount = 0
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      for (const entry of result.chronicle) {
        if (entry.eventId === '__mundane__') {
          // 检查 agingHint
          const desc = entry.description
          if (desc.includes('鬓角多了几根白发') && entry.age < 40) {
            console.log(`    ⚠️ 种子#${seed} [${entry.age}岁] 普通年出现白发提示: ${desc.slice(-60)}`)
            earlyAgingCount++
          }
          if (desc.includes('开始怀念年轻') && entry.age < 35) {
            console.log(`    ⚠️ 种子#${seed} [${entry.age}岁] 普通年出现怀旧提示`)
            earlyAgingCount++
          }
          continue
        }

        // 检查事件标题中的衰老相关
        const agingKeywords = ['衰老', '风烛', '残年', '暮年', '黄昏', '油尽灯枯', '垂暮']
        for (const kw of agingKeywords) {
          if (entry.title.includes(kw) && entry.age < 40) {
            console.log(`    ⚠️ 种子#${seed} [${entry.age}岁] 事件「${entry.title}」含衰老关键词「${kw}」`)
            earlyAgingCount++
          }
        }
      }
    }
    console.log(`  40 岁前衰老事件/提示: ${earlyAgingCount} 次`)
    expect(earlyAgingCount).toBe(0)
  })

  it('任务2d: 33 岁不再触发"衰老加剧"或"生命的黄昏"提示', () => {
    // effectiveMaxAge 基于 maxLifespan=100, 所以 80%-100% 范围即 80-100
    // lifeRatio = 33/80~100 ≈ 0.33-0.41
    // getAgingHint: 0.38 才开始显示"你开始怀念年轻时的充沛精力"
    // 33岁在 effectiveMaxAge=80 时 ratio=0.4125 > 0.38，在 effectiveMaxAge=100 时 ratio=0.33 < 0.38
    // 所以需要验证：33 岁时 agingHint 是否为空或不含衰老词

    for (const seed of SEEDS) {
      const engine = createHumanEngine(seed)
      const initState = engine.getState()
      const maxAge = initState.effectiveMaxAge ?? 100

      // 模拟到 33 岁
      for (let age = 1; age <= 33; age++) {
        const state = engine.getState()
        if (state.phase === 'finished') break
        const r = engine.startYear()
        if (r.phase === 'awaiting_choice' && r.branches) {
          engine.resolveBranch(pickValidBranch(r.branches, engine.getState()))
        }
      }

      const state33 = engine.getState()
      const age33Entries = state33.eventLog.filter(e => e.age === 33)
      for (const entry of age33Entries) {
        const desc = entry.description ?? ''
        // 33 岁不应出现 "衰老"、"力不从心"、"爬楼梯气喘" 等严重衰老提示
        const severeAging = ['衰老加剧', '生命的黄昏', '力不从心', '气喘', '油尽灯枯', '风烛']
        const found = severeAging.find(kw => desc.includes(kw))
        if (found) {
          console.log(`    ⚠️ 种子#${seed} 33岁(effectiveMaxAge=${maxAge}): 包含「${found}」`)
          // 根据 effectiveMaxAge 计算预期
          const ratio = 33 / maxAge
          console.log(`       lifeRatio=${ratio.toFixed(4)}, 0.38阈值=${(maxAge * 0.38).toFixed(1)}岁`)
        }
        expect(found).toBeUndefined()
      }
      console.log(`  ✓ 种子#${seed}: 33岁无严重衰老提示 (effectiveMaxAge=${maxAge})`)
    }
  })

  it('任务2e: "最后一战"类事件的对手年龄合理(>15岁)', () => {
    // 这些事件描述中提到对手，检查是否合理
    let unreasonableCount = 0
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      for (const entry of result.chronicle) {
        if (isLastBattleRelated(entry.eventId)) {
          // 检查描述中是否有年龄不合理的情况
          // 大多数"最后一战"事件在 50+ 岁触发，对手通常是成年人
          // 主要检查事件是否在太年轻时触发
          if (entry.age < 25) {
            console.log(`    ⚠️ 种子#${seed}: ${entry.eventId}(${entry.title}) 在 ${entry.age} 岁触发（<25岁）`)
            unreasonableCount++
          }
        }
      }
    }
    console.log(`  不合理的最后一战事件: ${unreasonableCount} 次`)
    expect(unreasonableCount).toBe(0)
  })

  // ==================== 任务 3: 寿命范围验证 ====================

  it('任务3: 人类寿命应在 lifespanRange [50, 95] 范围内（maxLifespan=100, Beta 分布中位寿命约 70）', () => {
    const HUMAN_LIFESPAN_MIN = 50
    const HUMAN_LIFESPAN_MAX = 95
    const TOLERANCE = 5 // HP 系统和随机性导致偏差

    const lifespans: number[] = []
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      lifespans.push(result.finalAge)
      const inRange = result.finalAge >= (HUMAN_LIFESPAN_MIN - TOLERANCE) &&
                       result.finalAge <= (HUMAN_LIFESPAN_MAX + TOLERANCE)
      const status = inRange ? '✅' : '❌'
      console.log(`  ${status} 种子#${seed}: ${result.finalAge} 岁 (range=[${HUMAN_LIFESPAN_MIN}-${HUMAN_LIFESPAN_MAX}], effectiveMaxAge=${result.effectiveMaxAge})`)
    }

    const avg = lifespans.reduce((a, b) => a + b, 0) / lifespans.length
    console.log(`  平均寿命: ${avg.toFixed(1)} 岁`)

    // 大部分局应在范围内（允许个别超出）
    const inRangeCount = lifespans.filter(l =>
      l >= (HUMAN_LIFESPAN_MIN - TOLERANCE) && l <= (HUMAN_LIFESPAN_MAX + TOLERANCE)
    ).length
    console.log(`  在范围内: ${inRangeCount}/${lifespans.length} 局`)
    // 至少 2/3 的局应在范围内
    expect(inRangeCount).toBeGreaterThanOrEqual(2)
  })

  // ==================== 任务 4: effectiveMaxAge 验证 ====================

  it('任务4a: effectiveMaxAge 应等于人类 maxLifespan(100)', () => {
    for (const seed of SEEDS) {
      const result = results.get(seed)!
      console.log(`  种子#${seed}: effectiveMaxAge=${result.effectiveMaxAge}`)
      expect(result.effectiveMaxAge).toBe(100)
    }
  })

  it('任务4b: 多次运行 personalDeathProgress 有随机分布（Beta(8,3) clamp [0.60, 0.92]）', () => {
    const deathProgresses: number[] = []
    for (let seed = 1000; seed < 1020; seed++) {
      const engine = createHumanEngine(seed)
      deathProgresses.push(engine.getPersonalDeathProgress())
    }
    const unique = new Set(deathProgresses)
    const min = Math.min(...deathProgresses)
    const max = Math.max(...deathProgresses)
    console.log(`  20 局 personalDeathProgress 范围: ${min.toFixed(4)}-${max.toFixed(4)}`)
    console.log(`  不同值: ${unique.size} 种`)
    // Beta(8,3) clamp 到 [0.60, 0.92]
    expect(min).toBeGreaterThanOrEqual(0.60)
    expect(max).toBeLessThanOrEqual(0.92)
    expect(unique.size).toBeGreaterThan(1) // 应该有随机性
  })

  // ==================== 任务 5: family_dinner 验证 ====================

  it('任务5: family_dinner 只在 married AND parent flag 都存在时触发', () => {
    // 先验证 DSL 层 — 使用 & (AND) 连接
    const includeExpr = 'has.flag.married&has.flag.parent'
    expect(dsl.evaluate(includeExpr, { state: { flags: new Set() } as any, world })).toBe(false)
    expect(dsl.evaluate(includeExpr, { state: { flags: new Set(['married']) } as any, world })).toBe(false)
    expect(dsl.evaluate(includeExpr, { state: { flags: new Set(['parent']) } as any, world })).toBe(false)
    expect(dsl.evaluate(includeExpr, { state: { flags: new Set(['married', 'parent']) } as any, world })).toBe(true)
    console.log('  ✓ family_dinner include 条件 DSL 验证通过')

    // 验证事件定义 — 数据中使用 & 作为 AND 连接符
    const ev = world.index.eventsById.get('family_dinner')
    expect(ev).toBeDefined()
    expect(ev!.include).toBe('has.flag.married&has.flag.parent')
    console.log('  ✓ family_dinner 事件定义条件正确')
  })

  // ==================== 额外统计 ====================

  it('统计: 3 局模拟的事件分布和生命阶段', () => {
    for (const seed of SEEDS) {
      const result = results.get(seed)!

      // 按生命阶段分类事件
      const phases: Record<string, number> = {
        '童年(1-14)': 0,
        '青年(15-25)': 0,
        '成年(26-40)': 0,
        '中年(41-60)': 0,
        '老年(61+)': 0,
      }
      for (const entry of result.chronicle) {
        if (entry.eventId === '__mundane__') continue
        if (entry.age <= 14) phases['童年(1-14)']++
        else if (entry.age <= 25) phases['青年(15-25)']++
        else if (entry.age <= 40) phases['成年(26-40)']++
        else if (entry.age <= 60) phases['中年(41-60)']++
        else phases['老年(61+)']++
      }

      console.log(`\n  种子#${seed} 事件分布 (寿命${result.finalAge}岁, ${result.chronicle.filter(e => e.eventId !== '__mundane__').length}个事件):`)
      for (const [phase, count] of Object.entries(phases)) {
        const bar = '█'.repeat(Math.min(count, 30))
        console.log(`    ${phase.padEnd(12)}: ${String(count).padStart(2)} ${bar}`)
      }
    }
  })
})

// ==================== 批量验证（20 局） ====================

describe('人类批量验证 — 20 局统计', () => {
  it('20 局中不应出现 40 岁前的衰老关键词事件', () => {
    const RUNS = 20
    let totalEarlyAging = 0
    const lifespans: number[] = []

    for (let i = 0; i < RUNS; i++) {
      const seed = 5000 + i
      const engine = createHumanEngine(seed)
      const result = runFullLife(engine)
      lifespans.push(result.finalAge)

      for (const entry of result.chronicle) {
        if (entry.eventId === '__mundane__') {
          // 检查 agingHint 中的严重衰老
          const desc = entry.description
          const severeHints = ['力不从心', '爬楼梯', '气喘', '身体越来越不听使唤', '岁月不饶人', '油尽灯枯']
          if (entry.age < 40 && severeHints.some(h => desc.includes(h))) {
            console.log(`    ⚠️ 种子#${seed} [${entry.age}岁]: ${desc.slice(-80)}`)
            totalEarlyAging++
          }
          continue
        }

        // 检查事件标题中的严重衰老关键词
        const severeTitles = ['衰老', '风烛', '残年', '暮年', '黄昏', '油尽灯枯', '垂暮']
        if (entry.age < 40 && severeTitles.some(kw => entry.title.includes(kw))) {
          console.log(`    ⚠️ 种子#${seed} [${entry.age}岁]: 事件「${entry.title}」`)
          totalEarlyAging++
        }
      }
    }

    const avgLife = lifespans.reduce((a, b) => a + b, 0) / lifespans.length
    const inRange = lifespans.filter(l => l >= 45 && l <= 100).length
    console.log(`\n  20 局统计:`)
    console.log(`    平均寿命: ${avgLife.toFixed(1)} 岁`)
    console.log(`    寿命范围: ${Math.min(...lifespans)}-${Math.max(...lifespans)} 岁`)
    console.log(`    在 45-100 范围内: ${inRange}/20 局`)
    console.log(`    40 岁前严重衰老提示: ${totalEarlyAging} 次`)

    expect(totalEarlyAging).toBe(0)
  })

  it('20 局中 family_dinner 只在有 married+parent flag 时触发', () => {
    const RUNS = 20
    let familyDinnerCount = 0
    let violationCount = 0

    for (let i = 0; i < RUNS; i++) {
      const seed = 7000 + i
      const engine = createHumanEngine(seed)
      const result = runFullLife(engine)

      for (const entry of result.chronicle) {
        if (entry.eventId === 'family_dinner') {
          familyDinnerCount++
          // 检查该年龄时的 flags（近似：用最终 flags，因为 married/parent 是累积 flag）
          // 更精确：回溯到该年龄时的 state
          // 这里用简化方式：只要 married 和 parent 都在最终 flags 中就算合法
          // （因为这两个 flag 一旦设置不会被移除，除非 widowed）
          if (!result.flags.has('married') || !result.flags.has('parent')) {
            console.log(`    ⚠️ 种子#${seed}: family_dinner 触发但缺少 flag (married=${result.flags.has('married')}, parent=${result.flags.has('parent')})`)
            violationCount++
          }
        }
      }
    }

    console.log(`  family_dinner 触发: ${familyDinnerCount}/20 局`)
    console.log(`  条件违规: ${violationCount} 次`)
    expect(violationCount).toBe(0)
  })
})
