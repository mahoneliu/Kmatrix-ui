<script setup lang="tsx">
import { ref } from 'vue';
import { NButton } from 'naive-ui';
import { fetchBatchDeleteOperLog, fetchCleanOperLog, fetchGetOperLogList } from '@/service/api/monitor/oper-log';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import DictTag from '@/components/custom/dict-tag.vue';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import OperLogViewDrawer from './modules/oper-log-view-drawer.vue';
import OperLogSearch from './modules/oper-log-search.vue';

defineOptions({
  name: 'OperLogList'
});

useDict('sys_common_status');
useDict('sys_oper_type');

const appStore = useAppStore();
const { download } = useDownload();
const { hasAuth } = useAuth();

const searchParams = ref<Api.Monitor.OperLogSearchParams>({
  pageNum: 1,
  pageSize: 10,
  title: null,
  businessType: null,
  operName: null,
  operIp: null,
  status: null,
  params: {}
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetOperLogList(searchParams.value),
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
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'title',
        title: $t('page.monitor.operlog.module'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'businessType',
        title: $t('page.monitor.operlog.businessType'),
        align: 'center',
        minWidth: 120,
        render(row) {
          return <DictTag size="small" value={row.businessType} dictCode="sys_oper_type" />;
        }
      },
      {
        key: 'operName',
        title: $t('page.monitor.operlog.operName'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'operIp',
        title: $t('page.monitor.operlog.operIp'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'operLocation',
        title: $t('page.monitor.operlog.operLocation'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'status',
        title: $t('page.monitor.operlog.status'),
        align: 'center',
        minWidth: 120,
        render(row) {
          return <DictTag size="small" value={row.status} dictCode="sys_common_status" />;
        }
      },
      {
        key: 'operTime',
        title: $t('page.monitor.operlog.operTime'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'costTime',
        title: $t('page.monitor.operlog.costTime'),
        align: 'center',
        minWidth: 120,
        render(row) {
          return `${row.costTime} ms`;
        }
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        render: row => {
          const viewBtn = () => {
            return (
              <ButtonIcon
                type="primary"
                text
                local-icon="material-symbols-visibility-outline"
                tooltipContent={$t('page.monitor.operlog.viewDetail')}
                onClick={() => view(row.operId!)}
              />
            );
          };
          return <div class="flex-center gap-8px">{viewBtn()}</div>;
        }
      }
    ]
  });

const { drawerVisible, editingData, handleEdit, checkedRowKeys, onBatchDeleted } = useTableOperate(
  data,
  'operId',
  getData
);

async function handleBatchDelete() {
  // request
  const { error } = await fetchBatchDeleteOperLog(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}
async function view(operId: CommonType.IdType) {
  handleEdit(operId);
}

async function handleExport() {
  download(
    '/monitor/operlog/export',
    searchParams.value,
    `${$t('page.monitor.operlog.title')}_${new Date().getTime()}.xlsx`
  );
}

async function handleCleanOperLog() {
  window.$dialog?.error({
    title: $t('common.tip'),
    content: $t('page.monitor.operlog.cleanConfirm'),
    positiveText: $t('page.monitor.operlog.clean'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchCleanOperLog();
      if (error) return;
      window.$message?.success($t('page.monitor.operlog.cleanSuccess'));
      await getData();
    }
  });
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <OperLogSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard
      :title="$t('page.monitor.operlog.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          :show-delete="hasAuth('monitor:operlog:remove')"
          :show-export="hasAuth('monitor:operlog:export')"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        >
          <template #prefix>
            <NButton
              v-if="hasAuth('monitor:operlog:remove')"
              type="error"
              ghost
              size="small"
              @click="handleCleanOperLog"
            >
              <template #icon>
                <icon-material-symbols-warning-outline-rounded />
              </template>
              {{ $t('page.monitor.operlog.clean') }}
            </NButton>
          </template>
        </TableHeaderOperation>
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
        :row-key="row => row.operId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <OperLogViewDrawer v-model:visible="drawerVisible" :row-data="editingData" />
    </NCard>
  </div>
</template>

<style scoped></style>
