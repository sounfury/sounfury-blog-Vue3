<template>
    <div 
        class="persona-card"
        :class="[{ 'persona-card-enabled': persona.enabled, 'persona-card-disabled': !persona.enabled }, { 'compact': compact }]"
        v-motion :initial="{ opacity: 0, y: 20, scale: 0.9 }" 
        :enter="{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.random() * 200 } }"
        @click="$emit('select', persona)"
    >
        <!-- 卡片状态指示器 -->
        <div class="persona-card-status">
            <el-tag :type="persona.enabled ? 'success' : 'info'" size="small">
                {{ persona.enabled ? '已启用' : '已禁用' }}
            </el-tag>
        </div>

        <!-- 角色封面 -->
        <div class="persona-card-cover">
            <img 
                :src="persona.cardCover || '/default-avatar.png'"
                :alt="persona.name"
                class="persona-card-image"
                @error="handleImageError"
            />

            <!-- 紧凑模式下，仅显示名字带渐变条 -->
            <div v-if="compact" class="persona-name-ribbon">
                <span class="name-text">{{ persona.name }}</span>
            </div>

            <div v-else class="persona-card-overlay">
                <div class="persona-card-actions">
                    <el-button type="primary" circle size="small" @click.stop="$emit('edit', persona)">
                        <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button 
                        :type="persona.enabled ? 'warning' : 'success'" 
                        circle 
                        size="small" 
                        @click.stop="$emit('toggle-status', persona)"
                    >
                        <el-icon>
                            <component :is="persona.enabled ? 'VideoPause' : 'VideoPlay'" />
                        </el-icon>
                    </el-button>
                    <el-button type="danger" circle size="small" @click.stop="$emit('delete', persona)">
                        <el-icon><Delete /></el-icon>
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 非紧凑模式下保留信息区块 -->
        <div v-if="!compact" class="persona-card-info">
            <h3 class="persona-card-title">{{ persona.name }}</h3>
            <p class="persona-card-description">{{ persona.description || '暂无描述' }}</p>
            <div class="persona-card-meta">
                <div class="persona-card-char-name">
                    <el-icon class="mr-1"><User /></el-icon>
                    {{ persona.charName || '未设置' }}
                </div>
                <div class="persona-card-date">
                    <el-icon class="mr-1"><Clock /></el-icon>
                    {{ formatDate(persona.createdAt) }}
                </div>
            </div>
        </div>
    </div>
    
</template>

<script setup lang="ts">
import { Edit, Delete, Clock, User, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import type { PersonaItem } from '@/api/ai'

// Props
defineProps<{
    persona: PersonaItem
    compact?: boolean
}>()

// Emits
defineEmits<{
    edit: [persona: PersonaItem]
    delete: [persona: PersonaItem]
    'toggle-status': [persona: PersonaItem]
    select: [persona: PersonaItem]
}>()

// 方法
const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = ''
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
</script>

<style lang="scss" scoped>
// 角色卡片样式
.persona-card {
    position: relative;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    height: 360px;

    &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        
        .persona-card-overlay {
            opacity: 1;
        }
    }

    // 启用状态的卡片
    &.persona-card-enabled {
        border: 2px solid #f59e0b;
        box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);

        &:hover {
            box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
            z-index: 10;
        }
    }

    // 禁用状态的卡片
    &.persona-card-disabled {
        border: 2px solid #d1d5db;
        opacity: 0.8;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #9ca3af, #d1d5db, #9ca3af);
            z-index: 10;
        }
    }
}

// 紧凑模式（卡面大图 + 底部名字Ribbon）
.persona-card.compact {
    height: 360px;
}

.persona-name-ribbon {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 14px 18px;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%);
    display: flex;
    align-items: flex-end;
}

.persona-name-ribbon .name-text {
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 6px rgba(0,0,0,0.45);
}

// 卡片状态指示器
.persona-card-status {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
}

// 角色封面
.persona-card-cover {
    position: relative;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.persona-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

// 卡片悬停遮罩
.persona-card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.3) 50%,
        rgba(0, 0, 0, 0.7) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.persona-card-actions {
    display: flex;
    gap: 12px;
}

// 角色信息区域
.persona-card-info {
    padding: 20px;
    height: 160px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.persona-card-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.persona-card-description {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 12px 0;
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.persona-card-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: #9ca3af;
}

.persona-card-char-name,
.persona-card-date {
    display: flex;
    align-items: center;
}

// 动画效果
@keyframes glow {
    0% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2); }
    50% { box-shadow: 0 4px 30px rgba(245, 158, 11, 0.4); }
    100% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2); }
}

.persona-card-enabled:hover {
    animation: glow 2s infinite;
}

// 响应式设计
@media (max-width: 480px) {
    .persona-card {
        height: 360px;
    }

    .persona-card-cover {
        height: 200px;
    }

    .persona-card-info {
        height: 160px;
        padding: 16px;
    }
}
</style>
