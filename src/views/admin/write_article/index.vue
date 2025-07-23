<template>
    <div class="flex gap-6 min-h-[calc(100vh-64px)] bg-white p-8">
        <!-- Left Column -->
        <div class="flex-1 flex flex-col gap-6 ">
            <!-- Title Input with Import Button -->
            <div class="relative title-input-container">
                <el-input v-model="articleForm.title" placeholder="在此输入文章标题..."
                    class="text-2xl font-medium border-b-4 border-y-indigo-300 px-0 title-input" maxlength="100" />

                <!-- Markdown Upload Button - positioned inside input -->
                <div class="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <fileUpload
                        button-text="导入MD"
                        upload-type="markdown"
                        :max-size="5"
                        @markdown-parsed="handleMarkdownParsed"
                        @upload-error="handleUploadError"
                        class="import-button-small"
                    />
                </div>
            </div>

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
import fileUpload from "@/components/upload/file-upload.vue";
import confirmButton from '@/components/buttons/confirm-button.vue';
import MarkdownEditor from '@/components/MarkdownEditor/markdown-editor.vue'; // 新的编辑器组件
import gsap from 'gsap'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
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

// 处理markdown文件解析完成
const handleMarkdownParsed = (result) => {
    // 填充表单数据
    articleForm.value.title = result.title
    articleForm.value.content = result.content

    // 处理front-matter中的元数据
    if (result.frontMatter) {
        const frontMatter = result.frontMatter

        // 处理标签
        if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
            articleForm.value.tags = frontMatter.tags
        }

        // 处理创建时间
        if (frontMatter['创建时间'] || frontMatter.created || frontMatter.date) {
            const dateStr = frontMatter['创建时间'] || frontMatter.created || frontMatter.date
            const parsedDate = new Date(dateStr)
            if (!isNaN(parsedDate.getTime())) {
                articleForm.value.createTime = parsedDate
            }
        }

        // 处理摘要
        if (frontMatter.summary || frontMatter.description) {
            articleForm.value.summary = frontMatter.summary || frontMatter.description
        }

        // 处理缩略图/封面图
        if (frontMatter.thumbnail || frontMatter.image || frontMatter['封面图']) {
            articleForm.value.thumbnail = frontMatter.thumbnail || frontMatter.image || frontMatter['封面图']
        }
    }

    // 更新编辑器内容
    if (markdownEditorRef.value && markdownEditorRef.value.setValue) {
        markdownEditorRef.value.setValue(result.content)
    }
}

// 处理上传错误
const handleUploadError = (error) => {
    console.error('文件上传错误:', error)
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

// 显示发布成功弹窗
const showSuccessModal = (articleId) => {
    const randomMessages = [
        "文章发射成功！再来一发？",
        "又一篇上线，休息一下还是继续写？",
        "干得漂亮，快去看看成品吧！",
        "创作完成！你的文字即将点亮世界～",
        "发布成功！这篇文章一定会很受欢迎的！"
    ];

    const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

    Swal.fire({
        icon: null,
        showCancelButton: false,
        showConfirmButton: false,
        html: `
            <div style="text-align: center; padding: 40px 20px;">
                <!-- 成功图标 -->
                <div style="
                    width: 80px;
                    height: 80px;
                    background: #10b981;
                    border-radius: 50%;
                    margin: 0 auto 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
                ">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>

                <!-- 标题 -->
                <h2 style="
                    color: #1f2937;
                    font-size: 1.75rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                    letter-spacing: -0.025em;
                ">发布成功！</h2>

                <!-- 副标题 -->
                <p style="
                    color: #6b7280;
                    font-size: 1rem;
                    margin-bottom: 32px;
                    line-height: 1.5;
                ">${randomMessage}</p>

                <!-- 按钮组 -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    max-width: 320px;
                    margin: 0 auto;
                ">
                    <button id="preview-btn" class="action-btn primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        直接预览
                    </button>

                    <button id="edit-btn" class="action-btn secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        回编辑器
                    </button>

                    <button id="copy-btn" class="action-btn secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="m5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制链接
                    </button>

                    <button id="home-btn" class="action-btn secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
                        回到主页
                    </button>
                </div>
            </div>
        `,
        customClass: {
            popup: 'success-modal-popup',
            htmlContainer: 'success-modal-content'
        },
        didOpen: () => {
            // 绑定按钮事件
            document.getElementById('preview-btn')?.addEventListener('click', () => {
                Swal.close();
                window.open(`/article/${articleId}`, '_blank');
            });

            document.getElementById('edit-btn')?.addEventListener('click', () => {
                Swal.close();
                // 清空表单
                articleForm.value = {
                    title: '',
                    content: '',
                    createTime: new Date(),
                    summary: '',
                    categoryId: 1,
                    thumbnail: '',
                    isTop: 0,
                    enableStatus: 1,
                    isComment: 0,
                    tags: []
                };
                // 清空编辑器
                if (markdownEditorRef.value && markdownEditorRef.value.setValue) {
                    markdownEditorRef.value.setValue('');
                }
            });

            document.getElementById('copy-btn')?.addEventListener('click', async () => {
                const articleUrl = `${window.location.origin}/article/${articleId}`;
                try {
                    await navigator.clipboard.writeText(articleUrl);
                    ElMessage.success('链接已复制到剪贴板！');
                } catch (err) {
                    // 降级方案
                    const textArea = document.createElement('textarea');
                    textArea.value = articleUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    ElMessage.success('链接已复制到剪贴板！');
                }
            });

            document.getElementById('home-btn')?.addEventListener('click', () => {
                Swal.close();
                router.push('/');
            });
        }
    });
};

// 提交表单
const submitForm = async () => {
    const errors = validateForm();
    if (errors.length) {
        ElMessage.error(errors[0]);
        return;
    }
    // 获取编辑器最新内容
    articleForm.value.content = markdownEditorRef.value.getValue();

    // 处理日期时间，避免时区问题
    let dateObj;
    if (articleForm.value.createTime instanceof Date && !isNaN(articleForm.value.createTime.getTime())) {
        dateObj = articleForm.value.createTime;
    } else {
        dateObj = new Date(articleForm.value.createTime);
    }

    // 格式化日期时间，保持本地时间
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    articleForm.value.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const submitFunc = isEdit.value ? updateArticle : addArticle;
    const params = isEdit.value ?
        { ...articleForm.value, id: route.query.id } :
        articleForm.value;

    try {
        const response = await submitFunc(params);

        // 如果是新增文章，显示成功弹窗
        if (!isEdit.value) {
            // 从响应中获取文章ID，假设后端返回的数据结构中包含id
            const articleId = response.data?.id || response.data?.data?.id;
            if (articleId) {
                showSuccessModal(articleId);
            } else {
                ElMessage.success('发布成功');
            }
        } else {
            ElMessage.success('更新成功');
        }
    } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '发布失败');
        console.error('提交失败:', error);
    }
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
.title-input-container {
    position: relative;
    width: 100%;
}

.title-input {
    :deep(.el-input__wrapper) {
        box-shadow: none !important;
        padding: 0;
        padding-right: 120px; /* 为按钮留出空间 */
    }

    :deep(.el-input__inner) {
        font-size: 1.5rem;
        height: 3rem;

        &::placeholder {
            color: #94a3b8;
        }
    }
}

/* 小尺寸导入按钮样式 */
.import-button-small {
    :deep(.upload-button) {
        padding: 0.375rem 0.75rem;
        font-size: 0.625rem;
        gap: 0.375rem;
        border-radius: 0.375rem;
        background-color: #6366f1;
        box-shadow: 0 2px 4px -1px rgba(99, 102, 241, 0.2);

        &:hover:not(:disabled) {
            background-color: #5855eb;
            box-shadow: 0 4px 8px -2px rgba(99, 102, 241, 0.3);
            transform: translateY(-1px);
        }

        svg {
            width: 0.875rem;
            height: 0.875rem;
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

/* SweetAlert2 自定义样式 */
:global(.success-modal-popup) {
    border-radius: 16px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    border: none !important;
    overflow: hidden !important;
    max-width: 480px !important;
}

:global(.success-modal-content) {
    padding: 0 !important;
}

/* 统一的按钮样式 */
:global(.action-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
}

:global(.action-btn.primary) {
    background: #10b981;
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

:global(.action-btn.primary:hover) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

:global(.action-btn.secondary) {
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:global(.action-btn.secondary:hover) {
    background: #f1f5f9;
    color: #334155;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:global(.action-btn:active) {
    transform: translateY(0);
}
</style>