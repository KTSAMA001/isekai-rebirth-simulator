#!/usr/bin/env python3
"""Phase C6: 为现有事件添加性别变体（genderVariants）
策略：恋爱、婚姻、社交类事件中性别影响叙事文本的部分。
      仅覆盖 title/description，不改变机制。
"""
import json, os

EVENT_DIR = 'data/sword-and-magic/events'

# 性别变体定义：eventId -> { gender: { title?, description? } }
GENDER_VARIANTS = {
    # === 恋爱/婚姻 ===
    "first_love": {
        "male": {
            "description": "你注意到一个女孩经常出现在你的视线中。她的笑容让你莫名心跳加速，你开始不自觉地整理自己的衣着。少年的初恋，笨拙而真挚。"
        },
        "female": {
            "description": "你注意到一个少年经常在你身旁逗留。每次四目相对时他都会慌张地别过头去。你心中涌起一种奇妙的悸动，像是春天第一朵花悄悄绽放。"
        }
    },
    "love_at_first_sight": {
        "male": {
            "description": "你在人群中看到了她。时间仿佛停止了——嘈杂的市集变得寂静，你的世界里只剩下她的身影。你鼓起勇气走上前去，嗓子却干涩得说不出话。"
        },
        "female": {
            "description": "你在人群中与一双炽热的目光相遇。那个人正朝你走来，嘴唇微动却说不出话。你感觉心跳漏了一拍，面颊不自觉地烫了起来。"
        }
    },
    "marry_noble": {
        "male": {
            "title": "迎娶贵族",
            "description": "你终于有资格迎娶贵族家的千金了。婚礼上宾客如云，你穿着崭新的礼服站在祭坛前，既紧张又兴奋。从今以后，你将扛起两个家族的责任。"
        },
        "female": {
            "title": "嫁入名门",
            "description": "你将嫁入一个声名显赫的贵族家庭。精致的婚纱衬托着你的容貌，宾客们投来艳羡的目光。你在祭坛前深呼一口气——新的人生即将开始。"
        }
    },
    "marriage_proposal": {
        "male": {
            "description": "你攥着那枚攒了很久才买到的戒指，掌心已经被汗水浸湿。月光下，你单膝跪地，用颤抖的声音说出了那四个字：'嫁给我吧。'"
        },
        "female": {
            "description": "他突然在你面前单膝跪下，掏出一枚闪闪发光的戒指。你的手不自觉地捂住了嘴，眼眶瞬间就湿润了。这一刻你等了很久。"
        }
    },
    "wedding_ceremony": {
        "male": {
            "description": "你站在祭坛前等待新娘的到来。当她身着白纱出现在回廊尽头时，你的眼眶湿润了。从今天起，你将是她的丈夫，她的依靠。"
        },
        "female": {
            "description": "你身披洁白的婚纱，缓步走向祭坛。每走一步，心跳就快一分。他站在祭坛前等你，目光闪烁着比烛光更温暖的光芒。今天是你最美的一天。"
        }
    },
    "starlight_promise": {
        "male": {
            "description": "星空下，你牵起她的手。繁星见证了你们的誓言——不论贫穷还是富有，不论平凡还是传奇，你都会守护她走完这段旅程。"
        },
        "female": {
            "description": "他在星空下轻轻牵起你的手。头顶的银河洒下柔和的光，照亮了你们交握的手指。你把头靠在他的肩膀上，在心中许下了相守一生的愿望。"
        }
    },
    "festival_dance": {
        "male": {
            "description": "节日舞会上，你笨拙地伸出手邀请她跳舞。你的舞步称不上优雅，但她看着你的眼神里满是柔情。篝火映照着你们旋转的身影。"
        },
        "female": {
            "description": "他邀你共舞。你挽起裙摆轻盈地旋转，裙角在篝火的光芒中飞扬。他的手稳稳地托住你的腰，整个世界都在随你们一起旋转。"
        }
    },

    # === 社交/战斗 ===
    "knight_examination": {
        "female": {
            "title": "骑士考核·女骑士",
            "description": "作为为数不多的女性骑士候选人，你要面对的不只是考核本身——还有那些质疑的目光。但你的剑不会因为性别而变钝。今天，你要用实力证明一切。"
        }
    },
    "tavern_brawl": {
        "female": {
            "title": "酒馆中的不速之客",
            "description": "你走进酒馆时，几个醉汉朝你吹了声口哨。当其中一个人试图拉你坐下时，你的拳头比你的脾气更快。酒馆里顿时安静了——然后爆发出更大的混乱。"
        }
    },
    "chr_public_speech": {
        "male": {
            "description": "你站上演讲台，深吸一口气。面前是乌泱泱的人群，无数双眼睛注视着你。你压低声音开口，磁性的嗓音让最后排的人也竖起了耳朵。"
        },
        "female": {
            "description": "你站上演讲台，面对台下的人群。有人小声嘀咕'一个女人能说什么'，但当你开口时，清亮的声音穿透了所有杂音。人们安静下来，被你的话语深深吸引。"
        }
    },
    "merchant_apprentice": {
        "female": {
            "description": "女性商人虽然不常见，但你的掌柜并不介意——'赚钱只看能力，不看性别。'你从记账开始学起，很快就展现出了过人的商业嗅觉。"
        }
    },

    # === 身份/成长 ===
    "bullied": {
        "female": {
            "description": "你被几个大孩子围住了。他们嘲笑你'女孩子就该待在家里'，还抢走了你的东西。但你的眼中没有泪水，只有倔强的光芒。"
        }
    },
    "heartbreak_growth": {
        "male": {
            "description": "失恋的痛苦像一把钝刀割着你的心。你把自己关在房间里，不愿让任何人看到你脆弱的样子。男儿有泪不轻弹——但今夜没有人在看。"
        },
        "female": {
            "description": "你在月光下独自流泪。那个承诺会永远在一起的人，终究还是离开了。但你擦干眼泪，对自己说：下一次，我会更强大。"
        }
    }
}

# 加载、打补丁、写回
patched_count = 0
for fn in os.listdir(EVENT_DIR):
    if not fn.endswith('.json'):
        continue
    fp = os.path.join(EVENT_DIR, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    changed = False
    for event in events:
        if event['id'] in GENDER_VARIANTS:
            event['genderVariants'] = GENDER_VARIANTS[event['id']]
            patched_count += 1
            changed = True
            print(f"  [+] {fn}: {event['id']} <- {list(event['genderVariants'].keys())}")
    
    if changed:
        with open(fp, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)

print(f"\n共为 {patched_count} 个事件添加了性别变体")
