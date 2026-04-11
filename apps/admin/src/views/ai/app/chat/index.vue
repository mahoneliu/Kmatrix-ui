<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NDrawer, NDrawerContent, NTooltip, useMessage } from 'naive-ui';
import { type ChatMessage, ChatPanel, SessionList } from '@km/shared';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import {
  clearAdminAppHistory,
  clearAdminChatHistory,
  fetchAdminChatHistory,
  fetchAdminSessionList,
  submitAdminChatFeedback,
  updateAdminSessionTitle
} from '@/service/api/ai/chat';
import { fetchAppDetail } from '@/service/api/ai/app';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';

const { t } = useI18n();
const route = useRoute();
const message = useMessage();

const nodeDefinitionStore = useNodeDefinitionStore();

function getNodeDefinition(nodeType: string) {
  return nodeDefinitionStore.getNodeDefinition(nodeType);
}

// 应用信息
const appId = ref<string>((route.query.appId as string) || '');
const appInfo = ref<Api.AI.Admin.App | null>(null);

// 会话相关
const sessionId = ref<string | undefined>();
const sessions = ref<Api.AI.Chat.Session[]>([]);
const chatPanelRef = ref();

// 侧边栏状态
const showSessions = ref(false);

/** 加载应用详情 */
async function loadAppInfo() {
  if (!appId.value) return;
  try {
    const { data } = await fetchAppDetail(appId.value);
    if (data) {
      appInfo.value = data;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load app info:', err);
  }
}

/** 加载会话列表 */
async function loadSessions() {
  if (!appId.value) return;
  try {
    const { data } = await fetchAdminSessionList(appId.value);
    if (data) {
      sessions.value = data;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load sessions:', err);
  }
}

/** 加载历史消息 */
async function loadHistory() {
  if (!sessionId.value) return;
  try {
    const { data } = await fetchAdminChatHistory(sessionId.value);
    if (data) {
      const msgs: ChatMessage[] = data.map((item: any, index: number) => ({
        id: item.messageId || String(index),
        role: item.role,
        content: item.content,
        timestamp: item.createTime,
        streaming: false
      }));
      chatPanelRef.value?.setMessages(msgs);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load history:', err);
  }
}

/** 选择会话 */
function handleSelectSession(newSessionId: string) {
  sessionId.value = newSessionId;
  showSessions.value = false;
  loadHistory();
}

/** 新建对话 */
function handleNewSession() {
  sessionId.value = undefined;
  chatPanelRef.value?.clearMessages();
}

/** 删除会话 */
async function handleDeleteSession(deletedSessionId: string) {
  try {
    if (deletedSessionId === 'all') {
      await clearAdminAppHistory(appId.value);
      sessionId.value = undefined;
    } else {
      await clearAdminChatHistory(deletedSessionId);
      if (deletedSessionId === sessionId.value) {
        sessionId.value = undefined;
      }
    }
    await loadSessions();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete session:', err);
  }
}

/** 提交反馈 */
async function handleSubmitFeedback(msg: ChatMessage, status: number) {
  if (!msg.id) return;
  try {
    await submitAdminChatFeedback(msg.id, status);
    msg.feedbackStatus = status;
  } catch {
    message.error(t('common.updateFailed'));
  }
}

/** 会话标题变更 */
async function handleSessionChange(newSessionId: string) {
  sessionId.value = newSessionId;
  await loadSessions();
}

/** 会话重命名适配 */
async function handleRename(targetSessionId: string, title: string) {
  const { error } = await updateAdminSessionTitle(targetSessionId, title);
  if (error) {
    throw new Error(error.message || 'Failed to update title');
  }
}

onMounted(async () => {
  await Promise.all([loadAppInfo(), loadSessions(), nodeDefinitionStore.loadNodeDefinitions()]);
});
</script>

<template>
  <div
    class="relative h-full flex flex-col overflow-hidden border border-gray-200 rounded-lg bg-white dark:border-gray-800 dark:bg-gray-900"
  >
    <!-- 顶部导航 -->
    <div
      class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
    >
      <div class="flex items-center gap-2">
        <NButton quaternary circle size="small" @click="showSessions = true">
          <template #icon>
            <SvgIcon local-icon="mdi-menu" />
          </template>
        </NButton>
        <div class="flex items-center gap-2">
          <div class="h-6 w-6 flex items-center justify-center rounded bg-primary/10 text-primary">
            <SvgIcon v-if="!appInfo?.icon" local-icon="mdi-application" />
            <SvgIcon v-else :icon="appInfo.icon" />
          </div>
          <span class="truncate text-sm font-bold">{{ appInfo?.appName || 'AI Chat' }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <NTooltip trigger="hover">
          <template #trigger>
            <NButton quaternary circle size="small" @click="handleNewSession">
              <template #icon>
                <SvgIcon local-icon="carbon-add" />
              </template>
            </NButton>
          </template>
          {{ $t('ai.chat.new_chat') || '新建对话' }}
        </NTooltip>
      </div>
    </div>

    <!-- 主聊天区 -->
    <div class="flex-1 overflow-hidden">
      <ChatPanel
        ref="chatPanelRef"
        mode="chat"
        :app-id="appId"
        :session-id="sessionId"
        :prologue="appInfo?.prologue"
        :ui-setting="appInfo?.uiSetting"
        :capabilities="appInfo?.capabilities || []"
        :enable-execution-detail="appInfo?.enableExecutionDetail === '1'"
        :has-execution-detail-permission="true"
        :is-admin="true"
        :get-node-definition="getNodeDefinition"
        class="h-full"
        @session-change="handleSessionChange"
        @submit-feedback="handleSubmitFeedback"
      />
    </div>

    <!-- 侧边栏列表 -->
    <NDrawer v-model:show="showSessions" placement="left" :width="280">
      <NDrawerContent :native-scrollbar="false">
        <SessionList
          :app-id="appId"
          :current-session-id="sessionId"
          :sessions="sessions"
          :title="appInfo?.appName"
          :on-update-title="handleRename"
          @delete="handleDeleteSession"
          @refresh="loadSessions"
          @select="handleSelectSession"
          @new="handleNewSession"
        />
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped>
:deep(.n-drawer-content .n-drawer-content__body) {
  padding: 0;
}
</style>
