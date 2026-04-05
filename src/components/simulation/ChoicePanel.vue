<script setup lang="ts">
import type { EventBranch, GameState, WorldInstance } from '@/engine/core/types'
import { ConditionDSL } from '@/engine/modules/ConditionDSL'

const props = defineProps<{
  branches: EventBranch[]
  state: GameState
  world: WorldInstance
}>()

const emit = defineEmits<{
  select: [branchId: string]
}>()

const dsl = new ConditionDSL()

/** 获取属性中文名 */
function attrName(attrId: string): string {
  return props.world.index.attributesById.get(attrId)?.name ?? attrId
}

/** 计算风险选项的成功率 */
function getSuccessChance(branch: EventBranch): number | null {
  if (!branch.riskCheck) return null
  const rc = branch.riskCheck
  const attrValue = props.state.attributes[rc.attribute] ?? 0
  const scale = rc.scale ?? 3
  const x = (attrValue - rc.difficulty) / scale
  return Math.min(100, Math.max(1, Math.round(100 / (1 + Math.exp(-x)))))
}

/** 获取风险选项的成功率预览文本 */
function getRiskText(branch: EventBranch): string {
  if (!branch.riskCheck) return ''
  const rc = branch.riskCheck
  const attrValue = props.state.attributes[rc.attribute] ?? 0
  const chance = getSuccessChance(branch)
  return `📊 ${chance}%（${attrName(rc.attribute)} ${attrValue}/${rc.difficulty}）`
}

/** 检查分支条件是否满足（委托给引擎 ConditionDSL） */
function isAvailable(branch: EventBranch): boolean {
  // 资源消耗校验
  if (branch.cost) {
    const currentValue = props.state.attributes[branch.cost.attribute] ?? 0
    if (currentValue < branch.cost.amount) return false
  }
  if (!branch.requireCondition) return true
  const ctx = { state: props.state, world: props.world }
  const conditions = branch.requireCondition.split(',').map(c => c.trim())
  return conditions.every(c => dsl.evaluate(c, ctx))
}

/** 获取锁定条件的可读描述（委托给引擎 ConditionDSL） */
function getUnlockText(branch: EventBranch): string {
  const parts: string[] = []
  // 资源消耗描述
  if (branch.cost) {
    const attrDef = props.world.index.attributesById.get(branch.cost.attribute)
    const name = attrDef?.name ?? branch.cost.attribute
    const currentValue = props.state.attributes[branch.cost.attribute] ?? 0
    parts.push(`${name} ${branch.cost.amount}（当前 ${currentValue}）`)
  }
  // 条件描述
  if (branch.requireCondition) {
    const conditions = branch.requireCondition.split(',').map(c => c.trim())
    parts.push(...conditions.map(c => dsl.describe(c, props.world)))
  }
  return parts.join('，')
}
</script>

<template>
  <div class="choice-panel">
    <div class="choice-options">
      <button
        v-for="branch in branches"
        :key="branch.id"
        class="choice-btn"
        :class="{
          'choice-locked': !isAvailable(branch),
          'choice-available': isAvailable(branch),
          'choice-risk': !!branch.riskCheck && isAvailable(branch),
        }"
        :disabled="!isAvailable(branch)"
        @click="emit('select', branch.id)"
      >
        <span class="choice-indicator">{{ isAvailable(branch) ? '●' : '○' }}</span>
        <span class="choice-label">{{ branch.title }}</span>
        <span class="choice-desc">{{ branch.description }}</span>
        <span v-if="branch.riskCheck && isAvailable(branch)" class="risk-hint">{{ getRiskText(branch) }}</span>
        <span v-if="!isAvailable(branch) && getUnlockText(branch)" class="choice-locked-hint">🔒 {{ getUnlockText(branch) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.choice-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-panel);
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 3px 6px;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.choice-btn.choice-available:hover {
  background: var(--bg-card-hover);
}

.choice-btn.choice-available:active {
  background: var(--bg-card);
  transform: scale(0.98);
}

.choice-btn.choice-locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-btn.choice-risk {
  border-left: 3px solid rgba(201, 162, 39, 0.4);
}

.choice-btn.choice-risk:hover {
  background: rgba(201, 162, 39, 0.06);
}

.choice-indicator {
  order: 0;
  font-size: 0.65rem;
  flex-shrink: 0;
  width: 14px;
}

.choice-btn.choice-available .choice-indicator {
  color: var(--color-primary);
}

.choice-btn.choice-locked .choice-indicator {
  color: var(--text-muted);
}

.choice-label {
  order: 1;
  font-size: 0.85rem;
  font-weight: 700;
}

.risk-hint {
  order: 2;
  font-size: 0.72rem;
  color: var(--color-primary-light, #d4a373);
  flex-shrink: 0;
  white-space: nowrap;
}

.choice-locked-hint {
  order: 3;
  font-size: 0.7rem;
  color: var(--text-dim);
  white-space: nowrap;
  flex-shrink: 0;
}

.choice-desc {
  order: 4;
  flex-basis: 100%;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.risk-badge {
  font-size: 0.72rem;
  margin-left: 2px;
  vertical-align: middle;
}
</style>
