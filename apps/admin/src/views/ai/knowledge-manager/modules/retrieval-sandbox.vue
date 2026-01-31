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
import { fetchAllKnowledgeBases, fetchDatasetsByKbId, searchKnowledge } from '@/service/api/ai/knowledge';

interface Props {
  visible: boolean;
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
const enableRerank = ref(false);
const enableHighlight = ref(true); // 关键词模式默认开启高亮

// 数据
const knowledgeBases = ref<Api.AI.KB.KnowledgeBase[]>([]);
const datasets = ref<Api.AI.KB.Dataset[]>([]);
const results = ref<Api.AI.KB.RetrievalResult[]>([]);
const loading = ref(false);
const searched = ref(false);

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
    knowledgeBases.value = data || [];
  } catch {
    // ignore
  }
}

// 加载数据集列表（基于选择的知识库）
async function loadDatasets() {
  if (selectedKbIds.value.length === 0) {
    datasets.value = [];
    selectedDatasetIds.value = [];
    return;
  }

  try {
    const allDatasets: Api.AI.KB.Dataset[] = [];
    const resultsList = await Promise.all(selectedKbIds.value.map(id => fetchDatasetsByKbId(id)));
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

// 监听知识库选择变化
watch(selectedKbIds, () => {
  loadDatasets();
});

// 监听弹窗打开
watch(
  () => props.visible,
  val => {
    if (val && knowledgeBases.value.length === 0) {
      loadKnowledgeBases();
    }
  }
);

// 重置
function handleReset() {
  query.value = '';
  selectedKbIds.value = [];
  selectedDatasetIds.value = [];
  topK.value = 5;
  threshold.value = 0.5;
  mode.value = 'HYBRID';
  enableRerank.value = false;
  enableHighlight.value = true;
  results.value = [];
  searched.value = false;
}
</script>

<template>
  <NModal v-model:show="showModal" preset="card" title="检索测试沙箱" class="w-220">
    <template #header-extra>
      <NButton tertiary size="small" @click="handleReset">
        <template #icon>
          <SvgIcon icon="mdi:refresh" />
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
            <SvgIcon icon="mdi:magnify" class="text-gray-400" />
          </template>
        </NInput>
        <NButton type="primary" :loading="loading" :disabled="!query.trim()" @click="handleSearch">
          <template #icon>
            <SvgIcon icon="mdi:send" />
          </template>
          检索
        </NButton>
      </div>

      <!-- 配置面板 -->
      <NCollapse default-expanded-names="config">
        <template #arrow>
          <SvgIcon icon="mdi:chevron-right" />
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
            <div class="flex items-center gap-2">
              <div class="text-sm text-gray-500">启用 Rerank</div>
              <NSwitch v-model:value="enableRerank" />
              <NTooltip>
                <template #trigger>
                  <SvgIcon icon="mdi:help-circle-outline" class="cursor-help text-gray-400" />
                </template>
                使用重排序模型对结果进行二次排序，提高准确性
              </NTooltip>
            </div>

            <!-- Highlight (only for KEYWORD mode) -->
            <div v-if="mode === 'KEYWORD'" class="flex items-center gap-2">
              <div class="text-sm text-gray-500">启用高亮</div>
              <NSwitch v-model:value="enableHighlight" />
              <NTooltip>
                <template #trigger>
                  <SvgIcon icon="mdi:help-circle-outline" class="cursor-help text-gray-400" />
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
            <SvgIcon icon="mdi:format-list-bulleted" />
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
                  <div class="flex flex-col items-center gap-1">
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
                    <div class="mb-1 flex items-center gap-2">
                      <SvgIcon icon="mdi:file-document-outline" class="text-gray-400" />
                      <NText class="text-sm font-medium">{{ item.documentName || '未知文档' }}</NText>
                    </div>
                    <!-- 高亮内容使用 v-html -->
                    <!-- eslint-disable vue/no-v-html -->
                    <div
                      v-if="item.highlight"
                      class="retrieval-highlight line-clamp-4 text-sm text-gray-600 dark:text-gray-300"
                      v-html="item.highlight"
                    ></div>
                    <!-- eslint-enable vue/no-v-html -->
                    <NText v-else class="line-clamp-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ item.content }}
                    </NText>
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
</template>

<style scoped>
.retrieval-highlight :deep(mark) {
  background-color: #fef08a;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
