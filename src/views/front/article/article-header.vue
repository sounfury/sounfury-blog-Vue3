<template>
    <header :style="{ backgroundImage: `url(${thumbnail})` }">
        <div class="title">
            <span>{{ title }}</span>
        </div>
        <div class="meta" v-if="isShow">
            <div class="metaline">
                <font-awesome-icon :icon="['fas', 'calendar-days']" />
                <span>发表于 {{ meta.createTime }}</span>
                <span class="meta-separator">|</span>
                <font-awesome-icon :icon="['fas', 'clock-rotate-left']" />
                <span>更新于 {{ meta.updateTime }}</span>
                <span class="meta-separator">|</span>
                <font-awesome-icon :icon="['fas', 'inbox']" />
                <span>{{ meta.categoryName }}</span>
            </div>
            <div class="metaline">
                <font-awesome-icon :icon="['fas', 'pen']" />
                <span>字数统计 {{ meta.count }}</span>
                <span class="meta-separator">|</span>
                <font-awesome-icon :icon="['fas', 'eye']" />
                <span>阅读量 {{ meta.viewCount }}</span>
            </div>
            <div class="metaline" v-if="meta.tags.length">
                <font-awesome-icon :icon="['fas', 'tags']" />
                <span>标签: {{ meta.tags.map(tag => tag.name).join(", ") }}</span>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref } from "vue"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

const isShow = ref(false)
const props = defineProps({
    thumbnail: String,
    title: String,
    meta: Object,
})


watch(
    () => props.meta,
    (newMeta) => {

        isShow.value = !!newMeta
    },
    { immediate: true }
)
</script>
<style scoped>
header {
    object-fit: cover;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 400px;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .title {
        margin-bottom: 8px;
        color: white;
        font-weight: 400;
        font-size: 2.5em;
        line-height: 1.5;
        -webkit-line-clamp: 3;
        z-index: 1;
    }

    & span {
        border-right: 1;
    }
}

header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 400px;
    background: rgba(0, 0, 0, 0.5);
    z-index: 0;
}

.meta {
    z-index: 1;
    color: var(--light-grey);
    font-size: 95%;

    .metaline {
        text-align: center;
        margin: 0.5em 0;

        & span {
            margin-left: 10px;
        }
    }
}

.meta-separator {
    margin-right: 10px;
}
</style>
