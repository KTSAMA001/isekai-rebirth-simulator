# 异世界重生模拟器 — 项目规划文档

> **项目代号**: isekai-sim  
> **技术栈**: Vue 3 + Vite + TypeScript  
> **架构风格**: 纯前端、数据驱动、模块化多世界  
> **最后更新**: 2026-03-29  

---

## 目录

1. [项目目录结构](#1-项目目录结构)
2. [核心架构设计](#2-核心架构设计)
3. [多世界系统设计](#3-多世界系统设计)
4. [游戏引擎核心模块设计](#4-游戏引擎核心模块设计)
5. [前端页面设计](#5-前端页面设计)
6. [基础世界「剑与魔法」完整数据设计](#6-基础世界剑与魔法完整数据设计)
7. [开发分阶段计划](#7-开发分阶段计划)
8. [关键技术决策和理由](#8-关键技术决策和理由)

---

## 1. 项目目录结构

```
isekai-sim/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── env.d.ts
│
├── public/
│   ├── favicon.ico
│   └── worlds/                        # 世界包资源（静态部署）
│       └── sword-and-magic/           # 剑与魔法世界
│           ├── manifest.json          # 世界包清单
│           ├── attributes.json        # 属性定义
│           ├── talents.json           # 天赋库
│           ├── events.json            # 事件库
│           ├── achievements.json      # 成就定义
│           ├── presets.json           # 角色预设
│           ├── rules.json             # 评分规则 & 特殊机制
│           └── assets/                # 世界专属静态资源
│               └── bg.webp
│
├── src/
│   ├── main.ts                        # 应用入口
│   ├── App.vue                        # 根组件
│   ├── router/
│   │   └── index.ts                   # Vue Router 配置
│   │
│   ├── engine/                        # ========== 游戏引擎（与 UI 无关） ==========
│   │   ├── core/
│   │   │   ├── types.ts               # 所有核心接口 & 类型定义
│   │   │   ├── GameState.ts           # 游戏状态管理类
│   │   │   ├── SimulationEngine.ts    # 推演引擎（年度循环核心）
│   │   │   └── RandomProvider.ts      # 可控随机数生成器（seed 支持）
│   │   │
│   │   ├── modules/
│   │   │   ├── AttributeModule.ts     # 属性系统
│   │   │   ├── TalentModule.ts        # 天赋系统
│   │   │   ├── EventModule.ts         # 事件系统
│   │   │   ├── ConditionDSL.ts        # 条件 DSL 解析器 & 求值器
│   │   │   ├── EvaluatorModule.ts     # 总评/评分系统
│   │   │   └── AchievementModule.ts   # 成就系统
│   │   │
│   │   └── world/
│   │       ├── WorldRegistry.ts       # 世界注册中心
│   │       ├── WorldLoader.ts         # 世界包加载器
│   │       ├── WorldValidator.ts      # 世界包校验器（JSON Schema）
│   │       └── WorldInstance.ts       # 已加载世界的运行时实例
│   │
│   ├── worlds/                        # ========== 内置世界包（TypeScript 导出） ==========
│   │   └── sword-and-magic/
│   │       ├── index.ts               # 世界注册入口
│   │       ├── attributes.ts
│   │       ├── talents.ts
│   │       ├── events.ts
│   │       ├── achievements.ts
│   │       ├── presets.ts
│   │       └── rules.ts
│   │
│   ├── stores/                        # ========== Pinia 状态管理 ==========
│   │   ├── gameStore.ts               # 当前游戏局状态
│   │   ├── worldStore.ts              # 已安装的世界列表 & 选中世界
│   │   ├── settingsStore.ts           # 全局设置（音量、主题等）
│   │   └── achievementStore.ts        # 跨世界成就进度（localStorage）
│   │
│   ├── composables/                   # ========== Vue Composables ==========
│   │   ├── useGameEngine.ts           # 封装引擎调用，响应式桥接
│   │   ├── useSimulation.ts           # 推演控制（开始/暂停/跳过/自动）
│   │   └── useWorld.ts                # 世界相关操作
│   │
│   ├── components/                    # ========== UI 组件 ==========
│   │   ├── common/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── Modal.vue
│   │   │   ├── ProgressBar.vue
│   │   │   ├── StarRating.vue
│   │   │   ├── TalentCard.vue
│   │   │   └── AttributeBar.vue
│   │   │
│   │   ├── world/
│   │   │   ├── WorldCard.vue          # 世界选择卡片
│   │   │   ├── WorldSelector.vue      # 世界选择器
│   │   │   └── WorldIntro.vue         # 世界介绍/剧情序幕
│   │   │
│   │   ├── setup/
│   │   │   ├── TalentDraft.vue        # 天赋抽取界面
│   │   │   ├── TalentSelect.vue       # 天赋选择界面（10选3）
│   │   │   ├── AttributeAllocate.vue  # 属性分配界面
│   │   │   └── PresetSelect.vue       # 角色预设选择
│   │   │
│   │   ├── simulation/
│   │   │   ├── YearPanel.vue          # 单年事件面板
│   │   │   ├── EventLog.vue           # 事件日志流
│   │   │   ├── StatusPanel.vue        # 当前属性面板
│   │   │   ├── Timeline.vue           # 生命时间线
│   │   │   ├── YearSummary.vue        # 年度小结
│   │   │   └── SimulationControls.vue # 播放控制（速度/暂停/跳过）
│   │   │
│   │   ├── result/
│   │   │   ├── FinalGrade.vue         # 最终评级面板
│   │   │   ├── AttributeSummary.vue   # 属性峰值统计
│   │   │   ├── LifeReview.vue         # 人生回顾（关键事件）
│   │   │   ├── AchievementUnlock.vue  # 成就解锁展示
│   │   │   └── ShareCard.vue          # 分享卡片
│   │   │
│   │   └── achievement/
│   │       ├── AchievementList.vue    # 成就列表
│   │       └── AchievementToast.vue   # 成就解锁提示
│   │
│   ├── views/                         # ========== 页面视图 ==========
│   │   ├── HomeView.vue               # 首页（世界选择）
│   │   ├── SetupView.vue              # 角色创建（天赋+属性）
│   │   ├── SimulationView.vue         # 推演主界面
│   │   ├── ResultView.vue             # 结算页面
│   │   └── AchievementView.vue        # 成就总览
│   │
│   ├── styles/                        # ========== 样式 ==========
│   │   ├── variables.css              # CSS 变量 & 主题
│   │   ├── global.css                 # 全局样式
│   │   ├── animations.css             # 动画定义
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   ├── utils/
│   │   ├── id.ts                      # UUID 生成
│   │   ├── storage.ts                 # localStorage 封装
│   │   └── format.ts                  # 数字/文本格式化工具
│   │
│   └── assets/
│       └── images/
│
├── tests/                             # ========== 测试 ==========
│   ├── engine/
│   │   ├── ConditionDSL.test.ts
│   │   ├── EventModule.test.ts
│   │   ├── SimulationEngine.test.ts
│   │   └── EvaluatorModule.test.ts
│   ├── world/
│   │   └── WorldLoader.test.ts
│   └── setup.ts
│
├── scripts/
│   └── build-world.ts                 # 世界包构建脚本（JSON → TS 验证 → 拷贝）
│
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

**目录设计原则：**

- `engine/` 是纯 TypeScript 逻辑层，不依赖 Vue，可独立测试
- `worlds/` 存放内置世界数据，`public/worlds/` 存放外部世界包
- `components/` 按业务功能域分组，每组对应一个游戏阶段
- `stores/` 用 Pinia 做状态桥梁，连接引擎层与 UI 层

---

## 2. 核心架构设计

### 2.1 整体架构分层

```
┌─────────────────────────────────────────────┐
│                   Views                      │  页面层
│         (Home / Setup / Simulation / Result) │
├─────────────────────────────────────────────┤
│                 Components                   │  组件层
│     (TalentDraft / YearPanel / FinalGrade)  │
├─────────────────────────────────────────────┤
│               Composables                   │  组合式 API
│       (useGameEngine / useSimulation)       │
├─────────────────────────────────────────────┤
│               Pinia Stores                   │  状态层
│    (gameStore / worldStore / settingsStore)  │
├─────────────────────────────────────────────┤
│             Game Engine (core)               │  引擎层 ★
│  ┌───────────────────────────────────────┐  │
│  │  SimulationEngine (编排中心)          │  │
│  │    ├── AttributeModule                │  │
│  │    ├── TalentModule                   │  │
│  │    ├── EventModule                    │  │
│  │    │     └── ConditionDSL             │  │
│  │    ├── EvaluatorModule                │  │
│  │    └── AchievementModule              │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│               World System                   │  世界层
│    (WorldRegistry / WorldLoader / World)     │
├─────────────────────────────────────────────┤
│              Storage (localStorage)          │  持久层
│         (成就 / 设置 / 历史记录)             │
└─────────────────────────────────────────────┘
```

### 2.2 模块关系图

```
                    ┌──────────────┐
                    │ WorldRegistry│
                    └──────┬───────┘
                           │ 注册/查询
                    ┌──────▼───────┐
                    │ WorldLoader  │
                    └──────┬───────┘
                           │ 加载 & 校验
                    ┌──────▼───────┐
                    │ WorldInstance│ ◄─── 包含: attributes, talents, events,
                    └──────┬───────┘       achievements, rules, presets
                           │ 注入
              ┌────────────▼────────────┐
              │    SimulationEngine      │
              │    (编排中心 / Mediator)  │
              └──┬────┬────┬────┬────┬───┘
                 │    │    │    │    │
           ┌─────▼┐ ┌▼───┐ ┌▼──┐ ┌▼──┐ ┌▼──────────┐
           │Attr  │ │Tlnt│ │Evt│ │Evl│ │Achievement│
           │Module│ │Mod │ │Mod│ │Mod│ │Module     │
           └──────┘ └────┘ └───┘ └───┘ └───────────┘
                 ▲              │
                 │   ┌──────────┘
                 │   │
           ┌─────▼───▼──┐
           │ConditionDSL │  (被 EventModule 和 TalentModule 依赖)
           └────────────┘
```

### 2.3 核心类职责说明

| 类/模块 | 职责 | 依赖 |
|---------|------|------|
| **SimulationEngine** | 编排一整局游戏的生命周期：初始化 → 天赋抽取 → 属性分配 → 年度循环 → 结算。持有 `GameState`，协调各子模块。 | 所有 Module |
| **GameState** | 纯数据对象，记录当前局的所有状态：角色属性、年龄、已触发事件、天赋、成就进度、随机种子。不可变式更新（每次操作返回新状态）。 | 无 |
| **AttributeModule** | 管理属性的定义、初始值分配、运行时修改、峰值追踪。根据 WorldInstance 的属性配置动态工作。 | GameState, WorldInstance |
| **TalentModule** | 天赋抽取（概率 + 互斥 + 替换）、天赋效果触发（条件判断 + 属性修改）、天赋继承。 | GameState, ConditionDSL |
| **EventModule** | 按年龄筛选候选事件 → 条件过滤 → 权重随机 → 执行效果 → 处理分支链。 | GameState, ConditionDSL, WorldInstance |
| **ConditionDSL** | 解析条件字符串，在 GameState 上下文中求值。 | GameState |
| **EvaluatorModule** | 根据 WorldInstance 的评分规则计算最终得分和评级。 | GameState, WorldInstance |
| **AchievementModule** | 检查成就条件，记录解锁状态，跨局持久化。 | GameState |
| **WorldRegistry** | 注册表，管理可用世界列表（内置 + 外部加载）。 | WorldLoader |
| **WorldLoader** | 加载世界包 JSON，通过 WorldValidator 校验，创建 WorldInstance。 | WorldValidator |
| **WorldInstance** | 一个世界运行时的完整数据快照。纯数据，无行为方法。 | 无 |
| **WorldValidator** | JSON Schema 校验世界包数据完整性。 | 无 |
| **RandomProvider** | 种子化随机数生成器，支持确定性回放。 | 无 |

### 2.4 数据流

```
用户操作 → Composable → Store → Engine
                                      │
                                      ▼
                               SimulationEngine
                              /    |    |    \
                             ▼     ▼    ▼     ▼
                          Attr  Talent Event Eval
                             \    |    |    /
                              ▼   ▼    ▼   ▼
                           GameState (新)
                                      │
                                      ▼
                               Store (响应式更新)
                                      │
                                      ▼
                               Vue 组件重新渲染
```

**核心设计理念**：`GameState` 是唯一的 truth source。所有模块都是纯函数式：输入旧 State + 参数，输出新 State。引擎层只做编排，不持有业务逻辑。这使得：
- 测试极其简单（给定输入断言输出）
- 推演可回放（相同 seed + 相同选择 = 相同结果）
- 未来可扩展自动模拟（AI 选天赋/属性）

---

## 3. 多世界系统设计

### 3.1 世界接口定义

```typescript
// ==================== 世界包数据格式 ====================

/** 属性定义 */
interface WorldAttributeDef {
  id: string;                // 唯一标识，如 "magic_power"
  name: string;              // 显示名称，如 "魔力"
  icon: string;              // 图标 emoji 或图标名
  description: string;       // 属性描述
  color: string;             // 显示颜色 hex
  min: number;               // 最小值，默认 0
  max: number;               // 最大值，默认 10
  defaultValue: number;      // 默认值，默认 0
  hidden?: boolean;          // 是否隐藏（如生命值、年龄）
  group?: string;            // 属性分组，如 "physical" / "magical"
}

/** 天赋稀有度 */
type TalentRarity = 'common' | 'rare' | 'legendary';

/** 天赋定义 */
interface WorldTalentDef {
  id: string;                // 唯一标识
  name: string;              // 天赋名称
  description: string;       // 天赋描述（支持 {attr} 变量）
  rarity: TalentRarity;      // 稀有度
  icon: string;              // 图标
  effects: TalentEffect[];   // 天赋效果列表
  conditions?: string;       // 天赋生效条件（Condition DSL）
  mutuallyExclusive?: string[];  // 互斥天赋 ID 列表
  replaceTalent?: string;    // 替换天赋（如果存在则替换为目标天赋）
  inheritable?: boolean;     // 是否可继承，默认 false
  flavorText?: string;       // 风味文本
}

/** 天赋效果 */
interface TalentEffect {
  type: 'modify_attribute' | 'add_event' | 'trigger_on_age' | 'multiply_attribute';
  target: string;            // 目标属性 ID 或事件 ID
  value?: number;            // 修改值
  age?: number;              // 触发年龄（trigger_on_age）
  condition?: string;        // 效果生效条件
  probability?: number;      // 触发概率 0~1
  description: string;       // 效果描述
}

/** 事件定义 */
interface WorldEventDef {
  id: string;                // 唯一标识
  title: string;             // 事件标题
  description: string;       // 事件描述（支持 {attr}、{age}、{name} 变量）
  minAge: number;            // 最小触发年龄
  maxAge: number;            // 最大触发年龄
  weight: number;            // 触发权重（越大越常见）
  include?: string;          // 包含条件（Condition DSL，满足才触发）
  exclude?: string;          // 排除条件（满足则不触发）
  effects: EventEffect[];    // 事件效果列表
  branches?: EventBranch[];  // 分支事件
  isBad?: boolean;           // 是否为负面事件（用于统计）
  tag?: string;              // 事件标签（如 "adventure" "romance" "combat"）
  unique?: boolean;          // 是否唯一事件（每局只触发一次）
}

/** 事件效果 */
interface EventEffect {
  type: 'modify_attribute' | 'set_attribute' | 'add_talent' | 'trigger_event' | 'set_flag' | 'modify_hp';
  target: string;            // 目标属性 ID
  value: number;             // 修改值（可正可负）
  probability?: number;      // 概率 0~1，默认 1
  condition?: string;        // 效果生效条件
  description?: string;      // 效果文本描述（显示在事件日志中）
}

/** 事件分支 */
interface EventBranch {
  id: string;                // 分支 ID
  title: string;             // 分支标题（选项文字）
  description: string;       // 选择此分支的描述
  probability?: number;      // 分支选择概率（自动选择时用）
  effects: EventEffect[];    // 分支独有效果
  nextEvents?: string[];     // 分支后续事件 ID 列表
}

/** 成就定义 */
interface WorldAchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  hidden: boolean;           // 是否隐藏成就
  condition: string;         // 解锁条件（Condition DSL）
  category: string;          // 分类
  reward?: string;           // 解锁奖励描述
}

/** 评分规则 */
interface WorldScoringRule {
  formula: string;           // 评分公式（支持 attribute.peak.id, lifespan 等）
  /** 评级分段 */
  grades: {
    minScore: number;
    maxScore: number;
    grade: string;           // 评级标识，如 "S" "A" "B" "C" "D"
    title: string;           // 评级标题
    description: string;     // 评级描述
  }[];
}

/** 角色预设 */
interface WorldPresetDef {
  id: string;
  name: string;              // 角色名
  title: string;             // 称号
  description: string;       // 角色背景
  attributes: Record<string, number>;  // 固定属性分配
  talents?: string[];        // 固定天赋
  locked: boolean;           // 是否需要解锁
  unlockCondition?: string;  // 解锁条件
}

/** 世界包清单（manifest.json） */
interface WorldManifest {
  id: string;                // 世界唯一标识，如 "sword-and-magic"
  name: string;              // 世界名称
  subtitle: string;          // 副标题
  description: string;       // 世界介绍
  version: string;           // 语义化版本 "1.0.0"
  author: string;            // 作者
  icon: string;              // 世界图标
  banner: string;            // 横幅图片路径
  theme: {                   // 世界主题色
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  tags: string[];            // 标签
  maxAge: number;            // 最大寿命
  initialPoints: number;     // 初始可分配属性点
  talentDraftCount: number;  // 天赋抽取数量
  talentSelectCount: number; // 天赋可选数量
  files: {                   // 数据文件引用
    attributes: string;
    talents: string;
    events: string;
    achievements: string;
    presets: string;
    rules: string;
  };
}
```

### 3.2 世界运行时实例

```typescript
/** 已加载世界的运行时表示 */
interface WorldInstance {
  manifest: WorldManifest;
  attributes: WorldAttributeDef[];
  talents: WorldTalentDef[];
  events: WorldEventDef[];
  achievements: WorldAchievementDef[];
  presets: WorldPresetDef[];
  scoringRule: WorldScoringRule;
  /** 索引映射，加速查找 */
  index: {
    attributesById: Map<string, WorldAttributeDef>;
    talentsById: Map<string, WorldTalentDef>;
    eventsById: Map<string, WorldEventDef>;
    eventsByAgeRange: Map<string, WorldEventDef[]>; // key: "minAge-maxAge"
  };
}
```

### 3.3 世界加载机制

```
用户选择世界
    │
    ▼
WorldRegistry.get(worldId)
    │
    ├── 内置世界 → 直接从 worlds/ 导入 TypeScript 模块
    │
    └── 外部世界 → WorldLoader.load(manifestUrl)
                       │
                       ▼
                  fetch manifest.json
                       │
                       ▼
                  WorldValidator.validate(manifest)
                       │
                       ├── 失败 → 报错，拒绝加载
                       │
                       └── 成功 → 并行加载所有数据文件
                                       │
                                       ▼
                                  构建 WorldInstance（含索引）
                                       │
                                       ▼
                                  WorldRegistry.register(instance)
```

**内置 vs 外部世界**：
- 内置世界直接打包进应用，无需网络请求
- 外部世界通过 URL 加载（支持本地 JSON、CDN、用户上传）
- 两者的运行时表现完全一致，差异仅在加载方式

### 3.4 世界包 JSON Schema 校验

WorldValidator 使用 JSON Schema（通过 `ajv` 库）进行校验：
- 属性 ID 不能重复
- 天赋 ID 不能重复，互斥引用的天赋必须存在
- 事件 ID 不能重复，分支引用的事件必须存在
- 评分公式中引用的属性必须已定义
- 角色预设引用的属性和天赋必须已定义
- manifest 的文件路径必须存在

---

## 4. 游戏引擎核心模块设计

### 4.1 GameState — 游戏状态

```typescript
/** 游戏状态（不可变，每次操作返回新对象） */
interface GameState {
  /** 元信息 */
  meta: {
    worldId: string;
    seed: number;             // 随机种子
    playId: string;           // 本局唯一 ID
    startedAt: number;        // 开始时间戳
    presetId?: string;        // 使用的角色预设 ID
  };

  /** 角色 */
  character: {
    name: string;
    gender?: string;
  };

  /** 当前属性值 */
  attributes: Record<string, number>;

  /** 属性历史记录（用于峰值追踪和图表） */
  attributeHistory: {
    age: number;
    values: Record<string, number>;
  }[];

  /** 属性峰值 */
  attributePeaks: Record<string, number>;

  /** 天赋 */
  talents: {
    selected: string[];       // 本局选中的天赋 ID
    draftPool: string[];      // 本局抽到的天赋池
    inherited: string[];      // 继承的天赋 ID
  };

  /** 当前年龄 */
  age: number;

  /** 生命值（隐藏属性） */
  hp: number;

  /** 最大生命值 */
  maxHp: number;

  /** 标记集合（事件可用 flag 记录状态） */
  flags: Set<string>;

  /** 已触发的事件 ID 集合（用于 unique 事件去重） */
  triggeredEvents: Set<string>;

  /** 事件日志 */
  eventLog: {
    age: number;
    eventId: string;
    title: string;
    description: string;
    effects: string[];        // 效果文本
    branchId?: string;        // 选择的分支
  }[];

  /** 成就进度（本局） */
  achievements: {
    unlocked: string[];
    progress: Record<string, number>;  // 计数型进度
  };

  /** 游戏阶段 */
  phase: 'init' | 'talent-draft' | 'attribute-allocate' | 'simulating' | 'finished';

  /** 最终结算（phase=finished 时填充） */
  result?: {
    score: number;
    grade: string;
    gradeTitle: string;
    gradeDescription: string;
    lifespan: number;
  };
}
```

### 4.2 RandomProvider — 可控随机

```typescript
class RandomProvider {
  private seed: number;
  private state: number;

  constructor(seed: number);

  /** 返回 [0, 1) 的浮点数 */
  next(): number;

  /** 返回 [min, max] 的整数 */
  nextInt(min: number, max: number): number;

  /** 从数组中按权重随机选一个 */
  weightedPick<T>(items: T[], getWeight: (item: T) => number): T;

  /** 从数组中随机选 N 个不重复元素 */
  pickN<T>(items: T[], count: number): T[];

  /** 洗牌 */
  shuffle<T>(items: T[]): T[];

  /** 按概率触发（probability 概率返回 true） */
  chance(probability: number): boolean;

  /** 保存/恢复状态（用于回放） */
  saveState(): number;
  restoreState(state: number): void;
}
```

使用 **Mulberry32** 算法作为 PRNG，足够轻量且分布均匀。

### 4.3 AttributeModule — 属性模块

```typescript
class AttributeModule {
  constructor(private world: WorldInstance);

  /** 初始化属性（全部置为默认值） */
  initAttributes(): Record<string, number>;

  /** 分配初始属性点 */
  allocate(
    currentAttrs: Record<string, number>,
    allocation: Record<string, number>,
    totalPoints: number
  ): { attributes: Record<string, number>; remaining: number };

  /** 修改属性值（带范围裁剪） */
  modify(
    currentAttrs: Record<string, number>,
    peaks: Record<string, number>,
    modifications: { attribute: string; value: number }[]
  ): { attributes: Record<string, number>; peaks: Record<string, number> };

  /** 获取属性快照 */
  snapshot(attrs: Record<string, number>, age: number): AttributeSnapshot;
}
```

### 4.4 TalentModule — 天赋模块

```typescript
class TalentModule {
  constructor(private world: WorldInstance, private random: RandomProvider);

  /** 抽取天赋池 */
  draftTalents(
    existingTalents: string[],
    inheritedTalents: string[],
    count: number
  ): { drafted: string[]; replacements: { original: string; replacement: string }[] };

  /** 选择天赋（处理互斥） */
  selectTalents(
    draftPool: string[],
    selections: string[],
    maxCount: number
  ): { selected: string[]; conflicts: string[] };

  /** 获取天赋在当前年龄的触发效果 */
  getActiveEffects(
    talentIds: string[],
    age: number,
    state: GameState
  ): TalentEffect[];

  /** 获取可继承天赋列表 */
  getInheritable(lastGameTalents: string[]): string[];
}
```

### 4.5 ConditionDSL — 条件 DSL

#### 语法

```
expression := or_expr
or_expr    := and_expr ( '|' and_expr )*
and_expr   := atom ( '&' atom )*
atom       := '(' expression ')' | comparison
comparison := identifier op value
identifier := 'attribute.id' | 'age' | 'has.talent.id' | 'flag.name' | 'event.count.id' | 'achievement.count'
op         := '==' | '!=' | '>=' | '<=' | '>' | '<'
value      := number | string
```

#### 求值上下文

```typescript
interface ConditionContext {
  state: GameState;
  world: WorldInstance;
}

class ConditionDSL {
  /** 解析条件字符串为 AST */
  parse(expr: string): ConditionAST;

  /** 在上下文中求值 */
  evaluate(expr: string, ctx: ConditionContext): boolean;

  /** AST 节点类型 */
  // type = 'or' | 'and' | 'comparison'
  // comparison: { attr: string, op: CompareOp, value: number | string }
}
```

**示例条件**：

```
// 属性条件
attribute.magic_power >= 5
attribute.chr >= 8

// 年龄条件
age >= 18 & age <= 30

// 天赋条件
has.talent.dragon_blood

// 组合条件
attribute.str >= 5 & (has.talent.noble_birth | attribute.mny >= 6)

// 事件计数
event.count.dragon_slay >= 1

// 成就条件
achievement.count >= 10
```

### 4.6 EventModule — 事件模块

```typescript
class EventModule {
  constructor(private world: WorldInstance, private random: RandomProvider, private dsl: ConditionDSL);

  /** 获取当前年龄可触发的事件候选列表 */
  getCandidates(age: number, state: GameState): WorldEventDef[];

  /** 执行一个事件，返回状态更新 */
  resolveEvent(
    event: WorldEventDef,
    state: GameState,
    branchId?: string
  ): GameState;

  /** 处理天赋触发的事件 */
  resolveTalentEvents(
    talentEffects: TalentEffect[],
    state: GameState
  ): GameState;
}
```

**事件执行流程**：

```
1. getCandidates(age, state)
   ├── 从 world.events 中筛选 minAge <= age <= maxAge
   ├── 过滤 unique 已触发的事件
   ├── 应用 include 条件过滤
   └── 应用 exclude 条件过滤

2. random.weightedPick(candidates)  -- 按权重选一个

3. 如果事件有分支
   ├── UI 显示选项，玩家选择 → branchId
   └── 自动模式 → random 按概率选

4. resolveEvent(event, state, branchId)
   ├── 记录到 triggeredEvents
   ├── 按顺序执行 effects
   │   ├── modify_attribute → AttributeModule.modify
   │   ├── set_attribute → 直接设置
   │   ├── add_talent → talents.selected.push
   │   ├── trigger_event → 递归 resolveEvent
   │   ├── set_flag → flags.add
   │   └── modify_hp → hp += value, clamp
   ├── 每个效果检查 probability 和 condition
   ├── 生成效果文本
   ├── 追加到 eventLog
   └── 返回新的 GameState

5. 检查天赋年龄触发效果
   └── resolveTalentEvents(...)
```

### 4.7 EvaluatorModule — 评分模块

```typescript
class EvaluatorModule {
  constructor(private world: WorldInstance);

  /** 计算最终得分 */
  calculate(state: GameState): EvaluationResult;
}

interface EvaluationResult {
  score: number;
  grade: string;
  gradeTitle: string;
  gradeDescription: string;
  details: {
    totalAttributePeakSum: number;
    lifespan: number;
    breakdown: { category: string; value: number }[];
  };
}
```

### 4.8 SimulationEngine — 推演引擎

```typescript
class SimulationEngine {
  private state: GameState;
  private world: WorldInstance;
  private random: RandomProvider;
  private attrModule: AttributeModule;
  private talentModule: TalentModule;
  private eventModule: EventModule;
  private evaluatorModule: EvaluatorModule;
  private achievementModule: AchievementModule;

  constructor(world: WorldInstance, seed: number);

  /** 初始化新游戏 */
  initGame(characterName: string, presetId?: string): GameState;

  /** 抽取天赋 */
  draftTalents(): string[];

  /** 选择天赋 */
  selectTalents(talentIds: string[]): GameState;

  /** 分配属性 */
  allocateAttributes(allocation: Record<string, number>): GameState;

  /** 推演一年 */
  simulateYear(branchChoices?: Record<string, string>): GameState;

  /** 批量推演（自动模式） */
  simulateYears(count: number, autoBranch?: boolean): GameState[];

  /** 完成游戏，生成结算 */
  finish(): GameState;

  /** 获取当前状态（只读） */
  getState(): Readonly<GameState>;
}
```

**simulateYear 内部流程**：

```
1. 年龄 +1
2. 检查天赋触发（trigger_on_age 类型）
3. 获取并执行事件（EventModule）
4. 检查死亡条件（hp <= 0 或 age >= world.maxAge）
5. 更新属性峰值
6. 记录属性快照
7. 检查成就
8. 返回新 GameState
```

### 4.9 AchievementModule — 成就模块

```typescript
class AchievementModule {
  constructor(private world: WorldInstance, private dsl: ConditionDSL);

  /** 检查本局是否解锁新成就 */
  checkAchievements(state: GameState): string[];  // 返回新解锁的成就 ID
}
```

---

## 5. 前端页面设计

### 5.1 页面列表与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | HomeView | 首页：世界选择、继续游戏入口 |
| `/setup/:worldId` | SetupView | 角色创建：选天赋 → 分属性 |
| `/play/:worldId/:playId` | SimulationView | 推演主界面 |
| `/result/:worldId/:playId` | ResultView | 结算页面 |
| `/achievements` | AchievementView | 成就总览（跨世界） |

### 5.2 各页面组件结构

#### HomeView（首页）
```
HomeView
├── AppHeader
├── WorldSelector
│   └── WorldCard × N          # 每个世界一张卡片
├── ContinueGameSection        # 如有存续游戏，显示继续入口
└── AppFooter
```

#### SetupView（角色创建）
```
SetupView
├── WorldIntro                 # 世界背景介绍（首次进入显示）
├── PresetSelect               # 角色预设选择
├── StepIndicator              # 步骤指示器
├── TalentDraft                # 天赋抽取动画
│   └── TalentCard × 10
├── TalentSelect               # 天赋选择（10选3）
│   └── TalentCard × 10 (可勾选)
├── AttributeAllocate          # 属性分配
│   ├── AttributeBar × N
│   ├── PointsRemaining
│   └── RandomAllocate / Reset 按钮
└── StartGameButton
```

#### SimulationView（推演）
```
SimulationView
├── StatusPanel                # 左侧/顶部：当前属性面板
│   ├── AttributeBar × N
│   ├── ActiveTalents          # 当前生效天赋
│   └── AgeIndicator           # 当前年龄 & HP
├── EventLog                   # 中间：事件日志流
│   └── YearPanel × N          # 每年一个面板
│       ├── EventItem           # 事件描述
│       ├── EffectItem          # 属性变化提示
│       └── BranchSelect        # 分支选择按钮（如需玩家选择）
├── Timeline                   # 右侧/底部：生命时间线（可折叠）
├── SimulationControls         # 底部控制栏
│   ├── Play/Pause
│   ├── Speed (1x/2x/5x)
│   └── SkipToEnd
└── YearSummary                # 每10年弹出年度小结
```

#### ResultView（结算）
```
ResultView
├── FinalGrade                 # 最终评级（大字展示 + 动画）
├── AttributeSummary           # 属性峰值一览
├── LifeReview                 # 人生回顾（关键事件时间线）
├── AchievementUnlock          # 本局解锁的成就
├── ShareCard                  # 分享卡片
├── StatsSummary               # 统计：触发事件数、最高属性等
├── PlayAgainButton
└── BackToHomeButton
```

### 5.3 响应式设计策略

| 断点 | 布局 |
|------|------|
| < 640px (手机) | 单列纵向，StatusPanel 顶部折叠，EventLog 全宽 |
| 640-1024px (平板) | 双列（StatusPanel + EventLog），Timeline 底部 |
| > 1024px (桌面) | 三列（StatusPanel \| EventLog \| Timeline） |

### 5.4 UI 设计要点

- **推演节奏**：事件以"打字机"效果逐条显示，属性变化以数字跳动动画呈现
- **天赋抽取**：卡牌翻转动画，稀有/传说天赋有特殊光效
- **评级揭示**：从低到高依次亮灭，最终定格在正确评级上（类似综艺揭晓）
- **配色**：每个世界有独立主题色，通过 CSS 变量切换

---

## 6. 基础世界「剑与魔法」完整数据设计

### 6.1 世界概览

> **世界 ID**: `sword-and-magic`  
> **世界名称**: 剑与魔法  
> **副标题**: 在巨龙咆哮的苍穹下，书写你的传说  
> **最大寿命**: 80 岁  
> **初始可分配点数**: 20  
> **天赋抽取**: 10 选 3  

### 6.2 属性定义（8 个）

| ID | 名称 | 图标 | 描述 | 范围 | 默认值 | 分组 |
|----|------|------|------|------|--------|------|
| `chr` | 魅力 | ✨ | 外表与气质，影响社交和恋爱 | 0~10 | 0 | social |
| `int` | 智慧 | 📚 | 知识与悟性，影响魔法学习和策略 | 0~10 | 0 | mental |
| `str` | 体魄 | 💪 | 力量与耐力，影响战斗和生存 | 0~10 | 0 | physical |
| `mny` | 家境 | 💰 | 出身家庭的富裕程度 | 0~10 | 0 | social |
| `spr` | 灵魂 | 🔮 | 精神力与意志力，影响魔力和快乐 | 0~10 | 0 | mental |
| `mag` | 魔力 | 🔥 | 天生魔力亲和度，决定魔法上限 | 0~10 | 0 | magical |
| `luk` | 运势 | 🍀 | 天降好运的概率，影响稀有事件 | 0~10 | 0 | special |
| `hp` | 生命力 | ❤️ | 当前生命值（隐藏属性，默认100） | 0~999 | 100 | hidden |
| `age` | 年龄 | ⏳ | 当前年龄（隐藏属性） | 0~80 | 0 | hidden |

### 6.3 天赋定义（20 个）

#### 普通天赋（14 个，抽取权重 100）

| ID | 名称 | 描述 | 效果 | 条件 |
|----|------|------|------|------|
| `peasant_birth` | 农家子弟 | 出身平凡，但吃苦耐劳 | `str+1` | 无 |
| `town_kid` | 城镇少年 | 在热闹的集市长大，见多识广 | `mny+1, int+1` | 无 |
| `apprentice` | 工坊学徒 | 从小跟着铁匠/炼金师打下手 | `str+1, int+1` | 无 |
| `forest_child` | 森林之子 | 在密林中长大，亲近自然 | `spr+2, mag+1` | 无 |
| `bookworm` | 书虫 | 酷爱读书，知识渊博但体弱 | `int+3, str-1` | 无 |
| `fighter_instinct` | 战斗本能 | 天生的战斗直觉 | `str+2, luk+1` | 无 |
| `merchant_blood` | 商人之血 | 家族世代经商 | `mny+3, chr+1` | 无 |
| `noble_born` | 贵族出身 | 含着金钥匙出生 | `mny+5` | 无 |
| `wild_talent` | 野性直觉 | 野兽般的直觉和反应速度 | `str+1, spr+1, luk+1` | 无 |
| `cursed_mark` | 诅咒之印 | 额头有一道神秘印记，魔力强大但不受控制 | `mag+3, spr-1` | 无 |
| `twin_souls` | 双生魂 | 灵魂裂成两半，感知极强但寿命短 | `spr+2, mag+1` | `age <= 60 → hp -20` (trigger_on_age) |
| `blessed_by_goddess` | 女神祝福 | 受过女神殿的祝福仪式 | `chr+1, spr+1, mag+1` | 无 |
| `orphan` | 孤儿 | 从小在教会孤儿院长大 | `spr+2` | `mny <= 2` |
| `village_hero_seed` | 英雄之种 | 你总觉得自己的命运不平凡 | `all +0.5`（所有属性+1取整）| 无 |

#### 稀有天赋（5 个，抽取权重 10）

| ID | 名称 | 描述 | 效果 | 条件 | 互斥 |
|----|------|------|------|------|------|
| `dragon_blood` | 龙血传承 | 血液中流淌着远古巨龙的血脉 | `str+2, mag+2, spr+1`；`age >= 20` 时解锁事件 `dragon_awakening` | 无 | `demon_heritage` |
| `royal_lineage` | 王室血统 | 帝国正统皇室的血脉后裔 | `mny+4, chr+2, mag+1`；`age >= 15` 触发事件 `royal_summon` | 无 | 无 |
| `reincarnated` | 转生者 | 前世记忆觉醒，带着另一个世界的知识 | `int+3, mny+1`；解锁转生者专属事件链 | 无 | 无 |
| `demon_heritage` | 魔族之裔 | 隐藏着魔族的血脉，力量强大但会被追杀 | `str+3, mag+2`；`spr-2`；`age >= 10` 触发事件 `demon_hunt` | 无 | `dragon_blood` |
| `hero_summon` | 勇者召唤 | 被圣剑选中，肩负拯救世界的使命 | `str+2, chr+2, luk+2`；`age >= 16` 触发事件 `hero_journey_start`；`mag+3`（与 `blessed_by_goddess` 替换） | 无 | 无 |

#### 传说天赋（1 个，抽取权重 1）

| ID | 名称 | 描述 | 效果 | 条件 | 可继承 |
|----|------|------|------|------|--------|
| `worldbreaker` | 世界破坏者 | 你不是来拯救世界的，你是来重启的 | `str+3, mag+5, spr+3, luk+3`；解锁传说级事件链 `world_breaking`；所有战斗类事件效果翻倍；`age >= 50` 触发终极事件 `final_cataclysm` | `luk >= 3` | ✅ |

### 6.4 事件定义（30 个）

#### 幼年期（0-6 岁）

| ID | 标题 | 描述 | 年龄 | 权重 | 条件 | 效果 | 标签 |
|----|------|------|------|------|------|------|------|
| `birth_noble` | 降生贵族 | 你出生在领主的庄园中，第一声啼哭响彻大厅。 | 0 | 10 | `mny >= 6` | 无（家境已体现） | life |
| `birth_common` | 平民之子 | 你出生在一个朴素的农舍中，父亲是一个农夫。 | 0 | 20 | `mny <= 5 & mny >= 3` | 无 | life |
| `birth_slums` | 贫民窟的黎明 | 你出生在王国最脏乱的街巷，第一眼看到的是漏水的屋顶。 | 0 | 15 | `mny <= 2` | `spr-1` | life |
| `magic_burst_baby` | 婴儿的魔力暴走 | 你打了个喷嚏，摇篮旁边的蜡烛全部同时爆炸了。保姆吓得辞职了。 | 1 | 5 | `mag >= 4` | `mag+1`；触发事件 `magic_academy_notice` | magic |
| `bullied` | 被大孩子欺负 | 村里的大孩子抢走了你的面包，还把你推进泥坑。 | 3 | 15 | 无 | `spr-1, str+1`；`set_flag:bullied_child` | social |
| `church_orphan` | 教会的温暖 | 孤儿院的修女们对你格外温柔，教会了你认字。 | 4 | 10 | `mny <= 2` | `int+1, spr+1` | life |
| `fairy_encounter` | 林中的精灵 | 你在森林边缘发现了一只受伤的精灵，你帮它包扎了翅膀。 | 5 | 3 | `luk >= 4 & spr >= 3` | `spr+1, mag+1`；`set_flag:fairy_friend` | adventure |

#### 少年期（7-15 岁）

| ID | 标题 | 描述 | 年龄 | 权重 | 条件 | 效果 | 标签 |
|----|------|------|------|------|------|------|------|
| `magic_academy_notice` | 魔法学院来信 | 一只猫头鹰送来了一封信——不，是一只水晶蝴蝶。魔力学院的入学通知。 | 7 | 8 | `mag >= 5 | has.talent.magic_burst_baby` | `mag+1, int+1`；`set_flag:magic_student` | magic |
| `squire_training` | 侍从修炼 | 你成为了骑士的侍从，每天挥剑一千次。 | 10 | 12 | `str >= 4` | `str+2`；`set_flag:squire` | combat |
| `first_love` | 初恋的味道 | 邻居家的女儿/儿子对你笑了，你的心脏像是被魔法定住了。 | 12 | 8 | `chr >= 5` | `spr+1`；`set_flag:first_love` | romance |
| `bullied_fight_back` | 反击！ | 曾经欺负你的孩子又来了，这次你揍了他一顿。 | 13 | 6 | `flag:bullied_child & str >= 5` | `str+1, spr+1`；`set_flag:fight_back` | combat |
| `dungeon_explore_1` | 初探地下城 | 你和小伙伴偷偷溜进村外的废弃矿洞，发现了一条地下河。 | 14 | 7 | `str >= 3 | mag >= 3` | `int+1, luk+1`；`set_flag:dungeon_first` | adventure |
| `dragon_awakening` | 🐉 龙血觉醒 | 一天夜里你浑身发烫，皮肤下有什么东西在涌动。你的瞳孔变成了竖瞳——龙血在苏醒。 | 12 | 1 | `has.talent.dragon_blood` | `str+2, mag+2`；`set_flag:dragon_awakened` | epic |
| `demon_hunt` | ⚔️ 猎魔骑士的追杀 | 你的魔族血脉被圣教会发现了。三名猎魔骑士在月夜来袭。 | 10 | 1 | `has.talent.demon_heritage` | 分支事件（见下） | epic |
| `reincarnated_memory` | 🌀 前世记忆 | 你突然想起了前世的一切——一栋玻璃大厦、一块发光的板子、还有…加班？ | 8 | 1 | `has.talent.reincarnated` | `int+2`；`set_flag:reincarnated` | epic |

**`demon_hunt` 分支事件**：
- **分支 A - 抵抗逃亡**（概率 60%）：`str+2, spr+1, hp-20`，`set_flag:fugitive`
- **分支 B - 隐藏力量暴走**（概率 30%）：`mag+3, str+1, spr-2`，`set_flag:demon_power`，解锁后续事件链
- **分支 C - 被朋友保护**（概率 10%）：`spr+2, chr+1`，`set_flag:has_ally`（需 `chr >= 4`）

#### 青年期（16-30 岁）

| ID | 标题 | 描述 | 年龄 | 权重 | 条件 | 效果 | 标签 |
|----|------|------|------|------|------|------|------|
| `guild_join` | 加入冒险者公会 | 你推开公会大门，铜铃叮当作响。"新人？登记表在那儿。" | 16 | 15 | `str >= 4 | mag >= 4` | `set_flag:guild_member` | adventure |
| `magic_graduate` | 魔法学院毕业 | 五年苦修终于结束，你拿到了魔法师的毕业证——上面写着"可独立使用3阶以下魔法"。 | 20 | 5 | `flag:magic_student & int >= 6` | `mag+2, int+1`；`set_flag:mage_graduate` | magic |
| `first_quest` | 第一个委托 | 公会墙上贴着一张皱巴巴的委托单："灭杀村外骚扰家畜的史莱姆"。报酬：5银币。 | 16 | 10 | `flag:guild_member` | `mny+1, str+1` | adventure |
| `dragon_slay_attempt` | 讨伐巨龙 | 一头黑龙盘踞在北方的山谷，赏金高得惊人。你决定去试试。 | 22 | 4 | `str >= 7 | mag >= 7 | flag:dragon_awakened` | 分支事件 | epic |
| `royal_summon` | 👑 皇城的召见 | 一队皇家卫兵出现在你面前。"陛下有请。" | 18 | 1 | `has.talent.royal_lineage` | `mny+3, chr+1`；`set_flag:royal_recognized` | epic |
| `hero_journey_start` | 🗡️ 勇者的旅途 | 圣剑在王座大厅中发出共鸣，飞到了你的手中。"你就是预言中的勇者。" | 16 | 1 | `has.talent.hero_summon` | `str+1, mag+1, chr+1`；`set_flag:hero_journey`；解锁勇者事件链 | epic |
| `marry_noble` | 政治联姻 | 你被安排与一位贵族结婚。这在王国中很常见。 | 25 | 6 | `chr >= 6 & mny >= 5` | `mny+2, chr+1`；`set_flag:married` | romance |
| `marry_adventurer` | 与冒险者结婚 | 你们在一次地下城探索中相识相知，决定共度余生。 | 25 | 5 | `chr >= 5 & flag:guild_member` | `spr+2, str+1`；`set_flag:married` | romance |
| `dark_mage_tempt` | 暗黑魔师的诱惑 | "你想要的…力量，我都有。只要你愿意付出代价。" | 20 | 6 | `mag >= 5 & spr <= 4` | 分支事件 | dark |
| `tavern_brawl` | 酒馆斗殴 | 几杯麦酒下肚，一个兽人对你的长相发表了不当评论。 | 18 | 12 | `flag:guild_member & str >= 5` | `str+1, hp-10`；`set_flag:tough_reputation` | combat |
| `fairy_friend_return` | 精灵的报恩 | 当年你救下的精灵回来了，它带来了一颗星光果实。 | 20 | 2 | `flag:fairy_friend` | `mag+2, spr+2, hp+30` | adventure |

**`dragon_slay_attempt` 分支事件**：
- **分支 A - 正面击杀**（需 `str >= 9 | mag >= 9`）：`str+2, mny+5, chr+2`，`set_flag:dragon_slayer`
- **分支 B - 惨胜**（概率 40%）：`str+1, hp-50, mny+3`，`set_flag:near_death`
- **分支 C - 被龙击败**（概率 30%）：`hp-80, spr-1`，`set_flag:dragon_defeated`

**`dark_mage_tempt` 分支事件**：
- **分支 A - 接受力量**：`mag+3, spr-3`；`set_flag:dark_path`；解锁暗黑事件链
- **分支 B - 拒绝并战斗**（需 `str >= 5 | mag >= 7`）：`str+1, spr+1, hp-20`；`set_flag:pure_heart`
- **分支 C - 巧妙逃脱**：`luk+1, spr+1`；`set_flag:escaped_dark`

#### 中年期（31-60 岁）

| ID | 标题 | 描述 | 年龄 | 权重 | 条件 | 效果 | 标签 |
|----|------|------|------|------|------|------|------|
| `become_lord` | 受封领主 | 因为你的功绩，国王封你为一方领主。 | 35 | 3 | `mny >= 6 & chr >= 5 & flag:guild_member` | `mny+3, chr+1`；`set_flag:lord` | social |
| `master_spell` | 顿悟！魔法真谛 | 你终于理解了魔法的本质——不是操控元素，而是与世界的对话。 | 40 | 3 | `mag >= 8 & int >= 7` | `mag+3, int+2`；`set_flag:archmage` | magic |
| `student_successor` | 收徒传艺 | 一个年轻人跪在你面前："请收我为徒！" | 35 | 8 | `(str >= 7 | mag >= 7) & age >= 35` | `spr+1`；`set_flag:has_student` | social |
| `lost_in_dungeon` | 地下城迷失 | 你在深层的地下城中迷路了，黑暗中有什么在注视着你。 | 38 | 5 | `flag:guild_member` | `hp-30, spr-1` 或 `hp+20, int+1, luk+1`（概率各50%） | adventure |
| `war_breaks_out` | 战争爆发 | 魔王军入侵了！所有冒险者被征召。 | 40 | 5 | `flag:guild_member | flag:hero_journey` | 分支事件 | epic |
| `world_breaking` | 💥 世界崩坏开始 | 你感到世界在颤抖。不是地震——是世界本身的法则在瓦解。 | 50 | 1 | `has.talent.worldbreaker` | `str+2, mag+3`；`set_flag:world_breaking`；解锁后续事件链 | epic |
| `midlife_crisis` | 中年危机 | "我这辈子到底在干什么？"你站在悬崖边，看着夕阳发呆。 | 45 | 10 | 无 | `spr-2` 或 `spr+1, int+1`（概率各50%） | life |
| `reincarnated_invention` | 🌀 前世知识变现 | 你想起前世的配方，调出了一种这个世界从未见过的药剂——可乐。一夜之间风靡王国。 | 30 | 1 | `flag:reincarnated & int >= 6` | `mny+5, chr+1`；`set_flag:famous_inventor` | epic |

**`war_breaks_out` 分支事件**：
- **分支 A - 上前线**（需 `str >= 6`）：`str+2, hp-40, mny+2`；`set_flag:war_veteran`
- **分支 B - 后方支援**：`int+1, spr+1`；`set_flag:healer`
- **分支 C - 带队突击**（需 `chr >= 7 & str >= 7`）：`str+2, chr+2, hp-50, mny+3`；`set_flag:war_hero`

#### 老年期（61-80 岁）

| ID | 标题 | 描述 | 年龄 | 权重 | 条件 | 效果 | 标签 |
|----|------|------|------|------|------|------|------|
| `retirement` | 挂剑归隐 | 你把武器挂在了壁炉上方，决定安度晚年。 | 60 | 10 | `flag:guild_member` | `spr+2, hp+20` | life |
| `legend_spread` | 传说的传播 | 吟游诗人们开始传唱你的故事。"那个屠龙的……""不不不，是那个发明可乐的！" | 65 | 8 | `flag:dragon_slayer | flag:famous_inventor | flag:war_hero` | `chr+3, spr+2` | social |
| `final_cataclysm` | ☄️ 终焉之战 | 天空裂开，混沌涌入。世界需要一个终章。而你，就是执笔之人。 | 55 | 1 | `has.talent.worldbreaker & flag:world_breaking` | 分支事件 | epic |
| `peaceful_end` | 平静的终章 | 你坐在门廊的摇椅上，看着孙辈们在花园里奔跑。夕阳很美。 | 75 | 12 | `spr >= 5` | `spr+3`；`hp` 缓慢下降 | life |
| `magic_breakthrough_final` | 最后的魔法 | 你感到自己的魔力在消散，于是决定将毕生所学注入最后一道法术。 | 70 | 4 | `mag >= 9 & flag:archmage` | `mag+5`（最后一刻的辉煌），`hp-30` | magic |
| `final_cataclysm_branch` | | | | | | | |

**`final_cataclysm` 分支事件**：
- **分支 A - 毁灭世界**（需 `str >= 10 | mag >= 10`）：`spr-5, str+3, mag+3`；游戏立即结束，获得传说成就
- **分支 B - 重建世界**：`spr+5, int+3`；世界以新的形态重生；获得传说成就
- **分支 C - 成为新世界的神**：`all+2`；你成为了新世界的创世神；获得最高传说成就

### 6.5 成就定义（15 个）

| ID | 名称 | 描述 | 隐藏 | 条件 | 分类 |
|----|------|------|------|------|------|
| `first_step` | 踏入异世界 | 完成第一局游戏 | ❌ | `event.count.birth_noble >= 1 | event.count.birth_common >= 1 | event.count.birth_slums >= 1` | progress |
| `dragon_slayer_ach` | 屠龙者 | 讨伐巨龙成功 | ❌ | `flag:dragon_slayer` | combat |
| `archmage_ach` | 大贤者 | 成为大魔导师 | ❌ | `flag:archmage` | magic |
| `hero_ach` | 真正的勇者 | 完成勇者之旅 | ❌ | `flag:hero_journey` | epic |
| `dark_lord_ach` | 堕落之路 | 走上暗黑之路 | ❌ | `flag:dark_path` | dark |
| `reincarnator_ach` | 转生者的逆袭 | 发明可乐 | ✅ | `flag:famous_inventor` | secret |
| `world_breaker_ach` | 世界破坏者 | 触发终焉之战 | ✅ | `flag:world_breaking` | secret |
| `lucky_star` | 幸运之星 | 运势达到10 | ❌ | `attribute.peak.luk >= 10` | attribute |
| `iron_body` | 钢铁之躯 | 体魄达到10 | ❌ | `attribute.peak.str >= 10` | attribute |
| `beauty_supreme` | 绝世容颜 | 魅力达到10 | ❌ | `attribute.peak.chr >= 10` | attribute |
| `wisdom_peak` | 全知者 | 智慧达到10 | ❌ | `attribute.peak.int >= 10` | attribute |
| `longevity` | 长寿之人 | 活到80岁 | ❌ | `lifespan >= 80` | life |
| `speedrun` | 速通异世界 | 30岁前完成游戏 | ✅ | `lifespan <= 30` | secret |
| `centenarian` | 不老传说 | 属性总值超过60 | ✅ | `attribute.peak 总和 >= 60` | secret |
| `completionist` | 全成就 | 解锁所有其他成就 | ✅ | `achievement.count >= 14` | secret |

### 6.6 评分规则

```typescript
const scoringRule: WorldScoringRule = {
  formula: `
    SUM = (
      attribute.peak.chr +
      attribute.peak.int +
      attribute.peak.str +
      attribute.peak.mny +
      attribute.peak.spr +
      attribute.peak.mag +
      attribute.peak.luk
    ) * 2 + lifespan / 2
  `,
  grades: [
    {
      minScore: 0,
      maxScore: 15,
      grade: 'D',
      title: '路人NPC',
      description: '在这个世界的传说中，你只是个路人甲。连吟游诗人都不愿意写你的故事。',
    },
    {
      minScore: 15,
      maxScore: 25,
      grade: 'C',
      title: '普通冒险者',
      description: '你度过了平凡但充实的一生。至少，你活了下来。',
    },
    {
      minScore: 25,
      maxScore: 35,
      grade: 'B',
      title: '知名冒险者',
      description: '冒险者公会的大厅里挂着你的名字。偶尔有新人会问起你的故事。',
    },
    {
      minScore: 35,
      maxScore: 50,
      grade: 'A',
      title: '传说中的勇者',
      description: '你的名字被写进了王国的史书。孩子们在睡前听着你的故事入睡。',
    },
    {
      minScore: 50,
      maxScore: 65,
      grade: 'S',
      title: '一代传奇',
      description: '你的传说跨越了国界。吟游诗人为你谱写了史诗，魔法学院用你的名字命名了一座塔。',
    },
    {
      minScore: 65,
      maxScore: Infinity,
      grade: 'SS',
      title: '世界之巅',
      description: '你站在了这个世界所能达到的最高处。时间会遗忘王国，但不会遗忘你。因为你，就是传说本身。',
    },
  ],
};
```

### 6.7 角色预设

| ID | 名称 | 称号 | 背景 | 属性分配 | 天赋 | 解锁 |
|----|------|------|------|---------|------|------|
| `random_1` | 艾伦 | 不知名的旅人 | 来自边境村庄的年轻人，踏上了冒险之旅。 | 随机 | 无 | ❌ |
| `random_2` | 莉娜 | 好奇心旺盛的少女 | 城市出身的少女，对魔法和冒险充满向往。 | 随机 | 无 | ❌ |
| `random_3` | 加隆 | 老兵之子 | 退役骑士的儿子，继承了父亲的剑和意志。 | 随机 | `fighter_instinct` | ❌ |
| `reincarnator` | ??（转生者） | 转生异世界 | 睁开眼发现自己变成了一个婴儿。这一切…太熟悉了。 | int+2, luk+2, 其余随机 | `reincarnated` | 完成一局游戏 |
| `dragonborn` | 阿尔维斯 | 龙裔 | 额头上有一枚龙鳞形状的胎记。 | str+2, mag+2, 其余随机 | `dragon_blood` | 解锁「屠龙者」成就 |
| `worldbreaker` | 漆黑之子 | 终焉的预兆 | 你出生的那天，天空中出现了一条裂缝。 | mag+3, luk+2, spr+2, 其余随机 | `worldbreaker` | 解锁全部其他成就 |

---

## 7. 开发分阶段计划

### Phase 1 — MVP（最小可玩版本）

**目标**：单世界（剑与魔法），核心游戏循环跑通，可在手机上玩。

**预计工期**：2 周

| # | 任务 | 预估时间 |
|---|------|---------|
| 1.1 | 项目初始化（Vite + Vue3 + TS + Pinia + Router） | 0.5 天 |
| 1.2 | 引擎核心类型定义（`engine/core/types.ts`） | 1 天 |
| 1.3 | RandomProvider 实现 | 0.5 天 |
| 1.4 | ConditionDSL 解析器 & 求值器 | 1.5 天 |
| 1.5 | AttributeModule 实现 | 0.5 天 |
| 1.6 | TalentModule 实现（抽取 + 选择，不含继承） | 1 天 |
| 1.7 | EventModule 实现（候选筛选 + 权重随机 + 效果执行，不含分支） | 2 天 |
| 1.8 | SimulationEngine 编排（init → draft → allocate → simulate → finish） | 1.5 天 |
| 1.9 | EvaluatorModule 实现 | 0.5 天 |
| 1.10 | 世界系统骨架（WorldInstance + 内置世界数据加载） | 1 天 |
| 1.11 | 剑与魔法数据：5个属性 + 10个天赋 + 15个基础事件 | 1.5 天 |
| 1.12 | Pinia stores（gameStore, worldStore） | 1 天 |
| 1.13 | 首页（世界选择） | 0.5 天 |
| 1.14 | SetupView：天赋抽取 UI + 属性分配 UI | 1.5 天 |
| 1.15 | SimulationView：事件日志流 + 属性面板 + 基础控制 | 2 天 |
| 1.16 | ResultView：评级 + 属性总结 | 1 天 |
| 1.17 | 响应式布局适配（手机优先） | 1 天 |
| 1.18 | 单元测试（ConditionDSL + EventModule） | 1 天 |

**MVP 交付物**：
- ✅ 可选择世界、抽取天赋、分配属性、逐年推演、查看结算
- ✅ 手机可玩
- ✅ 核心 UI 功能完整
- ⬜ 无分支事件
- ⬜ 无成就系统
- ⬜ 无动画效果
- ⬜ 无存档功能

---

### Phase 2 — 完整版

**目标**：完善所有核心功能，丰富内容，提升体验。

**预计工期**：2 周

| # | 任务 | 预估时间 |
|---|------|---------|
| 2.1 | 事件分支系统（UI 选择 + 自动选择） | 1.5 天 |
| 2.2 | 事件链系统（后续事件触发） | 0.5 天 |
| 2.3 | 成就系统（AchievementModule + UI + localStorage 持久化） | 1.5 天 |
| 2.4 | 天赋继承系统（上局天赋 → 下局选项） | 0.5 天 |
| 2.5 | 角色预设系统（随机 + 特殊解锁） | 1 天 |
| 2.6 | 补全剑与魔法数据：20 个天赋 + 30 个事件 | 2 天 |
| 2.7 | 成就数据（15 个） | 0.5 天 |
| 2.8 | 存档系统（localStorage 保存/恢复游戏状态） | 1 天 |
| 2.9 | UI 动画（天赋翻牌、评级揭晓、事件淡入） | 1.5 天 |
| 2.10 | 音效/BGM 骨架（可选，静音模式） | 0.5 天 |
| 2.11 | 分享卡片（Canvas 截图） | 1 天 |
| 2.12 | 主题切换（跟随世界主题色） | 0.5 天 |
| 2.13 | 世界包 JSON Schema 校验（WorldValidator） | 1 天 |
| 2.14 | 端到端测试 + Bug 修复 | 2 天 |

**完整版交付物**：
- ✅ 分支事件 & 事件链
- ✅ 成就系统（含隐藏成就）
- ✅ 天赋继承
- ✅ 角色预设（含解锁机制）
- ✅ 存档/读档
- ✅ UI 动画
- ✅ 分享卡片
- ✅ 30 个事件 + 20 个天赋的完整内容

---

### Phase 3 — 扩展功能

**目标**：多世界支持、外部世界包、进阶功能。

**预计工期**：2 周

| # | 任务 | 预估时间 |
|---|------|---------|
| 3.1 | 外部世界包加载（URL 导入 + 文件上传） | 1.5 天 |
| 3.2 | 世界包编辑器/预览（可选，网页版） | 3 天 |
| 3.3 | 第二个内置世界（赛博朋克 / 仙侠 / 末世…） | 3 天 |
| 3.4 | 多语言支持（i18n 骨架） | 1 天 |
| 3.5 | 暗色模式 | 0.5 天 |
| 3.6 | 事件日志搜索/筛选 | 0.5 天 |
| 3.7 | 历史记录面板（查看过去的游戏结算） | 1 天 |
| 3.8 | PWA 支持（离线可玩） | 1 天 |
| 3.9 | 性能优化（虚拟滚动、懒加载） | 1 天 |
| 3.10 | 世界包社区分享（通过 URL 参数） | 1 天 |

---

## 8. 关键技术决策和理由

### 8.1 引擎层与 UI 层完全分离

**决策**：`engine/` 目录不引入任何 Vue 依赖，纯 TypeScript。

**理由**：
- **可测试性**：引擎逻辑可以独立写单元测试，无需挂载 Vue 组件
- **可复用性**：理论上引擎可以接入 React/React Native/Node.js（用于自动模拟）
- **关注点分离**：游戏逻辑和渲染逻辑互不干扰

### 8.2 GameState 不可变式更新

**决策**：每个模块方法接收旧 State，返回新 State，不修改原对象。

**理由**：
- **可回放**：相同输入必然产生相同输出，便于调试和"时光倒流"功能
- **Vue 响应式友好**：替换整个对象比深层修改更容易触发更新
- **并发安全**：未来如需 Web Worker 并行推演，不可变数据天然线程安全

### 8.3 种子化随机数（Mulberry32）

**决策**：使用固定种子的 PRNG，而非 `Math.random()`。

**理由**：
- **可重现**：分享种子码即可复现整局游戏（社区讨论/bug 复现）
- **可控性**：测试时可以固定种子确保确定性
- **轻量**：Mulberry32 只需 4 行代码，性能优秀

### 8.4 Condition DSL 自定义解析器

**决策**：自己写递归下降解析器，不用 `eval` 或 `new Function`。

**理由**：
- **安全性**：世界包可能来自外部，不能执行任意代码
- **可控性**：DSL 语法完全自定义，方便扩展新操作符
- **调试友好**：可以输出 AST 和求值过程，便于排查条件问题

### 8.5 内置世界用 TypeScript，外部世界用 JSON

**决策**：
- 内置世界（剑与魔法等）数据写在 `src/worlds/` 下，作为 TypeScript 模块直接 import
- 外部世界通过 JSON 文件 + `fetch` 加载

**理由**：
- 内置世界打包后无需网络请求，加载更快
- TypeScript 模块在编译时就能做类型检查
- 外部世界用 JSON 格式，方便社区创作和分享

### 8.6 Pinia 而非 Vuex

**决策**：使用 Pinia 作为状态管理。

**理由**：
- Vue 3 官方推荐
- 更简洁的 API（无需 mutations）
- 完美的 TypeScript 支持
- 支持组合式 API 风格

### 8.7 事件系统设计为推而非拉

**决策**：SimulationEngine 在 simulateYear 中主动调用 EventModule，而非事件订阅/发布。

**理由**：
- 游戏逻辑是线性的（逐年推进），不需要复杂的事件总线
- 简单的同步调用更容易调试和测试
- 如果未来需要异步事件，可以在 resolveEvent 内部处理

### 8.8 分支事件作为事件属性而非独立事件

**决策**：分支（branches）是 EventDef 的子属性，不是独立的事件对象。

**理由**：
- 分支和事件是强关联关系，拆分会导致引用维护困难
- 简化条件检查（分支的条件可以引用父事件的上下文）
- 世界包数据更紧凑

### 8.9 CSS 变量实现世界主题

**决策**：通过 CSS 自定义属性切换世界视觉主题。

**理由**：
- 零 JavaScript 开销的主题切换
- 每个世界的主题色可以在 manifest 中定义，加载时注入
- 对所有组件透明，无需传参

### 8.10 不使用状态机库

**决策**：游戏阶段（init → draft → allocate → simulating → finished）用简单枚举管理，不引入 XState 等状态机库。

**理由**：
- 游戏阶段是线性流转的，没有复杂的并发状态
- 枚举 + 条件判断足够清晰
- 减少依赖，降低复杂度

---

## 附录 A：术语表

| 术语 | 说明 |
|------|------|
| 世界（World） | 一套完整的世界观设定，包含属性、天赋、事件、成就等全部数据 |
| 世界包（World Pack） | 一个世界的全部数据文件，包含 manifest.json 和各数据文件 |
| 天赋池（Talent Pool） | 本局游戏中抽到的天赋候选列表 |
| 推演（Simulation） | 逐年执行事件、更新属性的过程 |
| 分支（Branch） | 事件中的选择节点，玩家可自主选择或由系统随机选择 |
| 事件链（Event Chain） | 一个事件触发后续事件的机制 |
| 峰值（Peak） | 某个属性在整局游戏中达到过的最高值 |

---

## 附录 B：文件命名约定

| 类别 | 约定 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase `.vue` | `TalentDraft.vue` |
| TypeScript 类 | PascalCase `.ts` | `SimulationEngine.ts` |
| 类型/接口 | PascalCase | `GameState`, `WorldEventDef` |
| 常量/枚举 | UPPER_SNAKE_CASE | `TALENT_RARITY` |
| 世界数据文件 | kebab-case `.json` / `.ts` | `sword-and-magic/` |
| Composable | camelCase，`use` 前缀 | `useGameEngine.ts` |

---

## 附录 C：依赖清单

| 包 | 用途 | 必需 |
|----|------|------|
| `vue` | UI 框架 | ✅ |
| `vue-router` | 路由 | ✅ |
| `pinia` | 状态管理 | ✅ |
| `ajv` | JSON Schema 校验（世界包验证） | ✅ |
| `html2canvas` | 分享卡片截图 | Phase 2 |
| `vite` | 构建工具 | ✅ |
| `typescript` | 类型系统 | ✅ |
| `vitest` | 单元测试 | ✅ |
| `@vue/test-utils` | 组件测试 | Phase 2 |

**刻意不引入的**：
- ❌ UI 框架（Element Plus / Vant 等）— 手写样式更灵活，异世界题材需要独特视觉
- ❌ 动画库（GSAP 等）— CSS 动画 + Vue Transition 足够
- ❌ 状态机库 — 游戏流程简单，不需要

---

> _文档版本: v1.0_  
> _作者: 项目架构规划_  
> _下一步: 启动 Phase 1 MVP 开发_
