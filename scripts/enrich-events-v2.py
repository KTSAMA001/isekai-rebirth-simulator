#!/usr/bin/env python3
"""
事件池大规模扩充 v2
目标：从 ~309 扩充到 ~500+ 事件
重点补充：
1. 种族专属出生事件
2. 各年龄段通用事件（带条件门槛）
3. 种族专属事件（补齐空缺阶段）
4. 职业路线事件
5. 随机奇遇事件
6. 性别相关事件
"""
import json, os, glob

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

def MA(target, val):
    return {"type": "modify_attribute", "target": target, "value": val}

def SF(flag):
    return {"type": "set_flag", "target": flag}

def MHP(val):
    return {"type": "modify_hp", "target": "hp", "value": val}

# =============================================
# 1. 出生事件扩充
# =============================================
birth_events = [
    # 种族专属出生
    {
        "id": "birth_human_farm", "title": "农家子弟",
        "description": "你出生在一个普通的人类农庄。黎明时分，公鸡的啼叫声伴随着你的第一声啼哭。父亲正在田间劳作，母亲在邻居的帮助下生下了你。",
        "minAge": 0, "maxAge": 0, "weight": 8, "unique": True, "races": ["human"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 1), MA("spr", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_human_merchant", "title": "商人之家",
        "description": "你出生在城镇最繁华的商业街上。你父亲经营着一间杂货铺，从你第一天起就闻着香料和木材的气味长大。",
        "minAge": 0, "maxAge": 0, "weight": 6, "unique": True, "races": ["human"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("mny", 2), MA("chr", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_human_soldier", "title": "军人之后",
        "description": "你的父亲是王国边境军团的一名老兵。你在兵营旁的简陋住所中降生，第一个听到的声音是号角。",
        "minAge": 0, "maxAge": 0, "weight": 5, "unique": True, "races": ["human"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 2)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_elf_starfall", "title": "星陨之夜",
        "description": "你出生在一场罕见的流星雨之夜。精灵长老们认为这是星辰庇佑的征兆，你被赋予了一个包含'星光'之意的古精灵名字。",
        "minAge": 0, "maxAge": 0, "weight": 5, "unique": True, "races": ["elf"],
        "priority": "major", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", 2), MA("luk", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_elf_forest_edge", "title": "林缘之子",
        "description": "你出生在精灵领地的边境，这里是古森林与人类世界的交界。你的家族是精灵中少有的与人类保持交流的一支。",
        "minAge": 0, "maxAge": 0, "weight": 7, "unique": True, "races": ["elf"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("chr", 2), MA("int", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_elf_worldtree", "title": "世界树下",
        "description": "你出生在世界树根须环绕的圣地。新生儿浸润在世界树的魔力之中，据说这里出生的精灵天生与自然有更深的联结。",
        "minAge": 0, "maxAge": 0, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "major", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", 2), MA("spr", 2)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_elf_craftsman", "title": "工匠之家",
        "description": "你出生在精灵工匠世家。家中摆满了精美的月银饰品和魔法器具，你的家族世代为精灵王室制作礼仪用品。",
        "minAge": 0, "maxAge": 0, "weight": 6, "unique": True, "races": ["elf"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 2), MA("mny", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_goblin_sewer", "title": "下水道新生",
        "description": "你出生在人类城市的下水道里。这里潮湿阴暗，但对哥布林来说已经是不错的住所。你的母亲一边觅食一边照顾你。",
        "minAge": 0, "maxAge": 0, "weight": 8, "unique": True, "races": ["goblin"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 1), MA("luk", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_goblin_tribe", "title": "部落之子",
        "description": "你出生在荒野中的哥布林部落。篝火映照着用兽骨搭成的帐篷，族长用一块黑石在你额头上画了一个记号。",
        "minAge": 0, "maxAge": 0, "weight": 7, "unique": True, "races": ["goblin"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 2)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_goblin_merchant", "title": "黑市世家",
        "description": "你出生在一个经营地下交易的哥布林家族。你的父母虽是哥布林，却靠着精明的头脑积累了令人意外的财富。",
        "minAge": 0, "maxAge": 0, "weight": 5, "unique": True, "races": ["goblin"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("mny", 2), MA("int", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_goblin_wild", "title": "荒野遗孤",
        "description": "你不知道自己的父母是谁。最早的记忆是独自蜷缩在一个树洞里，靠啃树根和抓虫子存活。",
        "minAge": 0, "maxAge": 0, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 2), MA("luk", 1)],
        "include": "", "raceVariants": {}
    },
    # 通用出生事件补充
    {
        "id": "birth_twins", "title": "双生子",
        "description": "你并非独自来到这个世界——你有一个双胞胎。从出生起，你们就注定要分享一切。",
        "minAge": 0, "maxAge": 0, "weight": 3, "unique": True,
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("chr", 1), MA("spr", 1)],
        "include": "", "raceVariants": {
            "elf": {"description": "你和你的双胞胎姐妹/兄弟在同一棵银杏树下降生。精灵双胞胎极为罕见，长老们视为吉兆。"},
            "goblin": {"description": "你和你的双胞胎在洞穴里抢着出生。哥布林双胞胎通常会从小就开始竞争——谁先抢到食物谁就多吃一口。"}
        }
    },
    {
        "id": "birth_storm", "title": "暴风夜",
        "description": "你出生在一场罕见的暴风雨之夜。雷声与你的啼哭声交织在一起，仿佛天地都在为你的降生震动。",
        "minAge": 0, "maxAge": 0, "weight": 4, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 1), MA("mag", 1)],
        "include": "", "raceVariants": {}
    },
    {
        "id": "birth_eclipse", "title": "日蚀之日",
        "description": "日蚀之日出生的孩子，据说会拥有不同寻常的命运。产婆看到天空变暗时，倒吸了一口冷气。",
        "minAge": 0, "maxAge": 0, "weight": 2, "unique": True,
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", 2), MA("luk", 1)],
        "include": "", "raceVariants": {}
    },
]

# =============================================
# 2. 童年事件补充
# =============================================
childhood_events = [
    # 通用童年
    {
        "id": "child_lost_in_woods", "title": "迷路",
        "description": "你在林子里玩耍时迷了路。太阳下山了，四周一片漆黑，你只能靠直觉摸索方向。",
        "minAge": 4, "maxAge": 8, "weight": 4, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "跟着星星走", "effects": [MA("int", 2)]},
            {"label": "大声呼救", "effects": [MA("chr", 1), MA("spr", 1)]},
            {"label": "找个树洞躲到天亮", "effects": [MA("str", 1), MA("luk", 1)]}
        ]
    },
    {
        "id": "child_stray_animal", "title": "收养流浪动物",
        "description": "你在路边发现了一只受伤的小动物。它用怯生生的眼神看着你。",
        "minAge": 4, "maxAge": 9, "weight": 4, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "带回家照顾", "effects": [MA("chr", 1), MA("spr", 2), SF("has_pet")]},
            {"label": "给它食物后离开", "effects": [MA("spr", 1)]}
        ],
        "raceVariants": {
            "elf": {"description": "你在林间发现了一只受伤的月银蝶。它翅膀上发出微弱的光芒，正在慢慢熄灭。"},
            "goblin": {"description": "你发现了一只被陷阱夹住腿的洞鼠。它拼命挣扎，向你发出求救般的吱吱声。"}
        }
    },
    {
        "id": "child_first_fight", "title": "第一次打架",
        "description": "有个比你大的孩子抢走了你的东西，你决定要不要还手。",
        "minAge": 5, "maxAge": 10, "weight": 5, "unique": True,
        "priority": "minor", "tag": "combat", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "挥拳反击", "effects": [MA("str", 2), SF("fighter_spirit")]},
            {"label": "忍住，找大人告状", "effects": [MA("int", 1), MA("chr", 1)]},
            {"label": "用技巧躲避", "effects": [MA("luk", 2)]}
        ]
    },
    {
        "id": "child_dream_flying", "title": "会飞的梦",
        "description": "你做了一个奇异的梦——你在云层之上飞翔，看到了壮丽的大地。醒来后，你总觉得那不只是梦。",
        "minAge": 3, "maxAge": 8, "weight": 3, "unique": True,
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", 1), MA("spr", 1)],
        "include": ""
    },
    {
        "id": "child_river_adventure", "title": "河边探险",
        "description": "你和小伙伴偷偷跑到河边玩耍，发现了一个隐藏的小瀑布和一片秘密花园。",
        "minAge": 5, "maxAge": 10, "weight": 4, "unique": True,
        "priority": "minor", "tag": "exploration", "routes": ["*"],
        "effects": [MA("str", 1)],
        "include": "",
        "branches": [
            {"label": "探索瀑布后面的洞穴", "effects": [MA("int", 1), MA("str", 1)]},
            {"label": "在花园里采集花草", "effects": [MA("spr", 1), MA("chr", 1)]}
        ]
    },
    {
        "id": "child_night_sky", "title": "仰望星空",
        "description": "某个夜晚你独自爬上屋顶，看到了此生最美的星空。一颗流星划过天际。",
        "minAge": 5, "maxAge": 10, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2), MA("int", 1)],
        "include": ""
    },
    {
        "id": "child_cooking_adventure", "title": "第一次做饭",
        "description": "你决定给家人做一顿饭。过程手忙脚乱，但结果……",
        "minAge": 6, "maxAge": 10, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "认真按步骤来", "effects": [MA("int", 1), MA("chr", 1)]},
            {"label": "随便乱搞创新菜", "effects": [MA("luk", 2)]}
        ]
    },
    # 种族童年补充
    {
        "id": "human_church_school", "title": "教会学堂",
        "description": "人类城镇的孩子大多在教会开办的学堂启蒙。你学会了读写和基本的算术。",
        "minAge": 6, "maxAge": 10, "weight": 5, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "childhood", "routes": ["*"],
        "effects": [MA("int", 2)],
        "include": ""
    },
    {
        "id": "human_harvest_help", "title": "帮忙收割",
        "description": "秋收时节，每个人类孩子都要下地帮忙。虽然辛苦，但丰收的喜悦是实实在在的。",
        "minAge": 5, "maxAge": 10, "weight": 4, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 1), MA("spr", 1)],
        "include": ""
    },
    {
        "id": "elf_butterfly_dance", "title": "蝶舞课堂",
        "description": "精灵孩子通过模仿蝴蝶的飞舞来学习身体的协调与优雅。你的动作意外地灵活。",
        "minAge": 4, "maxAge": 8, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "childhood", "routes": ["*"],
        "effects": [MA("chr", 2), MA("str", 1)],
        "include": ""
    },
    {
        "id": "elf_seed_planting", "title": "种下第一棵树",
        "description": "精灵的传统——每个孩子都要亲手种下一棵树苗，并在此后的漫长岁月中看着它长大。",
        "minAge": 5, "maxAge": 8, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2)],
        "include": ""
    },
    {
        "id": "goblin_cave_painting", "title": "洞穴壁画",
        "description": "你用石头和泥巴在洞穴墙壁上涂鸦。画的是你见过的怪兽和闪亮的宝物。其他小哥布林都来围观。",
        "minAge": 3, "maxAge": 7, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "childhood", "routes": ["*"],
        "effects": [MA("int", 1), MA("chr", 1)],
        "include": ""
    },
    {
        "id": "goblin_insect_feast", "title": "虫虫大餐",
        "description": "你发现了一窝肥美的甲虫幼虫。对哥布林来说，这可是难得的美味佳肴！",
        "minAge": 3, "maxAge": 8, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("str", 1), MA("luk", 1)],
        "include": ""
    },
]

# =============================================
# 3. 少年事件补充
# =============================================
teenager_events = [
    # 通用
    {
        "id": "teen_first_adventure", "title": "人生第一次冒险",
        "description": "你独自离开家，踏上了一段短途旅行。目的地不远，但对你来说这是巨大的一步。",
        "minAge": 12, "maxAge": 16, "weight": 4, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [MA("str", 1)],
        "include": "",
        "branches": [
            {"label": "去探索据说闹鬼的废墟", "effects": [MA("str", 2), MA("int", 1)]},
            {"label": "去邻镇的集市逛逛", "effects": [MA("chr", 1), MA("mny", 1)]},
            {"label": "去山上看日出", "effects": [MA("spr", 2)]}
        ]
    },
    {
        "id": "teen_mentor_meeting", "title": "遇见师傅",
        "description": "一位经验丰富的旅人注意到了你的潜力，愿意花些时间指点你。",
        "minAge": 13, "maxAge": 17, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "学习剑技", "effects": [MA("str", 3)]},
            {"label": "学习魔法基础", "effects": [MA("mag", 3)]},
            {"label": "学习经商之道", "effects": [MA("int", 1), MA("mny", 2)]},
            {"label": "学习生存技巧", "effects": [MA("luk", 2), MA("str", 1)]}
        ]
    },
    {
        "id": "teen_secret_discovered", "title": "发现秘密",
        "description": "你无意中发现了一个不该知道的秘密——镇长一直在私吞救济金。",
        "minAge": 13, "maxAge": 17, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "公开揭发", "effects": [MA("chr", 2), MA("spr", 1), SF("justice_lover")]},
            {"label": "当作没看到", "effects": [MA("int", 1)]},
            {"label": "私下找镇长谈条件", "effects": [MA("mny", 3), MA("int", 1)]}
        ]
    },
    {
        "id": "teen_library_discovery", "title": "图书馆的秘密阁楼",
        "description": "你在图书馆发现了一个隐藏的阁楼，里面放满了古旧的书。",
        "minAge": 11, "maxAge": 16, "weight": 3, "unique": True,
        "priority": "minor", "tag": "exploration", "routes": ["*"],
        "effects": [MA("int", 2)],
        "include": "",
        "branches": [
            {"label": "沉浸在故事中", "effects": [MA("int", 1), MA("spr", 1)]},
            {"label": "研究魔法相关的记载", "effects": [MA("mag", 2)]}
        ]
    },
    {
        "id": "teen_race_competition", "title": "少年竞技会",
        "description": "镇上举办了少年竞技比赛。跑步、射箭、猜谜，你全都想参加。",
        "minAge": 12, "maxAge": 16, "weight": 4, "unique": True,
        "priority": "minor", "tag": "combat", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "参加跑步", "effects": [MA("str", 2)]},
            {"label": "参加射箭", "effects": [MA("int", 1), MA("str", 1)]},
            {"label": "参加猜谜", "effects": [MA("int", 2)]},
            {"label": "参加全能", "effects": [MA("str", 1), MA("int", 1), MA("luk", 1)]}
        ]
    },
    {
        "id": "teen_nightmare", "title": "反复出现的噩梦",
        "description": "最近你总是做同一个噩梦——一片黑暗中有什么东西在呼唤你。",
        "minAge": 12, "maxAge": 17, "weight": 3, "unique": True,
        "priority": "minor", "tag": "dark", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "在梦中回应那个声音", "effects": [MA("mag", 2), MA("spr", -1)]},
            {"label": "强迫自己清醒", "effects": [MA("spr", 2)]},
            {"label": "把梦境内容记录下来", "effects": [MA("int", 2)]}
        ]
    },
    {
        "id": "teen_traveling_circus", "title": "流浪马戏团",
        "description": "一个色彩缤纷的马戏团来到了镇上。杂技演员、魔术师和异域舞者让你大开眼界。",
        "minAge": 10, "maxAge": 15, "weight": 4, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 1)],
        "include": "",
        "branches": [
            {"label": "偷偷学杂技", "effects": [MA("str", 1), MA("chr", 1)]},
            {"label": "缠着魔术师学戏法", "effects": [MA("mag", 1), MA("int", 1)]},
            {"label": "帮忙搬道具赚零花钱", "effects": [MA("mny", 2)]}
        ]
    },
    # 种族少年补充
    {
        "id": "human_first_job", "title": "第一份工作",
        "description": "到了该打工的年纪了。人类社会对半大小子有很多活可以干。",
        "minAge": 12, "maxAge": 16, "weight": 4, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "在铁匠铺当学徒", "effects": [MA("str", 2), SF("smith_apprentice")]},
            {"label": "在商铺帮忙记账", "effects": [MA("int", 1), MA("mny", 2)]},
            {"label": "给冒险者工会跑腿", "effects": [MA("str", 1), MA("chr", 1)]}
        ]
    },
    {
        "id": "human_bully_defense", "title": "保护弱小",
        "description": "你看到几个大孩子在欺负一个小孩。在人类社会，这种事经常发生。",
        "minAge": 11, "maxAge": 15, "weight": 3, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "挺身而出", "effects": [MA("str", 1), MA("chr", 2), SF("brave")]},
            {"label": "叫大人来处理", "effects": [MA("int", 1)]}
        ]
    },
    {
        "id": "elf_spirit_animal", "title": "灵魂伙伴",
        "description": "精灵少年在成长过程中有时会与一只灵兽建立心灵联结。一只银色的狐狸在你面前现身了。",
        "minAge": 12, "maxAge": 18, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [MA("spr", 1)],
        "include": "",
        "branches": [
            {"label": "伸出手触摸它", "effects": [MA("spr", 2), MA("mag", 1), SF("spirit_companion")]},
            {"label": "静静对视", "effects": [MA("int", 2), MA("spr", 1)]}
        ]
    },
    {
        "id": "elf_dream_walker", "title": "梦境行走",
        "description": "你第一次成功在梦中保持了清醒。精灵的梦境行走术——一种只有少数精灵掌握的能力。",
        "minAge": 14, "maxAge": 20, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", 2), MA("spr", 1)],
        "include": "attribute.mag >= 8"
    },
    {
        "id": "goblin_trap_master", "title": "陷阱大师",
        "description": "你设计了一套复杂的陷阱系统来保护部落的食物储藏室。效果出奇地好。",
        "minAge": 10, "maxAge": 15, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 2), MA("str", 1)],
        "include": ""
    },
    {
        "id": "goblin_human_language", "title": "偷学人类语言",
        "description": "你躲在人类城镇的围墙外偷听对话，慢慢学会了人类的语言。这在哥布林中极为罕见。",
        "minAge": 10, "maxAge": 15, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 3), MA("chr", 1)],
        "include": ""
    },
]

# =============================================
# 4. 青年事件补充
# =============================================
youth_events = [
    # 通用
    {
        "id": "youth_dungeon_first", "title": "第一次进入地下城",
        "description": "你终于有了足够的实力踏入传说中的地下城。阴暗的入口散发着潮湿和腐朽的气味。",
        "minAge": 16, "maxAge": 24, "weight": 4, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "attribute.str >= 10 | attribute.mag >= 10",
        "branches": [
            {"label": "小心翼翼地推进", "effects": [MA("int", 2), MA("str", 1), SF("dungeon_first")]},
            {"label": "大胆冲锋", "effects": [MA("str", 3), SF("dungeon_first")]},
            {"label": "在入口研究机关", "effects": [MA("int", 3), SF("dungeon_first")]}
        ]
    },
    {
        "id": "youth_first_love", "title": "怦然心动",
        "description": "你在某个平凡的日子，遇到了让你心跳加速的那个人。",
        "minAge": 16, "maxAge": 23, "weight": 5, "unique": True,
        "priority": "minor", "tag": "romance", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "鼓起勇气搭话", "effects": [MA("chr", 2), SF("first_love")]},
            {"label": "默默关注", "effects": [MA("spr", 2)]},
            {"label": "写一封匿名信", "effects": [MA("int", 1), MA("chr", 1)]}
        ],
        "raceVariants": {
            "elf": {"description": "在月光花田中，你第一次注意到那个精灵。数百年的生命中，这一刻你永远不会忘记。"},
            "goblin": {"description": "对方是你在黑市认识的。虽然哥布林不太讲究浪漫，但你的心跳确实快了几拍。"}
        }
    },
    {
        "id": "youth_caravan_guard", "title": "商队护卫",
        "description": "一支商队在招募护卫。虽然报酬不高，但可以免费跟着旅行。",
        "minAge": 17, "maxAge": 24, "weight": 4, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "attribute.str >= 8",
        "branches": [
            {"label": "报名参加", "effects": [MA("str", 2), MA("mny", 2), MA("chr", 1)]},
            {"label": "不去，太危险了", "effects": [MA("spr", 1)]}
        ]
    },
    {
        "id": "youth_crisis_crossroad", "title": "命运的十字路口",
        "description": "你站在人生的十字路口。是时候决定今后的方向了。",
        "minAge": 18, "maxAge": 24, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "踏上冒险旅途", "effects": [MA("str", 2), MA("luk", 1)]},
            {"label": "拜师学艺", "effects": [MA("int", 2), MA("mag", 1)]},
            {"label": "开始经商", "effects": [MA("mny", 2), MA("chr", 1)]},
            {"label": "参军报国", "effects": [MA("str", 2), MA("spr", 1)]}
        ]
    },
    {
        "id": "youth_tavern_rumor", "title": "酒馆传闻",
        "description": "酒馆里有人在讨论一个刺激的消息。",
        "minAge": 18, "maxAge": 24, "weight": 4, "unique": False,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "凑过去听", "effects": [MA("int", 1)]},
            {"label": "请对方喝一杯套话", "effects": [MA("chr", 1), MA("mny", -1)]},
            {"label": "不关自己的事", "effects": [MA("spr", 1)]}
        ]
    },
    {
        "id": "youth_bandit_ambush", "title": "路遇山贼",
        "description": "你在旅途中遭遇了一伙山贼的伏击。对方有四五个人，凶神恶煞。",
        "minAge": 17, "maxAge": 24, "weight": 3, "unique": True,
        "priority": "minor", "tag": "combat", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "战斗！", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 10, "successEffects": [MA("str", 1), MA("chr", 1)], "failEffects": [MHP(-3)]}},
            {"label": "交出财物保命", "effects": [MA("mny", -3)]},
            {"label": "施展魔法吓退他们", "effects": [MA("mag", 1)], "diceCheck": {"attribute": "mag", "dc": 10, "successEffects": [MA("mag", 2)], "failEffects": [MHP(-2)]}}
        ]
    },
    {
        "id": "youth_mysterious_stranger", "title": "神秘旅人",
        "description": "一个蒙面旅人在路边向你提出了一个奇怪的请求。",
        "minAge": 17, "maxAge": 24, "weight": 3, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "帮助他", "effects": [MA("chr", 1), MA("luk", 2), SF("mysterious_encounter")]},
            {"label": "谨慎地拒绝", "effects": [MA("int", 1)]}
        ]
    },
    {
        "id": "youth_gambling_den", "title": "赌场诱惑",
        "description": "你被朋友带到了一家地下赌场。灯光昏暗，空气中弥漫着硬币的金属气息。",
        "minAge": 18, "maxAge": 24, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "小赌怡情", "effects": [MA("luk", 1)], "diceCheck": {"attribute": "luk", "dc": 8, "successEffects": [MA("mny", 3)], "failEffects": [MA("mny", -2)]}},
            {"label": "观察赌局找规律", "effects": [MA("int", 2)]},
            {"label": "转头就走", "effects": [MA("spr", 1)]}
        ]
    },
    # 种族青年
    {
        "id": "elf_first_century", "title": "第一个百年",
        "description": "对精灵来说，第一个百年只是童年的延续。但你已经开始思考——漫长的生命到底应该如何度过？",
        "minAge": 18, "maxAge": 24, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2), MA("int", 1)],
        "include": ""
    },
    {
        "id": "elf_crystal_weaving", "title": "水晶织法",
        "description": "精灵的传统工艺——用魔力将水晶拉丝成线，编织成轻薄如蝉翼的防护衣。你第一次尝试。",
        "minAge": 18, "maxAge": 24, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "专心编织", "effects": [MA("mag", 2), MA("int", 1)]},
            {"label": "融入自己的创意", "effects": [MA("chr", 1), MA("mag", 1), MA("int", 1)]}
        ]
    },
    {
        "id": "goblin_scrap_invention", "title": "废品发明",
        "description": "你用人类丢弃的废品造了一辆简陋的运货车。虽然嘎吱作响，但确实能用！",
        "minAge": 14, "maxAge": 20, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 2), MA("mny", 1)],
        "include": ""
    },
    {
        "id": "goblin_alliance", "title": "异族联盟",
        "description": "你遇到一个不歧视哥布林的人类冒险者。也许哥布林不必永远活在社会底层？",
        "minAge": 14, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "建立友谊", "effects": [MA("chr", 2), MA("spr", 1), SF("has_ally")]},
            {"label": "保持警惕", "effects": [MA("int", 2)]}
        ]
    },
    {
        "id": "human_conscription", "title": "征兵通告",
        "description": "王国边境出现了魔兽潮，各城镇张贴了征兵布告。",
        "minAge": 17, "maxAge": 24, "weight": 4, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "combat", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "报名参军", "effects": [MA("str", 3), SF("military_service")]},
            {"label": "加入冒险者工会应对", "effects": [MA("str", 1), MA("chr", 1), SF("guild_member")]},
            {"label": "逃避征召", "effects": [MA("luk", 2)]}
        ]
    },
    {
        "id": "human_market_stall", "title": "市场摆摊",
        "description": "你攒了些钱和货物，决定在集市上租个摊位试试运气。",
        "minAge": 17, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "卖自己做的手工品", "effects": [MA("mny", 2), MA("int", 1)]},
            {"label": "低买高卖赚差价", "effects": [MA("mny", 3)], "diceCheck": {"attribute": "int", "dc": 8, "successEffects": [MA("mny", 2)], "failEffects": [MA("mny", -2)]}},
            {"label": "帮别人吆喝赚佣金", "effects": [MA("chr", 2), MA("mny", 1)]}
        ]
    },
]

# =============================================
# 5. 成年事件补充
# =============================================
adult_events = [
    # 通用（带条件）
    {
        "id": "adult_guild_promotion", "title": "工会晋升",
        "description": "凭借你的实力和声望，冒险者工会提议让你担任更高级别的职位。",
        "minAge": 25, "maxAge": 40, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "has.flag.guild_member",
        "branches": [
            {"label": "接受晋升", "effects": [MA("chr", 2), MA("mny", 2)]},
            {"label": "拒绝，留在一线", "effects": [MA("str", 2)]}
        ]
    },
    {
        "id": "adult_haunted_mansion", "title": "闹鬼庄园",
        "description": "委托人请你调查一座据说闹鬼的庄园。在月光下，那座古老的建筑看起来确实不祥。",
        "minAge": 25, "maxAge": 45, "weight": 3, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "attribute.str >= 12 | attribute.mag >= 12",
        "branches": [
            {"label": "带武器硬闯", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 12, "successEffects": [MA("mny", 3)], "failEffects": [MHP(-4)]}},
            {"label": "用魔法感知", "effects": [MA("mag", 2), MA("int", 1)]},
            {"label": "白天去调查", "effects": [MA("int", 2)]}
        ]
    },
    {
        "id": "adult_teaching_offer", "title": "教学邀请",
        "description": "一所学院邀请你担任客座教师。你的经验足以教导年轻一代。",
        "minAge": 28, "maxAge": 45, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.int >= 18 | attribute.mag >= 20 | attribute.str >= 22",
        "branches": [
            {"label": "欣然接受", "effects": [MA("chr", 2), MA("int", 1), SF("has_student")]},
            {"label": "只收一个徒弟", "effects": [MA("spr", 1), SF("has_student")]},
            {"label": "拒绝，自己还需要提升", "effects": [MA("str", 1), MA("mag", 1)]}
        ]
    },
    {
        "id": "adult_rival_encounter", "title": "宿敌重逢",
        "description": "你在路上遇到了曾经的竞争对手。岁月改变了你们，但那股不服输的劲头还在。",
        "minAge": 25, "maxAge": 45, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "友好地叙旧", "effects": [MA("chr", 2), MA("spr", 1)]},
            {"label": "再比试一场", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 12, "successEffects": [MA("chr", 2)], "failEffects": [MA("spr", 1)]}},
            {"label": "无视对方", "effects": [MA("int", 1)]}
        ]
    },
    {
        "id": "adult_treasure_map", "title": "破旧的藏宝图",
        "description": "你在旧货市场花了一枚铜币买了张泛黄的羊皮纸。仔细一看，竟然是一张藏宝图！",
        "minAge": 25, "maxAge": 40, "weight": 2, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "attribute.luk >= 10",
        "branches": [
            {"label": "组队去寻宝", "effects": [MA("chr", 1), SF("treasure_hunter")], "diceCheck": {"attribute": "luk", "dc": 10, "successEffects": [MA("mny", 5)], "failEffects": [MHP(-2)]}},
            {"label": "把地图高价转卖", "effects": [MA("mny", 3)]},
            {"label": "独自前往", "effects": [MA("str", 1), MA("luk", 1)], "diceCheck": {"attribute": "str", "dc": 12, "successEffects": [MA("mny", 8)], "failEffects": [MHP(-5)]}}
        ]
    },
    {
        "id": "adult_plague_crisis", "title": "瘟疫来袭",
        "description": "一场可怕的瘟疫席卷了附近的城镇。人心惶惶，死者越来越多。",
        "minAge": 25, "maxAge": 50, "weight": 3, "unique": True,
        "priority": "major", "tag": "disaster", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "帮助救治病人", "effects": [MA("spr", 3), MA("chr", 2), SF("healer")]},
            {"label": "研究瘟疫的成因", "effects": [MA("int", 3)]},
            {"label": "逃到安全的地方", "effects": [MA("luk", 1)]}
        ]
    },
    {
        "id": "adult_business_startup", "title": "创业梦想",
        "description": "你有了一个商业点子——看起来能赚大钱，但需要投入全部积蓄。",
        "minAge": 25, "maxAge": 40, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.mny >= 8",
        "branches": [
            {"label": "全力投入", "effects": [MA("mny", -3)], "diceCheck": {"attribute": "int", "dc": 10, "successEffects": [MA("mny", 8), SF("business_owner")], "failEffects": [MA("mny", -5)]}},
            {"label": "找合伙人分摊风险", "effects": [MA("chr", 1)], "diceCheck": {"attribute": "chr", "dc": 8, "successEffects": [MA("mny", 4), SF("business_owner")], "failEffects": [MA("spr", 1)]}},
            {"label": "算了，还是稳妥些", "effects": [MA("spr", 1)]}
        ]
    },
    {
        "id": "adult_dragon_rumor", "title": "龙的踪迹",
        "description": "远方的山脉上发现了龙的踪迹。冒险者公会悬赏重金，但没几个人敢去。",
        "minAge": 28, "maxAge": 45, "weight": 2, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "attribute.str >= 20 | attribute.mag >= 20",
        "branches": [
            {"label": "接下悬赏", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 15, "successEffects": [MA("mny", 10), MA("chr", 3), SF("dragon_defeated")], "failEffects": [MHP(-8), MA("str", 1)]}},
            {"label": "先去调查情报", "effects": [MA("int", 2)]},
            {"label": "这种事让英雄去吧", "effects": [MA("spr", 1)]}
        ]
    },
    # 种族成年
    {
        "id": "human_political_election", "title": "参加镇长选举",
        "description": "人类城镇的镇长选举开始了。你的名望已经足以参选。",
        "minAge": 30, "maxAge": 50, "weight": 3, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.chr >= 15",
        "branches": [
            {"label": "参选", "effects": [MA("chr", 2)], "diceCheck": {"attribute": "chr", "dc": 12, "successEffects": [MA("chr", 3), SF("lord")], "failEffects": [MA("spr", 2)]}},
            {"label": "支持别的候选人", "effects": [MA("chr", 1), MA("int", 1)]}
        ]
    },
    {
        "id": "human_war_veteran_return", "title": "老兵归乡",
        "description": "在军中服役多年后，你终于回到了家乡。一切都变了，但那棵老橡树还在。",
        "minAge": 28, "maxAge": 45, "weight": 3, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2)],
        "include": "has.flag.military_service"
    },
    {
        "id": "elf_diplomatic_mission", "title": "外交使命",
        "description": "精灵长老会派你作为使者前往人类王国进行外交谈判。",
        "minAge": 30, "maxAge": 80, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.chr >= 12",
        "branches": [
            {"label": "以理服人", "effects": [MA("chr", 2), MA("int", 1), SF("diplomat")]},
            {"label": "展示精灵的力量", "effects": [MA("mag", 1), MA("str", 1)]}
        ]
    },
    {
        "id": "elf_forest_corruption", "title": "森林的腐化",
        "description": "古森林的一角开始枯萎腐烂。黑色的毒素正在侵蚀树木。精灵们必须采取行动。",
        "minAge": 30, "maxAge": 100, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "major", "tag": "disaster", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "用净化魔法治疗森林", "effects": [MA("mag", 2), MA("spr", 2), SF("forest_healer")]},
            {"label": "追踪腐化的源头", "effects": [MA("int", 2), MA("str", 1), SF("forest_investigator")]},
            {"label": "上报长老会处理", "effects": [MA("chr", 1)]}
        ]
    },
    {
        "id": "elf_star_song", "title": "星之歌",
        "description": "一种只有极少数精灵能学习的古老歌术。你在某个星空下突然领悟了曲调的奥秘。",
        "minAge": 40, "maxAge": 120, "weight": 2, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", 3), MA("spr", 2), SF("star_song_master")],
        "include": "attribute.mag >= 25 & attribute.spr >= 15"
    },
    {
        "id": "goblin_underground_empire", "title": "地下帝国梦",
        "description": "你开始规划连接多个哥布林部落的地下通道网络。如果成功，哥布林将拥有自己的地下帝国。",
        "minAge": 18, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.int >= 12",
        "branches": [
            {"label": "开始挖掘", "effects": [MA("str", 2), MA("int", 1), SF("pioneer")]},
            {"label": "先说服其他部落支持", "effects": [MA("chr", 3)]},
            {"label": "太异想天开了", "effects": [MA("spr", 1)]}
        ]
    },
    {
        "id": "goblin_human_shop", "title": "混入人类社会",
        "description": "你戴上兜帽伪装成矮人，在人类城镇开了一家修理铺。生意出乎意料地好。",
        "minAge": 16, "maxAge": 28, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.int >= 10",
        "branches": [
            {"label": "继续经营", "effects": [MA("mny", 3), MA("int", 1)]},
            {"label": "暴露身份时坦然面对", "effects": [MA("chr", 2), MA("spr", 2)]},
            {"label": "赚够就跑", "effects": [MA("mny", 4), MA("luk", 1)]}
        ]
    },
    {
        "id": "goblin_potion_brewing", "title": "毒药与良药",
        "description": "你用洞穴里的蘑菇和虫子研制出了一种药水。具体效果嘛……只有试了才知道。",
        "minAge": 16, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "自己先试喝", "effects": [], "diceCheck": {"attribute": "luk", "dc": 8, "successEffects": [MA("mag", 2), MA("str", 1)], "failEffects": [MHP(-3)]}},
            {"label": "拿去黑市卖", "effects": [MA("mny", 3)]},
            {"label": "继续改良配方", "effects": [MA("int", 2), MA("mag", 1)]}
        ]
    },
]

# =============================================
# 6. 中年事件补充
# =============================================
middle_age_events = [
    # 通用
    {
        "id": "mid_old_friend_reunion", "title": "故友重逢",
        "description": "你在一个意想不到的地方遇到了多年未见的老朋友。",
        "minAge": 35, "maxAge": 55, "weight": 4, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 1), MA("spr", 1)],
        "include": "",
        "branches": [
            {"label": "彻夜长谈", "effects": [MA("spr", 2)]},
            {"label": "一起再冒险一次", "effects": [MA("str", 1), MA("luk", 1)]}
        ]
    },
    {
        "id": "mid_life_reflection", "title": "人生回顾",
        "description": "某个安静的夜晚，你独自坐在窗前，回顾这些年走过的路。",
        "minAge": 35, "maxAge": 55, "weight": 4, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2), MA("int", 1)],
        "include": ""
    },
    {
        "id": "mid_natural_disaster", "title": "天灾",
        "description": "一场严重的自然灾害袭击了这片地区。洪水/地震/干旱让人们苦不堪言。",
        "minAge": 30, "maxAge": 60, "weight": 3, "unique": True,
        "priority": "major", "tag": "disaster", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "组织救援", "effects": [MA("chr", 3), MA("spr", 1)]},
            {"label": "捐出积蓄帮助重建", "effects": [MA("mny", -3), MA("spr", 2), SF("philanthropist")]},
            {"label": "保护好自己和家人", "effects": [MA("str", 1)]}
        ]
    },
    {
        "id": "mid_property_acquisition", "title": "置办产业",
        "description": "你有了足够的积蓄，是时候考虑买一间属于自己的房子了。",
        "minAge": 30, "maxAge": 50, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "attribute.mny >= 12",
        "branches": [
            {"label": "买一栋城镇宅邸", "effects": [MA("mny", -5), MA("chr", 2), SF("homeowner")]},
            {"label": "买一块农田", "effects": [MA("mny", -3), MA("str", 1), SF("homeowner")]},
            {"label": "继续攒钱", "effects": [MA("int", 1)]}
        ]
    },
    {
        "id": "mid_mentoring_youth", "title": "指导年轻人",
        "description": "一个充满热情但缺乏经验的年轻人向你请教。你看到了曾经的自己。",
        "minAge": 35, "maxAge": 55, "weight": 4, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "倾囊相授", "effects": [MA("chr", 2), MA("spr", 1), SF("has_student")]},
            {"label": "给几个建议就行", "effects": [MA("int", 1)]},
            {"label": "让他自己去经历", "effects": [MA("spr", 1)]}
        ]
    },
    {
        "id": "mid_health_scare", "title": "健康警报",
        "description": "你突然感到一阵剧烈的胸痛。这是身体在提醒你——你已经不再年轻了。",
        "minAge": 40, "maxAge": 55, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MHP(-2)],
        "include": "",
        "branches": [
            {"label": "去找治疗师", "effects": [MA("spr", 1), MA("mny", -1)]},
            {"label": "开始每天锻炼", "effects": [MA("str", 2)]},
            {"label": "不当回事", "effects": [MA("luk", -1)]}
        ]
    },
    {
        "id": "mid_legacy_project", "title": "留下遗产",
        "description": "你开始思考——你想为这个世界留下什么？",
        "minAge": 40, "maxAge": 60, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "写一本书", "effects": [MA("int", 2), SF("author")]},
            {"label": "建一所学校", "effects": [MA("chr", 2), MA("mny", -4), SF("school_founder")]},
            {"label": "培养继承人", "effects": [MA("chr", 1), MA("spr", 1), SF("has_successor")]},
            {"label": "创建一个基金会", "effects": [MA("mny", -3), MA("chr", 2), SF("philanthropist")]}
        ]
    },
    # 种族中年
    {
        "id": "elf_watching_generations", "title": "看着世代更替",
        "description": "你认识的人类朋友已经是第三代了。他们叫你'奶奶/爷爷'虽然你看起来还很年轻。",
        "minAge": 60, "maxAge": 150, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3)],
        "include": ""
    },
    {
        "id": "elf_magic_research", "title": "魔法论文",
        "description": "你在魔法研究上取得了一个小突破。精灵学院希望你发表一篇论文。",
        "minAge": 50, "maxAge": 200, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [],
        "include": "attribute.mag >= 20",
        "branches": [
            {"label": "发表论文", "effects": [MA("int", 2), MA("chr", 2)]},
            {"label": "继续深入研究", "effects": [MA("mag", 3)]}
        ]
    },
    {
        "id": "elf_tree_grown", "title": "你种的树长大了",
        "description": "童年时种下的那棵小树苗，已经长成了参天大树。你在它的树荫下小憩。",
        "minAge": 50, "maxAge": 200, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3)],
        "include": ""
    },
    {
        "id": "goblin_elder_respect", "title": "受人尊敬的老哥布林",
        "description": "在哥布林社会中，你已经是少有的长寿者。年轻的哥布林开始叫你'老祖宗'。",
        "minAge": 25, "maxAge": 35, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("chr", 2), MA("int", 1)],
        "include": ""
    },
    {
        "id": "goblin_trade_empire", "title": "贸易帝国",
        "description": "从一个拾荒者到如今的地下贸易网络之主。哥布林的商业基因在你身上发挥到了极致。",
        "minAge": 20, "maxAge": 35, "weight": 2, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("mny", 5), MA("chr", 2), SF("goblin_merchant_king")],
        "include": "attribute.mny >= 15 & attribute.int >= 12"
    },
    {
        "id": "goblin_peace_treaty", "title": "和平条约",
        "description": "你代表哥布林部落与附近的人类城镇签订了互不侵犯协议。历史性的时刻。",
        "minAge": 22, "maxAge": 35, "weight": 2, "unique": True, "races": ["goblin"],
        "priority": "major", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.chr >= 12 & attribute.int >= 10",
        "branches": [
            {"label": "以诚意打动对方", "effects": [MA("chr", 3), MA("spr", 2), SF("diplomat")]},
            {"label": "展示哥布林的实力作为筹码", "effects": [MA("str", 1), MA("chr", 2)]}
        ]
    },
    {
        "id": "human_midlife_crisis", "title": "中年危机",
        "description": "你突然对目前的生活感到不满。年轻时的梦想，还有几个实现了？",
        "minAge": 35, "maxAge": 50, "weight": 4, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "重拾年轻时的爱好", "effects": [MA("spr", 2), MA("chr", 1)]},
            {"label": "制定新的人生目标", "effects": [MA("int", 2), MA("str", 1)]},
            {"label": "接受现实，知足常乐", "effects": [MA("spr", 3)]}
        ]
    },
    {
        "id": "human_family_tradition", "title": "传承家族手艺",
        "description": "你决定把家族的手艺传给下一代。这门技术已经传了好几代人了。",
        "minAge": 35, "maxAge": 55, "weight": 3, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 1), MA("chr", 1), SF("family_legacy")],
        "include": ""
    },
]

# =============================================
# 7. 老年事件补充
# =============================================
elder_events = [
    # 通用
    {
        "id": "elder_last_journey", "title": "最后的旅途",
        "description": "你决定在腿脚还能走的时候，再做一次旅行。去看看年轻时想去却没去的地方。",
        "minAge": 55, "maxAge": 75, "weight": 4, "unique": True,
        "priority": "minor", "tag": "adventure", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "去海边看日出", "effects": [MA("spr", 3)]},
            {"label": "重访冒险过的地方", "effects": [MA("spr", 2), MA("str", 1)]},
            {"label": "去从未踏足的远方", "effects": [MA("luk", 2), MA("chr", 1)]}
        ]
    },
    {
        "id": "elder_garden_peace", "title": "花园时光",
        "description": "你拥有了一座小花园。每天浇水、除草、看花开花落，成了最享受的事。",
        "minAge": 55, "maxAge": 80, "weight": 4, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2)],
        "include": ""
    },
    {
        "id": "elder_passing_wisdom", "title": "智者之言",
        "description": "年轻人特地远道而来向你请教。你的人生经历本身就是一部教科书。",
        "minAge": 55, "maxAge": 80, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 2), MA("spr", 1)],
        "include": "attribute.int >= 15 | attribute.mag >= 15 | attribute.str >= 20"
    },
    {
        "id": "elder_old_letters", "title": "旧日书信",
        "description": "整理遗物时，你翻出了一箱泛黄的书信。每一封都承载着一段过去的故事。",
        "minAge": 55, "maxAge": 80, "weight": 4, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2)],
        "include": ""
    },
    {
        "id": "elder_unexpected_visitor", "title": "意外的来访者",
        "description": "一个你已经快忘记的人出现在你家门前。原来你年轻时随手帮过的忙，改变了对方的一生。",
        "minAge": 55, "maxAge": 80, "weight": 3, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("spr", 2), MA("chr", 1)],
        "include": ""
    },
    {
        "id": "elder_dream_fulfilled", "title": "完成心愿",
        "description": "你终于做到了那件一直放在心里的事。尽管来得很晚，但终究没有遗憾。",
        "minAge": 55, "maxAge": 80, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3)],
        "include": ""
    },
    {
        "id": "elder_sunset_watching", "title": "夕阳",
        "description": "你坐在门前看着夕阳慢慢沉入地平线。这个画面你看过无数次，但今天格外美丽。",
        "minAge": 60, "maxAge": 80, "weight": 4, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 2)],
        "include": ""
    },
    {
        "id": "elder_miracle_recovery", "title": "奇迹般的康复",
        "description": "所有人都以为你撑不过这个冬天了，但春天来临时你又精神奕奕地站了起来。",
        "minAge": 60, "maxAge": 80, "weight": 2, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MHP(5), MA("spr", 2)],
        "include": "attribute.luk >= 12"
    },
    {
        "id": "elder_autobiography", "title": "自传",
        "description": "一位作家听说了你传奇的人生故事，想为你写一本传记。",
        "minAge": 55, "maxAge": 80, "weight": 2, "unique": True,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [],
        "include": "attribute.chr >= 15",
        "branches": [
            {"label": "欣然同意", "effects": [MA("chr", 3), SF("famous_author")]},
            {"label": "有些事不想公开", "effects": [MA("spr", 2)]}
        ]
    },
    {
        "id": "elder_final_gift", "title": "最后的礼物",
        "description": "你把自己最珍贵的东西送给了一个你认为最配得上的人。",
        "minAge": 60, "maxAge": 80, "weight": 3, "unique": True,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3), MA("chr", 1)],
        "include": ""
    },
    # 种族老年
    {
        "id": "human_grandchild_story", "title": "给孙辈讲故事",
        "description": "孙子们围坐在你膝边，央求你讲冒险故事。你挑了一段最精彩的经历……当然加了很多夸张。",
        "minAge": 55, "maxAge": 75, "weight": 5, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("chr", 1), MA("spr", 2)],
        "include": ""
    },
    {
        "id": "human_village_elder", "title": "德高望重",
        "description": "你已经是村子里最年长的人了。大家有什么拿不定主意的事都来问你。",
        "minAge": 60, "maxAge": 80, "weight": 4, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 2), MA("int", 1)],
        "include": ""
    },
    {
        "id": "human_final_prayer", "title": "最后的祈祷",
        "description": "你在深夜独自来到神殿，向诸神做了一生中最后的祈祷。不是为自己，而是为后代。",
        "minAge": 65, "maxAge": 80, "weight": 3, "unique": True, "races": ["human"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3)],
        "include": ""
    },
    {
        "id": "elf_fading_magic", "title": "魔力的消退",
        "description": "你感到体内的魔力在缓慢减弱。对精灵来说，这是生命终章的第一个信号。",
        "minAge": 200, "maxAge": 450, "weight": 5, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "magic", "routes": ["*"],
        "effects": [MA("mag", -1), MA("spr", 2)],
        "include": ""
    },
    {
        "id": "elf_return_to_forest", "title": "回归森林",
        "description": "在外游历了漫长的岁月后，你回到了出生的那片森林。树木似乎认出了你，枝叶轻轻摇曳。",
        "minAge": 150, "maxAge": 400, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3), MA("mag", 1)],
        "include": ""
    },
    {
        "id": "elf_eternal_sleep", "title": "永恒之眠",
        "description": "精灵不会像人类那样衰老死去。当他们感到疲倦时，会选择进入永恒的沉眠，与大地融为一体。",
        "minAge": 350, "maxAge": 500, "weight": 4, "unique": True, "races": ["elf"],
        "priority": "major", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 5)],
        "include": ""
    },
    {
        "id": "elf_passing_crown", "title": "传承",
        "description": "你决定将自己数百年来积累的知识和魔力结晶传给下一代最有才华的精灵。",
        "minAge": 200, "maxAge": 500, "weight": 3, "unique": True, "races": ["elf"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 3), MA("chr", 2), SF("legacy_passed")],
        "include": ""
    },
    {
        "id": "goblin_tribe_legacy", "title": "部落的记忆",
        "description": "你让年轻的哥布林们记住部落的历史——尽管哥布林没有文字，你用口述把一切传了下去。",
        "minAge": 28, "maxAge": 40, "weight": 4, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 1), MA("chr", 2), MA("spr", 2)],
        "include": ""
    },
    {
        "id": "goblin_last_invention", "title": "最后的发明",
        "description": "你用尽毕生的智慧造出了最后一件作品。它不完美，但饱含了你全部的心血。",
        "minAge": 25, "maxAge": 40, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 2), MA("spr", 2), SF("famous_inventor")],
        "include": "attribute.int >= 15"
    },
    {
        "id": "goblin_sage", "title": "哥布林贤者",
        "description": "活到这个岁数的哥布林，在整个种族中都屈指可数。其他部落的哥布林不远千里来拜访你。",
        "minAge": 30, "maxAge": 40, "weight": 3, "unique": True, "races": ["goblin"],
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 3), MA("spr", 2), SF("goblin_sage")],
        "include": ""
    },
]

# =============================================
# 8. 可重复事件（日常随机）
# =============================================
repeatable_events = [
    # 各年龄段可重复的日常事件，增加变化
    {
        "id": "random_weather_blessing", "title": "好天气",
        "description": "今天天气特别好。阳光明媚，微风轻拂，让人心情愉快。",
        "minAge": 5, "maxAge": 80, "weight": 2, "unique": False,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 1)],
        "include": ""
    },
    {
        "id": "random_found_coin", "title": "捡到硬币",
        "description": "你在路上捡到了一枚硬币。虽然价值不大，但让你觉得今天运气不错。",
        "minAge": 5, "maxAge": 80, "weight": 2, "unique": False,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("luk", 1)],
        "include": ""
    },
    {
        "id": "random_nightmare_visit", "title": "不安的梦",
        "description": "你做了一个不太愉快的梦。醒来后总觉得心里不太舒服。",
        "minAge": 8, "maxAge": 80, "weight": 2, "unique": False,
        "priority": "minor", "tag": "dark", "routes": ["*"],
        "effects": [MA("spr", -1)],
        "include": ""
    },
    {
        "id": "random_good_meal", "title": "丰盛的一餐",
        "description": "今天吃到了特别好吃的东西。满足感从胃里扩散到全身。",
        "minAge": 5, "maxAge": 80, "weight": 2, "unique": False,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("spr", 1)],
        "include": "",
        "raceVariants": {
            "goblin": {"description": "你发现了一窝特别肥美的虫子。对哥布林来说，这简直是山珍海味！"}
        }
    },
    {
        "id": "random_training_day", "title": "勤奋的一天",
        "description": "你今天特别有干劲，比平时更加努力地训练/学习。",
        "minAge": 10, "maxAge": 60, "weight": 2, "unique": False,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [],
        "include": "",
        "branches": [
            {"label": "训练体能", "effects": [MA("str", 1)]},
            {"label": "阅读学习", "effects": [MA("int", 1)]},
            {"label": "冥想修行", "effects": [MA("spr", 1)]}
        ]
    },
    {
        "id": "random_street_performance", "title": "街头表演",
        "description": "你在街上看到了一场精彩的表演。艺人的技艺让你叹为观止。",
        "minAge": 8, "maxAge": 70, "weight": 2, "unique": False,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 1)],
        "include": ""
    },
    {
        "id": "random_rainy_contemplation", "title": "雨中沉思",
        "description": "一场大雨困住了你。没什么可做的，只好坐在屋檐下听雨声，想想人生。",
        "minAge": 10, "maxAge": 80, "weight": 2, "unique": False,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 1)],
        "include": ""
    },
    {
        "id": "random_helping_stranger", "title": "帮助陌生人",
        "description": "你遇到了一个需要帮助的人，顺手帮了一把。",
        "minAge": 10, "maxAge": 70, "weight": 2, "unique": False,
        "priority": "minor", "tag": "social", "routes": ["*"],
        "effects": [MA("chr", 1), MA("spr", 1)],
        "include": ""
    },
    {
        "id": "random_minor_injury", "title": "小伤",
        "description": "不小心弄伤了自己。不严重，但有点疼。",
        "minAge": 5, "maxAge": 70, "weight": 2, "unique": False,
        "priority": "minor", "tag": "accident", "routes": ["*"],
        "effects": [MHP(-1)],
        "include": ""
    },
    {
        "id": "random_stargazing", "title": "观星",
        "description": "夜空格外清澈。你花了很长时间辨认那些星座的名字。",
        "minAge": 8, "maxAge": 80, "weight": 2, "unique": False,
        "priority": "minor", "tag": "life", "routes": ["*"],
        "effects": [MA("int", 1)],
        "include": ""
    },
]

# =============================================
# 注入事件
# =============================================
print("=== 大规模事件扩充 v2 ===")
total = 0
total += inject("birth.json", birth_events)
print(f"birth.json: +{total} new")

n = inject("childhood.json", childhood_events)
total += n
print(f"childhood.json: +{n} new")

n = inject("teenager.json", teenager_events)
total += n
print(f"teenager.json: +{n} new")

n = inject("youth.json", youth_events)
total += n
print(f"youth.json: +{n} new")

n = inject("adult.json", adult_events)
total += n
print(f"adult.json: +{n} new")

n = inject("middle-age.json", middle_age_events)
total += n
print(f"middle-age.json: +{n} new")

n = inject("elder.json", elder_events)
total += n
print(f"elder.json: +{n} new")

# 可重复事件按年龄段分到各文件
for re_evt in repeatable_events:
    mn = re_evt.get("minAge", 0)
    if mn < 8:
        n = inject("childhood.json", [re_evt])
    elif mn < 12:
        n = inject("teenager.json", [re_evt])
    elif mn < 18:
        n = inject("youth.json", [re_evt])
    elif mn < 45:
        n = inject("adult.json", [re_evt])
    else:
        n = inject("elder.json", [re_evt])
    total += n

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
    print(f"  {fn:20s}: {len(evts):3d} 事件 (人类:{r['human']:2d} 精灵:{r['elf']:2d} 哥布林:{r['goblin']:2d})")
print(f"  总计: {grand} 事件")
print(f"  人类专属: {rc['human']}, 精灵专属: {rc['elf']}, 哥布林专属: {rc['goblin']}")
print(f"  通用: {grand - rc['human'] - rc['elf'] - rc['goblin']}")
