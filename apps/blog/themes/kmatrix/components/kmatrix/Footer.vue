<script setup></script>

<template>
  <footer class="footer">
    <div class="footer-grid container">
      <div class="footer-brand">
        <h3 class="gradient-text">KMatrix</h3>
        <p>{{ $t('footer.slogan') }}</p>
        <div class="social-links">
          <a href="https://gitee.com/kyxxjs/kmatrix-service" target="_blank" rel="noopener noreferrer">Gitee</a>
          <a href="https://github.com/mahoneliu/KMatrix-service" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
      <div class="footer-links">
        <div class="link-group">
          <h4>{{ $t('footer.resources') }}</h4>
          <a href="http://docs.kykms.cn" target="_blank" rel="noopener noreferrer">{{ $t('footer.docs') }}</a>
          <a href="#">{{ $t('footer.changelog') }}</a>
          <a href="#">{{ $t('footer.donate') }}</a>
        </div>
        <div class="link-group">
          <h4>{{ $t('footer.contact') }}</h4>
          <p>{{ $t('footer.qqGroup') }}: 782686853</p>
          <p>Email: service@mail.kykms.cn</p>
        </div>
        <div class="link-group footer-qr-wrapper">
          <h4>{{ $t('footer.wechat') }}</h4>
          <div class="qr-container glass">
            <img src="/kmatrix-images/wechat.png" alt="WeChat QR" class="qr-image" />
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom container">
      <div class="footer-copyright">
        <p>&copy; 2026 KMatrix Team. {{ $t('footer.bottom') }}</p>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="beian-link">
          粤ICP备2022005126号-1
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 80px 0 40px;
  background: var(--muted);
  border-top: 1px solid var(--border);
}
.footer-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 4rem;
}
.footer-brand h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.social-links {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.social-links a {
  color: var(--muted-foreground);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.social-links a:hover {
  color: var(--primary);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.link-group h4 {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}
.link-group a,
.link-group p {
  display: block;
  color: var(--muted-foreground);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  transition: color 0.2s;
}
.link-group a:hover {
  color: var(--primary);
}

.qr-container {
  width: 120px;
  height: 120px;
  padding: 10px;
  border-radius: 12px;
  overflow: hidden;
}
.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.footer-copyright {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.beian-link {
  color: var(--muted-foreground);
  text-decoration: none;
  transition: color 0.2s;
}
.beian-link:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .footer-links {
    grid-template-columns: 1fr;
  }
  .footer-qr-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
