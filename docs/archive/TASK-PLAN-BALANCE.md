# 异世界重生模拟器 — 数值平衡修复任务计划

> 基于 10 局测试分析，2026-03-30
> 项目路径：`/Users/ktsama/Projects/isekai-rebirth-simulator/`

---

## 总览

| # | 优先级 | 任务 | 类型 | 范围 | 依赖 |
|---|--------|------|------|------|------|
| T1 | P0 | 修复 elder 事件死区(71-80岁无事件) | 数据 | elder.json | 无 |
| T2 | P0 | 添加死亡叙事事件(HP=0时触发故事) | 引擎+数据 | SimulationEngine.ts + events | 无 |
| T3 | P0 | 修复灵性事件100%触发率 | 数据 | adult.json | 无 |
| T4 | P1 | 修复恋爱链断裂(加dating/engagement中间事件) | 数据 | youth.json/adult.json | 无 |
| T5 | P1 | 降低 filler 事件触发率 | 数据 | 多个 event json | 无 |
| T6 | P1 | 路线事件分化 | 数据+引擎 | events + 可能改引擎 | T1-T5 |

---

## T1: 修复 Elder 事件死区

### 问题
- elder.json 所有事件 maxAge ≤ 80
- peaceful_end 在 71 岁触发后，到 80 岁无任何事件
- manifest maxAge=100，但 80-100 岁完全空白

### 方案
1. 将现有 elder 事件的 maxAge 扩展到 90（大部分）或 95（少数）
2. 新增 5-8 个高龄专属事件（80-100岁）：
   - `elder_reunion` (80-90): 老友重逢
   - `elder_legend_verified` (80-95): 传说中的事迹被验证
   - `elder_apprentice_return` (80-90): 学徒学成归来
   - `elder_world_peace` (85-95): 见证世界和平
   - `elder_final_adventure_light` (80-88): 最后的轻松冒险
   - `elder_wisdom_seekers` (80-95): 年轻人来请教
   - `centenarian_celebration` (95-100): 百岁庆典
   - `elder_natural_death` (85-100): 安详离世（高权重，作为老死叙事）

### 验证
- 跑 10 局，确认活到 80+ 的角色在 71 岁后仍有事件
- 确认 80-100 岁区间事件分布合理

---

## T2: 添加死亡叙事事件

### 问题
- HP 归零时角色静默死亡，无任何叙事
- R5 在 21 岁听神谕后直接死亡
- R7 走进深渊后直接死亡

### 方案
1. **引擎层**（SimulationEngine.ts）：
   - 在 `startYear()` 检测 HP ≤ 0 时，不直接标记死亡
   - 设置 `state.phase = 'dying'`，进入"临终叙事"阶段
   - 在临终阶段，从死亡事件池中选一个事件展示
   - 死亡事件展示完成后才真正标记 `phase = 'ended'`

2. **数据层**：创建 `death-events.json` 或在 elder.json 末尾添加：
   - `death_battle_final`: 战死沙场（有战斗历史的角色）
   - `death_illness`: 病逝（HP 长期低位的角色）
   - `death_old_age`: 寿终正寝（高年龄角色）
   - `death_adventure`: 冒险中陨落（冒险者路线）
   - `death_curse`: 诅咒致死（有诅咒 flag 的角色）
   - `death_unknown`: 离奇失踪（默认后备）
   - `death_peaceful_home`: 在家中安详离世

### 验证
- 跑 10 局，确认每个死亡角色都有死亡叙事
- 确认死亡原因与角色历史匹配（战斗多的角色不会"安详病逝"）

---

## T3: 修复灵性事件泛滥

### 问题
- `spr_divine_sign` 100% 触发（weight=1 但无竞争事件）
- `spr_meditation_retreat` 90%
- `spr_near_death` 80%
- 不是灵性路线的角色也在经历神谕

### 方案
1. `spr_divine_sign`:
   - 加严格 include: `attribute.spr >= 12`（原来 6 太低）
   - 或改为 unique + 分拆为多个低权重变体
   - weight 降为 2（但关键是条件限制）

2. `spr_meditation_retreat`:
   - include 加 `attribute.spr >= 10`
   - weight 4→2

3. `spr_near_death`:
   - weight 已从 8→1（之前降过），但 80% 触发说明还是太高
   - 加 exclude: `has.flag.cheated_death | has.flag.death_accepted`（已经濒死过的不会再）
   - 或改为 unique: true（已设了？确认一下）

4. 新增非灵性替代事件（spr < 10 的角色遇到的事）：
   - `common_festival`: 普通节日庆典
   - `local_hero_deed`: 帮邻居解决小问题
   - `veteran_story`: 老兵在酒馆讲故事

### 验证
- 跑 10 局，确认 spr_divine_sign 触发率降到 30-50%
- 确认非灵性角色有替代事件

---

## T4: 修复恋爱链断裂

### 问题
- 恋爱链：first_love → heartbreak/love_at_first_sight → 然后就没了
- 10 局中只有 2 局结了婚
- love_at_first_sight 后无承接事件

### 方案
1. 新增中间事件：
   - `dating_start` (16-25): 开始交往（prerequisite: has first_love flag）
   - `dating_deepen` (18-28): 感情加深（prerequisite: dating）
   - `marriage_proposal` (20-35): 求婚（prerequisite: dating_deepen）
   - `wedding_ceremony` (20-35): 婚礼（承接 marriage_proposal）

2. 拆散现有悲剧链：
   - `rescue_from_dungeon` 不再在婚后立刻触发
   - 加 exclude: 婚后 5 年内不触发
   - 新增正面婚后事件：`marriage_anniversary`, `child_birth`, `family_dinner`

3. 已有事件条件修正：
   - `marry_adventurer` 改为需要 `dating_deepen` 或 `engaged` flag

### 验证
- 跑 10 局，确认有恋爱 flag 的角色 60%+ 进入婚姻
- 确认婚后不立刻触发悲剧

---

## T5: 降低 Filler 事件触发率

### 问题
- 19 个事件触发率 ≥70%，填充感强
- meteor_shower 80%（天文奇观）
- lost_in_dungeon 80%（迷路太频繁）
- teaching_others 80%（不是人人都是老师）
- scenic_travel 20%（这个还行）

### 方案
1. 高频事件 weight 调整：
   | 事件 | 当前 | 建议 |
   |------|------|------|
   | meteor_shower | ? | unique: true |
   | lost_in_dungeon | ? | weight 降 50% |
   | teaching_others | ? | 加 include: int >= 15 |
   | tavern_brawl | 70%→20% | 加条件 |
   | scenic_travel | 20% | 保持 |

2. 事件 variety 增加：为 70%+ 的事件各添加 2-3 个同类型替代变体

### 验证
- 跑 10 局，确认没有任何事件触发率 > 60%（除 birth 外）
- 确认每局事件链有足够差异

---

## T6: 路线事件分化

### 问题
- 骑士、法师、商人、冒险者、平民走了同一套事件
- 没有路线特有事件

### 方案
1. 为 5 条路线各新增 3-5 个专属事件
2. 通用事件加 exclude 条件（如法师专属事件 exclude 非 mage 路线）
3. 引擎可能需要改动：事件选择时考虑 route

### 依赖
等 T1-T5 完成后再做，因为会大幅修改事件池

---

_任务计划完成，开始执行_
