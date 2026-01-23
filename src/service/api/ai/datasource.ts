/**
 * 数据源管理 API
 * @author Mahone
 * @date 2026-01-20
 */

import { request } from '@/service/request';

/**
 * 获取数据源列表
 */
export function fetchDataSourceList(params?: any) {
  return request<any[]>({
    url: '/ai/datasource/list',
    method: 'get',
    params
  });
}

/**
 * 获取数据源详情
 */
export function fetchDataSourceDetail(dataSourceId: number) {
  return request<any>({
    url: `/ai/datasource/${dataSourceId}`,
    method: 'get'
  });
}

/**
 * 新增数据源
 */
export function addDataSource(data: any) {
  return request({
    url: '/ai/datasource',
    method: 'post',
    data
  });
}

/**
 * 更新数据源
 */
export function updateDataSource(data: any) {
  return request({
    url: '/ai/datasource',
    method: 'put',
    data
  });
}

/**
 * 删除数据源
 */
export function deleteDataSource(dataSourceIds: number[]) {
  return request({
    url: `/ai/datasource/${dataSourceIds.join(',')}`,
    method: 'delete'
  });
}

/**
 * 测试数据源连接
 */
export function testDataSourceConnection(dataSourceId: number) {
  return request({
    url: `/ai/datasource/test/${dataSourceId}`,
    method: 'post'
  });
}

/**
 * 获取可用的动态数据源列表
 */
export function fetchDynamicDataSourceKeys() {
  return request<string[]>({
    url: '/ai/datasource/dynamic-keys',
    method: 'get'
  });
}

// ========== 元数据管理 API ==========

/**
 * 获取元数据列表
 */
export function fetchMetadataList(dataSourceId: number) {
  return request<any[]>({
    url: '/ai/database-meta/list',
    method: 'get',
    params: { dataSourceId }
  });
}

/**
 * 解析 DDL 并保存元数据
 */
export function parseDdlAndSave(data: { dataSourceId: number; ddlContent: string }) {
  return request({
    url: '/ai/database-meta/parseDdl',
    method: 'post',
    data
  });
}

/**
 * 从数据库同步元数据
 */
export function syncMetadataFromDatabase(dataSourceId: number) {
  return request({
    url: `/ai/database-meta/syncFromDatabase/${dataSourceId}`,
    method: 'post',
    timeout: 600 * 1000
  });
}

/**
 * 删除元数据
 */
export function deleteMetadata(metaIds: number[]) {
  return request({
    url: `/ai/database-meta/${metaIds.join(',')}`,
    method: 'delete'
  });
}
