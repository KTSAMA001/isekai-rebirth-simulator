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
  // 先按 & 分割（AND 优先级更高）
  const andParts = cond.split('&')
  return andParts.every(andPart => {
    // 再按 | 分割（OR）
    const orParts = andPart.split('|')
    return orParts.some(orPart => evaluateAtom(orPart))
  })
}

/** 检查分支条件是否满足（支持多个条件逗号分隔） */
function isAvailable(branch: EventBranch): boolean {
  if (!branch.requireCondition) return true
  // 多个条件用逗号分隔，全部满足才通过
  return branch.requireCondition.split(',').every(c => evaluateCondition(c.trim()))
}

/** 获取条件的人类可读描述（单个原子条件） */
function describeAtom(cond: string): string {
  const trimmed = cond.trim()
  // attribute.xxx >= N → "体魄 ≥ 7"
  const attrMatch = trimmed.match(/^attribute\.(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/)
  if (attrMatch) {
    return `${attrName(attrMatch[1])} ${OP_MAP[attrMatch[2]] ?? attrMatch[2]} ${attrMatch[3]}`
  }
  // has.talent.xxx → "天赋「龙血传承」"
  if (trimmed.startsWith('has.talent.')) {
    return `天赋「${talentName(trimmed.slice(10))}」`
  }
  // has.flag.xxx → 描述性文字
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
  // hp >= N → "生命值 ≥ 50"
  const hpMatch = trimmed.match(/^hp\s*(>=|<=|>|<)\s*(\d+)$/)
  if (hpMatch) return `生命值 ${OP_MAP[hpMatch[1]] ?? hpMatch[1]} ${hpMatch[2]}`
  // age >= N → "年龄 ≥ 30"
  const ageMatch = trimmed.match(/^age\s*(>=|<=|>|<)\s*(\d+)$/)
  if (ageMatch) return `年龄 ${OP_MAP[ageMatch[1]] ?? ageMatch[1]} ${ageMatch[2]}`
  return trimmed
}

/** 获取条件的完整人类可读描述 */
function getConditionDescription(cond: string): string {
  // 按 & 分割，用"、"连接 AND 部分
  const andParts = cond.split('&')
  return andParts.map(andPart => {
    const orParts = andPart.split('|')
    if (orParts.length === 1) return describeAtom(orParts[0])
    // OR 部分用"或"连接
    return orParts.map(describeAtom).join(' 或 ')
  }).join('，')
}

/** 获取完整的解锁条件文本 */
function getUnlockText(branch: EventBranch): string {
  if (!branch.requireCondition) return ''
  const conditions = branch.requireCondition.split(',').map(c => c.trim())
  return conditions.map(c => getConditionDescription(c)).join('，')
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
        :class="{
          'choice-locked': !isAvailable(branch),
          'choice-available': isAvailable(branch),
        }"
        :disabled="!isAvailable(branch)"
        @click="emit('select', branch.id)"
      >
        <div class="choice-label">{{ branch.title }}</div>
        <div class="choice-desc">{{ branch.description }}</div>
        <div v-if="!isAvailable(branch) && getUnlockText(branch)" class="choice-locked-hint">
          🔒 {{ getUnlockText(branch) }} 后可选
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

.choice-btn.choice-available:hover {
  border-color: var(--color-primary);
  background: var(--bg-card-hover);
}

.choice-btn.choice-available:active {
  transform: scale(0.98);
}

.choice-btn.choice-locked {
  opacity: 0.5;
  cursor: not-allowed;
  border-style: dashed;
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

.choice-locked-hint {
  margin-top: 6px;
  font-size: 0.7rem;
  color: var(--text-dim);
  padding: 2px 0;
}
</style>
