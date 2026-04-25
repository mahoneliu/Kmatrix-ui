/**
 * AI 节点基础 composable
 * 封装所有 AI 类节点共用的配置逻辑：
 * - 对话配置（用户提示词、多模态、历史对话）
 * - 与 workflowStore 的双向同步
 *
 * @author Mahone
 */
import { reactive, ref, watch } from 'vue';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';

/**
 * AI 节点对话配置 composable
 * 供 base-node 内部使用，管理对话配置区域的状态与同步
 */
export function useAiNodeDialogConfig(nodeId: string, getNodeData: () => Workflow.NodeData) {
  const workflowStore = useWorkflowStore();

  // 用户提示词（独立 ref，因为它是富文本/变量引用）
  const userPrompt = ref<string>('');

  // 对话配置表单
  const dialogConfig = reactive<Required<Workflow.DialogConfig>>({
    userPrompt: '',
    enableMultimodal: false,
    historyEnabled: false,
    historyLimit: 10
  });

  /** 从节点数据初始化 */
  function initDialogConfig() {
    const config = getNodeData().config || {};
    userPrompt.value = (config.userPrompt as string) || $t('ai.workflow_node.default_user_prompt');
    dialogConfig.enableMultimodal = (config.enableMultimodal as boolean) || false;
    dialogConfig.historyEnabled = (config.historyEnabled as boolean) || false;
    dialogConfig.historyLimit = (config.historyLimit as number) || 10;
  }

  /** 将对话配置同步到 store */
  function syncDialogConfigToStore(partial: Partial<Workflow.DialogConfig>) {
    workflowStore.updateNodeConfig(nodeId, partial);
  }

  // 监听 userPrompt 变化
  watch(userPrompt, newVal => {
    const current = getNodeData().config?.userPrompt;
    if (newVal !== current) {
      syncDialogConfigToStore({ userPrompt: newVal });
    }
  });

  // 监听 dialogConfig 变化
  watch(
    dialogConfig,
    newVal => {
      const config = getNodeData().config || {};
      const changed =
        newVal.enableMultimodal !== config.enableMultimodal ||
        newVal.historyEnabled !== config.historyEnabled ||
        newVal.historyLimit !== config.historyLimit;
      if (changed) {
        syncDialogConfigToStore({
          enableMultimodal: newVal.enableMultimodal,
          historyEnabled: newVal.historyEnabled,
          historyLimit: newVal.historyLimit
        });
      }
    },
    { deep: true }
  );

  // 监听外部 config 变化（如撤销/重做）
  watch(
    () => getNodeData().config,
    newConfig => {
      if (!newConfig) return;
      if ((newConfig.userPrompt as string) !== userPrompt.value) {
        userPrompt.value = (newConfig.userPrompt as string) || '';
      }
      if ((newConfig.enableMultimodal as boolean) !== dialogConfig.enableMultimodal) {
        dialogConfig.enableMultimodal = (newConfig.enableMultimodal as boolean) || false;
      }
      if ((newConfig.historyEnabled as boolean) !== dialogConfig.historyEnabled) {
        dialogConfig.historyEnabled = (newConfig.historyEnabled as boolean) || false;
      }
      if ((newConfig.historyLimit as number) !== dialogConfig.historyLimit) {
        dialogConfig.historyLimit = (newConfig.historyLimit as number) || 10;
      }
    },
    { deep: true }
  );

  return {
    userPrompt,
    dialogConfig,
    initDialogConfig
  };
}

/**
 * 通用 AI 节点配置 composable
 * 供各业务节点使用，封装 initData / watch / updateNodeConfig 模板代码
 */
export function useAiNodeConfig<T extends Record<string, any>>(
  nodeId: string,
  getNodeData: () => Workflow.NodeData,
  defaultConfig: T
) {
  const workflowStore = useWorkflowStore();

  const formModel = reactive<T>({ ...defaultConfig });

  /** 从节点数据初始化表单 */
  function initData() {
    const config = (getNodeData().config || {}) as Partial<T>;
    for (const key of Object.keys(defaultConfig) as (keyof T)[]) {
      if (config[key] !== undefined) {
        (formModel as any)[key] = config[key];
      }
    }
  }

  /** 检测表单与 store 是否有差异，有则同步 */
  function syncToStore() {
    const currentConfig = (getNodeData().config || {}) as Partial<T>;
    const hasChange = (Object.keys(formModel) as (keyof T)[]).some(key => {
      return JSON.stringify(formModel[key]) !== JSON.stringify(currentConfig[key]);
    });
    if (hasChange) {
      workflowStore.updateNodeConfig(nodeId, { ...(formModel as object) });
    }
  }

  // 监听表单变化 → 同步到 store
  watch(formModel as object, syncToStore, { deep: true });

  // 监听外部 config 变化 → 同步到表单
  watch(
    () => getNodeData().config,
    newConfig => {
      if (!newConfig) return;
      const config = newConfig as Partial<T>;
      for (const key of Object.keys(defaultConfig) as (keyof T)[]) {
        if (JSON.stringify(config[key]) !== JSON.stringify(formModel[key])) {
          (formModel as any)[key] = config[key] ?? defaultConfig[key];
        }
      }
    },
    { deep: true }
  );

  return { formModel, initData };
}
