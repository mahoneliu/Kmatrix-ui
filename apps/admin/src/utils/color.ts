/**
 * 颜色工具函数
 */

/**
 * 将十六进制颜色转换为 RGBA 格式
 * @param hexColor 十六进制颜色值（如 '#10b981'）
 * @param alpha 透明度（0-1）
 * @returns RGBA 颜色字符串（如 'rgba(16, 185, 129, 0.2)'）
 */
export function hexToRgba(hexColor: string | undefined, alpha: number): string {
  if (!hexColor) return 'transparent';

  // 移除 # 号
  const hex = hexColor.replace('#', '');

  // 转换为 RGB
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 生成节点头部渐变背景
 * @param hexColor 十六进制颜色值
 * @returns CSS 渐变字符串
 */
export function getNodeHeaderGradient(hexColor: string | undefined): string {
  if (!hexColor) return 'transparent';

  const color1 = hexToRgba(hexColor, 0.2);
  const color2 = hexToRgba(hexColor, 0.1);

  return `linear-gradient(to bottom, ${color1}, ${color2}, transparent)`;
}

/**
 * 生成节点图标背景颜色
 * @param hexColor 十六进制颜色值
 * @returns RGBA 颜色字符串
 */
export function getNodeIconBackground(hexColor: string | undefined): string {
  return hexToRgba(hexColor, 0.2);
}

/**
 * 生成标签背景颜色
 * @param hexColor 十六进制颜色值
 * @returns RGBA 颜色字符串
 */
export function getTagBackground(hexColor: string | undefined): string {
  return hexToRgba(hexColor, 0.1);
}
