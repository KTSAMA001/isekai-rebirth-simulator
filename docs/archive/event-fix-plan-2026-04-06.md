# 事件逻辑修复计划

> 目标：修复编年史中的叙事逻辑错误，只改事件 JSON，不改代码。
> 日期：2026-04-06

---

## Phase 1：Flag 连通性修复（核心状态机）

### 1.1 恋爱 → 婚姻 → 家庭 状态链

**问题**：家庭事件（孩子离家、天伦之乐、退休小屋提"妻子"）不检查 married/parent flag，导致未婚也能触发。

**修复清单**：

| 文件 | 事件ID | 修改 |
|------|--------|------|
| middle-age.json | `human_son_leaves_home` | 加 `include: has.flag.parent`（已有，检查是否生效） |
| elder.json | `elder_family_reunion` | 已有 `include: has.flag.parent`，OK |
| elder.json | `human_retirement_cottage` | 加 `include: has.flag.married`，描述中提到"妻子最爱的花" |
| middle-age.json | `human_grandchildren` | 已有 `include: has.flag.parent`，OK |
| elder.json | `human_grandchild_laughter` | 已有 `include: has.flag.parent`，OK |
| middle-age.json | `mid_adopt_orphan` | 已有 `include: attribute.chr >= 10 & attribute.mny >= 8`，加 `set_flag: parent`（已有） |

**关键**：`human_retirement_cottage` 提到"妻子"，必须要求已婚。如果未婚触发了这个事件，描述中的"妻子"就不成立。

### 1.2 魔王击杀 → 后续战争互斥

**问题**：39岁击杀魔王后，46岁"战争爆发"仍触发，且描述是"魔王军入侵"。

**修复清单**：

| 文件 | 事件ID | 修改 |
|------|--------|------|
| adult.json | `war_breaks_out` | 加 `exclude: has.flag.demon_king_slayer`，或新增一个分支：如果已击杀魔王，改为"旧部叛乱"或"军阀混战"而非"魔王军入侵" |
| adult.json | `war_breaks_out` | **备选方案**：加两个版本的战争事件，一个 `war_breaks_out`（魔王军入侵，exclude demon_king_slayer），一个 `war_aftermath`（战后动荡，include demon_king_slayer） |

### 1.3 贵族身份联动

**问题**：`noble_birth` flag 设置后无任何事件检查它，贵族和平民体验完全一样。

**修复清单**：

| 文件 | 事件ID | 修改 |
|------|--------|------|
| childhood.json | `human_harvest_help` | 加 `exclude: has.flag.noble_birth`（贵族少爷不帮忙收割） |
| childhood.json | `human_street_gang` | 加 `exclude: has.flag.noble_birth`（贵族少爷不混街头） |
| youth.json | `part_time_work` | 加 `exclude: has.flag.noble_birth`（贵族少爷不打工） |
| youth.json | `youth_short_term_job` | 加 `exclude: has.flag.noble_birth` |
| youth.json | `part_time_job` | 加 `exclude: has.flag.noble_birth` |
| teenager.json | `human_first_job` | 加 `exclude: has.flag.noble_birth` |
| **新增** | `noble_etiquette_class` | 贵族礼仪课（childhood，include noble_birth） |
| **新增** | `noble_sword_training` | 贵族剑术训练（teenager，include noble_birth） |
| **新增** | `noble_social_debut` | 贵族社交初登场（youth，include noble_birth） |

**注意**：新增事件需要完整的 JSON 结构（id、title、description、minAge、maxAge、weight、branches、effects）。

---

## Phase 2：Condition 补全（防泄漏触发）

### 2.1 重复事件去重

**问题**：观星、丰盛一餐、老友重逢等重复出现，破坏沉浸感。

**修复清单**：

| 文件 | 事件ID | 修改 |
|------|--------|------|
| youth.json | `star_gazing` | 加 `unique: true`（已有）→ 确认 unique 生效 |
| teenager.json | `random_stargazing` | 加 `unique: true` |
| childhood.json | `random_good_meal` | 加 `unique: true` |
| youth.json | `random_found_coin` → 实际在 childhood | `random_found_coin` | 加 `unique: true` |
| adult.json | `old_friend_reunion` | 已有 unique，OK |
| middle-age.json | `mid_old_friend_reunion` | 加 `exclude: has.flag.old_friend_reunion_met`，或在触发后 set 一个 flag |
| elder.json | `elder_reunion` | 同上 |

**方案**：让"老友重逢"类事件共享一个 flag（如 `friend_reunion_happened`），后续重逢事件 exclude 这个 flag。或者改描述为"又一次重逢"而非"多年未见"。

### 2.2 无结果事件补全

**问题**：瘟疫、暗黑教团、闭关高人、延寿秘术等选择后无成功/失败判定。

**修复清单**：

| 文件 | 事件ID | 修改 |
|------|--------|------|
| adult.json | `adult_plague_crisis` | "帮助救治病人"分支加 probability + DC 判定（如 `attribute.spr >= 10` 判定成功） |
| adult.json | `dark_cult_encounter` | "潜入调查"分支加 probability + DC 判定，成功 set `dark_intel` flag，后续可触发新事件 |
| youth.json | `secret_master` / `traveling_sage` | "寻找高人"分支加 probability 或 DC |
| elder.json | `elder_frail` | "寻找延寿秘术"分支加 probability，成功则 `modify_hp +20`，失败则不变 |

### 2.3 佣兵生涯补全

| 文件 | 事件ID | 修改 |
|------|--------|------|
| adult.json | `human_mercenary_life` | 补充 branches（选择）和 probability（结果），不要只有一个描述 |

---

## Phase 3：判定维度修复

### 3.1 魔王战判定不合理

**问题**：魔力 6 的人正面硬刚魔王成功。

**修复清单**：

| 文件 | 事件ID | 修改 |
|------|--------|------|
| adult.json | `challenge_final_boss` | include 已经是 `str>=18 | mag>=18`，如果 str 足够高可以打过，那 OK。问题在于**正面迎战**这个分支的判定——检查分支 probability 是否考虑了 mag |
| adult.json | `challenge_final_boss` | "直面魔王"分支的判定条件应改为：成功需要 `(str >= 20 | mag >= 20 | (str >= 14 & mag >= 14))`，不能只靠一项 |

### 3.2 龙蛋卖钱效果确认

**问题**：卖龙蛋给 mny+6，但编年史中家境没涨。

**验证**：卖龙蛋分支确实有 `modify_attribute mny +6`。如果家境没涨，可能是后续事件扣了。**这个可能不是 bug，需要看完整属性变化链**。

---

## Phase 4：新增事件补齐叙事

### 4.1 贵族专属事件链

| 年龄段 | 事件ID | 标题 | 描述概要 |
|--------|--------|------|----------|
| 6-8 | `noble_childhood_tutor` | 家庭教师 | 贵族少爷的学习日常 |
| 9-11 | `noble_sword_lesson` | 剑术启蒙 | 贵族必须会剑术 |
| 12-14 | `noble_ball_first` | 第一次舞会 | 贵族社交初体验 |
| 15-17 | `noble_inheritance_pressure` | 继承的压力 | 家族对你的期望 |
| 22-28 | `noble_estate_management` | 庄园管理 | 学会管理家族领地 |

### 4.2 暗黑教团后续

| 年龄段 | 事件ID | 标题 | 描述 |
|--------|--------|------|------|
| 32-38 | `dark_cult_aftermath` | 暗影的低语 | 潜入调查后，教团的回应 |

### 4.3 恋爱桥段增强（确保状态机能走通）

- 确认 `first_love` → `dating_start` → `dating_deepen` → `marriage_proposal` → `wedding_ceremony` 这条链的 include/exclude 无断裂
- 当前看起来完整，但 `wedding_ceremony` 的 include 是 `has.flag.engaged`，而 `marriage_proposal` 才 set `engaged`。需要确认 `marriage_proposal` 的 include `has.flag.dating_deepen` 能正确触发
- **关键**：`dating_deepen` 的 include 是 `has.flag.dating`，`dating_start` 的 include 是 `has.flag.first_love`。这条链完整。

---

## 执行顺序

1. **Phase 1**（最高优先）— Flag 连通性：1.2 魔王互斥 → 1.1 家庭条件 → 1.3 贵族身份
2. **Phase 2**（高优先）— Condition 补全：2.1 去重 → 2.2 无结果 → 2.3 佣兵
3. **Phase 3**（中优先）— 判定维度：3.1 魔王战
4. **Phase 4**（低优先）— 新增事件：4.1 贵族链 → 4.2 教团后续

每个 Phase 可以拆成独立的 CC 任务，按文件分组提交。
