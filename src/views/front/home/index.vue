<template>
  <div class="home pt-4 lg:pt-12">
    <div class="w-11/12 lg:w-11/12 m-auto flex flex-col lg:flex-row justify-center gap-4 lg:gap-14">
      <!-- 主内容区 -->
      <div class="w-full lg:w-9/12 order-2 lg:order-1">
        <PostCards :articles="articles" class="w-full" />
        <Pagination v-if="isPageLoaded" :total="total" :pageNum="pageQuery.page" :pageSize="pageQuery.size"
          @page-change="handlePageChange" />
      </div>

      <!-- 侧边栏 - 移动端隐藏，桌面端在右侧 -->
      <asideCards :activeCards="['aboutMe', 'notice', 'weather', 'filing', 'info']"
        class="aside_content gap-4 lg:gap-8 flex-col w-full lg:w-auto order-1 lg:order-2 hidden lg:flex" />
    </div>
  </div>
</template>
<script>
name: "Home"
</script>

<script setup>
import PostCards from "@/components/card/MainCard/post-cards.vue"
import Pagination from "@/components/Pagination/index.vue"
import scrollpage from "@/components/scrollpage/scrollpage.vue"
import asideCards from "@/components/card/MainCard/aside-cards.vue"
import LoadingService from "@/plugins/loading";
import { ref, onMounted, watch, reactive } from "vue"
import { getArticleList } from "@/api/article"
import { smoothScrollToTop } from "@/utils/commonUtils"

const total = ref(0) // 总条数
const pageQuery = ref({
  page: 1, // 第1页
  size: 5, // 每页10条数据
  sortBy: {
    "create_time": "DESC"
  }
})

const articles = ref([]) // 文章列表
const isPageLoaded = ref(false) // 分页加载完成标志

// 分页切换时触发
const handlePageChange = async (pageNum) => {
  pageQuery.value.page = pageNum
  await fetchArticles() // 重新请求数据
  // 平滑滚动到顶部

  smoothScrollToTop()

}





// 请求文章列表数据
const fetchArticles = async () => {
  const res = await getArticleList(pageQuery.value)
  const { data, total: fetchedTotal } = res.data
  articles.value = data

  total.value = fetchedTotal
  isPageLoaded.value = true
}

defineOptions({
  name: 'home',
})


onMounted(async () => {
  LoadingService.open()
  await fetchArticles()
  LoadingService.close()
})

</script>

<style scoped></style>
