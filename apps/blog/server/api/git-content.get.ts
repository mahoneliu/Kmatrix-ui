import { createHash } from 'node:crypto';
import { dirname, join, normalize } from 'node:path';
import process from 'node:process';

interface ReplaceImagePathsOptions {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  rootPath: string | null | undefined;
  platform?: string; // 'github' | 'gitee'，默认 github
}

/**
 * 替换 Markdown 中的相对图片路径为代理 URL
 */
export function replaceImagePaths(markdownContent: string, options: ReplaceImagePathsOptions): string {
  const { owner, repo, branch, filePath, rootPath, platform } = options;
  const fileDir = dirname(filePath) === '.' ? '' : dirname(filePath);
  const isGitee = platform === 'gitee';

  function resolveAbsolutePath(imgPath: string): string {
    if (imgPath.startsWith('/')) {
      // 绝对路径：相对于仓库根目录
      return imgPath.replace(/^\/+/, '');
    }
    const relativePart = imgPath.startsWith('./') ? imgPath.slice(2) : imgPath;
    // 图片路径相对于 rootPath（文档根目录），不叠加 fileDir
    // 因为文档作者通常以 rootPath 为基准写图片路径，而非以文件所在目录为基准
    const base = rootPath ? normalize(join(rootPath, relativePart)) : normalize(join(fileDir, relativePart));
    return base.replace(/\\/g, '/').replace(/^\.\//, '');
  }

  function buildRawUrl(imgPath: string): string {
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const absolutePath = resolveAbsolutePath(imgPath);
    if (isGitee) {
      return `https://gitee.com/${owner}/${repo}/raw/${branch}/${absolutePath}`;
    }
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${absolutePath}`;
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
  platform?: string; // 'github' | 'gitee'，默认 github
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
  console.log('[git-content] Fetching content from Gitee:', rawUrl);
  return await $fetch<string>(rawUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

function buildFileRawUrl(gitConfig: GitConfig, filePath: string): string {
  const { owner, repo, branch, rootPath, platform } = gitConfig;
  const cleanRootPath = rootPath ? rootPath.replace(/^\/+|\/+$/g, '') : '';
  const cleanFilePath = filePath.replace(/^\/+/, '');
  const fullPath = [cleanRootPath, cleanFilePath]
    .filter(Boolean)
    .join('/')
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  const b = branch || 'master';
  return platform === 'gitee'
    ? `https://gitee.com/${owner}/${repo}/raw/${b}/${fullPath}`
    : `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${fullPath}`;
}

async function fetchAndProcess(gitConfig: GitConfig, filePath: string): Promise<string> {
  const { owner, repo, branch, token, rootPath, platform } = gitConfig;
  const rawUrl = buildFileRawUrl(gitConfig, filePath);
  let markdownContent: string;
  try {
    markdownContent = await fetchMarkdownContent(rawUrl, token);
  } catch (err: any) {
    const platformName = platform === 'gitee' ? 'Gitee' : 'GitHub';
    // eslint-disable-next-line no-console
    console.error(`[git-content] Failed to fetch from ${platformName}:`, err?.message || err, 'URL:', rawUrl);
    throw createError({ statusCode: 502, message: `${platformName} 内容获取失败: ${err?.message || '网络异常'}` });
  }
  return replaceImagePaths(markdownContent, {
    owner,
    repo,
    branch: branch || 'main',
    filePath,
    rootPath,
    platform
  });
}

async function handleGitContent(
  event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => unknown ? E : never
) {
  const query = getQuery(event);
  const categoryId = query.categoryId as string;
  const filePath = query.path as string;

  if (!categoryId || !filePath) {
    throw createError({ statusCode: 400, message: 'categoryId and path are required' });
  }

  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;
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

  let gitConfig: GitConfig;
  try {
    gitConfig = await fetchGitConfig(backendUrl, categoryId);
  } catch (err: any) {
    if (isBuildPhase()) return { content: '', path: '', sha: '' };
    // eslint-disable-next-line no-console
    console.error('[git-content] Failed to fetch token from backend:', err?.message || err);
    throw createError({ statusCode: 502, message: `获取 Git 配置失败: ${err?.message || '后端连接异常'}` });
  }

  const processedContent = await fetchAndProcess(gitConfig, filePath);

  try {
    await storage.setItem(cacheKey, processedContent);
  } catch {
    // storage 写入失败时静默跳过
  }
  setHeader(event, 'X-Cache', 'MISS');
  return { content: processedContent, path: filePath };
}

export default defineEventHandler(event => handleGitContent(event));
