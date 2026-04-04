"""B1 最终补丁: 剩余12个超标分支，加属性代价使 net<=+5"""
import json, glob, os

PATCHES = {
    ("advanced_dungeon", "deep_dive"): [
        {"type": "modify_attribute", "target": "luk", "value": -2, "description": "深渊的诅咒"}
    ],
    ("adv_bounty", "bounty_accept"): [
        {"type": "modify_attribute", "target": "chr", "value": -2, "description": "赏金猎人的恶名"}
    ],
    ("knight_glory", "lead_charge"): [
        {"type": "modify_attribute", "target": "luk", "value": -2, "description": "冲锋中的九死一生"}
    ],
    ("dungeon_explore_1", "explore_deep"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "地牢深处的阴影记忆"}
    ],
    ("luk_lottery", "lottery_jackpot"): [
        {"type": "modify_attribute", "target": "chr", "value": -1, "description": "暴富招来嫉妒"}
    ],
    ("merchant_guild", "guild_found"): [
        {"type": "modify_attribute", "target": "str", "value": -1, "description": "操劳过度"}
    ],
    ("elder_spirit_trial", "spirit_ascend"): [
        {"type": "modify_attribute", "target": "str", "value": -1, "description": "灵魂升华的身体代价"}
    ],
    ("mid_return_adventure", "return_dungeon"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "中年冒险的精神疲惫"}
    ],
    ("mid_magic_experiment", "experiment_success"): [
        {"type": "modify_attribute", "target": "str", "value": -2, "description": "实验透支体力"}
    ],
    ("knight_examination", "knight_pass"): [
        {"type": "modify_attribute", "target": "luk", "value": -1, "description": "骑士道的约束"}
    ],
    ("mag_elemental_fusion", "fusion_control"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "元素的精神侵蚀"}
    ],
    ("adv_legendary_dungeon", "dungeon_enter"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "传说地下城的精神创伤"}
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
            if key in PATCHES:
                br["effects"].extend(PATCHES[key])
                changed += 1
                print(f"  {fname} {evt['id']}/{br['id']}: +{len(PATCHES[key])}")
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        total += changed
print(f"\n共修改 {total} 个分支")
