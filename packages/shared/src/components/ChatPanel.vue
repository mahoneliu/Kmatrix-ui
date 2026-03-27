<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NImage,
  NInput,
  NModal,
  NScrollbar,
  NSpin,
  NTag,
  NTooltip,
  NUpload,
  NUploadTrigger,
  useMessage
} from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import { type ChatMessage, type Citation, type NodeExecution, useStreamChat } from '../composables/useStreamChat';
import { getNodeIconBackground } from '../utils/color';
import { copyToClipboard } from '../utils/clipboard';
import { abortRequest, uploadFile } from '../api/chat';
import { baseURL } from '../api/request';
import MarkdownRenderer from './MarkdownRenderer.vue';

/** 可用技能条目（由父组件传入） */
export interface AvailableSkill {
  skillId: string;
  skillName: string;
  spec: string;
}

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
  /** 可用技能列表（由父组件按需传入，为空则不显示 Skill 提示） */
  availableSkills?: AvailableSkill[];
  /** 应用能力聚合（例如：vision, audio, image-ocr等） */
  capabilities?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  sessionId: undefined,
  enableExecutionDetail: false,
  prologue: '',
  token: undefined,
  hasExecutionDetailPermission: false,
  getNodeDefinition: undefined,
  isAdmin: false,
  availableSkills: () => [],
  capabilities: () => []
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
  /** 提交评价/反馈事件 */
  submitFeedback: [message: ChatMessage, status: number];
}>();

const message = useMessage();
const { t } = useI18n();
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
const { messages, isStreaming, streamChat, clearMessages, generateRequestId, abortStream } = useStreamChat({
  apiEndpoint: props.isAdmin ? '/ai/admin/chat/stream' : '/ai/chat/stream',
  token: props.token,
  onError: error => {
    message.error(`对话失败: ${error}`);
  }
});

// 当前请求ID
const currentRequestId = ref<string>('');

// Resume 相关状态
const showResumeDialog = ref(false);
const resumableSessions = ref<any[]>([]);
const isLoadingResumable = ref(false);

// 流式输出期间自动滚动到底部
watch(isStreaming, streaming => {
  if (!streaming) {
    scrollToBottom();
  }
});

// 输入消息
const userInput = ref('');

// 附件管理
interface AttachedFile {
  type: 'image' | 'audio' | 'file';
  ossId: string;
  url: string;
  name: string;
}
const attachedFiles = ref<AttachedFile[]>([]);
const isUploading = ref(false);

async function customUploadRequest({ file, onFinish, onError }: any) {
  try {
    isUploading.value = true;
    const res = await uploadFile(file.file, props.token, props.isAdmin);
    if (res.data) {
      let fileType: 'image' | 'audio' | 'file' = 'file';
      if (file.file.type.startsWith('image')) {
        fileType = 'image';
      } else if (file.file.type.startsWith('audio')) {
        fileType = 'audio';
      }

      attachedFiles.value.push({
        type: fileType,
        ossId: String(res.data.ossId),
        url: res.data.url,
        name: file.file.name
      });
      onFinish();
    } else {
      onError();
      message.error(res.error?.message || t('ai.chat.upload_fail', '上传失败'));
    }
  } catch {
    onError();
    message.error(t('ai.chat.upload_error', '上传异常'));
  } finally {
    isUploading.value = false;
  }
}

function removeAttachedFile(index: number) {
  attachedFiles.value.splice(index, 1);
}

/**
 * 处理中断请求
 */
async function handleAbort() {
  if (!currentRequestId.value) {
    message.error(t('ai.chat.abort_failed', '中断失败'));
    return;
  }

  try {
    // 立即停止前端流式处理
    abortStream();

    // 获取 token
    let token = props.token || localStorage.getItem('RY_token') || '';
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'Authorization') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }

    // 清理 token（移除引号和 Bearer 前缀）
    if (token) {
      token = token.trim().replace(/^["']|["']$/g, '');
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }
    }

    // 同时通知后端中止请求（不使用 isAdmin 路由，统一使用 /ai/chat/abort）
    await abortRequest(currentRequestId.value, token || undefined, false);
    message.success(t('ai.chat.abort_success', '已中断'));
  } catch (error: any) {
    message.error(t('ai.chat.abort_failed', '中断失败'));
    console.error('Abort request failed:', error);
  }
}

/**
 * 加载可恢复的会话列表
 */
async function loadResumableSessions() {
  if (!props.appId) return;

  try {
    isLoadingResumable.value = true;

    // 获取 token
    let token = props.token || localStorage.getItem('RY_token') || '';
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'Authorization') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }

    const headers: Record<string, string> = {};
    if (token) {
      token = token.trim().replace(/^["']|["']$/g, '');
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const response = await fetch(`${baseURL}/ai/chat/resumable-sessions/${props.appId}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      resumableSessions.value = data.data || [];
      if (resumableSessions.value.length > 0) {
        showResumeDialog.value = true;
      } else {
        message.info(t('ai.chat.no_resumable_sessions', '没有可恢复的会话'));
      }
    } else {
      const errorData = await response.json();
      message.error(errorData.msg || t('ai.chat.load_resumable_failed', '加载可恢复会话失败'));
    }
  } catch (error) {
    console.error('Failed to load resumable sessions:', error);
    message.error(t('ai.chat.load_resumable_failed', '加载可恢复会话失败'));
  } finally {
    isLoadingResumable.value = false;
  }
}

/**
 * 恢复会话
 */
async function handleResumeSession(sessionId: string) {
  try {
    // 获取 token
    let token = props.token || localStorage.getItem('RY_token') || '';
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'Authorization') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }

    const headers: Record<string, string> = {};
    if (token) {
      token = token.trim().replace(/^["']|["']$/g, '');
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const response = await fetch(`${baseURL}/ai/chat/resume-session/${sessionId}`, {
      method: 'POST',
      headers,
      credentials: 'include'
    });

    if (response.ok) {
      await response.json();
      message.success(t('ai.chat.resume_success', '会话已恢复'));
      showResumeDialog.value = false;
      emit('sessionChange', sessionId);
    } else {
      const errorData = await response.json();
      message.error(errorData.msg || t('ai.chat.resume_failed', '恢复失败'));
    }
  } catch (error) {
    message.error(t('ai.chat.resume_failed', '恢复失败'));
    console.error('Resume session failed:', error);
  }
}

function parseUserMsg(content: string) {
  try {
    if (content.trim().startsWith('[') && content.trim().endsWith(']')) {
      const arr = JSON.parse(content);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // fallback
  }
  return [{ type: 'text', text: content }];
}

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return timestamp;
  }
}

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
    scrollbarRef.value?.scrollTo({ top: 999999, behavior: 'smooth' });
  });
}

/** 获取文件的完整访问路径 */
function getFileUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) {
    return url;
  }
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

// 组件挂载时加载节点定义
onMounted(async () => {
  // await nodeDefinitionStore.loadNodeDefinitions();
});

// --- 技能建议功能 (Skill Suggestions) ---
const suggestionIndex = ref(0);
const skillSearchText = ref('');
const isSearchingSkills = ref(false);

const filteredSkills = computed(() => {
  if (!isSearchingSkills.value) return [];
  const search = skillSearchText.value.toLowerCase();
  return props.availableSkills.filter(s => s.skillName.toLowerCase().includes(search));
});

const showSkillSuggestions = computed(() => {
  return isSearchingSkills.value && filteredSkills.value.length > 0;
});

// 监听输入，处理 @ 符号
watch(userInput, val => {
  const lastAtPos = val.lastIndexOf('@');
  if (lastAtPos !== -1 && (lastAtPos === 0 || val[lastAtPos - 1] === ' ' || val[lastAtPos - 1] === '\n')) {
    const afterAt = val.substring(lastAtPos + 1);
    // 假设联想时不包含空格
    if (!afterAt.includes(' ')) {
      isSearchingSkills.value = true;
      skillSearchText.value = afterAt;
      suggestionIndex.value = 0;
      return;
    }
  }
  isSearchingSkills.value = false;
});

function selectSkill(skill: AvailableSkill) {
  const lastAtPos = userInput.value.lastIndexOf('@');
  if (lastAtPos !== -1) {
    userInput.value = `${userInput.value.substring(0, lastAtPos) + skill.skillName} `;
  }
  isSearchingSkills.value = false;
}

// 发送消息
async function handleSend() {
  if (!userInput.value.trim() && attachedFiles.value.length === 0) return;
  if (isStreaming.value || isUploading.value) return;

  // 生成新的请求ID
  currentRequestId.value = generateRequestId();

  let userMsgToProcess = userInput.value.trim();
  let userMsgDisplay = userMsgToProcess;

  // 如果触发了技能补充
  const cleanMsg = userMsgDisplay.startsWith('@') ? userMsgDisplay.substring(1) : userMsgDisplay;
  const matchedSkill = props.availableSkills.find(s => s.skillName === cleanMsg);

  if (matchedSkill) {
    userMsgDisplay = `[Direct Execution] Use skill: ${matchedSkill.skillName}\nUser Instruction: ${userMsgDisplay}`;
    userMsgToProcess = userMsgDisplay;
  }

  if (attachedFiles.value.length > 0) {
    const jsonArr: any[] = [];
    if (userMsgDisplay) {
      jsonArr.push({ type: 'text', text: userMsgDisplay });
    }
    for (const f of attachedFiles.value) {
      jsonArr.push({ type: f.type, ossId: f.ossId, url: f.url });
    }
    userMsgToProcess = JSON.stringify(jsonArr);
  }

  userInput.value = '';
  attachedFiles.value = [];
  isSearchingSkills.value = false;

  emit('messageSent', userMsgDisplay);

  await streamChat({
    appId: props.appId,
    sessionId: props.sessionId,
    message: userMsgToProcess,
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
  await copyToClipboard(content, { t });
}

// 提交反馈
function handleFeedback(msg: ChatMessage, status: number) {
  emit('submitFeedback', msg, status);
}

// 按Enter发送
function handleKeyDown(e: KeyboardEvent) {
  // 处理技能建议选择
  if (showSkillSuggestions.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      suggestionIndex.value = (suggestionIndex.value + 1) % filteredSkills.value.length;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      suggestionIndex.value = (suggestionIndex.value - 1 + filteredSkills.value.length) % filteredSkills.value.length;
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      selectSkill(filteredSkills.value[suggestionIndex.value]);
      return;
    }
    if (e.key === 'Escape') {
      isSearchingSkills.value = false;
      return;
    }
  }

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

// ------------------------------------

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
            <div v-if="msg.role === 'user'" class="flex flex-row-reverse items-start gap-2">
              <div class="max-w-[70%] rounded-lg bg-blue-500 px-4 py-2 text-white">
                <div class="whitespace-pre-wrap break-words">
                  <template v-for="(part, idx) in parseUserMsg(msg.content)" :key="idx">
                    <span v-if="part.type === 'text'">{{ part.text }}</span>
                    <NImage
                      v-else-if="part.type === 'image'"
                      :src="part.url"
                      class="my-2 block max-h-[200px] max-w-[200px] border border-white/20 rounded"
                    />
                    <div
                      v-else-if="part.type === 'audio'"
                      class="my-1 inline-flex items-center gap-1 rounded bg-black/10 px-2 py-1 text-xs"
                    >
                      <SvgIcon local-icon="mdi-microphone" />
                      语音片段 ({{ part.ossId }})
                    </div>
                  </template>
                </div>
              </div>
              <NTooltip>
                <template #trigger>
                  <NButton
                    circle
                    class="opacity-0 transition-opacity group-hover:opacity-50"
                    quaternary
                    size="tiny"
                    @click="handleCopyMessage(msg.content)"
                  >
                    <template #icon>
                      <SvgIcon local-icon="carbon-copy" />
                    </template>
                  </NButton>
                </template>
                {{ t('common.copy') }}
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
              <div class="max-w-[90%] flex flex-col items-start gap-1">
                <div
                  class="rounded-lg px-4 py-2"
                  :class="
                    msg.isError
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-800'
                  "
                >
                  <!-- Thinking区域（可折叠） -->
                  <div v-if="msg.thinkingContent" class="mb-1 border-b border-gray-200 pb-1 dark:border-gray-700">
                    <NCollapse
                      :key="`thinking-${msg.id}-${msg.thinkingExpanded}`"
                      :default-expanded-names="msg.thinkingExpanded ? ['thinking'] : []"
                    >
                      <NCollapseItem name="thinking">
                        <template #header>
                          <span class="text-xs text-gray-500 dark:text-gray-200">
                            {{ t('ai.chat.thinking_process') }}
                          </span>
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
                      <span v-if="msg.durationMs">
                        {{ t('ai.chat.time_cost') }} {{ formatDuration(msg.durationMs) }}
                      </span>
                      <span v-if="msg.tokens && msg.tokens.totalTokens">
                        · {{ formatTokenCount(msg.tokens.totalTokens) }} tokens
                      </span>
                    </div>

                    <NCollapse>
                      <NCollapseItem name="execution-details">
                        <template #header>
                          <span class="text-xs text-gray-400">
                            {{ t('ai.chat.execution_details') }} ({{
                              t('ai.chat.node_count', { count: msg.executions.length })
                            }})
                          </span>
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
                                    <span
                                      v-if="exec.tokenUsage && exec.tokenUsage.totalTokenCount"
                                      class="text-gray-400"
                                    >
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
                                    <summary class="text-xs font-300">{{ t('common.input') }}</summary>
                                    <pre
                                      class="mt-0.5 overflow-x-auto rounded bg-gray-50 p-1 text-11px dark:bg-gray-900"
                                      >{{ JSON.stringify(exec.inputs, null, 2) }}</pre
                                    >
                                  </details>
                                  <details v-if="exec.outputs" class="cursor-pointer" open>
                                    <summary class="text-xs font-300">{{ t('common.output') }}</summary>
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

                <div class="flex items-center">
                  <NTooltip v-if="!msg.streaming && !msg.isError">
                    <template #trigger>
                      <NButton
                        circle
                        class="opacity-0 transition-opacity group-hover:opacity-50"
                        :class="{ 'text-primary': msg.feedbackStatus === 1 }"
                        quaternary
                        size="tiny"
                        @click="handleFeedback(msg, msg.feedbackStatus === 1 ? 0 : 1)"
                      >
                        <template #icon>
                          <SvgIcon :icon="msg.feedbackStatus === 1 ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'" />
                        </template>
                      </NButton>
                    </template>
                    {{ msg.feedbackStatus === 1 ? t('ai.chat.cancel_like', '取消点赞') : t('ai.chat.like', '点赞') }}
                  </NTooltip>

                  <NTooltip v-if="!msg.streaming && !msg.isError">
                    <template #trigger>
                      <NButton
                        circle
                        class="opacity-0 transition-opacity group-hover:opacity-50"
                        :class="{ 'text-primary': msg.feedbackStatus === -1 }"
                        quaternary
                        size="tiny"
                        @click="handleFeedback(msg, msg.feedbackStatus === -1 ? 0 : -1)"
                      >
                        <template #icon>
                          <SvgIcon :icon="msg.feedbackStatus === -1 ? 'mdi:thumb-down' : 'mdi:thumb-down-outline'" />
                        </template>
                      </NButton>
                    </template>
                    {{ msg.feedbackStatus === -1 ? t('ai.chat.cancel_dislike', '取消踩') : t('ai.chat.dislike', '踩') }}
                  </NTooltip>

                  <NTooltip>
                    <template #trigger>
                      <NButton
                        circle
                        class="opacity-0 transition-opacity group-hover:opacity-50"
                        quaternary
                        size="tiny"
                        @click="handleCopyMessage(msg.content)"
                      >
                        <template #icon>
                          <SvgIcon local-icon="carbon-copy" />
                        </template>
                      </NButton>
                    </template>
                    {{ t('common.copy') }}
                  </NTooltip>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载中提示 -->
          <div v-if="isStreaming" class="flex justify-start">
            <div class="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
              <NSpin size="small" />
              <span class="ml-2 text-gray-500">{{ t('ai.chat.ai_thinking') }}</span>
            </div>
          </div>
        </div>
      </NScrollbar>
    </div>

    <!-- 输入框 -->
    <div class="relative flex-shrink-0 px-4 py-4">
      <!-- 技能建议浮层 -->
      <Transition name="fade">
        <div
          v-if="showSkillSuggestions"
          class="absolute bottom-full left-4 right-4 z-50 mb-2 max-h-60 overflow-y-auto border border-gray-100 rounded-lg bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            v-for="(skill, index) in filteredSkills"
            :key="skill.skillId"
            class="flex cursor-pointer items-center gap-3 rounded px-3 py-2 transition-colors"
            :class="[
              suggestionIndex === index
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            ]"
            @mousedown.prevent="selectSkill(skill)"
          >
            <div
              class="h-6 w-6 flex items-center justify-center rounded bg-primary-50 text-primary dark:bg-primary-900/10"
            >
              <SvgIcon local-icon="mdi-brain" class="text-sm" />
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="truncate text-sm font-medium">{{ skill.skillName }}</div>
              <div class="truncate text-xs text-gray-400">{{ skill.spec }}</div>
            </div>
          </div>
        </div>
      </Transition>

      <div
        class="relative border border-gray-200 rounded-2xl bg-white p-3 shadow-[0_2px_12px_0_rgba(0,0,0,0.05)] transition-all duration-300 dark:border-gray-700 focus-within:border-primary-300 dark:bg-gray-800 focus-within:shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] dark:focus-within:border-primary-700"
      >
        <!-- 附件预览区 -->
        <div
          v-if="attachedFiles.length > 0"
          class="mb-2 flex flex-wrap gap-2 border-b border-gray-100 pb-2 dark:border-gray-700"
        >
          <div v-for="(file, index) in attachedFiles" :key="index" class="group relative mt-1">
            <template v-if="file.type === 'image'">
              <NImage
                :src="getFileUrl(file.url)"
                class="h-14 w-14 border border-gray-200 rounded object-cover dark:border-gray-600"
              />
            </template>
            <template v-else-if="file.type === 'audio'">
              <div
                class="h-14 w-14 flex flex-col items-center justify-center border border-blue-100 rounded bg-blue-50 text-blue-500 dark:border-blue-800 dark:bg-blue-900/30"
              >
                <SvgIcon local-icon="mdi-microphone" class="mb-1 text-xl" />
                <span class="w-12 truncate px-1 text-center text-[10px]">{{ file.name }}</span>
              </div>
            </template>
            <!-- 删除按钮 -->
            <div
              class="absolute h-5 w-5 flex cursor-pointer items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity -right-2 -top-2 group-hover:opacity-100"
              @click="removeAttachedFile(index)"
            >
              <SvgIcon local-icon="mdi-close" class="text-xs" />
            </div>
          </div>
        </div>

        <NInput
          v-model:value="userInput"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :bordered="false"
          :disabled="isStreaming"
          :placeholder="isStreaming ? t('ai.chat.ai_responding') : t('ai.chat.input_placeholder')"
          class="flex-1"
          type="textarea"
          @keydown="handleKeyDown"
        />

        <div class="flex items-center justify-between px-2 pb-1 pt-1">
          <div class="flex items-center gap-2">
            <!-- 上传图片按钮 -->
            <NUpload
              v-if="
                capabilities?.includes('vision') ||
                capabilities?.includes('image-ocr') ||
                capabilities?.includes('file-storage')
              "
              :abstract="true"
              accept="image/*"
              :show-file-list="false"
              :custom-request="customUploadRequest"
            >
              <NUploadTrigger #="{ handleClick }" :abstract="true">
                <NTooltip>
                  <template #trigger>
                    <NButton quaternary size="small" :disabled="isUploading || isStreaming" @click="handleClick">
                      <template #icon><SvgIcon icon="mdi:image-outline" /></template>
                    </NButton>
                  </template>
                  {{ t('ai.chat.upload_image', '上传图片') }}
                </NTooltip>
              </NUploadTrigger>
            </NUpload>

            <!-- 上传语音按钮 -->
            <NUpload
              v-if="capabilities?.includes('audio') || capabilities?.includes('audio-asr')"
              :abstract="true"
              accept="audio/*"
              :show-file-list="false"
              :custom-request="customUploadRequest"
            >
              <NUploadTrigger #="{ handleClick }" :abstract="true">
                <NTooltip>
                  <template #trigger>
                    <NButton quaternary size="small" :disabled="isUploading || isStreaming" @click="handleClick">
                      <template #icon><SvgIcon icon="mdi:microphone-outline" /></template>
                    </NButton>
                  </template>
                  {{ t('ai.chat.upload_audio', '上传录音') }}
                </NTooltip>
              </NUploadTrigger>
            </NUpload>

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
              {{ showExecutionInfo ? t('ai.chat.close_execution_details') : t('ai.chat.open_execution_details') }}
            </NTooltip>

            <!-- 恢复会话按钮 -->
            <NTooltip>
              <template #trigger>
                <NButton quaternary size="small" :loading="isLoadingResumable" @click="loadResumableSessions">
                  <template #icon>
                    <SvgIcon local-icon="mdi-history" />
                  </template>
                </NButton>
              </template>
              {{ t('ai.chat.resume_session', '恢复会话') }}
            </NTooltip>
          </div>
          <NButton
            v-if="!isStreaming"
            :disabled="(!userInput.trim() && attachedFiles.length === 0) || isUploading"
            :loading="isUploading"
            circle
            quaternary
            size="small"
            type="primary"
            @click="handleSend"
          >
            <template #icon>
              <NSpin v-if="isUploading" size="small" />
              <SvgIcon v-else local-icon="carbon-send-alt" class="text-xl" />
            </template>
          </NButton>
          <NButton v-else circle size="small" type="error" @click="handleAbort">
            <template #icon>
              <SvgIcon local-icon="mdi-stop-circle" class="text-xl" />
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
      :title="currentCitation?.documentName || t('ai.chat.citation_details')"
    >
      <div v-if="currentCitation" class="max-h-60vh overflow-y-auto">
        <div class="mb-4 flex gap-2">
          <NTag v-if="currentCitation.score" type="success" size="small">
            {{ t('ai.chat.similarity') }}: {{ (currentCitation.score * 100).toFixed(1) }}%
          </NTag>
          <NTag type="info" size="small">{{ t('ai.chat.chunk_id') }}: {{ currentCitation.chunkId }}</NTag>
        </div>
        <div class="rounded bg-gray-50 p-4 text-sm leading-relaxed dark:bg-gray-800">
          <div class="whitespace-pre-wrap">{{ currentCitation.content }}</div>
        </div>
      </div>
    </NModal>

    <!-- 可恢复会话弹窗 -->
    <NModal
      v-model:show="showResumeDialog"
      class="w-600px"
      preset="card"
      :title="t('ai.chat.resumable_sessions', '可恢复的会话')"
      :loading="isLoadingResumable"
    >
      <div v-if="resumableSessions.length > 0" class="space-y-3">
        <div
          v-for="session in resumableSessions"
          :key="session.sessionId"
          class="flex items-center justify-between border border-gray-200 rounded p-3 dark:border-gray-700"
        >
          <div class="flex-1">
            <div class="font-medium">{{ session.title }}</div>
            <div class="text-xs text-gray-500">
              {{ t('ai.chat.abort_time', '中断时间') }}: {{ formatTimestamp(session.abortTimestamp) }}
            </div>
            <div v-if="session.abortReason" class="text-xs text-gray-500">
              {{ t('ai.chat.abort_reason', '中断原因') }}: {{ session.abortReason }}
            </div>
          </div>
          <NButton type="primary" size="small" @click="handleResumeSession(session.sessionId)">
            {{ t('ai.chat.resume', '恢复') }}
          </NButton>
        </div>
      </div>
      <div v-else class="text-center text-gray-500">
        {{ t('ai.chat.no_resumable_sessions', '没有可恢复的会话') }}
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.chat-panel .group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
