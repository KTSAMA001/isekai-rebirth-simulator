/**
 * 第四轮验证测试 — HP 单年降幅上限 + 衰老事件触发率修复验证
 * 验证目标：
 *   1. HP 单年降幅上限：overage 惩罚受 maxYearlyDecay×2 约束，maxNetLoss 固定用 initHp*0.25 和 20 较大值
 *   2. 衰老事件触发率：权重 2→5，minAge 提前，HP 扣除降低，去掉 mid 的 include 条件
 * 测试规模：7种族 × 2局 = 14局（半龙人跳过）
 * 重点验证：
 *   - 衰老事件是否正常触发（特别是人类 77 岁没触发的 case）
 *   - HP 单年降幅是否 ≤ 20（海精灵重点看）
 *   - aging_elf_reflection 是否触发（精灵 minAge 降到 150 了）
 *   - 死亡过程是否渐进（不再突兀）
 *   - 覆盖不同天赋组合
 * 运行: npx tsx scripts/playtest-round4.ts
 */

import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic/index'
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import type { EventLogEntry } from '../src/engine/core/types'

// ==================== 测试配置 ====================

interface TestCase {
  label: string
  race: string
  gender: 'male' | 'female'
  talentIds: string[]
  talentCategory: string
  attrBias: Record<string, number>
  seed: number
}

const TEST_CASES: TestCase[] = [
  // 人类 2 局 — 重点验证衰老事件（Round3 人类 77 岁没触发 aging_hint_mid）
  { label: '人类-战士路线', race: 'human', gender: 'male', talentIds: ['fighter_instinct', 'village_hero_seed'], talentCategory: '战斗', attrBias: { str: 8, mag: 1, int: 2, spr: 2, chr: 1, mny: 2, luk: 3 }, seed: 40001 },
  { label: '人类-魔法路线', race: 'human', gender: 'female', talentIds: ['blessed_by_goddess', 'bookworm'], talentCategory: '魔法', attrBias: { mag: 8, int: 5, spr: 3, chr: 1, mny: 1, str: 1, luk: 1 }, seed: 40002 },

  // 精灵 2 局 — 重点验证 aging_elf_reflection（minAge 降到 150）
  { label: '精灵-魔法天赋', race: 'elf', gender: 'female', talentIds: ['elven_harmony', 'elf_female_moonweaver'], talentCategory: '魔法', attrBias: { mag: 8, int: 5, spr: 4, chr: 2, mny: 1, str: 1, luk: 1 }, seed: 40003 },
  { label: '精灵-冒险路线', race: 'elf', gender: 'male', talentIds: ['explorer_curiosity', 'wanderer_instinct'], talentCategory: '冒险', attrBias: { int: 5, spr: 5, mag: 4, chr: 3, str: 2, luk: 2, mny: 1 }, seed: 40004 },

  // 哥布林 2 局 — 短寿种族，衰老事件难以触发但不应崩坏
  { label: '哥布林-社交路线', race: 'goblin', gender: 'female', talentIds: ['goblin_cunning', 'goblin_female_trickster'], talentCategory: '社交', attrBias: { luk: 8, int: 5, chr: 4, mag: 2, mny: 3, str: 1, spr: 1 }, seed: 40005 },
  { label: '哥布林-战斗路线', race: 'goblin', gender: 'male', talentIds: ['goblin_chaos_born', 'goblin_male_berserker'], talentCategory: '战斗', attrBias: { str: 7, luk: 6, int: 3, mag: 2, chr: 1, mny: 1, spr: 2 }, seed: 40006 },

  // 矮人 2 局 — 验证 aging_dwarf_beard
  { label: '矮人-战斗路线', race: 'dwarf', gender: 'male', talentIds: ['dwarf_stoneblood', 'dwarf_male_shieldbeard'], talentCategory: '战斗', attrBias: { str: 8, spr: 5, int: 2, mag: 1, chr: 1, mny: 3, luk: 2 }, seed: 40007 },
  { label: '矮人-社交路线', race: 'dwarf', gender: 'female', talentIds: ['dwarf_female_clan_brewer', 'merchant_blood'], talentCategory: '社交', attrBias: { mny: 6, chr: 5, str: 4, spr: 3, int: 2, mag: 1, luk: 2 }, seed: 40008 },

  // 兽人 2 局
  { label: '兽人-战斗路线', race: 'beastfolk', gender: 'male', talentIds: ['fighter_instinct', 'wild_talent'], talentCategory: '战斗', attrBias: { str: 10, spr: 4, luk: 3, int: 1, mag: 1, chr: 2, mny: 1 }, seed: 40009 },
  { label: '兽人-冒险路线', race: 'beastfolk', gender: 'female', talentIds: ['explorer_curiosity', 'village_hero_seed'], talentCategory: '冒险', attrBias: { str: 7, luk: 5, spr: 3, int: 3, chr: 2, mag: 1, mny: 2 }, seed: 40010 },

  // 海精灵 2 局 — 重点验证 HP 单年降幅（长寿种族是重灾区）
  { label: '海精灵-魔法路线', race: 'seaelf', gender: 'female', talentIds: ['blessed_by_goddess', 'moonlit_blessing'], talentCategory: '魔法', attrBias: { mag: 10, chr: 5, spr: 3, int: 2, mny: 1, str: 1, luk: 2 }, seed: 40011 },
  { label: '海精灵-社交路线', race: 'seaelf', gender: 'male', talentIds: ['explorer_curiosity', 'blessed_by_goddess'], talentCategory: '社交', attrBias: { chr: 8, mag: 5, int: 3, spr: 3, mny: 2, str: 1, luk: 2 }, seed: 40012 },
]

// ==================== 数据结构 ====================

interface PlaytestResult {
  label: string
  race: string
  gender: string
  talentCategory: string
  selectedTalents: string[]
  initialAttrs: Record<string, number>
  lifespan: number
  effectiveMaxAge: number
  lifeRatio: number
  score: number
  grade: string
  gradeTitle: string
  eventLog: EventLogEntry[]
  keyEvents: { age: number; title: string; branch?: string }[]
  agingEvents: { age: number; eventId: string; title: string }[]
  agingHints: { age: number; hint: string }[]
  gaps: { start: number; end: number; length: number }[]
  hpHistory: { age: number; hp: number }[]
  finalAttrs: Record<string, number>
  peakAttrs: Record<string, number>
  abruptDeath: boolean
  route: string
  loveEvents: { age: number; title: string }[]
  careerEvents: { age: number; title: string }[]
  raceEvents: { age: number; title: string }[]
  items: string[]
  flags: string[]
  /** HP 单年最大降幅（绝对值） */
  maxSingleYearHpDrop: number
  /** HP 单年最大降幅发生的年龄 */
  maxHpDropAge: number
  /** 单年降幅超过 20 的年份 */
  yearsExceedingLimit: { age: number; drop: number }[]
  /** initHp 计算值 */
  initHp: number
  /** 期望 maxYearlyDecay */
  expectedMaxYearlyDecay: number
  /** 期望 maxNetLoss */
  expectedMaxNetLoss: number
}

// ==================== 辅助函数 ====================

const ATTR_NAMES: Record<string, string> = {
  chr: '魅力', int: '智慧', str: '体魄', mny: '家境', spr: '灵魂', mag: '魔力', luk: '运势',
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickBranch(engine: SimulationEngine, branches: any[]): string {
  const state = engine.getState()
  const available = branches.filter((b: any) => {
    if (!b.requireCondition) return true
    const cond = b.requireCondition
    const attrs = state.attributes
    const flags = state.flags
    const attrMatch = [...cond.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]
    for (const m of attrMatch) {
      const val = attrs[m[1]] ?? 0
      const num = parseInt(m[3])
      if (m[2] === '>=' && !(val >= num)) return false
      if (m[2] === '>' && !(val > num)) return false
      if (m[2] === '<=' && !(val <= num)) return false
      if (m[2] === '<' && !(val < num)) return false
      if (m[2] === '==' && !(val === num)) return false
    }
    const flagMatch = [...cond.matchAll(/has\.flag\.(\w+)/g)]
    for (const m of flagMatch) {
      if (!flags.has(m[1])) return false
    }
    return true
  })
  if (available.length > 0) return pick(available).id
  return branches[0].id
}

function gradeEmoji(grade: string): string {
  if (grade === 'SS') return '🌟'
  if (grade === 'S') return '⭐'
  if (grade === 'A') return '🟢'
  if (grade === 'B') return '🔵'
  if (grade === 'C') return '🟡'
  return '🔴'
}

/** 简化的 initHp 计算，与 SimulationEngine.computeInitHp 逻辑一致 */
function estimateInitHp(initialStr: number, hpBonus: number = 0): number {
  // 基础 HP = 50 + str * 3 + hpBonus
  return 50 + initialStr * 3 + hpBonus
}

// ==================== 单局运行 ====================

function runOneGame(tc: TestCase, world: any): PlaytestResult {
  const engine = new SimulationEngine(world, tc.seed)
  engine.initGame(`测试-R4-${tc.label}`, undefined, tc.race, tc.gender)

  // 抽天赋
  const drafted = engine.draftTalents()
  const wanted = tc.talentIds.filter(id => drafted.includes(id))
  const extras = drafted.filter(id => !wanted.includes(id)).slice(0, 3 - wanted.length)
  const selected = [...wanted, ...extras]
  engine.selectTalents(selected.slice(0, 3))

  // 分配属性点
  const attrIds = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const penalty = engine.getState().talentPenalty ?? 0
  let remaining = (world.manifest.initialPoints ?? 20) - penalty
  const allocation: Record<string, number> = {}

  const totalWeight = attrIds.reduce((sum, id) => sum + (tc.attrBias[id] ?? 1), 0)
  for (const id of attrIds) {
    const rawWeight = tc.attrBias[id] ?? 1
    allocation[id] = Math.max(1, Math.round(rawWeight / totalWeight * remaining))
    remaining -= allocation[id]
    if (remaining <= 0) break
  }
  if (remaining > 0) {
    const maxAttr = attrIds.reduce((a, b) => (tc.attrBias[a] ?? 1) >= (tc.attrBias[b] ?? 1) ? a : b)
    allocation[maxAttr] = (allocation[maxAttr] ?? 0) + remaining
  }
  engine.allocateAttributes(allocation)

  const initState = engine.getState()
  const initialStr = initState.attributes.str ?? 10

  // 开始模拟
  const allLog: EventLogEntry[] = []
  const hpHistory: { age: number; hp: number }[] = []
  const agingHints: { age: number; hint: string }[] = []

  const maxSimAge = 600

  for (let year = 0; year < maxSimAge; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0 || stateBefore.phase === 'finished') break
    if (stateBefore.phase === 'simulating') {
      const yearResult = engine.startYear()
      const stateAfter = engine.getState()

      hpHistory.push({ age: stateAfter.age, hp: stateAfter.hp })

      if (yearResult.agingHint) {
        agingHints.push({ age: stateAfter.age, hint: yearResult.agingHint })
      }

      if (stateAfter.hp <= 0 || stateAfter.phase === 'finished') {
        if (yearResult.logEntry) allLog.push(yearResult.logEntry)
        break
      }

      if (yearResult.phase === 'awaiting_choice' && yearResult.event && yearResult.branches && yearResult.branches.length > 0) {
        let branchId: string | undefined
        try {
          branchId = pickBranch(engine, yearResult.branches)
        } catch {
          branchId = yearResult.branches[0].id
        }
        try {
          engine.resolveBranch(branchId)
        } catch (e: any) {
          let resolved = false
          for (const b of yearResult.branches) {
            if (b.id === branchId) continue
            try {
              engine.resolveBranch(b.id)
              resolved = true
              break
            } catch { /* continue */ }
          }
          if (!resolved) {
            console.warn(`  ⚠️ [${tc.label}] 无法解析分支 ${branchId}，强制结束 (age=${stateAfter.age})`)
            break
          }
        }
        const stateResolved = engine.getState()
        if (stateResolved.phase === 'finished' || stateResolved.hp <= 0) {
          break
        }
        if (stateResolved.eventLog.length > allLog.length) {
          allLog.push(stateResolved.eventLog[stateResolved.eventLog.length - 1])
        }
      } else if (yearResult.phase === 'showing_event' && yearResult.logEntry) {
        allLog.push(yearResult.logEntry)
      }

      const currentState = engine.getState()
      if (currentState.phase === 'finished' || currentState.hp <= 0) break
    }
  }

  // 结算
  let endState = engine.getState()
  if (endState.phase !== 'finished' && endState.result === undefined) {
    try { engine.finish() } catch { /* */ }
    endState = engine.getState()
  }

  // 关键事件
  const keyEvents = allLog.map(e => ({
    age: e.age,
    title: e.title,
    branch: e.branchTitle,
  }))

  // 衰老事件
  const agingEventIds = ['aging_hint_early', 'aging_hint_mid', 'aging_hint_late', 'aging_elf_reflection', 'aging_dwarf_beard', 'elf_human_friend_aging']
  const agingEvents = allLog
    .filter(e => agingEventIds.includes(e.eventId))
    .map(e => ({ age: e.age, eventId: e.eventId, title: e.title }))

  // HP 分析
  let maxSingleYearHpDrop = 0
  let maxHpDropAge = 0
  const yearsExceedingLimit: { age: number; drop: number }[] = []
  for (let i = 1; i < hpHistory.length; i++) {
    const drop = hpHistory[i - 1].hp - hpHistory[i].hp
    if (drop > maxSingleYearHpDrop) {
      maxSingleYearHpDrop = drop
      maxHpDropAge = hpHistory[i].age
    }
    // 单年净损失 > 20 视为异常
    if (drop > 20) {
      yearsExceedingLimit.push({ age: hpHistory[i].age, drop: Math.round(drop) })
    }
  }

  // initHp 估算
  const initHp = estimateInitHp(initialStr, 0)
  const expectedMaxYearlyDecay = Math.max(Math.floor(initHp * 0.25), 20)
  const expectedMaxNetLoss = Math.max(Math.floor(initHp * 0.25), 20)

  // 空白期检测
  const eventAges = new Set(allLog.map(e => e.age))
  const lifespan = endState.age
  const gaps: { start: number; end: number; length: number }[] = []
  let gapStart = -1
  for (let age = 1; age <= lifespan; age++) {
    if (!eventAges.has(age)) {
      if (gapStart === -1) gapStart = age
    } else {
      if (gapStart !== -1) {
        const gapLen = age - gapStart
        if (gapLen >= 5) gaps.push({ start: gapStart, end: age - 1, length: gapLen })
        gapStart = -1
      }
    }
  }
  if (gapStart !== -1 && lifespan - gapStart + 1 >= 5) {
    gaps.push({ start: gapStart, end: lifespan, length: lifespan - gapStart + 1 })
  }

  // 突兀死亡
  const last5YearsEvents = allLog.filter(e => e.age > lifespan - 5)
  const abruptDeath = last5YearsEvents.length === 0 && hpHistory.length >= 5 && hpHistory[hpHistory.length - 2]?.hp > 20

  // 恋爱事件
  const loveKeywords = ['恋爱', '告白', '约会', '求婚', '婚礼', '结婚', '恋人', '暗恋', '伴侣', '姻缘']
  const loveEvents = allLog.filter(e => loveKeywords.some(kw => e.title.includes(kw) || (e.description || '').includes(kw)))
    .map(e => ({ age: e.age, title: e.title }))

  // 职业事件
  const careerKeywords = ['职业', '公会', '骑士', '魔法', '商人', '学者', '冒险', '转职', '晋升', '毕业', '就职', '学徒', '大师']
  const careerEvents = allLog.filter(e => careerKeywords.some(kw => e.title.includes(kw) || (e.description || '').includes(kw)))
    .map(e => ({ age: e.age, title: e.title }))

  // 种族专属事件
  const raceEvents = allLog.filter(e => {
    return e.eventId.includes(tc.race) || e.eventId.includes('elf_') || e.eventId.includes('goblin_') || e.eventId.includes('dwarf_') || e.eventId.includes('beast_') || e.eventId.includes('sea_') || e.eventId.includes('human_')
  }).map(e => ({ age: e.age, title: e.title }))

  return {
    label: tc.label,
    race: tc.race,
    gender: tc.gender,
    talentCategory: tc.talentCategory,
    selectedTalents: endState.talents.selected,
    initialAttrs: initState.attributes,
    lifespan,
    effectiveMaxAge: endState.effectiveMaxAge ?? world.manifest.maxAge,
    lifeRatio: lifespan / (endState.effectiveMaxAge ?? world.manifest.maxAge),
    score: endState.result?.score ?? 0,
    grade: endState.result?.grade ?? '?',
    gradeTitle: endState.result?.gradeTitle ?? '',
    eventLog: allLog,
    keyEvents,
    agingEvents,
    agingHints,
    gaps,
    hpHistory,
    finalAttrs: endState.attributes,
    peakAttrs: endState.attributePeaks,
    abruptDeath,
    route: engine.getActiveRoute()?.id ?? 'commoner',
    loveEvents,
    careerEvents,
    raceEvents,
    items: endState.inventory.items.map((i: any) => i.itemId),
    flags: [...endState.flags],
    maxSingleYearHpDrop,
    maxHpDropAge,
    yearsExceedingLimit,
    initHp,
    expectedMaxYearlyDecay,
    expectedMaxNetLoss,
  }
}

// ==================== 报告生成 ====================

function generateReport(results: PlaytestResult[]): string {
  const lines: string[] = []

  lines.push('# 🎮 第四轮验证测试报告')
  lines.push('')
  lines.push(`**测试日期**: ${new Date().toISOString().split('T')[0]}`)
  lines.push(`**测试目标**: 7种族 × 2局 = ${results.length}局（半龙人跳过）`)
  lines.push(`**验证修复**:`)
  lines.push('  1. HP 单年降幅上限 — overage 惩罚受 maxYearlyDecay×2 约束，maxNetLoss 固定用 initHp×0.25 和 20 较大值')
  lines.push('  2. 衰老事件触发率 — 权重 2→5，minAge 提前，HP 扣除降低，去掉 mid 的 include 条件')
  lines.push('')

  // ==================== 汇总表 ====================
  lines.push('## 1. 测试汇总')
  lines.push('')
  lines.push('| # | 配置 | 种族 | 天赋系 | 寿命 | 期望寿命 | 比率 | 评级 | 分数 | 事件数 | 衰老事件 | 最大HP降幅 | 超限年数 | 突兀死亡 |')
  lines.push('|---|------|------|--------|------|----------|------|------|------|--------|----------|-----------|---------|----------|')

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const ge = gradeEmoji(r.grade)
    const lifespanOk = isLifespanOk(r.race, r.lifespan) ? '✅' : '⚠️'
    const hpOk = r.yearsExceedingLimit.length === 0 ? '✅' : '❌'
    lines.push(`| ${i + 1} | ${r.label} | ${r.race} | ${r.talentCategory} | ${r.lifespan} | ${r.effectiveMaxAge} | ${(r.lifeRatio * 100).toFixed(0)}% | ${ge} ${r.grade} | ${r.score.toFixed(0)} | ${r.eventLog.length} | ${r.agingEvents.length > 0 ? r.agingEvents.map(a => a.eventId).join(', ') : '—'} | ${Math.round(r.maxSingleYearHpDrop)} ${hpOk} | ${r.yearsExceedingLimit.length} | ${r.abruptDeath ? '❌ 是' : '✅ 否'} |`)
  }
  lines.push('')

  // ==================== 各局详情 ====================
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    lines.push('---')
    lines.push('')
    lines.push(`## ${i + 1}. ${r.label}`)
    lines.push('')
    lines.push(`- **种族/性别**: ${r.race} / ${r.gender}`)
    lines.push(`- **天赋系**: ${r.talentCategory}`)
    lines.push(`- **选中天赋**: ${r.selectedTalents.join(', ')}`)
    lines.push(`- **初始属性**: ${Object.entries(r.initialAttrs).map(([k, v]) => `${ATTR_NAMES[k]}=${v}`).join(', ')}`)
    lines.push(`- **估算 initHp**: ${r.initHp} (str=${r.initialAttrs.str})`)
    lines.push(`- **期望 maxYearlyDecay**: ${r.expectedMaxYearlyDecay}`)
    lines.push(`- **期望 maxNetLoss**: ${r.expectedMaxNetLoss}`)
    lines.push(`- **寿命**: ${r.lifespan} / 期望 ${r.effectiveMaxAge} (${(r.lifeRatio * 100).toFixed(1)}%) ${isLifespanOk(r.race, r.lifespan) ? '✅' : '⚠️'}`)
    lines.push(`- **评级**: ${gradeEmoji(r.grade)} ${r.grade} (${r.gradeTitle}) — ${r.score.toFixed(0)}分`)
    lines.push(`- **路线**: ${r.route}`)
    lines.push(`- **物品**: ${r.items.length > 0 ? r.items.join(', ') : '无'}`)
    lines.push('')

    // 事件链
    lines.push('### 事件链')
    lines.push('')
    lines.push(`共 ${r.eventLog.length} 个事件。`)
    if (r.keyEvents.length > 0) {
      lines.push('')
      lines.push('| 年龄 | 事件 | 分支选择 |')
      lines.push('|------|------|----------|')
      for (const e of r.keyEvents) {
        lines.push(`| ${e.age} | ${e.title} | ${e.branch ?? '—'} |`)
      }
    }
    lines.push('')

    // 衰老事件详情
    lines.push('### 衰老事件')
    lines.push('')
    if (r.agingEvents.length > 0) {
      lines.push('| 触发年龄 | 事件ID | 标题 |')
      lines.push('|----------|--------|------|')
      for (const a of r.agingEvents) {
        lines.push(`| ${a.age} | ${a.eventId} | ${a.title} |`)
      }
      lines.push('')
      const agingAges = r.agingEvents.map(a => a.age)
      const minAgingAge = Math.min(...agingAges)
      lines.push(`> 首次衰老事件: ${minAgingAge}岁 (${(minAgingAge / r.effectiveMaxAge * 100).toFixed(0)}%寿命)`)
      if (r.agingEvents.length >= 2) {
        const lastAgingAge = Math.max(...agingAges)
        lines.push(`末次衰老事件: ${lastAgingAge}岁，间隔 ${lastAgingAge - minAgingAge}年`)
      }
      lines.push(r.agingEvents.length >= 2 ? '✅ 渐进式衰老体验' : '⚠️ 衰老事件偏少')
      lines.push('')
    } else {
      lines.push(`> ⚠️ 未触发任何衰老事件`)
      const isShortLived = ['goblin', 'beastfolk'].includes(r.race)
      if (isShortLived) {
        lines.push(`> （${r.race} 为短寿种族，可能活不到 aging_hint_early 的 minAge=25）`)
      }
      lines.push('')
    }

    // HP 单年降幅分析
    lines.push('### HP 单年降幅分析')
    lines.push('')
    lines.push(`- **initHp**: ${r.initHp}`)
    lines.push(`- **期望 maxYearlyDecay**: ${r.expectedMaxYearlyDecay}`)
    lines.push(`- **期望 maxNetLoss**: ${r.expectedMaxNetLoss}`)
    lines.push(`- **观测最大单年降幅**: ${Math.round(r.maxSingleYearHpDrop)} (age=${r.maxHpDropAge})`)
    if (r.yearsExceedingLimit.length > 0) {
      lines.push(`- ❌ **${r.yearsExceedingLimit.length} 年单年降幅超过 20**:`)
      for (const y of r.yearsExceedingLimit) {
        lines.push(`  - age=${y.age}: 降幅 ${y.drop} 点`)
      }
    } else {
      lines.push(`- ✅ 所有年份单年降幅均 ≤ 20`)
    }
    lines.push('')

    // HP 历史
    lines.push('### HP 变化曲线')
    lines.push('')
    lines.push('```')
    const hpSamples = sampleArray(r.hpHistory, 25)
    for (let j = 0; j < hpSamples.length; j++) {
      const h = hpSamples[j]
      const prev = j > 0 ? hpSamples[j - 1].hp : h.hp
      const drop = prev - h.hp
      const dropStr = drop > 0 ? ` (↓${Math.round(drop)})` : ''
      const bar = '█'.repeat(Math.max(0, Math.round(h.hp / 2)))
      lines.push(`age=${String(h.age).padStart(4)} hp=${String(Math.round(h.hp)).padStart(4)} ${bar}${dropStr}`)
    }
    lines.push('```')
    lines.push('')

    // AgingHint
    if (r.agingHints.length > 0) {
      lines.push('### 衰老提示文本（agingHint）')
      lines.push('')
      lines.push('```')
      for (const h of r.agingHints.slice(0, 10)) {
        lines.push(`age=${h.age} (${(h.age / r.effectiveMaxAge * 100).toFixed(0)}%): ${h.hint}`)
      }
      if (r.agingHints.length > 10) {
        lines.push(`... 共 ${r.agingHints.length} 条`)
      }
      lines.push('```')
      lines.push('')
    }

    // 死亡评估
    lines.push('### 死亡评估')
    lines.push('')
    if (r.abruptDeath) {
      lines.push('❌ **死亡突兀**: 最后5年无事件且HP骤降')
    } else if (r.agingEvents.length >= 2) {
      lines.push('✅ 死亡过程自然，有渐进衰老铺垫')
    } else if (r.agingEvents.length === 1) {
      lines.push('⚠️ 死亡过程有1个衰老事件铺垫，但偏少')
    } else {
      // 检查 agingHints 是否存在
      if (r.agingHints.length > 0) {
        lines.push(`⚠️ 死亡过程缺少衰老事件，但有 ${r.agingHints.length} 条 agingHint 文本铺垫`)
      } else {
        lines.push('❌ 死亡过程既无衰老事件也无 agingHint 铺垫')
      }
    }
    lines.push('')
  }

  // ==================== 综合分析 ====================
  lines.push('---')
  lines.push('')
  lines.push('## 2. 修复验证分析')
  lines.push('')

  // 2.1 衰老事件触发率
  lines.push('### 2.1 衰老事件触发率（修复验证 #2）')
  lines.push('')
  const agingTypes = ['aging_hint_early', 'aging_hint_mid', 'aging_hint_late', 'aging_elf_reflection', 'aging_dwarf_beard', 'elf_human_friend_aging']
  const agingCover: Record<string, number> = {}
  for (const t of agingTypes) agingCover[t] = 0
  for (const r of results) {
    for (const a of r.agingEvents) {
      agingCover[a.eventId] = (agingCover[a.eventId] || 0) + 1
    }
  }
  lines.push('| 事件ID | 权重 | 触发次数 | 判定 |')
  lines.push('|--------|------|----------|------|')
  lines.push('| aging_hint_early | 5 | ' + (agingCover['aging_hint_early'] || 0) + ' | ' + ((agingCover['aging_hint_early'] || 0) >= 2 ? '✅' : '⚠️ 偏低') + ' |')
  lines.push('| aging_hint_mid | 5 | ' + (agingCover['aging_hint_mid'] || 0) + ' | ' + ((agingCover['aging_hint_mid'] || 0) >= 2 ? '✅' : '⚠️ 偏低') + ' |')
  lines.push('| aging_hint_late | 5 | ' + (agingCover['aging_hint_late'] || 0) + ' | ' + ((agingCover['aging_hint_late'] || 0) >= 2 ? '✅' : '⚠️ 偏低') + ' |')
  lines.push('| aging_elf_reflection | 5 | ' + (agingCover['aging_elf_reflection'] || 0) + ' | ' + ((agingCover['aging_elf_reflection'] || 0) >= 1 ? '✅' : '⚠️ 未触发') + ' |')
  lines.push('| aging_dwarf_beard | 5 | ' + (agingCover['aging_dwarf_beard'] || 0) + ' | ' + ((agingCover['aging_dwarf_beard'] || 0) >= 1 ? '✅' : '⚠️ 未触发') + ' |')
  lines.push('| elf_human_friend_aging | 4 | ' + (agingCover['elf_human_friend_aging'] || 0) + ' | — (种族专属) |')
  lines.push('')

  const totalAgingTriggered = results.filter(r => r.agingEvents.length > 0).length
  lines.push(`- 至少触发1个衰老事件的局数: ${totalAgingTriggered}/${results.length}`)
  lines.push(`- 人类衰老事件: ${results.filter(r => r.race === 'human').flatMap(r => r.agingEvents).length} 次（2局）`)
  lines.push(`- 精灵 aging_elf_reflection: ${results.filter(r => r.race === 'elf').flatMap(r => r.agingEvents.filter(a => a.eventId === 'aging_elf_reflection')).length} 次（2局）`)
  lines.push(`- 矮人 aging_dwarf_beard: ${results.filter(r => r.race === 'dwarf').flatMap(r => r.agingEvents.filter(a => a.eventId === 'aging_dwarf_beard')).length} 次（2局）`)
  lines.push('')

  // 2.2 HP 单年降幅
  lines.push('### 2.2 HP 单年降幅上限（修复验证 #1）')
  lines.push('')
  lines.push('| 种族 | initHp | 期望上限 | 观测最大降幅 | 超限年数 | 判定 |')
  lines.push('|------|--------|----------|------------|---------|------|')

  const raceResults = new Map<string, PlaytestResult[]>()
  for (const r of results) {
    if (!raceResults.has(r.race)) raceResults.set(r.race, [])
    raceResults.get(r.race)!.push(r)
  }

  for (const [race, rs] of raceResults) {
    for (const r of rs) {
      const ok = r.yearsExceedingLimit.length === 0
      lines.push(`| ${r.race} | ${r.initHp} | ${r.expectedMaxYearlyDecay} | ${Math.round(r.maxSingleYearHpDrop)} | ${r.yearsExceedingLimit.length} | ${ok ? '✅' : '❌'} |`)
    }
  }
  lines.push('')

  // 全局HP降幅统计
  let globalMaxDrop = 0
  let globalMaxDropGame = ''
  let totalExceedingYears = 0
  for (const r of results) {
    if (r.maxSingleYearHpDrop > globalMaxDrop) {
      globalMaxDrop = r.maxSingleYearHpDrop
      globalMaxDropGame = r.label
    }
    totalExceedingYears += r.yearsExceedingLimit.length
  }
  lines.push(`- 全局最大单年HP降幅: ${Math.round(globalMaxDrop)} (${globalMaxDropGame})`)
  lines.push(`- 总超限年数（单年降幅 > 20）: ${totalExceedingYears}`)
  lines.push(`- 超限结论: ${totalExceedingYears === 0 ? '✅ 所有局均未超限' : '❌ 存在超限'} `)
  lines.push('')

  // 2.3 死亡自然度
  lines.push('### 2.3 死亡自然度')
  lines.push('')
  lines.push(`- 突兀死亡: ${results.filter(r => r.abruptDeath).length}/${results.length}`)
  lines.push(`- 有衰老事件铺垫: ${results.filter(r => r.agingEvents.length >= 2).length}/${results.length}`)
  lines.push(`- 有 agingHint 铺垫: ${results.filter(r => r.agingHints.length > 0).length}/${results.length}`)
  lines.push('')

  // ==================== 寿命范围验证 ====================
  lines.push('### 2.4 寿命范围验证')
  lines.push('')
  const lifespanTarget: Record<string, [number, number]> = {
    human: [50, 100],
    elf: [200, 450],
    goblin: [15, 45],
    dwarf: [100, 200],
    beastfolk: [30, 80],
    seaelf: [250, 550],
  }
  lines.push('| 种族 | 期望范围 | 实际寿命 | 判定 |')
  lines.push('|------|----------|----------|------|')
  for (const [race, rs] of raceResults) {
    for (const r of rs) {
      const [min, max] = lifespanTarget[race] ?? [0, 100]
      const ok = r.lifespan >= min && r.lifespan <= max
      lines.push(`| ${race} | ${min}-${max} | ${r.lifespan} | ${ok ? '✅' : '⚠️'} |`)
    }
  }
  lines.push('')

  // ==================== 问题列表 ====================
  lines.push('---')
  lines.push('')
  lines.push('## 3. 发现的问题')
  lines.push('')

  const issues: { severity: string; desc: string; category: string }[] = []

  for (const r of results) {
    // 寿命异常
    const [minExp, maxExp] = lifespanTarget[r.race] ?? [0, 100]
    if (r.lifespan > maxExp) {
      issues.push({ severity: 'P2', desc: `[${r.label}] 寿命${r.lifespan}超出种族上限${maxExp}`, category: '寿命' })
    }
    if (r.lifespan < minExp) {
      issues.push({ severity: 'P2', desc: `[${r.label}] 寿命${r.lifespan}低于种族下限${minExp}`, category: '寿命' })
    }

    // HP超限
    for (const y of r.yearsExceedingLimit) {
      issues.push({ severity: 'P1', desc: `[${r.label}] age=${y.age} HP单年降幅${y.drop}，超过20上限 (initHp=${r.initHp})`, category: 'HP降幅' })
    }

    // 衰老事件缺失
    if (r.agingEvents.length === 0 && !['goblin', 'beastfolk'].includes(r.race)) {
      issues.push({ severity: 'P2', desc: `[${r.label}] 未触发任何衰老事件 (${r.race})`, category: '衰老事件' })
    }

    // 突兀死亡
    if (r.abruptDeath) {
      issues.push({ severity: 'P2', desc: `[${r.label}] 死亡突兀`, category: '死亡体验' })
    }

    // 空白期
    for (const g of r.gaps) {
      if (g.length >= 10) {
        issues.push({ severity: 'P3', desc: `[${r.label}] 超长空白期: ${g.start}~${g.end}岁（${g.length}年）`, category: '内容' })
      }
    }

    // 事件过少
    if (r.eventLog.length <= 3) {
      issues.push({ severity: 'P1', desc: `[${r.label}] 事件过少（${r.eventLog.length}个）`, category: '内容' })
    }
  }

  // 全局检查
  // aging_elf_reflection 种族匹配问题
  const elfResults = results.filter(r => r.race === 'elf')
  const elfReflectionTriggered = elfResults.some(r => r.agingEvents.some(a => a.eventId === 'aging_elf_reflection'))
  if (!elfReflectionTriggered) {
    issues.push({ severity: 'P2', desc: '精灵 aging_elf_reflection 未触发 — 注意事件 races 字段使用 sea_elf 但实际种族 ID 为 seaelf，可能导致海精灵永远无法触发此事件', category: '数据配置' })
  }

  if (issues.length === 0) {
    lines.push('✅ 未发现严重问题。')
  } else {
    lines.push('| 等级 | 类别 | 描述 |')
    lines.push('|------|------|------|')
    for (const issue of issues.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5)
    })) {
      lines.push(`| ${issue.severity} | ${issue.category} | ${issue.desc} |`)
    }
  }
  lines.push('')

  // ==================== 结论 ====================
  lines.push('---')
  lines.push('')
  lines.push('## 4. 结论')
  lines.push('')

  lines.push('### 修复 #1: HP 单年降幅上限')
  const hpIssues = issues.filter(i => i.category === 'HP降幅')
  if (hpIssues.length === 0) {
    lines.push('✅ **通过** — 所有 14 局的 HP 单年降幅均未超过 20 点上限。')
  } else {
    lines.push(`❌ **未通过** — 发现 ${hpIssues.length} 个 HP 超限问题。`)
  }
  lines.push('')

  lines.push('### 修复 #2: 衰老事件触发率')
  const humanAging = results.filter(r => r.race === 'human').flatMap(r => r.agingEvents).length
  const elfReflection = results.filter(r => r.race === 'elf').flatMap(r => r.agingEvents.filter(a => a.eventId === 'aging_elf_reflection')).length
  const dwarfBeard = results.filter(r => r.race === 'dwarf').flatMap(r => r.agingEvents.filter(a => a.eventId === 'aging_dwarf_beard')).length
  const agingOk = humanAging >= 2 && elfReflection >= 1 && dwarfBeard >= 1
  lines.push(`- 人类衰老事件: ${humanAging}次 ${humanAging >= 2 ? '✅' : '⚠️'}`)
  lines.push(`- 精灵 aging_elf_reflection: ${elfReflection}次 ${elfReflection >= 1 ? '✅' : '⚠️'}`)
  lines.push(`- 矮人 aging_dwarf_beard: ${dwarfBeard}次 ${dwarfBeard >= 1 ? '✅' : '⚠️'}`)
  lines.push(`- 总体: ${agingOk ? '✅ 通过' : '⚠️ 部分未通过'}`)
  lines.push('')

  lines.push('### 死亡自然度')
  const abruptCount = results.filter(r => r.abruptDeath).length
  lines.push(`- 突兀死亡: ${abruptCount}/${results.length} ${abruptCount === 0 ? '✅' : '⚠️'}`)
  lines.push(`- 有衰老铺垫: ${results.filter(r => r.agingEvents.length >= 2).length}/${results.length}`)
  lines.push('')

  lines.push('### 总体评价')
  const p0 = issues.filter(i => i.severity === 'P0').length
  const p1 = issues.filter(i => i.severity === 'P1').length
  const p2 = issues.filter(i => i.severity === 'P2').length
  if (p0 > 0) {
    lines.push(`❌ 存在 ${p0} 个 P0 级严重问题，不建议发版。`)
  } else if (p1 > 0) {
    lines.push(`⚠️ 存在 ${p1} 个 P1 级问题，建议修复后再发版。`)
  } else if (p2 > 0) {
    lines.push(`🟡 存在 ${p2} 个 P2 级体验问题，可以发版但建议跟进。`)
  } else {
    lines.push('✅ 未发现严重问题，两项修复均通过验证。')
  }
  lines.push('')

  return lines.join('\n')
}

// ==================== 辅助 ====================

function isLifespanOk(race: string, lifespan: number): boolean {
  const targets: Record<string, [number, number]> = {
    human: [50, 100], elf: [200, 450], goblin: [15, 45],
    dwarf: [100, 200], beastfolk: [30, 80], seaelf: [250, 550],
  }
  const [min, max] = targets[race] ?? [0, 100]
  return lifespan >= min && lifespan <= max
}

function sampleArray<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr
  const step = arr.length / n
  const result: T[] = []
  for (let i = 0; i < n; i++) {
    result.push(arr[Math.floor(i * step)])
  }
  return result
}

// ==================== 主函数 ====================

async function main() {
  console.log('🔄 开始第四轮验证测试...')
  console.log(`📊 共 ${TEST_CASES.length} 局测试（7种族 × 2局，半龙人跳过）\n`)

  const world = await createSwordAndMagicWorld()
  const results: PlaytestResult[] = []

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i]
    console.log(`[${i + 1}/${TEST_CASES.length}] ${tc.label} (${tc.race}/${tc.gender}, ${tc.talentCategory})...`)
    try {
      const result = runOneGame(tc, world)
      results.push(result)
      const lifespanOk = isLifespanOk(result.race, result.lifespan) ? '✅' : '⚠️'
      const hpOk = result.yearsExceedingLimit.length === 0 ? '✅' : `❌(${result.yearsExceedingLimit.length}年超限)`
      const agingDetail = result.agingEvents.map(a => `${a.eventId}@${a.age}岁`).join(', ') || '无'
      console.log(`  寿命=${result.lifespan}/${result.effectiveMaxAge} ${lifespanOk} | 评级=${result.grade}(${result.score.toFixed(0)}分) | 事件=${result.eventLog.length} | 衰老=[${agingDetail}] | HP最大降幅=${Math.round(result.maxSingleYearHpDrop)} ${hpOk}`)
    } catch (e: any) {
      console.error(`  ❌ 错误: ${e.message}`)
      if (e.stack) console.error(e.stack)
    }
  }

  // 生成报告
  const report = generateReport(results)
  const reportPath = 'docs/PLAYTEST-ROUND4.md'
  const fs = await import('fs')
  const path = await import('path')
  const fullPath = path.join(process.cwd(), reportPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, report, 'utf-8')
  console.log(`\n✅ 报告已写入: ${fullPath}`)
  console.log(`📄 共 ${results.length} 局结果`)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
