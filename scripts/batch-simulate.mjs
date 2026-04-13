/**
 * 批量模拟验证 HP 衰老系统
 * 直接调用引擎 API，无需浏览器
 * 
 * 运行方式: npx tsx scripts/batch-simulate.mjs
 */

import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic/index.ts'
import { SimulationEngine } from '../src/engine/core/SimulationEngine.ts'

// ==================== 配置 ====================

const RUNS_PER_RACE = 15
const RACES = [
  { id: 'human', name: '人类', configMedian: 85 },
  { id: 'elf', name: '精灵', configMedian: 400 },
  { id: 'goblin', name: '哥布林', configMedian: 33 },
  { id: 'dwarf', name: '矮人', configMedian: 170 },
]

// ==================== 核心模拟 ====================

async function runOneSimulation(world, raceId, seed) {
  const engine = new SimulationEngine(world, seed)
  
  // 初始化游戏 - 选第一个可用预设（平民）
  const preset = world.presets.find(p => !p.locked)
  const gender = Math.random() > 0.5 ? 'male' : 'female'
  
  engine.initGame('Test', preset?.id, raceId, gender)
  
  // 抽天赋 - 全选
  const drafted = engine.draftTalents()
  engine.selectTalents(drafted.slice(0, world.manifest.talentSelectCount))
  
  // 分配属性 - 全部点数给体魄(str)，最大化生存
  const state = engine.getState()
  const totalPoints = world.manifest.initialPoints - (state.talentPenalty || 0)
  engine.allocateAttributes({ str: totalPoints })
  
  // 逐年模拟直到结束
  let finished = false
  while (!finished) {
    const yearResult = engine.startYear()
    
    if (yearResult.phase === 'awaiting_choice' && yearResult.branches && yearResult.branches.length > 0) {
      // 有选择时，尝试第一个分支，如果失败则尝试其他分支
      let resolved = false
      for (const branch of yearResult.branches) {
        try {
          engine.resolveBranch(branch.id)
          resolved = true
          break
        } catch (branchErr) {
          // 跳过前置条件不满足的分支
          continue
        }
      }
      if (!resolved) {
        // 所有分支都不满足，跳过这一年
        engine.skipYear()
      }
    } else if (yearResult.phase === 'showing_event' || yearResult.phase === 'mundane_year') {
      engine.skipYear()
    }
    
    const currentState = engine.getState()
    finished = currentState.phase === 'finished'
  }
  
  const finalState = engine.finish()
  
  const raceConfig = RACES.find(r => r.id === raceId)
  return {
    race: raceId,
    raceName: raceConfig ? raceConfig.name : raceId,
    age: finalState.result.lifespan,
    score: finalState.result.score,
    grade: finalState.result.grade,
    gradeTitle: finalState.result.gradeTitle,
  }
}

// ==================== 统计 ====================

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mean(arr) {
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

// ==================== 主流程 ====================

async function main() {
  console.log('正在加载剑与魔法世界数据...')
  const world = await createSwordAndMagicWorld()
  console.log('世界加载完成！\n')
  
  const allResults = []
  
  for (const race of RACES) {
    console.log('===== 种族: ' + race.name + ' (' + race.id + ') =====')
    
    for (let i = 0; i < RUNS_PER_RACE; i++) {
      const seed = Date.now() * 1000 + Math.floor(Math.random() * 1000000) + i
      try {
        const result = await runOneSimulation(world, race.id, seed)
        allResults.push(result)
        const num = (i + 1).toString().padStart(2, ' ')
        const age = result.age.toString().padStart(4, ' ')
        const score = result.score.toString().padStart(5, ' ')
        console.log('  #' + num + ' | 年龄: ' + age + ' | 评分: ' + score + ' | 等级: ' + result.grade + ' ' + result.gradeTitle)
      } catch (e) {
        const num = (i + 1).toString().padStart(2, ' ')
        console.error('  #' + num + ' | 错误: ' + e.message)
      }
    }
    console.log()
  }
  
  // ==================== 输出结果 ====================
  
  console.log('\n' + '='.repeat(70))
  console.log('1. 原始数据表')
  console.log('='.repeat(70))
  console.log('序号 | 种族 | 年龄 | 评分 | 等级')
  console.log('-'.repeat(50))
  
  allResults.forEach((r, i) => {
    const num = (i + 1).toString().padStart(3, ' ')
    const age = r.age.toString().padStart(4, ' ')
    const score = r.score.toString().padStart(5, ' ')
    console.log(num + '  | ' + r.raceName + ' | ' + age + ' | ' + score + ' | ' + r.grade + ' ' + r.gradeTitle)
  })
  
  // ==================== 按种族统计 ====================
  
  console.log('\n' + '='.repeat(70))
  console.log('2. 按种族统计表')
  console.log('='.repeat(70))
  
  for (const race of RACES) {
    const results = allResults.filter(r => r.race === race.id)
    if (results.length === 0) continue
    
    const ages = results.map(r => r.age)
    const scores = results.map(r => r.score)
    
    const ageMean = mean(ages)
    const ageMedian = median(ages)
    const ageMin = Math.min(...ages)
    const ageMax = Math.max(...ages)
    const medianPercent = ((ageMedian / race.configMedian) * 100).toFixed(1)
    
    const scoreMean = mean(scores).toFixed(1)
    const scoreMedian = median(scores)
    
    // 判断是否在期望范围内
    const percent = parseFloat(medianPercent)
    const status = percent >= 70 && percent <= 85 ? '✅ 符合' : 
                   percent < 70 ? '⚠️ 偏低' : '⚠️ 偏高'
    
    console.log('\n--- ' + race.name + ' (配置寿命中值: ' + race.configMedian + ') ---')
    console.log('  样本数: ' + results.length)
    console.log('  年龄统计:')
    console.log('    均值:   ' + ageMean.toFixed(1))
    console.log('    中位数: ' + ageMedian)
    console.log('    最小值: ' + ageMin)
    console.log('    最大值: ' + ageMax)
    console.log('    中位数/配置中值: ' + medianPercent + '% ' + status)
    console.log('  评分统计:')
    console.log('    均值:   ' + scoreMean)
    console.log('    中位数: ' + scoreMedian)
  }
  
  // ==================== 总览 ====================
  
  console.log('\n' + '='.repeat(70))
  console.log('3. 总览')
  console.log('='.repeat(70))
  console.log('种族 | 配置中值 | 年龄中位数 | 比值 | 状态')
  console.log('-'.repeat(55))
  
  for (const race of RACES) {
    const results = allResults.filter(r => r.race === race.id)
    if (results.length === 0) continue
    
    const ages = results.map(r => r.age)
    const ageMedian = median(ages)
    const percent = ((ageMedian / race.configMedian) * 100).toFixed(1)
    const status = parseFloat(percent) >= 70 && parseFloat(percent) <= 85 ? '✅' : '⚠️'
    
    const name = race.name.padEnd(6, '　')
    const median7 = ageMedian.toString().padStart(9, ' ')
    const percent5 = percent.padStart(5, ' ')
    const config7 = race.configMedian.toString().padStart(7, ' ')
    console.log(name + ' | ' + config7 + ' | ' + median7 + ' | ' + percent5 + '% | ' + status)
  }
}

main().catch(e => {
  console.error('模拟失败:', e)
  process.exit(1)
})
