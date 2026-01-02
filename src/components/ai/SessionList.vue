<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NEmpty, NInput, NList, NListItem, NTime, NTooltip, useMessage } from 'naive-ui';
import { updateSessionTitle } from '@/service/api/ai-chat';
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
const message = useMessage();

// 编辑状态
const editingSessionId = ref<string | null>(null);
const editingTitle = ref('');

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

// 开始编辑标题
function handleEditTitle(session: Api.AI.Chat.Session, event?: Event) {
  event?.stopPropagation();
  editingSessionId.value = String(session.sessionId);
  editingTitle.value = session.title;
}

// 保存标题
async function handleSaveTitle(sessionId: string) {
  const newTitle = editingTitle.value.trim();

  if (!newTitle) {
    message.warning('标题不能为空');
    return;
  }

  try {
    await updateSessionTitle(sessionId, newTitle);
    message.success('标题已更新');
    editingSessionId.value = null;
    emit('refresh');
  } catch {
    message.error('更新标题失败');
  }
}

// 取消编辑
function handleCancelEdit() {
  editingSessionId.value = null;
  editingTitle.value = '';
}

// 按键处理
function handleKeyDown(e: KeyboardEvent, sessionId: string) {
  if (e.key === 'Enter') {
    handleSaveTitle(sessionId);
  } else if (e.key === 'Escape') {
    handleCancelEdit();
  }
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
              <!-- 编辑模式 -->
              <NInput
                v-if="editingSessionId === String(session.sessionId)"
                v-model:value="editingTitle"
                size="small"
                autofocus
                @blur="handleSaveTitle(String(session.sessionId))"
                @keydown="e => handleKeyDown(e, String(session.sessionId))"
              />
              <!-- 显示模式 -->
              <div v-else class="flex items-center gap-1">
                <div class="flex-1 truncate text-sm font-medium" @dblclick="handleEditTitle(session, $event)">
                  {{ session.title }}
                </div>
                <NButton
                  circle
                  quaternary
                  size="tiny"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                  @click="handleEditTitle(session, $event)"
                >
                  <template #icon>
                    <SvgIcon icon="carbon:edit" class="text-xs" />
                  </template>
                </NButton>
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
