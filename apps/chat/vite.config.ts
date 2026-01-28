import { URL, fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import UnoCSS from '@unocss/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

export default defineConfig(configEnv => {
  // Load env from apps/chat directory, not root
  const envDir = fileURLToPath(new URL('./', import.meta.url));
  const viteEnv = loadEnv(configEnv.mode, envDir);
  const enableProxy = configEnv.command === 'serve';

  const localIconPath = fileURLToPath(new URL('../../packages/materials/src/assets/svg-icon', import.meta.url));
  const collectionName = (viteEnv.VITE_ICON_LOCAL_PREFIX || 'local-icon').replace(/^icon-/, '');

  return {
    base: viteEnv.VITE_BASE_URL || '/',
    envDir,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@km/shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)),
        '@sa/materials': fileURLToPath(new URL('../../packages/materials/src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' as any
        }
      }
    },
    plugins: [
      vue(),
      UnoCSS({
        configFile: '../../uno.config.ts'
      }),
      Icons({
        compiler: 'vue3',
        scale: 1,
        defaultClass: 'inline-block',
        customCollections: {
          [collectionName]: FileSystemIconLoader(localIconPath, svg =>
            svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
          )
        }
      }),
      Components({
        dts: 'src/typings/components.d.ts',
        resolvers: [
          NaiveUiResolver(),
          IconsResolver({ customCollections: [collectionName], componentPrefix: 'icon' }),
          componentName => {
            if (componentName === 'SvgIcon') {
              return { name: 'SvgIcon', from: '@sa/materials' };
            }
            return null;
          }
        ]
      }),
      createSvgIconsPlugin({
        iconDirs: [localIconPath],
        symbolId: `${viteEnv.VITE_ICON_LOCAL_PREFIX || 'local-icon'}-[dir]-[name]`,
        inject: 'body-last',
        customDomId: '__SVG_ICON_LOCAL__'
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
