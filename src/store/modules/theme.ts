import { defineStore } from "pinia"
import { getAllThemes, getNowTheme } from "@/api/theme"
import useSettings from "./settings"

// 预加载并缓存主题背景图，避免切换时闪烁
const loadedImageCache = new Set<string>()
const preloadImage = (url?: string | null): void => {
  if (!url) return
  if (loadedImageCache.has(url)) return
  const img = new Image()
  img.src = url
  img.onload = () => {
    loadedImageCache.add(url)
  }
}

export type ThemeData = {
  themeId: number
  themeKey: string
  themeName: string
  settings: {
    fontFamily: string
    HeroImageDay: string
    HeroImageNight: string
    //打字机第一行内容
    TypingEffectFirstLine: string
    //打字机第二行内容
    TypingEffectSecondLine: string
  }
  description: string
  mode: number
}

const useTheme = defineStore("theme", {
  state: () => ({
    themeName: "经典",
    themeKey: "default",
    themeId: null,
    themeSettings: null as ThemeData["settings"] | null,
    description: "",
    currentMode: 0, // 0 表示日间模式，1 表示夜间模式
  }),
  actions: {
    async getNowTheme() {
      try {
        const res = await getNowTheme()
        const { data } = res

        // 更新主题信息
        this.themeId = data.themeId
        this.themeKey = data.themeKey
        this.themeName = data.themeName
        this.themeSettings = data.settings
        this.description = data.description

        // 提前预加载日/夜两张图，减少首切换白闪
        preloadImage(this.themeSettings?.HeroImageDay)
        preloadImage(this.themeSettings?.HeroImageNight)

        // 设置主题
        this.setTheme(this.currentMode)
      } catch (error) {
        console.error("更新主题时出错:", error)
      }
    },

    setTheme(mode: number) {
      // 更新模式
      this.currentMode = mode

      // 根据模式设置主题属性
      if (this.themeSettings) {
        // 先准备图片与变量，再切换 data-theme，避免瞬时空值导致闪烁
        const imageUrl =
          mode === 0
            ? this.themeSettings.HeroImageDay
            : this.themeSettings.HeroImageNight

        // 提前预加载目标图片
        preloadImage(imageUrl)

        // 提取旧图用于过渡
        const prev = getComputedStyle(document.documentElement).getPropertyValue("--image-url").trim()
        if (prev) {
          document.documentElement.style.setProperty("--prev-image-url", prev)
        }

        // 先设置 CSS 变量（保持上一张图存在，或直接切到目标图）
        document.documentElement.style.setProperty(
          "--image-url",
          imageUrl ? `url(${imageUrl})` : "null"
        )

        // 添加过渡类以驱动淡出
        document.documentElement.classList.add("theme-image-transition")

        // 再设置 data-theme，触发其它主题变量变化
        document.documentElement.setAttribute(
          "data-theme",
          mode === 0 ? "light" : "dark"
        )

        // 等待CSS过渡完成后移除过渡类（0.3s + 小缓冲）
        setTimeout(() => {
          document.documentElement.classList.remove("theme-image-transition")
        }, 350)
      }
    },

    // 切换主题模式
    toggleThemeMode() {
      const newMode = this.currentMode === 0 ? 1 : 0
      this.setTheme(newMode)
    },
  },
  persist:{
    key: "theme-currentCode",
    storage: localStorage,
    pick:["currentMode"]

  }
})

export default useTheme
