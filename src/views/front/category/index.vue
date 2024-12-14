<template>
  <div class="flex h-full p-12">
    <!-- 左侧分类树 -->
    <Card class="p-2">
      <TreeMenu class="1/5" :items="categories" :selected-id="selectedCategoryId" @select="handleCategorySelect" />
    </Card>
    <!-- 右侧内容区 -->
    <div class="flex-1 p-6 overflow-y-auto">
      <card class="category_card p-2">
        <div class="space-y-6">
          <div v-for="(item, index) in articles" :key="item.id"
            class="flex items-start space-x-6 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <router-link :to="'/article/' + item.id" class="w-48 h-32 overflow-hidden rounded-lg">
              <img :src="item.thumbnail"
                class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-200" alt="" />
            </router-link>

            <div class="flex-1">
              <router-link :to="'/article/' + item.id">
                <h2 class="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors duration-200">
                  {{ item.title }}
                </h2>
              </router-link>
              <p class="text-gray-600 line-clamp-2">{{ item.summary }}</p>
            </div>

            <span class="text-gray-400 text-lg font-medium">{{ index + 1 }}</span>
          </div>
        </div>

        <div v-if="articles.length === 0" class="flex items-center justify-center h-40 text-gray-500">
          暂无文章
        </div>

        <Pagination :total="total" :pageSize="pageSize" :pageNum="page_num" @page-change="handlePageChange" />
      </card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
import Pagination from "@/components/Pagination/index.vue"
import TreeMenu from "./menu.vue"
import { getCategoryById, getAllCategory } from "@/api/category"
import useHeader from "@/store/modules/header"




const articles = ref([])
const categories = ref([])
const selectedCategoryId = ref(null)
const selectedCategory = ref(null)

const pageQuery = ref({
  page: 1,
  size: 5,
  categoryId: null
})

const total = ref(0)
const pageSize = ref(5)
const page_num = ref(1)

const handleCategorySelect = (category) => {
  selectedCategoryId.value = category.id
  selectedCategory.value = category
  pageQuery.value = { ...pageQuery.value, categoryId: category.id, page: 1 }
}

const handlePageChange = (page) => {
  pageQuery.value.page = page
  fetchArticles()
}

const fetchArticles = async () => {
  try {
    const res = await getCategoryById(pageQuery.value)
    if (res && res.data) {
      const data = res.data.data || [] // 确保 data 是数组
      const fetchedTotal = res.data.total || 0
      articles.value = data
      total.value = fetchedTotal
      page_num.value = pageQuery.value.page
    } else {
      articles.value = [] // 如果 res.data 不存在
      total.value = 0
    }
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    articles.value = [] // 异常时的处理
    total.value = 0
  }
}


onMounted(async () => {
  const useHeaderStore = useHeader()
  useHeaderStore.updateTitle("分类")
  useHeaderStore.updateHeight("200px")


  try {
    const res = await getAllCategory()
    if (res.code === '200' && res.success) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
})

watch(() => pageQuery.value, fetchArticles, { deep: true })
</script>

<style scoped>
.category_card {
  @apply bg-gray-50 min-h-full;
}
</style>