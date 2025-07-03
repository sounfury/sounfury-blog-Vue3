<template>
  <div>
    <card class="tags_card">
      <div class="tags_content"></div>
    </card>

    <ArticleListLayout v-if="activeId" :show-sidebar="false" class="article-list-with-tags">
      <template #content>
        <tag :tag-id="activeId"></tag>
      </template>
    </ArticleListLayout>
  </div>
</template>

<script setup>
import tag from "./tag.vue"
import { inject, ref } from "vue"
import { onMounted } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
import ArticleListLayout from "@/components/layout/ArticleListLayout.vue"
import * as echarts from "echarts"
import "echarts-wordcloud"
import { getAllTags } from "@/api/tags"

import useHeader from "@/store/modules/header"

const activeId = ref()
const activeTitle = ref()
const data = ref([])

const getTagsList = async () => {
  try {
    const response = await getAllTags()
    if (response.success) {
      data.value = response.data.map(tag => ({
        name: `#${tag.name} (${tag.articleCount})`,  // 修改这里，添加#号和数量
        value: tag.articleCount,
        rawName: tag.name,  // 保存原始名称用于路由跳转
        id: tag.id
      }))
    }
  } catch (error) {
    console.error("Failed to fetch tags:", error)
  }
}

onMounted(async () => {
  const useHeaderStore = useHeader()
  useHeaderStore.updateTitle("标签")
  useHeaderStore.updateThumbnail("https://sounfury-image.oss-cn-beijing.aliyuncs.com/pixiv/AMIYA.jpg")
  useHeaderStore.updateHeight("400px")
  await getTagsList()
  const chartContainer = document.querySelector(".tags_content")
  if (!chartContainer) return

  const mychart = echarts.init(chartContainer)

  // 根据屏幕尺寸调整字体大小范围
  const isMobile = window.innerWidth <= 768
  const sizeRange = isMobile ? [8, 28] : [12, 50]
  const gridSize = isMobile ? 8 : 10

  mychart.setOption({
    title: {
      text: "",
      top: "0%",
      left: "0",
      textStyle: {
        fontSize: 14,
        fontWeight: "normal",
      },
    },
    series: [
      {
        type: "wordCloud",
        shape: "circle",
        left: "center",
        top: "0%",
        width: "100%",
        height: "100%",
        sizeRange: sizeRange,
        rotationRange: [0, 10],
        gridSize: gridSize,
        layoutAnimation: true,
        textStyle: {
          fontFamily: "sans-serif",
          fontWeight: "bold",
          color: () => {
            return (
              "rgb(" +
              [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
              ].join(",") +
              ")"
            )
          },
        },
        emphasis: {
          focus: "self",
        },
        data: data.value,
      },
    ],
  })

  mychart.on("click", (e) => {    
    useHeaderStore.updateTitle("标签："+e.data.rawName)
    activeTitle.value=e.data.rawName
    activeId.value=e.data.id

  })
})
</script>

<style scoped>
.tags_card {
  height: 250px;
  width: 80%;
  position: absolute;
  top: 35%;
  z-index: 100;
  left: 10%;
  background-color: var(--card_background_color); /* 使用主题背景色 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tags_content {
  height: 250px;
}

/* 文章列表与标签云的间距 */
.article-list-with-tags {
  margin-top: 100px; /* PC端为标签云预留空间，减少间距 */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .tags_card {
    width: 95%;
    left: 2.5%;
    height: 200px;
    top: calc(400px - 100px); /* 头图高度400px，标签云一半在内一半在外 */
    position: absolute; /* 确保绝对定位 */
  }

  .tags_content {
    height: 200px;
  }

  .article-list-with-tags {
    margin-top: calc(400px - 280px); /* 从标签云中间开始，让标签云一半在头图内 */
  }
}

@media (max-width: 480px) {
  .tags_card {
    width: 98%;
    left: 1%;
    height: 180px;
    top: calc(400px - 90px); /* 调整小屏幕的位置 */
    position:  absolute; /* 确保绝对定位 */
  }

  .tags_content {
    height: 180px;
  }
}
</style>