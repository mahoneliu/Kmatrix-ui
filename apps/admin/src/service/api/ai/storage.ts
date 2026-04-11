/**
 * AI 统一文件存储 API
 * @author Mahone
 * @date 2026-04-11
 */

import { request } from '@/service/request';

/** 文件上传结果 */
export interface AiFileUploadResult {
  /** 文件访问 URL（OSS 直链或本地预览路由） */
  url: string;
  /** 文件相对路径（本地存储场景下为相对路径） */
  filePath: string;
  /** 原始文件名 */
  originalFilename: string;
  /** 文件扩展名 */
  fileExtension: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 存储类型：1-OSS，2-本地存储 */
  storeType: number;
  /** OSS 文件 ID（仅 OSS 存储时有值） */
  ossId?: string;
}

/**
 * 上传文件至 AI 统一存储模块
 * 根据后端配置自动路由到 OSS 或本地磁盘存储
 *
 * @param file 要上传的文件
 */
export function fetchAiUploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<AiFileUploadResult>({
    url: '/ai/storage/file/upload',
    method: 'post',
    data: formData,
    headers: {
      repeatSubmit: false
    }
  });
}
