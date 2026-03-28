import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useWorldStore } from './stores/worldStore'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化内置世界
const worldStore = useWorldStore()
worldStore.initBuiltinWorlds()

app.mount('#app')
