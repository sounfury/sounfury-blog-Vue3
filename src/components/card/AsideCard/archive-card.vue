<template>
  <Card class="filiingCard">
    <h3 style="color: var(--title-color);">
      <font-awesome-icon :icon="['fas', 'box-archive']" />
      归档
    </h3>
    <ul>
      <li v-for="(item, index) in filing" :key="index">
        <router-link :to="'/archive/' + item.year + '/' + item.month">
          <span class="archive_date">{{ item.month }}月 {{ item.year }}</span>
          <span class="archive_num">{{ item.articleCount }}</span>
        </router-link>
      </li>
    </ul>
  </Card>
</template>

<script setup>
import Card from "@/components/card/BaseCard/card.vue";
import { getHistoryCount } from "@/api/history";
import { ref } from "vue";
import { onMounted } from "vue";

const filing = ref([]);

onMounted(async () => {
  try {
    // 调用接口获取数据
    const response = await getHistoryCount();
    if (response.success && response.data) {
      // 解析接口返回的数据
      filing.value = response.data.map((item) => {
        const [year, month] = item.date.split("-"); // 拆分日期
        return {
          articleCount: item.count, // 设置文章数量
          year, // 年
          month: parseInt(month, 10), // 转换月份为整数，去掉前导零
        };
      });
    } else {
      console.error("接口返回数据异常:", response);
    }
  } catch (error) {
    console.error("获取归档数据失败:", error);
  }
});
</script>

<style scoped>
ul {
  height: 80%;
  padding-top: 10px;
}
a {
  padding: 4px 0px;
  height: 10%;
  display: flex;
  color: var(--font-color);
}
.archive_date {
  width: 60%;
  padding-left: 10px;
}
.archive_num {
  width: 40%;
  text-align: right;
  padding-right: 20px;
}
li:hover {
  background-color: #49b1f5;

  .archive_date {
    transform: translateX(10px);
    transition: all 0.3s;
  }
  .archive_num {
    transform: translateX(-10px);
    transition: all 0.3s;
  }
}
p {
  color: #fff;
}
</style>
