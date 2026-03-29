# 异世界重生模拟器 — 事件系统架构设计方案

> 基于对 4 篇深度技术文章 + GameDev 社区 14 年经典讨论的综合调研

---

## 一、行业现有模式总结

### 1.1 四种主流架构对比

| 架构 | 代表项目 | 数据结构 | 优点 | 缺点 |
|------|----------|----------|------|------|
| **纯 DAG（有向无环图）** | 视觉小说引擎 | 节点=场景，边=选择 | 分支清晰，组合可控 | 事件多时图爆炸，不适合随机性 |
| **EOC 条件-效果链** | Cataclysm DDA | JSON: condition → effect + false_effect | 高度可配置，mod 友好 | 条件组合复杂时难调试 |
| **EventBus + 状态机** | UE5/Unity GES | EventBus + Flag Map + Listener | 解耦好，扩展性强 | 调试链路不透明 |
| **QBN（质量叙事）** | 认知类游戏 | 规则驱动 + 动态组合 | 每次游玩不同 | 缺乏叙事结构感 |

### 1.2 业界共识（来自 4 篇文章的共同结论）

1. **DAG 而非纯树**：分支应该可以合并，否则组合爆炸
2. **Flag Map 是核心**：`Map<String, Integer>` 是所有复杂游戏的状态管理标配
3. **数据驱动**：事件定义用 JSON/配置文件，引擎只负责求值和调度
4. **主动式触发**：在状态变更时主动检查条件，而非每帧轮询
5. **角色驱动 > 剧情驱动**：高评分游戏 60-80% 是玩家主动选择触发的

### 1.3 对我们项目的启发

**不适用**：纯 DAG（我们的事件是随机触发的，不是固定图结构）
**部分适用**：EventBus（解耦好但链路不透明）
**最适用**：**EOC 条件链 + Flag Map + 分层优先级** 的混合架构

---

## 二、推荐架构：三层事件系统

### 2.1 核心设计理念

```
"事件不是孤立的，它们是因果网络中的节点"
```

**与当前系统的核心区别**：
- 当前：93 个事件平铺在一个列表里，引擎每年随机选一个
- 新设计：事件分层组织，有因果依赖，触发基于状态条件而非纯随机

### 2.2 三层架构

```
┌─────────────────────────────────────────────┐
│  Layer 1: 生命周期路线（Life Route）         │
│  ─ 粗粒度的人生阶段划分                      │
│  ─ 每条路线定义一组"路线事件锚点"            │
│  ─ 路线间可转换（触发条件满足时切换）         │
├─────────────────────────────────────────────┤
│  Layer 2: 事件因果网（Event DAG）            │
│  ─ 事件之间的依赖关系（prerequisites）       │
│  ─ flag 驱动的条件门控                      │
│  ─ 分叉-合并模式（分支可汇合）               │
├─────────────────────────────────────────────┤
│  Layer 3: 年度事件池（Event Pool）           │
│  ─ 按年龄段的候选事件                        │
│  ─ 优先级分组（critical/major/minor）       │
│  ─ 填充事件（无因果依赖，纯随机风味）        │
└─────────────────────────────────────────────┘
```

---

## 三、详细设计

### 3.1 Layer 1：生命周期路线

#### 设计目的
解决"每局游戏体验雷同"的问题。不同路线给不同的人生走向。

#### 数据结构

```typescript
/** 生命周期路线定义 */
interface LifeRoute {
  id: string                    // 如 'knight', 'mage', 'merchant', 'commoner'
  name: string                  // "骑士之路"
  description: string
  /** 进入条件（世界状态满足时才可进入） */
  enterCondition?: string       // DSL 表达式，如 "has.flag.squire & !has.flag.magic_student"
  /** 退出条件（满足时自动退出） */
  exitCondition?: string
  /** 优先级（同一年多个路线满足条件时，选优先级最高的） */
  priority: number
  /** 路线独有的锚点事件（按年龄排列，保证体验节奏） */
  anchorEvents: RouteAnchor[]
  /** 路线激活时设置的 flag */
  entryFlags?: string[]
  /** 路线内额外可用的事件池（加入该路线后才解锁） */
  exclusiveEvents?: string[]    // 事件 ID 列表
}

/** 路线锚点事件 */
interface RouteAnchor {
  eventId: string               // 事件 ID
  minAge: number                // 建议触发年龄
  maxAge: number                // 最晚触发年龄
  mandatory: boolean            // true = 必须触发，false = 尽量触发
}
```

#### 示例

```typescript
const KNIGHT_ROUTE: LifeRoute = {
  id: 'knight',
  name: '骑士之路',
  enterCondition: 'has.flag.squire & !has.flag.magic_student',
  priority: 10,
  entryFlags: ['on_knight_path'],
  anchorEvents: [
    { eventId: 'knight_examination', minAge: 15, maxAge: 18, mandatory: true },
    { eventId: 'first_quest', minAge: 16, maxAge: 22, mandatory: false },
    { eventId: 'dragon_slay_attempt', minAge: 22, maxAge: 35, mandatory: false },
    { eventId: 'knight_glory', minAge: 18, maxAge: 25, mandatory: false },
    { eventId: 'royal_summon', minAge: 25, maxAge: 40, mandatory: false },
  ],
  exclusiveEvents: ['dragon_awakening', 'tavern_brawl', 'war_breaks_out'],
}
```

#### 触发逻辑

```
每年 startYear() 时：
1. 评估当前活跃路线的 exitCondition → 如果满足，退出路线
2. 评估所有路线的 enterCondition → 如果有新路线满足，按优先级选最高的进入
3. 检查当前路线的锚点事件：
   - mandatory 且未触发 且 在年龄范围内 → 强制触发（不管概率）
   - 非 mandatory 且在年龄范围内 → 以高权重加入候选池
4. 路线独占事件解锁 → 加入候选池
```

### 3.2 Layer 2：事件因果网

#### 设计目的
让事件之间有真正的因果关系，而非 78% 的死 flag。

#### 核心改进：从"死 flag"到"活的条件门控"

**当前问题**：
```
设置 82 个 flag，只有 18 个被引用（22%利用率）
原因：大部分事件只设 flag 不检查 flag
```

**新设计原则**：每个 flag 必须有消费者。设计时按"需求驱动"思考：

```
不是"这个事件设置什么 flag"，
而是"后续什么事件需要检查什么条件"。
```

#### 改进的 EventEffect 类型

```typescript
interface EventEffect {
  type: 
    | 'modify_attribute'    // 属性变更
    | 'set_attribute'       // 属性设值
    | 'modify_hp'           // HP 变更
    | 'add_talent'          // 获得天赋
    | 'set_flag'            // 设置布尔 flag（值=1）
    | 'set_counter'         // 🆕 设置计数器（值可以是任意整数）
    | 'modify_counter'      // 🆕 计数器增减
    | 'unlock_event'        // 🆕 解锁特定事件（加入候选池）
    | 'lock_event'          // 🆕 锁定特定事件（从候选池移除）
    | 'set_route'           // 🆕 设置/切换路线
    | 'trigger_event'       // 立即触发后续事件
  target: string
  value?: number
  probability?: number
  condition?: string
  description?: string
}
```

#### 新增：事件前置条件（与 include/exclude 互补）

```typescript
interface WorldEventDef {
  // ... 现有字段 ...
  
  /** 🆕 前置条件：必须全部满足才进入候选池（比 include 更语义化） */
  prerequisites?: string[]
  
  /** 🆕 互斥条件：满足任一则排除（比 exclude 更语义化） */
  mutuallyExclusive?: string[]
  
  /** 🆕 事件权重修饰符：根据当前状态动态调整权重 */
  weightModifiers?: WeightModifier[]
}

/** 动态权重修饰 */
interface WeightModifier {
  condition: string          // DSL 表达式
  weightMultiplier: number   // 满足条件时的权重倍率
}
```

#### 因果链设计示例

```typescript
// 事件: 村里的恶霸欺负你
const bullied: WorldEventDef = {
  id: 'bullied',
  minAge: 3, maxAge: 6,
  weight: 5,
  priority: 'major',
  unique: true,
  branches: [
    {
      id: 'submit',
      title: '忍气吞声',
      effects: [
        { type: 'set_flag', target: 'bullied_child' },
        { type: 'set_flag', target: 'timid' },
        { type: 'modify_counter', target: 'cowardice', value: 1 },
      ]
    },
    {
      id: 'fight_back',
      title: '反抗！',
      riskCheck: { attribute: 'str', difficulty: 6, scale: 3 },
      effects: [
        { type: 'set_flag', target: 'bullied_child' },
        { type: 'set_flag', target: 'fight_back' },
        { type: 'modify_counter', target: 'bravery', value: 1 },
      ],
      failureEffects: [
        { type: 'set_flag', target: 'bullied_child' },
        { type: 'set_flag', target: 'timid' },
        { type: 'modify_counter', target: 'cowardice', value: 1 },
        { type: 'modify_hp', target: 'hp', value: -5 },
      ]
    },
    {
      id: 'seek_help',
      title: '去找大人帮忙',
      effects: [
        { type: 'set_flag', target: 'bullied_child' },
        { type: 'set_flag', target: 'smart_seeker' },
        { type: 'modify_counter', target: 'wisdom', value: 1 },
      ]
    },
  ]
}

// 事件: 少年比武大会（利用 counter 而非 flag）
const first_competition: WorldEventDef = {
  id: 'first_competition',
  minAge: 6, maxAge: 10,
  weight: 3,
  priority: 'minor',
  unique: true,
  weightModifiers: [
    // 勇敢的孩子更可能参加比赛
    { condition: 'counter.bravery >= 1', weightMultiplier: 3.0 },
    // 胆怯的孩子不太会去
    { condition: 'counter.cowardice >= 1', weightMultiplier: 0.3 },
    // 被打过但反抗过的孩子更想变强
    { condition: 'has.flag.fight_back', weightMultiplier: 2.0 },
  ]
}

// 事件: 骑士考核（利用 flag 门控）
const knight_examination: WorldEventDef = {
  id: 'knight_examination',
  minAge: 15, maxAge: 18,
  weight: 6,
  priority: 'critical',
  unique: true,
  prerequisites: ['has.flag.squire'],
  mutuallyExclusive: ['has.flag.magic_student'],
  // 智慧高的更可能通过
  weightModifiers: [
    { condition: 'counter.bravery >= 2', weightMultiplier: 1.5 },
  ]
}
```

### 3.3 Layer 3：年度事件池选择算法

#### 当前问题回顾

```
当前算法：
- 70% 从最高优先级组按权重随机
- 30% 从全量按权重随机

问题：49 major 事件撑大候选池，导致触发率异常
```

#### 新算法：加权优先级 + 路线加成

```typescript
function selectEvent(candidates: WorldEventDef[], state: GameState): WorldEventDef | null {
  // Step 1: 应用 weightModifiers 计算动态权重
  const scored = candidates.map(event => {
    let weight = event.weight
    if (event.weightModifiers) {
      for (const mod of event.weightModifiers) {
        if (evaluateCondition(mod.condition, state)) {
          weight *= mod.weightMultiplier
        }
      }
    }
    return { event, weight }
  })
  
  // Step 2: 锚点事件优先
  const anchors = scored.filter(s => isAnchor(s.event, state))
  if (anchors.length > 0) {
    return weightedPick(anchors, s => s.weight)
  }
  
  // Step 3: 按优先级分层选择
  //   - critical: 直接按权重选（这些是重要转折）
  //   - major: 权重正常参与
  //   - minor: 权重 × 0.7（降低干扰）
  const adjusted = scored.map(s => ({
    ...s,
    weight: s.event.priority === 'minor' ? s.weight * 0.7 : s.weight
  }))
  
  return weightedPick(adjusted, s => s.weight)
}
```

#### 设计原则

| 原则 | 说明 |
|------|------|
| 锚点事件强制 | 路线的关键节点必须在规定年龄触发 |
| 动态权重 | 事件权重不是固定的，根据玩家历史选择动态调整 |
| minor 降权 | 填充事件权重 × 0.7，不干扰主线 |
| 路线独占 | 只有在对应路线上才能触发独占事件 |

### 3.4 Flag → Counter 升级

#### 为什么需要 Counter

| 场景 | Flag（当前） | Counter（新） |
|------|-------------|---------------|
| "被欺负过" | `bullied_child = true` | `counter.bullying = 3`（被欺负 3 次） |
| "勇敢" | `brave = true` | `counter.bravery = 2`（反抗了 2 次） |
| "屠龙次数" | 无 | `counter.dragons_slain = 1` |
| "婚姻次数" | `married = true` | `counter.marriages = 1` |
| "暗黑程度" | `dark_path = true` | `counter.darkness = 5`（渐进式堕落） |

#### 数据结构

```typescript
interface GameState {
  // ... 现有字段 ...
  flags: Set<string>                    // 布尔标记（保持不变）
  counters: Map<string, number>         // 🆕 计数器（整数累加/累减）
}
```

---

## 四、迁移计划

### 4.1 兼容性策略

- **Phase 1（兼容）**：新增 `prerequisites`/`weightModifiers`/`counters`，但 `include`/`exclude` 仍然生效
- **Phase 2（迁移）**：逐步把 `include`/`exclude` 改写为 `prerequisites`/`mutuallyExclusive`
- **Phase 3（清理）**：移除旧的 `include`/`exclude`，统一用新 API

### 4.2 任务拆分

| # | 任务 | 文件 | 复杂度 |
|---|------|------|--------|
| T1 | 添加 `counters` 到 GameState 类型 | types.ts | 小 |
| T2 | 添加 `modify_counter` 效果到 EventModule | EventModule.ts | 小 |
| T3 | 添加 `prerequisites`/`weightModifiers` 到事件定义 | types.ts | 小 |
| T4 | 修改 pickEvent 算法（动态权重+minor降权） | SimulationEngine.ts | 中 |
| T5 | 实现 LifeRoute 类型 + 路线管理模块 | types.ts + 新文件 | 大 |
| T6 | 修改 startYear 加入路线检查逻辑 | SimulationEngine.ts | 中 |
| T7 | 设计 5-6 条生命路线数据 | events.ts | 大 |
| T8 | 把 93 个事件重新分类 priority + 添加 weightModifiers | events.ts | 大 |
| T9 | 清理 64 个死 flag（要么给它们消费者，要么删除） | events.ts | 中 |
| T10 | 把 49 major 压缩到 15-20 个 | events.ts | 中 |
| T11 | 测试脚本：20局验证（路线触发率、counter累积、动态权重、flag利用率） | test-simulation.ts | 中 |

### 4.3 依赖关系

```
T1 ──→ T2 ──→ T4
T3 ──→ T4
T5 ──→ T6 ──→ T7
T4 ──→ T8 ──→ T10 ──→ T11
              T8 ──→ T9 ──→ T11
```

### 4.4 推荐执行顺序

**第一批（基础设施，无风险）**：T1 + T2 + T3 并行
**第二批（核心算法）**：T4
**第三批（路线系统）**：T5 + T6
**第四批（数据迁移）**：T7 + T8 + T9 + T10（最大工作量）
**第五批（验证）**：T11

---

## 五、参考来源

1. **Data Structures in UE5 Blueprints for Quests and Narrative Systems** (Medium) — EventBus + Array/Map/Set 组合
2. **Event/Trigger System Architecture** (GameDev StackExchange) — Trigger-Event vs Messaging 两种流派
3. **Event-based Model of Narrative Structure for Games** (Carleton University) — 角色驱动 vs 剧情驱动的比例研究
4. **Visual Novel Branching Story Engine Architecture** (Depthtale/Arcweave 技术分析) — DAG + 条件门控 + 微决策累积
5. **Cataclysm DDA Event Processing Framework** — EOC 条件链 + context_val 跨事件传参 + JSON 数据驱动
6. **GameDev SE: Quest DAG with activate/deactivate edges** — 修改版有向图 + 4 节点状态机
7. **GameDev SE: Managing game progress with states and flags** — Flag Map + 条件边 DFS 传播 + 存档只需 flag 表

---

_文档版本: v1.0 | 创建时间: 2026-03-29 | 状态: 待 KT 审核_
