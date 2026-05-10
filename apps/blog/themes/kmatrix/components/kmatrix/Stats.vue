<script setup lang="ts">
const { tm, rt } = useI18n();

const statsItems = computed(() =>
  (tm('stats.items') as any[]).map((item: any) => ({
    value: rt(item.value),
    label: rt(item.label)
  }))
);
</script>

<template>
  <section class="stats">
    <div class="stats-container glass container">
      <!-- 使用 ClientOnly 避免 i18n tm() 在 SSR/客户端之间的 hydration mismatch -->
      <ClientOnly>
        <div v-for="(stat, index) in statsItems" :key="index" class="stat-item">
          <div class="stat-value font-bold">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <template #fallback>
          <div v-for="i in 4" :key="i" class="stat-item stat-item--placeholder" />
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
.stats {
  padding: 40px 0;
  margin-top: -60px;
  position: relative;
  z-index: 10;
}
.stats-container {
  display: flex;
  justify-content: space-around;
  padding: 3rem;
  border-radius: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stat-label {
  color: var(--muted-foreground);
  font-weight: 500;
  font-size: 1rem;
}
.stat-item--placeholder {
  min-height: 80px;
  flex: 1;
}
@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }
}
</style>
