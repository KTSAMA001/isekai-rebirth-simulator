<script setup lang="ts">
import { computed } from 'vue'
import { useWorldStore } from '@/stores/worldStore'

const worldStore = useWorldStore()

// 目前只有一个世界
const world = computed(() => worldStore.worlds[0])

// 按分类分组
const categorized = computed(() => {
  if (!world.value) return {}
  const map: Record<string, typeof world.value.achievements> = {}
  for (const ach of world.value.achievements) {
    const cat = ach.category || '其他'
    if (!map[cat]) map[cat] = []
    map[cat].push(ach)
  }
  return map
})
</script>

<template>
  <div class="page-container achievements">
    <h2 class="title title-lg text-center mb-lg">成就殿堂</h2>

    <div v-if="!world" class="text-center text-muted">
      <p>暂无世界数据</p>
    </div>

    <div v-else class="categories">
      <section v-for="(achList, cat) in categorized" :key="cat" class="category">
        <h3 class="cat-title">{{ cat }}</h3>
        <div class="ach-grid">
          <div
            v-for="ach in achList"
            :key="ach.id"
            class="ach-card card"
            :class="{ locked: ach.hidden }"
          >
            <div class="ach-icon">{{ ach.hidden ? '❓' : ach.icon }}</div>
            <div class="ach-info">
              <div class="ach-name">{{ ach.hidden ? '???' : ach.name }}</div>
              <div class="ach-desc">{{ ach.hidden ? '隐藏成就' : ach.description }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="text-center mt-lg">
      <p class="text-xs text-muted">完成游戏以解锁更多成就</p>
    </div>
  </div>
</template>

<style scoped>
.achievements {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

.categories {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.cat-title {
  font-family: var(--font-title);
  font-size: 1rem;
  color: var(--text-gold);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}

.ach-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ach-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
}

.ach-card.locked {
  opacity: 0.5;
}

.ach-icon {
  font-size: 1.8rem;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.ach-info {
  flex: 1;
}

.ach-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.ach-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
</style>
