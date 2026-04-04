/**
 * 测试辅助工具 — 提供 mock 工厂和通用初始化
 */
import type {
  WorldInstance,
  GameState,
  WorldAttributeDef,
  WorldTalentDef,
  WorldEventDef,
  WorldAchievementDef,
  WorldItemDef,
  WorldPresetDef,
  WorldScoringRule,
  WorldRaceDef,
  InventoryState,
} from '@/engine/core/types'

/** 创建默认属性定义 */
export function makeAttributeDefs(): WorldAttributeDef[] {
  return [
    { id: 'str', name: '体魄', icon: '💪', description: '', color: '#f00', min: 0, max: 20, defaultValue: 5 },
    { id: 'int', name: '智慧', icon: '🧠', description: '', color: '#00f', min: 0, max: 20, defaultValue: 5 },
    { id: 'chr', name: '魅力', icon: '✨', description: '', color: '#ff0', min: 0, max: 20, defaultValue: 5 },
    { id: 'luk', name: '幸运', icon: '🍀', description: '', color: '#0f0', min: 0, max: 20, defaultValue: 5 },
    { id: 'mag', name: '魔力', icon: '🔮', description: '', color: '#a0f', min: 0, max: 20, defaultValue: 5 },
    { id: 'hp_display', name: '生命力', icon: '❤️', description: '', color: '#f0a', min: 0, max: 999, defaultValue: 100, hidden: true },
  ]
}

/** 创建默认评分规则 */
export function makeScoringRule(): WorldScoringRule {
  return {
    grades: [
      { minScore: 0, maxScore: 30, grade: 'F', title: '平庸', description: '' },
      { minScore: 30, maxScore: 60, grade: 'D', title: '普通', description: '' },
      { minScore: 60, maxScore: 100, grade: 'C', title: '不错', description: '' },
      { minScore: 100, maxScore: 150, grade: 'B', title: '优秀', description: '' },
      { minScore: 150, maxScore: null as unknown as number, grade: 'A', title: '传奇', description: '' },
    ],
  }
}

/** 创建最小可用 WorldInstance */
export function makeWorld(overrides?: Partial<WorldInstance>): WorldInstance {
  const attributes = overrides?.attributes ?? makeAttributeDefs()
  const talents = overrides?.talents ?? []
  const events = overrides?.events ?? []
  const achievements = overrides?.achievements ?? []
  const items = overrides?.items ?? []
  const presets = overrides?.presets ?? []

  const world: WorldInstance = {
    manifest: {
      id: 'test-world',
      name: '测试世界',
      subtitle: '',
      description: '',
      version: '1.0.0',
      author: 'test',
      icon: '',
      banner: '',
      theme: { primary: '#000', secondary: '#fff', background: '#eee', text: '#333' },
      tags: [],
      maxAge: 100,
      initialPoints: 20,
      talentDraftCount: 10,
      talentSelectCount: 3,
      files: { attributes: '', talents: '', events: '', achievements: '', presets: '', rules: '' },
    },
    attributes,
    talents,
    events,
    achievements,
    items,
    presets,
    scoringRule: overrides?.scoringRule ?? makeScoringRule(),
    races: overrides?.races,
    index: {
      attributesById: new Map(attributes.map(a => [a.id, a])),
      talentsById: new Map(talents.map(t => [t.id, t])),
      eventsById: new Map(events.map(e => [e.id, e])),
      itemsById: new Map(items.map(i => [i.id, i])),
    },
  }
  return world
}

/** 创建默认 GameState */
export function makeState(overrides?: Partial<GameState>): GameState {
  return {
    meta: {
      worldId: 'test-world',
      seed: 42,
      playId: 'test-play-1',
      startedAt: Date.now(),
      ...(overrides?.meta ?? {}),
    },
    character: {
      name: '测试角色',
      gender: 'male',
      race: 'human',
      ...(overrides?.character ?? {}),
    },
    attributes: overrides?.attributes ?? { str: 5, int: 5, chr: 5, luk: 5, mag: 5 },
    attributeHistory: overrides?.attributeHistory ?? [],
    attributePeaks: overrides?.attributePeaks ?? { str: 5, int: 5, chr: 5, luk: 5, mag: 5 },
    talents: overrides?.talents ?? { selected: [], draftPool: [], inherited: [] },
    age: overrides?.age ?? 1,
    hp: overrides?.hp ?? 100,
    maxHpBonus: overrides?.maxHpBonus ?? 0,
    flags: overrides?.flags ?? new Set(),
    counters: overrides?.counters ?? new Map(),
    triggeredEvents: overrides?.triggeredEvents ?? new Set(),
    eventLog: overrides?.eventLog ?? [],
    achievements: overrides?.achievements ?? { unlocked: [], progress: {} },
    inventory: overrides?.inventory ?? { items: [], maxSlots: 5 },
    talentPenalty: overrides?.talentPenalty ?? 0,
    phase: overrides?.phase ?? 'simulating',
    effectiveMaxAge: overrides?.effectiveMaxAge ?? 85,
    result: overrides?.result,
    pendingBranch: overrides?.pendingBranch,
  }
}

/** 创建简单天赋定义 */
export function makeTalent(id: string, overrides?: Partial<WorldTalentDef>): WorldTalentDef {
  return {
    id,
    name: `天赋_${id}`,
    description: '',
    rarity: 'common',
    icon: '⭐',
    effects: [],
    ...overrides,
  }
}

/** 创建简单事件定义 */
export function makeEvent(id: string, overrides?: Partial<WorldEventDef>): WorldEventDef {
  return {
    id,
    title: `事件_${id}`,
    description: '',
    minAge: 1,
    maxAge: 100,
    weight: 100,
    effects: [],
    ...overrides,
  }
}

/** 创建简单成就定义 */
export function makeAchievement(id: string, condition: string, overrides?: Partial<WorldAchievementDef>): WorldAchievementDef {
  return {
    id,
    name: `成就_${id}`,
    description: '',
    icon: '🏆',
    hidden: false,
    condition,
    category: 'general',
    ...overrides,
  }
}

/** 创建简单物品定义 */
export function makeItem(id: string, overrides?: Partial<WorldItemDef>): WorldItemDef {
  return {
    id,
    name: `物品_${id}`,
    description: '',
    icon: '📦',
    rarity: 'common',
    category: 'accessory',
    effects: [],
    acquireText: `获得了${id}`,
    ...overrides,
  }
}

/** 创建种族定义 */
export function makeRace(id: string, overrides?: Partial<WorldRaceDef>): WorldRaceDef {
  return {
    id,
    name: `种族_${id}`,
    icon: '👤',
    description: '',
    lore: '',
    playable: true,
    lifespanRange: [70, 100],
    attributeModifiers: [],
    ...overrides,
  }
}
