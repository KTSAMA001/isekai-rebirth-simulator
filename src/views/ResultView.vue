<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'
import FinalGrade from '@/components/result/FinalGrade.vue'

const props = defineProps<{
  worldId: string
  playId: string
}>()

const router = useRouter()
const gameStore = useGameStore()
const worldStore = useWorldStore()

const world = computed(() => worldStore.worlds.find(w => w.manifest.id === props.worldId))
const state = computed(() => gameStore.state)
const result = computed(() => state.value?.result)

const showContent = ref(false)

onMounted(() => {
  if (!gameStore.state || gameStore.state.meta.playId !== props.playId) {
    router.replace('/')
    return
  }
  setTimeout(() => { showContent.value = true }, 300)
})

// 属性峰值
const peakStats = computed(() => {
  if (!state.value || !world.value) return []
  return world.value.attributes
    .filter(a => !a.hidden)
    .map(attr => ({
      id: attr.id,
      name: attr.name,
      icon: attr.icon,
      color: attr.color,
      max: attr.max,
      peak: state.value!.attributePeaks[attr.id] ?? 0,
      current: state.value!.attributes[attr.id] ?? 0,
    }))
})

// 关键事件（选取有意义的）
const keyEvents = computed(() => {
  if (!state.value) return []
  return state.value.eventLog.filter((_, i) => {
    // 每隔几个取一个，或取最后几个
    const total = state.value!.eventLog.length
    if (total <= 10) return true
    return i < 3 || i > total - 4 || i % Math.floor(total / 8) === 0
  })
})

// 已解锁成就
const unlockedAchievements = computed(() => {
  if (!state.value || !world.value) return []
  return state.value.achievements.unlocked
    .map(id => world.value!.achievements.find(a => a.id === id))
    .filter(Boolean)
})

function playAgain() {
  gameStore.resetGame()
  router.push({ name: 'setup', params: { worldId: props.worldId } })
}

function goHome() {
  gameStore.resetGame()
  router.push('/')
}
</script>

<template>
  <div v-if="state && result && world && showContent" class="page-container result-page">
    <!-- 评级展示 -->
    <FinalGrade
      :grade="result.grade"
      :title="result.gradeTitle"
      :description="result.gradeDescription"
      :score="result.score"
    />

    <!-- 人生信息 -->
    <div class="info-bar">
      <div class="info-item">
        <span class="info-val">{{ state.character.name }}</span>
        <span class="info-label">名字</span>
      </div>
      <div class="info-item">
        <span class="info-val">{{ result.lifespan }} 岁</span>
        <span class="info-label">享年</span>
      </div>
      <div class="info-item">
        <span class="info-val">{{ state.eventLog.length }}</span>
        <span class="info-label">事件</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 属性峰值 -->
    <section class="section">
      <h3 class="section-title">属性峰值</h3>
      <div class="peak-grid">
        <div v-for="stat in peakStats" :key="stat.id" class="peak-item">
          <span class="peak-icon">{{ stat.icon }}</span>
          <span class="peak-name">{{ stat.name }}</span>
          <div class="peak-bar">
            <div
              class="peak-fill"
              :style="{
                width: (stat.peak / stat.max * 100) + '%',
                background: stat.color,
              }"
            ></div>
          </div>
          <span class="peak-val" :style="{ color: stat.color }">{{ stat.peak }}</span>
        </div>
      </div>
    </section>

    <!-- 人生回顾 -->
    <section v-if="keyEvents.length > 0" class="section">
      <h3 class="section-title">人生回顾</h3>
      <div class="timeline">
        <div v-for="(evt, i) in keyEvents" :key="i" class="timeline-item">
          <div class="timeline-age">{{ evt.age }}岁</div>
          <div class="timeline-content">
            <div class="timeline-title">{{ evt.title }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 成就 -->
    <section v-if="unlockedAchievements.length > 0" class="section">
      <h3 class="section-title">解锁成就</h3>
      <div class="achieve-list">
        <div v-for="ach in unlockedAchievements" :key="ach!.id" class="achieve-item card">
          <span class="achieve-icon">{{ ach!.icon }}</span>
          <div>
            <div class="achieve-name">{{ ach!.name }}</div>
            <div class="achieve-desc">{{ ach!.description }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 操作 -->
    <div class="result-actions">
      <button class="btn btn-gold btn-block" @click="playAgain">再来一局</button>
      <button class="btn btn-ghost btn-block mt-md" @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  padding-top: var(--space-md);
  padding-bottom: var(--space-2xl);
}

/* 信息栏 */
.info-bar {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  padding: var(--space-md) 0;
}

.info-item {
  text-align: center;
}

.info-val {
  display: block;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* 通用 section */
.section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-family: var(--font-title);
  font-size: 1rem;
  color: var(--text-gold);
  margin-bottom: var(--space-md);
}

/* 属性峰值 */
.peak-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.peak-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.peak-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.peak-name {
  width: 36px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.peak-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.peak-fill {
  height: 100%;
  border-radius: 3px;
}

.peak-val {
  min-width: 24px;
  text-align: right;
  font-weight: 700;
  font-size: 0.9rem;
}

/* 人生回顾时间线 */
.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: var(--space-md);
}

.timeline-age {
  position: absolute;
  left: -40px;
  width: 28px;
  text-align: right;
  font-size: 0.7rem;
  color: var(--text-gold);
  font-weight: 600;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -27px;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}

.timeline-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
}

.timeline-title {
  font-size: 0.85rem;
  font-weight: 600;
}

/* 成就 */
.achieve-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.achieve-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
}

.achieve-icon {
  font-size: 1.5rem;
}

.achieve-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.achieve-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 操作按钮 */
.result-actions {
  margin-top: var(--space-2xl);
}
</style>
