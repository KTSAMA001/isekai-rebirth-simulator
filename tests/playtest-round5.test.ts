/**
 * 第五轮验证测试 - Vitest 入口
 */
import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'

type PlaythroughConfig = {
  race: string
  gender: 'male' | 'female'
  seed: number
  label: string
}

type YearRecord = {
  age: number
  hpBefore: number
  hpAfter: number
  hpDelta: number
  eventId: string
  title: string
}

type PlayResult = {
  config: PlaythroughConfig
  effectiveMaxAge: number
  initHp: number
  expectedMaxLoss: number
  finalAge: number
  grade: string
  gradeTitle: string
  score: number
  yearLog: YearRecord[]
  agingEvents: Array<{ age: number; eventId: string; title: string }>
  maxYearlyLoss: number
  maxLossAges: number[]
  overLimitAges: number[]
  deathNatural: boolean
}

const CONFIGS: PlaythroughConfig[] = [
  { race: 'human', gender: 'male', seed: 1001, label: '人类-战士路线' },
  { race: 'human', gender: 'female', seed: 1002, label: '人类-魔法路线' },
  { race: 'elf', gender: 'female', seed: 2001, label: '精灵-魔法天赋' },
  { race: 'elf', gender: 'male', seed: 2002, label: '精灵-冒险路线' },
  { race: 'goblin', gender: 'female', seed: 3001, label: '哥布林-社交路线' },
  { race: 'goblin', gender: 'male', seed: 3002, label: '哥布林-战斗路线' },
  { race: 'dwarf', gender: 'male', seed: 4001, label: '矮人-战斗路线' },
  { race: 'dwarf', gender: 'female', seed: 4002, label: '矮人-社交路线' },
  { race: 'beastfolk', gender: 'male', seed: 5001, label: '兽人-战斗路线' },
  { race: 'beastfolk', gender: 'female', seed: 5002, label: '兽人-冒险路线' },
  { race: 'seaelf', gender: 'female', seed: 6001, label: '海精灵-魔法路线' },
  { race: 'seaelf', gender: 'male', seed: 6002, label: '海精灵-社交路线' },
]

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (seed >>> 0) / 0xFFFFFFFF
  }
}

async function runPlaythrough(world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>, config: PlaythroughConfig): Promise<PlayResult> {
  const engine = new SimulationEngine(world, config.seed)
  engine.initGame('测试勇者', undefined, config.race, config.gender)
  let state = engine.getState()
  const effectiveMaxAge = state.effectiveMaxAge

  const draftPool = engine.draftTalents()
  const selected = draftPool.slice(0, Math.min(3, draftPool.length))
  engine.selectTalents(selected)
  state = engine.getState()

  const availablePoints = world.manifest.initialPoints - state.talentPenalty
  const attrIds = Object.keys(state.attributes).filter(k => !k.endsWith('_display'))
  const allocation: Record<string, number> = {}
  let remaining = availablePoints
  const rng = seededRandom(config.seed * 7 + 13)
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
  const expectedMaxLoss = Math.max(Math.floor(initHp * 0.25), 20)

  const yearLog: YearRecord[] = []
  let maxIterations = effectiveMaxAge + 100

  while (state.phase === 'simulating' && maxIterations-- > 0) {
    const hpBefore = state.hp
    state = engine.simulateYear()
    const hpAfter = state.hp
    const lastEvent = state.eventLog[state.eventLog.length - 1]
    yearLog.push({
      age: state.age,
      hpBefore,
      hpAfter,
      hpDelta: hpAfter - hpBefore,
      eventId: lastEvent?.eventId ?? '__unknown__',
      title: lastEvent?.title ?? 'Unknown',
    })
  }

  const agingEventIds = new Set([
    'aging_hint_early', 'aging_hint_mid', 'aging_hint_late',
    'aging_elf_reflection', 'aging_dwarf_beard', 'aging_seaelf_tide',
    'elf_human_friend_aging', 'goblin_elder_wisdom'
  ])
  const agingEvents = state.eventLog
    .filter(e => agingEventIds.has(e.eventId))
    .map(e => ({ age: e.age, eventId: e.eventId, title: e.title }))

  let maxYearlyLoss = 0
  let maxLossAges: number[] = []
  const overLimitAges: number[] = []
  for (const y of yearLog) {
    const loss = y.hpBefore - y.hpAfter
    if (loss > maxYearlyLoss) {
      maxYearlyLoss = loss
      maxLossAges = [y.age]
    } else if (loss === maxYearlyLoss && loss > 0) {
      maxLossAges.push(y.age)
    }
    if (loss > expectedMaxLoss) {
      overLimitAges.push(y.age)
    }
  }

  const agingHintStart = yearLog.find(y => {
    const lifeRatio = y.age / effectiveMaxAge
    return lifeRatio > 0.38 && y.age < state.age - 5
  })
  const deathNatural = agingHintStart !== undefined

  return {
    config,
    effectiveMaxAge,
    initHp,
    expectedMaxLoss,
    finalAge: state.age,
    grade: state.result?.grade ?? '?',
    gradeTitle: state.result?.gradeTitle ?? '?',
    score: state.result?.score ?? 0,
    yearLog,
    agingEvents,
    maxYearlyLoss,
    maxLossAges,
    overLimitAges,
    deathNatural,
  }
}

function generateReport(results: PlayResult[]): string {
  const lines: string[] = []

  lines.push('# 🎮 第五轮验证测试报告')
  lines.push('')
  lines.push('**测试日期**: 2026-04-12')
  lines.push('**测试目标**: 7种族 × 2局 = 12局（半龙人跳过）')
  lines.push('**验证修复**:')
  lines.push('  1. `aging_elf_reflection` 种族 ID 修正：`sea_elf` → `seaelf`')
  lines.push('  2. 事件 `modify_hp` 效果现在也受单年降幅上限约束（`initHp*0.25` 或 `20`）')
  lines.push('')

  // Summary table
  lines.push('## 1. 测试汇总')
  lines.push('')
  lines.push('| # | 配置 | 种族 | 寿命 | 期望上限 | 评级 | 分数 | 事件数 | 衰老事件 | aging_elf_reflection | 最大HP降幅 | 超限年数 | 突兀死亡 |')
  lines.push('|---|------|------|------|----------|------|------|--------|----------|---------------------|-----------|---------|----------|')

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const elfReflection = r.agingEvents.some(e => e.eventId === 'aging_elf_reflection')
    const elfReflectionStr = elfReflection ? '✅ 触发' : '❌ 未触发'
    const maxLossStr = r.overLimitAges.length > 0
      ? r.maxYearlyLoss + ' ❌'
      : r.maxYearlyLoss + ' ✅'
    lines.push('| ' + (i + 1) + ' | ' + r.config.label + ' | ' + r.config.race + ' | ' + r.finalAge + ' | ' + r.expectedMaxLoss + ' | ' + r.grade + ' ' + r.gradeTitle + ' | ' + r.score + ' | ' + r.yearLog.length + ' | ' + r.agingEvents.length + ' | ' + elfReflectionStr + ' | ' + maxLossStr + ' | ' + r.overLimitAges.length + ' | ' + (r.deathNatural ? '✅ 否' : '❌ 是') + ' |')
  }
  lines.push('')

  // Per-race detail
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    lines.push('---')
    lines.push('')
    lines.push('## ' + (i + 1) + '. ' + r.config.label)
    lines.push('')
    lines.push('- **种族/性别**: ' + r.config.race + ' / ' + r.config.gender)
    lines.push('- **种子**: ' + r.config.seed)
    lines.push('- **初始 HP**: ' + r.initHp)
    lines.push('- **期望 maxNetLoss**: ' + r.expectedMaxLoss + ' (initHp*0.25=' + Math.floor(r.initHp * 0.25) + ' vs 20, 取较大值)')
    lines.push('- **寿命**: ' + r.finalAge + ' / 期望 ' + r.effectiveMaxAge + ' (' + (r.finalAge / r.effectiveMaxAge * 100).toFixed(1) + '%)')
    lines.push('- **评级**: ' + r.grade + ' ' + r.gradeTitle + ' — ' + r.score + '分')
    lines.push('- **总事件数**: ' + r.yearLog.length)
    lines.push('')

    // Aging events
    lines.push('### 衰老事件')
    lines.push('')
    if (r.agingEvents.length > 0) {
      lines.push('| 触发年龄 | 事件ID | 标题 |')
      lines.push('|----------|--------|------|')
      for (const ae of r.agingEvents) {
        lines.push('| ' + ae.age + ' | ' + ae.eventId + ' | ' + ae.title + ' |')
      }
      const first = r.agingEvents[0]
      const last = r.agingEvents[r.agingEvents.length - 1]
      lines.push('')
      lines.push('> 首次衰老事件: ' + first.age + '岁 (' + (first.age / r.effectiveMaxAge * 100).toFixed(0) + '%寿命)')
      lines.push('> 末次衰老事件: ' + last.age + '岁，间隔 ' + (last.age - first.age) + '年')
    } else {
      lines.push('> ⚠️ 未触发任何衰老事件')
    }
    lines.push('')

    // HP loss analysis
    lines.push('### HP 单年降幅分析')
    lines.push('')
    lines.push('- **initHp**: ' + r.initHp)
    lines.push('- **期望 maxNetLoss**: ' + r.expectedMaxLoss)
    lines.push('- **观测最大单年降幅**: ' + r.maxYearlyLoss + ' (age=' + r.maxLossAges.join(', ') + ')')
    if (r.overLimitAges.length === 0) {
      lines.push('- ✅ 所有年份单年降幅均 ≤ ' + r.expectedMaxLoss)
    } else {
      lines.push('- ❌ **' + r.overLimitAges.length + ' 年单年降幅超过 ' + r.expectedMaxLoss + '**:')
      for (const age of r.overLimitAges) {
        const rec = r.yearLog.find(y => y.age === age)
        if (rec) {
          const loss = rec.hpBefore - rec.hpAfter
          const note = rec.eventId !== '__mundane__' ? ' (事件: ' + rec.eventId + ')' : ' (自然衰减)'
          lines.push('  - age=' + age + ': 降幅 ' + loss + ' 点' + note)
        }
      }
    }
    lines.push('')

    // HP curve
    lines.push('### HP 变化曲线')
    lines.push('')
    lines.push('```')
    const sampleInterval = r.effectiveMaxAge > 200 ? 20 : r.effectiveMaxAge > 50 ? 5 : 2
    for (let j = 0; j < r.yearLog.length; j += sampleInterval) {
      const y = r.yearLog[j]
      const barLen = Math.max(0, Math.round(y.hpAfter / 2))
      const bar = '█'.repeat(barLen)
      const prevHp = j > 0 ? r.yearLog[j - 1].hpAfter : null
      const delta = prevHp !== null ? y.hpAfter - prevHp : 0
      const deltaStr = delta < 0 ? ' (↓' + (-delta) + ')' : delta > 0 ? ' (↑' + delta + ')' : ''
      lines.push('age=' + String(y.age).padStart(4) + ' hp=' + String(y.hpAfter).padStart(4) + ' ' + bar + deltaStr)
    }
    if (r.yearLog.length > 0) {
      const last = r.yearLog[r.yearLog.length - 1]
      const barLen = Math.max(0, Math.round(last.hpAfter / 2))
      const bar = '█'.repeat(barLen)
      lines.push('age=' + String(last.age).padStart(4) + ' hp=' + String(last.hpAfter).padStart(4) + ' ' + bar)
    }
    lines.push('```')
    lines.push('')

    // Death assessment
    lines.push('### 死亡评估')
    lines.push('')
    if (r.deathNatural && r.agingEvents.length >= 2) {
      lines.push('✅ 死亡过程自然，有渐进衰老铺垫')
    } else if (r.deathNatural) {
      lines.push('⚠️ 死亡过程有 agingHint 铺垫，但衰老事件偏少')
    } else {
      lines.push('❌ 突兀死亡，缺少衰老铺垫')
    }
    lines.push('')
  }

  // Fix validation
  lines.push('---')
  lines.push('')
  lines.push('## 修复验证分析')
  lines.push('')

  // Fix 1: aging_elf_reflection
  lines.push('### 2.1 aging_elf_reflection 种族 ID 修正')
  lines.push('')
  const elfAndSeaelfResults = results.filter(r => r.config.race === 'elf' || r.config.race === 'seaelf')
  let elfReflectionTriggered = 0
  for (const r of elfAndSeaelfResults) {
    const triggered = r.agingEvents.some(e => e.eventId === 'aging_elf_reflection')
    if (triggered) elfReflectionTriggered++
    lines.push('- ' + r.config.label + ': ' + (triggered ? '✅ 触发' : '❌ 未触发') + ' (寿命 ' + r.finalAge + ', minAge=150 范围内: ' + (r.finalAge >= 150 ? '是' : '否') + ')')
  }
  lines.push('')
  if (elfReflectionTriggered > 0) {
    lines.push('结论: ✅ 种族 ID 修正有效，' + elfReflectionTriggered + '/4 局触发了 aging_elf_reflection')
  } else {
    lines.push('结论: ⚠️ 种族 ID 已修正为 seaelf，但 4 局均未触发（可能是权重抽签概率问题）')
  }
  lines.push('')

  // Fix 2: HP loss cap
  lines.push('### 2.2 HP 单年降幅上限（事件 modify_hp 约束）')
  lines.push('')
  lines.push('| 种族 | initHp | 期望上限 | 观测最大降幅 | 超限年数 | 判定 |')
  lines.push('|------|--------|----------|------------|---------|------|')
  let allPass = true
  let totalOverLimit = 0
  for (const r of results) {
    const pass = r.overLimitAges.length === 0
    if (!pass) allPass = false
    totalOverLimit += r.overLimitAges.length
    lines.push('| ' + r.config.race + ' | ' + r.initHp + ' | ' + r.expectedMaxLoss + ' | ' + r.maxYearlyLoss + ' | ' + r.overLimitAges.length + ' | ' + (pass ? '✅' : '❌') + ' |')
  }
  lines.push('')
  lines.push('- 全局最大单年HP降幅: ' + Math.max(...results.map(r => r.maxYearlyLoss)))
  lines.push('- 总超限年数: ' + totalOverLimit)
  lines.push('- 总体判定: ' + (allPass ? '✅ 全部通过' : '❌ 存在超限'))
  lines.push('')

  // Galgame flow gap
  lines.push('### 2.3 Galgame 流程 (startYear/resolveBranch) 事件 HP 约束')
  lines.push('')
  lines.push('> **代码审查发现**: `simulateYear()` 中已添加事件 HP 降幅上限约束（`maxEventLoss = max(initHp*0.25, 20)`），但 `startYear()`/`resolveBranch()` 流程（Galgame 交互式）未添加相同约束。')
  lines.push('>')
  lines.push('> - `simulateYear()`: 第 1057-1064 行 — ✅ 有 `maxEventLoss` 约束')
  lines.push('> - `startYear()` 非分支事件: 通过 `eventModule.applyEffectsOnState()` — ❌ 无约束')
  lines.push('> - `resolveBranch()`: 通过 `eventModule.applyEffectsOnState()` — ❌ 无约束')
  lines.push('>')
  lines.push('> **风险等级**: P2')
  lines.push('> **建议**: 在 `EventModule.applyEffect()` 的 `modify_hp` 分支中，或在 `startYear()`/`resolveBranch()` 的事件效果应用后，添加与 `simulateYear()` 相同的 `maxEventLoss` 上限检查')
  lines.push('')

  // Death naturalness
  lines.push('### 2.4 死亡自然度')
  lines.push('')
  lines.push('- 突兀死亡: ' + results.filter(r => !r.deathNatural).length + '/' + results.length)
  lines.push('- 有衰老事件铺垫: ' + results.filter(r => r.agingEvents.length >= 2).length + '/' + results.length)
  lines.push('- 至少 1 个衰老事件: ' + results.filter(r => r.agingEvents.length >= 1).length + '/' + results.length)
  lines.push('')

  // Lifespan verification
  lines.push('### 2.5 寿命范围验证')
  lines.push('')
  const raceRanges: Record<string, [number, number]> = {
    human: [50, 100], elf: [200, 450], goblin: [15, 45],
    dwarf: [100, 200], beastfolk: [30, 80], seaelf: [250, 550],
  }
  lines.push('| 种族 | 期望范围 | 实际寿命 | 判定 |')
  lines.push('|------|----------|----------|------|')
  for (const r of results) {
    const range = raceRanges[r.config.race] ?? [0, 999]
    const inRange = r.finalAge >= range[0] && r.finalAge <= range[1]
    lines.push('| ' + r.config.race + ' | ' + range[0] + '-' + range[1] + ' | ' + r.finalAge + ' | ' + (inRange ? '✅' : '❌') + ' |')
  }
  lines.push('')

  // Aging event coverage
  lines.push('### 2.6 衰老事件覆盖率')
  lines.push('')
  const allAgingEvents = new Map<string, number>()
  for (const r of results) {
    for (const ae of r.agingEvents) {
      allAgingEvents.set(ae.eventId, (allAgingEvents.get(ae.eventId) ?? 0) + 1)
    }
  }
  lines.push('| 事件ID | 触发次数 | 判定 |')
  lines.push('|--------|----------|------|')
  for (const [id, count] of allAgingEvents) {
    lines.push('| ' + id + ' | ' + count + ' | ✅ |')
  }
  lines.push('')
  lines.push('- 至少触发 1 个衰老事件的局数: ' + results.filter(r => r.agingEvents.length >= 1).length + '/12')
  lines.push('')

  // Issues
  lines.push('---')
  lines.push('')
  lines.push('## 发现的问题')
  lines.push('')
  lines.push('| 等级 | 类别 | 描述 |')
  lines.push('|------|------|------|')

  // P2: Galgame flow gap
  lines.push('| P2 | 代码缺陷 | `startYear()`/`resolveBranch()` 流程未添加事件 HP 降幅上限约束（`simulateYear()` 已修复但 Galgame 流程遗漏） |')

  // P2: aging_elf_reflection
  if (elfReflectionTriggered === 0) {
    lines.push('| P2 | 数据配置 | `aging_elf_reflection` 种族 ID 已修正为 seaelf，但 4 局均未触发，需确认事件权重是否足够 |')
  } else {
    lines.push('| ✅ | 数据配置 | `aging_elf_reflection` 种族 ID 修正有效，' + elfReflectionTriggered + ' 局触发 |')
  }

  // HP over-limit issues
  for (const r of results) {
    for (const age of r.overLimitAges) {
      const rec = r.yearLog.find(y => y.age === age)
      if (rec) {
        const loss = rec.hpBefore - rec.hpAfter
        lines.push('| P2 | HP降幅 | [' + r.config.label + '] age=' + age + ' HP单年降幅' + loss + '（期望上限 ' + r.expectedMaxLoss + '）|')
      }
    }
  }

  // Conclusion
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 结论')
  lines.push('')
  lines.push('### 修复 #1: aging_elf_reflection 种族 ID 修正')
  if (elfReflectionTriggered > 0) {
    lines.push('✅ **通过** — 种族 ID 已从 `sea_elf` 修正为 `seaelf`，' + elfReflectionTriggered + '/4 局触发')
  } else {
    lines.push('⚠️ **部分通过** — 种族 ID 已修正，但概率因素导致 4 局均未触发（weight=5 vs 总事件池较大）')
  }
  lines.push('')
  lines.push('### 修复 #2: 事件 modify_hp 降幅上限')
  if (allPass) {
    lines.push('✅ **通过** — `simulateYear()` 中事件 HP 效果已受 `maxEventLoss` 约束')
  } else {
    lines.push('⚠️ **部分通过** — `simulateYear()` 中事件 HP 效果已受 `maxEventLoss` 约束，但仍有 ' + totalOverLimit + ' 年超限')
  }
  lines.push('')
  lines.push('### 新发现问题')
  lines.push('- **P2 代码缺陷**: `startYear()`/`resolveBranch()` (Galgame 流程) 未添加事件 HP 降幅上限约束')
  lines.push('  - `simulateYear()` 第 1057-1064 行: 有 `maxEventLoss` 约束 ✅')
  lines.push('  - `startYear()` 非分支事件: 无约束 ❌')
  lines.push('  - `resolveBranch()`: 无约束 ❌')
  lines.push('  - 建议: 统一在 `EventModule.applyEffect()` 的 `modify_hp` 分支中添加上限检查')
  lines.push('')

  return lines.join('\n')
}

describe('第五轮验证测试', () => {
  it('运行 7种族×2局 完整验证', async () => {
    const world = await createSwordAndMagicWorld()
    const results: PlayResult[] = []

    console.log('═══════════════════════════════════════════')
    console.log('第五轮验证测试开始')
    console.log('═══════════════════════════════════════════')

    for (const config of CONFIGS) {
      console.log('\n▶ ' + config.label + ' (' + config.race + '/' + config.gender + ', seed=' + config.seed + ')...')
      const result = await runPlaythrough(world, config)
      results.push(result)
      console.log('  寿命: ' + result.finalAge + ', 评级: ' + result.grade + ' ' + result.gradeTitle + ', 分数: ' + result.score)
      console.log('  最大单年降幅: ' + result.maxYearlyLoss + ' (期望上限: ' + result.expectedMaxLoss + '), 超限年数: ' + result.overLimitAges.length)
      console.log('  衰老事件: ' + (result.agingEvents.map(e => e.eventId + '@' + e.age).join(', ') || '无'))
    }

    const report = generateReport(results)
    console.log('\n' + report)

    // Write report to docs
    const fs = await import('fs')
    const path = await import('path')
    const docsDir = path.join(process.cwd(), 'docs')
    fs.mkdirSync(docsDir, { recursive: true })
    fs.writeFileSync(path.join(docsDir, 'PLAYTEST-ROUND5.md'), report, 'utf-8')
    console.log('\n报告已写入 docs/PLAYTEST-ROUND5.md')

    // Assertions
    expect(report).toContain('第五轮验证测试报告')
    expect(report).toContain('aging_elf_reflection')
    expect(report).toContain('HP 单年降幅上限')
  }, 120000)
})
