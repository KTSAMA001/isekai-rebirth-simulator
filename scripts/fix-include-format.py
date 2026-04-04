#!/usr/bin/env python3
"""修正新增事件中 include 条件的格式：mag -> attribute.mag"""
import json, os, re, glob

EVENT_DIR = "data/sword-and-magic/events"
ATTR_NAMES = {"str", "int", "mag", "chr", "spr", "luk", "mny"}

def fix_include(expr):
    """将 'mag >= 35' 格式修正为 'attribute.mag >= 35'"""
    if not expr:
        return expr
    # 匹配独立的属性缩写（不以 attribute. 开头）
    def repl(m):
        attr = m.group(0)
        if attr in ATTR_NAMES:
            return f"attribute.{attr}"
        return attr
    # 避免替换已有 attribute. 前缀的
    result = re.sub(r'\b(?<!attribute\.)(' + '|'.join(ATTR_NAMES) + r')\b', repl, expr)
    return result

fixed = 0
for fpath in sorted(glob.glob(os.path.join(EVENT_DIR, "*.json"))):
    fn = os.path.basename(fpath)
    with open(fpath) as f:
        events = json.load(f)
    changed = False
    for e in events:
        if e.get("include"):
            old = e["include"]
            new = fix_include(old)
            if old != new:
                e["include"] = new
                print(f"  {fn}: {e['id']}: '{old}' -> '{new}'")
                fixed += 1
                changed = True
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(events, f, ensure_ascii=False, indent=2)

print(f"\n共修正 {fixed} 个 include 条件")
