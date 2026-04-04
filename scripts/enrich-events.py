#!/usr/bin/env python3
"""
事件池扩充与权重平衡补丁
1. 降低通用高权重事件的权重
2. 大量扩充种族专属事件（人类/精灵/哥布林各年龄段）
3. 补充属性条件事件（高魔力、高武力、高运气等触发不同事件）
"""
import json, os, copy

EVENT_DIR = "data/sword-and-magic/events"

def load_events(filename):
    fp = os.path.join(EVENT_DIR, filename)
    with open(fp) as f:
        return json.load(f)

def save_events(filename, events):
    fp = os.path.join(EVENT_DIR, filename)
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    print(f"  写入 {filename}: {len(events)} 个事件")

# ========== 阶段1: 权重调整 ==========
print("=== 阶段1: 调整通用高权重事件 ===")

# 需要降权的 ID -> 新权重
WEIGHT_OVERRIDES = {
    # 老年期高权重事件太密集，降到合理范围
    "elder_frail": 6,           # 18 -> 6
    "elder_final_illness": 5,   # 16 -> 5
    "peaceful_end": 4,          # 12 -> 4
    "elder_memory_fade": 4,     # 12 -> 4
    "elder_natural_death": 4,   # 10 -> 4
    # 中年期过于频繁的衰老事件
    "mid_body_decline": 5,      # 12 -> 5
    "mid_chronic_pain": 4,      # 10 -> 4
    "mid_slowing_down": 4,      # 10 -> 4
    "mid_vision_decline": 3,    # 8 -> 3
    # 出生事件过于集中
    "birth_common": 10,         # 20 -> 10
    "birth_slums": 8,           # 15 -> 8
    # 一些通用高权重独特事件
    "retirement": 5,            # 10 -> 5
    "legend_spread": 3,         # 8 -> 3
}

adjusted_count = 0
for filename in os.listdir(EVENT_DIR):
    if not filename.endswith(".json"):
        continue
    events = load_events(filename)
    changed = False
    for e in events:
        if e["id"] in WEIGHT_OVERRIDES:
            old_w = e["weight"]
            new_w = WEIGHT_OVERRIDES[e["id"]]
            e["weight"] = new_w
            print(f"  {e['id']}: weight {old_w} -> {new_w}")
            changed = True
            adjusted_count += 1
    if changed:
        save_events(filename, events)

print(f"  共调整 {adjusted_count} 个事件权重")
print()

# ========== 阶段2: 扩充种族专属事件 ==========
print("=== 阶段2: 扩充种族专属事件 ===")

# --- 童年事件 ---
childhood_race_events = [
    # 人类童年
    {
        "id": "human_village_festival", "title": "村庄丰收祭",
        "description": "一年一度的丰收祭到来了，人类村庄挂满了彩旗。你第一次被允许参加夜晚的篝火舞会。",
        "minAge": 5, "maxAge": 10, "weight": 4, "unique": True, "races": ["human"],
        "effects": [{"type": "modify_attribute", "target": "chr", "value": 1}],
        "branches": [
            {"label": "在广场上尽情跳舞", "effects": [{"type": "modify_attribute", "target": "chr", "value": 1}]},
            {"label": "偷偷溜去看花火工坊", "effects": [{"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    {
        "id": "human_apprentice_smith", "title": "铁匠铺学徒",
        "description": "镇上的铁匠看中了你结实的体格，问你父母是否愿意让你当学徒。",
        "minAge": 7, "maxAge": 10, "weight": 3, "unique": True, "races": ["human"],
        "effects": [{"type": "modify_attribute", "target": "str", "value": 1}],
        "branches": [
            {"label": "接受学徒工作", "effects": [{"type": "modify_attribute", "target": "str", "value": 2}, {"type": "set_flag", "target": "smith_apprentice"}]},
            {"label": "婉拒，继续自由玩耍", "effects": [{"type": "modify_attribute", "target": "luk", "value": 1}]}
        ]
    },
    {
        "id": "human_street_gang", "title": "街头少年团",
        "description": "邻居家的孩子们组成了一个小帮派，你被邀请加入。",
        "minAge": 6, "maxAge": 10, "weight": 3, "unique": True, "races": ["human"],
        "effects": [],
        "branches": [
            {"label": "加入他们的冒险", "effects": [{"type": "modify_attribute", "target": "str", "value": 1}, {"type": "modify_attribute", "target": "chr", "value": 1}]},
            {"label": "告诉大人们", "effects": [{"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    # 精灵童年
    {
        "id": "elf_first_treesong", "title": "第一次听见树歌",
        "description": "清晨独自漫步林间，你突然听到一棵千年古树低沉的吟唱。精灵长辈说，这是树灵在与你对话。",
        "minAge": 4, "maxAge": 10, "weight": 5, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}, {"type": "modify_attribute", "target": "spr", "value": 1}],
        "branches": [
            {"label": "尝试用魔力回应树灵", "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}]},
            {"label": "静静聆听直到黄昏", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    {
        "id": "elf_starlight_bath", "title": "星光沐浴",
        "description": "精灵的传统——在满月之夜将幼儿浸入银辉泉水中。据说这能唤醒沉睡的魔力血脉。",
        "minAge": 3, "maxAge": 6, "weight": 5, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "mag", "value": 1}],
        "branches": [
            {"label": "平静地接受洗礼", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]},
            {"label": "好奇地捕捉水中光斑", "effects": [{"type": "modify_attribute", "target": "mag", "value": 1}, {"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    {
        "id": "elf_elvish_calligraphy", "title": "古精灵文书法课",
        "description": "精灵的启蒙教育从学习古精灵文开始。那些优美的符文据说蕴含着远古的魔力。",
        "minAge": 5, "maxAge": 9, "weight": 4, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 1}],
        "branches": [
            {"label": "专注练字，追求完美", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]},
            {"label": "用符文画画玩", "effects": [{"type": "modify_attribute", "target": "chr", "value": 1}, {"type": "modify_attribute", "target": "mag", "value": 1}]}
        ]
    },
    {
        "id": "elf_animal_friend", "title": "林间小鹿",
        "description": "一头白色的小鹿走到你面前，毫不畏惧地蹭了蹭你的手心。精灵长辈说这是好兆头。",
        "minAge": 4, "maxAge": 8, "weight": 3, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}]
    },
    # 哥布林童年
    {
        "id": "goblin_trash_treasure", "title": "垃圾堆里的宝物",
        "description": "你在人类城镇的垃圾堆中翻到了一本字迹模糊的书。虽然大部分看不懂，但图画很有趣。",
        "minAge": 3, "maxAge": 8, "weight": 5, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 1}],
        "branches": [
            {"label": "藏起来慢慢研究", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]},
            {"label": "拿去跟同伴换食物", "effects": [{"type": "modify_attribute", "target": "mny", "value": 2}, {"type": "modify_attribute", "target": "chr", "value": 1}]}
        ]
    },
    {
        "id": "goblin_tunnel_race", "title": "地洞竞速",
        "description": "哥布林幼崽们的传统游戏——在地下洞穴里赛跑。谁先到达终点就能多吃一顿虫子。",
        "minAge": 3, "maxAge": 7, "weight": 5, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "str", "value": 1}],
        "branches": [
            {"label": "拼命跑", "effects": [{"type": "modify_attribute", "target": "str", "value": 1}]},
            {"label": "走捷径（作弊）", "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}]}
        ]
    },
    {
        "id": "goblin_survival_lesson", "title": "生存第一课",
        "description": "哥布林的教育很简单——族长把你扔进黑暗的洞穴，让你自己找到出口。",
        "minAge": 4, "maxAge": 7, "weight": 4, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "str", "value": 1}],
        "branches": [
            {"label": "用嗅觉找到出口", "effects": [{"type": "modify_attribute", "target": "int", "value": 1}, {"type": "modify_attribute", "target": "str", "value": 1}]},
            {"label": "大哭，直到有人来救", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}]}
        ]
    },
    {
        "id": "goblin_shiny_collection", "title": "闪亮收藏",
        "description": "你开始收集一切闪闪发光的东西——碎玻璃、铜币、水晶碎片。哥布林天生就对亮晶晶的东西着迷。",
        "minAge": 3, "maxAge": 9, "weight": 4, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "luk", "value": 1}, {"type": "modify_attribute", "target": "mny", "value": 1}]
    },
]

# --- 少年事件 ---
teenager_race_events = [
    # 人类少年
    {
        "id": "human_militia_training", "title": "民兵训练",
        "description": "人类王国要求每个适龄少年参加基础军事训练。虽然枯燥，但你确实变强了。",
        "minAge": 12, "maxAge": 16, "weight": 4, "unique": True, "races": ["human"],
        "effects": [{"type": "modify_attribute", "target": "str", "value": 2}],
        "branches": [
            {"label": "认真训练", "effects": [{"type": "modify_attribute", "target": "str", "value": 2}]},
            {"label": "混日子摸鱼", "effects": [{"type": "modify_attribute", "target": "luk", "value": 1}, {"type": "modify_attribute", "target": "chr", "value": 1}]}
        ]
    },
    {
        "id": "human_trade_fair", "title": "秋季集市",
        "description": "一年一度的大集市！来自各地的商人带来了稀奇古怪的商品。你攒了一些零花钱。",
        "minAge": 11, "maxAge": 16, "weight": 3, "unique": True, "races": ["human"],
        "effects": [],
        "branches": [
            {"label": "买一本冒险故事书", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]},
            {"label": "买一把练习木剑", "effects": [{"type": "modify_attribute", "target": "str", "value": 2}]},
            {"label": "尝试跟商人砍价", "effects": [{"type": "modify_attribute", "target": "chr", "value": 1}, {"type": "modify_attribute", "target": "mny", "value": 1}]}
        ]
    },
    {
        "id": "human_church_blessing", "title": "神殿祈福",
        "description": "人类传统——在成年前去神殿接受祈福仪式。牧师会为你祈求诸神的庇佑。",
        "minAge": 13, "maxAge": 16, "weight": 3, "unique": True, "races": ["human"],
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 1}],
        "branches": [
            {"label": "虔诚地跪下祈祷", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]},
            {"label": "偷偷观察祈福的魔法原理", "effects": [{"type": "modify_attribute", "target": "mag", "value": 1}, {"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    # 精灵少年
    {
        "id": "elf_moonblade_ceremony", "title": "月刃仪式",
        "description": "精灵少年的成长礼——在月圆之夜独自进入古森林，用魔力凝聚一柄月光之刃。",
        "minAge": 14, "maxAge": 20, "weight": 5, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}],
        "branches": [
            {"label": "全力凝聚月光", "effects": [{"type": "modify_attribute", "target": "mag", "value": 3}]},
            {"label": "感悟森林的意志", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    {
        "id": "elf_ancient_ruins", "title": "远古精灵遗迹",
        "description": "你在密林深处发现了一座被藤蔓覆盖的远古精灵塔。里面的壁画记录着失落的魔法。",
        "minAge": 12, "maxAge": 18, "weight": 3, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 2}],
        "branches": [
            {"label": "临摹壁画上的符文", "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}]},
            {"label": "探索塔的更深层", "effects": [{"type": "modify_attribute", "target": "str", "value": 1}, {"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
    {
        "id": "elf_human_encounter", "title": "初遇人类",
        "description": "第一次走出森林，你遇到了一群人类旅行者。他们的寿命如此短暂，却活得热烈而匆忙。",
        "minAge": 13, "maxAge": 20, "weight": 4, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "chr", "value": 1}],
        "branches": [
            {"label": "友善地打招呼", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}]},
            {"label": "默默观察他们的行为", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]}
        ]
    },
    # 哥布林少年
    {
        "id": "goblin_first_theft", "title": "第一次偷窃",
        "description": "为了果腹，你尝试从人类商人的马车上偷取食物。这是哥布林的生存之道。",
        "minAge": 10, "maxAge": 15, "weight": 5, "unique": True, "races": ["goblin"],
        "effects": [],
        "branches": [
            {"label": "小心翼翼地行动", "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}, {"type": "modify_attribute", "target": "mny", "value": 1}]},
            {"label": "大胆冲上去抢", "effects": [{"type": "modify_attribute", "target": "str", "value": 2}]},
            {"label": "放弃，去挖野菜", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]}
        ]
    },
    {
        "id": "goblin_alchemy_discovery", "title": "误入炼金工坊",
        "description": "你钻进一个废弃的房子，发现了满屋子的瓶瓶罐罐。混合一些液体后发生了小爆炸。",
        "minAge": 10, "maxAge": 15, "weight": 4, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 1}],
        "branches": [
            {"label": "继续实验（危险！）", "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]},
            {"label": "把值钱的拿走卖掉", "effects": [{"type": "modify_attribute", "target": "mny", "value": 3}]}
        ]
    },
    {
        "id": "goblin_tribe_challenge", "title": "部落挑战赛",
        "description": "哥布林部落每年举办一次挑战赛——格斗、赛跑、寻宝，获胜者能得到最好的食物配给。",
        "minAge": 11, "maxAge": 16, "weight": 4, "unique": True, "races": ["goblin"],
        "effects": [],
        "branches": [
            {"label": "参加格斗", "effects": [{"type": "modify_attribute", "target": "str", "value": 3}]},
            {"label": "参加寻宝", "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]},
            {"label": "当裁判（动脑子）", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]}
        ]
    },
]

# --- 青年/成年事件 ---
youth_adult_race_events = [
    # 人类青年
    {
        "id": "human_kingdom_draft", "title": "王国征兵令",
        "description": "边境告急，王国下达征兵令。每个适龄人类男子都收到了召集通知。",
        "minAge": 18, "maxAge": 30, "weight": 4, "unique": True, "races": ["human"], "genders": ["male"],
        "effects": [],
        "branches": [
            {"label": "响应号召入伍", "effects": [{"type": "modify_attribute", "target": "str", "value": 3}, {"type": "set_flag", "target": "military_service"}]},
            {"label": "花钱找人顶替", "effects": [{"type": "modify_attribute", "target": "mny", "value": -5}]},
            {"label": "逃入深山避难", "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}]}
        ]
    },
    {
        "id": "human_marriage_proposal", "title": "家族联姻",
        "description": "你的家人安排了一门亲事。对方家庭条件不错，但你们素未谋面。",
        "minAge": 18, "maxAge": 28, "weight": 3, "unique": True, "races": ["human"],
        "effects": [],
        "branches": [
            {"label": "接受安排", "effects": [{"type": "modify_attribute", "target": "chr", "value": 1}, {"type": "modify_attribute", "target": "mny", "value": 3}]},
            {"label": "拒绝，要找自己喜欢的人", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]}
        ]
    },
    {
        "id": "human_tavern_brawl", "title": "酒馆斗殴",
        "description": "人类酒馆里一言不合就开打，这是常有的事。今晚你也被卷入其中。",
        "minAge": 18, "maxAge": 40, "weight": 3, "unique": True, "races": ["human"],
        "effects": [],
        "branches": [
            {"label": "挥拳就上", "effects": [{"type": "modify_attribute", "target": "str", "value": 2}]},
            {"label": "调停双方", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]},
            {"label": "趁乱偷酒喝", "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}]}
        ]
    },
    # 精灵青年
    {
        "id": "elf_century_meditation", "title": "百年冥想",
        "description": "精灵修行的传统——在世界树下进行长达一季的冥想，感悟自然之力的流转。",
        "minAge": 25, "maxAge": 80, "weight": 4, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}],
        "branches": [
            {"label": "专注内心的平静", "effects": [{"type": "modify_attribute", "target": "spr", "value": 3}]},
            {"label": "尝试与自然融合", "effects": [{"type": "modify_attribute", "target": "mag", "value": 3}]}
        ]
    },
    {
        "id": "elf_forbidden_magic_scroll", "title": "禁忌魔法卷轴",
        "description": "在精灵图书馆最深处的封印区，你发现了一卷散发着危险气息的古卷。",
        "minAge": 30, "maxAge": 100, "weight": 3, "unique": True, "races": ["elf"],
        "effects": [],
        "branches": [
            {"label": "打开研读", "effects": [{"type": "modify_attribute", "target": "mag", "value": 4}, {"type": "modify_attribute", "target": "spr", "value": -2}]},
            {"label": "报告长老会", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "chr", "value": 1}]},
            {"label": "重新封印后离开", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]}
        ]
    },
    {
        "id": "elf_mortal_friend", "title": "短命的朋友",
        "description": "你结交的人类朋友已经满头白发，而你依然年轻。精灵的悲伤——注定要目送短寿者离去。",
        "minAge": 40, "maxAge": 120, "weight": 3, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}],
        "branches": [
            {"label": "陪伴朋友最后的时光", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "spr", "value": 1}]},
            {"label": "选择不再与短寿种族交友", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]}
        ]
    },
    {
        "id": "elf_worldtree_guardian", "title": "世界树守护者选拔",
        "description": "精灵族最崇高的荣誉——世界树守护者的名额空出了一位。长老会在年轻一代中挑选候选人。",
        "minAge": 50, "maxAge": 150, "weight": 2, "unique": True, "races": ["elf"],
        "include": "mag >= 40",
        "effects": [],
        "branches": [
            {"label": "接受选拔挑战", "effects": [{"type": "modify_attribute", "target": "mag", "value": 3}, {"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "set_flag", "target": "worldtree_candidate"}]},
            {"label": "谦逊地推辞", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}]}
        ]
    },
    # 哥布林青年/成年
    {
        "id": "goblin_black_market", "title": "黑市交易",
        "description": "哥布林在各个城镇的地下黑市都有自己的关系网。有人找你帮忙倒卖一批来路不明的货物。",
        "minAge": 14, "maxAge": 30, "weight": 4, "unique": True, "races": ["goblin"],
        "effects": [],
        "branches": [
            {"label": "接下生意", "effects": [{"type": "modify_attribute", "target": "mny", "value": 4}, {"type": "modify_attribute", "target": "luk", "value": 1}]},
            {"label": "拒绝，太危险了", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]},
            {"label": "举报给官方换赏金", "effects": [{"type": "modify_attribute", "target": "mny", "value": 2}, {"type": "modify_attribute", "target": "chr", "value": 2}]}
        ]
    },
    {
        "id": "goblin_mechanical_genius", "title": "机关天赋",
        "description": "你用废铁和树枝搭了一个自动捕鼠器，其精巧的设计让一个矮人工匠都刮目相看。",
        "minAge": 13, "maxAge": 25, "weight": 3, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 3}],
        "branches": [
            {"label": "跟矮人学习机械", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}, {"type": "set_flag", "target": "goblin_mechanic"}]},
            {"label": "把机关拿去卖钱", "effects": [{"type": "modify_attribute", "target": "mny", "value": 3}]}
        ]
    },
    {
        "id": "goblin_warchief_duel", "title": "首领争夺战",
        "description": "部落首领年老体衰，按照哥布林的规矩，任何成年哥布林都可以挑战首领之位。",
        "minAge": 15, "maxAge": 30, "weight": 3, "unique": True, "races": ["goblin"],
        "effects": [],
        "branches": [
            {"label": "发起挑战", "effects": [{"type": "modify_attribute", "target": "str", "value": 3}, {"type": "modify_attribute", "target": "chr", "value": 2}]},
            {"label": "支持另一个候选人", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]},
            {"label": "保持中立", "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}]}
        ]
    },
    {
        "id": "goblin_cook_master", "title": "暗黑料理大师",
        "description": "你用各种匪夷所思的食材做出了意外美味的料理。消息传开后，连人类冒险者都慕名而来。",
        "minAge": 14, "maxAge": 25, "weight": 3, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]
    },
]

# --- 中老年种族事件 ---
elder_race_events = [
    # 人类中老年
    {
        "id": "human_grandchildren", "title": "含饴弄孙",
        "description": "孙辈出生了。看着小小的生命，你想起了自己年轻时的模样。",
        "minAge": 45, "maxAge": 70, "weight": 4, "unique": True, "races": ["human"],
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "chr", "value": 1}]
    },
    {
        "id": "human_memoir_writing", "title": "撰写回忆录",
        "description": "你决定把这辈子经历的故事写下来。或许有一天，后人会从中获得启发。",
        "minAge": 50, "maxAge": 75, "weight": 3, "unique": True, "races": ["human"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 2}, {"type": "modify_attribute", "target": "spr", "value": 1}]
    },
    {
        "id": "human_legacy_decision", "title": "遗产安排",
        "description": "人到暮年，该考虑身后事了。你的积蓄应该留给谁？",
        "minAge": 55, "maxAge": 80, "weight": 3, "unique": True, "races": ["human"],
        "effects": [],
        "branches": [
            {"label": "平均分给子女", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]},
            {"label": "捐给神殿", "effects": [{"type": "modify_attribute", "target": "spr", "value": 3}]},
            {"label": "全部留给自己享受", "effects": [{"type": "modify_attribute", "target": "mny", "value": 2}]}
        ]
    },
    # 精灵中老年（精灵寿命200-500岁）
    {
        "id": "elf_memory_garden", "title": "记忆花园",
        "description": "精灵用魔力将珍贵的记忆封存在水晶花中。你的花园已经种满了数百年的回忆。",
        "minAge": 120, "maxAge": 300, "weight": 4, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 3}]
    },
    {
        "id": "elf_last_song", "title": "最后的歌",
        "description": "精灵在感知到终焉将近时，会唱一首歌。这首歌会融入森林，成为永恒的回响。",
        "minAge": 300, "maxAge": 500, "weight": 4, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}, {"type": "modify_attribute", "target": "spr", "value": 3}]
    },
    {
        "id": "elf_teaching_young", "title": "教导下一代",
        "description": "年轻的精灵们围坐在你身边，听你讲述数百年来的见闻。他们的眼中满是崇敬。",
        "minAge": 100, "maxAge": 400, "weight": 3, "unique": True, "races": ["elf"],
        "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "int", "value": 1}]
    },
    # 哥布林中老年（哥布林寿命20-40岁）
    {
        "id": "goblin_elder_wisdom", "title": "老哥布林的智慧",
        "description": "在哥布林部落，能活到这个岁数的都被视为智者。年轻人开始来找你请教问题。",
        "minAge": 22, "maxAge": 35, "weight": 5, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "int", "value": 2}, {"type": "modify_attribute", "target": "chr", "value": 2}]
    },
    {
        "id": "goblin_final_feast", "title": "最后的盛宴",
        "description": "按照哥布林的传统，当一个哥布林觉得自己时日无多时，会为部落举办一场盛大的宴会。",
        "minAge": 28, "maxAge": 40, "weight": 4, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "chr", "value": 3}, {"type": "modify_attribute", "target": "spr", "value": 2}]
    },
    {
        "id": "goblin_treasure_map", "title": "藏宝图",
        "description": "你这辈子收集的所有闪亮物品都埋在了一个秘密地点。你画了一张藏宝图……但只有哥布林才看得懂。",
        "minAge": 25, "maxAge": 38, "weight": 3, "unique": True, "races": ["goblin"],
        "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}, {"type": "modify_attribute", "target": "mny", "value": 2}]
    },
]

# --- 属性条件事件（通用但有条件门槛） ---
conditional_events = [
    # 高魔力触发
    {
        "id": "mana_overflow", "title": "魔力暴走",
        "description": "你体内的魔力突然失控，周围的物体开始无规则地漂浮。必须立刻稳定它。",
        "minAge": 15, "maxAge": 60, "weight": 3, "unique": True,
        "include": "mag >= 35",
        "effects": [],
        "branches": [
            {"label": "冷静控制", "effects": [{"type": "modify_attribute", "target": "mag", "value": 3}, {"type": "modify_attribute", "target": "spr", "value": 1}]},
            {"label": "释放出去", "effects": [{"type": "modify_attribute", "target": "mag", "value": 2}, {"type": "modify_attribute", "target": "str", "value": -1}]}
        ]
    },
    {
        "id": "arcane_academy_invitation", "title": "奥术学院的邀请",
        "description": "大陆最高等的奥术学院注意到了你异常的魔力波动，派人送来了入学邀请函。",
        "minAge": 16, "maxAge": 40, "weight": 2, "unique": True,
        "include": "mag >= 45",
        "effects": [],
        "branches": [
            {"label": "欣然前往", "effects": [{"type": "modify_attribute", "target": "mag", "value": 4}, {"type": "modify_attribute", "target": "int", "value": 2}, {"type": "set_flag", "target": "arcane_student"}]},
            {"label": "谢绝，自学成才", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "mag", "value": 1}]}
        ]
    },
    # 高武力触发
    {
        "id": "arena_champion_invite", "title": "竞技场的邀请",
        "description": "你的实力被竞技场主办方注意到了，邀请你参加本年度的王国武斗大会。",
        "minAge": 18, "maxAge": 50, "weight": 3, "unique": True,
        "include": "str >= 35",
        "effects": [],
        "branches": [
            {"label": "参加比赛", "effects": [{"type": "modify_attribute", "target": "str", "value": 3}, {"type": "modify_attribute", "target": "chr", "value": 2}]},
            {"label": "拒绝，低调行事", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}]}
        ]
    },
    {
        "id": "mountain_bandit_leader", "title": "山贼头子的挑战",
        "description": "恶名昭彰的山贼头子听闻你的武力，特地下山来找你单挑。",
        "minAge": 20, "maxAge": 45, "weight": 2, "unique": True,
        "include": "str >= 40",
        "effects": [],
        "branches": [
            {"label": "接受挑战", "effects": [{"type": "modify_attribute", "target": "str", "value": 3}],
             "diceCheck": {"attribute": "str", "dc": 12, "successEffects": [{"type": "modify_attribute", "target": "chr", "value": 3}], "failEffects": [{"type": "modify_attribute", "target": "str", "value": -2}]}},
            {"label": "设个圈套", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}, {"type": "modify_attribute", "target": "luk", "value": 1}]}
        ]
    },
    # 高智力触发
    {
        "id": "cryptic_manuscript", "title": "神秘手稿",
        "description": "一位垂死的旅人将一本密文手稿交给了你。上面的文字似乎记录着某种远古知识。",
        "minAge": 16, "maxAge": 60, "weight": 3, "unique": True,
        "include": "int >= 30",
        "effects": [],
        "branches": [
            {"label": "花时间破译", "effects": [{"type": "modify_attribute", "target": "int", "value": 3}, {"type": "modify_attribute", "target": "mag", "value": 1}]},
            {"label": "卖给古董商", "effects": [{"type": "modify_attribute", "target": "mny", "value": 4}]},
            {"label": "交给图书馆", "effects": [{"type": "modify_attribute", "target": "chr", "value": 2}, {"type": "modify_attribute", "target": "spr", "value": 1}]}
        ]
    },
    # 高运气触发
    {
        "id": "rainbow_mushroom", "title": "七彩蘑菇",
        "description": "你在地上捡到一颗发光的七彩蘑菇。传说中，这种蘑菇百年才出现一次。",
        "minAge": 10, "maxAge": 80, "weight": 2, "unique": True,
        "include": "luk >= 30",
        "effects": [],
        "branches": [
            {"label": "吃掉它", "effects": [{"type": "modify_attribute", "target": "luk", "value": 3}, {"type": "modify_attribute", "target": "mag", "value": 2}]},
            {"label": "拿去卖个好价", "effects": [{"type": "modify_attribute", "target": "mny", "value": 5}]},
            {"label": "种在花盆里", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "chr", "value": 1}]}
        ]
    },
    {
        "id": "lucky_coin_found", "title": "幸运金币",
        "description": "路边闪闪发光的东西吸引了你的注意。竟然是一枚刻着古老符文的金币。",
        "minAge": 8, "maxAge": 70, "weight": 2, "unique": True,
        "include": "luk >= 25",
        "effects": [{"type": "modify_attribute", "target": "luk", "value": 2}, {"type": "modify_attribute", "target": "mny", "value": 1}]
    },
    # 高魅力触发
    {
        "id": "noble_admirer", "title": "贵族的追慕",
        "description": "一位来访的贵族对你的风采赞叹不已，邀请你出席下月的皇家舞会。",
        "minAge": 18, "maxAge": 50, "weight": 2, "unique": True,
        "include": "chr >= 35",
        "effects": [],
        "branches": [
            {"label": "盛装出席", "effects": [{"type": "modify_attribute", "target": "chr", "value": 3}, {"type": "modify_attribute", "target": "mny", "value": 2}]},
            {"label": "礼貌地推辞", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}]}
        ]
    },
    # 高精神力触发
    {
        "id": "divine_vision", "title": "神谕",
        "description": "梦中，一个模糊的声音向你传达了某种信息。醒来后你记得每一个字。",
        "minAge": 20, "maxAge": 80, "weight": 2, "unique": True,
        "include": "spr >= 35",
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}],
        "branches": [
            {"label": "遵循神谕行事", "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "luk", "value": 1}]},
            {"label": "记录下来慢慢研究", "effects": [{"type": "modify_attribute", "target": "int", "value": 2}, {"type": "modify_attribute", "target": "mag", "value": 1}]}
        ]
    },
    # 低属性触发
    {
        "id": "kindness_of_stranger", "title": "陌生人的善意",
        "description": "在你最困难的时候，一个素不相识的旅人分享了他的面包和水。世上还是好人多。",
        "minAge": 10, "maxAge": 60, "weight": 3, "unique": True,
        "include": "mny <= 5",
        "effects": [{"type": "modify_attribute", "target": "spr", "value": 2}, {"type": "modify_attribute", "target": "mny", "value": 2}]
    },
    {
        "id": "hidden_potential", "title": "隐藏的潜能",
        "description": "在一次意外的危机中，你的身体爆发出了意想不到的力量。也许你的极限还远未到来。",
        "minAge": 14, "maxAge": 40, "weight": 2, "unique": True,
        "include": "str <= 10",
        "effects": [{"type": "modify_attribute", "target": "str", "value": 5}]
    },
]

# 注入到对应的事件文件
def inject_events(filename, new_events):
    events = load_events(filename)
    existing_ids = {e["id"] for e in events}
    added = 0
    for ne in new_events:
        if ne["id"] not in existing_ids:
            events.append(ne)
            added += 1
    if added > 0:
        save_events(filename, events)
        print(f"  {filename}: 新增 {added} 个事件")
    return added

total_added = 0
total_added += inject_events("childhood.json", childhood_race_events)
total_added += inject_events("teenager.json", teenager_race_events)
total_added += inject_events("youth.json", [e for e in youth_adult_race_events if e.get("minAge", 0) < 25])
total_added += inject_events("adult.json", [e for e in youth_adult_race_events if e.get("minAge", 0) >= 25])
total_added += inject_events("middle-age.json", [e for e in elder_race_events if e.get("minAge", 0) < 60])
total_added += inject_events("elder.json", [e for e in elder_race_events if e.get("minAge", 0) >= 60])

# 属性条件事件按年龄段分配
for ce in conditional_events:
    mn = ce.get("minAge", 0)
    if mn < 12:
        total_added += inject_events("childhood.json", [ce])
    elif mn < 18:
        total_added += inject_events("teenager.json", [ce])
    elif mn < 25:
        total_added += inject_events("youth.json", [ce])
    elif mn < 45:
        total_added += inject_events("adult.json", [ce])
    elif mn < 65:
        total_added += inject_events("middle-age.json", [ce])
    else:
        total_added += inject_events("elder.json", [ce])

print()
print(f"=== 总计新增 {total_added} 个事件 ===")

# ========== 阶段3: 最终统计 ==========
print()
print("=== 最终统计 ===")
total = 0
race_count = {"human": 0, "elf": 0, "goblin": 0}
cond_count = 0
for fn in sorted(os.listdir(EVENT_DIR)):
    if not fn.endswith(".json"):
        continue
    evts = load_events(fn)
    total += len(evts)
    for e in evts:
        for r in (e.get("races") or []):
            if r in race_count:
                race_count[r] += 1
        if e.get("include"):
            cond_count += 1

print(f"总事件数: {total}")
for r, c in race_count.items():
    print(f"  {r}专属: {c}")
print(f"  有条件门槛: {cond_count}")
