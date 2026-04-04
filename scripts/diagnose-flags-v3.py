"""Phase D1 v3: 正确诊断 include/exclude 中引用的 flag"""
import json
import glob
import re

set_flags = set()
ref_flags = {}  # flag -> [(event_id, location)]

for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        eid = evt["id"]
        
        # 收集所有 set_flag
        for ef in evt.get("effects", []):
            if ef.get("type") == "set_flag":
                set_flags.add(ef["target"])
        for br in evt.get("branches", []):
            for ef in br.get("effects", []):
                if ef.get("type") == "set_flag":
                    set_flags.add(ef["target"])
        
        def extract_flags_from_dsl(dsl_str, location):
            """从 DSL 字符串中提取所有 flag 名"""
            if not dsl_str or not isinstance(dsl_str, str):
                return
            # 匹配 has.flag.xxx
            for m in re.finditer(r'has\.flag\.(\w+)', dsl_str):
                flag = m.group(1)
                if flag not in ref_flags:
                    ref_flags[flag] = []
                ref_flags[flag].append((eid, location))
        
        # 事件级 include/exclude (字符串)
        if isinstance(evt.get("include"), str):
            extract_flags_from_dsl(evt["include"], "event.include")
        elif isinstance(evt.get("include"), list):
            for inc_item in evt["include"]:
                extract_flags_from_dsl(inc_item, "event.include")
        
        if isinstance(evt.get("exclude"), str):
            extract_flags_from_dsl(evt["exclude"], "event.exclude")
        elif isinstance(evt.get("exclude"), list):
            for exc_item in evt["exclude"]:
                extract_flags_from_dsl(exc_item, "event.exclude")
        
        # 分支级
        for br in evt.get("branches", []):
            bid = br.get("id", "?")
            if isinstance(br.get("include"), str):
                extract_flags_from_dsl(br["include"], f"branch.{bid}.include")
            if isinstance(br.get("exclude"), str):
                extract_flags_from_dsl(br["exclude"], f"branch.{bid}.exclude")
            if isinstance(br.get("conditions"), str):
                extract_flags_from_dsl(br["conditions"], f"branch.{bid}.conditions")

# 也检查 raceVariants/genderVariants
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

# 打印 include/exclude 原始值样例
print("=" * 60)
print("include/exclude 样例:")
print("=" * 60)
samples = []
for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        if evt.get("include"):
            samples.append(f"  {evt['id']}.include = {repr(evt['include'])}")
        if evt.get("exclude"):
            samples.append(f"  {evt['id']}.exclude = {repr(evt['exclude'])}")
        for br in evt.get("branches", []):
            if br.get("include"):
                samples.append(f"  {evt['id']}.{br['id']}.include = {repr(br['include'])}")
            if br.get("exclude"):
                samples.append(f"  {evt['id']}.{br['id']}.exclude = {repr(br['exclude'])}")
for s in samples[:30]:
    print(s)
print(f"  ... 总计 {len(samples)} 个条件表达式")

# 结果
print(f"\n被 set_flag 设置过的 flag: {len(set_flags)} 个")
print(f"被 include/exclude 引用的 flag: {len(ref_flags)} 个")

missing = set(ref_flags.keys()) - set_flags
print(f"\n{'=' * 60}")
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

# 也统计从未被引用的 set_flag（设置了但没人引用）
unused = set_flags - set(ref_flags.keys())
print(f"\n{'=' * 60}")
print(f"设置了但从未被引用的 flag: {len(unused)} 个")
print("=" * 60)
for f in sorted(unused):
    print(f"  {f}")
