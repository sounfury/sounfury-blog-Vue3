<template>
    <div>
        <component v-for="card in activeCards" :key="card" :is="cardComponents[card] " 
        class="aside_card" />
    </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const props = defineProps({
    activeCards: {
        type: Array,
        default: () => ['aboutMe', 'notice', 'weather', 'filing', 'info']
    }
})

import aboutMeCard from '../AsideCard/about-me-card.vue';
import noticeCard from '../AsideCard/notice-card.vue';
import weatherCard from '../AsideCard/weather-card.vue';
import filingCard from '../AsideCard/archive-card.vue';
import infoCard from '../AsideCard/info-card.vue';


const cardComponents = {
    aboutMe: aboutMeCard,
    notice: noticeCard,
    weather: weatherCard,
    filing: filingCard,
    info: infoCard
}

</script>

<style scoped>
.aside_card {
    padding: 20px;
    width: 100%;
    min-width: 280px;
}

/* 移动端适配 */
@media (max-width: 1024px) {
    .aside_card {
        padding: 15px;
    }
}

@media (max-width: 768px) {
    .aside_card {
        padding: 12px;
    }
}
</style>