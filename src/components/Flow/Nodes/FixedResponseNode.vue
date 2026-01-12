<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem, NInput } from 'naive-ui';
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
    <div class="w-95 p-2">
      <NCollapse :default-expanded-names="['config']">
        <!-- 基础配置 -->
        <NCollapseItem title="基础配置" name="config">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-12px font-500">
                回复内容
                <span class="ml-0.5 c-red-5">*</span>
              </label>
              <NInput
                v-model:value="formModel.content"
                type="textarea"
                :rows="4"
                placeholder="输入固定的回复文本内容..."
              />
              <div class="mt-1 rounded bg-gray-50 p-2 text-11px c-gray-5 dark:bg-gray-800">
                <div class="mb-1 font-500">支持变量替换:</div>
                <ul class="list-disc pl-5">
                  <li class="my-0.5">
                    <code class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-700">{userInput}</code>
                    - 用户输入
                  </li>
                  <li class="my-0.5">
                    <code class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-700">{sessionId}</code>
                    - 会话 ID
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 400px !important;
  max-width: 400px;
}
</style>
