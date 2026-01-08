<script setup lang="ts">
import { h, reactive } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { deleteNodeDefinitions, fetchNodeDefinitionList } from '@/service/api/ai/workflow/node';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import NodeOperateDrawer from './modules/node-operate-drawer.vue';

defineOptions({
  name: 'NodeDefinitionManage'
});

const appStore = useAppStore();
// removed manual useBoolean since hook provides it

const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  nodeType: '',
  nodeLabel: ''
});

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
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
      width: 48
    },
    {
      key: 'type',
      title: 'Node Type',
      align: 'center',
      width: 150
    },
    {
      key: 'label',
      title: 'Label',
      align: 'center',
      width: 150
    },
    {
      key: 'icon',
      title: 'Icon',
      align: 'center',
      width: 60,
      render: row => h(SvgIcon, { icon: row.icon, style: { fontSize: '24px', color: row.color } })
    },
    {
      key: 'category',
      title: 'Category',
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
      title: 'System',
      align: 'center',
      width: 80,
      render: row =>
        h(
          NTag,
          { type: row.isSystem ? 'error' : 'success', bordered: false },
          { default: () => (row.isSystem ? 'Yes' : 'No') }
        )
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 220,
      render: (row: Api.AI.Workflow.NodeTypeDefinition) =>
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
                // @ts-expect-error: copy button prop mismatch
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
                        disabled: row.isSystem // Prevent deleting system nodes
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
  searchParams.pageSize = 10;
  searchParams.nodeType = '';
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

function handleCopy(row: Api.AI.Workflow.NodeTypeDefinition) {
  operateType.value = 'copy' as any;
  editingData.value = { ...row };
  openDrawer();
}

async function handleDelete(id: number) {
  await deleteNodeDefinitions([id]);
  onDeleted();
}

async function handleBatchDelete() {
  await deleteNodeDefinitions(checkedRowKeys.value);
  onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="Node Definition Search" :bordered="false" size="small" class="card-wrapper">
      <NForm :model="searchParams" inline label-placement="left" :label-width="80">
        <NFormItem label="Type" path="nodeType">
          <NInput v-model:value="searchParams.nodeType" placeholder="Input Node Type" />
        </NFormItem>
        <NFormItem label="Label" path="nodeLabel">
          <NInput v-model:value="searchParams.nodeLabel" placeholder="Input Node Label" />
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
    </NCard>

    <NCard title="Node Definitions" :bordered="false" size="small" class="flex-1-hidden card-wrapper">
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
        :scroll-x="960"
        :loading="loading"
        remote
        :row-key="row => row.nodeDefId || (row as any).id"
        :pagination="mobilePagination"
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
