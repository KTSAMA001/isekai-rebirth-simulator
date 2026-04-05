#!/usr/bin/env python3
"""
异世界重生模拟器 — 内容扩展工具
================================================
用于安全地添加/验证/检查游戏内容的 CLI 工具。
支持：事件、成就、天赋、种族、物品、评语、预设（身份）、属性。

用法:
  python3 scripts/content-tool.py <命令> [参数]

命令:
  add <类型> [--file <目标文件>]   交互式添加新内容
  template <类型> [--out <文件>]   生成内容模板
  validate [--file <文件>]         校验数据文件合法性
  check-flags                      检查 Flag 一致性
  list <类型>                      列出现有内容摘要
  stats                            显示内容统计信息
  check-dsl <表达式>               测试 DSL 条件表达式语法

类型:
  event, achievement, talent, race, item, evaluation, preset, attribute
"""

import json
import os
import sys
import re
import argparse
from collections import defaultdict
from pathlib import Path
from typing import Any

# ==================== 路径配置 ====================

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "sword-and-magic"
EVENTS_DIR = DATA_DIR / "events"

# 数据文件映射
DATA_FILES = {
    "event": list(EVENTS_DIR.glob("*.json")),
    "achievement": [DATA_DIR / "achievements.json"],
    "talent": [DATA_DIR / "talents.json"],
    "race": [DATA_DIR / "races.json"],
    "item": [DATA_DIR / "items.json"],
    "evaluation": [DATA_DIR / "evaluations.json"],
    "preset": [DATA_DIR / "presets.json"],
    "attribute": [DATA_DIR / "attributes.json"],
}

# 事件文件按年龄段映射
EVENT_FILE_MAP = {
    "birth": (0, 1),
    "childhood": (2, 6),
    "teenager": (7, 15),
    "youth": (16, 24),
    "adult": (25, 50),
    "middle-age": (51, 80),
    "elder": (81, 999),
}

# ==================== 数据加载 ====================

def load_json(path: Path) -> Any:
    """加载 JSON 文件"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: Any) -> None:
    """保存 JSON 文件（美化输出，保持中文可读）"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ 已保存: {path.relative_to(PROJECT_ROOT)}")


def load_all_events() -> list[dict]:
    """加载所有事件"""
    events = []
    for f in sorted(EVENTS_DIR.glob("*.json")):
        events.extend(load_json(f))
    return events


def load_all_data(content_type: str) -> list[dict]:
    """加载指定类型的所有数据"""
    result = []
    for f in DATA_FILES.get(content_type, []):
        if f.exists():
            data = load_json(f)
            if isinstance(data, list):
                result.extend(data)
            else:
                result.append(data)
    return result


def get_event_file_for_age(min_age: int) -> Path:
    """根据 minAge 推荐事件应归入哪个文件"""
    for name, (lo, hi) in EVENT_FILE_MAP.items():
        if lo <= min_age <= hi:
            return EVENTS_DIR / f"{name}.json"
    return EVENTS_DIR / "elder.json"

# ==================== Schema 定义 ====================

REQUIRED_FIELDS = {
    "event": ["id", "title", "description", "minAge", "maxAge", "weight", "effects"],
    "achievement": ["id", "name", "description", "icon", "hidden", "condition", "category"],
    "talent": ["id", "name", "description", "rarity", "icon", "effects", "draftWeight"],
    "race": ["id", "name", "icon", "description", "lore", "playable", "lifespanRange", "attributeModifiers"],
    "item": ["id", "name", "description", "icon", "rarity", "category", "effects", "acquireText"],
    "evaluation": ["id", "title", "description", "rarity", "priority", "condition"],
    "preset": ["id", "name", "title", "description", "attributes", "locked"],
    "attribute": ["id", "name", "icon", "description", "color", "min", "max", "defaultValue", "group"],
}

VALID_ENUMS = {
    "priority": ["critical", "major", "minor"],
    "rarity": ["common", "rare", "legendary"],
    "item_category": ["weapon", "armor", "accessory", "consumable", "special"],
    "gender": ["male", "female", "other"],
    "effect_type": [
        "modify_attribute", "set_attribute", "add_talent", "trigger_event",
        "set_flag", "remove_flag", "modify_hp", "set_counter", "modify_counter",
        "grant_item", "modify_max_hp_bonus",
    ],
    "talent_rarity": ["common", "rare", "legendary"],
    "route_mode": ["any", "all"],
}

# ==================== DSL 条件语法检查 ====================

def check_dsl_syntax(expr: str) -> list[str]:
    """检查 DSL 条件表达式语法，返回错误列表"""
    errors = []
    if not expr or not expr.strip():
        return errors

    # 包含 lambda/箭头函数的复杂表达式（EvaluatorModule 专用），跳过检查
    if '=>' in expr or '.some' in expr or '.every' in expr:
        return errors

    # 基本 token 检查
    tokens = re.split(r'\s*([&|()])\s*', expr.strip())
    tokens = [t.strip() for t in tokens if t.strip()]

    for token in tokens:
        if token in ("&", "|", "(", ")"):
            continue

        # has.flag.xxx / has.talent.xxx / has.event.xxx / has.achievement.xxx / has.counter.xxx
        if token.startswith("has."):
            parts = token.split(".", 2)
            if len(parts) < 3:
                errors.append(f"不完整的 has 表达式: '{token}'，需要 has.<kind>.<id>")
            elif parts[1] not in ("flag", "talent", "event", "achievement", "counter"):
                errors.append(f"未知的 has 类型: '{parts[1]}'，支持: flag/talent/event/achievement/counter")
            continue

        # !has.xxx (否定)
        if token.startswith("!has."):
            inner = token[1:]
            inner_errors = check_dsl_syntax(inner)
            errors.extend(inner_errors)
            continue

        # 比较表达式: attribute.xxx >= N, lifespan >= N, hp >= N, event.count.xxx >= N, age >= N, etc.
        cmp_match = re.match(
            r'^(attribute\.peak\.\w+|attribute\.\w+|event\.count\.\w+|achievement\.count|lifespan|hp|age|counter\.\w+|character\.race|character\.gender|result\.score|result\.grade)\s*'
            r'(==|!=|>=|<=|>|<)\s*'
            r'(.+)$',
            token
        )
        if cmp_match:
            left, op, right = cmp_match.groups()
            # 检查右侧是否为合法值
            if left.startswith("character.") or left == "result.grade":
                # 字符串比较，右侧应为标识符
                if not re.match(r'^[a-zA-Z_]\w*$', right):
                    errors.append(f"比较值应为标识符: '{right}'")
            else:
                # 数值比较
                try:
                    float(right)
                except ValueError:
                    errors.append(f"比较值应为数字: '{right}'")
            continue

        # state.xxx 表达式（支持复杂路径如 state.inventory.items.some/every）
        if token.startswith("state."):
            # state 表达式格式多样，这里只做基础检查
            continue

        errors.append(f"无法识别的 DSL token: '{token}'")

    return errors

# ==================== 内容模板 ====================

TEMPLATES = {
    "event": {
        "id": "new_event_id",
        "title": "事件标题",
        "description": "事件描述文本",
        "minAge": 20,
        "maxAge": 40,
        "weight": 5,
        "unique": True,
        "priority": "minor",
        "tag": "life",
        "routes": ["*"],
        "include": "",
        "exclude": "",
        "effects": [
            {"type": "modify_attribute", "target": "int", "value": 1}
        ],
        "branches": [
            {
                "id": "branch_0",
                "title": "选项A",
                "description": "选项A的描述",
                "effects": [
                    {"type": "modify_attribute", "target": "str", "value": 2}
                ],
                "diceCheck": {
                    "attribute": "str",
                    "dc": 12,
                    "description": "体魄判定 DC12"
                },
                "failureEffects": [
                    {"type": "modify_hp", "target": "hp", "value": -5}
                ],
                "successText": "成功时的文案",
                "failureText": "失败时的文案"
            },
            {
                "id": "branch_1",
                "title": "选项B",
                "description": "选项B的描述",
                "effects": [
                    {"type": "modify_attribute", "target": "int", "value": 2}
                ]
            }
        ],
        "_注释": {
            "可选字段": {
                "races": ["elf", "human", "goblin"],
                "genders": ["male", "female"],
                "prerequisites": ["has.flag.some_flag"],
                "mutuallyExclusive": ["has.flag.conflicting_flag"],
                "raceVariants": {
                    "goblin": {"title": "哥布林版标题", "description": "哥布林版描述"}
                },
                "genderVariants": {
                    "female": {"title": "女性版标题", "description": "女性版描述"}
                },
                "weightModifiers": [
                    {"condition": "attribute.str >= 20", "weightMultiplier": 1.5}
                ]
            },
            "效果类型": [
                "modify_attribute（加减属性）",
                "set_flag（设置标记）",
                "remove_flag（移除标记）",
                "modify_hp（加减HP）",
                "grant_item（给予物品）",
                "set_counter / modify_counter（计数器操作）",
                "trigger_event（链式触发事件）"
            ],
            "注意": "删除 _注释 字段后才是合法的事件JSON"
        }
    },
    "achievement": {
        "id": "new_achievement_id",
        "name": "成就名称",
        "description": "成就描述",
        "icon": "🏆",
        "hidden": False,
        "condition": "lifespan >= 50",
        "category": "人生",
        "_注释": {
            "可选字段": {
                "races": ["elf"],
                "genders": ["female"],
                "reward": "奖励描述"
            },
            "常用条件格式": [
                "lifespan >= N",
                "has.flag.xxx",
                "attribute.peak.str >= N",
                "event.count.xxx >= N",
                "achievement.count >= N",
                "条件A & 条件B（AND）",
                "条件A | 条件B（OR）"
            ]
        }
    },
    "talent": {
        "id": "new_talent_id",
        "name": "天赋名称",
        "description": "天赋描述",
        "rarity": "rare",
        "icon": "⭐",
        "draftWeight": 10,
        "effects": [
            {
                "type": "modify_attribute",
                "target": "str",
                "value": 3,
                "description": "体魄 +3"
            }
        ],
        "_注释": {
            "稀有度权重": "common=100, rare=10, legendary=1",
            "可选字段": {
                "requireRace": ["elf"],
                "requireGender": "female",
                "requirePreset": ["preset_noble"],
                "conditions": "attribute.str >= 10",
                "mutuallyExclusive": ["conflicting_talent_id"],
                "flavorText": "风味文本"
            },
            "效果类型": [
                "modify_attribute（永久属性修正）",
                "multiply_attribute（属性倍率修正）",
                "add_event（添加专属事件）",
                "trigger_on_age（特定年龄触发效果）"
            ]
        }
    },
    "race": {
        "id": "new_race",
        "name": "新种族名",
        "icon": "🧬",
        "description": "种族完整描述",
        "lore": "种族选择界面的简介",
        "playable": True,
        "lifespanRange": [60, 120],
        "attributeModifiers": [
            {"attributeId": "str", "value": 2},
            {"attributeId": "int", "value": -1}
        ],
        "themeColor": "#ffffff",
        "_注释": {
            "可选字段": {
                "genderModifiers": [
                    {
                        "gender": "male",
                        "attributeModifiers": [{"attributeId": "str", "value": 2}],
                        "exclusiveTalents": ["talent_id"]
                    }
                ],
                "exclusiveTalents": ["race_talent_id"],
                "exclusiveRoutes": ["route_id"],
                "eventDir": "race_name"
            },
            "新增种族后还需要": [
                "1. 在 events/ 中添加种族专属事件（races: ['new_race']）",
                "2. 在 talents.json 中添加种族专属天赋",
                "3. 在 achievements.json 中添加种族专属成就",
                "4. 在 evaluations.json 中添加种族专属评语",
                "5. 为现有通用事件添加 raceVariants"
            ]
        }
    },
    "item": {
        "id": "new_item_id",
        "name": "物品名称",
        "description": "物品描述",
        "icon": "🗡️",
        "rarity": "rare",
        "category": "weapon",
        "acquireText": "你获得了此物品！",
        "effects": [
            {
                "type": "attr_passive_growth",
                "target": "str",
                "value": 0.5
            }
        ],
        "_注释": {
            "category 可选": "weapon, armor, accessory, consumable, special",
            "效果类型": [
                "hp_regen_bonus（每年额外HP恢复）",
                "hp_flat_bonus（获得时一次性HP加成）",
                "attr_passive_growth（每年属性被动成长）",
                "skill_check_bonus（判定成功率加成）",
                "damage_reduction（受伤减免比例）",
                "death_save（免死一次，HP归零时恢复到value值）",
                "conditional_regen（条件HP恢复，需填condition）"
            ]
        }
    },
    "evaluation": {
        "id": "eva_new_id",
        "title": "评语标题",
        "description": "评语完整描述文本",
        "rarity": "rare",
        "priority": 10,
        "condition": "has.flag.some_flag & attribute.int >= 20",
        "_注释": {
            "rarity": "common / rare / legendary",
            "priority": "数值越高越优先展示（0-20之间）,最终只展示前3条",
            "常用条件": [
                "has.flag.xxx",
                "attribute.xxx >= N",
                "state.age >= N",
                "state.eventLog.length >= N",
                "!has.flag.xxx（排除）",
                "条件A & 条件B（AND）/ 条件A | 条件B（OR）"
            ]
        }
    },
    "preset": {
        "id": "preset_new",
        "name": "预设名称",
        "title": "身份头衔",
        "description": "身份描述",
        "locked": False,
        "attributes": {
            "str": 5,
            "int": 10,
            "chr": 8,
            "mny": 15,
            "spr": 5,
            "mag": 3,
            "luk": 4
        },
        "_注释": {
            "可选字段": {
                "talents": ["自带天赋ID"],
                "exclusiveTalents": ["专属可抽取天赋ID"],
                "unlockCondition": "has.achievement.xxx（解锁条件）"
            },
            "属性总和建议": "与其他预设保持平衡（当前默认约50点）"
        }
    },
    "attribute": {
        "id": "new_attr",
        "name": "属性名称",
        "icon": "✨",
        "description": "属性描述",
        "color": "#ffffff",
        "min": 0,
        "max": 100,
        "defaultValue": 10,
        "group": "combat",
        "_注释": {
            "group 可选": "combat, social, magic, misc",
            "hidden": "设为 true 则不在面板显示（如 HP、运势等）"
        }
    },
}

# ==================== 命令实现 ====================

def cmd_template(args):
    """生成内容模板"""
    content_type = args.type
    if content_type not in TEMPLATES:
        print(f"❌ 不支持的类型: {content_type}")
        print(f"   支持: {', '.join(TEMPLATES.keys())}")
        return 1

    template = TEMPLATES[content_type]

    if args.out:
        out_path = Path(args.out)
        save_json(out_path, template)
    else:
        print(json.dumps(template, ensure_ascii=False, indent=2))

    return 0


def cmd_validate(args):
    """校验数据文件"""
    errors = []
    warnings = []

    if args.file:
        files_to_check = [Path(args.file)]
        # 推断类型
        ctype = None
        for t, paths in DATA_FILES.items():
            for p in paths:
                if str(p) == str(files_to_check[0].resolve()) or p.name == files_to_check[0].name:
                    ctype = t
                    break
        if not ctype:
            print(f"⚠️  无法推断文件类型，将进行通用检查")
    else:
        files_to_check = None
        ctype = None

    # 各类型校验
    for content_type, required in REQUIRED_FIELDS.items():
        if ctype and ctype != content_type:
            continue

        items = load_all_data(content_type)
        seen_ids = set()

        for i, item in enumerate(items):
            item_id = item.get("id", f"<无ID, 索引{i}>")

            # 必填字段检查
            for field in required:
                if field not in item:
                    errors.append(f"[{content_type}] {item_id}: 缺少必填字段 '{field}'")

            # ID 重复检查
            if "id" in item:
                if item["id"] in seen_ids:
                    errors.append(f"[{content_type}] ID 重复: '{item['id']}'")
                seen_ids.add(item["id"])

            # 枚举值检查
            if content_type == "event":
                if item.get("priority") and item["priority"] not in VALID_ENUMS["priority"]:
                    errors.append(f"[event] {item_id}: priority 值无效 '{item['priority']}'")
                for eff in item.get("effects", []):
                    if eff.get("type") and eff["type"] not in VALID_ENUMS["effect_type"]:
                        errors.append(f"[event] {item_id}: 效果类型无效 '{eff['type']}'")
                # 年龄范围检查
                if "minAge" in item and "maxAge" in item:
                    if item["minAge"] > item["maxAge"]:
                        errors.append(f"[event] {item_id}: minAge({item['minAge']}) > maxAge({item['maxAge']})")

            # DSL 条件语法检查
            for field in ("include", "exclude", "condition"):
                if field in item and item[field]:
                    dsl_errors = check_dsl_syntax(item[field])
                    for e in dsl_errors:
                        warnings.append(f"[{content_type}] {item_id}.{field}: {e}")

            # 分支检查
            if content_type == "event" and "branches" in item:
                branch_ids = set()
                for branch in item["branches"]:
                    if "id" not in branch:
                        errors.append(f"[event] {item_id}: 分支缺少 id")
                    elif branch["id"] in branch_ids:
                        errors.append(f"[event] {item_id}: 分支 ID 重复 '{branch['id']}'")
                    else:
                        branch_ids.add(branch["id"])

                    if "title" not in branch:
                        errors.append(f"[event] {item_id}: 分支缺少 title")

                    for field in ("requireCondition",):
                        if field in branch and branch[field]:
                            dsl_errors = check_dsl_syntax(branch[field])
                            for e in dsl_errors:
                                warnings.append(f"[event] {item_id}.branch.{field}: {e}")

    # 输出结果
    if errors:
        print(f"\n❌ 发现 {len(errors)} 个错误:")
        for e in errors:
            print(f"  ✗ {e}")

    if warnings:
        print(f"\n⚠️  发现 {len(warnings)} 个警告:")
        for w in warnings:
            print(f"  ⚠ {w}")

    if not errors and not warnings:
        print("✅ 所有数据文件校验通过")

    return 1 if errors else 0


def cmd_check_flags(args):
    """检查 Flag 一致性 — set_flag 和 has.flag 的引用匹配"""
    print("🔍 正在分析 Flag 一致性...\n")

    # 收集所有 set_flag（生产者）
    flag_producers: dict[str, list[str]] = defaultdict(list)
    # 收集所有 remove_flag
    flag_removers: dict[str, list[str]] = defaultdict(list)
    # 收集所有 has.flag 引用（消费者）
    flag_consumers: dict[str, list[str]] = defaultdict(list)

    events = load_all_events()

    def scan_effects(effects: list[dict], event_id: str):
        for eff in effects:
            if eff.get("type") == "set_flag":
                flag_producers[eff["target"]].append(event_id)
            elif eff.get("type") == "remove_flag":
                flag_removers[eff["target"]].append(event_id)

    def scan_dsl(expr: str, event_id: str):
        for m in re.finditer(r'has\.flag\.(\w+)', expr):
            flag_consumers[m.group(1)].append(event_id)

    # 扫描事件
    for event in events:
        eid = event["id"]
        scan_effects(event.get("effects", []), eid)
        for field in ("include", "exclude"):
            if event.get(field):
                scan_dsl(event[field], eid)
        if event.get("prerequisites"):
            for p in event["prerequisites"]:
                scan_dsl(p, eid)
        if event.get("mutuallyExclusive"):
            for m in event["mutuallyExclusive"]:
                scan_dsl(m, eid)
        for branch in event.get("branches", []):
            scan_effects(branch.get("effects", []), f"{eid}/{branch.get('id', '?')}")
            scan_effects(branch.get("failureEffects", []), f"{eid}/{branch.get('id', '?')}")
            if branch.get("requireCondition"):
                scan_dsl(branch["requireCondition"], f"{eid}/{branch.get('id', '?')}")

    # 扫描成就
    achievements = load_all_data("achievement")
    for ach in achievements:
        if ach.get("condition"):
            for m in re.finditer(r'has\.flag\.(\w+)', ach["condition"]):
                flag_consumers[m.group(1)].append(f"achievement:{ach['id']}")

    # 扫描评语
    evaluations = load_all_data("evaluation")
    for ev in evaluations:
        if ev.get("condition"):
            for m in re.finditer(r'has\.flag\.(\w+)', ev["condition"]):
                flag_consumers[m.group(1)].append(f"evaluation:{ev['id']}")

    # 扫描路线 (manifest)
    manifest = load_json(DATA_DIR / "manifest.json")
    for route in manifest.get("routes", []):
        for field in ("enterCondition", "exitCondition"):
            if route.get(field):
                for m in re.finditer(r'has\.flag\.(\w+)', route[field]):
                    flag_consumers[m.group(1)].append(f"route:{route['id']}")
        for flag in route.get("entryFlags", []):
            flag_producers[flag].append(f"route:{route['id']}")

    # 分析
    all_flags = set(flag_producers.keys()) | set(flag_consumers.keys()) | set(flag_removers.keys())

    orphan_producers = []  # set 了但没人 has.flag 消费
    orphan_consumers = []  # has.flag 了但没人 set
    remove_without_set = []  # remove 了但没人 set

    for flag in sorted(all_flags):
        producers = flag_producers.get(flag, [])
        consumers = flag_consumers.get(flag, [])
        removers = flag_removers.get(flag, [])

        if producers and not consumers:
            orphan_producers.append((flag, producers))
        if consumers and not producers:
            orphan_consumers.append((flag, consumers))
        if removers and not producers:
            remove_without_set.append((flag, removers))

    # 输出
    print(f"📊 Flag 统计: 共 {len(all_flags)} 个唯一 Flag")
    print(f"  生产者(set_flag): {len(flag_producers)} 个 Flag")
    print(f"  消费者(has.flag): {len(flag_consumers)} 个 Flag")
    print(f"  移除者(remove_flag): {len(flag_removers)} 个 Flag")

    if orphan_consumers:
        print(f"\n❌ {len(orphan_consumers)} 个 Flag 被引用(has.flag)但从未被设置(set_flag):")
        for flag, refs in orphan_consumers:
            print(f"  ✗ {flag}")
            for r in refs[:3]:
                print(f"    ← {r}")
            if len(refs) > 3:
                print(f"    ... 还有 {len(refs)-3} 处引用")

    if orphan_producers:
        print(f"\n⚠️  {len(orphan_producers)} 个 Flag 被设置但从未被任何条件引用:")
        for flag, refs in orphan_producers[:20]:
            print(f"  ⚠ {flag}")
            for r in refs[:2]:
                print(f"    → {r}")
        if len(orphan_producers) > 20:
            print(f"  ... 还有 {len(orphan_producers)-20} 个")

    if remove_without_set:
        print(f"\n⚠️  {len(remove_without_set)} 个 Flag 被 remove 但从未被 set:")
        for flag, refs in remove_without_set:
            print(f"  ⚠ {flag}")
            for r in refs:
                print(f"    ✗ {r}")

    if not orphan_consumers and not remove_without_set:
        print("\n✅ Flag 一致性检查通过 — 所有消费的 Flag 都有生产者")

    return 1 if orphan_consumers else 0


def cmd_list(args):
    """列出现有内容摘要"""
    content_type = args.type
    items = load_all_data(content_type)

    if not items:
        print(f"❌ 未找到 {content_type} 类型的数据")
        return 1

    print(f"\n📋 {content_type} 列表 (共 {len(items)} 条):")
    print("─" * 60)

    if content_type == "event":
        # 按文件分组
        for f in sorted(EVENTS_DIR.glob("*.json")):
            file_events = load_json(f)
            print(f"\n  📂 {f.name} ({len(file_events)} 个事件)")
            # 只显示前几个
            for ev in file_events[:5]:
                races_tag = f" [{','.join(ev.get('races', []))}]" if ev.get('races') else ""
                print(f"    {ev['id']}: {ev['title']} (age {ev['minAge']}-{ev['maxAge']}){races_tag}")
            if len(file_events) > 5:
                print(f"    ... 还有 {len(file_events)-5} 个")
    elif content_type == "achievement":
        # 按分类分组
        by_cat = defaultdict(list)
        for ach in items:
            by_cat[ach.get("category", "未分类")].append(ach)
        for cat in sorted(by_cat.keys()):
            cat_items = by_cat[cat]
            print(f"\n  📂 {cat} ({len(cat_items)} 个)")
            for ach in cat_items:
                hidden = "🔒" if ach.get("hidden") else "  "
                races = f" [{','.join(ach.get('races', []))}]" if ach.get('races') else ""
                print(f"  {hidden} {ach['icon']} {ach['name']}: {ach['description']}{races}")
    elif content_type == "talent":
        by_rarity = defaultdict(list)
        for t in items:
            by_rarity[t.get("rarity", "unknown")].append(t)
        for rarity in ["legendary", "rare", "common"]:
            if rarity in by_rarity:
                talents = by_rarity[rarity]
                print(f"\n  ⭐ {rarity} ({len(talents)} 个)")
                for t in talents:
                    race = f" [{','.join(t.get('requireRace', []))}]" if t.get('requireRace') else ""
                    print(f"    {t['icon']} {t['name']}: {t['description'][:40]}{race}")
    elif content_type == "race":
        for r in items:
            playable = "✅" if r.get("playable") else "❌"
            print(f"  {playable} {r['icon']} {r['name']} (寿命 {r['lifespanRange'][0]}-{r['lifespanRange'][1]})")
            mods = ", ".join(f"{m['attributeId']}{'+' if m['value']>0 else ''}{m['value']}" for m in r.get("attributeModifiers", []))
            if mods:
                print(f"      属性修正: {mods}")
    elif content_type == "evaluation":
        by_rarity = defaultdict(list)
        for e in items:
            by_rarity[e.get("rarity", "unknown")].append(e)
        for rarity in ["legendary", "rare", "common"]:
            if rarity in by_rarity:
                evals = by_rarity[rarity]
                print(f"\n  ⭐ {rarity} ({len(evals)} 个)")
                for e in evals:
                    print(f"    [{e.get('priority', 0):2d}] {e['title']}: {e['condition']}")
    else:
        for item in items:
            item_id = item.get("id", item.get("name", "?"))
            name = item.get("name", item.get("title", "?"))
            print(f"  {item_id}: {name}")

    return 0


def cmd_stats(args):
    """显示内容统计信息"""
    print("\n📊 异世界重生模拟器 — 内容统计")
    print("═" * 50)

    for content_type in REQUIRED_FIELDS:
        items = load_all_data(content_type)
        label = {
            "event": "事件",
            "achievement": "成就",
            "talent": "天赋",
            "race": "种族",
            "item": "物品",
            "evaluation": "评语",
            "preset": "预设(身份)",
            "attribute": "属性",
        }.get(content_type, content_type)
        print(f"  {label}: {len(items)}")

    # 事件详细统计
    events = load_all_events()
    race_events = [e for e in events if e.get("races")]
    unique_events = [e for e in events if e.get("unique")]
    branched_events = [e for e in events if e.get("branches")]

    print(f"\n  事件详情:")
    print(f"    种族专属事件: {len(race_events)}")
    print(f"    唯一事件: {len(unique_events)}")
    print(f"    含分支事件: {len(branched_events)}")

    # Flag 统计
    all_flags = set()
    for event in events:
        for eff in event.get("effects", []):
            if eff.get("type") == "set_flag":
                all_flags.add(eff["target"])
        for branch in event.get("branches", []):
            for eff in branch.get("effects", []):
                if eff.get("type") == "set_flag":
                    all_flags.add(eff["target"])
    print(f"    独立 Flag 数: {len(all_flags)}")

    # 事件文件分布
    print(f"\n  事件文件分布:")
    for f in sorted(EVENTS_DIR.glob("*.json")):
        file_events = load_json(f)
        print(f"    {f.stem}: {len(file_events)}")

    return 0


def cmd_check_dsl(args):
    """测试 DSL 条件表达式语法"""
    expr = args.expression
    errors = check_dsl_syntax(expr)
    if errors:
        print(f"❌ DSL 语法错误:")
        for e in errors:
            print(f"  ✗ {e}")
        return 1
    else:
        print(f"✅ DSL 语法正确: {expr}")
        return 0


def cmd_add(args):
    """交互式添加新内容"""
    content_type = args.type

    if content_type not in TEMPLATES:
        print(f"❌ 不支持的类型: {content_type}")
        return 1

    print(f"\n📝 添加新 {content_type}")
    print("─" * 40)

    # 获取 ID
    item_id = input(f"  ID (唯一标识符): ").strip()
    if not item_id:
        print("❌ ID 不能为空")
        return 1

    # 检查 ID 冲突
    existing = load_all_data(content_type)
    existing_ids = {item.get("id") for item in existing}
    if item_id in existing_ids:
        print(f"❌ ID '{item_id}' 已存在")
        return 1

    # 基于模板创建
    template = json.loads(json.dumps(TEMPLATES[content_type]))  # 深拷贝
    template["id"] = item_id

    # 移除注释字段
    template.pop("_注释", None)

    # 交互式填写关键字段
    required = REQUIRED_FIELDS.get(content_type, [])
    for field in required:
        if field == "id":
            continue
        current = template.get(field)
        if isinstance(current, str):
            value = input(f"  {field} [{current}]: ").strip()
            if value:
                template[field] = value
        elif isinstance(current, (int, float)):
            value = input(f"  {field} [{current}]: ").strip()
            if value:
                try:
                    template[field] = int(value) if isinstance(current, int) else float(value)
                except ValueError:
                    print(f"  ⚠️  数值无效，使用默认值 {current}")
        elif isinstance(current, bool):
            value = input(f"  {field} [{current}] (y/n): ").strip().lower()
            if value in ("y", "yes", "true"):
                template[field] = True
            elif value in ("n", "no", "false"):
                template[field] = False

    # 确定目标文件
    if content_type == "event":
        min_age = template.get("minAge", 20)
        target_file = args.file or str(get_event_file_for_age(min_age))
        target_path = Path(target_file)
    elif args.file:
        target_path = Path(args.file)
    else:
        target_path = DATA_FILES[content_type][0]

    # 确认
    print(f"\n  预览:")
    print(json.dumps(template, ensure_ascii=False, indent=2))
    print(f"\n  目标文件: {target_path.relative_to(PROJECT_ROOT)}")

    confirm = input("\n  确认添加? (y/n): ").strip().lower()
    if confirm not in ("y", "yes"):
        print("  ❌ 已取消")
        return 0

    # 写入
    if target_path.exists():
        data = load_json(target_path)
        if isinstance(data, list):
            data.append(template)
        else:
            print(f"❌ 目标文件不是数组格式")
            return 1
    else:
        data = [template]

    save_json(target_path, data)

    # 校验新增数据
    print("\n  🔍 正在校验...")
    dsl_fields = ["include", "exclude", "condition"]
    for field in dsl_fields:
        if template.get(field):
            dsl_errors = check_dsl_syntax(template[field])
            if dsl_errors:
                print(f"  ⚠️  {field} DSL 警告:")
                for e in dsl_errors:
                    print(f"    ⚠ {e}")

    print(f"\n✅ 已添加 {content_type}: {item_id}")
    return 0

# ==================== 主入口 ====================

def main():
    parser = argparse.ArgumentParser(
        description="异世界重生模拟器 — 内容扩展工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 scripts/content-tool.py stats                      # 内容统计
  python3 scripts/content-tool.py template event             # 生成事件模板
  python3 scripts/content-tool.py template event --out /tmp/my_event.json
  python3 scripts/content-tool.py validate                   # 校验所有数据
  python3 scripts/content-tool.py check-flags                # Flag 一致性检查
  python3 scripts/content-tool.py list achievement           # 列出所有成就
  python3 scripts/content-tool.py list race                  # 列出所有种族
  python3 scripts/content-tool.py check-dsl "has.flag.xxx & attribute.str >= 10"
  python3 scripts/content-tool.py add event                  # 交互式添加事件
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="可用命令")

    # template
    p_template = subparsers.add_parser("template", help="生成内容模板")
    p_template.add_argument("type", choices=TEMPLATES.keys(), help="内容类型")
    p_template.add_argument("--out", help="输出文件路径")

    # validate
    p_validate = subparsers.add_parser("validate", help="校验数据文件")
    p_validate.add_argument("--file", help="指定要校验的文件路径")

    # check-flags
    subparsers.add_parser("check-flags", help="检查 Flag 一致性")

    # list
    p_list = subparsers.add_parser("list", help="列出现有内容")
    p_list.add_argument("type", choices=REQUIRED_FIELDS.keys(), help="内容类型")

    # stats
    subparsers.add_parser("stats", help="内容统计信息")

    # check-dsl
    p_dsl = subparsers.add_parser("check-dsl", help="检查 DSL 条件语法")
    p_dsl.add_argument("expression", help="DSL 条件表达式")

    # add
    p_add = subparsers.add_parser("add", help="交互式添加新内容")
    p_add.add_argument("type", choices=TEMPLATES.keys(), help="内容类型")
    p_add.add_argument("--file", help="目标数据文件路径")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    cmd_map = {
        "template": cmd_template,
        "validate": cmd_validate,
        "check-flags": cmd_check_flags,
        "list": cmd_list,
        "stats": cmd_stats,
        "check-dsl": cmd_check_dsl,
        "add": cmd_add,
    }

    return cmd_map[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
