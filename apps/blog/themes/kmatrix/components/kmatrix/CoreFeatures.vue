<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import imgIntelligentCustomerService from '/kmatrix-images/Intelligent Customer Service.png';
import imgIntelligentSmartOfficeAssistant from '/kmatrix-images/Smart Office Assistant.png';
import imgBusinessSystemAI from '/kmatrix-images/Business System + AI.png';

const { tm, rt } = useI18n();
const activeIndex = ref(0);
const images = [imgIntelligentCustomerService, imgIntelligentSmartOfficeAssistant, imgBusinessSystemAI];

const featureItems = computed(() =>
  (tm('features.items') as any[]).map((item: any) => ({
    title: rt(item.title),
    tabTitle: rt(item.tabTitle),
    tabIcon: rt(item.tabIcon),
    desc: rt(item.desc),
    cards: (item.cards as any[]).map((c: any) => ({
      title: rt(c.title),
      desc: rt(c.desc),
      icon: rt(c.icon)
    })),
    coreList: (item.coreList as any[]).map((s: any) => rt(s)),
    btnText: rt(item.btnText)
  }))
);
const activeFeature = computed(() => featureItems.value[activeIndex.value] || featureItems.value[0]);

const getFeatImage = (index: number) => images[index] || images[0];
</script>

<template>
  <section id="core-features" class="core-features">
    <div class="bg-glow"></div>

    <div class="container">
      <div class="section-header">
        <h2 class="gradient-text font-bold">{{ $t('features.title') }}</h2>
        <p>{{ $t('features.subtitle') }}</p>
      </div>

      <!-- 顶部自定义 Tabs -->
      <div class="top-tabs">
        <div
          v-for="(feat, index) in featureItems"
          :key="index"
          class="tab-item"
          :class="{ active: activeIndex === index }"
          @click="activeIndex = index"
        >
          <div class="tab-icon">
            <svg v-if="feat.tabIcon === 'customer'" viewBox="0 0 24 24" fill="none" class="icon-svg">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M12 7V13L16 15" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else-if="feat.tabIcon === 'office'" viewBox="0 0 24 24" fill="none" class="icon-svg">
              <path d="M12 21V3M12 21L7 16M12 21L17 16" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" class="icon-svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span>{{ feat.tabTitle }}</span>
        </div>
      </div>

      <div class="scene-container glass shadow-2xl">
        <Transition name="fade-slide" mode="out-in">
          <div :key="activeIndex" class="scene-content">
            <!-- 左侧文案区 -->
            <div class="scene-left">
              <div class="scene-header">
                <div class="main-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" class="main-icon">
                    <path
                      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path d="M12 7V13L16 15" stroke="currentColor" stroke-width="2" />
                  </svg>
                </div>
                <h2 class="scene-title">{{ activeFeature.title }}</h2>
              </div>

              <p class="scene-desc">{{ activeFeature.desc }}</p>

              <!-- 功能小卡片网格 (2x2) -->
              <div class="small-cards-grid">
                <div v-for="(card, cIdx) in activeFeature.cards" :key="cIdx" class="small-card">
                  <div class="card-icon-min">
                    <div class="icon-dot"></div>
                  </div>
                  <div class="card-info">
                    <h4>{{ card.title }}</h4>
                    <p>{{ card.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- 核心特性列表 -->
              <div class="core-list-wrapper">
                <h3 class="list-title">{{ $t('features.valueLabel') }}</h3>
                <div class="core-grid">
                  <div v-for="(item, iIdx) in activeFeature.coreList" :key="iIdx" class="core-item">
                    <svg viewBox="0 0 24 24" fill="none" class="list-arrow">
                      <path
                        d="M9 5L16 12L9 19"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>

              <!-- 按钮 -->
              <a
                href="https://gitee.com/kyxxjs/kmatrix-service"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary scene-btn"
              >
                {{ activeFeature.btnText }}
              </a>
            </div>

            <!-- 右侧场景大图 (按图还原大图占比) -->
            <div class="scene-right" role="img" :aria-label="activeFeature.title">
              <div class="scene-image-mask">
                <img :src="getFeatImage(activeIndex)" :alt="activeFeature.title" class="scene-big-img" loading="lazy" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.core-features {
  padding: 80px 0 120px;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.top-tabs {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #64748b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.tab-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.tab-item.active {
  background: #5c67f2;
  color: white;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.scene-container {
  background: white;
  border-radius: 2rem;
  overflow: hidden;
  min-height: 600px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.scene-content {
  display: flex;
  height: 100%;
}

.scene-left {
  flex: 1;
  padding: 4rem;
  display: flex;
  flex-direction: column;
}

.scene-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.main-icon-box {
  width: 54px;
  height: 54px;
  background: #5c67f2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.main-icon {
  width: 28px;
  height: 28px;
}

.scene-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
}

.scene-desc {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 2.5rem;
  max-width: 90%;
}

/* 小卡片网格 */
.small-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.small-card {
  display: flex;
  gap: 1rem;
}

.card-icon-min {
  width: 32px;
  height: 32px;
  background: #f1f5fe;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-dot {
  width: 6px;
  height: 6px;
  background: #5c67f2;
  border-radius: 50%;
}

.card-info h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.card-info p {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.4;
}

/* 核心特性列表 */
.core-list-wrapper {
  margin-bottom: 3rem;
}

.list-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.core-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 2rem;
}

.core-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.95rem;
}

.list-arrow {
  width: 14px;
  height: 14px;
  color: #5c67f2;
}

.scene-btn {
  width: fit-content;
  padding: 0.75rem 2.5rem;
  font-size: 1rem;
  border-radius: 10px;
  background: #5c67f2;
}

/* 右侧大图布局 */
.scene-right {
  flex: 1.1;
  background: #0f172a;
  position: relative;
  overflow: hidden;
}

.scene-image-mask {
  width: 100%;
  height: 100%;
}

.scene-big-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

/* 动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 1024px) {
  .scene-content {
    flex-direction: column;
  }
  .scene-left {
    padding: 2.5rem;
  }
  .scene-right {
    min-height: 300px;
  }
  .top-tabs {
    flex-wrap: wrap;
    padding: 0 1rem;
  }
  .small-cards-grid,
  .core-grid {
    grid-template-columns: 1fr;
  }
}
</style>
