<script setup lang="ts">
interface BlogCategory {
  id: number;
  name: string;
  path?: string;
  source?: string;
  articleCount?: number;
  children?: BlogCategory[];
}

defineProps<{
  categories: BlogCategory[];
  sidebarTitle?: string;
  activeSlug?: string;
  activeCategoryId?: number;
  activeGitFile?: string;
}>();

const emit = defineEmits<{
  selectGitFile: [categoryId: number, filePath: string];
}>();
</script>

<template>
  <nav class="blog-sidebar-nav" aria-label="文章分类">
    <div class="sidebar-title">{{ sidebarTitle || '分类目录' }}</div>
    <ul v-if="categories.length > 0" class="category-list">
      <template v-for="cat in categories" :key="cat.id">
        <!-- GIT 类型：直接展示文件树，跳过顶层节点行 -->
        <BlogSidebarGitRoot
          v-if="cat.source === 'GIT'"
          :category-id="cat.id"
          :active-git-file="activeGitFile"
          @select-git-file="(id, path) => emit('selectGitFile', id, path)"
        />
        <!-- 普通分类：正常渲染 -->
        <BlogSidebarItem
          v-else
          :category="cat"
          :active-category-id="activeCategoryId"
          :active-slug="activeSlug"
          :active-git-file="activeGitFile"
          :depth="0"
          @select-git-file="(id, path) => emit('selectGitFile', id, path)"
        />
      </template>
    </ul>
    <div v-else class="empty-tip">暂无分类</div>
  </nav>
</template>

<style scoped>
.blog-sidebar-nav {
  font-size: 0.9375rem;
}

.sidebar-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1rem;
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.empty-tip {
  color: #9ca3af;
  font-size: 0.8rem;
  text-align: center;
  padding: 1rem 0;
}
</style>
