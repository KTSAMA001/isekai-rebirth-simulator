# 生命阶段事件系统改造 — 实施计划 v3

## 一、设计理念

**三个核心认知：**
1. 阶段 = 种族生物发育节律（绝对年龄），和寿命无关
2. 20岁死的哥布林 = 壮年早逝，不是"提前老了"
3. 事件的年龄触发范围比阶段划分更细（如"只在 elder 后 30% 触发"）

**事件有三种定位方式：**

| 类型 | 定位方式 | 示例 |
|------|---------|------|
| 种族专属 | races + 绝对年龄 | goblin_tribe_legacy [28,40] |
| 阶段通用 | lifeStage（整个阶段都可触发） | elder_memoir |
| 阶段内精确 | lifeStage + stageProgress | elder_natural_death（只在后 30%） |

---

## 二、数据模型

### 2.1 races.json — 新增 lifeStages

四个可玩种族的 lifeStages（绝对年龄，生物发育节律）：

| 阶段 | 人类(100) | 精灵(500) | 哥布林(60) | 矮人(400) |
|------|-----------|-----------|------------|-----------|
| childhood | 2-10 | 2-50 | 1-6 | 2-30 |
| teen | 11-17 | 30-80 | 5-12 | 20-50 |
| youth | 14-22 | 50-120 | 8-18 | 30-80 |
| adult | 20-45 | 80-250 | 15-35 | 60-200 |
| midlife | 35-60 | 200-380 | 25-50 | 180-320 |
| elder | 55-100 | 350-500 | 35-60 | 280-400 |

阶段之间允许重叠（如 youth/adult 在 20-22 重叠），事件可在重叠区间由多个阶段触发。

### 2.2 types.ts — 类型变更

```typescript
// WorldRaceDef 新增
lifeStages?: Record<string, [number, number]>

// WorldEventDef 新增
lifeStage?: string               // 单阶段标签
lifeStages?: string[]            // 多阶段（跨阶段事件）
minStageProgress?: number        // 阶段内起始进度 0-1，默认 0
maxStageProgress?: number        // 阶段内结束进度 0-1，默认 1
```

### 2.3 事件 JSON — 三种处理方式

**不动的事件：**
- birth.json 全部（63个，都是 [1,1]）
- 有 races 字段的种族专属事件（327个），保留 minAge/maxAge

**通用事件迁移（278个）：**

迁移规则：文件名决定 lifeStage，原 minAge/maxAge 转换为 stageProgress。

转换公式（基于人类阶段边界）：
```
stageRange = humanLifeStages[lifeStage]
stageSpan = stageRange[1] - stageRange[0]
minStageProgress = (event.minAge - stageRange[0]) / stageSpan  （clamp 0-1）
maxStageProgress = (event.maxAge - stageRange[0]) / stageSpan  （clamp 0-1）
```

转换示例：

| 事件 | 原范围 | lifeStage | 阶段边界 | 转换后 stageProgress |
|------|--------|-----------|---------|---------------------|
| elder_memoir | [55,90] | elder | [55,100] | 0-0.78 |
| elder_natural_death | [85,100] | elder | [55,100] | 0.67-1.0 |
| retirement | [60,70] | midlife | [35,60] | 1.0→clamp→0.8-1.0 |
| midlife_crisis | [40,50] | adult | [20,45] | 0.8→clamp→0.8-1.0 |

**跨阶段事件处理（~40个）：**

原 minAge/maxAge 超出所属阶段范围的（如 dark_mage_tempt [20,30] 跨 teen+adult），使用 lifeStages 数组 + 绝对年龄：

```json
{
  "id": "dark_mage_tempt",
  "lifeStages": ["teen", "adult"],
  "minAge": 20,
  "maxAge": 30
}
```

---

## 三、引擎逻辑

### 3.1 EventModule — 新 getEventAgeRange 方法

替换 `getScaledAgeRange`：

```typescript
private getEventAgeRange(event: WorldEventDef, race?: WorldRaceDef): [number, number] | null {
  // 1. 种族专属事件：直接用绝对年龄
  if (event.races?.length) {
    return [event.minAge, event.maxAge]
  }
  // 2. birth 事件
  if (event.maxAge <= 1) {
    return [event.minAge, event.maxAge]
  }
  // 3. 跨阶段事件（lifeStages 数组 + minAge/maxAge）
  if (event.lifeStages?.length && event.minAge !== undefined) {
    return [event.minAge, event.maxAge]
  }
  // 4. 单阶段事件：用种族阶段边界 + stageProgress
  if (event.lifeStage && race?.lifeStages?.[event.lifeStage]) {
    const [sMin, sMax] = race.lifeStages[event.lifeStage]!
    const stageSpan = sMax - sMin
    const minP = event.minStageProgress ?? 0
    const maxP = event.maxStageProgress ?? 1
    return [
      Math.round(sMin + minP * stageSpan),
      Math.round(sMin + maxP * stageSpan)
    ]
  }
  // 5. 兜底
  if (event.minAge !== undefined) {
    return [event.minAge, event.maxAge]
  }
  return null
}
```

### 3.2 getCandidates 过滤

```typescript
const ageRange = this.getEventAgeRange(event, playerRaceDef)
if (ageRange && (age < ageRange[0] || age > ageRange[1])) return false

// 跨阶段事件额外检查：是否在任一匹配的阶段边界内
if (event.lifeStages?.length && event.minAge === undefined) {
  const inAny = event.lifeStages.some(stage =>
    race?.lifeStages?.[stage] && age >= race.lifeStages[stage]![0] && age <= race.lifeStages[stage]![1]
  )
  if (!inAny) return false
}
```

### 3.3 删除旧代码

- `getScaledAgeRange()` 方法及其全部逻辑
- psychologyCap（tag=social/life/romance cap 到 50%）
- 短寿命保护（raceMaxLifespan < 100 时的 scaledMin 保护）

---

## 四、迁移脚本

`scripts/migrate-life-stages.ts`：

```
输入：data/sword-and-magic/events/*.json
处理：
  1. 读取所有事件
  2. 跳过 birth.json 和有 races 字段的事件
  3. 按文件名映射 lifeStage
  4. 以人类阶段边界为基准计算 stageProgress
  5. 如果 minSP < 0 或 maxSP > 1：标记为跨阶段事件
     - 保留 minAge/maxAge
     - lifeStage 改为 lifeStages 数组（包含覆盖的阶段）
  6. 非跨阶段事件：
     - 加 lifeStage + minStageProgress + maxStageProgress
     - 删除 minAge/maxAge
输出：修改后的 JSON + 变更摘要
```

---

## 五、分步实施

| Step | 内容 | 文件 | 风险 |
|------|------|------|------|
| 1 | types.ts 加类型定义 | types.ts | 无 |
| 2 | races.json 加 lifeStages | races.json | 低 |
| 3 | 写迁移脚本 | scripts/migrate-life-stages.ts | 无 |
| 4 | 执行迁移脚本 | events/*.json | 低 |
| 5 | EventModule 新过滤逻辑 | EventModule.ts | 中 |
| 6 | 删除旧代码 | EventModule.ts | 中 |
| 7 | data-loader 校验 | data-loader.ts | 低 |
| 8 | QA 回归测试 | tests/ | 验证 |

每步独立 commit。

---

## 六、验证标准

### 6.1 基础验证（所有种族）

- ✅ 寿命分布不变（Phase 1 回归）
- ✅ 事件按 age 严格递增，不回退
- ✅ 同一年内事件不超过 3 个
- ✅ 种族专属事件不受影响
- ✅ P1 违规（84项）→ 0
- ✅ P2 违规（2266项）→ 大幅下降

### 6.2 人类（寿命 60-80）

- ✅ 0-10：出生+童年事件，无成人/老年事件
- ✅ 11-22：少年+青年事件，不再出现童年事件
- ✅ 20-50：壮年事件（结婚、冒险、事业），事件密度最高
- ✅ 35-60：中年事件（衰退、传承、危机）
- ✅ 55+：老年事件，之前不应有老年事件
- ✅ 不出现"学走路"后紧跟"最后的旅途"

### 6.3 精灵（寿命 250-400）

- ✅ 0-50：出生+童年事件（漫长的幼年期）
- ✅ 30-80：少年事件开始出现
- ✅ 50-120：青年事件
- ✅ 80-250：漫长的壮年（事件最密集）
- ✅ 200-380：中年事件
- ✅ 350+：老年事件
- ✅ 100 岁之前不触发成人/中年事件
- ✅ 精灵专属事件（elf_*）在正确年龄段触发
- ✅ 252 岁不应触发"小伤"等通用随机事件（如果超出定义范围）

### 6.4 哥布林（寿命 25-45）

- ✅ 0-6：出生+童年事件
- ✅ 5-12：少年事件
- ✅ 8-18：青年事件
- ✅ 15-35：壮年事件（紧凑的生命节奏）
- ✅ 25-50：中年事件
- ✅ 35+：老年事件（大部分哥布林活不到，这是正常的——早死≠提前老了）
- ✅ 20 岁前不触发中年/老年事件
- ✅ 哥布林专属事件在正确年龄段触发

### 6.5 矮人（寿命 180-320）

- ✅ 0-30：出生+童年事件
- ✅ 20-50：少年事件
- ✅ 30-80：青年事件
- ✅ 60-200：漫长的壮年
- ✅ 180-320：中年事件
- ✅ 280+：老年事件
- ✅ 50 岁前不触发壮年/中年事件

### 6.6 通用合理性（所有种族）

- ✅ 幼年期（<10% 寿命）只有童年事件
- ✅ 死亡前 10% 寿命内有死亡相关事件
- ✅ 事件文本描述与实际年龄不矛盾（如"学走路"不在壮年触发）
- ✅ 事件密度：壮年 > 青年/中年 > 童年/少年/老年
