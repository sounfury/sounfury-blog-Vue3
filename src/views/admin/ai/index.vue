<template>
    <div class="w-full">
        <router-view v-slot="{ Component }">
            <transition 
                mode="out-in" 
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-4"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-4"
            >
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import { Collection, Setting, Avatar } from '@element-plus/icons-vue'
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
    // 页面进入动画
    gsap.from('.w-full', {
        duration: 0.6,
        opacity: 0,
        y: 20,
        ease: 'power2.out'
    })
})
</script>

<style lang="scss" scoped>
// 页面容器样式
.w-full {
    min-height: 100%;
}
</style>
