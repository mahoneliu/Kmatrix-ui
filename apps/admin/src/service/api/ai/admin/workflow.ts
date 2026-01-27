/**
 * 管理端 AI 工作流 API
 * @author Mahone
 */

import { request } from '@/service/request';

/** 管理端工作流接口基础路径 */
const ADMIN_WORKFLOW_BASE = '/ai/admin/workflow';

/**
 * 执行工作流 (调试模式)
 */
export function executeAdminWorkflow(params: { appId?: string; message?: string; dslData?: string }) {
  return request<any>({
    url: `${ADMIN_WORKFLOW_BASE}/execute`,
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
