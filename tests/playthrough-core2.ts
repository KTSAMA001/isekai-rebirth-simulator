/**
 * Playthrough Core - Simulation runner that logs results
 */
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'

export function runPlaythrough() {
  const SEED = 42

  // We need async, but vitest it() can handle promises
  return (async () => {
    const world = await createSwordAndMagicWorld()
    const engine = new SimulationEngine(world, SEED)
    engine.initGame('测试勇者', undefined, 'human', 'male')
    let state = engine.getState()
    const effectiveMaxAge = state.effectiveMaxAge

    console.log(`=== 初始化 ===`)
    console.log(`种子: ${SEED}`)
    console.log(`种族: human | 性别: male`)
    console.log(`本局最大年龄: ${effectiveMaxAge}`)
    console.log(`初始属性: ${JSON.stringify(state.attributes)}`)
    console.log(`初始 HP: ${state.hp}`)

    // Draft talents
    const draftPool = engine.draftTalents()
    console.log(`\n=== 天赋抽取 ===`)
    for (const tId of draftPool) {
      const def = world.talents.find(t => t.id === tId)
      console.log(`  [${def?.rarity ?? '?'}] ${def?.name ?? tId}: ${def?.description ?? ''}`)
    }
    const selected = draftPool.slice(0, Math.min(3, draftPool.length))
    console.log(`\n选择: ${selected.join(', ')}`)
    engine.selectTalents(selected)
    state = engine.getState()
    console.log(`天赋负面修正: ${state.talentPenalty}`)

    // Allocate attributes randomly
    const availablePoints = world.manifest.initialPoints - state.talentPenalty
    console.log(`\n=== 属性分配 (可用点数: ${availablePoints}) ===`)
    const attrIds = Object.keys(state.attributes).filter(k => !k.endsWith('_display'))
    const allocation: Record<string, number> = {}
    let remaining = availablePoints
    let rngState = SEED
    function seededRandom() {
      rngState = (rngState * 1664525 + 1013904223) & 0xFFFFFFFF
      return (rngState >>> 0) / 0xFFFFFFFF
    }
    for (let i = 0; i < attrIds.length; i++) {
      const attrId = attrIds[i]
      if (i === attrIds.length - 1) {
        allocation[attrId] = remaining
      } else {
        const pts = Math.floor(seededRandom() * (remaining / 2))
        allocation[attrId] = pts
        remaining -= pts
      }
    }
    console.log(`分配: ${JSON.stringify(allocation)}`)
    engine.allocateAttributes(allocation)
    state = engine.getState()
    console.log(`最终属性: ${JSON.stringify(state.attributes)}`)
    console.log(`最终 HP: ${state.hp}`)

    // Simulate year by year
    const yearLog: Array<{
      age: number
      hpBefore: number
      hpAfter: number
      eventId: string
      title: string
      description: string
      effects: string[]
      branchChoice?: string
      isSuccess?: boolean
    }> = []

    let year = 0
    const maxIterations = effectiveMaxAge + 60

    console.log(`\n=== 开始模拟 ===`)

    while (state.phase === 'simulating' && year < maxIterations) {
      year++
      const hpBefore = state.hp
      const result = engine.startYear()

      if (result.phase === 'mundane_year') {
        const skipResult = engine.skipYear()
        state = engine.getState()
        yearLog.push({
          age: year,
          hpBefore,
          hpAfter: state.hp,
          eventId: '__mundane__',
          title: skipResult.logEntry?.title ?? '平静的一年',
          description: skipResult.logEntry?.description ?? '',
          effects: skipResult.logEntry?.effects ?? [],
        })
      } else if (result.phase === 'awaiting_choice' && result.event && result.branches) {
        const firstBranch = result.branches[0]
        const resolveResult = engine.resolveBranch(firstBranch.id)
        state = engine.getState()
        yearLog.push({
          age: year,
          hpBefore,
          hpAfter: state.hp,
          eventId: result.event.id,
          title: result.event.title,
          description: result.event.description,
          effects: resolveResult.effectTexts ?? [],
          branchChoice: firstBranch.title,
          isSuccess: resolveResult.isSuccess,
        })
      } else if (result.phase === 'showing_event' && result.event) {
        state = engine.getState()
        yearLog.push({
          age: year,
          hpBefore,
          hpAfter: state.hp,
          eventId: result.event.id,
          title: result.event.title,
          description: result.event.description,
          effects: result.effectTexts ?? [],
        })
      } else {
        state = engine.getState()
        yearLog.push({
          age: year,
          hpBefore,
          hpAfter: state.hp,
          eventId: '__unknown__',
          title: 'Unknown',
          description: `phase=${result.phase}`,
          effects: [],
        })
      }

      if (state.phase !== 'simulating') break
    }

    // Output
    console.log(`\n=== 逐年记录 ===`)
    for (const entry of yearLog) {
      const hpChange = entry.hpAfter - entry.hpBefore
      const hpChangeStr = hpChange >= 0 ? `+${hpChange}` : `${hpChange}`
      const branchStr = entry.branchChoice
        ? ` [选择: ${entry.branchChoice}${entry.isSuccess !== undefined ? (entry.isSuccess ? ' ✅' : ' ❌') : ''}]`
        : ''
      console.log(
        `【${String(entry.age).padStart(3)}岁】 HP: ${String(entry.hpBefore).padStart(3)} → ${String(entry.hpAfter).padStart(3)} (${hpChangeStr}) | ${entry.eventId}${branchStr}`
      )
      if (entry.eventId !== '__mundane__') {
        console.log(`  事件: ${entry.title}`)
        if (entry.effects.length > 0) {
          for (const eff of entry.effects) {
            if (eff.length <= 150) console.log(`  效果: ${eff}`)
          }
        }
      }
    }

    // Final
    state = engine.getState()
    console.log('\n═══════════════════════════════════════════════════════════════════════════')
    console.log('=== 最终结算 ===')
    console.log(`死亡年龄: ${state.age}`)
    console.log(`最终 HP: ${state.hp}`)
    console.log(`最终属性: ${JSON.stringify(state.attributes)}`)
    console.log(`属性峰值: ${JSON.stringify(state.attributePeaks)}`)
    console.log(`触发事件总数: ${state.triggeredEvents.size}`)
    console.log(`解锁成就: ${state.achievements.unlocked.join(', ') || '无'}`)
    if (state.result) {
      console.log(`评分: ${state.result.score}`)
      console.log(`评级: ${state.result.grade} - ${state.result.gradeTitle}`)
      console.log(`评语: ${state.result.gradeDescription}`)
      if (state.result.evaluations && state.result.evaluations.length > 0) {
        console.log('人生评价:')
        for (const ev of state.result.evaluations) {
          console.log(`  [${ev.rarity}] ${ev.title}: ${ev.description}`)
        }
      }
    }

    // HP analysis
    console.log('\n=== HP 曲线分析 ===')
    let suddenDropCount = 0
    const suddenDropAges: number[] = []
    const hpCurve = yearLog.map(e => ({ age: e.age, hp: e.hpAfter }))
    for (let i = 1; i < hpCurve.length; i++) {
      const diff = hpCurve[i - 1].hp - hpCurve[i].hp
      if (diff > 15) {
        suddenDropCount++
        suddenDropAges.push(hpCurve[i].age)
        console.log(`  ⚠️ 暴跌 @${hpCurve[i].age}岁: ${hpCurve[i-1].hp} → ${hpCurve[i].hp} (-${diff})`)
      }
    }
    if (suddenDropCount === 0) console.log('  无突然暴跌 (>15 HP/年)')

    // Childhood death check
    const childhoodDeath = yearLog.find(e => e.age <= 6 && e.hpAfter <= 0)
    console.log(`\n童年致死: ${childhoodDeath ? `是 (${childhoodDeath.age}岁)` : '否'}`)
    const youthDeath = yearLog.find(e => e.age <= 24 && e.hpAfter <= 0)
    console.log(`青年致死: ${youthDeath ? `是 (${youthDeath.age}岁)` : '否'}`)

    return {
      seed: SEED,
      race: 'human',
      effectiveMaxAge,
      finalAge: state.age,
      score: state.result?.score,
      grade: state.result?.grade,
      gradeTitle: state.result?.gradeTitle,
      yearLog,
      hpCurve,
      suddenDropAges,
    }
  })()
}
