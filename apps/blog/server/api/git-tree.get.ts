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
 */
export function buildGitTree(rawTree: RawTreeItem[], rootPath: string | null | undefined): GitTreeNode[] {
  // 规范化 rootPath：去除首尾斜杠，避免 "/admin" 或 "admin/" 导致匹配失败
  const normalizedRoot = rootPath ? rootPath.replace(/^\/+|\/+$/g, '') : '';
  const prefix = normalizedRoot ? `${normalizedRoot}/` : '';
  const nodes: GitTreeNode[] = [];

  for (const item of rawTree) {
    // 子目录过滤
    if (prefix && !item.path.startsWith(prefix)) {
      // skip items outside rootPath
    } else {
      // 截断 rootPath 前缀，得到展示路径
      const displayPath = prefix ? item.path.slice(prefix.length) : item.path;

      // 跳过空路径（rootPath 目录本身）、隐藏文件、非 Markdown blob
      const isHidden = displayPath.startsWith('.');
      const isNonMarkdownBlob = item.type === 'blob' && !isMarkdown(displayPath);

      if (displayPath && !isHidden && !isNonMarkdownBlob) {
        const segments = displayPath.split('/');
        const name = segments[segments.length - 1];
        const depth = segments.length - 1;

        nodes.push({
          path: displayPath,
          type: item.type,
          sha: item.sha,
          size: item.size,
          name,
          depth
        });
      }
    }
  }

  // 目录优先，同级按字母序
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  return nodes;
}

export default defineEventHandler(async event => {
  const query = getQuery(event);
  const categoryId = query.categoryId as string;

  if (!categoryId) {
    throw createError({ statusCode: 400, message: 'categoryId is required' });
  }

  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;

  // 从后端获取 Git 配置（含 token）
  let gitConfig: { token: string; owner: string; repo: string; branch: string; rootPath?: string };
  try {
    const resp = await $fetch<{ code: number; data: typeof gitConfig }>(
      `${backendUrl}/api/blog/public/git/token?categoryId=${categoryId}`,
      {
        headers: { 'X-Internal-Key': config.internalApiKey }
      }
    );
    if (!resp?.data) {
      throw createError({ statusCode: 404, message: '分类不存在或非 GIT 类型' });
    }
    gitConfig = resp.data;
  } catch (err: unknown) {
    const e = err as { statusCode?: number };
    if (e?.statusCode === 403) {
      throw createError({ statusCode: 403, message: '内部服务鉴权失败' });
    }
    if (e?.statusCode === 404) {
      throw createError({ statusCode: 404, message: '分类不存在' });
    }
    throw createError({ statusCode: 502, message: '获取 Git 配置失败' });
  }

  // 调用 GitHub Trees API
  const { owner, repo, branch, token, rootPath } = gitConfig;
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || 'HEAD'}?recursive=1`;

  let treeData: { tree: RawTreeItem[]; truncated?: boolean };
  try {
    treeData = await $fetch<{ tree: RawTreeItem[]; truncated?: boolean }>(treeUrl, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
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

  const result = buildGitTree(treeData.tree, rootPath);
  return result;
});
