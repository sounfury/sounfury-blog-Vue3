<template>
  <div class="article_page ">
    <article-header v-bind="data" />
    <div class="w-[95%] m-auto">
      <div class="flex justify-center gap-12 p-8" :class="{'article-no-toc': !hasToc}">
        <card class="mark_body article" :class="{'w-[70%]': hasToc, 'w-[85%]': !hasToc}">
          <div ref="articleContent" v-html="result"></div>
        </card>
        <div class="aside_content" v-show="hasToc">
          <Card class="doc_card">
            <div class="headline">
              <font-awesome-icon :icon="['fas', 'bars']" />
              <span>目录</span>
            </div>
            <div class="doc" ref="docContainer"></div>
          </Card>
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
  tags: [], // 用于存储标签
})

const docContainer = ref(null); // 用于获取 .doc 容器
const articleContent = ref(null); // 用于获取 .article 内容容器
const hasToc = ref(false); // 用于判断是否有目录


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

function renderMarkdownAndCheckToc() {
  if (!content.value) return;
  
  // 先渲染Markdown内容
  result.value = MdToHtml(content.value, docContainer.value);
  
  // 在内容渲染后检查目录是否有内容
  nextTick(() => {
    const tocElement = docContainer.value?.querySelector('nav.toc');
    hasToc.value = tocElement && tocElement.children.length > 0;
    
    copyCode();
    if (hasToc.value) {
      initIntersectionObserver();
    }
  });
}

onMounted(async () => {
  const id = router.currentRoute.value.params.id;
  await fetchArticle(id);
  nextTick(renderMarkdownAndCheckToc);
})


const initIntersectionObserver = () => {
  // 如果没有目录容器，直接返回
  if (!docContainer.value) return;
  
  const headings = articleContent.value.querySelectorAll('h1[id], h2[id]'); // 只获取 h1 和 h2
  const tocLinks = docContainer.value.querySelectorAll('nav.toc a.linkClass');

  if (!headings.length || !tocLinks.length) {
    return;
  }

  // 记录当前激活的标题ID
  let currentActiveId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const heading = entry.target;
        const headingId = heading.getAttribute('id');
        const isH2 = heading.tagName === 'H2';
        const isH1 = heading.tagName === 'H1';

        if (entry.isIntersecting) {
          let shouldUpdateActive = false;

          // 如果是 H2，直接设置为活动标题
          if (isH2) {
            if (currentActiveId !== headingId) {
              shouldUpdateActive = true;
            }
          }
          // 如果是 H1，只有当前没有活动的 H2 时才设置
          else if (isH1) {
            // 检查是否有可见的 H2
            const visibleH2s = Array.from(headings).filter(h => {
              if (h.tagName !== 'H2') return false;
              const rect = h.getBoundingClientRect();
              return rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0;
            });

            // 如果没有可见的 H2，并且当前活动ID不是这个 H1
            if (visibleH2s.length === 0 && currentActiveId !== headingId) {
              shouldUpdateActive = true;
            }
          }

          // 只在需要更新时才更新高亮
          if (shouldUpdateActive) {
            currentActiveId = headingId;
            updateTocLinks(currentActiveId, tocLinks);
          }
        }
        // 当标题离开视图时的处理
        else if (headingId === currentActiveId) {
          // 找到所有当前可见的标题
          const visibleHeadings = Array.from(headings).filter(h => {
            const rect = h.getBoundingClientRect();
            return rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0;
          });

          if (visibleHeadings.length > 0) {
            // 优先选择可见的 H2，如果没有则选择 H1
            const visibleH2 = visibleHeadings.find(h => h.tagName === 'H2');
            const newActiveId = visibleH2 ?
              visibleH2.getAttribute('id') :
              visibleHeadings[0].getAttribute('id');

            if (currentActiveId !== newActiveId) {
              currentActiveId = newActiveId;
              updateTocLinks(currentActiveId, tocLinks);
            }
          }
        }
      });
    },
    {
      rootMargin: '0px 0px -80% 0px',
      threshold: 0
    }
  );

  headings.forEach(heading => {
    observer.observe(heading);
  });
};

const updateTocLinks = (activeId, tocLinks) => {
  // 如果没有目录链接，直接返回
  if (!tocLinks || !tocLinks.length) return;
  
  tocLinks.forEach(link => {
    const linkHref = link.getAttribute('href').substring(1);
    const listItem = link.closest('.itemClass');

    if (linkHref === activeId) {
      listItem.classList.add('active-toc-item');
    } else {
      listItem.classList.remove('active-toc-item');
    }
  });
};

watch(
  () => data.value.content,
  (newContent) => {
    if (newContent) {
      content.value = newContent;
      renderMarkdownAndCheckToc();
    }
  }
)
</script>



<style scoped>
.mark_body {
  padding: 50px 40px;
}

.article-no-toc {
  justify-content: center;
}
</style>



<style lang="scss" scoped>
@import "@/assets/styles/markdown/index"
</style>
