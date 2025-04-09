<template>
  <div class="index">
    <el-container class="w-full h-full ">
      <Nav :menu-items="menuItems" :show-search="false" />
      <el-main class="main">
        <commonHeader v-if="checkRouter" v-bind=useHeaderStore.$state />
        <scrollpage v-if="isHomeRoute" v-bind="typingEffectContent" />
        <div class="main">
          <DinoLoader />
          <router-view v-slot="{ Component, route }">
            <keep-alive :include='cachedRoutes'>
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </router-view>
        </div>
      </el-main>
      <el-footer v-if="haveFooter">
        <Footer />
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from "vue"
import Footer from "@/components/layout/footer.vue"
import Nav from "@/components/layout/nav.vue"
import commonHeader from "@/components/layout/common-header.vue"
import { useRoute } from "vue-router"  // 导入 useRoute
import scrollpage from "@/components/scrollpage/scrollpage.vue"
import useSettings from "@/store/modules/settings";
const cachedRoutes = ['home', 'b']

const menuItems = ref([
  // {
  //   label: '休闲',
  //   icon: ['fas', 'couch'],
  //   type: 'dropdown',
  //   submenu: [
  //     {
  //       label: '音乐',
  //       icon: ['fas', 'music'],
  //       type: 'external',
  //       link: 'https://www.bilibili.com/'
  //     },
  //     {
  //       label: '图书',
  //       icon: ['fas', 'book-open-reader'],
  //       type: 'external',
  //       link: 'https://www.bilibili.com/'
  //     }
  //   ]
  // },
  {
    label: '首页',
    icon: ['fas', 'house'],
    type: 'router',
    link: '/home'
  },
  {
    label: '文章',
    icon: ['fas', 'newspaper'],
    type: 'dropdown',
    submenu: [
      {
        label: '标签',
        icon: ['fas', 'tag'],
        type: 'router',
        link: '/tags'
      },
      {
        label: '分类',
        icon: ['fas', 'folder-open'],
        type: 'router',
        link: '/category'
      },
      {
        label: '归档',
        icon: ['fas', 'box-archive'],
        type: 'router',
        link: '/archive'
      }
    ]
  },
  {
    label: '资源库',
    icon: ['fas', 'film'],
    type: 'external',
    link: 'http://alist.sounfury.top/'
  },
  // {
  //   label: '个人',
  //   icon: ['fas', 'user'],
  //   type: 'none'
  // },
  {
    label: '后台',
    icon: ['fas', 'user-cog'],
    type: 'router',
    link: '/admin',
    requireRole: ['ADMIN']
  }
])






const route = useRoute()  // 获取当前路由对象
const commonHeaderPath = ["/tags", "/category"]
const isHomeRoute = computed(() => {
  return route.path === "/home"
})
const checkRouter = computed(() => {
  return commonHeaderPath.some(path => {
    return route.path.includes(path)
  })
})

const haveFooter = computed(() => {
  return !route.path.includes("/archive")
})



import useHeader from "@/store/modules/header"
import useTheme from "@/store/modules/theme"
const useHeaderStore = useHeader()
const settingStore = useSettings()
const themeStore = useTheme()

async function fetchSettings() {
  try {
    await settingStore.getSettings();
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }
}

const typingEffectContent = reactive({
  TypingEffectFirstLine: "",
  TypingEffectSecondLine: "",
})

onMounted(async () => {
  fetchSettings();
  await themeStore.getNowTheme()
  typingEffectContent.TypingEffectFirstLine = themeStore.themeSettings?.TypingEffectFirstLine
  typingEffectContent.TypingEffectSecondLine = themeStore.themeSettings?.TypingEffectSecondLine
})

</script>

<style scoped>
.index {
  min-height: 100vh;
  width: 100%;
  background: var(--background-color);
}

.main {
  flex: 1;
}
</style>
