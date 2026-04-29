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

  // 0. 添加开始节点全局参数
  const startNode = nodes.find(n => n.data.nodeType === 'START');
  if (startNode?.data.config) {
    const config = startNode.data.config as Workflow.StartNodeConfig;

    // 全局参数
    if (config.globalParams && config.globalParams.length > 0) {
      sources.push({
        type: 'global',
        sourceKey: 'global',
        sourceName: '全局参数',
        params: config.globalParams
      });
    }
  }

  // 1. 添加应用参数(全局/接口/会话)
  const appInfoNode = nodes.find(n => n.data.nodeType === 'APP_INFO');
  if (appInfoNode?.data.config) {
    const config = appInfoNode.data.config as Workflow.AppInfoConfig;

    // 应用参数
    if (config.appParams && config.appParams.length > 0) {
      sources.push({
        type: 'global',
        sourceKey: 'app',
        sourceName: '应用参数',
        params: config.appParams
      });
    }

    // 接口参数
    if (config.interfaceParams && config.interfaceParams.length > 0) {
      sources.push({
        type: 'global',
        sourceKey: 'interface',
        sourceName: '接口参数',
        params: config.interfaceParams
      });
    }

    // 会话参数
    if (config.sessionParams && config.sessionParams.length > 0) {
      sources.push({
        type: 'global',
        sourceKey: 'session',
        sourceName: '会话参数',
        params: config.sessionParams
      });
    }
  }

  // 2. 查找所有上游节点
  const upstreamNodes = findUpstreamNodes(nodeId, nodes, edges);

  // 3. 汇总上游节点的输出参数 (去重处理)
  const uniqueUpstreamNodes = Array.from(new Map(upstreamNodes.map(node => [node.id, node])).values());

  uniqueUpstreamNodes.forEach(node => {
    const validParams = collectNodeOutputParams(node);
    const nodeType = node.data.nodeType as Workflow.NodeType;

    if (validParams.length > 0) {
      sources.push({
        type: 'node',
        sourceKey: node.id,
        sourceName: node.data.nodeLabel || nodeType,
        params: validParams
      });
    }
  });

  return sources;
}

/**
 * 汇总并去重特定节点的输出参数
 * @param node 节点数据
 * @returns 参数定义列表
 */
function collectNodeOutputParams(node: Node): Workflow.ParamDefinition[] {
  const nodeType = node.data.nodeType as Workflow.NodeType;
  const allParams: Workflow.ParamDefinition[] = [];

  // 优先级 3: 添加节点默认定义参数
  allParams.push(...getNodeOutputParams(nodeType));

  // 优先级 2: 追加用户在面板上自定义的输出参数 (会覆盖默认参数)
  if (node.data.customOutputParams && Array.isArray(node.data.customOutputParams)) {
    allParams.push(...node.data.customOutputParams);
  }

  // 优先级 1: 追加节点业务逻辑动态生成的输出参数 (解耦后的统一字段)
  let dynamicOutputs = node.data.dynamicOutputParams || [];

  // 兼容旧版逻辑：如果新标准字段为空，尝试从历史路径回退读取
  if (!dynamicOutputs || dynamicOutputs.length === 0) {
    if (nodeType === 'TOOL' && node.data.config?.tool?.outputs) {
      dynamicOutputs = node.data.config.tool.outputs;
    } else if (nodeType === 'SKILL' && node.data.config?.outputs) {
      dynamicOutputs = node.data.config.outputs;
    } else if (
      (nodeType === 'VARIABLE_AGGREGATOR' || nodeType === 'PARAMETER_EXTRACTOR') &&
      node.data.customOutputParams?.length
    ) {
      dynamicOutputs = node.data.customOutputParams;
    }
  }

  if (dynamicOutputs && Array.isArray(dynamicOutputs)) {
    allParams.push(...dynamicOutputs);
  }

  // 去重处理: 相同 key 的参数只保留优先级最高的 (由于 Map.set 后者覆盖前者，所以按优先级从低到高 push)
  const paramMap = new Map<string, Workflow.ParamDefinition>();
  allParams.forEach(p => {
    if (p.key && p.key.trim() !== '') {
      paramMap.set(p.key, p);
    }
  });

  return Array.from(paramMap.values());
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
  // 根据 sourceType 确定要查找的 sourceKey
  const lookupKey = ['app', 'interface', 'session'].includes(binding.sourceType)
    ? binding.sourceType
    : binding.sourceKey;
  const source = availableSources.find(s => s.sourceKey === lookupKey);
  if (!source) return false;

  if (binding.sourceType === 'node' && binding.sourceParam) {
    return source.params.some(p => p.key === binding.sourceParam);
  }

  if (['global', 'app', 'interface', 'session'].includes(binding.sourceType)) {
    // 对于这些类型, binding.sourceKey 就是参数 key
    return source.params.some(p => p.key === binding.sourceKey);
  }

  return false;
}
