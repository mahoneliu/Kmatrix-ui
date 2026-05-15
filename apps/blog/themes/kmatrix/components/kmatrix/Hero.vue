<template>
  <section class="hero">
    <div class="hero-grid container">
      <div class="hero-text">
        <div class="badge">
          <svg class="badge-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5" opacity="0.4" />
            <path
              d="M6.5 10.5L9 13L13.5 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10 3v1M10 16v1M3 10h1M16 10h1"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              opacity="0.5"
            />
          </svg>
          {{ $t('hero.badge') }}
        </div>
        <h1>{{ $t('hero.title1') }}</h1>
        <h2 class="subtitle">{{ $t('hero.subtitle') }}</h2>
        <p class="description">
          {{ $t('hero.description') }}
        </p>
        <div class="hero-btns">
          <a
            href="https://gitee.com/kyxxjs/kmatrix-service"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-lg"
          >
            {{ $t('hero.preview') }}
          </a>
          <a href="#features" class="btn btn-secondary btn-lg">{{ $t('hero.learnMore') }}</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="image-wrapper glass">
          <div class="scene-image-mask" role="img" :aria-label="$t('hero.subtitle')">
            <img src="/kmatrix-images/hero-mockup.png" :alt="$t('hero.subtitle')" class="mockup-img" loading="eager" />
          </div>
          <div class="glow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: 160px;
  padding-bottom: 100px;
  background:
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
}
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 4rem;
  align-items: center;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--primary);
}
.badge-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--primary);
}
h1 {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--foreground) 60%, var(--primary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--foreground);
  font-weight: 500;
}
.description {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  max-width: 540px;
}
.hero-btns {
  display: flex;
  gap: 1.5rem;
}
.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
.hero-visual {
  position: relative;
}
.image-wrapper {
  border-radius: 1.5rem;
  overflow: hidden;
  position: relative;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s ease;
}
.image-wrapper:hover {
  transform: translateY(-10px) rotateX(2deg);
}
.mockup-img {
  width: 100%;
  display: block;
}
.glow {
  position: absolute;
  top: -20%;
  right: -20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
  filter: blur(60px);
  opacity: 0.3;
  z-index: -1;
}
@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 4rem;
    text-align: center;
  }
  .description {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-btns {
    justify-content: center;
  }
  h1 {
    font-size: 4rem;
  }
}
</style>
