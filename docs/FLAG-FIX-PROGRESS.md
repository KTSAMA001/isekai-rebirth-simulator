# Flag 审计修复进度

> 与 [FLAG-LIFECYCLE-AUDIT.md](./FLAG-LIFECYCLE-AUDIT.md) 配套使用。
> 审计文档 = 发现问题；本文档 = 修复进展与决策记录。
> 最后更新：2026-04-07

---

## 分支管理

| 分支 | 用途 | 状态 |
|------|------|------|
| `fix/orphan-flags-round1` | 孤儿 Flag 第一轮修复 | ✅ 已提交，待合并 |
| `fix/dead-flags-round1` | 死 Flag 审计修复（待建） | 🔜 |

---

## 一、孤儿 Flag 修复（17 → 10）

> 孤儿 = 有条件引用（consume）但无 set 来源的 flag

### Round 1 — 已完成

**分支**：`fix/orphan-flags-round1`  
**Commit**：`bb3279a`  
**日期**：2026-04-07

#### A. 拼写错误修复（1 个）

| Flag | 文件 | 问题 | 修复 | 状态 |
|------|------|------|------|------|
| `dragon_slay` | evaluations.json | 评语 `eva_dragon_slayer` 写了 `dragon_slay`，但事件 set 的是 `dragon_slayer`，成就也用的是 `dragon_slayer` | 改 condition 为 `has.flag.dragon_slayer` | ✅ 已修 |

**判断依据**：全项目搜索 `dragon_slay`，只有评语一处引用，从未被 set。而 `dragon_slayer` 有 2 处 set（adult.json）+ 3 处条件引用（成就 + elder.json）。

#### B. Self-reference 清理（6 个）

| Flag | 事件 | 文件 | 问题 | 修复 | 状态 |
|------|------|------|------|------|------|
| `festival_dance` | festival_dance | adult.json | exclude 引用自身 flag 但从未 set，`unique:true` 已够用 | 从 exclude 删除 | ✅ 已修 |
| `forbidden_love` | forbidden_love | adult.json | 同上 | 从 exclude 删除 | ✅ 已修 |
| `starlight_promise` | starlight_promise | adult.json | 同上 | 从 exclude 删除 | ✅ 已修 |
| `quest_parting` | quest_parting | adult.json | 同上 | 从 exclude 删除 | ✅ 已修 |
| `rescue_from_dungeon` | rescue_from_dungeon | adult.json | 同上 | 从 exclude 删除 | ✅ 已修 |
| `lover_curse` | lover_curse | middle-age.json | 同上 | exclude 清空 | ✅ 已修 |

**判断依据**：搜索全部事件 JSON + 引擎代码，这 6 个 flag 从未被任何 `set_flag` 设置。exclude 里的 `has.flag.<自身ID>` 永远为 false，是死条件。

#### C. 补遗漏 set_flag（1 个）

| Flag | 事件 | 文件 | 问题 | 修复 | 状态 |
|------|------|------|------|------|------|
| `protect_family` | protect_family | middle-age.json | exclude + 成就 `single_mother_warrior` 依赖，但两个分支都无 set_flag | 在 fight_enemy 和 evacuate_family 两个分支都补了 `set_flag: protect_family` | ✅ 已修 |

**判断依据**：与 self-reference 不同，`protect_family` 有外部消费者（成就 + 其他事件 exclude），说明是设计中有用的 flag，只是事件实现漏了。

### Round 2 — 待决策（剩余 10 个）

#### D. 事件被删除但评语还在（1 个）

| Flag | 消费来源 | 问题 | 决策 |
|------|---------|------|------|
| `justice_seek` | eva_justice_seeker (`has.flag.justice_seek & attribute.chr >= 15`) | `events.bak/childhood.json` 里有 set，当前版本事件被删了 | ⏳ 恢复事件 or 删除评语？ |

**背景**：事件内容是少年时代目睹不公，选择告发 → 魅力 -1 但获得 `justice_seek` flag。被删原因不明。

#### E. 评语引用了未实现的 flag（8 个）

| Flag | 评语 ID | 评语标题 | 说明 | 决策 |
|------|---------|---------|------|------|
| `craftsman` | eva_master_crafter | 匠心独运 | 未实现的工匠路线 flag | ⏳ 保留等后续 or 删除？ |
| `cursed` | eva_cursed_one | 诅咒之子 | 未实现（`cursed_birth` 存在但不同） | ⏳ |
| `dark_magic` | eva_dark_path | 暗影之路 | 未实现（`dark_mage` 存在但不同） | ⏳ |
| `demon_hunt` | eva_demon_hunter | 魔族猎手 | 未实现（`demon_power` 存在但不同） | ⏳ |
| `elemental_mastery` | eva_elemental_master | 元素之主 | 未实现 | ⏳ |
| `guild_leader` | eva_guild_leader | 行会之长 | 未实现（`guild_member` 存在但不同） | ⏳ |
| `lover_death` | eva_tragic_hero | 悲剧英雄 | 未实现的伴侣死亡 flag | ⏳ |
| `reincarnated_memory` | eva_reincarnated | 轮回之忆 | 未实现的前世记忆 flag | ⏳ |

**说明**：这些评语永远不会被触发（条件永远为 false），保留它们不影响游戏，但也不起作用。可以作为未来事件的预留目标，也可以清理掉。

---

## 二、死 Flag 审计（108 个）

> 死 Flag = 有 set 来源但无任何条件引用的 flag

**状态**：🔍 待审计

### 任务清单

| # | 文件 | Flag 数 | Work Task ID | 状态 |
|---|------|---------|-------------|------|
| 1 | birth.json | 9 | `task-1775570005501-flag-birth-json-9-548b3ec8` | 🔜 |
| 2 | childhood.json | 19 | `task-1775570005501-flag-childhood-json-19-6eb4be52` | 🔜 |
| 3 | teenager.json | 23 | `task-1775570005501-flag-teenager-json-23-c42aaf60` | 🔜 |
| 4 | youth.json | 23 | `task-1775570005501-flag-youth-json-23-10624048` | 🔜 |
| 5 | adult.json | 33 | `task-1775570005501-flag-adult-json-33-8e8f3a8b` | 🔜 |
| 6 | middle-age + elder + manifest | 29 | `task-1775570005501-flag-middle-age-json-16-elder-json-8-manifest-5-a96d8ff3` | 🔜 |

### 死 Flag 审计流程

对每个死 Flag，结论分为三类：

| 分类 | 含义 | 处理方式 |
|------|------|---------|
| **可删除** | 完全无用的 flag，set 了也没人用 | 从事件 effects 中删除 set_flag |
| **应添加消费者** | 有叙事意义但没被条件引用 | 在后续事件的条件中引用 |
| **设计待定** | 可能是未来内容预留 | 保留，在文档中标注 |

### 死 Flag 完整清单

见 [FLAG-LIFECYCLE-AUDIT.md](./FLAG-LIFECYCLE-AUDIT.md) 第 4 节。

---

## 三、审计工具状态

| 工具 | 状态 | 说明 |
|------|------|------|
| `scripts/content-tool.py check-flags` | ✅ 可用 | 孤儿 17→10，已验证 |
| `tests/engine/flag-lifecycle-tracker.test.ts` | ✅ 可用 | 静态+动态分析 |
| `tests/helpers/flag-tracker.ts` | ✅ 可用 | 辅助函数 |

---

## 四、变更日志

| 日期 | 操作 | 分支 | Commit |
|------|------|------|--------|
| 2026-04-07 | 孤儿 Round 1：修 8 项（A×1 + B×6 + C×1） | `fix/orphan-flags-round1` | `bb3279a` |
| 2026-04-07 | 归档 17 个过时文档到 docs/archive/ | `master` | `3ee749e` |

---

## 五、下次继续时的操作

1. 读取本文档 + `FLAG-LIFECYCLE-AUDIT.md`
2. 检查 Round 2 的 10 个待决策项是否有新决定
3. 从死 Flag 审计 Task 1（birth.json, 9 个）开始
4. 完成后更新本文档的"死 Flag 审计"部分
