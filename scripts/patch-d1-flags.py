"""Phase D1: 修复所有缺失/错误的 flag 引用"""
import json
import os

BASE = "data/sword-and-magic/events"
fixes_applied = 0

def load_events(filename):
    path = os.path.join(BASE, filename)
    with open(path) as f:
        return json.load(f)

def save_events(filename, events):
    path = os.path.join(BASE, filename)
    with open(path, "w") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

# ============================================================
# Fix 1: magic_graduate → mage_graduate (4处引用)
# adult.json: mage_magic_tower, mage_elemental_plane, mage_magic_war
# elder.json: elder_disciple_visit
# ============================================================
print("=== Fix 1: magic_graduate → mage_graduate ===")

for filename in ["adult.json", "elder.json"]:
    events = load_events(filename)
    for evt in events:
        if isinstance(evt.get("include"), str) and "has.flag.magic_graduate" in evt["include"]:
            old = evt["include"]
            evt["include"] = evt["include"].replace("has.flag.magic_graduate", "has.flag.mage_graduate")
            print(f"  Fixed: {evt['id']}.include: {old} → {evt['include']}")
            fixes_applied += 1
    save_events(filename, events)

# ============================================================
# Fix 2: parent flag 缺失 — 在 family_blessing 添加 set_flag
# ============================================================
print("\n=== Fix 2: 添加 parent flag ===")

events = load_events("adult.json")
for evt in events:
    if evt["id"] == "family_blessing":
        for br in evt.get("branches", []):
            if br["id"] == "accept_blessing":
                br["effects"].append({
                    "type": "set_flag",
                    "target": "parent",
                    "value": 1,
                    "description": "成为了父母"
                })
                print(f"  Fixed: family_blessing.accept_blessing 添加 set_flag:parent")
                fixes_applied += 1
                break
        # decline_blessing 也应设置 parent（拒绝祝福但孩子还是出生了）
        for br in evt.get("branches", []):
            if br["id"] == "decline_blessing":
                br["effects"].append({
                    "type": "set_flag",
                    "target": "parent",
                    "value": 1,
                    "description": "虽然婉拒了祝福，但孩子已经来到世上"
                })
                print(f"  Fixed: family_blessing.decline_blessing 添加 set_flag:parent")
                fixes_applied += 1
                break
save_events("adult.json", events)

# ============================================================
# Fix 3: divine_chosen → chosen_one (spr_divine_sign exclude)
# ============================================================
print("\n=== Fix 3: divine_chosen → chosen_one ===")

events = load_events("adult.json")
for evt in events:
    if evt["id"] == "spr_divine_sign":
        if isinstance(evt.get("exclude"), str) and "has.flag.divine_chosen" in evt["exclude"]:
            old = evt["exclude"]
            evt["exclude"] = evt["exclude"].replace("has.flag.divine_chosen", "has.flag.chosen_one")
            print(f"  Fixed: spr_divine_sign.exclude: {old} → {evt['exclude']}")
            fixes_applied += 1
save_events("adult.json", events)

# ============================================================
# Fix 4: dragon_blood/demon_heritage — elder_spirit_trial
# 改 has.flag.xxx → has.talent.xxx（因为这些是天赋不是flag）
# ============================================================
print("\n=== Fix 4: elder_spirit_trial flag→talent ===")

events = load_events("elder.json")
for evt in events:
    if evt["id"] == "elder_spirit_trial":
        if isinstance(evt.get("include"), str):
            old = evt["include"]
            evt["include"] = evt["include"].replace("has.flag.dragon_blood", "has.talent.dragon_blood")
            evt["include"] = evt["include"].replace("has.flag.demon_heritage", "has.talent.demon_heritage")
            if old != evt["include"]:
                print(f"  Fixed: elder_spirit_trial.include: {old} → {evt['include']}")
                fixes_applied += 1
save_events("elder.json", events)

print(f"\n总计修复: {fixes_applied} 处")
