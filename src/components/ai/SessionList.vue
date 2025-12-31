<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { NButton, NEmpty, NList, NListItem, NTime, NTooltip } from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';

interface Props {
  appId: string;
  sessions: Api.AI.Chat.Session[];
  currentSessionId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  refresh: [];
  select: [sessionId: string];
  delete: [sessionId: string];
}>();

const router = useRouter();

// 选择会话
function handleSelectSession(session: Api.AI.Chat.Session) {
  emit('select', String(session.sessionId));
}

// 删除会话
function handleDeleteSession(event: Event, sessionId: string | number) {
  event.stopPropagation();
  emit('delete', String(sessionId));
}

// 创建新会话
function handleNewSession() {
  router.push({ name: 'ai_chat', query: { appId: props.appId } });
  emit('refresh');
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部 -->
    <div class="flex-shrink-0 border-b border-gray-200 border-solid px-4 py-3 dark:border-gray-700">
      <NButton block type="primary" @click="handleNewSession">
        <template #icon>
          <SvgIcon icon="carbon:add" />
        </template>
        新建对话
      </NButton>
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-y-auto">
      <NList v-if="sessions.length > 0" clickable hoverable>
        <NListItem
          v-for="session in sessions"
          :key="session.sessionId"
          :class="{ '!bg-primary/10': session.sessionId === currentSessionId }"
          class="cursor-pointer"
          @click="handleSelectSession(session)"
        >
          <div class="w-full flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">
                {{ session.title }}
              </div>
              <div class="mt-1 text-xs text-gray-400">
                <NTime :time="new Date(session.createTime)" type="relative" />
              </div>
            </div>
            <NTooltip trigger="hover">
              <template #trigger>
                <NButton circle quaternary size="small" @click="e => handleDeleteSession(e, session.sessionId)">
                  <template #icon>
                    <SvgIcon class="text-base" icon="carbon:trash-can" />
                  </template>
                </NButton>
              </template>
              删除会话
            </NTooltip>
          </div>
        </NListItem>
      </NList>

      <NEmpty v-else class="mt-20" description="暂无对话">
        <template #icon>
          <SvgIcon class="text-6xl" icon="carbon:chat" />
        </template>
      </NEmpty>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-list-item) {
  padding: 12px 16px;
}
</style>
