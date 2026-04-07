/**
 * 工作流节点注册表
 * 从后端加载节点定义
 * @author Mahone
 * @date 2026-01-04
 */

import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';

/**
 * 获取所有节点类型
 * 从 store 中读取,如果未加载则返回空数组
 */
export function getAllNodeTypes() {
  const nodeDefinitionStore = useNodeDefinitionStore();
  return nodeDefinitionStore.getAllNodeTypes();
}

/**
 * 根据类型获取节点定义
 */
export function getNodeTypeInfo(type: Workflow.NodeType) {
  const nodeDefinitionStore = useNodeDefinitionStore();
  return nodeDefinitionStore.getNodeDefinition(type);
}
