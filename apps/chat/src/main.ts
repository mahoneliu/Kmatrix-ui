import { createApp, reactive } from 'vue';
import { createPinia } from 'pinia';
import { setupIconifyOffline } from '@sa/materials';
import App from './App.vue';
import 'virtual:uno.css';
import { useChatAuth } from './composables/useChatAuth';

setupIconifyOffline();

// 解析 URL 参数
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    appToken: params.get('appToken') || '',
    appId: params.get('appId') || '',
    primaryColor: params.get('primaryColor') || '#18a058',
    theme: params.get('theme') || 'light'
  };
}

// 应用初始化
async function initApp() {
  const app = createApp(App);
  const pinia = createPinia();

  // 获取 URL 参数
  const embedParams = reactive(getUrlParams());

  // 如果有 appToken，执行匿名认证
  if (embedParams.appToken) {
    const { initAuth, sessionToken } = useChatAuth();
    const success = await initAuth(embedParams.appToken);
    if (success) {
      // 使用 Session Token 替换 appToken 用于后续 API 调用
      embedParams.appToken = sessionToken.value;
    }
  }

  // 注入嵌入参数
  app.provide('embedParams', embedParams);

  app.use(pinia);
  app.mount('#app');
}

initApp();
