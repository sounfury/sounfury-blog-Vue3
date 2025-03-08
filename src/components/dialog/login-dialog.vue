<template>
    <el-dialog align-center id="login-dialog-114514">
        <div class="wrapper">
            <div class="card-switch">
                <div class="card-side"></div>
                <div class="flip-card__inner" 
                    ref="cardRef"
                    @mousedown="startDrag"
                    @mousemove="onDrag"
                    @mouseup="endDrag"
                    @mouseleave="endDrag"
                    :style="{ transform: `rotateY(${rotation}deg)` }">
                    <div class="flip-card__front">
                        
                        <div class="title">登录</div>

                        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="flip-card__form"
                            @submit.prevent="loginHandler">
                            <el-form-item prop="username">
                                <el-input v-model="loginForm.username" placeholder="用户名" class="flip-card__input"
                                    clearable></el-input>
                            </el-form-item>

                            <el-form-item prop="password">
                                <el-input v-model="loginForm.password" type="password" placeholder="密码"
                                    show-password class="flip-card__input"></el-input>
                            </el-form-item>

                            <el-form-item prop="code" >
                                <div class="captcha-container">
                                    <el-input v-model="loginForm.code" placeholder="验证码" class="flip-card__input captcha-input"
                                    style="" clearable></el-input>
                                <img :src="captchaImg" @click="refreshCaptcha" class="captcha-img" alt="验证码">


                                </div>
                            </el-form-item>

                            <el-button native-type="submit" class="flip-card__btn">
                                确定
                            </el-button>
                        </el-form>
                    </div>

                    <div class="flip-card__back "v-if="allowRegister">
                        <div class="title">注册</div>
                        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules"
                            class="flip-card__form" @submit.prevent="registerHandler">
                            <el-form-item prop="name">
                                <el-input v-model="registerForm.name" placeholder="账号" class="flip-card__input"
                                    clearable></el-input>
                            </el-form-item>

                            <el-form-item prop="mail">
                                <el-input v-model="registerForm.mail" placeholder="邮箱" type="email"
                                    class="flip-card__input" clearable></el-input>
                            </el-form-item>

                            <el-form-item prop="password">
                                <el-input v-model="registerForm.password" type="password" placeholder="密码"
                                    show-password class="flip-card__input"></el-input>
                            </el-form-item>

                            <el-form-item prop="confirmPassword">
                                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                                    show-password class="flip-card__input"></el-input>
                            </el-form-item>

                            <el-button native-type="submit" class="flip-card__btn">
                                确定
                            </el-button>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue"
import { login, register,getCodeImg } from "@/api/login"
import { ElMessage } from "element-plus"
import useUserStore from "@/store/modules/user"

// Form refs
const loginFormRef = ref()
const registerFormRef = ref()
const allowRegister = ref(false)

// 移除 isSignup ref，改用 rotation
const rotation = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const cardRef = ref(null)

// User store
const userStore = useUserStore()

// Login form and validation
const loginForm = reactive({
    username: "",
    password: "",
    code: "",
    uuid: ""
})
// Login rules
const loginRules = reactive({
    username: [
        {
            required: true,
            message: "请输入用户名",
            trigger: 'blur'
        },
        {
            min: 3,
            max: 20,
            message: "用户名长度必须在3到20个字符之间",
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: "请输入密码",
            trigger: 'blur'
        },
        {
            min: 8,
            message: "密码长度至少为8个字符",
            trigger: 'blur'
        }
    ],
    code: [
        {
            required: true,
            message: "请输入验证码",
            trigger: 'blur'
        },
        {
            min: 1,
            max: 40,
            message: "验证码长度必须在1-4位之间",
            trigger: 'blur'
        }
    ]
})

// Register form and validation
const registerForm = reactive({
    name: "",
    mail: "",
    password: "",
    confirmPassword: ""
})

// Register rules
const registerRules = reactive({
    name: [
        {
            required: true,
            message: "请输入账号名",
            trigger: 'blur'
        },
        {
            min: 2,
            max: 20,
            message: "姓名长度必须在2到20个字符之间",
            trigger: 'blur'
        }
    ],
    mail: [
        {
            required: true,
            message: "请输入邮箱",
            trigger: 'blur'
        },
        {
            type: 'email',
            message: "请输入有效的邮箱地址",
            trigger: ['blur', 'change']
        }
    ],
    password: [
        {
            required: true,
            message: "请输入密码",
            trigger: 'blur'
        },
        {
            min: 8,
            message: "密码长度至少为8个字符",
            trigger: 'blur'
        },
    ],
    confirmPassword: [
        {
            required: true,
            message: "请确认密码",
            trigger: 'blur'
        },
        {
            validator: (rule, value, callback) => {
                if (value !== registerForm.password) {
                    callback(new Error("密码不匹配"))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
})

// 验证码相关
const captchaImg = ref('')
let refreshTimer = null

// 获取验证码
const getCaptcha = async () => {
    try {
        const res = await getCodeImg()
        if (res.code === '200') {
            captchaImg.value = 'data:image/jpeg;base64,' + res.data.img
            loginForm.uuid = res.data.uuid
        }
    } catch (error) {
        ElMessage.error('获取验证码失败')
    }
}

// 刷新验证码
const refreshCaptcha = () => {
    getCaptcha()
    loginForm.code = ''
}

// 组件挂载时获取验证码
onMounted(() => {
    getCaptcha()
    // 60秒自动刷新验证码
    refreshTimer = setInterval(() => {
        getCaptcha()
    }, 60000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
})

const emit = defineEmits([]);

import { useRouter } from "vue-router";
const router = useRouter();
// Login handler
const loginHandler = async () => {
    // 首先验证表单
    await loginFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                await userStore.login(loginForm)
                await userStore.c
                ElMessage.success("登录成功")
                //关闭对话框
                emit('update:modelValue', false)
                //刷新页面
                router.go(0);

            } catch (error) {
                ElMessage.error(error.message || "登录失败")
            }
        }
    })
}

// Register handler
const registerHandler = async () => {
    await registerFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 在发送到后端之前删除确认密码
                const { confirmPassword, ...registerData } = registerForm
                await register(registerData)
                ElMessage.success("注册成功")

                // 可选：自动切换到登录或登录用户
            

            } catch (error) {
                ElMessage.error(error.message || "注册失败")
            }
        }
    })
}

const startDrag = (e) => {
    isDragging.value = true
    startX.value = e.clientX
}

const onDrag = (e) => {
    if (!isDragging.value) return
    
    const deltaX = e.clientX - startX.value
    const newRotation = deltaX * 0.5 // 调整灵敏度
    
    // 限制旋转角度在0-180度之间
    rotation.value = Math.max(0, Math.min(180, newRotation))
}

const endDrag = () => {
    if (!isDragging.value) return
    isDragging.value = false
    
    // 根据当前旋转角度决定是否完成翻转
    if (rotation.value > 90) {
        rotation.value = 180 // 完成翻转到注册面
    } else {
        rotation.value = 0 // 回到登录面
    }
}

</script>


<style>
#login-dialog-114514{
    padding: 0;
    /* 去掉内部 padding */
    border: none;
    /* 去掉边框 */
    box-shadow: none;
    /* 去掉阴影 */
    background: none;
    /* 去掉背景颜色 */
}
</style>

<style scoped>
:deep().el-form-item__error {
    padding-top: 5px;
}

.wrapper {
    --input-focus: #2d8cf0;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --bg-color-alt: #666;
    --main-color: #323232;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

}
/* switch card */
.card-side::before {
    display: none;
}

.card-side::after {
    display: none;
}

.flip-card__inner {
    width: 300px;
    height: 350px;
    position: relative;
    background-color: transparent;
    perspective: 1000px;
    text-align: center;
    transition: transform 0.3s ease;
    transform-style: preserve-3d;
    cursor: grab;
}

.flip-card__front,
.flip-card__back {
    padding: 20px;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background: lightgrey;
    gap: 20px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    height: 100%;
}

.flip-card__back {
    width: 100%;
    transform: rotateY(180deg);
}

.flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.title {
    margin-top: 40px;
    font-size: 25px;
    font-weight: 900;
    text-align: center;
    color: var(--main-color);
}

.flip-card__input {
    width: 250px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
}

.flip-card__input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
}

.flip-card__input:focus {
    border: 2px solid var(--input-focus);
}

.flip-card__btn:active,
.button-confirm:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
}

.flip-card__btn {
    margin: 20px 0 20px 0;
    width: 120px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 17px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
    background-color: var(--bg-color) !important;
    border: 2px solid var(--main-color) !important;
    box-shadow: 4px 4px var(--main-color) !important;
    color: var(--font-color) !important;
}


.flip-card__input {
    /* Ensure Element Plus inputs match original design */
    --el-input-bg-color: var(--bg-color);
    --el-input-border-color: var(--main-color);
    --el-input-text-color: var(--font-color);
    --el-input-placeholder-color: var(--font-color-sub);
}

:deep().el-input__wrapper {
    background-color: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
}

/* Hide default Element Plus input border and add custom styling */
/* :deep().el-form-item {
    margin-bottom: 20px;
}


:deep().el-input__inner {
    height: 40px !important;
    border: 2px solid var(--main-color) !important;
    box-shadow: 4px 4px var(--main-color) !important;
    border-radius: 5px !important;
    padding: 5px 10px !important;
    font-size: 15px !important;
    width: 100%;
    font-weight: 600 !important;
    color: var(--font-color) !important;
}

:deep().el-input__inner:focus {
    border-color: var(--input-focus) !important;
} */

.captcha-container {
    display: flex;
    gap: 20px;
}

.captcha-input {
  width: 50%;
}

.captcha-img {
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    cursor: pointer;
    width: 40%;
}
</style>