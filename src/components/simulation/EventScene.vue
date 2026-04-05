<script setup lang="ts">
import { watch } from 'vue'
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
  typingStateChange: [value: boolean]
}>()

const { displayed, isTyping, type, skip, reset } = useTypewriter(35)

function skipTyping() {
  skip()
}

defineExpose({
  skipTyping,
})

watch(isTyping, (value, oldValue) => {
  emit('typingStateChange', value)
  if (oldValue && !value) {
    emit('typingDone')
  }
})

watch(() => props.event, async (newEvent) => {
  reset()
  if (newEvent) {
    await type(newEvent.description)
  }
}, { immediate: true })

watch(() => props.yearPhase, (phase) => {
  if (phase === 'mundane_year') {
    reset()
    void type('什么特别的事都没发生，平平淡淡地度过了。')
  }
})
</script>

<template>
  <div class="event-scene">
    <!-- 年度标题 -->
    <div v-if="logEntry" class="year-title">
      {{ logEntry.age }} 岁
    </div>

    <!-- 事件卡片 -->
    <div v-if="event" class="event-card">
      <div class="event-title">{{ event.title }}</div>
      <div class="event-desc">{{ displayed }}</div>
    </div>

    <!-- 平淡年 -->
    <div v-else-if="yearPhase === 'mundane_year'" class="mundane-card">
      <div class="mundane-title">平静的一年</div>
      <div class="event-desc">{{ displayed }}</div>
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
  </div>
</template>

<style scoped>
.event-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
}

.year-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-gold);
  margin-bottom: 2px;
  letter-spacing: 2px;
  opacity: 0.8;
}

.event-card, .mundane-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-card);
}

.event-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 2px;
  text-align: center;
}

.mundane-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 2px;
  text-align: center;
}

.event-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.effects-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  justify-content: center;
}

.effect-chip {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
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
  font-size: 0.85rem;
  font-weight: 800;
  padding: 4px 0;
  letter-spacing: 2px;
}
.risk-result.risk-success {
  color: var(--color-success, #4ade80);
}
.risk-result.risk-failure {
  color: var(--color-danger, #ef4444);
}
</style>
