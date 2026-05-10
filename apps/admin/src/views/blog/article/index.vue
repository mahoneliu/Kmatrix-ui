<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  NTooltip,
  useDialog,
  useMessage
} from 'naive-ui';
import type { FormInst } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  createBlogArticle,
  deleteBlogArticles,
  fetchBlogArticleById,
  fetchBlogArticlePage,
  fetchBlogCategoryTree,
  syncBlogArticleToKb,
  syncBlogArticleToKbBatch,
  toggleBlogArticleStatus,
  updateBlogArticle,
  updateBlogArticleBatchStatus
} from '@/service/api/blog';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';

const message = useMessage();
const dialog = useDialog();

// ========== 分类选项 ==========
const categoryOptions = ref<{ label: string; value: CommonType.IdType }[]>([]);

async function loadCategoryOptions() {
  try {
    const { data } = await fetchBlogCategoryTree();
    if (data) {
      const flatten = (list: Api.Blog.Category[], prefix = ''): { label: string; value: CommonType.IdType }[] => {
        const result: { label: string; value: CommonType.IdType }[] = [];
        for (const item of list) {
          const label = prefix ? `${prefix} / ${item.name}` : item.name;
          result.push({ label, value: item.id });
          if (item.children?.length) {
            result.push(...flatten(item.children, label));
          }
        }
        return result;
      };
      categoryOptions.value = flatten(data);
    }
  } catch {
    // ignore
  }
}

// ========== 列表数据 ==========
const searchParams = ref<Api.Blog.ArticleQuery>({
  pageNum: 1,
  pageSize: 20,
  title: '',
  categoryId: undefined,
  status: undefined,
  source: undefined
});

const {
  columns,
  data: tableData,
  loading,
  getData,
  getDataByPage,
  mobilePagination,
  scrollX
} = useNaivePaginatedTable({
  api: () => fetchBlogArticlePage(searchParams.value),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page;
    searchParams.value.pageSize = params.pageSize;
  },
  transform: response => defaultTransform(response),
  columns: () => [
    { type: 'selection', width: 48 },
    {
      title: '标题',
      key: 'title',
      minWidth: 200,
      ellipsis: { tooltip: true },
      render(row) {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'truncate' }, row.title),
          row.source === 'FILE'
            ? h(NTag, { size: 'tiny', type: 'info', bordered: false }, { default: () => 'FILE' })
            : null
        ]);
      }
    },
    {
      title: '分类',
      key: 'categoryName',
      width: 200,
      ellipsis: { tooltip: true },
      render(row) {
        return row.categoryName || '-';
      }
    },
    {
      title: '知识库同步',
      key: 'syncInfo',
      width: 180,
      render(row) {
        const isSynced = Boolean(row.kmDocumentId);
        return h('div', { class: 'flex items-center gap-2' }, [
          h(
            NTooltip,
            { trigger: 'hover' },
            {
              trigger: () =>
                h(SvgIcon, {
                  localIcon: isSynced ? 'mdi-check-circle' : 'mdi-clock-outline',
                  class: isSynced ? 'text-success text-18px' : 'text-gray-300 text-18px'
                }),
              default: () => (isSynced ? '已同步' : '未同步')
            }
          ),
          h('div', { class: 'text-12px text-gray-400 flex-col' }, [
            h('div', `DS: ${row.datasetId || '-'}`),
            h('div', { class: 'truncate max-w-100px' }, `DOC: ${row.kmDocumentId || '-'}`)
          ])
        ]);
      }
    },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render(row) {
        return h(NSwitch, {
          value: row.status === 'PUBLISHED',
          checkedValue: true,
          uncheckedValue: false,
          size: 'small',
          onUpdateValue: (val: boolean) => handleToggleStatus(row, val)
        });
      }
    },
    {
      title: '浏览量',
      key: 'viewCount',
      width: 70,
      render(row) {
        return row.viewCount ?? 0;
      }
    },
    {
      title: '发布时间',
      key: 'publishedAt',
      width: 140,
      render(row) {
        return row.publishedAt ? row.publishedAt.substring(0, 16) : '-';
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render(row) {
        return h(
          NSpace,
          { size: 'small' },
          {
            default: () => [
              h(
                NButton,
                { size: 'small', ghost: true, onClick: () => openEditModal(row) },
                {
                  default: () => h(SvgIcon, { localIcon: 'mdi-pencil' })
                }
              ),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        size: 'small',
                        ghost: true,
                        type: 'info',
                        disabled: row.status !== 'PUBLISHED',
                        onClick: () => row.status === 'PUBLISHED' && handleSyncKb(row)
                      },
                      { default: () => h(SvgIcon, { localIcon: 'mdi-sync' }) }
                    ),
                  default: () => '同步到知识库'
                }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  ghost: true,
                  type: 'error',
                  onClick: () => handleDelete([row.id])
                },
                { default: () => h(SvgIcon, { localIcon: 'mdi-delete' }) }
              )
            ]
          }
        );
      }
    }
  ]
});

const { checkedRowKeys: selectedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(tableData, 'id', getData);

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '草稿', value: 'DRAFT' as const },
  { label: '已发布', value: 'PUBLISHED' as const }
];

const sourceOptions = [
  { label: '全部', value: undefined },
  { label: '文件扫描', value: 'FILE' as const },
  { label: '在线创建', value: 'ONLINE' as const }
];

function handleSearch() {
  getDataByPage(1);
}

function handleReset() {
  searchParams.value = {
    pageNum: 1,
    pageSize: 20,
    title: '',
    categoryId: undefined,
    status: undefined,
    source: undefined
  };
  getDataByPage(1);
}

// ========== 状态切换 ==========
async function handleToggleStatus(row: Api.Blog.Article, val: boolean) {
  const newStatus = val ? 'PUBLISHED' : 'DRAFT';
  try {
    const { error } = await toggleBlogArticleStatus(row.id, newStatus);
    if (!error) {
      message.success(val ? '已发布' : '已设为草稿');
      getData();
    }
  } catch {
    getData();
  }
}

// ========== 批量操作 ==========
async function handleBatchStatus(status: 'PUBLISHED' | 'DRAFT') {
  if (selectedRowKeys.value.length === 0) return;

  const label = status === 'PUBLISHED' ? '发布' : '取消发布';
  try {
    const { error } = await updateBlogArticleBatchStatus(selectedRowKeys.value, status);
    if (!error) {
      message.success(`已批量${label} ${selectedRowKeys.value.length} 篇文章`);
      onBatchDeleted();
    }
  } catch {
    // ignore
  }
}

// ========== 同步知识库 ==========
async function handleSyncKb(row: Api.Blog.Article) {
  try {
    const { error } = await syncBlogArticleToKb(row.id);
    if (!error) {
      message.success('已触发知识库同步');
    }
  } catch {
    // ignore
  }
}

async function handleBatchSyncKb() {
  if (selectedRowKeys.value.length === 0) return;
  try {
    // 过滤出已发布的文章（只有已发布的才能同步）
    const publishedIds = tableData.value
      .filter(item => selectedRowKeys.value.includes(item.id) && item.status === 'PUBLISHED')
      .map(item => item.id);

    if (publishedIds.length === 0) {
      message.warning('选中的文章中没有已发布的文章，无法同步');
      return;
    }

    const { error } = await syncBlogArticleToKbBatch(publishedIds);
    if (!error) {
      message.success(`已触发 ${publishedIds.length} 篇文章的同步任务`);
      selectedRowKeys.value = [];
    }
  } catch {
    // ignore
  }
}

// ========== 删除 ==========

function handleDelete(ids: CommonType.IdType[]) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除选中的 ${ids.length} 篇文章吗？`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteBlogArticles(ids);
      if (!error) {
        onDeleted();
      }
    }
  });
}

// ========== 新增/编辑弹窗 ==========
const modalVisible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);
const editingId = ref<CommonType.IdType | null>(null);
const editingSource = ref<'FILE' | 'ONLINE'>('ONLINE');

const formData = ref<Api.Blog.ArticleSaveBo>({
  title: '',
  categoryId: null as unknown as CommonType.IdType,
  content: '',
  description: '',
  coverImage: '',
  tags: '',
  status: 'DRAFT',
  datasetId: undefined,
  slug: ''
});

const isFileSource = computed(() => editingSource.value === 'FILE');
const modalTitle = computed(() => {
  if (!editingId.value) return '新增文章';
  return isFileSource.value ? '编辑文章元数据' : '编辑文章';
});

const formRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  categoryId: [
    {
      required: true,
      validator: (_rule: unknown, value: CommonType.IdType) => {
        if (value === null || value === undefined || value === '') {
          return new Error('请选择分类');
        }
        return true;
      },
      trigger: ['blur', 'change']
    }
  ],
  content: [
    {
      required: true,
      validator: (_rule: unknown, value: string) => {
        if (isFileSource.value) return true; // FILE 来源不校验 content
        if (!value?.trim()) return new Error('请输入文章内容');
        return true;
      },
      trigger: 'blur'
    }
  ]
};

function openAddModal() {
  editingId.value = null;
  editingSource.value = 'ONLINE';
  formData.value = {
    title: '',
    categoryId: null as unknown as CommonType.IdType,
    content: '',
    description: '',
    coverImage: '',
    tags: '',
    status: 'DRAFT',
    datasetId: undefined,
    slug: ''
  };
  modalVisible.value = true;
}

async function openEditModal(row: Api.Blog.Article) {
  editingId.value = row.id;
  editingSource.value = row.source;
  // 获取完整详情（含 content）
  const { data } = await fetchBlogArticleById(row.id);
  if (data) {
    formData.value = {
      title: data.title,
      categoryId: data.categoryId,
      content: data.content || '',
      description: data.description || '',
      coverImage: data.coverImage || '',
      tags: data.tags || '',
      status: data.status,
      datasetId: data.datasetId,
      slug: data.slug
    };
  }
  modalVisible.value = true;
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    if (editingId.value) {
      const { error } = await updateBlogArticle(editingId.value, formData.value);
      if (!error) {
        message.success('保存成功');
        modalVisible.value = false;
        getData();
      }
    } else {
      const { error } = await createBlogArticle(formData.value);
      if (!error) {
        message.success('创建成功');
        modalVisible.value = false;
        getData();
      }
    }
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadCategoryOptions();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <!-- 搜索区 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NForm inline label-placement="left" label-width="60" :show-feedback="false">
        <NFormItem label="标题">
          <NInput
            v-model:value="searchParams.title"
            clearable
            placeholder="搜索文章标题"
            class="w-200px"
            @keyup.enter="handleSearch"
          />
        </NFormItem>
        <NFormItem label="分类">
          <NSelect
            v-model:value="searchParams.categoryId"
            :options="categoryOptions"
            clearable
            placeholder="选择分类"
            class="w-180px"
          />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect
            v-model:value="searchParams.status"
            :options="statusOptions"
            clearable
            placeholder="全部状态"
            class="w-120px"
          />
        </NFormItem>
        <NFormItem label="来源">
          <NSelect
            v-model:value="searchParams.source"
            :options="sourceOptions"
            clearable
            placeholder="全部来源"
            class="w-120px"
          />
        </NFormItem>
        <NFormItem>
          <NSpace>
            <NButton type="primary" @click="handleSearch">
              <template #icon>
                <SvgIcon local-icon="mdi-magnify" />
              </template>
              搜索
            </NButton>
            <NButton @click="handleReset">重置</NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NCard>

    <!-- 列表区 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <div class="mb-4 flex items-center justify-between">
        <NSpace>
          <template v-if="selectedRowKeys.length > 0">
            <NButton type="primary" ghost size="small" @click="handleBatchStatus('PUBLISHED')">
              <template #icon>
                <SvgIcon local-icon="mdi-publish" />
              </template>
              批量发布 ({{ selectedRowKeys.length }})
            </NButton>
            <NButton ghost size="small" @click="handleBatchStatus('DRAFT')">
              <template #icon>
                <SvgIcon local-icon="mdi-pencil-off" />
              </template>
              批量下线 ({{ selectedRowKeys.length }})
            </NButton>
            <NButton type="info" ghost size="small" @click="handleBatchSyncKb">
              <template #icon>
                <SvgIcon local-icon="mdi-sync" />
              </template>
              批量同步知识库 ({{ selectedRowKeys.length }})
            </NButton>
            <NButton type="error" ghost size="small" @click="handleDelete(selectedRowKeys)">
              <template #icon>
                <SvgIcon local-icon="mdi-delete" />
              </template>
              批量删除
            </NButton>
          </template>
          <div v-else class="text-14px text-gray-400">勾选列表项以进行批量操作</div>
        </NSpace>
        <NButton type="primary" ghost size="small" @click="openAddModal">
          <template #icon>
            <SvgIcon local-icon="mdi-plus" />
          </template>
          新增文章
        </NButton>
      </div>

      <NDataTable
        v-model:checked-row-keys="selectedRowKeys"
        remote
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: Api.Blog.Article) => row.id"
        :pagination="mobilePagination"
        :scroll-x="scrollX"
        size="small"
      />
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="modalVisible" preset="card" :title="modalTitle" class="w-800px" :mask-closable="false">
      <NForm ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="80">
        <NFormItem label="标题" path="title">
          <NInput v-model:value="formData.title" placeholder="请输入文章标题" maxlength="500" />
        </NFormItem>
        <NFormItem label="分类" path="categoryId">
          <NSelect v-model:value="formData.categoryId" :options="categoryOptions" placeholder="请选择分类" filterable />
        </NFormItem>
        <NFormItem label="Slug">
          <NInput v-model:value="formData.slug" placeholder="URL 标识，留空自动生成" maxlength="300" />
        </NFormItem>
        <NFormItem label="摘要">
          <NInput
            v-model:value="formData.description"
            type="textarea"
            placeholder="SEO 摘要（可选）"
            :rows="2"
            maxlength="1000"
          />
        </NFormItem>
        <NFormItem label="封面图">
          <NInput v-model:value="formData.coverImage" placeholder="封面图 URL（可选）" />
        </NFormItem>
        <NFormItem label="标签">
          <NInput v-model:value="formData.tags" placeholder='JSON 数组格式，如 ["Java","AI"]' />
        </NFormItem>
        <NFormItem label="数据集ID">
          <NInput
            v-model:value="(formData as any).datasetIdStr"
            placeholder="覆盖专题级别的知识库数据集 ID（可选）"
            @update:value="
              (v: string) => {
                formData.datasetId = v ? Number(v) : undefined;
              }
            "
          />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="formData.status"
            :options="[
              { label: '草稿', value: 'DRAFT' },
              { label: '发布', value: 'PUBLISHED' }
            ]"
          />
        </NFormItem>

        <NDivider v-if="!isFileSource" />

        <NFormItem v-if="!isFileSource" label="内容" path="content">
          <NInput v-model:value="formData.content" type="textarea" placeholder="Markdown 格式内容" :rows="12" />
        </NFormItem>

        <NTag v-if="isFileSource" type="warning" :bordered="false" class="w-full">
          <template #icon>
            <SvgIcon local-icon="mdi-lock" />
          </template>
          此文章由文件扫描入库（source=FILE），内容字段只读，仅可修改元数据
        </NTag>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalVisible = false">取消</NButton>
          <NButton type="primary" :loading="submitting" @click="handleSubmit">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
