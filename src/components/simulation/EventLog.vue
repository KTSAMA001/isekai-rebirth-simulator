<script setup lang="ts">
import type { EventLogEntry, WorldInstance } from '@/engine/core/types'
import { computed, ref } from 'vue'

const props = defineProps<{
  entries: EventLogEntry[]
  world: WorldInstance
}>()

const expanded = ref(false)

// 默认只显示最近 3 年
const visibleEntries = computed(() => {
  if (expanded.value) return props.entries
  return props.entries.slice(-3)
})

// 按年龄分组
const grouped = computed(() => {
  const groups: { age: number; entries: EventLogEntry[] }[] = []
  let currentAge = -1
  for (const entry of visibleEntries.value) {
    if (entry.age !== currentAge) {
      currentAge = entry.age
      groups.push({ age: currentAge, entries: [] })
    }
    groups[groups.length - 1].entries.push(entry)
  }
  return groups
})

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="event-log-compact">
    <div class="log-header" @click="toggleExpand">
      <span class="log-title">📜 历史事件</span>
      <span class="log-toggle">{{ expanded ? '收起 ▲' : `展开 (${entries.length}) ▼` }}</span>
    </div>

    <div v-if="expanded" class="log-body">
      <div v-if="entries.length === 0" class="log-empty">
        <p class="text-muted">等待命运的齿轮转动...</p>
      </div>
      <div v-for="group in grouped" :key="group.age" class="age-group">
        <div class="age-divider">
          <span class="age-badge">{{ group.age }} 岁</span>
        </div>
        <div v-for="entry in group.entries" :key="`${entry.age}-${entry.eventId}-${entry.branchId}`" class="event-item">
          <div class="event-title">{{ entry.title }}</div>
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

    <!-- 折叠时简要显示 -->
    <div v-else class="log-summary">
      <span v-for="entry in visibleEntries.slice(-3)" :key="`${entry.age}-${entry.eventId}`" class="summary-chip">
        {{ entry.age }}岁: {{ entry.title }}
      </span>
      <span v-if="entries.length === 0" class="summary-chip text-muted">暂无</span>
    </div>
  </div>
</template>

<style scoped>
.event-log-compact {
  background: var(--bg-panel);
  border-top: 1px solid var(--border-color);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.log-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.log-toggle {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.log-body {
  max-height: 200px;
  overflow-y: auto;
  padding: 0 var(--space-md) var(--space-md);
}

.log-empty {
  text-align: center;
  padding: var(--space-md);
  color: var(--text-muted);
  font-size: 0.8rem;
}

.age-group {
  margin-bottom: var(--space-xs);
}

.age-divider {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin: var(--space-xs) 0;
}

.age-divider::before,
.age-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.age-badge {
  padding: 1px 8px;
  background: rgba(251, 191, 36, 0.1);
  color: var(--text-gold);
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}

.event-item {
  padding: var(--space-xs) 0;
}

.event-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.event-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
}

.effect-chip {
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
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

/* 折叠摘要 */
.log-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 var(--space-md) var(--space-sm);
}

.summary-chip {
  font-size: 0.7rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}
</style>
