import type { GameState } from './types'

/** 深克隆 GameState（统一实现，避免多处重复） */
export function cloneState(state: GameState): GameState {
  return {
    ...state,
    attributes: { ...state.attributes },
    attributePeaks: { ...state.attributePeaks },
    talents: {
      selected: [...state.talents.selected],
      draftPool: [...state.talents.draftPool],
      inherited: [...state.talents.inherited],
    },
    flags: new Set(state.flags),
    counters: new Map(state.counters),
    triggeredEvents: new Set(state.triggeredEvents),
    eventLog: [...state.eventLog],
    achievements: {
      unlocked: [...state.achievements.unlocked],
      progress: { ...state.achievements.progress },
    },
    inventory: {
      ...state.inventory,
      items: [...state.inventory.items],
    },
    attributeHistory: [...state.attributeHistory],
    // 深克隆 pendingBranch（避免分支选择时意外修改原状态）
    pendingBranch: state.pendingBranch
      ? {
          ...state.pendingBranch,
          branches: state.pendingBranch.branches.map(b => ({
            ...b,
            effects: [...b.effects],
            failureEffects: b.failureEffects ? [...b.failureEffects] : undefined,
          })),
        }
      : undefined,
  }
}
