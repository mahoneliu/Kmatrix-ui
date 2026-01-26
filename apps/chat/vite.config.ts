import { URL, fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from '@unocss/vite';

export default defineConfig(configEnv => {
  // Load env from apps/chat directory, not root
  const envDir = fileURLToPath(new URL('./', import.meta.url));
  const viteEnv = loadEnv(configEnv.mode, envDir);
  const enableProxy = configEnv.command === 'serve';

  return {
    base: viteEnv.VITE_BASE_URL || '/',
    envDir,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@km/shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    plugins: [
      vue(),
      UnoCSS({
        configFile: '../../uno.config.ts'
      })
    ],
    server: {
      host: '0.0.0.0',
      port: 9528,
      open: true,
      proxy: enableProxy
        ? {
            '/dev-api': {
              target: viteEnv.VITE_SERVICE_BASE_URL || 'http://localhost:8090',
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/dev-api/, '')
            }
          }
        : undefined
    },
    build: {
      outDir: 'dist',
      sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          embed: fileURLToPath(new URL('./embed.html', import.meta.url))
        }
      }
    }
  };
});
