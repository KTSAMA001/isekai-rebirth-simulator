import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'

async function main() {
  const world = await createSwordAndMagicWorld()

  for (let i = 0; i < 5; i++) {
    const seed = 42 + i * 777
    const engine = new SimulationEngine(world, seed)
    engine.initGame('穷人', undefined, 'human', 'male')
    const talents = engine.draftTalents()
    engine.selectTalents(talents.slice(0, 3))
    engine.allocateAttributes({ str: 5, int: 5, chr: 5, luk: 5, mag: 5, mny: -1, spr: 5 })

    console.log('\n=== Run ' + i + ' (seed=' + seed + ') ===')
    console.log('Initial mny: ' + engine.getState().attributes.mny)

    for (let j = 0; j < 150; j++) {
      const state = engine.getState()
      if (state.phase === 'finished') break
      const r = engine.startYear()
      if (r.phase === 'awaiting_choice' && r.branches) {
        engine.resolveBranch(r.branches[0].id)
      }
      const after = engine.getState()
      if (after.age >= 24 && after.age <= 30) {
        console.log('  age=' + after.age + ' mny=' + after.attributes.mny)
      }
    }

    const final = engine.getState()
    console.log('Final: age=' + final.age + ', mny=' + final.attributes.mny)
    console.log('Debt triggered: ' + final.eventLog.some((e: any) => e.eventId === 'human_debt_crisis'))
  }
}

main().catch(console.error)
