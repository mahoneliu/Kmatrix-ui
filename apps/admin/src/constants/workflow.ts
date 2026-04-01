/**
 * 工作流相关常量定义
 */
import { computed } from 'vue';
import { $t } from '@/locales';

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
export const PARAM_TYPE_MAP = computed<Record<string, string>>(() => ({
  string: $t('ai.workflow_node.param_type_string'),
  number: $t('ai.workflow_node.param_type_number'),
  boolean: $t('ai.workflow_node.param_type_boolean'),
  object: $t('ai.workflow_node.param_type_object'),
  array: $t('ai.workflow_node.param_type_array'),
  datetime: $t('ai.workflow_node.param_type_datetime')
}));

/**
 * 参数类型选项(用于表单)
 */
export const PARAM_TYPE_OPTIONS = computed(() =>
  Object.entries(PARAM_TYPE_MAP.value).map(([value, label]) => ({
    label,
    value
  }))
);

// ========== 节点分类常量 ==========

/**
 * 节点分类映射
 */
export const NODE_CATEGORIES = computed<Record<string, string>>(() => ({
  basic: $t('ai.workflow_node.node_category_basic'),
  ai: $t('ai.workflow_node.node_category_ai'),
  logic: $t('ai.workflow_node.node_category_logic'),
  database: $t('ai.workflow_node.node_category_database'),
  action: $t('ai.workflow_node.node_category_action')
}));

/**
 * AI节点类型列表
 * 这些节点需要在BaseNode中统一显示AI参数配置（温度、maxTokens、流式输出等）
 */
export const AI_NODE_TYPES: Workflow.NodeType[] = [
  'LLM_CHAT',
  'DB_QUERY',
  'SQL_GENERATE',
  'INTENT_CLASSIFIER',
  'AUDIO_ASR',
  'IMAGE_OCR'
];

/**
 * 节点分类选项(用于表单)
 */
export const NODE_CATEGORY_OPTIONS = computed(() =>
  Object.entries(NODE_CATEGORIES.value).map(([value, label]) => ({
    label,
    value
  }))
);

/**
 * 节点分类列表(用于展示，保留顺序)
 */
export const NODE_CATEGORY_LIST = computed(() =>
  Object.entries(NODE_CATEGORIES.value).map(([key, label]) => ({
    key,
    label
  }))
);

// ========== 条件节点相关常量 ==========

/**
 * 比较运算符映射
 */
export const COMPARISON_OPERATORS = computed<Record<string, string>>(() => ({
  eq: $t('ai.workflow_node.op_eq'),
  ne: $t('ai.workflow_node.op_ne'),
  gt: $t('ai.workflow_node.op_gt'),
  lt: $t('ai.workflow_node.op_lt'),
  gte: $t('ai.workflow_node.op_gte'),
  lte: $t('ai.workflow_node.op_lte'),
  contains: $t('ai.workflow_node.op_contains'),
  notContains: $t('ai.workflow_node.op_not_contains'),
  startsWith: $t('ai.workflow_node.op_starts_with'),
  endsWith: $t('ai.workflow_node.op_ends_with'),
  isEmpty: $t('ai.workflow_node.op_is_empty'),
  isNotEmpty: $t('ai.workflow_node.op_is_not_empty')
}));

/**
 * 比较运算符选项
 */
export const COMPARISON_OPERATOR_OPTIONS = computed(() =>
  Object.entries(COMPARISON_OPERATORS.value).map(([value, label]) => ({
    label,
    value
  }))
);

/**
 * 一元运算符（不需要比较值）
 */
export const UNARY_OPERATORS = ['isEmpty', 'isNotEmpty'];

/**
 * 逻辑运算符映射
 */
export const LOGICAL_OPERATORS = computed<Record<string, string>>(() => ({
  AND: $t('ai.workflow_node.log_op_and'),
  OR: $t('ai.workflow_node.log_op_or')
}));

/**
 * 逻辑运算符选项
 */
export const LOGICAL_OPERATOR_OPTIONS = computed(() =>
  Object.entries(LOGICAL_OPERATORS.value).map(([value, label]) => ({
    label,
    value
  }))
);
