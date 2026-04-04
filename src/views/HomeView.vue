<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore, type SaveSlot } from '@/stores/gameStore'

const router = useRouter()
const worldStore = useWorldStore()
const gameStore = useGameStore()

const saveSlots = ref<(SaveSlot | null)[]>([])

onMounted(() => {
  refreshSaves()
})

function refreshSaves() {
  saveSlots.value = gameStore.getSaveSlots()
}

function startGame(worldId: string) {
  worldStore.selectWorld(worldId)
  router.push({ name: 'setup', params: { worldId } })
}

function continueGame(slotId: number) {
  if (gameStore.loadSave(slotId)) {
    const state = gameStore.state
    if (state) {
      if (state.phase === 'simulating') {
        router.push({
          name: 'play',
          params: {
            worldId: state.meta.worldId,
            playId: state.meta.playId,
          },
        })
      } else if (state.phase === 'finished') {
        router.push({
          name: 'result',
          params: {
            worldId: state.meta.worldId,
            playId: state.meta.playId,
          },
        })
      } else {
        // 其他阶段（talent-draft, attribute-allocate）回到 setup
        router.push({ name: 'setup', params: { worldId: state.meta.worldId } })
      }
    }
  }
}

function deleteSave(slotId: number) {
  gameStore.deleteSave(slotId)
  refreshSaves()
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

const appVersion = __APP_VERSION__

/** 判断是否可以继续（仅自动存档有"继续"按钮） */
const autoSlot = ref<SaveSlot | null>(null)
</script>

<template>
  <div class="page-container home">
    <!-- 英雄区 -->
    <section class="hero">
      <div class="hero-glow"></div>
      <h2 class="hero-title animate-fade-in">
        <span class="hero-emoji">🌍</span>
        <br />
        转生吧
      </h2>
      <p class="hero-subtitle animate-slide-up">
        在异世界开始你的第二人生
      </p>
    </section>

    <!-- 自动存档 / 继续游戏 -->
    <section v-if="saveSlots[0]" class="save-section">
      <h3 class="section-title">继续游戏</h3>
      <div class="save-card card card-glow" @click="continueGame(0)">
        <div class="save-icon">📖</div>
        <div class="save-info">
          <div class="save-name">{{ saveSlots[0]!.characterName }}</div>
          <div class="save-detail">
            {{ saveSlots[0]!.worldName }} · {{ saveSlots[0]!.age }}岁 ·
            {{ saveSlots[0]!.phase === 'finished' ? '已结束' : '进行中' }}
          </div>
          <div class="save-time">{{ formatTime(saveSlots[0]!.timestamp) }}</div>
        </div>
        <div class="save-arrow">&rarr;</div>
      </div>
    </section>

    <!-- 世界选择 -->
    <section class="world-section">
      <h3 class="section-title">选择你的世界</h3>
      <div class="world-list">
        <div
          v-for="world in worldStore.worlds"
          :key="world.manifest.id"
          class="world-card card card-glow stagger-item"
          @click="startGame(world.manifest.id)"
        >
          <div class="world-icon">{{ world.manifest.icon }}</div>
          <div class="world-info">
            <h4 class="world-name">{{ world.manifest.name }}</h4>
            <p class="world-subtitle">{{ world.manifest.subtitle }}</p>
            <p class="world-desc">{{ world.manifest.description }}</p>
            <div class="world-tags">
              <span v-for="tag in world.manifest.tags" :key="tag" class="world-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="world-arrow">&rarr;</div>
        </div>
      </div>
    </section>

    <!-- 存档管理 -->
    <section class="save-section">
      <h3 class="section-title">存档管理</h3>
      <div class="manual-slots">
        <div
          v-for="i in 3"
          :key="i"
          class="slot-card card"
          :class="{ 'slot-empty': !saveSlots[i] }"
        >
          <template v-if="saveSlots[i]">
            <div class="slot-content" @click="continueGame(i)">
              <div class="slot-name">{{ saveSlots[i]!.characterName }}</div>
              <div class="slot-detail">
                {{ saveSlots[i]!.worldName }} · {{ saveSlots[i]!.age }}岁
                <span v-if="saveSlots[i]!.score"> · {{ saveSlots[i]!.score }}分</span>
              </div>
              <div class="slot-time">{{ formatTime(saveSlots[i]!.timestamp) }}</div>
            </div>
            <button class="slot-delete" @click.stop="deleteSave(i)">删除</button>
          </template>
          <template v-else>
            <div class="slot-empty-text">存档 {{ i }} — 空</div>
          </template>
        </div>
      </div>
      <p class="local-storage-note text-xs text-muted">
        存档、成就与身份解锁仅保存在当前浏览器本地，不会上传到云端。
      </p>
    </section>

    <!-- 底部信息 -->
    <footer class="home-footer">
      <p class="text-muted text-sm text-center">
        v{{ appVersion }} &middot; 剑与魔法
      </p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

/* 英雄区 */
.hero {
  text-align: center;
  padding: var(--space-2xl) 0 var(--space-xl);
  position: relative;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-sm);
}

.hero-title {
  font-family: var(--font-title);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-gold);
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  margin-bottom: var(--space-sm);
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 区域标题 */
.section-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  padding-left: var(--space-xs);
}

/* 世界列表 */
.world-section {
  margin-top: var(--space-xl);
}

.world-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.world-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  padding: var(--space-lg);
  position: relative;
  overflow: hidden;
}

.world-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
  pointer-events: none;
}

.world-card:active {
  transform: scale(0.98);
}

.world-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 56px;
  text-align: center;
}

.world-info {
  flex: 1;
  min-width: 0;
}

.world-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.world-subtitle {
  font-size: 0.85rem;
  color: var(--text-gold);
  margin-bottom: 4px;
}

.world-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.world-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: var(--space-sm);
}

.world-tag {
  padding: 1px 8px;
  background: rgba(139, 92, 246, 0.1);
  color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
}

.world-arrow {
  font-size: 1.2rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 继续游戏区域 */
.save-section {
  margin-top: var(--space-lg);
}

.local-storage-note {
  margin-top: var(--space-sm);
  padding-left: var(--space-xs);
}

.save-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  padding: var(--space-md) var(--space-lg);
}

.save-card:active {
  transform: scale(0.98);
}

.save-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.save-info {
  flex: 1;
  min-width: 0;
}

.save-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.save-detail {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.save-time {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.save-arrow {
  font-size: 1.2rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 手动存档槽位 */
.manual-slots {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.slot-card {
  padding: var(--space-sm) var(--space-md);
  min-height: unset;
}

.slot-card:not(.slot-empty) {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.slot-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.slot-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.slot-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.slot-time {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.slot-delete {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
}

.slot-delete:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.slot-empty-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: var(--space-xs) 0;
}

.home-footer {
  margin-top: var(--space-2xl);
}
</style>
