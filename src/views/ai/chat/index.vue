<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NInput, NPopconfirm, NScrollbar, NSpace, NSplit, NTooltip, useMessage } from 'naive-ui';
import { clearChatHistory, fetchChatHistory, fetchSessionList } from '@/service/api/ai/chat/chat';
import { fetchAppDetail } from '@/service/api/ai/admin/app';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MarkdownRenderer from '@/components/ai/MarkdownRenderer.vue';
import SessionList from '@/components/ai/SessionList.vue';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 应用信息
const appId = ref<string>(route.query.appId as string);
const appInfo = ref<Api.AI.App | null>(null);

// 会话相关
const sessionId = ref<string | undefined>();
const sessions = ref<Api.AI.Chat.Session[]>([]);
const messages = ref<Api.AI.Chat.Message[]>([]);
const inputMessage = ref('');
const scrollbarRef = ref();

// SSE相关
const isStreaming = ref(false);
const currentStreamMessage = ref('');

// 调试模式
const debugMode = ref(false);

// LocalStorage键
const STORAGE_SESSION_KEY = `chat_session_${appId.value}`;

// 获取应用信息
async function getAppInfo() {
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
  try {
    const { data } = await fetchSessionList(appId.value);
    if (data) {
      sessions.value = data;
    }
  } catch {
    // console.error('加载会话列表失败:', error);
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    scrollbarRef.value?.scrollTo({ top: 99999, behavior: 'smooth' });
  });
}

// 发送消息
async function handleSend() {
  if (!inputMessage.value.trim()) return;

  const userMessage = inputMessage.value.trim();
  inputMessage.value = '';

  // 添加用户消息
  messages.value.push({
    sessionId: sessionId.value || '0',
    role: 'user',
    content: userMessage,
    createTime: new Date().toISOString()
  });

  scrollToBottom();

  // 使用SSE流式对话
  await streamChat(userMessage);
}

// 处理SSE事件参数接口
interface SSEHandlerOptions {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  onMessage: (msg: string) => void;
  onNodeStatus: (nodeName: string | null) => void;
  onDone: (sessionId?: string) => Promise<void>;
  onError: () => void;
}

// 解析SSE事件
function parseSSEEvent(event: string) {
  if (!event.trim()) return null;

  const lines = event.split('\n');
  let eventType = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.substring(5));
    }
  }

  return { eventType, data: dataLines.join('\n') };
}

// SSE回调接口
interface SSECallbacks {
  onMessage: (msg: string) => void;
  onNodeStatus: (nodeName: string | null) => void;
  onDone: (sessionId?: string) => Promise<void>;
  onError: () => void;
}

// 处理单个SSE事件
async function processSSEEvent(event: string, callbacks: SSECallbacks): Promise<boolean> {
  const { onMessage, onNodeStatus, onDone, onError } = callbacks;
  const result = parseSSEEvent(event);
  if (!result) return false;

  const { eventType, data } = result;

  // 处理节点状态事件
  if (eventType === 'node_start') {
    try {
      const eventData = JSON.parse(data);
      onNodeStatus(eventData.nodeName);
    } catch {
      // 忽略解析错误
    }
    return false;
  }

  // 处理节点执行详情事件
  if (eventType === 'node_execution_detail') {
    try {
      const eventData = JSON.parse(data);
      const lastMsg = messages.value[messages.value.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        if (!lastMsg.executions) lastMsg.executions = [];

        // 添加节点执行详情
        lastMsg.executions.push({
          executionId: Date.now().toString(),
          nodeId: '',
          nodeName: eventData.nodeName,
          nodeType: eventData.nodeType,
          status: 'completed',
          startTime: new Date().toISOString(),
          inputParams: eventData.inputs,
          outputParams: eventData.outputs,
          durationMs: eventData.durationMs
        });
      }
    } catch {
      // 忽略解析错误
    }
    return false;
  }

  if (eventType === 'node_complete') {
    onNodeStatus(null);
    return false;
  }

  // 处理 done 事件
  if (eventType === 'done' || eventType === 'workflow_complete') {
    onNodeStatus(null);
    // 如果data包含sessionId,尝试解析
    let newSessionId: string | undefined;
    if (data && data.trim()) {
      try {
        const eventData = JSON.parse(data);
        newSessionId = eventData.sessionId || data.trim();
      } catch {
        newSessionId = data.trim();
      }
    }
    await onDone(newSessionId);
    return true; // Stop processing
  }

  // 处理错误事件
  if (eventType === 'error' || eventType === 'node_error') {
    onNodeStatus(null);
    onError();
    return true; // Stop processing
  }

  // 处理消息内容（默认事件或 message 事件）
  if (data && data.trim() !== '[DONE]') {
    onMessage(data);
  }

  return false;
}

// 处理SSE事件
async function handleSSEEvents(options: SSEHandlerOptions) {
  const { reader, onMessage, onNodeStatus, onDone, onError } = options;
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        // eslint-disable-next-line no-await-in-loop
        const shouldStop = await processSSEEvent(event, { onMessage, onNodeStatus, onDone, onError });
        if (shouldStop) return;
      }
    }
  } catch {
    onError();
  }
}

// 流式对话
async function streamChat(userMessage: string) {
  isStreaming.value = true;
  currentStreamMessage.value = '';

  // 添加AI消息占位
  const aiMessage: Api.AI.Chat.Message = {
    sessionId: sessionId.value || '0',
    role: 'assistant',
    content: '',
    streaming: true,
    createTime: new Date().toISOString(),
    executions: [],
    expanded: true
  };
  messages.value.push(aiMessage);

  const token = localStg.get('token') || '';
  const clientId = import.meta.env.VITE_APP_CLIENT_ID;

  const requestBody = {
    appId: appId.value,
    sessionId: sessionId.value,
    message: userMessage,
    stream: true
  };

  try {
    const response = await fetch(`${baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        clientid: clientId || ''
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    await handleSSEEvents({
      reader,
      onMessage: msg => {
        currentStreamMessage.value += msg;
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = currentStreamMessage.value;
          scrollToBottom();
        }
      },
      onNodeStatus: (nodeName: string | null) => {
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          if (!lastMsg.executions) lastMsg.executions = [];

          if (nodeName) {
            // 将上一个 running 状态改为 completed
            const lastExec = lastMsg.executions[lastMsg.executions.length - 1];
            if (lastExec && lastExec.status === 'running') {
              lastExec.status = 'completed';
            }

            // 添加新节点并设为 running
            lastMsg.executions.push({
              executionId: Date.now().toString(),
              nodeId: '',
              nodeName,
              nodeType: '',
              status: 'running',
              startTime: new Date().toISOString()
            });
            lastMsg.currentNode = nodeName;
          } else {
            // 节点完成逻辑
            const lastExec = lastMsg.executions[lastMsg.executions.length - 1];
            if (lastExec && lastExec.status === 'running') {
              lastExec.status = 'completed';
            }
            lastMsg.currentNode = null;
          }
        }
      },
      onDone: async (newSessionId?: string) => {
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg) {
          lastMsg.streaming = false;
          lastMsg.expanded = false;
        }

        // 是否是新创建的会话
        const isNewSession = Boolean(newSessionId && !sessionId.value);

        // 保存sessionId(如果是新创建的)
        if (newSessionId && !sessionId.value) {
          sessionId.value = newSessionId;
          // 更新URL
          router.push({
            name: 'ai_chat',
            query: { appId: appId.value, sessionId: newSessionId }
          });
        }

        await loadSessions();

        // 如果是首次对话,延迟2秒后再刷新一次会话列表,以获取自动生成的标题
        if (isNewSession) {
          setTimeout(() => {
            loadSessions();
          }, 2000);
        }
      },
      onError: () => {
        throw new Error('服务器返回错误');
      }
    });

    aiMessage.streaming = false;
  } catch (err: any) {
    message.error(`对话失败: ${err.message}`);
    messages.value = messages.value.filter(m => m !== aiMessage);
  } finally {
    isStreaming.value = false;
    currentStreamMessage.value = '';
  }
}

// 加载历史消息
async function loadHistory() {
  if (!sessionId.value) return;

  try {
    const { data } = await fetchChatHistory(sessionId.value);
    if (data) {
      messages.value = data;
      scrollToBottom();
    }
  } catch {
    message.error('加载历史消息失败');
  }
}

// 选择会话
function handleSelectSession(newSessionId: string) {
  sessionId.value = newSessionId;
  loadHistory();
  // 更新URL
  router.push({ name: 'ai_chat', query: { appId: appId.value, sessionId: newSessionId } });
}

// 删除会话
async function handleDeleteSession(deletedSessionId: string) {
  try {
    await clearChatHistory(deletedSessionId);
    message.success('已删除会话');

    // 如果删除的是当前会话,清空消息并切换到新会话
    if (deletedSessionId === sessionId.value) {
      messages.value = [];
      sessionId.value = undefined;
      router.push({ name: 'ai_chat', query: { appId: appId.value } });
    }

    // 重新加载会话列表
    await loadSessions();
  } catch {
    message.error('删除会话失败');
  }
}

// 清空当前对话
async function handleClear() {
  if (!sessionId.value) {
    messages.value = [];
    return;
  }

  try {
    await clearChatHistory(sessionId.value);
    messages.value = [];
    sessionId.value = undefined;
    router.push({ name: 'ai_chat', query: { appId: appId.value } });
    message.success('已清空对话');
    await loadSessions();
  } catch {
    message.error('清空对话失败');
  }
}

// 复制消息
function handleCopyMessage(content: string) {
  navigator.clipboard.writeText(content).then(() => {
    message.success('已复制');
  });
}

// 按Enter发送
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    handleSend();
  }
}

// 监听sessionId变化,保存到LocalStorage
watch(sessionId, newVal => {
  if (newVal) {
    localStg.set(STORAGE_SESSION_KEY as any, newVal);
  } else {
    localStg.remove(STORAGE_SESSION_KEY as any);
  }
});

// 监听路由变化,同步sessionId(支持"新建对话"场景)
watch(
  () => route.query.sessionId,
  newSessionId => {
    if (newSessionId) {
      // 切换到已有会话
      if (sessionId.value !== newSessionId) {
        sessionId.value = newSessionId as string;
        loadHistory();
      }
    } else {
      // 新建对话:清空sessionId和消息
      sessionId.value = undefined;
      messages.value = [];
      // 如果有开场白,插入开场白消息
      if (appInfo.value?.prologue) {
        messages.value = [
          {
            sessionId: '0',
            role: 'assistant',
            content: appInfo.value.prologue,
            createTime: new Date().toISOString()
          }
        ];
      }
    }
  }
);

onMounted(async () => {
  await getAppInfo();
  await loadSessions();

  // 尝试从路由参数或LocalStorage恢复会话
  const routeSessionId = route.query.sessionId as string;
  const cachedSessionId = localStg.get(STORAGE_SESSION_KEY as any);

  if (routeSessionId) {
    sessionId.value = routeSessionId;
    await loadHistory();
  } else if (cachedSessionId) {
    sessionId.value = cachedSessionId;
    await loadHistory();
    // 更新URL
    router.push({ name: 'ai_chat', query: { appId: appId.value, sessionId: cachedSessionId } });
  } else if (appInfo.value?.prologue) {
    // 如果是新会话且有开场白,插入开场白消息
    messages.value = [
      {
        sessionId: '0',
        role: 'assistant',
        content: appInfo.value.prologue,
        createTime: new Date().toISOString()
      }
    ];
  }
});
</script>

<template>
  <div class="h-full flex">
    <!-- 左侧会话列表 -->
    <NSplit :default-size="0.25" :max="400" :min="200" class="h-full w-full" direction="horizontal">
      <template #1>
        <div class="h-full border-r border-gray-200 border-solid dark:border-gray-700">
          <SessionList
            :app-id="appId"
            :current-session-id="sessionId"
            :sessions="sessions"
            @delete="handleDeleteSession"
            @refresh="loadSessions"
            @select="handleSelectSession"
          />
        </div>
      </template>

      <template #2>
        <!-- 右侧聊天区域 -->
        <div class="h-full flex flex-col">
          <!-- 顶部应用信息 -->
          <NCard :bordered="false" class="flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
                  <img v-if="appInfo?.icon" :src="appInfo.icon" class="h-full w-full rounded-lg object-cover" />
                  <SvgIcon v-else icon="carbon:application" />
                </div>
                <div>
                  <div class="text-lg font-bold">{{ appInfo?.appName || '加载中...' }}</div>
                  <div class="text-xs text-gray-400">{{ appInfo?.description || '' }}</div>
                </div>
              </div>
              <NSpace>
                <!-- 调试模式开关 -->
                <NTooltip>
                  <template #trigger>
                    <NButton
                      :type="debugMode ? 'primary' : 'default'"
                      circle
                      quaternary
                      @click="debugMode = !debugMode"
                    >
                      <template #icon>
                        <SvgIcon icon="carbon:debug" />
                      </template>
                    </NButton>
                  </template>
                  {{ debugMode ? '关闭调试模式' : '开启调试模式' }}
                </NTooltip>

                <NPopconfirm @positive-click="handleClear">
                  <template #trigger>
                    <NButton circle quaternary>
                      <template #icon>
                        <SvgIcon icon="carbon:trash-can" />
                      </template>
                    </NButton>
                  </template>
                  确定清空当前对话吗?
                </NPopconfirm>
              </NSpace>
            </div>
          </NCard>

          <!-- 消息列表 -->
          <div class="flex-1 overflow-hidden">
            <NScrollbar ref="scrollbarRef" class="h-full px-4 py-4">
              <!-- 空状态与开场白 -->
              <!-- 开场白已作为真实消息插入到 messages 数组中 -->

              <div v-for="(msg, index) in messages" :key="index" class="group mb-4">
                <!-- 用户消息 -->
                <div v-if="msg.role === 'user'" class="flex items-start justify-end gap-2">
                  <NTooltip>
                    <template #trigger>
                      <NButton
                        circle
                        class="opacity-0 transition-opacity group-hover:opacity-100"
                        quaternary
                        size="small"
                        @click="handleCopyMessage(msg.content)"
                      >
                        <template #icon>
                          <SvgIcon icon="carbon:copy" />
                        </template>
                      </NButton>
                    </template>
                    复制
                  </NTooltip>
                  <div class="max-w-[70%] rounded-lg bg-primary px-4 py-2 text-white">
                    <div class="whitespace-pre-wrap break-words">{{ msg.content }}</div>
                  </div>
                </div>

                <!-- AI消息 -->
                <div v-else class="flex items-start justify-start gap-2">
                  <div class="max-w-[70%] rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
                    <!-- 节点执行状态（可折叠，仅调试模式显示） -->
                    <div v-if="debugMode && msg.executions && msg.executions.length > 0" class="mb-2">
                      <!-- 折叠头部 -->
                      <div
                        class="flex cursor-pointer items-center gap-2 text-xs text-blue-500 dark:text-blue-400"
                        @click="msg.expanded = !msg.expanded"
                      >
                        <SvgIcon
                          :icon="msg.expanded ? 'carbon:chevron-down' : 'carbon:chevron-right'"
                          class="text-sm"
                        />
                        <span v-if="msg.expanded">节点执行记录 ({{ msg.executions.length }})</span>
                        <span v-else>
                          {{ msg.currentNode || `已执行 ${msg.executions.length} 个节点` }}
                        </span>
                        <SvgIcon v-if="msg.streaming && msg.currentNode" class="animate-spin" icon="carbon:task" />
                      </div>

                      <!-- 展开内容 -->
                      <div v-if="msg.expanded" class="ml-5 mt-2 space-y-2">
                        <div
                          v-for="(item, idx) in msg.executions"
                          :key="idx"
                          class="border border-gray-200 rounded p-2 text-xs dark:border-gray-700"
                        >
                          <div class="mb-1 flex items-center gap-2 font-500">
                            <SvgIcon
                              :icon="
                                item.status === 'running'
                                  ? 'carbon:task'
                                  : item.status === 'failed'
                                    ? 'carbon:error'
                                    : 'carbon:checkmark'
                              "
                              :class="item.status === 'running' ? 'animate-spin text-blue-500' : 'text-green-500'"
                            />
                            <span>{{ item.nodeName }}</span>
                            <span v-if="item.durationMs" class="text-gray-400">({{ item.durationMs }}ms)</span>
                          </div>
                          <!-- 输入输出参数 -->
                          <div v-if="item.inputParams || item.outputParams" class="ml-5 mt-1 text-gray-500 space-y-1">
                            <div v-if="item.inputParams">
                              <span class="font-500">输入:</span>
                              {{ JSON.stringify(item.inputParams) }}
                            </div>
                            <div v-if="item.outputParams">
                              <span class="font-500">输出:</span>
                              {{ JSON.stringify(item.outputParams) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <MarkdownRenderer :content="msg.content" :streaming="msg.streaming" />
                  </div>
                  <NTooltip>
                    <template #trigger>
                      <NButton
                        circle
                        class="opacity-0 transition-opacity group-hover:opacity-100"
                        quaternary
                        size="small"
                        @click="handleCopyMessage(msg.content)"
                      >
                        <template #icon>
                          <SvgIcon icon="carbon:copy" />
                        </template>
                      </NButton>
                    </template>
                    复制
                  </NTooltip>
                </div>
              </div>
            </NScrollbar>
          </div>

          <!-- 输入框 -->
          <NCard :bordered="false" class="flex-shrink-0">
            <NSpace vertical>
              <NInput
                v-model:value="inputMessage"
                :autosize="{ minRows: 1, maxRows: 4 }"
                :disabled="isStreaming"
                :placeholder="isStreaming ? 'AI正在回复...' : '输入消息 (Enter发送, Shift+Enter换行)'"
                type="textarea"
                @keydown="handleKeyDown"
              />
              <div class="flex justify-end">
                <NButton
                  :disabled="!inputMessage.trim() || isStreaming"
                  :loading="isStreaming"
                  type="primary"
                  @click="handleSend"
                >
                  <template #icon>
                    <SvgIcon icon="carbon:send" />
                  </template>
                  发送
                </NButton>
              </div>
            </NSpace>
          </NCard>
        </div>
      </template>
    </NSplit>
  </div>
</template>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
