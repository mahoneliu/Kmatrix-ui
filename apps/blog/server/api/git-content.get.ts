import { createHash } from 'node:crypto';
import { dirname, join, normalize } from 'node:path';
import process from 'node:process';

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
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }

    const relativePart = imgPath.startsWith('./') ? imgPath.slice(2) : imgPath;

    let absolutePath: string;
    if (rootPath) {
      absolutePath = normalize(join(rootPath, fileDir, relativePart)).replace(/\\/g, '/');
    } else {
      absolutePath = normalize(join(fileDir, relativePart)).replace(/\\/g, '/');
    }

    absolutePath = absolutePath.replace(/^\.\//, '');

    // 使用 gitmirror 镜像直接返回图片 URL，避免 EdgeOne Node Function 无法访问 GitHub
    return `https://raw.gitmirror.com/${owner}/${repo}/${branch}/${absolutePath}`;
  }

  let result = markdownContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, path) => {
    return `![${alt}](${buildRawUrl(path)})`;
  });

  result = result.replace(
    /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/g,
    // eslint-disable-next-line max-params
    (_match, before, src, after) => `<img ${before}src="${buildRawUrl(src)}"${after}>`
  );

  return result;
}

interface GitConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  rootPath?: string;
}

function isBuildPhase(): boolean {
  const event = process.env.npm_lifecycle_event;
  return event === 'generate' || event === 'build';
}

async function fetchGitConfig(backendUrl: string, categoryId: string): Promise<GitConfig> {
  const tokenUrl = `${backendUrl}/api/blog/public/git/token?categoryId=${categoryId}`;
  // eslint-disable-next-line no-console
  console.log('[git-content] Fetching token from:', tokenUrl);
  const resp = await $fetch<{ code: number; data: GitConfig }>(tokenUrl);
  if (!resp?.data) throw createError({ statusCode: 404, message: '分类不存在' });
  return resp.data;
}

async function fetchMarkdownContent(rawUrl: string, token: string): Promise<string> {
  // eslint-disable-next-line no-console
  console.log('[git-content] Fetching content from GitHub:', rawUrl);
  return await $fetch<string>(rawUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export default defineEventHandler(async event => {
  const query = getQuery(event);
  const categoryId = query.categoryId as string;
  const filePath = query.path as string;

  if (!categoryId || !filePath) {
    throw createError({ statusCode: 400, message: 'categoryId and path are required' });
  }

  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;

  // 缓存 key（仅作为同一实例内的短路优化，EdgeOne 无状态环境下不跨请求共享）
  const cacheKey = `git-content:${categoryId}:${createHash('md5').update(filePath).digest('hex')}`;
  const storage = useStorage('git-content');

  try {
    const cached = await storage.getItem<string>(cacheKey);
    if (cached) {
      setHeader(event, 'X-Cache', 'HIT');
      return { content: cached, path: filePath };
    }
  } catch {
    // storage 不可用时静默跳过
  }

  // 从后端获取 Git 配置
  let gitConfig: GitConfig;
  try {
    gitConfig = await fetchGitConfig(backendUrl, categoryId);
  } catch (err: any) {
    if (isBuildPhase()) {
      return { content: '', path: '', sha: '' };
    }
    // eslint-disable-next-line no-console
    console.error('[git-content] Failed to fetch token from backend:', err?.message || err);
    throw createError({ statusCode: 502, message: `获取 Git 配置失败: ${err?.message || '后端连接异常'}` });
  }

  const { owner, repo, branch, token, rootPath } = gitConfig;

  // 对路径每段编码，防止中文导致 fetch failed
  const cleanRootPath = rootPath ? rootPath.replace(/^\/+|\/+$/g, '') : '';
  const cleanFilePath = filePath.replace(/^\/+/, '');
  const fullPath = [cleanRootPath, cleanFilePath]
    .filter(Boolean)
    .join('/')
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'master'}/${fullPath}`;

  let markdownContent: string;
  try {
    markdownContent = await fetchMarkdownContent(rawUrl, token);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[git-content] Failed to fetch from GitHub:', err?.message || err, 'URL:', rawUrl);
    throw createError({ statusCode: 502, message: `GitHub 内容获取失败: ${err?.message || '网络异常'}` });
  }

  const processedContent = replaceImagePaths(markdownContent, {
    owner,
    repo,
    branch: branch || 'main',
    filePath,
    rootPath
  });

  try {
    await storage.setItem(cacheKey, processedContent);
  } catch {
    // storage 写入失败时静默跳过
  }
  setHeader(event, 'X-Cache', 'MISS');

  return { content: processedContent, path: filePath };
});
