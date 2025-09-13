<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <!-- 页面头部 -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">全局记忆管理</h1>
            <p class="text-gray-600">管理AI的全局记忆内容，帮助AI更好地理解和记住重要信息</p>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div v-for="stat in stats" :key="stat.title"
                class="bg-white rounded-lg shadow-sm p-6 transform hover:scale-105 transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-gray-600 text-sm">{{ stat.title }}</div>
                        <div class="text-3xl font-bold mt-2" :class="stat.color">{{ stat.value }}</div>
                    </div>
                    <el-icon :size="40" :class="stat.iconColor">
                        <component :is="stat.icon" />
                    </el-icon>
                </div>
            </div>
        </div>

        <!-- 操作栏 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <el-button type="primary" @click="showAddDialog = true">
                        <el-icon class="mr-2"><Plus /></el-icon>
                        新增记忆
                    </el-button>
                    <el-button @click="refreshData">
                        <el-icon class="mr-2"><Refresh /></el-icon>
                        刷新
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 记忆列表 -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6">
                <div v-if="loading" class="text-center py-12">
                    <el-icon size="40" class="animate-spin text-blue-500">
                        <Loading />
                    </el-icon>
                    <p class="mt-4 text-gray-500">加载中...</p>
                </div>

                <div v-else-if="memories.length === 0" class="text-center py-12">
                    <el-icon size="60" class="text-gray-300">
                        <Document />
                    </el-icon>
                    <p class="mt-4 text-gray-500">暂无全局记忆</p>
                    <el-button type="primary" class="mt-4" @click="showAddDialog = true">
                        创建第一个记忆
                    </el-button>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="memory in memories" :key="memory.id"
                        class="memory-card border rounded-lg p-6 hover:shadow-lg transition-all"
                        v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }">
                        
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center space-x-3">
                                <el-icon size="20" class="text-blue-500">
                                    <Collection />
                                </el-icon>
                                <span class="text-sm text-gray-500">记忆 #{{ memory.id }}</span>
                            </div>
                            <div class="flex space-x-2">
                                <el-button type="primary" link @click="editMemory(memory)">
                                    <el-icon><Edit /></el-icon>
                                </el-button>
                                <el-button type="danger" link @click="deleteMemory(memory.id)">
                                    <el-icon><Delete /></el-icon>
                                </el-button>
                            </div>
                        </div>

                        <div class="memory-content mb-4">
                            <p class="text-gray-800 leading-relaxed">{{ memory.content }}</p>
                        </div>

                        <div class="flex justify-between items-center text-sm text-gray-500">
                            <span>
                                <el-icon class="mr-1"><Clock /></el-icon>
                                创建时间：{{ formatDate(memory.createTime) }}
                            </span>
                            <span>{{ memory.content.length }}/2000 字符</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog 
            v-model="showAddDialog" 
            :title="editingMemory ? '编辑记忆' : '新增记忆'"
            width="600px"
            :before-close="handleDialogClose"
            center
            align-center
            append-to-body
        >
            <el-form :model="memoryForm" :rules="memoryRules" ref="memoryFormRef" label-width="80px">
                <el-form-item label="记忆内容" prop="content">
                    <el-input
                        v-model="memoryForm.content"
                        type="textarea"
                        :rows="8"
                        placeholder="请输入要记忆的内容..."
                        maxlength="2000"
                        show-word-limit
                        resize="none"
                    />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleDialogClose">取消</el-button>
                    <el-button type="primary" @click="saveMemory" :loading="saving">
                        {{ editingMemory ? '更新' : '保存' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
    Plus, Refresh, Loading, Document, Collection, Edit, Delete, Clock 
} from '@element-plus/icons-vue'
import { 
    getGlobalMemoryList, 
    getGlobalMemoryStats,
    addGlobalMemory,
    updateGlobalMemory,
    deleteGlobalMemory,
    type GlobalMemoryResponse,
    type GlobalMemoryStats,
    type GlobalMemoryAddReq,
    type GlobalMemoryUpdateReq
} from '@/api/ai'
import { formatDate } from '@/utils/date'
import { gsap } from 'gsap'

// 数据状态
const loading = ref(false)
const saving = ref(false)
const memories = ref<GlobalMemoryResponse[]>([])
const showAddDialog = ref(false)
const editingMemory = ref<GlobalMemoryResponse | null>(null)

// 统计数据
const stats = ref([
    { 
        title: '总记忆数', 
        value: 0, 
        icon: Collection, 
        color: 'text-blue-600',
        iconColor: 'text-blue-500'
    },
    { 
        title: '最大限制', 
        value: 0, 
        icon: Document, 
        color: 'text-green-600',
        iconColor: 'text-green-500'
    },
    { 
        title: '剩余可用', 
        value: 0, 
        icon: Plus, 
        color: 'text-purple-600',
        iconColor: 'text-purple-500'
    }
])

// 表单数据
const memoryForm = reactive({
    content: ''
})

// 表单验证规则
const memoryRules = {
    content: [
        { required: true, message: '请输入记忆内容', trigger: 'blur' },
        { min: 1, max: 2000, message: '内容长度在 1 到 2000 个字符', trigger: 'blur' }
    ]
}

const memoryFormRef = ref()

// 获取记忆列表
const fetchMemories = async () => {
    loading.value = true
    try {
        const res = await getGlobalMemoryList()
        memories.value = res.data || []
    } catch (error) {
        ElMessage.error('获取记忆列表失败')
    } finally {
        loading.value = false
    }
}

// 获取统计信息
const fetchStats = async () => {
    try {
        const res = await getGlobalMemoryStats()
        const statsData: GlobalMemoryStats = res.data
        
        stats.value[0].value = statsData.totalCount
        stats.value[1].value = statsData.maxCount
        stats.value[2].value = statsData.remainingCount
    } catch (error) {
        ElMessage.error('获取统计信息失败')
    }
}

// 刷新数据
const refreshData = async () => {
    await Promise.all([fetchMemories(), fetchStats()])
}

// 编辑记忆
const editMemory = (memory: GlobalMemoryResponse) => {
    editingMemory.value = memory
    memoryForm.content = memory.content
    showAddDialog.value = true
}

// 保存记忆
const saveMemory = async () => {
    if (!memoryFormRef.value) return
    
    try {
        await memoryFormRef.value.validate()
        saving.value = true
        
        if (editingMemory.value) {
            // 更新记忆
            const updateData: GlobalMemoryUpdateReq = {
                id: editingMemory.value.id,
                content: memoryForm.content
            }
            await updateGlobalMemory(updateData)
            ElMessage.success('记忆更新成功')
        } else {
            // 新增记忆
            const addData: GlobalMemoryAddReq = {
                content: memoryForm.content
            }
            await addGlobalMemory(addData)
            ElMessage.success('记忆添加成功')
        }
        
        handleDialogClose()
        await refreshData()
    } catch (error) {
        ElMessage.error(editingMemory.value ? '更新记忆失败' : '添加记忆失败')
    } finally {
        saving.value = false
    }
}

// 删除记忆
const deleteMemory = async (id: number) => {
    try {
        await ElMessageBox.confirm('确定要删除这条记忆吗？删除后无法恢复。', '确认删除', {
            type: 'warning'
        })
        
        await deleteGlobalMemory(id)
        ElMessage.success('记忆删除成功')
        await refreshData()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除记忆失败')
        }
    }
}

// 关闭对话框
const handleDialogClose = () => {
    showAddDialog.value = false
    editingMemory.value = null
    memoryForm.content = ''
    if (memoryFormRef.value) {
        memoryFormRef.value.resetFields()
    }
}

onMounted(async () => {
    await refreshData()
    
    // 页面进入动画
    gsap.from('.memory-card', {
        duration: 0.6,
        opacity: 0,
        y: 30,
        stagger: 0.1,
        ease: 'power2.out'
    })
})
</script>

<style lang="scss" scoped>
.memory-card {
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        border-color: #3b82f6;
    }
}

.memory-content {
    max-height: 120px;
    overflow: hidden;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 20px;
        background: linear-gradient(transparent, white);
        pointer-events: none;
    }
}

.dialog-footer {
    text-align: right;
}

// 统计卡片动画效果
.bg-white:hover {
    .text-3xl {
        animation: pulse 0.6s ease-in-out;
    }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
</style>
