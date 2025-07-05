<template>
  <div ref="imageRef" class="lazy-image-container" :class="className">
    <!-- 模糊占位图 -->
    <img
      :src="blurSrc"
      :alt="alt"
      :style="imageStyle"
      class="lazy-image blur-image"
      :class="{ 'fade-out': isHighResLoaded }"
    />
    
    <!-- 高清图 -->
    <img
      v-if="shouldLoadHighRes"
      :src="highResSrc"
      :alt="alt"
      :style="imageStyle"
      class="lazy-image high-res-image"
      :class="{ 'fade-in': isHighResLoaded, 'loading': isLoading }"
      @load="onHighResLoad"
      @error="onHighResError"
    />
    
    <!-- 加载指示器 -->
    <div v-if="isLoading && showLoadingIndicator" class="loading-indicator">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="hasError && !isHighResLoaded" class="error-placeholder">
      <span>图片加载失败</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 模糊占位图URL
  blurSrc: {
    type: String,
    required: true
  },
  // 高清图URL
  highResSrc: {
    type: String,
    required: true
  },
  // 移动端高清图URL
  mobileHighResSrc: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: '图片'
  },
  width: {
    type: [Number, String],
    default: '100%'
  },
  height: {
    type: [Number, String],
    default: 'auto'
  },
  className: {
    type: String,
    default: ''
  },
  // 是否显示加载指示器
  showLoadingIndicator: {
    type: Boolean,
    default: false
  },
  // 懒加载的根边距（提前多少像素开始加载）
  rootMargin: {
    type: String,
    default: '50px'
  }
})

// 响应式状态
const imageRef = ref(null)
const shouldLoadHighRes = ref(false)
const isHighResLoaded = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const observer = ref(null)

// 计算属性
const imageStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  objectFit: 'cover'
}))

// 根据屏幕尺寸选择合适的高清图
const finalHighResSrc = computed(() => {
  if (props.mobileHighResSrc && window.innerWidth <= 768) {
    return props.mobileHighResSrc
  }
  return props.highResSrc
})

// 检测图片是否进入视口
const checkIntersection = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !shouldLoadHighRes.value) {
      shouldLoadHighRes.value = true
      isLoading.value = true
      hasError.value = false // 重置错误状态

      // 停止观察
      if (observer.value) {
        observer.value.disconnect()
      }
    }
  })
}

// 高清图加载完成
const onHighResLoad = () => {
  isLoading.value = false
  isHighResLoaded.value = true
  hasError.value = false // 重置错误状态
}

// 高清图加载失败
const onHighResError = () => {
  isLoading.value = false
  hasError.value = true
}

// 初始化Intersection Observer
const initObserver = () => {
  if ('IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(checkIntersection, {
      rootMargin: props.rootMargin,
      threshold: 0.1
    })
    
    if (imageRef.value) {
      observer.value.observe(imageRef.value)
    }
  } else {
    // 不支持IntersectionObserver的情况下直接加载
    shouldLoadHighRes.value = true
    isLoading.value = true
  }
}

onMounted(() => {
  initObserver()
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<script>
export default {
  name: 'LazyImage'
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.lazy-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease-in-out;
}

.blur-image {
  filter: blur(5px);
  transform: scale(1.1); /* 稍微放大以隐藏模糊边缘 */
}

.high-res-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.fade-out {
  opacity: 0;
}

.fade-in {
  opacity: 1;
}

.loading {
  opacity: 0;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  z-index: 2;
}

/* 确保容器有正确的宽高比 */
.lazy-image-container::before {
  content: '';
  display: block;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比，可根据需要调整 */
}

.lazy-image-container > .lazy-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
