<script setup lang="ts">
/**
 * 环境粒子效果 — 萤火虫/魔法尘埃
 * 固定定位，不影响布局。支持 prefers-reduced-motion 无障碍关闭
 */
import { ref, onMounted } from 'vue'

interface Particle {
  id: number
  left: string
  top: string
  size: string
  duration: string
  delay: string
  dx: string
  dy: string
}

const particles = ref<Particle[]>([])

onMounted(() => {
  const count = 12
  const result: Particle[] = []
  for (let i = 0; i < count; i++) {
    result.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${40 + Math.random() * 55}%`,
      size: `${2 + Math.random() * 2.5}px`,
      duration: `${7 + Math.random() * 8}s`,
      delay: `${Math.random() * 7}s`,
      dx: `${(Math.random() - 0.5) * 50}px`,
      dy: `${-40 - Math.random() * 80}px`,
    })
  }
  particles.value = result
})
</script>

<template>
  <div class="ambient-particles" aria-hidden="true">
    <span
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="{
        left: p.left,
        top: p.top,
        width: p.size,
        height: p.size,
        '--duration': p.duration,
        '--delay': p.delay,
        '--dx': p.dx,
        '--dy': p.dy,
      }"
    />
  </div>
</template>

<style scoped>
.ambient-particles {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.7), transparent);
  border-radius: 50%;
  animation: float-particle var(--duration, 8s) var(--delay, 0s) infinite ease-in-out;
}

@keyframes float-particle {
  0%, 100% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  15% {
    opacity: 0.7;
    transform: translate(0, 0) scale(1);
  }
  85% {
    opacity: 0.3;
  }
  100% {
    transform: translate(var(--dx, 30px), var(--dy, -80px)) scale(0.2);
    opacity: 0;
  }
}

/* 无障碍：尊重用户动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    display: none;
  }
}
</style>
