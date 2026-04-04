"""Phase D1 验证: 重新扫描缺失 flag"""
import json
import glob
import re

set_flags = set()
ref_flags = {}

for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        eid = evt["id"]
        
        # 收集 set_flag (包括 failureEffects)
        for ef in evt.get("effects", []):
            if ef.get("type") == "set_flag":
                set_flags.add(ef["target"])
        for br in evt.get("branches", []):
            for ef in br.get("effects", []):
                if ef.get("type") == "set_flag":
                    set_flags.add(ef["target"])
            for ef in br.get("failureEffects", []):
                if ef.get("type") == "set_flag":
                    set_flags.add(ef["target"])
        
        def extract_flags_from_dsl(dsl_str, location):
            if not dsl_str or not isinstance(dsl_str, str):
                return
            for m in re.finditer(r'has\.flag\.(\w+)', dsl_str):
                flag = m.group(1)
                if flag not in ref_flags:
                    ref_flags[flag] = []
                ref_flags[flag].append((eid, location))
        
        if isinstance(evt.get("include"), str):
            extract_flags_from_dsl(evt["include"], "event.include")
        if isinstance(evt.get("exclude"), str):
            extract_flags_from_dsl(evt["exclude"], "event.exclude")
        
        for br in evt.get("branches", []):
            bid = br.get("id", "?")
            if isinstance(br.get("include"), str):
                extract_flags_from_dsl(br["include"], f"branch.{bid}.include")
            if isinstance(br.get("exclude"), str):
                extract_flags_from_dsl(br["exclude"], f"branch.{bid}.exclude")

# raceVariants/genderVariants
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

missing = set(ref_flags.keys()) - set_flags

print(f"设置: {len(set_flags)} 个 flag")
print(f"引用: {len(ref_flags)} 个 flag")
print(f"缺失: {len(missing)} 个")

if missing:
    for f in sorted(missing):
        locs = ref_flags[f]
        print(f"  ⚠ {f} ({len(locs)} 处引用)")
        for eid, loc in locs:
            print(f"    <- {eid} @ {loc}")
else:
    print("✅ 所有 has.flag.xxx 引用都有对应的 set_flag")
