/**
 * 节点连接规则管理相关类型
 */
declare namespace Api.AI.ConnectionRule {
  /** 连接规则 */
  interface Rule {
    ruleId: CommonType.IdType;
    sourceNodeType: string;
    targetNodeType: string;
    /** 规则类型：0=允许，1=禁止 */
    ruleType: '0' | '1';
    /** 启用状态：1=启用，0=停用 */
    isEnabled: '0' | '1';
    priority: number;
    remark?: string;
    createBy?: string;
    createByName?: string;
    updateBy?: string;
    updateByName?: string;
    createTime?: string;
    updateTime?: string;
  }

  /** 查询参数 */
  interface QueryParams {
    sourceNodeType?: string;
    targetNodeType?: string;
    ruleType?: string;
    isEnabled?: string;
    pageNum?: number;
    pageSize?: number;
  }

  /** 新增/编辑 BO */
  interface SaveBo {
    ruleId?: CommonType.IdType;
    sourceNodeType: string;
    targetNodeType: string;
    ruleType: string;
    priority?: number;
    isEnabled?: string;
    remark?: string;
  }

  /** 矩阵视图批量保存 BO */
  interface MatrixSaveBo {
    sourceNodeType: string;
    /** 可连出的目标节点列表（勾选的） */
    outboundTargets: string[];
    /** 规则类型（由前端根据当前模式自动填充） */
    ruleType: string;
  }

  /** 矩阵视图入边保存 BO */
  interface InboundSaveBo {
    targetNodeType: string;
    /** 勾选的入边来源节点列表 */
    inboundSources: string[];
    /** 规则类型 */
    ruleType: string;
  }

  /** 连接模式 */
  interface ConnectionMode {
    mode: 'whitelist' | 'blacklist';
    modeLabel: string;
    description: string;
  }

  /** 节点类型（下拉用） */
  interface NodeType {
    nodeType: string;
    nodeLabel: string;
    category?: string;
    nodeIcon?: string;
    nodeColor?: string;
  }

  /** 规则列表分页 */
  type RuleList = Common.PaginatingQueryRecord<Rule>;
}
