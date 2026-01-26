<script lang="ts" setup>
import { inject, onMounted, ref } from 'vue';
import { NButton, NConfigProvider, NMessageProvider, NTooltip, darkTheme } from 'naive-ui';
import { clearChatHistory, fetchChatHistory, fetchSessionList } from '@/service/api/ai/chat/chat';
import { type ChatMessage } from '@/composables/useStreamChat';
import ChatPanel from '@/components/ai/ChatPanel.vue';
import SessionList from '@/components/ai/SessionList.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';

// 嵌入参数
interface EmbedParams {
  appToken: string;
  appId: string;
  primaryColor: string;
  theme: string;
}

const embedParams = inject<EmbedParams>('embedParams', {
  appToken: '',
  appId: '',
  primaryColor: '#18a058',
  theme: 'light'
});

// 会话相关
const sessionId = ref<string | undefined>();
const sessions = ref<Api.AI.Chat.Session[]>([]);
const chatPanelRef = ref();

// 侧边栏折叠状态
const sidebarCollapsed = ref(true);

// 主题
const isDark = ref(embedParams.theme === 'dark');

// 主题覆盖
const themeOverrides = {
  common: {
    primaryColor: embedParams.primaryColor,
    primaryColorHover: embedParams.primaryColor,
    primaryColorPressed: embedParams.primaryColor
  }
};

// 切换侧边栏
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

// 加载会话列表
async function loadSessions() {
  if (!embedParams.appId) return;
  try {
    const { data } = await fetchSessionList(embedParams.appId, embedParams.appToken);
    if (data) {
      sessions.value = data;
    }
  } catch {
    // ignore
  }
}

// 加载历史消息
async function loadHistory() {
  if (!sessionId.value) return;
  try {
    const { data } = await fetchChatHistory(sessionId.value, embedParams.appToken);
    if (data) {
      const msgs: ChatMessage[] = data.map((item: any, index: number) => ({
        id: item.id || String(index),
        role: item.role,
        content: item.content,
        timestamp: item.createTime,
        streaming: false
      }));
      chatPanelRef.value?.setMessages(msgs);
    }
  } catch {
    console.error('加载历史消息失败');
  }
}

// 选择会话
function handleSelectSession(newSessionId: string) {
  sessionId.value = newSessionId;
  loadHistory();
}

// 删除会话
async function handleDeleteSession(deletedSessionId: string) {
  try {
    await clearChatHistory(deletedSessionId);
    console.log('已删除会话');
    if (deletedSessionId === sessionId.value) {
      sessionId.value = undefined;
    }
    await loadSessions();
  } catch {
    console.error('删除会话失败');
  }
}

// 会话变更
function handleSessionChange(newSessionId: string) {
  sessionId.value = newSessionId;
  loadSessions();
}

// 新建对话
function handleNewSession() {
  sessionId.value = undefined;
  chatPanelRef.value?.clearMessages();
}

onMounted(async () => {
  await loadSessions();
});
</script>

<template>
  <NConfigProvider :theme="isDark ? darkTheme : undefined" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <div class="embed-container h-full w-full flex">
        <!-- 侧边栏 -->
        <div
          class="embed-sidebar h-full flex-shrink-0 border-r border-gray-200 transition-all duration-300 dark:border-gray-700"
          :style="{ width: sidebarCollapsed ? '0px' : '260px', overflow: 'hidden' }"
        >
          <SessionList
            v-if="!sidebarCollapsed"
            :app-id="embedParams.appId"
            :current-session-id="sessionId"
            :sessions="sessions"
            @delete="handleDeleteSession"
            @refresh="loadSessions"
            @select="handleSelectSession"
          />
        </div>

        <!-- 主内容区 -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- 顶部工具栏 -->
          <div
            class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700"
          >
            <div class="flex items-center gap-2">
              <NTooltip>
                <template #trigger>
                  <NButton quaternary circle size="small" @click="toggleSidebar">
                    <template #icon>
                      <SvgIcon :icon="sidebarCollapsed ? 'mdi:menu' : 'mdi:menu-open'" />
                    </template>
                  </NButton>
                </template>
                {{ sidebarCollapsed ? '展开历史' : '收起历史' }}
              </NTooltip>
              <span class="text-sm font-medium">KMatrix Chat</span>
            </div>
            <div class="flex items-center gap-2">
              <NTooltip>
                <template #trigger>
                  <NButton quaternary circle size="small" @click="handleNewSession">
                    <template #icon>
                      <SvgIcon icon="mdi:plus" />
                    </template>
                  </NButton>
                </template>
                新建对话
              </NTooltip>
            </div>
          </div>

          <!-- 对话面板 -->
          <ChatPanel
            ref="chatPanelRef"
            mode="chat"
            :app-id="embedParams.appId"
            :session-id="sessionId"
            :token="embedParams.appToken"
            class="flex-1 overflow-hidden"
            @session-change="handleSessionChange"
          />
        </div>
      </div>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>
.embed-container {
  background: var(--n-color, #fff);
  height: 100vh;
  width: 100vw;
}
</style>
