---
name: content-audit
description: Flag/事件/成就等内容一致性审计与修复技能。涵盖孤儿 Flag（有 consume 无 set）、死 Flag（有 set 无 consume）、Self-reference bug、拼写错误、遗漏 set_flag 的发现、调查、修复和留档全流程。当用户提到"审计"、"检查一致性"、"查 Flag"、"flag audit"、"check flags"、"内容审计"时触发。也适用于事件链断链检查、成就条件验证、评语可达性检查等。
---

# 内容一致性审计技能

## 概述

对项目数据 JSON 进行一致性审计，发现并修复 Flag/事件/成就/评语之间的引用断裂。

## 审计类型

| 类型 | 定义 | 示例 |
|------|------|------|
| **孤儿 Flag** | 有条件引用（consume）但无 set 来源 | 评语引用了不存在的 flag |
| **死 Flag** | 有 set 来源但无任何条件引用 | 事件 set 了 flag 但没人用 |
| **Self-reference** | 事件 exclude 引用自身 ID 作为 flag 但从未 set | `unique:true` 已够用 |
| **拼写错误** | flag 名手误 | `dragon_slay` vs `dragon_slayer` |
| **遗漏 set_flag** | 有外部消费者但事件没 set | 成就依赖的 flag 没人设置 |
| **事件断链** | A 事件 set 的 flag 没有被任何 B 事件引用 | 事件链断裂 |
| **评语不可达** | 评语条件永远为 false | 引用了未实现的 flag |

## 调查流程

### Step 1：数据采集

```bash
# 全事件搜索 set_flag（生产者）
grep -rn '"target"' data/sword-and-magic/events/ --include='*.json' | grep -v bak

# 全事件搜索条件引用（消费者）
grep -rn 'has\.flag\.\|flag:' data/sword-and-magic/ --include='*.json' | grep -v bak

# 搜索引擎代码硬编码
grep -rn '<flag_name>' src/engine/
```

### Step 2：分类判断

对每个异常 flag 执行：

1. **搜索 set 来源** — 事件 JSON + 引擎代码 + bak 对比
2. **搜索全部消费者** — 事件条件 + 成就 + 评语 + 路线
3. **检查相似名称** — 是否存在命名不一致（如 `cursed` vs `cursed_birth`）
4. **读取事件上下文** — 理解叙事意图，判断是 bug 还是设计

### Step 3：结论分类

| 分类 | 含义 | 处理 |
|------|------|------|
| **可直接修复** | 明确的 bug | 立即修复 |
| **需决策** | 可能是设计意图 | 提交给用户 |
| **设计待定** | 未来内容预留 | 记录保留 |

## 修复模式

### A. 拼写错误
```bash
# 确认：一个 flag 名被 set，另一个只被一处引用且含义相同
# 修复：改引用侧为正确的 flag 名
```

### B. Self-reference 清理
```python
# 确认：flag 从未被 set，exclude 中引用自身 ID，事件有 unique:true
# 修复：从 exclude 删除 has.flag.<自身ID>
```

### C. 补遗漏 set_flag
```python
# 确认：有外部消费者（成就/其他事件），事件分支缺 set_flag
# 修复：在合理分支的 effects 中补 set_flag
# 注意：分析分支叙事，决定补一个还是全部补
```

## 留档规范

每次审计修复必须记录：

1. **调查过程** — 使用的命令/搜索、原始输出
2. **证据链** — 文件:行 引用、grep 结果、JSON 片段
3. **判断依据** — 为什么是 bug 而不是设计、与其他 flag 的区分
4. **修复内容** — before/after diff
5. **验证结果** — 修复后工具输出的变化

### 文档分工

| 文档 | 职责 |
|------|------|
| `docs/FLAG-LIFECYCLE-AUDIT.md` | 审计发现（问题清单、检测方法、数据总览） |
| `docs/FLAG-FIX-PROGRESS.md` | 修复进度（调查细节、判断依据、修复 diff、验证结果） |

## 工具

```bash
# 项目原生检查工具
python3 scripts/content-tool.py check-flags

# TS 静态+动态分析
npx vitest run tests/engine/flag-lifecycle-tracker.test.ts

# 辅助函数（供测试用）
# tests/helpers/flag-tracker.ts: collectProducedFlags(), collectConsumedFlags()
```

### 引擎硬编码消费（必须手动扫描）

以下位置存在引擎代码直接消费 Flag，`check-flags` 工具不会扫描这些：

| 文件 | Flag | 角色 |
|------|------|------|
| `SimulationEngine.ts:805,990` | `miracle_survival` | 引擎 SET（濒死时 35% 概率触发），被 achievement:`miracle_afterglow` 消费 |
| `SimulationEngine.ts:808,992` | `near_death` | 引擎 SET（濒死时 70% 概率触发），被 evaluation:`eva_near_death` 和 achievement:`dragon_near_death` 消费 |
| `EvaluatorModule.ts:46` | `on_adventurer_path`, `on_knight_path`, `on_mage_path`, `on_merchant_path`, `on_scholar_path` | 引擎消费（路线加分 +15/个） |

审计孤儿 Flag 时：
- 上述 2 个引擎 SET 的 Flag 有 JSON 消费者，不是孤儿
- 5 个路线 Flag 是引擎消费者，不是孤儿
- 7 个 Flag 如被 `check-flags` 工具标记为异常，应排除误报

### ConditionDSL flag 映射

`ConditionDSL.ts:43` 的 `FLAG_DESCRIPTIONS` 常量包含 17 个 Flag 的中文描述映射。这些映射本身不是消费逻辑（仅用于 UI 显示），但反映了这些 Flag 被设计为可消费的意图。

### 工具已知局限

| 局限 | 影响 | 对策 |
|------|------|------|
| 只扫 `has.flag.xxx` 不扫 `flag:xxx` | 漏消费 | 手动补搜 `flag:` 语法 |
| 不扫引擎代码 | 误报上述 7 个 Flag 为孤儿 | 参考上面的硬编码消费表排除 |
| 不扫 `state.flags.has()` 硬编码 | 误报路线 Flag | 手动查 `EvaluatorModule.ts` |
| 不扫 `prerequisites` 中的 `flag:` 简写 | 误报 `magic_academy` 为死 Flag | 手动 grep `prerequisites` 字段 |
| 死 Flag 显示截断为前 20 个 | 大规模审计时漏看后续 | 用 grep/python 脚本获取完整列表 |
| 动态采样覆盖率 54.5% | 部分死 Flag 可能在低概率分支被消费 | 50 局采样辅助验证 |
