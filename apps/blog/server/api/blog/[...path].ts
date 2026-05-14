import process from 'node:process';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl || 'http://localhost:8080';

  const path = event.context.params?.path;
  const targetUrl = `${backendUrl}/api/blog/${path}`;
  const query = getQuery(event);
  const incomingHeaders = getRequestHeaders(event);

  // eslint-disable-next-line no-console
  console.log(`[Proxy] Fetching: ${targetUrl}`);
  // eslint-disable-next-line no-console
  console.log(`[Proxy] Incoming headers:`, JSON.stringify(incomingHeaders));

  try {
    const response = await $fetch.raw(targetUrl, {
      method: event.method,
      query,
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
