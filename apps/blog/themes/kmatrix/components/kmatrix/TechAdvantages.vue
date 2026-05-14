<script setup lang="ts">
const { tm, rt } = useI18n();

const techStack = computed(() => {
  const raw = tm('tech.stack');
  if (!Array.isArray(raw)) return [];
  return (raw as any[]).map((item: any) => ({
    layer: rt(item.layer),
    items: Array.isArray(item.items) ? (item.items as any[]).map((s: any) => rt(s)) : []
  }));
});

const layerColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];
const layerIcons = [
  // AI 编排层
  'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  // 检索层
  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  // 前端层
  'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  // 基础设施
  'M5 12H3m2 0a9 9 0 1018 0 9 9 0 01-18 0zm7-9v2m0 14v2m7-9h2M3 12h2'
];
</script>

<template>
  <section class="tech-advantages">
    <div class="container">
      <div class="section-header">
        <div class="badge-row">
          <span class="tech-badge">{{ $t('tech.badge') }}</span>
        </div>
        <h2 class="gradient-text font-bold">{{ $t('tech.title') }}</h2>
        <p class="tech-quote">{{ $t('tech.quote') }}</p>
      </div>

      <div class="stack-grid">
        <div
          v-for="(layer, idx) in techStack"
          :key="idx"
          class="stack-card glass"
          :style="{ '--layer-color': layerColors[idx] }"
        >
          <div class="stack-icon-wrap">
            <svg class="stack-icon" viewBox="0 0 24 24" fill="none">
              <path
                :d="layerIcons[idx]"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3 class="layer-name">{{ layer.layer }}</h3>
          <div class="tag-list">
            <span v-for="item in layer.items" :key="item" class="tech-tag">{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- Gitee 评价引用 -->
      <div class="gitee-quote glass">
        <div class="quote-left">
          <div class="gitee-logo-row">
            <svg class="gitee-icon" viewBox="0 0 24 24" fill="#c71d23">
              <path
                d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"
              />
            </svg>
            <span class="gitee-name">Gitee</span>
            <span class="eval-badge">官方 AI 评估</span>
          </div>
          <p class="quote-text">
            "gitee 全面集成代码分析评估功能... 咱们的 KMatrix 知识库，评价还是蛮高的，感谢 gitee 给面子。"
          </p>
        </div>
        <div class="quote-stats">
          <div class="q-stat">
            <span class="q-val">高</span>
            <span class="q-lab">一致性评价</span>
          </div>
          <div class="q-stat">
            <span class="q-val">强</span>
            <span class="q-lab">架构灵活性</span>
          </div>
          <div class="q-stat">
            <span class="q-val">优</span>
            <span class="q-lab">安全性设计</span>
          </div>
        </div>
      </div>

      <div class="gitee-screenshot">
        <img src="/kmatrix-images/技术优势/DM_20260227155130_002.png" alt="Gitee AI 评估截图" loading="lazy" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.tech-advantages {
  padding: 100px 0 80px;
  background: #f8fafc;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.badge-row {
  margin-bottom: 1rem;
}

.tech-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(92, 103, 242, 0.08);
  color: #5c67f2;
  border: 1px solid rgba(92, 103, 242, 0.2);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tech-quote {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.7;
}

/* 技术栈卡片网格 */
.stack-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stack-card {
  padding: 2rem 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid var(--glass-border);
  background: white;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stack-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--layer-color);
  border-radius: 1.25rem 1.25rem 0 0;
}

.stack-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.stack-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(92, 103, 242, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: var(--layer-color);
}

.stack-icon {
  width: 24px;
  height: 24px;
}

.layer-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}

.stack-card:hover .tech-tag {
  background: #ede9fe;
  color: var(--layer-color);
}

/* Gitee 评价引用 */
.gitee-quote {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  padding: 2.5rem 3rem;
  border-radius: 1.5rem;
  border: 1px solid var(--glass-border);
  background: white;
  margin-bottom: 2rem;
}

.gitee-logo-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.gitee-icon {
  width: 24px;
  height: 24px;
}

.gitee-name {
  font-size: 1.125rem;
  font-weight: 800;
  color: #c71d23;
}

.eval-badge {
  padding: 0.2rem 0.625rem;
  background: rgba(199, 29, 35, 0.08);
  color: #c71d23;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.quote-text {
  font-size: 1rem;
  font-style: italic;
  color: var(--muted-foreground);
  line-height: 1.7;
  max-width: 500px;
}

.quote-stats {
  display: flex;
  gap: 3rem;
  flex-shrink: 0;
}

.q-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.q-val {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--primary);
}

.q-lab {
  font-size: 0.8125rem;
  color: var(--muted-foreground);
  white-space: nowrap;
}

/* 截图 */
.gitee-screenshot {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.gitee-screenshot img {
  width: 100%;
  display: block;
}

@media (max-width: 1024px) {
  .stack-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gitee-quote {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }

  .quote-stats {
    gap: 2rem;
  }
}

@media (max-width: 640px) {
  .stack-grid {
    grid-template-columns: 1fr;
  }
}
</style>
