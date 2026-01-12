import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchNodeDefinitions } from '@/service/api/ai/workflow/node';

export const useNodeDefinitionStore = defineStore('node-definition', () => {
  // 节点定义列表
  const nodeDefinitions = ref<Api.AI.Workflow.KmNodeDefinitionBo[]>([]);

  // 加载状态
  const loading = ref(false);

  // 是否已加载
  const loaded = ref(false);

  /**
   * 加载节点定义
   */
  async function loadNodeDefinitions() {
    if (loaded.value) {
      return nodeDefinitions.value;
    }

    loading.value = true;
    try {
      const result = await fetchNodeDefinitions();

      // 处理可能的包装对象 {data, error, response}
      let data: any;
      if (result && typeof result === 'object' && 'data' in result) {
        // 如果是包装对象,提取 data 字段
        data = (result as any).data;
      } else {
        // 否则直接使用
        data = result;
      }

      // 确保 data 是数组
      nodeDefinitions.value = Array.isArray(data) ? data : [];
      loaded.value = true;

      return nodeDefinitions.value;
    } catch (error) {
      // console.error('[NodeDefinitionStore] 加载节点定义失败:', error);
      nodeDefinitions.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 根据类型获取节点定义
   */
  function getNodeDefinition(type: string) {
    return nodeDefinitions.value.find(def => def.nodeType === type);
  }

  /**
   * 获取所有节点类型(用于组件库)
   */
  function getAllNodeTypes() {
    if (!Array.isArray(nodeDefinitions.value)) {
      // console.warn('[NodeDefinitionStore] nodeDefinitions 不是数组，返回空数组');
      return [];
    }
    const result = nodeDefinitions.value.map(def => ({
      type: def.nodeType as Workflow.NodeType,
      label: def.nodeLabel,
      icon: def.nodeIcon,
      color: def.nodeColor,
      category: def.category,
      description: def.description,
      isSystem: def.isSystem
    }));

    return result;
  }

  /**
   * 获取节点输入参数定义
   */
  function getNodeInputParams(nodeType: string): Workflow.ParamDefinition[] {
    const definition = getNodeDefinition(nodeType);
    if (!definition || !definition.inputParams) return [];

    return definition.inputParams.map(param => ({
      key: param.key,
      label: param.label,
      type: param.type as Workflow.ParamDataType,
      required: param.required,
      defaultValue: param.defaultValue,
      description: param.description
    }));
  }

  /**
   * 获取节点输出参数定义
   */
  function getNodeOutputParams(nodeType: string): Workflow.ParamDefinition[] {
    const definition = getNodeDefinition(nodeType);
    if (!definition || !definition.outputParams) return [];

    return definition.outputParams.map(param => ({
      key: param.key,
      label: param.label,
      type: param.type as Workflow.ParamDataType,
      required: param.required,
      defaultValue: param.defaultValue,
      description: param.description
    }));
  }

  /**
   * 重置状态(用于测试或重新加载)
   */
  function reset() {
    nodeDefinitions.value = [];
    loaded.value = false;
    loading.value = false;
  }

  return {
    nodeDefinitions,
    loading,
    loaded,
    loadNodeDefinitions,
    getNodeDefinition,
    getAllNodeTypes,
    getNodeInputParams,
    getNodeOutputParams,
    reset
  };
});
