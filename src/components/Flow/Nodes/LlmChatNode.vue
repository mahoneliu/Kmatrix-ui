<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { NForm, NFormItem, NInput, NSelect, NSlider, useMessage } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchModelList } from '@/service/api/ai/admin/model';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();
const message = useMessage();

// 局部表单数据
const formModel = reactive<Workflow.LlmNodeConfig>({
  modelId: null as any, // 临时使用 any 避免类型冲突
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2000
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
      modelOptions.value = res.data.rows.map((m: Api.AI.Admin.Model) => ({
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

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (config) {
    formModel.modelId = (config.modelId || null) as any;
    formModel.systemPrompt = config.systemPrompt || '';
    formModel.temperature = config.temperature || 0.7;
    formModel.maxTokens = config.maxTokens || 2000;
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.LlmNodeConfig | undefined;
    if (
      newValue.modelId !== currentConfig?.modelId ||
      newValue.systemPrompt !== currentConfig?.systemPrompt ||
      newValue.temperature !== currentConfig?.temperature ||
      newValue.maxTokens !== currentConfig?.maxTokens
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
    const config = newConfig as Workflow.LlmNodeConfig | undefined;
    if (config) {
      if (
        config.modelId !== formModel.modelId ||
        config.systemPrompt !== formModel.systemPrompt ||
        config.temperature !== formModel.temperature ||
        config.maxTokens !== formModel.maxTokens
      ) {
        formModel.modelId = (config.modelId || null) as any;
        formModel.systemPrompt = config.systemPrompt || '';
        formModel.temperature = config.temperature || 0.7;
        formModel.maxTokens = config.maxTokens || 2000;
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
  loadModels();
});
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:robot' }" class="llm-chat-node">
    <div class="w-96 p-3">
      <NForm :model="formModel" label-placement="top" size="small" :show-feedback="false">
        <NFormItem label="选择模型">
          <NSelect
            v-model:value="formModel.modelId"
            :options="modelOptions"
            :loading="loading"
            placeholder="请选择 LLM 模型"
            clearable
          />
        </NFormItem>

        <NFormItem label="系统提示词">
          <NInput
            v-model:value="formModel.systemPrompt"
            type="textarea"
            :rows="3"
            placeholder="输入系统提示词，定义 AI 的角色和行为..."
          />
        </NFormItem>

        <NFormItem label="温度 (Temperature)">
          <NSlider
            v-model:value="formModel.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            :marks="{ 0: '0', 1: '1', 2: '2' }"
          />
          <div class="mt-1 text-xs text-gray-500">当前值: {{ formModel.temperature }}</div>
        </NFormItem>

        <NFormItem label="最大 Token 数">
          <NSlider
            v-model:value="formModel.maxTokens"
            :min="100"
            :max="4000"
            :step="100"
            :marks="{ 100: '100', 2000: '2000', 4000: '4000' }"
          />
          <div class="mt-1 text-xs text-gray-500">当前值: {{ formModel.maxTokens }}</div>
        </NFormItem>
      </NForm>
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
