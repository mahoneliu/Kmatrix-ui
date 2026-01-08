/**
 * 工作流 DSL 转换工具
 * 负责 Vue Flow Graph 数据与后端 DSL 格式的双向转换
 * @author Mahone
 * @date 2026-01-04
 */

import { NODE_TYPE_MAPPING, NODE_TYPE_REVERSE_MAPPING } from './node-registry';

/**
 * 将 Vue Flow Graph 数据转换为后端 DSL 格式
 * @param graphData Vue Flow 画布数据
 * @param workflowName 工作流名称
 * @returns 后端 DSL 格式
 */
export function graphToDsl(graphData: any, workflowName: string): Workflow.WorkflowDSL {
  // 查找开始节点作为入口点
  const startNode = graphData.nodes.find((node: any) => node.data?.nodeType === 'START');
  const entryPoint = startNode?.id || graphData.nodes[0]?.id || 'start';

  // 转换节点
  const nodes: Workflow.DslNodeConfig[] = graphData.nodes.map((node: any) => ({
    id: node.id,
    type: NODE_TYPE_MAPPING[node.data?.nodeType as Workflow.NodeType] || node.data?.nodeType || 'LLM_CHAT',
    name: node.data?.label || node.id,
    config: node.data?.config || {},
    inputs: {},
    condition: undefined,
    // 添加参数绑定配置
    paramBindings: node.data?.paramBindings || []
  }));

  // 转换边
  const edges: Workflow.DslEdgeConfig[] = graphData.edges.map((edge: any) => ({
    from: edge.source,
    to: edge.target,
    condition: edge.label || edge.data?.condition
  }));

  return {
    name: workflowName,
    entryPoint,
    nodes,
    edges
  };
}

/**
 * 将后端 DSL 格式转换为 Vue Flow Graph 数据
 * @param dsl 后端 DSL 数据
 * @returns Vue Flow 画布数据
 */
export function dslToGraph(dsl: Workflow.WorkflowDSL): Workflow.GraphData {
  // 转换节点
  const nodes = dsl.nodes.map((node, index) => {
    const nodeType = NODE_TYPE_REVERSE_MAPPING[node.type] || 'LLM_CHAT';

    return {
      id: node.id,
      type: 'custom', // 使用自定义节点组件
      position: calculateNodePosition(index, dsl.nodes.length),
      data: {
        id: node.id,
        nodeType,
        label: node.name,
        config: node.config || {},
        status: 'idle' as Workflow.NodeStatus,
        // 恢复参数绑定配置
        paramBindings: (node as any).paramBindings || []
      }
    };
  });

  // 转换边
  const edges = dsl.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.condition,
    data: {
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      condition: edge.condition
    }
  }));

  return {
    nodes,
    edges,
    viewport: {
      x: 0,
      y: 0,
      zoom: 1
    }
  };
}

/**
 * 计算节点位置(简单的自动布局)
 * @param index 节点索引
 * @param total 节点总数
 * @returns 节点位置
 */
function calculateNodePosition(index: number, total: number): Workflow.Position {
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;

  return {
    x: 50 + col * 250,
    y: 50 + row * 150
  };
}

/**
 * 验证工作流 DSL 是否有效
 * @param dsl DSL 数据
 * @returns 验证结果
 */
export function validateDsl(dsl: Workflow.WorkflowDSL): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查必填字段
  if (!dsl.name) {
    errors.push('工作流名称不能为空');
  }

  if (!dsl.entryPoint) {
    errors.push('入口节点不能为空');
  }

  if (!dsl.nodes || dsl.nodes.length === 0) {
    errors.push('至少需要一个节点');
  }

  // 检查入口节点是否存在
  const entryNodeExists = dsl.nodes.some(node => node.id === dsl.entryPoint);
  if (!entryNodeExists) {
    errors.push(`入口节点 ${dsl.entryPoint} 不存在`);
  }

  // 检查边的节点引用是否有效
  if (dsl.edges) {
    dsl.edges.forEach((edge, index) => {
      const fromExists = dsl.nodes.some(node => node.id === edge.from);
      const toExists = dsl.nodes.some(node => node.id === edge.to);

      if (!fromExists) {
        errors.push(`边 ${index}: 起始节点 ${edge.from} 不存在`);
      }
      if (!toExists) {
        errors.push(`边 ${index}: 目标节点 ${edge.to} 不存在`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证 Graph 数据是否有效
 * @param graphData Graph 数据
 * @returns 验证结果
 */
export function validateGraph(graphData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!graphData.nodes || graphData.nodes.length === 0) {
    errors.push('至少需要一个节点');
  }

  // 检查是否有开始节点
  const hasStartNode = graphData.nodes.some((node: any) => node.data?.nodeType === 'START');
  if (!hasStartNode) {
    errors.push('必须包含一个开始节点');
  }

  // 检查边的节点引用是否有效
  if (graphData.edges) {
    graphData.edges.forEach((edge: any, index: number) => {
      const sourceExists = graphData.nodes.some((node: any) => node.id === edge.source);
      const targetExists = graphData.nodes.some((node: any) => node.id === edge.target);

      if (!sourceExists) {
        errors.push(`边 ${index}: 起始节点 ${edge.source} 不存在`);
      }
      if (!targetExists) {
        errors.push(`边 ${index}: 目标节点 ${edge.target} 不存在`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
