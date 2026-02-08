<script setup lang="ts">
/**
 * 知识检索节点
 * 从知识库中检索相关文档片段，用于 RAG 对话
 *
 * @author Mahone
 * @date 2026-01-29
 */
import { onMounted, reactive, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NInput, NInputNumber, NSelect, NSlider, NSwitch } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchAllKnowledgeBases } from '@/service/api/ai/knowledge';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 知识库选项
const kbOptions = ref<{ label: string; value: number }[]>([]);
const kbLoading = ref(false);

// 检索模式选项
const modeOptions = [
  { label: '向量检索', value: 'VECTOR' },
  { label: '关键词检索', value: 'KEYWORD' },
  { label: '混合检索', value: 'HYBRID' }
];

// 局部表单数据
const formModel = reactive<Workflow.KnowledgeRetrievalConfig>({
  kbIds: [],
  datasetIds: [],
  topK: 5,
  threshold: 0.5,
  mode: 'VECTOR',
  enableRerank: true,
  emptyResponse: ''
});

// 加载知识库列表
async function loadKnowledgeBases() {
  kbLoading.value = true;
  try {
    const { data } = await fetchAllKnowledgeBases();
    if (data) {
      kbOptions.value = data.map(kb => ({
        label: kb.name,
        value: kb.id as number
      }));
    }
  } catch {
    // console.error('Failed to load knowledge bases:', e);
  } finally {
    kbLoading.value = false;
  }
}

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.KnowledgeRetrievalConfig | undefined;
  if (config) {
    formModel.kbIds = config.kbIds || [];
    formModel.datasetIds = config.datasetIds || [];
    formModel.topK = config.topK || 5;
    formModel.threshold = config.threshold || 0.5;
    formModel.mode = config.mode || 'VECTOR';
    formModel.enableRerank = config.enableRerank || false;
    formModel.emptyResponse = config.emptyResponse || '';
  }
}

// 监听局部表单变化，同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.KnowledgeRetrievalConfig | undefined;
    if (
      JSON.stringify(newValue.kbIds) !== JSON.stringify(currentConfig?.kbIds) ||
      JSON.stringify(newValue.datasetIds) !== JSON.stringify(currentConfig?.datasetIds) ||
      newValue.topK !== currentConfig?.topK ||
      newValue.threshold !== currentConfig?.threshold ||
      newValue.mode !== currentConfig?.mode ||
      newValue.enableRerank !== currentConfig?.enableRerank ||
      newValue.emptyResponse !== currentConfig?.emptyResponse
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
    const config = newConfig as Workflow.KnowledgeRetrievalConfig | undefined;
    if (config) {
      if (
        JSON.stringify(config.kbIds) !== JSON.stringify(formModel.kbIds) ||
        JSON.stringify(config.datasetIds) !== JSON.stringify(formModel.datasetIds) ||
        config.topK !== formModel.topK ||
        config.threshold !== formModel.threshold ||
        config.mode !== formModel.mode ||
        config.enableRerank !== formModel.enableRerank
      ) {
        formModel.kbIds = config.kbIds || [];
        formModel.datasetIds = config.datasetIds || [];
        formModel.topK = config.topK || 5;
        formModel.threshold = config.threshold || 0.5;
        formModel.mode = config.mode || 'VECTOR';
        formModel.enableRerank = config.enableRerank || false;
        formModel.emptyResponse = config.emptyResponse || '';
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
  loadKnowledgeBases();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="knowledge-retrieval-node">
    <div class="w-93">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem title="检索配置" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">知识库</label>
              <NSelect
                v-model:value="formModel.kbIds"
                :options="kbOptions"
                :loading="kbLoading"
                multiple
                clearable
                size="small"
                placeholder="选择知识库 (留空则搜索全部)"
              />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">检索模式</label>
              <NSelect v-model:value="formModel.mode" :options="modeOptions" placeholder="选择检索模式" size="small" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">返回数量 (Top K)</label>
              <NInputNumber v-model:value="formModel.topK" :min="1" :max="20" placeholder="5" size="small" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">相似度阈值: {{ formModel.threshold }}</label>
              <NSlider v-model:value="formModel.threshold" :min="0" :max="1" :step="0.05" />
            </div>

            <div class="workflow-config-item flex-row">
              <label class="workflow-label">启用重排序 (Rerank)</label>
              <NSwitch v-model:value="formModel.enableRerank" size="small" class="ml-auto" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">空结果回复</label>
              <NInput
                v-model:value="formModel.emptyResponse"
                type="textarea"
                :rows="2"
                size="small"
                placeholder="未找到结果时的回复 (可选)"
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
