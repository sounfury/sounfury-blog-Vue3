<template>
    <div class="p-6 min-h-screen bg-gray-50">
        <!-- 头部统计 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div v-for="stat in stats" :key="stat.title"
                class="bg-white rounded-lg shadow-sm p-6 transform hover:scale-105 transition-all">
                <div class="text-gray-600">{{ stat.title }}</div>
                <div class="text-3xl font-bold mt-2">{{ stat.value }}</div>
            </div>
        </div>

        <!-- 文章列表 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">文章管理</h2>
                <el-button type="primary" @click="router.push('/admin/write')">
                    写文章
                </el-button>
            </div>

            <div class="grid gap-6">
                <div v-for="article in articles" :key="article.id"
                    class="article-card bg-white border rounded-lg p-4 hover:shadow-lg transition-all" v-motion
                    :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0 }">

                    <div class="flex gap-4">
                        <!-- 缩略图 -->
                        <div class="w-48 h-32 rounded-lg overflow-hidden">
                            <img :src="article.thumbnail" class="w-full h-full object-cover" :alt="article.title">
                        </div>

                        <!-- 文章信息 -->
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <h3 class="text-xl font-bold hover:text-blue-600 cursor-pointer"
                                    @click="router.push(`/admin/write?id=${article.id}`)">
                                    {{ article.title }}
                                </h3>
                                <div class="flex gap-2">
                                    <el-tag :type="article.enableStatus === 1 ? 'success' : 'info'">
                                        {{ article.enableStatus === 1 ? '已发布' : '草稿' }}
                                    </el-tag>
                                    <el-tag v-if="article.isTop === 1" type="warning">置顶</el-tag>
                                </div>
                            </div>

                            <p class="text-gray-600 mt-2 line-clamp-2">{{ article.summary }}</p>

                            <div class="flex justify-between items-center mt-4">
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span>
                                        <i class="el-icon-folder"></i>
                                        {{ article.category?.name }}
                                    </span>
                                    <span>
                                        <i class="el-icon-view"></i>
                                        {{ article.viewCount }} 阅读
                                    </span>
                                    <span>
                                        <i class="el-icon-time"></i>
                                        {{ formatDate(article.createTime) }}
                                    </span>
                                </div>

                                <!-- 操作按钮 -->
                                <div class="flex gap-2">
                                    <el-button type="primary" link
                                        @click="router.push(`/admin/write?id=${article.id}`)">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" link @click="handleDelete(article.id)">
                                        删除
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div class="flex justify-center mt-6">
                <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
                    :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticlePage, deleteArticle } from '@/api/article'
import { formatDate } from '@/utils/date'
import gsap from 'gsap'

const router = useRouter()
const articles = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 统计数据
const stats = ref([
    { title: '总文章', value: 0 },
    { title: '已发布', value: 0 },
    { title: '草稿箱', value: 0 }
])

// 获取文章列表
const fetchArticles = async () => {
    try {
        const res = await getArticlePage({
            page: page.value,
            size: pageSize.value,
            params: {}
        })
        articles.value = res.data.data
        total.value = res.data.total
        if(total.value == 0) return

        // 更新统计
        stats.value[0].value = res.data.total
        stats.value[1].value = res.data.data.filter(item => item.enableStatus === 1).length
        stats.value[2].value = res.data.data.filter(item => item.enableStatus === 0).length
    } catch (error) {

        ElMessage.error('获取文章列表失败')
    }
}

// 删除文章
const handleDelete = async (id: number) => {
    try {
        await ElMessageBox.confirm('确定要删除这篇文章吗?', '提示', {
            type: 'warning'
        })
        await deleteArticle(id)
        ElMessage.success('删除成功')
        fetchArticles()
    } catch (error) {
        ElMessage.error('删除失败')
    }
}

const handleSizeChange = (val: number) => {
    pageSize.value = val
    fetchArticles()
}

const handleCurrentChange = (val: number) => {
    page.value = val
    fetchArticles()
}

onMounted(() => {
    fetchArticles()

    // 添加进入动画
    gsap.from('.article-card', {
        duration: 0.6,
        opacity: 0,
        y: 30,
        stagger: 0.1
    })
})
</script>

<style lang="scss" scoped>
.article-card {
    &:hover {
        transform: translateY(-2px);
    }
}
</style>