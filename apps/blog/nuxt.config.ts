import process from 'node:process';

const theme = process.env.NUXT_THEME || 'minimal';
// 兼容 EdgeOne：如果填了 / 则转为空字符串，防止拼接出 // 导致浏览器误认为域名
const rawApiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || '';
let API_BASE_URL = rawApiBaseUrl === '/' ? '' : rawApiBaseUrl;

// 生产环境安全兜底：防止本地 localhost 配置被带到线上
if (process.env.NODE_ENV === 'production' && API_BASE_URL.includes('localhost')) {
  API_BASE_URL = '';
}

const BACKEND_URL = process.env.BLOG_API_URL || 'http://localhost:8080';

export default defineNuxtConfig({
  extends: [`./themes/${theme}`],

  runtimeConfig: {
    // 服务端专用，不暴露给浏览器
    backendUrl: BACKEND_URL,
    public: {
      // 浏览器端走相对路径，不需要配置
      apiBaseUrl: API_BASE_URL,
      topicSlug: process.env.NUXT_PUBLIC_TOPIC_SLUG || ''
    }
  },

  nitro: {
    // EdgeOne Node Functions 无状态环境下，memory driver 不跨请求共享。
    // 使用 memory 仅作为单次请求内的临时缓冲，真正的缓存依赖 ISR/SWR 层。
    storage: {
      'git-content': {
        driver: 'memory'
      }
    }
  },

  // ISR/SWR 路由规则：告知 EdgeOne 哪些路由需要动态渲染 + 缓存多久
  routeRules: {
    // 文章详情页：ISR，1小时重新验证
    '/blog/article/**': { swr: 3600 },
    // 博客首页：ISR，1小时重新验证
    '/blog': { swr: 3600 },
    // 分类列表页：ISR，1小时重新验证。
    // 分类页不再承载 git 文件内容（已迁移到 /blog/doc/**），
    // URL 中无 query 参数，SWR 缓存键唯一，可以安全启用缓存。
    '/blog/category/**': { swr: 3600 },
    // Git 文件内容页：CSR 模式。
    // 内容依赖动态 git 数据，URL 含中文路径段，SSR 阶段 route.params 编码状态
    // 与客户端不一致，导致 hydration mismatch。改为 CSR 后由客户端直接渲染，
    // 避免 SSR/客户端状态不一致问题。SEO meta 通过 useHead 在客户端设置。
    '/blog/doc/**': { ssr: false },
    // Server API 路由：纯动态，不缓存（由 git-content 内部缓存控制）
    '/api/**': { cache: false }
  },

  vite: {
    // Vite config if needed
  },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    langDir: 'locales',
    vueI18n: './themes/kmatrix/i18n/vue-i18n.config.ts',
    // 关闭浏览器语言自动检测，避免 SSR 与客户端语言不一致导致 hydration mismatch
    detectBrowserLanguage: false,
    compilation: {
      strictMessage: false,
      escapeHtml: false
    }
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  compatibilityDate: '2024-11-01'
});
