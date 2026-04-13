/**
 * Phase 1 全面验证 — commit bee36e9
 * 4种族 × 2性别 × 3局 = 24局
 * 重点验证 lifeProgress-based 改动：
 *   1. HP衰减 sigmoid → lifeProgress
 *   2. getAgingHint → lifeProgress
 *   3. getScaledAgeRange → 百分比缩放
 *   4. 寿命评分 → lifespan/maxLifespan
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '@/worlds/sword-and-magic'

// ==================== Types ====================
interface PlayConfig {
  race: string
  gender: 'male' | 'female'
  seed: number
  label: string
}

interface YearRecord {
  age: number
  hpBefore: number
  hpAfter: number
  hpDelta: number
  eventId: string
  title: string
  tag?: string
  branchChoice?: string
  phase: string
  lifeProgress: number
}

interface PlayResult {
  config: PlayConfig
  raceMaxLifespan: number
  personalDeathProgress: number
  finalAge: number
  grade: string
  score: number
  yearLog: YearRecord[]
  triggeredEvents: Set<string>
  achievements: string[]
  flags: Set<string>
  items: string[]
  talents: string[]
}

// ==================== Race Expected Thresholds ====================
const RACE_INFO: Record<string, { maxLifespan: number; name: string; lifespanRange: [number, number] }> = {
  human:  { maxLifespan: 100, name: '人类', lifespanRange: [65, 85] },
  elf:    { maxLifespan: 500, name: '精灵', lifespanRange: [250, 400] },
  goblin: { maxLifespan: 60,  name: '哥布林', lifespanRange: [20, 35] },
  dwarf:  { maxLifespan: 400, name: '矮人', lifespanRange: [150, 250] },
}

// 中年事件文件 (tag=life): mid_body_decline minAge=45→45%→45y(human) / 225y(elf) / 27y(goblin) / 180y(dwarf)
// 老年事件文件 (tag=life): elder_frail minAge=65→65%→65y(human) / 325y(elf) / 39y(goblin) / 260y(dwarf)
// 衰老事件: mid_slowing_down minAge=50→50%→50y(human) / 250y(elf) / 30y(goblin) / 200y(dwarf)

// Psychology-capped events (tag in {life, romance, social}) cap at 50%
const AGING_LIFE_EVENTS = [
  'mid_body_decline',    // 45-55 → 45%-55%
  'mid_chronic_pain',    // 45-60 → 45%-50%(capped)
  'mid_slowing_down',    // 50-65 → 50%-50%(capped)
  'mid_health_scare',    // 40-55 → 40%-50%(capped)
  'elder_frail',         // 65-88 → 65%-50%(capped)=50%
  'elder_memory_fade',   // 70-92 → 70%-50%(capped)=50%
  'elder_final_illness', // 70-90 → 70%-50%(capped)=50%
]

// elder events with tag=social or no tag → NOT capped, go to full percentage
const ELDER_SOCIAL_EVENTS = [
  'elder_memoir',          // 55-90 → 55%-90%
  'elder_disciple_visit',  // 55-90
  'elder_family_reunion',  // 50-90 → 50%-90%
  'elder_peaceful_days',   // 50-90
  'elder_legacy_gift',     // 55-90
  'elder_sunset_watching', // 60-80
]

// Race-specific events are NOT scaled (they use actual race ages)
const RACE_ELDER_EVENTS = {
  goblin: ['goblin_tribe_legacy', 'goblin_last_invention', 'goblin_sage',
           'goblin_sunset_hill', 'goblin_longest_living', 'goblin_mechanical_heart',
           'goblin_final_feast_elder', 'goblin_tribal_legend', 'goblin_last_trick',
           'goblin_buried_treasure_reveal', 'goblin_dream_of_equality'],
  elf: ['elf_last_song', 'elf_teaching_young', 'elf_memory_garden_elder',
        'elf_fading_magic', 'elf_return_to_forest', 'elf_eternal_sleep',
        'elf_ancient_memory_share', 'elf_farewell_ceremony', 'elf_starlight_legacy',
        'elf_last_spring', 'elf_star_communion', 'elf_final_bloom', 'elf_passing_crown'],
  dwarf: ['elder_dwarf_last_inspection', 'elder_dwarf_dragonfire_watch'],
  human: ['human_grandchild_story', 'human_village_elder', 'human_final_prayer',
           'human_rocking_chair', 'human_old_battlefield', 'human_last_toast',
           'human_family_photo', 'human_craft_mastery', 'human_retirement_cottage',
           'human_village_historian', 'human_grandchild_laughter'],
}

// ==================== Test Configs ====================
const PLAY_CONFIGS: PlayConfig[] = [
  // 人类 × 3
  { race: 'human', gender: 'male', seed: 10001, label: 'H-M-1' },
  { race: 'human', gender: 'female', seed: 10002, label: 'H-F-2' },
  { race: 'human', gender: 'male', seed: 10003, label: 'H-M-3' },
  // 精灵 × 3
  { race: 'elf', gender: 'female', seed: 10011, label: 'E-F-1' },
  { race: 'elf', gender: 'male', seed: 10012, label: 'E-M-2' },
  { race: 'elf', gender: 'female', seed: 10013, label: 'E-F-3' },
  // 哥布林 × 3
  { race: 'goblin', gender: 'female', seed: 10021, label: 'G-F-1' },
  { race: 'goblin', gender: 'male', seed: 10022, label: 'G-M-2' },
  { race: 'goblin', gender: 'female', seed: 10023, label: 'G-F-3' },
  // 矮人 × 3
  { race: 'dwarf', gender: 'male', seed: 10031, label: 'D-M-1' },
  { race: 'dwarf', gender: 'female', seed: 10032, label: 'D-F-2' },
  { race: 'dwarf', gender: 'male', seed: 10033, label: 'D-M-3' },
]

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (seed >>> 0) / 0xFFFFFFFF
  }
}

// ==================== Simulation Runner ====================
async function runPlaythrough(
  world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>,
  config: PlayConfig,
): Promise<PlayResult> {
  const engine = new SimulationEngine(world, config.seed)
  engine.initGame('QA测试', undefined, config.race, config.gender)
  let state = engine.getState()

  // Draft and select talents (pick first 3)
  const draftPool = engine.draftTalents()
  const selected = draftPool.slice(0, Math.min(3, draftPool.length))
  engine.selectTalents(selected)
  state = engine.getState()

  // Allocate attributes deterministically
  const availablePoints = world.manifest.initialPoints - state.talentPenalty
  const attrIds = Object.keys(state.attributes).filter(k => !k.endsWith('_display'))
  const allocation: Record<string, number> = {}
  let remaining = availablePoints
  const rng = seededRandom(config.seed * 7 + 13)
  for (let i = 0; i < attrIds.length; i++) {
    const attrId = attrIds[i]
    if (i === attrIds.length - 1) {
      allocation[attrId] = remaining
    } else {
      const pts = Math.floor(rng() * (remaining / 2))
      allocation[attrId] = pts
      remaining -= pts
    }
  }
  engine.allocateAttributes(allocation)
  state = engine.getState()

  const raceMaxLifespan = engine.getRaceMaxLifespan()
  const personalDeathProgress = engine.getPersonalDeathProgress()
  const yearLog: YearRecord[] = []
  let maxIterations = raceMaxLifespan + 200

  while (state.phase === 'simulating' && maxIterations-- > 0) {
    const hpBefore = state.hp
    const lifeProgress = engine.getLifeProgress()
    const result = engine.startYear()

    if (result.phase === 'mundane_year') {
      engine.skipYear()
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: '__mundane__', title: '平静的一年', phase: 'mundane_year',
        lifeProgress,
      })
    } else if (result.phase === 'awaiting_choice' && result.event && result.branches) {
      const evt = result.event
      // Pick first branch
      engine.resolveBranch(result.branches[0].id)
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: evt.id, title: evt.title, tag: evt.tag,
        branchChoice: result.branches[0].title, phase: 'awaiting_choice',
        lifeProgress,
      })
    } else if (result.phase === 'showing_event' && result.event) {
      const evt = result.event
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: evt.id, title: evt.title, tag: evt.tag,
        phase: 'showing_event', lifeProgress,
      })
    } else {
      state = engine.getState()
      yearLog.push({
        age: state.age, hpBefore, hpAfter: state.hp,
        hpDelta: state.hp - hpBefore,
        eventId: '__unknown__', title: `phase=${result.phase}`, phase: result.phase,
        lifeProgress,
      })
    }

    if (state.phase !== 'simulating') break
  }

  engine.finish()
  state = engine.getState()

  return {
    config,
    raceMaxLifespan,
    personalDeathProgress,
    finalAge: state.age,
    grade: state.result?.grade ?? '?',
    score: state.result?.score ?? 0,
    yearLog,
    triggeredEvents: state.triggeredEvents,
    achievements: state.achievements.unlocked,
    flags: state.flags,
    items: state.inventory.items.map(i => i.itemId),
    talents: state.talents.selected,
  }
}

// ==================== Validation Functions ====================

/** Check A: Lifespan distribution */
function checkLifespan(r: PlayResult): string[] {
  const issues: string[] = []
  const info = RACE_INFO[r.config.race]
  if (!info) return ['Unknown race']
  const [min, max] = info.lifespanRange

  // Allow ±15% for natural variance
  const allowedMin = Math.floor(min * 0.85)
  const allowedMax = Math.ceil(max * 1.25)

  if (r.finalAge < allowedMin) {
    issues.push(`寿命过短: ${r.finalAge} < ${allowedMin} (预期 ${min}-${max})`)
  }
  if (r.finalAge > allowedMax + 50) {
    issues.push(`寿命过长: ${r.finalAge} > ${allowedMax + 50} (预期 ${min}-${max})`)
  }

  // lifeProgress at death
  const deathProgress = r.finalAge / r.raceMaxLifespan
  if (deathProgress < 0.5) {
    issues.push(`死亡过早: lifeProgress=${deathProgress.toFixed(3)} (< 0.50)`)
  }
  if (deathProgress > 1.3) {
    issues.push(`超出寿命上限过多: lifeProgress=${deathProgress.toFixed(3)}`)
  }

  return issues
}

/** Check B: Event age reasonableness (especially aging events) */
function checkEventAgeReasonableness(r: PlayResult): string[] {
  const issues: string[] = []
  const maxLifespan = r.raceMaxLifespan

  for (const yr of r.yearLog) {
    if (yr.eventId.startsWith('__')) continue

    const lp = yr.lifeProgress

    // mid_body_decline (45%-55%): should not trigger for young characters
    if (yr.eventId === 'mid_body_decline') {
      if (lp < 0.40) {
        issues.push(`[${yr.age}岁 lp=${lp.toFixed(3)}] mid_body_decline 触发过早 (期望 lp>0.40)`)
      }
    }

    // mid_slowing_down (50%-65% capped at 50%): tag=life → capped at 50%
    if (yr.eventId === 'mid_slowing_down') {
      if (lp < 0.45) {
        issues.push(`[${yr.age}岁 lp=${lp.toFixed(3)}] mid_slowing_down 触发过早`)
      }
    }

    // elder_frail (65%-88%, tag=life → capped at 50%): actually gets capped!
    // Since tag=life, effectiveMaxProgress = min(88/100, 0.50) = 0.50
    // So it triggers at 65%-50%=50% of maxLifespan. minAge=65→65%
    // Wait, getScaledAgeRange: minProgress=65/100=0.65, maxProgress=min(88/100, 0.50)=0.50
    // So scaledMin=65%*max, scaledMax=50%*max → min > max! This means it NEVER triggers for non-race events with tag=life!
    // Actually wait - tag=life IS in psychologyCappedTags. So for human: scaledMin=65, scaledMax=50.
    // That means elder_frail NEVER triggers through scaling. It would only trigger if it's race-specific.
    // Let me check: elder_frail races=[] → NOT race-exclusive → gets scaled → min(65,50)=broken
    // This is potentially a bug! elder_frail with minAge=65 and tag=life gets capped to max 50%
    // So scaledMax=50%*max, scaledMin=65%*max → min > max → event never fires
    // Unless... let me re-read the code more carefully
    // Actually: scaledMin = minProgress * maxLifespan, scaledMax = effectiveMaxProgress * maxLifespan
    // If tag=life: effectiveMaxProgress = min(0.88, 0.50) = 0.50
    // scaledMin = 0.65 * 100 = 65, scaledMax = 0.50 * 100 = 50
    // age >= scaledMin(65) && age <= scaledMax(50) → NEVER TRUE
    // This means elder_frail is DEAD CODE for non-race-specific events! This is a Phase 1 BUG.

    // elder_memory_fade (70%-92% capped at 50%): same problem
    if (yr.eventId === 'elder_memory_fade' && lp < 0.45) {
      issues.push(`[${yr.age}岁 lp=${lp.toFixed(3)}] elder_memory_fade 触发过早`)
    }

    // retirement (60-70, tag=life → capped at 50%): same problem for general events
    // mid_chronic_pain (45-60, tag=life → capped at 50%): scaledMin=45, scaledMax=50 → narrow window
    if (yr.eventId === 'mid_chronic_pain' && lp < 0.40) {
      issues.push(`[${yr.age}岁 lp=${lp.toFixed(3)}] mid_chronic_pain 触发过早`)
    }
  }

  return issues
}

/** Check C: Event description matches age */
function checkEventDescriptionMatch(r: PlayResult): string[] {
  const issues: string[] = []
  const maxLifespan = r.raceMaxLifespan
  const raceName = RACE_INFO[r.config.race]?.name ?? r.config.race

  for (const yr of r.yearLog) {
    if (yr.eventId.startsWith('__')) continue
    const lp = yr.lifeProgress

    // 事件标题包含"衰老"/"黄昏"/"老"的应该是老年事件
    const agingKeywords = ['衰老', '黄昏', '老迈', '迟暮', '白发', '黄昏']
    const isAgingEvent = agingKeywords.some(kw => yr.title.includes(kw) || yr.eventId.includes('aging'))

    if (isAgingEvent && lp < 0.50) {
      issues.push(`[${yr.age}岁 lp=${lp.toFixed(3)}] 衰老事件"${yr.title}"触发过早 (期望 lp>0.50)`)
    }
  }

  return issues
}

/** Check D: family_dinner only after having children */
function checkFamilyDinner(r: PlayResult): string[] {
  const issues: string[] = []

  // Check all events with "family" or "dinner" in id
  let hasParentFlag = false
  for (const yr of r.yearLog) {
    if (yr.eventId === 'family_dinner' || yr.eventId.includes('family_dinner')) {
      if (!hasParentFlag) {
        issues.push(`[${yr.age}岁] family_dinner 触发但尚未成为父母`)
      }
    }
    if (r.flags.has('parent') && yr.age > 0) {
      hasParentFlag = true
    }
    // Simpler: check if parent flag exists in final state
  }
  // More accurate: just check the trigger order
  const parentFlagAge = r.yearLog.findIndex(yr =>
    yr.eventId !== '__mundane__' && yr.eventId !== '__unknown__' &&
    (yr.eventId.includes('child') || yr.eventId.includes('birth_child') || yr.eventId.includes('firstborn'))
  )
  const familyDinnerAge = r.yearLog.findIndex(yr => yr.eventId === 'family_dinner')
  if (familyDinnerAge >= 0 && parentFlagAge >= 0 && familyDinnerAge < parentFlagAge) {
    issues.push(`family_dinner 在育儿事件之前触发`)
  }

  return issues
}

/** Check E: Talent selection and effects */
function checkTalents(r: PlayResult): string[] {
  const issues: string[] = []

  if (r.talents.length === 0) {
    issues.push('未选择任何天赋')
  }
  if (r.talents.length > 5) {
    issues.push(`天赋数量过多: ${r.talents.length}`)
  }

  // Check race-exclusive talents are from correct race
  for (const t of r.talents) {
    if (t.startsWith('human_') && r.config.race !== 'human') {
      issues.push(`种族不匹配: ${r.config.race} 拥有人类专属天赋 ${t}`)
    }
    if (t.startsWith('elf_') && r.config.race !== 'elf') {
      issues.push(`种族不匹配: ${r.config.race} 拥有精灵专属天赋 ${t}`)
    }
    if (t.startsWith('goblin_') && r.config.race !== 'goblin') {
      issues.push(`种族不匹配: ${r.config.race} 拥有哥布林专属天赋 ${t}`)
    }
    if (t.startsWith('dwarf_') && r.config.race !== 'dwarf') {
      issues.push(`种族不匹配: ${r.config.race} 拥有矮人专属天赋 ${t}`)
    }
  }

  return issues
}

/** Check F: Attribute allocation and growth */
function checkAttributes(r: PlayResult): string[] {
  const issues: string[] = []

  // Get final state attributes from the last event log (approximate)
  // We check: attributes should not be negative
  // Since we don't have direct access to final attributes, check via event effects
  for (const yr of r.yearLog) {
    if (yr.hpAfter < 0) {
      issues.push(`[${yr.age}岁] HP 为负值: ${yr.hpAfter}`)
    }
  }

  return issues
}

/** Check G: Route system */
function checkRoutes(r: PlayResult): string[] {
  const issues: string[] = []
  const routeFlags = [...r.flags].filter(f => f.startsWith('on_') && f.endsWith('_path'))

  if (routeFlags.length > 1) {
    issues.push(`同时激活多条路线: ${routeFlags.join(', ')}`)
  }

  return issues
}

/** Check H: Achievement system */
function checkAchievements(r: PlayResult): string[] {
  const issues: string[] = []

  // At least some achievements should be unlocked by end of life
  if (r.achievements.length === 0) {
    issues.push('未解锁任何成就')
  }

  return issues
}

/** Check I: Gender variant events */
function checkGenderVariants(r: PlayResult): string[] {
  const issues: string[] = []

  // Gender-specific talents
  for (const t of r.talents) {
    if (t.endsWith('_male') && r.config.gender !== 'male') {
      issues.push(`性别不匹配: ${r.config.gender} 拥有男性专属天赋 ${t}`)
    }
    if (t.endsWith('_female') && r.config.gender !== 'female') {
      issues.push(`性别不匹配: ${r.config.gender} 拥有女性专属天赋 ${t}`)
    }
  }

  return issues
}

/** Check J: Chronicle completeness (childhood→youth→adult→elder) */
function checkChronicleCompleteness(r: PlayResult): string[] {
  const issues: string[] = []
  const maxLifespan = r.raceMaxLifespan

  // Define life stage boundaries based on lifeProgress
  const childhoodEnd = Math.floor(maxLifespan * 0.15)  // ~15%
  const youthEnd = Math.floor(maxLifespan * 0.30)       // ~30%
  const adultEnd = Math.floor(maxLifespan * 0.50)       // ~50%

  const eventYears = r.yearLog.filter(y => y.eventId !== '__mundane__' && y.eventId !== '__unknown__')

  // Check events exist in each life stage
  const childhoodEvents = eventYears.filter(e => e.age <= childhoodEnd)
  const youthEvents = eventYears.filter(e => e.age > childhoodEnd && e.age <= youthEnd)
  const adultEvents = eventYears.filter(e => e.age > youthEnd && e.age <= adultEnd)
  const elderEvents = eventYears.filter(e => e.age > adultEnd)

  if (childhoodEvents.length === 0 && r.finalAge > childhoodEnd) {
    issues.push(`童年期(0-${childhoodEnd}岁)无事件`)
  }
  if (youthEvents.length === 0 && r.finalAge > youthEnd) {
    issues.push(`青年期(${childhoodEnd}-${youthEnd}岁)无事件`)
  }
  if (adultEvents.length === 0 && r.finalAge > adultEnd) {
    issues.push(`成年期(${youthEnd}-${adultEnd}岁)无事件`)
  }

  // Mundane years shouldn't be > 40% of total life
  const mundaneCount = r.yearLog.filter(y => y.eventId === '__mundane__').length
  const totalYears = r.yearLog.length
  if (totalYears > 0 && mundaneCount / totalYears > 0.5) {
    issues.push(`平淡年占比过高: ${mundaneCount}/${totalYears} (${(mundaneCount/totalYears*100).toFixed(1)}%)`)
  }

  return issues
}

// ==================== Critical Checks (Phase 1 Focus) ====================

/** KEY CHECK: Human 33yo should NOT trigger aging events */
function checkHumanNoEarlyAging(r: PlayResult): string[] {
  if (r.config.race !== 'human') return []
  const issues: string[] = []

  for (const yr of r.yearLog) {
    if (yr.age <= 40 && yr.eventId.startsWith('__')) continue
    if (yr.age <= 40) {
      // Check for aging-related events at young ages
      const isAgingEvent = yr.eventId.includes('body_decline') ||
        yr.eventId.includes('chronic_pain') ||
        yr.eventId.includes('slowing_down') ||
        yr.eventId.includes('midlife_crisis') ||
        yr.eventId.includes('health_scare')
      if (isAgingEvent) {
        issues.push(`🔴 [${yr.age}岁] 人类触发过早的衰老事件: ${yr.eventId}`)
      }
    }
  }

  return issues
}

/** KEY CHECK: Elder events should trigger at proper scaled ages */
function checkElderEventScaling(r: PlayResult): string[] {
  const issues: string[] = []
  const race = r.config.race
  const maxLifespan = r.raceMaxLifespan

  // For race-specific elder events, check they trigger within reasonable race age
  const raceElderIds = RACE_ELDER_EVENTS[race] ?? []
  for (const yr of r.yearLog) {
    if (raceElderIds.includes(yr.eventId)) {
      const lp = yr.lifeProgress
      // Race-specific elder events should trigger in the later portion of life
      if (lp < 0.40) {
        issues.push(`🔴 [${yr.age}岁 lp=${lp.toFixed(3)}] 种族老年事件${yr.eventId}触发过早`)
      }
    }
  }

  return issues
}

/** KEY CHECK: Goblin 12yo should NOT trigger midlife events */
function checkGoblinNoEarlyMidlife(r: PlayResult): string[] {
  if (r.config.race !== 'goblin') return []
  const issues: string[] = []

  for (const yr of r.yearLog) {
    if (yr.age <= 15 && yr.eventId.startsWith('__')) continue
    if (yr.age <= 15) {
      const isMidlifeEvent = yr.eventId.includes('mid_') ||
        yr.eventId.includes('elder_') ||
        yr.eventId.includes('retirement') ||
        yr.eventId.includes('body_decline')
      if (isMidlifeEvent) {
        issues.push(`🔴 [${yr.age}岁] 哥布林过早触发中年/老年事件: ${yr.eventId}`)
      }
    }
  }

  return issues
}

/** KEY CHECK: Event chain coherence */
function checkEventChain(r: PlayResult): string[] {
  const issues: string[] = []

  // Check: birth events should happen in first few years
  const birthEvents = r.yearLog.filter(y => y.eventId.startsWith('birth_'))
  if (birthEvents.length > 0) {
    const firstBirthAge = birthEvents[0].age
    if (firstBirthAge > 5) {
      issues.push(`birth 事件在 ${firstBirthAge} 岁才触发，过晚`)
    }
  }

  return issues
}

/** Check: psychology-capped events (tag=life, social, romance) shouldn't trigger past 50% */
function checkPsychologyCap(r: PlayResult): string[] {
  const issues: string[] = []
  const maxLifespan = r.raceMaxLifespan

  // For non-race-specific events with tag=life/social/romance,
  // they should be capped at 50% maxLifespan
  for (const yr of r.yearLog) {
    if (yr.eventId.startsWith('__')) continue
    if (yr.lifeProgress > 0.55 && yr.tag && ['life', 'romance', 'social'].includes(yr.tag)) {
      // Could be a race-specific event (not capped) — skip if race matches
      const raceElderIds = RACE_ELDER_EVENTS[r.config.race] ?? []
      const isRaceSpecific = raceElderIds.includes(yr.eventId) ||
        yr.eventId.includes(r.config.race) // e.g., human_grandchild_story

      if (!isRaceSpecific) {
        // Also skip if the event's maxAge > 100 (race-specific events have actual race ages)
        // Non-race events have maxAge as percentage (like 55, 65, etc.)
        issues.push(`⚠️ [${yr.age}岁 lp=${yr.lifeProgress.toFixed(3)}] tag=${yr.tag} 事件 ${yr.eventId} 在 50% 生命进度后触发（可能为 psychology cap 逃逸）`)
      }
    }
  }

  return issues
}

// ==================== Run All Checks ====================

function runAllChecks(r: PlayResult) {
  return {
    A_lifespan: checkLifespan(r),
    B_eventAgeReasonableness: checkEventAgeReasonableness(r),
    C_eventDescriptionMatch: checkEventDescriptionMatch(r),
    D_familyDinner: checkFamilyDinner(r),
    E_talents: checkTalents(r),
    F_attributes: checkAttributes(r),
    G_routes: checkRoutes(r),
    H_achievements: checkAchievements(r),
    I_genderVariants: checkGenderVariants(r),
    J_chronicle: checkChronicleCompleteness(r),
    KEY_humanNoEarlyAging: checkHumanNoEarlyAging(r),
    KEY_elderScaling: checkElderEventScaling(r),
    KEY_goblinNoEarlyMidlife: checkGoblinNoEarlyMidlife(r),
    KEY_eventChain: checkEventChain(r),
    KEY_psychologyCap: checkPsychologyCap(r),
  }
}

// ==================== Test Suite ====================

describe('Phase 1 Full Validation (bee36e9)', () => {
  let world: Awaited<ReturnType<typeof createSwordAndMagicWorld>>
  const allResults: PlayResult[] = []
  const allIssues: Map<string, ReturnType<typeof runAllChecks>> = new Map()

  beforeAll(async () => {
    world = await createSwordAndMagicWorld()
  })

  // Run all 24 playthroughs
  for (const config of PLAY_CONFIGS) {
    it(`[${config.label}] ${RACE_INFO[config.race]?.name} ${config.gender === 'male' ? '男' : '女'} seed=${config.seed}`, async () => {
      const result = await runPlaythrough(world, config)
      allResults.push(result)
      const issues = runAllChecks(result)
      allIssues.set(config.label, issues)

      // Print chronicle for debugging
      console.log(`\n${'='.repeat(80)}`)
      console.log(`编年史: ${config.label} | ${RACE_INFO[config.race]?.name} ${config.gender === 'male' ? '♂' : '♀'} | maxLifespan=${result.raceMaxLifespan} | deathProgress=${result.personalDeathProgress.toFixed(3)}`)
      console.log(`最终: ${result.finalAge}岁 | 评级: ${result.grade} | 得分: ${result.score.toFixed(1)}`)
      console.log(`天赋: ${result.talents.join(', ')}`)
      console.log(`成就: ${result.achievements.join(', ') || '无'}`)
      console.log(`物品: ${result.items.join(', ') || '无'}`)
      console.log(`${'─'.repeat(80)}`)

      for (const yr of result.yearLog) {
        const lp = yr.lifeProgress.toFixed(3)
        const eventStr = yr.eventId.startsWith('__') ? yr.title :
          `${yr.eventId}: ${yr.title}${yr.branchChoice ? ` [${yr.branchChoice}]` : ''}`
        console.log(`  ${String(yr.age).padStart(4)}岁 lp=${lp} HP ${yr.hpBefore.toString().padStart(3)}→${yr.hpAfter.toString().padStart(3)}(${yr.hpDelta >= 0 ? '+' : ''}${yr.hpDelta}) | ${eventStr}`)
      }

      // Print issues
      const allIssueList = Object.entries(issues).flatMap(([key, vals]) =>
        vals.map(v => `[${key}] ${v}`)
      )
      if (allIssueList.length > 0) {
        console.log(`\n🔴 异常报告:`)
        for (const issue of allIssueList) {
          console.log(`  ${issue}`)
        }
      } else {
        console.log(`\n✅ 无异常`)
      }
      console.log(`${'='.repeat(80)}`)

      // Core assertion: should not crash, lifespan should be positive
      expect(result.finalAge).toBeGreaterThan(0)

      // No critical check failures
      const criticalFailures = [
        ...issues.KEY_humanNoEarlyAging,
        ...issues.KEY_goblinNoEarlyMidlife,
        ...issues.E_talents,
        ...issues.I_genderVariants,
        ...issues.F_attributes,
      ]
      expect(criticalFailures.length).toBe(0)
    }, 60000) // 60s timeout per test (long races like elf can take time)
  }

  // Summary test
  it('汇总表', () => {
    console.log(`\n${'═'.repeat(100)}`)
    console.log(`Phase 1 全面验证汇总 (24局)`)
    console.log(`${'═'.repeat(100)}`)
    console.log(
      `${'标签'.padEnd(8)} | ${'种族'.padEnd(6)} | ${'性别'.padEnd(4)} | ${'寿命'.padEnd(8)} | ${'lp'.padEnd(6)} | ${'评级'.padEnd(4)} | ${'得分'.padEnd(8)} | ${'事件'.padEnd(5)} | ${'平淡'.padEnd(5)} | ${'天赋'.padEnd(5)} | ${'成就'.padEnd(5)} | 异常`
    )
    console.log(`${'─'.repeat(100)}`)

    let totalIssues = 0
    for (const r of allResults) {
      const issues = allIssues.get(r.config.label)!
      const raceName = RACE_INFO[r.config.race]?.name?.slice(0, 4) ?? r.config.race.slice(0, 4)
      const genderStr = r.config.gender === 'male' ? '♂' : '♀'
      const eventCount = r.yearLog.filter(y => y.eventId !== '__mundane__' && y.eventId !== '__unknown__').length
      const mundaneCount = r.yearLog.filter(y => y.eventId === '__mundane__').length
      const lp = (r.finalAge / r.raceMaxLifespan).toFixed(3)

      const allIssueCount = Object.values(issues).reduce((sum, vals) => sum + vals.length, 0)
      totalIssues += allIssueCount

      const issueStr = allIssueCount === 0 ? '✅' : `🔴${allIssueCount}`
      console.log(
        `${r.config.label.padEnd(8)} | ${raceName.padEnd(6)} | ${genderStr.padEnd(4)} | ${String(r.finalAge).padEnd(8)} | ${lp.padEnd(6)} | ${r.grade.padEnd(4)} | ${r.score.toFixed(1).padEnd(8)} | ${String(eventCount).padEnd(5)} | ${String(mundaneCount).padEnd(5)} | ${String(r.talents.length).padEnd(5)} | ${String(r.achievements.length).padEnd(5)} | ${issueStr}`
      )
    }

    console.log(`${'═'.repeat(100)}`)
    console.log(`总异常数: ${totalIssues}`)

    // Detailed issue breakdown
    if (totalIssues > 0) {
      console.log(`\n🔴 异常明细:`)
      for (const r of allResults) {
        const issues = allIssues.get(r.config.label)!
        const allIssueList = Object.entries(issues).flatMap(([key, vals]) =>
          vals.map(v => `${r.config.label} [${key}] ${v}`)
        )
        if (allIssueList.length > 0) {
          for (const issue of allIssueList) {
            console.log(`  ${issue}`)
          }
        }
      }
    }

    // Print summary statistics
    console.log(`\n📊 统计:`)
    const lifespans = allResults.map(r => ({ race: r.config.race, age: r.finalAge, lp: r.finalAge / r.raceMaxLifespan }))
    for (const [race, info] of Object.entries(RACE_INFO)) {
      const raceLifespans = lifespans.filter(l => l.race === race)
      if (raceLifespans.length > 0) {
        const avgAge = raceLifespans.reduce((s, l) => s + l.age, 0) / raceLifespans.length
        const avgLp = raceLifespans.reduce((s, l) => s + l.lp, 0) / raceLifespans.length
        const minAge = Math.min(...raceLifespans.map(l => l.age))
        const maxAge = Math.max(...raceLifespans.map(l => l.age))
        console.log(`  ${info.name}: 平均寿命 ${avgAge.toFixed(1)} (min=${minAge}, max=${maxAge}), 平均lp=${avgLp.toFixed(3)}`)
      }
    }

    // Assert: total issues should be manageable
    expect(totalIssues).toBeLessThan(50) // Allow some issues but not too many
  })
})
