<template>
  <header ref="headerRef" class="full_page">
    <div class="blog_name">
      <span>HI，</span>
      <span class="other">sounfury</span>
    </div>
    <div class="show_text">{{ show_text }}</div>
    <div class="scroll">
      <div class="arrow scroll-button" @click="scrollToHeaderHeight"></div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { startTypeWriter, clearTypeWriter } from "@/utils/typewriter";

const show_text = ref("");
const text1 = ref("");
const text2 = ref("");


const props = defineProps({
  TypingEffectFirstLine: String,
  TypingEffectSecondLine: String,
});

// 启动打字机效果的函数
const startTypingEffect = () => {
  if (text1.value && text2.value) {
    startTypeWriter(text1.value, text2.value, show_text);
  }
};

// 监听props变化
watch(() => [props.TypingEffectFirstLine, props.TypingEffectSecondLine],
  ([newFirstLine, newSecondLine]) => {
    text1.value = newFirstLine || "";
    text2.value = newSecondLine || "";
    startTypingEffect();
  },
  { immediate: true }
);

const headerRef = ref(null);

const scrollToHeaderHeight = () => {
  if (headerRef.value) {
    // 获取 header 元素的底部位置
    const headerBottom = headerRef.value.getBoundingClientRect().bottom + window.scrollY;

    // 滚动到 header 下面
    window.scrollTo({
      top: headerBottom,
      behavior: "smooth", // 平滑滚动
    });
  }
};

onMounted(() => {
  // 组件挂载时启动打字机效果
  startTypingEffect();
});

// 组件卸载时清理打字机效果
onUnmounted(() => {
  clearTypeWriter();
});
</script>
<style scoped>
.full_page {
  background-image: var(--image-url);
  height: 100vh;
  background-attachment: fixed;
  background-size: cover;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: var(--card_radius);
}

.full_page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--scr-shadow-color);
  z-index: 0;
}

.show_text {
  padding-top: 15px;
  height: 1.8em;
  line-height: 1.8em;
  font-size: 2em;
  display: inline-block;
  position: relative;
  font-weight: 500;
  color: #fff;
  font-family: Playball, cursive;

}

.blog_name {
  margin: 0;
  color: var(--scr-title-color);
  font-size: 5.5em;
  z-index: 100;
  text-shadow: rgba(0, 0, 0, 0.15) 2px 2px 4px
}

.show_text::after {
  content: "";
  position: absolute;
  right: -5px;
  top: 28px;
  height: 30px;
  width: 2px;
  background-color: #fff;
  animation: san 1s steps(1) infinite;
}

@keyframes san {

  /*闪烁效果*/
  0%,
  100% {
    background-color: #fff;
  }

  50% {
    background-color: transparent;
  }
}

.scroll {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100px;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.arrow {
  width: 100px;
  height: 100px;
  position: absolute;
  bottom: 0;
}

.arrow::after {
  width: 17px;
  height: 17px;
  border-right: 5px solid #fff;
  border-top: 5px solid #fff;
  transform: rotate(135deg);
  position: absolute;
  bottom: 25px;
  content: "";
  animation: arrow 1s ease-in infinite alternate;
  left: 55%;
}

@keyframes arrow {
  0% {
    transform: rotate(135deg) translate(20px, 0px);
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    transform: rotate(135deg) translate(0px, 20px);
    /*在x轴上移动50px，y轴上移动50px*/
    opacity: 0.3;
  }
}

/* 移动端隐藏大图 */
@media (max-width: 768px) {
  .full_page {
    display: none;
  }
}
</style>
