"""
Phase B2 补充: 把 net=0 的分支推到 +1，把部分轻微负面推到正面
目标: 废选项 ≤ 15
"""
import json, glob, os

# 还在 net=0 的分支 - 每个加 +1 推上去
PATCHES_ZERO = {
    ("childhood_chase", "catch_one"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "追逐中锻炼了腿脚"}
    ],
    ("village_festival", "festival_eat"): [
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "吃饱了有力气"}
    ],
    ("village_festival", "festival_watch_fireworks"): [
        {"type": "modify_attribute", "target": "mag", "value": 1, "description": "烟花中感受到的魔力"}
    ],
    ("child_plague", "plague_rest"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "静养期间阅读了很多书"}
    ],
    ("elder_disciple_visit", "disciple_disappoint"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "失望中也有关爱"}
    ],
    ("elder_family_reunion", "family_dispute"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "吵完之后的释然"}
    ],
    ("elder_illness", "illness_magic"): [
        {"type": "modify_attribute", "target": "mag", "value": 1, "description": "治疗魔法的实践"}
    ],
    ("mid_old_enemy", "enemy_hide"): [
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "暂避风头的运气"}
    ],
    ("village_feud", "pretend_not_see"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "不卷入是非的安宁"}
    ],
}

# 轻微负面的也补一下 (目标: 从 -0.5~-2 推到 +1)
PATCHES_LIGHT_NEG = {
    ("forbidden_love", "forbidden_love_branch1"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "爱恨中的领悟"}
    ],
    ("forbidden_love", "forbidden_love_branch0"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "为爱情勇敢的光芒"}
    ],
    ("mid_heir_training", "heir_rebel"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "最终和孩子和解了"}
    ],
    ("dragon_slay_attempt", "dragon_defeat"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "败给巨龙后的刻苦训练"}
    ],
    ("child_plague", "plague_resist"): [
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "对疾病有了理解"}
    ],
    ("mid_body_decline", "defy_decline"): [
        {"type": "modify_attribute", "target": "str", "value": 2, "description": "运动让身体反而更好了"}
    ],
    ("mid_existential_crisis", "crisis_drown"): [
        {"type": "modify_attribute", "target": "int", "value": 2, "description": "酒醒后的深刻反思"}
    ],
    ("gambling_night", "gamble_lose"): [
        {"type": "modify_attribute", "target": "chr", "value": 2, "description": "输了钱但交到了朋友"}
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
            if key in PATCHES_ZERO:
                br["effects"].extend(PATCHES_ZERO[key])
                changed += 1
            if key in PATCHES_LIGHT_NEG:
                br["effects"].extend(PATCHES_LIGHT_NEG[key])
                changed += 1
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  {fname}: {changed} 个分支修改")
        total += changed
print(f"\n共修改 {total} 个分支")
