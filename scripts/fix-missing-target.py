"""
修复 event JSON 中 effects 缺少 target 字段的问题：
1. set_flag / remove_flag: 把 flag → target
2. grant_item: 把 item → target
3. modify_hp: 添加 target="hp"
4. modify_max_hp_bonus: 添加 target="max_hp_bonus"
"""
import json, glob, os

def fix_effect(eff):
    """修复单个 effect，返回是否修改了"""
    changed = False
    typ = eff.get("type", "")

    # set_flag / remove_flag: flag → target
    if typ in ("set_flag", "remove_flag") and "flag" in eff and "target" not in eff:
        eff["target"] = eff.pop("flag")
        changed = True

    # grant_item: item → target
    if typ == "grant_item" and "item" in eff and "target" not in eff:
        eff["target"] = eff.pop("item")
        changed = True

    # modify_hp: 补 target
    if typ == "modify_hp" and "target" not in eff:
        eff["target"] = "hp"
        changed = True

    # modify_max_hp_bonus: 补 target
    if typ == "modify_max_hp_bonus" and "target" not in eff:
        eff["target"] = "max_hp_bonus"
        changed = True

    return changed

total_fixes = 0
for fpath in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    data = json.load(open(fpath, "r", encoding="utf-8"))
    file_fixes = 0

    for evt in data:
        # 顶级 effects
        for eff in evt.get("effects", []):
            if fix_effect(eff):
                file_fixes += 1

        # 分支 effects / failureEffects
        for br in evt.get("branches", []):
            for eff in br.get("effects", []):
                if fix_effect(eff):
                    file_fixes += 1
            for eff in br.get("failureEffects", []):
                if fix_effect(eff):
                    file_fixes += 1

    if file_fixes > 0:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        fname = os.path.basename(fpath)
        print(f"  {fname}: 修复 {file_fixes} 个效果")
        total_fixes += file_fixes

print(f"\n共修复 {total_fixes} 个效果")
