<script setup lang="ts">
import { computed } from 'vue'
import type { GameState, WorldInstance } from '@/engine/core/types'

const props = defineProps<{
  state: GameState
  world: WorldInstance
}>()

const visibleAttrs = computed(() => {
  return props.world.attributes.filter(a => !a.hidden)
})

const talentDefs = computed(() => {
  return props.state.talents.selected
    .map(id => props.world.index.talentsById.get(id))
    .filter(Boolean)
})

function hpClass() {
  if (props.state.hp <= 10) return 'low'
  if (props.state.hp <= 30) return 'mid'
  return ''
}
</script>

<template>
  <div class="status-panel">
    <!-- 年龄 & HP -->
    <div class="status-header">
      <div class="age-display">
        <span class="age-num">{{ state.age }}</span>
        <span class="age-label">岁</span>
      </div>
      <div class="hp-section">
        <div class="hp-label">
          <span>HP</span>
          <span class="hp-value" :class="hpClass()">{{ state.hp }}</span>
        </div>
      </div>

    <!-- 属性条 -->
    <div class="attrs-section">
      <div v-for="attr in visibleAttrs" :key="attr.id" class="attr-item">
        <div class="attr-head">
          <span class="attr-icon">{{ attr.icon }}</span>
          <span class="attr-name">{{ attr.name }}</span>
          <span class="attr-val" :style="{ color: attr.color }">
            {{ state.attributes[attr.id] ?? 0 }}
          </span>
        </div>
        <div class="attr-bar-track">
          <div
            class="attr-bar-fill"
            :style="{
              width: ((state.attributes[attr.id] ?? 0) / attr.max) * 100 + '%',
              background: attr.color,
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 已选天赋 -->
    <div v-if="talentDefs.length > 0" class="talents-section">
      <div class="talents-title">天赋</div>
      <div class="talent-tags">
        <span
          v-for="t in talentDefs"
          :key="t!.id"
          class="talent-tag"
          :class="`rarity-${t!.rarity}`"
        >
          {{ t!.icon }} {{ t!.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-panel {
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--border-color);
}

.status-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.age-display {
  text-align: center;
  min-width: 50px;
}
.age-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-gold);
}
.age-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: 2px;
}

.hp-section {
  flex: 1;
}

.hp-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.hp-value {
  font-weight: 600;
}

.hp-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--color-success);
  transition: width var(--transition-slow);
}
.hp-fill.mid {
  background: var(--color-warning);
}
.hp-fill.low {
  background: var(--color-danger);
}

.attrs-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attr-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.attr-head {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}

.attr-icon {
  font-size: 0.9rem;
}

.attr-name {
  color: var(--text-secondary);
  flex: 1;
}

.attr-val {
  font-weight: 700;
  font-size: 0.85rem;
}

.talents-section {
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
}

.talents-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.talent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.talent-tag {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
}
.talent-tag.rarity-common {
  background: rgba(96, 165, 250, 0.12);
  color: var(--rarity-common);
}
.talent-tag.rarity-rare {
  background: rgba(192, 132, 252, 0.12);
  color: var(--rarity-rare);
}
.talent-tag.rarity-legendary {
  background: rgba(251, 191, 36, 0.12);
  color: var(--rarity-legendary);
}
</style>
