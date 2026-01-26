/**
 * 工作流参数校验工具
 */

import type { Node } from '@vue-flow/core';
import { getNodeInputParams } from './node-params';

/** 校验结果 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** 节点错误信息 */
export interface NodeValidationError {
  nodeId: string;
  nodeName: string;
  nodeType: Workflow.NodeType;
  errors: string[];
}

/** 工作流校验结果 */
export interface WorkflowValidationResult {
  valid: boolean;
  nodeErrors: NodeValidationError[];
}

/**
 * 节点配置必填字段规则
 * 注意: APP_INFO 节点不在 graphData 中,需要在保存时单独校验
 */
const NODE_CONFIG_RULES: Record<
  Workflow.NodeType,
  Array<{
    field: string;
    label: string;
    validator?: (value: any) => boolean;
  }>
> = {
  INTENT_CLASSIFIER: [{ field: 'modelId', label: '推理模型' }],
  LLM_CHAT: [{ field: 'modelId', label: '推理模型' }],
  FIXED_RESPONSE: [{ field: 'content', label: '回复内容' }],
  DB_QUERY: [
    { field: 'modelId', label: '推理模型' },
    { field: 'dataSourceId', label: '数据源' }
  ],
  SQL_GENERATE: [
    { field: 'modelId', label: '推理模型' },
    { field: 'dataSourceId', label: '数据源' }
  ],
  SQL_EXECUTE: [{ field: 'dataSourceId', label: '数据源' }],
  APP_INFO: [], // APP_INFO 节点在保存时单独校验
  START: [],
  END: [],
  CONDITION: []
};

/**
 * 校验单个节点的参数绑定
 */
export function validateNodeParams(
  node: Node<Workflow.NodeData>,
  inputParams: Workflow.ParamDefinition[]
): ValidationResult {
  const errors: string[] = [];

  // 检查必填参数是否已配置
  inputParams.forEach(param => {
    if (param.required) {
      const binding = node.data?.paramBindings?.find(b => b.paramKey === param.key);
      if (!binding) {
        errors.push(`缺少必填参数: ${param.label}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 校验节点配置字段
 */
export function validateNodeConfig(node: Node<Workflow.NodeData>): ValidationResult {
  const errors: string[] = [];
  const nodeType = node.data?.nodeType;

  if (!nodeType) {
    return { valid: true, errors };
  }

  const rules = NODE_CONFIG_RULES[nodeType];
  if (!rules || rules.length === 0) {
    return { valid: true, errors };
  }

  const config = node.data?.config || {};

  rules.forEach(rule => {
    const value = config[rule.field];
    const isEmpty = value === null || value === undefined || value === '';

    if (isEmpty) {
      errors.push(`缺少必填配置: ${rule.label}`);
    } else if (rule.validator && !rule.validator(value)) {
      errors.push(`配置项 ${rule.label} 不符合要求`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 校验整个工作流
 */
export function validateWorkflow(nodes: Node<Workflow.NodeData>[]): WorkflowValidationResult {
  const nodeErrors: NodeValidationError[] = [];

  nodes.forEach(node => {
    // 跳过没有 nodeType 的节点或 data 为空的节点
    if (!node.data || !node.data.nodeType) {
      return;
    }

    const allErrors: string[] = [];

    // 校验参数绑定
    const inputParams = getNodeInputParams(node.data.nodeType);
    const paramResult = validateNodeParams(node, inputParams);
    allErrors.push(...paramResult.errors);

    // 校验配置字段
    const configResult = validateNodeConfig(node);
    allErrors.push(...configResult.errors);

    // 校验自定义参数键名(问题3相关: 发布时校验空键名)
    if (node.data.customInputParams && node.data.customInputParams.length > 0) {
      node.data.customInputParams.forEach((param, index) => {
        if (!param.key || param.key.trim() === '') {
          allErrors.push(`自定义输入参数 #${index + 1} 缺少键名`);
        }
      });
    }

    if (node.data.customOutputParams && node.data.customOutputParams.length > 0) {
      node.data.customOutputParams.forEach((param, index) => {
        if (!param.key || param.key.trim() === '') {
          allErrors.push(`自定义输出参数 #${index + 1} 缺少键名`);
        }
      });
    }

    if (allErrors.length > 0) {
      nodeErrors.push({
        nodeId: node.id,
        nodeName: node.data?.nodeLabel || node.data.nodeType,
        nodeType: node.data.nodeType,
        errors: allErrors
      });
    }
  });

  return {
    valid: nodeErrors.length === 0,
    nodeErrors
  };
}

/**
 * 格式化校验错误信息为用户友好的文本
 */
export function formatValidationErrors(result: WorkflowValidationResult): string {
  if (result.valid) {
    return '';
  }

  const lines: string[] = ['以下节点存在必填参数未配置:'];

  result.nodeErrors.forEach(nodeError => {
    lines.push(`\n【${nodeError.nodeName}】`);
    nodeError.errors.forEach(error => {
      lines.push(`  • ${error}`);
    });
  });

  return lines.join('\n');
}
