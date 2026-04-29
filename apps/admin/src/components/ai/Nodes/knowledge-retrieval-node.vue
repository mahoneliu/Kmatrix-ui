<script setup lang="ts">
/**
 * 知识检索节点
 * 从知识库中检索相关文档片段，用于 RAG 对话
 *
 * @author Mahone
 * @date 2026-01-29
 */
import { onMounted, ref } from 'vue';
import { NCollapse, NCollapseItem, NInput, NInputNumber, NSelect, NSlider, NSwitch } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchAllKnowledgeBases } from '@/service/api/ai/knowledge';
import { useAiNodeConfig } from '@/composables/ai/workflow/use-ai-node';
import { useNodeCollapse } from '@/composables/ai/workflow/use-node-collapse';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();

// 知识库选项
const kbOptions = ref<{ label: string; value: number }[]>([]);
const kbLoading = ref(false);

// 检索模式选项
const modeOptions = [
  { label: $t('ai.workflow_node.vector_retrieval'), value: 'VECTOR' },
  { label: $t('ai.workflow_node.keyword_search'), value: 'KEYWORD' },
  { label: $t('ai.workflow_node.hybrid_retrieval'), value: 'HYBRID' }
];

// 使用通用 AI 节点配置 composable
const { formModel, initData } = useAiNodeConfig(props.id, () => props.data, {
  kbIds: [] as number[],
  datasetIds: [] as number[],
  topK: 5,
  threshold: 0.5,
  mode: 'VECTOR' as 'VECTOR' | 'KEYWORD' | 'HYBRID',
  enableRerank: true,
  emptyResponse: ''
});

const { collapseProps } = useNodeCollapse();

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
    // ignore
  } finally {
    kbLoading.value = false;
  }
}

onMounted(() => {
  initData();
  loadKnowledgeBases();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="knowledge-retrieval-node">
    <div class="w-full">
      <NCollapse v-bind="collapseProps(['config'])">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem :title="$t('ai.workflow_node.retrieval_config')" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">{{ $t('ai.workflow_node.knowledge_base') }}</label>
              <NSelect
                v-model:value="formModel.kbIds"
                :options="kbOptions"
                :loading="kbLoading"
                multiple
                clearable
                size="small"
                :placeholder="$t('ai.workflow_node.select_knowledge_base')"
              />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">{{ $t('ai.workflow_node.retrieval_mode') }}</label>
              <NSelect
                v-model:value="formModel.mode"
                :options="modeOptions"
                :placeholder="$t('ai.workflow_node.select_search_mode')"
                size="small"
              />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">{{ $t('ai.workflow_node.return_count') }}</label>
              <NInputNumber v-model:value="formModel.topK" :min="1" :max="20" placeholder="5" size="small" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">
                {{ $t('ai.workflow_node.similarity_threshold') }} {{ formModel.threshold }}
              </label>
              <NSlider v-model:value="formModel.threshold" :min="0" :max="1" :step="0.05" />
            </div>

            <div class="workflow-config-item flex-row">
              <label class="workflow-label">{{ $t('ai.workflow_node.enable_rerank') }}</label>
              <NSwitch v-model:value="formModel.enableRerank" size="small" class="ml-auto" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">{{ $t('ai.workflow_node.empty_result_reply') }}</label>
              <NInput
                v-model:value="formModel.emptyResponse"
                type="textarea"
                :rows="2"
                size="small"
                :placeholder="$t('ai.workflow_node.reply_when_no_result')"
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
