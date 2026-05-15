<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { tm, rt } = useI18n();
const featureItems = computed(() =>
  (tm('feats.items') as any[]).map((item: any) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    desc: rt(item.desc)
  }))
);

// Pre-defined SVG paths for a clean linear look matching the reference
const svgPaths = [
  'M12 4V20M4 12H20M12 4L8 8M12 4L16 8M12 20L8 16M12 20L16 16', // Workflow
  'M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10ZM10 7L13 10L10 13', // Search
  'M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z', // AI Agent
  'M10 14L2 22M10 14L7 11M10 14L13 17M14 10L22 2M14 10L17 13M14 10L11 7', // Integration
  'M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z', // Security
  'M12 3V4M12 20V21M21 12H20M4 12H3M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636M18.364 5.636L17.657 6.343M6.343 18.364L5.636 17.657M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z' // UX (Now using SVG)
];

const iconColors = [
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f59e0b', // Orange
  '#10b981', // Green
  '#6366f1' // Indigo
];

const getSvgPath = (idx: number) => svgPaths[idx];
const getIconColor = (idx: number) => iconColors[idx];
const getSpecialIcon = (_idx: number) => null;
</script>

<template>
  <section id="features" class="features">
    <div class="bg-glow bg-glow-alt" style="left: -10%; top: 20%"></div>
    <div class="container">
      <div class="section-header">
        <h2 class="gradient-text font-bold">{{ $t('feats.title') }}</h2>
        <p>{{ $t('feats.subtitle') }}</p>
      </div>
      <div class="features-grid">
        <div v-for="(feat, featIndex) in featureItems" :key="featIndex" class="feature-card glass shadow-lg">
          <div class="feat-icon-container" :style="{ '--icon-color': getIconColor(featIndex) }">
            <!-- Priority 1: Generated Image if exists -->
            <img
              v-if="getSpecialIcon(featIndex)"
              :src="getSpecialIcon(featIndex)"
              :alt="feat.title"
              class="feat-icon-img"
            />
            <!-- Priority 2: Precise SVG Line Art (Matching the reference style) -->
            <svg v-else class="feat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                :d="getSvgPath(featIndex)"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="icon-bg-blur"></div>
          </div>
          <h3 class="font-bold">{{ feat.title }}</h3>
          <p>{{ feat.desc }}</p>
          <div class="card-glow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 120px 0 60px;
  position: relative;
}
.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}
.section-header h2 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}
.feature-card {
  padding: 3.5rem 2.5rem;
  border-radius: 2rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: white;
}
.feature-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
}

.feat-icon-container {
  width: 64px;
  height: 64px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  background: white;
  color: var(--icon-color);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
}

.icon-bg-blur {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--icon-color);
  opacity: 0.1;
  filter: blur(4px);
  z-index: 0;
}

.feat-icon-svg {
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 1;
}

.feat-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--foreground);
}
.feature-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--muted-foreground);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 100% 100%, var(--primary) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

.feature-card:hover .card-glow {
  opacity: 0.05;
}
</style>
