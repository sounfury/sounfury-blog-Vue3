<template>
    <div class="file-upload-wrapper">
        <!-- 隐藏的文件输入 -->
        <input
            ref="fileInputRef"
            type="file"
            :accept="computedAccept"
            :multiple="multiple"
            @change="handleFileChange"
            style="display: none;"
        />

        <!-- 自定义按钮 -->
        <button @click="triggerFileSelect" :disabled="disabled" class="upload-button">
            <svg
                aria-hidden="true"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    stroke-width="2"
                    stroke="#ffffff"
                    d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                ></path>
                <path
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2"
                    stroke="#ffffff"
                    d="M17 15V18M17 21V18M17 18H14M17 18H20"
                ></path>
            </svg>
            {{ buttonText }}
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import matter from 'front-matter'

// Props定义
const props = defineProps({
    // 按钮文本
    buttonText: {
        type: String,
        default: 'ADD FILE'
    },
    // 接受的文件类型
    accept: {
        type: String,
        default: '*'
    },
    // 文件大小限制（MB）
    maxSize: {
        type: Number,
        default: 5
    },
    // 是否支持多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 是否禁用
    disabled: {
        type: Boolean,
        default: false
    },
    // 上传类型：'image', 'markdown', 'file'
    uploadType: {
        type: String,
        default: 'file'
    }
})

// Emits定义
const emits = defineEmits([
    'file-selected',
    'markdown-parsed',
    'upload-error'
])

// 引用
const fileInputRef = ref(null)

// 计算属性
const computedAccept = computed(() => {
    switch (props.uploadType) {
        case 'image':
            return '.jpg,.jpeg,.png,.gif,.webp'
        case 'markdown':
            return '.md,.markdown'
        default:
            return props.accept
    }
})

// 触发文件选择
const triggerFileSelect = () => {
    if (!props.disabled) {
        fileInputRef.value?.click()
    }
}

// 处理文件选择
const handleFileChange = (event) => {
    const files = Array.from(event.target.files)

    if (files.length === 0) return

    // 如果不支持多选，只处理第一个文件
    const filesToProcess = props.multiple ? files : [files[0]]

    filesToProcess.forEach(file => {
        if (validateFile(file)) {
            processFile(file)
        }
    })

    // 清空input值，允许重复选择同一文件
    event.target.value = ''
}

// 验证文件
const validateFile = (file) => {
    // 文件大小检查
    const isValidSize = file.size / 1024 / 1024 < props.maxSize
    if (!isValidSize) {
        ElMessage.error(`文件大小不能超过${props.maxSize}MB`)
        emits('upload-error', { type: 'size', message: `文件大小超过${props.maxSize}MB` })
        return false
    }

    // 文件类型检查
    if (computedAccept.value !== '*') {
        const acceptTypes = computedAccept.value.split(',').map(type => type.trim())
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        const isValidType = acceptTypes.some(type => {
            if (type.startsWith('.')) {
                return type === fileExtension
            }
            return file.type.includes(type)
        })

        if (!isValidType) {
            const typeText = props.uploadType === 'markdown' ? 'Markdown文件（.md或.markdown）' :
                            props.uploadType === 'image' ? '图片文件' : '指定类型的文件'
            ElMessage.error(`请选择${typeText}`)
            emits('upload-error', { type: 'format', message: `文件格式不正确` })
            return false
        }
    }

    return true
}

// 处理文件
const processFile = (file) => {
    // 触发文件选择事件
    emits('file-selected', file)

    // 根据上传类型进行不同处理
    if (props.uploadType === 'markdown') {
        parseMarkdownFile(file)
    }
}

// 解析Markdown文件
const parseMarkdownFile = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
        try {
            const content = e.target.result

            // 使用front-matter解析文件
            const parsed = matter(content)

            // 提取文件名作为标题（去掉扩展名）
            const fileName = file.name.replace(/\.(md|markdown)$/i, '')

            const result = {
                fileName,
                title: fileName,
                content: parsed.body,
                frontMatter: parsed.attributes || {},
                originalFile: file
            }

            // 触发解析完成事件
            emits('markdown-parsed', result)
            ElMessage.success('Markdown文件解析成功！')

        } catch (error) {
            console.error('解析markdown文件失败:', error)
            ElMessage.error('解析markdown文件失败，请检查文件格式')
            emits('upload-error', { type: 'parse', message: '解析失败', error })
        }
    }

    reader.onerror = () => {
        ElMessage.error('读取文件失败')
        emits('upload-error', { type: 'read', message: '读取文件失败' })
    }

    reader.readAsText(file, 'UTF-8')
}
</script>

<style scoped>
.file-upload-wrapper {
    display: inline-block;
}

.upload-button {
    border: none;
    display: flex;
    padding: 0.75rem 1.5rem;
    background-color: #488aec;
    color: #ffffff;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    text-transform: uppercase;
    vertical-align: middle;
    align-items: center;
    border-radius: 0.5rem;
    user-select: none;
    gap: 0.75rem;
    box-shadow:
        0 4px 6px -1px #488aec31,
        0 2px 4px -1px #488aec17;
    transition: all 0.6s ease;
}

.upload-button:hover:not(:disabled) {
    box-shadow:
        0 10px 15px -3px #488aec4f,
        0 4px 6px -2px #488aec17;
}

.upload-button:focus,
.upload-button:active {
    opacity: 0.85;
    box-shadow: none;
}

.upload-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.upload-button svg {
    width: 1.25rem;
    height: 1.25rem;
}
</style>