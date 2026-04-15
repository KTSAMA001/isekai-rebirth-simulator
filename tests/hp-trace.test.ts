/**
 * HP 衰减追踪测试 - 只追踪 HP，不跑事件，理解纯衰减行为
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import type { Gender, WorldInstance } from '@/engine/core/types'

function runHpTrace(world: WorldInstance, race: string): void {
  const engine = new SimulationEngine(world)
  engine.initGame('Test', 'random_1', race, 'male')

  // 抽天赋
  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, 3))

  // 分配属性
  const state = engine.getState()
  const visibleAttrs = world.attributes.filter(a => !a.hidden)
  const pointsPerAttr = Math.floor((world.manifest.initialPoints - state.talentPenalty) / visibleAttrs.length)
  const allocation: Record<string, number> = {}
  for (const attr of visibleAttrs) allocation[attr.id] = pointsPerAttr
  engine.allocateAttributes(allocation)

  // 获取 internal state
  const initState = engine.getState()
  // @ts-expect-error - 访问私有属性做调试
  const raceMaxLifespan = engine.raceMaxLifespan
  // @ts-expect-error
  const personalDeathProgress = engine.personalDeathProgress
  // @ts-expect-error
  const initialStrRegen = engine.initialStrRegen
  const initHp = Math.max(25, 25 + (initState.attributes['str'] ?? 0) * 3)

  console.log(`\n=== ${race} HP 衰减追踪 ===`)
  console.log(`  initHp=${initHp}, raceMaxLifespan=${raceMaxLifespan}, personalDeathProgress=${personalDeathProgress.toFixed(3)}, regen=${initialStrRegen}`)

  // 模拟到死，每年追踪 HP
  let maxIter = 2000
  let prevAge = 0
  let stagnant = 0

  while (engine.getState().phase === 'simulating' && maxIter > 0) {
    const s = engine.getState()
    const yearResult = engine.startYear()

    if (yearResult.phase === 'awaiting_choice') {
      const branches = yearResult.branches!
      let resolved = false
      for (const branch of branches) {
        try {
          engine.resolveBranch(branch.id)
          resolved = true
          break
        } catch { continue }
      }
      if (!resolved) engine.skipYear()
    } else if (yearResult.phase === 'mundane_year') {
      engine.skipYear()
    }

    const ns = engine.getState()
    if (ns.age === prevAge) {
      stagnant++
      if (stagnant > 5) break
    } else {
      stagnant = 0
      prevAge = ns.age
    }
    maxIter--
  }

  const final = engine.getState()
  if (final.phase !== 'finished') engine.finish()
  console.log(`  死亡年龄: ${engine.getState().result!.lifespan}`)
}

describe('HP 衰减追踪', () => {
  let world: WorldInstance

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events,
      data.achievements, data.items ?? [], data.presets, data.scoringRule, data.races
    )
    world.evaluations = data.evaluations
  })

  it('追踪各 race HP 衰减', { timeout: 30000 }, () => {
    for (const race of ['goblin', 'dwarf', 'human', 'elf']) {
      for (let i = 0; i < 5; i++) {
        runHpTrace(world, race)
      }
    }
  })
})
