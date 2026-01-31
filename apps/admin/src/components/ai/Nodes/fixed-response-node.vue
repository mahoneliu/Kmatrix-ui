<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import VariableMention from '@/components/ai/Nodes/add-in/variable-mention.vue';
import BaseNode from './base-node.vue';

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
    <div class="w-93">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon icon="mdi:play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem title="基础配置" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item flex-1">
              <div class="mb-1 flex items-center gap-1">
                <span class="mb-0 workflow-label">指定回复内容</span>
                <span class="workflow-label-required">*</span>
                <NTooltip trigger="hover">
                  <template #trigger>
                    <span class="inline-flex items-center">
                      <SvgIcon icon="mdi:information-outline" class="cursor-help text-4 c-gray-4" />
                    </span>
                  </template>
                  该节点可以汇合各节点参数，定义特定的内容端，可以通过输入/来引用输入参数的值。
                  <br />
                  例如：${start.userName},你好。
                </NTooltip>
              </div>
              <VariableMention
                v-model:model-value="formModel.content"
                :node-id="id"
                :rows="2"
                placeholder="输入指定的回复文本内容 (输入 / 选择变量)"
              />
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
