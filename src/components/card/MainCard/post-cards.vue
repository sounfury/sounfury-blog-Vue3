<template>
  <div class="post_cards">
    <card :style="{ 'box-shadow': box_shadow }" class="cards_item" v-for="(article, index) in processedArticles" :key="index">
      <router-link :to="'/article/' + article.id">
        <LazyImage
          :blur-src="article.imageUrls.blur"
          :high-res-src="article.imageUrls.high"
          :mobile-high-res-src="article.imageUrls.mobileHigh"
          :alt="article.title + '缩略图'"
          class="article-image"
        />
      </router-link>
      <div class="bw_intr">
        <router-link :to="'/article/' + article.id">
          {{ article.title }}
        </router-link>
        <div class="article_meta">
          <font-awesome-icon :icon="['fas', 'calendar-days']" class="pr-1" />
          <span class="article_meta_item"> 发表于:{{ article.createTime }}
          </span>
          <font-awesome-icon :icon="['fas', 'eye']" class="pr-1" />
          <span class="article_meta_item"> 阅读量:{{ article.viewCount }}</span>
          <font-awesome-icon :icon="['fas', 'inbox']" class="pr-1" />
          <span class="article_meta_item"> 分类: {{ article.category.name }}
          </span>
          <font-awesome-icon :icon="['fas', 'tags']" class="pr-1" />
          <span class="article_meta_item article_meta_tags"> 标签:
            <span v-for="(tag, i) in article.tags" :key="i">
              {{ tag.name }}
              <span v-if="i < article.tags.length - 1">, </span>
            </span>
          </span>
        </div>
        <div class="article_cut">{{ article.summary }}</div>
      </div>
    </card>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import LazyImage from "@/components/LazyImage/index.vue"
import { generateProgressiveImagePair } from "@/utils/imageUtils.js"

const props = defineProps({
  articles: Array, // 文章数据
  box_shadow: String, // 卡片阴影
})

// 处理文章缩略图，生成渐进式图片对
const processedArticles = computed(() => {
  if (!props.articles) return []

  return props.articles.map(article => ({
    ...article,
    imageUrls: generateProgressiveImagePair(article.thumbnail)
  }))
})
</script>

<style scoped>
.post_cards {
  a {
    width: 40%;
  }

  .cards_item:not(:first-child) {
    margin: 30px 0;
  }

  .cards_item {
    width: 100%;
    height: 250px;
    overflow: hidden;
    display: flex;
    opacity: 1;

    & img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: filter 375ms ease-in 0.2s, transform 0.6s;
      transition-duration: 375ms, 0.6s;
      transition-timing-function: ease-in, ease;
      transition-delay: 0.2s, 0s;
      transition-property: filter, transform;

      &:hover {
        transform: scale(1.1);
      }
    }

    .article-image {
      width: 100%;
      height: 100%;

      :deep(.lazy-image-container) {
        width: 100%;
        height: 100%;

        &::before {
          padding-bottom: 0; /* 移除默认宽高比，使用父容器的高度 */
        }

        .lazy-image {
          transition: filter 375ms ease-in 0.2s, transform 0.6s;
          transition-duration: 375ms, 0.6s;
          transition-timing-function: ease-in, ease;
          transition-delay: 0.2s, 0s;
          transition-property: filter, transform;
        }
      }

      &:hover :deep(.lazy-image) {
        transform: scale(1.1);
      }
    }

    &:nth-child(even) {
      display: flex;
      flex-direction: row-reverse;
    }
  }

  .bw_intr {
    padding: 50px 20px 30px 30px;
    overflow: hidden;
    width: 60%;

    & a {
      color: var(--title-color);
      font-size: 1.5em;
      font-weight: normal;

      &:hover {
        color: #ff7242;
      }
    }

    .article_meta {
      margin: 10px 0px;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      color: var(--font-color);
      display: flex;
      align-items: center;


      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        width: 30px;
        height: 100%;
        background: linear-gradient(to right, transparent, var(--bg-color, white));
      }
    }

    .article_meta_item {
      font-size: 0.75em;
      color: var(--font-color);
      padding-right: 10px;
      white-space: nowrap;
    }

    .article_meta_tags {
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .article_cut {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      font-size: 0.875em;
      overflow: hidden;
      color: var(--font-color);
      -webkit-line-clamp: 3;
      text-overflow: ellipsis;
    }
  }
}

@media (max-width: 1200px) {
  .cards_item {
    height: 200px;
  }
}

/* 移动端响应式适配 */
@media (max-width: 768px) {
  .post_cards {
    .cards_item {
      height: auto;
      flex-direction: column !important;

      & a {
        width: 100%;
        height: 200px;
      }

      &:nth-child(even) {
        flex-direction: column !important;
      }
    }

    .bw_intr {
      width: 100%;
      padding: 20px 15px;

      & a {
        font-size: 1.3em;
      }

      .article_meta {
        flex-wrap: wrap;
        gap: 5px;

        &::after {
          display: none;
        }
      }

      .article_meta_item {
        font-size: 0.7em;
        padding-right: 8px;
      }

      .article_cut {
        font-size: 0.8em;
        -webkit-line-clamp: 2;
      }
    }
  }
}

@media (max-width: 480px) {
  .post_cards {
    .cards_item {
      & a {
        height: 150px;
      }
    }

    .bw_intr {
      padding: 15px 10px;

      & a {
        font-size: 1.2em;
      }

      .article_meta_item {
        font-size: 0.65em;
      }
    }
  }
}
</style>