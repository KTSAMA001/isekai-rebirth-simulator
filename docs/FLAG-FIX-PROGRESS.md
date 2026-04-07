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

---

#### A. 拼写错误修复（1 个）

##### Flag: `dragon_slay`

**调查过程**：

1. 工具报 `dragon_slay` 为孤儿（被评语引用，无 set 来源）
2. 执行 `grep -rn 'dragon_slay' data/sword-and-magic/events/`，发现事件 ID 为 `dragon_slay_attempt`（注意事件 ID 和 flag 名不同），但里面 set 的 flag 是 `dragon_slayer`（不是 `dragon_slay`）
3. 执行 `grep -rn 'dragon_slayer' data/sword-and-magic/`，收集全部引用：

| 位置 | 文件 | 行为 |
|------|------|------|
| `adult.json:36` | 事件 dragon_slay_attempt 分支1 | `set_flag: dragon_slayer` ← 生产者 |
| `adult.json:3318` | 事件 dragon_slay_attempt 分支2 | `set_flag: dragon_slayer` ← 生产者 |
| `elder.json:9` | 事件 条件 | `has.flag.dragon_slayer` ← 消费者 ✅ |
| `elder.json:859` | 事件 条件 | `has.flag.dragon_slayer` ← 消费者 ✅ |
| `achievements.json:206` | 成就 dragon_slayer_ach | `has.flag.dragon_slayer` ← 消费者 ✅ |
| `achievements.json:404` | 成就 demon_slayer | `has.flag.dragon_slayer` ← 消费者 ✅ |
| `evaluations.json:112` | 评语 eva_dragon_slayer | `has.flag.dragon_slay` ← 消费者 ❌ 拼写错误 |

4. 搜索引擎代码 `grep -rn 'dragon_slay' src/` → 无结果
5. 搜索 `events.bak/` → `dragon_slay` 和 `dragon_slayer` 的引用模式与当前版本一致

**判断依据**：

- 事件 set 的是 `dragon_slayer`（2 处），消费者也用 `dragon_slayer`（4 处），全项目一致
- 只有评语 `eva_dragon_slayer` 一个地方写了 `dragon_slay`（少了 `er`）
- `dragon_slay` 这个 flag 在全项目中从未被 set，是一个不存在的 flag
- 评语 ID 是 `eva_dragon_slayer`（带 er），但 condition 写成了 `dragon_slay`（不带 er），属于手误

**修复**：

```diff
// evaluations.json line 112
- "condition": "has.flag.dragon_slay"
+ "condition": "has.flag.dragon_slayer"
```

**状态**：✅ 已修

---

#### B. Self-reference 清理（6 个）

##### 统一调查过程

对 6 个 flag 执行相同的调查步骤：

**Step 1**：执行全事件搜索 `set_flag`（排除 bak）
```bash
grep -rn '"target".*"festival_dance"' data/sword-and-magic/events/ --include='*.json' | grep -v bak
# → 无结果（6 个 flag 均无结果）
```

**Step 2**：执行全事件搜索条件引用（排除 bak）
```bash
grep -rn 'has\.flag\.festival_dance' data/sword-and-magic/events/ --include='*.json' | grep -v bak
# → adult.json:5046: "exclude": "has.flag.married | has.flag.festival_dance | has.flag.eloped"
# → 只有自身事件的 exclude 引用了它，无其他消费者
```

**Step 3**：搜索引擎代码
```bash
grep -rn 'festival_dance' src/engine/core/SimulationEngine.ts src/engine/modules/ConditionDSL.ts
# → 无结果（6 个 flag 均无引擎硬编码）
```

**Step 4**：读取事件 JSON 检查 effects
```python
# 伪代码：对每个事件，检查 event.effects 和所有 branch.effects 中是否有 set_flag
# 结果：6 个事件都没有 set_flag:<自身ID>
```

**Step 5**：确认事件已有 `unique: true`，引擎层面保证只触发一次

**统一判断依据**：

1. 全项目搜索确认：这 6 个 flag 从未被任何 `set_flag` 设置（事件 JSON + 引擎代码）
2. `has.flag.<自身ID>` 只出现在自身事件的 exclude 中，无外部消费者
3. `has.flag.<自身ID>` 永远返回 false，exclude 中的这个条件永远不生效
4. 事件已有 `unique: true`，引擎在 SimulationEngine 中维护已触发事件集合，不依赖 flag 去重
5. 结论：exclude 中的 self-reference 是冗余死代码，可能源于开发时预想"触发后设置 flag 来防重复"但实际用了 unique 机制，flag set 忘了写

##### 逐个修复详情

**B1. `festival_dance` — adult.json**

```json
// 修复前
"exclude": "has.flag.married | has.flag.festival_dance | has.flag.eloped"
// 修复后
"exclude": "has.flag.married | has.flag.eloped"
```
- 事件 branches set 的 flag：`in_relationship`（dance_together 分支）
- `has.flag.married` 和 `has.flag.eloped` 是真实的、被其他事件 set 的 flag → 保留

**B2. `forbidden_love` — adult.json**

```json
// 修复前
"exclude": "has.flag.married | has.flag.forbidden_love"
// 修复后
"exclude": "has.flag.married"
```
- 事件 branches set 的 flag：`eloped`（branch0）、`heartbroken`（branch1）
- `has.flag.married` 是真实 flag → 保留

**B3. `starlight_promise` — adult.json**

```json
// 修复前
"exclude": "has.flag.married | has.flag.starlight_promise | has.flag.eloped"
// 修复后
"exclude": "has.flag.married | has.flag.eloped"
```
- 事件 branches set 的 flag：`promise_keeper`（keep_promise 分支）

**B4. `quest_parting` — adult.json**

```json
// 修复前
"exclude": "has.flag.married | has.flag.quest_parting | has.flag.eloped"
// 修复后
"exclude": "has.flag.married | has.flag.eloped"
```
- 事件 branches set 的 flag：`lover_at_war`（branch0）、`heartbroken`（branch1）

**B5. `rescue_from_dungeon` — adult.json**

```json
// 修复前
"exclude": "has.flag.widowed | has.flag.rescue_from_dungeon"
// 修复后
"exclude": "has.flag.widowed"
```
- 事件 branches set 的 flag：`in_relationship`（branch0 和 branch1 都有）
- `has.flag.widowed` 是真实 flag → 保留

**B6. `lover_curse` — middle-age.json**

```json
// 修复前
"exclude": "has.flag.lover_curse"
// 修复后
"exclude": ""
```
- exclude 完全由 self-reference 组成，清理后为空字符串
- 事件 branches set 的 flag：`dark_ritual`（lover_curse_branch1）
- 空字符串在 ConditionDSL 解析中等同于无条件（不排除任何情况），`unique: true` 仍然生效

**状态**：✅ 全部已修

---

#### C. 补遗漏 set_flag（1 个）

##### Flag: `protect_family`

**调查过程**：

1. 工具报 `protect_family` 为孤儿（被引用但无 set 来源）
2. 搜索全部 set_flag 来源（排除 bak）：
```bash
grep -rn '"target".*"protect_family"' data/sword-and-magic/events/ --include='*.json' | grep -v bak
# → 无结果
```

3. 搜索全部条件引用（排除 bak）：
```bash
grep -rn 'has\.flag\.protect_family' data/sword-and-magic/ --include='*.json' | grep -v bak
```

结果：

| 文件 | 行 | 内容 | 性质 |
|------|----|------|------|
| `middle-age.json:2123` | 事件 protect_family | `"exclude": "has.flag.protect_family"` | 自身去重 |
| `achievements.json:980` | 成就 single_mother_warrior | `"condition": "has.flag.parent & has.flag.protect_family"` | **外部消费者** |

4. 搜索引擎代码 → 无硬编码

5. 与 B 类（self-reference）的关键区分：
   - B 类：flag 只被自身事件的 exclude 引用，无外部消费者 → 纯冗余
   - 本 case：flag 有外部消费者（成就 `single_mother_warrior`） → **这个 flag 有设计用途**

6. 读取事件详情：
```python
# middle-age.json 中 protect_family 事件
# id: protect_family
# unique: true
# include: (有前置条件)
# exclude: has.flag.protect_family  ← 合理：防重复触发
# branch fight_enemy:    effects = []     ← 没有 set_flag
# branch evacuate_family: effects = []     ← 也没有 set_flag
```

7. 分析分支描述：
   - `fight_enemy`："你选择挺身而出，正面与威胁对抗。" → 保护行为
   - `evacuate_family`："你优先确保家人的安全，放弃了家园。" → 保护行为
   - 两个分支都是保护家庭的叙事，都合理设置 `protect_family`

8. 分析成就消费者：
```json
// achievements.json
{
  "id": "single_mother_warrior",
  "condition": "has.flag.parent & has.flag.protect_family"
}
```
   - 需要同时有 `parent` + `protect_family` 才触发
   - `parent` flag 在其他事件中正常 set
   - `protect_family` 从未被 set → 成就永远无法触发 → 是 bug

**判断依据**：

- `protect_family` 不是 self-reference 冗余——它有外部消费者（成就），说明游戏设计中预期这个 flag 会被设置
- 两个分支的叙事都是"保护家庭"的行为，逻辑上应该都设置这个 flag
- 这是一个事件实现遗漏，不是冗余代码
- 决策：在两个分支都补 set_flag，因为无论选择战斗还是撤离，都体现了"守护家庭"

**修复**：

```python
# 在 fight_enemy 和 evacuate_family 两个分支的 effects 开头插入：
{
  "type": "set_flag",
  "target": "protect_family",
  "value": 1,
  "description": "守护家庭"
}
```

**验证**：修复后 `check-flags` 工具不再报告 `protect_family` 为孤儿。成就 `single_mother_warrior` 现在可以被触发。

**状态**：✅ 已修

---

### Round 2 — 待决策（剩余 10 个）

#### D. 事件被删除但评语还在（1 个）

##### Flag: `justice_seek`

**调查过程**：

1. 工具报 `justice_seek` 为孤儿（被评语引用，无 set 来源）
2. 搜索当前版本事件 `grep -rn 'justice_seek' data/sword-and-magic/events/` → **无结果**
3. 搜索 bak 版本 `grep -rn 'justice_seek' data/sword-and-magic/events.bak/`：

```
events.bak/childhood.json:583: "target": "justice_seek"
```

4. 读取 bak 中完整事件上下文：
```json
{
  "type": "set_flag",
  "target": "justice_seek",
  "value": 1,
  "description": "追求正义"
}
// 事件效果：魅力 -1（被人说是告密者）+ set justice_seek
// 叙事：少年目睹不公，选择告发/举报
```

5. 搜索评语引用：
```bash
grep -rn 'justice_seek' data/sword-and-magic/ --include='*.json' | grep -v bak
# → evaluations.json:360: "condition": "has.flag.justice_seek & attribute.chr >= 15"
```

6. 搜索引擎代码 → 无硬编码

**判断依据**：

- 当前版本 `events/childhood.json` 中完全没有 `justice_seek` 的痕迹（既没有 set 也没有条件引用）
- bak 版本中有完整的 set 逻辑，说明事件曾经存在但被删除了
- 评语 `eva_justice_seeker` 仍然引用，且需要 `justice_seek & chr >= 15`
- 删除原因不明——可能是内容审查、叙事重构、或意外删除

**待决策**：⏳ 恢复事件 or 删除评语？

---

#### E. 评语引用了未实现的 flag（8 个）

##### 统一调查过程

对 8 个 flag 执行相同调查：

**Step 1**：搜索 set 来源（排除 bak）
```bash
# 以 craftsman 为例
grep -rn '"target".*"craftsman"' data/sword-and-magic/events/ --include='*.json' | grep -v bak
# → 无结果（8 个均无结果）
```

**Step 2**：搜索条件引用（排除 bak）
```bash
grep -rn 'has\.flag\.craftsman' data/sword-and-magic/ --include='*.json' | grep -v bak
# → evaluations.json:176: "condition": "has.flag.craftsman"
# → 只有评语一处引用
```

**Step 3**：搜索引擎代码 → 8 个均无硬编码

**Step 4**：检查是否存在相似名称的 flag（可能是命名不一致）
```bash
# 以 guild_leader 为例
grep -rn 'guild' data/sword-and-magic/events/ --include='*.json' | grep set_flag | grep -v bak
# → guild_member 有 set，但 guild_leader 没有
```

| 孤儿 Flag | 存在的相似 Flag | 是否同一个？ |
|-----------|----------------|-------------|
| `craftsman` | 无 | — |
| `cursed` | `cursed_birth` | ❌ 不同。`cursed_birth` 是出生时的诅咒标记，`cursed` 应该是贯穿一生的诅咒状态 |
| `dark_magic` | `dark_mage` | ❌ 不同。`dark_mage` 是职业身份，`dark_magic` 是魔法类型掌握 |
| `demon_hunt` | `demon_power` | ❌ 不同。`demon_power` 是魔族血统觉醒，`demon_hunt` 是狩猎魔族的经历 |
| `elemental_mastery` | 无 | — |
| `guild_leader` | `guild_member` | ❌ 不同。`guild_member` 是加入行会，`guild_leader` 是成为行会长 |
| `lover_death` | 无 | — |
| `reincarnated_memory` | 无 | — |

**统一判断依据**：

- 8 个 flag 都只被一个评语引用，无事件 set、无成就引用、无引擎硬编码
- 评语条件永远为 false → 评语永远不会被显示给玩家
- 相似名称的 flag 是不同的概念，不能替代
- 这 8 个评语可能是为未来事件预留的"目标评语"，也可能是已放弃的内容

**待决策**：⏳ 保留等后续事件补充 or 删除评语？

| Flag | 评语 ID | 评语标题 | 评语描述 | 说明 |
|------|---------|---------|---------|------|
| `craftsman` | eva_master_crafter | 匠心独运 | "你的双手比任何魔法都要可靠。" | 未实现的工匠路线 |
| `cursed` | eva_cursed_one | 诅咒之子 | "诅咒像影子一样跟随着你..." | 未实现（与 `cursed_birth` 不同） |
| `dark_magic` | eva_dark_path | 暗影之路 | "你在黑暗中找到了力量..." | 未实现（与 `dark_mage` 不同） |
| `demon_hunt` | eva_demon_hunter | 魔族猎手 | "魔族？你不只是猎杀，你理解它们..." | 未实现（与 `demon_power` 不同） |
| `elemental_mastery` | eva_elemental_master | 元素之主 | "火焰、冰霜、雷霆...都是你的武器。" | 未实现 |
| `guild_leader` | eva_guild_leader | 行会之长 | "你建立了一个帝国——一个属于匠人的帝国。" | 未实现（与 `guild_member` 不同） |
| `lover_death` | eva_tragic_hero | 悲剧英雄 | "你失去了一切，但你没有倒下。" | 未实现的伴侣死亡事件 |
| `reincarnated_memory` | eva_reincarnated | 轮回之忆 | "你突然想起了前世的一切..." | 未实现的前世记忆机制 |

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

对每个死 Flag：
1. 全局搜索是否被条件引用（可能漏扫了某种语法如 `flag:xxx`）
2. 检查引擎代码是否有隐式消费（如路线评分、stat 计算等非条件引用场景）
3. 分析事件链：A 事件 set 的 flag 是否被 B 事件的 prerequisites 引用
4. 检查是否有相似名称的 flag 存在（命名不一致导致）
5. 给出结论分类：

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
| 2026-04-07 | 补充修复进度文档调查细节 | `fix/orphan-flags-round1` | `f3817df` |

---

## 五、下次继续时的操作

1. 读取本文档 + `FLAG-LIFECYCLE-AUDIT.md`
2. 检查 Round 2 的 10 个待决策项是否有新决定
3. 从死 Flag 审计 Task 1（birth.json, 9 个）开始
4. 每个死 Flag 的调查过程按本文档 Round 1 的格式记录
5. 完成后更新本文档的"死 Flag 审计"部分
