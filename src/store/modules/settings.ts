import { defineStore } from "pinia"
import cache from "@/plugins/cache" // 引入缓存工具

const SETTINGS_CACHE_KEY = 'app:settings'
const SETTINGS_TIMESTAMP_KEY = 'app:settings:timestamp' // 添加时间戳缓存key
const SETTINGS_INIT_KEY = 'app:settings:initialized' // 添加初始化状态缓存key
const CACHE_DURATION = 1000 * 60 * 60 * 24 // 缓存时间，这里设置24小时

export type SettingKey =
  | "site_status"
  | "comment_mode"
  | "site_description"
  | "site_notice"
  | "site_icon"

export type Setting = {
  key: SettingKey
  value: string
}

export const defaultSettings: Record<SettingKey, string> = {
  site_status: "running",
  comment_mode: "approval",
  site_description: "欢迎访问我的博客！",
  site_notice: "欢迎访问我的博客！",
  site_icon: "/favicon.ico",
}



import { getAllSettings } from "@/api/setting"

const useSettings = defineStore("settings", {
  state: () => ({
    // 优先从缓存读取,没有则使用默认值
    settings:
      cache.local.getJSON(SETTINGS_CACHE_KEY) ||
      ({ ...defaultSettings } as Record<SettingKey, string>),
    isInitialized: cache.local.get(SETTINGS_INIT_KEY) === "true",
  }),

  actions: {
    updateSetting(key: SettingKey, value: string) {
      this.settings[key] = value
      this.updateCache()
    },

    // 更新缓存和时间戳
    updateCache() {
      cache.local.setJSON(SETTINGS_CACHE_KEY, this.settings)
      cache.local.set(SETTINGS_TIMESTAMP_KEY, Date.now().toString())
      cache.local.set(SETTINGS_INIT_KEY, "true") // 缓存初始化状态
    },

    // 检查缓存是否有效
    isCacheValid() {
      const timestamp = Number(cache.local.get(SETTINGS_TIMESTAMP_KEY))
      return timestamp && Date.now() - timestamp < CACHE_DURATION
    },

    async getSettings() {
      // 如果已经初始化过且缓存未过期，直接返回
      console.log(this.isInitialized, this.isCacheValid())

      if (this.isInitialized && this.isCacheValid()) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve, reject) => {
        getAllSettings()
          .then((res) => {
            for (const key in res.data) {
              if (res?.data.hasOwnProperty(key)) {
                this.settings[key as SettingKey] = res.data[key]
              }
            }
            this.isInitialized = true
            this.updateCache()
            resolve()
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
      })
    },

    clearCache() {
      cache.local.remove(SETTINGS_CACHE_KEY)
      cache.local.remove(SETTINGS_TIMESTAMP_KEY)
      cache.local.remove(SETTINGS_INIT_KEY) // 清除初始化状态缓存
      this.settings = { ...defaultSettings }
      this.isInitialized = false
    },

    initIcon(icon: string = this.settings.site_icon) {
      // 使用默认配置中的 site_icon，如果没有传入具体的 icon
      const faviconLink = document.querySelector(
        "link[rel~='icon']"
      ) as HTMLLinkElement
      if (faviconLink) {
        // 如果已存在 favicon 链接，更新其 href
        faviconLink.href = icon
      } else {
        // 如果不存在 favicon 链接，创建新的链接
        const link = document.createElement("link")
        link.rel = "icon"
        link.href = icon
        document.head.appendChild(link)
      }
    },
  },
})

export default useSettings
