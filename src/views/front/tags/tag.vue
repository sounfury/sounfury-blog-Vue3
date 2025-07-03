<template>
  <div>
    <post_cards :articles="articles" />
    <Pagination v-if="isPageLoaded" :total="total" :pageNum="pageQuery.page" :pageSize="pageQuery.size" @page-change="handlePageChange" />
  </div>
</template>

<script setup>
import post_cards from "@/components/card/MainCard/post-cards.vue"
import Pagination from "@/components/Pagination/index.vue"
import scrollpage from "@/components/scrollpage/scrollpage.vue"
import asideCards from "@/components/card/MainCard/aside-cards.vue"

import { ref, onMounted, watch, reactive } from "vue"
import { getTagsById } from "@/api/tags"


const props=defineProps({
  tagId: Number
})

const total = ref(0) // 总条数
const pageQuery = ref({
  page: 1, // 第1页
  size: 5, // 每页10条数据
  tagId:props.tagId
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
  const res = await getTagsById(pageQuery.value)
  const { data, total: fetchedTotal } = res.data
  articles.value = data

  total.value = fetchedTotal
  isPageLoaded.value = true
}

// 组件挂载时初始化数据
onMounted(async () => {
  if (props.tagId) {
    pageQuery.value.tagId = props.tagId
    await fetchArticles()
  }
})

watch(() => props.tagId, async (newVal) => {
  if (newVal) {
    pageQuery.value.tagId = newVal
    pageQuery.value.page = 1 // 重置页码
    await fetchArticles()
  }
})



</script>

<style scoped></style>
