<script setup lang="ts">
/**
 * 内置 Python 工具管理页面
 * @author Mahone
 * @date 2026-03-15
 */
import { h, onMounted, ref } from 'vue';
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
import { deleteBuiltinTool, fetchBuiltinToolList } from '@/service/api/ai/builtin-tool';
import { $t } from '@/locales';
import BuiltinToolFormDrawer from './components/builtin-tool-form-drawer.vue';

const message = useMessage();

const searchParams = ref<Api.Ai.BuiltinToolQuery>({
  toolName: ''
});

const toolList = ref<Api.Ai.BuiltinToolVo[]>([]);
const loading = ref(false);

const showDrawer = ref(false);
const editingTool = ref<Api.Ai.BuiltinToolVo | null>(null);

const columns: DataTableColumns<Api.Ai.BuiltinToolVo> = [
  {
    title: () => $t('ai.builtinTool.toolName'),
    key: 'toolName',
    width: 180
  },
  {
    title: () => $t('ai.builtinTool.description'),
    key: 'spec',
    ellipsis: { tooltip: true }
  },
  {
    title: () => $t('ai.builtinTool.status'),
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
    width: 160,
    render: row =>
      h(
        NSpace,
        {},
        {
          default: () => [
            h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => $t('common.edit') }),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDelete(row.toolId) },
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
    const res = await fetchBuiltinToolList(searchParams.value);
    toolList.value = (res as any)?.data ?? res ?? [];
  } catch {
    message.error($t('common.fetchListFail'));
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editingTool.value = null;
  showDrawer.value = true;
}

function handleEdit(row: Api.Ai.BuiltinToolVo) {
  editingTool.value = { ...row };
  showDrawer.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  try {
    await deleteBuiltinTool([id]);
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
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem :title="$t('common.search')" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.toolName"
              clearable
              :placeholder="$t('ai.builtinTool.searchPlaceholder')"
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

    <NCard
      :title="$t('ai.builtinTool.listTitle')"
      :bordered="false"
      size="small"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NButton type="primary" size="small" @click="handleAdd">
          <template #icon>
            <SvgIcon icon="mdi:plus" />
          </template>
          {{ $t('common.add') }}
        </NButton>
      </template>

      <NDataTable :columns="columns" :data="toolList" :loading="loading" :bordered="false" class="h-full" flex-height />
    </NCard>

    <BuiltinToolFormDrawer v-model:show="showDrawer" :tool="editingTool" @success="handleDrawerSuccess" />
  </div>
</template>

<style scoped></style>
