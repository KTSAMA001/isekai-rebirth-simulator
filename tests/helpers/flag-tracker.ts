/**
 * Flag 生命周期追踪辅助模块
 * 用于追踪 flag 的 set / remove / check 全流程
 */

import type { GameState, WorldInstance } from '@/engine/core/types'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'

// ==================== 数据结构 ====================

/** 单次 flag 检查记录 */
export interface FlagCheckRecord {
  flagName: string
  result: boolean
  age: number
  source: string // 从调用栈推断的来源
}

/** 单次 flag 变更记录 */
export interface FlagChangeRecord {
  flagName: string
  action: 'set' | 'remove'
  age: number
  event: string // 来源事件ID
}

/** 单局时间线条目 */
export interface TimelineEntry {
  age: number
  type: 'SET' | 'REMOVE' | 'CHECK'
  flagName: string
  detail: string
}

/** 单局模拟摘要 */
export interface GameSummary {
  gameIndex: number
  seed: number
  race: string
  gender: string
  maxAge: number
  timeline: TimelineEntry[]
}

/** 静态可达性分析结果 */
export interface FlagReachabilityInfo {
  /** 设置该 flag 的事件 ID，null 表示无事件设置此 flag（真正孤儿） */
  setterEventId: string | null
  /** 该事件的年龄范围 */
  ageRange: [number, number] | null
  /** 设置该 flag 的事件前置条件中的 flag 列表 */
  prerequisites: string[]
  /** 设置方式：event_effect / branch_effect / engine_hardcoded */
  setterType: string
  /** 判断：为什么在动态测试中未被 set */
  reason: string
}

/** 汇总报告 */
export interface FlagLifecycleReport {
  totalGames: number
  totalUniqueFlagsKnown: number
  flagsEverSet: Set<string>
  flagsNeverSet: string[]
  deadFlags: string[]    // 被set过但从未被check
  orphanFlags: string[]  // 被check过但从未被set
  gameSummaries: GameSummary[]
  flagCheckCount: Record<string, number>  // flag → 被check次数
  flagSetCount: Record<string, number>    // flag → 被set次数（跨所有局）
}

// ==================== 条件提取工具 ====================

/**
 * 从条件表达式中提取所有 flag 引用
 * 匹配 `flag:xxx` 和 `has.flag.xxx` 两种语法
 */
export function extractFlagReferences(expr: string): string[] {
  const flags: string[] = []
  // flag:name 语法
  const flagRegex = /flag:([a-zA-Z0-9_-]+)/g
  let match
  while ((match = flagRegex.exec(expr)) !== null) {
    flags.push(match[1])
  }
  // has.flag.xxx 语法
  const hasFlagRegex = /has\.flag\.([a-zA-Z0-9_-]+)/g
  while ((match = hasFlagRegex.exec(expr)) !== null) {
    flags.push(match[1])
  }
  return flags
}

/**
 * 从事件定义中提取所有可能 set/remove 的 flag
 */
export function extractFlagsFromEffects(effects: { type: string; target: string }[]): string[] {
  const flags: string[] = []
  for (const eff of effects) {
    if (eff.type === 'set_flag') {
      flags.push(eff.target)
    }
  }
  return flags
}

/**
 * 收集所有被事件/引擎 set 的 flag（生产者）
 * 来源：事件 effects/branches.effects/branches.failureEffects 中的 set_flag
 */
export function collectProducedFlags(world: WorldInstance): Set<string> {
  const flags = new Set<string>()
  for (const event of world.events) {
    for (const eff of event.effects) {
      for (const f of extractFlagsFromEffects([eff])) flags.add(f)
    }
    if (event.branches) {
      for (const branch of event.branches) {
        for (const eff of branch.effects ?? []) {
          for (const ff of extractFlagsFromEffects([eff])) flags.add(ff)
        }
        for (const eff of branch.failureEffects ?? []) {
          for (const ff of extractFlagsFromEffects([eff])) flags.add(ff)
        }
      }
    }
  }
  // 路线 entryFlags（引擎在进入路线时 set）
  for (const route of world.manifest.routes ?? []) {
    for (const f of route.entryFlags ?? []) flags.add(f)
  }
  // 引擎硬编码
  flags.add('miracle_survival')
  flags.add('near_death')
  return flags
}

/**
 * 收集所有在条件表达式中被引用的 flag（消费者）
 * 来源：事件条件、分支条件、成就条件、评语条件、路线条件
 */
export function collectConsumedFlags(world: WorldInstance): Set<string> {
  const flags = new Set<string>()
  for (const event of world.events) {
    for (const field of ['include', 'exclude', 'mutuallyExclusive'] as const) {
      const val = (event as any)[field]
      if (typeof val === 'string') {
        for (const f of extractFlagReferences(val)) flags.add(f)
      } else if (Array.isArray(val)) {
        for (const v of val) {
          if (typeof v === 'string') {
            for (const f of extractFlagReferences(v)) flags.add(f)
          }
        }
      }
    }
    if (event.prerequisites) {
      for (const p of event.prerequisites) {
        for (const f of extractFlagReferences(p)) flags.add(f)
      }
    }
    if (event.weightModifiers) {
      for (const mod of event.weightModifiers) {
        for (const f of extractFlagReferences(mod.condition)) flags.add(f)
      }
    }
    if (event.branches) {
      for (const branch of event.branches) {
        if (branch.requireCondition) {
          for (const f of extractFlagReferences(branch.requireCondition)) flags.add(f)
        }
      }
    }
  }
  // 成就条件
  for (const ach of world.achievements) {
    for (const f of extractFlagReferences(ach.condition)) flags.add(f)
  }
  // 评语条件
  for (const evl of (world as any).evaluations ?? []) {
    for (const f of extractFlagReferences(evl.condition)) flags.add(f)
  }
  // 路线条件
  for (const route of world.manifest.routes ?? []) {
    if (route.enterCondition) {
      for (const f of extractFlagReferences(route.enterCondition)) flags.add(f)
    }
    if (route.exitCondition) {
      for (const f of extractFlagReferences(route.exitCondition)) flags.add(f)
    }
    if (route.routeFlags) {
      for (const f of extractFlagReferences(route.routeFlags)) flags.add(f)
    }
  }
  return flags
}

/**
 * 合并：所有已知 flag = 生产者 ∪ 消费者
 */
export function collectKnownFlags(world: WorldInstance): Set<string> {
  return new Set([...collectProducedFlags(world), ...collectConsumedFlags(world)])
}

// ==================== 追踪器核心 ====================

/**
 * 创建 ConditionDSL 的 monkey-patch wrapper，追踪所有 flag 检查
 * 返回 { evaluate, getRecords } 方法
 */
export function createFlagTrackingDSL(): {
  evaluate: ConditionDSL['evaluate']
  getRecords: () => FlagCheckRecord[]
  reset: () => void
} {
  const dsl = new ConditionDSL()
  const records: FlagCheckRecord[] = []

  function evaluate(expr: string, ctx: { state: GameState; world: WorldInstance }): boolean {
    // 在求值前先扫描条件中的 flag 引用，记录检查
    const flags = extractFlagReferences(expr)
    for (const flagName of flags) {
      const result = ctx.state.flags.has(flagName)
      records.push({
        flagName,
        result,
        age: ctx.state.age,
        source: inferSource(new Error().stack ?? ''),
      })
    }
    return dsl.evaluate(expr, ctx)
  }

  function getRecords() { return [...records] }
  function reset() { records.length = 0 }

  return { evaluate, getRecords, reset }
}

/**
 * 从调用栈推断来源（事件ID等）
 */
function inferSource(stack: string): string {
  const lines = stack.split('\n')
  for (const line of lines) {
    // 尝试匹配文件名中的事件相关方法
    if (line.includes('getCandidates') || line.includes('pickEvent') || line.includes('applyEffects')) {
      return 'event-filter'
    }
    if (line.includes('checkAchievement') || line.includes('applyAchievement')) {
      return 'achievement-check'
    }
    if (line.includes('updateRoute') || line.includes('checkMandatoryAnchor')) {
      return 'route-system'
    }
    if (line.includes('resolveBranch')) {
      return 'branch-condition'
    }
    if (line.includes('weightModifier')) {
      return 'weight-modifier'
    }
  }
  return 'unknown'
}

/**
 * 静态可达性分析：对每个已知 flag，查找其设置事件和前置条件链
 * 用于区分"条件链太深走不到"和"真正孤儿（无事件设置）"
 */
export function analyzeFlagReachability(world: WorldInstance): Map<string, FlagReachabilityInfo> {
  const result = new Map<string, FlagReachabilityInfo>()
  const allFlags = collectKnownFlags(world)

  // 引擎硬编码 flag
  const engineFlags: Record<string, string> = {
    'miracle_survival': 'SimulationEngine.ts:805,990 (濒死存活)',
    'near_death': 'SimulationEngine.ts:808,992 (濒死)',
  }

  for (const flagName of allFlags) {
    // 检查引擎硬编码
    if (engineFlags[flagName]) {
      result.set(flagName, {
        setterEventId: null,
        ageRange: null,
        prerequisites: [],
        setterType: 'engine_hardcoded',
        reason: `引擎硬编码: ${engineFlags[flagName]}`,
      })
      continue
    }

    // 查找设置该 flag 的事件
    let setterEventId: string | null = null
    let ageRange: [number, number] | null = null
    let setterType = ''
    let prereqs: string[] = []

    for (const event of world.events) {
      // 检查主 effects
      for (const eff of event.effects) {
        if (eff.type === 'set_flag' && eff.target === flagName) {
          setterEventId = event.id
          ageRange = [event.minAge, event.maxAge]
          setterType = 'event_effect'
          break
        }
      }
      if (setterEventId) break

      // 检查分支 effects
      if (event.branches) {
        for (const branch of event.branches) {
          for (const eff of branch.effects ?? []) {
            if (eff.type === 'set_flag' && eff.target === flagName) {
              setterEventId = event.id
              ageRange = [event.minAge, event.maxAge]
              setterType = 'branch_effect'
              // 分支可能有前置条件
              if (branch.requireCondition) {
                prereqs = extractFlagReferences(branch.requireCondition)
              }
              break
            }
          }
          if (setterEventId) break
        }
      }
      if (setterEventId) break

      // 检查失败效果
      if (event.branches) {
        for (const branch of event.branches) {
          for (const eff of branch.failureEffects ?? []) {
            if (eff.type === 'set_flag' && eff.target === flagName) {
              setterEventId = event.id
              ageRange = [event.minAge, event.maxAge]
              setterType = 'branch_failure_effect'
              break
            }
          }
          if (setterEventId) break
        }
      }
      if (setterEventId) break
    }

    if (!setterEventId) {
      result.set(flagName, {
        setterEventId: null,
        ageRange: null,
        prerequisites: [],
        setterType: 'none',
        reason: '真正孤儿 — 无任何事件的 set_flag 引用此 flag',
      })
      continue
    }

    // 找到设置事件后，提取该事件的前置条件
    const setterEvent = world.events.find(e => e.id === setterEventId)
    if (setterEvent) {
      const eventPrereqs: string[] = []
      for (const field of ['include', 'exclude'] as const) {
        const val = (setterEvent as any)[field]
        if (typeof val === 'string') {
          eventPrereqs.push(...extractFlagReferences(val))
        } else if (Array.isArray(val)) {
          for (const v of val) {
            if (typeof v === 'string') {
              eventPrereqs.push(...extractFlagReferences(v))
            }
          }
        }
      }
      if (setterEvent.prerequisites) {
        for (const p of setterEvent.prerequisites) {
          eventPrereqs.push(...extractFlagReferences(p))
        }
      }
      prereqs = [...new Set([...prereqs, ...eventPrereqs])]
    }

    // 生成原因分析
    let reason: string
    if (prereqs.length === 0) {
      reason = `理论上可达（事件 ${setterEventId} 无 flag 前置条件，${setterType}）`
    } else {
      // 检查前置 flag 本身是否也是难触发的
      const prereqSetters = prereqs.map(p => {
        const info = result.get(p) // 可能为空（还没分析到）
        return info ? `${p}(需先触发)` : p
      })
      reason = `条件链较深（事件 ${setterEventId}, ${setterType}, 需要: ${prereqSetters.join(', ')}）`
    }

    result.set(flagName, {
      setterEventId,
      ageRange,
      prerequisites: prereqs,
      setterType,
      reason,
    })
  }

  return result
}

/**
 * 对比两个 flag Set，生成变更记录
 */
export function diffFlags(
  before: Set<string>,
  after: Set<string>,
  age: number,
  eventId: string,
): FlagChangeRecord[] {
  const changes: FlagChangeRecord[] = []
  for (const f of after) {
    if (!before.has(f)) {
      changes.push({ flagName: f, action: 'set', age, event: eventId })
    }
  }
  for (const f of before) {
    if (!after.has(f)) {
      changes.push({ flagName: f, action: 'remove', age, event: eventId })
    }
  }
  return changes
}
