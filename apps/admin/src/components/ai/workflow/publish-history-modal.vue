<script lang="ts" setup>
import { ref } from 'vue';
import { NDataTable, NModal, NSpin, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { fetchPublishHistory } from '@/service/api/ai/app';

interface Props {
  visible: boolean;
  appId: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();

const loading = ref(false);
const publishHistory = ref<Api.AI.Admin.AppVersion[]>([]);

// 表格列定义
const columns: DataTableColumns<Api.AI.Admin.AppVersion> = [
  {
    title: '版本号',
    key: 'version',
    width: 100,
    align: 'center'
  },
  {
    title: '发布时间',
    key: 'createTime',
    width: 180,
    render: row => {
      if (!row.createTime) return '-';
      return new Date(row.createTime).toLocaleString('zh-CN');
    }
  },
  {
    title: '发布人',
    key: 'createByName',
    width: 120
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: {
      tooltip: true
    }
  }
];

// 加载发布历史
async function loadPublishHistory() {
  if (!props.appId) return;

  loading.value = true;
  try {
    const { data, error } = await fetchPublishHistory(props.appId);
    if (error) {
      message.error('加载发布历史失败');
      return;
    }
    publishHistory.value = data || [];
  } catch {
    message.error('加载发布历史失败');
  } finally {
    loading.value = false;
  }
}

// 监听弹窗打开
function handleAfterEnter() {
  loadPublishHistory();
}

// 关闭弹窗
function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    title="发布历史"
    class="w-[800px]"
    @update:show="handleClose"
    @after-enter="handleAfterEnter"
  >
    <NSpin :show="loading">
      <NDataTable
        :columns="columns"
        :data="publishHistory"
        :bordered="false"
        :single-line="false"
        :max-height="500"
        :pagination="{
          pageSize: 10,
          showSizePicker: true,
          pageSizes: [10, 20, 50]
        }"
      />
      <div v-if="!loading && publishHistory.length === 0" class="py-12 text-center text-gray-400">暂无发布历史</div>
    </NSpin>
  </NModal>
</template>

<style scoped></style>
