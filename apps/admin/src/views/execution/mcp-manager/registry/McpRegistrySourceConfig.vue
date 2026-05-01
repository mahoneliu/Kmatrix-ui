<script setup lang="ts">
/**
 * MCP 注册源配置管理面板
 * @author Mahone
 */
import { h, onMounted, ref } from 'vue';
import { NButton, NDataTable, NInputNumber, NPopconfirm, NSpace, NSwitch, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import {
  deleteRegistrySource,
  fetchRegistrySources,
  syncRegistrySource,
  updateRegistrySource
} from '@/service/api/ai/mcp-registry';
import { $t } from '@/locales';

const message = useMessage();
const loading = ref(false);
const sources = ref<Api.Ai.McpRegistrySourceVo[]>([]);
const syncingIds = ref<Set<CommonType.IdType>>(new Set());

const syncStatusTypeMap: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  success: 'success',
  failed: 'error',
  running: 'warning'
};

const columns: DataTableColumns<Api.Ai.McpRegistrySourceVo> = [
  {
    title: () => $t('ai.mcp.registryConfig.sourceName'),
    key: 'sourceName',
    width: 160
  },
  {
    title: () => $t('ai.mcp.registryConfig.sourceType'),
    key: 'sourceType',
    width: 90,
    render: row =>
      h(
        NTag,
        { type: row.sourceType === 'official' ? 'info' : 'success', size: 'small' },
        { default: () => (row.sourceType === 'official' ? '官方' : '社区') }
      )
  },
  {
    title: () => $t('common.status'),
    key: 'isEnabled',
    width: 90,
    render: row =>
      h(NSwitch, {
        value: row.isEnabled === '1',
        onUpdateValue: (val: boolean) => handleToggleEnabled(row, val)
      })
  },
  {
    title: () => $t('ai.mcp.registryConfig.syncInterval'),
    key: 'syncInterval',
    width: 180,
    render: row =>
      h(NInputNumber, {
        value: row.syncInterval,
        min: 3600,
        max: 604800,
        step: 3600,
        size: 'small',
        onUpdateValue: (val: number | null) => {
          if (val !== null) handleUpdateInterval(row, val);
        }
      })
  },
  {
    title: () => $t('ai.mcp.registryConfig.lastSyncTime'),
    key: 'lastSyncTime',
    width: 170,
    render: row => h('span', {}, row.lastSyncTime ?? '-')
  },
  {
    title: () => $t('ai.mcp.registryConfig.syncStatus'),
    key: 'lastSyncStatus',
    width: 100,
    render: row => {
      if (!row.lastSyncStatus) return h('span', { class: 'text-gray-400' }, '-');
      const type = syncStatusTypeMap[row.lastSyncStatus] ?? 'default';
      const labelMap: Record<string, string> = {
        success: $t('ai.mcp.registryConfig.syncStatusSuccess'),
        failed: $t('ai.mcp.registryConfig.syncStatusFailed'),
        running: $t('ai.mcp.registryConfig.syncStatusRunning')
      };
      return h(NTag, { type, size: 'small' }, { default: () => labelMap[row.lastSyncStatus!] ?? row.lastSyncStatus });
    }
  },
  {
    title: () => $t('common.action'),
    key: 'actions',
    width: 160,
    render: row =>
      h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                loading: syncingIds.value.has(row.sourceId),
                onClick: () => handleManualSync(row)
              },
              { default: () => $t('ai.mcp.registryConfig.manualSync') }
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDelete(row.sourceId) },
              {
                trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => $t('common.delete') }),
                default: () => $t('ai.mcp.registryConfig.deleteConfirm')
              }
            )
          ]
        }
      )
  }
];

async function loadSources() {
  loading.value = true;
  try {
    const res = await fetchRegistrySources();
    sources.value = (res as any)?.data ?? res ?? [];
  } catch {
    message.error($t('common.fetchListFail'));
  } finally {
    loading.value = false;
  }
}

async function handleToggleEnabled(row: Api.Ai.McpRegistrySourceVo, enabled: boolean) {
  try {
    await updateRegistrySource(row.sourceId, { isEnabled: enabled ? '1' : '0' });
    row.isEnabled = enabled ? '1' : '0';
    message.success($t('ai.mcp.registryConfig.updateSuccess'));
  } catch {
    message.error($t('common.error'));
  }
}

async function handleUpdateInterval(row: Api.Ai.McpRegistrySourceVo, interval: number) {
  try {
    await updateRegistrySource(row.sourceId, { syncInterval: interval });
    row.syncInterval = interval;
    message.success($t('ai.mcp.registryConfig.updateSuccess'));
  } catch (err: any) {
    message.error(err?.response?.data?.msg ?? $t('common.error'));
  }
}

async function handleManualSync(row: Api.Ai.McpRegistrySourceVo) {
  syncingIds.value.add(row.sourceId);
  try {
    const res = await syncRegistrySource(row.sourceId);
    const result = (res as any)?.data ?? res;
    if (result?.syncStatus === 'success') {
      message.success(`${$t('ai.mcp.registryConfig.syncSuccess')}，共同步 ${result.syncCount} 条`);
    } else {
      message.warning(`${$t('ai.mcp.registryConfig.syncFail')}: ${result?.errorMessage ?? ''}`);
    }
    await loadSources();
  } catch {
    message.error($t('ai.mcp.registryConfig.syncFail'));
  } finally {
    syncingIds.value.delete(row.sourceId);
  }
}

async function handleDelete(id: CommonType.IdType) {
  try {
    await deleteRegistrySource(id);
    message.success($t('ai.mcp.registryConfig.deleteSuccess'));
    await loadSources();
  } catch {
    message.error($t('common.error'));
  }
}

onMounted(() => loadSources());
</script>

<template>
  <NDataTable :columns="columns" :data="sources" :loading="loading" :bordered="false" size="small" />
</template>
