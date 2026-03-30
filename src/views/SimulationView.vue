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

// 存档面板状态
const showSavePanel = ref(false)
const saveMessage = ref('')

onMounted(() => {
  // store 中有匹配的 state → 正常继续
  if (gameStore.state && gameStore.state.meta.playId === props.playId) {
    if (state.value?.phase === 'simulating') {
      advanceToNextInteraction()
    }
    return
  }

  // store 为空（页面刷新了） → 尝试从自动存档恢复
  if (gameStore.hasAutoSave()) {
    const ok = gameStore.loadSave(0)
    if (ok && gameStore.state) {
      // 存档恢复成功，更新 URL 以匹配存档的 playId
      if (gameStore.state.meta.playId !== props.playId) {
        router.replace({
          name: 'play',
          params: { worldId: props.worldId, playId: gameStore.state.meta.playId },
        })
      }
      if (state.value?.phase === 'simulating') {
        advanceToNextInteraction()
      }
      return
    }
  }

  // 没有存档也无法恢复 → 回首页
  router.replace('/')
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
      if ((state.value?.phase as string) === 'finished') {
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

/** 保存到指定槽位 */
function saveGame(slotId: number) {
  const ok = gameStore.saveToSlot(slotId)
  saveMessage.value = ok ? `已保存到存档 ${slotId}` : '保存失败'
  setTimeout(() => { saveMessage.value = '' }, 2000)
}
</script>

<template>
  <div v-if="state && world" class="simulation-page">
    <!-- 顶栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="router.replace('/')">◁ 返回</button>
      <span class="year-label">第 {{ state.age }} 年</span>
      <button class="save-btn" @click="showSavePanel = !showSavePanel">存档</button>
    </div>

    <!-- 存档面板 -->
    <div v-if="showSavePanel" class="save-panel">
      <div class="save-panel-title">保存游戏</div>
      <div class="save-slot-list">
        <button
          v-for="i in 3"
          :key="i"
          class="save-slot-btn"
          @click="saveGame(i)"
        >存档 {{ i }}</button>
      </div>
      <div v-if="saveMessage" class="save-msg">{{ saveMessage }}</div>
    </div>

    <!-- 紧凑状态栏 -->
    <CompactStatus :state="state" :world="world" />

    <!-- 可滚动中间区域 -->
    <div class="sim-scroll-area">
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
    </div>

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

.sim-scroll-area {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 顶栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: var(--space-xs);
  -webkit-tap-highlight-color: transparent;
}

.year-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-gold);
}

/* 继续按钮栏 */
.continue-bar {
  padding: 6px 16px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.continue-btn {
  min-height: 44px;
  min-width: 160px;
  padding: 8px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
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

/* 保存按钮 */
.save-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.72rem;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.save-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}

/* 存档面板 */
.save-panel {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.save-panel-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.save-slot-list {
  display: flex;
  gap: var(--space-sm);
}

.save-slot-btn {
  flex: 1;
  padding: var(--space-xs);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.save-slot-btn:hover {
  border-color: var(--color-primary);
}

.save-slot-btn:active {
  transform: scale(0.96);
}

.save-msg {
  font-size: 0.75rem;
  color: var(--color-success);
  text-align: center;
  margin-top: var(--space-xs);
}
</style>
