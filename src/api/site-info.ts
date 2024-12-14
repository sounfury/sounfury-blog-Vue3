import request from "@/utils/request"

const rootRoute = "/portal/site-info"

//获数量统计
export function getCountInfo() {
  return request({
    url: `${rootRoute}/count`,
    method: "get",
  })
}

export function getSiteInfo() {
  return request({
    url: `${rootRoute}/info`,
    method: "get",
  })
}
