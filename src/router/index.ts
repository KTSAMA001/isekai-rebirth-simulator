/**
 * Vue Router 路由配置
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/setup/:worldId',
      name: 'setup',
      component: () => import('@/views/SetupView.vue'),
      props: true,
    },
    {
      path: '/play/:worldId/:playId',
      name: 'play',
      component: () => import('@/views/SimulationView.vue'),
      props: true,
    },
    {
      path: '/result/:worldId/:playId',
      name: 'result',
      component: () => import('@/views/ResultView.vue'),
      props: true,
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementView.vue'),
    },
  ],
})

export default router
