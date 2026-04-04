"""Phase D2: 分析入口事件的分支净值"""
import json
import glob

def calc_net(effects):
    net = 0
    for eff in effects:
        typ = eff.get("type", "")
        val = eff.get("value", 0)
        if typ == "modify_attribute" and isinstance(val, (int, float)):
            net += val
        elif typ == "set_flag": net += 1
        elif typ == "grant_item": net += 2
        elif typ == "add_talent": net += 3
        elif typ == "modify_hp" and isinstance(val, (int, float)):
            net += val / 10
    return net

# 关键词识别入口/拒绝事件
entry_keywords = ["guild_recruitment", "magic_academy", "squire_selection", 
                  "merchant_offer", "scholar_path"]
refuse_keywords = ["refuse", "decline", "hesitate", "reject"]
accept_keywords = ["accept", "join", "agree", "enter"]

print("=" * 70)
print("入口事件分支净值分析")
print("=" * 70)

for fp in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    fname = fp.split("/")[-1]
    with open(fp) as f:
        events = json.load(f)
    for evt in events:
        branches = evt.get("branches", [])
        if not branches:
            continue
        
        # 是否包含拒绝型分支
        has_refuse = any(
            any(kw in br.get("id", "").lower() or kw in br.get("title", "").lower()
                for kw in refuse_keywords)
            for br in branches
        )
        
        if has_refuse:
            print(f"\n--- {evt['id']} ({fname}) ---")
            print(f"  title: {evt.get('title', '')}")
            best_net = -999
            worst_net = 999
            for br in branches:
                net = calc_net(br.get("effects", []))
                is_refuse = any(kw in br.get("id", "").lower() or 
                               kw in br.get("title", "").lower()
                               for kw in refuse_keywords)
                is_accept = any(kw in br.get("id", "").lower() or 
                               kw in br.get("title", "").lower()
                               for kw in accept_keywords)
                marker = "🚫" if is_refuse else ("✅" if is_accept else "  ")
                has_flag = any(ef.get("type") == "set_flag" for ef in br.get("effects", []))
                flag_str = " [+flag]" if has_flag else ""
                print(f"  {marker} {br['id']:30s}: net={net:+.1f}{flag_str}")
                best_net = max(best_net, net)
                worst_net = min(worst_net, net)
