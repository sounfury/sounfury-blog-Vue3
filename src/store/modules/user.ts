import { login, logout, getInfo } from "@/api/login"
import { getToken, setToken, removeToken } from "@/utils/auth"
import defAva from "@/assets/images/profile.jpg"
import { defineStore } from "pinia"

export interface LoginForm {
  username: string
  password: string
  // code: string
  // uuid: string
}

const useUserStore = defineStore("user", {
  state: () => ({
    token: getToken(),
    name: "",
    avatar: "",
    roles: Array(),
    permissions: [],
  }),
  actions: {
    // 登录
    login(userInfo: LoginForm) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      // const code = userInfo.code
      // const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password)
          .then((res: any) => {
            console.log(res)
            setToken(res.data.token)
            this.token = res.data.token
            resolve(null)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res: any) => {
            res = res.data
            const user = res.loginUser
            // @ts-ignore
            const avatar =
              user.avatar == "" || user.avatar == null ? defAva : user.avatar

            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              console.log(res.roles);
              
              this.roles = res.roles
              console.log(this.roles);
              
              this.permissions = res.permissions
            } else {
              this.roles = ["ROLE_DEFAULT"]
            }
            this.name = user.username
            this.avatar = avatar
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            this.token = ""
            this.roles = []
            this.permissions = []
            removeToken()
            resolve(null)
            location.reload()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
  },
  
})

export default useUserStore
