import request from "@/utils/request"
const portalRouter = "/portal/tag"
const articleRouter = "/portal/article"
const adminRouter = "/admin/tag"
export type RequestPageType<T> = T & {
  page: number
  size: number
  params: { [key: string]: string }
}

export function getAllTags() {
  return request({
    url: portalRouter + "/all",
    method: "get",
  })
}



export function getTagsById(pageQury: RequestPageType<{ id: string }>) {
  return request({
    url: articleRouter+"/tag/page",
    method: "get",
    params: pageQury
  })
}

//获得标签字典
export function getTagsDict() {
  return request({
    url: adminRouter + "/dict",
    method: "get",
  })
}