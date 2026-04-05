<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameIcon from './components/common/GameIcon.vue'
import AmbientParticles from './components/common/AmbientParticles.vue'

const router = useRouter()
</script>

<template>
  <div class="app-wrapper">
    <div class="god-ray-layer" aria-hidden="true"></div>
    <div class="vignette-layer" aria-hidden="true"></div>
    <!-- 萤火虫粒子 -->
    <AmbientParticles />

    <header class="app-header">
      <button v-if="router.currentRoute.value.name !== 'home'" class="back-btn" @click="router.back()">
        <span class="back-arrow">&larr;</span>
      </button>
      <h1 class="app-title" @click="router.push('/')">
        <GameIcon name="crossed-swords" size="1.2rem" />
        异世界重生模拟器
      </h1>
      <button class="achievement-btn" @click="router.push('/achievements')">
        <GameIcon name="trophy" size="1.2rem" />
      </button>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
/* 上帝光 — 实色渐变 + screen 混合 */
.god-ray-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 86vh;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  background:
    radial-gradient(
      ellipse 46% 64% at 50% 0%,
      var(--stage-light-core) 0%,
      var(--stage-light-core) 6%,
      var(--stage-light-soft) 18%,
      var(--stage-light-mid) 38%,
      rgb(0 0 0) 80%
    ),
    radial-gradient(
      ellipse 80% 96% at 50% -2%,
      var(--stage-light-soft) 0%,
      var(--stage-light-mid) 24%,
      rgb(0 0 0) 78%
    ),
    radial-gradient(
      ellipse 120% 60% at 50% 0%,
      var(--stage-light-mid) 0%,
      rgb(0 0 0) 72%
    );
  background-repeat: no-repeat;
  will-change: opacity;
  animation: godRayBreathing 8s ease-in-out infinite;
}

/* 暗角 — 实色渐变 + multiply 混合 */
.vignette-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
  background: radial-gradient(
    ellipse 138% 108% at 50% 42%,
    rgb(255 255 255) 42%,
    var(--stage-vignette-mid) 74%,
    var(--stage-vignette-edge) 100%
  );
}

/* 噪声抖动层 — 覆盖全屏，用高频灰度噪声打破渐变色带 */
.app-wrapper::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.035;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  isolation: isolate;
  background: var(--bg-main);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

/* header 底部金色装饰线 */
.app-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-primary-dark) 30%,
    var(--color-primary) 50%,
    var(--color-primary-dark) 70%,
    transparent
  );
  opacity: 0.5;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 1.2rem;
  transition: all var(--transition-fast);
}
.back-btn:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}
.back-btn:empty {
  visibility: hidden;
}

.app-title {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-title);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-gold);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
  letter-spacing: 1px;
}

.achievement-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-gold);
  transition: all var(--transition-fast);
}
.achievement-btn:hover {
  background: var(--bg-card);
}

.app-main {
  flex: 1;
}

/* 路由切换动画 — 魔法闪现 */
.fade-enter-active {
  transition: opacity 0.35s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.35s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
.fade-leave-active {
  transition: opacity 0.2s ease,
              filter 0.2s ease,
              transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  filter: blur(3px) brightness(1.3);
  transform: scale(0.97);
}
.fade-leave-to {
  opacity: 0;
  filter: blur(2px) brightness(0.8);
  transform: scale(0.98);
}
</style>
