/**
 * AI Tools & MCP Server 类型定义
 * @author Mahone
 * @date 2026-03-15
 */

declare namespace Api.Ai {
  // ============ MCP Server ============

  /** MCP Server 查询参数 */
  interface McpServerQuery {
    serverName?: string;
    transportType?: string;
    status?: string;
  }

  /** MCP Server VO（从后端返回的数据） */
  interface McpServerVo {
    serverId: CommonType.IdType;
    serverName: string;
    description?: string;
    /** 传输类型：sse / streamable_http */
    transportType: 'sse' | 'streamable_http';
    /** Server 配置 JSON 字符串 */
    serverConfig?: string;
    status: '0' | '1';
    createTime?: string;
    remark?: string;
  }

  /** MCP Server BO（提交给后端的数据） */
  interface McpServerBo {
    serverId?: CommonType.IdType;
    serverName: string;
    description?: string;
    transportType: 'sse' | 'streamable_http';
    serverConfig?: string;
    status?: '0' | '1';
    remark?: string;
  }

  // ============ MCP 连接测试 ============

  /** MCP 连接测试请求 BO */
  interface McpConnectionTestBo {
    /** 已保存的 MCP Server ID（与 serverConfig 二选一） */
    serverId?: CommonType.IdType;
    /** 临时配置 JSON（Import Wizard 中使用） */
    serverConfig?: string;
    /** 传输类型（临时配置时必填） */
    transportType?: string;
  }

  /** MCP 连接测试结果 VO */
  interface McpConnectionTestResultVo {
    success: boolean;
    tools: McpToolVo[];
    errorMessage: string | null;
    elapsedMs: number;
  }

  /** MCP 工具信息 VO */
  interface McpToolVo {
    name: string;
    description: string;
  }

  // ============ MCP 市场 ============

  /** MCP 市场条目 VO */
  interface McpMarketItemVo {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    transportType: string;
    /** 配置模板 JSON 字符串，含占位符如 ${API_KEY} */
    configTemplate: string;
    params: McpMarketParamVo[];
    /** 配置示例说明 */
    configExample: string;
  }

  /** MCP 市场条目参数定义 VO */
  interface McpMarketParamVo {
    /** 占位符 key，如 API_KEY */
    key: string;
    /** 显示名称 */
    label: string;
    required: boolean;
    description: string;
  }

  // ============ Built-in Tool ============

  /** 内置工具查询参数 */
  interface BuiltinToolQuery {
    toolName?: string;
    status?: string;
  }

  /** 内置工具 VO（从后端返回的数据） */
  interface BuiltinToolVo {
    toolId: CommonType.IdType;
    toolName: string;
    spec?: string;
    /** 参数定义（JSON Array 字符串） */
    initParams?: string;
    /** 输入参数 JSON Schema 字符串 */
    inputSchema?: string;
    /** 输出参数 JSON Schema 字符串 */
    outputSchema?: string;
    pythonCode?: string;
    status: '0' | '1';
    createTime?: string;
    remark?: string;
  }

  /** 内置工具 BO（提交给后端的数据） */
  interface BuiltinToolBo {
    toolId?: CommonType.IdType;
    toolName: string;
    spec?: string;
    initParams?: string;
    inputSchema?: string;
    outputSchema?: string;
    pythonCode?: string;
    status?: '0' | '1';
    remark?: string;
  }

  // ============ MCP 连接测试 ============

  /** MCP 连接测试请求 BO */
  interface McpConnectionTestBo {
    /** 已保存的 MCP Server ID（与 serverConfig 二选一） */
    serverId?: CommonType.IdType;
    /** 临时配置 JSON（Import Wizard 中使用） */
    serverConfig?: string;
    /** 传输类型（临时配置时必填） */
    transportType?: string;
  }

  /** MCP 连接测试结果 VO */
  interface McpConnectionTestResultVo {
    success: boolean;
    tools: McpToolVo[];
    errorMessage: string | null;
    elapsedMs: number;
  }

  /** MCP 工具信息 VO */
  interface McpToolVo {
    name: string;
    description: string;
  }

  // ============ MCP 市场 ============

  /** MCP 市场条目 VO */
  interface McpMarketItemVo {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    transportType: string;
    /** 配置模板 JSON 字符串，含占位符如 ${API_KEY} */
    configTemplate: string;
    params: McpMarketParamVo[];
    /** 配置示例说明 */
    configExample: string;
  }

  /** MCP 市场条目参数定义 VO */
  interface McpMarketParamVo {
    /** 占位符 key，如 API_KEY */
    key: string;
    /** 显示名称 */
    label: string;
    required: boolean;
    description: string;
  }

  // ============ MCP 注册源集成 ============

  /** 注册源配置 VO */
  interface McpRegistrySourceVo {
    sourceId: CommonType.IdType;
    sourceName: string;
    sourceType: 'official' | 'community';
    platform: 'official' | 'smithery';
    apiBaseUrl: string;
    syncInterval: number;
    isEnabled: '0' | '1';
    lastSyncTime?: string;
    lastSyncCount?: number;
    lastSyncStatus?: 'success' | 'failed' | 'running';
    lastSyncError?: string;
    createTime?: string;
    updateTime?: string;
  }

  /** 注册源条目 VO */
  interface McpRegistryEntryVo {
    entryId: CommonType.IdType;
    entryName: string;
    displayName?: string;
    description?: string;
    author?: string;
    version?: string;
    transportType?: 'sse' | 'stdio' | 'streamable_http';
    endpointUrl?: string;
    command?: string;
    args?: string;
    sourcePlatform: 'official' | 'smithery';
    dnsVerified?: boolean;
    entryStatus: 'active' | 'deprecated' | 'deleted' | 'offline';
    rating?: number;
    useCount?: number;
    tags?: string;
    iconUrl?: string;
    homepageUrl?: string;
    isImported?: boolean;
  }

  /** 注册源条目搜索参数 */
  interface McpRegistrySearchParams {
    keyword?: string;
    sourcePlatform?: string;
    tags?: string[];
    pageNum?: number;
    pageSize?: number;
  }

  /** 从注册源导入 MCP Server 请求参数 */
  interface McpImportParams {
    entryId?: CommonType.IdType;
    serverName?: string;
    overwrite?: boolean;
  }

  /** 手工添加 MCP Server 请求参数 */
  interface McpServerManualParams {
    serverName: string;
    transportType: 'sse' | 'stdio' | 'streamable_http';
    endpointUrl?: string;
    command?: string;
    args?: string[];
    envVars?: Record<string, string>;
    description?: string;
  }

  /** 注册源更新请求参数 */
  interface McpRegistrySourceUpdateParams {
    sourceId?: CommonType.IdType;
    sourceName?: string;
    syncInterval?: number;
    isEnabled?: '0' | '1';
    apiKey?: string;
    remark?: string;
  }

  /** 同步结果 VO */
  interface SyncResultVo {
    sourceId: CommonType.IdType;
    sourceName: string;
    syncCount: number;
    syncStatus: 'success' | 'failed' | 'running';
    syncTime: string;
    errorMessage?: string;
  }

  // ============ 工具绑定（节点配置用） ============

  /** 工具绑定项（用于 AI 节点绑定工具） */
  interface ToolBinding {
    type: 'mcp' | 'builtin';
    id: CommonType.IdType;
  }
}
