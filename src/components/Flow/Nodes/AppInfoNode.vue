<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NSelect, NTabPane, NTabs } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据，避免直接与 Store 双向绑定导致的循环更新
const formModel = reactive<Workflow.AppInfoConfig>({
  appName: '',
  description: '',
  icon: '',
  prologue: '',
  globalParams: []
});

// 参数类型选项
const paramTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' }
];

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.AppInfoConfig | undefined;
  if (config) {
    formModel.appName = config.appName || '';
    formModel.description = config.description || '';
    formModel.icon = config.icon || '';
    formModel.prologue = config.prologue || '';
    formModel.globalParams = config.globalParams || [];
  }
}

// 添加全局参数
function addGlobalParam() {
  if (!formModel.globalParams) {
    formModel.globalParams = [];
  }
  formModel.globalParams.push({
    key: `param${formModel.globalParams.length + 1}`,
    label: '新参数',
    type: 'string',
    required: false,
    defaultValue: ''
  });
}

// 删除全局参数
function removeGlobalParam(index: number) {
  formModel.globalParams?.splice(index, 1);
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    // 检查是否有实际变化, 避免不必要的 Store 更新
    const currentConfig = props.data.config as Workflow.AppInfoConfig | undefined;
    const hasChanged =
      newValue.appName !== currentConfig?.appName ||
      newValue.description !== currentConfig?.description ||
      newValue.icon !== currentConfig?.icon ||
      newValue.prologue !== currentConfig?.prologue ||
      JSON.stringify(newValue.globalParams) !== JSON.stringify(currentConfig?.globalParams);

    if (hasChanged) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化 (如 DSL 加载时), 同步到局部表单
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.AppInfoConfig | undefined;
    if (config) {
      // 只有当外部数据真的与当前表单不同时才更新，防止循环
      const hasChanged =
        config.appName !== formModel.appName ||
        config.description !== formModel.description ||
        config.icon !== formModel.icon ||
        config.prologue !== formModel.prologue ||
        JSON.stringify(config.globalParams) !== JSON.stringify(formModel.globalParams);

      if (hasChanged) {
        formModel.appName = config.appName || '';
        formModel.description = config.description || '';
        formModel.icon = config.icon || '';
        formModel.prologue = config.prologue || '';
        formModel.globalParams = config.globalParams || [];
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:information' }" class="app-info-node">
    <div class="w-96 p-2">
      <NTabs type="line" size="small">
        <!-- 基础信息标签页 -->
        <NTabPane name="basic" tab="基础信息">
          <NForm :model="formModel" label-placement="top" size="small">
            <NFormItem label="应用名称" path="appName">
              <NInput v-model:value="formModel.appName" placeholder="请输入应用名称" />
            </NFormItem>
            <NFormItem label="应用描述" path="description">
              <NInput v-model:value="formModel.description" type="textarea" :rows="2" placeholder="请输入应用描述" />
            </NFormItem>
            <NFormItem label="应用图标" path="icon">
              <NInput v-model:value="formModel.icon" placeholder="请输入图标URL" />
            </NFormItem>
            <NFormItem label="开场白" path="prologue">
              <NInput v-model:value="formModel.prologue" type="textarea" :rows="3" placeholder="请输入开场白" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <!-- 全局参数标签页 -->
        <NTabPane name="params" tab="全局参数">
          <div class="flex flex-col gap-2">
            <div class="text-xs c-gray-5">全局参数可在所有节点中使用，用于配置工作流级别的变量。</div>

            <!-- 参数列表 -->
            <div v-if="formModel.globalParams && formModel.globalParams.length > 0" class="flex flex-col gap-2">
              <div
                v-for="(param, index) in formModel.globalParams"
                :key="index"
                class="border border-gray-2 rounded p-2 dark:border-dark-3"
              >
                <div class="mb-2 flex items-center justify-between">
                  <div class="text-sm font-500">参数 {{ index + 1 }}</div>
                  <NButton text type="error" size="tiny" @click="removeGlobalParam(index)">
                    <template #icon>
                      <div class="i-mdi:delete" />
                    </template>
                    删除
                  </NButton>
                </div>

                <NForm :model="param" label-placement="left" size="small" label-width="60">
                  <NFormItem label="参数键">
                    <NInput v-model:value="param.key" placeholder="paramKey" />
                  </NFormItem>
                  <NFormItem label="显示名称">
                    <NInput v-model:value="param.label" placeholder="参数名称" />
                  </NFormItem>
                  <NFormItem label="数据类型">
                    <NSelect v-model:value="param.type" :options="paramTypeOptions" />
                  </NFormItem>
                  <NFormItem label="默认值">
                    <NInput v-model:value="param.defaultValue" placeholder="默认值" />
                  </NFormItem>
                  <NFormItem label="描述">
                    <NInput v-model:value="param.description" type="textarea" :rows="2" placeholder="参数描述" />
                  </NFormItem>
                </NForm>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="py-4 text-center text-xs c-gray-4">暂无全局参数，点击下方按钮添加</div>

            <!-- 添加按钮 -->
            <NButton block dashed size="small" @click="addGlobalParam">
              <template #icon>
                <div class="i-mdi:plus" />
              </template>
              添加全局参数
            </NButton>
          </div>
        </NTabPane>
      </NTabs>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制,允许更宽 */
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}
</style>
