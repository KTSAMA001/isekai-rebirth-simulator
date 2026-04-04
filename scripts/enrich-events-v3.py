#!/usr/bin/env python3
"""
大规模种族专属事件扩充 v3
目标：种族专属从 ~106 → ~220+，占比从 25% → 40%+
每个种族每个年龄段补充 5-10 个专属事件
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

def MA(t, v): return {"type": "modify_attribute", "target": t, "value": v}
def SF(f): return {"type": "set_flag", "target": f}
def MHP(v): return {"type": "modify_hp", "target": "hp", "value": v}

# ======================================================================
# 人类专属事件
# ======================================================================

human_childhood = [
    {"id": "human_bedtime_story", "title": "母亲的睡前故事",
     "description": "母亲每晚都会讲勇者击败魔王的故事。你听得入迷，梦想有一天也能成为那样的英雄。",
     "minAge": 3, "maxAge": 7, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "childhood", "routes": ["*"],
     "effects": [MA("spr", 1), MA("int", 1)], "include": ""},
    {"id": "human_fathers_sword", "title": "父亲的旧剑",
     "description": "你在阁楼发现了父亲年轻时用过的剑。虽然生锈了，但握在手里时有一种奇妙的重量感。",
     "minAge": 6, "maxAge": 10, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "childhood", "routes": ["*"],
     "effects": [MA("str", 1)], "include": "",
     "branches": [
         {"label": "偷偷练习挥剑", "effects": [MA("str", 2)]},
         {"label": "小心翼翼地放回原处", "effects": [MA("spr", 1), MA("int", 1)]}
     ]},
    {"id": "human_market_day", "title": "赶集日",
     "description": "父母带你去镇上赶集。琳琅满目的商品让你目不暇接，走丢了三次。",
     "minAge": 4, "maxAge": 8, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 1)], "include": ""},
    {"id": "human_neighbor_grandpa", "title": "隔壁老爷爷的故事",
     "description": "隔壁的退休老兵总爱给孩子们讲他年轻时征战四方的故事。真假难辨，但很精彩。",
     "minAge": 5, "maxAge": 9, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 1), MA("int", 1)], "include": ""},
    {"id": "human_prayer_class", "title": "祈祷课",
     "description": "人类的孩子从小就要学习向诸神祈祷。虽然你不太理解意义，但跪下时膝盖很疼。",
     "minAge": 5, "maxAge": 9, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
]

human_teenager = [
    {"id": "human_knight_dream", "title": "骑士梦",
     "description": "你在城门口看到了一队威风凛凛的骑士团经过。闪亮的铠甲、飘扬的旗帜，你心中燃起了一团火。",
     "minAge": 12, "maxAge": 16, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 1)], "include": "",
     "branches": [
         {"label": "追上去请求加入", "effects": [MA("str", 2), MA("chr", 1)]},
         {"label": "回家加倍练剑", "effects": [MA("str", 3)]},
         {"label": "打听骑士团的招募条件", "effects": [MA("int", 2)]}
     ]},
    {"id": "human_harvest_festival_dance", "title": "丰收祭的舞会",
     "description": "一年一度的丰收祭舞会。你被推上台去跳舞，虽然笨手笨脚但大家都在笑。",
     "minAge": 13, "maxAge": 17, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2)], "include": ""},
    {"id": "human_border_patrol", "title": "边境巡逻见习",
     "description": "你被选中跟随边境巡逻队实习一周。真正的荒野和你想象中完全不同——更危险，也更壮丽。",
     "minAge": 14, "maxAge": 17, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [MA("str", 2), MA("int", 1)], "include": ""},
    {"id": "human_tax_collector_visit", "title": "收税官来了",
     "description": "王国的收税官来到村里。看着父母无奈地交出辛苦积攒的钱，你第一次感受到了世道的不公。",
     "minAge": 12, "maxAge": 16, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "暗下决心将来改变这一切", "effects": [MA("spr", 2), MA("int", 1)]},
         {"label": "觉得这是理所当然的", "effects": [MA("spr", 1)]}
     ]},
    {"id": "human_blacksmith_forge", "title": "锻造初体验",
     "description": "铁匠师傅让你试着打一块铁。火星四溅，手臂酸痛，但看到铁块慢慢成形时很有成就感。",
     "minAge": 13, "maxAge": 17, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 2)], "include": ""},
]

human_youth = [
    {"id": "human_guild_initiation", "title": "工会入会仪式",
     "description": "冒险者工会的入会考验——独自完成一项D级任务。虽然是最低级别，但对新人来说已经够刺激了。",
     "minAge": 17, "maxAge": 22, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "认真完成任务", "effects": [MA("str", 2), SF("guild_member")]},
         {"label": "用巧计过关", "effects": [MA("int", 2), MA("luk", 1), SF("guild_member")]}
     ]},
    {"id": "human_romance_at_inn", "title": "旅馆邂逅",
     "description": "在旅途中投宿的旅馆里，你遇到了一个有趣的人。你们聊了整晚。",
     "minAge": 18, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "romance", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 1)], "include": ""},
    {"id": "human_noble_encounter", "title": "偶遇贵族",
     "description": "你在路上偶然帮助了一位遇到麻烦的贵族青年。对方对你颇为感激。",
     "minAge": 18, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "保持联系", "effects": [MA("chr", 2), MA("mny", 1)]},
         {"label": "不卑不亢地告辞", "effects": [MA("spr", 2)]}
     ]},
    {"id": "human_war_draft_letter", "title": "战争通知书",
     "description": "信箱里躺着一封盖有王室印章的信——前线需要更多士兵。",
     "minAge": 18, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "响应号召", "effects": [MA("str", 3), SF("military_service")]},
         {"label": "寻找替代方案", "effects": [MA("int", 2)]},
         {"label": "躲避征召", "effects": [MA("luk", 1), MA("mny", -2)]}
     ]},
    {"id": "human_farm_inheritance", "title": "继承农庄",
     "description": "父亲上了年纪，开始考虑把家里的农庄交给你打理。",
     "minAge": 20, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "接手农庄", "effects": [MA("str", 1), MA("spr", 1), SF("homeowner")]},
         {"label": "交给兄弟姐妹", "effects": [MA("spr", 1)]},
         {"label": "卖掉农庄出去闯荡", "effects": [MA("mny", 3), MA("luk", 1)]}
     ]},
    {"id": "human_arena_debut", "title": "竞技场初登场",
     "description": "你报名参加了城市竞技场的新人赛。观众席上的喧嚣声让你热血沸腾。",
     "minAge": 18, "maxAge": 24, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "attribute.str >= 12",
     "branches": [
         {"label": "正面迎战", "effects": [MA("str", 2)], "diceCheck": {"attribute": "str", "dc": 10, "successEffects": [MA("chr", 2), MA("mny", 2)], "failEffects": [MHP(-2)]}},
         {"label": "观察对手后再行动", "effects": [MA("int", 1), MA("str", 1)]}
     ]},
]

human_adult = [
    {"id": "human_feudal_politics", "title": "领主之间的纷争",
     "description": "你所在的村镇夹在两个领主的领地之间。双方的矛盾升级，平民被迫选边站。",
     "minAge": 25, "maxAge": 45, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "支持看起来正义的一方", "effects": [MA("spr", 2), MA("chr", 1)]},
         {"label": "两边不得罪", "effects": [MA("int", 2)]},
         {"label": "趁机谋利", "effects": [MA("mny", 3)]}
     ]},
    {"id": "human_wedding_ceremony", "title": "婚礼",
     "description": "你在亲友的祝福中举行了婚礼。虽然仪式简朴，但新娘/新郎脸上的笑容是你见过最美的。",
     "minAge": 22, "maxAge": 35, "weight": 4, "unique": True, "races": ["human"],
     "priority": "major", "tag": "romance", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 2), SF("married")], "include": ""},
    {"id": "human_child_born", "title": "孩子降生",
     "description": "你的孩子出生了。他/她那皱巴巴的小脸让你又想哭又想笑。",
     "minAge": 24, "maxAge": 40, "weight": 4, "unique": True, "races": ["human"],
     "priority": "major", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 1), SF("parent")], "include": "has.flag.married"},
    {"id": "human_tavern_owner", "title": "开一间酒馆",
     "description": "你攒够了钱，决定在城镇里开一间自己的酒馆。有固定的收入来源总让人安心。",
     "minAge": 28, "maxAge": 45, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "attribute.mny >= 10",
     "branches": [
         {"label": "精心经营", "effects": [MA("mny", 3), MA("chr", 2), SF("business_owner")]},
         {"label": "雇人管理自己继续冒险", "effects": [MA("mny", 1), MA("str", 1)]}
     ]},
    {"id": "human_bandit_raid", "title": "匪徒袭村",
     "description": "一伙匪徒袭击了你的村庄。年轻人纷纷拿起武器保护家人。",
     "minAge": 25, "maxAge": 45, "weight": 3, "unique": True, "races": ["human"],
     "priority": "major", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "带头反击", "effects": [MA("str", 2), MA("chr", 2)], "diceCheck": {"attribute": "str", "dc": 11, "successEffects": [SF("brave"), MA("chr", 1)], "failEffects": [MHP(-4)]}},
         {"label": "组织村民撤离", "effects": [MA("int", 2), MA("chr", 1)]},
         {"label": "护住自家人", "effects": [MA("str", 1), MA("spr", 1)]}
     ]},
    {"id": "human_king_audience", "title": "面见国王",
     "description": "因为某件事迹，你获得了面见国王的机会。王宫的宏伟让你震撼。",
     "minAge": 30, "maxAge": 50, "weight": 2, "unique": True, "races": ["human"],
     "priority": "major", "tag": "social", "routes": ["*"],
     "effects": [], "include": "attribute.chr >= 18 | attribute.str >= 25",
     "branches": [
         {"label": "请求封赏", "effects": [MA("mny", 4), MA("chr", 1)]},
         {"label": "献上建言", "effects": [MA("int", 2), MA("chr", 2), SF("royal_recognized")]},
         {"label": "谦逊地行礼退下", "effects": [MA("spr", 2)]}
     ]},
    {"id": "human_plague_survivor", "title": "瘟疫幸存者",
     "description": "一场瘟疫席卷了城镇。你奇迹般地幸存了下来，但失去了很多熟悉的面孔。",
     "minAge": 25, "maxAge": 50, "weight": 3, "unique": True, "races": ["human"],
     "priority": "major", "tag": "disaster", "routes": ["*"],
     "effects": [MA("spr", 2), MHP(-2)], "include": ""},
    {"id": "human_trade_caravan", "title": "远行商队",
     "description": "你加入了一支前往远方国度的商队。几个月的旅程让你见识了截然不同的文化。",
     "minAge": 25, "maxAge": 40, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [MA("int", 2), MA("chr", 1), MA("mny", 2)], "include": ""},
]

human_middle = [
    {"id": "human_son_leaves_home", "title": "孩子离家",
     "description": "你的孩子收拾行囊准备出门闯荡。看着背影，你既骄傲又不舍。",
     "minAge": 40, "maxAge": 55, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": "has.flag.parent"},
    {"id": "human_old_war_buddy", "title": "战友的来信",
     "description": "你收到了一封来自老战友的信。对方邀请你重聚，一起回忆那些峥嵘岁月。",
     "minAge": 35, "maxAge": 55, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 1)], "include": "has.flag.military_service"},
    {"id": "human_community_leader", "title": "社区领袖",
     "description": "邻居们推举你做社区的代表。大大小小的事务都来找你商量。",
     "minAge": 35, "maxAge": 55, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2), MA("int", 1)], "include": "attribute.chr >= 12"},
    {"id": "human_autumn_harvest_feast", "title": "丰年宴",
     "description": "今年收成特别好。全村人一起举办了盛大的庆祝宴会，你作为长辈被请上了首席。",
     "minAge": 40, "maxAge": 60, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 1), MA("chr", 2)], "include": ""},
    {"id": "human_temple_donation", "title": "神殿捐赠",
     "description": "你向神殿捐了一笔钱。牧师为你祈福，并在捐赠人名录上刻下了你的名字。",
     "minAge": 35, "maxAge": 55, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [], "include": "attribute.mny >= 8",
     "branches": [
         {"label": "慷慨解囊", "effects": [MA("mny", -3), MA("spr", 3)]},
         {"label": "适度捐赠", "effects": [MA("mny", -1), MA("spr", 1)]}
     ]},
]

human_elder = [
    {"id": "human_rocking_chair", "title": "摇椅上的午后",
     "description": "你坐在门前的摇椅上晒太阳。路过的孩子们向你打招呼，你笑着挥手。",
     "minAge": 60, "maxAge": 80, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
    {"id": "human_old_battlefield", "title": "重访战场",
     "description": "你回到了年轻时打过仗的地方。曾经的战场如今长满了野花，只有一块斑驳的纪念碑记录着过去。",
     "minAge": 55, "maxAge": 75, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 3)], "include": "has.flag.military_service | has.flag.war_veteran"},
    {"id": "human_last_toast", "title": "最后一杯酒",
     "description": "你独自坐在曾经常去的酒馆角落，要了一杯老酒。酒还是那个味道，人却少了很多。",
     "minAge": 60, "maxAge": 80, "weight": 3, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
    {"id": "human_family_photo", "title": "全家聚会",
     "description": "子女们从各地赶来团聚。你看着满堂的儿孙，觉得这辈子没白活。",
     "minAge": 60, "maxAge": 80, "weight": 4, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 3), MA("chr", 1)], "include": ""},
    {"id": "human_craft_mastery", "title": "手艺的巅峰",
     "description": "你打造了此生最完美的一件作品。年轻时的不足，此刻全都弥补了。",
     "minAge": 55, "maxAge": 75, "weight": 2, "unique": True, "races": ["human"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2), MA("spr", 2)], "include": "attribute.int >= 15"},
]

# ======================================================================
# 精灵专属事件
# ======================================================================

elf_childhood = [
    {"id": "elf_dewdrop_game", "title": "露珠捉迷藏",
     "description": "精灵孩子们最喜欢在清晨的露珠间捉迷藏。你的透明翅膀——哦不对，你没有翅膀，但你跑得特别快。",
     "minAge": 3, "maxAge": 7, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "childhood", "routes": ["*"],
     "effects": [MA("str", 1), MA("chr", 1)], "include": ""},
    {"id": "elf_moonlight_lullaby", "title": "月光摇篮曲",
     "description": "精灵母亲用古精灵语唱着摇篮曲。据说这首歌传唱了千年，每个精灵都会唱。",
     "minAge": 2, "maxAge": 5, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
    {"id": "elf_first_magic_spark", "title": "第一缕魔火",
     "description": "你在手心里点燃了第一缕魔力之火——虽然只是针尖大小的光点，但长辈们纷纷鼓掌。",
     "minAge": 4, "maxAge": 8, "weight": 5, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2)], "include": ""},
    {"id": "elf_herb_gathering", "title": "采药课",
     "description": "长辈带你去森林里辨认各种药草。精灵的草药学是数千年知识的结晶。",
     "minAge": 5, "maxAge": 9, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2)], "include": ""},
    {"id": "elf_talking_to_tree", "title": "与树对话",
     "description": "你学会了精灵与植物沟通的基础技巧。虽然树木的回应很慢，但你确实感受到了一丝温暖。",
     "minAge": 5, "maxAge": 10, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 1), MA("spr", 1)], "include": ""},
]

elf_teenager = [
    {"id": "elf_archery_training", "title": "精灵弓术修行",
     "description": "精灵的弓术不仅是技巧，更是一种冥想。你闭着眼睛射出的箭，比睁眼时更准。",
     "minAge": 12, "maxAge": 20, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [MA("str", 1), MA("int", 1)], "include": "",
     "branches": [
         {"label": "苦练到百步穿杨", "effects": [MA("str", 2)]},
         {"label": "领悟箭中蕴含的哲理", "effects": [MA("spr", 2), MA("int", 1)]}
     ]},
    {"id": "elf_forest_guardian_test", "title": "森林守卫考核",
     "description": "精灵少年在成年前要通过森林守卫的考核——在荒野中独自生存七天。",
     "minAge": 14, "maxAge": 20, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [MA("str", 2)], "include": "",
     "branches": [
         {"label": "与自然和谐共处", "effects": [MA("spr", 2), MA("mag", 1)]},
         {"label": "利用所学知识求生", "effects": [MA("int", 2), MA("str", 1)]}
     ]},
    {"id": "elf_forbidden_book", "title": "禁书",
     "description": "你在图书馆深处发现了一本被标记为'禁止阅读'的古籍。封印上有微弱的魔力波动。",
     "minAge": 14, "maxAge": 20, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "偷偷翻开", "effects": [MA("mag", 2), MA("int", 1)]},
         {"label": "报告长老", "effects": [MA("spr", 2)]}
     ]},
    {"id": "elf_half_elf_friend", "title": "半精灵朋友",
     "description": "你交了一个半精灵朋友。在纯血精灵社区里，这让你受到了一些非议。",
     "minAge": 12, "maxAge": 20, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "不顾非议继续做朋友", "effects": [MA("chr", 2), MA("spr", 1)]},
         {"label": "渐渐疏远", "effects": [MA("int", 1)]}
     ]},
    {"id": "elf_waterfall_meditation", "title": "瀑布修行",
     "description": "精灵修行传统之一——在冰冷的瀑布下冥想。水流冲刷着你的身体，也洗涤着你的内心。",
     "minAge": 14, "maxAge": 20, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("spr", 2), MA("str", 1)], "include": ""},
]

elf_youth = [
    {"id": "elf_human_city_visit", "title": "初访人类城市",
     "description": "你第一次踏入人类的城市。嘈杂的叫卖声、刺鼻的烟火味、拥挤的街道——与宁静的森林截然不同。",
     "minAge": 18, "maxAge": 30, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "exploration", "routes": ["*"],
     "effects": [MA("int", 1)], "include": "",
     "branches": [
         {"label": "深入了解人类文化", "effects": [MA("chr", 2), MA("int", 1)]},
         {"label": "觉得太吵赶紧回森林", "effects": [MA("spr", 1)]},
         {"label": "尝试人类的食物", "effects": [MA("chr", 1), MA("luk", 1)]}
     ]},
    {"id": "elf_magic_duel", "title": "魔法决斗",
     "description": "一位同龄的精灵向你发起了魔法决斗。这是精灵们切磋实力的传统方式。",
     "minAge": 20, "maxAge": 30, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "attribute.mag >= 10",
     "branches": [
         {"label": "全力以赴", "effects": [MA("mag", 2)], "diceCheck": {"attribute": "mag", "dc": 10, "successEffects": [MA("chr", 2)], "failEffects": [MHP(-2)]}},
         {"label": "巧妙防守寻找破绽", "effects": [MA("int", 2), MA("mag", 1)]}
     ]},
    {"id": "elf_starlight_weaving", "title": "星光织衣",
     "description": "你学会了用月光和星辉编织衣物的古法。这种技艺只有精灵才能掌握。",
     "minAge": 20, "maxAge": 30, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 1), MA("int", 1), MA("chr", 1)], "include": ""},
    {"id": "elf_world_tree_communion", "title": "与世界树共鸣",
     "description": "你在世界树前冥想时，突然感受到了它数千年的记忆碎片。那种浩瀚让你几乎窒息。",
     "minAge": 20, "maxAge": 30, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("spr", 2), SF("world_tree_blessed")], "include": "attribute.mag >= 12"},
    {"id": "elf_ranger_path", "title": "游侠之路",
     "description": "你决定成为一名精灵游侠——守护森林边境，巡逻于内外之间。",
     "minAge": 18, "maxAge": 28, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [MA("str", 2), MA("int", 1)], "include": ""},
    {"id": "elf_ancient_language", "title": "远古精灵语",
     "description": "你在古卷中发现了一种比现代精灵语更古老的语言。这是上古精灵使用的语言，蕴含着失落的魔法。",
     "minAge": 20, "maxAge": 30, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [], "include": "attribute.int >= 12",
     "branches": [
         {"label": "花时间破译", "effects": [MA("int", 3), MA("mag", 2)]},
         {"label": "请教长老", "effects": [MA("chr", 1), MA("int", 1), MA("mag", 1)]}
     ]},
]

elf_adult = [
    {"id": "elf_council_invitation", "title": "长老会议席邀请",
     "description": "你的才能被认可，长老会邀请你旁听一次会议。这是非常罕见的荣誉。",
     "minAge": 40, "maxAge": 100, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 2), MA("int", 1)], "include": "attribute.chr >= 15 | attribute.mag >= 20"},
    {"id": "elf_moonstone_forge", "title": "月石锻造",
     "description": "你得到了一块珍贵的月石原矿。这是锻造精灵传奇武器的材料。",
     "minAge": 40, "maxAge": 120, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [], "include": "attribute.mag >= 18",
     "branches": [
         {"label": "亲手锻造", "effects": [MA("mag", 3), MA("str", 1)]},
         {"label": "交给大师级工匠", "effects": [MA("chr", 1), MA("int", 1)]},
         {"label": "收藏原矿", "effects": [MA("mny", 3)]}
     ]},
    {"id": "elf_dark_elf_encounter", "title": "黑暗精灵",
     "description": "你在巡逻时遇到了一名堕落的黑暗精灵。对方并没有敌意，只是在寻找回归的路。",
     "minAge": 30, "maxAge": 100, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "帮助对方", "effects": [MA("spr", 2), MA("chr", 2)]},
         {"label": "警惕地驱逐", "effects": [MA("str", 1), MA("int", 1)]},
         {"label": "上报长老会", "effects": [MA("int", 1)]}
     ]},
    {"id": "elf_eternal_garden", "title": "永恒花园",
     "description": "你花了数十年时间培育了一座魔法花园。四季常开的花朵吸引了无数精灵前来观赏。",
     "minAge": 50, "maxAge": 150, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 2)], "include": ""},
    {"id": "elf_lament_for_fallen", "title": "悲歌",
     "description": "一位关系亲近的精灵在意外中逝世。精灵很少死去，所以每一次离别都格外沉重。",
     "minAge": 40, "maxAge": 200, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2), MHP(-1)], "include": ""},
    {"id": "elf_phoenix_sighting", "title": "凤凰目击",
     "description": "你在高山之巅看到了一只传说中的凤凰。它金红色的羽毛照亮了整片天空。",
     "minAge": 50, "maxAge": 200, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "legendary", "routes": ["*"],
     "effects": [MA("luk", 3), MA("mag", 2), MA("spr", 1)], "include": "attribute.luk >= 12"},
]

elf_middle = [
    {"id": "elf_wisdom_council_seat", "title": "贤者之席",
     "description": "经过数百年的积累，你终于被邀请正式加入精灵贤者会。这是精灵社会最高的智慧殿堂。",
     "minAge": 100, "maxAge": 300, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 3), MA("int", 2), SF("council_member")], "include": "attribute.int >= 20 | attribute.mag >= 25"},
    {"id": "elf_time_perception", "title": "时间的感知",
     "description": "你开始察觉到精灵与其他种族截然不同的时间感——一个人类的一生，不过是你午后小憩的光景。",
     "minAge": 100, "maxAge": 250, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 3)], "include": ""},
    {"id": "elf_silver_harp", "title": "银竖琴",
     "description": "你终于掌握了精灵银竖琴的全部技法。据说精通此琴的精灵，琴声能治愈心灵的创伤。",
     "minAge": 80, "maxAge": 200, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 3), MA("spr", 1)], "include": ""},
    {"id": "elf_dragon_alliance", "title": "与龙族结盟",
     "description": "古精灵与龙族曾有深厚的渊源。一条年迈的银龙主动找到你，提议恢复古老的盟约。",
     "minAge": 100, "maxAge": 300, "weight": 1, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "legendary", "routes": ["*"],
     "effects": [], "include": "attribute.mag >= 25 & attribute.chr >= 15",
     "branches": [
         {"label": "接受盟约", "effects": [MA("mag", 3), MA("chr", 2), SF("dragon_rider")]},
         {"label": "谨慎考虑", "effects": [MA("int", 2), MA("spr", 1)]}
     ]},
    {"id": "elf_forest_expansion", "title": "拓展森林",
     "description": "你领导了一项精灵的伟大工程——用魔法将古森林的边界向外扩展。新的树木在你的魔力下破土而出。",
     "minAge": 80, "maxAge": 250, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 2), MA("spr", 2)], "include": "attribute.mag >= 18"},
]

elf_elder = [
    {"id": "elf_ancient_memory_share", "title": "千年记忆分享",
     "description": "你将数百年的记忆编织成魔力水晶，存放在精灵图书馆中。后人可以通过触摸水晶体验你的一生。",
     "minAge": 250, "maxAge": 500, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("int", 2), MA("spr", 2), MA("mag", 1)], "include": ""},
    {"id": "elf_farewell_ceremony", "title": "告别仪式",
     "description": "精灵们为你举行了盛大的告别仪式。不是葬礼，而是感恩你漫长一生的贡献。",
     "minAge": 350, "maxAge": 500, "weight": 3, "unique": True, "races": ["elf"],
     "priority": "major", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 4), MA("chr", 2)], "include": ""},
    {"id": "elf_star_communion", "title": "与星辰对话",
     "description": "在极高龄的精灵中，有些人开始能听到星辰的低语。那是来自宇宙深处的智慧。",
     "minAge": 300, "maxAge": 500, "weight": 2, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("mag", 3), MA("spr", 3)], "include": "attribute.mag >= 30"},
    {"id": "elf_final_bloom", "title": "最后的绽放",
     "description": "你童年种下的那棵树终于开出了第一朵花。等了数百年，此刻你热泪盈眶。",
     "minAge": 200, "maxAge": 500, "weight": 4, "unique": True, "races": ["elf"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 4)], "include": ""},
]

# ======================================================================
# 哥布林专属事件
# ======================================================================

goblin_childhood = [
    {"id": "goblin_first_heist", "title": "第一次偷东西",
     "description": "哥布林孩子的成长仪式——从人类的菜园里偷一根萝卜回来。你紧张得心都快跳出来了。",
     "minAge": 3, "maxAge": 7, "weight": 5, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "childhood", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "快速偷到跑回来", "effects": [MA("str", 1), MA("luk", 2)]},
         {"label": "被发现了拼命逃", "effects": [MA("str", 2)]},
         {"label": "不想偷，自己去挖野菜", "effects": [MA("spr", 2)]}
     ]},
    {"id": "goblin_mushroom_garden", "title": "蘑菇花园",
     "description": "你在洞穴的角落发现了一些发光的蘑菇。你每天都来浇……口水，它们居然越长越大。",
     "minAge": 3, "maxAge": 7, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 1), MA("spr", 1)], "include": ""},
    {"id": "goblin_rock_language", "title": "石头记号",
     "description": "哥布林没有文字，但你发明了一套用石头排列组合表示意思的记号。小伙伴们觉得你是天才。",
     "minAge": 4, "maxAge": 8, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "childhood", "routes": ["*"],
     "effects": [MA("int", 3)], "include": ""},
    {"id": "goblin_big_brother", "title": "大孩子的保护",
     "description": "部落里一个大你几岁的哥布林总是罩着你。虽然他脾气不好，但你知道他是真心的。",
     "minAge": 3, "maxAge": 7, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 1), MA("spr", 1), SF("true_friend")], "include": ""},
    {"id": "goblin_human_toy", "title": "人类的玩具",
     "description": "你在垃圾堆里捡到了一个人类孩子丢掉的布娃娃。虽然脏兮兮的，但对你来说这是宝贝。",
     "minAge": 2, "maxAge": 6, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 2)], "include": ""},
]

goblin_teenager = [
    {"id": "goblin_forge_trick", "title": "炉火的恶作剧",
     "description": "你用从废物堆中搜刮来的零件造了一个能喷火的小装置。虽然烧到了自己的头发。",
     "minAge": 10, "maxAge": 15, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 2)], "include": "",
     "branches": [
         {"label": "改良设计", "effects": [MA("int", 2)]},
         {"label": "拿去卖给冒险者", "effects": [MA("mny", 2), MA("chr", 1)]}
     ]},
    {"id": "goblin_duel_for_food", "title": "抢食之战",
     "description": "食物不够分了。按照哥布林的规矩——打一架，赢的人多吃一份。",
     "minAge": 10, "maxAge": 16, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "正面硬刚", "effects": [MA("str", 2)]},
         {"label": "用计策取胜", "effects": [MA("int", 2)]},
         {"label": "把自己的份让给弱小的", "effects": [MA("spr", 2), MA("chr", 1)]}
     ]},
    {"id": "goblin_night_raid", "title": "夜间突袭",
     "description": "部落首领派你参加一次夜间袭击行动——从人类仓库里搬运补给。你第一次参与真正的行动。",
     "minAge": 11, "maxAge": 16, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [MA("str", 1)], "include": "",
     "branches": [
         {"label": "负责放风", "effects": [MA("int", 1), MA("luk", 1)]},
         {"label": "负责搬运", "effects": [MA("str", 2)]},
         {"label": "偷偷私藏一些", "effects": [MA("mny", 2), MA("luk", 1)]}
     ]},
    {"id": "goblin_pet_rat", "title": "驯化洞鼠",
     "description": "你成功驯化了一只巨型洞鼠当坐骑。虽然不太听话，但骑着它跑起来很快。",
     "minAge": 10, "maxAge": 15, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 1), MA("str", 1), SF("has_pet")], "include": ""},
    {"id": "goblin_human_kindness", "title": "人类的善意",
     "description": "一个人类小女孩把面包扔进了你躲藏的巷子里。她朝你笑了笑就跑开了。那是你第一次尝到面包的味道。",
     "minAge": 10, "maxAge": 16, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("spr", 2), MA("chr", 1)], "include": ""},
]

goblin_youth = [
    {"id": "goblin_merchant_debut", "title": "第一笔生意",
     "description": "你用修好的废品在黑市上完成了第一笔交易。虽然只赚了几个铜板，但意义重大。",
     "minAge": 14, "maxAge": 20, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("mny", 2), MA("chr", 1)], "include": ""},
    {"id": "goblin_explosive_mastery", "title": "爆炸大师",
     "description": "你对可燃物的理解已经达到了艺术级别。一点点火药粉末在你手里就能创造出惊天动地的效果。",
     "minAge": 14, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "magic", "routes": ["*"],
     "effects": [MA("int", 2), MA("mag", 1)], "include": "attribute.int >= 10"},
    {"id": "goblin_sewer_kingdom", "title": "下水道王国",
     "description": "你在城市下水道里建立了一个据点。逐渐地，越来越多的哥布林来投靠你。",
     "minAge": 15, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "attribute.chr >= 8",
     "branches": [
         {"label": "当一个好首领", "effects": [MA("chr", 2), MA("spr", 1)]},
         {"label": "利用手下谋利", "effects": [MA("mny", 3), MA("int", 1)]}
     ]},
    {"id": "goblin_disguise_adventure", "title": "伪装冒险",
     "description": "你披着斗蓬伪装成矮人，报名参加了一支冒险者小队。内心极度紧张。",
     "minAge": 14, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "小心翼翼不露馅", "effects": [MA("int", 2), MA("chr", 1)]},
         {"label": "意外暴露身份", "effects": [], "diceCheck": {"attribute": "luk", "dc": 10, "successEffects": [MA("chr", 3), SF("has_ally")], "failEffects": [MHP(-2), MA("str", 1)]}}
     ]},
    {"id": "goblin_treasure_dive", "title": "寻宝潜水",
     "description": "传说河底沉着一艘古船的残骸。你憋了一口气潜了下去。",
     "minAge": 14, "maxAge": 22, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "adventure", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "搜刮宝物", "effects": [MA("mny", 3), MA("luk", 1)]},
         {"label": "小心探索", "effects": [MA("int", 2), MA("str", 1)]}
     ]},
    {"id": "goblin_weapon_crafting", "title": "自制武器",
     "description": "你用捡来的金属片、骨头和皮革造了一把独一无二的武器。虽然丑陋，但出奇地好用。",
     "minAge": 14, "maxAge": 20, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("str", 2), MA("int", 1)], "include": ""},
]

goblin_adult = [
    {"id": "goblin_smuggling_ring", "title": "走私网络",
     "description": "你建立了一个覆盖三座城市的走私网络。从违禁药材到稀有矿石，你什么都运。",
     "minAge": 18, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "attribute.int >= 12 & attribute.mny >= 8",
     "branches": [
         {"label": "扩大规模", "effects": [MA("mny", 4), MA("chr", 1)]},
         {"label": "转型做合法生意", "effects": [MA("spr", 2), MA("chr", 2)]},
         {"label": "找一个大靠山", "effects": [MA("chr", 1), MA("mny", 2)]}
     ]},
    {"id": "goblin_arena_underdog", "title": "竞技场的黑马",
     "description": "你以哥布林的身份报名参加了人类竞技场。所有人都在嘲笑，直到比赛开始。",
     "minAge": 16, "maxAge": 28, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "combat", "routes": ["*"],
     "effects": [], "include": "attribute.str >= 12",
     "branches": [
         {"label": "用速度和灵活取胜", "effects": [MA("str", 2)], "diceCheck": {"attribute": "luk", "dc": 8, "successEffects": [MA("chr", 3), MA("mny", 3)], "failEffects": [MHP(-3)]}},
         {"label": "使出各种诡计", "effects": [MA("int", 2), MA("luk", 1)]}
     ]},
    {"id": "goblin_herb_dealer", "title": "草药商人",
     "description": "你发现利用哥布林对洞穴植物的知识，可以采集到很多人类不会找的珍稀药材。",
     "minAge": 16, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("mny", 2), MA("int", 2)], "include": ""},
    {"id": "goblin_tunnel_architect", "title": "地道建筑师",
     "description": "你设计的地道系统复杂到连矮人工程师都感到惊叹。通风、排水、逃生路线一应俱全。",
     "minAge": 18, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 3), MA("str", 1)], "include": "attribute.int >= 12"},
    {"id": "goblin_interracial_marriage", "title": "异族婚姻",
     "description": "你和一个半身人（或矮人）产生了感情。跨种族的恋情在这个世界并不罕见，但哥布林的总是格外受人议论。",
     "minAge": 16, "maxAge": 28, "weight": 2, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "romance", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "不顾非议在一起", "effects": [MA("chr", 2), MA("spr", 2), SF("married")]},
         {"label": "理性分开", "effects": [MA("spr", 2)]}
     ]},
    {"id": "goblin_rebellion", "title": "反抗压迫",
     "description": "人类领主在你的居住区实施了更严酷的排斥政策。你不打算再忍了。",
     "minAge": 16, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "major", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "组织地下反抗", "effects": [MA("chr", 2), MA("int", 2)]},
         {"label": "通过谈判争取权利", "effects": [MA("chr", 3), SF("diplomat")]},
         {"label": "带族人迁徙到新家", "effects": [MA("str", 2), MA("spr", 1)]}
     ]},
]

goblin_middle = [
    {"id": "goblin_legacy_hoard", "title": "传家宝库",
     "description": "你一辈子收集的闪亮物品已经堆满了三个洞穴。是时候想想怎么处置了。",
     "minAge": 22, "maxAge": 35, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "设置机关保护", "effects": [MA("int", 2)]},
         {"label": "分给族中的孩子们", "effects": [MA("chr", 2), MA("spr", 2)]},
         {"label": "出售变现", "effects": [MA("mny", 4)]}
     ]},
    {"id": "goblin_school_founder", "title": "哥布林学校",
     "description": "你做了一件前所未有的事——为哥布林的孩子们开办了一所学校。教他们读写、算数和基本的机械知识。",
     "minAge": 20, "maxAge": 33, "weight": 2, "unique": True, "races": ["goblin"],
     "priority": "major", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 3), MA("int", 1), SF("school_founder")], "include": "attribute.int >= 15"},
    {"id": "goblin_old_bones_ache", "title": "骨头疼",
     "description": "哥布林老得快。你的关节开始咔咔作响，爬洞穴比以前费力多了。",
     "minAge": 22, "maxAge": 35, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MHP(-1), MA("spr", 1)], "include": ""},
    {"id": "goblin_wise_counsel", "title": "调解纠纷",
     "description": "两个年轻哥布林在争夺地盘。你作为部落长辈被请来裁决。",
     "minAge": 22, "maxAge": 35, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [], "include": "",
     "branches": [
         {"label": "公正裁决", "effects": [MA("chr", 2), MA("spr", 1)]},
         {"label": "让他们打一架", "effects": [MA("luk", 1)]},
         {"label": "偏向有才能的那个", "effects": [MA("int", 2)]}
     ]},
    {"id": "goblin_recipe_book", "title": "食谱大全",
     "description": "你决定把这辈子研究出来的所有食谱画在兽皮卷上。虽然对人类来说可能有点重口味。",
     "minAge": 20, "maxAge": 35, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("int", 1), MA("chr", 2)], "include": ""},
]

goblin_elder = [
    {"id": "goblin_longest_living", "title": "最长寿的哥布林",
     "description": "你已经成为方圆百里最长寿的哥布林。其他部落派使者来拜访，想知道你长寿的秘诀。",
     "minAge": 30, "maxAge": 40, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "social", "routes": ["*"],
     "effects": [MA("chr", 3)], "include": "",
     "branches": [
         {"label": "大方分享养生之道", "effects": [MA("chr", 2), MA("spr", 1)]},
         {"label": "胡编乱造一通", "effects": [MA("luk", 2)]},
         {"label": "编一个离谱的故事", "effects": [MA("int", 1), MA("chr", 1)]}
     ]},
    {"id": "goblin_sunset_hill", "title": "山丘上的日落",
     "description": "你爬上了部落旁最高的山丘看日落。哥布林的一生虽然短暂，但你觉得自己活得精彩。",
     "minAge": 28, "maxAge": 40, "weight": 4, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 3)], "include": ""},
    {"id": "goblin_buried_treasure_reveal", "title": "公开藏宝地点",
     "description": "你终于告诉了最信任的年轻哥布林那个藏宝洞穴的位置。看着他狂喜的表情，你笑了。",
     "minAge": 28, "maxAge": 40, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("chr", 2), MA("spr", 2)], "include": ""},
    {"id": "goblin_dream_of_equality", "title": "平等之梦",
     "description": "你临终前的愿望是——将来有一天，哥布林不再被人看轻。你把这个信念传给了后辈。",
     "minAge": 30, "maxAge": 40, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "major", "tag": "life", "routes": ["*"],
     "effects": [MA("spr", 4), MA("chr", 2)], "include": ""},
    {"id": "goblin_last_trick", "title": "最后的恶作剧",
     "description": "临走前你还不忘给年轻人挖了个坑。洞穴入口的陷阱会在你走后给某个不小心的后辈一个'惊喜'。",
     "minAge": 28, "maxAge": 40, "weight": 3, "unique": True, "races": ["goblin"],
     "priority": "minor", "tag": "life", "routes": ["*"],
     "effects": [MA("luk", 2), MA("int", 1)], "include": ""},
]

# ======================================================================
# 注入
# ======================================================================
print("=== 种族专属事件大规模扩充 v3 ===\n")
total = 0

pairs = [
    ("childhood.json", human_childhood + elf_childhood + goblin_childhood),
    ("teenager.json", human_teenager + elf_teenager + goblin_teenager),
    ("youth.json", human_youth + elf_youth + goblin_youth),
    ("adult.json", human_adult + elf_adult + goblin_adult),
    ("middle-age.json", human_middle + elf_middle + goblin_middle),
    ("elder.json", human_elder + elf_elder + goblin_elder),
]

for fn, evts in pairs:
    n = inject(fn, evts)
    total += n
    print(f"  {fn}: +{n} 新事件")

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
    print(f"  {fn:20s}: {len(evts):3d} 总 (人:{r['human']:2d} 精:{r['elf']:2d} 哥:{r['goblin']:2d})")
spec = rc["human"]+rc["elf"]+rc["goblin"]
print(f"  总计: {grand}")
print(f"  种族专属: {spec} (人类:{rc['human']} 精灵:{rc['elf']} 哥布林:{rc['goblin']})")
print(f"  通用: {grand - spec}")
print(f"  种族专属占比: {spec/grand*100:.1f}%")
