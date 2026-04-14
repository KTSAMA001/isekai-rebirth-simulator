# 异世界重生模拟器

一个基于 Vue 3 的异世界人生推演模拟器，支持 PWA 离线安装。

🎮 **在线游玩：** https://ktsama001.github.io/isekai-rebirth-simulator/

---

## 项目概览

### 核心玩法

玩家扮演一个异世界的新生命，从出生到死亡体验完整的一生。每次游戏通过属性初始值 + 随机事件的组合，生成独一无二的人生故事。

### 内容规模

| 类型 | 数量 | 说明 |
|------|------|------|
| 种族 | 7 | 人类、精灵、矮人、哥布林、兽人、海精灵、半龙人 |
| 事件 | 675 | 覆盖出生→童年→少年→青年→成年→中年→老年 7 个阶段 |
| 成就 | 127 | 基于人生经历解锁 |
| 天赋 | 68 | 出生时随机获得，影响人生走向 |
| 物品 | 22 | 可在事件中获得，提供属性加成 |
| 评价 | 54 | D ~ SS 六个等级，基于人生质量评分 |

### 种族数据

| 种族 | maxLifespan | 大部分死亡区间 | 寿命特点 |
|------|-------------|---------------|---------|
| 人类 | 100 | 65-85 岁 | 基准寿命 |
| 精灵 | 500 | 250-400 岁 | 长寿，有 HP 平台期保护 |
| 矮人 | 400 | 150-250 岁 | 长寿，有 HP 平台期保护 |
| 哥布林 | 60 | 20-35 岁 | 短寿，人生紧凑 |
| 兽人 | — | 20-35 岁 | 短寿 |
| 海精灵 | — | 250-400 岁 | 长寿 |
| 半龙人 | — | 40-60 岁 | 中短寿 |

---

## 技术栈

- **框架：** Vue 3.5 + TypeScript 5.9
- **构建：** Vite 8
- **状态管理：** Pinia
- **路由：** Vue Router（Hash 模式）
- **PWA：** vite-plugin-pwa + Workbox
- **测试：** Vitest + @vue/test-utils
- **部署：** GitHub Pages（Actions 自动部署）

---

## 架构

### 引擎层（`src/engine/`）

游戏核心逻辑与 UI 完全解耦，引擎可在 Node.js 中独立运行（测试/模拟/批量生成）。

```
src/engine/
├── core/
│   ├── SimulationEngine.ts   # 主引擎：HP 计算、年龄推进、死亡判定
│   ├── RandomProvider.ts     # 随机数提供者（可注入 seed 复现）
│   ├── stateUtils.ts         # 状态工具函数
│   └── types.ts              # 核心类型定义
├── modules/
│   ├── EventModule.ts        # 事件加载、筛选、触发、age→百分比缩放
│   ├── AttributeModule.ts    # 属性成长与事件效果处理
│   ├── AchievementModule.ts  # 成就解锁
│   ├── TalentModule.ts       # 天赋系统
│   ├── ItemModule.ts         # 物品管理与效果计算
│   ├── ConditionDSL.ts       # 条件表达式解析器（支持 flag、属性、天赋）
│   ├── DiceModule.ts         # 骰子系统（事件分支概率）
│   └── EvaluatorModule.ts    # 人生评价系统
└── world/
    ├── WorldInstance.ts      # 世界实例（绑定数据包 + 引擎）
    └── WorldRegistry.ts      # 世界注册表
```

### 百分比系统（Phase 0-2 重构完成）

事件触发基于 **lifeProgress（生命进度百分比）** 而非绝对年龄，确保跨种族事件分配合理：

- **公式**：`lifeProgress = age / race.maxLifespan`
- **年龄缩放**：`scaledAge = humanAge × lifeProgress`（将百分比映射回人类等价年龄）
- **HP 衰减**：sigmoid 曲线（K=12），中点为 Beta(8,3) 分布的个人死亡进度
- **保护机制**：童年保护（10 岁以下不衰减）、长寿种族 HP 平台期（lifeProgress < 0.5）

详见 `docs/refactor-plan-lifecycle-percentage.md`

### 数据层（`data/sword-and-magic/`）

```
data/sword-and-magic/
├── events/          # 事件数据（按生命阶段分文件）
│   ├── birth.json       (63)
│   ├── childhood.json   (79)
│   ├── teenager.json    (88)
│   ├── youth.json      (126)
│   ├── adult.json      (163)
│   ├── middle-age.json  (80)
│   └── elder.json       (76)
├── races.json       # 种族定义
├── achievements.json # 成就定义
├── talents.json     # 天赋定义
├── items.json       # 物品定义
├── evaluations.json # 人生评价定义
├── rules.json       # 评分等级规则
├── presets.json     # 属性初始预设
├── attributes.json  # 属性成长规则
└── lore/            # 世界书设定文档（种族、地理、势力、魔法体系、编年史）
```

---

## 项目结构

```
├── src/                  # 源码
│   ├── engine/           # 核心引擎（人生推演逻辑）
│   ├── views/            # 页面视图
│   ├── components/       # UI 组件
│   ├── stores/           # Pinia 状态管理
│   ├── styles/           # 全局样式
│   └── worlds/           # 世界观定义
├── data/                 # 游戏数据（事件、物品、天赋等）
│   └── sword-and-magic/  # 「剑与魔法」世界数据
├── tests/                # 测试用例
├── docs/                 # 项目文档
│   ├── QA-TEST-BASELINE.md          # QA 测试基准文档（24KB）
│   └── refactor-plan-lifecycle-percentage.md  # 百分比重构计划
├── public/               # 静态资源 & PWA 图标
├── .github/workflows/    # CI/CD 工作流
└── dist/                 # 构建产物（不入版本控制）
```

---

## 本地开发

### 前置要求

- Node.js 20+
- npm

### 安装与启动

```bash
# 安装依赖（需要 --legacy-peer-deps，因为 vite-plugin-pwa 尚未声明 Vite 8 兼容）
npm install --legacy-peer-deps

# 开发模式（热更新）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

### 运行测试

```bash
# 运行全部测试
npm test

# 监听模式
npm run test:watch
```

## 本地一键启动（免开发环境）

如果只想玩游戏，不需要搭开发环境：

1. 确保已安装 [Node.js](https://nodejs.org/)
2. 先执行一次 `npm run build` 生成 `dist/` 目录
3. **macOS：** 双击 `启动游戏.command`
4. **Windows：** 双击 `start.bat`
5. **Linux / 通用：** `./start.sh`

浏览器会自动打开 `http://localhost:3000/`。

---

## QA 与测试

### 测试基准文档

**`docs/QA-TEST-BASELINE.md`** 是 QA 测试的权威数据源，包含：

- 种族数据表（maxLifespan、lifespanRange、属性修正）
- 百分比系统规则（四条年龄缩放路径）
- ConditionDSL 标识符完整列表
- 关键常量（HUMAN_BASE_LIFESPAN、sigmoid K=12 等）
- **常识性判断规则**（8 个子节）：
  - 生命阶段隔离（每个阶段不应出现的事件）
  - Flag 因果链条（5 条完整解锁链 + 检验规则）
  - 跨种族年龄等价（快速判断公式 + bug 模式示例）
  - HP 与死亡系统（sigmoid 公式、保护机制、验证方法）
  - 属性门槛（14 个事件的 include 条件）
  - 评分系统（D~SS 等级分数范围）
  - minStageProgress 百分比范围校验
  - 事件效果落地验证（假触发检测）

### 测试覆盖

| 目录 | 内容 | 文件数 |
|------|------|--------|
| `tests/engine/core/` | SimulationEngine、状态工具 | 3 |
| `tests/engine/modules/` | 事件、属性、成就、天赋、物品、条件、骰子、评价 | 8 |
| `tests/engine/world/` | 世界实例、世界注册 | 2 |
| `tests/data/` | Schema 校验 | 1 |
| `tests/stores/` | Pinia 状态 | 1 |
| `tests/utils/` | 故事生成工具 | 1 |
| `tests/full-life-route.test.ts` | 完整人生路线测试 | 1 |
| `tests/race-balance.test.ts` | 种族平衡测试 | 1 |
| `tests/qa-phase2-deep-test.test.ts` | Phase 2 深度验证（41 项） | 1 |

---

## 部署

### GitHub Pages（当前方案）

项目已配置 GitHub Actions 自动部署：

- 推送到 `master` 分支后自动触发构建和部署
- 工作流定义：[.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- 部署地址：https://ktsama001.github.io/isekai-rebirth-simulator/

### 注意事项

1. **Base 路径：** 部署到 GitHub Pages 时，`base` 路径会自动设为 `/<仓库名>/`，由 Actions 工作流通过 `VITE_BASE` 环境变量注入。本地开发时 `base` 为 `/`
2. **依赖安装：** CI 中使用 `npm ci --legacy-peer-deps`，因为 `vite-plugin-pwa` 的 peer dependency 声明尚未覆盖 Vite 8
3. **PWA 离线：** 构建产物包含 Service Worker，用户首次访问后即可离线使用；再次访问时自动更新缓存
4. **Hash 路由：** 使用 `createWebHashHistory()`，无需服务端配置 URL 重写，兼容所有静态托管

### 部署到其他平台

项目是纯静态前端，无后端依赖，可部署到任何静态托管服务：

```bash
npm run build
# 将 dist/ 目录部署到目标平台即可
```

兼容平台：Cloudflare Pages、Netlify、Vercel、任意 HTTP 静态服务器等。

---

## 许可证

私有项目，未公开授权。
