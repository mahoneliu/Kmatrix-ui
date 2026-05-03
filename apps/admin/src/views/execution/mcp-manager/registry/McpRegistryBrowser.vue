<script setup lang="ts">
/**
 * MCP 注册源浏览页面
 * @author Mahone
 */
import { computed, h, onMounted, ref, watch } from 'vue';
import { NAlert, NButton, NDataTable, NEllipsis, NInput, NSelect, NSpace, NSpin, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns, SelectOption } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { searchRegistryEntries } from '@/service/api/ai/mcp-registry';
import { $t } from '@/locales';
import McpRegistryEntryDetail from './McpRegistryEntryDetail.vue';
import McpImportDialog from './McpImportDialog.vue';

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const message = useMessage();

// ── 搜索状态 ──────────────────────────────────────────────
const keyword = ref('');
const sourcePlatform = ref<string | null>(null);
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);
const loading = ref(false);
const rows = ref<Api.Ai.McpRegistryEntryVo[]>([]);
const isSyncing = ref(false);
const transportType = ref<string | null>(null);

// ── 防抖 ──────────────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(keyword, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pageNum.value = 1;
    loadEntries();
  }, 300);
});

watch(sourcePlatform, () => {
  pageNum.value = 1;
  loadEntries();
});

watch(transportType, () => {
  pageNum.value = 1;
  loadEntries();
});

// ── 来源筛选选项 ──────────────────────────────────────────
const platformOptions = computed<SelectOption[]>(() => [
  { label: $t('ai.mcp.registryBrowser.filterAll'), value: '' },
  { label: $t('ai.mcp.registryBrowser.filterOfficial'), value: 'official' },
  { label: $t('ai.mcp.registryBrowser.filterCommunity'), value: 'smithery' },
  { label: 'Pulsar (mcp.run)', value: 'pulsar' }
]);

const transportOptions = computed<SelectOption[]>(() => [
  { label: $t('ai.mcp.registryBrowser.filterAll'), value: '' },
  { label: $t('ai.mcp.registryBrowser.transportRemote'), value: 'sse' },
  { label: 'HTTP (Remote)', value: 'streamable_http' },
  { label: $t('ai.mcp.registryBrowser.transportLocal'), value: 'stdio' }
]);

// ── 详情抽屉 ──────────────────────────────────────────────
const showDetail = ref(false);
const selectedEntry = ref<Api.Ai.McpRegistryEntryVo | null>(null);

// ── 导入对话框 ────────────────────────────────────────────
const showImport = ref(false);
const importEntry = ref<Api.Ai.McpRegistryEntryVo | null>(null);

// ── 表格列定义 ────────────────────────────────────────────
const columns: DataTableColumns<Api.Ai.McpRegistryEntryVo> = [
  {
    title: () => $t('ai.mcp.serverName'),
    key: 'entryName',
    width: 400,
    render: row =>
      h('div', { class: 'flex items-center gap-2' }, [
        row.iconUrl ? h('img', { src: row.iconUrl, class: 'w-5 h-5 rounded', alt: '' }) : null,
        h('span', { class: 'font-medium' }, row.displayName || row.entryName)
      ])
  },
  {
    title: () => $t('ai.mcp.description'),
    key: 'description',
    render: row =>
      h(NEllipsis, { tooltip: true, lineClamp: 1, style: 'min-width: 500px' }, { default: () => row.description })
  },
  {
    title: () => $t('ai.mcp.registryBrowser.platform'),
    key: 'sourcePlatform',
    width: 120,
    render: row => {
      const isOfficial = row.sourcePlatform === 'official';
      const isPulsar = row.sourcePlatform === 'pulsar';
      let type: 'info' | 'success' | 'warning' = 'success';
      if (isOfficial) type = 'info';
      if (isPulsar) type = 'warning';

      return h(
        NTag,
        { type, size: 'small' },
        {
          default: () => {
            if (isOfficial) return $t('ai.mcp.registryBrowser.filterOfficial');
            if (isPulsar) return 'Pulsar';
            return 'Smithery';
          }
        }
      );
    }
  },
  {
    title: () => $t('ai.mcp.transportType'),
    key: 'transportType',
    width: 100,
    render: row => {
      if (!row.transportType) return null;
      const isRemote = row.transportType === 'sse' || row.transportType === 'streamable_http';
      return h(
        NTag,
        { size: 'small', type: isRemote ? 'primary' : 'default', bordered: isRemote },
        { default: () => (isRemote ? `${row.transportType.toUpperCase()} (Cloud)` : row.transportType.toUpperCase()) }
      );
    }
  },
  {
    title: () => $t('ai.mcp.registryBrowser.rating'),
    key: 'rating',
    width: 80,
    render: row =>
      row.rating !== null && row.rating !== undefined
        ? h('span', {}, `${row.rating}`)
        : h('span', { class: 'text-gray-400' }, '-')
  },
  {
    title: () => $t('common.action'),
    key: 'actions',
    width: 180,
    render: row =>
      h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              { size: 'small', onClick: () => handleDetail(row) },
              { default: () => $t('ai.mcp.registryBrowser.detailBtn') }
            ),
            row.isImported
              ? h(NTag, { type: 'success', size: 'small' }, { default: () => $t('ai.mcp.registryBrowser.imported') })
              : h(
                  NButton,
                  { size: 'small', type: 'primary', onClick: () => handleImport(row) },
                  { default: () => $t('ai.mcp.registryBrowser.importBtn') }
                )
          ]
        }
      )
  }
];

// ── 数据加载 ──────────────────────────────────────────────
async function loadEntries() {
  loading.value = true;
  try {
    const res = await searchRegistryEntries({
      keyword: keyword.value || undefined,
      sourcePlatform: sourcePlatform.value || undefined,
      transportType: transportType.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    const data = (res as any)?.data ?? res;
    if (data?.rows?.length === 0 && pageNum.value === 1) {
      isSyncing.value = true;
    } else {
      isSyncing.value = false;
    }
    rows.value = data?.rows ?? [];
    total.value = data?.total ?? 0;
  } catch {
    message.error($t('common.fetchListFail'));
  } finally {
    loading.value = false;
  }
}

function handleDetail(row: Api.Ai.McpRegistryEntryVo) {
  selectedEntry.value = row;
  showDetail.value = true;
}

function handleImport(row: Api.Ai.McpRegistryEntryVo) {
  importEntry.value = row;
  showImport.value = true;
}

function handleImportSuccess() {
  showImport.value = false;
  loadEntries();
  emit('imported');
}

function handlePageChange(page: number) {
  pageNum.value = page;
  loadEntries();
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  pageNum.value = 1;
  loadEntries();
}

onMounted(() => loadEntries());
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 搜索与筛选 -->
    <div class="flex flex-wrap items-center gap-3">
      <NInput
        v-model:value="keyword"
        clearable
        class="w-64"
        :placeholder="$t('ai.mcp.registryBrowser.searchPlaceholder')"
      >
        <template #prefix>
          <SvgIcon icon="mdi:magnify" />
        </template>
      </NInput>
      <NSelect
        v-model:value="sourcePlatform"
        :options="platformOptions"
        class="w-40"
        clearable
        :placeholder="$t('ai.mcp.registryBrowser.filterAll')"
      />
      <NSelect
        v-model:value="transportType"
        :options="transportOptions"
        class="w-56"
        clearable
        :placeholder="$t('ai.mcp.registryBrowser.filterTransportType')"
      />
    </div>

    <!-- 同步中提示 -->
    <NAlert v-if="isSyncing" type="info" :show-icon="true">
      {{ $t('ai.mcp.registryBrowser.syncingTip') }}
    </NAlert>

    <!-- 数据表格 -->
    <NSpin :show="loading">
      <NDataTable
        :columns="columns"
        :data="rows"
        :bordered="false"
        :pagination="{
          page: pageNum,
          pageSize,
          itemCount: total,
          pageSizes: [10, 20, 50],
          showSizePicker: true,
          onChange: handlePageChange,
          onUpdatePageSize: handlePageSizeChange
        }"
        :remote="true"
      />
    </NSpin>

    <!-- 条目详情抽屉 -->
    <McpRegistryEntryDetail
      v-if="selectedEntry"
      v-model:show="showDetail"
      :entry="selectedEntry"
      @import="handleImport"
    />

    <!-- 导入对话框 -->
    <McpImportDialog v-if="importEntry" v-model:show="showImport" :entry="importEntry" @success="handleImportSuccess" />
  </div>
</template>
