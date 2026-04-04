#!/usr/bin/env python3
"""
种族专属事件扩充 v4 — 重点填补 adult/youth/teenager/elder 缺口
目标：从 39% → 48%+
"""
import json, os

EVENT_DIR = "data/sword-and-magic/events"

def load(fn):
    with open(os.path.join(EVENT_DIR, fn)) as f:
        return json.load(f)

def save(fn, events):
    with open(os.path.join(EVENT_DIR, fn), "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

def inject(fn, new_events):
    events = load(fn)
    ids = {e["id"] for e in events}
    added = 0
    for ne in new_events:
        if ne["id"] not in ids:
            events.append(ne)
            ids.add(ne["id"])
            added += 1
    if added > 0:
        save(fn, events)
    return added

def MA(t, v): return {"type": "modify_attribute", "target": t, "value": v}
def SF(f): return {"type": "set_flag", "target": f}
def MHP(v): return {"type": "modify_hp", "target": "hp", "value": v}
def RF(f): return {"type": "remove_flag", "target": f}

# ======================================================================
# 人类 — 青年追加 (youth)
# ======================================================================
human_youth_v4 = [
    {"id": "human_militia_training", "title": "民兵训练",
     "description": "你报名参加了城镇的民兵训练。每天清晨出操，练习长矛阵型和基本剑术。",
     "minAge": 17, "maxAge": 22, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [MA("str", 2), MA("spr", 1)], "include": ""},
    {"id": "human_first_hunt", "title": "第一次狩猎",
     "description": "你跟着猎人们第一次进入深林狩猎。那种跟踪猎物的紧张感让你全身的感官都活了过来。",
     "minAge": 17, "maxAge": 22, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "独自追踪猎物", "effects": [MA("str", 2), MA("int", 1)]},
         {"label": "配合老手行动", "effects": [MA("chr", 1), MA("str", 1)]}
     ]},
    {"id": "human_apprentice_scholar", "title": "学徒生涯",
     "description": "你被城里的学者收为学徒。整理书架、抄写手稿、为师父泡茶——学问就是从这些琐事中慢慢积累的。",
     "minAge": 17, "maxAge": 23, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2), MA("spr", 1)], "include": ""},
    {"id": "human_river_crossing", "title": "涉险渡河",
     "description": "暴雨中桥被冲垮了。你必须趟着齐腰的洪水把药送到对岸的村庄。",
     "minAge": 18, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "咬牙趟过去", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 9, "successEffects": [MA("chr", 2)], "failEffects": [MHP(-2)]}},
         {"label": "绕远路走山道", "effects": [MA("int", 1), MA("spr", 1)]}
     ]},
    {"id": "human_church_service", "title": "教会服务",
     "description": "你在当地教会做了一段时间的义工。帮助穷人、安慰病患，这让你看到了人间更多的面貌。",
     "minAge": 17, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 1)], "include": ""},
    {"id": "human_horse_taming", "title": "驯马",
     "description": "牧场主给了你一匹性格暴烈的野马。花了整整三天，你终于能骑着它在草原上奔跑了。",
     "minAge": 18, "maxAge": 23, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 2), MA("chr", 1)], "include": ""},
]

# ======================================================================
# 人类 — 成年追加 (adult)
# ======================================================================
human_adult_v4 = [
    {"id": "human_tax_reform", "title": "税制改革",
     "description": "你联合其他居民向领主请愿改革不公平的税制。这需要勇气，也需要智慧。",
     "minAge": 30, "maxAge": 50, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "attribute.chr >= 12",
     "branches": [
         {"label": "据理力争", "effects": [MA("chr", 2), MA("spr", 1)]},
         {"label": "暗中联络盟友", "effects": [MA("int", 2), MA("chr", 1)]},
         {"label": "放弃请愿", "effects": [MA("spr", 1)]}
     ]},
    {"id": "human_bridge_builder", "title": "建桥",
     "description": "两个村子之间的旧桥年久失修。你出钱出力组织重建，连接了两岸的人们。",
     "minAge": 28, "maxAge": 45, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 2), MA("mny", -2), SF("pioneer")], "include": "attribute.mny >= 8"},
    {"id": "human_mercenary_life", "title": "佣兵生涯",
     "description": "你加入了一支佣兵团，为各方势力执行任务。刀尖上舔血的日子虽然危险，但报酬丰厚。",
     "minAge": 25, "maxAge": 40, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [MA("str", 2), MA("mny", 2)], "include": "attribute.str >= 12"},
    {"id": "human_diplomatic_mission", "title": "外交使团",
     "description": "你被选入一支前往精灵国度的外交使团。这是增进两族关系的重要任务。",
     "minAge": 30, "maxAge": 50, "weight": 2, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "attribute.chr >= 15",
     "branches": [
         {"label": "诚恳沟通", "effects": [MA("chr", 3), SF("diplomat")]},
         {"label": "暗中搜集情报", "effects": [MA("int", 2), MA("luk", 1)]}
     ]},
    {"id": "human_vineyard", "title": "葡萄园",
     "description": "你在山坡上开辟了一片葡萄园。第三年终于酿出了第一桶酒，味道居然不错。",
     "minAge": 28, "maxAge": 50, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("mny", 2), MA("spr", 1)], "include": ""},
    {"id": "human_orphan_adoption", "title": "收养孤儿",
     "description": "战争或灾荒留下了许多孤儿。你决定收养一个。",
     "minAge": 28, "maxAge": 50, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 1), SF("adopted_child")], "include": ""},
    {"id": "human_jousting_tournament", "title": "马上比武大会",
     "description": "一年一度的马上比武大会在王都举行。你披上盔甲，骑上战马，准备一展身手。",
     "minAge": 25, "maxAge": 40, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "attribute.str >= 12",
     "branches": [
         {"label": "全力以赴", "effects": [MA("str", 1)], "diceCheck": {"attribute": "str", "dc": 12, "successEffects": [MA("chr", 3), MA("mny", 3), SF("champion")], "failEffects": [MHP(-3)]}},
         {"label": "重在参与", "effects": [MA("chr", 1), MA("str", 1)]}
     ]},
    {"id": "human_debt_crisis", "title": "债务危机",
     "description": "生意失败，你欠下了一大笔债。债主们天天登门催账。",
     "minAge": 25, "maxAge": 50, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "努力还债", "effects": [MA("str", 1), MA("spr", 2)]},
         {"label": "找贵人帮忙", "effects": [MA("chr", 2)]},
         {"label": "跑路", "effects": [MA("luk", 1), MA("str", 1)]}
     ]},
]

# ======================================================================
# 人类 — 中年/老年追加
# ======================================================================
human_middle_v4 = [
    {"id": "human_mentor_youth", "title": "指导年轻人",
     "description": "一个年轻人慕名而来拜你为师。看着对方热切的眼神，你想起了曾经的自己。",
     "minAge": 38, "maxAge": 55, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2), MA("spr", 1), SF("has_student")], "include": ""},
    {"id": "human_land_dispute", "title": "土地纠纷",
     "description": "邻居声称你的围墙占了他家的地。这种事在人类村庄每天都在发生。",
     "minAge": 35, "maxAge": 55, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "找村长仲裁", "effects": [MA("int", 1), MA("chr", 1)]},
         {"label": "让一步算了", "effects": [MA("spr", 2)]},
         {"label": "绝不退让", "effects": [MA("str", 1)]}
     ]},
    {"id": "human_grey_hair", "title": "第一根白发",
     "description": "你在镜子里发现了第一根白发。人类的寿命就是这样，还没感觉年轻够久，岁月就来催了。",
     "minAge": 35, "maxAge": 50, "weight": 5, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
]

human_elder_v4 = [
    {"id": "human_retirement_cottage", "title": "退休小屋",
     "description": "你在乡下造了一间小屋，打算安度余生。花园里种满了妻子最爱的花。",
     "minAge": 55, "maxAge": 75, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
    {"id": "human_village_historian", "title": "村庄史官",
     "description": "你开始把村子几百年来的故事记录下来。虽然不知道会不会有人看，但总得有人记住这些。",
     "minAge": 55, "maxAge": 80, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2), MA("spr", 1)], "include": ""},
    {"id": "human_grandchild_laughter", "title": "孙辈的笑声",
     "description": "孙子孙女在院子里追逐打闹。你怎么看都看不腻。",
     "minAge": 55, "maxAge": 80, "weight": 5, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 1)], "include": ""},
]

# ======================================================================
# 精灵 — 青年追加 (youth)
# ======================================================================
elf_youth_v4 = [
    {"id": "elf_moonwell_ritual", "title": "月池仪式",
     "description": "你参加了精灵成年后的第一次月池仪式。银色的池水映照出你未来的可能性。",
     "minAge": 20, "maxAge": 30, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("spr", 1)], "include": ""},
    {"id": "elf_beast_tongue", "title": "兽语习得",
     "description": "你学会了与森林中的鸟兽交流的技巧。一只老鹰成了你的信使。",
     "minAge": 20, "maxAge": 30, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 1), MA("chr", 1)], "include": ""},
    {"id": "elf_healing_spring", "title": "治愈之泉",
     "description": "你发现了一处隐藏在深林中的治愈之泉。泉水拥有修复伤口的魔力。",
     "minAge": 18, "maxAge": 28, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "exploration", "routes": ["*"],
     "effects": [MHP(3), MA("mag", 1), SF("forest_healer")], "include": ""},
    {"id": "elf_dwarf_trade", "title": "与矮人贸易",
     "description": "精灵和矮人之间虽然文化差异巨大，但贸易却是互惠的。你第一次担任贸易代表。",
     "minAge": 20, "maxAge": 30, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "公平交易", "effects": [MA("chr", 2), MA("mny", 1)]},
         {"label": "尽量多换些矮人铁器", "effects": [MA("int", 1), MA("mny", 2)]}
     ]},
    {"id": "elf_spirit_deer", "title": "灵鹿相伴",
     "description": "一头散发着柔光的灵鹿出现在你身边，不肯离去。这是森林之灵选中守护者的征兆。",
     "minAge": 18, "maxAge": 28, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 1), MA("spr", 2), SF("spirit_companion")], "include": "attribute.spr >= 10"},
    {"id": "elf_painting_century", "title": "百年画作",
     "description": "你开始创作一幅需要数十年才能完成的壁画。每一笔都记录着你对世界的感悟。",
     "minAge": 20, "maxAge": 30, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 1), MA("int", 1)], "include": ""},
]

# ======================================================================
# 精灵 — 成年追加 (adult)
# ======================================================================
elf_adult_v4 = [
    {"id": "elf_spell_weaving", "title": "织法术式",
     "description": "你终于掌握了将多种魔法编织在一起的高级技巧。这是成为大法师的必经之路。",
     "minAge": 50, "maxAge": 150, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 3)], "include": "attribute.mag >= 18"},
    {"id": "elf_human_friend_aging", "title": "人类友人的衰老",
     "description": "你的人类朋友已经满头白发，而你看起来还是当年的模样。他笑着说：'你还是别来我葬礼了，太扎眼。'",
     "minAge": 50, "maxAge": 150, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 3)], "include": ""},
    {"id": "elf_runic_barrier", "title": "符文结界",
     "description": "你为精灵领地的边界加固了一层新的魔法结界。这需要连续七天不眠不休的施法。",
     "minAge": 40, "maxAge": 120, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("str", 1)], "include": "attribute.mag >= 15"},
    {"id": "elf_crystal_cave", "title": "水晶洞窟",
     "description": "你在探索中发现了一处充满魔力水晶的洞窟。水晶的嗡鸣声中似乎蕴含着远古的知识。",
     "minAge": 40, "maxAge": 150, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "exploration", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "仔细研究水晶", "effects": [MA("mag", 2), MA("int", 2)]},
         {"label": "带一些回去", "effects": [MA("mny", 2), MA("mag", 1)]},
         {"label": "封印洞窟保护它", "effects": [MA("spr", 2)]}
     ]},
    {"id": "elf_treesong_mastery", "title": "树歌精通",
     "description": "你学会了用歌声引导树木生长的古法。一首歌能让枯木逢春，也能让树墙拔地而起。",
     "minAge": 50, "maxAge": 150, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("chr", 2)], "include": "attribute.mag >= 18 & attribute.chr >= 10"},
    {"id": "elf_dream_walker", "title": "入梦者",
     "description": "你掌握了进入他人梦境的技巧。这是精灵弥合心灵创伤的古老疗法。",
     "minAge": 50, "maxAge": 200, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("spr", 2)], "include": "attribute.mag >= 20 & attribute.spr >= 15"},
]

# ======================================================================
# 精灵 — 中年/老年追加
# ======================================================================
elf_middle_v4 = [
    {"id": "elf_memory_garden", "title": "记忆花园",
     "description": "你开辟了一座用魔法植物记录记忆的花园。每朵花都是一段过往。走入其中就像翻阅人生。",
     "minAge": 100, "maxAge": 300, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MA("mag", 1)], "include": ""},
    {"id": "elf_young_elf_mentor", "title": "指导年轻精灵",
     "description": "一个精灵少年被交到你手下培养。你用百年的经验为他规划成长道路。",
     "minAge": 80, "maxAge": 250, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2), SF("has_student")], "include": ""},
    {"id": "elf_world_tree_sickness", "title": "世界树之疾",
     "description": "世界树的一根枝条开始枯萎。精灵们人人自危。你被指派去调查原因。",
     "minAge": 100, "maxAge": 300, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "magic", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "深入树根调查", "effects": [MA("mag", 3), MA("int", 2)]},
         {"label": "召集长老会议", "effects": [MA("chr", 2), MA("int", 1)]},
         {"label": "用自身魔力尝试治愈", "effects": [MA("mag", 2), MA("spr", 2), MHP(-2)]}
     ]},
]

elf_elder_v4 = [
    {"id": "elf_starlight_legacy", "title": "星光遗产",
     "description": "你将毕生研究的星辰魔法整理成册，留给后代。这套理论或许百年后才会被人理解。",
     "minAge": 300, "maxAge": 500, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("int", 2), SF("legacy_passed")], "include": "attribute.mag >= 25"},
    {"id": "elf_last_spring", "title": "最后的春天",
     "description": "你知道这可能是你经历的最后一个春天了。花开得和几百年前一模一样，你却再也不一样了。",
     "minAge": 350, "maxAge": 500, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 4)], "include": ""},
    {"id": "elf_return_to_forest", "title": "回归森林",
     "description": "你选择在古树下安息。精灵相信，死后灵魂会融入世界树，成为森林永恒的一部分。",
     "minAge": 400, "maxAge": 500, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 5), MA("mag", 2)], "include": ""},
]

# ======================================================================
# 哥布林 — 青年追加 (youth)
# ======================================================================
goblin_youth_v4 = [
    {"id": "goblin_clockwork_toy", "title": "发条玩具",
     "description": "你用齿轮和弹簧造了一个能自己走路的小机器人。虽然走两步就倒，但这是个开始。",
     "minAge": 14, "maxAge": 22, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2)], "include": ""},
    {"id": "goblin_black_market_stall", "title": "黑市摊位",
     "description": "你在城市的黑市租了一个小摊位。卖一些人类不屑一顾但矮人愿意买的东西。",
     "minAge": 14, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("mny", 2), MA("chr", 1)], "include": ""},
    {"id": "goblin_rat_race", "title": "洞鼠竞速",
     "description": "哥布林部落间的洞鼠竞速大赛！你骑着你的洞鼠冲在最前面——至少在摔下来之前。",
     "minAge": 14, "maxAge": 20, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "玩命冲刺", "effects": [MA("str", 1)], "diceCheck": {"attribute": "luk", "dc": 8, "successEffects": [MA("chr", 2), MA("mny", 1)], "failEffects": [MHP(-1)]}},
         {"label": "中途改走捷径", "effects": [MA("int", 2), MA("luk", 1)]}
     ]},
    {"id": "goblin_alchemy_accident", "title": "炼金事故",
     "description": "你在调配药剂时搞错了比例。爆炸把你的半张脸染成了紫色，但你发现了一种新配方。",
     "minAge": 14, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("int", 2), MHP(-1)], "include": ""},
    {"id": "goblin_first_boss_fight", "title": "挑战头领",
     "description": "你觉得现在的部落头领太无能了。按照哥布林的规矩，想上位就得打一架。",
     "minAge": 16, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "attribute.str >= 10",
     "branches": [
         {"label": "正面挑战", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 11, "successEffects": [MA("chr", 3), SF("tribal_leader")], "failEffects": [MHP(-3)]}},
         {"label": "用阴谋让他下台", "effects": [MA("int", 2), MA("chr", 1)]}
     ]},
    {"id": "goblin_human_language", "title": "学会人类语言",
     "description": "你花了大半年的时间偷听人类说话，终于能说一口蹩脚但能听懂的人类语了。",
     "minAge": 14, "maxAge": 22, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2), MA("chr", 1)], "include": ""},
]

# ======================================================================
# 哥布林 — 成年追加 (adult)
# ======================================================================
goblin_adult_v4 = [
    {"id": "goblin_tavern_brawl", "title": "酒馆遭遇战",
     "description": "你在人类酒馆里被醉汉挑衅。对方喊着'死哥布林'冲了上来。",
     "minAge": 16, "maxAge": 30, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "用酒瓶反击", "effects": [MA("str", 2)], "diceCheck": {"attribute": "luk", "dc": 8, "successEffects": [MA("chr", 1)], "failEffects": [MHP(-2)]}},
         {"label": "灵活闪避然后跑路", "effects": [MA("str", 1), MA("int", 1)]},
         {"label": "用言语化解", "effects": [MA("chr", 2), MA("int", 1)]}
     ]},
    {"id": "goblin_poison_master", "title": "毒药大师",
     "description": "你对各种毒物的理解已经出神入化。从麻痹毒到催眠剂，你的药柜里应有尽有。",
     "minAge": 18, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("int", 3)], "include": "attribute.int >= 14"},
    {"id": "goblin_rescue_mission", "title": "营救同胞",
     "description": "一群同胞被人类奴隶贩子抓走了。你组织了一次大胆的营救行动。",
     "minAge": 16, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "major", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "正面突袭", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 10, "successEffects": [MA("chr", 3), SF("brave")], "failEffects": [MHP(-4)]}},
         {"label": "潜入解救", "effects": [MA("int", 2), MA("luk", 1)]},
         {"label": "重金赎回", "effects": [MA("mny", -3), MA("chr", 2)]}
     ]},
    {"id": "goblin_junkyard_palace", "title": "废品宫殿",
     "description": "你用十年的收藏在废品堆里建造了一座了不起的'宫殿'。五颜六色的玻璃窗在阳光下闪闪发光。",
     "minAge": 18, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 2), MA("int", 1), SF("homeowner")], "include": ""},
    {"id": "goblin_cooking_contest", "title": "烹饪大赛",
     "description": "哥布林部落间的年度烹饪大赛。你的秘制蘑菇炖鼠肉……让评委表情复杂。",
     "minAge": 16, "maxAge": 30, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "坚持传统口味", "effects": [MA("spr", 1), MA("chr", 1)]},
         {"label": "融合人类料理技巧", "effects": [MA("int", 2), MA("chr", 1)]},
         {"label": "放很多辣椒", "effects": [MA("luk", 2)]}
     ]},
    {"id": "goblin_mine_discovery", "title": "矿脉发现",
     "description": "你在挖掘隧道时意外发现了一条矿脉。虽然不是金矿，但铁矿也够你大赚一笔了。",
     "minAge": 18, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "exploration", "routes": ["*"],
     "effects": [MA("mny", 3), MA("luk", 1)], "include": ""},
]

# ======================================================================
# 哥布林 — 中年/老年追加
# ======================================================================
goblin_middle_v4 = [
    {"id": "goblin_chief_council", "title": "首领议事会",
     "description": "多个哥布林部落的首领聚在一起商讨大事。你作为资深长辈被邀请参议。",
     "minAge": 22, "maxAge": 35, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2), MA("int", 1)], "include": ""},
    {"id": "goblin_trade_alliance", "title": "贸易联盟",
     "description": "你提议几个哥布林部落联合起来做生意，形成一个贸易联盟。大家犹豫了很久才同意。",
     "minAge": 22, "maxAge": 35, "weight": 2, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2), MA("mny", 2), MA("int", 1)], "include": "attribute.chr >= 12"},
    {"id": "goblin_passing_the_torch", "title": "传承手艺",
     "description": "你把自己独创的机关制造技术教给了最聪明的年轻哥布林。希望他能比你走得更远。",
     "minAge": 22, "maxAge": 35, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 2), SF("has_successor")], "include": ""},
]

goblin_elder_v4 = [
    {"id": "goblin_tribal_legend", "title": "部落传说",
     "description": "你的故事已经变成了部落的传说。年轻哥布林在篝火边讲述你的冒险，虽然越传越离谱。",
     "minAge": 30, "maxAge": 40, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 3), MA("spr", 1)], "include": ""},
    {"id": "goblin_mechanical_heart", "title": "机械心脏",
     "description": "你造了一颗发条驱动的机械心脏。虽然它不能真的跳动，但你觉得这是你一生中最完美的作品。",
     "minAge": 28, "maxAge": 40, "weight": 2, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 3), MA("spr", 2)], "include": "attribute.int >= 15"},
    {"id": "goblin_final_feast", "title": "最后的盛宴",
     "description": "你为全部落办了一场盛大的宴会。不是告别，只是想看大家吃得开心的样子。",
     "minAge": 28, "maxAge": 40, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 2), MA("spr", 3)], "include": ""},
]

# ======================================================================
# 出生阶段追加
# ======================================================================
birth_v4 = [
    {"id": "human_noble_birth_v4", "title": "贵族家庭",
     "description": "你出生在一个人类贵族家庭。虽然不是什么大贵族，但比普通人家要体面得多。",
     "minAge": 0, "maxAge": 0, "weight": 2, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("mny", 3), MA("chr", 1), SF("noble_birth")], "include": ""},
    {"id": "human_twin_birth", "title": "双胞胎",
     "description": "你和一个兄弟/姐妹同时降生。从此人生路上多了一个最好的伙伴。",
     "minAge": 0, "maxAge": 0, "weight": 2, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 1)], "include": ""},
    {"id": "elf_ancient_tree_born", "title": "古树之下出生",
     "description": "你在精灵最古老的一棵树下降生。接生的长老说，这棵树在你出生时发出了微光。",
     "minAge": 0, "maxAge": 0, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("mag", 2), MA("spr", 1)], "include": ""},
    {"id": "elf_starfall_birth", "title": "流星之夜降生",
     "description": "你出生的那个夜晚，天空划过了一道壮观的流星。精灵占星师说这是极罕见的吉兆。",
     "minAge": 0, "maxAge": 0, "weight": 1, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("luk", 3), MA("mag", 1)], "include": ""},
    {"id": "goblin_biggest_litter", "title": "最大的一窝",
     "description": "你是六胞胎中最小的一个。在哥布林社会里，多胞胎是力量的象征。",
     "minAge": 0, "maxAge": 0, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 1), MA("luk", 1)], "include": ""},
    {"id": "goblin_trash_heap_born", "title": "垃圾堆里出生",
     "description": "你的母亲在城市垃圾场旁边生下了你。虽然出身卑微，但你的眼睛格外明亮。",
     "minAge": 0, "maxAge": 0, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 1), MA("spr", 1)], "include": ""},
]

# ======================================================================
# 少年追加 (teenager)
# ======================================================================
human_teenager_v4 = [
    {"id": "human_first_crush", "title": "初恋的悸动",
     "description": "你在教堂的唱诗班看到了一个让你心跳加速的人。整个祷告都没听进去。",
     "minAge": 13, "maxAge": 17, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "romance", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 1)], "include": ""},
    {"id": "human_barn_fire", "title": "谷仓失火",
     "description": "邻居的谷仓着火了！你和其他年轻人一起提桶救火，忙了一整夜。",
     "minAge": 12, "maxAge": 17, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "disaster", "routes": ["*"],
     "effects": [MA("str", 2), MA("chr", 1)], "include": ""},
]

elf_teenager_v4 = [
    {"id": "elf_ancient_library", "title": "远古图书馆",
     "description": "第一次被允许进入精灵的远古图书馆。数万年的知识结晶就在你的眼前。",
     "minAge": 12, "maxAge": 20, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2), MA("mag", 1)], "include": ""},
    {"id": "elf_forest_fire_rescue", "title": "森林火灾救援",
     "description": "一场雷电引发的山火正在逼近精灵领地。所有能动的精灵都被派去用水系魔法灭火。",
     "minAge": 14, "maxAge": 20, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "disaster", "routes": ["*"],
     "effects": [MA("mag", 1), MA("str", 1), MA("spr", 1)], "include": ""},
]

goblin_teenager_v4 = [
    {"id": "goblin_shiny_obsession", "title": "闪亮物执念",
     "description": "你看到了一块嵌在人类城墙上的宝石。虽然知道去挖可能会被抓，但……实在太闪了。",
     "minAge": 10, "maxAge": 16, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "趁夜去挖", "effects": [MA("luk", 1)], "diceCheck": {"attribute": "luk", "dc": 9, "successEffects": [MA("mny", 3)], "failEffects": [MHP(-2)]}},
         {"label": "忍住了", "effects": [MA("spr", 2)]}
     ]},
    {"id": "goblin_wrestling_match", "title": "摔跤比赛",
     "description": "哥布林少年之间的摔跤比赛。规则很简单——把对方摔倒就赢。没有不允许的招数。",
     "minAge": 10, "maxAge": 16, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [MA("str", 2)], "include": ""},
]

# ======================================================================
# 注入
# ======================================================================
print("=== 种族专属事件扩充 v4 ===\n")
total = 0

pairs = [
    ("birth.json", birth_v4),
    ("childhood.json", []),  # 童年已够均衡，不加
    ("teenager.json", human_teenager_v4 + elf_teenager_v4 + goblin_teenager_v4),
    ("youth.json", human_youth_v4 + elf_youth_v4 + goblin_youth_v4),
    ("adult.json", human_adult_v4 + elf_adult_v4 + goblin_adult_v4),
    ("middle-age.json", human_middle_v4 + elf_middle_v4 + goblin_middle_v4),
    ("elder.json", human_elder_v4 + elf_elder_v4 + goblin_elder_v4),
]

for fn, evts in pairs:
    if not evts: continue
    n = inject(fn, evts)
    total += n
    print(f"  {fn}: +{n}")

print(f"\n总计新增: {total}")

# 最终统计
print("\n=== 最终统计 ===")
grand = 0
rc = {"human":0,"elf":0,"goblin":0}
for fn in sorted(os.listdir(EVENT_DIR)):
    if not fn.endswith(".json"): continue
    evts = load(fn)
    grand += len(evts)
    r = {"human":0,"elf":0,"goblin":0}
    for e in evts:
        for race in (e.get("races") or []):
            if race in r: r[race] += 1
            if race in rc: rc[race] += 1
    gen = len(evts) - r["human"] - r["elf"] - r["goblin"]
    print(f"  {fn:20s}: {len(evts):3d}总 | 人:{r['human']:2d} 精:{r['elf']:2d} 哥:{r['goblin']:2d} 通:{gen:2d}")
spec = rc["human"]+rc["elf"]+rc["goblin"]
print(f"\n  总计: {grand}")
print(f"  种族专属: {spec} (人类:{rc['human']} 精灵:{rc['elf']} 哥布林:{rc['goblin']})")
print(f"  通用: {grand - spec}")
print(f"  种族专属占比: {spec/grand*100:.1f}%")
