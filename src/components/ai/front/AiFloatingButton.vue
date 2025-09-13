<template>
  <div 
    class="ai-floating-button" 
    @click="handleClick"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <img 
      :src="currentPersona?.avatar" 
      :alt="currentPersona?.name"
      class="avatar"
    />
    
    <!-- Tooltip -->
    <transition name="tooltip-fade">
      <div v-if="showTooltip" class="tooltip">
        和 {{ currentPersona?.name }} 聊天
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import useAiStore from '@/store/modules/ai.ts'

const aiStore = useAiStore()
const showTooltip = ref(false)

const currentPersona = computed(() => aiStore.currentPersona)

const handleClick = () => {
  aiStore.openDrawer()
}
</script>

<style scoped>
.ai-floating-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--el-color-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ai-floating-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.tooltip {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 20px;
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .ai-floating-button {
    width: 50px;
    height: 50px;
    bottom: 20px;
    right: 20px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
  
  .tooltip {
    bottom: 60px;
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>
