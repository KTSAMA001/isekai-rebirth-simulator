"""
Phase B4: 必选项权衡改造
处理两类问题：
A) 仍然是 net+4~+5 的纯优势分支 → 增加代价
B) 同一事件中差距 > 2 的弱选项 → 提升吸引力

目标: 同一事件的分支 net 差距 ≤ 2，所有分支 net ≤ +5
"""
import json, glob, os

# ===== A类: 给优势分支加代价 =====
COST_PATCHES = {
    # hunt_big_game net=+4 (str+2,spr+1,mny+1 纯正面) → 加 hp-5(猎物反伤)
    ("hunting_trip", "hunt_big_game"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "猎物的反击受了点伤"}
    ],
    # haggle_win net=+4 (chr+2,mny+1,int+1 纯正面) → 加 spr-1
    ("market_haggling", "haggle_win"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "讨价还价伤了点面子"}
    ],
    # god_accept net=+5 → 加 luk-1
    ("rare_gods_gift", "god_accept"): [
        {"type": "modify_attribute", "target": "luk", "value": -1, "description": "神力带来命运的不确定性"}
    ],
    # pastlife_embrace net=+4 → 加 chr-1 (前世记忆让人疏离)
    ("rare_reincarnation_hint", "pastlife_embrace"): [
        {"type": "modify_attribute", "target": "chr", "value": -1, "description": "前世记忆让你和当下的人有些疏离"}
    ],
    # listen_carefully net=+4 (含item) → 加 mny-1
    ("old_soldier_story", "listen_carefully"): [
        {"type": "modify_attribute", "target": "mny", "value": -1, "description": "请老兵喝了顿酒"}
    ],
    # adopt_take net=+4 → 加 str-1 (照顾孩子的体力消耗)
    ("mid_adopt_orphan", "adopt_take"): [
        {"type": "modify_attribute", "target": "str", "value": -1, "description": "照顾孩子的辛劳"}
    ],
    # study_scholar net=+4 → 加 mny-1 (学费)
    ("scholar_guidance", "study_scholar"): [
        {"type": "modify_attribute", "target": "mny", "value": -1, "description": "交了一些学费"}
    ],
    # refuse_guild net=+4 → 加 chr-1 (得罪了公会)
    ("guild_recruitment", "refuse_guild"): [
        {"type": "modify_attribute", "target": "chr", "value": -1, "description": "公会的人不太高兴"}
    ],
}

# ===== B类: 给弱选项加收益（缩小同事件差距） =====
BOOST_PATCHES = {
    # elder_peaceful_days: garden=+1 vs lonely=+3 → 提升garden
    ("elder_peaceful_days", "peace_garden"): [
        {"type": "modify_attribute", "target": "chr", "value": 1, "description": "和邻居聊天的快乐"},
        {"type": "modify_attribute", "target": "int", "value": 1, "description": "观察植物的知识"}
    ],
    # hesitate_guild net=+1 → 提升到 +2~+3
    ("guild_recruitment", "hesitate_guild"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "犹豫中发现了真正想要的"},
        {"type": "modify_attribute", "target": "mag", "value": 1, "description": "内省中感应到了魔力波动"}
    ],
    # self_study net=+1 → 提升到 +2~+3
    ("scholar_guidance", "self_study"): [
        {"type": "modify_attribute", "target": "spr", "value": 1, "description": "独立思考的沉淀"},
        {"type": "modify_attribute", "target": "str", "value": 1, "description": "用实践代替理论"}
    ],
    # adopt_donate net=+1 → 提升到 +2
    ("mid_adopt_orphan", "adopt_donate"): [
        {"type": "modify_attribute", "target": "luk", "value": 1, "description": "善行给你带来好运"}
    ],
}

total = 0
for fpath in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    data = json.load(open(fpath, "r", encoding="utf-8"))
    fname = os.path.basename(fpath)
    changed = 0
    for evt in data:
        for br in evt.get("branches", []):
            key = (evt["id"], br["id"])
            if key in COST_PATCHES:
                br["effects"].extend(COST_PATCHES[key])
                changed += 1
            if key in BOOST_PATCHES:
                br["effects"].extend(BOOST_PATCHES[key])
                changed += 1
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  {fname}: {changed} 个分支修改")
        total += changed
print(f"\n共修改 {total} 个分支")
