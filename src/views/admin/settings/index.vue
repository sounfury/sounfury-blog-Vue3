<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <!-- 系统设置部分 -->
        <div class="mb-8 transform transition-all" ref="systemSection">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">系统设置</h2>
                <div class="space-y-6">
                    <!-- 网站状态 -->
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-medium text-gray-700">网站状态</h3>
                            <p class="text-sm text-gray-500">网站运行状态设置</p>
                        </div>
                        <el-select v-model="systemSettings.site_status" class="w-48">
                            <el-option label="正常运行" value="running" />
                            <el-option label="维护模式" value="maintenance" />
                        </el-select>
                    </div>

                    <!-- 评论模式 -->
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-medium text-gray-700">评论模式</h3>
                            <p class="text-sm text-gray-500">设置网站评论的处理方式</p>
                        </div>
                        <el-select v-model="systemSettings.comment_mode" class="w-48">
                            <el-option label="禁用评论" value="disabled" />
                            <el-option label="需要审核" value="approval" />
                            <el-option label="直接发布" value="direct" />
                        </el-select>
                    </div>

                    <!-- 网站简介 -->
                    <div class="space-y-2">
                        <h3 class="text-lg font-medium text-gray-700">网站简介</h3>
                        <el-input v-model="systemSettings.site_description" type="textarea" :rows="3"
                            placeholder="请输入网站简介" />
                    </div>

                    <!-- 网站公告 -->
                    <div class="space-y-2">
                        <h3 class="text-lg font-medium text-gray-700">网站公告</h3>
                        <el-input v-model="systemSettings.site_notice" type="textarea" :rows="3"
                            placeholder="请输入网站公告" />
                    </div>

                    <!--网站图标-->
                    <div class="space-y-2">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">网站图标</h3>

                        <div class="flex items-center gap-4">
                            <div class="shrink-0" v-if="systemSettings.site_icon">
                                <ImagePreview :src="systemSettings.site_icon" :width="50" :height="50"
                                    class="rounded-lg shadow-sm object-cover" />
                            </div>

                            <el-input v-model="systemSettings.site_icon" class="flex-1 max-w-xl"
                                placeholder="请输入网站图标" />

                            <imageUpload @upload-success="handUpload"
                                class="shrink-0 hover:opacity-90 transition-opacity" />
                        </div>
                    </div>

                    <div class="mt-4 space-y-2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded">
                                <p class="text-sm text-gray-600">上次更新时间：{{ systemSettings.updatedTime }}</p>
                            </div>
                        </div>
                    </div>


                    <div class="flex justify-end">
                        <el-button type="primary" @click="handleSystemSubmit" :loading="systemSubmitting">
                            保存系统设置
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- OSS设置部分 -->
        <div class="" ref="ossSection">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-6 text-gray-800">OSS 设置</h2>
                <el-form ref="ossForm" :model="ossSettings" :rules="ossRules" label-position="top">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <el-form-item label="配置Key" prop="configKey">
                            <el-input v-model="ossSettings.configKey" />
                        </el-form-item>

                        <el-form-item label="AccessKey" prop="accessKey">
                            <el-input v-model="ossSettings.accessKey" show-password />
                        </el-form-item>

                        <el-form-item label="SecretKey" prop="secretKey">
                            <el-input v-model="ossSettings.secretKey" show-password />
                        </el-form-item>

                        <el-form-item label="Bucket名称" prop="bucketName">
                            <el-input v-model="ossSettings.bucketName" />
                        </el-form-item>

                        <el-form-item label="前缀" prop="prefix">
                            <el-input v-model="ossSettings.prefix" />
                        </el-form-item>

                        <el-form-item label="Endpoint" prop="endpoint">
                            <el-input v-model="ossSettings.endpoint" />
                        </el-form-item>

                        <el-form-item label="Domain">
                            <el-input v-model="ossSettings.domain" />
                        </el-form-item>

                        <el-form-item label="Region" prop="region">
                            <el-input v-model="ossSettings.region" />
                        </el-form-item>

                        <el-form-item label="HTTPS">
                            <switchButton v-model="ossSettings.isHttps" :active-value="1" :inactive-value="0" />
                        </el-form-item>

                        <el-form-item label="访问策略">
                            <switchButton v-model="ossSettings.accessPolicy" :active-value="1" :inactive-value="0" />
                        </el-form-item>
                    </div>

                    <div class="mt-4 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded">
                                <p class="text-sm text-gray-600">上次更新时间：{{ ossSettings.updateTime }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end mt-6">
                        <el-button type="primary" @click="handleOssSubmit" :loading="ossSubmitting">
                            保存OSS设置
                        </el-button>
                    </div>

                </el-form>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSettingList, updateSetting, getOssSetting, updateOssSetting } from '@/api/setting';
import gsap from 'gsap';
import { ElMessage } from 'element-plus';
import switchButton from '@/components/buttons/switch-button.vue';
import imageUpload from '@/components/upload/image-upload.vue';
import ImagePreview from '@/components/imagePreview/index.vue';
const systemSection = ref(null);
const ossSection = ref(null);
const systemSettings = ref({});
const ossSettings = ref({
    configKey: '',
    accessKey: '',
    secretKey: '',
    bucketName: '',
    prefix: '',
    endpoint: '',
    domain: '',
    region: '',
    isHttps: 0,
    accessPolicy: 0,


});
const systemSubmitting = ref(false);
const ossSubmitting = ref(false);
const ossForm = ref(null);

// OSS表单验证规则
const ossRules = {
    configKey: [
        { required: true, message: '配置key不能为空', trigger: 'blur' },
        { min: 2, max: 100, message: 'configKey长度必须介于2和100之间', trigger: 'blur' }
    ],
    accessKey: [
        { required: true, message: 'accessKey不能为空', trigger: 'blur' }
    ],
    secretKey: [
        { required: true, message: 'secretKey不能为空', trigger: 'blur' }
    ],
    bucketName: [
        { required: true, message: 'bucketName不能为空', trigger: 'blur' }
    ],
    endpoint: [
        { required: true, message: 'endpoint不能为空', trigger: 'blur' }
    ],
    region: [
        { required: true, message: '地域不能为空', trigger: 'blur' }
    ]
};

// 初始化动画
const initAnimation = () => {
    gsap.from(systemSection.value, {
        opacity: 0,
        y: 20,
        duration: 0.6
    });
    gsap.from(ossSection.value, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2
    });
};

// 获取设置数据
const fetchSettings = async () => {
    try {
        const [settingRes, ossRes] = await Promise.all([
            getSettingList(),
            getOssSetting()
        ]);

        if (settingRes.success) {
            const settingsMap = {};
            let updatedTime = '';
            settingRes.data.forEach(item => {
                settingsMap[item.configKey] = item.configValue;
                console.log(item);
                if (item.updatedTime > updatedTime) {
                    updatedTime = item.updatedTime;
                }
            });
            settingsMap['updatedTime'] = updatedTime;
            console.log(settingsMap);
            systemSettings.value = settingsMap;
        }

        if (ossRes.success) {
            ossSettings.value = ossRes.data;
        }
    } catch (error) {
        ElMessage.error('获取设置信息失败');
    }
};

//处理上传结果
const handUpload = (url) => {
    console.log(url);
    systemSettings.value.site_icon = url;
};

import useSettings from '@/store/modules/settings';


// 提交系统设置
const handleSystemSubmit = async () => {
    systemSubmitting.value = true;
    try {
        const settings = Object.entries(systemSettings.value).map(([key, value]) => ({
            configKey: key,
            configValue: value
        }));
        await updateSetting(settings);
        ElMessage.success('系统设置更新成功');
        useSettings().clearCache();
    } catch (error) {
        ElMessage.error('系统设置更新失败');
    } finally {
        systemSubmitting.value = false;
    }
};

// 提交OSS设置
const handleOssSubmit = async () => {
    if (!ossForm.value) return;

    await ossForm.value.validate(async (valid) => {
        if (valid) {
            ossSubmitting.value = true;
            try {
                await updateOssSetting(ossSettings.value);
                ElMessage.success('OSS设置更新成功');
            } catch (error) {
                ElMessage.error('OSS设置更新失败');
            } finally {
                ossSubmitting.value = false;
            }
        }
    });
};



onMounted(() => {
    fetchSettings();
    initAnimation();
});
</script>

<style lang="scss" scoped>
.el-select {
    width: 200px;
}

:deep(.el-form-item__label) {
    @apply text-gray-700 font-medium;
}

:deep(.el-input__wrapper) {
    @apply shadow-sm;
}

:deep(.el-button--primary) {
    @apply bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700;
}
</style>