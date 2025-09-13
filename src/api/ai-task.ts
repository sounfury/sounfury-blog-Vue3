import request from "@/utils/request"

const aiTaskRouter = "/ai/action"

// ========================= 类型定义 =========================

/**
 * 统一响应包装类型
 */
export interface ApiResult<T> {
  code: string // 返回码
  message: string // 返回消息
  data: T // 响应数据
  requestId: string // 请求ID
}

// ========================= 文章总结相关接口 =========================

/**
 * 总结指定文章（流式输出）
 * 返回一个可读流，用于处理 Server-Sent Events
 */
export const summarizeArticleStream = (articleId: number) => {
  return new Promise((resolve, reject) => {
    const baseURL = request.defaults?.baseURL || ''
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const url = `${baseURL}${aiTaskRouter}/summarize/article/${articleId}/stream`

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
        // 有些代理/浏览器缓存会捣乱，建议禁用缓存
        'Cache-Control': 'no-cache',
      },
      // 某些环境下有用：避免缓存/压缩造成粘包
      cache: 'no-store',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder() // 复用一个 decoder
      let buffer = ''                   // 事件缓冲区（字符串）

      const stream = {
        reader,
        decoder,
        async *[Symbol.asyncIterator]() {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                // 连接自然结束 => 流完成
                return
              }

              // 逐块解码，启用 stream:true 保证多字节字符不被截断
              buffer += decoder.decode(value, { stream: true })

              // 规范化换行（\r\n -> \n），再按 "\n\n" 拆成完整事件
              buffer = buffer.replace(/\r\n/g, '\n')

              let sepIndex
              while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
                const rawEvent = buffer.slice(0, sepIndex)
                buffer = buffer.slice(sepIndex + 2) // 去掉分隔空行

                // 解析单个事件帧
                const lines = rawEvent.split('\n')
                let eventName = 'message'
                let dataLines: string[] = []

                for (const line of lines) {
                  if (line.startsWith(':')) {
                    // 注释行，忽略
                    continue
                  }
                  if (line.startsWith('event:')) {
                    eventName = line.slice(6).trim()
                    continue
                  }
                  if (line.startsWith('data:')) {
                    // data: 后面可能有一个可选空格
                    let d = line.slice(5)
                    if (d.startsWith(' ')) d = d.slice(1)
                    dataLines.push(d)
                    continue
                  }
                  // 其他字段（id:、retry:）此处按需忽略
                }

                // 拼接多行 data （SSE 规范要求用 \n 连接）
                let dataPayload = dataLines.join('\n')

                // 常见结束语义：事件名为 done 或数据为 [DONE]
                if (eventName === 'done' || dataPayload === '[DONE]') {
                  return
                }

                // 把完整 payload 产出
                // 注意：payload 可能为空字符串（例如只是换行），也要交给上层决定是否渲染
                // 这里不做 trim，保留原样
                yield dataPayload
              }
            }
          } finally {
            try { reader.releaseLock() } catch {}
          }
        },
        cancel() {
          return reader.cancel()
        }
      }

      resolve(stream)
    })
    .catch(error => {
      reject(error)
    })
  })
}
