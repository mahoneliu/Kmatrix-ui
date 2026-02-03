<script setup lang="tsx">
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NCollapse, NCollapseItem, NDivider, NInput, NSpace, NUpload, NUploadDragger } from 'naive-ui';
import type { DataTableSortState, UploadFileInfo } from 'naive-ui';
import { debounce } from 'lodash-es';
import { SvgIcon } from '@sa/materials';
import {
  batchDeleteDocuments,
  batchDisableDocuments,
  batchEmbedding,
  batchEnableDocuments,
  batchGenerateQuestionsByDocuments,
  fetchDocumentPage,
  updateDocument,
  uploadDocument
} from '@/service/api/ai/knowledge';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAuth } from '@/hooks/business/auth';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';
import DocumentSearch from './document-search.vue';

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
          return row.enabled === 1 ? (
            <n-tag type="success" size="small">
              启用
            </n-tag>
          ) : (
            <n-tag type="default" size="small">
              禁用
            </n-tag>
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
          const divider = () => {
            if (!hasAuth('ai:document:edit') || !hasAuth('ai:document:remove')) {
              return null;
            }
            return <NDivider vertical />;
          };

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

          const deleteBtn = () => {
            if (!hasAuth('ai:document:remove')) {
              return null;
            }
            return (
              <ButtonIcon
                text
                type="error"
                icon="material-symbols:delete-outline"
                tooltipContent={$t('common.delete')}
                popconfirmContent={$t('common.confirmDelete')}
                onPositiveClick={() => handleDelete(row.id!)}
              />
            );
          };

          return (
            <div class="flex-center gap-8px">
              {chunkBtn()}
              {divider()}
              {deleteBtn()}
            </div>
          );
        }
      }
    ]
  });

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

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
  const { error } = await batchEmbedding(checkedRowKeys.value);
  if (error) return;
  window.$message?.success('向量化生成任务已开始');
  await getData();
}

async function handleBatchGenerateQuestions() {
  const { error } = await batchGenerateQuestionsByDocuments(checkedRowKeys.value);
  if (error) return;
  window.$message?.success('问题生成任务已开始');
  await getData();
}

async function handleResetSearch() {
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

// 监听 datasetId 变化
watch(
  () => props.datasetId,
  (newVal: CommonType.IdType | null) => {
    searchParams.value.datasetId = newVal ?? undefined;
    getDataByPage();
  }
);

// 文件上传相关
const fileList = ref<UploadFileInfo[]>([]);
const uploading = ref(false);
const uploadAreaExpanded = ref<string[]>([]);

// 是否需要显示文件上传区域（仅限本地文件和QA对类型）
const showFileUpload = computed(() => {
  return props.processType === 'GENERIC_FILE' || props.processType === 'QA_PAIR';
});

// 是否需要显示按钮区域（在线文档/网页链接类型）
const showButtonActions = computed(() => {
  return props.processType === 'ONLINE_DOC' || props.processType === 'WEB_LINK';
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
  return '上传文档';
}

defineExpose({
  getData
});
</script>

<template>
  <div class="h-full flex-col-stretch gap-12px overflow-hidden">
    <DocumentSearch v-model:model="searchParams" @reset="handleResetSearch" @search="getDataByPage" />

    <!-- 折叠式上传区域 -->
    <NCollapse v-model:expanded-names="uploadAreaExpanded" class="upload-collapse">
      <NCollapseItem name="upload" :title="getUploadAreaTitle()">
        <template #header-extra>
          <NSpace size="small">
            <!-- 在线文档入口 -->
            <NButton
              v-if="props.processType === 'ONLINE_DOC'"
              size="small"
              type="primary"
              @click.stop="emit('addOnlineDoc')"
            >
              <template #icon>
                <SvgIcon icon="mdi:text-box-plus" />
              </template>
              添加在线文档
            </NButton>
            <!-- 网页链接入口 -->
            <NButton
              v-if="props.processType === 'WEB_LINK'"
              size="small"
              type="primary"
              @click.stop="emit('addWebLink')"
            >
              <template #icon>
                <SvgIcon icon="mdi:link-plus" />
              </template>
              添加网页链接
            </NButton>
          </NSpace>
        </template>

        <!-- 文件上传区域 (适用于GENERIC_FILE和QA_PAIR类型) -->
        <NUpload
          v-if="showFileUpload"
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
                <template v-else>支持 PDF、Word、TXT、Markdown 等常见文档格式</template>
              </p>
            </div>
          </NUploadDragger>
        </NUpload>

        <!-- 在线文档/网页链接提示 -->
        <div v-if="showButtonActions" class="p-4 text-center text-gray-500">
          请点击上方按钮添加{{ props.processType === 'ONLINE_DOC' ? '在线文档' : '网页链接' }}
        </div>
      </NCollapseItem>
    </NCollapse>

    <TableRowCheckAlert v-model:checked-row-keys="checkedRowKeys" />
    <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          :show-delete="hasAuth('ai:document:remove')"
          :show-export="false"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #prefix>
            <NSpace>
              <NButton v-if="checkedRowKeys.length > 0" ghost size="small" type="primary" @click="handleBatchEnable">
                <template #icon>
                  <icon-mdi-check-circle class="text-icon" />
                </template>
                批量启用
              </NButton>
              <NButton v-if="checkedRowKeys.length > 0" ghost size="small" @click="handleBatchDisable">
                <template #icon>
                  <icon-mdi-cancel class="text-icon" />
                </template>
                批量禁用
              </NButton>
              <NButton v-if="checkedRowKeys.length > 0" ghost size="small" type="info" @click="handleBatchEmbedding">
                <template #icon>
                  <icon-mdi-vector-square class="text-icon" />
                </template>
                批量向量化
              </NButton>
              <NButton
                v-if="checkedRowKeys.length > 0"
                ghost
                size="small"
                type="warning"
                @click="handleBatchGenerateQuestions"
              >
                <template #icon>
                  <icon-mdi-chat-question class="text-icon" />
                </template>
                批量生成问题
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
  </div>
</template>
