import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useWorldStore } from './stores/worldStore'
import { useGameStore } from './stores/gameStore'
import { registerPwa } from './pwa'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 全局错误捕获（调试用）
app.config.errorHandler = (err, vm, info) => {
  console.error('KT---Vue全局错误---', info, err)
  document.body.innerHTML += `<pre style="color:red;padding:20px;background:#111;position:fixed;top:0;left:0;right:0;z-index:99999;font-size:14px;max-height:50vh;overflow:auto">Vue Error: ${info}\n${err}</pre>`
}

// 初始化内置世界
try {
  const worldStore = useWorldStore()
  worldStore.initBuiltinWorlds()
} catch (e) {
  console.error('KT---世界初始化失败---', e)
  document.body.innerHTML = `<pre style="color:red;padding:20px;background:#111;font-size:14px;white-space:pre-wrap">世界初始化失败:\n${e}\n\n${(e as Error).stack ?? ''}</pre>`
}

app.mount('#app')
registerPwa()

// 开发模式调试 API
if (import.meta.env.DEV) {
  const gameStore = useGameStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__game = gameStore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__startYear = () => gameStore.startYear()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__resolveBranch = (id: string) => gameStore.resolveBranch(id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__skipYear = () => gameStore.skipYear()
}
