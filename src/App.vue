<template>
    <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import useSettings from './store/modules/settings';
import { watch } from 'vue';

onMounted(() => {
    useSettings().initIcon();
})

watch(useSettings().settings, (newVal, oldVal) => {
    useSettings().initIcon();
}), { immediate: true }
</script>

<style>

</style>
