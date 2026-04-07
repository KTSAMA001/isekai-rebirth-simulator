# Phase C 种族与性别内容系统日志

## 概述
- **日期**: 2026-04-03
- **目标**: 实现种族变体、性别变体、种族独占天赋、种族独占事件系统
- **基线**: 247 事件 / 41 天赋 / 608 分支
- **结果**: 258 事件 / 47 天赋 / 641 分支

---

## C1+C2: resolveVariants() 实现 ✅

### 修改文件
- `src/engine/modules/EventModule.ts` — 新增 `resolveVariants()` 方法

### 逻辑
1. 读取 `event.raceVariants[playerRace]` → 覆盖 title/description/branches/effects
2. 读取 `event.genderVariants[playerGender]` → 覆盖 title/description
3. `resolveEvent()` 使用 resolved 值处理 pendingBranch、effectTexts、eventLog

---

## C3: exclusiveTalents 实现 ✅

### 修改文件
- `src/engine/modules/TalentModule.ts` — `draftTalents()` 新增 `raceId?: string` 参数
- `src/engine/core/SimulationEngine.ts` — 传入 `this.state.character.race`

### 逻辑
- 根据 `raceId` 查找 `world.races` 中的 `exclusiveTalents`
- 种族独占天赋保证出现在抽取池中，普通池名额相应减少

---

## C4: 种族独占天赋数据 ✅

### 脚本: `scripts/patch-c4-race-talents.py`

| 天赋 ID | 稀有度 | 种族 | 效果 |
|---------|--------|------|------|
| human_adaptability | common | 人族 | 所有属性 +1 |
| human_ambition | rare | 人族 | 经验获取增强 |
| elven_harmony | common | 精灵 | mag+2, spr+1 |
| elven_timeless_gaze | rare | 精灵 | int+2, 减缓衰老 |
| goblin_cunning | common | 哥布林 | luk+2, mny+1 |
| goblin_chaos_born | rare | 哥布林 | 混沌亲和 |

- `data/sword-and-magic/races.json` 更新 `exclusiveTalents` 数组
- 所有种族天赋 `draftWeight: 0`（仅通过种族获得）

---

## C5: raceVariants 数据 ✅

### 脚本: `scripts/patch-c5-race-variants.py`
- 21 个事件添加精灵/哥布林描述变体
- 分布: birth(4), childhood(5), youth(3), teenager(1), adult(5), middle-age(1), elder(2)

---

## C6: genderVariants 数据 ✅

### 脚本: `scripts/patch-c6-gender-variants.py`
- 13 个事件添加 male/female 文本变体
- 聚焦: 婚恋/社交事件

---

## C7: 种族独占事件 ✅

### 脚本: `scripts/patch-c7-race-events.py`
- 11 个新事件（4 精灵 + 4 哥布林 + 3 人族）
- 使用 `races: ["race_id"]` 进行硬过滤
- 覆盖全年龄段，含骰子检定和分支选择

---

## C8: Schema + 编译 + 平衡验证 ✅

### Schema 更新
- `src/worlds/sword-and-magic/data-loader.ts` — AJV 事件 schema 增加 races/genders/raceVariants/genderVariants 字段

### 验证结果

| 检查项 | 结果 |
|--------|------|
| AJV Schema | 258 事件，0 错误 ✅ |
| vue-tsc --noEmit | 0 类型错误 ✅ |
| vite build | 构建成功 ✅ |

### 平衡修复
- **第一轮** (`scripts/patch-c8-balance-fix.py`): 修复 13 个分支，超标 6→3
- **第二轮** (`scripts/patch-c8-final-fix.py`): 修复 3 个分支，超标 3→0

### 最终平衡报告

| 指标 | Phase B 结束 | Phase C 结束 | 目标 | 状态 |
|------|-------------|-------------|------|------|
| 总事件数 | 247 | 258 (+11) | - | - |
| 总分支数 | 608 | 641 (+33) | - | - |
| 总天赋数 | 41 | 47 (+6) | - | - |
| 分支平均 net | +2.78 | +2.83 | - | 基本持平 |
| 超标分支 (net≥+6) | 0 | 0 | 0 | ✅ |
| 废选项 (net≤0) | 8 | 8 | ≤15 | ✅ |
| 无分支纯正面 | 2 | 2 | ≤3 | ✅ |

---

## 代码变动汇总

| 文件 | 变动说明 |
|------|---------|
| EventModule.ts | +resolveVariants() 方法，resolveEvent() 集成 |
| TalentModule.ts | draftTalents() 增加 raceId 参数 |
| SimulationEngine.ts | 传递 character.race 给天赋模块 |
| data-loader.ts | AJV schema 增加种族/性别相关字段 |
| talents.json | +6 种族独占天赋 |
| races.json | +exclusiveTalents 数组 |
| events/*.json | +21 raceVariants, +13 genderVariants, +11 新事件 |
