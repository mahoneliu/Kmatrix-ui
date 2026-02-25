<script setup lang="ts">
import { h, reactive } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { NODE_CATEGORY_OPTIONS } from '@/constants/workflow';
import { deleteNodeDefinitions, fetchNodeDefinitionList } from '@/service/api/ai/node';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import NodeOperateDrawer from './modules/node-operate-drawer.vue';

defineOptions({
  name: 'NodeDefinitionManage'
});

const appStore = useAppStore();

const searchParams = reactive({
  pageNum: 1,
  pageSize: 20,
  nodeType: '',
  category: null,
  nodeLabel: ''
});

const { columns, data, getData, getDataByPage, loading, mobilePagination, scrollX } = useNaivePaginatedTable({
  api: () => fetchNodeDefinitionList(searchParams),
  transform: response => defaultTransform(response as any),
  onPaginationParamsChange: params => {
    searchParams.pageNum = params.page || 1;
    searchParams.pageSize = params.pageSize || 10;
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 20
    },
    {
      key: 'nodeIcon',
      title: '图标',
      align: 'center',
      width: 40,
      render: row => h(SvgIcon, { localIcon: row.nodeIcon, style: { fontSize: '24px', color: row.nodeColor } })
    },
    {
      key: 'nodeType',
      title: '节点类型',
      align: 'left',
      width: 150
    },
    {
      key: 'nodeLabel',
      title: '名称',
      align: 'center',
      width: 150
    },
    {
      key: 'category',
      title: '功能',
      align: 'center',
      width: 100,
      render: row => {
        const typeMap: Record<string, NaiveUI.ThemeColor> = {
          basic: 'default',
          ai: 'info',
          logic: 'warning',
          action: 'success'
        };
        return h(NTag, { type: typeMap[row.category] || 'default' }, { default: () => row.category.toUpperCase() });
      }
    },
    {
      key: 'isSystem',
      title: '系统保留',
      align: 'center',
      width: 80,
      render: row =>
        h(
          NTag,
          { type: row.isSystem === '1' ? 'error' : 'success', bordered: false },
          { default: () => (row.isSystem === '1' ? 'Yes' : 'No') }
        )
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 220,
      render: (row: Api.AI.Workflow.KmNodeDefinitionBo) =>
        h(
          NSpace,
          { justify: 'center' },
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  // eslint-disable-next-line @typescript-eslint/no-use-before-define
                  onClick: () => handleEdit(row.nodeDefId || (row as any).id)
                },
                { default: () => $t('common.edit') }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  onClick: () => handleCopy(row)
                },
                { default: () => $t('common.copy') }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => handleDelete(row.nodeDefId || (row as any).id)
                },
                {
                  default: () => $t('common.confirmDelete'),
                  trigger: () =>
                    h(
                      NButton,
                      {
                        size: 'small',
                        type: 'error',
                        disabled: row.isSystem === '1' // Prevent deleting system nodes
                      },
                      { default: () => $t('common.delete') }
                    )
                }
              )
            ]
          }
        )
    }
  ]
});

function resetSearchParams() {
  searchParams.pageNum = 1;
  searchParams.pageSize = 20;
  searchParams.nodeType = '';
  searchParams.category = null;
  searchParams.nodeLabel = '';
  getDataByPage(1);
}

const {
  drawerVisible,
  operateType,
  handleAdd,
  handleEdit,
  editingData,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted,
  openDrawer
} = useTableOperate(data, 'nodeDefId', getData);

function handleCopy(row: Api.AI.Workflow.KmNodeDefinitionBo) {
  operateType.value = 'copy' as any;
  editingData.value = { ...row };
  openDrawer();
}

async function handleDelete(id: number) {
  const { error } = await deleteNodeDefinitions([id]);
  if (!error) onDeleted();
}

async function handleBatchDelete() {
  const { error } = await deleteNodeDefinitions(checkedRowKeys.value);
  if (!error) onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 可折叠的搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem title="搜索" name="search">
          <NSpace>
            <NForm :model="searchParams" inline label-placement="left" :label-width="80">
              <NFormItem label="分类" path="category">
                <NSelect
                  v-model:value="searchParams.category"
                  :options="NODE_CATEGORY_OPTIONS"
                  placeholder="请选择分类"
                  clearable
                  class="w-180px"
                />
              </NFormItem>
              <NFormItem label="名称" path="nodeLabel">
                <NInput v-model:value="searchParams.nodeLabel" placeholder="名称" />
              </NFormItem>
              <NFormItem>
                <NSpace>
                  <NButton type="primary" @click="getDataByPage(1)">
                    <icon-ic-round-search class="mr-4px text-20px" />
                    {{ $t('common.search') }}
                  </NButton>
                  <NButton @click="resetSearchParams">
                    <icon-ic-round-refresh class="mr-4px text-20px" />
                    {{ $t('common.reset') }}
                  </NButton>
                </NSpace>
              </NFormItem>
            </NForm>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <NCard title="节点定义" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace>
          <NButton type="primary" @click="handleAdd">
            <icon-ic-round-plus class="mr-4px text-20px" />
            {{ $t('common.add') }}
          </NButton>
          <NButton type="error" :disabled="checkedRowKeys.length === 0" @click="handleBatchDelete">
            <icon-ic-round-delete class="mr-4px text-20px" />
            {{ $t('common.batchDelete') }}
          </NButton>
        </NSpace>
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => row.nodeDefId || (row as any).id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />

      <NodeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="operateType === 'add' ? undefined : editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
