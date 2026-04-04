# 异世界重生模拟器

一个基于 Vue 3 的异世界人生推演模拟器，支持 PWA 离线安装。

🎮 **在线游玩：** https://ktsama001.github.io/isekai-rebirth-simulator/

## 技术栈

- **框架：** Vue 3.5 + TypeScript 5.9
- **构建：** Vite 8
- **状态管理：** Pinia
- **路由：** Vue Router（Hash 模式）
- **PWA：** vite-plugin-pwa + Workbox
- **测试：** Vitest + @vue/test-utils
- **部署：** GitHub Pages（Actions 自动部署）

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
├── public/               # 静态资源 & PWA 图标
├── .github/workflows/    # CI/CD 工作流
└── dist/                 # 构建产物（不入版本控制）
```

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

## 部署

### GitHub Pages（当前方案）

项目已配置 GitHub Actions 自动部署：

- 推送到 `master` 分支后自动触发构建和部署
- 工作流定义：[.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- 部署地址：https://ktsama001.github.io/isekai-rebirth-simulator/

### 注意事项

1. **仓库可见性：** GitHub 免费计划仅支持 **public** 仓库使用 Pages，当前仓库为 public
2. **Base 路径：** 部署到 GitHub Pages 时，`base` 路径会自动设为 `/<仓库名>/`，由 Actions 工作流通过 `VITE_BASE` 环境变量注入。本地开发时 `base` 为 `/`
3. **依赖安装：** CI 中使用 `npm ci --legacy-peer-deps`，因为 `vite-plugin-pwa` 的 peer dependency 声明尚未覆盖 Vite 8
4. **PWA 离线：** 构建产物包含 Service Worker，用户首次访问后即可离线使用；再次访问时自动更新缓存
5. **Hash 路由：** 使用 `createWebHashHistory()`，无需服务端配置 URL 重写，兼容所有静态托管

### 部署到其他平台

项目是纯静态前端，无后端依赖，可部署到任何静态托管服务：

```bash
npm run build
# 将 dist/ 目录部署到目标平台即可
```

兼容平台：Cloudflare Pages、Netlify、Vercel、任意 HTTP 静态服务器等。

## 许可证

私有项目，未公开授权。
