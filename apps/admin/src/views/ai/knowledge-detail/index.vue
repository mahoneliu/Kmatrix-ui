<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NDropdown,
  NEmpty,
  NList,
  NListItem,
  NPopconfirm,
  NSpace,
  NTag,
  NText,
  NThing,
  NUpload,
  NUploadDragger,
  type UploadFileInfo,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  deleteDataset,
  deleteDocument,
  fetchDatasetsByKbId,
  fetchDocumentsByDataset,
  fetchKnowledgeBaseDetail,
  reprocessDocument,
  uploadDocument
} from '@/service/api/ai/admin/knowledge';
import DatasetModal from './modules/dataset-modal.vue';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();

const kbId = computed(() => route.query.kbId as string);

const kb = ref<Api.AI.KB.KnowledgeBase | null>(null);
const datasets = ref<Api.AI.KB.Dataset[]>([]);
const selectedDatasetId = ref<CommonType.IdType | null>(null);
const documents = ref<Api.AI.KB.Document[]>([]);

const loading = ref(false);
const datasetModalVisible = ref(false);
const editingDataset = ref<Api.AI.KB.Dataset | null>(null);
const uploading = ref(false);

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

async function loadDocuments() {
  if (!selectedDatasetId.value) {
    documents.value = [];
    return;
  }
  try {
    const { data } = await fetchDocumentsByDataset(selectedDatasetId.value);
    documents.value = data || [];
  } catch {
    documents.value = [];
  }
}

watch(selectedDatasetId, () => {
  loadDocuments();
});

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

async function handleUpload(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  if (!selectedDatasetId.value || !options.file.file) return;

  uploading.value = true;
  try {
    await uploadDocument(selectedDatasetId.value, options.file.file);
    message.success('上传成功，正在处理中...');
    loadDocuments();
  } catch {
    message.error('上传失败');
  } finally {
    uploading.value = false;
  }
}

async function handleDeleteDocument(doc: Api.AI.KB.Document) {
  if (!doc.id) return;
  await deleteDocument(doc.id);
  message.success('删除成功');
  loadDocuments();
}

async function handleReprocessDocument(doc: Api.AI.KB.Document) {
  if (!doc.id) return;
  await reprocessDocument(doc.id);
  message.success('已重新触发处理');
  loadDocuments();
}

function getStatusType(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PROCESSING':
      return 'info';
    case 'ERROR':
      return 'error';
    default:
      return 'warning';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return '已完成';
    case 'PROCESSING':
      return '处理中';
    case 'ERROR':
      return '失败';
    default:
      return '待处理';
  }
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
                <SvgIcon icon="mdi:folder" class="text-xl text-primary" />
              </template>
              <template #header>
                <span class="truncate">{{ ds.name }}</span>
              </template>
              <template #description>
                <NTag size="tiny" :bordered="false">{{ ds.type }}</NTag>
                <span class="ml-2 text-xs text-gray-400">{{ ds.documentCount || 0 }} 文档</span>
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
                  <NButton quaternary size="tiny" @click.stop>
                    <SvgIcon icon="mdi:dots-vertical" />
                  </NButton>
                </NDropdown>
              </template>
            </NThing>
          </NListItem>
        </NList>
        <NEmpty v-else description="暂无数据集" />
      </NCard>

      <!-- 右侧文档列表 -->
      <NCard :bordered="false" size="small" class="flex-1 card-wrapper" title="文档列表">
        <template v-if="selectedDatasetId" #header-extra>
          <NButton type="primary" size="small" :loading="uploading">
            <template #icon>
              <SvgIcon icon="mdi:upload" />
            </template>
            上传文档
          </NButton>
        </template>

        <div v-if="selectedDatasetId" class="h-full flex flex-col gap-4">
          <!-- 上传区域 -->
          <NUpload
            multiple
            directory-dnd
            :max="10"
            accept=".pdf,.doc,.docx,.txt,.md"
            :custom-request="({ file }) => handleUpload({ file, fileList: [] })"
          >
            <NUploadDragger>
              <div class="flex flex-col items-center gap-2 py-4">
                <SvgIcon icon="mdi:cloud-upload" class="text-4xl text-gray-400" />
                <NText class="text-gray-500">点击或拖拽文件到此处上传</NText>
                <NText depth="3" class="text-xs">支持 PDF、Word、TXT、Markdown 格式</NText>
              </div>
            </NUploadDragger>
          </NUpload>

          <!-- 文档列表 -->
          <div class="flex-1 overflow-auto">
            <NList v-if="documents.length > 0" hoverable>
              <NListItem v-for="doc in documents" :key="doc.id">
                <NThing content-indented>
                  <template #avatar>
                    <SvgIcon icon="mdi:file-document" class="text-xl text-info" />
                  </template>
                  <template #header>{{ doc.originalFilename }}</template>
                  <template #description>
                    <NSpace size="small">
                      <NTag :type="getStatusType(doc.status)" size="small">
                        {{ getStatusLabel(doc.status) }}
                      </NTag>
                      <span class="text-xs text-gray-400">{{ formatFileSize(doc.fileSize) }}</span>
                      <span v-if="doc.chunkCount" class="text-xs text-gray-400">{{ doc.chunkCount }} 切片</span>
                    </NSpace>
                    <div v-if="doc.errorMsg" class="mt-1 text-xs text-error">
                      {{ doc.errorMsg }}
                    </div>
                  </template>
                  <template #header-extra>
                    <NSpace>
                      <NPopconfirm @positive-click="handleReprocessDocument(doc)">
                        <template #trigger>
                          <NButton quaternary size="tiny" :disabled="doc.status === 'PROCESSING'">
                            <SvgIcon icon="mdi:refresh" />
                          </NButton>
                        </template>
                        重新处理此文档？
                      </NPopconfirm>
                      <NPopconfirm @positive-click="handleDeleteDocument(doc)">
                        <template #trigger>
                          <NButton quaternary size="tiny" type="error">
                            <SvgIcon icon="mdi:delete" />
                          </NButton>
                        </template>
                        确定删除此文档？
                      </NPopconfirm>
                    </NSpace>
                  </template>
                </NThing>
              </NListItem>
            </NList>
            <NEmpty v-else description="暂无文档，请上传" class="py-8" />
          </div>
        </div>
        <NEmpty v-else description="请先选择或创建数据集" class="h-full flex-center" />
      </NCard>
    </div>

    <DatasetModal
      v-model:visible="datasetModalVisible"
      :kb-id="kbId"
      :data="editingDataset"
      @success="onDatasetModalClose(true)"
      @cancel="onDatasetModalClose(false)"
    />
  </div>
</template>

<style scoped></style>
