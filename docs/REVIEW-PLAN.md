# 架构审查与修复计划

_2026-04-12 · 供 Claude Code 审阅_

---

## 1. 项目现状

### 1.1 基本信息
- **项目**: 异世界转生模拟器 (isekai-rebirth-simulator)
- **分支**: `fix/debt-event-condition`（基于 `8fcba38` v0.9.0）
- **当前未提交修改**: 19 个文件, +40508/-3300 行

### 1.2 架构概览
```
src/engine/
├── core/
│   ├── types.ts          # GameState, LifeRoute, WorldEventDef 等类型定义
│   ├── SimulationEngine.ts  # 主引擎：年龄推进、HP 恢复、路线系统
│   └── stateUtils.ts
├── modules/
│   ├── EventModule.ts    # 事件选择、过滤、效果应用
│   ├── AttributeModule.ts
│   ├── AchievementModule.ts
│   ├── ItemModule.ts
│   ├── ConditionDSL.ts   # 条件表达式解析
│   ├── EvaluatorModule.ts
│   ├── DiceModule.ts
│   └── TalentModule.ts
src/worlds/sword-and-magic/
├── data-loader.ts        # JSON 数据加载 + schema 验证
├── schemas/shared.json   # EventEffect, EventBranch, LifeRoute 等共享 schema
data/sword-and-magic/
├── manifest.json         # 世界配置 + 路线定义（6条：commoner, adventurer, knight, mage, merchant, scholar）
├── events/
│   ├── birth.json        # 71 events
│   ├── childhood.json    # 144 events
│   ├── teenager.json     # 144 events
│   ├── youth.json        # 211 events (含 elf_first_love)
│   ├── adult.json        # 206 events
│   ├── elder.json        # 107 events
│   └── middle-age.json   # 120 events
├── achievements.json     # 160 achievements
├── attributes.json, races.json, items.json, talents.json, rules.json, presets.json
```

### 1.3 核心机制
- **年龄缩放**: EventModule.getScaledAgeRange() 根据 lifespanRatio 缩放事件的 minAge/maxAge
  - life/romance/social 标签 + major 优先级的事件：ratio 上限 2.0
  - 其他事件：线性缩放
  - 短寿命种族保护：minAge 不低于原始值 50%
- **路线系统**: manifest.json 定义 6 条路线，通过 enterCondition（检查 flag）进入
  - commoner（默认）→ 通过入口事件获得 flag → 进入 adventurer/knight/mage/merchant/scholar
  - 事件的 routes 字段控制哪些路线能触发该事件
- **HP 系统**: regenHp() 基于 sigmoid + 二次加速的衰老模型
  - 单次事件 HP 降幅上限：max(20, hpBefore * 0.3)
  - 年度累积 HP 损失软限制：max(30, maxHp * 0.4)，超出后伤害减半
  - yearlyHpLoss 在 age transition 时重置
- **事件选择**: getCandidates() 过滤 → pickEvent() 加权随机选择

---

## 2. 今天已完成的修改

### 2.1 事件链扩展（+314 事件，688→1003）
- 7 个属性路线（chr/str/int/mag/spr/luk/mny）各 20-38 个新事件
- 每条路线 3-5 个 tier，渐进式属性加成

### 2.2 Schema/数据修复
- branch label→id+title, flags→set_flag effects（160 fixes）
- modify_attribute hp→modify_hp（86 fixes）
- tag 数组格式→字符串（58 fixes）
- routes ID 修正："mag"→"mage", "spr"→"scholar"（58 fixes）

### 2.3 权重调整
- 恋爱线事件提权（42 个事件）
- 高属性加成事件提权（82 个事件）
- 路线专属事件提权（148 个事件）
- 430 处属性加成效果 +2

### 2.4 路线入口修复
- knight_examination, guild_join, mag_teen_academy_letter, merchant_apprentice 的 routes 改为 ["*"]

### 2.5 引擎代码
- EventModule.ts: 年度 HP 累积软限制、童年 HP 保护、伤害减免
- SimulationEngine.ts: sigmoid 衰老模型、yearlyHpLoss 重置、agingHint
- types.ts: yearlyHpLoss 和 agingHint 字段

### 2.6 成就系统
- 127→160 个成就（33 个新增）
- 7 个现有成就阈值调整
- 14 个新成就阈值从 40-50 调整到 35-45

---

## 3. 架构审查发现的问题

### 🔴 严重（需优先修复）

#### P0-1: 路线入口事件仍有 5 个 routes 不正确
以下事件的 routes 设为目标路线，commoner 无法触发：
- `youth/magic_academy_enrollment`: routes=["mage"]（设置 magic_student flag）
- `youth/int_invention`: routes=["scholar"]（设置 famous_inventor flag）
- `youth/secret_master`: routes=["scholar"]（设置 has_student flag）
- `adult/magic_research_breakthrough`: routes=["scholar"]（设置 famous_inventor flag）
- `adult/disciple_comes`: routes=["scholar"]（设置 has_student flag）

**应改为 routes=["*"]**，否则这些入口事件永远无法触发。

#### P0-2: 106 个事件缺 tag 字段
- tag 影响：年龄缩放（life/romance/social 有 cap）、事件分类
- 缺 tag 的事件无法被正确分类，也不受缩放保护
- 需要逐个补全

#### P0-3: tag 格式不一致
- 有些事件用多标签字符串如 `"knowledge, magic"`，引擎按 `===` 比较
- `"knowledge, magic" !== "magic"`，导致这些事件的 tag 无法匹配缩放逻辑
- 应统一为单一标签，或将 tag 改为数组（需要改引擎代码）

### 🟡 中等

#### P1-1: 权重分布失衡
- first_love(50) 是均值(4.5)的 11 倍
- 最重的 10 个事件全是恋爱类
- 建议设权重上限（如 30），或给其他类型事件也相应提权

#### P1-2: 事件总数应为 1002 但实际 1003
- 多了一个 elf_first_love（Trace 新增的精灵专属初恋事件）

#### P1-3: grant_item 有多余 value 字段（13 个）
- schema 允许 value（EventEffect 有 value 字段），但语义上 grant_item 只需 target
- 不影响运行，但数据不干净

#### P1-4: remove_flag 有多余 value 字段（3 个）
- adult/forbidden_love, adult/quest_parting, adult/soul_bound

#### P1-5: yearlyHpLoss 是可选字段但多处使用 `?? 0`
- 如果某些代码路径创建 state 时没初始化 yearlyHpLoss，虽然 `?? 0` 能兜底，但建议在 state 初始化时显式设为 0

### 🟢 低优先级

#### P2-1: 70+ 事件缺 routes 字段
- 默认不过滤，但建议显式设 `["*"]` 保持一致性

#### P2-2: middle-age.json 有 120 个事件
- data-loader 会加载这个阶段，但 manifest.json 的 files.events 是 "events.json"
- 需确认 middle-age 是否被正确使用

#### P2-3: 兽人种族未测试
- QA 报告中兽人未覆盖

#### P2-4: 哥布林恋爱线空白
- 哥布林寿命短、社交事件稀少，0 个恋爱事件触发

---

## 4. 现有测试
- `tests/data/data-validation.test.ts`: 40/40 通过
- 全量测试: 25 test files, 404/404 通过
- 关键测试文件:
  - `tests/engine/event-condition-fix.test.ts`
  - `tests/engine/event-condition-fix-verify.test.ts`
  - `tests/full-life-route.test.ts`
  - `tests/playtest-round5.test.ts`
  - `tests/playtest-round6.test.ts`

---

## 5. 请 CC 评估

请审阅以上内容，然后：
1. 评估上述问题分类是否合理
2. 提出你自己的修复计划（优先级、方法、风险）
3. 指出我们可能遗漏的架构问题
4. 建议是否有必要调整引擎代码（如 tag 支持数组）
