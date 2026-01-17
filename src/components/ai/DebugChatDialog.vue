<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { NAlert, NBadge, NButton, NCollapse, NCollapseItem, NInput, NModal, NSpin, useMessage } from 'naive-ui';
import { type NodeExecution, useStreamChat } from '@/composables/useStreamChat';
import SvgIcon from '@/components/custom/svg-icon.vue';

interface Props {
  visible: boolean;
  appId: string;
  appName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const message = useMessage();

// 对话状态
const { messages, isStreaming, streamChat, clearMessages } = useStreamChat({
  apiEndpoint: '/ai/chat/stream',
  onError: error => {
    message.error(`调试失败: ${error}`);
  }
});

const inputMessage = ref('');
const messageListRef = ref<HTMLElement>();

// 窗口状态
const isMinimized = ref(false);
const isMaximized = ref(false);

// 执行详情
const showDetailModal = ref(false);
const currentExecutions = ref<NodeExecution[]>([]);

// 窗口样式
const dialogStyle = computed(() => {
  if (isMaximized.value) {
    return {
      right: '0px',
      top: '100px', // 避开顶部操作栏
      width: '50%',
      height: 'calc(100vh - 100px)',
      borderRadius: '0px'
    };
  }
  return {
    right: '20px',
    bottom: '20px',
    width: '400px',
    height: isMinimized.value ? '48px' : '600px'
  };
});

// 发送消息
async function handleSend() {
  if (!inputMessage.value.trim() || isStreaming.value) return;

  const msg = inputMessage.value;
  inputMessage.value = '';

  await streamChat({
    appId: props.appId,
    message: msg,
    debug: true
  });

  // 滚动到底部
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
}

// 显示执行详情
function showExecutionDetail(executions: NodeExecution[]) {
  currentExecutions.value = executions;
  showDetailModal.value = true;
}

// 获取节点图标
function getNodeIcon(nodeType: string): string {
  const iconMap: Record<string, string> = {
    START: 'mdi:play-circle',
    END: 'mdi:flag-checkered',
    LLM_CHAT: 'mdi:robot',
    INTENT_CLASSIFIER: 'mdi:call-split',
    FIXED_RESPONSE: 'mdi:message-reply-text',
    KNOWLEDGE_RETRIEVAL: 'mdi:database-search',
    CONDITION: 'mdi:help-rhombus',
    APP_INFO: 'mdi:information'
  };
  return iconMap[nodeType] || 'mdi:circle';
}

// 获取节点显示名称（优先label）
function getNodeDisplayName(exec: NodeExecution): string {
  // 优先使用label，如果没有label则使用nodeName
  return exec.label || exec.nodeName || exec.nodeType;
}

// 最小化/最大化
function toggleMinimize() {
  isMinimized.value = !isMinimized.value;
  if (isMinimized.value) isMaximized.value = false;
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value;
  if (isMaximized.value) isMinimized.value = false;
}

// 关闭窗口
function handleClose() {
  emit('update:visible', false);
  // 清空消息
  setTimeout(() => {
    clearMessages();
  }, 300);
}

// 监听visible变化，重置状态
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      isMinimized.value = false;
      isMaximized.value = false;
    }
  }
);
</script>

<template>
  <div
    v-if="visible"
    class="fixed z-5000 flex flex-col overflow-hidden border border-[var(--n-divider-color)] rounded-12px bg-white shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 ease"
    :style="dialogStyle"
  >
    <!-- 标题栏：精致简约的蓝灰渐变设计 -->
    <div
      class="relative z-10 flex select-none items-center justify-between from-slate-100 to-zinc-200/60 bg-gradient-to-r px-16px py-10px shadow-sm"
    >
      <div class="flex items-center text-slate-800 font-600">
        <SvgIcon icon="mdi:bug-outline" class="mr-2 text-18px text-primary" />
        <span class="text-14px tracking-tight">{{ appName }} - 调试</span>
      </div>
      <div class="flex gap-4px">
        <NButton quaternary circle size="small" @click="toggleMinimize">
          <template #icon>
            <SvgIcon icon="mdi:minus" />
          </template>
        </NButton>
        <NButton quaternary circle size="small" @click="toggleMaximize">
          <template #icon>
            <SvgIcon :icon="isMaximized ? 'mdi:window-restore' : 'mdi:window-maximize'" />
          </template>
        </NButton>
        <NButton quaternary circle size="small" @click="handleClose">
          <template #icon>
            <SvgIcon icon="mdi:close" />
          </template>
        </NButton>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-show="!isMinimized" class="flex flex-col flex-1 gap-12px overflow-hidden bg-white p-16px">
      <!-- 提示信息 -->
      <NAlert type="info" size="small" class="mb-2 text-12px" :bordered="false" closable>
        调试使用最新草稿，临时对话，数据不保存。修改工作流实时生效，无需重新打开窗口。
      </NAlert>

      <!-- 消息列表 -->
      <div ref="messageListRef" class="flex flex-col flex-1 gap-16px overflow-y-auto scroll-smooth">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] rounded-10px px-14px py-10px shadow-sm transition-none"
            :class="
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-[var(--n-text-color-2)]'
            "
          >
            <!-- 文字内容：优化行高和抗干扰渲染 -->
            <div
              class="overflow-wrap-anywhere select-text whitespace-pre-wrap break-all text-14px lh-relaxed antialiased"
            >
              {{ msg.content }}
            </div>

            <!-- AI消息的统计信息：增加边距 -->
            <div
              v-if="msg.role === 'assistant' && (msg.tokens || msg.durationMs || msg.executions)"
              class="mt-12px flex flex-wrap gap-x-12px gap-y-4px border-t border-[var(--n-divider-color)] pt-8px text-12px opacity-60"
            >
              <!-- Token统计 -->
              <span v-if="msg.tokens" class="flex items-center gap-4px">
                <SvgIcon icon="mdi:counter" class="text-14px" />
                {{ msg.tokens.totalTokens }} tokens
              </span>

              <!-- 耗时 -->
              <span v-if="msg.durationMs" class="flex items-center gap-4px">
                <SvgIcon icon="mdi:timer-outline" class="text-14px" />
                {{ (msg.durationMs / 1000).toFixed(2) }}s
              </span>

              <!-- 执行详情链接 -->
              <span
                v-if="msg.executions && msg.executions.length > 0"
                class="flex cursor-pointer items-center gap-4px text-primary transition-opacity hover:underline hover:opacity-80"
                @click="showExecutionDetail(msg.executions)"
              >
                <SvgIcon icon="mdi:format-list-bulleted-square" class="text-14px" />
                查看执行详情 ({{ msg.executions.length }}个节点)
              </span>
            </div>
          </div>
        </div>

        <!-- 加载中提示 -->
        <div v-if="isStreaming" class="flex justify-start">
          <div
            class="max-w-[85%] break-words rounded-8px bg-gray-100 px-14px py-10px text-[var(--n-text-color-2)] dark:bg-gray-800"
          >
            <NSpin size="small" />
            <span class="ml-2">AI正在思考...</span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="flex items-end gap-8px">
        <NInput
          v-model:value="inputMessage"
          type="textarea"
          placeholder="输入调试消息..."
          :autosize="{ minRows: 1, maxRows: 4 }"
          :disabled="isStreaming"
          @keydown.enter.prevent="handleSend"
        />
        <NButton
          type="primary"
          :disabled="!inputMessage.trim() || isStreaming"
          :loading="isStreaming"
          @click="handleSend"
        >
          <template #icon>
            <SvgIcon icon="mdi:send" />
          </template>
          发送
        </NButton>
      </div>
    </div>

    <!-- 执行详情弹窗 -->
    <NModal v-model:show="showDetailModal" preset="card" title="执行详情" style="width: 700px">
      <div class="max-h-60vh overflow-y-auto">
        <div
          v-for="(exec, index) in currentExecutions"
          :key="index"
          class="border border-[var(--n-border-color)] rounded-6px p-12px"
        >
          <div class="mb-8px flex items-center gap-8px">
            <SvgIcon :icon="getNodeIcon(exec.nodeType)" class="text-18px text-[var(--n-text-color-2)]" />
            <span class="font-500">{{ getNodeDisplayName(exec) }}</span>
            <NBadge :value="exec.nodeType" type="info" />
            <span class="ml-auto text-12px text-[var(--n-text-color-3)]">{{ exec.durationMs }}ms</span>
          </div>

          <!-- Token信息 (如果有) -->
          <div v-if="exec.tokens" class="flex items-center text-12px text-[var(--n-text-color-2)]">
            <SvgIcon icon="mdi:counter" class="mr-1" />
            Token: {{ exec.tokens.totalTokens }} (输入: {{ exec.tokens.inputTokens }}, 输出:
            {{ exec.tokens.outputTokens }})
          </div>

          <!-- 输入参数 -->
          <NCollapse class="mt-2">
            <NCollapseItem title="输入参数" name="inputs">
              <pre class="overflow-x-auto rounded-4px bg-[var(--n-color-hover)] p-12px text-12px">{{
                JSON.stringify(exec.inputs, null, 2)
              }}</pre>
            </NCollapseItem>
            <NCollapseItem title="输出参数" name="outputs">
              <pre class="overflow-x-auto rounded-4px bg-[var(--n-color-hover)] p-12px text-12px">{{
                JSON.stringify(exec.outputs, null, 2)
              }}</pre>
            </NCollapseItem>
          </NCollapse>
        </div>
      </div>
    </NModal>
  </div>
</template>
