<script setup lang="ts">
/**
 * 环境粒子效果 — 萤火虫/魔法尘埃
 * Canvas 实现：连续出生/死亡、柔光晕、有机运动
 * 固定定位，不影响布局。支持 prefers-reduced-motion 无障碍关闭
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ---------- 粒子数据 ---------- */
interface Particle {
  x: number
  y: number
  size: number          // 核心半径(px)
  maxLife: number       // 总寿命(秒)
  age: number           // 已存活(秒)
  vx: number            // 水平基础速度
  vy: number            // 垂直速度(负=向上)
  drift: number         // 正弦漂移振幅
  driftSpeed: number    // 正弦漂移频率
  phase: number         // 正弦初相
  hue: number           // 色相
  brightness: number    // 亮度系数
  twinkleSpeed: number  // 闪烁频率
  twinkleDepth: number  // 闪烁深度 0~0.4
}

/* ---------- 配置 ---------- */
const CFG = {
  maxParticles: 14,
  spawnRate: 1.2,       // 每秒生成
  minLife: 8,
  maxLife: 18,
  minSize: 0.5,
  maxSize: 1.8,
  fadeIn: 0.20,         // 前 20% 淡入
  fadeOut: 0.28,        // 后 28% 淡出
  glowScale: 2.8,       // 光晕半径 = 核心 × 此值
  hueMin: 34,
  hueMax: 52,           // 金~琥珀
  globalAlpha: 0.30,    // 全局透明度上限
}

/* ---------- 工具 ---------- */
const rand = (a: number, b: number) => a + Math.random() * (b - a)
// smoothstep: 0→1 的平滑 S 型
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/* ---------- 状态 ---------- */
const canvasRef = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
let animId = 0
let particles: Particle[] = []
let lastTime = 0
let spawnAccum = 0
let logicalW = 0
let logicalH = 0

/* ---------- 粒子工厂 ---------- */
function spawn(): Particle {
  return {
    x: rand(0, logicalW),
    y: rand(logicalH * 0.3, logicalH * 0.97),
    size: rand(CFG.minSize, CFG.maxSize),
    maxLife: rand(CFG.minLife, CFG.maxLife),
    age: 0,
    vx: rand(-5, 5),
    vy: rand(-14, -3),
    drift: rand(8, 28),
    driftSpeed: rand(0.3, 1.0),
    phase: rand(0, Math.PI * 2),
    hue: rand(CFG.hueMin, CFG.hueMax),
    brightness: rand(0.20, 0.45),
    twinkleSpeed: rand(2, 6),
    twinkleDepth: rand(0.05, 0.35),
  }
}

/* ---------- 透明度曲线 ---------- */
function alpha(p: Particle): number {
  const t = p.age / p.maxLife
  let a: number
  if (t < CFG.fadeIn) a = smoothstep(t / CFG.fadeIn)
  else if (t > 1 - CFG.fadeOut) a = smoothstep((1 - t) / CFG.fadeOut)
  else a = 1
  // 叠加闪烁
  const twinkle = 1 - p.twinkleDepth * (0.5 + 0.5 * Math.sin(p.age * p.twinkleSpeed))
  return a * p.brightness * twinkle * CFG.globalAlpha
}

/* ---------- 更新 ---------- */
function update(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.age += dt
    if (p.age >= p.maxLife) { particles.splice(i, 1); continue }
    p.x += p.vx * dt + Math.sin(p.age * p.driftSpeed + p.phase) * p.drift * dt
    p.y += p.vy * dt
  }
  spawnAccum += CFG.spawnRate * dt
  while (spawnAccum >= 1 && particles.length < CFG.maxParticles) {
    particles.push(spawn())
    spawnAccum -= 1
  }
  if (particles.length >= CFG.maxParticles) spawnAccum = 0
}

/* ---------- 绘制 ---------- */
function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, logicalW, logicalH)
  for (const p of particles) {
    const a = alpha(p)
    if (a < 0.008) continue
    const r = p.size
    const gr = r * CFG.glowScale

    // 外层柔光晕
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr)
    glow.addColorStop(0,   `hsla(${p.hue}, 70%, 60%, ${a * 0.15})`)
    glow.addColorStop(0.35, `hsla(${p.hue}, 65%, 52%, ${a * 0.04})`)
    glow.addColorStop(1,   `hsla(${p.hue}, 55%, 45%, 0)`)
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(p.x, p.y, gr, 0, Math.PI * 2)
    ctx.fill()

    // 核心亮点
    const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
    core.addColorStop(0, `hsla(${p.hue}, 45%, 85%, ${a * 0.45})`)
    core.addColorStop(1, `hsla(${p.hue}, 70%, 58%, ${a * 0.08})`)
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ---------- 主循环 ---------- */
function loop(time: number) {
  if (!ctx) return
  const dt = Math.min((time - lastTime) / 1000, 0.1) // 限制 delta 防止切标签跳帧
  lastTime = time
  update(dt)
  draw()
  animId = requestAnimationFrame(loop)
}

/* ---------- Canvas 初始化 ---------- */
function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  logicalW = rect.width
  logicalH = rect.height
  canvas.width = logicalW * dpr
  canvas.height = logicalH * dpr
  ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/* ---------- 防抖 Resize ---------- */
let resizeTimer = 0
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(setupCanvas, 200) as unknown as number
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  setupCanvas()
  if (!ctx) return

  // 预填充粒子（随机已存活时间，避免开场空白）
  for (let i = 0; i < Math.floor(CFG.maxParticles * 0.6); i++) {
    const p = spawn()
    p.age = rand(0, p.maxLife * 0.75)
    particles.push(p)
  }
  lastTime = performance.now()
  animId = requestAnimationFrame(loop)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  clearTimeout(resizeTimer)
  particles = []
  ctx = null
})
</script>

<template>
  <canvas ref="canvasRef" class="ambient-particles" aria-hidden="true" />
</template>

<style scoped>
.ambient-particles {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* 无障碍：尊重用户动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ambient-particles {
    display: none;
  }
}
</style>
