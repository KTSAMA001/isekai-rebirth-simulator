---
name: isekai-qa
description: 异世界重生模拟器的 QA 测试技能。当需要运行 QA 测试、验证代码改动、检查数据一致性、跑基准验证、蒙特卡洛模拟、Flag 一致性检查、DSL 语法校验、存活年龄统计时触发。当用户提到"跑测试"、"QA"、"验证"、"基准测试"、"数据一致性"、"check-flags"、"validate"、"蒙特卡洛"、"寿命分布"、"事件一致性"时触发。当前工作区是 isekai-rebirth-simulator 项目且涉及质量验证时也应触发。
---

# 异世界重生模拟器 — QA 测试技能

## 定位

专门负责项目质量验证的技能。覆盖全量测试执行、基准文档逐节验证、蒙特卡洛寿命统计、Flag/成就/DSL 数据一致性检查。

---

## 核心功能

### 1. 全量测试执行

```bash
npm test -- --run
```

报告通过/失败数，如有失败则定位根因。

### 2. 基准验证（按 QA-TEST-BASELINE.md 逐节）

| 节号 | 验证项 | 对应测试文件 |
|------|--------|-------------|
| 9.1 | 生命阶段隔离 — 事件不出现在错误阶段 | `qa-baseline-verify.test.ts` 第 9.1 节 |
| 9.2 | Flag 因果链条 — 前置 flag 必须存在 | `qa-baseline-verify.test.ts` 第 9.2 节 |
| 9.3 | 跨种族年龄等价 — 等价年龄公式 | `qa-baseline-verify.test.ts` 第 9.3 节 |
| 9.4 | HP 与死亡系统 — sigmoid、Beta(3,3)、保护机制 | `qa-baseline-verify.test.ts` 第 9.4 节 |
| 9.5 | 属性门槛匹配 — include 条件 | `qa-baseline-verify.test.ts` 第 9.5 节 |
| 9.6 | 评分系统 — D~SS 等级 | `qa-baseline-verify.test.ts` 第 9.6 节 |
| 9.7 | minStageProgress 校验 | QA 人工检查或脚本 |
| 9.8 | 事件效果落地 — effects 不为空、flag 实际设置 | `qa-baseline-verify.test.ts` 第 9.8 节 |
| 9.9 | 存活年龄统计 — 蒙特卡洛 | `qa-baseline-verify.test.ts` 第 9.9 节 |

运行命令：

```bash
# 基准验证测试
npx vitest run tests/qa-baseline-verify.test.ts

# Phase 2 深度测试
npx vitest run tests/qa-phase2-deep-test.test.ts
```

### 3. 蒙特卡洛存活年龄验证

各种族 50 次模拟，验证平均/中位数在 lifespanRange 内。

判定规则：
1. 平均存活年龄应在 lifespanRange 的 50%-130% 之间
2. 中位数不应偏离平均超过 20%
3. 不应出现存活年龄 > maxLifespan 的情况（允许 10% 超出）

### 4. 成就系统验证

- 127 个成就条件是否与代码一致
- 12 个 lifeProgress 成就是否包含 `lifeProgress` 关键字
- lifeProgress 成就是否可解锁（阈值是否可达）

12 个 lifeProgress 成就 ID：
`longevity`, `slum_survivor`, `love_and_war`, `eternal_wanderer`, `widowed_hero`, `peaceful_ending`, `dragon_near_death`, `war_hero_ach`, `dark_savior`, `fairy_companion`, `eternal_peace`, `iron_will_to_end`

### 5. Flag 一致性检查

```bash
python3 scripts/content-tool.py check-flags
```

检查：
- 每个 `set_flag` 都有对应的 `has.flag` 消费
- 每个 `has.flag` 都有来源事件
- 孤儿 flag 和死 flag 报告

### 6. 数据校验

```bash
python3 scripts/content-tool.py validate
```

AJV Schema 校验所有 JSON 数据文件。

### 7. DSL 语法检查

```bash
# 检查单个条件
python3 scripts/content-tool.py check-dsl "has.flag.xxx & attribute.str >= 10"
```

对新增/修改的 `include`/`exclude` 条件做语法校验。

---

## 输出格式

每个验证项用标记：

| 标记 | 含义 |
|------|------|
| ✅ | 通过 |
| ❌ | 失败（代码 bug） |
| ⚠️ | 警告（可能是文档偏差或设计取舍） |

最终结论：**QA PASS** 或 **QA FAIL**

发现问题时要区分：
- **代码 bug**：逻辑实现与设计文档不符
- **文档偏差**：代码行为正确但文档描述过时
- **设计取舍**：非 bug 的已知限制

---

## 关键参数（从 QA-TEST-BASELINE.md 提取）

### 种族数据

| 种族 | maxLifespan | lifespanRange | 可玩 |
|------|-------------|---------------|------|
| 人类 (human) | 100 | [65, 85] | ✅ |
| 精灵 (elf) | 500 | [250, 400] | ✅ |
| 哥布林 (goblin) | 60 | [20, 35] | ✅ |
| 矮人 (dwarf) | 400 | [150, 250] | ✅ |

### HP 系统

- **K = 12**（sigmoid 陡度）
- **死亡分布**：Beta(3,3) 动态映射
  - 映射范围 = `[range[0]/Max - 0.10, range[1]/Max + 0.08]`
  - 均值 0.5，大部分采样在 [0.3, 0.7]
- **童年保护**：10 岁以下 `ageDecay = 0`
- **HP 平台期**：`raceMaxLifespan >= 200 && lifeProgress < 0.5` 时 HP ≥ `initHp × 30%`
  - 精灵（500）和矮人（400）享受此保护
- **单年净损失上限**：`max(floor(initHp × 0.20), 12)`
- **超寿命惩罚**：`lifeProgress > 1.0` 时额外衰减 `floor((lifeProgress-1.0) × 60)`，上限 `maxYearlyDecay × 2`

### 评分等级

| 等级 | 分数范围 |
|------|----------|
| D | 0-120 |
| C | 120-200 |
| B | 200-280 |
| A | 280-380 |
| S | 380-500 |
| SS | 500+ |

### 初始 HP 公式

```
初始 HP = max(25, 25 + 体魄 × 3)
初始体魄恢复量 = max(1, 1 + floor(初始体魄 / 3))
每年恢复 = min(初始体魄恢复量, max(3, floor(initHp × 0.12)))
```

### 死亡进度分布

```
personalDeathProgress = Beta(3,3) 动态映射
deathProgressMin = max(0.20, range[0]/maxLifespan - 0.10)
deathProgressMax = min(0.95, range[1]/maxLifespan + 0.08)
```

### 事件统计

| 数据类型 | 总数 |
|----------|------|
| 事件 | 675 |
| 成就 | 127 |
| 天赋 | 68 |

---

## 生命阶段定义（绝对年龄）

| 阶段 | 人类 | 精灵 | 哥布林 | 矮人 |
|------|------|------|--------|------|
| childhood | [2, 10] | [2, 50] | [1, 6] | [2, 30] |
| teen | [11, 17] | [30, 80] | [5, 12] | [20, 50] |
| youth | [14, 22] | [50, 120] | [8, 18] | [30, 80] |
| adult | [20, 45] | [80, 250] | [15, 35] | [60, 200] |
| midlife | [35, 60] | [200, 380] | [25, 50] | [180, 320] |
| elder | [55, 100] | [350, 500] | [35, 60] | [280, 400] |

---

## 关键 Flag 链条

```
squire → knight_examination → knight → knight_tournament/knight_siege
guild_member → monster_hunt_guild/adv_bounty → adult_guild_promotion
magic_student → magic_exam/magic_theory_class → mage_graduate
dating_deepen → marriage_proposal → engaged → wedding_ceremony → married
  → marriage_anniversary, family_dinner
  → parent → human_grandchildren/human_grandchild_story
merchant_apprentice → merchant_master
```

---

## 测试文件索引

| 文件 | 内容 |
|------|------|
| `tests/qa-baseline-verify.test.ts` | 基准文档逐节验证（第 1-9.9 节） |
| `tests/qa-phase2-deep-test.test.ts` | Phase 2 深度测试（完整生命周期、哥布林/精灵专项、DSL、事件链、边界） |
| `tests/data/data-validation.test.ts` | JSON 数据文件 Schema 校验 |
| `tests/engine/` | 引擎模块单元测试 |
| `tests/helpers.ts` | 测试工厂函数（makeWorld, makeState） |

---

## QA 流程（代码改动后）

1. **快速验证**：`python3 scripts/content-tool.py validate` + `python3 scripts/content-tool.py check-flags`
2. **全量测试**：`npm test -- --run`
3. **基准专项**：`npx vitest run tests/qa-baseline-verify.test.ts`
4. **深度验证**：`npx vitest run tests/qa-phase2-deep-test.test.ts`（改动涉及 HP/寿命/年龄换算时）
5. **TypeScript 类型检查**：`npx vue-tsc --noEmit`

---

## 测试覆盖原则

### 正面 + 负面断言缺一不可

测试不能只测"应该触发/通过"的情况，必须同时测试"不应该触发/失败"的情况。

**强制规则：**

1. **条件类事件必须双向验证**
   - 条件满足时 → 验证事件**能**触发（正面测试）
   - 条件不满足时 → 验证事件**不能**触发（负面测试）
   - 示例：`human_debt_crisis`（include: `attribute.mny <= 5`）→ 测 mny=-1 触发 + mny=18 不触发

2. **属性门槛事件必须双向验证**
   - 高于门槛 → 验证触发
   - 低于门槛 → 验证不触发
   - 蒙特卡洛模拟中用大量样本（≥50 次）确保统计置信度

3. **Flag 依赖事件必须双向验证**
   - 有前置 flag → 验证事件可达
   - 无前置 flag → 验证事件不可达
   - 示例：`human_wedding_ceremony`（include: `has.flag.engaged`）→ 有 engaged 触发 + 无 engaged 不触发

4. **弱断言视为测试缺陷，必须替换**
   - ❌ `expect(x).toBeGreaterThanOrEqual(0)` — 计数器/数组长度永远 >= 0，无意义
   - ❌ `expect(x).toBeTruthy()` — 过于宽泛，无法捕获回归
   - ✅ 替换为具体期望值：`expect(debtTriggered).toBe(0)` 或 `expect(count).toBeGreaterThan(0)`
   - ✅ 边界断言需有意义：`expect(v).toBeGreaterThanOrEqual(0)` + `expect(v).toBeLessThan(1)` 组合有效

5. **新建测试模板**
   ```
   // 正面：条件满足时应触发
   it('低家境(mny=-1)应触发债务危机', () => { ... expect(debtTriggered).toBeGreaterThan(0) })
   // 负面：条件不满足时不应触发
   it('高家境(mny=18)不应触发债务危机', () => { ... expect(debtTriggered).toBe(0) })
   ```

---

## references/ 目录

核心检查规则摘要见 `references/checklist.md`，避免每次加载完整 QA-TEST-BASELINE.md（约 540 行）。
