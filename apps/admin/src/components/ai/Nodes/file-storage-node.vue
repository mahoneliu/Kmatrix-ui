<script setup lang="ts">
/**
 * 文件存储节点配置
 * 接收外部文件，允许用户指定目标知识库和数据集（仅 WORKFLOW_FILE 类型的数据集）
 *
 * @author Mahone
 * @date 2026-04-05
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { NSelect } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchAllKnowledgeBases, fetchDatasetsByKbId } from '@/service/api/ai/knowledge';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 知识库选项
const kbOptions = ref<{ label: string; value: number }[]>([]);
const kbLoading = ref(false);

// 数据集选项（仅 WORKFLOW_FILE 类型）
const datasetOptions = ref<{ label: string; value: number }[]>([]);
const datasetLoading = ref(false);

// 局部表单数据
const formModel = reactive<Workflow.FileStorageConfig>({
  kbId: undefined,
  datasetId: undefined
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
  } finally {
    kbLoading.value = false;
  }
}

// 加载数据集列表（仅 WORKFLOW_FILE 类型）
async function loadDatasets(kbId: number, keepDatasetId?: number) {
  datasetLoading.value = true;
  datasetOptions.value = [];
  try {
    const { data } = await fetchDatasetsByKbId(kbId);
    if (data) {
      datasetOptions.value = data
        .filter(ds => ds.processType !== 'WORKFLOW_FILE')
        .map(ds => ({
          label: ds.name,
          value: ds.id as number
        }));
    }
    // 恢复保留的 datasetId（初始化场景），或清空（切换知识库场景）
    formModel.datasetId = keepDatasetId ?? undefined;
  } finally {
    datasetLoading.value = false;
  }
}

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.FileStorageConfig | undefined;
  if (config) {
    formModel.kbId = config.kbId;
    // 先不设置 datasetId，等 loadDatasets 完成后再恢复，避免被清空
    if (config.kbId) {
      loadDatasets(config.kbId, config.datasetId);
    } else {
      formModel.datasetId = config.datasetId;
    }
  }
}

// 监听知识库变化，自动加载数据集
watch(
  () => formModel.kbId,
  (newKbId, oldKbId) => {
    // 初始化时 oldKbId 为 undefined，由 initData 负责加载，这里跳过
    if (oldKbId === undefined) return;
    if (newKbId) {
      loadDatasets(newKbId); // 切换知识库，清空 datasetId
    } else {
      datasetOptions.value = [];
      formModel.datasetId = undefined;
    }
    syncToStore();
  }
);

// 监听数据集变化，同步到 Store
watch(
  () => formModel.datasetId,
  () => {
    syncToStore();
  }
);

function syncToStore() {
  const currentConfig = props.data.config as Workflow.FileStorageConfig | undefined;
  if (formModel.kbId !== currentConfig?.kbId || formModel.datasetId !== currentConfig?.datasetId) {
    workflowStore.updateNodeConfig(props.id, { ...formModel });
  }
}

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.FileStorageConfig | undefined;
    if (config) {
      if (config.kbId !== formModel.kbId) {
        formModel.kbId = config.kbId;
        if (config.kbId) {
          loadDatasets(config.kbId, config.datasetId);
        }
      } else if (config.datasetId !== formModel.datasetId) {
        formModel.datasetId = config.datasetId;
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
  loadKnowledgeBases();
});

// 计算摘要信息
const summaryItems = computed(() => {
  const items = [];
  const config = props.data.config as Workflow.FileStorageConfig | undefined;
  if (config?.kbId) {
    const kb = kbOptions.value.find(o => o.value === config.kbId);
    items.push({ label: $t('ai.workflow_node.knowledge_base'), value: kb?.label || String(config.kbId) });
  }
  return items;
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" :summary-items="summaryItems" class="file-storage-node">
    <div class="w-full">
      <div class="workflow-config-section">
        <!-- 知识库选择 -->
        <div class="workflow-config-item">
          <label class="workflow-label">{{ $t('ai.workflow_node.knowledge_base') }}</label>
          <NSelect
            v-model:value="formModel.kbId"
            :options="kbOptions"
            :loading="kbLoading"
            clearable
            size="small"
            :placeholder="$t('ai.workflow_node.select_knowledge_base')"
          />
        </div>

        <!-- 数据集选择（仅 WORKFLOW_FILE 类型数据集） -->
        <div class="workflow-config-item">
          <label class="workflow-label">{{ $t('ai.workflow_node.dataset') }}</label>
          <NSelect
            v-model:value="formModel.datasetId"
            :options="datasetOptions"
            :loading="datasetLoading"
            clearable
            size="small"
            :disabled="!formModel.kbId"
            :placeholder="
              formModel.kbId
                ? $t('ai.workflow_node.select_dataset')
                : $t('ai.workflow_node.select_knowledge_base_first')
            "
          />
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制 */
:deep(.workflow-node) {
  min-width: 360px !important;
  max-width: 420px;
}
</style>
