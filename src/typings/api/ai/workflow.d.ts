/**
 * 工作流节点定义相关类型
 */
declare namespace Api.AI.Workflow {
  /** 节点参数定义 */
  interface NodeParamDefinition {
    /** 参数键名 */
    key: string;
    /** 参数显示名称 */
    label: string;
    /** 参数数据类型 */
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    /** 是否必填 */
    required: boolean;
    /** 默认值 */
    defaultValue?: any;
    /** 参数描述 */
    description?: string;
  }

  /** 节点类型定义 */
  interface NodeTypeDefinition {
    /** 节点定义ID */
    nodeDefId?: CommonType.IdType;
    id?: CommonType.IdType; // For compatibility if mixed usage
    /** 节点类型 */
    type: string;
    /** 节点显示名称 */
    label: string;
    /** 节点图标 */
    icon: string;
    /** 节点颜色 */
    color: string;
    /** 节点分类 */
    category: 'basic' | 'ai' | 'logic' | 'action';
    /** 节点描述 */
    description: string;
    /** 是否为系统节点 */
    isSystem: boolean;
    /** 输入参数定义 */
    inputParams: NodeParamDefinition[];
    /** 输出参数定义 */
    outputParams: NodeParamDefinition[];
  }

  /** 节点定义业务对象 (用于新增和更新) */
  interface KmNodeDefinitionBo {
    /** 节点定义ID (更新时使用) */
    nodeDefId?: CommonType.IdType;
    /** 节点类型标识 */
    nodeType: string;
    /** 节点显示名称 */
    nodeLabel: string;
    /** 节点图标 */
    nodeIcon?: string;
    /** 节点颜色 */
    nodeColor?: string;
    /** 节点分类 */
    category: string;
    /** 节点描述 */
    description?: string;
    /** 是否启用 */
    isEnabled?: string;
    /** 输入参数定义 */
    inputParams?: NodeParamDefinition[];
    /** 输出参数定义 */
    outputParams?: NodeParamDefinition[];
    /** 备注 */
    remark?: string;
  }
}
