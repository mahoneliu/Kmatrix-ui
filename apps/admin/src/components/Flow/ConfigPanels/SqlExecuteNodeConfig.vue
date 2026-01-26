<script setup lang="ts">
/**
 * SQL 执行节点配置面板
 * @author Mahone
 * @date 2026-01-24
 */
import { onMounted, ref, watch } from 'vue';
import { NForm, NFormItem, NInputNumber, NSelect } from 'naive-ui';
import type { Node } from '@vue-flow/core';
import { useDataSource } from '@/composables/useDataSource';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.SqlExecuteNodeConfig];
}>();

const { dataSourceOptions, loading, loadDataSources } = useDataSource();

// 配置数据
const config = ref<Workflow.SqlExecuteNodeConfig>({
  dataSourceId: props.node.data.config?.dataSourceId || null,
  maxRows: props.node.data.config?.maxRows || 100
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

    <NFormItem label="最大返回行数">
      <NInputNumber v-model:value="config.maxRows" :min="1" :max="10000" placeholder="100" class="w-full" />
    </NFormItem>
  </NForm>
</template>

<style scoped></style>
