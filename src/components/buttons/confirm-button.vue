<template>
    <div class="container">
        <a href="#" class="button type--C" :style="buttonStyles">
            <div class="button__line"></div>
            <div class="button__line"></div>
            <span class="button__text">
                <slot></slot>
            </span>
            <div class="button__drow1"></div>
            <div class="button__drow2"></div>
        </a>
    </div>
</template>

<script setup>


/**
 * scale: 缩放比例,默认0.5
 * width: 按钮宽度,默认120px width = 240 * scale
height = 56 * scale     height = 56 * scale
 * height: 按钮高度,默认28px
 * 计算时必须严格对齐，比如width:240, height:56, scale:就是1
 * 
 */

const props = defineProps({
    width: {
        type: String,
        default: '240px'
    },
    height: {
        type: String,
        default: '56px'
    },
    scale: {
        type: Number,
        default: 1
    },

});

const buttonStyles = computed(() => ({
    '--width': props.width,
    '--height': props.height,
    '--scale': props.scale,
    '--border-width': `${3 * props.scale}px`,
    '--letter-spacing': `${2 * props.scale}px`,
    '--hover-letter-spacing': `${6 * props.scale}px`,
    '--font-size': `${14 * props.scale}px`,
}));
</script>

<style lang="scss" scoped>
/* 颜色变量保持不变 */
.type--A {
    --line_color: #555555;
    --back_color: #ffecf6;
}

.type--B {
    --line_color: #1b1919;
    --back_color: #e9ecff;
}

.type--C {
    --line_color: #00135c;
    --back_color: #defffa;
}

.button {
    position: relative;
    z-index: 0;
    width: var(--width);
    height: var(--height);
    text-decoration: none;
    font-size: var(--font-size);
    font-weight: bold;
    color: var(--line_color);
    letter-spacing: var(--letter-spacing);
    transition: all 0.3s ease;
}

.button__text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.button::before,
.button::after,
.button__text::before,
.button__text::after {
    content: "";
    position: absolute;
    height: var(--border-width);
    border-radius: calc(2px * var(--scale));
    background: var(--line_color);
    transition: all 0.5s ease;
}

.button::before {
    top: 0;
    left: calc(54px * var(--scale));
    width: calc((100% - 56px * 2 - 16px) * var(--scale));
}

.button::after {
    top: 0;
    right: calc(54px * var(--scale));
    width: calc(8px * var(--scale));
}

.button__text::before {
    bottom: 0;
    right: calc(54px * var(--scale));
    width: calc((100% - 56px * 2 - 16px) * var(--scale));
}

.button__text::after {
    bottom: 0;
    left: calc(54px * var(--scale));
    width: calc(8px * var(--scale));
}

.button__line {
    position: absolute;
    top: 0;
    width: calc(56px * var(--scale));
    height: 100%;
    overflow: hidden;
}

.button__line::before {
    content: "";
    position: absolute;
    top: 0;
    width: 150%;
    height: 100%;
    box-sizing: border-box;
    border-radius: calc(300px * var(--scale));
    border: solid var(--border-width) var(--line_color);
}

.button__line:nth-child(1),
.button__line:nth-child(1)::before {
    left: 0;
}

.button__line:nth-child(2),
.button__line:nth-child(2)::before {
    right: 0;
}

.button:hover {
    letter-spacing: var(--hover-letter-spacing);
}

.button:hover::before,
.button:hover .button__text::before {
    width: calc(8px * var(--scale));
}

.button:hover::after,
.button:hover .button__text::after {
    width: calc((100% - 56px * 2 - 16px) * var(--scale));
}

.button__drow1,
.button__drow2 {
    position: absolute;
    z-index: -1;
    border-radius: calc(16px * var(--scale));
    transform-origin: calc(16px * var(--scale)) calc(16px * var(--scale));
}

.button__drow1 {
    top: calc(-16px * var(--scale));
    left: calc(40px * var(--scale));
    width: calc(32px * var(--scale));
    height: 0;
    transform: rotate(30deg);
}

.button__drow2 {
    top: calc(44px * var(--scale));
    left: calc(77px * var(--scale));
    width: calc(32px * var(--scale));
    height: 0;
    transform: rotate(-127deg);
}

.button__drow1::before,
.button__drow1::after,
.button__drow2::before,
.button__drow2::after {
    content: "";
    position: absolute;
}

.button__drow1::before {
    bottom: 0;
    left: 0;
    width: 0;
    height: calc(32px * var(--scale));
    border-radius: calc(16px * var(--scale));
    transform-origin: calc(16px * var(--scale)) calc(16px * var(--scale));
    transform: rotate(-60deg);
}

.button__drow1::after {
    top: calc(-10px * var(--scale));
    left: calc(45px * var(--scale));
    width: 0;
    height: calc(32px * var(--scale));
    border-radius: calc(16px * var(--scale));
    transform-origin: calc(16px * var(--scale)) calc(16px * var(--scale));
    transform: rotate(69deg);
}

.button__drow2::before {
    bottom: 0;
    left: 0;
    width: 0;
    height: calc(32px * var(--scale));
    border-radius: calc(16px * var(--scale));
    transform-origin: calc(16px * var(--scale)) calc(16px * var(--scale));
    transform: rotate(-146deg);
}

.button__drow2::after {
    bottom: calc(26px * var(--scale));
    left: calc(-40px * var(--scale));
    width: 0;
    height: calc(32px * var(--scale));
    border-radius: calc(16px * var(--scale));
    transform-origin: calc(16px * var(--scale)) calc(16px * var(--scale));
    transform: rotate(-262deg);
}

.button__drow1,
.button__drow1::before,
.button__drow1::after,
.button__drow2,
.button__drow2::before,
.button__drow2::after {
    background: var(--back_color);
}

/* 动画关键帧需要根据缩放比例调整 */
@keyframes drow1 {
    0% {
        height: 0;
    }

    100% {
        height: calc(100px * var(--scale));
    }
}

@keyframes drow2 {
    0% {
        width: 0;
        opacity: 0;
    }

    10% {
        opacity: 0;
    }

    11% {
        opacity: 1;
    }

    100% {
        width: calc(120px * var(--scale));
    }
}

@keyframes drow3 {
    0% {
        width: 0;
    }

    100% {
        width: calc(80px * var(--scale));
    }
}

@keyframes drow4 {
    0% {
        height: 0;
    }

    100% {
        height: calc(120px * var(--scale));
    }
}

@keyframes drow5 {
    0% {
        width: 0;
    }

    100% {
        width: calc(124px * var(--scale));
    }
}

/* 动画应用保持不变 */
.button:hover .button__drow1 {
    animation: drow1 ease-in 0.06s;
    animation-fill-mode: forwards;
}

.button:hover .button__drow1::before {
    animation: drow2 linear 0.08s 0.06s;
    animation-fill-mode: forwards;
}

.button:hover .button__drow1::after {
    animation: drow3 linear 0.03s 0.14s;
    animation-fill-mode: forwards;
}

.button:hover .button__drow2 {
    animation: drow4 linear 0.06s 0.2s;
    animation-fill-mode: forwards;
}

.button:hover .button__drow2::before {
    animation: drow3 linear 0.03s 0.26s;
    animation-fill-mode: forwards;
}

.button:hover .button__drow2::after {
    animation: drow5 linear 0.06s 0.32s;
    animation-fill-mode: forwards;
}

.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.button:not(:last-child) {
    margin-bottom: calc(64px * var(--scale));
}
</style>