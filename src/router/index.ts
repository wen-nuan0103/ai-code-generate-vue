import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import ACCESS_ENUM from '@/access/accessEnum'

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
    {
      path:"/admin/userManage",
      name:"user_manage",
      component: () => import('@/pages/admin/UserManagePage.vue'),
      meta:{
        access:ACCESS_ENUM.ADMIN
      }
    }
  ],
})

export default router
