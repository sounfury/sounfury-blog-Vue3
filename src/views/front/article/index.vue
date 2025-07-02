<template>
  <div class="article_page ">
    <article-header v-bind="data" />
    <div class="w-full lg:w-[95%] lg:m-auto">
      <div class="flex flex-col lg:flex-row gap-0 lg:gap-12 p-0 lg:p-8 flex-1" :class="{'lg:justify-center': !hasToc, 'lg:justify-center': hasToc}">
        <card class="mark_body article w-full order-2 lg:order-1" :class="{'lg:w-[70%]': hasToc, 'lg:w-[85%]': !hasToc}">
          <div ref="articleContent" v-html="result"></div>
        </card>

        <!-- 桌面端目录 -->
        <div v-show="hasToc" class="aside_content hidden lg:block order-1 lg:order-2">
          <Card class="doc_card">
            <div class="headline">
              <font-awesome-icon :icon="['fas', 'bars']" />
              <span>目录</span>
            </div>
            <div class="doc" ref="docContainer"></div>
          </Card>
        </div>

        <!-- 移动端浮动目录按钮 -->
        <div v-show="hasToc" class="mobile-toc-container lg:hidden">
          <button class="mobile-toc-btn" @click="toggleMobileToc" :class="{ active: isMobileTocOpen }">
            <font-awesome-icon :icon="['fas', 'bars']" />
          </button>
          <div class="mobile-toc-panel" :class="{ open: isMobileTocOpen }">
            <div class="mobile-toc-header">
              <span>目录</span>
              <button @click="toggleMobileToc">
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
            <div class="doc mobile-doc" ref="mobileDocContainer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from "vue"
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
  tags: [],
})

const docContainer = ref(null)
const mobileDocContainer = ref(null)
const articleContent = ref(null)
const isMobileTocOpen = ref(false)
const hasToc = ref(false)


/**
 * 获取文章数据并处理时间格式
 */
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

/**
 * 更新文章元数据信息
 */
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

/**
 * 切换移动端目录显示状态
 */
const toggleMobileToc = () => {
  isMobileTocOpen.value = !isMobileTocOpen.value
}


/**
 * 渲染Markdown内容并检查目录
 */
function renderMarkdownAndCheckToc() {
  if (!content.value) return

  // 先渲染Markdown内容
  result.value = MdToHtml(content.value, docContainer.value)

  // 渲染移动端目录
  if (mobileDocContainer.value) {
    MdToHtml(content.value, mobileDocContainer.value)
  }

  // 在内容渲染后检查目录是否有内容
  nextTick(() => {
    const tocElement = docContainer.value?.querySelector('nav.toc')
    hasToc.value = tocElement && tocElement.children.length > 0

    copyCode()
    if (hasToc.value) {
      initIntersectionObserver()
    }
  })
}

onMounted(async () => {
  const id = router.currentRoute.value.params.id
  await fetchArticle(id)
  nextTick(renderMarkdownAndCheckToc)
})


/**
 * 初始化目录滚动监听器
 */
const initIntersectionObserver = () => {
  if (!docContainer.value) return

  const headings = articleContent.value.querySelectorAll('h1[id], h2[id]')
  const tocLinks = docContainer.value.querySelectorAll('.doc nav.toc a.linkClass')

  if (!headings.length || !tocLinks.length) {
    return
  }

  let currentActiveId = null

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const heading = entry.target
        const headingId = heading.getAttribute('id')
        const isH2 = heading.tagName === 'H2'
        const isH1 = heading.tagName === 'H1'

        if (entry.isIntersecting) {
          let shouldUpdateActive = false

          if (isH2) {
            if (currentActiveId !== headingId) {
              shouldUpdateActive = true
            }
          }
          else if (isH1) {
            const visibleH2s = Array.from(headings).filter(h => {
              if (h.tagName !== 'H2') return false
              const rect = h.getBoundingClientRect()
              return rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0
            })

            if (visibleH2s.length === 0 && currentActiveId !== headingId) {
              shouldUpdateActive = true
            }
          }

          if (shouldUpdateActive) {
            currentActiveId = headingId
            updateTocLinks(currentActiveId, tocLinks)
          }
        }
        else if (headingId === currentActiveId) {
          const visibleHeadings = Array.from(headings).filter(h => {
            const rect = h.getBoundingClientRect()
            return rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0
          })

          if (visibleHeadings.length > 0) {
            const visibleH2 = visibleHeadings.find(h => h.tagName === 'H2')
            const newActiveId = visibleH2 ?
              visibleH2.getAttribute('id') :
              visibleHeadings[0].getAttribute('id')

            if (currentActiveId !== newActiveId) {
              currentActiveId = newActiveId
              updateTocLinks(currentActiveId, tocLinks)
            }
          }
        }
      })
    },
    {
      rootMargin: '0px 0px -80% 0px',
      threshold: 0
    }
  )

  headings.forEach(heading => {
    observer.observe(heading)
  })
}

/**
 * 更新目录链接的激活状态
 */
const updateTocLinks = (activeId, tocLinks) => {
  if (!tocLinks || !tocLinks.length) return

  tocLinks.forEach(link => {
    const linkHref = link.getAttribute('href').substring(1)
    const listItem = link.closest('.itemClass')

    if (linkHref === activeId) {
      listItem.classList.add('active-toc-item')
    } else {
      listItem.classList.remove('active-toc-item')
    }
  })
}

watch(
  () => data.value.content,
  (newContent) => {
    if (newContent) {
      content.value = newContent
      renderMarkdownAndCheckToc()
    }
  }
)
</script>



<style  scoped lang="scss">

@use "@/assets/styles/markdown/index" as styles;

:deep() {
  @include styles.article-stycles;

  @include styles.pc-toc-styles;

  @include styles.mobile-article-styles;

  @include styles.mobile-toc-styles;
}




</style>