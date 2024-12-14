import request from "@/utils/request"
const portalRouter = "/portal/category"
const articleRouter = "/portal/article"
const adminRouter = "/admin/category"

export type RequestPageType<T> = T & {
  page: number
  size: number
  params: { [key: string]: string }
}

export function getAllCategory() {
  return request({
    url: portalRouter+"/all",
    method: "get",
  })
}

export function getCategoryById(pageQury: RequestPageType<{}>) {
  return request({
    url: articleRouter + "/category/page",
    method: "get",
    params: pageQury,
  })
}

//更新分类
export function updateCategory(data: any) {
  return request({
    url: adminRouter ,
    method: "put",
    data,
  })
}

//更新分类排序
export function updateCategorySort(data: any) {
  return request({
    url: adminRouter + "/sort",
    method: "put",
    data,
  })
}

//删除分类
export function deleteCategoryById(id: number) {
  return request({
    url: adminRouter +"/"+ id,
    method: "delete",
  })
}

//添加分类
export function addCategory(data: any) {
  return request({
    url: adminRouter,
    method: "post",
    data,
  })
}

//获取分类字典
export function getCategoryDict() {
  return request({
    url: adminRouter + "/dict",
    method: "get",
  })
}
