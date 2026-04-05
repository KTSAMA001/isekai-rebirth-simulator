<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WorldTalentDef } from '@/engine/core/types'

const props = defineProps<{
  talents: WorldTalentDef[]
  maxSelect: number
}>()

const emit = defineEmits<{
  confirm: [ids: string[]]
}>()

const selectedIds = ref<Set<string>>(new Set())
const flipped = ref(false)

const rarityLabel: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  legendary: '传说',
}

const canConfirm = computed(() => selectedIds.value.size === props.maxSelect)

const talentMap = computed(() => new Map(props.talents.map(t => [t.id, t])))

function getConflictReason(talent: WorldTalentDef): string | null {
  if (selectedIds.value.has(talent.id)) return null

  for (const selectedId of selectedIds.value) {
    const selectedTalent = talentMap.value.get(selectedId)
    if (!selectedTalent) continue

    if (talent.exclusiveGroup && selectedTalent.exclusiveGroup === talent.exclusiveGroup) {
      if (talent.exclusiveGroup === 'origin') {
        return '出身类天赋只能选一个'
      }
      return '同组天赋只能选一个'
    }

    if (talent.mutuallyExclusive?.includes(selectedId) || selectedTalent.mutuallyExclusive?.includes(talent.id)) {
      return `与「${selectedTalent.name}」互斥`
    }
  }

  return null
}

function toggleTalent(id: string) {
  const talent = talentMap.value.get(id)
  if (!talent) return

  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else if (next.size < props.maxSelect && !getConflictReason(talent)) {
    next.add(id)
  }
  selectedIds.value = next
}

function confirm() {
  if (!canConfirm.value) return
  emit('confirm', Array.from(selectedIds.value))
}
</script>

<template>
  <div class="talent-draft">
    <div class="draft-header">
      <h3 class="title title-md">抽取天赋</h3>
      <p class="subtitle">从 {{ talents.length }} 个天赋中选择 {{ maxSelect }} 个</p>
      <p class="select-count">
        已选 <span class="count-num" :class="{ full: canConfirm }">{{ selectedIds.size }}</span> / {{ maxSelect }}
      </p>
    </div>

    <div class="talent-grid">
      <div
        v-for="talent in talents"
        :key="talent.id"
        class="talent-card"
        :class="[
          `rarity-${talent.rarity}`,
          { selected: selectedIds.has(talent.id), blocked: !selectedIds.has(talent.id) && !!getConflictReason(talent) }
        ]"
        @click="toggleTalent(talent.id)"
      >
        <div class="talent-rarity-tag tag" :class="`tag-${talent.rarity}`">
          {{ rarityLabel[talent.rarity] || talent.rarity }}
        </div>
        <div class="talent-icon">{{ talent.icon }}</div>
        <div class="talent-name">{{ talent.name }}</div>
        <div class="talent-desc">{{ talent.description }}</div>
        <div v-if="!selectedIds.has(talent.id) && getConflictReason(talent)" class="talent-conflict">
          {{ getConflictReason(talent) }}
        </div>
        <div class="talent-effects">
          <span v-for="(eff, i) in talent.effects" :key="i" class="effect-tag" :class="eff.value && eff.value > 0 ? 'positive' : 'negative'">
            {{ eff.description }}
          </span>
        </div>
        <div v-if="selectedIds.has(talent.id)" class="talent-check">&#10003;</div>
      </div>
    </div>

    <div class="draft-actions">
      <button class="btn btn-primary btn-block" :disabled="!canConfirm" @click="confirm">
        {{ canConfirm ? '确认天赋' : `还需选择 ${maxSelect - selectedIds.size} 个` }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.talent-draft {
  padding: var(--space-md) 0;
}

.draft-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.select-count {
  margin-top: var(--space-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.count-num {
  color: var(--color-primary-light);
  font-weight: 700;
  font-size: 1.1rem;
}
.count-num.full {
  color: var(--text-gold);
}

.talent-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.talent-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.talent-card:active {
  transform: scale(0.97);
}

.talent-card.rarity-common { border-color: rgba(139, 184, 196, 0.3); }
.talent-card.rarity-rare {
  border-color: rgba(180, 142, 221, 0.4);
  box-shadow: inset 0 0 15px rgba(180, 142, 221, 0.04);
}
.talent-card.rarity-legendary {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow:
    inset 0 0 20px rgba(251, 191, 36, 0.05),
    0 0 8px rgba(255, 215, 0, 0.1);
  /* 光线扫描 */
  overflow: hidden;
}
.talent-card.rarity-legendary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 215, 0, 0.06),
    rgba(255, 215, 0, 0.1),
    rgba(255, 215, 0, 0.06),
    transparent
  );
  animation: lightSweep 5s ease-in-out infinite;
  pointer-events: none;
}

.talent-card.selected {
  border-color: var(--color-primary);
  background: rgba(201, 162, 39, 0.1);
}
.talent-card.blocked {
  opacity: 0.55;
}
.talent-card.selected.rarity-rare { border-color: var(--rarity-rare); background: rgba(180, 142, 221, 0.1); }
.talent-card.selected.rarity-legendary { border-color: var(--rarity-legendary); background: rgba(251, 191, 36, 0.08); }

.talent-rarity-tag {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 0.65rem;
}

.talent-icon {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 4px;
}

.talent-name {
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 4px;
}

.talent-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 6px;
  line-height: 1.3;
}

.talent-conflict {
  font-size: 0.65rem;
  color: var(--text-gold);
  text-align: center;
  margin-bottom: 6px;
}

.talent-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
}

.effect-tag {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}
.effect-tag.positive {
  background: rgba(74, 222, 128, 0.12);
  color: var(--color-success);
}
.effect-tag.negative {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.talent-check {
  position: absolute;
  top: 4px;
  left: 8px;
  color: var(--color-primary-light);
  font-weight: 700;
  font-size: 1rem;
}

.draft-actions {
  margin-top: var(--space-lg);
  padding: 0 var(--space-sm);
}
</style>
