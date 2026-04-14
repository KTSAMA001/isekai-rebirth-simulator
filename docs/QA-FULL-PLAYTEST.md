# 🔎 QA 全面游玩测试报告

**测试日期**: 2026-04-14 06:05:10
**测试方法**: Galgame 流程 (startYear / resolveBranch)，自动选第一个分支
**测试范围**: 7种族 × 2局 = 14局（含 3个 playable=false 种族）
**总事件数**: 675

## 1. 种族全流程模拟（14局）

| # | 配置 | 种子 | 寿命 | MaxAge | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 平凡年 | 最大降幅 | 最大增幅 |
|---|------|------|------|--------|--------|--------|------|------|--------|--------|----------|----------|
| 1 | 人类-男-A | 8001 | 62 | 100 | 34 | 0 | B 小有成就 | 251.9 | 61 | 1 | 27 | 11 |
| 2 | 人类-女-B | 8002 | 84 | 100 | 31 | 0 | B 小有成就 | 261.4 | 83 | 1 | 29 | 8 |
| 3 | 精灵-女-A | 8003 | 322 | 500 | 34 | 0 | B 小有成就 | 250.7 | 322 | 0 | 31 | 22 |
| 4 | 精灵-男-B | 8004 | 385 | 500 | 31 | 0 | B 小有成就 | 274.3 | 385 | 0 | 28 | 21 |
| 5 | 矮人-男-A | 8005 | 349 | 400 | 46 | 0 | B 小有成就 | 272.4 | 323 | 26 | 36 | 23 |
| 6 | 矮人-女-B | 8006 | 321 | 400 | 43 | 0 | B 小有成就 | 240 | 318 | 3 | 38 | 23 |
| 7 | 哥布林-女-A | 8007 | 46 | 60 | 28 | 0 | B 小有成就 | 259.9 | 46 | 0 | 30 | 6 |
| 8 | 哥布林-男-B | 8008 | 41 | 60 | 37 | 0 | B 小有成就 | 243.1 | 41 | 0 | 15 | 3 |
| 9 | 兽人-男-A | 8009 | 55 | 60 | 52 | 0 | A 声名远扬 | 303 | 55 | 0 | 28 | 10 |
| 10 | 兽人-女-B | 8010 | 38 | 60 | 58 | 0 | B 小有成就 | 252.5 | 38 | 0 | 30 | 10 |
| 11 | 海精灵-女-A | 8011 | 21 | 60 | 28 | 0 | B 小有成就 | 212 | 21 | 0 | 27 | 10 |
| 12 | 海精灵-男-B | 8012 | 19 | 60 | 28 | 0 | B 小有成就 | 238.3 | 19 | 0 | 23 | 10 |
| 13 | 半龙人-男-A | 8013 | 55 | 60 | 46 | 0 | B 小有成就 | 244.1 | 55 | 0 | 24 | 14 |
| 14 | 半龙人-女-B | 8014 | 49 | 60 | 52 | 0 | B 小有成就 | 264.8 | 49 | 0 | 33 | 4 |

### 1.1 种族详细分析

#### 🧑 人类 (human)

- **寿命范围**: 65-85 | 实测平均: 73
- **平均事件数**: 72 | 平均分数: 257
- **可玩性**: ✅ 可选
  - 人类-男-A: 触发 58 个唯一事件, 14 个成就
  - 人类-女-B: 触发 82 个唯一事件, 14 个成就

#### 🧝 精灵 (elf)

- **寿命范围**: 250-400 | 实测平均: 354
- **平均事件数**: 354 | 平均分数: 263
- **可玩性**: ✅ 可选
  - 精灵-女-A: 寿命比 0.64 ⚠️ 偏早死
  - 精灵-男-B: 寿命比 0.77 ✅ 合理
  - 精灵-女-A: 触发 176 个唯一事件, 30 个成就
  - 精灵-男-B: 触发 222 个唯一事件, 38 个成就

#### ⛏️ 矮人 (dwarf)

- **寿命范围**: 150-250 | 实测平均: 335
- **平均事件数**: 321 | 平均分数: 256
- **可玩性**: ✅ 可选
  - 矮人-男-A: 触发 192 个唯一事件, 37 个成就
  - 矮人-女-B: 触发 180 个唯一事件, 36 个成就

#### 👺 哥布林 (goblin)

- **寿命范围**: 20-35 | 实测平均: 44
- **平均事件数**: 44 | 平均分数: 252
- **可玩性**: ✅ 可选
  - 哥布林-女-A: 实际寿命 46 ✅ 合理
  - 哥布林-男-B: 实际寿命 41 ✅ 合理
  - 哥布林-女-A: 触发 46 个唯一事件, 8 个成就
  - 哥布林-男-B: 触发 41 个唯一事件, 8 个成就

#### 🐺 兽人 (beastfolk)

- **寿命范围**: 20-35 | 实测平均: 47
- **平均事件数**: 47 | 平均分数: 278
- **可玩性**: ❌ 不可选 (playable=false)
  - 兽人-男-A: 触发 55 个唯一事件, 13 个成就
  - 兽人-女-B: 触发 38 个唯一事件, 6 个成就

#### 🧜 海精灵 (seaelf)

- **寿命范围**: 250-400 | 实测平均: 20
- **平均事件数**: 20 | 平均分数: 225
- **可玩性**: ❌ 不可选 (playable=false)
  - 海精灵-女-A: 寿命比 0.35 ⚠️ 偏早死
  - 海精灵-男-B: 寿命比 0.32 ⚠️ 偏早死
  - 海精灵-女-A: 触发 21 个唯一事件, 3 个成就
  - 海精灵-男-B: 触发 19 个唯一事件, 4 个成就

#### 🐉 半龙人 (halfdragon)

- **寿命范围**: 40-60 | 实测平均: 52
- **平均事件数**: 52 | 平均分数: 254
- **可玩性**: ❌ 不可选 (playable=false)
  - 半龙人-男-A: 触发 55 个唯一事件, 13 个成就
  - 半龙人-女-B: 触发 49 个唯一事件, 12 个成就

## 2. 路线系统验证

### 2.1 路线入口 Flag 触发

| 种族 | 冒险者 | 骑士 | 魔法师 | 商人 | 学者 |
|------|---|---|---|---|---|
| 人类-男-A | — | — | — | — | ✅ |
| 人类-女-B | — | — | — | ✅ | — |
| 精灵-女-A | — | ✅ | — | — | — |
| 精灵-男-B | ✅ | — | — | ✅ | — |
| 矮人-男-A | ✅ | — | — | ✅ | — |
| 矮人-女-B | — | — | — | ✅ | — |
| 哥布林-女-A | — | — | — | — | ✅ |
| 哥布林-男-B | — | — | — | — | — |
| 兽人-男-A | — | — | ✅ | ✅ | ✅ |
| 兽人-女-B | — | — | ✅ | — | — |
| 海精灵-女-A | — | — | — | — | — |
| 海精灵-男-B | — | — | — | — | — |
| 半龙人-男-A | — | — | ✅ | — | — |
| 半龙人-女-B | — | — | — | — | ✅ |

### 2.2 路线触发统计

| 路线 | 入口条件 | 触发次数/总 | 触发率 |
|------|---------|-----------|--------|
| 冒险者 | `has.flag.guild_member` | 2/14 | 14% |
| 骑士 | `has.flag.knight` | 1/14 | 7% |
| 魔法师 | `has.flag.magic_student` | 3/14 | 21% |
| 商人 | `has.flag.merchant_apprentice` | 5/14 | 36% |
| 学者 | `has.flag.has_student | has.flag.famous_inventor` | 4/14 | 29% |

### 2.3 锚点事件触发

- **检查锚点**: 13
- **已触发**: 4
- **未触发**: 9

未触发锚点:
  - adventurer:dungeon_explore_1 (13-15)
  - adventurer:first_quest (16-22, mandatory)
  - adventurer:advanced_dungeon (18-25)
  - knight:knight_tournament (16-25)
  - knight:knight_glory (18-25)
  - mage:magic_exam (10-15, mandatory)
  - mage:magic_duel (15-20)
  - merchant:become_lord (35-50)
  - scholar:write_a_book (30-50)

## 3. HP 系统深度测试

### 3.1 童年保护

- 总童年保护触发次数: 0
- ✅ age<10 死亡保护: 未发现违规

### 3.2 年度 HP 软限制

  - ⚠️ 半龙人-女-B age=46: loss=33, limit=30, hpBefore=46
- 软限制违规次数: 1

### 3.3 各种族 HP 表现

| 种族 | 平均初始HP | 最大单年降幅 | 最大单年增幅 | HP<50次数 |
|------|-----------|------------|------------|----------|
| human | 33 | 29 | 11 | 40 |
| elf | 33 | 31 | 22 | 90 |
| dwarf | 45 | 38 | 23 | 33 |
| goblin | 33 | 30 | 6 | 21 |
| beastfolk | 55 | 30 | 10 | 37 |
| seaelf | 28 | 27 | 10 | 38 |
| halfdragon | 49 | 33 | 14 | 49 |

### 3.4 sigmoid 衰老模型

- 人类-男-A: 3 次大幅下降 (age≥59)
- 人类-女-B: 6 次大幅下降 (age≥59)
- 精灵-女-A: 5 次大幅下降 (age≥280)
- 精灵-男-B: 6 次大幅下降 (age≥280)
- 矮人-男-A: 10 次大幅下降 (age≥175)
- 矮人-女-B: 17 次大幅下降 (age≥175)
- 哥布林-女-A: 5 次大幅下降 (age≥24)
- 哥布林-男-B: 6 次大幅下降 (age≥24)
- 兽人-男-A: 8 次大幅下降 (age≥24)
- 兽人-女-B: 5 次大幅下降 (age≥24)
- 半龙人-男-A: 4 次大幅下降 (age≥42)
- 半龙人-女-B: 3 次大幅下降 (age≥42)

## 4. 事件覆盖度分析

- **总事件数**: 675
- **unique 事件**: 666 (一生一次，14局中每局最多触发一次)
- **非 unique 事件**: 9
- **14局中至少触发过一次**: 378/675 (56.0%)
- **非 unique 从未触发**: 1/9

### 4.1 从未触发的非 unique 事件

- `birth_noble_estate` (minAge=1, maxAge=1, races=[human,elf], routes=[*], weight=6)

### 4.2 按 tag 的事件触发分布

| Tag | 总触发次数 |
|-----|----------|
| social | 441 |
| life | 432 |
| dark | 238 |
| accident | 165 |
| adventure | 72 |
| magic | 72 |
| childhood | 53 |
| epic | 48 |
| combat | 35 |
| legendary | 33 |
| exploration | 24 |
| disaster | 20 |
| romance | 17 |

## 5. 成就系统验证

- **总成就数**: 127
- **14局中解锁过的**: 69
- **平均每局解锁**: 16.9
- **最多单局**: 38
- **最少单局**: 3

### 5.1 高频解锁成就

| 成就 | 解锁次数 | 成就定义 |
|------|---------|---------|
| 踏入异世界 | 14/14 | 完成第一局游戏 |
| 轮回十世 | 14/14 | 完成10局游戏 |
| 时代留名 | 13/14 | 结算得分达到220以上 |
| 绝世容颜 | 10/14 | 魅力峰值达到40 |
| 笔尖人生 | 10/14 | 成为著名作家 |
| 纯净灵魂 | 9/14 | 灵魂峰值达到40 |
| 龙骑士 | 6/14 | 骑乘巨龙翱翔天际 |
| 落叶归根 | 6/14 | 安详地度过晚年 |
| 长寿之人 | 6/14 | 活到80岁 |
| 倾国之貌 | 5/14 | 以男性之身达到绝世魅力 |
| 魔王终结者 | 5/14 | 讨伐魔王 |
| 临终仍从容 | 5/14 | 结算时体魄、智慧、魅力、灵魂都保持在18以上 |
| 战至终章 | 5/14 | 活过半百后，仍保有强健体魄与坚定灵魂 |
| 门生仍记得你 | 5/14 | 成年时开始授业，晚年仍有弟子前来探望 |
| 岁月静好 | 5/14 | 成为领主并平静地活到80岁 |
| 奇迹余晖 | 4/14 | 曾从濒死中奇迹生还，并最终活出精彩人生 |
| 全知者 | 4/14 | 智慧峰值达到40 |
| 文武双全 | 4/14 | 智慧和体魄峰值同时达到30 |
| 钢铁之躯 | 4/14 | 体魄峰值达到40 |
| 神之代行者 | 4/14 | 成为神选之人并完成使命 |

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

### P1 — 核心功能异常

- **HP软限制违规 1 次** — 年度HP损失超过50%或30的上限

### P2 — 非核心功能异常

- **精灵-女-A 寿命比仅 0.64** — finalAge=322, effectiveMaxAge=500
- **海精灵-女-A 寿命比仅 0.35** — finalAge=21, effectiveMaxAge=60
- **海精灵-男-B 寿命比仅 0.32** — finalAge=19, effectiveMaxAge=60

## 8. 改进建议

3. **事件覆盖率偏低**: 56.0%。考虑增加更多触发机会或调整权重。
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
- 寿命: 322/500 | 评级: B 小有成就 | 分数: 250.7
- 初始HP: 34 | 事件数: 322 | 平凡年: 0
- 成就: 30 个 [first_step, ten_lives, elf_worldtree_blessed, elf_forest_healer_ach, soul_pure, wisdom_peak, scholar_warrior, beauty_supreme, archmage_body, elf_spirit_bond, elf_magic_pinnacle, iron_body, elf_worldtree_guardian, elf_star_song_ach, dragon_knight, elf_dragon_bond, elf_council_seat, demon_king_slayer_ach, divine_champion_ach, legacy_master, elf_mentor_legacy, archmage_ach, female_archmage, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle, miracle_afterglow]
- 路线: on_knight_path
- 物品: 3 个 [lucky_charm, training_dummy, ancient_relic]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_common | 平民之子 |  | +2 |  |
| 2 | elf_moonlight_lullaby | 月光摇篮曲 |  | +2 |  |
| 3 | elf_dewdrop_game | 露珠捉迷藏 |  | +2 |  |
| 4 | elf_first_magic_spark | 第一缕魔火 |  | +2 |  |
| 5 | elf_starlight_bath | 星光沐浴 | 平静地接受洗礼 | +2 |  |
| 6 | elf_animal_friend | 林间小鹿 |  | +2 |  |
| 7 | elf_herb_gathering | 采药课 |  | +1 |  |
| 8 | childhood_play | 村口的泥巴大战 | 当孩子王 | 0 |  |
| 9 | elf_elvish_calligraphy | 古精灵文书法课 | 专注练字，追求完美 | +2 |  |
| 10 | elf_world_tree_pilgrimage | 世界树巡礼 | 静心聆听世界树的声音 | +1 |  |
| 11 | bullied | 被大孩子欺负 | 忍气吞声 | 0 |  |
| 12 | elf_ancient_library | 远古图书馆 |  | 0 |  |
| 13 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 14 | bullied_repeat | 他们又来了 | 继续忍耐 | -3 |  |
| 15 | elf_forest_fire_rescue | 森林火灾救援 |  | 0 |  |
| 16 | squire_opportunity | 骑士侍从选拔 | 拜师学艺 | +2 |  |
| 17 | elf_archery_training | 精灵弓术修行 | 苦练到百步穿杨 | +2 |  |
| 18 | child_dream_flying | 会飞的梦 |  | +2 |  |
| 19 | child_stray_animal | 收养流浪动物 | 带回家照顾 | +2 |  |
| 20 | village_festival | 村里祭典 | 大吃特吃 | +2 |  |
| 21 | elf_world_tree_communion | 与世界树共鸣 |  | +2 |  |
| 22 | elf_first_century | 第一个百年 |  | +2 |  |
| 23 | elf_starlight_weaving | 星光织衣 |  | +2 |  |
| 24 | stray_dog | 流浪狗 | 带它回家 | +2 |  |
| 25 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +2 |  |
| 26 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 27 | first_snow | 初雪 | 堆雪人 | 0 |  |
| 28 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 29 | child_first_fight | 第一次打架 | 挥拳反击 | 0 |  |
| 30 | random_minor_injury | 小伤 |  | +1 |  |
| 31 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | +2 |  |
| 32 | child_lost_in_woods | 迷路 | 跟着星星走 | +2 |  |
| 33 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -7 | ✅ |
| 34 | river_fishing | 河边抓鱼 | 耐心等待 | +2 |  |
| 35 | elf_forest_corruption | 森林的腐化 | 用净化魔法治疗森林 | 0 |  |
| 36 | elf_diplomatic_mission | 外交使命 | 以理服人 | 0 |  |
| 37 | child_night_sky | 仰望星空 |  | 0 |  |
| 38 | river_discovery | 河底发光 | 潜下去捡 | 0 | ✅ |
| 39 | first_competition | 第一次比赛 | 拼尽全力 | -7 | ✅ |
| 40 | random_weather_blessing | 好天气 |  | +2 |  |
| 41 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +2 |  |
| 42 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | +2 |  |
| 43 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 44 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +2 |  |
| 45 | elf_ancient_magic | 精灵秘术·星辰之歌 | 全身心学习星辰之歌 | +2 | ❌ |
| 46 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | +2 |  |
| 47 | tree_climbing | 爬树冒险 | 爬到最高处 | -13 | ❌ |
| 48 | teen_race_competition | 少年竞技会 | 参加跑步 | +2 |  |
| 49 | random_weather_blessing | 好天气 |  | +2 |  |
| 50 | child_plague | 瘟疫来袭 | 乖乖休息 | -18 |  |
| 51 | elf_century_meditation | 百年冥想 | 专注内心的平静 | +2 |  |
| 52 | elf_lament_for_fallen | 悲歌 |  | +1 |  |
| 53 | elf_treesong_mastery | 树歌精通 |  | +2 |  |
| 54 | elf_dark_elf_encounter | 黑暗精灵 | 帮助对方 | +2 |  |
| 55 | old_soldier_story | 老兵的故事 | 认真听完 | +2 |  |
| 56 | squire_training | 侍从修炼 | 全力修炼 | -3 | ✅ |
| 57 | elf_council_invitation | 长老会议席邀请 |  | +2 |  |
| 58 | wander_market | 逛集市 | 买了一本旧书 | +2 |  |
| 59 | young_rival | 少年的对手 | 努力超越他 | +2 |  |
| 60 | elf_spell_weaving | 织法术式 |  | +2 |  |
| 61 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | +2 |  |
| 62 | spr_dream_vision | 预知梦 | 认真对待 | +2 |  |
| 63 | elf_eternal_garden | 永恒花园 |  | +2 |  |
| 64 | help_farmer | 帮农夫收麦 | 帮忙割麦 | +2 |  |
| 65 | elf_longevity_burden | 不老之痛 | 接受这就是精灵的命运 | +2 |  |
| 66 | teen_secret_discovered | 发现秘密 | 公开揭发 | +2 |  |
| 67 | first_love | 初恋的味道 | 表白 | +2 | ✅ |
| 68 | village_race | 村里赛跑 | 全力冲刺 | +2 |  |
| 69 | elf_dream_walker_adult | 入梦者 |  | +2 |  |
| 70 | elf_crystal_cave | 水晶洞窟 | 仔细研究水晶 | +2 |  |
| 71 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +2 |  |
| 72 | elf_magic_research | 魔法论文 | 发表论文 | +2 |  |
| 73 | star_gazing | 观星 | 冥想 | +2 |  |
| 74 | elf_moonstone_forge | 月石锻造 | 亲手锻造 | +2 |  |
| 75 | spr_spirit_animal | 灵兽伴行 | 伸出手 | +2 | ✅ |
| 76 | teen_future_talk | 夜谈未来 | 认真说出愿望 | +2 |  |
| 77 | elf_human_friend_aging | 人类友人的衰老 |  | +2 |  |
| 78 | chr_public_speech | 广场演说 | 慷慨陈词 | +2 | ✅ |
| 79 | random_found_coin | 捡到硬币 |  | +2 |  |
| 80 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | +2 |  |
| 81 | dating_start | 开始交往 | 正式告白 | +2 |  |
| 82 | forbidden_love | 禁忌之恋 | 一起私奔 | -13 |  |
| 83 | elf_mortal_friend | 短命的朋友 | 陪伴朋友最后的时光 | +2 |  |
| 84 | mana_overflow | 魔力暴走 | 冷静控制 | +2 |  |
| 85 | elf_young_elf_mentor | 指导年轻精灵 |  | +2 |  |
| 86 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +2 | ✅ |
| 87 | random_rainy_contemplation | 雨中沉思 |  | +2 |  |
| 88 | teen_first_errand | 第一次独自办事 | 稳稳办妥 | +2 |  |
| 89 | kindness_of_stranger | 陌生人的善意 |  | +2 |  |
| 90 | forest_camping | 森林露营 | 享受星空 | +2 |  |
| 91 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 92 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 93 | youth_short_term_job | 临时差事 | 老老实实做完 | +2 |  |
| 94 | elf_forest_expansion | 拓展森林 |  | +2 |  |
| 95 | tavern_brawl | 酒馆斗殴 | 加入混战 | -13 |  |
| 96 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 97 | elf_silver_harp | 银竖琴 |  | +2 |  |
| 98 | random_stargazing | 观星 |  | +2 |  |
| 99 | harvest_festival | 丰收祭典 | 参加各项比赛 | +2 |  |
| 100 | youth_mysterious_stranger | 神秘旅人 | 帮助他 | +2 |  |
| 101 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +2 |  |
| 102 | random_street_performance | 街头表演 |  | +2 |  |
| 103 | random_weather_blessing | 好天气 |  | +2 |  |
| 104 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +2 | ✅ |
| 105 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | -13 |  |
| 106 | pet_companion | 捡到流浪动物 | 带回家养 | +2 |  |
| 107 | random_street_performance | 街头表演 |  | +2 |  |
| 108 | youth_crisis_crossroad | 命运的十字路口 | 踏上冒险旅途 | +2 |  |
| 109 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | +2 | ❌ |
| 110 | random_weather_blessing | 好天气 |  | +2 |  |
| 111 | elf_runic_barrier | 符文结界 |  | +2 |  |
| 112 | elf_worldtree_guardian | 世界树守护者选拔 | 接受选拔挑战 | +2 |  |
| 113 | random_street_performance | 街头表演 |  | +2 |  |
| 114 | youth_caravan_guard | 商队护卫 | 报名参加 | +2 |  |
| 115 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | +2 |  |
| 116 | elf_teaching_young | 教导下一代 |  | +2 |  |
| 117 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 118 | elf_star_song | 星之歌 |  | +2 |  |
| 119 | random_street_performance | 街头表演 |  | +2 |  |
| 120 | elf_watching_generations | 看着世代更替 |  | +2 |  |
| 121 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +2 | ✅ |
| 122 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +2 |  |
| 123 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +2 | ✅ |
| 124 | cryptic_manuscript | 神秘手稿 | 花时间破译 | +2 |  |
| 125 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -8 | ✅ |
| 126 | divine_vision | 神谕 | 遵循神谕行事 | +2 |  |
| 127 | elf_dragon_alliance | 与龙族结盟 | 接受盟约 | +2 |  |
| 128 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +2 |  |
| 129 | chain_dark_past | 黑暗过去 | 谈判 | +2 | ✅ |
| 130 | arena_champion_invite | 竞技场的邀请 | 参加比赛 | +2 |  |
| 131 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 132 | mid_gambling | 地下赌场 | 梭哈！ | +2 | ✅ |
| 133 | dragon_youngling_growth | 幼龙成长 | 与幼龙一起练习飞行 | +2 | ✅ |
| 134 | mountain_bandit_leader | 山贼头子的挑战 | 接受挑战 | +2 | ✅ |
| 135 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +2 |  |
| 136 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +2 |  |
| 137 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | -28 | ❌ |
| 138 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -3 |  |
| 139 | adult_teaching_offer | 教学邀请 | 欣然接受 | +2 |  |
| 140 | food_culture | 美食之旅 | 学习烹饪 | +2 |  |
| 141 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | +2 | ✅ |
| 142 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 143 | random_street_performance | 街头表演 |  | +2 |  |
| 144 | random_weather_blessing | 好天气 |  | +2 |  |
| 145 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 146 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | +2 |  |
| 147 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +2 |  |
| 148 | rare_time_loop | 时间循环 | 利用循环学习一切 | +2 |  |
| 149 | random_minor_injury | 小伤 |  | +1 |  |
| 150 | random_street_performance | 街头表演 |  | +2 |  |
| 151 | mid_natural_disaster | 天灾 | 组织救援 | +2 |  |
| 152 | dragon_sky_patrol | 龙背巡游 | 巡视边境，威慑敌人 | +2 |  |
| 153 | random_weather_blessing | 好天气 |  | +2 |  |
| 154 | challenge_abyss | 深渊之门 | 走入深渊 | -8 | ✅ |
| 155 | elf_wisdom_council_seat | 贤者之席 |  | +2 |  |
| 156 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 157 | mid_return_adventure | 重出江湖 | 挑战新地城 | -8 | ✅ |
| 158 | random_street_performance | 街头表演 |  | +2 |  |
| 159 | arcane_academy_invitation | 奥术学院的邀请 | 欣然前往 | +2 |  |
| 160 | random_street_performance | 街头表演 |  | +2 |  |
| 161 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 162 | random_minor_injury | 小伤 |  | +1 |  |
| 163 | mid_old_enemy | 旧敌来访 | 正面迎战 | +2 | ✅ |
| 164 | gambling_night | 赌场之夜 | 放手一搏 | +2 |  |
| 165 | random_minor_injury | 小伤 |  | +1 |  |
| 166 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -3 |  |
| 167 | random_minor_injury | 小伤 |  | +1 |  |
| 168 | luk_lottery | 王国彩票 | 中大奖了！ | +2 | ❌ |
| 169 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 170 | random_street_performance | 街头表演 |  | +2 |  |
| 171 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 172 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 173 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 174 | random_minor_injury | 小伤 |  | +1 |  |
| 175 | random_minor_injury | 小伤 |  | +1 |  |
| 176 | challenge_final_boss | 魔王降临 | 直面魔王 | -23 | ✅ |
| 177 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 178 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 179 | random_minor_injury | 小伤 |  | +1 |  |
| 180 | random_street_performance | 街头表演 |  | +2 |  |
| 181 | teaching_others | 传授经验 | 认真教学 | +2 |  |
| 182 | challenge_god_trial | 神之试炼 | 接受试炼 | -18 | ✅ |
| 183 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 184 | rare_gods_gift | 神之恩赐 | 接受神力 | +22 |  |
| 185 | random_street_performance | 街头表演 |  | +2 |  |
| 186 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 187 | random_weather_blessing | 好天气 |  | +2 |  |
| 188 | random_weather_blessing | 好天气 |  | +2 |  |
| 189 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 190 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 191 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 192 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 193 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 194 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 195 | dragon_ultimate_bond | 龙之试炼 | 接受龙之试炼 | +2 | ✅ |
| 196 | random_street_performance | 街头表演 |  | +2 |  |
| 197 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 198 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | +2 |  |
| 199 | random_street_performance | 街头表演 |  | +2 |  |
| 200 | mid_life_reflection | 人生回顾 |  | +2 |  |
| 201 | elf_fading_magic | 魔力的消退 |  | +2 |  |
| 202 | war_aftermath | 战后动荡 | 继续战斗 | -28 | ✅ |
| 203 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 204 | random_street_performance | 街头表演 |  | +2 |  |
| 205 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 206 | old_rival | 老对手来访 | 热情招待 | +2 |  |
| 207 | elf_passing_crown | 传承 |  | +2 |  |
| 208 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -13 |  |
| 209 | random_street_performance | 街头表演 |  | +2 |  |
| 210 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +2 |  |
| 211 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +2 |  |
| 212 | random_weather_blessing | 好天气 |  | +2 |  |
| 213 | midlife_crisis | 中年危机 | 放下执念 | +7 |  |
| 214 | mid_found_school | 开宗立派 | 门庭若市 | +2 | ✅ |
| 215 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | +2 |  |
| 216 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +2 |  |
| 217 | random_street_performance | 街头表演 |  | +1 |  |
| 218 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 219 | community_leader | 社区领袖 | 接受职位 | +1 |  |
| 220 | random_street_performance | 街头表演 |  | +1 |  |
| 221 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 222 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +1 |  |
| 223 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 224 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 225 | random_minor_injury | 小伤 |  | 0 |  |
| 226 | random_minor_injury | 小伤 |  | 0 |  |
| 227 | random_street_performance | 街头表演 |  | +1 |  |
| 228 | random_street_performance | 街头表演 |  | +1 |  |
| 229 | random_minor_injury | 小伤 |  | 0 |  |
| 230 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 231 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 232 | random_street_performance | 街头表演 |  | +1 |  |
| 233 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 234 | random_minor_injury | 小伤 |  | 0 |  |
| 235 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 236 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 237 | random_street_performance | 街头表演 |  | +1 |  |
| 238 | mid_health_scare | 健康警报 | 去找治疗师 | -1 |  |
| 239 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 240 | random_street_performance | 街头表演 |  | +1 |  |
| 241 | random_weather_blessing | 好天气 |  | +1 |  |
| 242 | mid_legacy_project | 留下遗产 | 写一本书 | +1 |  |
| 243 | random_street_performance | 街头表演 |  | +1 |  |
| 244 | random_minor_injury | 小伤 |  | 0 |  |
| 245 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 246 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 247 | random_street_performance | 街头表演 |  | 0 |  |
| 248 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 249 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 250 | random_street_performance | 街头表演 |  | 0 |  |
| 251 | mid_garden_retirement | 后院花园 | 在花园中冥想 | 0 |  |
| 252 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 253 | random_minor_injury | 小伤 |  | -1 |  |
| 254 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 255 | random_minor_injury | 小伤 |  | -1 |  |
| 256 | random_minor_injury | 小伤 |  | -1 |  |
| 257 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 258 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 259 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 260 | random_minor_injury | 小伤 |  | -1 |  |
| 261 | random_minor_injury | 小伤 |  | -1 |  |
| 262 | random_minor_injury | 小伤 |  | -1 |  |
| 263 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 264 | random_minor_injury | 小伤 |  | -1 |  |
| 265 | random_minor_injury | 小伤 |  | -1 |  |
| 266 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 267 | random_minor_injury | 小伤 |  | -2 |  |
| 268 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 269 | random_minor_injury | 小伤 |  | -2 |  |
| 270 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 271 | random_minor_injury | 小伤 |  | -2 |  |
| 272 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 273 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +9 |  |
| 274 | mid_body_decline | 岁月的痕迹 | 接受现实 | -11 |  |
| 275 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | -1 |  |
| 276 | random_minor_injury | 小伤 |  | -2 |  |
| 277 | random_minor_injury | 小伤 |  | -2 |  |
| 278 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 279 | random_minor_injury | 小伤 |  | -2 |  |
| 280 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 281 | random_minor_injury | 小伤 |  | -3 |  |
| 282 | random_minor_injury | 小伤 |  | -3 |  |
| 283 | random_minor_injury | 小伤 |  | -3 |  |
| 284 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 285 | random_minor_injury | 小伤 |  | -3 |  |
| 286 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 287 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 288 | random_minor_injury | 小伤 |  | -3 |  |
| 289 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 290 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 291 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 292 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 293 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 294 | random_minor_injury | 小伤 |  | -4 |  |
| 295 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 296 | random_minor_injury | 小伤 |  | -4 |  |
| 297 | random_minor_injury | 小伤 |  | -4 |  |
| 298 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 299 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 300 | elf_time_perception | 时间的感知 |  | -3 |  |
| 301 | elf_last_song | 最后的歌 |  | -4 |  |
| 302 | random_minor_injury | 小伤 |  | -5 |  |
| 303 | random_minor_injury | 小伤 |  | -5 |  |
| 304 | random_nightmare_visit | 不安的梦 |  | -4 |  |
| 305 | random_minor_injury | 小伤 |  | -5 |  |
| 306 | random_minor_injury | 小伤 |  | -5 |  |
| 307 | random_nightmare_visit | 不安的梦 |  | -4 |  |
| 308 | mid_legacy_review | 回首半生 | 无怨无悔 | -4 |  |
| 309 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | -4 |  |
| 310 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 311 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 312 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 313 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 314 | mid_apprentice_success | 弟子出师 | 隆重送行 | -5 |  |
| 315 | random_minor_injury | 小伤 |  | -6 |  |
| 316 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 317 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 318 | random_nightmare_visit | 不安的梦 |  | -6 |  |
| 319 | random_nightmare_visit | 不安的梦 |  | -6 |  |
| 320 | random_nightmare_visit | 不安的梦 |  | +9 |  |
| 321 | random_nightmare_visit | 不安的梦 |  | -6 |  |
| 322 | random_minor_injury | 小伤 |  | -31 |  |

### 4. 精灵-男-B (seed=8004)

- 种族: elf | 性别: male
- 寿命: 385/500 | 评级: B 小有成就 | 分数: 274.3
- 初始HP: 31 | 事件数: 385 | 平凡年: 0
- 成就: 38 个 [first_step, ten_lives, elf_forest_healer_ach, elf_worldtree_blessed, elf_star_song_ach, soul_pure, archmage_body, beauty_supreme, male_beauty, wisdom_peak, elf_magic_pinnacle, elf_spirit_bond, merchant_empire, elf_worldtree_guardian, dragon_knight, elf_dragon_bond, wealth_peak, elf_council_seat, scholar_warrior, cheated_death_ach, demon_king_slayer_ach, iron_body, divine_champion_ach, archmage_ach, legacy_master, elf_mentor_legacy, eternal_wanderer, famous_author_ach, peaceful_ending, undying_legend_ach, legacy_of_students, memories_in_hands, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle]
- 路线: on_adventurer_path, on_merchant_path
- 物品: 2 个 [soul_gem, lucky_charm]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_eclipse | 日蚀之日 |  | +2 |  |
| 2 | elf_moonlight_lullaby | 月光摇篮曲 |  | +2 |  |
| 3 | elf_dewdrop_game | 露珠捉迷藏 |  | +2 |  |
| 4 | elf_first_treesong | 第一次听见树歌 | 尝试用魔力回应树灵 | +2 |  |
| 5 | elf_seed_planting | 种下第一棵树 |  | +2 |  |
| 6 | elf_talking_to_tree | 与树对话 |  | +2 |  |
| 7 | elf_first_magic_spark | 第一缕魔火 |  | +1 |  |
| 8 | village_festival | 村里祭典 | 大吃特吃 | 0 |  |
| 9 | childhood_play | 村口的泥巴大战 | 当孩子王 | -4 |  |
| 10 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +2 |  |
| 11 | childhood_chase | 抓蜻蜓 | 抓到了一只 | +2 |  |
| 12 | bullied | 被大孩子欺负 | 忍气吞声 | -4 |  |
| 13 | elf_ancient_library | 远古图书馆 |  | 0 |  |
| 14 | child_lost_in_woods | 迷路 | 跟着星星走 | 0 |  |
| 15 | elf_human_encounter | 初遇人类 | 友善地打招呼 | 0 |  |
| 16 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 17 | bullied_repeat | 他们又来了 | 继续忍耐 | 0 |  |
| 18 | elf_first_century | 第一个百年 |  | 0 |  |
| 19 | elf_healing_spring | 治愈之泉 |  | +3 |  |
| 20 | elf_dream_walker | 梦境行走 |  | -3 |  |
| 21 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | 0 |  |
| 22 | elf_beast_tongue | 兽语习得 |  | +2 |  |
| 23 | elf_starlight_weaving | 星光织衣 |  | +2 |  |
| 24 | elf_world_tree_communion | 与世界树共鸣 |  | +2 |  |
| 25 | elf_century_meditation | 百年冥想 | 专注内心的平静 | +1 |  |
| 26 | elf_moonwell_ritual | 月池仪式 |  | 0 |  |
| 27 | child_stray_animal | 收养流浪动物 | 带回家照顾 | 0 |  |
| 28 | stray_dog | 流浪狗 | 带它回家 | 0 |  |
| 29 | random_found_coin | 捡到硬币 |  | 0 |  |
| 30 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | 0 |  |
| 31 | grandma_recipes | 奶奶的秘方 | 认真学习 | 0 |  |
| 32 | elf_forbidden_magic_scroll | 禁忌魔法卷轴 | 打开研读 | -7 |  |
| 33 | child_night_sky | 仰望星空 |  | 0 |  |
| 34 | first_competition | 第一次比赛 | 拼尽全力 | 0 | ✅ |
| 35 | elf_diplomatic_mission | 外交使命 | 以理服人 | +2 |  |
| 36 | tree_climbing | 爬树冒险 | 爬到最高处 | +2 | ✅ |
| 37 | elf_ancient_magic | 精灵秘术·星辰之歌 | 全身心学习星辰之歌 | +2 | ✅ |
| 38 | stand_up_moment | 不再忍耐 | 正面反击 | -6 | ❌ |
| 39 | village_feud | 村长之争 | 帮弱者说话 | +2 |  |
| 40 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +2 |  |
| 41 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | +2 |  |
| 42 | random_weather_blessing | 好天气 |  | +2 |  |
| 43 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -6 | ✅ |
| 44 | river_fishing | 河边抓鱼 | 耐心等待 | +2 |  |
| 45 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | +2 |  |
| 46 | elf_crystal_cave | 水晶洞窟 | 仔细研究水晶 | +2 |  |
| 47 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +2 |  |
| 48 | random_weather_blessing | 好天气 |  | +2 |  |
| 49 | elf_moonstone_forge | 月石锻造 | 亲手锻造 | +2 |  |
| 50 | elf_dark_elf_encounter | 黑暗精灵 | 帮助对方 | +2 |  |
| 51 | teen_secret_discovered | 发现秘密 | 公开揭发 | +2 |  |
| 52 | kindness_of_stranger | 陌生人的善意 |  | +2 |  |
| 53 | elf_dream_walker_adult | 入梦者 |  | +2 |  |
| 54 | village_race | 村里赛跑 | 全力冲刺 | +2 |  |
| 55 | elf_longevity_burden | 不老之痛 | 接受这就是精灵的命运 | +2 |  |
| 56 | guild_recruitment | 冒险者公会招募 | 报名参加 | +2 |  |
| 57 | elf_human_friend_aging | 人类友人的衰老 |  | +2 |  |
| 58 | teen_race_competition | 少年竞技会 | 参加跑步 | +2 |  |
| 59 | elf_council_invitation | 长老会议席邀请 |  | +2 |  |
| 60 | first_love | 初恋的味道 | 表白 | +2 | ✅ |
| 61 | old_soldier_story | 老兵的故事 | 认真听完 | +2 |  |
| 62 | elf_runic_barrier | 符文结界 |  | +2 |  |
| 63 | random_street_performance | 街头表演 |  | +2 |  |
| 64 | street_performance | 街头表演 | 上台尝试 | +2 | ✅ |
| 65 | catch_thief | 抓小偷 | 追上去 | +2 |  |
| 66 | bullied_fight_back | 反击！ | 直接动手 | +2 | ✅ |
| 67 | merchant_guidance | 商人学徒招募 | 拜师学商 | +2 |  |
| 68 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | +2 |  |
| 69 | random_good_meal | 丰盛的一餐 |  | +2 |  |
| 70 | traveling_sage | 云游学者 | 跟随学者学习 | +2 |  |
| 71 | teen_future_talk | 夜谈未来 | 认真说出愿望 | +2 |  |
| 72 | random_stargazing | 观星 |  | +2 |  |
| 73 | chr_public_speech | 广场演说 | 慷慨陈词 | +2 | ✅ |
| 74 | elf_magic_research | 魔法论文 | 发表论文 | +2 |  |
| 75 | elf_treesong_mastery | 树歌精通 |  | +2 |  |
| 76 | random_minor_injury | 小伤 |  | +1 |  |
| 77 | teen_first_errand | 第一次独自办事 | 稳稳办妥 | +2 |  |
| 78 | spr_dream_vision | 预知梦 | 认真对待 | +1 |  |
| 79 | elf_spell_weaving | 织法术式 |  | 0 |  |
| 80 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | 0 |  |
| 81 | street_performer | 街头表演 | 上去表演 | 0 |  |
| 82 | elf_silver_harp | 银竖琴 |  | 0 |  |
| 83 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 84 | elf_lament_for_fallen | 悲歌 |  | -1 |  |
| 85 | spr_spirit_animal | 灵兽伴行 | 伸出手 | +1 | ✅ |
| 86 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | -7 |  |
| 87 | dating_start | 开始交往 | 正式告白 | 0 |  |
| 88 | random_minor_injury | 小伤 |  | -1 |  |
| 89 | forbidden_love | 禁忌之恋 | 一起私奔 | -14 |  |
| 90 | youth_short_term_job | 临时差事 | 老老实实做完 | +2 |  |
| 91 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +2 | ✅ |
| 92 | market_haggling | 集市砍价 | 砍价大师 | +2 |  |
| 93 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | +2 | ✅ |
| 94 | elf_eternal_garden | 永恒花园 |  | +2 |  |
| 95 | cryptic_manuscript | 神秘手稿 | 花时间破译 | +2 |  |
| 96 | merchant_career | 商路崛起 | 扩张商路 | +2 | ✅ |
| 97 | youth_caravan_guard | 商队护卫 | 报名参加 | +1 |  |
| 98 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | +2 |  |
| 99 | mny_inherit_uncle | 叔父遗产 | 接受遗产 | +2 |  |
| 100 | youth_crisis_crossroad | 命运的十字路口 | 踏上冒险旅途 | +2 |  |
| 101 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | +2 |  |
| 102 | elf_young_elf_mentor | 指导年轻精灵 |  | -1 |  |
| 103 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | 0 |  |
| 104 | elf_forest_expansion | 拓展森林 |  | +2 |  |
| 105 | traveling_merchant | 旅行商人 | 听他讲故事 | +1 |  |
| 106 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | 0 |  |
| 107 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | 0 |  |
| 108 | pet_companion | 捡到流浪动物 | 带回家养 | 0 |  |
| 109 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | 0 |  |
| 110 | elf_star_song | 星之歌 |  | -7 |  |
| 111 | elf_teaching_young | 教导下一代 |  | 0 |  |
| 112 | elf_worldtree_guardian | 世界树守护者选拔 | 接受选拔挑战 | 0 |  |
| 113 | random_street_performance | 街头表演 |  | 0 |  |
| 114 | merchant_guild | 商行 | 创业！ | 0 | ✅ |
| 115 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -3 | ✅ |
| 116 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 117 | random_weather_blessing | 好天气 |  | +2 |  |
| 118 | mny_trade_route | 丝绸之路 | 谈判 | -4 | ✅ |
| 119 | rare_time_loop | 时间循环 | 利用循环学习一切 | +2 |  |
| 120 | mana_overflow | 魔力暴走 | 冷静控制 | +2 |  |
| 121 | dark_cult_encounter | 暗黑教团 | 潜入调查 | -9 |  |
| 122 | arcane_academy_invitation | 奥术学院的邀请 | 欣然前往 | +2 |  |
| 123 | adult_guild_promotion | 工会晋升 | 接受晋升 | +2 |  |
| 124 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +2 |  |
| 125 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -3 |  |
| 126 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -8 | ✅ |
| 127 | divine_vision | 神谕 | 遵循神谕行事 | +2 |  |
| 128 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -3 |  |
| 129 | random_rainy_contemplation | 雨中沉思 |  | +2 |  |
| 130 | mid_gambling | 地下赌场 | 梭哈！ | +2 | ✅ |
| 131 | elf_dragon_alliance | 与龙族结盟 | 接受盟约 | +2 |  |
| 132 | adult_business_startup | 创业梦想 | 全力投入 | +2 | ✅ |
| 133 | merchant_auction | 稀有拍卖会 | 竞拍神器 | +2 | ✅ |
| 134 | adult_teaching_offer | 教学邀请 | 欣然接受 | +2 |  |
| 135 | dark_cult_aftermath | 暗影的低语 | 向城卫军举报 | +2 |  |
| 136 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +2 |  |
| 137 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 138 | business_venture | 创业冒险 | 大胆投资 | 0 |  |
| 139 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 140 | mysterious_stranger | 神秘旅人 | 和他交谈 | 0 |  |
| 141 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 142 | elf_watching_generations | 看着世代更替 |  | 0 |  |
| 143 | merchant_economic_crisis | 经济危机 | 抄底 | 0 | ✅ |
| 144 | random_street_performance | 街头表演 |  | 0 |  |
| 145 | investment_opportunity | 投资机会 | 全部投入 | 0 | ❌ |
| 146 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | 0 |  |
| 147 | dragon_youngling_growth | 幼龙成长 | 与幼龙一起练习飞行 | 0 | ✅ |
| 148 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +2 |  |
| 149 | random_minor_injury | 小伤 |  | +1 |  |
| 150 | mid_business_rivalry | 商战 | 智取胜过 | +2 | ✅ |
| 151 | buy_house | 买房置业 | 买！ | +2 |  |
| 152 | chain_dark_past | 黑暗过去 | 谈判 | 0 | ✅ |
| 153 | mid_adopt_orphan | 路边孤儿 | 带回家 | 0 |  |
| 154 | random_helping_stranger | 帮助陌生人 |  | -3 |  |
| 155 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 156 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 157 | rare_gods_gift | 神之恩赐 | 接受神力 | +21 |  |
| 158 | random_helping_stranger | 帮助陌生人 |  | -20 |  |
| 159 | random_street_performance | 街头表演 |  | 0 |  |
| 160 | elf_wisdom_council_seat | 贤者之席 |  | 0 |  |
| 161 | random_street_performance | 街头表演 |  | 0 |  |
| 162 | mid_natural_disaster | 天灾 | 组织救援 | 0 |  |
| 163 | neighbor_dispute | 邻里纠纷 | 坐下来好好谈 | 0 |  |
| 164 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | 0 |  |
| 165 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | -6 | ❌ |
| 166 | chain_rise_to_power | 权力之路 | 参选 | +2 | ✅ |
| 167 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +2 | ✅ |
| 168 | random_street_performance | 街头表演 |  | +2 |  |
| 169 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 170 | dragon_sky_patrol | 龙背巡游 | 巡视边境，威慑敌人 | +2 |  |
| 171 | mny_tax_crisis | 税务危机 | 偷税漏税 | +2 | ✅ |
| 172 | random_street_performance | 街头表演 |  | +2 |  |
| 173 | protect_family | 家门口的怪物 | 正面迎敌 | -8 |  |
| 174 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +2 | ✅ |
| 175 | spr_near_death | 濒死体验 | 挣扎求生 | -13 |  |
| 176 | random_street_performance | 街头表演 |  | +2 |  |
| 177 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 178 | challenge_final_boss | 魔王降临 | 直面魔王 | -23 | ✅ |
| 179 | random_street_performance | 街头表演 |  | +2 |  |
| 180 | random_street_performance | 街头表演 |  | +2 |  |
| 181 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 182 | food_culture | 美食之旅 | 学习烹饪 | +2 |  |
| 183 | arena_champion_invite | 竞技场的邀请 | 参加比赛 | +2 |  |
| 184 | random_minor_injury | 小伤 |  | +1 |  |
| 185 | mid_old_enemy | 旧敌来访 | 正面迎战 | +2 | ✅ |
| 186 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 187 | mid_property_acquisition | 置办产业 | 买一栋城镇宅邸 | +2 |  |
| 188 | scenic_travel | 远行见世面 | 冒险路线 | +2 |  |
| 189 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 190 | random_street_performance | 街头表演 |  | +2 |  |
| 191 | challenge_abyss | 深渊之门 | 走入深渊 | -8 | ✅ |
| 192 | gambling_night | 赌场之夜 | 放手一搏 | +2 |  |
| 193 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 194 | challenge_god_trial | 神之试炼 | 接受试炼 | -18 | ✅ |
| 195 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 196 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | +2 |  |
| 197 | community_leader | 社区领袖 | 接受职位 | +2 |  |
| 198 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 199 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +2 |  |
| 200 | mid_found_school | 开宗立派 | 门庭若市 | +2 | ✅ |
| 201 | elf_fading_magic | 魔力的消退 |  | +2 |  |
| 202 | mid_heir_training | 培养继承人 | 青出于蓝 | +2 | ✅ |
| 203 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 204 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 205 | dragon_ultimate_bond | 龙之试炼 | 接受龙之试炼 | +2 | ✅ |
| 206 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | -28 | ❌ |
| 207 | war_aftermath | 战后动荡 | 继续战斗 | -22 | ✅ |
| 208 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -13 |  |
| 209 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +11 |  |
| 210 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +2 |  |
| 211 | mid_life_reflection | 人生回顾 |  | +2 |  |
| 212 | elf_passing_crown | 传承 |  | +2 |  |
| 213 | random_street_performance | 街头表演 |  | +2 |  |
| 214 | random_street_performance | 街头表演 |  | +2 |  |
| 215 | old_rival | 老对手来访 | 热情招待 | +2 |  |
| 216 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | +2 |  |
| 217 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 218 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 219 | random_street_performance | 街头表演 |  | +2 |  |
| 220 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +2 |  |
| 221 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 222 | teaching_others | 传授经验 | 认真教学 | +2 |  |
| 223 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 224 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 225 | random_weather_blessing | 好天气 |  | +2 |  |
| 226 | random_street_performance | 街头表演 |  | +2 |  |
| 227 | midlife_crisis | 中年危机 | 放下执念 | +7 |  |
| 228 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 229 | random_street_performance | 街头表演 |  | +2 |  |
| 230 | random_weather_blessing | 好天气 |  | +2 |  |
| 231 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 232 | random_street_performance | 街头表演 |  | +2 |  |
| 233 | random_weather_blessing | 好天气 |  | +2 |  |
| 234 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 235 | random_street_performance | 街头表演 |  | +2 |  |
| 236 | random_minor_injury | 小伤 |  | +1 |  |
| 237 | mid_health_scare | 健康警报 | 去找治疗师 | 0 |  |
| 238 | random_street_performance | 街头表演 |  | +2 |  |
| 239 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 240 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 241 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 242 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 243 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 244 | harvest_festival | 丰收祭典 | 参加各项比赛 | +2 |  |
| 245 | random_street_performance | 街头表演 |  | +2 |  |
| 246 | random_minor_injury | 小伤 |  | +1 |  |
| 247 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 248 | random_street_performance | 街头表演 |  | +2 |  |
| 249 | random_weather_blessing | 好天气 |  | +2 |  |
| 250 | elder_family_reunion | 天伦之乐 | 其乐融融 | +17 |  |
| 251 | random_minor_injury | 小伤 |  | +1 |  |
| 252 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 253 | random_minor_injury | 小伤 |  | +1 |  |
| 254 | mid_garden_retirement | 后院花园 | 在花园中冥想 | +2 |  |
| 255 | random_minor_injury | 小伤 |  | +1 |  |
| 256 | mid_legacy_project | 留下遗产 | 写一本书 | +2 |  |
| 257 | random_minor_injury | 小伤 |  | +1 |  |
| 258 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 259 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 260 | random_minor_injury | 小伤 |  | +1 |  |
| 261 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 262 | random_minor_injury | 小伤 |  | +1 |  |
| 263 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 264 | random_minor_injury | 小伤 |  | +1 |  |
| 265 | random_minor_injury | 小伤 |  | +1 |  |
| 266 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 267 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 268 | random_minor_injury | 小伤 |  | +1 |  |
| 269 | random_minor_injury | 小伤 |  | 0 |  |
| 270 | random_minor_injury | 小伤 |  | 0 |  |
| 271 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 272 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +10 |  |
| 273 | mid_body_decline | 岁月的痕迹 | 接受现实 | -20 |  |
| 274 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 275 | random_minor_injury | 小伤 |  | 0 |  |
| 276 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 277 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | +1 |  |
| 278 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 279 | random_minor_injury | 小伤 |  | -1 |  |
| 280 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 281 | random_minor_injury | 小伤 |  | -2 |  |
| 282 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 283 | random_minor_injury | 小伤 |  | -1 |  |
| 284 | random_minor_injury | 小伤 |  | 0 |  |
| 285 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 286 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 287 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 288 | random_minor_injury | 小伤 |  | -1 |  |
| 289 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 290 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 291 | random_minor_injury | 小伤 |  | -1 |  |
| 292 | random_minor_injury | 小伤 |  | 0 |  |
| 293 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 294 | random_minor_injury | 小伤 |  | -2 |  |
| 295 | random_minor_injury | 小伤 |  | 0 |  |
| 296 | random_minor_injury | 小伤 |  | 0 |  |
| 297 | random_minor_injury | 小伤 |  | 0 |  |
| 298 | random_minor_injury | 小伤 |  | 0 |  |
| 299 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 300 | elf_time_perception | 时间的感知 |  | 0 |  |
| 301 | elf_last_song | 最后的歌 |  | 0 |  |
| 302 | random_minor_injury | 小伤 |  | -1 |  |
| 303 | random_minor_injury | 小伤 |  | -1 |  |
| 304 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 305 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 306 | random_minor_injury | 小伤 |  | -1 |  |
| 307 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 308 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 309 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 310 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 311 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 312 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 313 | random_minor_injury | 小伤 |  | -1 |  |
| 314 | mid_apprentice_success | 弟子出师 | 隆重送行 | 0 |  |
| 315 | random_minor_injury | 小伤 |  | -1 |  |
| 316 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 317 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 318 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 319 | random_minor_injury | 小伤 |  | -2 |  |
| 320 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 321 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 322 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 323 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 324 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 325 | random_minor_injury | 小伤 |  | -2 |  |
| 326 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 327 | random_minor_injury | 小伤 |  | -2 |  |
| 328 | random_minor_injury | 小伤 |  | -2 |  |
| 329 | random_minor_injury | 小伤 |  | -2 |  |
| 330 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 331 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 332 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 333 | random_minor_injury | 小伤 |  | -3 |  |
| 334 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 335 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 336 | random_minor_injury | 小伤 |  | -3 |  |
| 337 | random_minor_injury | 小伤 |  | -3 |  |
| 338 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 339 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 340 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 341 | random_minor_injury | 小伤 |  | -3 |  |
| 342 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 343 | random_minor_injury | 小伤 |  | -4 |  |
| 344 | random_minor_injury | 小伤 |  | -4 |  |
| 345 | random_minor_injury | 小伤 |  | -4 |  |
| 346 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 347 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 348 | random_minor_injury | 小伤 |  | -4 |  |
| 349 | random_minor_injury | 小伤 |  | -4 |  |
| 350 | elder_legacy_gift | 传家之宝 | 传给有缘人 | -3 |  |
| 351 | elder_memoir | 撰写回忆录 | 传世之作 | -3 | ✅ |
| 352 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 353 | elf_last_spring | 最后的春天 |  | -4 |  |
| 354 | elder_unexpected_visitor | 意外的来访者 |  | -4 |  |
| 355 | retirement | 挂剑归隐 | 归隐山林 | +4 |  |
| 356 | elf_eternal_sleep | 永恒之眠 |  | -4 |  |
| 357 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -14 | ✅ |
| 358 | elder_last_adventure | 不服老的冒险 | 出发！ | -4 | ✅ |
| 359 | elder_passing_wisdom | 智者之言 |  | -4 |  |
| 360 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -4 | ✅ |
| 361 | elder_disciple_visit | 故徒来访 | 感念师恩 | +6 |  |
| 362 | elder_garden_peace | 花园时光 |  | -5 |  |
| 363 | elder_autobiography | 自传 | 欣然同意 | -5 |  |
| 364 | elder_last_journey | 最后的旅途 | 去海边看日出 | -5 |  |
| 365 | elder_dream_fulfilled | 完成心愿 |  | -5 |  |
| 366 | elder_old_letters | 旧日书信 |  | -5 |  |
| 367 | elder_miracle_recovery | 奇迹般的康复 |  | +8 |  |
| 368 | elf_farewell_ceremony | 告别仪式 |  | -5 |  |
| 369 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 370 | elder_sunset_watching | 夕阳 |  | -6 |  |
| 371 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +2 |  |
| 372 | elder_final_gift | 最后的礼物 |  | +2 |  |
| 373 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 374 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -6 |  |
| 375 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 376 | random_nightmare_visit | 不安的梦 |  | +2 |  |
| 377 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 378 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 379 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 380 | random_nightmare_visit | 不安的梦 |  | -7 |  |
| 381 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 382 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 383 | legend_spread | 传说的传播 | 享受名声 | +1 |  |
| 384 | elder_frail | 风烛残年 | 安享晚年 | -15 |  |
| 385 | elder_old_enemy | 昔日的对手 | 去见他 | -18 |  |

### 5. 矮人-男-A (seed=8005)

- 种族: dwarf | 性别: male
- 寿命: 349/400 | 评级: B 小有成就 | 分数: 272.4
- 初始HP: 46 | 事件数: 323 | 平凡年: 26
- 成就: 37 个 [first_step, ten_lives, dwarf_dragon_vow_ach, scholar_warrior, beauty_supreme, male_beauty, soul_pure, dwarf_masterwork_ach, iron_body, dwarf_holdfast_ach, wisdom_peak, merchant_empire, dwarf_surface_broker, dragon_knight, dwarf_hall_name, dwarf_apprentice_legacy, cheated_death_ach, wealth_peak, divine_champion_ach, demon_king_slayer_ach, archmage_ach, dwarf_dragonfire_legacy, eternal_wanderer, memories_in_hands, famous_author_ach, legacy_of_students, peaceful_ending, undying_legend_ach, longevity, eternal_peace, hero_ach, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness]
- 路线: on_adventurer_path, on_merchant_path
- 物品: 3 个 [soul_gem, lucky_charm, ancient_relic]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_twins | 双生子 |  | +3 |  |
| 4 | child_dwarf_first_hammer | 第一次握锤 | 先练稳稳落锤 | 0 |  |
| 6 | childhood_play | 村口的泥巴大战 | 当孩子王 | +1 |  |
| 7 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +3 |  |
| 8 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 9 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 10 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 11 | bullied | 被大孩子欺负 | 忍气吞声 | -3 |  |
| 12 | bullied_repeat | 他们又来了 | 继续忍耐 | 0 |  |
| 13 | first_snow | 初雪 | 堆雪人 | 0 |  |
| 14 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -8 | ✅ |
| 15 | stray_dog | 流浪狗 | 带它回家 | +3 |  |
| 16 | grandma_recipes | 奶奶的秘方 | 认真学习 | +3 |  |
| 17 | child_lost_in_woods | 迷路 | 跟着星星走 | -5 |  |
| 18 | stand_up_moment | 不再忍耐 | 正面反击 | 0 | ✅ |
| 19 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | +3 |  |
| 20 | river_discovery | 河底发光 | 潜下去捡 | -7 | ❌ |
| 21 | teen_dwarf_dragon_relic_vigil | 守望龙族旧迹 | 向遗迹行最庄重的礼 | +3 |  |
| 22 | first_competition | 第一次比赛 | 拼尽全力 | +3 | ❌ |
| 23 | child_first_fight | 第一次打架 | 挥拳反击 | +3 |  |
| 24 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +3 |  |
| 25 | teen_dwarf_choose_master | 拜师之日 | 跟锻炉师傅学火候 | +3 |  |
| 26 | child_drowning | 河中溺水 | 拼命挣扎 | -17 | ❌ |
| 27 | tree_climbing | 爬树冒险 | 爬到最高处 | +3 | ✅ |
| 28 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | +3 |  |
| 29 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | +3 |  |
| 30 | village_feud | 村长之争 | 帮弱者说话 | +3 |  |
| 31 | random_found_coin | 捡到硬币 |  | +3 |  |
| 32 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +3 |  |
| 33 | part_time_work | 打零工 | 去码头扛货 | +3 |  |
| 34 | random_good_meal | 丰盛的一餐 |  | +3 |  |
| 35 | teen_race_competition | 少年竞技会 | 参加跑步 | +3 |  |
| 36 | guild_recruitment | 冒险者公会招募 | 报名参加 | +3 |  |
| 37 | river_fishing | 河边抓鱼 | 耐心等待 | +3 |  |
| 38 | explore_ruins | 废墟探险 | 推门进去 | +3 | ✅ |
| 39 | young_rival | 少年的对手 | 努力超越他 | +3 |  |
| 40 | teen_secret_discovered | 发现秘密 | 公开揭发 | +3 |  |
| 41 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 42 | kindness_of_stranger | 陌生人的善意 |  | +3 |  |
| 43 | merchant_guidance | 商人学徒招募 | 拜师学商 | +3 |  |
| 44 | youth_dwarf_first_commission | 第一份真正的委托 | 把它做成最耐用的 | +3 |  |
| 45 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 46 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +3 |  |
| 47 | child_plague | 瘟疫来袭 | 乖乖休息 | -27 |  |
| 48 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +3 |  |
| 49 | first_love | 初恋的味道 | 表白 | +3 | ✅ |
| 50 | help_farmer | 帮农夫收麦 | 帮忙割麦 | +3 |  |
| 51 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | +3 |  |
| 52 | old_soldier_story | 老兵的故事 | 认真听完 | +3 |  |
| 53 | youth_dwarf_surface_caravan | 走一趟地表商路 | 硬记地表的路标 | +3 |  |
| 54 | wander_market | 逛集市 | 买了一本旧书 | +3 |  |
| 55 | bullied_fight_back | 反击！ | 直接动手 | +3 | ✅ |
| 56 | random_stargazing | 观星 |  | +3 |  |
| 57 | random_rainy_contemplation | 雨中沉思 |  | +3 |  |
| 58 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | +3 |  |
| 59 | teen_first_errand | 第一次独自办事 | 稳稳办妥 | +3 |  |
| 60 | star_gazing | 观星 | 冥想 | +3 |  |
| 61 | gambling_night | 赌场之夜 | 放手一搏 | +3 |  |
| 62 | street_performance | 街头表演 | 上台尝试 | +3 | ✅ |
| 63 | spr_spirit_animal | 灵兽伴行 | 伸出手 | +3 | ✅ |
| 64 | traveling_merchant | 旅行商人 | 听他讲故事 | +3 |  |
| 65 | dating_start | 开始交往 | 正式告白 | +3 |  |
| 66 | chr_public_speech | 广场演说 | 慷慨陈词 | +3 | ❌ |
| 67 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | +3 |  |
| 68 | random_weather_blessing | 好天气 |  | +2 |  |
| 69 | teen_future_talk | 夜谈未来 | 认真说出愿望 | 0 |  |
| 70 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 71 | random_street_performance | 街头表演 |  | 0 |  |
| 72 | forbidden_love | 禁忌之恋 | 一起私奔 | -15 |  |
| 73 | adult_dwarf_masterwork | 打造传世之作 | 锻成最可靠的兵甲 | +3 |  |
| 74 | traveling_sage | 云游学者 | 跟随学者学习 | +3 |  |
| 75 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +3 | ✅ |
| 76 | adult_dwarf_hold_alarm | 要塞警报 | 扛盾守住最窄的入口 | +1 |  |
| 77 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 78 | youth_caravan_guard | 商队护卫 | 报名参加 | +3 |  |
| 79 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -2 |  |
| 80 | cryptic_manuscript | 神秘手稿 | 花时间破译 | +3 |  |
| 81 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | -12 |  |
| 82 | pet_companion | 捡到流浪动物 | 带回家养 | +3 |  |
| 83 | arena_champion_invite | 竞技场的邀请 | 参加比赛 | +3 |  |
| 84 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | +3 |  |
| 85 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +3 |  |
| 86 | street_performer | 街头表演 | 上去表演 | +3 |  |
| 87 | scholar_guidance | 学者收徒 | 拜师求教 | +3 |  |
| 88 | merchant_career | 商路崛起 | 扩张商路 | +3 | ✅ |
| 89 | merchant_guild | 商行 | 创业！ | +3 | ✅ |
| 90 | random_street_performance | 街头表演 |  | +3 |  |
| 91 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -2 |  |
| 92 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +3 |  |
| 93 | investment_opportunity | 投资机会 | 全部投入 | +3 | ✅ |
| 94 | adult_guild_promotion | 工会晋升 | 接受晋升 | +2 |  |
| 95 | divine_vision | 神谕 | 遵循神谕行事 | 0 |  |
| 96 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | 0 | ✅ |
| 97 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 98 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 99 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | -30 | ❌ |
| 100 | mny_tax_crisis | 税务危机 | 偷税漏税 | +3 | ✅ |
| 101 | youth_short_term_job | 临时差事 | 老老实实做完 | +3 |  |
| 102 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 103 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +3 | ✅ |
| 104 | dragon_youngling_growth | 幼龙成长 | 与幼龙一起练习飞行 | +3 | ✅ |
| 105 | chain_dark_past | 黑暗过去 | 谈判 | +3 | ❌ |
| 106 | random_street_performance | 街头表演 |  | +3 |  |
| 107 | mid_dwarf_name_in_hall | 名字刻上石厅 | 把作品名刻在自己名前面 | +3 |  |
| 108 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +3 |  |
| 109 | adult_teaching_offer | 教学邀请 | 欣然接受 | +3 |  |
| 110 | adult_business_startup | 创业梦想 | 全力投入 | +3 | ✅ |
| 111 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +3 |  |
| 112 | random_minor_injury | 小伤 |  | +2 |  |
| 113 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -32 | ❌ |
| 114 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 115 | mid_dwarf_apprentice_oath | 轮到你收徒了 | 先把规矩立得很严 | +3 |  |
| 116 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 117 | mid_gambling | 地下赌场 | 梭哈！ | +3 | ❌ |
| 118 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +3 | ✅ |
| 119 | random_street_performance | 街头表演 |  | +3 |  |
| 120 | challenge_abyss | 深渊之门 | 走入深渊 | -7 | ✅ |
| 121 | mid_adopt_orphan | 路边孤儿 | 带回家 | +3 |  |
| 122 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +3 |  |
| 123 | mid_property_acquisition | 置办产业 | 买一栋城镇宅邸 | +3 |  |
| 124 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 125 | mid_return_adventure | 重出江湖 | 挑战新地城 | -7 | ✅ |
| 126 | mid_old_enemy | 旧敌来访 | 正面迎战 | +3 | ✅ |
| 127 | harvest_festival | 丰收祭典 | 参加各项比赛 | +3 |  |
| 128 | luk_lottery | 王国彩票 | 中大奖了！ | +3 | ❌ |
| 129 | spr_near_death | 濒死体验 | 挣扎求生 | -12 |  |
| 130 | neighbor_dispute | 邻里纠纷 | 坐下来好好谈 | +3 |  |
| 131 | mid_business_rivalry | 商战 | 智取胜过 | +3 | ✅ |
| 132 | merchant_auction | 稀有拍卖会 | 竞拍神器 | +3 | ✅ |
| 133 | random_weather_blessing | 好天气 |  | +3 |  |
| 134 | merchant_economic_crisis | 经济危机 | 抄底 | +3 | ✅ |
| 135 | protect_family | 家门口的怪物 | 正面迎敌 | -7 |  |
| 136 | food_culture | 美食之旅 | 学习烹饪 | +3 |  |
| 137 | community_leader | 社区领袖 | 接受职位 | +3 |  |
| 138 | dragon_sky_patrol | 龙背巡游 | 巡视边境，威慑敌人 | +3 |  |
| 139 | random_street_performance | 街头表演 |  | +3 |  |
| 140 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 141 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 142 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 143 | random_street_performance | 街头表演 |  | +3 |  |
| 144 | random_minor_injury | 小伤 |  | +2 |  |
| 145 | mny_trade_route | 丝绸之路 | 谈判 | -2 | ✅ |
| 146 | random_street_performance | 街头表演 |  | +3 |  |
| 147 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 148 | random_street_performance | 街头表演 |  | +3 |  |
| 149 | random_street_performance | 街头表演 |  | +3 |  |
| 150 | rare_gods_gift | 神之恩赐 | 接受神力 | +23 |  |
| 151 | business_venture | 创业冒险 | 大胆投资 | -9 |  |
| 152 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 153 | random_helping_stranger | 帮助陌生人 |  | -1 |  |
| 154 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 155 | challenge_god_trial | 神之试炼 | 接受试炼 | -20 | ✅ |
| 156 | challenge_final_boss | 魔王降临 | 直面魔王 | -22 | ✅ |
| 157 | random_street_performance | 街头表演 |  | +3 |  |
| 158 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 159 | teaching_others | 传授经验 | 认真教学 | +3 |  |
| 160 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -12 |  |
| 161 | random_street_performance | 街头表演 |  | +3 |  |
| 162 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +3 |  |
| 163 | elder_dwarf_dragonfire_watch | 守着旧龙火的人 | 继续像祖辈那样守着 | +3 |  |
| 164 | random_weather_blessing | 好天气 |  | +3 |  |
| 165 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | +3 | ✅ |
| 166 | scenic_travel | 远行见世面 | 冒险路线 | +3 |  |
| 167 | midlife_crisis | 中年危机 | 放下执念 | +8 |  |
| 168 | dragon_ultimate_bond | 龙之试炼 | 接受龙之试炼 | +3 | ✅ |
| 169 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +3 | ✅ |
| 170 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 171 | war_aftermath | 战后动荡 | 继续战斗 | -27 | ✅ |
| 172 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 173 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 174 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 175 | elder_dwarf_last_inspection | 最后一次巡炉 | 亲手补上最后一锤 | +3 |  |
| 176 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | +3 |  |
| 177 | old_rival | 老对手来访 | 热情招待 | +3 |  |
| 178 | random_weather_blessing | 好天气 |  | +3 |  |
| 179 | random_weather_blessing | 好天气 |  | +3 |  |
| 180 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +3 |  |
| 181 | random_street_performance | 街头表演 |  | +3 |  |
| 182 | mid_heir_training | 培养继承人 | 青出于蓝 | +3 | ✅ |
| 183 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +3 |  |
| 184 | random_street_performance | 街头表演 |  | +3 |  |
| 185 | mid_found_school | 开宗立派 | 门庭若市 | +3 | ✅ |
| 186 | mid_natural_disaster | 天灾 | 组织救援 | +3 |  |
| 187 | random_street_performance | 街头表演 |  | +3 |  |
| 188 | mid_life_reflection | 人生回顾 |  | +3 |  |
| 189 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 190 | random_weather_blessing | 好天气 |  | +3 |  |
| 191 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 192 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | -1 |  |
| 193 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 194 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 195 | rare_time_loop | 时间循环 | 利用循环学习一切 | +2 |  |
| 196 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 197 | random_street_performance | 街头表演 |  | 0 |  |
| 198 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | -1 |  |
| 199 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 200 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +10 |  |
| 201 | mid_garden_retirement | 后院花园 | 在花园中冥想 | -17 |  |
| 202 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 203 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 204 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 205 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 206 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 207 | random_minor_injury | 小伤 |  | -2 |  |
| 208 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 209 | mid_legacy_project | 留下遗产 | 写一本书 | -1 |  |
| 210 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 211 | mid_health_scare | 健康警报 | 去找治疗师 | -2 |  |
| 212 | random_minor_injury | 小伤 |  | 0 |  |
| 213 | random_minor_injury | 小伤 |  | 0 |  |
| 214 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 215 | random_minor_injury | 小伤 |  | -2 |  |
| 216 | random_minor_injury | 小伤 |  | 0 |  |
| 217 | random_minor_injury | 小伤 |  | 0 |  |
| 218 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 219 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 220 | random_minor_injury | 小伤 |  | -1 |  |
| 221 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 222 | random_minor_injury | 小伤 |  | -1 |  |
| 223 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 224 | random_minor_injury | 小伤 |  | -2 |  |
| 225 | random_minor_injury | 小伤 |  | 0 |  |
| 226 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 227 | random_minor_injury | 小伤 |  | -2 |  |
| 228 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 229 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 230 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 231 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 232 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 233 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 234 | random_minor_injury | 小伤 |  | -1 |  |
| 235 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 236 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 237 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +10 |  |
| 238 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | -11 |  |
| 239 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 240 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 241 | random_minor_injury | 小伤 |  | +2 |  |
| 242 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 243 | random_minor_injury | 小伤 |  | -1 |  |
| 244 | random_minor_injury | 小伤 |  | 0 |  |
| 245 | random_minor_injury | 小伤 |  | -1 |  |
| 246 | random_minor_injury | 小伤 |  | 0 |  |
| 247 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 248 | random_minor_injury | 小伤 |  | -2 |  |
| 249 | random_minor_injury | 小伤 |  | 0 |  |
| 250 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 251 | random_minor_injury | 小伤 |  | -2 |  |
| 252 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 253 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 254 | random_minor_injury | 小伤 |  | -2 |  |
| 255 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 256 | random_minor_injury | 小伤 |  | -1 |  |
| 257 | random_minor_injury | 小伤 |  | -1 |  |
| 258 | random_minor_injury | 小伤 |  | 0 |  |
| 259 | random_minor_injury | 小伤 |  | 0 |  |
| 260 | random_minor_injury | 小伤 |  | -1 |  |
| 261 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 262 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 263 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 264 | random_minor_injury | 小伤 |  | -1 |  |
| 265 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +1 |  |
| 266 | mid_legacy_review | 回首半生 | 无怨无悔 | -1 |  |
| 267 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 268 | random_minor_injury | 小伤 |  | -1 |  |
| 269 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 270 | mid_apprentice_success | 弟子出师 | 隆重送行 | 0 |  |
| 271 | random_minor_injury | 小伤 |  | -1 |  |
| 272 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 273 | random_minor_injury | 小伤 |  | -1 |  |
| 274 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 275 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 276 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 277 | random_minor_injury | 小伤 |  | -2 |  |
| 278 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 279 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 280 | elder_old_letters | 旧日书信 |  | -1 |  |
| 281 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | 0 |  |
| 282 | elder_kingdom_crisis | 王国危机 | 挺身而出 | 0 | ✅ |
| 283 | elder_legacy_gift | 传家之宝 | 传给有缘人 | -1 |  |
| 284 | elder_memoir | 撰写回忆录 | 传世之作 | 0 | ✅ |
| 285 | elder_unexpected_visitor | 意外的来访者 |  | -6 |  |
| 286 | elder_autobiography | 自传 | 欣然同意 | 0 |  |
| 287 | elder_passing_wisdom | 智者之言 |  | 0 |  |
| 288 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -10 | ✅ |
| 289 | elder_dream_fulfilled | 完成心愿 |  | +1 |  |
| 290 | elder_garden_peace | 花园时光 |  | +1 |  |
| 291 | elder_disciple_visit | 故徒来访 | 感念师恩 | +11 |  |
| 292 | elder_last_journey | 最后的旅途 | 去海边看日出 | -7 |  |
| 293 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -1 |  |
| 294 | elder_final_gift | 最后的礼物 |  | 0 |  |
| 295 | retirement | 挂剑归隐 | 归隐山林 | +8 |  |
| 296 | elder_last_adventure | 不服老的冒险 | 出发！ | -16 | ✅ |
| 297 | elder_sunset_watching | 夕阳 |  | -1 |  |
| 298 | elder_miracle_recovery | 奇迹般的康复 |  | +5 |  |
| 299 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 300 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 301 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 302 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 303 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 304 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 305 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 306 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 307 | legend_spread | 传说的传播 | 享受名声 | 0 |  |
| 308 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 309 | elder_frail | 风烛残年 | 安享晚年 | -16 |  |
| 310 | elder_old_enemy | 昔日的对手 | 去见他 | -1 |  |
| 311 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 312 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 313 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 314 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 315 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 316 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 317 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 318 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 319 | random_nightmare_visit | 不安的梦 |  | -2 |  |
| 320 | peaceful_end | 平静的终章 |  | -2 |  |
| 321 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | -2 |  |
| 322 | elder_last_feast | 最后的盛宴 | 发表感言 | -2 |  |
| 333 | elder_star_gazing_final | 最后的星空 | 内心平静 | -4 |  |
| 347 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | -6 |  |
| 348 | elder_legend_verified | 传说被验证 | 接受荣誉 | +2 |  |
| 349 | elder_final_illness | 最后的病榻 | 积极治疗 | -36 | ❌ |

### 6. 矮人-女-B (seed=8006)

- 种族: dwarf | 性别: female
- 寿命: 321/400 | 评级: B 小有成就 | 分数: 240
- 初始HP: 43 | 事件数: 318 | 平凡年: 3
- 成就: 36 个 [first_step, ten_lives, dwarf_dragon_vow_ach, scholar_warrior, beauty_supreme, dwarf_holdfast_ach, merchant_empire, dwarf_surface_broker, soul_pure, dwarf_masterwork_ach, dragon_knight, wisdom_peak, iron_body, single_mother_warrior, dwarf_apprentice_legacy, dwarf_hall_name, revenge_done, demon_king_slayer_ach, divine_champion_ach, dwarf_dragonfire_legacy, archmage_ach, female_archmage, widowed_hero, famous_author_ach, legacy_of_students, peaceful_ending, memories_in_hands, longevity, eternal_peace, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, miracle_afterglow]
- 路线: on_merchant_path
- 物品: 1 个 [lucky_charm]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_storm | 暴风夜 |  | +3 |  |
| 4 | child_dwarf_first_hammer | 第一次握锤 | 先练稳稳落锤 | 0 |  |
| 6 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 7 | village_festival | 村里祭典 | 大吃特吃 | -3 |  |
| 8 | steal_sweets | 偷吃糖果 | 老实道歉 | -3 |  |
| 9 | child_dwarf_surface_fair | 第一次去地表集市 | 寸步不离商队 | 0 |  |
| 10 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 11 | first_snow | 初雪 | 堆雪人 | 0 |  |
| 12 | childhood_play | 村口的泥巴大战 | 当孩子王 | 0 |  |
| 13 | tree_climbing | 爬树冒险 | 爬到最高处 | -12 | ❌ |
| 14 | stray_dog | 流浪狗 | 带它回家 | +3 |  |
| 15 | child_dream_flying | 会飞的梦 |  | +3 |  |
| 16 | first_competition | 第一次比赛 | 拼尽全力 | +3 | ✅ |
| 17 | child_night_sky | 仰望星空 |  | +3 |  |
| 18 | child_stray_animal | 收养流浪动物 | 带回家照顾 | +3 |  |
| 19 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | +3 |  |
| 20 | teen_dwarf_dragon_relic_vigil | 守望龙族旧迹 | 向遗迹行最庄重的礼 | +3 |  |
| 21 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +3 |  |
| 22 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -5 | ✅ |
| 23 | random_found_coin | 捡到硬币 |  | +3 |  |
| 24 | river_discovery | 河底发光 | 潜下去捡 | -7 | ❌ |
| 25 | teen_dwarf_choose_master | 拜师之日 | 跟锻炉师傅学火候 | +3 |  |
| 26 | river_fishing | 河边抓鱼 | 耐心等待 | +3 |  |
| 27 | teen_race_competition | 少年竞技会 | 参加跑步 | +3 |  |
| 28 | village_feud | 村长之争 | 帮弱者说话 | +3 |  |
| 29 | random_minor_injury | 小伤 |  | +2 |  |
| 30 | random_good_meal | 丰盛的一餐 |  | +3 |  |
| 31 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +3 |  |
| 32 | explore_ruins | 废墟探险 | 推门进去 | +3 | ✅ |
| 33 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 34 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | +3 |  |
| 35 | random_street_performance | 街头表演 |  | +3 |  |
| 36 | child_plague | 瘟疫来袭 | 乖乖休息 | -22 |  |
| 37 | wander_market | 逛集市 | 买了一本旧书 | +3 |  |
| 38 | young_rival | 少年的对手 | 努力超越他 | +3 |  |
| 39 | merchant_guidance | 商人学徒招募 | 拜师学商 | +3 |  |
| 40 | random_stargazing | 观星 |  | +3 |  |
| 41 | random_street_performance | 街头表演 |  | +3 |  |
| 42 | old_soldier_story | 老兵的故事 | 认真听完 | +3 |  |
| 43 | kindness_of_stranger | 陌生人的善意 |  | +3 |  |
| 44 | help_farmer | 帮农夫收麦 | 帮忙割麦 | +3 |  |
| 45 | mny_inherit_uncle | 叔父遗产 | 接受遗产 | +3 |  |
| 46 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +3 |  |
| 47 | catch_thief | 抓小偷 | 追上去 | +3 |  |
| 48 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | +3 |  |
| 49 | random_weather_blessing | 好天气 |  | +3 |  |
| 50 | first_love | 初恋的味道 | 表白 | +3 | ✅ |
| 51 | youth_dwarf_first_commission | 第一份真正的委托 | 把它做成最耐用的 | +3 |  |
| 52 | village_race | 村里赛跑 | 全力冲刺 | +3 |  |
| 53 | teen_first_errand | 第一次独自办事 | 稳稳办妥 | +3 |  |
| 54 | teen_future_talk | 夜谈未来 | 认真说出愿望 | +3 |  |
| 55 | part_time_work | 打零工 | 去码头扛货 | +3 |  |
| 56 | random_rainy_contemplation | 雨中沉思 |  | +3 |  |
| 57 | youth_dwarf_surface_caravan | 走一趟地表商路 | 硬记地表的路标 | +3 |  |
| 58 | star_gazing | 观星 | 冥想 | +3 |  |
| 59 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | +3 |  |
| 60 | spr_spirit_animal | 灵兽伴行 | 伸出手 | 0 | ✅ |
| 61 | street_performance | 街头表演 | 上台尝试 | -6 | ❌ |
| 62 | random_weather_blessing | 好天气 |  | 0 |  |
| 63 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 64 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | 0 |  |
| 65 | market_haggling | 集市砍价 | 砍价大师 | +3 |  |
| 66 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | 0 |  |
| 67 | street_performer | 街头表演 | 上去表演 | 0 |  |
| 68 | chr_public_speech | 广场演说 | 慷慨陈词 | 0 | ✅ |
| 69 | dating_start | 开始交往 | 正式告白 | 0 |  |
| 70 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 71 | adult_dwarf_hold_alarm | 要塞警报 | 扛盾守住最窄的入口 | -2 |  |
| 72 | merchant_career | 商路崛起 | 扩张商路 | +3 | ✅ |
| 73 | random_training_day | 勤奋的一天 | 训练体能 | -1 |  |
| 74 | random_street_performance | 街头表演 |  | +3 |  |
| 75 | cryptic_manuscript | 神秘手稿 | 花时间破译 | 0 |  |
| 76 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | 0 | ✅ |
| 77 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 78 | quest_parting | 远征前的告别 | 系上护身符 | 0 |  |
| 79 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | 0 |  |
| 80 | tavern_brawl | 酒馆斗殴 | 加入混战 | -15 |  |
| 81 | dating_deepen | 感情升温 | 一起冒险 | +3 |  |
| 82 | forbidden_love | 禁忌之恋 | 一起私奔 | -12 |  |
| 83 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -22 | ❌ |
| 84 | random_minor_injury | 小伤 |  | +2 |  |
| 85 | forest_camping | 森林露营 | 享受星空 | +3 |  |
| 86 | random_weather_blessing | 好天气 |  | +3 |  |
| 87 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 88 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | +3 |  |
| 89 | traveling_merchant | 旅行商人 | 听他讲故事 | +3 |  |
| 90 | adult_dwarf_masterwork | 打造传世之作 | 锻成最可靠的兵甲 | +3 |  |
| 91 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -2 |  |
| 92 | investment_opportunity | 投资机会 | 全部投入 | +3 | ❌ |
| 93 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +3 | ✅ |
| 94 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +3 |  |
| 95 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +3 |  |
| 96 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | +3 |  |
| 97 | marry_adventurer | 与冒险者结婚 | 在一起 | +3 |  |
| 98 | adult_first_child | 初为人父母 |  | +3 |  |
| 99 | food_culture | 美食之旅 | 学习烹饪 | +3 |  |
| 100 | dark_cult_encounter | 暗黑教团 | 潜入调查 | -7 |  |
| 101 | protect_family | 家门口的怪物 | 正面迎敌 | -7 |  |
| 102 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +3 |  |
| 103 | youth_short_term_job | 临时差事 | 老老实实做完 | +3 |  |
| 104 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -2 |  |
| 105 | lover_death_battlefield | 战场的噩耗 | 拿起剑复仇 | -12 |  |
| 106 | harvest_festival | 丰收祭典 | 参加各项比赛 | +3 |  |
| 107 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 108 | divine_vision | 神谕 | 遵循神谕行事 | +3 |  |
| 109 | adult_teaching_offer | 教学邀请 | 欣然接受 | +3 |  |
| 110 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -7 | ✅ |
| 111 | mountain_bandit_leader | 山贼头子的挑战 | 接受挑战 | +3 | ✅ |
| 112 | mid_gambling | 地下赌场 | 梭哈！ | +3 | ✅ |
| 113 | dark_cult_aftermath | 暗影的低语 | 向城卫军举报 | +3 |  |
| 114 | random_street_performance | 街头表演 |  | +3 |  |
| 115 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 116 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | +3 |  |
| 117 | adult_business_startup | 创业梦想 | 全力投入 | +3 | ✅ |
| 118 | arena_champion_invite | 竞技场的邀请 | 参加比赛 | +3 |  |
| 119 | wedding_ceremony | 婚礼 | 盛大婚礼 | +3 |  |
| 120 | mid_dwarf_apprentice_oath | 轮到你收徒了 | 先把规矩立得很严 | +3 |  |
| 121 | chain_rise_to_power | 权力之路 | 参选 | +3 | ✅ |
| 122 | avenger_trail | 复仇的线索 | 顺藤摸瓜 | +3 |  |
| 123 | mid_dwarf_name_in_hall | 名字刻上石厅 | 把作品名刻在自己名前面 | +3 |  |
| 124 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 125 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | +3 | ✅ |
| 126 | dragon_youngling_growth | 幼龙成长 | 与幼龙一起练习飞行 | +3 | ✅ |
| 127 | scenic_travel | 远行见世面 | 冒险路线 | +3 |  |
| 128 | luk_lottery | 王国彩票 | 中大奖了！ | +3 | ❌ |
| 129 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 130 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +3 |  |
| 131 | random_street_performance | 街头表演 |  | +3 |  |
| 132 | random_street_performance | 街头表演 |  | +3 |  |
| 133 | avenger_confrontation | 仇人见面 | 手刃仇人 | -7 | ✅ |
| 134 | lover_curse | 诅咒的代价 | 献祭寿命 | -12 |  |
| 135 | chain_dark_past | 黑暗过去 | 谈判 | +3 | ✅ |
| 136 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 137 | random_street_performance | 街头表演 |  | +3 |  |
| 138 | random_weather_blessing | 好天气 |  | +3 |  |
| 139 | merchant_economic_crisis | 经济危机 | 抄底 | +3 | ✅ |
| 140 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 141 | challenge_final_boss | 魔王降临 | 直面魔王 | -22 | ✅ |
| 142 | random_street_performance | 街头表演 |  | +3 |  |
| 143 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 144 | random_minor_injury | 小伤 |  | +2 |  |
| 145 | random_street_performance | 街头表演 |  | +3 |  |
| 146 | random_minor_injury | 小伤 |  | +2 |  |
| 147 | challenge_god_trial | 神之试炼 | 接受试炼 | -17 | ✅ |
| 148 | gambling_night | 赌场之夜 | 放手一搏 | +3 |  |
| 149 | rare_gods_gift | 神之恩赐 | 接受神力 | +23 |  |
| 150 | random_street_performance | 街头表演 |  | +3 |  |
| 151 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 152 | mid_natural_disaster | 天灾 | 组织救援 | +3 |  |
| 153 | challenge_abyss | 深渊之门 | 走入深渊 | -7 | ✅ |
| 154 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 155 | random_street_performance | 街头表演 |  | +3 |  |
| 156 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | +3 |  |
| 157 | random_street_performance | 街头表演 |  | +3 |  |
| 158 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +3 |  |
| 159 | elder_dwarf_last_inspection | 最后一次巡炉 | 亲手补上最后一锤 | +3 |  |
| 160 | random_street_performance | 街头表演 |  | +3 |  |
| 161 | elder_dwarf_dragonfire_watch | 守着旧龙火的人 | 继续像祖辈那样守着 | +3 |  |
| 162 | random_street_performance | 街头表演 |  | +3 |  |
| 163 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 164 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 165 | random_weather_blessing | 好天气 |  | +3 |  |
| 166 | mid_old_enemy | 旧敌来访 | 正面迎战 | +3 | ✅ |
| 167 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -12 |  |
| 168 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +3 | ✅ |
| 169 | random_weather_blessing | 好天气 |  | +3 |  |
| 170 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 171 | dragon_sky_patrol | 龙背巡游 | 巡视边境，威慑敌人 | +3 |  |
| 172 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 173 | community_leader | 社区领袖 | 接受职位 | +3 |  |
| 174 | war_aftermath | 战后动荡 | 继续战斗 | -27 | ✅ |
| 175 | pet_companion | 捡到流浪动物 | 带回家养 | +3 |  |
| 176 | random_street_performance | 街头表演 |  | +3 |  |
| 177 | old_rival | 老对手来访 | 热情招待 | +3 |  |
| 178 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 179 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | +3 |  |
| 180 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +3 |  |
| 181 | random_street_performance | 街头表演 |  | +3 |  |
| 182 | mid_heir_training | 培养继承人 | 青出于蓝 | +3 | ✅ |
| 183 | mid_life_reflection | 人生回顾 |  | +3 |  |
| 184 | random_street_performance | 街头表演 |  | +3 |  |
| 185 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 186 | random_minor_injury | 小伤 |  | +2 |  |
| 187 | mid_found_school | 开宗立派 | 门庭若市 | +3 | ✅ |
| 188 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 189 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +3 | ✅ |
| 190 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +3 |  |
| 191 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 192 | random_training_day | 勤奋的一天 | 训练体能 | +3 |  |
| 193 | random_street_performance | 街头表演 |  | +3 |  |
| 194 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 195 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +3 |  |
| 196 | random_street_performance | 街头表演 |  | +3 |  |
| 197 | random_street_performance | 街头表演 |  | +1 |  |
| 198 | midlife_crisis | 中年危机 | 放下执念 | +5 |  |
| 199 | rare_time_loop | 时间循环 | 利用循环学习一切 | -12 |  |
| 200 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +10 |  |
| 201 | dragon_ultimate_bond | 龙之试炼 | 接受龙之试炼 | -17 | ✅ |
| 202 | mid_garden_retirement | 后院花园 | 在花园中冥想 | 0 |  |
| 203 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 204 | random_minor_injury | 小伤 |  | -2 |  |
| 205 | random_minor_injury | 小伤 |  | 0 |  |
| 206 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 207 | random_minor_injury | 小伤 |  | -2 |  |
| 208 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 209 | random_minor_injury | 小伤 |  | -2 |  |
| 210 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 211 | random_minor_injury | 小伤 |  | -1 |  |
| 212 | mid_legacy_project | 留下遗产 | 写一本书 | 0 |  |
| 213 | mid_health_scare | 健康警报 | 去找治疗师 | -2 |  |
| 214 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 215 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 216 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 217 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 218 | random_minor_injury | 小伤 |  | -1 |  |
| 219 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 220 | random_minor_injury | 小伤 |  | -2 |  |
| 221 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 222 | random_minor_injury | 小伤 |  | -2 |  |
| 223 | random_minor_injury | 小伤 |  | 0 |  |
| 224 | random_minor_injury | 小伤 |  | 0 |  |
| 225 | random_minor_injury | 小伤 |  | -1 |  |
| 226 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 227 | random_minor_injury | 小伤 |  | -1 |  |
| 228 | random_minor_injury | 小伤 |  | -1 |  |
| 229 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 230 | random_minor_injury | 小伤 |  | -2 |  |
| 231 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 232 | random_minor_injury | 小伤 |  | -1 |  |
| 233 | random_minor_injury | 小伤 |  | -1 |  |
| 234 | random_minor_injury | 小伤 |  | 0 |  |
| 235 | random_minor_injury | 小伤 |  | 0 |  |
| 236 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 237 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +12 |  |
| 238 | random_nightmare_visit | 不安的梦 |  | -8 |  |
| 239 | random_minor_injury | 小伤 |  | -2 |  |
| 240 | random_minor_injury | 小伤 |  | 0 |  |
| 241 | random_minor_injury | 小伤 |  | 0 |  |
| 242 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 243 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 244 | random_minor_injury | 小伤 |  | -1 |  |
| 245 | random_minor_injury | 小伤 |  | -1 |  |
| 246 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | +1 |  |
| 247 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 248 | random_minor_injury | 小伤 |  | -1 |  |
| 249 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 250 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 251 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 252 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 253 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 254 | random_minor_injury | 小伤 |  | -1 |  |
| 255 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 256 | random_minor_injury | 小伤 |  | -2 |  |
| 257 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 258 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 259 | random_minor_injury | 小伤 |  | -1 |  |
| 260 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 261 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 262 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 263 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 264 | mid_apprentice_success | 弟子出师 | 隆重送行 | -1 |  |
| 265 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 266 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 267 | random_minor_injury | 小伤 |  | -2 |  |
| 268 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 269 | random_minor_injury | 小伤 |  | -1 |  |
| 270 | random_minor_injury | 小伤 |  | -1 |  |
| 271 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 272 | random_minor_injury | 小伤 |  | -2 |  |
| 273 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 274 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 275 | random_minor_injury | 小伤 |  | -2 |  |
| 276 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 277 | random_nightmare_visit | 不安的梦 |  | -1 |  |
| 278 | random_minor_injury | 小伤 |  | -2 |  |
| 279 | random_minor_injury | 小伤 |  | -2 |  |
| 280 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ✅ |
| 281 | elder_legacy_gift | 传家之宝 | 传给有缘人 | -2 |  |
| 282 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -12 | ✅ |
| 283 | elder_autobiography | 自传 | 欣然同意 | -2 |  |
| 284 | elder_unexpected_visitor | 意外的来访者 |  | -2 |  |
| 285 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -2 | ✅ |
| 286 | elder_old_letters | 旧日书信 |  | -2 |  |
| 287 | elder_dream_fulfilled | 完成心愿 |  | -2 |  |
| 288 | elder_passing_wisdom | 智者之言 |  | -3 |  |
| 289 | elder_last_adventure | 不服老的冒险 | 出发！ | -38 | ❌ |
| 290 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -3 |  |
| 291 | elder_disciple_visit | 故徒来访 | 感念师恩 | +7 |  |
| 292 | retirement | 挂剑归隐 | 归隐山林 | +5 |  |
| 293 | elder_garden_peace | 花园时光 |  | -3 |  |
| 294 | elder_final_gift | 最后的礼物 |  | -4 |  |
| 295 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | -4 |  |
| 296 | elder_last_journey | 最后的旅途 | 去海边看日出 | -4 |  |
| 297 | random_nightmare_visit | 不安的梦 |  | -4 |  |
| 298 | elder_sunset_watching | 夕阳 |  | -4 |  |
| 299 | random_nightmare_visit | 不安的梦 |  | -4 |  |
| 300 | random_nightmare_visit | 不安的梦 |  | -4 |  |
| 301 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 302 | elder_miracle_recovery | 奇迹般的康复 |  | 0 |  |
| 303 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 304 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 305 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 306 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 307 | elder_frail | 风烛残年 | 安享晚年 | -21 |  |
| 308 | legend_spread | 传说的传播 | 享受名声 | -6 |  |
| 309 | elder_old_enemy | 昔日的对手 | 去见他 | -6 |  |
| 310 | random_nightmare_visit | 不安的梦 |  | -6 |  |
| 311 | random_nightmare_visit | 不安的梦 |  | -6 |  |
| 312 | random_nightmare_visit | 不安的梦 |  | -7 |  |
| 313 | random_nightmare_visit | 不安的梦 |  | +8 |  |
| 314 | random_nightmare_visit | 不安的梦 |  | -7 |  |
| 315 | random_nightmare_visit | 不安的梦 |  | +8 |  |
| 316 | random_nightmare_visit | 不安的梦 |  | -7 |  |
| 317 | random_nightmare_visit | 不安的梦 |  | -7 |  |
| 318 | random_nightmare_visit | 不安的梦 |  | +7 |  |
| 319 | random_nightmare_visit | 不安的梦 |  | -3 |  |
| 320 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | -8 |  |
| 321 | elder_final_illness | 最后的病榻 | 积极治疗 | -24 | ❌ |

### 7. 哥布林-女-A (seed=8007)

- 种族: goblin | 性别: female
- 寿命: 46/60 | 评级: B 小有成就 | 分数: 259.9
- 初始HP: 28 | 事件数: 46 | 平凡年: 0
- 成就: 8 个 [first_step, ten_lives, goblin_diplomat_ach, beauty_supreme, goblin_sage_ach, goblin_long_life, famous_author_ach, era_remembered]
- 路线: on_scholar_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_goblin_sewer | 下水道新生 |  | +2 |  |
| 2 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +2 |  |
| 3 | bullied | 被大孩子欺负 | 忍气吞声 | +2 |  |
| 4 | first_competition | 第一次比赛 | 拼尽全力 | +2 | ✅ |
| 5 | young_rival | 少年的对手 | 努力超越他 | +2 |  |
| 6 | teen_race_competition | 少年竞技会 | 参加跑步 | +2 |  |
| 7 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +2 |  |
| 8 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +2 |  |
| 9 | first_love | 初恋的味道 | 表白 | +2 | ✅ |
| 10 | goblin_pet_rat | 驯化洞鼠 |  | +2 |  |
| 11 | teen_secret_discovered | 发现秘密 | 公开揭发 | +2 |  |
| 12 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | +2 | ✅ |
| 13 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 14 | street_performer | 街头表演 | 上去表演 | +2 |  |
| 15 | goblin_human_language | 学会人类语言 |  | +2 |  |
| 16 | goblin_sewer_kingdom | 下水道王国 | 当一个好首领 | +2 |  |
| 17 | goblin_clockwork_toy | 发条玩具 |  | +2 |  |
| 18 | goblin_mine_discovery | 矿脉发现 |  | +2 |  |
| 19 | goblin_black_market | 黑市交易 | 接下生意 | +2 |  |
| 20 | goblin_alliance | 异族联盟 | 建立友谊 | +2 |  |
| 21 | mid_gambling | 地下赌场 | 梭哈！ | +2 | ❌ |
| 22 | random_minor_injury | 小伤 |  | +1 |  |
| 23 | goblin_peace_treaty | 和平条约 | 以诚意打动对方 | +2 |  |
| 24 | goblin_warchief_duel | 首领争夺战 | 发起挑战 | +2 |  |
| 25 | goblin_rebellion | 反抗压迫 | 组织地下反抗 | +2 |  |
| 26 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | +2 | ✅ |
| 27 | goblin_poison_master | 毒药大师 |  | +2 |  |
| 28 | midlife_crisis | 中年危机 | 放下执念 | +6 |  |
| 29 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | -12 |  |
| 30 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | -1 |  |
| 31 | goblin_elder_wisdom | 老哥布林的智慧 |  | -1 |  |
| 32 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | -1 |  |
| 33 | adult_teaching_offer | 教学邀请 | 欣然接受 | 0 |  |
| 34 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | -1 |  |
| 35 | goblin_longest_living | 最长寿的哥布林 | 大方分享养生之道 | -1 |  |
| 36 | goblin_last_invention | 最后的发明 |  | -1 |  |
| 37 | goblin_elder_legend | 传说中的老哥布林 | 传授你的生存智慧 | 0 |  |
| 38 | elder_old_letters | 旧日书信 |  | -1 |  |
| 39 | elder_unexpected_visitor | 意外的来访者 |  | -2 |  |
| 40 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ✅ |
| 41 | mid_life_reflection | 人生回顾 |  | -4 |  |
| 42 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +6 |  |
| 43 | elder_legacy_gift | 传家之宝 | 传给有缘人 | -7 |  |
| 44 | elder_garden_peace | 花园时光 |  | -6 |  |
| 45 | elder_frail | 风烛残年 | 安享晚年 | -23 |  |
| 46 | elder_final_illness | 最后的病榻 | 积极治疗 | -30 | ❌ |

### 8. 哥布林-男-B (seed=8008)

- 种族: goblin | 性别: male
- 寿命: 41/60 | 评级: B 小有成就 | 分数: 243.1
- 初始HP: 37 | 事件数: 41 | 平凡年: 0
- 成就: 8 个 [first_step, ten_lives, goblin_pioneer_ach, goblin_sage_ach, famous_author_ach, goblin_long_life, era_remembered, fortune_smile_final]
- 路线: 无
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_dragon_blood_omen | 龙血征兆 |  | +3 |  |
| 2 | goblin_human_toy | 人类的玩具 |  | +3 |  |
| 3 | goblin_first_heist | 第一次偷东西 | 快速偷到跑回来 | +3 |  |
| 4 | random_good_meal | 丰盛的一餐 |  | +3 |  |
| 5 | river_discovery | 河底发光 | 潜下去捡 | +3 | ✅ |
| 6 | goblin_insect_feast | 虫虫大餐 |  | -5 |  |
| 7 | catch_thief | 抓小偷 | 追上去 | +3 |  |
| 8 | goblin_shiny_collection | 闪亮收藏 |  | +3 |  |
| 9 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +3 |  |
| 10 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 11 | pet_companion | 捡到流浪动物 | 带回家养 | 0 |  |
| 12 | youth_bandit_ambush | 路遇山贼 | 战斗！ | 0 | ✅ |
| 13 | youth_caravan_guard | 商队护卫 | 报名参加 | +3 |  |
| 14 | goblin_clockwork_toy | 发条玩具 |  | +3 |  |
| 15 | goblin_scrap_invention | 废品发明 |  | +3 |  |
| 16 | random_stargazing | 观星 |  | +3 |  |
| 17 | goblin_arena_underdog | 竞技场的黑马 | 用速度和灵活取胜 | +1 | ✅ |
| 18 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +3 |  |
| 19 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 20 | goblin_herb_dealer | 草药商人 |  | +1 |  |
| 21 | student_successor | 收徒传艺 | 严格教导 | 0 |  |
| 22 | goblin_black_market_stall | 黑市摊位 |  | 0 |  |
| 23 | goblin_passing_the_torch | 传承手艺 |  | -1 |  |
| 24 | luk_lottery | 王国彩票 | 中大奖了！ | -1 | ✅ |
| 25 | goblin_treasure_map | 藏宝图 |  | -1 |  |
| 26 | goblin_legacy_hoard | 传家宝库 | 设置机关保护 | 0 |  |
| 27 | mid_found_school | 开宗立派 | 门庭若市 | -1 | ✅ |
| 28 | goblin_tunnel_architect | 地道建筑师 |  | -1 |  |
| 29 | goblin_underground_empire | 地下帝国梦 | 开始挖掘 | +1 |  |
| 30 | gambling_night | 赌场之夜 | 放手一搏 | 0 |  |
| 31 | community_leader | 社区领袖 | 接受职位 | -1 |  |
| 32 | harvest_festival | 丰收祭典 | 参加各项比赛 | -1 |  |
| 33 | goblin_wise_counsel | 调解纠纷 | 公正裁决 | -2 |  |
| 34 | goblin_sage | 哥布林贤者 |  | -3 |  |
| 35 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -4 | ✅ |
| 36 | mid_body_decline | 岁月的痕迹 | 接受现实 | -15 |  |
| 37 | elder_memoir | 撰写回忆录 | 传世之作 | -7 | ✅ |
| 38 | elder_last_journey | 最后的旅途 | 去海边看日出 | -8 |  |
| 39 | mid_garden_retirement | 后院花园 | 在花园中冥想 | -9 |  |
| 40 | elder_old_letters | 旧日书信 |  | -10 |  |
| 41 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | -13 |  |

### 9. 兽人-男-A (seed=8009)

- 种族: beastfolk | 性别: male
- 寿命: 55/60 | 评级: A 声名远扬 | 分数: 303
- 初始HP: 52 | 事件数: 55 | 平凡年: 0
- 成就: 13 个 [first_step, ten_lives, cheated_death_ach, soul_pure, slum_survivor, beauty_supreme, male_beauty, peaceful_ending, longevity, eternal_peace, fairy_companion, era_remembered, legendary_epilogue]
- 路线: on_scholar_path, on_merchant_path, on_mage_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_slums | 贫民窟的黎明 |  | +4 |  |
| 2 | child_dream_flying | 会飞的梦 |  | +4 |  |
| 3 | part_time_work | 打零工 | 去码头扛货 | +3 |  |
| 4 | elder_last_journey | 最后的旅途 | 去海边看日出 | +4 |  |
| 5 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +3 |  |
| 6 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | 0 |  |
| 7 | mid_legacy_project | 留下遗产 | 写一本书 | +4 |  |
| 8 | steal_sweets | 偷吃糖果 | 老实道歉 | +4 |  |
| 9 | random_street_performance | 街头表演 |  | +2 |  |
| 10 | child_first_fight | 第一次打架 | 挥拳反击 | 0 |  |
| 11 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | +4 |  |
| 12 | hunting_trip | 狩猎之旅 | 追踪大型猎物 | -3 |  |
| 13 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | +4 |  |
| 14 | childhood_chase | 抓蜻蜓 | 抓到了一只 | +4 |  |
| 15 | grandma_recipes | 奶奶的秘方 | 认真学习 | +1 |  |
| 16 | random_helping_stranger | 帮助陌生人 |  | -7 |  |
| 17 | random_found_coin | 捡到硬币 |  | 0 |  |
| 18 | child_night_sky | 仰望星空 |  | 0 |  |
| 19 | youth_short_term_job | 临时差事 | 老老实实做完 | 0 |  |
| 20 | elder_final_gift | 最后的礼物 |  | 0 |  |
| 21 | mid_natural_disaster | 天灾 | 组织救援 | 0 |  |
| 22 | spr_near_death | 濒死体验 | 挣扎求生 | -15 |  |
| 23 | elder_garden_peace | 花园时光 |  | +4 |  |
| 24 | elder_sunset_watching | 夕阳 |  | +4 |  |
| 25 | elder_dream_fulfilled | 完成心愿 |  | +4 |  |
| 26 | elder_old_letters | 旧日书信 |  | +4 |  |
| 27 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +4 |  |
| 28 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | 0 | ✅ |
| 29 | elder_passing_wisdom | 智者之言 |  | +4 |  |
| 30 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 31 | elder_illness | 疾病缠身 | 积极治疗 | -28 | ❌ |
| 32 | elder_kingdom_crisis | 王国危机 | 帮助撤离 | -17 |  |
| 33 | elder_world_peace | 和平降临 | 退休享受 | +3 |  |
| 34 | village_festival | 村里祭典 | 大吃特吃 | +3 |  |
| 35 | first_snow | 初雪 | 堆雪人 | +2 |  |
| 36 | mid_body_decline | 岁月的痕迹 | 接受现实 | -8 |  |
| 37 | elder_frail | 风烛残年 | 安享晚年 | -13 |  |
| 38 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +1 |  |
| 39 | elder_disciple_visit | 故徒来访 | 感念师恩 | +10 |  |
| 40 | merchant_guidance | 商人学徒招募 | 拜师学商 | 0 |  |
| 41 | elder_unexpected_visitor | 意外的来访者 |  | -1 |  |
| 42 | apprentice_contest | 弟子比武大会 | 指导自己的弟子参赛 | -2 |  |
| 43 | elder_last_adventure | 不服老的冒险 | 当向导 | -3 |  |
| 44 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | -4 |  |
| 45 | retirement | 挂剑归隐 | 归隐山林 | +3 |  |
| 46 | merchant_career | 商路崛起 | 扩张商路 | -7 | ❌ |
| 47 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -10 | ✅ |
| 48 | river_discovery | 河底发光 | 潜下去捡 | -10 | ❌ |
| 49 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | 0 |  |
| 50 | magic_academy_letter | 魔法学院来信 | 入学就读 | 0 |  |
| 51 | fairy_encounter | 林中的精灵 | 和精灵说话 | 0 |  |
| 52 | mid_health_scare | 健康警报 | 去找治疗师 | -2 |  |
| 53 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | 0 |  |
| 54 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | 0 |  |
| 55 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -9 | ✅ |

### 10. 兽人-女-B (seed=8010)

- 种族: beastfolk | 性别: female
- 寿命: 38/60 | 评级: B 小有成就 | 分数: 252.5
- 初始HP: 58 | 事件数: 38 | 平凡年: 0
- 成就: 6 个 [first_step, ten_lives, mage_path, famous_author_ach, soul_pure, era_remembered]
- 路线: on_mage_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_slums | 贫民窟的黎明 |  | +5 |  |
| 2 | magic_academy_letter | 魔法学院来信 | 入学就读 | +4 |  |
| 3 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | 0 |  |
| 4 | first_snow | 初雪 | 堆雪人 | 0 |  |
| 5 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | 0 |  |
| 6 | magic_theory_class | 魔法理论课 | 认真听课 | 0 |  |
| 7 | traveling_sage | 云游学者 | 跟随学者学习 | 0 |  |
| 8 | elder_illness | 疾病缠身 | 积极治疗 | -20 | ❌ |
| 9 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +5 |  |
| 10 | youth_caravan_guard | 商队护卫 | 报名参加 | +1 |  |
| 11 | love_at_first_sight | 一见钟情 | 上前搭讪 | +5 | ❌ |
| 12 | magic_graduate | 魔法学院毕业 | 继续深造研究 | +2 |  |
| 13 | youth_short_term_job | 临时差事 | 老老实实做完 | 0 |  |
| 14 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | 0 |  |
| 15 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 16 | mid_existential_crisis | 深夜的独白 | 找到新目标 | +3 | ✅ |
| 17 | elder_disciple_visit | 故徒来访 | 感念师恩 | +10 |  |
| 18 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -30 | ❌ |
| 19 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -5 | ✅ |
| 20 | magic_burst_baby | 婴儿的魔力暴走 | 大哭 | +5 |  |
| 21 | childhood_play | 村口的泥巴大战 | 当孩子王 | +5 |  |
| 22 | steal_sweets | 偷吃糖果 | 老实道歉 | +5 |  |
| 23 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +4 |  |
| 24 | elder_garden_peace | 花园时光 |  | +4 |  |
| 25 | elder_autobiography | 自传 | 欣然同意 | +1 |  |
| 26 | elder_unexpected_visitor | 意外的来访者 |  | -1 |  |
| 27 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 28 | grandma_recipes | 奶奶的秘方 | 认真学习 | -4 |  |
| 29 | elder_world_peace | 和平降临 | 退休享受 | -6 |  |
| 30 | river_discovery | 河底发光 | 潜下去捡 | -11 | ❌ |
| 31 | elder_old_letters | 旧日书信 |  | 0 |  |
| 32 | war_breaks_out | 战争爆发 | 后方支援 | +7 |  |
| 33 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | -2 |  |
| 34 | challenge_final_boss | 魔王降临 | 辅助 | -3 |  |
| 35 | mid_garden_retirement | 后院花园 | 在花园中冥想 | +4 |  |
| 36 | mid_health_scare | 健康警报 | 去找治疗师 | -7 |  |
| 37 | elder_frail | 风烛残年 | 安享晚年 | -13 |  |
| 38 | elder_natural_death | 安详的离去 |  | -16 |  |

### 11. 海精灵-女-A (seed=8011)

- 种族: seaelf | 性别: female
- 寿命: 21/60 | 评级: B 小有成就 | 分数: 212
- 初始HP: 28 | 事件数: 21 | 平凡年: 0
- 成就: 3 个 [first_step, ten_lives, speedrun]
- 路线: 无
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_wilderness | 荒野出生 | 萨满世家 | +1 |  |
| 2 | mid_existential_crisis | 深夜的独白 | 找到新目标 | +1 | ❌ |
| 3 | retirement | 挂剑归隐 | 归隐山林 | +9 |  |
| 4 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | -12 |  |
| 5 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 6 | river_discovery | 河底发光 | 潜下去捡 | 0 | ✅ |
| 7 | gambling_night | 赌场之夜 | 放手一搏 | 0 |  |
| 8 | first_love | 初恋的味道 | 表白 | 0 | ✅ |
| 9 | wander_market | 逛集市 | 买了一本旧书 | 0 |  |
| 10 | elder_sunset_watching | 夕阳 |  | 0 |  |
| 11 | elder_unexpected_visitor | 意外的来访者 |  | 0 |  |
| 12 | elder_last_feast | 最后的盛宴 | 发表感言 | 0 |  |
| 13 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | 0 |  |
| 14 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 15 | part_time_work | 打零工 | 去码头扛货 | 0 |  |
| 16 | child_stray_animal | 收养流浪动物 | 带回家照顾 | 0 |  |
| 17 | elder_disciple_visit | 故徒来访 | 感念师恩 | +10 |  |
| 18 | random_street_performance | 街头表演 |  | -10 |  |
| 19 | elder_old_letters | 旧日书信 |  | 0 |  |
| 20 | grandma_recipes | 奶奶的秘方 | 认真学习 | 0 |  |
| 21 | elder_illness | 疾病缠身 | 积极治疗 | -27 | ❌ |

### 12. 海精灵-男-B (seed=8012)

- 种族: seaelf | 性别: male
- 寿命: 19/60 | 评级: B 小有成就 | 分数: 238.3
- 初始HP: 28 | 事件数: 19 | 平凡年: 0
- 成就: 4 个 [first_step, ten_lives, speedrun, era_remembered]
- 路线: 无
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_sharp_eyes | 目光过人的婴孩 |  | +2 |  |
| 2 | elder_reunion | 故人重逢 | 热泪盈眶 | +2 |  |
| 3 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +2 |  |
| 4 | elder_frail | 风烛残年 | 安享晚年 | -13 |  |
| 5 | village_feud | 村长之争 | 帮弱者说话 | +2 |  |
| 6 | child_stray_animal | 收养流浪动物 | 带回家照顾 | +2 |  |
| 7 | gambling_night | 赌场之夜 | 放手一搏 | +2 |  |
| 8 | random_training_day | 勤奋的一天 | 训练体能 | +2 |  |
| 9 | rainy_day_adventure | 雨日冒险 | 钻进去看看 | -6 | ❌ |
| 10 | youth_first_love | 怦然心动 | 鼓起勇气搭话 | +2 |  |
| 11 | star_gazing | 观星 | 冥想 | +2 |  |
| 12 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 13 | retirement | 挂剑归隐 | 归隐山林 | +10 |  |
| 14 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | -2 |  |
| 15 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 16 | child_first_fight | 第一次打架 | 挥拳反击 | 0 |  |
| 17 | elder_illness | 疾病缠身 | 积极治疗 | -23 | ✅ |
| 18 | elder_final_gift | 最后的礼物 |  | +2 |  |
| 19 | elder_natural_death | 安详的离去 |  | -16 |  |

### 13. 半龙人-男-A (seed=8013)

- 种族: halfdragon | 性别: male
- 寿命: 55/60 | 评级: B 小有成就 | 分数: 244.1
- 初始HP: 46 | 事件数: 55 | 平凡年: 0
- 成就: 13 个 [first_step, ten_lives, famous_author_ach, peaceful_ending, dragon_knight, beauty_supreme, male_beauty, longevity, war_hero_ach, eternal_peace, legacy_of_students, era_remembered, miracle_afterglow]
- 路线: on_mage_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_ashen_hut | 灰烬小屋 |  | +4 |  |
| 2 | mid_existential_crisis | 深夜的独白 | 找到新目标 | +4 | ❌ |
| 3 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +4 |  |
| 4 | village_feud | 村长之争 | 帮弱者说话 | +4 |  |
| 5 | elder_sunset_watching | 夕阳 |  | +1 |  |
| 6 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | 0 |  |
| 7 | first_love | 初恋的味道 | 表白 | 0 | ❌ |
| 8 | elder_illness | 疾病缠身 | 积极治疗 | -20 | ❌ |
| 9 | wander_market | 逛集市 | 买了一本旧书 | +4 |  |
| 10 | chr_public_speech | 广场演说 | 慷慨陈词 | +3 | ✅ |
| 11 | retirement | 挂剑归隐 | 归隐山林 | +8 |  |
| 12 | pet_companion | 捡到流浪动物 | 带回家养 | -12 |  |
| 13 | youth_crisis_crossroad | 命运的十字路口 | 踏上冒险旅途 | -6 |  |
| 14 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +1 | ❌ |
| 15 | childhood_chase | 抓蜻蜓 | 抓到了一只 | +4 |  |
| 16 | elder_frail | 风烛残年 | 安享晚年 | -16 |  |
| 17 | magic_academy_letter | 魔法学院来信 | 入学就读 | +4 |  |
| 18 | mid_body_decline | 岁月的痕迹 | 接受现实 | -6 |  |
| 19 | elder_garden_peace | 花园时光 |  | +4 |  |
| 20 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +4 |  |
| 21 | random_nightmare_visit | 不安的梦 |  | -5 |  |
| 22 | elder_last_journey | 最后的旅途 | 去海边看日出 | 0 |  |
| 23 | teen_race_competition | 少年竞技会 | 参加跑步 | 0 |  |
| 24 | bullied | 被大孩子欺负 | 忍气吞声 | +4 |  |
| 25 | harvest_festival | 丰收祭典 | 参加各项比赛 | +2 |  |
| 26 | traveling_sage | 云游学者 | 跟随学者学习 | +4 |  |
| 27 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +1 |  |
| 28 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | 0 |  |
| 29 | elder_passing_wisdom | 智者之言 |  | 0 |  |
| 30 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -21 | ❌ |
| 31 | part_time_work | 打零工 | 去码头扛货 | +4 |  |
| 32 | magic_burst_baby | 婴儿的魔力暴走 | 大哭 | +4 |  |
| 33 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +4 |  |
| 34 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +14 |  |
| 35 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ✅ |
| 36 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | -6 |  |
| 37 | elder_disciple_visit | 故徒来访 | 感念师恩 | +12 |  |
| 38 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | -10 |  |
| 39 | bullied_repeat | 他们又来了 | 继续忍耐 | -1 |  |
| 40 | elder_autobiography | 自传 | 欣然同意 | 0 |  |
| 41 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | -1 |  |
| 42 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | 0 |  |
| 43 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | 0 |  |
| 44 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -6 |  |
| 45 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +1 |  |
| 46 | elder_reunion | 故人重逢 | 热泪盈眶 | +1 |  |
| 47 | mid_legacy_review | 回首半生 | 无怨无悔 | 0 |  |
| 48 | elder_kingdom_crisis | 王国危机 | 担任军师 | -1 |  |
| 49 | adult_teaching_offer | 教学邀请 | 欣然接受 | -1 |  |
| 50 | teen_secret_discovered | 发现秘密 | 公开揭发 | -2 |  |
| 51 | child_dream_flying | 会飞的梦 |  | -4 |  |
| 52 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | -9 | ❌ |
| 53 | stand_up_moment | 不再忍耐 | 正面反击 | -6 | ✅ |
| 54 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +13 |  |
| 55 | elder_final_illness | 最后的病榻 | 积极治疗 | -24 | ❌ |

### 14. 半龙人-女-B (seed=8014)

- 种族: halfdragon | 性别: female
- 寿命: 49/60 | 评级: B 小有成就 | 分数: 264.8
- 初始HP: 52 | 事件数: 49 | 平凡年: 0
- 成就: 12 个 [first_step, ten_lives, legacy_master, starry_lifetime, soul_pure, famous_author_ach, beauty_supreme, war_hero_ach, slum_survivor, longevity, memories_in_hands, era_remembered]
- 路线: on_scholar_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_slums | 贫民窟的黎明 |  | +4 |  |
| 2 | childhood_play | 村口的泥巴大战 | 当孩子王 | +4 |  |
| 3 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +3 |  |
| 4 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 5 | elder_last_journey | 最后的旅途 | 去海边看日出 | 0 |  |
| 6 | child_first_fight | 第一次打架 | 挥拳反击 | 0 |  |
| 7 | elder_world_peace | 和平降临 | 退休享受 | +4 |  |
| 8 | elder_sunset_watching | 夕阳 |  | +3 |  |
| 9 | random_weather_blessing | 好天气 |  | 0 |  |
| 10 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | 0 |  |
| 11 | youth_caravan_guard | 商队护卫 | 报名参加 | 0 |  |
| 12 | youth_short_term_job | 临时差事 | 老老实实做完 | +4 |  |
| 13 | elder_last_adventure | 不服老的冒险 | 当向导 | +3 |  |
| 14 | river_discovery | 河底发光 | 潜下去捡 | -7 | ✅ |
| 15 | first_snow | 初雪 | 堆雪人 | -7 |  |
| 16 | elder_frail | 风烛残年 | 安享晚年 | -15 |  |
| 17 | elder_technique_pass | 绝学传承 | 全力编写 | +4 |  |
| 18 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +4 |  |
| 19 | childhood_chase | 抓蜻蜓 | 抓到了一只 | +4 |  |
| 20 | child_night_sky | 仰望星空 |  | 0 |  |
| 21 | child_river_adventure | 河边探险 | 探索瀑布后面的洞穴 | 0 |  |
| 22 | grandma_recipes | 奶奶的秘方 | 认真学习 | +4 |  |
| 23 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | -5 |  |
| 24 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 25 | elder_star_gazing_final | 最后的星空 | 内心平静 | +3 |  |
| 26 | teen_first_adventure | 人生第一次冒险 | 去探索据说闹鬼的废墟 | -1 |  |
| 27 | elder_old_letters | 旧日书信 |  | +4 |  |
| 28 | first_competition | 第一次比赛 | 拼尽全力 | +4 | ✅ |
| 29 | mid_legacy_review | 回首半生 | 无怨无悔 | +4 |  |
| 30 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +4 |  |
| 31 | challenge_final_boss | 魔王降临 | 直面魔王 | -21 | ❌ |
| 32 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +3 |  |
| 33 | child_stray_animal | 收养流浪动物 | 带回家照顾 | +3 |  |
| 34 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +3 |  |
| 35 | elder_autobiography | 自传 | 欣然同意 | +2 |  |
| 36 | teen_nightmare | 反复出现的噩梦 | 在梦中回应那个声音 | +2 |  |
| 37 | elder_old_enemy | 昔日的对手 | 去见他 | +1 |  |
| 38 | elder_memoir | 撰写回忆录 | 传世之作 | +1 | ✅ |
| 39 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | -4 |  |
| 40 | tree_climbing | 爬树冒险 | 爬到最高处 | -1 | ✅ |
| 41 | elder_kingdom_crisis | 王国危机 | 担任军师 | -2 |  |
| 42 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | -3 |  |
| 43 | legend_spread | 传说的传播 | 享受名声 | -4 |  |
| 44 | divine_vision | 神谕 | 遵循神谕行事 | -5 |  |
| 45 | steal_sweets | 偷吃糖果 | 老实道歉 | -6 |  |
| 46 | elder_illness | 疾病缠身 | 积极治疗 | -33 | ✅ |
| 47 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | -1 |  |
| 48 | bullied | 被大孩子欺负 | 忍气吞声 | -2 |  |
| 49 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | -10 |  |
