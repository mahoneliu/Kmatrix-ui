/**
 * 节点参数注册表
 * 从后端加载节点参数定义
 * @author Mahone
 * @date 2026-01-07
 */

import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';

/**
 * 获取节点输入参数定义
 */
export function getNodeInputParams(nodeType: Workflow.NodeType): Workflow.ParamDefinition[] {
  const nodeDefinitionStore = useNodeDefinitionStore();
  return nodeDefinitionStore.getNodeInputParams(nodeType);
}

/**
 * 获取节点输出参数定义
 */
export function getNodeOutputParams(nodeType: Workflow.NodeType): Workflow.ParamDefinition[] {
  const nodeDefinitionStore = useNodeDefinitionStore();
  return nodeDefinitionStore.getNodeOutputParams(nodeType);
}
