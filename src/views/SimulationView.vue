<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'
import CompactStatus from '@/components/simulation/CompactStatus.vue'
import EventScene from '@/components/simulation/EventScene.vue'
import ChoicePanel from '@/components/simulation/ChoicePanel.vue'
import EventLog from '@/components/simulation/EventLog.vue'
import type { YearResult } from '@/engine/core/types'

const props = defineProps<{
  worldId: string
  playId: string
}>()

const router = useRouter()
const gameStore = useGameStore()
const worldStore = useWorldStore()

const world = computed(() => worldStore.worlds.find(w => w.manifest.id === props.worldId))
const state = computed(() => gameStore.state)

// 当前年度状态
const currentYearResult = ref<YearResult | null>(null)
const currentEvent = computed(() => currentYearResult.value?.event ?? null)
const currentBranches = computed(() => currentYearResult.value?.branches ?? [])
const yearPhase = computed(() => currentYearResult.value?.phase ?? null)

// 年度日志（用于 EventScene 展示效果）
const currentLogEntry = computed(() => currentYearResult.value?.logEntry)

// 是否显示"继续"按钮
const showContinue = computed(() => {
  if (!currentYearResult.value) return false
  const phase = currentYearResult.value.phase
  return phase === 'showing_event' || phase === 'mundane_year'
})

// 是否显示选择面板
const showChoices = computed(() => {
  return currentYearResult.value?.phase === 'awaiting_choice'
})

const isFinished = computed(() => state.value?.phase === 'finished')

onMounted(() => {
  if (!gameStore.state || gameStore.state.meta.playId !== props.playId) {
    router.replace('/')
    return
  }
  // 首年自动开始
  if (state.value?.phase === 'simulating') {
    advanceToNextInteraction()
  }
})

/** 自动推进到下一个需要玩家交互的节点（事件/选择/结束） */
function advanceToNextInteraction() {
  if (!gameStore.engine || isFinished.value) return

  const MAX_ITERATIONS = 200 // 安全防护
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const result = gameStore.startYear()

    // 游戏结束（年龄上限或 HP 耗尽）
    if (state.value?.phase === 'finished') {
      currentYearResult.value = result
      checkFinished()
      return
    }

    if (result.phase === 'mundane_year') {
      // 平淡年 → 自动跳过，继续下一年
      gameStore.skipYear()
      if (state.value?.phase === 'finished') {
        currentYearResult.value = result
        checkFinished()
        return
      }
      continue
    }

    // 遇到事件（需要展示或需要选择）→ 停在这里
    currentYearResult.value = result
    checkFinished()
    return
  }
}

/** 选择分支 */
function selectBranch(branchId: string) {
  if (!gameStore.engine) return
  const result = gameStore.resolveBranch(branchId)
  currentYearResult.value = result
  checkFinished()
}

/** 继续（直接推进到下一个交互节点） */
function continueNext() {
  if (isFinished.value) {
    checkFinished()
    return
  }
  advanceToNextInteraction()
}

/** 检查是否结束 */
function checkFinished() {
  if (state.value?.phase === 'finished') {
    setTimeout(() => {
      router.replace({
        name: 'result',
        params: { worldId: props.worldId, playId: props.playId },
      })
    }, 1500)
  }
}
</script>

<template>
  <div v-if="state && world" class="simulation-page">
    <!-- 顶栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="router.replace('/')">◁ 返回</button>
      <span class="year-label">第 {{ state.age }} 年</span>
    </div>

    <!-- 紧凑状态栏 -->
    <CompactStatus :state="state" :world="world" />

    <!-- 主事件区域 -->
    <EventScene
      :event="currentEvent"
      :log-entry="currentLogEntry"
      :year-phase="yearPhase"
      :risk-rolled="currentYearResult?.riskRolled"
      :is-success="currentYearResult?.isSuccess"
      @typing-done="() => {}"
    />

    <!-- 选择面板 -->
    <ChoicePanel
      v-if="showChoices && currentBranches.length > 0"
      :branches="currentBranches"
      :state="state"
      :world="world"
      @select="selectBranch"
    />

    <!-- 继续按钮 -->
    <div v-if="showContinue" class="continue-bar">
      <button class="continue-btn" @click="continueNext">
        {{ isFinished ? '查看结局' : '继续' }}
      </button>
    </div>

    <!-- 结束状态（无当前事件时显示） -->
    <div v-if="isFinished && !currentYearResult" class="continue-bar">
      <button class="continue-btn" @click="router.replace({ name: 'result', params: { worldId: props.worldId, playId: props.playId } })">
        查看结局
      </button>
    </div>

    <!-- 折叠历史日志 -->
    <EventLog :entries="state.eventLog" :world="world" />
  </div>
</template>

<style scoped>
.simulation-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  max-width: var(--max-width);
  margin: 0 auto;
  overflow: hidden;
}

/* 顶栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  padding: var(--space-xs);
  -webkit-tap-highlight-color: transparent;
}

.year-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-gold);
}

/* 继续按钮栏 */
.continue-bar {
  padding: var(--space-md);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.continue-btn {
  min-height: 48px;
  min-width: 200px;
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.continue-btn:hover {
  background: var(--color-primary-dark);
}

.continue-btn:active {
  transform: scale(0.96);
}
</style>
