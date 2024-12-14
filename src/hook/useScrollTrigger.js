// useScrollTrigger.js
import { ref, onMounted, onUnmounted } from "vue"
import { throttle } from "lodash-es"

export function useScrollTrigger(targetRef, options = {}) {
  const { threshold = 0.5, once = false } = options

  const isInView = ref(false)

  const checkVisibility = throttle(() => {
    if (!targetRef.value) return

    const rect = targetRef.value.getBoundingClientRect()
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight

    const inView = rect.top <= windowHeight * threshold

    if (inView !== isInView.value) {
      isInView.value = inView

      if (once && inView) {
        removeScrollListener()
      }
    }
  }, 100)

  function addScrollListener() {
    window.addEventListener("scroll", checkVisibility)
    window.addEventListener("resize", checkVisibility)
  }

  function removeScrollListener() {
    window.removeEventListener("scroll", checkVisibility)
    window.removeEventListener("resize", checkVisibility)
  }

  onMounted(() => {
    // 初始化时立即检查一次
    checkVisibility()
    addScrollListener()
  })

  onUnmounted(removeScrollListener)

  return {
    isInView,
  }
}
