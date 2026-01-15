/**
 * AI 模块类型定义 - 向后兼容层
 * @description 为了保持向后兼容，将新的 Api.AI.Admin 和 Api.AI.Chat 命名空间下的类型导出到 Api.AI 命名空间
 * @deprecated 请直接使用 Api.AI.Admin 或 Api.AI.Chat 命名空间下的类型
 */

declare namespace Api.AI {
  // ========== 管理端类型（Admin） - 向后兼容 ==========
  // /** @deprecated 请使用 Api.AI.Admin.ModelProvider */
  // export type ModelProvider = Api.AI.Admin.ModelProvider;
  // /** @deprecated 请使用 Api.AI.Admin.Model */
  // export type Model = Api.AI.Admin.Model;
  // /** @deprecated 请使用 Api.AI.Admin.AppModelConfig */
  // export type AppModelConfig = Api.AI.Admin.AppModelConfig;
  // /** @deprecated 请使用 Api.AI.Admin.AppKnowledgeConfig */
  // export type AppKnowledgeConfig = Api.AI.Admin.AppKnowledgeConfig;
  // /** @deprecated 请使用 Api.AI.Admin.AppWorkflowConfig */
  // export type AppWorkflowConfig = Api.AI.Admin.AppWorkflowConfig;
  // /** @deprecated 请使用 Api.AI.Admin.App */
  // export type App = Api.AI.Admin.App;
  // /** @deprecated 请使用 Api.AI.Admin.AppSearchParams */
  // export type AppSearchParams = Api.AI.Admin.AppSearchParams;
  /** @deprecated 请使用 Api.AI.Admin.Workflow */
  // export type Workflow = Api.AI.Admin.Workflow;
  // ========== 聊天端类型（Chat） - 向后兼容 ==========
  // Chat 命名空间已经保持不变，无需额外的兼容层
}
