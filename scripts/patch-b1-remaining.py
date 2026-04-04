"""
Phase B1 补充: 给剩余超标分支(有diceCheck但成功路径仍>=+6)加小额代价
这些分支已有骰判定风险，只需微调让 net<=+5
"""
import json, glob, os

# 所有剩余 net>=+6 且有 diceCheck 的分支，统一加小代价
PATCHES = {
    # net=+7.5 → 需要 -2.5+
    ("advanced_dungeon", "deep_dive"): [
        # 已在上一轮加了 hp-15,spr-3，但计算出来还是+7.5？需要检查
        # 上轮已加，不再重复
    ],
    
    # net=+7.0 的一批 → 加 spr-1 + hp-5 (折算约 -1.5)
    ("knight_dragon_quest", "dragon_hunt"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "龙的恐惧余悸"},
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "猎龙的伤痕"}
    ],
    ("merchant_auction", "auction_bid"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "拍卖的紧张压力"}
    ],
    ("adv_uncharted", "uncharted_explore"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "未知的恐惧"},
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "探索的磕碰"}
    ],
    ("dual_war_mage", "warmage_join"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "战争魔法的精神负担"}
    ],
    ("chain_rise_to_power", "power_run"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "权力斗争的心理消耗"}
    ],
    ("elder_memoir", "memoir_bestseller"): [
        {"type": "modify_attribute", "target": "str", "value": -2, "description": "写作消耗体力"}
    ],
    ("elder_spirit_trial", "spirit_ascend"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "灵魂试炼的身体负担"}
    ],
    ("mid_political_intrigue", "plot_join"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "政治阴谋的精神折磨"}
    ],
    ("mid_found_school", "school_thrive"): [
        {"type": "modify_attribute", "target": "mny", "value": -2, "description": "办学的持续投入"}
    ],
    ("mid_lord_govern", "lord_benevolent"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "治理的沉重责任"}
    ],
    ("mid_scholar_work", "scholar_breakthrough"): [
        {"type": "modify_attribute", "target": "str", "value": -2, "description": "经年累月的案牍劳形"}
    ],
    ("mid_return_adventure", "return_dungeon"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "年龄带来的战斗代价"}
    ],
    ("mid_magic_experiment", "experiment_success"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "实验的魔力反噬"}
    ],
    ("mid_business_rivalry", "rivalry_outsmart"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "商战中的道德挣扎"}
    ],
    ("love_at_first_sight", "approach_them"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "恋爱的患得患失"}
    ],
    ("mag_elemental_fusion", "fusion_control"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "元素融合的身体灼伤"}
    ],
    ("mage_arcane_library", "arcane_read"): [
        {"type": "modify_attribute", "target": "spr", "value": -2, "description": "奥术知识的精神侵蚀"}
    ],
    ("adv_legendary_dungeon", "dungeon_enter"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "传说地下城的累累伤痕"}
    ],
    
    # net=+6.5 → 加 spr-1 或 hp-5
    ("challenge_final_boss", "boss_fight"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "与最终BOSS的殊死搏斗"}
    ],
    ("challenge_final_boss", "boss_magic"): [
        {"type": "modify_hp", "target": "hp", "value": -10, "description": "魔法对轰的反噬伤害"}
    ],
    
    # net=+6.0 → 加 spr-1 或类似
    ("dragon_slay_attempt", "dragon_kill"): [
        {"type": "modify_hp", "target": "hp", "value": -15, "description": "屠龙的惨烈代价"}
    ],
    ("dragon_slay_attempt", "dragon_near_death"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "濒死体验的后遗症"}
    ],
    ("spr_curse_breaker", "curse_success"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "诅咒残留的精神影响"}
    ],
    ("mage_magic_war", "magicwar_fight"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "魔法战争的受伤"}
    ],
    ("knight_siege", "siege_lead"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "攻城战中的箭伤"}
    ],
    ("mid_heir_training", "heir_excellent"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "教育的劳心"}
    ],
    ("mid_gambling", "gamble_big"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "赌博的罪恶感"}
    ],
    ("first_quest", "quest_serious"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "首次任务的伤痕"}
    ],
    ("magic_duel", "duel_fight"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "决斗中的魔力灼伤"}
    ],
    ("chr_public_speech", "speech_inspire"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "公开演讲的精神压力"}
    ],
    ("squire_training", "train_hard"): [
        {"type": "modify_hp", "target": "hp", "value": -5, "description": "高强度训练的身体损耗"}
    ],
    ("mny_inherit_uncle", "inherit_invest"): [
        {"type": "modify_attribute", "target": "spr", "value": -1, "description": "投资的不安"}
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
            if key in PATCHES and PATCHES[key]:
                br["effects"].extend(PATCHES[key])
                changed += 1
                print(f"  {fname} {evt['id']}/{br['id']}: +{len(PATCHES[key])} 效果")
    
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        total += changed

print(f"\n共修改 {total} 个分支")
