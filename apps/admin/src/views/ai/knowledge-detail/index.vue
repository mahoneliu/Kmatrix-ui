<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  NButton,
  NCard,
  NDropdown,
  NEmpty,
  NList,
  NListItem,
  NPopover,
  NTabPane,
  NTabs,
  NTag,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  batchCreateWebLinkDocument,
  createOnlineDocument,
  deleteDataset,
  fetchDatasetsByKbId,
  fetchKnowledgeBaseDetail,
  fetchKnowledgeBaseDetailStatistics
} from '@/service/api/ai/knowledge';
import RetrievalSandbox from '../knowledge-manager/modules/retrieval-sandbox.vue';
import DatasetModal from './modules/dataset-modal.vue';
import OnlineDocModal from './modules/online-doc-modal.vue';
import WebLinkModal from './modules/web-link-modal.vue';
import DocumentTable from './modules/document-table.vue';
import QuestionTable from './modules/question-table.vue';

const route = useRoute();
const message = useMessage();
const dialog = useDialog();

const kbId = computed(() => route.query.kbId as string);

const kb = ref<Api.AI.KB.KnowledgeBase | null>(null);
const stats = ref<Api.AI.KB.Statistics | null>(null);
const datasets = ref<Api.AI.KB.Dataset[]>([]);
const selectedDatasetId = ref<CommonType.IdType | null>(null);

const loading = ref(false);
const datasetModalVisible = ref(false);
const editingDataset = ref<Api.AI.KB.Dataset | null>(null);
const sandboxVisible = ref(false);

// 在线文档和网页链接模态框
const onlineDocModalVisible = ref(false);
const webLinkModalVisible = ref(false);
// const chunkManagerModalVisible = ref(false);

const tableRef = ref<any>(null);
const questionTableRef = ref<any>(null);
const activeTab = ref('documents');

async function loadKnowledgeBase() {
  if (!kbId.value) return;
  try {
    const { data } = await fetchKnowledgeBaseDetail(kbId.value);
    kb.value = data;
  } catch {
    message.error('加载知识库失败');
  }
}

async function loadStats() {
  if (!kbId.value) return;
  try {
    const { data } = await fetchKnowledgeBaseDetailStatistics(kbId.value);
    stats.value = data;
  } catch {
    // ignore
  }
}

async function loadDatasets() {
  if (!kbId.value) return;
  loading.value = true;
  try {
    const { data } = await fetchDatasetsByKbId(kbId.value);
    datasets.value = data || [];
    // 默认选中第一个
    if (datasets.value.length > 0 && !selectedDatasetId.value) {
      selectedDatasetId.value = datasets.value[0].id!;
    }
  } finally {
    loading.value = false;
  }
}

function handleAddDataset() {
  editingDataset.value = null;
  datasetModalVisible.value = true;
}

function handleEditDataset(ds: Api.AI.KB.Dataset) {
  editingDataset.value = ds;
  datasetModalVisible.value = true;
}

async function handleDeleteDataset(ds: Api.AI.KB.Dataset) {
  if (!ds.id) return;
  dialog.warning({
    title: '确认删除',
    content: `确定要删除数据集"${ds.name}"吗？所有关联的文档都将被删除！`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteDataset([ds.id!]);
      if (!error) {
        message.success('删除成功');
        if (selectedDatasetId.value === ds.id) {
          selectedDatasetId.value = null;
        }
        loadDatasets();
      }
    }
  });
}

function onDatasetModalClose(success: boolean) {
  datasetModalVisible.value = false;
  if (success) {
    loadDatasets();
  }
}

// 在线文档处理
async function handleSaveOnlineDoc(data: { title: string; content: string }) {
  if (!selectedDatasetId.value) return;

  try {
    await createOnlineDocument(selectedDatasetId.value, data.title, data.content);
    message.success('在线文档保存成功');
    tableRef.value?.getData();
  } catch {
    message.error('保存失败');
  }
}

// 网页链接处理
async function handleSubmitWebLink(data: { urls: string[] }) {
  if (!selectedDatasetId.value) return;

  try {
    // 批量添加网页链接
    await batchCreateWebLinkDocument(selectedDatasetId.value!, data.urls);
    message.success(`成功添加 ${data.urls.length} 个网页链接`);
    tableRef.value?.getData();
  } catch {
    message.error('添加失败');
  }
}

// 获取当前选中的数据集
const selectedDataset = computed(() => {
  return datasets.value.find(ds => ds.id === selectedDatasetId.value);
});

function getDatasetIcon(type?: string) {
  switch (type) {
    case 'QA_PAIR':
      return 'mdi:frequently-asked-questions';
    case 'ONLINE_DOC':
      return 'mdi:text-box-multiple';
    case 'WEB_LINK':
      return 'mdi:web';
    case 'GENERIC_FILE':
    default:
      return 'mdi:folder';
  }
}

function getProcessTypeLabel(type?: string) {
  switch (type) {
    case 'QA_PAIR':
      return '问答对';
    case 'ONLINE_DOC':
      return '在线文档';
    case 'WEB_LINK':
      return '网页链接';
    case 'GENERIC_FILE':
      return '通用文件';
    default:
      return type || '未知';
  }
}

onMounted(() => {
  loadKnowledgeBase();
  loadStats();
  loadDatasets();
});
</script>

<template>
  <div class="h-0 flex flex-col flex-1">
    <!-- 头部 -->
    <NCard :bordered="false" size="small" class="mb-2 card-wrapper">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
            <SvgIcon local-icon="mdi-book-open-variant" />
          </div>
          <div class="flex flex-col">
            <h1 class="text-xl text-gray-700 font-bold">{{ kb?.name }}</h1>
            <p class="text-sm text-gray-500">{{ kb?.description }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-12 pr-4 text-gray-500">
          <div class="flex flex-col items-center">
            <span class="text-xs text-gray-400">问题</span>
            <div class="flex items-center gap-1 text-lg text-gray-700 font-bold">
              <SvgIcon local-icon="mdi-frequently-asked-questions" class="text-purple-500" />
              <span>{{ stats?.questionCount || 0 }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-gray-400">切片</span>
            <div class="flex items-center gap-1 text-lg text-gray-700 font-bold">
              <SvgIcon local-icon="mdi-vector-square" class="text-orange-500" />
              <span>{{ stats?.totalChunks || 0 }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-gray-400">文档</span>
            <div class="flex items-center gap-1 text-lg text-gray-700 font-bold">
              <SvgIcon local-icon="mdi-file-document-outline" class="text-green-500" />
              <span>{{ stats?.totalDocuments || 0 }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-gray-400">处理中</span>
            <div class="flex items-center gap-1 text-lg text-gray-700 font-bold">
              <SvgIcon local-icon="mdi-clock-outline" class="text-blue-500" />
              <span>{{ stats?.processingDocs || 0 }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-gray-400">失败</span>
            <div class="flex items-center gap-1 text-lg text-gray-700 font-bold">
              <SvgIcon local-icon="mdi-alert-circle-outline" class="text-red-500" />
              <span>{{ stats?.errorDocs || 0 }}</span>
            </div>
          </div>
          <NButton type="info" ghost @click="sandboxVisible = true">
            <template #icon>
              <SvgIcon local-icon="mdi-flask" />
            </template>
            检索测试
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 主内容区 -->
    <div class="h-full min-h-0 flex flex-1 overflow-hidden">
      <NTabs
        v-model:value="activeTab"
        type="line"
        pane-style="height: 100%; display: flex; flex-direction: column;"
        class="h-full min-h-0 flex flex-col flex-1"
        pane-class="flex-1 overflow-hidden h-full"
      >
        <NTabPane name="documents" tab="文档列表" class="h-full min-h-0 flex flex-col flex-1">
          <div class="h-full min-h-0 flex flex-1 gap-4 overflow-hidden">
            <!-- 左侧数据集列表 -->
            <NCard :bordered="false" size="small" class="w-55 shrink-0 card-wrapper">
              <template #header>
                <div class="flex items-center gap-1">
                  <span>数据集</span>
                  <NPopover trigger="hover" title="数据集说明" placement="right">
                    <template #trigger>
                      <div class="flex cursor-help items-center text-gray-400 hover:text-primary">
                        <SvgIcon local-icon="mdi-help-circle-outline" class="text-base" />
                      </div>
                    </template>
                    <div class="w-64">
                      <p>数据集用于归类管理知识库文档</p>
                      <p class="mt-1">不同的数据集，对应不同的收录方式和处理规则</p>
                    </div>
                  </NPopover>
                </div>
              </template>
              <template #header-extra>
                <NButton
                  ghost
                  class="hover:(bg-primary bg-opacity-20)"
                  size="tiny"
                  title="添加数据集"
                  @click="handleAddDataset"
                >
                  <template #icon>
                    <SvgIcon local-icon="mdi-plus" />
                  </template>
                </NButton>
              </template>

              <NList v-if="datasets.length > 0" hoverable clickable>
                <NListItem
                  v-for="ds in datasets"
                  :key="ds.id"
                  class="group"
                  :class="{ 'bg-primary/10': selectedDatasetId === ds.id }"
                  @click="selectedDatasetId = ds.id ?? null"
                >
                  <div class="flex flex-col gap-1 py-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 overflow-hidden">
                        <div
                          class="h-6 w-6 flex shrink-0 items-center justify-center rounded-lg bg-primary/5 transition-all group-hover:bg-primary/10"
                        >
                          <SvgIcon
                            :icon="getDatasetIcon(ds.processType)"
                            class="text-lg text-primary transition-transform group-hover:scale-110"
                          />
                        </div>
                        <span class="truncate text-sm font-medium">{{ ds.name }}</span>
                      </div>
                      <NDropdown
                        :options="[
                          { label: '编辑', key: 'edit' },
                          { label: '删除', key: 'delete' }
                        ]"
                        trigger="hover"
                        @select="
                          key => {
                            if (key === 'edit') handleEditDataset(ds);
                            else if (key === 'delete') handleDeleteDataset(ds);
                          }
                        "
                      >
                        <NButton
                          quaternary
                          size="small"
                          class="opacity-0 transition-opacity group-hover:opacity-100"
                          @click.stop
                        >
                          <SvgIcon local-icon="mdi-dots-horizontal" />
                        </NButton>
                      </NDropdown>
                    </div>

                    <div class="flex items-center gap-1">
                      <NTag v-if="ds.isSystem" size="tiny" type="success" :bordered="false" round>系统</NTag>
                      <NTag size="tiny" :bordered="false" round>{{ getProcessTypeLabel(ds.processType) }}</NTag>
                      <span class="text-xs text-gray-400">{{ ds.documentCount || 0 }} 文档</span>
                    </div>
                  </div>
                </NListItem>
              </NList>
              <NEmpty v-else description="暂无数据集" />
            </NCard>

            <!-- 右侧内容区域 -->
            <div v-if="selectedDatasetId" class="h-full flex flex-col flex-1 overflow-hidden card-wrapper">
              <DocumentTable
                ref="tableRef"
                class="h-full flex flex-col flex-1"
                :dataset-id="selectedDatasetId"
                :process-type="selectedDataset?.processType"
                @add-online-doc="onlineDocModalVisible = true"
                @add-web-link="webLinkModalVisible = true"
              />
            </div>
            <NCard v-else :bordered="false" size="small" class="flex-1 card-wrapper">
              <NEmpty description="请先选择或创建数据集" class="h-full flex-center" />
            </NCard>
          </div>
        </NTabPane>
        <NTabPane name="questions" tab="问题列表" class="h-full">
          <QuestionTable ref="questionTableRef" :kb-id="kbId" />
        </NTabPane>
      </NTabs>
    </div>

    <DatasetModal
      v-model:visible="datasetModalVisible"
      :kb-id="kbId"
      :data="editingDataset"
      @success="onDatasetModalClose(true)"
      @cancel="onDatasetModalClose(false)"
    />

    <OnlineDocModal
      v-model:visible="onlineDocModalVisible"
      :dataset-id="selectedDatasetId ? Number(selectedDatasetId) : undefined"
      @save="handleSaveOnlineDoc"
    />

    <WebLinkModal
      v-model:visible="webLinkModalVisible"
      :dataset-id="selectedDatasetId ? Number(selectedDatasetId) : undefined"
      @submit="handleSubmitWebLink"
    />

    <RetrievalSandbox v-model:visible="sandboxVisible" :kb-id="kb?.id" :fixed-kb="true" />
  </div>
</template>

<style scoped>
.n-list.n-list--bordered .n-list-item,
.n-list.n-list--hoverable .n-list-item {
  padding: 12px 5px;
}
</style>
