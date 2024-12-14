<template>
  <div 
    class="card"
    :class="[{ item: enableAnimation && !hasShown }, { active: isVisible }]"
    ref="cardRef">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  enableAnimation: {
    type: Boolean,
    default: true
  },
  viewportOffset: {
    type: Number,
    default: 0.8
  }
})

const cardRef = ref(null)
const isVisible = ref(false)
const hasShown = ref(false)  // 新增状态，记录是否已经显示过

const checkVisibility = () => {
  if (!cardRef.value || hasShown.value) return  // 如果已经显示过，直接返回
  if (cardRef.value.offsetTop <= window.scrollY + window.innerHeight * props.viewportOffset) {
    isVisible.value = true
    hasShown.value = true  // 标记为已显示
    // 动画触发后移除监听器
    window.removeEventListener('scroll', checkVisibility)
  }
}

onMounted(() => {
  if (props.enableAnimation) {
    checkVisibility() // 初始检查
    window.addEventListener('scroll', checkVisibility)
  }
})

onUnmounted(() => {
  if (props.enableAnimation) {
    window.removeEventListener('scroll', checkVisibility)
  }
})
</script>

<style scoped>
.card {
  box-shadow: var(--card-box-shadow);
  border-radius: var(--card_radius);
  background-color: var(--card_background_color);
  border: 1px solid rgba(255, 255, 255, 0.089);
}

.card:hover {
  box-shadow: var(--card-hover-box-shadow);
}

.item {
  transform: translate(0, 400px) scale(0);
  transition: 1.5s;
}

.active {
  transform: translate(0, 0) scale(1);
  transition: 1s;
  animation: card 1s ease-in-out;
}

@keyframes card {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>