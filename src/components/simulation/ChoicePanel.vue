<script setup lang="ts">
import type { EventBranch, GameState, WorldInstance } from '@/engine/core/types'
import { computed } from 'vue'

const props = defineProps<{
  branches: EventBranch[]
  state: GameState
  world: WorldInstance
}>()

const emit = defineEmits<{
  select: [branchId: string]
}>()

/** 检查分支条件是否满足 */
function isAvailable(branch: EventBranch): boolean {
  if (!branch.requireCondition) return true
  // 简单解析条件提示，不做完整 DSL 求值
  return true // UI 层不做严格校验，由引擎层处理
}

/** 获取条件限制提示文本 */
function getConditionHint(branch: EventBranch): string {
  if (!branch.requireCondition) return ''
  // 简单解析常见条件格式
  const cond = branch.requireCondition
  // attribute.chr >= 7 → "需要魅力 ≥ 7"
  const attrMatch = cond.match(/attribute\.(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)/)
  if (attrMatch) {
    const attrId = attrMatch[1]
    const op = attrMatch[2]
    const val = attrMatch[3]
    const attrDef = props.world.index.attributesById.get(attrId)
    const opMap: Record<string, string> = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=', '!=': '≠' }
    return `需要${attrDef?.name ?? attrId} ${opMap[op] ?? op} ${val}`
  }
  // has.talent.xxx → "需要特定天赋"
  if (cond.startsWith('has.talent.')) {
    return '需要特定天赋'
  }
  return cond
}
</script>

<template>
  <div class="choice-panel">
    <div class="choice-title">请选择</div>
    <div class="choice-options">
      <button
        v-for="branch in branches"
        :key="branch.id"
        class="choice-btn"
        :disabled="!isAvailable(branch)"
        @click="emit('select', branch.id)"
      >
        <div class="choice-label">{{ branch.title }}</div>
        <div class="choice-desc">{{ branch.description }}</div>
        <div v-if="getConditionHint(branch)" class="choice-condition">
          🔒 {{ getConditionHint(branch) }}
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.choice-panel {
  padding: var(--space-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-panel);
}

.choice-title {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
  letter-spacing: 2px;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.choice-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 48px;
  -webkit-tap-highlight-color: transparent;
}

.choice-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--bg-card-hover);
}

.choice-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.choice-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.choice-label {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.choice-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.choice-condition {
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--text-dim);
}
</style>
