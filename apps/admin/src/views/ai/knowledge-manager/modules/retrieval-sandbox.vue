<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NInput,
  NInputNumber,
  NModal,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NSelect,
  NSlider,
  NSpin,
  NSwitch,
  NTag,
  NText,
  NTooltip
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  downloadDocument,
  fetchAllKnowledgeBases,
  fetchDatasetsByKbId,
  searchKnowledge
} from '@/service/api/ai/knowledge';
import { $t } from '@/locales';

interface Props {
  visible: boolean;
  kbId?: CommonType.IdType;
  fixedKb?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 表单状态
const query = ref('');
const selectedKbIds = ref<CommonType.IdType[]>([]);
const selectedDatasetIds = ref<CommonType.IdType[]>([]);
const topK = ref(5);
const threshold = ref(0.5);
const mode = ref<'VECTOR' | 'KEYWORD' | 'HYBRID'>('HYBRID');
const enableRerank = ref(true);
const enableHighlight = ref(true); // 关键词模式默认开启高亮

// 数据
const knowledgeBases = ref<Api.AI.KB.KnowledgeBase[]>([]);
const datasets = ref<Api.AI.KB.Dataset[]>([]);
const results = ref<Api.AI.KB.RetrievalResult[]>([]);
const loading = ref(false);
const searched = ref(false);

// 详情弹窗
const showDetailModal = ref(false);
const currentDetail = ref<Api.AI.KB.RetrievalResult | null>(null);

function handleViewDetail(item: Api.AI.KB.RetrievalResult) {
  currentDetail.value = item;
  showDetailModal.value = true;
}

// 下载文档
async function handleDownload(item: Api.AI.KB.RetrievalResult) {
  if (!item.documentId) {
    window.$message?.warning($t('ai.knowledge_manager.sandbox.noDocIdError'));
    return;
  }
  try {
    const { data: blob, error } = await downloadDocument(item.documentId);
    if (error) {
      window.$message?.error('下载失败');
      return;
    }
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // 使用文档名称或默认名称
    link.download = item.documentName || `document_${item.documentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    window.$message?.error($t('ai.knowledge_manager.sandbox.downloadError'));
  }
}

// 计算属性
const showModal = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
});

const kbOptions = computed(() =>
  knowledgeBases.value.map(kb => ({
    label: kb.name,
    value: kb.id
  }))
);

const datasetOptions = computed(() =>
  datasets.value.map(ds => ({
    label: ds.name,
    value: ds.id
  }))
);

const modeOptions = [
  { label: $t('ai.knowledge_manager.sandbox.modeVector'), value: 'VECTOR' },
  { label: $t('ai.knowledge_manager.sandbox.modeKeyword'), value: 'KEYWORD' },
  { label: $t('ai.knowledge_manager.sandbox.modeHybrid'), value: 'HYBRID' }
];

// 加载知识库列表
async function loadKnowledgeBases() {
  try {
    const { data } = await fetchAllKnowledgeBases();
    knowledgeBases.value = data || [];
  } catch {}
}

// 加载数据集列表（基于选择的知识库）
async function loadDatasets() {
  const ids = selectedKbIds.value;
  if (ids.length === 0) {
    datasets.value = [];
    selectedDatasetIds.value = [];
    return;
  }

  try {
    const allDatasets: Api.AI.KB.Dataset[] = [];
    const resultsList = await Promise.all(ids.map(id => fetchDatasetsByKbId(id)));
    for (const { data } of resultsList) {
      if (data) {
        allDatasets.push(...data);
      }
    }
    datasets.value = allDatasets;
  } catch {
    datasets.value = [];
  }
}

// 执行检索
async function handleSearch() {
  if (!query.value.trim()) return;

  loading.value = true;
  searched.value = true;

  try {
    const { data } = await searchKnowledge({
      query: query.value,
      kbIds: selectedKbIds.value.length > 0 ? selectedKbIds.value : undefined,
      datasetIds: selectedDatasetIds.value.length > 0 ? selectedDatasetIds.value : undefined,
      topK: topK.value,
      threshold: threshold.value,
      mode: mode.value,
      enableRerank: enableRerank.value,
      enableHighlight: mode.value === 'KEYWORD' ? enableHighlight.value : undefined
    });
    results.value = data || [];
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
  }
}

// 格式化分数显示
function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

// 获取分数颜色
function getScoreType(score: number): 'success' | 'warning' | 'error' {
  if (score >= 0.7) return 'success';
  if (score >= 0.5) return 'warning';
  return 'error';
}

// 获取来源类型标签
function getSourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CONTENT: $t('ai.knowledge_manager.sandbox.hitContent'),
    TITLE: $t('ai.knowledge_manager.sandbox.hitTitle'),
    QUESTION: $t('ai.knowledge_manager.sandbox.hitQuestion')
  };
  return map[type] || type;
}

// 获取来源类型颜色
function getSourceTypeType(type: string): 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' {
  const map: Record<string, 'info' | 'success' | 'warning'> = {
    CONTENT: 'info',
    TITLE: 'success',
    QUESTION: 'warning'
  };
  return map[type] || 'default';
}

// 监听知识库选择变化
watch(selectedKbIds, () => {
  loadDatasets();
});

// 监听弹窗打开
watch(
  () => props.visible,
  async val => {
    if (val) {
      if (knowledgeBases.value.length === 0) {
        await loadKnowledgeBases();
      }

      // 如果传入了 kbId，初始化选中状态
      if (props.kbId && (!selectedKbIds.value.length || props.fixedKb)) {
        selectedKbIds.value = [props.kbId];
      }
    }
  }
);

// 重置
function handleReset() {
  query.value = '';
  // 如果是固定 KB，重置时不清除 KB 选择
  if (props.fixedKb && props.kbId) {
    selectedKbIds.value = [props.kbId];
  } else {
    selectedKbIds.value = [];
  }
  selectedDatasetIds.value = [];
  topK.value = 5;
  threshold.value = 0.5;
  mode.value = 'HYBRID';
  enableRerank.value = true;
  enableHighlight.value = true;
  results.value = [];
  searched.value = false;
}
</script>

<template>
  <NModal
    v-model:show="showModal"
    :mask-closable="false"
    preset="card"
    :title="$t('ai.knowledge_manager.sandbox.title')"
    class="w-220"
  >
    <template #header-extra>
      <NButton tertiary size="small" @click="handleReset">
        <template #icon>
          <SvgIcon local-icon="mdi-refresh" />
        </template>
        {{ $t('ai.knowledge_manager.sandbox.reset') }}
      </NButton>
    </template>

    <div class="flex flex-col gap-4">
      <!-- 查询输入 -->
      <div class="flex items-center gap-3">
        <NInput
          v-model:value="query"
          :placeholder="$t('ai.knowledge_manager.sandbox.searchPlaceholder')"
          clearable
          class="flex-1"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <SvgIcon local-icon="mdi-magnify" class="text-gray-400" />
          </template>
        </NInput>
        <NButton type="primary" :loading="loading" :disabled="!query.trim()" @click="handleSearch">
          <template #icon>
            <SvgIcon local-icon="mdi-send" />
          </template>
          {{ $t('ai.knowledge_manager.sandbox.search') }}
        </NButton>
      </div>

      <!-- 配置面板 -->
      <NCollapse default-expanded-names="config">
        <template #arrow>
          <SvgIcon local-icon="mdi-chevron-right" />
        </template>
        <NCollapseItem :title="$t('ai.knowledge_manager.sandbox.config')" name="config">
          <div class="grid grid-cols-2 gap-4">
            <!-- 知识库选择 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">{{ $t('ai.knowledge_manager.sandbox.knowledgeBase') }}</div>
              <NSelect
                v-model:value="selectedKbIds"
                :options="kbOptions"
                multiple
                clearable
                :placeholder="$t('ai.knowledge_manager.sandbox.kbPlaceholder')"
                :disabled="fixedKb"
              />
            </div>

            <!-- 数据集选择 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">{{ $t('ai.knowledge_manager.sandbox.dataset') }}</div>
              <NSelect
                v-model:value="selectedDatasetIds"
                :options="datasetOptions"
                multiple
                clearable
                :placeholder="$t('ai.knowledge_manager.sandbox.datasetPlaceholder')"
                :disabled="datasets.length === 0"
              />
            </div>

            <!-- TopK -->
            <div>
              <div class="mb-1 text-sm text-gray-500">{{ $t('ai.knowledge_manager.sandbox.topK') }}</div>
              <div class="flex items-center gap-2">
                <NSlider v-model:value="topK" :min="1" :max="20" :step="1" class="flex-1" />
                <NInputNumber v-model:value="topK" :min="1" :max="20" size="small" class="w-20" />
              </div>
            </div>

            <!-- 阈值 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">{{ $t('ai.knowledge_manager.sandbox.threshold') }}</div>
              <div class="flex items-center gap-2">
                <NSlider v-model:value="threshold" :min="0" :max="1" :step="0.05" class="flex-1" />
                <NInputNumber v-model:value="threshold" :min="0" :max="1" :step="0.05" size="small" class="w-20" />
              </div>
            </div>

            <!-- 检索模式 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">{{ $t('ai.knowledge_manager.sandbox.mode') }}</div>
              <NRadioGroup v-model:value="mode" size="small">
                <NRadioButton v-for="opt in modeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </NRadioButton>
              </NRadioGroup>
            </div>

            <!-- Rerank -->
            <div>
              <div class="text-sm text-gray-500">
                {{ $t('ai.knowledge_manager.sandbox.enableRerank') }}
                <NTooltip>
                  <template #trigger>
                    <SvgIcon local-icon="mdi-help-circle-outline" class="cursor-help text-gray-400" />
                  </template>
                  {{ $t('ai.knowledge_manager.sandbox.rerankTooltip') }}
                </NTooltip>
              </div>
              <NSwitch v-model:value="enableRerank" />
            </div>

            <!-- Highlight (only for KEYWORD mode) -->
            <div v-if="mode === 'KEYWORD'" class="flex items-center gap-2">
              <div class="text-sm text-gray-500">{{ $t('ai.knowledge_manager.sandbox.enableHighlight') }}</div>
              <NSwitch v-model:value="enableHighlight" />
              <NTooltip>
                <template #trigger>
                  <SvgIcon local-icon="mdi-help-circle-outline" class="cursor-help text-gray-400" />
                </template>
                {{ $t('ai.knowledge_manager.sandbox.highlightTooltip') }}
              </NTooltip>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>

      <!-- 结果展示 -->
      <NCard :bordered="false" size="small" class="bg-gray-50 dark:bg-gray-800/50">
        <template #header>
          <div class="flex items-center gap-2">
            <SvgIcon local-icon="mdi-format-list-bulleted" />
            <span>{{ $t('ai.knowledge_manager.sandbox.resultTitle') }}</span>
            <NTag v-if="searched" size="small" :bordered="false">
              {{ $t('ai.knowledge_manager.sandbox.items', { count: results.length }) }}
            </NTag>
          </div>
        </template>

        <NSpin :show="loading">
          <NScrollbar class="max-h-400px">
            <div v-if="results.length > 0" class="flex flex-col gap-3">
              <NCard
                v-for="(item, index) in results"
                :key="item.chunkId"
                size="small"
                :bordered="true"
                class="transition-shadow hover:shadow-md"
              >
                <div class="flex items-start gap-3">
                  <!-- 序号和分数 -->
                  <div class="flex flex-col items-end gap-1">
                    <div
                      class="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-bold"
                    >
                      {{ index + 1 }}
                    </div>
                    <NTag :type="getScoreType(item.score)" size="small" :bordered="false">
                      {{ formatScore(item.score) }}
                    </NTag>
                    <NTag v-if="item.rerankScore" type="info" size="small" :bordered="false">
                      R: {{ formatScore(item.rerankScore) }}
                    </NTag>
                  </div>

                  <!-- 内容 -->
                  <div class="min-w-0 flex-1">
                    <div class="items-between flex justify-between gap-2">
                      <!-- 标题展示 -->
                      <div
                        v-if="item.title"
                        class="group mb-2 flex cursor-pointer items-center gap-2 text-sm text-gray-800 font-bold dark:text-gray-200 hover:text-primary"
                        @click="handleViewDetail(item)"
                      >
                        <span>{{ item.title }}</span>
                      </div>
                      <div v-if="item.sourceTypes && item.sourceTypes.length > 0" class="flex gap-1">
                        <NTag
                          v-for="type in [...new Set(item.sourceTypes)]"
                          :key="type"
                          :type="getSourceTypeType(type)"
                          size="small"
                          :bordered="false"
                          class="origin-right scale-75 transform"
                        >
                          {{ getSourceTypeLabel(type) }}
                        </NTag>
                      </div>
                    </div>
                    <!-- 高亮内容使用 v-html -->
                    <!-- eslint-disable vue/no-v-html -->
                    <div
                      v-if="item.highlight"
                      class="retrieval-highlight line-clamp-4 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      @click="handleViewDetail(item)"
                      v-html="item.highlight"
                    ></div>
                    <!-- eslint-enable vue/no-v-html -->
                    <NText
                      v-else
                      class="line-clamp-4 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      @click="handleViewDetail(item)"
                    >
                      {{ item.content }}
                    </NText>
                    <div class="mb-1 mt-2 flex items-center justify-between">
                      <div class="group flex items-center gap-2">
                        <SvgIcon local-icon="mdi-file-document-outline" class="text-gray-300" />
                        <NText class="text-xs font-medium">
                          {{ item.documentName || $t('ai.knowledge_manager.sandbox.unknownDoc') }}
                        </NText>
                        <NTooltip trigger="hover">
                          <template #trigger>
                            <SvgIcon
                              local-icon="mdi-download"
                              class="text-md cursor-pointer pt-1 text-gray-400 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                              @click.stop="handleDownload(item)"
                            />
                          </template>
                          {{ $t('ai.knowledge_manager.sandbox.downloadFile') }}
                        </NTooltip>
                      </div>
                    </div>

                    <!-- 匹配问题展示 -->
                    <div
                      v-if="item.matchedQuestions && item.matchedQuestions.length > 0"
                      class="mt-2 rounded bg-primary/5 p-2"
                    >
                      <div class="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <SvgIcon local-icon="mdi-help-circle-outline" class="text-primary" />
                        <span>{{ $t('ai.knowledge_manager.sandbox.matchedQuestions') }}</span>
                      </div>
                      <div class="flex flex-col gap-1">
                        <div
                          v-for="(q, qIndex) in item.matchedQuestions"
                          :key="qIndex"
                          class="line-clamp-1 text-xs text-gray-600 dark:text-gray-300"
                          :title="q"
                        >
                          • {{ q }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </NCard>
            </div>

            <NEmpty v-else-if="searched && !loading" :description="$t('ai.knowledge_manager.sandbox.noResult')" />
            <NEmpty v-else :description="$t('ai.knowledge_manager.sandbox.emptyInput')" />
          </NScrollbar>
        </NSpin>
      </NCard>
    </div>
  </NModal>

  <!-- 详情弹窗 -->
  <NModal
    v-model:show="showDetailModal"
    class="w-600px"
    preset="card"
    :title="currentDetail?.documentName || $t('ai.knowledge_manager.sandbox.detailTitle')"
  >
    <div v-if="currentDetail" class="max-h-60vh overflow-y-auto">
      <div class="mb-4 flex flex-wrap gap-2">
        <NTag v-if="currentDetail.score" type="success" size="small">
          {{ $t('ai.knowledge_manager.sandbox.similarity', { score: formatScore(currentDetail.score) }) }}
        </NTag>
        <NTag v-if="currentDetail.rerankScore" type="info" size="small">
          Rerank: {{ formatScore(currentDetail.rerankScore) }}
        </NTag>
        <NTag size="small" :bordered="false">ID: {{ currentDetail.chunkId }}</NTag>
        <div v-if="currentDetail.title" class="mt-2 w-full text-base font-bold">
          {{ currentDetail.title }}
        </div>
      </div>
      <div class="rounded bg-gray-50 p-4 text-sm leading-relaxed dark:bg-gray-800">
        <div class="whitespace-pre-wrap">{{ currentDetail.content }}</div>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.retrieval-highlight :deep(mark) {
  background-color: #fef08a;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
