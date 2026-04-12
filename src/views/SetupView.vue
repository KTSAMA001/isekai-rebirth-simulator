<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { useProgressStore } from '@/stores/progressStore'
import TalentDraft from '@/components/setup/TalentDraft.vue'
import AttributeAllocate from '@/components/setup/AttributeAllocate.vue'
import GameIcon from '@/components/common/GameIcon.vue'
import type { WorldTalentDef, Gender } from '@/engine/core/types'

const props = defineProps<{
  worldId: string
}>()

const router = useRouter()
const worldStore = useWorldStore()
const gameStore = useGameStore()
const progressStore = useProgressStore()

// 步骤: 0=身份+姓名, 1=种族+性别, 2=天赋抽取, 3=属性分配
const step = ref(0)

// 预设选择
const selectedPresetId = ref<string | null>(null)
const characterName = ref('')

// 种族/性别选择
const selectedRace = ref<string | null>(null)
const selectedGender = ref<Gender | null>(null)

const world = computed(() => {
  return worldStore.worlds.find(w => w.manifest.id === props.worldId)
})

const presets = computed(() => {
  const raw = world.value?.presets ?? []
  const totalAch = world.value?.achievements?.length ?? 0
  return raw.map(p => ({
    ...p,
    locked: p.locked && !progressStore.isPresetUnlocked(p.id, totalAch),
  }))
})

const selectedPreset = computed(() => {
  if (!selectedPresetId.value) return null
  return presets.value.find(p => p.id === selectedPresetId.value) ?? null
})

// 种族列表（未开放种族也展示，但不可选择）
const allRaces = computed(() => {
  return world.value?.races ?? []
})

function isRaceLocked(race: { playable: boolean }) {
  return race.playable === false
}

// 当前选中种族的定义
const selectedRaceDef = computed(() => {
  if (!selectedRace.value) return null
  return allRaces.value.find(r => r.id === selectedRace.value) ?? null
})

// 当前性别修正
const selectedGenderMod = computed(() => {
  if (!selectedRaceDef.value?.genderModifiers || !selectedGender.value) return null
  return selectedRaceDef.value.genderModifiers.find(g => g.gender === selectedGender.value) ?? null
})

// 模板引用（用于自动滚动）
const identityConfirmRef = ref<HTMLElement | null>(null)
const raceDetailRef = ref<HTMLElement | null>(null)
const buildPreviewRef = ref<HTMLElement | null>(null)

// 天赋数据
const draftPool = ref<WorldTalentDef[]>([])
const selectedTalents = ref<WorldTalentDef[]>([])

// 天赋加成（仅正值显示为属性加成提示，负值通过扣减点数体现）
const talentBonuses = computed(() => {
  const bonuses: Record<string, number> = {}
  for (const t of selectedTalents.value) {
    for (const eff of t.effects) {
      if (eff.type === 'modify_attribute' && eff.value !== undefined && eff.value > 0) {
        bonuses[eff.target] = (bonuses[eff.target] ?? 0) + eff.value
      }
    }
  }
  return bonuses
})

// 天赋扣减点数总值
const talentPenalty = computed(() => {
  return gameStore.state?.talentPenalty ?? 0
})

// 属性ID→中文名映射
function getAttrName(id: string): string {
  return world.value?.attributes.find(a => a.id === id)?.name ?? id
}

// 属性初始值 — defaultValue + 天赋正值加成（负值通过扣减点数体现）
const baseValues = computed(() => {
  const vals: Record<string, number> = {}
  for (const attr of world.value?.attributes ?? []) {
    vals[attr.id] = attr.defaultValue
  }
  if (selectedPreset.value?.attributes) {
    for (const [k, v] of Object.entries(selectedPreset.value.attributes)) {
      vals[k] = (vals[k] ?? 0) + v
    }
  }
  if (selectedRaceDef.value?.attributeModifiers) {
    for (const mod of selectedRaceDef.value.attributeModifiers) {
      vals[mod.attributeId] = (vals[mod.attributeId] ?? 0) + mod.value
    }
  }
  if (selectedGenderMod.value?.attributeModifiers) {
    for (const mod of selectedGenderMod.value.attributeModifiers) {
      vals[mod.attributeId] = (vals[mod.attributeId] ?? 0) + mod.value
    }
  }
  for (const [attrId, bonus] of Object.entries(talentBonuses.value)) {
    vals[attrId] = (vals[attrId] ?? 0) + bonus
  }
  return vals
})

// === 步骤操作 ===
function selectPreset(presetId: string) {
  selectedPresetId.value = presetId
  const preset = presets.value.find(p => p.id === presetId)
  characterName.value = preset?.name ?? ''
  nextTick(() => {
    identityConfirmRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function confirmIdentity() {
  if (!selectedPresetId.value) return
  step.value = 1
}

// 选中种族时重置性别并滚动到详情
watch(selectedRace, (val) => {
  selectedGender.value = null
  if (val) {
    nextTick(() => {
      raceDetailRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
})

// 选中性别时滚动到构建预览
watch(selectedGender, (val) => {
  if (val) {
    nextTick(() => {
      buildPreviewRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
})

function confirmRaceGender() {
  if (!selectedRace.value || !selectedGender.value) return
  const name = characterName.value.trim() || selectedPreset.value?.name || '无名之人'
  worldStore.selectWorld(props.worldId)
  gameStore.initGame(name, selectedPreset.value?.id, selectedRace.value, selectedGender.value)

  // 自动抽取天赋
  const drafted = gameStore.draftTalents()
  if (world.value) {
    draftPool.value = drafted
      .map(id => world.value!.index.talentsById.get(id))
      .filter((t): t is WorldTalentDef => t !== undefined)
  }
  step.value = 2
}

function onTalentConfirm(ids: string[]) {
  gameStore.selectTalents(ids)
  if (world.value) {
    selectedTalents.value = ids
      .map(id => world.value!.index.talentsById.get(id))
      .filter((t): t is WorldTalentDef => t !== undefined)
  }
  step.value = 3
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

function goBack() {
  if (step.value > 0) step.value--
}
</script>

<template>
  <div class="page-container setup">
    <!-- 步骤指示器 -->
    <div class="steps">
      <div class="step" :class="{ active: step >= 0, done: step > 0 }" @click="step > 0 && (step = 0)">
        <span class="step-dot">1</span>
        <span class="step-label">身份</span>
      </div>
      <div class="step-line" :class="{ active: step > 0 }"></div>
      <div class="step" :class="{ active: step >= 1, done: step > 1 }" @click="step > 1 && (step = 1)">
        <span class="step-dot">2</span>
        <span class="step-label">种族</span>
      </div>
      <div class="step-line" :class="{ active: step > 1 }"></div>
      <div class="step" :class="{ active: step >= 2, done: step > 2 }">
        <span class="step-dot">3</span>
        <span class="step-label">天赋</span>
      </div>
      <div class="step-line" :class="{ active: step > 2 }"></div>
      <div class="step" :class="{ active: step >= 3 }">
        <span class="step-dot">4</span>
        <span class="step-label">属性</span>
      </div>
    </div>

    <!-- ========== Step 0: 身份选择 + 姓名 ========== -->
    <section v-if="step === 0" class="step-content animate-fade-in">
      <h2 class="title title-lg text-center">你是谁？</h2>
      <p class="subtitle text-center mb-lg">选择你的身世，决定你的起点</p>

      <div class="preset-grid">
        <div
          v-for="preset in presets"
          :key="preset.id"
          class="preset-card card"
          :class="{ locked: preset.locked, selected: selectedPresetId === preset.id }"
          @click="!preset.locked && selectPreset(preset.id)"
        >
          <div class="preset-header">
            <span class="preset-name">{{ preset.name }}</span>
            <span v-if="preset.locked" class="lock-tag"><GameIcon name="lock" size="0.85rem" /></span>
          </div>
          <div class="preset-title">{{ preset.title }}</div>
          <div class="preset-desc">{{ preset.description }}</div>
          <div v-if="preset.locked && preset.unlockCondition" class="preset-unlock-hint"><GameIcon name="lock" size="0.75rem" /> {{ preset.unlockCondition }}</div>
          <div v-if="preset.attributes && Object.keys(preset.attributes).length" class="preset-attrs">
            <span
              v-for="(val, key) in preset.attributes" :key="key"
              class="attr-tag" :class="val > 0 ? 'positive' : 'negative'"
            >
              {{ getAttrName(String(key)) }}{{ val > 0 ? '+' : '' }}{{ val }}
            </span>
          </div>
          <div v-if="preset.talents?.length" class="preset-talents-hint">
            <span class="talent-hint-icon">✦</span> 自带天赋 ×{{ preset.talents.length }}
          </div>
        </div>
      </div>

      <!-- 选中身份后显示姓名输入和确认 -->
      <div v-if="selectedPresetId" ref="identityConfirmRef" class="identity-confirm animate-fade-in">
        <div class="name-section">
          <label class="name-label">为你的角色命名</label>
          <input
            v-model="characterName"
            type="text"
            class="name-input"
            maxlength="12"
            placeholder="输入你的名字…"
          />
        </div>
        <button class="btn btn-primary btn-block" @click="confirmIdentity">
          确认身份 →
        </button>
      </div>
    </section>

    <!-- ========== Step 1: 种族 + 性别 ========== -->
    <section v-if="step === 1" class="step-content animate-fade-in">
      <div class="step1-header">
        <button class="btn-back" @click="goBack">← 返回</button>
        <div class="identity-badge" v-if="selectedPreset">
          <span class="badge-name">{{ characterName || selectedPreset.name }}</span>
          <span class="badge-title">{{ selectedPreset.title }}</span>
        </div>
      </div>

      <h2 class="title title-lg text-center">选择你的种族</h2>
      <p class="subtitle text-center mb-md">不同种族拥有不同的天赋与命运</p>

      <!-- 种族卡片 -->
      <div class="race-grid">
        <div
          v-for="race in allRaces"
          :key="race.id"
          class="race-card card"
          :class="{ selected: selectedRace === race.id, locked: isRaceLocked(race) }"
          @click="!isRaceLocked(race) && (selectedRace = race.id)"
        >
          <div class="race-card-header">
            <div class="race-icon-name">
              <span class="race-icon">{{ race.icon }}</span>
              <span class="race-name">{{ race.name }}</span>
            </div>
            <span v-if="isRaceLocked(race)" class="race-lock-tag">暂未开放</span>
          </div>
          <div class="race-lifespan">寿命 {{ race.lifespanRange[0] }}~{{ race.lifespanRange[1] }}<span v-if="(race as any).maxLifespan" class="race-max-lifespan">（极限 {{ (race as any).maxLifespan }} 岁）</span></div>
          <div class="race-desc">{{ race.description }}</div>
          <div v-if="isRaceLocked(race)" class="race-lock-hint">当前版本展示设定，暂不可选择</div>
          <div v-if="race.attributeModifiers?.length" class="race-mods">
            <span
              v-for="mod in race.attributeModifiers"
              :key="mod.attributeId"
              class="attr-tag"
              :class="{ positive: mod.value > 0, negative: mod.value < 0 }"
            >
              {{ getAttrName(mod.attributeId) }}{{ mod.value > 0 ? '+' : '' }}{{ mod.value }}
            </span>
          </div>
        </div>
      </div>

      <!-- 种族详情 + 性别选择（选了种族后展开） -->
      <div v-if="selectedRaceDef" ref="raceDetailRef" class="race-detail-section animate-fade-in">
        <!-- 种族背景故事 -->
        <div class="lore-box" v-if="selectedRaceDef.lore">
          <p class="lore-text">{{ selectedRaceDef.lore }}</p>
        </div>

        <!-- 性别选择 -->
        <h3 class="title title-sm text-center mt-md">选择性别</h3>
        <div class="gender-row">
          <div
            class="gender-card card"
            :class="{ selected: selectedGender === 'male' }"
            @click="selectedGender = 'male'"
          >
            <span class="gender-icon">♂</span>
            <span class="gender-label">男性</span>
            <div v-if="selectedRaceDef.genderModifiers" class="gender-mods">
              <template v-for="gm in selectedRaceDef.genderModifiers" :key="gm.gender">
                <template v-if="gm.gender === 'male' && gm.attributeModifiers">
                  <span
                    v-for="mod in gm.attributeModifiers"
                    :key="mod.attributeId"
                    class="attr-tag"
                    :class="{ positive: mod.value > 0, negative: mod.value < 0 }"
                  >
                    {{ getAttrName(mod.attributeId) }}{{ mod.value > 0 ? '+' : '' }}{{ mod.value }}
                  </span>
                </template>
              </template>
            </div>
          </div>
          <div
            class="gender-card card"
            :class="{ selected: selectedGender === 'female' }"
            @click="selectedGender = 'female'"
          >
            <span class="gender-icon">♀</span>
            <span class="gender-label">女性</span>
            <div v-if="selectedRaceDef.genderModifiers" class="gender-mods">
              <template v-for="gm in selectedRaceDef.genderModifiers" :key="gm.gender">
                <template v-if="gm.gender === 'female' && gm.attributeModifiers">
                  <span
                    v-for="mod in gm.attributeModifiers"
                    :key="mod.attributeId"
                    class="attr-tag"
                    :class="{ positive: mod.value > 0, negative: mod.value < 0 }"
                  >
                    {{ getAttrName(mod.attributeId) }}{{ mod.value > 0 ? '+' : '' }}{{ mod.value }}
                  </span>
                </template>
              </template>
            </div>
          </div>
        </div>

        <!-- 构建预览面板 -->
        <div v-if="selectedGender" ref="buildPreviewRef" class="build-preview animate-fade-in">
          <div class="preview-title">角色预览</div>
          <div class="preview-row">
            <span class="preview-label">姓名</span>
            <span class="preview-value">{{ characterName || selectedPreset?.name || '无名之人' }}</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">身份</span>
            <span class="preview-value">{{ selectedPreset?.title }}</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">种族</span>
            <span class="preview-value">{{ selectedRaceDef.icon }} {{ selectedRaceDef.name }}</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">性别</span>
            <span class="preview-value">{{ selectedGender === 'male' ? '♂ 男性' : '♀ 女性' }}</span>
          </div>
          <button class="btn btn-primary btn-block mt-md" @click="confirmRaceGender">
            开始冒险 →
          </button>
        </div>
      </div>
    </section>

    <!-- ========== Step 2: 天赋抽取 ========== -->
    <section v-if="step === 2" class="step-content animate-fade-in">
      <TalentDraft
        v-if="world && draftPool.length > 0"
        :talents="draftPool"
        :max-select="world.manifest.talentSelectCount"
        @confirm="onTalentConfirm"
      />
    </section>

    <!-- ========== Step 3: 属性分配 ========== -->
    <section v-if="step === 3" class="step-content animate-fade-in">
      <AttributeAllocate
        v-if="world"
        :attributes="world.attributes"
        :talents="selectedTalents"
        :total-points="world.manifest.initialPoints - talentPenalty"
        :base-values="baseValues"
        :talent-bonuses="talentBonuses"
        :talent-penalty="talentPenalty"
        @confirm="onAttrConfirm"
      />
    </section>
  </div>
</template>

<style scoped>
.setup {
  padding-top: var(--space-lg);
}

/* ===== 步骤指示器 ===== */
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
  cursor: default;
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
  background: rgba(201, 162, 39, 0.15);
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

/* ===== 步骤内容 ===== */
.step-content {
  min-height: 50vh;
}

/* ===== Step 0: 预设卡片网格 ===== */
.preset-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

.preset-card {
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}
.preset-card:hover:not(.locked) {
  border-color: var(--color-primary);
}
.preset-card:active:not(.locked) {
  transform: scale(0.98);
}
.preset-card.selected {
  border-color: var(--color-primary);
  background: rgba(201, 162, 39, 0.08);
  box-shadow: 0 0 12px rgba(201, 162, 39, 0.2);
}
.preset-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: saturate(0.4) sepia(0.15);
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

.preset-unlock-hint {
  font-size: 0.7rem;
  color: var(--gold);
  opacity: 0.8;
  margin-bottom: 6px;
}

.preset-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

/* 通用属性标签 */
.attr-tag {
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
}
.attr-tag.positive {
  background: rgba(74, 222, 128, 0.1);
  color: var(--color-success);
}
.attr-tag.negative {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger, #ef4444);
}

/* 天赋提示 */
.preset-talents-hint {
  font-size: 0.75rem;
  color: var(--text-gold);
  margin-top: 4px;
}
.talent-hint-icon {
  margin-right: 2px;
}

/* ===== 身份确认 + 姓名 ===== */
.identity-confirm {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.name-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.name-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.name-input {
  width: 220px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: var(--font-main);
  font-size: 1rem;
  text-align: center;
  outline: none;
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}
.name-input:focus {
  border-color: var(--color-primary);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(201, 162, 39, 0.15);
}
.name-input::placeholder {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ===== Step 1: 顶部返回 + 身份徽标 ===== */
.step1-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.btn-back {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  padding: 4px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}
.btn-back:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.identity-badge {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.badge-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}
.badge-title {
  font-size: 0.8rem;
  color: var(--text-gold);
}

/* ===== 种族卡片网格 ===== */
.race-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

.race-card {
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}
.race-card:hover:not(.locked) {
  border-color: var(--color-primary);
}
.race-card.selected {
  border-color: var(--color-primary);
  background: rgba(201, 162, 39, 0.08);
  box-shadow: 0 0 12px rgba(201, 162, 39, 0.2);
}
.race-card.locked {
  opacity: 0.55;
  cursor: not-allowed;
  filter: saturate(0.7);
}

.race-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.race-icon-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.race-icon {
  font-size: 1.4rem;
}
.race-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.race-lifespan {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  display: inline-block;
  margin-bottom: 4px;
}

.race-max-lifespan {
  opacity: 0.7;
  margin-left: 4px;
}

.race-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.race-lock-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
}

.race-lock-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.race-mods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* ===== 种族详情展开区 ===== */
.race-detail-section {
  margin-top: var(--space-lg);
}

.lore-box {
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid var(--color-primary);
  padding: var(--space-sm) var(--space-md);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: var(--space-md);
}
.lore-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  font-style: italic;
}

/* ===== 性别选择行 ===== */
.gender-row {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.gender-card {
  cursor: pointer;
  text-align: center;
  min-width: 120px;
  padding: var(--space-md);
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}
.gender-card:hover {
  border-color: var(--color-primary);
}
.gender-card.selected {
  border-color: var(--color-primary);
  background: rgba(201, 162, 39, 0.08);
  box-shadow: 0 0 12px rgba(201, 162, 39, 0.2);
}

.gender-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 4px;
}

.gender-label {
  font-weight: 600;
  font-size: 0.95rem;
  display: block;
  margin-bottom: 4px;
}

.gender-mods {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
}

/* ===== 构建预览面板 ===== */
.build-preview {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.preview-title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.preview-row:last-of-type {
  border-bottom: none;
}

.preview-label {
  color: var(--text-muted);
}
.preview-value {
  color: var(--text-primary);
  font-weight: 600;
}

/* ===== 通用按钮 ===== */
.btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-light);
}
.btn-block {
  display: block;
  width: 100%;
}

/* ===== 间距工具类 ===== */
.mt-md { margin-top: var(--space-md); }
.mb-md { margin-bottom: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mb-lg { margin-bottom: var(--space-lg); }
</style>
