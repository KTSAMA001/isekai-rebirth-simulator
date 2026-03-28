<script setup lang="ts">
import type { EventLogEntry, WorldInstance } from '@/engine/core/types'
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  entries: EventLogEntry[]
  world: WorldInstance
}>()

const emit = defineEmits<{
  branchSelect: [eventId: string, branchId: string]
}>()

const logContainer = ref<HTMLElement | null>(null)

// 按年龄分组
const grouped = computed(() => {
  const groups: { age: number; entries: EventLogEntry[] }[] = []
  let currentAge = -1
  for (const entry of props.entries) {
    if (entry.age !== currentAge) {
      currentAge = entry.age
      groups.push({ age: currentAge, entries: [] })
    }
    groups[groups.length - 1].entries.push(entry)
  }
  return groups
})

// 自动滚动到底部
watch(() => props.entries.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})
</script>

<template>
  <div class="event-log" ref="logContainer">
    <div v-if="entries.length === 0" class="log-empty">
      <p class="text-muted">等待命运的齿轮转动...</p>
    </div>
    <div v-for="group in grouped" :key="group.age" class="age-group">
      <div class="age-divider">
        <span class="age-badge">{{ group.age }} 岁</span>
      </div>
      <div v-for="entry in group.entries" :key="`${entry.age}-${entry.eventId}-${entry.branchId}`" class="event-card animate-slide-up">
        <div class="event-title">{{ entry.title }}</div>
        <div class="event-desc">{{ entry.description }}</div>
        <div v-if="entry.effects.length > 0" class="event-effects">
          <span
            v-for="(eff, i) in entry.effects"
            :key="i"
            class="effect-chip"
            :class="eff.startsWith('-') ? 'negative' : 'positive'"
          >
            {{ eff }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-log {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  scroll-behavior: smooth;
}

.log-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.age-group {
  margin-bottom: var(--space-sm);
}

.age-divider {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: var(--space-md) 0 var(--space-sm);
}

.age-divider::before,
.age-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.age-badge {
  padding: 2px 12px;
  background: rgba(251, 191, 36, 0.1);
  color: var(--text-gold);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.event-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
}

.event-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.event-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.event-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.effect-chip {
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
}
.effect-chip.positive {
  background: rgba(74, 222, 128, 0.1);
  color: var(--color-success);
}
.effect-chip.negative {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
</style>
