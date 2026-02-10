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
    window.$message?.warning('无法下载：缺少文档ID');
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
    window.$message?.error('下载失败');
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
  { label: '向量', value: 'VECTOR' },
  { label: '关键词', value: 'KEYWORD' },
  { label: '混合', value: 'HYBRID' }
];

// 加载知识库列表
async function loadKnowledgeBases() {
  try {
    const { data } = await fetchAllKnowledgeBases();

    // 如果指定了 kbId，则只保留该知识库，或者在列表中选中
    if (props.kbId) {
      // 如果是固定模式，我们可以只显示该知识库，或者仍然显示所有但选中且禁用
      // 这里为了简单，如果 fixedKb 为 true，我们仍然加载所有以便显示名称，但会强制选中
    }

    knowledgeBases.value = data || [];
  } catch {
    // ignore
  }
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
    CONTENT: '命中全文',
    TITLE: '命中标题',
    QUESTION: '命中问题'
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
  <NModal v-model:show="showModal" :mask-closable="false" preset="card" title="检索测试沙箱" class="w-220">
    <template #header-extra>
      <NButton tertiary size="small" @click="handleReset">
        <template #icon>
          <SvgIcon local-icon="mdi-refresh" />
        </template>
        重置
      </NButton>
    </template>

    <div class="flex flex-col gap-4">
      <!-- 查询输入 -->
      <div class="flex items-center gap-3">
        <NInput
          v-model:value="query"
          placeholder="输入测试问题..."
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
          检索
        </NButton>
      </div>

      <!-- 配置面板 -->
      <NCollapse default-expanded-names="config">
        <template #arrow>
          <SvgIcon local-icon="mdi-chevron-right" />
        </template>
        <NCollapseItem title="检索配置" name="config">
          <div class="grid grid-cols-2 gap-4">
            <!-- 知识库选择 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">知识库</div>
              <NSelect
                v-model:value="selectedKbIds"
                :options="kbOptions"
                multiple
                clearable
                placeholder="选择知识库 (可多选)"
                :disabled="fixedKb"
              />
            </div>

            <!-- 数据集选择 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">数据集</div>
              <NSelect
                v-model:value="selectedDatasetIds"
                :options="datasetOptions"
                multiple
                clearable
                placeholder="选择数据集 (可多选)"
                :disabled="datasets.length === 0"
              />
            </div>

            <!-- TopK -->
            <div>
              <div class="mb-1 text-sm text-gray-500">返回数量 (TopK)</div>
              <div class="flex items-center gap-2">
                <NSlider v-model:value="topK" :min="1" :max="20" :step="1" class="flex-1" />
                <NInputNumber v-model:value="topK" :min="1" :max="20" size="small" class="w-20" />
              </div>
            </div>

            <!-- 阈值 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">相似度阈值</div>
              <div class="flex items-center gap-2">
                <NSlider v-model:value="threshold" :min="0" :max="1" :step="0.05" class="flex-1" />
                <NInputNumber v-model:value="threshold" :min="0" :max="1" :step="0.05" size="small" class="w-20" />
              </div>
            </div>

            <!-- 检索模式 -->
            <div>
              <div class="mb-1 text-sm text-gray-500">检索模式</div>
              <NRadioGroup v-model:value="mode" size="small">
                <NRadioButton v-for="opt in modeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </NRadioButton>
              </NRadioGroup>
            </div>

            <!-- Rerank -->
            <div>
              <div class="text-sm text-gray-500">
                启用 Rerank
                <NTooltip>
                  <template #trigger>
                    <SvgIcon local-icon="mdi-help-circle-outline" class="cursor-help text-gray-400" />
                  </template>
                  使用重排序模型对结果进行二次排序，提高准确性
                </NTooltip>
              </div>
              <NSwitch v-model:value="enableRerank" />
            </div>

            <!-- Highlight (only for KEYWORD mode) -->
            <div v-if="mode === 'KEYWORD'" class="flex items-center gap-2">
              <div class="text-sm text-gray-500">启用高亮</div>
              <NSwitch v-model:value="enableHighlight" />
              <NTooltip>
                <template #trigger>
                  <SvgIcon local-icon="mdi-help-circle-outline" class="cursor-help text-gray-400" />
                </template>
                在检索结果中高亮显示匹配的关键词
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
            <span>检索结果</span>
            <NTag v-if="searched" size="small" :bordered="false">{{ results.length }} 条</NTag>
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
                        <NText class="text-xs font-medium">{{ item.documentName || '未知文档' }}</NText>
                        <NTooltip trigger="hover">
                          <template #trigger>
                            <SvgIcon
                              local-icon="mdi-download"
                              class="text-md cursor-pointer pt-1 text-gray-400 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                              @click.stop="handleDownload(item)"
                            />
                          </template>
                          下载原文件
                        </NTooltip>
                      </div>

                      <!-- 来源类型标签 -->
                    </div>

                    <!-- 匹配问题展示 -->
                    <div
                      v-if="item.matchedQuestions && item.matchedQuestions.length > 0"
                      class="mt-2 rounded bg-primary/5 p-2"
                    >
                      <div class="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <SvgIcon local-icon="mdi-help-circle-outline" class="text-primary" />
                        <span>匹配关联问题:</span>
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

            <NEmpty v-else-if="searched && !loading" description="未找到匹配结果，请调整查询或参数" />
            <NEmpty v-else description="输入问题并点击检索" />
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
    :title="currentDetail?.documentName || '片段详情'"
  >
    <div v-if="currentDetail" class="max-h-60vh overflow-y-auto">
      <div class="mb-4 flex flex-wrap gap-2">
        <NTag v-if="currentDetail.score" type="success" size="small">
          相似度: {{ formatScore(currentDetail.score) }}
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
