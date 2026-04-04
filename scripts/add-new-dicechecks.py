"""
为关键战斗/冒险事件添加 diceCheck
只对有明确冒险性质的分支添加
"""
import json

patches = {
    # adult.json
    "adult.json": {
        "dragon_slay_attempt": {
            "dragon_kill": {
                "diceCheck": {"attribute": "str", "dc": 20, "description": "体魄判定 DC20 — 你能正面击败巨龙吗？"},
            },
            "dragon_near_death": {
                "diceCheck": {"attribute": "str", "dc": 16, "description": "体魄判定 DC16 — 拼死一搏的代价"},
            },
        },
        "war_breaks_out": {
            "war_frontline": {
                "diceCheck": {"attribute": "str", "dc": 17, "description": "体魄判定 DC17 — 前线的生存考验"},
            },
        },
        "war_campaign": {
            "campaign_volunteer": {
                "diceCheck": {"attribute": "str", "dc": 18, "description": "体魄判定 DC18 — 远征军的艰苦行军"},
            },
        },
    },
    # teenager.json
    "teenager.json": {
        "dark_mage_tempt": {
            "reject_fight": {
                "diceCheck": {"attribute": "spr", "dc": 15, "description": "灵魂判定 DC15 — 你的意志够坚定吗？"},
            },
        },
    },
    # youth.json
    "youth.json": {
        "demon_hunt": {
            "resist_flee": {
                "diceCheck": {"attribute": "str", "dc": 15, "description": "体魄判定 DC15 — 你能逃脱猎魔骑士吗？"},
            },
        },
    },
}

for fname, event_patches in patches.items():
    path = f"data/sword-and-magic/events/{fname}"
    events = json.load(open(path))
    patched = 0

    for e in events:
        if e["id"] in event_patches:
            branch_patches = event_patches[e["id"]]
            for b in e.get("branches", []):
                if b["id"] in branch_patches:
                    for key, val in branch_patches[b["id"]].items():
                        b[key] = val
                    patched += 1

    if patched > 0:
        with open(path, "w") as f:
            json.dump(events, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"{fname}: 新增 {patched} 个 diceCheck")

print("Done")
