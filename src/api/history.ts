import request from "@/utils/request"

const articleRouter = "/portal/article/"

// 定义分页类型，其中 params 是包含查询条件的键值对
export type RequestPageType<T> = T & {
  page: number
  size: number
  historyTime: string
  accuracy: string
}

// 日期格式验证函数
function validateDateFormat(date: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/ // 匹配 yyyy-MM 格式
  const regexYear = /^\d{4}$/ // 匹配 yyyy 格式
  //要么符合格式，要么不传
  return regex.test(date) || regexYear.test(date) || !date
}

// 获取历史文章列表方法
export function getHistoryList(params: RequestPageType<{}>) {
  // 检查 page 和 size 是否存在
  if (!params.page || !params.size) {
    throw new Error("page or size is required")
  }

  // 检查 params.params 是否包含 yyyy-MM 格式的日期
  const date = params?.historyTime
  if (!validateDateFormat(date)) {
    throw new Error(
      "传入的日期格式不正确，正确格式为 yyyy-MM 或 yyyy，例如 2021-01 或 2021,你传入的是：" +date
    )
  }

  return request({
    url: articleRouter + "history",
    method: "get",
    params,
  })
}



export function getHistoryCount() {
  return request({
    url: articleRouter + "history/count",
    method: "get",
  })
}