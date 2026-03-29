/**
 * 死亡原因诊断 — 50局
 * 运行: npx tsx scripts/diagnose-death.ts
 */
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'

const RUNS = 50
const deathAges: number[] = []
const deathEvents: Record<string, number> = {}
const maxAgeRun = { age: 0, run: 0 }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function pickBranch(state: any, branches: any[]): any | null {
  const available = branches.filter((b: any) => {
    if (!b.requireCondition) return true
    const c = b.requireCondition, a = state.attributes, f = state.flags
    for (const m of [...c.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]) {
      const v = a[m[1]] ?? 0, n = parseInt(m[3])
      if (m[2] === '>=' && !(v >= n)) return false
      if (m[2] === '>' && !(v > n)) return false
      if (m[2] === '<=' && !(v <= n)) return false
      if (m[2] === '<' && !(v < n)) return false
    }
    for (const m of [...c.matchAll(/has\.flag\.(\w+)/g)]) { if (!f.has(m[1])) return false }
    return true
  })
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null
}

for (let i = 0; i < RUNS; i++) {
  try {
    const world = createSwordAndMagicWorld()
    const engine = new SimulationEngine(world, i)
    engine.initGame('test')
    const drafted = engine.draftTalents()
    const pairs: [string,string][] = [['dragon_blood','demon_heritage']]
    const selected: string[] = []
    for (const id of drafted) {
      if (selected.length >= 3) break
      if (!pairs.some(([a,b]) => (id===a&&selected.includes(b))||(id===b&&selected.includes(a)))) selected.push(id)
    }
    engine.selectTalents(selected)
    const attrs = ['str','mag','int','spr','chr','mny','luk']
    const alloc: Record<string,number> = {}; let rem = 20
    for (const attr of attrs) { const v = Math.min(rand(1,5), rem-(attrs.length-attrs.indexOf(attr)-1)); alloc[attr]=Math.max(1,v); rem-=alloc[attr] }
    for (const attr of attrs) { const add=Math.min(rem,10-alloc[attr]); alloc[attr]+=add; rem-=add; if(rem<=0)break }
    engine.allocateAttributes(alloc)

    let lastEventId = 'none'
    for (let safety = 0; safety < 100; safety++) {
      if (engine.state.phase === 'finished' || engine.state.isDead) break
      const yr = engine.startYear(engine.state)
      if (engine.state.phase === 'finished' || engine.state.isDead) {
        const age = engine.state.age
        deathAges.push(age)
        if (lastEventId !== 'none') deathEvents[lastEventId] = (deathEvents[lastEventId] || 0) + 1
        if (age > maxAgeRun.age) maxAgeRun = { age, run: i }
        break
      }
      if (yr.phase === 'awaiting_choice' && yr.branches?.length > 0) {
        lastEventId = yr.event?.id ?? 'unknown'
        const branch = pickBranch(engine.state, yr.branches)
        if (branch) {
          engine.resolveBranch(branch.id)
          if (engine.state.phase === 'finished') {
            deathAges.push(engine.state.age)
            deathEvents[lastEventId] = (deathEvents[lastEventId] || 0) + 1
            if (engine.state.age > maxAgeRun.age) maxAgeRun = { age: engine.state.age, run: i }
            break
          }
        }
      } else if (yr.phase === 'showing_event' && yr.event) {
        lastEventId = yr.event.id
      } else if (yr.phase === 'mundane_year') {
        engine.skipYear()
        if (engine.state.phase === 'finished') {
          deathAges.push(engine.state.age)
          if (engine.state.age > maxAgeRun.age) maxAgeRun = { age: engine.state.age, run: i }
          break
        }
      }
    }
  } catch(e: any) {
    console.error(`Run ${i}: ${e.message}`)
  }
}

deathAges.sort((a,b)=>a-b)
console.log(`\n=== 死亡诊断 (${RUNS}局) ===`)
console.log(`寿命: ${deathAges[0]}-${deathAges[deathAges.length-1]}, 中位: ${deathAges[Math.floor(RUNS/2)]}`)
console.log(`存活>60: ${deathAges.filter(a=>a>60).length}, 25前死: ${deathAges.filter(a=>a<=25).length}`)

const buckets = [['≤10',0,10],['11-20',11,20],['21-30',21,30],['31-40',31,40],['41-50',41,50],['51-60',51,60],['61-70',61,70],['71-80',71,80],['81+',81,999]]
for (const [label,lo,hi] of buckets) {
  const c = deathAges.filter(a => a>=lo && a<=hi).length
  if (c > 0) console.log(`  ${label}: ${'█'.repeat(c)} (${c})`)
}

console.log(`\n最长寿: Run ${maxAgeRun.run} (${maxAgeRun.age}岁)`)
console.log(`\n致死事件TOP10:`)
Object.entries(deathEvents).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v]) => console.log(`  ${k}: ${v}次`))
