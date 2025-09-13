<template>
    <el-dialog
        :title="isEdit ? '编辑角色' : '创建角色'"
        :model-value="modelValue"
        width="800px"
        :close-on-click-modal="false"
        append-to-body
        class="folio-dialog"
        @update:model-value="$emit('update:modelValue', $event)"
        @close="resetForm"
    >
        <el-form 
            :model="personaForm" 
            :rules="personaRules" 
            ref="personaFormRef" 
            label-width="100px"
            class="folio-form"
            label-position="top"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <!-- 左侧：基本信息 -->
                <div class="space-y-4">
                    <el-form-item label="角色名称" prop="name">
                        <el-input v-model="personaForm.name" placeholder="请输入角色名称" />
                    </el-form-item>

                    <el-form-item label="角色描述" prop="description">
                        <el-input 
                            v-model="personaForm.description" 
                            type="textarea" 
                            :rows="3"
                            placeholder="请输入角色描述"
                        />
                    </el-form-item>

                    <el-form-item label="角色封面" prop="cardCover">
                        <ImageUpload
                            v-model="personaForm.cardCover"
                            :size="100"
                        />
                        <div class="text-sm text-gray-400 mt-2">
                            建议尺寸：400x600px
                        </div>
                    </el-form-item>
                </div>

                <!-- 右侧：角色卡信息 -->
                <div class="space-y-4">
                    <el-form-item label="角色人设" prop="card.charPersona">
                        <el-input 
                            v-model="personaForm.card.charPersona" 
                            type="textarea" 
                            :rows="4"
                            placeholder="请描述角色的性格、特点、背景等"
                        />
                    </el-form-item>

                    <el-form-item label="世界设定" prop="card.worldScenario">
                        <el-input 
                            v-model="personaForm.card.worldScenario" 
                            type="textarea" 
                            :rows="3"
                            placeholder="请描述角色所在的世界背景"
                        />
                    </el-form-item>

                    <el-form-item label="开场白" prop="card.charGreeting">
                        <el-input 
                            v-model="personaForm.card.charGreeting" 
                            type="textarea" 
                            :rows="2"
                            placeholder="角色的第一句话"
                        />
                    </el-form-item>
                </div>
            </div>
             <el-form-item label="示例对话" prop="card.exampleDialogue" class="col-span-2 mt-4">
                <el-input 
                    v-model="personaForm.card.exampleDialogue" 
                    type="textarea" 
                    :rows="3"
                    placeholder="角色的对话示例"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="flex justify-end space-x-3">
                <button class="folio-dialog-btn is-cancel" @click="$emit('update:modelValue', false)">取消</button>
                <button class="folio-dialog-btn is-confirm" @click="handleSubmit" :disabled="submitting">
                    <span v-if="submitting">保存中...</span>
                    <span v-else>{{ isEdit ? '更新' : '创建' }}</span>
                </button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import ImageUpload from '@/components/upload/image-upload.vue';
import {
    createPersona,
    updatePersona,
    type PersonaDetail,
    type CreatePersonaCommand,
    type UpdatePersonaCommand,
} from '@/api/ai';
import { cloneDeep } from 'lodash-es';

const props = defineProps<{
    modelValue: boolean;
    isEdit: boolean;
    personaData?: PersonaDetail | null;
}>();

const emit = defineEmits(['update:modelValue', 'onSuccess']);

const submitting = ref(false);
const personaFormRef = ref<FormInstance>();

const initialFormState: CreatePersonaCommand = {
    name: '',
    description: '',
    cardCover: '',
    card: {
        charName: '',
        charPersona: '',
        worldScenario: '',
        charGreeting: '',
        exampleDialogue: ''
    }
};

const personaForm = reactive<CreatePersonaCommand>(cloneDeep(initialFormState));

const personaRules: FormRules = {
    name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 1, max: 100, message: '长度为1-100个字符', trigger: 'blur' }
    ],
    'card.charPersona': [
        { required: true, message: '请输入角色人设描述', trigger: 'blur' }
    ]
};

watch(() => personaForm.name, (newName) => {
    personaForm.card.charName = newName;
});

const resetForm = () => {
    Object.assign(personaForm, cloneDeep(initialFormState));
    personaFormRef.value?.clearValidate();
};

watch(() => props.personaData, (newData) => {
    if (props.isEdit && newData) {
        Object.assign(personaForm, {
            name: newData.name,
            description: newData.description,
            cardCover: newData.cardCover,
            card: {
                charName: newData.card.charName,
                charPersona: newData.card.charPersona,
                worldScenario: newData.card.worldScenario,
                charGreeting: newData.card.charGreeting,
                exampleDialogue: newData.card.exampleDialogue
            }
        });
    } else {
        resetForm();
    }
}, { immediate: true, deep: true });

const handleSubmit = async () => {
    if (!personaFormRef.value) return;

    try {
        await personaFormRef.value.validate();
        submitting.value = true;

        if (props.isEdit && props.personaData) {
            const updateData: UpdatePersonaCommand = {
                personaId: props.personaData.personaId,
                ...personaForm
            };
            await updatePersona(props.personaData.personaId, updateData);
            ElMessage.success('角色更新成功');
        } else {
            await createPersona(personaForm);
            ElMessage.success('角色创建成功');
        }

        emit('onSuccess');
        emit('update:modelValue', false);
    } catch (error) {
        // Validation will throw, so no need for specific error messages here
    } finally {
        submitting.value = false;
    }
};
</script>

<style lang="scss">
.folio-dialog {
    --folio-gold: #b8860b;
    --folio-border-color: #e0d9c8;
    --folio-bg-light: #f9f8f4;
    
    background-color: var(--folio-bg-light);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 1px solid var(--folio-border-color);

    .el-dialog__header {
        padding: 24px 32px 16px;
        border-bottom: 1px solid var(--folio-border-color);
        margin-right: 0;

        .el-dialog__title {
            font-family: 'Times New Roman', Times, serif;
            font-size: 1.5rem;
            color: #333;
        }

        .el-dialog__headerbtn {
            font-size: 20px;
            .el-icon {
                transition: all 0.3s ease;
            }
            &:hover .el-icon {
                color: var(--folio-gold);
                transform: rotate(90deg);
            }
        }
    }

    .el-dialog__body {
        padding: 24px 32px;
    }

    .el-dialog__footer {
        padding: 16px 32px 24px;
        border-top: 1px solid var(--folio-border-color);
    }

    .folio-form {
        .el-form-item__label {
            font-family: 'Times New Roman', Times, serif;
            color: #555;
            font-size: 1rem;
            margin-bottom: 8px !important;
        }

        .el-input__wrapper, .el-textarea__inner {
            background-color: #fff;
            border: 1px solid var(--folio-border-color);
            box-shadow: none !important;
            border-radius: 8px;
            padding: 8px 12px;
            transition: all 0.3s ease;

             &:hover {
                border-color: var(--folio-gold);
            }
            &.is-focus {
                border-color: var(--folio-gold);
            }
        }
        
        .el-textarea__inner {
            min-height: 80px;
        }
    }
}

.folio-dialog-btn {
    padding: 8px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;

    &.is-cancel {
        background-color: transparent;
        border: 1px solid var(--folio-border-color);
        color: #666;
        &:hover {
            border-color: var(--folio-gold);
            color: var(--folio-gold);
        }
    }

    &.is-confirm {
        background-color: var(--folio-gold);
        color: white;
        border: 1px solid var(--folio-gold);
        &:hover {
            background-color: #a7770a;
            border-color: #a7770a;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(184, 134, 11, 0.2);
        }
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
</style>
