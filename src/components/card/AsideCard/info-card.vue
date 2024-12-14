<template>
  <Card class="infoCard">

    <h3 style="color: var(--title-color);">
      <font-awesome-icon :icon="['fas', 'chart-line']" />
      网站资讯
    </h3>
    <ul>
      <li v-for="(item, index) in data">
        <div class="info_data">
          {{ item.infoData }}
        </div>
        <div class="info_num">
          {{ item.infoNum }}
        </div>
      </li>
    </ul>
  </Card>
</template>

<script setup>
import Card from "@/components/card/BaseCard/card.vue";
import { ref, onMounted } from "vue";
import { getSiteInfo } from "@/api/site-info"; // 确保你已经定义好这个接口方法

// 初始化数据结构
const data = ref([
  { infoData: "文章总数量", key: "articleCount", default: 0 },
  { infoData: "运行时间", key: "siteCreationDate", transform: getRunningTime, default: "0 天" },
  { infoData: "本站总字数", key: "totalWords", default: 0 },
  { infoData: "本站总访问量", key: "totalVisits", default: 0 },
  { infoData: "最后更新时间", key: "lastUpdateTime", default: "暂无" },
]);

// 运行时间计算函数
function getRunningTime(time) {
  if (!time) return "0 天";
  const date = new Date(time);
  const now = new Date();
  const days = Math.floor((now - date) / (24 * 3600 * 1000));
  return `${days} 天`;
}

// 数据加载函数
async function loadSiteInfo() {
    const res = await getSiteInfo();
    if (res?.code === '200' && res.data) {
      const siteInfo = res.data;

      // 更新 data
      data.value.forEach((item) => {
        const value = siteInfo[item.key];
        item.infoNum = item.transform
          ? item.transform(value)
          : value ?? item.default;
      });
    }
}

onMounted(loadSiteInfo);
</script>
<style scoped>
.infoCard {
  & p {
    font-size: 14px;
    color: #4c4948;
  }
  & li {
    display: flex;
    padding: 5px;
    color: var(--font-color);
  }
}
ul{
    padding-top: 10px;
}
.info_data {
  width: 60%;
  padding-left: 10px;
}
.info_num {
  width: 40%;
  text-align: right;
}
</style>
