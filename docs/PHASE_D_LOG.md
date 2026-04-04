# Phase D — 世界观审查与修复日志

## 总览

Phase D 包含5个子任务：标记修复、入口事件调优、Schema修正、寿命/衰老曲线、Lore一致性审查。

---

## D1: Flag 引用修复

**诊断**：使用 `scripts/diagnose-flags-v3.py` 扫描全部事件 JSON 中的 flag 引用与设置。

**发现**：
- 13 处"缺失" flag 引用：7 个自排除（无害），6 个真实问题
- `magic_graduate` 被4处引用，但实际设置的 flag 是 `mage_graduate`（命名不一致）
- `parent` flag 被3个事件引用但从未设置
- `divine_chosen` 在 `spr_divine_sign` exclude 中引用，但实际 flag 是 `chosen_one`
- `dragon_blood`/`demon_heritage` 在 `elder_spirit_trial` 中用 `has.flag.xxx` 引用，但实际是天赋不是 flag

**修复**（8处修改）：
1. `magic_graduate` → `mage_graduate`（adult.json 3处, elder.json 1处）
2. `family_blessing` 两个分支添加 `set_flag: parent`
3. `spr_divine_sign` exclude: `divine_chosen` → `chosen_one`
4. `elder_spirit_trial`: `has.flag.dragon_blood/demon_heritage` → `has.talent.dragon_blood/demon_heritage`

**验证**: `scripts/verify-flags.py` 仅剩7个无害自排除 ✅

---

## D2: 入口事件拒绝率修复

**诊断**：`scripts/analyze-entry-events.py` 分析所有带拒绝分支的事件。

**问题事件**：
- `guild_recruitment`: 3个分支净值均为+3.0（加入不占优）
- `scholar_guidance`: 3个分支净值均为+3.0  
- `become_lord`: 拒绝(+5.0) > 接受(+3.5)

**修复**：
- `join_guild`: 添加 luk+1 → 净值+4.0 vs 拒绝+3.0
- `study_scholar`: 添加 spr+1 → 净值+4.0 vs 拒绝+3.0
- `decline_lordship`: str 从+2降为+1, spr 从+2降为+1 → 净值+3.0 vs 接受+3.5

**验证**: overpowered=0, waste=8, no-branch=2 ✅

---

## D3: AJV Schema 修复

**问题**：种族专属天赋 `draftWeight=0` 导致 AJV 校验失败（schema minimum=1）。

**修复**：`data-loader.ts` 中天赋 `draftWeight` minimum 从 1 改为 0。

---

## D4: 寿命/衰老系统修复

### 发现的Bug

1. **测试脚本80岁硬上限**：`test-score-distribution.ts` 第323行 `if (stateAfter.age >= 80) break` 硬编码了80岁退出，导致寿命数据失真。
   - 修复：移除硬编码上限，改为检查 `stateAfter.phase === 'finished'`
   - 循环上限从100提升到500（支持精灵种族）

2. **Mundane year 跳过死亡检查**：无事件年不调用 `postYearProcess()`，导致 `effectiveMaxAge` 不生效。角色可以活到122岁（超过100岁上限）。
   - 修复：在 `candidates.length === 0` 路径中调用 `this.postYearProcess()`

### 衰减曲线调整

| 年龄段 | 原始衰减 | 当前衰减 |
|--------|---------|---------|
| 40-49  | 1/yr    | 1/yr    |
| 50-59  | 2/yr    | 2/yr    |
| 60-69  | 4/yr    | 2/yr    |
| 70-79  | 6/yr    | 3/yr    |
| 80-89  | 8/yr    | 4/yr    |
| 90+    | —       | 5/yr    |

### 修后测试结果（20局, 无种族）

| 指标 | 修前 | 修后 |
|------|------|------|
| min  | 41   | 39   |
| max  | 80*  | 100  |
| avg  | 66.5 | 60.5 |
| median | 72 | 72 |

*80为测试脚本硬编码上限，非真实值

保守性格角色平均寿命72-79岁，鲁莽性格36-49岁。叙事上合理。

---

## D5: Lore 一致性审查

**方法**：交叉比对5份 lore 文档与全部事件文件。

### 修复的问题

| # | 严重程度 | 事件ID | 问题 | 修复 |
|---|---------|--------|------|------|
| 1 | 高 | `dragon_slay_attempt` | "北方的山谷" 应为 "东方炽焰山脉" | 描述修正 |
| 2 | 高 | `world_breaking_start` | `&`/`|` 优先级导致条件逻辑错误 | 添加括号 |
| 3 | 低 | `merchant_career` | include 条件重复 | 去重 |

### 补充的 Lore 内容

- 在 `races.md` 中新增哥布林族（Goblin）完整定义
- 在 `races.md` 中新增妖精（Fairy）作为魔法生物的定义
- 更新种族关系表，增加哥布林与其他种族的关系

### 一致性良好的方面

骑士系统、魔法学院、冒险者公会、建国七贤、圣光教会、禁忌魔法、地理位置均与 Lore 文档高度一致。

---

## 验证结果

- vue-tsc: ✅ 无类型错误
- vite build: ✅ 构建成功  
- 平衡: overpowered=0, waste=8, no-branch=2 ✅
- 寿命分布: min=39, max=100, median=72 ✅
