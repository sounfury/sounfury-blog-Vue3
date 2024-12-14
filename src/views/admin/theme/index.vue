<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="container mx-auto">
            <h1 class="text-3xl font-bold text-gray-800 mb-6 animate-fade-in">主题管理</h1>

            <!-- 新增主题按钮 -->
            <div class="mb-6">
                <button @click="openThemeModal(null)"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105">
                    + 新增主题
                </button>
            </div>

            <!-- 主题列表 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <ThemeCard v-for="theme in themes" :key="theme.themeKey" :theme="theme" @edit="openThemeModal"
                    @delete="confirmDeleteTheme" @ChangeEnable="ChangeEnable" />

            </div>

            <!-- 主题模态框 -->
            <ThemeModal :is-visible="isModalVisible" @close="closeModal" v-model:current-theme="currentTheme"
                @save="saveTheme" />


        </div>
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'

import ThemeCard from './ThemeCard.vue'
import ThemeModal from './ThemeModal.vue'
import useTheme from '@/store/modules/theme.ts'
const themeStore = useTheme()
import {
    getAllThemes,
    getThemeByKey,
    updateTheme,
    deleteTheme,
    addTheme
} from '@/api/theme'
import Swal from 'sweetalert2'

// 主题列表
const themes = ref([])

const editMode = ref(false)

// 当前主题表单
const currentTheme = ref({
    themeKey: '',
    themeName: '',
    description: '',
    //是否启用头图
    mode: '1',
    //是否启用主题
    enableStatus: '1',
    settings: {
        fontFamily: '',
        HeroImageDay: '',
        HeroImageNight: '',
        //打字效果第一行
        TypingEffectFirstLine: '',
        //打字效果第二行
        TypingEffectSecondLine: '',
    }
})



// 模态框显示状态
const isModalVisible = ref(false)

// 获取所有主题
const fetchThemes = async () => {
    try {
        const response = await getAllThemes()
        themes.value = response.data || []
        console.log(themes.value);

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '获取主题失败',
            text: error.message
        })
    }
}

// 打开主题模态框
const openThemeModal = (theme = {}) => {
    currentTheme.value = theme
    if (theme.themeKey) {
        editMode.value = true
    } else {
        editMode.value = false
    }
    isModalVisible.value = true
}
// 保存主题
const saveTheme = async (theme) => {
    try {
        if (editMode.value) {
            console.log(theme);
            console.log(currentTheme.value);
            await updateTheme(currentTheme.value)
        } else {
            // 新增主题
            await addTheme(currentTheme.value)
        }

        if (currentTheme.value.enableStatus == '1') {
            themeStore.getNowTheme()
        }


        // 刷新列表
        await fetchThemes()

        // 关闭模态框
        isModalVisible.value = false

        Swal.fire({
            icon: 'success',
            title: '操作成功',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        })
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '操作失败',
            text: error.message
        })
    }
}

// 确认删除主题
const confirmDeleteTheme = (themeKey) => {
    Swal.fire({
        title: '确定删除此主题?',
        text: "删除后不可恢复",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteTheme(themeKey)
                await fetchThemes()

                Swal.fire({
                    icon: 'success',
                    title: '删除成功',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                })
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: '删除失败',
                    text: error.message
                })
            }
        }
    })
}

// 关闭模态框
const closeModal = () => {
    isModalVisible.value = false
}

const ChangeEnable = async (enable) => {
    console.log(enable)
    currentTheme.value.enableStatus = enable
    await saveTheme()
}

// 组件挂载时获取主题列表
onMounted(fetchThemes)
</script>

<style lang="scss" scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
</style>