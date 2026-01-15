/**
 * 工作流相关常量定义
 */

/**
 * 参数来源类型颜色映射
 * 用于 ParamTag 和 ParamSelector 组件中统一显示参数来源的颜色
 */
export const PARAM_SOURCE_COLORS: Record<string, string> = {
  global: '#0066CC', // 绿色 - 全局参数
  interface: '#008A7B', // 蓝色 - 接口参数
  session: '#7B4AD9', // 橙色 - 会话参数
  node: '#1750a4ff' // 紫色 - 节点输出(默认,仅在节点未定义颜色时使用)
};
