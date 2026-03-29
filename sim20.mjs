import { SimulationEngine } from './src/engine/index.ts';
import { createSwordAndMagicWorld } from './src/worlds/sword-and-magic/index.ts';
const world = createSwordAndMagicWorld();

const TALENTS = ['prodigy','noble_birth','royal_blood','demon_lineage','dragon_blessing','elven_inheritance','angel_descent','reincarnated_hero','martial_artist','magic_affinity','nature_bond','shadow_born','fortune_child','cursed_existence','battle_maniac','bookworm','merchant_instinct','adventurous_spirit','lucky_star','unlucky_star'];
const LOVE_IDS = new Set([
  'first_love','love_at_first_sight','heartbreak_growth',
  'starlight_promise','festival_dance','quest_parting','forbidden_love',
  'rescue_from_dungeon','soul_bound','family_blessing',
  'marry_noble','marry_adventurer',
  'lover_curse','lover_death_battlefield','protect_family','widowed_wanderer'
]);

const ROUNDS = 20;
const RESULTS = [];

for (let i = 0; i < ROUNDS; i++) {
  const shuffled = [...TALENTS].sort(() => Math.random() - 0.5);
  const myTalents = shuffled.slice(0, 1 + Math.floor(Math.random() * 2));
  const engine = new SimulationEngine(world, 100000 + i * 7919);
  engine.initGame('Test', null);
  engine.draftTalents();
  engine.selectTalents(myTalents);
  
  const state0 = engine.getState();
  const keys = Object.keys(state0.attributes);
  const points = world.manifest.initialPoints - (state0.talentPenalty || 0);
  const alloc = {}; for (const k of keys) alloc[k] = 0;
  for (let p = 0; p < points; p++) alloc[keys[Math.floor(Math.random() * keys.length)]]++;
  try { engine.allocateAttributes(alloc); } catch(e) { RESULTS.push({round:i+1,error:e.message}); continue; }

  const loveEvts = [];
  const maxAge = world.manifest.maxAge;
  
  // Use simulateYear with random branchId extracted from event data
  while (true) {
    const state = engine.getState();
    if (state.phase === 'finished') break;
    if (state.age >= maxAge) break;
    
    try {
      // Get the event that would fire this year by checking getCandidates
      // We'll use the galgame approach but simplified:
      const yearResult = engine.startYear();
      
      if (yearResult.phase === 'awaiting_choice') {
        const branches = yearResult.branches;
        if (branches && branches.length > 0) {
          const pick = branches[Math.floor(Math.random() * branches.length)];
          engine.resolveBranch(pick.id);
        }
      }
      // mundane_year or showing_event: already applied, continue
      
      const cur = engine.getState();
      const newLog = cur.eventLog.slice(state.eventLog.length);
      for (const entry of newLog) {
        if (LOVE_IDS.has(entry.eventId)) {
          loveEvts.push(`${entry.eventId}@age${entry.age}`);
        }
      }
    } catch(e) {
      if (e.message?.includes('finished') || e.message?.includes('不允许')) break;
      break;
    }
  }

  const final = engine.getState();
  const flags = {};
  ['in_relationship','married','first_love','heartbroken','refused_marriage','divorced','widowed','soul_bound'].forEach(f => {
    if (final.flags.has(f)) flags[f] = true;
  });

  RESULTS.push({
    round: i+1, talents: myTalents, lifespan: final.age,
    score: final.result?.score ?? '?', grade: final.result?.grade ?? '?',
    loveEvents: loveEvts, relFlags: flags,
    totalEvents: final.eventLog.length,
    hp: Math.round(final.hp), cause: final.hp <= 0 ? 'dead' : 'old'
  });
  
  // Progress
  if ((i+1) % 5 === 0) process.stderr.write(`Progress: ${i+1}/${ROUNDS}\n`);
}

// Summary
let loveTrig=0, married=0, heartbrk=0, inRel=0, widowed=0, soulBound=0;
const freq = {};
RESULTS.filter(r=>!r.error).forEach(r => {
  if (r.loveEvents.length > 0) loveTrig++;
  if (r.relFlags.married) married++;
  if (r.relFlags.heartbroken) heartbrk++;
  if (r.relFlags.in_relationship && !r.relFlags.married) inRel++;
  if (r.relFlags.widowed) widowed++;
  if (r.relFlags.soul_bound) soulBound++;
  r.loveEvents.forEach(e => freq[e] = (freq[e]||0)+1);
});

const ages = RESULTS.filter(r=>!r.error).map(r=>r.lifespan);
const avgAge = ages.length ? (ages.reduce((a,b)=>a+b,0)/ages.length).toFixed(1) : '?';
const grades = {};
RESULTS.filter(r=>!r.error).forEach(r => grades[r.grade] = (grades[r.grade]||0)+1);

let out = `=== 20轮模拟报告 ===\n`;
out += `平均寿命: ${avgAge} | 等级: ${Object.entries(grades).sort().map(([g,c])=>`${g}×${c}`).join(' ')}\n`;
out += `恋爱事件: ${loveTrig}/20 | 已婚: ${married}/20 | 恋爱中: ${inRel}/20 | 心碎: ${heartbrk}/20 | 丧偶: ${widowed}/20\n\n`;
out += `--- 事件频率 ---\n`;
Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([e,c]) => out += `  ${e}: ${c}\n`);
out += `\n--- 逐局 ---\n`;
RESULTS.filter(r=>!r.error).forEach(r => {
  out += `[R${r.round}] age=${r.lifespan} ${r.cause} score=${r.score} grade=${r.grade}\n`;
  out += `  恋爱(${r.loveEvents.length}): ${r.loveEvents.join(', ') || '无'}\n`;
  out += `  flags: ${JSON.stringify(r.relFlags)} | 总: ${r.totalEvents}\n\n`;
});

console.log(out);
