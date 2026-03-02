<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import VariableMention from '@/components/ai/Nodes/add-in/variable-mention.vue';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据
const formModel = reactive<Workflow.EndConfig>({
  isCustomResponse: false,
  customResponse: ''
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.EndConfig | undefined;
  if (config) {
    formModel.isCustomResponse = config.isCustomResponse || false;
    formModel.customResponse = config.customResponse || '';
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.EndConfig | undefined;
    if (
      newValue.customResponse !== currentConfig?.customResponse ||
      newValue.isCustomResponse !== currentConfig?.isCustomResponse
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
    const config = newConfig as Workflow.EndConfig | undefined;
    if (config) {
      if (config.customResponse !== formModel.customResponse) {
        formModel.customResponse = config.customResponse || '';
      }
      if (config.isCustomResponse !== formModel.isCustomResponse) {
        formModel.isCustomResponse = config.isCustomResponse || false;
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
  <BaseNode v-bind="props" :data="data">
    <div class="w-93">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem :title="$t('ai.workflow_template.base_config')" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item flex-1">
              <div class="mb-1 flex items-center gap-1">
                <span class="mb-0 workflow-label">{{ $t('ai.workflow_node.specify_reply_content') }}</span>
                <NTooltip trigger="hover">
                  <template #trigger>
                    <span class="inline-flex items-center">
                      <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-4 c-gray-4" />
                    </span>
                  </template>
                  {{ $t('ai.workflow_node.if_specify_reply_content_it_is_final_output') }}
                  <br />
                  {{ $t('ai.workflow_node.override_final_response') }}
                </NTooltip>
              </div>

              <VariableMention
                v-model:model-value="formModel.customResponse"
                :node-id="id"
                :rows="2"
                :placeholder="$t('ai.workflow_node.input_end_node_content')"
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
  min-width: 380px !important;
  max-width: 380px;
}
</style>
