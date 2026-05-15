<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

// 导入相关截图
import imgIngestion from '/kmatrix-images/知识库/m_4f7845929889d366c057a65ad6b219a1_r.png';
import imgConfig from '/kmatrix-images/工作流编排/DM_20260226180243_001.png';
import imgSearch from '/kmatrix-images/检索测试/m_2c73cd220018544782ae625d35f11658_r.png';
import imgIntegration from '/kmatrix-images/mcp-market.png';
import imgBrain from '/kmatrix-images/模型管理/m_481e1a27d19c3c3787167eb26ad79a59_r.png';

const { tm, rt } = useI18n();
const visibleItems = ref<Record<number, boolean>>({});
const headerVisible = ref(false);

const images = [imgIngestion, imgConfig, imgSearch, imgIntegration, imgBrain];

const insightsItems = computed(() => {
  return (tm('features.insights.items') as any[]).map((item: any, index: number) => ({
    title: rt(item.title),
    highlights: (item.highlights as any[]).map((h: any) => rt(h)),
    value: rt(item.value),
    image: images[index] || images[0]
  }));
});

const onHeaderVisible = (visible: boolean) => {
  if (visible) headerVisible.value = true;
};

const onItemVisible = (index: number, visible: boolean) => {
  if (visible) {
    visibleItems.value[index] = true;
  }
};

// 指令实现简化 (生产环境建议用 IntersectionObserver 或成熟库)
const vObserveVisibility = {
  mounted(el: HTMLElement, binding: any) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        binding.value(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    (el as any)._observer = observer;
  },
  unmounted(el: HTMLElement) {
    if ((el as any)._observer) (el as any)._observer.disconnect();
  }
};
</script>

<template>
  <section id="feature-insights" class="feature-insights">
    <div class="container">
      <!-- 板块头部 -->
      <div v-observe-visibility="onHeaderVisible" class="section-header" :class="{ 'is-visible': headerVisible }">
        <h2 class="gradient-text font-bold">{{ $t('features.insights.title') }}</h2>
        <p>{{ $t('features.insights.subtitle') }}</p>
      </div>

      <!-- 功能详情项列表 -->
      <div class="insights-list">
        <div
          v-for="(item, index) in insightsItems"
          :key="index"
          v-observe-visibility="visible => onItemVisible(index, visible)"
          class="insight-item"
          :class="{ reverse: index % 2 !== 0, 'is-visible': visibleItems[index] }"
        >
          <!-- 文字内容区 -->
          <div class="insight-content">
            <div class="content-inner">
              <h3 class="item-title">{{ item.title }}</h3>

              <div class="highlight-list">
                <div v-for="(point, pIdx) in item.highlights" :key="pIdx" class="highlight-point">
                  <div class="point-dot"></div>
                  <span>{{ point }}</span>
                </div>
              </div>

              <div class="value-box">
                <p class="value-title">{{ $t('features.highlightsLabel') }}</p>
                <p class="value-text">{{ item.value }}</p>
              </div>
            </div>
          </div>

          <!-- 图片展示区 -->
          <div class="insight-image-wrapper" role="img" :aria-label="item.title">
            <div class="image-glass-card">
              <img :src="item.image" :alt="item.title" class="insight-img" loading="lazy" />
              <div class="image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-insights {
  padding: 100px 0;
  background-color: white;
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.section-header.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 120px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 80px;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.insight-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.insight-item.reverse {
  flex-direction: row-reverse;
}

.insight-content {
  flex: 1;
}

.item-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2rem;
}

.highlight-list {
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.highlight-point {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  color: #5c67f2;
  font-weight: 600;
}

.point-dot {
  width: 6px;
  height: 6px;
  background-color: #5c67f2;
  border-radius: 50%;
}

.value-box {
  padding: 1.5rem;
  background: rgba(92, 103, 242, 0.03);
  border-radius: 16px;
  border-left: 4px solid #5c67f2;
}

.value-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
}

.insight-image-wrapper {
  flex: 1.2;
}

.image-glass-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s ease;
}

.image-glass-card:hover {
  transform: scale(1.02);
}

.insight-img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(92, 103, 242, 0.1), transparent);
  pointer-events: none;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .insight-item,
  .insight-item.reverse {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }

  .highlight-point {
    justify-content: center;
  }

  .value-box {
    text-align: left;
  }

  .title {
    font-size: 2.25rem;
  }

  .item-title {
    font-size: 1.75rem;
  }
}
</style>
