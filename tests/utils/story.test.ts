import { describe, expect, it } from 'vitest'
import type { GameState, WorldInstance } from '@/engine/core/types'
import {
  createOpenClawHeaders,
  decryptToken,
  encryptToken,
  extractOpenClawText,
  generateStorySource,
  generateWorldbook,
  normalizeOpenClawEndpoint,
} from '@/utils/story'

const mockWorld = {
  manifest: {
    id: 'test-world',
    name: '测试世界',
    subtitle: '命运织网之地',
    description: '这是一个会根据人生选择不断改变命运走向的异世界。',
    version: '1.0.0',
    author: 'KT',
    icon: '🌍',
    banner: '',
    theme: { primary: '#000', secondary: '#111', background: '#222', text: '#fff' },
    tags: ['异世界', '人生模拟'],
    maxAge: 120,
    initialPoints: 20,
    talentDraftCount: 10,
    talentSelectCount: 3,
    files: {
      attributes: 'attributes.json',
      talents: 'talents.json',
      events: 'events',
      achievements: 'achievements.json',
      presets: 'presets.json',
    },
    routes: [
      { id: 'mage', name: '法师', description: '研究魔法真理', tier: 1 },
    ],
  },
  attributes: [
    { id: 'str', name: '体魄', icon: '💪', description: '代表身体强韧程度', color: '#f00', min: 0, max: 20, defaultValue: 5 },
    { id: 'spr', name: '灵魂', icon: '✨', description: '代表心灵与意志', color: '#0f0', min: 0, max: 20, defaultValue: 5 },
  ],
  talents: [
    { id: 'town_kid', name: '城镇孩子', description: '在镇上长大', rarity: 'common', icon: '🏘️', effects: [] },
  ],
  events: [],
  achievements: [],
  items: [],
  presets: [],
  scoringRule: { grades: [] },
  races: [
    {
      id: 'human',
      name: '人类',
      icon: '🧑',
      description: '适应力强，分布最广。',
      lore: '在王国、边境与荒野之间不断扩张的种族。',
      playable: true,
      lifespanRange: [60, 90],
      attributeModifiers: [],
    },
  ],
  index: {
    attributesById: new Map(),
    talentsById: new Map(),
    eventsById: new Map(),
    itemsById: new Map(),
  },
} as unknown as WorldInstance

const mockState = {
  meta: { worldId: 'test-world', seed: 1, playId: 'play-1', startedAt: Date.now() },
  character: { name: '艾琳', race: 'human', gender: 'female' },
  attributes: { str: 11, spr: 14 },
  attributeHistory: [],
  attributePeaks: { str: 12, spr: 16 },
  talents: { selected: ['town_kid'], draftPool: [], inherited: [] },
  age: 77,
  hp: 10,
  maxHpBonus: 0,
  flags: new Set<string>(),
  counters: new Map<string, number>(),
  triggeredEvents: new Set<string>(),
  eventLog: [
    {
      age: 18,
      eventId: 'coming_of_age',
      title: '成年礼',
      description: '你正式被视作独当一面的大人。',
      effects: ['魅力 +1'],
      branchTitle: '接受祝福',
      branchDescription: '你平静地向众人致意。',
      resultText: '你从这一刻起被寄予厚望。',
    },
  ],
  achievements: { unlocked: [], progress: {} },
  inventory: { items: [], maxSlots: 8 },
  talentPenalty: 0,
  phase: 'finished',
  result: {
    score: 256,
    grade: 'A',
    gradeTitle: '命运织者',
    gradeDescription: '你活成了许多人想成为的样子。',
    lifespan: 77,
    evaluations: [],
  },
} as unknown as GameState

describe('story utils', () => {
  it('自动规范 OpenClaw endpoint', () => {
    expect(normalizeOpenClawEndpoint('http://127.0.0.1:18789')).toBe('http://127.0.0.1:18789/v1/responses')
    expect(normalizeOpenClawEndpoint('http://127.0.0.1:18789/v1/responses')).toBe('http://127.0.0.1:18789/v1/responses')
  })

  it('仅在提供 token 时附带 Authorization 头', () => {
    expect(createOpenClawHeaders('')).toEqual({
      'Content-Type': 'application/json',
    })

    expect(createOpenClawHeaders('abc123')).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer abc123',
    })
  })

  it('世界书文本包含核心世界信息', () => {
    const text = generateWorldbook(mockWorld)
    expect(text).toContain('【世界书】')
    expect(text).toContain('测试世界')
    expect(text).toContain('主要种族')
    expect(text).toContain('人生路线')
  })

  it('故事素材同时包含世界书与编年史', () => {
    const text = generateStorySource(mockState, mockWorld)
    expect(text).toContain('【任务说明】')
    expect(text).toContain('【世界书】')
    expect(text).toContain('艾琳 的人生编年史')
    expect(text).toContain('成年礼')
  })

  it('能从 OpenClaw 响应中提取文本', () => {
    const text = extractOpenClawText({
      output: [
        {
          type: 'message',
          content: [
            { type: 'output_text', text: '第一段' },
            { type: 'output_text', text: '第二段' },
          ],
        },
      ],
    })
    expect(text).toBe('第一段\n\n第二段')
  })

  it('加密后的 token 能正确解密', async () => {
    const original = 'my-secret-token-abc123'
    const encrypted = await encryptToken(original)
    expect(encrypted).toMatch(/^enc:/)
    const decrypted = await decryptToken(encrypted)
    expect(decrypted).toBe(original)
  })

  it('空 token 加密后仍为空', async () => {
    expect(await encryptToken('')).toBe('')
    expect(await encryptToken('  ')).toBe('')
  })

  it('解密向后兼容未加密的旧值', async () => {
    expect(await decryptToken('plain-old-token')).toBe('plain-old-token')
    expect(await decryptToken('')).toBe('')
  })
})