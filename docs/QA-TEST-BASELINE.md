# 测试基准文档 — isekai-rebirth-simulator

_本文档为 QA 测试提供准确的项目数据和设计意图，消除猜测空间。_

---

## 1. 项目概述

**异世界重生模拟器**（Isekai Rebirth Simulator）——文字冒险 + 人生模拟 + Galgame 风格的浏览器游戏。

- **技术栈**：Vue 3 + TypeScript + Pinia + Vite 8 + Vitest
- **引擎**：纯 TypeScript 类，无外部游戏框架
- **核心玩法**：创建角色（7属性/10抽3天赋/选种族性别）→ 逐年推进 → 分支决策 → 死亡结算

### 两个 API 流程

| API | 流程 | 用途 |
|-----|------|------|
| **Galgame 三步流程**（主流程） | `startYear()` → `resolveBranch()` / `skipYear()` | 前端实际使用，支持分支选择 |
| **simulateYear**（旧版） | `simulateYear(branchChoices?)` → `GameState` | 批量测试/自动化脚本使用 |

⚠️ `simulateYear` 内部调用 `startYear` + 自动分支选择，两套 API 最终走同一条事件处理路径。

---

## 2. 种族数据（权威来源：`data/sword-and-magic/races.json`）

| 种族 | maxLifespan | lifespanRange | playable |
|------|-------------|---------------|----------|
| 人类 (human) | **100** | [65, 85] | ✅ |
| 精灵 (elf) | **500** | [250, 400] | ✅ |
| 哥布林 (goblin) | **60** | [20, 35] | ✅ |
| 矮人 (dwarf) | **400** | [150, 250] | ✅ |

### 生命阶段定义（`lifeStages`，绝对年龄）

| 阶段 | 人类 | 精灵 | 哥布林 | 矮人 |
|------|------|------|--------|------|
| childhood | [2, 10] | [2, 50] | [1, 6] | [2, 30] |
| teen | [11, 17] | [30, 80] | [5, 12] | [20, 50] |
| youth | [14, 22] | [50, 120] | [8, 18] | [30, 80] |
| adult | [20, 45] | [80, 250] | [15, 35] | [60, 200] |
| midlife | [35, 60] | [200, 380] | [25, 50] | [180, 320] |
| elder | [55, 100] | [350, 500] | [35, 60] | [280, 400] |

⚠️ 阶段之间**有意重叠**（如人类 teen [11,17] 和 youth [14,22] 重叠 [14,17]），这是设计意图。

### manifest.json
- `maxAge`: 60 — 这是历史遗留值，**不是**种族寿命上限。实际寿命取 `raceDef.maxLifespan`。

---

## 3. 百分比系统设计

### 核心原理
事件的 `minAge/maxAge` 被视为**人类参考年龄**（百分比基准）。非人类种族按比例换算：
```
实际触发年龄 = 人类年龄 / 100 × raceMaxLifespan
```

### `getEventAgeRange` 四条路径（优先级从高到低）

| # | 条件 | 处理方式 | 示例 |
|---|------|----------|------|
| 1 | `maxAge <= 1` | 直接使用，不换算 | 出生事件 |
| 2 | 有 `races` 字段 | 绝对年龄，不换算 | 精灵专属 elder 事件 |
| 3 | 有 `lifeStage` 单值 + 种族有该阶段定义 | `raceDef.lifeStages[stage]` + `minStageProgress/maxStageProgress` | 阶段内定位 |
| 4 | 兜底（跨阶段 + 无 stage） | `minAge/100 × raceMaxLifespan` | 通用事件 |

### 第 4 路径的额外规则
- **人类跳过换算**：`raceMaxLifespan === 100` 时直接返回原值
- **心理年龄 cap**：`life`/`romance`/`social` 标签 → `maxProgress ≤ 0.50`
- **短寿命保护**：`scaledMin ≥ floor(event.minAge × 0.5)`
- **兜底**：`scaledMax = Math.max(scaledMax, scaledMin)`

### `lifeStages` 数组 vs `lifeStage` 单值
- `lifeStages`（数组）：标记事件跨哪些阶段，用于**事件加载和筛选**
- `lifeStage`（单值）：用于 `getEventAgeRange` 的第 3 路径换算
- 有 `lifeStages` 数组但没有 `lifeStage` 单值的事件 → 走第 4 路径（百分比兜底），**这是预期设计**

---

## 4. 核心机制

### HP 衰减（`regenHp`）
```
lifeProgress = age / raceMaxLifespan
sigmoid = 1 / (1 + exp(-K * (lifeProgress - personalDeathProgress)))
HP = HP - sigmoid衰减 + initialStrRegen恢复
```
- **K = 12**（sigmoid 陡度）
- **personalDeathProgress**：Beta(8,3) 采样，clamp [0.60, 0.92]
- **童年保护**：10 岁以下死亡保护（`CHILDHOOD_DEATH_PROTECTION_AGE = 10`）
- **HP 平台期**：`raceMaxLifespan >= 200 && lifeProgress < 0.5` 时 HP 不低于 `initHp × 30%`
  - 精灵（500）和矮人（400）享受此保护
  - 人类（100）和哥布林（60）不享受

### Beta(8,3) 死亡分布
- 期望值 = 8/11 ≈ 0.727，标准差 ≈ 0.11
- 大部分角色在 72.7% 寿命处开始急剧衰老
- 含义：每个角色衰老曲线不同（早衰/长寿），增加重玩性

### 评分系统（`EvaluatorModule`）
```
score = attrScore + lifespanScore + itemScore + routeBonus
lifespanScore = min(lifespan / raceMaxLifespan, 1.2) × 60
```
⚠️ EvaluatorModule 有**独立的简化 DSL**，不支持 `lifeProgress`、`has.talent`、`flag:` 等 ConditionDSL 高级语法。评价条件只能用 `attribute.xxx`、`has.flag.xxx`、`state.age` 等。

---

## 5. 事件数据

### 统计
| 文件 | 事件数 |
|------|--------|
| birth.json | 63 |
| childhood.json | 79 |
| teenager.json | 88 |
| youth.json | 126 |
| adult.json | 163 |
| middle-age.json | 80 |
| elder.json | 76 |
| **总计** | **675** |

### 事件 JSON 关键字段
```json
{
  "id": "事件唯一ID",
  "minAge": 30,          // 人类参考年龄（百分比系统分子）
  "maxAge": 50,
  "weight": 10,          // 触发权重
  "tag": "life",         // magic/combat/social/exploration/epic/life
  "priority": "minor",   // critical > major > minor
  "lifeStage": "adult",  // 单值（用于年龄换算路径3）
  "lifeStages": ["adult","midlife"],  // 数组（用于事件筛选）
  "minStageProgress": 0.3,
  "maxStageProgress": 0.7,
  "races": ["human"],    // 种族专属（路径2，绝对年龄）
  "genders": ["male"],
  "unique": true,        // 只触发一次
  "routes": ["*"],       // 路线限制
  "include": "attribute.str >= 10",  // DSL 条件
  "exclude": "",
  "branches": [...]      // 分支选择
}
```

### Phase 2 迁移的 DSL 条件
- `elder_final_illness`: `age >= 72 & hp <= 35` → `lifeProgress >= 0.72 & hp <= 35`
- `centenarian_celebration`: `age == 100` → `lifeProgress >= 1.0`（仅人类种族专属）

---

## 6. 成就 & 天赋

| 类型 | 总数 | 使用 lifeProgress |
|------|------|-------------------|
| 成就 | 127 | 12 个 |
| 天赋 | 68 | 1 个（twin_souls, lifeProgress=0.6 触发 HP-20） |

### 12 个 lifeProgress 成就
| ID | 条件 |
|----|------|
| longevity | `lifeProgress >= 0.80` |
| slum_survivor | `event.count.birth_slums >= 1 & lifeProgress >= 0.70` |
| love_and_war | `has.flag.married & has.flag.war_hero & lifeProgress >= 0.60` |
| eternal_wanderer | `lifeProgress >= 0.60 & has.flag.guild_member` |
| widowed_hero | `has.flag.widowed & lifeProgress >= 0.60` |
| peaceful_ending | `has.flag.peaceful_retirement & lifeProgress >= 0.70` |
| dragon_near_death | `has.flag.near_death & has.flag.dragon_defeated & lifeProgress >= 0.40` |
| war_hero_ach | `has.flag.war_hero & lifeProgress >= 0.50` |
| dark_savior | `has.flag.dark_embraced & has.flag.escaped_dark & lifeProgress >= 0.50` |
| fairy_companion | `has.flag.fairy_friend & lifeProgress >= 0.60` |
| eternal_peace | `has.flag.peaceful_retirement & lifeProgress >= 0.80` |
| iron_will_to_end | `lifeProgress >= 0.50 & attribute.str >= 25 & attribute.spr >= 20 & result.score >= 150` |

---

## 7. ConditionDSL 支持的标识符

| 标识符 | 含义 |
|--------|------|
| `attribute.xxx` | 当前属性值 |
| `attribute.peak.xxx` | 属性峰值 |
| `age` | 当前年龄 |
| `lifeProgress` | 生命进度 = age / effectiveMaxAge |
| `hp` | 当前 HP |
| `has.talent.id` | 拥有天赋 |
| `has.event.id` | 触发过事件 |
| `has.achievement.id` | 解锁成就 |
| `has.flag.xxx` | 拥有 flag |
| `has.counter.xxx` | 计数器 > 0 |
| `flag:name` | 拥有 flag（简写） |
| `character.race` / `character.gender` | 种族/性别 |
| `lifespan` | 实际活到岁数 |

⚠️ `effectiveMaxAge` 在 Phase 1 后等于 `raceMaxLifespan`。

---

## 8. 设计意图（QA 判断"异常"时的参考）

### ✅ 预期行为（不是 bug）
- **早逝角色不触发老年事件**：百分比换算后老年事件在高年龄，早死角色自然不会触发
- **精灵前 50 年只有童年事件**：精灵 childhood [2,50]，这是设计意图
- **10 岁以下不会自然死亡**：`CHILDHOOD_DEATH_PROTECTION_AGE = 10`
- **同一事件在阶段重叠期都可触发**：阶段设计有意重叠
- **长寿种族事件密度降低**：百分比拉伸后事件分散在更长寿命中，密度自然降低
- **人类预期死亡 ~62 岁**：Beta(8,3) 均值 0.727 × 85（lifespanRange 上界）≈ 62，合理范围
- **`twin_souls` 在各种族 60% 寿命处触发**：哥布林 21岁、人类 51岁、矮人 150岁、精灵 240岁

### ⚠️ 需要关注但不一定是 bug
- **哥布林 elder 阶段 [35,60] 但 maxLifespan=60**：elder 事件只能在最后 25 年触发
- **哥布林 youth [8,18] 有 126 个事件**：10 年里事件密度极高，部分事件可能永远轮不到（权重竞争）
- **manifest.maxAge=60**：历史遗留，不影响实际逻辑

---

## 9. 常识性判断规则

QA 测试事件合理性时，以下规则不需要查代码，用常识即可判断。

---

### 9.1 生命阶段隔离

**核心原则**：事件必须出现在正确的人生阶段，跨阶段是严重 bug。

| 阶段 | 文件 | 事件数 | 绝对不应出现的事件类型 | 具体反面示例 |
|------|------|--------|------------------------|------------|
| 出生 birth | `birth.json` | 63 | 任何自主行为、社会关系 | 考核、入学、结婚、战斗 |
| 童年 childhood | `childhood.json` | 79 | 婚姻、职业、退休、临终 | 「婚姻纪念」「退休小屋」「传承之问」 |
| 少年 teenager | `teenager.json` | 88 | 育儿、中年危机、遗产、退休 | 「含饴弄孙」「培养继承人」「孩子离家」 |
| 青年 youth | `youth.json` | 126 | 退休、临终、孙辈 | 「退休小屋」「给孙辈讲故事」「传家之宝」 |
| 成年 adult | `adult.json` | 163 | 入学、青春期叛逆 |
| 中年 middle-age | `middle-age.json` | 80 | 入学、初恋、青春期 | 「骑士考核」「加入冒险者公会」 |
| 老年 elder | `elder.json` | 76 | 入学、初恋、出发冒险 | 「加入冒险者公会」「侍从修炼」 |

**判断方法**：扫描模拟日志中的事件 `lifeStage` 字段，检查是否与事件文件归属一致。

---

### 9.2 Flag 因果链条

**核心原则**：没有前置 flag 的事件绝对不能触发。

#### 关键 Flag 链（按解锁顺序）

```
侍从修炼 (youth) → knight_examination (teenager) → 骑士锦标赛/城堡围攻/屠龙 (youth/adult)
                                       ↓
                               传说的传播 (elder: include 含 OR 组合，见 9.5 详解)

加入冒险者公会 (teenager) → 猎人公会任务/高价悬赏/未踏之地 (youth/adult)
                          → 工会晋升 (adult)

魔法学院来信 (youth, set magic_student) → magic_exam (youth, req magic_student) → 骑士的荣光/学院决斗赛 (teenager, req magic_student)
                          → magic_theory_class (youth, req magic_student)
                          → 最后的魔法 (elder: req mag≥22，不要求 magic_student flag)

感情升温 (youth) → 感情升温确认 (youth, set dating_deepen) → 求婚 (adult, req dating_deepen) → 婚礼 (adult) → 结婚周年纪念 (adult)
                                        → family_blessing/初为人父母 (adult)
                                        → family_dinner (adult)
                                        → human_grandchildren (middle-age)
                                        → 含饴弄孙/给孩子讲故事/全家聚会 (elder)

收徒传艺 (adult) → 传承之问 (middle-age: req has_student | married | lord，三 flag 满足其一即可)
                → 培养继承人 (middle-age, req parent)
                → 故徒来访 (elder: req guild_member | mage_graduate | knight | chr≥12，不检查 has_student flag)
```

#### 因果检验规则

| 前置条件 | 不应触发的事件 | 实际事件 ID |
|----------|---------------|-------------|
| 没有 `dating_deepen` flag | 「求婚」 | `marriage_proposal` |
| 没有 `engaged` flag | 「婚礼」 | `wedding_ceremony` |
| 没有 `married` flag | 「结婚周年纪念」 | `marriage_anniversary` |
| 没有 `married`+`parent` flag | 「家庭晚餐」 | `family_dinner`（需同时有 married 和 parent） |
| 没有 `parent` flag | 「含饴弄孙」「给孩子讲故事」 | `human_grandchildren`, `human_grandchild_story` |
| 没有 `knight` flag | 「骑士锦标赛」（另需 str≥14）「城堡围攻」（另需 str≥12） | `knight_tournament`, `knight_siege` |
| 没有 `guild_member` flag | 「猎人公会任务」「高价悬赏」（另需 str≥14） | `monster_hunt_guild`, `adv_bounty` |
| 没有 `magic_student` flag | 「魔法考试」「魔法理论课」 | `magic_exam`, `magic_theory_class` |
| 没有 `squire` flag | 「骑士考核」 | `knight_examination` |
| 没有 `parent` flag | 「培养继承人」 | `mid_heir_training` |
| 没有 `has_student` 或 `married` 或 `lord` flag | 「传承之问」 | `legacy_question`（三 flag 满足其一即可） |
| 没有 `dragon_slayer` flag | 「传说的传播」 | `legend_spread`（但有 knight_hero/war_hero/archmage/guild_member/mage_graduate 任一 flag 仍可触发） |
| 没有 `guild_member`+`mage_graduate`+`knight` 且 chr＜12 | 「故徒来访」 | `elder_disciple_visit`（guild_member/mage_graduate/knight/chr≥12 四条件满足其一即可，不检查 has_student） |
| 没有 `parent` flag | 「全家聚会」 | `human_family_photo`（elder，人类专属） |

**判断方法**：检查模拟日志中每个事件触发时，角色是否已持有 `include` 条件要求的 flag。

---

### 9.3 跨种族年龄等价

以下对照表示「大致等价的人生阶段」，QA 可据此判断事件是否出现在合理时间：

| 人生阶段 | 人类 (100) | 精灵 (500) | 矮人 (400) | 哥布林 (60) |
|----------|------------|------------|------------|-------------|
| 出生 | 0 | 0 | 0 | 0 |
| 上幼儿园 | 4-5 岁 | 20-25 岁 | 8-12 岁 | 2-3 岁 |
| 上小学 | 6-10 岁 | 30-50 岁 | 12-30 岁 | 3-6 岁 |
| 青春期 | 12-16 岁 | 60-80 岁 | 48-64 岁 | 7-10 岁 |
| 成年/开始工作 | 18-22 岁 | 90-110 岁 | 72-88 岁 | 11-13 岁 |
| 结婚生子 | 22-35 岁 | 110-250 岁 | 88-200 岁 | 13-30 岁 |
| 中年危机 | 35-50 岁 | 175-250 岁 | 140-200 岁 | 21-30 岁 |
| 退休 | 55-65 岁 | 275-325 岁 | 220-260 岁 | 33-39 岁 |
| 临终/老年 | 65-85 岁 | 325-425 岁 | 260-340 岁 | 39-51 岁 |

**快速判断公式**：`等价年龄 = 事件人类年龄 × (种族 maxLifespan / 100)`

#### 常见 bug 模式

- ❌ 哥布林 3 岁触发「青春期叛逆」→ 等价于人类 0.5 岁，不可能
- ❌ 精灵 50 岁触发「退休小屋」→ 等价于人类 10 岁，不可能
- ❌ 矮人 100 岁触发「传说的传播」→ 等价于人类 25 岁，太早
- ✅ 精灵 400 岁触发「传说的传播」→ 等价于人类 80 岁，合理
- ✅ 哥布林 35 岁触发「退休小屋」→ 等价于人类 58 岁，合理

---

### 9.4 HP 与死亡系统

#### HP 公式细节

```
初始 HP = max(25, 25 + 体魄 × 3)  ← 最低 25，防止体魄为 0 时初始 HP 过低
初始体魄恢复量 = max(1, 1 + floor(初始体魄 / 3))  ← 基于 allocateAttributes 后的体魄，固定不变
每年恢复 = min(初始体魄恢复量, max(3, floor(initHp × 0.12)))

Sigmoid 衰减：
  K = 12
  sigmoidValue = 1 / (1 + exp(-12 × (lifeProgress - personalDeathProgress)))
  sigmoidDecay = floor(25 × sigmoidValue)

二次加速（超过死亡进度后）：
  excessProgress = max(0, lifeProgress - personalDeathProgress)
  quadDecay = floor(excessProgress² × 80)

年龄衰减 = sigmoidDecay + quadDecay
单年衰减上限 = max(floor(initHp × 0.20), 12)  ← 不会突然暴毙
```

#### 死亡进度分布

```
personalDeathProgress = Beta(8, 3)，clamp 到 [0.60, 0.92]

含义：
- 8,3 的 Beta 分布中位数约 0.73 → 大多数角色在寿命的 73% 左右开始明显衰老
- 下限 0.60 → 最早在 60% 寿命时开始衰老（人类 60 岁、精灵 300 岁）
- 上限 0.92 → 最晚在 92% 寿命时开始衰老（人类 92 岁、精灵 460 岁）
```

#### 保护机制

| 机制 | 规则 | 验证方法 |
|------|------|----------|
| 童年死亡保护 | 10 岁以下 `ageDecay = 0` | 模拟 1000 次，检查 10 岁前是否有自然死亡 |
| 长寿种族 HP 平台 | `raceMaxLifespan >= 200 && lifeProgress < 0.5` 时 HP ≥ `initHp × 30%` | 精灵/矮人在生命前半段 HP 不低于 30% |
| 单年净损失上限 | `max(floor(initHp × 0.20), 12)` | 任何一年 HP 变化不超过初始 HP 的 20% |
| 超寿命惩罚 | `lifeProgress > 1.0` 时额外衰减 `floor((lifeProgress-1.0) × 60)`，上限 `maxYearlyDecay × 2` | 超过 maxLifespan 的角色应快速死亡 |

#### 死亡判断规则

- ✅ **健康年轻人不应突然死亡**：HP 满的 20 岁角色，ageDecay 接近 0，不应该在普通事件中暴毙
- ✅ **儿童不应自然死亡**：10 岁以下 ageDecay 强制为 0，验证不应出现 10 岁前自然死亡
- ✅ **死亡应该渐进**：sigmoid K=12 集中在 personalDeathProgress 附近，HP 不会突然从满血归零
- ✅ **极端早亡罕见但可能**：Beta(8,3) clamp [0.60, 0.92]，低于 60% 寿命死亡的只有当事件伤害叠加 HP 时才可能
- ✅ **不应永生**：超寿命惩罚确保 `lifeProgress > 1.0` 后加速死亡

---

### 9.5 属性门槛与事件匹配

**核心原则**：事件 `include` 条件中的属性门槛必须被尊重。

#### 典型属性门槛

| 事件 | 属性要求 | 反面判断 |
|------|----------|-----------|
| `birth_noble` 降生贵族 | `mny ≥ 6` | 财富 3 的角色不应触发 |
| `birth_slums` 贫民窟的黎明 | `mny ≤ 2` | 财富 8 的角色不应触发 |
| `fairy_encounter` 林中的精灵 | `luk ≥ 6 & spr ≥ 4` | 幸运 2 的角色不应触发 |
| `knight_examination` 骑士考核 | `has.flag.squire`（无直接属性门槛） | 没有 squire flag 不应触发 |
| `magic_academy_enrollment` 魔法学院来信 | `mag ≥ 8` | 魔力 3 的角色不应触发 |
| `magic_graduate` 魔法学院毕业 | `has.flag.magic_student & int ≥ 10` | 无 flag 或智力低不应触发 |
| `dragon_slay_attempt` 讨伐巨龙 | `str ≥ 14 \| mag ≥ 14`（OR，任一即可） | 体魄 5 且魔力 5 的角色不应触发 |
| `marry_noble` 政治联姻 | `(chr ≥ 10 & mny ≥ 8 & has.flag.knight) \| has.flag.lord \| has.flag.merchant_master`（DSL `&` 优先级高于 `\|`，lord/merchant_master 不需要属性门槛） | 魅力 3 无 flag 不应触发 |
| `marriage_proposal` 求婚 | `has.flag.dating_deepen` | 没有 dating_deepen flag 不应触发 |
| `adult_guild_promotion` 工会晋升 | `has.flag.guild_member`（+ 属性） | 无 flag 不应触发 |
| `legend_spread` 传说的传播 | `(chr≥15 & dragon_slayer) \| knight_hero \| war_hero \| archmage \| (famous_inventor & knight) \| guild_member \| mage_graduate`（DSL 中 `&` 优先级高于 `\|`，无需 chr≥15 即可凭单一英雄/职业 flag 触发） | 拥有任一英雄/职业类 flag 即可能触发 |
| `peaceful_end` 平静的终章 | `spr ≥ 8 & has.flag.parent` | 无 parent flag 不应触发 |
| `magic_breakthrough_final` 最后的魔法 | `mag ≥ 22` | 魔力 10 不应触发 |
| `legacy_question` 传承之问 | `has_student \| married \| lord` | 三个 flag 满足其一即可 |

#### 评价系统属性门槛

| 评价 | 属性要求 |
|------|----------|
| `eva_genius` 天赋异禀 | `int ≥ 25 & mag ≥ 25` |
| `eva_juggernaut` 不可阻挡 | `str ≥ 30` |
| `eva_silver_tongue` 三寸不烂之舌 | `chr ≥ 30` |

---

### 9.6 评分系统

#### 评分等级

| 等级 | 标题 | 分数范围 | 描述 |
|------|------|----------|------|
| D | 默默无闻 | 0-120 | 没有留下任何痕迹 |
| C | 平凡一生 | 120-200 | 普通而平静 |
| B | 小有成就 | 200-280 | 某个领域有一定成就 |
| A | 声名远扬 | 280-380 | 被许多人铭记 |
| S | 传奇人生 | 380-500 | 堪称传奇 |
| SS | 不朽传说 | 500+ | 传说永远流传 |

#### 评分常识判断
- **不同种族评分应大致可比**：精灵活 400 年不应比人类活 80 年自动高 5 倍（评分应基于事件质量而非寿命长度）
- **短寿但精彩的人生应拿到好评价**：哥布林活 30 年但经历丰富（战斗、冒险、结婚），评分应 ≥ B
- **长寿但平淡的人生评分应一般**：精灵活 500 年但没获得任何 flag、没触发特殊事件，评分应 ≤ C
- **满分 SS 需要传奇成就**：屠龙 + 骑士 + 传奇传播等多重成就叠加才可能达到

---

### 9.7 minStageProgress / maxStageProgress 校验

事件文件中的 `minStageProgress` / `maxStageProgress` 是百分比范围内的附加约束。QA 应检查：

- 设了 `minStageProgress: 0.6` 的事件不应在 lifeProgress < 0.6 时触发
- 设了 `maxStageProgress: 0.3` 的事件不应在 lifeProgress > 0.3 时触发
- 各文件实际使用的范围应与文件含义一致（例如 elder.json 中不应出现 `maxStageProgress: 0.1` 的事件）

---

### 9.8 事件效果落地验证

**核心原则**：事件触发了，描述的后果就必须在角色状态上实际生效。触发 ≠ 发生。

#### 常见「假触发」Bug 模式

| 事件描述 | 应有的状态变化 | Bug 表现 |
|----------|--------------|----------|
| 「家被烧毁」「房屋倒塌」 | 财富 (mny) 下降 | 触发了事件但财富值没变 |
| 「受重伤」「遭遇袭击」 | HP 下降 | 触发了事件但 HP 没扣 |
| 「拜师学艺」「获得传承」 | 获得 flag 或属性提升 | 触发了事件但没有获得对应的 flag |
| 「结婚」「婚礼」 | 获得 `married` flag | 触发了事件但 flag 没设 |
| 「加入公会」 | 获得 `guild_member` flag | 触发了事件但后续公会事件仍不可用 |
| 「怀孕」「孩子降生」 | 获得 `parent` flag | 触发了事件但亲子事件不触发 |
| 「晋升」「封爵」 | 获得对应 flag + 属性变化 | 触发了事件但没有 `knight`/`lord` flag |
| 「获得神器」「得到传说装备」 | 获得物品 | 触发了事件但背包里没有 |
| 「被诅咒」「中毒」 | HP 持续下降或获得 debuff | 触发了事件但后续 HP 衰减无变化 |
| 「失忆」「能力退化」 | 属性下降 | 触发了事件但属性值没变 |

#### 验证方法

1. **前后对比法**：记录事件触发前的角色状态（HP、属性、flag 列表、物品列表），触发后对比是否发生了预期变化
2. **Effect 审查法**：检查事件的 `effects` 数组是否为空或缺少关键效果类型（`modify_hp`、`modify_attribute`、`set_flag`、`grant_item`）
3. **Flag 传播验证**：设了 flag 的事件触发后，依赖该 flag 的后续事件是否在正确时机被触发
4. **物品落地验证**：获得物品的事件触发后，检查物品是否出现在物品栏中，且是否实际生效（如 HP 恢复加成）

#### 判断规则

- ❌ 事件 `effects` 数组为空，但事件描述明确表示状态变化 → 一定是 bug
- ❌ 事件描述「失去了 X」但 `effects` 里没有对应的 `modify_attribute`/`modify_hp` → 可能是 bug
- ⚠️ 纯叙事事件（如「做了一个梦」「回忆往事」）没有 `effects` 是正常的
- ✅ 多分支事件中只有部分分支有状态变化是正常的（玩家选择导致不同后果）

---

## 10. 测试重点场景

### A. 各种族寿命分布
| 种族 | maxLifespan | 预期大部分死亡区间 | 关注点 |
|------|-------------|-------------------|--------|
| 人类 | 100 | 65-85 岁 | 少数早亡/长寿 |
| 精灵 | 500 | 250-400 岁 | elder 事件 275+ |
| 哥布林 | 60 | 20-35 岁 | elder 事件 35+ |
| 矮人 | 400 | 150-250 岁 | elder 事件 280+ |

### B. 哥布林专项
- childhood/teenager 事件在正确年龄段触发
- elder 事件在 35-60 岁触发
- 心理年龄 cap：浪漫/社交事件在 30 岁前（60×0.50）触发完
- 不出现"5岁触发中年事件"

### C. 精灵专项
- elder 事件在 350+ 岁触发
- HP 平台期保护生效（lifeProgress < 0.5 时 HP ≥ initHp×30%）
- 不出现"50岁精灵触发临终事件"

### D. 事件链条完整性
- 冒险者路线：guild_member → 冒险任务 → 路线锚点
- 家庭路线：married → 亲子事件 → 家庭 dinner
- 魔法学院路线：mage_graduate → 魔法事件链
- 检查：有 flag 才触发依赖事件，无 flag 不触发

### E. 边界情况
- 极端早逝（最小可能年龄死亡）
- 极端长寿（活到接近 maxLifespan）
- `scaledMin > scaledMax` 边界（短寿命保护兜底）

---

_最后更新：2026-04-14（基于 Phase 0-2 完成后的代码状态）_
