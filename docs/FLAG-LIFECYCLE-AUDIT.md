# Flag 生命周期审计 — 项目记忆文档

> 本文档由璃生成，用于跨会话持续追踪 Flag 审计进度。
> 最后更新：2026-04-07 22:04

---

## 1. 审计概述

### 目标
对 `isekai-rebirth-simulator` 的全部 Flag 进行 **set → consume → 游戏结束** 的全生命周期一致性审计。

### Flag 在事件中的结构

每个事件是一个 JSON 容器，Flag 的"设置"和"使用"全在里面：

```json
{
  "id": "事件ID",
  "include": "has.flag.xxx",        // 消费：前置条件（满足才能触发）
  "exclude": "has.flag.yyy",        // 消费：排除条件（满足就不触发）
  "prerequisites": ["flag:zzz"],    // 消费：另一种条件语法
  "unique": true,                   // 只触发一次（不依赖 flag 去重）
  "effects": [
    { "type": "set_flag", "target": "aaa" },   // 生产：设置 flag
    { "type": "remove_flag", "target": "bbb" } // 移除
  ],
  "branches": [{
    "id": "branch0",
    "requireCondition": "has.flag.ccc",   // 分支前置条件（消费）
    "effects": [
      { "type": "set_flag", "target": "ddd" }
    ],
    "failureEffects": [
      { "type": "set_flag", "target": "eee" }
    ]
  }]
}
```

**三种类别**：
- **生产者** (`set_flag`): 在 `effects` / `branches[].effects` / `branches[].failureEffects` 中
- **消费者** (`has.flag.xxx` / `flag:xxx`): 在 `include` / `exclude` / `prerequisites` / `requireCondition` 中
- **额外消费者**: 成就 (`achievements.json`)、评语 (`evaluations.json`)、路线 (`manifest.json`)

### 检测方法

全事件搜索 `set_flag` + `has.flag` 就能覆盖绝大部分。具体步骤：

1. 扫全部事件 JSON → 收集所有 `set_flag` 的 target → **生产者集合**
2. 扫全部事件 JSON → 收集条件表达式里的 `has.flag.xxx` / `flag:xxx` → **消费者集合**
3. 额外扫成就、评语、路线 → 补充消费者
4. 查引擎代码 `SimulationEngine.ts` → 硬编码 set（当前仅 `miracle_survival`, `near_death`）
5. **生产者 - 消费者 = 死 Flag**，**消费者 - 生产者 = 孤儿 Flag**

### 检测工具

| 工具 | 位置 | 说明 |
|------|------|------|
| `check-flags` | `scripts/content-tool.py check-flags` | 项目原生 Python 工具，只扫 `has.flag.xxx` 不扫 `flag:xxx` |
| `flag-lifecycle-tracker` | `tests/engine/flag-lifecycle-tracker.test.ts` | TS 测试，静态分析 + 50 局动态验证 |
| `flag-tracker helper` | `tests/helpers/flag-tracker.ts` | 辅助函数：`collectProducedFlags`, `collectConsumedFlags`, `collectKnownFlags` |

**运行命令**：
```bash
# 项目工具
python3 scripts/content-tool.py check-flags

# TS 测试（输出 JSON 报告）
npx vitest run tests/engine/flag-lifecycle-tracker.test.ts
```

**输出文件**：
- `tests/output/flag-lifecycle-report.json`

### 与项目工具的差异（已确认）

| 差异 | Flag | 原因 |
|------|------|------|
| 孤儿差 1 | `miracle_survival` | 项目工具不扫引擎硬编码，实际是引擎 set 的 |
| 死 Flag 差 1 | `magic_academy` | 项目工具只扫 `has.flag.xxx` 不扫 `flag:xxx` 语法 |

---

## 2. 数据总览

| 指标 | 数值 |
|------|------|
| 总唯一 Flag | 268 |
| 生产者（有 set 来源）| 251 |
| 消费者（有条件引用）| 160 |
| 孤儿 Flag（有 consume 无 set）| 17 |
| 死 Flag（有 set 无 consume）| 108 |
| 移除者 Flag | 4 |
| 引擎硬编码 set | 2 (`miracle_survival`, `near_death`) |
| 动态采样覆盖 | 146/268 (54.5%) |

---

## 3. 孤儿 Flag 审计结果 ✅（已完成 2026-04-07）

### A. 🔴 Flag 名拼写错误（1 个）— 可直接修复

| Flag | 问题 | 修复方案 |
|------|------|---------|
| `dragon_slay` | 评语 `eva_dragon_slayer` 写了 `dragon_slay`，事件 set 的是 `dragon_slayer`。成就用对了 | 改评语 condition: `has.flag.dragon_slay` → `has.flag.dragon_slayer` |

### B. 🟡 Self-reference bug（6 个）— 可直接修复

事件用 `has.flag.<自身ID>` 在 exclude 防重复触发，但从未 set 过该 flag。`unique: true` 已够用。

| Flag | 事件 | 文件 | 修复方案 |
|------|------|------|---------|
| `festival_dance` | festival_dance | adult.json | 从 exclude 删除 `has.flag.festival_dance` |
| `forbidden_love` | forbidden_love | adult.json | 从 exclude 删除 `has.flag.forbidden_love` |
| `starlight_promise` | starlight_promise | adult.json | 从 exclude 删除 `has.flag.starlight_promise` |
| `quest_parting` | quest_parting | adult.json | 从 exclude 删除 `has.flag.quest_parting` |
| `rescue_from_dungeon` | rescue_from_dungeon | adult.json | 从 exclude 删除 `has.flag.rescue_from_dungeon` |
| `lover_curse` | lover_curse | middle-age.json | 从 exclude 删除 `has.flag.lover_curse` |

### C. 🔴 事件漏了 set_flag（1 个）— 需补代码

| Flag | 事件 | 文件 | 问题 | 修复方案 |
|------|------|------|------|---------|
| `protect_family` | protect_family | middle-age.json | exclude 引用 + 成就 `single_mother_warrior` 依赖，但 branches 里无 `set_flag: protect_family` | 在某个 branch effect 中补 set |

### D. 🟡 事件被删除但评语还在（1 个）— 需决策

| Flag | 问题 | 决策选项 |
|------|------|---------|
| `justice_seek` | `events.bak/childhood.json` 里有 set，当前版本事件被删了，评语 `eva_justice_seeker` 仍引用 | 恢复事件 or 删除评语 |

### E. ⚪ 评语引用了未实现的 flag（8 个）— 待后续补充

| Flag | 消费来源 | 说明 |
|------|---------|------|
| `craftsman` | eva_master_crafter | 未实现的工匠路线 flag |
| `cursed` | eva_cursed_one | 未实现（`cursed_birth` 存在但不是同一个） |
| `dark_magic` | eva_dark_path | 未实现（`dark_mage` 存在但不是同一个） |
| `demon_hunt` | eva_demon_hunter | 未实现（`demon_power` 存在但不是同一个） |
| `elemental_mastery` | eva_elemental_master | 未实现 |
| `guild_leader` | eva_guild_leader | 未实现（`guild_member` 存在但不是同一个） |
| `lover_death` | eva_tragic_hero | 未实现的伴侣死亡 flag |
| `reincarnated_memory` | eva_reincarnated | 未实现的前世记忆 flag |

---

## 4. 死 Flag 审计（待完成）

以下 108 个 flag 被 set 但无任何条件引用（consume）。按事件文件分组。

### 待办任务 ID

| 任务 | ID | Flag 数 | 状态 |
|------|----|---------|------|
| birth.json | `task-1775570005501-flag-birth-json-9-548b3ec8` | 9 | todo |
| childhood.json | `task-1775570005501-flag-childhood-json-19-6eb4be52` | 19 | todo |
| teenager.json | `task-1775570005501-flag-teenager-json-23-c42aaf60` | 23 | todo |
| youth.json | `task-1775570005501-flag-youth-json-23-10624048` | 23 | todo |
| adult.json | `task-1775570005501-flag-adult-json-33-8e8f3a8b` | 33 | todo |
| middle-age + elder + manifest | `task-1775570005501-flag-middle-age-json-16-elder-json-8-manifest-5-a96d8ff3` | 29 | todo |
| 汇总报告 | `task-1775570005501-item-97b43fe0` | — | todo |

### 项目 ID
`project-1775569975849-flag-3c2c85ce`

### 108 个死 Flag 完整清单

#### birth.json（9 个）
`barracks_birth`, `cursed_birth`, `dragon_omen_birth`, `hunter_lineage`, `lineage_marked`, `loving_family`, `shadow_birth`, `shaman_apprentice`, `wild_birth`

#### childhood.json（19 个）
`brave`, `bullied`, `bullied_repeat`, `deep_observer`, `dirty_player`, `early_magic_control`, `emotional_magic`, `fighter_spirit`, `has_pet`, `herbal_knowledge`, `noble_educated`, `parental_help`, `planted_seed_at_tree`, `smart_seeker`, `timid_deep`, `true_friend`, `world_tree_empowered`

#### teenager.json（23 个）
`arcane_student`, `brave`, `cynical`, `dark_mage`, `duel_champion`, `emotional_maturity`, `forbidden_knowledge`, `has_pet`, `heartbreak_growth`, `herbal_knowledge`, `justice_lover`, `knight_tactician`, `noble_combat_trained`, `on_journey`, `prophet_dream`, `pure_heart`, `quest_victory`, `squire_failed`, `team_leader`, `trusted_by_dean`

#### youth.json（23 个）
`capable_lord`, `demon_power`, `dragon_awakened`, `experienced_guard`, `fighter_spirit`, `fugitive`, `has_ally`, `inherited_wealth`, `justice_lover`, `legend_explorer`, `lucky_coin`, `magic_natural`, `magic_top_student`, `mysterious_encounter`, `philanthropist`, `potion_power`, `scholar_warrior`, `social_star`, `stage_mage`, `tough_reputation`, `treasure_hunter`

#### adult.json（33 个）
`abyss_walker`, `artifact_owner`, `author`, `dark_mage`, `dark_ritual`, `death_pact`, `dragon_patrol`, `economic_genius`, `famous_hunter`, `forest_investigator`, `has_pet`, `healer`, `inner_peace`, `international_trader`, `inventor_fame`, `justice_lover`, `lottery_winner`, `master_disciple`, `master_mentor`, `mercenary_veteran`, `mysterious_encounter`, `never_give_up`, `power_sealed`, `promise_keeper`, `refused_marriage`, `rogue_contact`, `tax_reformer`, `treasure_hunter`, `true_friend`, `truth_seeker`, `wedding_grand`

#### middle-age.json（16 个）
`author`, `avenger`, `became_god`, `beloved_lord`, `business_tycoon`, `dark_ritual`, `forbidden_knowledge`, `founder`, `great_scholar`, `iron_lord`, `iron_will`, `old_enemy_defeated`, `philanthropist`, `tough_spirit`

#### elder.json（8 个）
`eternal_glory`, `legend_legacy`, `master_mentor`, `mentor_legend`, `peaceful_end`, `quiet_end`, `spirit_ascended`

#### manifest/路线（5 个）
`on_adventurer_path`, `on_knight_path`, `on_mage_path`, `on_merchant_path`, `on_scholar_path`

### 死 Flag 审计检查流程

对每个死 Flag：
1. 全局搜索是否被条件引用（可能漏扫了某种语法）
2. 检查引擎代码是否有隐式消费（如路线评分）
3. 分析是否作为事件链的"中间状态"（A set → B prerequisites 引用）——如果 B 的 prerequisites 没引用，那就是真的死 Flag
4. 给出结论分类：
   - **可删除**：完全无用的 flag，从未被消费
   - **应添加消费者**：有叙事意义但没有被条件引用
   - **设计待定**：可能是未来内容预留的 flag

---

## 5. 关键教训

### v4 初版的死 Flag = 0 bug
`collectKnownFlags` 同时扫描了条件表达式和 set_flag effects，导致生产者和消费者混在一个 Set 里。
测试里 `consumedFlagNames = new Set(allKnownFlags)` 循环论证，死 flag 永远 = 0。
**修复**：拆分为 `collectProducedFlags` 和 `collectConsumedFlags`。
**教训**：生产者和消费者必须从独立来源收集，不能混用。

### 项目工具 check-flags 的扫描局限
- 只扫 `has.flag.xxx`，不扫 `flag:xxx` 语法 → 漏消费 `magic_academy`
- 不扫引擎代码 → 误报 `miracle_survival` 为孤儿

---

## 6. 璃的记忆索引

- **璃的 daily notes**: `~/.openclaw/workspace/memory/2026-04-07.md`
- **Work Layer 任务**: 项目 ID `project-1775569975849-flag-3c2c85ce`
- **本文档**: `/Users/ktsama/Projects/isekai-rebirth-simulator/docs/FLAG-LIFECYCLE-AUDIT.md`
- **测试工具**: `tests/engine/flag-lifecycle-tracker.test.ts` + `tests/helpers/flag-tracker.ts`
- **JSON 报告**: `tests/output/flag-lifecycle-report.json`

下次继续时：读取本文档 → 看待办任务状态 → 从 Task 2（birth.json）开始。
