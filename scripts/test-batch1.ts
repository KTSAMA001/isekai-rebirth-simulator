/**
 * 批次1事件触发测试 — 通过flag检测
 */
import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'

const RUNS = 50

const TARGET_IDS = new Set([
  'birth_noble_estate', 'birth_wilderness',
  'mid_heir_training', 'mid_political_intrigue', 'mid_existential_crisis',
  'mid_found_school', 'mid_old_enemy', 'mid_adopt_orphan', 'mid_lord_govern',
  'mid_scholar_work', 'mid_return_adventure', 'mid_magic_experiment',
  'mid_gambling', 'mid_business_rivalry',
  'elder_memoir', 'elder_disciple_visit', 'elder_last_adventure',
  'elder_family_reunion', 'elder_illness', 'elder_spirit_trial',
  'elder_legacy_gift', 'elder_kingdom_crisis', 'elder_peaceful_days', 'elder_final_counting',
])

const FLAG_MAP: Record<string, string> = {
  'noble_birth': 'birth_noble_estate', 'loving_family': 'birth_noble_estate',
  'wild_birth': 'birth_wilderness', 'shaman_apprentice': 'birth_wilderness', 'hunter_lineage': 'birth_wilderness',
  'great_parent': 'mid_heir_training',
  'political_player': 'mid_political_intrigue',
  'founder': 'mid_found_school',
  'old_enemy_defeated': 'mid_old_enemy',
  'adopted_child': 'mid_adopt_orphan',
  'beloved_lord': 'mid_lord_govern', 'iron_lord': 'mid_lord_govern',
  'great_scholar': 'mid_scholar_work', 'author': 'mid_scholar_work',
  'forbidden_knowledge': 'mid_magic_experiment',
  'lucky_gambler': 'mid_gambling',
  'business_tycoon': 'mid_business_rivalry',
  'famous_author': 'elder_memoir', 'memoir_written': 'elder_memoir',
  'master_mentor': 'elder_disciple_visit',
  'undying_legend': 'elder_last_adventure', 'mentor_legend': 'elder_last_adventure',
  'family_legacy': 'elder_family_reunion',
  'spirit_ascended': 'elder_spirit_trial',
  'legend_legacy': 'elder_legacy_gift',
  'kingdom_hero': 'elder_kingdom_crisis', 'war_hero': 'elder_kingdom_crisis',
  'eternal_glory': 'elder_final_counting', 'peaceful_end': 'elder_final_counting',
  'warriors_death': 'elder_final_counting', 'ascended': 'elder_final_counting', 'quiet_end': 'elder_final_counting',
}

const triggers: Record<string, number> = {}
let crashes = 0
const ageStats: number[] = []

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickBranch(state: any, branches: any[]): any | null {
  const available = branches.filter(b => {
    if (!b.requireCondition) return true
    const cond = b.requireCondition
    const attrs = state.attributes
    const flags = state.flags
    for (const m of [...cond.matchAll(/attribute\.(\w+)\s*([><=!]+)\s*(\d+)/g)]) {
      const val = attrs[m[1]] ?? 0
      const num = parseInt(m[3])
      if (m[2] === '>=' && !(val >= num)) return false
      if (m[2] === '>' && !(val > num)) return false
      if (m[2] === '<=' && !(val <= num)) return false
      if (m[2] === '<' && !(val < num)) return false
    }
    for (const m of [...cond.matchAll(/has\.flag\.(\w+)/g)]) {
      if (!flags.has(m[1])) return false
    }
    return true
  })
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null
}

function runOneGame(gameNum: number) {
  const world = createSwordAndMagicWorld()
  const engine = new SimulationEngine(world, gameNum)
  engine.initGame('测试角色')

  const drafted = engine.draftTalents()
  const pairs: [string, string][] = [['dragon_blood', 'demon_heritage']]
  const selected: string[] = []
  for (const id of drafted) {
    if (selected.length >= 3) break
    if (!pairs.some(([a, b]) => (id === a && selected.includes(b)) || (id === b && selected.includes(a)))) {
      selected.push(id)
    }
  }
  engine.selectTalents(selected)

  const attrs = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk']
  const allocation: Record<string, number> = {}
  let remaining = 20
  for (const attr of attrs) {
    const val = Math.min(rand(1, 5), remaining - (attrs.length - attrs.indexOf(attr) - 1))
    allocation[attr] = Math.max(1, val)
    remaining -= allocation[attr]
  }
  for (const attr of attrs) {
    const add = Math.min(remaining, 10 - allocation[attr])
    allocation[attr] += add
    remaining -= add
    if (remaining <= 0) break
  }
  engine.allocateAttributes(allocation)

  // Simulation loop — same pattern as test-simulation.ts
  for (let safety = 0; safety < 100; safety++) {
    if (engine.state.phase === 'finished') break
    
    const yearResult = engine.startYear(engine.state)
    
    if (engine.state.phase === 'finished') break

    if (yearResult.phase === 'awaiting_choice' && yearResult.branches && yearResult.branches.length > 0) {
      const branch = pickBranch(engine.state, yearResult.branches)
      if (branch) {
        engine.resolveBranch(branch.id)
      }
      // No available branch → skip, next year
    }
    // showing_event or mundane_year → continue
  }

  ageStats.push(engine.state.age)

  for (const [flag, eventId] of Object.entries(FLAG_MAP)) {
    if (engine.state.flags.has(flag)) {
      triggers[eventId] = (triggers[eventId] || 0) + 1
    }
  }
}

for (let i = 0; i < RUNS; i++) {
  try {
    runOneGame(i)
  } catch (e: any) {
    crashes++
    if (crashes <= 5) console.error(`Run ${i}: ${e.message}`)
  }
}

console.log(`\n=== 批次1 事件触发测试 (${RUNS}局) ===`)
console.log(`崩溃: ${crashes}/${RUNS}`)
ageStats.sort((a, b) => a - b)
console.log(`寿命范围: ${ageStats[0]} - ${ageStats[ageStats.length - 1]}, 中位数: ${ageStats[Math.floor(RUNS / 2)]}`)

const triggered = Object.entries(triggers).filter(([, c]) => c > 0)
const never = Array.from(TARGET_IDS).filter(id => !triggers[id])

console.log(`\n✅ 触发过: ${triggered.length}/${TARGET_IDS.size}`)
for (const [id, count] of triggered.sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id}: ${count}次 (${((count / RUNS) * 100).toFixed(0)}%)`)
}

if (never.length > 0) {
  const NO_FLAG = ['mid_existential_crisis', 'mid_gambling', 'elder_illness', 'elder_peaceful_days']
  console.log(`\n⚠️ 从未触发 (${never.length}/${TARGET_IDS.size}):`)
  const withFlag = never.filter(id => !NO_FLAG.includes(id))
  const noFlag = never.filter(id => NO_FLAG.includes(id))
  if (withFlag.length) {
    console.log(`  有flag事件（属性/条件可能不够高）:`)
    for (const id of withFlag) console.log(`    ${id}`)
  }
  if (noFlag.length) {
    console.log(`  无flag（可能触发了但无法确认）:`)
    for (const id of noFlag) console.log(`    ${id}`)
  }
}
