import { registerSW } from 'virtual:pwa-register'

/** 注册 PWA Service Worker */
export function registerPwa() {
  if (import.meta.env.DEV) {
    return
  }

  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('KT---PWA---离线缓存已就绪')
    },
    onNeedRefresh() {
      console.info('KT---PWA---检测到新版本，准备刷新')
      updateSW(true)
    },
    onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
      console.info('KT---PWA---Service Worker 已注册', swScriptUrl)
      if (!registration) {
        return
      }
    },
    onRegisterError(error: unknown) {
      console.error('KT---PWA---Service Worker 注册失败', error)
    },
  })
}