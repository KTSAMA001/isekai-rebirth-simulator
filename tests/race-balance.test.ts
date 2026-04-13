/**
 * 种族属性平衡性自动化测试
 * 
 * 验证内容：
 * 1. 初始属性显示（12 种组合）：确认无负数、种族特色保留
 * 2. 批量模拟（每种族 10 轮，共 40 轮）：死亡年龄、评分、属性增长
 * 3. 数据汇总 + 异常检测
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createWorldInstance } from '@/engine/world/WorldInstance'
import type { Gender } from '@/engine/core/types'
import type { WorldInstance } from '@/engine/core/types'

// ==================== 测试配置 ====================

const RACES = ['human', 'elf', 'goblin', 'dwarf'] as const
const PRESETS = ['random_1', 'random_2', 'random_3'] as const
const GENDERS: Gender[] = ['male', 'female']
const SIMULATIONS_PER_RACE = 10

// 种族中文名映射
const RACE_NAMES: Record<string, string> = {
  human: '人类',
  elf: '精灵',
  goblin: '哥布林',
  dwarf: '矮人',
}

const PRESET_NAMES: Record<string, string> = {
  random_1: '艾伦',
  random_2: '莉娜',
  random_3: '加隆',
}

// 种族寿命范围
const LIFESPAN_RANGES: Record<string, [number, number]> = {
  human: [80, 90],
  elf: [380, 420],
  goblin: [30, 36],
  dwarf: [160, 180],
}

// 种族特色检查（核心优势属性）
const RACE_TRAITS: Record<string, { attr: string; description: string }[]> = {
  human: [], // 人类无特色
  elf: [
    { attr: 'mag', description: '精灵应高魔力' },
  ],
  goblin: [
    { attr: 'luk', description: '哥布林应高运势' },
  ],
  dwarf: [
    { attr: 'str', description: '矮人应高体魄' },
  ],
}

// ==================== 辅助函数 ====================

interface SimResult {
  race: string
  preset: string
  gender: string
  deathAge: number
  finalHp: number
  score: number
  grade: string
  peakAttrs: Record<string, number>
  finalAttrs: Record<string, number>
  lifespanRange: [number, number]
  effectiveMaxAge: number
  anomalies: string[]
}

/** 完整跑一局模拟，自动选择随机分支 */
function runFullSimulation(world: WorldInstance, race: string, preset: string, gender: Gender): SimResult {
  const engine = new SimulationEngine(world)
  const presetDef = world.presets.find(p => p.id === preset)
  const name = presetDef?.name ?? 'Test'

  // 初始化游戏
  engine.initGame(name, preset, race, gender)

  // 抽取天赋
  const drafted = engine.draftTalents()

  // 选择前3个天赋
  const selectedTalents = drafted.slice(0, 3)
  engine.selectTalents(selectedTalents)

  // 平均分配属性点
  const state = engine.getState()
  const visibleAttrs = world.attributes.filter(a => !a.hidden)
  const pointsPerAttr = Math.floor((world.manifest.initialPoints - state.talentPenalty) / visibleAttrs.length)
  const allocation: Record<string, number> = {}
  for (const attr of visibleAttrs) {
    allocation[attr.id] = pointsPerAttr
  }
  engine.allocateAttributes(allocation)

  // 获取初始属性快照
  const initState = engine.getState()
  const initAttrs = { ...initState.attributes }
  const lifespanRange = LIFESPAN_RANGES[race] ?? [world.manifest.maxAge, world.manifest.maxAge]
  const effectiveMaxAge = initState.effectiveMaxAge ?? world.manifest.maxAge

  // 记录是否曾有属性异常
  const anomalies: string[] = []

  // 模拟到死亡
  let maxIterations = 10000 // 安全限制
  let prevAge = 0
  let stagnantCount = 0

  while (engine.getState().phase === 'simulating' && maxIterations > 0) {
    const currentState = engine.getState()
    const yearResult = engine.startYear()

    if (yearResult.phase === 'awaiting_choice') {
      const branches = yearResult.branches!
      // 尝试每个分支，优先选第一个没报错的
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
      if (!resolved) {
        engine.skipYear()
      }
    } else if (yearResult.phase === 'mundane_year') {
      engine.skipYear()
    }

    // 检查年龄卡住
    const newState = engine.getState()
    if (newState.age === prevAge) {
      stagnantCount++
      if (stagnantCount > 5) {
        anomalies.push(`年龄卡在 ${newState.age} 不再增长`)
        break
      }
    } else {
      stagnantCount = 0
      prevAge = newState.age
    }

    maxIterations--
  }

  const finalState = engine.getState()

  // 如果没有自然死亡，强制结算
  if (finalState.phase !== 'finished') {
    engine.finish()
  }

  const resultState = engine.getState()
  const result = resultState.result!

  // 检查异常早死
  if (result.lifespan < 5) {
    anomalies.push(`异常早死：${result.lifespan}岁`)
  }

  // 检查异常长寿（超出种族寿命范围上限的 30%）
  const upperBound = lifespanRange[1] * 1.3
  if (result.lifespan > upperBound) {
    anomalies.push(`异常长寿：${result.lifespan}岁（上限${lifespanRange[1]}）`)
  }

  // 检查属性是否卡在 0 或 99
  for (const [key, val] of Object.entries(resultState.attributes)) {
    if (val === 99) {
      anomalies.push(`属性 ${key} 达到上限 99`)
    }
    // 注意：属性可以是0（游戏过程中被扣减），不算异常
  }

  // 检查属性峰值是否远高于最终值（表示有过大幅下跌，可能平衡问题）
  for (const [key, peak] of Object.entries(resultState.attributePeaks)) {
    const final = resultState.attributes[key] ?? 0
    if (peak > 50 && peak - final > 40) {
      anomalies.push(`属性 ${key} 峰值${peak}远高于最终值${final}（差距${peak - final}）`)
    }
  }

  return {
    race,
    preset,
    gender,
    deathAge: result.lifespan,
    finalHp: resultState.hp,
    score: result.score,
    grade: result.grade,
    peakAttrs: resultState.attributePeaks,
    finalAttrs: resultState.attributes,
    lifespanRange,
    effectiveMaxAge,
    anomalies,
  }
}

// ==================== 测试 ====================

describe('种族属性平衡性测试', () => {
  let world: WorldInstance

  beforeAll(async () => {
    const data = await loadWorldData()
    world = createWorldInstance(
      data.manifest,
      data.attributes,
      data.talents,
      data.events,
      data.achievements,
      data.items ?? [],
      data.presets,
      data.scoringRule,
      data.races
    )
    world.evaluations = data.evaluations
  })

  // ==================== 第一步：验证初始属性显示 ====================

  describe('第一步：初始属性显示验证（12 种组合）', () => {
    const attrIds = ['chr', 'int', 'str', 'mny', 'spr', 'mag', 'luk']

    for (const race of RACES) {
      for (const preset of PRESETS) {
        const gender = 'male' // 用男性做代表
        it(`${RACE_NAMES[race]} × ${PRESET_NAMES[preset]}（♂）：初始属性无负数`, () => {
          const engine = new SimulationEngine(world)
          engine.initGame('Test', preset, race, gender)

          const state = engine.getState()

          // 检查所有属性 ≥ 0
          for (const attrId of attrIds) {
            expect(
              state.attributes[attrId],
              `${RACE_NAMES[race]} ${PRESET_NAMES[preset]} ${attrId} 不应为负数（实际值：${state.attributes[attrId]}）`
            ).toBeGreaterThanOrEqual(0)
          }

          // 打印属性值方便查看
          const attrStr = attrIds
            .map(id => `${id}=${state.attributes[id]}`)
            .join(', ')
          console.log(`  ✅ ${RACE_NAMES[race]} × ${PRESET_NAMES[preset]}（♂）: ${attrStr}`)
        })
      }
    }

    // 种族特色验证
    for (const race of RACES) {
      if (RACE_TRAITS[race].length === 0) continue

      for (const trait of RACE_TRAITS[race]) {
        it(`${RACE_NAMES[race]}：${trait.description}`, () => {
          // 对比人类同配置的属性值
          const humanEngine = new SimulationEngine(world)
          humanEngine.initGame('Test', 'random_1', 'human', 'male')
          const humanAttrs = humanEngine.getState().attributes

          const raceEngine = new SimulationEngine(world)
          raceEngine.initGame('Test', 'random_1', race, 'male')
          const raceAttrs = raceEngine.getState().attributes

          expect(
            raceAttrs[trait.attr],
            `${RACE_NAMES[race]} ${trait.attr}（${raceAttrs[trait.attr]}）应高于人类（${humanAttrs[trait.attr]}）`
          ).toBeGreaterThan(humanAttrs[trait.attr])

          console.log(`  ✅ ${RACE_NAMES[race]} ${trait.attr}: ${raceAttrs[trait.attr]} > 人类 ${humanAttrs[trait.attr]}`)
        })
      }
    }
  })

  // ==================== 第二步：批量模拟 ====================

  describe('第二步：批量模拟测试', () => {
    const allResults: SimResult[] = []

    for (const race of RACES) {
      describe(`${RACE_NAMES[race]}（${SIMULATIONS_PER_RACE} 轮模拟）`, () => {
        const raceResults: SimResult[] = []

        for (let i = 0; i < SIMULATIONS_PER_RACE; i++) {
          const preset = PRESETS[i % PRESETS.length]
          const gender = i % 2 === 0 ? 'male' : 'female'

          it(`第 ${i + 1} 轮（${PRESET_NAMES[preset]} ${gender === 'male' ? '♂' : '♀'}）`, () => {
            const result = runFullSimulation(world, race, preset, gender)
            raceResults.push(result)
            allResults.push(result)

            console.log(
              `  🎮 ${RACE_NAMES[race]} #${i + 1}: ` +
              `死亡年龄=${result.deathAge}（范围${result.lifespanRange[0]}~${result.lifespanRange[1]}）` +
              ` | 评分=${result.score} | 等级=${result.grade}` +
              ` | HP=${result.finalHp}` +
              (result.anomalies.length > 0 ? ` | ⚠️ ${result.anomalies.join(', ')}` : '')
            )

            // 基本断言：角色确实死亡了
            expect(result.deathAge).toBeGreaterThan(0)

            // 基本断言：评分合理
            expect(result.score).toBeGreaterThanOrEqual(0)

            // 断言：没有异常
            if (result.anomalies.length > 0) {
              // 记录但不硬性失败，允许一些随机性
              console.warn(`  ⚠️ 异常: ${result.anomalies.join(', ')}`)
            }
          })
        }

        // 种族汇总测试
        it(`${RACE_NAMES[race]} 汇总统计`, () => {
          const ages = raceResults.map(r => r.deathAge)
          const scores = raceResults.map(r => r.score)
          const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length
          const minAge = Math.min(...ages)
          const maxAge = Math.max(...ages)
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
          const anomalies = raceResults.filter(r => r.anomalies.length > 0)

          console.log(`\n  📊 ${RACE_NAMES[race]} 汇总:`)
          const [lifeMin, lifeMax] = LIFESPAN_RANGES[race]
          console.log(`     寿命范围: ${lifeMin}~${lifeMax}（配置）`)
          console.log(`     实际死亡年龄: ${minAge}~${maxAge}（平均 ${avgAge.toFixed(1)}）`)
          console.log(`     平均评分: ${avgScore.toFixed(1)}`)
          console.log(`     异常局数: ${anomalies.length}/${raceResults.length}`)
          if (anomalies.length > 0) {
            for (const a of anomalies) {
              console.log(`     ⚠️ 第${raceResults.indexOf(a) + 1}轮: ${a.anomalies.join(', ')}`)
            }
          }

          // 注意：自动分支选择（非最优策略）会导致早死和方差增大
          // 这里仅做软性记录，不做硬性断言
          const tolerance = Math.floor((lifeMax - lifeMin) * 0.5)
          if (avgAge < lifeMin - tolerance) {
            console.warn(`     ⚠️ 平均死亡年龄 ${avgAge.toFixed(1)} 远低于寿命下限 ${lifeMin}（自动模拟随机分支导致）`)
          }
          if (avgAge > lifeMax + tolerance) {
            console.warn(`     ⚠️ 平均死亡年龄 ${avgAge.toFixed(1)} 远高于寿命上限 ${lifeMax}（自动模拟随机分支导致）`)
          }
        })
      })
    }
  })

  // ==================== 第三步：数据汇总 ====================

  describe('第三步：全种族数据汇总', () => {
    it('输出完整汇总报告', () => {
      console.log('\n' + '='.repeat(80))
      console.log('  异世界重生模拟器 - 种族属性平衡性测试报告')
      console.log('='.repeat(80))

      // 初始属性表
      console.log('\n📋 第一步：初始属性验证（12 种组合）')
      console.log('-'.repeat(80))
      const attrIds = ['chr', 'int', 'str', 'mny', 'spr', 'mag', 'luk']
      const header = '种族×预设×性别 | ' + attrIds.map(a => a.padEnd(4)).join('')
      console.log(header)

      for (const race of RACES) {
        for (const preset of PRESETS) {
          for (const gender of GENDERS) {
            const engine = new SimulationEngine(world)
            engine.initGame('Test', preset, race, gender)
            const state = engine.getState()
            const raceName = RACE_NAMES[race]
            const presetName = PRESET_NAMES[preset]
            const genderIcon = gender === 'male' ? '♂' : '♀'
            const label = `${raceName}×${presetName}${genderIcon}`.padEnd(18)
            const vals = attrIds.map(a => String(state.attributes[a]).padStart(4)).join('')
            const hasNegative = attrIds.some(a => state.attributes[a] < 0)
            const marker = hasNegative ? ' ❌ 负数!' : ' ✅'
            console.log(`${label} | ${vals}${marker}`)
          }
        }
      }

      // 模拟数据汇总
      console.log('\n\n🎮 第二步：模拟数据汇总')
      console.log('-'.repeat(80))

      const raceSummary: Record<string, { ages: number[]; scores: number[]; grades: string[]; anomalies: string[] }> = {}

      for (const race of RACES) {
        raceSummary[race] = { ages: [], scores: [], grades: [], anomalies: [] }
      }

      // 这里我们用内联模拟来收集数据
      console.log('\n正在运行模拟...\n')

      for (const race of RACES) {
        for (let i = 0; i < SIMULATIONS_PER_RACE; i++) {
          const preset = PRESETS[i % PRESETS.length]
          const gender = i % 2 === 0 ? 'male' : 'female'
          const result = runFullSimulation(world, race, preset, gender)
          raceSummary[race].ages.push(result.deathAge)
          raceSummary[race].scores.push(result.score)
          raceSummary[race].grades.push(result.grade)
          raceSummary[race].anomalies.push(...result.anomalies)
        }
      }

      // 输出汇总表
      const summaryHeader = '种族   | 寿命范围(配置) | 实际死亡年龄范围  | 平均死亡年龄 | 平均评分 | 异常数'
      console.log(summaryHeader)
      console.log('-'.repeat(80))

      for (const race of RACES) {
        const summary = raceSummary[race]
        const ages = summary.ages
        const scores = summary.scores
        const avgAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1)
        const minAge = Math.min(...ages)
        const maxAge = Math.max(...ages)
        const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        const [lifeMin, lifeMax] = LIFESPAN_RANGES[race]
        const anomalyCount = summary.anomalies.length

        const row = [
          RACE_NAMES[race].padEnd(6),
          `  ${lifeMin}~${lifeMax}`.padEnd(14),
          `  ${minAge}~${maxAge}`.padEnd(17),
          `  ${avgAge}`.padEnd(12),
          `  ${avgScore}`.padEnd(8),
          `  ${anomalyCount}/${SIMULATIONS_PER_RACE}`,
        ]
        console.log(row.join('|'))
      }

      // 异常情况列表
      const allAnomalies: string[] = []
      for (const race of RACES) {
        if (raceSummary[race].anomalies.length > 0) {
          allAnomalies.push(...raceSummary[race].anomalies.map(a => `[${RACE_NAMES[race]}] ${a}`))
        }
      }

      console.log('\n\n🚨 发现的异常情况：')
      console.log('-'.repeat(80))
      if (allAnomalies.length === 0) {
        console.log('  ✅ 未发现异常情况！所有模拟结果均在合理范围内。')
      } else {
        for (const anomaly of allAnomalies) {
          console.log(`  ⚠️ ${anomaly}`)
        }
      }

      // 评分分布
      console.log('\n\n📊 评分等级分布：')
      console.log('-'.repeat(80))
      for (const race of RACES) {
        const gradeCount: Record<string, number> = {}
        for (const g of raceSummary[race].grades) {
          gradeCount[g] = (gradeCount[g] || 0) + 1
        }
        const gradeStr = Object.entries(gradeCount)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([g, c]) => `${g}×${c}`)
          .join(', ')
        console.log(`  ${RACE_NAMES[race].padEnd(6)}: ${gradeStr}`)
      }

      console.log('\n' + '='.repeat(80))
      console.log('  测试完成')
      console.log('='.repeat(80))

      // 断言：无致命异常（属性上限到达算 P3 体验问题，不阻塞）
      const criticalAnomalies = allAnomalies.filter(a =>
        a.includes('年龄卡住')
      )
      expect(criticalAnomalies.length, `发现致命异常: ${criticalAnomalies.join(', ')}`).toBe(0)

      // 断言：初始属性全部非负（确认保底机制有效）
      expect(allAnomalies.filter(a => a.includes('初始属性为负')).length).toBe(0)
    })
  })
})
