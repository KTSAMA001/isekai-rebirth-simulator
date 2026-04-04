# 异世界模拟器 — 阶段1需求文档：代价-收益对称改造

**版本**: v1.0  
**日期**: 2026-04-01  
**作者**: QA  
**基线数据**: 28 个必选项 + 63 个废选项（基于 5性格×4局=20局测试）

---

## 1. 问题定义

### 当前状态
- **必选项**（5性格100%一致选）：28 个分支
- **废选项**（从未被任何策略选中）：63 个分支
- **根本原因**：绝大多数分支只有纯正面效果（net>0），或纯负面效果（net≤0），缺乏有意义的权衡

### 量化分类

| 类型 | 数量 | 特征 | 示例 |
|------|------|------|------|
| 纯正面分支（net≥+4） | ~120 | 只有增益，无任何代价 | `war_hero` net=+9, `dragon_kill` net=+11 |
| 纯负面分支（net≤0） | ~30 | 只有损失，无任何收益 | `endure` net=-2, `lottery_nothing` net=0 |
| 已有平衡的分支（0<net<4） | ~50 | 有得有失，但收益仍显著高于代价 | 多数现存的"可比较"选项 |

---

## 2. 改造规则

### R1: 单项正面增幅上限
- 任何单个分支的 **净属性增幅 (net) 不得超过 +5**
- 当前违规示例：`dragon_kill` net=+11, `war_hero` net=+9, `god_accept` net=+10
- 超出部分必须通过增加负面代价（属性扣减、HP损失、flag惩罚）或拆分收益来抵消

### R2: 每个选项必须有得有失
- 每个分支必须同时包含：
  - **≥1 个正面收益**（属性增加、flag设置、物品获取、HP恢复）
  - **≥1 个负面代价**（属性扣减、HP损失、flag惩罚、或"放弃另一种收益的机会成本"）
- **不允许**净效果为 0 或纯负面的分支存在（废选项根因）
- **不允许**净效果为 +4 以上的分支存在（必选项根因）

### R3: 纯负面废选项改造
- 当前所有 net≤0 的分支（如 `endure`, `give_up`, `refuse_guild`, `pretend_not_see` 等）需要：
  - 保留原有的负面代价
  - **新增正面收益**（通常是另一种类型的收益，如 flag、叙事性内容、或不同维度的属性补偿）
  - 目标：改造后 net 范围控制在 +1 ~ +3

### R4: 不可比较的权衡
- 同一事件的多个分支，其收益维度**不应完全重叠**
- 错误示例：A 分支 `str+3, chr+2` vs B 分支 `str+2, chr+3`（完全可比较）
- 正确示例：A 分支 `str+3, spr-2`（追求力量，牺牲灵魂） vs B 分支 `spr+3, str-2`（追求精神，牺牲体魄）
- 每个分支应让不同"性格"的玩家有不同的偏好

### R5: flag 和物品的代价化
- 获得 `set_flag`、`add_talent`、`grant_item` 的分支，必须同时有等价的属性/HP代价
- 当前大量分支"免费获得flag/物品"，这些flag在后续事件中解锁更多优势，形成滚雪球效应
- flag/物品的价值评估参考：`set_flag` ≈ +1, `grant_item` ≈ +2, `add_talent` ≈ +3

### R6: 叙事性代价
- 除了数值代价外，鼓励引入"叙事性代价"（通过 flag 实现）：
  - 获得某种 flag 的同时，设置一个负面的后续限制 flag
  - 示例：选择"加入骑士团" → 获得 `knight` flag，同时获得 `no_merchant` flag（不能再走商人路线）

---

## 3. 需要改造的事件列表

### 3.1 必选项改造（28个分支 → 需要增加负面代价或拆分收益）

| # | 事件ID | 分支ID | 当前net | 问题 | 改造要求 |
|---|--------|--------|---------|------|----------|
| 1 | `mid_body_decline` | `defy_decline` | 0 | 两个分支net相同但defy有flag收益 | 给 `accept_decline` 增加 1 个正面收益（如 `spr+1`），或给 `defy_decline` 增加 1 个负面代价（如 `spr-1`） |
| 2 | `war_breaks_out` | `war_support` | +2 | 另一个分支 `war_hero` net=+9 更强 | 见 3.2 专项 |
| 3 | `food_culture` | `food_write` | +5 | 纯正面，无代价 | 增加 `mny-2`（沉迷写作没赚钱）或 `str-2`（久坐体魄下降） |
| 4 | `harvest_festival` | `festival_compete` | +5 | 纯正面 | 增加 `spr-2`（赛后的落寞感）或风险判定 |
| 5 | `pet_companion` | `pet_adopt` | +4 | 纯正面 | 增加 `mny-2`（养宠物花钱） |
| 6 | `mid_chronic_pain` | `seek_treatment` | -15 | 净负，但比 endure(-2) 更差却更常被选 | 此事件两个分支都是纯负面，需要重新设计：`seek_treatment` 应有 HP 恢复收益但属性扣减，`endure_pain` 应有 flag 收益（坚韧） |
| 7 | `mid_slowing_down` | `adjust_pace` | -1 | 另一个分支 push_through net=+2 | 给 `adjust_pace` 增加正面收益（如 `spr+1, "学会了享受慢节奏"`），使其 net=+1 |
| 8 | `retirement` | `retire_peaceful` | -1 | 纯负面 | 增加 `spr+1`（内心平静）使 net=0，但给 `continue_adventure` 增加风险判定 |
| 9 | `mid_garden_retirement` | `garden_social` | +5 | 纯正面 | 增加 `spr-2`（社交消耗精力）或 `int-2` |
| 10 | `elder_peaceful_days` | `peace_garden` | +2 | 另一分支 peace_lonely net=+2 相同 | 增加维度差异：`peace_garden` 加 `spr-1`，`peace_lonely` 加 `int+1` |
| 11 | `elder_old_enemy` | `enemy_meet` | +4 | 纯正面 | 增加 `spr-1`（回忆伤痛）或 `hp-5`（年老体弱，见面受刺激） |
| 12 | `hunting_trip` | `hunt_big_game` | +4 | 纯正面 | 增加风险判定或 `hp-5`（猎物反伤） |
| 13 | `community_leader` | `leader_accept` | +4 | 纯正面 | 增加 `spr-2`（管理压力） |
| 14 | `midlife_crisis` | `let_go` | 0 | persist_dream net=+2 更优 | 给 `let_go` 增加 `spr+2`（放下执念的释然），使其与 `persist_dream` 形成不同维度的权衡 |
| 15 | `mid_adopt_orphan` | `adopt_take` | +3 | 最优，另两个纯负/零 | 给 `adopt_donate` 增加 `chr+1, spr+1`，给 `adopt_ignore` 增加 `mny+2`（省下钱） |
| 16 | `wander_market` | `buy_book` | +2 | 另两个分支 buy_snack net=+1, save_money net=0 | 给 `buy_snack` 增加 `luk+1`（快乐的回忆），给 `save_money` 改为 `mny+3, spr-2` |
| 17 | `market_haggling` | `haggle_win` | +4 | 纯正面 | 增加 `chr-1`（讨价还价伤面子）或 `spr-1` |
| 18 | `street_performer` | `perform_join` | +4 | 纯正面 | 增加风险判定或 `int-2` |
| 19 | `gambling_night` | `gamble_win` | +3 | 最优分支 | 给 `gamble_quit` 增加 `spr+1, int+1`（戒赌的清醒），使其 net=+5 与 gamble_win 形成不同维度的权衡 |
| 20 | `mid_old_enemy` | `enemy_negotiate` | +1 | 最优分支 | 给 `enemy_hide` 增加 `spr+1`（隐忍的智慧），给 `enemy_fight` 增加风险判定 |
| 21 | `spr_near_death` | `neardeath_accept` | 0 | 最安全分支 | 给 `neardeath_bargain` 增加正面收益（如 `mag+2` 但 net=+1），让三种选择各有吸引力 |
| 22 | `rare_reincarnation_hint` | `pastlife_embrace` | +6 | 纯正面，超标 | 增加 `spr-2`（前世记忆的困扰）使 net=+4 |
| 23 | `rare_gods_gift` | `god_accept` | +4 | 纯正面 | 增加 `spr-2`（神力的负担）或增加风险判定 |
| 24 | `young_rival` | `befriend_him` | +3 | 最优分支 | 给 `ignore_him` 增加 `luk+2, spr+1`（无视竞争的豁达），给 `surpass_him` 增加 `mny+1`（努力有回报） |
| 25 | `old_soldier_story` | `listen_carefully` | +4 | 纯正面（还送物品） | 增加 `spr-2`（战争故事的沉重）或 `hp-3`（夜不能寐） |
| 26 | `guild_recruitment` | `join_guild` | +2 | 最优分支 | 给 `refuse_guild` 增加 `int+2, spr+1`（走自己的路），给 `hesitate_guild` 增加 `mag+1`（犹豫中发现自身潜力） |
| 27 | `scholar_guidance` | `study_scholar` | +3 | 最优分支 | 给 `refuse_scholar` 增加 `str+2, mag+1`（自学实践），给 `self_study` 增加 `spr+1`（独立思考） |
| 28 | `village_feud` | `speak_for_weak` | +1 | 最优分支 | 给 `pretend_not_see` 增加 `int+1, luk+1`（旁观者清），给 `tell_adult` 增加 `chr+2`（社交能力提升） |

### 3.2 严重超标分支专项（net≥+6 的"无敌选项"）

这些分支的净收益极高，即使存在其他分支，也会被所有策略引擎选择：

| 事件ID | 分支ID | 当前net | 改造要求 |
|--------|--------|---------|----------|
| `dragon_slay_attempt` | `dragon_kill` | +11 | 增加 `hp-20`（战斗重伤）或 `spr-3`（杀戮的心理创伤），目标 net≤+5 |
| `dragon_slay_attempt` | `dragon_near_death` | +5 | 已达标，但需确认 |
| `war_breaks_out` | `war_hero` | +9 | 增加 `hp-15` 或 `spr-3`，目标 net≤+4 |
| `knight_dragon_quest` | `dragon_hunt` | +10 | 增加 `hp-20, spr-2`，目标 net≤+4 |
| `challenge_god_trial` | `god_accept` | +10 | 增加 `hp-10, str-2`（神的试炼代价），目标 net≤+5 |
| `final_cataclysm` | `become_god` | +21 | 大幅增加代价：`spr-5, hp-30, 所有属性-2`，目标 net≤+8（允许最终事件稍高） |
| `challenge_final_boss` | `boss_fight` | +7 | 增加 `hp-15`，目标 net≤+4 |
| `challenge_final_boss` | `boss_magic` | +7 | 同上 |
| `merchant_economic_crisis` | `crisis_speculate` | +8 | 增加 `spr-3, chr-2`（投机倒把的名声），目标 net≤+4 |
| `challenge_abyss` | `abyss_enter` | +6 | 增加 `hp-10, spr-2`，目标 net≤+2 |
| `mercenary_contract` | `mercenary_steal` | -2 | 纯负面，需增加正面收益 |
| `mny_trade_route` | `trade_deal` | +7 | 增加 `hp-5, spr-2` |
| `mage_elemental_plane` | `plane_absorb` | +8 | 增加 `spr-3, hp-10`（元素侵蚀） |
| `investment_opportunity` | `invest_all` | +5 | 增加 `mny-2` 风险（当前无风险判定） |
| `dual_merchant_spy` | `spy_accept` | +8 | 增加 `spr-3, chr-2`（卧底的心理压力） |
| `challenge_abyss` | `abyss_enter` | +6 | 见上 |
| `mny_inherit_uncle` | `inherit_accept` | +2 | 已达标 |
| `become_lord` | NO BRANCH | +10 | 无分支纯正面事件，需拆为分支选择 |
| `master_spell` | NO BRANCH | +10 | 同上 |
| `reincarnated_invention` | NO BRANCH | +11 | 同上 |
| `starlight_promise` | NO BRANCH | +7 | 同上 |

### 3.3 纯负面废选项改造（需要增加正面收益）

以下分支 net≤0 且从未被选中，需要增加正面收益使其具有选择价值：

| 事件ID | 分支ID | 当前net | 当前效果 | 改造要求 |
|--------|--------|---------|----------|----------|
| `bullied` | `endure` | -2 | spr-2, int+2, timid flag | 已有正面收益(int+2)，但被 seek_help(chr+2,spr+2) 压制。给 endure 增加隐藏 flag（如 `deep_observer`，后续解锁观察力事件） |
| `stray_dog` | `share_food` | 0 | chr+2, luk-2 | 增加 `spr+1`（善举的温暖）使其 net=+1 |
| `stray_dog` | `ignore_dog` | -2 | spr-2 | 改为 `spr-1, mny+2`（省下照顾宠物的钱和时间），net=+1 |
| `noble_kid_revenge` | `swallow_pride` | -2 | chr-2, noble_grudge flag | 给 noble_grudge flag 后续解锁复仇路线，当前文本暗示但无实际奖励。增加 `int+2`（暗自观察学到的） |
| `noble_kid_revenge` | `report_authority` | +2 | int+3, mny+1 | 已有正收益但被选中率低，可接受 |
| `steal_sweets` | `blame_sibling` | 0 | int+2, chr-2 | 增加 `luk+1`（侥幸没被发现） |
| `childhood_chase` | `found_quickly` | -1 | spr+1, luk-2 | 增加 `chr+1`（孩子们喜欢你的真实） |
| `childhood_hide_seek` | `found_quickly` | -1 | spr+1, luk-2 | 同上 |
| `lost_treasure_map` | `throw_away` | 0 | 无效果 | 增加 `spr+1, luk+2`（"放下执念，心境更开阔"），net=+3 |
| `first_love` | `give_up` | 0 | str+2, chr-2 | 增加 `spr+1`（"专注于自我成长也是一种选择"） |
| `guild_recruitment` | `refuse_guild` | +2 | mny+2 | 被 join_guild(str+2, flag) 压制。增加 `int+2`（自学成才），使两个分支形成 "力量+路线" vs "智慧+自由" 的权衡 |
| `part_time_job` | `job_slack` | +4 | mny+2, luk+2 | 已达标但被 job_hard 压制。可接受 |
| `traveling_sage` | `sage_listen` | +3 | int+2, spr+1 | 被 sage_follow(int+2,chr+1,mag+1) 压制。增加 `luk+1` 或 flag |
| `squire_opportunity` | `watch_squire` | +1 | luk+1 | 太弱。改为 `int+2, spr+1`（观战学到理论），net=+3 |
| `squire_opportunity` | `refuse_squire` | +1 | int+1 | 改为 `int+2, mny+1`（用节省的时间做别的事） |
| `merchant_guidance` | `help_days` | +1 | mny+1 | 改为 `mny+1, str+1`（搬货锻炼体魄） |
| `merchant_guidance` | `refuse_merchant` | +1 | int+1 | 改为 `int+2, spr+1`（用自己的方式学习） |
| `scholar_guidance` | `refuse_scholar` | +1 | chr+1 | 改为 `int+1, str+2`（实践中学习） |
| `magic_academy_letter` | `ask_parents_magic` | +1 | chr+1 | 改为 `spr+2, chr+1`（父母陪伴的温暖） |
| `magic_academy_letter` | `refuse_magic` | +1 | mny+1 | 改为 `str+2, spr+1`（留在村子里锻炼身体） |
| `forest_camping` | `enjoy_night` | -1 | spr+1, int-2 | 改为 `spr+2, int-1, luk+1`（放松的夜晚） |
| `spr_dream_vision` | `dream_ignore` | 0 | int+2, spr-2 | 增加 `mny+1`（"醒来后精力充沛去工作"） |
| `spr_dream_vision` | `dream_fear` | -2 | spr-2 | 改为 `spr-1, str+2`（恐惧激发了求生本能） |
| `secret_training` | `leave_training` | 0 | 无效果 | 增加 `spr+2, chr+2`（离开后结交了新朋友） |
| `knight_examination` | `knight_give_up` | 0 | str+2, int-2 | 增加 `spr+1, mny+1`（放弃后用省下的时间赚钱） |
| `old_friend_reunion` | `polite_decline` | -1 | spr-2 | 改为 `spr+1, mny+1`（婉拒后专心事业） |
| `mysterious_stranger` | `stay_alert` | -1 | spr-2 | 改为 `int+2, spr-1`（警觉中发现了线索） |
| `rival_training` | `rival_decline` | +2 | str+2 | 被 rival_fight(str+4) 压制。给 rival_decline 增加 `int+2, spr+1`（观察对手的招式） |
| `luk_lottery` | `lottery_nothing` | 0 | 无效果 | 增加 `spr+2, int+1`（"虽然没有中奖，但过程很快乐"） |
| `luk_wild_encounter` | `wild_escape` | 0 | 无效果 | 增加 `spr+1, str+1`（逃跑中锻炼了体能） |
| `challenge_abyss` | `abyss_flee` | 0 | 无效果 | 增加 `spr+2`（"活着就是最好的奖励"） |
| `elder_family_reunion` | `family_dispute` | -4 | spr-4 | 改为 `spr-2, int+2`（争吵中也理解了家人的想法） |
| `elder_spirit_trial` | `spirit_fear` | -2 | spr-2 | 改为 `spr-1, str+2`（恐惧激发了求生本能） |
| `elder_legacy_gift` | `legacy_worthy` | 0 | spr-3, items | 已有物品收益。增加 `chr+2`（传承者的荣耀） |
| `elder_legacy_gift` | `legacy_keep` | 0 | spr-2 | 增加 `mny+2, spr+1`（留给自己的温暖） |
| `mid_magic_experiment` | `experiment_partial` | +4 | 纯正面 | 增加 `hp-5`（实验副作用） |
| `mid_gambling` | `gamble_small` | +2 | 被 gamble_big(+5) 压制 | 给 gamble_small 增加 `spr+1`（小赌怡情） |
| `mid_return_adventure` | `return_bounty` | +5 | 纯正面 | 增加 `spr-2`（赏金任务的黑暗面） |
| `mid_garden_retirement` | `garden_social` | +5 | 纯正面 | 见 3.1 |
| `mid_legacy_review` | `review_regret` | +5 | 纯正面 | 增加 `spr-2`（遗憾的沉重） |
| `mid_apprentice_success` | `apprentice_farewell` | +3 | 已达标 | 可接受 |
| `mid_apprentice_success` | `apprentice_keep` | +4 | 纯正面 | 增加 `spr-1`（放不下的执念） |
| `rescue_from_dungeon` | `rescue_from_dungeon_branch0` | +2 | 有物品收益但需增加维度 | 增加 `hp-5`（营救受伤） |
| `soul_bound` | `soul_bound_branch0` | +4 | 纯正面 | 增加 `spr-1`（灵魂绑定的代价） |
| `lover_curse` | `lover_curse_branch0` | +4 | 纯正面 | 增加 `spr-2`（诅咒的代价） |
| `marriage_anniversary` | `forget_anniversary` | -5 | spr-5 | 改为 `spr-2, mny+2, int+1`（用工作和金钱弥补），net=+1 |
| `final_cataclysm` | `destroy_world` | +1 | 已有代价 | 可接受 |
| `final_cataclysm` | `rebuild_world` | +2 | 已有代价 | 可接受 |
| `elder_final_counting` | `final_battle` | +2 | 纯正面 | 增加 `hp-10`（最终的战斗） |
| `challenge_god_trial` | `god_refuse` | -1 | spr-2 | 增加 `int+2, spr+1`（拒绝后的思考与成长） |
| `challenge_god_trial` | `god_bargain` | -1 | spr-2 | 增加 `mny+2, chr+1`（和神讨价还价的能力） |
| `widowed_wanderer` | `widowed_wanderer_branch0` | +2 | 已达标 | 可接受 |
| `widowed_wanderer` | `widowed_wanderer_branch1` | +1 | 已达标 | 可接受 |

### 3.4 无分支纯正面事件（需要拆分为有选择的分支）

这些事件没有 `branches`，只有纯正面的 `effects`，玩家无法做选择：

| 事件ID | 当前net | 改造要求 |
|--------|---------|----------|
| `become_lord` | +10 | 拆为 2-3 个分支：接受封地（获得权力但失去自由/时间）vs 拒绝（保持自由但失去政治资源） |
| `master_spell` | +10 | 拆为分支：使用新力量（属性大增但代价大）vs 封印（安全但放弃力量） |
| `reincarnated_invention` | +11 | 拆为分支：公开（名利双收但有风险）vs 保密（安全但默默无闻） |
| `starlight_promise` | +7 | 拆为分支：遵守承诺（flag收益但有HP代价）vs 打破承诺（自由但有道德代价） |
| `legend_spread` | +10 | 拆为分支：享受名声（chr+但spr-）vs 低调行事（保持平静） |
| `magic_breakthrough_final` | +10 | 拆为分支：突破极限（属性大增但HP大幅消耗）vs 稳健研究（稳定提升） |
| `peaceful_end` | +4 | 可保持无分支（结局事件） |
| `protect_family` | +4 | 拆为分支：正面迎敌（战斗收益但风险）vs 转移家人（安全但放弃家园） |
| `family_blessing` | +5 | 拆为分支：接受祝福（属性收益但失去自由选择权）vs 婉拒（保持独立但失去增益） |
| `festival_dance` | +5 | 拆为分支：参加舞蹈（chr+但体力消耗）vs 帮忙组织（int+但错过乐趣） |
| `family_dinner` | +2 | 可保持无分支（生活事件） |
| `teaching_others` | +5 | 拆为分支：认真教学（chr+但时间消耗）vs 随意分享（spr+但效果差） |
| `scenic_travel` | +4 | 拆为分支：冒险路线（str+但mny-）vs 文化路线（int+但str-） |
| `elder_legend_verified` | +8 | 拆为分支：接受荣誉（chr+但失去平静）vs 谦逊回应（spr+但社会地位不变） |
| `elder_world_peace` | +6 | 拆为分支：退休享受（spr+）vs 继续守护（str+但hp消耗） |
| `centenarian_celebration` | +14 | 大幅拆分或增加年龄代价 |

---

## 4. 改造优先级

### P0 — 必做（影响最大）

1. **所有 net≥+8 的分支**（19个）— 这是必选项的核心来源
2. **所有 net≤0 的废选项**（~30个）— 这是废选项的核心来源
3. **所有无分支纯正面事件**（~15个）— 没有选择 = 没有策略空间

### P1 — 应做

4. **net 在 +5~+7 之间的分支**（~20个）— 仍可能被所有策略选为最优
5. **同一事件内所有分支 net 相同或极接近**（~15个事件）— 缺乏维度差异

### P2 — 可做

6. **已达标但可优化的分支** — 进一步增强叙事性代价的丰富度

---

## 5. 验收标准

### 量化指标（运行 `npx tsx scripts/test-score-distribution.ts`，5性格×4局=20局）

| 指标 | 当前值 | 阶段1目标 | 测量方法 |
|------|--------|----------|----------|
| 必选项数量 | 28 | ≤5 | "疑似必选项"列表长度 |
| 废选项数量 | 63 | ≤15 | "从未被选中的分支"列表长度 |
| 必选项比例 | ~18% | <5% | 必选项数 / 总触发分支选择次数 |
| 废选项比例 | ~41% | <15% | 废选项数 / 总可选分支数 |
| 5性格选择一致性 | ~100% | <50% | 性格覆盖≥5的分支比例 |
| net≥+8 的分支数 | ~19 | 0 | 代码扫描 events JSON |
| net≤0 的分支数 | ~30 | 0 | 代码扫描 events JSON |
| 无分支纯正面事件(net>0) | ~15 | ≤3 | 代码扫描 events JSON |

### 回归测试

- 改造后所有事件 JSON 必须通过 AJV schema 校验（`data-loader.ts` 的 `validate` 函数）
- 游戏应仍能正常完成一局（不会因事件改造导致死循环或无法推进）
- 所有 5 种性格的平均评分差异应 ≥10 分（确保改造没有消除性格差异化）
- HP 不应在改造后出现大规模死亡（平均寿命应 ≥55 岁）

---

## 6. 补充说明

### 关于测试脚本的局限性
当前测试脚本的策略引擎只考虑数值收益（`positiveScore`, `negativeScore`, `netScore`），不考虑：
- flag 的长期价值（只给 +0.5 分）
- 物品的长期价值（只给 +3 分）
- 叙事体验价值（只通过关键词匹配给 `storyScore`）

这意味着即使我们引入了"叙事性代价"（如 flag 惩罚），如果对应的正面数值收益仍然最高，策略引擎仍会选它。因此**阶段1的核心手段是数值层面的代价-收益对称**，叙事性代价是锦上添花。

### 关于"最优解不存在"的真正解法
代价-收益对称只能消除"纯正面必选项"，但无法消除"可比较的最优解"。真正的"没有最优解"需要：
- 引入**不可比较的收益维度**（阶段2: 表现性选择）
- 引入**概率不确定性**（阶段3: 随机化平衡）
- 引入**长期蝴蝶效应**（阶段4: 事件链非线性后果）

阶段1只是第一步。
