#!/usr/bin/env python3
"""Phase C8 修复: 调整种族专属事件的平衡性
目标: 超标分支 net<+6, 失败路线 net>0
"""
import json, os, glob

EVENT_DIR = 'data/sword-and-magic/events'

# 需要调整的补丁表: event_id -> branch_id -> {field: new_value}
# 策略: 降低过高的正面效果或追加负面代价; 失败路线追加正面补偿
PATCHES = {
    "goblin_elder_legend": {
        # share_wisdom: net=6 -> 降chr到+1
        "share_wisdom": {"effects": [
            {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2（教学相长）"},
            {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1（受人尊敬）"},
            {"type": "set_flag", "target": "goblin_sage", "value": 1}
        ]},
        # one_last_gamble: net=10(success) / -16(fail)
        "one_last_gamble": {
            "effects": [
                {"type": "modify_attribute", "target": "luk", "value": 2, "description": "幸运 +2"},
                {"type": "modify_attribute", "target": "mny", "value": 2, "description": "家境 +2"},
                {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（无悔的人生）"}
            ],
            "failureEffects": [
                {"type": "modify_hp", "target": "hp", "value": -15, "description": "HP -15（代价惨重）"},
                {"type": "modify_attribute", "target": "spr", "value": 2, "description": "灵魂 +2（至少不后悔）"},
                {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1"}
            ]
        },
        # peaceful_sunset: net=7 -> 降spr到+3
        "peaceful_sunset": {"effects": [
            {"type": "modify_attribute", "target": "spr", "value": 3, "description": "灵魂 +3（平静的幸福）"}
        ]}
    },
    "elf_world_tree_pilgrimage": {
        # base effects: mag+2, spr+1 = +3
        # listen_to_tree: spr+2, mag+1 = +3, total +6 -> 降spr到+1
        "listen_to_tree": {"effects": [
            {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（聆听古老的智慧）"},
            {"type": "modify_attribute", "target": "mag", "value": 1, "description": "魔力 +1"}
        ]},
        # absorb_mana(fail): base+3, fail -20+1=-19, total -16 -> 添正面
        "absorb_mana": {
            "failureEffects": [
                {"type": "modify_hp", "target": "hp", "value": -15, "description": "HP -15（魔力反噬）"},
                {"type": "modify_attribute", "target": "mag", "value": 1, "description": "魔力 +1（即便失败也有微弱收获）"},
                {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（经历了考验）"}
            ]
        },
        # plant_seed: chr+2, spr+1 = +3, total +6 -> 降chr到+1
        "plant_seed": {"effects": [
            {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1（世界树认可了你的虔诚）"},
            {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
            {"type": "set_flag", "target": "planted_seed_at_tree", "value": 1}
        ]}
    },
    "goblin_scavenger_instinct": {
        # cursed_item(success): mag+3,int+2,luk+2=+7 -> 降mag到+2
        "cursed_item": {
            "effects": [
                {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2"},
                {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2"},
                {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1（混沌的祝福）"}
            ],
            "failureEffects": [
                {"type": "modify_hp", "target": "hp", "value": -10, "description": "HP -10（诅咒爆发）"},
                {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1（虽然炸了但你还活着）"},
                {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（吸取教训）"}
            ]
        }
    },
    "elf_ancient_magic": {
        # learn_song(success): mag+5,int+2=+7 -> 降mag到+3
        "learn_song": {
            "effects": [
                {"type": "modify_attribute", "target": "mag", "value": 3, "description": "魔力 +3（掌握星辰秘术）"},
                {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2"},
                {"type": "set_flag", "target": "star_song_master", "value": 1}
            ]
        },
        # share_knowledge: chr+3,mag+2,int+1=+6 -> 降chr到+2
        "share_knowledge": {"effects": [
            {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（精灵社会的认可）"},
            {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2（长老的教导）"},
            {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1"}
        ]}
    },
    "goblin_trade_empire": {
        # expand_business(success): mny+5,chr+2=+7 -> 降mny到+3
        "expand_business": {
            "effects": [
                {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3（生意兴隆）"},
                {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2（商业声望）"},
                {"type": "set_flag", "target": "goblin_merchant_king", "value": 1}
            ]
        }
    },
    "elf_fading_forest": {
        # heal_forest(fail): base spr-1, fail hp-10+spr+1 = -10+1=-9, total -10 -> 添正面
        "heal_forest": {
            "failureEffects": [
                {"type": "modify_hp", "target": "hp", "value": -5, "description": "HP -5（魔力透支）"},
                {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（至少你尝试了）"},
                {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1（族人看到了你的努力）"}
            ]
        }
    },
    "goblin_underground_race": {
        # race_smart(fail): hp-10+int+1=-9 -> 添补偿
        "race_smart": {
            "failureEffects": [
                {"type": "modify_hp", "target": "hp", "value": -5, "description": "HP -5（摔了一跤）"},
                {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1（下次勘察得更仔细）"},
                {"type": "modify_attribute", "target": "luk", "value": 1, "description": "幸运 +1（至少没受重伤）"}
            ]
        },
        # race_lucky(fail): hp-15+str+1=-14 -> 降hp伤害+加补偿
        "race_lucky": {
            "failureEffects": [
                {"type": "modify_hp", "target": "hp", "value": -5, "description": "HP -5（撞墙了）"},
                {"type": "modify_attribute", "target": "str", "value": 1, "description": "体魄 +1（哥布林越摔越耐摔）"},
                {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1（勇气可嘉）"}
            ]
        }
    }
}

patched = 0
for fp in sorted(glob.glob(os.path.join(EVENT_DIR, '*.json'))):
    with open(fp, 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    changed = False
    for event in events:
        eid = event['id']
        if eid not in PATCHES:
            continue
        for branch in event.get('branches', []):
            bid = branch['id']
            if bid not in PATCHES[eid]:
                continue
            patch = PATCHES[eid][bid]
            if 'effects' in patch:
                branch['effects'] = patch['effects']
            if 'failureEffects' in patch:
                branch['failureEffects'] = patch['failureEffects']
            patched += 1
            changed = True
            print(f"  [fix] {eid} -> {bid}")
    
    if changed:
        with open(fp, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)

print(f"\n共修复 {patched} 个分支")
