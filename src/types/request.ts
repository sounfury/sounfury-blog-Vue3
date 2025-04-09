import { AxiosInstance, AxiosPromise, Method } from 'axios'

export type RequestConfig = {
    /** 请求地址 */
    url: string,
    /** get请求映射params参数 */
    method: Method,
    /** 请求数据 */
    data?: any,
    /** get请求映射params参数 */
    params?: any,
    headers?: {
        /** 是否需要防止数据重复提交 */
        isRepeatSubmit?: boolean,
        /** 是否需要设置 token */
        isToken?: boolean,
    }
}

export type RequestPageType<T> = T & {
    page: number
    size: number
    sortBy?: Record<string, 'ASC' | 'DESC'> // 增加 sortBy 字段
  }

export interface RequestInstance extends AxiosInstance {
    (config: RequestConfig): AxiosPromise
}
