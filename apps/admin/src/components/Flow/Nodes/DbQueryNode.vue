<script setup lang="ts">
/**
 * 数据库查询节点
 * 结合LLM分析用户问题并执行SQL查询
 *
 * @author Mahone
 * @date 2026-01-20
 */
import { onMounted, reactive, watch } from 'vue';
import { NCollapse, NCollapseItem, NInput, NInputNumber, NSelect } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import { useDataSource } from '@/composables/useDataSource';
import ModelSelector from '@/components/ai/ModelSelector.vue';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 使用 composable 统一管理数据源
const { dataSourceOptions, loadDataSources } = useDataSource();

// 局部表单数据
const formModel = reactive<Workflow.DbQueryNodeConfig>({
  dataSourceId: null as any,
  modelId: null as any,
  maxRows: 100,
  tableWhitelist: '',
  tableBlacklist: ''
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.DbQueryNodeConfig | undefined;
  if (config) {
    formModel.dataSourceId = (config.dataSourceId || null) as any;
    formModel.modelId = (config.modelId || null) as any;
    formModel.maxRows = config.maxRows || 100;
    formModel.tableWhitelist = config.tableWhitelist || '';
    formModel.tableBlacklist = config.tableBlacklist || '';
  }
}

// 监听局部表单变化，同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.DbQueryNodeConfig | undefined;
    if (
      newValue.dataSourceId !== currentConfig?.dataSourceId ||
      newValue.modelId !== currentConfig?.modelId ||
      newValue.maxRows !== currentConfig?.maxRows ||
      newValue.tableWhitelist !== currentConfig?.tableWhitelist ||
      newValue.tableBlacklist !== currentConfig?.tableBlacklist
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
    const config = newConfig as Workflow.DbQueryNodeConfig | undefined;
    if (config) {
      if (
        config.dataSourceId !== formModel.dataSourceId ||
        config.modelId !== formModel.modelId ||
        config.maxRows !== formModel.maxRows ||
        config.tableWhitelist !== formModel.tableWhitelist ||
        config.tableBlacklist !== formModel.tableBlacklist
      ) {
        formModel.dataSourceId = (config.dataSourceId || null) as any;
        formModel.modelId = (config.modelId || null) as any;
        formModel.maxRows = config.maxRows || 100;
        formModel.tableWhitelist = config.tableWhitelist || '';
        formModel.tableBlacklist = config.tableBlacklist || '';
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
  <BaseNode v-bind="props" :data="data" class="db-query-node">
    <div class="w-93">
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
              <label class="workflow-label">
                LLM模型
                <span class="workflow-label-required">*</span>
              </label>
              <ModelSelector v-model:model-value="formModel.modelId" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">最大返回行数</label>
              <NInputNumber v-model:value="formModel.maxRows" :min="1" :max="10000" placeholder="100" size="small" />
            </div>
          </div>
        </NCollapseItem>

        <!-- 高级配置 -->
        <NCollapseItem title="高级配置" name="advanced">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">表白名单</label>
              <NInput v-model:value="formModel.tableWhitelist" placeholder="允许查询的表,逗号分隔" size="small" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">表黑名单</label>
              <NInput v-model:value="formModel.tableBlacklist" placeholder="禁止查询的表,逗号分隔" size="small" />
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
