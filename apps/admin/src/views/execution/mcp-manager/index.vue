<script setup lang="ts">
/**
 * MCP Server 管理页面
 * @author Mahone
 * @date 2026-03-15
 */
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDataTable,
  NInput,
  NPopconfirm,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { deleteMcpServer, fetchMcpServerList } from '@/service/api/ai/mcp-server';
import { $t } from '@/locales';
import McpServerFormDrawer from './components/mcp-server-form-drawer.vue';
import ConnectionTestModal from './components/connection-test-modal.vue';

const message = useMessage();
const router = useRouter();

const searchParams = ref<Api.Ai.McpServerQuery>({
  serverName: ''
});

const mcpList = ref<Api.Ai.McpServerVo[]>([]);
const loading = ref(false);

const showDrawer = ref(false);
const editingServer = ref<Api.Ai.McpServerVo | null>(null);

const showTestModal = ref(false);
const testServer = ref<Api.Ai.McpServerVo | null>(null);

const transportTypeMap: Record<string, { label: string; type: 'success' | 'info' }> = {
  sse: { label: 'SSE', type: 'success' },
  streamable_http: { label: 'HTTP', type: 'info' }
};

const columns: DataTableColumns<Api.Ai.McpServerVo> = [
  {
    title: () => $t('ai.mcp.serverName'),
    key: 'serverName',
    width: 180
  },
  {
    title: () => $t('ai.mcp.description'),
    key: 'description',
    ellipsis: { tooltip: true }
  },
  {
    title: () => $t('ai.mcp.transportType'),
    key: 'transportType',
    width: 110,
    render: row => {
      const cfg = transportTypeMap[row.transportType] ?? { label: row.transportType, type: 'info' };
      return h(NTag, { type: cfg.type, size: 'small' }, { default: () => cfg.label });
    }
  },
  {
    title: () => $t('ai.mcp.status'),
    key: 'status',
    width: 90,
    render: row =>
      h(
        NTag,
        { type: row.status === '0' ? 'success' : 'default', size: 'small' },
        { default: () => (row.status === '0' ? $t('common.enable') : $t('common.disable')) }
      )
  },
  {
    title: () => $t('common.createTime'),
    key: 'createTime',
    width: 170
  },
  {
    title: () => $t('common.action'),
    key: 'actions',
    width: 220,
    render: row =>
      h(
        NSpace,
        {},
        {
          default: () => [
            h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => $t('common.edit') }),
            h(
              NButton,
              { size: 'small', type: 'info', onClick: () => handleTestConnection(row) },
              { default: () => $t('ai.mcp.testConnection') }
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDelete(row.serverId) },
              {
                trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => $t('common.delete') }),
                default: () => $t('common.confirmDelete')
              }
            )
          ]
        }
      )
  }
];

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchMcpServerList(searchParams.value);
    mcpList.value = (res as any)?.data ?? res ?? [];
  } catch {
    message.error($t('common.fetchListFail'));
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editingServer.value = null;
  showDrawer.value = true;
}

function handleEdit(row: Api.Ai.McpServerVo) {
  editingServer.value = { ...row };
  showDrawer.value = true;
}

function handleTestConnection(row: Api.Ai.McpServerVo) {
  testServer.value = row;
  showTestModal.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  try {
    await deleteMcpServer([id]);
    message.success($t('common.deleteSuccess'));
    await loadList();
  } catch {
    message.error($t('common.error'));
  }
}

function handleDrawerSuccess() {
  showDrawer.value = false;
  loadList();
}

onMounted(() => loadList());
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem :title="$t('common.search')" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.serverName"
              clearable
              :placeholder="$t('ai.mcp.searchPlaceholder')"
              @keyup.enter="loadList"
            />
            <NButton type="primary" @click="loadList">
              <template #icon>
                <SvgIcon icon="mdi:magnify" />
              </template>
              {{ $t('common.search') }}
            </NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 列表区域 -->
    <NCard
      :title="$t('ai.mcp.listTitle')"
      :bordered="false"
      size="small"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NSpace>
          <NButton size="small" @click="() => router.push('/execution/mcp-market')">
            <template #icon>
              <SvgIcon icon="mdi:store-outline" />
            </template>
            {{ $t('ai.mcp.market') }}
          </NButton>
          <NButton type="primary" size="small" @click="handleAdd">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
            {{ $t('common.add') }}
          </NButton>
        </NSpace>
      </template>

      <NDataTable :columns="columns" :data="mcpList" :loading="loading" :bordered="false" class="h-full" flex-height />
    </NCard>

    <!-- 表单 Drawer -->
    <McpServerFormDrawer v-model:show="showDrawer" :server="editingServer" @success="handleDrawerSuccess" />

    <!-- 连接测试弹窗 -->
    <ConnectionTestModal v-if="testServer" v-model:show="showTestModal" :server="testServer" />
  </div>
</template>

<style scoped></style>
