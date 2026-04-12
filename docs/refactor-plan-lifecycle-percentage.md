# 重构计划：事件年龄百分比分区

> 创建时间：2026-04-13
> 状态：待 KT 审批
> 分支：fix/debt-event-condition（当前 commit b314a57）

---

## 1. 问题背景

当前事件系统用绝对年龄（minAge/maxAge，基于人类），通过 `getScaledAgeRange()` 按 lifespanRatio 缩放适配其他种族。存在以下问题：

1. **四层参数互相影响**：effectiveMaxAge / medianDeathAge / lifespanRange / maxLifespan
2. **缩放逻辑复杂**：cap=2.0、短寿命保护、心理年龄限制等多重规则
3. **年龄与事件不匹配**：精灵 110 岁触发老年事件、人类 33 岁触发衰老加剧
4. **DSL 条件语法混淆**：逗号 vs & vs | 的 AND/OR 问题

## 2. 重构目标

- 每个种族一个 `maxLifespan`（固定值）
- 事件触发基于 `lifeProgress = age / maxLifespan`（0.0-1.0）
- 事件 minAge/maxAge 视为人类百分比（55岁 = 55%），引擎内部换算
- 移除 lifespanRange / medianDeathAge / effectiveMaxAge 等中间层
- 个体死亡偏差：`personalDeathProgress`（Beta 分布，0.65-0.90）

### 种族数据

| 种族 | maxLifespan | 说明 |
|------|-------------|------|
| 人类 | 100 | KT 确认 |
| 精灵 | 500 | KT 确认 |
| 哥布林 | 60 | 保持 |
| 矮人 | 400 | 保持 |

## 3. 执行阶段

---

### Phase 0: 基础设施（不改行为）

**目标**：添加百分比计算能力，所有现有行为不变。

**改动文件**：
- `src/engine/core/types.ts`：Race 类型添加 `maxLifespan` 必填字段（已有）
- `src/engine/core/SimulationEngine.ts`：
  - 添加 `getLifeProgress(): number` 方法（`return this.state.age / this.raceMaxLifespan`）
  - 添加 `raceMaxLifespan` 实例变量（从 races.json 读取）
  - 添加 `personalDeathProgress` 实例变量（Beta 分布生成）
  - 添加 Beta 分布随机生成器辅助函数

**不替换的调用点**：
- effectiveMaxAge 继续存在
- getScaledAgeRange 继续存在
- HP 衰减继续用 medianDeathAge

**验证标准**：
- 现有测试全部通过
- test-batch1.ts 结果不变
- getLifeProgress() 对人类返回 age/100，对精灵返回 age/500

**回滚方案**：直接 git revert

---

### Phase 1: 引擎层切换

**目标**：引擎内部改用百分比，事件数据不变。

**改动文件**：

#### 1a. SimulationEngine.ts
- `initGame()`：移除 effectiveMaxAge 计算，改用 `raceMaxLifespan`
- `regenHp()`：HP 衰减 sigmoid 基于 `lifeProgress`，中点为 `personalDeathProgress`
  - sigmoid 公式：`1 / (1 + exp(-K * (lifeProgress - personalDeathProgress)))`
  - K 值待确定（建议 12-15，比当前的 10 更陡，让衰减更集中在 personalDeathProgress 附近）
- `getAgingHint()`：基于 `lifeProgress` 而非 medianDeathAge
  - 0.38: "怀念年轻时的充沛精力"
  - 0.45: "恢复得不如从前快了"
  - 0.55: "鬓角多了几根白发"
  - 0.62: "爬楼梯微微气喘"
  - 0.70: "力不从心"
  - 0.78: "身体越来越不听使唤"
  - 0.85: "岁月不饶人"
  - 0.92: "油尽灯枯"
- 移除 `medianDeathAge` 计算
- `effectiveMaxAge` 保留为 `raceMaxLifespan` 的别名（兼容性）

#### 1b. EventModule.ts
- `getScaledAgeRange()` 简化：
  ```
  // 事件 minAge/maxAge 视为人类百分比
  const minProgress = event.minAge / 100
  const maxProgress = event.maxAge / 100
  // 转换为当前种族的实际年龄
  scaledMin = Math.round(minProgress * raceMaxLifespan)
  scaledMax = Math.round(maxProgress * raceMaxLifespan)
  ```
- 移除 `HUMAN_BASELINE_LIFESPAN`
- 种族专属事件（races 只含一个种族）：不缩放，保持绝对年龄
- 心理年龄 cap 逻辑：life/romance/social 事件，maxProgress 不超过 0.50（即人类 50 岁）
- 短寿命保护：缩放后 minAge 不低于原 minAge × 0.5

#### 1c. EvaluatorModule.ts
- 寿命评分：`lifespanRatio = lifespan / raceMaxLifespan`

**验证标准**：
- test-batch1.ts 结果不变（或变化可接受，需 KT 确认）
- 人类：大部分 65-85 岁死亡，少数早亡/长寿
- 精灵：大部分 250-400 岁死亡，elder 事件在 275+ 岁触发
- 哥布林：大部分 20-35 岁死亡
- 矮人：大部分 150-250 岁死亡
- 不出现年轻人触发老年事件的问题

**回滚方案**：git revert

---

### Phase 2: 事件数据和 DSL 迁移

**目标**：清理事件数据和 DSL 中的绝对年龄引用。

**改动文件**：

#### 2a. 事件数据审查
- 扫描所有 `data/sword-and-magic/events/*.json`
- 检查 minAge/maxAge 是否对人类合理（作为百分比基准）
- 特别关注：minAge > 100 的事件（精灵专属如 elf_last_song minAge=300）
- 种族专属事件保持绝对年龄不变

#### 2b. DSL 条件全局替换
- 扫描所有事件中的 `include`/`exclude`/`prerequisites`/`branches[].requireCondition`
- 包含 `age` 条件的 DSL 表达式需要改为百分比语义
- 例如：`age >= 55` → 需要基于 lifeProgress 判断（或引擎内部处理）

#### 2c. 路线系统/天赋/成就的年龄关联
- 检查路线系统中的年龄条件
- 检查天赋的 ageTriggered 机制
- 检查成就的年龄相关条件
- 统一改为百分比判断

**验证标准**：
- QA 全流程测试（种族×性别×天赋×路线×成就）
- 事件链条连贯、年龄合理
- 无逻辑矛盾（有孩子才触发家庭晚餐等）

**回滚方案**：git revert

---

### Phase 3: 清理和 UI

**目标**：移除废弃代码，更新 UI。

**改动文件**：

#### 3a. 数据清理
- `races.json`：移除 `lifespanRange` 字段
- `types.ts`：Race 类型移除 `lifespanRange`

#### 3b. 代码清理
- 移除 `effectiveMaxAge` / `medianDeathAge` 的所有残留引用
- 移除 `lifespanRange` 相关代码

#### 3c. UI 更新
- `SetupView.vue`：显示 maxLifespan 为"寿命上限"
- `ResultView.vue`：调整寿命显示
- 导出功能更新

#### 3d. 存档迁移
- 旧存档的 effectiveMaxAge → 读取 raceMaxLifespan
- 兼容旧版本存档

**验证标准**：
- 全部测试通过
- UI 显示正确
- 旧存档可以加载

---

## 4. 风险和缓解

| 风险 | 缓解措施 |
|------|----------|
| test-batch1.ts 不可修改 | Phase 0-1 保持行为一致；如 Phase 1 导致变化，需 KT 确认 |
| 存档兼容性 | 保留 effectiveMaxAge 字段做兼容读取 |
| 长寿种族事件密度低 | Phase 2 评估是否需要事件密度补偿 |
| 精灵童年 25 年叙事不合理 | Phase 2 逐事件审查，必要时创建种族专属变体 |
| DSL age 条件遗漏 | Phase 2 全局扫描 + QA 验证 |

## 5. 个体死亡进度（personalDeathProgress）

- **分布**：Beta(8, 3) 偏态分布（中位约 0.70）
- **范围**：clamp 到 [0.60, 0.92]
- **含义**：sigmoid 中点，衰减最剧烈的 lifeProgress 值
- **效果**：
  - 0.60 的人：60% 人生进度开始急剧衰减（人类约 60 岁开始走下坡路）
  - 0.85 的人：85% 才开始（人类约 85 岁）
  - 大部分人集中在 0.68-0.75（人类 68-75 岁）

## 6. 生命阶段定义（参考）

| 阶段 | lifeProgress | 人类年龄 | 精灵年龄 | 哥布林年龄 | 矮人年龄 |
|------|-------------|---------|---------|----------|---------|
| 婴儿 | 0-0.03 | 0-3 | 0-15 | 0-2 | 0-12 |
| 童年 | 0.03-0.12 | 3-12 | 15-60 | 2-7 | 12-48 |
| 少年 | 0.12-0.20 | 12-20 | 60-100 | 7-12 | 48-80 |
| 青年 | 0.20-0.35 | 20-35 | 100-175 | 12-21 | 80-140 |
| 壮年 | 0.35-0.55 | 35-55 | 175-275 | 21-33 | 140-220 |
| 中年 | 0.55-0.70 | 55-70 | 275-350 | 33-42 | 220-280 |
| 老年 | 0.70-0.85 | 70-85 | 350-425 | 42-51 | 280-340 |
| 暮年 | 0.85-1.00 | 85-100 | 425-500 | 51-60 | 340-400 |

---

## 7. QA 验证清单（每个 Phase）

- [ ] 4 个可玩种族各 10 局完整模拟
- [ ] 寿命分布合理（不 100% 集中在某个区间）
- [ ] 衰老事件不在壮年触发
- [ ] family_dinner 只在有孩子后触发
- [ ] 事件描述与触发年龄匹配
- [ ] 天赋选择和效果正常
- [ ] 属性分配和增长正常
- [ ] 路线系统正常
- [ ] 成就系统正常
- [ ] 性别变体正常
- [ ] 导出功能正常
- [ ] 存档加载正常（Phase 3）
