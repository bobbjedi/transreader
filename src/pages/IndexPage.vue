<template>
  <div class="landing-page">
    <!-- Hero секция -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge" @click="openGithub">
            <q-icon name="code" size="18px" /> <span class="q-ml-sm">Open Source</span>
          </div>
          <h1 class="hero-title">
            Веб-ридер для чтения книг в оригинале и изучения языков
          </h1>
          <div class="hero-features">
            <div class="hero-feature">
              <q-icon name="touch_app" size="18px" />
              <span class="q-ml-sm">Клик по словам</span>
            </div>
            <div class="hero-feature">
              <q-icon name="compare" size="18px" />
              <span class="q-ml-sm">Построчный диалог перевода</span>
            </div>
            <div class="hero-feature">
              <q-icon name="translate" size="18px" />
              <span class="q-ml-sm">Перевод через браузер</span>
            </div>
            <div class="hero-feature">
              <q-icon name="offline_bolt" size="18px" />
              <span class="q-ml-sm">Оффлайн перевод (EN->RU)</span>
            </div>

            <div class="hero-feature">
              <q-icon name="compare" size="18px" />
              <span class="q-ml-sm">Загрузка своих книг FB2, TXT</span>
            </div>
          </div>

          <div class="hero-action">
            <q-btn color="primary" size="lg" unelevated rounded @click="goToApp" class="hero-cta-button" icon="launch">
              Открыть веб-приложение
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Способы перевода -->
    <div class="features-section">
      <div class="container">
        <div class="features-grid">
          <!-- Перевод слов -->
          <div class="feature-card feature-card--offline">
            <div class="feature-header">
              <div class="feature-icon">
                <q-icon name="touch_app" size="32px" />
              </div>
              <div class="feature-badge feature-badge--offline">Офлайн</div>
            </div>
            <h3 class="feature-title">Перевод слов</h3>
            <p class="feature-description">
              Клик по слову показывает перевод EN->RU из локального словаря
            </p>

          </div>

          <!-- Автоперевод страницы -->
          <div class="feature-card feature-card--online">
            <div class="feature-header">
              <div class="feature-icon">
                <q-icon name="translate" size="32px" />
              </div>
              <div class="feature-badge feature-badge--online">Онлайн</div>
            </div>
            <h3 class="feature-title">Автоперевод</h3>
            <p class="feature-description">
              Автоперевод страницы через функцию браузера "Перевести страницу"
            </p>

          </div>

          <!-- Построчный перевод -->
          <div class="feature-card feature-card--hybrid">
            <div class="feature-header">
              <div class="feature-icon">
                <q-icon name="compare" size="32px" />
              </div>
              <div class="feature-badge feature-badge--hybrid">Гибридный</div>
            </div>
            <h3 class="feature-title">Построчный перевод</h3>
            <p class="feature-description">
              Диалог с построчным переводом текущей страницы
            </p>

          </div>
        </div>
      </div>
    </div>

    <!-- Дополнительные возможности -->
    <div class="additional-features">
      <div class="container">

        <div class="additional-grid">
          <div class="additional-card">
            <div class="additional-icon">
              <q-icon name="smartphone" size="28px" />
            </div>
            <h4 class="additional-title">Мобильная оптимизация</h4>
            <p class="additional-description">Свайпы для навигации, адаптивная верстка</p>
          </div>

          <div class="additional-card">
            <div class="additional-icon">
              <q-icon name="palette" size="28px" />
            </div>
            <h4 class="additional-title">Настройки чтения</h4>
            <p class="additional-description">Размер шрифта, цветовые темы</p>
          </div>

          <div class="additional-card">
            <div class="additional-icon">
              <q-icon name="save" size="28px" />
            </div>
            <h4 class="additional-title">Локальное хранение</h4>
            <p class="additional-description">Данные хранятся в localStorage браузера</p>
          </div>

          <div class="additional-card">
            <div class="additional-icon">
              <q-icon name="description" size="28px" />
            </div>
            <h4 class="additional-title">Поддержка форматов</h4>
            <p class="additional-description">FB2 и TXT файлы, автоматическая пагинация</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="cta-section">
      <div class="cta-background"></div>
      <div class="container">
        <div class="cta-content">
          <div class="cta-main">
            <h2 class="cta-title">Готов начать изучение?</h2>
            <p class="cta-subtitle">
              Загрузи книгу и попробуй все способы перевода
            </p>

            <div class="cta-actions">
              <q-btn color="white" text-color="primary" size="lg" unelevated rounded @click="goToApp"
                class="cta-button-primary" icon="launch">
                Открыть веб-приложение
              </q-btn>
            </div>

            <div class="cta-features">
              <div class="cta-feature">
                <q-icon name="cloud_off" size="20px" />
                <span>Работает офлайн</span>
              </div>
              <div class="cta-feature">
                <q-icon name="smartphone" size="20px" />
                <span>Мобильная версия</span>
              </div>
              <div class="cta-feature">
                <q-icon name="money_off" size="20px" />
                <span>100% бесплатно</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Футер -->
    <div class="footer-section">
      <div class="container text-center">
        <div class="text-body2 text-grey-6">
          Открытый проект для изучения языков через чтение
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToApp() {
  void router.push('/app');
}
function openGithub() {
  window.open('https://github.com/bobbjedi/transreader', '_blank');
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero секция */
.hero-section {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1e293b;
}

.hero-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 32px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.hero-features {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.hero-feature {
  display: flex;
  align-items: center;
  font-size: 1rem;
  width: 290px;
  color: #475569;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  min-width: 280px;
}

.hero-feature q-icon {
  color: #3b82f6;
}

.hero-action {
  margin-top: 32px;
}

.hero-cta-button {
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  background: #3b82f6;
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.hero-cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
  background: #2563eb;
}

/* Секция возможностей */
.features-section {
  padding: 80px 0;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}



.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: white;
}







.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--feature-color);
  color: white;
}

.feature-badge {
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-badge--offline {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.feature-badge--online {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.feature-badge--hybrid {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e293b;
}

.feature-description {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
}

.feature-pros {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pro-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

/* Дополнительные возможности */
.additional-features {
  padding: 80px 0;
  background: white;
}

.additional-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.additional-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.additional-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
}

.additional-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.additional-card:hover::before {
  opacity: 1;
}

.additional-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.additional-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.additional-description {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* Секция примеров */
.examples-section {
  padding: 80px 0;
  background: #f1f5f9;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.example-card {
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  background: white;
  border: 1px solid #e2e8f0;
}

.example-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* CTA секция */
.cta-section {
  position: relative;
  padding: 120px 0;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  overflow: hidden;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

.cta-content {
  position: relative;
  z-index: 2;
}

.cta-main {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  color: white;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-actions {
  margin-bottom: 40px;
}

.cta-button-primary {
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  background: #6366f1;
  color: white;
  border: none;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.cta-button-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
  background: #5b21b6;
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.cta-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Футер */
.footer-section {
  padding: 40px 0;
  background: #0f172a;
  color: #94a3b8;
}

/* Мобильная адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .hero-section {
    min-height: 90vh;
    padding: 60px 0;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-stats {
    gap: 24px;
    margin-top: 32px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .features-section {
    padding: 80px 0;
  }

  .section-header {
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1.1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-card {
    padding: 24px;
  }

  .additional-features {
    padding: 60px 0;
  }

  .additional-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .examples-section {
    padding: 60px 0;
  }

  .examples-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .cta-section {
    padding: 80px 0;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-subtitle {
    font-size: 1.1rem;
  }

  .cta-features {
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .hero-section {
    min-height: 80vh;
    padding: 40px 0;
  }

  .hero-title {
    font-size: 2rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 32px;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-number {
    font-size: 1.5rem;
    margin-bottom: 0;
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .feature-card {
    padding: 20px;
  }

  .feature-icon {
    width: 48px;
    height: 48px;
  }

  .feature-title {
    font-size: 1.25rem;
  }

  .feature-description {
    font-size: 0.9rem;
  }

  .cta-title {
    font-size: 1.75rem;
  }

  .cta-subtitle {
    font-size: 1rem;
  }

  .cta-button-primary {
    padding: 14px 28px;
    font-size: 1rem;
  }

  .cta-features {
    flex-direction: column;
    gap: 12px;
  }
}

/* Анимации */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card,
.feature-item,
.upload-card {
  animation: fadeInUp 0.6s ease-out;
}

.feature-card:nth-child(2) {
  animation-delay: 0.1s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.2s;
}

/* Темная тема */
.body--dark .landing-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.body--dark .hero-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.body--dark .hero-title {
  color: #f1f5f9;
}

.body--dark .hero-subtitle {
  color: #cbd5e1;
}

.body--dark .hero-feature {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .features-section {
  background: #1e293b;
  color: #e0e0e0;
}

.body--dark .feature-card {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.body--dark .feature-card:hover {
  background: #334155;
}

.body--dark .feature-card .feature-title {
  color: #f8fafc;
}

.body--dark .feature-card .feature-description {
  color: #cbd5e1;
}

.body--dark .additional-features {
  background: #1e293b;
}

.body--dark .examples-section {
  background: #334155;
}

.body--dark .example-card {
  background: #1e293b;
  border-color: #475569;
  color: #f1f5f9;
}

.body--dark .example-card .text-grey-7 {
  color: #cbd5e1 !important;
}

.body--dark .cta-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.body--dark .additional-card {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.body--dark .additional-card:hover {
  background: #334155;
  border-color: #3b82f6;
}

.body--dark .additional-title {
  color: #f8fafc;
}

.body--dark .additional-description {
  color: #cbd5e1;
}
</style>
