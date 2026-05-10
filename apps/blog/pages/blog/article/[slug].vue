<script setup lang="ts">
interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  coverImage?: string;
  categoryPath?: string;
  categoryId?: number;
  tags?: string[] | string;
  publishedAt?: string;
  viewCount?: number;
  prevArticle?: { slug: string; title: string };
  nextArticle?: { slug: string; title: string };
}

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const config = useRuntimeConfig();

const { data, pending, error } = await useFetch<{ code: number; data: ArticleDetail }>(
  () => `${config.public.apiBaseUrl}/api/blog/public/articles/${slug.value}`
);

const article = computed(() => data.value?.data ?? null);

// TOC 标题列表
const tocHeadings = ref<Array<{ id: string; text: string; level: number }>>([]);

function onTocUpdate(headings: Array<{ id: string; text: string; level: number }>) {
  tocHeadings.value = headings;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function parseTags(tags?: string[] | string): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags as string);
  } catch {
    return [];
  }
}
</script>

<template>
  <div class="article-page-wrapper">
    <Suspense>
      <BlogLayout :show-toc="true" :active-category-id="article?.categoryId" :active-slug="slug">
        <template #toc>
          <div style="display: none" data-hydration-fix="true"></div>
        </template>
        <template #default>
          <div class="article-page">
            <!-- 加载中 -->
            <div v-if="pending" class="loading-state">
              <div class="skeleton-title" />
              <div class="skeleton-meta" />
              <div v-for="i in 8" :key="i" class="skeleton-line" />
            </div>

            <!-- 错误 -->
            <div v-else-if="error" class="error-state">
              <p>加载文章失败</p>
              <NuxtLink to="/blog" class="retry-btn">返回首页</NuxtLink>
            </div>

            <!-- 文章内容 -->
            <template v-else-if="article">
              <!-- 文章头部 -->
              <header class="article-header">
                <div v-if="article.categoryPath" class="article-category">
                  <NuxtLink :to="`/blog/category/${article.categoryPath.replace(/^\//, '')}`" class="category-link">
                    {{ article.categoryPath }}
                  </NuxtLink>
                </div>

                <h1 class="article-title">{{ article.title }}</h1>

                <p v-if="article.description" class="article-desc">{{ article.description }}</p>

                <div class="article-meta">
                  <span v-if="article.publishedAt" class="meta-date">📅 {{ formatDate(article.publishedAt) }}</span>
                  <span v-if="article.viewCount" class="meta-views">👁 {{ article.viewCount }} 次阅读</span>
                </div>

                <div v-if="parseTags(article.tags).length > 0" class="article-tags">
                  <span v-for="tag in parseTags(article.tags)" :key="tag" class="tag">{{ tag }}</span>
                </div>

                <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" class="article-cover" />
              </header>

              <!-- Markdown 内容 -->
              <div class="article-body">
                <BlogMarkdownRenderer v-if="article.content" :content="article.content" @toc-update="onTocUpdate" />
                <div v-else class="no-content">暂无内容</div>
              </div>

              <!-- 上下篇导航 -->
              <nav class="article-nav" aria-label="上下篇导航">
                <NuxtLink
                  v-if="article.prevArticle"
                  :to="`/blog/article/${article.prevArticle.slug}`"
                  class="nav-item nav-prev"
                >
                  <span class="nav-label">← 上一篇</span>
                  <span class="nav-title">{{ article.prevArticle.title }}</span>
                </NuxtLink>
                <div v-else class="nav-item nav-placeholder" />

                <NuxtLink
                  v-if="article.nextArticle"
                  :to="`/blog/article/${article.nextArticle.slug}`"
                  class="nav-item nav-next"
                >
                  <span class="nav-label">下一篇 →</span>
                  <span class="nav-title">{{ article.nextArticle.title }}</span>
                </NuxtLink>
                <div v-else class="nav-item nav-placeholder" />
              </nav>
            </template>

            <!-- 404 -->
            <div v-else class="error-state">
              <p>文章不存在</p>
              <NuxtLink to="/blog" class="retry-btn">返回首页</NuxtLink>
            </div>
          </div>
          <div style="display: none" data-hydration-fix="true"></div>
        </template>
      </BlogLayout>
    </Suspense>
  </div>
</template>

<style scoped>
.article-page {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  height: 2.5rem;
  width: 70%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-meta {
  height: 1rem;
  width: 40%;
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

.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.article-category {
  margin-bottom: 0.75rem;
}

.category-link {
  font-size: 0.8125rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.category-link:hover {
  text-decoration: underline;
}

.article-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.article-desc {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.6;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.8125rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 20px;
  border: 1px solid #bfdbfe;
}

.article-cover {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 1rem;
}

.article-body {
  margin-bottom: 2.5rem;
}

.no-content {
  color: #9ca3af;
  text-align: center;
  padding: 2rem 0;
}

.article-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.nav-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.nav-placeholder {
  background: transparent;
  border-color: transparent;
}

.nav-next {
  text-align: right;
}

.nav-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

@media (max-width: 640px) {
  .article-title {
    font-size: 1.5rem;
  }
  .article-nav {
    grid-template-columns: 1fr;
  }
}
</style>
