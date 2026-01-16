/**
 * AI 应用管理 API (Admin)
 * @author Mahone
 * @date 2026-01-04
 */

import { request } from '@/service/request';

/**
 * 获取应用列表
 */
export function fetchAppList(params?: Api.AI.Admin.AppSearchParams) {
  return request<App.Service.Response<Api.AI.Admin.App>>({
    url: '/ai/app/list',
    method: 'get',
    params
  });
}

/**
 * 获取应用详情
 */
export function fetchAppDetail(appId: CommonType.IdType) {
  return request<Api.AI.Admin.App>({
    url: `/ai/app/${appId}`,
    method: 'get'
  });
}

/**
 * 新增应用
 */
export function addApp(data: Partial<Api.AI.Admin.App>) {
  return request<any>({
    url: '/ai/app',
    method: 'post',
    data
  });
}

/**
 * 更新应用
 */
export function updateApp(data: Partial<Api.AI.Admin.App>) {
  return request<any>({
    url: '/ai/app',
    method: 'put',
    data
  });
}

/**
 * 删除应用
 */
export function deleteApp(appIds: CommonType.IdType[]) {
  return request<any>({
    url: `/ai/app/${appIds.join(',')}`,
    method: 'delete'
  });
}

/**
 * 发布应用
 */
export function publishApp(appId: CommonType.IdType, remark?: string) {
  return request<any>({
    url: `/ai/app/publish/${appId}`,
    method: 'post',
    data: { remark }
  });
}

/**
 * 获取工作流列表
 */
// export function fetchWorkflowList(params?: any) {
//   return request<App.Service.Response<Api.AI.Admin.Workflow>>({
//     url: '/ai/workflow/list',
//     method: 'get',
//     params
//   });
// }

// /**
//  * 获取工作流详情
//  */
// export function fetchWorkflowDetail(flowId: CommonType.IdType) {
//   return request<Api.AI.Admin.Workflow>({
//     url: `/ai/workflow/${flowId}`,
//     method: 'get'
//   });
// }

// /**
//  * 保存工作流 (新增或更新)
//  */
// export function saveWorkflow(data: Partial<Api.AI.Admin.Workflow>) {
//   if (data.flowId) {
//     return request<any>({
//       url: '/ai/workflow',
//       method: 'put',
//       data
//     });
//   }
//   return request<any>({
//     url: '/ai/workflow',
//     method: 'post',
//     data
//   });
// }
