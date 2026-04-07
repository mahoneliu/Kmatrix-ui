<script setup lang="ts">
/**
 * 文件解析节点配置
 * 允许用户指定特定的解析方式（EtlHandler）
 *
 * @author Mahone
 * @date 2026-04-05
 */
import { onMounted, reactive, watch } from 'vue';
import { NSelect, NTooltip } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 解析方式选项
const processTypeOptions = [
  { label: $t('ai.workflow_node.unknown'), value: null as any },
  { label: $t('ai.workflow_node.process_type_generic'), value: 'GENERIC_FILE' },
  { label: $t('ai.workflow_node.process_type_qa'), value: 'QA_PAIR' },
  { label: $t('ai.workflow_node.process_type_online'), value: 'ONLINE_DOC' },
  { label: $t('ai.workflow_node.process_type_web'), value: 'WEB_LINK' }
];

// 局部表单数据
const formModel = reactive<Workflow.FileParseConfig>({
  processType: undefined
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.FileParseConfig | undefined;
  if (config) {
    formModel.processType = config.processType;
  }
}

// 监听解析方式变化，同步到 Store
watch(
  () => formModel.processType,
  () => {
    syncToStore();
  }
);

function syncToStore() {
  const currentConfig = props.data.config as Workflow.FileParseConfig | undefined;
  if (formModel.processType !== currentConfig?.processType) {
    workflowStore.updateNodeConfig(props.id, { ...formModel });
  }
}

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.FileParseConfig | undefined;
    if (config && config.processType !== formModel.processType) {
      formModel.processType = config.processType;
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="file-parse-node">
    <div class="w-93">
      <div class="workflow-config-section">
        <div class="workflow-config-item">
          <div class="mb-1 flex-y-center gap-1">
            <label class="mb-0 workflow-label">{{ $t('ai.workflow_node.process_type') }}</label>
            <NTooltip trigger="hover">
              <template #trigger>
                <SvgIcon icon="ant-design:question-circle-outlined" class="cursor-help text-gray-400" />
              </template>
              {{ $t('ai.workflow_node.process_type_desc') }}
            </NTooltip>
          </div>
          <NSelect
            v-model:value="formModel.processType"
            :options="processTypeOptions"
            clearable
            size="small"
            :placeholder="$t('ai.workflow_node.unknown')"
          />
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 300px !important;
}
</style>
