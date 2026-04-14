# CC 任务：项目清理 + 更新 Skill

## 任务 1：项目文件清理

项目路径：/Users/ktsama/Projects/isekai-rebirth-simulator

### 需要删除的 tests/ 文件（24 个一次性/过时测试）
```
tests/balance-verify-f4b8a22.test.ts
tests/engine/event-condition-fix-verify.test.ts
tests/engine/event-condition-fix.test.ts
tests/engine/flag-lifecycle-tracker.test.ts
tests/phase1-full-validation.test.ts
tests/playtest-pre-expansion.mts
tests/playtest-round5.test.ts
tests/playtest-round6.test.ts
tests/playtest-round7.test.ts
tests/playthrough-core2.ts
tests/qa-final-full.test.ts
tests/qa-full-playtest.test.ts
tests/qa-full-race-verify-1dc1592.test.ts
tests/qa-full-race-verify-4bcb53e.test.ts
tests/qa-human-age-event-verify.test.ts
tests/qa-phase1.test.ts
tests/qa-phase2-chronology.test.ts
tests/qa-race-verify-b314a57.test.ts
tests/qa-round3-dd-lifespan.test.ts
tests/hp-aging-sim.mts
```

### 需要删除的 tests/output/ 内容（测试生成的报告，不应提交）
```
tests/output/event-condition-fix-report.md
tests/output/flag-lifecycle-report.json
tests/output/migration-report.md
```

### 需要删除的根目录脚本
```
test-races.mts
```

### 需要删除的 scripts/ 一次性文件（~30 个）

#### 旧 patch 脚本（数据迁移补丁，已执行完毕）
```
scripts/patch-b1-final.py
scripts/patch-b1-overpowered.py
scripts/patch-b1-remaining.py
scripts/patch-b2-remaining.py
scripts/patch-b2-waste.py
scripts/patch-b3-split.py
scripts/patch-b4-mandatory.py
scripts/patch-c4-race-talents.py
scripts/patch-c5-race-variants.py
scripts/patch-c6-gender-variants.py
scripts/patch-c7-race-events.py
scripts/patch-c8-balance-fix.py
scripts/patch-c8-final-fix.py
scripts/patch-d1-flags.py
scripts/patch-d2-entry-events.py
scripts/patch-mandatory-events.mjs
scripts/patch-goblin-events.py
```

#### 旧 enrich 脚本（事件内容扩展，已执行）
```
scripts/enrich-events.py
scripts/enrich-events-v2.py
scripts/enrich-events-v3.py
scripts/enrich-events-v4.py
```

#### 旧 test 脚本（手动测试，不参与 vitest）
```
scripts/test-batch1.ts
scripts/test-comprehensive-50.ts
scripts/test-early-game.ts
scripts/test-final-validation.ts
scripts/test-hp-aging-round6.ts
scripts/test-hp-aging-round7.ts
scripts/test-score-distribution.ts
scripts/test-simulation.ts
scripts/test-talent-conflict.ts
```

#### 旧诊断/分析/验证脚本
```
scripts/analyze-balance.py
scripts/analyze-entry-events.py
scripts/analyze-events.py
scripts/analyze-flow.ts
scripts/check-b4.py
scripts/check-meta.py
scripts/diagnose-death.ts
scripts/diagnose-debt.ts
scripts/diagnose-flags.py
scripts/diagnose-flags-detail.py
scripts/diagnose-flags-v2.py
scripts/diagnose-flags-v3.py
scripts/detailed-flow.ts
scripts/find-waste.py
scripts/fix-attribute-to-target.py
scripts/fix-include-format.py
scripts/fix-missing-target.py
scripts/fix-waste-event.py
scripts/verify-elf-decay-fix.ts
scripts/verify-flags.py
```

#### 旧 playtest/QA 脚本
```
scripts/playtest-round3.ts
scripts/playtest-round4.ts
scripts/qa-balance-test.ts
scripts/qa-chronicle-test.mts
scripts/qa-full-race-test.mts
scripts/quick-stats-hp.ts
scripts/quick-stats.ts
```

#### 其他一次性脚本
```
scripts/balance-v2.ts
scripts/batch-sim.mts
scripts/batch-simulate.mjs
scripts/gen-events.ts
scripts/migrate-risk-to-dice.mjs
scripts/add-new-dicechecks.py
```

### 需要保留的 scripts/ 文件
```
scripts/content-tool.py          # 核心内容管理工具
scripts/migrate-life-stages.ts   # Phase 2 迁移脚本
scripts/validate-schema.mjs      # Schema 校验
scripts/stats.py                 # 数据统计
scripts/report-balance.py        # 平衡报告
```

### 清理步骤
1. 先用 `git rm` 删除上述所有文件（保持 git 历史干净）
2. 运行 `npx vitest run` 确认剩余测试全部通过
3. Git commit：`chore: 清理过时的测试脚本和一次性工具脚本`

---

## 任务 2：更新项目 Skill

清理完成后，更新 `.claude/skills/isekai-rebirth-simulator/SKILL.md`。

参考文件：
- `docs/QA-TEST-BASELINE.md` — 准确的项目数据和百分比系统规则
- `src/engine/modules/EventModule.ts` 和 `src/engine/core/SimulationEngine.ts` — 最新代码

### 需要更新的内容

#### A. 种族寿命数据（"当前种族与属性" 表格）
- 人类：80-90 → 65-85（lifespanRange），maxLifespan=100
- 精灵：380-420 → 250-400，maxLifespan=500
- 哥布林：30-36 → 20-35，maxLifespan=60
- 矮人：160-180 → 150-250，maxLifespan=400

#### B. 年龄缩放规则
旧规则已过时。新规则是 4 条路径（详见 QA-TEST-BASELINE.md 第 3 节）

#### C. ConditionDSL 标识符表
新增 `lifeProgress`（age / effectiveMaxAge）

#### D. EventEffect 类型
trigger_on_age 新增 `lifeProgress` 字段

#### E. 新增关键常量说明
- Beta(8,3) 死亡分布，clamp [0.60, 0.92]
- CHILDHOOD_DEATH_PROTECTION_AGE = 10
- HP 平台期保护：raceMaxLifespan >= 200 && lifeProgress < 0.5
- PSYCHOLOGY_CAPPED_TAGS = [life, romance, social]，cap = 0.50
- HUMAN_BASE_LIFESPAN = 100

#### F. 事件文件年龄段表
说明 minAge 是人类参考年龄，非人类种族经过百分比换算

#### G. scripts/ 部分
更新脚本清单（只保留 5 个有用的脚本）

Git commit：`docs: 更新项目 skill 同步百分比系统重构`

---

## 验证
每个任务完成后都运行 `npx vitest run` 确认测试通过。

## 通知
全部完成后运行：`openclaw system event --text "Done: 项目清理 + skill 更新完成" --mode now`
