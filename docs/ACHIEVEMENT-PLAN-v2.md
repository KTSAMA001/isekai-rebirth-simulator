# 成就系统升级详细计划 v2

_2026-04-12 · 基于当前 127 成就 + 688 事件 + 257 flag 分析_

---

## 一、现有阈值调整（7 个成就）

| ID | 成就名 | 现有条件 | 调整后 | 理由 |
|---|--------|---------|--------|------|
| `lucky_star` | 天选之人 | luk ≥ 30 | luk ≥ 25 | luk 总增益仅 36，30 极难 |
| `wealth_peak` | 富可敌国 | mny ≥ 30 | mny ≥ 25 | mny 总增益仅 39 |
| `goblin_tycoon` | 利润至上 | mny ≥ 35 | mny ≥ 30 | 同上，种族专属稍微高一点 |
| `elf_magic_pinnacle` | 魔法的极致 | mag ≥ 45 & spr ≥ 35 | mag ≥ 40 & spr ≥ 35 | mag 总增益 71，45 太极端 |
| `centenarian` | 传奇人生 | 全属性 peak ≥ 20 | 全属性 peak ≥ 15 | 默认值 0→5，降低门槛 |
| `master_of_all` | 六边形战士 | 全属性 peak ≥ 20 | 保留 ≥ 20 | 作为高难度成就 |
| `completionist` | 全成就 | count ≥ 115 | **count ≥ 157** | 改为总数-1 |

---

## 二、属性专属路线成就（19 个新增）

每条路线 2-3 个成就，形成递进链：入门 → 进阶 → 传说。

### 🔨 体魄路线（str 主导）

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `str_warrior_path` | 蛮力觉醒 | `has.flag.fighter_spirit & attribute.peak.str >= 20` | 以力量开辟人生道路 | 否 |
| `str_iron_veteran` | 百战之躯 | `has.flag.war_veteran & has.flag.war_hero & attribute.peak.str >= 30` | 身经百战，钢铁般的身体 | 否 |
| `str_legendary_fighter` | 传说之拳 | `has.flag.champion & has.flag.war_hero & attribute.peak.str >= 40` | 你就是战场上的传奇 | 是 |

### 📖 智慧路线（int 主导）

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `int_scholar_path` | 求知之路 | `has.flag.truth_seeker & attribute.peak.int >= 20` | 知识就是力量 | 否 |
| `int_great_scholar` | 博学多才 | `has.flag.researcher & has.flag.great_scholar & attribute.peak.int >= 30` | 在学术领域登峰造极 | 否 |
| `int_enlightened_sage` | 顿悟之智 | `has.flag.enlightened & attribute.peak.int >= 40` | 突破知识边界，触及真理 | 是 |

### 💋 魅力路线（chr 主导）— 含花花公子

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `chr_social_butterfly` | 社交之星 | `has.flag.social_star & attribute.peak.chr >= 20` | 走到哪里都是焦点 | 否 |
| `chr_playboy` | 花花公子 | `has.flag.first_love & has.flag.in_relationship & has.flag.heartbroken & has.flag.dating` | 桃花不断，情史丰富 | 否 |
| `chr_charm_legend` | 万人迷 | `has.flag.orator & has.flag.noble_admirer & has.flag.in_relationship & attribute.peak.chr >= 35` | 你的魅力无人能挡 | 是 |
| `chr_hearts_collector` | 众星捧月 | `has.flag.eloped & has.flag.soul_bound & has.flag.wedding_grand & attribute.peak.chr >= 40` | 经历了一切形式的爱 | 是 |

### ✨ 魔力路线（mag 主导）

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `mag_arcane_path` | 魔导觉醒 | `has.flag.magic_natural & attribute.peak.mag >= 20` | 天生的魔力亲和 | 否 |
| `mag_elemental_master` | 元素掌控 | `has.flag.elemental_master & attribute.peak.mag >= 30` | 掌握元素之力 | 否 |
| `mag_arcane_pinnacle` | 魔导至极 | `has.flag.elemental_lord & attribute.peak.mag >= 40` | 魔法的终极形态 | 是 |

### 🔮 灵魂路线（spr 主导）

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `spr_inner_peace` | 内心平和 | `has.flag.inner_peace & attribute.peak.spr >= 20` | 找到心灵的宁静 | 否 |
| `spr_prophet` | 先知 | `has.flag.prophet & has.flag.prophet_dream & attribute.peak.spr >= 30` | 看见未来的碎片 | 否 |
| `spr_transcendent` | 超凡觉醒 | `has.flag.ascended & attribute.peak.spr >= 40` | 灵魂超越肉体的极限 | 是 |

### 🍀 运势路线（luk 主导）

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `luk_lucky_beginner` | 好运连连 | `has.flag.lottery_winner & attribute.peak.luk >= 15` | 仿佛被命运眷顾 | 否 |
| `luck_fate_master` | 天命所归 | `has.flag.lottery_winner & has.flag.lucky_coin & attribute.peak.luk >= 25` | 你就是幸运本身 | 是 |

### 💰 家境路线（mny 主导）

| ID | 成就名 | 条件 | 描述 | 隐藏 |
|---|--------|------|------|------|
| `mny_business_path` | 商业头脑 | `has.flag.business_owner & attribute.peak.mny >= 20` | 从小本经营开始 | 否 |
| `mny_tycoon` | 商业帝国 | `has.flag.business_tycoon & has.flag.economic_genius & attribute.peak.mny >= 30` | 建立商业帝国 | 是 |

---

## 三、补全"孤儿 flag"成就（12 个新增）

从 171 个无成就引用的 flag 中挑选叙事完整的：

| ID | 成就名 | 条件 | 描述 | 类别 | 隐藏 |
|---|--------|------|------|------|------|
| `ach_curse_breaker` | 破咒者 | `has.flag.cursed & has.flag.curse_breaker` | 挣脱命运的诅咒 | 魔法 | 是 |
| `ach_treasure_hunter` | 寻宝大师 | `has.flag.treasure_hunter & has.flag.artifact_owner` | 发现失落的宝藏 | 冒险 | 否 |
| `ach_field_medic` | 战地医者 | `has.flag.field_medic & has.flag.healer` | 战场上救死扶伤 | 战斗 | 否 |
| `ach_philanthropist` | 大慈善家 | `has.flag.philanthropist & has.flag.beloved_lord` | 富有且仁慈 | 人生 | 是 |
| `ach_became_god` | 封神 | `has.flag.became_god` | 超越凡人，化为神明 | 史诗 | 是 |
| `ach_soul_corrupted` | 堕落灵魂 | `has.flag.soul_corrupted` | 被黑暗彻底吞噬 | 秘密 | 是 |
| `ach_enlightened` | 顿悟 | `has.flag.inner_peace & has.flag.aging_accepted` | 接受生命的终章 | 秘密 | 是 |
| `ach_cursed_birth` | 厄运之子 | `has.flag.cursed_birth & has.flag.cursed` | 生来被诅咒，却走完一生 | 人生 | 是 |
| `ach_shadow_agent` | 暗影行者 | `has.flag.shadow_birth & has.flag.underworld_contact` | 生于暗影，行走于黑暗 | 秘密 | 是 |
| `ach_exile_return` | 流放者的归来 | `has.flag.village_exiled & has.flag.beloved_lord` | 被驱逐后赢得荣耀归来 | 人生 | 是 |
| `ach_barracks_hero` | 军营英雄 | `has.flag.barracks_birth & has.flag.war_hero` | 从军营走出战争英雄 | 战斗 | 是 |
| `ach_dragon_omen` | 龙血觉醒 | `has.flag.dragon_omen_birth & has.flag.dragon_slayer` | 龙兆之子，终成屠龙者 | 史诗 | 是 |

---

## 四、新增路线成就（现有路线补充）

| ID | 成就名 | 条件 | 描述 | 类别 | 隐藏 |
|---|--------|------|------|------|------|
| `route_healer_path` | 治愈者之路 | `has.flag.healer & has.flag.herbal_knowledge` | 掌握治愈之力 | 路线 | 否 |
| `route_explorer` | 探索者之路 | `has.flag.legend_explorer & has.flag.dungeon_first` | 探索世界的每一个角落 | 路线 | 否 |

---

## 五、数量汇总

| 类别 | 现有 | 新增 | 合计 |
|------|------|------|------|
| 属性路线（新增类别） | 0 | 19 | 19 |
| 补全 flag 成就 | 0 | 12 | 12 |
| 现有路线补充 | 7 | 2 | 9 |
| 阈值调整（不新增） | 7 | 0 | 7 |
| **总成就** | **127** | **+33** | **160** |

`completionist` 更新为：`achievement.count >= 159`

---

## 六、执行步骤

1. **阈值调整** — 修改现有 7 个成就的 condition
2. **新增 33 个成就** — 追加到 achievements.json
3. **ConditionDSL 验证** — 确认所有新条件语法正确（`has.flag.xxx`, `attribute.peak.xxx >= N`, `&`, `|`）
4. **flag 存在性校验** — 确认每个成就引用的 flag 在事件中确实被 `set_flag`
5. **QA 测试** — 让 QA 跑几局验证新成就的可达成性

---

_待确认后开始实施_
