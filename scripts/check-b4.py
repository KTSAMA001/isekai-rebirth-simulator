"""检查 B4 必选项清单中28个分支的当前 net 值"""
import json, glob, os

ATTR_EFFECTS = {"modify_attribute", "set_attribute"}

def calc_net(effects):
    net = 0
    for eff in effects:
        typ = eff.get("type", "")
        val = eff.get("value", 0)
        if typ == "modify_attribute":
            if isinstance(val, (int, float)):
                net += val
        elif typ == "set_flag":
            net += 1
        elif typ == "grant_item":
            net += 2
        elif typ == "add_talent":
            net += 3
        elif typ == "modify_hp":
            if isinstance(val, (int, float)):
                net += val / 10
    return net

# B4必选项清单
B4_TARGETS = [
    ("mid_body_decline", "defy_decline"),
    ("mid_body_decline", "accept_decline"),
    ("war_breaks_out", "war_support"),
    ("war_breaks_out", "war_hero"),
    ("food_culture", "food_write"),
    ("harvest_festival", "festival_compete"),
    ("pet_companion", "pet_adopt"),
    ("mid_chronic_pain", "seek_treatment"),
    ("mid_chronic_pain", "endure_pain"),
    ("mid_slowing_down", "adjust_pace"),
    ("mid_slowing_down", "push_through"),
    ("retirement", "retire_peaceful"),
    ("retirement", "continue_adventure"),
    ("mid_garden_retirement", "garden_social"),
    ("elder_peaceful_days", "peace_garden"),
    ("elder_peaceful_days", "peace_lonely"),
    ("elder_old_enemy", "enemy_meet"),
    ("hunting_trip", "hunt_big_game"),
    ("community_leader", "leader_accept"),
    ("midlife_crisis", "let_go"),
    ("midlife_crisis", "persist_dream"),
    ("mid_adopt_orphan", "adopt_take"),
    ("mid_adopt_orphan", "adopt_donate"),
    ("mid_adopt_orphan", "adopt_ignore"),
    ("wander_market", "buy_book"),
    ("wander_market", "buy_snack"),
    ("wander_market", "save_money"),
    ("market_haggling", "haggle_win"),
    ("street_performer", "perform_join"),
    ("gambling_night", "gamble_win"),
    ("gambling_night", "gamble_quit"),
    ("gambling_night", "gamble_lose"),
    ("mid_old_enemy", "enemy_negotiate"),
    ("mid_old_enemy", "enemy_hide"),
    ("mid_old_enemy", "enemy_fight"),
    ("spr_near_death", "neardeath_accept"),
    ("spr_near_death", "neardeath_bargain"),
    ("rare_reincarnation_hint", "pastlife_embrace"),
    ("rare_gods_gift", "god_accept"),
    ("young_rival", "befriend_him"),
    ("young_rival", "ignore_him"),
    ("young_rival", "surpass_him"),
    ("old_soldier_story", "listen_carefully"),
    ("guild_recruitment", "join_guild"),
    ("guild_recruitment", "refuse_guild"),
    ("guild_recruitment", "hesitate_guild"),
    ("scholar_guidance", "study_scholar"),
    ("scholar_guidance", "refuse_scholar"),
    ("scholar_guidance", "self_study"),
    ("village_feud", "speak_for_weak"),
    ("village_feud", "pretend_not_see"),
    ("village_feud", "tell_adult"),
]

# 收集所有事件
all_events = {}
for fpath in sorted(glob.glob("data/sword-and-magic/events/*.json")):
    data = json.load(open(fpath, "r", encoding="utf-8"))
    fname = os.path.basename(fpath)
    for evt in data:
        all_events[evt["id"]] = (evt, fname)

# 检查每个目标
seen_events = set()
for event_id, branch_id in B4_TARGETS:
    if event_id not in all_events:
        continue
    evt, fname = all_events[event_id]
    
    if event_id not in seen_events:
        seen_events.add(event_id)
        print(f"\n--- {event_id} ({fname}) ---")
    
    for br in evt.get("branches", []):
        if br["id"] == branch_id:
            net = calc_net(br.get("effects", []))
            dice = " [dice]" if "diceCheck" in br else ""
            effects_summary = []
            for e in br.get("effects", []):
                if e["type"] == "modify_attribute":
                    effects_summary.append(f"{e['target']}{e['value']:+d}")
                elif e["type"] in ("set_flag", "grant_item", "add_talent"):
                    effects_summary.append(f"{e['type']}:{e['target']}")
                elif e["type"] == "modify_hp":
                    effects_summary.append(f"hp{e['value']:+d}")
            print(f"  {branch_id:30s} net={net:+.1f}{dice}  [{', '.join(effects_summary)}]")
            break
    else:
        print(f"  {branch_id:30s} NOT FOUND")
