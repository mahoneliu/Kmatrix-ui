<script setup lang="ts">
interface BlogArticle {
  id: number;
  title: string;
  slug: string;
}

interface BlogCategory {
  id: number;
  name: string;
  path?: string;
  source?: string;
  articleCount?: number;
  children?: BlogCategory[];
}

interface GitFileNode {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  depth: number;
  children?: GitFileNode[];
}

const props = defineProps<{
  category: BlogCategory;
  activeCategoryId?: number;
  activeSlug?: string;
  activeGitFile?: string; // 当前选中的 git 文件路径
  depth?: number;
}>();

const emit = defineEmits<{
  selectGitFile: [categoryId: number, filePath: string];
}>();

const config = useRuntimeConfig();
const depth = props.depth ?? 0;
const isOpen = ref(depth < 2);

const isGitCategory = computed(() => props.category.source === 'GIT');

// ===== 普通分类：文章列表 =====
const articles = ref<BlogArticle[]>([]);
const articlesLoaded = ref(false);
const articlesLoading = ref(false);

async function loadArticles() {
  if (isGitCategory.value) return;
  if (articlesLoaded.value || articlesLoading.value) return;
  articlesLoading.value = true;
  try {
    const params = new URLSearchParams({ categoryId: String(props.category.id), pageSize: '50' });
    if (config.public.topicSlug) params.set('topicSlug', config.public.topicSlug);
    const baseUrl = config.public.apiBaseUrl === '/' ? '' : config.public.apiBaseUrl;
    const result = await $fetch<{ code: number; data: { rows: BlogArticle[] } }>(
      `${baseUrl}/api/blog/public/articles?${params.toString()}`
    );
    articles.value = result?.data?.rows ?? [];
    articlesLoaded.value = true;
  } catch {
    // ignore
  } finally {
    articlesLoading.value = false;
  }
}

// ===== GIT 分类：文件树 =====
const gitNodes = ref<GitFileNode[]>([]);
const gitLoaded = ref(false);
const gitLoading = ref(false);
const gitExpandedPaths = ref<Set<string>>(new Set());

async function loadGitTree() {
  if (!isGitCategory.value) return;
  if (gitLoaded.value || gitLoading.value) return;
  gitLoading.value = true;
  try {
    const flat = await $fetch<GitFileNode[]>(`/api/git-tree?categoryId=${props.category.id}`);
    gitNodes.value = buildTree(flat ?? []);
    gitLoaded.value = true;
    // 默认展开第一层目录
    for (const node of gitNodes.value) {
      if (node.type === 'tree') gitExpandedPaths.value.add(node.path);
    }
  } catch {
    // ignore
  } finally {
    gitLoading.value = false;
  }
}

function buildTree(flat: GitFileNode[]): GitFileNode[] {
  const roots: GitFileNode[] = [];
  const map = new Map<string, GitFileNode>();
  for (const n of flat) map.set(n.path, { ...n, children: [] });
  for (const n of flat) {
    const node = map.get(n.path)!;
    const slash = n.path.lastIndexOf('/');
    if (slash === -1) {
      roots.push(node);
    } else {
      const parent = map.get(n.path.slice(0, slash));
      if (parent) parent.children!.push(node);
      else roots.push(node);
    }
  }
  return roots;
}

function toggleGitDir(path: string) {
  if (gitExpandedPaths.value.has(path)) gitExpandedPaths.value.delete(path);
  else gitExpandedPaths.value.add(path);
}

function selectGitFile(filePath: string) {
  emit('selectGitFile', props.category.id, filePath);
}

// ===== 生命周期 =====
onMounted(() => {
  if (isOpen.value) {
    if (isGitCategory.value) loadGitTree();
    else loadArticles();
  }
});

watch(isOpen, open => {
  if (!open) return;
  if (isGitCategory.value) loadGitTree();
  else loadArticles();
});

function toggle(e: MouseEvent) {
  e.stopPropagation();
  isOpen.value = !isOpen.value;
}

function isActiveCategory(cat: BlogCategory): boolean {
  return props.activeCategoryId === cat.id;
}

function isActiveArticle(slug: string): boolean {
  return props.activeSlug === slug;
}

const hasChildren = (cat: BlogCategory) => Boolean(cat.children && cat.children.length > 0);
</script>

<template>
  <li class="category-item">
    <!-- 分类行 -->
    <div
      class="category-row"
      :class="{ active: isActiveCategory(category) }"
      :style="{ paddingLeft: `${depth * 0.875}rem` }"
      @click="toggle"
    >
      <span class="collapse-btn">
        <span class="collapse-icon" :class="{ open: isOpen }">▶</span>
      </span>
      <span class="category-link" :class="{ active: isActiveCategory(category) }" @click.stop="toggle">
        <span class="category-name">{{ category.name }}</span>
        <span v-if="isGitCategory" class="git-badge">⎇</span>
        <span v-else-if="category.articleCount" class="article-count">{{ category.articleCount }}</span>
      </span>
    </div>

    <template v-if="isOpen">
      <!-- 普通分类：子分类 -->
      <ul v-if="hasChildren(category)" class="category-list">
        <BlogSidebarItem
          v-for="child in category.children"
          :key="child.id"
          :category="child"
          :active-category-id="activeCategoryId"
          :active-slug="activeSlug"
          :active-git-file="activeGitFile"
          :depth="depth + 1"
          @select-git-file="(id, path) => emit('selectGitFile', id, path)"
        />
      </ul>

      <!-- 普通分类：文章列表 -->
      <ul v-if="!isGitCategory && articles.length > 0" class="article-list">
        <li
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          :style="{ paddingLeft: `${(depth + 1) * 0.875 + 0.25}rem` }"
        >
          <NuxtLink
            :to="`/blog/article/${article.slug}`"
            class="article-link"
            :class="{ active: isActiveArticle(article.slug) }"
            @click.stop
          >
            <span class="article-dot" />
            <span class="article-title">{{ article.title }}</span>
          </NuxtLink>
        </li>
      </ul>
      <div
        v-else-if="!isGitCategory && articlesLoading"
        class="articles-loading"
        :style="{ paddingLeft: `${(depth + 1) * 0.875 + 0.5}rem` }"
      >
        加载中…
      </div>

      <!-- GIT 分类：文件树 -->
      <template v-if="isGitCategory">
        <div v-if="gitLoading" class="articles-loading" :style="{ paddingLeft: `${(depth + 1) * 0.875 + 0.5}rem` }">
          加载中…
        </div>
        <ul v-else-if="gitNodes.length > 0" class="category-list">
          <BlogSidebarGitNode
            v-for="node in gitNodes"
            :key="node.path"
            :node="node"
            :depth="depth + 1"
            :expanded-paths="gitExpandedPaths"
            :active-file="activeGitFile"
            @toggle="toggleGitDir"
            @select="selectGitFile"
          />
        </ul>
      </template>
    </template>
  </li>
</template>

<style scoped>
.category-list,
.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-item {
  margin: 0;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 4px;
  transition: background 0.15s;
  cursor: pointer;
  user-select: none;
}

.category-row:hover {
  background: #f3f4f6;
}
.category-row.active {
  background: #eff6ff;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  color: #9ca3af;
  font-size: 0.6rem;
  pointer-events: none;
}

.collapse-icon {
  display: inline-block;
  transition: transform 0.2s ease;
}

.collapse-icon.open {
  transform: rotate(90deg);
}

.category-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 0.5rem 0.25rem;
  color: #374151;
  min-width: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
}

.category-link:hover,
.category-link.active {
  color: #2563eb;
}

.category-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.article-count {
  font-size: 0.7rem;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 0 0.4rem;
  margin-left: 0.375rem;
  flex-shrink: 0;
}

.git-badge {
  font-size: 0.75rem;
  color: #7c3aed;
  margin-left: 0.375rem;
  flex-shrink: 0;
}

.article-item {
  margin: 0;
}

.article-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.25rem;
  color: #6b7280;
  text-decoration: none;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
  font-size: 0.875rem;
  line-height: 1.5;
}

.article-link:hover {
  color: #2563eb;
  background: #f0f7ff;
}

.article-link.active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 500;
}

.article-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  opacity: 0.5;
}

.article-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.articles-loading {
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 0.25rem 0;
}
</style>
