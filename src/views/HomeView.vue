<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useWorldStore } from '@/stores/worldStore'

const router = useRouter()
const worldStore = useWorldStore()

function startGame(worldId: string) {
  worldStore.selectWorld(worldId)
  router.push({ name: 'setup', params: { worldId } })
}
</script>

<template>
  <div class="page-container home">
    <!-- 英雄区 -->
    <section class="hero">
      <div class="hero-glow"></div>
      <h2 class="hero-title animate-fade-in">
        <span class="hero-emoji">🌍</span>
        <br />
        转生吧
      </h2>
      <p class="hero-subtitle animate-slide-up">
        在异世界开始你的第二人生
      </p>
    </section>

    <!-- 世界选择 -->
    <section class="world-section">
      <h3 class="section-title">选择你的世界</h3>
      <div class="world-list">
        <div
          v-for="world in worldStore.worlds"
          :key="world.manifest.id"
          class="world-card card card-glow stagger-item"
          @click="startGame(world.manifest.id)"
        >
          <div class="world-icon">{{ world.manifest.icon }}</div>
          <div class="world-info">
            <h4 class="world-name">{{ world.manifest.name }}</h4>
            <p class="world-subtitle">{{ world.manifest.subtitle }}</p>
            <p class="world-desc">{{ world.manifest.description }}</p>
            <div class="world-tags">
              <span v-for="tag in world.manifest.tags" :key="tag" class="world-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="world-arrow">&rarr;</div>
        </div>
      </div>
    </section>

    <!-- 底部信息 -->
    <footer class="home-footer">
      <p class="text-muted text-sm text-center">
        Phase 1 MVP &middot; 剑与魔法
      </p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

/* 英雄区 */
.hero {
  text-align: center;
  padding: var(--space-2xl) 0 var(--space-xl);
  position: relative;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-sm);
}

.hero-title {
  font-family: var(--font-title);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-gold);
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  margin-bottom: var(--space-sm);
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 世界列表 */
.section-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  padding-left: var(--space-xs);
}

.world-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.world-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  padding: var(--space-lg);
  position: relative;
  overflow: hidden;
}

.world-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
  pointer-events: none;
}

.world-card:active {
  transform: scale(0.98);
}

.world-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 56px;
  text-align: center;
}

.world-info {
  flex: 1;
  min-width: 0;
}

.world-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.world-subtitle {
  font-size: 0.85rem;
  color: var(--text-gold);
  margin-bottom: 4px;
}

.world-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.world-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: var(--space-sm);
}

.world-tag {
  padding: 1px 8px;
  background: rgba(139, 92, 246, 0.1);
  color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
}

.world-arrow {
  font-size: 1.2rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.home-footer {
  margin-top: var(--space-2xl);
}
</style>
