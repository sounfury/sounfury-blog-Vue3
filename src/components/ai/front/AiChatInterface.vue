<template>
  <div class="chat-interface">
    <!-- 消息区域 -->
    <div class="messages-container" ref="messagesContainer">
      <!-- 加载更多指示器 -->
      <div v-if="aiStore.loadingMoreMessages" class="loading-more">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <span>加载更多消息...</span>
        </div>
      </div>
      
      <!-- 使用ant-design-x-vue的Bubble.List -->
      <Bubble.List 
        :items="displayMessages"
        class="bubble-list"
      >
        <template #avatar="{ item }">
          <img 
            v-if="item.avatar" 
            :src="item.avatar" 
            :alt="item.role === 'assistant' ? currentPersona?.name : '用户'"
            class="message-avatar"
          />
        </template>
        
        <template #message="{ item }">
          <!-- AI消息使用markdown渲染 -->
          <div 
            v-if="item.role === 'assistant'"
            class="ai-message-content markdown-content" 
            v-html="md.render(item.content || '')"
          ></div>
          <!-- 用户消息显示纯文本 -->
          <div v-else class="message-content">
            {{ item.content }}
          </div>
        </template>
      </Bubble.List>
      
      <!-- 空状态 -->
      <div v-if="displayMessages.length === 0" class="empty-chat">
        <div class="welcome-message">
          <img 
            :src="currentPersona?.avatar" 
            :alt="currentPersona?.name"
            class="welcome-avatar"
          />
          <h3>你好！我是 {{ currentPersona?.name }}</h3>
          <p>{{ currentPersona?.description }}</p>
          <div class="mode-info">
            <el-tag 
              :type="aiStore.chatMode === 'chat' ? 'primary' : 'success'" 
              size="small"
            >
              {{ aiStore.chatMode === 'chat' ? '对话模式' : '智能体模式' }}
            </el-tag>
            <small>
              {{ aiStore.chatMode === 'chat' ? '支持自然对话交流' : '拥有工具调用和记忆能力' }}
            </small>
          </div>
          <div class="quick-actions">
            <el-button 
              v-for="action in quickActions" 
              :key="action.text"
              size="small" 
              type="primary" 
              plain
              @click="sendQuickMessage(action.text)"
            >
              {{ action.text }}
            </el-button>
          </div>
          <div class="first-message-hint">
            <small>💡 发送消息将自动创建新会话</small>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-container">
      <Sender
        v-model="inputMessage"
        :loading="isLoading"
        :auto-size="{ minRows: 1, maxRows: 4 }"
        :submit-type="'enter'"
        @submit="handleSendMessage"
        placeholder="输入消息..."
        class="message-sender"
      >
      </Sender>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, h } from 'vue'
import { Paperclip } from '@element-plus/icons-vue'
import { Bubble, Sender } from 'ant-design-x-vue'
import { Typography } from 'ant-design-vue'
import useAiStore from '@/store/modules/ai.ts'
import { MdToHtml, copyCode } from '@/utils/markdown.js'
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"

const aiStore = useAiStore()
const inputMessage = ref('')
const messagesContainer = ref()

// 创建一次markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // 此处判断是否有添加代码语言
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 得到经过highlight.js之后的html代码
        const preCode = hljs.highlight(lang, str).value
        // 以换行进行分割
        const lines = preCode.split(/\n/).slice(0, -1)
        // 添加自定义行号
        let html = lines
          .map((item, index) => {
            return (
              '<li><span class="line-num" data-line="' +
              (index + 1) +
              '"></span>' +
              item +
              "</li>"
            )
          })
          .join("")
        html = "<ol>" + html + "</ol>"
        // 添加代码语言和复制按钮
        return (
          '<pre class="hljs">' +
          '<div class="toolbar">' +
          '<span class="language">' +
          lang +
          "</span>" +
          "</div>" +
          "<code>" +
          html +
          '<button class="copy">复制</button>' +
          "</code>" +
          "</pre>"
        )
      } catch (__) {}
    }
    // 未添加代码语言的处理
    const preCode = md.utils.escapeHtml(str)
    const lines = preCode.split(/\n/).slice(0, -1)
    let html = lines
      .map((item, index) => {
        return (
          '<li><span class="line-num" data-line="' +
          (index + 1) +
          '"></span>' +
          item +
          "</li>"
        )
      })
      .join("")
    html = "<ol>" + html + "</ol>"

    return (
      '<pre class="hljs">' +
      '<div class="toolbar">' +
      '<span class="language">text</span>' +
      "</div>" +
      "<code>" +
      html +
      '<button class="copy">复制</button>' +
      "</code>" +
      "</pre>"
    )
  },
})

const currentPersona = computed(() => aiStore.currentPersona)
const displayMessages = computed(() => aiStore.bubbleMessages)

const isLoading = computed(() => {
  return displayMessages.value.some(msg => msg.typing)
})

const quickActions = computed(() => {
  const baseActions = [
    { text: '你好' },
  ]
  
  if (aiStore.chatMode === 'chat') {
    return [
      ...baseActions,
      { text: '帮我写代码' },
      { text: '解释一下' },
      { text: '有什么建议吗？' }
    ]
  } else {
    return [
      ...baseActions,
      { text: '帮我分析问题' },
      { text: '制定执行计划' },
      { text: '使用工具协助' }
    ]
  }
})

const handleSendMessage = (message) => {
  if (message.trim()) {
    aiStore.sendMessage(message.trim())
    inputMessage.value = ''
  }
}

const sendQuickMessage = (message) => {
  handleSendMessage(message)
}

// 监听消息变化，自动滚动到底部
watch(
  () => displayMessages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

// 监听消息内容变化（用于流式消息滚动）
watch(
  () => displayMessages.value.map(msg => msg.content + (msg.typing ? 'typing' : '')).join(''),
  async () => {
    await nextTick()
    // 如果有正在打字的消息，自动滚动到底部
    const hasTypingMessage = displayMessages.value.some(msg => msg.typing)
    if (hasTypingMessage) {
      scrollToBottom()
    }
    // 为新渲染的代码块初始化复制功能
    copyCode()
  },
  { deep: true }
)

// 监听滚动事件，实现上滑加载更多
const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const container = messagesContainer.value
  const scrollTop = container.scrollTop
  
  // 当滚动到接近顶部时（距离顶部小于100px），加载更多消息
  if (scrollTop < 100 && aiStore.hasMoreMessages && !aiStore.loadingMoreMessages) {
    const oldScrollHeight = container.scrollHeight
    aiStore.loadMoreMessages().then(() => {
      // 加载完成后保持滚动位置
      nextTick(() => {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = newScrollHeight - oldScrollHeight + scrollTop
      })
    })
  }
}

// 组件挂载时绑定滚动事件
onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
  }
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
})

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.chat-interface {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--card_background_color);
  backdrop-filter: blur(10px);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  margin-bottom: 8px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--el-border-color);
  border-top: 2px solid var(--hover--color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.bubble-list {
  min-height: 100%;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
  flex-shrink: 0;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.6;
  color: var(--font-color);
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}


.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.welcome-message {
  text-align: center;
  max-width: 400px;
  padding: 30px;
  background: var(--card_background_color);
  border-radius: var(--card_radius);
  box-shadow: var(--card-box-shadow);
  backdrop-filter: blur(10px);
}

.welcome-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 3px solid var(--hover--color);
  box-shadow: 0 4px 15px rgba(73, 177, 245, 0.3);
}

.welcome-message h3 {
  color: var(--title-color);
  margin-bottom: 8px;
  font-size: 20px;
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.welcome-message p {
  color: var(--font-color);
  margin-bottom: 16px;
  line-height: 1.6;
}

.mode-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
}

.mode-info small {
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.first-message-hint {
  margin-top: 16px;
  text-align: center;
}

.first-message-hint small {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  opacity: 0.8;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.input-container {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--card_background_color);
  backdrop-filter: blur(10px);
}

.message-sender {
  width: 100%;
}

:deep(.anticon-arrow-up) {
  height: 50px;
}

/* 滚动条样式 - 使用全局样式 */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background-color: rgba(73, 177, 245, 0.2);
  border-radius: 2em;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-color);
  background-image: -webkit-linear-gradient(
    45deg,
    hsla(0, 0%, 100%, 0.4) 25%,
    transparent 0,
    transparent 50%,
    hsla(0, 0%, 100%, 0.4) 0,
    hsla(0, 0%, 100%, 0.4) 75%,
    transparent 0,
    transparent
  );
  border-radius: 2em;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .messages-container {
    padding: 12px;
  }
  
  .input-container {
    padding: 12px;
  }
  
  .message-avatar {
    width: 36px;
    height: 36px;
  }
  
  .welcome-message {
    padding: 20px;
  }
  
  .welcome-avatar {
    width: 60px;
    height: 60px;
  }
  
  .welcome-message h3 {
    font-size: 18px;
  }
  
  .quick-actions {
    gap: 6px;
  }
}
</style>

<style>
/* ant-design-x-vue 组件样式适配 */
.ant-bubble {
  margin-bottom: 16px;
}

.ant-bubble-content {
  max-width: 70%;
  word-wrap: break-word;
  background: var(--card_background_color) !important;
  backdrop-filter: blur(10px);
  border-radius: var(--card_radius) !important;
  box-shadow: var(--card-box-shadow) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.ant-bubble[data-placement="end"] .ant-bubble-content {
  background: var(--hover--color) !important;
  color: white !important;
}

.ant-bubble[data-placement="end"] .ant-bubble-content .message-content {
  color: white !important;
}

.ant-sender {
  background: transparent;
}

.ant-sender .ant-input {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: var(--card_radius) !important;
  background: white !important;
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

.ant-sender .ant-input:focus {
  border-color: var(--hover--color) !important;
  box-shadow: 0 0 0 2px rgba(73, 177, 245, 0.2) !important;
}

.ant-sender .ant-btn-primary {
  background: var(--hover--color) !important;
  border-color: var(--hover--color) !important;
}

.ant-sender .ant-btn-primary:hover {
  background: var(--text-hover) !important;
  border-color: var(--text-hover) !important;
}

.ant-sender-wrapper {
  box-shadow: var(--card-box-shadow) !important;
  border-radius: var(--card_radius) !important;
  background: white !important;
}

/* 新增的Bubble.List样式适配 */
.ant-bubble-list {
  min-height: 100%;
}

.ant-bubble-list .ant-bubble-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.ant-bubble-list .ant-bubble-item[data-placement="start"] .ant-bubble-content {
  background: var(--card_background_color) !important;
  color: var(--font-color) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.ant-bubble-list .ant-bubble-item[data-placement="end"] .ant-bubble-content {
  background: var(--hover--color) !important;
  color: white !important;
}

/* 修复头像被压缩问题 */
.ant-bubble-avatar {
  flex-shrink: 0 !important;
}

/* Sender组件样式适配 */
.ant-sender-textarea {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: var(--card_radius) !important;
  background: white !important;
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

.ant-sender-textarea:focus-within {
  border-color: var(--hover--color) !important;
  box-shadow: 0 0 0 2px rgba(73, 177, 245, 0.2) !important;
}

/* AI消息的markdown样式适配 */
.ai-message-content .markdown-content {
  word-wrap: break-word;
  line-height: 1.6;
  color: var(--font-color);
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* 代码块样式 */
.ai-message-content .hljs {
  background: var(--code-background, #f6f8fa) !important;
  border-radius: 6px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
}

.ai-message-content .toolbar {
  background: var(--code-toolbar-bg, #e1e4e8);
  padding: 8px 12px;
  border-bottom: 1px solid var(--code-border, #d0d7de);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--code-toolbar-color, #656d76);
}

.ai-message-content .language {
  font-weight: 500;
}

.ai-message-content code {
  display: block;
  padding: 12px;
  overflow-x: auto;
  position: relative;
}

.ai-message-content .copy {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--hover--color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.ai-message-content .hljs:hover .copy {
  opacity: 1;
}

.ai-message-content .copy:hover {
  background: var(--text-hover);
}

.ai-message-content ol {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: line-number;
}

.ai-message-content li {
  display: flex;
  align-items: flex-start;
  padding: 0 12px;
  min-height: 20px;
  line-height: 20px;
}

.ai-message-content .line-num {
  display: inline-block;
  width: 40px;
  text-align: right;
  color: var(--code-line-number, #656d76);
  font-size: 12px;
  user-select: none;
  margin-right: 12px;
  flex-shrink: 0;
}

.ai-message-content .line-num:before {
  counter-increment: line-number;
  content: counter(line-number);
}

/* markdown基础样式 */
.ai-message-content h1,
.ai-message-content h2,
.ai-message-content h3,
.ai-message-content h4,
.ai-message-content h5,
.ai-message-content h6 {
  color: var(--title-color);
  margin: 16px 0 8px 0;
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.ai-message-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.ai-message-content blockquote {
  border-left: 4px solid var(--hover--color);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--el-text-color-regular);
  background: rgba(73, 177, 245, 0.05);
  padding: 12px 16px;
  border-radius: 4px;
}

.ai-message-content ul,
.ai-message-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.ai-message-content a {
  color: var(--hover--color);
  text-decoration: none;
}

.ai-message-content a:hover {
  color: var(--text-hover);
  text-decoration: underline;
}

.ai-message-content strong {
  font-weight: 600;
  color: var(--title-color);
}

.ai-message-content em {
  font-style: italic;
}

.ai-message-content code:not(pre code) {
  background: var(--code-inline-bg, rgba(73, 177, 245, 0.1));
  color: var(--code-inline-color, var(--font-color));
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 复制成功提示样式 */
.ai-message-content .copy-success {
  position: absolute;
  top: 8px;
  right: 60px;
  background: #52c41a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}
</style>
