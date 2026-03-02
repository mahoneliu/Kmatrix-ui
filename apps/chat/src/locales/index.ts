import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import zhCN from './langs/zh-cn';
import enUS from './langs/en-us';

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

/**
 * Setup i18n
 *
 * @param app
 */
export function setupI18n(app: App) {
  app.use(i18n);
}

export const $t = i18n.global.t;

export function setLocale(locale: string) {
  i18n.global.locale.value = locale as any;
}
