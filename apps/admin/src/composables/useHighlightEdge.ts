/**
 * 工作流连线高亮 Composable
 * @author LHF
 * @date 2026-01-30
 */

import { computed } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';

/**
 * 边高亮功能的 Composable
 */
export function useHighlightEdge() {
  const workflowStore = useWorkflowStore();

  // 计算高亮边的 ID 集合
  const highlightedEdgeIds = computed(() => workflowStore.highlightedEdgeIds || []);

  // 检查边是否应该被高亮
  const isEdgeHighlighted = (edgeId: string) => {
    if (highlightedEdgeIds.value.includes(edgeId)) {
      return 'Green';
    }
  };

  // 高亮与指定节点相关的所有边
  const highlightEdgesByNode = (nodeId: string) => {
    const edgesToHighlight: string[] = [];

    // 查找与该节点相关的所有边（作为源节点或目标节点）
    workflowStore.edges.forEach(edge => {
      if (edge.source === nodeId || edge.target === nodeId) {
        edgesToHighlight.push(edge.id);
      }
    });

    // 更新 store 中的高亮边集合
    workflowStore.setHighlightedEdgeIds(edgesToHighlight);
  };

  // 清除所有边高亮
  const clearEdgeHighlight = () => {
    workflowStore.setHighlightedEdgeIds([]);
  };

  return {
    highlightedEdgeIds,
    isEdgeHighlighted,
    highlightEdgesByNode,
    clearEdgeHighlight
  };
}
