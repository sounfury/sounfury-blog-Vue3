<template>
  <div class="home p-12">
    <div class="flex justify-center gap-12">
      <div class="w-3/4 ">
        <PostCards :articles="articles" class="w-full" />
        <Pagination v-if="isPageLoaded" :total="total" :pageNum="pageQuery.page" :pageSize="pageQuery.size"
          @page-change="handlePageChange" />
      </div>
      <asideCards :activeCards="['aboutMe', 'notice', 'weather', 'filing', 'info']"
        class="aside_content gap-8 flex flex-col" />

    </div>
  </div>
</template>

<script setup>
import PostCards from "@/components/card/MainCard/post-cards.vue"
import Pagination from "@/components/Pagination/index.vue"
import scrollpage from "@/components/scrollpage/scrollpage.vue"
import asideCards from "@/components/card/MainCard/aside-cards.vue"

import { ref, onMounted, watch, reactive } from "vue"
import { getArticleList } from "@/api/article"

const total = ref(0) // 总条数
const pageQuery = ref({
  page: 1, // 第1页
  size: 5, // 每页10条数据
})

const articles = ref([]) // 文章列表
const isPageLoaded = ref(false) // 分页加载完成标志

// 分页切换时触发
const handlePageChange = async (pageNum) => {
  pageQuery.value.page = pageNum
  await fetchArticles() // 重新请求数据
  // 平滑滚动到顶部
  window.scrollTo({ top: 0, behavior: "smooth" })
}

// 请求文章列表数据
const fetchArticles = async () => {
  const res = await getArticleList(pageQuery.value)
  const { data, total: fetchedTotal } = res.data
  articles.value = data

  total.value = fetchedTotal
  isPageLoaded.value = true
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped></style>
