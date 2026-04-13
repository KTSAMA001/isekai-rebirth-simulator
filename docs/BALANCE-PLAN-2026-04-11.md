# 异世界重生模拟器 — 数值平衡全面实施计划

> 日期：2026-04-11  
> 版本：v1.0  
> 状态：待实施

---

## 目录

1. [现状分析](#1-现状分析)
2. [A. 衰减曲线微调](#a-衰减曲线微调)
3. [B. 事件伤害调整](#b-事件伤害调整)
4. [C. 死代码修复](#c-死代码修复)
5. [D. 濒死机制调整](#d-濒死机制调整)
6. [E. 评分公式调整](#e-评分公式调整)
7. [F. 极端早夭问题](#f-极端早夭问题)
8. [实施顺序与依赖关系](#实施顺序与依赖关系)
9. [验证方案](#验证方案)

---

## 1. 现状分析

### 1.1 种族寿命中位数 vs 目标

| 种族 | 极限范围 | 当前中位数 | 当前比例 | 目标比例 | 差距 |
|------|----------|-----------|---------|---------|------|
| 人类 | 80-90 | 63-71 | 72-78% | 65-75% | 偏高 3-7% |
| 精灵 | 380-420 | 240-291 | 60-69% | 55-65% | 基本达标/偏高 |
| 哥布林 | 30-36 | 27 | 82% | 65-75% | **严重偏高 7-17%** |
| 矮人 | 160-180 | 97-113 | 56-63% | 60-70% | 偏低 4-7% |

**核心问题**：哥布林寿命中位数 82%（27岁/33岁中位），远超 65-75% 目标。矮人略偏低。人类略偏高。

### 1.2 初始 HP 计算

```
initHp = 25 + str × 3
```

| 种族 | 基础 str(10) | 种族修正 | 实际 str 范围 | 初始 HP 范围 |
|------|-------------|---------|-------------|-------------|
| 人类 | 10 | +0~2(性别) | 10-12 | 55-61 |
| 精灵 | 10 | -3±2(性别) | 5-9 | 40-52 |
| 哥布林 | 10 | -3±2(性别) | 5-9 | 40-52 |
| 矮人 | 10 | +5±2(性别) | 12-17 | 61-76 |

**注意**：10 点分配 + 种族修正后，哥布林/精灵的 str 可能低至 5，初始 HP 仅 40。而矮人 str 高达 17 时，初始 HP 76。

### 1.3 当前事件伤害分布

**童年事件（age 2-12）极端伤害**：
- `child_plague` 失败分支：HP -55、-45
- `child_drowning` 失败分支：HP -45

这两个事件的失败分支对初始 HP 40-61 的角色是**致命打击**，对 HP 40 的哥布林/精灵基本等于即死（-55 超过 40，还会触发致命打击额外 -10）。

**成年/中年事件高伤害**：
- `challenge_god_trial` / `challenge_final_boss` 失败：-35 + 致命打击(描述 -50/-60)
- `elder_kingdom_crisis` 失败：-35 + 致命打击(-70)
- `knight_dragon_quest` 失败：-35 + 致命打击(-50)
- `lost_in_dungeon` 失败：-40
- `war_breaks_out` 前线：-40

**致命打击机制**：当单次伤害 > 当前 HP 50% 时，额外扣 10 HP。这意味着高伤害事件在角色 HP 低时会雪上加霜。

---

## A. 衰减曲线微调

### A-1. 问题诊断

**哥布林问题根因**：`quadScale = max(3500/maxAge, 8)`
- 哥布林 maxAge=33 → quadScale=3500/33≈106（最大值）
- 矮人 maxAge=170 → quadScale=3500/170≈20.6
- 人类 maxAge=85 → quadScale=3500/85≈41.2
- 精灵 maxAge=400 → quadScale=max(8.75, 8)=8.75

哥布林的 quadScale 高达 106，但**衰减只在 lifeRatio>0.5 后启动**。哥布林 33岁的 50% 是 16.5 岁——意味着前 16 年几乎无衰减，后 16 年疯狂衰减。但由于 regen cap=3 每年恢复 + 衰减，实际效果是后期 HP 掉得快但也被 regen 拉住，加上 sigmoid 过渡平滑，导致中位数偏高。

真正问题是：**哥布林寿命太短（33年），sigmoid 跨度（0.3~0.6 × 33 = 10~20岁）占了寿命的大部分，衰减窗口太短**。

### A-2. 参数调整方案

**文件**：`src/engine/core/SimulationEngine.ts` → `regenHp()` 方法

#### 调整 1：sigmoid 启动点前移

```
当前：sigmoidMid = 0.45, sigmoidK = 14, peak = 5
建议：sigmoidMid = 0.35, sigmoidK = 12, peak = 5
```

**理由**：
- `mid` 从 0.45 降到 0.35：衰减更早启动
- `k` 从 14 降到 12：过渡稍缓（不会突然加速）
- 对各种族效果：哥布林在 11.5 岁（35%×33）开始 sigmoid 衰减，比之前早 3 年

#### 调整 2：quadScale 公式优化

```
当前：quadScale = max(3500/maxAge, 8)
建议：quadScale = max(4500/maxAge, 10)
```

**理由**：
- 常数从 3500 提升到 4500：短寿种族二次加速更明显
- 最低值从 8 提升到 10：长寿种族（精灵）也有更稳定的晚期衰减
- 对各种族效果：
  - 哥布林：4500/33≈136（从 106 提升，后期加速更强）
  - 人类：4500/85≈53（从 41 提升）
  - 矮人：4500/170≈26.5（从 20.6 提升）
  - 精灵：max(11.25, 10)=11.25（从 8.75 提升）

#### 调整 3：overage 惩罚增强

```
当前：overageRatio × 50
建议：overageRatio × 60
```

**理由**：当前哥布林偶尔能活到 34-36 岁（超过 lifespanRange），加强 overage 确保不会超寿命太多。

#### 调整 4：regen cap 微调

```
当前：Math.min(initialStrRegen, 3)
建议：Math.min(initialStrRegen, 2.5)  →  取整为 Math.min(initialStrRegen, 2) 或用 floor 后 clamp
```

**理由**：regen cap=3 对于哥布林 33 岁寿命来说过高。降低到 2 可以加快整体 HP 消耗速度。

**但需要注意**：降低 regen cap 会影响所有种族。如果矮人已经偏低（56-63%），再降 regen 会让矮人更惨。

**替代方案**：不改 regen cap，而是让 quadScale 的提升单独覆盖哥布林/人类的需求。矮人可以用 quadScale 公式中加一个种族寿命区间的修正系数。

```
建议（替代方案，更精细）：
// 中寿种族（100-400）衰减稍缓
let quadScaleBase = 4500 / maxAge
if (maxAge >= 100 && maxAge <= 400) {
  quadScaleBase *= 0.85  // 中寿种族衰减减速 15%
}
quadScale = Math.max(quadScaleBase, 10)
```

**预期效果**：
- 哥布林：4500/33≈136 → 不受 0.85 影响 → 136（比之前 106 提升 28%）
- 人类：4500/85≈53 → 53×0.85≈45（比之前 41 略提升）
- 矮人：4500/170≈26.5 → 26.5×0.85≈22.5（比之前 20.6 略提升）
- 精灵：max(4500/400, 10)=max(11.25, 10)=11.25 → 11.25×0.85≈9.6 → clamp to 10

**推荐采用方案**：调整 1 + 调整 2（带中寿修正系数） + 调整 3。不调整 regen cap。

### A-3. 衰减与事件系统的联动

**文件**：`data/sword-and-magic/events/middle-age.json`、`elder.json`

**建议**：在衰老事件中加入生命周期比率的条件描述，让玩家感知到衰老。这不是代码改动，而是内容添加。

**新增事件建议**（或修改现有事件）：

1. **`mid_body_decline`**（已有，age 45-55）— 已有 "你感到身体大不如前" 的描述，✅ 合格
2. **`elder_frail`**（已有，age 65-88）— 已有衰老描述，✅ 合格
3. **新增平淡年衰减提示**：在 `regenHp` 中，当 `lifeRatio > 0.6` 且 `ageDecay >= 3` 时，在平淡年返回结果中添加衰减描述文本

**文件**：`src/engine/core/SimulationEngine.ts` → `skipYear()` 方法

**改动**：在平淡年描述中根据 lifeRatio 追加衰老提示。

```
if (lifeRatio > 0.8) → "岁月不饶人，你感到生命在流逝"
if (lifeRatio > 0.6) → "你开始感到力不从心"
if (lifeRatio > 0.4) → "你注意到自己不如从前了"
```

**预期效果**：玩家在平淡年也能感知到衰老过程，而不是突然死亡。

---

## B. 事件伤害调整

### B-1. 当前伤害值域统计

| 伤害值 | 出现次数 | 主要来源年龄段 |
|--------|---------|---------------|
| -55 ~ -60 | 5 | 童年(2), 成年/中年/老年(3) |
| -40 ~ -50 | 8 | 成年/中年/老年 |
| -30 ~ -39 | 18 | 全年龄段 |
| -20 ~ -29 | 30+ | 全年龄段 |
| -10 ~ -19 | 50+ | 全年龄段 |
| -1 ~ -9 | 30+ | 全年龄段 |

### B-2. 童年极端伤害处理

**问题事件**：

| 事件 | 分支 | 当前伤害 | 初始 HP 40 时结果 | 初始 HP 55 时结果 |
|------|------|---------|------------------|------------------|
| `child_plague` | 失败 | -55 | HP→0（即死）+ 致命打击 | HP→0（即死） |
| `child_plague` | 抗争 | -45 | HP→0（即死） | HP→10 |
| `child_drowning` | 失败 | -45 | HP→0（即死） | HP→10 |

**建议**：引入**童年 HP 保护机制**（见 F 节详细方案），同时对极端伤害值做 clamp。

#### B-2-1. 伤害 clamp 方案

**文件**：`src/engine/modules/EventModule.ts` → `applyEffect()` 中的 `modify_hp` case

```typescript
case 'modify_hp': {
  const hpBefore = state.hp
  // 童年保护：age < 15 时，单次事件伤害不超过当前 HP 的 60%
  let damage = effect.value
  if (damage < 0 && state.age < 15) {
    const maxDamage = Math.floor(hpBefore * 0.6)
    damage = Math.max(damage, -maxDamage)
  }
  state.hp = Math.max(0, state.hp + damage)
  // 致命打击判定...
}
```

**理由**：童年角色（age<15）的单次伤害上限为当前 HP 的 60%，确保不会一击必杀。这与致命打击的 50% 阈值配合：60% > 50%，所以致命打击仍然可能触发（额外 -10），但基础伤害被限在可控范围。

**预期效果**：
- HP 40 的哥布林，age 10 受到 plague（-55）→ 实际伤害 = max(-55, -24) = -24 → HP 降至 16，触发致命打击？24 > 40×0.5=20，是 → 额外 -10 → HP 6
- HP 55 的人类，age 8 受到 plague（-55）→ 实际伤害 = max(-55, -33) = -33 → HP 降至 22，33 > 55×0.5=27.5？否，33>27.5 是 → 额外 -10 → HP 12

这样童年事件虽然危险，但不会直接杀死角色，而是把 HP 打到低位进入濒死区间。

#### B-2-2. 童年事件伤害值调整

同时建议直接降低童年失败分支的伤害值，使其在无 clamp 时也不至于太极端：

| 事件 | 分支 | 当前值 | 建议值 | 理由 |
|------|------|--------|--------|------|
| `child_plague` | 失败(plague_rest) | -45 | -20 | 瘟疫确实严重，但孩子不应该直接死 |
| `child_plague` | 抗争(plague_resist) | -55 | -25 | 抗争失败更严重 |
| `child_drowning` | 挣扎(drowning_struggle) | -30 | -15 | 挣扎但没完全脱险 |
| `child_drowning` | 失败(drowning_struggle) | -45 | -25 | 溺水很危险但不至于即死 |

**文件**：`data/sword-and-magic/events/childhood.json`

### B-3. 高难度事件伤害评估

**不需要调整的事件**（年龄合理、有分支选择）：

- `challenge_god_trial` / `challenge_final_boss`：这是高风险高回报的终局挑战，失败-50~-60 合理
- `knight_dragon_quest`：屠龙失败 -35+致命打击，合理
- `elder_kingdom_crisis`：英雄壮烈牺牲 -35+致命打击(-70)，合理
- `elder_final_illness`：-40 治疗失败，合理（老年事件）

**可能需要调整的事件**：

| 事件 | 当前伤害 | 问题 | 建议 |
|------|---------|------|------|
| `mid_chronic_pain` endure | -15 | 中年慢性痛，合理 | 不改 |
| `goblin_elder_legend` gamble | -15 | 哥布林老年赌命，合理 | 不改 |
| `demon_hunt` resist | -30 | 青年事件但伤害偏高 | 降为 -20 |

### B-4. 事件伤害是否应随年龄/种族变化

**不建议**引入全局的"伤害随年龄缩放"机制。

**理由**：
1. 增加系统复杂度，难以调试
2. 事件伤害应该反映事件本身的危险性，不是角色年龄
3. 老年角色 HP 本身就低（衰减 + 软上限），高伤害事件自然会变得更致命

**例外**：童年保护机制（age < 15 的伤害 clamp）是合理的，因为童年是游戏体验的"导入期"，被事件一击必杀的体验极差。

### B-5. 致命打击机制调整

当前致命打击：单次伤害 > HP 50% 时额外 -10。

**问题**：这个机制在童年和低 HP 状态下过于严苛。

**建议**：
```
致命打击额外伤害 = Math.min(10, Math.floor(hpBefore * 0.15))
```

即致命打击的伤害也按 HP 比例缩放，上限 10。这样：
- HP 60 时：致命打击 = min(10, 9) = 9
- HP 30 时：致命打击 = min(10, 4) = 4
- HP 10 时：致命打击 = min(10, 1) = 1

**文件**：`src/engine/modules/EventModule.ts` → `applyEffect()` 的 `modify_hp` case

**预期效果**：低 HP 时致命打击不再是"必死"的额外打击，而是按比例的伤害。

---

## C. 死代码修复

### C-1. damage_reduction 接入方案

**当前状态**：
- `ItemModule.getDamageReduction(state)` 返回所有物品的 `damage_reduction` 效果值之和
- 有 3 个物品提供此效果：旅人斗篷(0.15)、龙鳞护符(0.20)、圣剑(0.15)
- 引擎从未调用

**接入位置**：`src/engine/modules/EventModule.ts` → `applyEffect()` 的 `modify_hp` case

**方案**：在 modify_hp 处理伤害时，检查 state 中的物品是否有 damage_reduction。

```typescript
case 'modify_hp': {
  const hpBefore = state.hp
  let damage = effect.value
  
  // 童年保护（见 B-2-1）
  if (damage < 0 && state.age < 15) {
    const maxDamage = Math.floor(hpBefore * 0.6)
    damage = Math.max(damage, -maxDamage)
  }
  
  // 伤害减免：物品提供的 damage_reduction
  if (damage < 0) {
    // 需要从 ItemModule 获取，传入 state
    const reduction = this.itemModule.getDamageReduction(state)
    damage = Math.round(damage * (1 - reduction))
  }
  
  state.hp = Math.max(0, state.hp + damage)
  // 致命打击...
}
```

**依赖**：EventModule 需要持有 ItemModule 引用。

**改动**：
1. `EventModule` constructor 增加 `itemModule` 参数
2. `SimulationEngine` 构造函数传 `itemModule` 给 `EventModule`
3. `applyEffect` 中调用 `this.itemModule.getDamageReduction(state)`

**文件清单**：
- `src/engine/modules/EventModule.ts`：添加 itemModule 引用 + modify_hp 中的减免逻辑
- `src/engine/core/SimulationEngine.ts`：构造 EventModule 时传入 itemModule

**预期效果**：
- 有旅人斗篷(15%)的角色，受到 -20 伤害 → 实际 -17
- 有圣剑(15%) + 龙鳞护符(20%)的角色，受到 -20 伤害 → 实际 -13
- 物品系统对游戏平衡产生实际影响，不再是死代码

### C-2. conditional_regen 接入方案

**当前状态**：
- `ItemModule.getConditionalRegen(state)` 返回满足条件的 conditional_regen 效果之和
- 有 3 个物品提供此效果：灵魂宝石(8, hp<30)、孤儿手环(10, hp<25)、暗黑之镜(15, hp<20)
- 引擎从未调用

**接入位置**：`src/engine/core/SimulationEngine.ts` → `regenHp()` 方法末尾

**方案**：在每年 HP 恢复计算完成后，检查 conditional_regen。

```typescript
private regenHp(): void {
  // ... 现有逻辑 ...
  
  const newHp = Math.min(this.state.hp + regen - ageDecay + itemBonus, modifiedCap)
  
  // 条件恢复：物品提供的 conditional_regen（HP<阈值时额外恢复）
  let finalHp = newHp
  if (finalHp > 0 && finalHp < modifiedCap) {
    const conditionalBonus = this.itemModule.getConditionalRegen({
      ...this.state,
      hp: newHp,  // 使用恢复后的 HP 检查条件
    })
    if (conditionalBonus > 0) {
      finalHp = Math.min(newHp + conditionalBonus, modifiedCap)
    }
  }
  
  this.state = { ...this.state, hp: finalHp }
}
```

**注意**：需要用恢复后的 HP 来判断条件（例如 hp < 30），所以要在 main calculation 之后调用。

**文件**：`src/engine/core/SimulationEngine.ts` → `regenHp()`

**预期效果**：
- 有灵魂宝石的角色在 HP < 30 时每年多恢复 8 点
- 有孤儿手环的角色在 HP < 25 时每年多恢复 10 点
- 这两个物品可以有效防止角色在低 HP 区间快速死亡，增加"死里逃生"的戏剧性

---

## D. 濒死机制调整

### D-1. 当前机制

```
触发条件：0 < HP ≤ 10
20% 直接死亡
15% 奇迹生还（HP +18）
65% 挂 near_death 标记（无实质效果）
```

### D-2. 问题分析

1. **触发阈值固定为 10**：对于初始 HP 40 的哥布林，10 HP 是 25%；对于初始 HP 76 的矮人，10 HP 只有 13%。同一个阈值对不同种族意义不同。
2. **挂标记无实质效果**：65% 的 near_death 标记目前没有任何游戏效果，纯粹是叙事标记。
3. **概率分布**：20% 死亡 + 15% 奇迹 = 35% 有实质效果，65% 无事发生。这个比例尚可，但"无事发生"太多了。

### D-3. 建议调整

#### D-3-1. 濒死阈值动态化

```typescript
const nearDeathThreshold = Math.max(8, Math.floor(initHp * 0.15))
```

| 种族 | 初始 HP | 15% | 阈值 |
|------|---------|-----|------|
| 哥布林 | 40-52 | 6-7.8 | 8(clamped) |
| 精灵 | 40-52 | 6-7.8 | 8(clamped) |
| 人类 | 55-61 | 8.25-9.15 | 8-9 |
| 矮人 | 61-76 | 9.15-11.4 | 9-11 |

这样矮人的濒死阈值更高（低 HP 就触发濒死判定），体现"矮人体魄强健但一旦虚弱就很危险"。

#### D-3-2. 濒死概率分层

```
HP ≤ threshold × 0.5（极度濒死）：
  35% 直接死亡
  20% 奇迹生还（HP +20）
  45% 挂标记

threshold × 0.5 < HP ≤ threshold（轻度濒死）：
  10% 直接死亡
  20% 奇迹生还（HP +15）
  15% HP +5（小幅恢复）
  55% 挂标记
```

**理由**：HP 越低风险越高，增加濒死区间的不确定性和戏剧性。

#### D-3-3. near_death 标记增加游戏效果

建议在事件系统中消费 `near_death` flag：
- 某些事件在有 `near_death` flag 时触发特殊变体（例如"大难不死，你开始珍惜生命"→ chr+3）
- 或者在某些成就的条件中使用

这是内容层面的改动，不涉及引擎修改。建议后续版本实现。

### D-4. 改动汇总

**文件**：`src/engine/core/SimulationEngine.ts` → `postYearProcessCore()`

**改动内容**：
1. 将固定的 `10` 阈值替换为动态计算
2. 濒死概率分层
3. 增加小幅恢复选项

**预期效果**：
- 濒死机制更有层次感
- 矮人的濒死体验更合理
- 极低 HP 时风险显著增加

---

## E. 评分公式调整

### E-1. 当前公式

```typescript
score = peakSum × 1.2 + lifespan × 0.3 + items × 3 + routes × 15
```

### E-2. 问题分析

**长寿种族碾压短寿种族**：

以满属性（peakSum≈70）为例：

| 种族 | lifespan(中位) | peakSum | 当前总分 |
|------|---------------|---------|---------|
| 人类 | 67 | 70 | 84 + 20.1 + 9 + 15 = **128.1** |
| 精灵 | 265 | 70 | 84 + 79.5 + 9 + 15 = **187.5** |
| 哥布林 | 27 | 70 | 84 + 8.1 + 9 + 15 = **116.1** |

精灵比人类多 **59 分**（纯寿命差），比哥布林多 **71 分**。这直接导致精灵更容易拿到 S 甚至 SS 评价，而哥布林很难超过 B。

### E-3. 新评分公式建议

**核心思路**：寿命得分用**对数/平方根缩放**，压缩长寿种族的优势，同时保留"活得久应该加分"的直觉。

```typescript
// 寿命得分：使用对数缩放 + 种族寿命比例奖励
const lifespanBase = Math.log2(lifespan + 1) * 8  // 对数缩放，log2(80)≈6.3→50, log2(400)≈8.6→69
const lifespanRatio = lifespan / effectiveMaxAge     // 0~1+
const ratioBonus = lifespanRatio * 40               // 活到寿命极限的奖励
const lifespanScore = lifespanBase + ratioBonus

// 属性得分保持不变
const attrScore = totalAttributePeakSum * 1.2

// 物品和路线保持不变
const itemScore = state.inventory.items.length * 3
const routeBonus = routeFlags.reduce(...)

const score = attrScore + lifespanScore + itemScore + routeBonus
```

### E-4. 效果对比

以满属性（peakSum=70）、1 物品、1 路线为例：

| 种族 | lifespan | 当前评分 | 新评分(lifeBase + ratioBonus) |
|------|----------|---------|----------------------------|
| 人类 | 67 | 128.1 | 84 + 50.4 + 29.8 + 9 + 15 = **188.2** |
| 精灵 | 265 | 187.5 | 84 + 68.8 + 25.3 + 9 + 15 = **202.1** |
| 哥布林 | 27 | 116.1 | 84 + 40.5 + 32.7 + 9 + 15 = **181.2** |
| 矮人 | 105 | 146.5 | 84 + 56.7 + 23.3 + 9 + 15 = **188.0** |

**差距对比**：
- 精灵 vs 人类：当前 59 分 → 新 14 分 ✅
- 精灵 vs 哥布林：当前 71 分 → 新 21 分 ✅  
- 哥布林 vs 人类：当前 -12 分 → 新 -7 分 ✅

**注意**：新公式下所有种族的绝对分数都提高了，需要同步调整 `rules.json` 中的评级分数线。

### E-5. 评级分数线调整

**文件**：`data/sword-and-magic/rules.json`

```
新建议分数线（基于新公式）：

D: 0 - 120
C: 120 - 170
B: 170 - 210
A: 210 - 260
S: 260 - 320
SS: 320+
```

**理由**：新公式下典型分数范围约 120-250，重新划定评级区间。

### E-6. 实施文件

1. `src/engine/modules/EvaluatorModule.ts` → `calculateScore()`
2. `data/sword-and-magic/rules.json` → grades 数组

---

## F. 极端早夭问题

### F-1. 现状

| 种族 | 最小死亡年龄 | 死因 |
|------|-------------|------|
| 精灵 | 27 | 事件伤害 |
| 哥布林 | 9 | 事件伤害（child_plague 或 child_drowning） |
| 人类 | 42 | 较正常的死亡 |

**问题**：哥布林 9 岁死亡意味着游戏只进行了 9 年，玩家几乎没有体验到任何内容。

### F-2. 童年 HP 保护机制

**文件**：`src/engine/modules/EventModule.ts` → `applyEffect()` 的 `modify_hp` case

**方案**：age < 15 时，单次事件伤害不超过当前 HP 的 60%（详见 B-2-1）。

这个机制已经在 B 节详细描述，这里补充额外保护：

#### F-2-1. 平淡年额外保护（age < 10）

在 `regenHp` 中，对 age < 10 的角色，衰减设为 0：

```typescript
// 童年前期无衰减
if (age < 10) {
  ageDecay = 0
}
```

**理由**：10 岁以下角色不应该因为自然衰减而死亡。死亡只能来自事件，而事件已经有 60% 的 clamp。这样童年"导入期"更安全，玩家有时间建立对角色的情感连接。

**预期效果**：
- 哥布林前 10 年几乎不可能因衰减死亡
- 10 岁后衰减逐步启动（配合 sigmoid 前移到 0.35，哥布林在 11.5 岁开始 sigmoid）
- 童年事件仍然可以造成伤害，但不会一击必杀

#### F-2-2. 确保最低 HP 保护

在 `postYearProcessCore()` 中，如果 `age < 10 && hp > 0`，确保不触发濒死判定：

```typescript
// 童年角色不触发濒死随机死亡
if (newState.hp > 0 && newState.hp <= nearDeathThreshold && newState.age >= 10) {
  // 濒死判定逻辑
}
```

**预期效果**：10 岁以下角色只要 HP > 0 就不会突然随机死亡。

### F-3. 综合效果

| 保护层 | 保护范围 | 效果 |
|--------|---------|------|
| 衰减归零 | age < 10 | 童年前期无自然死亡 |
| 伤害 clamp | age < 15 | 单次伤害不超过 HP 60% |
| 濒死排除 | age < 10 | 不触发随机死亡判定 |
| 致命打击比例化 | 全年龄 | 低 HP 时致命打击伤害降低 |

**预期**：哥布林最小死亡年龄从 9 岁提升到约 12-15 岁，精灵从 27 岁提升到约 30+ 岁。玩家至少能体验完整童年。

---

## 实施顺序与依赖关系

```
阶段 1：基础保护（无依赖，优先实施）
├── F. 童年 HP 保护（regenHp + applyEffect + postYearProcess）
│   ├── F-2-1: age < 10 无衰减
│   ├── B-2-1: age < 15 伤害 clamp
│   └── F-2-2: age < 10 不触发濒死
│
└── B-5: 致命打击比例化（EventModule.applyEffect）

阶段 2：衰减曲线调整（依赖阶段 1 完成后的数据对比）
├── A-2: sigmoid + quadScale + overage 参数调整
│   ├── sigmoidMid: 0.45 → 0.35
│   ├── sigmoidK: 14 → 12
│   ├── quadScale: 3500 → 4500 + 中寿修正
│   └── overage: 50 → 60
│
└── A-3: 平淡年衰老提示文本（SimulationEngine.skipYear）

阶段 3：死代码修复（独立于阶段 2，可并行）
├── C-1: damage_reduction 接入（EventModule + SimulationEngine）
└── C-2: conditional_regen 接入（SimulationEngine.regenHp）

阶段 4：濒死机制（依赖阶段 1）
└── D: 濒死阈值动态化 + 概率分层

阶段 5：事件数据调整（依赖阶段 1 的 clamp 保护就位后）
├── B-2-2: 童年事件伤害值降低
└── B-3: 其他事件伤害微调

阶段 6：评分公式（最后实施，需要所有平衡改动确定后）
├── E-3: 新评分公式
└── E-5: 评级分数线调整
```

**依赖关系图**：
```
阶段1 ──→ 阶段2 ──→ 阶段5 ──→ 阶段6
阶段1 ──→ 阶段4
阶段1 ──→ 阶段3（可并行阶段2）
```

---

## 验证方案

### 每步验证方法

#### 阶段 1 验证

```bash
# 编译检查
npx vue-tsc --noEmit

# 单元测试
npx vitest run

# 手动验证：跑 20 局哥布林，统计最小死亡年龄
# 预期：最小死亡年龄 ≥ 12，无 9 岁死亡
```

#### 阶段 2 验证

```bash
# 编译检查 + 单元测试
npx vue-tsc --noEmit && npx vitest run

# 数据验证：跑 10 局/种族，统计中位数
# 预期：
#   人类：中位数 65-75% 极限（52-68 岁）
#   精灵：中位数 55-65% 极限（209-273 岁）
#   哥布林：中位数 65-75% 极限（20-27 岁）
#   矮人：中位数 60-70% 极限（96-126 岁）
```

#### 阶段 3 验证

```bash
# 编译 + 单元测试
npx vue-tsc --noEmit && npx vitest run

# 功能验证：
# 1. 创建角色并给予旅人斗篷
# 2. 触发一个 -20 HP 事件
# 3. 验证实际伤害为 -17（15% 减免）
# 
# 4. 创建角色并给予灵魂宝石
# 5. 让 HP 降至 25 以下
# 6. 验证每年额外恢复 8 HP
```

#### 阶段 4 验证

```bash
# 编译 + 单元测试
npx vue-tsc --noEmit && npx vitest run

# 统计验证：跑 50 局，统计濒死触发次数和结果分布
# 预期：
#   轻度濒死：~10% 死亡，~20% 奇迹
#   极度濒死：~35% 死亡，~20% 奇迹
```

#### 阶段 5 验证

```bash
# 数据校验
python3 scripts/content-tool.py validate
python3 scripts/content-tool.py check-flags

# 语义验证：检查童年事件伤害值合理性
```

#### 阶段 6 验证

```bash
# 编译 + 测试
npx vue-tsc --noEmit && npx vitest run

# 评分分布验证：跑 20 局/种族，统计评分范围
# 预期：各种族评分分布更均匀，精灵不再碾压
```

### 自动化批量测试

建议在 `tests/` 下添加一个**批量模拟测试**，自动跑 N 局并统计关键指标：

```typescript
// tests/engine/balance/batch-simulation.test.ts
describe('批量模拟平衡测试', () => {
  for (const race of ['human', 'elf', 'goblin', 'dwarf'] as const) {
    it(`${race} 寿命中位数应在目标范围内`, () => {
      const results = runBatch(race, 100)
      const median = getMedian(results.map(r => r.lifespan))
      const [minLife, maxLife] = raceLifespan[race]
      const ratio = median / maxLife
      const [targetMin, targetMax] = raceTargets[race]
      expect(ratio).toBeGreaterThanOrEqual(targetMin)
      expect(ratio).toBeLessThanOrEqual(targetMax)
    })
  }
})
```

---

## 附录：改动文件汇总

| 文件 | 阶段 | 改动类型 | 改动概要 |
|------|------|---------|---------|
| `src/engine/core/SimulationEngine.ts` | 1,2,3,4 | 代码修改 | regenHp 衰减参数/童年保护/conditional_regen; skipYear 衰减提示; postYearProcessCore 濒死 |
| `src/engine/modules/EventModule.ts` | 1,3 | 代码修改 | applyEffect 伤害 clamp/比例化致命打击/damage_reduction 接入 |
| `src/engine/modules/EvaluatorModule.ts` | 6 | 代码修改 | 评分公式重写 |
| `data/sword-and-magic/events/childhood.json` | 5 | 数据修改 | 童年事件伤害值降低 |
| `data/sword-and-magic/rules.json` | 6 | 数据修改 | 评级分数线调整 |

**不改动的文件**：
- `ItemModule.ts`：方法已实现，只需被调用（无需修改）
- `races.json`：种族定义不变
- `items.json`：物品定义不变
- 其他事件文件：除童年事件外不改

---

> **最终提醒**：每个阶段完成后务必跑完整验证流程（编译→测试→批量模拟），确认无回归后再进入下一阶段。
