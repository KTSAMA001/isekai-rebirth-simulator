import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic/index'
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { WorldEventDef } from '../src/engine/core/types'

function run() {
  const world = createSwordAndMagicWorld()
  const issues: string[] = []
  
  for (let run = 0; run < 20; run++) {
    const engine = new SimulationEngine(world)
    engine.initGame(`Test-${run}`)
    
    const drafted = engine.draftTalents()
    engine.selectTalents(drafted)
    
    // Simple allocation: distribute evenly
    const attrs = { ...engine.state.attributes }
    let remaining = (world.manifest.initialPoints ?? 15) - (engine.state.talentPenalty ?? 0)
    const attrIds = world.attributes.map(a => a.id)
    // Remove talents from allocatable
    let idx = 0
    while (remaining > 0) {
      const aid = attrIds[idx % attrIds.length]
      const max = world.attributes.find(a => a.id === aid)?.max ?? 99
      if ((attrs[aid] ?? 0) < max) {
        attrs[aid] = (attrs[aid] ?? 0) + 1
        remaining--
      }
      idx++
    }
    engine.allocateAttributes(attrs)
    
    // Run simulation
    let events: { age: number; id: string; title: string; ageRange: string }[] = []
    let lastAge = 0
    
    while (engine.state.phase === 'simulating') {
      const result = engine.startYear()
      
      if (engine.state.phase === 'finished') break
      
      if (result.phase === 'mundane_year') {
        engine.skipYear()
        if (engine.state.phase === 'finished') break
        continue
      }
      
      const evt = result.event
      if (evt) {
        const ageRange = `${evt.minAge}-${evt.maxAge}`
        events.push({ age: engine.state.age, id: evt.id, title: evt.title, ageRange })
        
        // === Logic checks ===
        const age = engine.state.age
        
        // 1. Age out of range?
        if (age < evt.minAge || age > evt.maxAge) {
          issues.push(`Run${run} age=${age}: ${evt.id} range=[${evt.minAge}-${evt.maxAge}] AGE OUT OF RANGE`)
        }
        
        // 2. Birth event after age 1?
        if (evt.id.includes('birth') && age > 1) {
          issues.push(`Run${run} age=${age}: birth event ${evt.id} triggered at age > 1`)
        }
        
        // 3. Baby event at high age?
        if (evt.id === 'magic_burst_baby' && age > 3) {
          issues.push(`Run${run} age=${age}: magic_burst_baby at age ${age} (max 3)`)
        }
        
        // 4. Check branch description appropriateness
        if (evt.branches && evt.branches.length > 0) {
          const branch = evt.branches[0]
          // Auto-resolve first branch
          engine.resolveBranch(branch.id)
          
          // Check for risk check events
          if (branch.riskCheck) {
            const diff = branch.riskCheck.difficulty
            const attr = branch.riskCheck.attribute
            const attrVal = engine.state.attributes[attr] ?? 0
            // If attribute is way below difficulty, success chance is very low - is that intended?
            // Just note extreme mismatches
          }
        } else {
          // No branches - auto resolved
        }
      }
    }
    
    // Print run summary
    const lifespan = engine.state.age
    const deathEvent = events.length > 0 ? events[events.length - 1] : null
    
    // Check for duplicate events
    const eventIds = events.map(e => e.id)
    const seen = new Set<string>()
    for (const id of eventIds) {
      if (seen.has(id)) {
        issues.push(`Run${run}: duplicate event ${id}`)
      }
      seen.add(id)
    }
    
    // Print timeline (compact)
    process.stdout.write(`Run${String(run).padStart(2)} [${String(lifespan).padStart(2)}yr]: `)
    for (const e of events.slice(0, 15)) {
      process.stdout.write(`${e.age}:${e.id.substring(0,12)} `)
    }
    if (events.length > 15) process.stdout.write(`...+${events.length - 15}`)
    process.stdout.write(`\n`)
  }
  
  console.log(`\n=== Issues Found: ${issues.length} ===`)
  for (const issue of issues) {
    console.log(`  ⚠️ ${issue}`)
  }
  
  if (issues.length === 0) {
    console.log('  ✅ No issues found in 20 runs!')
  }
}

try {
  run()
} catch (e: any) {
  console.error('Error:', e.message)
}
