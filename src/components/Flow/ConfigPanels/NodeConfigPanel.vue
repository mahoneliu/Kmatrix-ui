<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { NSpin } from 'naive-ui';
import { useWorkflowStore } from '@/store/modules/workflow';

const workflowStore = useWorkflowStore();

// 当前选中的节点
const selectedNode = computed(() => workflowStore.selectedNode);

// 动态加载配置组件
const configComponent = computed(() => {
  if (!selectedNode.value || !selectedNode.value.data) return null;

  const nodeType = selectedNode.value.data.type as Workflow.NodeType;

  const componentMap: Record<Workflow.NodeType, () => Promise<any>> = {
    APP_INFO: () => import('./AppInfoNodeConfig.vue'),
    START: () => import('./StartNodeConfig.vue'),
    END: () => import('./EndNodeConfig.vue'),
    LLM_CHAT: () => import('./LlmChatNodeConfig.vue'),
    INTENT_CLASSIFIER: () => import('./IntentClassifierNodeConfig.vue'),
    CONDITION: () => import('./ConditionNodeConfig.vue'),
    FIXED_RESPONSE: () => import('./FixedResponseNodeConfig.vue')
  };

  return componentMap[nodeType] ? defineAsyncComponent(componentMap[nodeType]) : null;
});

// 节点标题
const nodeTitle = computed(() => {
  if (!selectedNode.value || !selectedNode.value.data) return '';
  return selectedNode.value.data.label || '节点配置';
});

// 更新节点配置
function handleUpdateConfig(config: Record<string, any>) {
  if (selectedNode.value) {
    workflowStore.updateNodeConfig(selectedNode.value.id, config);
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-dark-1">
    <div v-if="!selectedNode" class="flex flex-1 items-center justify-center">
      <div class="text-center c-gray-4 dark:c-gray-5">
        <div class="i-mdi:cursor-default-click mb-2 text-4xl" />
        <div>请选择节点进行配置</div>
      </div>
    </div>

    <div v-else class="flex flex-col flex-1 overflow-hidden">
      <!-- 节点标题 -->
      <div class="b-b b-gray-2 b-solid px-4 py-3 dark:b-dark-3">
        <div class="text-base c-gray-8 font-bold dark:c-gray-1">{{ nodeTitle }}</div>
        <div class="mt-1 text-xs c-gray-5 dark:c-gray-4">ID: {{ selectedNode.id }}</div>
      </div>

      <!-- 配置表单 -->
      <div class="flex-1 overflow-y-auto p-4">
        <NSpin v-if="!configComponent" :show="true">
          <div class="h-40" />
        </NSpin>
        <component :is="configComponent" v-else :node="selectedNode" @update="handleUpdateConfig" />
      </div>
    </div>
  </div>
</template>
