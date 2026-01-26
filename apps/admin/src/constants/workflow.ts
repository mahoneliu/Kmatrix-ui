/**
 * 工作流相关常量定义
 */

/**
 * 参数来源类型颜色映射
 * 用于 ParamTag 和 ParamSelector 组件中统一显示参数来源的颜色
 */
// export const PARAM_SOURCE_COLORS: Record<string, string> = {
//   app: '#0066CC', // 绿色 - 应用参数
//   interface: '#008A7B', // 蓝色 - 接口参数
//   session: '#7B4AD9', // 橙色 - 会话参数
//   node: '#1750a4ff', // 紫色 - 节点输出(默认,仅在节点未定义颜色时使用)
//   global: '#1750a4ff' // 紫色 - 节点输出(默认,仅在节点未定义颜色时使用)
// };

/**
 * 全局参数颜色映射
 * 用于 ParamTag 和 ParamSelector 组件中统一显示参数来源的颜色
 */
export const PARAM_GLOBAL_NODE_COLORS: Record<string, string> = {
  app: '#0066CC', // 绿色 - 应用参数
  interface: '#008A7B', // 蓝色 - 接口参数
  session: '#7B4AD9' // 橙色 - 会话参数
};

export const PARAM_GLOBAL_COLORS: string = '#93918fff';

/**
 * 参数类型映射(用于显示)
 */
export const PARAM_TYPE_MAP: Record<string, string> = {
  string: '字符串',
  number: '数字',
  boolean: '布尔值',
  object: '对象',
  array: '数组',
  datetime: '时间'
};

/**
 * 参数类型选项(用于表单)
 */
export const PARAM_TYPE_OPTIONS = Object.entries(PARAM_TYPE_MAP).map(([value, label]) => ({
  label,
  value
}));

// ========== 节点分类常量 ==========

/**
 * 节点分类映射
 */
export const NODE_CATEGORIES: Record<string, string> = {
  basic: '基础节点',
  ai: 'AI 节点',
  logic: '逻辑节点',
  database: '数据库节点',
  action: '动作节点'
};

/**
 * AI节点类型列表
 * 这些节点需要在BaseNode中统一显示AI参数配置（温度、maxTokens、流式输出等）
 */
export const AI_NODE_TYPES: Workflow.NodeType[] = ['LLM_CHAT', 'DB_QUERY', 'SQL_GENERATE', 'INTENT_CLASSIFIER'];

/**
 * 节点分类选项(用于表单)
 */
export const NODE_CATEGORY_OPTIONS = Object.entries(NODE_CATEGORIES).map(([value, label]) => ({
  label,
  value
}));

/**
 * 节点分类列表(用于展示，保留顺序)
 */
export const NODE_CATEGORY_LIST = Object.entries(NODE_CATEGORIES).map(([key, label]) => ({
  key,
  label
}));

// ========== 条件节点相关常量 ==========

/**
 * 比较运算符映射
 */
export const COMPARISON_OPERATORS: Record<string, string> = {
  eq: '等于 (==)',
  ne: '不等于 (!=)',
  gt: '大于 (>)',
  lt: '小于 (<)',
  gte: '大于等于 (>=)',
  lte: '小于等于 (<=)',
  contains: '包含',
  notContains: '不包含',
  startsWith: '开头是',
  endsWith: '结尾是',
  isEmpty: '为空',
  isNotEmpty: '不为空'
};

/**
 * 比较运算符选项
 */
export const COMPARISON_OPERATOR_OPTIONS = Object.entries(COMPARISON_OPERATORS).map(([value, label]) => ({
  label,
  value
}));

/**
 * 一元运算符（不需要比较值）
 */
export const UNARY_OPERATORS = ['isEmpty', 'isNotEmpty'];

/**
 * 逻辑运算符映射
 */
export const LOGICAL_OPERATORS: Record<string, string> = {
  AND: '且 (AND)',
  OR: '或 (OR)'
};

/**
 * 逻辑运算符选项
 */
export const LOGICAL_OPERATOR_OPTIONS = Object.entries(LOGICAL_OPERATORS).map(([value, label]) => ({
  label,
  value
}));
