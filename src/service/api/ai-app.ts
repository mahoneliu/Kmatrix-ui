import { request } from '../request';

/**
 * 获取应用列表
 * @param params Search params
 */
export function fetchAppList(params?: Api.AI.AppSearchParams) {
  return request<App.Service.Response<Api.AI.App>>({
    url: '/ai/app/list',
    method: 'get',
    params
  });
}

/**
 * 获取应用详情
 * @param appId App ID
 */
export function fetchAppDetail(appId: number | string) {
  return request<Api.AI.App>({
    url: `/ai/app/${appId}`,
    method: 'get'
  });
}

/**
 * 新增应用
 * @param data App data
 */
export function addApp(data: Partial<Api.AI.App>) {
  return request<any>({
    url: '/ai/app',
    method: 'post',
    data
  });
}

/**
 * 更新应用
 * @param data App data
 */
export function updateApp(data: Partial<Api.AI.App>) {
  return request<any>({
    url: '/ai/app',
    method: 'put',
    data
  });
}

/**
 * 删除应用
 * @param appIds App IDs
 */
export function deleteApp(appIds: number[]) {
  return request<any>({
    url: `/ai/app/${appIds.join(',')}`,
    method: 'delete'
  });
}

/**
 * 发布应用
 * @param appId App ID
 */
export function publishApp(appId: number) {
  return request<any>({
    url: `/ai/app/publish/${appId}`,
    method: 'post'
  });
}

/**
 * 获取工作流列表
 * @param params Search params
 */
export function fetchWorkflowList(params?: any) {
  return request<App.Service.Response<Api.AI.Workflow>>({
    url: '/ai/workflow/list',
    method: 'get',
    params
  });
}

/**
 * 获取工作流详情
 * @param flowId Workflow ID
 */
export function fetchWorkflowDetail(flowId: number) {
  return request<Api.AI.Workflow>({
    url: `/ai/workflow/${flowId}`,
    method: 'get'
  });
}

/**
 * 保存工作流 (新增或更新)
 * @param data Workflow data
 */
export function saveWorkflow(data: Partial<Api.AI.Workflow>) {
  if (data.flowId) {
    return request<any>({
      url: '/ai/workflow',
      method: 'put',
      data
    });
  }
  return request<any>({
    url: '/ai/workflow',
    method: 'post',
    data
  });
}
