<script setup lang="ts"></script>

<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      AI 零代码生成平台
    </div>
  </a-layout-footer>
</template>

<style scoped>
.footer {
  background: #f0f2f5;
  text-align: center;
  padding: 24px 50px;
  position: relative;
  bottom: 0;
  width: 100%;
}

.footer-content {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.footer-content a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.3s;
}

.footer-content a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 20px 16px;
  }

  .footer-content {
    font-size: 12px;
  }
}
</style>
