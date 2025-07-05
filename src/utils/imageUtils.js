/**
 * 图片处理工具类
 * 主要用于阿里云OSS图片处理
 */

/**
 * 判断是否为阿里云OSS链接
 * @param {string} url - 图片URL
 * @returns {boolean} 是否为OSS链接
 */
export function isOssUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }
  // 匹配阿里云OSS域名格式
  const ossPattern = /^https?:\/\/[^\/]+\.oss(-[^\/]+)?\.aliyuncs\.com/
  return ossPattern.test(url)
}

/**
 * 生成带处理参数的OSS图片URL
 * @param {string} originalUrl - 原始图片URL
 * @param {Object} options - 处理选项
 * @param {number} options.width - 宽度
 * @param {number} options.height - 高度
 * @param {number} options.quality - 质量(1-100)
 * @param {string} options.format - 格式(jpg, png, webp等)
 * @param {boolean} options.progressive - 是否渐进式
 * @param {string} options.mode - 缩放模式(lfit, mfit, fill, pad, fixed)
 * @returns {string} 处理后的URL
 */
export function generateOssImageUrl(originalUrl, options = {}) {
  if (!originalUrl || !isOssUrl(originalUrl)) {
    return originalUrl
  }

  const {
    width,
    height,
    quality,
    format,
    progressive = false,
    mode = 'lfit'
  } = options

  let processParams = []

  // 添加缩放参数
  if (width || height) {
    let resizeParam = `resize,m_${mode}`
    if (width) resizeParam += `,w_${width}`
    if (height) resizeParam += `,h_${height}`
    processParams.push(resizeParam)
  }

  // 添加质量参数
  if (quality && quality >= 1 && quality <= 100) {
    processParams.push(`quality,q_${quality}`)
  }

  // 添加格式转换参数
  if (format) {
    processParams.push(`format,${format}`)
  }

  // 添加渐进式参数
  if (progressive) {
    processParams.push('interlace,1')
  }

  // 如果没有处理参数，返回原URL
  if (processParams.length === 0) {
    return originalUrl
  }

  // 构建处理参数字符串
  const processString = processParams.join('/')
  
  // 检查URL是否已经包含处理参数
  const separator = originalUrl.includes('?') ? '&' : '?'
  
  return `${originalUrl}${separator}x-oss-process=image/${processString}`
}

/**
 * 生成缩略图URL
 * @param {string} originalUrl - 原始图片URL
 * @param {number} width - 缩略图宽度，默认600
 * @param {number} height - 缩略图高度，可选
 * @param {Object} options - 其他选项
 * @returns {string} 缩略图URL
 */
export function generateThumbnail(originalUrl, width = 600, height = null, options = {}) {
  const defaultOptions = {
    quality: 80,
    progressive: true,
    mode: 'lfit',
    ...options
  }

  return generateOssImageUrl(originalUrl, {
    width,
    height,
    ...defaultOptions
  })
}

/**
 * 生成不同尺寸的图片URL集合
 * @param {string} originalUrl - 原始图片URL
 * @param {Array} sizes - 尺寸数组，如[200, 400, 800]
 * @param {Object} options - 其他选项
 * @returns {Object} 包含不同尺寸URL的对象
 */
export function generateImageSizes(originalUrl, sizes = [200, 400, 800], options = {}) {
  if (!originalUrl || !isOssUrl(originalUrl)) {
    return { original: originalUrl }
  }

  const result = { original: originalUrl }
  
  sizes.forEach(size => {
    result[`w${size}`] = generateThumbnail(originalUrl, size, null, options)
  })

  return result
}

/**
 * 生成模糊小图URL（用作占位符）
 * @param {string} originalUrl - 原始图片URL
 * @param {number} width - 小图宽度，默认200
 * @param {Object} options - 其他选项
 * @returns {string} 模糊小图URL
 */
export function generateBlurredThumbnail(originalUrl, width = 200, options = {}) {
  const defaultOptions = {
    quality: 30, // 低质量
    progressive: true,
    mode: 'lfit',
    ...options
  }

  return generateOssImageUrl(originalUrl, {
    width,
    ...defaultOptions
  })
}

/**
 * 生成渐进式图片对（模糊图+高清图）
 * @param {string} originalUrl - 原始图片URL
 * @param {Object} options - 配置选项
 * @param {number} options.blurWidth - 模糊图宽度，默认200
 * @param {number} options.highWidth - 高清图宽度，默认600
 * @param {number} options.mobileHighWidth - 移动端高清图宽度，默认400
 * @returns {Object} 包含模糊图和高清图URL的对象
 */
export function generateProgressiveImagePair(originalUrl, options = {}) {
  const {
    blurWidth = 200,
    highWidth = 600,
    mobileHighWidth = 400
  } = options

  if (!originalUrl || !isOssUrl(originalUrl)) {
    return {
      blur: originalUrl,
      high: originalUrl,
      mobileHigh: originalUrl
    }
  }

  return {
    blur: generateBlurredThumbnail(originalUrl, blurWidth),
    high: generateThumbnail(originalUrl, highWidth),
    mobileHigh: generateThumbnail(originalUrl, mobileHighWidth)
  }
}

/**
 * 获取图片的WebP格式URL（如果支持）
 * @param {string} originalUrl - 原始图片URL
 * @param {number} width - 宽度
 * @param {Object} options - 其他选项
 * @returns {string} WebP格式URL
 */
export function generateWebpImage(originalUrl, width = 200, options = {}) {
  // 检查浏览器是否支持WebP
  const supportsWebp = (() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  })()

  if (!supportsWebp) {
    return generateThumbnail(originalUrl, width, null, options)
  }

  return generateOssImageUrl(originalUrl, {
    width,
    format: 'webp',
    progressive: true,
    quality: 80,
    ...options
  })
}

/**
 * 预加载图片
 * @param {string} url - 图片URL
 * @returns {Promise} 预加载Promise
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 批量预加载图片
 * @param {Array} urls - 图片URL数组
 * @returns {Promise} 批量预加载Promise
 */
export function preloadImages(urls) {
  return Promise.all(urls.map(url => preloadImage(url)))
}
