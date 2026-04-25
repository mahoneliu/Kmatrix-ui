<script setup lang="ts">
/**
 * SQL生成节点
 * 使用LLM分析用户问题并生成SQL语句
 *
 * @author Mahone
 * @date 2026-01-24
 */
import { onMounted } from 'vue';
import { NCollapse, NCollapseItem, NInput, NSelect } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useDataSource } from '@/composables/ai/data-source/use-data-source';
import { useAiNodeConfig } from '@/composables/ai/workflow/use-ai-node';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();

// 使用 composable 统一管理数据源
const { dataSourceOptions, loadDataSources } = useDataSource();

// 使用通用 AI 节点配置 composable
const { formModel, initData } = useAiNodeConfig(props.id, () => props.data, {
  dataSourceId: null as any,
  tableWhitelist: '',
  tableBlacklist: ''
});

onMounted(() => {
  initData();
  loadDataSources();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="sql-generate-node">
    <div class="w-93">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem :title="$t('ai.workflow_template.base_config')" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">
                {{ $t('ai.workflow_node.data_source') }}
                <span class="workflow-label-required">*</span>
              </label>
              <NSelect
                v-model:value="formModel.dataSourceId"
                :options="dataSourceOptions"
                :placeholder="$t('ai.workflow_node.select_datasource')"
                size="small"
              />
            </div>
          </div>
        </NCollapseItem>

        <!-- 高级配置 -->
        <NCollapseItem :title="$t('ai.workflow_template.advanced_config')" name="advanced">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">{{ $t('ai.workflow_node.table_whitelist') }}</label>
              <NInput
                v-model:value="formModel.tableWhitelist"
                :placeholder="$t('ai.workflow_node.allowed_query_tables')"
                size="small"
              />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">{{ $t('ai.workflow_node.table_blacklist') }}</label>
              <NInput
                v-model:value="formModel.tableBlacklist"
                :placeholder="$t('ai.workflow_node.forbidden_query_tables')"
                size="small"
              />
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
