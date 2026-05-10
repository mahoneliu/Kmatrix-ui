import { proxyRequest } from 'h3';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;

  // 获取剩余路径，例如 /public/categories
  const path = event.context.params?.path;

  // 构造目标 URL：backendUrl + /api/blog/ + path
  const targetUrl = `${backendUrl}/api/blog/${path}`;

  console.log(`[Proxy] Forwarding to: ${targetUrl}`);

  return proxyRequest(event, targetUrl, {
    fetchOptions: {
      headers: {
        // 如果有内部鉴权 Key，可以在这里统一注入
        'X-Internal-Key': config.internalApiKey
      }
    }
  });
});
