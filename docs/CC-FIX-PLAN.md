# CC 修复计划

## 优先级排序

### Phase 1: 引擎 Bug（CC 发现）
| # | 问题 | 方法 | 文件 | 风险 | 工作量 |
|---|------|------|------|------|--------|
| 1 | simulateYear 旧 API 未重置 yearlyHpLoss | 在 simulateYear 的 age+1 处加 `yearlyHpLoss: 0` | SimulationEngine.ts | 低 | 1行 |
| 2 | trigger_event 嵌套中 grant_item 空操作 | 在 EventModule.applyEffect 的 grant_item case 中调用 itemModule | EventModule.ts | 中 | 10行 |
| 3 | 致命打击额外伤害不纳入 yearlyHpLoss | 在致命打击扣 HP 后也累加到 yearlyHpLoss | EventModule.ts | 低 | 2行 |
| 4 | routeMode 'all' 死代码 | 添加注释标记，或在 getCandidates 中处理单路线下的 all 模式 | EventModule.ts | 低 | 3行 |

### Phase 2: 数据 Bug
| # | 问题 | 方法 | 文件 | 风险 | 工作量 |
|---|------|------|------|------|--------|
| 5 | 5个路线入口事件 routes 不正确 | 改 routes 为 ["*"] | youth.json, adult.json | 低 | 5处 |
| 6 | 106个事件缺 tag | 根据事件内容补全 tag 字段 | events/*.json | 中 | 106处 |
| 7 | grant_item 多余 value 字段(13个) | 删除 value 字段 | events/*.json | 低 | 13处 |
| 8 | remove_flag 多余 value 字段(3个) | 删除 value 字段 | adult.json | 低 | 3处 |

### Phase 3: 架构改进
| # | 问题 | 方法 | 文件 | 风险 | 工作量 |
|---|------|------|------|------|--------|
| 9 | lifespanRatio 基于随机值 | 改用 lifespanRange 中位数 | EventModule.ts | 中 | 5行 |
| 10 | sigmoid 分层硬编码 | 改为从 race 配置读取 | SimulationEngine.ts + races.json | 中 | 20行 |
| 11 | 路线加分 flag 硬编码 | 从 manifest.routes 动态获取 | EvaluatorModule.ts | 低 | 10行 |
| 12 | 濒死判定逻辑重复 | 抽取公共方法 | SimulationEngine.ts | 中 | 30行 |

### Phase 4: 平衡调优
| # | 问题 | 方法 | 文件 | 风险 | 工作量 |
|---|------|------|------|------|--------|
| 13 | 权重分布失衡 | 设权重上限 30，降低 first_love 等 | events/*.json | 中 | 10处 |
| 14 | 事件总数 1003 vs 1002 | 确认 elf_first_love 是否应该存在 | youth.json | 低 | 分析 |
| 15 | 70+事件缺 routes | 补全 routes: ["*"] | events/*.json | 低 | 70处 |

## 依赖关系
- Phase 1 和 Phase 2 可并行
- Phase 3 依赖 Phase 1（改引擎前先修 bug）
- Phase 4 依赖 Phase 2+3（平衡调优需要数据完整）

## 建议执行顺序
1. Phase 1 → 跑测试确认
2. Phase 2 → 跑测试 + data-validation 确认
3. Phase 3 → 跑测试确认
4. Phase 4 → 跑测试 + QA 验证

---

## CC 第二轮审查：引擎 diff 发现的额外问题

_审查对象：`git diff HEAD -- src/engine/modules/EventModule.ts` + `src/engine/core/SimulationEngine.ts`_

---

### 🔴 严重 Bug

#### E1: simulateYear（旧 API）未重置 yearlyHpLoss — 确认仍存在

上轮已列为 #1，但 **diff 显示 simulateYear 仍未修复**：`startYear` 在 age+1 处重置了 `yearlyHpLoss: 0`，但旧 API `simulateYear` 的 age+1 处没有。这意味着调用 `simulateYear` 的代码（如批量测试脚本）会累积跨年 HP 损失，导致后续年份所有伤害都被减半。

- **位置**: `SimulationEngine.ts:1024-1027`
- **方法**: 与 startYear 一致，在 `age: this.state.age + 1` 后加 `yearlyHpLoss: 0`
- **风险**: 低
- **工作量**: 1 行

#### E2: 濒死判定代码重复 3 份，且行为不一致

濒死判定逻辑存在于：
1. `postYearProcessCore()` — `SimulationEngine.ts:859-888`（有童年保护 `age >= 10`）
2. `resolveBranch()` — `SimulationEngine.ts:1070-1096`（**无童年保护**，变量名 `nearDeathThreshold2`）
3. `postYearProcessCore()` 内部还有物品属性成长 + 成就检查 — `SimulationEngine.ts:840-857`

**问题**：
- `resolveBranch` 中的濒死判定缺少童年保护（`age >= 10` 检查），10 岁以下角色可能被濒死判定杀死
- 两处判定使用不同的上下文：`postYearProcessCore` 在物品属性成长和成就检查之后做濒死判定，`resolveBranch` 在濒死判定之后才做属性快照和成就检查。这意味着同样的 HP 状态在两个路径下会触发不同的成就
- `simulateYear` 旧 API 的濒死判定（`SimulationEngine.ts:1070`）与 `postYearProcessCore` 不同，没有物品属性成长步骤

- **方法**: 抽取 `nearDeathCheck(state: GameState): GameState` 公共方法，统一逻辑
- **风险**: 中（需要确认两条路径的执行顺序语义）
- **工作量**: 30 行

#### E3: resolveBranch 中事件 HP 上限 clamp 与 EventModule 内部逻辑冲突

`resolveBranch` 在 `SimulationEngine.ts:1060-1067` 添加了事件 HP 损失上限：
```ts
const maxEventLoss = Math.max(Math.floor(this.computeInitHp() * 0.25), 20)
if (totalLoss > maxEventLoss) {
  newState = { ...newState, hp: hpBeforeEvent - maxEventLoss }
}
```

但 `EventModule.modify_hp` **内部已经有** 单次事件 HP 降幅上限（`EventModule.ts:361-366`）：
```ts
const maxEventDamage = Math.max(20, Math.floor(hpBefore * 0.3))
```

**问题**：
- 两处逻辑不同：EventModule 用 `hpBefore * 0.3`，resolveBranch 用 `computeInitHp() * 0.25`。对于高 HP 角色这两个值差异显著
- 双重 clamp 导致实际 HP 损失被两次截断，可能过度保护，使高伤害事件（如 boss 战）永远无法造成有意义伤害
- `simulateYear` 旧 API 有外层 clamp，但 `startYear → resolveBranch` 的 galgame 流程中 `resolveBranch` 方法也有外层 clamp，而 `startYear` 中事件经过 `applyEffectsOnState` 后**没有**外层 clamp

- **方法**: 移除 `resolveBranch` 中的外层 HP clamp，只保留 EventModule 内部的保护。或者反过来移除 EventModule 内部的，只在引擎层统一处理。二选一，不要两层都做
- **风险**: 中
- **工作量**: 5 行（删除 + 注释）

#### E4: 致命打击额外伤害不纳入 yearlyHpLoss — 确认仍存在

上轮已列为 #3。EventModule.ts:381-384 的致命打击额外扣 HP（`criticalBonus`）后直接 `state.hp -= criticalBonus`，**没有**将这部分伤害累加到 `state.yearlyHpLoss`。这意味着同一年内多次触发致命打击时，年度软限制无法正确生效。

- **位置**: `EventModule.ts:382-385`
- **方法**: 在 `state.hp -= criticalBonus` 后加 `state.yearlyHpLoss = (state.yearlyHpLoss ?? 0) + criticalBonus`
- **风险**: 低
- **工作量**: 2 行

#### E5: grant_item 在 trigger_event 嵌套中仍为空操作 — 确认仍存在

上轮已列为 #2。`EventModule.ts:416-418` 的 `grant_item` case 仍然是空操作（只返回 description）。这在 `trigger_event` 嵌套场景下意味着：如果事件 A 通过 trigger_event 触发事件 B，而事件 B 的效果中有 grant_item，物品不会被实际添加到背包。

**注意**：`resolveEvent` 方法（`SimulationEngine.ts` 中调用）在事件处理后调用 `itemModule.grantItems`，但只处理了顶层事件的 grant_item。嵌套事件中的 grant_item 通过 `applyEffectsOnState → trigger_event → resolveEvent` 链路走的是 EventModule 内部的 `applyEffect`，不经过 SimulationEngine 的后处理。

- **位置**: `EventModule.ts:416-418`
- **方法**: 在 grant_item case 中调用 `this.itemModule.grantItem(state, effect.target)`
- **风险**: 中（需要确认 ItemModule 是否已有 grantItem 方法，以及背包满的处理）
- **工作量**: 10 行

---

### 🟡 中等问题

#### E6: regenHp 的硬上限 regen ≤ 3 对所有种族一刀切

`SimulationEngine.ts:329` 添加了 `Math.min(this.initialStrRegen, 3)` 硬上限。对于初始体魄很高的种族（如兽人、龙人），HP 恢复被限制在 3，但初始 HP 可能是 40-50。这意味着这些种族的 HP 恢复率远低于人类（人类初始 HP≈25，regen≈3，恢复率 12%；兽人初始 HP≈50，regen 被 clamp 到 3，恢复率仅 6%）。

- **方法**: 硬上限改为 `Math.min(this.initialStrRegen, Math.floor(initHp * 0.12))` 或从种族配置读取
- **风险**: 中
- **工作量**: 5 行

#### E7: 童年 HP 保护条件不一致

EventModule 中童年保护用 `state.age < 15`（`EventModule.ts:349`），SimulationEngine 中濒死判定童年保护用 `state.age >= 10`（`SimulationEngine.ts:862`），自然衰减童年保护用 `age < 10`（`SimulationEngine.ts:371`）。三个不同的年龄阈值（15、10、10），没有统一的常量定义。

- **方法**: 在 types.ts 或 SimulationEngine 中定义 `CHILDHOOD_HP_PROTECTION_AGE = 15` 和 `CHILDHOOD_DEATH_PROTECTION_AGE = 10` 常量，统一引用
- **风险**: 低
- **工作量**: 10 行

#### E8: sigmoidMid 分层硬编码了 4 个种族寿命区间

`SimulationEngine.ts:344-346` 的 sigmoidMid 分层是硬编码的：
```ts
maxAge < 50 ? 0.28 : maxAge < 100 ? 0.35 : maxAge < 250 ? 0.40 : 0.42
```
当前种族（哥布林/兽人/人类/矮人/半龙人/精灵/海精灵）恰好覆盖了这四个区间，但如果添加新种族（如寿命 60 的种族），它会被分到 "人类" 桶里，可能不合理。上轮已列为 #10。

- **位置**: `SimulationEngine.ts:344-346`
- **方法**: 从 race 定义中读取 `sigmoidMid` 参数，或使用连续插值公式
- **风险**: 中
- **工作量**: 20 行

#### E9: regenHp 的 maxNetLoss 限制可能与 regenHp 本身的意图矛盾

`SimulationEngine.ts:382-384` 添加了单年 HP 净变化上限（`maxNetLoss`），但这个限制在 `overage` 惩罚之后才应用。当 `lifeRatio > 1.0` 时，overage 惩罚可以加到 `maxYearlyDecay * 2`，而 `maxNetLoss` 只限制最终结果不低于 `hp - maxNetLoss`。这意味着超龄角色的 HP 下降速度受两个独立上限控制，且 maxNetLoss 可能阻止 overage 惩罚生效，导致角色超龄后反而活得更久。

- **方法**: overage 惩罚的衰减不受 maxNetLoss 限制，或者 overage 惩罚直接设为 `hp = 0`（因为已经超出预期寿命）
- **风险**: 中（需要模拟验证）
- **工作量**: 分析 + 5 行

#### E10: startYear 中事件效果不经过 resolveBranch 的 HP 上限保护

`startYear` 的 galgame 流程中：
- 无分支锚点事件 → `applyEffectsOnState` → 无 HP 上限保护
- 有分支锚点事件 → `resolveBranch` → 有 HP 上限保护（E3 中的外层 clamp）

这意味着无分支的锚点事件（如纯叙述事件带 HP 效果）可以绕过 HP 保护直接秒杀角色。

- **位置**: `SimulationEngine.ts:467-473`（无分支锚点事件的 applyEffectsOnState）
- **方法**: 在 `applyEffectsOnState` 后也加 HP 上限保护，或统一由 EventModule 内部处理
- **风险**: 低
- **工作量**: 5 行

---

### 🟢 低优先级

#### E11: agingHint 在 mundane_year 中的重复出现

`skipYear` 方法（`SimulationEngine.ts:802`）将 agingHint 同时放入了 `description` 和 `agingHint` 字段：
```ts
description: '...' + (agingHint ? '\n' + agingHint : ''),
...
agingHint: agingHint || undefined,
```
UI 可能会同时显示 description 中的 agingHint 和独立的 agingHint，导致重复展示。

- **方法**: description 中不加 agingHint，只通过 `agingHint` 字段传递
- **风险**: 低
- **工作量**: 1 行

#### E12: resolveBranch 中濒死判定的 near_death flag 不做去重

濒死判定会给 state 添加 `near_death` 或 `miracle_survival` flag，但不检查是否已存在。如果角色连续多年濒死，Set 中会积累大量重复逻辑的 flag（Set 本身去重字符串值，所以不会真正重复，但语义上同一个 flag 可能被多次 set + remove 循环）。

- **方法**: 低优先级，当前行为正确（Set 去重）。仅记录
- **风险**: 无

#### E13: simulateYear 旧 API 缺少 agingHint

`simulateYear` 返回的是 `GameState`，不是 `YearResult`，所以天然不支持 agingHint。如果有任何代码路径依赖旧 API，那些路径不会显示衰老提示。

- **方法**: 低优先级，旧 API 保留兼容，不影响 galgame 流程
- **风险**: 无

---

### 修复优先级总表

| 优先级 | 编号 | 问题 | 影响 |
|--------|------|------|------|
| 🔴 P0 | E1 | simulateYear 未重置 yearlyHpLoss | 旧 API 伤害计算错误 |
| 🔴 P0 | E2 | 濒死判定 3 份重复且不一致 | 童年可能被杀死 / 成就不一致 |
| 🔴 P0 | E3 | HP clamp 双重保护 | 高伤害事件无法生效 |
| 🔴 P0 | E4 | 致命打击不纳入 yearlyHpLoss | 年度软限制失效 |
| 🔴 P0 | E5 | grant_item 嵌套空操作 | 嵌套事件中物品丢失 |
| 🟡 P1 | E6 | regen 硬上限 3 一刀切 | 高体魄种族恢复率过低 |
| 🟡 P1 | E7 | 童年保护年龄阈值不统一 | 维护隐患 |
| 🟡 P1 | E8 | sigmoidMid 硬编码 4 区间 | 新种族适配问题 |
| 🟡 P1 | E9 | maxNetLoss 可能阻止 overage 惩罚 | 超龄角色可能不死 |
| 🟡 P1 | E10 | startYear 无分支事件无 HP 保护 | 锚点事件可秒杀 |
| 🟢 P2 | E11 | agingHint 在 mundane_year 中重复 | UI 重复展示 |
| 🟢 P2 | E12 | near_death flag 不去重 | 无实际影响 |
| 🟢 P2 | E13 | simulateYear 无 agingHint | 旧 API 无衰老提示 |

### 建议修复顺序

1. **E1 + E4 + E5**: 最小改动，直接修复（可与原 Phase 1 并行）
2. **E3 + E10**: 统一 HP 保护策略（移除外层 clamp 或统一到 EventModule）
3. **E2**: 抽取濒死判定公共方法（最大的重构点）
4. **E6 + E7**: 常量统一 + regen 上限调整
5. **E9**: 模拟验证 overage 行为后决定
6. **E8 + E11 + E13**: 低优先级清理
