# 异世界重生模拟器 — 项目交接文档

_更新时间：2026-04-05_
_当前版本：v0.6.5_

---

## 一、项目概述

**名称**：异世界重生模拟器（Isekai Rebirth Simulator）
**类型**：文字冒险 + 人生模拟 + Galgame 模式
**技术栈**：Vue 3 + Vite 8 + TypeScript + Pinia + AJV（JSON Schema 校验）+ Canvas 2D（粒子特效）
**项目路径**：`/Users/ktsama/Projects/isekai-rebirth-simulator/`

### 核心玩法

仿"人生重开模拟器"的异世界题材文字游戏。玩家分配属性和天赋，然后在异世界中经历一生（从出生到死亡），通过选择事件分支影响人生走向，最终获得评级。

支持**多世界观模块化切换**（当前世界观：剑与魔法 Sword & Magic）。
支持**多种族**可选（当前 4 个可选种族 + 3 个待开放种族），每个种族有独立的寿命区间、属性加成、专属天赋和种族变体事件文案。

---

## 二、项目结构

```
isekai-rebirth-simulator/
├── src/
│   ├── engine/                    # 引擎层（~2910行，核心逻辑）
│   │   ├── core/
│   │   │   ├── SimulationEngine.ts  # 主引擎：游戏循环、事件触发、状态管理
│   │   │   ├── RandomProvider.ts     # 随机数生成
│   │   │   └── types.ts              # 类型定义（GameState, Event, Branch 等）
│   │   ├── modules/
│   │   │   ├── EventModule.ts        # 事件加载、条件判断、分支选择
│   │   │   ├── AttributeModule.ts    # 属性增减、成长曲线
│   │   │   ├── EvaluatorModule.ts    # 评分计算、评级判定、称号匹配
│   │   │   ├── TalentModule.ts       # 天赋抽取和效果应用
│   │   │   ├── ItemModule.ts         # 物品获取和使用
│   │   │   ├── AchievementModule.ts  # 成就检测
│   │   │   └── ConditionDSL.ts       # 条件表达式解析（如 has.flag.x & attr.str >= 10）
│   │   ├── world/
│   │   │   ├── WorldRegistry.ts      # 世界观注册和切换
│   │   │   └── WorldInstance.ts      # 世界观实例（加载事件/属性/规则等）
│   │   └── index.ts
│   ├── components/                # Vue 组件
│   │   ├── setup/                  # 初始设置（属性分配、天赋抽取）
│   │   ├── simulation/             # 模拟界面（事件场景、选择面板、状态栏）
│   │   ├── result/                 # 结果界面（最终评级、称号）
│   │   └── common/                 # 通用组件
│   ├── views/                     # 页面视图（Home/Setup/Simulation/Result/Achievement）
│   ├── stores/                    # Pinia Store（gameStore, settingsStore, worldStore）
│   ├── composables/               # 组合式函数（打字机效果等）
│   ├── styles/                    # 样式（CSS 变量、动画、主题）
│   └── utils/
├── data/sword-and-magic/          # 剑与魔法世界观数据
│   ├── events/                    # 事件数据（按年龄段分文件）
│   │   ├── birth.json              # 出生（63个事件）
│   │   ├── childhood.json          # 童年（77个事件）
│   │   ├── teenager.json           # 少年（87个事件）
│   │   ├── youth.json              # 青年（121个事件）
│   │   ├── adult.json              # 壮年（161个事件）
│   │   ├── middle-age.json         # 中年（78个事件）
│   │   └── elder.json              # 老年（76个事件）
│   ├── lore/                      # 世界观设定（1120行）
│   │   ├── factions.md             # 势力
│   │   ├── geography.md            # 地理
│   │   ├── history.md              # 历史
│   │   ├── magic-system.md         # 魔法体系
│   │   └── races.md                # 种族
│   ├── attributes.json             # 属性定义（7个可分配 + hidden组）
│   ├── talents.json                # 天赋池（68个）
│   ├── items.json                  # 物品（22个）
│   ├── achievements.json           # 成就/称号（126个）
│   ├── races.json                  # 种族定义（7个种族，4个可选）
│   ├── presets.json                # 预设角色（6个）
│   ├── rules.json                  # 评分规则和评级
│   ├── evaluations.json            # 评价称号（51个，基于 flag/属性条件触发）
│   └── manifest.json               # 世界观元数据
├── scripts/                        # 测试和分析脚本
│   ├── test-score-distribution.ts  # 主测试脚本（5性格×4局=20局，评分分布+分支统计）
│   ├── test-batch1.ts              # 50局事件触发检测+flag检测（禁止修改）
│   ├── test-final-validation.ts    # 阶段5验证脚本
│   └── analyze-flow.ts             # 事件流程分析
├── docs/                           # 设计文档
│   ├── requirements/
│   │   └── phase1-cost-benefit-symmetry.md  # 阶段1需求文档（QA产出）
│   ├── DESIGN-EVENT-SYSTEM.md      # 事件系统设计
│   ├── DESIGN-ITEM-SYSTEM.md       # 物品系统设计
│   └── TASK-PLAN-BALANCE.md        # 数值平衡计划
└── tests/                          # 单元测试
```

---

## 三、核心数据

### 属性系统

7 个可分配属性（分 20 点）：

| 属性 | 代码 | 说明 |
|------|------|------|
| 力量 | str | 体力、战斗 |
| 魅力 | chr | 社交、领导 |
| 智力 | int | 学习、策略 |
| 运气 | luk | 随机事件收益 |
| 灵性 | spr | 魔法天赋、精神力 |
| 魔力 | mag | 魔法强度 |
| 财运 | mny | 金钱相关 |

### 评分规则

| 评级 | 分数范围 | 说明 |
|------|---------|------|
| D | 0-80 | 默默无闻 |
| C | 80-130 | 平凡一生 |
| B | 130-200 | 小有成就 |
| A | 200-280 | 声名远扬 |
| S | 280-380 | 传奇人生 |
| SS | ≥380 | 不朽传说 |

**评分公式**：`属性峰值总和 + 寿命分 + 物品分 + 路线加分`

### 路线系统

tier 0-4 体系，多路线支持，权重衰减：

| 路线 | 事件数 | 说明 |
|------|--------|------|
| 通用（*） | 155 | 所有玩家都可触发 |
| 冒险者 | 27 | 战斗/探索 |
| 魔法师 | 24 | 魔法/学术 |
| 商人 | 20 | 贸易/经营 |
| 骑士 | 14 | 军事/忠诚 |
| 学者 | 14 | 研究/教学 |

### 内容规模

| 内容 | 数量 |
|------|------|
| 总事件 | 247 |
| 天赋 | 41 |
| 物品 | 20 |
| 成就/称号 | 41 |
| 评价称号 | 41 |
| 世界观文档 | 972行 |
| 引擎代码 | ~2910行 |

---

## 四、事件数据结构

事件 JSON 核心字段：

```typescript
interface GameEvent {
  id: string                    // 唯一ID
  title: string                 // 事件标题
  description: string           // 事件描述（支持变量插值 {attr.str}）
  minAge: number                // 最小触发年龄
  maxAge: number                // 最大触发年龄
  weight: number                // 触发权重
  unique?: boolean              // 是否只触发一次
  routes?: string[]             // 路线限制
  conditions?: string           // 前置条件（DSL表达式）
  branches?: EventBranch[]      // 选择分支
  effects?: Effect[]            // 无分支时的直接效果
  acquireText?: string          // 获得物品时的展示文本
}

interface EventBranch {
  id: string                    // 分支ID
  text: string                  // 选项文本
  conditions?: string           // 分支前置条件
  effects: Effect[]             // 选择后的效果
  exclude?: string[]            // 排除条件（如 widowed）
}

interface Effect {
  type: string                  // set_attribute | set_flag | remove_flag | grant_item | add_talent | set_hp | modify_attribute
  target: string                // 目标属性/flag名
  value?: number | string       // 数值
  description?: string          // 显示文本（可省略，自动从 attributes.json 查找）
}
```

**条件 DSL 示例**：
- `attribute.str >= 10` — 力量≥10
- `has.flag.married` — 已婚
- `!has.flag.widowed & state.age >= 30` — 未丧偶且≥30岁

---

## 五、当前状态

### 已完成

1. ✅ **引擎层**（~2910行）— 完整的游戏循环、事件系统、条件DSL、评分系统
2. ✅ **247个事件** — 覆盖全年龄段，含路线标注
3. ✅ **路线系统** — tier 0-4，5条职业路线 + 通用路线，权重衰减
4. ✅ **天赋/物品/成就系统** — 41天赋 + 20物品 + 41称号
5. ✅ **前端基础UI** — Vue 3 + Galgame 风格选择界面
6. ✅ **数值平衡修复（5阶段）** — 评分公式调整 + spr增益缩减 + 衰老权重降低
7. ✅ **测试脚本** — 策略引擎分支选择 + 决策理由记录
8. ✅ **QA Feedback Loop 技能** — 结构化迭代流程

### 测试基线数据（20轮，修复后）

| 指标 | 值 |
|------|-----|
| 评级分布 | A:50%, B:40%, S:5%, C:5% |
| 评分范围 | 97-292 |
| 平均寿命 | 72岁 |
| 平均评分 | ~286 |

### 已知问题

| # | 问题 | 严重度 | 状态 |
|---|------|--------|------|
| 1 | **分支设计无效**：28个必选项 + 63个废选项 | 🔴 高 | QA需求已出，待CC实现 |
| 2 | **14个缺失flag**：如 marry_adventurer 触发但缺 married flag | 🟡 中 | 待修复 |
| 3 | **入口事件拒绝率高**：多数玩家选"拒绝/犹豫" | 🟡 中 | 待优化 |
| 4 | **90+岁无人存活**：衰老曲线过于陡峭 | 🟡 中 | 已调权重，待验证 |
| 5 | **CERN 超导卡丁车**：4月1日文章，确认是愚人节内容 | ⚪ 信息 | 已识别 |

---

## 六、分支设计改造计划（当前重点）

### 问题根因

分支只有"机制性选择"（影响数值），缺少"表现性/叙事性选择"。当所有选择只影响数值时，最优解必然存在。

### 调研结论

详见 QA 需求文档：`docs/requirements/phase1-cost-benefit-symmetry.md`

### 4 阶段改造计划

| 阶段 | 目标 | 内容 | 状态 |
|------|------|------|------|
| **1. 代价-收益对称** | 消除纯正面/纯负面分支 | 19个超标分支降net + 30个废选项加正面收益 + 15个无分支事件拆分 | ❌ CC超时，待重新执行 |
| 2. Tag联动系统 | 增加不可比较维度 | 三层tag（行为/关系/命运），每个tag至少被2个后续事件消费 | 📋 待阶段1完成 |
| 3. 正交收益+性格专属 | 不同维度不可比较 | 每事件1-2通用+1性格专属选项 | 📋 待阶段2完成 |
| 4. 延迟后果 | 蝴蝶效应 | 选择后果推迟1-2阶段显现 | 📋 待阶段3完成 |

### 阶段1具体需求（QA已出）

QA 需求文档位于：`docs/requirements/phase1-cost-benefit-symmetry.md`

**改造规则**：
- R1: 单项净增幅 ≤ +5
- R2: 每个选项必须有得有失
- R3: 废选项必须增加正面收益
- R4: 不可比较的权衡（不同维度）
- R5: flag/物品必须有等价代价
- R6: 叙事性代价

**验收标准**：

| 指标 | 当前 | 阶段1目标 | 最终目标 |
|------|------|----------|---------|
| 必选项比例 | 26% | <5% | <5% |
| 废选项比例 | 74% | <15% | <10% |
| 5性格选择一致性 | 100% | <50% | <30% |
| net≥+8 分支数 | ~19 | 0 | 0 |
| net≤0 分支数 | ~30 | 0 | 0 |

**需要改造的事件清单**：
- 28个必选项（需求文档 3.1节）
- 19个超标分支 net≥+8（需求文档 3.2节）
- 50+个废选项（需求文档 3.3节）
- 15个无分支纯正面事件需拆分（需求文档 3.4节）

### 执行流程

严格走 **QA Feedback Loop**：QA定需求 → CC实现 → QA验证 → 循环

---

## 七、开发环境

```bash
# 安装依赖
cd /Users/ktsama/Projects/isekai-rebirth-simulator
npm install

# 启动开发服务器
npm run dev

# 运行测试
npx tsx scripts/test-score-distribution.ts    # 20局评分分布+分支统计
npx tsx scripts/test-batch1.ts                 # 50局事件触发检测（禁止修改）

# 单元测试
npm test
```

**Commit 约定**：`feat:` / `fix:` / `balance:` / `refactor:` / `test:`

---

## 八、注意事项

1. **禁止修改 `scripts/test-batch1.ts`**
2. **普通事件正面增幅上限 +5**（高风险事件可放宽）
3. **不要修改 `src/engine/` 下的引擎代码**（阶段1只改事件数据）
4. **事件 JSON 必须通过 AJV schema 校验**
5. **CERN 超导卡丁车文章是4月1日愚人节内容，不要当作真实科技新闻**
