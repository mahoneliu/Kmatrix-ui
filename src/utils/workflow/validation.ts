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
 * 校验整个工作流
 */
export function validateWorkflow(nodes: Node<Workflow.NodeData>[]): WorkflowValidationResult {
  const nodeErrors: NodeValidationError[] = [];

  nodes.forEach(node => {
    // 跳过没有 nodeType 的节点或 data 为空的节点
    if (!node.data || !node.data.nodeType) {
      return;
    }

    // 获取节点的输入参数定义
    const inputParams = getNodeInputParams(node.data.nodeType);

    // 校验节点参数
    const result = validateNodeParams(node, inputParams);

    if (!result.valid) {
      nodeErrors.push({
        nodeId: node.id,
        nodeName: node.data?.label || node.data.nodeType,
        nodeType: node.data.nodeType,
        errors: result.errors
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
