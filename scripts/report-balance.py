"""Phase B 最终平衡报告"""
import json, glob

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

total_events = 0
total_branches = 0
branch_nets = []
no_branch_positive = 0
overpowered = 0
waste = 0

for f in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    data = json.load(open(f))
    for evt in data:
        total_events += 1
        branches = evt.get("branches", [])
        if not branches:
            bn = calc_net(evt.get("effects", []))
            if bn > 0:
                no_branch_positive += 1
        else:
            for br in branches:
                total_branches += 1
                bn = calc_net(br.get("effects", []))
                branch_nets.append(bn)
                if bn >= 6: overpowered += 1
                if bn <= 0: waste += 1

avg_net = sum(branch_nets) / len(branch_nets) if branch_nets else 0
print("=" * 50)
print("Phase B 最终平衡报告")
print("=" * 50)
print(f"总事件数: {total_events}")
print(f"总分支数: {total_branches}")
print(f"分支平均 net: {avg_net:+.2f}")
print(f"超标分支 (net>=+6): {overpowered}")
print(f"废选项 (net<=0): {waste}")
print(f"无分支纯正面事件: {no_branch_positive}")
print()
print("目标达成情况:")
ok1 = "V" if overpowered == 0 else "X"
ok2 = "V" if waste <= 15 else "X"
ok3 = "V" if no_branch_positive <= 3 else "X"
print(f"  [{ok1}] 超标分支 <= 0 (当前: {overpowered})")
print(f"  [{ok2}] 废选项 <= 15 (当前: {waste})")
print(f"  [{ok3}] 无分支正面 <= 3 (当前: {no_branch_positive})")
print()

ranges = [(-100,-5), (-5,-1), (-1, 0), (0, 1), (1, 3), (3, 5), (5, 100)]
labels = ["<-5", "-5~-1", "-1~0", "0~+1", "+1~+3", "+3~+5", ">+5"]
print("净值分布:")
for (lo, hi), label in zip(ranges, labels):
    count = sum(1 for n in branch_nets if lo <= n < hi)
    bar = "#" * (count // 2)
    print(f"  {label:>8s}: {count:3d} {bar}")
