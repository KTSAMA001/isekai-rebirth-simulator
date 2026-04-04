"""
Phase B1: 超标分支改造 (net >= +6)
根据 phase1-cost-benefit-symmetry.md 3.2 节，给高净值分支增加负面代价。
策略：
- 有 diceCheck 的分支：成功路径已有风险，只需微调（降 1-2 点效果或加小代价）
- 无 diceCheck 的分支：增加显著代价（HP损失、属性扣减、spr代价）
- 目标：所有分支 net <= +5
"""
import json, glob, os

# ========== 补丁定义 ==========
# key = (event_id, branch_id)
# value = {"add_effects": [...], "remove_effects_idx": [...], "modify_effects": {...}}

PATCHES = {
    # ===== 3.2 严重超标 (无diceCheck) =====
    
    # war_hero net=+8.5 → 加 spr-3, hp-15
    ("war_breaks_out", "war_hero"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -3, "description": "战争的心理创伤"},
            {"type": "modify_hp", "target": "hp", "value": -15, "description": "战场负伤"}
        ]
    },
    # publish_invention net=+8 → 加 spr-2, mny-2
    ("reincarnated_invention", "publish_invention"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "暴露身份的不安"},
            {"type": "modify_attribute", "target": "mny", "value": -2, "description": "研发投入成本"}
        ]
    },
    # keep_secret net=+6 → 加 spr-2
    ("reincarnated_invention", "keep_secret"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "独自承担秘密的压力"}
        ]
    },
    # god_accept (rare_gods_gift) net=+8 → 加 spr-2, hp-10 (god's burden)
    ("rare_gods_gift", "god_accept"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "神力的负担"},
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "承受神力的冲击"}
        ]
    },
    # seal_power (master_spell) net=+6 → 加 spr-2
    ("master_spell", "seal_power"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "封印力量的精神消耗"}
        ]
    },
    # enroll_academy net=+7 → 加 mny-3 (学费)
    ("magic_academy_enrollment", "enroll_academy"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "mny", "value": -3, "description": "高昂的学院费用"}
        ]
    },
    # research_publish net=+6 → 加 str-2 (久坐体弱)
    ("magic_research_breakthrough", "research_publish"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "长期研究导致体魄下降"}
        ]
    },
    # book_bestseller net=+6 → 加 str-2
    ("write_a_book", "book_bestseller"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "伏案写作体力下降"}
        ]
    },
    # tame_creature net=+6 → 加 hp-10
    ("magical_creature_tame", "tame_creature"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "驯服过程中被抓伤"}
        ]
    },
    # mercenary_steal net=+6 → 已有良好数值，但无代价。加 spr-2, chr-2
    ("mercenary_contract", "mercenary_steal"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "偷窃的道德负担"},
            {"type": "modify_attribute", "target": "chr", "value": -2, "description": "被同行看不起"}
        ]
    },
    # venture_invest net=+6 → 加 spr-2
    ("business_venture", "venture_invest"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "创业压力"}
        ]
    },
    # dragon_raise net=+6 → 加 mny-3, hp-5
    ("rare_dragon_egg", "dragon_raise"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "mny", "value": -3, "description": "养龙花费巨大"},
            {"type": "modify_hp", "target": "hp", "value": -5, "description": "幼龙的火焰失控"}
        ]
    },
    # pastlife_embrace net=+6 → 加 spr-2
    ("rare_reincarnation_hint", "pastlife_embrace"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "前世记忆的困扰"}
        ]
    },
    # technique_oral net=+6 → 加 str-2 (传授消耗体力)
    ("elder_technique_pass", "technique_oral"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "传授消耗了最后的体力"}
        ]
    },
    # become_god net=+6 → 加 hp-30, spr-3 (终极代价)
    ("final_cataclysm", "become_god"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -30, "description": "承受创世之力的代价"},
            {"type": "modify_attribute", "target": "spr", "value": -3, "description": "失去凡人情感"}
        ]
    },
    # potion_use net=+6 → 加 hp-10 (副作用)
    ("mid_magic_potion", "potion_use"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "药剂的副作用"}
        ]
    },
    # team_up (advanced_dungeon) net=+6 → 加 mny-2 (分赃)
    ("advanced_dungeon", "team_up"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "mny", "value": -2, "description": "与队友分享战利品"}
        ]
    },
    # tactical_approach net=+6 → 加 spr-2
    ("knight_glory", "tactical_approach"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "战术决策的精神压力"}
        ]
    },
    # study_ancient (library_discovery) net=+6 → 加 str-2, spr-1
    ("library_discovery", "study_ancient"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "连日研读导致体力下降"},
            {"type": "modify_attribute", "target": "spr", "value": -1, "description": "古老知识的精神压迫"}
        ]
    },
    # memory_accept net=+6 → 加 spr-2
    ("reincarnated_memory", "memory_accept"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "前世记忆带来的精神负担"}
        ]
    },
    # slow_burn (dating_start) net=+6 → 加 mny-2
    ("dating_start", "slow_burn"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "mny", "value": -2, "description": "约会开销"}
        ]
    },
    # master_accept net=+6 → 加 str-2 (严苛修行)
    ("secret_master", "master_accept"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "严苛修行导致身体劳损"}
        ]
    },
    # awakening_magic net=+6 → 加 hp-5, spr-1
    ("talent_awakening", "awakening_magic"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -5, "description": "觉醒时的魔力暴走"},
            {"type": "modify_attribute", "target": "spr", "value": -1, "description": "失控的恐惧"}
        ]
    },
    # arena_champion net=+6 → 加 hp-10
    ("underground_arena", "arena_champion"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "战斗中的累积伤害"}
        ]
    },
    
    # ===== 有 diceCheck 但成功路径仍超标(net>=8)的：微调减少 1-2 点效果 =====
    # deep_dive net=+12 → 加 hp-15, spr-3
    ("advanced_dungeon", "deep_dive"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -15, "description": "深层地下城的伤害"},
            {"type": "modify_attribute", "target": "spr", "value": -3, "description": "黑暗中的恐惧"}
        ]
    },
    # bounty_accept net=+10 → 加 hp-10, spr-2
    ("adv_bounty", "bounty_accept"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "追捕过程中受伤"},
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "暴力行为的心理影响"}
        ]
    },
    # lead_charge net=+10 → 加 hp-10, spr-2
    ("knight_glory", "lead_charge"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "冲锋中被兵器划伤"},
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "目睹战友倒下"}
        ]
    },
    # expand_business net=+9 → 加 spr-2, str-2
    ("merchant_career", "expand_business"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "管理扩张的焦虑"},
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "过度操劳体力透支"}
        ]
    },
    # lottery_jackpot net=+9 → 加 spr-3 (暴富后的空虚)
    ("luk_lottery", "lottery_jackpot"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -3, "description": "暴富后的空虚与不安"}
        ]
    },
    # guild_found net=+8 → 加 spr-2
    ("merchant_guild", "guild_found"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "创立公会的巨大压力"}
        ]
    },
    # god_accept (challenge) net=+8 → 加 hp-10, str-2
    ("challenge_god_trial", "god_accept"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "神的试炼对身体的损伤"},
            {"type": "modify_attribute", "target": "str", "value": -2, "description": "试炼消耗了大量体力"}
        ]
    },
    # knight_pass net=+8 → 加 spr-2
    ("knight_examination", "knight_pass"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -2, "description": "骑士誓言的沉重责任"}
        ]
    },
    # open_forbidden net=+8 → 加 spr-3 (禁忌的代价)
    ("dark_mage_choice", "open_forbidden"): {
        "add_effects": [
            {"type": "modify_attribute", "target": "spr", "value": -3, "description": "禁忌知识侵蚀心智"}
        ]
    },
    # explore_deep net=+8 → 加 hp-10
    ("dungeon_explore_1", "explore_deep"): {
        "add_effects": [
            {"type": "modify_hp", "target": "hp", "value": -10, "description": "深入地牢的伤害"}
        ]
    },
    # magic_graduate net=+8 (无分支事件) → 后面在B3处理
    # royal_summon net=+8 (无分支事件) → 后面在B3处理
}


def apply_patches():
    total_patched = 0
    
    for fpath in sorted(glob.glob("data/sword-and-magic/events/*.json")):
        data = json.load(open(fpath, "r", encoding="utf-8"))
        fname = os.path.basename(fpath)
        file_patched = 0
        
        for evt in data:
            eid = evt["id"]
            for br in evt.get("branches", []):
                bid = br["id"]
                key = (eid, bid)
                if key in PATCHES:
                    patch = PATCHES[key]
                    
                    # 添加效果
                    if "add_effects" in patch:
                        br["effects"].extend(patch["add_effects"])
                        file_patched += 1
                        print(f"  {fname} {eid}/{bid}: +{len(patch['add_effects'])} 个代价效果")
        
        if file_patched > 0:
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
            total_patched += file_patched
    
    print(f"\n共修改 {total_patched} 个分支")

apply_patches()
