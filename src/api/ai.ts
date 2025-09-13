import request from "@/utils/request"
import type { RequestPageType } from "@/types/request"

const aiRouter = "/ai"

// ========================= 全局记忆管理 =========================

/**
 * 全局记忆响应类型
 */
export interface GlobalMemoryResponse {
  id: number
  content: string
  timestamp: number
  createTime: string
}

/**
 * 全局记忆统计信息
 */
export interface GlobalMemoryStats {
  totalCount: number
  maxCount: number
  remainingCount: number
}

/**
 * 新增全局记忆请求
 */
export interface GlobalMemoryAddReq {
  content: string
}

/**
 * 更新全局记忆请求
 */
export interface GlobalMemoryUpdateReq {
  id: number
  content: string
}

/**
 * 查询所有全局记忆
 */
export const getGlobalMemoryList = () => {
  return request({
    url: `${aiRouter}/global-memory/list`,
    method: "get",
  })
}

/**
 * 根据ID查询全局记忆
 */
export const getGlobalMemoryById = (id: number) => {
  return request({
    url: `${aiRouter}/global-memory/${id}`,
    method: "get",
  })
}

/**
 * 新增全局记忆
 */
export const addGlobalMemory = (data: GlobalMemoryAddReq) => {
  return request({
    url: `${aiRouter}/global-memory`,
    method: "post",
    data,
  })
}

/**
 * 更新全局记忆
 */
export const updateGlobalMemory = (data: GlobalMemoryUpdateReq) => {
  return request({
    url: `${aiRouter}/global-memory`,
    method: "put",
    data,
  })
}

/**
 * 删除全局记忆
 */
export const deleteGlobalMemory = (id: number) => {
  return request({
    url: `${aiRouter}/global-memory/${id}`,
    method: "delete",
  })
}

/**
 * 获取全局记忆统计信息
 */
export const getGlobalMemoryStats = () => {
  return request({
    url: `${aiRouter}/global-memory/stats`,
    method: "get",
  })
}

// ========================= LLM配置管理 =========================

/**
 * 提供商信息
 */
export interface ProviderInfo {
  type: string
  displayName: string
  description: string
  baseUrl: string
  maskedApiKey: string
  modelName: string
  supportsFunctionCall: boolean
  supportsMultimodal: boolean
  suitableForAgent: boolean
}

/**
 * 设置信息
 */
export interface SettingsInfo {
  maxTokens: number
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  streamEnabled: boolean
  timeoutSeconds: number
  retryCount: number
}

/**
 * LLM配置响应
 */
export interface LlmConfigurationResponse {
  id: number
  provider: ProviderInfo
  settings: SettingsInfo
  enabled: boolean
  description: string
  createdAt: string
  updatedAt: string
}

/**
 * LLM配置列表响应
 */
export interface LlmConfigurationListResponse {
  total: number
  configurations: LlmConfigurationResponse[]
}

/**
 * 创建LLM配置命令
 */
export interface CreateLlmConfigurationCommand {
  providerType: string
  baseUrl: string
  apiKey: string
  modelName: string
  description?: string
  maxTokens?: number
  temperature?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  timeoutSeconds?: number
  retryCount?: number
  stopSequences?: string[]
  streamEnabled?: boolean
  enabled?: boolean
}

/**
 * 更新LLM配置命令
 */
export interface UpdateLlmConfigurationCommand {
  configId: number
  providerType?: string
  baseUrl?: string
  apiKey?: string
  modelName?: string
  displayName?: string
  maxTokens?: number
  temperature?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  timeoutSeconds?: number
  retryCount?: number
  stopSequences?: string[]
  streamEnabled?: boolean
  enabled?: boolean
}

/**
 * LLM配置查询参数
 */
export interface LlmConfigListParams extends RequestPageType<{}> {
  providerType?: string
  enabled?: boolean
  modelName?: string
  description?: string
  'sortBy.key'?: string
}

/**
 * 分页查询LLM配置列表
 */
export const getLlmConfigList = (params: LlmConfigListParams) => {
  if (!params.page || !params.size) {
    throw new Error("page or size is required")
  }
  return request({
    url: `${aiRouter}/llm-config/list`,
    method: "get",
    params,
  })
}

/**
 * 创建LLM配置
 */
export const createLlmConfig = (data: CreateLlmConfigurationCommand) => {
  return request({
    url: `${aiRouter}/llm-config`,
    method: "post",
    data,
  })
}

/**
 * 根据ID获取LLM配置
 */
export const getLlmConfigById = (configId: number) => {
  return request({
    url: `${aiRouter}/llm-config/${configId}`,
    method: "get",
  })
}

/**
 * 更新LLM配置
 */
export const updateLlmConfig = (configId: number, data: UpdateLlmConfigurationCommand) => {
  return request({
    url: `${aiRouter}/llm-config/${configId}`,
    method: "put",
    data,
  })
}

/**
 * 启用LLM配置
 */
export const enableLlmConfig = (configId: number) => {
  return request({
    url: `${aiRouter}/llm-config/${configId}/enable`,
    method: "post",
  })
}

/**
 * 禁用LLM配置
 */
export const disableLlmConfig = (configId: number) => {
  return request({
    url: `${aiRouter}/llm-config/${configId}/disable`,
    method: "post",
  })
}

/**
 * 获取全局配置（当前启用的配置）
 */
export const getGlobalLlmConfig = () => {
  return request({
    url: `${aiRouter}/llm-config/global`,
    method: "get",
  })
}

// ========================= 角色管理 =========================

/**
 * 角色列表项类型
 */
export interface PersonaItem {
  personaId: string
  name: string
  description: string
  cardCover?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  charName: string
  charGreeting: string
}

/**
 * 角色卡信息
 */
export interface PersonaCard {
  charName: string
  charPersona: string
  worldScenario: string
  charGreeting: string
  exampleDialogue: string
}

/**
 * 角色详细信息
 */
export interface PersonaDetail {
  personaId: string
  name: string
  description: string
  worldBookId?: string
  cardCover?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  card: PersonaCard
}

/**
 * 创建角色命令
 */
export interface CreatePersonaCommand {
  name: string
  description?: string
  cardCover?: string
  card: {
    charName: string
    charPersona: string
    worldScenario?: string
    charGreeting?: string
    exampleDialogue?: string
  }
}

/**
 * 更新角色命令
 */
export interface UpdatePersonaCommand {
  personaId: string
  name?: string
  description?: string
  cardCover?: string
  card?: {
    charName?: string
    charPersona?: string
    worldScenario?: string
    charGreeting?: string
    exampleDialogue?: string
  }
  enabled?: boolean
}

/**
 * 角色分页响应
 */
export interface PersonaPageResponse {
  total: number
  personas: PersonaItem[]
}

/**
 * 角色查询参数
 */
export interface PersonaListParams extends RequestPageType<{}> {
  keyword?: string
  enabled?: boolean
  'sortBy.key'?: string
}

/**
 * 角色状态更新请求
 */
export interface PersonaStatusUpdateReq {
  enabled: boolean
}

/**
 * 分页查询角色列表
 */
export const getPersonaList = (params: PersonaListParams) => {
  if (!params.page || !params.size) {
    throw new Error("page or size is required")
  }
  return request({
    url: `${aiRouter}/personas`,
    method: "get",
    params,
  })
}

/**
 * 创建角色
 */
export const createPersona = (data: CreatePersonaCommand) => {
  return request({
    url: `${aiRouter}/personas`,
    method: "post",
    data,
  })
}

/**
 * 根据ID获取角色详细信息
 */
export const getPersonaById = (personaId: string) => {
  return request({
    url: `${aiRouter}/personas/${personaId}`,
    method: "get",
  })
}

/**
 * 更新角色
 */
export const updatePersona = (personaId: string, data: UpdatePersonaCommand) => {
  return request({
    url: `${aiRouter}/personas/${personaId}`,
    method: "put",
    data: {
      ...data,
      personaId,
    },
  })
}

/**
 * 删除角色
 */
export const deletePersona = (personaId: string) => {
  return request({
    url: `${aiRouter}/personas/${personaId}`,
    method: "delete",
  })
}

/**
 * 更新角色状态（启用/禁用）
 */
export const updatePersonaStatus = (personaId: string, data: PersonaStatusUpdateReq) => {
  return request({
    url: `${aiRouter}/personas/${personaId}/status`,
    method: "post",
    data,
  })
}

// ========================= 工具管理 =========================

/**
 * 工具信息
 */
export interface ToolInfo {
  name: string
  description: string
  className: string
  methodName: string
  enabled: boolean
}

/**
 * 工具列表响应
 */
export interface ToolListResponse {
  tools: ToolInfo[]
  totalCount: number
  enabledCount: number
}

/**
 * 工具状态更新请求
 */
export interface ToolStateUpdate {
  toolName: string
  enabled: boolean
}

/**
 * 批量工具状态更新请求
 */
export interface BatchToolStateUpdate {
  toolStates: ToolStateUpdate[]
}

/**
 * 获取所有工具列表
 */
export const getToolList = () => {
  return request<any, ToolListResponse>({
    url: `${aiRouter}/tools`,
    method: "get",
  })
}

/**
 * 更新单个工具状态
 */
export const updateToolState = (data: ToolStateUpdate) => {
  return request({
    url: `${aiRouter}/tools/state`,
    method: "put",
    data,
  })
}

/**
 * 批量更新工具状态
 */
export const batchUpdateToolState = (data: BatchToolStateUpdate) => {
  return request({
    url: `${aiRouter}/tools/states/batch`,
    method: "put",
    data,
  })
}