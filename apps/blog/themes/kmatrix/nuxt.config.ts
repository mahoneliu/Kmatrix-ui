import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const themeDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  css: [resolve(themeDir, './assets/styles/index.css')]
});
