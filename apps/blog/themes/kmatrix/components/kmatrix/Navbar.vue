<script setup lang="ts">
interface BlogCategory {
  id: number;
  name: string;
  path?: string;
  children?: BlogCategory[];
}

const { locale } = useI18n();
const config = useRuntimeConfig();

const toggleLanguage = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
};

// 加载顶层分类（parentId=0 的节点，即树的根节点）
const { data: categoriesData, refresh } = await useFetch<{ code: number; data: BlogCategory[] }>(
  () => {
    const params = new URLSearchParams();
    if (config.public.topicSlug) params.set('topicSlug', config.public.topicSlug);
    const qs = params.toString();
    const baseUrl = config.public.apiBaseUrl === '/' ? '' : config.public.apiBaseUrl;
    return `${baseUrl}/api/blog/public/categories${qs ? `?${qs}` : ''}`;
  },
  {
    // 设置一个唯一的 Key 防止冲突
    key: 'navbar-categories'
  }
);

const topCategories = computed<BlogCategory[]>(() => categoriesData.value?.data ?? []);

// 客户端兜底：如果 SSR 没拿到数据，在浏览器端再试一次
onMounted(() => {
  if (topCategories.value.length === 0) {
    // eslint-disable-next-line no-console
    console.log('[Navbar] SSR data empty, retrying on client...');
    refresh();
  }
});

// 滚动后加深 navbar 背景
const scrolled = ref(false);
onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 10;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', onScroll));
});
</script>

<template>
  <nav class="navbar" :class="{ scrolled }">
    <div class="nav-content container">
      <NuxtLink to="/" class="logo">
        <img src="/favicon.svg" alt="Logo" style="width: 32px; height: 32px" />
        <span class="gradient-text logo-text">KMatrix</span>
      </NuxtLink>
      <div class="nav-links-wrapper">
        <div class="nav-links">
          <NuxtLink to="/">{{ $t('nav.home') }}</NuxtLink>
          <NuxtLink to="/comparison">{{ $t('nav.comparison') }}</NuxtLink>
          <NuxtLink to="/about">{{ $t('nav.about') }}</NuxtLink>
        </div>
        <div class="nav-links nav-links-right">
          <NuxtLink v-for="cat in topCategories" :key="cat.id" :to="`/blog/category${cat.path}`">
            {{ cat.name }}
          </NuxtLink>
          <a href="https://gitee.com/kyxxjs/kmatrix-service" target="_blank" rel="noopener noreferrer">
            {{ $t('nav.gitee') }}
          </a>
          <a href="https://github.com/mahoneliu/KMatrix-service" target="_blank" rel="noopener noreferrer">
            {{ $t('nav.github') }}
          </a>
        </div>
      </div>
      <div class="nav-actions">
        <button class="lang-switch" @click="toggleLanguage">
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
        <a href="http://kmatrix.kykms.cn" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          {{ $t('nav.tryOnline') }}
        </a>
        <a
          href="https://gitee.com/kyxxjs/kmatrix-service"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary btn-sm"
        >
          {{ $t('nav.startNow') }}
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1000;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  box-shadow: none;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.92);
  border-bottom-color: var(--border);
  box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.06);
}

@media (prefers-color-scheme: dark) {
  .navbar {
    background: rgba(2, 6, 23, 0.6);
  }
  .navbar.scrolled {
    background: rgba(2, 6, 23, 0.92);
  }
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-decoration: none;
}
.logo-text {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  font-weight: 700;
}
.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}
.nav-links-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
  margin: 0 2rem;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
}
.nav-links-right {
  gap: 1.5rem;
}
.nav-links a {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  text-decoration: none;
  color: var(--foreground);
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: var(--primary);
}
.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.lang-switch {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--foreground);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
}
.lang-switch:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
@media (max-width: 768px) {
  .nav-links-wrapper {
    display: none;
  }
}
</style>
