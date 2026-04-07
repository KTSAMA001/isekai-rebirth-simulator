# 异世界重生模拟器 — 全面代码评审报告

> **评审人**：GLM-5.1（资深游戏架构师视角）
> **评审日期**：2026-04-03
> **项目路径**：`/Users/ktsama/Projects/isekai-rebirth-simulator`
> **当前分支**：`master`（最新提交 `476b73e`）

---

## 目录

1. [项目结构分析](#1-项目结构分析)
2. [游戏内容现状](#2-游戏内容现状)
3. [引擎层架构评审](#3-引擎层架构评审)
4. [数据层评审](#4-数据层评审)
5. [状态管理评审](#5-状态管理评审)
6. [类型系统一致性](#6-类型系统一致性)
7. [UI/组件层评审](#7-ui组件层评审)
8. [潜在 Bug 列表](#8-潜在-bug-列表)
9. [开发方向建议](#9-开发方向建议)

---

## 1. 项目结构分析

### 1.1 完整目录树

```
isekai-rebirth-simulator/
├── data/                              # 游戏数据（JSON）
│   └── sword-and-magic/               # "剑与魔法"世界包
│       ├── events/                    # 事件数据（7个年龄段，37151行）
│       │   ├── birth.json             #   25个事件
│       │   ├── childhood.json         #   72个事件
│       │   ├── teenager.json          #   83个事件
│       │   ├── youth.json             #   113个事件
│       │   ├── adult.json             #   150个事件
│       │   ├── middle-age.json        #   73个事件
│       │   └── elder.json             #   72个事件
│       ├── lore/                      # 世界观设定文档（5篇，972行）
│       ├── attributes.json            # 7个属性定义
│       ├── talents.json               # 47个天赋
│       ├── items.json                 # 20个物品
│       ├── races.json                 # 7个种族
│       ├── achievements.json          # 41个成就
│       ├── evaluations.json           # 45个评价称号
│       ├── presets.json               # 6个预设
│       ├── rules.json                 # 评分规则
│       └── manifest.json              # 世界包清单（含6条路线）
├── docs/                              # 设计文档（13篇）
├── scripts/                           # 测试与分析脚本（42个）
├── src/
│   ├── engine/                        # 引擎层（核心逻辑）
│   │   ├── core/
│   │   │   ├── SimulationEngine.ts    #   主引擎（1029行）
│   │   │   ├── types.ts               #   类型定义（562行）
│   │   │   └── RandomProvider.ts      #   PRNG（77行）
│   │   ├── modules/
│   │   │   ├── EventModule.ts         #   事件系统（384行）
│   │   │   ├── AttributeModule.ts     #   属性系统（104行）
│   │   │   ├── TalentModule.ts        #   天赋系统（168行）
│   │   │   ├── EvaluatorModule.ts     #   评分系统（236行）
│   │   │   ├── DiceModule.ts          #   D20骰判定（93行）
│   │   │   ├── ConditionDSL.ts        #   条件DSL（280行）
│   │   │   ├── AchievementModule.ts   #   成就系统（35行）
│   │   │   └── ItemModule.ts          #   物品系统（147行）
│   │   ├── world/
│   │   │   ├── WorldInstance.ts       #   世界实例（83行）
│   │   │   └── WorldRegistry.ts       #   世界注册（46行）
│   │   └── index.ts                   #   统一导出（14行）
│   ├── stores/                        # 状态管理层（Pinia）
│   │   ├── gameStore.ts               #   游戏状态+存档（351行）
│   │   ├── worldStore.ts              #   世界管理（50行）
│   │   └── settingsStore.ts           #   全局设置（22行）
│   ├── views/                         # 页面视图（5个）
│   │   ├── HomeView.vue               #   首页（424行）
│   │   ├── SetupView.vue              #   角色创建（609行）
│   │   ├── SimulationView.vue         #   游戏主界面（365行）
│   │   ├── ResultView.vue             #   结局页面（469行）
│   │   └── AchievementView.vue        #   成就展示（117行）
│   ├── components/                    # 可复用组件（9个）
│   │   ├── setup/                     #   TalentDraft + AttributeAllocate
│   │   ├── simulation/                #   EventScene + ChoicePanel + StatusPanel 等
│   │   └── result/                    #   FinalGrade
│   ├── worlds/                        # 世界包数据加载器
│   │   └── sword-and-magic/
│   │       ├── data-loader.ts         #   AJV校验+加载（332行）
│   │       ├── index.ts               #   注册入口（23行）
│   │       └── schemas/shared.json    #   JSON Schema（122行）
│   ├── composables/                   # 组合式函数
│   │   └── useTypewriter.ts           #   打字机效果（48行）
│   ├── utils/                         # 工具函数
│   │   └── export.ts                  #   导出工具（163行）
│   ├── router/index.ts                #   路由配置（41行）
│   ├── styles/                        # 样式文件（3个）
│   ├── App.vue                        #   根组件（116行）
│   └── main.ts                        #   应用入口（33行）
├── tests/                             # 单元测试（1个文件）
├── package.json                       # Vue 3.5.30 + Vite 8.0.1 + TS 5.9.3
├── vite.config.ts                     # 构建配置
└── tsconfig.json                      # TypeScript配置
```

### 1.2 分层评估

项目采用了 **四层架构**：

| 层级 | 目录 | 职责 | 评价 |
|------|------|------|------|
| **引擎层** | `src/engine/` | 游戏核心逻辑（推演、事件、属性、天赋、骰判定、条件DSL） | ★★★★☆ 职责清晰但 SimulationEngine 偏重 |
| **数据层** | `data/` + `src/worlds/` | JSON数据 + Schema校验 + 加载器 | ★★★★☆ 数据驱动设计好，但 races/evaluations 跳过校验 |
| **状态管理层** | `src/stores/` | Pinia store 管理游戏/世界/设置状态 | ★★★★☆ 存档系统完善，但 pendingBranch 恢复不完整 |
| **UI层** | `src/views/` + `src/components/` | Vue3页面和组件 | ★★★★☆ 组件拆分合理，但缺少路由守卫 |

**总体评价**：分层合理，各层职责边界清晰。引擎层与数据层通过 `WorldInstance` 解耦，UI层通过 Pinia store 间接操作引擎，符合单向数据流原则。

---

## 2. 游戏内容现状

### 2.1 已实现的游戏机制

| 机制 | 完成度 | 说明 |
|------|--------|------|
| **属性系统** | ✅ 95% | 7个属性（chr/int/str/mny/spr/mag/luk），分配、修改、峰值追踪均已实现 |
| **天赋系统** | ✅ 90% | 47个天赋，3种稀有度，互斥/替换/继承机制完整 |
| **事件系统** | ✅ 85% | 588个事件，7个年龄段，权重随机，种族/性别变体，分支选择 |
| **种族系统** | ✅ 70% | 7个种族（3个可玩），属性修正、寿命、性别差异；但种族专属事件未接入 |
| **路线系统** | ✅ 80% | 6条职业路线，锚点事件、路线加分；但种族专属路线为空 |
| **骰判定系统** | ✅ 95% | D20骰判定（参考BG3），DC计算、天赋加值 |
| **物品系统** | ✅ 75% | 20个物品，免死效果、属性加成；但 UI 展示简单 |
| **成就系统** | ✅ 60% | 41个成就定义，但只有骨架实现，未解锁追踪 |
| **评分系统** | ✅ 90% | 6个评级（D~SS），多维评分、路线加分、评价称号匹配 |
| **存档系统** | ✅ 85% | 自动存档 + 3个手动存档槽，序列化/反序列化 |
| **Galgame化流程** | ✅ 85% | 三步流程（startYear → resolveBranch → skipYear），分支选择 |

### 2.2 数据量统计

| 数据类型 | 数量 | 文件 |
|----------|------|------|
| 属性 | 7 | `attributes.json` |
| 天赋 | 47 | `talents.json` |
| 事件 | **588** | `events/*.json`（37151行） |
| 物品 | 20 | `items.json` |
| 成就 | 41 | `achievements.json` |
| 评价称号 | 45 | `evaluations.json` |
| 种族 | 7（3可玩） | `races.json` |
| 预设 | 6 | `presets.json` |
| 职业路线 | 6 | `manifest.json` |
| 评分等级 | 6 | `rules.json` |
| 世界观文档 | 5篇（972行） | `lore/*.md` |

### 2.3 骨架/占位内容

1. **种族专属事件未接入**：`races.json` 中 elf 和 goblin 定义了 `eventDir` 字段，但 `data-loader.ts:316` 没有加载种族专属事件的逻辑
2. **种族专属路线为空**：所有种族的 `exclusiveRoutes` 都是空数组
3. **成就解锁追踪缺失**：`AchievementModule.ts` 只有 35 行骨架代码，没有实际的解锁逻辑
4. **4个不可玩种族**：dwarf、beastfolk、seaelf、halfdragon 定义了完整数据但不可选择
5. **物品效果展示简单**：物品的 tooltip 使用原生 HTML `title` 属性，而非自定义组件

---

## 3. 引擎层架构评审

### 3.1 SimulationEngine（`src/engine/core/SimulationEngine.ts`，1029行）

**职责分析**：
- 游戏生命周期管理（init → talent-draft → attribute-allocate → simulating → finished）
- 年度推演循环（startYear → resolveBranch → skipYear）
- 路线系统（路线选择、锚点触发、路线加分）
- HP 系统（恢复、衰减、死亡判定）
- 状态克隆（cloneState）
- 引擎恢复（restoreFromState）

**设计问题**：

1. **职责过重（违反 SRP）**：1029行的单一类承载了太多业务逻辑。路线系统、HP恢复逻辑、birth事件特殊处理都硬编码在这里。

   具体问题位置：
   - `startYear()` 方法（第346~560行）超过200行，包含：HP恢复、年龄递增、路线选择、事件筛选、权重计算、平淡年判断、分支处理等
   - 路线选择逻辑（第411~440行）应该抽取为独立的 RouteModule
   - birth事件使用硬编码过滤 `e.id.startsWith('birth_')`（第410行）

2. **状态管理混乱**：
   - `startYear()` 中先调用 `this.regenHp()` 直接修改 `this.state`（第352行），然后又创建 `newState`（第358行）——混合了可变与不可变模式
   - `cloneState()` 使用展开运算符但只显式克隆部分字段，`pendingBranch`、`effectiveMaxAge`、`result` 等字段未显式处理（第785~809行）

3. **物品获取逻辑重复**：
   - `startYear()` 中第515~528行处理物品获取
   - `resolveBranch()` 中第617~629行也处理物品获取
   - 两处逻辑几乎相同，应抽取为独立方法

**拆分建议**：
- **RouteModule**：路线选择、锚点触发、路线加分
- **HpModule**：HP 恢复、衰减、死亡判定
- **YearCoordinator**：年度推演的流程编排，将 startYear 拆分为多个步骤

### 3.2 EventModule（`src/engine/modules/EventModule.ts`，384行）

**设计质量**：★★★☆☆

- **权重随机选择**：实现了带权重的随机选择算法，支持年龄范围过滤、include/exclude 条件、种族/性别变体，设计合理
- **效果执行分散**：`applyEffect()` 使用 switch-case 处理效果类型（第277~355行），新增效果类型需要修改此方法，违反 OCP
- **trigger_event 效果不安全**：第348行使用 `Object.assign(state, innerState)` 合并状态，可能导致引用覆盖
- **cloneState 重复实现**：第358~382行有独立的 cloneState 方法，与 SimulationEngine 中的实现重复

### 3.3 TalentModule（`src/engine/modules/TalentModule.ts`，168行）

**设计质量**：★★★★★

职责单一清晰，包含天赋池管理、互斥检查、天赋抽取。是所有模块中设计最好的。无明显问题。

### 3.4 AttributeModule（`src/engine/modules/AttributeModule.ts`，104行）

**设计质量**：★★★★☆

属性初始化、修改、峰值追踪。设计简洁，无多余逻辑。唯一的改进空间是属性修改的批量操作可以返回变更摘要。

### 3.5 ConditionDSL（`src/engine/modules/ConditionDSL.ts`，280行）

**设计质量**：★★★☆☆

- **解释器模式**：实现了完整的条件表达式解析器，支持 `&`（与）、`|`（或）、比较操作符
- **语法冗余**：`has.flag.xxx` 和 `flag:xxx` 两种语法表达相同含义（第168~180行）
- **无缓存**：`evaluate()` 每次调用都重新解析 AST（第20~24行），事件筛选时可能对同一条件重复解析上百次
- **关键 Bug**：第91行 `lifespan` 返回 `ctx.state.age` 而非实际最大寿命

### 3.6 EvaluatorModule（`src/engine/modules/EvaluatorModule.ts`，236行）

**设计质量**：★★★☆☆

- **DSL 重复**：第32~62行实现了简化的条件求值 `evalCondition()`，与 ConditionDSL 功能重复
- **硬编码评分**：路线加分逻辑硬编码在 `calculateScore()` 中（第80~120行），新增评分维度需要修改核心代码

### 3.7 DiceModule（`src/engine/modules/DiceModule.ts`，93行）

**设计质量**：★★★★★

D20 骰判定系统，参考《博德之门3》设计。职责单一，代码简洁，实现合理。

### 3.8 模块依赖关系

```
SimulationEngine
  ├── RandomProvider          (注入)
  ├── AttributeModule         (创建)
  ├── TalentModule            (创建)
  ├── EventModule             (创建)
  │     ├── AttributeModule   (注入)
  │     ├── ConditionDSL      (内部创建)
  │     └── RandomProvider    (注入)
  ├── DiceModule              (创建)
  ├── EvaluatorModule         (创建)
  │     └── ConditionDSL      (内部创建，重复)
  ├── AchievementModule       (创建)
  │     └── ConditionDSL      (内部创建，重复)
  └── ItemModule              (创建)
```

**问题**：ConditionDSL 被 EventModule、EvaluatorModule、AchievementModule 各自独立实例化，没有共享实例。同时 ConditionDSL 没有缓存机制，同一条件表达式会被重复解析。

### 3.9 PRNG 系统设计

`RandomProvider`（77行）使用 seed-based 伪随机数生成，保证游戏可重现。设计合理：
- `nextInt(min, max)`、`nextFloat()`、`pickWeighted()` 等接口清晰
- `getState()` / `restoreState()` 支持状态保存和恢复
- 通过构造函数注入 seed，确保同 seed 产生相同序列

**评价**：★★★★★ 设计良好，无问题。

---

## 4. 数据层评审

### 4.1 世界包数据结构

世界包采用 **数据驱动** 设计，所有游戏内容通过 JSON 定义：

```
manifest.json      → WorldManifest（元数据 + 路线定义）
attributes.json    → WorldAttributeDef[]
talents.json       → WorldTalentDef[]
events/*.json      → WorldEventDef[]
items.json         → WorldItemDef[]
achievements.json  → WorldAchievementDef[]
races.json         → WorldRaceDef[]
presets.json       → WorldPresetDef[]
evaluations.json   → WorldEvaluationDef[]
rules.json         → WorldScoringRule[]
```

**评价**：数据结构设计清晰，类型完整。数据与引擎通过接口解耦，新增世界包只需提供对应 JSON 文件和加载器。

### 4.2 Schema 校验覆盖

使用 **AJV** 进行 JSON Schema 校验，通过 `shared.json` 定义共享类型（EventEffect、DiceCheck、EventBranch等）。

**覆盖情况**：

| 数据类型 | Schema 校验 | 备注 |
|----------|-------------|------|
| manifest | ✅ 有 | |
| attributes | ✅ 有 | |
| talents | ✅ 有 | |
| events | ✅ 有 | |
| items | ✅ 有 | |
| achievements | ✅ 有 | |
| presets | ✅ 有 | |
| rules | ✅ 有（特殊处理 maxScore:null） | |
| **races** | ❌ **跳过** | `data-loader.ts:316` 使用 `as unknown as WorldRaceDef[]` |
| **evaluations** | ❌ **跳过** | `data-loader.ts:328` 使用 `as any[]` |

**问题**：races 和 evaluations 的 schema 校验被绕过，格式错误只会在运行时暴露。

### 4.3 数据与引擎的解耦程度

**评价**：★★★★☆

- 引擎通过 `WorldInstance` 接口访问数据，不直接依赖 JSON 文件
- 世界包可以独立更换，引擎无需修改
- 条件 DSL 提供了灵活的数据驱动条件判断
- 唯一的耦合点是 `shared.json` 中的 effect type enum 需要与 `types.ts` 和 `EventModule.ts` 手动保持同步

---

## 5. 状态管理评审

### 5.1 Store 职责划分

| Store | 行数 | 职责 | 评价 |
|-------|------|------|------|
| gameStore | 351 | 游戏状态 + 存档 + 流程控制 | 职责偏重，但尚可接受 |
| worldStore | 50 | 世界注册与选择 | 简洁合理 |
| settingsStore | 22 | 主题 + 自动速度 | 简洁合理 |

### 5.2 存档系统

**序列化逻辑**（`gameStore.ts:55~71`）：
- `Set<string>` → `string[]`
- `Map<string, number>` → `Record<string, number>`
- 基本类型直接展开

**正确性分析**：

| 字段 | 序列化 | 反序列化 | 问题 |
|------|--------|----------|------|
| flags | ✅ `[...state.flags]` | ✅ `new Set(data.flags)` | 无 |
| counters | ✅ `Object.fromEntries()` | ✅ `new Map(Object.entries())` | 无 |
| triggeredEvents | ✅ `[...state.triggeredEvents]` | ✅ `new Set(data.triggeredEvents)` | 无 |
| **pendingBranch** | ⚠️ 靠展开运算符 | ⚠️ 未显式处理 | 可能丢失 |
| **effectiveMaxAge** | ⚠️ 靠展开运算符 | ⚠️ 未显式处理 | 可能丢失 |
| **result** | ⚠️ 靠展开运算符 | ⚠️ 未显式处理 | 可能丢失 |

### 5.3 状态恢复的完整性

`restoreFromState()`（`SimulationEngine.ts:45~73`）：
- ✅ 恢复了随机数种子
- ✅ 恢复了 `initialStrRegen`
- ✅ 恢复了 `routeAnchorsTriggered`（从 `triggeredEvents` 重建）
- ✅ 恢复了 `effectiveMaxAge`
- ❌ **未恢复 `activeRoute`**：如果存档时玩家在某条路线上，恢复后可能丢失路线状态
- ❌ **未恢复内部推演状态**：如 `pendingYearEvent` 等

---

## 6. 类型系统一致性

### 6.1 EventEffect 类型三处定义不一致

这是本次评审发现的最严重的类型一致性问题：

**types.ts（第137行）定义的 type 值**：
```
modify_attribute, set_attribute, add_talent, trigger_event,
set_flag, remove_flag, modify_hp, set_counter, modify_counter, grant_item
```

**shared.json（第9行）定义的 enum 值**：
```
modify_attribute, set_attribute, add_talent, trigger_event,
set_flag, remove_flag, modify_hp, modify_max_hp_bonus, set_counter,
modify_counter, grant_item, trigger_on_age
```

**EventModule.ts applyEffect() 处理的 case**：
```
modify_attribute, set_attribute, add_talent, trigger_event,
set_flag, remove_flag, modify_hp, set_counter, modify_counter
```

**差异**：
| Effect Type | types.ts | shared.json | EventModule.ts | 数据中实际使用 |
|-------------|----------|-------------|----------------|----------------|
| modify_max_hp_bonus | ❌ | ✅ | ❌ | ✅ (youth.json) |
| trigger_on_age | ❌ | ✅ | ❌ | ✅ (talents.json) |
| grant_item | ✅ | ✅ | ❌ (空实现) | ✅ |

`modify_max_hp_bonus` 和 `trigger_on_age` 在数据中实际使用，但引擎代码中完全没有处理逻辑，会导致 **静默失败**——玩家获得这些效果时没有任何反应。

### 6.2 Zod Schema 与 TypeScript 类型

项目使用 AJV（非 Zod）进行 Schema 校验。TypeScript 类型定义在 `types.ts`，JSON Schema 定义在 `schemas/shared.json`。两者需要 **手动保持同步**，没有自动化的类型生成流程。

**建议**：从 JSON Schema 自动生成 TypeScript 类型（如使用 `json-schema-to-typescript`），或从 TypeScript 类型生成 JSON Schema（如使用 `ts-json-schema-generator`），消除手动同步的隐患。

---

## 7. UI/组件层评审

### 7.1 组件结构

```
App.vue                          # 根组件（导航栏 + 路由出口）
├── views/
│   ├── HomeView.vue             # 首页（世界选择、存档管理）
│   ├── SetupView.vue            # 角色创建（4步向导）
│   │   ├── TalentDraft.vue      #   天赋抽取
│   │   └── AttributeAllocate.vue #   属性分配
│   ├── SimulationView.vue       # 游戏主界面
│   │   ├── EventScene.vue       #   事件场景（打字机效果）
│   │   ├── ChoicePanel.vue      #   分支选择
│   │   ├── StatusPanel.vue      #   状态面板
│   │   ├── CompactStatus.vue    #   紧凑状态栏
│   │   └── EventLog.vue         #   历史日志
│   ├── ResultView.vue           # 结局页面
│   │   └── FinalGrade.vue       #   评级展示
│   └── AchievementView.vue      # 成就展示
```

**评价**：组件拆分粒度合理，每个组件职责明确。但缺少 `setup/` 和 `simulation/` 之间的共享组件（如通用的属性展示组件）。

### 7.2 路由设计

```typescript
/                              → HomeView      （首页）
/setup/:worldId                → SetupView     （角色创建）
/play/:worldId/:playId         → SimulationView （游戏主界面）
/result/:worldId/:playId       → ResultView    （结局页面）
/achievements                  → AchievementView（成就展示）
```

**问题**：
1. **无全局路由守卫**：各组件自行检查状态合法性，存在遗漏风险
2. **playId 稳定性**：页面刷新后需要从 localStorage 恢复并更新 URL（`SimulationView.vue` 中有处理但逻辑复杂）
3. **缺少 404 路由**：未定义 fallback 路由

### 7.3 响应式适配

- 使用 CSS 变量实现主题切换（dark/light）
- 使用 `rem` 和 `vh/vw` 单位进行布局
- 触摸事件友好（移动端可用）
- 但没有使用 CSS media queries 做断点适配，主要依赖弹性布局

---

## 8. 潜在 Bug 列表

### Critical（严重）

| # | 文件 | 行号 | 问题描述 | 影响 | 修复建议 |
|---|------|------|----------|------|----------|
| C1 | `EventModule.ts` | 277~355 | `applyEffect()` 未处理 `modify_max_hp_bonus` 和 `trigger_on_age` 两种效果类型 | 数据中实际使用了这些效果类型，会导致静默失败——玩家获得这些效果时无任何反应 | 在 switch-case 中添加对应分支；同时在 `types.ts` 中补充类型定义 |
| C2 | `ConditionDSL.ts` | 91 | `lifespan` 条件返回 `ctx.state.age`（当前年龄）而非最大寿命 | 所有使用 `lifespan` 的条件判断结果错误 | 改为 `ctx.state.effectiveMaxAge ?? 100` |

### High（高）

| # | 文件 | 行号 | 问题描述 | 影响 | 修复建议 |
|---|------|------|----------|------|----------|
| H1 | `SimulationEngine.ts` | 45~73 | `restoreFromState()` 未恢复 `activeRoute`（当前激活路线） | 存档恢复后玩家可能丢失路线状态，后续事件选择受影响 | 从 `state.flags` 或 `state.triggeredEvents` 重建 activeRoute |
| H2 | `SimulationEngine.ts` | 785~809 | `cloneState()` 未显式克隆 `pendingBranch`、`effectiveMaxAge`、`result` | 虽然展开运算符会浅拷贝这些字段，但 `pendingBranch` 内含数组引用，可能导致状态不一致 | 显式深拷贝 pendingBranch；或在类型定义中标注哪些字段需要深拷贝 |
| H3 | `EventModule.ts` | 348 | `trigger_event` 效果使用 `Object.assign(state, innerState)` 合并状态 | 浅合并可能覆盖引用类型的字段（如 attributes 对象的引用），导致不可预期的状态变化 | 改为逐字段合并或使用 structuredClone |
| H4 | `data-loader.ts` | 316 | `races` 数据跳过 Schema 校验，使用强制类型转换 | races.json 格式错误只在运行时暴露，开发期间无法提前发现 | 为 races 创建 JSON Schema，纳入校验流程 |
| H5 | `data-loader.ts` | 328 | `evaluations` 使用 `as any[]` 绕过类型检查 | 同上 | 为 evaluations 创建 JSON Schema 和 TypeScript 类型 |

### Medium（中）

| # | 文件 | 行号 | 问题描述 | 影响 | 修复建议 |
|---|------|------|----------|------|----------|
| M1 | `SimulationEngine.ts` | 346~560 | `startYear()` 超过200行，混合了可变与不可变状态操作 | 代码难以理解和维护，容易引入 bug | 拆分为多个私有方法：selectRoute()、filterEvents()、calculateWeights() 等 |
| M2 | `SimulationEngine.ts` | 410 | birth 事件使用硬编码 `e.id.startsWith('birth_')` 过滤 | 如果事件 ID 命名不规范，会导致 birth 事件选择错误 | 使用事件的 `priority` 或 `tag` 字段替代硬编码过滤 |
| M3 | `EvaluatorModule.ts` | 32~62 | `evalCondition()` 重新实现了简化版条件求值，与 ConditionDSL 功能重复 | 两处条件求值逻辑可能产生不一致的结果 | 统一使用 ConditionDSL |
| M4 | `gameStore.ts` | 207~208 | `loadSave()` 中直接使用反序列化的 state 而非从 engine 获取 | state 和 engine.state 可能不一致 | 改为 `state.value = engine.value.getState()` |
| M5 | `SimulationView.vue` | — | 页面刷新后状态恢复逻辑复杂，需要手动同步 URL 和 localStorage | 恢复失败时用户看到空白页面 | 添加全局路由守卫统一处理 |
| M6 | `EventModule.ts` | 358~382 | EventModule 有独立的 `cloneState()` 实现，与 SimulationEngine 中的重复 | 两处克隆逻辑可能不同步 | 统一为一处实现 |

### Low（低）

| # | 文件 | 行号 | 问题描述 | 影响 | 修复建议 |
|---|------|------|----------|------|----------|
| L1 | `ConditionDSL.ts` | 20~24 | `evaluate()` 每次调用都重新解析 AST，无缓存 | 事件筛选时同一条件被重复解析，性能浪费 | 添加 Map 缓存已解析的 AST |
| L2 | `ConditionDSL.ts` | 168~180 | `has.flag.xxx` 和 `flag:xxx` 两种语法表达相同含义 | 维护两套解析逻辑，增加复杂度 | 统一为一种语法 |
| L3 | `TalentDraft.vue` | — | `flipped` 变量声明但未使用 | 死代码 | 删除或实现翻转动画 |
| L4 | `SimulationView.vue` | — | 平淡年自动跳过，用户无法查看属性变化 | 用户可能错过重要的状态变化信息 | 添加"查看详情"选项 |
| L5 | `EventScene.vue` | — | 打字机效果无跳过按钮 | 用户无法快速跳过已读文字 | 添加点击/按键跳过功能 |
| L6 | `ChoicePanel.vue` | — | 条件求值 `evaluateCondition()` 在组件中重新实现 | 与引擎层 ConditionDSL 逻辑可能不一致 | 使用引擎的 ConditionDSL 实例 |
| L7 | `AchievementView.vue` | — | 所有成就以相同样式显示，无已解锁/未解锁区分 | 用户不知道自己已经解锁了哪些成就 | 从 gameStore 获取已解锁成就列表并区分显示 |

---

## 9. 开发方向建议

### 9.1 短期（1~2周）

1. **修复 Critical Bug**：
   - 在 `types.ts` 中补充 `modify_max_hp_bonus` 和 `trigger_on_age` 类型定义
   - 在 `EventModule.applyEffect()` 中实现这两种效果的处理逻辑
   - 修复 `ConditionDSL.ts:91` 的 `lifespan` 返回值错误

2. **补全 Schema 校验**：
   - 为 `races.json` 和 `evaluations.json` 创建 JSON Schema
   - 消除 `data-loader.ts` 中的 `as any` 和强制类型转换

3. **改善存档恢复**：
   - `restoreFromState()` 补充 `activeRoute` 的恢复逻辑
   - 显式处理 `pendingBranch` 的序列化和反序列化

### 9.2 中期（1~2个月）

1. **引擎层重构**：
   - 拆分 `SimulationEngine`：抽取 RouteModule、HpModule
   - 将 `startYear()` 方法拆分为多个职责单一的私有方法
   - 统一 `cloneState()` 为单一实现
   - 为 ConditionDSL 添加 AST 缓存

2. **种族系统完善**：
   - 实现 `data-loader.ts` 中加载种族专属事件的逻辑
   - 开放更多可玩种族（dwarf、beastfolk 等）
   - 实现种族专属路线

3. **成就系统激活**：
   - 实现 AchievementModule 的解锁追踪逻辑
   - 成就页面区分已解锁/未解锁状态
   - 添加成就解锁时的通知动画

4. **UI 体验提升**：
   - 添加打字机效果跳过按钮
   - 平淡年展示简要状态变化
   - 添加全局路由守卫
   - 物品 tooltip 改为自定义组件

### 9.3 长期（3~6个月）

1. **新增游戏机制**：
   - **关系系统**：NPC 好感度、结盟、敌对
   - **技能树**：基于职业路线的技能解锁
   - **多结局系统**：基于累积选择的不同结局
   - **遗产系统**：天赋继承、属性传承，实现"重生"核心概念
   - **竞技/排行**：评分排行榜

2. **新世界包开发**：
   - **赛博朋克**：科技+黑客路线，不同属性体系
   - **仙侠修仙**：修炼境界、门派路线
   - **末日废土**：生存+变异路线

3. **技术架构升级**：
   - **类型自动化**：从 JSON Schema 生成 TypeScript 类型，消除手动同步
   - **效果系统重构**：使用注册表模式替代 switch-case，新增效果类型只需注册
   - **事件编辑器**：可视化的 JSON 事件编辑工具，降低内容创作门槛
   - **自动化测试**：完善单元测试覆盖，添加 CI/CD 流水线
   - **国际化（i18n）**：支持多语言

4. **用户体验升级**：
   - 音效/背景音乐
   - 事件插图（AI 生成或社区贡献）
   - 移动端 PWA 支持
   - 分享功能（生成图片/链接分享结局）

---

## 附录：代码统计

| 分类 | 文件数 | 总行数 |
|------|--------|--------|
| 引擎层 | 12 | ~2,910 |
| 状态管理 | 3 | ~423 |
| UI层（views + components） | 14 | ~3,359 |
| 数据层（JSON） | 17 | ~38,400 |
| 工具/配置 | 5 | ~300 |
| 测试脚本 | 42 | ~4,000 |
| **合计** | **~93** | **~49,000** |

---

> 报告结束。共发现 Critical 级问题 2 个、High 级 5 个、Medium 级 6 个、Low 级 7 个。最紧迫的问题是 EventEffect 类型系统不一致（C1）和 ConditionDSL 中 lifespan 的错误返回值（C2）。
