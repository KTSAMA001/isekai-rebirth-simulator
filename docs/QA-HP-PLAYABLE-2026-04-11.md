# HP 系统深度 QA 报告 — 可玩种族数值分析

**日期**: 2026-04-11  
**范围**: 4 个可玩种族 (human/elf/goblin/dwarf) × 2 性别 × 15 局 = 120 局  
**引擎版本**: 当前 master 分支  
**测试方法**: 修改 `scripts/quick-stats-hp.ts` 自动推演，记录逐年 HP 快照

---

## 一、HP 系统全要素梳理

### 1.1 HP 影响因素总览

| # | 影响源 | 代码位置 | 方向 | 量级 | 触发条件 |
|---|--------|----------|------|------|----------|
| 1 | 初始HP计算 | `SimulationEngine.ts:180` `computeInitHp()` | **设置** | `25 + str × 3` | 游戏初始化 / 属性分配时 |
| 2 | 年度HP恢复 | `SimulationEngine.ts:188` `regenHp()` | **增加** | `initialStrRegen = 1 + floor(initStr/3)` | 每年 `startYear()` 开始时 |
| 3 | 软上限 | `SimulationEngine.ts:201-204` | **限制** | `initHp × softCapMultiplier` (×1.1 → ×0.3) | 每年 `regenHp()` 中 clamp |
| 4 | 年龄衰减 | `SimulationEngine.ts:209-222` | **减少** | 0~4 点阶梯衰减 (基于 lifeRatio) | lifeRatio ≥ 0.68 开始 |
| 5 | 超龄加速 | `SimulationEngine.ts:224-226` | **减少** | `floor(overageRatio × 30)` 额外衰减 | lifeRatio > 1.0 |
| 6 | 事件 modify_hp | `EventModule.ts:330-337` | **增/减** | -30 ~ +15 | 事件触发时 |
| 7 | 致命打击 | `EventModule.ts:333-335` | **额外减少** | -10 | 单次伤害 > 当前HP的50% |
| 8 | 濒死判定 | `SimulationEngine.ts:300-312` `postYearProcessCore()` | **致命** | 20% 概率直接 HP→0 | 每年末 HP ≤ 10 且 > 0 |
| 9 | 奇迹生还 | `SimulationEngine.ts:307-309` | **恢复** | +18 HP | 濒死时 15% 概率触发 |
| 10 | 免死道具 | `SimulationEngine.ts:315-319` | **恢复** | 物品定义值 (15) | HP ≤ 0 时消耗物品 |
| 11 | 物品HP恢复加成 | `ItemModule.ts:55-58` `getHpRegenBonus()` | **增加** | 物品定义值 | 每年 `regenHp()` 中 |
| 12 | 物品HP上限修正 | `ItemModule.ts:62-65` `getHpCapModifier()` | **改变上限** | 物品定义百分比 | 每年 `regenHp()` 中 |
| 13 | maxHpBonus | `SimulationEngine.ts:332` | **增加上限** | 事件设置的绝对值 | `regenHp()` 软上限计算 |
| 14 | 物品一次性HP加成 | `SimulationEngine.ts:264-267` / `ItemModule.ts:133-136` | **增加** | 物品定义值 | 获取物品时一次性 |
| 15 | 天赋HP修改 | `SimulationEngine.ts:195-213` + `TalentModule.ts` | **增/减** | 天赋定义值 | `trigger_on_age` 时 |
| 16 | 属性变化对HP | `AttributeModule` 间接 | **间接** | 修改 str 后不影响 HP（HP 只看 initStr） | 永远不影响 |

### 1.2 关键发现：死代码 / 未生效系统

| 问题 | 严重等级 | 详情 |
|------|----------|------|
| **`damage_reduction` 未被应用** | **P1 功能缺陷** | `ItemModule.getDamageReduction()` 已实现，但 `EventModule.applyEffectsOnState()` 的 `modify_hp` 分支（line 330）和 `SimulationEngine` 中均未调用。旅人斗篷(-15%)、龙鳞护符(-20%)、圣剑(-15%) 的伤害减免**完全不生效**。 |
| **`conditional_regen` 未被调用** | **P1 功能缺陷** | `ItemModule.getConditionalRegen()` 已实现，但 `regenHp()` 中未调用。灵魂宝石(HP<30恢复8)、孤儿手环(HP<25恢复10)、暗黑之镜(HP<20恢复15) 的条件恢复**完全不生效**。 |
| **`initialStrRegen` 不随属性成长** | 设计决策（非缺陷） | `allocateAttributes()` 时固定 `initialStrRegen = 1 + floor(initStr/3)`，后续事件提升 str 不会增加 HP 恢复量。注释明确说明了这是设计意图。 |

### 1.3 HP 衰减阶梯详解

基于 `lifeRatio = age / effectiveMaxAge`：

| lifeRatio | 衰减量 | 说明 |
|-----------|--------|------|
| < 0.68 | 0 | 青壮年，无衰减 |
| 0.68 ~ 0.78 | 1 | 初老 |
| 0.78 ~ 0.85 | 2 | 中老 |
| 0.85 ~ 0.92 | 3 | 晚年 |
| 0.92 ~ 1.0 | 4 | 衰老期 |
| 1.0 ~ 1.1 | 7 + extra | 超龄 |
| > 1.1 | 10 + extra | 极高龄 |
| lifeRatio > 1.0 | + floor((lifeRatio-1.0) × 30) | 超龄加速 |

**目标设计**：对平均体魄角色 (regen≈4)，lifeRatio≈0.92 时 net regen≈0。

### 1.4 软上限衰减

```
primeAge = effectiveMaxAge × 0.35
softCapMultiplier = max(1.1 - max(0, age - primeAge) × (0.4 / (effectiveMaxAge × 0.65)), 0.3)
```

- 青年期 (age ≤ primeAge): softCap = initHp × 1.1
- 满龄 (age = effectiveMaxAge): softCap = initHp × 0.7
- 最低: softCap = max(initHp × 0.3, 20)

### 1.5 事件 modify_hp 完整清单

| 事件ID | 文件 | value | 说明 |
|--------|------|-------|------|
| spr_near_death (branch:neardeath_accept) | adult | +15 | 灵魂濒死接受 |
| spr_near_death (base) | adult | -15 | 灵魂濒死伤害 |
| human_plague_survivor | adult | -2 | 瘟疫后遗症 |
| elf_lament_for_fallen | adult | -1 | 精灵哀悼 |
| random_minor_injury | childhood | -1 | 小伤 |
| elder_peaceful_days | elder | +10 | 安详晚年 |
| elder_natural_death | elder | -30 | 自然死亡 |
| elder_miracle_recovery | elder | +5 | 奇迹恢复 |
| mid_health_scare | middle-age | -2 | 健康警报 |
| goblin_old_bones_ache | middle-age | -1 | 哥布林老骨痛 |
| elf_healing_spring | youth | +3 | 治愈泉水 |
| goblin_alchemy_accident | youth | -1 | 炼金事故 |

加上分支效果中的额外事件。

**关键观察**：modify_hp 事件数量极少（仅 12 个基础 + 分支），且伤害量级很小（-1 ~ -30），绝大多数事件根本不涉及 HP。每年只有约 1 个事件触发，其中涉及 HP 的概率极低。

### 1.6 天赋 HP 影响

| 天赋 | 效果 | 触发 |
|------|------|------|
| 双生魂 (twin_souls) | HP -20 | age=60 时触发 |

仅此一个天赋直接影响 HP，且为 rare 级别，抽取概率极低。

### 1.7 物品 HP 相关效果

| 物品 | 效果类型 | 值 | 备注 |
|------|----------|-----|------|
| 草药袋 | hp_regen_bonus | +1 | ✅ 生效 |
| 旅人斗篷 | damage_reduction | 0.15 | ❌ **未生效**（死代码） |
| 龙鳞护符 | damage_reduction | 0.20 | ❌ **未生效**（死代码） |
| 诅咒之刃 | hp_regen_bonus | -1, hp_cap_modifier | -1 生效, cap_modifier ✅ |
| 灵魂宝石 | conditional_regen | 8 (HP<30) | ❌ **未生效**（死代码） |
| 圣剑 | hp_regen_bonus | +2, damage_reduction | +2 生效, reduction ❌ |
| 圣光坠饰 | hp_regen_bonus | +1 | ✅ 生效 |
| 孤儿手环 | conditional_regen | 10 (HP<25), hp_regen_bonus +0.5 | conditional ❌, regen ✅ |
| 暗黑之镜 | conditional_regen | 15 (HP<20), hp_cap_modifier | conditional ❌, cap_modifier ✅ |

---

## 二、可玩种族数值测试

### 2.1 开局属性分布

| 种族 | 性别 | str | int | chr | mny | spr | mag | luk | 初始HP |
|------|------|-----|-----|-----|-----|-----|-----|-----|--------|
| 🧑 人类 | M | 9 | 9 | 9 | 6 | 11 | 12 | 9 | 46 |
| 🧑 人类 | F | 12 | 8 | 12 | 12 | 12 | 10 | 8 | 49 |
| 🧝 精灵 | M | 6 | 13 | 11 | 10 | 11 | 14 | 9 | 40 |
| 🧝 精灵 | F | 6 | 12 | 14 | 6 | 11 | 15 | 10 | 37 |
| 👺 哥布林 | M | 3 | 16 | 8 | 3 | 8 | 10 | 17 | 31 |
| 👺 哥布林 | F | 6 | 16 | 9 | 5 | 10 | 7 | 13 | 34 |
| ⛏️ 矮人 | M | 17 | 8 | 9 | 6 | 12 | 7 | 12 | 67 |
| ⛏️ 矮人 | F | 14 | 11 | 8 | 11 | 9 | 4 | 9 | 55 |

**初始 HP 差异巨大**：矮人 (55~67) > 人类 (46~49) > 精灵 (37~40) > 哥布林 (31~34)。矮人初始 HP 是哥布林的 2 倍。

### 2.2 HP 初始值、巅峰值、最终值

| 种族 | 性别 | 初始HP | 巅峰HP(均) | 死亡HP(中位) | 寿命(中位) |
|------|------|--------|------------|-------------|-----------|
| 🧑 人类 | M | 54.6 | 127.1 | 0 | 94 |
| 🧑 人类 | F | 47.8 | 106.6 | 19 | 91 |
| 🧝 精灵 | M | 37.0 | 189.4 | 31 | 402 |
| 🧝 精灵 | F | 37.2 | 199.1 | 33 | 419 |
| 👺 哥布林 | M | 38.0 | 65.8 | 5 | 35 |
| 👺 哥布林 | F | 36.4 | 63.6 | 18 | 33 |
| ⛏️ 矮人 | M | 68.6 | 164.3 | 0 | 192 |
| ⛏️ 矮人 | F | 60.6 | 165.1 | 0 | 193 |

**巅峰 HP 差异**：精灵 > 矮人 > 人类 > 哥布林。虽然矮人初始 HP 最高，但精灵凭借超长寿命积累了更多 HP。

### 2.3 HP 逐年变化曲线（中位局关键节点）

#### 🧑 人类 (寿命94, effectiveMaxAge=83)

```
Age  | Ratio | HP   | ΔHP | 事件
  0  | 0.00  |  46  |  +0 |
  8  | 0.10  |  72  |  +4 | human_market_day
 16  | 0.19  |  81  |  +4 | youth_shared_roof
 24  | 0.29  | 113  |  +4 | adult_plague_crisis
 33  | 0.40  | 127  |  -1 | adult_neighborhood_request
 41  | 0.49  | 132  |  -1 | hunting_trip
 49  | 0.59  | 130  |  +0 | human_land_dispute
 58  | 0.70  | 124  |  -1 | elder_dream_fulfilled
 66  | 0.80  | 110  |  -1 | elder_unexpected_visitor
 74  | 0.89  | 102  |  -1 | random_weather_blessing
 83  | 1.00  |  78  |  +0 | elder_world_peace
```

人类 HP 曲线在 lifeRatio 0.4~0.5 达到巅峰（~130），之后缓慢下降。到 lifeRatio=1.0 仍有 78 HP，远超死亡线。

#### 🧝 精灵 (寿命406, effectiveMaxAge=391)

```
Age  | Ratio | HP   | ΔHP | 事件
  0  | 0.00  |  40  |  +0 |
 39  | 0.10  |  80  |  +3 | random_good_meal
 78  | 0.20  | 119  |  +0 | youth_shared_roof
117  | 0.30  | 106  |  +0 | random_weather_blessing
156  | 0.40  |  98  |  +3 | dark_cult_encounter
195  | 0.50  | 135  |  +3 | random_street_performance
234  | 0.60  | 177  |  +0 | mid_legacy_review
273  | 0.70  | 163  |  +0 | mana_overflow
312  | 0.80  | 135  |  +1 | random_weather_blessing
351  | 0.90  | 126  |  -1 | elf_farewell_ceremony
391  | 1.00  |  93  |  -1 | elder_world_peace
```

精灵 HP 在 lifeRatio 0.6 达到巅峰（~177），之后因衰退开始下降。到 lifeRatio=1.0 仍有 93 HP，极其安全。

#### 👺 哥布林 (寿命35, effectiveMaxAge=31)

```
Age  | Ratio | HP   | ΔHP | 事件
  0  | 0.00  |  31  |  +0 |
  3  | 0.10  |  37  |  +2 | river_discovery
  6  | 0.19  |  30  |  +0 | teen_first_adventure
  9  | 0.29  |  36  |  +2 | pet_companion
 12  | 0.39  |  42  |  +2 | mid_natural_disaster
 15  | 0.48  |  48  |  +2 | mid_legacy_project
 18  | 0.58  |  40  |  -8 | goblin_junkyard_palace
 21  | 0.68  |  42  |  +2 | goblin_cooking_contest
 24  | 0.77  |  36  |  -6 | goblin_poison_master
 27  | 0.87  |  34  |  -1 | goblin_rescue_mission
 31  | 1.00  |  28  |  -2 | elder_world_peace
```

哥布林 HP 曲线呈现明显的脉冲式波动（事件伤害 -8、-6），因为低 HP 下事件伤害占比大。到 lifeRatio=1.0 仍有 28 HP。

#### ⛏️ 矮人 (寿命192, effectiveMaxAge=160)

```
Age  | Ratio | HP   | ΔHP | 事件
  0  | 0.00  |  79  |  +0 |
 16  | 0.10  | 113  |  +7 | child_night_sky
 32  | 0.20  | 139  |  +0 | youth_dungeon_first
 48  | 0.30  | 145  | -17 | random_nightmare_visit
 64  | 0.40  | 187  |  -1 | random_helping_stranger
 80  | 0.50  | 183  |  +0 | cryptic_manuscript
 96  | 0.60  | 182  |  +8 | mid_magic_potion
112  | 0.70  | 158  |  +0 | mid_dwarf_apprentice_oath
128  | 0.80  | 133  |  +6 | elder_last_journey
144  | 0.90  | 124  |  -1 | elder_old_enemy
160  | 1.00  | 116  |  -1 | elder_world_peace
```

矮人 HP 极其稳定。即使 lifeRatio=1.0，仍有 116 HP。初始高 HP + 高 strRegen 让矮人几乎不可能死于自然衰老。

### 2.4 寿命统计

| 种族 | 性别 | min | 10% | 25% | 中位 | 75% | 90% | max | 平均 |
|------|------|-----|-----|-----|------|-----|-----|-----|------|
| 🧑 人类 | M | 75 | 83 | 85 | 94 | 98 | 102 | 111 | 92.7 |
| 🧑 人类 | F | 45 | 61 | 65 | 91 | 99 | 101 | 101 | 82.4 |
| 🧝 精灵 | M | 35 | 381 | 397 | 402 | 429 | 446 | 453 | 386.8 |
| 🧝 精灵 | F | 382 | 383 | 390 | 419 | 431 | 435 | 443 | 413.9 |
| 👺 哥布林 | M | 18 | 20 | 29 | 35 | 39 | 41 | 47 | 33.6 |
| 👺 哥布林 | F | 12 | 14 | 29 | 33 | 38 | 40 | 40 | 30.6 |
| ⛏️ 矮人 | M | 184 | 187 | 188 | 192 | 197 | 198 | 200 | 191.7 |
| ⛏️ 矮人 | F | 181 | 183 | 187 | 193 | 200 | 201 | 207 | 193.5 |

**观察**：
- 矮人几乎精确死在 lifespanRange (160~180) 附近，方差极小（184~207）
- 精灵普遍超过 lifespanRange (380~420)，达到 419~453
- 人类和哥布林方差较大，有早死风险（哥布林 min=12）
- **人类女性方差大**：min=45 vs max=101，有 1 局意外早逝

### 2.5 评分统计

| 种族 | 性别 | min | 中位 | 平均 | max | 评级分布 |
|------|------|-----|------|------|-----|----------|
| 🧑 人类 | M | 316.5 | 376.2 | 378.5 | 417.6 | SS×7 S×8 |
| 🧑 人类 | F | 201.9 | 372.0 | 342.6 | 407.1 | S×6 SS×6 A×3 |
| 🧝 精灵 | M | 203.1 | 1178.1 | 1114.8 | 1227.0 | SS×14 A×1 |
| 🧝 精灵 | F | 1129.8 | 1176.9 | 1185.7 | 1338.0 | SS×15 |
| 👺 哥布林 | M | 131.4 | 207.3 | 199.1 | 242.4 | B×7 A×8 |
| 👺 哥布林 | F | 121.8 | 193.5 | 188.6 | 245.4 | C×3 B×6 A×6 |
| ⛏️ 矮人 | M | 498.3 | 573.6 | 567.0 | 612.3 | SS×15 |
| ⛏️ 矮人 | F | 525.3 | 576.6 | 573.0 | 618.3 | SS×15 |

### 2.6 死因分析

| 种族 | 性别 | 自然衰老 | 事件致死 | 濒死致死 | 总数 |
|------|------|----------|----------|----------|------|
| 🧑 人类 | M | 13 | 0 | 2 | 15 |
| 🧑 人类 | F | 14 | 1 | 0 | 15 |
| 🧝 精灵 | M | 15 | 0 | 0 | 15 |
| 🧝 精灵 | F | 15 | 0 | 0 | 15 |
| 👺 哥布林 | M | 11 | 3 | 1 | 15 |
| 👺 哥布林 | F | 12 | 3 | 0 | 15 |
| ⛏️ 矮人 | M | 15 | 0 | 0 | 15 |
| ⛏️ 矮人 | F | 15 | 0 | 0 | 15 |

### 2.7 满寿率（寿命 ≥ effectiveMaxAge × 0.9）

| 种族 | 满寿率 |
|------|--------|
| 🧑 人类 | 80.0% (24/30) |
| 🧝 精灵 | **96.7%** (29/30) |
| 👺 哥布林 | 73.3% (22/30) |
| ⛏️ 矮人 | **100%** (30/30) |

---

## 三、根因分析 + 调整建议

### 3.1 为什么大多数角色活到满寿？

**核心问题：HP 恢复 > HP 损失**

以人类为例（str≈10, initStrRegen = 1 + floor(10/3) = 4）：

| 生命阶段 | lifeRatio | regen | decay | net | 累计年数 |
|----------|-----------|-------|-------|-----|---------|
| 青壮年 | 0~0.68 | 4 | 0 | +4/年 | ~56年 |
| 初老 | 0.68~0.78 | 4 | 1 | +3/年 | ~9年 |
| 中老 | 0.78~0.85 | 4 | 2 | +2/年 | ~6年 |
| 晚年 | 0.85~0.92 | 4 | 3 | +1/年 | ~6年 |
| 衰老 | 0.92~1.0 | 4 | 4 | 0/年 | ~7年 |
| 超龄 | 1.0~1.1 | 4 | 7+ | -3~+/年 | ~9年 |

**分析**：
1. **前 68% 生命完全无衰减**，角色 HP 持续积累到软上限（初始 HP 的 1.1 倍）
2. **net regen = 0 在 lifeRatio=0.92 才达到**，但此时 HP 已远超 0（通常是 80~130）
3. **超龄后才开始净损失**，但衰减公式不够激进：`floor((ratio-1.0) × 30)` 在 ratio=1.1 时才额外 +3，regen=4 仍然 > 0
4. **事件 HP 损失几乎可以忽略**：120 局中仅 7 局因事件致死（全部是哥布林），其余 113 局完全死于自然衰老

**总结**：HP 系统的设计意图是"自然衰老致死"，但衰减曲线过于平缓，角色积累了过多 HP 缓冲，导致超龄后仍需很久才能耗尽 HP。

### 3.2 评分公式对长短寿种族的差距

```
score = peakSum × 1.2 + lifespan × 0.3 + items × 3 + route × 15
```

| 种族 | 峰值属性(均) | 属性分(×1.2) | 寿命(均) | 寿命分(×0.3) | 寿命占评分比 |
|------|-------------|-------------|---------|-------------|------------|
| 🧑 人类 | 277.6 | 333.1 | 87.5 | 26.3 | **7.3%** |
| 🧝 精灵 | 853.5 | 1024.2 | 400.4 | 120.1 | **10.5%** |
| 👺 哥布林 | 153.3 | 184.0 | 32.1 | 9.6 | **5.0%** |
| ⛏️ 矮人 | 424.3 | 509.1 | 192.6 | 57.8 | **10.2%** |

**量化差距**：
- **精灵 vs 哥布林评分比 = 6.0:1**（1185 vs 194）
- 寿命分差距：精灵 120 vs 哥布林 9.6 = **12.5 倍**
- 但寿命分仅占总分的 5~10%，**真正的差距来自属性峰值**（精灵活得久，属性积累多）
- 矮人评分 SS 锁定（全部 30 局 SS），哥布林永远无法超过 A 级

**根本问题**：评分公式中 `lifespan × 0.3` 的权重对长短寿种族差异太小。精灵 400 年寿命仅多拿 91 分，但多出的 300 年事件让属性峰值多积累 600+ 分。**寿命的影响是通过属性积累间接放大的**，而非直接来自寿命分项。

### 3.3 HP 衰老曲线调整建议

#### 问题诊断

当前衰减在 lifeRatio=0.92 才达到 net regen=0，这意味着角色有 92% 的生命处于 HP 积累期。超龄后衰减不够快，矮人甚至永远死不掉（HP 恒正）。

#### 方案 A：降低起始衰减点 + 增加阶梯梯度

```
lifeRatio ≥ 0.55 → decay = 1   (当前 0.68)
lifeRatio ≥ 0.65 → decay = 2   (当前 0.78)
lifeRatio ≥ 0.75 → decay = 3   (当前 0.85)
lifeRatio ≥ 0.82 → decay = 5   (当前 0.92 → 4)
lifeRatio ≥ 0.90 → decay = 7   (新增)
lifeRatio ≥ 0.95 → decay = 10  (新增)
lifeRatio ≥ 1.00 → decay = 15  (当前 7)
lifeRatio ≥ 1.05 → decay = 25  (新增)
lifeRatio ≥ 1.10 → decay = 40  (新增，当前 10+extra)
```

**预期效果**：对 regen=4 的角色，net regen=0 在 lifeRatio≈0.75 达到（而非 0.92），让后半生成为 HP 下降期。

#### 方案 B：引入非线性加速（推荐）

在现有阶梯基础上，增加基于 lifeRatio 的指数加速：

```
baseDecay = 当前阶梯值 (1/2/3/4)
ageFactor = 1 + (lifeRatio - 0.68)² × 3  // 晚年加速
effectiveDecay = floor(baseDecay × ageFactor)
```

**预期效果**：
- lifeRatio=0.70: ageFactor = 1.001 → 几乎无变化
- lifeRatio=0.85: ageFactor = 1.29 → decay 3 → 3.8 → 3
- lifeRatio=0.95: ageFactor = 2.15 → decay 4 → 8.6 → 8
- lifeRatio=1.00: ageFactor = 3.03 → decay 7 → 21.2 → 21
- lifeRatio=1.05: ageFactor = 4.42 → decay 10 → 44 → 44

这样后期衰减急剧加速，确保超龄角色不会拖延太久。

#### 方案 C：软上限同步衰减

当前软上限到 lifeRatio=1.0 仍有 initHp × 0.7，这太高了。建议：

```
softCapMultiplier = max(1.1 - max(0, age - primeAge) × (0.8 / (effectiveMaxAge × 0.65)), 0.15)
```

将满龄软上限从 ×0.7 降到 ×0.3，最低从 ×0.3 降到 ×0.15。

### 3.4 事件 HP 损失是否足够？

**当前状态：严重不足**

| 年龄段 | 事件文件数 | modify_hp 事件数 | 最大单次伤害 |
|--------|-----------|-----------------|-------------|
| childhood (2-6) | 1 | 1 | -1 |
| teenager (7-15) | 1 | 1 | -4 |
| youth (16-24) | 1 | 3 | -2 |
| adult (25-50) | 1 | 7 | -15 |
| middle-age (51-80) | 1 | 4 | -2 |
| elder (81+) | 1 | 3 | -30 |

**问题**：
1. 236 个事件中仅 12 个有 modify_hp（**5% 概率**）
2. 大多数伤害只有 -1 ~ -2，对于 50~200 的 HP 池来说微不足道
3. 最大的伤害 -15 (spr_near_death) 只在特定条件下触发
4. 成年/中年期（25~80 岁）是"冒险黄金期"，但伤害事件反而最少

**建议**：
- 在战斗类事件（tag=combat）中增加 modify_hp 失败分支
- 成年期（25~50）增加 5~10 个中等伤害事件（-5 ~ -10）
- 中年期（51~80）增加 3~5 个健康恶化事件（-3 ~ -8）
- 考虑给所有战斗失败分支增加 HP 损失

---

## 四、缺陷汇总

| # | 问题 | 等级 | 影响 | 修复建议 |
|---|------|------|------|----------|
| 1 | `damage_reduction` 效果未应用 | **P1** | 3 个物品（旅人斗篷、龙鳞护符、圣剑）的伤害减免完全不生效 | 在 `EventModule.applyEffectsOnState()` 的 modify_hp 分支中调用 `ItemModule.getDamageReduction()`，将负值伤害乘以 `(1 - reduction)` |
| 2 | `conditional_regen` 效果未调用 | **P1** | 3 个物品（灵魂宝石、孤儿手环、暗黑之镜）的条件恢复完全不生效 | 在 `regenHp()` 中调用 `ItemModule.getConditionalRegen(state)` 并加到恢复量 |
| 3 | HP 衰减曲线过于平缓 | **P2** | >80% 角色活到满寿，游戏缺乏紧张感 | 参见 3.3 节方案 B（非线性加速） |
| 4 | 事件 HP 损失不足 | **P2** | 仅 5% 事件影响 HP，战斗类事件无 HP 后果 | 增加战斗失败分支的 HP 损失 |
| 5 | 精灵/矮人 vs 哥布林 评分差距过大 | **P3** | 哥布林永远无法达到 S 级以上 | 调整评分公式，考虑标准化寿命贡献或引入种族评分系数 |

---

## 五、测试环境

- **脚本**: `scripts/quick-stats-hp.ts`（增强版 quick-stats，增加 HP 逐年追踪和死因分析）
- **种子**: 20000 + idx × 7919（确定性种子，可复现）
- **属性分配**: 随机分配 20 点（每属性 1~5，尽可能均匀）
- **天赋选择**: 取前 3 个抽取天赋
- **分支选择**: 优先选第一个条件满足的分支

_报告生成时间: 2026-04-11 18:13 CST_
