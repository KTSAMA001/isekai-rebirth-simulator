<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  grade: string
  title: string
  description: string
  score: number
}>()

const gradeColor = computed(() => {
  const g = props.grade
  if (g === 'SS') return 'var(--grade-ss)'
  if (g === 'S') return 'var(--grade-s)'
  if (g === 'A') return 'var(--grade-a)'
  if (g === 'B') return 'var(--grade-b)'
  if (g === 'C') return 'var(--grade-c)'
  return 'var(--grade-d)'
})
</script>

<template>
  <div class="final-grade">
    <div class="grade-letter" :style="{ color: gradeColor }">
      {{ grade }}
    </div>
    <h2 class="grade-title title-gold">{{ title }}</h2>
    <p class="grade-desc">{{ description }}</p>
    <div class="grade-score">
      <span class="score-label">总分</span>
      <span class="score-value">{{ score }}</span>
    </div>
  </div>
</template>

<style scoped>
.final-grade {
  text-align: center;
  padding: var(--space-xl) 0;
}

.grade-letter {
  font-family: var(--font-title);
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  animation: gradeAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  text-shadow: 0 0 40px currentColor;
  margin-bottom: var(--space-sm);
}

.grade-title {
  font-size: 1.4rem;
  margin-bottom: var(--space-sm);
}

.grade-desc {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto var(--space-lg);
}

.grade-score {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 20px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.score-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-gold);
}
</style>
