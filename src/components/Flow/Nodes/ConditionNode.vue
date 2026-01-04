<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NInput, NPopover } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 本地配置状态
const localConfig = ref<Workflow.ConditionConfig>({
  conditions: props.data.config?.conditions || [],
  defaultTargetNodeId: props.data.config?.defaultTargetNodeId || ''
});

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (newVal) {
      localConfig.value = {
        conditions: newVal.conditions || [],
        defaultTargetNodeId: newVal.defaultTargetNodeId || ''
      };
    }
  },
  { deep: true, immediate: true }
);

// 监听本地配置变化，同步到 Store
watch(
  localConfig,
  newVal => {
    workflowStore.updateNodeConfig(props.id, JSON.parse(JSON.stringify(newVal)));
  },
  { deep: true }
);

// 添加条件
function addCondition() {
  localConfig.value.conditions.push({
    expression: '',
    targetNodeId: ''
  });
}

// 删除条件
function removeCondition(index: number) {
  localConfig.value.conditions.splice(index, 1);
}
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:call-split' }" :hide-source-handle="true">
    <div class="flex flex-col gap-2">
      <div class="text-xs c-gray-5 dark:c-gray-4">根据 JavaScript 表达式的值路由到不同的分支。</div>

      <!-- 条件列表 -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(condition, index) in localConfig.conditions"
          :key="index"
          class="relative flex items-center justify-between rounded bg-gray-50 px-2 py-1.5 transition-colors dark:bg-dark-3 hover:bg-gray-100 dark:hover:bg-dark-4"
        >
          <!-- 表达式编辑 Popover -->
          <NPopover trigger="click" placement="bottom" raw :show-arrow="false">
            <template #trigger>
              <div class="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden">
                <div class="truncate text-sm c-blue-6 font-500 font-mono dark:c-blue-4">
                  {{ condition.expression || '点击配置表达式' }}
                </div>
              </div>
            </template>
            <!-- 详细配置面板 -->
            <div class="w-80 border border-gray-100 rounded-2 bg-white p-4 shadow-xl dark:border-dark-3 dark:bg-dark-2">
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm c-gray-8 font-bold dark:c-gray-1">配置条件表达式</div>
                <NButton text type="error" size="tiny" @click="removeCondition(index)">
                  <template #icon><div class="i-mdi:delete" /></template>
                  删除
                </NButton>
              </div>

              <div class="flex flex-col gap-1">
                <NInput
                  v-model:value="condition.expression"
                  type="textarea"
                  :rows="3"
                  placeholder="例如: state.intent === '问候'"
                  size="small"
                />
                <div class="mt-1 text-xs c-gray-4">可用变量: state.intent, state.userInput</div>
              </div>
            </div>
          </NPopover>

          <!-- 右侧输出点 (Handle) -->
          <Handle
            :id="`condition-${index}`"
            type="source"
            :position="Position.Right"
            class="handle-override !h-3 !w-3 !bg-primary !active:bg-primary"
          />
        </div>

        <!-- 默认分支 (Else) -->
        <div class="relative flex items-center justify-end rounded bg-gray-50 px-2 py-1.5 dark:bg-dark-3">
          <div class="mr-3 text-xs c-gray-5">默认 (Default)</div>
          <Handle id="default" type="source" :position="Position.Right" class="handle-override !h-3 !w-3 !bg-gray-4" />
        </div>
      </div>

      <!-- 添加条件按钮 -->
      <NButton block dashed size="small" class="mt-1" @click="addCondition">
        <template #icon>
          <div class="i-mdi:plus" />
        </template>
        添加条件
      </NButton>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.vue-flow__handle) {
  z-index: 10;
}
.handle-override {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
