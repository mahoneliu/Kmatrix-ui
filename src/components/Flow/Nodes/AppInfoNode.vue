<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NForm, NFormItem, NInput } from 'naive-ui';
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
  prologue: ''
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.AppInfoConfig | undefined;
  if (config) {
    formModel.appName = config.appName || '';
    formModel.description = config.description || '';
    formModel.icon = config.icon || '';
    formModel.prologue = config.prologue || '';
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    // 检查是否有实际变化, 避免不必要的 Store 更新
    const currentConfig = props.data.config as Workflow.AppInfoConfig | undefined;
    if (
      newValue.appName !== currentConfig?.appName ||
      newValue.description !== currentConfig?.description ||
      newValue.icon !== currentConfig?.icon ||
      newValue.prologue !== currentConfig?.prologue
    ) {
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
      if (
        config.appName !== formModel.appName ||
        config.description !== formModel.description ||
        config.icon !== formModel.icon ||
        config.prologue !== formModel.prologue
      ) {
        formModel.appName = config.appName || '';
        formModel.description = config.description || '';
        formModel.icon = config.icon || '';
        formModel.prologue = config.prologue || '';
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
    <div class="w-64 p-2">
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
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制,允许更宽 */
:deep(.workflow-node) {
  min-width: 300px !important;
  max-width: 320px;
}
</style>
