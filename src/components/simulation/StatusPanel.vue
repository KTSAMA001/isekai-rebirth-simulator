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

const inventoryItems = computed(() => {
  return props.state.inventory.items
    .map(slot => {
      const def = props.world.index.itemsById?.get(slot.itemId)
      if (!def) return null
      return { def, slot }
    })
    .filter(Boolean) as { def: any; slot: any }[]
})

const emptySlots = computed(() => {
  return Math.max(0, props.state.inventory.maxSlots - props.state.inventory.items.length)
})

function itemTooltip(item: { def: any; slot: any }) {
  const def = item.def
  const effectDescs = def.effects.map((e: any) => {
    switch (e.type) {
      case 'hp_regen_bonus': return e.value > 0 ? `每年HP恢复+${e.value}` : `每年HP恢复${e.value}`
      case 'hp_flat_bonus': return `HP+${e.value}`
      case 'attr_passive_growth': return `${e.target}成长+${e.value}/年`
      case 'skill_check_bonus': return `判定+${Math.round(e.value * 100)}%`
      case 'damage_reduction': return `伤害减免${Math.round(e.value * 100)}%`
      case 'death_save': return `免死一次(恢复${e.value}HP)`
      case 'conditional_regen': return `HP<${e.condition?.match(/\d+/)?.[0] ?? '?'}时恢复${e.value}`
      case 'hp_cap_modifier': return `HP上限${e.value > 0 ? '+' : ''}${Math.round(e.value * 100)}%`
      case 'attr_floor': return `${e.target}不低于${e.value}`
      default: return e.type
    }
  })
  const rarityLabel = { common: '普通', rare: '稀有', legendary: '传说' }[def.rarity]
  return [`${def.icon} ${def.name} [${rarityLabel}]`, def.description, '---', ...effectDescs].join('\n')
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

    <!-- 物品栏 -->
    <div v-if="inventoryItems.length > 0" class="items-section">
      <div class="items-title">物品 <span class="items-count">{{ inventoryItems.length }}/{{ state.inventory.maxSlots }}</span></div>
      <div class="items-grid">
        <div
          v-for="item in inventoryItems"
          :key="item.def.id"
          class="item-slot"
          :class="`rarity-${item.def.rarity}`"
          :title="itemTooltip(item)"
        >
          <span class="item-icon">{{ item.def.icon }}</span>
          <span class="item-name">{{ item.def.name }}</span>
        </div>
        <div v-for="n in emptySlots" :key="`empty-${n}`" class="item-slot empty">
          <span class="item-icon">·</span>
        </div>
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

/* 物品栏 */
.items-section {
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
}

.items-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.items-count {
  color: var(--text-secondary);
  font-weight: 600;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.item-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  cursor: default;
  transition: transform 0.15s;
  border: 1px solid transparent;
}

.item-slot:not(.empty):hover {
  transform: scale(1.05);
  border-color: var(--border-color);
}

.item-slot.empty {
  opacity: 0.25;
}

.item-icon {
  font-size: 1.1rem;
  line-height: 1.2;
}

.item-name {
  font-size: 0.6rem;
  color: var(--text-secondary);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.item-slot.rarity-common {
  background: rgba(96, 165, 250, 0.08);
}

.item-slot.rarity-rare {
  background: rgba(192, 132, 252, 0.08);
}

.item-slot.rarity-legendary {
  background: rgba(251, 191, 36, 0.08);
}
</style>
