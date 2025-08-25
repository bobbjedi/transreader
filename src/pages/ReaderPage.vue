<template>
  <q-page class="reader-page" :class="themeClass">
    <div v-if="book" class="reader-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
      @touchend="handleTouchEnd">
      <!-- Заголовок с навигацией -->
      <div class="reader-header">
        <q-btn flat round dense icon="arrow_back" @click="goBack" class="header-btn" />
        <div class="book-title">{{ book.title }}</div>
        <q-btn flat round dense icon="settings" @click="showSettings = !showSettings" class="header-btn" />
      </div>

      <!-- Контент страницы -->
      <div class="reader-content" ref="contentRef">
        <!-- Прелоадер пагинации -->
        <div v-if="isLoading" class="pagination-loader">
          <q-spinner-pie size="40px" color="primary" />
          <div class="q-mt-md text-center">
            Пересчет страниц...<br>
            <small>Размер шрифта: {{ settings.fontSize }}px</small>
          </div>
        </div>

        <!-- Содержимое страницы -->
        <div v-if="!isLoading" class="page-content" id="main-reader-content"
          :style="{ fontSize: settings.fontSize + 'px' }">
          {{ currentPageContent }}
        </div>
        <div class="page-content" id="reader-measurer" :style="{ fontSize: settings.fontSize + 'px' }">
        </div>
      </div>

      <!-- Индикатор страницы -->
      <div class="page-indicator">
        {{ currentPage + 1 }} / {{ totalPages }}
      </div>

      <!-- Панель настроек -->
      <q-slide-transition>
        <div v-show="showSettings" class="settings-panel">
          <q-card class="settings-card">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 q-mb-md">Настройки чтения</div>

              <div class="q-mb-md">
                <q-item-label class="q-mb-sm">Размер шрифта: {{ settings.fontSize }}px</q-item-label>
                <q-slider v-model="settings.fontSize" :min="12" :max="28" :step="1" @update:model-value="updatePages"
                  color="primary" />
              </div>

              <div class="q-mb-md">
                <q-item-label class="q-mb-sm">Тема</q-item-label>
                <q-btn-toggle v-model="settings.theme" :options="[
                  { label: 'Светлая', value: 'light' },
                  { label: 'Темная', value: 'dark' },
                  { label: 'Сепия', value: 'sepia' }
                ]" @update:model-value="saveSettings" color="primary" text-color="primary" toggle-color="primary"
                  unelevated spread />
              </div>

              <div class="row q-gutter-sm">
                <q-btn label="Закрыть" @click="showSettings = false" color="primary" flat class="col" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-slide-transition>


    </div>

    <!-- Загрузка -->
    <div v-else class="flex column items-center justify-center full-height">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md">Загрузка книги...</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { normalizeTextPreserveParagraphs } from 'src/composables/useTextPages';

interface Book {
  id: string;
  title: string;
  content: string;
  pages: number;
  size: number;
  fileName: string;
}

interface Settings {
  fontSize: number;
  theme: string;
}

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const book = ref<Book | null>(null);
const settings = ref<Settings>({ fontSize: 16, theme: 'light' });
const showSettings = ref(false);
const currentPage = ref(0);
const pages = ref<string[]>([]);
const totalPages = ref(0);
const isLoading = ref(false);

const contentRef = ref<HTMLElement>();

// Touch handling
const touchStartX = ref(0);
const touchStartY = ref(0);
const isSwiping = ref(false);

onMounted(() => {
  loadBook();
  loadSettings();
  void updatePages();
});

watch(() => settings.value.fontSize, () => {
  void updatePages();
  saveSettings();
});

watch(() => settings.value.theme, () => {
  saveSettings();
});

const themeClass = computed(() => {
  return `theme-${settings.value.theme}`;
});

const currentPageContent = computed(() => {
  return pages.value[currentPage.value] || '';
});

function loadBook() {
  const bookId = route.params.id;
  if (typeof bookId !== 'string') return;

  const savedBooks = localStorage.getItem('reader-books');

  if (savedBooks) {
    const books: Book[] = JSON.parse(savedBooks);
    book.value = books.find(b => b.id === bookId) || null;
  }

  if (!book.value) {
    $q.notify({
      type: 'negative',
      message: 'Книга не найдена',
      position: 'top'
    });
    void router.push('/');
    return;
  }

  // Загружаем последнюю позицию
  const savedPosition = localStorage.getItem(`book-position-${bookId}`);
  if (savedPosition) {
    currentPage.value = parseInt(savedPosition);
  }
}

function loadSettings() {
  const savedSettings = localStorage.getItem('reader-settings');
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
  }
}

function saveSettings() {
  localStorage.setItem('reader-settings', JSON.stringify(settings.value));
}

function savePosition() {
  if (book.value?.id) {
    localStorage.setItem(`book-position-${book.value.id}`, currentPage.value.toString());
  }
}

async function updatePages() {
  if (!book.value) return;

  // Показываем прелоадер
  isLoading.value = true;

  // Небольшая задержка чтобы прелоадер успел показаться
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('updatePages called, book content length:', book.value.content.length);

  // Умная разбивка на страницы
  const content = normalizeTextPreserveParagraphs(book.value.content);
  const newPages: string[] = [];

  if (!content || content.trim().length === 0) {
    console.warn('Book content is empty!');
    pages.value = ['Нет содержимого для отображения'];
    totalPages.value = 1;
    return;
  }

  // РЕАЛЬНАЯ пагинация основанная на размерах экрана
  console.log(`=== REAL PAGINATION DEBUG ===`);
  console.log(`Font size: ${settings.value.fontSize}px`);
  console.log('Original content length:', content.length);

  // Ждем, пока DOM элементы будут готовы
  await nextTick();

  // Получаем реальные размеры контейнера

  const container = contentRef.value;
  if (!container) {
    console.error('Container not available, using fallback pagination');
    return;
  }

  const style = getComputedStyle(container);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);

  const visibleHeight = container.clientHeight - paddingTop - paddingBottom;
  console.log('Контентная высота без паддингов:', visibleHeight);


  // console.log(`Container size: ${containerWidth}x${containerHeight}px`);

  // Создаем временный элемент для измерения текста
  const measurer = document.getElementById('reader-measurer') as HTMLElement;
  measurer.style.display = 'block';
  const prevPosition = container.style.position;
  container.style.position = 'fixed';
  await nextTick();
  // document.body.appendChild(measurer);

  console.log('Created text measurer');

  // Разбиваем на предложения для точной пагинации
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

  console.log(`Found ${sentences.length} sentences`);

  let currentPageText = '';
  let sentenceIndex = 0;

  while (sentenceIndex < sentences.length) {
    // Пробуем добавить следующее предложение
    const testText = currentPageText + (currentPageText ? ' ' : '') + sentences[sentenceIndex];
    measurer.textContent = testText;

    const textHeight = measurer.scrollHeight;
    console.log(`Testing sentence ${sentenceIndex}, height: ${textHeight}px, visibleHeight: ${visibleHeight}px`);

    // Если текст помещается на страницу
    if (textHeight <= visibleHeight) {
      currentPageText = testText;
      sentenceIndex++;
    } else {
      // Текст не помещается
      if (currentPageText.length > 0) {
        // Сохраняем текущую страницу
        newPages.push(currentPageText.trim());
        console.log(`Page ${newPages.length} completed with ${currentPageText.length} chars`);
        currentPageText = '';
      } else {
        // Даже одно предложение не помещается - принудительно добавляем
        newPages.push((sentences[sentenceIndex] || '').trim());
        console.log(`Page ${newPages.length} - forced single sentence`);
        sentenceIndex++;
      }
    }
  }

  // Добавляем последнюю страницу
  if (currentPageText.trim().length > 0) {
    newPages.push(currentPageText.trim());
    console.log(`Final page ${newPages.length} with ${currentPageText.length} chars`);
  }

  container.style.position = prevPosition;
  measurer.style.display = 'none';
  // Убираем временный элемент
  // document.body.removeChild(measurer);


  pages.value = newPages;
  totalPages.value = newPages.length;

  console.log(`=== FINAL RESULT ===`);
  console.log(`Created ${newPages.length} pages`);
  console.log('All page lengths:', newPages.map(page => page.length));

  // Проверяем, что текущая страница не выходит за границы
  if (currentPage.value >= totalPages.value) {
    currentPage.value = Math.max(0, totalPages.value - 1);
  }

  // Скрываем прелоадер
  isLoading.value = false;
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    savePosition();
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    savePosition();
  }
}

function goBack() {
  savePosition();
  void router.push('/');
}

// Touch handlers
function handleTouchStart(event: TouchEvent) {
  if (showSettings.value || !event.touches[0]) return;

  touchStartX.value = event.touches[0].clientX;
  touchStartY.value = event.touches[0].clientY;
  isSwiping.value = false;
}

function handleTouchMove(event: TouchEvent) {
  if (showSettings.value || !event.touches[0]) return;

  const deltaX = Math.abs(event.touches[0].clientX - touchStartX.value);
  const deltaY = Math.abs(event.touches[0].clientY - touchStartY.value);

  if (deltaX > 10 || deltaY > 10) {
    isSwiping.value = true;
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (showSettings.value || !isSwiping.value || !event.changedTouches[0]) return;

  const deltaX = event.changedTouches[0].clientX - touchStartX.value;
  const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartY.value);

  // Проверяем, что это горизонтальный свайп
  if (Math.abs(deltaX) > 50 && deltaY < 100) {
    if (deltaX > 0) {
      // Свайп вправо - НАЗАД (предыдущая страница)
      console.log('Swiping right -> previous page');
      prevPage();
    } else {
      // Свайп влево - ВПЕРЕД (следующая страница)
      console.log('Swiping left -> next page');
      nextPage();
    }
  }

  isSwiping.value = false;
}
</script>

<style scoped>
.reader-page {
  height: 100vh;
  overflow: hidden;
}

.reader-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.reader-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.book-title {
  flex: 1;
  text-align: center;
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 16px;
}

.header-btn {
  color: var(--text-color);
}

.reader-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  position: relative;
}

.pagination-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: var(--text-color);
}

.pagination-loader small {
  opacity: 0.7;
  margin-top: 8px;
}

.page-content {
  line-height: 1.6;
  text-align: justify;
  white-space: pre-wrap;
  word-break: break-word;
  height: 100%;
  overflow: hidden;
}

.page-indicator {
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: var(--text-secondary);
}

.settings-panel {
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  z-index: 200;
}

.settings-card {
  background: var(--bg-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}



.full-height {
  height: 100vh;
}

/* Темы */
.theme-light {
  --bg-color: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  background: var(--bg-color);
  color: var(--text-color);
}

.theme-dark {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --text-secondary: #b0b0b0;
  background: var(--bg-color);
  color: var(--text-color);
}

.theme-sepia {
  --bg-color: #f7f3e9;
  --text-color: #5c4b37;
  --text-secondary: #8b7355;
  background: var(--bg-color);
  color: var(--text-color);
}

.theme-dark .reader-header,
.theme-dark .page-indicator {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.theme-sepia .reader-header,
.theme-sepia .page-indicator {
  background: rgba(92, 75, 55, 0.05);
  border-color: rgba(92, 75, 55, 0.1);
}
</style>
