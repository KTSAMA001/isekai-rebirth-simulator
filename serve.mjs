#!/usr/bin/env node
/**
 * 一键启动脚本 — 用 Node.js 内置 http 模块提供 dist/ 静态文件服务
 * 支持 SPA 路由回退（所有非文件请求返回 index.html）
 * 
 * 使用方式：node serve.mjs [端口号]
 * 默认端口：3000
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const PORT = parseInt(process.argv[2] || '3000', 10)

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
}

async function serveFile(res, filePath) {
  try {
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error('not a file')
    const data = await readFile(filePath)
    const ext = extname(filePath)
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    res.end(data)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  let pathname = decodeURIComponent(url.pathname)

  // 安全：阻止路径穿越
  if (pathname.includes('..')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  // 去掉开头的 /
  const relative = pathname.replace(/^\//, '') || 'index.html'
  const filePath = join(DIST, relative)

  // 先尝试直接提供请求的文件
  if (await serveFile(res, filePath)) return

  // SPA 回退：非文件请求返回 index.html
  const indexPath = join(DIST, 'index.html')
  if (await serveFile(res, indexPath)) return

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`\n  🎮 异世界重生模拟器`)
  console.log(`  ━━━━━━━━━━━━━━━━━━`)
  console.log(`  本地运行: http://localhost:${PORT}/`)
  console.log(`  按 Ctrl+C 停止\n`)
})
