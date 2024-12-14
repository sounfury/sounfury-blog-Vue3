<template>
    <div >
        <div v-for="item in items" :key="item.id" class="group">
            <div class="mt-2 rounded-lg flex items-center p-2 cursor-pointer hover:bg-blue-50 transition-all duration-300 ease-in-out 
                       hover:shadow-sm hover:translate-x-1 group-hover:border-l-4 border-blue-500" :class="{
            'bg-blue-100 text-blue-800 font-semibold': selectedId === item.id,
            'text-gray-700': selectedId !== item.id
        }" @click="handleSelect(item)" @mouseenter="hoverState[item.id] = true"
                @mouseleave="hoverState[item.id] = false">
                <span v-if="item.children && item.children.length"
                    class="expand-icon mr-2 transition-transform duration-300 ease-in-out transform" :class="{
            'rotate-90': openNodes[item.id],
            'text-gray-500': !hoverState[item.id],
            'text-blue-600': hoverState[item.id]
        }">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </span>

                <span v-else class="w-5"></span>


                <div class="menu-text flex-grow transition-all duration-300 ease-in-out" :class="{
            'lg:inline hidden': true,
            'text-blue-800 font-medium': selectedId === item.id,
            'group-hover:translate-x-1': true
        }">
                    {{ item.name }}
                </div>
            </div>

            <!-- Submenu with Smooth Transition -->
            <div v-if="item.children && item.children.length"
                class="submenu overflow-hidden transition-all duration-500 ease-in-out" :class="{
            'max-h-0 opacity-0 py-0': !openNodes[item.id],
            'max-h-screen opacity-100 py-2': openNodes[item.id]
        }">
                <TreeMenu :items="item.children" :selected-id="selectedId" @select="$emit('select', $event)"
                    class="pl-4 border-l-2 border-gray-200" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import TreeMenu from './menu.vue'

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
    selectedId: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['select'])

// Track open nodes and hover states
const openNodes = ref({})
const hoverState = ref({})

const handleSelect = (item) => {
    // Toggle node expansion if it has children
    if (item.children && item.children.length) {
        openNodes.value[item.id] = !openNodes.value[item.id]
    }

    // Emit select event
    emit('select', item)
}
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
/* Most styling is now handled by Tailwind classes */
</style>