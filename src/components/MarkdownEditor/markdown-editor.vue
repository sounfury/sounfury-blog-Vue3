<template>
    <div ref="editorContainer" class="min-h-[500px]"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, shallowRef } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    cacheId: {
        type: String,
        default: 'default-editor'
    }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
const vditorInstance = shallowRef(null)

const initEditor = () => {
    // Enhanced initialization check
    if (!editorContainer.value) {
        console.error('Editor container is not available')
        return
    }

    try {
        const editor = new Vditor(editorContainer.value, {
            height: 500,
            width: '100%',
            theme: 'classic',
            mode: 'sv',
            toolbar: [
                'emoji', 'headings', 'bold', 'italic', 'strike', 'link',
                'list', 'ordered-list', 'check', 'outdent', 'indent',
                'quote', 'line', 'code', 'inline-code', 'insert-before',
                'insert-after', 'table', 'undo', 'redo', 'fullscreen'
            ],
            cache: {
                id: props.cacheId,
                enable: true
            },
            input: (value) => {
                emit('update:modelValue', value)
            },
            afterInit: () => {
                // Set initial value only after full initialization
                if (props.modelValue) {
                    try {
                        editor.setValue(props.modelValue)
                    } catch (setError) {
                        console.error('Error setting initial value:', setError)
                    }
                }
            }
        })

        // Use shallowRef to store the instance
        vditorInstance.value = editor
    } catch (error) {
        console.error('Vditor initialization failed:', error)
    }
}

watch(() => props.modelValue, (newValue) => {
    if (!vditorInstance.value) return
    
    console.log(vditorInstance.value);

    try {
        // Prevent unnecessary updates
        const currentValue = vditorInstance.value.getValue()
        if (newValue !== currentValue) {
            vditorInstance.value.setValue(newValue)
        }
    } catch (error) {
        console.error('Error updating Vditor value:', error)
    }
}, { immediate: true })

onMounted(() => {
    // Ensure DOM is ready before initialization
    nextTick(initEditor)
})

onUnmounted(() => {
    if (vditorInstance.value) {
        try {
            vditorInstance.value.destroy()
        } catch (error) {
            console.error('Error destroying Vditor:', error)
        }
        vditorInstance.value = null
    }
})

// Safe method to get current editor value
const getValue = () => {
    return vditorInstance.value ? vditorInstance.value.getValue() : ''
}

// Expose methods
defineExpose({
    getValue
})
</script>
<style scoped>
/* 可选的样式 */
.vditor {
    max-width: 100%;
    overflow: auto;
}
</style>