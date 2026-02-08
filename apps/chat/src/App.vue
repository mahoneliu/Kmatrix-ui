<script lang="ts" setup>
import { inject, onMounted, ref, watch } from 'vue';
import { NButton, NConfigProvider, NDrawer, NDrawerContent, NMessageProvider, NTooltip, darkTheme } from 'naive-ui';
import {
  type ChatMessage,
  ChatPanel,
  SessionList,
  clearAppHistory,
  clearChatHistory,
  fetchAppInfoByToken,
  fetchChatHistory,
  fetchSessionList
} from '@km/shared';
import { getColorPalette, getRgb } from '@sa/color';
import logoImg from '@sa/materials/assets/svg-icon/logo.svg';

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

// 侧边栏及弹窗状态
const showSessions = ref(false);

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

/** 设置主题变量 */
function setThemeVars(color: string) {
  const colors = getColorPalette(color);
  const style = document.documentElement.style;

  // 设置主色
  const { r, g, b } = getRgb(color);
  style.setProperty('--primary-color', `${r} ${g} ${b}`);

  // 设置色阶
  colors.forEach((hex, number) => {
    const rgb = getRgb(hex);
    style.setProperty(`--primary-${number}-color`, `${rgb.r} ${rgb.g} ${rgb.b}`);
  });
}

watch(
  () => embedParams.primaryColor,
  newColor => {
    setThemeVars(newColor);
  },
  { immediate: true }
);

// 切换会话列表显示
function toggleSessions() {
  showSessions.value = !showSessions.value;
}

// 加载会话列表
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

// 应用信息
const appTitle = ref('');
async function loadAppInfo() {
  if (!embedParams.appToken) return;
  try {
    // 假设 fetchAppInfoByToken 返回包含 appName 的对象
    // 需要确认 fetchAppInfoByToken 的返回类型，参考 Admin 代码它返回 Api.AI.Admin.App
    // 但是这里是 shared 包，可能类型不同。不过 Admin 也是用的 api/ai/admin/app 里的 fetchAppInfoByToken 吗？
    // 不，Admin 用的是 @/service/api/ai/chat/chat 里的 fetchAppInfoByToken。
    // Shared 包 exported api/chat.ts 应该也有这个。
    const { data } = await fetchAppInfoByToken(embedParams.appToken);
    if (data) {
      appTitle.value = data.appName; // 注意这里是用 appName
    }
  } catch {
    // ignore
  }
}

// 最大化/全屏
const isMaximized = ref(false);
function handleMaximize() {
  // console.log('Maximize clicked');
  isMaximized.value = !isMaximized.value;
  // 向父页面发送消息，让其调整 iframe 大小
  window.parent?.postMessage(
    {
      type: 'maximize-chat',
      data: { maximized: isMaximized.value }
    },
    '*'
  );
}

// 关闭
function handleClose() {
  // console.log('Close clicked');
  // 通常发送消息给父页面隐藏 iframe
  window.parent?.postMessage({ type: 'close-chat' }, '*');
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
    // console.error('加载历史消息失败');
  }
}

// 选择会话
function handleSelectSession(newSessionId: string) {
  sessionId.value = newSessionId;
  showSessions.value = false;
  loadHistory();
}

// 删除会话
// 删除会话
async function handleDeleteSession(deletedSessionId: string) {
  try {
    const token = embedParams.appToken;
    // console.log('[DEBUG] handleDeleteSession token:', token);

    if (deletedSessionId === 'all') {
      await clearAppHistory(embedParams.appId, token);
      // console.log('已清空所有会话');
      sessionId.value = undefined;
    } else {
      await clearChatHistory(deletedSessionId, token);
      // console.log('已删除会话');
      if (deletedSessionId === sessionId.value) {
        sessionId.value = undefined;
      }
    }
    await loadSessions();
  } catch {
    // console.error('删除会话失败');
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
  await loadAppInfo();
  await loadSessions();
});
</script>

<template>
  <NConfigProvider :theme="isDark ? darkTheme : undefined" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <div class="embed-container h-full w-full flex flex-col">
        <!-- 抽屉式会话列表 -->
        <NDrawer v-model:show="showSessions" placement="left" :width="280">
          <NDrawerContent :native-scrollbar="false" class="drawer-content-custom">
            <div class="relative h-full flex flex-col pt-2">
              <!-- 收回按钮 -->
              <div
                class="absolute right-4 top-3 z-20 h-6 w-6 flex cursor-pointer items-center justify-center border rounded-full bg-white shadow-lg transition-colors -right-3 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50"
                @click="showSessions = false"
              >
                <SvgIcon local-icon="mdi-chevron-left" class="text-26px text-gray-600 dark:text-gray-300" />
              </div>

              <div class="flex-1 overflow-hidden">
                <SessionList
                  :app-id="embedParams.appId"
                  :current-session-id="sessionId"
                  :sessions="sessions"
                  :logo="logoImg"
                  :token="embedParams.appToken"
                  :title="appTitle"
                  @delete="handleDeleteSession"
                  @refresh="loadSessions"
                  @select="handleSelectSession"
                />
              </div>
            </div>
          </NDrawerContent>
        </NDrawer>

        <!-- 顶部工具栏 -->
        <div
          class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 from-slate-200 to-zinc-200/50 bg-gradient-to-r px-3 py-2 shadow-sm dark:border-gray-700"
        >
          <!-- 左侧 Menu + Logo + 标题 -->
          <div class="flex items-center gap-2">
            <NButton quaternary circle size="small" @click="toggleSessions">
              <template #icon>
                <SvgIcon local-icon="mdi-menu" />
              </template>
            </NButton>
            <img :src="logoImg" class="h-5 w-auto flex-shrink-0" alt="Logo" />
            <span class="truncate text-sm font-bold">{{ appTitle || 'KMatrix Chat' }}</span>
          </div>

          <!-- 中间占位 -->
          <div class="flex-1"></div>

          <!-- 右侧操作栏 -->
          <div class="flex items-center gap-1">
            <NTooltip>
              <template #trigger>
                <NButton quaternary circle size="small" @click="handleNewSession">
                  <template #icon>
                    <SvgIcon local-icon="mdi-chat-plus-outline" />
                  </template>
                </NButton>
              </template>
              新建对话
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton quaternary circle size="small" @click="handleMaximize">
                  <template #icon>
                    <SvgIcon local-icon="mdi-fullscreen" />
                  </template>
                </NButton>
              </template>
              最大化
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton quaternary circle size="small" @click="handleClose">
                  <template #icon>
                    <SvgIcon local-icon="mdi-close" />
                  </template>
                </NButton>
              </template>
              关闭
            </NTooltip>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- 对话面板 -->
          <ChatPanel
            ref="chatPanelRef"
            mode="chat"
            :app-id="embedParams.appId"
            :session-id="sessionId"
            :token="embedParams.appToken"
            :has-execution-detail-permission="true"
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
.drawer-content-custom {
  --n-body-padding: 2px;
}
</style>
