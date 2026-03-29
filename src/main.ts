import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useWorldStore } from './stores/worldStore'
import { useGameStore } from './stores/gameStore'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化内置世界
const worldStore = useWorldStore()
worldStore.initBuiltinWorlds()

app.mount('#app')

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
