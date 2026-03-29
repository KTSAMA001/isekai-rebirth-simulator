/**
 * 模拟器测试脚本 — 运行 10 局游戏 + 逻辑验证
 * 运行: npx tsx scripts/test-simulation.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'

// ==================== 工具函数 ====================

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ==================== 逻辑验证规则 ====================

const FLAG_REQUIREMENTS: Record<string, string[]> = {
  magic_graduate: ['magic_student'],
  magic_exam: ['magic_student'],
  magic_duel: ['magic_student'],
  dark_mage_choice: ['magic_student'],
  knight_examination: ['squire'],
  soul_corruption_consequence: ['soul_corrupted'],
  merchant_apprentice: [], // no flag required, just attributes
}

// ==================== 游戏运行 ====================

interface GameLog {
  gameNum: number
  entries: {
    age: number
    eventId: string
    eventTitle: string
    branchId?: string
    branchTitle?: string
    flagsBefore: Set<string>
    flagsAfter: Set<string>
    hpBefore: number
    hpAfter: number
  }[]
  finalAge: number
  causeOfDeath: string
  maxHp: number // initial HP
}

function runOneGame(gameNum: number, seed: number): GameLog {
  const world = createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, seed)

  // Init
  engine.initGame('测试角色')

  // Draft talents
  const drafted = engine.draftTalents()
  const selected = drafted.slice(0, 3)
  engine.selectTalents(selected)

  // Allocate attributes (total 20, each 1-10)
  const attrs = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const allocation: Record<string, number> = {}
  let remaining = 20
  for (const attr of attrs) {
    const val = Math.min(rand(1, 5), remaining - (attrs.length - attrs.indexOf(attr) - 1))
    allocation[attr] = Math.max(1, val)
    remaining -= allocation[attr]
  }
  // Distribute remaining
  for (const attr of attrs) {
    const add = Math.min(remaining, 10 - allocation[attr])
    allocation[attr] += add
    remaining -= add
    if (remaining <= 0) break
  }

  engine.allocateAttributes(allocation)

  const initialState = engine.getState()
  const initHp = initialState.hp
  const log: GameLog['entries'] = []

  // Simulate until death or 80
  let causeOfDeath = ''
  for (let year = 0; year < 80; year++) {
    const stateBefore = engine.getState()
    if (stateBefore.hp <= 0) {
      causeOfDeath = `HP归零 于 ${stateBefore.age} 岁`
      break
    }

    const yearResult = engine.startYear()
    const stateAfter = engine.getState()

    if (stateAfter.hp <= 0) {
      causeOfDeath = `HP归零 于 ${stateAfter.age} 岁`
      log.push({
        age: stateBefore.age + 1,
        eventId: '__death__',
        eventTitle: '死亡',
        flagsBefore: new Set(stateBefore.flags),
        flagsAfter: new Set(stateAfter.flags),
        hpBefore: stateBefore.hp,
        hpAfter: stateAfter.hp,
      })
      break
    }

    if (stateAfter.age >= 80) {
      causeOfDeath = '活到80岁（寿终正寝）'
      break
    }

    if (yearResult.phase === 'awaiting_choice' && yearResult.event && yearResult.branches && yearResult.branches.length > 0) {
      // Check conditions for each branch
      const available = yearResult.branches.filter(b => {
        if (!b.requireCondition) return true
        // Simple condition check
        const cond = b.requireCondition
        const attrs = stateAfter.attributes
        const flags = stateAfter.flags
        
        // Check attribute conditions: attribute.xxx >= N
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

        // Check flag conditions: has.flag.xxx
        const flagMatch = [...cond.matchAll(/has\.flag\.(\w+)/g)]
        for (const m of flagMatch) {
          if (!flags.has(m[1])) return false
        }

        return true
      })

      if (available.length > 0) {
        // Pick a random available branch
        const branch = pick(available)
        log.push({
          age: stateAfter.age,
          eventId: yearResult.event.id,
          eventTitle: yearResult.event.title,
          branchId: branch.id,
          branchTitle: branch.title,
          flagsBefore: new Set(stateBefore.flags),
          flagsAfter: new Set(stateAfter.flags),
          hpBefore: stateBefore.hp,
          hpAfter: stateAfter.hp,
        })
        engine.resolveBranch(branch.id)
      } else {
        log.push({
          age: stateAfter.age,
          eventId: yearResult.event.id,
          eventTitle: yearResult.event.title + '（无可用分支）',
          flagsBefore: new Set(stateBefore.flags),
          flagsAfter: new Set(stateAfter.flags),
          hpBefore: stateBefore.hp,
          hpAfter: stateAfter.hp,
        })
      }
    } else if (yearResult.phase === 'showing_event' && yearResult.event) {
      // showing_event: effects already applied automatically, just log
      log.push({
        age: stateAfter.age,
        eventId: yearResult.event.id,
        eventTitle: yearResult.event.title,
        flagsBefore: new Set(stateBefore.flags),
        flagsAfter: new Set(stateAfter.flags),
        hpBefore: stateBefore.hp,
        hpAfter: stateAfter.hp,
      })
    }
    // mundane_year: no log entry needed
  }

  const finalState = engine.getState()
  return {
    gameNum,
    entries: log,
    finalAge: finalState.age,
    causeOfDeath: causeOfDeath || `活到 ${finalState.age} 岁`,
    maxHp: initHp,
  }
}

// ==================== 验证逻辑 ====================

interface ValidationIssue {
  gameNum: number
  age: number
  eventId: string
  check: string
  detail: string
}

function validateGame(gameLog: GameLog, allEvents: any[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const eventMap = new Map(allEvents.map(e => [e.id, e]))
  const triggeredUnique = new Map<string, number>()

  for (const entry of gameLog.entries) {
    if (entry.eventId === '__death__') continue

    const eventDef = eventMap.get(entry.eventId)
    if (!eventDef) {
      issues.push({
        gameNum: gameLog.gameNum,
        age: entry.age,
        eventId: entry.eventId,
        check: '事件定义',
        detail: `事件 ${entry.eventId} 未在事件列表中找到`,
      })
      continue
    }

    // Check 1: Flag requirements
    if (FLAG_REQUIREMENTS[entry.eventId]) {
      for (const reqFlag of FLAG_REQUIREMENTS[entry.eventId]) {
        if (!entry.flagsBefore.has(reqFlag)) {
          issues.push({
            gameNum: gameLog.gameNum,
            age: entry.age,
            eventId: entry.eventId,
            check: 'Flag缺失',
            detail: `需要 flag ${reqFlag} 但不存在。当前flags: ${[...entry.flagsBefore].join(', ') || '(无)'}`,
          })
        }
      }
    }

    // Check 2: Age range
    if (eventDef.minAge && entry.age < eventDef.minAge) {
      issues.push({
        gameNum: gameLog.gameNum,
        age: entry.age,
        eventId: entry.eventId,
        check: '年龄范围',
        detail: `触发年龄 ${entry.age} < minAge ${eventDef.minAge}`,
      })
    }
    if (eventDef.maxAge && entry.age > eventDef.maxAge) {
      issues.push({
        gameNum: gameLog.gameNum,
        age: entry.age,
        eventId: entry.eventId,
        check: '年龄范围',
        detail: `触发年龄 ${entry.age} > maxAge ${eventDef.maxAge}`,
      })
    }

    // Check 3: Unique events not repeated
    if (eventDef.unique) {
      const prevAge = triggeredUnique.get(entry.eventId)
      if (prevAge !== undefined) {
        issues.push({
          gameNum: gameLog.gameNum,
          age: entry.age,
          eventId: entry.eventId,
          check: 'Unique重复',
          detail: `unique 事件在 ${prevAge} 岁已触发过一次`,
        })
      }
      triggeredUnique.set(entry.eventId, entry.age)
    }

    // Check 4: HP shouldn't exceed initial + reasonable regen
    // Max HP should be initHp + age * max_regen (floor(10/3)+1 = 4)
    const maxAllowed = gameLog.maxHp + entry.age * 4 + 10 // +10 buffer for positive HP events
    if (entry.hpAfter > maxAllowed && entry.hpAfter > entry.hpBefore) {
      issues.push({
        gameNum: gameLog.gameNum,
        age: entry.age,
        eventId: entry.eventId,
        check: 'HP异常',
        detail: `HP ${entry.hpAfter} 超过合理上限 (初始${gameLog.maxHp} + ${entry.age}年恢复)`,
      })
    }

    // Check 5: Include/exclude conditions
    if (eventDef.include) {
      const cond = eventDef.include
      const attrs = {} as Record<string, number>
      // We can't easily check attribute values from here, so skip for now
    }
  }

  // Check 6: After HP <= 0, no more events should occur
  let deathFound = false
  for (const entry of gameLog.entries) {
    if (entry.eventId === '__death__') {
      deathFound = true
    } else if (deathFound) {
      issues.push({
        gameNum: gameLog.gameNum,
        age: entry.age,
        eventId: entry.eventId,
        check: '死后事件',
        detail: `HP归零后仍有事件触发`,
      })
    }
  }

  return issues
}

// ==================== 主函数 ====================

function main() {
  const GAME_COUNT = 20
  console.log(`🧪 异世界重生模拟器 — ${GAME_COUNT}局测试验证\n`)
  console.log('='.repeat(60))

  const world = createSwordAndMagicWorld()
  const allEvents = world.events

  const allLogs: GameLog[] = []
  const allIssues: ValidationIssue[] = []

  for (let i = 1; i <= GAME_COUNT; i++) {
    const seed = 1000 + i * 7919 // deterministic but varied seeds
    console.log(`\n=== 游戏 #${i} (seed: ${seed}) ===`)

    try {
      const gameLog = runOneGame(i, seed)
      allLogs.push(gameLog)

      console.log(`  初始HP: ${gameLog.maxHp}`)
      for (const entry of gameLog.entries) {
        const flagDiff = [...entry.flagsAfter].filter(f => !entry.flagsBefore.has(f))
        const flagStr = flagDiff.length > 0 ? ` [+${flagDiff.join(',')}]` : ''
        const hpStr = entry.hpBefore !== entry.hpAfter ? ` HP:${entry.hpBefore}→${entry.hpAfter}` : ''
        const branchStr = entry.branchTitle ? ` → ${entry.branchTitle}` : ''
        console.log(`  ${entry.age}岁 | ${entry.eventId} | ${entry.eventTitle}${branchStr}${hpStr}${flagStr}`)
      }
      console.log(`  结果: ${gameLog.causeOfDeath}`)

      const issues = validateGame(gameLog, allEvents)
      allIssues.push(...issues)
      if (issues.length > 0) {
        console.log(`  ⚠️ 发现 ${issues.length} 个问题:`)
        for (const issue of issues) {
          console.log(`    ❌ [${issue.check}] ${issue.eventId}: ${issue.detail}`)
        }
      }
    } catch (e) {
      console.log(`  ❌ 游戏崩溃: ${(e as Error).message}`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 验证报告\n')

  if (allIssues.length === 0) {
    console.log(`✅ ${GAME_COUNT}局游戏全部通过验证！未发现逻辑问题。\n`)
  } else {
    console.log(`❌ ${GAME_COUNT}局游戏发现 ${allIssues.length} 个逻辑问题：\n`)

    // Group by check type
    const byType = new Map<string, ValidationIssue[]>()
    for (const issue of allIssues) {
      const list = byType.get(issue.check) || []
      list.push(issue)
      byType.set(issue.check, list)
    }

    for (const [check, issues] of byType) {
      console.log(`  【${check}】(${issues.length}个):`)
      for (const issue of issues) {
        console.log(`    #${issue.gameNum} ${issue.age}岁 ${issue.eventId}: ${issue.detail}`)
      }
    }
    console.log('')
  }

  // Stats
  const avgAge = Math.round(allLogs.reduce((s, g) => s + g.finalAge, 0) / allLogs.length)
  const avgEvents = Math.round(allLogs.reduce((s, g) => s + g.entries.length, 0) / allLogs.length)
  console.log('📈 游戏统计:')
  console.log(`  平均寿命: ${avgAge} 岁`)
  console.log(`  平均事件数: ${avgEvents} 个/局`)
  console.log(`  总事件数: ${allLogs.reduce((s, g) => s + g.entries.length, 0)}`)
  console.log(`  逻辑问题: ${allIssues.length} 个`)

  // ==================== 连锁反应分析 ====================
  console.log('\n🔗 连锁反应分析（检测固定事件序列）\n')

  // 1. 事件触发率统计
  const eventTriggerCount = new Map<string, number>()
  for (const game of allLogs) {
    const seen = new Set<string>()
    for (const entry of game.entries) {
      if (entry.eventId !== '__death__' && !seen.has(entry.eventId)) {
        seen.add(entry.eventId)
        eventTriggerCount.set(entry.eventId, (eventTriggerCount.get(entry.eventId) || 0) + 1)
      }
    }
  }

  const validGames = allLogs.length
  const highRateEvents: string[] = []
  console.log('  📊 事件触发率（出现 ≥70% 的局）：')
  for (const [eid, count] of eventTriggerCount) {
    const rate = count / validGames
    if (rate >= 0.7) {
      const eventDef = allEvents.find(e => e.id === eid)
      const title = eventDef?.title ?? eid
      const pct = Math.round(rate * 100)
      console.log(`    ⚠️ ${eid} (${title}): ${count}/${validGames}局 (${pct}%)`)
      highRateEvents.push(eid)
    }
  }
  if (highRateEvents.length === 0) {
    console.log('    ✅ 无过高触发率事件')
  }

  // 2. 固定序列检测：找出总是按相同顺序出现的事件对
  console.log('\n  📊 固定事件序列（A→B 总是按此顺序出现 ≥70%）：')
  const pairAB = new Map<string, number>()   // A before B count
  const pairBA = new Map<string, number>()   // B before A count
  const pairCoOccur = new Map<string, number>() // A and B in same game

  for (const game of allLogs) {
    const eventIds = game.entries.filter(e => e.eventId !== '__death__').map(e => e.eventId)
    for (let i = 0; i < eventIds.length; i++) {
      for (let j = i + 1; j < eventIds.length; j++) {
        const key = [eventIds[i], eventIds[j]].sort().join(' ↔ ')
        pairCoOccur.set(key, (pairCoOccur.get(key) || 0) + 1)
        const abKey = `${eventIds[i]} → ${eventIds[j]}`
        pairAB.set(abKey, (pairAB.get(abKey) || 0) + 1)
      }
    }
  }

  const fixedSequences: string[] = []
  for (const [key, count] of pairAB) {
    const [a, b] = key.split(' → ')
    const reverseKey = `${b} → ${a}`
    const reverseCount = pairBA.get(reverseKey) || 0
    const coCount = pairCoOccur.get(`${[a, b].sort().join(' ↔ ')}`) || 0
    if (coCount >= validGames * 0.5 && count > 0 && reverseCount === 0 && count >= validGames * 0.7) {
      console.log(`    ⚠️ ${key}: ${count}/${validGames}局（反向出现 0 次）`)
      fixedSequences.push(key)
    }
  }
  if (fixedSequences.length === 0) {
    console.log('    ✅ 未发现固定序列')
  }

  // 3. 每局事件数量分布
  console.log('\n  📊 每局事件数分布：')
  const eventCounts = allLogs.map(g => g.entries.length)
  const minE = Math.min(...eventCounts)
  const maxE = Math.max(...eventCounts)
  const buckets = new Map<string, number>()
  for (const c of eventCounts) {
    const bucket = c <= 10 ? '≤10' : c <= 15 ? '11-15' : c <= 20 ? '16-20' : c <= 25 ? '21-25' : '>25'
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1)
  }
  for (const [bucket, count] of buckets) {
    const bar = '█'.repeat(count)
    console.log(`    ${bucket}个事件: ${bar} (${count}局)`)
  }
  console.log(`    范围: ${minE}-${maxE}, 中位数: ${eventCounts.sort((a,b)=>a-b)[Math.floor(eventCounts.length/2)]}`)

  // 4. 死亡年龄分布
  console.log('\n  📊 死亡/结局分布：')
  const deathBuckets = new Map<string, number>()
  for (const g of allLogs) {
    const bucket = g.finalAge <= 20 ? '≤20岁' : g.finalAge <= 40 ? '21-40岁' : g.finalAge <= 60 ? '41-60岁' : '>60岁'
    deathBuckets.set(bucket, (deathBuckets.get(bucket) || 0) + 1)
  }
  for (const [bucket, count] of deathBuckets) {
    const bar = '█'.repeat(count)
    console.log(`    ${bucket}: ${bar} (${count}局)`)
  }

  // 5. 总结建议
  console.log('\n  💡 建议：')
  if (highRateEvents.length > 0) {
    console.log(`    - ${highRateEvents.length} 个事件触发率 ≥70%，考虑降低权重或增加排除条件`)
  }
  if (fixedSequences.length > 0) {
    console.log(`    - ${fixedSequences.length} 对固定事件序列，缺少随机性`)
  }
  const earlyDeaths = allLogs.filter(g => g.finalAge <= 25).length
  if (earlyDeaths > validGames * 0.4) {
    console.log(`    - ${earlyDeaths}/${validGames} 局在 25 岁前死亡，可能过于困难`)
  }
  const lateDeaths = allLogs.filter(g => g.finalAge >= 75).length
  if (lateDeaths > validGames * 0.7) {
    console.log(`    - ${lateDeaths}/${validGames} 局活到 75+ 岁，后期可能缺乏挑战`)
  }
  if (highRateEvents.length === 0 && fixedSequences.length === 0 && earlyDeaths <= validGames * 0.4 && lateDeaths <= validGames * 0.7) {
    console.log('    ✅ 数据分布合理，未发现明显问题')
  }
}

main()
