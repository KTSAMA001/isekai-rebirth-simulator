"""
Phase B3: 无分支纯正面事件拆分支
把 net>=+6 的无分支事件拆成 2-3 个有取舍的分支
- magic_graduate (net=+8) → 3个分支
- royal_summon (net=+8) → 3个分支
- world_breaking_start (net=+6) → 2个分支
- peaceful_end (net=+4) 和 elder_natural_death (net=+1) 保留原样
"""
import json, os

def patch_file(filepath, patches):
    """patches: dict of event_id -> new_branches_and_effects"""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    changed = 0
    for evt in data:
        if evt["id"] in patches:
            patch = patches[evt["id"]]
            # 清空原始无分支 effects（改为各分支的独立效果）
            evt["effects"] = patch.get("base_effects", [])
            evt["branches"] = patch["branches"]
            if "description" in patch:
                evt["description"] = patch["description"]
            changed += 1
            print(f"  拆分事件: {evt['id']} → {len(patch['branches'])} 个分支")
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return changed

# ========== magic_graduate (teenager.json) ==========
# 原效果: mag+2, int+1, flag:mage_graduate, mag+2, int+2 = net+8
# 拆成3个分支：专攻研究 / 平衡发展 / 立刻工作
magic_graduate_patch = {
    "base_effects": [
        {"type": "set_flag", "target": "mage_graduate", "value": 1, "description": "魔法毕业"}
    ],
    "description": "五年苦修终于结束，你拿到了魔法师的毕业证。接下来的路，你打算怎么走？",
    "branches": [
        {
            "id": "graduate_research",
            "title": "继续深造研究",
            "description": "留在学院继续攻读高阶魔法理论",
            "effects": [
                {"type": "modify_attribute", "target": "mag", "value": 3, "description": "魔法理论精通"},
                {"type": "modify_attribute", "target": "int", "value": 2, "description": "学术研究的积累"},
                {"type": "modify_attribute", "target": "chr", "value": -1, "description": "与世隔绝的代价"},
                {"type": "modify_attribute", "target": "mny", "value": -1, "description": "研究经费紧张"}
            ]
        },
        {
            "id": "graduate_balanced",
            "title": "全面发展",
            "description": "在各个领域都打下基础",
            "effects": [
                {"type": "modify_attribute", "target": "mag", "value": 2, "description": "扎实的魔法基础"},
                {"type": "modify_attribute", "target": "int", "value": 1, "description": "通识教育"},
                {"type": "modify_attribute", "target": "chr", "value": 1, "description": "多交了一些朋友"},
                {"type": "modify_attribute", "target": "spr", "value": 1, "description": "均衡带来内心平静"}
            ]
        },
        {
            "id": "graduate_work",
            "title": "立刻找工作",
            "description": "学以致用，马上投入实战",
            "effects": [
                {"type": "modify_attribute", "target": "mag", "value": 1, "description": "实战中的基本功"},
                {"type": "modify_attribute", "target": "mny", "value": 3, "description": "魔法师薪资优厚"},
                {"type": "modify_attribute", "target": "str", "value": 1, "description": "实际任务的体力消耗"},
                {"type": "modify_attribute", "target": "int", "value": -1, "description": "没时间理论学习"}
            ]
        }
    ]
}

# ========== royal_summon (teenager.json) ==========
# 原效果: mny+3, chr+1, flag:royal_recognized, chr+2, int+1 = net+8
# 拆成3个分支：接受任命 / 礼貌周旋 / 婉拒回归
royal_summon_patch = {
    "base_effects": [
        {"type": "set_flag", "target": "royal_recognized", "value": 1, "description": "皇室认可"}
    ],
    "description": "一队皇家卫兵出现在你面前。\"陛下有请。\"面对皇室的召见，你选择——",
    "branches": [
        {
            "id": "summon_accept",
            "title": "接受皇室任命",
            "description": "正式为皇室效力，获得头衔和资源",
            "effects": [
                {"type": "modify_attribute", "target": "mny", "value": 3, "description": "皇室俸禄"},
                {"type": "modify_attribute", "target": "chr", "value": 2, "description": "皇室成员的身份加成"},
                {"type": "modify_attribute", "target": "spr", "value": -2, "description": "宫廷政治的精神压力"},
                {"type": "modify_attribute", "target": "luk", "value": -1, "description": "树大招风"}
            ]
        },
        {
            "id": "summon_polite",
            "title": "礼貌周旋",
            "description": "保持友好关系但不正式效力",
            "effects": [
                {"type": "modify_attribute", "target": "chr", "value": 2, "description": "得体的社交表现"},
                {"type": "modify_attribute", "target": "int", "value": 1, "description": "宫廷见闻的见识"},
                {"type": "modify_attribute", "target": "mny", "value": 1, "description": "小额赏赐"},
                {"type": "modify_attribute", "target": "spr", "value": 1, "description": "保持自由的心境"}
            ]
        },
        {
            "id": "summon_decline",
            "title": "婉拒回归平民生活",
            "description": "谢绝皇室好意，回归自由生活",
            "effects": [
                {"type": "modify_attribute", "target": "spr", "value": 3, "description": "不被权力束缚的洒脱"},
                {"type": "modify_attribute", "target": "str", "value": 1, "description": "继续历练的决心"},
                {"type": "modify_attribute", "target": "chr", "value": -1, "description": "拒绝皇命的代价"}
            ]
        }
    ]
}

# ========== world_breaking_start (middle-age.json) ==========
# 原效果: str+2, mag+3, flag:world_breaking, mag+2, spr-2 = net+6
# 拆成2个分支：挺身而出 / 保全自己
world_breaking_patch = {
    "base_effects": [
        {"type": "set_flag", "target": "world_breaking", "value": 1, "description": "世界崩坏开始"}
    ],
    "description": "你感到世界在颤抖。不是地震——是世界本身的法则在瓦解。面对世界的崩坏，你选择——",
    "branches": [
        {
            "id": "breaking_fight",
            "title": "挺身对抗崩坏",
            "description": "用你的力量尝试修补世界的裂痕",
            "effects": [
                {"type": "modify_attribute", "target": "mag", "value": 3, "description": "吸收了崩坏中溢出的魔力"},
                {"type": "modify_attribute", "target": "str", "value": 2, "description": "对抗崩坏的肉体强化"},
                {"type": "modify_attribute", "target": "spr", "value": -2, "description": "目睹世界崩塌的精神创伤"},
                {"type": "modify_hp", "target": "hp", "value": -15, "description": "对抗虚空的代价"}
            ],
            "diceCheck": {
                "attribute": "mag",
                "dc": 14,
                "description": "尝试用魔力修补世界裂痕"
            },
            "failureEffects": [
                {"type": "modify_attribute", "target": "mag", "value": 1, "description": "虽然失败但吸收了一点魔力"},
                {"type": "modify_attribute", "target": "spr", "value": -3, "description": "失败带来深深的挫败感"},
                {"type": "modify_hp", "target": "hp", "value": -20, "description": "反噬的伤害"}
            ],
            "successText": "你的力量与崩坏的法则碰撞，世界的裂痕在你面前缓缓愈合。虽然只是暂时的，但你赢得了时间。",
            "failureText": "崩坏的力量超出了你的想象，反噬让你痛苦不堪。世界的裂痕依旧在扩大。"
        },
        {
            "id": "breaking_survive",
            "title": "保全自己和周围的人",
            "description": "不去对抗不可抗力，而是保护身边的人",
            "effects": [
                {"type": "modify_attribute", "target": "spr", "value": 2, "description": "守护他人的信念"},
                {"type": "modify_attribute", "target": "chr", "value": 2, "description": "领导疏散获得爱戴"},
                {"type": "modify_attribute", "target": "mag", "value": 1, "description": "在混乱中感悟到的魔力"},
                {"type": "modify_attribute", "target": "str", "value": -1, "description": "奔波中的体力消耗"}
            ]
        }
    ]
}

# 执行
total = 0

teenager_path = "data/sword-and-magic/events/teenager.json"
total += patch_file(teenager_path, {
    "magic_graduate": magic_graduate_patch,
    "royal_summon": royal_summon_patch,
})

middleage_path = "data/sword-and-magic/events/middle-age.json"
total += patch_file(middleage_path, {
    "world_breaking_start": world_breaking_patch,
})

print(f"\n共拆分 {total} 个无分支事件")
