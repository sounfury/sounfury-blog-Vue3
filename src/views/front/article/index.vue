<template>
  <div class="article_page">
    <article-header v-bind="data" />
    <div class="flex justify-center gap-12 p-8">
      <card class="mark_body article w-3/4" v-html="result"> </card>
      <div class="aside_content">
        <Card class="doc_card">
          <div class="headline">
            <font-awesome-icon :icon="['fas', 'bars']" />
            <span>目录</span>
          </div>
          <div class="doc"></div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import Card from "@/components/card/BaseCard/card.vue"
import { MdToHtml, copyCode } from "@/utils/markdown.js"
import articleHeader from "./article-header.vue"
import { getArticle } from "@/api/article"

const router = useRouter()
const result = ref("")
const content = ref("")
const data = ref({})
const meta = reactive({
  createTime: "",
  updateTime: "",
  categoryName: "",
  viewCount: 0,
  comment: 0,
  count: 0,
  tags: [], // 用于存储标签
})

async function fetchArticle(id) {
  try {
    const res = await getArticle(id)
    data.value = res.data || {}
    if (data.value.createTime) {
      data.value.createTime = data.value.createTime.split("T")[0]
    }
    if (data.value.updateTime) {
      data.value.updateTime = data.value.updateTime.split("T")[0]
    } else {
      data.value.updateTime = data.value.createTime
    }
    content.value = data.value.content
    updateMeta()
  } catch (error) {
    console.error("获取文章失败", error)
  }
}

function updateMeta() {
  meta.createTime = data.value.createTime || "未知日期"
  meta.updateTime = data.value.updateTime || "未知日期"
  meta.categoryName = data.value.category?.name || "未分类"
  meta.viewCount = data.value.viewCount || 0
  meta.comment = data.value.comment || 0
  meta.count = data.value.content?.length || 0
  meta.tags = data.value.tags || []
  data.value.meta = meta
}

onMounted(() => {
  const id = router.currentRoute.value.params.id
  fetchArticle(id)
})

watch(
  () => data.value,
  (newData) => {
    if (newData.content) {
      result.value = MdToHtml(newData.content, document.querySelector(".doc"))
      copyCode()
    }
  }
)
</script>

<style scoped>
.mark_body {
  padding: 50px 40px;
}

:deep()pre {
  background-color: #282c34;
  color: #abb2bf;
  margin-bottom: 10px;
  position: relative;
  overflow-y: hidden;
  overflow-x: auto;
  max-width: 100%;
  word-wrap: break-word;
  box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.4);
}

:deep(code) {
  min-height: 70px;
  /* display: flex;
  align-items: center; */
  padding: 6px 12px;
}

:deep()pre code::before {
  content: " ";
  position: absolute;
  -webkit-border-radius: 50%;
  border-radius: 50%;
  background: #fc625d;
  width: 13px;
  height: 13px;
  left: 10px;
  top: 13px;
  -webkit-box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  z-index: 2;
}

.toolbar {
  width: 100%;
  height: 120px;
  background-color: #2454b5;
}

.doc {
  margin-top: 10px;
}

.doc_card {
  margin-top: 20px;
  padding: 20px 24px;
  position: sticky;
  z-index: 99999999;
  top: 20px;
}

.headline {
  color: var(--title-color);
  font-size: 1.5em;

  & :deep(span) {
    font-size: 1.25em;
    font-weight: 700;
    color: var(--title-color);
  }
}

:deep(.itemClass) {
  border-left: #8b8a8a 3px solid;
  padding: 0 20px;
  overflow: hidden;
}

:deep().linkClass {
  color: var(--font-color);
}

:deep().linkClass:hover {
  color: var(--font_light-color);
}

.article :deep(*) {
  line-height: 1.3;
}

.article :deep(img) {
  display: block;
  /* object-fit: cover; */
  max-height: 500px;
  max-width: 100%;
  height: auto;
  margin: 0 auto 20px;
}

.article :deep(p) {
  margin: 0 0 8px;
  color: var(--font-color);
  line-height: 1.5;
}

.article :deep(h1) {
  font-size: 2.5em;
  font-weight: 700;
  margin: 20px 0 14px;
  color: var(--title-color);
  position: relative;
}

.article :deep(h1)::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #ff7e5f, #feb47b);
}
.article :deep(h2),
:deep(h3) {
  font-size: 2em;
  font-weight: 700;
  margin: 20px 0 14px;
  color: var(--title-color);
}

:deep(blockquote) {
  margin: 0 0 20px;
  padding: 12px 15px;
  border-left: 3px solid #49b1f5;
  background-color: var(--blockquote-bg);
  color: var(--blockquote-color);
}

:deep(table) {
  display: table;
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  empty-cells: show;
  padding-bottom: 0;
}

:deep(.hljs-copy-button) {
  top: 0.3em;
}

:deep(table td, table th) {
  padding: 6px 12px;
  border: 1px solid var(--light-grey);
  vertical-align: middle;
}

.article :deep(ul) {
  padding-left: 40px;
}

.article :deep(ul li) {
  list-style-type: circle;
  color: var(--font-color);
}

.article :deep(ol) {
  padding-left: 40px;
}

.article :deep(code li) {
  padding-left: 20px;
}

.article :deep(ol li) {
  list-style-type: decimal;
}

.article :deep(li::marker) {
  color: #49b1f5;
  font-weight: 600;
  font-size: 1.05em;
}

.article :deep()code li::marker {
  color: var(--block-lineNum-color);
}

.article :deep(li:hover::marker) {
  color: rgb(255, 126, 83);
}

.article :deep(a) {
  color: #49b1f5;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: rgb(255, 126, 83);
    text-decoration: underline;
  }
}

:deep().copy {
  position: absolute;
  /* transform: translateX(calc(100% + 1.125em)); */
  right: 1em;
  width: 2rem;
  top: 0.4em;
  height: 2rem;
  text-indent: -9999px;
  /* Hide the inner text */
  color: #fff;
  border-radius: 0.25rem;
  border: 1px solid #ffffff22;
  background-color: rgb(28, 28, 28);
  background-image: url('data:image/svg+xml;utf-8,<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 5C5.73478 5 5.48043 5.10536 5.29289 5.29289C5.10536 5.48043 5 5.73478 5 6V20C5 20.2652 5.10536 20.5196 5.29289 20.7071C5.48043 20.8946 5.73478 21 6 21H18C18.2652 21 18.5196 20.8946 18.7071 20.7071C18.8946 20.5196 19 20.2652 19 20V6C19 5.73478 18.8946 5.48043 18.7071 5.29289C18.5196 5.10536 18.2652 5 18 5H16C15.4477 5 15 4.55228 15 4C15 3.44772 15.4477 3 16 3H18C18.7956 3 19.5587 3.31607 20.1213 3.87868C20.6839 4.44129 21 5.20435 21 6V20C21 20.7957 20.6839 21.5587 20.1213 22.1213C19.5587 22.6839 18.7957 23 18 23H6C5.20435 23 4.44129 22.6839 3.87868 22.1213C3.31607 21.5587 3 20.7957 3 20V6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3H8C8.55228 3 9 3.44772 9 4C9 4.55228 8.55228 5 8 5H6Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 3C7 1.89543 7.89543 1 9 1H15C16.1046 1 17 1.89543 17 3V5C17 6.10457 16.1046 7 15 7H9C7.89543 7 7 6.10457 7 5V3ZM15 3H9V5H15V3Z" fill="white"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  transition: background-color 200ms ease, transform 200ms ease-out;
}

:deep().copy:focus {
  background-color: #ffffff22;
  transform: scale(1.2);
  text-indent: 1px;
  background-image: none;
}

:deep().copy-success {
  position: absolute;
  top: 1.3em;
  right: calc(30px + 1em);
  /* 调整提示元素的位置，使其在按钮左侧 */
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: opacity 0.3s ease;
  z-index: 999;
  /* 确保提示元素在按钮上方显示 */
}

body {
  scroll-behavior: smooth;
}

/* for block of code */
</style>
