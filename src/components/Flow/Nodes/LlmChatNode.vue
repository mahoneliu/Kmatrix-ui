<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { NForm, NFormItem, NInput, NSelect, NSlider, NTabPane, NTabs, useMessage } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchModelList } from '@/service/api/ai/admin/model';
import { useWorkflowStore } from '@/store/modules/workflow';
import { getNodeInputParams } from '@/utils/workflow/node-params';
import BaseNode from './BaseNode.vue';

const ParamSelector = defineAsyncComponent(() => import('@/components/Flow/ParamSelector.vue'));

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

// 参数绑定配置
const paramBindings = ref<Workflow.ParamBinding[]>([]);

// 获取节点输入参数定义
const inputParams = getNodeInputParams('LLM_CHAT');

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

  // 初始化参数绑定
  paramBindings.value = props.data.paramBindings || [];
}

// 监听参数绑定变化
watch(
  paramBindings,
  newBindings => {
    workflowStore.updateNode(props.id, {
      ...workflowStore.nodes.find(n => n.id === props.id),
      data: {
        ...props.data,
        paramBindings: newBindings
      }
    });
  },
  { deep: true }
);

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
      <NTabs type="line" size="small">
        <!-- 基础配置标签页 -->
        <NTabPane name="config" tab="基础配置">
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
        </NTabPane>

        <!-- 参数绑定标签页 -->
        <NTabPane name="params" tab="参数绑定">
          <div class="flex flex-col gap-3">
            <div class="text-xs c-gray-5">配置节点输入参数的来源，可以从全局参数或上游节点输出中选择。</div>

            <div v-for="param in inputParams" :key="param.key" class="flex flex-col gap-1">
              <label class="text-xs c-gray-7 font-500 dark:c-gray-3">
                {{ param.label }}
                <span v-if="param.required" class="c-red-5">*</span>
              </label>
              <ParamSelector
                :node-id="props.id"
                :param-def="param"
                :binding="paramBindings.find(b => b.paramKey === param.key)"
                @update:binding="
                  binding => {
                    const index = paramBindings.findIndex(b => b.paramKey === param.key);
                    if (binding) {
                      if (index >= 0) {
                        paramBindings[index] = binding;
                      } else {
                        paramBindings.push(binding);
                      }
                    } else if (index >= 0) {
                      paramBindings.splice(index, 1);
                    }
                  }
                "
              />
              <div v-if="param.description" class="text-xs c-gray-4">
                {{ param.description }}
              </div>
            </div>
          </div>
        </NTabPane>
      </NTabs>
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
