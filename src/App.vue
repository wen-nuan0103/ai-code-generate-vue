<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
import BasicLayout from './layouts/BasicLayout.vue'
const locale = zhCN

import { useUserStore } from '@/stores/user.ts'

const userStore = useUserStore()
userStore.fetchLoginUser()
</script>

<template>
  <a-config-provider :locale="locale">
    <BasicLayout />
  </a-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

#app {
  min-height: 100vh;
}
</style>
