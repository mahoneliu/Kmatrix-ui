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
    title: '表名',
    key: 'tableName',
    width: 200
  },
  {
    title: '表注释',
    key: 'tableComment',
    ellipsis: { tooltip: true }
  },
  {
    title: '来源',
    key: 'metaSourceType',
    width: 100,
    render: row => (row.metaSourceType === 'DDL' ? 'DDL 导入' : 'JDBC 同步')
  },
  {
    title: '操作',
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
        { default: () => '删除' }
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
    message.error(`加载元数据失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
}

// 导入 DDL
async function handleImportDdl() {
  if (!ddlContent.value.trim()) {
    message.warning('请输入 DDL 语句');
    return;
  }

  if (!props.dataSourceId) return;

  loading.value = true;
  try {
    await parseDdlAndSave({
      dataSourceId: props.dataSourceId,
      ddlContent: ddlContent.value
    });
    message.success('DDL 导入成功');
    ddlContent.value = '';
    await loadMetadata();
  } catch (error: any) {
    message.error(`DDL 导入失败: ${error.message || '未知错误'}`);
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
    message.success('元数据同步成功');
    await loadMetadata();
  } catch (error: any) {
    message.error(`同步失败: ${error.message || '未知错误'}`);
  } finally {
    syncLoading.value = false;
  }
}

// 删除元数据
async function handleDeleteMeta(metaId: number) {
  try {
    await deleteMetadata([metaId]);
    message.success('删除成功');
    await loadMetadata();
  } catch (error: any) {
    message.error(`删除失败: ${error.message || '未知错误'}`);
  }
}

// 关闭对话框
function handleClose() {
  emit('update:show', false);
}
</script>

<template>
  <NModal :show="show" preset="card" title="元数据管理" class="w-240" @update:show="handleClose">
    <NTabs type="line">
      <!-- DDL 导入 -->
      <NTabPane name="ddl" tab="DDL 导入">
        <div class="flex flex-col gap-3">
          <div class="text-sm c-gray-6">
            请粘贴 MySQL CREATE TABLE 语句，系统将自动解析表结构信息。支持多个表的 DDL 语句。
          </div>
          <NInput
            v-model:value="ddlContent"
            type="textarea"
            :rows="12"
            placeholder="CREATE TABLE users (&#10;  id BIGINT PRIMARY KEY COMMENT '用户ID',&#10;  username VARCHAR(50) COMMENT '用户名',&#10;  ...&#10;);"
          />
          <div class="flex justify-end">
            <NButton type="primary" :loading="loading" @click="handleImportDdl">解析并导入</NButton>
          </div>
        </div>
      </NTabPane>

      <!-- JDBC 同步 -->
      <NTabPane name="jdbc" tab="JDBC 同步">
        <div class="flex flex-col gap-3">
          <div class="text-sm c-gray-6">
            从数据库的 information_schema 自动获取所有表的结构信息。此操作会覆盖已存在的元数据。
          </div>
          <div class="flex justify-end">
            <NButton type="primary" :loading="syncLoading" @click="handleSyncFromJdbc">
              <template #icon>
                <SvgIcon local-icon="mdi-sync" />
              </template>
              同步元数据
            </NButton>
          </div>
        </div>
      </NTabPane>

      <!-- 元数据列表 -->
      <NTabPane name="list" tab="元数据列表">
        <NDataTable :columns="columns" :data="metadataList" :loading="loading" :bordered="false" size="small" />
      </NTabPane>
    </NTabs>

    <template #footer>
      <div class="flex justify-end">
        <NButton @click="handleClose">关闭</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
