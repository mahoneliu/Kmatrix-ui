import { createHash } from 'node:crypto';
import { dirname, join, normalize } from 'node:path';

interface ReplaceImagePathsOptions {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  rootPath: string | null | undefined;
}

/**
 * 替换 Markdown 中的相对图片路径为代理 URL
 */
export function replaceImagePaths(markdownContent: string, options: ReplaceImagePathsOptions): string {
  const { owner, repo, branch, filePath, rootPath } = options;
  const fileDir = dirname(filePath) === '.' ? '' : dirname(filePath);

  function buildRawUrl(imgPath: string): string {
    // 绝对 URL 不替换
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }

    // 计算相对路径
    let relativePart = imgPath;
    if (imgPath.startsWith('./')) {
      relativePart = imgPath.slice(2);
    }

    // 拼接绝对路径（含 rootPath）
    let absolutePath: string;
    if (rootPath) {
      absolutePath = normalize(join(rootPath, fileDir, relativePart)).replace(/\\/g, '/');
    } else {
      absolutePath = normalize(join(fileDir, relativePart)).replace(/\\/g, '/');
    }

    // 去除开头的 ./
    absolutePath = absolutePath.replace(/^\.\//, '');

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${absolutePath}`;
    return `/api/proxy-img?url=${encodeURIComponent(rawUrl)}`;
  }

  // 替换 Markdown 图片语法 ![alt](path)
  let result = markdownContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, path) => {
    const newPath = buildRawUrl(path);
    return `![${alt}](${newPath})`;
  });

  // 替换 HTML img 标签 <img src="path" />
  result = result.replace(
    /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/g,
    // eslint-disable-next-line max-params
    (_match, before, src, after) => {
      const newSrc = buildRawUrl(src);
      return `<img ${before}src="${newSrc}"${after}>`;
    }
  );

  return result;
}

export default defineEventHandler(async event => {
  const query = getQuery(event);
  const categoryId = query.categoryId as string;
  const filePath = query.path as string;

  if (!categoryId || !filePath) {
    throw createError({ statusCode: 400, message: 'categoryId and path are required' });
  }

  const config = useRuntimeConfig();
  const backendUrl = config.public.apiBaseUrl;

  // 缓存 key
  const cacheKey = `git-content:${categoryId}:${createHash('md5').update(filePath).digest('hex')}`;
  const storage = useStorage('git-content');

  // 尝试读取缓存
  const cached = await storage.getItem<string>(cacheKey);
  if (cached) {
    setHeader(event, 'X-Cache', 'HIT');
    return { content: cached, path: filePath };
  }

  // 从后端获取 Git 配置
  let gitConfig: { token: string; owner: string; repo: string; branch: string; rootPath?: string };
  try {
    const resp = await $fetch<{ code: number; data: typeof gitConfig }>(
      `${backendUrl}/api/blog/public/git/token?categoryId=${categoryId}`,
      { headers: { 'X-Internal-Key': config.internalApiKey } }
    );
    if (!resp?.data) throw createError({ statusCode: 404, message: '分类不存在' });
    gitConfig = resp.data;
  } catch {
    throw createError({ statusCode: 502, message: '获取 Git 配置失败' });
  }

  const { owner, repo, branch, token, rootPath } = gitConfig;

  // 拼接 rawUrl（含 rootPath，确保无双斜杠）
  const pathParts = [owner, repo, branch || 'main'];
  if (rootPath) pathParts.push(rootPath);
  pathParts.push(filePath);
  const rawUrl = `https://raw.githubusercontent.com/${pathParts.join('/')}`;

  // 获取 Markdown 内容
  let markdownContent: string;
  try {
    markdownContent = await $fetch<string>(rawUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  } catch {
    throw createError({ statusCode: 502, message: '获取 Markdown 内容失败' });
  }

  // 替换图片路径
  const processedContent = replaceImagePaths(markdownContent, {
    owner,
    repo,
    branch: branch || 'main',
    filePath,
    rootPath
  });

  // 写入缓存（TTL 3600s）
  await storage.setItem(cacheKey, processedContent, { ttl: 3600 });
  setHeader(event, 'X-Cache', 'MISS');

  return { content: processedContent, path: filePath };
});
