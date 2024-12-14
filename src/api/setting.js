const rootRouter = "/system/config"
const ossRouter = "/oss/config"
import request from "@/utils/request"
/**
 *
 * @returns 获取配置键值对
 */
export function getAllSettings() {
  return request({
    url: rootRouter + "/all",
    method: "get",
  })
}

/* 后管 */

/**
 * 获取系统配置列表
 */
export function getSettingList(params) {
  return request({
    url: rootRouter + "/list",
    method: "get",
    params,
  })
}

/**
 * 修改系统配置
 */
export function updateSetting(data) {
  return request({
    url: rootRouter+"/batch",
    method: "put",
    data,
  })
}

/**
 * 获取oss配置
 */
export function getOssSetting() {
  return request({
    url: ossRouter,
    method: "get",
  })
}

/**
 * 修改oss配置
 */
export function updateOssSetting(data) {
  return request({
    url: ossRouter,
    method: "put",
    data,
  })
}
