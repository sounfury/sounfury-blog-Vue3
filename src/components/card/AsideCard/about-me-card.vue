<template>
  <Card class="mycard">
    <div class="img_container">
      <img :src="AboutUser.img" alt="1" />
    </div>
    <p style="font-size: 1.375em; color:var(--font-color); text-align: center">
      {{ AboutUser.username }}
    </p>
    <p style="font-size: 1e; color: var(--font-color); text-align: center">
      {{ AboutUser.introduction }}
    </p>
    <div class="bottom">
      <a>
        <div class="head">文章</div>
        <div class="next">{{ AboutUser.article_num }}</div>
      </a>
      <a>
        <div class="head">标签</div>
        <div class="next">{{ AboutUser.tag_num }}</div>
      </a>
      <a>
        <div class="head">分类</div>
        <div class="next">{{ AboutUser.category_num }}</div>
      </a>
    </div>
    <a :href="AboutUser.website"><button>个人网站</button></a>

  </Card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
import { getCountInfo } from "@/api/site-info"
const AboutUser = reactive({
  username: ref("sounfury"),
  introduction: ref("一个人类"),
  img: ref(
    "https://sounfury-image.oss-cn-beijing.aliyuncs.com/picgo/QQ%E5%9B%BE%E7%89%8720230106220258.jpg"
  ),
  article_num: ref(0),
  tag_num: ref(0),
  category_num: ref(0),
  website: ref("https://sounfury.github.io/"),
})

onMounted(() => {
  getCountInfo().then(res => {
    AboutUser.article_num = res.data.articleCount
    AboutUser.tag_num = res.data.tagsCount
    AboutUser.category_num = res.data.categoryCount
  })
})

</script>

<style scoped>
.img_container {
  & img {
    display: block;
    margin: 0 auto;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.mycard {
  height: 338px;
}

button {
  margin-top: 10px;
  padding: 0;
  width: 100%;
  height: 35px;
  background-color: #49b1f5;
  border: none;
  cursor: pointer;
  color: #fff;
  font-weight: 400;
  font-size: 1em;
}

/* .aside_card > * {
  padding-top: 12px;
} */
.bottom {
  padding-top: 20px;
  padding: 20px 30px 0 30px;
  display: flex;
  justify-content: space-between;

  .head {
    font-size: 0.875em;
    color: var(--font-color);
    font-weight: 700;
  }

  .next {
    padding-top: 10px;
    text-align: center;
    font-size: 1.25em;
    font-weight: 400;
    color: var(--font-color);
  }
}

@media (max-width: 600px) {
  .bottom {
    flex-direction: column;
    /* 修改 */
    align-items: center;
    /* 修改 */
  }

  .bottom a {
    flex: none;
    /* 修改 */
  }
}
</style>
