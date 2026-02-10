<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { NButton, NFormItem, NInput, NInputNumber, NSelect, NSlider, NSpin, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchModelList } from '@/service/api/ai/model';
import { fetchAllKnowledgeBases } from '@/service/api/ai/knowledge';
import { updateApp } from '@/service/api/ai/app';
import { graphToDsl } from '@/utils/ai/dsl-converter';

interface Props {
  appId: string;
  appName: string;
  modelId?: any;
  knowledgeIds?: string | null;
  modelSetting?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } | null;
  /** 工作流 graphData (JSON string) */
  graphData?: string | null;
}

interface Emits {
  (e: 'update'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();
const loading = ref(false);
const saving = ref(false);

// 模型列表
const modelOptions = ref<{ label: string; value: number }[]>([]);
// 知识库列表
const kbOptions = ref<{ label: string; value: number }[]>([]);

// 表单数据
const formData = ref({
  appName: '',
  modelId: undefined as number | undefined,
  kbIds: [] as number[],
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  systemPrompt: '',
  userPrompt: '',
  enableHistory: false,
  historyCount: 5,
  streamOutput: true,
  kbMode: 'VECTOR' as 'VECTOR' | 'KEYWORD' | 'HYBRID',
  kbTopK: 5,
  kbThreshold: 0.5,
  kbEnableRerank: true,
  kbEmptyResponse: ''
});

/**
 * 从 graphData 解析配置数据
 * 优先从工作流节点配置中提取 modelId、kbIds 等
 */
/**
 * 辅助函数:如果值已定义则执行赋值回调
 */
function assignIfDefined<T>(value: T | undefined, callback: (val: T) => void) {
  if (value !== undefined) {
    callback(value);
  }
}

/**
 * 提取 LLM_CHAT 节点配置
 */
function extractLlmChatConfig(config: any) {
  if (config.modelId && !formData.value.modelId) {
    formData.value.modelId = config.modelId as number;
  }
  const aiConfig = config.aiConfig;
  if (!aiConfig) return;

  // 使用辅助函数处理 aiConfig 字段
  assignIfDefined(aiConfig.temperature, val => {
    formData.value.temperature = Number(val) || 0;
  });
  assignIfDefined(aiConfig.maxTokens, val => {
    formData.value.maxTokens = Number(val) || 2048;
  });
  assignIfDefined(aiConfig.systemPrompt, val => {
    formData.value.systemPrompt = String(val || '');
  });
  assignIfDefined(aiConfig.userPrompt, val => {
    formData.value.userPrompt = String(val || '');
  });
  assignIfDefined(aiConfig.streamOutput, val => {
    formData.value.streamOutput = Boolean(val);
  });
  assignIfDefined(aiConfig.enableHistory, val => {
    formData.value.enableHistory = Boolean(val);
  });
  assignIfDefined(aiConfig.historyCount, val => {
    formData.value.historyCount = Number(val) || 5;
  });
}

/**
 * 提取 KNOWLEDGE_RETRIEVAL 节点配置
 */
function extractKnowledgeRetrievalConfig(config: any) {
  if (Array.isArray(config.kbIds) && config.kbIds.length > 0) {
    formData.value.kbIds = config.kbIds;
  }
  if (config.mode !== undefined) {
    formData.value.kbMode = config.mode;
  }
  if (config.topK !== undefined) {
    formData.value.kbTopK = Number(config.topK) || 5;
  }
  if (config.threshold !== undefined) {
    formData.value.kbThreshold = Number(config.threshold) || 0.5;
  }
  if (config.enableRerank !== undefined) {
    formData.value.kbEnableRerank = Boolean(config.enableRerank);
  }
  if (config.emptyResponse !== undefined) {
    formData.value.kbEmptyResponse = String(config.emptyResponse || '');
  }
}

/**
 * 从 graphData 解析配置数据
 * 优先从工作流节点配置中提取 modelId、kbIds 等
 */
function extractConfigFromGraphData(graphDataStr: string | null | undefined) {
  if (!graphDataStr) return;

  try {
    const graphData = JSON.parse(graphDataStr) as Workflow.GraphData;
    if (!graphData.nodes) return;

    for (const node of graphData.nodes) {
      const nodeType = node.data?.nodeType;
      const config = node.data?.config || {};

      if (nodeType === 'LLM_CHAT') {
        extractLlmChatConfig(config);
      } else if (nodeType === 'KNOWLEDGE_RETRIEVAL') {
        extractKnowledgeRetrievalConfig(config);
      } else if (nodeType === 'APP_INFO' && config.appName) {
        formData.value.appName = config.appName;
      }
    }
  } catch {
    // 解析失败时使用 props 默认值
  }
}

/**
 * 初始化表单数据
 * 优先从 graphData 解析，其次使用 props
 */
function initFormData() {
  // 先设置 props 默认值
  formData.value.appName = props.appName || '';
  formData.value.modelId = props.modelId || undefined;
  formData.value.kbIds = props.knowledgeIds ? props.knowledgeIds.split(',').map(Number) : [];
  formData.value.temperature = props.modelSetting?.temperature ?? 0.7;
  formData.value.topP = props.modelSetting?.top_p ?? 0.9;
  formData.value.maxTokens = props.modelSetting?.max_tokens ?? 2048;
  // New fields default values
  formData.value.systemPrompt = '';
  formData.value.userPrompt = `已知信息：\${chatContext}\n问题：\${userInput}`;
  formData.value.enableHistory = false;
  formData.value.historyCount = 5;
  formData.value.streamOutput = true;
  formData.value.kbMode = 'VECTOR';
  formData.value.kbTopK = 5;
  formData.value.kbThreshold = 0.5;
  formData.value.kbEnableRerank = false;
  formData.value.kbEmptyResponse = '';

  // 尝试从 graphData 覆盖
  extractConfigFromGraphData(props.graphData);
}

// 监听 graphData 变化
watch(
  () => props.graphData,
  () => {
    initFormData();
  }
);

// 是否可以保存
const canSave = computed(() => {
  return formData.value.appName && formData.value.modelId;
});

async function loadOptions() {
  loading.value = true;
  try {
    // 加载模型列表 (语言模型)
    const modelRes = await fetchModelList({ modelType: '1', status: '0' });
    if (modelRes.data) {
      modelOptions.value = modelRes.data.map(m => ({
        label: m.modelName,
        value: m.modelId as number
      }));
    }

    // 加载知识库列表
    const kbRes = await fetchAllKnowledgeBases();
    if (kbRes.data) {
      kbOptions.value = (kbRes.data as any[]).map(kb => ({
        label: kb.name,
        value: kb.id as number
      }));
    }
  } catch {
    message.error('加载配置选项失败');
  } finally {
    loading.value = false;
  }
}

/**
 * 将表单数据映射到工作流节点配置
 */
function updateGraphDataWithFormData(graphData: Workflow.GraphData): Workflow.GraphData {
  const updatedNodes = graphData.nodes.map(node => {
    const nodeType = node.data?.nodeType;
    const config = { ...(node.data?.config || {}) };

    switch (nodeType) {
      case 'LLM_CHAT':
      case 'INTENT_CLASSIFIER':
      case 'DB_QUERY':
      case 'SQL_GENERATE':
        config.modelId = formData.value.modelId;
        if (nodeType === 'LLM_CHAT') {
          config.aiConfig = {
            ...(config.aiConfig || {}),
            temperature: formData.value.temperature,
            maxTokens: formData.value.maxTokens,
            systemPrompt: formData.value.systemPrompt,
            userPrompt: formData.value.userPrompt,
            enableHistory: formData.value.enableHistory,
            historyCount: formData.value.historyCount,
            streamOutput: formData.value.streamOutput
          };
        }
        break;
      case 'KNOWLEDGE_RETRIEVAL':
        config.kbIds = formData.value.kbIds;
        config.mode = formData.value.kbMode;
        config.topK = formData.value.kbTopK;
        config.threshold = formData.value.kbThreshold;
        config.enableRerank = formData.value.kbEnableRerank;
        config.emptyResponse = formData.value.kbEmptyResponse;
        break;
      case 'APP_INFO':
        config.appName = formData.value.appName;
        break;
      default:
        break;
    }

    return {
      ...node,
      data: {
        ...node.data,
        config
      }
    };
  });

  return {
    ...graphData,
    nodes: updatedNodes
  };
}

async function handleSave() {
  if (!canSave.value) {
    message.warning('请填写应用名称、选择大模型和知识库');
    return;
  }

  saving.value = true;
  try {
    let updatedGraphData: string | undefined;
    let updatedDslData: string | undefined;

    if (props.graphData) {
      try {
        const graphDataObj = JSON.parse(props.graphData) as Workflow.GraphData;
        const updatedGraph = updateGraphDataWithFormData(graphDataObj);
        updatedGraphData = JSON.stringify(updatedGraph);
        const newDsl = graphToDsl(updatedGraph, formData.value.appName);
        updatedDslData = JSON.stringify(newDsl);
      } catch {
        // 解析失败时不更新工作流数据
      }
    }

    await updateApp({
      appId: props.appId,
      appName: formData.value.appName,
      modelId: formData.value.modelId,
      knowledgeIds: formData.value.kbIds.join(','),
      modelSetting: {
        temperature: formData.value.temperature,
        top_p: formData.value.topP,
        max_tokens: formData.value.maxTokens
      } as any,
      graphData: updatedGraphData,
      dslData: updatedDslData
    });

    message.success('配置已保存');
    emit('update');
  } catch {
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
}

// 温度提示
const temperatureMarks = {
  0: '精确',
  0.5: '平衡',
  1: '创意',
  1.5: '随机',
  2: '极随机'
};

onMounted(() => {
  initFormData();
  loadOptions();
});
</script>

<template>
  <div class="system-template-config-container">
    <NSpin :show="loading">
      <div class="flex flex-col gap-3 px-3">
        <!-- 应用名称 (总是可见) -->
        <NFormItem
          label="应用名称"
          label-placement="left"
          label-width="90"
          :show-feedback="false"
          class="compact-form-item"
        >
          <template #label><span class="whitespace-nowrap font-bold">应用名称</span></template>
          <NInput v-model:value="formData.appName" placeholder="请输入应用名称" class="w-full" />
        </NFormItem>

        <NTabs type="line" animated>
          <!-- AI 模型配置页 -->
          <NTabPane name="ai" tab="AI 模型配置">
            <template #tab>
              <div class="flex items-center gap-2">
                <SvgIcon local-icon="mdi-robot" />
                <span>AI 模型配置</span>
              </div>
            </template>
            <div
              class="mt-2 border border-blue-100/50 rounded-lg bg-blue-50/30 p-3 space-y-1 dark:border-blue-800/30 dark:bg-blue-900/10"
            >
              <!-- 选择模型 -->
              <NFormItem
                label="推理模型"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item"
              >
                <template #label>
                  <span class="whitespace-nowrap">
                    推理模型
                    <span class="text-red-500">*</span>
                  </span>
                </template>
                <NSelect
                  v-model:value="formData.modelId"
                  :options="modelOptions"
                  placeholder="请选择推理模型"
                  filterable
                  class="w-full"
                />
              </NFormItem>

              <!-- 系统提示词 -->
              <NFormItem
                label="系统提示词"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item"
              >
                <template #label><span class="whitespace-nowrap">系统提示词</span></template>
                <NInput
                  v-model:value="formData.systemPrompt"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  placeholder="定义 AI 助手的角色和行为规范"
                  class="w-full"
                />
              </NFormItem>

              <!-- 用户提示词 -->
              <NFormItem
                label="用户提示词"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item"
              >
                <template #label><span class="whitespace-nowrap">用户提示词</span></template>
                <NInput
                  v-model:value="formData.userPrompt"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="用户向大模型提出的具体问题或指令 (可选)"
                  class="w-full"
                />
              </NFormItem>

              <!-- 温度 -->
              <NFormItem
                label="温度"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item pb-2 pt-2"
              >
                <template #label><span class="whitespace-nowrap">温度</span></template>
                <div class="w-full flex items-center gap-4 px-2">
                  <NSlider
                    v-model:value="formData.temperature"
                    :min="0"
                    :max="2"
                    :step="0.1"
                    :marks="temperatureMarks"
                    class="flex-1"
                  />
                  <span class="w-12 text-center text-nowrap text-xs text-gray-500 font-bold -mt-6">
                    {{ (Number(formData.temperature) || 0).toFixed(1) }}
                  </span>
                </div>
              </NFormItem>

              <div class="flex gap-8">
                <!-- Top P -->
                <NFormItem
                  label="Top P"
                  label-placement="left"
                  label-width="80"
                  :show-feedback="false"
                  class="compact-form-item flex-1"
                >
                  <template #label><span class="whitespace-nowrap">Top P</span></template>
                  <div class="w-full flex items-center gap-4 px-2">
                    <NSlider v-model:value="formData.topP" :min="0" :max="1" :step="0.1" class="flex-1" />
                    <span class="w-8 text-center text-xs text-gray-400">{{ formData.topP }}</span>
                  </div>
                </NFormItem>

                <!-- 最大 Token -->
                <NFormItem
                  label="Max Token"
                  label-placement="left"
                  label-width="80"
                  :show-feedback="false"
                  class="compact-form-item flex-1"
                >
                  <template #label><span class="whitespace-nowrap">Max Token</span></template>
                  <NInputNumber
                    v-model:value="formData.maxTokens"
                    :min="1"
                    :max="128000"
                    :step="256"
                    size="small"
                    class="w-full"
                  />
                </NFormItem>
              </div>

              <div class="flex gap-8">
                <!-- 启用历史会话 -->
                <NFormItem
                  label="携带历史"
                  label-placement="left"
                  label-width="80"
                  :show-feedback="false"
                  class="compact-form-item flex-none"
                >
                  <template #label><span class="whitespace-nowrap">携带历史</span></template>
                  <NSwitch v-model:value="formData.enableHistory" size="small" />
                </NFormItem>

                <!-- 历史消息条数 -->
                <NFormItem
                  v-if="formData.enableHistory"
                  key="historyCount"
                  label="历史条数"
                  label-placement="left"
                  label-width="80"
                  :show-feedback="false"
                  class="compact-form-item flex-1"
                >
                  <template #label><span class="whitespace-nowrap">历史条数</span></template>
                  <NInputNumber v-model:value="formData.historyCount" :min="1" :max="50" size="small" class="w-24" />
                </NFormItem>
              </div>

              <div class="flex gap-8">
                <!-- 流式输出 -->
                <NFormItem
                  label="流式输出"
                  label-placement="left"
                  label-width="80"
                  :show-feedback="false"
                  class="compact-form-item flex-none"
                >
                  <template #label><span class="whitespace-nowrap">流式输出</span></template>
                  <NSwitch v-model:value="formData.streamOutput" size="small" />
                </NFormItem>
              </div>
            </div>
          </NTabPane>

          <!-- 知识检索配置页 -->
          <NTabPane name="kb" tab="知识检索配置">
            <template #tab>
              <div class="flex items-center gap-2">
                <SvgIcon local-icon="mdi-database-search" />
                <span>知识检索配置</span>
              </div>
            </template>
            <div
              class="mt-2 border border-blue-100/50 rounded-lg bg-blue-50/30 p-3 space-y-1 dark:border-blue-800/30 dark:bg-blue-900/10"
            >
              <!-- 选择知识库 -->
              <NFormItem
                label="知识库"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item"
              >
                <template #label>
                  <span class="whitespace-nowrap">知识库</span>
                  <span class="text-red-500">*</span>
                </template>
                <NSelect
                  v-model:value="formData.kbIds"
                  :options="kbOptions"
                  placeholder="请选择知识库"
                  multiple
                  filterable
                  class="w-full"
                />
              </NFormItem>

              <!-- 检索模式 -->
              <NFormItem
                label="检索模式"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item flex-1"
              >
                <template #label>
                  <span class="whitespace-nowrap">
                    检索模式
                    <span class="text-red-500">*</span>
                  </span>
                </template>
                <NSelect
                  v-model:value="formData.kbMode"
                  :options="[
                    { label: '向量检索', value: 'VECTOR' },
                    { label: '关键词检索', value: 'KEYWORD' },
                    { label: '混合检索', value: 'HYBRID' }
                  ]"
                  size="small"
                  class="w-full"
                />
              </NFormItem>

              <!-- 返回数量 (Top K) -->
              <NFormItem
                label="Top K"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item flex-1"
              >
                <template #label><span class="whitespace-nowrap">Top K</span></template>
                <NInputNumber v-model:value="formData.kbTopK" :min="1" :max="20" size="small" class="w-full" />
              </NFormItem>

              <!-- 相似度阈值 -->
              <NFormItem
                label="相似度阈值"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item flex-1"
              >
                <template #label><span class="whitespace-nowrap">分值阈值</span></template>
                <div class="flex flex-1 items-center gap-2">
                  <NSlider v-model:value="formData.kbThreshold" :min="0" :max="1" :step="0.05" class="flex-1" />
                  <span class="w-8 text-center text-xs text-gray-400">{{ formData.kbThreshold }}</span>
                </div>
              </NFormItem>

              <!-- 启用重排序 (Rerank) -->
              <NFormItem
                label="重排序"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item flex-none"
              >
                <template #label><span class="whitespace-nowrap">重排序</span></template>
                <NSwitch v-model:value="formData.kbEnableRerank" size="small" />
              </NFormItem>

              <!-- 空结果回复 -->
              <NFormItem
                label="空结果回复"
                label-placement="left"
                label-width="80"
                :show-feedback="false"
                class="compact-form-item"
              >
                <template #label><span class="whitespace-nowrap">空结果回复</span></template>
                <NInput
                  v-model:value="formData.kbEmptyResponse"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 5 }"
                  placeholder="未找到相关知识时的默认回复 (可选)"
                  class="w-full"
                />
              </NFormItem>
            </div>
          </NTabPane>
        </NTabs>

        <!-- 保存按钮 (统一保留在底部) -->
        <div class="flex justify-end pb-2 pt-2">
          <NButton type="primary" size="small" :loading="saving" :disabled="!canSave" class="px-8" @click="handleSave">
            <template #icon>
              <SvgIcon local-icon="mdi-content-save" />
            </template>
            保存配置
          </NButton>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.compact-form-item :deep(.n-form-item-blank) {
  min-height: 32px;
}

.compact-form-item :deep(.n-form-item-label) {
  height: 32px;
  display: flex;
  align-items: center;
}

:deep(.n-form-item.n-form-item--left-labelled) {
  --n-label-height: 32px;
  --n-blank-height: 32px;
  margin-bottom: 8px;
}
</style>
