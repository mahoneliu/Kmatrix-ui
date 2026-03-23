import { URL, fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

/**
 * Vitest 配置
 * 与 vite.config.ts 保持 alias 一致，共用 Vue 插件。
 * 使用 happy-dom 作为轻量级 DOM 模拟环境。
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    // 使用 happy-dom 模拟 DOM 环境（比 jsdom 更快更轻量）
    environment: 'happy-dom',
    // 全局注入 describe/it/test/expect/vi 等，无需每个文件 import
    globals: true,
    // 测试文件匹配规则
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/*.spec.ts'],
    // 覆盖率报告配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/hooks/**', 'src/components/**']
    }
  }
});
