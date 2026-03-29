/**
 * 事件模板生成器 — 快速批量生成事件骨架 JSON
 * 
 * 用法: npx tsx scripts/gen-events.ts
 * 
 * 输出: 到 stdout（可重定向到临时文件，审查后手动合并到对应 age JSON）
 * 
 * 功能:
 * 1. 基于 prompt 自动生成事件（需要 AI API，暂不支持）
 * 2. 基于模板快速生成骨架（手动指定参数）
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ========== 现有事件 ID 扫描 ==========

function scanExistingIds(): Set<string> {
  const eventsDir = path.resolve(__dirname, '../data/sword-and-magic/events')
  const ids = new Set<string>()
  for (const file of fs.readdirSync(eventsDir)) {
    if (!file.endsWith('.json')) continue
    const events = JSON.parse(fs.readFileSync(path.join(eventsDir, file), 'utf-8'))
    for (const e of events) {
      ids.add(e.id)
      if (e.branches) {
        for (const b of e.branches) {
          ids.add(b.id)
        }
      }
    }
  }
  return ids
}

// ========== 现有 Flag 扫描 ==========

function scanExistingFlags(): Set<string> {
  const eventsDir = path.resolve(__dirname, '../data/sword-and-magic/events')
  const flags = new Set<string>()
  for (const file of fs.readdirSync(eventsDir)) {
    if (!file.endsWith('.json')) continue
    const content = fs.readFileSync(path.join(eventsDir, file), 'utf-8')
    const matches = content.matchAll(/(?:set_flag|has\.flag)\.(\w+)/g)
    for (const m of matches) {
      flags.add(m[1])
    }
  }
  return flags
}

// ========== 骨架生成器 ==========

interface EventTemplate {
  id: string
  title: string
  description: string
  minAge: number
  maxAge: number
  weight: number
  include?: string
  exclude?: string
  effects: any[]
  branches: BranchTemplate[]
  unique: boolean
  tag: string
  priority: string
}

interface BranchTemplate {
  id: string
  title: string
  description: string
  probability: number
  requireCondition?: string
  riskCheck?: { attribute: string; difficulty: number; scale: number }
  effects: any[]
  failureEffects?: any[]
  successText?: string
  failureText?: string
}

const ATTRIBUTES = ['str', 'mag', 'int', 'spr', 'chr', 'mny', 'luk'] as const
const ATTR_NAMES: Record<string, string> = {
  str: '体魄', mag: '魔力', int: '智力', spr: '灵魂', chr: '魅力', mny: '家境', luk: '幸运'
}

function makeEffect(type: string, target: string, value: number, description: string): any {
  return { type, target, value, description }
}

function makeAttrEffect(attr: string, value: number): any {
  const sign = value >= 0 ? '+' : ''
  return makeEffect('modify_attribute', attr, value, `${ATTR_NAMES[attr]} ${sign}${value}`)
}

function makeFlagEffect(flag: string, description: string): any {
  return makeEffect('set_flag', flag, 1, description)
}

function makeHpEffect(value: number): any {
  return makeEffect('modify_hp', 'hp', value, `HP ${value >= 0 ? '+' : ''}${value}`)
}

/**
 * 生成带风险判定的事件骨架
 */
function generateRiskEvent(opts: {
  id: string
  title: string
  description: string
  minAge: number
  maxAge: number
  riskAttr: string
  difficulty: number
  successEffects: any[]
  failureEffects?: any[]
  successText: string
  failureText: string
  include?: string
  tag?: string
  priority?: string
  unique?: boolean
  extraBranch?: BranchTemplate
}): EventTemplate {
  const branches: BranchTemplate[] = [
    {
      id: `${opts.id}_risk`,
      title: '接受挑战',
      description: '你决定试一试',
      probability: 0.6,
      riskCheck: { attribute: opts.riskAttr, difficulty: opts.difficulty, scale: 3 },
      effects: opts.successEffects,
      failureEffects: opts.failureEffects ?? [makeHpEffect(-20)],
      successText: opts.successText,
      failureText: opts.failureText,
    },
    {
      id: `${opts.id}_safe`,
      title: '保守行事',
      description: '你决定不冒险',
      probability: 0.4,
      effects: [makeAttrEffect('int', 1)],
    }
  ]
  
  if (opts.extraBranch) {
    // Adjust probabilities
    branches[0].probability = 0.4
    branches[1].probability = 0.3
    opts.extraBranch.probability = 0.3
    branches.push(opts.extraBranch)
  }

  return {
    id: opts.id,
    title: opts.title,
    description: opts.description,
    minAge: opts.minAge,
    maxAge: opts.maxAge,
    weight: 4,
    include: opts.include,
    effects: [],
    branches,
    unique: opts.unique ?? true,
    tag: opts.tag ?? 'social',
    priority: opts.priority ?? 'major',
  }
}

/**
 * 生成多选择事件骨架
 */
function generateChoiceEvent(opts: {
  id: string
  title: string
  description: string
  minAge: number
  maxAge: number
  branches: { id: string; title: string; description: string; requireCondition?: string; effects: any[] }[]
  include?: string
  tag?: string
  priority?: string
  unique?: boolean
}): EventTemplate {
  const prob = +(1 / opts.branches.length).toFixed(2)
  let remaining = 1
  const branches: BranchTemplate[] = opts.branches.map((b, i) => {
    if (i === opts.branches.length - 1) {
      const p = +(remaining).toFixed(2)
      remaining = 0
      return { ...b, probability: p, effects: b.effects }
    }
    remaining -= prob
    return { ...b, probability: prob, effects: b.effects }
  })

  return {
    id: opts.id,
    title: opts.title,
    description: opts.description,
    minAge: opts.minAge,
    maxAge: opts.maxAge,
    weight: 4,
    include: opts.include,
    effects: [],
    branches,
    unique: opts.unique ?? true,
    tag: opts.tag ?? 'social',
    priority: opts.priority ?? 'major',
  }
}

// ========== 批量验证 ==========

function validateEvents(events: any[], existingIds: Set<string>): string[] {
  const errors: string[] = []
  const localIds = new Set<string>()

  for (const e of events) {
    // ID uniqueness
    if (existingIds.has(e.id)) {
      errors.push(`[${e.id}] ID 已存在`)
    }
    if (localIds.has(e.id)) {
      errors.push(`[${e.id}] 批次内重复`)
    }
    localIds.add(e.id)

    // Required fields
    for (const field of ['id', 'title', 'description', 'minAge', 'maxAge', 'weight', 'effects', 'branches', 'priority']) {
      if (!(field in e)) errors.push(`[${e.id}] 缺少字段: ${field}`)
    }

    // Branch validation
    if (e.branches) {
      let probSum = 0
      for (const b of e.branches) {
        probSum += b.probability ?? 0
        if (!b.id) errors.push(`[${e.id}] 分支缺少 id`)
        if (!b.title) errors.push(`[${e.id}/${b.id}] 分支缺少 title`)
        // Effects array
        if (!Array.isArray(b.effects)) errors.push(`[${e.id}/${b.id}] effects 不是数组`)
        // riskCheck validation
        if (b.riskCheck) {
          if (!ATTRIBUTES.includes(b.riskCheck.attribute)) {
            errors.push(`[${e.id}/${b.id}] riskCheck.attribute 无效: ${b.riskCheck.attribute}`)
          }
          if (typeof b.riskCheck.difficulty !== 'number') {
            errors.push(`[${e.id}/${b.id}] riskCheck.difficulty 不是数字`)
          }
        }
        // failureEffects without riskCheck
        if (b.failureEffects && !b.riskCheck) {
          errors.push(`[${e.id}/${b.id}] 有 failureEffects 但没有 riskCheck`)
        }
      }
      if (Math.abs(probSum - 1.0) > 0.05) {
        errors.push(`[${e.id}] probability 之和 = ${probSum}（应为 1.0）`)
      }
    }
  }

  return errors
}

// ========== Main ==========

function main() {
  const existingIds = scanExistingIds()
  const existingFlags = scanExistingFlags()

  console.log(`📋 现有事件ID: ${existingIds.size} 个`)
  console.log(`📋 现有Flag: ${existingFlags.size} 个`)
  console.log()

  // Demo: generate a few example events
  const examples: EventTemplate[] = [
    generateRiskEvent({
      id: 'arena_champion',
      title: '角斗大赛',
      description: '王国举办了一年一度的角斗大赛，胜者可获得丰厚奖金和贵族封号。',
      minAge: 18,
      maxAge: 40,
      riskAttr: 'str',
      difficulty: 16,
      successEffects: [
        makeAttrEffect('str', 2),
        makeAttrEffect('chr', 2),
        makeAttrEffect('mny', 3),
        makeFlagEffect('arena_champion', '角斗冠军！'),
      ],
      failureEffects: [makeHpEffect(-40), makeAttrEffect('str', 1)],
      successText: '你在角斗场上大放异彩！观众为你欢呼',
      failureText: '对手太强了...你被抬出了角斗场',
      include: 'attribute.str >= 12',
      tag: 'combat',
      priority: 'major',
    }),
    generateChoiceEvent({
      id: 'mysterious_stranger',
      title: '神秘旅人',
      description: '一个蒙面旅人在酒馆找到你，声称有重要的事要告诉你。',
      minAge: 15,
      maxAge: 50,
      include: 'attribute.chr >= 10 | attribute.luk >= 15',
      branches: [
        {
          id: 'listen_stranger',
          title: '听听他说什么',
          description: '你跟着他走到小巷',
          effects: [
            makeAttrEffect('int', 1),
            makeFlagEffect('secret_knowledge', '获得了秘密知识'),
          ],
        },
        {
          id: 'ignore_stranger',
          title: '无视他',
          description: '你继续喝你的酒',
          effects: [makeAttrEffect('luk', 1)],
        },
        {
          id: 'rob_stranger',
          title: '打劫他',
          description: '你想看看他身上有什么好东西',
          requireCondition: 'attribute.str >= 15',
          effects: [
            makeAttrEffect('mny', 3),
            makeHpEffect(-15),
          ],
        },
      ],
      tag: 'exploration',
      priority: 'minor',
    }),
  ]

  // Validate
  const errors = validateEvents(examples, existingIds)
  if (errors.length > 0) {
    console.log('❌ 验证失败:')
    errors.forEach(e => console.log(`  - ${e}`))
    process.exit(1)
  }

  console.log('✅ 示例事件验证通过\n')
  console.log(JSON.stringify(examples, null, 2))
  console.log(`\n💡 工具使用方式:`)
  console.log(`  1. import { generateRiskEvent, generateChoiceEvent, makeAttrEffect, makeFlagEffect, makeHpEffect }`)
  console.log(`  2. 用辅助函数快速构建事件`)
  console.log(`  3. validateEvents() 检查格式`)
  console.log(`  4. scanExistingIds() 确保不重复`)
}

main()
