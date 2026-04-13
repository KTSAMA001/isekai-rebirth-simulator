/**
 * HP 衰老系统批量模拟验证脚本（第三轮）
 * 衰减量跟回复量挂钩版本
 * 第八轮：种族短寿命补偿（哥布林+2, 人类+1, 矮人/精灵0）
 * 每个种族 20 轮，共 80 轮
 */
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic/index'
import { SimulationEngine } from '../src/engine'

const RACES = [
  { id: 'human', name: '人类', configMedian: 85 },
  { id: 'elf', name: '精灵', configMedian: 400 },
  { id: 'goblin', name: '哥布林', configMedian: 33 },
  { id: 'dwarf', name: '矮人', configMedian: 170 },
] as const

const RUNS_PER_RACE = 20

function simulateOne(engine: SimulationEngine, race: string): { lifespan: number; effectiveMaxAge: number } {
  // initGame
  engine.initGame('测试角色', undefined, race, 'male')

  // draftTalents -> select first 3
  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, 3))

  // allocateAttributes: 平均分配 20 点到所有属性
  const attrIds = ['chr', 'int', 'str', 'mny', 'spr', 'mag', 'luk']
  const perAttr = Math.floor(20 / attrIds.length)
  const allocation: Record<string, number> = {}
  for (const id of attrIds) allocation[id] = perAttr
  engine.allocateAttributes(allocation)

  // simulateYear 直到死亡
  const state = engine.getState()
  const effectiveMaxAge = state.effectiveMaxAge
  let lifespan = state.age

  // 安全上限：最多跑 effectiveMaxAge * 1.5 年
  const maxYears = Math.ceil(effectiveMaxAge * 1.5)
  for (let i = 0; i < maxYears; i++) {
    const result = engine.simulateYear()
    if (result.phase === 'finished') {
      lifespan = result.age
      break
    }
  }

  // 如果跑满还没死（不应该发生）
  if (engine.getState().phase !== 'finished') {
    lifespan = engine.getState().age
  }

  return { lifespan, effectiveMaxAge }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

async function main() {
  const world = await createSwordAndMagicWorld()

  const allResults: Array<{ race: string; raceName: string; lifespan: number; effectiveMaxAge: number }> = []

  for (const race of RACES) {
    for (let run = 1; run <= RUNS_PER_RACE; run++) {
      const seed = race.id.charCodeAt(0) * 10000 + run * 137 + Date.now()
      const engine = new SimulationEngine(world, seed)
      const { lifespan, effectiveMaxAge } = simulateOne(engine, race.id)
      allResults.push({ race: race.id, raceName: race.name, lifespan, effectiveMaxAge })
      console.log(`  [${race.name}] 第${String(run).padStart(2)}轮: 寿命=${lifespan}, MaxAge=${effectiveMaxAge}, ratio=${(lifespan / effectiveMaxAge * 100).toFixed(1)}%`)
    }
  }

  // 输出原始数据
  console.log('\n' + '='.repeat(80))
  console.log('📊 原始数据汇总')
  console.log('='.repeat(80))
  console.log('种族\t\t轮次\t寿命\tMaxAge\t寿命/MaxAge%')
  for (const r of allResults) {
    const ratio = (r.lifespan / r.effectiveMaxAge * 100).toFixed(1)
    console.log(`${r.raceName}\t\t${String(allResults.filter(x => x.race === r.race && x.lifespan === r.lifespan).findIndex(x => x === r) + 1).padStart(2)}\t${r.lifespan}\t${r.effectiveMaxAge}\t${ratio}%`)
  }

  // 按种族统计
  console.log('\n' + '='.repeat(80))
  console.log('📈 按种族统计分析')
  console.log('='.repeat(80))

  for (const race of RACES) {
    const data = allResults.filter(r => r.race === race.id)
    const lifespans = data.map(d => d.lifespan)
    const ratios = data.map(d => d.lifespan / d.effectiveMaxAge)

    const avg = mean(lifespans)
    const med = median(lifespans)
    const min = Math.min(...lifespans)
    const max = Math.max(...lifespans)
    const medRatio = med / race.configMedian * 100

    const avgRatio = mean(ratios) * 100
    const minRatio = Math.min(...ratios) * 100
    const maxRatio = Math.max(...ratios) * 100

    const pass = medRatio >= 70 && medRatio <= 85

    console.log(`\n${race.icon || '🧬'} ${race.name} (配置寿命中值: ${race.configMedian})`)
    console.log(`  寿命均值: ${avg.toFixed(1)} | 中位数: ${med} | 最小: ${min} | 最大: ${max}`)
    console.log(`  寿命/MaxAge 均值: ${avgRatio.toFixed(1)}% | 最小: ${minRatio.toFixed(1)}% | 最大: ${maxRatio.toFixed(1)}%`)
    console.log(`  中位数/配置中值: ${medRatio.toFixed(1)}%  ${pass ? '✅ 合格' : '❌ 偏离期望(70-85%)'}`)
  }

  // 总结
  console.log('\n' + '='.repeat(80))
  console.log('📋 总结')
  console.log('='.repeat(80))
  let passCount = 0
  for (const race of RACES) {
    const data = allResults.filter(r => r.race === race.id)
    const med = median(data.map(d => d.lifespan))
    const medRatio = med / race.configMedian * 100
    if (medRatio >= 70 && medRatio <= 85) passCount++
    console.log(`${race.name}: 中位数寿命=${med}, 配置中值=${race.configMedian}, 比例=${medRatio.toFixed(1)}% ${medRatio >= 70 && medRatio <= 85 ? '✅' : '❌'}`)
  }
  console.log(`\n通过: ${passCount}/${RACES.length}`)
}

main().catch(e => { console.error(e); process.exit(1) })
