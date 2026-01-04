<script setup lang="ts">
import { computed, watch } from 'vue';
import { NForm, NFormItem, NInput } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 表单数据绑定到节点配置
const formModel = computed({
  get: () => {
    const config = props.data.config as Workflow.AppInfoConfig | undefined;
    return {
      appName: config?.appName || '',
      description: config?.description || '',
      icon: config?.icon || '',
      prologue: config?.prologue || ''
    };
  },
  set: value => {
    workflowStore.updateNodeConfig(props.id, value);
  }
});

// 监听表单变化,自动更新节点配置
watch(
  formModel,
  newValue => {
    workflowStore.updateNodeConfig(props.id, newValue);
  },
  { deep: true }
);
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
