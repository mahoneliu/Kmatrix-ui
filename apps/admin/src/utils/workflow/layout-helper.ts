/**
 * 工作流布局辅助函数
 * 使用 dagre 算法实现节点自动布局
 * @author Mahone
 * @date 2026-01-15
 */

import dagre from 'dagre';
import type { Edge, Node } from '@vue-flow/core';

/**
 * 布局配置选项
 */
export interface LayoutOptions {
  /** 布局方向: TB=从上到下, LR=从左到右, BT=从下到上, RL=从右到左 */
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  /** 节点间距(同一层级) */
  nodeSpacing?: number;
  /** 层级间距 */
  rankSpacing?: number;
}

/**
 * 节点默认尺寸配置
 * 根据实际渲染尺寸配置,布局时不会修改节点的实际大小
 */
const NODE_SIZE_MAP: Record<string, { width: number; height: number }> = {
  START: { width: 435, height: 150 }, // 增加高度余量
  END: { width: 380, height: 120 },
  LLM_CHAT: { width: 435, height: 350 }, // 适配更多配置项
  INTENT_CLASSIFIER: { width: 435, height: 500 }, // 分支较多时高度会增加,给一个较大的默认值
  CONDITION: { width: 435, height: 250 },
  FIXED_RESPONSE: { width: 400, height: 250 },
  DB_QUERY: { width: 435, height: 450 },
  APP_INFO: { width: 435, height: 400 },
  KNOWLEDGE_RETRIEVAL: { width: 400, height: 280 }
};

/**
 * 获取节点尺寸
 * 优先级: dimensions (实时渲染尺寸) > width/height > 默认配置
 */
function getNodeSize(node: Node): { width: number; height: number } {
  // 1. 优先使用 Vue Flow 计算的实时尺寸 (dimensions)
  // dimensions 反映了节点当前的实际渲染大小,包括折叠/展开状态
  const nodeWithDimensions = node as any;
  if (nodeWithDimensions.dimensions && nodeWithDimensions.dimensions.width && nodeWithDimensions.dimensions.height) {
    return {
      width: nodeWithDimensions.dimensions.width,
      height: nodeWithDimensions.dimensions.height
    };
  }

  // 2. 其次使用节点属性中的 width/height
  if (node.width && node.height && typeof node.width === 'number' && typeof node.height === 'number') {
    return {
      width: node.width,
      height: node.height
    };
  }

  // 3. 最后回退到默认配置
  const nodeType = node.data?.nodeType as string;
  return NODE_SIZE_MAP[nodeType] || { width: 420, height: 200 };
}

/**
 * 使用 dagre 算法自动布局节点
 * @param nodes 节点列表
 * @param edges 边列表
 * @param options 布局选项
 * @returns 布局后的节点和边
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  // 增大默认间距以避免重叠
  const { direction = 'LR', nodeSpacing = 50, rankSpacing = 50 } = options;

  // 这里的 APP_INFO 节点需要单独处理，不参与 dagre 布局
  const layoutNodes = nodes.filter(n => n.data?.nodeType !== 'APP_INFO');
  const appInfoNode = nodes.find(n => n.data?.nodeType === 'APP_INFO');

  // 创建 dagre 图实例
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // 设置图的布局参数
  dagreGraph.setGraph({
    rankdir: direction, // 布局方向
    nodesep: nodeSpacing, // 同一层级节点间距
    ranksep: rankSpacing, // 不同层级间距
    marginx: 50, // 图的左右边距
    marginy: 50 // 图的上下边距
  });

  // 添加参与布局的节点到 dagre 图
  layoutNodes.forEach(node => {
    const { width, height } = getNodeSize(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  // 添加边
  edges.forEach(edge => {
    // 确保边的源和目标都在布局节点中
    if (layoutNodes.find(n => n.id === edge.source) && layoutNodes.find(n => n.id === edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  // 执行布局计算
  dagre.layout(dagreGraph);

  // 获取布局边界，用于定位 AppInfo
  let minX = Infinity;
  let minY = Infinity;

  // 更新参与布局的节点位置
  const resultNodes = layoutNodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeSize(node);

    // 转换为左上角坐标
    const x = nodeWithPosition.x - width / 2;
    const y = nodeWithPosition.y - height / 2;

    if (x < minX) minX = x;
    if (y < minY) minY = y;

    return {
      ...node,
      position: { x, y }
    };
  });

  // 如果存在 APP_INFO 节点,将其放置在 Start 节点正上方
  if (appInfoNode) {
    // 优先寻找 START 节点作为锚点
    const startNode = resultNodes.find(n => n.data?.nodeType === 'START');

    let appInfoX = 0;
    let appInfoY = 0;

    if (startNode) {
      // 基于 Start 节点的实际位置和尺寸计算 AppInfo 位置
      const appInfoSize = getNodeSize(appInfoNode);

      // X 坐标: 与 Start 节点左对齐
      appInfoX = startNode.position.x;

      // Y 坐标: Start 节点上方,间距 50px
      // AppInfo 底部 = Start 顶部 - 50px
      // AppInfo 顶部 = AppInfo 底部 - AppInfo 高度
      appInfoY = startNode.position.y - appInfoSize.height - 50;
    } else {
      // 如果没有 START 节点,使用布局边界
      const startX = minX === Infinity ? 0 : minX;
      const startY = minY === Infinity ? 0 : minY;
      const appInfoSize = getNodeSize(appInfoNode);

      appInfoX = startX;
      appInfoY = startY - appInfoSize.height - 50;
    }

    resultNodes.push({
      ...appInfoNode,
      position: {
        x: appInfoX,
        y: appInfoY
      }
    });
  }

  return { nodes: resultNodes, edges };
}
