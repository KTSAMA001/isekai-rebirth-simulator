<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'
import StatusPanel from '@/components/simulation/StatusPanel.vue'
import EventLog from '@/components/simulation/EventLog.vue'
import type { EventBranch } from '@/engine/core/types'

const props = defineProps<{
  worldId: string
  playId: string
}>()

const router = useRouter()
const gameStore = useGameStore()
const worldStore = useWorldStore()

const world = computed(() => worldStore.worlds.find(w => w.manifest.id === props.worldId))
const state = computed(() => gameStore.state)

// 分支选择
const pendingBranches = ref<EventBranch[]>([])
const pendingEventId = ref('')
const pendingEventTitle = ref('')
const pendingEventDesc = ref('')
const showBranchModal = ref(false)

// 播放控制
const isPlaying = ref(false)
const speed = ref(1)
let timer: ReturnType<typeof setTimeout> | null = null

const speedOptions = [1, 2, 5]

const isFinished = computed(() => state.value?.phase === 'finished')

onMounted(() => {
  // 如果没有游戏状态，跳回首页
  if (!gameStore.state || gameStore.state.meta.playId !== props.playId) {
    router.replace('/')
    return
  }
})

onUnmounted(() => {
  stopAuto()
})

function stopAuto() {
  isPlaying.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function nextYear() {
  if (!gameStore.state || isFinished.value) return
  const currentState = gameStore.simulateYear()

  // 检查是否需要分支选择 — 当前引擎直接解析分支，
  // 这里简单处理：如果事件有分支，需要暂停让用户选
  // 但实际引擎目前自动选分支，所以直接继续
  if (currentState.phase === 'finished') {
    stopAuto()
    // 延迟跳转结算
    setTimeout(() => {
      router.replace({
        name: 'result',
        params: { worldId: props.worldId, playId: props.playId },
      })
    }, 1500)
  }
}

function togglePlay() {
  if (isPlaying.value) {
    stopAuto()
  } else {
    isPlaying.value = true
    autoStep()
  }
}

function autoStep() {
  if (!isPlaying.value || isFinished.value) {
    stopAuto()
    return
  }
  nextYear()
  const delay = Math.max(100, 1000 / speed.value)
  timer = setTimeout(autoStep, delay)
}

function setSpeed(s: number) {
  speed.value = s
}

function skipToEnd() {
  stopAuto()
  // 快速推演到结束
  const run = () => {
    if (!gameStore.state || isFinished.value) {
      router.replace({
        name: 'result',
        params: { worldId: props.worldId, playId: props.playId },
      })
      return
    }
    nextYear()
    // 用 requestAnimationFrame 避免卡死
    setTimeout(run, 20)
  }
  run()
}

function selectBranch(branchId: string) {
  showBranchModal.value = false
  // 重新推演这一年，带分支选择
  // 注意：当前引擎设计是在 simulateYear 时传 branchChoices
  // 这里简化处理，直接继续下一年的推演
  nextYear()
}
</script>

<template>
  <div v-if="state && world" class="simulation-page">
    <!-- 状态面板 -->
    <div class="sim-status">
      <StatusPanel :state="state" :world="world" />
    </div>

    <!-- 事件日志 -->
    <EventLog :entries="state.eventLog" :world="world" />

    <!-- 分支选择弹窗 -->
    <div v-if="showBranchModal" class="branch-overlay" @click.self="showBranchModal = false">
      <div class="branch-modal card animate-pop-in">
        <h3 class="branch-title">{{ pendingEventTitle }}</h3>
        <p class="branch-desc">{{ pendingEventDesc }}</p>
        <div class="branch-options">
          <button
            v-for="branch in pendingBranches"
            :key="branch.id"
            class="btn btn-ghost btn-block branch-btn"
            @click="selectBranch(branch.id)"
          >
            {{ branch.title }}
          </button>
        </div>
      </div>
    </div>

    <!-- 控制栏 -->
    <div class="controls">
      <button class="ctrl-btn" :class="{ active: isPlaying }" @click="togglePlay">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <div class="speed-group">
        <button
          v-for="s in speedOptions"
          :key="s"
          class="speed-btn"
          :class="{ active: speed === s }"
          @click="setSpeed(s)"
        >
          {{ s }}x
        </button>
      </div>
      <button class="ctrl-btn" @click="nextYear" :disabled="isFinished">⏭</button>
      <button class="ctrl-btn skip-btn" @click="skipToEnd" :disabled="isFinished">⏩</button>
    </div>
  </div>
</template>

<style scoped>
.simulation-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  max-width: var(--max-width);
  margin: 0 auto;
}

.sim-status {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}

/* 控制栏 */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--bg-panel);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.ctrl-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  font-size: 1.1rem;
  transition: all var(--transition-fast);
}
.ctrl-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
}
.ctrl-btn:active:not(:disabled) {
  transform: scale(0.92);
}
.ctrl-btn.active {
  border-color: var(--color-primary);
  background: rgba(139, 92, 246, 0.15);
}
.ctrl-btn:disabled {
  opacity: 0.3;
}

.speed-group {
  display: flex;
  gap: 4px;
}

.speed-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.speed-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  background: rgba(139, 92, 246, 0.15);
}

.skip-btn {
  font-size: 0.9rem;
}

/* 分支选择弹窗 */
.branch-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.branch-modal {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.branch-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.branch-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

.branch-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.branch-btn {
  text-align: left;
}
</style>
