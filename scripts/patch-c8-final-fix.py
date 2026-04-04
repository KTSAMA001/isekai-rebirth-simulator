"""修复最后 3 个超标分支 (net=6.0 -> 5.0)"""
import json

with open("data/sword-and-magic/events/teenager.json") as f:
    events = json.load(f)

fixes = {
    "elf_ancient_magic": {
        "branch": "learn_song",
        "target": "int",
        "old_val": 2,
        "new_val": 1,
        "new_desc": "智慧 +1",
    },
    "goblin_trade_empire": {
        "branch": "expand_business",
        "target": "chr",
        "old_val": 2,
        "new_val": 1,
        "new_desc": "魅力 +1（商业声望）",
    },
    "human_diplomacy": {
        "branch": "bridge_builder",
        "target": "int",
        "old_val": 2,
        "new_val": 1,
        "new_desc": "智慧 +1（跨文化理解）",
    },
}

count = 0
for e in events:
    if e["id"] in fixes:
        fix = fixes[e["id"]]
        for br in e["branches"]:
            if br["id"] == fix["branch"]:
                for ef in br["effects"]:
                    if ef.get("target") == fix["target"] and ef.get("value") == fix["old_val"]:
                        ef["value"] = fix["new_val"]
                        ef["description"] = fix["new_desc"]
                        count += 1
                        print(f'Fixed: {e["id"]} -> {br["id"]} {fix["target"]} {fix["old_val"]}->{fix["new_val"]}')
                        break

with open("data/sword-and-magic/events/teenager.json", "w") as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f"\nTotal fixed: {count}")
