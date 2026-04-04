"""
Phase B2: 废选项改造 (net <= 0)
按 phase1-cost-benefit-symmetry.md 3.3 节，给废选项增加正面收益。
策略：
- net<0 的分支：增加正面收益使 net 在 +1~+3
- net=0 且无效果的分支：增加 2-3 个属性收益 总 net +2~+3
- net=0 但已有效果的分支：微调增加 1-2 收益
"""
import json, glob, os

# ========== 具体补丁 ==========
# 按 QA 需求文档 3.3 节逐项定义

PATCHES = {
    # ===== 严重负面 (net < -5) =====
    
    # elder_final_illness/final_treatment net=-26 → 这是临终事件，保持严厉但加一点温暖
    ("elder_final_illness", "final_treatment"): [
        {"type": "modify_attribute", "target": "spr", "value": 3, "description": "不放弃的意志"},
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "家人的陪伴"}
    ],
    # elder_frail/frail_extend net=-22.5 → 加一些精神收益
    ("elder_frail", "frail_extend"): [
        {"type": "modify_attribute", "target": "spr", "value": 3, "description": "领悟生命的意义"},
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "病中的思考"}
    ],
    # mid_chronic_pain/seek_treatment net=-14 → 加 HP 恢复和其他收益
    ("mid_chronic_pain", "seek_treatment"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "积极面对疾病的勇气"},
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "了解了医疗知识"}
    ],
    # mid_chronic_pain/endure_pain net=-1.5
    ("mid_chronic_pain", "endure_pain"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "苦痛中锻炼的意志如钢"},
        {"type": "set_flag", "target": "iron_will", "value": 1, "description": "获得钢铁意志"}
    ],
    # mid_vision_decline/get_glasses net=-8 → 加收益
    ("mid_vision_decline", "get_glasses"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "眼镜带来更清晰的视野"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "学者风范"}
    ],
    
    # ===== 中等负面 (-5 < net < 0) =====
    
    # gambling_night/gamble_lose net=-7
    ("gambling_night", "gamble_lose"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "吃一堑长一智"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "学会了克制"}
    ],
    # mid_existential_crisis/crisis_drown net=-5
    ("mid_existential_crisis", "crisis_drown"): [
        {"type": "modify_attribute", "target": "mag", "value": 2, "description": "绝望中感应到了魔力"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "触底反弹的觉悟"}
    ],
    # elder_illness/illness_fight net=-6
    ("elder_illness", "illness_fight"): [
        {"type": "modify_attribute", "target": "spr", "value": 3, "description": "与病魔抗争的坚强意志"}
    ],
    # elder_illness/illness_magic net=-2
    ("elder_illness", "illness_magic"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "研究治疗魔法获得的知识"}
    ],
    # forbidden_love/branch1 net=-4
    ("forbidden_love", "forbidden_love_branch1"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "痛苦中的精神成长"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "经历让你更成熟"}
    ],
    # forbidden_love/branch0 net=-2.5
    ("forbidden_love", "forbidden_love_branch0"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "禁忌之爱中的勇气"}
    ],
    # mid_heir_training/heir_rebel net=-4
    ("mid_heir_training", "heir_rebel"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "反思教育方式"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "学会放手"}
    ],
    # dragon_slay_attempt/dragon_defeat net=-3.5
    ("dragon_slay_attempt", "dragon_defeat"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "死里逃生的领悟"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "认清了自己的极限"}
    ],
    # child_plague/plague_resist net=-2.5
    ("child_plague", "plague_resist"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "大病初愈后体质反而增强"}
    ],
    # child_plague/plague_rest net=-2
    ("child_plague", "plague_rest"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "静养中的内心平静"}
    ],
    # spr_meditation_retreat/meditation_deep net=-2
    ("spr_meditation_retreat", "meditation_deep"): [
        {"type": "modify_attribute", "target": "mag", "value": 2, "description": "冥想中魔力觉醒"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "深层的智慧"}
    ],
    # disciple_comes/refuse_disciple net=-2
    ("disciple_comes", "refuse_disciple"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "独处的时间找回初心"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "省下教学时间用于自修"}
    ],
    # elder_disciple_visit/disciple_disappoint net=-2
    ("elder_disciple_visit", "disciple_disappoint"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "反思自己的教导方式"}
    ],
    # elder_family_reunion/family_dispute net=-2
    ("elder_family_reunion", "family_dispute"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "争吵中也理解了家人的想法"}
    ],
    # mid_old_enemy/enemy_hide net=-2
    ("mid_old_enemy", "enemy_hide"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "隐忍的智慧"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "暗中观察学到了东西"}
    ],
    # village_feud/pretend_not_see net=-2
    ("village_feud", "pretend_not_see"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "旁观者清"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "避开了纠纷"}
    ],
    # luk_lucky_coin/lucky_lost net=-2
    ("luk_lucky_coin", "lucky_lost"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "缘来缘去，不执着"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "失去后更珍惜拥有的"}
    ],
    # mid_body_decline/defy_decline net=-1.5
    ("mid_body_decline", "defy_decline"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "不甘心的背后是深思"}
    ],
    
    # ===== 轻微负面 (net = -1) =====
    
    # challenge_final_boss/boss_support net=-1
    ("challenge_final_boss", "boss_support"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "支援获得同伴认可"}
    ],
    # quest_parting/branch1 net=-1
    ("quest_parting", "quest_parting_branch1"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "离别中的成长"}
    ],
    # neighbor_dispute/dispute_force net=-1
    ("neighbor_dispute", "dispute_force"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "暴力解决问题的效率"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "震慑了其他邻居"}
    ],
    # bullied_repeat/endure_again net=-1
    ("bullied_repeat", "endure_again"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "忍耐中磨炼心智"},
        {"type": "set_flag", "target": "deep_observer", "value": 1, "description": "成为了敏锐的观察者"}
    ],
    # childhood_chase/catch_one net=-1
    ("childhood_chase", "catch_one"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "追上小伙伴获得认可"}
    ],
    # village_festival/festival_eat net=-1
    ("village_festival", "festival_eat"): [
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "美食带来好心情"}
    ],
    # village_festival/festival_watch_fireworks net=-1
    ("village_festival", "festival_watch_fireworks"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "烟花下的感动"}
    ],
    # rainy_day_adventure/wait_at_door net=-1
    ("rainy_day_adventure", "wait_at_door"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "观察雨水的思考"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "宁静等待的耐心"}
    ],
    # child_drowning/drowning_struggle net=-1
    ("child_drowning", "drowning_struggle"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "挣扎中激发的求生本能"}
    ],
    # elder_memoir/memoir_abandon net=-1
    ("elder_memoir", "memoir_abandon"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "放下过去的释然"}
    ],
    # elder_last_adventure/last_adv_pass net=-1
    ("elder_last_adventure", "last_adv_pass"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "不冒险也是一种智慧"}
    ],
    # elder_memory_fade/memory_record net=-1
    ("elder_memory_fade", "memory_record"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "记录的过程整理了思维"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "留给后人的宝贵文字"}
    ],
    # mid_political_intrigue/plot_refuse net=-1
    ("mid_political_intrigue", "plot_refuse"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "拒绝阴谋的正气"}
    ],
    # mid_found_school/school_giveup net=-1
    ("mid_found_school", "school_giveup"): [
        {"type": "modify_attribute", "target": "mny", "value": 2, "description": "省下的资金用于投资"}
    ],
    # mid_adopt_orphan/adopt_donate net=-1
    ("mid_adopt_orphan", "adopt_donate"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "捐赠获得社区赞誉"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "善行的宁静"}
    ],
    # mid_body_decline/accept_decline net=-1
    ("mid_body_decline", "accept_decline"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "接受现实的平静"}
    ],
    # old_soldier_story/bored_leave net=-1
    ("old_soldier_story", "bored_leave"): [
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "路上捡到一枚铜币"},
        {"type": "modify_attribute", "target": "mny", "value": 1, "description": "用省下的时间去赚钱"}
    ],
    # elder_final_illness/final_accept net=-0.5
    ("elder_final_illness", "final_accept"): [
        {"type": "modify_attribute", "target": "spr", "value": 3, "description": "坦然面对死亡的大智慧"}
    ],
    # soul_corruption_consequence/embrace_darkness net=-0.5
    ("soul_corruption_consequence", "embrace_darkness"): [
        {"type": "modify_attribute", "target": "mag", "value": 2, "description": "暗黑力量的馈赠"}
    ],
    # lost_in_dungeon/dungeon_forward net=-0.5
    ("lost_in_dungeon", "dungeon_forward"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "在黑暗中学到了地牢知识"}
    ],
    
    # ===== net=0 但有一些效果的（加微量收益使 net +1~+2） =====
    
    # lost_in_dungeon/dungeon_retreat net=0
    ("lost_in_dungeon", "dungeon_retreat"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "知道何时撤退也是智慧"}
    ],
    # investment_opportunity/reject_invest net=0
    ("investment_opportunity", "reject_invest"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "谨慎的自我肯定"},
        {"type": "modify_attribute", "target": "mny", "value": 1, "description": "保住了本金"}
    ],
    # mysterious_stranger/treat_drink net=0
    ("mysterious_stranger", "treat_drink"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "慷慨的印象"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "好人有好报"}
    ],
    # old_rival/cold_shoulder net=0
    ("old_rival", "cold_shoulder"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不被过去束缚"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "冷静判断的能力"}
    ],
    # spr_curse_breaker/curse_refuse net=0
    ("spr_curse_breaker", "curse_refuse"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "知道自己的极限"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "避开了危险"}
    ],
    # spr_near_death/neardeath_bargain net=0
    ("spr_near_death", "neardeath_bargain"): [
        {"type": "modify_attribute", "target": "mag", "value": 2, "description": "与死神交涉获得的神秘力量"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "面对死亡的超脱"}
    ],
    # mny_trade_route/trade_pass net=0
    ("mny_trade_route", "trade_pass"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不被金钱诱惑"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "冷静分析了风险"}
    ],
    # mage_magic_tower/tower_observe net=0
    ("mage_magic_tower", "tower_observe"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "远观中学到了塔的设计"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "敬畏之心"}
    ],
    # mage_elemental_plane/plane_seal net=0
    ("mage_elemental_plane", "plane_seal"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "封印裂隙的责任感"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "守护者的声望"}
    ],
    # mage_magic_war/magicwar_neutral net=0
    ("mage_magic_war", "magicwar_neutral"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "中立旁观者的洞察"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "保持和平的信念"}
    ],
    # knight_siege/siege_retreat net=0
    ("knight_siege", "siege_retreat"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "战略撤退的智慧"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "保全士兵的仁慈"}
    ],
    # knight_dragon_quest/dragon_party net=0
    ("knight_dragon_quest", "dragon_party"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "组队获得的人脉"}
    ],
    # knight_dragon_quest/dragon_refuse net=0
    ("knight_dragon_quest", "dragon_refuse"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "知退的智慧"},
        {"type": "modify_attribute", "target": "mny", "value": 1, "description": "用省下时间经商"}
    ],
    # merchant_guild/guild_pass net=0
    ("merchant_guild", "guild_pass"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "独立经营的自在"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "自由带来的机遇"}
    ],
    # merchant_auction/auction_watch net=0
    ("merchant_auction", "auction_watch"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "旁观中学到了拍卖技巧"}
    ],
    # merchant_economic_crisis/crisis_stable net=0
    ("merchant_economic_crisis", "crisis_stable"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "稳健经营的满足"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "经济学知识增长"}
    ],
    # adv_bounty/bounty_pass net=0
    ("adv_bounty", "bounty_pass"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "不被赏金诱惑的定力"}
    ],
    # adv_uncharted/uncharted_report net=0
    ("adv_uncharted", "uncharted_report"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "详细报告获得学者赞赏"}
    ],
    # adv_uncharted/uncharted_forget net=0
    ("adv_uncharted", "uncharted_forget"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "放下执念的轻松"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "无心之举反而交了好运"}
    ],
    # dual_war_mage/warmage_refuse net=0
    ("dual_war_mage", "warmage_refuse"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "拒绝战争的和平信念"}
    ],
    # dual_merchant_spy/spy_decline net=0
    ("dual_merchant_spy", "spy_decline"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "正直经商的荣耀"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "诚信的口碑"}
    ],
    # dual_merchant_spy/spy_investigate net=0
    ("dual_merchant_spy", "spy_investigate"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "调查中获得的情报素养"}
    ],
    # chain_rise_to_power/power_decline net=0
    ("chain_rise_to_power", "power_decline"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "不被权力腐蚀的纯净"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "远离权谋免遭牵连"}
    ],
    # chain_master_craftsman/craft_retire net=0
    ("chain_master_craftsman", "craft_retire"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "功成身退的安详"}
    ],
    # chain_dark_past/dark_negotiate net=0
    ("chain_dark_past", "dark_negotiate"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "谈判能力的展现"}
    ],
    # chain_dark_past/dark_confess net=0
    ("chain_dark_past", "dark_confess"): [
        {"type": "modify_attribute", "target": "spr", "value": 3, "description": "坦白后的心灵解脱"}
    ],
    # chain_dark_past/dark_threaten net=0
    ("chain_dark_past", "dark_threaten"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "威胁时的气场"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "利用信息的能力"}
    ],
    # rescue_from_dungeon/branch1 net=0
    ("rescue_from_dungeon", "rescue_from_dungeon_branch1"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "在困境中保持冷静"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "等待救援的策略"}
    ],
    # magical_creature_tame/kill_creature net=0
    ("magical_creature_tame", "kill_creature"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "战斗经验"},
        {"type": "modify_attribute", "target": "mny", "value": 1, "description": "魔物素材的价值"}
    ],
    # war_campaign/campaign_dodge net=0
    ("war_campaign", "campaign_dodge"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "活着就有机会"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "逃过大劫的幸运"}
    ],
    # buy_house/house_buy net=0
    ("buy_house", "house_buy"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "安定感"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "邻里尊重有产之人"}
    ],
    # birth_noble_estate/noble_neglected net=0
    ("birth_noble_estate", "noble_neglected"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "学会了独立"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "孤独中的自我学习"}
    ],
    # birth_wilderness/wild_orphan net=0
    ("birth_wilderness", "wild_orphan"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "荒野求生的生命力"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "被好心人收养"}
    ],

    # ===== 童年 =====
    ("steal_sweets", "apologize"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "诚实的品格"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "大人原谅了你"}
    ],
    ("steal_sweets", "lie_about_it"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "编故事的能力"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "侥幸没被拆穿"}
    ],
    ("river_fishing", "chase_fish"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "在水中锻炼了体力"}
    ],
    ("childhood_chase", "fall_down"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "跌倒后学会更小心"},
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "擦伤后更坚强"}
    ],
    ("childhood_chase", "let_go"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不争不抢的洒脱"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "观察追逐中他人的策略"}
    ],
    ("childhood_hide_seek", "hide_well"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "善于观察地形"}
    ],
    ("childhood_hide_seek", "found_quickly"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "朋友们觉得你很可爱"}
    ],
    ("childhood_hide_seek", "hide_scary_place"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "克服了恐惧"},
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "冒险精神"}
    ],
    ("childhood_pet", "leave_bird"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "让它自由的善良"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "理解了自然规律"}
    ],
    ("childhood_pet", "call_adult"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "求助的社交能力"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "知道什么时候该找帮手"}
    ],
    ("rainy_day_adventure", "run_home_rain"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "在雨中奔跑的体力"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "恰好在暴雨前到家"}
    ],
    ("first_competition", "strategic_forfeit"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "战略性放弃是种智慧"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "接受失败的豁达"}
    ],
    ("grandma_recipes", "absent_minded"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "虽然心不在焉但很温暖"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "意外发现了有趣的东西"}
    ],
    ("grandma_recipes", "secret_recipe"): [
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "意外发现的乐趣"}
    ],
    ("river_discovery", "call_adults_river"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "大人夸你懂事"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "谨慎的性格"}
    ],
    
    # ===== 老年 =====
    ("elder_family_reunion", "family_legacy"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "传承的意义"}
    ],
    ("elder_illness", "illness_accept"): [
        {"type": "modify_attribute", "target": "spr", "value": 3, "description": "坦然接受命运的大智慧"}
    ],
    ("elder_kingdom_crisis", "crisis_evacuate"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "疏散群众获得爱戴"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "保护他人的温暖"}
    ],
    ("elder_memory_fade", "memory_present"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "活在当下的哲学"}
    ],
    
    # ===== 中年 =====
    ("legacy_question", "think_about_it"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "深思熟虑"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不急于做决定的智慧"}
    ],
    ("legacy_question", "refuse_request"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "拒绝的果断"},
        {"type": "modify_attribute", "target": "mny", "value": 1, "description": "省下了麻烦事的开销"}
    ],
    ("mid_adopt_orphan", "adopt_ignore"): [
        {"type": "modify_attribute", "target": "mny", "value": 2, "description": "省下了养育费用"}
    ],
    ("mid_scholar_work", "scholar_abandon"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "放下学术压力"},
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "有更多时间锻炼身体"}
    ],
    ("mid_magic_experiment", "experiment_stop"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "远离危险的安心"},
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "保全了身体"}
    ],
    ("mid_business_rivalry", "rivalry_retreat"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "不与人争的豁达"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "退让反而避开了陷阱"}
    ],
    ("widowed_wanderer", "widowed_wanderer_branch1"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "独自旅行找回自己"}
    ],
    ("mid_vision_decline", "rely_on_experience"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "经验弥补了视力"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "淡然接受的心境"}
    ],
    ("mid_slowing_down", "push_through"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "坚持锻炼的成果"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不服老的精神"}
    ],
    
    # ===== 少年 =====
    ("love_at_first_sight", "watch_from_afar"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "暗恋的心灵成长"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "观察心仪之人学到很多"}
    ],
    ("spr_dream_vision", "dream_fear"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "恐惧激发的求生本能"}
    ],
    ("chr_public_speech", "speech_flee"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "认识到自己的弱点"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "下次会更好准备"}
    ],
    ("mage_arcane_library", "arcane_leave"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "知道什么不该碰"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "避开了危险的知识"}
    ],
    
    # ===== 青年 =====
    ("merchant_apprentice", "refuse_merchant"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "坚持自己道路的意志"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "用自己的方式学习经济"}
    ],
    ("explore_ruins", "peek_from_outside"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "远距离观察也有收获"},
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "谨慎的判断"}
    ],
    ("explore_ruins", "run_away"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "逃跑也需要体力"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "及时跑掉避免了危险"}
    ],
    ("street_performance", "just_watch"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "享受他人表演的专注"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "学到了表演技巧"}
    ],
    ("village_race", "trip_over"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "跌倒了爬起来"},
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "大家为你的坚持鼓掌"}
    ],
    ("catch_thief", "shout_alert"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "警觉的公民精神获得赞赏"}
    ],
    ("village_feud", "tell_adult"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "妥善处理纠纷的社交能力"}
    ],
    ("lost_treasure_map", "hide_it"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "留着悬念的期待"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "也许以后用得上"}
    ],
    ("luk_potion_find", "potion_leave"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不贪心的美德"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "不明药水少碰为妙"}
    ],
    ("spr_spirit_animal", "spirit_watch"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "静观灵兽的和谐"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "观察自然的学问"}
    ],
    ("spr_spirit_animal", "spirit_flee"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "逃跑时的全力冲刺"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "没被灵兽追上的幸运"}
    ],
    ("str_bodyguard_job", "guard_decline"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不做暴力工作的内心宁静"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "去做了更有意义的事"}
    ],
    ("int_invention", "invention_forget"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不被灵感束缚的自由"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "也许别人会发明出来"}
    ],
    ("knight_tournament", "tournament_watch"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "旁观学到了武术招式"}
    ],
    ("knight_tournament", "tournament_skip"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "做自己想做的事"},
        {"type": "modify_attribute", "target": "mny", "value": 1, "description": "在别处找到了赚钱机会"}
    ],
    ("adv_legendary_dungeon", "dungeon_team"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "组队合作的默契与友谊"}
    ],
    ("dual_charisma_magic", "charmagic_decline"): [
        {"type": "modify_attribute", "target": "spr", "value": 2, "description": "保持自我的定力"}
    ],
    ("dual_scholar_warrior", "sw_quit"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "知道自己不适合就放弃也是智慧"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "避免了受伤的危险"}
    ],
    ("bandit_ambush", "bandit_run"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "逃跑的速度锻炼了体能"},
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "成功脱身的运气"}
    ],
}

total = 0
for fpath in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    data = json.load(open(fpath, "r", encoding="utf-8"))
    fname = os.path.basename(fpath)
    changed = 0
    for evt in data:
        for br in evt.get("branches", []):
            key = (evt["id"], br["id"])
            if key in PATCHES:
                br["effects"].extend(PATCHES[key])
                changed += 1
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  {fname}: {changed} 个分支修改")
        total += changed
print(f"\n共修改 {total} 个废选项分支")
