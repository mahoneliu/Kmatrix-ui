<script setup lang="ts">
import imgHero from '/kmatrix-images/about/knowledge_flow.png';
import imgStory from '/kmatrix-images/about/team_office.png';
import imgTeam from '/kmatrix-images/about/customer_service.png';

const { tm, rt } = useI18n();

const values = computed(() =>
  (tm('about.values.items') as any[]).map((item: any) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    desc: rt(item.desc)
  }))
);
</script>

<template>
  <section class="about-us">
    <!-- Hero Section -->
    <div class="about-hero" :style="{ backgroundImage: `url(${imgHero})` }">
      <div class="hero-overlay"></div>
      <div class="container relative">
        <div class="hero-content">
          <h1 class="font-bold">{{ $t('about.hero.title') }}</h1>
          <p class="subtitle">{{ $t('about.hero.subtitle') }}</p>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Story Section -->
      <div class="about-section story-section">
        <div class="grid-2">
          <div class="section-text">
            <h2 class="font-bold">{{ $t('about.story.title') }}</h2>
            <p v-html="$t('about.story.p1')"></p>
            <p v-html="$t('about.story.p2')"></p>
            <p v-html="$t('about.story.p3')"></p>
          </div>
          <div class="section-image glass shadow-xl">
            <img :src="imgStory" :alt="$t('about.story.title')" />
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="about-section values-section">
        <h2 class="mb-12 text-center font-bold">{{ $t('about.values.title') }}</h2>
        <div class="values-grid">
          <div v-for="(value, index) in values" :key="index" class="value-card glass">
            <div class="value-icon">{{ value.icon }}</div>
            <h3 class="font-bold">{{ value.title }}</h3>
            <p>{{ value.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="about-section team-section">
        <div class="grid-2 reverse">
          <div class="section-text">
            <h2 class="font-bold">{{ $t('about.tech.title') }}</h2>
            <p v-html="$t('about.tech.p1')"></p>
            <p v-html="$t('about.tech.p2')"></p>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="num">10+</span>
                <span class="label">{{ $t('about.tech.stats.exp') }}</span>
              </div>
              <div class="stat-item">
                <span class="num">4+</span>
                <span class="label">{{ $t('about.tech.stats.iter') }}</span>
              </div>
              <div class="stat-item">
                <span class="num">100+</span>
                <span class="label">{{ $t('about.tech.stats.clients') }}</span>
              </div>
            </div>
          </div>
          <div class="section-image glass shadow-xl">
            <img :src="imgTeam" :alt="$t('about.tech.title')" />
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="about-section contact-section glass">
        <h2 class="font-bold">{{ $t('about.contact.title') }}</h2>
        <div class="contact-grid">
          <div class="contact-info-list">
            <div class="contact-item">
              <span class="icon">📍</span>
              <div>
                <p class="label">{{ $t('about.contact.address') }}</p>
                <p class="text">{{ $t('about.contact.addrText') }}</p>
              </div>
            </div>
            <div class="contact-item">
              <span class="icon">💼</span>
              <div>
                <p class="label">{{ $t('about.contact.business') }}</p>
                <p class="text">17702074054 (微信同号)</p>
              </div>
            </div>
            <div class="contact-item">
              <span class="icon">🛠️</span>
              <div>
                <p class="label">{{ $t('about.contact.support') }}</p>
                <p class="text">22247537@qq.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-us {
  padding-bottom: 100px;
}
.about-hero {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 80px;
  padding-top: 80px;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  /* Maintain a vibrant brand-aligned gradient for text contrast without greyish feel */
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 100%);
}
.hero-content {
  color: #ffffff;
  z-index: 1;
  /* Stronger text shadow for clarity over vibrant background */
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
}
.hero-content h1 {
  color: #ffffff;
  font-size: 4rem;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  font-weight: 800;
}
.hero-content .subtitle {
  color: #ffffff;
  font-size: 1.5rem;
  opacity: 1;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.about-section {
  padding: 80px 0;
}
.story-section .section-image img,
.team-section .section-image img {
  width: 100%;
  border-radius: 1rem;
  display: block;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.grid-2.reverse {
  direction: rtl;
}
.grid-2.reverse .section-text {
  direction: ltr;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--primary);
}
p {
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: var(--foreground);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.value-card {
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 1.5rem;
  transition: transform 0.3s ease;
}
.value-card:hover {
  transform: translateY(-10px);
}
.value-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}
.value-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-item .num {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
}
.stat-item .label {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.contact-section {
  padding: 4rem;
  border-radius: 2rem;
}
.contact-info-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.contact-item {
  display: flex;
  gap: 1.5rem;
}
.contact-item .icon {
  font-size: 2rem;
}
.contact-item .label {
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--muted-foreground);
}
.contact-item .text {
  color: var(--foreground);
  font-weight: 500;
}

@media (max-width: 1024px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .grid-2.reverse {
    direction: ltr;
  }
  .values-grid {
    grid-template-columns: 1fr;
  }
  .contact-info-list {
    grid-template-columns: 1fr;
  }
  .hero-content h1 {
    font-size: 3rem;
  }
}
</style>
