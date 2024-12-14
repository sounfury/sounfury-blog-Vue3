<template>
  <div>
    <card class="tags_card">
      <div class="tags_content"></div>
    </card>

    <div class="m-44 flex justify-center flex-col">
      <tag :tag-id=activeId></tag>
    </div>
  </div>
</template>

<script setup>
import tag from "./tag.vue"
import { inject, ref } from "vue"
import { onMounted } from "vue"
import Card from "@/components/card/BaseCard/card.vue"
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
        sizeRange: [12, 50],
        rotationRange: [0, 10],
        gridSize: 10,
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
  background-color: hsla(0, 0%, 100%, 0.9);
}

.tags_content {
  height: 250px;
}
</style>