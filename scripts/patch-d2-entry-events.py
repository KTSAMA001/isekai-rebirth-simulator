"""Phase D2: 修复入口事件拒绝率问题
目标：让关键路线入口的接受分支略优于拒绝分支
策略：小幅调整（+1属性或-1属性），不触碰 net>=6 阈值
"""
import json
import os

BASE = "data/sword-and-magic/events"
fixes = 0

def load_events(filename):
    path = os.path.join(BASE, filename)
    with open(path) as f:
        return json.load(f)

def save_events(filename, events):
    path = os.path.join(BASE, filename)
    with open(path, "w") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

# ============================================================
# Fix 1: guild_recruitment — 让 join_guild 更有吸引力
# join_guild: net=+3.0 → +4.0 (添加 luk+1 "冒险者的好运")
# ============================================================
print("=== Fix 1: guild_recruitment ===")
events = load_events("youth.json")
for evt in events:
    if evt["id"] == "guild_recruitment":
        for br in evt["branches"]:
            if br["id"] == "join_guild":
                br["effects"].append({
                    "type": "modify_attribute",
                    "target": "luk",
                    "value": 1,
                    "description": "幸运 +1（冒险者公会的庇佑）"
                })
                print(f"  join_guild: 添加 luk+1 → net应为+4.0")
                fixes += 1
save_events("youth.json", events)

# ============================================================
# Fix 2: scholar_guidance — 让 study_scholar 更有吸引力
# study_scholar: net=+3.0 → +4.0 (添加 spr+1 "学术启发")
# ============================================================
print("\n=== Fix 2: scholar_guidance ===")
events = load_events("youth.json")
for evt in events:
    if evt["id"] == "scholar_guidance":
        for br in evt["branches"]:
            if br["id"] == "study_scholar":
                br["effects"].append({
                    "type": "modify_attribute",
                    "target": "spr",
                    "value": 1,
                    "description": "灵性 +1（学术的灵感激发）"
                })
                print(f"  study_scholar: 添加 spr+1 → net应为+4.0")
                fixes += 1
save_events("youth.json", events)

# ============================================================
# Fix 3: become_lord — 降低 decline 吸引力
# decline_lordship: net=+5.0 → +3.0 (减少 spr 从 +3 到 +1)
# accept_lordship: net=+3.5 保持不变（含flag价值已达+4.5）
# ============================================================
print("\n=== Fix 3: become_lord ===")
events = load_events("adult.json")
for evt in events:
    if evt["id"] == "become_lord":
        for br in evt["branches"]:
            if br["id"] == "decline_lordship":
                for ef in br["effects"]:
                    if ef.get("target") == "spr" and ef.get("value", 0) > 1:
                        old_val = ef["value"]
                        ef["value"] = 1
                        ef["description"] = "灵性 +1（自由的代价也是放弃权力）"
                        print(f"  decline_lordship: spr {old_val}→1, net从+5.0降到约+3.0")
                        fixes += 1
                        break
save_events("adult.json", events)

print(f"\n总计修复: {fixes} 个分支")
