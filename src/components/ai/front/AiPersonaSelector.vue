<template>
  <div class="persona-selector">
    <!-- 加载状态 -->
    <div v-if="aiStore.loadingPersonas" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>加载角色列表...</span>
      </div>
    </div>
    
    <!-- 角色列表 -->
    <div v-else class="persona-scroll">
      <div 
        v-for="persona in personas" 
        :key="persona.id"
        class="persona-item"
        :class="{ active: persona.id === currentPersonaId }"
        @click="selectPersona(persona.id)"
        :title="persona.description"
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
</template>

<script setup>
import { computed } from 'vue'
import useAiStore from '@/store/modules/ai.ts'

const aiStore = useAiStore()

const personas = computed(() => aiStore.personas)
const currentPersonaId = computed(() => aiStore.currentPersonaId)

const selectPersona = (personaId) => {
  aiStore.switchPersona(personaId)
}
</script>

<style scoped>
.persona-selector {
  background: var(--card_background_color);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.3s ease;
  padding: 12px 16px;
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
  color: var(--font-color);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid var(--hover--color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.persona-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  scroll-behavior: smooth;
}

.persona-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--card_radius);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: 80px;
  flex-shrink: 0;
  background: var(--card_background_color);
  box-shadow: var(--card-box-shadow);
  border: 2px solid transparent;
}

.persona-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-hover-box-shadow);
  background: var(--text-hover);
}

.persona-item.active {
  background: var(--hover--color);
  color: white;
  border-color: var(--hover--color);
  box-shadow: 0 4px 15px rgba(73, 177, 245, 0.3);
}

.persona-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.persona-item.active .persona-avatar {
  border-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.persona-name {
  font-weight: 500;
  color: var(--font-color);
  font-size: 13px;
  text-align: center;
  white-space: nowrap;
  font-family: "Alimama", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.persona-item.active .persona-name {
  color: white;
}

.persona-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.persona-item.active .persona-indicator {
  opacity: 1;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 - 使用全局样式变量 */
.persona-scroll::-webkit-scrollbar {
  height: 6px;
}

.persona-scroll::-webkit-scrollbar-track {
  background-color: rgba(73, 177, 245, 0.2);
  border-radius: 2em;
}

.persona-scroll::-webkit-scrollbar-thumb {
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
  .persona-selector {
    padding: 8px 12px;
  }
  
  .persona-scroll {
    gap: 8px;
  }
  
  .persona-item {
    padding: 8px 12px;
    min-width: 70px;
  }
  
  .persona-avatar {
    width: 40px;
    height: 40px;
    margin-bottom: 6px;
  }
  
  .persona-name {
    font-size: 12px;
  }
}
</style>
