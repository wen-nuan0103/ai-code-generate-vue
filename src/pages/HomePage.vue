<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { addApp, listMyAppVoByPage, listAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'

const router = useRouter()
const userStore = useUserStore()

// 用户提示词
const userPrompt = ref('')
const creating = ref(false)

// 我的应用数据
const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 3,
  total: 0,
})
// 我的应用排序
const myAppsSortType = ref('default')

// 精选应用数据
const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
  current: 1,
  pageSize: 3,
  total: 0,
})
// 精选应用排序和标签筛选
const featuredSortType = ref('default')
const selectedTag = ref('全部')

// 示例标签列表（后续可从后端获取）
const categoryTags = [
  '全部',
  '工具',
  '网站',
  '数据分析',
  '活动页面',
  '管理平台',
  '用户应用',
  '个人管理',
  '游戏',
]

// 设置提示词
const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

// 优化提示词功能已移除

// 创建应用
const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!userStore.user.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({
      initPrompt: userPrompt.value.trim(),
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      // 跳转到对话页面，确保ID是字符串类型
      const appId = String(res.data.data)
      await router.push(`/app/chat/${appId}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    console.error('创建应用失败：', error)
    message.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 加载我的应用
const loadMyApps = async () => {
  if (!userStore.user.id) {
    return
  }

  try {
    let sortField = 'create_time'
    let sortOrder = 'desc'

    if (myAppsSortType.value === 'newest') {
      sortField = 'create_time'
      sortOrder = 'desc'
    } else if (myAppsSortType.value === 'hottest') {
      sortField = 'view_count'
      sortOrder = 'desc'
    }

    const res = await listMyAppVoByPage({
      pageNum: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField,
      sortOrder,
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载我的应用失败：', error)
  }
}

// 切换我的应用排序
const changeMyAppsSort = (sortType: string) => {
  myAppsSortType.value = sortType
  myAppsPage.current = 1
  loadMyApps()
}

// 加载精选应用
const loadFeaturedApps = async () => {
  try {
    let sortField = 'create_time'
    let sortOrder = 'desc'

    if (featuredSortType.value === 'newest') {
      sortField = 'create_time'
      sortOrder = 'desc'
    } else if (featuredSortType.value === 'hottest') {
      sortField = 'view_count'
      sortOrder = 'desc'
    }

    const res = await listAppVoByPage({
      pageNum: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField,
      sortOrder,
      // TODO: 后续可添加标签筛选参数
      // tag: selectedTag.value !== '全部' ? selectedTag.value : undefined,
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载精选应用失败：', error)
  }
}

// 切换精选应用排序
const changeFeaturedSort = (sortType: string) => {
  featuredSortType.value = sortType
  featuredAppsPage.current = 1
  loadFeaturedApps()
}

// 切换标签筛选
const changeTag = (tag: string) => {
  selectedTag.value = tag
  featuredAppsPage.current = 1
  loadFeaturedApps()
}

// 查看对话
const viewChat = (appId: string | number | undefined) => {
  if (appId) {
    router.push(`/app/chat/${appId}?view=1`)
  }
}

// 查看作品
const viewWork = (app: API.AppVO) => {
  if (app.deployKey) {
    const url = getDeployUrl(app.deployKey)
    window.open(url, '_blank')
  }
}

// 格式化时间函数已移除，不再需要显示创建时间

// 页面加载时获取数据
onMounted(() => {
  loadMyApps()
  loadFeaturedApps()
})
</script>

<template>
      <img
      src="@/assets/home-background.png"
      alt="background"
      class="background-image"
      draggable="false"
    />
  <div id="homePage">
    <!-- 背景图片 -->


    <!-- 顶部标题和输入框区域 -->
    <div class="hero-container">
      <!-- 网站标题和描述 -->
      <div class="hero-section">
        <h1 class="hero-title">
          <span class="title-text">一句话</span>
          <!-- <img src="@/assets/logo.svg" alt="NoCode" class="title-logo" /> -->
          <span class="title-text">呈所想</span>
        </h1>
        <p class="hero-description">与 AI 对话轻松创建应用和网站</p>
      </div>

      <!-- 用户提示词输入框 -->
      <div class="input-section">
        <a-textarea
          v-model:value="userPrompt"
          placeholder="使用 NoCode 创建一个活动"
          :rows="4"
          :maxlength="500"
          class="prompt-input"
        />
        <div class="input-actions">
          <a-button
            type="primary"
            size="large"
            @click="createApp"
            :loading="creating"
            class="submit-btn"
          >
            <template #icon>
              <span>↑</span>
            </template>
          </a-button>
        </div>
      </div>
    </div>

    <!-- 快捷按钮 -->
    <div class="quick-actions">
      <a-button
        type="default"
        @click="
          setPrompt(
            '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能、评论系统和个人简介页面。采用简洁的设计风格，支持响应式布局，文章支持Markdown格式，首页展示最新文章和热门推荐。',
          )
        "
        >装备内电商页面</a-button
      >
      <a-button
        type="default"
        @click="
          setPrompt(
            '设计一个专业的企业官网，包含公司介绍、产品服务展示、新闻资讯、联系我们等页面。采用商务风格的设计，包含轮播图、产品展示卡片、团队介绍、客户案例展示，支持多语言切换和在线客服功能。',
          )
        "
        >企业网站</a-button
      >
      <a-button
        type="default"
        @click="
          setPrompt(
            '构建一个功能完整的在线商城，包含商品展示、购物车、用户注册登录、订单管理、支付结算等功能。设计现代化的商品卡片布局，支持商品搜索筛选、用户评价、优惠券系统和会员积分功能。',
          )
        "
        >电商运营综合</a-button
      >
      <a-button
        type="default"
        @click="
          setPrompt(
            '制作一个精美的作品展示网站，适合设计师、摄影师、艺术家等创作者。包含作品画廊、项目详情页、个人简历、联系方式等模块。采用瀑布流或网格布局展示作品，支持图片放大预览和作品分类筛选。',
          )
        "
        >编辑活动社区</a-button
      >
    </div>

    <!-- 内容区域（浅色背景） -->
    <div class="content-container">
      <!-- 白色容器：我的作品 + 案例广场 -->
      <div class="works-container">
        <!-- 我的作品 -->
        <div class="section" v-if="userStore.user.id">
          <div class="section-header">
            <h2 class="section-title">我的作品</h2>
          </div>
          <div class="app-grid">
            <AppCard
              v-for="app in myApps"
              :key="app.id"
              :app="app"
              @view-chat="viewChat"
              @view-work="viewWork"
            />
          </div>
          <div class="pagination-wrapper" v-if="myAppsPage.total > myAppsPage.pageSize">
            <a-pagination
              v-model:current="myAppsPage.current"
              v-model:page-size="myAppsPage.pageSize"
              :total="myAppsPage.total"
              :show-size-changer="false"
              :show-total="(total: number) => `共 ${total} 个应用`"
              @change="loadMyApps"
            />
          </div>
        </div>

        <!-- 案例广场 -->
        <div class="section">
          <h2 class="section-title">案例广场</h2>

          <!-- 筛选控制栏：排序下拉 + 标签 + 全部案例 -->
          <div class="filter-bar">
            <a-dropdown>
              <a-button class="sort-dropdown">
                默认排序 <span style="margin-left: 4px">▼</span>
              </a-button>
              <template #overlay>
                <a-menu @click="({ key }: any) => changeFeaturedSort(key)">
                  <a-menu-item key="default">默认排序</a-menu-item>
                  <a-menu-item key="newest">最新</a-menu-item>
                  <a-menu-item key="hottest">最热</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <div class="tags">
              <a-button
                v-for="tag in categoryTags"
                :key="tag"
                :type="selectedTag === tag ? 'primary' : 'default'"
                @click="changeTag(tag)"
                class="tag-btn"
              >
                {{ tag }}
              </a-button>
            </div>

            <a-button class="view-all-btn" @click="() => router.push('/apps')">
              🔍 全部案例 >
            </a-button>
          </div>

          <div class="featured-grid">
            <AppCard
              v-for="app in featuredApps"
              :key="app.id"
              :app="app"
              :featured="true"
              @view-chat="viewChat"
              @view-work="viewWork"
            />
          </div>
          <div class="more-cases">
            <a-button size="large" @click="() => router.push('/apps')"> 查看更多 </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#homePage {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景图片 - 参考 nocode.cn 的实现 */
.background-image {
  position: absolute;
  left: 50%;
  /* top: 80px; */
  transform: translateX(-50%);
  width: 2560px;
  min-width: 0;
  max-width: none;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

/* 顶部区域容器 */
.hero-container {
  width: 100%;
  padding: 150px 20px 40px;
  position: relative;
  z-index: 1;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
  color: #1e293b;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 20px;
  line-height: 1.2;
  color: #1e293b;
  letter-spacing: -1px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-text {
  color: #1e293b;
}

.title-logo {
  height: 56px;
  width: 56px;
  vertical-align: middle;
}

@keyframes titleShimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-description {
  font-size: 20px;
  margin: 0;
  opacity: 0.8;
  color: #64748b;
  position: relative;
  z-index: 2;
}

/* 输入区域 */
.input-section {
  position: relative;
  margin: 0 auto;
  max-width: 800px;
}

.prompt-input {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 16px;
  padding: 20px 20px 60px 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  resize: vertical;
  min-height: 120px;
  max-height: 400px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;
}

.prompt-input:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.prompt-input:focus {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 16px 48px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
  border: 1px solid #3b82f6;
  outline: none;
}

/* 拖拽时的平滑效果 */
.prompt-input:active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-actions {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.upload-btn,
.optimize-btn {
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-btn:hover,
.optimize-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.submit-btn {
  /* border-radius: 50%; */
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

/* 内容区域（浅色背景） */
.content-container {
  width: 100%;
  /* background: #f8fafb; */
  position: relative;
  z-index: 1;
  padding: 60px 40px 80px;
}

/* 快捷按钮 */
.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 160px;
  flex-wrap: wrap;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;
}

.quick-actions .ant-btn {
  border-radius: 20px;
  padding: 8px 20px;
  height: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.quick-actions .ant-btn:hover {
  background: #ffffff;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 白色作品容器 */
.works-container {
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* 区域标题 */
.section {
  /* margin-bottom: 60px; */
}

.section:last-child {
  margin-bottom: 0;
}

.section:not(:last-child) {
  padding-bottom: 60px;
  border-bottom: 1px solid #f1f5f9;
}

.section-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: #1e293b;
}

/* 筛选控制栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.sort-dropdown {
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 6px 16px;
  height: auto;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.tag-btn {
  border-radius: 16px;
  padding: 6px 16px;
  height: auto;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
}

.tags .ant-btn-primary {
  color: #1677ff !important;
}

.tag-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.view-all-btn {
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 6px 16px;
  height: auto;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-all-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

/* 我的作品网格 */
.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

/* 精选案例网格 */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

/* 查看更多按钮 */
.more-cases {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.more-cases .ant-btn {
  border-radius: 20px;
  padding: 10px 40px;
  height: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.more-cases .ant-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-grid,
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-container {
    padding: 40px 24px 60px;
  }

  .works-container {
    padding: 40px 32px;
  }

  .quick-actions {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .background-image {
    width: 1920px;
    top: 60px;
  }

  .hero-container {
    padding: 60px 16px 32px;
  }

  .hero-title {
    font-size: 32px;
  }

  .title-logo {
    height: 32px;
    width: 32px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-section {
    margin-bottom: 32px;
  }

  .app-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    justify-content: center;
    margin-bottom: 32px;
    padding: 0 20px;
  }

  .section-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .tags {
    order: 2;
  }

  .view-all-btn {
    order: 3;
  }

  .sort-dropdown {
    order: 1;
  }

  .content-container {
    padding: 40px 20px;
  }

  .works-container {
    padding: 40px 24px;
    border-radius: 16px;
  }


  .section:not(:last-child) {
    padding-bottom: 40px;
  }
}

@media (max-width: 576px) {
  .background-image {
    width: 1440px;
    top: 40px;
  }

  .input-section {
    max-width: 100%;
  }

  .works-container {
    padding: 32px 20px;
  }

  .quick-actions {
    padding: 0 16px;
  }
}
</style>
