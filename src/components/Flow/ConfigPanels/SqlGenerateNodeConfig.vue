<script setup lang="ts">
/**
 * SQL 生成节点配置面板
 * @author Mahone
 * @date 2026-01-24
 */
import { onMounted, ref, watch } from 'vue';
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui';
import type { Node } from '@vue-flow/core';
import { useDataSource } from '@/composables/useDataSource';
import ModelSelector from '@/components/ai/ModelSelector.vue';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.SqlGenerateNodeConfig];
}>();

const { dataSourceOptions, loading, loadDataSources } = useDataSource();

// 配置数据
const config = ref<Workflow.SqlGenerateNodeConfig>({
  dataSourceId: props.node.data.config?.dataSourceId || null,
  modelId: props.node.data.config?.modelId || null,
  tableWhitelist: props.node.data.config?.tableWhitelist || '',
  tableBlacklist: props.node.data.config?.tableBlacklist || ''
});

// 监听配置变化并通知父组件
watch(
  config,
  newConfig => {
    emit('update', newConfig);
  },
  { deep: true }
);

onMounted(() => {
  loadDataSources();
});
</script>

<template>
  <NForm label-placement="top" :show-feedback="false">
    <NFormItem label="选择数据源">
      <NSelect
        v-model:value="config.dataSourceId"
        :options="dataSourceOptions"
        :loading="loading"
        placeholder="请选择数据源"
        clearable
      />
    </NFormItem>

    <NFormItem label="选择 LLM 模型">
      <ModelSelector v-model:model-value="config.modelId" />
    </NFormItem>

    <NFormItem label="表白名单">
      <NInput v-model:value="config.tableWhitelist" placeholder="允许查询的表, 逗号分隔" />
    </NFormItem>

    <NFormItem label="表黑名单">
      <NInput v-model:value="config.tableBlacklist" placeholder="禁止查询的表, 逗号分隔" />
    </NFormItem>
  </NForm>
</template>

<style scoped></style>
