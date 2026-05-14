import process from 'node:process';

// 需要过滤掉的请求头前缀（EdgeOne/SCF 内部头，不应透传给后端）
const BLOCKED_HEADER_PREFIXES = ['x-scf-', 'x-cube-', 'eo-', 'cdn-loop', 'x-tencent-'];

function filterHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (!BLOCKED_HEADER_PREFIXES.some(prefix => lower.startsWith(prefix))) {
      result[key] = value;
    }
  }
  return result;
}

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl || 'http://localhost:8080';

  const path = event.context.params?.path;
  const targetUrl = `${backendUrl}/api/blog/${path}`;
  const query = getQuery(event);
  const filteredHeaders = filterHeaders(getRequestHeaders(event));

  // eslint-disable-next-line no-console
  console.log(`[Proxy] Fetching: ${targetUrl}`);

  try {
    const response = await $fetch.raw(targetUrl, {
      method: event.method,
      query,
      headers: filteredHeaders,
      body: event.method !== 'GET' && event.method !== 'HEAD' ? await readBody(event) : undefined
    });

    setResponseStatus(event, response.status);
    return response._data;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(`[Proxy Error] ${targetUrl}:`, err.message);
    // eslint-disable-next-line no-console
    console.error(
      `[Proxy Error Detail] status=${err.response?.status}, body=`,
      JSON.stringify(err.data ?? err.response?._data ?? null)
    );

    // 构建阶段连不上后端时返回空数据，防止构建报错退出
    if (process.env.npm_lifecycle_event === 'generate' || process.env.npm_lifecycle_event === 'build') {
      return { code: 502, msg: `Prerender placeholder (backend unreachable: ${err.message})`, data: [] };
    }

    throw createError({
      statusCode: err.response?.status || 502,
      message: `Backend service error: ${err.message}`
    });
  }
});
