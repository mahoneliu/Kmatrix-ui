import process from 'node:process';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  // 优先从环境变量读取，Node.js 运行时最可靠的方式
  const backendUrl = process.env.BLOG_API_URL || config.backendUrl || 'http://localhost:8080';

  const path = event.context.params?.path;
  const targetUrl = `${backendUrl}/api/blog/${path}`;

  // 获取原始请求的查询参数
  const query = getQuery(event);

  // eslint-disable-next-line no-console
  console.log(`[Proxy] SSR/API Fetching: ${targetUrl}`);

  try {
    const response = await $fetch.raw(targetUrl, {
      method: event.method,
      query,
      headers: {
        'X-Internal-Key': config.internalApiKey || process.env.BLOG_INTERNAL_API_KEY || ''
      },
      // 如果是 POST 等请求，透传 body
      body: event.method !== 'GET' && event.method !== 'HEAD' ? await readBody(event) : undefined
    });

    // 将后端的响应头和状态码透传给前端
    setResponseStatus(event, response.status);
    return response._data;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(`[Proxy Error] ${targetUrl}:`, err.message);

    // 构建预渲染阶段（prerender），如果连不上后端（比如 EdgeOne 打包机没配后端地址），
    // 不要抛出 HTTP 错误，而是返回空数据，防止构建直接报错退出
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Nitro auto-injects import.meta.prerender
    // eslint-disable-next-line n/prefer-global/process
    if (import.meta.prerender || process.env.npm_lifecycle_event === 'generate' || process.env.npm_lifecycle_event === 'build') {
      return { code: 502, msg: `Prerender placeholder (backend unreachable: ${err.message})`, data: [] };
    }

    throw createError({
      statusCode: err.response?.status || 502,
      message: `Backend service error: ${err.message}`
    });
  }
});
