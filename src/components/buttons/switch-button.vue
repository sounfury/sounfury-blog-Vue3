<template>
    <div class="checkbox-wrapper-5" @click="toggleSwitch" :class="{ 'disabled': isDisabled }" :style="componentStyles">
        <div class="check" :style="checkStyles">
            <input type="checkbox" :checked="isChecked" :id="checkId" :disabled="isDisabled" @change="toggleSwitch" />
            <label :for="checkId"></label>
        </div>
        <span class="switch-text" :style="textStylesComputed">
            {{ displayText }}
        </span>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, watch, defineEmits } from 'vue';

const props = defineProps({
    // 支持任意类型的值
    activeValue: {
        type: null,
        default: true,
    },
    inactiveValue: {
        type: null,
        default: false,
    },
    modelValue: {
        type: null,
        default: null,
    },
    activeText: {
        type: String,
        default: '开启',
    },
    inactiveText: {
        type: String,
        default: '关闭',
    },
    onChange: {
        type: Function,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    size: {
        type: Number,
        default: 30,
        validator: (value) => value > 0
    },
    activeColor: {
        type: String,
        default: '#1890ff',
    },
    inactiveColor: {
        type: String,
        default: 'linear-gradient(90deg, #f19af3, #f099b5)',
    },
    activeTextColor: {
        type: String,
        default: null,
    },
    inactiveTextColor: {
        type: String,
        default: 'inherit',
    }
});

const emit = defineEmits(['update:modelValue']);

// 使用 modelValue 来决定初始状态
const isChecked = computed({
    get: () => props.modelValue === props.activeValue,
    set: (val) => {
        const newValue = val ? props.activeValue : props.inactiveValue;
        emit('update:modelValue', newValue);
    }
});

const checkId = `check-${Math.random().toString(36).substr(2, 9)}`;

// 计算整体组件样式，包括按钮和文本
const componentStyles = computed(() => ({
    '--size': `${props.size}px`,
    '--toggle-width': `${props.size * 2.2}px`,
    '--toggle-height': `${props.size}px`,
    '--thumb-size': `${props.size * 0.8}px`,
    '--text-size': `${props.size * 0.5}px`,
    '--margin-left': `${props.size * 0.2}px`
}));

const checkStyles = computed(() => ({
    background: isChecked.value ? props.activeColor : props.inactiveColor,
}));

const textStylesComputed = computed(() => {
    const textColor = isChecked.value
        ? (props.activeTextColor || props.activeColor)
        : props.inactiveTextColor;

    return {
        color: textColor,
    };
});

const displayText = computed(() =>
    isChecked.value ? props.activeText : props.inactiveText
);

const isDisabled = computed(() => props.disabled);

// 监听变化并触发回调
watch(isChecked, (newValue) => {
    if (props.onChange) {
        props.onChange(newValue ? props.activeValue : props.inactiveValue);
    }
});

const toggleSwitch = () => {
    if (!props.disabled) {
        isChecked.value = !isChecked.value;
    }
};
</script>

<style scoped>
.checkbox-wrapper-5 {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-wrapper-5.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.checkbox-wrapper-5 .check {
    position: relative;
    line-height: 0;
    perspective: 400px;
}

.checkbox-wrapper-5 .check input[type="checkbox"],
.checkbox-wrapper-5 .check label,
.checkbox-wrapper-5 .check label::before,
.checkbox-wrapper-5 .check label::after,
.checkbox-wrapper-5 .check {
    appearance: none;
    display: inline-block;
    border-radius: var(--size);
    border: 0;
    transition: .35s ease-in-out;
    box-sizing: border-box;
    cursor: pointer;
}

.checkbox-wrapper-5 .check label {
    width: var(--toggle-width);
    height: var(--toggle-height);
    background: #d7d7d7;
    overflow: hidden;
}

.checkbox-wrapper-5 .check input[type="checkbox"] {
    position: absolute;
    z-index: 1;
    width: var(--thumb-size);
    height: var(--thumb-size);
    top: calc((var(--size) - var(--thumb-size)) / 2);
    left: calc((var(--size) - var(--thumb-size)) / 2);
    background: linear-gradient(45deg, #dedede, #ffffff);
    box-shadow: 0 6px 7px rgba(0, 0, 0, 0.3);
    outline: none;
    margin: 0;
}

.checkbox-wrapper-5 .check input[type="checkbox"]:checked {
    left: calc(var(--toggle-width) - var(--thumb-size) - (var(--size) - var(--thumb-size)) / 2);
}

.checkbox-wrapper-5 .check input[type="checkbox"]:checked+label {
    background: transparent;
}

.checkbox-wrapper-5 .check label::before,
.checkbox-wrapper-5 .check label::after {
    content: "· ·";
    position: absolute;
    overflow: hidden;
    left: calc(.15 * var(--size));
    top: calc(.5 * var(--size));
    height: var(--size);
    letter-spacing: calc(-0.04 * var(--size));
    color: #9b9b9b;
    font-family: "Times New Roman", serif;
    z-index: 2;
    font-size: calc(.6 * var(--size));
    border-radius: 0;
    transform-origin: 0 0 calc(-0.5 * var(--size));
    backface-visibility: hidden;
}

.checkbox-wrapper-5 .check label::after {
    content: "●";
    top: calc(.65 * var(--size));
    left: calc(.2 * var(--size));
    height: calc(.1 * var(--size));
    width: calc(.35 * var(--size));
    font-size: calc(.2 * var(--size));
    transform-origin: 0 0 calc(-0.4 * var(--size));
}

.checkbox-wrapper-5 .check input[type="checkbox"]:checked+label::before,
.checkbox-wrapper-5 .check input[type="checkbox"]:checked+label::after {
    left: calc(1.55 * var(--size));
    top: calc(.4 * var(--size));
    line-height: calc(.1 * var(--size));
    transform: rotateY(360deg);
}

.checkbox-wrapper-5 .check input[type="checkbox"]:checked+label::after {
    height: calc(.16 * var(--size));
    top: calc(.55 * var(--size));
    left: calc(1.6 * var(--size));
    font-size: calc(.6 * var(--size));
    line-height: 0;
}

.switch-text {
    user-select: none;
    font-size: var(--text-size);
    line-height: var(--size);
    margin-left: var(--margin-left);
}
</style>