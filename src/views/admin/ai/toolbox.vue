<template>
  <div class="toolbox-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工具箱</span>
        </div>
      </template>
      <el-table :data="toolList" v-loading="loading">
        <el-table-column prop="name" label="工具名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="className" label="类名" />
        <el-table-column prop="methodName" label="方法名" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getToolList, updateToolState, type ToolInfo } from "@/api/ai"
import { ElMessage } from "element-plus"

const toolList = ref<ToolInfo[]>([])
const loading = ref(true)

const fetchToolList = async () => {
  loading.value = true
  try {
    const res = await getToolList()
    toolList.value = res.data.tools
  } catch (error) {
    ElMessage.error("获取工具列表失败")
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (tool: ToolInfo) => {
  try {
    await updateToolState({
      toolName: tool.name,
      enabled: tool.enabled,
    })
    ElMessage.success("状态更新成功")
  } catch (error) {
    ElMessage.error("状态更新失败")
    // Revert the change on error
    tool.enabled = !tool.enabled
  }
}

onMounted(() => {
  fetchToolList()
})
</script>

<style scoped lang="scss">
.toolbox-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
