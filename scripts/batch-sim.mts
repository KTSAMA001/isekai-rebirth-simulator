/**
 * 批量模拟脚本 — 验证 HP 衰老系统的死亡年龄分布
 * 直接使用引擎 API，无需浏览器
 * 
 * 用法: npx tsx scripts/batch-sim.mts
 */
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createWorldInstance } from '../src/engine/world/WorldInstance'
import { ConditionDSL } from '../src/engine/modules/ConditionDSL'
import type { WorldInstance, WorldRaceDef, EventBranch, WorldEventDef } from '../src/engine/core/types'

// 加载世界数据（复制 data-loader 逻辑）
import { default as manifestData } from '../data/sword-and-magic/manifest.json'
import { default as attributesData } from '../data/sword-and-magic/attributes.json'
import { default as talentsData } from '../data/sword-and-magic/talents.json'
import { default as itemsData } from '../data/sword-and-magic/items.json'
import { default as achievementsData } from '../data/sword-and-magic/achievements.json'
import { default as evaluationsData } from '../data/sword-and-magic/evaluations.json'
import { default as presetsData } from '../data/sword-and-magic/presets.json'
import { default as rulesData } from '../data/sword-and-magic/rules.json'
import { default as eventsBirthData } from '../data/sword-and-magic/events/birth.json'
import { default as eventsChildhoodData } from '../data/sword-and-magic/events/childhood.json'
import { default as eventsYouthData } from '../data/sword-and-magic/events/youth.json'
import { default as eventsTeenagerData } from '../data/sword-and-magic/events/teenager.json'
import { default as eventsAdultData } from '../data/sword-and-magic/events/adult.json'
import { default as eventsMiddleAgeData } from '../data/sword-and-magic/events/middle-age.json'
import { default as eventsElderData } from '../data/sword-and-magic/events/elder.json'
import { default as racesData } from '../data/sword-and-magic/races.json'
import type { WorldEventDef, WorldManifest, WorldAttributeDef, WorldTalentDef, WorldAchievementDef, WorldItemDef, WorldPresetDef, WorldScoringRule, WorldRaceDef as IWorldRaceDef } from '../src/engine/core/types'

// rules.json maxScore 特殊处理
const scoringRule = rulesData as any
for (const grade of scoringRule.grades) {
  if (grade.maxScore === null) grade.maxScore = Infinity
}

const allEvents: WorldEventDef[] = [
  ...eventsBirthData,
  ...eventsChildhoodData,
  ...eventsYouthData,
  ...eventsTeenagerData,
  ...eventsAdultData,
  ...eventsMiddleAgeData,
  ...eventsElderData,
] as WorldEventDef[]

const races = racesData as IWorldRaceDef[]

const world = createWorldInstance(
  manifestData as unknown as WorldManifest,
  attributesData as unknown as WorldAttributeDef[],
  talentsData as unknown as WorldTalentDef[],
  allEvents,
  achievementsData as unknown as WorldAchievementDef[],
  itemsData as unknown as WorldItemDef[],
  presetsData as unknown as WorldPresetDef[],
  scoringRule as unknown as WorldScoringRule,
  races,
) as WorldInstance

// 设置 evaluations
;(world as any).evaluations = evaluationsData

// 获取可玩种族
const playableRaces = races.filter(r => r.playable !== false)

// 配置
const ROUNDS_PER_RACE = 15

interface SimResult {
  race: string
  raceName: string
  age: number
  score: number
  grade: string
  gradeTitle: string
}

function runSimulation(race: IWorldRaceDef): SimResult {
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female'
  
  // 选一个可用的预设
  const preset = world.presets.find(p => !p.locked) ?? world.presets[0]
  
  const engine = new SimulationEngine(world)
  engine.initGame('测试角色', preset?.id, race.id, gender)
  
  // 抽取天赋
  const drafted = engine.draftTalents()
  
  // 选择天赋：选前 talentSelectCount 个
  const selectCount = world.manifest.talentSelectCount
  const selected = drafted.slice(0, selectCount)
  engine.selectTalents(selected)
  
  // 属性分配：全部点数平均分配
  const state = engine.getState()
  const attrIds = world.attributes.map(a => a.id).filter(id => !world.attributes.find(a => a.id === id)?.hidden)
  const effectivePoints = world.manifest.initialPoints - (state as any).talentPenalty
  const allocation: Record<string, number> = {}
  const perAttr = Math.floor(effectivePoints / attrIds.length)
  let remaining = effectivePoints - perAttr * attrIds.length
  for (const id of attrIds) {
    allocation[id] = perAttr + (remaining > 0 ? 1 : 0)
    if (remaining > 0) remaining--
  }
  engine.allocateAttributes(allocation)
  
  const dsl = new ConditionDSL()
  
  // 辅助函数：选一个条件满足的分支（如果没有前置条件或前置条件满足）
  function pickAvailableBranch(branches: EventBranch[]): EventBranch | null {
    const currentState = engine.getState()
    const ctx = { state: currentState, world }
    
    // 优先选没有 requireCondition 的分支
    for (const b of branches) {
      if (!b.requireCondition) return b
    }
    // 否则找第一个条件满足的
    for (const b of branches) {
      if (b.requireCondition) {
        const conditions = b.requireCondition.split(',').map(c => c.trim())
        if (conditions.every(c => dsl.evaluate(c, ctx))) return b
      }
    }
    // 实在找不到，选第一个（让引擎报错，说明数据有问题）
    return branches[0]
  }
  
  // 辅助函数：检查结果
  function checkFinished(): SimResult | null {
    const s = engine.getState()
    if (s.phase === 'finished') {
      return {
        race: race.id,
        raceName: race.name,
        age: s.age,
        score: s.result?.score ?? 0,
        grade: s.result?.grade ?? '?',
        gradeTitle: s.result?.gradeTitle ?? '?',
      }
    }
    return null
  }
  
  // 模拟直到死亡（使用 galgame 三步流程）
  const MAX_YEARS = 500 // 安全限制
  for (let i = 0; i < MAX_YEARS; i++) {
    const yearResult = engine.startYear()
    
    // 检查是否结束
    const fin = checkFinished()
    if (fin) return fin
    
    // 如果需要选择分支，选第一个条件满足的分支
    if (yearResult.phase === 'awaiting_choice' && yearResult.branches && yearResult.branches.length > 0) {
      const branch = pickAvailableBranch(yearResult.branches)
      if (branch) {
        engine.resolveBranch(branch.id)
        const fin2 = checkFinished()
        if (fin2) return fin2
      }
    }
    
    // 平淡年跳过
    if (yearResult.phase === 'mundane_year') {
      engine.skipYear()
      const fin3 = checkFinished()
      if (fin3) return fin3
    }
  }
  
  // 安全退出
  const finalState = engine.getState()
  return {
    race: race.id,
    raceName: race.name,
    age: finalState.age,
    score: finalState.result?.score ?? -1,
    grade: finalState.result?.grade ?? 'TIMEOUT',
    gradeTitle: finalState.result?.gradeTitle ?? '超时',
  }
}

// 统计函数
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

// 配置寿命
const LIFESPAN_CONFIG: Record<string, [number, number]> = {
  human: [80, 90],
  elf: [380, 420],
  goblin: [30, 36],
  dwarf: [160, 180],
}

// 主逻辑
console.log('='.repeat(60))
console.log('异世界重生模拟器 — HP 衰老系统批量验证')
console.log('='.repeat(60))
console.log()

const allResults: SimResult[] = []

for (const race of playableRaces) {
  console.log(`▶ 开始种族 ${race.icon} ${race.name}（${ROUNDS_PER_RACE} 轮）...`)
  const raceResults: SimResult[] = []
  
  for (let i = 0; i < ROUNDS_PER_RACE; i++) {
    const result = runSimulation(race)
    raceResults.push(result)
    allResults.push(result)
  }
  
  console.log(`  完成 ${race.name}：${raceResults.map(r => r.age).join(', ')}`)
  console.log()
}

// 输出原始数据
console.log('─'.repeat(60))
console.log('📋 原始数据')
console.log('─'.repeat(60))
console.log('种族,年龄,评分,等级')
for (const r of allResults) {
  console.log(`${r.raceName},${r.age},${r.score},${r.gradeTitle}`)
}
console.log()

// 按种族统计
console.log('─'.repeat(60))
console.log('📊 按种族统计')
console.log('─'.repeat(60))

for (const race of playableRaces) {
  const raceResults = allResults.filter(r => r.race === race.id)
  const ages = raceResults.map(r => r.age)
  const configLifespan = LIFESPAN_CONFIG[race.id]
  
  const avg = mean(ages)
  const med = median(ages)
  const min = Math.min(...ages)
  const max = Math.max(...ages)
  
  const configMid = configLifespan ? (configLifespan[0] + configLifespan[1]) / 2 : 0
  const medianRatio = configMid > 0 ? (med / configMid * 100).toFixed(1) : '?'
  
  console.log()
  console.log(`${race.icon} ${race.name}`)
  console.log(`  配置寿命: ${configLifespan ? configLifespan[0] + '~' + configLifespan[1] : 'N/A'}`)
  console.log(`  均值: ${avg.toFixed(1)} 岁`)
  console.log(`  中位数: ${med} 岁 (配置中值的 ${medianRatio}%)`)
  console.log(`  最小: ${min} 岁`)
  console.log(`  最大: ${max} 岁`)
  console.log(`  标准差: ${Math.sqrt(ages.reduce((s, v) => s + (v - avg) ** 2, 0) / ages.length).toFixed(1)}`)
  
  // 早死比例 (低于配置寿命下限的 70%)
  const earlyThreshold = configLifespan ? configLifespan[0] * 0.7 : 0
  const earlyCount = configLifespan ? ages.filter(a => a < earlyThreshold).length : 0
  
  // 高龄比例 (达到配置寿命上限)
  const longCount = configLifespan ? ages.filter(a => a >= configLifespan[1]).length : 0
  
  if (configLifespan) {
    console.log(`  早死 (<${earlyThreshold.toFixed(0)}岁): ${earlyCount}/${ages.length} (${(earlyCount/ages.length*100).toFixed(0)}%)`)
    console.log(`  高龄 (>=${configLifespan[1]}岁): ${longCount}/${ages.length} (${(longCount/ages.length*100).toFixed(0)}%)`)
  }
  
  console.log(`  所有年龄: [${ages.sort((a,b) => a - b).join(', ')}]`)
}

// 汇总表
console.log()
console.log('─'.repeat(60))
console.log('📊 汇总表')
console.log('─'.repeat(60))
console.log()
console.log('| 种族 | 配置寿命 | 均值 | 中位数 | 最小 | 最大 | 中位数/配置中值 |')
console.log('|------|----------|------|--------|------|------|---------------|')

for (const race of playableRaces) {
  const raceResults = allResults.filter(r => r.race === race.id)
  const ages = raceResults.map(r => r.age)
  const configLifespan = LIFESPAN_CONFIG[race.id]
  
  const avg = mean(ages)
  const med = median(ages)
  const min = Math.min(...ages)
  const max = Math.max(...ages)
  const configMid = configLifespan ? (configLifespan[0] + configLifespan[1]) / 2 : 0
  const ratio = configMid > 0 ? (med / configMid * 100).toFixed(0) + '%' : '?'
  
  console.log(`| ${race.icon} ${race.name} | ${configLifespan ? configLifespan[0] + '~' + configLifespan[1] : 'N/A'} | ${avg.toFixed(1)} | ${med} | ${min} | ${max} | ${ratio} |`)
}

console.log()

// 验证结论
console.log('─'.repeat(60))
console.log('🔬 验证结论')
console.log('─'.repeat(60))

let allPass = true
for (const race of playableRaces) {
  const raceResults = allResults.filter(r => r.race === race.id)
  const ages = raceResults.map(r => r.age)
  const med = median(ages)
  const configLifespan = LIFESPAN_CONFIG[race.id]
  
  if (!configLifespan) continue
  
  const configMid = (configLifespan[0] + configLifespan[1]) / 2
  const ratio = med / configMid
  
  let verdict = ''
  if (ratio >= 0.70 && ratio <= 0.85) {
    verdict = '✅ 中位数在预期范围 (70-85%)'
  } else if (ratio >= 0.60 && ratio < 0.70) {
    verdict = '⚠️ 中位数偏低 (<70%)，偏早死'
  } else if (ratio > 0.85 && ratio <= 0.95) {
    verdict = '⚠️ 中位数偏高 (>85%)，偏长寿'
  } else {
    verdict = '❌ 中位数严重偏离预期'
    allPass = false
  }
  
  console.log(`${race.icon} ${race.name}: ${ratio >= 0.70 && ratio <= 0.85 ? '✅' : '⚠️'} 中位数 ${med} 岁 = 配置中值的 ${(ratio * 100).toFixed(1)}%`)
  console.log(`  ${verdict}`)
}

console.log()
if (allPass) {
  console.log('🎉 所有种族死亡年龄分布符合预期！')
} else {
  console.log('⚠️ 部分种族死亡年龄分布需要调整。')
}
