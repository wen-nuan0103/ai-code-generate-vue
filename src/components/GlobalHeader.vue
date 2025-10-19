<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogoutOutlined } from '@ant-design/icons-vue'
import { logout } from '@/api/userController'
import { message } from 'ant-design-vue'
import checkAccess from '@/access/checkAccess'

// 菜单配置项
const menuItems = ref([
  { key: '/', label: '首页' },
  { key: '/admin/userManage', label: '用户管理' },
  { key: '/about', label: '关于' },
])

const router = useRouter()
const allRoutes = router.getRoutes()
// console.log(allRoutes);
const userStore = useUserStore()



// 处理菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

// 将菜单项转换为路由菜单
const menuToRouteItem = ((menu: any) => {
  const route = allRoutes.find(it => it.path === menu.key)
  return {
    path: route?.path,
    meta: route?.meta
  }
})

// 过滤菜单项
const items = computed(() => {
  return menuItems.value.filter((menu) => {
    const item = menuToRouteItem(menu);
    if (item.meta?.hideInMenu) {
      return false;
    }
    // 根据权限过滤菜单，有权限则返回 true，则保留该菜单
    return checkAccess(userStore.user, item.meta?.access as string);
  })
})


const handleLogout = async () => {
  const result = await logout()
  if (result.data.code === 0) {
    userStore.setUser({
      userName: '未登录'
    })
    message.success("退出登录成功")
    await router.push("/user/login")
  } else {
    message.error(`退出登录失败: ${result.data.message}`)
  }
}
</script>

<template>
  <a-layout-header class="header">
    <div class="header-content">
      <div class="logo-section">
        <img src="@/assets/logo.svg" alt="logo" class="logo" />
        <span class="title">AI 代码生成平台</span>
      </div>
      <a-menu mode="horizontal" :items="items" class="menu" @click="handleMenuClick" />
      <div class="user-section">
        <div class="user-login-status">
          <div v-if="userStore.user.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="userStore.user.avatar" />
                {{ userStore.user.userName ?? '无名' }}
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </div>
    </div>
  </a-layout-header>
</template>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo {
  height: 40px;
  width: 40px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  white-space: nowrap;
}

.menu {
  flex: 1;
  min-width: 0;
  border-bottom: none;
  line-height: 64px;
  margin: 0 24px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .title {
    display: none;
  }

  .menu {
    margin: 0 12px;
  }

  .logo {
    height: 32px;
    width: 32px;
  }
}

@media (max-width: 576px) {
  .menu {
    flex: 0;
    min-width: auto;
  }
}
</style>
