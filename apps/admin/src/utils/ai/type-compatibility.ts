/**
 * 参数类型兼容性工具
 * 与后端 ParamTypeCompatibility.java 保持一致
 *
 * @author Mahone
 * @date 2026-02-08
 */

/** 参数数据类型 */
export type ParamDataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'datetime';

/** 类型兼容性级别 */
export type CompatibilityLevel = 'compatible' | 'conditional' | 'incompatible';

/**
 * 类型兼容性矩阵
 * 与后端 ParamTypeCompatibility.java 中的 COMPATIBILITY_MATRIX 保持一致
 * 行: 目标类型, 列: 源类型
 * 顺序: STRING, NUMBER, BOOLEAN, OBJECT, ARRAY, DATETIME
 */
const COMPATIBILITY_MATRIX: CompatibilityLevel[][] = [
  // 目标类型: STRING
  ['compatible', 'compatible', 'compatible', 'incompatible', 'incompatible', 'compatible'],
  // 目标类型: NUMBER
  ['conditional', 'compatible', 'conditional', 'incompatible', 'incompatible', 'incompatible'],
  // 目标类型: BOOLEAN
  ['conditional', 'conditional', 'compatible', 'incompatible', 'incompatible', 'incompatible'],
  // 目标类型: OBJECT
  ['conditional', 'incompatible', 'incompatible', 'compatible', 'incompatible', 'incompatible'],
  // 目标类型: ARRAY
  ['conditional', 'incompatible', 'incompatible', 'incompatible', 'compatible', 'incompatible'],
  // 目标类型: DATETIME
  ['conditional', 'conditional', 'incompatible', 'incompatible', 'incompatible', 'compatible']
];

/** 类型到索引的映射 */
const TYPE_INDEX: Record<ParamDataType, number> = {
  string: 0,
  number: 1,
  boolean: 2,
  object: 3,
  array: 4,
  datetime: 5
};

/**
 * 检查类型兼容性
 * @param sourceType 源类型
 * @param targetType 目标类型
 * @returns 兼容性级别
 */
export function checkTypeCompatibility(
  sourceType: ParamDataType | string | undefined,
  targetType: ParamDataType | string | undefined
): CompatibilityLevel {
  // 未知类型视为兼容
  if (!sourceType || !targetType) {
    return 'compatible';
  }

  const sourceIndex = TYPE_INDEX[sourceType as ParamDataType];
  const targetIndex = TYPE_INDEX[targetType as ParamDataType];

  // 未知类型视为兼容
  if (sourceIndex === undefined || targetIndex === undefined) {
    return 'compatible';
  }

  return COMPATIBILITY_MATRIX[targetIndex][sourceIndex];
}

/**
 * 是否可以转换（兼容或有条件兼容）
 */
export function canConvert(
  sourceType: ParamDataType | string | undefined,
  targetType: ParamDataType | string | undefined
): boolean {
  return checkTypeCompatibility(sourceType, targetType) !== 'incompatible';
}

/**
 * 是否完全兼容
 */
export function isFullyCompatible(
  sourceType: ParamDataType | string | undefined,
  targetType: ParamDataType | string | undefined
): boolean {
  return checkTypeCompatibility(sourceType, targetType) === 'compatible';
}

/**
 * 获取兼容性提示信息
 * @param sourceType 源类型
 * @param targetType 目标类型
 * @returns 提示信息，兼容时返回 null
 */
export function getCompatibilityMessage(
  sourceType: ParamDataType | string | undefined,
  targetType: ParamDataType | string | undefined
): string | null {
  const level = checkTypeCompatibility(sourceType, targetType);

  switch (level) {
    case 'compatible':
      return null;
    case 'conditional':
      return `类型 [${sourceType}] 转换到 [${targetType}] 可能失败，请确保数据格式正确`;
    case 'incompatible':
      return `类型 [${sourceType}] 无法转换到 [${targetType}]`;
    default:
      return null;
  }
}

/**
 * 获取兼容性图标名称
 * @param level 兼容性级别
 * @returns 图标名称
 */
export function getCompatibilityIcon(level: CompatibilityLevel): string {
  switch (level) {
    case 'compatible':
      return ''; // 兼容不显示图标
    case 'conditional':
      return 'mdi:alert-circle-outline'; // 警告图标
    case 'incompatible':
      return 'mdi:close-circle-outline'; // 错误图标
    default:
      return '';
  }
}

/**
 * 获取兼容性颜色
 * @param level 兼容性级别
 * @returns CSS 颜色值
 */
export function getCompatibilityColor(level: CompatibilityLevel): string {
  switch (level) {
    case 'compatible':
      return ''; // 兼容不需要特殊颜色
    case 'conditional':
      return '#f0a020'; // 警告色（橙色）
    case 'incompatible':
      return '#d03050'; // 错误色（红色）
    default:
      return '';
  }
}

/**
 * 类型兼容性信息
 */
export interface TypeCompatibilityInfo {
  level: CompatibilityLevel;
  message: string | null;
  icon: string;
  color: string;
  canUse: boolean;
}

/**
 * 获取完整的类型兼容性信息
 */
export function getTypeCompatibilityInfo(
  sourceType: ParamDataType | string | undefined,
  targetType: ParamDataType | string | undefined
): TypeCompatibilityInfo {
  const level = checkTypeCompatibility(sourceType, targetType);

  return {
    level,
    message: getCompatibilityMessage(sourceType, targetType),
    icon: getCompatibilityIcon(level),
    color: getCompatibilityColor(level),
    canUse: level !== 'incompatible'
  };
}
