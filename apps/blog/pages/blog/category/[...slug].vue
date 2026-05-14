<script setup lang="ts">
interface BlogCategory {
  id: number;
  name: string;
  path?: string;
  source?: string;
  articleCount?: number;
  children?: BlogCategory[];
}

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  tags?: string[] | string;
  publishedAt?: string;
  viewCount?: number;
}

interface ArticleListResponse {
  rows: BlogArticle[];
  total: number;
}

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const route = useRoute();
const config = useRuntimeConfig();
const topicSlug = config.public.topicSlug;

// 从路由参数获取分类路径
const categorySlug = computed(() => {
  const p = route.params.slug;
  return Array.isArray(p) ? p.join('/') : (p ?? '');
});

// 当前选中的 git 文件（来自 URL query）
const selectedGitFile = computed(() => route.query.file as string | undefined);

const { data: categoriesData } = await useFetch<{ code: number; data: BlogCategory[] }>(() => {
  const params = new URLSearchParams();
  if (topicSlug) params.set('topicSlug', topicSlug);
  const qs = params.toString();
  const baseUrl = config.public.apiBaseUrl === '/' ? '' : config.public.apiBaseUrl;
  return `${baseUrl}/api/blog/public/categories${qs ? `?${qs}` : ''}`;
});

const categories = computed(() => categoriesData.value?.data ?? []);

function findCategoryBySlug(cats: BlogCategory[], slug: string): BlogCategory | null {
  const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
  for (const cat of cats) {
    if (cat.path === normalizedSlug || cat.path === slug) return cat;
    if (cat.children?.length) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

const currentCategory = computed(() => findCategoryBySlug(categories.value, categorySlug.value));
const isGitCategory = computed(() => currentCategory.value?.source === 'GIT');

// ===== 普通分类：文章列表 =====
const pageNum = ref(1);
const pageSize = 10;

const {
  data: articlesData,
  pending: articlesLoading,
  error: articlesError,
  refresh: refreshArticles
} = await useAsyncData<{ code: number; data: ArticleListResponse }>(
  `articles-${categorySlug.value}-${pageNum.value}`,
  () => {
    if (!currentCategory.value?.id || isGitCategory.value) {
      return Promise.resolve({ code: 200, data: { rows: [], total: 0 } as ArticleListResponse });
    }
    const params = new URLSearchParams({
      categoryId: String(currentCategory.value.id),
      pageNum: String(pageNum.value),
      pageSize: String(pageSize)
    });
    const baseUrl = config.public.apiBaseUrl === '/' ? '' : config.public.apiBaseUrl;
    return $fetch(`${baseUrl}/api/blog/public/articles?${params.toString()}`);
  }
);

const articles = computed(() => articlesData.value?.data?.rows ?? []);
const total = computed(() => articlesData.value?.data?.total ?? 0);

async function loadArticles(page: number) {
  pageNum.value = page;
  await refreshArticles();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function parseTags(article: BlogArticle): string[] {
  if (!article.tags) return [];
  if (Array.isArray(article.tags)) return article.tags;
  try {
    return JSON.parse(article.tags as string);
  } catch {
    return [];
  }
}

// ===== GIT 分类：文件内容 =====
const {
  data: gitContentData,
  pending: gitContentPending,
  error: gitContentErrorObj
} = await useAsyncData(
  'gitContent',
  () => {
    if (!currentCategory.value?.id || !selectedGitFile.value || !isGitCategory.value) {
      return Promise.resolve(null);
    }
    return $fetch<{ content: string; path: string }>(
      `/api/git-content?categoryId=${currentCategory.value.id}&path=${encodeURIComponent(selectedGitFile.value)}`
    );
  },
  { watch: [selectedGitFile, isGitCategory] }
);

const gitContent = computed(() => gitContentData.value?.content || null);
const gitContentLoading = computed(() => gitContentPending.value);
const gitContentError = computed(() => (gitContentErrorObj.value ? '加载内容失败，请稍后重试' : null));
const tocHeadings = ref<TocHeading[]>([]);

// TOC 更新回调
function onTocUpdate(headings: TocHeading[]) {
  tocHeadings.value = headings;
}
</script>

<template>
  <div class="category-page-wrapper">
    <Suspense>
      <BlogLayout :show-toc="isGitCategory && !!selectedGitFile" :active-category-id="currentCategory?.id">
        <template v-if="isGitCategory && selectedGitFile" #toc>
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
          <div class="category-page">
            <div class="page-header">
              <h1 class="page-title">
                {{ selectedGitFile ? selectedGitFile.split('/').pop() : (currentCategory?.name ?? categorySlug) }}
              </h1>
              <p v-if="isGitCategory && !selectedGitFile" class="page-subtitle git-badge">
                <span class="git-icon">⎇</span>
                Git 仓库内容 · 请从左侧目录选择文件
              </p>
            </div>

            <template v-if="isGitCategory">
              <div v-if="!selectedGitFile" class="git-empty-hint">
                <p>← 请从左侧目录树选择一篇文章</p>
              </div>
              <div v-else-if="gitContentLoading" class="loading-state">
                <div class="skeleton-title" />
                <div class="skeleton-meta" />
                <div v-for="i in 8" :key="i" class="skeleton-line" />
              </div>
              <div v-else-if="gitContentError" class="error-state">
                <p>{{ gitContentError }}</p>
                <button class="retry-btn" @click="selectedGitFile && loadGitContent(selectedGitFile)">重试</button>
              </div>
              <BlogMarkdownRenderer v-else-if="gitContent" :content="gitContent" @toc-update="onTocUpdate" />
            </template>

            <template v-else>
              <div v-if="articlesLoading" class="loading-state">
                <div v-for="i in 5" :key="i" class="article-skeleton" />
              </div>
              <div v-else-if="articlesError" class="error-state">
                <p>加载失败</p>
                <button class="retry-btn" @click="loadArticles(pageNum)">重试</button>
              </div>
              <div v-else-if="articles.length > 0" class="article-list">
                <article v-for="article in articles" :key="article.id" class="article-item">
                  <div class="article-content">
                    <h2 class="article-title">
                      <NuxtLink :to="`/blog/article/${article.slug}`" class="article-title-link">
                        {{ article.title }}
                      </NuxtLink>
                    </h2>
                    <p v-if="article.description" class="article-desc">{{ article.description }}</p>
                    <div class="article-footer">
                      <div class="article-tags">
                        <span v-for="tag in parseTags(article).slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
                      </div>
                      <div class="article-meta">
                        <span v-if="article.publishedAt" class="meta-date">{{ formatDate(article.publishedAt) }}</span>
                        <span v-if="article.viewCount" class="meta-views">👁 {{ article.viewCount }}</span>
                      </div>
                    </div>
                  </div>
                  <NuxtLink v-if="article.coverImage" :to="`/blog/article/${article.slug}`" class="article-cover-link">
                    <img :src="article.coverImage" :alt="article.title" class="article-cover" loading="lazy" />
                  </NuxtLink>
                </article>
              </div>
              <div v-else class="empty-state">
                <p>该分类下暂无文章</p>
              </div>
              <div v-if="total > pageSize" class="pagination">
                <button class="page-btn" :disabled="pageNum <= 1" @click="loadArticles(pageNum - 1)">上一页</button>
                <span class="page-info">第 {{ pageNum }} 页 · 共 {{ total }} 篇</span>
                <button class="page-btn" :disabled="pageNum * pageSize >= total" @click="loadArticles(pageNum + 1)">
                  下一页
                </button>
              </div>
            </template>
          </div>
          <div style="display: none" data-hydration-fix="true"></div>
        </template>
      </BlogLayout>
    </Suspense>
  </div>
</template>

<style scoped>
.category-page {
  min-height: 400px;
}

.page-header {
  margin-bottom: 1.75rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.375rem;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.git-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #7c3aed;
}

.git-icon {
  font-size: 1rem;
}

.git-empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
  font-size: 0.9rem;
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

.skeleton-line,
.article-skeleton {
  height: 0.875rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.article-skeleton {
  height: 120px;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: box-shadow 0.2s;
}

.article-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.article-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-title {
  font-size: 1.0625rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.article-title-link {
  color: #111827;
  text-decoration: none;
  transition: color 0.15s;
}

.article-title-link:hover {
  color: #2563eb;
}

.article-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 20px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.article-cover-link {
  flex-shrink: 0;
}

.article-cover {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
}

.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.retry-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1.25rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem 1.25rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .article-item {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 160px;
  }
}
</style>
