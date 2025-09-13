import request from "@/utils/request"

const aiTalkRouter = "/ai"

// ========================= 类型定义 =========================

/**
 * 会话开始请求
 */
export interface SessionStartRequest {
  characterId: string
  mode?: string // conversation/agent，默认 conversation
  isOwner?: boolean // 是否为站长用户，默认 false
}

/**
 * 会话开始响应
 */
export interface SessionStartResponse {
  greeting: string // 开场白
  sessionId: string // 会话ID
  characterId: string // 角色ID
  mode: string // 聊天模式
  success: boolean // 是否成功
  errorMessage?: string // 错误信息（如果失败）
}

/**
 * 聊天请求
 */
export interface ChatRequest {
  message: string // 用户消息内容
  sessionId: string // 会话ID
  userName?: string // 用户名称，默认"旅行者"
  characterId?: string // 角色ID，默认"bartender"
  isOwner?: boolean // 是否为站长用户，默认 false
  enableAgent?: boolean // 是否启用智能体模式，默认 false
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  reply: string // AI回复内容
  sessionId: string // 会话ID
  characterId: string // 角色ID
  mode: string // 聊天模式
  strategyName: string // 策略名称
  success: boolean // 是否成功
  errorMessage?: string // 错误信息（如果失败）
}

/**
 * 角色列表项
 */
export interface PersonaItem {
  personaId: string // 角色ID
  name: string // 角色名称
  description: string // 角色描述
  enabled: boolean // 是否启用
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  cardCover: string // 角色卡片封面
}

/**
 * 角色分页响应
 */
export interface PersonaPageResponse {
  total: number // 总记录数
  personas: PersonaItem[] // 角色列表
}

/**
 * 会话信息
 */
export interface SessionInfo {
  sessionId: string
  characterId: string
  characterName: string // 角色名称
  mode: string
  isOwnerSession: boolean
  createdAt: string // 创建时间
  lastActiveAt: string // 最后活跃时间
  isArchived: boolean // 是否已归档
  toolsEnabled: boolean
  memoryEnabled: boolean
}

/**
 * 会话列表项
 */
export interface SessionItem {
  sessionId: string // 会话ID
  characterId: string // 角色ID
  characterName: string // 角色名称
  mode: string // 对话模式
  isOwnerSession: boolean // 是否为站长会话
  createdAt: string // 创建时间
  lastActiveAt: string // 最后活跃时间
  isArchived: boolean // 是否已归档
  lastMessageContent: string // 最后一条消息内容（预览用）
  messageCount: number // 消息总数
}

/**
 * 会话列表响应
 */
export interface SessionListResponse {
  sessions: SessionItem[] // Session列表
  total: number // 总数量
}

/**
 * 记忆项
 */
export interface MemoryItem {
  content: string // 内容
  type: string // 类型（USER/ASSISTANT/SYSTEM）
  timestamp: string // 时间戳（LocalDateTime格式，如：2024-01-01T10:30:00）
}

/**
 * 会话详情响应
 */
export interface SessionDetailResponse {
  sessionInfo: SessionInfo // 会话基础信息
  memories: MemoryItem[] // 最新的记忆列表（最多10条）
  hasMore: boolean // 是否还有更多记忆
}

/**
 * 会话记忆分页请求
 */
export interface SessionMemoryPageRequest {
  sessionId: string // 会话ID
  cursor?: string // 游标时间戳（LocalDateTime格式，用于分页，null表示查询最新记录）
  limit?: number // 查询数量限制，默认10，最大50
}

/**
 * 统一响应包装类型
 */
export interface ApiResult<T> {
  code: string // 返回码
  message: string // 返回消息
  data: T // 响应数据
  requestId: string // 请求ID
}

// ========================= 会话对话相关接口 =========================

/**
 * 开始一个新的对话会话
 */
export const startConversation = (data: SessionStartRequest) => {
  return request({
    url: `${aiTalkRouter}/conversation/start`,
    method: "post",
    data,
  })
}

/**
 * 发送消息，继续对话
 */
export const chatConversation = (data: ChatRequest) => {
  return request({
    url: `${aiTalkRouter}/conversation/chat`,
    method: "post",
    data,
  })
}

/**
 * 发送消息，继续对话（流式输出）
 * 返回一个可读流，用于处理 Server-Sent Events
 */
export const chatConversationStream = (data: ChatRequest) => {
  return new Promise((resolve, reject) => {
    const baseURL = request.defaults?.baseURL || ''
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const url = `${baseURL}${aiTalkRouter}/conversation/chat/stream`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
        // 有些代理/浏览器缓存会捣乱，建议禁用缓存
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(data),
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

              // 规范化换行（\r\n -> \n），再按 “\n\n” 拆成完整事件
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

/**
 * 清空会话记忆
 */
export const clearConversationMemory = (sessionId: string) => {
  return request({
    url: `${aiTalkRouter}/conversation/memory/${sessionId}`,
    method: "delete",
  })
}

// ========================= 会话管理相关接口 =========================

/**
 * 根据角色ID查询Session列表
 */
export const getSessionsByCharacter = (characterId: string, isOwner: boolean = false) => {
  return request({
    url: `${aiTalkRouter}/sessions/by-character/${characterId}`,
    method: "get",
    params: {
      isOwner,
    },
  })
}

/**
 * 根据sessionId加载会话详情（基础信息+最新10条记忆）
 */
export const getSessionDetail = (sessionId: string, cursor?: string) => {
  return request({
    url: `${aiTalkRouter}/sessions/${sessionId}/detail`,
    method: "get",
    params: cursor ? { cursor } : {},
  })
}

/**
 * 分页查询Session记忆
 */
export const getSessionMemoriesPage = (data: SessionMemoryPageRequest) => {
  return request({
    url: `${aiTalkRouter}/sessions/memories/page`,
    method: "post",
    data,
  })
}

/**
 * 删除会话
 */
export const deleteSession = (sessionId: string) => {
  return request({
    url: `${aiTalkRouter}/sessions/${sessionId}`,
    method: "delete",
  })
}

// ========================= 角色相关接口 =========================

/**
 * 获取已启用的角色列表
 */
export const getEnabledPersonas = () => {
  return request({
    url: `${aiTalkRouter}/personas/enabled`,
    method: "get",
  })
}
