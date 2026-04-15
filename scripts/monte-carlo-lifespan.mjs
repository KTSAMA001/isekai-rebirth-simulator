#!/usr/bin/env node
/**
 * 纯 HP 衰减蒙特卡洛模拟（无事件干扰）
 * 目的：隔离 HP 衰减机制，分析 Beta(8,3) 分布下自然死亡的年龄分布
 *
 * 复现 SimulationEngine.regenHp() 的核心逻辑：
 *   - Beta(8,3) 采样 personalDeathProgress, clamp [0.60, 0.92]
 *   - sigmoid K=12 衰减
 *   - 二次加速衰减
 *   - 单年衰减上限
 *   - 童年保护（10岁以下）
 *   - 超寿命惩罚
 *
 * 运行: node scripts/monte-carlo-lifespan.mjs
 */

// ==================== 随机数生成器 ====================

class SeededRandom {
  constructor(seed) {
    this.state = seed
  }
  next() {
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff
    return this.state / 0x7fffffff
  }
}

// ==================== Beta 分布采样 ====================

function sampleGamma(random, alpha) {
  if (alpha < 1) {
    return sampleGamma(random, alpha + 1) * Math.pow(random.next(), 1 / alpha)
  }
  const d = alpha - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  while (true) {
    let x, v
    do {
      const u1 = random.next()
      const u2 = random.next()
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = random.next()
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

function sampleBeta(random, a, b) {
  const ga = sampleGamma(random, a)
  const gb = sampleGamma(random, b)
  return ga / (ga + gb)
}

// ==================== 统计工具 ====================

function calcMean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length }
function calcMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
function calcPercentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// ==================== 核心：模拟纯 HP 衰减 ====================

function simulatePureDecay(maxLifespan, str, seed) {
  const random = new SeededRandom(seed)

  // Beta(8,3) 采样 personalDeathProgress
  const personalDeathProgress = Math.min(0.92, Math.max(0.60, sampleBeta(random, 8, 3)))

  // 初始 HP
  const initHp = Math.max(25, 25 + str * 3)
  // 每年恢复量
  const initialStrRegen = Math.max(1, 1 + Math.floor(str / 3))
  const regen = Math.min(initialStrRegen, Math.max(3, Math.floor(initHp * 0.12)))
  // 单年衰减上限
  const maxYearlyDecay = Math.max(Math.floor(initHp * 0.20), 12)
  // 单年净损失上限
  const maxNetLoss = maxYearlyDecay

  let hp = initHp
  const CHILDHOOD_PROTECTION = 10
  const primeProgress = 0.35

  for (let age = 0; age < maxLifespan * 2; age++) {
    if (hp <= 0) return age

    const lifeProgress = age / maxLifespan

    // 软上限
    const declinePerProgress = 0.4 / 0.65
    const softCapMultiplier = Math.max(1.1 - Math.max(0, lifeProgress - primeProgress) * declinePerProgress, 0.3)
    const softCap = Math.max(Math.floor(initHp * softCapMultiplier), 5)

    // Sigmoid 衰减
    const sigmoidK = 12
    const sigmoidValue = 1 / (1 + Math.exp(-sigmoidK * (lifeProgress - personalDeathProgress)))
    const sigmoidDecay = Math.floor(25 * sigmoidValue)

    // 二次加速
    const excessProgress = Math.max(0, lifeProgress - personalDeathProgress)
    const quadDecay = Math.floor(excessProgress * excessProgress * 80)

    let ageDecay = sigmoidDecay + quadDecay

    // 单年衰减上限
    ageDecay = Math.min(ageDecay, maxYearlyDecay)

    // 童年保护
    if (age < CHILDHOOD_PROTECTION) ageDecay = 0

    // 超寿命惩罚
    if (lifeProgress > 1.0) {
      const overageRatio = lifeProgress - 1.0
      const overageDecay = Math.floor(overageRatio * 60)
      ageDecay = Math.min(ageDecay + overageDecay, maxYearlyDecay * 2)
    }

    // HP 变化
    const rawNewHp = Math.min(hp + regen - ageDecay, softCap)
    const clampedNewHp = Math.max(rawNewHp, hp - maxNetLoss)

    hp = Math.max(0, clampedNewHp)
  }

  return maxLifespan * 2 // 不应该到这里
}

// ==================== 分析不同 personalDeathProgress 对应的死亡年龄 ====================

function analyzeDeathProgressToAge(maxLifespan, str) {
  const results = []
  for (let pdp = 0.60; pdp <= 0.92; pdp += 0.02) {
    // 直接模拟（不用随机）
    const initHp = Math.max(25, 25 + str * 3)
    const initialStrRegen = Math.max(1, 1 + Math.floor(str / 3))
    const regen = Math.min(initialStrRegen, Math.max(3, Math.floor(initHp * 0.12)))
    const maxYearlyDecay = Math.max(Math.floor(initHp * 0.20), 12)
    const maxNetLoss = maxYearlyDecay
    const primeProgress = 0.35

    let hp = initHp
    for (let age = 0; age < maxLifespan * 2; age++) {
      if (hp <= 0) {
        results.push({ pdp: pdp.toFixed(2), deathAge: age, deathProgress: (age / maxLifespan).toFixed(3) })
        break
      }
      const lifeProgress = age / maxLifespan
      const declinePerProgress = 0.4 / 0.65
      const softCapMultiplier = Math.max(1.1 - Math.max(0, lifeProgress - primeProgress) * declinePerProgress, 0.3)
      const softCap = Math.max(Math.floor(initHp * softCapMultiplier), 5)

      const sigmoidK = 12
      const sigmoidValue = 1 / (1 + Math.exp(-sigmoidK * (lifeProgress - pdp)))
      const sigmoidDecay = Math.floor(25 * sigmoidValue)
      const excessProgress = Math.max(0, lifeProgress - pdp)
      const quadDecay = Math.floor(excessProgress * excessProgress * 80)
      let ageDecay = Math.min(sigmoidDecay + quadDecay, maxYearlyDecay)
      if (age < 10) ageDecay = 0
      if (lifeProgress > 1.0) {
        const overageDecay = Math.floor((lifeProgress - 1.0) * 60)
        ageDecay = Math.min(ageDecay + overageDecay, maxYearlyDecay * 2)
      }
      const rawNewHp = Math.min(hp + regen - ageDecay, softCap)
      hp = Math.max(0, Math.max(rawNewHp, hp - maxNetLoss))
    }
  }
  return results
}

// ==================== 主函数 ====================

const SIM_COUNT = 5000
const RACES = [
  { race: 'human', maxLifespan: 100, lifespanRange: [65, 85] },
  { race: 'elf', maxLifespan: 500, lifespanRange: [250, 400] },
  { race: 'goblin', maxLifespan: 60, lifespanRange: [20, 35] },
  { race: 'dwarf', maxLifespan: 400, lifespanRange: [150, 250] },
]
const STR = 5 // 默认体魄

console.log('========================================')
console.log('纯 HP 衰减蒙特卡洛模拟（无事件伤害）')
console.log(`模拟次数: ${SIM_COUNT} 次/种族`)
console.log(`假设体魄(str): ${STR}`)
console.log('========================================\n')

for (const config of RACES) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${config.race.toUpperCase()} (maxLifespan=${config.maxLifespan}, lifespanRange=[${config.lifespanRange}])`)
  console.log(`${'='.repeat(60)}`)

  // 1. 纯衰减模拟
  const deathAges = []
  for (let i = 0; i < SIM_COUNT; i++) {
    deathAges.push(simulatePureDecay(config.maxLifespan, STR, 100000 + i))
  }

  const mean = calcMean(deathAges)
  const median = calcMedian(deathAges)
  const p25 = calcPercentile(deathAges, 25)
  const p75 = calcPercentile(deathAges, 75)
  const min = Math.min(...deathAges)
  const max = Math.max(...deathAges)
  const stddev = Math.sqrt(deathAges.reduce((s, a) => s + (a - mean) ** 2, 0) / deathAges.length)

  const rangeHigh = config.lifespanRange[1]
  const rangeLow = config.lifespanRange[0]
  const overRange = deathAges.filter(a => a > rangeHigh).length
  const overRange10pct = deathAges.filter(a => a > rangeHigh * 1.1).length
  const overMax = deathAges.filter(a => a > config.maxLifespan).length
  const belowRangeLow = deathAges.filter(a => a < rangeLow).length

  console.log(`\n  [纯衰减统计]`)
  console.log(`  平均存活年龄: ${mean.toFixed(1)}`)
  console.log(`  中位数: ${median.toFixed(1)}`)
  console.log(`  25th 百分位: ${p25.toFixed(1)}`)
  console.log(`  75th 百分位: ${p75.toFixed(1)}`)
  console.log(`  最小: ${min}`)
  console.log(`  最大: ${max}`)
  console.log(`  标准差: ${stddev.toFixed(1)}`)
  console.log(`  活过 lifespanRange 上界(${rangeHigh}): ${overRange}/${SIM_COUNT} = ${(overRange / SIM_COUNT * 100).toFixed(1)}%`)
  console.log(`  活过 lifespanRange 上界×1.1(${(rangeHigh * 1.1).toFixed(0)}): ${overRange10pct}/${SIM_COUNT} = ${(overRange10pct / SIM_COUNT * 100).toFixed(1)}%`)
  console.log(`  活过 maxLifespan(${config.maxLifespan}): ${overMax}/${SIM_COUNT} = ${(overMax / SIM_COUNT * 100).toFixed(1)}%`)
  console.log(`  低于 lifespanRange 下界(${rangeLow}): ${belowRangeLow}/${SIM_COUNT} = ${(belowRangeLow / SIM_COUNT * 100).toFixed(1)}%`)
  console.log(`  平均/Range上界 = ${(mean / rangeHigh * 100).toFixed(1)}%`)
  console.log(`  平均/maxLifespan = ${(mean / config.maxLifespan * 100).toFixed(1)}%`)

  // 2. PDP → 死亡年龄映射
  console.log(`\n  [personalDeathProgress → 死亡年龄映射]`)
  const mapping = analyzeDeathProgressToAge(config.maxLifespan, STR)
  console.log(`  PDP    死亡年龄  死亡进度(lifeProgress)  相对Range`)
  for (const m of mapping) {
    const relRange = m.deathAge >= rangeLow && m.deathAge <= rangeHigh ? '✓在范围内'
      : m.deathAge < rangeLow ? '✗低于下界'
      : '✗高于上界'
    console.log(`  ${m.pdp}    ${String(m.deathAge).padStart(5)}     ${m.deathProgress}            ${relRange}`)
  }

  // 3. 直方图
  const bins = 20
  const binWidth = Math.max(1, Math.ceil((max - min) / bins))
  const histogram = new Array(bins).fill(0)
  for (const a of deathAges) {
    const bin = Math.min(Math.floor((a - min) / binWidth), bins - 1)
    histogram[bin]++
  }
  const maxBinCount = Math.max(...histogram)
  const scale = 50 / maxBinCount

  console.log(`\n  [分布直方图]`)
  for (let i = 0; i < bins; i++) {
    const barStart = min + i * binWidth
    const barEnd = barStart + binWidth
    const bar = '█'.repeat(Math.round(histogram[i] * scale))
    const marks = []
    if (barStart <= rangeLow && barEnd > rangeLow) marks.push('←Range下界')
    if (barStart <= rangeHigh && barEnd > rangeHigh) marks.push('←Range上界')
    if (barStart <= config.maxLifespan && barEnd > config.maxLifespan) marks.push('←maxLifespan')
    console.log(`  ${String(barStart).padStart(4)}-${String(barEnd).padStart(4)} | ${bar} (${histogram[i]}) ${marks.join(' ')}`)
  }
}

// ==================== Beta(8,3) 分布分析 ====================
console.log(`\n\n${'='.repeat(60)}`)
console.log('Beta(8,3) 分布分析')
console.log(`${'='.repeat(60)}`)

const betaSamples = []
const testRandom = new SeededRandom(99999)
for (let i = 0; i < 100000; i++) {
  betaSamples.push(Math.min(0.92, Math.max(0.60, sampleBeta(testRandom, 8, 3))))
}

console.log(`  Beta(8,3) clamp[0.60, 0.92] 采样 100000 次:`)
console.log(`  均值: ${calcMean(betaSamples).toFixed(4)}`)
console.log(`  中位数: ${calcMedian(betaSamples).toFixed(4)}`)
console.log(`  P5: ${calcPercentile(betaSamples, 5).toFixed(4)}`)
console.log(`  P25: ${calcPercentile(betaSamples, 25).toFixed(4)}`)
console.log(`  P75: ${calcPercentile(betaSamples, 75).toFixed(4)}`)
console.log(`  P95: ${calcPercentile(betaSamples, 95).toFixed(4)}`)

// 对应死亡进度的分布（纯衰减下）
console.log(`\n  对应的死亡进度（HP归零时的 lifeProgress）分布分析:`)
for (const config of RACES) {
  const mapping = analyzeDeathProgressToAge(config.maxLifespan, STR)
  console.log(`\n  ${config.race} (maxLifespan=${config.maxLifespan}):`)
  console.log(`    PDP=0.60 → 死亡进度 ${(mapping[0].deathAge / config.maxLifespan * 100).toFixed(1)}% (年龄 ${mapping[0].deathAge})`)
  const midIdx = Math.floor(mapping.length / 2)
  console.log(`    PDP=0.72 → 死亡进度 ${(mapping[midIdx].deathAge / config.maxLifespan * 100).toFixed(1)}% (年龄 ${mapping[midIdx].deathAge})`)
  console.log(`    PDP=0.92 → 死亡进度 ${(mapping[mapping.length - 1].deathAge / config.maxLifespan * 100).toFixed(1)}% (年龄 ${mapping[mapping.length - 1].deathAge})`)

  const rangeLowProgress = (config.lifespanRange[0] / config.maxLifespan).toFixed(3)
  const rangeHighProgress = (config.lifespanRange[1] / config.maxLifespan).toFixed(3)
  console.log(`    lifespanRange 进度: [${rangeLowProgress}, ${rangeHighProgress}]`)
}
