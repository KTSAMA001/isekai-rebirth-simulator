/**
 * QA 第三轮验证 - D&D 实际中位寿命对齐
 * 4个可玩种族各30局，随机属性分配
 *
 * 运行: npx vitest run tests/qa-round3-dd-lifespan.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'

type RunResult = {
  race: string; gender: string; seed: number; effectiveMaxAge: number
  finalAge: number; initHp: number; grade: string; score: number
  eventCount: number; deathNatural: boolean
}

const RUNS_PER_GENDER = 15 // 15×2性别 = 30局/种族

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (seed >>> 0) / 0xFFFFFFFF
  }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function stddev(arr: number[]): number {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}

function runPlaythrough(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  race: string,
  gender: 'male' | 'female',
  seed: number
): RunResult {
  const engine = new SimulationEngine(world, seed)
  engine.initGame('QA', undefined, race, gender)
  let state = engine.getState()
  const effectiveMaxAge = state.effectiveMaxAge

  // 天赋选择
  const draftPool = engine.draftTalents()
  engine.selectTalents(draftPool.slice(0, Math.min(3, draftPool.length)))
  state = engine.getState()

  // 随机属性分配
  const availablePoints = world.manifest.initialPoints - state.talentPenalty
  const attrIds = Object.keys(state.attributes).filter(k => !k.endsWith('_display'))
  const allocation: Record<string, number> = {}
  let remaining = availablePoints
  const rng = seededRandom(seed * 7 + 13)
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

  let eventCount = 0
  let maxIterations = effectiveMaxAge + 100

  while (state.phase === 'simulating' && maxIterations-- > 0) {
    const result = engine.startYear()

    if (result.phase === 'mundane_year') {
      engine.skipYear()
      state = engine.getState()
      continue
    }

    // 有事件 — 计数
    if (result.event) eventCount++

    // 自动分支选择 — 只选前置条件满足的分支，否则选无条件分支
    if (result.branches && result.branches.length > 0) {
      const validBranches = result.branches
      const branch = validBranches[Math.floor(rng() * validBranches.length)]
      try {
        engine.resolveBranch(branch.id)
      } catch {
        // 条件不满足则跳过
      }
    }

    state = engine.getState()
    if (state.hp <= 0 || state.phase !== 'simulating') break
  }

  try {
    state = engine.finish()
  } catch {
    // 可能已 finished
  }
  state = engine.getState()
  return {
    race, gender, seed, effectiveMaxAge,
    finalAge: state.age, initHp,
    grade: state.result?.grade ?? 'D', score: state.result?.score ?? 0,
    eventCount, deathNatural: state.hp <= 0,
  }
}

describe('QA 第三轮验证 - D&D 中位寿命对齐', () => {
  const RACE_CONFIG = [
    { race: 'human', range: [40, 60], name: '人类' },
    { race: 'elf', range: [250, 400], name: '精灵' },
    { race: 'dwarf', range: [150, 250], name: '矮人' },
    { race: 'goblin', range: [20, 35], name: '哥布林' },
  ] as const

  let world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>

  beforeAll(async () => {
    world = await createSwordAndMagicWorld()
  })

  for (const rc of RACE_CONFIG) {
    describe(`${rc.name} (lifespanRange: ${rc.range[0]}-${rc.range[1]})`, () => {
      const results: RunResult[] = []

      for (const gender of ['male', 'female'] as const) {
        for (let i = 0; i < RUNS_PER_GENDER; i++) {
          it(`${gender} #${i + 1}`, () => {
            const seed = 30000 + rc.race.charCodeAt(0) * 1000 + (gender === 'male' ? 0 : 500) + i * 37
            const result = runPlaythrough(world, rc.race, gender, seed)
            results.push(result)
            expect(result.finalAge).toBeGreaterThan(0)
            expect(result.grade).toMatch(/^[A-Z]+$/)
          })
        }
      }

      it(`汇总: 寿命中位数落入 [${rc.range[0]}-${rc.range[1]}] ±容差`, () => {
        expect(results.length).toBe(RUNS_PER_GENDER * 2)
        const ages = results.map(r => r.finalAge)
        const med = median(ages)
        const tol = Math.max(3, (rc.range[1] - rc.range[0]) * 0.1)
        expect(med, `中位数 ${med.toFixed(1)} 超出 [${rc.range[0] - tol}, ${rc.range[1] + tol}]`)
          .toBeGreaterThanOrEqual(rc.range[0] - tol)
        expect(med, `中位数 ${med.toFixed(1)} 超出 [${rc.range[0] - tol}, ${rc.range[1] + tol}]`)
          .toBeLessThanOrEqual(rc.range[1] + tol)
      })

      it('汇总: 自然死亡率 > 50%', () => {
        const natural = results.filter(r => r.deathNatural).length
        expect(natural / results.length).toBeGreaterThan(0.5)
      })

      it(`汇总: 大部分角色寿命在 range±25% 内`, () => {
        const [lo, hi] = rc.range
        const margin = (hi - lo) * 0.25
        const inRange = results.filter(r => r.finalAge >= lo - margin && r.finalAge <= hi + margin).length
        expect(inRange / results.length).toBeGreaterThan(0.6)
      })

      it('汇总: 至少 2 种不同评级', () => {
        const grades = new Set(results.map(r => r.grade))
        expect(grades.size, `评级种类仅 ${grades.size}，分布过于集中: ${[...grades].join(',')}`)
          .toBeGreaterThanOrEqual(2)
      })
    })
  }

  describe('跨种族平衡', () => {
    it('精灵寿命标准差在合理范围 [15, 60]', () => {
      const elfResults: RunResult[] = []
      for (const gender of ['male', 'female'] as const) {
        for (let i = 0; i < RUNS_PER_GENDER; i++) {
          const seed = 30000 + 'elf'.charCodeAt(0) * 1000 + (gender === 'male' ? 0 : 500) + i * 37
          elfResults.push(runPlaythrough(world, 'elf', gender, seed))
        }
      }
      const sd = stddev(elfResults.map(r => r.finalAge))
      expect(sd, `精灵标准差 ${sd.toFixed(1)} 不在 [15, 60] 范围内`)
        .toBeGreaterThanOrEqual(15)
      expect(sd, `精灵标准差 ${sd.toFixed(1)} 不在 [15, 60] 范围内`)
        .toBeLessThanOrEqual(60)
    })

    it('人类平均事件数 >= 10', () => {
      const humanResults: RunResult[] = []
      for (const gender of ['male', 'female'] as const) {
        for (let i = 0; i < RUNS_PER_GENDER; i++) {
          const seed = 30000 + 'human'.charCodeAt(0) * 1000 + (gender === 'male' ? 0 : 500) + i * 37
          humanResults.push(runPlaythrough(world, 'human', gender, seed))
        }
      }
      const avg = humanResults.reduce((s, r) => s + r.eventCount, 0) / humanResults.length
      expect(avg, `人类平均事件数 ${avg.toFixed(1)} < 10`).toBeGreaterThanOrEqual(10)
    })

    it('哥布林平均事件数 >= 5', () => {
      const gobResults: RunResult[] = []
      for (const gender of ['male', 'female'] as const) {
        for (let i = 0; i < RUNS_PER_GENDER; i++) {
          const seed = 30000 + 'goblin'.charCodeAt(0) * 1000 + (gender === 'male' ? 0 : 500) + i * 37
          gobResults.push(runPlaythrough(world, 'goblin', gender, seed))
        }
      }
      const avg = gobResults.reduce((s, r) => s + r.eventCount, 0) / gobResults.length
      expect(avg, `哥布林平均事件数 ${avg.toFixed(1)} < 5`).toBeGreaterThanOrEqual(5)
    })
  })
})
