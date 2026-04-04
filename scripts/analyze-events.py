#!/usr/bin/env python3
"""分析事件池分布 — 种族、年龄段、权重"""
import json, sys, os, glob
from collections import defaultdict, Counter

event_dir = "data/sword-and-magic/events"
events = []
file_counts = {}
for fp in sorted(glob.glob(os.path.join(event_dir, "*.json"))):
    with open(fp) as f:
        chunk = json.load(f)
    name = os.path.basename(fp).replace(".json", "")
    file_counts[name] = len(chunk)
    events.extend(chunk)

print(f"总事件数: {len(events)}")
print("各文件事件数:")
for name, cnt in file_counts.items():
    print(f"  {name}: {cnt}")
print()

# 种族分组
race_count = defaultdict(int)
no_race = 0
for e in events:
    races = e.get("races") or []
    if not races:
        no_race += 1
    for r in races:
        race_count[r] += 1

print(f"通用事件(无种族限制): {no_race}")
for r, c in sorted(race_count.items()):
    print(f"  {r}专属: {c}")
print()

# 年龄段分布
age_bins = {"童年(0-10)": 0, "少年(11-20)": 0, "青年(21-40)": 0, "中年(41-60)": 0, "老年(61+)": 0, "全年龄": 0}
for e in events:
    mn = e.get("minAge", 0)
    mx = e.get("maxAge", 9999)
    if mn <= 1 and mx >= 200:
        age_bins["全年龄"] += 1
    elif mx <= 12:
        age_bins["童年(0-10)"] += 1
    elif mx <= 22:
        age_bins["少年(11-20)"] += 1
    elif mx <= 45:
        age_bins["青年(21-40)"] += 1
    elif mx <= 65:
        age_bins["中年(41-60)"] += 1
    else:
        age_bins["老年(61+)"] += 1

print("年龄段分布:")
for k, v in age_bins.items():
    print(f"  {k}: {v}")
print()

# 权重分布
weights = [e.get("weight", 1) for e in events]
from collections import Counter
wc = Counter(weights)
print("权重分布:")
for w in sorted(wc.keys()):
    print(f"  weight={w}: {wc[w]}个事件")
print()

# 高权重通用事件（容易刷屏的）
print("高频通用事件 (weight>=3, 无种族限制):")
high_freq = [e for e in events if e.get("weight", 1) >= 3 and not e.get("races")]
high_freq.sort(key=lambda e: -e.get("weight", 1))
for e in high_freq[:20]:
    age_range = f"{e.get('minAge',0)}-{e.get('maxAge','∞')}"
    print(f"  w={e.get('weight',1):2d} | {age_range:>8s} | {e['id']}: {e.get('title','')}")

# 条件复杂度
print()
no_cond = sum(1 for e in events if not e.get("condition") and not e.get("races"))
print(f"无条件且无种族限制的事件: {no_cond} (最容易被随机到)")
