<template>
  <Card class="article-summary-card">
    <div class="summary-container">
      <!-- 标题栏 -->
      <div class="summary-header" @click="toggleExpand">
        <div class="header-left">
          <el-icon class="summary-icon" :class="{ 'is-loading': isGenerating && !summaryContent }">
            <MagicStick />
          </el-icon>
          <span class="summary-title">鲍勃的评价</span>
          <span v-if="isGenerating && summaryContent" class="typing-indicator">生成中...</span>
        </div>
        <div class="header-right">
          <el-icon class="expand-icon" :class="{ expanded: isExpanded }">
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper" :class="{ expanded: isExpanded }">
        <div class="summary-content">
          <!-- 总结内容 -->
          <div v-if="summaryContent" class="summary-text">
            <div class="content-text" v-html="formattedSummary"></div>
          </div>

          <!-- 错误状态 -->
          <div v-if="errorMessage" class="error-state">
            <el-icon size="20" color="var(--el-color-danger)">
              <Warning />
            </el-icon>
            <span>{{ errorMessage }}</span>
          </div>
          
          <!-- 底部操作栏 -->
          <div v-if="!isGenerating && (summaryContent || errorMessage)" class="summary-footer">
            <el-button type="primary" link size="small" @click.stop="regenerateSummary">
              重新生成
            </el-button>
          </div>
           <div v-if="isGenerating" class="summary-footer">
             <el-button type="danger" link size="small" @click.stop="cancelGeneration">
              停止生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { MagicStick, Document, Warning, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Card from '@/components/card/BaseCard/card.vue'

const props = defineProps({
  articleId: {
    type: [Number, String],
    required: true
  }
})

// 响应式状态
const isGenerating = ref(false)
const summaryContent = ref('')
const errorMessage = ref('')
const isExpanded = ref(false) // 新增：控制展开/收起
let currentStream = null

// 计算属性
const formattedSummary = computed(() => {
  if (!summaryContent.value) return ''
  
  // 简单的Markdown格式处理
  return summaryContent.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
    .replace(/\n/g, '<br>') // 换行
})

// 切换展开/收起
const toggleExpand = () => {
  // 如果正在生成中，或者有错误信息，或者没有内容，则不允许收起
  if (isGenerating.value || errorMessage.value || !summaryContent.value) {
    return
  }
  isExpanded.value = !isExpanded.value
}

// 生成总结
const generateSummary = async () => {
  if (!props.articleId) {
    ElMessage.error('文章ID无效')
    return
  }

  isGenerating.value = true
  summaryContent.value = ''
  errorMessage.value = ''
  isExpanded.value = true // 开始生成时自动展开

  try {
    const { summarizeArticleStream } = await import('@/api/ai-task')
    currentStream = await summarizeArticleStream(props.articleId)

    // 处理流式数据
    for await (const chunk of currentStream) {
      if (typeof chunk === 'string' && chunk.trim()) {
        // 累积内容
        summaryContent.value += chunk
      }
    }

    // 流式传输完成
    isGenerating.value = false
    // ElMessage.success('总结生成完成')

  } catch (error) {
    console.error('生成总结失败:', error)
    isGenerating.value = false
    errorMessage.value = '生成总结失败: ' + (error.message || '网络错误')
    // ElMessage.error('生成总结失败')
  }
}

// 重新生成总结
const regenerateSummary = () => {
  summaryContent.value = ''
  isExpanded.value = true // 确保是展开状态
  generateSummary()
}

// 取消生成
const cancelGeneration = () => {
  if (currentStream && currentStream.cancel) {
    currentStream.cancel()
  }
  isGenerating.value = false
  isExpanded.value = false // 停止后自动收起
  ElMessage.info('已停止生成')
}

// 监听 articleId 的变化，当其有效时自动生成总结
watch(() => props.articleId, (newId) => {
  if (newId) {
    generateSummary()
  }
}, { immediate: true })


// 组件卸载时清理
onUnmounted(() => {
  if (currentStream && currentStream.cancel) {
    currentStream.cancel()
  }
})
</script>

<style scoped lang="scss">
.article-summary-card {
  margin-top: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  .summary-container {
    padding: 0;
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .summary-icon {
        font-size: 18px;
        color: var(--el-color-primary);

        &.is-loading {
          animation: spin 1.5s linear infinite;
        }
      }

      .summary-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .typing-indicator {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .header-right {
      .expand-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        transition: transform 0.3s ease;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  .content-wrapper {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;

    &.expanded {
      max-height: 1000px; /* A large enough value */
    }

    .summary-content {
      padding: 0 16px 16px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
    }

    .summary-text {
      padding-top: 16px;
      .content-text {
        font-size: 14px;
        line-height: 1.7;
        color: var(--el-text-color-regular);

        :deep(strong) {
          font-weight: 600;
          color: var(--el-color-primary);
        }
        
        :deep(em) {
          font-style: italic;
          color: var(--el-text-color-secondary);
        }
      }
    }
    
    .error-state {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: var(--el-color-error-light-9);
      border-radius: 6px;
      font-size: 13px;
      color: var(--el-color-error);
    }

    .summary-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      padding-top: 8px;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Mobile adjustments
@media (max-width: 768px) {
  .article-summary-card {
    .summary-header {
      padding: 10px 12px;
      .header-left {
        .summary-title {
          font-size: 14px;
        }
      }
    }
    .content-wrapper .summary-content {
      padding: 0 12px 12px 12px;
    }
  }
}
</style>
