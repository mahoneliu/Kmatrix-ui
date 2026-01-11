/**
 * 工作流状态管理
 * @author Mahone
 * @date 2026-01-04
 */

import { defineStore } from 'pinia';
import type { Edge, Node } from '@vue-flow/core';

interface WorkflowState {
  /** 节点列表 */
  nodes: Node[];
  /** 边列表 */
  edges: Edge[];
  /** 当前正在更新的边ID (用于边更新时的验证) */
  updatingEdgeId: string | null;
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;
  /** 节点执行状态 */
  executionStatus: Record<string, Workflow.NodeStatus>;
  /** 工作流名称 */
  workflowName: string;
  /** 工作流 ID */
  workflowId: string | null;
}

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowState => ({
    nodes: [],
    edges: [],
    updatingEdgeId: null,
    selectedNodeId: null,
    executionStatus: {},
    workflowName: '新工作流',
    workflowId: null
  }),

  getters: {
    /** 获取当前选中的节点 */
    selectedNode: state => {
      return state.nodes.find(n => n.id === state.selectedNodeId);
    },

    /** 获取所有节点数据 */
    allNodesData: state => {
      return state.nodes.map(node => node.data);
    },

    /** 获取工作流 Graph 数据 */
    graphData: state => {
      return {
        nodes: state.nodes,
        edges: state.edges
      };
    }
  },

  actions: {
    /** 添加节点 */
    addNode(node: Node) {
      this.nodes.push(node);
      this.executionStatus[node.id] = 'idle';
    },

    /** 删除节点 */
    removeNode(nodeId: string) {
      this.nodes = this.nodes.filter(n => n.id !== nodeId);
      // 同时删除相关的边
      this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      Reflect.deleteProperty(this.executionStatus, nodeId);
      if (this.selectedNodeId === nodeId) {
        this.selectedNodeId = null;
      }
    },

    /** 更新节点数据 */
    updateNode(nodeId: string, data: Partial<Node['data']>) {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    },

    /** 更新节点配置 */
    updateNodeConfig(nodeId: string, config: Record<string, any>) {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.data.config = { ...node.data.config, ...config };
      }
    },

    /** 更新节点位置 */
    updateNodePosition(nodeId: string, position: { x: number; y: number }) {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.position = position;
      }
    },

    /** 添加边 */
    addEdge(edge: Edge) {
      this.edges.push(edge);
    },

    /** 删除边 */
    removeEdge(edgeId: string) {
      this.edges = this.edges.filter(e => e.id !== edgeId);
    },

    /** 设置正在更新的边ID */
    setUpdatingEdgeId(edgeId: string | null) {
      this.updatingEdgeId = edgeId;
    },

    /** 设置节点执行状态 */
    setNodeStatus(nodeId: string, status: Workflow.NodeStatus) {
      this.executionStatus[nodeId] = status;
      const node = this.nodes.find(n => n.id === nodeId);
      if (node && node.data) {
        node.data.status = status;
      }
    },

    /** 选中节点 */
    selectNode(nodeId: string | null) {
      this.selectedNodeId = nodeId;
    },

    /** 设置所有节点 */
    setNodes(nodes: Node[]) {
      this.nodes = nodes;
      // 初始化执行状态
      nodes.forEach(node => {
        if (!this.executionStatus[node.id]) {
          this.executionStatus[node.id] = 'idle';
        }
      });
    },

    /** 设置所有边 */
    setEdges(edges: Edge[]) {
      this.edges = edges;
    },

    /** 重置所有节点状态 */
    resetAllNodeStatus() {
      Object.keys(this.executionStatus).forEach(nodeId => {
        this.executionStatus[nodeId] = 'idle';
      });
      this.nodes.forEach(node => {
        if (node.data) {
          node.data.status = 'idle';
        }
      });
    },

    /** 清空工作流 */
    clearWorkflow() {
      this.nodes = [];
      this.edges = [];
      this.selectedNodeId = null;
      this.executionStatus = {};
      this.workflowName = '新工作流';
      this.workflowId = null;
    },

    /** 设置工作流信息 */
    setWorkflowInfo(name: string, id: string | null = null) {
      this.workflowName = name;
      this.workflowId = id;
    }
  }
});
