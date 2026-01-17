<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem, NInput } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据
const formModel = reactive<Workflow.EndConfig>({
  extraResponse: ''
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.EndConfig | undefined;
  if (config) {
    formModel.extraResponse = config.extraResponse || '';
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.EndConfig | undefined;
    if (newValue.extraResponse !== currentConfig?.extraResponse) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.EndConfig | undefined;
    if (config && config.extraResponse !== formModel.extraResponse) {
      formModel.extraResponse = config.extraResponse || '';
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data">
    <div class="w-90">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon icon="mdi:play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem title="基础配置" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">回复内容</label>
              <NInput
                v-model:value="formModel.extraResponse"
                class="workflow-textarea"
                type="textarea"
                :rows="2"
                placeholder="输入结束节点的回复额外文本内容..."
              />
              <div class="mt-1 rounded bg-gray-50 p-2 text-12px c-gray-5 dark:bg-gray-800">
                <div class="mb-1 font-500">支持对输入参数替换，如 { 参数名XX }</div>
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
  min-width: 380px !important;
  max-width: 380px;
}
</style>
