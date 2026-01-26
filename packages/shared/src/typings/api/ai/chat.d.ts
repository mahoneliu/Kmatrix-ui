declare namespace Api.AI.Chat {
  /** 聊天消息 */
  interface Message {
    /** 消息ID */
    messageId?: CommonType.IdType;
    /** 会话ID */
    sessionId: CommonType.IdType;
    /** 角色 */
    role: 'user' | 'assistant';
    /** 内容 */
    content: string;
    /** 创建时间 */
    createTime?: string;
    /** 是否正在流式输出 */
    streaming?: boolean;
    /** 工作流实例ID */
    instanceId?: string;
    /** 节点执行记录 */
    executions?: Api.AI.Chat.NodeExecution[];
    /** 是否展开节点详情(前端UI状态) */
    expanded?: boolean;
    /** 当前执行节点名称(前端UI状态) */
    currentNode?: string | null;
  }

  /** 节点执行记录 */
  interface NodeExecution {
    executionId: string;
    nodeId: string;
    nodeName: string;
    nodeType: string;
    status: 'running' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    /** 输入参数 */
    inputParams?: Record<string, any>;
    /** 输出参数 */
    outputParams?: Record<string, any>;
    /** 执行耗时(毫秒) */
    durationMs?: number;
  }

  /** 发送消息请求 */
  interface SendRequest {
    /** 应用ID */
    appId: CommonType.IdType;
    /** 会话ID(可选,首次对话时为空) */
    sessionId?: CommonType.IdType;
    /** 用户消息内容 */
    message: string;
    /** 是否流式返回 */
    stream?: boolean;
  }

  /** 会话信息 */
  interface Session {
    /** 会话ID */
    sessionId: CommonType.IdType;
    /** 应用ID */
    appId: CommonType.IdType;
    /** 会话标题 */
    title: string;
    /** 用户ID */
    userId: CommonType.IdType;
    /** 创建时间 */
    createTime: string;
  }
}
