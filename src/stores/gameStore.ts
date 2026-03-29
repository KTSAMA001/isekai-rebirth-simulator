/**
 * gameStore — 游戏状态管理
 * 管理当前游戏局的状态，桥接引擎层与 UI 层
 * 包含 localStorage 存档系统
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GameState, YearResult } from '@/engine/core/types'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { useWorldStore } from './worldStore'

// ==================== 存档类型 ====================

export interface SaveSlot {
  id: number
  timestamp: number
  worldId: string
  worldName: string
  characterName: string
  age: number
  phase: string
  state: SerializedGameState
  score?: number
}

/** 序列化后的 GameState（Set/Map 转为可 JSON 化的结构） */
interface SerializedGameState {
  meta: GameState['meta']
  character: GameState['character']
  attributes: Record<string, number>
  attributeHistory: GameState['attributeHistory']
  attributePeaks: Record<string, number>
  talents: GameState['talents']
  age: number
  hp: number
  flags: string[]
  counters: Record<string, number>
  triggeredEvents: string[]
  eventLog: GameState['eventLog']
  achievements: GameState['achievements']
  inventory: GameState['inventory']
  talentPenalty: number
  phase: GameState['phase']
  result?: GameState['result']
  pendingBranch?: GameState['pendingBranch']
}

const SAVE_KEY_PREFIX = 'isekai_save_'
const SLOT_COUNT = 3
const AUTO_SAVE_SLOT = 0 // 槽位 0 用于自动存档

// ==================== 序列化工具 ====================

function serializeState(state: GameState): SerializedGameState {
  return {
    ...state,
    flags: [...state.flags],
    counters: Object.fromEntries(state.counters),
    triggeredEvents: [...state.triggeredEvents],
  }
}

function deserializeState(data: SerializedGameState): GameState {
  return {
    ...data,
    flags: new Set(data.flags ?? []),
    counters: new Map(Object.entries(data.counters ?? {})),
    triggeredEvents: new Set(data.triggeredEvents ?? []),
  }
}

function serializeSave(slot: SaveSlot): string {
  return JSON.stringify(slot)
}

function deserializeSave(json: string): SaveSlot | null {
  try {
    const data = JSON.parse(json)
    if (!data || !data.state || !data.id) return null
    // 基本完整性检查
    if (typeof data.state.phase !== 'string') return null
    if (typeof data.state.age !== 'number') return null
    if (!data.state.meta?.playId) return null
    return data as SaveSlot
  } catch {
    return null
  }
}

// ==================== Store ====================

export const useGameStore = defineStore('game', () => {
  const engine = ref<SimulationEngine | null>(null)
  const state = ref<GameState | null>(null)
  const isSimulating = ref(false)
  const simulationSpeed = ref(1) // 1x, 2x, 5x
  const autoMode = ref(false)

  /** 游戏阶段 */
  const phase = computed(() => state.value?.phase ?? 'init')

  /** 当前年龄 */
  const age = computed(() => state.value?.age ?? 0)

  /** 是否死亡/结束 */
  const isFinished = computed(() => phase.value === 'finished')

  // ==================== 存档系统 ====================

  /** 获取所有存档槽位 */
  function getSaveSlots(): (SaveSlot | null)[] {
    const slots: (SaveSlot | null)[] = []
    for (let i = 0; i <= SLOT_COUNT; i++) {
      const key = `${SAVE_KEY_PREFIX}${i}`
      const raw = localStorage.getItem(key)
      slots.push(raw ? deserializeSave(raw) : null)
    }
    return slots
  }

  /** 获取手动存档槽位（1~3） */
  function getManualSaveSlots(): (SaveSlot | null)[] {
    const slots: (SaveSlot | null)[] = []
    for (let i = 1; i <= SLOT_COUNT; i++) {
      const key = `${SAVE_KEY_PREFIX}${i}`
      const raw = localStorage.getItem(key)
      slots.push(raw ? deserializeSave(raw) : null)
    }
    return slots
  }

  /** 自动保存到槽位 0 */
  function autoSave() {
    if (!state.value) return
    const worldStore = useWorldStore()
    const world = worldStore.getCurrentWorld()
    if (!world) return

    const slot: SaveSlot = {
      id: AUTO_SAVE_SLOT,
      timestamp: Date.now(),
      worldId: state.value.meta.worldId,
      worldName: world.manifest.name,
      characterName: state.value.character.name,
      age: state.value.age,
      phase: state.value.phase,
      state: serializeState(state.value),
      score: state.value.result?.score,
    }

    try {
      localStorage.setItem(`${SAVE_KEY_PREFIX}${AUTO_SAVE_SLOT}`, serializeSave(slot))
    } catch (e) {
      console.warn('[存档] 自动保存失败:', e)
    }
  }

  /** 手动保存到指定槽位 */
  function saveToSlot(slotId: number): boolean {
    if (!state.value || slotId < 1 || slotId > SLOT_COUNT) return false
    const worldStore = useWorldStore()
    const world = worldStore.getCurrentWorld()
    if (!world) return false

    const slot: SaveSlot = {
      id: slotId,
      timestamp: Date.now(),
      worldId: state.value.meta.worldId,
      worldName: world.manifest.name,
      characterName: state.value.character.name,
      age: state.value.age,
      phase: state.value.phase,
      state: serializeState(state.value),
      score: state.value.result?.score,
    }

    try {
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, serializeSave(slot))
      // 同时更新自动存档
      autoSave()
      return true
    } catch (e) {
      console.warn('[存档] 保存失败:', e)
      return false
    }
  }

  /** 加载存档 */
  function loadSave(slotId: number): boolean {
    const key = `${SAVE_KEY_PREFIX}${slotId}`
    const raw = localStorage.getItem(key)
    if (!raw) return false

    const slot = deserializeSave(raw)
    if (!slot) return false

    const worldStore = useWorldStore()
    const world = worldStore.getWorldById(slot.worldId)
    if (!world) {
      console.warn(`[存档] 世界 ${slot.worldId} 未注册，无法加载`)
      return false
    }

    try {
      const gameState = deserializeState(slot.state)
      engine.value = SimulationEngine.restoreFromState(gameState, world)
      state.value = gameState
      worldStore.selectWorld(slot.worldId)
      return true
    } catch (e) {
      console.warn('[存档] 加载失败:', e)
      return false
    }
  }

  /** 删除存档 */
  function deleteSave(slotId: number) {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`)
  }

  /** 是否有自动存档 */
  function hasAutoSave(): boolean {
    return localStorage.getItem(`${SAVE_KEY_PREFIX}${AUTO_SAVE_SLOT}`) !== null
  }

  /** 清除自动存档（新游戏时调用） */
  function clearAutoSave() {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${AUTO_SAVE_SLOT}`)
  }

  // 监听 state 变化自动保存（仅 simulating 阶段自动保存）
  watch(state, (newState) => {
    if (newState && (newState.phase === 'simulating' || newState.phase === 'finished')) {
      autoSave()
    }
  }, { deep: false })

  // ==================== 游戏逻辑 ====================

  /** 初始化新游戏 */
  function initGame(characterName: string, presetId?: string) {
    const worldStore = useWorldStore()
    const world = worldStore.getCurrentWorld()
    if (!world) throw new Error('未选择世界')

    clearAutoSave()
    engine.value = new SimulationEngine(world)
    state.value = engine.value.initGame(characterName, presetId)
  }

  /** 抽取天赋 */
  function draftTalents(): string[] {
    if (!engine.value) throw new Error('引擎未初始化')
    const drafted = engine.value.draftTalents()
    state.value = engine.value.getState()
    return drafted
  }

  /** 选择天赋 */
  function selectTalents(talentIds: string[]) {
    if (!engine.value) throw new Error('引擎未初始化')
    state.value = engine.value.selectTalents(talentIds)
  }

  /** 分配属性 */
  function allocateAttributes(allocation: Record<string, number>) {
    if (!engine.value) throw new Error('引擎未初始化')
    state.value = engine.value.allocateAttributes(allocation)
  }

  // ==================== Galgame 化三步流程 ====================

  /** 开始一年：年龄+1，获取事件 */
  function startYear(): YearResult {
    if (!engine.value) throw new Error('引擎未初始化')
    const result = engine.value.startYear()
    state.value = engine.value.getState()
    return result
  }

  /** 选择分支，应用效果 */
  function resolveBranch(branchId: string): YearResult {
    if (!engine.value) throw new Error('引擎未初始化')
    const result = engine.value.resolveBranch(branchId)
    state.value = engine.value.getState()
    return result
  }

  /** 跳过平淡年 */
  function skipYear(): YearResult {
    if (!engine.value) throw new Error('引擎未初始化')
    const result = engine.value.skipYear()
    state.value = engine.value.getState()
    return result
  }

  // ==================== 向后兼容 ====================

  /** 推演一年（向后兼容） */
  function simulateYear(branchChoices?: Record<string, string>) {
    if (!engine.value) throw new Error('引擎未初始化')
    state.value = engine.value.simulateYear(branchChoices)
    return state.value
  }

  /** 完成游戏 */
  function finish() {
    if (!engine.value) throw new Error('引擎未初始化')
    state.value = engine.value.finish()
  }

  /** 重置游戏 */
  function resetGame() {
    engine.value = null
    state.value = null
    isSimulating.value = false
    autoMode.value = false
  }

  return {
    engine,
    state,
    isSimulating,
    simulationSpeed,
    autoMode,
    phase,
    age,
    isFinished,
    initGame,
    draftTalents,
    selectTalents,
    allocateAttributes,
    startYear,
    resolveBranch,
    skipYear,
    simulateYear,
    finish,
    resetGame,
    // 存档系统
    getSaveSlots,
    getManualSaveSlots,
    saveToSlot,
    loadSave,
    deleteSave,
    hasAutoSave,
    clearAutoSave,
    autoSave,
  }
})
