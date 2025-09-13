<template>
  <el-drawer
    v-model="visible"
    title=""
    :with-header="false"
    direction="rtl"
    :size="drawerWidth"
    :modal="true"
    :close-on-click-modal="true"
    class="ai-chat-drawer"
  >
    <div class="chat-container">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="persona-info">
          <img 
            :src="currentPersona?.avatar" 
            :alt="currentPersona?.name"
            class="persona-avatar"
          />
          <span class="persona-name">{{ currentPersona?.name }}</span>
        </div>
        
        <div class="session-title">
          {{ currentSession?.title || '默认会话' }}
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
        
        <div class="header-actions">
          <!-- 人格切换按钮 -->
          <el-button 
            type="text" 
            :icon="User" 
            @click="showPersonaSelector = !showPersonaSelector"
            title="切换人格"
          />
          
          <!-- 会话管理按钮 -->
          <el-button 
            type="text" 
            :icon="FolderOpened" 
            @click="aiStore.openSessionManager()"
            title="会话管理"
          />
          
          <!-- 全屏按钮 -->
          <el-button 
            type="text" 
            :icon="FullScreen" 
            @click="aiStore.toggleFullscreen()"
            title="全屏模式"
          />
        </div>
      </div>
      
      <!-- 人格选择器 -->
      <AiPersonaSelector v-if="showPersonaSelector" />
      
      <!-- 聊天区域 -->
      <div class="chat-content">
        <AiChatInterface />
      </div>
    </div>
    
    <!-- 会话管理抽屉 -->
    <AiSessionManager />
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { User, FolderOpened, FullScreen } from '@element-plus/icons-vue'
import useAiStore from '@/store/modules/ai.ts'
import AiPersonaSelector from './AiPersonaSelector.vue'
import AiChatInterface from './AiChatInterface.vue'
import AiSessionManager from './AiSessionManager.vue'

const aiStore = useAiStore()
const showPersonaSelector = ref(false)

const visible = computed({
  get: () => aiStore.drawerVisible,
  set: (value) => {
    if (!value) {
      aiStore.closeDrawer()
    }
  }
})

const currentPersona = computed(() => aiStore.currentPersona)
const currentSession = computed(() => aiStore.currentSession)

const handleModeChange = (mode) => {
  aiStore.setChatMode(mode)
}

// 监听抽屉打开状态
watch(
  () => aiStore.drawerVisible,
  (isVisible) => {
    if (isVisible) {
      // 打开抽屉时的处理已经在store的openDrawer方法中完成
    }
  }
)

const drawerWidth = computed(() => {
  // 响应式宽度
  if (window.innerWidth < 768) {
    return '100%'
  } else if (window.innerWidth < 1200) {
    return '50%'
  } else {
    return '40%'
  }
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.persona-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.persona-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.persona-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.session-title {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mode-selector {
  margin: 0 8px;
}

.mode-select {
  width: 120px;
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

.header-actions {
  display: flex;
  gap: 4px;
}

.chat-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px;
  }
  
  .persona-avatar {
    width: 28px;
    height: 28px;
  }
  
  .persona-name {
    font-size: 14px;
  }
  
  .session-title {
    font-size: 13px;
    margin: 0 4px;
  }
  
  .mode-selector {
    margin: 0 4px;
  }
  
  .mode-select {
    width: 100px;
  }
  
  .header-actions {
    gap: 2px;
  }
}
</style>

<style>
.ai-chat-drawer .el-drawer__body {
  padding: 0;
}
</style>
