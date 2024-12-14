import request from "@/utils/request"
export function getIp() {
  return request({
    url: "/system/ip",
    method: "get",
  })
}
