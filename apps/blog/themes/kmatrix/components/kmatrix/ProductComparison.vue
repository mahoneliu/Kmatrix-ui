<script setup lang="ts">
const { tm, t } = useI18n();

const headers = computed(() => (tm('comparison.headers') as string[]).map((_h, idx) => t(`comparison.headers.${idx}`)));

const items = computed(() =>
  (tm('comparison.items') as any[]).map((item: any, idx: number) => ({
    feature: t(`comparison.items.${idx}.feature`),
    community: item.community === true,
    commercial: item.commercial === true,
    isAdvanced: item.isAdvanced === true
  }))
);
</script>

<template>
  <section class="comparison">
    <div class="container">
      <div class="section-header">
        <h1 class="font-bold">{{ $t('comparison.title') }}</h1>
        <p>{{ $t('comparison.subtitle') }}</p>
      </div>

      <div class="comparison-table-wrapper glass">
        <table class="comparison-table">
          <thead>
            <tr>
              <th v-for="(header, idx) in headers" :key="idx">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in items" :key="index">
              <td class="feature-name">{{ row.feature }}</td>
              <td class="status">
                <span v-if="row.community" class="icon check">✓</span>
                <span v-else class="icon cross">✕</span>
              </td>
              <td class="status">
                <span v-if="row.commercial" class="icon check">✓</span>
                <span v-else class="icon cross">✕</span>
                <span v-if="row.isAdvanced" class="tag">{{ $t('comparison.advanced') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="comparison-footer">
        <p>{{ $t('comparison.footer') }}</p>
        <div class="cta-btns">
          <a
            href="https://gitee.com/kyxxjs/kmatrix-service"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            {{ $t('comparison.downloadCta') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comparison {
  padding: 160px 0 100px;
  background: radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
}
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}
.section-header h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}
.comparison-table-wrapper {
  overflow-x: auto;
  border-radius: 2rem;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}
.comparison-table {
  width: 100%;
  border-collapse: collapse;
}
.comparison-table th,
.comparison-table td {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.comparison-table th {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}
.feature-name {
  text-align: left !important;
  font-weight: 600;
  color: var(--foreground);
}
.icon {
  font-size: 1.5rem;
  font-weight: bold;
}
.check {
  color: #10b981;
}
.cross {
  color: #ef4444;
  opacity: 0.3;
}
.tag {
  background: var(--primary);
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  margin-left: 0.5rem;
  vertical-align: middle;
}
.comparison-footer {
  text-align: center;
  margin-top: 3rem;
}
.comparison-footer p {
  color: var(--muted-foreground);
  font-size: 0.875rem;
  margin-bottom: 2rem;
}
</style>
