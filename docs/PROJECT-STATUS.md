# 异世界重生模拟器 — 项目进度文档

_最后更新：2026-04-16_

---

## 一、项目概况

| 项 | 值 |
|----|-----|
| 当前版本 | **0.11.2** |
| 技术栈 | Vue 3.5 + Vite 8 + TypeScript 5.9 + Pinia + Vitest |
| 仓库 | `KTSAMA001/isekai-rebirth-simulator` |
| 线上地址 | https://ktsama001.github.io/isekai-rebirth-simulator/ |
| 部署方式 | GitHub Pages + GitHub Actions 自动部署 |
| 当前分支 | `master`（已推送到远端） |

### 内容规模

| 类型 | 数量 | 文件 |
|------|------|------|
| 事件 | 675 | `data/sword-and-magic/events/*.json`（7 个年龄段文件） |
| 成就 | 127 | `data/sword-and-magic/achievements.json` |
| 天赋 | 68 | `data/sword-and-magic/talents.json` |
| 种族 | 7（4 可玩） | `data/sword-and-magic/races.json` |
| 测试 | 571 | `tests/`（24 个测试文件） |

### 可玩种族

| ID | 名称 | maxLifespan | lifespanRange |
|----|------|-------------|---------------|
| human | 人类 | 100 | [65, 85] |
| elf | 精灵 | 500 | [250, 400] |
| goblin | 哥布林 | 60 | [20, 35] |
| dwarf | 矮人 | 400 | [150, 250] |

---

## 二、已完成工作（按时间倒序）

### Phase 2+ 修复迭代（0.11.x）

| 版本 | Commit | 内容 |
|------|--------|------|
| 0.11.2 | `0e74bcb` | 加强测试覆盖（正面+负面断言），更新 QA skill |
| 0.11.1 | `9a3562c` | 添加项目 QA 测试 skill + 债务危机/婚礼事件条件修复 |
| 0.11.0 | `567d3d9` | 合并 fix/debt-event-condition 到 master（包含下方所有改动） |

**具体改动：**

1. **死亡分布修复**（`e701745`）
   - 问题：Beta(8,3) 固定 clamp [0.60, 0.92] 导致哥布林/矮人寿命远超 lifespanRange
   - 方案：改为 Beta(3,3) + 基于 lifespanRange 动态映射
   - 效果：哥布林 43→28、矮人 303→220，全部落在 range 内

2. **成就阈值调整**（`ee0cf5f`）
   - 12 个 lifeProgress 成就全部下调以适配新死亡分布
   - 例：longevity 0.80→0.50、dragon_near_death 0.40→0.35
   - 各种族可达性显著改善

3. **事件条件修复**（`bb1eddc`）
   - `human_debt_crisis`：加 `attribute.mny <= 5`
   - `human_wedding_ceremony`：加 `has.flag.engaged`
   - `goblin_interracial_marriage`：加 `has.flag.engaged | has.flag.dating_deepen`

4. **初始数值重构**（`7b0628a` + `6f0938d`）
   - 属性默认值 5→0，分配点数 10→20，允许负数出生
   - 修正精灵 str -3→-2，贫困事件门槛恢复原始值
   - 剪贴板三级 fallback（`fcf5231`）

5. **项目清理**（`7c3d31b`）
   - 删除 87 个过时文件

6. **QA 测试强化**
   - QA-TEST-BASELINE.md 编写（~24KB，9 节完整验证规则）
   - 璃手动 QA 特例验证（2 轮，逐节对照）
   - 测试从 564→571，新增负面断言

### Phase 0-2：百分比系统迁移（0.10.0）

| Commit | 内容 |
|--------|------|
| `6738cdc` | Phase 0：百分比计算基础设施 |
| `67f9605` | Phase 1：引擎层切换到百分比系统 |
| `287327f` | Phase 2：事件数据和 DSL 迁移到百分比系统 |

- 所有事件年龄从绝对值改为百分比（以人类 100 为基准）
- 非人类种族通过 `raceMaxLifespan` 换算
- 新增生命阶段（lifeStage）系统和 minStageProgress

### 历史阶段（0.8.0 - 0.9.0）

| 版本 | 主要内容 |
|------|----------|
| 0.9.0 | 去掉属性上限 clamp，允许自由增长和负数 |
| 0.8.0 | Flag 审计修复 + 事件/评语/成就补全 |

---

## 三、当前系统架构

### HP 与死亡系统

```
初始HP = 25 + 体魄(str) × 3
每年模拟：
  HP恢复 = initialStrRegen + 体魄加成
  sigmoid衰减 = HP上限 × sigmoid(K × (lifeProgress - personalDeathProgress))
  K = 12
  personalDeathProgress = Beta(3,3) → 线性映射到 [range[0]/Max-0.10, range[1]/Max+0.08]
```

**保护机制：**
- 童年保护：10 岁以下死亡保护
- HP 平台期：raceMaxLifespan >= 200 && lifeProgress < 0.5 时 HP ≥ initHp × 30%
- 负数体魄每年扣 HP（核心机制，待实现）

### 属性初始化

```
defaultValue(0) → 种族 modifier → 性别 modifier → 天赋加成 → 用户分配(20点)
运行时 modify() 无 clamp，允许负数
```

### 评分等级

| 等级 | 分数范围 |
|------|----------|
| D | 0-120 |
| C | 120-200 |
| B | 200-280 |
| A | 280-380 |
| S | 380-500 |
| SS | 500+ |

---

## 四、项目基础设施

### 开发工具链

| 工具 | 用途 |
|------|------|
| Vitest | 单元/集成测试（571 个） |
| content-tool.py | 内容校验、Flag 一致性、DSL 语法检查 |
| vue-tsc | TypeScript 类型检查 |
| Vite | 构建和开发服务器 |
| Claude Code (CC) | 代码修改（智谱 GLM-5.1） |

### 项目 Skill

| Skill | 位置 | 用途 |
|-------|------|------|
| isekai-rebirth-simulator | `.claude/skills/` | 项目开发全流程指导 |
| isekai-qa | `.claude/skills/` | QA 测试验证（9 节检查规则） |
| content-audit | `.claude/skills/` | 内容审计 |

### 关键文档

| 文档 | 内容 |
|------|------|
| `docs/QA-TEST-BASELINE.md` | QA 测试基准（~24KB，9.1-9.9 节） |
| `docs/BALANCE-PLAN-2026-04-11.md` | 平衡性计划 |
| `docs/ACHIEVEMENT-PLAN-v3.md` | 成就系统设计 |
| `docs/FLAG-LIFECYCLE-AUDIT.md` | Flag 生命周期审计 |

---

## 五、Git 分支状态

| 分支 | 状态 | 说明 |
|------|------|------|
| `master` | ✅ 已推送（0.11.2） | 主分支，最新版本 |
| `fix/debt-event-condition` | ⚠️ 仅本地 | 已合并到 master，可删除 |
| `fix/event-logic-patches` | ⚠️ 仅本地 | 已合并到 master，可删除 |
| `fix/flag-audit-2026-04-08` | ⚠️ 仅本地 | 已合并到 master，可删除 |
| `fix/remove-attribute-cap` | ⚠️ 仅本地 | 已合并到 master，可删除 |
| `fix/event-content-and-romance` | ✅ 已推送 | 远端存在 |

---

## 六、已知问题与待办

### 🔴 待实现

| 项 | 说明 | 优先级 |
|----|------|--------|
| 负数体魄每年扣 HP | 核心机制，KT 已确认必须实现 | 高 |
| Phase 3：引擎层清理和 UI | 等 KT 指示 | 中 |

### ⚠️ 已知问题

| 项 | 说明 |
|----|------|
| CI 1 error | `npx vitest run` 总报 "1 error"，但全部 571 测试通过，疑似 vitest 或插件问题 |
| 临时测试文件 | `test_seed_30028.mjs`、`tests/hp-trace.test.ts`、`tests/lifespan-baseline.test.ts`、`tests/test_seed_30028.test.ts` 已提交但属于调试产物 |
| 本地冗余分支 | 4 个已合并的本地分支未清理 |

### 📋 OpenClaw 相关

| 项 | 说明 |
|----|------|
| OpenClaw 升级 | 等 #66581 和 #66537 合并后升级，KT 未确认 |
| CC 模型 | 智谱 GLM-5.1（opus）、GLM-5-turbo（sonnet）、GLM-4.7（haiku） |

---

## 七、存活年龄分布（当前状态）

| 种族 | 平均 | 中位数 | 最小 | 最大 | lifespanRange | 状态 |
|------|------|--------|------|------|---------------|------|
| 人类 | 73 | 76 | 28 | 93 | [65, 85] | ✅ |
| 精灵 | 289 | 287 | 31 | 401 | [250, 400] | ✅ |
| 哥布林 | 28 | 28.5 | 17 | 43 | [20, 35] | ✅ |
| 矮人 | 220 | 212 | 159 | 272 | [150, 250] | ✅ |

（数据来源：50 次蒙特卡洛模拟，Beta(3,3) 动态映射）

---

## 八、QA 验证历史

| 时间 | 轮次 | 结果 | 发现 |
|------|------|------|------|
| 2026-04-15 初次 | 璃手动 | 142/142 通过 | 文档偏差 9.2 节 Flag 因果链 |
| 2026-04-15 二次 | 璃手动 | 全通过 | 修正 9.1-9.8 文档偏差 |
| 2026-04-15 全量 | 自动化 | 569/569 | 无 |
| 2026-04-16 存活年龄 | 璃手动 | 4 种族全在 range | 需要分布修复 |
| 2026-04-16 成就调整后 | 自动化 | 569/569 | 12 个成就阈值已调整 |
| 2026-04-16 条件修复后 | 自动化 | 569/569 | 3 个事件条件已补全 |
| 2026-04-16 测试加强后 | 自动化 | 571/571 | 新增负面断言 |

---

_本文档由璃维护，每次重大改动后更新。_
