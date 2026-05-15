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
  { key: 'navbar-categories' }
);

const topCategories = computed<BlogCategory[]>(() => categoriesData.value?.data ?? []);

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

// 技术文档下拉菜单状态
const docsDropdownOpen = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function openDocsDropdown() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  docsDropdownOpen.value = true;
}

function scheduleCloseDocsDropdown() {
  closeTimer = setTimeout(() => {
    docsDropdownOpen.value = false;
  }, 150);
}
</script>

<template>
  <nav class="navbar" :class="{ scrolled }">
    <div class="nav-content container">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <img src="/favicon.svg" alt="KMatrix Logo" class="logo-img" />
        <span class="gradient-text logo-text">KMatrix</span>
      </NuxtLink>

      <!-- 中间导航链接 -->
      <div class="nav-links-wrapper">
        <div class="nav-links">
          <NuxtLink to="/">{{ $t('nav.home') }}</NuxtLink>
          <NuxtLink to="/comparison">{{ $t('nav.comparison') }}</NuxtLink>
          <NuxtLink to="/about">{{ $t('nav.about') }}</NuxtLink>

          <!-- 技术文档下拉菜单（有分类数据时显示，提供细分导航；无数据时不显示） -->
          <div
            v-if="topCategories.length > 0"
            class="docs-dropdown-wrapper"
            @mouseenter="openDocsDropdown"
            @mouseleave="scheduleCloseDocsDropdown"
          >
            <button class="docs-trigger" :class="{ active: docsDropdownOpen }">
              {{ $t('nav.docs') }}
              <svg class="chevron" :class="{ rotated: docsDropdownOpen }" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <Transition name="dropdown">
              <div
                v-if="docsDropdownOpen"
                class="docs-dropdown"
                @mouseenter="openDocsDropdown"
                @mouseleave="scheduleCloseDocsDropdown"
              >
                <NuxtLink
                  v-for="cat in topCategories"
                  :key="cat.id"
                  :to="`/blog/category${cat.path}`"
                  class="dropdown-item"
                  @click="docsDropdownOpen = false"
                >
                  <span class="dropdown-item-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{{ cat.name }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </div>

        <!-- 右侧图标链接 -->
        <div class="nav-links nav-links-right">
          <a
            href="https://gitee.com/kyxxjs/kmatrix-service"
            target="_blank"
            rel="noopener noreferrer"
            class="icon-link"
            :title="$t('nav.gitee')"
          >
            <!-- Gitee SVG icon -->
            <svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"
              />
            </svg>
            <!-- <span class="icon-label"></span> -->
          </a>
          <a
            href="https://github.com/mahoneliu/KMatrix-service"
            target="_blank"
            rel="noopener noreferrer"
            class="icon-link"
            :title="$t('nav.github')"
          >
            <!-- GitHub SVG icon -->
            <svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            <!-- <span class="icon-label"></span> -->
          </a>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="nav-actions">
        <button class="lang-switch" @click="toggleLanguage">
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
        <a href="http://kmatrix.kykms.cn" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          {{ $t('nav.tryOnline') }}
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

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  width: 29px;
  height: 29px;
  display: block;
  flex-shrink: 0;
}

.logo-text {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 29px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-weight: 700;
}

/* 导航布局 */
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
  align-items: center;
}

.nav-links-right {
  gap: 0.25rem;
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

/* 技术文档下拉 */
.docs-dropdown-wrapper {
  position: relative;
}

.docs-trigger {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: none;
  color: var(--foreground);
  font-weight: 500;
  font-size: 1rem;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.docs-trigger:hover,
.docs-trigger.active {
  color: var(--primary);
}

.chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.docs-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 120px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 0.25rem 0;
  z-index: 100;
}

.dropdown-item {
  display: block;
  padding: 0.375rem 0.875rem;
  text-decoration: none;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 400;
  transition:
    background 0.12s,
    color 0.12s;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: var(--muted);
  color: var(--primary);
}

.dropdown-item-icon {
  display: none;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

/* Gitee / GitHub 图标链接 */
.icon-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}

.icon-link:hover {
  background: var(--muted);
  color: var(--primary);
}

.platform-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.icon-label {
  font-size: 0.875rem;
}

/* 右侧操作区 */
.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
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

/* 固定文档直链 */
.docs-fixed-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

.docs-fixed-link:hover {
  color: var(--primary);
}

.external-icon {
  width: 12px;
  height: 12px;
  opacity: 0.6;
  flex-shrink: 0;
}
</style>
