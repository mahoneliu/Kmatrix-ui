<!-- 工作流保存状态指示器组件 -->
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useWorkflowStore } from '@/store/modules/ai/workflow';

const workflowStore = useWorkflowStore();

const tipFlag = ref(false);

watch(
  () => workflowStore.lastSavedAt,
  newVal => {
    if (!newVal) return;
    tipFlag.value = true;
    setTimeout(() => {
      tipFlag.value = false;
    }, 5000);
  }
);

// 计算最后保存时间文本
const lastSavedText = computed(() => {
  if (!workflowStore.lastSavedAt) return '';

  const seconds = Math.floor((Date.now() - workflowStore.lastSavedAt) / 1000);

  if (seconds < 10) return '刚刚保存';
  if (seconds < 60) return '已保存';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前保存`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前保存`;
  return `${Math.floor(seconds / 86400)} 天前保存`;
});
</script>

<template>
  <div class="workflow-save-status flex items-center gap-2 text-13px">
    <!-- 保存中 -->
    <div v-if="workflowStore.isSaving" class="flex items-center gap-1 text-blue-500">
      <SvgIcon icon="mdi:loading" class="animate-spin" :size="14" />
      <span>保存中...</span>
    </div>

    <!-- 未保存 -->
    <div v-else-if="workflowStore.isDirty" class="flex items-center gap-1 text-blue-500">
      <SvgIcon icon="mdi:circle" :size="8" />
      <span>待保存</span>
    </div>

    <!-- 已保存 -->
    <div v-else-if="workflowStore.savedInSession && tipFlag" class="flex items-center gap-1 text-gray-400">
      <SvgIcon icon="mdi:check-circle" :size="14" />
      <span>{{ lastSavedText }}</span>
    </div>
  </div>
</template>

<style scoped>
.workflow-save-status {
  user-select: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
