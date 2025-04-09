import { defineStore } from "pinia"
import { getAllThemes, getNowTheme } from "@/api/theme"
import useSettings from "./settings"

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
        // 设置根元素的 data-theme 属性
        document.documentElement.setAttribute(
          "data-theme",
          mode === 0 ? "light" : "dark"
        )

        // 动态设置 --image-url
        const imageUrl =
          mode === 0
            ? this.themeSettings.HeroImageDay
            : this.themeSettings.HeroImageNight

        document.documentElement.style.setProperty(
          "--image-url",
          imageUrl ? `url(${imageUrl})` : "null"
        )
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
