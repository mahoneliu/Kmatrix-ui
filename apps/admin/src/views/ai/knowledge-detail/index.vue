<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NDropdown,
  NEmpty,
  NList,
  NListItem,
  NSpace,
  NTag,
  NThing,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  createOnlineDocument,
  createWebLinkDocument,
  deleteDataset,
  fetchDatasetsByKbId,
  fetchKnowledgeBaseDetail
} from '@/service/api/ai/knowledge';
import DatasetModal from './modules/dataset-modal.vue';
import OnlineDocModal from './modules/online-doc-modal.vue';
import WebLinkModal from './modules/web-link-modal.vue';
import DocumentTable from './modules/document-table.vue';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();

const kbId = computed(() => route.query.kbId as string);

const kb = ref<Api.AI.KB.KnowledgeBase | null>(null);
const datasets = ref<Api.AI.KB.Dataset[]>([]);
const selectedDatasetId = ref<CommonType.IdType | null>(null);

const loading = ref(false);
const datasetModalVisible = ref(false);
const editingDataset = ref<Api.AI.KB.Dataset | null>(null);

// 在线文档和网页链接模态框
const onlineDocModalVisible = ref(false);
const webLinkModalVisible = ref(false);
// const chunkManagerModalVisible = ref(false);

const tableRef = ref<any>(null);

async function loadKnowledgeBase() {
  if (!kbId.value) return;
  try {
    const { data } = await fetchKnowledgeBaseDetail(kbId.value);
    kb.value = data;
  } catch {
    message.error('加载知识库失败');
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
      await deleteDataset([ds.id!]);
      message.success('删除成功');
      if (selectedDatasetId.value === ds.id) {
        selectedDatasetId.value = null;
      }
      loadDatasets();
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
    const promises = data.urls.map(url => createWebLinkDocument(selectedDatasetId.value!, url));
    await Promise.all(promises);
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

function goBack() {
  router.push({ name: 'ai_knowledge-manager' });
}

onMounted(() => {
  loadKnowledgeBase();
  loadDatasets();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NButton quaternary @click="goBack">
            <template #icon>
              <SvgIcon icon="mdi:arrow-left" />
            </template>
          </NButton>
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
            <SvgIcon icon="mdi:book-open-page-variant" />
          </div>
          <div>
            <div class="text-lg font-bold">{{ kb?.name || '知识库详情' }}</div>
            <div class="text-xs text-gray-400">{{ kb?.description }}</div>
          </div>
        </div>
        <NSpace>
          <NButton type="primary" ghost @click="handleAddDataset">
            <template #icon>
              <SvgIcon icon="mdi:folder-plus" />
            </template>
            新建数据集
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <!-- 主内容区 -->
    <div class="flex flex-1 gap-4 overflow-hidden">
      <!-- 左侧数据集列表 -->
      <NCard :bordered="false" size="small" class="w-64 card-wrapper" title="数据集">
        <NList v-if="datasets.length > 0" hoverable clickable>
          <NListItem
            v-for="ds in datasets"
            :key="ds.id"
            :class="{ 'bg-primary/10': selectedDatasetId === ds.id }"
            @click="selectedDatasetId = ds.id ?? null"
          >
            <NThing content-indented>
              <template #avatar>
                <div
                  class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/5 transition-all group-hover:bg-primary/10"
                >
                  <SvgIcon
                    :icon="getDatasetIcon(ds.processType)"
                    class="text-2xl text-primary transition-transform group-hover:scale-110"
                  />
                </div>
              </template>
              <template #header>
                <span class="truncate font-medium">{{ ds.name }}</span>
              </template>
              <template #description>
                <div class="flex items-center gap-1">
                  <NTag v-if="ds.isSystem" size="tiny" type="success" :bordered="false" round>系统</NTag>
                  <NTag size="tiny" :bordered="false" round>{{ getProcessTypeLabel(ds.processType) }}</NTag>
                  <span class="text-xs text-gray-400">{{ ds.documentCount || 0 }} 文档</span>
                </div>
              </template>
              <template #header-extra>
                <NDropdown
                  :options="[
                    { label: '编辑', key: 'edit' },
                    { label: '删除', key: 'delete' }
                  ]"
                  trigger="click"
                  @select="
                    key => {
                      if (key === 'edit') handleEditDataset(ds);
                      else if (key === 'delete') handleDeleteDataset(ds);
                    }
                  "
                >
                  <NButton
                    quaternary
                    size="tiny"
                    class="opacity-0 transition-opacity group-hover:opacity-100"
                    @click.stop
                  >
                    <SvgIcon icon="mdi:dots-vertical" />
                  </NButton>
                </NDropdown>
              </template>
            </NThing>
          </NListItem>
        </NList>
        <NEmpty v-else description="暂无数据集" />
      </NCard>

      <!-- @open-chunk-manager="handleOpenChunkManager" -->
      <!-- 右侧文档表格 -->
      <DocumentTable
        v-if="selectedDatasetId"
        ref="tableRef"
        :dataset-id="selectedDatasetId"
        :process-type="selectedDataset?.processType"
        class="flex-1 card-wrapper"
        @add-online-doc="onlineDocModalVisible = true"
        @add-web-link="webLinkModalVisible = true"
      />
      <NCard v-else :bordered="false" size="small" class="flex-1 card-wrapper">
        <NEmpty description="请先选择或创建数据集" class="h-full flex-center" />
      </NCard>
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

    <!-- <ChunkManagerModal v-model:visible="chunkManagerModalVisible" :document-id="currentDocumentId" /> -->
  </div>
</template>

<style scoped>
.n-list.n-list--bordered .n-list-item,
.n-list.n-list--hoverable .n-list-item {
  padding: 12px 1px;
}
</style>
