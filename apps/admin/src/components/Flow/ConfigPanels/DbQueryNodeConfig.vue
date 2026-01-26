<script setup lang="ts">
/**
 * 数据库查询节点配置面板
 * @author Mahone
 * @date 2026-01-20
 */
import { onMounted, ref, watch } from 'vue';
import { NForm, NFormItem, NInput, NInputNumber, NSelect, useMessage } from 'naive-ui';
import type { Node } from '@vue-flow/core';
import { fetchDataSourceList } from '@/service/api/ai/datasource';
import ModelSelector from '@/components/ai/ModelSelector.vue';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.DbQueryNodeConfig];
}>();

const message = useMessage();

// 配置数据
const config = ref<Workflow.DbQueryNodeConfig>({
  dataSourceId: props.node.data.config?.dataSourceId || null,
  modelId: props.node.data.config?.modelId || null,
  maxRows: props.node.data.config?.maxRows || 100,
  tableWhitelist: props.node.data.config?.tableWhitelist || '',
  tableBlacklist: props.node.data.config?.tableBlacklist || ''
});

// 数据源选项
const dataSourceOptions = ref<Array<{ label: string; value: number }>>([]);
const loading = ref(false);

// 加载数据源列表
async function loadDataSources() {
  loading.value = true;
  try {
    const result = await fetchDataSourceList();
    let data: any;
    if (result && typeof result === 'object' && 'data' in result) {
      data = (result as any).data;
    } else {
      data = result;
    }
    dataSourceOptions.value = (data || []).map((ds: any) => ({
      label: ds.dataSourceName,
      value: ds.dataSourceId
    }));
  } catch {
    message.error('加载数据源列表失败');
  } finally {
    loading.value = false;
  }
}

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

    <NFormItem label="最大返回行数">
      <NInputNumber v-model:value="config.maxRows" :min="1" :max="10000" placeholder="100" class="w-full" />
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
