#!/bin/bash
# 异世界重生模拟器 — 一键启动
# 无需安装任何依赖，只需有 Node.js
set -e
cd "$(dirname "$0")"
PORT="${1:-3000}"

echo ""
echo "  🎮 异世界重生模拟器"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 Node.js
if ! command -v node &>/dev/null; then
  echo "  ❌ 未检测到 Node.js"
  echo "  请先安装: https://nodejs.org/"
  echo ""
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# 检查 dist 目录
if [ ! -f "dist/index.html" ]; then
  echo "  ❌ 缺少 dist/ 目录，包可能不完整"
  exit 1
fi
echo "  ✓ 游戏文件就绪"

echo ""
echo "  🌐 访问地址: http://localhost:${PORT}/"
echo "  按 Ctrl+C 停止"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

node serve.mjs "$PORT"
