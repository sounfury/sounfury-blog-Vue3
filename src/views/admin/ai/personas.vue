<template>
    <div class="folio-admin-page-light">
        <!-- 页面头部 -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2 folio-page-title">角色管理</h1>
            <p class="text-gray-500">管理AI角色卡片，创建和配置独特的AI角色人格</p>
        </div>

        <!-- 工具栏 -->
        <div class="folio-toolbar">
            <!-- 左侧：操作 -->
            <div class="flex items-center space-x-3">
                <button @click="showCreateDialog = true" class="folio-create-btn">
                    <el-icon class="mr-2"><Plus /></el-icon>
                    <span>创建角色</span>
                </button>
                <button @click="refreshData" class="folio-icon-btn">
                    <el-icon><Refresh /></el-icon>
                </button>
            </div>
            
            <!-- 中间：筛选与搜索 -->
            <div class="flex-grow flex justify-center items-center space-x-4 px-8">
                <el-input
                    v-model="searchParams.keyword"
                    placeholder="搜索角色名称或描述..."
                    clearable
                    @input="handleSearch"
                    class="w-80 folio-toolbar-input"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
                
                <el-select v-model="searchParams.enabled" placeholder="状态" clearable @change="handleSearch" class="w-32 folio-toolbar-select">
                    <el-option label="全部状态" value="" />
                    <el-option label="已启用" :value="true" />
                    <el-option label="已禁用" :value="false" />
                </el-select>
            </div>

            <!-- 右侧：微缩统计 -->
            <div class="flex items-center space-x-6">
                <div v-for="stat in stats" :key="stat.title" class="folio-mini-stat">
                    <span class="stat-label">{{ stat.title }}</span>
                    <span class="stat-value" :class="stat.color">{{ stat.value }}</span>
                </div>
            </div>
        </div>

        <!-- 角色卡片网格 -->
        <div class="mb-6">
            <div v-if="loading" class="text-center py-12">
                <el-icon size="40" class="animate-spin text-blue-500">
                    <Loading />
                </el-icon>
                <p class="mt-4 text-gray-500">加载中...</p>
            </div>

            <div v-else-if="personas.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
                <el-icon size="60" class="text-gray-300">
                    <Avatar />
                </el-icon>
                <p class="mt-4 text-gray-500">暂无角色卡片</p>
                <el-button type="primary" class="mt-4" @click="showCreateDialog = true">
                    创建第一个角色
                </el-button>
            </div>

            <div v-else class="folio-grid">
                <FolioPersonaCard
                    v-for="persona in personas" 
                    :key="persona.personaId"
                    :persona="persona"
                    @select="openDetail"
                    @edit="editPersona"
                    @delete="deletePersona"
                    @toggle-status="togglePersonaStatus"
                />
            </div>

        </div>

        <!-- 分页 -->
        <div class="flex justify-center" v-if="total > pageSize">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 48, 96]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- 创建/编辑角色弹窗 -->
        <PersonaEditModal 
            v-model="showCreateDialog"
            :is-edit="!!editingPersona"
            :persona-data="editingPersonaData"
            @on-success="handleSuccess"
        />

        <!-- 全屏遮罩详情 -->
        <Teleport to="body">
            <div 
                v-if="selectedDetail" 
                class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                @click="closeDetail"
            >
                <div 
                class="w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex"
                @click.stop
            >
                <!-- 左侧：大卡面 -->
                <div class="w-1/2 relative overflow-hidden">
                    <img
                        :src="selectedDetail.cardCover || '/default-avatar.png'"
                        :alt="selectedDetail.name"
                        class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-8">
                        <div class="text-white text-4xl font-bold mb-4">{{ selectedDetail.name }}</div>
                        <div class="text-white/90 text-base leading-7 max-h-48 overflow-y-auto">
                            {{ selectedDetail.card?.charPersona || selectedDetail.description || '暂无人设描述' }}
                        </div>
                    </div>
                    <!-- 关闭按钮 -->
                    <button 
                        @click="closeDetail"
                        class="absolute top-6 right-6 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- 右侧：游戏风格详情表单 -->
                <div ref="detailScrollEl" class="w-1/2 overflow-y-auto relative folio-panel">
                    <div class="relative z-10">
                        <!-- 顶部固定区域：标题、锚点、保存按钮 -->
                        <div class="sticky top-0 z-20 bg-folio-bg/95 backdrop-blur-md pt-8 pb-4 px-8">
                            <!-- 标题与保存按钮 -->
                            <div class="flex items-center justify-between mb-6">
                                <div class="flex items-center space-x-3">
                                    <div class="w-1 h-7 folio-title-decorator"></div>
                                    <h3 class="text-2xl font-bold folio-title">
                                        角色详情
                                    </h3>
                                </div>
                                <button
                                    @click="saveDetail"
                                    :disabled="submitting"
                                    class="folio-btn-primary group"
                                >
                                    <span v-if="!submitting">保存修改</span>
                                    <span v-else>保存中...</span>
                                </button>
                            </div>

                            <!-- 锚点导航 -->
                            <nav class="folio-anchor-nav">
                                <a
                                    v-for="anchor in sectionAnchors"
                                    :key="anchor.id"
                                    :href="`#${anchor.id}`"
                                    class="folio-anchor-item"
                                    :class="{ 'is-active': activeSectionId === anchor.id }"
                                    @click.prevent="scrollToSection(anchor.id)"
                                >
                                    {{ anchor.label }}
                                </a>
                            </nav>
                        </div>
                        
                        <!-- 表单区域 -->
                        <div class="px-8 pb-8 space-y-8">
                            <!-- 角色名称 -->
                            <div id="section-name" class="folio-form-group">
                                <label class="folio-label">角色名称</label>
                                <input
                                    v-model="detailForm.name"
                                    class="folio-input"
                                    placeholder="请输入角色名称..."
                                />
                            </div>

                            <!-- 封面上传 -->
                            <div id="section-cover" class="folio-form-group">
                                <label class="folio-label">角色封面</label>
                                <div class="folio-upload-area">
                                    <ImageUpload
                                        v-model="detailForm.cardCover"
                                        :size="120"
                                        @upload-success="onDetailCoverUpload"
                                    />
                                </div>
                            </div>

                            <!-- 角色描述 -->
                            <div id="section-desc" class="folio-form-group">
                                <label class="folio-label">角色描述</label>
                                <textarea
                                    v-model="detailForm.description"
                                    rows="3"
                                    class="folio-textarea"
                                    placeholder="请输入角色的基本描述..."
                                ></textarea>
                            </div>

                            <!-- 卡片名称 -->
                            <div id="section-charName" class="folio-form-group">
                                <label class="folio-label">卡片名称</label>
                                <input
                                    v-model="detailForm.card.charName"
                                    class="folio-input"
                                    placeholder="请输入卡片中的角色名称..."
                                />
                            </div>

                            <!-- 角色人设 -->
                            <div id="section-charPersona" class="folio-form-group">
                                <label class="folio-label">角色人设</label>
                                <textarea
                                    v-model="detailForm.card.charPersona"
                                    rows="5"
                                    class="folio-textarea"
                                    placeholder="请描述角色的性格、特点、背景故事..."
                                ></textarea>
                            </div>

                            <!-- 世界观设定 -->
                            <div id="section-world" class="folio-form-group">
                                <label class="folio-label">世界观设定</label>
                                <textarea
                                    v-model="detailForm.card.worldScenario"
                                    rows="4"
                                    class="folio-textarea"
                                    placeholder="请描述角色所在的世界背景..."
                                ></textarea>
                            </div>

                            <!-- 开场白 -->
                            <div id="section-greeting" class="folio-form-group">
                                <label class="folio-label">开场白</label>
                                <textarea
                                    v-model="detailForm.card.charGreeting"
                                    rows="3"
                                    class="folio-textarea"
                                    placeholder="角色的第一句话..."
                                ></textarea>
                            </div>

                            <!-- 示例对话 -->
                            <div id="section-example" class="folio-form-group">
                                <label class="folio-label">示例对话</label>
                                <textarea
                                    v-model="detailForm.card.exampleDialogue"
                                    rows="4"
                                    class="folio-textarea"
                                    placeholder="角色的对话示例..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
    Plus, Refresh, Search, Loading, Avatar, Edit, Delete, 
    Clock, User, VideoPlay, VideoPause
} from '@element-plus/icons-vue'
import { gsap } from 'gsap'

import ImageUpload from '@/components/upload/image-upload.vue'
import PersonaCard from '@/components/ai/admin/PersonaCard.vue'
import FolioPersonaCard from '@/components/ai/admin/FolioPersonaCard.vue'
import PersonaEditModal from '@/components/ai/admin/PersonaEditModal.vue'
import {
    getPersonaList,
    getPersonaById,
    createPersona,
    updatePersona,
    deletePersona as deletePersonaApi,
    updatePersonaStatus,
    type PersonaItem,
    type PersonaDetail,
    type CreatePersonaCommand,
    type UpdatePersonaCommand,
    type PersonaListParams,
    type PersonaPageResponse
} from '@/api/ai'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const editingPersona = ref<PersonaItem | null>(null)
const editingPersonaData = ref<PersonaDetail | null>(null)

// 详情页滚动与锚点
const detailScrollEl = ref<HTMLElement | null>(null)
const activeSectionId = ref('')
const sectionAnchors = [
    { id: 'section-name', label: '名称' },
    { id: 'section-cover', label: '封面' },
    { id: 'section-desc', label: '描述' },
    { id: 'section-charName', label: '卡片名' },
    { id: 'section-charPersona', label: '人设' },
    { id: 'section-world', label: '世界' },
    { id: 'section-greeting', label: '开场' },
    { id: 'section-example', label: '示例' }
]
let observer: IntersectionObserver | null = null


// 分页数据
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const personas = ref<PersonaItem[]>([])
const selectedDetail = ref<PersonaDetail | null>(null)
const detailForm = reactive<PersonaDetail>({
    personaId: '',
    name: '',
    description: '',
    cardCover: '',
    enabled: false,
    createdAt: '',
    updatedAt: '',
    card: {
        charName: '',
        charPersona: '',
        worldScenario: '',
        charGreeting: '',
        exampleDialogue: ''
    },
    worldBookId: ''
} as unknown as PersonaDetail)

// 搜索参数
const searchParams = reactive({
    keyword: '',
    enabled: '' as boolean | ''
})

// 统计数据
const stats = computed(() => [
    {
        title: '总角色数',
        value: total.value,
        color: 'text-blue-600',
        icon: 'Avatar',
        iconColor: 'text-blue-500'
    },
    {
        title: '已启用',
        value: personas.value.filter(p => p.enabled).length,
        color: 'text-green-600',
        icon: 'VideoPlay',
        iconColor: 'text-green-500'
    },
    {
        title: '已禁用',
        value: personas.value.filter(p => !p.enabled).length,
        color: 'text-orange-600',
        icon: 'VideoPause',
        iconColor: 'text-orange-500'
    },
    {
        title: '最新创建',
        value: personas.value.length > 0 ? '今日' : '--',
        color: 'text-purple-600',
        icon: 'Clock',
        iconColor: 'text-purple-500'
    }
])

// 表单数据
const personaForm = reactive<CreatePersonaCommand>({
    name: '',
    description: '',
    cardCover: '',
    card: {
        charName: '',
        charPersona: '',
        worldScenario: '',
        charGreeting: '',
        exampleDialogue: ''
    }
})

// 表单验证规则
const personaRules: FormRules = {
    name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 1, max: 100, message: '角色名称长度为1-100个字符', trigger: 'blur' }
    ],
    description: [
        { max: 500, message: '角色描述不能超过500个字符', trigger: 'blur' }
    ],
    'card.charName': [
        { required: true, message: '请输入角色卡名称', trigger: 'blur' },
        { min: 1, max: 100, message: '角色卡名称长度为1-100个字符', trigger: 'blur' }
    ],
    'card.charPersona': [
        { required: true, message: '请输入角色人设描述', trigger: 'blur' }
    ]
}

// 方法
const fetchPersonas = async () => {
    try {
        loading.value = true
        const params: PersonaListParams = {
            page: currentPage.value,
            size: pageSize.value,
            keyword: searchParams.keyword,
            enabled: searchParams.enabled === '' ? undefined : searchParams.enabled as boolean
        }
        
        const response = await getPersonaList(params)
        personas.value = response.data.personas || []
        total.value = response.data.total || 0
    } catch (error) {
        ElMessage.error('获取角色列表失败')
        console.error('获取角色列表失败:', error)
    } finally {
        loading.value = false
    }
}

const refreshData = () => {
    fetchPersonas()
}

const handleSearch = () => {
    currentPage.value = 1
    fetchPersonas()
}

const handleSizeChange = (size: number) => {
    pageSize.value = size
    fetchPersonas()
}

const handleCurrentChange = (page: number) => {
    currentPage.value = page
    fetchPersonas()
}

const handleCoverUpload = (url: string) => {
    personaForm.cardCover = url
}

const onDetailCoverUpload = (url: string) => {
    detailForm.cardCover = url
}

const handleSuccess = () => {
    fetchPersonas();
    editingPersona.value = null;
    editingPersonaData.value = null;
}

const editPersona = async (persona: PersonaItem) => {
    try {
        const res = await getPersonaById(persona.personaId)
        editingPersona.value = persona
        editingPersonaData.value = res.data as PersonaDetail
        showCreateDialog.value = true
    } catch (e) {
        ElMessage.error('加载待编辑角色信息失败')
    }
}

const togglePersonaStatus = async (persona: PersonaItem) => {
    try {
        await updatePersonaStatus(persona.personaId, { enabled: !persona.enabled })
        ElMessage.success(`角色已${!persona.enabled ? '启用' : '禁用'}`)
        fetchPersonas()
    } catch (error) {
        ElMessage.error('状态更新失败')
        console.error('状态更新失败:', error)
    }
}

const deletePersona = async (persona: PersonaItem) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除角色"${persona.name}"吗？此操作不可恢复。`,
            '删除确认',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        
        await deletePersonaApi(persona.personaId)
        ElMessage.success('角色删除成功')
        fetchPersonas()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('角色删除失败')
            console.error('角色删除失败:', error)
        }
    }
}

// 打开详情
const openDetail = async (persona: PersonaItem) => {
    try {
        const res = await getPersonaById(persona.personaId)
        selectedDetail.value = res.data as PersonaDetail
        Object.assign(detailForm, selectedDetail.value)
    } catch (e) {
        ElMessage.error('加载详情失败')
    }
}

// 保存详情
const saveDetail = async () => {
    if (!selectedDetail.value) return
    try {
        const updateData: UpdatePersonaCommand = {
            personaId: selectedDetail.value.personaId,
            name: detailForm.name,
            description: detailForm.description,
            cardCover: detailForm.cardCover,
            card: {
                charName: detailForm.card.charName,
                charPersona: detailForm.card.charPersona,
                worldScenario: detailForm.card.worldScenario,
                charGreeting: detailForm.card.charGreeting,
                exampleDialogue: detailForm.card.exampleDialogue,
            }
        }
        await updatePersona(selectedDetail.value.personaId, updateData)
        ElMessage.success('保存成功')
        fetchPersonas()
    } catch (e) {
        ElMessage.error('保存失败')
    }
}

// 关闭详情
const closeDetail = () => {
    selectedDetail.value = null
}

// 滚动到指定区域
const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el && detailScrollEl.value) {
        const offsetTop = el.offsetTop - 160 // 留出顶部固定区域空间
        detailScrollEl.value.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        })
    }
}

// 设置IntersectionObserver
const setupIntersectionObserver = () => {
    if (observer) {
        observer.disconnect()
    }
    const options = {
        root: detailScrollEl.value,
        rootMargin: '-160px 0px -50% 0px', // 顶部偏移，保证标题在视区上方时触发
        threshold: 0
    }
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSectionId.value = entry.target.id
            }
        })
    }, options)

    nextTick(() => {
        sectionAnchors.forEach(anchor => {
            const target = document.getElementById(anchor.id)
            if (target) observer?.observe(target)
        })
    })
}

// 监控详情弹窗的显示/隐藏
watch(selectedDetail, (newVal) => {
    if (newVal) {
        nextTick(() => {
            if (detailScrollEl.value) {
                setupIntersectionObserver()
            }
        })
    } else {
        if (observer) {
            observer.disconnect()
            observer = null
        }
    }
})


// 生命周期
onMounted(() => {
    fetchPersonas()
    
    // 页面进入动画
    gsap.from('.folio-admin-page-light > *', {
        duration: 0.6,
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: 'power2.out'
    })
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
})
</script>

<style lang="scss" scoped>
.folio-admin-page-light {
    --folio-main-bg: #f9f8f4;
    --folio-gold: #b8860b;
    --folio-border-color: #e0d9c8;

    background-color: var(--folio-main-bg);
    min-height: 100vh;
    padding: 24px;
    
    .folio-page-title {
        color: #333;
        font-family: 'Times New Roman', Times, serif;
    }

    :deep(.el-pagination) {
        --el-pagination-bg-color: transparent;
        --el-pagination-text-color: #6b6b6b;
        --el-pagination-button-disabled-bg-color: transparent;
        --el-pagination-button-bg-color: transparent;
        --el-pagination-border-color: var(--folio-border-color);
        --el-pagination-font-size: 16px;
        padding: 20px 0;
        
        font-family: 'Times New Roman', Times, serif;

        .el-pagination__total {
            color: var(--el-pagination-text-color);
        }

        .el-pagination__sizes {
            .el-select .el-input__wrapper {
                background-color: #f9f8f4;
                border: 1px solid var(--folio-border-color);
                box-shadow: none !important;
                border-radius: 8px;
                &:hover {
                    border-color: var(--folio-gold);
                }
            }
        }
        
        .el-pager li {
            font-size: 1.1em;
            color: var(--el-pagination-text-color);
            min-width: 32px;
            height: 32px;
            line-height: 32px;
            border-radius: 8px;
            border: 1px solid transparent;
            transition: all 0.3s ease;

            &:hover {
                color: var(--folio-gold);
                border-color: var(--folio-border-color);
            }
            &.is-active {
                color: white;
                font-weight: bold;
                background-color: var(--folio-gold) !important;
                border-color: var(--folio-gold);
            }
        }
        .btn-prev, .btn-next {
            border: 1px solid var(--folio-border-color);
            border-radius: 8px;
            width: 32px;
            height: 32px;
             &:hover {
                color: var(--folio-gold);
                border-color: var(--folio-gold);
            }
        }
        .el-pagination__jump {
            color: var(--el-pagination-text-color);
            .el-input__wrapper {
                 background-color: #f9f8f4;
                border: 1px solid var(--folio-border-color);
                box-shadow: none !important;
                border-radius: 8px;
                 &:hover {
                    border-color: var(--folio-gold);
                }
            }
        }
    }
}

.folio-stat-card {
    background-color: #fff;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--folio-border-color);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);

    &:hover {
        transform: translateY(-5px);
        border-color: var(--folio-gold);
        box-shadow: 0 8px 20px rgba(184, 134, 11, 0.15);
    }
}

.folio-toolbar {
    background-color: #ffffff;
    border: 1px solid var(--folio-border-color);
    backdrop-filter: none;
    padding: 12px 20px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.folio-create-btn {
    background-color: var(--folio-gold);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: #a7770a;
        box-shadow: 0 4px 10px rgba(184, 134, 11, 0.2);
        transform: translateY(-2px);
    }
}

.folio-icon-btn {
    background: transparent;
    border: 1px solid var(--folio-border-color);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: var(--folio-gold);
        border-color: var(--folio-gold);
        transform: rotate(360deg);
    }
}


:deep(.folio-toolbar-input .el-input__wrapper),
:deep(.folio-toolbar-select .el-select__wrapper) {
    background-color: #f9f8f4;
    border: 1px solid var(--folio-border-color);
    box-shadow: none !important;
    border-radius: 8px;
    color: #606266;
    &:hover {
        border-color: var(--folio-gold);
    }
    &.is-focus {
        border-color: var(--folio-gold);
    }
}
:deep(.folio-toolbar-input .el-input__inner) {
    color: #606266;
}

.folio-mini-stat {
    display: flex;
    align-items: baseline;
    font-family: 'Times New Roman', Times, serif;
    .stat-label {
        font-size: 0.9rem;
        color: #777;
        margin-right: 8px;
    }
    .stat-value {
        font-size: 1.2rem;
        font-weight: bold;
    }
}


// 角色卡片网格
.folio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 32px;
    padding: 0;
}


// 表单样式
.persona-form {
    .el-form-item {
        margin-bottom: 20px;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .folio-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
    }

    .persona-card {
        height: 360px;
    }

    .persona-card-cover {
        height: 200px;
    }

    .persona-card-info {
        height: 160px;
        padding: 16px;
    }
}

@media (max-width: 480px) {
    .folio-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
}

// 动画效果
@keyframes glow {
    0% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2); }
    50% { box-shadow: 0 4px 30px rgba(245, 158, 11, 0.4); }
    100% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2); }
}

.persona-card-enabled:hover {
    animation: glow 2s infinite;
}

/* 典藏画册风格 */
.folio-panel {
    --folio-bg: #fdfcf9;
    --folio-border: #e0d9c8;
    --folio-gold-light: #d4af37;
    --folio-gold-dark: #b8860b;
    --folio-text-main: #4a4a4a;
    --folio-text-muted: #888;
    
    background-color: var(--folio-bg);
    background-image:
        linear-gradient(rgba(224, 217, 200, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(224, 217, 200, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    border-left: 1px solid var(--folio-border);
}

.folio-title-decorator {
    background-image: linear-gradient(to bottom, var(--folio-gold-light), var(--folio-gold-dark));
    box-shadow: 0 1px 3px rgba(184, 134, 11, 0.2);
}

.folio-title {
    color: var(--folio-text-main);
    font-family: 'Times New Roman', Times, serif;
}

/* 锚点导航 */
.folio-anchor-nav {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--folio-border);
    padding-bottom: 12px;
}

.folio-anchor-item {
    padding: 6px 14px;
    font-size: 14px;
    color: var(--folio-text-muted);
    border-radius: 6px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    position: relative;

    &.is-active {
        color: var(--folio-gold-dark);
        font-weight: 600;
        background-color: rgba(212, 175, 55, 0.08);
        border-color: rgba(212, 175, 55, 0.2);
    }
    
    &:hover:not(.is-active) {
        color: var(--folio-text-main);
        background-color: rgba(0,0,0,0.04);
    }
}

/* 表单组 */
.folio-form-group {
    padding-top: 16px; /* 为锚点定位留出空间 */
    margin-top: -16px;
}

.folio-label {
    display: inline-block;
    margin-bottom: 12px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--folio-text-main);
    position: relative;
    padding-left: 20px;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background-color: var(--folio-gold-dark);
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 3px var(--folio-gold-dark);
    }
}

.folio-input, .folio-textarea {
    width: 100%;
    padding: 12px 16px;
    background-color: #fff;
    border: 1px solid var(--folio-border);
    border-radius: 8px;
    color: var(--folio-text-main);
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);

    &:focus {
        outline: none;
        border-color: var(--folio-gold-dark);
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15), inset 0 1px 2px rgba(0,0,0,0.05);
    }
    
    &::placeholder {
        color: #aaa;
    }
}

.folio-textarea {
    resize: vertical;
    min-height: 100px;
}

.folio-upload-area {
    padding: 16px;
    background-color: rgba(212, 175, 55, 0.03);
    border: 1px dashed var(--folio-border);
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--folio-gold-light);
      background-color: rgba(212, 175, 55, 0.06);
    }
}

.folio-btn-primary {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    color: white;
    background-image: linear-gradient(to right, var(--folio-gold-light), var(--folio-gold-dark));
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(184, 134, 11, 0.2);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(184, 134, 11, 0.3);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(184, 134, 11, 0.2);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
}

/* 移除旧样式 */
.game-form-group, .game-label, .game-input, .game-textarea, .game-upload-area, .game-btn-primary {
    /* all: unset; */
}
</style>
