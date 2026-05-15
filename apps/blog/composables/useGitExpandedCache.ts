/**
 * 跨路由共享的 git 目录展开状态缓存
 *
 * 使用模块级单例 Map，在整个应用生命周期内持久化。
 * 路由切换导致侧边栏组件重新挂载时，直接从缓存恢复展开状态，
 * 避免每次导航后目录树全部收起。
 *
 * key: categoryId，value: 已展开的路径 Set
 */

// 模块级单例，不随组件销毁而重置
const cache = new Map<number, Set<string>>();

export function useGitExpandedCache() {
  return cache;
}
