import markdownItAnchor from "markdown-it-anchor"
import markdownItTocDoneRight from "markdown-it-toc-done-right"
import hljs from "highlight.js"
import MarkdownIt from "markdown-it"
import CopyButtonPlugin from "highlightjs-copy"

export function copyCode() {
  const copy = document.querySelectorAll(".copy")
  copy.forEach((item) => {
    item.addEventListener("click", () => {
      const text = item.previousElementSibling.innerText
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)

      const successMessage = document.createElement("div")
      successMessage.classList.add("copy-success")
      successMessage.textContent = "复制成功"
      item.parentElement.appendChild(successMessage)

      // 在一定时间后移除提示元素
      setTimeout(() => {
        item.parentElement.removeChild(successMessage)
      }, 2000) // 2秒后移除
    })
  })
}

export function MdToHtml(content, doc_dom) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      hljs.addPlugin(new CopyButtonPlugin())
      // 此处判断是否有添加代码语言
      if (lang && hljs.getLanguage(lang)) {
        try {
          // 得到经过highlight.js之后的html代码
          const preCode = hljs.highlight(lang, str).value
          // 以换行进行分割npm create vue@latest
          const lines = preCode.split(/\n/).slice(0, -1)
          // 添加自定义行号
          let html = lines
            .map((item, index) => {
              return (
                '<li><span class="line-num" data-line="' +
                (index + 1) +
                '"></span>' +
                item +
                "</li>"
              )
            })
            .join("")
          html = "<ol>" + html + "</ol>"
          // 添加代码语言

          return (
            '<pre class="hljs">' +
            '<div class="toolbar">' +
            '<span class="language">' +
            lang +
            "</span>" + // 语言标签
            "</div>" +
            "<code>" +
            html +
            '<button class="copy">复制</button>' +
            "</code>" + // 复制按钮放在 <code> 标签内部
            "</pre>"
          )
        } catch (__) {}
      }
      // 未添加代码语言，此处与上面同理
      const preCode = md.utils.escapeHtml(str)
      const lines = preCode.split(/\n/).slice(0, -1)
      let html = lines
        .map((item, index) => {
          return (
            '<li><span class="line-num" data-line="' +
            (index + 1) +
            '"></span>' +
            item +
            "</li>"
          )
        })
        .join("")
      html = "<ol>" + html + "</ol>"

      return (
        '<pre class="hljs">' +
        '<div class="toolbar">' +
        '<span class="language">' +
        lang +
        "</span>" + // 语言标签
        "</div>" +
        "<code>" +
        html +
        '<button class="copy">复制</button>' +
        "</code>" + // 复制按钮放在 <code> 标签内部
        "</pre>"
      )
    },
  })
    .use(markdownItAnchor, {
      permalink: false, //是否在标题旁边添加永久链接
      permalinkBefore: false, //将永久链接放在标题前面
      permalinkSymbol: "#",
    })
    .use(markdownItTocDoneRight, {
      maxDepth: 2,
      level: [1, 2],// 生成目录的层级
      listType: "ul",
      containerClass: "toc",
      containerId: "toc",
      listClass: "listClass",
      itemClass: "itemClass",
      linkClass: "linkClass",
      callback: function (html) {
        if (doc_dom) {
          doc_dom.innerHTML = html
        }
      },
    })

  return md.render(content)
}
