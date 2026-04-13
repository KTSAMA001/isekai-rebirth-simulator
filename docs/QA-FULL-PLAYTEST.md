# 🔎 QA 全面游玩测试报告

**测试日期**: 2026-04-12 11:36:17
**测试方法**: Galgame 流程 (startYear / resolveBranch)，自动选第一个分支
**测试范围**: 7种族 × 2局 = 14局（含 3个 playable=false 种族）
**总事件数**: 1003

## 1. 种族全流程模拟（14局）

| # | 配置 | 种子 | 寿命 | MaxAge | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 平凡年 | 最大降幅 | 最大增幅 |
|---|------|------|------|--------|--------|--------|------|------|--------|--------|----------|----------|
| 1 | 人类-男-A | 8001 | 86 | 86 | 61 | 0 | SS 不朽传说 | 646.3 | 86 | 0 | 18 | 16 |
| 2 | 人类-女-B | 8002 | 67 | 89 | 46 | 0 | SS 不朽传说 | 490 | 67 | 0 | 20 | 9 |
| 3 | 精灵-女-A | 8003 | 169 | 380 | 49 | 0 | SS 不朽传说 | 946.7 | 169 | 0 | 39 | 19 |
| 4 | 精灵-男-B | 8004 | 49 | 401 | 31 | 0 | S 传奇人生 | 388.2 | 49 | 0 | 19 | 2 |
| 5 | 矮人-男-A | 8005 | 149 | 163 | 61 | 0 | SS 不朽传说 | 886 | 149 | 0 | 28 | 11 |
| 6 | 矮人-女-B | 8006 | 171 | 176 | 61 | 0 | SS 不朽传说 | 999.7 | 167 | 4 | 35 | 21 |
| 7 | 哥布林-女-A | 8007 | 29 | 35 | 46 | 0 | S 传奇人生 | 282 | 29 | 0 | 16 | 7 |
| 8 | 哥布林-男-B | 8008 | 26 | 35 | 31 | 0 | A 声名远扬 | 216.6 | 26 | 0 | 11 | 5 |
| 9 | 兽人-男-A | 8009 | 51 | 62 | 61 | 0 | SS 不朽传说 | 401.5 | 51 | 0 | 29 | 12 |
| 10 | 兽人-女-B | 8010 | 58 | 62 | 64 | 0 | SS 不朽传说 | 453.3 | 58 | 0 | 30 | 10 |
| 11 | 海精灵-女-A | 8011 | 79 | 450 | 31 | 0 | SS 不朽传说 | 489.8 | 78 | 1 | 14 | 1 |
| 12 | 海精灵-男-B | 8012 | 323 | 462 | 37 | 0 | SS 不朽传说 | 1262.5 | 201 | 122 | 32 | 22 |
| 13 | 半龙人-男-A | 8013 | 193 | 233 | 58 | 0 | SS 不朽传说 | 970.7 | 172 | 21 | 36 | 24 |
| 14 | 半龙人-女-B | 8014 | 229 | 224 | 58 | 0 | SS 不朽传说 | 1077.9 | 173 | 56 | 44 | 21 |

### 1.1 种族详细分析

#### 🧑 人类 (human)

- **寿命范围**: 80-90 | 实测平均: 77
- **平均事件数**: 77 | 平均分数: 568
- **可玩性**: ✅ 可选
  - 人类-男-A: 触发 86 个唯一事件, 29 个成就
  - 人类-女-B: 触发 67 个唯一事件, 21 个成就

#### 🧝 精灵 (elf)

- **寿命范围**: 380-420 | 实测平均: 109
- **平均事件数**: 109 | 平均分数: 667
- **可玩性**: ✅ 可选
  - 精灵-女-A: 寿命比 0.44 ⚠️ 偏早死
  - 精灵-男-B: 寿命比 0.12 ⚠️ 偏早死
  - 精灵-女-A: 触发 169 个唯一事件, 47 个成就
  - 精灵-男-B: 触发 49 个唯一事件, 20 个成就

#### ⛏️ 矮人 (dwarf)

- **寿命范围**: 160-180 | 实测平均: 160
- **平均事件数**: 158 | 平均分数: 943
- **可玩性**: ✅ 可选
  - 矮人-男-A: 触发 149 个唯一事件, 42 个成就
  - 矮人-女-B: 触发 167 个唯一事件, 51 个成就

#### 👺 哥布林 (goblin)

- **寿命范围**: 30-36 | 实测平均: 28
- **平均事件数**: 28 | 平均分数: 249
- **可玩性**: ✅ 可选
  - 哥布林-女-A: 实际寿命 29 ✅ 合理
  - 哥布林-男-B: 实际寿命 26 ✅ 合理
  - 哥布林-女-A: 触发 29 个唯一事件, 9 个成就
  - 哥布林-男-B: 触发 26 个唯一事件, 10 个成就

#### 🐺 兽人 (beastfolk)

- **寿命范围**: 60-68 | 实测平均: 55
- **平均事件数**: 55 | 平均分数: 427
- **可玩性**: ❌ 不可选 (playable=false)
  - 兽人-男-A: 触发 51 个唯一事件, 16 个成就
  - 兽人-女-B: 触发 58 个唯一事件, 14 个成就

#### 🧜 海精灵 (seaelf)

- **寿命范围**: 450-490 | 实测平均: 201
- **平均事件数**: 140 | 平均分数: 876
- **可玩性**: ❌ 不可选 (playable=false)
  - 海精灵-女-A: 寿命比 0.18 ⚠️ 偏早死
  - 海精灵-男-B: 寿命比 0.70 ⚠️ 偏早死
  - 海精灵-女-A: 触发 78 个唯一事件, 21 个成就
  - 海精灵-男-B: 触发 201 个唯一事件, 50 个成就

#### 🐉 半龙人 (halfdragon)

- **寿命范围**: 220-250 | 实测平均: 211
- **平均事件数**: 173 | 平均分数: 1024
- **可玩性**: ❌ 不可选 (playable=false)
  - 半龙人-男-A: 触发 172 个唯一事件, 47 个成就
  - 半龙人-女-B: 触发 173 个唯一事件, 45 个成就

## 2. 路线系统验证

### 2.1 路线入口 Flag 触发

| 种族 | 冒险者 | 骑士 | 魔法师 | 商人 | 学者 |
|------|---|---|---|---|---|
| 人类-男-A | ✅ | — | — | — | ✅ |
| 人类-女-B | — | — | — | — | ✅ |
| 精灵-女-A | — | — | ✅ | — | — |
| 精灵-男-B | — | — | ✅ | — | ✅ |
| 矮人-男-A | — | — | — | ✅ | — |
| 矮人-女-B | — | — | — | ✅ | — |
| 哥布林-女-A | — | — | — | ✅ | — |
| 哥布林-男-B | — | — | — | — | — |
| 兽人-男-A | — | — | — | ✅ | — |
| 兽人-女-B | ✅ | — | — | — | ✅ |
| 海精灵-女-A | — | — | ✅ | — | — |
| 海精灵-男-B | — | — | ✅ | — | — |
| 半龙人-男-A | — | — | ✅ | — | — |
| 半龙人-女-B | ✅ | — | — | — | ✅ |

### 2.2 路线触发统计

| 路线 | 入口条件 | 触发次数/总 | 触发率 |
|------|---------|-----------|--------|
| 冒险者 | `has.flag.guild_member` | 3/14 | 21% |
| 骑士 | `has.flag.knight` | 0/14 | 0% |
| 魔法师 | `has.flag.magic_student` | 5/14 | 36% |
| 商人 | `has.flag.merchant_apprentice` | 4/14 | 29% |
| 学者 | `has.flag.has_student | has.flag.famous_inventor` | 5/14 | 36% |

### 2.3 锚点事件触发

- **检查锚点**: 13
- **已触发**: 7
- **未触发**: 6

未触发锚点:
  - adventurer:dungeon_explore_1 (13-15)
  - adventurer:advanced_dungeon (18-25)
  - knight:knight_tournament (16-25)
  - knight:knight_glory (18-25)
  - merchant:investment_opportunity (25-40)
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
| human | 54 | 20 | 16 | 28 |
| elf | 40 | 39 | 19 | 71 |
| dwarf | 61 | 35 | 21 | 13 |
| goblin | 39 | 16 | 7 | 21 |
| beastfolk | 63 | 30 | 12 | 21 |
| seaelf | 34 | 32 | 22 | 137 |
| halfdragon | 58 | 44 | 24 | 60 |

### 3.4 sigmoid 衰老模型

- 人类-男-A: 11 次大幅下降 (age≥62)
- 人类-女-B: 1 次大幅下降 (age≥62)
- 矮人-男-A: 2 次大幅下降 (age≥125)
- 矮人-女-B: 4 次大幅下降 (age≥125)
- 哥布林-女-A: 5 次大幅下降 (age≥25)
- 哥布林-男-B: 1 次大幅下降 (age≥25)
- 兽人-男-A: 2 次大幅下降 (age≥47)
- 兽人-女-B: 7 次大幅下降 (age≥47)
- 半龙人-男-A: 2 次大幅下降 (age≥175)

## 4. 事件覆盖度分析

- **总事件数**: 1003
- **unique 事件**: 999 (一生一次，14局中每局最多触发一次)
- **非 unique 事件**: 4
- **14局中至少触发过一次**: 499/1003 (49.8%)
- **非 unique 从未触发**: 1/4

### 4.1 从未触发的非 unique 事件

- `birth_noble_estate` (minAge=1, maxAge=1, races=[human,elf], routes=[*], weight=6)

### 4.2 按 tag 的事件触发分布

| Tag | 总触发次数 |
|-----|----------|
| life | 459 |
| social | 302 |
| magic | 144 |
| love | 91 |
| epic | 58 |
| combat | 42 |
| adventure | 39 |
| childhood | 30 |
| romance | 28 |
| knowledge, life | 21 |
| luck | 20 |
| exploration | 20 |
| merchant | 17 |
| disaster | 16 |
| legendary | 16 |
| spirit, ending | 13 |
| knowledge, magic, mystery | 12 |
| knowledge, magic | 11 |
| dark | 11 |
| magic, ending | 10 |
| accident | 9 |
| spirit, awakening | 7 |
| investment | 7 |
| magic, awakening | 6 |
| career | 6 |
| spirit, shaman | 5 |
| spirit, sight | 5 |
| magic, finale | 5 |
| life, knowledge | 5 |
| gamble | 5 |
| knowledge, mystery, danger | 4 |
| knowledge, mystery | 4 |
| knowledge, magic, danger, mystery | 4 |
| spirit, crossroad | 4 |
| spirit, finale | 4 |
| magic, academy, crossroad | 3 |
| knowledge, adventure, mystery | 3 |
| noble | 3 |
| spirit, dream, prophet | 3 |
| magic, omen | 3 |
| spirit, revelation | 3 |
| magic, milestone | 2 |
| knowledge, adventure | 2 |
| spirit, cost | 2 |
| knowledge, life, danger | 2 |
| spirit, legacy | 1 |
| destiny | 1 |
| knowledge, danger, mystery | 1 |
| magic, story | 1 |
| magic, cost | 1 |
| knowledge, magic, life | 1 |
| magic, conflict | 1 |
| knowledge, danger, life | 1 |
| spirit | 1 |

## 5. 成就系统验证

- **总成就数**: 160
- **14局中解锁过的**: 77
- **平均每局解锁**: 30.1
- **最多单局**: 51
- **最少单局**: 9

### 5.1 高频解锁成就

| 成就 | 解锁次数 | 成就定义 |
|------|---------|---------|
| 踏入异世界 | 14/14 | 完成第一局游戏 |
| 轮回十世 | 14/14 | 完成10局游戏 |
| 万人迷 | 14/14 | 魅力峰值达到25 |
| 博学多识 | 14/14 | 智力峰值达到25 |
| 时代留名 | 13/14 | 结算得分达到220以上 |
| 传奇谢幕 | 13/14 | 结算得分达到280以上 |
| 纯净灵魂 | 12/14 | 灵魂峰值达到40 |
| 绝世容颜 | 12/14 | 魅力峰值达到40 |
| 不可抗拒 | 12/14 | 魅力峰值达到50 |
| 全知者 | 12/14 | 智慧峰值达到40 |
| 不朽谢幕 | 12/14 | 结算得分达到380以上 |
| 富足人生 | 9/14 | 家境峰值达到20 |
| 魔导精通 | 9/14 | 魔力峰值达到25 |
| 全知全能 | 9/14 | 智力峰值达到50 |
| 魔力共鸣 | 9/14 | 魔力峰值达到40 |
| 扭曲现实者 | 9/14 | 魔力峰值达到50 |
| 魔潮未尽 | 9/14 | 结算时智慧和魔力都达到25以上 |
| 钢筋铁骨 | 7/14 | 体质峰值达到25 |
| 传奇人生 | 7/14 | 所有属性峰值均达到15 |
| 桃李满天下 | 7/14 | 收徒传艺并倾囊相授 |

## 6. 数据一致性检查

### 1. Flag 一致性

- **总 Flag**: 813 set, 295 used
- **设置但从未检查**: 538
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
  - `chr_born_favored`
  - `chr_born_suspect`
  - `chr_social_manipulator`
  - `chr_genuine_charm`
  - `chr_spoiled`
  - ... and 523 more
- **检查但从未设置**: 20
  - ⚠️ `str_iron_body`
  - ⚠️ `orphan`
  - ⚠️ `dungeon_injured`
  - ⚠️ `chosen_field`
  - ⚠️ `astral_projection`
  - ⚠️ `miracle_survival`
  - ⚠️ `fate_touched`
  - ⚠️ `great_discovery`
  - ⚠️ `masterpiece_author`
  - ⚠️ `love_triangle`
  - ⚠️ `empire_built`
  - ⚠️ `tough_kid`
  - ⚠️ `self_taught`
  - ⚠️ `lucky_charm`
  - ⚠️ `young_merchant`
  - ⚠️ `serial_romance`
  - ⚠️ `forbidden_section`
  - ⚠️ `gambling_legend`
  - ⚠️ `body_tempered`
  - ⚠️ `trade_route`

### 2. 物品一致性

- **物品定义**: 22 个
- **事件中授予**: 13 种
- ✅ 所有 grant_item 目标均在 items.json 中定义

### 3. 事件完整性

- 无分支事件: 233
- 权重 <= 0 事件: 0
- 年龄范围异常: 0
- ⚠️ 存在结构问题

### 4. 条件 DSL 语法

- ✅ 所有条件 DSL 括号匹配正确

## 7. 问题汇总

### P2 — 非核心功能异常

- **精灵-女-A 寿命比仅 0.44** — finalAge=169, effectiveMaxAge=380
- **精灵-男-B 寿命比仅 0.12** — finalAge=49, effectiveMaxAge=401
- **海精灵-女-A 寿命比仅 0.18** — finalAge=79, effectiveMaxAge=450
- **海精灵-男-B 寿命比仅 0.70** — finalAge=323, effectiveMaxAge=462
- **精灵-女-A 寿命不到种族上限的50%** — finalAge=169, maxAge=380
- **精灵-男-B 寿命不到种族上限的50%** — finalAge=49, maxAge=401
- **路线 骑士 在14局中从未触发** — 入口条件: has.flag.knight

## 8. 改进建议

3. **事件覆盖率偏低**: 49.8%。考虑增加更多触发机会或调整权重。
4. **路线触发率**: 建议 14 局以上测试来获得更可靠的路线触发率统计。当前测试每个种族仅 2 局，部分路线可能因随机性未触发。

## 9. 每局详细记录

### 1. 人类-男-A (seed=8001)

- 种族: human | 性别: male
- 寿命: 86/86 | 评级: SS 不朽传说 | 分数: 646.3
- 初始HP: 61 | 事件数: 86 | 平凡年: 0
- 成就: 29 个 [first_step, ten_lives, chr_social_star, mny_comfortable_life, str_iron_body, wealth_peak, soul_pure, iron_body, beauty_supreme, male_beauty, chr_irresistible, demon_king_slayer_ach, str_body_of_legend, human_adaptability, centenarian, int_learned_scholar, eternal_wanderer, scholar_warrior, undying_legend_ach, wisdom_peak, legacy_master, longevity, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, iron_will_to_end, human_kingdom_pillar, miracle_afterglow]
- 路线: on_adventurer_path, on_scholar_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_human_farm | 农家子弟 |  | +5 |  |
| 2 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | +4 |  |
| 3 | SPR_p1_animal_whisper | 动物的话 | 与动物亲近 | 0 |  |
| 4 | SPR_p1_night_vision | 暗夜之眼 | 观察光芒 | 0 |  |
| 5 | chr_childhood_leader | 孩子王 | 公允之主 | 0 |  |
| 6 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 7 | spr_child_night_terror | 夜半惊魂 | 面对恐惧 | 0 |  |
| 8 | str_1_playground_bully | 操场霸凌 | 挺身而出 | 0 |  |
| 9 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +5 |  |
| 10 | child_first_fight | 第一次打架 | 挥拳反击 | +5 |  |
| 11 | explore_ruins | 废墟探险 | 推门进去 | +5 | ✅ |
| 12 | str_2_protect_refugees | 流民车队 | 驱赶地痞 | +5 |  |
| 13 | wander_market | 逛集市 | 买了一本旧书 | +3 |  |
| 14 | human_first_crush | 初恋的悸动 |  | 0 |  |
| 15 | luk_youth_winning_ticket | 神秘奖券 | 去兑奖 | 0 |  |
| 16 | spr_teen_premonition | 不祥的预感 | 相信预感 | 0 |  |
| 17 | guild_join | 加入冒险者公会 | 加入公会 | 0 |  |
| 18 | first_quest | 第一个委托 | 认真完成 | 0 | ✅ |
| 19 | luk_adult_lucky_business | 歪打正着 | 见好就收 | +5 |  |
| 20 | youth_first_love | 怦然心动 | 鼓起勇气搭话 | +5 |  |
| 21 | bandit_ambush | 山贼伏击 | 正面对抗 | -7 |  |
| 22 | adv_bounty | 高价悬赏 | 接任务 | -6 | ✅ |
| 23 | chr_youth_casanova_peak | 风流浪子的巅峰 | 厌倦游戏 | +4 |  |
| 24 | adv_uncharted | 未踏之地 | 出发 | -16 | ❌ |
| 25 | dating_start | 开始交往 | 正式告白 | +4 |  |
| 26 | spr_adult_oracle | 神谕降临 | 接受使命 | +4 |  |
| 27 | scenic_travel | 远行见世面 | 冒险路线 | +4 |  |
| 28 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +4 |  |
| 29 | assassin_contract | 暗杀委托 | 坚决拒绝 | +3 |  |
| 30 | mid_adopt_orphan | 路边孤儿 | 带回家 | +3 |  |
| 31 | spr_adult_spirit_pact | 灵界契约 | 接受交易 | +3 |  |
| 32 | protect_family | 家门口的怪物 | 正面迎敌 | -7 |  |
| 33 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +3 |  |
| 34 | mercenary_contract | 佣兵合同 | 忠诚完成合同 | +3 |  |
| 35 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | +2 |  |
| 36 | human_mercenary_life | 佣兵生涯 | 刀口舔血 | -3 |  |
| 37 | family_dinner | 家庭晚餐 | 亲自下厨 | +2 |  |
| 38 | student_successor | 收徒传艺 | 严格教导 | +2 |  |
| 39 | boss_lair_assault | 魔王城攻略 | 担任先锋队长 | -18 |  |
| 40 | old_rival | 老对手来访 | 热情招待 | +2 |  |
| 41 | random_helping_stranger | 帮助陌生人 |  | +2 |  |
| 42 | human_community_leader | 社区领袖 |  | +1 |  |
| 43 | human_political_election | 参加镇长选举 | 参选 | +1 | ✅ |
| 44 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | +1 |  |
| 45 | chr_mid_ghosts | 过去的幽灵 | 承担责任 | +1 |  |
| 46 | spr_mid_doomsday_prophecy | 末日预言 | 公开预言 | +1 |  |
| 47 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +1 |  |
| 48 | str_6_legendary_battle | 最后一战 | 正面迎战 | +1 |  |
| 49 | human_land_dispute | 土地纠纷 | 找村长仲裁 | +1 |  |
| 50 | challenge_abyss | 深渊之门 | 走入深渊 | -9 | ✅ |
| 51 | mid_found_school | 开宗立派 | 门庭若市 | +1 | ✅ |
| 52 | elder_family_reunion | 天伦之乐 | 其乐融融 | +16 |  |
| 53 | human_mentor_youth | 指导年轻人 |  | +1 |  |
| 54 | random_training_day | 勤奋的一天 | 训练体能 | +1 |  |
| 55 | human_village_historian | 村庄史官 |  | +1 |  |
| 56 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +10 |  |
| 57 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -10 | ✅ |
| 58 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 59 | disciple_comes | 收徒传艺 | 收下这个弟子 | 0 |  |
| 60 | mid_garden_retirement | 后院花园 | 在花园中冥想 | -1 |  |
| 61 | int_legend_epilogue_teacher | 最后的课 | 传授所有知识，包括禁忌 | -1 |  |
| 62 | elder_last_adventure | 不服老的冒险 | 出发！ | -1 | ✅ |
| 63 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | -1 |  |
| 64 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -2 | ✅ |
| 65 | elder_memoir | 撰写回忆录 | 传世之作 | -2 | ❌ |
| 66 | human_grandchild_laughter | 孙辈的笑声 |  | -2 |  |
| 67 | human_family_photo | 全家聚会 |  | -3 |  |
| 68 | elder_old_letters | 旧日书信 |  | -3 |  |
| 69 | elder_unexpected_visitor | 意外的来访者 |  | -3 |  |
| 70 | human_last_toast | 最后一杯酒 |  | -4 |  |
| 71 | human_grandchild_story | 给孙辈讲故事 |  | -4 |  |
| 72 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +5 |  |
| 73 | spr_elder_final_wisdom | 最后的智慧 | 传授给后人 | -5 |  |
| 74 | elder_dream_fulfilled | 完成心愿 |  | -6 |  |
| 75 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -6 |  |
| 76 | elder_disciple_visit | 故徒来访 | 感念师恩 | +3 |  |
| 77 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | -7 |  |
| 78 | mag_elder_mana_dissolve | 魔力的消散 | 欣然接受 | -8 |  |
| 79 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | -8 |  |
| 80 | MAG_p7_final_spell | 最后的魔法 | 守护之盾 | -9 |  |
| 81 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | -9 |  |
| 82 | aging_hint_late | 生命的黄昏 |  | -10 |  |
| 83 | legend_spread | 传说的传播 | 享受名声 | +10 |  |
| 84 | elder_star_gazing_final | 最后的星空 | 内心平静 | -11 |  |
| 85 | peaceful_end | 平静的终章 |  | -12 |  |
| 86 | elder_final_counting | 生命的终点 | 名垂青史 | -10 |  |

### 2. 人类-女-B (seed=8002)

- 种族: human | 性别: female
- 寿命: 67/89 | 评级: SS 不朽传说 | 分数: 490
- 初始HP: 46 | 事件数: 67 | 平凡年: 0
- 成就: 21 个 [first_step, ten_lives, chr_social_star, int_learned_scholar, wisdom_peak, mag_arcane_adept, int_omniscient, spr_enlightened_soul, beauty_supreme, soul_pure, archmage_body, mag_arcane_master, archmage_ach, female_archmage, chr_irresistible, mag_reality_warper, legacy_master, era_remembered, legendary_epilogue, immortal_epilogue, arcane_reserve_final]
- 路线: on_scholar_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_common | 平民之子 |  | +4 |  |
| 2 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +4 |  |
| 3 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +4 |  |
| 4 | bullied | 被大孩子欺负 | 忍气吞声 | +4 |  |
| 5 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +1 |  |
| 6 | SPR_p1_animal_whisper | 动物的话 | 与动物亲近 | 0 |  |
| 7 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 8 | child_night_sky | 仰望星空 |  | 0 |  |
| 9 | explore_ruins | 废墟探险 | 推门进去 | 0 | ✅ |
| 10 | MAG_p2_academy_letter | 魔法学院来信 | 入学就读 | -6 |  |
| 11 | random_stargazing | 观星 |  | -7 |  |
| 12 | human_ambition_awakens | 野心觉醒 | 追求力量——成为最强的战士 | 0 |  |
| 13 | spr_teen_meditation | 第一次冥想 | 继续深入 | +4 |  |
| 14 | random_rainy_contemplation | 雨中沉思 |  | +4 |  |
| 15 | chr_teen_popularity | 校园偶像 | 广交朋友 | +2 |  |
| 16 | int_young_forbidden_section | 禁忌图书区 | 潜入禁忌区 | 0 |  |
| 17 | chr_teen_jealousy | 嫉妒的风暴 | 坦白心意 | 0 |  |
| 18 | human_first_hunt | 第一次狩猎 | 独自追踪猎物 | 0 |  |
| 19 | first_love | 初恋的味道 | 表白 | +4 | ❌ |
| 20 | youth_caravan_guard | 商队护卫 | 报名参加 | +3 |  |
| 21 | meteor_shower | 流星雨 | 许个愿 | +4 |  |
| 22 | chr_youth_heartbreak | 被抛弃 | 深刻反思 | +2 |  |
| 23 | human_marriage_proposal | 家族联姻 | 接受安排 | 0 |  |
| 24 | chr_youth_social_club | 名流圈子 | 如鱼得水 | 0 |  |
| 25 | int_apprentice_secret_teaching | 隐秘的传承 | 虚心学习 | 0 |  |
| 26 | mag_youth_ritual_mastery | 仪式精通 | 用于研究 | 0 |  |
| 27 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | 0 |  |
| 28 | food_culture | 美食之旅 | 学习烹饪 | 0 |  |
| 29 | chr_youth_casanova_peak | 风流浪子的巅峰 | 厌倦游戏 | 0 |  |
| 30 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | 0 |  |
| 31 | human_orphan_adoption | 收养孤儿 |  | -6 |  |
| 32 | harvest_festival | 丰收祭典 | 参加各项比赛 | 0 |  |
| 33 | chr_adult_reputation_crisis | 绯闻风暴 | 法律维权 | +2 |  |
| 34 | youth_short_term_job | 临时差事 | 老老实实做完 | +2 |  |
| 35 | spr_adult_spirit_pact | 灵界契约 | 接受交易 | +1 |  |
| 36 | luk_mid_fortune_wheel | 命运转盘 | 转一把 | -1 |  |
| 37 | human_tax_reform | 税制改革 | 据理力争 | 0 |  |
| 38 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | -1 |  |
| 39 | mid_life_reflection | 人生回顾 |  | 0 |  |
| 40 | challenge_abyss | 深渊之门 | 走入深渊 | -10 | ✅ |
| 41 | int_master_magnum_opus | 毕生之作 | 公开出版，普惠世人 | +1 |  |
| 42 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -14 |  |
| 43 | human_plague_survivor | 瘟疫幸存者 |  | -2 |  |
| 44 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 45 | chr_mid_ex_return | 前任的来信 | 回信释然 | 0 |  |
| 46 | midlife_crisis | 中年危机 | 放下执念 | +5 |  |
| 47 | cryptic_manuscript | 神秘手稿 | 花时间破译 | 0 |  |
| 48 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | 0 |  |
| 49 | mid_body_decline | 岁月的痕迹 | 接受现实 | -10 |  |
| 50 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 51 | chr_mid_mature_charm | 成熟的魅力 | 传道授业 | 0 |  |
| 52 | mid_gambling | 地下赌场 | 梭哈！ | 0 | ❌ |
| 53 | challenge_final_boss | 魔王降临 | 直面魔王 | -20 | ❌ |
| 54 | human_family_tradition | 传承家族手艺 |  | 0 |  |
| 55 | chr_mid_legacy | 风流遗产 | 配合传记 | 0 |  |
| 56 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 57 | human_legacy_decision | 遗产安排 | 平均分给子女 | 0 |  |
| 58 | int_legend_final_truth | 世界之书 | 前往世界的尽头 | -1 |  |
| 59 | aging_hint_mid | 力不从心 | 坦然接受 | -4 |  |
| 60 | disciple_comes | 收徒传艺 | 收下这个弟子 | -1 |  |
| 61 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +9 |  |
| 62 | random_street_performance | 街头表演 |  | -1 |  |
| 63 | elder_unexpected_visitor | 意外的来访者 |  | -2 |  |
| 64 | human_memoir_writing | 撰写回忆录 |  | -2 |  |
| 65 | mag_elder_grimoire | 传世魔导书 | 传给弟子 | -2 |  |
| 66 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | -2 |  |
| 67 | elder_last_adventure | 不服老的冒险 | 出发！ | -14 | ❌ |

### 3. 精灵-女-A (seed=8003)

- 种族: elf | 性别: female
- 寿命: 169/380 | 评级: SS 不朽传说 | 分数: 946.7
- 初始HP: 49 | 事件数: 169 | 平凡年: 0
- 成就: 47 个 [first_step, ten_lives, chr_social_star, mage_path, mag_arcane_adept, beauty_supreme, soul_pure, int_learned_scholar, chr_irresistible, archmage_body, elf_magic_pinnacle, wisdom_peak, int_omniscient, mag_reality_warper, elf_forest_healer_ach, healer_path, mny_comfortable_life, fairy_companion, centenarian, wealth_peak, war_hero_ach, longevity, archmage_ach, female_archmage, master_of_all, str_iron_body, love_and_war, mag_arcane_master, lucky_star, lucky_gambler_ach, luk_charmed_life, famous_author_ach, tower_master_ach, legacy_of_students, elf_star_song_ach, peaceful_ending, eternal_peace, school_founder_ach, elemental_lord_ach, dragon_knight, elf_dragon_bond, elf_council_seat, era_remembered, legendary_epilogue, immortal_epilogue, arcane_reserve_final, century_witness]
- 路线: on_mage_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_arcane_cradle | 魔力摇篮 |  | +4 |  |
| 2 | elf_moonlight_lullaby | 月光摇篮曲 |  | +4 |  |
| 3 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | +3 |  |
| 4 | elf_starlight_bath | 星光沐浴 | 平静地接受洗礼 | 0 |  |
| 5 | elf_talking_to_tree | 与树对话 |  | 0 |  |
| 6 | MAG_p1_mana_awakening | 魔力涌动 | 压抑魔力 | 0 |  |
| 7 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | 0 |  |
| 8 | spr_child_night_terror | 夜半惊魂 | 面对恐惧 | 0 |  |
| 9 | village_festival | 村里祭典 | 大吃特吃 | +3 |  |
| 10 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | -3 |  |
| 11 | child_night_sky | 仰望星空 |  | 0 |  |
| 12 | random_found_coin | 捡到硬币 |  | 0 |  |
| 13 | elf_first_love | 星下之约 | 在星光下倾诉 | 0 |  |
| 14 | elf_human_encounter | 初遇人类 | 友善地打招呼 | 0 |  |
| 15 | chr_childhood_friendzone | 青梅竹马 | 两小无猜 | 0 |  |
| 16 | str_1_wrestling_old_man | 退役老兵的摔跤课 | 拜师学艺 | 0 |  |
| 17 | village_feud | 村长之争 | 帮弱者说话 | +4 |  |
| 18 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +4 |  |
| 19 | magic_academy_letter | 魔法学院来信 | 入学就读 | +4 |  |
| 20 | magic_graduate | 魔法学院毕业 | 继续深造研究 | +4 |  |
| 21 | random_street_performance | 街头表演 |  | +4 |  |
| 22 | MAG_p2_first_spell | 初次施法 | 火球术 | -3 |  |
| 23 | tree_climbing | 爬树冒险 | 爬到最高处 | +3 | ✅ |
| 24 | mag_child_floating | 家具飘起来了 | 试着控制它 | +4 |  |
| 25 | int_youth_ruins_exploration | 古代遗迹的诱惑 | 组队探索 | +2 |  |
| 26 | chr_teen_love_letter | 情书 | 追查写信人 | +4 |  |
| 27 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | 0 |  |
| 28 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | 0 |  |
| 29 | str_2_mercenary_recruit | 佣兵团招人 | 报名入伍 | +3 |  |
| 30 | chr_teen_dance | 星夜舞会 | 选择青梅 | +4 |  |
| 31 | chr_teen_first_love | 初恋 | 全心投入 | +3 |  |
| 32 | chr_public_speech | 广场演说 | 慷慨陈词 | 0 | ✅ |
| 33 | int_young_mentor_test | 导师的考验 | 用常规方法解答 | 0 |  |
| 34 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 35 | river_discovery | 河底发光 | 潜下去捡 | +3 | ✅ |
| 36 | mage_arcane_library | 禁忌魔法图书馆 | 偷偷阅读 | -7 | ✅ |
| 37 | chr_youth_heartbreak | 被抛弃 | 深刻反思 | 0 |  |
| 38 | chr_youth_love_triangle | 三角困局 | 选择安稳 | 0 |  |
| 39 | star_gazing | 观星 | 冥想 | 0 |  |
| 40 | magical_creature_tame | 驯服魔物 | 尝试驯服 | -10 |  |
| 41 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | +4 |  |
| 42 | food_culture | 美食之旅 | 学习烹饪 | +4 |  |
| 43 | int_apprentice_secret_teaching | 隐秘的传承 | 虚心学习 | +2 |  |
| 44 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | 0 |  |
| 45 | elf_diplomatic_mission | 外交使命 | 以理服人 | 0 |  |
| 46 | mny_youth_allowance_choice | 零花钱的选择 | 买糖果 | 0 |  |
| 47 | elf_lament_for_fallen | 悲歌 |  | -1 |  |
| 48 | elf_runic_barrier | 符文结界 |  | +1 |  |
| 49 | int_youth_street_bookseller | 流动书商的奇书 | 买下那本发光的书 | +4 |  |
| 50 | elemental_trial | 元素试炼 | 火之试炼 | -10 |  |
| 51 | str_4_mercenary_betrayal | 佣兵的抉择 | 执行命令 | +4 |  |
| 52 | elf_forest_corruption | 森林的腐化 | 用净化魔法治疗森林 | +4 |  |
| 53 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -21 | ❌ |
| 54 | mag_teen_potion_accident | 魔药事故 | 研究失败原因 | +4 |  |
| 55 | mid_gambling | 地下赌场 | 梭哈！ | +4 | ✅ |
| 56 | chr_adult_social_star | 社交名流 | 享受聚光 | +4 |  |
| 57 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +4 |  |
| 58 | elf_dream_walker_adult | 入梦者 |  | +4 |  |
| 59 | spr_dream_vision | 预知梦 | 认真对待 | +4 |  |
| 60 | chr_yuth_fame_cost | 风流的代价 | 浪子回头 | +2 |  |
| 61 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | 0 |  |
| 62 | elf_phoenix_sighting | 凤凰目击 |  | 0 |  |
| 63 | mag_teen_elemental_awakening | 元素觉醒 | 引导雷电 | 0 |  |
| 64 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | 0 |  |
| 65 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -10 | ✅ |
| 66 | str_2_training_injury | 训练受伤 | 咬牙继续练 | -5 |  |
| 67 | mny_youth_inheritance | 意外继承 | 接受遗产 | +4 |  |
| 68 | adult_teaching_offer | 教学邀请 | 欣然接受 | +4 |  |
| 69 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +4 |  |
| 70 | midlife_new_craft | 半路学艺 | 学点能打动人的 | -4 |  |
| 71 | mage_magic_war | 魔法战争 | 参战 | -5 | ✅ |
| 72 | adult_business_startup | 创业梦想 | 全力投入 | +4 | ✅ |
| 73 | elf_dark_elf_encounter | 黑暗精灵 | 帮助对方 | +4 |  |
| 74 | aging_hint_mid | 力不从心 | 坦然接受 | +1 |  |
| 75 | elf_treesong_mastery | 树歌精通 |  | +3 |  |
| 76 | mid_natural_disaster | 天灾 | 组织救援 | 0 |  |
| 77 | elf_longevity_burden | 不老之痛 | 接受这就是精灵的命运 | 0 |  |
| 78 | chr_adult_reputation_crisis | 绯闻风暴 | 法律维权 | 0 |  |
| 79 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | 0 |  |
| 80 | chr_adult_settling_down | 安定还是流浪 | 扎根 | 0 |  |
| 81 | elf_council_invitation | 长老会议席邀请 |  | 0 |  |
| 82 | mid_life_reflection | 人生回顾 |  | 0 |  |
| 83 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -15 |  |
| 84 | magic_duel | 学院决斗赛 | 全力应战 | -1 | ✅ |
| 85 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +4 |  |
| 86 | mag_youth_enchanted_forge | 魔导锻造 | 批量生产 | +4 |  |
| 87 | luk_lottery | 王国彩票 | 中大奖了！ | +4 | ❌ |
| 88 | random_stargazing | 观星 |  | +4 |  |
| 89 | elf_magic_research | 魔法论文 | 发表论文 | +4 |  |
| 90 | mny_adult_political_marriage | 政治联姻 | 同意联姻 | +3 |  |
| 91 | chr_youth_rejection | 拒绝的艺术 | 温柔拒绝 | 0 |  |
| 92 | chr_mid_health_wake | 身体的警告 | 痛改前非 | 0 |  |
| 93 | mid_legacy_project | 留下遗产 | 写一本书 | 0 |  |
| 94 | mid_adopt_orphan | 路边孤儿 | 带回家 | 0 |  |
| 95 | luk_adult_black_cat | 黑猫横路 | 跟着黑猫走 | -4 |  |
| 96 | mid_heir_training | 培养继承人 | 青出于蓝 | 0 | ✅ |
| 97 | mag_youth_wild_power | 荒野中的觉醒 | 完全接纳 | 0 |  |
| 98 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | 0 |  |
| 99 | elf_forest_expansion | 拓展森林 |  | 0 |  |
| 100 | elf_young_elf_mentor | 指导年轻精灵 |  | 0 |  |
| 101 | mag_youth_ritual_mastery | 仪式精通 | 用于研究 | 0 |  |
| 102 | mny_adult_fief_management | 封地治理 | 重税高压 | 0 |  |
| 103 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | 0 |  |
| 104 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +10 |  |
| 105 | luk_adult_lucky_business | 歪打正着 | 见好就收 | -16 |  |
| 106 | community_leader | 社区领袖 | 接受职位 | 0 |  |
| 107 | dark_mage_choice | 禁忌知识的召唤 | 翻开禁书 | -30 | ❌ |
| 108 | spr_adult_spirit_pact | 灵界契约 | 接受交易 | +4 |  |
| 109 | mid_found_school | 开宗立派 | 门庭若市 | +4 | ✅ |
| 110 | random_weather_blessing | 好天气 |  | +4 |  |
| 111 | elder_passing_wisdom | 智者之言 |  | +4 |  |
| 112 | mny_adult_charity_dilemma | 乞丐的手 | 慷慨解囊 | +4 |  |
| 113 | elder_family_reunion | 天伦之乐 | 其乐融融 | +19 |  |
| 114 | elder_illness | 疾病缠身 | 积极治疗 | -39 | ✅ |
| 115 | elder_memoir | 撰写回忆录 | 传世之作 | +4 | ✅ |
| 116 | elder_legacy_gift | 传家之宝 | 传给有缘人 | +4 |  |
| 117 | mage_magic_tower | 法师塔 | 挑战塔主 | +3 | ✅ |
| 118 | elder_disciple_visit | 故徒来访 | 感念师恩 | +12 |  |
| 119 | elder_unexpected_visitor | 意外的来访者 |  | -10 |  |
| 120 | elf_star_song | 星之歌 |  | 0 |  |
| 121 | elf_spell_weaving | 织法术式 |  | 0 |  |
| 122 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -10 | ✅ |
| 123 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | +3 |  |
| 124 | retirement | 挂剑归隐 | 归隐山林 | +2 |  |
| 125 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | -18 |  |
| 126 | elf_silver_harp | 银竖琴 |  | 0 |  |
| 127 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | 0 |  |
| 128 | soul_corruption_consequence | 灵魂的裂痕 | 寻求净化 | -10 | ✅ |
| 129 | elder_last_adventure | 不服老的冒险 | 出发！ | -17 | ❌ |
| 130 | luk_mid_fortune_wheel | 命运转盘 | 转一把 | +3 |  |
| 131 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +3 |  |
| 132 | chr_elder_regret | 月光下的回忆 | 释然接受 | +3 |  |
| 133 | int_scholar_apprentice_of_your_own | 收徒 | 选择聪慧但傲慢的天才 | +3 |  |
| 134 | mag_adult_arcane_mastery | 奥术大成 | 开宗立派 | +3 |  |
| 135 | mage_elemental_plane | 元素位面 | 吸收元素之力 | -7 | ✅ |
| 136 | legend_spread | 传说的传播 | 享受名声 | +3 |  |
| 137 | aging_hint_early | 岁月的痕迹 |  | +1 |  |
| 138 | elder_autobiography | 自传 | 欣然同意 | +3 |  |
| 139 | int_scholar_forbidden_ritual | 禁忌的召唤 | 执行仪式 | -7 |  |
| 140 | random_minor_injury | 小伤 |  | +2 |  |
| 141 | elder_garden_peace | 花园时光 |  | +3 |  |
| 142 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +1 | ❌ |
| 143 | mag_finale_legacy_event | 魔导遗产 | 被尊为大师 | +3 |  |
| 144 | chr_elder_finale | 花花公子的终章 | 儿孙满堂 | +3 |  |
| 145 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | +3 |  |
| 146 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -2 |  |
| 147 | mny_adult_debt_collector | 讨债 | 暴力讨债 | +3 |  |
| 148 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | +2 | ✅ |
| 149 | mag_mid_legacy_tower | 建造魔导塔 | 建在高处 | +2 |  |
| 150 | random_rainy_contemplation | 雨中沉思 |  | +2 |  |
| 151 | elf_teaching_young | 教导下一代 |  | +2 |  |
| 152 | elf_watching_generations | 看着世代更替 |  | +2 |  |
| 153 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +2 |  |
| 154 | elder_old_enemy | 昔日的对手 | 去见他 | +2 |  |
| 155 | mny_adult_market_boom | 牛市来临 | 全部抛售 | 0 |  |
| 156 | mid_old_enemy | 旧敌来访 | 正面迎战 | -21 | ❌ |
| 157 | elder_sunset_watching | 夕阳 |  | +2 |  |
| 158 | challenge_final_boss | 魔王降临 | 直面魔王 | -18 | ❌ |
| 159 | elf_wisdom_council_seat | 贤者之席 |  | +2 |  |
| 160 | int_master_magnum_opus | 毕生之作 | 公开出版，普惠世人 | +2 |  |
| 161 | peaceful_end | 平静的终章 |  | +2 |  |
| 162 | challenge_abyss | 深渊之门 | 走入深渊 | -8 | ✅ |
| 163 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | +2 |  |
| 164 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +2 |  |
| 165 | mag_mid_magic_decay | 魔力衰退的征兆 | 加强修炼 | +2 |  |
| 166 | elf_dragon_alliance | 与龙族结盟 | 接受盟约 | +2 |  |
| 167 | elder_reunion | 故人重逢 | 热泪盈眶 | +2 |  |
| 168 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | -18 | ❌ |
| 169 | mid_return_adventure | 重出江湖 | 挑战新地城 | -24 | ❌ |

### 4. 精灵-男-B (seed=8004)

- 种族: elf | 性别: male
- 寿命: 49/401 | 评级: S 传奇人生 | 分数: 388.2
- 初始HP: 31 | 事件数: 49 | 平凡年: 0
- 成就: 20 个 [first_step, ten_lives, soul_pure, chr_social_star, mag_arcane_adept, int_learned_scholar, beauty_supreme, male_beauty, chr_irresistible, archmage_body, elf_magic_pinnacle, elf_star_song_ach, wisdom_peak, elf_forest_healer_ach, mag_reality_warper, healer_path, era_remembered, legendary_epilogue, immortal_epilogue, arcane_reserve_final]
- 路线: on_scholar_path, on_mage_path
- 物品: 1 个 [crystal_shard]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_elf_craftsman | 工匠之家 |  | +2 |  |
| 2 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | +2 |  |
| 3 | elf_starlight_bath | 星光沐浴 | 平静地接受洗礼 | +2 |  |
| 4 | elf_animal_friend | 林间小鹿 |  | +2 |  |
| 5 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | +1 |  |
| 6 | elf_seed_planting | 种下第一棵树 |  | 0 |  |
| 7 | elf_talking_to_tree | 与树对话 |  | 0 |  |
| 8 | elf_butterfly_dance | 蝶舞课堂 |  | 0 |  |
| 9 | MAG_p1_mana_awakening | 魔力涌动 | 压抑魔力 | +2 |  |
| 10 | elf_first_treesong | 第一次听见树歌 | 尝试用魔力回应树灵 | +2 |  |
| 11 | spr_child_night_terror | 夜半惊魂 | 面对恐惧 | 0 |  |
| 12 | SPR_p1_dream_walk | 梦中行走 | 探索梦境 | +2 |  |
| 13 | chr_childhood_leader | 孩子王 | 公允之主 | +1 |  |
| 14 | int_child_village_sage | 村里的老学究 | 拜师学艺 | 0 |  |
| 15 | SPR_p1_night_vision | 暗夜之眼 | 观察光芒 | 0 |  |
| 16 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | 0 |  |
| 17 | elf_first_love | 星下之约 | 在星光下倾诉 | 0 |  |
| 18 | village_feud | 村长之争 | 帮弱者说话 | 0 |  |
| 19 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | 0 |  |
| 20 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 21 | mag_child_imaginary | 看不见的朋友 | 和它做朋友 | 0 |  |
| 22 | MAG_p1_strange_dreams | 魔力之梦 | 跟随声音 | 0 |  |
| 23 | mag_child_floating | 家具飘起来了 | 试着控制它 | 0 |  |
| 24 | elf_first_century | 第一个百年 |  | 0 |  |
| 25 | elf_beast_tongue | 兽语习得 |  | 0 |  |
| 26 | teen_secret_discovered | 发现秘密 | 公开揭发 | 0 |  |
| 27 | elf_starlight_weaving | 星光织衣 |  | 0 |  |
| 28 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | 0 |  |
| 29 | chr_teen_love_letter | 情书 | 追查写信人 | +2 |  |
| 30 | chr_teen_popularity | 校园偶像 | 广交朋友 | +1 |  |
| 31 | secret_master | 隐居大师 | 拜师学艺 | 0 |  |
| 32 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | -6 |  |
| 33 | dating_start | 开始交往 | 正式告白 | 0 |  |
| 34 | elf_forbidden_magic_scroll | 禁忌魔法卷轴 | 打开研读 | 0 |  |
| 35 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | 0 |  |
| 36 | festival_dance | 丰收祭的舞蹈 | 一起跳舞 | 0 |  |
| 37 | teen_future_talk | 夜谈未来 | 认真说出愿望 | 0 |  |
| 38 | chr_childhood_protector | 小小护花使者 | 温柔以待 | 0 |  |
| 39 | quest_parting | 远征前的告别 | 系上护身符 | 0 |  |
| 40 | traveling_sage | 云游学者 | 跟随学者学习 | 0 |  |
| 41 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | 0 | ✅ |
| 42 | elf_ancient_magic | 精灵秘术·星辰之歌 | 全身心学习星辰之歌 | 0 | ✅ |
| 43 | chr_youth_secret_lover | 秘密情人 | 悬崖勒马 | 0 |  |
| 44 | SPR_p2_shrine_calling | 神殿的召唤 | 入神殿修行 | 0 |  |
| 45 | magic_academy_enrollment | 魔法学院来信 | 入学 | -7 |  |
| 46 | int_invention | 奇思妙想 | 动手制造 | -7 | ✅ |
| 47 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | -3 |  |
| 48 | elf_fading_forest | 枯萎的森林 | 尝试用魔法治愈森林 | -19 | ✅ |
| 49 | starlight_promise | 星光下的约定 | 遵守承诺 | -8 |  |

### 5. 矮人-男-A (seed=8005)

- 种族: dwarf | 性别: male
- 寿命: 149/163 | 评级: SS 不朽传说 | 分数: 886
- 初始HP: 61 | 事件数: 149 | 平凡年: 0
- 成就: 42 个 [first_step, ten_lives, soul_pure, int_learned_scholar, wisdom_peak, spr_enlightened_soul, chr_social_star, int_omniscient, beauty_supreme, male_beauty, str_iron_body, chr_irresistible, scholar_warrior, iron_body, merchant_empire, mny_comfortable_life, centenarian, divine_champion_ach, dwarf_holdfast_ach, master_of_all, mag_arcane_adept, longevity, demon_king_slayer_ach, str_body_of_legend, cheated_death_ach, archmage_ach, archmage_body, legacy_master, dwarf_hall_name, mag_reality_warper, famous_author_ach, undying_legend_ach, peaceful_ending, eternal_peace, ascended_ach, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness]
- 路线: on_merchant_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_common | 平民之子 |  | +5 |  |
| 2 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +4 |  |
| 3 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | 0 |  |
| 4 | child_dwarf_first_hammer | 第一次握锤 | 先练稳稳落锤 | 0 |  |
| 5 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | +3 |  |
| 6 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 7 | SPR_p1_animal_whisper | 动物的话 | 与动物亲近 | -3 |  |
| 8 | SPR_p1_night_vision | 暗夜之眼 | 观察光芒 | 0 |  |
| 9 | stray_dog | 流浪狗 | 带它回家 | 0 |  |
| 10 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | 0 |  |
| 11 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 12 | SPR_p1_dream_walk | 梦中行走 | 探索梦境 | 0 |  |
| 13 | int_child_early_curiosity | 无尽的好奇心 | 追问到底 | 0 |  |
| 14 | chr_childhood_leader | 孩子王 | 公允之主 | 0 |  |
| 15 | random_minor_injury | 小伤 |  | -1 |  |
| 16 | int_child_first_puzzle | 石碑上的谜题 | 独自破解 | +1 |  |
| 17 | young_rival | 少年的对手 | 努力超越他 | 0 |  |
| 18 | teen_dwarf_choose_master | 拜师之日 | 跟锻炉师傅学火候 | +5 |  |
| 19 | wander_market | 逛集市 | 买了一本旧书 | +5 |  |
| 20 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | 0 |  |
| 21 | int_youth_rivalry | 天才的竞争 | 以竞争为动力 | 0 |  |
| 22 | random_street_performance | 街头表演 |  | 0 |  |
| 23 | spr_teen_meditation | 第一次冥想 | 继续深入 | 0 |  |
| 24 | str_2_street_fight | 街头斗殴 | 一拳定胜负 | 0 |  |
| 25 | chr_teen_first_love | 初恋 | 全心投入 | +5 |  |
| 26 | chr_teen_secret_admirer | 暗恋者的目光 | 主动靠近 | +5 |  |
| 27 | int_youth_ruins_exploration | 古代遗迹的诱惑 | 组队探索 | +5 |  |
| 28 | chr_teen_love_letter | 情书 | 追查写信人 | +5 |  |
| 29 | first_love | 初恋的味道 | 表白 | +3 | ✅ |
| 30 | int_young_forbidden_section | 禁忌图书区 | 潜入禁忌区 | 0 |  |
| 31 | pet_companion | 捡到流浪动物 | 带回家养 | 0 |  |
| 32 | dating_start | 开始交往 | 正式告白 | 0 |  |
| 33 | starlight_promise | 星光下的约定 | 遵守承诺 | -10 |  |
| 34 | merchant_guidance | 商人学徒招募 | 拜师学商 | +5 |  |
| 35 | int_invention | 奇思妙想 | 动手制造 | +5 | ✅ |
| 36 | chr_youth_heartbreak | 被抛弃 | 深刻反思 | -7 |  |
| 37 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | 0 | ✅ |
| 38 | chr_youth_rejection | 拒绝的艺术 | 温柔拒绝 | 0 |  |
| 39 | youth_bandit_ambush | 路遇山贼 | 战斗！ | 0 | ✅ |
| 40 | str_4_war_breaks_out | 战争爆发 | 主动请战 | +5 |  |
| 41 | chr_youth_love_triangle | 三角困局 | 选择安稳 | +5 |  |
| 42 | chr_youth_secret_lover | 秘密情人 | 悬崖勒马 | +5 |  |
| 43 | youth_tavern_rumor | 酒馆传闻 | 凑过去听 | +5 |  |
| 44 | str_4_first_battle | 初阵 | 杀出血路 | -13 |  |
| 45 | luk_mid_fortune_wheel | 命运转盘 | 转一把 | +5 |  |
| 46 | random_rainy_contemplation | 雨中沉思 |  | +5 |  |
| 47 | scholar_guidance | 学者收徒 | 拜师求教 | +5 |  |
| 48 | int_scholar_great_library | 大图书馆的钥匙 | 系统性地研究 | +4 |  |
| 49 | chr_yuth_fame_cost | 风流的代价 | 浪子回头 | +4 |  |
| 50 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | +4 |  |
| 51 | youth_short_term_job | 临时差事 | 老老实实做完 | +4 |  |
| 52 | gambling_night | 赌场之夜 | 放手一搏 | +4 |  |
| 53 | mny_trade_route | 丝绸之路 | 谈判 | -1 | ✅ |
| 54 | merchant_auction | 稀有拍卖会 | 竞拍神器 | +4 | ❌ |
| 55 | merchant_career | 商路崛起 | 扩张商路 | +4 | ✅ |
| 56 | merchant_economic_crisis | 经济危机 | 抄底 | -6 | ✅ |
| 57 | soul_bound | 灵魂契约 | 接受灵魂契约 | -10 |  |
| 58 | market_haggling | 集市砍价 | 砍价大师 | +4 |  |
| 59 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +4 | ✅ |
| 60 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +1 |  |
| 61 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | 0 |  |
| 62 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | -1 |  |
| 63 | chain_dark_past | 黑暗过去 | 谈判 | 0 | ✅ |
| 64 | chr_adult_reputation_crisis | 绯闻风暴 | 法律维权 | -1 |  |
| 65 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | 0 |  |
| 66 | mny_tax_crisis | 税务危机 | 偷税漏税 | -1 | ✅ |
| 67 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | 0 |  |
| 68 | luk_lottery | 王国彩票 | 中大奖了！ | -7 | ❌ |
| 69 | mid_adopt_orphan | 路边孤儿 | 带回家 | 0 |  |
| 70 | random_training_day | 勤奋的一天 | 训练体能 | -4 |  |
| 71 | merchant_guild | 商行 | 创业！ | +3 | ✅ |
| 72 | midlife_new_craft | 半路学艺 | 学点能打动人的 | -4 |  |
| 73 | aging_hint_mid | 力不从心 | 坦然接受 | -3 |  |
| 74 | family_dinner | 家庭晚餐 | 亲自下厨 | +2 |  |
| 75 | challenge_god_trial | 神之试炼 | 接受试炼 | -20 | ✅ |
| 76 | adult_dwarf_hold_alarm | 要塞警报 | 扛盾守住最窄的入口 | 0 |  |
| 77 | divine_vision | 神谕 | 遵循神谕行事 | +2 |  |
| 78 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +2 |  |
| 79 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | -13 |  |
| 80 | teaching_others | 传授经验 | 认真教学 | +2 |  |
| 81 | chr_mid_mature_charm | 成熟的魅力 | 传道授业 | +2 |  |
| 82 | mid_business_rivalry | 商战 | 智取胜过 | +2 | ✅ |
| 83 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +2 |  |
| 84 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +2 | ✅ |
| 85 | magic_research_breakthrough | 魔法研究突破 | 公开发表 | +2 |  |
| 86 | challenge_final_boss | 魔王降临 | 直面魔王 | -24 | ✅ |
| 87 | community_leader | 社区领袖 | 接受职位 | +1 |  |
| 88 | str_6_legendary_battle | 最后一战 | 正面迎战 | +1 |  |
| 89 | mid_heir_training | 培养继承人 | 青出于蓝 | +1 | ✅ |
| 90 | spr_near_death | 濒死体验 | 挣扎求生 | -14 |  |
| 91 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -14 |  |
| 92 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +1 |  |
| 93 | aging_hint_early | 岁月的痕迹 |  | -1 |  |
| 94 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +11 |  |
| 95 | chr_mid_ex_return | 前任的来信 | 回信释然 | +1 |  |
| 96 | mag_mid_magic_decay | 魔力衰退的征兆 | 加强修炼 | +1 |  |
| 97 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +1 |  |
| 98 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +11 |  |
| 99 | legacy_question | 传承之问 | 倾囊相授 | +1 |  |
| 100 | chr_mid_legacy | 风流遗产 | 配合传记 | +1 |  |
| 101 | harvest_festival | 丰收祭典 | 参加各项比赛 | +1 |  |
| 102 | chr_mid_health_wake | 身体的警告 | 痛改前非 | +1 |  |
| 103 | mid_found_school | 开宗立派 | 门庭若市 | +1 | ✅ |
| 104 | mid_body_decline | 岁月的痕迹 | 接受现实 | -9 |  |
| 105 | mid_dwarf_name_in_hall | 名字刻上石厅 | 把作品名刻在自己名前面 | +1 |  |
| 106 | int_legend_final_truth | 世界之书 | 前往世界的尽头 | +1 |  |
| 107 | mana_overflow | 魔力暴走 | 冷静控制 | +1 |  |
| 108 | elder_autobiography | 自传 | 欣然同意 | +1 |  |
| 109 | elder_kingdom_crisis | 王国危机 | 挺身而出 | +1 | ✅ |
| 110 | disciple_comes | 收徒传艺 | 收下这个弟子 | +1 |  |
| 111 | elder_memoir | 撰写回忆录 | 传世之作 | +1 | ✅ |
| 112 | elder_disciple_visit | 故徒来访 | 感念师恩 | +10 |  |
| 113 | old_rival | 老对手来访 | 热情招待 | 0 |  |
| 114 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -10 | ✅ |
| 115 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | 0 |  |
| 116 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | 0 |  |
| 117 | mag_elder_grimoire | 传世魔导书 | 传给弟子 | 0 |  |
| 118 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | 0 |  |
| 119 | elder_last_adventure | 不服老的冒险 | 出发！ | 0 | ✅ |
| 120 | int_legend_epilogue_teacher | 最后的课 | 传授所有知识，包括禁忌 | 0 |  |
| 121 | str_7_epitaph | 墓志铭 |  | 0 |  |
| 122 | elder_passing_wisdom | 智者之言 |  | 0 |  |
| 123 | elder_garden_peace | 花园时光 |  | 0 |  |
| 124 | retirement | 挂剑归隐 | 归隐山林 | +8 |  |
| 125 | mid_dwarf_apprentice_oath | 轮到你收徒了 | 先把规矩立得很严 | -1 |  |
| 126 | elder_frail | 风烛残年 | 安享晚年 | -16 |  |
| 127 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | -1 |  |
| 128 | spr_elder_final_wisdom | 最后的智慧 | 传授给后人 | -1 |  |
| 129 | legend_spread | 传说的传播 | 享受名声 | -1 |  |
| 130 | elder_old_enemy | 昔日的对手 | 去见他 | -1 |  |
| 131 | SPR_p6_final_truth | 最后的真相 | 写下一切 | -1 |  |
| 132 | spr_elder_transcendence | 超凡觉醒 | 飞升 | -1 |  |
| 133 | elder_sunset_watching | 夕阳 |  | -1 |  |
| 134 | mag_elder_mana_dissolve | 魔力的消散 | 欣然接受 | -2 |  |
| 135 | elder_legacy_gift | 传家之宝 | 传给有缘人 | -2 |  |
| 136 | SPR_p7_departure | 灵魂离体 | 平静离世 | -2 |  |
| 137 | chr_elder_finale | 花花公子的终章 | 儿孙满堂 | -2 |  |
| 138 | elder_final_gift | 最后的礼物 |  | -2 |  |
| 139 | aging_dwarf_beard | 花白的胡须 |  | -5 |  |
| 140 | mag_elder_last_spell | 最后的咒语 | 释放法术 | -2 |  |
| 141 | elder_unexpected_visitor | 意外的来访者 |  | -2 |  |
| 142 | random_stargazing | 观星 |  | -3 |  |
| 143 | chr_elder_regret | 月光下的回忆 | 释然接受 | -3 |  |
| 144 | elder_feast_missing_names | 席间空位 | 为他们举杯 | -3 |  |
| 145 | peaceful_end | 平静的终章 |  | -3 |  |
| 146 | MAG_p7_final_spell | 最后的魔法 | 守护之盾 | -3 |  |
| 147 | random_good_meal | 丰盛的一餐 |  | -3 |  |
| 148 | random_found_coin | 捡到硬币 |  | -3 |  |
| 149 | elder_final_illness | 最后的病榻 | 积极治疗 | -28 | ❌ |

### 6. 矮人-女-B (seed=8006)

- 种族: dwarf | 性别: female
- 寿命: 171/176 | 评级: SS 不朽传说 | 分数: 999.7
- 初始HP: 61 | 事件数: 167 | 平凡年: 4
- 成就: 51 个 [first_step, ten_lives, chr_social_star, soul_pure, dwarf_dragon_vow_ach, int_learned_scholar, str_iron_body, beauty_supreme, chr_irresistible, wisdom_peak, mny_comfortable_life, scholar_warrior, iron_body, dwarf_surface_broker, int_omniscient, merchant_empire, wealth_peak, widowed_hero, centenarian, longevity, revenge_done, archmage_ach, female_archmage, master_of_all, mag_arcane_adept, str_body_of_legend, dwarf_holdfast_ach, legacy_master, tower_master_ach, archmage_body, legacy_of_students, famous_author_ach, lucky_star, luk_charmed_life, undying_legend_ach, dwarf_hall_name, peaceful_ending, eternal_peace, ascended_ach, mag_reality_warper, memories_in_hands, hero_ach, dwarf_dragonfire_legacy, dwarf_long_watch, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness]
- 路线: on_merchant_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_eclipse | 日蚀之日 |  | +5 |  |
| 2 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +1 |  |
| 3 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | 0 |  |
| 4 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | 0 |  |
| 5 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | 0 |  |
| 6 | steal_sweets | 偷吃糖果 | 老实道歉 | 0 |  |
| 7 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | 0 |  |
| 8 | SPR_p1_animal_whisper | 动物的话 | 与动物亲近 | 0 |  |
| 9 | spr_child_night_terror | 夜半惊魂 | 面对恐惧 | 0 |  |
| 10 | grandma_recipes | 奶奶的秘方 | 认真学习 | +3 |  |
| 11 | spr_child_animal_whisper | 动物的低语 | 跟着猫走 | -7 |  |
| 12 | SPR_p1_night_vision | 暗夜之眼 | 观察光芒 | 0 |  |
| 13 | child_strength_training | 跟着猎人锻炼 | 坚持下来 | 0 |  |
| 14 | str_1_playground_bully | 操场霸凌 | 挺身而出 | +2 |  |
| 15 | str_1_climbing_tree | 爬树冠军 | 徒手攀登 | +5 |  |
| 16 | int_child_village_sage | 村里的老学究 | 拜师学艺 | +5 |  |
| 17 | chr_childhood_favorite | 老师的心头好 | 察言观色 | +5 |  |
| 18 | random_weather_blessing | 好天气 |  | +5 |  |
| 19 | river_fishing | 河边抓鱼 | 耐心等待 | +5 |  |
| 20 | star_gazing | 观星 | 冥想 | 0 |  |
| 21 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 22 | teen_dwarf_dragon_relic_vigil | 守望龙族旧迹 | 向遗迹行最庄重的礼 | 0 |  |
| 23 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 24 | wander_market | 逛集市 | 买了一本旧书 | +3 |  |
| 25 | teen_race_competition | 少年竞技会 | 参加跑步 | 0 |  |
| 26 | int_youth_ruins_exploration | 古代遗迹的诱惑 | 组队探索 | +5 |  |
| 27 | str_2_guard_duty | 守夜人招募 | 加入守卫队 | +5 |  |
| 28 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +5 |  |
| 29 | chr_teen_popularity | 校园偶像 | 广交朋友 | +5 |  |
| 30 | chr_teen_first_love | 初恋 | 全心投入 | +3 |  |
| 31 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | 0 |  |
| 32 | first_love | 初恋的味道 | 表白 | -10 | ✅ |
| 33 | int_young_mentor_test | 导师的考验 | 用常规方法解答 | 0 |  |
| 34 | traveling_sage | 云游学者 | 跟随学者学习 | 0 |  |
| 35 | cryptic_manuscript | 神秘手稿 | 花时间破译 | 0 |  |
| 36 | int_invention | 奇思妙想 | 动手制造 | 0 | ✅ |
| 37 | random_good_meal | 丰盛的一餐 |  | -6 |  |
| 38 | youth_field_medic_training | 战场急救术 | 认真学 | 0 |  |
| 39 | quest_parting | 远征前的告别 | 系上护身符 | 0 |  |
| 40 | random_minor_injury | 小伤 |  | -1 |  |
| 41 | tavern_brawl | 酒馆斗殴 | 加入混战 | -14 |  |
| 42 | chr_youth_love_triangle | 三角困局 | 选择安稳 | +5 |  |
| 43 | chr_youth_heartbreak | 被抛弃 | 深刻反思 | +5 |  |
| 44 | dating_start | 开始交往 | 正式告白 | +5 |  |
| 45 | random_helping_stranger | 帮助陌生人 |  | +5 |  |
| 46 | luk_lottery | 王国彩票 | 中大奖了！ | +1 | ❌ |
| 47 | scholar_guidance | 学者收徒 | 拜师求教 | 0 |  |
| 48 | chr_youth_secret_lover | 秘密情人 | 悬崖勒马 | 0 |  |
| 49 | mny_adult_first_investment | 第一笔投资 | 投了 | 0 |  |
| 50 | lover_death_battlefield | 战场的噩耗 | 拿起剑复仇 | -15 |  |
| 51 | chr_youth_social_club | 名流圈子 | 如鱼得水 | +5 |  |
| 52 | str_4_war_breaks_out | 战争爆发 | 主动请战 | +4 |  |
| 53 | youth_dwarf_surface_caravan | 走一趟地表商路 | 硬记地表的路标 | +4 |  |
| 54 | merchant_career | 商路崛起 | 扩张商路 | +4 | ✅ |
| 55 | forbidden_love | 禁忌之恋 | 一起私奔 | -11 |  |
| 56 | chr_youth_casanova_peak | 风流浪子的巅峰 | 厌倦游戏 | +4 |  |
| 57 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +4 |  |
| 58 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +4 | ✅ |
| 59 | mid_gambling | 地下赌场 | 梭哈！ | +4 | ❌ |
| 60 | chr_yuth_fame_cost | 风流的代价 | 浪子回头 | +4 |  |
| 61 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +4 |  |
| 62 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | +4 |  |
| 63 | chain_dark_past | 黑暗过去 | 谈判 | +4 | ✅ |
| 64 | challenge_abyss | 深渊之门 | 走入深渊 | -6 | ✅ |
| 65 | chr_adult_settling_down | 安定还是流浪 | 扎根 | +4 |  |
| 66 | merchant_economic_crisis | 经济危机 | 抄底 | +3 | ✅ |
| 67 | mid_business_rivalry | 商战 | 智取胜过 | +3 | ✅ |
| 68 | business_venture | 创业冒险 | 大胆投资 | +1 |  |
| 69 | adult_teaching_offer | 教学邀请 | 欣然接受 | -1 |  |
| 70 | str_5_guardian_oath | 守护者的誓言 | 重建村庄 | 0 |  |
| 71 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | -1 |  |
| 72 | merchant_auction | 稀有拍卖会 | 竞拍神器 | 0 | ❌ |
| 73 | aging_hint_early | 岁月的痕迹 |  | -3 |  |
| 74 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | +2 | ✅ |
| 75 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | 0 |  |
| 76 | mny_tax_crisis | 税务危机 | 偷税漏税 | -1 | ✅ |
| 77 | mid_adopt_orphan | 路边孤儿 | 带回家 | 0 |  |
| 78 | avenger_trail | 复仇的线索 | 顺藤摸瓜 | -4 |  |
| 79 | merchant_guild | 商行 | 创业！ | +2 | ✅ |
| 80 | challenge_final_boss | 魔王降临 | 直面魔王 | -35 | ❌ |
| 81 | mny_mid_commercial_war_fleet | 远洋贸易 | 亲自率队 | +2 |  |
| 82 | avenger_confrontation | 仇人见面 | 手刃仇人 | -8 | ✅ |
| 83 | old_rival | 老对手来访 | 热情招待 | +2 |  |
| 84 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +2 |  |
| 85 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +2 |  |
| 86 | SPR_p5_teaching_burden | 传授的困境 | 全部传授 | +2 |  |
| 87 | mid_heir_training | 培养继承人 | 青出于蓝 | +2 | ✅ |
| 88 | mid_old_enemy | 旧敌来访 | 正面迎战 | +2 | ✅ |
| 89 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | +2 |  |
| 90 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -13 |  |
| 91 | str_6_fortress_builder | 钢铁堡垒 | 守护到最后 | +2 |  |
| 92 | mny_trade_route | 丝绸之路 | 谈判 | -4 | ✅ |
| 93 | str_6_legendary_battle | 最后一战 | 正面迎战 | +1 |  |
| 94 | adult_dwarf_hold_alarm | 要塞警报 | 扛盾守住最窄的入口 | -1 |  |
| 95 | arena_champion_invite | 竞技场的邀请 | 参加比赛 | +1 |  |
| 96 | teaching_others | 传授经验 | 认真教学 | +1 |  |
| 97 | int_master_dimensional_insight | 维度之悟 | 深入探索，寻找设计者 | +1 |  |
| 98 | chr_mid_ghosts | 过去的幽灵 | 承担责任 | +1 |  |
| 99 | disciple_comes | 收徒传艺 | 收下这个弟子 | +1 |  |
| 100 | mid_garden_retirement | 后院花园 | 在花园中冥想 | +1 |  |
| 101 | legacy_question | 传承之问 | 倾囊相授 | +1 |  |
| 102 | mag_mid_legacy_tower | 建造魔导塔 | 建在高处 | +1 |  |
| 103 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +1 |  |
| 104 | mag_mid_magic_decay | 魔力衰退的征兆 | 加强修炼 | +1 |  |
| 105 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +1 |  |
| 106 | mid_found_school | 开宗立派 | 门庭若市 | +1 | ✅ |
| 107 | mid_dwarf_apprentice_oath | 轮到你收徒了 | 先把规矩立得很严 | +1 |  |
| 108 | mid_health_scare | 健康警报 | 去找治疗师 | -1 |  |
| 109 | mid_life_reflection | 人生回顾 |  | +1 |  |
| 110 | elder_unexpected_visitor | 意外的来访者 |  | +1 |  |
| 111 | mid_natural_disaster | 天灾 | 组织救援 | +1 |  |
| 112 | elder_old_letters | 旧日书信 |  | +1 |  |
| 113 | elder_legacy_gift | 传家之宝 | 传给有缘人 | +1 |  |
| 114 | rare_gods_gift | 神之恩赐 | 接受神力 | +21 |  |
| 115 | elder_disciple_visit | 故徒来访 | 感念师恩 | +11 |  |
| 116 | elder_memoir | 撰写回忆录 | 传世之作 | +1 | ✅ |
| 117 | str_7_last_stand | 最后一道防线 | 死守不退 | -24 |  |
| 118 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | +1 |  |
| 119 | elder_last_adventure | 不服老的冒险 | 出发！ | +1 | ✅ |
| 120 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | +1 |  |
| 121 | aging_hint_late | 生命的黄昏 |  | -4 |  |
| 122 | elder_last_journey | 最后的旅途 | 去海边看日出 | +1 |  |
| 123 | random_found_coin | 捡到硬币 |  | 0 |  |
| 124 | mid_dwarf_name_in_hall | 名字刻上石厅 | 把作品名刻在自己名前面 | 0 |  |
| 125 | elder_kingdom_crisis | 王国危机 | 挺身而出 | 0 | ✅ |
| 126 | random_street_performance | 街头表演 |  | 0 |  |
| 127 | elder_passing_wisdom | 智者之言 |  | 0 |  |
| 128 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | 0 |  |
| 129 | spr_elder_final_wisdom | 最后的智慧 | 传授给后人 | 0 |  |
| 130 | aging_hint_mid | 力不从心 | 坦然接受 | -3 |  |
| 131 | elder_feast_missing_names | 席间空位 | 为他们举杯 | 0 |  |
| 132 | mag_elder_grimoire | 传世魔导书 | 传给弟子 | 0 |  |
| 133 | retirement | 挂剑归隐 | 归隐山林 | +8 |  |
| 134 | mag_elder_last_spell | 最后的咒语 | 释放法术 | 0 |  |
| 135 | chr_elder_regret | 月光下的回忆 | 释然接受 | 0 |  |
| 136 | elder_miracle_recovery | 奇迹般的康复 |  | +4 |  |
| 137 | SPR_p6_final_truth | 最后的真相 | 写下一切 | -1 |  |
| 138 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -11 | ✅ |
| 139 | elder_family_reunion | 天伦之乐 | 其乐融融 | +14 |  |
| 140 | legend_spread | 传说的传播 | 享受名声 | -6 |  |
| 141 | elder_frail | 风烛残年 | 安享晚年 | -16 |  |
| 142 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | -1 |  |
| 143 | chr_elder_finale | 花花公子的终章 | 儿孙满堂 | -1 |  |
| 144 | elder_autobiography | 自传 | 欣然同意 | -1 |  |
| 145 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +9 |  |
| 146 | elder_final_gift | 最后的礼物 |  | -1 |  |
| 147 | aging_dwarf_beard | 花白的胡须 |  | -5 |  |
| 148 | elder_garden_peace | 花园时光 |  | -2 |  |
| 149 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | -2 |  |
| 150 | MAG_p7_final_spell | 最后的魔法 | 守护之盾 | -2 |  |
| 151 | elder_dwarf_last_inspection | 最后一次巡炉 | 亲手补上最后一锤 | -2 |  |
| 152 | spr_elder_transcendence | 超凡觉醒 | 飞升 | -2 |  |
| 153 | elder_last_feast | 最后的盛宴 | 发表感言 | -2 |  |
| 154 | elder_dream_fulfilled | 完成心愿 |  | -2 |  |
| 155 | mag_elder_mana_dissolve | 魔力的消散 | 欣然接受 | -2 |  |
| 156 | SPR_p7_departure | 灵魂离体 | 平静离世 | -3 |  |
| 157 | str_7_epitaph | 墓志铭 |  | -3 |  |
| 158 | peaceful_end | 平静的终章 |  | -3 |  |
| 159 | random_rainy_contemplation | 雨中沉思 |  | -3 |  |
| 160 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | -3 |  |
| 161 | elder_legend_verified | 传说被验证 | 接受荣誉 | -3 |  |
| 162 | elder_dwarf_dragonfire_watch | 守着旧龙火的人 | 继续像祖辈那样守着 | -3 |  |
| 163 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | -4 |  |
| 164 | elder_star_gazing_final | 最后的星空 | 内心平静 | -4 |  |
| 165 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | -4 |  |
| 170 | elder_world_peace | 和平降临 | 退休享受 | -5 |  |
| 171 | elder_final_illness | 最后的病榻 | 积极治疗 | -31 | ❌ |

### 7. 哥布林-女-A (seed=8007)

- 种族: goblin | 性别: female
- 寿命: 29/35 | 评级: S 传奇人生 | 分数: 282
- 初始HP: 46 | 事件数: 29 | 平凡年: 0
- 成就: 9 个 [first_step, ten_lives, int_learned_scholar, wisdom_peak, merchant_empire, chr_social_star, int_omniscient, era_remembered, legendary_epilogue]
- 路线: on_merchant_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_common | 平民之子 |  | +4 |  |
| 2 | childhood_hide_seek | 捉迷藏 | 藏得太好没人找到 | +4 |  |
| 3 | int_child_early_curiosity | 无尽的好奇心 | 追问到底 | +4 |  |
| 4 | str_1_farm_work | 农场苦力 | 拼命干活 | +7 |  |
| 5 | goblin_human_toy | 人类的玩具 |  | +4 |  |
| 6 | str_2_street_fight | 街头斗殴 | 一拳定胜负 | +4 |  |
| 7 | chr_teen_dance | 星夜舞会 | 选择青梅 | +4 |  |
| 8 | merchant_apprentice | 商人的嗅觉 | 拜师学商 | +4 |  |
| 9 | mny_inherit_uncle | 叔父遗产 | 接受遗产 | +4 |  |
| 10 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | +1 | ✅ |
| 11 | goblin_forge_trick | 炉火的恶作剧 | 改良设计 | 0 |  |
| 12 | random_weather_blessing | 好天气 |  | 0 |  |
| 13 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 14 | int_scholar_forbidden_ritual | 禁忌的召唤 | 执行仪式 | -11 |  |
| 15 | goblin_human_language_teen | 偷学人类语言 |  | 0 |  |
| 16 | goblin_human_kindness | 人类的善意 |  | 0 |  |
| 17 | adult_rival_encounter | 宿敌重逢 | 友好地叙旧 | 0 |  |
| 18 | cryptic_manuscript | 神秘手稿 | 花时间破译 | 0 |  |
| 19 | teaching_others | 传授经验 | 认真教学 | 0 |  |
| 20 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 21 | mid_property_acquisition | 置办产业 | 买一栋城镇宅邸 | -1 |  |
| 22 | merchant_career | 商路崛起 | 扩张商路 | -2 | ✅ |
| 23 | goblin_mechanical_genius | 机关天赋 | 跟矮人学习机械 | -5 |  |
| 24 | goblin_elder_wisdom | 老哥布林的智慧 |  | -7 |  |
| 25 | mid_legacy_project | 留下遗产 | 写一本书 | -9 |  |
| 26 | goblin_rescue_mission | 营救同胞 | 正面突袭 | -13 | ✅ |
| 27 | goblin_mine_discovery | 矿脉发现 |  | -16 |  |
| 28 | goblin_legacy_hoard | 传家宝库 | 设置机关保护 | -16 |  |
| 29 | elder_illness | 疾病缠身 | 积极治疗 | -6 | ❌ |

### 8. 哥布林-男-B (seed=8008)

- 种族: goblin | 性别: male
- 寿命: 26/35 | 评级: A 声名远扬 | 分数: 216.6
- 初始HP: 31 | 事件数: 26 | 平凡年: 0
- 成就: 10 个 [first_step, ten_lives, lucky_star, luk_charmed_life, mny_comfortable_life, int_learned_scholar, school_founder_ach, goblin_school_ach, chr_social_star, fortune_smile_final]
- 路线: 无
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_goblin_sewer | 下水道新生 |  | +2 |  |
| 2 | child_swimming_lesson | 学游泳 | 认真学习 | +2 |  |
| 3 | int_child_early_curiosity | 无尽的好奇心 | 追问到底 | +2 |  |
| 4 | str_1_farm_work | 农场苦力 | 拼命干活 | +5 |  |
| 5 | random_found_coin | 捡到硬币 |  | +2 |  |
| 6 | luk_lucky_coin | 捡到金币 | 收起来 | +2 |  |
| 7 | first_love | 初恋的味道 | 表白 | +2 | ❌ |
| 8 | teen_future_talk | 夜谈未来 | 认真说出愿望 | +2 |  |
| 9 | random_minor_injury | 小伤 |  | +1 |  |
| 10 | luk_adult_black_cat | 黑猫横路 | 跟着黑猫走 | +2 |  |
| 11 | food_culture | 美食之旅 | 学习烹饪 | 0 |  |
| 12 | luk_mid_fortune_wheel | 命运转盘 | 转一把 | -1 |  |
| 13 | goblin_human_kindness | 人类的善意 |  | -1 |  |
| 14 | goblin_rat_race | 洞鼠竞速 | 玩命冲刺 | -1 | ✅ |
| 15 | mid_natural_disaster | 天灾 | 组织救援 | -2 |  |
| 16 | goblin_first_boss_fight | 挑战头领 | 正面挑战 | -2 | ✅ |
| 17 | gambling_night | 赌场之夜 | 放手一搏 | -2 |  |
| 18 | goblin_disguise_adventure | 伪装冒险 | 小心翼翼不露馅 | -2 |  |
| 19 | goblin_trade_empire | 哥布林的黑市王国 | 扩大经营——开设地下拍卖行 | -2 | ❌ |
| 20 | aging_hint_mid | 力不从心 | 坦然接受 | -5 |  |
| 21 | goblin_rescue_mission | 营救同胞 | 正面突袭 | -3 | ✅ |
| 22 | goblin_poison_master | 毒药大师 |  | -4 |  |
| 23 | student_successor | 收徒传艺 | 严格教导 | -6 |  |
| 24 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | -9 |  |
| 25 | random_weather_blessing | 好天气 |  | -11 |  |
| 26 | goblin_school_founder | 哥布林学校 |  | -2 |  |

### 9. 兽人-男-A (seed=8009)

- 种族: beastfolk | 性别: male
- 寿命: 51/62 | 评级: SS 不朽传说 | 分数: 401.5
- 初始HP: 61 | 事件数: 51 | 平凡年: 0
- 成就: 16 个 [first_step, ten_lives, mny_comfortable_life, chr_social_star, wealth_peak, int_learned_scholar, merchant_empire, beauty_supreme, male_beauty, chr_irresistible, soul_pure, wisdom_peak, legacy_of_students, era_remembered, legendary_epilogue, immortal_epilogue]
- 路线: on_merchant_path
- 物品: 1 个 [soul_gem]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_noble | 降生贵族 |  | +5 |  |
| 2 | SPR_p1_animal_whisper | 动物的话 | 与动物亲近 | +5 |  |
| 3 | SPR_p1_night_vision | 暗夜之眼 | 观察光芒 | +2 |  |
| 4 | grandma_recipes | 奶奶的秘方 | 认真学习 | 0 |  |
| 5 | SPR_p2_shrine_calling | 神殿的召唤 | 入神殿修行 | -6 |  |
| 6 | int_child_village_sage | 村里的老学究 | 拜师学艺 | -7 |  |
| 7 | luk_youth_dice_roll | 命运骰子 | 买下来掷 | 0 |  |
| 8 | young_rival | 少年的对手 | 努力超越他 | 0 |  |
| 9 | teen_secret_discovered | 发现秘密 | 公开揭发 | +5 |  |
| 10 | mny_youth_first_trade | 第一笔生意 | 进货倒卖 | +2 |  |
| 11 | mny_youth_apprentice | 商人学徒 | 拜师学艺 | 0 |  |
| 12 | luk_lucky_coin | 捡到金币 | 收起来 | 0 |  |
| 13 | cursed_wanderer_wandering | 流亡之路 | 咬牙坚持 | 0 |  |
| 14 | random_minor_injury | 小伤 |  | +4 |  |
| 15 | chr_youth_love_triangle | 三角困局 | 选择安稳 | +2 |  |
| 16 | love_at_first_sight | 一见钟情 | 上前搭讪 | 0 | ✅ |
| 17 | chr_youth_social_club | 名流圈子 | 如鱼得水 | 0 |  |
| 18 | chr_youth_secret_lover | 秘密情人 | 悬崖勒马 | 0 |  |
| 19 | merchant_guild | 商行 | 创业！ | 0 | ✅ |
| 20 | adult_teaching_offer | 教学邀请 | 欣然接受 | -3 |  |
| 21 | aging_hint_early | 岁月的痕迹 |  | -2 |  |
| 22 | merchant_career | 商路崛起 | 扩张商路 | +2 | ✅ |
| 23 | mny_mid_tax_evasion | 税务官来了 | 补缴税款 | -7 |  |
| 24 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | 0 |  |
| 25 | chr_adult_reputation_crisis | 绯闻风暴 | 法律维权 | -1 |  |
| 26 | mny_tax_crisis | 税务危机 | 偷税漏税 | -1 | ✅ |
| 27 | mid_gambling | 地下赌场 | 梭哈！ | 0 | ✅ |
| 28 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | -1 |  |
| 29 | midlife_new_craft | 半路学艺 | 学点能打动人的 | 0 |  |
| 30 | mid_business_rivalry | 商战 | 智取胜过 | -1 | ✅ |
| 31 | merchant_economic_crisis | 经济危机 | 抄底 | 0 | ❌ |
| 32 | war_breaks_out | 战争爆发 | 上前线 | -21 | ❌ |
| 33 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +1 |  |
| 34 | chr_mid_mature_charm | 成熟的魅力 | 传道授业 | +1 |  |
| 35 | mid_legacy_project | 留下遗产 | 写一本书 | +1 |  |
| 36 | mny_trade_route | 丝绸之路 | 谈判 | +1 | ❌ |
| 37 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +11 |  |
| 38 | cryptic_manuscript | 神秘手稿 | 花时间破译 | +1 |  |
| 39 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | 0 |  |
| 40 | elder_dream_fulfilled | 完成心愿 |  | 0 |  |
| 41 | elder_disciple_visit | 故徒来访 | 感念师恩 | +10 |  |
| 42 | mid_natural_disaster | 天灾 | 组织救援 | -4 |  |
| 43 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -21 | ❌ |
| 44 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -27 | ❌ |
| 45 | int_legend_epilogue_teacher | 最后的课 | 传授所有知识，包括禁忌 | +6 |  |
| 46 | elder_last_journey | 最后的旅途 | 去海边看日出 | +5 |  |
| 47 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | +5 |  |
| 48 | retirement | 挂剑归隐 | 归隐山林 | +12 |  |
| 49 | mny_elder_business_legacy | 商业遗产 | 传给子女 | -5 |  |
| 50 | elder_illness | 疾病缠身 | 积极治疗 | -29 | ✅ |
| 51 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | -6 |  |

### 10. 兽人-女-B (seed=8010)

- 种族: beastfolk | 性别: female
- 寿命: 58/62 | 评级: SS 不朽传说 | 分数: 453.3
- 初始HP: 64 | 事件数: 58 | 平凡年: 0
- 成就: 14 个 [first_step, ten_lives, chr_social_star, beauty_supreme, chr_irresistible, soul_pure, mny_comfortable_life, int_learned_scholar, healer_path, famous_author_ach, era_remembered, legendary_epilogue, immortal_epilogue, miracle_afterglow]
- 路线: on_adventurer_path, on_scholar_path
- 物品: 0 个 []

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_noble | 降生贵族 |  | +5 |  |
| 2 | childhood_play | 村口的泥巴大战 | 当孩子王 | +4 |  |
| 3 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | +4 |  |
| 4 | river_fishing | 河边抓鱼 | 耐心等待 | 0 |  |
| 5 | chr_childhood_friendzone | 青梅竹马 | 两小无猜 | -7 |  |
| 6 | chr_childhood_favorite | 老师的心头好 | 察言观色 | 0 |  |
| 7 | str_1_playground_bully | 操场霸凌 | 挺身而出 | -3 |  |
| 8 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | +5 |  |
| 9 | teen_library_discovery | 图书馆的秘密阁楼 | 沉浸在故事中 | +5 |  |
| 10 | chr_teen_secret_admirer | 暗恋者的目光 | 主动靠近 | +5 |  |
| 11 | wander_market | 逛集市 | 买了一本旧书 | +4 |  |
| 12 | chr_public_speech | 广场演说 | 慷慨陈词 | 0 | ❌ |
| 13 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | 0 |  |
| 14 | chr_youth_love_triangle | 三角困局 | 选择安稳 | 0 |  |
| 15 | guild_join | 加入冒险者公会 | 加入公会 | 0 |  |
| 16 | first_quest | 第一个委托 | 认真完成 | -1 | ✅ |
| 17 | first_love | 初恋的味道 | 表白 | +4 | ✅ |
| 18 | pirate_attack | 海盗袭击 | 奋起反击 | -6 |  |
| 19 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +4 |  |
| 20 | adv_uncharted | 未踏之地 | 出发 | -1 | ✅ |
| 21 | luk_adult_black_cat | 黑猫横路 | 跟着黑猫走 | +3 |  |
| 22 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +3 |  |
| 23 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | +3 |  |
| 24 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | +3 |  |
| 25 | mid_adopt_orphan | 路边孤儿 | 带回家 | +2 |  |
| 26 | adv_bounty | 高价悬赏 | 接任务 | -30 | ❌ |
| 27 | mercenary_contract | 佣兵合同 | 忠诚完成合同 | +2 |  |
| 28 | student_successor | 收徒传艺 | 严格教导 | +2 |  |
| 29 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +2 |  |
| 30 | community_leader | 社区领袖 | 接受职位 | +1 |  |
| 31 | random_weather_blessing | 好天气 |  | +1 |  |
| 32 | disciple_comes | 收徒传艺 | 收下这个弟子 | +1 |  |
| 33 | chr_mid_legacy | 风流遗产 | 配合传记 | +1 |  |
| 34 | write_a_book | 著书立说 | 倾注心血写一本好书 | +1 |  |
| 35 | chr_mid_ex_return | 前任的来信 | 回信释然 | +1 |  |
| 36 | masterpiece_craft | 制作杰作 | 全力以赴 | +1 |  |
| 37 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +1 |  |
| 38 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | -14 |  |
| 39 | mid_found_school | 开宗立派 | 门庭若市 | 0 | ✅ |
| 40 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | 0 |  |
| 41 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +10 |  |
| 42 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | -3 |  |
| 43 | elder_garden_peace | 花园时光 |  | -1 |  |
| 44 | elder_disciple_visit | 故徒来访 | 感念师恩 | +8 |  |
| 45 | elder_passing_wisdom | 智者之言 |  | -10 |  |
| 46 | random_minor_injury | 小伤 |  | -4 |  |
| 47 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | -3 |  |
| 48 | aging_hint_early | 岁月的痕迹 |  | -6 |  |
| 49 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | -5 |  |
| 50 | elder_frail | 风烛残年 | 安享晚年 | -20 |  |
| 51 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -6 | ✅ |
| 52 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +3 |  |
| 53 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | -8 |  |
| 54 | elder_sunset_watching | 夕阳 |  | -9 |  |
| 55 | SPR_p7_departure | 灵魂离体 | 平静离世 | +5 |  |
| 56 | MAG_p7_final_spell | 最后的魔法 | 守护之盾 | -6 |  |
| 57 | elder_unexpected_visitor | 意外的来访者 |  | +8 |  |
| 58 | elder_memoir | 撰写回忆录 | 传世之作 | -23 | ✅ |

### 11. 海精灵-女-A (seed=8011)

- 种族: seaelf | 性别: female
- 寿命: 79/450 | 评级: SS 不朽传说 | 分数: 489.8
- 初始HP: 31 | 事件数: 78 | 平凡年: 1
- 成就: 21 个 [first_step, ten_lives, chr_social_star, beauty_supreme, chr_irresistible, int_learned_scholar, mag_arcane_adept, wisdom_peak, mage_path, archmage_body, int_omniscient, mag_reality_warper, soul_pure, fairy_companion, love_and_war, war_hero_ach, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, arcane_reserve_final]
- 路线: on_mage_path
- 物品: 1 个 [crystal_shard]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_eclipse | 日蚀之日 |  | +1 |  |
| 2 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | +1 |  |
| 3 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +1 |  |
| 4 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | 0 |  |
| 6 | bullied | 被大孩子欺负 | 忍气吞声 | 0 |  |
| 7 | MAG_p1_mana_awakening | 魔力涌动 | 压抑魔力 | 0 |  |
| 8 | stray_dog | 流浪狗 | 带它回家 | 0 |  |
| 9 | child_stray_animal | 收养流浪动物 | 带回家照顾 | 0 |  |
| 10 | int_child_early_curiosity | 无尽的好奇心 | 追问到底 | 0 |  |
| 11 | spr_child_animal_whisper | 动物的低语 | 跟着猫走 | 0 |  |
| 12 | village_festival | 村里祭典 | 大吃特吃 | 0 |  |
| 13 | chr_childhood_leader | 孩子王 | 公允之主 | -4 |  |
| 14 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | 0 |  |
| 15 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 16 | bullied_repeat | 他们又来了 | 继续忍耐 | 0 |  |
| 17 | first_competition | 第一次比赛 | 拼尽全力 | 0 | ❌ |
| 18 | childhood_pet | 捡到受伤小鸟 | 带回家照顾 | +1 |  |
| 19 | young_rival | 少年的对手 | 努力超越他 | +1 |  |
| 20 | random_helping_stranger | 帮助陌生人 |  | +1 |  |
| 21 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +1 |  |
| 22 | village_feud | 村长之争 | 帮弱者说话 | +1 |  |
| 23 | steal_sweets | 偷吃糖果 | 老实道歉 | +1 |  |
| 24 | bullied_fight_back | 反击！ | 直接动手 | +1 | ✅ |
| 25 | star_gazing | 观星 | 冥想 | +1 |  |
| 26 | teen_secret_discovered | 发现秘密 | 公开揭发 | +1 |  |
| 27 | int_youth_rivalry | 天才的竞争 | 以竞争为动力 | +1 |  |
| 28 | first_love | 初恋的味道 | 表白 | +1 | ✅ |
| 29 | mag_child_imaginary | 看不见的朋友 | 和它做朋友 | +1 |  |
| 30 | chr_teen_love_letter | 情书 | 追查写信人 | +1 |  |
| 31 | random_rainy_contemplation | 雨中沉思 |  | +1 |  |
| 32 | dating_start | 开始交往 | 正式告白 | +1 |  |
| 33 | mny_youth_savings | 存钱罐 | 继续存 | +1 |  |
| 34 | int_young_lore_trade | 地下知识交易 | 参与交换 | +1 |  |
| 35 | meteor_shower | 流星雨 | 许个愿 | +1 |  |
| 36 | int_invention | 奇思妙想 | 动手制造 | +1 | ❌ |
| 37 | dating_deepen | 感情升温 | 一起冒险 | +1 |  |
| 38 | magic_academy_enrollment | 魔法学院来信 | 入学 | +1 |  |
| 39 | MAG_p3_mentor_trial | 导师的试炼 | 完成调查 | +1 |  |
| 40 | chr_youth_secret_lover | 秘密情人 | 悬崖勒马 | +1 |  |
| 41 | forbidden_love | 禁忌之恋 | 一起私奔 | -14 |  |
| 42 | int_apprentice_expedition | 首次田野调查 | 细致入微地调查 | +1 |  |
| 43 | food_culture | 美食之旅 | 学习烹饪 | +1 |  |
| 44 | MAG_p3_mana_cost | 魔力的代价 | 寻求治疗 | +1 |  |
| 45 | street_performer | 街头表演 | 上去表演 | +1 |  |
| 46 | chr_youth_heartbreak | 被抛弃 | 深刻反思 | +1 |  |
| 47 | magic_graduate | 魔法学院毕业 | 继续深造研究 | +1 |  |
| 48 | int_apprentice_secret_teaching | 隐秘的传承 | 虚心学习 | +1 |  |
| 49 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +1 | ✅ |
| 50 | marry_adventurer | 与冒险者结婚 | 在一起 | +1 |  |
| 51 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -9 | ✅ |
| 52 | child_first_fight | 第一次打架 | 挥拳反击 | +1 |  |
| 53 | arcane_academy_invitation | 奥术学院的邀请 | 欣然前往 | +1 |  |
| 54 | magical_creature_tame | 驯服魔物 | 尝试驯服 | -9 |  |
| 55 | int_youth_academy_letter | 王立学院的录取通知 | 接受入学 | +1 |  |
| 56 | adult_first_child | 初为人父母 |  | +1 |  |
| 57 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +1 |  |
| 58 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +1 |  |
| 59 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +1 |  |
| 60 | family_dinner | 家庭晚餐 | 亲自下厨 | +1 |  |
| 61 | random_training_day | 勤奋的一天 | 训练体能 | +1 |  |
| 62 | random_stargazing | 观星 |  | +1 |  |
| 63 | lover_curse | 诅咒的代价 | 献祭寿命 | -14 |  |
| 64 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | +1 |  |
| 65 | luk_youth_winning_ticket | 神秘奖券 | 去兑奖 | +1 |  |
| 66 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | +1 |  |
| 67 | int_youth_street_bookseller | 流动书商的奇书 | 买下那本发光的书 | +1 |  |
| 68 | elemental_trial | 元素试炼 | 火之试炼 | -9 |  |
| 69 | marriage_anniversary | 结婚周年纪念 | 一起庆祝 | +1 |  |
| 70 | chr_adult_reputation_crisis | 绯闻风暴 | 法律维权 | +1 |  |
| 71 | mid_heir_training | 培养继承人 | 青出于蓝 | +1 | ✅ |
| 72 | rescue_from_dungeon | 深入魔窟的营救 | 独闯魔窟 | -14 |  |
| 73 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +1 |  |
| 74 | str_2_guard_duty | 守夜人招募 | 加入守卫队 | +1 |  |
| 75 | mag_teen_alley_magic | 巷子里的魔法 | 拜师学艺 | +1 |  |
| 76 | mana_overflow | 魔力暴走 | 冷静控制 | +1 |  |
| 77 | mage_magic_war | 魔法战争 | 参战 | -4 | ✅ |
| 78 | random_nightmare_visit | 不安的梦 |  | +1 |  |
| 79 | luk_potion_find | 神秘药水 | 一口闷！ | -11 | ❌ |

### 12. 海精灵-男-B (seed=8012)

- 种族: seaelf | 性别: male
- 寿命: 323/462 | 评级: SS 不朽传说 | 分数: 1262.5
- 初始HP: 37 | 事件数: 201 | 平凡年: 122
- 成就: 50 个 [first_step, ten_lives, soul_pure, chr_social_star, mag_arcane_adept, mage_path, beauty_supreme, male_beauty, str_iron_body, chr_irresistible, archmage_body, int_learned_scholar, war_hero_ach, mag_reality_warper, love_and_war, wisdom_peak, fairy_companion, longevity, scholar_warrior, cheated_death_ach, int_omniscient, archmage_ach, lucky_star, luk_charmed_life, mag_arcane_master, centenarian, master_of_all, mny_comfortable_life, iron_body, wealth_peak, tower_master_ach, famous_author_ach, legacy_master, elemental_lord_ach, school_founder_ach, dragon_knight, demon_king_slayer_ach, str_body_of_legend, divine_champion_ach, ascended_ach, healer_path, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, arcane_reserve_final, iron_will_to_end, fortune_smile_final, century_witness, miracle_afterglow]
- 路线: on_mage_path
- 物品: 1 个 [ancient_relic]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_wilderness | 荒野出生 | 萨满世家 | +3 |  |
| 2 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | +3 |  |
| 3 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | +3 |  |
| 4 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | +3 |  |
| 5 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +3 |  |
| 6 | spr_child_sight | 看见看不见的 | 跟影子说话 | +3 |  |
| 7 | MAG_p1_mana_awakening | 魔力涌动 | 压抑魔力 | +2 |  |
| 8 | spr_child_night_terror | 夜半惊魂 | 面对恐惧 | 0 |  |
| 9 | SPR_p1_dream_walk | 梦中行走 | 探索梦境 | +3 |  |
| 10 | village_festival | 村里祭典 | 大吃特吃 | 0 |  |
| 11 | MAG_p1_strange_dreams | 魔力之梦 | 跟随声音 | -3 |  |
| 12 | random_good_meal | 丰盛的一餐 |  | 0 |  |
| 13 | child_cooking_adventure | 第一次做饭 | 认真按步骤来 | 0 |  |
| 14 | magic_academy_letter | 魔法学院来信 | 入学就读 | 0 |  |
| 15 | str_1_playground_bully | 操场霸凌 | 挺身而出 | -3 |  |
| 16 | chr_childhood_leader | 孩子王 | 公允之主 | +3 |  |
| 17 | str_1_falling_ill | 大病一场 | 疯狂补回来 | +1 |  |
| 18 | child_strength_training | 跟着猎人锻炼 | 坚持下来 | +3 |  |
| 19 | MAG_p2_first_spell | 初次施法 | 火球术 | 0 |  |
| 20 | magic_graduate | 魔法学院毕业 | 继续深造研究 | +3 |  |
| 21 | childhood_play | 村口的泥巴大战 | 当孩子王 | +3 |  |
| 22 | young_rival | 少年的对手 | 努力超越他 | +3 |  |
| 23 | luk_child_lucky_find | 地上的亮闪闪 | 揣进口袋 | +3 |  |
| 24 | first_love | 初恋的味道 | 表白 | +3 | ✅ |
| 25 | teen_first_errand | 第一次独自办事 | 稳稳办妥 | +3 |  |
| 26 | chr_teen_love_letter | 情书 | 追查写信人 | +3 |  |
| 27 | spr_teen_ghost | 鬼魂 | 帮助它 | +3 |  |
| 28 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | +3 |  |
| 29 | teen_secret_discovered | 发现秘密 | 公开揭发 | +3 |  |
| 30 | steal_sweets | 偷吃糖果 | 老实道歉 | +3 |  |
| 31 | chr_teen_dance | 星夜舞会 | 选择青梅 | +3 |  |
| 32 | mny_child_market_day | 集市的诱惑 | 学着叫卖 | +3 |  |
| 33 | random_found_coin | 捡到硬币 |  | +3 |  |
| 34 | child_first_fight | 第一次打架 | 挥拳反击 | +3 |  |
| 35 | dating_start | 开始交往 | 正式告白 | +3 |  |
| 36 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | +3 |  |
| 37 | chr_youth_love_triangle | 三角困局 | 选择安稳 | +1 |  |
| 38 | mage_arcane_library | 禁忌魔法图书馆 | 偷偷阅读 | -25 | ❌ |
| 39 | chr_public_speech | 广场演说 | 慷慨陈词 | +3 | ✅ |
| 40 | SPR_p2_shrine_calling | 神殿的召唤 | 入神殿修行 | +3 |  |
| 41 | dating_deepen | 感情升温 | 一起冒险 | +3 |  |
| 42 | random_helping_stranger | 帮助陌生人 |  | +3 |  |
| 43 | forbidden_love | 禁忌之恋 | 一起私奔 | -12 |  |
| 44 | SPR_p3_truth_too_much | 真相的重量 | 选择沉默 | +3 |  |
| 45 | lost_treasure_map | 藏宝图碎片 | 仔细研究 | +3 |  |
| 46 | mag_elemental_fusion | 元素融合 | 尝试控制 | -26 | ❌ |
| 47 | chr_youth_secret_lover | 秘密情人 | 悬崖勒马 | +3 |  |
| 48 | MAG_p2_academy_letter | 魔法学院来信 | 入学就读 | +3 |  |
| 49 | mag_child_spark | 指尖的火花 | 再试一次 | +3 |  |
| 50 | mage_magic_war | 魔法战争 | 参战 | -2 | ✅ |
| 51 | magical_creature_tame | 驯服魔物 | 尝试驯服 | -7 |  |
| 52 | mana_overflow | 魔力暴走 | 冷静控制 | +3 |  |
| 53 | marry_adventurer | 与冒险者结婚 | 在一起 | +3 |  |
| 54 | spr_curse_breaker | 诅咒解除 | 尝试解除 | -20 | ❌ |
| 55 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +3 |  |
| 56 | chr_yuth_fame_cost | 风流的代价 | 浪子回头 | +3 |  |
| 57 | marriage_anniversary | 结婚周年纪念 | 一起庆祝 | +3 |  |
| 58 | int_scholar_political_trap | 学者的陷阱 | 周旋其中，借势而行 | +3 |  |
| 59 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +3 |  |
| 60 | lover_curse | 诅咒的代价 | 献祭寿命 | -12 |  |
| 61 | MAG_p2_bully_fight | 魔力冲突 | 用魔法反击 | +3 |  |
| 62 | random_street_performance | 街头表演 |  | +3 |  |
| 63 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 64 | mag_teen_overflow | 魔力暴走 | 拼命压制 | +3 |  |
| 65 | adult_first_child | 初为人父母 |  | +3 |  |
| 66 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -7 | ✅ |
| 67 | spr_dream_vision | 预知梦 | 认真对待 | +3 |  |
| 68 | chr_adult_old_flame | 旧情人重逢 | 克制祝福 | +3 |  |
| 69 | rescue_from_dungeon | 深入魔窟的营救 | 独闯魔窟 | -12 |  |
| 70 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | +3 |  |
| 71 | village_race | 村里赛跑 | 全力冲刺 | +3 |  |
| 72 | mid_heir_training | 培养继承人 | 青出于蓝 | +3 | ✅ |
| 73 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +3 |  |
| 74 | disciple_comes | 收徒传艺 | 收下这个弟子 | +3 |  |
| 75 | luk_youth_dice_roll | 命运骰子 | 买下来掷 | +3 |  |
| 76 | mag_teen_elemental_awakening | 元素觉醒 | 引导雷电 | +3 |  |
| 77 | mag_teen_alley_magic | 巷子里的魔法 | 拜师学艺 | +3 |  |
| 78 | divine_vision | 神谕 | 遵循神谕行事 | +3 |  |
| 79 | luk_youth_first_bet | 第一次赌局 | 小试牛刀 | +3 |  |
| 80 | spr_near_death | 濒死体验 | 挣扎求生 | -12 |  |
| 81 | mag_teen_potion_accident | 魔药事故 | 研究失败原因 | +3 |  |
| 82 | chr_teen_jealousy | 嫉妒的风暴 | 坦白心意 | +3 |  |
| 83 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +3 |  |
| 84 | chr_mid_ghosts | 过去的幽灵 | 承担责任 | +3 |  |
| 85 | int_young_specialization | 选择你的道路 | 元素魔法理论 | +3 |  |
| 86 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +3 |  |
| 87 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -12 |  |
| 88 | luk_lucky_coin | 捡到金币 | 收起来 | +3 |  |
| 89 | random_nightmare_visit | 不安的梦 |  | +3 |  |
| 90 | family_dinner | 家庭晚餐 | 亲自下厨 | +3 |  |
| 91 | mid_body_decline | 岁月的痕迹 | 接受现实 | -7 |  |
| 92 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +3 |  |
| 93 | aging_hint_late | 生命的黄昏 |  | -2 |  |
| 94 | luk_lottery | 王国彩票 | 中大奖了！ | +3 | ✅ |
| 95 | magic_duel | 学院决斗赛 | 全力应战 | -2 | ✅ |
| 96 | mid_found_school | 开宗立派 | 门庭若市 | +3 | ✅ |
| 97 | str_3_fortress_duty | 边境要塞 | 积极融入军营 | +3 |  |
| 98 | mid_natural_disaster | 天灾 | 组织救援 | +3 |  |
| 99 | random_stargazing | 观星 |  | +3 |  |
| 100 | chr_mid_mature_charm | 成熟的魅力 | 传道授业 | +3 |  |
| 101 | fairy_friend_return | 精灵的报恩 | 请求魔法祝福 | +8 |  |
| 102 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +13 |  |
| 103 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +3 |  |
| 104 | mid_adopt_orphan | 路边孤儿 | 带回家 | 0 |  |
| 105 | chr_youth_rejection | 拒绝的艺术 | 温柔拒绝 | -3 |  |
| 106 | mid_garden_retirement | 后院花园 | 在花园中冥想 | 0 |  |
| 107 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | 0 |  |
| 108 | int_apprentice_thesis | 毕业论文 | 写一篇安全但有深度的论文 | -10 |  |
| 109 | dark_mage_choice | 禁忌知识的召唤 | 翻开禁书 | 0 | ✅ |
| 110 | elder_family_reunion | 天伦之乐 | 其乐融融 | +15 |  |
| 111 | luk_mid_fortune_wheel | 命运转盘 | 转一把 | -15 |  |
| 112 | mid_legacy_project | 留下遗产 | 写一本书 | 0 |  |
| 113 | int_legend_epilogue_teacher | 最后的课 | 传授所有知识，包括禁忌 | 0 |  |
| 114 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 115 | mag_youth_ritual_mastery | 仪式精通 | 用于研究 | +3 |  |
| 116 | mag_youth_enchanted_forge | 魔导锻造 | 批量生产 | 0 |  |
| 117 | elder_last_adventure | 不服老的冒险 | 出发！ | -32 | ❌ |
| 118 | mny_adult_debt_collector | 讨债 | 暴力讨债 | +3 |  |
| 119 | str_4_war_breaks_out | 战争爆发 | 主动请战 | +3 |  |
| 120 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | +3 |  |
| 121 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | +3 |  |
| 122 | elder_legacy_gift | 传家之宝 | 传给有缘人 | +3 |  |
| 123 | mny_adult_first_investment | 第一笔投资 | 投了 | +3 |  |
| 124 | elder_disciple_visit | 故徒来访 | 感念师恩 | +13 |  |
| 125 | luk_adult_high_stakes | 豪赌之夜 | 梭哈 | +3 |  |
| 126 | luk_wild_encounter | 野外奇遇 | 探索洞穴 | -27 | ❌ |
| 127 | luk_adult_serendipity | 不期而遇 | 抓住机缘 | +3 |  |
| 128 | elder_passing_wisdom | 智者之言 |  | +3 |  |
| 129 | aging_hint_early | 岁月的痕迹 |  | +1 |  |
| 130 | luk_adult_lucky_business | 歪打正着 | 见好就收 | +3 |  |
| 131 | legend_spread | 传说的传播 | 享受名声 | +3 |  |
| 132 | elder_unexpected_visitor | 意外的来访者 |  | +3 |  |
| 133 | elder_frail | 风烛残年 | 安享晚年 | -12 |  |
| 134 | str_4_war_wound | 重伤 | 带伤上阵 | -22 |  |
| 135 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -7 | ✅ |
| 136 | aging_hint_mid | 力不从心 | 坦然接受 | 0 |  |
| 137 | mny_adult_charity_dilemma | 乞丐的手 | 慷慨解囊 | +3 |  |
| 138 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | +3 |  |
| 139 | mage_magic_tower | 法师塔 | 挑战塔主 | +3 | ✅ |
| 140 | elder_memoir | 撰写回忆录 | 传世之作 | +3 | ✅ |
| 141 | random_rainy_contemplation | 雨中沉思 |  | +3 |  |
| 142 | mag_finale_legacy_event | 魔导遗产 | 被尊为大师 | +2 |  |
| 143 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +2 |  |
| 144 | int_scholar_great_library | 大图书馆的钥匙 | 系统性地研究 | +2 |  |
| 145 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | +2 |  |
| 146 | str_7_epitaph | 墓志铭 |  | +2 |  |
| 147 | spr_elder_final_wisdom | 最后的智慧 | 传授给后人 | +2 |  |
| 148 | chr_elder_finale | 花花公子的终章 | 儿孙满堂 | +2 |  |
| 149 | lucky_coin_found | 幸运金币 |  | +2 |  |
| 150 | spr_adult_spirit_pact | 灵界契约 | 接受交易 | +2 |  |
| 151 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +2 |  |
| 152 | chr_elder_regret | 月光下的回忆 | 释然接受 | +2 |  |
| 153 | int_scholar_forbidden_ritual | 禁忌的召唤 | 执行仪式 | -8 |  |
| 154 | mag_adult_reality_bend | 扭曲现实 | 谨慎使用 | +2 |  |
| 155 | elder_garden_peace | 花园时光 |  | +2 |  |
| 156 | mny_mid_insider_trading | 内幕消息 | 利用消息 | +2 |  |
| 157 | luk_adult_black_cat | 黑猫横路 | 跟着黑猫走 | +2 |  |
| 158 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +2 | ✅ |
| 159 | elder_miracle_recovery | 奇迹般的康复 |  | +7 |  |
| 160 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +2 |  |
| 161 | peaceful_end | 平静的终章 |  | +2 |  |
| 162 | random_minor_injury | 小伤 |  | +1 |  |
| 163 | rare_reincarnation_hint | 前世记忆 | 接纳前世的自己 | +2 |  |
| 164 | mage_elemental_plane | 元素位面 | 吸收元素之力 | -8 | ✅ |
| 165 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | +2 |  |
| 166 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | +2 |  |
| 167 | mny_adult_market_boom | 牛市来临 | 全部抛售 | +2 |  |
| 168 | challenge_abyss | 深渊之门 | 走入深渊 | -8 | ✅ |
| 169 | mag_adult_forbidden_experiment | 禁忌实验 | 完成实验 | +2 |  |
| 170 | elder_world_peace | 和平降临 | 退休享受 | +2 |  |
| 171 | mag_adult_arcane_mastery | 奥术大成 | 开宗立派 | +2 |  |
| 172 | rare_time_loop | 时间循环 | 利用循环学习一切 | +2 |  |
| 173 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | +2 | ✅ |
| 174 | mag_mid_legacy_tower | 建造魔导塔 | 建在高处 | +2 |  |
| 175 | mid_old_enemy | 旧敌来访 | 正面迎战 | -28 | ❌ |
| 176 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +2 | ✅ |
| 177 | mid_return_adventure | 重出江湖 | 挑战新地城 | -8 | ✅ |
| 178 | elder_star_gazing_final | 最后的星空 | 内心平静 | +2 |  |
| 179 | rare_gods_gift | 神之恩赐 | 接受神力 | +22 |  |
| 180 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -4 |  |
| 181 | rainbow_mushroom | 七彩蘑菇 | 吃掉它 | +1 |  |
| 190 | mag_mid_magic_decay | 魔力衰退的征兆 | 加强修炼 | +1 |  |
| 191 | spr_mid_doomsday_prophecy | 末日预言 | 公开预言 | +1 |  |
| 192 | int_master_hunted | 猎巫行动 | 隐姓埋名，暗中研究 | +1 |  |
| 193 | int_master_magnum_opus | 毕生之作 | 公开出版，普惠世人 | +1 |  |
| 194 | challenge_final_boss | 魔王降临 | 直面魔王 | -24 | ✅ |
| 195 | challenge_god_trial | 神之试炼 | 接受试炼 | -19 | ✅ |
| 212 | str_6_legendary_battle | 最后一战 | 正面迎战 | 0 |  |
| 217 | war_aftermath | 战后动荡 | 继续战斗 | -27 | ✅ |
| 218 | int_master_dimensional_insight | 维度之悟 | 深入探索，寻找设计者 | 0 |  |
| 228 | chr_mid_ex_return | 前任的来信 | 回信释然 | 0 |  |
| 229 | int_master_legacy | 学术遗产 | 正式建立学派 | 0 |  |
| 272 | int_legend_final_truth | 世界之书 | 前往世界的尽头 | -1 |  |
| 273 | spr_elder_transcendence | 超凡觉醒 | 飞升 | -1 |  |
| 274 | mag_elder_last_spell | 最后的咒语 | 释放法术 | -1 |  |
| 299 | mag_elder_grimoire | 传世魔导书 | 传给弟子 | -1 |  |
| 300 | aging_elf_reflection | 漫长的回忆 | 珍视回忆 | -6 |  |
| 301 | elder_kingdom_crisis | 王国危机 | 挺身而出 | +4 | ✅ |
| 302 | int_legend_mad_or_enlightened | 天才与疯子之间 | 拥抱疯狂，获取超越 | -1 |  |
| 303 | elder_last_journey | 最后的旅途 | 去海边看日出 | -1 |  |
| 304 | mny_elder_rich_mans_regret | 富人的遗憾 | 写信给旧友 | -1 |  |

### 13. 半龙人-男-A (seed=8013)

- 种族: halfdragon | 性别: male
- 寿命: 193/233 | 评级: SS 不朽传说 | 分数: 970.7
- 初始HP: 58 | 事件数: 172 | 平凡年: 21
- 成就: 47 个 [first_step, ten_lives, mage_path, mag_arcane_adept, int_learned_scholar, chr_social_star, wisdom_peak, int_omniscient, archmage_body, soul_pure, beauty_supreme, male_beauty, mag_arcane_master, mag_reality_warper, scholar_warrior, fairy_companion, str_iron_body, chr_irresistible, centenarian, master_of_all, lucky_star, luk_charmed_life, tower_master_ach, longevity, war_hero_ach, iron_body, cheated_death_ach, archmage_ach, dragon_knight, school_founder_ach, elemental_lord_ach, memories_in_hands, legacy_of_students, famous_author_ach, peaceful_ending, eternal_peace, ascended_ach, divine_champion_ach, legacy_master, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, arcane_reserve_final, iron_will_to_end, fortune_smile_final, century_witness]
- 路线: on_mage_path
- 物品: 2 个 [crystal_shard, lucky_charm]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_wilderness | 荒野出生 | 萨满世家 | +5 |  |
| 2 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | +5 |  |
| 3 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +5 |  |
| 4 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | +4 |  |
| 5 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | 0 |  |
| 6 | spr_child_sight | 看见看不见的 | 跟影子说话 | 0 |  |
| 7 | bullied | 被大孩子欺负 | 忍气吞声 | 0 |  |
| 8 | MAG_p1_mana_awakening | 魔力涌动 | 压抑魔力 | 0 |  |
| 9 | MAG_p1_strange_dreams | 魔力之梦 | 跟随声音 | 0 |  |
| 10 | childhood_chase | 抓蜻蜓 | 抓到了一只 | 0 |  |
| 11 | spr_child_night_terror | 夜半惊魂 | 面对恐惧 | -4 |  |
| 12 | childhood_play | 村口的泥巴大战 | 当孩子王 | +4 |  |
| 13 | int_child_early_curiosity | 无尽的好奇心 | 追问到底 | +3 |  |
| 14 | str_1_playground_bully | 操场霸凌 | 挺身而出 | -3 |  |
| 15 | bullied_repeat | 他们又来了 | 继续忍耐 | +5 |  |
| 16 | river_fishing | 河边抓鱼 | 耐心等待 | +5 |  |
| 17 | str_1_farm_work | 农场苦力 | 拼命干活 | +6 |  |
| 18 | river_discovery | 河底发光 | 潜下去捡 | +5 | ✅ |
| 19 | magic_academy_enrollment | 魔法学院来信 | 入学 | -2 |  |
| 20 | magic_graduate | 魔法学院毕业 | 继续深造研究 | -6 |  |
| 21 | random_training_day | 勤奋的一天 | 训练体能 | 0 |  |
| 22 | wander_market | 逛集市 | 买了一本旧书 | +3 |  |
| 23 | old_soldier_story | 老兵的故事 | 认真听完 | 0 |  |
| 24 | chr_teen_love_letter | 情书 | 追查写信人 | +5 |  |
| 25 | first_love | 初恋的味道 | 表白 | +2 | ❌ |
| 26 | MAG_p2_academy_letter | 魔法学院来信 | 入学就读 | 0 |  |
| 27 | magic_exam | 魔法期末考试 | 全力备考 | -7 | ✅ |
| 28 | chr_teen_first_love | 初恋 | 全心投入 | -7 |  |
| 29 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 30 | chr_teen_dance | 星夜舞会 | 选择青梅 | 0 |  |
| 31 | luk_youth_dice_roll | 命运骰子 | 买下来掷 | 0 |  |
| 32 | youth_field_medic_training | 战场急救术 | 认真学 | 0 |  |
| 33 | teen_secret_discovered | 发现秘密 | 公开揭发 | 0 |  |
| 34 | youth_first_love | 怦然心动 | 鼓起勇气搭话 | 0 |  |
| 35 | heartbreak_growth | 失恋之后 | 沉淀修炼 | 0 |  |
| 36 | random_found_coin | 捡到硬币 |  | 0 |  |
| 37 | chr_public_speech | 广场演说 | 慷慨陈词 | 0 | ✅ |
| 38 | int_apprentice_expedition | 首次田野调查 | 细致入微地调查 | 0 |  |
| 39 | luk_lucky_coin | 捡到金币 | 收起来 | +4 |  |
| 40 | chr_youth_heartbreak | 被抛弃 | 深刻反思 | 0 |  |
| 41 | chr_teen_jealousy | 嫉妒的风暴 | 坦白心意 | 0 |  |
| 42 | mag_teen_potion_accident | 魔药事故 | 研究失败原因 | 0 |  |
| 43 | chr_youth_love_triangle | 三角困局 | 选择安稳 | -4 |  |
| 44 | magical_creature_tame | 驯服魔物 | 尝试驯服 | -10 |  |
| 45 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +5 |  |
| 46 | chr_youth_social_club | 名流圈子 | 如鱼得水 | -1 |  |
| 47 | youth_gambling_den | 赌场诱惑 | 小赌怡情 | 0 | ❌ |
| 48 | random_helping_stranger | 帮助陌生人 |  | 0 |  |
| 49 | market_haggling | 集市砍价 | 砍价大师 | 0 |  |
| 50 | elemental_trial | 元素试炼 | 火之试炼 | -10 |  |
| 51 | mag_youth_ritual_mastery | 仪式精通 | 用于研究 | +5 |  |
| 52 | tavern_brawl | 酒馆斗殴 | 加入混战 | -10 |  |
| 53 | youth_bandit_ambush | 路遇山贼 | 战斗！ | +5 | ✅ |
| 54 | luk_lottery | 王国彩票 | 中大奖了！ | +5 | ❌ |
| 55 | adult_restore_keepsake | 修缮旧物 | 自己动手修好 | +5 |  |
| 56 | youth_short_term_job | 临时差事 | 老老实实做完 | +5 |  |
| 57 | youth_caravan_guard | 商队护卫 | 报名参加 | +5 |  |
| 58 | mag_youth_wild_power | 荒野中的觉醒 | 完全接纳 | +5 |  |
| 59 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +5 |  |
| 60 | str_4_war_breaks_out | 战争爆发 | 主动请战 | +5 |  |
| 61 | youth_dungeon_first | 第一次进入地下城 | 小心翼翼地推进 | +5 |  |
| 62 | mny_adult_charity_dilemma | 乞丐的手 | 慷慨解囊 | +5 |  |
| 63 | mid_magic_experiment | 禁忌实验 | 全力激活魔法阵 | -30 | ❌ |
| 64 | chr_adult_settling_down | 安定还是流浪 | 扎根 | +5 |  |
| 65 | chain_dark_past | 黑暗过去 | 谈判 | +5 | ✅ |
| 66 | str_4_war_wound | 重伤 | 带伤上阵 | -20 |  |
| 67 | divine_vision | 神谕 | 遵循神谕行事 | +5 |  |
| 68 | luk_adult_lucky_business | 歪打正着 | 见好就收 | +4 |  |
| 69 | luk_adult_black_cat | 黑猫横路 | 跟着黑猫走 | +4 |  |
| 70 | aging_hint_mid | 力不从心 | 坦然接受 | +1 |  |
| 71 | chr_adult_marriage_pressure | 婚姻的十字路口 | 接受 | +4 |  |
| 72 | mid_gambling | 地下赌场 | 梭哈！ | +4 | ❌ |
| 73 | mid_adopt_orphan | 路边孤儿 | 带回家 | +4 |  |
| 74 | adult_plague_crisis | 瘟疫来袭 | 帮助救治病人 | +4 |  |
| 75 | mid_found_school | 开宗立派 | 门庭若市 | +4 | ✅ |
| 76 | mage_magic_tower | 法师塔 | 挑战塔主 | +4 | ✅ |
| 77 | spr_adult_spirit_pact | 灵界契约 | 接受交易 | +4 |  |
| 78 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +4 |  |
| 79 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +2 | ✅ |
| 80 | student_successor | 收徒传艺 | 严格教导 | 0 |  |
| 81 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | 0 |  |
| 82 | mid_heir_training | 培养继承人 | 青出于蓝 | 0 | ❌ |
| 83 | chr_mid_ghosts | 过去的幽灵 | 承担责任 | 0 |  |
| 84 | mage_magic_war | 魔法战争 | 参战 | -6 | ✅ |
| 85 | rare_gods_gift | 神之恩赐 | 接受神力 | +24 |  |
| 86 | adult_teaching_offer | 教学邀请 | 欣然接受 | -13 |  |
| 87 | spr_near_death | 濒死体验 | 挣扎求生 | -15 |  |
| 88 | midlife_crisis | 中年危机 | 放下执念 | +8 |  |
| 89 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +3 |  |
| 90 | chr_mid_legacy | 风流遗产 | 配合传记 | +3 |  |
| 91 | mid_legacy_project | 留下遗产 | 写一本书 | +3 |  |
| 92 | family_dinner | 家庭晚餐 | 亲自下厨 | +3 |  |
| 93 | rare_time_loop | 时间循环 | 利用循环学习一切 | +3 |  |
| 94 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -16 |  |
| 95 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -2 |  |
| 96 | random_rainy_contemplation | 雨中沉思 |  | +3 |  |
| 97 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +3 |  |
| 98 | random_street_performance | 街头表演 |  | +3 |  |
| 99 | mag_adult_arcane_mastery | 奥术大成 | 开宗立派 | +3 |  |
| 100 | mid_slowing_down | 迟缓的脚步 | 调整节奏 | +3 |  |
| 101 | mag_mid_magic_decay | 魔力衰退的征兆 | 加强修炼 | -9 |  |
| 102 | challenge_final_boss | 魔王降临 | 直面魔王 | -36 | ❌ |
| 103 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +12 |  |
| 104 | community_leader | 社区领袖 | 接受职位 | +2 |  |
| 105 | int_master_magnum_opus | 毕生之作 | 公开出版，普惠世人 | +2 |  |
| 106 | mage_elemental_plane | 元素位面 | 吸收元素之力 | -8 | ✅ |
| 107 | str_6_legendary_battle | 最后一战 | 正面迎战 | +2 |  |
| 108 | mid_life_reflection | 人生回顾 |  | +2 |  |
| 109 | elder_family_reunion | 天伦之乐 | 其乐融融 | +17 |  |
| 110 | elder_passing_wisdom | 智者之言 |  | +2 |  |
| 111 | mid_return_adventure | 重出江湖 | 挑战新地城 | -33 | ❌ |
| 112 | mid_old_enemy | 旧敌来访 | 正面迎战 | -24 | ❌ |
| 113 | mid_chronic_pain | 旧伤复发 | 寻求治疗 | +12 |  |
| 114 | int_legend_epilogue_teacher | 最后的课 | 传授所有知识，包括禁忌 | +2 |  |
| 115 | elder_garden_peace | 花园时光 |  | +2 |  |
| 116 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | +2 |  |
| 117 | adult_haunted_mansion | 闹鬼庄园 | 带武器硬闯 | +2 | ✅ |
| 118 | elder_disciple_visit | 故徒来访 | 感念师恩 | +12 |  |
| 119 | mid_magic_potion | 炼金术突破 | 配方卖个好价钱 | +2 |  |
| 120 | elder_old_letters | 旧日书信 |  | +2 |  |
| 121 | elder_miracle_recovery | 奇迹般的康复 |  | +7 |  |
| 122 | elder_memoir | 撰写回忆录 | 传世之作 | +1 | ✅ |
| 123 | elder_legacy_gift | 传家之宝 | 传给有缘人 | +1 |  |
| 124 | war_breaks_out | 战争爆发 | 上前线 | -31 | ✅ |
| 125 | elder_last_adventure | 不服老的冒险 | 出发！ | -22 | ❌ |
| 126 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | +1 |  |
| 127 | retirement | 挂剑归隐 | 归隐山林 | +9 |  |
| 128 | elder_autobiography | 自传 | 欣然同意 | +1 |  |
| 129 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -9 | ✅ |
| 130 | random_good_meal | 丰盛的一餐 |  | +1 |  |
| 131 | elder_unexpected_visitor | 意外的来访者 |  | +1 |  |
| 132 | elder_final_gift | 最后的礼物 |  | +1 |  |
| 133 | random_stargazing | 观星 |  | +1 |  |
| 134 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | +1 |  |
| 135 | random_minor_injury | 小伤 |  | 0 |  |
| 136 | lucky_coin_found | 幸运金币 |  | +1 |  |
| 137 | mag_elder_last_spell | 最后的咒语 | 释放法术 | +1 |  |
| 138 | challenge_god_trial | 神之试炼 | 接受试炼 | -19 | ✅ |
| 139 | elder_old_enemy | 昔日的对手 | 去见他 | +1 |  |
| 140 | SPR_p6_final_truth | 最后的真相 | 写下一切 | +1 |  |
| 141 | elder_dream_fulfilled | 完成心愿 |  | +1 |  |
| 142 | mag_finale_legacy_event | 魔导遗产 | 被尊为大师 | +1 |  |
| 143 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | +1 |  |
| 144 | challenge_abyss | 深渊之门 | 走入深渊 | -9 | ✅ |
| 145 | spr_mid_doomsday_prophecy | 末日预言 | 公开预言 | +1 |  |
| 146 | legend_spread | 传说的传播 | 享受名声 | +1 |  |
| 147 | chr_elder_finale | 花花公子的终章 | 儿孙满堂 | +1 |  |
| 148 | elder_frail | 风烛残年 | 安享晚年 | -14 |  |
| 149 | int_legend_final_truth | 世界之书 | 前往世界的尽头 | +1 |  |
| 150 | peaceful_end | 平静的终章 |  | +1 |  |
| 151 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | +1 |  |
| 152 | mag_elder_grimoire | 传世魔导书 | 传给弟子 | +1 |  |
| 153 | elder_kingdom_crisis | 王国危机 | 挺身而出 | +1 | ✅ |
| 154 | random_weather_blessing | 好天气 |  | +1 |  |
| 155 | aging_hint_early | 岁月的痕迹 |  | -1 |  |
| 156 | spr_elder_final_wisdom | 最后的智慧 | 传授给后人 | +1 |  |
| 157 | chr_elder_regret | 月光下的回忆 | 释然接受 | +1 |  |
| 158 | elder_star_gazing_final | 最后的星空 | 内心平静 | +1 |  |
| 159 | elder_sunset_watching | 夕阳 |  | +1 |  |
| 160 | str_7_epitaph | 墓志铭 |  | +1 |  |
| 161 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | +1 |  |
| 162 | spr_elder_transcendence | 超凡觉醒 | 飞升 | +1 |  |
| 163 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +1 |  |
| 164 | mag_elder_mana_dissolve | 魔力的消散 | 欣然接受 | +1 |  |
| 165 | spr_elder_spirit_guardian | 灵界守护者 | 化身为灵 | +1 |  |
| 166 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | +1 |  |
| 167 | elder_feast_missing_names | 席间空位 | 为他们举杯 | +1 |  |
| 168 | elder_last_feast | 最后的盛宴 | 发表感言 | 0 |  |
| 169 | elder_last_journey | 最后的旅途 | 去海边看日出 | 0 |  |
| 170 | elder_world_peace | 和平降临 | 退休享受 | 0 |  |
| 192 | magic_breakthrough_final | 最后的魔法 | 突破极限 | -21 |  |
| 193 | elder_natural_death | 安详的离去 |  | -22 |  |

### 14. 半龙人-女-B (seed=8014)

- 种族: halfdragon | 性别: female
- 寿命: 229/224 | 评级: SS 不朽传说 | 分数: 1077.9
- 初始HP: 58 | 事件数: 173 | 平凡年: 56
- 成就: 45 个 [first_step, ten_lives, str_iron_body, chr_social_star, mag_arcane_adept, centenarian, scholar_warrior, master_of_all, int_learned_scholar, iron_body, soul_pure, wisdom_peak, str_body_of_legend, mny_comfortable_life, beauty_supreme, wealth_peak, int_omniscient, eternal_wanderer, lucky_star, luk_charmed_life, chr_irresistible, longevity, archmage_body, dragon_knight, mag_reality_warper, archmage_ach, female_archmage, divine_champion_ach, famous_author_ach, peaceful_ending, eternal_peace, tower_master_ach, undying_legend_ach, ascended_ach, legacy_master, demon_king_slayer_ach, hero_ach, era_remembered, legendary_epilogue, immortal_epilogue, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, miracle_afterglow]
- 路线: on_adventurer_path, on_scholar_path
- 物品: 1 个 [ancient_relic]

**事件时间线** (仅事件年):

| Age | 事件ID | 标题 | 分支 | HP变化 | 结果 |
|-----|--------|------|------|--------|------|
| 1 | birth_storm | 暴风夜 |  | +5 |  |
| 2 | SPR_p7_spirit_legacy | 灵魂的遗产 | 化作传说中的低语 | +5 |  |
| 3 | MAG_p7_legacy_event | 魔导遗产 | 被遗忘的传说 | +2 |  |
| 4 | chr_birth_charming_smile | 天赋微笑 | 操纵本能 | 0 |  |
| 5 | SPR_p1_ghost_friend | 看不见的朋友 | 与灵体交谈 | 0 |  |
| 6 | MAG_p1_mana_awakening | 魔力涌动 | 压抑魔力 | 0 |  |
| 7 | bullied | 被大孩子欺负 | 忍气吞声 | 0 |  |
| 8 | village_festival | 村里祭典 | 大吃特吃 | 0 |  |
| 9 | child_swimming_lesson | 学游泳 | 认真学习 | -3 |  |
| 10 | mag_child_imaginary | 看不见的朋友 | 和它做朋友 | +3 |  |
| 11 | noble_kid_revenge | 权贵的欺凌 | 咽下这口气 | 0 |  |
| 12 | str_1_playground_bully | 操场霸凌 | 挺身而出 | -3 |  |
| 13 | luk_child_miracle_escape | 擦肩而过 | 吓傻了 | +5 |  |
| 14 | child_healer_visit | 旅行医者 | 接受医治 | +5 |  |
| 15 | child_first_fight | 第一次打架 | 挥拳反击 | +5 |  |
| 16 | mag_child_spark | 指尖的火花 | 再试一次 | +5 |  |
| 17 | mny_child_market_day | 集市的诱惑 | 学着叫卖 | +3 |  |
| 18 | SPR_p2_shrine_calling | 神殿的召唤 | 入神殿修行 | 0 |  |
| 19 | str_1_farm_work | 农场苦力 | 拼命干活 | -4 |  |
| 20 | teen_traveling_circus | 流浪马戏团 | 偷偷学杂技 | +5 |  |
| 21 | young_rival | 少年的对手 | 努力超越他 | +5 |  |
| 22 | str_2_street_fight | 街头斗殴 | 一拳定胜负 | +5 |  |
| 23 | random_street_performance | 街头表演 |  | +5 |  |
| 24 | chr_childhood_protector | 小小护花使者 | 温柔以待 | +5 |  |
| 25 | first_love | 初恋的味道 | 表白 | +5 | ✅ |
| 26 | bullied_fight_back | 反击！ | 直接动手 | +5 | ✅ |
| 27 | mny_youth_allowance_choice | 零花钱的选择 | 买糖果 | +5 |  |
| 28 | mag_teen_overflow | 魔力暴走 | 拼命压制 | +5 |  |
| 29 | random_weather_blessing | 好天气 |  | +2 |  |
| 30 | str_2_mercenary_recruit | 佣兵团招人 | 报名入伍 | 0 |  |
| 31 | int_youth_street_bookseller | 流动书商的奇书 | 买下那本发光的书 | +5 |  |
| 32 | int_young_first_discovery | 你的第一个发现 | 发表论文，公开发现 | +1 |  |
| 33 | teen_mentor_meeting | 遇见师傅 | 学习剑技 | 0 |  |
| 34 | explore_ruins | 废墟探险 | 推门进去 | +5 | ✅ |
| 35 | dating_start | 开始交往 | 正式告白 | -1 |  |
| 36 | chr_youth_love_triangle | 三角困局 | 选择安稳 | 0 |  |
| 37 | guild_join | 加入冒险者公会 | 加入公会 | 0 |  |
| 38 | SPR_p3_truth_too_much | 真相的重量 | 选择沉默 | +5 |  |
| 39 | bandit_ambush | 山贼伏击 | 正面对抗 | -9 |  |
| 40 | luk_potion_find | 神秘药水 | 一口闷！ | +5 | ✅ |
| 41 | gambling_night | 赌场之夜 | 放手一搏 | +5 |  |
| 42 | chr_teen_jealousy | 嫉妒的风暴 | 坦白心意 | +5 |  |
| 43 | youth_field_medic_training | 战场急救术 | 认真学 | +5 |  |
| 44 | cryptic_manuscript | 神秘手稿 | 花时间破译 | +5 |  |
| 45 | adv_bounty | 高价悬赏 | 接任务 | -5 | ✅ |
| 46 | dating_deepen | 感情升温 | 一起冒险 | +5 |  |
| 47 | starlight_promise | 星光下的约定 | 遵守承诺 | -5 |  |
| 48 | youth_caravan_guard | 商队护卫 | 报名参加 | +5 |  |
| 49 | luk_lottery | 王国彩票 | 中大奖了！ | +5 | ❌ |
| 50 | chr_youth_casanova_peak | 风流浪子的巅峰 | 厌倦游戏 | +5 |  |
| 51 | youth_shared_roof | 同住一檐下 | 把日子打理顺 | +5 |  |
| 52 | mysterious_stranger | 神秘旅人 | 和他交谈 | +5 |  |
| 53 | int_apprentice_thesis | 毕业论文 | 写一篇安全但有深度的论文 | +5 |  |
| 54 | bounty_notice | 悬赏告示板 | 接下奇怪委托 | +5 |  |
| 55 | adv_uncharted | 未踏之地 | 出发 | 0 | ✅ |
| 56 | pirate_attack | 海盗袭击 | 奋起反击 | -5 |  |
| 57 | marry_adventurer | 与冒险者结婚 | 在一起 | +5 |  |
| 58 | str_4_war_breaks_out | 战争爆发 | 主动请战 | +5 |  |
| 59 | desert_caravan | 沙漠商队 | 担任护卫 | +5 |  |
| 60 | luk_adult_black_cat | 黑猫横路 | 跟着黑猫走 | +5 |  |
| 61 | chr_adult_true_love | 真爱的考验 | 用行动证明 | +5 |  |
| 62 | str_4_war_wound | 重伤 | 带伤上阵 | -20 |  |
| 63 | int_scholar_political_trap | 学者的陷阱 | 周旋其中，借势而行 | +5 |  |
| 64 | spr_curse_breaker | 诅咒解除 | 尝试解除 | +5 | ✅ |
| 65 | spr_meditation_retreat | 闭关修炼 | 闭关苦修 | +4 |  |
| 66 | rescue_from_dungeon | 深入魔窟的营救 | 独闯魔窟 | -11 |  |
| 67 | adult_neighborhood_request | 邻里的请求 | 组织大家一起做 | +4 |  |
| 68 | adult_business_startup | 创业梦想 | 全力投入 | +4 | ✅ |
| 69 | mercenary_contract | 佣兵合同 | 忠诚完成合同 | +4 |  |
| 70 | aging_hint_early | 岁月的痕迹 |  | +2 |  |
| 71 | mountain_bandit_leader | 山贼头子的挑战 | 接受挑战 | +4 | ✅ |
| 72 | adult_first_child | 初为人父母 |  | +4 |  |
| 73 | disciple_comes | 收徒传艺 | 收下这个弟子 | +4 |  |
| 74 | random_stargazing | 观星 |  | +4 |  |
| 75 | family_dinner | 家庭晚餐 | 亲自下厨 | +4 |  |
| 76 | mid_natural_disaster | 天灾 | 组织救援 | +4 |  |
| 77 | mid_adopt_orphan | 路边孤儿 | 带回家 | +4 |  |
| 78 | dark_cult_encounter | 暗黑教团 | 潜入调查 | -11 |  |
| 79 | random_good_meal | 丰盛的一餐 |  | +4 |  |
| 80 | mny_adult_charity_dilemma | 乞丐的手 | 慷慨解囊 | +4 |  |
| 81 | challenge_abyss | 深渊之门 | 走入深渊 | -9 | ✅ |
| 82 | martial_arts_master | 武道至境 | 进入顿悟 | +4 |  |
| 83 | old_friend_reunion | 老友重逢 | 坐下来喝一杯 | +4 |  |
| 84 | chr_mid_ghosts | 过去的幽灵 | 承担责任 | +3 |  |
| 85 | reincarnated_invention | 前世知识变现 | 公开发明 | +3 |  |
| 86 | mid_life_reflection | 人生回顾 |  | +3 |  |
| 87 | midlife_crisis | 中年危机 | 放下执念 | +4 |  |
| 88 | int_scholar_forbidden_ritual | 禁忌的召唤 | 执行仪式 | -22 |  |
| 89 | mid_legacy_project | 留下遗产 | 写一本书 | +3 |  |
| 90 | dark_cult_aftermath | 暗影的低语 | 向城卫军举报 | +3 |  |
| 91 | mid_scholar_work | 学术研究 | 重大发现 | +2 | ✅ |
| 92 | mny_adult_market_boom | 牛市来临 | 全部抛售 | -7 |  |
| 93 | chr_mid_mature_charm | 成熟的魅力 | 传道授业 | 0 |  |
| 94 | mid_heir_training | 培养继承人 | 青出于蓝 | -1 | ✅ |
| 95 | int_master_magnum_opus | 毕生之作 | 公开出版，普惠世人 | 0 |  |
| 96 | rare_dragon_egg | 龙蛋 | 孵化并养育幼龙 | -6 |  |
| 97 | adult_treasure_map | 破旧的藏宝图 | 组队去寻宝 | +3 | ✅ |
| 98 | spr_divine_sign | 神谕降临 | 倾心聆听，接受神恩 | +1 |  |
| 99 | community_leader | 社区领袖 | 接受职位 | -7 |  |
| 100 | mid_return_adventure | 重出江湖 | 挑战新地城 | -10 | ✅ |
| 101 | chr_mid_legacy | 风流遗产 | 配合传记 | +2 |  |
| 102 | midlife_new_craft | 半路学艺 | 学点能打动人的 | +2 |  |
| 103 | mid_old_friend_reunion | 故友重逢 | 彻夜长谈 | +2 |  |
| 104 | elder_peaceful_days | 宁静时光 | 精心打理花园 | +12 |  |
| 105 | mid_old_enemy | 旧敌来访 | 正面迎战 | -11 | ✅ |
| 106 | war_breaks_out | 战争爆发 | 上前线 | -41 | ✅ |
| 107 | mid_mentoring_youth | 指导年轻人 | 倾囊相授 | +2 |  |
| 108 | dragon_youngling_growth | 幼龙成长 | 与幼龙一起练习飞行 | +2 | ✅ |
| 109 | str_6_legendary_battle | 最后一战 | 正面迎战 | +2 |  |
| 110 | master_spell | 顿悟！魔法真谛 | 释放新力量 | -13 |  |
| 111 | mid_vision_decline | 模糊的视界 | 配一副魔导眼镜 | +2 |  |
| 112 | elder_legacy_gift | 传家之宝 | 传给有缘人 | +2 |  |
| 113 | elder_passing_wisdom | 智者之言 |  | +2 |  |
| 114 | adult_dragon_rumor | 龙的踪迹 | 接下悬赏 | +2 | ✅ |
| 115 | elder_spirit_trial | 灵魂试炼 | 灵魂升华 | -8 | ✅ |
| 116 | elder_unexpected_visitor | 意外的来访者 |  | +2 |  |
| 117 | challenge_god_trial | 神之试炼 | 接受试炼 | -19 | ✅ |
| 118 | elder_family_reunion | 天伦之乐 | 其乐融融 | +16 |  |
| 119 | mag_mid_magic_decay | 魔力衰退的征兆 | 加强修炼 | +1 |  |
| 120 | elder_disciple_visit | 故徒来访 | 感念师恩 | +11 |  |
| 121 | elder_memoir | 撰写回忆录 | 传世之作 | +1 | ✅ |
| 122 | chr_elder_charm_undiminished | 魅力不减 | 分享智慧 | +1 |  |
| 123 | mid_familiar_place_changes | 熟悉的地方变了 | 参与新的模样 | +1 |  |
| 124 | retirement | 挂剑归隐 | 归隐山林 | +9 |  |
| 125 | elder_sunset_watching | 夕阳 |  | +1 |  |
| 126 | mag_mid_legacy_tower | 建造魔导塔 | 建在高处 | +1 |  |
| 127 | elder_last_adventure | 不服老的冒险 | 出发！ | +1 | ✅ |
| 128 | chr_elder_late_rose | 迟来的玫瑰 | 珍惜当下 | +1 |  |
| 129 | dragon_sky_patrol | 龙背巡游 | 巡视边境，威慑敌人 | +1 |  |
| 130 | int_legend_quiet_end | 学者的归宿 | 留下最后的著作 | +1 |  |
| 131 | elder_autobiography | 自传 | 欣然同意 | +1 |  |
| 132 | rare_gods_gift | 神之恩赐 | 接受神力 | +21 |  |
| 133 | elder_final_gift | 最后的礼物 |  | +1 |  |
| 134 | random_rainy_contemplation | 雨中沉思 |  | +1 |  |
| 135 | str_7_epitaph | 墓志铭 |  | +1 |  |
| 136 | chr_elder_regret | 月光下的回忆 | 释然接受 | +1 |  |
| 137 | elder_garden_peace | 花园时光 |  | +1 |  |
| 138 | legend_spread | 传说的传播 | 享受名声 | +1 |  |
| 139 | random_minor_injury | 小伤 |  | 0 |  |
| 140 | int_legend_final_truth | 世界之书 | 前往世界的尽头 | +1 |  |
| 141 | spr_mid_doomsday_prophecy | 末日预言 | 公开预言 | +1 |  |
| 142 | peaceful_end | 平静的终章 |  | +1 |  |
| 143 | elder_memory_fade | 渐渐模糊的记忆 | 记录回忆 | +1 |  |
| 144 | mag_elder_last_spell | 最后的咒语 | 释放法术 | +1 |  |
| 145 | spr_finale_spirit_legacy | 灵魂的遗产 | 被铭记为圣者 | +1 |  |
| 146 | dragon_ultimate_bond | 龙之试炼 | 接受龙之试炼 | -20 | ❌ |
| 147 | spr_elder_final_wisdom | 最后的智慧 | 传授给后人 | +1 |  |
| 148 | chr_elder_finale | 花花公子的终章 | 儿孙满堂 | +1 |  |
| 149 | elder_technique_pass | 绝学传承 | 全力编写 | +1 |  |
| 150 | elder_frail | 风烛残年 | 安享晚年 | -14 |  |
| 151 | mag_elder_grimoire | 传世魔导书 | 传给弟子 | +1 |  |
| 152 | aging_hint_late | 生命的黄昏 |  | -4 |  |
| 153 | challenge_final_boss | 魔王降临 | 直面魔王 | -24 | ✅ |
| 154 | elder_kingdom_crisis | 王国危机 | 挺身而出 | -34 | ❌ |
| 155 | spr_elder_transcendence | 超凡觉醒 | 飞升 | +1 |  |
| 156 | int_legend_mad_or_enlightened | 天才与疯子之间 | 拥抱疯狂，获取超越 | +1 |  |
| 157 | elder_last_feast | 最后的盛宴 | 发表感言 | +1 |  |
| 158 | str_7_old_warrior_peace | 老兵的和平 | 讲故事 | +1 |  |
| 159 | elder_old_enemy | 昔日的对手 | 去见他 | +1 |  |
| 160 | elder_apprentice_return | 学徒归来 | 欣慰地看着 | +1 |  |
| 161 | elder_wisdom_seekers | 求知者来访 | 倾囊相授 | 0 |  |
| 162 | elder_legend_verified | 传说被验证 | 接受荣誉 | 0 |  |
| 163 | mny_elder_rich_mans_regret | 富人的遗憾 | 写信给旧友 | 0 |  |
| 164 | elder_feast_missing_names | 席间空位 | 为他们举杯 | 0 |  |
| 165 | mag_elder_mana_dissolve | 魔力的消散 | 欣然接受 | 0 |  |
| 166 | random_nightmare_visit | 不安的梦 |  | 0 |  |
| 167 | aging_hint_mid | 力不从心 | 坦然接受 | -3 |  |
| 168 | elder_last_journey | 最后的旅途 | 去海边看日出 | 0 |  |
| 169 | elder_sort_keepsakes | 整理珍藏 | 分给该拿的人 | 0 |  |
| 170 | elder_world_peace | 和平降临 | 退休享受 | 0 |  |
| 171 | elder_star_gazing_final | 最后的星空 | 内心平静 | 0 |  |
| 187 | MAG_p7_final_spell | 最后的魔法 | 守护之盾 | -1 |  |
| 188 | SPR_p7_departure | 灵魂离体 | 平静离世 | -1 |  |
