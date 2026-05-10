<script setup lang="ts">
interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  categoryPath?: string;
  tags?: string[] | string;
  publishedAt?: string;
  viewCount?: number;
}

interface ArticleListResponse {
  rows: BlogArticle[];
  total: number;
}

const config = useRuntimeConfig();
const topicSlug = config.public.topicSlug;

const pageNum = ref(1);
const pageSize = 12;

const { data, pending, error, refresh } = await useFetch<{ code: number; data: ArticleListResponse }>(() => {
  const params = new URLSearchParams({
    pageNum: String(pageNum.value),
    pageSize: String(pageSize)
  });
  if (topicSlug) params.set('topicSlug', topicSlug);
  const baseUrl = config.public.apiBaseUrl;
  return `${baseUrl}/api/blog/public/articles?${params.toString()}`;
});

const articles = computed(() => data.value?.data?.rows ?? []);
const total = computed(() => data.value?.data?.total ?? 0);

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

async function loadArticles(page: number) {
  pageNum.value = page;
  await refresh();
}
</script>

<template>
  <BlogLayout>
    <div class="home-page">
      <div class="page-header">
        <h1 class="page-title">最新文章</h1>
        <p class="page-subtitle">探索技术前沿，分享工程实践</p>
      </div>

      <!-- 加载中 -->
      <div v-if="pending" class="loading-state">
        <div v-for="i in 6" :key="i" class="article-skeleton" />
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="error-state">
        <p>加载失败，请稍后重试</p>
        <button class="retry-btn" @click="loadArticles(1)">重试</button>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="articles.length > 0" class="article-grid">
        <article v-for="article in articles" :key="article.id" class="article-card">
          <!-- 封面图 -->
          <NuxtLink v-if="article.coverImage" :to="`/blog/article/${article.slug}`" class="card-cover-link">
            <img :src="article.coverImage" :alt="article.title" class="card-cover" loading="lazy" />
          </NuxtLink>

          <div class="card-body">
            <!-- 分类路径 -->
            <div v-if="article.categoryPath" class="card-category">
              {{ article.categoryPath }}
            </div>

            <!-- 标题 -->
            <h2 class="card-title">
              <NuxtLink :to="`/blog/article/${article.slug}`" class="card-title-link">
                {{ article.title }}
              </NuxtLink>
            </h2>

            <!-- 摘要 -->
            <p v-if="article.description" class="card-desc">{{ article.description }}</p>

            <!-- 标签 -->
            <div v-if="parseTags(article).length > 0" class="card-tags">
              <span v-for="tag in parseTags(article).slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <!-- 元信息 -->
            <div class="card-meta">
              <span v-if="article.publishedAt" class="meta-date">
                {{ formatDate(article.publishedAt) }}
              </span>
              <span v-if="article.viewCount" class="meta-views">👁 {{ article.viewCount }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>暂无文章</p>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <button class="page-btn" :disabled="pageNum <= 1" @click="loadArticles(pageNum - 1)">上一页</button>
        <span class="page-info">第 {{ pageNum }} 页 · 共 {{ total }} 篇</span>
        <button class="page-btn" :disabled="pageNum * pageSize >= total" @click="loadArticles(pageNum + 1)">
          下一页
        </button>
      </div>
    </div>
  </BlogLayout>
</template>

<style scoped>
.home-page {
  min-height: 400px;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.loading-state {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.article-skeleton {
  height: 220px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.article-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-cover-link {
  display: block;
  overflow: hidden;
}

.card-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .card-cover {
  transform: scale(1.03);
}

.card-body {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-category {
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.card-title-link {
  color: #111827;
  text-decoration: none;
  transition: color 0.15s;
}

.card-title-link:hover {
  color: #2563eb;
}

.card-desc {
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

.card-tags {
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

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: auto;
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
</style>
