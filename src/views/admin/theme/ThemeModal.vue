<template>
    <div v-if="isVisible"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-white rounded-xl p-8 w-full max-w-xl shadow-2xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">
                {{ isEditMode ? '编辑主题' : '新增主题' }}
            </h2>

            <form @submit.prevent="handleSave" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 mb-2">主题标识</label>
                        <input v-model="editedTheme.themeKey"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入主题标识" required />
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">主题名称</label>
                        <input v-model="editedTheme.themeName"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入主题名称" required />
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 mb-2">描述</label>
                    <textarea v-model="editedTheme.description"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入主题描述" rows="3"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 mb-2">字体</label>
                        <input v-model="editedTheme.settings.fontFamily"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例如 Arial" />
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">是否启用头图</label>
                        <select v-model="editedTheme.mode"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="1">启用</option>
                            <option value="2">禁用</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 mb-2">日间主图</label>
                        <input v-model="editedTheme.settings.HeroImageDay"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="日间图片路径" />
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">夜间主图</label>
                        <input v-model="editedTheme.settings.HeroImageNight"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="夜间图片路径" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 mb-2">打字效果第一行</label>
                        <input v-model="editedTheme.settings.TypingEffectFirstLine"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="第一行文字" />
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">打字效果第二行</label>
                        <input v-model="editedTheme.settings.TypingEffectSecondLine"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="第二行文字" />
                    </div>
                </div>

                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" @click="$emit('close')"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        取消
                    </button>
                    <button type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        保存
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    },
    currentTheme: {
        type: Object,
        default: () => ({})
    }
})

const emits = defineEmits(['close', 'save', 'update:current-theme'])


const editedTheme = reactive({
    themeKey: '',
    themeName: '',
    description: '',
    mode: '1',
    settings: {
        fontFamily: '',
        HeroImageDay: '',
        HeroImageNight: '',
        TypingEffectFirstLine: '',
        TypingEffectSecondLine: ''
    }
})


const isEditMode = ref(false)

// 监听传入的主题变化，初始化表单
watch(() => props.currentTheme, (newTheme) => {
    if (newTheme && Object.keys(newTheme).length > 0) {
        isEditMode.value = true
        Object.assign(editedTheme, JSON.parse(JSON.stringify(newTheme))) // 深拷贝赋值
    } else {
        resetForm()
    }
}, { immediate: true })


// 重置表单
const resetForm = () => {
    isEditMode.value = false
    Object.assign(editedTheme, {
        themeKey: '',
        themeName: '',
        description: '',
        mode: '1',
        settings: {
            fontFamily: '',
            HeroImageDay: '',
            HeroImageNight: '',
            TypingEffectFirstLine: '',
            TypingEffectSecondLine: ''
        }
    })
}


// 保存处理
const handleSave = () => {
    emits('update:current-theme', editedTheme) // 同步更新父组件的 currentTheme
    emits('save', editedTheme)
}
</script>