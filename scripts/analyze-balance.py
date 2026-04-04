"""
分析当前事件数据的平衡状态：
1. 统计每个分支的 net 值（正面效果总和 - 负面效果总和）
2. 找出超标分支(net>=+6)
3. 找出废选项(net<=0)
4. 找出无分支纯正面事件
"""
import json, glob, os

ATTR_EFFECTS = {"modify_attribute", "set_attribute"}
HP_EFFECTS = {"modify_hp", "modify_max_hp_bonus"}
FLAG_EFFECTS = {"set_flag", "remove_flag"}
ITEM_EFFECTS = {"grant_item"}
TALENT_EFFECTS = {"add_talent"}

def calc_net(effects):
    """计算一组 effects 的净属性增幅"""
    net = 0
    for eff in effects:
        typ = eff.get("type", "")
        val = eff.get("value", 0)
        if typ == "modify_attribute":
            if isinstance(val, (int, float)):
                net += val
        elif typ == "set_flag":
            net += 1  # flag 算 +1
        elif typ == "grant_item":
            net += 2  # 物品算 +2
        elif typ == "add_talent":
            net += 3  # 天赋算 +3
        elif typ == "modify_hp":
            if isinstance(val, (int, float)):
                net += val / 10  # HP 按 1/10 折算
    return net

overpowered = []  # net >= +6
waste = []         # net <= 0
no_branch_positive = []  # 无分支但有正面效果

for fpath in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    data = json.load(open(fpath, "r", encoding="utf-8"))
    fname = os.path.basename(fpath)
    
    for evt in data:
        eid = evt["id"]
        branches = evt.get("branches", [])
        
        if not branches:
            # 无分支事件
            base_net = calc_net(evt.get("effects", []))
            if base_net > 0:
                no_branch_positive.append({
                    "file": fname, "event": eid, "net": round(base_net, 1),
                    "effects": len(evt.get("effects", []))
                })
        else:
            for br in branches:
                br_net = calc_net(br.get("effects", []))
                entry = {
                    "file": fname, "event": eid, "branch": br["id"],
                    "net": round(br_net, 1),
                    "has_diceCheck": "diceCheck" in br,
                    "has_failureEffects": len(br.get("failureEffects", [])) > 0
                }
                if br_net >= 6:
                    overpowered.append(entry)
                elif br_net <= 0:
                    waste.append(entry)

print("=" * 60)
print(f"超标分支 (net >= +6): {len(overpowered)} 个")
print("=" * 60)
for item in sorted(overpowered, key=lambda x: -x["net"]):
    dice = " [有diceCheck]" if item["has_diceCheck"] else ""
    fail = " [有failureEffects]" if item["has_failureEffects"] else ""
    print(f"  {item['file']:20s} {item['event']:30s} {item['branch']:25s} net={item['net']:+.1f}{dice}{fail}")

print()
print("=" * 60)
print(f"废选项 (net <= 0): {len(waste)} 个")
print("=" * 60)
for item in sorted(waste, key=lambda x: x["net"]):
    dice = " [有diceCheck]" if item["has_diceCheck"] else ""
    print(f"  {item['file']:20s} {item['event']:30s} {item['branch']:25s} net={item['net']:+.1f}{dice}")

print()
print("=" * 60)
print(f"无分支纯正面事件 (net > 0): {len(no_branch_positive)} 个")
print("=" * 60)
for item in sorted(no_branch_positive, key=lambda x: -x["net"]):
    print(f"  {item['file']:20s} {item['event']:30s} net={item['net']:+.1f} ({item['effects']} effects)")
