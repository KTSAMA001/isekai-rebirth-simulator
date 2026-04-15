import { describe, it, expect, beforeAll } from 'vitest';
import { loadWorldData } from '@/worlds/sword-and-magic/data-loader';
import { createWorldInstance } from '@/engine/world/WorldInstance';
import { SimulationEngine } from '@/engine/core/SimulationEngine';
import type { WorldInstance } from '@/engine/world/WorldInstance';

describe('Seed 30028 Debug', () => {
  let world: WorldInstance;
  
  beforeAll(async () => {
    const data = await loadWorldData();
    world = createWorldInstance(
      data.manifest, data.attributes, data.talents, data.events, data.achievements,
      data.items, data.presets, data.scoringRule, data.races,
    );
    world.evaluations = data.evaluations;
  });
  
  it('Debug seed 30028', async () => {
    const seed = 30028;
    const engine = new SimulationEngine(world, seed);
    
    engine.initGame('TestChar', undefined, 'human', 'male');
    
    const drafted = engine.draftTalents();
    engine.selectTalents(drafted.slice(0, 3));
    
    const state = engine.getState();
    const visibleAttrs = world.attributes.filter(a => !a.hidden);
    const pointsPerAttr = Math.floor((world.manifest.initialPoints - state.talentPenalty) / visibleAttrs.length);
    const allocation: Record<string, number> = {};
    for (const attr of visibleAttrs) {
      allocation[attr.id] = pointsPerAttr;
    }
    engine.allocateAttributes(allocation);
    
    let maxIter = 10000;
    let prevAge = 0;
    let stuckCount = 0;
    
    while (engine.getState().phase === 'simulating' && maxIter > 0) {
      const yearResult = engine.startYear();
      
      if (yearResult.phase === 'awaiting_choice') {
        const branches = yearResult.branches;
        let resolved = false;
        for (const branch of branches) {
          try {
            engine.resolveBranch(branch.id);
            resolved = true;
            break;
          } catch {
            continue;
          }
        }
        if (!resolved) engine.skipYear();
      } else if (yearResult.phase === 'mundane_year') {
        engine.skipYear();
      }
      
      const cs = engine.getState();
      if (cs.age === prevAge) {
        stuckCount++;
        if (stuckCount > 10) break;
      } else {
        stuckCount = 0;
        prevAge = cs.age;
      }
      maxIter--;
    }
    
    if (engine.getState().phase !== 'finished') engine.finish();
    
    const finalState = engine.getState();
    
    console.log('Seed:', seed);
    console.log('Death Age:', finalState.result?.lifespan ?? finalState.age);
    console.log('All flags:', Array.from(finalState.flags).sort());
    
    // Check various flag name formats
    console.log('\nFlag name format checks:');
    console.log('Has "parent":', finalState.flags.has('parent'));
    console.log('Has "married":', finalState.flags.has('married'));
    console.log('Has "student":', finalState.flags.has('student'));
    console.log('Has "has_student":', finalState.flags.has('has_student'));
    console.log('Has "has_parent":', finalState.flags.has('has_parent'));
    console.log('Has "has_married":', finalState.flags.has('has_married'));
    
    const allEvents = [];
    for (const log of finalState.eventLog) {
      if (log.eventId === '__mundane__') continue;
      allEvents.push({
        age: log.age,
        eventId: log.eventId,
        title: log.title,
      });
    }
    
    const retirementEvent = allEvents.find(e => e.eventId === 'human_retirement_cottage');
    console.log('\nRetirement Cottage Event:', retirementEvent);
    
    // Check the actual event definition
    const retirementDef = world.index.eventsById.get('human_retirement_cottage');
    console.log('\nRetirement Cottage Event Definition:');
    console.log('  include:', retirementDef?.include);
    console.log('  exclude:', retirementDef?.exclude);
    
    console.log('\nAll events that check flags:');
    const checkEvents = ['elder_family_reunion', 'human_family_photo', 'human_retirement_cottage', 
                         'human_grandchild_story', 'human_grandchild_laughter', 
                         'elder_apprentice_return', 'elder_technique_pass'];
    for (const evtId of checkEvents) {
      const evt = allEvents.find(e => e.eventId === evtId);
      const def = world.index.eventsById.get(evtId);
      console.log(`  ${evtId}:`, evt ? `age=${evt.age}` : 'not triggered', `include=${def?.include}`);
    }
    
    expect(true).toBe(true);
  });
});
