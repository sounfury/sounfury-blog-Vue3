<template>
  <div class="flex p-12">
    <!-- 左侧分类树 -->
    <div class="category-floating-container" :class="{ 'expanded': isExpanded }" @mouseenter="isExpanded = true" @mouseleave="isExpanded = false">
      <div class="category-floating-ball" v-show="!isExpanded">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <Card class="category-tree-card" v-show="isExpanded">
        <TreeMenu :items="categories" :selected-id="selectedCategoryId" @select="handleCategorySelect" />
      </Card>
    </div>
    <!-- 右侧内容区 -->
    <div class="flex-1 p-6  pt-0 overflow-y-auto">
      <card class="category_card p-6">
        <div class="space-y-6">
          <div v-for="(item, index) in articles" :key="item.id"
            class="article-item flex items-start space-x-6 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            @click="router.push('/article/' + item.id)">
            <div class="w-48 h-32 overflow-hidden rounded-lg">
              <img :src="item.thumbnail"
                class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-200" alt="" />
            </div>

            <div class="flex-1">
              <h2 class="article-title text-xl font-semibold mb-2 hover:text-blue-600 transition-colors duration-200">
                {{ item.title }}
              </h2>
              <p class="article-summary line-clamp-2">{{ item.summary }}</p>
            </div>

            <span class="article-index text-lg font-medium">{{ index + 1 }}</span>
          </div>
        </div>

        <div v-if="articles.length === 0" class="empty-state flex items-center justify-center h-40">
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
import { useRouter } from "vue-router"

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

const isExpanded = ref(false)

const router = useRouter()

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
  background-color: var(--card_background_color);
  min-height: 100%;
}

/* 文章列表项主题适配 */
.article-item {
  background-color: var(--card_background_color);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.article-title {
  color: var(--title-color);
}

.article-summary {
  color: var(--font-color);
  opacity: 0.8;
}

.article-index {
  color: var(--font-color);
  opacity: 0.6;
}

.empty-state {
  color: var(--font-color);
  opacity: 0.6;
}

.category-floating-container {
  position: fixed;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-floating-ball {
  @apply flex items-center justify-center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4F46E5, #3B82F6);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.category-floating-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.category-tree-card {
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 280px;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: var(--card_background_color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateX(-20px);
}

.category-floating-container.expanded .category-tree-card {
  opacity: 1;
  transform: translateX(0);
}

/* 自定义滚动条样式 */
.category-tree-card::-webkit-scrollbar {
  width: 4px;
}

.category-tree-card::-webkit-scrollbar-track {
  background: transparent;
}

.category-tree-card::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 2px;
}

.category-tree-card::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* 添加动画过渡效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  /* 主容器适配 */
  .flex.p-12 {
    padding: 1rem;
    flex-direction: column;
  }

  /* 分类树移动端适配 */
  .category-floating-container {
    left: 0.5rem;
    top: 20%;
  }

  .category-floating-ball {
    width: 40px;
    height: 40px;
  }

  .category-tree-card {
    width: 250px;
    max-height: 60vh;
  }

  /* 移动端隐藏滚动条 */
  .category-tree-card::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  /* 右侧内容区适配 */
  .flex-1.p-6 {
    padding: 1rem;
    margin-top: 0;
  }

  .category_card {
    padding: 1rem;
  }

  /* 文章列表项适配 */
  .space-y-6 > div {
    flex-direction: column;
    space-x: 0;
    padding: 1rem;
  }

  .space-y-6 > div .w-48 {
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
  }

  .space-y-6 > div .flex-1 {
    margin-bottom: 0.5rem;
  }

  .space-y-6 > div .text-xl {
    font-size: 1.125rem;
    line-height: 1.5;
  }

  .space-y-6 > div .text-gray-400 {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  /* 小屏幕进一步优化 */
  .flex.p-12 {
    padding: 0.5rem;
  }

  .category-floating-container {
    left: 0.25rem;
    top: 15%;
  }

  .category-floating-ball {
    width: 36px;
    height: 36px;
  }

  .category-tree-card {
    width: 220px;
    max-height: 50vh;
    padding: 0.75rem;
  }

  .flex-1.p-6 {
    padding: 0.5rem;
  }

  .category_card {
    padding: 0.75rem;
  }

  .space-y-6 > div {
    padding: 0.75rem;
  }

  .space-y-6 > div .w-48 {
    height: 160px;
  }

  .space-y-6 > div .text-xl {
    font-size: 1rem;
  }

  .space-y-6 > div .text-gray-600 {
    font-size: 0.875rem;
  }
}

/* 黑夜主题特殊适配 */
html[data-theme="dark"] {
  .article-item {
    background-color: var(--card_background_color);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .article-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .category-tree-card {
    background: var(--card_background_color);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .category-floating-ball {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
}
</style>