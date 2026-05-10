<script setup lang="ts">
const { tm, rt } = useI18n();

const techStats = computed(() =>
  (tm('tech.stats') as any[]).map((item: any) => ({
    val: rt(item.val),
    lab: rt(item.lab)
  }))
);
</script>

<template>
  <section class="tech-advantages">
    <div class="glass container">
      <div class="content">
        <div class="eval-header">
          <div class="gitee-logo">Gitee</div>
          <span class="badge">{{ $t('tech.badge') }}</span>
        </div>
        <h2 class="font-bold">{{ $t('tech.title') }}</h2>
        <p class="quote">
          {{ $t('tech.quote') }}
        </p>
        <div class="stats-mini">
          <div v-for="(stat, index) in techStats" :key="index" class="stat">
            <span class="val">{{ stat.val }}</span>
            <span class="lab">{{ stat.lab }}</span>
          </div>
        </div>
        <div>
          <img src="/kmatrix-images/技术优势/DM_20260227155130_002.png" :alt="$t('tech.badge')" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tech-advantages {
  padding: 80px 0;
}
.container {
  padding: 4rem;
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.content {
  max-width: 800px;
  text-align: center;
}
.eval-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.gitee-logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #c71d23; /* Gitee Redish */
}
.badge {
  padding: 0.25rem 0.75rem;
  background: rgba(199, 29, 35, 0.1);
  color: #c71d23;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}
h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}
.quote {
  font-size: 1.25rem;
  font-style: italic;
  color: var(--muted-foreground);
  margin-bottom: 3rem;
  line-height: 1.8;
}
.stats-mini {
  display: flex;
  justify-content: center;
  gap: 4rem;
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat .val {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}
.stat .lab {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
@media (max-width: 768px) {
  .stats-mini {
    gap: 2rem;
  }
  h2 {
    font-size: 2rem;
  }
}
</style>
