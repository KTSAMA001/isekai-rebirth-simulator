#!/bin/bash
cd "$(dirname "$0")"

if [ ! -f "dist/index.html" ]; then
  osascript -e 'display alert "启动失败" message "未找到 dist/index.html，请先执行 npm run build。" as critical'
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "启动失败" message "未检测到 Node.js，请先安装 Node.js 后再启动。" as critical'
  exit 1
fi

PORT="${1:-3000}"

./start.sh "$PORT" &
SERVER_PID=$!

for _ in {1..50}; do
  if curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
    open "http://localhost:${PORT}/" >/dev/null 2>&1
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 0.2
done

kill "$SERVER_PID" >/dev/null 2>&1
osascript -e 'display alert "启动失败" message "本地服务启动超时，请检查端口是否被占用。" as critical'
exit 1