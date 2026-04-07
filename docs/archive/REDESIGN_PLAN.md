# 异世界重生模拟器 - UI重设计 & Galgame化改造计划

> 日期：2026-03-29
> 状态：待审核

---

## 一、调研总结

### 1.1 开源参考项目

| 项目 | Stars | 技术栈 | 核心参考点 |
|------|-------|--------|-----------|
| **WebGAL** | ⭐3733 | React + TypeScript | 最活跃的 web VN 引擎，完整的编辑器+渲染器，支持立绘/CG/BGM/转场/分支。**UI 布局和文字显示效果是最佳参考**。 |
| **Monogatari** | ⭐832 | TypeScript + Web Components | 轻量级 VN 引擎，支持存档/读档/分支选择/多语言。**存档系统和脚本解析器值得参考**。 |
| **Ink (inkle)** | ⭐4691 | C# (JS runtime 可用) | 专业叙事脚本语言，支持复杂分支编织（knots/stitches/diverts）。**分支叙事逻辑的最佳实践**。 |
| **Novely** | ⭐32 | TypeScript | 轻量交互式故事引擎。**简单清晰的状态管理可参考**。 |

### 1.2 Galgame 核心设计模式

**分支选择机制**：
- 每个关键节点提供 2-4 个选项，每个选项影响后续可用事件池
- 选项可以有条件限制（如属性达标才显示），隐藏选项增加探索感
- 选择结果分即时效果（属性变化）和延迟效果（解锁/锁定后续事件）

**多结局设计**：
- 基于 `flag` 组合触发不同结局
- 结局分 True End（最优条件组合）、Normal End（常规路径）、Bad End（低 HP / 关键属性过低）
- 结局之间可以有多层过渡（如半坏结局、隐藏结局）

**文字显示**：
- 逐字打字机效果（30-50ms/字），配合 CSS 动画
- 关键词高亮（属性变化、人名、地名）
- 事件描述 + 效果反馈分为两段显示

**存档系统**：
- 快照式存档（序列化完整 GameState）
- 自动存档（每年自动保存）+ 手动存档槽位

### 1.3 移动端 UI 设计要点

**问题诊断（当前 UI）**：
- StatusPanel 占据顶部大量空间（年龄+HP+8个属性条+天赋标签 ≈ 屏幕的 40-50%）
- EventLog 在剩余空间中滚动，每次只能看到 1-2 条事件
- 控制栏在底部但只有播放/速度/跳过按钮，没有选择交互
- 分支选择弹窗虽然有但**引擎层没有真正实现分支暂停**

**设计原则**：
- **事件 > 属性**：属性折叠到最小，事件占据主视觉区域 70%+
- **选择即玩法**：每年暂停让玩家做选择，不是自动推演
- **移动优先**：触控按钮 44px+，文字 14px+，单手可操作
- **信息层级**：当前事件 > 属性概览 > 历史日志

---

## 二、改造方案

### 2.1 整体架构变更

```
当前流程：initGame → autoSimulate → finish
                    ↓
         全自动，玩家只能看

改造后：  initGame → yearLoop { showEvent → playerChoice → applyEffect } → showEnding
                    ↓
         每年暂停，玩家做选择，像 galgame 一样
```

### 2.2 UI 布局重设计（移动优先）

```
┌─────────────────────────┐
│  ◁ 返回    第X年    ⚙️  │  ← 顶栏（极简）
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │  [事件标题]      │   │  ← 当前事件卡片（主视觉区域）
│   │  [事件描述文字]  │   │     占屏幕 40-50%
│   │  逐字显示...     │   │     打字机效果
│   └─────────────────┘   │
│                         │
│   ┌─ 请选择 ─────────┐  │
│   │ A. [选项1]        │  │  ← 选择按钮（关键交互）
│   │ B. [选项2]        │  │     占屏幕 25-30%
│   │ C. [选项3]        │  │     触控友好 48px+
│   └───────────────────┘  │
│                         │
├─────────────────────────┤
│ 💪8 🧠6 ✨4 ❤️3 🍀5 💰2  │  ← 属性条（折叠为单行图标+数字）
│ 🩸 85/999  ⚔️侍从 🐉龙血  │  ← HP + 天赋标签
├─────────────────────────┤
│  📜 历史事件（可展开）    │  ← 折叠的历史日志
│  ├ 7岁: 魔法学院来信     │     点击展开查看
│  ├ 6岁: 林中的精灵       │
│  └ 5岁: ...              │
└─────────────────────────┘
```

### 2.3 引擎层改造

#### 2.3.1 每年事件流程重构

```
当前：simulateYear() → 自动选事件 → 自动解析 → 返回结果

改造后：
simulateYear() {
  1. 年龄+1
  2. 应用天赋年效果
  3. 获取候选事件列表
  4. 筛选出本年"关键事件"（有分支的事件 或 重大剧情事件）
  5. 如果有关键事件：
     → 返回 { phase: 'awaiting_choice', event, branches }
     → 等待玩家选择
     → resolveBranch(event, branchId)
     → 返回结果
  6. 如果无关键事件（普通年份）：
     → 自动解析随机事件
     → 返回 { phase: 'showing_result', event }
     → 等待玩家点击"继续"
}
```

#### 2.3.2 事件分类

| 类型 | 说明 | 玩家交互 |
|------|------|----------|
| **剧情事件** (story) | 有分支的重大事件（如讨伐巨龙、暗黑魔师的诱惑） | **必须选择** |
| **遭遇事件** (encounter) | 无分支但有意义的事件（如初恋、加入公会） | **展示后点击继续** |
| **平淡年** (mundane) | 无特殊事件，显示"平静的一年" | **点击继续** |

#### 2.3.3 事件数据增强

```typescript
// 事件增加 priority 字段
interface WorldEventDef {
  // ... 现有字段
  priority?: 'critical' | 'major' | 'minor'  // 新增：决定交互方式
  // critical = 有分支，必须选择
  // major = 无分支但需要玩家确认
  // minor = 可自动跳过（快进模式）
}
```

### 2.4 前端组件改造

#### 2.4.1 SimulationView 重构

**移除**：自动播放模式（togglePlay/autoStep）
**新增**：
- `EventScene.vue` — 当前事件展示（打字机效果 + 事件卡片）
- `ChoicePanel.vue` — 分支选择面板
- `YearSummary.vue` — 年度总结弹窗（属性变化摘要）
- `CompactStatus.vue` — 折叠属性条（替代 StatusPanel）

**保留**：
- `EventLog.vue` — 改为折叠式历史记录

#### 2.4.2 游戏流程交互

```
每年开始
  ↓
显示年度标题（"第X年"淡入）→ 0.5s
  ↓
[有关键事件？]
  ├ 是 → EventScene 显示事件描述（打字机效果）
  │       → ChoicePanel 显示选项
  │       → 玩家选择 → 应用效果
  │       → 显示效果反馈（属性变化动画）
  │
  └ 否 → [有普通事件？]
          ├ 是 → EventScene 显示事件（打字机效果）
          │       → 显示"继续"按钮
          │       → 玩家点击 → 应用效果
          │
          └ 否 → 显示"平静的一年过去了"
                  → "继续"按钮
  ↓
[是否死亡？]
  ├ 是 → 结局画面
  └ 否 → 下一年
```

#### 2.4.3 新增事件（补充分支选择）

当前只有 6 个事件有分支（`demon_hunt`/`dragon_slay_attempt`/`dark_mage_tempt`/`war_breaks_out`/`final_cataclysm`/`tavern_brawl`无分支）。

**需要为以下事件新增分支选项**（让选择更频繁）：

| 事件 | 年龄 | 新增分支选项 |
|------|------|-------------|
| `bullied` | 3-6 | 忍气吞声 / 找大人帮忙 / 试着反抗 |
| `magic_burst_baby` | 1-3 | 哭泣 / 挥手 / 尝试控制 |
| `magic_academy_notice` | 7-10 | 入学 / 拒绝 |
| `squire_training` | 10-14 | 全力修炼 / 偷懒摸鱼 |
| `first_love` | 12-15 | 表白 / 暗恋 / 放弃 |
| `guild_join` | 16-20 | 加入 / 独自冒险 |
| `first_quest` | 16-22 | 认真完成 / 敷衍了事 |
| `marry_noble` | 25-30 | 接受 / 拒绝 |
| `marry_adventurer` | 22-30 | 在一起 / 保持友谊 |
| `retirement` | 60-70 | 归隐山林 / 继续冒险 |
| `midlife_crisis` | 40-50 | 放下执念 / 坚持梦想 |

### 2.5 打字机效果实现

```typescript
// composable: useTypewriter.ts
function useTypewriter(speed = 40) {
  const displayed = ref('')
  const isTyping = ref(false)

  async function type(text: string) {
    isTyping.value = true
    displayed.value = ''
    for (const char of text) {
      displayed.value += char
      await sleep(speed)
    }
    isTyping.value = false
  }

  function skip() {
    // 点击跳过打字效果，直接显示全文
    displayed.value = fullText
    isTyping.value = false
  }

  return { displayed, isTyping, type, skip }
}
```

### 2.6 API 测试接口

为了让璃可以通过 API 直接游玩验证，新增一个调试模式：

```typescript
// 在 vite dev server 或独立 API 中暴露
// POST /api/debug/play-step
// Body: { action: 'next' | 'choose', branchId?: string }
// Response: { state, currentEvent, choices, phase }
```

或者更简单的方式——通过浏览器 console 暴露全局 API：

```typescript
// main.ts
if (import.meta.env.DEV) {
  window.__game = useGameStore()
  window.__step = () => gameStore.simulateYear()
  window.__choose = (id: string) => gameStore.resolveBranch(id)
}
```

---

## 三、实施计划

### Phase 1：引擎层改造（预计 2-3 小时）

1. **重构 `SimulationEngine.simulateYear()`**
   - 拆分为 `startYear()` / `resolveBranch()` / `skipYear()` 三步
   - `startYear()` 返回事件+选项，不自动执行
   - 新增事件 `priority` 字段

2. **更新 `EventModule`**
   - `getCandidates()` 返回带 priority 标记的事件列表
   - 新增 `getEventInteractionType()` 方法

3. **更新事件数据**
   - 为 11 个事件新增分支选项
   - 为所有事件设置 `priority` 字段

### Phase 2：前端 UI 重构（预计 3-4 小时）

4. **新建 `CompactStatus.vue`**
   - 单行显示所有属性（图标+数字）
   - 点击可展开详情

5. **新建 `EventScene.vue`**
   - 打字机效果显示事件描述
   - 点击跳过打字效果

6. **新建 `ChoicePanel.vue`**
   - 分支选项按钮列表
   - 条件限制提示（"需要体魄 ≥ 5"）

7. **重构 `SimulationView.vue`**
   - 移除自动播放
   - 实现逐年手动推进
   - 集成新组件

8. **改造 `EventLog.vue`**
   - 折叠式历史记录
   - 默认只显示最近 3 年

### Phase 3：验收 & 调试（预计 1-2 小时）

9. **构建 dev API**
   - 浏览器 console 暴露 `__game` / `__step` / `__choose`
   - 或 vite plugin 提供 REST API

10. **自动化验收脚本**
    - 通过 console API 模拟完整游戏流程
    - 验证每个分支选项的正确性
    - 验证属性变化和 flag 设置

### Phase 4：构建 & 部署

11. **本地构建验证**
    - `vite build` 通过
    - 移动端 Chrome / Safari 实机测试

12. **总结报告**

---

## 四、验收清单

- [ ] 每年不再自动推演，必须玩家操作才能继续
- [ ] 有分支的事件显示 2-4 个选项，玩家必须选择
- [ ] 打字机效果正常，点击可跳过
- [ ] 属性面板折叠为单行，不占主视觉区域
- [ ] 事件描述区域占屏幕 60%+
- [ ] 移动端触控友好（按钮 48px+，文字 14px+）
- [ ] 所有新增分支选项逻辑正确
- [ ] 历史事件折叠/展开正常
- [ ] 死亡/结局正常触发
- [ ] `vite build` 构建成功
- [ ] 通过 API 自动游玩 3 局以上无报错

---

## 五、Claude Code 任务指令

审核通过后，将以下指令发送给 Claude Code：

```
你是异世界重生模拟器项目的开发工程师。项目路径：/Users/ktsama/Projects/isekai-rebirth-simulator
技术栈：Vue 3 + TypeScript + Pinia + Vite

请严格按照 REDESIGN_PLAN.md 执行改造。按 Phase 顺序实施：

Phase 1 - 引擎层：
1. 重构 SimulationEngine.simulateYear() 为 startYear()/resolveBranch()/skipYear()
2. 更新 EventModule 支持事件优先级分类
3. 为 11 个事件新增分支选项（详见 REDESIGN_PLAN.md 第四节）
4. 所有事件设置 priority 字段

Phase 2 - 前端：
5. 新建 CompactStatus.vue（折叠属性条）
6. 新建 EventScene.vue（打字机效果）
7. 新建 ChoicePanel.vue（分支选择）
8. 重构 SimulationView.vue（移除自动播放，手动逐年推进）
9. 改造 EventLog.vue（折叠历史）

Phase 3 - 验收：
10. 浏览器 console 暴露 __game/__step/__choose 调试 API
11. vite build 通过

完成后运行：openclaw system event --text "Done: Phase 1-3 全部完成，build 通过" --mode now
```
