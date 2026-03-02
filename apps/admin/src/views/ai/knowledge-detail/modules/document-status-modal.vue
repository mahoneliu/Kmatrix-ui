<script setup lang="ts">
import { computed } from 'vue';
import { NEmpty, NModal, NTimeline, NTimelineItem } from 'naive-ui';
import dayjs from 'dayjs';
import { $t } from '@/locales';

interface Props {
  visible: boolean;
  meta: Record<string, any> | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
}>();

const show = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val)
});

// 解析状态时间日志
// state_time: { "1": { "0": "time", "1": "time" }, "2": { ... } }
// TaskType: 1=Embedding, 2=GenerateQuestion
// Status: 0=Pending, 1=Started, 2=Success, 3=Failed
const timelineItems = computed(() => {
  if (!props.meta || !props.meta.state_time) {
    return [];
  }

  const items: Array<{
    type: 'default' | 'success' | 'info' | 'warning' | 'error';
    title: string;
    content: string;
    time: string;
    timestamp: number;
  }> = [];

  const taskNameMap: Record<string, string> = {
    '1': $t('ai.documentStatusModal.embeddingTask'),
    '2': $t('ai.documentStatusModal.generateQuestionTask')
  };

  const statusMap: Record<string, { label: string; type: 'default' | 'success' | 'info' | 'warning' | 'error' }> = {
    '0': { label: $t('ai.documentStatusModal.pending'), type: 'default' },
    '1': { label: $t('ai.documentStatusModal.started'), type: 'info' },
    '2': { label: $t('ai.documentStatusModal.success'), type: 'success' },
    '3': { label: $t('ai.documentStatusModal.failed'), type: 'error' }
  };

  const stateTime = props.meta.state_time;

  Object.keys(stateTime).forEach(taskType => {
    const taskStates = stateTime[taskType];
    const taskName = taskNameMap[taskType] || `${$t('ai.documentStatusModal.unknownTask')}(${taskType})`;

    Object.keys(taskStates).forEach(status => {
      const timeStr = taskStates[status];
      const statusInfo = statusMap[status] || {
        label: `${$t('ai.documentStatusModal.unknownStatus')}(${status})`,
        type: 'default'
      };

      items.push({
        type: statusInfo.type,
        title: `${taskName} - ${statusInfo.label}`,
        content: '',
        time: dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss'),
        timestamp: dayjs(timeStr).valueOf()
      });
    });
  });

  return items.sort((a, b) => b.timestamp - a.timestamp);
});
</script>

<template>
  <NModal v-model:show="show" preset="card" :title="$t('ai.documentStatusModal.statusChangeRecord')" class="w-600px">
    <div v-if="timelineItems.length > 0" class="p-4">
      <NTimeline>
        <NTimelineItem
          v-for="(item, index) in timelineItems"
          :key="index"
          :type="item.type"
          :title="item.title"
          :time="item.time"
        />
      </NTimeline>
    </div>
    <div v-else class="p-8">
      <NEmpty :description="$t('ai.documentStatusModal.noStatusRecord')" />
    </div>
  </NModal>
</template>

<style scoped></style>
