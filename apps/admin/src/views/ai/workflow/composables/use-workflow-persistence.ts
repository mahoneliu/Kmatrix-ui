import { h, ref } from 'vue';
import type { Ref } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import { fetchAppDetail, publishApp, updateApp } from '@/service/api/ai/app';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useAutoSave } from '@/composables/ai/workflow/use-auto-save';
import { useWorkflowHistory } from '@/composables/ai/workflow/use-workflow-history';
import { dslToGraph, graphToDsl, validateGraph } from '@/utils/ai/dsl-converter';
import { formatValidationErrors, validateWorkflow } from '@/utils/ai/validation';

export function useWorkflowPersistence(appId: Ref<CommonType.IdType>) {
  const workflowStore = useWorkflowStore();
  const nodeDefinitionStore = useNodeDefinitionStore();
  const message = useMessage();
  const dialog = useDialog();

  // 自动保存
  const { enableAutoSave } = useAutoSave(handleAutoSave);
  // 初始化历史管理
  const { initHistory } = useWorkflowHistory();

  const loading = ref(false);
  const appName = ref('');

  // 创建基础信息节点
  function createAppInfoNode(appData: Api.AI.Admin.App) {
    if (appData) {
      // 如果不存在,添加基础信息节点
      const appInfoNodeDef = nodeDefinitionStore.getNodeDefinition('APP_INFO');

      const newAppInfoNode = {
        id: 'app-info',
        type: 'custom',
        position: { x: 10, y: 50 },
        data: {
          id: 'app-info',
          nodeType: 'APP_INFO' as Workflow.NodeType,
          nodeLabel: appInfoNodeDef?.nodeLabel || '基础信息',
          nodeColor: appInfoNodeDef?.nodeColor,
          nodeIcon: appInfoNodeDef?.nodeIcon || 'mdi:information',
          description: appInfoNodeDef?.description,
          status: 'idle' as Workflow.NodeStatus,
          config: {
            appName: appData.appName || '',
            description: appData.description || '',
            icon: appData.icon || '',
            prologue: appData.prologue || '',
            modelId: appData.modelId,
            // 加载应用参数配置
            appParams: appData.parameters?.appParams || [],
            interfaceParams: appData.parameters?.interfaceParams || [],
            sessionParams: appData.parameters?.sessionParams || []
          }
        }
      };
      workflowStore.addNode(newAppInfoNode);
    }
  }

  // 加载工作流
  async function loadWorkflow() {
    if (!appId.value) {
      message.error('缺少应用 ID');
      return;
    }

    loading.value = true;
    try {
      const res = await fetchAppDetail(appId.value);
      if (res.data) {
        appName.value = res.data.appName;
        workflowStore.setWorkflowInfo(res.data.appName, String(appId.value));

        // 设置初始最后保存时间
        const lastTime = res.data.updateTime || res.data.createTime;
        if (lastTime) {
          workflowStore.setInitialLastSavedAt(new Date(lastTime).getTime());
        }

        // 优先使用 GraphData, 否则使用 DSL
        if (res.data.graphData) {
          const graphData = JSON.parse(res.data.graphData);
          workflowStore.setNodes(graphData.nodes);
          // 强制使用自定义 Edge
          const edges = graphData.edges.map((e: any) => ({
            ...e,
            type: 'custom',
            animated: false,
            updatable: 'target' as const
          }));
          workflowStore.setEdges(edges);
        } else if (res.data.dslData) {
          const dsl = JSON.parse(res.data.dslData);
          const graphData = dslToGraph(dsl);
          workflowStore.setNodes(graphData.nodes);
          const edges = graphData.edges.map((e: any) => ({
            ...e,
            type: 'custom',
            animated: false,
            updatable: 'target' as const
          }));
          workflowStore.setEdges(edges);
        } else {
          // 初始化默认节点
          const startNodeDef = nodeDefinitionStore.getNodeDefinition('START');
          const startNode = {
            id: 'start',
            type: 'custom',
            position: { x: 300, y: 250 },
            data: {
              id: 'start',
              nodeType: 'START' as Workflow.NodeType,
              nodeLabel: '开始',
              nodeColor: startNodeDef?.nodeColor || '#10b981',
              nodeIcon: startNodeDef?.nodeIcon,
              description: startNodeDef?.description,
              status: 'idle' as Workflow.NodeStatus
            }
          };
          workflowStore.addNode(startNode);

          const endNodeDef = nodeDefinitionStore.getNodeDefinition('END');
          const endNode = {
            id: 'end',
            type: 'custom',
            position: { x: 1000, y: 250 },
            data: {
              id: 'end',
              nodeType: 'END' as Workflow.NodeType,
              nodeLabel: '结束',
              nodeColor: endNodeDef?.nodeColor || '#ef4444',
              nodeIcon: endNodeDef?.nodeIcon,
              description: endNodeDef?.description,
              status: 'idle' as Workflow.NodeStatus
            }
          };
          workflowStore.addNode(endNode);
        }

        // 确保基础信息节点存在
        createAppInfoNode(res.data);
      } else {
        message.error('工作流数据不存在');
      }
    } catch {
      message.error('加载工作流失败');
    } finally {
      loading.value = false;
      // 延迟启用自动保存和历史初始化
      setTimeout(() => {
        enableAutoSave();
        initHistory();
      }, 2000);
    }
  }

  // 保存工作流
  // eslint-disable-next-line complexity
  async function handleSave(trigger: boolean | Event = false) {
    const isAutoSave = typeof trigger === 'boolean' ? trigger : false;

    if (!appId.value) {
      message.error('缺少应用 ID');
      return false;
    }

    const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
    const appInfoConfig = appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;

    const parameters = appInfoConfig
      ? {
          appParams: appInfoConfig.appParams || [],
          interfaceParams: appInfoConfig.interfaceParams || [],
          sessionParams: appInfoConfig.sessionParams || []
        }
      : null;

    // 准备节点数据 (去除 APP_INFO)
    const workflowNodes = workflowStore.nodes
      .filter(n => n.data.nodeType !== 'APP_INFO')
      .map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: { ...node.data }
      }));

    // 准备边数据
    const cleanEdges = workflowStore.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      label: edge.label,
      data: edge.data,
      updatable: edge.updatable
    }));

    const graphData = {
      nodes: workflowNodes,
      edges: cleanEdges
    };

    const dsl = graphToDsl(graphData, workflowStore.workflowName);

    try {
      const { error } = await updateApp({
        appId: appId.value,
        modelId: appInfoConfig?.modelId,
        graphData: JSON.stringify(graphData),
        dslData: JSON.stringify(dsl),
        parameters,
        appName: appInfoConfig?.appName || appName.value,
        description: appInfoConfig?.description,
        icon: appInfoConfig?.icon,
        prologue: appInfoConfig?.prologue
      });

      if (error) {
        if (!isAutoSave) message.error('保存失败');
        workflowStore.markSaved(false);
        return false;
      }

      if (!isAutoSave) message.success('保存成功');
      workflowStore.markSaved(true);

      if (appInfoConfig?.appName) {
        appName.value = appInfoConfig.appName;
        workflowStore.setWorkflowInfo(appInfoConfig.appName, String(appId.value));
      }
      return true;
    } catch {
      if (!isAutoSave) message.error('保存失败');
      workflowStore.markSaved(false);
      return false;
    }
  }

  // 校验应用配置
  function validateApp(graphData: any, workflowNodes: any[], appInfoConfig: any) {
    const validation = validateGraph(graphData);
    if (!validation.valid) {
      message.error(`发布失败: ${validation.errors.join(', ')}`);
      return false;
    }

    const paramValidation = validateWorkflow(workflowNodes);
    if (!paramValidation.valid) {
      const errorMessage = formatValidationErrors(paramValidation);
      message.error(errorMessage, { duration: 5000, closable: true });
      return false;
    }

    if (appInfoConfig) {
      const appInfoErrors: string[] = [];
      if (!appInfoConfig?.appName) appInfoErrors.push('缺少必填配置: 应用名称');
      if (!appInfoConfig?.modelId) appInfoErrors.push('缺少必填配置: 推理模型');

      if (appInfoErrors.length > 0) {
        const errorMessage = `发布失败，存在未配置项:\n\n【基础信息】\n${appInfoErrors.map(e => `  • ${e}`).join('\n')}`;
        message.error(errorMessage, { duration: 5000, closable: true });
        return false;
      }
    }
    return true;
  }

  // 发布应用
  async function handlePublish() {
    const workflowNodes = workflowStore.nodes
      .filter(n => n.data.nodeType !== 'APP_INFO')
      .map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: { ...node.data }
      }));

    const cleanEdges = workflowStore.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      label: edge.label,
      data: edge.data,
      updatable: edge.updatable
    }));

    const graphData = { nodes: workflowNodes, edges: cleanEdges };
    const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
    const appInfoConfig = appInfoNode?.data.config;

    if (!validateApp(graphData, workflowNodes, appInfoConfig)) {
      return;
    }

    dialog.create({
      title: '发布应用',
      content: () => {
        // 使用 h 函数简略实现，实际可能需要更复杂的交互组件
        return h('div', { class: 'flex flex-col gap-3' }, [
          h('div', { class: 'text-sm text-gray-600' }, '请输入本次发布的摘要说明:'),
          h('input', {
            id: 'publish-remark-input', // 给个ID方便查找
            type: 'text',
            placeholder: '例如: 新增意图识别节点,优化LLM配置',
            class:
              'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          })
        ]);
      },
      positiveText: '确认发布',
      negativeText: '取消',
      onPositiveClick: async () => {
        const inputEl = document.getElementById('publish-remark-input') as HTMLInputElement;
        const remark = inputEl?.value?.trim() || '';

        if (!remark) {
          message.warning('请输入发布摘要');
          return false;
        }

        try {
          loading.value = true;
          const success = await handleSave(true);
          if (!success) return false;

          await publishApp(appId.value, remark);
          message.success('发布成功');
          return true;
        } catch (error: any) {
          const errorMsg = error?.response?.data?.msg || error?.message || '发布失败';
          if (errorMsg.includes('无变更') || errorMsg.includes('没有差别')) {
            message.warning(errorMsg);
          } else {
            message.error(errorMsg);
          }
          return false;
        } finally {
          loading.value = false;
        }
      }
    });
  }

  async function handleAutoSave() {
    if (workflowStore.isSaving) return;
    try {
      workflowStore.setSaving(true);
      await handleSave(true);
    } catch {
      // quiet
    } finally {
      workflowStore.setSaving(false);
    }
  }

  return {
    loading,
    appName,
    loadWorkflow,
    handleSave,
    handlePublish,
    handleAutoSave,
    enableAutoSave
  };
}
