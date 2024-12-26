<template>
  <footer>
    ©{{ currentYear }} By sounfury | 鲁ICP备2024121123号
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
footer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: inherit;
  height: 100%;
  text-align: center;
  padding: 10px;
  font-size: 0.9em;
  color: var(--font-color);
}
</style>