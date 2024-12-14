<template>
    <button class="transition-all transform hover:scale-110" :class="buttonClasses" @click="$emit('click')">
        <font-awesome-icon :icon="buttonIcon" class="transition-colors duration-300" />
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    type: {
        type: String,
        validator: (value) => ['edit', 'delete'].includes(value),
        required: true
    }
})

defineEmits(['click'])

const buttonClasses = computed(() => {
    return props.type === 'edit'
        ? 'text-blue-500 hover:text-blue-700'
        : 'text-red-500 hover:text-red-700'
})

const buttonIcon = computed(() => {
    return props.type === 'edit'
        ? ['fas', 'pen']
        : ['fas', 'trash']
})
</script>