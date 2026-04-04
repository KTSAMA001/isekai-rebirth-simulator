<script setup lang="ts">
import { computed } from 'vue'
import { useWorldStore } from '@/stores/worldStore'
import { useProgressStore } from '@/stores/progressStore'

const worldStore = useWorldStore()
const progressStore = useProgressStore()

// 目前只有一个世界
const world = computed(() => worldStore.worlds[0])

/** 分类排序优先级 */
const categoryOrder: Record<string, number> = {
  '进度': 0, '人生': 1, '路线': 2, '战斗': 3, '魔法': 4, '属性': 5,
  '史诗': 6, '人类': 7, '精灵': 8, '哥布林': 9, '性别': 10, '秘密': 11,
}

/** 判断成就是否已解锁（跨局累计） */
function isUnlocked(achId: string): boolean {
  return progressStore.unlockedAchievements.has(achId)
}

// 按分类分组（排序）
const categorized = computed(() => {
  if (!world.value) return []
  const map: Record<string, typeof world.value.achievements> = {}
  for (const ach of world.value.achievements) {
    const cat = ach.category || '其他'
    if (!map[cat]) map[cat] = []
    map[cat].push(ach)
  }
  return Object.entries(map)
    .sort(([a], [b]) => (categoryOrder[a] ?? 99) - (categoryOrder[b] ?? 99))
})

// 统计
const totalCount = computed(() => world.value?.achievements.length ?? 0)
const unlockedCount = computed(() => {
  if (!world.value) return 0
  return world.value.achievements.filter(a => isUnlocked(a.id)).length
})

/** 种族标签映射 */
const raceLabels: Record<string, string> = {
  human: '人类', elf: '精灵', goblin: '哥布林',
}

/** 性别标签映射 */
const genderLabels: Record<string, string> = {
  male: '♂', female: '♀',
}

function getRaceTags(ach: typeof world.value.achievements[0]): string[] {
  return (ach as any).races?.map((r: string) => raceLabels[r] ?? r) ?? []
}

function getGenderTags(ach: typeof world.value.achievements[0]): string[] {
  return (ach as any).genders?.map((g: string) => genderLabels[g] ?? g) ?? []
}
</script>

<template>
  <div class="page-container achievements">
    <h2 class="title title-lg text-center mb-lg">成就殿堂</h2>

    <div v-if="!world" class="text-center text-muted">
      <p>暂无世界数据</p>
    </div>

    <div v-else class="categories">
      <div class="ach-summary text-center mb-md">
        <span class="text-xs text-muted">已解锁 {{ unlockedCount }} / {{ totalCount }}</span>
      </div>

      <section v-for="[cat, achList] in categorized" :key="cat" class="category">
        <h3 class="cat-title">
          {{ cat }}
          <span class="cat-count">{{ achList.filter(a => isUnlocked(a.id)).length }}/{{ achList.length }}</span>
        </h3>
        <div class="ach-grid">
          <div
            v-for="ach in achList"
            :key="ach.id"
            class="ach-card card"
            :class="{ locked: !isUnlocked(ach.id), unlocked: isUnlocked(ach.id) }"
          >
            <!-- 已解锁：显示完整信息 -->
            <template v-if="isUnlocked(ach.id)">
              <div class="ach-icon">{{ ach.icon }}</div>
              <div class="ach-info">
                <div class="ach-name-row">
                  <span class="ach-name">{{ ach.name }}</span>
                  <span class="tag tag-unlocked">✓</span>
                  <span v-for="tag in getRaceTags(ach)" :key="tag" class="tag tag-race">{{ tag }}</span>
                  <span v-for="tag in getGenderTags(ach)" :key="tag" class="tag tag-gender">{{ tag }}</span>
                </div>
                <div class="ach-desc">{{ ach.description }}</div>
              </div>
            </template>
            <!-- 未解锁 + 非隐藏：显示名称，描述模糊 -->
            <template v-else-if="!ach.hidden">
              <div class="ach-icon ach-icon-locked">{{ ach.icon }}</div>
              <div class="ach-info">
                <div class="ach-name-row">
                  <span class="ach-name">{{ ach.name }}</span>
                  <span class="tag tag-locked">🔒</span>
                </div>
                <div class="ach-desc">未解锁</div>
              </div>
            </template>
            <!-- 未解锁 + 隐藏：完全隐藏 -->
            <template v-else>
              <div class="ach-icon ach-icon-locked">❓</div>
              <div class="ach-info">
                <div class="ach-name-row">
                  <span class="ach-name">???</span>
                </div>
                <div class="ach-desc">隐藏成就</div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>

    <div class="text-center mt-lg">
      <p class="text-xs text-muted">完成游戏以解锁更多成就</p>
    </div>
  </div>
</template>

<style scoped>
.achievements {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

.categories {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.cat-title {
  font-family: var(--font-title);
  font-size: 1rem;
  color: var(--text-gold);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.cat-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-body);
}

.ach-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ach-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
}

.ach-card.locked {
  opacity: 0.45;
}

.ach-card.unlocked {
  border-left: 2px solid var(--gold);
}

.ach-icon-locked {
  filter: grayscale(1);
}

.tag-unlocked {
  background: rgba(80, 200, 120, 0.2);
  color: #50c878;
  border: 1px solid rgba(80, 200, 120, 0.3);
}

.tag-locked {
  background: rgba(150, 150, 150, 0.15);
  color: var(--text-muted);
  border: 1px solid rgba(150, 150, 150, 0.2);
}

.ach-icon {
  font-size: 1.8rem;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.ach-info {
  flex: 1;
}

.ach-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.ach-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.ach-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.tag {
  display: inline-block;
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  line-height: 1.4;
}

.tag-race {
  background: rgba(255, 215, 0, 0.15);
  color: var(--text-gold);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.tag-gender {
  background: rgba(200, 150, 255, 0.15);
  color: #c896ff;
  border: 1px solid rgba(200, 150, 255, 0.3);
}

.ach-summary {
  padding: var(--space-sm) 0;
}
</style>
