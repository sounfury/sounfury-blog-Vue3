import useUserStore from "./store/modules/user"
import router from "./router"
import { getToken } from "./utils/auth"

const SUPER_ADMIN = "ADMIN"

router.beforeEach(async (to, from, next) => {

  if (getToken() && useUserStore().roles.length === 0) {
    await useUserStore().getInfo()
  }


  const roles = useUserStore().roles

  if (to.meta.roles && to.meta.roles.length > 0) {
    // 检查是否有权限：要么角色在允许的角色列表中，要么是超级管理员
    const hasRequiredRole = to.meta.roles.some(
      (requiredRole) =>
        roles.includes(requiredRole) || roles.includes(SUPER_ADMIN)
    )

    if (hasRequiredRole) {
      next()
    } else {
      // 没有权限，跳转到401页面
      next("/401")
      return
    }
  }

  // 对于不需要特殊权限的路由，直接放行
  next()
})
