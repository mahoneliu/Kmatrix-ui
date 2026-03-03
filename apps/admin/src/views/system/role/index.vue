<script setup lang="tsx">
import { ref } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { useBoolean } from '@sa/hooks';
import { dataScopeRecord } from '@/constants/business';
import { fetchBatchDeleteRole, fetchGetRoleList, fetchUpdateRoleStatus } from '@/service/api/system/role';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import StatusSwitch from '@/components/custom/status-switch.vue';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';
import RoleDataScopeDrawer from './modules/role-data-scope-drawer.vue';
import RoleAuthUserDrawer from './modules/role-auth-user-drawer.vue';

defineOptions({
  name: 'RoleList'
});

const appStore = useAppStore();
const { download } = useDownload();
const { hasAuth } = useAuth();

useDict('sys_normal_disable');

const { bool: dataScopeDrawerVisible, setTrue: openDataScopeDrawer } = useBoolean(false);
const { bool: authUserDrawerVisible, setTrue: openAuthUserDrawer } = useBoolean(false);

const searchParams = ref<Api.System.RoleSearchParams>({
  pageNum: 1,
  pageSize: 10,
  roleName: null,
  roleKey: null,
  status: null,
  params: {}
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetRoleList(searchParams.value),
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
        key: 'roleName',
        title: $t('page.system.role.roleName'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'roleKey',
        title: $t('page.system.role.roleKey'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'roleSort',
        title: $t('page.system.role.roleSort'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'dataScope',
        title: $t('page.system.role.dataScope'),
        align: 'center',
        minWidth: 280,
        render: row => {
          return <NTag type="info">{dataScopeRecord[row.dataScope]}</NTag>;
        }
      },
      {
        key: 'status',
        title: $t('page.system.role.status'),
        align: 'center',
        minWidth: 120,
        render(row) {
          return (
            <StatusSwitch
              v-model:value={row.status}
              disabled={row.roleId === 1}
              info={row.roleKey}
              onSubmitted={(value, callback) => handleStatusChange(row, value, callback)}
            />
          );
        }
      },
      {
        key: 'createTime',
        title: $t('page.system.role.createTime'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 230,
        render: row => {
          if (row.roleId === 1) return null;

          const editBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                local-icon="material-symbols-drive-file-rename-outline-outline"
                tooltipContent={$t('common.edit')}
                onClick={() => edit(row.roleId)}
              />
            );
          };

          const dataScopeBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                local-icon="material-symbols-database"
                tooltipContent={$t('page.system.role.dataScope')}
                onClick={() => handleDataScope(row)}
              />
            );
          };

          const authUserBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                local-icon="material-symbols-assignment-ind-outline"
                tooltipContent={$t('page.system.role.authorizedUsers')}
                onClick={() => handleAuthUser(row)}
              />
            );
          };

          const deleteBtn = () => {
            return (
              <ButtonIcon
                text
                type="error"
                local-icon="material-symbols-delete-outline"
                tooltipContent={$t('common.delete')}
                popconfirmContent={$t('common.confirmDelete')}
                onPositiveClick={() => handleDelete(row.roleId)}
              />
            );
          };

          const buttons = [];
          if (hasAuth('system:role:edit')) {
            buttons.push(editBtn());
            buttons.push(dataScopeBtn());
            buttons.push(authUserBtn());
          }
          if (hasAuth('system:role:remove')) buttons.push(deleteBtn());

          return (
            <div class="flex-center gap-8px">
              {buttons.map((btn, index) => (
                <>
                  {index !== 0 && <NDivider vertical />}
                  {btn}
                </>
              ))}
            </div>
          );
        }
      }
    ]
  });

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'roleId', getData);

async function handleBatchDelete() {
  // request
  const { error } = await fetchBatchDeleteRole(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(roleId: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteRole([roleId]);
  if (error) return;
  onDeleted();
}

async function edit(roleId: CommonType.IdType) {
  handleEdit(roleId);
}

async function handleExport() {
  download('/system/role/export', searchParams.value, `${$t('page.system.role.role')}_${new Date().getTime()}.xlsx`);
}

/** 处理状态切换 */
async function handleStatusChange(
  row: Api.System.Role,
  value: Api.Common.EnableStatus,
  callback: (flag: boolean) => void
) {
  const { error } = await fetchUpdateRoleStatus({
    roleId: row.roleId,
    status: value
  });

  callback(!error);

  if (!error) {
    window.$message?.success($t('page.system.role.statusChangeSuccess'));
    getData();
  }
}

function handleDataScope(row: Api.System.Role) {
  const findItem = data.value.find(item => item.roleId === row.roleId) || null;
  editingData.value = jsonClone(findItem);
  openDataScopeDrawer();
}

function handleAuthUser(row: Api.System.Role) {
  const findItem = data.value.find(item => item.roleId === row.roleId) || null;
  editingData.value = jsonClone(findItem);
  openAuthUserDrawer();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.system.role.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('system:role:add')"
          :show-delete="hasAuth('system:role:remove')"
          :show-export="hasAuth('system:role:export')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        />
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
        :row-key="row => row.roleId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
      <RoleDataScopeDrawer v-model:visible="dataScopeDrawerVisible" :row-data="editingData" @submitted="getData" />
      <RoleAuthUserDrawer v-model:visible="authUserDrawerVisible" :row-data="editingData" @submitted="getData" />
    </NCard>
  </div>
</template>

<style scoped></style>
