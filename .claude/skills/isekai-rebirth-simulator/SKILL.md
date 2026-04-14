---
name: isekai-rebirth-simulator
description: 异世界重生模拟器项目的开发技能。涵盖事件/成就/天赋/种族/物品/评语/预设/属性的内容添加、数据校验、Flag一致性检查、DSL条件编写、引擎模块接口、测试编写、CI/CD部署。当用户提到异世界重生模拟器、isekai-rebirth-simulator、添加事件/成就/天赋/种族、校验数据、检查Flag、写DSL条件、写游戏测试、修改引擎模块、部署/发布/推送/更新远端/同步仓库时触发。即使用户只是说"加个事件"、"写个成就"、"检查一下数据"、"跑一下测试"、"更新一下远端"、"部署上去"，只要当前工作区是 isekai-rebirth-simulator 项目就应该触发。
---

# 异世界重生模拟器 — 项目开发技能

## 项目定位

文字类人生模拟器。玩家选择种族、性别、身份、天赋后，引擎逐年推演人生事件，最终生成评分和评语。

**技术栈：** Vue 3.5 + Vite 8 + TypeScript 5.9 + Pinia + Vitest

**项目路径：** 当前工作区根目录

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

### 年龄缩放规则（百分比系统）

事件的 `minAge`/`maxAge` 被视为**人类参考年龄**（百分比基准 = 100）。非人类种族按比例换算：`实际年龄 = minAge / 100 × raceMaxLifespan`

四条路径（优先级从高到低）：
1. **出生事件** (maxAge ≤ 1)：直接使用，不换算
2. **种族专属事件** (有 `races` 字段)：绝对年龄，不换算
3. **单阶段事件** (有 `lifeStage` 单值 + 种族有该阶段定义)：用 `raceDef.lifeStages[stage]` + `minStageProgress/maxStageProgress`
4. **兜底** (跨阶段 / 无 stage)：`minAge/100 × raceMaxLifespan`
   - 人类跳过换算（maxLifespan === 100 时直接返回原值）
   - **心理年龄 cap**：`life`/`romance`/`social` 标签 → `maxProgress ≤ 0.50`
   - **短寿命保护**：`scaledMin ≥ floor(event.minAge × 0.5)`

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

| 文件 | 人类参考年龄 | 说明 |
|------|-------------|------|
| birth.json | 0-1 | 出生事件 |
| childhood.json | 2-6 | 童年 |
| teenager.json | 7-15 | 少年 |
| youth.json | 16-24 | 青年 |
| adult.json | 25-50 | 成年 |
| middle-age.json | 51-80 | 中年 |
| elder.json | 81+ | 老年 |

> ⚠️ 年龄值是人类参考年龄（百分比基准 = 100），非人类种族经过百分比换算。新事件的 `minAge` 决定放入哪个文件。

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
| `lifeProgress` | 生命进度 = age / raceMaxLifespan | `lifeProgress >= 0.72` |
| `lifespan` | 实际寿命（仅结算后可用） | `lifespan >= 80` |
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

### flag 简写语法

`flag:<name>` 是 `has.flag.<name>` 的等价简写，两者效果相同：

```
flag:dragon_rider  ≡  has.flag.dragon_rider
```

> 数据文件中主要使用 `has.flag.<name>`，但引擎解析器同时支持两种写法。

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

### EventEffect 中 trigger_on_age 新增字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `lifeProgress` | 按生命进度百分比触发（替代绝对 age） | `0.6` 表示 60% 寿命时触发 |

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
- effects 的 `type` 支持：`modify_attribute`, `multiply_attribute`, `add_event`, `trigger_on_age`（支持 `lifeProgress` 字段）

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

# 3. DSL 语法检查（修改条件表达式后务必执行）
python3 scripts/content-tool.py check-dsl "has.flag.xxx & attribute.str >= 10"

# 4. Flag 一致性
python3 scripts/content-tool.py check-flags

# 5. 单元测试
npx vitest run

# 6. 开发服务器启动（可选）
npx vite
```

---

## 当前种族与属性

### 可用种族

| ID | 名称 | maxLifespan | lifespanRange | 可玩 | 特点 |
|----|------|-------------|---------------|------|------|
| human | 人类 | 100 | [65, 85] | ✅ | 均衡 |
| elf | 精灵 | 500 | [250, 400] | ✅ | mag+8, int+5, str-5 |
| goblin | 哥布林 | 60 | [20, 35] | ✅ | luk+10, str-8, chr-6 |
| dwarf | 矮人 | 400 | [150, 250] | ✅ | str+8, mag-5 |
| beastfolk | 兽人 | — | — | ❌ | str+10, mag-8 |
| seaelf | 海精灵 | — | — | ❌ | mag+12, str-8 |
| halfdragon | 半龙人 | — | — | ❌ | str+10, mag+8, chr-10 |

> 寿命为近似范围（~10-18%浮动）。实际死亡由HP系统驱动，角色只要HP>0就可存活，甚至超过寿命上限。

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

## 关键常量

| 常量 | 值 | 说明 |
|------|----|------|
| `HUMAN_BASE_LIFESPAN` | 100 | 人类参考寿命（百分比基准） |
| `CHILDHOOD_DEATH_PROTECTION_AGE` | 10 | 10 岁以下死亡保护 |
| `PSYCHOLOGY_CAP` | 0.50 | 心理年龄 cap（life/romance/social 标签） |
| `SHORT_LIFESPAN_MIN_RATIO` | 0.5 | 短寿命保护系数 |
| 死亡进度分布 | Beta(8,3) clamp [0.60, 0.92] | 每个角色衰老曲线不同 |
| HP sigmoid 陡度 | K=12 | 衰减曲线陡度 |
| HP 平台期 | raceMaxLifespan >= 200 && lifeProgress < 0.5 | 精灵/矮人 HP ≥ initHp×30% |

---

## 日志格式

所有日志输出遵循统一格式：

```typescript
Debug.Log($"KT---{功能}---{内容}---{DateTime.Now:HH:mm:ss}");
// 示例（虽然本项目是 Vue/TS，但有需要时使用）
console.log(`KT---EventModule---事件池候选 ${candidates.length} 个---${new Date().toLocaleTimeString()}`);
```

---

## 部署与 CI/CD

### 部署架构

- **托管平台：** GitHub Pages（静态托管，无后端）
- **仓库：** `KTSAMA001/isekai-rebirth-simulator`（public，免费计划不支持私有仓库 Pages）
- **线上地址：** https://ktsama001.github.io/isekai-rebirth-simulator/
- **自动部署：** 推送到 `master` 分支后，GitHub Actions 自动构建并部署
- **工作流文件：** `.github/workflows/deploy.yml`

### 部署流程

```
git push origin master
  → GitHub Actions 触发
    → npm ci --legacy-peer-deps
    → VITE_BASE=/<仓库名>/ npm run build
    → upload-pages-artifact (dist/)
    → deploy-pages
  → 线上更新（通常 1-2 分钟）
```

### 关键配置要点

1. **Base 路径：** `vite.config.ts` 中 `base` 通过 `process.env.VITE_BASE ?? '/'` 动态注入。本地开发为 `/`，CI 中为 `/<仓库名>/`
2. **依赖安装：** 必须使用 `--legacy-peer-deps`，因为 `vite-plugin-pwa` 的 peer dependency 未声明 Vite 8 兼容
3. **全局常量类型：** Vite `define` 注入的全局常量（如 `__APP_VERSION__`）必须在 `src/env.d.ts` 中声明 `declare const`，否则 `vue-tsc` 编译会报错导致 CI 失败
4. **Hash 路由：** 使用 `createWebHashHistory()`，无需服务端 URL 重写，兼容所有静态托管
5. **PWA Service Worker：** 构建产物包含 SW，用户首次访问后可离线使用，再次访问自动更新缓存

### 常用运维命令

```bash
# 提交并推送（自动触发部署）
git add -A && git commit -m "feat: <描述>" && git push

# 检查最新部署状态
gh api repos/KTSAMA001/isekai-rebirth-simulator/actions/runs \
  --jq '.workflow_runs[0] | "\(.status) \(.conclusion // "进行中") \(.head_sha[:7])"'

# 查看部署失败日志
gh api repos/KTSAMA001/isekai-rebirth-simulator/actions/runs/<RUN_ID>/jobs \
  --jq '.jobs[0].id' | xargs -I{} gh api repos/KTSAMA001/isekai-rebirth-simulator/actions/jobs/{}/logs 2>&1 | tail -30

# 本地模拟 CI 构建（验证不会失败）
VITE_BASE=/isekai-rebirth-simulator/ npm run build

# 手动触发部署
gh workflow run deploy.yml

# 确认远端同步状态
git fetch origin && git log --oneline origin/master -3
```

### 常见部署问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| CI 构建失败：TS2552 找不到全局变量 | Vite `define` 的常量缺少类型声明 | 在 `src/env.d.ts` 添加 `declare const` |
| Pages 返回 404 | 仓库为 private（免费计划限制） | 改为 public |
| 线上内容未更新 | 浏览器/PWA 缓存 | `Cmd+Shift+R` 强制刷新 |
| 线上版本落后 | 最新一次 Actions 运行失败 | 用上面的命令检查失败原因 |

---

## 版本号管理

### 规则（强制）

**每次提交修复或新功能后，必须提升 `package.json` 中的 `version` 字段。**

遵循 [Semantic Versioning](https://semver.org/)：

| 变更类型 | 版本位 | 示例 | 说明 |
|----------|--------|------|------|
| 破坏性变更（引擎接口/数据格式不兼容） | MAJOR | 0.x.x → 1.0.0 | 目前 0.x 阶段暂不区分 |
| 新功能（新事件、新成就、新种族、新模块） | MINOR | 0.1.x → 0.2.0 | `feat:` 提交 |
| 修复（数据修正、逻辑修复、文案修正） | PATCH | 0.1.0 → 0.1.1 | `fix:` 提交 |

### 操作流程

1. 完成代码修改并通过测试
2. 根据变更类型提升 `package.json` 的 `version`
3. 一并提交版本号变更（不需要单独提交）
4. 推送后版本号自动通过 `__APP_VERSION__` 显示在首页底部

### 注意事项

- `docs:`、`chore:` 类提交（纯文档/配置变更）不需要提升版本号
- 多个修复可以合并为一次 patch 提升
- 版本号变更应包含在功能/修复的同一个 commit 中，不要单独提交
