# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

异世界重生模拟器 — 文字冒险 + 人生模拟 + Galgame 分支叙事。Vue 3 + TypeScript + Vite 单页应用，数据驱动引擎，PWA 离线部署到 GitHub Pages。

## 常用命令

```bash
# 安装依赖（必须加 --legacy-peer-deps，vite-plugin-pwa 未声明 Vite 8 兼容）
npm install --legacy-peer-deps

# 开发服务器（http://localhost:5173）
npm run dev

# 生产构建（先 vue-tsc 类型检查，再 vite build）
npm run build

# 运行全部测试
npm test

# 测试监听模式
npm run test:watch

# 运行单个测试文件
npx vitest run tests/full-life-route.test.ts

# 运行匹配名称的测试
npx vitest run -t "测试名称"
```

## 架构概览

### 引擎层 (`src/engine/`)

游戏核心逻辑与 UI 完全解耦。引擎是纯 TypeScript，不依赖 Vue。

- **SimulationEngine** (`core/SimulationEngine.ts`) — 主编排器。Galgame 式三步流程：`startYear()` → `awaiting_choice` → `resolveBranch()`。管理 HP 再生、衰老曲线、路线系统、锚点事件。
- **EventModule** (`modules/EventModule.ts`) — 事件加载、条件过滤、加权随机选择、效果执行。支持种族/性别变体、唯一事件、前置链。
- **ConditionDSL** (`modules/ConditionDSL.ts`) — 自定义条件表达式递归下降解析器。语法：`attribute.str >= 10 & has.flag.married`，支持 `&`(AND)、`|`(OR)、`!`(NOT)、比较运算符、flag/talent/item/achievement 检查。
- **AttributeModule** — 属性初始化、分配、修改、峰值追踪。
- **TalentModule** — 天赋抽卡（加权池 + 稀有度）、互斥组、年龄触发效果。
- **EvaluatorModule** — 评分 = 属性峰值之和 + 寿命加成 + 物品加成 + 路线加成，映射到 D~SS 评级。
- **DiceModule** — D20 骰判定系统（参考博德之门3），支持优势/劣势、大成功(20)/大失败(1)。
- **ItemModule** — 物品授予/消耗、被动效果、死亡豁免。
- **AchievementModule** — 成就检测（基于 DSL 条件）。

### 世界系统 (`src/worlds/`)

数据驱动的多世界架构。当前只有「剑与魔法」世界：
- `worlds/sword-and-magic/index.ts` — 世界注册
- `worlds/sword-and-magic/data-loader.ts` — JSON 数据加载 + AJV Schema 校验

### 游戏数据 (`data/sword-and-magic/`)

所有内容都是 JSON，引擎代码不需要改就能添加内容：
- `events/{age-group}.json` — 按年龄段组织的事件（birth/childhood/teenager/youth/adult/middle-age/elder）
- `attributes.json` — 7 个可分配属性（str/chr/int/luk/spr/mag/mny）
- `talents.json` — 68 个天赋（稀有度系统）
- `items.json` — 22 个物品（被动效果）
- `achievements.json` — 126 个成就
- `races.json` — 7 个种族（4 个可选）
- `presets.json` — 6 个角色预设
- `rules.json` — 评分规则

### UI 层 (`src/views/`, `src/components/`)

Vue 3 Composition API + Pinia 状态管理。四个主要视图：首页 → 角色设置 → 模拟 → 结算。

### 游戏生命周期 (`GamePhase`)

```
init → talent-draft → attribute-allocate → simulating ⇄ awaiting_choice → finished
```

每年循环：`simulating`（筛选+抽取事件）→ `awaiting_choice`（等待玩家选分支）→ `resolveBranch()` → 下一年或 `finished`。

### 存档系统

`gameStore` 通过 localStorage 持久化，10 个存档槽位。引擎状态序列化/反序列化需要处理 Set、Map、flags 等非 JSON 原生类型。

### 路线系统

6 条职业路线（平民/冒险者/骑士/法师/商人/学者），有层级关系（tier 0/1）。路线控制事件可见性和优先级。

## 关键约定

- TypeScript 严格模式开启（`strict: true`）
- 路径别名：`@/` → `src/`

### 条件 DSL 语法

```
expression := or_expr
or_expr    := and_expr ( '|' and_expr )*
and_expr   := atom ( '&' atom )*
atom       := '(' expression ')' | comparison
comparison := identifier op value
identifier := 'attribute.id' | 'age' | 'has.talent.id' | 'flag.name'
op         := '==' | '!=' | '>=' | '<=' | '>' | '<'
value      := number | string
```

### 事件数据结构要点

- `include`/`exclude` — DSL 条件，控制事件是否出现在候选池
- `prerequisites` — 所有前置条件必须满足（AND）
- `mutuallyExclusive` — 任一满足则排除
- `routes` — 路线限制
- `unique: true` — 一生只能触发一次
- `branches[].requireCondition` — 分支前置条件
- `branches[].diceCheck` — D20 骰判定
- `branches[].cost` — 属性消耗
- 效果类型：`modify_attribute`、`set_attribute`、`set_flag`、`remove_flag`、`add_talent`、`grant_item`、`modify_hp`、`trigger_event`、`set_counter`、`modify_counter`

### 测试

- 测试目录：`tests/`，Vitest 运行
- 引擎测试覆盖路径：`src/engine/**/*.ts`
- 集成测试用种子随机数跑完整人生路径
- `scripts/test-batch1.ts` — 50 局事件触发检测基准（**不要修改此文件**）

### 数据校验

游戏数据通过 AJV Schema 在加载时校验。修改 `data/` 下的 JSON 文件后，启动开发服务器即可触发校验错误。

### 依赖安装

**必须**使用 `--legacy-peer-deps`，否则会因为 `vite-plugin-pwa` 的 peer dependency 声明不兼容 Vite 8 而安装失败。

### Git 提交风格

- `feat:` 新功能
- `fix:` 修复
- `balance:` 数值平衡调整
- `refactor:` 重构
- `test:` 测试

## 内容修改注意事项

- 修改事件 JSON 时注意 Flag 一致性：每个 `set_flag` 都应有对应的 `has.flag` 消费，每个 `has.flag` 都应有来源
- 事件分支要有成本收益对称性，避免「必选」或「无用」分支
- 种族/性别变体只覆盖文本和分支，不覆盖条件和效果
- 添加新事件时注意年龄段文件的位置
