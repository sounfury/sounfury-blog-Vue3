<template>
  <div class="post_cards">
    <card :style="{ 'box-shadow': box_shadow }" class="cards_item" v-for="(article, index) in articles" :key="index">
      <router-link :to="'/article/' + article.id">
        <img :src="article.thumbnail || fallbackImage" alt="文章缩略图" />
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
import { defineProps } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
const fallbackImage = "https://via.placeholder.com/150"
const props = defineProps({
  articles: Array, // 文章数据
  box_shadow: String, // 卡片阴影
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
</style>