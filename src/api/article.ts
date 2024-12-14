import request from "@/utils/request"
const portalRouter = "/portal/article"
const adminRouter = "/admin/article"
export type RequestPageType<T> = T & {
  page: number
  size: number
  params: { [key: string]: string }
}

/**
 * 前台单个文章详情
 * @param {*} id
 * @returns
 */
export function getArticle(id:number) {
  return request({
    url: portalRouter +"/"+ id,
    method: "get",
  })
}
/**
 * 前台文章列表
 * @param params 
 * @returns 
 */
export function getArticleList(params: RequestPageType<{}>) {
  //检测params是否有page和size属性
  if (!params.page || !params.size) {
    throw new Error("page or size is required")
  }
  return request({
    url: portalRouter+"/page",
    method: "get",
    params,
  })
}


/////////////////////////后台管理/////////////////////////


/**
 * 新增文章
 */
export function addArticle(data: any) {
  return request({
    url: adminRouter,
    method: "post",
    data,
  })
}
/**
 * 更新文章
 */
export function updateArticle(data: any) {
  return request({
    url: adminRouter,
    method: "put",
    data,
  })
}


/**
 * 删除文章
 * @param id 
 * @returns 
 */
export function deleteArticle(id: number) {
  return request({
    url: adminRouter +"/"+ id,
    method: "delete",
  })
}

/**
 * 分页查询后台文章
 */
export function getArticlePage(params: RequestPageType<{}>) {
  //检测params是否有page和size属性
  if (!params.page || !params.size) {
    throw new Error("page or size is required")
  }
  return request({
    url: adminRouter+"/page",
    method: "get",
    params,
  })
}

/**
 * 后台文章详情
 * @param id 
 * @returns 
 */
export function getArticleDetail(id: number) {
  return request({
    url: adminRouter +"/"+ id,
    method: "get",
  })
}







