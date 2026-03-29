import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic/index'
import { SimulationEngine } from '../src/engine/core/SimulationEngine'

interface RunDetail {
  run: number
  lifespan: number
  events: { age: number; id: string; title: string; priority: string; branches?: string[]; ageRange: string }[]
  deathEvent?: string
  finalAttrs: Record<string, number>
  peakAttrs: Record<string, number>
  flags: string[]
  items: string[]
  route: string
  score: number
}

function runDetailed(n: number): RunDetail[] {
  const world = createSwordAndMagicWorld()
  const results: RunDetail[] = []
  const issues: string[] = []

  for (let run = 0; run < n; run++) {
    const engine = new SimulationEngine(world)
    engine.initGame(`Test-${run}`)
    
    const drafted = engine.draftTalents()
    engine.selectTalents(drafted)
    
    const attrs = { ...engine.state.attributes }
    let remaining = (world.manifest.initialPoints ?? 15) - (engine.state.talentPenalty ?? 0)
    const attrIds = world.attributes.map(a => a.id)
    let idx = 0
    while (remaining > 0) {
      const aid = attrIds[idx % attrIds.length]
      if ((attrs[aid] ?? 0) < 99) { attrs[aid] = (attrs[aid] ?? 0) + 1; remaining-- }
      idx++
    }
    engine.allocateAttributes(attrs)
    
    const detail: RunDetail = {
      run, lifespan: 0, events: [], finalAttrs: {}, peakAttrs: {}, flags: [], items: [], route: 'none', score: 0
    }

    while (engine.state.phase === 'simulating') {
      const result = engine.startYear()
      
      if (engine.state.phase === 'finished') {
        detail.lifespan = engine.state.age
        break
      }
      
      if (result.phase === 'mundane_year') {
        engine.skipYear()
        if (engine.state.phase === 'finished') {
          detail.lifespan = engine.state.age
          break
        }
        continue
      }
      
      const evt = result.event
      if (!evt) continue
      
      const age = engine.state.age
      const ageRange = `${evt.minAge}-${evt.maxAge}`
      const branchIds = evt.branches?.map(b => b.id)
      
      detail.events.push({ age, id: evt.id, title: evt.title, priority: evt.priority ?? 'minor', branches: branchIds, ageRange })
      
      // === LOGIC CHECKS ===
      
      // 1. Age out of range
      if (age < evt.minAge || age > evt.maxAge) {
        issues.push(`Run${run} age=${age}: ${evt.id} 范围=[${evt.minAge}-${evt.maxAge}] ⚠️超龄`)
      }
      
      // 2. Birth event not at age 1
      if (evt.id.startsWith('birth_') && age !== 1) {
        issues.push(`Run${run} age=${age}: birth事件 ${evt.id} 不在age=1`)
      }
      
      // 3. Baby-themed event at high age
      if ((evt.id.includes('baby') || evt.id.includes('childhood_play')) && age > 8) {
        issues.push(`Run${run} age=${age}: 幼年事件 ${evt.id} 在高年龄触发`)
      }
      
      // 4. Narrative consistency: check if event description makes sense for age
      // Elder events at young age
      if (evt.id.startsWith('elder_') && age < 40) {
        issues.push(`Run${run} age=${age}: elder事件 ${evt.id} 在${age}岁触发（太早）`)
      }
      
      // 5. Death event at very young age - check cause
      // (will check after loop)
      
      // 6. Duplicate event
      const prevEvents = detail.events.slice(0, -1).map(e => e.id)
      if (prevEvents.includes(evt.id)) {
        issues.push(`Run${run}: 重复事件 ${evt.id}`)
      }
      
      // 7. Sequence checks
      if (detail.events.length >= 2) {
        const prev = detail.events[detail.events.length - 2]
        // magic_academy → magic_exam should have academy first
        if (evt.id === 'magic_exam' && !prevEvents.includes('magic_academy')) {
          issues.push(`Run${run} age=${age}: magic_exam 但没有先触发 magic_academy`)
        }
      }
      
      // Resolve branch
      if (evt.branches && evt.branches.length > 0) {
        engine.resolveBranch(evt.branches[0].id)
      }
      
      if (engine.state.phase === 'finished') {
        detail.lifespan = engine.state.age
        break
      }
    }
    
    // Final state
    detail.finalAttrs = { ...engine.state.attributes }
    detail.peakAttrs = { ...engine.state.attributePeaks }
    detail.flags = [...engine.state.flags]
    detail.items = engine.state.inventory ? [...engine.state.inventory.items] : []
    detail.route = engine.state.currentRoute ?? 'none'
    detail.score = engine.state.result?.score ?? 0
    
    // Death event is last event
    if (detail.events.length > 0 && detail.lifespan <= 60) {
      detail.deathEvent = detail.events[detail.events.length - 1].id
      // Check for unreasonable early death
      if (detail.lifespan <= 10) {
        issues.push(`Run${run}: ${detail.lifespan}岁死亡（太早），死因: ${detail.deathEvent}`)
      }
    }
    
    // Check attribute overflow
    for (const [k, v] of Object.entries(detail.finalAttrs)) {
      if (v > 99) issues.push(`Run${run}: ${k}=${v} 超过上限99`)
      if (v < 0) issues.push(`Run${run}: ${k}=${v} 低于下限0`)
    }
    
    results.push(detail)
  }
  
  // === PRINT REPORT ===
  console.log('=' .repeat(80))
  console.log('                    异世界重生模拟器 — 20局详细流程分析')
  console.log('='.repeat(80))
  
  for (const r of results) {
    const lifespanBar = r.lifespan >= 60 ? '✅' : r.lifespan >= 30 ? '⚠️' : '❌'
    console.log(`\n--- Run${String(r.run).padStart(2)} ${lifespanBar} 寿命=${r.lifespan}岁 路线=${r.route} 评分=${r.score} ---`)
    
    // Group events by life stage
    const stages: Record<string, typeof r.events> = {
      '出生': r.events.filter(e => e.age <= 1),
      '幼年(2-6)': r.events.filter(e => e.age >= 2 && e.age <= 6),
      '少年(7-12)': r.events.filter(e => e.age >= 7 && e.age <= 12),
      '青年(13-20)': r.events.filter(e => e.age >= 13 && e.age <= 20),
      '壮年(21-40)': r.events.filter(e => e.age >= 21 && e.age <= 40),
      '中年(41-60)': r.events.filter(e => e.age >= 41 && e.age <= 60),
      '老年(61+)': r.events.filter(e => e.age >= 61),
    }
    
    for (const [stage, evts] of Object.entries(stages)) {
      if (evts.length === 0) continue
      console.log(`  [${stage}]`)
      for (const e of evts) {
        const pri = e.priority === 'critical' ? '🔴' : e.priority === 'major' ? '🟡' : '⚪'
        const ageOk = e.age >= parseInt(e.ageRange) && e.age <= parseInt(e.ageRange.split('-')[1]) ? '✓' : '⚠️'
        console.log(`    ${pri} ${String(e.age).padStart(2)}岁 ${e.id.padEnd(28)} ${e.ageRange.padEnd(6)} ${ageOk}`)
      }
    }
    
    // Summary
    if (r.deathEvent) {
      console.log(`  💀 死因: ${r.deathEvent}`)
    }
    if (r.items.length > 0) {
      console.log(`  🎒 物品: ${r.items.join(', ')}`)
    }
    const topAttr = Object.entries(r.peakAttrs).sort((a,b) => b[1]-a[1]).slice(0,3)
    console.log(`  📊 峰值属性: ${topAttr.map(([k,v]) => `${k}=${v}`).join(' ')}`)
    console.log(`  🏷️ Flags: ${r.flags.length > 0 ? r.flags.slice(-5).join(', ') : '无'}`)
  }
  
  // === STATISTICS ===
  console.log('\n' + '='.repeat(80))
  console.log('                          统计摘要')
  console.log('='.repeat(80))
  
  const lifespans = results.map(r => r.lifespan)
  console.log(`  寿命: ${Math.min(...lifespans)}-${Math.max(...lifespans)}, 中位=${lifespans.sort((a,b)=>a-b)[10]}`)
  
  const alive60 = results.filter(r => r.lifespan >= 60).length
  const alive30 = results.filter(r => r.lifespan >= 30 && r.lifespan < 60).length
  const dead30 = results.filter(r => r.lifespan < 30).length
  console.log(`  60+岁: ${alive60}/20 (${alive60*5}%)  30-59: ${alive30}/20  <30: ${dead30}/20`)
  
  // Event frequency
  const eventFreq = new Map<string, number>()
  for (const r of results) {
    const seen = new Set<string>()
    for (const e of r.events) {
      if (!seen.has(e.id)) { eventFreq.set(e.id, (eventFreq.get(e.id) ?? 0) + 1); seen.add(e.id) }
    }
  }
  console.log(`\n  事件触发率TOP15:`)
  const sorted = [...eventFreq.entries()].sort((a,b) => b[1]-a[1])
  for (const [id, count] of sorted.slice(0, 15)) {
    const pct = count * 5
    const bar = '█'.repeat(pct) + '░'.repeat(100 - pct)
    const warning = pct >= 70 ? ' ⚠️过高' : ''
    console.log(`    ${id.padEnd(28)} ${count}/20 ${bar}${warning}`)
  }
  
  // Death causes
  const deaths = results.filter(r => r.deathEvent)
  if (deaths.length > 0) {
    const deathFreq = new Map<string, number>()
    for (const r of deaths) { deathFreq.set(r.deathEvent!, (deathFreq.get(r.deathEvent!) ?? 0) + 1) }
    console.log(`\n  早死(<60岁)原因:`)
    for (const [id, count] of [...deathFreq.entries()].sort((a,b)=>b[1]-a[1])) {
      console.log(`    ${id.padEnd(28)} ${count}次`)
    }
  }
  
  // Route distribution
  const routeDist = new Map<string, number>()
  for (const r of results) { routeDist.set(r.route, (routeDist.get(r.route) ?? 0) + 1) }
  console.log(`\n  路线分布:`)
  for (const [route, count] of [...routeDist.entries()].sort((a,b)=>b[1]-a[1])) {
    console.log(`    ${route.padEnd(15)} ${count}/20`)
  }
  
  // Score distribution
  const grades = { SS: 0, S: 0, A: 0, B: 0, C: 0, D: 0 }
  for (const r of results) {
    if (r.score >= 120) grades.SS++
    else if (r.score >= 100) grades.S++
    else if (r.score >= 75) grades.A++
    else if (r.score >= 55) grades.B++
    else if (r.score >= 40) grades.C++
    else grades.D++
  }
  console.log(`\n  评分分布:`)
  for (const [g, c] of Object.entries(grades)) {
    if (c > 0) console.log(`    ${g}: ${'█'.repeat(c*5)} ${c}/20`)
  }
  
  // === ISSUES ===
  console.log('\n' + '='.repeat(80))
  if (issues.length === 0) {
    console.log('  ✅ 未发现逻辑问题！')
  } else {
    console.log(`  ⚠️ 发现 ${issues.length} 个问题:`)
    for (const issue of issues) {
      console.log(`    ${issue}`)
    }
  }
  console.log('='.repeat(80))
}

try { runDetailed(20) } catch (e: any) { console.error('Error:', e.message, e.stack) }
