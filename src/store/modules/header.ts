import { defineStore } from "pinia"
import { ref } from "vue"
//存储两个ref，一个是title,一个是thumbnail
const useHeader = defineStore("header", {
  state: () => ({
    title: "123", // 直接赋值，Pinia 会自动处理响应式
    thumbnail: "",
    height:"400px"
  }),
  actions: {
    //更新title
    updateTitle(title: string) {
      this.title = title
    },
    //更新thumbnail
    updateThumbnail(thumbnail: string) {
      this.thumbnail = thumbnail
    },
    //更新height
    updateHeight(height: string) {
      this.height = height
    },
  },
})

export default useHeader