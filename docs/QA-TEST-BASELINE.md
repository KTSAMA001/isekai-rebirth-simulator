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

QA 测试事件合理性时，以下规则不需要查代码，用常识即可判断：

### 生命阶段常识
- **童年不应出现**：中年危机、退休、临终、遗产分配、回忆录、老友重逢类事件
- **少年不应出现**：婚姻、育儿、职业成就、买房置地类事件
- **老年不应出现**：入学、初恋、青春期叛逆、离家冒险出发类事件
- **任何人都不应出现**：死后事件、与自己年龄明显不符的人生里程碑

### 因果关系常识
- **没结婚** → 不应该触发「婚姻纪念」「家庭晚餐」「夫妻争吵」
- **没孩子** → 不应该触发「亲子活动」「孩子升学」「孩子离家」
- **没入学** → 不应该触发「毕业」「考试」「同学聚会」
- **没加入公会** → 不应该触发「公会任务」「公会解散」
- **没当骑士** → 不应该触发「骑士团事件」「骑士退役」
- **角色还活着** → 不应该触发「葬礼」「追悼」「遗产继承」

### 年龄常识（跨种族等价表）

以下对照表示「大致等价的人生阶段」，QA 可据此判断事件是否出现在合理时间：

| 人生阶段 | 人类 | 精灵 | 矮人 | 哥布林 |
|----------|------|------|------|--------|
| 上幼儿园 | 4-5 岁 | 20-30 岁 | 8-12 岁 | 2-3 岁 |
| 上小学 | 6-10 岁 | 30-50 岁 | 12-30 岁 | 3-6 岁 |
| 青春期 | 12-16 岁 | 40-80 岁 | 25-50 岁 | 5-12 岁 |
| 成年/开始工作 | 18-22 岁 | 50-120 岁 | 35-80 岁 | 8-18 岁 |
| 结婚生子 | 22-35 岁 | 60-250 岁 | 50-150 岁 | 10-25 岁 |
| 中年危机 | 35-50 岁 | 200-380 岁 | 180-320 岁 | 18-30 岁 |
| 退休 | 55-65 岁 | 350-400 岁 | 280-350 岁 | 25-35 岁 |
| 临终/老年 | 65-85 岁 | 380-500 岁 | 320-400 岁 | 30-50 岁 |

用这个表快速判断：**如果一个哥布林 3 岁触发了「青春期叛逆」，这就是 bug。**

### 死亡相关常识
- **健康年轻人不应突然死亡**：HP 满的 20 岁角色不应该在普通事件中暴毙
- **儿童不应自然死亡**：10 岁以下有保护机制，验证这个机制是否生效
- **死亡应该是渐进的**：HP 衰减是 sigmoid 曲线，不会突然从满血归零
- **极端早亡是可能的但应该罕见**：Beta(8,3) clamp [0.60, 0.92]，低于 60% 寿命死亡的应该是少数

### 属性与事件常识
- **体魄 3 的角色不应该在战斗中获胜**（除非对手更弱）
- **智力 3 的角色不应该触发「学术成就」类事件**（除非事件条件允许）
- **魅力 3 的角色不应该触发「万人迷」类事件**
- **天赋效果应该反映在游戏过程中**：有「天生神力」的角色应该更容易在战斗事件中获胜

### 评分常识
- **不同种族的评分应该大致可比**：精灵活 400 年不应该比人类活 80 年自动高 10 倍
- **短寿但精彩的人生应该能拿到好评价**：哥布林活 30 年但经历丰富，评分应该不低
- **长寿但平淡的人生评分应该一般**：精灵活 500 年但什么都没做，不应该拿 S 级

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
