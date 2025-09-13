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
import { ref, watch } from "vue"
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
<style scoped lang="scss">
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
    position: relative;

    .title {
        margin-bottom: 8px;
        color: white;
        font-weight: 400;
        font-size: 2.5em;
        line-height: 1.5;
        -webkit-line-clamp: 3;
        z-index: 1;
        text-align: center;
        padding: 0 20px;
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
    height: 100%;
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

/* 移动端适配 */
@media (max-width: 768px) {
    header {
        height: 250px;
        min-height: 250px;

        .title {
            font-size: 1.8em;
            margin-bottom: 12px;
            padding: 0 15px;
        }
    }

    .meta {
        font-size: 85%;
        padding: 0 15px;

        .metaline {
            margin: 0.3em 0;

            & span {
                margin-left: 6px;
            }
        }

        /* 移动端隐藏部分元信息 */
        .metaline:nth-child(2) {
            display: none;
        }
    }

    .meta-separator {
        margin-right: 6px;
    }
}

@media (max-width: 480px) {
    header {
        height: 200px;
        min-height: 200px;

        .title {
            font-size: 1.5em;
            line-height: 1.3;
        }
    }

    .meta {
        font-size: 80%;

        .metaline {
            flex-wrap: wrap;
            justify-content: center;

            & span {
                margin-left: 4px;
            }
        }
    }
}
</style>
