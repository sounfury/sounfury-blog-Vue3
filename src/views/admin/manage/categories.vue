<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Delete, Edit, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable';
import { getAllCategory, updateCategory, updateCategorySort, deleteCategoryById, addCategory } from '@/api/category';
import gsap from 'gsap'

// 定义分类接口
interface Category {
    id: number
    name: string
    description?: string
    children?: Category[]
    pid?: number
    order?: number
}


const addDragOverClass = (element: HTMLElement) => {
    element.classList.add('drag-over');
    const parentContainer = element.closest('.child-container');
    if (parentContainer) {
        parentContainer.classList.add('drag-over');
    }
};

const removeDragOverClass = () => {
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
};






// 响应式状态管理
const categoryTree = ref<Category[]>([
    {
        id: 1,
        name: '技术分类',
        description: '关于编程和技术的文章',
        order: 1,
        pid: null,
        children: [
            {
                id: 11,
                name: 'Vue',
                description: 'Vue.js 相关文章',
                pid: 1,
                order: 1
            },
            {
                id: 12,
                name: 'React',
                description: 'React 相关文章',
                pid: 1,
                order: 2
            }
        ]
    },
    {
        id: 2,
        pid: null,
        name: '生活分类',
        description: '日常生活和随笔',
        order: 2,
    }
])

// 工具函数：根据 order 排序
const sortCategories = (categories: Category[]): Category[] => {
    return [...categories].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });
};


// 从接口加载分类树
const loadCategories = async () => {
    try {
        const response = await getAllCategory();
        if (response.code === '200') {
            // 转换并排序分类树
            const transformedCategories = response.data.map((category: Category) =>
                transformCategory(category)
            );
            categoryTree.value = sortCategories(transformedCategories);
        } else {
            ElMessage.error('加载分类失败');
        }
    } catch (error) {
        ElMessage.error(`加载分类出错：${error}`);
    }
};


// 工具函数：转换接口数据为分类树格式
const transformCategory = (data: any): Category => {
    const { id, name, description, pid, order, children } = data;
    return {
        id,
        name,
        description,
        pid: pid,
        order: order || 0,
        children: children ? sortCategories(children.map(transformCategory)) : [],
    };
};


// 新增分类对话框相关
const dialogVisible = ref(false)
const currentCategory = reactive<Partial<Category>>({})
const dialogTitle = ref('新增分类')
const isEditMode = ref(false)

// 打开新增/编辑分类对话框
const openCategoryDialog = (category?: Category, isChild = false) => {
    dialogVisible.value = true

    if (category) {
        // 编辑模式
        isEditMode.value = true
        dialogTitle.value = isChild ? '新增子分类' : '编辑分类'
        Object.assign(currentCategory, {
            ...category,
            pid: isChild ? category.id : category.pid,
            order: isChild ? 1 : category.order
        })
    } else {
        // 新增模式
        isEditMode.value = false
        dialogTitle.value = '新增分类'
        Object.assign(currentCategory, {})
    }
}

// 保存分类
const saveCategory = async () => {
    if (!currentCategory.name) {
        ElMessage.error('分类名称不能为空');
        return;
    }

    try {
        // 判断当前操作类型
        const isAddingChildCategory = isEditMode.value && dialogTitle.value === '新增子分类';
        const isEditingCategory = isEditMode.value && dialogTitle.value === '编辑分类';
        const isAddingRootCategory = !isEditMode.value;

        if (isEditingCategory) {
            // 编辑现有分类
            await updateCategory(currentCategory as Category);
            ElMessage.success('分类更新成功');
        } else {
            // 新增分类（包括子分类和顶级分类）
            await addCategory(currentCategory as Category);
            ElMessage.success('分类新增成功');
        }
        
        // 重新加载分类数据
        loadCategories();
    } catch (error) {
        ElMessage.error(`操作失败：${error}`);
    }
    
    dialogVisible.value = false;
};

// 递归查找分类
const findCategoryById = (categories: Category[], id: number): Category | undefined => {
    for (const category of categories) {
        if (category.id === id) return category;
        if (category.children) {
            const found = findCategoryById(category.children, id);
            if (found) return found;
        }
    }
    return undefined;
};

// 删除分类
const deleteCategory = (category: Category) => {
    ElMessageBox.confirm(
        `确定要删除分类 "${category.name}" 吗？${category.children?.length ? '该分类下的子分类也将一并删除' : ''}`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                await deleteCategoryById(category.id);

                // 递归删除分类
                const removeCategory = (categories: Category[]) => {
                    return categories.filter(c => {
                        if (c.id === category.id) return false;
                        if (c.children) {
                            c.children = removeCategory(c.children);
                        }
                        return true;
                    });
                };

                categoryTree.value = removeCategory(categoryTree.value);
                ElMessage.success('分类删除成功');
            } catch (error) {
                ElMessage.error(`删除分类失败：${error}`);
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

// 收集所有分类的排序数据
const collectSortData = (categories: Category[], pid: number | null = null): any[] => {
    let result: any[] = [];
    categories.forEach((category, index) => {
        result.push({
            id: category.id,
            order: index + 1,
            pid: pid
        });

        if (category.children && category.children.length > 0) {
            result = result.concat(collectSortData(category.children, category.id));
        }
    });
    return result;
};

// 拖拽结束处理

// 函数部分
const onDragStart = (evt: any) => {
    document.documentElement.classList.add('dragging');
    const dragItem = evt.item;
    dragItem.classList.add('dragging-item');

    // 添加拖拽事件监听
    document.querySelectorAll('.category-content').forEach(el => {
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            removeDragOverClass();
            addDragOverClass(el as HTMLElement);
        });
    });
};

const onDragEnd = async (evt: any) => {
    document.documentElement.classList.remove('dragging');
    const dragItem = evt.item;
    dragItem.classList.remove('dragging-item');
    removeDragOverClass();

    try {
        const sortData = collectSortData(categoryTree.value);
        await updateCategorySort(sortData);

        gsap.from(evt.item, {
            duration: 0.3,
            scale: 0.95,
            opacity: 0.8,
            ease: 'power2.out'
        });

        ElMessage.success('排序更新成功');
        await loadCategories();
    } catch (error) {
        ElMessage.error(`更新排序失败：${error}`);
    }

    // 移除事件监听
    document.querySelectorAll('.category-content').forEach(el => {
        el.removeEventListener('dragover', () => { });
    });
};

const checkMove = (evt: any) => {
    const dragElement = evt.draggedContext.element;
    const targetElement = evt.relatedContext.element;

    // 阻止将父分类拖入其子分类
    if (targetElement && dragElement.children?.some((child: Category) => child.id === targetElement.id)) {
        return false;
    }

    return true;
};

// 加载分类
loadCategories();
</script>

<template>
    <div class="category-manager p-6 bg-gray-50 min-h-screen">
        <!-- 头部 -->
        <div class="mb-6 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">分类管理</h1>
            <el-button type="primary" class="add-btn" @click="openCategoryDialog()" :icon="Plus">
                添加分类
            </el-button>
        </div>

        <!-- 分类树 -->
        <div class="category-tree bg-white rounded-lg shadow-sm p-4">
            <draggable v-model="categoryTree" :group="{ name: 'categories', pull: true, put: true }"
                @start="onDragStart" @end="onDragEnd" item-key="id" ghost-class="ghost" chosen-class="chosen"
                :move="checkMove" animation="300" :sort="true" class="root-draggable">
                <template #item="{ element }">
                    <div class="category-item group" :data-category-id="element.id">
                        <!-- 分类内容 -->
                        <div
                            class="category-content flex items-center p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                            <el-icon class="handle cursor-move mr-3 text-gray-400">
                                <Folder />
                            </el-icon>

                            <div class="flex-grow">
                                <h3 class="text-lg font-medium text-gray-700">{{ element.name }}</h3>
                                <p class="text-sm text-gray-500">{{ element.description }}</p>
                            </div>

                            <div class="actions opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <el-button-group>
                                    <el-button size="small" @click="openCategoryDialog(element, true)" :icon="Plus"
                                        type="primary" text>
                                        添加子分类
                                    </el-button>
                                    <el-button size="small" @click="openCategoryDialog(element)" :icon="Edit"
                                        type="warning" text>
                                        编辑
                                    </el-button>
                                    <el-button size="small" @click="deleteCategory(element)" :icon="Delete"
                                        type="danger" text>
                                        删除
                                    </el-button>
                                </el-button-group>
                            </div>
                        </div>

                        <!-- 子分类 -->
                        <div :class="['child-container', { 'has-children': element.children?.length }]">
                            <draggable @start="onDragStart" v-model="element.children" :move="checkMove"
                                :group="{ name: 'categories', pull: true, put: true }" @end="onDragEnd" item-key="id"
                                ghost-class="ghost" chosen-class="chosen" animation="300" :sort="true"
                                :class="['child-draggable', { 'empty': !element.children?.length }]">
                                <template #item="{ element: child }">
                                    <div class="category-item group" :data-category-id="child.id">
                                        <div
                                            class="category-content flex items-center p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                                            <el-icon class="handle cursor-move mr-3 text-gray-400">
                                                <Folder />
                                            </el-icon>

                                            <div class="flex-grow">
                                                <h3 class="text-lg font-medium text-gray-700">{{ child.name }}</h3>
                                                <p class="text-sm text-gray-500">{{ child.description }}</p>
                                            </div>

                                            <div
                                                class="actions opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <el-button-group>
                                                    <el-button size="small" @click="openCategoryDialog(child)"
                                                        :icon="Edit" type="warning" text>
                                                        编辑
                                                    </el-button>
                                                    <el-button size="small" @click="deleteCategory(child)"
                                                        :icon="Delete" type="danger" text>
                                                        删除
                                                    </el-button>
                                                </el-button-group>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog v-model="dialogVisible" align-center :title="dialogTitle" width="500px" class="category-dialog">
            <el-form ref="formRef" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="currentCategory.name" placeholder="请输入分类名称" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="currentCategory.description" type="textarea" placeholder="请输入分类描述" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="flex gap-4 justify-end">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveCategory">保存</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<style scoped>

.category-tree {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid #e1e8f0;
}

.category-item {
    margin-bottom: 12px;
}

/* 添加过渡效果 */
.category-content {
    background: white !important;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.category-content::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    opacity: 0.8;
}

/* 为不同层级的分类设置不同的边框颜色 */
.category-item:nth-child(3n+1)>.category-content::before {
    background: #4B70E2 !important;
}

.category-item:nth-child(3n+2)>.category-content::before {
    background: #FF6B6B !important;
}

.category-item:nth-child(3n+3)>.category-content::before {
    background: #4ECDC4 !important;
}

.category-content:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}


.actions {
    opacity: 1 !important;
    background: linear-gradient(to left, white 70%, transparent);
    padding: 8px;
}

.el-button-group .el-button {
    background: white;
    border: 1px solid #e1e8f0;
    margin: 0 4px;
    transition: all 0.3s ease;
}

.el-button-group .el-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}



/* 拖拽时的目标容器高亮样式 */
.drag-over {
    background: #f0f9ff !important;
    border: 2px dashed #409EFF !important;
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.2);
}

/* 调整子分类缩进和视觉提示 */
.child-container {
    position: relative;
    margin-left: 2.5rem;
    padding-left: 1rem;
    border-left: 2px solid #e1e8f0;
}

.child-container::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 12px;
    height: 2px;
    background: #e1e8f0;
}
.child-container.drag-over {
    border-left: 2px dashed #409EFF;
}

/* 空容器的视觉提示 */
.child-draggable.empty {
    min-height: 40px;
    border: 2px dashed #e0e0e0;
    border-radius: 4px;
    margin: 8px 0;
}

.child-draggable.empty.drag-over {
    border: 2px dashed #409EFF;
    background-color: #f0f9ff;
}


.child-container {
    transition: all 0.3s ease;
}

.child-container.has-children {
    padding-left: 2rem;
    /* pl-8 的等效值 */
}

.child-draggable {
    min-height: 10px;
    transition: all 0.3s ease;
}

.child-draggable.empty {
    min-height: 30px;
    border-radius: 4px;
}

.category-manager {
    position: relative;
    background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}
/* 占位符样式 */
.ghost {
    opacity: 0.8;
    background: #f0f9ff !important;
    border: 2px dashed #409EFF !important;
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.2);
}
/* 被选中的元素样式 */
.chosen {
    background: #e6f1fc !important;
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.2);
}

@keyframes showBorder {
    from {
        opacity: 0;
    }

    to {
        opacity: 0.5;
    }
}



/* 子分类拖拽区域样式 */
.child-draggable {
    position: relative;
    min-height: 40px;
}
.child-draggable.empty {
    min-height: 60px;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    margin: 12px 0;
    background: rgba(245, 247, 250, 0.5);
    transition: all 0.3s ease;
}

.child-draggable.empty.drag-over {
    border: 2px dashed #409EFF;
    background: #f0f9ff;
}

/* 分类名称和描述样式优化 */
.category-content h3 {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 4px;
}

.category-content p {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 0;
}

/* 图标样式优化 */
.handle {
    color: #95a5a6;
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

.category-content:hover .handle {
    color: #2c3e50;
}

/* 添加按钮样式 */
.add-btn {
    background: #4B70E2;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(75, 112, 226, 0.3);
}

/* 对话框样式优化 */
:deep(.category-dialog) {
    border-radius: 12px;
}

:deep(.category-dialog .el-dialog__header) {
    border-bottom: 1px solid #e1e8f0;
    padding: 20px;
}

:deep(.category-dialog .el-dialog__body) {
    padding: 24px;
}

:deep(.category-dialog .el-input__inner) {
    border-radius: 8px;
}

:deep(.category-dialog .el-textarea__inner) {
    border-radius: 8px;
}


/* GSAP 动画类 */
.category-enter-active {
    animation: slideDown 0.3s ease-out;
}

.category-leave-active {
    animation: slideUp 0.3s ease-in;
}


@keyframes slideDown {
    from {
        transform: translateY(-20px);
        opacity: 1;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(0);
        opacity: 1;
    }

    to {
        transform: translateY(-20px);
        opacity: 1;
    }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>