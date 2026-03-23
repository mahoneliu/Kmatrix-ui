/**
 * validation.ts 单元测试
 * 覆盖工作流节点的参数校验、配置校验和错误信息格式化逻辑。
 */

import { createPinia, setActivePinia } from 'pinia';
import type { Node } from '@vue-flow/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  formatValidationErrors,
  validateNodeConfig,
  validateNodeParams,
  validateWorkflow
} from '@/utils/ai/validation';

// ========== 测试辅助工厂 ==========

/** 构建一个最小化的 Vue Flow 节点 */
// eslint-disable-next-line max-params
function buildNode(
  nodeType: Workflow.NodeType,
  config: Record<string, unknown> = {},
  paramBindings: Workflow.ParamBinding[] = [],
  customInputParams: Workflow.ParamDefinition[] = [],
  customOutputParams: Workflow.ParamDefinition[] = []
): Node<Workflow.NodeData> {
  return {
    id: `test-node-${nodeType}`,
    type: nodeType,
    position: { x: 0, y: 0 },
    data: {
      nodeType,
      nodeLabel: `测试节点 ${nodeType}`,
      config,
      paramBindings,
      customInputParams,
      customOutputParams
    } as any
  };
}

// ========== validateNodeConfig ==========

describe('validateNodeConfig', () => {
  it('当必填配置已填写时应返回 valid=true', () => {
    const node = buildNode('LLM_CHAT', { modelId: 42 });
    const result = validateNodeConfig(node);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('当必填配置缺失时应返回 valid=false 并包含错误信息', () => {
    const node = buildNode('LLM_CHAT', {}); // modelId 缺失
    const result = validateNodeConfig(node);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('推理模型'))).toBe(true);
  });

  it('对于无必填配置的节点（如 LOOP）应始终返回 valid=true', () => {
    const node = buildNode('LOOP', {});
    const result = validateNodeConfig(node);
    expect(result.valid).toBe(true);
  });

  it('DB_QUERY 节点需要同时填写 modelId 和 dataSourceId', () => {
    const nodeOnlyModel = buildNode('DB_QUERY', { modelId: 1 });
    const result = validateNodeConfig(nodeOnlyModel);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('数据源'))).toBe(true);
  });

  it('当节点 data 没有 nodeType 时应跳过校验返回 valid=true', () => {
    const node: Node<any> = {
      id: 'unknown',
      type: 'unknown',
      position: { x: 0, y: 0 },
      data: {} // 没有 nodeType
    };
    const result = validateNodeConfig(node);
    expect(result.valid).toBe(true);
  });
});

// ========== validateNodeParams ==========

describe('validateNodeParams', () => {
  it('当必填参数已绑定时应返回 valid=true', () => {
    const node = buildNode('LLM_CHAT', {}, [{ paramKey: 'input', source: 'global', sourceKey: 'input' } as any]);
    const inputParams: Workflow.ParamDefinition[] = [
      { key: 'input', label: '用户输入', type: 'string', required: true }
    ];
    const result = validateNodeParams(node, inputParams);
    expect(result.valid).toBe(true);
  });

  it('当必填参数未绑定时应返回 valid=false', () => {
    const node = buildNode('LLM_CHAT', {}, []); // 无绑定
    const inputParams: Workflow.ParamDefinition[] = [
      { key: 'input', label: '用户输入', type: 'string', required: true }
    ];
    const result = validateNodeParams(node, inputParams);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('用户输入'))).toBe(true);
  });

  it('可选参数未绑定时不应产生错误', () => {
    const node = buildNode('LLM_CHAT', {}, []);
    const inputParams: Workflow.ParamDefinition[] = [
      { key: 'context', label: '上下文', type: 'string', required: false }
    ];
    const result = validateNodeParams(node, inputParams);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ========== validateWorkflow ==========

describe('validateWorkflow', () => {
  // validateWorkflow 调用 getNodeInputParams，后者内部依赖 Pinia
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('所有节点配置完整时应返回 valid=true', () => {
    const nodes = [buildNode('LLM_CHAT', { modelId: 1 }), buildNode('LOOP', {})];
    const result = validateWorkflow(nodes);
    expect(result.valid).toBe(true);
    expect(result.nodeErrors).toHaveLength(0);
  });

  it('存在配置缺失节点时应返回 valid=false 并列出对应节点', () => {
    const nodes = [
      buildNode('LLM_CHAT', {}), // 缺 modelId
      buildNode('LOOP', {}) // 无需配置
    ];
    const result = validateWorkflow(nodes);
    expect(result.valid).toBe(false);
    expect(result.nodeErrors).toHaveLength(1);
    expect(result.nodeErrors[0].nodeType).toBe('LLM_CHAT');
  });

  it('自定义参数中存在空键名时应报错', () => {
    const node = buildNode(
      'LLM_CHAT',
      { modelId: 1 },
      [],
      [
        { key: '', label: '空键名参数', type: 'string' } as any // key 为空
      ]
    );
    const result = validateWorkflow([node]);
    expect(result.valid).toBe(false);
    expect(result.nodeErrors[0].errors.some(e => e.includes('缺少键名'))).toBe(true);
  });
});

// ========== formatValidationErrors ==========

describe('formatValidationErrors', () => {
  it('当校验通过时应返回空字符串', () => {
    const result = formatValidationErrors({ valid: true, nodeErrors: [] });
    expect(result).toBe('');
  });

  it('当有错误时应格式化为可读文本并包含节点名和错误信息', () => {
    const result = formatValidationErrors({
      valid: false,
      nodeErrors: [
        {
          nodeId: 'n1',
          nodeName: 'LLM对话节点',
          nodeType: 'LLM_CHAT',
          errors: ['缺少必填配置: 推理模型']
        }
      ]
    });
    expect(result).toContain('LLM对话节点');
    expect(result).toContain('推理模型');
  });
});
