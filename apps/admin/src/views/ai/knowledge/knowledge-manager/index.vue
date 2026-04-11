<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDropdown,
  NEmpty,
  NGrid,
  NGridItem,
  NInput,
  NPagination,
  NScrollbar,
  NSpace,
  NStatistic,
  NTag,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  deleteKnowledgeBase,
  fetchKnowledgeBaseConfig,
  fetchKnowledgeBaseList,
  fetchKnowledgeBaseStatistics
} from '@/service/api/ai/knowledge';
import { fetchModelList } from '@/service/api/ai/model';
import { $t } from '@/locales';
import KnowledgeBaseModal from './modules/kb-modal.vue';
import RetrievalSandbox from './modules/retrieval-sandbox.vue';

const router = useRouter();
const message = useMessage();
const dialog = useDialog();

const modalVisible = ref(false);
const editingKb = ref<Api.AI.KB.KnowledgeBase | null>(null);
const sandboxVisible = ref(false);

const searchParams = ref<Api.AI.KB.KnowledgeBaseSearchParams>({
  pageNum: 1,
  pageSize: 20,
  name: ''
});

const kbList = ref<Api.AI.KB.KnowledgeBase[]>([]);
const loading = ref(false);
const total = ref(0);

// 统计信息
const statistics = ref<Api.AI.KB.Statistics>({
  totalKbs: 0,
  totalDatasets: 0,
  totalDocuments: 0,
  totalChunks: 0,
  processingDocs: 0,
  errorDocs: 0
});

async function loadStatistics() {
  try {
    const { data } = await fetchKnowledgeBaseStatistics();
    if (data) {
      statistics.value = data;
    }
  } catch {
    // ignore
  }
}

const unifiedEmbeddingModel = ref(true);
const models = ref<Api.AI.Admin.Model[]>([]);

async function loadModelsAndConfig() {
  try {
    const [configRes, modelRes] = await Promise.all([fetchKnowledgeBaseConfig(), fetchModelList({ modelType: '2' })]);
    if (!configRes.error && configRes.data) {
      unifiedEmbeddingModel.value = configRes.data.unifiedEmbeddingModel;
    }
    if (!modelRes.error && modelRes.data) {
      models.value = modelRes.data;
    }
  } catch {
    // Failed to load KB config or models
  }
}

function getEmbeddingModelDisplay(item: Api.AI.KB.KnowledgeBase) {
  if (unifiedEmbeddingModel.value) {
    // If unified mode, theoretically it uses the default embedding model.
    const defaultModel = models.value.find(m => m.isDefault === 1);
    return defaultModel ? defaultModel.modelName : '全局统一向量模型';
  }
  if (!item.embeddingModelId) return '未绑定模型';
  const model = models.value.find(m => m.modelId === item.embeddingModelId);
  return model ? model.modelName : '未知模型';
}

async function getData() {
  loading.value = true;
  try {
    const params = {
      ...searchParams.value,
      pageNo: undefined, // 兼容老的配置防止误传
      pageNum: searchParams.value.pageNum || 1,
      pageSize: searchParams.value.pageSize || 20
    };
    const { data } = await fetchKnowledgeBaseList(params);
    if (data && data.rows) {
      kbList.value = data.rows;
      total.value = data.total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editingKb.value = null;
  modalVisible.value = true;
}

function handleEdit(item: Api.AI.KB.KnowledgeBase) {
  editingKb.value = item;
  modalVisible.value = true;
}

async function handleDelete(item: Api.AI.KB.KnowledgeBase) {
  if (!item.id) return;

  dialog.warning({
    title: $t('ai.knowledge_manager.deleteConfirmTitle'),
    content: $t('ai.knowledge_manager.deleteConfirmContent', { name: item.name }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await deleteKnowledgeBase([item.id!]);
      if (!error) {
        message.success($t('ai.knowledge_manager.deleteSuccess'));
        getData();
        loadStatistics();
      }
    }
  });
}

function handleManage(item: Api.AI.KB.KnowledgeBase) {
  if (!item.id) return;
  router.push({
    name: 'ai_knowledge_knowledge-detail',
    query: { kbId: item.id.toString() }
  });
}

function onModalClose(success: boolean) {
  modalVisible.value = false;
  if (success) {
    getData();
    loadStatistics();
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStatusColor(status?: string) {
  return status === 'ACTIVE' ? 'success' : 'warning';
}

onMounted(() => {
  loadModelsAndConfig();
  getData();
  loadStatistics();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 统计面板 -->
    <div :bordered="false" class="mb-4 pl-4">
      <NGrid :cols="6" responsive="screen" x-gap="16" y-gap="16">
        <NGridItem>
          <NStatistic
            class="text-xs"
            :label="$t('ai.knowledge_manager.stats.knowledgeBase')"
            :value="statistics.totalKbs"
          >
            <template #prefix>
              <SvgIcon local-icon="mdi-book-open-page-variant" class="text-primary" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic
            class="text-xs"
            :label="$t('ai.knowledge_manager.stats.dataset')"
            :value="statistics.totalDatasets"
          >
            <template #prefix>
              <SvgIcon local-icon="mdi-folder" class="text-info" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic
            class="text-xs"
            :label="$t('ai.knowledge_manager.stats.document')"
            :value="statistics.totalDocuments"
          >
            <template #prefix>
              <SvgIcon local-icon="mdi-file-document" class="text-success" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic class="text-xs" :label="$t('ai.knowledge_manager.stats.chunk')" :value="statistics.totalChunks">
            <template #prefix>
              <SvgIcon local-icon="mdi-puzzle" class="text-warning" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic
            class="text-xs"
            :label="$t('ai.knowledge_manager.stats.processing')"
            :value="statistics.processingDocs"
          >
            <template #prefix>
              <SvgIcon local-icon="mdi-progress-clock" class="text-info" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic class="text-xs" :label="$t('ai.knowledge_manager.stats.failed')" :value="statistics.errorDocs">
            <template #prefix>
              <SvgIcon local-icon="mdi-alert-circle" class="text-error" />
            </template>
          </NStatistic>
        </NGridItem>
      </NGrid>
    </div>

    <!-- 搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem :title="$t('common.search')" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.name"
              clearable
              :placeholder="$t('ai.knowledge_manager.searchPlaceholder')"
              @keyup.enter="getData"
            />
            <NButton type="primary" @click="getData">
              <template #icon>
                <SvgIcon local-icon="mdi-magnify" />
              </template>
              {{ $t('common.search') }}
            </NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 知识库列表 -->
    <NCard
      :bordered="false"
      size="small"
      :title="$t('ai.knowledge_manager.listTitle')"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NSpace>
          <NButton type="info" ghost size="small" @click="sandboxVisible = true">
            <template #icon>
              <SvgIcon local-icon="mdi-flask" />
            </template>
            {{ $t('ai.knowledge_manager.retrievalTest') }}
          </NButton>
          <NButton type="primary" ghost size="small" @click="handleAdd">
            <template #icon>
              <SvgIcon local-icon="mdi-plus" />
            </template>
            {{ $t('ai.knowledge_manager.createKnowledgeBase') }}
          </NButton>
        </NSpace>
      </template>

      <NScrollbar v-if="kbList.length > 0" class="h-full" content-class="p-4">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          <div v-for="item in kbList" :key="item.id">
            <NCard
              :bordered="false"
              class="group relative h-full cursor-pointer rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 !border !border-gray-300 !border-solid dark:bg-white/5 hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.15)] dark:!border-gray-700"
              content-class="pb-2"
              hoverable
              @click="handleManage(item)"
            >
              <!-- 状态标签 -->
              <div class="absolute right-3 top-3 z-10">
                <NTag :bordered="false" :type="getStatusColor(item.status)" size="small">
                  {{
                    item.status === 'ACTIVE'
                      ? $t('ai.knowledge_manager.status.active')
                      : $t('ai.knowledge_manager.status.archived')
                  }}
                </NTag>
              </div>

              <template #header>
                <div class="flex items-center gap-3 pr-20">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
                    <SvgIcon local-icon="mdi-book-open-page-variant" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-base font-bold">{{ item.name }}</div>
                  </div>
                </div>
              </template>

              <div class="line-clamp-2 mb-4 min-h-10 text-sm text-gray-500">
                {{ item.description || $t('ai.knowledge_manager.noDescription') }}
              </div>

              <!-- 统计信息 -->
              <div class="flex items-center gap-4 text-xs text-gray-400">
                <div class="flex items-center gap-1">
                  <SvgIcon local-icon="mdi-folder-outline" />
                  <span>
                    {{ $t('ai.knowledge_manager.datasetCount', { count: item.datasetCount || 0 }) }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <SvgIcon local-icon="mdi-file-document-outline" />
                  <span>
                    {{ $t('ai.knowledge_manager.documentCount', { count: item.documentCount || 0 }) }}
                  </span>
                </div>
              </div>

              <!-- 绑定的向量模型 -->
              <div class="mt-2 flex items-center gap-1 text-xs text-info">
                <SvgIcon local-icon="mdi-brain" />
                <span>{{ getEmbeddingModelDisplay(item) }}</span>
              </div>

              <!-- 时间 -->
              <div class="mt-2 text-xs text-gray-400">
                {{ formatDate(item.updateTime || item.createTime || '') }}
              </div>

              <!-- 操作菜单 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="[
                    {
                      label: $t('ai.knowledge_manager.manage'),
                      key: 'manage',
                      icon: () => h(SvgIcon, { localIcon: 'mdi-cog' })
                    },
                    { label: $t('common.edit'), key: 'edit', icon: () => h(SvgIcon, { localIcon: 'mdi-pencil' }) },
                    { type: 'divider' },
                    {
                      label: $t('common.delete'),
                      key: 'delete',
                      icon: () => h(SvgIcon, { localIcon: 'mdi-delete', class: 'text-error' }),
                      labelProps: { class: 'text-error' }
                    }
                  ]"
                  trigger="hover"
                  @select="
                    key => {
                      if (key === 'manage') handleManage(item);
                      else if (key === 'edit') handleEdit(item);
                      else if (key === 'delete') handleDelete(item);
                    }
                  "
                >
                  <NButton class="text-gray-500 hover:text-primary" quaternary size="small" @click.stop>
                    <template #icon>
                      <SvgIcon local-icon="mdi-dots-horizontal" />
                    </template>
                  </NButton>
                </NDropdown>
              </div>
            </NCard>
          </div>
        </div>
      </NScrollbar>

      <div v-if="kbList.length > 0" class="flex justify-end border-t border-gray-100 p-4 dark:border-gray-800">
        <NPagination
          v-model:page="searchParams.pageNum"
          v-model:page-size="searchParams.pageSize"
          :item-count="total"
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
          show-quick-jumper
          @update:page="getData"
          @update:page-size="getData"
        />
      </div>

      <NEmpty v-else :description="$t('ai.knowledge_manager.emptyDescription')" class="h-full flex-center" />
    </NCard>

    <KnowledgeBaseModal
      v-model:visible="modalVisible"
      :data="editingKb"
      @success="onModalClose(true)"
      @cancel="onModalClose(false)"
    />

    <RetrievalSandbox v-model:visible="sandboxVisible" />
  </div>
</template>

<style scoped></style>
