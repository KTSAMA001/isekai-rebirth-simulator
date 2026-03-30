# UI Redesign V2 — 基于调研的设计规范

## 设计参考
- **BitLife**: 白色背景、高对比度、选项为列表式但有充足 padding（15px+）
- **Left Unread**: 聊天气泡式、16-18px 正文、底部拇指区操作
- **iOS HIG**: 最小点击区域 44pt、正文 17pt、标题 20-34pt

## 核心原则
1. **不压缩字号** — 通过优化布局省空间，不是把字缩小
2. **选项用卡片式** — 每个选项独立圆角卡片，有 padding 和间距，不挤在一起
3. **拇指区操作** — 主要交互元素在屏幕下半部分
4. **间距优先** — 元素间保持 8-12px 间距，选项间 8px

## 字号标准（rem @ 16px base）
| 元素 | 字号 | px | 说明 |
|------|------|-----|------|
| 事件标题 | 1.05rem | 16.8px | 粗体，事件卡片内 |
| 事件描述（正文） | 0.9rem | 14.4px | 主要阅读内容，line-height 1.6 |
| 选项标题 | 0.85rem | 13.6px | 粗体 |
| 选项描述 | 0.78rem | 12.5px | 次要文字 |
| 锁定提示 | 0.7rem | 11.2px | 小字灰 |
| 风险提示 | 0.72rem | 11.5px | 紫色小字 |
| 状态栏折叠 | 0.72rem | 11.5px | 年龄/HP |
| 顶栏 | 0.75rem | 12px | 导航 |
| 继续按钮 | 0.9rem | 14.4px | CTA |

## Task A: ChoicePanel 卡片式重设计
**文件**: `src/components/simulation/ChoicePanel.vue`

### 布局
- 容器：padding 12px，flex column，gap 8px
- 每个选项：独立卡片，border: 1px solid var(--border-color)，border-radius 10px
- 可选卡片：背景 transparent，hover 时 var(--bg-card-hover)
- 不可选卡片：opacity 0.5（不是 dashed border），cursor not-allowed
- 风险选项：左侧 3px 紫色竖线（border-left: 3px solid rgba(167,139,250,0.4)）

### 选项卡片内部
- 纵向布局（不是横排挤一行）
- 标题行：选项标题（粗体 0.85rem）+ 风险/锁定小字在右侧
- 描述行：选项描述（0.78rem），在标题下方
- padding: 10px 12px
- 最小高度: 44px（iOS 最小点击区域）

### 锁定提示
- 标题右侧显示 🔒 emoji + 条件文字
- 不独占一行，inline 显示
- 字号 0.7rem，颜色 var(--text-dim)

### 风险提示
- 标题右侧显示成功率 "📊 75%"
- 字号 0.72rem，紫色

## Task B: EventScene 字号恢复
**文件**: `src/components/simulation/EventScene.vue`

### 容器
- padding: 12px 16px（不挤压）
- 不设 min-height（内容自适应）

### 事件卡片
- padding: 14px 16px
- border-radius: 10px
- 事件标题: 1.05rem，粗体
- 事件描述: 0.9rem，line-height 1.6（核心可读性）
- 无闪烁光标（已移除）
- 无 skip 提示（已移除）

### 效果 chips
- gap: 4px
- chip padding: 2px 8px
- chip 字号: 0.7rem

### 风险结果
- 字号: 0.85rem
- padding: 4px 0

## Task C: SimulationView 布局
**文件**: `src/views/SimulationView.vue`

### 顶栏
- padding: 4px 16px
- 按钮字号: 0.75rem
- 年份标签: 0.75rem

### 继续按钮
- min-height: 44px
- padding: 8px 24px
- 字号: 0.9rem

### sim-scroll-area
- flex: 1, overflow-y: auto, -webkit-overflow-scrolling: touch（保持不变）

## Task D: CompactStatus 恢复
**文件**: `src/components/simulation/CompactStatus.vue`

### 折叠状态
- 容器 padding: 6px 16px
- compact-row min-height: 30px
- age-badge: 0.75rem
- hp-mini: 0.72rem
- 属性 icon: 0.72rem

### 展开状态
- 各种字号恢复到 ≥ 0.7rem
