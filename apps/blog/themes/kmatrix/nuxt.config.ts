import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const themeDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  css: [resolve(themeDir, './assets/styles/index.css')],

  app: {
    head: {
      script: [
        // 百度统计
        {
          innerHTML: `var _hmt = _hmt || [];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?ee3d97d8161455674179ea0bb632ae66";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`
        },
        // AI 问答
        {
          src: 'http://kmatrix-admin.kykms.cn/chat/loader.js?appToken=fd9c588c97fa404494c436cc0611f104&appId=2031476982285643778',
          async: true,
          defer: true
        }
      ]
    }
  }
});
