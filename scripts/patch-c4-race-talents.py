#!/usr/bin/env python3
"""Phase C4: 创建种族专属天赋并更新 races.json"""
import json

# 读取现有天赋
with open('data/sword-and-magic/talents.json', 'r', encoding='utf-8') as f:
    talents = json.load(f)

# 检查是否已存在种族专属天赋
existing_ids = {t['id'] for t in talents}
if 'human_adaptability' in existing_ids:
    print("种族专属天赋已存在，跳过")
    exit(0)

# 种族专属天赋定义
race_talents = [
    # === 人类 ===
    {
        "id": "human_adaptability",
        "name": "万能适应",
        "description": "人类最大的天赋不是力量或魔法，而是对任何环境的适应力。",
        "rarity": "common",
        "icon": "\U0001f504",
        "effects": [
            {"type": "modify_attribute", "target": "str", "value": 1, "description": "体魄 +1"},
            {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1"},
            {"type": "modify_attribute", "target": "chr", "value": 1, "description": "魅力 +1"}
        ],
        "draftWeight": 0
    },
    {
        "id": "human_ambition",
        "name": "燃烧的野心",
        "description": "短暂的寿命反而点燃了不甘平凡的火焰。人类总想在有限时间里留下永恒的痕迹。",
        "rarity": "rare",
        "icon": "\U0001f525",
        "effects": [
            {"type": "modify_attribute", "target": "mny", "value": 3, "description": "家境 +3"},
            {"type": "modify_attribute", "target": "int", "value": 2, "description": "智慧 +2"},
            {"type": "modify_attribute", "target": "spr", "value": -1, "description": "灵魂 -1（急躁）"}
        ],
        "draftWeight": 0
    },
    # === 精灵 ===
    {
        "id": "elven_harmony",
        "name": "世界树共鸣",
        "description": "与世界树的古老联结让你天生便能感受到魔力的流动。在森林中时，你的灵魂会与树叶一起轻轻颤动。",
        "rarity": "common",
        "icon": "\U0001f33f",
        "effects": [
            {"type": "modify_attribute", "target": "mag", "value": 2, "description": "魔力 +2"},
            {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"}
        ],
        "draftWeight": 0
    },
    {
        "id": "elven_timeless_gaze",
        "name": "千年之瞳",
        "description": "精灵的双眼曾见证王朝更替、大陆沉浮。漫长岁月沉淀的智慧让你对万物洞若观火。",
        "rarity": "rare",
        "icon": "\U0001f441\ufe0f",
        "effects": [
            {"type": "modify_attribute", "target": "int", "value": 3, "description": "智慧 +3"},
            {"type": "modify_attribute", "target": "chr", "value": 2, "description": "魅力 +2"},
            {"type": "modify_attribute", "target": "str", "value": -1, "description": "体魄 -1（文弱）"}
        ],
        "draftWeight": 0
    },
    # === 哥布林 ===
    {
        "id": "goblin_cunning",
        "name": "哥布林式狡黠",
        "description": "在垃圾堆里长大的你学会了一件事：比你大的东西，就要比它聪明；比你聪明的东西，就要比它幸运。",
        "rarity": "common",
        "icon": "\U0001f3b2",
        "effects": [
            {"type": "modify_attribute", "target": "luk", "value": 2, "description": "幸运 +2"},
            {"type": "modify_attribute", "target": "int", "value": 1, "description": "智慧 +1"}
        ],
        "draftWeight": 0
    },
    {
        "id": "goblin_chaos_born",
        "name": "混沌宠儿",
        "description": "当其他种族在秩序中寻找安全时，哥布林在混乱中如鱼得水。越是不可能的事，越容易发生在你身上。",
        "rarity": "rare",
        "icon": "\U0001f0cf",
        "effects": [
            {"type": "modify_attribute", "target": "luk", "value": 4, "description": "幸运 +4"},
            {"type": "modify_attribute", "target": "spr", "value": 1, "description": "灵魂 +1"},
            {"type": "modify_attribute", "target": "chr", "value": -2, "description": "魅力 -2（格格不入）"}
        ],
        "draftWeight": 0
    }
]

# 追加到天赋列表
talents.extend(race_talents)

with open('data/sword-and-magic/talents.json', 'w', encoding='utf-8') as f:
    json.dump(talents, f, ensure_ascii=False, indent=2)

print(f"天赋总数: {len(talents)}（新增 {len(race_talents)} 个种族专属天赋）")

# 更新 races.json 的 exclusiveTalents
with open('data/sword-and-magic/races.json', 'r', encoding='utf-8') as f:
    races = json.load(f)

race_talent_map = {
    'human': ['human_adaptability', 'human_ambition'],
    'elf': ['elven_harmony', 'elven_timeless_gaze'],
    'goblin': ['goblin_cunning', 'goblin_chaos_born'],
}

for race in races:
    if race['id'] in race_talent_map:
        race['exclusiveTalents'] = race_talent_map[race['id']]
        print(f"  {race['id']}: exclusiveTalents = {race['exclusiveTalents']}")

with open('data/sword-and-magic/races.json', 'w', encoding='utf-8') as f:
    json.dump(races, f, ensure_ascii=False, indent=2)

print("完成！")
