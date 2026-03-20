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

  // ============ 工具绑定（节点配置用） ============

  /** 工具绑定项（用于 AI 节点绑定工具） */
  interface ToolBinding {
    type: 'mcp' | 'builtin';
    id: CommonType.IdType;
  }
}
