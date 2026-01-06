/**
 * 参数解析器
 * 用于分析节点参数依赖关系，汇总可用参数来源
 * @author Mahone
 * @date 2026-01-07
 */

import type { Edge, Node } from '@vue-flow/core';
import { getNodeOutputParams } from './node-params';

/**
 * 查找指定节点的所有上游节点
 * @param nodeId 目标节点ID
 * @param nodes 所有节点列表
 * @param edges 所有边列表
 * @returns 上游节点列表
 */
export function findUpstreamNodes(nodeId: string, nodes: Node[], edges: Edge[]): Node[] {
  const upstreamNodes: Node[] = [];
  const visited = new Set<string>();

  function traverse(currentNodeId: string) {
    if (visited.has(currentNodeId)) return;
    visited.add(currentNodeId);

    // 查找所有指向当前节点的边
    const incomingEdges = edges.filter(edge => edge.target === currentNodeId);

    incomingEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode) {
        upstreamNodes.push(sourceNode);
        // 递归查找上游节点的上游节点
        traverse(sourceNode.id);
      }
    });
  }

  traverse(nodeId);
  return upstreamNodes;
}

/**
 * 获取指定节点可用的参数来源
 * @param nodeId 目标节点ID
 * @param nodes 所有节点列表
 * @param edges 所有边列表
 * @returns 参数来源列表
 */
export function getAvailableParamsForNode(nodeId: string, nodes: Node[], edges: Edge[]): Workflow.ParamSource[] {
  const sources: Workflow.ParamSource[] = [];

  // 1. 添加全局参数
  const appInfoNode = nodes.find(n => n.data.nodeType === 'APP_INFO');
  if (appInfoNode?.data.config?.globalParams) {
    const globalParams = appInfoNode.data.config.globalParams as Workflow.ParamDefinition[];
    if (globalParams.length > 0) {
      sources.push({
        type: 'global',
        sourceKey: 'global',
        sourceName: '全局参数',
        params: globalParams
      });
    }
  }

  // 2. 查找所有上游节点
  const upstreamNodes = findUpstreamNodes(nodeId, nodes, edges);

  // 3. 汇总上游节点的输出参数
  upstreamNodes.forEach(node => {
    const nodeType = node.data.nodeType as Workflow.NodeType;
    const outputParams = getNodeOutputParams(nodeType);

    if (outputParams.length > 0) {
      sources.push({
        type: 'node',
        sourceKey: node.id,
        sourceName: node.data.label || nodeType,
        params: outputParams
      });
    }
  });

  return sources;
}

/**
 * 根据参数类型过滤可用参数来源
 * @param sources 参数来源列表
 * @param targetType 目标参数类型
 * @returns 过滤后的参数来源列表
 */
export function filterParamSourcesByType(
  sources: Workflow.ParamSource[],
  targetType: Workflow.ParamDataType
): Workflow.ParamSource[] {
  return sources
    .map(source => ({
      ...source,
      params: source.params.filter(param => param.type === targetType)
    }))
    .filter(source => source.params.length > 0);
}

/**
 * 验证参数绑定是否有效
 * @param binding 参数绑定配置
 * @param availableSources 可用参数来源
 * @returns 是否有效
 */
export function validateParamBinding(
  binding: Workflow.ParamBinding,
  availableSources: Workflow.ParamSource[]
): boolean {
  const source = availableSources.find(s => s.sourceKey === binding.sourceKey);
  if (!source) return false;

  if (binding.sourceType === 'node' && binding.sourceParam) {
    return source.params.some(p => p.key === binding.sourceParam);
  }

  if (binding.sourceType === 'global') {
    return source.params.some(p => p.key === binding.sourceKey);
  }

  return false;
}

/**
 * 获取参数绑定的显示文本
 * @param binding 参数绑定配置
 * @param nodes 所有节点列表
 * @returns 显示文本
 */
export function getParamBindingDisplayText(binding: Workflow.ParamBinding, nodes: Node[]): string {
  if (binding.sourceType === 'global') {
    return `全局参数.${binding.sourceKey}`;
  }

  const sourceNode = nodes.find(n => n.id === binding.sourceKey);
  const nodeName = sourceNode?.data.label || binding.sourceKey;
  return `${nodeName}.${binding.sourceParam || ''}`;
}
