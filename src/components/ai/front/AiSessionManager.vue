<template>
  <el-drawer
    v-model="visible"
    title="会话管理"
    direction="rtl"
    size="300px"
    :modal="false"
    :with-header="true"
    class="session-manager-drawer"
  >
    <div class="session-manager">
      <!-- 新建会话按钮 -->
      <el-button 
        type="primary" 
        :icon="Plus" 
        @click="createNewSession"
        :loading="aiStore.creatingSession"
        class="new-session-btn"
        block
      >
        {{ aiStore.creatingSession ? '创建中...' : '新建会话' }}
      </el-button>
      
      <!-- 会话列表 -->
      <div class="session-list">
        <!-- 加载状态 -->
        <div v-if="aiStore.loadingSessions" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <span>加载会话列表...</span>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="sessions.length === 0" class="empty-state">
          <div class="empty-content">
            <el-icon size="32" color="var(--el-text-color-disabled)">
              <ChatDotRound />
            </el-icon>
            <p>暂无会话记录</p>
            <small>点击上方按钮创建新会话</small>
          </div>
        </div>
        
        <!-- 会话项目 -->
        <div 
          v-else
          v-for="session in sessions" 
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === currentSessionId }"
          @click="selectSession(session.id)"
        >
          <div class="session-content">
            <div class="session-title" v-if="!session.editing">
              {{ session.title }}
            </div>
            <el-input 
              v-else
              v-model="editingTitle"
              size="small"
              @blur="saveTitle(session.id)"
              @keyup.enter="saveTitle(session.id)"
              ref="titleInput"
            />
            
            <div class="session-meta">
              <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
              <div class="session-preview">{{ session.lastMessage || '暂无消息' }}</div>
            </div>
          </div>
          
          <div class="session-actions">
            <el-dropdown @command="handleSessionAction">
              <el-button type="text" :icon="More" size="small" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`edit:${session.id}`">
                    <el-icon><Edit /></el-icon>
                    重命名
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="`delete:${session.id}`"
                    divided
                    style="color: var(--el-color-danger)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div v-if="sessions.length === 0" class="empty-state">
          <el-empty description="暂无会话" :image-size="80" />
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Plus, More, Edit, Delete, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useAiStore from '@/store/modules/ai.ts'

const aiStore = useAiStore()
const editingTitle = ref('')
const titleInput = ref()

const visible = computed({
  get: () => aiStore.sessionManagerVisible,
  set: (value) => {
    if (!value) {
      aiStore.closeSessionManager()
    }
  }
})

const sessions = computed(() => aiStore.currentPersonaSessions)
const currentSessionId = computed(() => aiStore.currentSessionId)

const createNewSession = async () => {
  try {
    await aiStore.createNewSession()
    ElMessage.success('新会话创建成功')
  } catch (error) {
    ElMessage.error('创建会话失败: ' + (error.message || '未知错误'))
  }
}

const selectSession = (sessionId) => {
  aiStore.switchSession(sessionId)
}

const handleSessionAction = async (command) => {
  const [action, sessionId] = command.split(':')
  
  if (action === 'edit') {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      editingTitle.value = session.title
      session.editing = true
      await nextTick()
      titleInput.value?.focus()
    }
  } else if (action === 'delete') {
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
      await aiStore.deleteSession(sessionId)
      ElMessage.success('会话已删除')
    } catch (error) {
      // 区分用户取消和删除失败
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除会话失败')
      }
    }
  }
}

const saveTitle = (sessionId) => {
  const session = sessions.value.find(s => s.id === sessionId)
  if (session && editingTitle.value.trim()) {
    aiStore.updateSessionTitle(sessionId, editingTitle.value.trim())
    session.editing = false
    ElMessage.success('会话名称已更新')
  } else if (session) {
    session.editing = false
  }
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped>
.session-manager {
  height: 100%;
  display: flex;
  padding: 12px;
  flex-direction: column;
}

.new-session-btn {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 20px;
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
  border-top: 2px solid var(--el-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-content {
  text-align: center;
  color: var(--el-text-color-disabled);
}

.empty-content p {
  margin: 12px 0 4px 0;
  font-size: 14px;
}

.empty-content small {
  font-size: 12px;
}

.session-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.session-item:hover {
  background: var(--el-color-primary-light-9);
}

.session-item.active {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.session-preview {
  font-size: 12px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.session-actions {
  flex-shrink: 0;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 滚动条样式 */
.session-list::-webkit-scrollbar {
  width: 4px;
}

.session-list::-webkit-scrollbar-track {
  background: var(--el-bg-color);
}

.session-list::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 2px;
}

.session-list::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}
</style>

<style>
.session-manager-drawer .el-drawer__header {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.session-manager-drawer .el-drawer__body {
  padding-top: 16px;
}
</style>
