<script setup lang="tsx">
import { nextTick, ref, watch } from 'vue';
import { NButton, NCard, NDataTable, NInput, NSpace, NTag } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { batchDeleteQuestions, deleteQuestion, fetchQuestionPage, updateQuestion } from '@/service/api/ai/knowledge';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import QuestionAddModal from './question-add-modal.vue';
import QuestionDetailDrawer from './question-detail-drawer.vue';

defineOptions({
  name: 'QuestionTable'
});

interface Props {
  kbId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), {
  kbId: null
});

// 内联编辑状态
const editingId = ref<CommonType.IdType | null>(null);
const editingContent = ref('');
const editInputRef = ref<InstanceType<typeof NInput> | null>(null);

// 添加弹窗状态
const addModalVisible = ref(false);

// 问题详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedQuestionId = ref<CommonType.IdType | null>(null);

const searchParams = ref<Api.AI.KB.QuestionQuery>({
  kbId: props.kbId ?? undefined,
  pageNum: 1,
  pageSize: 10
});

const { columns, data, loading, mobilePagination, getData, getDataByPage, scrollX } = useNaivePaginatedTable({
  api: () => fetchQuestionPage(searchParams.value),
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
      key: 'content',
      title: '问题内容',
      align: 'left',
      minWidth: 250,
      ellipsis: {
        tooltip: true
      },
      render(row) {
        // 内联编辑模式
        if (editingId.value === row.id) {
          return (
            <NInput
              ref={editInputRef}
              v-model:value={editingContent.value}
              type="text"
              size="small"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
              }}
              onBlur={() => saveEdit(row)}
              onKeydown={(e: KeyboardEvent) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter') saveEdit(row);
              }}
            />
          );
        }
        // 普通显示模式
        return (
          <div class="group flex items-center gap-2">
            <span
              class="flex-1 cursor-pointer hover:text-primary"
              onClick={() => handleRowClick(row)}
              title="点击查看详情"
            >
              {row.content}
            </span>
            <span
              class="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                startEdit(row);
              }}
            >
              <SvgIcon icon="mdi:pencil" />
            </span>
          </div>
        );
      }
    },
    {
      key: 'chunkCount',
      title: '关联分段',
      align: 'center',
      width: 100,
      render(row) {
        const count = row.chunkCount || 0;
        return (
          <NTag size="small" type={count > 0 ? 'info' : 'default'} bordered={false}>
            {count}
          </NTag>
        );
      }
    },
    {
      key: 'sourceType',
      title: '来源',
      align: 'center',
      width: 100,
      render(row) {
        const typeMap: Record<string, { label: string; type: string }> = {
          MANUAL: { label: '手动添加', type: 'success' },
          LLM: { label: 'AI生成', type: 'info' }
        };
        const info = typeMap[row.sourceType || ''] || { label: '未知', type: 'default' };
        return (
          <NTag size="small" type={info.type as any} bordered={false}>
            {info.label}
          </NTag>
        );
      }
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      width: 160,
      render(row) {
        return formatDate(row.createTime);
      }
    },
    {
      key: 'updateTime',
      title: '更新时间',
      align: 'center',
      width: 160,
      render(row) {
        return formatDate(row.updateTime);
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 80,
      render(row) {
        return (
          <ButtonIcon text type="error" icon="mdi:delete" tooltipContent="删除" onClick={() => handleDelete(row.id)} />
        );
      }
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

// 内联编辑
function startEdit(row: Api.AI.KB.Question) {
  editingId.value = row.id;
  editingContent.value = row.content || '';
  nextTick(() => {
    editInputRef.value?.focus();
  });
}

function cancelEdit() {
  editingId.value = null;
  editingContent.value = '';
}

async function saveEdit(row: Api.AI.KB.Question) {
  if (!editingId.value || !editingContent.value.trim()) {
    cancelEdit();
    return;
  }

  if (editingContent.value === row.content) {
    cancelEdit();
    return;
  }

  try {
    await updateQuestion(editingId.value, editingContent.value.trim());
    window.$message?.success('修改成功');
    cancelEdit();
    await getData();
  } catch {
    window.$message?.error('修改失败');
  }
}

// 删除
async function handleDelete(id: CommonType.IdType) {
  window.$dialog?.warning({
    title: '确认删除',
    content: '确定要删除该问题吗？',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await deleteQuestion(id);
      if (!error) {
        window.$message?.success('删除成功');
        onDeleted();
      }
    }
  });
}

// 批量删除
async function handleBatchDelete() {
  window.$dialog?.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${checkedRowKeys.value.length} 个问题吗？`,
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await batchDeleteQuestions(checkedRowKeys.value);
      if (!error) {
        window.$message?.success('删除成功');
        onBatchDeleted();
      }
    }
  });
}

// 添加问题后的回调
function handleAddSuccess() {
  addModalVisible.value = false;
  getData();
}

// 点击行打开抽屉
function handleRowClick(row: Api.AI.KB.Question) {
  selectedQuestionId.value = row.id;
  detailDrawerVisible.value = true;
}

// 处理抽屉中的选中行变化
// function handleDetailSelectedRowChange(questionId: CommonType.IdType | null) {
//   selectedQuestionId.value = questionId;
// }

// 格式化日期
function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 监听 kbId 变化
watch(
  () => props.kbId,
  () => {
    checkedRowKeys.value = [];
    searchParams.value.kbId = props.kbId ?? undefined;
    getDataByPage();
  }
);

defineExpose({
  getData
});
</script>

<template>
  <div class="h-full flex-col gap-12px overflow-hidden">
    <TableRowCheckAlert v-if="checkedRowKeys.length > 0" v-model:checked-row-keys="checkedRowKeys" />
    <!-- Debug Info -->
    <NCard
      title="问题列表"
      :bordered="false"
      size="small"
      class="h-full flex-col card-wrapper sm:flex-1-hidden"
      :content-style="{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }"
    >
      <template #header-extra>
        <TableHeaderOperation
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          :show-delete="true"
          :show-export="false"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #prefix>
            <NSpace>
              <NButton size="small" type="primary" @click="addModalVisible = true">
                <template #icon>
                  <SvgIcon icon="mdi:plus" />
                </template>
                添加问题
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
        :row-key="(row: Api.AI.KB.Question) => row.id"
        :pagination="mobilePagination"
        :row-props="(row: Api.AI.KB.Question) => ({
          style: {
            cursor: 'pointer',
            backgroundColor: selectedQuestionId === row.id ? 'rgba(24, 160, 88, 0.1)' : undefined
          },
          onClick: () => handleRowClick(row)
        })"
        remote
        class="h-full flex-col flex-1"
      />
    </NCard>

    <QuestionAddModal v-model:visible="addModalVisible" :kb-id="kbId" @success="handleAddSuccess" />

    <QuestionDetailDrawer
      v-model:visible="detailDrawerVisible"
      v-model:selected-row="selectedQuestionId"
      :question-id="selectedQuestionId"
      :questions="data"
      :kb-id="kbId || undefined"
      @refresh="getData"
    />
  </div>
</template>
