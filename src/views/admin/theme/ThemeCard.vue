<template>
    <div class="bg-white shadow-lg rounded-2xl p-6 border-l-4 
    transition-all duration-300 ease-in-out 
    hover:shadow-xl" :class="{
        'border-green-500': theme.enableStatus === '1',
        'border-gray-300': theme.enableStatus !== '1'
    }">
        <!-- 头部区域 -->
        <div class="flex justify-between items-center mb-4">
            <div 
            @click="$emit('ChangeEnable', theme.enableStatus=='1'?'0':'1')"
            class="flex items-center">
                <div :class="{
        'bg-green-500 text-white': theme.enableStatus == '1',
        'bg-gray-300 text-gray-600': theme.enableStatus != '1'
    }" class="px-2 py-1 rounded-full text-xs mr-2">
                    {{ theme.enableStatus == '1' ? '已启用' : '未启用' }}


</div>
                <h2 class="text-xl font-semibold text-gray-800">
                    {{ theme.themeName }}
                </h2>
            </div>

            <!-- 操作按钮 -->
            <div class="flex space-x-2">
                <ThemeActionButton type="edit" @click="$emit('edit', theme)" />
                <ThemeActionButton type="delete" @click="$emit('delete', theme.themeKey)" />
            </div>
        </div>

        <!-- 图片预览 -->
        <div class="mb-4 rounded-lg overflow-hidden h-1/3">
            <img :src="theme.settings.HeroImageDay" :alt="theme.themeName + '日间主图'"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        </div>

        <!-- 详细信息 整齐排列 -->
        <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div class="flex flex-col">
                <strong class="text-gray-500 mb-1">主题标识</strong>
                <div class="bg-gray-100 rounded px-3 py-2 text-gray-800 truncate">
                    {{ theme.themeKey }}
                </div>
            </div>

            <div class="flex flex-col">
                <strong class="text-gray-500 mb-1">字体</strong>
                <div class="bg-gray-100 rounded px-3 py-2 text-gray-800 truncate">
                    {{ theme.settings.fontFamily || '默认' }}
                </div>
            </div>

            <div class="col-span-2 flex flex-col">
                <strong class="text-gray-500 mb-1">描述</strong>
                <div class="bg-gray-100 rounded px-3 py-2 text-gray-800 line-clamp-2">
                    {{ theme.description || '暂无描述' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ThemeActionButton from './ThemeActionButton.vue'

const props=defineProps({
    theme: {
        type: Object,
        required: true
    }
})

defineEmits(['edit', 'delete', 'ChangeEnable'])


console.log(props.theme);

</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>