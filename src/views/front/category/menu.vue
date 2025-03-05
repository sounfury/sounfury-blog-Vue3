<template>
    <div >
        <div  v-for="item in items" :key="item.id" class="group">
            <div class="mt-2 rounded-lg flex items-center p-2 cursor-pointer hover:bg-blue-50 transition-all duration-100 ease-in-out 
                       hover:shadow-sm hover:translate-x-1 group-hover:border-l-4 border-blue-500" :class="{
            'bg-blue-100 text-blue-800 font-semibold': selectedId === item.id,
            'text-gray-700': selectedId !== item.id
        }" @click="handleSelect(item)" @mouseenter="hoverState[item.id] = true"
                @mouseleave="hoverState[item.id] = false">
                <span v-if="item.children && item.children.length"
                    class="expand-icon mr-2 transition-transform duration-100 ease-in-out transform" :class="{
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


                <div class="menu-text flex-grow transition-all duration-100 ease-in-out" :class="{
            'lg:inline hidden': true,
            'text-blue-800 font-medium': selectedId === item.id,
            'group-hover:translate-x-1': true
        }">
                    {{ item.name }}
                </div>
            </div>

            <!-- Submenu with Smooth Transition -->
            <div v-if="item.children && item.children.length"
                class="submenu overflow-hidden transition-all duration-300 ease-in-out" :class="{
            'max-h-0 opacity-0 py-0 invisible': !openNodes[item.id],
            'max-h-[500px] opacity-100 py-2 visible': openNodes[item.id]
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
/* 分类树样式 */
.group {
  @apply mb-2;
}

.group > div {
  @apply relative rounded-lg;
  padding: 0.75rem 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: slideIn 0.3s forwards;
  animation-delay: calc(var(--index, 0) * 0.05s);
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }

  50% {
    opacity: 0.8; /* 加快透明度变化 */
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
.group > div:hover {
  @apply bg-blue-50;
  transform: translateX(0.25rem);
}

.group > div.active {
  @apply bg-blue-100 text-blue-800;
  font-weight: 600;
}

.menu-text {
  @apply text-sm font-medium;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-icon {
  @apply text-gray-400 flex-shrink-0;
  transition: all 0.3s ease;
}

.expand-icon.rotate-90 {
  @apply text-blue-600;
}

/* 子菜单动画 */
.submenu {
  @apply pl-4 mt-1;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.submenu.invisible {
  display: none;
}

.submenu .group > div {
  @apply bg-transparent;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  animation: none; /* 移除子菜单项的动画，避免重复 */
  opacity: 1; /* 确保子菜单项始终不透明 */
}

/* 确保子菜单在关闭状态下完全隐藏 */
.submenu:not(.visible) {
  max-height: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
  pointer-events: none;
}

/* 悬停效果 */
.group > div:hover .menu-text {
  @apply text-blue-600;
}

.group > div:hover .expand-icon {
  @apply text-blue-500;
}

</style>