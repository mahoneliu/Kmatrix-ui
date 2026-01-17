import { ref } from 'vue';
import { localStg } from '@/utils/storage';

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
  tokens?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface StreamChatParams {
  appId?: string;
  sessionId?: string;
  message: string;
  debug?: boolean;
}

interface UseStreamChatOptions {
  apiEndpoint: string;
  onError?: (error: string) => void;
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

  /**
   * 处理SSE事件流
   */
  /* eslint-disable max-depth, no-console, complexity, no-await-in-loop, no-continue */
  async function handleSSEEvents(params: {
    reader: ReadableStreamDefaultReader<Uint8Array>;
    onMessage: (msg: string, replace?: boolean) => void;
    onNodeStatus: (nodeName: string | null) => void;
    onComplete?: (data: any) => void;
  }) {
    const { reader, onMessage, onNodeStatus: _onNodeStatus, onComplete } = params;
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') {
            currentEvent = '';
            continue;
          }

          if (line.startsWith('event:') || line.startsWith('event: ')) {
            currentEvent = line.startsWith('event: ') ? line.substring(7).trim() : line.substring(6).trim();
            continue;
          }

          if (line.startsWith('data:') || line.startsWith('data: ')) {
            const data = line.startsWith('data: ') ? line.substring(6) : line.substring(5);

            // 根据事件类型处理
            if (currentEvent === 'node_execution_detail') {
              // 收集执行详情事件
              try {
                const executionDetail = JSON.parse(data);
                currentExecutions.value.push(executionDetail as NodeExecution);
              } catch {
                console.error('Failed to parse node_execution_detail');
              }
              currentEvent = '';
            } else if (currentEvent === 'done' || currentEvent === 'workflow_complete') {
              // done/workflow_complete事件：不追加消息，只触发完成回调并保存统计信息
              try {
                const completeData = JSON.parse(data);
                // 保存统计信息
                if (completeData.totalTokens !== undefined) {
                  statistics.value.totalTokens = completeData.totalTokens;
                }
                if (completeData.durationMs !== undefined) {
                  statistics.value.durationMs = completeData.durationMs;
                }
                if (onComplete) {
                  onComplete(completeData);
                }
              } catch {
                // 如果解析失败，可能是简单字符串
                if (onComplete) {
                  onComplete({ sessionId: data });
                }
              }
              currentEvent = '';
            } else {
              // 无event前缀的普通消息（流式追加）
              onMessage(data);
              currentEvent = '';
            }
          }
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
      id: (Date.now() + 1).toString(), // Changed to string
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };
    messages.value.push(aiMsg);

    try {
      const token = localStg.get('token') || '';
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
        onComplete: data => {
          // 将统计信息和执行详情附加到AI消息
          if (data) {
            if (data.totalTokens !== undefined) {
              aiMsg.tokens = {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: data.totalTokens
              };
            }
            if (data.durationMs !== undefined) {
              aiMsg.durationMs = data.durationMs;
            }
            // 附加执行详情
            if (currentExecutions.value.length > 0) {
              aiMsg.executions = [...currentExecutions.value];
            }
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
