<script setup lang="ts">
interface BlogTopic {
  id: number;
  name: string;
  topicSlug?: string;
  path?: string;
}

defineProps<{
  title?: string;
  topics?: BlogTopic[];
}>();

const menuOpen = ref(false);
</script>

<template>
  <header class="blog-header">
    <div class="header-inner">
      <NuxtLink to="/blog" class="logo">
        <span class="logo-icon">📝</span>
        <span class="logo-text">{{ title ?? 'KMatrix 技术博客' }}</span>
      </NuxtLink>
      <nav class="header-nav" :class="{ open: menuOpen }">
        <NuxtLink to="/blog" class="nav-link">首页</NuxtLink>
        <template v-if="topics && topics.length > 0">
          <NuxtLink
            v-for="topic in topics"
            :key="topic.id"
            :to="`/blog/category/${topic.topicSlug ?? topic.path?.replace(/^\//, '')}`"
            class="nav-link topic-link"
          >
            {{ topic.name }}
          </NuxtLink>
        </template>
      </nav>
      <button class="menu-toggle" aria-label="菜单" @click="menuOpen = !menuOpen">
        <span class="menu-icon">{{ menuOpen ? '✕' : '☰' }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.blog-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--foreground);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 1.25rem;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: var(--muted-foreground);
  text-decoration: none;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
}

.nav-link:hover {
  color: var(--foreground);
  background: var(--muted);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--muted-foreground);
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .header-nav {
    display: none;
  }
  .header-nav.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    background: var(--background);
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .menu-toggle {
    display: block;
  }
}
</style>
