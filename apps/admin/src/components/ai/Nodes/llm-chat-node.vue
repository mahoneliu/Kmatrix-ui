<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem, NInputNumber, NSwitch, NTooltip } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据 (仅保留特有配置)
const formModel = reactive({
  historyEnabled: false,
  historyLimit: 10
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (config) {
    formModel.historyEnabled = config.historyEnabled || false;
    formModel.historyLimit = config.historyLimit || 10;
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.LlmNodeConfig | undefined;
    if (
      newValue.historyEnabled !== currentConfig?.historyEnabled ||
      newValue.historyLimit !== currentConfig?.historyLimit
    ) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.LlmNodeConfig | undefined;
    if (config) {
      if (config.historyEnabled !== formModel.historyEnabled || config.historyLimit !== formModel.historyLimit) {
        formModel.historyEnabled = config.historyEnabled || false;
        formModel.historyLimit = config.historyLimit || 10;
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
  <BaseNode v-bind="props" :data="data" class="llm-chat-node">
    <div class="w-93">
      <NCollapse :default-expanded-names="['history']">
        <template #arrow>
          <SvgIcon icon="mdi:play" class="workflow-collapse-icon" />
        </template>

        <!-- 历史对话配置 -->
        <NCollapseItem title="历史对话配置" name="history">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <label class="workflow-label">启用历史对话</label>
                  <NTooltip>
                    <template #trigger>
                      <SvgIcon icon="mdi:information-outline" class="cursor-help text-12px text-gray-400" />
                    </template>
                    开启后，AI 将能够理解对话上下文，保持对话连贯性
                  </NTooltip>
                </div>
                <NSwitch v-model:value="formModel.historyEnabled" size="small" />
              </div>
            </div>

            <div v-if="formModel.historyEnabled" class="workflow-config-item">
              <div class="flex items-center gap-2">
                <span class="workflow-label">历史消息条数</span>
                <NTooltip>
                  <template #trigger>
                    <SvgIcon icon="mdi:information-outline" class="cursor-help text-gray-400" />
                  </template>
                  保留最近N条对话消息，用于上下文记忆，建议设置为 5-20 条
                </NTooltip>
                <NInputNumber
                  v-model:value="formModel.historyLimit"
                  :min="1"
                  :max="50"
                  :step="1"
                  size="small"
                  class="flex-1 workflow-input"
                  placeholder="最近N条消息"
                />
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制 */
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}
</style>
