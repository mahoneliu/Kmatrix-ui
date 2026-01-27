import { ref, triggerRef } from 'vue';
// import { localStg } from '@/utils/storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string | number;
  instanceId?: number;
  tokens?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  durationMs?: number;
  executions?: any[];
  /** Thinking内容（AI思考过程） */
  thinkingContent?: string;
  /** Thinking区域是否展开 */
  thinkingExpanded?: boolean;
  /** 是否正在流式输出 */
  streaming?: boolean;
}

export interface NodeExecution {
  nodeName: string;
  label?: string; // 节点的中文标签
  nodeType: string;
  status: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  durationMs: number;
  startTime?: string;
  endTime?: string;
  tokenUsage?: {
    inputTokenCount: number;
    outputTokenCount: number;
    totalTokenCount: number;
  };
}

export interface StreamChatParams {
  appId?: string;
  sessionId?: string;
  message: string;
  debug?: boolean;
  /** 是否显示执行信息（正式对话模式下可选） */
  showExecutionInfo?: boolean;
  /** 会话完成回调 */
  onDone?: (sessionId?: string) => void;
}

interface UseStreamChatOptions {
  apiEndpoint: string;
  onError?: (error: string) => void;
  /** 外部传入的 Token（用于嵌入模式） */
  token?: string;
}

export function useStreamChat(options: UseStreamChatOptions) {
  const { apiEndpoint, onError } = options;

  const messages = ref<ChatMessage[]>([]);
  const isStreaming = ref(false);
  const currentNodeName = ref<string | null>(null);
  const currentExecutions = ref<NodeExecution[]>([]);
  const statistics = ref({
    totalTokens: 0,
    durationMs: 0
  });

  const baseURL = import.meta.env.VITE_APP_BASE_API || '';
  console.log('[useStreamChat] baseURL:', baseURL, 'VITE_APP_BASE_API:', import.meta.env.VITE_APP_BASE_API);

  /**
   * 处理SSE事件流
   */
  /* eslint-disable max-depth, no-console, complexity, no-await-in-loop, no-continue */
  async function handleSSEEvents(params: {
    reader: ReadableStreamDefaultReader<Uint8Array>;
    onMessage: (msg: string, replace?: boolean) => void;
    onNodeStatus: (nodeName: string | null) => void;
    onThinking?: (content: string) => void;
    onComplete?: (content: string) => void;
    onDone?: (data: any) => void;
  }) {
    const { reader, onMessage, onNodeStatus: _onNodeStatus, onThinking, onComplete, onDone } = params;
    const decoder = new TextDecoder();
    let buffer = '';

    // SSE Event State
    let currentEvent = '';
    let currentDataBuffer: string[] = [];

    const emitEvent = () => {
      if (currentDataBuffer.length === 0 && !currentEvent) return;

      const data = currentDataBuffer.join('\n');

      // Reset for next event (do this first or after? standard says reset after dispatch)
      // But we need to use currentEvent.

      if (currentEvent === 'node_execution_detail') {
        try {
          const executionDetail = JSON.parse(data);
          currentExecutions.value.push(executionDetail as NodeExecution);
        } catch {
          console.error('Failed to parse node_execution_detail');
        }
      } else if (currentEvent === 'thinking') {
        onThinking?.(data);
      } else if (currentEvent === 'workflow_complete') {
        onComplete?.(data);
      } else if (currentEvent === 'done') {
        try {
          const completeData = JSON.parse(data);
          if (completeData.totalTokens !== undefined) {
            statistics.value.totalTokens = completeData.totalTokens;
          }
          if (completeData.durationMs !== undefined) {
            statistics.value.durationMs = completeData.durationMs;
          }
          if (onDone) {
            onDone(completeData);
          }
        } catch {
          if (onDone) {
            onDone({ sessionId: data });
          }
        }
      } else if (data) {
        // Default message (data only or empty event)
        onMessage(data);
      }

      currentEvent = '';
      currentDataBuffer = [];
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush remaining if any (though usually stream ends with newline)
          emitEvent();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep last incomplete line

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '') {
            // Empty line triggers dispatch
            emitEvent();
            continue;
          }

          if (line.startsWith('event:') || line.startsWith('event: ')) {
            currentEvent = line.startsWith('event: ') ? line.substring(7).trim() : line.substring(6).trim();
          } else if (line.startsWith('data:') || line.startsWith('data: ')) {
            const chunk = line.startsWith('data: ') ? line.substring(6) : line.substring(5);
            currentDataBuffer.push(chunk);
          }
          // Ignore other fields like id:, retry: for now
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 清空消息
   */
  function clearMessages() {
    messages.value = [];
    currentExecutions.value = [];
    statistics.value = { totalTokens: 0, durationMs: 0 };
  }

  /**
   * 流式对话
   */
  async function streamChat(params: StreamChatParams) {
    if (isStreaming.value) return;

    isStreaming.value = true;
    currentNodeName.value = null;
    // 清空上一次的执行详情
    currentExecutions.value = [];

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: params.message,
      timestamp: new Date().toISOString()
    };
    messages.value.push(userMsg);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
      thinkingContent: '',
      thinkingExpanded: false
    };
    messages.value.push(aiMsg);

    try {
      // 优先使用 options 传入的 token，否则从本地存储获取
      const token = options.token || localStorage.getItem('token') || '';

      const clientId = import.meta.env.VITE_APP_CLIENT_ID;

      const response = await fetch(`${baseURL}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          clientid: clientId || ''
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      await handleSSEEvents({
        reader,
        onMessage: (msg: string, replace?: boolean) => {
          if (replace) {
            aiMsg.content = msg;
          } else {
            aiMsg.content += msg;
          }
        },
        onNodeStatus: (nodeName: string | null) => {
          currentNodeName.value = nodeName;
        },
        onThinking: (content: string) => {
          // 追加thinking内容并展开
          aiMsg.thinkingContent = `${(aiMsg.thinkingContent || '') + content}`;
          aiMsg.thinkingExpanded = true;
          // 强制触发响应式更新
          triggerRef(messages);
          console.log('aiMsg.thinkingContent:', aiMsg.thinkingContent);
        },
        onComplete: data => {
          if (data.length > 0) {
            aiMsg.content = data;
          }
        },
        onDone: data => {
          // 标记流式结束
          aiMsg.streaming = false;
          // 折叠thinking区域
          aiMsg.thinkingExpanded = false;

          // 汇总所有节点的 token 使用量
          let totalInput = 0;
          let totalOutput = 0;
          let total = 0;

          for (const exec of currentExecutions.value) {
            if (exec.tokenUsage) {
              totalInput += exec.tokenUsage.inputTokenCount || 0;
              totalOutput += exec.tokenUsage.outputTokenCount || 0;
              total += exec.tokenUsage.totalTokenCount || 0;
            }
          }

          // 如果有 token 使用,设置到消息
          if (total > 0) {
            aiMsg.tokens = {
              inputTokens: totalInput,
              outputTokens: totalOutput,
              totalTokens: total
            };
          }

          // 设置执行时长
          if (data?.durationMs !== undefined) {
            aiMsg.durationMs = data.durationMs;
          }

          // 附加执行详情
          if (currentExecutions.value.length > 0) {
            aiMsg.executions = [...currentExecutions.value];
          }

          // 触发完成回调
          if (params.onDone) {
            params.onDone(data?.sessionId);
          }
        }
      });
    } catch (error: any) {
      aiMsg.content = `错误: ${error.message || '未知错误'}`;
      if (onError) {
        onError(error.message || '未知错误');
      }
    } finally {
      isStreaming.value = false;
    }
  }

  return {
    messages,
    isStreaming,
    currentNodeName,
    currentExecutions,
    statistics,
    streamChat,
    clearMessages
  };
}
