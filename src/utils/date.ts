// utils/date.ts
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * 将ISO字符串转换为LocalDateTime格式字符串
 * @param isoString ISO格式时间字符串 (如: "2024-01-01T10:30:00.000Z")
 * @returns LocalDateTime格式字符串 (如: "2024-01-01T10:30:00")
 */
export function toLocalDateTimeString(isoString: string): string {
  const date = new Date(isoString)
  return date.toISOString().slice(0, 19) // 去掉毫秒和时区部分
}

/**
 * 将LocalDateTime格式字符串转换为ISO字符串
 * @param localDateTimeString LocalDateTime格式字符串 (如: "2024-01-01T10:30:00")
 * @returns ISO格式时间字符串 (如: "2024-01-01T10:30:00.000Z")
 */
export function fromLocalDateTimeString(localDateTimeString: string): string {
  // 如果已经是ISO格式，直接返回
  if (localDateTimeString.includes('Z') || localDateTimeString.includes('+')) {
    return localDateTimeString
  }
  // 添加时区信息，假设是本地时间
  return new Date(localDateTimeString).toISOString()
}

/**
 * 检查时间字符串是否为LocalDateTime格式
 * @param timeString 时间字符串
 * @returns 是否为LocalDateTime格式
 */
export function isLocalDateTimeFormat(timeString: string): boolean {
  // LocalDateTime格式: YYYY-MM-DDTHH:mm:ss (不包含时区信息)
  const localDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
  return localDateTimeRegex.test(timeString)
}