<script setup lang="ts">
import { computed } from 'vue';
import { NEmpty, NModal, NTimeline, NTimelineItem } from 'naive-ui';
import dayjs from 'dayjs';

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
    '1': '向量化任务',
    '2': '问题生成任务'
  };

  const statusMap: Record<string, { label: string; type: 'default' | 'success' | 'info' | 'warning' | 'error' }> = {
    '0': { label: '排队中 (Pending)', type: 'default' },
    '1': { label: '执行中 (Started)', type: 'info' },
    '2': { label: '已完成 (Success)', type: 'success' },
    '3': { label: '失败 (Failed)', type: 'error' }
  };

  const stateTime = props.meta.state_time;

  Object.keys(stateTime).forEach(taskType => {
    const taskStates = stateTime[taskType];
    const taskName = taskNameMap[taskType] || `未知任务(${taskType})`;

    Object.keys(taskStates).forEach(status => {
      const timeStr = taskStates[status];
      const statusInfo = statusMap[status] || { label: `未知状态(${status})`, type: 'default' };

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
  <NModal v-model:show="show" preset="card" title="状态变更记录" class="w-600px">
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
      <NEmpty description="暂无状态记录" />
    </div>
  </NModal>
</template>

<style scoped></style>
