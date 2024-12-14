<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    Document,
    Folder,
    View,
    Star
} from '@element-plus/icons-vue'

// 模拟数据
const statsData = ref([
    {
        icon: Document,
        title: '文章总数',
        value: 42,
        color: 'text-blue-500'
    },
    {
        icon: Folder,
        title: '分类数量',
        value: 8,
        color: 'text-green-500'
    },
    {
        icon: View,
        title: '总浏览量',
        value: 10256,
        color: 'text-purple-500'
    },
    {
        icon: Star,
        title: '点赞数',
        value: 365,
        color: 'text-yellow-500'
    }
])

// 近期文章数据
const recentArticles = ref([
    {
        title: 'Vue 3 最佳实践',
        date: '2024-02-15',
        views: 1205,
        likes: 56
    },
    {
        title: 'TypeScript 入门指南',
        date: '2024-01-22',
        views: 987,
        likes: 42
    },
    {
        title: '现代前端工程化',
        date: '2024-03-01',
        views: 1567,
        likes: 78
    }
])

onMounted(() => {
    // 可以在这里进行数据获取
})
</script>

<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">
            博客管理仪表盘
        </h1>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-4 gap-6">
            <div v-for="(stat, index) in statsData" :key="index"
                class="bg-white rounded-lg shadow-md p-6 flex items-center transform transition hover:scale-105">
                <div class="mr-4">
                    <el-icon :class="['text-5xl', stat.color]">
                        <component :is="stat.icon" />
                    </el-icon>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">{{ stat.title }}</p>
                    <p class="text-2xl font-bold text-gray-800">{{ stat.value }}</p>
                </div>
            </div>
        </div>

        <!-- 近期文章 -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                近期文章
            </h2>
            <el-table :data="recentArticles" stripe class="w-full">
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="date" label="发布日期" />
                <el-table-column label="浏览量">
                    <template #default="scope">
                        <el-tag type="info">
                            {{ scope.row.views }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="点赞数">
                    <template #default="scope">
                        <el-tag type="success">
                            {{ scope.row.likes }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<style scoped>
/* 可以添加一些额外的自定义样式 */
</style>