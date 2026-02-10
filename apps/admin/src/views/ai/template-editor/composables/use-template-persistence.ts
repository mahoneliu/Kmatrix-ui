import { ref } from 'vue';
import type { Ref } from 'vue';
import { useMessage } from 'naive-ui';
import { fetchTemplateDetail, updateTemplate } from '@/service/api/ai/workflow-template';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useAutoSave } from '@/composables/ai/workflow/use-auto-save';
import { graphToDsl } from '@/utils/ai/dsl-converter';

/**
 * 模板工作流持久化 composable
 * 与应用工作流的主要区别：
 * 1. 数据来源是模板表而非应用表
 * 2. 保存时不做参数校验
 * 3. 无发布功能
 */
export function useTemplatePersistence(templateId: Ref<CommonType.IdType>) {
  const workflowStore = useWorkflowStore();
  const nodeDefinitionStore = useNodeDefinitionStore();
  const message = useMessage();

  // 自动保存
  const { enableAutoSave } = useAutoSave(handleAutoSave);

  const loading = ref(false);
  const templateName = ref('');

  // 加载模板工作流
  async function loadWorkflow() {
    if (!templateId.value) {
      message.error('缺少模板 ID');
      return;
    }

    loading.value = true;
    try {
      const res = await fetchTemplateDetail(templateId.value);
      if (res.data) {
        templateName.value = res.data.templateName || '';
        workflowStore.setWorkflowInfo(res.data.templateName || '未命名模板', String(templateId.value));

        // 设置初始最后保存时间
        const lastTime = res.data.updateTime || res.data.createTime;
        if (lastTime) {
          workflowStore.setInitialLastSavedAt(new Date(lastTime).getTime());
        }

        // 优先使用 GraphData, 否则使用 workflowConfig
        if (res.data.graphData) {
          const graphData = JSON.parse(res.data.graphData);
          workflowStore.setNodes(graphData.nodes || []);
          // 强制使用自定义 Edge
          const edges = (graphData.edges || []).map((e: any) => ({
            ...e,
            type: 'custom',
            animated: false,
            updatable: 'target' as const
          }));
          workflowStore.setEdges(edges);
        } else {
          // 初始化默认节点
          initDefaultNodes();
        }
      } else {
        message.error('模板数据不存在');
      }
    } catch {
      message.error('加载模板失败');
    } finally {
      loading.value = false;
      // 延迟启用自动保存
      setTimeout(() => {
        enableAutoSave();
      }, 2000);
    }
  }

  // 初始化默认节点
  function initDefaultNodes() {
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

  // 保存模板工作流（不做参数校验）
  async function handleSave(isAutoSave = false) {
    if (!templateId.value) {
      message.error('缺少模板 ID');
      return false;
    }

    // 准备节点数据
    const workflowNodes = workflowStore.nodes.map(node => ({
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

    // 生成 DSL 数据
    const dslData = graphToDsl(graphData, templateName.value || '未命名模板');

    try {
      const { error } = await updateTemplate({
        templateId: templateId.value as number,
        graphData: JSON.stringify(graphData),
        dslData: JSON.stringify(dslData)
      });

      if (error) {
        if (!isAutoSave) message.error('保存失败');
        workflowStore.markSaved(false);
        return false;
      }

      if (!isAutoSave) message.success('保存成功');
      workflowStore.markSaved(true);
      return true;
    } catch {
      if (!isAutoSave) message.error('保存失败');
      workflowStore.markSaved(false);
      return false;
    }
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
    templateName,
    loadWorkflow,
    handleSave,
    handleAutoSave,
    enableAutoSave
  };
}
