/**
 * useTypewriter — 打字机效果 composable
 * 逐字显示文本，支持点击跳过
 */

import { ref } from 'vue'

export function useTypewriter(defaultSpeed = 40) {
  const displayed = ref('')
  const isTyping = ref(false)
  let fullText = ''
  let activeSessionId = 0

  /** 逐字打字 */
  async function type(text: string, speed = defaultSpeed): Promise<void> {
    const sessionId = ++activeSessionId
    fullText = text
    displayed.value = ''
    isTyping.value = true

    for (let i = 0; i < text.length; i++) {
      if (sessionId !== activeSessionId) return
      displayed.value = text.substring(0, i + 1)
      await new Promise(resolve => setTimeout(resolve, speed))
    }

    if (sessionId !== activeSessionId) return
    displayed.value = text
    isTyping.value = false
  }

  /** 跳过打字效果，直接显示全文 */
  function skip(): void {
    activeSessionId += 1
    displayed.value = fullText
    isTyping.value = false
  }

  /** 重置状态 */
  function reset(): void {
    activeSessionId += 1
    displayed.value = ''
    isTyping.value = false
    fullText = ''
  }

  return { displayed, isTyping, type, skip, reset }
}
