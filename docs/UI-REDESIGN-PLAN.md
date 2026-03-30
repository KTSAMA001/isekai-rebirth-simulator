# UI Redesign Plan — Simulation View (Mobile-First)

## 目标

让模拟页在手机端（320px-428px 宽，568px-932px 高）上，事件描述 + 全部选项按钮都能**不滚动或极少滚动**就完整显示。

## 当前问题分析

1. **空间浪费**：EventScene 用 `flex:1 + min-height:200px` 贪婪占空间，即使内容很短也撑满
2. **选项卡片太高**：每个按钮用 `display:block` 独占一行，标题、描述、锁定提示纵向堆叠，单按钮约 80-100px
3. **固定 `100vh` 容器**：`overflow:hidden` 裁掉溢出内容，5 个选项需要 400-500px 高度，手机放不下
4. **间距过大**：各组件 padding/margin 偏大（16-24px），积累起来浪费大量空间

## 设计原则

1. **事件描述自适应**：不设 min-height，按内容高度显示
2. **选项紧凑排列**：标题+描述同行，锁定提示内联，单选项高度控制在 36-44px
3. **空间按需分配**：选项多时压缩事件区域间距，选项少时舒适展示
4. **视觉层次**：选项可点/不可点要有明确的视觉区分（不是只靠透明度）
5. **触控友好**：最小触控区域 44px 高度

## 参考：同类产品 UI 模式

### 人生重开模拟器（BitLife/生命线风格）
- 选项用简洁的列表，无卡片包裹
- 选项之间细分割线
- 锁定选项灰字+锁图标，不占大块空间
- 事件描述区占 30-40% 屏幕，选项区占 60-70%

### 文字冒险/视觉小说
- 选项浮在底部，半透明背景
- 选项按钮圆角胶囊形，紧凑
- 最多显示 4 个选项，超出则列表滚动

### 我们的方案：混合式
- 事件描述区：紧凑卡片，按内容自适应高度
- 选项区：底部固定，独立滚动（选项多时）
- 状态栏：固定顶部，最小化

## 详细修改计划

### Task 1: SimulationView 布局重构
**文件**: `src/views/SimulationView.vue`

当前布局（从上到下）：
```
top-bar (56px)
save-panel (conditional)
CompactStatus (~80px)
EventScene (flex:1, min-height:200px)
ChoicePanel (variable)
continue-bar (48px)
EventLog (scrollable)
```

目标布局：
```
top-bar (40px, 紧凑)
CompactStatus (~60px, 紧凑)
sim-scroll-area (flex:1, overflow:auto)
  └ EventScene (按内容自适应, 不设 min-height)
  └ ChoicePanel (按内容自适应)
continue-bar (40px, 紧凑)
```

- `--header-height` 不变（56px 是 header 不是 top-bar）
- top-bar 高度从 56px 减到 40px
- CompactStatus 减少间距
- EventLog 移到另一个 tab/折叠区域（不在此任务范围）
- sim-scroll-area 保持之前的滚动方案作为兜底

### Task 2: EventScene 紧凑化
**文件**: `src/components/simulation/EventScene.vue`

| 属性 | 当前值 | 目标值 |
|------|--------|--------|
| 容器 padding | `8px 16px` | `6px 12px` |
| min-height | 无（已移除） | 无 |
| flex | 无（已移除） | 无 |
| 卡片 padding | `16px` | `12px` |
| 事件标题字号 | `1.05rem` | `0.95rem` |
| 事件标题 margin-bottom | `4px` | `2px` |
| 描述字号 | `0.82rem` | `0.78rem` |
| 描述 line-height | `1.6` | `1.5` |
| 效果行 margin-top | `6px` | `4px` |
| 效果 chip padding | `2px 8px` | `2px 6px` |
| 效果 chip 字号 | `0.7rem` | `0.65rem` |
| risk-result 字号 | `0.9rem` | `0.8rem` |
| year-title 字号 | `0.75rem` | `0.7rem` |

### Task 3: ChoicePanel 紧凑化 + 视觉优化
**文件**: `src/components/simulation/ChoicePanel.vue`

**核心改动：选项按钮从 block 布局改为 inline 列表风格**

目标：每个选项按钮高度控制在 36-44px（含 padding）

选项布局方案：
```
┌─────────────────────────────────────┐
│ ● 名垂青史  你将被后人铭记  🔒chr≥18 │  ← 可选：实心圆点
│ ○ 被爱环绕   家人陪伴安详离去         │  ← 不可选：空心圆点
│ ● 战斗到底   战士的方式离去           │  ← 可选
│ ○ 化作星光   身体化为点点星光  🔒spr≥15│  ← 不可选
│ ● 安静离开   悄然而去                 │  ← 可选（无条件的保底）
└─────────────────────────────────────┘
```

具体 CSS：
| 属性 | 当前值 | 目标值 |
|------|--------|--------|
| 容器 padding | `6px 16px` | `4px 12px` |
| choice-title | `0.7rem, margin-bottom 4px` | `0.65rem, margin-bottom 2px` |
| 选项间距 | `6px` | `0px, 用 border-top 分割` |
| 按钮 padding | `8px 10px` | `6px 8px` |
| 按钮布局 | `flex, flex-wrap` | `flex, align-items: center` |
| 标题+描述 | 换行 | 同行，描述用 `text-overflow: ellipsis` 截断 |
| 按钮高度 | ~60-80px | 36-44px（min-height: 36px） |
| 标题字号 | `0.85rem` | `0.8rem` |
| 描述字号 | `0.72rem` | `0.65rem` |
| 锁定提示 | 独占一行 | 紧跟描述后面，灰色小字 |
| 可选指示器 | 无 | 左侧加 `●` 实心/`○` 空心圆点 |
| 按钮背景 | card 背景 | 可选=微弱背景，不可选=透明 |
| border | `1px solid` | 可选=`1px solid`, 不可选=`none` |
| 整体 border | 上边框 `1px solid` | 同上，但在最顶部 |

### Task 4: CompactStatus 紧凑化
**文件**: `src/components/simulation/CompactStatus.vue`

折叠状态（单行）已经很紧凑（min-height:32px），主要压缩展开详情：

| 属性 | 当前值 | 目标值 |
|------|--------|--------|
| 容器 padding | `8px 16px` | `4px 12px` |
| compact-row min-height | `32px` | `28px` |
| compact-row gap | `8px` | `6px` |
| age-badge 字号 | `0.8rem` | `0.72rem` |
| hp-mini 字号 | `0.75rem` | `0.68rem` |
| attr-icon-item 字号 | `0.75rem` | `0.68rem` |
| expand-icon 字号 | `0.6rem` | `0.55rem` |
| detail-panel margin-top | `8px` | `4px` |
| hp-value 字号 | `0.9rem` | `0.8rem` |
| attr-d-name 字号 | `0.7rem` | `0.65rem` |

### Task 5: 选项按钮交互增强
**文件**: `src/components/simulation/ChoicePanel.vue`

- 可选按钮：hover 时背景微亮 + 左侧紫色竖线
- 不可选按钮：灰色文字，无背景，无 border，不可点击
- 按下反馈：scale(0.97) + 背景色变化
- 风险选项：右侧显示成功率数字（不是一整行提示）

### Task 6: 验证 + 构建测试
- 5 个选项的事件（生命的终点）在 iPhone SE (375x667) 上完整显示
- 3 个选项的事件在 iPhone SE 上也舒适
- 锁定/可用视觉区分清晰
- 文字无截断（description 用 ellipsis 兜底）

## 任务拆分 & 执行顺序

```
Task 1: SimulationView 布局重构          → CC 单独执行
Task 2: EventScene 紧凑化                  → CC 单独执行
Task 3: ChoicePanel 紧凑化 + 视觉优化       → CC 单独执行
Task 4: CompactStatus 紧凑化               → CC 单独执行
Task 5: 选项按钮交互增强                   → CC 单独执行
Task 6: 验证 + 构建 + 截图确认              → 璃自己执行
```

每个 Task 之间构建验证一次，确保不破坏。
