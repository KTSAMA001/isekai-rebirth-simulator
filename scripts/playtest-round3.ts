/**
 * 第三轮完整游玩测试 — 种族×天赋组合全覆盖
 * 目标：7种族 × 2局 = 14局，覆盖战斗/魔法/社交/冒险四系天赋
 * 运行: npx tsx scripts/playtest-round3.ts
 */

import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic/index'
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import type { EventLogEntry, GameState } from '../src/engine/core/types'

// ==================== 测试配置 ====================

interface TestCase {
  label: string
  race: string
  gender: 'male' | 'female'
  talentIds: string[]        // 想要选择的天赋（如果不在 draft pool 中则跳过）
  talentCategory: string     // '战斗' | '魔法' | '社交' | '冒险'
  attrBias: Record<string, number>  // 属性分配倾向（attrId → 优先级权重）
  seed: number
}

const TEST_CASES: TestCase[] = [
  // 人类 2 局
  { label: '人类-战士路线', race: 'human', gender: 'male', talentIds: ['fighter_instinct', 'village_hero_seed'], talentCategory: '战斗', attrBias: { str: 8, mag: 1, int: 2, spr: 2, chr: 1, mny: 2, luk: 3 }, seed: 30001 },
  { label: '人类-魔法路线', race: 'human', gender: 'female', talentIds: ['blessed_by_goddess', 'bookworm'], talentCategory: '魔法', attrBias: { mag: 8, int: 5, spr: 3, chr: 1, mny: 1, str: 1, luk: 1 }, seed: 30002 },

  // 精灵 2 局
  { label: '精灵-魔法天赋', race: 'elf', gender: 'female', talentIds: ['elven_harmony', 'elf_female_moonweaver'], talentCategory: '魔法', attrBias: { mag: 8, int: 5, spr: 4, chr: 2, mny: 1, str: 1, luk: 1 }, seed: 30003 },
  { label: '精灵-冒险路线', race: 'elf', gender: 'male', talentIds: ['explorer_curiosity', 'wanderer_instinct'], talentCategory: '冒险', attrBias: { int: 5, spr: 5, mag: 4, chr: 3, str: 2, luk: 2, mny: 1 }, seed: 30004 },

  // 哥布林 2 局
  { label: '哥布林-社交路线', race: 'goblin', gender: 'female', talentIds: ['goblin_cunning', 'goblin_female_trickster'], talentCategory: '社交', attrBias: { luk: 8, int: 5, chr: 4, mag: 2, mny: 3, str: 1, spr: 1 }, seed: 30005 },
  { label: '哥布林-战斗路线', race: 'goblin', gender: 'male', talentIds: ['goblin_chaos_born', 'goblin_male_berserker'], talentCategory: '战斗', attrBias: { str: 7, luk: 6, int: 3, mag: 2, chr: 1, mny: 1, spr: 2 }, seed: 30006 },

  // 矮人 2 局
  { label: '矮人-战斗路线', race: 'dwarf', gender: 'male', talentIds: ['dwarf_stoneblood', 'dwarf_male_shieldbeard'], talentCategory: '战斗', attrBias: { str: 8, spr: 5, int: 2, mag: 1, chr: 1, mny: 3, luk: 2 }, seed: 30007 },
  { label: '矮人-社交路线', race: 'dwarf', gender: 'female', talentIds: ['dwarf_female_clan_brewer', 'merchant_blood'], talentCategory: '社交', attrBias: { mny: 6, chr: 5, str: 4, spr: 3, int: 2, mag: 1, luk: 2 }, seed: 30008 },

  // 兽人 2 局
  { label: '兽人-战斗路线', race: 'beastfolk', gender: 'male', talentIds: ['fighter_instinct', 'wild_talent'], talentCategory: '战斗', attrBias: { str: 10, spr: 4, luk: 3, int: 1, mag: 1, chr: 2, mny: 1 }, seed: 30009 },
  { label: '兽人-冒险路线', race: 'beastfolk', gender: 'female', talentIds: ['explorer_curiosity', 'village_hero_seed'], talentCategory: '冒险', attrBias: { str: 7, luk: 5, spr: 3, int: 3, chr: 2, mag: 1, mny: 2 }, seed: 30010 },

  // 海精灵 2 局
  { label: '海精灵-魔法路线', race: 'seaelf', gender: 'female', talentIds: ['blessed_by_goddess', 'moonlit_blessing'], talentCategory: '魔法', attrBias: { mag: 10, chr: 5, spr: 3, int: 2, mny: 1, str: 1, luk: 2 }, seed: 30011 },
  { label: '海精灵-社交路线', race: 'seaelf', gender: 'male', talentIds: ['explorer_curiosity', 'blessed_by_goddess'], talentCategory: '社交', attrBias: { chr: 8, mag: 5, int: 3, spr: 3, mny: 2, str: 1, luk: 2 }, seed: 30012 },

  // 半龙人 2 局
  { label: '半龙人-战斗路线', race: 'halfdragon', gender: 'male', talentIds: ['dragon_blood', 'fighter_instinct'], talentCategory: '战斗', attrBias: { str: 9, mag: 6, spr: 4, int: 1, chr: 1, mny: 1, luk: 1 }, seed: 30013 },
  { label: '半龙人-魔法路线', race: 'halfdragon', gender: 'female', talentIds: ['dragon_blood', 'blessed_by_goddess'], talentCategory: '魔法', attrBias: { mag: 9, str: 5, spr: 4, int: 2, chr: 1, mny: 1, luk: 2 }, seed: 30014 },
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
  /** 关键事件汇总 */
  keyEvents: { age: number; title: string; branch?: string }[]
  /** 衰老事件触发记录 */
  agingEvents: { age: number; eventId: string }[]
  /** agingHint 文本 */
  agingHints: { age: number; hint: string }[]
  /** 空白期（连续5年+无事件） */
  gaps: { start: number; end: number; length: number }[]
  /** HP 历史（每年） */
  hpHistory: { age: number; hp: number }[]
  /** 最终属性 */
  finalAttrs: Record<string, number>
  /** 属性峰值 */
  peakAttrs: Record<string, number>
  /** 死亡是否突兀（最后5年无事件且HP骤降） */
  abruptDeath: boolean
  /** 路线 */
  route: string
  /** 恋爱事件 */
  loveEvents: { age: number; title: string }[]
  /** 职业/路线相关事件 */
  careerEvents: { age: number; title: string }[]
  /** 种族专属事件 */
  raceEvents: { age: number; title: string }[]
  /** 物品 */
  items: string[]
  /** Flags */
  flags: string[]
}

// ==================== 辅助函数 ====================

const ATTR_NAMES: Record<string, string> = {
  chr: '魅力', int: '智慧', str: '体魄', mny: '家境', spr: '灵魂', mag: '魔力', luk: '运势',
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickBranch(engine: SimulationEngine, branches: any[]): string {
  // 过滤可用的分支
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

// ==================== 单局运行 ====================

function runOneGame(tc: TestCase, world: any): PlaytestResult {
  const engine = new SimulationEngine(world, tc.seed)
  engine.initGame(`测试-${tc.label}`, undefined, tc.race, tc.gender)

  // 抽天赋
  const drafted = engine.draftTalents()
  // 优先选择指定天赋，不足则补全
  const wanted = tc.talentIds.filter(id => drafted.includes(id))
  const extras = drafted.filter(id => !wanted.includes(id)).slice(0, 3 - wanted.length)
  const selected = [...wanted, ...extras]
  engine.selectTalents(selected.slice(0, 3))

  // 记录初始属性（天赋分配后的基础值）
  const baseAttrs = { ...engine.getState().attributes }

  // 分配属性点：按 bias 分配
  const attrIds = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const penalty = engine.getState().talentPenalty ?? 0
  let remaining = (world.manifest.initialPoints ?? 20) - penalty
  const allocation: Record<string, number> = {}

  // 归一化权重
  const totalWeight = attrIds.reduce((sum, id) => sum + (tc.attrBias[id] ?? 1), 0)
  for (const id of attrIds) {
    const rawWeight = tc.attrBias[id] ?? 1
    // 按权重比例分配，最小1点
    allocation[id] = Math.max(1, Math.round(rawWeight / totalWeight * remaining))
    remaining -= allocation[id]
    if (remaining <= 0) break
  }
  // 剩余点数加到权重最高的属性
  if (remaining > 0) {
    const maxAttr = attrIds.reduce((a, b) => (tc.attrBias[a] ?? 1) >= (tc.attrBias[b] ?? 1) ? a : b)
    allocation[maxAttr] = (allocation[maxAttr] ?? 0) + remaining
  }
  engine.allocateAttributes(allocation)

  const initState = engine.getState()

  // 开始模拟
  const allLog: EventLogEntry[] = []
  const hpHistory: { age: number; hp: number }[] = []
  const agingHints: { age: number; hint: string }[] = []

  // 最大模拟年龄：精灵/海精灵最多500年
  const maxSimAge = 550

  for (let year = 0; year < maxSimAge; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0 || stateBefore.phase === 'finished') break
    if (stateBefore.phase === 'simulating') {
      const yearResult = engine.startYear()
      const stateAfter = engine.getState()

      // 记录 HP
      hpHistory.push({ age: stateAfter.age, hp: stateAfter.hp })

      // 记录 agingHint
      if (yearResult.agingHint) {
        agingHints.push({ age: stateAfter.age, hint: yearResult.agingHint })
      }

      if (stateAfter.hp <= 0 || stateAfter.phase === 'finished') {
        if (yearResult.logEntry) allLog.push(yearResult.logEntry)
        break
      }

      if (yearResult.phase === 'awaiting_choice' && yearResult.event && yearResult.branches && yearResult.branches.length > 0) {
        // 尝试选择分支，如果失败则用第一个可用分支
        let branchId: string | undefined
        try {
          branchId = pickBranch(engine, yearResult.branches)
        } catch {
          branchId = yearResult.branches[0].id
        }
        try {
          engine.resolveBranch(branchId)
        } catch (e: any) {
          // 条件不满足时尝试其他分支
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
            // 无法选择任何分支，强制结束
            console.warn(`  ⚠️ [${tc.label}] 无法解析分支 ${branchId}，强制结束 (age=${stateAfter.age})`)
            break
          }
        }
        const stateResolved = engine.getState()
        if (stateResolved.phase === 'finished' || stateResolved.hp <= 0) {
          break
        }
        // 获取 resolveBranch 后生成的 logEntry
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

  // 如果游戏未正常结束，尝试手动结算
  let endState = engine.getState()
  if (endState.phase !== 'finished' && endState.result === undefined) {
    try {
      engine.finish()
    } catch { /* phase might not allow finish */ }
    endState = engine.getState()
  }

  // 提取关键事件
  const keyEvents = allLog.map(e => ({
    age: e.age,
    title: e.title,
    branch: e.branchTitle,
  }))

  // 衰老事件
  const agingEventIds = ['aging_hint_early', 'aging_hint_mid', 'aging_hint_late', 'aging_elf_reflection', 'aging_dwarf_beard']
  const agingEvents = allLog
    .filter(e => agingEventIds.includes(e.eventId))
    .map(e => ({ age: e.age, eventId: e.eventId }))

  // 空白期检测（连续5年以上无事件）
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
        if (gapLen >= 5) {
          gaps.push({ start: gapStart, end: age - 1, length: gapLen })
        }
        gapStart = -1
      }
    }
  }
  if (gapStart !== -1 && lifespan - gapStart + 1 >= 5) {
    gaps.push({ start: gapStart, end: lifespan, length: lifespan - gapStart + 1 })
  }

  // 突兀死亡检测：最后5年无事件 + HP从较高值骤降到0
  const last5YearsEvents = allLog.filter(e => e.age > lifespan - 5)
  const abruptDeath = last5YearsEvents.length === 0 && hpHistory.length >= 5 && hpHistory[hpHistory.length - 2]?.hp > 20

  // 恋爱事件（关键字匹配）
  const loveKeywords = ['恋爱', '告白', '约会', '求婚', '婚礼', '结婚', '恋人', '暗恋', '伴侣', '情人', '情人', '姻缘', '婚礼']
  const loveEvents = allLog.filter(e => loveKeywords.some(kw => e.title.includes(kw) || e.description.includes(kw)))
    .map(e => ({ age: e.age, title: e.title }))

  // 职业事件
  const careerKeywords = ['职业', '公会', '骑士', '魔法', '商人', '学者', '冒险', '转职', '晋升', '毕业', '就职', '学徒', '大师']
  const careerEvents = allLog.filter(e => careerKeywords.some(kw => e.title.includes(kw) || e.description.includes(kw)))
    .map(e => ({ age: e.age, title: e.title }))

  // 种族专属事件（检查事件是否标记了特定种族）
  const raceEvents = allLog.filter(e => {
    // 通过事件 ID 中包含种族名来判断
    return e.eventId.includes(tc.race) || e.eventId.includes('elf_') || e.eventId.includes('goblin_') || e.eventId.includes('dwarf_') || e.eventId.includes('beast_') || e.eventId.includes('sea_')
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
  }
}

// ==================== 报告生成 ====================

function generateReport(results: PlaytestResult[]): string {
  const lines: string[] = []

  lines.push('# 🎮 第三轮完整游玩测试报告')
  lines.push('')
  lines.push(`**测试日期**: ${new Date().toISOString().split('T')[0]}`)
  lines.push(`**测试目标**: 7种族 × 2局 = ${results.length}局，覆盖战斗/魔法/社交/冒险四系天赋`)
  lines.push(`**项目版本**: 剑与魔法 v1.0.0`)
  lines.push('')

  // ==================== 汇总表 ====================
  lines.push('## 1. 测试汇总')
  lines.push('')
  lines.push('| # | 配置 | 种族 | 天赋系 | 寿命 | 期望寿命 | 比率 | 评级 | 分数 | 事件数 | 衰老事件 | 空白期 | 突兀死亡 |')
  lines.push('|---|------|------|--------|------|----------|------|------|------|--------|----------|--------|----------|')

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const ge = gradeEmoji(r.grade)
    const lifespanOk = isLifespanOk(r.race, r.lifespan) ? '✅' : '⚠️'
    lines.push(`| ${i + 1} | ${r.label} | ${r.race} | ${r.talentCategory} | ${r.lifespan} | ${r.effectiveMaxAge} | ${(r.lifeRatio * 100).toFixed(0)}% | ${ge} ${r.grade} | ${r.score.toFixed(0)} | ${r.eventLog.length} | ${r.agingEvents.length > 0 ? r.agingEvents.map(a => a.eventId).join(', ') : '—'} | ${r.gaps.length > 0 ? r.gaps.map(g => g.length + 'yr').join(', ') : '—'} | ${r.abruptDeath ? '❌ 是' : '✅ 否'} |`)
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
    lines.push(`- **最终属性**: ${Object.entries(r.finalAttrs).map(([k, v]) => `${ATTR_NAMES[k]}=${v}`).join(', ')}`)
    lines.push(`- **属性峰值**: ${Object.entries(r.peakAttrs).map(([k, v]) => `${ATTR_NAMES[k]}=${v}`).join(', ')}`)
    lines.push(`- **寿命**: ${r.lifespan} / 期望 ${r.effectiveMaxAge} (${(r.lifeRatio * 100).toFixed(1)}%) ${isLifespanOk(r.race, r.lifespan) ? '✅' : '⚠️ 超出/低于预期'}`)
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
    } else {
      lines.push('⚠️ 无事件记录。')
    }
    lines.push('')

    // 衰老事件
    if (r.agingEvents.length > 0) {
      lines.push('### 衰老事件')
      lines.push('')
      lines.push('| 触发年龄 | 事件ID |')
      lines.push('|----------|--------|')
      for (const a of r.agingEvents) {
        lines.push(`| ${a.age} | ${a.eventId} |`)
      }
      lines.push('')

      // 衰老体验评估
      const agingAges = r.agingEvents.map(a => a.age)
      const minAgingAge = Math.min(...agingAges)
      const lifeRatioAtFirst = (minAgingAge / r.effectiveMaxAge * 100).toFixed(0)
      lines.push(`> 首次衰老事件在 ${minAgingAge} 岁（${lifeRatioAtFirst}%寿命），`)
      if (r.agingEvents.length >= 2) {
        const lastAgingAge = Math.max(...agingAges)
        lines.push(`末次在 ${lastAgingAge} 岁，间隔 ${lastAgingAge - minAgingAge} 年。`)
      }
      lines.push(`${r.agingEvents.length >= 2 ? '✅ 渐进式衰老体验' : '⚠️ 衰老事件偏少'}`)
      lines.push('')
    } else {
      lines.push('### 衰老事件')
      lines.push('')
      lines.push(`> ⚠️ 未触发任何衰老事件（aging_hint_early/mid/late, aging_elf_reflection, aging_dwarf_beard）`)
      lines.push('')
    }

    // AgingHint 检查
    if (r.agingHints.length > 0) {
      lines.push('### 衰老提示文本（agingHint）')
      lines.push('')
      lines.push('```')
      for (const h of r.agingHints.slice(0, 8)) {
        lines.push(`age=${h.age} (${(h.age / r.effectiveMaxAge * 100).toFixed(0)}%): ${h.hint}`)
      }
      if (r.agingHints.length > 8) {
        lines.push(`... 共 ${r.agingHints.length} 条`)
      }
      lines.push('```')
      lines.push('')
    }

    // HP 历史
    lines.push('### HP 变化')
    lines.push('')
    lines.push('```')
    const hpSamples = sampleArray(r.hpHistory, 20)
    for (const h of hpSamples) {
      const bar = '█'.repeat(Math.max(0, Math.round(h.hp / 2)))
      lines.push(`age=${String(h.age).padStart(4)} hp=${String(Math.round(h.hp)).padStart(4)} ${bar}`)
    }
    lines.push('```')
    lines.push('')

    // 空白期
    if (r.gaps.length > 0) {
      lines.push('### ⚠️ 空白期')
      lines.push('')
      for (const g of r.gaps) {
        lines.push(`- ${g.start}~${g.end} 岁（${g.length}年无事件）`)
      }
      lines.push('')
    }

    // 恋爱事件
    if (r.loveEvents.length > 0) {
      lines.push('### 恋爱事件')
      lines.push('')
      for (const e of r.loveEvents) {
        lines.push(`- ${e.age}岁: ${e.title}`)
      }
      lines.push('')
    } else {
      lines.push('### 恋爱事件')
      lines.push('')
      lines.push('> 未触发任何恋爱相关事件')
      lines.push('')
    }

    // 职业事件
    if (r.careerEvents.length > 0) {
      lines.push('### 职业事件')
      lines.push('')
      for (const e of r.careerEvents) {
        lines.push(`- ${e.age}岁: ${e.title}`)
      }
      lines.push('')
    }

    // 种族专属事件
    if (r.raceEvents.length > 0) {
      lines.push('### 种族专属事件')
      lines.push('')
      for (const e of r.raceEvents) {
        lines.push(`- ${e.age}岁: ${e.title}`)
      }
      lines.push('')
    } else {
      lines.push('### 种族专属事件')
      lines.push('')
      lines.push('> 未触发种族专属事件')
      lines.push('')
    }

    // 死亡评估
    lines.push('### 死亡评估')
    lines.push('')
    if (r.abruptDeath) {
      lines.push('❌ **死亡突兀**: 最后5年无事件且HP骤降')
    } else if (r.agingEvents.length >= 2) {
      lines.push('✅ 死亡过程自然，有渐进衰老铺垫')
    } else {
      lines.push('⚠️ 死亡过程缺少衰老事件铺垫（但可能有 agingHint）')
    }
    lines.push('')
  }

  // ==================== 综合分析 ====================
  lines.push('---')
  lines.push('')
  lines.push('## 2. 综合分析')
  lines.push('')

  // 2.1 寿命分析
  lines.push('### 2.1 寿命验证')
  lines.push('')
  lines.push('| 种族 | 期望范围 | 实际寿命 | 比率 | 判定 |')
  lines.push('|------|----------|----------|------|------|')

  const lifespanTarget: Record<string, [number, number]> = {
    human: [40, 90],
    elf: [180, 420],
    goblin: [15, 36],
    dwarf: [80, 180],
    beastfolk: [30, 68],
    seaelf: [220, 490],
    halfdragon: [110, 250],
  }

  const raceResults = new Map<string, PlaytestResult[]>()
  for (const r of results) {
    if (!raceResults.has(r.race)) raceResults.set(r.race, [])
    raceResults.get(r.race)!.push(r)
  }

  for (const [race, [minExpected, maxExpected]] of Object.entries(lifespanTarget)) {
    const rs = raceResults.get(race) ?? []
    for (const r of rs) {
      const ok = r.lifespan >= minExpected && r.lifespan <= maxExpected
      lines.push(`| ${race} | ${minExpected}-${maxExpected} | ${r.lifespan} | ${(r.lifeRatio * 100).toFixed(0)}% | ${ok ? '✅' : '⚠️'} |`)
    }
  }
  lines.push('')

  // 2.2 衰老事件覆盖
  lines.push('### 2.2 衰老事件覆盖')
  lines.push('')
  const agingTypes = ['aging_hint_early', 'aging_hint_mid', 'aging_hint_late', 'aging_elf_reflection', 'aging_dwarf_beard']
  const agingCover: Record<string, number> = {}
  for (const t of agingTypes) agingCover[t] = 0
  for (const r of results) {
    for (const a of r.agingEvents) {
      agingCover[a.eventId] = (agingCover[a.eventId] || 0) + 1
    }
  }
  lines.push('| 事件ID | 触发次数 |')
  lines.push('|--------|----------|')
  for (const t of agingTypes) {
    lines.push(`| ${t} | ${agingCover[t]} |`)
  }
  lines.push('')

  const totalAgingTriggered = Object.values(agingCover).reduce((a, b) => a + b, 0)
  lines.push(`> ${totalAgingTriggered}/${results.length} 局触发了至少一个衰老事件`)
  lines.push('')

  // 2.3 空白期统计
  lines.push('### 2.3 空白期统计')
  lines.push('')
  const totalGaps = results.reduce((sum, r) => sum + r.gaps.length, 0)
  const maxGap = results.reduce((max, r) => Math.max(max, ...r.gaps.map(g => g.length)), 0)
  lines.push(`- 总空白期数: ${totalGaps}`)
  lines.push(`- 最大空白期: ${maxGap}年`)
  lines.push(`- 有空白期的局数: ${results.filter(r => r.gaps.length > 0).length}/${results.length}`)
  lines.push('')

  // 2.4 死亡突兀统计
  lines.push('### 2.4 死亡自然度')
  lines.push('')
  lines.push(`- 突兀死亡: ${results.filter(r => r.abruptDeath).length}/${results.length}`)
  lines.push(`- 有衰老事件铺垫: ${results.filter(r => r.agingEvents.length >= 2).length}/${results.length}`)
  lines.push('')

  // 2.5 恋爱链可达性
  lines.push('### 2.5 恋爱事件可达性')
  lines.push('')
  const loveResults = results.filter(r => r.loveEvents.length > 0)
  lines.push(`- 触发恋爱事件的局数: ${loveResults.length}/${results.length}`)
  if (loveResults.length > 0) {
    lines.push(`- 最早恋爱事件年龄: ${Math.min(...loveResults.flatMap(r => r.loveEvents.map(e => e.age)))}岁`)
    lines.push(`- 最晚恋爱事件年龄: ${Math.max(...loveResults.flatMap(r => r.loveEvents.map(e => e.age)))}岁`)
  }
  lines.push('')

  // 2.6 单年衰减上限验证
  lines.push('### 2.6 单年衰减上限验证')
  lines.push('')
  let maxHpdDrop = 0
  let maxHpdDropGame = ''
  for (const r of results) {
    for (let i = 1; i < r.hpHistory.length; i++) {
      const drop = r.hpHistory[i - 1].hp - r.hpHistory[i].hp
      if (drop > maxHpdDrop) {
        maxHpdDrop = drop
        maxHpdDropGame = r.label
      }
    }
  }
  lines.push(`- 观测到的最大单年 HP 降幅: ${Math.round(maxHpdDrop)} (${maxHpdDropGame})`)
  lines.push(`- 单年衰减上限设计: 初始HP的25%或20，取较大值`)
  lines.push('')

  // ==================== 问题列表 ====================
  lines.push('---')
  lines.push('')
  lines.push('## 3. 发现的问题')
  lines.push('')

  const issues: { severity: string; desc: string }[] = []

  for (const r of results) {
    // 寿命异常
    const [minExp, maxExp] = lifespanTarget[r.race] ?? [0, 100]
    if (r.lifespan > maxExp) {
      issues.push({ severity: 'P2', desc: `[${r.label}] 寿命${r.lifespan}超出种族上限${maxExp} (${r.race})` })
    }

    // 衰老事件缺失
    if (r.agingEvents.length === 0) {
      // 短寿种族可能活不到衰老事件触发年龄
      const isShortLived = ['goblin', 'beastfolk'].includes(r.race)
      if (!isShortLived) {
        issues.push({ severity: 'P3', desc: `[${r.label}] 未触发任何衰老事件 (${r.race})` })
      }
    }

    // 空白期
    for (const g of r.gaps) {
      if (g.length >= 10) {
        issues.push({ severity: 'P2', desc: `[${r.label}] 超长空白期: ${g.start}~${g.end}岁（${g.length}年无事件）` })
      }
    }

    // 突兀死亡
    if (r.abruptDeath) {
      issues.push({ severity: 'P2', desc: `[${r.label}] 死亡突兀: 最后5年无事件且HP骤降` })
    }

    // HP突降
    for (let i = 1; i < r.hpHistory.length; i++) {
      const drop = r.hpHistory[i - 1].hp - r.hpHistory[i].hp
      if (drop > 25) {
        issues.push({ severity: 'P2', desc: `[${r.label}] age=${r.hpHistory[i].age} HP突降${Math.round(drop)}点（单年上限应≤20或initHp×25%）` })
        break // 只报告一次
      }
    }

    // 无事件
    if (r.eventLog.length <= 3) {
      issues.push({ severity: 'P1', desc: `[${r.label}] 事件过少（${r.eventLog.length}个），体验极度空洞` })
    }
  }

  // 全局问题
  if (results.every(r => r.loveEvents.length === 0)) {
    issues.push({ severity: 'P1', desc: '所有14局均未触发恋爱事件，恋爱链可能不可达' })
  }

  const agingLongRace = results.filter(r => ['elf', 'seaelf', 'dwarf', 'halfdragon'].includes(r.race))
  if (agingLongRace.length > 0 && agingLongRace.every(r => r.agingEvents.length === 0)) {
    issues.push({ severity: 'P1', desc: '所有长寿种族均未触发衰老事件，aging相关事件的条件可能过严' })
  }

  if (issues.length === 0) {
    lines.push('✅ 未发现严重问题。')
  } else {
    lines.push('| 等级 | 描述 |')
    lines.push('|------|------|')
    for (const issue of issues.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5)
    })) {
      lines.push(`| ${issue.severity} | ${issue.desc} |`)
    }
  }
  lines.push('')

  // ==================== 结论 ====================
  lines.push('---')
  lines.push('')
  lines.push('## 4. 结论')
  lines.push('')
  lines.push('### 4.1 种族寿命表现')
  lines.push('')
  for (const [race, rs] of raceResults) {
    const [minExp, maxExp] = lifespanTarget[race] ?? [0, 100]
    const allOk = rs.every(r => r.lifespan >= minExp && r.lifespan <= maxExp)
    lines.push(`- **${race}**: ${allOk ? '✅' : '⚠️'} ${rs.map(r => r.lifespan + '岁').join(', ')} (期望${minExp}-${maxExp})`)
  }
  lines.push('')

  lines.push('### 4.2 衰老体验')
  lines.push('')
  lines.push(`- 衰老事件总触发率: ${totalAgingTriggered}/${results.length} (${(totalAgingTriggered / results.length * 100).toFixed(0)}%)`)
  lines.push(`- 单年最大HP降幅: ${Math.round(maxHpdDrop)}点 ${maxHpdDrop > 25 ? '⚠️超过预期上限' : '✅在安全范围内'}`)
  lines.push('')

  lines.push('### 4.3 恋爱链')
  lines.push('')
  lines.push(`- 恋爱事件可达性: ${loveResults.length > 0 ? '✅' : '❌'} (${loveResults.length}/${results.length}局触发)`)
  lines.push('')

  lines.push('### 4.4 总体评价')
  lines.push('')
  const p0Count = issues.filter(i => i.severity === 'P0').length
  const p1Count = issues.filter(i => i.severity === 'P1').length
  const p2Count = issues.filter(i => i.severity === 'P2').length
  if (p0Count > 0) {
    lines.push(`❌ 存在 ${p0Count} 个 P0 级严重问题，不建议发版。`)
  } else if (p1Count > 0) {
    lines.push(`⚠️ 存在 ${p1Count} 个 P1 级问题，建议修复后再发版。`)
  } else if (p2Count > 0) {
    lines.push(`🟡 存在 ${p2Count} 个 P2 级体验问题，可以发版但建议跟进。`)
  } else {
    lines.push('✅ 未发现严重问题，整体体验良好。')
  }
  lines.push('')

  return lines.join('\n')
}

// ==================== 辅助 ====================

function isLifespanOk(race: string, lifespan: number): boolean {
  const targets: Record<string, [number, number]> = {
    human: [40, 90], elf: [180, 420], goblin: [15, 36],
    dwarf: [80, 180], beastfolk: [30, 68], seaelf: [220, 490], halfdragon: [110, 250],
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
  console.log('🔄 开始第三轮完整游玩测试...')
  console.log(`📊 共 ${TEST_CASES.length} 局测试\n`)

  const world = await createSwordAndMagicWorld()
  const results: PlaytestResult[] = []

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i]
    console.log(`[${i + 1}/${TEST_CASES.length}] ${tc.label} (${tc.race}/${tc.gender}, ${tc.talentCategory})...`)
    try {
      const result = runOneGame(tc, world)
      results.push(result)
      const lifespanOk = isLifespanOk(result.race, result.lifespan) ? '✅' : '⚠️'
      console.log(`  寿命=${result.lifespan}/${result.effectiveMaxAge} ${lifespanOk} | 评级=${result.grade}(${result.score.toFixed(0)}分) | 事件=${result.eventLog.length} | 衰老=${result.agingEvents.length} | 空白期=${result.gaps.length}`)
    } catch (e: any) {
      console.error(`  ❌ 错误: ${e.message}`)
      if (e.stack) console.error(e.stack)
    }
  }

  // 生成报告
  const report = generateReport(results)
  const reportPath = 'docs/PLAYTEST-ROUND3.md'
  const fs = await import('fs')
  const path = await import('path')
  const fullPath = path.join(process.cwd(), reportPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, report, 'utf-8')
  console.log(`\n✅ 报告已写入: ${fullPath}`)
  console.log(`📄 共 ${results.length} 局结果`)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })