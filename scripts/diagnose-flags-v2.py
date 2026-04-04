"""Phase D1: 精确诊断 include/exclude 中引用的 flag"""
import json
import glob
import re

# 收集所有被 set_flag 设置过的 flag
set_flags = set()
# 收集所有被 include/exclude/conditions 引用的 flag -> 引用位置
ref_flags = {}  # flag -> [(event_id, location)]

for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        eid = evt["id"]
        
        # 收集 set_flag (事件级 + 分支级)
        for ef in evt.get("effects", []):
            if ef.get("type") == "set_flag":
                set_flags.add(ef["target"])
        for br in evt.get("branches", []):
            for ef in br.get("effects", []):
                if ef.get("type") == "set_flag":
                    set_flags.add(ef["target"])
        
        # 收集 include/exclude 中引用的 flag
        def record_ref(flag, location):
            if flag not in ref_flags:
                ref_flags[flag] = []
            ref_flags[flag].append((eid, location))
        
        # 事件级 include/exclude（字符串数组）
        for inc_str in evt.get("include", []):
            # include 条件格式可能是 "flag:xxx" 或 "has.flag.xxx" 或直接是 flag 名
            if inc_str.startswith("flag:"):
                record_ref(inc_str[5:], "event.include")
            elif "flag." in inc_str:
                for m in re.finditer(r'flag\.(\w+)', inc_str):
                    record_ref(m.group(1), "event.include")
            else:
                # 可能直接就是 flag 名
                record_ref(inc_str, "event.include")
        
        for exc_str in evt.get("exclude", []):
            if exc_str.startswith("flag:"):
                record_ref(exc_str[5:], "event.exclude")
            elif "flag." in exc_str:
                for m in re.finditer(r'flag\.(\w+)', exc_str):
                    record_ref(m.group(1), "event.exclude")
            else:
                record_ref(exc_str, "event.exclude")
        
        # 分支级 include/exclude
        for br in evt.get("branches", []):
            bid = br.get("id", "?")
            for inc_str in br.get("include", []):
                if inc_str.startswith("flag:"):
                    record_ref(inc_str[5:], f"branch.{bid}.include")
                elif "flag." in inc_str:
                    for m in re.finditer(r'flag\.(\w+)', inc_str):
                        record_ref(m.group(1), f"branch.{bid}.include")
                else:
                    record_ref(inc_str, f"branch.{bid}.include")
            
            for exc_str in br.get("exclude", []):
                if exc_str.startswith("flag:"):
                    record_ref(exc_str[5:], f"branch.{bid}.exclude")
                elif "flag." in exc_str:
                    for m in re.finditer(r'flag\.(\w+)', exc_str):
                        record_ref(m.group(1), f"branch.{bid}.exclude")
                else:
                    record_ref(exc_str, f"branch.{bid}.exclude")

# 也扫描 raceVariants/genderVariants 
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

# 显示结果
print("=" * 60)
print(f"被 set_flag 设置过的 flag: {len(set_flags)} 个")
print("=" * 60)

print(f"\n被 include/exclude 引用的 flag: {len(ref_flags)} 个")

# 找缺失
missing = set(ref_flags.keys()) - set_flags

print("\n" + "=" * 60)
if not missing:
    print("✅ 所有引用的 flag 都有对应的 set_flag")
else:
    print(f"❌ 被引用但从未设置的 flag: {len(missing)} 个")
    print("=" * 60)
    for f in sorted(missing):
        locs = ref_flags[f]
        print(f"\n  ⚠ {f} ({len(locs)} 处引用)")
        for eid, loc in locs:
            print(f"    <- {eid} @ {loc}")

# 也看看 include/exclude 的原始值样例
print("\n\n" + "=" * 60)
print("include/exclude 原始值样例:")
print("=" * 60)
samples_inc = set()
samples_exc = set()
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        for x in evt.get("include", []):
            samples_inc.add(x)
        for x in evt.get("exclude", []):
            samples_exc.add(x)
        for br in evt.get("branches", []):
            for x in br.get("include", []):
                samples_inc.add(x)
            for x in br.get("exclude", []):
                samples_exc.add(x)

print("\ninclude 值样例 (全部):")
for x in sorted(samples_inc):
    print(f"  {x}")
print(f"\n  总计: {len(samples_inc)}")

print("\nexclude 值样例 (全部):")
for x in sorted(samples_exc):
    print(f"  {x}")
print(f"\n  总计: {len(samples_exc)}")
