<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import TalentDraft from '@/components/setup/TalentDraft.vue'
import AttributeAllocate from '@/components/setup/AttributeAllocate.vue'
import type { WorldTalentDef } from '@/engine/core/types'

const props = defineProps<{
  worldId: string
}>()

const router = useRouter()
const worldStore = useWorldStore()
const gameStore = useGameStore()

// 步骤: 0=预设选择, 1=天赋抽取, 2=属性分配
const step = ref(0)

// 预设选择
const selectedPresetId = ref<string | null>(null)

const world = computed(() => {
  return worldStore.worlds.find(w => w.manifest.id === props.worldId)
})

const presets = computed(() => world.value?.presets ?? [])

// 天赋数据
const draftPool = ref<WorldTalentDef[]>([])
const selectedTalents = ref<WorldTalentDef[]>([])

// 天赋加成
const talentBonuses = computed(() => {
  const bonuses: Record<string, number> = {}
  for (const t of selectedTalents.value) {
    for (const eff of t.effects) {
      if (eff.type === 'modify_attribute' && eff.value !== undefined) {
        bonuses[eff.target] = (bonuses[eff.target] ?? 0) + eff.value
      }
    }
  }
  return bonuses
})

// 属性初始值 — 使用后端 state.attributes（天赋效果已应用且 clamp）
const baseValues = computed(() => {
  const vals: Record<string, number> = {}
  if (gameStore.state?.attributes) {
    for (const attr of world.value?.attributes ?? []) {
      vals[attr.id] = gameStore.state.attributes[attr.id] ?? attr.defaultValue
    }
  } else if (world.value) {
    for (const attr of world.value.attributes) {
      vals[attr.id] = attr.defaultValue
    }
  }
  // 应用预设属性（UI 展示用）
  if (selectedPresetId.value) {
    const preset = presets.value.find(p => p.id === selectedPresetId.value)
    if (preset?.attributes) {
      for (const [k, v] of Object.entries(preset.attributes)) {
        vals[k] = (vals[k] ?? 0) + v
      }
    }
  }
  return vals
})

function selectPreset(presetId: string) {
  selectedPresetId.value = presetId
  const preset = presets.value.find(p => p.id === presetId)
  worldStore.selectWorld(props.worldId)
  gameStore.initGame(preset?.name ?? '无名之人')

  // 自动抽取天赋并进入天赋选择
  const drafted = gameStore.draftTalents()
  if (world.value) {
    draftPool.value = drafted
      .map(id => world.value!.index.talentsById.get(id))
      .filter((t): t is WorldTalentDef => t !== undefined)
  }
  step.value = 1
}

function onTalentConfirm(ids: string[]) {
  gameStore.selectTalents(ids)
  if (world.value) {
    selectedTalents.value = ids
      .map(id => world.value!.index.talentsById.get(id))
      .filter((t): t is WorldTalentDef => t !== undefined)
  }
  step.value = 2
}

function onAttrConfirm(allocation: Record<string, number>) {
  gameStore.allocateAttributes(allocation)
  if (gameStore.state) {
    router.push({
      name: 'play',
      params: {
        worldId: props.worldId,
        playId: gameStore.state.meta.playId,
      },
    })
  }
}
</script>

<template>
  <div class="page-container setup">
    <!-- 步骤指示器 -->
    <div class="steps">
      <div class="step" :class="{ active: step >= 0, done: step > 0 }">
        <span class="step-dot">1</span>
        <span class="step-label">预设</span>
      </div>
      <div class="step-line" :class="{ active: step > 0 }"></div>
      <div class="step" :class="{ active: step >= 1, done: step > 1 }">
        <span class="step-dot">2</span>
        <span class="step-label">天赋</span>
      </div>
      <div class="step-line" :class="{ active: step > 1 }"></div>
      <div class="step" :class="{ active: step >= 2 }">
        <span class="step-dot">3</span>
        <span class="step-label">属性</span>
      </div>
    </div>

    <!-- Step 0: 预设选择 -->
    <section v-if="step === 0" class="step-content animate-fade-in">
      <h2 class="title title-lg text-center">选择你的身份</h2>
      <p class="subtitle text-center mb-lg">每个身份都有独特的故事背景</p>
      <div class="preset-list">
        <div
          v-for="preset in presets"
          :key="preset.id"
          class="preset-card card"
          :class="{ locked: preset.locked }"
          @click="!preset.locked && selectPreset(preset.id)"
        >
          <div class="preset-header">
            <span class="preset-name">{{ preset.name }}</span>
            <span v-if="preset.locked" class="lock-tag">🔒 未解锁</span>
          </div>
          <div class="preset-title">{{ preset.title }}</div>
          <div class="preset-desc">{{ preset.description }}</div>
          <div v-if="preset.attributes && Object.keys(preset.attributes).length" class="preset-attrs">
            <span v-for="(val, key) in preset.attributes" :key="key" class="preset-attr">
              {{ key }} +{{ val }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 1: 天赋抽取 -->
    <section v-if="step === 1" class="step-content animate-fade-in">
      <TalentDraft
        v-if="world && draftPool.length > 0"
        :talents="draftPool"
        :max-select="world.manifest.talentSelectCount"
        @confirm="onTalentConfirm"
      />
    </section>

    <!-- Step 2: 属性分配 -->
    <section v-if="step === 2" class="step-content animate-fade-in">
      <AttributeAllocate
        v-if="world"
        :attributes="world.attributes"
        :talents="selectedTalents"
        :total-points="world.manifest.initialPoints"
        :base-values="baseValues"
        :talent-bonuses="talentBonuses"
        @confirm="onAttrConfirm"
      />
    </section>
  </div>
</template>

<style scoped>
.setup {
  padding-top: var(--space-lg);
}

/* 步骤指示器 */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: var(--space-xl);
  padding: 0 var(--space-md);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  color: var(--text-muted);
  transition: all var(--transition-normal);
}

.step.active .step-dot {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  background: rgba(139, 92, 246, 0.15);
}

.step.done .step-dot {
  border-color: var(--color-success);
  background: rgba(74, 222, 128, 0.15);
  color: var(--color-success);
}

.step-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.step.active .step-label {
  color: var(--text-primary);
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--border-color);
  margin: 0 4px;
  margin-bottom: 18px;
  transition: background var(--transition-normal);
}
.step-line.active {
  background: var(--color-primary);
}

/* 步骤内容 */
.step-content {
  min-height: 50vh;
}

/* 预设列表 */
.preset-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.preset-card {
  cursor: pointer;
  transition: all var(--transition-normal);
}
.preset-card:hover:not(.locked) {
  border-color: var(--color-primary);
}
.preset-card:active:not(.locked) {
  transform: scale(0.98);
}
.preset-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.preset-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.lock-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.preset-title {
  font-size: 0.85rem;
  color: var(--text-gold);
  margin-bottom: 4px;
}

.preset-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.preset-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preset-attr {
  padding: 1px 8px;
  background: rgba(74, 222, 128, 0.1);
  color: var(--color-success);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
}
</style>
