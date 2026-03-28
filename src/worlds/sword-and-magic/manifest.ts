import type { WorldManifest } from '../../engine/core/types'

export const manifest: WorldManifest = {
  id: 'sword-and-magic',
  name: '剑与魔法',
  subtitle: '在巨龙咆哮的苍穹下，书写你的传说',
  description: '一个充满魔法与冒险的异世界。在这里，你可以成为伟大的魔法师、传奇的剑士、富甲一方的商人，或者...发明可乐的穿越者。',
  version: '1.0.0',
  author: 'isekai-sim',
  icon: '⚔️',
  banner: '',
  theme: {
    primary: '#8b5cf6',
    secondary: '#d946ef',
    background: '#0f0a1a',
    text: '#e2e8f0',
  },
  tags: ['奇幻', '冒险', '魔法', '剑与魔法'],
  maxAge: 80,
  initialPoints: 20,
  talentDraftCount: 10,
  talentSelectCount: 3,
  files: {
    attributes: 'attributes.json',
    talents: 'talents.json',
    events: 'events.json',
    achievements: 'achievements.json',
    presets: 'presets.json',
    rules: 'rules.json',
  },
}
