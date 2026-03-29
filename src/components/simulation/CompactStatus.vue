<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameState, WorldInstance } from '@/engine/core/types'

const props = defineProps<{
  state: GameState
  world: WorldInstance
}>()

const expanded = ref(false)
const selectedItem = ref<{ def: any; slot: any } | null>(null)

const visibleAttrs = computed(() => {
  return props.world.attributes.filter(a => !a.hidden)
})

const talentDefs = computed(() => {
  return props.state.talents.selected
    .map(id => props.world.index.talentsById.get(id))
    .filter(Boolean)
})

const inventoryItems = computed(() => {
  return props.state.inventory.items
    .map(slot => {
      const def = props.world.index.itemsById?.get(slot.itemId)
      if (!def) return null
      return { def, slot }
    })
    .filter(Boolean) as { def: any; slot: any }[]
})

function getEffectDescs(def: any): string[] {
  return def.effects.map((e: any) => {
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
}

const rarityLabel = (r: string) => ({ common: '普通', rare: '稀有', legendary: '传说' }[r] ?? r)

function selectItem(item: { def: any; slot: any } | null) {
  selectedItem.value = selectedItem.value?.def.id === item?.def.id ? null : item
}

/** HP 等级颜色：HP 低于初始值(30)变红 */
function hpClass() {
  if (props.state.hp <= 10) return 'low'
  if (props.state.hp <= 30) return 'mid'
  return ''
}

function toggleExpand() {
  expanded.value = !expanded.value
  if (!expanded.value) selectedItem.value = null
}
</script>

<template>
  <div class="compact-status" @click="toggleExpand">
    <!-- 折叠状态：单行显示 -->
    <div class="compact-row">
      <span class="age-badge">{{ state.age }}岁</span>
      <span class="hp-mini" :class="hpClass()">
        🩸{{ state.hp }}
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
      <!-- HP 详情 -->
      <div class="hp-detail">
        <span class="hp-label">🩸 生命值</span>
        <span class="hp-value" :class="hpClass()">{{ state.hp }}</span>
      </div>
      <!-- 属性详情 -->
      <div class="attr-detail-list">
        <div v-for="attr in visibleAttrs" :key="attr.id" class="attr-detail-row">
          <span class="attr-d-icon">{{ attr.icon }}</span>
          <span class="attr-d-name">{{ attr.name }}</span>
          <span class="attr-d-val" :style="{ color: attr.color }">{{ state.attributes[attr.id] ?? 0 }}</span>
        </div>
      </div>
      <!-- 天赋标签 -->
      <div v-if="talentDefs.length > 0" class="talent-detail">
        <span v-for="t in talentDefs" :key="t!.id" class="talent-detail-tag" :class="`rarity-${t!.rarity}`">
          {{ t!.icon }} {{ t!.name }}
        </span>
      </div>
      <!-- 物品栏 -->
      <div v-if="inventoryItems.length > 0" class="items-section">
        <div class="items-title">物品 <span class="items-count">{{ inventoryItems.length }}/{{ state.inventory.maxSlots }}</span></div>
        <div class="items-grid">
          <div
            v-for="item in inventoryItems"
            :key="item.def.id"
            class="item-slot"
            :class="[`rarity-${item.def.rarity}`, { selected: selectedItem?.def.id === item.def.id }]"
            @click.stop="selectItem(item)"
          >
            <span class="item-icon">{{ item.def.icon }}</span>
            <span class="item-name">{{ item.def.name }}</span>
          </div>
        </div>
        <!-- 物品详情面板 -->
        <div v-if="selectedItem" class="item-detail-panel" @click.stop>
          <div class="item-detail-header">
            <span class="item-detail-icon">{{ selectedItem.def.icon }}</span>
            <span class="item-detail-name" :class="`rarity-${selectedItem.def.rarity}`">{{ selectedItem.def.name }}</span>
            <span class="item-detail-rarity" :class="`rarity-${selectedItem.def.rarity}`">[{{ rarityLabel(selectedItem.def.rarity) }}]</span>
          </div>
          <div v-if="selectedItem.def.description" class="item-detail-desc">{{ selectedItem.def.description }}</div>
          <div v-if="getEffectDescs(selectedItem.def).length > 0" class="item-detail-effects">
            <div v-for="(desc, i) in getEffectDescs(selectedItem.def)" :key="i" class="item-effect-line">{{ desc }}</div>
          </div>
        </div>
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
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.hp-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.hp-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-success);
}
.hp-value.mid { color: var(--color-warning); }
.hp-value.low { color: var(--color-danger); }

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

/* 物品栏 */
.items-section {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
}

.items-title {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.items-count {
  color: var(--text-secondary);
  font-weight: 600;
}

.items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-slot {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
  border: 1px solid transparent;
}

.item-slot:hover,
.item-slot.selected {
  transform: scale(1.05);
  border-color: var(--border-color);
}

.item-slot.selected {
  background: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.1);
}

.item-icon {
  font-size: 0.85rem;
  line-height: 1;
}

.item-name {
  font-size: 0.65rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

.item-slot.rarity-common { background: rgba(96, 165, 250, 0.08); }
.item-slot.rarity-rare { background: rgba(192, 132, 252, 0.08); }
.item-slot.rarity-legendary { background: rgba(251, 191, 36, 0.08); }

/* 物品详情面板 */
.item-detail-panel {
  margin-top: 6px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.item-detail-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-detail-icon {
  font-size: 1rem;
  line-height: 1;
}

.item-detail-name {
  font-size: 0.75rem;
  font-weight: 700;
}
.item-detail-name.rarity-common { color: var(--rarity-common); }
.item-detail-name.rarity-rare { color: var(--rarity-rare); }
.item-detail-name.rarity-legendary { color: var(--rarity-legendary); }

.item-detail-rarity {
  font-size: 0.65rem;
  font-weight: 600;
}
.item-detail-rarity.rarity-common { color: var(--rarity-common); }
.item-detail-rarity.rarity-rare { color: var(--rarity-rare); }
.item-detail-rarity.rarity-legendary { color: var(--rarity-legendary); }

.item-detail-desc {
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.item-detail-effects {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-effect-line {
  font-size: 0.65rem;
  color: var(--text-muted);
  padding-left: 8px;
  position: relative;
}
.item-effect-line::before {
  content: '·';
  position: absolute;
  left: 2px;
}
</style>
