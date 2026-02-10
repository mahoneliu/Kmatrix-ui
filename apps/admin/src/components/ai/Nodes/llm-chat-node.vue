<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NInputNumber, NSwitch, NTooltip } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import BaseNode from './base-node.vue';
import VariableMention from './add-in/variable-mention.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据 (仅保留特有配置)
const formModel = reactive({
  historyEnabled: false,
  historyLimit: 10
});

// 用户提示词 (独立管理)
const userPrompt = ref<string>('');

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (config) {
    formModel.historyEnabled = config.historyEnabled || false;
    formModel.historyLimit = config.historyLimit || 10;
    userPrompt.value = config.userPrompt || `已知信息：\${chatContext}\n问题：\${userInput}`;
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

// 监听用户提示词变化
watch(userPrompt, newValue => {
  const currentConfig = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (newValue !== currentConfig?.userPrompt) {
    workflowStore.updateNodeConfig(props.id, { userPrompt: newValue });
  }
});

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
      if (config.userPrompt !== userPrompt.value) {
        userPrompt.value = config.userPrompt || '';
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});

// 处理配置变更
function handleConfigChange() {
  // VariableMention 组件会自动触发 update:model-value
}
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="llm-chat-node">
    <div class="w-93">
      <NCollapse :default-expanded-names="['history']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>

        <!-- 对话配置 -->
        <NCollapseItem title="对话配置" name="history">
          <div class="workflow-config-section">
            <!-- 用户提示词 -->
            <div class="workflow-config-item">
              <div class="flex items-center gap-1">
                <span class="workflow-label">用户提示词</span>
                <NTooltip>
                  <template #trigger>
                    <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
                  </template>
                  用户向大模型提出的具体问题或指令,输入 / 选择变量
                </NTooltip>
              </div>
            </div>
            <div>
              <VariableMention
                v-model:model-value="userPrompt"
                class="text-xs"
                :node-id="props.id"
                :rows="2"
                placeholder="例如:请帮我分析这个问题... (输入 / 选择变量)"
                @update:model-value="handleConfigChange"
              />
            </div>

            <!-- 历史对话配置 -->
            <div class="workflow-config-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <label class="workflow-label">启用历史对话</label>
                  <NTooltip>
                    <template #trigger>
                      <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
                    </template>
                    开启后,AI 将能够理解对话上下文,保持对话连贯性
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
                    <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-gray-400" />
                  </template>
                  保留最近N条对话消息,用于上下文记忆,建议设置为 5-20 条
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

:deep(.n-input__textarea-el),
:deep(.n-input__placeholder) {
  font-size: 12px;
}
</style>
