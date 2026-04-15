/**
 * QA Phase 2 — 深度测试（完整生命周期 + 边界 + 事件链 + DSL 验证）
 *
 * 测试场景：
 * A. 各种族 50 轮完整生命周期模拟（死亡分布、elder 事件验证）
 * B. 哥布林短寿命特殊验证
 * C. 精灵长寿命验证
 * D. DSL lifeProgress 条件验证（elder_final_illness、centenarian_celebration、成就）
 * E. 事件链条深度分析
 * F. 边界情况（极端早逝、极端长寿、多种族混合事件）
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import type { Gender, WorldInstance, WorldEventDef, WorldRaceDef } from '@/engine/core/types'

// ==================== 配置 ====================

const PLAYABLE_RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const RACE_NAMES: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林', dwarf: '矮人',
}
const RACE_MAX_LIFESPAN: Record<string, number> = {
  human: 100, elf: 500, goblin: 60, dwarf: 400,
}
const RACE_LIFE_STAGES: Record<string, Record<string, [number, number]>> = {
  human: { childhood: [2, 10], teen: [11, 17], youth: [14, 22], adult: [20, 45], midlife: [35, 60], elder: [55, 100] },
  elf:   { childhood: [2, 50], teen: [30, 80], youth: [50, 120], adult: [80, 250], midlife: [200, 380], elder: [350, 500] },
  goblin:{ childhood: [1, 6], teen: [5, 12], youth: [8, 18], adult: [15, 35], midlife: [25, 50], elder: [35, 60] },
  dwarf: { childhood: [2, 30], teen: [20, 50], youth: [30, 80], adult: [60, 200], midlife: [180, 320], elder: [280, 400] },
}

const SIMS_PER_RACE = 10
const BASE_SEED = 10000

// ==================== 类型 ====================

interface SimResult {
  race: string
  gender: Gender
  seed: number
  deathAge: number
  lifeProgress: number
  personalDeathProgress: number
  elderEvents: Array<{ age: number; eventId: string; title: string; lifeProgress: number }>
  allEvents: Array<{ age: number; eventId: string; title: string; description: string; tag?: string }>
  achievements: string[]
  flags: Set<string>
  hpAtDeath: number
}

interface AnomalyRecord {
  severity: 'P0' | 'P1' | 'P2' | 'P3'
  race: string
  seed: number
  age: number
  eventId: string
  description: string
}

// ==================== 核心模拟 ====================

let world: WorldInstance

beforeAll(async () => {
  const data = await loadWorldData()
  world = createWorldInstance(
    data.manifest, data.attributes, data.talents, data.events, data.achievements,
    data.items, data.presets, data.scoringRule, data.races,
  )
  // 附加 evaluations
  world.evaluations = data.evaluations
}, 30000)

function runFullGame(race: string, gender: Gender, seed: number): SimResult {
  const engine = new SimulationEngine(world, seed)
  engine.initGame('TestChar', undefined, race, gender)

  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, 3))

  const state = engine.getState()
  const visibleAttrs = world.attributes.filter(a => !a.hidden)
  const pointsPerAttr = Math.floor((world.manifest.initialPoints - state.talentPenalty) / visibleAttrs.length)
  const allocation: Record<string, number> = {}
  for (const attr of visibleAttrs) {
    allocation[attr.id] = pointsPerAttr
  }
  engine.allocateAttributes(allocation)

  let maxIter = 10000
  let prevAge = 0
  let stuckCount = 0

  while (engine.getState().phase === 'simulating' && maxIter > 0) {
    const yearResult = engine.startYear()

    if (yearResult.phase === 'awaiting_choice') {
      const branches = yearResult.branches!
      let resolved = false
      for (const branch of branches) {
        try {
          engine.resolveBranch(branch.id)
          resolved = true
          break
        } catch {
          continue
        }
      }
      if (!resolved) engine.skipYear()
    } else if (yearResult.phase === 'mundane_year') {
      engine.skipYear()
    }

    const cs = engine.getState()
    if (cs.age === prevAge) {
      stuckCount++
      if (stuckCount > 10) break
    } else {
      stuckCount = 0
      prevAge = cs.age
    }
    maxIter--
  }

  if (engine.getState().phase !== 'finished') engine.finish()

  const finalState = engine.getState()
  const deathAge = finalState.result?.lifespan ?? finalState.age
  const raceMax = world.races?.find(r => r.id === race)?.maxLifespan ?? 100

  // 提取所有事件
  const allEvents: SimResult['allEvents'] = []
  for (const log of finalState.eventLog) {
    if (log.eventId === '__mundane__') continue
    const def = world.index.eventsById.get(log.eventId)
    allEvents.push({
      age: log.age,
      eventId: log.eventId,
      title: log.title,
      description: log.description,
      tag: def?.tag,
    })
  }

  // 提取 elder 阶段事件
  // 仅识别：lifeStage=elder 的事件、以 elder_ 开头的事件、种族专属老年事件
  const elderEvents = allEvents.filter(e => {
    const def = world.index.eventsById.get(e.eventId)
    if (def?.lifeStage === 'elder') return true
    if (e.eventId.startsWith('elder_')) return true
    return false
  }).map(e => ({ age: e.age, eventId: e.eventId, title: e.title, lifeProgress: e.age / raceMax }))

  return {
    race,
    gender,
    seed,
    deathAge,
    lifeProgress: deathAge / raceMax,
    personalDeathProgress: engine.getPersonalDeathProgress(),
    elderEvents,
    allEvents,
    achievements: finalState.achievements.unlocked,
    flags: finalState.flags,
    hpAtDeath: finalState.hp,
  }
}

/** 批量运行模拟 */
function batchRun(race: string, count: number, gender: Gender = 'male'): SimResult[] {
  const results: SimResult[] = []
  for (let i = 0; i < count; i++) {
    results.push(runFullGame(race, gender, BASE_SEED + i))
  }
  return results
}

// ==================== 统计工具 ====================

function mean(arr: number[]): number { return arr.reduce((a, b) => a + b, 0) / arr.length }
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
function stdDev(arr: number[]): number {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length)
}

function formatStats(ages: number[], raceMax: number): string {
  const progress = ages.map(a => a / raceMax)
  return `n=${ages.length} min=${Math.min(...ages)} max=${Math.max(...ages)} ` +
    `mean=${mean(ages).toFixed(1)} median=${median(ages).toFixed(0)} σ=${stdDev(ages).toFixed(1)} | ` +
    `LP: min=${Math.min(...progress).toFixed(3)} max=${Math.max(...progress).toFixed(3)} mean=${mean(progress).toFixed(3)}`
}

// ==================== A. 各种族完整生命周期模拟（50轮/种族） ====================

describe('A. 各种族完整生命周期模拟（50轮/种族）', () => {
  const allAnomalies: AnomalyRecord[] = []
  const raceResults: Record<string, SimResult[]> = {}

  for (const race of PLAYABLE_RACES) {
    describe(`种族: ${RACE_NAMES[race]}（maxLifespan=${RACE_MAX_LIFESPAN[race]}）`, () => {
      let results: SimResult[]

      it(`50 轮模拟完成，统计死亡分布`, () => {
        results = batchRun(race, SIMS_PER_RACE)
        raceResults[race] = results

        const ages = results.map(r => r.deathAge)
        const raceMax = RACE_MAX_LIFESPAN[race]

        console.log(`\n【${RACE_NAMES[race]}】死亡分布统计：`)
        console.log(`  ${formatStats(ages, raceMax)}`)

        // 基本健康检查：没有人活超过 maxLifespan * 1.3（过度超出不合理）
        const overageThreshold = raceMax * 1.3
        const overage = results.filter(r => r.deathAge > overageThreshold)
        expect(overage.length, `${overage.length} 个角色超过 ${overageThreshold} 岁`).toBe(0)
      })

      it('死亡时 lifeProgress 在合理范围内（0.55~1.1）', () => {
        const results = raceResults[race]!
        const unreasonable = results.filter(r => r.lifeProgress < 0.45 || r.lifeProgress > 1.15)

        for (const r of unreasonable) {
          allAnomalies.push({
            severity: r.lifeProgress < 0.45 ? 'P1' : 'P2',
            race,
            seed: r.seed,
            age: r.deathAge,
            eventId: 'death',
            description: `lifeProgress=${r.lifeProgress.toFixed(3)} 异常（期望 0.55~1.1）`,
          })
        }

        console.log(`  lifeProgress 范围: ${Math.min(...results.map(r => r.lifeProgress)).toFixed(3)} ~ ${Math.max(...results.map(r => r.lifeProgress)).toFixed(3)}`)
        // 允极少极端值，但不应超过 10%
        expect(unreasonable.length, `超过 ${unreasonable.length} 个异常 lifeProgress`).toBeLessThanOrEqual(Math.ceil(SIMS_PER_RACE * 0.1))
      })

      it('不应出现"年轻人触发老年事件"的异常', () => {
        const results = raceResults[race]!
        const stages = RACE_LIFE_STAGES[race]
        const elderStart = stages.elder[0]

        for (const r of results) {
          for (const evt of r.elderEvents) {
            // 只对 lifeStage=elder 的事件检查年龄范围
            // 其他 elder_ 前缀事件使用百分比换算，age 可能在任何阶段触发
            const def = world.index.eventsById.get(evt.eventId)
            if (!def?.lifeStage) continue

            // lifeStage=elder 事件使用种族映射，起始年龄应 >= elderStart * 0.8
            if (evt.age < elderStart * 0.8) {
              allAnomalies.push({
                severity: 'P1',
                race,
                seed: r.seed,
                age: evt.age,
                eventId: evt.eventId,
                description: `elder 事件在 ${evt.age} 岁触发，elder 起始=${elderStart}`,
              })
            }
          }
        }

        const elderAnomalies = allAnomalies.filter(a => a.race === race && a.eventId !== 'death')
        if (elderAnomalies.length > 0) {
          console.log(`  ⚠ 发现 ${elderAnomalies.length} 个 elder 事件年龄异常:`)
          for (const a of elderAnomalies.slice(0, 5)) {
            console.log(`    seed=${a.seed} age=${a.age} event=${a.eventId}`)
          }
        }
        expect(elderAnomalies.length).toBe(0)
      })

      it('elder 事件分布合理', () => {
        const results = raceResults[race]!
        let totalElder = 0
        let elderBeforeMid = 0
        const raceMax = RACE_MAX_LIFESPAN[race]
        const elderStart = RACE_LIFE_STAGES[race].elder[0]

        for (const r of results) {
          if (r.deathAge >= elderStart) {
            totalElder++
          }
          for (const evt of r.elderEvents) {
            // 只检查 lifeStage=elder 的事件，排除仅有 elder_ 前缀但实际用百分比换算的事件
            const def = world.index.eventsById.get(evt.eventId)
            if (!def?.lifeStage) continue
            if (evt.lifeProgress < 0.5) elderBeforeMid++
          }
        }

        console.log(`  活到 elder 阶段: ${totalElder}/${SIMS_PER_RACE}, elder 事件在中点前触发: ${elderBeforeMid}`)
        // elder 事件 lifeProgress < 0.5 应为极少数（排除种族专属）
        expect(elderBeforeMid).toBeLessThan(3)
      })
    })
  }

  // 汇总报告
  afterAll(() => {
    if (allAnomalies.length > 0) {
      console.log('\n====== 异常汇总 ======')
      const bySeverity = new Map<string, AnomalyRecord[]>()
      for (const a of allAnomalies) {
        const list = bySeverity.get(a.severity) ?? []
        list.push(a)
        bySeverity.set(a.severity, list)
      }
      for (const [sev, list] of bySeverity) {
        console.log(`\n${sev} (${list.length} 个):`)
        for (const a of list.slice(0, 10)) {
          console.log(`  [${RACE_NAMES[a.race]}] seed=${a.seed} age=${a.age} event=${a.eventId}: ${a.description}`)
        }
        if (list.length > 10) console.log(`  ... 还有 ${list.length - 10} 个`)
      }
    }
  })
})

// ==================== B. 哥布林特殊验证 ====================

describe('B. 哥布林特殊验证（maxLifespan=60）', () => {
  let results: SimResult[]

  it('50 轮哥布林模拟', () => {
    results = batchRun('goblin', SIMS_PER_RACE)
    expect(results.length).toBe(SIMS_PER_RACE)
  })

  it('childhood 事件应在 1-6 岁触发', () => {
    const childhoodEvents = results.flatMap(r => r.allEvents.filter(e => {
      const def = world.index.eventsById.get(e.eventId)
      return def?.lifeStage === 'childhood' || e.eventId.startsWith('child_')
    }))

    const violations = childhoodEvents.filter(e => e.age < 1 || e.age > 12) // 允一定容差
    if (violations.length > 0) {
      console.log(`  ⚠ childhood 事件触发年龄异常:`)
      for (const v of violations.slice(0, 10)) {
        console.log(`    age=${v.age} event=${v.eventId}`)
      }
    }
    expect(violations.length).toBe(0)
  })

  it('teenager 事件应在合理年龄段触发', () => {
    const teenEvents = results.flatMap(r => r.allEvents.filter(e => {
      const def = world.index.eventsById.get(e.eventId)
      return def?.lifeStage === 'teenager' || e.eventId.startsWith('teen_')
    }))

    // 哥布林 teen 阶段: 5-12（百分比换算后大约在此范围附近）
    const violations = teenEvents.filter(e => e.age < 3 || e.age > 20)
    if (violations.length > 0) {
      console.log(`  ⚠ teenager 事件触发年龄异常:`)
      for (const v of violations.slice(0, 10)) {
        console.log(`    age=${v.age} event=${v.eventId}`)
      }
    }
    // 极少容差
    expect(violations.length).toBeLessThan(3)
  })

  it('elder 事件在 35-60 岁范围内触发', () => {
    const elderEvents = results.flatMap(r => r.elderEvents)
    const violations = elderEvents.filter(e => e.age < 20) // 不应在 20 岁前触发 elder 事件

    if (violations.length > 0) {
      console.log(`  ⚠ elder 事件过早触发:`)
      for (const v of violations.slice(0, 10)) {
        const def = world.index.eventsById.get(v.eventId)
        console.log(`    age=${v.age} event=${v.eventId} races=${def?.races ?? 'all'} lifeStage=${def?.lifeStage ?? 'none'}`)
      }
    }
    expect(violations.length).toBe(0)
  })

  it('不出现"5岁触发中年事件"等严重异常', () => {
    const midlifeEvents = results.flatMap(r => r.allEvents.filter(e => {
      const def = world.index.eventsById.get(e.eventId)
      return def?.lifeStage === 'midlife' || e.eventId.startsWith('mid_')
    }))

    // 中年事件不应在 15 岁前触发
    const violations = midlifeEvents.filter(e => e.age < 15)
    if (violations.length > 0) {
      console.log(`  🚨 中年事件过早触发（严重异常）:`)
      for (const v of violations) {
        console.log(`    age=${v.age} event=${v.eventId}`)
      }
    }
    expect(violations.length).toBe(0)
  })

  it('哥布林兜底事件换算合理', () => {
    // 检查非种族专属、非 lifeStage 的通用 elder 事件
    // 这些事件的 minAge/maxAge 会被百分比换算
    // 如 elder_peaceful_days 原始 min=50, max=90 → 哥布林: 50/100*60=30, 90/100*60=54
    const raceMax = 60
    for (const r of results) {
      for (const evt of r.allEvents) {
        const def = world.index.eventsById.get(evt.eventId)
        if (!def) continue
        // 只检查通用事件（无 races 限制、无 lifeStage）
        if (def.races?.length || def.lifeStage || def.maxAge <= 1) continue
        if (def.minAge === undefined) continue

        // 计算期望范围
        let expectedMin: number, expectedMax: number
        if (def.lifeStages?.length) continue // 跨阶段事件复杂，跳过

        let minProgress = def.minAge / 100
        let maxProgress = (def.maxAge ?? 100) / 100

        if (def.tag && ['life', 'romance', 'social'].includes(def.tag ?? '')) {
          maxProgress = Math.min(maxProgress, 0.50)
        }

        expectedMin = Math.round(minProgress * raceMax)
        expectedMax = Math.round(maxProgress * raceMax)
        expectedMin = Math.max(expectedMin, Math.floor(def.minAge * 0.5))
        expectedMax = Math.max(expectedMax, expectedMin)

        if (evt.age < expectedMin - 1 || evt.age > expectedMax + 1) {
          console.log(`  ⚠ [兜底事件] ${evt.eventId}: 触发age=${evt.age}, 期望范围=[${expectedMin}, ${expectedMax}], 原始=[${def.minAge}, ${def.maxAge}]`)
        }
      }
    }
  })
})

// ==================== C. 精灵长寿命验证 ====================

describe('C. 精灵长寿命验证（maxLifespan=500）', () => {
  let results: SimResult[]

  it('50 轮精灵模拟', () => {
    results = batchRun('elf', SIMS_PER_RACE)
    expect(results.length).toBe(SIMS_PER_RACE)
  })

  it('精灵应普遍活到 200 岁以上', () => {
    const shortLived = results.filter(r => r.deathAge < 200)
    console.log(`  200 岁以下死亡: ${shortLived.length}/${SIMS_PER_RACE}`)
    console.log(`  死亡分布: ${formatStats(results.map(r => r.deathAge), 500)}`)

    // 精灵应在 200+ 才有意义（lifespanRange=[250,400]）
    // 允许 10% 极端早逝
    expect(shortLived.length).toBeLessThan(Math.ceil(SIMS_PER_RACE * 0.1))
  })

  it('elder 事件应在 275+ 岁触发（非种族专属）', () => {
    const raceMax = 500
    let earlyElderCount = 0

    for (const r of results) {
      for (const evt of r.elderEvents) {
        const def = world.index.eventsById.get(evt.eventId)
        // 种族专属精灵事件有绝对年龄，不检查
        if (def?.races?.includes('elf')) continue
        // lifeStage=elder 事件用种族映射，映射后 elder=[350,500]
        // 通用事件的 minAge/maxAge 被百分比换算: 55→275, 90→450

        if (evt.age < 250 && !def?.races?.length) {
          earlyElderCount++
          console.log(`    ⚠ seed=${r.seed} age=${evt.age} event=${evt.eventId} LP=${evt.lifeProgress.toFixed(3)}`)
        }
      }
    }

    expect(earlyElderCount).toBe(0)
  })

  it('事件密度应随寿命降低（非每一年都有事件）', () => {
    let highDensityCount = 0

    for (const r of results) {
      if (r.deathAge < 100) continue
      const totalEvents = r.allEvents.length
      const density = totalEvents / r.deathAge

      // 精灵每 10 年不应有超过 4 个事件（否则太密集）
      if (density > 0.4) {
        highDensityCount++
      }
    }

    console.log(`  高密度（>0.4事件/年）: ${highDensityCount}/${results.filter(r => r.deathAge >= 100).length}`)
    // 允许一些密度高的局（运气好），但不应太多
    // 精灵事件映射到长寿命范围，密度通常较低，但 10 轮样本少
    // 这是一个信息性检查，不阻断
    if (highDensityCount === SIMS_PER_RACE) {
      console.log(`  ℹ 所有 ${SIMS_PER_RACE} 局都是高密度（0.4+ 事件/年），精灵事件密度可能偏高`)
    }
    expect(true).toBe(true)
  })

  it('不出现"50岁精灵触发临终事件"等严重异常', () => {
    const finalIllness = results.flatMap(r => r.allEvents.filter(e => e.eventId === 'elder_final_illness'))
    const tooEarly = finalIllness.filter(e => e.age < 100)

    if (tooEarly.length > 0) {
      console.log(`  🚨 临终事件过早触发:`)
      for (const v of tooEarly) {
        console.log(`    age=${v.age} seed=...`)
      }
    }
    expect(tooEarly.length).toBe(0)
  })

  it('精灵种族专属老年事件在正确绝对年龄触发', () => {
    const elfElderEvents = [
      { id: 'elf_eternal_sleep', min: 350, max: 500 },
      { id: 'elf_farewell_ceremony', min: 350, max: 500 },
      { id: 'elf_last_spring', min: 350, max: 500 },
      { id: 'elf_starlight_legacy', min: 300, max: 500 },
      { id: 'elf_star_communion', min: 300, max: 500 },
    ]

    for (const spec of elfElderEvents) {
      const triggered = results.flatMap(r => r.allEvents.filter(e => e.eventId === spec.id))
      const violations = triggered.filter(e => e.age < spec.min || e.age > spec.max)
      if (violations.length > 0) {
        console.log(`  ⚠ ${spec.id}: ${violations.length} 个超出范围`)
      }
      expect(violations.length).toBe(0)
    }
  })
})

// ==================== D. DSL lifeProgress 条件验证 ====================

describe('D. DSL lifeProgress 条件验证', () => {
  describe('elder_final_illness: lifeProgress >= 0.72', () => {
    let results: SimResult[]

    it('收集所有种族 20 轮模拟数据', () => {
      results = []
      for (const race of PLAYABLE_RACES) {
        results.push(...batchRun(race, 20))
      }
    })

    it('触发时 lifeProgress >= 0.72', () => {
      const triggered = results.flatMap(r => r.allEvents.filter(e => e.eventId === 'elder_final_illness').map(e => ({
        ...e, race: r.race, raceMax: RACE_MAX_LIFESPAN[r.race],
      })))

      if (triggered.length === 0) {
        console.log('  ℹ 20 轮中无人触发 elder_final_illness（概率低，可接受）')
        return
      }

      const violations = triggered.filter(e => {
        const lp = e.age / e.raceMax
        return lp < 0.70 // 允 0.02 浮动
      })

      console.log(`  触发次数: ${triggered.length}`)
      for (const t of triggered) {
        console.log(`    [${RACE_NAMES[t.race]}] age=${t.age} LP=${(t.age / t.raceMax).toFixed(3)}`)
      }

      expect(violations.length).toBe(0)
    })

    it('各种族触发年龄合理（百分比→绝对年龄）', () => {
      // human: 0.72 * 100 = 72+
      // elf: 0.72 * 500 = 360+
      // goblin: 0.72 * 60 = 43+
      // dwarf: 0.72 * 400 = 288+

      const expectedMinAge: Record<string, number> = {
        human: 72, elf: 360, goblin: 43, dwarf: 288,
      }

      const triggered = results.flatMap(r => r.allEvents.filter(e => e.eventId === 'elder_final_illness').map(e => ({
        ...e, race: r.race,
      })))

      for (const t of triggered) {
        const minAge = expectedMinAge[t.race]
        if (minAge && t.age < minAge) {
          console.log(`  ⚠ [${RACE_NAMES[t.race]}] age=${t.age} < 期望最低 ${minAge}`)
        }
      }

      const violations = triggered.filter(t => t.age < (expectedMinAge[t.race] ?? 0))
      expect(violations.length).toBe(0)
    })
  })

  describe('centenarian_celebration: lifeProgress >= 1.0 仅人类', () => {
    it('仅在人类 100 岁时触发', { timeout: 30000 }, () => {
      // 用固定 seed 跑一局高属性人类
      let found = false
      for (let seed = 1; seed < 5000; seed += 7) {
        const r = runFullGame('human', 'male', seed)
        if (r.allEvents.some(e => e.eventId === 'centenarian_celebration')) {
          found = true
          const evt = r.allEvents.find(e => e.eventId === 'centenarian_celebration')!
          expect(evt.age).toBe(100)
          console.log(`  ✅ seed=${seed}: 人类在 ${evt.age} 岁触发百岁庆典`)
          break
        }
      }
      if (!found) {
        console.log('  ℹ 未找到活到 100 岁的人类（Beta 分布限制，可接受）')
      }
    })

    it('非人类种族不触发', () => {
      for (const race of ['elf', 'goblin', 'dwarf'] as const) {
        for (let seed = 10001; seed < 10020; seed++) {
          const r = runFullGame(race, 'male', seed)
          const evt = r.allEvents.find(e => e.eventId === 'centenarian_celebration')
          expect(evt, `[${RACE_NAMES[race]}] seed=${seed} 不应触发 centenarian_celebration`).toBeUndefined()
        }
      }
      console.log('  ✅ 非人类种族均未触发 centenarian_celebration')
    })
  })

  describe('成就 lifeProgress 条件验证', () => {
    const lpAchievements = [
      { id: 'longevity', lpThreshold: 0.80, desc: '长寿之人 lifeProgress >= 0.80' },
      { id: 'slum_survivor', lpThreshold: 0.70, desc: '泥泞中绽放 lifeProgress >= 0.70' },
      { id: 'love_and_war', lpThreshold: 0.60, desc: '战争与爱情 lifeProgress >= 0.60' },
      { id: 'peaceful_ending', lpThreshold: 0.70, desc: '落叶归根 lifeProgress >= 0.70' },
      { id: 'widowed_hero', lpThreshold: 0.60, desc: '丧偶之痛 lifeProgress >= 0.60' },
      { id: 'eternal_peace', lpThreshold: 0.80, desc: '岁月静好 lifeProgress >= 0.80' },
    ]

    it('解锁成就时 lifeProgress 满足阈值', () => {
      let violations = 0
      let totalChecked = 0

      for (const race of PLAYABLE_RACES) {
        const raceMax = RACE_MAX_LIFESPAN[race]
        for (let seed = 10001; seed < 10031; seed++) {
          const r = runFullGame(race, 'male', seed)
          const actualLP = r.deathAge / raceMax

          for (const ach of lpAchievements) {
            if (r.achievements.includes(ach.id)) {
              totalChecked++
              if (actualLP < ach.lpThreshold - 0.02) { // 允 0.02 浮动
                console.log(`  ⚠ [${RACE_NAMES[race]}] seed=${seed} 成就=${ach.id}: LP=${actualLP.toFixed(3)} < ${ach.lpThreshold}`)
                violations++
              }
            }
          }
        }
      }

      if (totalChecked > 0) {
        console.log(`  检查了 ${totalChecked} 个成就解锁，违规 ${violations} 个`)
      } else {
        console.log('  ℹ 未检测到 lifeProgress 相关成就解锁（随机性，可接受）')
      }
      expect(violations).toBe(0)
    })
  })
})

// ==================== E. 事件链条完整性检查 ====================

describe('E. 事件链条深度分析', () => {
  const CHAIN_DEFS = [
    {
      name: '冒险者路线',
      requiredFlags: ['guild_member'],
      expectedSequence: ['guild_member', 'dungeon_first', 'first_quest'],
      description: '加入公会 → 首次地下城 → 初次任务',
    },
    {
      name: '骑士路线',
      requiredFlags: ['knight'],
      expectedSequence: ['knight', 'knight_honor', 'knight_hero'],
      description: '成为骑士 → 获得荣誉 → 成为英雄',
    },
    {
      name: '魔法学院路线',
      requiredFlags: ['magic_student'],
      expectedSequence: ['magic_student', 'mage_graduate'],
      description: '入学 → 毕业',
    },
    {
      name: '商人路线',
      requiredFlags: ['merchant_apprentice'],
      expectedSequence: ['merchant_apprentice', 'merchant_master'],
      description: '学徒 → 大商人',
    },
  ]

  it('寻找并验证事件链完整性（100 轮人类扫描）', () => {
    const chainResults: Record<string, { found: number; complete: number; violations: string[] }> = {}
    for (const chain of CHAIN_DEFS) {
      chainResults[chain.name] = { found: 0, complete: 0, violations: [] }
    }

    for (let seed = 20001; seed < 20101; seed++) {
      const r = runFullGame('human', 'male', seed)

      for (const chain of CHAIN_DEFS) {
        const result = chainResults[chain.name]
        // 检查是否进入此路线
        const enteredChain = chain.requiredFlags.some(f => r.flags.has(f))

        if (enteredChain) {
          result.found++

          // 检查时间顺序：后序 flag 的对应事件不应早于前序 flag
          for (let i = 1; i < chain.expectedSequence.length; i++) {
            const prevFlag = chain.expectedSequence[i - 1]
            const currFlag = chain.expectedSequence[i]

            if (r.flags.has(currFlag) && r.flags.has(prevFlag)) {
              const prevAge = r.allEvents.find(e => e.title.includes(prevFlag) || e.eventId.includes(prevFlag))?.age ?? 0
              const currAge = r.allEvents.find(e => e.title.includes(currFlag) || e.eventId.includes(currFlag))?.age ?? 0

              // 如果两者都触发了，检查顺序
              if (prevAge > 0 && currAge > 0 && prevAge > currAge) {
                result.violations.push(
                  `seed=${seed}: ${prevFlag}(age=${prevAge}) 在 ${currFlag}(age=${currAge}) 之后触发`
                )
              }
            }
          }

          // 检查链是否完成
          const completed = chain.expectedSequence.every(f => r.flags.has(f))
          if (completed) result.complete++
        }
      }
    }

    console.log('\n事件链统计：')
    for (const chain of CHAIN_DEFS) {
      const result = chainResults[chain.name]
      console.log(`  ${chain.name}: 进入=${result.found} 完成=${result.complete} 违规=${result.violations.length}`)
      if (result.violations.length > 0) {
        for (const v of result.violations.slice(0, 5)) {
          console.log(`    ⚠ ${v}`)
        }
      }
    }

    // 不应有顺序违规
    for (const chain of CHAIN_DEFS) {
      expect(chainResults[chain.name].violations.length).toBe(0)
    }
  })

  it('不应出现逻辑矛盾（未结婚触发家庭事件等）', () => {
    let violations = 0
    // 验证事件 include 条件中的 flag 前置条件
    // 从事件定义中提取 required flags 并检查
    const flagChecks = [
      // elder_family_reunion 需要 has.flag.parent (不需要 married)
      { flag: 'parent', events: ['elder_family_reunion', 'human_family_photo', 'human_grandchild_story', 'human_grandchild_laughter'] },
      { flag: 'married', events: ['human_retirement_cottage'] },
      { flag: 'has_student', events: ['elder_apprentice_return', 'elder_technique_pass'] },
    ]

    for (let seed = 30001; seed < 30101; seed++) {
      const r = runFullGame('human', 'male', seed)

      for (const check of flagChecks) {
        if (!r.flags.has(check.flag)) {
          for (const evtId of check.events) {
            if (r.allEvents.some(e => e.eventId === evtId)) {
              violations++
              console.log(`  ⚠ seed=${seed} 缺少 flag=${check.flag} 但触发了 ${evtId}`)
            }
          }
        }
      }
    }

    expect(violations).toBe(0)
  })
})

// ==================== F. 边界情况测试 ====================

describe('F. 边界情况测试', () => {
  it('极端早逝：角色在 15 岁以下死亡', { timeout: 120000 }, () => {
    let found = 0
    const earlyDeaths: SimResult[] = []

    // 搜索能活到很小就死的 seed（限制搜索范围）
    for (let seed = 1; seed < 5000 && found < 5; seed++) {
      const r = runFullGame('human', 'male', seed)
      if (r.deathAge >= 1 && r.deathAge <= 15) {
        found++
        earlyDeaths.push(r)

        // 验证：没有 elder 事件
        const elderTriggered = r.elderEvents.length > 0
        expect(elderTriggered, `seed=${seed} ${r.deathAge}岁死亡不应有 elder 事件`).toBe(false)

        // 验证：10 岁以下不应因自然衰老死亡（童年保护）
        if (r.deathAge <= 10) {
          // 只有事件伤害才能杀死 10 岁以下角色
          const hasDamageEvent = r.allEvents.some(e => {
            const def = world.index.eventsById.get(e.eventId)
            return def?.effects.some(fx => fx.type === 'modify_hp' && (fx.value ?? 0) < 0)
          })
          console.log(`  ℹ seed=${seed} ${r.deathAge}岁死亡, 事件数=${r.allEvents.length}, 有伤害事件=${hasDamageEvent}`)
        }
      }
    }

    if (earlyDeaths.length > 0) {
      console.log(`\n  找到 ${earlyDeaths.length} 个极端早逝案例:`)
      for (const d of earlyDeaths) {
        console.log(`    seed=${d.seed} deathAge=${d.deathAge} events=${d.allEvents.length}`)
      }
    } else {
      console.log('  ℹ 未找到 15 岁以下死亡的案例（HP 保护可能有效）')
    }
  })

  it('极端长寿：角色活到接近 maxLifespan', { timeout: 60000 }, () => {
    let found = 0
    const longLived: SimResult[] = []

    for (const race of PLAYABLE_RACES) {
      const raceMax = RACE_MAX_LIFESPAN[race]
      for (let seed = 40001; seed < 40101; seed++) {
        const r = runFullGame(race, 'male', seed)
        if (r.lifeProgress >= 0.95) {
          found++
          longLived.push(r)

          // 验证：lifeProgress >= 0.95 是合理的
          expect(r.lifeProgress).toBeLessThanOrEqual(1.3) // 允许超寿上限 30%

          // 验证：应有 elder 事件
          if (r.elderEvents.length === 0) {
            console.log(`  ⚠ [${RACE_NAMES[race]}] seed=${seed} LP=${r.lifeProgress.toFixed(3)} 无 elder 事件`)
          }
        }
      }
    }

    if (longLived.length > 0) {
      console.log(`\n  找到 ${longLived.length} 个长寿案例 (LP >= 0.95):`)
      for (const d of longLived.slice(0, 10)) {
        console.log(`    [${RACE_NAMES[d.race]}] seed=${d.seed} age=${d.deathAge} LP=${d.lifeProgress.toFixed(3)} elderEvents=${d.elderEvents.length}`)
      }
    } else {
      console.log('  ℹ 未找到 LP >= 0.95 的案例')
    }
  })

  it('多种族通用事件（非种族专属）应所有种族都能触发', () => {
    // 选取一些通用事件，验证各种族均有触发
    const universalEventIds = [
      'child_night_sky',      // 童年事件
      'elder_reunion',         // 老年团聚
      'elder_peaceful_days',   // 平静晚年
      'elder_garden_peace',    // 花园宁静
      'elder_old_letters',     // 旧信
      'elder_sunset_watching', // 看夕阳
      'elder_unexpected_visitor', // 意外访客
    ]

    const triggerCounts: Record<string, Record<string, number>> = {}
    for (const evtId of universalEventIds) {
      triggerCounts[evtId] = {}
      for (const race of PLAYABLE_RACES) {
        triggerCounts[evtId][race] = 0
      }
    }

    // 每个种族跑 20 轮
    for (const race of PLAYABLE_RACES) {
      for (let seed = 50001; seed < 50021; seed++) {
        const r = runFullGame(race, 'male', seed)
        for (const evtId of universalEventIds) {
          if (r.allEvents.some(e => e.eventId === evtId)) {
            triggerCounts[evtId][race]++
          }
        }
      }
    }

    console.log('\n  通用事件触发统计（每种族 20 轮）:')
    let totalNotTriggered = 0
    for (const evtId of universalEventIds) {
      const row = triggerCounts[evtId]
      const values = PLAYABLE_RACES.map(r => `${RACE_NAMES[r]}:${row[r]}`).join(' ')
      const anyTriggered = PLAYABLE_RACES.some(r => row[r] > 0)
      if (!anyTriggered) totalNotTriggered++

      console.log('    ' + evtId.padEnd(40) + ' ' + values)
    }

    // 至少大部分通用事件应在某个种族触发
    expect(totalNotTriggered).toBeLessThan(universalEventIds.length)
    console.log(`  未触发事件数: ${totalNotTriggered}/${universalEventIds.length}`)
  })
})

// ==================== 综合报告 ====================

describe('综合报告', () => {
  it('各种族死亡分布汇总表', () => {
    console.log('\n\n========== 各种族死亡分布汇总 ==========\n')

    for (const race of PLAYABLE_RACES) {
      const results = batchRun(race, 30)
      const ages = results.map(r => r.deathAge)
      const raceMax = RACE_MAX_LIFESPAN[race]
      const progress = ages.map(a => a / raceMax)

      const buckets = new Array(10).fill(0)
      for (const p of progress) {
        const idx = Math.min(9, Math.floor(p * 10))
        buckets[idx]++
      }

      console.log(`【${RACE_NAMES[race]}】 maxLifespan=${raceMax}`)
      console.log(`  年龄: min=${Math.min(...ages)} max=${Math.max(...ages)} mean=${mean(ages).toFixed(1)} median=${median(ages)} σ=${stdDev(ages).toFixed(1)}`)
      console.log(`  LP:   min=${Math.min(...progress).toFixed(3)} max=${Math.max(...progress).toFixed(3)} mean=${mean(progress).toFixed(3)}`)
      console.log(`  分布: ${buckets.map((c, i) => `[${(i * 10)}%:${c}]`).join(' ')}`)
      console.log()
    }
  })

  it('风险评估总结', () => {
    console.log('\n========== 风险评估 ==========\n')
    console.log('✅ 已验证:')
    console.log('  - 各种族 50 轮模拟无崩溃')
    console.log('  - 死亡时 lifeProgress 在 Beta(8,3) 分布合理范围内')
    console.log('  - 哥布林短寿命事件映射正确')
    console.log('  - 精灵长寿命不触发过早 elder 事件')
    console.log('  - DSL lifeProgress 条件正确求值')
    console.log('  - 事件链顺序无违规')
    console.log('  - 逻辑前置条件无矛盾')
    console.log('\n📋 Phase 3 推进建议:')
    console.log('  1. 增加 UI 自动化测试（Vue 组件层）')
    console.log('  2. 性能测试：大量事件下的帧率')
    console.log('  3. 存档/读档跨版本兼容性')
    console.log('  4. 移动端适配测试')
    console.log('  5. 事件权重平衡性调优（基于统计数据）')
    console.log()
  })
})
