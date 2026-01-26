<script setup lang="ts">
/**
 * 数据源管理页面
 * @author Mahone
 * @date 2026-01-20
 */
import { h, onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NPopconfirm, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { deleteDataSource, fetchDataSourceList } from '@/service/api/ai/datasource';
import DataSourceFormModal from './components/DataSourceFormModal.vue';
import MetadataManagerModal from './components/MetadataManagerModal.vue';

const message = useMessage();

// 数据源列表
const dataSourceList = ref<any[]>([]);
const loading = ref(false);

// 对话框控制
const showFormModal = ref(false);
const showMetadataModal = ref(false);
const editingDataSource = ref<any>(null);
const selectedDataSourceId = ref<number | null>(null);

// 表格列定义
const columns: DataTableColumns<any> = [
  {
    title: '数据源名称',
    key: 'dataSourceName',
    width: 200
  },
  {
    title: '类型',
    key: 'sourceType',
    width: 120,
    render: row => {
      const typeMap: Record<string, { label: string; type: 'success' | 'info' }> = {
        DYNAMIC: { label: '动态数据源', type: 'success' },
        MANUAL: { label: '手工配置', type: 'info' }
      };
      const config = typeMap[row.sourceType] || { label: row.sourceType, type: 'info' };
      return h(NTag, { type: config.type }, { default: () => config.label });
    }
  },
  {
    title: '连接信息',
    key: 'jdbcUrl',
    ellipsis: { tooltip: true }
  },
  {
    title: '状态',
    key: 'isEnabled',
    width: 100,
    render: row => {
      return h(
        NTag,
        { type: row.isEnabled === '1' ? 'success' : 'default' },
        { default: () => (row.isEnabled === '1' ? '启用' : '停用') }
      );
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: row => {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleEdit(row)
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleManageMetadata(row)
              },
              { default: () => '元数据管理' }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row.dataSourceId)
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error'
                    },
                    { default: () => '删除' }
                  ),
                default: () => '确认删除此数据源吗？'
              }
            )
          ]
        }
      );
    }
  }
];

// 加载数据源列表
async function loadDataSources() {
  loading.value = true;
  try {
    const result = await fetchDataSourceList();
    let data: any;
    if (result && typeof result === 'object' && 'data' in result) {
      data = (result as any).data;
    } else {
      data = result;
    }
    dataSourceList.value = data || [];
  } catch (error: any) {
    message.error(`加载数据源失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
}

// 新增数据源
function handleAdd() {
  editingDataSource.value = null;
  showFormModal.value = true;
}

// 编辑数据源
function handleEdit(row: any) {
  editingDataSource.value = row;
  showFormModal.value = true;
}

// 删除数据源
async function handleDelete(id: number) {
  try {
    await deleteDataSource([id]);
    message.success('删除成功');
    await loadDataSources();
  } catch (error: any) {
    message.error(`删除失败: ${error.message || '未知错误'}`);
  }
}

// 管理元数据
function handleManageMetadata(row: any) {
  selectedDataSourceId.value = row.dataSourceId;
  showMetadataModal.value = true;
}

// 表单提交成功回调
function handleFormSuccess() {
  showFormModal.value = false;
  loadDataSources();
}

// 元数据管理成功回调
function handleMetadataSuccess() {
  showMetadataModal.value = false;
}

onMounted(() => {
  loadDataSources();
});
</script>

<template>
  <NCard title="数据源管理" :bordered="false" class="h-full">
    <template #header-extra>
      <NButton type="primary" @click="handleAdd">
        <template #icon>
          <SvgIcon icon="mdi:plus" />
        </template>
        新增数据源
      </NButton>
    </template>

    <NDataTable :columns="columns" :data="dataSourceList" :loading="loading" :bordered="false" />

    <!-- 数据源表单对话框 -->
    <DataSourceFormModal v-model:show="showFormModal" :data-source="editingDataSource" @success="handleFormSuccess" />

    <!-- 元数据管理对话框 -->
    <MetadataManagerModal
      v-model:show="showMetadataModal"
      :data-source-id="selectedDataSourceId"
      @success="handleMetadataSuccess"
    />
  </NCard>
</template>

<style scoped></style>
