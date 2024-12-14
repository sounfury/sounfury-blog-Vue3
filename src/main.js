//基础设置
import { createApp } from "vue"
import { createPinia } from "pinia"
import router from "./router/index"
import LoadScript from "vue-plugin-load-script"
import directive from './directive' // directive
//图标
import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { fab } from "@fortawesome/free-brands-svg-icons"
import { fas } from "@fortawesome/free-solid-svg-icons"
//组件库
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import "highlight.js/lib/common"
//代码高亮

import hljs from "highlight.js"
// 有多种样式可选，也可以到对应文件中定制化
import "highlight.js/styles/atom-one-dark.css"

import CopyButtonPlugin from "highlightjs-copy"
import "highlightjs-copy/styles/highlightjs-copy.css"
hljs.addPlugin(new CopyButtonPlugin())

import App from "./App.vue"

import "./assets/main.scss"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import "./permission" 


library.add(fas, fab)

const app = createApp(App)
directive(app)
app.use(router)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(LoadScript)

app.directive("highlight", {
  updated(el, binding) {
    // 在组件更新时，也更新代码块

    const targets = el.querySelectorAll("code")
    targets.forEach((target) => {
      console.log(target)
      hljs.initLineNumbersOnLoad()
    })
  },
})

app.use(ElementPlus)

app.component("font-awesome-icon", FontAwesomeIcon)

app.mount("#app")
