<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NForm, NFormItem, NInput, NSelect, NSlider, useMessage } from 'naive-ui';
import type { Node } from '@vue-flow/core';
import { fetchModelList } from '@/service/api/ai/admin/model';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.LlmNodeConfig];
}>();

const message = useMessage();

// 配置数据
const config = ref<Workflow.LlmNodeConfig>({
  modelId: props.node.data.config?.modelId || undefined,
  systemPrompt: props.node.data.config?.systemPrompt || '',
  temperature: props.node.data.config?.temperature || 0.7,
  maxTokens: props.node.data.config?.maxTokens || 2000
});

// 模型选项
const modelOptions = ref<Array<{ label: string; value: CommonType.IdType }>>([]);
const loading = ref(false);

// 加载模型列表
async function loadModels() {
  loading.value = true;
  try {
    const res = await fetchModelList({ modelType: '1', pageNo: 1, pageSize: 100 });
    if (res.data && res.data.rows) {
      modelOptions.value = res.data.rows.map((m: Api.AI.Model) => ({
        label: m.modelName,
        value: m.modelId
      }));
    }
  } catch {
    message.error('加载模型列表失败');
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
  loadModels();
});
</script>

<template>
  <NForm label-placement="top" :show-feedback="false">
    <NFormItem label="选择模型">
      <NSelect
        v-model:value="config.modelId"
        :options="modelOptions"
        :loading="loading"
        placeholder="请选择 LLM 模型"
        clearable
      />
    </NFormItem>

    <NFormItem label="系统提示词">
      <NInput
        v-model:value="config.systemPrompt"
        type="textarea"
        :rows="4"
        placeholder="输入系统提示词，定义 AI 的角色和行为..."
      />
    </NFormItem>

    <NFormItem label="温度 (Temperature)">
      <NSlider v-model:value="config.temperature" :min="0" :max="2" :step="0.1" :marks="{ 0: '0', 1: '1', 2: '2' }" />
      <div class="mt-1 text-xs c-gray-5 dark:c-gray-4">当前值: {{ config.temperature }}</div>
    </NFormItem>

    <NFormItem label="最大 Token 数">
      <NSlider
        v-model:value="config.maxTokens"
        :min="100"
        :max="4000"
        :step="100"
        :marks="{ 100: '100', 2000: '2000', 4000: '4000' }"
      />
      <div class="mt-1 text-xs c-gray-5 dark:c-gray-4">当前值: {{ config.maxTokens }}</div>
    </NFormItem>
  </NForm>
</template>
