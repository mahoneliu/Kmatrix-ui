/**
 * 工作流模板管理 API (Admin)
 * @author Mahone
 * @date 2026-01-30
 */

import { request } from '@/service/request';

// 模板分类
export interface TemplateCategory {
  value: string;
  label: string;
}

// 工作流模板
export interface WorkflowTemplate {
  templateId: number;
  templateName: string;
  templateCode: string;
  description?: string;
  icon?: string;
  category?: string;
  scopeType: '0' | '1'; // 0=系统模板, 1=用户模板
  workflowConfig?: string;
  graphData?: string;
  version?: number;
  isPublished?: '0' | '1';
  isEnabled?: '0' | '1';
  useCount?: number;
  createBy?: string;
  createByName?: string;
  createTime?: string;
  updateTime?: string;
}

// 搜索参数
export interface TemplateSearchParams {
  templateName?: string;
  category?: string;
  scopeType?: '0' | '1';
  isEnabled?: '0' | '1';
  pageNum?: number;
  pageSize?: number;
}

/**
 * 获取模板分类列表
 */
export function fetchTemplateCategories() {
  return request<TemplateCategory[]>({
    url: '/ai/workflow-template/categories',
    method: 'get'
  });
}

/**
 * 获取模板列表
 */
export function fetchTemplateList(params?: TemplateSearchParams) {
  return request<App.Service.Response<WorkflowTemplate>>({
    url: '/ai/workflow-template/list',
    method: 'get',
    params
  });
}

/**
 * 获取模板详情
 */
export function fetchTemplateDetail(templateId: CommonType.IdType) {
  return request<WorkflowTemplate>({
    url: `/ai/workflow-template/${templateId}`,
    method: 'get'
  });
}

/**
 * 新增模板
 */
export function addTemplate(data: Partial<WorkflowTemplate>) {
  return request<number>({
    url: '/ai/workflow-template',
    method: 'post',
    data
  });
}

/**
 * 更新模板
 */
export function updateTemplate(data: Partial<WorkflowTemplate>) {
  return request<any>({
    url: '/ai/workflow-template',
    method: 'put',
    data
  });
}

/**
 * 删除模板
 */
export function deleteTemplate(templateIds: CommonType.IdType[]) {
  return request<any>({
    url: `/ai/workflow-template/${templateIds.join(',')}`,
    method: 'delete'
  });
}

/**
 * 通过模板创建应用
 */
export function createAppFromTemplate(templateId: CommonType.IdType, appName: string) {
  return request<number>({
    url: `/ai/workflow-template/createApp/${templateId}`,
    method: 'post',
    data: { appName }
  });
}

/**
 * 复制模板为自定义模板
 */
export function copyTemplate(templateId: CommonType.IdType, newName: string) {
  return request<number>({
    url: `/ai/workflow-template/copy/${templateId}`,
    method: 'post',
    data: { newName }
  });
}
