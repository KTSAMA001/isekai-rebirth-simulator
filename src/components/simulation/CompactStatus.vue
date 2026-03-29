<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameState, WorldInstance } from '@/engine/core/types'

const props = defineProps<{
  state: GameState
  world: WorldInstance
}>()

const expanded = ref(false)

const visibleAttrs = computed(() => {
  return props.world.attributes.filter(a => !a.hidden)
})

const talentDefs = computed(() => {
  return props.state.talents.selected
    .map(id => props.world.index.talentsById.get(id))
    .filter(Boolean)
})

function hpPercent() {
  return Math.max(0, Math.min(100, (props.state.hp / props.state.maxHp) * 100))
}

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="compact-status" @click="toggleExpand">
    <!-- 折叠状态：单行显示 -->
    <div class="compact-row">
      <span class="age-badge">{{ state.age }}岁</span>
      <span class="hp-mini" :class="{ low: hpPercent() < 30, mid: hpPercent() >= 30 && hpPercent() < 70 }">
        🩸{{ state.hp }}/{{ state.maxHp }}
      </span>
      <div class="attr-icons">
        <span v-for="attr in visibleAttrs" :key="attr.id" class="attr-icon-item" :style="{ color: attr.color }">
          {{ attr.icon }}{{ state.attributes[attr.id] ?? 0 }}
        </span>
      </div>
      <div class="talent-mini">
        <span v-for="t in talentDefs" :key="t!.id" class="talent-chip" :class="`rarity-${t!.rarity}`">
          {{ t!.icon }}
        </span>
      </div>
      <span class="expand-icon">{{ expanded ? '▲' : '▼' }}</span>
    </div>

    <!-- 展开详情 -->
    <div v-if="expanded" class="detail-panel" @click.stop>
      <!-- HP 进度条 -->
      <div class="hp-detail">
        <div class="hp-bar">
          <div class="hp-fill" :style="{ width: hpPercent() + '%' }" :class="{ low: hpPercent() < 30, mid: hpPercent() >= 30 && hpPercent() < 70 }"></div>
        </div>
      </div>
      <!-- 属性详情 -->
      <div class="attr-detail-list">
        <div v-for="attr in visibleAttrs" :key="attr.id" class="attr-detail-row">
          <span class="attr-d-icon">{{ attr.icon }}</span>
          <span class="attr-d-name">{{ attr.name }}</span>
          <span class="attr-d-val" :style="{ color: attr.color }">{{ state.attributes[attr.id] ?? 0 }}</span>
          <div class="attr-d-bar">
            <div class="attr-d-fill" :style="{ width: ((state.attributes[attr.id] ?? 0) / attr.max) * 100 + '%', background: attr.color }"></div>
          </div>
        </div>
      </div>
      <!-- 天赋标签 -->
      <div v-if="talentDefs.length > 0" class="talent-detail">
        <span v-for="t in talentDefs" :key="t!.id" class="talent-detail-tag" :class="`rarity-${t!.rarity}`">
          {{ t!.icon }} {{ t!.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compact-status {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.compact-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  min-height: 32px;
}

.age-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-gold);
  background: rgba(251, 191, 36, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.hp-mini {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success);
  white-space: nowrap;
}
.hp-mini.mid { color: var(--color-warning); }
.hp-mini.low { color: var(--color-danger); }

.attr-icons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}

.attr-icon-item {
  font-size: 0.75rem;
  font-weight: 600;
}

.talent-mini {
  display: flex;
  gap: 2px;
}

.talent-chip {
  font-size: 0.7rem;
  padding: 1px 4px;
  border-radius: 4px;
}
.talent-chip.rarity-common { background: rgba(96, 165, 250, 0.15); }
.talent-chip.rarity-rare { background: rgba(192, 132, 252, 0.15); }
.talent-chip.rarity-legendary { background: rgba(251, 191, 36, 0.15); }

.expand-icon {
  font-size: 0.6rem;
  color: var(--text-muted);
  margin-left: auto;
}

/* 展开详情 */
.detail-panel {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
}

.hp-detail {
  margin-bottom: var(--space-sm);
}

.hp-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--color-success);
  transition: width var(--transition-slow);
}
.hp-fill.mid { background: var(--color-warning); }
.hp-fill.low { background: var(--color-danger); }

.attr-detail-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attr-detail-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
}

.attr-d-icon { font-size: 0.8rem; }
.attr-d-name { color: var(--text-secondary); flex: 1; font-size: 0.7rem; }
.attr-d-val { font-weight: 700; font-size: 0.75rem; min-width: 20px; text-align: right; }

.attr-d-bar {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.attr-d-fill {
  height: 100%;
  border-radius: 2px;
  transition: width var(--transition-normal);
}

.talent-detail {
  margin-top: var(--space-sm);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.talent-detail-tag {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
}
.talent-detail-tag.rarity-common { background: rgba(96, 165, 250, 0.12); color: var(--rarity-common); }
.talent-detail-tag.rarity-rare { background: rgba(192, 132, 252, 0.12); color: var(--rarity-rare); }
.talent-detail-tag.rarity-legendary { background: rgba(251, 191, 36, 0.12); color: var(--rarity-legendary); }
</style>
