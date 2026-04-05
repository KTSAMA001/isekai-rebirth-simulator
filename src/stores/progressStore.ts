/**
 * progressStore — 玩家进度持久化
 * 跨局保存：完成局数、累计解锁成就
 * 用于判定预设身份解锁条件
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const PROGRESS_KEY = 'isekai_progress'

export interface PlayerProgress {
  /** 完成的游戏局数 */
  gamesCompleted: number
  /** 累计解锁过的成就 ID（跨局去重） */
  unlockedAchievements: string[]
  /** 已记录的 playId（防止刷新重复计数） */
  recordedPlayIds: string[]
}

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return { gamesCompleted: 0, unlockedAchievements: [], recordedPlayIds: [] }
    const data = JSON.parse(raw)
    return {
      gamesCompleted: data.gamesCompleted ?? 0,
      unlockedAchievements: Array.isArray(data.unlockedAchievements) ? data.unlockedAchievements : [],
      recordedPlayIds: Array.isArray(data.recordedPlayIds) ? data.recordedPlayIds : [],
    }
  } catch {
    return { gamesCompleted: 0, unlockedAchievements: [], recordedPlayIds: [] }
  }
}

function saveProgress(progress: PlayerProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch (e) {
    console.warn('KT---progressStore---保存进度失败', e)
  }
}

export const useProgressStore = defineStore('progress', () => {
  const progress = ref<PlayerProgress>(loadProgress())

  /** 完成局数 */
  const gamesCompleted = computed(() => progress.value.gamesCompleted)

  /** 累计解锁成就集合 */
  const unlockedAchievements = computed(() => new Set(progress.value.unlockedAchievements))

  /**
   * 记录一局游戏完成
   * @param playId 本局的唯一标识（防止重复记录）
   * @param achievements 本局解锁的成就 ID 列表
   */
  function recordGameCompletion(playId: string, achievements: string[]) {
    // 防止刷新页面重复计数
    if (progress.value.recordedPlayIds.includes(playId)) return

    const existing = new Set(progress.value.unlockedAchievements)
    for (const id of achievements) {
      existing.add(id)
    }
    // 只保留最近 50 个 playId，避免无限增长
    const recordedIds = [...progress.value.recordedPlayIds, playId].slice(-50)
    progress.value = {
      gamesCompleted: progress.value.gamesCompleted + 1,
      unlockedAchievements: [...existing],
      recordedPlayIds: recordedIds,
    }
    saveProgress(progress.value)
  }

  /**
   * 判定预设是否已解锁
   * @param presetId 预设 ID
   * @param totalAchievementCount 当前世界的成就总数
   */
  function isPresetUnlocked(presetId: string, totalAchievementCount: number): boolean {
    switch (presetId) {
      case 'reincarnator':
        // 完成一局游戏
        return progress.value.gamesCompleted >= 1
      case 'dragonborn':
        // 解锁「屠龙者」成就
        return unlockedAchievements.value.has('dragon_slayer_ach')
      case 'worldbreaker_preset':
        // 完成终焉路线之一：毁灭世界或经历终焉后重建文明
        return unlockedAchievements.value.has('dark_lord_ach') || unlockedAchievements.value.has('world_breaker_ach')
      default:
        return true
    }
  }

  /** 重置进度（调试用） */
  function resetProgress() {
    progress.value = { gamesCompleted: 0, unlockedAchievements: [], recordedPlayIds: [] }
    localStorage.removeItem(PROGRESS_KEY)
  }

  return {
    progress,
    gamesCompleted,
    unlockedAchievements,
    recordGameCompletion,
    isPresetUnlocked,
    resetProgress,
  }
})
