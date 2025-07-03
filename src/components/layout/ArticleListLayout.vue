<template>
  <div class="article-list-layout pt-4 lg:pt-12">
    <div class="w-11/12 lg:w-11/12 m-auto flex flex-col lg:flex-row justify-center gap-4 lg:gap-14">
      <!-- 主内容区 -->
      <div class="w-full lg:w-9/12 order-2 lg:order-1">
        <slot name="content"></slot>
      </div>

      <!-- 侧边栏 - 移动端隐藏，桌面端在右侧 -->
      <slot name="sidebar">
        <!-- 默认侧边栏，可以被覆盖 -->
        <asideCards 
          v-if="showSidebar"
          :activeCards="sidebarCards"
          class="aside_content gap-4 lg:gap-8 flex-col w-full lg:w-auto order-1 lg:order-2 hidden lg:flex" 
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import asideCards from "@/components/card/MainCard/aside-cards.vue"

const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true
  },
  sidebarCards: {
    type: Array,
    default: () => ['aboutMe', 'notice', 'weather', 'filing', 'info']
  }
})
</script>

<style scoped>
/* 可以添加特定的布局样式 */
.article-list-layout {
  min-height: calc(100vh - 200px);
}
</style>
