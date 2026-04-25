import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchConnectionRules, fetchNodeDefinitions } from '@/service/api/ai/node';
import { fetchConnectionMode } from '@/service/api/ai/connection-rule';

export const useNodeDefinitionStore = defineStore('node-definition', () => {
  // 节点定义列表
  const nodeDefinitions = ref<Api.AI.Workflow.KmNodeDefinitionBo[]>([]);

  // 节点连接规则映射表（白名单模式=允许列表，黑名单模式=禁止列表）
  const connectionRules = ref<Record<string, string[]>>({});

  // 当前连接模式
  const connectionRuleMode = ref<'whitelist' | 'blacklist'>('whitelist');

  // 加载状态
  const loading = ref(false);

  // 是否已加载
  const loaded = ref(false);

  /**
   * 加载节点定义
   */
  async function loadNodeDefinitions(force = false) {
    if (loaded.value && !force) {
      return nodeDefinitions.value;
    }

    loading.value = true;
    try {
      const [nodeResult, connRulesResult] = await Promise.all([fetchNodeDefinitions(), fetchConnectionRules()]);

      // 处理节点定义
      let nodeData: any;
      if (nodeResult && typeof nodeResult === 'object' && 'data' in nodeResult) {
        nodeData = (nodeResult as any).data;
      } else {
        nodeData = nodeResult;
      }
      nodeDefinitions.value = Array.isArray(nodeData) ? nodeData : [];

      // 处理连接规则
      let rulesData: any;
      if (connRulesResult && typeof connRulesResult === 'object' && 'data' in connRulesResult) {
        rulesData = (connRulesResult as any).data;
      } else {
        rulesData = connRulesResult;
      }
      connectionRules.value = rulesData || {};

      // 加载连接模式
      const modeResult = await fetchConnectionMode();
      const modeData = (modeResult as any)?.data;
      if (modeData?.mode) {
        connectionRuleMode.value = modeData.mode;
      }

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
    const def = nodeDefinitions.value.find(d => d.nodeType === type);
    if (!def && type === 'TOOL') {
      return {
        nodeType: 'TOOL',
        nodeLabel: 'Tool',
        nodeIcon: 'mdi-tools',
        nodeColor: '#0d9488',
        allowCustomInputParams: '1',
        allowCustomOutputParams: '1',
        inputParams: [],
        outputParams: []
      } as unknown as Api.AI.Workflow.KmNodeDefinitionBo;
    }
    return def;
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
      nodeType: def.nodeType as Workflow.NodeType,
      nodeLabel: def.nodeLabel,
      nodeIcon: def.nodeIcon,
      nodeColor: def.nodeColor,
      category: def.category,
      description: def.description,
      isSystem: def.isSystem,
      requireAiConfig: def.requireAiConfig,
      requireDialogConfig: def.requireDialogConfig
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

  /**
   * 仅重新加载连接规则（不重置节点定义，用于切换连接模式后实时生效）
   */
  async function reloadConnectionRules() {
    try {
      const [connRulesResult, modeResult] = await Promise.all([fetchConnectionRules(), fetchConnectionMode()]);
      let rulesData: any;
      if (connRulesResult && typeof connRulesResult === 'object' && 'data' in connRulesResult) {
        rulesData = (connRulesResult as any).data;
      } else {
        rulesData = connRulesResult;
      }
      connectionRules.value = rulesData || {};
      const modeData = (modeResult as any)?.data;
      if (modeData?.mode) {
        connectionRuleMode.value = modeData.mode;
      }
    } catch {
      // ignore
    }
  }

  return {
    nodeDefinitions,
    connectionRules,
    connectionRuleMode,
    loading,
    loaded,
    loadNodeDefinitions,
    getNodeDefinition,
    getAllNodeTypes,
    getNodeInputParams,
    getNodeOutputParams,
    reset,
    reloadConnectionRules
  };
});
