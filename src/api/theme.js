const rootRoute = "/admin/theme"

import request from "@/utils/request"


export function getNowTheme() {
  return request({
    url: rootRoute,
    method: "get",
  })
}

////// 后台管理 //////

export function getThemeByKey(key) {
  return request({
    url: rootRoute + "/" + key,
    method: "get",
  })
}

export function getAllThemes() {
  return request({
    url: rootRoute + "/list",
    method: "get",
  })
}


export function updateTheme(data) {
  return request({
    url: rootRoute ,
    method: "put",
    data
  })
}

//删除主题
export function deleteTheme(key) {
  return request({
    url: rootRoute + "/" + key,
    method: "delete",
  })
}

//添加主题
export function addTheme(data) {
  return request({
    url: rootRoute,
    method: "post",
    data
  })
}