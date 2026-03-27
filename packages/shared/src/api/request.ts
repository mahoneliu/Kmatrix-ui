import { createFlatRequest } from '@sa/axios';

/**
 * 共享请求工具
 * 在不同的应用中，可以通过环境变量配置不同的基准路径
 */
export const baseURL = import.meta.env.VITE_SERVICE_BASE_URL || import.meta.env.VITE_APP_BASE_API || '';

export const request = createFlatRequest(
  {
    baseURL,
    'axios-retry': {
      retries: 0
    }
  },
  {
    transform(response) {
      const data = response.data as any;
      if (data.rows) {
        return data;
      }
      return data.data;
    },
    isBackendSuccess(response) {
      const data = response.data as any;
      return String(data.code) === '200' || String(data.code) === '0000';
    },
    async onBackendFail(_response) {
      // const data = response.data as any;
      // console.error('API Error:', data.msg);
      return null;
    },
    async onRequest(config) {
      const isToken = config.headers?.isToken === false;
      const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || '';
      const token = localStorage.getItem(`${storagePrefix}token`);

      if (token && !isToken && !config.headers.Authorization) {
        const pureToken = token.replace(/^"|"$/g, '');
        Object.assign(config.headers, { Authorization: `Bearer ${pureToken}` });
      }

      const clientId = import.meta.env.VITE_APP_CLIENT_ID;
      if (clientId && !config.headers.Clientid) {
        Object.assign(config.headers, { Clientid: clientId });
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      return config;
    }
  }
);
