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

  /** 节点定义业务对象 (用于新增、更新和列表展示) */
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
    /** 是否系统节点 (0否/1是) */
    isSystem?: string;
    /** 是否启用 */
    isEnabled?: string;
    /** 是否允许自定义输入参数 (0否/1是) */
    allowCustomInputParams?: string;
    /** 是否允许自定义输出参数 (0否/1是) */
    allowCustomOutputParams?: string;
    /** 输入参数定义 */
    inputParams?: NodeParamDefinition[];
    /** 输出参数定义 */
    outputParams?: NodeParamDefinition[];
    /** 备注 */
    remark?: string;
  }

  /** 节点定义列表 */
  type NodeDefinitionList = Common.PaginatingQueryRecord<KmNodeDefinitionBo>;

  /** 节点定义查询参数 */
  type NodeDefinitionSearchParams = CommonType.RecordNullable<
    Pick<KmNodeDefinitionBo, 'nodeType' | 'nodeLabel' | 'category' | 'isEnabled'> & {
      /** 是否系统节点 */
      isSystem?: string;
    } & Api.Common.CommonSearchParams
  >;
}
