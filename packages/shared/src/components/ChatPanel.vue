<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NInput,
  NModal,
  NScrollbar,
  NSpin,
  NTag,
  NTooltip,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { type ChatMessage, type Citation, type NodeExecution, useStreamChat } from '../composables/useStreamChat';
import { getNodeIconBackground } from '../utils/color';
import { copyToClipboard } from '../utils/clipboard';
import MarkdownRenderer from './MarkdownRenderer.vue';

interface Props {
  /** 对话模式: chat=正式对话, debug=调试 */
  mode: 'chat' | 'debug';
  /** 应用ID */
  appId: string;

  /** 会话ID（正式对话模式） */
  sessionId?: string;
  /** 是否启用执行详情（来自App配置） */
  enableExecutionDetail?: boolean;
  /** 开场白 */
  prologue?: string;
  /** 外部传入的 Token（用于嵌入模式认证） */
  token?: string;
  /** 是否具有查看执行详情的权限 */
  hasExecutionDetailPermission?: boolean;
  /** 节点定义查询函数（可选，如果不提供则不显示复杂执行详情） */
  getNodeDefinition?: (nodeType: string) => any;
  /** 是否为管理员模式（使用鉴权接口） */
  isAdmin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sessionId: undefined,
  enableExecutionDetail: false,
  prologue: '',
  token: undefined,
  hasExecutionDetailPermission: false,
  getNodeDefinition: undefined,
  isAdmin: false
});

const emit = defineEmits<{
  /** 会话变更事件 */
  sessionChange: [sessionId: string];
  /** 消息发送事件 */
  messageSent: [message: string];
  /** 节点开始执行事件 */
  nodeStart: [nodeId: string];
  /** 节点执行完成事件 */
  nodeEnd: [nodeId: string];
  /** 会话信息更新事件 */
  sessionUpdate: [data: any];
  /** 执行详情可见性变更事件 */
  executionVisibilityChange: [visible: boolean];
}>();

const message = useMessage();
// const nodeDefinitionStore = useNodeDefinitionStore();
// const { hasAuth } = useAuth();

// 执行详情查看权限
const hasExecutionDetailPermission = computed(() => props.isAdmin || props.hasExecutionDetailPermission);

// 执行详情开关（正式对话模式下可切换）
const showExecutionInfo = ref(
  props.mode === 'debug' || (props.enableExecutionDetail && hasExecutionDetailPermission.value)
);

watch(
  () => [props.enableExecutionDetail, hasExecutionDetailPermission.value],
  ([enable, hasPermission]) => {
    // 只有在正式对话模式下才同步
    if (props.mode === 'chat') {
      showExecutionInfo.value = Boolean(enable && hasPermission);
    }
  }
);

watch(showExecutionInfo, val => {
  emit('executionVisibilityChange', val);
});

// 滚动条引用
const scrollbarRef = ref();

// 使用 useStreamChat composable
const { messages, isStreaming, streamChat, clearMessages } = useStreamChat({
  apiEndpoint: props.isAdmin ? '/ai/admin/chat/stream' : '/ai/chat/stream',
  token: props.token,
  onError: error => {
    message.error(`对话失败: ${error}`);
  }
});

// 输入消息
const userInput = ref('');

// 初始化开场白
function initPrologue() {
  if (props.prologue && messages.value.length === 0) {
    messages.value.push({
      id: 'prologue',
      role: 'assistant',
      content: props.prologue,
      timestamp: new Date().toISOString()
    });
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    scrollbarRef.value?.scrollTo({ top: 99999, behavior: 'smooth' });
  });
}

// 组件挂载时加载节点定义
onMounted(async () => {
  // await nodeDefinitionStore.loadNodeDefinitions();
});

// 发送消息
async function handleSend() {
  if (!userInput.value.trim() || isStreaming.value) return;

  const userMsg = userInput.value.trim();
  userInput.value = '';

  emit('messageSent', userMsg);

  await streamChat({
    appId: props.appId,
    sessionId: props.sessionId,
    message: userMsg,
    debug: props.mode === 'debug',
    showExecutionInfo: showExecutionInfo.value,
    onDone: newSessionId => {
      if (newSessionId && newSessionId !== props.sessionId) {
        emit('sessionChange', newSessionId);
      }
    },
    onNodeStart: nodeId => {
      emit('nodeStart', nodeId);
    },
    onNodeEnd: nodeId => {
      emit('nodeEnd', nodeId);
    },
    onSessionUpdate: data => {
      emit('sessionUpdate', data);
    }
  });

  scrollToBottom();
}

// 复制消息
async function handleCopyMessage(content: string) {
  await copyToClipboard(content, '');
}

// 按Enter发送
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    handleSend();
  }
}

// 获取节点定义信息
function getNodeInfo(nodeType: string) {
  const definition = props.getNodeDefinition?.(nodeType);
  return {
    icon: definition?.nodeIcon || 'mdi:circle',
    color: definition?.nodeColor || '#6b7280',
    iconBg: getNodeIconBackground(definition?.nodeColor)
  };
}

// 获取节点显示名称
function getNodeDisplayName(exec: NodeExecution): string {
  return exec.nodeName || exec.label || exec.nodeType;
}

// 是否显示执行详情
const shouldShowExecutions = computed(() => {
  return props.mode === 'debug' || showExecutionInfo.value;
});

// 监听 props 变化
watch(
  () => props.sessionId,
  (newSessionId, oldSessionId) => {
    // 只有在真正切换到不同会话时才清空消息
    if (oldSessionId && newSessionId && oldSessionId !== newSessionId) {
      clearMessages();
    } else if (!newSessionId) {
      initPrologue();
    }
  }
);

watch(
  () => props.prologue,
  () => {
    initPrologue();
  },
  { immediate: true }
);

// 设置消息列表（用于外部更新，如加载历史记录）
function setMessages(msgs: ChatMessage[]) {
  messages.value = msgs;
  scrollToBottom();
}

// 引用详情弹窗
const showCitationModal = ref(false);
const currentCitation = ref<Citation | null>(null);

function handleCitationClick(citation: Citation) {
  currentCitation.value = citation;
  showCitationModal.value = true;
}

// 格式化Token数量
function formatTokenCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// 格式化耗时
function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)} s`;
  }
  return `${ms} ms`;
}

// 暴露方法供父组件调用
defineExpose({
  clearMessages,
  scrollToBottom,
  setMessages
});
</script>

<template>
  <div class="chat-panel h-full flex flex-col">
    <!-- 消息列表 -->
    <div class="flex-1 overflow-hidden">
      <NScrollbar ref="scrollbarRef" class="h-full">
        <div class="p-4">
          <div v-for="msg in messages" :key="msg.id" class="group mb-4">
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'" class="flex flex-row-reverse items-start gap-2">
              <div class="max-w-[70%] rounded-lg bg-blue-500 px-4 py-2 text-white">
                <div class="whitespace-pre-wrap break-words">{{ msg.content }}</div>
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
                      <SvgIcon local-icon="carbon-copy" />
                    </template>
                  </NButton>
                </template>
                复制
              </NTooltip>
            </div>

            <!-- AI消息 -->
            <div v-else class="flex items-start justify-start gap-2">
              <!-- 系统头像 -->
              <div class="mt-1 flex-shrink-0">
                <div class="h-8 w-8 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/10">
                  <SvgIcon local-icon="logo" class="text-xl text-primary" />
                </div>
              </div>

              <div class="max-w-[90%] rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
                <!-- Thinking区域（可折叠） -->
                <div v-if="msg.thinkingContent" class="mb-1 border-b border-gray-200 pb-1 dark:border-gray-700">
                  <NCollapse
                    :key="`thinking-${msg.id}-${msg.thinkingExpanded}`"
                    :default-expanded-names="msg.thinkingExpanded ? ['thinking'] : []"
                  >
                    <NCollapseItem name="thinking">
                      <template #header>
                        <span class="text-xs text-gray-500 dark:text-gray-200">思考过程</span>
                      </template>
                      <template #arrow>
                        <SvgIcon
                          local-icon="mdi-play"
                          class="text-gray-400 workflow-collapse-icon dark:text-gray-200"
                        />
                      </template>
                      <div class="max-h-200px overflow-y-auto text-xs text-gray-500 italic -mt-5 dark:text-gray-200">
                        <MarkdownRenderer :content="msg.thinkingContent" />
                      </div>
                    </NCollapseItem>
                  </NCollapse>
                </div>

                <!-- Markdown渲染的回复内容 -->
                <MarkdownRenderer
                  :content="msg.content"
                  :streaming="msg.streaming"
                  :citations="msg.citations"
                  @click-citation="handleCitationClick"
                />

                <!-- 执行详情（调试模式或开启调试开关时显示） -->
                <div
                  v-if="shouldShowExecutions && msg.executions && msg.executions.length > 0"
                  class="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700"
                >
                  <div class="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <SvgIcon local-icon="mdi-clock-outline" />
                    <span v-if="msg.durationMs">耗时 {{ formatDuration(msg.durationMs) }}</span>
                    <span v-if="msg.tokens && msg.tokens.totalTokens">
                      · {{ formatTokenCount(msg.tokens.totalTokens) }} tokens
                    </span>
                  </div>

                  <NCollapse>
                    <NCollapseItem name="execution-details">
                      <template #header>
                        <span class="text-xs text-gray-400">执行详情 ({{ msg.executions.length }}个节点)</span>
                      </template>
                      <template #arrow>
                        <SvgIcon local-icon="mdi-play" class="text-gray-400 workflow-collapse-icon" />
                      </template>

                      <div class="-ml-11 -mt-2 space-y-1">
                        <div v-for="(exec, idx) in msg.executions" :key="idx">
                          <NCollapse>
                            <NCollapseItem :name="`exec-${idx}`">
                              <template #header>
                                <div class="flex items-center gap-2 text-xs">
                                  <div
                                    class="h-4 w-4 flex flex-shrink-0 items-center justify-center rounded"
                                    :style="{
                                      backgroundColor: getNodeInfo(exec.nodeType).iconBg,
                                      color: getNodeInfo(exec.nodeType).color
                                    }"
                                  >
                                    <SvgIcon :local-icon="getNodeInfo(exec.nodeType).icon" class="text-12px" />
                                  </div>
                                  <span class="font-300">{{ getNodeDisplayName(exec) }}</span>
                                  <span v-if="exec.durationMs" class="text-gray-400">
                                    {{ formatDuration(exec.durationMs) }}
                                  </span>
                                  <span v-if="exec.tokenUsage && exec.tokenUsage.totalTokenCount" class="text-gray-400">
                                    · {{ formatTokenCount(exec.tokenUsage.totalTokenCount) }} tokens
                                  </span>
                                </div>
                              </template>
                              <template #arrow>
                                <SvgIcon local-icon="mdi-none" class="text-gray-400 workflow-collapse-icon" />
                              </template>

                              <!-- 输入输出参数 -->
                              <div
                                v-if="exec.inputs || exec.outputs"
                                class="ml-7 mt-0.5 text-gray-500 -mt-2 space-y-0.5"
                              >
                                <details v-if="exec.inputs" class="cursor-pointer" open>
                                  <summary class="text-xs font-300">输入</summary>
                                  <pre
                                    class="mt-0.5 overflow-x-auto rounded bg-gray-50 p-1 text-11px dark:bg-gray-900"
                                    >{{ JSON.stringify(exec.inputs, null, 2) }}</pre
                                  >
                                </details>
                                <details v-if="exec.outputs" class="cursor-pointer" open>
                                  <summary class="text-xs font-300">输出</summary>
                                  <pre
                                    class="mt-0.5 overflow-x-auto rounded bg-gray-50 p-1 text-11px dark:bg-gray-900"
                                    >{{ JSON.stringify(exec.outputs, null, 2) }}</pre
                                  >
                                </details>
                              </div>
                            </NCollapseItem>
                          </NCollapse>
                        </div>
                      </div>
                    </NCollapseItem>
                  </NCollapse>
                </div>
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
                      <SvgIcon local-icon="carbon-copy" />
                    </template>
                  </NButton>
                </template>
                复制
              </NTooltip>
            </div>
          </div>

          <!-- 加载中提示 -->
          <div v-if="isStreaming" class="flex justify-start">
            <div class="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
              <NSpin size="small" />
              <span class="ml-2 text-gray-500">AI正在思考...</span>
            </div>
          </div>
        </div>
      </NScrollbar>
    </div>

    <!-- 输入框 -->
    <div class="flex-shrink-0 px-4 py-4">
      <div
        class="relative border border-gray-200 rounded-2xl bg-white p-3 shadow-[0_2px_12px_0_rgba(0,0,0,0.05)] transition-all duration-300 dark:border-gray-700 focus-within:border-primary-300 dark:bg-gray-800 focus-within:shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] dark:focus-within:border-primary-700"
      >
        <NInput
          v-model:value="userInput"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :bordered="false"
          :disabled="isStreaming"
          :placeholder="isStreaming ? 'AI正在回复...' : '请输入问题... (Enter发送)'"
          class="flex-1"
          type="textarea"
          @keydown="handleKeyDown"
        />
        <div class="flex items-center justify-between px-2 pb-1 pt-1">
          <div class="flex items-center gap-2">
            <!-- 执行详情开关（仅正式对话模式且App启用且有权限时显示） -->
            <NTooltip v-if="mode === 'chat' && enableExecutionDetail && hasExecutionDetailPermission">
              <template #trigger>
                <NButton
                  :type="showExecutionInfo ? 'primary' : 'default'"
                  quaternary
                  size="small"
                  @click="showExecutionInfo = !showExecutionInfo"
                >
                  <template #icon>
                    <SvgIcon local-icon="mdi-bug-check-outline" />
                  </template>
                </NButton>
              </template>
              {{ showExecutionInfo ? '关闭执行详情' : '开启执行详情' }}
            </NTooltip>
          </div>
          <NButton
            :disabled="!userInput.trim() || isStreaming"
            :loading="isStreaming"
            circle
            quaternary
            size="small"
            type="primary"
            @click="handleSend"
          >
            <template #icon>
              <SvgIcon local-icon="carbon-send-alt" class="text-xl" />
            </template>
          </NButton>
        </div>
      </div>
    </div>

    <!-- 引用详情弹窗 -->
    <NModal
      v-model:show="showCitationModal"
      class="w-600px"
      preset="card"
      :title="currentCitation?.documentName || '引用详情'"
    >
      <div v-if="currentCitation" class="max-h-60vh overflow-y-auto">
        <div class="mb-4 flex gap-2">
          <NTag v-if="currentCitation.score" type="success" size="small">
            相似度: {{ (currentCitation.score * 100).toFixed(1) }}%
          </NTag>
          <NTag type="info" size="small">片段ID: {{ currentCitation.chunkId }}</NTag>
        </div>
        <div class="rounded bg-gray-50 p-4 text-sm leading-relaxed dark:bg-gray-800">
          <div class="whitespace-pre-wrap">{{ currentCitation.content }}</div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.chat-panel .group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
