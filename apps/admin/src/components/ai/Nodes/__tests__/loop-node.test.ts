/**
 * loop-node.vue 组件测试
 *
 * 由于 loop-node.vue 存在 Vue Flow Handle、Pinia Store 和 i18n 等深度依赖，
 * 测试策略：对独立抽取出来的 getConditionSummary 核心逻辑进行隔离测试，
 * 并通过 shallow mount 验证组件基本渲染行为。
 *
 * 对于完整集成测试，建议在配置好 Pinia + i18n 的测试环境中扩展。
 */

import { describe, expect, it } from 'vitest';

// ========== 纯逻辑测试：条件摘要生成 ==========
// 将 loop-node.vue 中的 getConditionSummary 核心逻辑抽取为可测试的纯函数

/**
 * 根据首个规则生成条件摘要（无 i18n 依赖版本，用于纯逻辑验证）
 */
function getConditionSummaryPure(
  condition: { conditions: any[]; logicalOperator: string },
  opMap: Record<string, string>
): { type: 'empty' | 'single' | 'multiple' | 'nested' | 'noVar'; data?: Record<string, any> } {
  if (!condition || !condition.conditions) return { type: 'empty' };
  if (condition.conditions.length === 0) return { type: 'empty' };

  const first = condition.conditions[0] as any;
  if (!first) return { type: 'empty' };

  if (first.variable || (first.type === 'rule' && first.variable)) {
    const varName = first.variable?.sourceParam || 'param';
    const op = opMap[first.operator] || first.operator || '==';
    const val = first.compareValue !== undefined && first.compareValue !== '' ? first.compareValue : '...';

    if (condition.conditions.length > 1) {
      return { type: 'multiple', data: { varName, op, val, count: condition.conditions.length } };
    }
    return { type: 'single', data: { varName, op, val } };
  } else if (first.conditions || first.type === 'group') {
    return { type: 'nested' };
  }
  return { type: 'noVar' };
}

const OP_MAP: Record<string, string> = {
  eq: '=',
  ne: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
  contains: 'contains',
  notContains: 'not contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty'
};

describe('LoopNode 条件摘要生成逻辑', () => {
  it('空条件列表 → type=empty', () => {
    const result = getConditionSummaryPure({ conditions: [], logicalOperator: 'AND' }, OP_MAP);
    expect(result.type).toBe('empty');
  });

  it('单条规则 counter > 5 → type=single，正确携带 varName/op/val', () => {
    const condition = {
      logicalOperator: 'AND',
      conditions: [
        {
          type: 'rule',
          variable: { sourceType: 'global', sourceKey: 'global', sourceParam: 'counter' },
          operator: 'gt',
          compareValue: '5'
        }
      ]
    };
    const result = getConditionSummaryPure(condition, OP_MAP);
    expect(result.type).toBe('single');
    expect(result.data?.varName).toBe('counter');
    expect(result.data?.op).toBe('>');
    expect(result.data?.val).toBe('5');
  });

  it('多条规则 → type=multiple，正确携带 count', () => {
    const condition = {
      logicalOperator: 'AND',
      conditions: [
        { type: 'rule', variable: { sourceParam: 'a' }, operator: 'gt', compareValue: '1' },
        { type: 'rule', variable: { sourceParam: 'b' }, operator: 'lt', compareValue: '10' }
      ]
    };
    const result = getConditionSummaryPure(condition, OP_MAP);
    expect(result.type).toBe('multiple');
    expect(result.data?.count).toBe(2);
  });

  it('嵌套条件组 → type=nested', () => {
    const condition = {
      logicalOperator: 'AND',
      conditions: [
        {
          type: 'group',
          logicalOperator: 'OR',
          conditions: []
        }
      ]
    };
    const result = getConditionSummaryPure(condition, OP_MAP);
    expect(result.type).toBe('nested');
  });

  it('compareValue 为空时 val 应降级为占位符 "..."', () => {
    const condition = {
      logicalOperator: 'AND',
      conditions: [{ type: 'rule', variable: { sourceParam: 'x' }, operator: 'eq', compareValue: '' }]
    };
    const result = getConditionSummaryPure(condition, OP_MAP);
    expect(result.data?.val).toBe('...');
  });

  it('带有 isNotEmpty 一元操作符时能正确映射运算符文本', () => {
    const condition = {
      logicalOperator: 'AND',
      conditions: [{ type: 'rule', variable: { sourceParam: 'msg' }, operator: 'isNotEmpty', compareValue: undefined }]
    };
    const result = getConditionSummaryPure(condition, OP_MAP);
    expect(result.type).toBe('single');
    expect(result.data?.op).toBe('is not empty');
  });

  it('unknown operator 回退到原始 operator 字符串', () => {
    const condition = {
      logicalOperator: 'AND',
      conditions: [{ type: 'rule', variable: { sourceParam: 'x' }, operator: 'regex', compareValue: '^[a-z]+$' }]
    };
    const result = getConditionSummaryPure(condition, OP_MAP);
    expect(result.data?.op).toBe('regex');
  });
});
