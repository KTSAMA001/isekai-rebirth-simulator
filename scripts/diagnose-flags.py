"""Phase D1: 精确诊断缺失 flag"""
import json
import glob
import re

# 收集所有被 set_flag 设置过的 flag
set_flags = set()
# 收集所有被 conditions 引用的 flag -> 引用位置
ref_flags = {}  # flag -> [(event_id, location)]

for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        eid = evt["id"]
        
        # 收集 set_flag
        for ef in evt.get("effects", []):
            if ef.get("type") == "set_flag":
                set_flags.add(ef["target"])
        for br in evt.get("branches", []):
            for ef in br.get("effects", []):
                if ef.get("type") == "set_flag":
                    set_flags.add(ef["target"])
        
        # 收集 conditions 中引用的 flag
        def extract_flags(cond_str, location):
            if not cond_str:
                return
            # 匹配 has.flag.xxx 和 !has.flag.xxx
            for m in re.finditer(r'has\.flag\.(\w+)', cond_str):
                flag = m.group(1)
                if flag not in ref_flags:
                    ref_flags[flag] = []
                ref_flags[flag].append((eid, location))
            # 匹配 flag.xxx（某些DSL变体）
            for m in re.finditer(r'(?<!has\.)flag\.(\w+)', cond_str):
                flag = m.group(1)
                if flag not in ref_flags:
                    ref_flags[flag] = []
                ref_flags[flag].append((eid, location))
        
        extract_flags(evt.get("conditions"), "event.conditions")
        for br in evt.get("branches", []):
            extract_flags(br.get("conditions"), f"branch.{br['id']}.conditions")
            # exclude 字段
            for excl in br.get("exclude", []):
                if "flag" in excl:
                    for m in re.finditer(r'has\.flag\.(\w+)', excl):
                        flag = m.group(1)
                        if flag not in ref_flags:
                            ref_flags[flag] = []
                        ref_flags[flag].append((eid, f"branch.{br['id']}.exclude"))

# 也扫描 raceVariants/genderVariants 中的 branches
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        for vtype in ("raceVariants", "genderVariants"):
            variants = evt.get(vtype, {})
            for vkey, vdata in variants.items():
                for br in vdata.get("branches", []):
                    for ef in br.get("effects", []):
                        if ef.get("type") == "set_flag":
                            set_flags.add(ef["target"])

print("=" * 60)
print("被 set_flag 设置过的 flag:")
print("=" * 60)
for f in sorted(set_flags):
    print(f"  {f}")

print(f"\n总计: {len(set_flags)} 个 flag\n")

print("=" * 60)
print("被 conditions 引用的 flag:")
print("=" * 60)
for f in sorted(ref_flags.keys()):
    locs = ref_flags[f]
    print(f"  {f} ({len(locs)} 处引用)")
    for eid, loc in locs[:5]:
        print(f"    <- {eid} @ {loc}")
    if len(locs) > 5:
        print(f"    ... 还有 {len(locs)-5} 处")

print(f"\n总计: {len(ref_flags)} 个不同 flag 被引用\n")

print("=" * 60)
print("❌ 被引用但从未设置的 flag:")
print("=" * 60)
missing = set(ref_flags.keys()) - set_flags
if not missing:
    print("  无！所有引用的 flag 都有对应的 set_flag")
else:
    for f in sorted(missing):
        locs = ref_flags[f]
        print(f"\n  ⚠ {f} ({len(locs)} 处引用但从未设置)")
        for eid, loc in locs:
            print(f"    <- {eid} @ {loc}")

print(f"\n缺失 flag 总数: {len(missing)}")
