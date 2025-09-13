import { defineStore } from "pinia"

// 人格类型定义
export interface Persona {
  id: string
  name: string
  avatar: string
  description: string
  systemPrompt: string
  color: string
}

// 会话类型定义
export interface Session {
  id: string
  personaId: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessage?: string
}

// 消息类型定义
export interface Message {
  id: string
  sessionId: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  loading?: boolean
}

const useAiStore = defineStore("ai", {
  state: () => ({
    // UI状态
    drawerVisible: false,
    fullscreenMode: false,
    sessionManagerVisible: false,
    
    // 加载状态
    loadingPersonas: false,
    loadingSessions: false,
    loadingMessages: false,
    loadingMoreMessages: false,
    creatingSession: false,
    
    // 当前状态
    currentPersonaId: "",
    currentSessionId: "",
    chatMode: "chat" as "chat" | "agent", // 聊天模式：chat(对话) | agent(智能体)
    
    // 数据
    personas: [] as Persona[],
    
    sessions: [] as Session[],
    messages: [] as Message[],
    
    // 分页相关状态
    hasMoreMessages: false, // 是否还有更多历史消息
    messageCursor: null as string | null // 消息分页游标（LocalDateTime格式的时间字符串）
  }),
  
  getters: {
    // 获取当前人格
    currentPersona: (state) => {
      return state.personas.find(p => p.id === state.currentPersonaId)
    },
    
    // 获取当前会话
    currentSession: (state) => {
      return state.sessions.find(s => s.id === state.currentSessionId)
    },
    
    // 获取当前人格的会话列表
    currentPersonaSessions: (state) => {
      return state.sessions.filter(s => s.personaId === state.currentPersonaId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    },
    
    // 获取当前会话的消息列表
    currentMessages: (state) => {
      return state.messages.filter(m => m.sessionId === state.currentSessionId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    },
    
    // 转换消息为Bubble组件格式
    bubbleMessages(): any[] {
      return this.currentMessages.map((msg: Message) => ({
        key: msg.id,
        content: msg.content,
        placement: msg.role === 'user' ? 'end' : 'start',
        avatar: msg.role === 'assistant' ? this.currentPersona?.avatar : undefined,
        // 使用 typing 属性替代 loading，实现打字机效果
        typing: msg.loading && msg.role === 'assistant' ? { step: 1, interval: 50 } : false,
        role: msg.role
      }))
    },
    
    // 获取聊天模式选项
    chatModeOptions(): Array<{value: string, label: string, description: string}> {
      return [
        { 
          value: 'chat', 
          label: '对话模式', 
          description: '普通AI对话，适合日常交流' 
        },
        { 
          value: 'agent', 
          label: '智能体模式', 
          description: '高级AI助手，可使用工具和记忆' 
        }
      ]
    }
  },
  
  actions: {
    // UI操作
    async openDrawer() {
      this.drawerVisible = true
      // 首次打开时加载角色列表
      if (this.personas.length === 0) {
        await this.loadPersonas()
        // 加载角色后，自动加载第一个角色的最新会话（仅抽屉模式）
        if (this.currentPersonaId && this.currentPersonaSessions.length === 0) {
          await this.loadSessions(this.currentPersonaId)
        }
      } else {
        // 如果有当前角色但没有会话，加载会话列表
        if (this.currentPersonaId && this.currentPersonaSessions.length === 0) {
          await this.loadSessions(this.currentPersonaId)
        }
      }
    },
    
    closeDrawer() {
      this.drawerVisible = false
    },
    
    toggleFullscreen() {
      this.fullscreenMode = !this.fullscreenMode
      if (this.fullscreenMode) {
        this.drawerVisible = false
      }
    },
    
    openSessionManager() {
      this.sessionManagerVisible = true
    },
    
    closeSessionManager() {
      this.sessionManagerVisible = false
    },
    
    // 聊天模式操作
    setChatMode(mode: "chat" | "agent") {
      this.chatMode = mode
    },
    
    // 加载启用的角色列表
    async loadPersonas() {
      if (this.loadingPersonas) return
      
      this.loadingPersonas = true
      try {
        const { getEnabledPersonas } = await import('@/api/ai-talk')
        const response = await getEnabledPersonas()
        
        if (response.data.personas) {
          this.personas = response.data.personas.map(persona => ({
            id: persona.personaId,
            name: persona.name,
            avatar: persona.cardCover,
            description: persona.description,
            systemPrompt: '', // API中可能没有这个字段
            color: this.getPersonaColor(persona.personaId) // 生成默认颜色
          }))
          
          // 如果没有当前选中的角色且有角色列表，选择第一个
          if (!this.currentPersonaId && this.personas.length > 0) {
            this.currentPersonaId = this.personas[0].id
          }
        }
      } catch (error) {
        console.error('加载角色列表失败:', error)
      } finally {
        this.loadingPersonas = false
      }
    },
    
    // 根据角色ID生成默认颜色
    getPersonaColor(personaId: string): string {
      const colors = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#13c2c2', '#722ed1']
      const hash = personaId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return colors[hash % colors.length]
    },
    
    // 初始化或重新启动会话
    async initializeSession() {
      if (!this.currentPersonaId) return
      
      try {
        const { startConversation } = await import('@/api/ai-talk')
        const useUserStore = (await import('@/store/modules/user')).default
        const userStore = useUserStore()
        
        const sessionRequest = {
          characterId: this.currentPersonaId,
          mode: this.chatMode,
          isOwner: !!userStore.token
        }
        
        const response = await startConversation(sessionRequest)
        
        if (response.data.success) {
          // 更新会话ID（如果API返回了新的会话ID）
          if (response.data.sessionId && response.data.sessionId !== this.currentSessionId) {
            this.currentSessionId = response.data.sessionId
          }
          
          // 如果有开场白，添加到消息中
          if (response.data.greeting) {
            this.addMessage(response.data.greeting, 'assistant')
          }
        }
      } catch (error) {
        console.error('初始化会话失败:', error)
      }
    },
    
    // 加载指定角色的会话列表
    async loadSessions(personaId: string) {
      if (this.loadingSessions) return
      
      this.loadingSessions = true
      try {
        const { getSessionsByCharacter } = await import('@/api/ai-talk')
        const useUserStore = (await import('@/store/modules/user')).default
        const userStore = useUserStore()
        
        const response = await getSessionsByCharacter(personaId, !!userStore.token)
        
        if (response.data.sessions) {
          // 转换API数据格式
          const sessions = response.data.sessions.map(session => ({
            id: session.sessionId,
            personaId: session.characterId,
            title: session.lastMessageContent || '新会话',
            createdAt: session.createdAt,
            updatedAt: session.lastActiveAt,
            lastMessage: session.lastMessageContent
          }))
          
          // 更新当前角色的会话列表
          this.sessions = this.sessions.filter(s => s.personaId !== personaId).concat(sessions)
          
          // 选择最新的会话
          if (sessions.length > 0) {
            this.currentSessionId = sessions[0].id
            // 加载会话消息
            await this.loadSessionMessages(sessions[0].id)
          } else {
            // 如果没有会话，清空消息列表
            this.messages = this.messages.filter(m => m.sessionId !== this.currentSessionId)
            this.currentSessionId = ""
          }
        }
      } catch (error) {
        console.error('加载会话列表失败:', error)
      } finally {
        this.loadingSessions = false
      }
    },
    
    // 人格操作
    async switchPersona(personaId: string) {
      this.currentPersonaId = personaId
      // 切换人格时加载该人格的会话列表
      await this.loadSessions(personaId)
    },
    
    // 加载会话消息（最新10条）
    async loadSessionMessages(sessionId: string, cursor?: string) {
      if (this.loadingMessages) return
      
      this.loadingMessages = true
      try {
        const { getSessionDetail } = await import('@/api/ai-talk')
        const response = await getSessionDetail(sessionId, cursor)
        
        if (response.data.sessionInfo && response.data.memories) {
          // 转换消息格式并按时间戳升序排序
          const messages = response.data.memories.map(memory => ({
            id: `${sessionId}-${memory.timestamp}`,
            sessionId: sessionId,
            content: memory.content,
            role: memory.type.toLowerCase() === 'user' ? 'user' : 'assistant',
            timestamp: memory.timestamp, // 保持后端返回的LocalDateTime格式
            loading: false
          })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          
          if (!cursor) {
            // 首次加载，替换消息列表
            this.messages = this.messages.filter(m => m.sessionId !== sessionId).concat(messages)
          } else {
            // 分页加载，在前面插入历史消息
            const existingMessages = this.messages.filter(m => m.sessionId === sessionId)
            const newMessages = this.messages.filter(m => m.sessionId !== sessionId)
            this.messages = newMessages.concat(messages).concat(existingMessages)
          }
          
          // 更新分页状态
          this.hasMoreMessages = response.data.hasMore
          if (messages.length > 0) {
            // 使用最早消息的时间戳作为下次查询的游标（LocalDateTime格式）
            this.messageCursor = messages[0].timestamp
          }
        }
      } catch (error) {
        console.error('加载会话消息失败:', error)
      } finally {
        this.loadingMessages = false
      }
    },
    
    // 加载更多历史消息
    async loadMoreMessages() {
      if (this.loadingMoreMessages || !this.hasMoreMessages || !this.currentSessionId) return
      
      this.loadingMoreMessages = true
      try {
        const { getSessionDetail } = await import('@/api/ai-talk')
        const response = await getSessionDetail(this.currentSessionId, this.messageCursor)
        
        if (response.data.sessionInfo && response.data.memories) {
          // 转换消息格式
          const messages = response.data.memories.map(memory => ({
            id: `${this.currentSessionId}-${memory.timestamp}`,
            sessionId: this.currentSessionId,
            content: memory.content,
            role: memory.type.toLowerCase() === 'user' ? 'user' : 'assistant',
            timestamp: memory.timestamp,
            loading: false
          })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          
          // 在前面插入历史消息
          const existingMessages = this.messages.filter(m => m.sessionId === this.currentSessionId)
          const otherMessages = this.messages.filter(m => m.sessionId !== this.currentSessionId)
          this.messages = otherMessages.concat(messages).concat(existingMessages)
          
          // 更新分页状态
          this.hasMoreMessages = response.data.hasMore
          if (messages.length > 0) {
            // 使用最早消息的时间戳作为下次查询的游标（LocalDateTime格式）
            this.messageCursor = messages[0].timestamp
          }
        }
      } catch (error) {
        console.error('加载更多消息失败:', error)
      } finally {
        this.loadingMoreMessages = false
      }
    },
    
    // 会话操作
    async switchSession(sessionId: string) {
      this.currentSessionId = sessionId
      this.closeSessionManager()
      // 切换会话时加载消息
      await this.loadSessionMessages(sessionId)
    },
    
    async createNewSession() {
      if (this.creatingSession) return
      
      this.creatingSession = true
      try {
        const { startConversation } = await import('@/api/ai-talk')
        const useUserStore = (await import('@/store/modules/user')).default
        const userStore = useUserStore()
        
        const sessionRequest = {
          characterId: this.currentPersonaId,
          mode: this.chatMode,
          isOwner: !!userStore.token
        }
        
        const response = await startConversation(sessionRequest)
        
        if (response.data.success) {
          // 创建会话记录
          const newSession: Session = {
            id: response.data.sessionId,
            personaId: this.currentPersonaId,
            title: '新会话',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: ''
          }
          
          // 添加到会话列表
          this.sessions.unshift(newSession)
          this.currentSessionId = response.data.sessionId
          
          // 如果有开场白，添加到消息中
          if (response.data.greeting) {
            this.addMessage(response.data.greeting, 'assistant')
          }
          
          this.closeSessionManager()
        } else {
          console.error('创建会话失败:', response.data.errorMessage)
          // 创建失败时显示错误信息
          throw new Error(response.data.errorMessage || '创建会话失败')
        }
      } catch (error) {
        console.error('创建新会话失败:', error)
        // 如果创建会话失败，使用临时会话ID作为降级方案
        const tempSession: Session = {
          id: `temp-session-${Date.now()}`,
          personaId: this.currentPersonaId,
          title: '新会话',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastMessage: ''
        }
        this.sessions.unshift(tempSession)
        this.currentSessionId = tempSession.id
        this.closeSessionManager()
        
        // 可以选择性地抛出错误让UI处理
        throw error
      } finally {
        this.creatingSession = false
      }
    },
    
    updateSessionTitle(sessionId: string, title: string) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (session) {
        session.title = title
        session.updatedAt = new Date().toISOString()
      }
    },
    
    async deleteSession(sessionId: string) {
      try {
        // 调用API删除会话
        const { deleteSession: deleteSessionApi } = await import('@/api/ai-talk')
        await deleteSessionApi(sessionId)
        
        // API调用成功后，清理本地状态
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
        this.messages = this.messages.filter(m => m.sessionId !== sessionId)
        
        // 如果删除的是当前会话，切换到其他会话
        if (this.currentSessionId === sessionId) {
          const personaSessions = this.sessions.filter(s => s.personaId === this.currentPersonaId)
          if (personaSessions.length > 0) {
            this.currentSessionId = personaSessions[0].id
          } else {
            // 删除最后一个会话后，自动创建新会话
            try {
              await this.createNewSession()
            } catch (error) {
              console.error('删除会话后自动创建新会话失败:', error)
              // 如果自动创建失败，清空当前会话ID
              this.currentSessionId = ""
            }
          }
        }
      } catch (error) {
        console.error('删除会话失败:', error)
        // 抛出错误让UI层处理
        throw new Error('删除会话失败: ' + (error.message || '未知错误'))
      }
    },
    
    // 消息操作
    addMessage(content: string, role: 'user' | 'assistant', loading = false) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sessionId: this.currentSessionId,
        content,
        role,
        timestamp: new Date().toISOString(),
        loading
      }
      this.messages.push(newMessage)
      
      // 更新会话的最后消息和时间
      const session = this.sessions.find(s => s.id === this.currentSessionId)
      if (session) {
        session.lastMessage = content
        session.updatedAt = new Date().toISOString()
      }
      
      return newMessage.id
    },
    
    updateMessage(messageId: string, content: string, loading = false) {
      
      const message = this.messages.find(m => m.id === messageId)
      if (message) {
        message.content = content
        message.loading = loading
        message.timestamp = new Date().toISOString()
        
        // 如果是首次回复且内容不为空，更新会话标题
        if (!loading && content && this.currentSession) {
          const sessionMessages = this.currentMessages
          if (sessionMessages.length === 2) { // 用户消息 + 助手回复 = 2条
            const userMessage = sessionMessages.find(m => m.role === 'user')
            if (userMessage) {
              const title = userMessage.content.length > 20 
                ? userMessage.content.substring(0, 20) + '...'
                : userMessage.content
              this.updateSessionTitle(this.currentSessionId, title)
            }
          }
        }
      }
    },
    
    // 发送消息
    async sendMessage(content: string) {
      const isFirstMessage = !this.currentSessionId || this.currentMessages.length === 0
      
      // 添加用户消息
      this.addMessage(content, 'user')
      
      // 添加加载中的助手消息
      const assistantMessageId = this.addMessage('', 'assistant', true)
      
      try {
        // 如果是首次消息，先创建会话
        if (isFirstMessage) {
          await this.createNewSessionForFirstMessage()
        }
        
        // 使用流式接口发送消息
        await this.sendStreamMessage(content, assistantMessageId)
        
      } catch (error) {
        console.error('发送消息失败:', error)
        // 错误处理 - 使用模拟回复作为降级方案
        let responses: string[]
        
        if (this.chatMode === 'chat') {
          responses = [
            '抱歉，网络连接出现问题，请稍后再试...',
            '服务暂时不可用，但我仍然愿意帮助你！',
          ]
        } else {
          responses = [
            '智能体服务暂时不可用，请检查网络连接...',
            '工具调用失败，将切换到基础对话模式...',
          ]
        }
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        this.updateMessage(assistantMessageId, randomResponse, false)
      }
    },
    
    // 为首次消息创建新会话
    async createNewSessionForFirstMessage() {
      try {
        const { startConversation } = await import('@/api/ai-talk')
        const useUserStore = (await import('@/store/modules/user')).default
        const userStore = useUserStore()
        
        const sessionRequest = {
          characterId: this.currentPersonaId,
          mode: this.chatMode,
          isOwner: !!userStore.token
        }
        
        const response = await startConversation(sessionRequest)
        
        if (response.data.success) {
          // 更新会话ID
          this.currentSessionId = response.data.sessionId
          
          // 创建会话记录
          const newSession: Session = {
            id: response.data.sessionId,
            personaId: this.currentPersonaId,
            title: '新会话',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: ''
          }
          
          // 添加到会话列表
          this.sessions.unshift(newSession)
        }
      } catch (error) {
        console.error('创建首次会话失败:', error)
        // 如果创建会话失败，使用临时会话ID
        this.currentSessionId = `temp-session-${Date.now()}`
      }
    },
    
    // 流式发送消息
    async sendStreamMessage(content: string, assistantMessageId: string) {
      try {
        const { chatConversationStream } = await import('@/api/ai-talk')
        const useUserStore = (await import('@/store/modules/user')).default
        const userStore = useUserStore()
        
        const chatRequest = {
          message: content,
          sessionId: this.currentSessionId,
          userName: userStore.name || '旅行者',
          characterId: this.currentPersonaId,
          isOwner: !!userStore.token,
          enableAgent: this.chatMode === 'agent'
        }
        
        // 调用流式API
        const stream: any = await chatConversationStream(chatRequest)
        let accumulatedContent = ''
        
        // 处理流式数据
        for await (const chunk of stream) {
          if (typeof chunk === 'string') {
            // 现在chunk已经是纯文本内容了（在api层已处理）
            accumulatedContent += chunk
            
            // 实时更新消息内容，保持loading状态以触发typing效果
            this.updateMessage(assistantMessageId, accumulatedContent, true)
          }
        }
        
        // 流式传输完成，设置loading为false以停止typing效果
        this.updateMessage(assistantMessageId, accumulatedContent, false)
        
      } catch (error) {
        console.error('流式发送消息失败:', error)
        // 降级到普通API
        await this.sendRegularMessage(content, assistantMessageId)
      }
    },
    
    // 普通发送消息（降级方案）
    async sendRegularMessage(content: string, assistantMessageId: string) {
      try {
        const { chatConversation } = await import('@/api/ai-talk')
        const useUserStore = (await import('@/store/modules/user')).default
        const userStore = useUserStore()
        
        const chatRequest = {
          message: content,
          sessionId: this.currentSessionId,
          userName: userStore.name || '旅行者',
          characterId: this.currentPersonaId,
          isOwner: !!userStore.token,
          enableAgent: this.chatMode === 'agent'
        }
        
        const response = await chatConversation(chatRequest)
        
        if (response.data.success) {
          this.updateMessage(assistantMessageId, response.data.reply, false)
        } else {
          this.updateMessage(assistantMessageId, response.data.errorMessage || '抱歉，出现了一些问题', false)
        }
      } catch (error) {
        console.error('普通发送消息也失败:', error)
        this.updateMessage(assistantMessageId, '抱歉，消息发送失败，请稍后重试', false)
      }
    },
    
    // 从useXChat同步消息到Store（用于保持会话记录）
    syncMessageFromXChat(message: any) {
      if (!message) return
      
      // 检查消息是否已存在
      const existingMessage = this.messages.find(m => m.id === message.id)
      if (existingMessage) {
        // 更新现有消息
        existingMessage.content = message.content
        existingMessage.loading = message.loading || false
        existingMessage.timestamp = message.timestamp || new Date().toISOString()
      } else {
        // 添加新消息
        const newMessage: Message = {
          id: message.id || `msg-${Date.now()}`,
          sessionId: this.currentSessionId,
          content: message.content,
          role: message.role,
          timestamp: message.timestamp || new Date().toISOString(),
          loading: message.loading || false
        }
        this.messages.push(newMessage)
      }
      
      // 更新会话的最后消息和时间
      const session = this.sessions.find(s => s.id === this.currentSessionId)
      if (session && !message.loading) {
        session.lastMessage = message.content
        session.updatedAt = new Date().toISOString()
      }
    }
  },
  
  persist: {
    key: "ai-chat-store",
    storage: localStorage,
    pick: ["currentPersonaId", "chatMode", "sessions", "messages"]
  }
})

export default useAiStore
