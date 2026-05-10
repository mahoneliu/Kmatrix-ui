<script setup lang="ts">
// kmatrix 主题首页
</script>

<template>
  <div class="app-wrapper">
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
@import '../assets/styles/index.css';

.app-wrapper {
  overflow-x: hidden;
  position: relative;
}

main {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
