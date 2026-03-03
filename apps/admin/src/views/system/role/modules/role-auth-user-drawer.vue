<script setup lang="tsx">
import { computed, ref, toRaw, watch } from 'vue';
import { NDatePicker } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import {
  fetchGetRoleUserList,
  fetchGetUserList,
  fetchUpdateRoleAuthUser,
  fetchUpdateRoleAuthUserCancel
} from '@/service/api/system';
import { useAppStore } from '@/store/modules/app';
import { useDict } from '@/hooks/business/dict';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { arraysEqualSet } from '@/utils/common';
import { $t } from '@/locales';
import DictTag from '@/components/custom/dict-tag.vue';

defineOptions({
  name: 'RoleAuthUserDrawer'
});

interface Props {
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const appStore = useAppStore();

const title = computed(() => $t('page.system.role.roleAuth'));

useDict('sys_normal_disable', false);

const searchParams = ref<Api.System.UserSearchParams>({
  pageNum: 1,
  pageSize: 20,
  deptId: null,
  userName: null,
  nickName: null,
  phonenumber: null,
  status: null,
  params: {}
});

const defaultModel = jsonClone(toRaw(searchParams.value));

const { columns, data, getData, getDataByPage, loading, mobilePagination, scrollX } = useNaivePaginatedTable({
  immediate: false,
  api: () => fetchGetUserList(searchParams.value),
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
      width: 64
    },
    {
      key: 'userName',
      title: $t('page.system.user.userName'),
      align: 'center',
      minWidth: 120,
      ellipsis: true
    },
    {
      key: 'nickName',
      title: $t('page.system.user.nickName'),
      align: 'center',
      minWidth: 120,
      ellipsis: true
    },
    {
      key: 'deptName',
      title: $t('page.system.user.deptName'),
      align: 'center',
      minWidth: 120,
      ellipsis: true
    },
    {
      key: 'phonenumber',
      title: $t('page.system.user.phonenumber'),
      align: 'center',
      minWidth: 120,
      ellipsis: true
    },
    {
      key: 'status',
      title: $t('page.system.user.status'),
      align: 'center',
      minWidth: 80,
      render(row) {
        return <DictTag size="small" value={row.status} dictCode="sys_normal_disable" />;
      }
    },
    {
      key: 'createTime',
      title: $t('page.system.user.createTime'),
      align: 'center',
      minWidth: 120
    }
  ]
});

const { checkedRowKeys } = useTableOperate(data, 'userId', getData);

const checkedUserIds = ref<CommonType.IdType[]>([]);

async function handleUpdateModelWhenEdit() {
  checkedRowKeys.value = [];
  getDataByPage();
  const { data: roleUserList } = await fetchGetRoleUserList({
    roleId: props.rowData?.roleId
  });
  checkedUserIds.value = roleUserList?.rows.map(item => item.userId) || [];
  checkedRowKeys.value = checkedUserIds.value;
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (arraysEqualSet(checkedUserIds.value, checkedRowKeys.value)) {
    window.$message?.warning($t('common.noChange'));
    return;
  }

  // 批量取消用户授权
  const cancelUserIds = checkedUserIds.value.filter(item => !checkedRowKeys.value.includes(item));
  if (cancelUserIds.length > 0) {
    const { error: cancelError } = await fetchUpdateRoleAuthUserCancel(props.rowData!.roleId, cancelUserIds);
    if (cancelError) return;
  }

  // 批量选择用户授权
  const addUserIds = checkedRowKeys.value.filter(item => !checkedUserIds.value.includes(item));
  if (addUserIds.length > 0) {
    const { error: addError } = await fetchUpdateRoleAuthUser(props.rowData!.roleId, addUserIds);
    if (addError) return;
  }

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    reset();
    handleUpdateModelWhenEdit();
  }
});

const dateRangeCreateTime = ref<[string, string] | null>(null);

const datePickerRef = ref<InstanceType<typeof NDatePicker>>();

function onDateRangeCreateTimeUpdate(value: [string, string] | null) {
  const params = searchParams.value.params!;
  if (value && value.length === 2) {
    [params.beginTime, params.endTime] = value;
  } else {
    params.beginTime = undefined;
    params.endTime = undefined;
  }
}

function reset() {
  dateRangeCreateTime.value = null;
  Object.assign(searchParams.value, defaultModel);
}
</script>

<template>
  <NDrawer
    v-model:show="visible"
    :title="title"
    display-directive="show"
    :width="1300"
    class="max-w-90%"
    content-class="h-full"
    wrapper-class="h-full"
  >
    <NDrawerContent :title="title" :native-scrollbar="false" closable body-class="h-full" body-content-class="h-full">
      <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
        <NForm :model="searchParams" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" :label="$t('page.system.user.userName')" path="userName" class="pr-24px">
              <NInput
                v-model:value="searchParams.userName"
                :placeholder="$t('page.system.user.form.userName.required')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('page.system.user.nickName')" path="nickName" class="pr-24px">
              <NInput
                v-model:value="searchParams.nickName"
                :placeholder="$t('page.system.user.form.nickName.required')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('page.system.user.phonenumber')"
              path="phonenumber"
              class="pr-24px"
            >
              <NInput
                v-model:value="searchParams.phonenumber"
                :placeholder="$t('page.system.user.form.phonenumber.required')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('page.system.user.deptName')" path="deptId" class="pr-24px">
              <DeptTreeSelect
                v-model:value="searchParams.deptId"
                :placeholder="$t('page.system.user.form.deptId.required')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:10" :label="$t('common.createTime')" path="createTime" class="pr-24px">
              <NDatePicker
                ref="datePickerRef"
                v-model:formatted-value="dateRangeCreateTime"
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
                @update:formatted-value="onDateRangeCreateTimeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" class="pr-24px" :show-feedback="false">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="() => getDataByPage()">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
        <TableRowCheckAlert v-model:checked-row-keys="checkedRowKeys" />
        <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
          <NDataTable
            v-model:checked-row-keys="checkedRowKeys"
            :columns="columns"
            :data="data"
            size="small"
            :flex-height="!appStore.isMobile"
            :scroll-x="scrollX"
            :loading="loading"
            remote
            :row-key="row => row.userId"
            :pagination="mobilePagination"
            class="h-full"
          />
        </NCard>
      </div>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
