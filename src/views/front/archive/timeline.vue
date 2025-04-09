<template>
  <div class="shell" id="shell" ref="shellRef">
    <header class="header" ref="header_ref">
      <h2 class="title">{{ type }}</h2>
      <h3 class="subtitle">试着重温旧梦吧</h3>
    </header>

    <div class="timeline">
      <!-- 当 items 为空时，显示提示文字和占位图片 -->
      <div v-if="items.length === 0" class="placeholder">
        <p class="placeholder-text">暂无文章，敬请期待...</p>
      </div>

      <!-- 当 items 非空时，显示文章列表 -->
      <div v-else class="timeline">
        <div v-for="(item, index) in items" :key="index" class="item" :data-text="item.title" ref="itemRefs">
          <router-link :to="'/article/' + item.id">
            <div class="content">
              <img class="img" :src="item.thumbnail" />
              <h2 class="content-title">{{ item.createTime }}</h2>
              <p class="content-desc">{{ item.summary }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="h-24"></div>
    <Pagination v-if="total > 0" :total="total" :pageNum="pageQuery.page" :pageSize="pageQuery.size"
      @page-change="handlePageChange" />
    <el-footer class="mt-7">
      <Footer />
    </el-footer>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { onMounted } from "vue"
import Footer from "@/components/layout/footer.vue"
import { useRouter } from "vue-router"
import Pagination from "@/components/Pagination/index.vue"

const activeClass = "item--active"

const type = ref("归档")
const itemRefs = ref([])
const shellRef = ref(null)
const header_ref = ref(null)
let shellElement = null
let itemdoms = []
const timelineScroll = () => {
  const pos = window.scrollY

  itemdoms.forEach((item, i) => {
    const min = item.offsetTop
    const max = item.offsetHeight + item.offsetTop

    if (i === itemdoms.length - 2 && pos > min + item.offsetHeight / 2) {
      // Set last item as active
      itemdoms.forEach((item) => item.classList.remove(activeClass))
      shellElement.style.backgroundImage = `url(${items[itemdoms.length - 1].thumbnail})`
      itemdoms[itemdoms.length - 1].classList.add(activeClass)
    } else if (pos <= max - 10 && pos >= min) {
      // Set current item as active
      shellElement.style.backgroundImage = `url(${items[i].thumbnail})`
      itemdoms.forEach((item) => item.classList.remove(activeClass))
      item.classList.add(activeClass)
    }
  })
}
import { getHistoryList } from "@/api/history"

const pageQuery = ref({
  page: 1,
  size: 10,
  historyTime: null,
  accuracy: null,
  "sortBy[create_time]": "DESC"
})
const total = ref(0) // 总条数
const items = reactive([
  // 添加更多项目
])


const fetchData = async () => {
  try {
    const response = await getHistoryList(pageQuery.value)
    if (response.success && response.code === "200") {
      total.value = response.data.total

      items.length = 0
      response.data.data.forEach(item => {
        items.push({
          id: item.id,
          title: "《" + item.title + "》",
          summary: item.summary,
          thumbnail: item.thumbnail,
          createTime: item.createTime.split(' ')[0],
          viewCount: item.viewCount.toString()
        })
      })

      // 等待DOM更新后再设置相关属性
      await nextTick(() => {
        shellElement = shellRef.value
        itemdoms = itemRefs.value
        itemdoms = Array.from(itemdoms)

        if (items.length > 0 && itemdoms.length > 0) {
          itemdoms[0].classList.add(activeClass)
          shellElement.style.backgroundImage = `url(${items[0].thumbnail})`
        }
      })
    }
  } catch (error) {
    console.error("获取历史列表失败:", error)
  }
}


const fetchHistoryList = async () => {
  const router = useRouter()

  if (router.currentRoute.value.path === "/archive") {
    type.value = "归档"
  } else {
    let { year, month } = router.currentRoute.value.params
    //判断一下，只存在年份，没有月份，就是按年份查询
    if (year && !month) {
      type.value = year 
      pageQuery.value.historyTime = year
      pageQuery.value.accuracy = "YEAR"
    } else {
      //mouth存在，加前导0
      if (month.length === 1) {
        month = "0" + month
      }
      type.value = year + "年" + month + "月"
      pageQuery.value.historyTime = year + "-" + month
      pageQuery.value.accuracy = "MONTH"
    }
  }
  fetchData()

  window.addEventListener("scroll", timelineScroll)
}

onMounted(() => {
  fetchHistoryList()
})

import { onUnmounted } from "vue"
onUnmounted(() => {
  window.removeEventListener("scroll", timelineScroll)
})
</script>

<style scoped>
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  color: #fff;
}

.shell {
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif !important;
  width: 100%;
  position: relative;
  padding-top: 80px;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
}

.shell:before {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(99, 99, 99, 0.5);
  content: "";
  z-index: 0;
}

.header {
  width: 100%;
  text-align: center;
  margin-bottom: 80px;
  position: relative;

  & p {
    margin-top: 20px;
    padding-left: 200px;
    color: #fff;
  }
}

.title {
  color: #fff;
  font-size: 46px;
  font-weight: normal;
  margin: 0;
}

.timeline {
  display: flex;
  margin: 0 auto;
  flex-wrap: wrap;
  flex-direction: column;
  max-width: 850px;
  position: relative;
}

.content-title {
  font-weight: normal;
  font-size: 66px;
  margin: -10px 0 0 0;
  transition: 0.4s;
  padding: 0 10px;
  box-sizing: border-box;
  color: #fff;
}

.content-desc {
  margin: 0;
  font-size: 15px;
  box-sizing: border-box;
  color: rgba(255, 255, 255, 0.7);
  line-height: 25px;
  text-align: center;
}

.timeline:before {
  position: absolute;
  left: 50%;
  width: 2px;
  height: 100%;
  margin-left: -1px;
  content: "";
  background: rgba(255, 255, 255, 0.07);
}

.item {
  padding: 40px 0;
  opacity: 0.3;
  filter: blur(2px);
  transition: 0.5s;
  box-sizing: border-box;
  width: calc(50% - 40px);
  display: flex;
  position: relative;
  transform: translateY(-80px);
}

/* 这是每一个文章的标题样式  */
.item:before {
  /* 设置在伪元素before中的内容  */
  content: attr(data-text);
  letter-spacing: 3px;
  width: 100%;
  position: absolute;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  border-left: 2px solid rgba(255, 255, 255, 0.9);
  top: 70%;
  margin-top: -50px;
  padding-left: 15px;
  opacity: 0;
  right: calc(-100% - 56px);
  font: 900 20px "";
  letter-spacing: 5px;
}

.item:nth-child(even) {
  align-self: flex-end;
}

.item:nth-child(even):before {
  right: auto;
  text-align: right;
  left: calc(-100% - 56px);
  padding-left: 0;
  border-left: none;
  border-right: 2px solid rgba(255, 255, 255, 0.5);
  padding-right: 15px;
}

.item--active {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0px);
  /* 模糊 */
}

.item--active:before {
  top: 50%;
  transition: 0.3s all 0.2s;
  opacity: 1;
}

.item--active .content-title {
  margin: -50px 0 20px 0;
}

.img {
  max-width: 100%;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.4);
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  letter-spacing: 5px;
  margin: 10px 0 0 0;
  font-weight: normal;
}



@media only screen and (max-width: 767px) {
  .item {
    align-self: baseline !important;
    width: 100%;
    padding: 0 30px 150px 80px;
  }

  .item:before {
    left: 10px !important;
    padding: 0 !important;
    top: 50px;
    text-align: center !important;
    width: 60px;
    border: none !important;
  }

  .item:last-child {
    padding-bottom: 40px;
  }

  .timeline:before {
    left: 40px;
  }
}
</style>
