<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WorldAttributeDef, WorldTalentDef } from '@/engine/core/types'

const props = defineProps<{
  attributes: WorldAttributeDef[]
  talents: WorldTalentDef[]
  totalPoints: number
  baseValues: Record<string, number>
  talentBonuses: Record<string, number>
  talentPenalty: number
}>()

const emit = defineEmits<{
  confirm: [allocation: Record<string, number>]
}>()

// 已分配的点数
const allocation = ref<Record<string, number>>({})

const allocated = computed(() => {
  return Object.values(allocation.value).reduce((s, v) => s + v, 0)
})

const remaining = computed(() => props.totalPoints - allocated.value)

function getDisplayValue(attrId: string): number {
  const base = props.baseValues[attrId] ?? 0
  const alloc = allocation.value[attrId] ?? 0
  return base + alloc
}

function getBonus(attrId: string): number {
  return props.talentBonuses[attrId] ?? 0
}

function increment(attrId: string) {
  if (remaining.value <= 0) return
  const current = allocation.value[attrId] ?? 0
  const attr = props.attributes.find(a => a.id === attrId)
  if (!attr) return
  const totalNow = getDisplayValue(attrId)
  if (totalNow >= attr.max) return
  allocation.value = { ...allocation.value, [attrId]: current + 1 }
}

function decrement(attrId: string) {
  const current = allocation.value[attrId] ?? 0
  if (current <= 0) return
  allocation.value = { ...allocation.value, [attrId]: current - 1 }
}

function confirm() {
  if (remaining.value < 0) return
  emit('confirm', { ...allocation.value })
}
</script>

<template>
  <div class="attr-allocate">
    <div class="allocate-header">
      <h3 class="title title-md">分配属性</h3>
      <div class="points-display">
        剩余点数:
        <span class="points-num" :class="{ warn: remaining === 0, danger: remaining < 0 }">
          {{ remaining }}
        </span>
        <span v-if="talentPenalty > 0" class="penalty-hint">（天赋扣减 -{{ talentPenalty }}）</span>
      </div>
    </div>

    <div class="attr-list">
      <div v-for="attr in attributes" :key="attr.id" class="attr-row">
        <div class="attr-label">
          <span class="attr-icon">{{ attr.icon }}</span>
          <span class="attr-name">{{ attr.name }}</span>
        </div>
        <div class="attr-bar-section">
          <div class="attr-bar-track">
            <div
              class="attr-bar-fill"
              :style="{
                width: `${(getDisplayValue(attr.id) / attr.max) * 100}%`,
                background: attr.color,
              }"
            ></div>
          </div>
        </div>
        <div class="attr-controls">
          <button class="ctrl-btn" :disabled="(allocation[attr.id] ?? 0) <= 0" @click="decrement(attr.id)">-</button>
          <span class="attr-value">{{ getDisplayValue(attr.id) }}</span>
          <button class="ctrl-btn" :disabled="remaining <= 0 || getDisplayValue(attr.id) >= attr.max" @click="increment(attr.id)">+</button>
        </div>
        <div v-if="getBonus(attr.id) > 0" class="attr-bonus">
          +{{ getBonus(attr.id) }}
        </div>
      </div>
    </div>

    <!-- 天赋加成提示 -->
    <div v-if="talents.length > 0" class="talent-bonuses">
      <p class="text-xs text-muted">天赋加成已自动计入</p>
      <div class="bonus-tags">
        <span v-for="t in talents" :key="t.id" class="bonus-tag">
          {{ t.icon }} {{ t.name }}
        </span>
      </div>
    </div>

    <div class="allocate-actions">
      <button class="btn btn-primary btn-block" :disabled="remaining < 0" @click="confirm">
        {{ remaining > 0 ? `还有 ${remaining} 点未分配` : '开始游戏' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.attr-allocate {
  padding: var(--space-md) 0;
}

.allocate-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.points-display {
  margin-top: var(--space-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.penalty-hint {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin-left: 4px;
}

.points-num {
  font-weight: 700;
  font-size: 1.3rem;
  color: var(--color-primary-light);
  margin-left: 4px;
}
.points-num.warn {
  color: var(--text-gold);
}
.points-num.danger {
  color: var(--color-danger);
}

.attr-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.attr-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  position: relative;
}

.attr-label {
  width: 70px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.attr-icon {
  font-size: 1.1rem;
}

.attr-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.attr-bar-section {
  flex: 1;
}

.attr-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ctrl-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}
.ctrl-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
}
.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.ctrl-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.attr-value {
  min-width: 28px;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
}

.attr-bonus {
  position: absolute;
  top: -6px;
  right: 0;
  font-size: 0.65rem;
  color: var(--color-success);
  font-weight: 600;
}

.talent-bonuses {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  text-align: center;
}

.bonus-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: var(--space-sm);
  justify-content: center;
}

.bonus-tag {
  padding: 2px 10px;
  background: rgba(139, 92, 246, 0.1);
  color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.allocate-actions {
  margin-top: var(--space-xl);
}
</style>
