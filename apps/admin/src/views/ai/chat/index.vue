<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NTooltip, useMessage } from 'naive-ui';
import { type ChatMessage, ChatPanel, SessionList } from '@km/shared';
import {
  clearAdminAppHistory,
  clearAdminChatHistory,
  fetchAdminChatHistory,
  fetchAdminSessionList,
  updateAdminSessionTitle
} from '@/service/api/ai/chat';
// import { fetchAppInfoByToken } from '@/service/api/ai/chat/chat';
import { fetchAppDetail } from '@/service/api/ai/app';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { localStg } from '@/utils/storage';

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 应用信息
const appId = ref<string>((route.query.appId as string) || '');
const appInfo = ref<Api.AI.Admin.App | null>(null);

// 会话相关
const sessionId = ref<string | undefined>();
const sessions = ref<Api.AI.Chat.Session[]>([]);
const chatPanelRef = ref();
const nodeDefinitionStore = useNodeDefinitionStore();

// 侧边栏折叠状态
const sidebarCollapsed = ref(false);

// LocalStorage键
const STORAGE_SESSION_KEY = `chat_session_${appId.value}`;
const STORAGE_SIDEBAR_KEY = 'chat_sidebar_collapsed';

// 嵌入模式
const isEmbed = ref(route.query.token !== undefined || route.query.mode === 'float');
const hideSidebar = ref(isEmbed.value || route.query.mode === 'mobile');
const hideHeader = ref(route.query.mode === 'float');

// 初始化侧边栏状态
function initSidebarState() {
  const cached = localStg.get(STORAGE_SIDEBAR_KEY as any);
  if (cached !== null) {
    sidebarCollapsed.value = cached === 'true';
  }
}

// 切换侧边栏
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStg.set(STORAGE_SIDEBAR_KEY as any, String(sidebarCollapsed.value));
}

// 获取应用信息
async function getAppInfo() {
  // admin内应该不存在只通过token加载应用信息的场景
  // const token = route.query.token as string;
  // if (token) {
  //   try {
  //     const { data } = await fetchAppDetail(token);
  //     if (data) {
  //       appInfo.value = data;
  //       appId.value = String(data.appId);
  //     }
  //   } catch {
  //     message.error('加载应用信息失败');
  //   }
  //   return;
  // }

  if (!appId.value) return;
  try {
    const { data } = await fetchAppDetail(appId.value);
    if (data) {
      appInfo.value = data;
    }
  } catch {
    message.error('加载应用信息失败');
  }
}

// 加载会话列表
async function loadSessions() {
  if (!appId.value) return;
  try {
    // 如果没有 token，说明是管理端模式
    if (!route.query.token) {
      const { data } = await fetchAdminSessionList(appId.value);
      if (data) {
        sessions.value = data;
      }
    } else {
      // 嵌入模式暂不支持在 admin 预览页带 token 加载列表（通常嵌入模式下 session 管理由嵌入页面自己处理）
      // 但这里为了逻辑完整，可以保留
    }
  } catch {
    // console.error('加载会话列表失败:', error);
  }
}

// 更新会话标题
async function handleUpdateTitle(id: string, title: string) {
  await updateAdminSessionTitle(id, title);
}

// 加载历史消息
async function loadHistory() {
  if (!sessionId.value) return;

  try {
    const { data } = await fetchAdminChatHistory(sessionId.value);
    if (data) {
      // 转换消息格式
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
    message.error('加载历史消息失败');
  }
}

// 选择会话
function handleSelectSession(newSessionId: string) {
  sessionId.value = newSessionId;
  loadHistory();
  router.push({ name: 'ai_chat', query: { appId: appId.value, sessionId: newSessionId } });
}

// 删除会话
async function handleDeleteSession(deletedSessionId: string) {
  try {
    if (deletedSessionId === 'all') {
      await clearAdminAppHistory(appId.value);
      message.success('已清空所有会话');
      sessionId.value = undefined;
      chatPanelRef.value?.clearMessages();
      router.push({ name: 'ai_chat', query: { appId: appId.value } });
    } else {
      await clearAdminChatHistory(deletedSessionId);
      message.success('已删除会话');

      if (deletedSessionId === sessionId.value) {
        sessionId.value = undefined;
        router.push({ name: 'ai_chat', query: { appId: appId.value } });
      }
    }

    await loadSessions();
  } catch {
    message.error('操作失败');
  }
}

// 处理会话变更 (from ChatPanel)
function handleSessionChange(newSessionId: string) {
  sessionId.value = newSessionId;
  loadSessions();
  router.push({ name: 'ai_chat', query: { appId: appId.value, sessionId: newSessionId } });
}

// 新建对话
function handleNewSession() {
  sessionId.value = undefined;
  chatPanelRef.value?.clearMessages();
  router.push({ name: 'ai_chat', query: { appId: appId.value } });
}

// 监听sessionId变化,保存到LocalStorage
watch(sessionId, newVal => {
  if (newVal) {
    localStg.set(STORAGE_SESSION_KEY as any, newVal);
  } else {
    localStg.remove(STORAGE_SESSION_KEY as any);
  }
});

// 监听路由变化
watch(
  () => route.query.sessionId,
  newSessionId => {
    if (newSessionId) {
      if (sessionId.value !== newSessionId) {
        sessionId.value = newSessionId as string;
        loadHistory();
      }
    } else {
      // 新建对话：清空 sessionId 并清空消息
      sessionId.value = undefined;
      chatPanelRef.value?.clearMessages();
    }
  }
);

onMounted(async () => {
  const token = route.query.token as string;
  if (token) {
    localStg.set('token', token);
  }

  initSidebarState();
  await getAppInfo();
  await loadSessions();
  // 加载节点定义
  nodeDefinitionStore.loadNodeDefinitions();

  const routeSessionId = route.query.sessionId as string;
  const cachedSessionId = localStg.get(STORAGE_SESSION_KEY as any);

  if (routeSessionId) {
    sessionId.value = routeSessionId;
    await loadHistory();
  } else if (cachedSessionId) {
    sessionId.value = cachedSessionId;
    await loadHistory();
    router.push({ name: 'ai_chat', query: { appId: appId.value, sessionId: cachedSessionId } });
  }
});
</script>

<template>
  <div class="h-full overflow-hidden" :class="{ 'p-4': !isEmbed }">
    <NCard
      class="h-full"
      :bordered="!isEmbed"
      content-style="padding: 0; height: 100%;"
      :class="{ 'shadow-sm': !isEmbed }"
    >
      <div class="h-full flex overflow-hidden">
        <!-- 侧边栏 -->
        <div
          v-if="!hideSidebar"
          class="h-full flex-shrink-0 border-r border-gray-200 border-solid transition-all duration-300 dark:border-gray-700"
          :style="{ width: sidebarCollapsed ? '48px' : '280px' }"
        >
          <!-- 侧边栏头部：折叠按钮 -->
          <div class="flex-shrink-0 border-b border-gray-200 border-solid px-2 py-2 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <NTooltip :disabled="!sidebarCollapsed">
                <template #trigger>
                  <NButton quaternary circle @click="toggleSidebar">
                    <template #icon>
                      <SvgIcon :icon="sidebarCollapsed ? 'mdi:menu' : 'mdi:menu-open'" class="text-lg" />
                    </template>
                  </NButton>
                </template>
                展开侧边栏
              </NTooltip>
            </div>
          </div>

          <!-- 侧边栏内容：会话列表 -->
          <div v-show="!sidebarCollapsed" class="h-[calc(100%-48px)]">
            <SessionList
              :app-id="appId"
              :current-session-id="sessionId"
              :sessions="sessions"
              :title="appInfo?.appName"
              :on-update-title="handleUpdateTitle"
              @delete="handleDeleteSession"
              @refresh="loadSessions"
              @select="handleSelectSession"
            />
          </div>

          <!-- 折叠状态时的 icon 列表 -->
          <div v-show="sidebarCollapsed" class="flex flex-col items-center gap-2 py-2">
            <NTooltip placement="right">
              <template #trigger>
                <NButton quaternary circle @click="handleNewSession">
                  <template #icon>
                    <SvgIcon local-icon="mdi-plus" class="text-lg" />
                  </template>
                </NButton>
              </template>
              新建对话
            </NTooltip>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- 顶部工具栏 -->
          <div
            v-if="!hideHeader"
            class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 border-solid px-4 py-2 dark:border-gray-700"
          >
            <div class="flex items-center gap-2">
              <span class="text-base font-medium">{{ appInfo?.appName || '对话' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <NTooltip>
                <template #trigger>
                  <NButton quaternary circle @click="handleNewSession">
                    <template #icon>
                      <SvgIcon local-icon="mdi-plus" class="text-lg" />
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
            :app-id="appId"
            :app-name="appInfo?.appName"
            :session-id="sessionId"
            :enable-execution-detail="appInfo?.enableExecutionDetail === '1'"
            :prologue="appInfo?.prologue"
            :token="route.query.token as string"
            :is-admin="!route.query.token"
            :get-node-definition="nodeDefinitionStore.getNodeDefinition"
            class="flex-1 overflow-hidden"
            @session-change="handleSessionChange"
          />
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
/* 侧边栏过渡动画 */
.transition-all {
  transition-property: width, opacity;
}
</style>
