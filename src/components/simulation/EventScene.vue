<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'
import type { WorldEventDef, EventLogEntry } from '@/engine/core/types'

const props = defineProps<{
  event: WorldEventDef | null
  logEntry?: EventLogEntry
  yearPhase: 'awaiting_choice' | 'showing_event' | 'mundane_year' | null
  riskRolled?: boolean
  isSuccess?: boolean
}>()

const emit = defineEmits<{
  typingDone: []
}>()

const { displayed, isTyping, type, skip, reset } = useTypewriter(35)

watch(() => props.event, async (newEvent) => {
  reset()
  if (newEvent) {
    await type(newEvent.description)
    emit('typingDone')
  }
}, { immediate: true })

watch(() => props.yearPhase, (phase) => {
  if (phase === 'mundane_year') {
    reset()
    type('什么特别的事都没发生，平平淡淡地度过了。').then(() => emit('typingDone'))
  }
})

function handleClick() {
  if (isTyping.value) {
    skip()
    emit('typingDone')
  }
}
</script>

<template>
  <div class="event-scene" @click="handleClick">
    <!-- 年度标题 -->
    <div v-if="logEntry" class="year-title">
      {{ logEntry.age }} 岁
    </div>

    <!-- 事件卡片 -->
    <div v-if="event" class="event-card">
      <div class="event-title">{{ event.title }}</div>
      <div class="event-desc">{{ displayed }}<span v-if="isTyping" class="cursor">|</span></div>
    </div>

    <!-- 平淡年 -->
    <div v-else-if="yearPhase === 'mundane_year'" class="mundane-card">
      <div class="mundane-title">平静的一年</div>
      <div class="event-desc">{{ displayed }}<span v-if="isTyping" class="cursor">|</span></div>
    </div>

    <!-- 效果反馈 -->
    <div v-if="logEntry && logEntry.effects.length > 0" class="effects-row">
      <!-- 风险判定结果标记 -->
      <div v-if="riskRolled" class="risk-result" :class="isSuccess ? 'risk-success' : 'risk-failure'">
        <span v-if="isSuccess">✨ 成功！</span>
        <span v-else>💔 失败...</span>
      </div>
      <span
        v-for="(eff, i) in logEntry.effects"
        :key="i"
        class="effect-chip"
        :class="eff.includes('-') ? 'negative' : 'positive'"
      >
        {{ eff }}
      </span>
    </div>

    <!-- 点击提示 -->
    <div v-if="isTyping" class="skip-hint">点击跳过</div>
  </div>
</template>

<style scoped>
.event-scene {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg) var(--space-md);
  min-height: 200px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.year-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-gold);
  margin-bottom: var(--space-md);
  letter-spacing: 2px;
  opacity: 0.8;
}

.event-card, .mundane-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 100%;
  max-width: 440px;
  min-height: 120px;
  box-shadow: var(--shadow-card);
}

.event-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.mundane-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.event-desc {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.cursor {
  animation: blink 0.8s infinite;
  color: var(--color-primary-light);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.effects-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: var(--space-md);
  justify-content: center;
}

.effect-chip {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}
.effect-chip.positive {
  background: rgba(74, 222, 128, 0.12);
  color: var(--color-success);
}
.effect-chip.negative {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.risk-result {
  width: 100%;
  text-align: center;
  font-size: 1rem;
  font-weight: 800;
  padding: 8px 0 4px;
  letter-spacing: 2px;
}
.risk-result.risk-success {
  color: var(--color-success, #4ade80);
}
.risk-result.risk-failure {
  color: var(--color-danger, #ef4444);
}

.skip-hint {
  margin-top: var(--space-md);
  font-size: 0.7rem;
  color: var(--text-dim);
}
</style>
