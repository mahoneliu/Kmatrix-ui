const ALLOWED_DOMAIN = 'https://raw.githubusercontent.com/';

export default defineEventHandler(async event => {
  const query = getQuery(event);
  const urlParam = query.url as string;

  if (!urlParam) {
    throw createError({ statusCode: 400, message: 'url parameter is required' });
  }

  // URL decode 后校验域名白名单（防 SSRF）
  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(urlParam);
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL encoding' });
  }

  if (!decodedUrl.startsWith(ALLOWED_DOMAIN)) {
    throw createError({ statusCode: 400, message: 'Only raw.githubusercontent.com URLs are allowed' });
  }

  // 代理请求 GitHub 图片
  let response: Response;
  try {
    response = await fetch(decodedUrl, {
      signal: AbortSignal.timeout(10000) // 10s 超时
    });
  } catch {
    throw createError({ statusCode: 502, message: '图片代理请求失败' });
  }

  if (!response.ok) {
    throw createError({ statusCode: 502, message: `上游返回 ${response.status}` });
  }

  // 设置缓存头（EdgeOne CDN 可缓存 24 小时）
  setHeader(event, 'Cache-Control', 'public, max-age=86400');
  setHeader(event, 'Content-Type', response.headers.get('Content-Type') || 'image/jpeg');

  // 返回图片二进制
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
});
