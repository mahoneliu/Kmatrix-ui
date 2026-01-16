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
  const nodes: Workflow.DslNodeConfig[] = graphData.nodes.map((node: any) => {
    // 转换参数绑定为 inputs 格式
    const inputs: Record<string, string> = {};
    if (node.data?.paramBindings && Array.isArray(node.data.paramBindings)) {
      node.data.paramBindings.forEach((binding: Workflow.ParamBinding) => {
        if (binding.sourceType === 'node' && binding.sourceKey && binding.sourceParam) {
          // 节点参数: ${nodeId.paramName}
          inputs[binding.paramKey] = `\${${binding.sourceKey}.${binding.sourceParam}}`;
        } else if (binding.sourceType === 'global') {
          // 全局参数: ${global.key}
          inputs[binding.paramKey] = `\${global.${binding.sourceKey}}`;
        } else if (binding.sourceType === 'interface') {
          // 接口参数: ${interface.key}
          inputs[binding.paramKey] = `\${interface.${binding.sourceKey}}`;
        } else if (binding.sourceType === 'session') {
          // 会话参数: ${session.key}
          inputs[binding.paramKey] = `\${session.${binding.sourceKey}}`;
        }
      });
    }

    return {
      id: node.id,
      type: NODE_TYPE_MAPPING[node.data?.nodeType as Workflow.NodeType] || node.data?.nodeType || '',
      name: node.data?.label || node.id,
      config: node.data?.config || {},
      inputs,
      condition: undefined
    };
  });

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

    // 从 inputs 恢复 paramBindings
    const paramBindings: Workflow.ParamBinding[] = [];
    if (node.inputs) {
      Object.entries(node.inputs).forEach(([paramKey, value]) => {
        if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
          const expression = value.slice(2, -1); // 移除 ${ 和 }
          const parts = expression.split('.');

          if (parts.length === 2) {
            if (parts[0] === 'session') {
              // 会话参数: session.key
              paramBindings.push({
                paramKey,
                sourceType: 'session',
                sourceKey: parts[1]
              });
            } else if (parts[0] === 'interface') {
              // 接口参数: interface.key
              paramBindings.push({
                paramKey,
                sourceType: 'interface',
                sourceKey: parts[1]
              });
            } else if (parts[0] === 'global') {
              // 全局参数: global.key
              paramBindings.push({
                paramKey,
                sourceType: 'global',
                sourceKey: parts[1]
              });
            } else {
              // 节点参数: nodeId.paramName
              paramBindings.push({
                paramKey,
                sourceType: 'node',
                sourceKey: parts[0],
                sourceParam: parts[1]
              });
            }
          }
          // 兼容旧格式: parts.length === 1 (可选,如果需要向下兼容则保留)
          // 目前移除以强制使用新规范
        }
      });
    }

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
        paramBindings,
        // 补充缺失的属性以满足 NodeData 接口
        nodeLabel: node.name,
        nodeIcon: '' // Icon 将在节点组件加载时从 store 获取，或需要在此处根据类型映射
      }
    };
  });

  // 转换边
  const edges = dsl.edges.map((edge, index) => {
    // 从条件表达式反推 sourceHandle (用于意图分类器等节点)
    let sourceHandle: string | null = null;
    if (edge.condition) {
      const sourceNode = dsl.nodes.find(n => n.id === edge.from);
      if (sourceNode) {
        sourceHandle = extractSourceHandleFromCondition(edge.condition, sourceNode);
      }
    }

    return {
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      sourceHandle,
      targetHandle: null,
      label: edge.condition,
      data: {
        id: `edge-${index}`,
        source: edge.from,
        target: edge.to,
        condition: edge.condition
      }
    };
  });

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
 * 从条件表达式反推 sourceHandle
 * @param condition 条件表达式
 * @param sourceNode 源节点配置
 * @returns sourceHandle ID,如果无法反推则返回 null
 */
function extractSourceHandleFromCondition(condition: string, sourceNode: Workflow.DslNodeConfig): string | null {
  const nodeType = NODE_TYPE_REVERSE_MAPPING[sourceNode.type] || sourceNode.type;

  // 意图分类器节点: 从条件反推 sourceHandle
  if (nodeType === 'INTENT_CLASSIFIER') {
    // 格式: intent == 'intentName' 或 intent == 'else'
    const match = condition.match(/intent\s*==\s*['"](.+?)['"]/);
    if (match) {
      const intentValue = match[1];
      if (intentValue === 'else') {
        return 'else';
      }
      // 从节点配置中查找意图索引
      const config = sourceNode.config as Workflow.IntentClassifierConfig;
      if (config?.intents) {
        const intentIndex = config.intents.findIndex((intent: string) => intent === intentValue);
        if (intentIndex !== -1) {
          return `intent-${intentIndex}`;
        }
      }
    }
  }

  return null;
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

  // 检查 END 节点的存在性和唯一性
  const endNodes = graphData.nodes.filter((node: any) => node.data?.nodeType === 'END');
  if (endNodes.length === 0) {
    errors.push('工作流必须包含一个 END 节点');
  } else if (endNodes.length > 1) {
    errors.push('工作流只能有一个 END 节点');
  }

  // 检查 END 节点不能有出边
  if (endNodes.length === 1 && graphData.edges) {
    const endNodeId = endNodes[0].id;
    const hasOutgoingEdge = graphData.edges.some((edge: any) => edge.source === endNodeId);
    if (hasOutgoingEdge) {
      errors.push('END 节点不能有出边');
    }
  }

  // 检查所有终端节点(没有出边的节点)
  if (graphData.nodes && graphData.edges) {
    // 收集所有有出边的节点
    const nodesWithOutgoingEdges = new Set<string>();
    graphData.edges.forEach((edge: any) => {
      nodesWithOutgoingEdges.add(edge.source);
    });

    // 找出所有终端节点(没有出边的节点)
    const terminalNodes = graphData.nodes.filter((node: any) => !nodesWithOutgoingEdges.has(node.id));

    // 终端节点只能有一个,且必须是 END 类型
    if (terminalNodes.length > 1) {
      const terminalNodeLabels = terminalNodes.map((node: any) => node.data.label).join(', ');
      errors.push(`工作流只能有一个终端节点(没有出边的节点),当前有多个: ${terminalNodeLabels}`);
    } else if (terminalNodes.length === 1) {
      const terminalNode = terminalNodes[0];
      if (terminalNode.data?.nodeType !== 'END') {
        errors.push(`终端节点必须是 END 类型,当前终端节点 ${terminalNode.id} 的类型是: ${terminalNode.data?.nodeType}`);
      }
    }
  }

  // 检查需要模型的节点是否已选择模型
  // const nodesRequiringModel = ['APP_INFO'];
  // graphData.nodes.forEach((node: any) => {
  //   if (nodesRequiringModel.includes(node.data?.nodeType)) {
  //     const config = node.data?.config;
  //     if (!config?.modelId) {
  //       const nodeLabel = node.data?.nodeLabel || node.id;
  //       errors.push(`节点 "${nodeLabel}" 必须选择模型`);
  //     }
  //   }
  // });

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
