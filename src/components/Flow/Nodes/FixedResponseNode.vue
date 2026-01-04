<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NForm, NFormItem, NInput } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据
const formModel = reactive<Workflow.FixedResponseConfig>({
  content: ''
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.FixedResponseConfig | undefined;
  if (config) {
    formModel.content = config.content || '';
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.FixedResponseConfig | undefined;
    if (newValue.content !== currentConfig?.content) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.FixedResponseConfig | undefined;
    if (config && config.content !== formModel.content) {
      formModel.content = config.content || '';
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:message-text' }" class="fixed-response-node">
    <div class="w-80 p-3">
      <NForm :model="formModel" label-placement="top" size="small" :show-feedback="false">
        <NFormItem label="回复内容">
          <NInput v-model:value="formModel.content" type="textarea" :rows="4" placeholder="输入固定的回复文本内容..." />
        </NFormItem>
      </NForm>

      <div class="mt-2 text-xs text-gray-500">
        <div class="mb-1 font-bold">支持变量替换:</div>
        <ul class="list-disc list-inside">
          <li>
            <code>{`{userInput}`}</code>
            - 用户输入
          </li>
          <li>
            <code>{`{sessionId}`}</code>
            - 会话 ID
          </li>
        </ul>
      </div>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制 */
:deep(.workflow-node) {
  min-width: 350px !important;
  max-width: 380px;
}
</style>
