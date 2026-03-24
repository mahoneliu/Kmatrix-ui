<script setup lang="tsx">
import { NTime } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchGetOnlineDeviceList, fetchKickOutCurrentDevice } from '@/service/api/monitor';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { getBrowserIcon, getOsIcon } from '@/utils/icon-tag-format';
import { $t } from '@/locales';
import DictTag from '@/components/custom/dict-tag.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';

defineOptions({
  name: 'OnlineTable'
});

useDict('sys_device_type');

const appStore = useAppStore();
const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading(false);

const { columns, data, getData, loading, scrollX } = useNaivePaginatedTable({
  api: () => fetchGetOnlineDeviceList(),
  transform: response => defaultTransform(response),
  columns: () => [
    {
      title: $t('page.userCenter.onlineDeviceColumns.deviceType'),
      key: 'deviceType',
      align: 'center',
      minWidth: 120,
      render: row => {
        return <DictTag size="small" value={row.deviceType} dict-code="sys_device_type" />;
      }
    },
    { title: $t('page.userCenter.onlineDeviceColumns.ipaddr'), key: 'ipaddr', align: 'center', minWidth: 120 },
    {
      title: $t('page.userCenter.onlineDeviceColumns.loginLocation'),
      key: 'loginLocation',
      align: 'center',
      minWidth: 120
    },
    {
      title: $t('page.userCenter.onlineDeviceColumns.browser'),
      key: 'browser',
      align: 'center',
      minWidth: 120,
      render: row => {
        return (
          <div class="flex items-center justify-center gap-2">
            <SvgIcon icon={getBrowserIcon(row.browser)} />
            {row.browser}
          </div>
        );
      }
    },
    {
      title: $t('page.userCenter.onlineDeviceColumns.os'),
      key: 'os',
      align: 'center',
      minWidth: 120,
      render: row => {
        const osName = row.os?.split(' or ')[0] ?? '';
        return (
          <div class="flex items-center justify-center gap-2">
            <SvgIcon icon={getOsIcon(osName)} />
            {osName}
          </div>
        );
      }
    },
    {
      title: $t('page.userCenter.onlineDeviceColumns.loginTime'),
      key: 'loginTime',
      align: 'center',
      minWidth: 180,
      render: row => <NTime time={row.loginTime} format="yyyy-MM-dd HH:mm:ss" />
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      minWidth: 80,
      render: row => {
        return (
          <div class="flex-center gap-8px">
            <ButtonIcon
              text
              type="error"
              local-icon="material-symbols-delete-outline"
              loading={btnLoading.value}
              class="text-18px"
              tooltipContent={$t('page.userCenter.forceLogout')}
              popconfirmContent={$t('page.userCenter.confirmForceLogout')}
              onPositiveClick={() => forceLogout(row.tokenId)}
            />
          </div>
        );
      }
    }
  ]
});

/** 强制下线 */
async function forceLogout(tokenId: string) {
  startBtnLoading();
  const { error } = await fetchKickOutCurrentDevice(tokenId);
  if (!error) {
    window.$message?.success($t('page.userCenter.forceLogoutSuccess'));
    await getData();
  }
  endBtnLoading();
}
</script>

<template>
  <NDataTable
    :columns="columns"
    :data="data"
    size="small"
    :flex-height="!appStore.isMobile"
    :scroll-x="scrollX"
    :loading="loading"
    remote
    :row-key="row => row.noticeId"
    class="h-full"
  />
</template>

<style scoped></style>
