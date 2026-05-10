import process from 'node:process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const theme = process.env.NUXT_THEME || 'minimal';
// 兼容 EdgeOne：如果填了 / 则转为空字符串，防止拼接出 // 导致浏览器误认为域名
const rawApiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || '';
const API_BASE_URL = rawApiBaseUrl === '/' ? '' : rawApiBaseUrl;
const BACKEND_URL = process.env.BLOG_API_URL || 'http://localhost:8080';
const INTERNAL_API_KEY = process.env.BLOG_INTERNAL_API_KEY || '';

export default defineNuxtConfig({
  extends: [`./themes/${theme}`],

  runtimeConfig: {
    backendUrl: BACKEND_URL,
    internalApiKey: INTERNAL_API_KEY,
    public: {
      apiBaseUrl: API_BASE_URL,
      topicSlug: process.env.NUXT_PUBLIC_TOPIC_SLUG || ''
    }
  },

  nitro: {
    storage: {
      'git-content': {
        driver: 'memory'
      }
    },
    // 代理 /api/blog/* 到后端，解决 Edge One 强制 HTTPS 下的 Mixed Content 问题
    proxy: {
      '/api/blog': {
        target: process.env.BLOG_API_URL || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  vite: {
    // 开发环境代理 /api/blog/* 到本地后端
    server: {
      proxy: {
        '/api/blog': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    langDir: resolve(__dirname, './locales/'),
    vueI18n: resolve(__dirname, './themes/kmatrix/i18n/vue-i18n.config.ts'),
    // 关闭浏览器语言自动检测，避免 SSR 与客户端语言不一致导致 hydration mismatch
    detectBrowserLanguage: false,
    compilation: {
      strictMessage: false,
      escapeHtml: false
    }
  },

  compatibilityDate: '2024-11-01'
});
