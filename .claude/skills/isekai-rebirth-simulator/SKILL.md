---
name: isekai-rebirth-simulator
description: 异世界重生模拟器项目的开发技能。涵盖事件/成就/天赋/种族/物品/评语/预设/属性的内容添加、数据校验、Flag一致性检查、DSL条件编写、引擎模块接口、测试编写。当用户提到异世界重生模拟器、isekai-rebirth-simulator、添加事件/成就/天赋/种族、校验数据、检查Flag、写DSL条件、写游戏测试、修改引擎模块时触发。即使用户只是说"加个事件"、"写个成就"、"检查一下数据"、"跑一下测试"，只要当前工作区是 isekai-rebirth-simulator 项目就应该触发。
---

# 异世界重生模拟器 — 项目开发技能

## 项目定位

文字类人生模拟器。玩家选择种族、性别、身份、天赋后，引擎逐年推演人生事件，最终生成评分和评语。

**技术栈：** Vue 3.5 + Vite 8 + TypeScript 5.9 + Pinia + Vitest

**项目路径：** `/Users/ktsama/Projects/isekai-rebirth-simulator/`

---

## 架构概览

### 三层分离

```
引擎层 (src/engine/)        数据层 (data/sword-and-magic/)     世界层 (src/worlds/)
├─ core/SimulationEngine    ├─ events/*.json (按年龄段)        ├─ sword-and-magic/
├─ modules/EventModule      ├─ achievements.json               │   ├─ data-loader.ts
├─ modules/AchievementModule├─ talents.json                    │   └─ schemas/shared.json
├─ modules/EvaluatorModule  ├─ races.json                      └─ [新世界]/
├─ modules/ConditionDSL     ├─ items.json
├─ modules/DiceModule       ├─ evaluations.json
├─ modules/TalentModule     ├─ presets.json
├─ modules/ItemModule       ├─ attributes.json
├─ modules/AttributeModule  ├─ rules.json
└─ world/WorldRegistry      └─ manifest.json
```

引擎层只消费 TypeScript 接口（`WorldEventDef`、`WorldAchievementDef` 等），不关心具体内容。数据层全部是纯 JSON，通过 AJV Schema 校验后加载。模块间通过 **Flag** 和 **DSL 条件表达式** 松耦合。

### 主循环

```
SimulationEngine.simulateYear()
  ├─ age++, HP 恢复
  ├─ TalentModule.applyTalentEffects()
  ├─ updateRoute() — 路线进入/退出检查
  ├─ EventModule.getCandidates() — 年龄缩放 + 条件过滤
  ├─ checkMandatoryAnchor() — 路线强制锚点
  ├─ 动态权重计算（Tag 亲和力 + weightModifiers + minor 降权 + 路线衰减）
  ├─ random.weightedPick() — 加权随机选取
  └─ resolveBranch() → applyEffects() → postYearProcessCore()
       ├─ AchievementModule.checkAchievements()
       ├─ 濒死/死亡判定
       └─ EvaluatorModule.calculate() — 最终评分 + 评语
```

### 年龄缩放规则

- **出生事件** (maxAge ≤ 1)：不缩放
- **种族专属事件** (`races: ["当前种族"]` 且仅一个种族)：不缩放，用种族实际年龄
- **通用/多种族事件**：`minAge/maxAge × (effectiveMaxAge / 85)`，以人类 85 岁为基准

---

## 内容类型速查

### 8 种可扩展内容

| 类型 | 文件位置 | 类型接口 | 必填字段 |
|------|----------|----------|----------|
| 事件 | `data/.../events/*.json` | `WorldEventDef` | id, title, description, minAge, maxAge, weight, effects |
| 成就 | `data/.../achievements.json` | `WorldAchievementDef` | id, name, description, icon, hidden, condition, category |
| 天赋 | `data/.../talents.json` | `WorldTalentDef` | id, name, description, rarity, icon, effects, draftWeight |
| 种族 | `data/.../races.json` | `WorldRaceDef` | id, name, icon, description, lore, playable, lifespanRange, attributeModifiers |
| 物品 | `data/.../items.json` | `WorldItemDef` | id, name, description, icon, rarity, category, effects, acquireText |
| 评语 | `data/.../evaluations.json` | `LifeEvaluation` | id, title, description, rarity, priority, condition |
| 预设 | `data/.../presets.json` | `WorldPresetDef` | id, name, title, description, attributes, locked |
| 属性 | `data/.../attributes.json` | `WorldAttributeDef` | id, name, icon, description, color, min, max, defaultValue, group |

### 事件文件按年龄段分配

| 文件 | 年龄范围 | 说明 |
|------|---------|------|
| birth.json | 0-1 | 出生事件 |
| childhood.json | 2-6 | 童年 |
| teenager.json | 7-15 | 少年 |
| youth.json | 16-24 | 青年 |
| adult.json | 25-50 | 成年 |
| middle-age.json | 51-80 | 中年 |
| elder.json | 81+ | 老年 |

新事件的 `minAge` 决定它应该放入哪个文件。

---

## DSL 条件语法

### 语法规则

```
expression := or_expr
or_expr    := and_expr ( '|' and_expr )*
and_expr   := atom ( '&' atom )*
atom       := '(' expression ')' | has_expr | comparison
```

### 可用标识符

| 标识符 | 含义 | 示例 |
|--------|------|------|
| `attribute.<id>` | 当前属性值 | `attribute.str >= 20` |
| `attribute.peak.<id>` | 属性历史峰值 | `attribute.peak.mag >= 50` |
| `age` | 当前年龄 | `age >= 18` |
| `lifespan` | 寿命上限 | `lifespan >= 80` |
| `hp` | 当前 HP | `hp >= 50` |
| `event.count.<id>` | 事件触发次数 | `event.count.battle >= 3` |
| `achievement.count` | 已解锁成就数 | `achievement.count >= 10` |
| `character.race` | 角色种族 | `character.race == elf` |
| `character.gender` | 角色性别 | `character.gender == female` |
| `counter.<id>` | 计数器值 | `counter.kill_count >= 5` |

### has 表达式

| 语法 | 含义 |
|------|------|
| `has.flag.<name>` | 检查 Flag 存在 |
| `has.talent.<id>` | 检查已选天赋 |
| `has.event.<id>` | 检查已触发事件 |
| `has.achievement.<id>` | 检查已解锁成就 |
| `has.counter.<id>` | 检查计数器 > 0 |

### 组合示例

```
has.flag.dragon_rider & attribute.mag >= 20
has.flag.council_member | has.flag.elf_sage_council
(attribute.str >= 15 | attribute.mag >= 15) & age >= 25
character.race == goblin & has.flag.merchant
```

---

## EventEffect 支持的效果类型

| type | 说明 | target | value |
|------|------|--------|-------|
| `modify_attribute` | 加减属性 | 属性ID(str/int/chr...) | 增减值 |
| `set_attribute` | 设定属性 | 属性ID | 目标值 |
| `modify_hp` | 加减HP | `hp` | 增减值(致命打击:>50%HP时额外-10) |
| `set_flag` | 设置标记 | Flag名 | 1 |
| `remove_flag` | 移除标记 | Flag名 | 1 |
| `set_counter` | 设置计数器 | counter ID | 目标值 |
| `modify_counter` | 修改计数器 | counter ID | 增减值 |
| `add_talent` | 获得天赋 | 天赋ID | - |
| `trigger_event` | 链式触发事件 | 事件ID | - |
| `grant_item` | 获得物品 | 物品ID | - |
| `modify_max_hp_bonus` | HP上限加成 | - | 增减值 |

公共可选字段：`probability`(0-1 生效概率), `condition`(DSL 条件), `description`(描述文本)

---

## Flag 接口契约

Flag 是事件间唯一的耦合机制。核心原则：

1. **每个 Flag 都是 API** — `set_flag` 是输出，`has.flag` 是输入，命名必须语义精确
2. **不同语义必须用不同 Flag** — 否则产生跨模块副作用（案例：`council_member` vs `elf_sage_council`）
3. **状态机转移必须完整** — 进新状态(set) + 退旧状态(remove)，否则后续模块基于脏状态决策（案例：恋爱状态机必须 set eloped + remove dating）
4. **set 了就应该有消费者** — 没有任何 `has.flag.xxx` 引用的 Flag 是死代码

### 恋爱状态机

```
[单身] → first_love → [in_relationship] → dating → [dating]
  → dating_deepen → marriage_proposal → [engaged] → wedding → [married]
  → forbidden_love(私奔) → [eloped]（排除后续王国恋爱事件）
  → (失败) → [heartbroken]
  → (死亡) → [widowed]
```

---

## 骰子判定系统 (D20)

```
modifier = floor(属性值 / 3)
结果 = D20 + modifier
成功 = Natural 20 必定成功 | Natural 1 必定失败 | 结果 >= DC
```

DC 设定参考：
- DC 8-10：简单任务，大多数角色能过
- DC 12-14：中等挑战
- DC 15-17：困难，需要高属性
- DC 18-20：极难，只有专精角色有机会

---

## 内容扩展工具

使用 `python3 scripts/content-tool.py` 进行内容管理：

```bash
# 内容统计
python3 scripts/content-tool.py stats

# 生成模板（支持 8 种类型）
python3 scripts/content-tool.py template event
python3 scripts/content-tool.py template achievement --out /tmp/template.json

# 校验所有数据文件
python3 scripts/content-tool.py validate

# Flag 一致性检查
python3 scripts/content-tool.py check-flags

# 列出现有内容
python3 scripts/content-tool.py list race
python3 scripts/content-tool.py list achievement

# DSL 语法检查
python3 scripts/content-tool.py check-dsl "has.flag.xxx & attribute.str >= 10"

# 交互式添加
python3 scripts/content-tool.py add event
```

---

## 添加内容的标准流程

### 添加事件

1. 确定 minAge → 选择目标事件文件（参考年龄段分配表）
2. 确保 `id` 全局唯一（跨所有事件文件）
3. 设置合理的 `weight`（1=极稀有, 3-5=普通, 7-10=常见）
4. 如果事件是种族专属，设置 `races: ["elf"]` 并注意 minAge/maxAge 使用种族实际年龄（不走缩放）
5. 有分支的事件设 `priority: "major"` 或 `"critical"`，无分支的用 `"minor"`
6. 分支如果有判定，使用 `diceCheck`（D20 系统），设合理的 DC 和对应属性
7. **文案自包含** — 只描述"这一刻发生了什么"，不假设之前/之后的时间线
8. 如果 set_flag，确保有其他事件/成就/评语消费该 Flag
9. 运行 `python3 scripts/content-tool.py validate` 校验
10. 运行 `python3 scripts/content-tool.py check-flags` 检查 Flag 一致性

### 添加成就

1. `condition` 使用 DSL 语法
2. 种族专属成就添加 `races` 字段
3. `hidden: true` 表示未解锁时不显示名称
4. `category` 使用现有分类（进度/人生/路线/战斗/魔法/属性/史诗/人类/精灵/哥布林/性别/秘密）

### 添加种族

新种族需要同步创建：
1. `races.json` 中的种族定义
2. `events/*.json` 中的种族专属事件（`races: ["new_race"]`）
3. `talents.json` 中的种族专属天赋（`requireRace: ["new_race"]`）
4. `achievements.json` 中的种族专属成就
5. `evaluations.json` 中的种族专属评语
6. 为现有通用事件添加 `raceVariants`

### 添加天赋

- `draftWeight` 控制抽取权重（common=100, rare=10, legendary=1）
- `requireRace/requireGender/requirePreset` 限定抽取条件
- `mutuallyExclusive` 设置互斥天赋
- effects 的 `type` 支持：`modify_attribute`, `multiply_attribute`, `add_event`, `trigger_on_age`

---

## 测试指南

### 测试结构

```
tests/
├── helpers.ts                    # makeWorld(), makeState() 等测试工厂
├── data/
│   └── data-validation.test.ts   # JSON 数据文件 Schema 校验
├── engine/
│   ├── core/                     # SimulationEngine, RandomProvider, stateUtils
│   └── modules/                  # 各引擎模块的单元测试
```

### 常用命令

```bash
npx vitest run                    # 执行所有测试
npx vitest run tests/engine/modules/EventModule.test.ts  # 单文件
npx vitest --coverage             # 带覆盖率
npx vue-tsc --noEmit              # TypeScript 类型检查
```

### 测试工厂函数（tests/helpers.ts）

使用 `makeWorld()` 创建最小世界实例，`makeState()` 创建最小游戏状态。这些工厂保证测试不依赖具体数据文件。

### 编写测试的要点

1. **引擎模块测试**：在 `tests/engine/modules/` 下对应文件中添加
2. **数据校验测试**：在 `tests/data/data-validation.test.ts` 中验证 JSON 数据结构
3. **集成测试**：使用 `SimulationEngine` 完整运行模拟，检查最终状态
4. 测试中使用固定 seed 的 `RandomProvider` 保证结果可复现

---

## 编译验证清单

每次内容/代码修改后，按以下顺序验证：

```bash
# 1. TypeScript 编译检查
npx vue-tsc --noEmit

# 2. 数据文件校验
python3 scripts/content-tool.py validate

# 3. Flag 一致性
python3 scripts/content-tool.py check-flags

# 4. 单元测试
npx vitest run

# 5. 开发服务器启动（可选）
npx vite
```

---

## 当前种族与属性

### 可用种族

| ID | 名称 | 寿命 | 可玩 | 特点 |
|----|------|------|------|------|
| human | 人类 | 70-100 | ✅ | 均衡 |
| elf | 精灵 | 200-500 | ✅ | mag+8, int+5, str-5 |
| goblin | 哥布林 | 20-40 | ✅ | luk+10, str-8, chr-6 |
| dwarf | 矮人 | 120-200 | ❌ | str+8, mag-5 |
| orc | 兽人 | 50-80 | ❌ | str+10, mag-8 |
| sea_elf | 海精灵 | 300-600 | ❌ | mag+12, str-8 |
| half_dragon | 半龙人 | 150-300 | ❌ | str+10, mag+8, chr-10 |

### 属性 ID 速查

| ID | 名称 | 说明 |
|----|------|------|
| str | 体魄 | 战斗/体力 |
| int | 智慧 | 学识/判断 |
| chr | 魅力 | 社交/外貌 |
| mny | 家境 | 财富/资源 |
| spr | 灵魂 | 精神/感知 |
| mag | 魔力 | 魔法能力 |
| luk | 运势 | 幸运/随机事件 |

---

## 日志格式

所有日志输出遵循统一格式：

```typescript
Debug.Log($"KT---{功能}---{内容}---{DateTime.Now:HH:mm:ss}");
// 示例（虽然本项目是 Vue/TS，但有需要时使用）
console.log(`KT---EventModule---事件池候选 ${candidates.length} 个---${new Date().toLocaleTimeString()}`);
```
