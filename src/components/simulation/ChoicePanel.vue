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

/** 解析条件运算符 */
const OP_MAP: Record<string, string> = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=', '!=': '≠' }

/** 获取属性中文名 */
function attrName(attrId: string): string {
  return props.world.index.attributesById.get(attrId)?.name ?? attrId
}

/** 获取天赋中文名 */
function talentName(talentId: string): string {
  return props.world.index.talentsById.get(talentId)?.name ?? talentId
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

/** 求值一个原子条件（无 | & 逻辑运算符） */
function evaluateAtom(cond: string): boolean {
  const state = props.state
  const trimmed = cond.trim()

  // attribute.xxx >= N
  const attrMatch = trimmed.match(/^attribute\.(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/)
  if (attrMatch) {
    const val = (state.attributes[attrMatch[1]] ?? 0)
    const target = Number(attrMatch[3])
    switch (attrMatch[2]) {
      case '>=': return val >= target
      case '<=': return val <= target
      case '>':  return val > target
      case '<':  return val < target
      case '==': return val === target
      case '!=': return val !== target
    }
  }

  // has.talent.xxx
  if (trimmed.startsWith('has.talent.')) {
    const id = trimmed.slice('has.talent.'.length)
    return state.talents.selected.includes(id)
  }

  // has.flag.xxx
  if (trimmed.startsWith('has.flag.')) {
    const flag = trimmed.slice('has.flag.'.length)
    return (state.flags as Set<string>).has(flag)
  }

  // hp >= N
  const hpMatch = trimmed.match(/^hp\s*(>=|<=|>|<)\s*(\d+)$/)
  if (hpMatch) {
    const val = state.hp
    const target = Number(hpMatch[2])
    switch (hpMatch[1]) {
      case '>=': return val >= target
      case '<=': return val <= target
      case '>':  return val > target
      case '<':  return val < target
    }
  }

  // age >= N
  const ageMatch = trimmed.match(/^age\s*(>=|<=|>|<)\s*(\d+)$/)
  if (ageMatch) {
    const val = state.age
    const target = Number(ageMatch[2])
    switch (ageMatch[1]) {
      case '>=': return val >= target
      case '<=': return val <= target
      case '>':  return val > target
      case '<':  return val < target
    }
  }

  return true // 未知条件默认通过
}

/** 求值条件表达式（支持 | 或 & 与） */
function evaluateCondition(cond: string): boolean {
  const andParts = cond.split('&')
  return andParts.every(andPart => {
    const orParts = andPart.split('|')
    return orParts.some(orPart => evaluateAtom(orPart))
  })
}

/** 检查分支条件是否满足 */
function isAvailable(branch: EventBranch): boolean {
  if (!branch.requireCondition) return true
  return branch.requireCondition.split(',').every(c => evaluateCondition(c.trim()))
}

/** 获取条件的人类可读描述（单个原子条件） */
function describeAtom(cond: string): string {
  const trimmed = cond.trim()
  const attrMatch = trimmed.match(/^attribute\.(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/)
  if (attrMatch) {
    return `${attrName(attrMatch[1])} ${OP_MAP[attrMatch[2]] ?? attrMatch[2]} ${attrMatch[3]}`
  }
  if (trimmed.startsWith('has.talent.')) {
    return `天赋「${talentName(trimmed.slice(10))}」`
  }
  if (trimmed.startsWith('has.flag.')) {
    const flag = trimmed.slice(9)
    const flagDescriptions: Record<string, string> = {
      married: '已婚', divorced: '已离婚', guild_member: '公会成员',
      mage_graduate: '魔法学院毕业', squire: '侍从经验',
      dungeon_first: '首次地下城探索', fairy_friend: '精灵之友',
      fight_back: '曾反抗霸凌', bullied_child: '曾被欺负',
      first_love: '初恋经历', dark_mage_path: '暗黑魔道',
      hero_path: '英雄之路', dragon_slayer: '屠龙者',
      has_student: '收有弟子', noble_title: '贵族头衔', cursed: '被诅咒',
    }
    return flagDescriptions[flag] ?? flag
  }
  const hpMatch = trimmed.match(/^hp\s*(>=|<=|>|<)\s*(\d+)$/)
  if (hpMatch) return `生命值 ${OP_MAP[hpMatch[1]] ?? hpMatch[1]} ${hpMatch[2]}`
  const ageMatch = trimmed.match(/^age\s*(>=|<=|>|<)\s*(\d+)$/)
  if (ageMatch) return `年龄 ${OP_MAP[ageMatch[1]] ?? ageMatch[1]} ${ageMatch[2]}`
  return trimmed
}

/** 获取条件的人类可读描述 */
function getConditionDescription(cond: string): string {
  const andParts = cond.split('&')
  return andParts.map(andPart => {
    const orParts = andPart.split('|')
    if (orParts.length === 1) return describeAtom(orParts[0])
    return orParts.map(describeAtom).join('或')
  }).join('，')
}

function getUnlockText(branch: EventBranch): string {
  if (!branch.requireCondition) return ''
  const conditions = branch.requireCondition.split(',').map(c => c.trim())
  return conditions.map(c => getConditionDescription(c)).join('，')
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
  border-left: 3px solid rgba(167, 139, 250, 0.4);
}

.choice-btn.choice-risk:hover {
  background: rgba(167, 139, 250, 0.06);
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
  white-space: nowrap;
}

.risk-hint {
  order: 2;
  font-size: 0.72rem;
  color: var(--color-primary-light, #a78bfa);
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
