/**
 * Embed 入口文件
 * 用于第三方应用嵌入对话窗口
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import naive from 'naive-ui';
import EmbedApp from './App.vue';
import '@/styles/css/global.css';

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

const embedParams = getUrlParams();

// 设置主题色 CSS 变量
document.documentElement.style.setProperty('--embed-primary-color', embedParams.primaryColor);

// 创建应用
const app = createApp(EmbedApp);
const pinia = createPinia();

app.use(pinia);
app.use(naive);

// 注入全局配置
app.provide('embedParams', embedParams);

app.mount('#embed-app');
