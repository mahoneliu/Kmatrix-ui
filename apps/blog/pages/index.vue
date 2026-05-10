<script setup lang="ts">
// 显式定义根路径页面，防止 Nuxt 或托管环境因找不到页面而自动跳转到 /blog
</script>

<template>
  <!-- 直接渲染主题定义的首页内容 -->
  <div class="root-page">
    <KmatrixNavbar />
    <main>
      <KmatrixHero />
      <KmatrixStats />
      <KmatrixFeatures />
      <KmatrixCoreFeatures />
      <KmatrixFeatureInsights />
      <KmatrixTechAdvantages />
    </main>
    <KmatrixFooter />
  </div>
</template>

<style>
@import '../themes/kmatrix/assets/styles/index.css';

.root-page {
  overflow-x: hidden;
  position: relative;
}
</style>
