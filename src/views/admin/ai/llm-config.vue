<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <!-- 页面头部 -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">AI配置管理</h1>
            <p class="text-gray-600">管理大语言模型配置，包括提供商设置、模型参数和启用状态</p>
        </div>

        <!-- 当前全局配置 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6" v-if="globalConfig">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-800">当前全局配置</h2>
                <el-tag type="success" size="large">
                    <el-icon class="mr-1"><Check /></el-icon>
                    已启用
                </el-tag>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                    <div class="text-sm text-gray-600">提供商</div>
                    <div class="font-semibold text-blue-600">{{ globalConfig.provider.displayName }}</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                    <div class="text-sm text-gray-600">模型</div>
                    <div class="font-semibold text-green-600">{{ globalConfig.provider.modelName }}</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-4">
                    <div class="text-sm text-gray-600">最大Token</div>
                    <div class="font-semibold text-purple-600">{{ globalConfig.settings.maxTokens }}</div>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                    <div class="text-sm text-gray-600">温度</div>
                    <div class="font-semibold text-orange-600">{{ globalConfig.settings.temperature }}</div>
                </div>
            </div>
        </div>

        <!-- 操作栏 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <el-button type="primary" @click="handleCreate">
                        <el-icon class="mr-2"><Plus /></el-icon>
                        新建配置
                    </el-button>
                    <el-button @click="refreshData">
                        <el-icon class="mr-2"><Refresh /></el-icon>
                        刷新
                    </el-button>
                    
                    <!-- 筛选器 -->
                    <el-select v-model="filterParams.providerType" placeholder="提供商类型" clearable @change="fetchConfigs">
                        <el-option label="全部" value="" />
                        <el-option v-for="type in providerTypes" :key="type" :label="type" :value="type" />
                    </el-select>
                    
                    <el-select v-model="filterParams.enabled" placeholder="启用状态" clearable @change="fetchConfigs">
                        <el-option label="全部" value="" />
                        <el-option label="已启用" :value="true" />
                        <el-option label="已禁用" :value="false" />
                    </el-select>
                </div>
            </div>
        </div>

        <!-- 配置列表 -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6">
                <div v-if="loading" class="text-center py-12">
                    <el-icon size="40" class="animate-spin text-blue-500">
                        <Loading />
                    </el-icon>
                    <p class="mt-4 text-gray-500">加载中...</p>
                </div>

                <div v-else-if="configs.length === 0" class="text-center py-12">
                    <el-icon size="60" class="text-gray-300">
                        <Setting />
                    </el-icon>
                    <p class="mt-4 text-gray-500">暂无配置信息</p>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="config in configs" :key="config.id"
                        class="config-card border rounded-lg p-6 hover:shadow-lg transition-all"
                        :class="{ 'ring-2 ring-blue-500': config.enabled }"
                        v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }">
                        
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <el-icon size="24" class="text-white">
                                        <Setting />
                                    </el-icon>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">{{ config.provider.displayName }}</h3>
                                    <p class="text-sm text-gray-500">{{ config.description || config.provider.description }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-3">
                                <el-tag :type="config.enabled ? 'success' : 'info'">
                                    {{ config.enabled ? '已启用' : '已禁用' }}
                                </el-tag>
                                <el-dropdown @command="handleCommand">
                                    <el-button type="primary" size="small">
                                        操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item :command="`edit-${config.id}`">
                                                <el-icon><Edit /></el-icon>
                                                编辑配置
                                            </el-dropdown-item>
                                            <el-dropdown-item 
                                                :command="config.enabled ? `disable-${config.id}` : `enable-${config.id}`"
                                            >
                                                <el-icon>
                                                    <component :is="config.enabled ? 'Close' : 'Check'" />
                                                </el-icon>
                                                {{ config.enabled ? '禁用' : '启用' }}
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </div>

                        <!-- 配置详情 -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="text-xs text-gray-500 mb-1">模型名称</div>
                                <div class="font-medium text-gray-800 truncate">{{ config.provider.modelName }}</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="text-xs text-gray-500 mb-1">最大Token</div>
                                <div class="font-medium text-gray-800">{{ config.settings.maxTokens }}</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="text-xs text-gray-500 mb-1">温度</div>
                                <div class="font-medium text-gray-800">{{ config.settings.temperature }}</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="text-xs text-gray-500 mb-1">超时时间</div>
                                <div class="font-medium text-gray-800">{{ config.settings.timeoutSeconds }}s</div>
                            </div>
                        </div>

                        <!-- 能力标签 -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            <el-tag v-if="config.provider.supportsFunctionCall" size="small" type="success">
                                支持工具调用
                            </el-tag>
                            <el-tag v-if="config.provider.supportsMultimodal" size="small" type="warning">
                                支持多模态
                            </el-tag>
                            <el-tag v-if="config.provider.suitableForAgent" size="small" type="info">
                                适合Agent
                            </el-tag>
                            <el-tag v-if="config.settings.streamEnabled" size="small">
                                流式输出
                            </el-tag>
                        </div>

                        <!-- 时间信息 -->
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>
                                <el-icon class="mr-1"><Clock /></el-icon>
                                创建：{{ formatDate(config.createdAt) }}
                            </span>
                            <span>
                                <el-icon class="mr-1"><Refresh /></el-icon>
                                更新：{{ formatDate(config.updatedAt) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 分页 -->
                <div class="flex justify-center mt-6" v-if="total > 0">
                    <el-pagination 
                        v-model:current-page="page" 
                        v-model:page-size="pageSize" 
                        :total="total"
                        :page-sizes="[10, 20, 30, 50]" 
                        layout="total, sizes, prev, pager, next"
                        @size-change="handleSizeChange" 
                        @current-change="handleCurrentChange" 
                    />
                </div>
            </div>
        </div>

        <!-- 新建配置对话框 -->
        <el-dialog 
            v-model="showCreateDialog" 
            title="新建AI配置"
            width="800px"
            :before-close="handleCreateDialogClose"
            center
            align-center
            append-to-body
        >
            <el-form :model="createForm" :rules="configRules" ref="createFormRef" label-width="120px" class="p-4">
                <!-- 提供商信息 -->
                <div class="mb-6 border-b pb-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">提供商信息</h3>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="提供商类型" prop="providerType">
                                <el-input v-model="createForm.providerType" placeholder="如：OpenAI, Azure, Claude" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="模型名称" prop="modelName">
                                <el-input v-model="createForm.modelName" placeholder="如：gpt-4, claude-3-opus" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                             <el-form-item label="API地址" prop="baseUrl">
                                <el-input v-model="createForm.baseUrl" placeholder="API基础URL" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="API密钥" prop="apiKey">
                                <el-input v-model="createForm.apiKey" type="password" placeholder="请输入API密钥" show-password />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="配置描述" prop="description">
                        <el-input v-model="createForm.description" type="textarea" placeholder="为这个配置添加一些描述信息" />
                    </el-form-item>
                </div>

                <!-- 模型设置 -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">模型设置</h3>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="最大Token数" prop="maxTokens">
                                <el-slider v-model="createForm.maxTokens" :min="1" :max="32000" show-input class="w-full" />
                            </el-form-item>
                        </el-col>
                         <el-col :span="12">
                            <el-form-item label="温度参数" prop="temperature">
                                <el-slider v-model="createForm.temperature" :min="0" :max="2" :step="0.1" show-input class="w-full" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="Top-P参数" prop="topP">
                                 <el-slider v-model="createForm.topP" :min="0" :max="1" :step="0.1" show-input class="w-full" />
                            </el-form-item>
                        </el-col>
                         <el-col :span="12">
                            <el-form-item label="超时时间(秒)" prop="timeoutSeconds">
                                <el-input-number v-model="createForm.timeoutSeconds" :min="1" :max="300" class="w-full" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                           <el-form-item label="频率惩罚" prop="frequencyPenalty">
                                <el-slider v-model="createForm.frequencyPenalty" :min="-2" :max="2" :step="0.1" show-input class="w-full" />
                            </el-form-item>
                        </el-col>
                         <el-col :span="12">
                            <el-form-item label="存在惩罚" prop="presencePenalty">
                                <el-slider v-model="createForm.presencePenalty" :min="-2" :max="2" :step="0.1" show-input class="w-full" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                     <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="重试次数" prop="retryCount">
                                <el-input-number v-model="createForm.retryCount" :min="0" :max="10" class="w-full" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                             <el-form-item label="停止序列" prop="stopSequences">
                                <el-select v-model="createForm.stopSequences" multiple filterable allow-create default-first-option placeholder="输入后按回车创建" class="w-full" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-form-item label="启用配置" prop="enabled">
                                <el-switch v-model="createForm.enabled" />
                            </el-form-item>
                        </el-col>
                         <el-col :span="6">
                            <el-form-item label="流式输出" prop="streamEnabled">
                                <el-switch v-model="createForm.streamEnabled" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleCreateDialogClose">取消</el-button>
                    <el-button type="primary" @click="submitCreateForm" :loading="saving">
                        创建配置
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 编辑配置对话框 -->
        <el-dialog 
            v-model="showEditDialog" 
            title="编辑AI配置"
            width="800px"
            :before-close="handleDialogClose"
            center
            align-center
            append-to-body
        >
            <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="120px">
                <!-- 提供商信息 -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4">提供商信息</h3>
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="提供商类型" prop="providerType">
                                <el-input v-model="configForm.providerType" placeholder="如：openai, claude" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="显示名称" prop="displayName">
                                <el-input v-model="configForm.displayName" placeholder="自定义显示名称" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="API地址" prop="baseUrl">
                                <el-input v-model="configForm.baseUrl" placeholder="API基础URL" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="模型名称" prop="modelName">
                                <el-input v-model="configForm.modelName" placeholder="如：gpt-4, claude-3" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="API密钥" prop="apiKey">
                        <el-input v-model="configForm.apiKey" type="password" placeholder="请输入API密钥" show-password />
                    </el-form-item>
                </div>

                <!-- 模型设置 -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4">模型设置</h3>
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="最大Token数" prop="maxTokens">
                                <el-input-number v-model="configForm.maxTokens" :min="1" :max="32000" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="温度参数" prop="temperature">
                                <el-input-number v-model="configForm.temperature" :min="0" :max="2" :step="0.1" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="Top-P参数" prop="topP">
                                <el-input-number v-model="configForm.topP" :min="0" :max="1" :step="0.1" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="超时时间(秒)" prop="timeoutSeconds">
                                <el-input-number v-model="configForm.timeoutSeconds" :min="1" :max="300" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="重试次数" prop="retryCount">
                                <el-input-number v-model="configForm.retryCount" :min="0" :max="10" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="流式输出" prop="streamEnabled">
                                <el-switch v-model="configForm.streamEnabled" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleDialogClose">取消</el-button>
                    <el-button type="primary" @click="saveConfig" :loading="saving">
                        保存配置
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
    Check, Refresh, Loading, Setting, Edit, Close, Clock, ArrowDown, Plus
} from '@element-plus/icons-vue'
import { 
    getLlmConfigList,
    getGlobalLlmConfig,
    createLlmConfig,
    updateLlmConfig,
    enableLlmConfig,
    disableLlmConfig,
    type LlmConfigurationResponse,
    type CreateLlmConfigurationCommand,
    type UpdateLlmConfigurationCommand,
    type LlmConfigListParams
} from '@/api/ai'
import { formatDate } from '@/utils/date'
import { gsap } from 'gsap'

// 数据状态
const loading = ref(false)
const saving = ref(false)
const configs = ref<LlmConfigurationResponse[]>([])
const globalConfig = ref<LlmConfigurationResponse | null>(null)
const showEditDialog = ref(false)
const showCreateDialog = ref(false)
const editingConfig = ref<LlmConfigurationResponse | null>(null)

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选参数
const filterParams = reactive({
    providerType: '',
    enabled: null as boolean | null
})

// 提供商类型列表
const providerTypes = computed(() => {
    const types = new Set(configs.value.map(config => config.provider.type))
    return Array.from(types)
})

// 新建表单数据
const defaultCreateForm: CreateLlmConfigurationCommand = {
    providerType: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    description: '',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeoutSeconds: 120,
    retryCount: 3,
    stopSequences: [],
    streamEnabled: true,
    enabled: true
}
const createForm = reactive<CreateLlmConfigurationCommand>({ ...defaultCreateForm })

// 编辑表单数据
const configForm = reactive<UpdateLlmConfigurationCommand>({
    configId: 0,
    providerType: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    displayName: '',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeoutSeconds: 60,
    retryCount: 3,
    stopSequences: [],
    streamEnabled: true,
    enabled: true
})

// 表单验证规则
const configRules = {
    providerType: [
        { required: true, message: '请输入提供商类型', trigger: 'blur' }
    ],
    modelName: [
        { required: true, message: '请输入模型名称', trigger: 'blur' }
    ],
    baseUrl: [
        { required: true, message: '请输入API地址', trigger: 'blur' }
    ],
    apiKey: [
        { required: true, message: '请输入API密钥', trigger: 'blur' }
    ]
}

const configFormRef = ref()
const createFormRef = ref()

// 获取配置列表
const fetchConfigs = async () => {
    loading.value = true
    try {
        const params: LlmConfigListParams = {
            page: page.value,
            size: pageSize.value,
            ...filterParams
        }
        
        const res = await getLlmConfigList(params)
        configs.value = res.data.configurations || []
        total.value = res.data.total || 0
    } catch (error) {
        ElMessage.error('获取配置列表失败')
    } finally {
        loading.value = false
    }
}

// 获取全局配置
const fetchGlobalConfig = async () => {
    try {
        const res = await getGlobalLlmConfig()
        globalConfig.value = res.data.data
    } catch (error) {
        // 可能没有全局配置，不显示错误
        globalConfig.value = null
    }
}

// 刷新数据
const refreshData = async () => {
    await Promise.all([fetchConfigs(), fetchGlobalConfig()])
}

// 新建配置
const handleCreate = () => {
    Object.assign(createForm, defaultCreateForm)
    showCreateDialog.value = true
}

// 提交新建表单
const submitCreateForm = async () => {
    if (!createFormRef.value) return
    
    try {
        await createFormRef.value.validate()
        saving.value = true
        
        await createLlmConfig(createForm)
        ElMessage.success('配置创建成功')
        
        handleCreateDialogClose()
        await refreshData()
    } catch (error) {
        ElMessage.error('配置创建失败')
    } finally {
        saving.value = false
    }
}

// 处理命令
const handleCommand = async (command: string) => {
    const [action, configId] = command.split('-')
    const id = parseInt(configId)
    
    switch (action) {
        case 'edit':
            editConfig(id)
            break
        case 'enable':
            await toggleConfigStatus(id, true)
            break
        case 'disable':
            await toggleConfigStatus(id, false)
            break
    }
}

// 编辑配置
const editConfig = (configId: number) => {
    const config = configs.value.find(c => c.id === configId)
    if (!config) return
    
    editingConfig.value = config
    
    // 填充表单
    configForm.configId = config.id
    configForm.providerType = config.provider.type
    configForm.baseUrl = config.provider.baseUrl
    configForm.modelName = config.provider.modelName
    configForm.displayName = config.provider.displayName
    configForm.maxTokens = config.settings.maxTokens
    configForm.temperature = config.settings.temperature
    configForm.topP = config.settings.topP
    configForm.frequencyPenalty = config.settings.frequencyPenalty
    configForm.presencePenalty = config.settings.presencePenalty
    configForm.timeoutSeconds = config.settings.timeoutSeconds
    configForm.retryCount = config.settings.retryCount
    configForm.stopSequences = config.settings.stopSequences
    configForm.streamEnabled = config.settings.streamEnabled
    configForm.enabled = config.enabled
    
    showEditDialog.value = true
}

// 保存配置
const saveConfig = async () => {
    if (!configFormRef.value) return
    
    try {
        await configFormRef.value.validate()
        saving.value = true
        
        await updateLlmConfig(configForm.configId, configForm)
        ElMessage.success('配置更新成功')
        
        handleDialogClose()
        await refreshData()
    } catch (error) {
        ElMessage.error('配置更新失败')
    } finally {
        saving.value = false
    }
}

// 切换配置状态
const toggleConfigStatus = async (configId: number, enabled: boolean) => {
    try {
        const action = enabled ? '启用' : '禁用'
        await ElMessageBox.confirm(`确定要${action}这个配置吗？`, `确认${action}`, {
            type: 'warning'
        })
        
        if (enabled) {
            await enableLlmConfig(configId)
        } else {
            await disableLlmConfig(configId)
        }
        
        ElMessage.success(`配置${action}成功`)
        await refreshData()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败')
        }
    }
}

// 关闭新建对话框
const handleCreateDialogClose = () => {
    showCreateDialog.value = false
    if (createFormRef.value) {
        createFormRef.value.resetFields()
    }
}

// 关闭编辑对话框
const handleDialogClose = () => {
    showEditDialog.value = false
    editingConfig.value = null
    if (configFormRef.value) {
        configFormRef.value.resetFields()
    }
}

// 分页处理
const handleSizeChange = (val: number) => {
    pageSize.value = val
    fetchConfigs()
}

const handleCurrentChange = (val: number) => {
    page.value = val
    fetchConfigs()
}

onMounted(async () => {
    await refreshData()
    
    // 页面进入动画
    gsap.from('.config-card', {
        duration: 0.6,
        opacity: 0,
        y: 30,
        stagger: 0.1,
        ease: 'power2.out'
    })
})
</script>

<style lang="scss" scoped>
.config-card {
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
    }
}

.dialog-footer {
    text-align: right;
}

// 全局配置卡片特殊样式
.bg-white:first-of-type {
    border-left: 4px solid #3b82f6;
}
</style>
