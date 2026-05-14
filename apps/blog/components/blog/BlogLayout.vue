<script setup lang="ts">
interface BlogCategory {
  id: number;
  name: string;
  path?: string;
  source?: string;
  articleCount?: number;
  children?: BlogCategory[];
}

const props = withDefaults(
  defineProps<{
    showToc?: boolean;
    activeSlug?: string;
    activeCategoryId?: number;
    activeGitFile?: string; // doc 页面直接传入，避免从路由重复解析
  }>(),
  {
    showToc: false,
    activeSlug: undefined,
    activeCategoryId: undefined,
    activeGitFile: undefined
  }
);

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const topicSlug = config.public.topicSlug;

// 跨路由共享的 git tree 缓存，key 为 categoryId。
// 使用模块级单例（useGitTreeCache），不随 BlogLayout 重新挂载而重置。
// 当侧边栏组件（BlogSidebarGitRoot/BlogSidebarItem）重新挂载时，
// 直接从缓存读取 git tree，不重新发起网络请求，避免目录树闪烁刷新。
provide('gitTreeCache', useGitTreeCache());

const currentSlug = computed(() => {
  if (props.activeSlug) return props.activeSlug;
  const slug = route.params.slug;
  return Array.isArray(slug) ? slug.join('/') : ((slug as string) ?? '');
});

// 当前选中的 git 文件：
// - /blog/doc/... 页面：由 prop 传入（从 path 参数解析）
// - 旧的 /blog/category/...?file=... 路由：从 query 读取（兼容过渡期）
const activeGitFile = computed(() => props.activeGitFile ?? (route.query.file as string | undefined));

/**
 * 彻底 decode 可能被多次编码的字符串（防御双重编码 %25E5 → %E5 → 中文）
 */
function fullyDecode(s: string): string {
  let prev = s;
  for (let i = 0; i < 5; i += 1) {
    try {
      const next = decodeURIComponent(prev);
      if (next === prev) break;
      prev = next;
    } catch {
      break;
    }
  }
  return prev;
}

// 从路由中解析当前顶层 category path（第一段），兼容三种路由：
//   /blog/category/docs/sub  → /docs
//   /blog/doc/docs/文件路径   → /docs
//   /blog/article/slug       → null（由 activeCategoryId 处理）
// route.params 在不同环境可能含单次或双重编码，用 fullyDecode 统一处理。
const topCategoryPath = computed(() => {
  // doc 页面
  const docPath = route.params.path;
  if (docPath) {
    const first = Array.isArray(docPath) ? docPath[0] : docPath;
    if (first) return `/${fullyDecode(first)}`;
    return null;
  }
  // category 页面
  const slug = currentSlug.value;
  if (!slug) return null;
  const normalized = slug.startsWith('/') ? slug : `/${slug}`;
  const parts = normalized.split('/').filter(Boolean);
  return parts.length > 0 ? `/${fullyDecode(parts[0])}` : null;
});

// 加载所有顶层分类（树形结构，根节点即顶层）
const { data: allCategoriesData } = await useFetch<{ code: number; data: BlogCategory[] }>(() => {
  const params = new URLSearchParams();
  if (topicSlug) params.set('topicSlug', topicSlug);
  const qs = params.toString();
  const baseUrl = config.public.apiBaseUrl === '/' ? '' : config.public.apiBaseUrl;
  return `${baseUrl}/api/blog/public/categories${qs ? `?${qs}` : ''}`;
});

const allCategories = computed<BlogCategory[]>(() => allCategoriesData.value?.data ?? []);

// 找到当前顶层 category 节点
const currentTopCategory = computed<BlogCategory | null>(() => {
  const path = topCategoryPath.value;
  if (!path) return null;
  return allCategories.value.find(cat => cat.path === path) ?? null;
});

// 侧边栏展示的分类：
// - 普通顶层节点：展示其子节点
// - GIT 类型顶层节点：展示节点本身（由 BlogSidebarItem 内部加载 git 文件树）
// - 未匹配到顶层：展示所有顶层分类
const sidebarCategories = computed<BlogCategory[]>(() => {
  const top = currentTopCategory.value;
  if (top) {
    if (top.source === 'GIT') {
      // GIT 节点本身就是叶子，展示它自己让 BlogSidebarItem 加载文件树
      return [top];
    }
    return top.children ?? [];
  }
  // 未匹配到顶层时，展示所有
  return allCategories.value;
});

// 侧边栏标题：当前顶层 category 名称，或默认"分类目录"
const sidebarTitle = computed<string>(() => {
  return currentTopCategory.value?.name ?? '';
});

// 点击 git 文件：跳转到 /blog/doc/{categoryPath}/{filePath（去掉 .md 后缀）}
function onSelectGitFile(categoryId: number, filePath: string) {
  function findCatPath(cats: BlogCategory[], id: number): string | null {
    for (const c of cats) {
      if (c.id === id) return c.path ?? null;
      if (c.children?.length) {
        const found = findCatPath(c.children, id);
        if (found) return found;
      }
    }
    return null;
  }
  const catPath = findCatPath(allCategories.value, categoryId);
  if (!catPath) return;

  // 彻底 decode 到纯中文，确保不含任何 % 编码字符
  const catSegment = fullyDecode(catPath.replace(/^\//, ''));
  const fileSegment = fullyDecode(filePath).replace(/\.md$/i, '');

  // 用具名路由 + params 数组形式跳转，Vue Router 不会对 params 做额外编码，
  // 避免中文路径被双重编码（字符串拼接形式会触发 Vue Router 的 path 编码）
  const pathParams = [catSegment, ...fileSegment.split('/')];
  router.push({ name: 'blog-doc-path', params: { path: pathParams } });
}

// 是否显示 TOC（文章详情页 或 git 文件已选中）
const shouldShowToc = computed(() => props.showToc || Boolean(activeGitFile.value));
</script>

<template>
  <div class="blog-layout">
    <KmatrixNavbar />
    <div class="blog-body" :class="{ 'has-toc': shouldShowToc }">
      <aside class="blog-sidebar">
        <BlogSidebar
          :categories="sidebarCategories"
          :sidebar-title="sidebarTitle"
          :active-slug="currentSlug"
          :active-category-id="activeCategoryId"
          :active-git-file="activeGitFile"
          @select-git-file="onSelectGitFile"
        />
      </aside>
      <main class="blog-main">
        <slot />
      </main>
      <aside class="blog-toc" :style="{ display: shouldShowToc ? '' : 'none' }">
        <slot name="toc" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.blog-layout {
  min-height: 100vh;
  background: var(--background);
}

.blog-body {
  max-width: 1600px;
  margin: 0 auto;
  /* 顶部留出 KmatrixNavbar 的高度 70px */
  padding-top: 70px;
  display: grid;
  /* 始终三列，TOC 列隐藏时宽度折叠为 0，避免 SSR hydration mismatch */
  grid-template-columns: 308px 1fr 0;
  align-items: start;
  min-height: calc(100vh - 70px);
}

.blog-body.has-toc {
  grid-template-columns: 308px 1fr 260px;
}

.blog-sidebar {
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 1.5rem 1rem 1.5rem 1.5rem;
  border-right: 1px solid var(--border);
  background: var(--muted);
}

.blog-main {
  min-width: 0;
  padding: 2rem 2.5rem;
}

.blog-toc {
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 1.5rem 1.5rem 1rem;
  border-left: 1px solid var(--border);
  background: var(--muted);
  /* 宽度为 0 时隐藏边框，避免残留线条 */
  transition: none;
}

/* TOC 列有宽度时才显示边框 */
.blog-body.has-toc .blog-toc {
  border-left: 1px solid var(--border);
}

.blog-body:not(.has-toc) .blog-toc {
  border-left: none;
  padding: 0;
}

@media (max-width: 1024px) {
  .blog-body {
    grid-template-columns: 1fr;
  }
  .blog-sidebar {
    display: none;
  }
  .blog-toc {
    display: none;
  }
}
</style>
