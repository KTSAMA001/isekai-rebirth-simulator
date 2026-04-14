# 🔎 QA 全面游玩测试报告

**测试日期**: 2026-04-13 15:37:49
**测试方法**: Galgame 流程 (startYear / resolveBranch)，自动选第一个分支
**测试范围**: 7种族 × 2局 = 14局（含 3个 playable=false 种族）
**总事件数**: 675

## 1. 种族全流程模拟（14局）

| # | 配置 | 种子 | 寿命 | MaxAge | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 平凡年 | 最大降幅 | 最大增幅 |
|---|------|------|------|--------|--------|--------|------|------|--------|--------|----------|----------|
| 1 | 人类-男-A | 8001 | 62 | 100 | 34 | 0 | B 小有成就 | 251.9 | 61 | 1 | 27 | 11 |
| 2 | 人类-女-B | 8002 | 84 | 100 | 31 | 0 | B 小有成就 | 261.4 | 83 | 1 | 29 | 8 |
| 3 | 精灵-女-A | 8003 | 47 | 500 | 34 | 0 | B 小有成就 | 214.1 | 47 | 0 | 31 | 10 |
| 4 | 精灵-男-B | 8004 | 400 | 500 | 31 | 0 | B 小有成就 | 237.8 | 152 | 248 | 38 | 23 |
| 5 | 矮人-男-A | 8005 | 328 | 400 | 46 | 0 | B 小有成就 | 240.2 | 140 | 188 | 25 | 23 |
| 6 | 矮人-女-B | 8006 | 330 | 400 | 43 | 0 | B 小有成就 | 219.4 | 140 | 190 | 24 | 20 |
| 7 | 哥布林-女-A | 8007 | 47 | 60 | 28 | 0 | A 声名远扬 | 280.3 | 47 | 0 | 24 | 2 |
| 8 | 哥布林-男-B | 8008 | 44 | 60 | 37 | 0 | B 小有成就 | 260.2 | 44 | 0 | 11 | 5 |
| 9 | 兽人-男-A | 8009 | 47 | 60 | 52 | 0 | B 小有成就 | 244.5 | 47 | 0 | 28 | 11 |
| 10 | 兽人-女-B | 8010 | 71 | 60 | 58 | 0 | A 声名远扬 | 281.4 | 71 | 0 | 20 | 11 |
| 11 | 海精灵-女-A | 8011 | 21 | 60 | 28 | 0 | B 小有成就 | 216.9 | 21 | 0 | 21 | 9 |
| 12 | 海精灵-男-B | 8012 | 61 | 60 | 28 | 0 | A 声名远扬 | 299.1 | 61 | 0 | 23 | 10 |
| 13 | 半龙人-男-A | 8013 | 52 | 60 | 46 | 0 | B 小有成就 | 257.8 | 52 | 0 | 32 | 14 |
| 14 | 半龙人-女-B | 8014 | 46 | 60 | 52 | 0 | A 声名远扬 | 281.6 | 46 | 0 | 32 | 13 |

### 1.1 种族详细分析

#### 🧑 人类 (human)

- **寿命范围**: 65-85 | 实测平均: 73
- **平均事件数**: 72 | 平均分数: 257
- **可玩性**: ✅ 可选
  - 人类-男-A: 触发 58 个唯一事件, 14 个成就
  - 人类-女-B: 触发 82 个唯一事件, 14 个成就

#### 🧝 精灵 (elf)

- **寿命范围**: 250-400 | 实测平均: 224
- **平均事件数**: 100 | 平均分数: 226
- **可玩性**: ✅ 可选
  - 精灵-女-A: 寿命比 0.09 ⚠️ 偏早死
  - 精灵-男-B: 寿命比 0.80 ✅ 合理
  - 精灵-女-A: 触发 46 个唯一事件, 6 个成就
  - 精灵-男-B: 触发 149 个唯一事件, 32 个成就

#### ⛏️ 矮人 (dwarf)

- **寿命范围**: 150-250 | 实测平均: 329
- **平均事件数**: 140 | 平均分数: 230
- **可玩性**: ✅ 可选
  - 矮人-男-A: 触发 129 个唯一事件, 25 个成就
  - 矮人-女-B: 触发 125 个唯一事件, 21 个成就

#### 👺 哥布林 (goblin)

- **寿命范围**: 20-35 | 实测平均: 46
- **平均事件数**: 46 | 平均分数: 270
- **可玩性**: ✅ 可选
  - 哥布林-女-A: 实际寿命 47 ✅ 合理
  - 哥布林-男-B: 实际寿命 44 ✅ 合理
  - 哥布林-女-A: 触发 45 个唯一事件, 9 个成就
  - 哥布林-男-B: 触发 44 个唯一事件, 10 个成就

#### 🐺 兽人 (beastfolk)

- **寿命范围**: 20-35 | 实测平均: 59
- **平均事件数**: 59 | 平均分数: 263
- **可玩性**: ❌ 不可选 (playable=false)
  - 兽人-男-A: 触发 47 个唯一事件, 7 个成就
  - 兽人-女-B: 触发 71 个唯一事件, 14 个成就

#### 🧜 海精灵 (seaelf)

- **寿命范围**: 250-400 | 实测平均: 41
- **平均事件数**: 41 | 平均分数: 258
- **可玩性**: ❌ 不可选 (playable=false)
  - 海精灵-女-A: 寿命比 0.35 ⚠️ 偏早死
  - 海精灵-男-B: 寿命比 1.02 ✅ 合理
  - 海精灵-女-A: 触发 21 个唯一事件, 3 个成就
  - 海精灵-男-B: 触发 61 个唯一事件, 14 个成就

#### 🐉 半龙人 (halfdragon)

- **寿命范围**: 40-60 | 实测平均: 49
- **平均事件数**: 49 | 平均分数: 270
- **可玩性**: ❌ 不可选 (playable=false)
  - 半龙人-男-A: 触发 52 个唯一事件, 7 个成就
  - 半龙人-女-B: 触发 46 个唯一事件, 5 个成就

## 2. 路线系统验证

### 2.1 路线入口 Flag 触发

| 种族 | 冒险者 | 骑士 | 魔法师 | 商人 | 学者 |
|------|---|---|---|---|---|
| 人类-男-A | — | — | — | — | ✅ |
| 人类-女-B | — | — | — | ✅ | — |
| 精灵-女-A | — | — | — | — | ✅ |
| 精灵-男-B | — | — | ✅ | — | — |
| 矮人-男-A | ✅ | — | — | ✅ | — |
| 矮人-女-B | — | — | — | ✅ | — |
| 哥布林-女-A | ✅ | — | — | — | ✅ |
| 哥布林-男-B | — | — | — | — | ✅ |
| 兽人-男-A | — | — | ✅ | — | — |
| 兽人-女-B | — | — | ✅ | — | — |
| 海精灵-女-A | — | — | — | — | — |
| 海精灵-男-B | — | — | ✅ | ✅ | — |
| 半龙人-男-A | — | — | ✅ | — | — |
| 半龙人-女-B | — | — | — | ✅ | ✅ |

### 2.2 路线触发统计

| 路线 | 入口条件 | 触发次数/总 | 触发率 |
|------|---------|-----------|--------|
| 冒险者 | `has.flag.guild_member` | 2/14 | 14% |
| 骑士 | `has.flag.knight` | 0/14 | 0% |
| 魔法师 | `has.flag.magic_student` | 5/14 | 36% |
| 商人 | `has.flag.merchant_apprentice` | 5/14 | 36% |
| 学者 | `has.flag.has_student | has.flag.famous_inventor` | 5/14 | 36% |

### 2.3 锚点事件触发

- **检查锚点**: 13
- **已触发**: 6
- **未触发**: 7

未触发锚点:
  - adventurer:dungeon_explore_1 (13-15)
  - adventurer:advanced_dungeon (18-25)
  - knight:knight_tournament (16-25)
  - knight:knight_glory (18-25)
  - mage:magic_exam (10-15, mandatory)
  - mage:magic_duel (15-20)
  - merchant:become_lord (35-50)

## 3. HP 系统深度测试

### 3.1 童年保护

- 总童年保护触发次数: 0
- ✅ age<10 死亡保护: 未发现违规

### 3.2 年度 HP 软限制

- 软限制违规次数: 0

### 3.3 各种族 HP 表现

| 种族 | 平均初始HP | 最大单年降幅 | 最大单年增幅 | HP<50次数 |
|------|-----------|------------|------------|----------|
| human | 33 | 29 | 11 | 40 |
| elf | 33 | 38 | 23 | 87 |
| dwarf | 45 | 25 | 23 | 82 |
| goblin | 33 | 24 | 5 | 33 |
| beastfolk | 55 | 28 | 11 | 57 |
| seaelf | 28 | 23 | 10 | 79 |
| halfdragon | 49 | 32 | 14 | 18 |

### 3.4 sigmoid 衰老模型

- 人类-男-A: 3 次大幅下降 (age≥59)
- 人类-女-B: 6 次大幅下降 (age≥59)
- 精灵-男-B: 4 次大幅下降 (age≥280)
- 矮人-男-A: 8 次大幅下降 (age≥175)
- 矮人-女-B: 6 次大幅下降 (age≥175)
- 哥布林-女-A: 4 次大幅下降 (age≥24)
- 哥布林-男-B: 7 次大幅下降 (age≥24)
- 兽人-男-A: 6 次大幅下降 (age≥24)
- 兽人-女-B: 5 次大幅下降 (age≥24)
- 半龙人-男-A: 2 次大幅下降 (age≥42)
- 半龙人-女-B: 2 次大幅下降 (age≥42)

## 4. 事件覆盖度分析

- **总事件数**: 675
- **unique 事件**: 666 (一生一次，14局中每局最多触发一次)
- **非 unique 事件**: 9
- **14局中至少触发过一次**: 334/675 (49.5%)
- **非 unique 从未触发**: 2/9

### 4.1 从未触发的非 unique 事件

- `birth_noble_estate` (minAge=1, maxAge=1, races=[human,elf], routes=[*], weight=6)
- `youth_tavern_rumor` (minAge=18, maxAge=24, races=[all], routes=[*], weight=4)

### 4.2 按 tag 的事件触发分布

| Tag | 总触发次数 |
|-----|----------|
| life | 339 |
| social | 239 |
| adventure | 65 |
| magic | 48 |
| childhood | 43 |
| epic | 38 |
| combat | 28 |
| dark | 22 |
| exploration | 18 |
| disaster | 16 |
| legendary | 15 |
| romance | 12 |
| accident | 5 |

## 5. 成就系统验证

- **总成就数**: 127
- **14局中解锁过的**: 59
- **平均每局解锁**: 12.9
- **最多单局**: 32
- **最少单局**: 3

### 5.1 高频解锁成就

| 成就 | 解锁次数 | 成就定义 |
|------|---------|---------|
| 踏入异世界 | 14/14 | 完成第一局游戏 |
| 轮回十世 | 14/14 | 完成10局游戏 |
| 时代留名 | 11/14 | 结算得分达到220以上 |
| 绝世容颜 | 10/14 | 魅力峰值达到40 |
| 纯净灵魂 | 10/14 | 灵魂峰值达到40 |
| 笔尖人生 | 8/14 | 成为著名作家 |
| 倾国之貌 | 6/14 | 以男性之身达到绝世魅力 |
| 龙骑士 | 5/14 | 骑乘巨龙翱翔天际 |
| 门生仍记得你 | 5/14 | 成年时开始授业，晚年仍有弟子前来探望 |
| 旧物有温度 | 5/14 | 成年时拾回旧日纪念，晚年再一次整理回忆 |
| 临终仍从容 | 4/14 | 结算时体魄、智慧、魅力、灵魂都保持在18以上 |
| 落叶归根 | 4/14 | 安详地度过晚年 |
| 战争英雄 | 4/14 | 在战争中存活并成为英雄 |
| 长寿之人 | 4/14 | 活到80岁 |
| 岁月静好 | 4/14 | 成为领主并平静地活到80岁 |
| 全知者 | 4/14 | 智慧峰值达到40 |
| 传奇谢幕 | 4/14 | 结算得分达到280以上 |
| 奇迹余晖 | 3/14 | 曾从濒死中奇迹生还，并最终活出精彩人生 |
| 死神规避 | 3/14 | 从死亡边缘逃脱 |
| 百年见证者 | 3/14 | 实际活到100岁以上 |

## 6. 数据一致性检查

### 1. Flag 一致性

- **总 Flag**: 252 set, 145 used
- **设置但从未检查**: 109
  - `loving_family`
  - `shaman_apprentice`
  - `hunter_lineage`
  - `wild_birth`
  - `barracks_birth`
  - `dragon_omen_birth`
  - `cursed_birth`
  - `cursed`
  - `lineage_marked`
  - `shadow_birth`
  - `emotional_magic`
  - `early_magic_control`
  - `deep_observer`
  - `bullied`
  - `timid_deep`
  - ... and 94 more
- **检查但从未设置**: 2
  - ⚠️ `dungeon_injured`
  - ⚠️ `miracle_survival`

### 2. 物品一致性

- **物品定义**: 22 个
- **事件中授予**: 13 种
- ✅ 所有 grant_item 目标均在 items.json 中定义

### 3. 事件完整性

- 无分支事件: 229
- 权重 <= 0 事件: 0
- 年龄范围异常: 0
- ⚠️ 存在结构问题

### 4. 条件 DSL 语法

- ✅ 所有条件 DSL 括号匹配正确

## 7. 问题汇总

### P2 — 非核心功能异常

- **精灵-女-A 寿命比仅 0.09** — finalAge=47, effectiveMaxAge=500
- **海精灵-女-A 寿命比仅 0.35** — finalAge=21, effectiveMaxAge=60
- **精灵-女-A 寿命不到种族上限的50%** — finalAge=47, maxAge=500
- **路线 骑士 在14局中从未触发** — 入口条件: has.flag.knight

## 8. 改进建议

3. **事件覆盖率偏低**: 49.5%。考虑增加更多触发机会或调整权重。
4. **路线触发率**: 建议 14 局以上测试来获得更可靠的路线触发率统计。当前测试每个种族仅 2 局，部分路线可能因随机性未触发。

## 9. 每局详细记录

### 1. 人类-男-A (seed=8001)

- 种族: human | 性别: male
- 寿命: 62/100 | 评级: B 小有成就 | 分数: 251.9
- 初始HP: 34 | 事件数: 61 | 平凡年: 1
- 成就: 14 个 [first_step, ten_lives, beauty_supreme, male_beauty, human_adaptability, dragon_knight, demon_king_slayer_ach, school_founder_ach, famous_author_ach, soul_pure, era_remembered, balanced_finale, iron_will_to_end, miracle_afterglow]
- 路线: on_scholar_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_human_soldier | 军人之后 |  | +2 |  |
| 3 | village_festival | 村里祭典 | 大吃特吃 | +2 |  |
| 4 | childhood_play | 村口的泥巴大战 | 当孩子王 | 0 |  |
| 5 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +2 |  |
| 6 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -6 | ✅ |
| 7 | village_feud | 村长之争 | 帮弱者说话 | +2 |  |
| 8 | child_stray_animal | 收养流浪动物 | 带回家照顾 | +2 |  |
| 9 | young_rival | 少年的对手 | 努力超越他 | +2 |  |
| 10 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | +2 |  |
| 11 | human_bully_defense | 保护弱小 | 挺身而出 | +2 |  |
| 12 | human_barn_fire | 谷仓失火 |  | +2 |  |
| 13 | human_ambition_awakens | 野心觉醒 | 追求力量——成为最强的战士 | +2 |  |
| 14 | human_knight_dream | 骑士梦 | 追上去请求加入 | +2 |  |
| 15 | part_time_job | 打工赚零花钱 | 认真干活 | +2 |  |
| 16 | teen_future_talk | 夜谈未来 | 认真说出愿望 | +2 |  |
| 17 | part_time_work | 打零工 | 去码头扛货 | +2 |  |
| 18 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | +2 |  |
| 19 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 20 | youth_short_term_job | 临时差事 | 老老实实做完 | +2 |  |
| 21 | human_war_draft_letter | 战争通知书 | 响应号召 | +2 |  |
| 22 | youth_first_love | 怦然心动 | 鼓起勇气搭话 | +2 |  |
| 23 | scholar_guidance | 学者收徒 | 拜师求教 | +2 |  |
| 24 | random_rainy_contemplation | 雨中沉思 |  | +2 |  |
| 25 | gambling_night | 赌场之夜 | 放手一搏 | +2 |  |
| 26 | random_street_performance | 街头表演 |  | +2 |  |
| 27 | human_feudal_politics | 领主之间的纷争 | 支持看起来正义的一方 | +2 |  |
| 28 | harvest_festival | 丰收祭典 | 参加各项比赛 | +2 |  |
| 29 | human_jousting_tournament | 马上比武大会 | 全力以赴 | -1 | ❌ |
| 30 | human_bandit_raid | 匪徒袭村 | 带头反击 | +2 | ✅ |
| 31 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +2 |  |
| 32 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 33 | human_political_election | 参加镇长选举 | 参选 | +2 | ✅ |
| 34 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +2 |  |
| 35 | human_community_leader | 社区领袖 |  | +1 |  |
| 36 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | +1 |  |
| 37 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | +1 |  |
| 38 | human_king_audience | 面见国王 | 请求封赏 | +1 |  |
| 39 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -4 |  |
| 40 | human_tax_reform | 税制改革 | 据理力争 | +1 |  |
| 41 | war_breaks_out | 战争爆发 | 上前线 | -27 | ✅ |
| 42 | challenge_final_boss | 魔王降临 | 直面魔王 | -25 | ✅ |
| 43 | mid_found_school | 开宗立派 | 门庭若市 | 0 | ✅ |
| 44 | human_land_dispute | 土地纠纷 | 找村长仲裁 | 0 |  |
| 45 | random_street_performance | 街头表演 |  | -1 |  |
| 46 | disciple_comes | 收徒传艺 | 收下这个弟子 | -1 |  |
| 47 | random_helping_stranger | 帮助陌生人 |  | -1 |  |
| 48 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | -2 |  |
| 49 | human_grey_hair | 第一根白发 |  | -2 |  |
| 50 | pet_companion | 捡到流浪动物 | 带回家养 | -3 |  |
| 51 | human_old_war_buddy | 战友的来信 |  | -3 |  |
| 52 | human_legacy_building | 留给后世的遗产 | 建造一所学校 | -4 |  |
| 53 | human_mentor_youth | 指导年轻人 |  | +11 |  |
| 54 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +5 |  |
| 55 | elder_autobiography | 自传 | 欣然同意 | -6 |  |
| 56 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +4 |  |
| 57 | mid_natural_disaster | 天灾 | 组织救援 | -7 |  |
| 58 | elder_garden_peace | 花园时光 |  | -8 |  |
| 59 | elder_last_journey | 最后的旅途 | 去海边看日出 | +6 |  |
| 60 | elder_sunset_watching | 夕阳 |  | -9 |  |
| 61 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -10 |  |
| 62 | random_found_coin | 捡到硬币 |  | -7 |  |

### 2. 人类-女-B (seed=8002)

- 种族: human | 性别: female
- 寿命: 84/100 | 评级: B 小有成就 | 分数: 261.4
- 初始HP: 31 | 事件数: 83 | 平凡年: 1
- 成就: 14 个 [first_step, ten_lives, beauty_supreme, school_founder_ach, soul_pure, human_adaptability, famous_author_ach, peaceful_ending, legacy_of_students, war_hero_ach, human_soldier_honor, longevity, eternal_peace, era_remembered]
- 路线: on_merchant_path
- 物品: 1 个 [holy_pendant]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_human_farm | 农家子弟 |  | +3 |  |
| 3 | village_festival | 村里祭典 | 大吃特吃 | +3 |  |
| 4 | church_orphan | 教会的温暖 | 留在教会 | +3 |  |
| 5 | child_night_sky | 仰望星空 |  | +4 |  |
| 6 | human_street_gang | 街头少年团 | 加入他们的冒险 | +3 |  |
| 7 | stray_dog | 流浪狗 | 带它回家 | +3 |  |
| 8 | random_stargazing | 观星 |  | 0 |  |
| 9 | human_village_festival | 村庄丰收祭 | 在广场上尽情跳舞 | 0 |  |
| 10 | kindness_of_stranger | 陌生人的善意 |  | 0 |  |
| 11 | pet_companion | 捡到流浪动物 | 带回家养 | 0 |  |
| 12 | human_knight_dream | 骑士梦 | 追上去请求加入 | 0 |  |
| 13 | first_love | 初恋的味道 | 表白 | +4 | ✅ |
| 14 | human_church_blessing | 神殿祈福 | 虔诚地跪下祈祷 | +4 |  |
| 15 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | +2 |  |
| 16 | merchant_guidance | 商人学徒招募 | 拜师学商 | 0 |  |
| 17 | human_church_service | 教会服务 |  | 0 |  |
| 18 | tavern_brawl | 酒馆斗殴 | 加入混战 | -15 |  |
| 19 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +4 |  |
| 20 | youth_crisis_crossroad | 命运的十字路口 | 踏上冒险旅途 | +4 |  |
| 21 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | +4 |  |
| 22 | merchant_career | 商路崛起 | 扩张商路 | +4 | ❌ |
| 23 | human_war_draft_letter | 战争通知书 | 响应号召 | +4 |  |
| 24 | youth_caravan_guard | 商队护卫 | 报名参加 | +4 |  |
| 25 | food_culture | 美食之旅 | 学习烹饪 | +4 |  |
| 26 | human_bandit_raid | 匪徒袭村 | 带头反击 | +4 | ✅ |
| 27 | human_trade_caravan | 远行商队 |  | +4 |  |
| 28 | adult_teaching_offer | 教学邀请 | 欣然接受 | +4 |  |
| 29 | human_war_veteran_return | 老兵归乡 |  | +4 |  |
| 30 | random_helping_stranger | 帮助陌生人 |  | +4 |  |
| 31 | human_diplomatic_mission | 外交使团 | 诚恳沟通 | +4 |  |
| 32 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 33 | human_jousting_tournament | 马上比武大会 | 全力以赴 | 0 | ✅ |
| 34 | human_feudal_politics | 领主之间的纷争 | 支持看起来正义的一方 | +3 |  |
| 35 | human_community_leader | 社区领袖 |  | 0 |  |
| 36 | mid_found_school | 开宗立派 | 门庭若市 | 0 | ✅ |
| 37 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | 0 |  |
| 38 | human_legacy_building | 留给后世的遗产 | 建造一所学校 | -1 |  |
| 39 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | -16 |  |
| 40 | challenge_final_boss | 魔王降临 | 直面魔王 | -23 | ❌ |
| 41 | human_political_election | 参加镇长选举 | 参选 | +4 | ✅ |
| 42 | human_debt_crisis | 债务危机 | 努力还债 | +4 |  |
| 43 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +4 |  |
| 44 | human_old_war_buddy | 战友的来信 |  | +4 |  |
| 45 | human_king_audience | 面见国王 | 请求封赏 | +4 |  |
| 46 | human_plague_survivor | 瘟疫幸存者 |  | +2 |  |
| 47 | divine_vision | 神谕 | 遵循神谕行事 | +4 |  |
| 48 | random_weather_blessing | 好天气 |  | +4 |  |
| 49 | mid_body_decline | 岁月的痕迹 | 接受现实 | -11 |  |
| 50 | random_helping_stranger | 帮助陌生人 |  | +4 |  |
| 51 | human_mentor_youth | 指导年轻人 |  | -1 |  |
| 52 | war_breaks_out | 战争爆发 | 上前线 | -26 | ❌ |
| 53 | human_land_dispute | 土地纠纷 | 找村长仲裁 | +4 |  |
| 54 | mid_adopt_orphan | 路边孤儿 | 带回家 | +4 |  |
| 55 | random_rainy_contemplation | 雨中沉思 |  | +4 |  |
| 56 | elder_unexpected_visitor | 意外的来访者 |  | +4 |  |
| 57 | mid_legacy_project | 留下遗产 | 写一本书 | +4 |  |
| 58 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +4 |  |
| 59 | elder_illness | 疾病缠身 | 积极治疗 | -23 | ✅ |
| 60 | elder_last_journey | 最后的旅途 | 去海边看日出 | +4 |  |
| 61 | elder_memoir | 撰写回忆录 | 传世之作 | +4 | ✅ |
| 62 | elder_last_adventure | 不服老的冒险 | 出发！ | -19 | ❌ |
| 63 | human_grandchildren | 含饴弄孙 |  | +3 |  |
| 64 | elder_final_gift | 最后的礼物 |  | +3 |  |
| 65 | human_village_elder | 德高望重 |  | +3 |  |
| 66 | human_grandchild_laughter | 孙辈的笑声 |  | +3 |  |
| 67 | random_minor_injury | 小伤 |  | +2 |  |
| 68 | human_last_toast | 最后一杯酒 |  | +2 |  |
| 69 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +2 |  |
| 70 | human_memoir_writing | 撰写回忆录 |  | 0 |  |
| 71 | elder_passing_wisdom | 智者之言 |  | -1 |  |
| 72 | retirement | 挂剑归隐 | 归隐山林 | +8 |  |
| 73 | elder_disciple_visit | 故徒来访 | 感念师恩 | -4 |  |
| 74 | human_legacy_decision | 遗产安排 | 平均分给子女 | -13 |  |
| 75 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 76 | elder_old_enemy | 昔日的对手 | 去见他 | -1 |  |
| 77 | human_final_prayer | 最后的祈祷 |  | -1 |  |
| 78 | elder_kingdom_crisis | 王国危机 | 担任军师 | -1 |  |
| 79 | elder_autobiography | 自传 | 欣然同意 | -2 |  |
| 80 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +8 |  |
| 81 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | -11 |  |
| 82 | peaceful_end | 平静的终章 |  | -4 |  |
| 83 | elder_frail | 风烛残年 | 安享晚年 | -19 |  |
| 84 | elder_final_illness | 最后的病榻 | 积极治疗 | -29 | ❌ |

### 3. 精灵-女-A (seed=8003)

- 种族: elf | 性别: female
- 寿命: 47/500 | 评级: B 小有成就 | 分数: 214.1
- 初始HP: 34 | 事件数: 47 | 平凡年: 0
- 成就: 6 个 [first_step, ten_lives, cheated_death_ach, elf_star_song_ach, archmage_ach, female_archmage]
- 路线: on_scholar_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_common | 平民之子 |  | +2 |  |
| 2 | elf_moonlight_lullaby | 月光摇篮曲 |  | +2 |  |
| 3 | elf_dewdrop_game | 露珠捉迷藏 |  | +2 |  |
| 4 | elf_first_magic_spark | 第一缕魔火 |  | +2 |  |
| 5 | elf_elvish_calligraphy | 古精灵文书法课 | 专注练字，追求完美 | +2 |  |
| 6 | random_found_coin | 捡到硬币 |  | +2 |  |
| 7 | child_plague | 瘟疫来袭 | 乖乖休息 | -19 |  |
| 8 | childhood_chase | 抓蜻蜓 | 抓到了一只 | +2 |  |
| 9 | child_dream_flying | 会飞的梦 |  | +2 |  |
| 10 | childhood_play | 村口的泥巴大战 | 当孩子王 | +2 |  |
| 11 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +2 |  |
| 12 | kindness_of_stranger | 陌生人的善意 |  | +2 |  |
| 13 | first_love | 初恋的味道 | 表白 | +2 | ❌ |
| 14 | random_rainy_contemplation | 雨中沉思 |  | +2 |  |
| 15 | heartbreak_growth | 失恋之后 | 沉淀修炼 | +2 |  |
| 16 | market_haggling | 集市砍价 | 砍价大师 | +2 |  |
| 17 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | +2 |  |
| 18 | elf_forest_guardian_test | 森林守卫考核 | 与自然和谐共处 | 0 |  |
| 19 | stray_dog | 流浪狗 | 带它回家 | +2 |  |
| 20 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +2 |  |
| 21 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | -4 |  |
| 22 | child_first_fight | 第一次打架 | 挥拳反击 | 0 |  |
| 23 | hidden_potential | 隐藏的潜能 |  | +2 |  |
| 24 | random_street_performance | 街头表演 |  | +2 |  |
| 25 | scholar_guidance | 学者收徒 | 拜师求教 | +2 |  |
| 26 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -3 |  |
| 27 | elf_dwarf_trade | 与矮人贸易 | 公平交易 | +2 |  |
| 28 | child_night_sky | 仰望星空 |  | +2 |  |
| 29 | child_lost_in_woods | 迷路 | 跟着星星走 | +2 |  |
| 30 | elf_fading_forest | 枯萎的森林 | 尝试用魔法治愈森林 | -3 | ❌ |
| 31 | spr_near_death | 濒死体验 | 挣扎求生 | -13 |  |
| 32 | random_street_performance | 街头表演 |  | +2 |  |
| 33 | elf_diplomatic_mission | 外交使命 | 以理服人 | +2 |  |
| 34 | grandma_recipes | 奶奶的秘方 | 认真学习 | +2 |  |
| 35 | mid_old_enemy | 旧敌来访 | 正面迎战 | -18 | ❌ |
| 36 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 37 | write_a_book | 著书立说 | 倾注心血写一本好书 | +2 |  |
| 38 | elf_ancient_magic | 精灵秘术·星辰之歌 | 全身心学习星辰之歌 | +2 | ✅ |
| 39 | disciple_comes | 收徒传艺 | 收下这个弟子 | +2 |  |
| 40 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +2 |  |
| 41 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +2 |  |
| 42 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -13 |  |
| 43 | elf_longevity_burden | 不老之痛 | 接受这就是精灵的命运 | +10 |  |
| 44 | mid_natural_disaster | 天灾 | 组织救援 | +2 |  |
| 45 | challenge_abyss | 深渊之门 | 走入深渊 | -18 | ❌ |
| 46 | random_training_day | 勤奋的一天 | 训练体能 | +10 |  |
| 47 | mid_return_adventure | 重出江湖 | 挑战新地城 | -31 | ❌ |

### 4. 精灵-男-B (seed=8004)

- 种族: elf | 性别: male
- 寿命: 400/500 | 评级: B 小有成就 | 分数: 237.8
- 初始HP: 31 | 事件数: 152 | 平凡年: 248
- 成就: 32 个 [first_step, ten_lives, elf_forest_healer_ach, elf_worldtree_blessed, elf_star_song_ach, beauty_supreme, male_beauty, wisdom_peak, soul_pure, archmage_body, longevity, elf_magic_pinnacle, elf_worldtree_guardian, dragon_knight, elf_dragon_bond, scholar_warrior, elf_council_seat, legacy_master, elf_mentor_legacy, famous_author_ach, undying_legend_ach, legacy_of_students, peaceful_ending, eternal_peace, memories_in_hands, ascended_ach, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle]
- 路线: on_mage_path
- 物品: 3 个 [holy_pendant, lucky_charm, soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_eclipse | 日蚀之日 |  | +2 |  |
| 2 | elf_moonlight_lullaby | 月光摇篮曲 |  | +2 |  |
| 3 | elf_dewdrop_game | 露珠捉迷藏 |  | +2 |  |
| 4 | elf_first_treesong | 第一次听见树歌 | 尝试用魔力回应树灵 | +2 |  |
| 5 | elf_talking_to_tree | 与树对话 |  | +2 |  |
| 6 | church_orphan | 教会的温暖 | 留在教会 | +2 |  |
| 7 | elf_butterfly_dance | 蝶舞课堂 |  | +1 |  |
| 8 | elf_elvish_calligraphy | 古精灵文书法课 | 专注练字，追求完美 | +3 |  |
| 9 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 10 | old_soldier_story | 老兵的故事 | 认真听完 | 0 |  |
| 11 | village_race | 村里赛跑 | 全力冲刺 | +3 |  |
| 12 | first_love | 初恋的味道 | 表白 | +3 | ✅ |
| 13 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +3 |  |
| 14 | elf_archery_training | 精灵弓术修行 | 苦练到百步穿杨 | +3 |  |
| 15 | child_stray_animal | 收养流浪动物 | 带回家照顾 | +3 |  |
| 16 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | +3 |  |
| 17 | village_festival | 村里祭典 | 大吃特吃 | +3 |  |
| 18 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +2 | ✅ |
| 19 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | +3 |  |
| 20 | elf_forbidden_book | 禁书 | 偷偷翻开 | +3 |  |
| 21 | elf_healing_spring | 治愈之泉 |  | +4 |  |
| 22 | dating_start | 开始交往 | 正式告白 | -3 |  |
| 23 | youth_caravan_guard | 商队护卫 | 报名参加 | 0 |  |
| 24 | elf_human_city_visit | 初访人类城市 | 深入了解人类文化 | +3 |  |
| 25 | steal_sweets | 偷吃糖果 | 老实道歉 | +3 |  |
| 26 | elf_world_tree_communion | 与世界树共鸣 |  | 0 |  |
| 27 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 28 | elf_dwarf_trade | 与矮人贸易 | 公平交易 | +3 |  |
| 29 | youth_short_term_job | 临时差事 | 老老实实做完 | 0 |  |
| 30 | random_weather_blessing | 好天气 |  | 0 |  |
| 31 | elf_ancient_magic | 精灵秘术·星辰之歌 | 全身心学习星辰之歌 | 0 | ✅ |
| 32 | harvest_festival | 丰收祭典 | 参加各项比赛 | 0 |  |
| 33 | random_found_coin | 捡到硬币 |  | +3 |  |
| 34 | grandma_recipes | 奶奶的秘方 | 认真学习 | +3 |  |
| 35 | random_minor_injury | 小伤 |  | -7 |  |
| 36 | elf_dark_elf_encounter | 黑暗精灵 | 帮助对方 | +1 |  |
| 37 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | 0 |  |
| 38 | magic_academy_letter | 魔法学院来信 | 入学就读 | 0 |  |
| 39 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | 0 |  |
| 40 | elf_longevity_burden | 不老之痛 | 接受这就是精灵的命运 | -6 |  |
| 41 | teen_race_competition | 少年竞技会 | 参加跑步 | 0 |  |
| 42 | elf_lament_for_fallen | 悲歌 |  | +2 |  |
| 43 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | +3 |  |
| 44 | elf_runic_barrier | 符文结界 |  | +3 |  |
| 45 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 46 | random_weather_blessing | 好天气 |  | +3 |  |
| 47 | chain_dark_past | 黑暗过去 | 谈判 | +3 | ✅ |
| 48 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | +3 |  |
| 49 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | 0 |  |
| 50 | rare_gods_gift | 神之恩赐 | 接受神力 | +23 |  |
| 51 | student_successor | 收徒传艺 | 严格教导 | -17 |  |
| 52 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | 0 |  |
| 53 | challenge_abyss | 深渊之门 | 走入深渊 | -38 | ❌ |
| 54 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +13 |  |
| 55 | elf_diplomatic_mission | 外交使命 | 以理服人 | +3 |  |
| 56 | old_rival | 老对手来访 | 热情招待 | +3 |  |
| 57 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +3 |  |
| 58 | part_time_job | 打工赚零花钱 | 认真干活 | 0 |  |
| 59 | random_weather_blessing | 好天气 |  | +3 |  |
| 60 | random_street_performance | 街头表演 |  | +3 |  |
| 61 | elf_council_invitation | 长老会议席邀请 |  | 0 |  |
| 62 | elf_spell_weaving | 织法术式 |  | 0 |  |
| 63 | elf_magic_research | 魔法论文 | 发表论文 | 0 |  |
| 64 | elf_century_meditation | 百年冥想 | 专注内心的平静 | 0 |  |
| 65 | random_street_performance | 街头表演 |  | 0 |  |
| 66 | elf_forest_corruption | 森林的腐化 | 用净化魔法治疗森林 | 0 |  |
| 67 | part_time_work | 打零工 | 去码头扛货 | 0 |  |
| 68 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 69 | random_stargazing | 观星 |  | +3 |  |
| 70 | elf_eternal_garden | 永恒花园 |  | +1 |  |
| 71 | elf_treesong_mastery | 树歌精通 |  | 0 |  |
| 72 | elf_crystal_cave | 水晶洞窟 | 仔细研究水晶 | 0 |  |
| 73 | teen_secret_discovered | 发现秘密 | 公开揭发 | 0 |  |
| 74 | random_rainy_contemplation | 雨中沉思 |  | 0 |  |
| 75 | elf_dream_walker_adult | 入梦者 |  | 0 |  |
| 76 | divine_vision | 神谕 | 遵循神谕行事 | 0 |  |
| 77 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | 0 |  |
| 78 | elf_mortal_friend | 短命的朋友 | 陪伴朋友最后的时光 | +3 |  |
| 79 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 80 | elf_forest_expansion | 拓展森林 |  | +3 |  |
| 81 | elf_star_song | 星之歌 |  | +1 |  |
| 82 | elf_young_elf_mentor | 指导年轻精灵 |  | 0 |  |
| 83 | elf_phoenix_sighting | 凤凰目击 |  | 0 |  |
| 84 | elf_human_friend_aging | 人类友人的衰老 |  | 0 |  |
| 85 | magic_theory_class | 魔法理论课 | 认真听课 | 0 |  |
| 86 | elf_silver_harp | 银竖琴 |  | 0 |  |
| 87 | soul_bound | 灵魂契约 | 接受灵魂契约 | -10 |  |
| 88 | elf_forbidden_magic_scroll | 禁忌魔法卷轴 | 打开研读 | +3 |  |
| 89 | elf_moonstone_forge | 月石锻造 | 亲手锻造 | +3 |  |
| 90 | traveling_sage | 云游学者 | 跟随学者学习 | +3 |  |
| 91 | elf_worldtree_guardian | 世界树守护者选拔 | 接受选拔挑战 | +3 |  |
| 92 | gambling_night | 赌场之夜 | 放手一搏 | +1 |  |
| 93 | elemental_trial | 元素试炼 | 火之试炼 | -10 |  |
| 94 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -2 |  |
| 100 | elf_watching_generations | 看着世代更替 |  | +3 |  |
| 101 | elf_teaching_young | 教导下一代 |  | +1 |  |
| 102 | elf_dragon_alliance | 与龙族结盟 | 接受盟约 | 0 |  |
| 114 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | 0 |  |
| 115 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | 0 | ✅ |
| 116 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +1 | ❌ |
| 117 | dark_cult_encounter | 暗黑教团 | 潜入调查 | -7 |  |
| 118 | rare_time_loop | 时间循环 | 利用循环学习一切 | +3 |  |
| 119 | mysterious_stranger | 神秘旅人 | 和他交谈 | +3 |  |
| 120 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | +3 |  |
| 121 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +3 |  |
| 134 | dark_cult_aftermath | 暗影的低语 | 向城卫军举报 | 0 |  |
| 135 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | 0 | ✅ |
| 136 | adult_teaching_offer | 教学邀请 | 欣然接受 | +3 |  |
| 150 | elf_wisdom_council_seat | 贤者之席 |  | 0 |  |
| 182 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | 0 |  |
| 183 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | 0 |  |
| 200 | elf_fading_magic | 魔力的消退 |  | -1 |  |
| 201 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 202 | mid_found_school | 开宗立派 | 门庭若市 | 0 | ✅ |
| 203 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | 0 |  |
| 204 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | 0 |  |
| 205 | elf_passing_crown | 传承 |  | 0 |  |
| 206 | mid_life_reflection | 人生回顾 |  | 0 |  |
| 236 | mid_legacy_project | 留下遗产 | 写一本书 | 0 |  |
| 237 | mid_health_scare | 健康警报 | 去找治疗师 | -2 |  |
| 272 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 273 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +12 |  |
| 274 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | -8 |  |
| 300 | elf_time_perception | 时间的感知 |  | 0 |  |
| 301 | elf_last_song | 最后的歌 |  | 0 |  |
| 308 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 309 | mid_apprentice_success | 弟子出师 | 隆重送行 | 0 |  |
| 310 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 350 | elder_autobiography | 自传 | 欣然同意 | -2 |  |
| 351 | elder_last_adventure | 不服老的冒险 | 出发！ | -2 | ✅ |
| 352 | elder_disciple_visit | 故徒来访 | 感念师恩 | +8 |  |
| 353 | elf_eternal_sleep | 永恒之眠 |  | -3 |  |
| 354 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -13 | ✅ |
| 355 | retirement | 挂剑归隐 | 归隐山林 | +5 |  |
| 356 | elder_memoir | 撰写回忆录 | 传世之作 | -3 | ✅ |
| 357 | elder_dream_fulfilled | 完成心愿 |  | -3 |  |
| 358 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | -3 |  |
| 359 | elder_garden_peace | 花园时光 |  | -3 |  |
| 360 | elder_passing_wisdom | 智者之言 |  | -3 |  |
| 361 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -23 | ❌ |
| 362 | elder_last_journey | 最后的旅途 | 去海边看日出 | -4 |  |
| 363 | elder_unexpected_visitor | 意外的来访者 |  | -4 |  |
| 364 | elf_last_spring | 最后的春天 |  | +4 |  |
| 365 | elder_old_letters | 旧日书信 |  | -4 |  |
| 366 | elf_farewell_ceremony | 告别仪式 |  | +4 |  |
| 367 | elder_sunset_watching | 夕阳 |  | -4 |  |
| 368 | elder_final_gift | 最后的礼物 |  | +4 |  |
| 369 | elder_miracle_recovery | 奇迹般的康复 |  | +1 |  |
| 370 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -5 |  |
| 383 | elder_old_enemy | 昔日的对手 | 去见他 | +2 |  |
| 384 | elder_frail | 风烛残年 | 安享晚年 | -14 |  |
| 400 | magic_breakthrough_final | 最后的魔法 | 突破极限 | -22 |  |

### 5. 矮人-男-A (seed=8005)

- 种族: dwarf | 性别: male
- 寿命: 328/400 | 评级: B 小有成就 | 分数: 240.2
- 初始HP: 46 | 事件数: 140 | 平凡年: 188
- 成就: 25 个 [first_step, ten_lives, cheated_death_ach, beauty_supreme, male_beauty, eternal_wanderer, dwarf_surface_broker, dwarf_masterwork_ach, soul_pure, dwarf_holdfast_ach, dragon_knight, longevity, wisdom_peak, dwarf_hall_name, dwarf_apprentice_legacy, scholar_warrior, famous_author_ach, legacy_of_students, peaceful_ending, eternal_peace, memories_in_hands, dwarf_long_watch, era_remembered, balanced_finale, century_witness]
- 路线: on_adventurer_path, on_merchant_path
- 物品: 1 个 [ancient_relic]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_twins | 双生子 |  | +3 |  |
| 4 | child_dwarf_first_hammer | 第一次握锤 | 先练稳稳落锤 | 0 |  |
| 5 | random_weather_blessing | 好天气 |  | +3 |  |
| 6 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +1 |  |
| 7 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 8 | explore_ruins | 废墟探险 | 推门进去 | -9 | ❌ |
| 9 | river_fishing | 河边抓鱼 | 耐心等待 | +3 |  |
| 10 | wander_market | 逛集市 | 买了一本旧书 | -4 |  |
| 11 | random_stargazing | 观星 |  | 0 |  |
| 12 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 13 | first_snow | 初雪 | 堆雪人 | 0 |  |
| 14 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 15 | child_dwarf_surface_fair | 第一次去地表集市 | 寸步不离商队 | 0 |  |
| 16 | child_night_sky | 仰望星空 |  | 0 |  |
| 17 | youth_first_love | 怦然心动 | 鼓起勇气搭话 | 0 |  |
| 18 | random_rainy_contemplation | 雨中沉思 |  | 0 |  |
| 19 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | 0 |  |
| 20 | child_stray_animal | 收养流浪动物 | 带回家照顾 | 0 |  |
| 21 | first_competition | 第一次比赛 | 拼尽全力 | 0 | ✅ |
| 22 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +3 |  |
| 23 | child_first_fight | 第一次打架 | 挥拳反击 | +3 |  |
| 24 | teen_dwarf_choose_master | 拜师之日 | 跟锻炉师傅学火候 | +3 |  |
| 25 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +3 |  |
| 26 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +3 |  |
| 27 | chain_dark_past | 黑暗过去 | 谈判 | +3 | ❌ |
| 28 | river_discovery | 河底发光 | 潜下去捡 | +3 | ✅ |
| 29 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | -1 |  |
| 30 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | 0 |  |
| 31 | teen_race_competition | 少年竞技会 | 参加跑步 | 0 |  |
| 32 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 33 | random_weather_blessing | 好天气 |  | +3 |  |
| 34 | teen_secret_discovered | 发现秘密 | 公开揭发 | 0 |  |
| 35 | random_street_performance | 街头表演 |  | 0 |  |
| 36 | part_time_job | 打工赚零花钱 | 认真干活 | 0 |  |
| 37 | guild_recruitment | 冒险者公会招募 | 报名参加 | +3 |  |
| 38 | merchant_guidance | 商人学徒招募 | 拜师学商 | +3 |  |
| 39 | mid_natural_disaster | 天灾 | 组织救援 | +3 |  |
| 40 | random_found_coin | 捡到硬币 |  | +3 |  |
| 41 | student_successor | 收徒传艺 | 严格教导 | +1 |  |
| 42 | random_weather_blessing | 好天气 |  | 0 |  |
| 43 | community_leader | 社区领袖 | 接受职位 | 0 |  |
| 44 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | 0 |  |
| 45 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | 0 |  |
| 46 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | -9 |  |
| 47 | luk_lottery | 王国彩票 | 中大奖了！ | 0 | ✅ |
| 48 | mid_return_adventure | 重出江湖 | 挑战新地城 | -10 | ✅ |
| 49 | spr_near_death | 濒死体验 | 挣扎求生 | -12 |  |
| 50 | mid_business_rivalry | 商战 | 智取胜过 | +3 | ❌ |
| 51 | challenge_final_boss | 魔王降临 | 直面魔王 | -17 | ❌ |
| 52 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +13 |  |
| 53 | youth_dwarf_surface_caravan | 走一趟地表商路 | 硬记地表的路标 | +3 |  |
| 54 | war_breaks_out | 战争爆发 | 上前线 | -17 | ✅ |
| 55 | mny_tax_crisis | 税务危机 | 偷税漏税 | +3 | ✅ |
| 56 | youth_dwarf_first_commission | 第一份真正的委托 | 把它做成最耐用的 | +3 |  |
| 57 | old_rival | 老对手来访 | 热情招待 | +3 |  |
| 58 | mid_garden_retirement | 后院花园 | 在花园中冥想 | +3 |  |
| 59 | rare_gods_gift | 神之恩赐 | 接受神力 | +23 |  |
| 60 | mny_inherit_uncle | 叔父遗产 | 接受遗产 | +3 |  |
| 61 | adult_dwarf_masterwork | 打造传世之作 | 锻成最可靠的兵甲 | +3 |  |
| 62 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | +3 |  |
| 63 | random_street_performance | 街头表演 |  | +3 |  |
| 64 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 65 | random_good_meal | 丰盛的一餐 |  | +3 |  |
| 66 | random_street_performance | 街头表演 |  | +3 |  |
| 67 | random_weather_blessing | 好天气 |  | +3 |  |
| 68 | divine_vision | 神谕 | 遵循神谕行事 | +1 |  |
| 69 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 70 | random_minor_injury | 小伤 |  | -1 |  |
| 71 | traveling_sage | 云游学者 | 跟随学者学习 | +1 |  |
| 72 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 73 | merchant_career | 商路崛起 | 扩张商路 | 0 | ❌ |
| 74 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 75 | random_weather_blessing | 好天气 |  | 0 |  |
| 76 | random_weather_blessing | 好天气 |  | 0 |  |
| 77 | adult_dwarf_hold_alarm | 要塞警报 | 扛盾守住最窄的入口 | -2 |  |
| 78 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -2 |  |
| 79 | random_weather_blessing | 好天气 |  | +3 |  |
| 80 | gambling_night | 赌场之夜 | 放手一搏 | +3 |  |
| 88 | adult_business_startup | 创业梦想 | 全力投入 | 0 | ✅ |
| 89 | merchant_guild | 商行 | 创业！ | 0 | ✅ |
| 90 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | -3 |  |
| 91 | adult_guild_promotion | 工会晋升 | 接受晋升 | 0 |  |
| 92 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | 0 |  |
| 93 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +3 | ✅ |
| 94 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +3 |  |
| 95 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +3 | ✅ |
| 96 | scenic_travel | 远行见世面 | 冒险路线 | +1 |  |
| 97 | investment_opportunity | 投资机会 | 全部投入 | +3 | ❌ |
| 98 | mysterious_stranger | 神秘旅人 | 和他交谈 | +3 |  |
| 99 | dark_cult_encounter | 暗黑教团 | 潜入调查 | -7 |  |
| 100 | mid_dwarf_name_in_hall | 名字刻上石厅 | 把作品名刻在自己名前面 | +3 |  |
| 101 | business_venture | 创业冒险 | 大胆投资 | +3 |  |
| 102 | buy_house | 买房置业 | 买！ | +3 |  |
| 105 | mid_dwarf_apprentice_oath | 轮到你收徒了 | 先把规矩立得很严 | 0 |  |
| 106 | dark_cult_aftermath | 暗影的低语 | 向城卫军举报 | 0 |  |
| 107 | adult_teaching_offer | 教学邀请 | 欣然接受 | 0 |  |
| 108 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | 0 | ✅ |
| 144 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | 0 |  |
| 145 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | 0 |  |
| 150 | elder_dwarf_last_inspection | 最后一次巡炉 | 亲手补上最后一锤 | 0 |  |
| 160 | elder_dwarf_dragonfire_watch | 守着旧龙火的人 | 继续像祖辈那样守着 | 0 |  |
| 180 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | -1 |  |
| 181 | mid_life_reflection | 人生回顾 |  | 0 |  |
| 182 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 183 | mid_found_school | 开宗立派 | 门庭若市 | 0 | ✅ |
| 184 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | 0 |  |
| 208 | mid_health_scare | 健康警报 | 去找治疗师 | -2 |  |
| 209 | mid_legacy_project | 留下遗产 | 写一本书 | +2 |  |
| 236 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 237 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +13 |  |
| 238 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | -9 |  |
| 264 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 265 | mid_apprentice_success | 弟子出师 | 隆重送行 | 0 |  |
| 266 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 280 | elder_memoir | 撰写回忆录 | 传世之作 | -1 | ✅ |
| 281 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -15 | ✅ |
| 282 | elder_kingdom_crisis | 王国危机 | 挺身而出 | +1 | ✅ |
| 283 | elder_last_adventure | 不服老的冒险 | 出发！ | -25 | ❌ |
| 284 | elder_passing_wisdom | 智者之言 |  | +1 |  |
| 285 | elder_disciple_visit | 故徒来访 | 感念师恩 | +11 |  |
| 286 | elder_last_journey | 最后的旅途 | 去海边看日出 | +1 |  |
| 287 | retirement | 挂剑归隐 | 归隐山林 | +9 |  |
| 288 | elder_illness | 疾病缠身 | 积极治疗 | -25 | ❌ |
| 289 | elder_unexpected_visitor | 意外的来访者 |  | +1 |  |
| 290 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +1 |  |
| 291 | elder_garden_peace | 花园时光 |  | +1 |  |
| 292 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +1 |  |
| 293 | elder_sunset_watching | 夕阳 |  | +1 |  |
| 294 | elder_old_letters | 旧日书信 |  | +1 |  |
| 295 | elder_final_gift | 最后的礼物 |  | +1 |  |
| 296 | elder_miracle_recovery | 奇迹般的康复 |  | +6 |  |
| 297 | elder_autobiography | 自传 | 欣然同意 | 0 |  |
| 298 | elder_dream_fulfilled | 完成心愿 |  | 0 |  |
| 307 | elder_old_enemy | 昔日的对手 | 去见他 | 0 |  |
| 308 | elder_frail | 风烛残年 | 安享晚年 | -16 |  |
| 309 | legend_spread | 传说的传播 | 享受名声 | -1 |  |
| 320 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | -2 |  |
| 321 | elder_last_feast | 最后的盛宴 | 发表感言 | -2 |  |
| 323 | elder_final_illness | 最后的病榻 | 积极治疗 | -12 | ✅ |
| 328 | elder_final_counting | 生命的终点 | 名垂青史 | -13 |  |

### 6. 矮人-女-B (seed=8006)

- 种族: dwarf | 性别: female
- 寿命: 330/400 | 评级: B 小有成就 | 分数: 219.4
- 初始HP: 43 | 事件数: 140 | 平凡年: 190
- 成就: 21 个 [first_step, ten_lives, beauty_supreme, eternal_wanderer, dwarf_masterwork_ach, dwarf_holdfast_ach, dragon_knight, longevity, dwarf_surface_broker, wisdom_peak, soul_pure, dwarf_hall_name, dwarf_apprentice_legacy, famous_author_ach, legacy_of_students, peaceful_ending, eternal_peace, war_hero_ach, memories_in_hands, dwarf_long_watch, century_witness]
- 路线: on_merchant_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_storm | 暴风夜 |  | +3 |  |
| 4 | child_dwarf_first_hammer | 第一次握锤 | 先练稳稳落锤 | 0 |  |
| 5 | random_found_coin | 捡到硬币 |  | +3 |  |
| 6 | village_festival | 村里祭典 | 大吃特吃 | 0 |  |
| 7 | steal_sweets | 偷吃糖果 | 老实道歉 | -3 |  |
| 8 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 9 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | 0 |  |
| 10 | random_rainy_contemplation | 雨中沉思 |  | 0 |  |
| 11 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 12 | village_race | 村里赛跑 | 全力冲刺 | -3 |  |
| 13 | first_love | 初恋的味道 | 表白 | +3 | ❌ |
| 14 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 15 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | 0 |  |
| 16 | random_minor_injury | 小伤 |  | +2 |  |
| 17 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 18 | spr_dream_vision | 预知梦 | 认真对待 | +3 |  |
| 19 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 20 | youth_bandit_ambush | 路遇山贼 | 战斗！ | 0 | ✅ |
| 21 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +3 |  |
| 22 | market_haggling | 集市砍价 | 砍价大师 | +3 |  |
| 23 | random_minor_injury | 小伤 |  | +2 |  |
| 24 | youth_crisis_crossroad | 命运的十字路口 | 踏上冒险旅途 | +2 |  |
| 25 | grandma_recipes | 奶奶的秘方 | 认真学习 | +3 |  |
| 26 | teen_dwarf_choose_master | 拜师之日 | 跟锻炉师傅学火候 | -3 |  |
| 27 | child_first_fight | 第一次打架 | 挥拳反击 | +3 |  |
| 28 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 29 | river_discovery | 河底发光 | 潜下去捡 | +3 | ✅ |
| 30 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -10 |  |
| 31 | teen_secret_discovered | 发现秘密 | 公开揭发 | +3 |  |
| 32 | youth_short_term_job | 临时差事 | 老老实实做完 | +3 |  |
| 33 | pet_companion | 捡到流浪动物 | 带回家养 | +3 |  |
| 34 | harvest_festival | 丰收祭典 | 参加各项比赛 | +2 |  |
| 35 | teen_race_competition | 少年竞技会 | 参加跑步 | +3 |  |
| 36 | community_leader | 社区领袖 | 接受职位 | +3 |  |
| 37 | mid_return_adventure | 重出江湖 | 挑战新地城 | -24 | ❌ |
| 38 | student_successor | 收徒传艺 | 严格教导 | +3 |  |
| 39 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +3 |  |
| 40 | old_rival | 老对手来访 | 热情招待 | +3 |  |
| 41 | merchant_guidance | 商人学徒招募 | 拜师学商 | +3 |  |
| 42 | kindness_of_stranger | 陌生人的善意 |  | +3 |  |
| 43 | youth_dwarf_first_commission | 第一份真正的委托 | 把它做成最耐用的 | +3 |  |
| 44 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +3 |  |
| 45 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | +3 |  |
| 46 | random_street_performance | 街头表演 |  | -3 |  |
| 47 | midlife_crisis | 中年危机 | 放下执念 | +5 |  |
| 48 | random_nightmare_visit | 不安的梦 |  | -11 |  |
| 49 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | 0 |  |
| 50 | guild_recruitment | 冒险者公会招募 | 报名参加 | 0 |  |
| 51 | youth_dwarf_surface_caravan | 走一趟地表商路 | 硬记地表的路标 | +3 |  |
| 52 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | +3 |  |
| 53 | mny_inherit_uncle | 叔父遗产 | 接受遗产 | -9 |  |
| 54 | random_stargazing | 观星 |  | 0 |  |
| 55 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +10 |  |
| 56 | cryptic_manuscript | 神秘手稿 | 花时间破译 | -12 |  |
| 57 | mid_natural_disaster | 天灾 | 组织救援 | -5 |  |
| 58 | mid_garden_retirement | 后院花园 | 在花园中冥想 | 0 |  |
| 59 | rare_gods_gift | 神之恩赐 | 接受神力 | +20 |  |
| 60 | adult_dwarf_masterwork | 打造传世之作 | 锻成最可靠的兵甲 | -12 |  |
| 61 | random_weather_blessing | 好天气 |  | -1 |  |
| 62 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 63 | random_street_performance | 街头表演 |  | 0 |  |
| 64 | traveling_sage | 云游学者 | 跟随学者学习 | 0 |  |
| 65 | random_street_performance | 街头表演 |  | 0 |  |
| 66 | random_street_performance | 街头表演 |  | 0 |  |
| 67 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 68 | random_street_performance | 街头表演 |  | 0 |  |
| 69 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 70 | adult_dwarf_hold_alarm | 要塞警报 | 扛盾守住最窄的入口 | -2 |  |
| 71 | divine_vision | 神谕 | 遵循神谕行事 | +3 |  |
| 72 | merchant_career | 商路崛起 | 扩张商路 | +3 | ❌ |
| 73 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 74 | gambling_night | 赌场之夜 | 放手一搏 | 0 |  |
| 75 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -5 |  |
| 76 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 77 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 78 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 79 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 80 | random_weather_blessing | 好天气 |  | 0 |  |
| 88 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | 0 | ✅ |
| 89 | merchant_guild | 商行 | 创业！ | +3 | ✅ |
| 90 | adult_guild_promotion | 工会晋升 | 接受晋升 | 0 |  |
| 91 | investment_opportunity | 投资机会 | 全部投入 | 0 | ✅ |
| 92 | adult_business_startup | 创业梦想 | 全力投入 | 0 | ✅ |
| 93 | scenic_travel | 远行见世面 | 冒险路线 | 0 |  |
| 94 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +3 |  |
| 95 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +1 | ❌ |
| 96 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | +3 |  |
| 97 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +3 |  |
| 98 | buy_house | 买房置业 | 买！ | +3 |  |
| 99 | business_venture | 创业冒险 | 大胆投资 | +1 |  |
| 100 | mysterious_stranger | 神秘旅人 | 和他交谈 | 0 |  |
| 101 | mid_dwarf_name_in_hall | 名字刻上石厅 | 把作品名刻在自己名前面 | 0 |  |
| 102 | dark_cult_encounter | 暗黑教团 | 潜入调查 | -10 |  |
| 105 | mid_dwarf_apprentice_oath | 轮到你收徒了 | 先把规矩立得很严 | +3 |  |
| 106 | dark_cult_aftermath | 暗影的低语 | 向城卫军举报 | +1 |  |
| 107 | adult_teaching_offer | 教学邀请 | 欣然接受 | 0 |  |
| 108 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | -8 | ❌ |
| 144 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | -1 |  |
| 145 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | 0 |  |
| 150 | elder_dwarf_last_inspection | 最后一次巡炉 | 亲手补上最后一锤 | 0 |  |
| 160 | elder_dwarf_dragonfire_watch | 守着旧龙火的人 | 继续像祖辈那样守着 | -1 |  |
| 180 | mid_found_school | 开宗立派 | 门庭若市 | -1 | ✅ |
| 181 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | 0 |  |
| 182 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | 0 |  |
| 183 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 184 | mid_life_reflection | 人生回顾 |  | 0 |  |
| 208 | mid_legacy_project | 留下遗产 | 写一本书 | 0 |  |
| 209 | mid_health_scare | 健康警报 | 去找治疗师 | -2 |  |
| 236 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 237 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | +2 |  |
| 238 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +12 |  |
| 264 | mid_apprentice_success | 弟子出师 | 隆重送行 | -1 |  |
| 265 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 266 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 280 | elder_illness | 疾病缠身 | 积极治疗 | -23 | ✅ |
| 281 | elder_passing_wisdom | 智者之言 |  | -2 |  |
| 282 | elder_autobiography | 自传 | 欣然同意 | -2 |  |
| 283 | elder_disciple_visit | 故徒来访 | 感念师恩 | +8 |  |
| 284 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ✅ |
| 285 | retirement | 挂剑归隐 | 归隐山林 | +6 |  |
| 286 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -12 | ✅ |
| 287 | elder_unexpected_visitor | 意外的来访者 |  | -2 |  |
| 288 | elder_kingdom_crisis | 王国危机 | 担任军师 | -3 |  |
| 289 | elder_last_journey | 最后的旅途 | 去海边看日出 | -3 |  |
| 290 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | -3 |  |
| 291 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -3 |  |
| 292 | elder_garden_peace | 花园时光 |  | +5 |  |
| 293 | elder_last_adventure | 不服老的冒险 | 当向导 | -3 |  |
| 294 | elder_final_gift | 最后的礼物 |  | -4 |  |
| 295 | elder_miracle_recovery | 奇迹般的康复 |  | +9 |  |
| 296 | elder_dream_fulfilled | 完成心愿 |  | -4 |  |
| 297 | elder_old_letters | 旧日书信 |  | -4 |  |
| 298 | elder_sunset_watching | 夕阳 |  | +4 |  |
| 307 | elder_frail | 风烛残年 | 安享晚年 | -21 |  |
| 308 | legend_spread | 传说的传播 | 享受名声 | +2 |  |
| 309 | elder_old_enemy | 昔日的对手 | 去见他 | +2 |  |
| 320 | elder_final_illness | 最后的病榻 | 积极治疗 | -10 | ✅ |
| 321 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | 0 |  |
| 322 | elder_last_feast | 最后的盛宴 | 发表感言 | 0 |  |
| 330 | elder_final_counting | 生命的终点 | 名垂青史 | -13 |  |

### 7. 哥布林-女-A (seed=8007)

- 种族: goblin | 性别: female
- 寿命: 47/60 | 评级: A 声名远扬 | 分数: 280.3
- 初始HP: 28 | 事件数: 47 | 平凡年: 0
- 成就: 9 个 [first_step, ten_lives, goblin_long_life, cheated_death_ach, beauty_supreme, famous_author_ach, era_remembered, legendary_epilogue, balanced_finale]
- 路线: on_adventurer_path, on_scholar_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_goblin_sewer | 下水道新生 |  | +2 |  |
| 2 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +2 |  |
| 3 | bullied | 被大孩子欺负 | 忍气吞声 | +2 |  |
| 4 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -6 | ✅ |
| 5 | goblin_human_toy | 人类的玩具 |  | +2 |  |
| 6 | goblin_big_brother | 大孩子的保护 |  | +2 |  |
| 7 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +2 |  |
| 8 | random_weather_blessing | 好天气 |  | +2 |  |
| 9 | guild_recruitment | 冒险者公会招募 | 报名参加 | +2 |  |
| 10 | goblin_human_kindness | 人类的善意 |  | +2 |  |
| 11 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +2 |  |
| 12 | rival_training | 与对手切磋 | 接受挑战 | +2 |  |
| 13 | kindness_of_stranger | 陌生人的善意 |  | +2 |  |
| 14 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 15 | random_street_performance | 街头表演 |  | +2 |  |
| 16 | first_quest | 第一个委托 | 认真完成 | -3 | ✅ |
| 17 | teen_future_talk | 夜谈未来 | 认真说出愿望 | +2 |  |
| 18 | bounty_notice | 悬赏告示板 | 接下奇怪委托 | +2 |  |
| 19 | goblin_tavern_brawl | 酒馆遭遇战 | 用酒瓶反击 | +2 | ✅ |
| 20 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +2 |  |
| 21 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | +2 |  |
| 22 | goblin_wise_counsel | 调解纠纷 | 公正裁决 | +2 |  |
| 23 | goblin_cook_master | 暗黑料理大师 |  | +2 |  |
| 24 | random_street_performance | 街头表演 |  | +2 |  |
| 25 | scholar_guidance | 学者收徒 | 拜师求教 | +2 |  |
| 26 | market_haggling | 集市砍价 | 砍价大师 | +2 |  |
| 27 | goblin_rebellion | 反抗压迫 | 组织地下反抗 | +2 |  |
| 28 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | +2 | ✅ |
| 29 | goblin_junkyard_palace | 废品宫殿 |  | +2 |  |
| 30 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +1 |  |
| 31 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | -1 |  |
| 32 | mid_gambling | 地下赌场 | 梭哈！ | -1 | ❌ |
| 33 | pet_companion | 捡到流浪动物 | 带回家养 | 0 |  |
| 34 | goblin_recipe_book | 食谱大全 |  | -1 |  |
| 35 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | -1 |  |
| 36 | goblin_final_feast_elder | 最后的盛宴 |  | -1 |  |
| 37 | teaching_others | 传授经验 | 认真教学 | 0 |  |
| 38 | spr_near_death | 濒死体验 | 挣扎求生 | -16 |  |
| 39 | goblin_longest_living | 最长寿的哥布林 | 大方分享养生之道 | -2 |  |
| 40 | random_training_day | 勤奋的一天 | 训练体能 | -2 |  |
| 41 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | -3 |  |
| 42 | elder_passing_wisdom | 智者之言 |  | -4 |  |
| 43 | elder_memoir | 撰写回忆录 | 传世之作 | -5 | ✅ |
| 44 | random_rainy_contemplation | 雨中沉思 |  | -6 |  |
| 45 | mid_legacy_review | 回首半生 | 无怨无悔 | -8 |  |
| 46 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +1 |  |
| 47 | elder_frail | 风烛残年 | 安享晚年 | -24 |  |

### 8. 哥布林-男-B (seed=8008)

- 种族: goblin | 性别: male
- 寿命: 44/60 | 评级: B 小有成就 | 分数: 260.2
- 初始HP: 37 | 事件数: 44 | 平凡年: 0
- 成就: 10 个 [first_step, ten_lives, goblin_diplomat_ach, beauty_supreme, male_beauty, goblin_long_life, memories_in_hands, era_remembered, fortune_smile_final, miracle_afterglow]
- 路线: on_scholar_path
- 物品: 1 个 [lucky_charm]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_dragon_blood_omen | 龙血征兆 |  | +3 |  |
| 2 | goblin_human_toy | 人类的玩具 |  | +3 |  |
| 3 | child_first_fight | 第一次打架 | 挥拳反击 | +3 |  |
| 4 | goblin_rock_language | 石头记号 |  | +3 |  |
| 5 | river_discovery | 河底发光 | 潜下去捡 | +3 | ✅ |
| 6 | goblin_shiny_collection | 闪亮收藏 |  | -2 |  |
| 7 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | 0 |  |
| 8 | explore_ruins | 废墟探险 | 推门进去 | +3 | ✅ |
| 9 | traveling_sage | 云游学者 | 跟随学者学习 | 0 |  |
| 10 | pet_companion | 捡到流浪动物 | 带回家养 | 0 |  |
| 11 | goblin_night_raid | 夜间突袭 | 负责放风 | 0 |  |
| 12 | old_soldier_story | 老兵的故事 | 认真听完 | +3 |  |
| 13 | help_farmer | 帮农夫收麦 | 帮忙割麦 | +3 |  |
| 14 | goblin_underground_race | 地下竞速赛 | 用智慧取胜——走近路 | -2 | ❌ |
| 15 | street_performer | 街头表演 | 上去表演 | +3 |  |
| 16 | forest_camping | 森林露营 | 享受星空 | +3 |  |
| 17 | youth_caravan_guard | 商队护卫 | 报名参加 | +3 |  |
| 18 | goblin_rebellion | 反抗压迫 | 组织地下反抗 | +3 |  |
| 19 | love_at_first_sight | 一见钟情 | 上前搭讪 | +3 | ✅ |
| 20 | scholar_guidance | 学者收徒 | 拜师求教 | +1 |  |
| 21 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | 0 |  |
| 22 | goblin_junkyard_palace | 废品宫殿 |  | 0 |  |
| 23 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 24 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 25 | goblin_wise_counsel | 调解纠纷 | 公正裁决 | -1 |  |
| 26 | goblin_legacy_hoard | 传家宝库 | 设置机关保护 | -1 |  |
| 27 | goblin_peace_treaty | 和平条约 | 以诚意打动对方 | 0 |  |
| 28 | harvest_festival | 丰收祭典 | 参加各项比赛 | -1 |  |
| 29 | goblin_potion_brewing | 毒药与良药 | 自己先试喝 | +1 | ✅ |
| 30 | mid_old_enemy | 旧敌来访 | 正面迎战 | 0 | ✅ |
| 31 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | -1 | ✅ |
| 32 | random_street_performance | 街头表演 |  | -1 |  |
| 33 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | -2 |  |
| 34 | lucky_coin_found | 幸运金币 |  | -3 |  |
| 35 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | -4 |  |
| 36 | elder_disciple_visit | 故徒来访 | 感念师恩 | +5 |  |
| 37 | random_weather_blessing | 好天气 |  | -7 |  |
| 38 | elder_old_letters | 旧日书信 |  | -8 |  |
| 39 | elder_final_gift | 最后的礼物 |  | -9 |  |
| 40 | elder_garden_peace | 花园时光 |  | -10 |  |
| 41 | mid_legacy_project | 留下遗产 | 写一本书 | -11 |  |
| 42 | elder_last_adventure | 不服老的冒险 | 当向导 | +3 |  |
| 43 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | -11 |  |
| 44 | random_stargazing | 观星 |  | -11 |  |

### 9. 兽人-男-A (seed=8009)

- 种族: beastfolk | 性别: male
- 寿命: 47/60 | 评级: B 小有成就 | 分数: 244.5
- 初始HP: 52 | 事件数: 47 | 平凡年: 0
- 成就: 7 个 [first_step, ten_lives, beauty_supreme, male_beauty, soul_pure, era_remembered, miracle_afterglow]
- 路线: on_mage_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_slums | 贫民窟的黎明 |  | +4 |  |
| 2 | child_dream_flying | 会飞的梦 |  | +4 |  |
| 3 | child_night_sky | 仰望星空 |  | +3 |  |
| 4 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | 0 |  |
| 5 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | 0 |  |
| 6 | teen_secret_discovered | 发现秘密 | 公开揭发 | 0 |  |
| 7 | elder_unexpected_visitor | 意外的来访者 |  | 0 |  |
| 8 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -8 | ✅ |
| 9 | village_festival | 村里祭典 | 大吃特吃 | +4 |  |
| 10 | mid_life_reflection | 人生回顾 |  | +1 |  |
| 11 | random_stargazing | 观星 |  | 0 |  |
| 12 | elder_disciple_visit | 故徒来访 | 感念师恩 | +10 |  |
| 13 | elder_frail | 风烛残年 | 安享晚年 | -25 |  |
| 14 | steal_sweets | 偷吃糖果 | 老实道歉 | +4 |  |
| 15 | random_street_performance | 街头表演 |  | +4 |  |
| 16 | random_found_coin | 捡到硬币 |  | +4 |  |
| 17 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +3 | ✅ |
| 18 | mid_health_scare | 健康警报 | 去找治疗师 | +2 |  |
| 19 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | +4 |  |
| 20 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +1 |  |
| 21 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | 0 |  |
| 22 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | 0 |  |
| 23 | elder_final_gift | 最后的礼物 |  | -1 |  |
| 24 | part_time_job | 打工赚零花钱 | 认真干活 | -1 |  |
| 25 | elder_garden_peace | 花园时光 |  | +4 |  |
| 26 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +1 |  |
| 27 | elder_reunion | 故人重逢 | 热泪盈眶 | +4 |  |
| 28 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +4 |  |
| 29 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 30 | elder_illness | 疾病缠身 | 积极治疗 | -26 | ❌ |
| 31 | elder_kingdom_crisis | 王国危机 | 帮助撤离 | -16 |  |
| 32 | mid_natural_disaster | 天灾 | 组织救援 | +3 |  |
| 33 | child_first_fight | 第一次打架 | 挥拳反击 | +3 |  |
| 34 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 35 | childhood_play | 村口的泥巴大战 | 当孩子王 | +2 |  |
| 36 | elder_last_adventure | 不服老的冒险 | 当向导 | +2 |  |
| 37 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +2 |  |
| 38 | kindness_of_stranger | 陌生人的善意 |  | +1 |  |
| 39 | magic_academy_letter | 魔法学院来信 | 入学就读 | 0 |  |
| 40 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 41 | elder_memoir | 撰写回忆录 | 传世之作 | -1 | ❌ |
| 42 | mid_body_decline | 岁月的痕迹 | 接受现实 | -12 |  |
| 43 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -28 | ❌ |
| 44 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +11 |  |
| 45 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | -5 |  |
| 46 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | -7 |  |
| 47 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | -10 |  |

### 10. 兽人-女-B (seed=8010)

- 种族: beastfolk | 性别: female
- 寿命: 71/60 | 评级: A 声名远扬 | 分数: 281.4
- 初始HP: 58 | 事件数: 71 | 平凡年: 0
- 成就: 14 个 [first_step, ten_lives, mage_path, soul_pure, beauty_supreme, war_hero_ach, hero_ach, wisdom_peak, undying_legend_ach, famous_author_ach, legacy_of_students, slum_survivor, era_remembered, legendary_epilogue]
- 路线: on_mage_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_slums | 贫民窟的黎明 |  | +5 |  |
| 2 | magic_academy_letter | 魔法学院来信 | 入学就读 | +4 |  |
| 3 | elder_sunset_watching | 夕阳 |  | 0 |  |
| 4 | elder_dream_fulfilled | 完成心愿 |  | 0 |  |
| 5 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 6 | part_time_work | 打零工 | 去码头扛货 | 0 |  |
| 7 | first_snow | 初雪 | 堆雪人 | +5 |  |
| 8 | elder_world_peace | 和平降临 | 退休享受 | +1 |  |
| 9 | village_feud | 村长之争 | 帮弱者说话 | 0 |  |
| 10 | child_first_fight | 第一次打架 | 挥拳反击 | 0 |  |
| 11 | grandma_recipes | 奶奶的秘方 | 认真学习 | +5 |  |
| 12 | elder_unexpected_visitor | 意外的来访者 |  | -5 |  |
| 13 | childhood_play | 村口的泥巴大战 | 当孩子王 | 0 |  |
| 14 | river_discovery | 河底发光 | 潜下去捡 | +4 | ✅ |
| 15 | village_festival | 村里祭典 | 大吃特吃 | -7 |  |
| 16 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | -3 |  |
| 17 | part_time_job | 打工赚零花钱 | 认真干活 | 0 |  |
| 18 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +5 |  |
| 19 | elder_illness | 疾病缠身 | 积极治疗 | -20 | ❌ |
| 20 | elder_frail | 风烛残年 | 安享晚年 | -10 |  |
| 21 | mid_legacy_project | 留下遗产 | 写一本书 | +5 |  |
| 22 | magic_graduate | 魔法学院毕业 | 继续深造研究 | +5 |  |
| 23 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +4 |  |
| 24 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | -4 |  |
| 25 | elder_miracle_recovery | 奇迹般的康复 |  | +5 |  |
| 26 | random_good_meal | 丰盛的一餐 |  | -6 |  |
| 27 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -8 | ✅ |
| 28 | stray_dog | 流浪狗 | 带它回家 | +3 |  |
| 29 | teen_race_competition | 少年竞技会 | 参加跑步 | +2 |  |
| 30 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +1 |  |
| 31 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +1 |  |
| 32 | bullied | 被大孩子欺负 | 忍气吞声 | 0 |  |
| 33 | mid_found_school | 开宗立派 | 门庭若市 | -1 | ❌ |
| 34 | elder_final_gift | 最后的礼物 |  | -2 |  |
| 35 | elder_passing_wisdom | 智者之言 |  | -3 |  |
| 36 | magic_burst_baby | 婴儿的魔力暴走 | 大哭 | -4 |  |
| 37 | stand_up_moment | 不再忍耐 | 正面反击 | -5 | ✅ |
| 38 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +1 |  |
| 39 | adult_teaching_offer | 教学邀请 | 欣然接受 | 0 |  |
| 40 | kindness_of_stranger | 陌生人的善意 |  | -1 |  |
| 41 | elder_old_letters | 旧日书信 |  | -1 |  |
| 42 | random_weather_blessing | 好天气 |  | -1 |  |
| 43 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | -1 |  |
| 44 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -1 | ✅ |
| 45 | childhood_chase | 抓蜻蜓 | 抓到了一只 | -1 |  |
| 46 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | 0 |  |
| 47 | bullied_repeat | 他们又来了 | 继续忍耐 | 0 |  |
| 48 | divine_vision | 神谕 | 遵循神谕行事 | 0 |  |
| 49 | teen_secret_discovered | 发现秘密 | 公开揭发 | 0 |  |
| 50 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -10 | ✅ |
| 51 | elder_kingdom_crisis | 王国危机 | 担任军师 | +1 |  |
| 52 | elder_legend_verified | 传说被验证 | 接受荣誉 | +1 |  |
| 53 | mage_magic_tower | 法师塔 | 拜师学艺 | +1 |  |
| 54 | old_rival | 老对手来访 | 热情招待 | +1 |  |
| 55 | legend_spread | 传说的传播 | 享受名声 | +1 |  |
| 56 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +1 |  |
| 57 | cryptic_manuscript | 神秘手稿 | 花时间破译 | +1 |  |
| 58 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +11 |  |
| 59 | elder_last_adventure | 不服老的冒险 | 出发！ | -7 | ✅ |
| 60 | mid_health_scare | 健康警报 | 去找治疗师 | -1 |  |
| 61 | random_rainy_contemplation | 雨中沉思 |  | +1 |  |
| 62 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +1 |  |
| 63 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | -1 |  |
| 64 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ❌ |
| 65 | elder_last_journey | 最后的旅途 | 去海边看日出 | -2 |  |
| 66 | random_found_coin | 捡到硬币 |  | -3 |  |
| 67 | elder_autobiography | 自传 | 欣然同意 | -4 |  |
| 68 | elder_disciple_visit | 故徒来访 | 感念师恩 | +6 |  |
| 69 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | -4 |  |
| 70 | random_stargazing | 观星 |  | -4 |  |
| 71 | mid_body_decline | 岁月的痕迹 | 接受现实 | -18 |  |

### 11. 海精灵-女-A (seed=8011)

- 种族: seaelf | 性别: female
- 寿命: 21/60 | 评级: B 小有成就 | 分数: 216.9
- 初始HP: 28 | 事件数: 21 | 平凡年: 0
- 成就: 3 个 [first_step, ten_lives, speedrun]
- 路线: 无
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_wilderness | 荒野出生 | 萨满世家 | +1 |  |
| 2 | mid_existential_crisis | 深夜的独白 | 找到新目标 | +1 | ❌ |
| 3 | retirement | 挂剑归隐 | 归隐山林 | +9 |  |
| 4 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | -12 |  |
| 5 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | +1 |  |
| 6 | first_competition | 第一次比赛 | 拼尽全力 | +1 | ✅ |
| 7 | rare_dragon_egg | 龙蛋 | 卖给收藏家 | +1 |  |
| 8 | elder_illness | 疾病缠身 | 积极治疗 | -21 | ✅ |
| 9 | child_first_fight | 第一次打架 | 挥拳反击 | +1 |  |
| 10 | elder_garden_peace | 花园时光 |  | +1 |  |
| 11 | mid_legacy_project | 留下遗产 | 写一本书 | +1 |  |
| 12 | pet_companion | 捡到流浪动物 | 带回家养 | +1 |  |
| 13 | rival_training | 与对手切磋 | 接受挑战 | +1 |  |
| 14 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +1 |  |
| 15 | part_time_work | 打零工 | 去码头扛货 | +1 |  |
| 16 | teen_first_errand | 第一次独自办事 | 稳稳办妥 | +1 |  |
| 17 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +1 |  |
| 18 | hidden_potential | 隐藏的潜能 |  | +1 |  |
| 19 | star_gazing | 观星 | 冥想 | +1 |  |
| 20 | youth_short_term_job | 临时差事 | 老老实实做完 | +1 |  |
| 21 | elder_natural_death | 安详的离去 |  | -21 |  |

### 12. 海精灵-男-B (seed=8012)

- 种族: seaelf | 性别: male
- 寿命: 61/60 | 评级: A 声名远扬 | 分数: 299.1
- 初始HP: 28 | 事件数: 61 | 平凡年: 0
- 成就: 14 个 [first_step, ten_lives, merchant_empire, famous_author_ach, beauty_supreme, male_beauty, memories_in_hands, war_hero_ach, soul_pure, loving_family, love_and_war, eternal_wanderer, era_remembered, legendary_epilogue]
- 路线: on_merchant_path, on_mage_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_sharp_eyes | 目光过人的婴孩 |  | +2 |  |
| 2 | elder_reunion | 故人重逢 | 热泪盈眶 | +2 |  |
| 3 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +2 |  |
| 4 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | +2 |  |
| 5 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | +2 |  |
| 6 | river_discovery | 河底发光 | 潜下去捡 | +2 | ✅ |
| 7 | random_good_meal | 丰盛的一餐 |  | +2 |  |
| 8 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -6 | ❌ |
| 9 | village_festival | 村里祭典 | 大吃特吃 | +2 |  |
| 10 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +2 |  |
| 11 | random_rainy_contemplation | 雨中沉思 |  | +2 |  |
| 12 | retirement | 挂剑归隐 | 归隐山林 | +10 |  |
| 13 | stray_dog | 流浪狗 | 带它回家 | -12 |  |
| 14 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | -6 |  |
| 15 | help_farmer | 帮农夫收麦 | 帮忙割麦 | 0 |  |
| 16 | elder_illness | 疾病缠身 | 积极治疗 | -23 | ✅ |
| 17 | elder_passing_wisdom | 智者之言 |  | +2 |  |
| 18 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -10 | ✅ |
| 19 | elder_garden_peace | 花园时光 |  | +2 |  |
| 20 | elder_world_peace | 和平降临 | 退休享受 | +2 |  |
| 21 | harvest_festival | 丰收祭典 | 参加各项比赛 | +2 |  |
| 22 | market_haggling | 集市砍价 | 砍价大师 | +2 |  |
| 23 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +2 | ✅ |
| 24 | bullied | 被大孩子欺负 | 忍气吞声 | +2 |  |
| 25 | child_lost_in_woods | 迷路 | 跟着星星走 | +2 |  |
| 26 | merchant_guidance | 商人学徒招募 | 拜师学商 | +2 |  |
| 27 | merchant_career | 商路崛起 | 扩张商路 | +2 | ✅ |
| 28 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +2 |  |
| 29 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | +2 |  |
| 30 | bullied_repeat | 他们又来了 | 继续忍耐 | 0 |  |
| 31 | elder_autobiography | 自传 | 欣然同意 | 0 |  |
| 32 | elder_last_adventure | 不服老的冒险 | 当向导 | -1 |  |
| 33 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | 0 |  |
| 34 | elder_final_gift | 最后的礼物 |  | 0 |  |
| 35 | grandma_recipes | 奶奶的秘方 | 认真学习 | 0 |  |
| 36 | student_successor | 收徒传艺 | 严格教导 | -1 |  |
| 37 | guild_recruitment | 冒险者公会招募 | 报名参加 | 0 |  |
| 38 | magic_academy_letter | 魔法学院来信 | 入学就读 | 0 |  |
| 39 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | 0 |  |
| 40 | childhood_chase | 抓蜻蜓 | 抓到了一只 | -1 |  |
| 41 | elder_dream_fulfilled | 完成心愿 |  | 0 |  |
| 42 | child_dream_flying | 会飞的梦 |  | 0 |  |
| 43 | elder_legacy_gift | 传家之宝 | 传给有缘人 | 0 |  |
| 44 | marry_noble | 政治联姻 | 接受联姻 | -1 |  |
| 45 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 46 | elder_kingdom_crisis | 王国危机 | 担任军师 | 0 |  |
| 47 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 48 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | -1 |  |
| 49 | mid_natural_disaster | 天灾 | 组织救援 | 0 |  |
| 50 | childhood_play | 村口的泥巴大战 | 当孩子王 | 0 |  |
| 51 | child_stray_animal | 收养流浪动物 | 带回家照顾 | 0 |  |
| 52 | child_night_sky | 仰望星空 |  | -1 |  |
| 53 | adult_first_child | 初为人父母 |  | 0 |  |
| 54 | stand_up_moment | 不再忍耐 | 正面反击 | -8 | ❌ |
| 55 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +9 |  |
| 56 | elder_last_feast | 最后的盛宴 | 发表感言 | -2 |  |
| 57 | elder_unexpected_visitor | 意外的来访者 |  | -2 |  |
| 58 | legend_spread | 传说的传播 | 享受名声 | -2 |  |
| 59 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ✅ |
| 60 | first_snow | 初雪 | 堆雪人 | -2 |  |
| 61 | random_weather_blessing | 好天气 |  | -10 |  |

### 13. 半龙人-男-A (seed=8013)

- 种族: halfdragon | 性别: male
- 寿命: 52/60 | 评级: B 小有成就 | 分数: 257.8
- 初始HP: 46 | 事件数: 52 | 平凡年: 0
- 成就: 7 个 [first_step, ten_lives, mage_path, hero_ach, soul_pure, dragon_knight, era_remembered]
- 路线: on_mage_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_ashen_hut | 灰烬小屋 |  | +4 |  |
| 2 | mid_existential_crisis | 深夜的独白 | 找到新目标 | +4 | ❌ |
| 3 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +4 |  |
| 4 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | +4 |  |
| 5 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +4 |  |
| 6 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +14 |  |
| 7 | bullied | 被大孩子欺负 | 忍气吞声 | -10 |  |
| 8 | stand_up_moment | 不再忍耐 | 正面反击 | -8 | ❌ |
| 9 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | +4 |  |
| 10 | child_first_fight | 第一次打架 | 挥拳反击 | +4 |  |
| 11 | part_time_job | 打工赚零花钱 | 认真干活 | +4 |  |
| 12 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +4 |  |
| 13 | first_love | 初恋的味道 | 表白 | +4 | ✅ |
| 14 | elder_sunset_watching | 夕阳 |  | +1 |  |
| 15 | child_dream_flying | 会飞的梦 |  | 0 |  |
| 16 | childhood_play | 村口的泥巴大战 | 当孩子王 | 0 |  |
| 17 | magic_academy_letter | 魔法学院来信 | 入学就读 | +3 |  |
| 18 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | 0 |  |
| 19 | retirement | 挂剑归隐 | 归隐山林 | +8 |  |
| 20 | magic_graduate | 魔法学院毕业 | 继续深造研究 | -14 |  |
| 21 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -13 | ✅ |
| 22 | dating_start | 开始交往 | 正式告白 | +4 |  |
| 23 | food_culture | 美食之旅 | 学习烹饪 | +2 |  |
| 24 | quest_parting | 远征前的告别 | 系上护身符 | -1 |  |
| 25 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | -1 |  |
| 26 | random_good_meal | 丰盛的一餐 |  | -1 |  |
| 27 | teen_race_competition | 少年竞技会 | 参加跑步 | 0 |  |
| 28 | steal_sweets | 偷吃糖果 | 老实道歉 | +4 |  |
| 29 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | +1 |  |
| 30 | elder_unexpected_visitor | 意外的来访者 |  | -7 |  |
| 31 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -1 | ✅ |
| 32 | magic_theory_class | 魔法理论课 | 认真听课 | -1 |  |
| 33 | elder_legend_verified | 传说被验证 | 接受荣誉 | 0 |  |
| 34 | elder_last_journey | 最后的旅途 | 去海边看日出 | -1 |  |
| 35 | river_discovery | 河底发光 | 潜下去捡 | -1 | ✅ |
| 36 | kindness_of_stranger | 陌生人的善意 |  | -6 |  |
| 37 | mid_old_enemy | 旧敌来访 | 正面迎战 | -21 | ❌ |
| 38 | mid_legacy_project | 留下遗产 | 写一本书 | +4 |  |
| 39 | bullied_repeat | 他们又来了 | 继续忍耐 | +3 |  |
| 40 | elder_star_gazing_final | 最后的星空 | 内心平静 | +3 |  |
| 41 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +3 |  |
| 42 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +3 |  |
| 43 | elder_feast_missing_names | 席间空位 | 为他们举杯 | 0 |  |
| 44 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -5 |  |
| 45 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +1 |  |
| 46 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +1 |  |
| 47 | elder_passing_wisdom | 智者之言 |  | 0 |  |
| 48 | soul_bound | 灵魂契约 | 接受灵魂契约 | -11 |  |
| 49 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | -1 | ✅ |
| 50 | elder_garden_peace | 花园时光 |  | -2 |  |
| 51 | mid_garden_retirement | 后院花园 | 在花园中冥想 | -4 |  |
| 52 | elder_illness | 疾病缠身 | 积极治疗 | -32 | ✅ |

### 14. 半龙人-女-B (seed=8014)

- 种族: halfdragon | 性别: female
- 寿命: 46/60 | 评级: A 声名远扬 | 分数: 281.6
- 初始HP: 52 | 事件数: 46 | 平凡年: 0
- 成就: 5 个 [first_step, ten_lives, soul_pure, era_remembered, legendary_epilogue]
- 路线: on_scholar_path, on_merchant_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_slums | 贫民窟的黎明 |  | +4 |  |
| 2 | childhood_play | 村口的泥巴大战 | 当孩子王 | +4 |  |
| 3 | mid_life_reflection | 人生回顾 |  | +3 |  |
| 4 | elder_dream_fulfilled | 完成心愿 |  | 0 |  |
| 5 | elder_garden_peace | 花园时光 |  | 0 |  |
| 6 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | 0 |  |
| 7 | elder_frail | 风烛残年 | 安享晚年 | -15 |  |
| 8 | elder_old_letters | 旧日书信 |  | +4 |  |
| 9 | elder_unexpected_visitor | 意外的来访者 |  | +4 |  |
| 10 | elder_sunset_watching | 夕阳 |  | +4 |  |
| 11 | first_competition | 第一次比赛 | 拼尽全力 | +3 | ❌ |
| 12 | elder_illness | 疾病缠身 | 积极治疗 | -16 | ❌ |
| 13 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +4 |  |
| 14 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +4 |  |
| 15 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -6 | ✅ |
| 16 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +4 |  |
| 17 | youth_first_love | 怦然心动 | 鼓起勇气搭话 | +4 |  |
| 18 | child_dream_flying | 会飞的梦 |  | +3 |  |
| 19 | youth_caravan_guard | 商队护卫 | 报名参加 | 0 |  |
| 20 | child_lost_in_woods | 迷路 | 跟着星星走 | +4 |  |
| 21 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +13 |  |
| 22 | elder_final_gift | 最后的礼物 |  | -10 |  |
| 23 | food_culture | 美食之旅 | 学习烹饪 | -1 |  |
| 24 | grandma_recipes | 奶奶的秘方 | 认真学习 | -1 |  |
| 25 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | -7 |  |
| 26 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -8 | ✅ |
| 27 | mid_legacy_project | 留下遗产 | 写一本书 | +4 |  |
| 28 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +3 |  |
| 29 | merchant_guidance | 商人学徒招募 | 拜师学商 | -1 |  |
| 30 | merchant_career | 商路崛起 | 扩张商路 | -1 | ❌ |
| 31 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 32 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | -4 |  |
| 33 | elder_last_journey | 最后的旅途 | 去海边看日出 | +3 |  |
| 34 | elder_star_gazing_final | 最后的星空 | 内心平静 | +3 |  |
| 35 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +1 | ✅ |
| 36 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +2 |  |
| 37 | random_rainy_contemplation | 雨中沉思 |  | +1 |  |
| 38 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -4 |  |
| 39 | stray_dog | 流浪狗 | 带它回家 | 0 |  |
| 40 | mid_body_decline | 岁月的痕迹 | 接受现实 | -11 |  |
| 41 | retirement | 挂剑归隐 | 归隐山林 | +6 |  |
| 42 | mid_found_school | 开宗立派 | 门庭若市 | -3 | ✅ |
| 43 | merchant_economic_crisis | 经济危机 | 抄底 | -4 | ❌ |
| 44 | challenge_abyss | 深渊之门 | 走入深渊 | -15 | ✅ |
| 45 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | +2 |  |
| 46 | war_breaks_out | 战争爆发 | 上前线 | -32 | ❌ |
