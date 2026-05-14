import process from 'node:process';

interface RawTreeItem {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
}

export interface GitTreeNode {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  name: string;
  depth: number;
}

function isMarkdown(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.mdx') || lower.endsWith('.markdown');
}

/**
 * 构建 Git 目录树（过滤非 .md 文件和隐藏文件，截断 rootPath 前缀）
 * GitHub API 对含中文的路径会返回 URL 编码字符串，这里统一 decode 为可读字符。
 */
export function buildGitTree(rawTree: RawTreeItem[], rootPath: string | null | undefined): GitTreeNode[] {
  // rootPath 也可能含编码字符，统一 decode
  let decodedRoot = rootPath ?? '';
  try {
    decodedRoot = decodeURIComponent(decodedRoot);
  } catch {
    // keep as-is
  }
  const normalizedRoot = decodedRoot ? decodedRoot.replace(/^\/+|\/+$/g, '') : '';
  const prefix = normalizedRoot ? `${normalizedRoot}/` : '';
  const nodes: GitTreeNode[] = [];

  for (const item of rawTree) {
    // GitHub API 对中文路径返回 URL 编码字符串，统一 decode
    let rawPath: string;
    try {
      rawPath = decodeURIComponent(item.path);
    } catch {
      rawPath = item.path;
    }

    if (prefix && !rawPath.startsWith(prefix)) {
      // skip items outside rootPath
    } else {
      const displayPath = prefix ? rawPath.slice(prefix.length) : rawPath;
      const isHidden = displayPath.startsWith('.');
      const isNonMarkdownBlob = item.type === 'blob' && !isMarkdown(displayPath);

      if (displayPath && !isHidden && !isNonMarkdownBlob) {
        const segments = displayPath.split('/');
        nodes.push({
          path: displayPath,
          type: item.type,
          sha: item.sha,
          size: item.size,
          name: segments[segments.length - 1],
          depth: segments.length - 1
        });
      }
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  return nodes;
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
  const resp = await $fetch<{ code: number; data: GitConfig }>(
    `${backendUrl}/api/blog/public/git/token?categoryId=${categoryId}`
  );
  if (!resp?.data) {
    throw createError({ statusCode: 404, message: '分类不存在或非 GIT 类型' });
  }
  return resp.data;
}

interface FetchTreeOptions {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

async function fetchGitTree({ owner, repo, branch, token }: FetchTreeOptions) {
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || 'HEAD'}?recursive=1`;
  return await $fetch<{ tree: RawTreeItem[]; truncated?: boolean }>(treeUrl, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
}

export default defineEventHandler(async event => {
  const query = getQuery(event);
  const categoryId = query.categoryId as string;

  if (!categoryId) {
    throw createError({ statusCode: 400, message: 'categoryId is required' });
  }

  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;

  let gitConfig: GitConfig;
  try {
    gitConfig = await fetchGitConfig(backendUrl, categoryId);
  } catch (err: unknown) {
    const e = err as { statusCode?: number };
    if (e?.statusCode === 403) throw createError({ statusCode: 403, message: '内部服务鉴权失败' });
    if (e?.statusCode === 404) throw createError({ statusCode: 404, message: '分类不存在' });
    if (isBuildPhase()) return [];
    throw createError({ statusCode: 502, message: '获取 Git 配置失败' });
  }

  const { owner, repo, branch, token, rootPath } = gitConfig;

  let treeData: { tree: RawTreeItem[]; truncated?: boolean };
  try {
    treeData = await fetchGitTree({ owner, repo, branch, token });
  } catch (err: unknown) {
    const e = err as { status?: number; statusCode?: number };
    const status = e?.status || e?.statusCode;
    if (status === 401) throw createError({ statusCode: 502, message: 'GitHub Token 无效或已过期' });
    if (status === 404) throw createError({ statusCode: 404, message: '仓库不存在或无访问权限' });
    if (status === 403 || status === 429) {
      throw createError({ statusCode: 503, message: 'GitHub API rate limit exceeded', data: { retryAfter: 60 } });
    }
    throw createError({ statusCode: 502, message: 'GitHub API 调用失败' });
  }

  return buildGitTree(treeData.tree, rootPath);
});
