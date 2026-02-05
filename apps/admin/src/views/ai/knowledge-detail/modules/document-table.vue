<script setup lang="tsx">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NCard, NDropdown, NInput, NSpace, NSwitch, NUpload, NUploadDragger } from 'naive-ui';
import type { DataTableSortState, UploadFileInfo } from 'naive-ui';
import { debounce } from 'lodash-es';
import { SvgIcon } from '@sa/materials';
import { useBoolean } from '@sa/hooks';
import {
  batchDeleteDocuments,
  batchDisableDocuments,
  batchEmbedding,
  batchEnableDocuments,
  batchGenerateQuestionsByDocuments,
  disableDocument,
  embeddingDocument,
  enableDocument,
  fetchDocumentPage,
  updateDocument,
  uploadDocument
} from '@/service/api/ai/knowledge';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAuth } from '@/hooks/business/auth';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';
import ModelSelectorBasic from '@/components/ai/public/model-selector-basic.vue';
import EmbeddingConfirmModal from './embedding-confirm-modal.vue';
import DocumentSearch from './document-search.vue';
import DocumentStatusModal from './document-status-modal.vue';

defineOptions({
  name: 'DocumentTable'
});

interface Props {
  datasetId?: CommonType.IdType | null;
  processType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  datasetId: null,
  processType: 'GENERIC_FILE'
});

const emit = defineEmits<{
  (e: 'addOnlineDoc'): void;
  (e: 'addWebLink'): void;
}>();

const { hasAuth } = useAuth();
const router = useRouter();

// 向量化确认弹窗状态
const embeddingModalVisible = ref(false);
const embeddingType = ref<'single' | 'batch'>('single');
const currentEmbeddingDocId = ref<CommonType.IdType | null>(null);

// 模型选择器状态
const modelSelectorVisible = ref(false);

// 内联编辑状态
const editingId = ref<CommonType.IdType | null>(null);
const editingName = ref('');
const editInputRef = ref<InstanceType<typeof NInput> | null>(null);

const searchParams = ref<Api.AI.KB.DocumentQuery>({
  datasetId: props.datasetId ?? undefined,
  enabled: undefined,
  embeddingStatus: undefined,
  questionStatus: undefined,
  keyword: '',
  pageNum: 1,
  pageSize: 20,
  orderByColumn: 'createTime',
  isAsc: 'desc'
});

// 排序状态 - 只用于记录当前排序列和方向
const currentSortKey = ref<string>('createTime');
const currentSortOrder = ref<'ascend' | 'descend' | false>('descend');

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchDocumentPage(searchParams.value),
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: () => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'originalFilename',
        title: '文档名称',
        align: 'left',
        minWidth: 200,
        resizable: true,
        sorter: 'default',
        sortOrder: currentSortKey.value === 'originalFilename' ? currentSortOrder.value : false,
        render(row) {
          // 内联编辑模式
          if (editingId.value === row.id) {
            return (
              <NInput
                ref={editInputRef}
                v-model:value={editingName.value}
                size="small"
                onBlur={() => saveEdit(row)}
                onKeydown={(e: KeyboardEvent) => {
                  if (e.key === 'Enter') saveEdit(row);
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
            );
          }
          // 普通显示模式，双击编辑
          return (
            <span class="cursor-pointer hover:text-primary" onDblclick={() => startEdit(row)} title="双击编辑">
              {row.originalFilename}
            </span>
          );
        }
      },
      {
        key: 'fileSize',
        title: '文件大小',
        align: 'center',
        width: 100,
        sorter: 'default',
        sortOrder: currentSortKey.value === 'fileSize' ? currentSortOrder.value : false,
        render(row) {
          return formatFileSize(row.fileSize);
        }
      },
      {
        key: 'enabled',
        title: '启用',
        align: 'center',
        width: 80,
        render(row) {
          return (
            <NSwitch size="small" value={row.enabled === 1} onUpdateValue={(val: boolean) => handleEnable(row, val)}>
              {{
                checked: () => '启用',
                unchecked: () => '禁用'
              }}
            </NSwitch>
          );
        }
      },
      {
        key: 'embeddingStatus',
        title: '向量化',
        align: 'center',
        width: 90,
        render(row) {
          const statusMap: Record<number, { type: string; label: string }> = {
            0: { type: 'default', label: '未生成' },
            1: { type: 'info', label: '生成中' },
            2: { type: 'success', label: '已生成' },
            3: { type: 'error', label: '失败' }
          };
          const status = statusMap[row.embeddingStatus ?? 0] || { type: 'default', label: '-' };
          return (
            <n-tag type={status.type as any} size="small">
              {status.label}
            </n-tag>
          );
        }
      },
      {
        key: 'questionStatus',
        title: '问题生成',
        align: 'center',
        width: 90,
        render(row) {
          const statusMap: Record<number, { type: string; label: string }> = {
            0: { type: 'default', label: '未生成' },
            1: { type: 'info', label: '生成中' },
            2: { type: 'success', label: '已生成' },
            3: { type: 'error', label: '失败' }
          };
          const status = statusMap[row.questionStatus ?? 0] || { type: 'default', label: '-' };
          return (
            <n-tag type={status.type as any} size="small">
              {status.label}
            </n-tag>
          );
        }
      },
      {
        key: 'chunkCount',
        title: '切片数',
        align: 'center',
        width: 80,
        sorter: 'default',
        sortOrder: currentSortKey.value === 'chunkCount' ? currentSortOrder.value : false
      },
      {
        key: 'tokenCount',
        title: 'Token数',
        align: 'center',
        width: 100,
        sorter: 'default',
        sortOrder: currentSortKey.value === 'tokenCount' ? currentSortOrder.value : false
      },
      {
        key: 'createTime',
        title: '创建时间',
        align: 'center',
        width: 180,
        sorter: 'default',
        sortOrder: currentSortKey.value === 'createTime' ? currentSortOrder.value : false,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        render: row => {
          const chunkBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                icon="mdi:puzzle-edit"
                tooltipContent="切片管理"
                onClick={() => router.push({ name: 'ai_chunk-manager', query: { documentId: row.id } })}
              />
            );
          };

          const embeddingBtn = () => {
            return (
              <ButtonIcon
                text
                type="info"
                icon="mdi:vector-square"
                tooltipContent="向量化"
                onClick={() => handleEmbedding(row)}
              />
            );
          };

          const moreOptions = [
            {
              label: 'AI生成问题',
              key: 'generateQuestion',
              icon: () => <SvgIcon icon="mdi:chat-question" class="text-primary" />
            },
            {
              label: '状态记录',
              key: 'status',
              icon: () => <SvgIcon icon="carbon:time" class="text-info" />
            },
            {
              label: '删除',
              key: 'delete',
              icon: () => <SvgIcon icon="mdi:delete" class="text-error" />
            }
          ];

          const dropdownBtn = () => {
            return (
              <div class="h-full flex-center">
                <NDropdown trigger="hover" options={moreOptions} onSelect={key => handleDropdownSelect(key, row)}>
                  <NButton text class="h-[36px] text-icon">
                    <SvgIcon icon="mdi:dots-vertical" />
                  </NButton>
                </NDropdown>
              </div>
            );
          };

          return (
            <div class="flex-center gap-8px">
              {chunkBtn()}
              {embeddingBtn()}
              {dropdownBtn()}
            </div>
          );
        }
      }
    ]
  });

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

async function handleEnable(row: Api.AI.KB.Document, value: boolean) {
  try {
    const { error } = value ? await enableDocument(row.id!) : await disableDocument(row.id!);
    if (error) return;
    window.$message?.success(value ? '启用成功' : '禁用成功');
    await getData();
  } catch {
    // ignore
  }
}

async function handleEmbedding(row: Api.AI.KB.Document) {
  currentEmbeddingDocId.value = row.id!;
  embeddingType.value = 'single';
  embeddingModalVisible.value = true;
}

async function handleGenerateQuestions(row: Api.AI.KB.Document) {
  checkedRowKeys.value = [row.id!];
  modelSelectorVisible.value = true;
}

function handleDropdownSelect(key: string | number, row: Api.AI.KB.Document) {
  if (key === 'generateQuestion') {
    handleGenerateQuestions(row);
  } else if (key === 'status') {
    handleViewStatus(row);
  } else if (key === 'delete') {
    window.$dialog?.warning({
      title: '确认删除',
      content: '确定要删除该文档吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => handleDelete(row.id!)
    });
  }
}

function handleSorterChange(sorter: DataTableSortState | DataTableSortState[] | null) {
  // 处理单列排序
  const s = Array.isArray(sorter) ? sorter[0] : sorter;

  if (s && s.order) {
    currentSortKey.value = String(s.columnKey);
    currentSortOrder.value = s.order;
    searchParams.value.orderByColumn = String(s.columnKey);
    searchParams.value.isAsc = s.order === 'ascend' ? 'asc' : 'desc';
  } else {
    searchParams.value.orderByColumn = undefined;
    searchParams.value.isAsc = undefined;
  }
  getDataByPage();
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// 内联编辑函数
function startEdit(row: Api.AI.KB.Document) {
  editingId.value = row.id!;
  editingName.value = row.originalFilename || '';
  nextTick(() => {
    editInputRef.value?.focus();
  });
}

function cancelEdit() {
  editingId.value = null;
  editingName.value = '';
}

async function saveEdit(row: Api.AI.KB.Document) {
  if (!editingId.value || !editingName.value.trim()) {
    cancelEdit();
    return;
  }

  // 如果名称没变，直接取消
  if (editingName.value === row.originalFilename) {
    cancelEdit();
    return;
  }

  try {
    await updateDocument(editingId.value, { originalFilename: editingName.value.trim() });
    window.$message?.success('修改成功');
    cancelEdit();
    await getData();
  } catch {
    window.$message?.error('修改失败');
  }
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await batchDeleteDocuments([id]);
  if (error) return;
  onDeleted();
}

async function handleBatchDelete() {
  const { error } = await batchDeleteDocuments(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}

async function handleBatchEnable() {
  const { error } = await batchEnableDocuments(checkedRowKeys.value);
  if (error) return;
  window.$message?.success('启用成功');
  await getData();
}

async function handleBatchDisable() {
  const { error } = await batchDisableDocuments(checkedRowKeys.value);
  if (error) return;
  window.$message?.success('禁用成功');
  await getData();
}

async function handleBatchEmbedding() {
  embeddingType.value = 'batch';
  embeddingModalVisible.value = true;
}

// 确认向量化
async function handleConfirmEmbedding(option: 'UNEMBEDDED_ONLY' | 'ALL') {
  try {
    if (embeddingType.value === 'single' && currentEmbeddingDocId.value) {
      const { error } = await embeddingDocument(currentEmbeddingDocId.value, option);
      if (error) return;
    } else {
      const { error } = await batchEmbedding(checkedRowKeys.value, option);
      if (error) return;
    }
    window.$message?.success('向量化任务已开始，请稍候');
    await getData();
  } catch {
    window.$message?.error('操作失败');
  }
}

// 文档问题生成的默认提示词
const documentPrompt = `请根据以下参考文本，识别 3-5 个潜在的用户问题。
仅输出问题，每行一个。不要对它们进行编号。
参考文本：
{data}`;

// 提示信息内容
const documentAlertContent = computed(() => {
  return `
    <div class="mb-2">
      提示词中的
      <code class="rounded bg-gray-100 px-1">{data}</code>
      为分段内容的占位符,执行时替换为分段内容发送给 AI 模型;
    </div>
    <div class="mb-2">
      AI 模型根据分段内容生成相关问题,每行一个问题返回;
    </div>
    <div>生成效果依赖于所选模型和提示词,用户可自行调整至最佳效果。</div>
  `;
});

// 打开模型选择器
function handleBatchGenerateQuestions() {
  modelSelectorVisible.value = true;
}

// 确认生成问题
async function handleConfirmGenerateQuestions(params: {
  modelId: CommonType.IdType;
  prompt: string;
  temperature: number;
  maxTokens: number;
}) {
  const { error } = await batchGenerateQuestionsByDocuments(checkedRowKeys.value, {
    modelId: params.modelId,
    prompt: params.prompt,
    temperature: params.temperature,
    maxTokens: params.maxTokens
  });
  if (error) return;
  window.$message?.success('问题生成任务已开始');
  await getData();
}

const { bool: statusVisible, setTrue: openStatusModal } = useBoolean();
const currentStatusMeta = ref<Record<string, any> | null>(null);

function handleViewStatus(row: Api.AI.KB.Document) {
  currentStatusMeta.value = row.statusMeta || null;
  openStatusModal();
}

async function handleResetSearch() {
  checkedRowKeys.value = [];
  searchParams.value = {
    datasetId: props.datasetId ?? undefined,
    enabled: undefined,
    embeddingStatus: undefined,
    questionStatus: undefined,
    keyword: '',
    pageNum: 1,
    pageSize: 20,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  };
  currentSortKey.value = 'createTime';
  currentSortOrder.value = 'descend';
  await getDataByPage();
}

function handleRefresh() {
  checkedRowKeys.value = [];
  getData();
}

// 监听 datasetId 变化
watch(
  () => props.datasetId,
  (newVal: CommonType.IdType | null) => {
    checkedRowKeys.value = [];
    searchParams.value.datasetId = newVal ?? undefined;
    getDataByPage();
  }
);

// 轮询状态
const pollingInterval = ref<number | null>(null);

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
}

function startPolling() {
  if (pollingInterval.value) return;
  pollingInterval.value = window.setInterval(async () => {
    try {
      // 静默获取数据
      const response = await fetchDocumentPage(searchParams.value);
      if (!response.error) {
        const transformed = defaultTransform(response);
        // 如果当前有数据，且 API 返回了数据，则更新
        if (transformed.data) {
          data.value = transformed.data;
        }
      }
    } catch {
      stopPolling();
    }
  }, 3000);
}

// 监听数据变化，自动管理轮询
watch(
  data,
  newData => {
    const hasPending = newData.some(item => item.embeddingStatus === 1 || item.questionStatus === 1);
    if (hasPending) {
      startPolling();
    } else {
      stopPolling();
    }
  },
  { deep: true, immediate: true }
);

onUnmounted(() => {
  stopPolling();
});

// 文件上传相关
const fileList = ref<UploadFileInfo[]>([]);
const uploading = ref(false);
const uploadAreaVisible = ref(false);

// 是否需要显示文件上传区域（仅限本地文件和QA对类型）
const showFileUpload = computed(() => {
  return props.processType === 'GENERIC_FILE' || props.processType === 'QA_PAIR';
});

const debouncedSuccessMessage = debounce(() => {
  window.$message?.success('上传成功，正在处理中...');
}, 500);

async function handleUpload(options: { file: UploadFileInfo; onFinish: () => void; onError: () => void }) {
  if (!props.datasetId || !options.file.file) return;

  uploading.value = true;
  try {
    await uploadDocument(props.datasetId, options.file.file);
    debouncedSuccessMessage();
    options.onFinish();
    // 上传成功后从列表中移除
    const index = fileList.value.findIndex(f => f.id === options.file.id);
    if (index > -1) {
      fileList.value.splice(index, 1);
    }
    await getData();
  } catch {
    window.$message?.error('上传失败');
    options.onError();
  } finally {
    uploading.value = false;
  }
}

function getUploadAreaTitle() {
  if (props.processType === 'QA_PAIR') {
    return '上传QA对文件（Excel/CSV）';
  }
  return '上传文件';
}

// 统一的添加文档入口
function handleAddDocument() {
  if (props.processType === 'GENERIC_FILE' || props.processType === 'QA_PAIR') {
    // 展开/收起上传区域
    uploadAreaVisible.value = !uploadAreaVisible.value;
  } else if (props.processType === 'ONLINE_DOC') {
    emit('addOnlineDoc');
  } else if (props.processType === 'WEB_LINK') {
    emit('addWebLink');
  }
}

// 获取按钮文本
function getAddButtonText() {
  const textMap: Record<string, string> = {
    GENERIC_FILE: '上传文件',
    QA_PAIR: '上传QA对',
    ONLINE_DOC: '添加在线文档',
    WEB_LINK: '添加网页链接'
  };
  return textMap[props.processType] || '添加文档';
}

// 获取按钮图标
function getAddButtonIcon() {
  const iconMap: Record<string, string> = {
    GENERIC_FILE: 'mdi:cloud-upload-outline',
    QA_PAIR: 'mdi:table-arrow-up',
    ONLINE_DOC: 'mdi:text-box-plus',
    WEB_LINK: 'mdi:link-plus'
  };
  return iconMap[props.processType] || 'mdi:plus';
}

defineExpose({
  getData
});
</script>

<template>
  <div class="h-full flex-col-stretch gap-12px overflow-hidden">
    <DocumentSearch v-model:model="searchParams" @reset="handleResetSearch" @search="getDataByPage" />

    <!-- 受控展开的上传区域 (仅文件上传类型) -->
    <NCard v-if="uploadAreaVisible && showFileUpload" :bordered="true" size="small" class="upload-area-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span>{{ getUploadAreaTitle() }}</span>
          <NButton text type="primary" @click="uploadAreaVisible = false">
            <template #icon>
              <SvgIcon icon="mdi:close" />
            </template>
          </NButton>
        </div>
      </template>
      <NUpload
        v-model:file-list="fileList"
        multiple
        :show-file-list="true"
        :custom-request="handleUpload"
        :disabled="uploading"
      >
        <NUploadDragger class="upload-dragger">
          <div class="flex flex-col items-center gap-2">
            <SvgIcon icon="mdi:cloud-upload-outline" class="text-4xl text-primary" />
            <p class="text-base font-medium">点击或拖拽文件到此处上传</p>
            <p class="text-sm text-gray-500">
              <template v-if="props.processType === 'QA_PAIR'">
                支持 Excel(.xlsx/.xls) 和 CSV 文件，第一列为问题，第二列为答案
              </template>
              <template v-else>支持 PDF、Word、TXT、Markdown 等常见文件格式</template>
            </p>
          </div>
        </NUploadDragger>
      </NUpload>
    </NCard>

    <TableRowCheckAlert v-if="checkedRowKeys.length > 0" v-model:checked-row-keys="checkedRowKeys" />
    <NCard title="文档" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          :show-delete="hasAuth('ai:document:remove')"
          :show-export="false"
          @delete="handleBatchDelete"
          @refresh="handleRefresh"
        >
          <template #prefix>
            <NSpace>
              <!-- 统一添加文档入口按钮 -->
              <NButton size="small" type="primary" @click="handleAddDocument">
                <template #icon>
                  <SvgIcon :icon="getAddButtonIcon()" />
                </template>
                {{ getAddButtonText() }}
              </NButton>

              <!-- 批量操作按钮 -->
              <NButton v-if="checkedRowKeys.length > 0" ghost size="small" type="primary" @click="handleBatchEnable">
                <template #icon>
                  <SvgIcon icon="mdi:check-circle" class="text-icon" />
                </template>
                启用
              </NButton>
              <NButton v-if="checkedRowKeys.length > 0" ghost size="small" type="info" @click="handleBatchDisable">
                <template #icon>
                  <SvgIcon icon="mdi:cancel" class="text-icon" />
                </template>
                禁用
              </NButton>
              <NButton v-if="checkedRowKeys.length > 0" ghost size="small" type="info" @click="handleBatchEmbedding">
                <template #icon>
                  <SvgIcon icon="mdi:vector-square" class="text-icon" />
                </template>
                向量化
              </NButton>
              <NButton
                v-if="checkedRowKeys.length > 0"
                ghost
                size="small"
                type="info"
                @click="handleBatchGenerateQuestions"
              >
                <template #icon>
                  <SvgIcon icon="mdi:chat-question" class="text-icon" />
                </template>
                生成问题
              </NButton>
            </NSpace>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="true"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => row.id!"
        :pagination="mobilePagination"
        class="h-full"
        @update:sorter="handleSorterChange"
      />
    </NCard>

    <!-- 模型选择器 -->
    <ModelSelectorBasic
      v-model:show="modelSelectorVisible"
      title="批量生成问题"
      :default-prompt="documentPrompt"
      :default-temperature="0.7"
      :default-max-tokens="2048"
      :alert-content="documentAlertContent"
      :show-alert="true"
      @confirm="handleConfirmGenerateQuestions"
    />

    <EmbeddingConfirmModal v-model:show="embeddingModalVisible" @confirm="handleConfirmEmbedding" />
    <DocumentStatusModal v-model:visible="statusVisible" :meta="currentStatusMeta" />
  </div>
</template>

<style scoped>
.upload-area-card {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
