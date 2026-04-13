# 成就系统 + 事件链升级计划 v3

_2026-04-12 · 基于当前 127 成就 + 688 事件分析_

---

## 核心问题

当前各属性方向的事件覆盖极度不均：

| 属性 | 事件数 | 问题 |
|------|--------|------|
| spr | 169 | 过多（大量无关事件也带 spr） |
| int | 122 | 较多但分散 |
| chr | 116 | 较多但恋爱链短 |
| str | 104 | 中等，缺乏职业链 |
| mny | 86 | 中等 |
| mag | 66 | 偏少，缺乏非学院路线 |
| luk | 19 | **严重不足**，几乎无路线体验 |

**恋爱链只有约 18 个事件，且集中在 teenager-adult 两个阶段。**

---

## 一、事件链新增方案

### 💋 魅力/花花公子路线（chr）— 新增 ~15 个事件

**现有恋爱链缺口：**
- 童年/青少年缺乏"魅力觉醒"前置
- 成年后缺乏"多线并行"的花花公子体验
- 缺乏追求被拒、三角关系等社交冲突

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `chr_cute_baby` | 人见人爱 | chr >= 6 | chr+2, luk+1 | `social_butterfly` |
| childhood | `chr_child_prince` | 孩子王 | chr >= 5 | chr+2, str+1 | |
| teenager | `chr_first_admirer` | 收到情书 | chr >= 10 | chr+2, spr+1 | `first_admirer` |
| teenager | `chr_dance_invitation` | 舞会的邀约 | chr >= 8 | chr+3, int+1 | |
| teenager | `chr_popular_crowd` | 潮流圈子 | chr >= 12 | chr+3, luk+1, spr-1 | `popular_crowd` |
| youth | `chr_multi_suitors` | 追求者的纠缠 | chr >= 15, has.flag.in_relationship | chr+2, spr-1 | `multi_suitors` |
| youth | `chr_rejected_someone` | 拒绝了别人 | chr >= 12 | chr+1, int+1 | `rejected_someone` |
| youth | `chr_secret_admirer` | 匿名情书 | chr >= 15 | chr+2, luk+1 | `secret_admirer` |
| adult | `chr_love_triangle` | 三角关系 | chr >= 18, has.flag.in_relationship | chr+3, spr-2 | `love_triangle` |
| adult | `chr_charm_conquest` | 社交场的征服 | chr >= 20, has.flag.social_star | chr+4, mny+2, spr-1 | `charm_conquest` |
| adult | `chr_scandal` | 绯闻缠身 | chr >= 20, has.flag.love_triangle | chr+2, mny-2, spr-2 | `scandal` |
| adult | `chr_serial_romance` | 花花公子的代价 | has.flag.heartbroken & has.flag.multi_suitors | chr+3, spr-3 | `serial_romance` |
| middle-age | `chr_old_flame` | 旧情人重逢 | has.flag.first_love | chr+2, spr+2 | `old_flame` |
| middle-age | `chr_elegant_age` | 越老越有魅力 | chr >= 25, age >= 40 | chr+3, spr+2 | |
| elder | `chr_final_roses` | 迟来的玫瑰 | chr >= 20 | chr+2, spr+3 | |

### 🔨 体魄/战士路线（str）— 新增 ~12 个事件

**缺口：缺乏纯战士/格斗家职业链（现有偏骑士+战争）**

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `str_tough_kid` | 天生壮实 | str >= 8 | str+2, chr-1 | `tough_kid` |
| childhood | `str_tree_climb_fall` | 爬树摔不坏 | str >= 6 | str+1, spr+1 | |
| teenager | `str_street_fight` | 街头打架 | str >= 10 | str+3, chr-1, luk-1 | `street_fighter` |
| teenager | `str_wrestling_match` | 摔跤比赛 | str >= 12 | str+3, chr+1 | |
| teenager | `str_blacksmith_apprentice` | 铁匠铺学徒 | str >= 10 | str+2, int+1, mny+1 | `forge_training` |
| youth | `str_mercenary_join` | 加入佣兵团 | str >= 15 | str+3, mny+2, chr-1 | `mercenary_veteran` |
| youth | `str_arena_fight` | 竞技场格斗 | str >= 18 | str+4, mny+3, chr+1 | `arena_fighter` |
| youth | `str_body_tempering` | 炼体 | str >= 15, spr >= 10 | str+5, spr+2 | `body_tempered` |
| adult | `str_champion_belt` | 竞技场冠军 | str >= 25, has.flag.arena_fighter | str+3, chr+3, mny+5 | `arena_champion` |
| adult | `str_war_machine` | 战争机器 | str >= 20, has.flag.war_veteran | str+4, spr-2 | |
| adult | `str_protect_weak` | 守护弱者 | str >= 15 | str+2, chr+2, spr+2 | `protector` |
| middle-age | `str_old_generals_test` | 老将的考验 | str >= 25, age >= 40 | str+2, spr+3 | |

### 📖 智慧/学者路线（int）— 新增 ~10 个事件

**缺口：缺乏"自学成才"非学院路线、学术造假等戏剧性**

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `int_bookworm` | 小书虫 | int >= 8 | int+2, str-1 | `bookworm` |
| childhood | `int_child_genius` | 神童传闻 | int >= 12 | int+3, chr+1 | `child_genius` |
| teenager | `int_forbidden_section` | 禁书区 | int >= 15, has.flag.bookworm | int+4, spr-1 | `forbidden_section` |
| teenager | `int_riddle_contest` | 解谜大赛 | int >= 12 | int+3, luk+1 | |
| youth | `int_self_taught_scholar` | 自学成才 | int >= 18, !has.flag.magic_academy | int+4, spr+2 | `self_taught` |
| youth | `int_ancient_language` | 古代语言解读 | int >= 20 | int+3, mag+1 | |
| adult | `int_academic_rivalry` | 学术论战 | int >= 22 | int+3, chr+1 | `academic_rival` |
| adult | `int_great_discovery` | 重大发现 | int >= 25 | int+4, chr+2, mny+3 | `great_discovery` |
| middle-age | `int_masterpiece` | 传世著作 | int >= 25, has.flag.author | int+3, chr+2, spr+2 | `masterpiece_author` |
| elder | `int_last_lecture` | 最后的授课 | int >= 20, has.flag.has_student | int+2, spr+3 | |

### ✨ 魔力/魔导路线（mag）— 新增 ~12 个事件

**缺口：缺乏"野路子魔法"（非学院）、魔力失控后果链**

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `mag_floating_objects` | 家具飘起来了 | mag >= 8 | mag+2, spr-1 | `wild_magic` |
| childhood | `mag_imaginary_friend` | 看不见的朋友 | mag >= 6, spr >= 6 | mag+2, spr+2 | |
| teenager | `mag_alley_magic` | 巷子里的魔法 | mag >= 10, !has.flag.magic_academy | mag+3, luk+1 | `street_mage` |
| teenager | `mag_potion_accident` | 魔药事故 | mag >= 12 | mag+2, str-2, spr+1 | |
| youth | `mag_magic_overflow` | 魔力暴走 | mag >= 18 | mag+4, spr-3, str-2 | `mana_overflow` |
| youth | `mag_elemental_awakening` | 元素觉醒 | mag >= 15 | mag+3, int+1 | |
| adult | `mag_blood_magic` | 血之魔法 | mag >= 20, has.flag.dark_path | mag+5, spr-4 | `blood_mage` |
| adult | `mag_enchanted_forge` | 魔导锻造 | mag >= 18, str >= 10 | mag+2, str+2, mny+3 | |
| adult | `mag_ritual_mastery` | 仪式精通 | mag >= 25 | mag+3, int+2, spr+1 | `ritual_master` |
| middle-age | `mag_reality_bend` | 扭曲现实 | mag >= 30 | mag+4, spr-2 | |
| elder | `mag_last_spell` | 最后的咒语 | mag >= 25 | mag+3, spr+3 | |
| elder | `mag_legacy_grimoire` | 传世魔导书 | mag >= 20, has.flag.has_student | mag+2, int+2 | |

### 🔮 灵魂/灵修路线（spr）— 新增 ~8 个事件

**现有 spr 事件多但分散，缺乏"灵修者"专属叙事链**

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `spr_seeing_things` | 看见看不见的 | spr >= 10 | spr+2, mag+1 | `spirit_sight` |
| teenager | `spr_meditation_start` | 冥想 | spr >= 12 | spr+3, int+1 | `meditator` |
| teenager | `spr_ghost_encounter` | 鬼魂 | spr >= 15 | spr+3, luk-1 | |
| youth | `spr_shaman_training` | 萨满修行 | spr >= 18, has.flag.spirit_sight | spr+4, mag+2 | `shaman_trained` |
| adult | `spr_soul_journey` | 灵魂出窍 | spr >= 25 | spr+5, str-2 | `astral_projection` |
| adult | `spr_spirit_contract` | 灵魂契约 | spr >= 22, has.flag.spirit_companion | spr+4, mag+2 | |
| middle-age | `spr_enlightenment` | 开悟 | spr >= 30, has.flag.meditator | spr+5, int+3 | `enlightened_being` |
| elder | `spr_one_with_world` | 万物归一 | spr >= 35 | spr+4, mag+2 | `world_oneness` |

### 🍀 运势/天命路线（luk）— 新增 ~12 个事件（最需要补）

**现有仅 19 个，几乎无路线体验**

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `luk_four_leaf` | 四叶草 | luk >= 6 | luk+2, spr+1 | `lucky_charm` |
| childhood | `luk_rainbow` | 彩虹 | luk >= 5 | luk+1, chr+1 | |
| teenager | `luk_near_miss` | 差一点就…… | luk >= 8 | luk+2, spr+1 | |
| teenager | `luk_winning_bet` | 第一次赌就赢 | luk >= 10 | luk+2, mny+2 | `lucky_bet` |
| teenager | `luk_escape_disaster` | 大难不死 | luk >= 8 | luk+3, spr+1 | `cheated_death_natural` |
| youth | `luk_merchant_windfall` | 天降横财 | luk >= 12 | mny+5, luk+1 | |
| youth | `luk_right_place` | 对的时间对的地点 | luk >= 15 | luk+2, chr+1 | `right_place` |
| youth | `luk_lucky_encounter` | 幸运的邂逅 | luk >= 12 | luk+2, chr+2 | |
| adult | `luk_unbelievable_luck` | 不可思议的好运 | luk >= 18 | luk+3, mny+3 | `unbelievable_luck` |
| adult | `luk_gambling_king` | 赌场传说 | luk >= 20 | mny+5, luk+2, chr-2 | `gambling_legend` |
| middle-age | `luk_fate_intervention` | 命运的干预 | luk >= 22 | luk+3, spr+2 | `fate_touched` |
| elder | `luk_lucky_life` | 幸运的一生 | luk >= 20, age >= 50 | luk+2, spr+3 | |

### 💰 家境/商业路线（mny）— 新增 ~10 个事件

**缺口：缺乏"从零开始"创业链和投资风险事件**

| 阶段 | ID | 标题 | 条件 | 效果 | Flag |
|------|----|------|------|------|------|
| childhood | `mny_lemonade_stand` | 卖柠檬水 | mny >= 3 | mny+1, chr+1, int+1 | `young_merchant` |
| childhood | `mny_allowance` | 零花钱 | mny >= 4 | mny+1 | |
| teenager | `mny_market_stall` | 跳蚤市场 | mny >= 5 | mny+2, chr+1 | |
| teenager | `mny_debt_trap` | 欠债 | mny <= 2 | mny-2, spr-1, str+1 | `in_debt` |
| youth | `mny_first_investment` | 第一笔投资 | mny >= 10 | mny+3 或 mny-3 | `first_investor` |
| youth | `mny_trade_route` | 开辟商路 | mny >= 12 | mny+4, chr+2 | `trade_route` |
| adult | `mny_business_empire` | 商业版图 | mny >= 18, has.flag.business_owner | mny+5, chr+2 | `empire_built` |
| adult | `mny_market_crash` | 市场崩盘 | mny >= 15 | mny-8, spr+3 | `market_crash` |
| middle-age | `mny_philanthropy` | 慈善事业 | mny >= 20 | mny-3, chr+4, spr+2 | `great_philanthropist` |
| elder | `mny_inheritance` | 传家宝 | mny >= 15 | mny+2, chr+2 | `legacy_wealth` |

---

## 二、事件新增总量

| 属性路线 | 新增数 |
|----------|--------|
| 魅力/花花公子 | 15 |
| 体魄/战士 | 12 |
| 智慧/学者 | 10 |
| 魔力/魔导 | 12 |
| 灵魂/灵修 | 8 |
| 运势/天命 | 12 |
| 家境/商业 | 10 |
| **总计** | **~79** |

加上现有 688 → **~767 个事件**

---

## 三、成就更新（同 v2 方案，条件基于新 flag）

阈值调整 + 新增成就 + completionist 计数更新（详情见 v2，不变）。

新增成就的条件 flag 要和上面新增事件链的 flag 对齐。

---

## 四、执行步骤

1. **先写事件 JSON** — 79 个事件文件，分阶段追加到对应 phase JSON
2. **再改成就 JSON** — 阈值调整 + 新增 33 个成就
3. **ConditionDSL 验证** — 确认新条件语法
4. **QA 测试** — 每条路线至少跑 2 局验证可达性

---

_待确认后实施_
