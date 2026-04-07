# 数据与代码分离设计方案

## 目标

将 `src/worlds/sword-and-magic/` 中的纯数据文件迁移到 `data/sword-and-magic/` 目录下的 JSON 格式，用 AJV schema 在加载时做运行时校验。引擎代码完全不动。

## 当前状态

```
src/worlds/sword-and-magic/
├── achievements.ts   # 388行, 41个成就
├── attributes.ts     # 81行,  7个属性
├── events.ts         # 3385行, 93个事件 ← 73%数据量
├── index.ts          # 注册入口
├── items.ts          # 260行, 19个物品
├── manifest.ts       # 109行, 含5条路线
├── presets.ts        # 59行,  6个预设
├── rules.ts          # 48行,  评分规则
└── talents.ts        # 267行, 天赋
```

## 迁移后结构

```
data/sword-and-magic/
├── manifest.json         # 世界包清单 + 路线定义
├── attributes.json       # 7个属性定义
├── talents.json          # 天赋定义
├── events/
│   ├── birth.json        # 出生事件 (0岁)
│   ├── childhood.json    # 幼年期 (1-6岁)
│   ├── youth.json        # 少年期 (7-14岁)
│   ├── teenager.json     # 青年期 (15-20岁)
│   ├── adult.json        # 成年期 (21-40岁)
│   ├── middle-age.json   # 中年期 (41-60岁)
│   └── elder.json        # 老年期 (61-80岁)
├── items.json            # 物品定义
├── achievements.json     # 成就定义
├── presets.json          # 角色预设
└── rules.json            # 评分规则

src/worlds/sword-and-magic/
├── schemas/              # AJV JSON Schema 定义
│   ├── attribute.schema.json
│   ├── talent.schema.json
│   ├── event.schema.json
│   ├── item.schema.json
│   ├── achievement.schema.json
│   ├── preset.schema.json
│   ├── rule.schema.json
│   └── manifest.schema.json
├── data-loader.ts        # JSON 加载 + AJV 校验
├── index.ts              # 注册入口（改为调用 data-loader）
└── ... (其他引擎代码不变)

schemas/
├── shared.json           # 共享子schema（EventEffect, RiskCheck 等）
```

## AJV Schema 设计

### 共享 Schema (`schemas/shared.json`)

```json
{
  "$defs": {
    "EventEffect": {
      "type": "object",
      "required": ["type", "target", "value"],
      "properties": {
        "type": { "enum": ["modify_attribute", "set_attribute", "add_talent", "trigger_event", "set_flag", "modify_hp", "set_counter", "modify_counter", "grant_item"] },
        "target": { "type": "string" },
        "value": { "type": "number" },
        "probability": { "type": "number", "minimum": 0, "maximum": 1 },
        "condition": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "RiskCheck": {
      "type": "object",
      "required": ["attribute", "difficulty"],
      "properties": {
        "attribute": { "type": "string" },
        "difficulty": { "type": "number" },
        "scale": { "type": "number", "minimum": 0.1 }
      }
    },
    "EventBranch": {
      "type": "object",
      "required": ["id", "title", "description", "effects"],
      "properties": {
        "id": { "type": "string" },
        "title": { "type": "string" },
        "description": { "type": "string" },
        "probability": { "type": "number", "minimum": 0, "maximum": 1 },
        "effects": { "type": "array", "items": { "$ref": "#/$defs/EventEffect" } },
        "nextEvents": { "type": "array", "items": { "type": "string" } },
        "requireCondition": { "type": "string" },
        "riskCheck": { "$ref": "#/$defs/RiskCheck" },
        "failureEffects": { "type": "array", "items": { "$ref": "#/$defs/EventEffect" } },
        "successText": { "type": "string" },
        "failureText": { "type": "string" }
      }
    }
  }
}
```

### 事件 Schema (`schemas/event.schema.json`)

```json
{
  "type": "object",
  "required": ["id", "title", "description", "minAge", "maxAge", "weight", "effects"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z_][a-z0-9_]*$" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "minAge": { "type": "integer", "minimum": 0, "maximum": 80 },
    "maxAge": { "type": "integer", "minimum": 0, "maximum": 80 },
    "weight": { "type": "number", "minimum": 0 },
    "include": { "type": "string" },
    "exclude": { "type": "string" },
    "effects": { "type": "array", "items": { "$ref": "shared.json#/$defs/EventEffect" } },
    "branches": { "type": "array", "items": { "$ref": "shared.json#/$defs/EventBranch" } },
    "isBad": { "type": "boolean" },
    "tag": { "type": "string" },
    "unique": { "type": "boolean" },
    "priority": { "enum": ["critical", "major", "minor"] },
    "prerequisites": { "type": "array", "items": { "type": "string" } },
    "mutuallyExclusive": { "type": "array", "items": { "type": "string" } },
    "weightModifiers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["condition", "weightMultiplier"],
        "properties": {
          "condition": { "type": "string" },
          "weightMultiplier": { "type": "number", "minimum": 0, "maximum": 10 }
        }
      }
    }
  }
}
```

> 其他 schema（attributes, talents, items, achievements, presets, rules, manifest）结构类似，均从 TypeScript 接口直接映射。

## data-loader.ts 核心逻辑

```typescript
import Ajv from 'ajv'
import type { WorldEventDef, WorldItemDef, ... } from '@/engine/core/types'

const ajv = new Ajv({ allErrors: true })

// 加载 + 校验单个 JSON 文件
function loadAndValidate<T>(filePath: string, schemaPath: string): T {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
  const validate = ajv.compile(schema)
  if (!validate(data)) {
    console.error(`❌ Schema validation failed for ${filePath}:`)
    for (const err of validate.errors!) console.error(`  ${err.instancePath} ${err.message}`)
    throw new Error(`Data validation failed: ${filePath}`)
  }
  return data as T
}

// 加载所有事件（合并 events/ 目录下的所有 JSON）
function loadEvents(eventsDir: string): WorldEventDef[] {
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.json'))
  const allEvents: WorldEventDef[] = []
  for (const file of files) {
    const events = loadAndValidate<WorldEventDef[]>(path.join(eventsDir, file), 'schemas/event.schema.json')
    // 去重检查
    for (const e of events) {
      if (allEvents.some(a => a.id === e.id)) throw new Error(`Duplicate event id: ${e.id}`)
      allEvents.push(e)
    }
  }
  return allEvents
}
```

## index.ts 改造

```typescript
// Before
import { events } from './events'
import { items } from './items'
// ...

// After
import { loadWorldData } from './data-loader'
const data = loadWorldData('sword-and-magic')
// data.events, data.items, data.attributes, ... 类型安全
```

## JSON 事件文件示例 (`events/childhood.json`)

```json
[
  {
    "id": "bullied",
    "title": "被欺负",
    "description": "几个大孩子把你堵在墙角，嘲笑你的出身。",
    "minAge": 3,
    "maxAge": 12,
    "weight": 5,
    "unique": true,
    "isBad": true,
    "tag": "social",
    "priority": "major",
    "effects": [
      { "type": "modify_attribute", "target": "chr", "value": -1, "description": "魅力 -1" }
    ],
    "branches": [
      {
        "id": "endure",
        "title": "默默忍受",
        "description": "低下头，咬紧牙关...",
        "effects": [
          { "type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1" },
          { "type": "set_flag", "target": "bullied_endure", "value": 1, "description": "flag: bullied_endure" }
        ]
      },
      {
        "id": "stand_up",
        "title": "勇敢反抗",
        "description": "握紧拳头，直视他们的眼睛。",
        "riskCheck": { "attribute": "str", "difficulty": 3 },
        "effects": [
          { "type": "modify_attribute", "target": "str", "value": 1, "description": "体魄 +1" },
          { "type": "set_flag", "target": "stand_up_moment", "value": 1, "description": "flag: stand_up_moment" }
        ],
        "failureEffects": [
          { "type": "modify_hp", "target": "", "value": -10, "description": "HP -10" }
        ],
        "successText": "你挥出的一拳让领头的家伙愣住了...",
        "failureText": "你的反抗换来了更猛烈的拳头..."
      }
    ]
  }
]
```

## 事件文件拆分策略

| 文件 | 年龄段 | 预估事件数 |
|------|--------|-----------|
| `birth.json` | 0岁（出生） | ~5 |
| `childhood.json` | 1-6岁（幼年） | ~15 |
| `youth.json` | 7-14岁（少年） | ~20 |
| `teenager.json` | 15-20岁（青年） | ~20 |
| `adult.json` | 21-40岁（成年） | ~20 |
| `middle-age.json` | 41-60岁（中年） | ~10 |
| `elder.json` | 61-80岁（老年） | ~5 |

跨年龄段事件（如 `war_breaks_out` 25-35岁）放在它起始年龄段所在的文件中。

## 实施任务拆分

### T1: 基础设施（schemas + data-loader）
- 创建 `src/worlds/sword-and-magic/schemas/` 目录
- 编写所有 8 个 JSON Schema（含 shared.json）
- 实现 `data-loader.ts`（加载 + AJV 校验 + 错误报告）
- **验收**: `npx tsx -e "import { loadWorldData } from './src/worlds/sword-and-magic/data-loader'"` 不报错

### T2: 迁移 attributes + talents + presets + rules
- 将 4 个小数据文件转为 JSON
- 更新 `index.ts` 改用 data-loader
- **验收**: `npx vue-tsc --noEmit` 通过 + `npx tsx scripts/test-simulation.ts` 20局无逻辑问题

### T3: 迁移 items + achievements
- 将 items.ts 和 achievements.ts 转为 JSON
- **验收**: 同 T2

### T4: 迁移 events（大文件）
- 将 events.ts 的 93 个事件按年龄段拆分为 7 个 JSON 文件
- 事件 ID 去重校验
- 删除旧的 events.ts
- **验收**: `npx vue-tsc --noEmit` 通过 + 20局测试对比（事件总数93、平均寿命一致）

### T5: 迁移 manifest
- 将 manifest.ts（含路线定义）转为 JSON
- **验收**: 路线系统正常工作

### T6: 清理 + 测试
- 删除所有旧 `.ts` 数据文件（attributes.ts, talents.ts, events.ts, items.ts, achievements.ts, presets.ts, rules.ts）
- 保留 index.ts 和 data-loader.ts
- 20局完整测试 + 编译验证
- **验收**: 0 编译错误 + 0 逻辑问题 + git diff 确认旧文件已删除

## 约束

1. **引擎代码零改动**：`src/engine/` 目录完全不动
2. **UI 代码零改动**：`src/components/` 完全不动
3. **TypeScript 接口不变**：`types.ts` 中的接口定义是契约，JSON schema 必须完全匹配
4. **Vite 兼容**：JSON import 使用 `import data from './file.json' with { type: 'json' }` 或 `fs.readFileSync`（构建时静态 import 更好）
5. **事件总数不变**：迁移前后必须都是 93 个事件
6. **额外字段拒绝**：`additionalProperties: false`，防止拼写错误
