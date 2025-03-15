<template>
    <div class="flex gap-6 min-h-[calc(100vh-64px)] bg-white p-8">
        <!-- Left Column -->
        <div class="flex-1 flex flex-col gap-6 ">
            <!-- Title Input -->


            <el-input v-model="articleForm.title" placeholder="在此输入文章标题..."
                class="text-2xl font-medium border-b-4 border-y-indigo-300 px-0 title-input " maxlength="100" />

            <!-- Markdown Editor -->
            <div class="flex-1 editor-wrapper">
                <MarkdownEditor v-model="articleForm.content" :cache-id="editorCacheId" ref="markdownEditorRef"
                    class="h-full" />
            </div>

            <!-- Article Settings -->
            <div class="flex items-center justify-start gap-8 py-4">
                <switchButton v-model="articleForm.isTop" active-text="置顶文章" :active-value="1" inactive-text="普通文章"
                    :inactive-value="0" />
                <switchButton v-model="articleForm.enableStatus" active-text="立即发布" inactive-text="存为草稿"
                    :active-value="1" :inactive-value="0" />
                <switchButton v-model="articleForm.isComment" active-text="允许评论" inactive-text="禁止评论" :active-value="1"
                    :inactive-value="0" />
            </div>
        </div>

        <!-- Right Column -->
        <div class="w-80 flex flex-col gap-6">
            <!-- Publish Date -->
            <div class="space-y-2 flex flex-col">
                <label class="text-sm font-medium text-gray-600">发布时间</label>
                <el-date-picker v-model="articleForm.createTime" type="datetime" placeholder="选择发布时间" class="w-full"
                    :default-time="new Date(2000, 1, 1, 0, 0, 0)" />
            </div>

            <!-- Category Select -->
            <div class="space-y-2 flex flex-col">
                <label class="text-sm font-medium text-gray-600">文章分类</label>
                <el-select v-model="articleForm.categoryId" placeholder="选择分类" class="w-full">
                    <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </div>

            <!-- Tags Input -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600">文章标签</label>
                <el-autocomplete v-model="tagInput" :fetch-suggestions="queryTags" placeholder="输入标签，回车添加"
                    @keyup.enter="handleTagEnter" class="w-full" />
                <div class="flex flex-wrap gap-2 mt-2">
                    <el-tag v-for="tag in articleForm.tags" :key="tag" closable @close="removeTag(tag)"
                        class="animate-fadeIn">
                        {{ tag }}
                    </el-tag>
                </div>
            </div>

            <!-- Thumbnail -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600">缩略图</label>
                <div class="flex gap-2">
                    <el-input v-model="articleForm.thumbnail" placeholder="图片地址" />
                    <imageUpload @upload-success="handleUploadSuccess" />
                </div>
            </div>

            <!-- Summary -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600">文章摘要</label>
                <el-input v-model="articleForm.summary" type="textarea" :rows="4" placeholder="简短的文章描述..."
                    maxlength="300" show-word-limit />
            </div>

            <!-- Submit Button -->
            <div class="flex justify-center mt-auto pt-6">
                <confirmButton type="primary" @click="submitForm" class="w-40">
                    {{ isEdit ? '更新文章' : '发布文章' }}
                </confirmButton>
            </div>
        </div>
    </div>
</template>
<script setup>
import { addArticle } from '@/api/article';
import { updateArticle } from '@/api/article';
import { getCategoryDict } from '@/api/category';
import { getArticleDetail } from '@/api/article';
import { getTagsDict } from '@/api/tags';
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus';
import switchButton from "@/components/buttons/switch-button.vue";
import imageUpload from "@/components/upload/image-upload.vue";
import confirmButton from '@/components/buttons/confirm-button.vue';
import MarkdownEditor from '@/components/MarkdownEditor/markdown-editor.vue'; // 新的编辑器组件
import gsap from 'gsap'

const route = useRoute()
const isEdit = computed(() => !!route.query.id);

// 引用
const contentWrapper = ref(null)
const title = ref(null)
const formRef = ref(null)
const markdownEditorRef = ref(null)

// 生成唯一的缓存ID，避免缓存串场
const editorCacheId = computed(() => {
    return isEdit.value ? `editor-edit-${route.query.id}` : 'editor-new-article'
})

// 表单数据
const articleForm = ref({
    title: '',
    content: '',
    createTime: new Date(), // 默认当前时间
    summary: '',
    categoryId: 1,
    thumbnail: '',
    isTop: 0,
    enableStatus: 1,
    isComment: 0,
    tags: []
})

// 分类选项
const categoryOptions = ref([])
// 标签输入
const tagInput = ref('')
const existingTags = ref([])

// 初始化数据
const initData = async () => {
    try {
        // 获取分类字典
        const categoryRes = await getCategoryDict()
        categoryOptions.value = Object.entries(categoryRes.data).map(([id, name]) => ({
            label: name,
            value: parseInt(id, 10)
        }))


        // 获取标签字典
        const tagsRes = await getTagsDict()
        existingTags.value = tagsRes.data

        // 如果是编辑模式，获取文章详情
        if (isEdit.value) {
            const articleRes = await getArticleDetail(route.query.id)
            const article = articleRes.data

            articleForm.value = {
                title: article.title,
                content: article.content,
                summary: article.summary,
                categoryId: article.categoryId,
                thumbnail: article.thumbnail,
                isTop: article.isTop ? article.isTop : 0,
                enableStatus: article.enableStatus ? article.enableStatus : 0,
                isComment: article.isComment ? article.isComment : 0,
                tags: (article.tags || []).map(tag => tag.name),
                createTime: article.createTime
            }
        }
    } catch (error) {
        console.log(error);
        ElMessage.error('初始化数据失败')
    }
}

// 标签相关方法
const queryTags = (queryString, cb) => {
    const tagsArray = Object.values(existingTags.value); // 将对象值转换为数组
    const results = queryString
        ? tagsArray.filter(tag =>
            tag.toLowerCase().includes(queryString.toLowerCase())
        )
        : [];
    cb(results.map(tag => ({ value: tag })));
}

const handleTagEnter = () => {
    if (tagInput.value.trim()) {
        const tags = tagInput.value.split(/\s+/).filter(Boolean)
        tags.forEach(tag => {
            if (!articleForm.value.tags.includes(tag)) {
                articleForm.value.tags.push(tag)
            }
        })
        tagInput.value = ''
    }
}

const removeTag = (tag) => {
    articleForm.value.tags = articleForm.value.tags.filter(t => t !== tag)
}

// 上传相关方法
const handleUploadSuccess = (url) => {
    articleForm.value.thumbnail = url
    ElMessage.success('上传成功')
}

// 表单校验函数
const validateForm = () => {
    const errors = [];

    if (!articleForm.value.title?.trim()) {
        errors.push('标题不能为空');
    }
    if (!articleForm.value.content?.trim()) {
        errors.push('文章内容不能为空');
    }
    if (!articleForm.value.categoryId) {
        errors.push('请选择文章分类');
    }

    return errors;
}

// 提交表单
const submitForm = async () => {
    const errors = validateForm();
    if (errors.length) {
        ElMessage.error(errors[0]);
        return;
    }
    // 获取编辑器最新内容
    articleForm.value.content = markdownEditorRef.value.getValue();
    articleForm.value.createTime = 
    articleForm.value.createTime instanceof Date && !isNaN(articleForm.value.createTime.getTime())
        ? articleForm.value.createTime.toISOString().replace('T', ' ').split('.')[0]
        : new Date(articleForm.value.createTime).toISOString().replace('T', ' ').split('.')[0]; const submitFunc = isEdit.value ? updateArticle : addArticle;
    const params = isEdit.value ?
        { ...articleForm.value, id: route.query.id } :
        articleForm.value;

    await submitFunc(params);

    ElMessage.success(isEdit.value ? '更新成功' : '发布成功');
}

// 页面动画
const initAnimation = () => {
    gsap.from(contentWrapper.value, {
        duration: 0.8,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    })

    gsap.from(title.value, {
        duration: 0.6,
        x: -30,
        opacity: 0,
        delay: 0.3,
        ease: 'power2.out'
    })
}

// 生命周期钩子
onMounted(async () => {
    await initData()
    initAnimation()
})
</script>

<style lang="scss" scoped>
.title-input {
    :deep(.el-input__wrapper) {
        box-shadow: none !important;
        padding: 0;
    }

    :deep(.el-input__inner) {
        font-size: 1.5rem;
        height: 3rem;

        &::placeholder {
            color: #94a3b8;
        }
    }
}

.editor-wrapper {
    :deep(.vditor) {
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        height: 100%;
    }
}

.animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}



/* 自定义 Vditor 样式 */
.vditor {
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.vditor-toolbar {
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 0.5rem 0.5rem 0 0;
}

.vditor-content {
    background: white;
}

/* Element Plus 组件样式重写 */
.el-button--primary {
    @apply bg-gradient-to-r from-violet-500 to-pink-500 border-none;
}

.el-button--primary:hover {
    @apply from-violet-600 to-pink-600;
}

.el-tag {
    @apply bg-gradient-to-r from-violet-100 to-pink-100 border-none text-gray-700;
}

:deep(.el-button--primary) {
    @apply bg-blue-500 hover:bg-blue-600 transition-colors;
    border: none;
}

:deep(.el-tag) {
    @apply bg-blue-50 text-blue-600 border-none;
}

// 添加页面进入动画
.flex {
    animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>