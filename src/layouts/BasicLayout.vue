<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<template>
  <a-layout class="basic-layout">
    <!-- 顶部导航栏 -->
    <GlobalHeader />

    <!-- 中间内容区域 -->
    <a-layout-content class="content">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </a-layout-content>

    <!-- 底部版权信息 -->
    <GlobalFooter />
  </a-layout>
</template>

<style scoped>
.basic-layout {
  background: none;
  min-height: 100vh;
}

.content {
  width: 100%;
  padding: 0;
  background: none;
  margin: 0;
  padding-top: 64px; /* 为固定的导航头留出空间 */
}

.content-wrapper {
  min-height: calc(100vh - 64px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .content-wrapper {
    padding: 12px;
  }
}
</style>
