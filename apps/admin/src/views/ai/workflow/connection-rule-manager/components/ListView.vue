<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NSwitch, NTag } from 'naive-ui';
import {
  changeConnectionRuleStatus,
  deleteConnectionRules,
  fetchConnectionRuleList,
  fetchEnabledNodeTypes
} from '@/service/api/ai/connection-rule';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import RuleOperateDrawer from './RuleOperateDrawer.vue';

defineOptions({ name: 'ConnectionRuleListView' });

const nodeDefinitionStore = useNodeDefinitionStore();

const nodeTypeOptions = ref<{ label: string; value: string }[]>([]);
const nodeTypeMap = ref<Record<string, string>>({});

async function loadNodeTypes() {
  const { data } = await fetchEnabledNodeTypes();
  if (data) {
    nodeTypeMap.value = data.reduce(
      (acc, n) => {
        acc[n.nodeType] = n.nodeLabel;
        return acc;
      },
      {} as Record<string, string>
    );

    nodeTypeOptions.value = [
      { label: '全部', value: '' },
      ...data.map(n => ({ label: `${n.nodeLabel} (${n.nodeType})`, value: n.nodeType }))
    ];
  }
}
loadNodeTypes();

const searchParams = reactive({
  pageNum: 1,
  pageSize: 20,
  sourceNodeType: '',
  targetNodeType: '',
  ruleType: '',
  isEnabled: ''
});

const { columns, data, getData, getDataByPage, loading, pagination, scrollX } = useNaivePaginatedTable({
  immediate: false,
  api: () => fetchConnectionRuleList(searchParams),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.pageNum = params.page || 1;
    searchParams.pageSize = params.pageSize || 20;
  },
  columns: () => [
    { type: 'selection', align: 'center', width: 20 },
    {
      key: 'sourceNodeType',
      title: '源节点',
      align: 'left',
      minWidth: 180,
      render: (row: Api.AI.ConnectionRule.Rule) => {
        const label = nodeTypeMap.value[row.sourceNodeType] || row.sourceNodeType;
        return h('div', [
          h('span', { class: 'font-medium' }, label),
          h('span', { class: 'ml-4px text-xs text-gray-400' }, `(${row.sourceNodeType})`)
        ]);
      }
    },
    {
      key: 'targetNodeType',
      title: '目标节点',
      align: 'left',
      minWidth: 180,
      render: (row: Api.AI.ConnectionRule.Rule) => {
        const label = nodeTypeMap.value[row.targetNodeType] || row.targetNodeType;
        return h('div', [
          h('span', { class: 'font-medium' }, label),
          h('span', { class: 'ml-4px text-xs text-gray-400' }, `(${row.targetNodeType})`)
        ]);
      }
    },
    {
      key: 'ruleType',
      title: '规则类型',
      align: 'center',
      width: 90,
      render: (row: Api.AI.ConnectionRule.Rule) =>
        h(
          NTag,
          { type: row.ruleType === '0' ? 'success' : 'error', size: 'small' },
          {
            default: () => (row.ruleType === '0' ? '允许' : '禁止')
          }
        )
    },
    {
      key: 'isEnabled',
      title: '状态',
      align: 'center',
      width: 80,
      render: (row: Api.AI.ConnectionRule.Rule) =>
        h(NSwitch, {
          value: row.isEnabled === '1',
          onUpdateValue: async (val: boolean) => {
            await changeConnectionRuleStatus({ ruleId: row.ruleId, isEnabled: val ? '1' : '0' });
            getData();
            nodeDefinitionStore.reloadConnectionRules();
          }
        })
    },
    { key: 'priority', title: '优先级', align: 'center', width: 80 },
    { key: 'remark', title: '备注', align: 'left', minWidth: 40 },
    { key: 'createTime', title: '创建时间', align: 'center', width: 160 },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 140,
      render: (row: Api.AI.ConnectionRule.Rule) =>
        h(
          NSpace,
          { justify: 'center' },
          {
            default: () => [
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              h(NButton, { size: 'small', onClick: () => handleEdit(row.ruleId) }, { default: () => '编辑' }),
              h(
                NPopconfirm,
                { onPositiveClick: () => handleDelete(row.ruleId) },
                {
                  default: () => '确认删除？',
                  trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' })
                }
              )
            ]
          }
        )
    }
  ]
});

function resetSearchParams() {
  Object.assign(searchParams, {
    pageNum: 1,
    pageSize: 20,
    sourceNodeType: '',
    targetNodeType: '',
    ruleType: '',
    isEnabled: ''
  });
  getDataByPage(1);
}

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'ruleId', getData);
async function handleDelete(id: CommonType.IdType) {
  const { error } = await deleteConnectionRules([id]);
  if (!error) {
    onDeleted();
    nodeDefinitionStore.reloadConnectionRules();
  }
}

async function handleBatchDelete() {
  const { error } = await deleteConnectionRules(checkedRowKeys.value);
  if (!error) {
    onBatchDeleted();
    nodeDefinitionStore.reloadConnectionRules();
  }
}

const ruleTypeFilterOptions = [
  { label: '全部', value: '' },
  { label: '允许', value: '0' },
  { label: '禁止', value: '1' }
];

const statusFilterOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '停用', value: '0' }
];

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="h-full flex-col-stretch gap-16px overflow-auto p-16px">
    <!-- 搜索栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NForm :model="searchParams" inline label-placement="left" :label-width="80">
        <NFormItem label="源节点" path="sourceNodeType">
          <NSelect
            v-model:value="searchParams.sourceNodeType"
            :options="nodeTypeOptions"
            placeholder="全部"
            clearable
            class="w-180px"
          />
        </NFormItem>
        <NFormItem label="目标节点" path="targetNodeType">
          <NSelect
            v-model:value="searchParams.targetNodeType"
            :options="nodeTypeOptions"
            placeholder="全部"
            clearable
            class="w-180px"
          />
        </NFormItem>
        <NFormItem label="规则类型" path="ruleType">
          <NSelect v-model:value="searchParams.ruleType" :options="ruleTypeFilterOptions" class="w-120px" />
        </NFormItem>
        <NFormItem label="状态" path="isEnabled">
          <NSelect v-model:value="searchParams.isEnabled" :options="statusFilterOptions" class="w-100px" />
        </NFormItem>
        <NFormItem>
          <NSpace>
            <NButton type="primary" @click="getDataByPage(1)">
              <icon-ic-round-search class="mr-4px text-20px" />
              查询
            </NButton>
            <NButton @click="resetSearchParams">
              <icon-ic-round-refresh class="mr-4px text-20px" />
              重置
            </NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NCard>

    <!-- 表格 -->
    <NCard :bordered="false" size="small" class="card-wrapper" title="规则列表">
      <template #header-extra>
        <NSpace>
          <NButton type="primary" @click="handleAdd">
            <icon-ic-round-plus class="mr-4px text-20px" />
            新增
          </NButton>
          <NButton type="error" :disabled="checkedRowKeys.length === 0" @click="handleBatchDelete">
            <icon-ic-round-delete class="mr-4px text-20px" />
            批量删除
          </NButton>
        </NSpace>
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="(row: any) => row.ruleId"
        :pagination="pagination"
      />

      <RuleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="operateType === 'add' ? undefined : editingData"
        @submitted="
          () => {
            getData();
            nodeDefinitionStore.reloadConnectionRules();
          }
        "
      />
    </NCard>
  </div>
</template>
