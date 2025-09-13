<template>
  <teleport to="body">
    <div v-if="visible" class="fullscreen-chat">
      <div class="fullscreen-container">
        <!-- 左侧边栏 -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h3>AI 助手</h3>
            <el-button 
              type="text" 
              :icon="Close" 
              @click="exitFullscreen()"
              title="退出全屏"
            />
          </div>
          
          <!-- 人格列表 -->
          <div class="persona-section">
            <h4>选择人格</h4>
            <div class="persona-grid">
              <div 
                v-for="persona in personas" 
                :key="persona.id"
                class="persona-card"
                :class="{ active: persona.id === currentPersonaId }"
                @click="selectPersona(persona.id)"
              >
                <img 
                  :src="persona.avatar" 
                  :alt="persona.name"
                  class="persona-avatar"
                />
                <div class="persona-name">{{ persona.name }}</div>
                <div 
                  class="persona-indicator"
                  :style="{ backgroundColor: persona.color }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 会话列表 -->
          <div class="session-section">
            <div class="session-header">
              <h4>会话历史</h4>
              <el-button 
                type="primary" 
                size="small" 
                :icon="Plus"
                @click="createNewSession"
                :loading="aiStore.creatingSession"
              >
                {{ aiStore.creatingSession ? '创建中' : '新建' }}
              </el-button>
            </div>
            
            <div class="session-tree">
              <div 
                v-for="session in sessions" 
                :key="session.id"
                class="session-node"
                :class="{ active: session.id === currentSessionId }"
                @click="selectSession(session.id)"
              >
                <div class="session-info">
                  <div class="session-title">{{ session.title }}</div>
                  <div class="session-time">{{ formatTime(session.updatedAt) }}</div>
                </div>
                <el-dropdown @command="handleSessionAction">
                  <el-button type="text" :icon="More" size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`edit:${session.id}`">
                        重命名
                      </el-dropdown-item>
                      <el-dropdown-item 
                        :command="`delete:${session.id}`"
                        divided
                        style="color: var(--el-color-danger)"
                      >
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 主聊天区域 -->
        <div class="chat-main">
          <div class="chat-header">
            <div class="current-context">
              <img 
                :src="currentPersona?.avatar" 
                :alt="currentPersona?.name"
                class="current-avatar"
              />
              <div class="context-info">
                <div class="context-persona">{{ currentPersona?.name }}</div>
                <div class="context-session">{{ currentSession?.title || '默认会话' }}</div>
              </div>
            </div>
            
            <!-- 模式选择器 -->
            <div class="mode-selector">
              <el-select 
                :model-value="aiStore.chatMode"
                @update:model-value="handleModeChange"
                placeholder="选择模式"
                size="small"
                class="mode-select"
              >
                <el-option
                  v-for="option in aiStore.chatModeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :title="option.description"
                >
                  <div class="mode-option">
                    <span class="mode-label">{{ option.label }}</span>
                    <small class="mode-desc">{{ option.description }}</small>
                  </div>
                </el-option>
              </el-select>
            </div>
            
            <div class="chat-actions">
              <el-button type="text" :icon="Refresh" title="清空会话" />
              <el-button type="text" :icon="Download" title="导出记录" />
            </div>
          </div>
          
          <div class="chat-content">
            <AiChatInterface />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { Close, Plus, More, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useAiStore from '@/store/modules/ai.ts'
import AiChatInterface from './AiChatInterface.vue'

const aiStore = useAiStore()

const visible = computed(() => aiStore.fullscreenMode)
const personas = computed(() => aiStore.personas)
const sessions = computed(() => aiStore.currentPersonaSessions)
const currentPersonaId = computed(() => aiStore.currentPersonaId)
const currentSessionId = computed(() => aiStore.currentSessionId)
const currentPersona = computed(() => aiStore.currentPersona)
const currentSession = computed(() => aiStore.currentSession)

const selectPersona = (personaId) => {
  aiStore.switchPersona(personaId)
}

const selectSession = (sessionId) => {
  aiStore.switchSession(sessionId)
}

const createNewSession = async () => {
  try {
    await aiStore.createNewSession()
    ElMessage.success('新会话创建成功')
  } catch (error) {
    ElMessage.error('创建会话失败: ' + (error.message || '未知错误'))
  }
}

const exitFullscreen = () => {
  // 退出全屏模式，回到抽屉模式
  aiStore.fullscreenMode = false
  aiStore.openDrawer()
}

const handleModeChange = (mode) => {
  aiStore.setChatMode(mode)
}

const handleSessionAction = async (command) => {
  const [action, sessionId] = command.split(':')
  
  if (action === 'delete') {
    try {
      await ElMessageBox.confirm(
        '确定要删除这个会话吗？此操作不可恢复。',
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
      aiStore.deleteSession(sessionId)
      ElMessage.success('会话已删除')
    } catch {
      // 用户取消删除
    }
  }
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped>
.fullscreen-chat {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: var(--el-bg-color);
  animation: fadeIn 0.3s ease;
}

.fullscreen-container {
  height: 100%;
  display: flex;
}

.sidebar {
  width: 320px;
  background: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
}

.persona-section {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.persona-section h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

.persona-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.persona-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid transparent;
}

.persona-card:hover {
  background: var(--el-color-primary-light-9);
}

.persona-card.active {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}

.persona-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.persona-name {
  font-size: 12px;
  color: var(--el-text-color-primary);
  text-align: center;
}

.persona-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.persona-card.active .persona-indicator {
  opacity: 1;
}

.session-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.session-header {
  padding: 20px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.session-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

.session-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.session-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border: 1px solid transparent;
}

.session-node:hover {
  background: var(--el-color-primary-light-9);
}

.session-node.active {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.current-context {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.context-persona {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.context-session {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.mode-selector {
  margin: 0 16px;
}

.mode-select {
  width: 140px;
}

.mode-option {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.mode-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.mode-desc {
  color: var(--el-text-color-regular);
  font-size: 12px;
  margin-top: 2px;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.chat-content {
  flex: 1;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 滚动条样式 */
.session-tree::-webkit-scrollbar {
  width: 4px;
}

.session-tree::-webkit-scrollbar-track {
  background: var(--el-bg-color);
}

.session-tree::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 2px;
}

.session-tree::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }
  
  .persona-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: absolute;
    z-index: 10;
  }
  
  .chat-main {
    display: none;
  }
}
</style>
