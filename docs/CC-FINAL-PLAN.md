# 最终修复计划

_2026-04-12 · 璃 + CC 联合审查，璃汇总_

---

## 验证结果总表

| # | 问题 | 来源 | 验证 | 影响 |
|---|------|------|------|------|
| E1 | simulateYear 未重置 yearlyHpLoss | CC | ❌ 不存在（startYear 已有） | — |
| E2 | 濒死判定重复 2 处，第 2 处缺童年保护 | CC | ✅ 确认 | 10 岁以下可致死 |
| E3 | HP clamp 3 处，参数不一致 | CC | ✅ 确认 | 高伤害事件被过度削弱 |
| E4 | criticalBonus 未累加 yearlyHpLoss | CC | ✅ 确认 | 年度软限制失效 |
| E5 | grant_item 空实现 | CC | ✅ 确认 | 嵌套事件物品丢失 |
| E6 | regen 硬上限 3 一刀切 | CC | ✅ 确认 | 高体魄种族恢复率低 |
| E7 | 童年保护年龄 3 处不一致 | CC | ✅ 确认 | 维护隐患 |
| E8 | sigmoidMid 硬编码 | CC | ✅ 确认 | 新种族适配差 |
| E9 | maxNetLoss vs overage | CC | ⚠️ 需模拟验证 | 超龄角色可能不死 |
| E10 | startYear 无分支事件无 HP 保护 | CC | ✅ 确认 | 锚点事件可秒杀 |
| D1 | 5 个路线入口 routes 不正确 | 璃 | ✅ 确认 | 入口事件无法触发 |
| D2 | 122/1003 事件缺 tag | 璃 | ✅ 确认 | 缩放逻辑失效 |
| D3 | 14 个 grant_item 多余 value | 璃 | ✅ 确认 | 数据不干净 |
| D4 | 17 个 remove_flag 多余 value | 璃 | ✅ 确认 | 数据不干净 |
| D5 | 70+ 事件缺 routes | 璃 | ✅ 确认 | 不一致 |
| D6 | 权重分布失衡 | 璃 | ✅ 确认 | 恋爱事件过度集中 |
| D7 | 事件总数 1003 vs 1002 | 璃 | ✅ 确认 | 多 1 个事件 |

---

## 修复计划

### Batch 1: 引擎 P0 Bug（最小改动，无依赖）
预计工作量：30 分钟

| # | 问题 | 修复方法 | 文件:行号 | 改动量 |
|---|------|----------|-----------|--------|
| E2 | 濒死判定重复缺童年保护 | 抽取 `nearDeathCheck(state)` 公共方法，两处调用统一 | SimulationEngine.ts:859-885, 1070-1093 | ~30 行 |
| E4 | criticalBonus 未累加 yearlyHpLoss | 在 `state.hp -= criticalBonus` 后加 `state.yearlyHpLoss += criticalBonus` | EventModule.ts:382-385 | +2 行 |
| E5 | grant_item 空实现 | 在 grant_item case 中调用 `this.itemModule.addItem(state, effect.target)` | EventModule.ts:416-418 | +5 行 |

### Batch 2: 引擎 P1（E3 + E10 统一 HP 保护策略）
依赖：Batch 1
预计工作量：20 分钟

| # | 问题 | 修复方法 | 文件:行号 | 改动量 |
|---|------|----------|-----------|--------|
| E3 | HP clamp 双重保护 | **移除 SimulationEngine 中的外层 clamp**，只保留 EventModule 内部的。理由：EventModule 更接近数据，clamp 用 hpBefore*0.3 更精确 | SimulationEngine.ts:1062-1065 | -5 行 |
| E10 | 无分支事件无 HP 保护 | 既然移除了外层 clamp，EventModule 内部已经保护所有事件（含无分支），无需额外处理 | 无需改动 | 0 行 |

### Batch 3: 数据 P0（路线入口 + 多余字段）
可与 Batch 1 并行
预计工作量：15 分钟

| # | 问题 | 修复方法 | 文件 | 改动量 |
|---|------|----------|------|--------|
| D1 | 5 个路线入口 routes 错误 | 改 routes 为 `["*"]` | youth.json, adult.json | 5 处 |
| D3 | 14 个 grant_item 多余 value | 删除 value 字段 | events/*.json | 14 处 |
| D4 | 17 个 remove_flag 多余 value | 删除 value 字段 | adult.json, middle-age.json | 17 处 |

### Batch 4: 数据 P1（tag + routes 补全）
依赖：Batch 3
预计工作量：60 分钟（122 个事件需逐个判断）

| # | 问题 | 修复方法 | 文件 | 改动量 |
|---|------|----------|------|--------|
| D2 | 122 个事件缺 tag | 根据事件内容、effects、id 前缀自动推断 tag（chr→combat, mag→magic, spr→spirit, luk→luck, mny→merchant, int→knowledge, str→combat, life→life, romance→romance） | events/*.json | 122 处 |
| D5 | 70+ 事件缺 routes | 批量设置 `routes: ["*"]` | events/*.json | 70+ 处 |

### Batch 5: 引擎 P2（常量统一 + regen + sigmoid）
依赖：Batch 2
预计工作量：30 分钟

| # | 问题 | 修复方法 | 文件:行号 | 改动量 |
|---|------|----------|-----------|--------|
| E6 | regen 硬上限 3 | 改为 `Math.min(initialStrRegen, Math.floor(initHp * 0.12))`，保持恢复率一致 | SimulationEngine.ts:329 | 1 行 |
| E7 | 童年保护年龄不统一 | 在 types.ts 定义 `CHILDHOOD_HP_PROTECTION_AGE=15` 和 `CHILDHOOD_DEATH_PROTECTION_AGE=10`，统一引用 | types.ts, EventModule.ts, SimulationEngine.ts | +10 行 |
| E8 | sigmoidMid 硬编码 | 从 race 定义读取 sigmoidMid，缺失时用连续插值 `0.28 + 0.14 * Math.min(lifeRatio, 1)` | SimulationEngine.ts, races.json | ~20 行 |

### Batch 6: 平衡调优
依赖：Batch 4
预计工作量：30 分钟

| # | 问题 | 修复方法 | 文件 | 改动量 |
|---|------|----------|------|--------|
| D6 | 权重分布失衡 | 设权重上限 30，first_love 50→30，elf_first_love 40→30 | events/*.json | ~10 处 |
| D7 | 事件数 1003 | 保留 elf_first_love，更新计划文档为 1003 | docs | 1 处 |
| E9 | maxNetLoss vs overage | 模拟验证后决定：如果超龄角色不死，overage 惩罚不受 maxNetLoss 限制 | SimulationEngine.ts | ~5 行 |

---

## 执行顺序

```
Batch 1 (引擎 P0) ──── ┐
                        ├──→ Batch 2 (引擎 P1) ──→ Batch 5 (引擎 P2) ──→ Batch 6 (平衡)
Batch 3 (数据 P0) ──── ┘
                        └──→ Batch 4 (数据 P1) ──→ Batch 6 (平衡)
```

每个 Batch 完成后：
1. 运行 `npx vitest run` 确认 404/404 通过
2. 运行 `npx vitest run tests/data/data-validation.test.ts` 确认 40/40 通过
3. 检查 `git diff --stat` 确认改动范围

## 总工作量估计
- Batch 1-3: ~65 分钟（核心 bug 修复）
- Batch 4-5: ~90 分钟（数据补全 + 架构改进）
- Batch 6: ~30 分钟（平衡调优）
- **总计: ~3 小时**
