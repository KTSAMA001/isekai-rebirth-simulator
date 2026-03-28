<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="app-wrapper">
    <header class="app-header">
      <button v-if="router.currentRoute.value.name !== 'home'" class="back-btn" @click="router.back()">
        <span class="back-arrow">&larr;</span>
      </button>
      <h1 class="app-title" @click="router.push('/')">
        <span class="title-icon">⚔️</span>
        异世界重生模拟器
      </h1>
      <button class="achievement-btn" @click="router.push('/achievements')">
        🏆
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
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  background: var(--bg-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
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
}

.title-icon {
  font-size: 1.1rem;
}

.achievement-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 1.2rem;
  transition: all var(--transition-fast);
}
.achievement-btn:hover {
  background: var(--bg-card);
}

.app-main {
  flex: 1;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
