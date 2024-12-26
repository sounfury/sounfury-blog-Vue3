<script setup lang="ts">
import { ref, onMounted } from 'vue'
import settingButton from '@/components/buttons/setting-button.vue'
import {
    Menu as IconMenu,
    HomeFilled,
    Folder,
    Document,
    Edit,
    Setting,
    Expand,
    Fold,
    ColdDrink,
Orange,
Collection
} from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { gsap } from 'gsap'

const router = useRouter()
const route = useRoute()

const menuItems = [
    {
        name: 'adminDashboard',
        title: '仪表盘',
        icon: HomeFilled,
        path: '/admin/dashboard'
    },
    {
        name: 'contentManage',
        title: '内容管理',
        icon: Folder,
        path: '/admin/manage',
        children: [
            {
                name: 'categoryManagement',
                title: '分类管理',
                icon: Orange,
                path: '/admin/manage/categories'
            },
            {
                name: 'articleManagement',
                title: '文章管理',
                icon: Collection,
                path: '/admin/manage/articles'
            }
        ]
    },
    {
        name: 'writeArticle',
        title: '撰写文章',
        icon: Edit,
        path: '/admin/write'
    },
    {
        name: 'themeManagement',
        title: '主题管理',
        icon: ColdDrink,
        path: '/admin/theme',
    },
    {
        name: 'blogSettings',
        title: '博客设置',
        icon: Setting,
        path: '/admin/settings'
    }
]


const isCollapse = ref(false)
const sidebarRef = ref<HTMLElement | null>(null)
const menuContainerRef = ref<HTMLElement | null>(null)
const activeSubmenu = ref<string | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)
const particleCanvas = ref<HTMLCanvasElement | null>(null)

const handleMenuSelect = (path: string, event?: MouseEvent) => {
    // 菜单选中动画

    router.push(path)
}

const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
    activeSubmenu.value = null
    // GSAP 动画
    if (sidebarRef.value && menuContainerRef.value) {
        if (isCollapse.value) {
            // 折叠动画
            gsap.to(sidebarRef.value, {
                width: '80px',
                duration: 0.2,
                ease: 'power2.inOut'
            })
            gsap.to(menuContainerRef.value.children, {
                opacity: 0,
                x: -20,
                stagger: 0.1,
                duration: 0.3
            })
        } else {
            // 展开动画
            gsap.to(sidebarRef.value, {
                width: '13rem',
                duration: 0.2,
                ease: 'power2.inOut'
            })
            gsap.to(menuContainerRef.value.children, {
                opacity: 1,
                x: 0,
                stagger: 0.1,
                duration: 0.2
            })
        }
    }
}

onMounted(() => {
    // 初始动画
    if (mainContentRef.value) {
        gsap.from(mainContentRef.value, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        })
    }
})


const isRouteChanging = ref(false)

//路由切换动画
const handleRouteChange = async (el: HTMLElement) => {
    isRouteChanging.value = true

    // 离开动画 - 缩放和淡出
    const leaveTimeline = gsap.timeline()
    await leaveTimeline
        .to(el, {
            scale: 0.95,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut'
        })
        .to(el, {
            y: 50,
            duration: 0.4,
            ease: 'power1.in'
        }, '-=0.2')

    // 重置初始状态
    gsap.set(el, {
        scale: 1.05,  // 比原始大小稍大
        y: 50,        // 初始位置在下方
        opacity: 0    // 完全透明
    })

    // 进入动画 - 更自然的出现效果
    const enterTimeline = gsap.timeline()
    await enterTimeline
        .to(el, {
            y: 0,             // 从下方平滑上升
            duration: 0.3,
            ease: 'power2.out'
        })
        .to(el, {
            scale: 1,          // 同时恢复到原始大小
            opacity: 1,        // 逐渐显现
            duration: 0.3,
            ease: 'power2.out'
        }, '-=0.3')            // 与上一个动画部分重叠

    isRouteChanging.value = false
}

// 防抖处理保持不变
import { useDebounceFn } from '@vueuse/core'
const debouncedHandleRouteChange = useDebounceFn(handleRouteChange, 50)

import { watch } from 'vue'
import useSettings from '@/store/modules/settings'
const icon = useSettings().settings.site_icon
// 跳转到 home 路由的方法
const goToHome = () => {
    router.push("/home");
};

watch(
    () => route.path,
    async () => {
        if (mainContentRef.value) {
            await debouncedHandleRouteChange(mainContentRef.value)
        }
    }
)
</script>

<template>
    <div class="flex h-screen relative overflow-hidden ">
        <!-- 侧边栏 -->
        <div ref="sidebarRef" class="relative transition-all duration-200 ease-in-out m-2
             backdrop-blur-md bg-white/90
              rounded-2xl shadow-2xl 
             ">
            <div class="flex items-center  p-6 border-b" :class="isCollapse ? 'justify-center' : 'justify-between'">
                <h1 v-if="!isCollapse" class="text-2xl font-bold text-gray-800">
                    博客管理
                </h1>
                <settingButton class="setting-btn" @click="toggleSidebar" />

            </div>

            <div ref="menuContainerRef" class="space-y-2 flex ">
                <el-menu :default-active="route.path" class="h-full w-full" :collapse="isCollapse"
                    @select="handleMenuSelect">
                    <!-- 菜单 -->
                    <template v-for="item in menuItems" :key="item.name">
                        <!-- 存在二级菜单 -->
                        <el-sub-menu v-if="item.children" :index="item.path" class="rounded-xl group pl-2">
                            <template #title>
                                <el-icon>
                                    <component :is="item.icon" />
                                </el-icon>
                                <span class="ml-2 group-hover:text-blue-600 transition-colors">
                                    {{ item.title }}
                                </span>
                            </template>
                            <el-menu-item v-for="child in item.children" :key="child.name" :index="child.path"
                                class="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all ml-2">
                                <el-icon>
                                    <component :is="child.icon" />
                                </el-icon>
                                <span class="ml-2 group-hover:text-blue-600 transition-colors">
                                    {{ child.title }}
                                </span>
                            </el-menu-item>
                        </el-sub-menu>

                        <!-- 只有一级菜单 -->
                        <el-menu-item v-else :index="item.path"
                            class="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group">
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <template #title>
                                <span class="ml-2 group-hover:text-blue-600 transition-colors">
                                    {{ item.title }}
                                </span>
                            </template>
                        </el-menu-item>
                    </template>
                </el-menu>
            </div>
        </div>
        <div class="flex-1 overflow-auto  m-2
             backdrop-blur-md bg-white/90
              rounded-2xl shadow-lg ">
            <div ref="mainContentRef" class="relative backdrop-blur-md  p-6 min-h-full transform-gpu">
                <!-- 头像组件 -->
                <el-avatar :size="50" :src="icon" class="absolute top-4 right-4 cursor-pointer z-50" @click="goToHome"
                    title="回到博客前台" />
                <router-view v-slot="{ Component }">
                    <transition mode="out-in" enter-active-class="transition-all duration-500"
                        leave-active-class="transition-all duration-500">
                        <div :key="route.path" :style="{ visibility: isRouteChanging ? 'hidden' : 'visible' }">
                            <component :is="Component" />
                        </div>
                    </transition>
                </router-view>
            </div>
        </div>


    </div>
</template>

<style scoped></style>