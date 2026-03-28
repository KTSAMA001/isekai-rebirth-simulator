/**
 * settingsStore — 全局设置
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const autoSpeed = ref(1)

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    autoSpeed,
    toggleTheme,
  }
})
