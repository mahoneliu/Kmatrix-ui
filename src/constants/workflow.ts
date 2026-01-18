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
