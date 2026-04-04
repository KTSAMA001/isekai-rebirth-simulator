"""Phase D1: 详细诊断缺失 flag 的上下文"""
import json
import glob

# 关注的 flag
target_flags = [
    "magic_graduate",  # 4处引用
    "parent",  # 3处引用
    "dungeon_injured",  # 1处引用
    "demon_heritage",  # 1处引用
    "divine_chosen",  # 1处引用
    "dragon_blood",  # 1处引用
]

# 自排除型（事件 exclude 自身 ID）
self_exclude = [
    "festival_dance",
    "forbidden_love",
    "lover_curse",
    "protect_family",
    "quest_parting",
    "rescue_from_dungeon",
    "starlight_promise",
]

print("=" * 60)
print("一、自排除型 flag（事件 exclude 自身 ID）")
print("=" * 60)
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        if evt["id"] in self_exclude:
            unique = evt.get("unique", False)
            exc = evt.get("exclude", "")
            print(f"  {evt['id']}: unique={unique}, exclude='{exc}'")

print("\n" + "=" * 60)
print("二、真正缺失的 flag 详情")
print("=" * 60)

for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    fname = fp.split("/")[-1]
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        eid = evt["id"]
        inc = evt.get("include", "")
        exc = evt.get("exclude", "")
        
        for flag in target_flags:
            if f"has.flag.{flag}" in str(inc) + str(exc):
                print(f"\n  引用处: {eid} ({fname})")
                print(f"    include: {inc}")
                print(f"    exclude: {exc}")

# 找可能应该设置这些 flag 的事件
print("\n" + "=" * 60)
print("三、应该设置缺失 flag 的候选事件")
print("=" * 60)

# magic_graduate: 查找 mage_graduate 相关事件
print("\n--- magic_graduate ---")
print("（注意：有 mage_graduate flag 被设置，可能是 typo）")
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    fname = fp.split("/")[-1]
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        # 找包含 magic_graduate 或 mage_graduate 相关的事件
        if "magic_graduate" in evt["id"] or "mage_graduate" in evt["id"]:
            print(f"  事件 {evt['id']} ({fname})")
            for ef in evt.get("effects", []):
                if ef.get("type") == "set_flag":
                    print(f"    设置: {ef['target']}")
            for br in evt.get("branches", []):
                for ef in br.get("effects", []):
                    if ef.get("type") == "set_flag":
                        print(f"    分支 {br['id']} 设置: {ef['target']}")

# parent: 查找生育/孩子相关事件
print("\n--- parent ---")
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    fname = fp.split("/")[-1]
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        if any(kw in evt["id"] for kw in ["child", "parent", "birth", "baby", "pregnant", "family"]):
            flags = []
            for ef in evt.get("effects", []):
                if ef.get("type") == "set_flag":
                    flags.append(ef["target"])
            for br in evt.get("branches", []):
                for ef in br.get("effects", []):
                    if ef.get("type") == "set_flag":
                        flags.append(f"{br['id']}:{ef['target']}")
            if flags:
                print(f"  事件 {evt['id']} ({fname}) 设置: {flags}")

# dungeon_injured: 查找地下城相关
print("\n--- dungeon_injured ---")
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    fname = fp.split("/")[-1]
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        if "dungeon" in evt["id"]:
            flags = []
            for ef in evt.get("effects", []):
                if ef.get("type") == "set_flag":
                    flags.append(ef["target"])
            for br in evt.get("branches", []):
                for ef in br.get("effects", []):
                    if ef.get("type") == "set_flag":
                        flags.append(f"{br['id']}:{ef['target']}")
            print(f"  事件 {evt['id']} ({fname}) 设置: {flags}")
