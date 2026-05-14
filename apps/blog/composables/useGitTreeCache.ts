/**
 * 跨路由共享的 git tree 缓存
 *
 * 使用模块级单例 Map，在整个应用生命周期内持久化。
 * 路由切换导致侧边栏组件重新挂载时，直接从缓存读取 git tree，
 * 不重新发起网络请求，避免目录树闪烁刷新。
 *
 * key: categoryId，value: 已构建好的 GitFileNode 树形数组
 */

interface GitFileNode {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  depth: number;
  children?: GitFileNode[];
}

// 模块级单例，不随组件销毁而重置
const cache = new Map<number, GitFileNode[]>();

export function useGitTreeCache() {
  return cache;
}
