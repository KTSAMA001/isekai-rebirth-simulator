#!/usr/bin/env python3
"""Phase C7: 创建种族专属事件
每个可选种族各3-4个专属事件，通过 races 字段限制触发，
覆盖童年/青年/成年/晚年各阶段，让种族体验有明显差异。
"""
import json

EVENT_DIR = 'data/sword-and-magic/events'

# === 精灵专属事件 ===
ELF_EVENTS = [
    {
        "id": "elf_world_tree_pilgrimage",
        "title": "世界树巡礼",
        "description": "按照精灵族的传统，每个精灵在幼年时都要前往世界树之根进行巡礼。古老的树根在地底延伸数百里，散发着温暖的金色光芒。你伸出手触摸树根，感受到了来自远古的回应。",
        "minAge": 5,
        "maxAge": 10,
        "weight": 6,
        "unique": True,
        "races": ["elf"],
        "effects": [
            {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2（世界树的馈赠）"},
            {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
            {"type": "set_flag", "target": "world_tree_blessed", "value": 1}
        ],
        "branches": [
            {
                "id": "listen_to_tree",
                "title": "静心聆听世界树的声音",
                "description": "你闭上眼睛，用精灵的天赋感知世界树的低语。",
                "probability": 0.4,
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（聆听古老的智慧）"},
                    {"type": "modify_attribute", "target": "mag", "value": 1, "description": "魔力 +1"}
                ]
            },
            {
                "id": "absorb_mana",
                "title": "尝试吸收世界树的魔力",
                "description": "你大胆地尝试从树根中引导魔力进入自己的身体。",
                "probability": 0.35,
                "diceCheck": {
                    "attribute": "mag",
                    "dc": 12,
                    "description": "魔力判定 DC12 — 你需要足够的天赋来承受世界树的力量"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "mag", "value": 4, "description": "魔力 +4（世界树之力涌入）"},
                    {"type": "modify_hp", "target": "hp", "value": -10, "description": "HP -10（魔力冲击）"},
                    {"type": "set_flag", "target": "world_tree_empowered", "value": 1}
                ],
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -20, "description": "HP -20（魔力反噬）"},
                    {"type": "modify_attribute", "target": "mag", "value": 1, "description": "魔力 +1（即便失败也有微弱收获）"}
                ],
                "successText": "世界树的力量如潮水般涌入你的身体，你感到自己与整片森林融为一体。虽然身体承受了巨大的冲击，但你的魔力得到了质的飞跃。",
                "failureText": "过于庞大的魔力将你弹飞了出去。你躺在地上大口喘气，鼻血流了一地。树根上传来一阵低沉的嗡鸣，像是在轻声责备你的贪心。"
            },
            {
                "id": "plant_seed",
                "title": "在树根旁种下一颗种子",
                "description": "你从口袋里掏出一颗橡果，虔诚地种在世界树根旁。",
                "probability": 0.25,
                "effects": [
                    {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（世界树认可了你的虔诚）"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
                    {"type": "set_flag", "target": "planted_seed_at_tree", "value": 1}
                ]
            }
        ]
    },
    {
        "id": "elf_longevity_burden",
        "title": "不老之痛",
        "description": "你的人类朋友已经两鬓斑白，而你的容貌还和几十年前一样年轻。你不得不再次目送一个短寿的朋友走向生命的尽头。精灵的长寿是祝福，也是诅咒。",
        "minAge": 40,
        "maxAge": 80,
        "weight": 5,
        "unique": True,
        "races": ["elf"],
        "effects": [
            {"type": "modify_attribute", "target": "spr", "value": -1, "description": "灵魂 -1（离别之痛）"}
        ],
        "branches": [
            {
                "id": "accept_fate",
                "title": "接受这就是精灵的命运",
                "description": "你在墓前放下一束花，平静地告别。你已经学会了与离别共处。",
                "probability": 0.5,
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 3, "description": "灵魂 +3（释然）"},
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（生死的领悟）"}
                ]
            },
            {
                "id": "retreat_to_forest",
                "title": "回到精灵的森林，不再与短寿种族来往",
                "description": "你决定减少与人类接触，回到同族之中。也许这样就不会再痛了。",
                "probability": 0.3,
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（内心平静）"},
                    {"type": "modify_attribute", "target": "chr", "value": -2, "description": "魅力 -2（与世隔绝）"},
                    {"type": "set_flag", "target": "elf_reclusive", "value": 1}
                ]
            },
            {
                "id": "cherish_more",
                "title": "更加珍惜与短寿者的每一天",
                "description": "正因为时间有限，才更要珍惜。你决定用百年的时光，认真铭记每一个短暂的相遇。",
                "probability": 0.2,
                "effects": [
                    {"type": "modify_attribute", "target": "chr", "value": 3, "description": "魅力 +3（对生命的热忱）"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
                    {"type": "modify_attribute", "target": "str", "value": -1, "description": "体魄 -1（情感消耗）"}
                ]
            }
        ]
    },
    {
        "id": "elf_ancient_magic",
        "title": "精灵秘术·星辰之歌",
        "description": "你在精灵图书馆的最深处发现了一卷尘封千年的魔法卷轴。上面记载着一种只有精灵才能施展的秘术——通过歌唱引导星辰之力。这是精灵文明最辉煌时代的遗产。",
        "minAge": 20,
        "maxAge": 50,
        "weight": 3,
        "unique": True,
        "races": ["elf"],
        "include": "attribute.mag >= 12 & attribute.int >= 10",
        "effects": [],
        "branches": [
            {
                "id": "learn_song",
                "title": "花费数年学习星辰之歌",
                "description": "你全身心投入到古老咒文的研究中。精灵语的每一个音节都蕴含着宇宙的秘密。",
                "probability": 0.4,
                "diceCheck": {
                    "attribute": "mag",
                    "dc": 15,
                    "description": "魔力判定 DC15 — 星辰之歌要求极高的魔法天赋"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "mag", "value": 5, "description": "魔力 +5（掌握星辰秘术）"},
                    {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2"},
                    {"type": "set_flag", "target": "star_song_master", "value": 1}
                ],
                "failureEffects": [
                    {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2（虽未完全掌握但有所领悟）"},
                    {"type": "modify_attribute", "target": "spr", "value": -1, "description": "灵魂 -1（挫折感）"}
                ],
                "successText": "经过漫长的修行，你终于唱出了完整的星辰之歌。夜空中的星辰随你的歌声闪烁，仿佛在回应一位失散已久的朋友。",
                "failureText": "你在最关键的升调处失败了。星辰之力失控，将你的书房炸了个窟窿。看来你还需要更多的修行。"
            },
            {
                "id": "share_knowledge",
                "title": "将卷轴交给精灵长老会保管",
                "description": "这样的宝物不应该由一个人独占。你将卷轴交给了长老会，换取了他们的认可和感激。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "chr", "value": 3, "description": "魅力 +3（精灵社会的认可）"},
                    {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2（长老的教导）"},
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1"}
                ]
            },
            {
                "id": "sell_scroll",
                "title": "将卷轴卖给学术收藏家",
                "description": "这卷轴在收藏家市场上价值连城。实用主义有时候也是一种智慧。",
                "probability": 0.25,
                "effects": [
                    {"type": "modify_attribute", "target": "mny", "value": 5, "description": "家境 +5（天价拍卖）"},
                    {"type": "modify_attribute", "target": "chr", "value": -2, "description": "魅力 -2（精灵同胞的失望）"}
                ]
            }
        ]
    },
    {
        "id": "elf_fading_forest",
        "title": "枯萎的森林",
        "description": "你感应到了一个令人不安的信号——家乡附近的古老森林正在枯萎。世界树的力量似乎在减弱，精灵赖以生存的魔法生态系统开始崩溃。",
        "minAge": 25,
        "maxAge": 60,
        "weight": 3,
        "unique": True,
        "races": ["elf"],
        "include": "attribute.spr >= 8",
        "effects": [
            {"type": "modify_attribute", "target": "spr", "value": -1, "description": "灵魂 -1（森林的悲鸣）"}
        ],
        "branches": [
            {
                "id": "heal_forest",
                "title": "尝试用魔法治愈森林",
                "description": "你跪在枯萎的大树前，将自己的魔力注入大地。",
                "probability": 0.4,
                "diceCheck": {
                    "attribute": "mag",
                    "dc": 14,
                    "description": "魔力判定 DC14 — 需要强大的自然魔法来逆转枯萎"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 4, "description": "灵魂 +4（森林的感激）"},
                    {"type": "modify_attribute", "target": "mag", "value": 1, "description": "魔力 +1"},
                    {"type": "modify_hp", "target": "hp", "value": -15, "description": "HP -15（魔力透支）"},
                    {"type": "set_flag", "target": "forest_healer", "value": 1}
                ],
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -10, "description": "HP -10"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（至少你尝试了）"}
                ],
                "successText": "你的魔力化作温暖的绿光渗入大地。枯萎的树枝重新抽出嫩芽，花朵在你的脚边次第开放。你筋疲力尽地瘫倒在草地上，但嘴角带着微笑。",
                "failureText": "你的魔力不足以对抗这种程度的枯萎。森林继续衰败，你只能无助地看着。但你的付出被其他精灵看到了。"
            },
            {
                "id": "seek_cause",
                "title": "调查枯萎的原因",
                "description": "治标不如治本。你决定深入调查森林枯萎的根本原因。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 3, "description": "智慧 +3（深入调查）"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
                    {"type": "set_flag", "target": "forest_investigator", "value": 1}
                ]
            },
            {
                "id": "migrate_elsewhere",
                "title": "带领族人迁移到新的森林",
                "description": "也许该接受现实——这片森林已经无法挽救了。",
                "probability": 0.25,
                "effects": [
                    {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（领袖气质）"},
                    {"type": "modify_attribute", "target": "mny", "value": -2, "description": "家境 -2（迁移的代价）"},
                    {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（新的开始）"}
                ]
            }
        ]
    }
]

# === 哥布林专属事件 ===
GOBLIN_EVENTS = [
    {
        "id": "goblin_scavenger_instinct",
        "title": "天生的寻宝者",
        "description": "你在垃圾堆里翻找时，本能地被一个角落吸引了。其他哥布林都说那里没什么好东西，但你的直觉从来不会骗你。你扒开一层层废品，发现了一个闪闪发光的东西。",
        "minAge": 3,
        "maxAge": 8,
        "weight": 6,
        "unique": True,
        "races": ["goblin"],
        "effects": [],
        "branches": [
            {
                "id": "magic_trinket",
                "title": "一枚残破的魔法饰物",
                "description": "那是一枚被丢弃的魔法护符，虽然已经破损，但还残留着微弱的魔力。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2（魔法护符的残留力量）"},
                    {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1（好眼光！）"}
                ]
            },
            {
                "id": "gold_coins",
                "title": "一小袋被遗忘的金币",
                "description": "居然是真金！在这种地方找到金币，你的运气真是没话说。",
                "probability": 0.4,
                "effects": [
                    {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3（意外之财）"},
                    {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1"}
                ]
            },
            {
                "id": "cursed_item",
                "title": "一个奇怪的黑色盒子",
                "description": "盒子上刻满了你看不懂的符文，打开它可能会有好事，也可能……",
                "probability": 0.25,
                "diceCheck": {
                    "attribute": "luk",
                    "dc": 12,
                    "description": "幸运判定 DC12 — 让我们看看你的运气"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "mag", "value": 3, "description": "魔力 +3"},
                    {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2"},
                    {"type": "modify_attribute", "target": "luk", "value": 2, "description": "幸运 +2（混沌的祝福）"}
                ],
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -15, "description": "HP -15（诅咒爆发）"},
                    {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1（虽然炸了但你还活着，这本身就是幸运）"}
                ],
                "successText": "盒子打开后释放出一道彩色的光芒。里面居然是一本古老的魔法入门书——虽然是给人类小孩看的，但对哥布林来说已经是宝贝了。",
                "failureText": "盒子爆炸了。你被硫磺味的烟雾熏得直咳嗽，头发都烧焦了。但你还活着——哥布林的生命力不是盖的。"
            }
        ]
    },
    {
        "id": "goblin_underground_race",
        "title": "地下竞速赛",
        "description": "哥布林社区每年最盛大的活动——地下竞速赛！参赛者骑着各种改装的矿车在废弃矿道中疯狂飞驰。奖品是一大袋闪闪发光的零件和一整年的'冠军'头衔。",
        "minAge": 8,
        "maxAge": 20,
        "weight": 4,
        "unique": True,
        "races": ["goblin"],
        "effects": [],
        "branches": [
            {
                "id": "race_smart",
                "title": "用智慧取胜——走近路",
                "description": "你提前侦察了矿道，发现了一条没人知道的捷径。",
                "probability": 0.35,
                "diceCheck": {
                    "attribute": "int",
                    "dc": 12,
                    "description": "智慧判定 DC12 — 需要精确计算最优路线"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2（策略取胜）"},
                    {"type": "modify_attribute", "target": "mny", "value": 2, "description": "家境 +2（奖品）"},
                    {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1（冠军光环）"}
                ],
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -10, "description": "HP -10（捷径塌了）"},
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（下次勘察得更仔细）"}
                ],
                "successText": "你的矿车从一条隐藏的通道里冲出，直接到达了终点！观众们目瞪口呆。虽然有人抗议你作弊，但哥布林的规则很简单：谁先到就是赢家。",
                "failureText": "捷径坍塌了！你和矿车一起摔进了一个泥坑。等你爬出来时，比赛已经结束了。"
            },
            {
                "id": "race_lucky",
                "title": "靠运气——闭眼冲！",
                "description": "哥布林不需要计划，只需要运气。你闭上眼睛猛踩油门。",
                "probability": 0.35,
                "diceCheck": {
                    "attribute": "luk",
                    "dc": 11,
                    "description": "幸运判定 DC11 — 纯粹靠命"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "luk", "value": 2, "description": "幸运 +2"},
                    {"type": "modify_attribute", "target": "mny", "value": 2, "description": "家境 +2（奖品）"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（肾上腺素）"}
                ],
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -15, "description": "HP -15（撞墙了）"},
                    {"type": "modify_attribute", "target": "str", "value": 1, "description": "体魄 +1（哥布林越摔越耐摔）"}
                ],
                "successText": "你的矿车在最后一个弯道神奇地避开了所有障碍物，以不可思议的速度冲过终点线。这就是哥布林的运气！",
                "failureText": "你的矿车一头撞进了墙壁。你从废墟中爬出来，吐出一颗牙齿，朝围观的同族竖起大拇指：'没事！'"
            },
            {
                "id": "race_cheat",
                "title": "做手脚——给其他人的矿车动点小机关",
                "description": "真正的哥布林从不公平竞争。你提前给几个对手的矿车轮子上涂了滑油。",
                "probability": 0.3,
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（鬼点子多）"},
                    {"type": "modify_attribute", "target": "mny", "value": 2, "description": "家境 +2（奖品）"},
                    {"type": "modify_attribute", "target": "chr", "value": -1, "description": "魅力 -1（被人嫌弃）"},
                    {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1"}
                ]
            }
        ]
    },
    {
        "id": "goblin_trade_empire",
        "title": "哥布林的黑市王国",
        "description": "你在下水道的某个角落建立了一个小型贸易站。从偷来的面包到捡来的魔法残片，你什么都卖。生意越做越大，连人类的商人都开始秘密找你进货了。",
        "minAge": 15,
        "maxAge": 30,
        "weight": 4,
        "unique": True,
        "races": ["goblin"],
        "include": "attribute.int >= 6",
        "effects": [],
        "branches": [
            {
                "id": "expand_business",
                "title": "扩大经营——开设地下拍卖行",
                "description": "下水道的空间不够了。你决定把贸易站升级成地下拍卖行，进军高端市场。",
                "probability": 0.35,
                "diceCheck": {
                    "attribute": "int",
                    "dc": 13,
                    "description": "智慧判定 DC13 — 需要精明的商业头脑"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "mny", "value": 5, "description": "家境 +5（生意兴隆）"},
                    {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（商业声望）"},
                    {"type": "set_flag", "target": "goblin_merchant_king", "value": 1}
                ],
                "failureEffects": [
                    {"type": "modify_attribute", "target": "mny", "value": 1, "description": "家境 +1（小赚一笔）"},
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（经验教训）"}
                ],
                "successText": "你的地下拍卖行成了整个城市最隐秘也最繁忙的交易场所。从贵族到盗贼，人人都知道：要找稀有货，就去找那个哥布林。",
                "failureText": "拍卖行的第一场拍卖就出了岔子——你把一件赝品当真品卖了。虽然退了钱，但名声受到了打击。不过你很快就东山再起了。"
            },
            {
                "id": "go_legit",
                "title": "洗白——合法注册一家贸易公司",
                "description": "你受够了被人追着跑的日子。也许是时候把生意搬到地上了。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3"},
                    {"type": "modify_attribute", "target": "chr", "value": 3, "description": "魅力 +3（合法商人的尊严）"},
                    {"type": "modify_attribute", "target": "luk", "value": -1, "description": "幸运 -1（守规矩的哥布林少了几分运气）"}
                ]
            },
            {
                "id": "info_broker",
                "title": "转型成情报商人",
                "description": "货物有价，信息无价。通过你的贸易网络，你可以接触到各种秘密。",
                "probability": 0.3,
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 3, "description": "智慧 +3（信息就是力量）"},
                    {"type": "modify_attribute", "target": "mny", "value": 2, "description": "家境 +2"},
                    {"type": "modify_attribute", "target": "str", "value": -1, "description": "体魄 -1（坐办公室太久）"},
                    {"type": "set_flag", "target": "info_broker", "value": 1}
                ]
            }
        ]
    },
    {
        "id": "goblin_elder_legend",
        "title": "传说中的老哥布林",
        "description": "你已经活到了哥布林族群中极为罕见的高龄。年轻的哥布林们围在你身边，用崇拜的目光看着你——在他们眼中，你就是活着的传说。一个活过30岁的哥布林，本身就是最伟大的冒险故事。",
        "minAge": 28,
        "maxAge": 40,
        "weight": 5,
        "unique": True,
        "races": ["goblin"],
        "effects": [
            {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（传说人物）"}
        ],
        "branches": [
            {
                "id": "share_wisdom",
                "title": "传授你的生存智慧",
                "description": "你开始给年轻哥布林讲述你的人生经验。如何在危险中生存，如何用小聪明化解大问题。",
                "probability": 0.4,
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2（教学相长）"},
                    {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（受人尊敬）"},
                    {"type": "set_flag", "target": "goblin_sage", "value": 1}
                ]
            },
            {
                "id": "one_last_gamble",
                "title": "人生最后一把大赌——去做你一直想做的事",
                "description": "哥布林的人生就该以一场疯狂结尾。你决定用剩下的时间做一件惊天动地的事。",
                "probability": 0.35,
                "diceCheck": {
                    "attribute": "luk",
                    "dc": 13,
                    "description": "幸运判定 DC13 — 最后的豪赌"
                },
                "effects": [
                    {"type": "modify_attribute", "target": "luk", "value": 3, "description": "幸运 +3"},
                    {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3"},
                    {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（无悔的人生）"}
                ],
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -20, "description": "HP -20（代价惨重）"},
                    {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（至少不后悔）"}
                ],
                "successText": "你成功了！具体做了什么不重要，重要的是你向全世界证明了：一个哥布林也能做到看似不可能的事。",
                "failureText": "你失败了，还差点把命搭上。但你躺在病床上大笑——这就是哥布林该有的活法。"
            },
            {
                "id": "peaceful_sunset",
                "title": "在夕阳下安静地喝一杯",
                "description": "不需要轰轰烈烈。你找了个能看到夕阳的屋顶，打开一瓶偷来的好酒，静静地看着天空变红。",
                "probability": 0.25,
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 4, "description": "灵魂 +4（平静的幸福）"},
                    {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1（岁月的沉淀）"}
                ]
            }
        ]
    }
]

# === 人类专属事件 ===
HUMAN_EVENTS = [
    {
        "id": "human_ambition_awakens",
        "title": "野心觉醒",
        "description": "你从小就知道人类的寿命不长——最多百年。但也许正因为如此，你心中燃烧着一团不愿熄灭的火焰。你不甘于平凡，你想要在有限的生命中留下印记。",
        "minAge": 12,
        "maxAge": 18,
        "weight": 5,
        "unique": True,
        "races": ["human"],
        "effects": [],
        "branches": [
            {
                "id": "seek_power",
                "title": "追求力量——成为最强的战士",
                "description": "你决定锻炼自己的身体，用拳头和剑来开辟自己的道路。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "str", "value": 3, "description": "体魄 +3（努力锻炼）"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（坚定的意志）"},
                    {"type": "modify_attribute", "target": "int", "value": -1, "description": "智慧 -1（把时间花在了训练上）"}
                ]
            },
            {
                "id": "seek_knowledge",
                "title": "追求知识——成为最博学的学者",
                "description": "精灵有几百年来学习，而你只有几十年。那就用十倍的努力来弥补吧。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 3, "description": "智慧 +3（拼命学习）"},
                    {"type": "modify_attribute", "target": "mag", "value": 1, "description": "魔力 +1（知识带来的灵感）"},
                    {"type": "modify_attribute", "target": "str", "value": -1, "description": "体魄 -1（整天泡在图书馆）"}
                ]
            },
            {
                "id": "seek_wealth",
                "title": "追求财富——成为最富有的人",
                "description": "金钱可以买到时间、安全和影响力。你决定先从赚钱开始。",
                "probability": 0.3,
                "effects": [
                    {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3"},
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（商业头脑）"},
                    {"type": "modify_attribute", "target": "spr", "value": -1, "description": "灵魂 -1（铜臭气）"}
                ]
            }
        ]
    },
    {
        "id": "human_diplomacy",
        "title": "种族外交官",
        "description": "作为数量最多、分布最广的种族，人类天生就擅长与各种族打交道。你被推举为社区的种族联络人，负责调解人类与其他种族之间的纠纷。",
        "minAge": 20,
        "maxAge": 40,
        "weight": 3,
        "unique": True,
        "races": ["human"],
        "include": "attribute.chr >= 8",
        "effects": [],
        "branches": [
            {
                "id": "bridge_builder",
                "title": "成为精灵与人类之间的桥梁",
                "description": "你努力促进两个种族之间的理解。这不是一份轻松的工作。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "chr", "value": 3, "description": "魅力 +3（外交家的气质）"},
                    {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2（跨文化理解）"},
                    {"type": "set_flag", "target": "diplomat", "value": 1}
                ]
            },
            {
                "id": "human_first",
                "title": "优先保护人类利益",
                "description": "虽然口口声声说公平，但你暗中总是偏向人类一方。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3（人族感恩）"},
                    {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1"},
                    {"type": "modify_attribute", "target": "spr", "value": -2, "description": "灵魂 -2（良心不安）"}
                ]
            },
            {
                "id": "quit_politics",
                "title": "发现政治太黑暗，退出",
                "description": "种族之间的矛盾远比你想象的深。你决定回归平民生活。",
                "probability": 0.3,
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（清静）"},
                    {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（看透本质）"},
                    {"type": "modify_attribute", "target": "chr", "value": -1, "description": "魅力 -1（退出公众视野）"}
                ]
            }
        ]
    },
    {
        "id": "human_legacy_building",
        "title": "留给后世的遗产",
        "description": "人类的寿命虽短，但人类文明的传承从未中断。你开始思考：你想给后来的人留下什么？一座建筑？一本书？一个故事？还是一个更好的世界？",
        "minAge": 35,
        "maxAge": 55,
        "weight": 4,
        "unique": True,
        "races": ["human"],
        "include": "attribute.int >= 8",
        "effects": [],
        "branches": [
            {
                "id": "build_school",
                "title": "建造一所学校",
                "description": "知识是最好的遗产。你投入积蓄建造了一所面向所有种族的学校。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "chr", "value": 3, "description": "魅力 +3（教育家）"},
                    {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2"},
                    {"type": "modify_attribute", "target": "mny", "value": -2, "description": "家境 -2（办学投入）"},
                    {"type": "set_flag", "target": "school_founder", "value": 1}
                ]
            },
            {
                "id": "write_history",
                "title": "编纂一部种族通史",
                "description": "你决定记录下这片大陆所有种族的历史和文化，让后人理解彼此。",
                "probability": 0.35,
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 4, "description": "智慧 +4（博古通今）"},
                    {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
                    {"type": "modify_attribute", "target": "str", "value": -1, "description": "体魄 -1（伏案工作）"}
                ]
            },
            {
                "id": "plant_garden",
                "title": "种一片任何人都能来的花园",
                "description": "不需要宏伟的遗产。一片美丽的花园，就够了。",
                "probability": 0.3,
                "effects": [
                    {"type": "modify_attribute", "target": "spr", "value": 3, "description": "灵魂 +3（内心平静）"},
                    {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（花园的守护者）"}
                ]
            }
        ]
    }
]

def add_events_to_file(filepath, new_events):
    """将新事件追加到已有事件文件"""
    with open(fp, 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    existing_ids = {e['id'] for e in events}
    added = 0
    for evt in new_events:
        if evt['id'] not in existing_ids:
            events.append(evt)
            added += 1
            print(f"  [+] {os.path.basename(filepath)}: {evt['id']} (age {evt['minAge']}-{evt['maxAge']})")
    
    if added > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)
    
    return added

# 按年龄段分配到合适的文件
import os

def get_target_file(event):
    """根据年龄范围确定归属文件"""
    min_age = event['minAge']
    if min_age <= 2:
        return 'birth.json'
    elif min_age <= 6:
        return 'childhood.json'
    elif min_age <= 14:
        return 'youth.json'
    elif min_age <= 20:
        return 'teenager.json'
    elif min_age <= 55:
        return 'adult.json'
    else:
        return 'elder.json'

# 汇总所有新事件
all_new_events = ELF_EVENTS + GOBLIN_EVENTS + HUMAN_EVENTS

# 按目标文件分组
from collections import defaultdict
file_groups = defaultdict(list)
for evt in all_new_events:
    target = get_target_file(evt)
    file_groups[target].append(evt)

# 写入
total_added = 0
for fn, evts in sorted(file_groups.items()):
    fp = os.path.join(EVENT_DIR, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    existing_ids = {e['id'] for e in events}
    added = 0
    for evt in evts:
        if evt['id'] not in existing_ids:
            events.append(evt)
            added += 1
            total_added += 1
            print(f"  [+] {fn}: {evt['id']} (age {evt['minAge']}-{evt['maxAge']})")
    
    if added > 0:
        with open(fp, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)

print(f"\n共添加 {total_added} 个种族专属事件（精灵 {len(ELF_EVENTS)}, 哥布林 {len(GOBLIN_EVENTS)}, 人类 {len(HUMAN_EVENTS)}）")
