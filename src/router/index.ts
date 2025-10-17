import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: "/user/login",
      name: 'user_login',
      component: () => import('@/pages/user/UserLoginPage.vue')
    },
    {
      path: "/user/register",
      name: 'user_register',
      component: () => import('@/pages/user/UserRegisterPage.vue')
    },
  ],
})

export default router
