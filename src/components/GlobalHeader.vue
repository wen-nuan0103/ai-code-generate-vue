<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 菜单配置项
const menuItems = ref([
  { key: '/', label: '首页' },
  { key: '/about', label: '关于' },
])

const router = useRouter()

// 处理菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<template>
  <a-layout-header class="header">
    <div class="header-content">
      <div class="logo-section">
        <img src="@/assets/logo.svg" alt="logo" class="logo" />
        <span class="title">AI 代码生成平台</span>
      </div>
      <a-menu mode="horizontal" :items="menuItems" class="menu" @click="handleMenuClick" />
      <div class="user-section">
        <a-button type="primary">登录</a-button>
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
