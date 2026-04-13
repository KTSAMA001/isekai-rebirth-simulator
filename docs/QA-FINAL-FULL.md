# QA 最终全面测试报告

> 生成时间: 2026-04-13T00:13:27.459Z
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
| 1 | 人类-男-A | human | male | 80 | 37 | 0 | B(小有成就) | 267.5 | 79 | 1 | scholar | none→commoner@1; commoner→scholar@32 |
| 2 | 人类-男-C | human | male | 122 | 49 | 0 | B(小有成就) | 263.5 | 86 | 36 | scholar | none→commoner@1; commoner→scholar@38 |
| 3 | 精灵-女-A | elf | female | 410 | 34 | 0 | B(小有成就) | 262.4 | 400 | 10 | mage | none→commoner@1; commoner→mage@17 |
| 4 | 精灵-男-B | elf | male | 361 | 25 | 0 | B(小有成就) | 257.2 | 361 | 0 | scholar | none→commoner@1; commoner→scholar@43 |
| 5 | 精灵-女-C | elf | female | 450 | 25 | 0 | B(小有成就) | 275.9 | 400 | 50 | adventurer | none→commoner@1; commoner→adventurer@34 |
| 6 | 哥布林-男-B | goblin | male | 47 | 25 | 0 | A(声名远扬) | 286.6 | 47 | 0 | scholar | none→commoner@1; commoner→scholar@28 |
| 7 | 哥布林-女-C | goblin | female | 54 | 25 | 0 | B(小有成就) | 265.6 | 54 | 0 | commoner | none→commoner@1 |
| 8 | 矮人-男-A | dwarf | male | 474 | 49 | 0 | B(小有成就) | 262.6 | 317 | 157 | adventurer | none→commoner@1; commoner→adventurer@32 |
| 9 | 矮人-女-B | dwarf | female | 446 | 40 | 0 | B(小有成就) | 270.1 | 317 | 129 | adventurer | none→commoner@1; commoner→adventurer@29 |
| 10 | 矮人-男-C | dwarf | male | 466 | 58 | 0 | B(小有成就) | 244.5 | 317 | 149 | scholar | none→commoner@1; commoner→scholar@47 |

### 1.2 人类详情

#### 人类-男-A (seed=9001)

- **寿命**: 80 / 100 (80.0%)
- **初始HP**: 37
- **HP范围**: 0 ~ 100
- **评级**: B (小有成就), 分数=267.5
- **事件触发**: 79 年有事件, 1 年平静, 78 个独立事件
- **最大年HP损失**: -28, 最大年HP恢复: +22
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 12, 13, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 32
- **成就**: first_step, ten_lives, human_adaptability, school_founder_ach, dragon_knight, beauty_supreme, male_beauty, famous_author_ach, soul_pure, legacy_of_students, longevity, era_remembered
- **物品**: 无
- **HP里程碑**: age0=-1, age1=39, age5=44, age10=54, age15=53, age20=62
  age50=99
- **事件序列** (79 个):
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
  - ... 省略 49 个事件 ...
  - age 76: [elder_sunset_watching] 夕阳 HP:14→12(-2)
  - age 77: [human_last_toast] 最后一杯酒 HP:12→10(-2)
  - age 78: [random_weather_blessing] 好天气 HP:10→8(-2)
  - age 79: [human_final_prayer] 最后的祈祷 HP:8→6(-2)
  - age 80: [elder_apprentice_return] 学徒归来 HP:6→0(-6)

#### 人类-男-C (seed=9003)

- **寿命**: 122 / 100 (122.0%)
- **初始HP**: 49
- **HP范围**: 0 ~ 160
- **评级**: B (小有成就), 分数=263.5
- **事件触发**: 86 年有事件, 36 年平静, 82 个独立事件
- **最大年HP损失**: -42, 最大年HP恢复: +14
- **HP<50的年龄**: 114, 115, 116, 117, 118, 119, 120, 121
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 38
- **成就**: first_step, ten_lives, school_founder_ach, iron_body, beauty_supreme, male_beauty, human_adaptability, soul_pure, famous_author_ach, peaceful_ending, memories_in_hands, longevity, eternal_peace, human_centenarian, era_remembered, balanced_finale, iron_will_to_end, century_witness, miracle_afterglow
- **物品**: lucky_charm
- **HP里程碑**: age0=-1, age1=53, age5=67, age10=56, age15=76, age20=96
  age50=126
- **事件序列** (86 个):
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
  - ... 省略 56 个事件 ...
  - age 83: [elder_apprentice_return] 学徒归来 HP:123→112(-11)
  - age 84: [elder_memory_fade] 渐渐模糊的记忆 HP:112→111(-1)
  - age 85: [elder_world_peace] 和平降临 HP:111→110(-1)
  - age 86: [elder_wisdom_seekers] 求知者来访 HP:110→110(+0)
  - age 100: [centenarian_celebration] 百岁庆典 HP:99→93(-6)

### 1.2 精灵详情

#### 精灵-女-A (seed=9011)

- **寿命**: 410 / 500 (82.0%)
- **初始HP**: 34
- **HP范围**: 0 ~ 175
- **评级**: B (小有成就), 分数=262.4
- **事件触发**: 400 年有事件, 10 年平静, 182 个独立事件
- **最大年HP损失**: -34, 最大年HP恢复: +22
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 17
- **成就**: first_step, ten_lives, elf_worldtree_blessed, mage_path, elf_forest_healer_ach, archmage_body, elf_star_song_ach, wisdom_peak, beauty_supreme, elf_magic_pinnacle, widowed_hero, soul_pure, longevity, archmage_ach, female_archmage, scholar_warrior, elf_worldtree_guardian, famous_author_ach, undying_legend_ach, fairy_companion, tower_master_ach, dragon_knight, elf_dragon_bond, elf_council_seat, elemental_lord_ach, memories_in_hands, hero_ach, revenge_done, demon_king_slayer_ach, iron_body, divine_champion_ach, legacy_master, elf_mentor_legacy, ascended_ach, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle
- **物品**: lucky_charm, ancient_relic
- **HP里程碑**: age0=-1, age1=36, age5=40, age10=37, age15=32, age20=42
  age50=56
- **事件序列** (400 个):
  - age 1: [birth_storm] 暴风夜  HP:34→36(+2)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:36→38(+2)
  - age 3: [elf_starlight_bath] 星光沐浴 (→ 平静地接受洗礼) HP:38→40(+2)
  - age 4: [elf_animal_friend] 林间小鹿  HP:40→40(+0)
  - age 5: [elf_elvish_calligraphy] 古精灵文书法课 (→ 专注练字，追求完美) HP:40→40(+0)
  - age 6: [elf_world_tree_pilgrimage] 世界树巡礼 (→ 静心聆听世界树的声音) HP:40→40(+0)
  - age 7: [elf_first_magic_spark] 第一缕魔火  HP:40→40(+0)
  - age 8: [elf_seed_planting] 种下第一棵树  HP:40→40(+0)
  - age 9: [village_festival] 村里祭典 (→ 大吃特吃) HP:40→40(+0)
  - age 10: [random_weather_blessing] 好天气  HP:40→37(-3)
  - age 11: [stray_dog] 流浪狗 (→ 带它回家) HP:37→37(+0)
  - age 12: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:37→37(+0)
  - age 13: [elf_ancient_ruins] 远古精灵遗迹 (→ 临摹壁画上的符文) HP:37→30(-7)
  - age 14: [elf_archery_training] 精灵弓术修行 (→ 苦练到百步穿杨) HP:30→30(+0)
  - age 15: [elf_dream_walker] 梦境行走  HP:30→32(+2)
  - age 16: [magic_academy_letter] 魔法学院来信 (→ 入学就读) HP:32→34(+2)
  - age 17: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:34→36(+2)
  - age 18: [elf_forest_guardian_test] 森林守卫考核 (→ 与自然和谐共处) HP:36→38(+2)
  - age 19: [random_stargazing] 观星  HP:38→40(+2)
  - age 20: [magic_graduate] 魔法学院毕业 (→ 继续深造研究) HP:40→42(+2)
  - age 21: [child_dream_flying] 会飞的梦  HP:42→44(+2)
  - age 22: [old_soldier_story] 老兵的故事 (→ 认真听完) HP:44→46(+2)
  - age 23: [elf_dwarf_trade] 与矮人贸易 (→ 公平交易) HP:46→48(+2)
  - age 24: [teen_traveling_circus] 流浪马戏团 (→ 偷偷学杂技) HP:48→50(+2)
  - age 25: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:50→52(+2)
  - age 26: [first_love] 初恋的味道 (→ 表白) HP:52→54(+2)
  - age 27: [help_farmer] 帮农夫收麦 (→ 帮忙割麦) HP:54→56(+2)
  - age 28: [elf_ranger_path] 游侠之路  HP:56→58(+2)
  - age 29: [random_good_meal] 丰盛的一餐  HP:58→60(+2)
  - age 30: [river_discovery] 河底发光 (→ 潜下去捡) HP:60→52(-8)
  - ... 省略 370 个事件 ...
  - age 396: [random_nightmare_visit] 不安的梦 HP:51→49(-2)
  - age 397: [random_nightmare_visit] 不安的梦 HP:49→47(-2)
  - age 398: [random_nightmare_visit] 不安的梦 HP:47→45(-2)
  - age 399: [random_nightmare_visit] 不安的梦 HP:45→43(-2)
  - age 400: [random_nightmare_visit] 不安的梦 HP:43→41(-2)

#### 精灵-男-B (seed=9012)

- **寿命**: 361 / 500 (72.2%)
- **初始HP**: 25
- **HP范围**: 0 ~ 100
- **评级**: B (小有成就), 分数=257.2
- **事件触发**: 361 年有事件, 0 年平静, 183 个独立事件
- **最大年HP损失**: -29, 最大年HP恢复: +22
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 57, 58, 59, 60, 100, 128, 129, 130, 131, 132, 147, 148, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 175, 177, 178, 179, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 43
- **成就**: first_step, ten_lives, elf_spirit_bond, elf_forest_healer_ach, soul_pure, wisdom_peak, archmage_body, beauty_supreme, male_beauty, elf_star_song_ach, elf_magic_pinnacle, longevity, archmage_ach, cheated_death_ach, dragon_knight, elf_dragon_bond, famous_author_ach, undying_legend_ach, memories_in_hands, legacy_of_students, peaceful_ending, eternal_peace, elf_council_seat, hero_ach, divine_champion_ach, centenarian, master_of_all, legacy_master, elf_mentor_legacy, era_remembered, balanced_finale, arcane_reserve_final, century_witness, elf_long_cycle, miracle_afterglow
- **物品**: ancient_relic
- **HP里程碑**: age0=-1, age1=27, age5=35, age10=44, age15=44, age20=50
  age50=70
- **事件序列** (361 个):
  - age 1: [birth_eclipse] 日蚀之日  HP:25→27(+2)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:27→29(+2)
  - age 3: [elf_starlight_bath] 星光沐浴 (→ 平静地接受洗礼) HP:29→31(+2)
  - age 4: [elf_first_treesong] 第一次听见树歌 (→ 尝试用魔力回应树灵) HP:31→33(+2)
  - age 5: [elf_butterfly_dance] 蝶舞课堂  HP:33→35(+2)
  - age 6: [elf_elvish_calligraphy] 古精灵文书法课 (→ 专注练字，追求完美) HP:35→37(+2)
  - age 7: [elf_talking_to_tree] 与树对话  HP:37→39(+2)
  - age 8: [elf_herb_gathering] 采药课  HP:39→41(+2)
  - age 9: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:41→43(+2)
  - age 10: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:43→44(+1)
  - age 11: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:44→44(+0)
  - age 12: [stray_dog] 流浪狗 (→ 带它回家) HP:44→44(+0)
  - age 13: [elf_ancient_library] 远古图书馆  HP:44→44(+0)
  - age 14: [elf_spirit_animal] 灵魂伙伴 (→ 伸出手触摸它) HP:44→44(+0)
  - age 15: [elf_half_elf_friend] 半精灵朋友 (→ 不顾非议继续做朋友) HP:44→44(+0)
  - age 16: [elf_forbidden_book] 禁书 (→ 偷偷翻开) HP:44→44(+0)
  - age 17: [elf_forest_guardian_test] 森林守卫考核 (→ 与自然和谐共处) HP:44→44(+0)
  - age 18: [child_night_sky] 仰望星空  HP:44→46(+2)
  - age 19: [elf_crystal_weaving] 水晶织法 (→ 专心编织) HP:46→48(+2)
  - age 20: [young_rival] 少年的对手 (→ 努力超越他) HP:48→50(+2)
  - age 21: [elf_painting_century] 百年画作  HP:50→52(+2)
  - age 22: [wander_market] 逛集市 (→ 买了一本旧书) HP:52→54(+2)
  - age 23: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:54→56(+2)
  - age 24: [elf_dwarf_trade] 与矮人贸易 (→ 公平交易) HP:56→57(+1)
  - age 25: [elf_century_meditation] 百年冥想 (→ 专注内心的平静) HP:57→57(+0)
  - age 26: [random_street_performance] 街头表演  HP:57→57(+0)
  - age 27: [elf_ranger_path] 游侠之路  HP:57→57(+0)
  - age 28: [first_love] 初恋的味道 (→ 表白) HP:57→59(+2)
  - age 29: [elf_beast_tongue] 兽语习得  HP:59→61(+2)
  - age 30: [elf_ancient_magic] 精灵秘术·星辰之歌 (→ 全身心学习星辰之歌) HP:61→63(+2)
  - ... 省略 331 个事件 ...
  - age 357: [random_nightmare_visit] 不安的梦 HP:19→18(-1)
  - age 358: [random_nightmare_visit] 不安的梦 HP:18→17(-1)
  - age 359: [random_nightmare_visit] 不安的梦 HP:17→15(-2)
  - age 360: [random_nightmare_visit] 不安的梦 HP:15→13(-2)
  - age 361: [elder_final_counting] 生命的终点 HP:13→0(-13)

#### 精灵-女-C (seed=9013)

- **寿命**: 450 / 500 (90.0%)
- **初始HP**: 25
- **HP范围**: 0 ~ 129
- **评级**: B (小有成就), 分数=275.9
- **事件触发**: 400 年有事件, 50 年平静, 176 个独立事件
- **最大年HP损失**: -31, 最大年HP恢复: +22
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 39, 40, 41, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449
- **路线**: adventurer
- **路线切换**: none→commoner @ age 1, commoner→adventurer @ age 34
- **成就**: first_step, ten_lives, elf_worldtree_blessed, elf_spirit_bond, soul_pure, elf_forest_healer_ach, eternal_wanderer, wisdom_peak, archmage_body, beauty_supreme, longevity, archmage_ach, female_archmage, elf_magic_pinnacle, cheated_death_ach, elf_star_song_ach, famous_author_ach, legacy_of_students, peaceful_ending, eternal_peace, elf_worldtree_guardian, dragon_knight, elf_dragon_bond, elf_council_seat, scholar_warrior, divine_champion_ach, demon_king_slayer_ach, legacy_master, elf_mentor_legacy, starry_lifetime, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, elf_long_cycle
- **物品**: holy_pendant, ancient_relic
- **HP里程碑**: age0=-1, age1=26, age5=30, age10=36, age15=44, age20=53
  age50=66
- **事件序列** (400 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:25→26(+1)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:26→27(+1)
  - age 3: [elf_starlight_bath] 星光沐浴 (→ 平静地接受洗礼) HP:27→28(+1)
  - age 4: [elf_dewdrop_game] 露珠捉迷藏  HP:28→29(+1)
  - age 5: [elf_world_tree_pilgrimage] 世界树巡礼 (→ 静心聆听世界树的声音) HP:29→30(+1)
  - age 6: [elf_talking_to_tree] 与树对话  HP:30→31(+1)
  - age 7: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:31→32(+1)
  - age 8: [elf_first_magic_spark] 第一缕魔火  HP:32→33(+1)
  - age 9: [church_orphan] 教会的温暖 (→ 留在教会) HP:33→34(+1)
  - age 10: [random_weather_blessing] 好天气  HP:34→36(+2)
  - age 11: [child_night_sky] 仰望星空  HP:36→38(+2)
  - age 12: [random_weather_blessing] 好天气  HP:38→40(+2)
  - age 13: [elf_archery_training] 精灵弓术修行 (→ 苦练到百步穿杨) HP:40→40(+0)
  - age 14: [random_found_coin] 捡到硬币  HP:40→42(+2)
  - age 15: [child_cooking_adventure] 第一次做饭 (→ 认真按步骤来) HP:42→44(+2)
  - age 16: [elf_waterfall_meditation] 瀑布修行  HP:44→46(+2)
  - age 17: [elf_spirit_animal] 灵魂伙伴 (→ 伸出手触摸它) HP:46→48(+2)
  - age 18: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:48→50(+2)
  - age 19: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:50→52(+2)
  - age 20: [elf_world_tree_communion] 与世界树共鸣  HP:52→53(+1)
  - age 21: [first_snow] 初雪 (→ 堆雪人) HP:53→53(+0)
  - age 22: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:53→53(+0)
  - age 23: [teen_traveling_circus] 流浪马戏团 (→ 偷偷学杂技) HP:53→53(+0)
  - age 24: [first_love] 初恋的味道 (→ 表白) HP:53→55(+2)
  - age 25: [random_street_performance] 街头表演  HP:55→57(+2)
  - age 26: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:57→57(+0)
  - age 27: [teen_first_errand] 第一次独自办事 (→ 稳稳办妥) HP:57→57(+0)
  - age 28: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:57→57(+0)
  - age 29: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:57→51(-6)
  - age 30: [elf_painting_century] 百年画作  HP:51→53(+2)
  - ... 省略 370 个事件 ...
  - age 396: [random_nightmare_visit] 不安的梦 HP:95→94(-1)
  - age 397: [random_nightmare_visit] 不安的梦 HP:94→93(-1)
  - age 398: [random_nightmare_visit] 不安的梦 HP:93→92(-1)
  - age 399: [random_nightmare_visit] 不安的梦 HP:92→91(-1)
  - age 400: [random_nightmare_visit] 不安的梦 HP:91→90(-1)

### 1.2 哥布林详情

#### 哥布林-男-B (seed=9022)

- **寿命**: 47 / 60 (78.3%)
- **初始HP**: 25
- **HP范围**: 0 ~ 46
- **评级**: A (声名远扬), 分数=286.6
- **事件触发**: 47 年有事件, 0 年平静, 47 个独立事件
- **最大年HP损失**: -36, 最大年HP恢复: +11
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 28
- **成就**: first_step, ten_lives, lucky_gambler_ach, goblin_sage_ach, goblin_long_life, beauty_supreme, male_beauty, era_remembered, legendary_epilogue, fortune_smile_final
- **物品**: 无
- **HP里程碑**: age0=-1, age1=26, age5=21, age10=26, age15=31, age20=36
- **事件序列** (47 个):
  - age 1: [birth_twins] 双生子  HP:25→26(+1)
  - age 2: [village_festival] 村里祭典 (→ 大吃特吃) HP:26→27(+1)
  - age 3: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:27→19(-8)
  - age 4: [goblin_tunnel_race] 地洞竞速 (→ 拼命跑) HP:19→20(+1)
  - age 5: [random_good_meal] 丰盛的一餐  HP:20→21(+1)
  - age 6: [goblin_mushroom_garden] 蘑菇花园  HP:21→22(+1)
  - age 7: [goblin_first_heist] 第一次偷东西 (→ 快速偷到跑回来) HP:22→23(+1)
  - age 8: [teen_nightmare] 反复出现的噩梦 (→ 在梦中回应那个声音) HP:23→24(+1)
  - age 9: [teen_mentor_meeting] 遇见师傅 (→ 学习剑技) HP:24→25(+1)
  - age 10: [street_performance] 街头表演 (→ 上台尝试) HP:25→26(+1)
  - age 11: [goblin_human_language_teen] 偷学人类语言  HP:26→27(+1)
  - age 12: [youth_tavern_rumor] 酒馆传闻 (→ 凑过去听) HP:27→28(+1)
  - age 13: [luk_lottery] 王国彩票 (→ 中大奖了！) HP:28→29(+1)
  - age 14: [goblin_pet_rat] 驯化洞鼠  HP:29→30(+1)
  - age 15: [mid_gambling] 地下赌场 (→ 梭哈！) HP:30→31(+1)
  - age 16: [luk_wild_encounter] 野外奇遇 (→ 探索洞穴) HP:31→32(+1)
  - age 17: [harvest_festival] 丰收祭典 (→ 参加各项比赛) HP:32→33(+1)
  - age 18: [goblin_scrap_invention] 废品发明  HP:33→34(+1)
  - age 19: [goblin_human_language] 学会人类语言  HP:34→35(+1)
  - age 20: [gambling_night] 赌场之夜 (→ 放手一搏) HP:35→36(+1)
  - age 21: [goblin_disguise_adventure] 伪装冒险 (→ 小心翼翼不露馅) HP:36→37(+1)
  - age 22: [community_leader] 社区领袖 (→ 接受职位) HP:37→38(+1)
  - age 23: [goblin_passing_the_torch] 传承手艺  HP:38→39(+1)
  - age 24: [goblin_chief_council] 首领议事会  HP:39→40(+1)
  - age 25: [mid_health_scare] 健康警报 (→ 去找治疗师) HP:40→39(-1)
  - age 26: [goblin_old_bones_ache] 骨头疼  HP:39→39(+0)
  - age 27: [goblin_last_invention] 最后的发明  HP:39→40(+1)
  - age 28: [student_successor] 收徒传艺 (→ 严格教导) HP:40→41(+1)
  - age 29: [goblin_elder_wisdom] 老哥布林的智慧  HP:41→42(+1)
  - age 30: [adult_neighborhood_request] 邻里的请求 (→ 组织大家一起做) HP:42→43(+1)
  - ... 省略 17 个事件 ...
  - age 43: [elder_legacy_gift] 传家之宝 HP:10→11(+1)
  - age 44: [elder_final_gift] 最后的礼物 HP:11→12(+1)
  - age 45: [elder_last_feast] 最后的盛宴 HP:12→12(+0)
  - age 46: [elder_sort_keepsakes] 整理珍藏 HP:12→12(+0)
  - age 47: [elder_frail] 风烛残年 HP:12→0(-12)

#### 哥布林-女-C (seed=9023)

- **寿命**: 54 / 60 (90.0%)
- **初始HP**: 25
- **HP范围**: 0 ~ 75
- **评级**: B (小有成就), 分数=265.6
- **事件触发**: 54 年有事件, 0 年平静, 53 个独立事件
- **最大年HP损失**: -22, 最大年HP恢复: +12
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 45, 46, 47, 48, 49, 50, 51, 52, 53
- **路线**: commoner
- **路线切换**: none→commoner @ age 1
- **成就**: first_step, ten_lives, goblin_diplomat_ach, beauty_supreme, goblin_long_life, memories_in_hands, soul_pure, era_remembered, goblin_beyond_fate
- **物品**: 无
- **HP里程碑**: age0=-1, age1=27, age5=10, age10=20, age15=30, age20=37
  age50=36
- **事件序列** (54 个):
  - age 1: [birth_silver_tongue_house] 会来事的孩子  HP:25→27(+2)
  - age 2: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:27→29(+2)
  - age 3: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:29→16(-13)
  - age 4: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:16→18(+2)
  - age 5: [river_discovery] 河底发光 (→ 潜下去捡) HP:18→10(-8)
  - age 6: [catch_thief] 抓小偷 (→ 追上去) HP:10→12(+2)
  - age 7: [first_love] 初恋的味道 (→ 表白) HP:12→14(+2)
  - age 8: [goblin_scavenger_instinct] 天生的寻宝者 (→ 一枚残破的魔法饰物) HP:14→16(+2)
  - age 9: [street_performance] 街头表演 (→ 上台尝试) HP:16→18(+2)
  - age 10: [luk_potion_find] 神秘药水 (→ 一口闷！) HP:18→20(+2)
  - age 11: [random_rainy_contemplation] 雨中沉思  HP:20→22(+2)
  - age 12: [goblin_tribe_challenge] 部落挑战赛 (→ 参加格斗) HP:22→24(+2)
  - age 13: [kindness_of_stranger] 陌生人的善意  HP:24→26(+2)
  - age 14: [goblin_cook_master] 暗黑料理大师  HP:26→28(+2)
  - age 15: [dating_start] 开始交往 (→ 正式告白) HP:28→30(+2)
  - age 16: [goblin_first_boss_fight] 挑战头领 (→ 正面挑战) HP:30→29(-1)
  - age 17: [goblin_cooking_contest] 烹饪大赛 (→ 坚持传统口味) HP:29→31(+2)
  - age 18: [goblin_sewer_kingdom] 下水道王国 (→ 当一个好首领) HP:31→33(+2)
  - age 19: [goblin_rebellion] 反抗压迫 (→ 组织地下反抗) HP:33→35(+2)
  - age 20: [community_leader] 社区领袖 (→ 接受职位) HP:35→37(+2)
  - age 21: [adult_restore_keepsake] 修缮旧物 (→ 自己动手修好) HP:37→39(+2)
  - age 22: [goblin_peace_treaty] 和平条约 (→ 以诚意打动对方) HP:39→41(+2)
  - age 23: [goblin_legacy_hoard] 传家宝库 (→ 设置机关保护) HP:41→43(+2)
  - age 24: [goblin_junkyard_palace] 废品宫殿  HP:43→45(+2)
  - age 25: [random_stargazing] 观星  HP:45→47(+2)
  - age 26: [goblin_herb_dealer] 草药商人  HP:47→49(+2)
  - age 27: [mid_chronic_pain] 旧伤复发 (→ 寻求治疗) HP:49→61(+12)
  - age 28: [midlife_new_craft] 半路学艺 (→ 学点能打动人的) HP:61→63(+2)
  - age 29: [goblin_warchief_duel] 首领争夺战 (→ 发起挑战) HP:63→65(+2)
  - age 30: [goblin_sunset_hill] 山丘上的日落  HP:65→67(+2)
  - ... 省略 24 个事件 ...
  - age 50: [elder_feast_missing_names] 席间空位 HP:38→36(-2)
  - age 51: [elder_world_peace] 和平降临 HP:36→34(-2)
  - age 52: [elder_spirit_trial] 灵魂试炼 HP:34→22(-12)
  - age 53: [elder_star_gazing_final] 最后的星空 HP:22→20(-2)
  - age 54: [elder_natural_death] 安详的离去 HP:20→0(-20)

### 1.2 矮人详情

#### 矮人-男-A (seed=9031)

- **寿命**: 474 / 400 (118.5%)
- **初始HP**: 49
- **HP范围**: 0 ~ 228
- **评级**: B (小有成就), 分数=262.6
- **事件触发**: 317 年有事件, 157 年平静, 162 个独立事件
- **最大年HP损失**: -31, 最大年HP恢复: +25
- **HP<50的年龄**: 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473
- **路线**: adventurer
- **路线切换**: none→commoner @ age 1, commoner→adventurer @ age 32
- **成就**: first_step, ten_lives, scholar_warrior, soul_pure, eternal_wanderer, wisdom_peak, widowed_hero, iron_body, dwarf_holdfast_ach, longevity, beauty_supreme, male_beauty, cheated_death_ach, legacy_of_students, famous_author_ach, dwarf_hall_name, undying_legend_ach, memories_in_hands, revenge_done, demon_king_slayer_ach, dwarf_forge_to_ember, divine_champion_ach, hero_ach, legacy_master, dwarf_long_watch, era_remembered, balanced_finale, iron_will_to_end, century_witness, miracle_afterglow
- **物品**: soul_gem
- **HP里程碑**: age0=-1, age1=54, age5=73, age10=70, age15=70, age20=65
  age50=120
- **事件序列** (317 个):
  - age 1: [birth_dwarf_forge_ember] 炉边初啼 (→ 在炉火边安静下来) HP:49→54(+5)
  - age 4: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:64→69(+5)
  - age 6: [village_festival] 村里祭典 (→ 大吃特吃) HP:73→73(+0)
  - age 7: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:73→70(-3)
  - age 8: [child_dwarf_surface_fair] 第一次去地表集市 (→ 寸步不离商队) HP:70→70(+0)
  - age 9: [child_stray_animal] 收养流浪动物 (→ 带回家照顾) HP:70→70(+0)
  - age 10: [random_found_coin] 捡到硬币  HP:70→70(+0)
  - age 11: [noble_kid_revenge] 权贵的欺凌 (→ 咽下这口气) HP:70→70(+0)
  - age 12: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:70→70(+0)
  - age 13: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:70→70(+0)
  - age 14: [random_weather_blessing] 好天气  HP:70→70(+0)
  - age 15: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:70→70(+0)
  - age 16: [grandma_recipes] 奶奶的秘方 (→ 认真学习) HP:70→67(-3)
  - age 17: [random_good_meal] 丰盛的一餐  HP:67→60(-7)
  - age 18: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:60→60(+0)
  - age 19: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:60→60(+0)
  - age 20: [random_street_performance] 街头表演  HP:60→65(+5)
  - age 21: [star_gazing] 观星 (→ 冥想) HP:65→67(+2)
  - age 22: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:67→67(+0)
  - age 23: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:67→72(+5)
  - age 24: [teen_first_errand] 第一次独自办事 (→ 稳稳办妥) HP:72→73(+1)
  - age 25: [random_stargazing] 观星  HP:73→73(+0)
  - age 26: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:73→73(+0)
  - age 27: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:73→70(-3)
  - age 28: [first_love] 初恋的味道 (→ 表白) HP:70→75(+5)
  - age 29: [bullied_fight_back] 反击！ (→ 直接动手) HP:75→80(+5)
  - age 30: [teen_mentor_meeting] 遇见师傅 (→ 学习剑技) HP:80→85(+5)
  - age 31: [guild_recruitment] 冒险者公会招募 (→ 报名参加) HP:85→90(+5)
  - age 32: [youth_dwarf_first_commission] 第一份真正的委托 (→ 把它做成最耐用的) HP:90→95(+5)
  - age 33: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:95→100(+5)
  - ... 省略 287 个事件 ...
  - age 316: [random_nightmare_visit] 不安的梦 HP:183→182(-1)
  - age 317: [random_nightmare_visit] 不安的梦 HP:182→182(+0)
  - age 318: [random_nightmare_visit] 不安的梦 HP:182→182(+0)
  - age 319: [random_nightmare_visit] 不安的梦 HP:182→181(-1)
  - age 320: [random_nightmare_visit] 不安的梦 HP:181→181(+0)

#### 矮人-女-B (seed=9032)

- **寿命**: 446 / 400 (111.5%)
- **初始HP**: 40
- **HP范围**: 0 ~ 215
- **评级**: B (小有成就), 分数=270.1
- **事件触发**: 317 年有事件, 129 年平静, 161 个独立事件
- **最大年HP损失**: -32, 最大年HP恢复: +24
- **HP<50的年龄**: 1, 2, 24, 40, 438, 439, 440, 441, 442, 443, 444, 445
- **路线**: adventurer
- **路线切换**: none→commoner @ age 1, commoner→adventurer @ age 29
- **成就**: first_step, ten_lives, dwarf_dragon_vow_ach, soul_pure, eternal_wanderer, scholar_warrior, iron_body, dwarf_holdfast_ach, beauty_supreme, longevity, dwarf_masterwork_ach, wisdom_peak, dwarf_hall_name, dragon_knight, dwarf_apprentice_legacy, famous_author_ach, undying_legend_ach, memories_in_hands, legacy_of_students, single_mother_warrior, divine_champion_ach, demon_king_slayer_ach, dwarf_dragonfire_legacy, hero_ach, legacy_master, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, miracle_afterglow
- **物品**: old_map, ancient_relic
- **HP里程碑**: age0=-1, age1=44, age5=60, age10=57, age15=57, age20=60
  age50=65
- **事件序列** (317 个):
  - age 1: [birth_twins] 双生子  HP:40→44(+4)
  - age 4: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:52→56(+4)
  - age 6: [village_festival] 村里祭典 (→ 大吃特吃) HP:60→60(+0)
  - age 7: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:60→57(-3)
  - age 8: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:57→57(+0)
  - age 9: [stray_dog] 流浪狗 (→ 带它回家) HP:57→57(+0)
  - age 10: [random_weather_blessing] 好天气  HP:57→57(+0)
  - age 11: [random_weather_blessing] 好天气  HP:57→57(+0)
  - age 12: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:57→57(+0)
  - age 13: [noble_kid_revenge] 权贵的欺凌 (→ 咽下这口气) HP:57→57(+0)
  - age 14: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:57→57(+0)
  - age 15: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:57→57(+0)
  - age 16: [random_found_coin] 捡到硬币  HP:57→60(+3)
  - age 17: [child_dream_flying] 会飞的梦  HP:60→60(+0)
  - age 18: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:60→52(-8)
  - age 19: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:52→56(+4)
  - age 20: [random_stargazing] 观星  HP:56→60(+4)
  - age 21: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:60→60(+0)
  - age 22: [teen_dwarf_choose_master] 拜师之日 (→ 跟锻炉师傅学火候) HP:60→53(-7)
  - age 23: [wander_market] 逛集市 (→ 买了一本旧书) HP:53→57(+4)
  - age 24: [river_discovery] 河底发光 (→ 潜下去捡) HP:57→47(-10)
  - age 25: [teen_dwarf_dragon_relic_vigil] 守望龙族旧迹 (→ 向遗迹行最庄重的礼) HP:47→51(+4)
  - age 26: [first_love] 初恋的味道 (→ 表白) HP:51→55(+4)
  - age 27: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:55→57(+2)
  - age 28: [guild_recruitment] 冒险者公会招募 (→ 报名参加) HP:57→61(+4)
  - age 29: [star_gazing] 观星 (→ 冥想) HP:61→65(+4)
  - age 30: [first_snow] 初雪 (→ 堆雪人) HP:65→69(+4)
  - age 31: [random_good_meal] 丰盛的一餐  HP:69→70(+1)
  - age 32: [dating_start] 开始交往 (→ 正式告白) HP:70→70(+0)
  - age 33: [starlight_promise] 星光下的约定 (→ 遵守承诺) HP:70→60(-10)
  - ... 省略 287 个事件 ...
  - age 316: [random_nightmare_visit] 不安的梦 HP:165→165(+0)
  - age 317: [random_nightmare_visit] 不安的梦 HP:165→165(+0)
  - age 318: [random_nightmare_visit] 不安的梦 HP:165→164(-1)
  - age 319: [random_nightmare_visit] 不安的梦 HP:164→164(+0)
  - age 320: [random_nightmare_visit] 不安的梦 HP:164→164(+0)

#### 矮人-男-C (seed=9033)

- **寿命**: 466 / 400 (116.5%)
- **初始HP**: 58
- **HP范围**: 0 ~ 182
- **评级**: B (小有成就), 分数=244.5
- **事件触发**: 317 年有事件, 149 年平静, 149 个独立事件
- **最大年HP损失**: -40, 最大年HP恢复: +25
- **HP<50的年龄**: 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 47
- **成就**: first_step, ten_lives, scholar_warrior, beauty_supreme, male_beauty, wisdom_peak, soul_pure, dwarf_holdfast_ach, longevity, iron_body, dragon_knight, legacy_of_students, famous_author_ach, peaceful_ending, eternal_peace, undying_legend_ach, dwarf_hall_name, divine_champion_ach, legacy_master, dwarf_long_watch, era_remembered, balanced_finale, arcane_reserve_final, iron_will_to_end, century_witness, miracle_afterglow
- **物品**: lucky_charm, ancient_relic
- **HP里程碑**: age0=-1, age1=63, age5=77, age10=73, age15=77, age20=83
  age50=85
- **事件序列** (317 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:58→63(+5)
  - age 4: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:73→73(+0)
  - age 6: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:77→77(+0)
  - age 7: [village_festival] 村里祭典 (→ 大吃特吃) HP:77→77(+0)
  - age 8: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:77→73(-4)
  - age 9: [stray_dog] 流浪狗 (→ 带它回家) HP:73→73(+0)
  - age 10: [random_good_meal] 丰盛的一餐  HP:73→73(+0)
  - age 11: [noble_kid_revenge] 权贵的欺凌 (→ 咽下这口气) HP:73→73(+0)
  - age 12: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:73→73(+0)
  - age 13: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:73→73(+0)
  - age 14: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:73→73(+0)
  - age 15: [random_weather_blessing] 好天气  HP:73→77(+4)
  - age 16: [child_lost_in_woods] 迷路 (→ 跟着星星走) HP:77→77(+0)
  - age 17: [child_cooking_adventure] 第一次做饭 (→ 认真按步骤来) HP:77→77(+0)
  - age 18: [young_rival] 少年的对手 (→ 努力超越他) HP:77→77(+0)
  - age 19: [village_feud] 村长之争 (→ 帮弱者说话) HP:77→82(+5)
  - age 20: [random_weather_blessing] 好天气  HP:82→83(+1)
  - age 21: [random_helping_stranger] 帮助陌生人  HP:83→83(+0)
  - age 22: [old_soldier_story] 老兵的故事 (→ 认真听完) HP:83→83(+0)
  - age 23: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:83→88(+5)
  - age 24: [star_gazing] 观星 (→ 冥想) HP:88→86(-2)
  - age 25: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:86→86(+0)
  - age 26: [help_farmer] 帮农夫收麦 (→ 帮忙割麦) HP:86→91(+5)
  - age 27: [bullied_fight_back] 反击！ (→ 直接动手) HP:91→96(+5)
  - age 28: [teen_mentor_meeting] 遇见师傅 (→ 学习剑技) HP:96→101(+5)
  - age 29: [first_love] 初恋的味道 (→ 表白) HP:101→106(+5)
  - age 30: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:106→103(-3)
  - age 31: [random_stargazing] 观星  HP:103→108(+5)
  - age 32: [random_street_performance] 街头表演  HP:108→113(+5)
  - age 33: [lost_treasure_map] 藏宝图碎片 (→ 仔细研究) HP:113→116(+3)
  - ... 省略 287 个事件 ...
  - age 316: [random_nightmare_visit] 不安的梦 HP:135→135(+0)
  - age 317: [random_nightmare_visit] 不安的梦 HP:135→135(+0)
  - age 318: [random_nightmare_visit] 不安的梦 HP:135→134(-1)
  - age 319: [random_nightmare_visit] 不安的梦 HP:134→134(+0)
  - age 320: [random_nightmare_visit] 不安的梦 HP:134→134(+0)

## 2. 路线系统专项验证

### 2.1 路线激活测试

| 路线 | 种族 | 激活? | 激活年龄 | 锚点触发 | 锚点缺失 | 路线专属事件 | 寿命 | 评级 |
|------|------|-------|---------|----------|----------|------------|------|------|
| adventurer | human | ✅ | 1 | first_quest | ⚠️ dungeon_explore_1, advanced_dungeon | 2 | 113 | A |
| knight | human | ✅ | 1 | knight_tournament | ⚠️ knight_glory | 3 | 110 | B |
| mage | elf | ✅ | 1 | magic_graduate | ⚠️ magic_exam, magic_duel | 4 | 66 | B |
| merchant | human | ✅ | 1 | 无 | ⚠️ merchant_career, investment_opportunity, become_lord | 0 | 83 | A |
| scholar | dwarf | ✅ | 1 | 无 | ⚠️ write_a_book, disciple_comes | 0 | 476 | B |
| commoner | goblin | ✅ | 1 | 无 | ✅ | 0 | 54 | A |

### 2.2 路线自然切换测试（12 局中的路线切换统计）

有 10 局发生了路线切换：
- 人类-男-A: commoner → commoner @ age 1, commoner → scholar @ age 32
- 人类-男-C: commoner → commoner @ age 1, commoner → scholar @ age 38
- 精灵-女-A: commoner → commoner @ age 1, commoner → mage @ age 17
- 精灵-男-B: commoner → commoner @ age 1, commoner → scholar @ age 43
- 精灵-女-C: commoner → commoner @ age 1, commoner → adventurer @ age 34
- 哥布林-男-B: commoner → commoner @ age 1, commoner → scholar @ age 28
- 哥布林-女-C: commoner → commoner @ age 1
- 矮人-男-A: commoner → commoner @ age 1, commoner → adventurer @ age 32
- 矮人-女-B: commoner → commoner @ age 1, commoner → adventurer @ age 29
- 矮人-男-C: commoner → commoner @ age 1, commoner → scholar @ age 47

## 3. HP 系统验证

### 3.1 童年保护检查

✅ 没有角色在 10 岁前死亡（童年死亡保护正常）

### 3.2 种族 HP 表现

| 种族 | 平均寿命 | 寿命范围 | 平均初始HP | 平均最低HP | 平均最高HP | HP<50局数 |
|------|---------|---------|-----------|-----------|-----------|-----------|
| human | 101.0 | 80~122 | 43.0 | 0.0 | 130.0 | 2/2 |
| elf | 407.0 | 361~450 | 28.0 | 0.0 | 134.7 | 3/3 |
| goblin | 50.5 | 47~54 | 25.0 | 0.0 | 60.5 | 2/2 |
| dwarf | 462.0 | 446~474 | 49.0 | 0.0 | 208.3 | 3/3 |

### 3.3 衰老模型表现

#### human
- 人类-男-A: Q1(avg=50.2) Q2(avg=71.5) Q3(avg=88.0) Q4(avg=34.3) 死亡age=80
- 人类-男-C: Q1(avg=85.3) Q2(avg=144.9) Q3(avg=116.5) Q4(avg=69.3) 死亡age=122

#### elf
- 精灵-女-A: Q1(avg=51.6) Q2(avg=101.0) Q3(avg=143.0) Q4(avg=101.0) 死亡age=410
- 精灵-男-B: Q1(avg=57.0) Q2(avg=59.0) Q3(avg=81.5) Q4(avg=44.8) 死亡age=361
- 精灵-女-C: Q1(avg=69.0) Q2(avg=79.5) Q3(avg=120.2) Q4(avg=84.9) 死亡age=450

#### goblin
- 哥布林-男-B: Q1(avg=23.6) Q2(avg=33.5) Q3(avg=40.5) Q4(avg=22.0) 死亡age=47
- 哥布林-女-C: Q1(avg=19.4) Q2(avg=39.1) Q3(avg=65.0) Q4(avg=37.8) 死亡age=54

#### dwarf
- 矮人-男-A: Q1(avg=132.3) Q2(avg=210.7) Q3(avg=188.7) Q4(avg=117.6) 死亡age=474
- 矮人-女-B: Q1(avg=102.2) Q2(avg=188.0) Q3(avg=175.9) Q4(avg=127.3) 死亡age=446
- 矮人-男-C: Q1(avg=119.0) Q2(avg=153.2) Q3(avg=140.8) Q4(avg=90.6) 死亡age=466

## 4. 事件覆盖度

- **总事件数**: 675
- **触发过的事件**: 432 (64.0%)
- **未触发的非unique事件**: 1

### 4.1 按路线统计事件分布

| 路线 | 专属事件数 | 已触发 | 覆盖率 |
|------|-----------|--------|--------|
| mage | 24 | 11 | 45.8% |
| knight | 14 | 3 | 21.4% |
| adventurer | 27 | 4 | 14.8% |
| merchant | 20 | 0 | 0.0% |
| scholar | 14 | 10 | 71.4% |

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
- 路线 mage (法师-精灵): 锚点事件未触发: magic_exam, magic_duel
- 路线 merchant (商人-人类): 锚点事件未触发: merchant_career, investment_opportunity, become_lord
- 路线 scholar (学者-矮人): 锚点事件未触发: write_a_book, disciple_comes

### P2 — 非核心功能/数据问题
- 2 个孤儿 Flag: dungeon_injured, miracle_survival
- 108 个死 Flag（设置但从未被引用），可能是冗余数据

## 附录：完整事件 ID 列表

### 各局触发的事件合集

共 432 个独立事件被触发（含路线测试）：

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
- `birth_dwarf_forge_ember`
- `birth_eclipse`
- `birth_elf_forest_edge`
- `birth_human_merchant`
- `birth_human_soldier`
- `birth_silver_tongue_house`
- `birth_slums`
- `birth_storm`
- `birth_twins`
- `birth_wilderness`
- `bullied`
- `bullied_fight_back`
- `bullied_repeat`
- `catch_thief`
- `centenarian_celebration`
- `chain_dark_past`
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
- `disciple_comes`
- `divine_vision`
- `dragon_ultimate_bond`
- `dragon_youngling_growth`
- `dungeon_explore_1`
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
- `elder_natural_death`
- `elder_old_enemy`
- `elder_old_letters`
- `elder_passing_wisdom`
- `elder_peaceful_days`
- `elder_reunion`
- `elder_sort_keepsakes`
- `elder_spirit_trial`
- `elder_star_gazing_final`
- `elder_sunset_watching`
- `elder_technique_pass`
- `elder_unexpected_visitor`
- `elder_wisdom_seekers`
- `elder_world_peace`
- `elemental_trial`
- `elf_ancient_library`
- `elf_ancient_magic`
- `elf_ancient_ruins`
- `elf_animal_friend`
- `elf_archery_training`
- `elf_beast_tongue`
- `elf_butterfly_dance`
- `elf_century_meditation`
- `elf_council_invitation`
- `elf_crystal_cave`
- `elf_crystal_weaving`
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
- `elf_farewell_ceremony`
- `elf_first_century`
- `elf_first_magic_spark`
- `elf_first_treesong`
- `elf_forbidden_book`
- `elf_forbidden_magic_scroll`
- `elf_forest_corruption`
- `elf_forest_expansion`
- `elf_forest_guardian_test`
- `elf_half_elf_friend`
- `elf_herb_gathering`
- `elf_human_friend_aging`
- `elf_lament_for_fallen`
- `elf_last_song`
- `elf_last_spring`
- `elf_longevity_burden`
- `elf_magic_research`
- `elf_moonlight_lullaby`
- `elf_moonstone_forge`
- `elf_mortal_friend`
- `elf_painting_century`
- `elf_passing_crown`
- `elf_phoenix_sighting`
- `elf_ranger_path`
- `elf_runic_barrier`
- `elf_seed_planting`
- `elf_silver_harp`
- `elf_spell_weaving`
- `elf_spirit_animal`
- `elf_star_song`
- `elf_starlight_bath`
- `elf_starlight_weaving`
- `elf_talking_to_tree`
- `elf_teaching_young`
- `elf_time_perception`
- `elf_treesong_mastery`
- `elf_watching_generations`
- `elf_waterfall_meditation`
- `elf_wisdom_council_seat`
- `elf_world_tree_communion`
- `elf_world_tree_pilgrimage`
- `elf_worldtree_guardian`
- `elf_young_elf_mentor`
- `explore_ruins`
- `family_dinner`
- `festival_dance`
- `first_love`
- `first_quest`
- `first_snow`
- `food_culture`
- `forbidden_love`
- `forest_camping`
- `gambling_night`
- `goblin_alchemy_discovery`
- `goblin_chief_council`
- `goblin_cook_master`
- `goblin_cooking_contest`
- `goblin_disguise_adventure`
- `goblin_elder_wisdom`
- `goblin_final_feast`
- `goblin_final_feast_elder`
- `goblin_first_boss_fight`
- `goblin_first_heist`
- `goblin_herb_dealer`
- `goblin_human_language`
- `goblin_human_language_teen`
- `goblin_human_shop`
- `goblin_junkyard_palace`
- `goblin_last_invention`
- `goblin_last_trick`
- `goblin_legacy_hoard`
- `goblin_longest_living`
- `goblin_mechanical_genius`
- `goblin_mechanical_heart`
- `goblin_mushroom_garden`
- `goblin_old_bones_ache`
- `goblin_passing_the_torch`
- `goblin_peace_treaty`
- `goblin_pet_rat`
- `goblin_rebellion`
- `goblin_rescue_mission`
- `goblin_sage`
- `goblin_scavenger_instinct`
- `goblin_scrap_invention`
- `goblin_sewer_kingdom`
- `goblin_sunset_hill`
- `goblin_trade_alliance`
- `goblin_trade_empire`
- `goblin_tribal_legend`
- `goblin_tribe_challenge`
- `goblin_tribe_legacy`
- `goblin_tunnel_race`
- `goblin_warchief_duel`
- `goblin_wise_counsel`
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
- `human_bully_defense`
- `human_child_born`
- `human_church_school`
- `human_community_leader`
- `human_conscription`
- `human_craft_mastery`
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
- `human_grandchild_story`
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
- `human_rocking_chair`
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
- `kindness_of_stranger`
- `knight_dragon_quest`
- `knight_siege`
- `knight_tournament`
- `legend_spread`
- `library_discovery`
- `lost_treasure_map`
- `lover_death_battlefield`
- `luk_lottery`
- `luk_potion_find`
- `luk_wild_encounter`
- `mage_arcane_library`
- `mage_elemental_plane`
- `mage_magic_tower`
- `mage_magic_war`
- `magic_academy_letter`
- `magic_breakthrough_final`
- `magic_burst_baby`
- `magic_duel`
- `magic_graduate`
- `magic_research_breakthrough`
- `magical_creature_tame`
- `mana_overflow`
- `market_haggling`
- `marriage_anniversary`
- `marry_adventurer`
- `martial_arts_master`
- `master_spell`
- `masterpiece_craft`
- `meteor_shower`
- `mid_adopt_orphan`
- `mid_apprentice_success`
- `mid_body_decline`
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
- `mid_return_adventure`
- `mid_scholar_work`
- `mid_slowing_down`
- `mid_vision_decline`
- `midlife_crisis`
- `midlife_new_craft`
- `monster_hunt_guild`
- `mountain_bandit_leader`
- `noble_admirer`
- `noble_kid_revenge`
- `old_rival`
- `old_soldier_story`
- `part_time_job`
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
- `scholar_guidance`
- `secret_master`
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
- `talent_awakening`
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
- `teen_traveling_circus`
- `traveling_sage`
- `tree_climbing`
- `village_festival`
- `village_feud`
- `village_race`
- `wander_market`
- `war_aftermath`
- `war_breaks_out`
- `widowed_wanderer`
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