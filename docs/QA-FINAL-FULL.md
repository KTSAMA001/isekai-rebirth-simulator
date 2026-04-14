# QA 最终全面测试报告

> 生成时间: 2026-04-14T06:05:09.718Z
> 测试版本: 4 可玩种族 × 3局（共 12 局）+ 6 条路线专项测试
> 项目: isekai-rebirth-simulator

## 执行摘要

⚠️ 发现 2 个问题：
- P1: 精灵最低HP过低 (精灵-女-A: min=0, 精灵-男-B: min=0, 精灵-女-C: min=0)
- P2: 2 个孤儿 Flag（被引用但无法设置）

## 1. 4 可玩种族全流程模拟（12 局）

### 1.1 总览

| # | 局 | 种族 | 性别 | 寿命 | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 普通年 | 路线 | 路线切换 |
|---|-----|------|------|------|--------|--------|------|------|--------|--------|------|----------|
| 1 | 人类-男-A | human | male | 58 | 37 | 0 | B(小有成就) | 240.7 | 57 | 1 | scholar | none→commoner@1; commoner→scholar@32 |
| 2 | 人类-女-B | human | female | 71 | 46 | 0 | B(小有成就) | 256.1 | 70 | 1 | scholar | none→commoner@1; commoner→scholar@36 |
| 3 | 人类-男-C | human | male | 74 | 49 | 0 | B(小有成就) | 258.5 | 73 | 1 | scholar | none→commoner@1; commoner→scholar@38 |
| 4 | 精灵-女-A | elf | female | 344 | 43 | 0 | B(小有成就) | 243.7 | 344 | 0 | mage | none→commoner@1; commoner→mage@45 |
| 5 | 精灵-男-B | elf | male | 291 | 31 | 0 | B(小有成就) | 248.7 | 291 | 0 | mage | none→commoner@1; commoner→mage@34 |
| 6 | 精灵-女-C | elf | female | 360 | 28 | 0 | B(小有成就) | 252.8 | 360 | 0 | mage | none→commoner@1; commoner→mage@33 |
| 7 | 哥布林-女-A | goblin | female | 44 | 34 | 0 | B(小有成就) | 264.3 | 44 | 0 | scholar | none→commoner@1; commoner→scholar@43 |
| 8 | 哥布林-男-B | goblin | male | 43 | 25 | 0 | B(小有成就) | 239.8 | 43 | 0 | commoner | none→commoner@1 |
| 9 | 哥布林-女-C | goblin | female | 42 | 34 | 0 | B(小有成就) | 233.8 | 42 | 0 | commoner | none→commoner@1 |
| 10 | 矮人-男-A | dwarf | male | 350 | 49 | 0 | B(小有成就) | 244.5 | 324 | 26 | merchant | none→commoner@1; commoner→merchant@33 |
| 11 | 矮人-女-B | dwarf | female | 293 | 40 | 0 | B(小有成就) | 248.6 | 290 | 3 | mage | none→commoner@1; commoner→mage@22 |
| 12 | 矮人-男-C | dwarf | male | 307 | 58 | 0 | B(小有成就) | 246.5 | 304 | 3 | mage | none→commoner@1; commoner→mage@22 |

### 1.2 人类详情

#### 人类-男-A (seed=9001)

- **寿命**: 58 / 100 (58.0%)
- **初始HP**: 37
- **HP范围**: 0 ~ 81
- **评级**: B (小有成就), 分数=240.7
- **事件触发**: 57 年有事件, 1 年平静, 56 个独立事件
- **最大年HP损失**: -21, 最大年HP恢复: +20
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 12, 13, 52, 53, 54, 55, 56, 57
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 32
- **成就**: first_step, ten_lives, human_adaptability, school_founder_ach, dragon_knight, beauty_supreme, male_beauty, famous_author_ach, soul_pure, era_remembered, balanced_finale, iron_will_to_end
- **物品**: 无
- **HP里程碑**: age0=-1, age1=39, age5=44, age10=54, age15=53, age20=62
  age50=65
- **事件序列** (57 个):
  - age 1: [birth_storm] 暴风夜  HP:37→39(+2)
  - age 3: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:41→43(+2)
  - age 4: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:43→44(+1)
  - age 5: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:44→44(+0)
  - age 6: [human_neighbor_grandpa] 隔壁老爷爷的故事  HP:44→46(+2)
  - age 7: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:46→48(+2)
  - age 8: [human_church_school] 教会学堂  HP:48→50(+2)
  - age 9: [human_prayer_class] 祈祷课  HP:50→52(+2)
  - age 10: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:52→54(+2)
  - age 11: [explore_ruins] 废墟探险 (→ 推门进去) HP:54→53(-1)
  - age 12: [young_rival] 少年的对手 (→ 努力超越他) HP:53→47(-6)
  - age 13: [first_love] 初恋的味道 (→ 表白) HP:47→49(+2)
  - age 14: [teen_race_competition] 少年竞技会 (→ 参加跑步) HP:49→51(+2)
  - age 15: [random_nightmare_visit] 不安的梦  HP:51→53(+2)
  - age 16: [random_minor_injury] 小伤  HP:53→54(+1)
  - age 17: [random_stargazing] 观星  HP:54→56(+2)
  - age 18: [human_conscription] 征兵通告 (→ 报名参军) HP:56→58(+2)
  - age 19: [human_romance_at_inn] 旅馆邂逅  HP:58→60(+2)
  - age 20: [human_militia_training] 民兵训练  HP:60→62(+2)
  - age 21: [youth_first_love] 怦然心动 (→ 鼓起勇气搭话) HP:62→64(+2)
  - age 22: [human_marriage_proposal] 家族联姻 (→ 接受安排) HP:64→66(+2)
  - age 23: [human_diplomacy] 种族外交官 (→ 成为精灵与人类之间的桥梁) HP:66→68(+2)
  - age 24: [human_arena_debut] 竞技场初登场 (→ 正面迎战) HP:68→70(+2)
  - age 25: [hunting_trip] 狩猎之旅 (→ 追踪大型猎物) HP:70→67(-3)
  - age 26: [youth_shared_roof] 同住一檐下 (→ 把日子打理顺) HP:67→69(+2)
  - age 27: [human_bandit_raid] 匪徒袭村 (→ 带头反击) HP:69→71(+2)
  - age 28: [youth_short_term_job] 临时差事 (→ 老老实实做完) HP:71→73(+2)
  - age 29: [spr_meditation_retreat] 闭关修炼 (→ 闭关苦修) HP:73→75(+2)
  - age 30: [human_political_election] 参加镇长选举 (→ 参选) HP:75→77(+2)
  - age 31: [adult_teaching_offer] 教学邀请 (→ 欣然接受) HP:77→79(+2)
  - ... 省略 27 个事件 ...
  - age 54: [random_nightmare_visit] 不安的梦 HP:44→39(-5)
  - age 55: [old_rival] 老对手来访 HP:39→33(-6)
  - age 56: [elder_autobiography] 自传 HP:33→27(-6)
  - age 57: [human_old_battlefield] 重访战场 HP:27→20(-7)
  - age 58: [elder_unexpected_visitor] 意外的来访者 HP:20→0(-20)

#### 人类-女-B (seed=9002)

- **寿命**: 71 / 100 (71.0%)
- **初始HP**: 46
- **HP范围**: 0 ~ 120
- **评级**: B (小有成就), 分数=256.1
- **事件触发**: 70 年有事件, 1 年平静, 69 个独立事件
- **最大年HP损失**: -23, 最大年HP恢复: +19
- **HP<50的年龄**: 61, 62, 63, 64, 65, 66, 67, 68, 69, 70
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 36
- **成就**: first_step, ten_lives, human_adaptability, beauty_supreme, school_founder_ach, wisdom_peak, soul_pure, love_and_war, war_hero_ach, famous_author_ach, peaceful_ending, era_remembered
- **物品**: lucky_charm
- **HP里程碑**: age0=-1, age1=51, age5=71, age10=77, age15=82, age20=96
  age50=83
- **事件序列** (70 个):
  - age 1: [birth_blazing_temperament] 火气旺盛  HP:46→51(+5)
  - age 3: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:56→61(+5)
  - age 4: [stray_dog] 流浪狗 (→ 带它回家) HP:61→66(+5)
  - age 5: [random_good_meal] 丰盛的一餐  HP:66→71(+5)
  - age 6: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:71→76(+5)
  - age 7: [random_found_coin] 捡到硬币  HP:76→77(+1)
  - age 8: [human_church_school] 教会学堂  HP:77→77(+0)
  - age 9: [village_feud] 村长之争 (→ 帮弱者说话) HP:77→77(+0)
  - age 10: [child_night_sky] 仰望星空  HP:77→77(+0)
  - age 11: [lost_treasure_map] 藏宝图碎片 (→ 仔细研究) HP:77→77(+0)
  - age 12: [wander_market] 逛集市 (→ 买了一本旧书) HP:77→77(+0)
  - age 13: [first_love] 初恋的味道 (→ 表白) HP:77→77(+0)
  - age 14: [old_soldier_story] 老兵的故事 (→ 认真听完) HP:77→77(+0)
  - age 15: [human_bully_defense] 保护弱小 (→ 挺身而出) HP:77→82(+5)
  - age 16: [human_blacksmith_forge] 锻造初体验  HP:82→86(+4)
  - age 17: [youth_dungeon_first] 第一次进入地下城 (→ 小心翼翼地推进) HP:86→91(+5)
  - age 18: [human_romance_at_inn] 旅馆邂逅  HP:91→96(+5)
  - age 19: [random_nightmare_visit] 不安的梦  HP:96→96(+0)
  - age 20: [human_diplomacy] 种族外交官 (→ 成为精灵与人类之间的桥梁) HP:96→96(+0)
  - age 21: [human_church_service] 教会服务  HP:96→96(+0)
  - age 22: [random_helping_stranger] 帮助陌生人  HP:96→96(+0)
  - age 23: [human_wedding_ceremony] 婚礼  HP:96→96(+0)
  - age 24: [human_market_stall] 市场摆摊 (→ 卖自己做的手工品) HP:96→96(+0)
  - age 25: [human_jousting_tournament] 马上比武大会 (→ 全力以赴) HP:96→96(+0)
  - age 26: [food_culture] 美食之旅 (→ 学习烹饪) HP:96→100(+4)
  - age 27: [human_bandit_raid] 匪徒袭村 (→ 带头反击) HP:100→100(+0)
  - age 28: [adult_rival_encounter] 宿敌重逢 (→ 友好地叙旧) HP:100→105(+5)
  - age 29: [rescue_from_dungeon] 深入魔窟的营救 (→ 独闯魔窟) HP:105→91(-14)
  - age 30: [random_stargazing] 观星  HP:91→96(+5)
  - age 31: [adult_restore_keepsake] 修缮旧物 (→ 自己动手修好) HP:96→101(+5)
  - ... 省略 40 个事件 ...
  - age 67: [elder_last_journey] 最后的旅途 HP:19→13(-6)
  - age 68: [elder_memoir] 撰写回忆录 HP:13→6(-7)
  - age 69: [retirement] 挂剑归隐 HP:6→13(+7)
  - age 70: [divine_vision] 神谕 HP:13→6(-7)
  - age 71: [elder_autobiography] 自传 HP:6→0(-6)

#### 人类-男-C (seed=9003)

- **寿命**: 74 / 100 (74.0%)
- **初始HP**: 49
- **HP范围**: 0 ~ 160
- **评级**: B (小有成就), 分数=258.5
- **事件触发**: 73 年有事件, 1 年平静, 69 个独立事件
- **最大年HP损失**: -37, 最大年HP恢复: +11
- **HP<50的年龄**: 70, 71, 72, 73
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 38
- **成就**: first_step, ten_lives, school_founder_ach, iron_body, beauty_supreme, male_beauty, human_adaptability, soul_pure, famous_author_ach, peaceful_ending, memories_in_hands, legacy_master, era_remembered, balanced_finale, iron_will_to_end
- **物品**: lucky_charm
- **HP里程碑**: age0=-1, age1=53, age5=67, age10=56, age15=76, age20=96
  age50=125
- **事件序列** (73 个):
  - age 1: [birth_human_merchant] 商人之家  HP:49→53(+4)
  - age 3: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:57→61(+4)
  - age 4: [stray_dog] 流浪狗 (→ 带它回家) HP:61→65(+4)
  - age 5: [first_snow] 初雪 (→ 堆雪人) HP:65→67(+2)
  - age 6: [human_harvest_help] 帮忙收割  HP:67→67(+0)
  - age 7: [child_cooking_adventure] 第一次做饭 (→ 认真按步骤来) HP:67→70(+3)
  - age 8: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:70→70(+0)
  - age 9: [child_drowning] 河中溺水 (→ 拼命挣扎) HP:70→52(-18)
  - age 10: [random_good_meal] 丰盛的一餐  HP:52→56(+4)
  - age 11: [old_soldier_story] 老兵的故事 (→ 认真听完) HP:56→60(+4)
  - age 12: [young_rival] 少年的对手 (→ 努力超越他) HP:60→64(+4)
  - age 13: [human_first_job] 第一份工作 (→ 在铁匠铺当学徒) HP:64→68(+4)
  - age 14: [rival_training] 与对手切磋 (→ 接受挑战) HP:68→72(+4)
  - age 15: [pet_companion] 捡到流浪动物 (→ 带回家养) HP:72→76(+4)
  - age 16: [kindness_of_stranger] 陌生人的善意  HP:76→80(+4)
  - age 17: [youth_bandit_ambush] 路遇山贼 (→ 战斗！) HP:80→84(+4)
  - age 18: [star_gazing] 观星 (→ 冥想) HP:84→88(+4)
  - age 19: [human_romance_at_inn] 旅馆邂逅  HP:88→92(+4)
  - age 20: [human_militia_training] 民兵训练  HP:92→96(+4)
  - age 21: [human_noble_encounter] 偶遇贵族 (→ 保持联系) HP:96→100(+4)
  - age 22: [traveling_sage] 云游学者 (→ 跟随学者学习) HP:100→104(+4)
  - age 23: [human_conscription] 征兵通告 (→ 报名参军) HP:104→108(+4)
  - age 24: [human_wedding_ceremony] 婚礼  HP:108→112(+4)
  - age 25: [human_tavern_brawl] 酒馆斗殴 (→ 挥拳就上) HP:112→116(+4)
  - age 26: [adult_haunted_mansion] 闹鬼庄园 (→ 带武器硬闯) HP:116→116(+0)
  - age 27: [harvest_festival] 丰收祭典 (→ 参加各项比赛) HP:116→120(+4)
  - age 28: [random_weather_blessing] 好天气  HP:120→124(+4)
  - age 29: [human_vineyard] 葡萄园  HP:124→128(+4)
  - age 30: [random_weather_blessing] 好天气  HP:128→132(+4)
  - age 31: [marriage_anniversary] 结婚周年纪念 (→ 一起庆祝) HP:132→136(+4)
  - ... 省略 43 个事件 ...
  - age 70: [elder_frail] 风烛残年 HP:61→38(-23)
  - age 71: [human_old_battlefield] 重访战场 HP:38→30(-8)
  - age 72: [elder_sort_keepsakes] 整理珍藏 HP:30→21(-9)
  - age 73: [human_village_elder] 德高望重 HP:21→11(-10)
  - age 74: [elder_technique_pass] 绝学传承 HP:11→0(-11)

### 1.2 精灵详情

#### 精灵-女-A (seed=9011)

- **寿命**: 344 / 500 (68.8%)
- **初始HP**: 43
- **HP范围**: 0 ~ 201
- **评级**: B (小有成就), 分数=243.7
- **事件触发**: 344 年有事件, 0 年平静, 181 个独立事件
- **最大年HP损失**: -33, 最大年HP恢复: +23
- **HP<50的年龄**: 1, 2, 26, 27, 29, 30, 31, 32, 33, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 45
- **成就**: first_step, ten_lives, elf_worldtree_blessed, elf_spirit_bond, soul_pure, elf_star_song_ach, archmage_body, elf_forest_healer_ach, beauty_supreme, scholar_warrior, elf_magic_pinnacle, wisdom_peak, mage_path, iron_body, tower_master_ach, cheated_death_ach, dragon_knight, elf_dragon_bond, elf_council_seat, demon_king_slayer_ach, divine_champion_ach, elemental_lord_ach, archmage_ach, female_archmage, war_hero_ach, legacy_master, elf_mentor_legacy, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle, miracle_afterglow
- **物品**: soul_gem
- **HP里程碑**: age0=-1, age1=46, age5=50, age10=53, age15=53, age20=53
  age50=86
- **事件序列** (344 个):
  - age 1: [birth_storm] 暴风夜  HP:43→46(+3)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:46→49(+3)
  - age 3: [elf_starlight_bath] 星光沐浴 (→ 平静地接受洗礼) HP:49→50(+1)
  - age 4: [elf_animal_friend] 林间小鹿  HP:50→50(+0)
  - age 5: [elf_elvish_calligraphy] 古精灵文书法课 (→ 专注练字，追求完美) HP:50→50(+0)
  - age 6: [elf_first_treesong] 第一次听见树歌 (→ 尝试用魔力回应树灵) HP:50→50(+0)
  - age 7: [elf_butterfly_dance] 蝶舞课堂  HP:50→50(+0)
  - age 8: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:50→53(+3)
  - age 9: [elf_world_tree_pilgrimage] 世界树巡礼 (→ 静心聆听世界树的声音) HP:53→53(+0)
  - age 10: [child_dream_flying] 会飞的梦  HP:53→53(+0)
  - age 11: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:53→53(+0)
  - age 12: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:53→50(-3)
  - age 13: [elf_ancient_library] 远古图书馆  HP:50→53(+3)
  - age 14: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:53→53(+0)
  - age 15: [elf_dream_walker] 梦境行走  HP:53→53(+0)
  - age 16: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:53→53(+0)
  - age 17: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:53→53(+0)
  - age 18: [elf_spirit_animal] 灵魂伙伴 (→ 伸出手触摸它) HP:53→53(+0)
  - age 19: [elf_spirit_deer] 灵鹿相伴  HP:53→53(+0)
  - age 20: [elf_human_encounter] 初遇人类 (→ 友善地打招呼) HP:53→53(+0)
  - age 21: [stray_dog] 流浪狗 (→ 带它回家) HP:53→53(+0)
  - age 22: [elf_starlight_weaving] 星光织衣  HP:53→53(+0)
  - age 23: [elf_human_city_visit] 初访人类城市 (→ 深入了解人类文化) HP:53→53(+0)
  - age 24: [elf_world_tree_communion] 与世界树共鸣  HP:53→53(+0)
  - age 25: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:53→53(+0)
  - age 26: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:53→45(-8)
  - age 27: [elf_beast_tongue] 兽语习得  HP:45→48(+3)
  - age 28: [random_weather_blessing] 好天气  HP:48→51(+3)
  - age 29: [river_discovery] 河底发光 (→ 潜下去捡) HP:51→43(-8)
  - age 30: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:43→38(-5)
  - ... 省略 314 个事件 ...
  - age 340: [random_minor_injury] 小伤 HP:28→29(+1)
  - age 341: [random_minor_injury] 小伤 HP:29→40(+11)
  - age 342: [random_nightmare_visit] 不安的梦 HP:40→37(-3)
  - age 343: [random_nightmare_visit] 不安的梦 HP:37→33(-4)
  - age 344: [random_nightmare_visit] 不安的梦 HP:33→0(-33)

#### 精灵-男-B (seed=9012)

- **寿命**: 291 / 500 (58.2%)
- **初始HP**: 31
- **HP范围**: 0 ~ 223
- **评级**: B (小有成就), 分数=248.7
- **事件触发**: 291 年有事件, 0 年平静, 184 个独立事件
- **最大年HP损失**: -35, 最大年HP恢复: +22
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 34
- **成就**: first_step, ten_lives, elf_spirit_bond, elf_forest_healer_ach, elf_star_song_ach, soul_pure, wisdom_peak, archmage_body, elf_magic_pinnacle, scholar_warrior, beauty_supreme, male_beauty, iron_body, mage_path, elf_worldtree_guardian, tower_master_ach, dragon_knight, elf_dragon_bond, elf_council_seat, demon_king_slayer_ach, divine_champion_ach, archmage_ach, legacy_master, elf_mentor_legacy, war_hero_ach, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle, miracle_afterglow
- **物品**: lucky_charm
- **HP里程碑**: age0=-1, age1=34, age5=46, age10=53, age15=47, age20=53
  age50=96
- **事件序列** (291 个):
  - age 1: [birth_sharp_eyes] 目光过人的婴孩  HP:31→34(+3)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:34→37(+3)
  - age 3: [elf_starlight_bath] 星光沐浴 (→ 平静地接受洗礼) HP:37→40(+3)
  - age 4: [elf_first_treesong] 第一次听见树歌 (→ 尝试用魔力回应树灵) HP:40→43(+3)
  - age 5: [elf_seed_planting] 种下第一棵树  HP:43→46(+3)
  - age 6: [elf_butterfly_dance] 蝶舞课堂  HP:46→49(+3)
  - age 7: [elf_animal_friend] 林间小鹿  HP:49→52(+3)
  - age 8: [elf_herb_gathering] 采药课  HP:52→53(+1)
  - age 9: [elf_talking_to_tree] 与树对话  HP:53→53(+0)
  - age 10: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:53→53(+0)
  - age 11: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:53→53(+0)
  - age 12: [village_festival] 村里祭典 (→ 大吃特吃) HP:53→50(-3)
  - age 13: [elf_ancient_library] 远古图书馆  HP:50→47(-3)
  - age 14: [child_lost_in_woods] 迷路 (→ 跟着星星走) HP:47→47(+0)
  - age 15: [elf_forbidden_book] 禁书 (→ 偷偷翻开) HP:47→47(+0)
  - age 16: [elf_dream_walker] 梦境行走  HP:47→47(+0)
  - age 17: [elf_spirit_animal] 灵魂伙伴 (→ 伸出手触摸它) HP:47→47(+0)
  - age 18: [elf_forest_guardian_test] 森林守卫考核 (→ 与自然和谐共处) HP:47→47(+0)
  - age 19: [child_dream_flying] 会飞的梦  HP:47→50(+3)
  - age 20: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:50→53(+3)
  - age 21: [elf_ranger_path] 游侠之路  HP:53→53(+0)
  - age 22: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:53→56(+3)
  - age 23: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:56→59(+3)
  - age 24: [elf_healing_spring] 治愈之泉  HP:59→65(+6)
  - age 25: [child_night_sky] 仰望星空  HP:65→67(+2)
  - age 26: [elf_ancient_language] 远古精灵语 (→ 花时间破译) HP:67→67(+0)
  - age 27: [elf_starlight_weaving] 星光织衣  HP:67→67(+0)
  - age 28: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:67→67(+0)
  - age 29: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:67→67(+0)
  - age 30: [elf_ancient_magic] 精灵秘术·星辰之歌 (→ 全身心学习星辰之歌) HP:67→70(+3)
  - ... 省略 261 个事件 ...
  - age 287: [random_minor_injury] 小伤 HP:36→33(-3)
  - age 288: [random_minor_injury] 小伤 HP:33→25(-8)
  - age 289: [random_nightmare_visit] 不安的梦 HP:25→33(+8)
  - age 290: [random_minor_injury] 小伤 HP:33→25(-8)
  - age 291: [random_minor_injury] 小伤 HP:25→0(-25)

#### 精灵-女-C (seed=9013)

- **寿命**: 360 / 500 (72.0%)
- **初始HP**: 28
- **HP范围**: 0 ~ 283
- **评级**: B (小有成就), 分数=252.8
- **事件触发**: 360 年有事件, 0 年平静, 210 个独立事件
- **最大年HP损失**: -35, 最大年HP恢复: +23
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 37, 38, 39, 40, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 33
- **成就**: first_step, ten_lives, elf_worldtree_blessed, elf_spirit_bond, elf_star_song_ach, elf_forest_healer_ach, soul_pure, archmage_body, scholar_warrior, elf_magic_pinnacle, wisdom_peak, beauty_supreme, iron_body, mage_path, tower_master_ach, dragon_knight, elf_dragon_bond, single_mother_warrior, elemental_lord_ach, elf_council_seat, divine_champion_ach, lucky_gambler_ach, demon_king_slayer_ach, archmage_ach, female_archmage, legacy_master, elf_mentor_legacy, war_hero_ach, love_and_war, fairy_companion, undying_legend_ach, peaceful_ending, legacy_of_students, famous_author_ach, memories_in_hands, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle
- **物品**: holy_pendant, ancient_relic
- **HP里程碑**: age0=-1, age1=30, age5=39, age10=47, age15=47, age20=47
  age50=78
- **事件序列** (360 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:28→30(+2)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:30→32(+2)
  - age 3: [elf_starlight_bath] 星光沐浴 (→ 平静地接受洗礼) HP:32→34(+2)
  - age 4: [church_orphan] 教会的温暖 (→ 留在教会) HP:34→36(+2)
  - age 5: [elf_world_tree_pilgrimage] 世界树巡礼 (→ 静心聆听世界树的声音) HP:36→39(+3)
  - age 6: [elf_talking_to_tree] 与树对话  HP:39→42(+3)
  - age 7: [elf_first_treesong] 第一次听见树歌 (→ 尝试用魔力回应树灵) HP:42→45(+3)
  - age 8: [elf_first_magic_spark] 第一缕魔火  HP:45→47(+2)
  - age 9: [elf_herb_gathering] 采药课  HP:47→47(+0)
  - age 10: [child_dream_flying] 会飞的梦  HP:47→47(+0)
  - age 11: [village_festival] 村里祭典 (→ 大吃特吃) HP:47→47(+0)
  - age 12: [elf_half_elf_friend] 半精灵朋友 (→ 不顾非议继续做朋友) HP:47→44(-3)
  - age 13: [elf_spirit_animal] 灵魂伙伴 (→ 伸出手触摸它) HP:44→44(+0)
  - age 14: [elf_forest_fire_rescue] 森林火灾救援  HP:44→44(+0)
  - age 15: [elf_ancient_library] 远古图书馆  HP:44→47(+3)
  - age 16: [elf_forbidden_book] 禁书 (→ 偷偷翻开) HP:47→47(+0)
  - age 17: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:47→47(+0)
  - age 18: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:47→47(+0)
  - age 19: [elf_first_century] 第一个百年  HP:47→47(+0)
  - age 20: [noble_kid_revenge] 权贵的欺凌 (→ 咽下这口气) HP:47→47(+0)
  - age 21: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:47→47(+0)
  - age 22: [elf_dwarf_trade] 与矮人贸易 (→ 公平交易) HP:47→47(+0)
  - age 23: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:47→47(+0)
  - age 24: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:47→44(-3)
  - age 25: [elf_world_tree_communion] 与世界树共鸣  HP:44→47(+3)
  - age 26: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:47→50(+3)
  - age 27: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:50→53(+3)
  - age 28: [first_competition] 第一次比赛 (→ 拼尽全力) HP:53→56(+3)
  - age 29: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:56→51(-5)
  - age 30: [elf_ancient_magic] 精灵秘术·星辰之歌 (→ 全身心学习星辰之歌) HP:51→54(+3)
  - ... 省略 330 个事件 ...
  - age 356: [elder_autobiography] 自传 HP:45→38(-7)
  - age 357: [elder_dream_fulfilled] 完成心愿 HP:38→35(-3)
  - age 358: [elder_spirit_trial] 灵魂试炼 HP:35→17(-18)
  - age 359: [elder_kingdom_crisis] 王国危机 HP:17→9(-8)
  - age 360: [elder_sort_keepsakes] 整理珍藏 HP:9→0(-9)

### 1.2 哥布林详情

#### 哥布林-女-A (seed=9021)

- **寿命**: 44 / 60 (73.3%)
- **初始HP**: 34
- **HP范围**: 0 ~ 101
- **评级**: B (小有成就), 分数=264.3
- **事件触发**: 44 年有事件, 0 年平静, 43 个独立事件
- **最大年HP损失**: -25, 最大年HP恢复: +14
- **HP<50的年龄**: 1, 2, 3, 40, 41, 42, 43
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 43
- **成就**: first_step, ten_lives, goblin_diplomat_ach, goblin_trade_king, beauty_supreme, goblin_long_life, soul_pure, era_remembered, balanced_finale
- **物品**: lucky_charm
- **HP里程碑**: age0=-1, age1=38, age5=54, age10=67, age15=72, age20=92
- **事件序列** (44 个):
  - age 1: [birth_goblin_merchant] 黑市世家  HP:34→38(+4)
  - age 2: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:38→42(+4)
  - age 3: [goblin_trash_treasure] 垃圾堆里的宝物 (→ 藏起来慢慢研究) HP:42→46(+4)
  - age 4: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:46→50(+4)
  - age 5: [goblin_shiny_collection] 闪亮收藏  HP:50→54(+4)
  - age 6: [catch_thief] 抓小偷 (→ 追上去) HP:54→58(+4)
  - age 7: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:58→62(+4)
  - age 8: [old_soldier_story] 老兵的故事 (→ 认真听完) HP:62→60(-2)
  - age 9: [random_nightmare_visit] 不安的梦  HP:60→64(+4)
  - age 10: [youth_caravan_guard] 商队护卫 (→ 报名参加) HP:64→67(+3)
  - age 11: [tavern_brawl] 酒馆斗殴 (→ 加入混战) HP:67→56(-11)
  - age 12: [goblin_first_theft] 第一次偷窃 (→ 小心翼翼地行动) HP:56→60(+4)
  - age 13: [traveling_sage] 云游学者 (→ 跟随学者学习) HP:60→64(+4)
  - age 14: [goblin_alchemy_discovery] 误入炼金工坊 (→ 继续实验（危险！）) HP:64→68(+4)
  - age 15: [goblin_night_raid] 夜间突袭 (→ 负责放风) HP:68→72(+4)
  - age 16: [goblin_first_boss_fight] 挑战头领 (→ 正面挑战) HP:72→76(+4)
  - age 17: [youth_shared_roof] 同住一檐下 (→ 把日子打理顺) HP:76→80(+4)
  - age 18: [luk_lottery] 王国彩票 (→ 中大奖了！) HP:80→84(+4)
  - age 19: [goblin_tavern_brawl] 酒馆遭遇战 (→ 用酒瓶反击) HP:84→88(+4)
  - age 20: [goblin_merchant_debut] 第一笔生意  HP:88→92(+4)
  - age 21: [community_leader] 社区领袖 (→ 接受职位) HP:92→96(+4)
  - age 22: [goblin_passing_the_torch] 传承手艺  HP:96→96(+0)
  - age 23: [mid_adopt_orphan] 路边孤儿 (→ 带回家) HP:96→95(-1)
  - age 24: [adult_rival_encounter] 宿敌重逢 (→ 友好地叙旧) HP:95→91(-4)
  - age 25: [goblin_peace_treaty] 和平条约 (→ 以诚意打动对方) HP:91→90(-1)
  - age 26: [goblin_trade_empire] 哥布林的黑市王国 (→ 扩大经营——开设地下拍卖行) HP:90→90(+0)
  - age 27: [random_weather_blessing] 好天气  HP:90→89(-1)
  - age 28: [adult_neighborhood_request] 邻里的请求 (→ 组织大家一起做) HP:89→88(-1)
  - age 29: [random_nightmare_visit] 不安的梦  HP:88→87(-1)
  - age 30: [elder_family_reunion] 天伦之乐 (→ 其乐融融) HP:87→101(+14)
  - ... 省略 14 个事件 ...
  - age 40: [elder_kingdom_crisis] 王国危机 HP:72→47(-25)
  - age 41: [elder_sort_keepsakes] 整理珍藏 HP:47→40(-7)
  - age 42: [mid_mentoring_youth] 指导年轻人 HP:40→32(-8)
  - age 43: [mid_body_decline] 岁月的痕迹 HP:32→13(-19)
  - age 44: [mid_old_friend_reunion] 故友重逢 HP:13→0(-13)

#### 哥布林-男-B (seed=9022)

- **寿命**: 43 / 60 (71.7%)
- **初始HP**: 25
- **HP范围**: 0 ~ 39
- **评级**: B (小有成就), 分数=239.8
- **事件触发**: 43 年有事件, 0 年平静, 42 个独立事件
- **最大年HP损失**: -25, 最大年HP恢复: +11
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42
- **路线**: commoner
- **路线切换**: none→commoner @ age 1
- **成就**: first_step, ten_lives, dragon_knight, goblin_trade_king, goblin_long_life, soul_pure, beauty_supreme, male_beauty, era_remembered
- **物品**: 无
- **HP里程碑**: age0=-1, age1=26, age5=22, age10=27, age15=32, age20=37
- **事件序列** (43 个):
  - age 1: [birth_twins] 双生子  HP:25→26(+1)
  - age 2: [village_festival] 村里祭典 (→ 大吃特吃) HP:26→27(+1)
  - age 3: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:27→20(-7)
  - age 4: [goblin_tunnel_race] 地洞竞速 (→ 拼命跑) HP:20→21(+1)
  - age 5: [random_good_meal] 丰盛的一餐  HP:21→22(+1)
  - age 6: [goblin_human_toy] 人类的玩具  HP:22→23(+1)
  - age 7: [help_farmer] 帮农夫收麦 (→ 帮忙割麦) HP:23→24(+1)
  - age 8: [teen_nightmare] 反复出现的噩梦 (→ 在梦中回应那个声音) HP:24→25(+1)
  - age 9: [teen_secret_discovered] 发现秘密 (→ 公开揭发) HP:25→26(+1)
  - age 10: [star_gazing] 观星 (→ 冥想) HP:26→27(+1)
  - age 11: [random_helping_stranger] 帮助陌生人  HP:27→28(+1)
  - age 12: [goblin_human_kindness] 人类的善意  HP:28→29(+1)
  - age 13: [goblin_underground_race] 地下竞速赛 (→ 用智慧取胜——走近路) HP:29→30(+1)
  - age 14: [kindness_of_stranger] 陌生人的善意  HP:30→31(+1)
  - age 15: [luk_wild_encounter] 野外奇遇 (→ 探索洞穴) HP:31→32(+1)
  - age 16: [random_helping_stranger] 帮助陌生人  HP:32→33(+1)
  - age 17: [goblin_potion_brewing] 毒药与良药 (→ 自己先试喝) HP:33→34(+1)
  - age 18: [random_stargazing] 观星  HP:34→35(+1)
  - age 19: [goblin_merchant_debut] 第一笔生意  HP:35→36(+1)
  - age 20: [goblin_human_language] 学会人类语言  HP:36→37(+1)
  - age 21: [rare_dragon_egg] 龙蛋 (→ 孵化并养育幼龙) HP:37→33(-4)
  - age 22: [goblin_disguise_adventure] 伪装冒险 (→ 小心翼翼不露馅) HP:33→34(+1)
  - age 23: [adult_treasure_map] 破旧的藏宝图 (→ 组队去寻宝) HP:34→35(+1)
  - age 24: [random_weather_blessing] 好天气  HP:35→36(+1)
  - age 25: [goblin_recipe_book] 食谱大全  HP:36→37(+1)
  - age 26: [goblin_elder_respect] 受人尊敬的老哥布林  HP:37→38(+1)
  - age 27: [random_found_coin] 捡到硬币  HP:38→39(+1)
  - age 28: [mid_magic_experiment] 禁忌实验 (→ 全力激活魔法阵) HP:39→20(-19)
  - age 29: [goblin_trade_empire] 哥布林的黑市王国 (→ 扩大经营——开设地下拍卖行) HP:20→21(+1)
  - age 30: [elder_peaceful_days] 宁静时光 (→ 精心打理花园) HP:21→32(+11)
  - ... 省略 13 个事件 ...
  - age 39: [goblin_final_feast] 最后的盛宴 HP:38→34(-4)
  - age 40: [elder_illness] 疾病缠身 HP:34→9(-25)
  - age 41: [elder_sunset_watching] 夕阳 HP:9→8(-1)
  - age 42: [elder_final_gift] 最后的礼物 HP:8→11(+3)
  - age 43: [elder_final_counting] 生命的终点 HP:11→0(-11)

#### 哥布林-女-C (seed=9023)

- **寿命**: 42 / 60 (70.0%)
- **初始HP**: 34
- **HP范围**: 0 ~ 61
- **评级**: B (小有成就), 分数=233.8
- **事件触发**: 42 年有事件, 0 年平静, 42 个独立事件
- **最大年HP损失**: -18, 最大年HP恢复: +6
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 22, 23, 34, 35, 36, 38, 39, 40, 41
- **路线**: commoner
- **路线切换**: none→commoner @ age 1
- **成就**: first_step, ten_lives, goblin_long_life, peaceful_ending, era_remembered
- **物品**: 无
- **HP里程碑**: age0=-1, age1=37, age5=24, age10=39, age15=54, age20=58
- **事件序列** (42 个):
  - age 1: [birth_eclipse] 日蚀之日  HP:34→37(+3)
  - age 2: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:37→40(+3)
  - age 3: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:40→28(-12)
  - age 4: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:28→31(+3)
  - age 5: [river_discovery] 河底发光 (→ 潜下去捡) HP:31→24(-7)
  - age 6: [luk_lucky_coin] 捡到金币 (→ 收起来) HP:24→27(+3)
  - age 7: [first_love] 初恋的味道 (→ 表白) HP:27→30(+3)
  - age 8: [goblin_scavenger_instinct] 天生的寻宝者 (→ 一枚残破的魔法饰物) HP:30→33(+3)
  - age 9: [street_performance] 街头表演 (→ 上台尝试) HP:33→36(+3)
  - age 10: [luk_potion_find] 神秘药水 (→ 一口闷！) HP:36→39(+3)
  - age 11: [random_street_performance] 街头表演  HP:39→42(+3)
  - age 12: [goblin_tribe_challenge] 部落挑战赛 (→ 参加格斗) HP:42→45(+3)
  - age 13: [goblin_wrestling_match] 摔跤比赛  HP:45→48(+3)
  - age 14: [youth_crisis_crossroad] 命运的十字路口 (→ 踏上冒险旅途) HP:48→51(+3)
  - age 15: [dating_start] 开始交往 (→ 正式告白) HP:51→54(+3)
  - age 16: [goblin_alchemy_accident] 炼金事故  HP:54→56(+2)
  - age 17: [soul_bound] 灵魂契约 (→ 接受灵魂契约) HP:56→49(-7)
  - age 18: [goblin_mechanical_genius] 机关天赋 (→ 跟矮人学习机械) HP:49→52(+3)
  - age 19: [goblin_treasure_dive] 寻宝潜水 (→ 搜刮宝物) HP:52→55(+3)
  - age 20: [goblin_rescue_mission] 营救同胞 (→ 正面突袭) HP:55→58(+3)
  - age 21: [goblin_cooking_contest] 烹饪大赛 (→ 坚持传统口味) HP:58→61(+3)
  - age 22: [mid_magic_experiment] 禁忌实验 (→ 全力激活魔法阵) HP:61→44(-17)
  - age 23: [mid_gambling] 地下赌场 (→ 梭哈！) HP:44→47(+3)
  - age 24: [goblin_mine_discovery] 矿脉发现  HP:47→50(+3)
  - age 25: [mid_old_friend_reunion] 故友重逢 (→ 彻夜长谈) HP:50→52(+2)
  - age 26: [mid_familiar_place_changes] 熟悉的地方变了 (→ 参与新的模样) HP:52→54(+2)
  - age 27: [goblin_potion_brewing] 毒药与良药 (→ 自己先试喝) HP:54→56(+2)
  - age 28: [random_nightmare_visit] 不安的梦  HP:56→57(+1)
  - age 29: [mid_existential_crisis] 深夜的独白 (→ 找到新目标) HP:57→58(+1)
  - age 30: [goblin_passing_the_torch] 传承手艺  HP:58→59(+1)
  - ... 省略 12 个事件 ...
  - age 38: [elder_final_gift] 最后的礼物 HP:51→45(-6)
  - age 39: [goblin_tribal_legend] 部落传说 HP:45→37(-8)
  - age 40: [goblin_sunset_hill] 山丘上的日落 HP:37→28(-9)
  - age 41: [elder_passing_wisdom] 智者之言 HP:28→18(-10)
  - age 42: [elder_illness] 疾病缠身 HP:18→0(-18)

### 1.2 矮人详情

#### 矮人-男-A (seed=9031)

- **寿命**: 350 / 400 (87.5%)
- **初始HP**: 49
- **HP范围**: 0 ~ 294
- **评级**: B (小有成就), 分数=244.5
- **事件触发**: 324 年有事件, 26 年平静, 201 个独立事件
- **最大年HP损失**: -38, 最大年HP恢复: +21
- **HP<50的年龄**: 348, 349
- **路线**: merchant
- **路线切换**: none→commoner @ age 1, commoner→merchant @ age 33
- **成就**: first_step, ten_lives, dwarf_dragon_vow_ach, scholar_warrior, dwarf_masterwork_ach, wisdom_peak, beauty_supreme, male_beauty, dwarf_holdfast_ach, iron_body, merchant_empire, dwarf_surface_broker, soul_pure, dwarf_hall_name, dwarf_apprentice_legacy, revenge_done, divine_champion_ach, demon_king_slayer_ach, dragon_knight, dwarf_forge_to_ember, dwarf_dragonfire_legacy, archmage_ach, archmage_body, eternal_wanderer, widowed_hero, famous_author_ach, legacy_of_students, memories_in_hands, peaceful_ending, undying_legend_ach, longevity, eternal_peace, starry_lifetime, hero_ach, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness
- **物品**: soul_gem
- **HP里程碑**: age0=-1, age1=54, age5=73, age10=70, age15=70, age20=63
  age50=133
- **事件序列** (324 个):
  - age 1: [birth_dwarf_forge_ember] 炉边初啼 (→ 在炉火边安静下来) HP:49→54(+5)
  - age 4: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:64→69(+5)
  - age 6: [village_festival] 村里祭典 (→ 大吃特吃) HP:73→73(+0)
  - age 7: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:73→70(-3)
  - age 8: [child_dream_flying] 会飞的梦  HP:70→70(+0)
  - age 9: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:70→70(+0)
  - age 10: [child_dwarf_surface_fair] 第一次去地表集市 (→ 寸步不离商队) HP:70→70(+0)
  - age 11: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:70→70(+0)
  - age 12: [stray_dog] 流浪狗 (→ 带它回家) HP:70→70(+0)
  - age 13: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:70→70(+0)
  - age 14: [child_night_sky] 仰望星空  HP:70→70(+0)
  - age 15: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:70→70(+0)
  - age 16: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:70→59(-11)
  - age 17: [teen_dwarf_choose_master] 拜师之日 (→ 跟锻炉师傅学火候) HP:59→64(+5)
  - age 18: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:64→69(+5)
  - age 19: [grandma_recipes] 奶奶的秘方 (→ 认真学习) HP:69→70(+1)
  - age 20: [random_good_meal] 丰盛的一餐  HP:70→63(-7)
  - age 21: [teen_library_discovery] 图书馆的秘密阁楼 (→ 沉浸在故事中) HP:63→63(+0)
  - age 22: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:63→63(+0)
  - age 23: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:63→68(+5)
  - age 24: [child_cooking_adventure] 第一次做饭 (→ 认真按步骤来) HP:68→73(+5)
  - age 25: [random_minor_injury] 小伤  HP:73→76(+3)
  - age 26: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:76→77(+1)
  - age 27: [teen_dwarf_dragon_relic_vigil] 守望龙族旧迹 (→ 向遗迹行最庄重的礼) HP:77→82(+5)
  - age 28: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:82→83(+1)
  - age 29: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:83→88(+5)
  - age 30: [teen_nightmare] 反复出现的噩梦 (→ 在梦中回应那个声音) HP:88→83(-5)
  - age 31: [teen_secret_discovered] 发现秘密 (→ 公开揭发) HP:83→83(+0)
  - age 32: [merchant_guidance] 商人学徒招募 (→ 拜师学商) HP:83→83(+0)
  - age 33: [teen_race_competition] 少年竞技会 (→ 参加跑步) HP:83→83(+0)
  - ... 省略 294 个事件 ...
  - age 333: [elder_star_gazing_final] 最后的星空 HP:138→134(-4)
  - age 347: [elder_apprentice_return] 学徒归来 HP:59→52(-7)
  - age 348: [elder_legend_verified] 传说被验证 HP:52→45(-7)
  - age 349: [elder_wisdom_seekers] 求知者来访 HP:45→38(-7)
  - age 350: [elder_final_illness] 最后的病榻 HP:38→0(-38)

#### 矮人-女-B (seed=9032)

- **寿命**: 293 / 400 (73.3%)
- **初始HP**: 40
- **HP范围**: 0 ~ 294
- **评级**: B (小有成就), 分数=248.6
- **事件触发**: 290 年有事件, 3 年平静, 178 个独立事件
- **最大年HP损失**: -36, 最大年HP恢复: +24
- **HP<50的年龄**: 1, 2, 14, 15, 289, 290, 291, 292
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 22
- **成就**: first_step, ten_lives, scholar_warrior, beauty_supreme, iron_body, soul_pure, dwarf_masterwork_ach, dwarf_holdfast_ach, mage_path, wisdom_peak, dragon_knight, dwarf_apprentice_legacy, elemental_lord_ach, archmage_body, tower_master_ach, single_mother_warrior, archmage_ach, female_archmage, dwarf_surface_broker, divine_champion_ach, demon_king_slayer_ach, fairy_companion, famous_author_ach, legacy_of_students, undying_legend_ach, peaceful_ending, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness
- **物品**: soul_gem, ancient_relic
- **HP里程碑**: age0=-1, age1=44, age5=60, age10=57, age15=46, age20=66
  age50=87
- **事件序列** (290 个):
  - age 1: [birth_twins] 双生子  HP:40→44(+4)
  - age 4: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:52→56(+4)
  - age 6: [village_festival] 村里祭典 (→ 大吃特吃) HP:60→60(+0)
  - age 7: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:60→57(-3)
  - age 8: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:57→60(+3)
  - age 9: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:60→57(-3)
  - age 10: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:57→57(+0)
  - age 11: [child_dwarf_surface_fair] 第一次去地表集市 (→ 寸步不离商队) HP:57→57(+0)
  - age 12: [stray_dog] 流浪狗 (→ 带它回家) HP:57→57(+0)
  - age 13: [noble_kid_revenge] 权贵的欺凌 (→ 咽下这口气) HP:57→57(+0)
  - age 14: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:57→42(-15)
  - age 15: [child_night_sky] 仰望星空  HP:42→46(+4)
  - age 16: [child_lost_in_woods] 迷路 (→ 跟着星星走) HP:46→50(+4)
  - age 17: [teen_dwarf_choose_master] 拜师之日 (→ 跟锻炉师傅学火候) HP:50→54(+4)
  - age 18: [first_competition] 第一次比赛 (→ 拼尽全力) HP:54→58(+4)
  - age 19: [first_snow] 初雪 (→ 堆雪人) HP:58→62(+4)
  - age 20: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:62→66(+4)
  - age 21: [magic_academy_letter] 魔法学院来信 (→ 入学就读) HP:66→70(+4)
  - age 22: [river_discovery] 河底发光 (→ 潜下去捡) HP:70→74(+4)
  - age 23: [grandma_recipes] 奶奶的秘方 (→ 认真学习) HP:74→77(+3)
  - age 24: [random_weather_blessing] 好天气  HP:77→70(-7)
  - age 25: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:70→62(-8)
  - age 26: [teen_race_competition] 少年竞技会 (→ 参加跑步) HP:62→66(+4)
  - age 27: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:66→70(+4)
  - age 28: [teen_library_discovery] 图书馆的秘密阁楼 (→ 沉浸在故事中) HP:70→74(+4)
  - age 29: [random_found_coin] 捡到硬币  HP:74→78(+4)
  - age 30: [teen_nightmare] 反复出现的噩梦 (→ 在梦中回应那个声音) HP:78→82(+4)
  - age 31: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:82→83(+1)
  - age 32: [wander_market] 逛集市 (→ 买了一本旧书) HP:83→77(-6)
  - age 33: [teen_first_adventure] 人生第一次冒险 (→ 去探索据说闹鬼的废墟) HP:77→77(+0)
  - ... 省略 260 个事件 ...
  - age 289: [elder_spirit_trial] 灵魂试炼 HP:52→34(-18)
  - age 290: [elder_feast_missing_names] 席间空位 HP:34→39(+5)
  - age 291: [elder_last_adventure] 不服老的冒险 HP:39→30(-9)
  - age 292: [elder_dream_fulfilled] 完成心愿 HP:30→29(-1)
  - age 293: [retirement] 挂剑归隐 HP:29→0(-29)

#### 矮人-男-C (seed=9033)

- **寿命**: 307 / 400 (76.8%)
- **初始HP**: 58
- **HP范围**: 0 ~ 282
- **评级**: B (小有成就), 分数=246.5
- **事件触发**: 304 年有事件, 3 年平静, 177 个独立事件
- **最大年HP损失**: -33, 最大年HP恢复: +25
- **HP<50的年龄**: 297, 298, 300, 301, 303, 304, 305, 306
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 22
- **成就**: first_step, ten_lives, dwarf_dragon_vow_ach, scholar_warrior, iron_body, wisdom_peak, dwarf_holdfast_ach, beauty_supreme, male_beauty, dwarf_masterwork_ach, mage_path, archmage_body, soul_pure, dwarf_apprentice_legacy, dwarf_hall_name, tower_master_ach, elemental_lord_ach, dragon_knight, divine_champion_ach, demon_king_slayer_ach, cheated_death_ach, archmage_ach, dwarf_dragonfire_legacy, war_hero_ach, fairy_companion, famous_author_ach, undying_legend_ach, legacy_of_students, memories_in_hands, peaceful_ending, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, miracle_afterglow
- **物品**: soul_gem, lucky_charm
- **HP里程碑**: age0=-1, age1=63, age5=77, age10=77, age15=77, age20=87
  age50=159
- **事件序列** (304 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:58→63(+5)
  - age 4: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:73→73(+0)
  - age 6: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:77→77(+0)
  - age 7: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:77→80(+3)
  - age 8: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:80→80(+0)
  - age 9: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:80→77(-3)
  - age 10: [first_snow] 初雪 (→ 堆雪人) HP:77→77(+0)
  - age 11: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:77→77(+0)
  - age 12: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:77→77(+0)
  - age 13: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:77→69(-8)
  - age 14: [child_night_sky] 仰望星空  HP:69→74(+5)
  - age 15: [grandma_recipes] 奶奶的秘方 (→ 认真学习) HP:74→77(+3)
  - age 16: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:77→70(-7)
  - age 17: [child_lost_in_woods] 迷路 (→ 跟着星星走) HP:70→75(+5)
  - age 18: [first_competition] 第一次比赛 (→ 拼尽全力) HP:75→77(+2)
  - age 19: [child_cooking_adventure] 第一次做饭 (→ 认真按步骤来) HP:77→82(+5)
  - age 20: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:82→87(+5)
  - age 21: [magic_academy_letter] 魔法学院来信 (→ 入学就读) HP:87→92(+5)
  - age 22: [teen_library_discovery] 图书馆的秘密阁楼 (→ 沉浸在故事中) HP:92→96(+4)
  - age 23: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:96→96(+0)
  - age 24: [teen_dwarf_choose_master] 拜师之日 (→ 跟锻炉师傅学火候) HP:96→101(+5)
  - age 25: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:101→106(+5)
  - age 26: [teen_nightmare] 反复出现的噩梦 (→ 在梦中回应那个声音) HP:106→106(+0)
  - age 27: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:106→106(+0)
  - age 28: [village_feud] 村长之争 (→ 帮弱者说话) HP:106→111(+5)
  - age 29: [teen_race_competition] 少年竞技会 (→ 参加跑步) HP:111→113(+2)
  - age 30: [random_minor_injury] 小伤  HP:113→117(+4)
  - age 31: [random_minor_injury] 小伤  HP:117→118(+1)
  - age 32: [teen_dwarf_dragon_relic_vigil] 守望龙族旧迹 (→ 向遗迹行最庄重的礼) HP:118→119(+1)
  - age 33: [explore_ruins] 废墟探险 (→ 推门进去) HP:119→114(-5)
  - ... 省略 274 个事件 ...
  - age 303: [random_nightmare_visit] 不安的梦 HP:51→42(-9)
  - age 304: [random_nightmare_visit] 不安的梦 HP:42→32(-10)
  - age 305: [random_nightmare_visit] 不安的梦 HP:32→35(+3)
  - age 306: [random_nightmare_visit] 不安的梦 HP:35→33(-2)
  - age 307: [elder_frail] 风烛残年 HP:33→0(-33)

## 2. 路线系统专项验证

### 2.1 路线激活测试

| 路线 | 种族 | 激活? | 激活年龄 | 锚点触发 | 锚点缺失 | 路线专属事件 | 寿命 | 评级 |
|------|------|-------|---------|----------|----------|------------|------|------|
| adventurer | human | ✅ | 1 | first_quest | ⚠️ dungeon_explore_1, advanced_dungeon | 2 | 62 | B |
| knight | human | ✅ | 1 | knight_tournament | ⚠️ knight_glory | 3 | 79 | B |
| mage | elf | ✅ | 1 | magic_duel, magic_graduate | ⚠️ magic_exam | 8 | 287 | B |
| merchant | human | ✅ | 1 | 无 | ⚠️ merchant_career, investment_opportunity, become_lord | 0 | 70 | B |
| scholar | dwarf | ✅ | 1 | 无 | ⚠️ write_a_book, disciple_comes | 0 | 366 | B |
| commoner | goblin | ✅ | 1 | 无 | ✅ | 0 | 36 | B |

### 2.2 路线自然切换测试（12 局中的路线切换统计）

有 12 局发生了路线切换：
- 人类-男-A: commoner → commoner @ age 1, commoner → scholar @ age 32
- 人类-女-B: commoner → commoner @ age 1, commoner → scholar @ age 36
- 人类-男-C: commoner → commoner @ age 1, commoner → scholar @ age 38
- 精灵-女-A: commoner → commoner @ age 1, commoner → mage @ age 45
- 精灵-男-B: commoner → commoner @ age 1, commoner → mage @ age 34
- 精灵-女-C: commoner → commoner @ age 1, commoner → mage @ age 33
- 哥布林-女-A: commoner → commoner @ age 1, commoner → scholar @ age 43
- 哥布林-男-B: commoner → commoner @ age 1
- 哥布林-女-C: commoner → commoner @ age 1
- 矮人-男-A: commoner → commoner @ age 1, commoner → merchant @ age 33
- 矮人-女-B: commoner → commoner @ age 1, commoner → mage @ age 22
- 矮人-男-C: commoner → commoner @ age 1, commoner → mage @ age 22

## 3. HP 系统验证

### 3.1 童年保护检查

✅ 没有角色在 10 岁前死亡（童年死亡保护正常）

### 3.2 种族 HP 表现

| 种族 | 平均寿命 | 寿命范围 | 平均初始HP | 平均最低HP | 平均最高HP | HP<50局数 |
|------|---------|---------|-----------|-----------|-----------|-----------|
| human | 67.7 | 58~74 | 44.0 | 0.0 | 120.3 | 3/3 |
| elf | 331.7 | 291~360 | 34.0 | 0.0 | 235.7 | 3/3 |
| goblin | 43.0 | 42~44 | 31.0 | 0.0 | 67.0 | 3/3 |
| dwarf | 316.7 | 293~350 | 49.0 | 0.0 | 290.0 | 3/3 |

### 3.3 衰老模型表现

#### human
- 人类-男-A: Q1(avg=47.2) Q2(avg=64.4) Q3(avg=69.6) Q4(avg=51.3) 死亡age=58
- 人类-女-B: Q1(avg=73.9) Q2(avg=100.1) Q3(avg=92.6) Q4(avg=40.9) 死亡age=71
- 人类-男-C: Q1(avg=67.2) Q2(avg=124.4) Q3(avg=140.7) Q4(avg=81.2) 死亡age=74

#### elf
- 精灵-女-A: Q1(avg=78.0) Q2(avg=152.7) Q3(avg=153.0) Q4(avg=68.0) 死亡age=344
- 精灵-男-B: Q1(avg=80.0) Q2(avg=152.5) Q3(avg=187.7) Q4(avg=103.6) 死亡age=291
- 精灵-女-C: Q1(avg=81.3) Q2(avg=173.5) Q3(avg=253.2) Q4(avg=179.0) 死亡age=360

#### goblin
- 哥布林-女-A: Q1(avg=54.3) Q2(avg=79.6) Q3(avg=89.4) Q4(avg=55.0) 死亡age=44
- 哥布林-男-B: Q1(avg=24.1) Q2(avg=32.5) Q3(avg=32.6) Q4(avg=21.6) 死亡age=43
- 哥布林-女-C: Q1(avg=32.5) Q2(avg=51.9) Q3(avg=53.6) Q4(avg=39.0) 死亡age=42

#### dwarf
- 矮人-男-A: Q1(avg=109.8) Q2(avg=214.6) Q3(avg=265.7) Q4(avg=183.2) 死亡age=350
- 矮人-女-B: Q1(avg=81.7) Q2(avg=183.9) Q3(avg=254.1) Q4(avg=190.7) 死亡age=293
- 矮人-男-C: Q1(avg=127.6) Q2(avg=216.0) Q3(avg=246.1) Q4(avg=170.8) 死亡age=307

## 4. 事件覆盖度

- **总事件数**: 675
- **触发过的事件**: 451 (66.8%)
- **未触发的非unique事件**: 1

### 4.1 按路线统计事件分布

| 路线 | 专属事件数 | 已触发 | 覆盖率 |
|------|-----------|--------|--------|
| mage | 24 | 11 | 45.8% |
| knight | 14 | 3 | 21.4% |
| adventurer | 27 | 2 | 7.4% |
| merchant | 20 | 12 | 60.0% |
| scholar | 14 | 4 | 28.6% |

### 4.2 从未触发的非unique事件（前50个）

- `birth_noble_estate`

## 5. Flag 一致性

- **set_flag 总数**: 252
- **has.flag 引用总数**: 146
- **设置但从未引用**: 108
- **引用但无法设置（孤儿）**: 2

### 5.1 孤儿 Flag（被引用但从未被设置）

- ⚠️ `dungeon_injured` — 被 has.flag 引用但没有事件会 set_flag 这个值
- ⚠️ `miracle_survival` — 被 has.flag 引用但没有事件会 set_flag 这个值

### 5.2 死 Flag（被设置但从未被引用）

共 108 个，展示前 30 个：
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
- `parental_help`
- `bullied_repeat`
- `brave`
- `smart_seeker`
- `noble_grudge`
- `noble_conflict`
- `dirty_player`
- `herbal_knowledge`
- `world_tree_empowered`
- `planted_seed_at_tree`
- `noble_educated`
- `has_pet`
- `fighter_spirit`
- `true_friend`
- `magic_top_student`
- ... 共 108 个

### 5.3 路线入口 Flag 可设置性

| 路线 | 需要 Flag | 可被事件设置? |
|------|-----------|-------------|
| 冒险者 | `guild_member` | ✅ |
| 骑士 | `knight` | ✅ |
| 法师 | `magic_student` | ✅ |
| 商人 | `merchant_apprentice` | ✅ |
| 学者 | `has_student | famous_inventor` | ✅ |

## 6. 问题清单

### P1 — 核心功能异常
- 精灵 精灵-女-A 最低HP降至 0，HP 过低
- 精灵 精灵-男-B 最低HP降至 0，HP 过低
- 精灵 精灵-女-C 最低HP降至 0，HP 过低
- 路线 adventurer (冒险者-人类): 锚点事件未触发: dungeon_explore_1, advanced_dungeon
- 路线 knight (骑士-人类): 锚点事件未触发: knight_glory
- 路线 mage (法师-精灵): 锚点事件未触发: magic_exam
- 路线 merchant (商人-人类): 锚点事件未触发: merchant_career, investment_opportunity, become_lord
- 路线 scholar (学者-矮人): 锚点事件未触发: write_a_book, disciple_comes

### P2 — 非核心功能/数据问题
- 2 个孤儿 Flag: dungeon_injured, miracle_survival
- 108 个死 Flag（设置但从未被引用），可能是冗余数据

## 附录：完整事件 ID 列表

### 各局触发的事件合集

共 451 个独立事件被触发（含路线测试）：

- `adult_business_startup`
- `adult_dragon_rumor`
- `adult_dwarf_hold_alarm`
- `adult_dwarf_masterwork`
- `adult_first_child`
- `adult_guild_promotion`
- `adult_haunted_mansion`
- `adult_neighborhood_request`
- `adult_plague_crisis`
- `adult_restore_keepsake`
- `adult_rival_encounter`
- `adult_teaching_offer`
- `adult_treasure_map`
- `adv_bounty`
- `apprentice_contest`
- `arcane_academy_invitation`
- `arena_champion_invite`
- `avenger_confrontation`
- `avenger_trail`
- `birth_blazing_temperament`
- `birth_dwarf_forge_ember`
- `birth_eclipse`
- `birth_elf_forest_edge`
- `birth_goblin_merchant`
- `birth_human_merchant`
- `birth_human_soldier`
- `birth_sharp_eyes`
- `birth_slums`
- `birth_storm`
- `birth_twins`
- `birth_wilderness`
- `bullied`
- `bullied_fight_back`
- `bullied_repeat`
- `buy_house`
- `catch_thief`
- `chain_dark_past`
- `chain_rise_to_power`
- `challenge_abyss`
- `challenge_final_boss`
- `challenge_god_trial`
- `child_cooking_adventure`
- `child_dream_flying`
- `child_drowning`
- `child_dwarf_first_hammer`
- `child_dwarf_surface_fair`
- `child_first_fight`
- `child_lost_in_woods`
- `child_night_sky`
- `child_plague`
- `child_river_adventure`
- `child_stray_animal`
- `childhood_chase`
- `childhood_hide_seek`
- `childhood_pet`
- `childhood_play`
- `chr_public_speech`
- `church_orphan`
- `community_leader`
- `cryptic_manuscript`
- `dark_cult_aftermath`
- `dark_cult_encounter`
- `dark_mage_choice`
- `dating_deepen`
- `dating_start`
- `divine_vision`
- `dragon_sky_patrol`
- `dragon_ultimate_bond`
- `dragon_youngling_growth`
- `elder_apprentice_return`
- `elder_autobiography`
- `elder_disciple_visit`
- `elder_dream_fulfilled`
- `elder_dwarf_dragonfire_watch`
- `elder_dwarf_last_inspection`
- `elder_family_reunion`
- `elder_feast_missing_names`
- `elder_final_counting`
- `elder_final_gift`
- `elder_final_illness`
- `elder_frail`
- `elder_garden_peace`
- `elder_illness`
- `elder_kingdom_crisis`
- `elder_last_adventure`
- `elder_last_feast`
- `elder_last_journey`
- `elder_legacy_gift`
- `elder_legend_verified`
- `elder_memoir`
- `elder_memory_fade`
- `elder_miracle_recovery`
- `elder_old_enemy`
- `elder_old_letters`
- `elder_passing_wisdom`
- `elder_peaceful_days`
- `elder_sort_keepsakes`
- `elder_spirit_trial`
- `elder_star_gazing_final`
- `elder_sunset_watching`
- `elder_technique_pass`
- `elder_unexpected_visitor`
- `elder_wisdom_seekers`
- `elder_world_peace`
- `elemental_trial`
- `elf_ancient_language`
- `elf_ancient_library`
- `elf_ancient_magic`
- `elf_animal_friend`
- `elf_beast_tongue`
- `elf_butterfly_dance`
- `elf_century_meditation`
- `elf_council_invitation`
- `elf_crystal_cave`
- `elf_dark_elf_encounter`
- `elf_dewdrop_game`
- `elf_diplomatic_mission`
- `elf_dragon_alliance`
- `elf_dream_walker`
- `elf_dream_walker_adult`
- `elf_dwarf_trade`
- `elf_elvish_calligraphy`
- `elf_eternal_garden`
- `elf_eternal_sleep`
- `elf_fading_forest`
- `elf_fading_magic`
- `elf_first_century`
- `elf_first_magic_spark`
- `elf_first_treesong`
- `elf_forbidden_book`
- `elf_forbidden_magic_scroll`
- `elf_forest_corruption`
- `elf_forest_expansion`
- `elf_forest_fire_rescue`
- `elf_forest_guardian_test`
- `elf_half_elf_friend`
- `elf_healing_spring`
- `elf_herb_gathering`
- `elf_human_city_visit`
- `elf_human_encounter`
- `elf_human_friend_aging`
- `elf_lament_for_fallen`
- `elf_last_song`
- `elf_longevity_burden`
- `elf_magic_duel`
- `elf_magic_research`
- `elf_moonlight_lullaby`
- `elf_moonstone_forge`
- `elf_moonwell_ritual`
- `elf_mortal_friend`
- `elf_passing_crown`
- `elf_phoenix_sighting`
- `elf_ranger_path`
- `elf_runic_barrier`
- `elf_seed_planting`
- `elf_silver_harp`
- `elf_spell_weaving`
- `elf_spirit_animal`
- `elf_spirit_deer`
- `elf_star_song`
- `elf_starlight_bath`
- `elf_starlight_weaving`
- `elf_talking_to_tree`
- `elf_teaching_young`
- `elf_time_perception`
- `elf_treesong_mastery`
- `elf_watching_generations`
- `elf_wisdom_council_seat`
- `elf_world_tree_communion`
- `elf_world_tree_pilgrimage`
- `elf_worldtree_guardian`
- `elf_young_elf_mentor`
- `explore_ruins`
- `family_blessing`
- `family_dinner`
- `festival_dance`
- `first_competition`
- `first_love`
- `first_quest`
- `first_snow`
- `food_culture`
- `forbidden_love`
- `forest_camping`
- `gambling_night`
- `goblin_alchemy_accident`
- `goblin_alchemy_discovery`
- `goblin_alliance`
- `goblin_chief_council`
- `goblin_cooking_contest`
- `goblin_disguise_adventure`
- `goblin_dream_of_equality`
- `goblin_elder_respect`
- `goblin_final_feast`
- `goblin_first_boss_fight`
- `goblin_first_theft`
- `goblin_human_kindness`
- `goblin_human_language`
- `goblin_human_toy`
- `goblin_junkyard_palace`
- `goblin_legacy_hoard`
- `goblin_longest_living`
- `goblin_mechanical_genius`
- `goblin_merchant_debut`
- `goblin_mine_discovery`
- `goblin_night_raid`
- `goblin_old_bones_ache`
- `goblin_passing_the_torch`
- `goblin_peace_treaty`
- `goblin_potion_brewing`
- `goblin_rebellion`
- `goblin_recipe_book`
- `goblin_rescue_mission`
- `goblin_scavenger_instinct`
- `goblin_shiny_collection`
- `goblin_sunset_hill`
- `goblin_tavern_brawl`
- `goblin_trade_empire`
- `goblin_trash_treasure`
- `goblin_treasure_dive`
- `goblin_treasure_map`
- `goblin_tribal_legend`
- `goblin_tribe_challenge`
- `goblin_tribe_legacy`
- `goblin_tunnel_race`
- `goblin_underground_race`
- `goblin_wrestling_match`
- `grandma_recipes`
- `guild_recruitment`
- `harvest_festival`
- `heartbreak_growth`
- `help_farmer`
- `human_apprentice_smith`
- `human_arena_debut`
- `human_autumn_harvest_feast`
- `human_bandit_raid`
- `human_barn_fire`
- `human_blacksmith_forge`
- `human_bully_defense`
- `human_child_born`
- `human_church_school`
- `human_church_service`
- `human_community_leader`
- `human_conscription`
- `human_debt_crisis`
- `human_diplomacy`
- `human_diplomatic_mission`
- `human_family_photo`
- `human_family_tradition`
- `human_fathers_sword`
- `human_feudal_politics`
- `human_final_prayer`
- `human_first_job`
- `human_grandchild_laughter`
- `human_grandchildren`
- `human_grey_hair`
- `human_harvest_help`
- `human_horse_taming`
- `human_jousting_tournament`
- `human_king_audience`
- `human_land_dispute`
- `human_last_toast`
- `human_legacy_building`
- `human_legacy_decision`
- `human_market_day`
- `human_market_stall`
- `human_marriage_proposal`
- `human_memoir_writing`
- `human_mentor_youth`
- `human_mercenary_life`
- `human_militia_training`
- `human_neighbor_grandpa`
- `human_noble_encounter`
- `human_old_battlefield`
- `human_old_war_buddy`
- `human_plague_survivor`
- `human_political_election`
- `human_prayer_class`
- `human_retirement_cottage`
- `human_river_crossing`
- `human_romance_at_inn`
- `human_tavern_brawl`
- `human_tavern_owner`
- `human_tax_reform`
- `human_temple_donation`
- `human_trade_caravan`
- `human_trade_fair`
- `human_village_elder`
- `human_village_historian`
- `human_vineyard`
- `human_war_draft_letter`
- `human_war_veteran_return`
- `human_wedding_ceremony`
- `hunting_trip`
- `investment_opportunity`
- `kindness_of_stranger`
- `knight_dragon_quest`
- `knight_siege`
- `knight_tournament`
- `legend_spread`
- `lost_treasure_map`
- `lover_curse`
- `lover_death_battlefield`
- `luk_lottery`
- `luk_lucky_coin`
- `luk_potion_find`
- `luk_wild_encounter`
- `mag_elemental_fusion`
- `mage_arcane_library`
- `mage_elemental_plane`
- `mage_magic_tower`
- `mage_magic_war`
- `magic_academy_letter`
- `magic_breakthrough_final`
- `magic_duel`
- `magic_graduate`
- `magic_theory_class`
- `magical_creature_tame`
- `mana_overflow`
- `market_haggling`
- `marriage_anniversary`
- `marry_adventurer`
- `martial_arts_master`
- `master_spell`
- `merchant_apprentice`
- `merchant_auction`
- `merchant_career`
- `merchant_economic_crisis`
- `merchant_guidance`
- `meteor_shower`
- `mid_adopt_orphan`
- `mid_apprentice_success`
- `mid_body_decline`
- `mid_business_rivalry`
- `mid_chronic_pain`
- `mid_dwarf_apprentice_oath`
- `mid_dwarf_name_in_hall`
- `mid_existential_crisis`
- `mid_familiar_place_changes`
- `mid_found_school`
- `mid_gambling`
- `mid_garden_retirement`
- `mid_health_scare`
- `mid_heir_training`
- `mid_legacy_project`
- `mid_legacy_review`
- `mid_life_reflection`
- `mid_magic_experiment`
- `mid_magic_potion`
- `mid_mentoring_youth`
- `mid_natural_disaster`
- `mid_old_enemy`
- `mid_old_friend_reunion`
- `mid_property_acquisition`
- `mid_return_adventure`
- `mid_scholar_work`
- `mid_slowing_down`
- `mid_vision_decline`
- `midlife_crisis`
- `midlife_new_craft`
- `mny_inherit_uncle`
- `mny_tax_crisis`
- `mny_trade_route`
- `mountain_bandit_leader`
- `mysterious_stranger`
- `neighbor_dispute`
- `noble_admirer`
- `noble_kid_revenge`
- `old_friend_reunion`
- `old_rival`
- `old_soldier_story`
- `part_time_job`
- `part_time_work`
- `peaceful_end`
- `pet_companion`
- `protect_family`
- `quest_parting`
- `rainy_day_adventure`
- `random_found_coin`
- `random_good_meal`
- `random_helping_stranger`
- `random_minor_injury`
- `random_nightmare_visit`
- `random_rainy_contemplation`
- `random_stargazing`
- `random_street_performance`
- `random_training_day`
- `random_weather_blessing`
- `rare_dragon_egg`
- `rare_gods_gift`
- `rare_reincarnation_hint`
- `rare_time_loop`
- `rescue_from_dungeon`
- `retirement`
- `rival_training`
- `river_discovery`
- `river_fishing`
- `scenic_travel`
- `scholar_guidance`
- `soul_bound`
- `spr_curse_breaker`
- `spr_divine_sign`
- `spr_dream_vision`
- `spr_meditation_retreat`
- `spr_near_death`
- `spr_spirit_animal`
- `squire_opportunity`
- `stand_up_moment`
- `star_gazing`
- `starlight_promise`
- `steal_sweets`
- `stray_dog`
- `street_performance`
- `street_performer`
- `student_successor`
- `tavern_brawl`
- `teaching_others`
- `teen_dwarf_choose_master`
- `teen_dwarf_dragon_relic_vigil`
- `teen_first_adventure`
- `teen_first_errand`
- `teen_future_talk`
- `teen_library_discovery`
- `teen_mentor_meeting`
- `teen_nightmare`
- `teen_race_competition`
- `teen_secret_discovered`
- `teen_traveling_circus`
- `traveling_merchant`
- `traveling_sage`
- `tree_climbing`
- `village_festival`
- `village_feud`
- `village_race`
- `wander_market`
- `war_aftermath`
- `war_breaks_out`
- `wedding_ceremony`
- `write_a_book`
- `young_rival`
- `youth_bandit_ambush`
- `youth_caravan_guard`
- `youth_crisis_crossroad`
- `youth_dungeon_first`
- `youth_dwarf_first_commission`
- `youth_dwarf_surface_caravan`
- `youth_first_love`
- `youth_gambling_den`
- `youth_mysterious_stranger`
- `youth_shared_roof`
- `youth_short_term_job`
- `youth_tavern_rumor`