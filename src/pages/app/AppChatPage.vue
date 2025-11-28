<template>
  <div id="appChatPage">
    <!-- 自定义头部区域 -->
    <div class="custom-header">
      <!-- 左侧：用户头像 + 项目名称 + 下拉箭头 -->
      <div class="header-left">
        <a-avatar :src="userStore.user.avatar" :size="36" />
        <div class="project-name-container">
          <span class="project-name">{{ appInfo?.appName || '未命名项目' }}</span>
          <a-tag v-if="appInfo?.codeGeneratorType" color="blue" class="code-generate-type-tag">
            {{ formatCodeGenType(appInfo.codeGeneratorType) }}
          </a-tag>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="detail" @click="showAppDetail">
                  <InfoCircleOutlined />
                  <span>应用详情</span>
                </a-menu-item>
                <a-menu-item v-if="isOwner || isAdmin" key="edit" @click="editApp">
                  <EditOutlined />
                  <span>编辑应用</span>
                </a-menu-item>
                <a-menu-divider v-if="isOwner || isAdmin" />
                <a-menu-item v-if="isOwner || isAdmin" key="delete" @click="deleteApp" danger>
                  <DeleteOutlined />
                  <span>删除应用</span>
                </a-menu-item>
              </a-menu>
            </template>
            <i class="ri-arrow-down-s-line"></i>
          </a-dropdown>
        </div>
      </div>

      <!-- 中间：功能按钮组 -->
      <div class="header-center">
        <div class="tab-buttons">
          <a-button class="tab-button" :type="activeTab === 'display' ? 'primary' : 'default'"
            @click="activeTab = 'display'">
            <i class="ri-window-line"></i>
          </a-button>
          <a-button class="tab-button" :type="activeTab === 'code' ? 'primary' : 'default'" @click="activeTab = 'code'">
            <i class="ri-code-s-slash-line"></i>
          </a-button>
          <a-button class="tab-button" :type="activeTab === 'settings' ? 'primary' : 'default'"
            @click="activeTab = 'settings'">
            <i class="ri-settings-5-line"></i>
          </a-button>
        </div>

        <!-- 功能按钮区域（仅在"显示"标签时显示） -->
        <div class="action-buttons" :class="{ 'hidden-placeholder': activeTab !== 'display' }">
          <a-button class="tab-button" v-for="btn in actionButtons" :key="btn.key" @click="btn.handler"
            :loading="btn.loading">
            <a-tooltip placement="bottom">
              <template #title>
                {{ btn.label }}
              </template>
              <i :class="btn.icon"></i>
            </a-tooltip>

            <!-- {{ btn.label }} -->
          </a-button>
        </div>
      </div>

      <!-- 右侧：下载 + 部署按钮 -->
      <div class="header-right">
        <a-button @click="downloadApp" :loading="downloading" :disabled="!isOwner">
          <template #icon>
            <DownloadOutlined />
          </template>
        </a-button>
        <a-button class="deploy-button" @click="exportToMarkdown" :loading="exporting">
          <i class="ri-export-line"></i>
          导出记录
        </a-button>
        <a-button class="deploy-button" @click="deployApp" :loading="deploying">
          <i class="ri-rocket-line"></i>
          {{ appInfo?.deployStatus == 0 ? "部署" : appInfo?.deployStatus == 1 ? "下线" : "部署失败"}}
        </a-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：聊天区域 -->
      <div class="chat-section">
        <!-- 消息区域（可滚动） -->
        <div class="messages-container" ref="messagesContainer">
          <!-- 加载更多按钮 -->
          <div v-if="hasMoreHistory" class="load-more-container">
            <a-button type="link" @click="loadMoreHistory" :loading="loadingHistory" size="small">
              加载更多历史消息
            </a-button>
          </div>
          <div v-for="(message, index) in messages" :key="index" class="message-item">
            <div v-if="message.type === 'user'" class="user-message">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-avatar">
                <a-avatar :src="userStore.user.avatar" />
              </div>
            </div>
            <div v-else class="ai-message">
              <div class="message-avatar">
                <a-avatar :src="aiAvatar" />
              </div>
              <div class="message-content">
                <MarkdownRenderer v-if="message.content" :content="message.content" />
                <div v-if="message.loading" class="loading-indicator">
                  <a-spin size="small" />
                  <span>AI 正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部输入框 -->
        <div class="input-container">
          <div class="input-wrapper">
            <a-tooltip v-if="!isOwner" title="无法在别人的作品下对话哦~" placement="top">
              <a-textarea class="chat-content" v-model:value="userInput" placeholder="请描述你想生成的网站，越详细效果越好哦" :rows="4"
                :maxlength="1000" @keydown.enter.prevent="sendMessage" :disabled="isGenerating || !isOwner" />
            </a-tooltip>
            <a-textarea class="chat-content" v-else v-model:value="userInput" placeholder="请描述你想生成的网站，越详细效果越好哦"
              :rows="4" :maxlength="1000" @keydown.enter.prevent="sendMessage" :disabled="isGenerating" />
            <div class="input-actions">
              <a-button class="sent-message-btn" type="primary" @click="sendMessage" :loading="isGenerating"
                :disabled="!isOwner">
                <template #icon>
                  <SendOutlined />
                </template>
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：内容展示区域（根据选中的标签切换） -->
      <div class="content-section">
        <!-- 显示标签内容 -->
        <div v-if="activeTab === 'display'" class="tab-content display-content">
          <div v-if="!previewUrl && !isGenerating" class="preview-placeholder">
            <div class="placeholder-icon">🌐</div>
            <p>网站文件生成完成后将在这里展示</p>
          </div>
          <div v-else-if="isGenerating" class="preview-loading">
            <a-spin size="large" />
            <p>正在生成网站...</p>
          </div>
          <iframe v-else :src="previewUrl" class="preview-iframe" frameborder="0" @load="onIframeLoad"></iframe>
        </div>

        <!-- 代码标签内容 -->
        <div v-else-if="activeTab === 'code'" class="tab-content code-content">
          <div class="editor-container">
            <!-- Tabs -->
            <div class="tabs">
              <div v-for="f in files" :key="f.id" class="tab" :class="{ active: f.id === activeFileId }"
                @click="switchFile(f.id)">
                {{ f.name }}
              </div>
            </div>
            <CodeEditor v-model:value="code" :language="language" :options="editorOptions" class="editor"
              @change="onCodeChange" />
          </div>
        </div>

        <!-- 设置标签内容 -->
        <div v-else-if="activeTab === 'settings'" class="tab-content settings-content">
          <div class="settings-placeholder">
            <div class="placeholder-icon">⚙️</div>
            <p>设置区域（预留后端数据注入）</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal v-model:open="appDetailVisible" :app="appInfo" :show-actions="isOwner || isAdmin" @edit="editApp"
      @delete="deleteApp" />

    <!-- 部署成功弹窗 -->
    <DeploySuccessModal v-model:open="deployModalVisible" :deploy-url="deployUrl" @open-site="openDeployedSite" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import * as monaco from "monaco-editor";
import { CodeEditor } from 'monaco-editor-vue3';
import { useUserStore } from '@/stores/user'
import {
  getAppVoById,
  deploy as deployAppApi,
  deleteApp as deleteAppApi,
} from '@/api/appController'
import { CodeGenTypeEnum, formatCodeGenType } from '@/utils/codeGenerateTypes'
import request from '@/request'

import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import DeploySuccessModal from '@/components/DeploySuccessModal.vue'
import aiAvatar from '@/assets/aiAvatar.png'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'

import {
  SendOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import { exportMarkdown, listAppChatHistory } from '@/api/chatHistoryController'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
const appId = ref<string>()

// 标签切换状态
const activeTab = ref<'display' | 'code' | 'settings'>('display')

// 对话相关
interface Message {
  type: 'user' | 'ai'
  content: string
  loading?: boolean
}
const messages = ref<Message[]>([])
const userInput = ref('')
const isGenerating = ref(false)
const messagesContainer = ref<HTMLElement>()
const hasInitialConversation = ref(false) // 标记是否已经进行过初始对话

const code = ref("");
const language = ref("javascript")
const files = ref([
  {
    id: "file1",
    name: "index.js",
    value: `function hello() {\n  console.log("Hello World");\n}`,
  },
  {
    id: "file2",
    name: "style.css",
    value: `body {\n  background: #f2f2f2;\n}`,
  },
  {
    id: "file3",
    name: "README.md",
    value: `# Project\n\nThis is a multi-file Monaco editor.`,
  },
]);
const activeFileId = ref("file1");
const models = new Map();

const editorOptions = {
  readOnly: false,
  minimap: { enabled: true },
  fontSize: 14,
  wordWrap: "on",
  automaticLayout: true,
};



// 对话历史相关
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const lastCreateTime = ref<string>()
const historyLoaded = ref(false)

// 预览相关
const previewUrl = ref('')
const previewReady = ref(false)

// 部署相关
const deploying = ref(false)
const deployModalVisible = ref(false)
const deployUrl = ref('')

// 导出相关
const exporting = ref(false)

// 权限相关
const isOwner = computed(() => {
  return appInfo.value?.userId === userStore.user.id
})
const isAdmin = computed(() => {
  return userStore.user.role === 'admin'
})

// 应用详情相关
const appDetailVisible = ref(false)

// 头部功能按钮配置（仅在"显示"标签时显示，方便后期修改）
const actionButtons = ref([
  {
    key: 'showAll',
    label: '全部显示',
    icon: 'ri-fullscreen-line',
    handler: () => showAllContent(),
    loading: false,
  },
  {
    key: 'refresh',
    label: '刷新',
    icon: 'ri-refresh-line',
    handler: () => refreshPreview(),
    loading: false,
  },
  {
    key: 'openNew',
    label: '新窗口打开',
    icon: 'ri-send-plane-line',
    handler: () => openInNewTab(),
    loading: false,
  },
])

// 显示应用详情
const showAppDetail = () => {
  appDetailVisible.value = true
}

// 加载对话历史
const loadChatHistory = async (isLoadMore = false) => {
  if (!appId.value || loadingHistory.value) return
  loadingHistory.value = true
  try {
    const params: API.listAppChatHistoryParams = {
      appId: appId.value as unknown as number,
      pageNum: 10,
    }
    // 如果是加载更多，传递最老一条消息的创建时间作为游标
    if (isLoadMore && lastCreateTime.value) {
      params.lastCreateTime = lastCreateTime.value
    }
    const res = await listAppChatHistory(params)
    if (res.data.code === 0 && res.data.data) {
      const chatHistories = res.data.data.records || []
      if (chatHistories.length > 0) {
        // 需要反转数组，让老消息在前
        const historyMessages: Message[] = chatHistories.reverse().map((chat) => ({
          type: (chat.messageType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
          content: chat.message || '',
        }))

        if (isLoadMore) {
          // 加载更多时，将历史消息添加到开头
          messages.value.unshift(...historyMessages)
        } else {
          // 初始加载，直接设置消息列表
          messages.value = historyMessages
        }

        // 更新游标：因为后端返回的是降序，所以最后一条（反转前）是最老的
        // 反转后，chatHistories[0] 是最老的
        lastCreateTime.value = chatHistories[0]?.createTime

        // 检查是否还有更多历史
        hasMoreHistory.value = chatHistories.length === 10
      } else {
        hasMoreHistory.value = false
      }
      historyLoaded.value = true
    }
  } catch (error) {
    console.error('加载对话历史失败：', error)
    message.error('加载对话历史失败')
  } finally {
    loadingHistory.value = false
  }
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  await loadChatHistory(true)
}

// 获取应用信息
const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('应用ID不存在')
    router.push('/')
    return
  }

  appId.value = id

  try {
    const res = await getAppVoById({ id: id as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    console.error('获取应用信息失败：', error)
    message.error('获取应用信息失败')
    router.push('/')
  }
}

// 发送初始消息
const sendInitialMessage = async (prompt: string) => {
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: prompt,
  })

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(prompt, aiMessageIndex)
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) {
    return
  }

  const message = userInput.value.trim()
  userInput.value = ''

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: message,
  })

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(message, aiMessageIndex)
}

// 生成代码 - 使用 EventSource 处理流式响应
const generateCode = async (userMessage: string, aiMessageIndex: number) => {
  let eventSource: EventSource | null = null
  let streamCompleted = false

  try {
    const baseURL = request.defaults.baseURL || API_BASE_URL
    const params = new URLSearchParams({
      appId: appId.value || '',
      userMessage: userMessage,
    })
    const url = `${baseURL}/app/chat/generate/code?${params}`

    // 创建 EventSource 连接
    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    let fullContent = ''

    // 处理接收到的消息
    eventSource.onmessage = function (event) {
      if (streamCompleted) return

      try {
        const parsed = JSON.parse(event.data)
        const content = parsed.d

        // 拼接内容
        if (content !== undefined && content !== null) {
          fullContent += content
          const aiMessage = messages.value[aiMessageIndex]
          if (aiMessage) {
            aiMessage.content = fullContent
            aiMessage.loading = false
          }
          scrollToBottom()
        }
      } catch (error) {
        console.error('解析消息失败:', error)
        handleError(error, aiMessageIndex)
      }
    }

    // 处理done事件
    eventSource.addEventListener('done', function () {
      if (streamCompleted) return

      streamCompleted = true
      isGenerating.value = false
      eventSource?.close()

      setTimeout(async () => {
        await fetchAppInfo()
        updatePreview()
      }, 1000)
    })

    // 处理错误
    eventSource.onerror = function () {
      if (streamCompleted || !isGenerating.value) return
      // 检查是否是正常的连接关闭
      if (eventSource?.readyState === EventSource.CONNECTING) {
        streamCompleted = true
        isGenerating.value = false
        eventSource?.close()

        setTimeout(async () => {
          await fetchAppInfo()
          updatePreview()
        }, 1000)
      } else {
        handleError(new Error('SSE连接错误'), aiMessageIndex)
      }
    }
  } catch (error) {
    console.error('创建 EventSource 失败：', error)
    handleError(error, aiMessageIndex)
  }
}

// 错误处理函数
const handleError = (error: unknown, aiMessageIndex: number) => {
  console.error('生成代码失败：', error)
  const aiMessage = messages.value[aiMessageIndex]
  if (aiMessage) {
    aiMessage.content = '抱歉，生成过程中出现了错误，请重试。'
    aiMessage.loading = false
  }
  message.error('生成失败，请重试')
  isGenerating.value = false
}

// 更新预览
const updatePreview = () => {
  if (appId.value) {
    const codeGenType = appInfo.value?.codeGeneratorType || CodeGenTypeEnum.HTML
    const newPreviewUrl = getStaticPreviewUrl(codeGenType, appId.value)
    previewUrl.value = newPreviewUrl
    previewReady.value = true
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 切换文件
const switchFile = (id: string) => {
  activeFileId.value = id;
  const file = files.value.find((f) => f.id === id);
  if (file) {
    if (!models.has(id)) {
      const model = monaco.editor.createModel(
        file.value,
        getLanguageByExtension(file.name)
      );
      models.set(id, model);
    }
  }

  const model = models.get(id);

  // 设置编辑器内容（v-model）
  code.value = model.getValue();
  language.value = model.getLanguageId();
}

// 当切换文件,需要更改代码编辑器的内容
const onCodeChange = (newVal: any) => {
  const model = models.get(activeFileId.value);
  if (model && newVal !== model.getValue()) {
    model.setValue(newVal);
  }
}

// 获取文件扩展名,用于高亮显示
const getLanguageByExtension = (name: string) => {
  const ext = name.split(".").pop();
  switch (ext) {
    case "js": return "javascript";
    case "ts": return "typescript";
    case "vue": return "vue";
    case "json": return "json";
    case "html": return "html";
    case "css": return "css";
    case "scss": return "scss";
    case "md": return "markdown";
    default: return "plaintext";
  }
}

// 部署应用
const deployApp = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  deploying.value = true
  try {
    switch(appInfo.value?.deployStatus) {
      case 0:
      case 2:
        const res = await deployAppApi({
          appId: appId.value as unknown as number,
        })

        if (res.data.code === 0 && res.data.data) {
          deployUrl.value = res.data.data
          deployModalVisible.value = true
          message.success('部署成功')
        } else {
          message.error('部署失败：' + res.data.message)
        }
        break
      case 1:
        message.info("应用部署下线待实现")
        break
    }
  } catch (error) {
    console.error('部署失败：', error)
    message.error('部署失败，请重试')
  } finally {
    deploying.value = false
  }
}

// 导出 Markdown 聊天记录
const exportToMarkdown = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  exporting.value = true
  try {
    const res = await exportMarkdown({
      appId: appId.value as unknown as number,
    })

    if (res.data.code === 0 && res.data.data) {

      const markdown = res.data.data;
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-history-${appId.value}.md`;
      link.click();

      URL.revokeObjectURL(url);
      message.success('导出成功')
    } else {
      message.error('导出失败：' + res.data.message)
    }
  } catch (error) {
    console.error('导出失败：', error)
    message.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 打开部署的网站
const openDeployedSite = () => {
  if (deployUrl.value) {
    window.open(deployUrl.value, '_blank')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  previewReady.value = true
}

// 编辑应用
const editApp = () => {
  if (appInfo.value?.id) {
    router.push(`/app/edit/${appInfo.value.id}`)
  }
}

// 删除应用
const deleteApp = async () => {
  if (!appInfo.value?.id) return

  try {
    const res = await deleteAppApi({ id: appInfo.value.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      appDetailVisible.value = false
      router.push('/')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    console.error('删除失败：', error)
    message.error('删除失败')
  }
}

// 全部显示功能
const showAllContent = () => {
  message.info('全部显示功能（预留）')
}

// 刷新预览
const refreshPreview = () => {
  if (previewUrl.value) {
    updatePreview()
    message.success('刷新成功')
  } else {
    message.warning('暂无可刷新的内容')
  }
}


// 下载相关
const downloading = ref(false)

// 下载应用
const downloadApp = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }
  downloading.value = true
  try {
    const API_BASE_URL = request.defaults.baseURL || ''
    const url = `${API_BASE_URL}/app/download/${appId.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId.value}.zip`
    // 下载文件
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    link.click()
    // 清理
    URL.revokeObjectURL(downloadUrl)
    message.success('代码下载成功')
  } catch (error) {
    console.error('下载失败：', error)
    message.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}



// 初始化页面
const initPage = async () => {
  // 1. 先获取应用信息
  await fetchAppInfo()

  if (!appId.value || !appInfo.value) {
    return
  }

  // 2. 加载对话历史
  await loadChatHistory()

  // 3. 如果有至少 2 条对话记录，展示对应的网站
  if (messages.value.length >= 2) {
    updatePreview()
  }

  // 4. 如果是自己的 app，并且没有对话历史，才自动将 initPrompt 作为第一条消息触发对话
  if (
    isOwner.value &&
    messages.value.length === 0 &&
    appInfo.value.initPrompt &&
    !hasInitialConversation.value
  ) {
    hasInitialConversation.value = true
    await sendInitialMessage(appInfo.value.initPrompt)
  }
}

// 页面加载时初始化
onMounted(() => {
  initPage()
})

// 清理资源
onUnmounted(() => {
  // EventSource 会在组件卸载时自动清理
})
</script>

<style scoped>
#appChatPage {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
}

/* 自定义头部区域 */
.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #ffffff;
  /* border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); */
  z-index: 100;
}

/* 头部左侧 */
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.project-name-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-generate-type-tag {
  font-size: 12px;
}

/* 头部中间 */
.header-center {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: center;
}

.tab-buttons {
  display: flex;
  background-color: #f5f5f5;
  border-radius: 10px;
  /* gap: 8px; */
}

.tab-button {
  padding: 4px 8px !important;
  margin: 8px !important;
}

.tab-button:nth-child(2) {
  margin: 8px 0px !important;
}

.action-buttons {
  display: flex;
  /* gap: 8px;
  margin-left: 16px; */
  padding-left: 16px;
  border-left: 1px solid #e8e8e8;
}

:where(.css-dev-only-do-not-override-1p3hq3p).tab-button.ant-btn-default {
  background-color: #f5f5f5;
  border-color: transparent;
}

/* 隐藏但保持空间占位 */
.hidden-placeholder {
  visibility: hidden;
  pointer-events: none;
}

/* 头部右侧 */
.header-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* 部署按钮样式（黑色） */
.deploy-button {
  background-color: #1a1a1a;
  border-color: #1a1a1a;
  color: #ffffff;
}

.deploy-button:hover {
  background-color: #333333;
  border-color: #333333;
  color: #ffffff;
}

.deploy-button:active,
.deploy-button:focus {
  background-color: #000000;
  border-color: #000000;
  color: #ffffff;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  /* gap: 16px; */
  /* padding: 16px; */
  overflow: hidden;
}

/* 左侧对话区域 */
.chat-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-item {
  margin-bottom: 12px;
}

.user-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 8px;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user-message .message-content {
  background: #1890ff;
  color: white;
}

.ai-message .message-content {
  background: #f5f5f5;
  color: #1a1a1a;
  padding: 8px 12px;
}

.message-avatar {
  flex-shrink: 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

/* 输入区域 */
.input-container {
  padding: 16px;
  background: white;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .ant-input {
  padding-right: 50px;
}

.chat-content {
  background-color: #f5f5f5;
  border-color: transparent;
  border-radius: 15px;
  resize: none;
  width: 100%;
  height: 120px;
  min-height: 120px;
  max-height: 120px;
  overflow: auto;
}

.chat-content:hover {
  border-color: transparent;
}

.input-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.sent-message-btn {
  border-color: transparent;
}

/* 右侧内容展示区域 */
.content-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  background: white;

  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); */
  padding: 16px;

  overflow: hidden;
}

/* 标签内容容器 */
.tab-content {
  flex: 1;
  position: relative;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid oklch(0.928 0.006 264.531);
}

/* 显示标签内容 */
.display-content {
  display: flex;
  flex-direction: column;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.preview-placeholder p {
  font-size: 14px;
  color: #999;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.preview-loading p {
  margin-top: 16px;
  font-size: 14px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 代码标签内容 */
.code-content {
  padding: 16px;
  /* background: #fafafa; */
}

.code-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

/* 设置标签内容 */
.settings-content {
  padding: 24px;
}

.settings-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs {
  display: flex;
  padding: 6px;
  user-select: none;
}

.tab {
  padding: 6px 14px;
  margin-right: 6px;
  color: #94979D;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 13px;
}

.tab.active {
  color: #000000;
  background: #f4f5f7;
  border-radius: 5px;
  /* border-bottom: 2px solid #007acc; */
}



/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .chat-section,
  .content-section {
    flex: none;
    height: 50vh;
  }

  .header-center {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
  }
}

@media (max-width: 768px) {
  .custom-header {
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 8px;
  }

  .header-center {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }

  .tab-buttons {
    flex-wrap: wrap;
  }

  .project-name {
    max-width: 120px;
    font-size: 14px;
  }

  .main-content {
    padding: 8px;
    gap: 8px;
  }

  .message-content {
    max-width: 85%;
  }

  .header-right {
    flex-wrap: wrap;
  }
}
</style>
