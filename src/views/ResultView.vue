<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'
import { useProgressStore } from '@/stores/progressStore'
import FinalGrade from '@/components/result/FinalGrade.vue'
import { exportAsJSON, exportAsText, copyChronicleToClipboard, copyTextToClipboard } from '@/utils/export'
import { generateStorySource } from '@/utils/story'

const props = defineProps<{
  worldId: string
  playId: string
}>()

const router = useRouter()
const gameStore = useGameStore()
const worldStore = useWorldStore()
const progressStore = useProgressStore()

const world = computed(() => worldStore.worlds.find(w => w.manifest.id === props.worldId))
const state = computed(() => gameStore.state)
const result = computed(() => state.value?.result)

// 人生评价
const evaluations = computed(() => result.value?.evaluations ?? [])

const showContent = ref(false)

onMounted(() => {
  if (!gameStore.state || gameStore.state.meta.playId !== props.playId) {
    router.replace('/')
    return
  }
  // 记录本局进度（解锁预设用）
  if (gameStore.state.phase === 'finished') {
    progressStore.recordGameCompletion(
      gameStore.state.meta.playId,
      gameStore.state.achievements.unlocked,
    )
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

const chronicleEntries = computed(() => state.value?.eventLog ?? [])

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

function rarityEmoji(r: string): string {
  return { common: '✦', rare: '✧', legendary: '♛' }[r] ?? '✦'
}

// 导出功能
const copySuccess = ref(false)
const storySourceCopied = ref(false)

const storySource = computed(() => {
  if (!state.value || !world.value) return ''
  return generateStorySource(state.value, world.value)
})

function handleExportJSON() {
  if (!state.value) return
  exportAsJSON(state.value)
}

function handleExportText() {
  if (!state.value) return
  exportAsText(state.value, world.value)
}

async function handleCopyChronicle() {
  if (!state.value) return
  const ok = await copyChronicleToClipboard(state.value, world.value)
  if (ok) {
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  }
}

async function handleCopyStorySource() {
  if (!storySource.value) return
  const ok = await copyTextToClipboard(storySource.value)
  if (ok) {
    storySourceCopied.value = true
    setTimeout(() => { storySourceCopied.value = false }, 2000)
  }
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
                width: (stat.peak / Math.max(stat.max, stat.peak, 1) * 100) + '%',
                background: stat.color,
              }"
            ></div>
          </div>
          <span class="peak-val" :style="{ color: stat.color }">{{ stat.peak }}</span>
        </div>
      </div>
    </section>

    <!-- 人生回顾 -->
    <section v-if="chronicleEntries.length > 0" class="section">
      <h3 class="section-title">人生编年史</h3>
      <div class="timeline">
        <div v-for="(evt, i) in chronicleEntries" :key="`${evt.eventId}-${i}`" class="timeline-item">
          <div class="timeline-age">{{ evt.age }}岁</div>
          <div class="timeline-content">
            <div class="timeline-title">{{ evt.title }}</div>
            <div v-if="evt.description" class="timeline-desc">{{ evt.description }}</div>
            <div v-if="evt.branchTitle" class="timeline-branch">选择：{{ evt.branchTitle }}</div>
            <div v-if="evt.branchDescription" class="timeline-branch-desc">{{ evt.branchDescription }}</div>
            <div v-if="evt.resultText" class="timeline-result" :class="evt.riskRolled ? (evt.isSuccess ? 'success' : 'failure') : ''">
              {{ evt.resultText }}
            </div>
            <div v-if="evt.effects.length > 0" class="timeline-effects">
              <span
                v-for="(effect, effectIndex) in evt.effects"
                :key="effectIndex"
                class="timeline-effect-chip"
                :class="effect.includes('-') ? 'negative' : 'positive'"
              >
                {{ effect }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 人生评价 -->
    <section v-if="evaluations.length > 0" class="section">
      <h3 class="section-title">人生评价</h3>
      <div class="eval-list">
        <div
          v-for="eva in evaluations"
          :key="eva.id"
          class="eval-item card"
          :class="`rarity-${eva.rarity}`"
        >
          <div class="eval-rarity">{{ rarityEmoji(eva.rarity) }}</div>
          <div class="eval-content">
            <div class="eval-title">{{ eva.title }}</div>
            <div class="eval-desc">{{ eva.description }}</div>
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

    <!-- 导出功能 -->
    <section class="section">
      <h3 class="section-title">导出回放</h3>
      <div class="export-grid">
        <button class="btn btn-export" @click="handleCopyChronicle">
          {{ copySuccess ? '✓ 已复制' : '📋 复制编年史' }}
        </button>
        <button class="btn btn-export" @click="handleExportText">
          📝 导出文本
        </button>
        <button class="btn btn-export" @click="handleExportJSON">
          📦 导出存档
        </button>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">AI 故事生成</h3>
      <p class="section-hint">
        复制世界书与编年史后，粘贴到任意 AI 对话程序（如 ChatGPT、Claude、通义千问等）即可生成完整的异世界人生故事。
      </p>

      <div class="export-grid">
        <button class="btn btn-export" @click="handleCopyStorySource">
          {{ storySourceCopied ? '✓ 已复制' : '📚 复制世界书+编年史' }}
        </button>
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

.section-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-sm);
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
  --timeline-age-col: 56px;
  --timeline-gap: 16px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: calc(var(--timeline-age-col) + 10px);
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: var(--timeline-age-col) minmax(0, 1fr);
  column-gap: var(--timeline-gap);
  align-items: start;
  margin-bottom: var(--space-md);
}

.timeline-age {
  position: relative;
  width: auto;
  text-align: right;
  font-size: 0.78rem;
  line-height: 1.2;
  color: var(--text-gold);
  font-weight: 600;
  white-space: nowrap;
  padding-top: 2px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: calc(var(--timeline-age-col) + 10px);
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  transform: translateX(-50%);
}

.timeline-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  min-width: 0;
}

.timeline-title {
  font-size: 0.85rem;
  font-weight: 600;
}

.timeline-desc,
.timeline-branch-desc,
.timeline-result {
  margin-top: 6px;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.timeline-branch {
  margin-top: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-gold);
}

.timeline-result.success {
  color: var(--color-success);
}

.timeline-result.failure {
  color: var(--color-danger);
}

.timeline-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.timeline-effect-chip {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
}

.timeline-effect-chip.positive {
  background: rgba(74, 222, 128, 0.12);
  color: var(--color-success);
}

.timeline-effect-chip.negative {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

@media (max-width: 640px) {
  .timeline {
    --timeline-age-col: 46px;
    --timeline-gap: 12px;
  }

  .timeline::before,
  .timeline-item::before {
    left: calc(var(--timeline-age-col) + 8px);
  }

  .timeline-age {
    font-size: 0.72rem;
  }
}

/* 人生评价 */
.eval-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.eval-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-left: 3px solid var(--border-color);
}

.eval-item.rarity-common { border-left-color: #888; }
.eval-item.rarity-rare { border-left-color: #6ea8fe; }
.eval-item.rarity-legendary { border-left-color: #ffd700; }

.eval-rarity {
  font-size: 1.2rem;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
  line-height: 2.4;
}

.eval-content { flex: 1; }

.eval-title {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.eval-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
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

/* 导出按钮 */
.export-grid {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.btn-export {
  flex: 1;
  min-width: 100px;
  padding: var(--space-sm) var(--space-md);
  font-size: 0.8rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-export:active {
  transform: scale(0.97);
}
</style>
