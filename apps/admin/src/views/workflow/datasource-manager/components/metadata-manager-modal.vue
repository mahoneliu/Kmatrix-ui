<script setup lang="ts">
/**
 * 元数据管理对话框
 * @author Mahone
 * @date 2026-01-20
 */
import { h, ref, watch } from 'vue';
import { type DataTableColumns, NButton, NDataTable, NInput, NModal, NTabPane, NTabs, useMessage } from 'naive-ui';
import {
  deleteMetadata,
  fetchMetadataList,
  parseDdlAndSave,
  syncMetadataFromDatabase
} from '@/service/api/ai/datasource';
import { $t } from '@/locales';

interface Props {
  show: boolean;
  dataSourceId: number | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();

const metadataList = ref<any[]>([]);
const loading = ref(false);
const ddlContent = ref('');
const syncLoading = ref(false);

// 表格列定义
const columns: DataTableColumns<any> = [
  {
    title: () => $t('ai.datasource.table_name'),
    key: 'tableName',
    width: 200
  },
  {
    title: () => $t('ai.datasource.table_comment'),
    key: 'tableComment',
    ellipsis: { tooltip: true }
  },
  {
    title: () => $t('ai.datasource.metadata.source_label'),
    key: 'metaSourceType',
    width: 100,
    render: row =>
      row.metaSourceType === 'DDL' ? $t('ai.datasource.metadata.source_ddl') : $t('ai.datasource.metadata.source_jdbc')
  },
  {
    title: () => $t('ai.datasource.operation'),
    key: 'actions',
    width: 100,
    render: row => {
      return h(
        NButton,
        {
          size: 'small',
          type: 'error',
          onClick: () => handleDeleteMeta(row.metaId)
        },
        { default: () => $t('ai.datasource.delete') }
      );
    }
  }
];

// 监听对话框显示状态
watch(
  () => props.show,
  newVal => {
    if (newVal && props.dataSourceId) {
      loadMetadata();
    }
  }
);

// 加载元数据列表
async function loadMetadata() {
  if (!props.dataSourceId) return;

  loading.value = true;
  try {
    const result = await fetchMetadataList(props.dataSourceId);
    let data: any;
    if (result && typeof result === 'object' && 'data' in result) {
      data = (result as any).data;
    } else {
      data = result;
    }
    metadataList.value = data || [];
  } catch (error: any) {
    message.error(
      $t('ai.datasource.metadata.load_fail', {
        error: error.message || $t('ai.datasource.metadata.unknown_error')
      })
    );
  } finally {
    loading.value = false;
  }
}

// 导入 DDL
async function handleImportDdl() {
  if (!ddlContent.value.trim()) {
    message.warning($t('ai.datasource.metadata.ddl_required'));
    return;
  }

  if (!props.dataSourceId) return;

  loading.value = true;
  try {
    await parseDdlAndSave({
      dataSourceId: props.dataSourceId,
      ddlContent: ddlContent.value
    });
    message.success($t('ai.datasource.metadata.import_success'));
    ddlContent.value = '';
    await loadMetadata();
  } catch (error: any) {
    message.error(
      $t('ai.datasource.metadata.import_fail', {
        error: error.message || $t('ai.datasource.metadata.unknown_error')
      })
    );
  } finally {
    loading.value = false;
  }
}

// JDBC 同步元数据
async function handleSyncFromJdbc() {
  if (!props.dataSourceId) return;

  syncLoading.value = true;
  try {
    await syncMetadataFromDatabase(props.dataSourceId);
    message.success($t('ai.datasource.metadata.sync_success'));
    await loadMetadata();
  } catch (error: any) {
    message.error(
      $t('ai.datasource.metadata.sync_fail', {
        error: error.message || $t('ai.datasource.metadata.unknown_error')
      })
    );
  } finally {
    syncLoading.value = false;
  }
}

// 删除元数据
async function handleDeleteMeta(metaId: number) {
  try {
    await deleteMetadata([metaId]);
    message.success($t('ai.datasource.metadata.delete_success'));
    await loadMetadata();
  } catch (error: any) {
    message.error(
      $t('ai.datasource.metadata.delete_fail', {
        error: error.message || $t('ai.datasource.metadata.unknown_error')
      })
    );
  }
}

// 关闭对话框
function handleClose() {
  emit('update:show', false);
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="$t('ai.datasource.metadata.title')"
    class="w-240"
    @update:show="handleClose"
  >
    <NTabs type="line">
      <!-- DDL 导入 -->
      <NTabPane name="ddl" :tab="$t('ai.datasource.metadata.ddl_import_title')">
        <div class="flex flex-col gap-3">
          <div class="text-sm c-gray-6">
            {{ $t('ai.datasource.metadata.ddl_tip') }}
          </div>
          <NInput
            v-model:value="ddlContent"
            type="textarea"
            :rows="12"
            :placeholder="$t('ai.datasource.metadata.ddl_placeholder')"
          />
          <div class="flex justify-end">
            <NButton type="primary" :loading="loading" @click="handleImportDdl">
              {{ $t('ai.datasource.metadata.parse_and_import') }}
            </NButton>
          </div>
        </div>
      </NTabPane>

      <!-- JDBC 同步 -->
      <NTabPane name="jdbc" :tab="$t('ai.datasource.metadata.jdbc_tab')">
        <div class="flex flex-col gap-3">
          <div class="text-sm c-gray-6">
            {{ $t('ai.datasource.metadata.jdbc_sync_tip') }}
          </div>
          <div class="flex justify-end">
            <NButton type="primary" :loading="syncLoading" @click="handleSyncFromJdbc">
              <template #icon>
                <SvgIcon local-icon="mdi-sync" />
              </template>
              {{ $t('ai.datasource.metadata.sync_metadata_title') }}
            </NButton>
          </div>
        </div>
      </NTabPane>

      <!-- 元数据列表 -->
      <NTabPane name="list" :tab="$t('ai.datasource.metadata.list_tab')">
        <NDataTable :columns="columns" :data="metadataList" :loading="loading" :bordered="false" size="small" />
      </NTabPane>
    </NTabs>

    <template #footer>
      <div class="flex justify-end">
        <NButton @click="handleClose">{{ $t('ai.datasource.metadata.close') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
