<template>
    <div class="folio-card-wrapper">
        <div 
            class="folio-card"
            @click="$emit('select', persona)"
        >
            <img :src="persona.cardCover || '/default-avatar.png'" :alt="persona.name" class="card-background-img" />
            <div class="card-overlay"></div>
            <div class="card-border"></div>

            <h3 class="card-title-floating">{{ persona.name }}</h3>

            <!-- 操作按钮 -->
            <div class="card-actions">
                <button @click.stop="$emit('toggle-status', persona)" class="action-btn">
                     <el-icon>
                        <component :is="persona.enabled ? 'VideoPause' : 'VideoPlay'" />
                    </el-icon>
                </button>
                <button @click.stop="$emit('delete', persona)" class="action-btn is-delete">
                    <el-icon><Delete /></el-icon>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PersonaItem } from '@/api/ai';
import { Delete, VideoPause, VideoPlay } from '@element-plus/icons-vue';

defineProps<{
    persona: PersonaItem
}>();

defineEmits(['select', 'edit', 'delete', 'toggle-status']);
</script>

<style scoped lang="scss">
.folio-card-wrapper {
    position: relative;
    perspective: 1000px;
}

.folio-card {
    --gold-color: #d4af37;
    --gold-darker: #b8860b;
    --card-bg: #ffffff;
    --text-color: #333;
    --text-muted: #777;
    --border-color: #e0d9c8;
    --border-width: 1px;

    position: relative;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    transform-style: preserve-3d;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    aspect-ratio: 2.5 / 3.5;
    background-color: #eee;

    &:hover {
        transform: translateY(-10px) scale(1.05);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
}

.card-background-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.folio-card:hover .card-background-img {
    transform: scale(1.1);
}

.card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%);
    z-index: 1;
}

.card-border {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: var(--border-width) solid transparent;
    background: linear-gradient(145deg, var(--gold-color), var(--gold-darker)) border-box;
    -webkit-mask: 
        linear-gradient(#fff 0 0) padding-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    z-index: 2;
    pointer-events: none;
    opacity: 0.6;
    transition: opacity 0.3s ease;
}

.folio-card:hover .card-border {
    opacity: 1;
}

.card-title-floating {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 2;
    font-family: 'Times New Roman', Times, serif;
    font-size: 1.6rem;
    font-weight: bold;
    color: white;
    text-align: left;
    text-shadow: 0 2px 5px rgba(0,0,0,0.8);
}

.card-actions {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(1px);
    display: flex;
    flex-direction: row;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 3;
}

.folio-card:hover .card-actions {
    opacity: 1;
}

.action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.6);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    
    &:hover {
        background: var(--gold-darker);
        border-color: var(--gold-darker);
        transform: scale(1.1);
    }

    &.is-delete:hover {
        background-color: #c0392b;
        border-color: #c0392b;
    }
}
</style>
