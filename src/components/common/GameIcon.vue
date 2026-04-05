<script setup lang="ts">
/**
 * 奇幻风 SVG 图标组件
 * 图标设计灵感来源于 game-icons.net (CC BY 3.0)
 * 所有 path 为原创简化设计，匹配中世纪奇幻风格
 */

const props = withDefaults(defineProps<{
  name: string
  size?: string
}>(), {
  size: '1em'
})

/* 图标 path 数据 — viewBox 统一 0 0 24 24 */
const icons: Record<string, string> = {
  /* 交叉双剑 */
  'crossed-swords': 'M6.5 2L9 6.5 4 11.5l2 2 5-5 2.5 4.5 2-1-2.5-4.5L18 2h-3l-1 3.5L12.5 2h-6zm5 12L7 18.5 5.5 17 4 18.5 7.5 22l2-1.5L14 16l-2.5-2zm3 0l2.5 2 4.5-4.5L20.5 13l-4 4-2.5-2z',
  /* 奖杯 */
  'trophy': 'M7 2v2H4v4c0 1.7 1.3 3 3 3h.2C7.8 12.9 9.3 14 11 14.5V17H8v2h8v-2h-3v-2.5c1.7-.5 3.2-1.6 3.8-3.5H17c1.7 0 3-1.3 3-3V4h-3V2H7zm0 4h10v2c0 2.2-1.8 4-4 4h-2C8.8 12 7 10.2 7 8V6zM5 6h1v2c0 .4 0 .7.1 1H6c-.6 0-1-.4-1-1V6zm13 0h1v2c0 .6-.4 1-1 1h-.1c.1-.3.1-.6.1-1V6z',
  /* 卷轴 */
  'scroll': 'M6 3a2 2 0 0 0-2 2v1h2V5h12v1h2V5a2 2 0 0 0-2-2H6zM4 7v10a2 2 0 0 0 2 2h1V7H4zm4 0v12h8a2 2 0 0 0 2-2V7H8zm2 2h6v1h-6V9zm0 3h6v1h-6v-1zm0 3h4v1h-4v-1z',
  /* 心脏/生命 */
  'heart': 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  /* 锁 */
  'lock': 'M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  /* 书籍/存档 */
  'book': 'M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm0 2h12v12H6V4zm0 14h12v2H6v-2zm2-12v2h8V6H8zm0 4v2h5v-2H8z',
  /* 盾牌 */
  'shield': 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v5.66c0 3.95-2.59 7.58-6 8.7-3.41-1.12-6-4.75-6-8.7V6.43l6-2.25z',
  /* 星芒/魔法 */
  'sparkle': 'M12 1l2.5 7.5H22l-6 4.5 2.5 7.5L12 16l-6.5 4.5L8 13 2 8.5h7.5L12 1z',
  /* 骷髅 */
  'skull': 'M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2v1h1v-1h2v1h1v-1a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 15c-1.1 0-2-.45-2-1h4c0 .55-.9 1-2 1z',
}
</script>

<template>
  <svg
    class="game-icon"
    :style="{ width: size, height: size }"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path :d="icons[name] || icons['sparkle']" />
  </svg>
</template>

<style scoped>
.game-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
