<script setup lang="ts">
/**
 * SQL执行节点
 * 执行SQL语句并返回查询结果
 *
 * @author Mahone
 * @date 2026-01-24
 */
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem, NInputNumber, NSelect } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useDataSource } from '@/composables/ai/workflow/use-data-source';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 使用 composable 统一管理数据源
const { dataSourceOptions, loadDataSources } = useDataSource();

// 局部表单数据
const formModel = reactive<Workflow.SqlExecuteNodeConfig>({
  dataSourceId: null as any,
  maxRows: 100
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.SqlExecuteNodeConfig | undefined;
  if (config) {
    formModel.dataSourceId = (config.dataSourceId || null) as any;
    formModel.maxRows = config.maxRows || 100;
  }
}

// 监听局部表单变化，同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.SqlExecuteNodeConfig | undefined;
    if (newValue.dataSourceId !== currentConfig?.dataSourceId || newValue.maxRows !== currentConfig?.maxRows) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.SqlExecuteNodeConfig | undefined;
    if (config) {
      if (config.dataSourceId !== formModel.dataSourceId || config.maxRows !== formModel.maxRows) {
        formModel.dataSourceId = (config.dataSourceId || null) as any;
        formModel.maxRows = config.maxRows || 100;
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
  loadDataSources();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="sql-execute-node">
    <div class="w-80">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon icon="mdi:play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem title="基础配置" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">
                数据源
                <span class="workflow-label-required">*</span>
              </label>
              <NSelect
                v-model:value="formModel.dataSourceId"
                :options="dataSourceOptions"
                placeholder="选择数据源"
                size="small"
              />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">最大返回行数</label>
              <NInputNumber v-model:value="formModel.maxRows" :min="1" :max="10000" placeholder="100" size="small" />
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
  min-width: 380px !important;
  max-width: 420px;
}
</style>
