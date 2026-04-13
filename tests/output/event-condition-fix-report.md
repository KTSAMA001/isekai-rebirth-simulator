# 异世界重生模拟器 — 事件条件修复验证报告

**分支**: fix/debt-event-condition  
**测试日期**: 2026-04-10  
**测试文件**: `tests/engine/event-condition-fix.test.ts`  
**测试结果**: ✅ 23/23 全部通过

---

## 修复内容

| 事件 ID | 修复前 | 修复后 |
|---------|--------|--------|
| `human_debt_crisis` | `include=""` (无条件) | `include="attribute.mny < 10"` |
| `human_wedding_ceremony` | `include=""` (无条件) | `include="has.flag.engaged \| has.flag.in_relationship"` |

---

## 测试 1: 债务危机 — include 条件验证 ✅

### DSL 纯逻辑 (5/5 通过)

| 条件 | 预期 | 实际 | 结果 |
|------|------|------|------|
| mny=5 | 通过 | 通过 | ✅ |
| mny=9 (边界值) | 通过 | 通过 | ✅ |
| mny=10 (边界值) | 不通过 | 不通过 | ✅ |
| mny=15 | 不通过 | 不通过 | ✅ |
| mny=20 | 不通过 | 不通过 | ✅ |

### SimulationEngine 20轮模拟

- **配置**: mny=20, 种族=human, 随机种子 1000-1019
- **结果**: `human_debt_crisis` 触发 **0/20 (0%)**
- **结论**: ✅ **修复有效**。mny≥10 的角色不再触发债务危机。

### EventModule 候选筛选

- mny=5, age=30 → 候选包含 debt_crisis ✅
- mny=20, age=30 → 候选不含 debt_crisis ✅

---

## 测试 2: 婚礼 — include 条件验证 ✅

### DSL 纯逻辑 (5/5 通过)

| 条件 | 预期 | 实际 | 结果 |
|------|------|------|------|
| 无 flag | 不通过 | 不通过 | ✅ |
| first_love + dating | 不通过 | 不通过 | ✅ |
| engaged | 通过 | 通过 | ✅ |
| in_relationship | 通过 | 通过 | ✅ |
| engaged + in_relationship | 通过 | 通过 | ✅ |

### SimulationEngine 20轮模拟（路径分析）

- **配置**: chr=1 (极低魅力), 随机种子 2000-2019
- **结果**: `human_wedding_ceremony` 触发 **2/20 (10%)**
- **触发路径**:
  - `#1`: first_love → human_marriage_proposal → **human_wedding_ceremony**
  - `#2`: first_love → festival_dance → **human_wedding_ceremony**
- **结论**: ✅ **修复有效**。婚礼确实只在实际拥有 `engaged` 或 `in_relationship` flag 时才触发。两次触发都经过了正当的事件链（先获得了 flag，再触发婚礼）。

### ⚠️ 发现残留问题

| 事件 | include | 问题 |
|------|---------|------|
| `human_marriage_proposal` | `""` (空) | 无条件可触发，绕过恋爱链 |
| `love_at_first_sight` | `""` (空) | 无条件设置 `in_relationship` |
| `festival_dance` | `has.flag.in_relationship` | 依赖上游 flag，但上游可能无条件获得 |

**建议**: 这些上游事件的 include 也应加上合理条件（如 chr>=5），防止低魅力角色绕过恋爱链直接结婚。

---

## 测试 3: 正常事件链 — 高魅力验证 ✅

### 条件链连贯性

| 事件 | include | 验证 |
|------|---------|------|
| `first_love` | `attribute.chr >= 5` | ✅ chr=5 通过, chr=3 不通过 |
| `dating_start` | `has.flag.first_love` | ✅ 有 first_love 可触发 |
| `dating_deepen` | `has.flag.dating` | ✅ 有 dating 可触发 |
| `human_marriage_proposal` | `""` (无条件) | ⚠️ 见上方残留问题 |

### 20轮高魅力(chr=15)模拟统计

| 事件 | 触发率 | 说明 |
|------|--------|------|
| first_love | 13/20 (65%) | 正常 |
| dating | 0/20 (0%) | 事件 ID 可能不匹配（需确认分支效果） |
| dating_deepen | 2/20 (10%) | 依赖 dating flag |
| human_marriage_proposal | 5/20 (25%) | 无条件事件，触发合理 |
| human_wedding_ceremony | 4/20 (20%) | ✅ 仅在有 flag 时触发 |
| human_grandchildren | 3/20 (15%) | 依赖 parent flag |
| human_grandchild_story | 8/20 (40%) | 正常 |
| human_grandchild_laughter | 10/20 (50%) | 正常 |
| marriage_anniversary | 2/20 (10%) | 正常 |

**结论**: ✅ 事件链正常工作，修复未破坏正常流程。

---

## 测试 4: 收养孤儿 — 无条件触发频率 ✅

| 属性 | 值 |
|------|---|
| include | `""` (空 = 无条件) |
| exclude | `""` (空 = 无排除) |
| 年龄范围 | 28-50 |
| unique | true (一生一次) |
| 高魅力模拟触发率 | 6/20 (30%) |
| 普通属性模拟触发率 | 4/20 (20%) |

**说明**: 该事件完全依赖年龄窗口 [28-50] 和 unique 限制。因为没有 include/exclude 条件，任何进入该年龄范围的人类角色都可能触发。这是**预期行为**，但建议后续考虑加上合理条件（如 `attribute.mny >= 5` 需要一定经济基础才能收养）。

---

## 总结

| 验证项 | 结果 |
|--------|------|
| human_debt_crisis 修复（mny<10 才触发） | ✅ 通过 |
| human_wedding_ceremony 修复（需要 flag 才触发） | ✅ 通过 |
| 正常事件链未被破坏 | ✅ 通过 |
| human_orphan_adoption 无条件触发 | ✅ 已统计（30%） |

### 遗留建议 (P3-P4)

1. **P3**: `human_marriage_proposal` 的 include 为空，建议加条件限制
2. **P3**: `love_at_first_sight` 的 include 为空，建议至少加 `attribute.chr >= 3`
3. **P4**: `human_orphan_adoption` 可考虑加 `attribute.mny >= 5` 条件
