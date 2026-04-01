/**
 * 数据加载器 — 从 JSON 文件加载世界数据并做 AJV 校验
 */

import Ajv from 'ajv'
import type {
  WorldManifest,
  WorldAttributeDef,
  WorldTalentDef,
  WorldEventDef,
  WorldAchievementDef,
  WorldItemDef,
  WorldPresetDef,
  WorldScoringRule,
} from '../../engine/core/types'

// ==================== Schema 定义 ====================

import sharedDefs from './schemas/shared.json'

const schemas: Record<string, object> = {
  event: {
    type: 'object',
    required: ['id', 'title', 'description', 'minAge', 'maxAge', 'weight', 'effects'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      minAge: { type: 'integer', minimum: 0, maximum: 100 },
      maxAge: { type: 'integer', minimum: 0, maximum: 100 },
      weight: { type: 'number', minimum: 0 },
      include: { type: 'string' },
      exclude: { type: 'string' },
      effects: { type: 'array', items: { $ref: '#/definitions/EventEffect' } },
      branches: { type: 'array', items: { $ref: '#/definitions/EventBranch' } },
      isBad: { type: 'boolean' },
      tag: { type: 'string' },
      unique: { type: 'boolean' },
      priority: { enum: ['critical', 'major', 'minor'] },
      prerequisites: { type: 'array', items: { type: 'string' } },
      mutuallyExclusive: { type: 'array', items: { type: 'string' } },
      weightModifiers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['condition', 'weightMultiplier'],
          additionalProperties: true,
          properties: {
            condition: { type: 'string' },
            weightMultiplier: { type: 'number', minimum: 0, maximum: 10 },
          },
        },
      },
      routes: { type: 'array', items: { type: 'string' } },
      routeMode: { type: 'string', enum: ['any', 'all'] },
    },
  },
  item: {
    type: 'object',
    required: ['id', 'name', 'description', 'icon', 'rarity', 'category', 'effects', 'acquireText'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      icon: { type: 'string' },
      rarity: { enum: ['common', 'rare', 'legendary'] },
      category: { enum: ['weapon', 'armor', 'accessory', 'consumable', 'special'] },
      effects: { type: 'array', items: { $ref: '#/definitions/ItemEffectDef' } },
      acquireText: { type: 'string' },
    },
  },
  talent: {
    type: 'object',
    required: ['id', 'name', 'description', 'rarity', 'icon', 'effects', 'draftWeight'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      rarity: { enum: ['common', 'rare', 'legendary'] },
      icon: { type: 'string' },
      effects: { type: 'array', items: { $ref: '#/definitions/EventEffect' } },
      draftWeight: { type: 'integer', minimum: 1 },
    },
  },
  attribute: {
    type: 'object',
    required: ['id', 'name', 'icon', 'description', 'color', 'min', 'max', 'defaultValue', 'group'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      icon: { type: 'string' },
      description: { type: 'string' },
      color: { type: 'string' },
      min: { type: 'integer' },
      max: { type: 'integer' },
      defaultValue: { type: 'integer' },
      group: { type: 'string' },
      hidden: { type: 'boolean' },
    },
  },
  achievement: {
    type: 'object',
    required: ['id', 'name', 'description', 'icon', 'hidden', 'condition', 'category'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      icon: { type: 'string' },
      hidden: { type: 'boolean' },
      condition: { type: 'string' },
      category: { type: 'string' },
      reward: { type: 'string' },
    },
  },
  preset: {
    type: 'object',
    required: ['id', 'name', 'title', 'description', 'attributes', 'locked'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      attributes: { type: 'object', additionalProperties: { type: 'integer' } },
      talents: { type: 'array', items: { type: 'string' } },
      locked: { type: 'boolean' },
      unlockCondition: { type: 'string' },
    },
  },
  rule: {
    type: 'object',
    required: ['grades'],
    additionalProperties: true,
    properties: {
      grades: { type: 'array', items: { $ref: '#/definitions/ScoreGrade' } },
    },
  },
  manifest: {
    type: 'object',
    required: ['id', 'name', 'subtitle', 'description', 'version', 'author', 'icon', 'theme', 'tags', 'maxAge', 'initialPoints', 'talentDraftCount', 'talentSelectCount'],
    additionalProperties: true,
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      subtitle: { type: 'string' },
      description: { type: 'string' },
      version: { type: 'string' },
      author: { type: 'string' },
      icon: { type: 'string' },
      banner: { type: 'string' },
      theme: {
        type: 'object',
        required: ['primary', 'secondary', 'background', 'text'],
        additionalProperties: true,
        properties: {
          primary: { type: 'string' },
          secondary: { type: 'string' },
          background: { type: 'string' },
          text: { type: 'string' },
        },
      },
      tags: { type: 'array', items: { type: 'string' } },
      maxAge: { type: 'integer' },
      initialPoints: { type: 'integer' },
      talentDraftCount: { type: 'integer' },
      talentSelectCount: { type: 'integer' },
      files: { type: 'object', additionalProperties: { type: 'string' } },
      routes: { type: 'array', items: { $ref: '#/definitions/LifeRoute' } },
    },
  },
}

// ==================== AJV 实例 ====================

const ajv = new Ajv({ allErrors: true, strict: false })

// 编译所有 schema（共享 definitions 注入到每个 schema）
const compiledSchemas: Record<string, ReturnType<typeof ajv.compile>> = {}
for (const [name, schema] of Object.entries(schemas)) {
  const fullSchema = { ...schema, definitions: sharedDefs }
  compiledSchemas[name] = ajv.compile(fullSchema)
}

/** Schema 名称 → 是否为数组类型数据 */
const arraySchemas = new Set(['attribute', 'talent', 'item', 'achievement', 'preset', 'event'])

// ==================== 校验函数 ====================

function validate<T>(data: unknown, schemaName: string, fileName: string): T {
  const validate = compiledSchemas[schemaName]
  if (!validate) {
    throw new Error(`[data-loader] Unknown schema: ${schemaName}`)
  }
  // 数组类型数据需要逐项校验
  if (arraySchemas.has(schemaName)) {
    if (!Array.isArray(data)) {
      throw new Error(`[data-loader] ${fileName}: expected array, got ${typeof data}`)
    }
    const errors: string[] = []
    for (let i = 0; i < data.length; i++) {
      if (!validate(data[i])) {
        for (const e of (validate.errors || [])) {
          errors.push(`  [${i}]${e.instancePath} ${e.message}`)
        }
      }
    }
    if (errors.length > 0) {
      throw new Error(`[data-loader] Schema validation failed for ${fileName}:\n${errors.join('\n')}`)
    }
  } else {
    if (!validate(data)) {
      const errors = validate.errors?.map(e => `  ${e.instancePath} ${e.message}`).join('\n')
      throw new Error(`[data-loader] Schema validation failed for ${fileName}:\n${errors}`)
    }
  }
  return data as T
}

// ==================== 数据加载 ====================

// JSON 数据将在 T2-T5 中逐步创建
// 这里先导出占位，后续任务填充 import

import manifestData from '../../../data/sword-and-magic/manifest.json'
import attributesData from '../../../data/sword-and-magic/attributes.json'
import talentsData from '../../../data/sword-and-magic/talents.json'
import itemsData from '../../../data/sword-and-magic/items.json'
import achievementsData from '../../../data/sword-and-magic/achievements.json'
import evaluationsData from '../../../data/sword-and-magic/evaluations.json'
import presetsData from '../../../data/sword-and-magic/presets.json'
import rulesData from '../../../data/sword-and-magic/rules.json'
import eventsBirthData from '../../../data/sword-and-magic/events/birth.json'
import eventsChildhoodData from '../../../data/sword-and-magic/events/childhood.json'
import eventsYouthData from '../../../data/sword-and-magic/events/youth.json'
import eventsTeenagerData from '../../../data/sword-and-magic/events/teenager.json'
import eventsAdultData from '../../../data/sword-and-magic/events/adult.json'
import eventsMiddleAgeData from '../../../data/sword-and-magic/events/middle-age.json'
import eventsElderData from '../../../data/sword-and-magic/events/elder.json'

/** 加载并校验所有世界数据 */
export function loadWorldData() {
  // 校验各数据文件
  const manifest = validate<WorldManifest>(manifestData, 'manifest', 'manifest.json')
  const attributes = validate<WorldAttributeDef[]>(attributesData, 'attribute', 'attributes.json')
  const talents = validate<WorldTalentDef[]>(talentsData, 'talent', 'talents.json')
  const items = validate<WorldItemDef[]>(itemsData, 'item', 'items.json')
  const achievements = validate<WorldAchievementDef[]>(achievementsData, 'achievement', 'achievements.json')
  const presets = validate<WorldPresetDef[]>(presetsData, 'preset', 'presets.json')
  const scoringRule = validate<WorldScoringRule>(rulesData, 'rule', 'rules.json')

  // 合并事件文件 + 校验
  const eventFiles = [
    eventsBirthData,
    eventsChildhoodData,
    eventsYouthData,
    eventsTeenagerData,
    eventsAdultData,
    eventsMiddleAgeData,
    eventsElderData,
  ]

  const eventIds = new Set<string>()
  const events: WorldEventDef[] = []

  for (const fileEvents of eventFiles) {
    const validated = validate<WorldEventDef[]>(fileEvents, 'event', 'events')
    for (const event of validated) {
      if (eventIds.has(event.id)) {
        throw new Error(`[data-loader] Duplicate event id: ${event.id}`)
      }
      eventIds.add(event.id)
      events.push(event)
    }
  }

  // rules.json 中 maxScore: Infinity 特殊处理
  for (const grade of (scoringRule as any).grades) {
    if (grade.maxScore === null) {
      grade.maxScore = Infinity
    }
  }

  return {
    manifest,
    attributes,
    talents,
    events,
    achievements,
    items,
    presets,
    scoringRule,
    evaluations: evaluationsData as any[],
  }
}
