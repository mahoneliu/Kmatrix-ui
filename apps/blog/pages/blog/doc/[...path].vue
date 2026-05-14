<script setup lang="ts">
/**
 * Git 文件内容页
 *
 * URL 格式：/blog/doc/{categoryPath}/{filePath（无 .md 后缀）}
 * 示例：/blog/doc/kmatrix技术文档/快速开始/快速部署
 *
 * 每篇文章有独立的 path URL，搜索引擎可正常收录，
 * 且 EdgeOne SWR 缓存以完整 path 为键，不存在 query 参数冲突问题。
 */

interface BlogCategory {
  id: number;
  name: string;
  path?: string;
  source?: string;
  articleCount?: number;
  children?: BlogCategory[];
}

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const route = useRoute();
const config = useRuntimeConfig();
const topicSlug = config.public.topicSlug;

/**
 * 彻底 decode 一个可能被多次编码的字符串，直到不再含有 % 编码序列为止。
 * 防御双重编码（%25E5 → %E5 → 中文）。
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

// route.params.path 在不同环境下可能是原始中文、一次编码或双重编码，
// 统一用 fullyDecode 处理到纯中文字符串。
const pathSegments = computed(() => {
  const p = route.params.path;
  const raw = Array.isArray(p) ? p : [p ?? ''];
  return raw.map(fullyDecode).filter(Boolean);
});

// 第一段：分类 path（对应 category.path 去掉前导 /）
const categoryPathSegment = computed(() => pathSegments.value[0] ?? '');

// 其余段：文件路径（重新拼接，加回 .md 后缀）
const filePath = computed(() => {
  const parts = pathSegments.value.slice(1);
  if (parts.length === 0) return '';
  const joined = parts.join('/');
  // 如果已有 .md 后缀则不重复添加
  return joined.endsWith('.md') ? joined : `${joined}.md`;
});

// 加载分类列表，找到对应分类
// 使用与 BlogLayout 相同的 key，Nuxt 会自动复用已有请求结果，不会重复发起网络请求
const { data: categoriesData } = await useFetch<{ code: number; data: BlogCategory[] }>(
  () => {
    const params = new URLSearchParams();
    if (topicSlug) params.set('topicSlug', topicSlug);
    const qs = params.toString();
    const baseUrl = config.public.apiBaseUrl === '/' ? '' : config.public.apiBaseUrl;
    return `${baseUrl}/api/blog/public/categories${qs ? `?${qs}` : ''}`;
  },
  { key: `blog-layout-categories-${topicSlug}` }
);

const allCategories = computed<BlogCategory[]>(() => categoriesData.value?.data ?? []);

function findCategoryByPath(cats: BlogCategory[], targetPath: string): BlogCategory | null {
  const normalized = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  for (const cat of cats) {
    if (cat.path === normalized || cat.path === targetPath) return cat;
    if (cat.children?.length) {
      const found = findCategoryByPath(cat.children, targetPath);
      if (found) return found;
    }
  }
  return null;
}

const currentCategory = computed(() => findCategoryByPath(allCategories.value, categoryPathSegment.value));

// 加载 git 文件内容
const {
  data: gitContentData,
  pending: gitContentPending,
  error: gitContentErrorObj
} = await useAsyncData(
  () => `doc-${categoryPathSegment.value}-${filePath.value}`,
  () => {
    if (!currentCategory.value?.id || !filePath.value) {
      return Promise.resolve(null);
    }
    return $fetch<{ content: string; path: string }>(
      `/api/git-content?categoryId=${currentCategory.value.id}&path=${encodeURIComponent(filePath.value)}`
    );
  },
  { watch: [currentCategory, filePath] }
);

const gitContent = computed(() => gitContentData.value?.content || null);
const gitContentLoading = computed(() => gitContentPending.value);
const gitContentError = computed(() => (gitContentErrorObj.value ? '加载内容失败，请稍后重试' : null));

const tocHeadings = ref<TocHeading[]>([]);

function onTocUpdate(headings: TocHeading[]) {
  tocHeadings.value = headings;
}

// 文章标题：取文件名（去掉 .md 后缀）
const pageTitle = computed(() => {
  const parts = pathSegments.value;
  const last = parts[parts.length - 1] ?? '';
  return last.replace(/\.md$/i, '');
});

// SEO meta
useHead({
  title: computed(() => (pageTitle.value ? `${pageTitle.value} - ${currentCategory.value?.name ?? ''}` : '文档')),
  meta: [{ name: 'description', content: computed(() => `${currentCategory.value?.name ?? ''} - ${pageTitle.value}`) }]
});
</script>

<template>
  <div class="doc-page-wrapper">
    <Suspense>
      <BlogLayout :show-toc="true" :active-category-id="currentCategory?.id" :active-git-file="filePath">
        <template #toc>
          <div class="toc-container">
            <div class="toc-title">本文目录</div>
            <nav v-if="tocHeadings.length > 0">
              <a
                v-for="h in tocHeadings"
                :key="h.id"
                :href="`#${h.id}`"
                class="toc-item"
                :style="{ paddingLeft: `${(h.level - 1) * 0.75}rem` }"
              >
                {{ h.text }}
              </a>
            </nav>
            <div v-else class="toc-empty">暂无目录</div>
          </div>
          <div style="display: none" data-hydration-fix="true"></div>
        </template>

        <template #default>
          <div class="doc-page">
            <div class="page-header">
              <h1 class="page-title">{{ pageTitle }}</h1>
            </div>

            <div v-if="gitContentLoading" class="loading-state">
              <div class="skeleton-title" />
              <div class="skeleton-meta" />
              <div v-for="i in 8" :key="i" class="skeleton-line" />
            </div>

            <div v-else-if="gitContentError" class="error-state">
              <p>{{ gitContentError }}</p>
              <NuxtLink :to="`/blog/category/${categoryPathSegment}`" class="retry-btn">返回分类</NuxtLink>
            </div>

            <div v-else-if="!gitContent && !gitContentLoading" class="error-state">
              <p>文件不存在或无法访问</p>
              <NuxtLink :to="`/blog/category/${categoryPathSegment}`" class="retry-btn">返回分类</NuxtLink>
            </div>

            <BlogMarkdownRenderer v-else-if="gitContent" :content="gitContent" @toc-update="onTocUpdate" />
          </div>
          <div style="display: none" data-hydration-fix="true"></div>
        </template>
      </BlogLayout>
    </Suspense>
  </div>
</template>

<style scoped>
.doc-page {
  min-height: 400px;
}

.page-header {
  margin-bottom: 1.75rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* TOC */
.toc-container {
  font-size: 0.875rem;
}

.toc-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.875rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9375rem;
}

.toc-item {
  display: block;
  padding: 0.375rem 0;
  color: #6b7280;
  text-decoration: none;
  line-height: 1.5;
  transition: color 0.15s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover {
  color: #2563eb;
}

.toc-empty {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 骨架屏 */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  height: 2rem;
  width: 60%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-meta {
  height: 1rem;
  width: 35%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line {
  height: 0.875rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.error-state {
  text-align: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.retry-btn {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.5rem 1.25rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
}
</style>
