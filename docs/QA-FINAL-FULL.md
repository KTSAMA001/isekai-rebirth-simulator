# QA 最终全面测试报告

> 生成时间: 2026-04-13T12:36:46.941Z
> 测试版本: 4 可玩种族 × 3局（共 12 局）+ 6 条路线专项测试
> 项目: isekai-rebirth-simulator

## 执行摘要

⚠️ 发现 2 个问题：
- P1: 精灵最低HP过低 (精灵-女-A: min=0, 精灵-女-C: min=0)
- P2: 2 个孤儿 Flag（被引用但无法设置）

## 1. 4 可玩种族全流程模拟（12 局）

### 1.1 总览

| # | 局 | 种族 | 性别 | 寿命 | 初始HP | 最终HP | 评级 | 分数 | 事件数 | 普通年 | 路线 | 路线切换 |
|---|-----|------|------|------|--------|--------|------|------|--------|--------|------|----------|
| 1 | 人类-男-A | human | male | 58 | 37 | 0 | B(小有成就) | 239.1 | 57 | 1 | scholar | none→commoner@1; commoner→scholar@32 |
| 2 | 人类-男-C | human | male | 74 | 49 | 0 | B(小有成就) | 254.7 | 73 | 1 | scholar | none→commoner@1; commoner→scholar@38 |
| 3 | 精灵-女-A | elf | female | 288 | 34 | 0 | B(小有成就) | 210.3 | 104 | 184 | scholar | none→commoner@1; commoner→scholar@30 |
| 4 | 精灵-女-C | elf | female | 24 | 25 | 0 | B(小有成就) | 204.3 | 24 | 0 | mage | none→commoner@1; commoner→mage@8 |
| 5 | 哥布林-女-A | goblin | female | 44 | 25 | 0 | B(小有成就) | 255.2 | 44 | 0 | scholar | none→commoner@1; commoner→scholar@43 |
| 6 | 哥布林-男-B | goblin | male | 50 | 25 | 0 | B(小有成就) | 263.4 | 50 | 0 | scholar | none→commoner@1; commoner→scholar@39 |
| 7 | 矮人-男-A | dwarf | male | 372 | 49 | 0 | B(小有成就) | 213.7 | 88 | 284 | adventurer | none→commoner@1; commoner→adventurer@17 |
| 8 | 矮人-女-B | dwarf | female | 259 | 40 | 0 | C(平凡一生) | 193.8 | 90 | 169 | scholar | none→commoner@1; commoner→scholar@41 |
| 9 | 矮人-男-C | dwarf | male | 284 | 58 | 0 | C(平凡一生) | 196.8 | 88 | 196 | scholar | none→commoner@1; commoner→scholar@36 |

### 1.2 人类详情

#### 人类-男-A (seed=9001)

- **寿命**: 58 / 100 (58.0%)
- **初始HP**: 37
- **HP范围**: 0 ~ 81
- **评级**: B (小有成就), 分数=239.1
- **事件触发**: 57 年有事件, 1 年平静, 56 个独立事件
- **最大年HP损失**: -21, 最大年HP恢复: +20
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 12, 13, 52, 53, 54, 55, 56, 57
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 32
- **成就**: first_step, ten_lives, human_adaptability, school_founder_ach, dragon_knight, beauty_supreme, male_beauty, famous_author_ach, soul_pure, era_remembered, balanced_finale
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
  - age 55: [mid_slowing_down] 迟缓的脚步 HP:39→33(-6)
  - age 56: [elder_autobiography] 自传 HP:33→27(-6)
  - age 57: [human_old_battlefield] 重访战场 HP:27→20(-7)
  - age 58: [elder_unexpected_visitor] 意外的来访者 HP:20→0(-20)

#### 人类-男-C (seed=9003)

- **寿命**: 74 / 100 (74.0%)
- **初始HP**: 49
- **HP范围**: 0 ~ 160
- **评级**: B (小有成就), 分数=254.7
- **事件触发**: 73 年有事件, 1 年平静, 69 个独立事件
- **最大年HP损失**: -37, 最大年HP恢复: +10
- **HP<50的年龄**: 70, 71, 72, 73
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 38
- **成就**: first_step, ten_lives, school_founder_ach, iron_body, beauty_supreme, male_beauty, human_adaptability, soul_pure, famous_author_ach, peaceful_ending, memories_in_hands, era_remembered, balanced_finale, iron_will_to_end
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
  - age 71: [human_last_toast] 最后一杯酒 HP:38→30(-8)
  - age 72: [elder_sort_keepsakes] 整理珍藏 HP:30→21(-9)
  - age 73: [human_legacy_decision] 遗产安排 HP:21→11(-10)
  - age 74: [human_village_elder] 德高望重 HP:11→0(-11)

### 1.2 精灵详情

#### 精灵-女-A (seed=9011)

- **寿命**: 288 / 500 (57.6%)
- **初始HP**: 34
- **HP范围**: 0 ~ 90
- **评级**: B (小有成就), 分数=210.3
- **事件触发**: 104 年有事件, 184 年平静, 103 个独立事件
- **最大年HP损失**: -25, 最大年HP恢复: +13
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 44, 45, 46, 48, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 30
- **成就**: first_step, ten_lives, elf_worldtree_blessed, elf_forest_healer_ach, elf_star_song_ach, archmage_body, archmage_ach, elf_magic_pinnacle, female_archmage, soul_pure, legacy_of_students, beauty_supreme, famous_author_ach, elf_worldtree_guardian, longevity, dragon_knight, elf_dragon_bond, elf_council_seat, legacy_master, elf_mentor_legacy, arcane_reserve_final, century_witness, elf_long_cycle
- **物品**: holy_pendant, ancient_relic
- **HP里程碑**: age0=-1, age1=36, age5=40, age10=36, age15=50, age20=65
  age50=43
- **事件序列** (104 个):
  - age 1: [birth_storm] 暴风夜  HP:34→36(+2)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:36→38(+2)
  - age 3: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:38→40(+2)
  - age 4: [church_orphan] 教会的温暖 (→ 留在教会) HP:40→40(+0)
  - age 5: [elf_first_magic_spark] 第一缕魔火  HP:40→40(+0)
  - age 6: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:40→40(+0)
  - age 7: [first_competition] 第一次比赛 (→ 拼尽全力) HP:40→37(-3)
  - age 8: [elf_first_treesong] 第一次听见树歌 (→ 尝试用魔力回应树灵) HP:37→40(+3)
  - age 9: [random_good_meal] 丰盛的一餐  HP:40→43(+3)
  - age 10: [river_discovery] 河底发光 (→ 潜下去捡) HP:43→36(-7)
  - age 11: [random_minor_injury] 小伤  HP:36→38(+2)
  - age 12: [teen_race_competition] 少年竞技会 (→ 参加跑步) HP:38→41(+3)
  - age 13: [teen_mentor_meeting] 遇见师傅 (→ 学习剑技) HP:41→44(+3)
  - age 14: [first_love] 初恋的味道 (→ 表白) HP:44→47(+3)
  - age 15: [part_time_job] 打工赚零花钱 (→ 认真干活) HP:47→50(+3)
  - age 16: [meteor_shower] 流星雨 (→ 许个愿) HP:50→53(+3)
  - age 17: [market_haggling] 集市砍价 (→ 砍价大师) HP:53→56(+3)
  - age 18: [youth_short_term_job] 临时差事 (→ 老老实实做完) HP:56→59(+3)
  - age 19: [elf_forest_fire_rescue] 森林火灾救援  HP:59→62(+3)
  - age 20: [elf_ranger_path] 游侠之路  HP:62→65(+3)
  - age 21: [youth_caravan_guard] 商队护卫 (→ 报名参加) HP:65→68(+3)
  - age 22: [elf_world_tree_communion] 与世界树共鸣  HP:68→71(+3)
  - age 23: [elf_moonwell_ritual] 月池仪式  HP:71→74(+3)
  - age 24: [youth_tavern_rumor] 酒馆传闻 (→ 凑过去听) HP:74→77(+3)
  - age 25: [random_weather_blessing] 好天气  HP:77→80(+3)
  - age 26: [hunting_trip] 狩猎之旅 (→ 追踪大型猎物) HP:80→78(-2)
  - age 27: [elf_magic_duel] 魔法决斗 (→ 全力以赴) HP:78→81(+3)
  - age 28: [spr_meditation_retreat] 闭关修炼 (→ 闭关苦修) HP:81→84(+3)
  - age 29: [adult_teaching_offer] 教学邀请 (→ 欣然接受) HP:84→87(+3)
  - age 30: [adult_neighborhood_request] 邻里的请求 (→ 组织大家一起做) HP:87→90(+3)
  - ... 省略 74 个事件 ...
  - age 101: [elf_teaching_young] 教导下一代 HP:83→83(+0)
  - age 102: [elf_dragon_alliance] 与龙族结盟 HP:83→83(+0)
  - age 150: [elf_wisdom_council_seat] 贤者之席 HP:83→83(+0)
  - age 200: [elf_passing_crown] 传承 HP:81→81(+0)
  - age 201: [elf_fading_magic] 魔力的消退 HP:81→81(+0)

#### 精灵-女-C (seed=9013)

- **寿命**: 24 / 500 (4.8%)
- **初始HP**: 25
- **HP范围**: 0 ~ 47
- **评级**: B (小有成就), 分数=204.3
- **事件触发**: 24 年有事件, 0 年平静, 23 个独立事件
- **最大年HP损失**: -28, 最大年HP恢复: +1
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
- **路线**: mage
- **路线切换**: none→commoner @ age 1, commoner→mage @ age 8
- **成就**: first_step, ten_lives, mage_path, elf_worldtree_blessed, speedrun
- **物品**: 无
- **HP里程碑**: age0=-1, age1=26, age5=30, age10=35, age15=40, age20=45
- **事件序列** (24 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:25→26(+1)
  - age 2: [elf_moonlight_lullaby] 月光摇篮曲  HP:26→27(+1)
  - age 3: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:27→28(+1)
  - age 4: [elf_dewdrop_game] 露珠捉迷藏  HP:28→29(+1)
  - age 5: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:29→30(+1)
  - age 6: [elf_seed_planting] 种下第一棵树  HP:30→31(+1)
  - age 7: [magic_academy_letter] 魔法学院来信 (→ 入学就读) HP:31→32(+1)
  - age 8: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:32→33(+1)
  - age 9: [random_good_meal] 丰盛的一餐  HP:33→34(+1)
  - age 10: [random_training_day] 勤奋的一天 (→ 训练体能) HP:34→35(+1)
  - age 11: [random_found_coin] 捡到硬币  HP:35→36(+1)
  - age 12: [random_rainy_contemplation] 雨中沉思  HP:36→37(+1)
  - age 13: [catch_thief] 抓小偷 (→ 追上去) HP:37→38(+1)
  - age 14: [random_helping_stranger] 帮助陌生人  HP:38→39(+1)
  - age 15: [elf_forbidden_book] 禁书 (→ 偷偷翻开) HP:39→40(+1)
  - age 16: [hidden_potential] 隐藏的潜能  HP:40→41(+1)
  - age 17: [chr_public_speech] 广场演说 (→ 慷慨陈词) HP:41→42(+1)
  - age 18: [market_haggling] 集市砍价 (→ 砍价大师) HP:42→43(+1)
  - age 19: [elf_moonblade_ceremony] 月刃仪式 (→ 全力凝聚月光) HP:43→44(+1)
  - age 20: [magic_graduate] 魔法学院毕业 (→ 继续深造研究) HP:44→45(+1)
  - age 21: [elf_world_tree_communion] 与世界树共鸣  HP:45→46(+1)
  - age 22: [random_training_day] 勤奋的一天 (→ 训练体能) HP:46→47(+1)
  - age 23: [mage_arcane_library] 禁忌魔法图书馆 (→ 偷偷阅读) HP:47→28(-19)
  - age 24: [dark_mage_choice] 禁忌知识的召唤 (→ 翻开禁书) HP:28→0(-28)

### 1.2 哥布林详情

#### 哥布林-女-A (seed=9021)

- **寿命**: 44 / 60 (73.3%)
- **初始HP**: 25
- **HP范围**: 0 ~ 78
- **评级**: B (小有成就), 分数=255.2
- **事件触发**: 44 年有事件, 0 年平静, 44 个独立事件
- **最大年HP损失**: -29, 最大年HP恢复: +3
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 41, 42, 43
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 43
- **成就**: first_step, ten_lives, goblin_trade_king, goblin_long_life, beauty_supreme, era_remembered, balanced_finale
- **物品**: 无
- **HP里程碑**: age0=-1, age1=28, age5=40, age10=45, age15=60, age20=75
- **事件序列** (44 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:25→28(+3)
  - age 2: [goblin_human_toy] 人类的玩具  HP:28→31(+3)
  - age 3: [childhood_pet] 捡到受伤小鸟 (→ 带回家照顾) HP:31→34(+3)
  - age 4: [goblin_scavenger_instinct] 天生的寻宝者 (→ 一枚残破的魔法饰物) HP:34→37(+3)
  - age 5: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:37→40(+3)
  - age 6: [goblin_mushroom_garden] 蘑菇花园  HP:40→43(+3)
  - age 7: [child_first_fight] 第一次打架 (→ 挥拳反击) HP:43→46(+3)
  - age 8: [river_discovery] 河底发光 (→ 潜下去捡) HP:46→49(+3)
  - age 9: [rainy_day_adventure] 雨日冒险 (→ 钻进去看看) HP:49→42(-7)
  - age 10: [village_race] 村里赛跑 (→ 全力冲刺) HP:42→45(+3)
  - age 11: [goblin_human_kindness] 人类的善意  HP:45→48(+3)
  - age 12: [young_rival] 少年的对手 (→ 努力超越他) HP:48→51(+3)
  - age 13: [teen_traveling_circus] 流浪马戏团 (→ 偷偷学杂技) HP:51→54(+3)
  - age 14: [luk_lucky_coin] 捡到金币 (→ 收起来) HP:54→57(+3)
  - age 15: [goblin_forge_trick] 炉火的恶作剧 (→ 改良设计) HP:57→60(+3)
  - age 16: [goblin_tribe_challenge] 部落挑战赛 (→ 参加格斗) HP:60→63(+3)
  - age 17: [love_at_first_sight] 一见钟情 (→ 上前搭讪) HP:63→66(+3)
  - age 18: [goblin_rat_race] 洞鼠竞速 (→ 玩命冲刺) HP:66→69(+3)
  - age 19: [goblin_rescue_mission] 营救同胞 (→ 正面突袭) HP:69→72(+3)
  - age 20: [goblin_tunnel_architect] 地道建筑师  HP:72→75(+3)
  - age 21: [luk_wild_encounter] 野外奇遇 (→ 探索洞穴) HP:75→55(-20)
  - age 22: [goblin_rebellion] 反抗压迫 (→ 组织地下反抗) HP:55→58(+3)
  - age 23: [youth_caravan_guard] 商队护卫 (→ 报名参加) HP:58→61(+3)
  - age 24: [meteor_shower] 流星雨 (→ 许个愿) HP:61→64(+3)
  - age 25: [random_minor_injury] 小伤  HP:64→66(+2)
  - age 26: [adult_restore_keepsake] 修缮旧物 (→ 自己动手修好) HP:66→69(+3)
  - age 27: [random_helping_stranger] 帮助陌生人  HP:69→71(+2)
  - age 28: [goblin_trade_empire] 哥布林的黑市王国 (→ 扩大经营——开设地下拍卖行) HP:71→73(+2)
  - age 29: [market_haggling] 集市砍价 (→ 砍价大师) HP:73→75(+2)
  - age 30: [goblin_final_feast] 最后的盛宴  HP:75→76(+1)
  - ... 省略 14 个事件 ...
  - age 40: [goblin_sunset_hill] 山丘上的日落 HP:62→56(-6)
  - age 41: [adult_neighborhood_request] 邻里的请求 HP:56→48(-8)
  - age 42: [adult_teaching_offer] 教学邀请 HP:48→39(-9)
  - age 43: [mid_legacy_project] 留下遗产 HP:39→29(-10)
  - age 44: [challenge_final_boss] 魔王降临 HP:29→0(-29)

#### 哥布林-男-B (seed=9022)

- **寿命**: 50 / 60 (83.3%)
- **初始HP**: 25
- **HP范围**: 0 ~ 54
- **评级**: B (小有成就), 分数=263.4
- **事件触发**: 50 年有事件, 0 年平静, 50 个独立事件
- **最大年HP损失**: -8, 最大年HP恢复: +1
- **HP<50的年龄**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 42, 43, 44, 45, 46, 47, 48, 49
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 39
- **成就**: first_step, ten_lives, school_founder_ach, goblin_school_ach, goblin_sage_ach, goblin_diplomat_ach, beauty_supreme, male_beauty, goblin_long_life, era_remembered, goblin_beyond_fate
- **物品**: 无
- **HP里程碑**: age0=-1, age1=26, age5=29, age10=32, age15=35, age20=40
- **事件序列** (50 个):
  - age 1: [birth_twins] 双生子  HP:25→26(+1)
  - age 2: [goblin_human_toy] 人类的玩具  HP:26→27(+1)
  - age 3: [goblin_tunnel_race] 地洞竞速 (→ 拼命跑) HP:27→27(+0)
  - age 4: [child_lost_in_woods] 迷路 (→ 跟着星星走) HP:27→28(+1)
  - age 5: [goblin_trash_treasure] 垃圾堆里的宝物 (→ 藏起来慢慢研究) HP:28→29(+1)
  - age 6: [first_snow] 初雪 (→ 堆雪人) HP:29→30(+1)
  - age 7: [goblin_shiny_collection] 闪亮收藏  HP:30→30(+0)
  - age 8: [tree_climbing] 爬树冒险 (→ 爬到最高处) HP:30→30(+0)
  - age 9: [young_rival] 少年的对手 (→ 努力超越他) HP:30→31(+1)
  - age 10: [goblin_underground_race] 地下竞速赛 (→ 用智慧取胜——走近路) HP:31→32(+1)
  - age 11: [catch_thief] 抓小偷 (→ 追上去) HP:32→33(+1)
  - age 12: [cursed_wanderer_village_exile] 被村庄驱赶 (→ 默默离开) HP:33→34(+1)
  - age 13: [random_minor_injury] 小伤  HP:34→34(+0)
  - age 14: [goblin_duel_for_food] 抢食之战 (→ 正面硬刚) HP:34→35(+1)
  - age 15: [goblin_alchemy_accident] 炼金事故  HP:35→35(+0)
  - age 16: [teen_library_discovery] 图书馆的秘密阁楼 (→ 沉浸在故事中) HP:35→36(+1)
  - age 17: [love_at_first_sight] 一见钟情 (→ 上前搭讪) HP:36→37(+1)
  - age 18: [goblin_warchief_duel] 首领争夺战 (→ 发起挑战) HP:37→38(+1)
  - age 19: [street_performer] 街头表演 (→ 上去表演) HP:38→39(+1)
  - age 20: [spr_meditation_retreat] 闭关修炼 (→ 闭关苦修) HP:39→40(+1)
  - age 21: [luk_lottery] 王国彩票 (→ 中大奖了！) HP:40→41(+1)
  - age 22: [goblin_wise_counsel] 调解纠纷 (→ 公正裁决) HP:41→42(+1)
  - age 23: [goblin_chief_council] 首领议事会  HP:42→43(+1)
  - age 24: [goblin_old_bones_ache] 骨头疼  HP:43→43(+0)
  - age 25: [random_training_day] 勤奋的一天 (→ 训练体能) HP:43→44(+1)
  - age 26: [goblin_school_founder] 哥布林学校  HP:44→45(+1)
  - age 27: [goblin_black_market] 黑市交易 (→ 接下生意) HP:45→46(+1)
  - age 28: [adult_restore_keepsake] 修缮旧物 (→ 自己动手修好) HP:46→47(+1)
  - age 29: [goblin_cooking_contest] 烹饪大赛 (→ 坚持传统口味) HP:47→48(+1)
  - age 30: [luk_wild_encounter] 野外奇遇 (→ 探索洞穴) HP:48→49(+1)
  - ... 省略 20 个事件 ...
  - age 46: [adult_plague_crisis] 瘟疫来袭 HP:34→29(-5)
  - age 47: [harvest_festival] 丰收祭典 HP:29→23(-6)
  - age 48: [mid_magic_potion] 炼金术突破 HP:23→16(-7)
  - age 49: [random_helping_stranger] 帮助陌生人 HP:16→8(-8)
  - age 50: [adult_neighborhood_request] 邻里的请求 HP:8→0(-8)

### 1.2 矮人详情

#### 矮人-男-A (seed=9031)

- **寿命**: 372 / 400 (93.0%)
- **初始HP**: 49
- **HP范围**: 0 ~ 128
- **评级**: B (小有成就), 分数=213.7
- **事件触发**: 88 年有事件, 284 年平静, 83 个独立事件
- **最大年HP损失**: -41, 最大年HP恢复: +18
- **HP<50的年龄**: 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371
- **路线**: adventurer
- **路线切换**: none→commoner @ age 1, commoner→adventurer @ age 17
- **成就**: first_step, ten_lives, dwarf_surface_broker, wealth_peak, beauty_supreme, undying_legend_ach, male_beauty, eternal_wanderer, famous_author_ach, soul_pure, dwarf_holdfast_ach, dwarf_masterwork_ach, longevity, dwarf_hall_name, dwarf_apprentice_legacy, dwarf_forge_to_ember, dwarf_long_watch, balanced_finale, iron_will_to_end, century_witness, miracle_afterglow
- **物品**: soul_gem, ancient_relic
- **HP里程碑**: age0=-1, age1=54, age5=67, age10=63, age15=57, age20=72
  age50=102
- **事件序列** (88 个):
  - age 1: [birth_dwarf_forge_ember] 炉边初啼 (→ 在炉火边安静下来) HP:49→54(+5)
  - age 3: [village_festival] 村里祭典 (→ 大吃特吃) HP:59→64(+5)
  - age 4: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:64→67(+3)
  - age 5: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:67→67(+0)
  - age 6: [random_weather_blessing] 好天气  HP:67→70(+3)
  - age 7: [child_cooking_adventure] 第一次做饭 (→ 认真按步骤来) HP:70→70(+0)
  - age 8: [random_found_coin] 捡到硬币  HP:70→70(+0)
  - age 9: [grandma_recipes] 奶奶的秘方 (→ 认真学习) HP:70→70(+0)
  - age 10: [kindness_of_stranger] 陌生人的善意  HP:70→63(-7)
  - age 11: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:63→63(+0)
  - age 12: [random_helping_stranger] 帮助陌生人  HP:63→57(-6)
  - age 13: [child_dwarf_surface_fair] 第一次去地表集市 (→ 寸步不离商队) HP:57→57(+0)
  - age 14: [street_performance] 街头表演 (→ 上台尝试) HP:57→57(+0)
  - age 15: [help_farmer] 帮农夫收麦 (→ 帮忙割麦) HP:57→57(+0)
  - age 16: [guild_recruitment] 冒险者公会招募 (→ 报名参加) HP:57→62(+5)
  - age 17: [first_quest] 第一个委托 (→ 认真完成) HP:62→62(+0)
  - age 18: [hunting_trip] 狩猎之旅 (→ 追踪大型猎物) HP:62→62(+0)
  - age 19: [random_nightmare_visit] 不安的梦  HP:62→67(+5)
  - age 20: [bounty_notice] 悬赏告示板 (→ 接下奇怪委托) HP:67→72(+5)
  - age 21: [youth_dungeon_first] 第一次进入地下城 (→ 小心翼翼地推进) HP:72→77(+5)
  - age 22: [random_street_performance] 街头表演  HP:77→82(+5)
  - age 23: [gambling_night] 赌场之夜 (→ 放手一搏) HP:82→86(+4)
  - age 24: [youth_short_term_job] 临时差事 (→ 老老实实做完) HP:86→86(+0)
  - age 25: [random_weather_blessing] 好天气  HP:86→86(+0)
  - age 26: [random_stargazing] 观星  HP:86→86(+0)
  - age 27: [adv_bounty] 高价悬赏 (→ 接任务) HP:86→76(-10)
  - age 28: [teen_dwarf_choose_master] 拜师之日 (→ 跟锻炉师傅学火候) HP:76→81(+5)
  - age 29: [pet_companion] 捡到流浪动物 (→ 带回家养) HP:81→86(+5)
  - age 30: [mercenary_contract] 佣兵合同 (→ 忠诚完成合同) HP:86→91(+5)
  - age 31: [mid_natural_disaster] 天灾 (→ 组织救援) HP:91→96(+5)
  - ... 省略 58 个事件 ...
  - age 85: [elder_world_peace] 和平降临 HP:106→106(+0)
  - age 100: [mid_dwarf_name_in_hall] 名字刻上石厅 HP:106→106(+0)
  - age 105: [mid_dwarf_apprentice_oath] 轮到你收徒了 HP:106→106(+0)
  - age 150: [elder_dwarf_last_inspection] 最后一次巡炉 HP:105→105(+0)
  - age 160: [elder_dwarf_dragonfire_watch] 守着旧龙火的人 HP:107→107(+0)

#### 矮人-女-B (seed=9032)

- **寿命**: 259 / 400 (64.8%)
- **初始HP**: 40
- **HP范围**: 0 ~ 93
- **评级**: C (平凡一生), 分数=193.8
- **事件触发**: 90 年有事件, 169 年平静, 84 个独立事件
- **最大年HP损失**: -20, 最大年HP恢复: +24
- **HP<50的年龄**: 1, 2, 33, 56, 57, 58, 62, 63, 64, 65, 66, 67, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 41
- **成就**: first_step, ten_lives, dwarf_dragon_vow_ach, beauty_supreme, soul_pure, legacy_of_students, legacy_master, peaceful_ending, dwarf_masterwork_ach, famous_author_ach, longevity, eternal_peace, dwarf_holdfast_ach, dwarf_hall_name, dwarf_apprentice_legacy, dwarf_dragonfire_legacy, dwarf_long_watch, century_witness
- **物品**: 无
- **HP里程碑**: age0=-1, age1=44, age5=57, age10=54, age15=52, age20=71
  age50=73
- **事件序列** (90 个):
  - age 1: [birth_twins] 双生子  HP:40→44(+4)
  - age 3: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:48→52(+4)
  - age 4: [steal_sweets] 偷吃糖果 (→ 老实道歉) HP:52→56(+4)
  - age 5: [childhood_chase] 抓蜻蜓 (→ 抓到了一只) HP:56→57(+1)
  - age 6: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:57→53(-4)
  - age 7: [river_fishing] 河边抓鱼 (→ 耐心等待) HP:53→57(+4)
  - age 8: [lost_treasure_map] 藏宝图碎片 (→ 仔细研究) HP:57→50(-7)
  - age 9: [young_rival] 少年的对手 (→ 努力超越他) HP:50→50(+0)
  - age 10: [child_river_adventure] 河边探险 (→ 探索瀑布后面的洞穴) HP:50→54(+4)
  - age 11: [wander_market] 逛集市 (→ 买了一本旧书) HP:54→58(+4)
  - age 12: [child_dwarf_first_hammer] 第一次握锤 (→ 先练稳稳落锤) HP:58→62(+4)
  - age 13: [first_love] 初恋的味道 (→ 表白) HP:62→66(+4)
  - age 14: [teen_secret_discovered] 发现秘密 (→ 公开揭发) HP:66→67(+1)
  - age 15: [bullied_fight_back] 反击！ (→ 直接动手) HP:67→52(-15)
  - age 16: [child_dwarf_surface_fair] 第一次去地表集市 (→ 寸步不离商队) HP:52→56(+4)
  - age 17: [pet_companion] 捡到流浪动物 (→ 带回家养) HP:56→60(+4)
  - age 18: [dating_start] 开始交往 (→ 正式告白) HP:60→64(+4)
  - age 19: [dating_deepen] 感情升温 (→ 一起冒险) HP:64→67(+3)
  - age 20: [teen_dwarf_choose_master] 拜师之日 (→ 跟锻炉师傅学火候) HP:67→71(+4)
  - age 21: [market_haggling] 集市砍价 (→ 砍价大师) HP:71→75(+4)
  - age 22: [festival_dance] 丰收祭的舞蹈 (→ 一起跳舞) HP:75→77(+2)
  - age 23: [random_found_coin] 捡到硬币  HP:77→77(+0)
  - age 24: [quest_parting] 远征前的告别 (→ 系上护身符) HP:77→77(+0)
  - age 25: [teen_dwarf_dragon_relic_vigil] 守望龙族旧迹 (→ 向遗迹行最庄重的礼) HP:77→77(+0)
  - age 26: [youth_shared_roof] 同住一檐下 (→ 把日子打理顺) HP:77→77(+0)
  - age 27: [forbidden_love] 禁忌之恋 (→ 一起私奔) HP:77→62(-15)
  - age 28: [random_minor_injury] 小伤  HP:62→65(+3)
  - age 29: [random_helping_stranger] 帮助陌生人  HP:65→69(+4)
  - age 30: [harvest_festival] 丰收祭典 (→ 参加各项比赛) HP:69→73(+4)
  - age 31: [spr_divine_sign] 神谕降临 (→ 倾心聆听，接受神恩) HP:73→62(-11)
  - ... 省略 60 个事件 ...
  - age 87: [elder_wisdom_seekers] 求知者来访 HP:44→44(+0)
  - age 100: [mid_dwarf_name_in_hall] 名字刻上石厅 HP:44→44(+0)
  - age 105: [mid_dwarf_apprentice_oath] 轮到你收徒了 HP:44→44(+0)
  - age 150: [elder_dwarf_last_inspection] 最后一次巡炉 HP:43→43(+0)
  - age 160: [elder_dwarf_dragonfire_watch] 守着旧龙火的人 HP:46→46(+0)

#### 矮人-男-C (seed=9033)

- **寿命**: 284 / 400 (71.0%)
- **初始HP**: 58
- **HP范围**: 0 ~ 129
- **评级**: C (平凡一生), 分数=196.8
- **事件触发**: 88 年有事件, 196 年平静, 84 个独立事件
- **最大年HP损失**: -30, 最大年HP恢复: +25
- **HP<50的年龄**: 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283
- **路线**: scholar
- **路线切换**: none→commoner @ age 1, commoner→scholar @ age 36
- **成就**: first_step, ten_lives, wisdom_peak, beauty_supreme, male_beauty, memories_in_hands, legacy_of_students, widowed_hero, soul_pure, famous_author_ach, undying_legend_ach, legacy_master, dwarf_holdfast_ach, longevity, dwarf_hall_name, dwarf_long_watch, century_witness
- **物品**: 无
- **HP里程碑**: age0=-1, age1=63, age5=77, age10=82, age15=90, age20=99
  age50=73
- **事件序列** (88 个):
  - age 1: [birth_wilderness] 荒野出生 (→ 萨满世家) HP:58→63(+5)
  - age 3: [childhood_hide_seek] 捉迷藏 (→ 藏得太好没人找到) HP:68→73(+5)
  - age 4: [childhood_play] 村口的泥巴大战 (→ 当孩子王) HP:73→73(+0)
  - age 5: [bullied] 被大孩子欺负 (→ 忍气吞声) HP:73→77(+4)
  - age 6: [bullied_repeat] 他们又来了 (→ 继续忍耐) HP:77→77(+0)
  - age 7: [noble_kid_revenge] 权贵的欺凌 (→ 咽下这口气) HP:77→77(+0)
  - age 8: [random_stargazing] 观星  HP:77→77(+0)
  - age 9: [stand_up_moment] 不再忍耐 (→ 正面反击) HP:77→77(+0)
  - age 10: [child_dwarf_surface_fair] 第一次去地表集市 (→ 寸步不离商队) HP:77→82(+5)
  - age 11: [village_race] 村里赛跑 (→ 全力冲刺) HP:82→83(+1)
  - age 12: [random_rainy_contemplation] 雨中沉思  HP:83→88(+5)
  - age 13: [teen_first_errand] 第一次独自办事 (→ 稳稳办妥) HP:88→90(+2)
  - age 14: [teen_library_discovery] 图书馆的秘密阁楼 (→ 沉浸在故事中) HP:90→90(+0)
  - age 15: [teen_nightmare] 反复出现的噩梦 (→ 在梦中回应那个声音) HP:90→90(+0)
  - age 16: [teen_mentor_meeting] 遇见师傅 (→ 学习剑技) HP:90→90(+0)
  - age 17: [love_at_first_sight] 一见钟情 (→ 上前搭讪) HP:90→95(+5)
  - age 18: [teen_future_talk] 夜谈未来 (→ 认真说出愿望) HP:95→100(+5)
  - age 19: [festival_dance] 丰收祭的舞蹈 (→ 一起跳舞) HP:100→100(+0)
  - age 20: [random_minor_injury] 小伤  HP:100→99(-1)
  - age 21: [youth_caravan_guard] 商队护卫 (→ 报名参加) HP:99→100(+1)
  - age 22: [youth_dungeon_first] 第一次进入地下城 (→ 小心翼翼地推进) HP:100→105(+5)
  - age 23: [spr_meditation_retreat] 闭关修炼 (→ 闭关苦修) HP:105→110(+5)
  - age 24: [random_street_performance] 街头表演  HP:110→103(-7)
  - age 25: [mid_magic_experiment] 禁忌实验 (→ 全力激活魔法阵) HP:103→73(-30)
  - age 26: [gambling_night] 赌场之夜 (→ 放手一搏) HP:73→78(+5)
  - age 27: [food_culture] 美食之旅 (→ 学习烹饪) HP:78→83(+5)
  - age 28: [adult_neighborhood_request] 邻里的请求 (→ 组织大家一起做) HP:83→88(+5)
  - age 29: [adult_plague_crisis] 瘟疫来袭 (→ 帮助救治病人) HP:88→93(+5)
  - age 30: [quest_parting] 远征前的告别 (→ 系上护身符) HP:93→98(+5)
  - age 31: [rare_gods_gift] 神之恩赐 (→ 接受神力) HP:98→123(+25)
  - ... 省略 58 个事件 ...
  - age 85: [elder_world_peace] 和平降临 HP:88→93(+5)
  - age 100: [mid_dwarf_name_in_hall] 名字刻上石厅 HP:93→93(+0)
  - age 105: [mid_dwarf_apprentice_oath] 轮到你收徒了 HP:93→93(+0)
  - age 150: [elder_dwarf_last_inspection] 最后一次巡炉 HP:92→92(+0)
  - age 160: [elder_dwarf_dragonfire_watch] 守着旧龙火的人 HP:94→94(+0)

## 2. 路线系统专项验证

### 2.1 路线激活测试

| 路线 | 种族 | 激活? | 激活年龄 | 锚点触发 | 锚点缺失 | 路线专属事件 | 寿命 | 评级 |
|------|------|-------|---------|----------|----------|------------|------|------|
| adventurer | human | ✅ | 1 | first_quest | ⚠️ dungeon_explore_1, advanced_dungeon | 2 | 55 | B |
| knight | human | ✅ | 1 | knight_tournament | ⚠️ knight_glory | 3 | 82 | B |
| mage | elf | ✅ | 1 | magic_duel, magic_graduate | ⚠️ magic_exam | 7 | 81 | B |
| merchant | human | ✅ | 1 | 无 | ⚠️ merchant_career, investment_opportunity, become_lord | 0 | 70 | B |
| commoner | goblin | ✅ | 1 | 无 | ✅ | 0 | 43 | B |

### 2.2 路线自然切换测试（12 局中的路线切换统计）

有 9 局发生了路线切换：
- 人类-男-A: commoner → commoner @ age 1, commoner → scholar @ age 32
- 人类-男-C: commoner → commoner @ age 1, commoner → scholar @ age 38
- 精灵-女-A: commoner → commoner @ age 1, commoner → scholar @ age 30
- 精灵-女-C: commoner → commoner @ age 1, commoner → mage @ age 8
- 哥布林-女-A: commoner → commoner @ age 1, commoner → scholar @ age 43
- 哥布林-男-B: commoner → commoner @ age 1, commoner → scholar @ age 39
- 矮人-男-A: commoner → commoner @ age 1, commoner → adventurer @ age 17
- 矮人-女-B: commoner → commoner @ age 1, commoner → scholar @ age 41
- 矮人-男-C: commoner → commoner @ age 1, commoner → scholar @ age 36

## 3. HP 系统验证

### 3.1 童年保护检查

✅ 没有角色在 10 岁前死亡（童年死亡保护正常）

### 3.2 种族 HP 表现

| 种族 | 平均寿命 | 寿命范围 | 平均初始HP | 平均最低HP | 平均最高HP | HP<50局数 |
|------|---------|---------|-----------|-----------|-----------|-----------|
| human | 66.0 | 58~74 | 43.0 | 0.0 | 120.5 | 2/2 |
| elf | 156.0 | 24~288 | 29.5 | 0.0 | 68.5 | 2/2 |
| goblin | 47.0 | 44~50 | 25.0 | 0.0 | 66.0 | 2/2 |
| dwarf | 305.0 | 259~372 | 49.0 | 0.0 | 116.7 | 3/3 |

### 3.3 衰老模型表现

#### human
- 人类-男-A: Q1(avg=47.2) Q2(avg=64.4) Q3(avg=69.6) Q4(avg=51.3) 死亡age=58
- 人类-男-C: Q1(avg=67.2) Q2(avg=124.4) Q3(avg=140.7) Q4(avg=80.1) 死亡age=74

#### elf
- 精灵-女-A: Q1(avg=57.4) Q2(avg=81.7) Q3(avg=82.0) Q4(avg=65.4) 死亡age=288
- 精灵-女-C: Q1(avg=28.5) Q2(avg=34.5) Q3(avg=40.5) Q4(avg=35.0) 死亡age=24

#### goblin
- 哥布林-女-A: Q1(avg=40.3) Q2(avg=61.8) Q3(avg=71.6) Q4(avg=54.5) 死亡age=44
- 哥布林-男-B: Q1(avg=29.8) Q2(avg=39.0) Q3(avg=50.3) Q4(avg=34.8) 死亡age=50

#### dwarf
- 矮人-男-A: Q1(avg=92.0) Q2(avg=105.7) Q3(avg=95.4) Q4(avg=54.9) 死亡age=372
- 矮人-女-B: Q1(avg=64.0) Q2(avg=42.1) Q3(avg=44.3) Q4(avg=37.3) 死亡age=259
- 矮人-男-C: Q1(avg=94.2) Q2(avg=92.6) Q3(avg=90.9) Q4(avg=67.2) 死亡age=284

## 4. 事件覆盖度

- **总事件数**: 675
- **触发过的事件**: 380 (56.3%)
- **未触发的非unique事件**: 1

### 4.1 按路线统计事件分布

| 路线 | 专属事件数 | 已触发 | 覆盖率 |
|------|-----------|--------|--------|
| mage | 24 | 8 | 33.3% |
| knight | 14 | 3 | 21.4% |
| adventurer | 27 | 4 | 14.8% |
| merchant | 20 | 0 | 0.0% |
| scholar | 14 | 5 | 35.7% |

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
- 精灵 精灵-女-C 最低HP降至 0，HP 过低
- 路线 adventurer (冒险者-人类): 锚点事件未触发: dungeon_explore_1, advanced_dungeon
- 路线 knight (骑士-人类): 锚点事件未触发: knight_glory
- 路线 mage (法师-精灵): 锚点事件未触发: magic_exam
- 路线 merchant (商人-人类): 锚点事件未触发: merchant_career, investment_opportunity, become_lord

### P2 — 非核心功能/数据问题
- 2 个孤儿 Flag: dungeon_injured, miracle_survival
- 108 个死 Flag（设置但从未被引用），可能是冗余数据

## 附录：完整事件 ID 列表

### 各局触发的事件合集

共 380 个独立事件被触发（含路线测试）：

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
- `adv_bounty`
- `apprentice_contest`
- `arena_champion_invite`
- `avenger_confrontation`
- `avenger_trail`
- `birth_dwarf_forge_ember`
- `birth_elf_forest_edge`
- `birth_human_merchant`
- `birth_human_soldier`
- `birth_slums`
- `birth_storm`
- `birth_twins`
- `birth_wilderness`
- `bounty_notice`
- `bullied`
- `bullied_fight_back`
- `bullied_repeat`
- `catch_thief`
- `chain_dark_past`
- `challenge_abyss`
- `challenge_final_boss`
- `challenge_god_trial`
- `child_cooking_adventure`
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
- `cursed_wanderer_village_exile`
- `dark_cult_encounter`
- `dark_mage_choice`
- `dating_deepen`
- `dating_start`
- `disciple_comes`
- `divine_vision`
- `dragon_youngling_growth`
- `elder_apprentice_return`
- `elder_autobiography`
- `elder_disciple_visit`
- `elder_dream_fulfilled`
- `elder_dwarf_dragonfire_watch`
- `elder_dwarf_last_inspection`
- `elder_family_reunion`
- `elder_feast_missing_names`
- `elder_final_gift`
- `elder_frail`
- `elder_garden_peace`
- `elder_illness`
- `elder_kingdom_crisis`
- `elder_last_adventure`
- `elder_last_feast`
- `elder_last_journey`
- `elder_legacy_gift`
- `elder_memoir`
- `elder_memory_fade`
- `elder_miracle_recovery`
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
- `elf_ancient_magic`
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
- `elf_eternal_garden`
- `elf_fading_magic`
- `elf_first_magic_spark`
- `elf_first_treesong`
- `elf_forbidden_book`
- `elf_forbidden_magic_scroll`
- `elf_forest_corruption`
- `elf_forest_expansion`
- `elf_forest_fire_rescue`
- `elf_forest_guardian_test`
- `elf_human_friend_aging`
- `elf_lament_for_fallen`
- `elf_longevity_burden`
- `elf_magic_duel`
- `elf_magic_research`
- `elf_moonblade_ceremony`
- `elf_moonlight_lullaby`
- `elf_moonstone_forge`
- `elf_moonwell_ritual`
- `elf_mortal_friend`
- `elf_passing_crown`
- `elf_ranger_path`
- `elf_runic_barrier`
- `elf_seed_planting`
- `elf_silver_harp`
- `elf_spell_weaving`
- `elf_star_song`
- `elf_starlight_bath`
- `elf_teaching_young`
- `elf_treesong_mastery`
- `elf_watching_generations`
- `elf_waterfall_meditation`
- `elf_wisdom_council_seat`
- `elf_world_tree_communion`
- `elf_worldtree_guardian`
- `elf_young_elf_mentor`
- `explore_ruins`
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
- `goblin_black_market`
- `goblin_chief_council`
- `goblin_cooking_contest`
- `goblin_dream_of_equality`
- `goblin_duel_for_food`
- `goblin_elder_legend`
- `goblin_elder_respect`
- `goblin_elder_wisdom`
- `goblin_final_feast`
- `goblin_forge_trick`
- `goblin_human_kindness`
- `goblin_human_language_teen`
- `goblin_human_toy`
- `goblin_junkyard_palace`
- `goblin_longest_living`
- `goblin_mechanical_genius`
- `goblin_mechanical_heart`
- `goblin_mushroom_garden`
- `goblin_old_bones_ache`
- `goblin_passing_the_torch`
- `goblin_peace_treaty`
- `goblin_potion_brewing`
- `goblin_rat_race`
- `goblin_rebellion`
- `goblin_rescue_mission`
- `goblin_sage`
- `goblin_scavenger_instinct`
- `goblin_school_founder`
- `goblin_shiny_collection`
- `goblin_shiny_obsession`
- `goblin_sunset_hill`
- `goblin_tavern_brawl`
- `goblin_trade_empire`
- `goblin_trash_treasure`
- `goblin_treasure_map`
- `goblin_tribe_challenge`
- `goblin_tribe_legacy`
- `goblin_tunnel_architect`
- `goblin_tunnel_race`
- `goblin_underground_empire`
- `goblin_underground_race`
- `goblin_warchief_duel`
- `goblin_wise_counsel`
- `grandma_recipes`
- `guild_recruitment`
- `harvest_festival`
- `heartbreak_growth`
- `help_farmer`
- `hidden_potential`
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
- `human_debt_crisis`
- `human_diplomacy`
- `human_diplomatic_mission`
- `human_family_tradition`
- `human_fathers_sword`
- `human_feudal_politics`
- `human_final_prayer`
- `human_first_job`
- `human_grandchild_laughter`
- `human_grandchild_story`
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
- `lost_treasure_map`
- `love_at_first_sight`
- `lover_death_battlefield`
- `luk_lottery`
- `luk_lucky_coin`
- `luk_wild_encounter`
- `mage_arcane_library`
- `mage_elemental_plane`
- `mage_magic_tower`
- `mage_magic_war`
- `magic_academy_letter`
- `magic_breakthrough_final`
- `magic_duel`
- `magic_graduate`
- `market_haggling`
- `marriage_anniversary`
- `martial_arts_master`
- `master_spell`
- `mercenary_contract`
- `meteor_shower`
- `mid_adopt_orphan`
- `mid_apprentice_success`
- `mid_body_decline`
- `mid_chronic_pain`
- `mid_dwarf_apprentice_oath`
- `mid_dwarf_name_in_hall`
- `mid_familiar_place_changes`
- `mid_found_school`
- `mid_garden_retirement`
- `mid_health_scare`
- `mid_legacy_project`
- `mid_legacy_review`
- `mid_life_reflection`
- `mid_magic_experiment`
- `mid_magic_potion`
- `mid_mentoring_youth`
- `mid_natural_disaster`
- `mid_old_friend_reunion`
- `mid_property_acquisition`
- `mid_return_adventure`
- `mid_scholar_work`
- `mid_slowing_down`
- `midlife_new_craft`
- `mysterious_stranger`
- `noble_admirer`
- `noble_kid_revenge`
- `old_friend_reunion`
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
- `rescue_from_dungeon`
- `retirement`
- `rival_training`
- `river_discovery`
- `river_fishing`
- `spr_divine_sign`
- `spr_meditation_retreat`
- `spr_near_death`
- `squire_opportunity`
- `stand_up_moment`
- `star_gazing`
- `steal_sweets`
- `stray_dog`
- `street_performance`
- `street_performer`
- `student_successor`
- `teaching_others`
- `teen_dwarf_choose_master`
- `teen_dwarf_dragon_relic_vigil`
- `teen_first_errand`
- `teen_future_talk`
- `teen_library_discovery`
- `teen_mentor_meeting`
- `teen_nightmare`
- `teen_race_competition`
- `teen_secret_discovered`
- `teen_traveling_circus`
- `traveling_sage`
- `tree_climbing`
- `village_festival`
- `village_feud`
- `village_race`
- `wander_market`
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