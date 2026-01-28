<script lang="ts" setup>
import { h, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NDropdown, NEmpty, NInput, NList, NListItem, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { updateSessionTitle } from '../api/chat';

interface Props {
  appId: string;
  sessions: Api.AI.Chat.Session[];
  currentSessionId?: string;
  logo?: string;
  token?: string;
  title?: string;
  onUpdateTitle?: (sessionId: string, title: string) => Promise<void>;
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
const isSavingTitle = ref(false);
const isCanceling = ref(false);

async function handleSaveTitle(sessionId: string) {
  if (isCanceling.value) {
    isCanceling.value = false;
    return;
  }

  if (isSavingTitle.value) return;
  const newTitle = editingTitle.value.trim();

  if (!newTitle) {
    message.warning('标题不能为空');
    return;
  }

  isSavingTitle.value = true;
  try {
    // 如果提供了自定义更新函数，使用它；否则使用默认的 API
    if (props.onUpdateTitle) {
      await props.onUpdateTitle(sessionId, newTitle);
    } else {
      await updateSessionTitle(sessionId, newTitle, props.token);
    }
    message.success('标题已更新');
    editingSessionId.value = null;
    emit('refresh');
  } catch {
    message.error('更新标题失败');
  } finally {
    isSavingTitle.value = false;
  }
}

// 取消编辑
function handleCancelEdit() {
  isCanceling.value = true;
  editingSessionId.value = null;
  editingTitle.value = '';
}

// 渲染图标
const renderIcon = (icon: string) => () => h(SvgIcon, { icon, class: 'text-base' });

// 菜单选项
const menuOptions = [
  { label: '编辑', key: 'edit', icon: renderIcon('carbon:edit') },
  { label: '删除', key: 'delete', icon: renderIcon('carbon:trash-can') }
];

// 菜单操作
function handleMenuSelect(key: string, session: Api.AI.Chat.Session) {
  if (key === 'edit') {
    handleEditTitle(session);
  } else if (key === 'delete') {
    emit('delete', String(session.sessionId));
  }
}

// 按键处理
function handleKeyDown(e: KeyboardEvent, _sessionId: string) {
  if (e.key === 'Enter') {
    e.preventDefault();
    (e.target as HTMLInputElement).blur();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    handleCancelEdit();
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部 (Logo & 标题) -->
    <div class="flex flex-shrink-0 items-center gap-2 px-4 pb-3 pt-1">
      <img v-if="logo" :src="logo" class="h-6 w-auto" alt="Logo" />
      <span class="text-base text-gray-800 font-bold dark:text-gray-200">{{ title || 'KMatrix Chat' }}</span>
    </div>

    <!-- 新建对话按钮 -->
    <div class="flex-shrink-0 px-4 pb-2">
      <NButton block type="primary" secondary @click="handleNewSession">
        <template #icon>
          <SvgIcon icon="mdi:chat-plus-outline" />
        </template>
        新建对话
      </NButton>
    </div>

    <!-- 历史记录标题 -->
    <div
      class="flex items-center justify-between bg-gray-50/50 px-5 py-2 text-xs text-gray-500 font-medium dark:bg-gray-800/50"
    >
      <div class="flex items-center gap-1">
        <span>历史记录</span>
      </div>
      <SvgIcon
        icon="carbon:trash-can"
        title="清空全部"
        class="cursor-pointer hover:text-red-500"
        @click="emit('delete', 'all')"
      />
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-hidden">
      <NList v-if="sessions.length > 0" clickable hoverable :bordered="false" :show-divider="false">
        <NListItem
          v-for="session in sessions"
          :key="session.sessionId"
          :class="{ '!bg-primary/10': session.sessionId === currentSessionId }"
          class="group cursor-pointer"
          @click="handleSelectSession(session)"
        >
          <div class="w-full flex items-center justify-between gap-2">
            <div class="min-w-0 flex-1">
              <!-- 编辑模式 -->
              <NInput
                v-if="editingSessionId === String(session.sessionId)"
                v-model:value="editingTitle"
                size="small"
                autofocus
                @blur="handleSaveTitle(String(session.sessionId))"
                @click.stop
                @keydown="e => handleKeyDown(e, String(session.sessionId))"
              />
              <!-- 显示模式 -->
              <div v-else class="flex items-center gap-1">
                <div
                  class="flex-1 truncate text-sm font-medium"
                  :title="session.title"
                  style="max-width: 220px"
                  @dblclick="handleEditTitle(session, $event)"
                >
                  {{ session.title }}
                </div>
              </div>
            </div>

            <div
              class="ml-auto flex flex-shrink-0 items-center opacity-0 transition-opacity duration-1 group-hover:opacity-600"
            >
              <NDropdown trigger="click" :options="menuOptions" @select="key => handleMenuSelect(key, session)">
                <NButton circle quaternary size="small" @click.stop>
                  <template #icon>
                    <SvgIcon icon="mdi:dots-horizontal" />
                  </template>
                </NButton>
              </NDropdown>
            </div>
          </div>
        </NListItem>
      </NList>

      <NEmpty v-else class="mt-20" description="暂无对话">
        <template #icon>
          <SvgIcon class="text-6xl" icon="carbon:chat" />
        </template>
      </NEmpty>
    </div>

    <div
      class="flex items-center justify-center bg-gray-50/50 px-5 py-2 text-xs text-gray-500 font-medium dark:bg-gray-800/50"
    >
      <div class="flex items-center gap-1">
        <span>只显示最近20条会话记录</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-list-item) {
  padding: 1px 10px 1px 20px !important;
}
:deep(.n-list.n-list--hoverable .n-list-item:hover) {
  background-color: rgba(0, 0, 0, 0.08);
}
:deep(.n-list-item__divider) {
  display: none !important;
}
:deep(.n-list-item) {
  border-bottom: none !important;
}
</style>
