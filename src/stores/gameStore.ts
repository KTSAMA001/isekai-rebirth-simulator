/**
 * gameStore — 游戏状态管理
 * 管理当前游戏局的状态，桥接引擎层与 UI 层
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, WorldInstance } from '@/engine/core/types'
import { SimulationEngine } from '@/engine/core/SimulationEngine'
import { useWorldStore } from './worldStore'

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

  /** 初始化新游戏 */
  function initGame(characterName: string, seed?: number) {
    const worldStore = useWorldStore()
    const world = worldStore.getCurrentWorld()
    if (!world) throw new Error('未选择世界')

    engine.value = new SimulationEngine(world, seed)
    state.value = engine.value.initGame(characterName)
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

  /** 推演一年 */
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
    simulateYear,
    finish,
    resetGame,
  }
})
