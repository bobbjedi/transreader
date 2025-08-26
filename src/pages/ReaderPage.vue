<template>
  <q-page class="reader-page" :class="themeClass">
    <div v-if="book" class="reader-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
      @touchend="handleTouchEnd">
      <!-- Заголовок с навигацией -->
      <div class="reader-header">
        <q-btn flat round dense icon="arrow_back" @click="goBack" class="header-btn notranslate" translate="no" />
        <div class="book-title notranslate" translate="no">{{ book.title }}</div>
        <div class="header-actions">
          <FullscreenToggle />
          <q-btn flat round dense icon="settings" @click="showSettings = !showSettings" class="header-btn notranslate"
            translate="no" />
        </div>
      </div>

      <!-- Контент страницы -->
      <div class="reader-content notranslate" ref="contentRef" translate="no">

        <!-- Содержимое страницы -->
        <div v-if="!isLoading" class="page-content" id="main-reader-content" :style="{ fontSize: fontSize + 'px' }"
          v-html="wrappedPageContent">
        </div>
        <div class="page-content" id="reader-measurer" :style="{ fontSize: fontSize + 'px' }">
        </div>
      </div>

      <OnlineTranslateDialog :page-text="currentPageContent" :current-page="currentPage" :total-pages="totalPages"
        @prev-page="prevPage" @next-page="nextPage" />


      <PagesPaginator :current-page="currentPage" :total-pages="totalPages" @prev-page="prevPage"
        @next-page="nextPage" />

      <!-- Панель настроек -->
      <ReaderSettings :show="showSettings" @close="showSettings = false"
        @font-size-changed="void updatePages('fontSize changed')" />
    </div>

    <!-- Полноэкранный прелоадер пересчета страниц -->
    <div v-if="isLoading" class="fullscreen-loader">
      <div class="loader-content">
        <q-spinner-pie size="60px" color="primary" />
        <div class="q-mt-lg text-center">
          <div class="text-h6">Пересчет страниц</div>
          <div class="text-subtitle1 q-mt-sm">{{ progress }}%</div>
          <div class="text-caption q-mt-xs">Размер шрифта: {{ fontSize }}px</div>
        </div>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-else class="flex column items-center justify-center full-height">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md">Загрузка книги...</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useTextPages } from 'src/composables/useTextPages';
import { usePageCache } from 'src/composables/usePageCache';
import OnlineTranslateDialog from 'src/components/OnlineTranslateDialog.vue';
import ReaderSettings from 'src/components/ReaderSettings.vue';
import PagesPaginator from 'src/components/PagesPaginator.vue';
import FullscreenToggle from 'src/components/FullscreenToggle.vue';
import { wrapContentToWords } from 'src/composables/useTranslate';
import { fontSize, theme } from 'src/composables/useReaderSettings';
import { useBookManager } from 'src/composables/useBookManager';
import { scrollToTop } from 'src/boot/utils';
import { useSwipeNavigation } from 'src/composables/useSwipeNavigation';

const { getBookContent } = useBookManager();

watch(() => fontSize.value, () => {
  // При изменении размера шрифта очищаем старые кеши для текущей книги
  if (book.value) {
    clearBookCache(book.value.id);
  }
  void updatePages('fontSize changed');
});

interface Book {
  id: string;
  title: string;
  pages: number;
  size: number;
  fileName: string;
  addedAt: number;
}



const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { savePagesToCache, loadPagesFromCache, clearBookCache } = usePageCache();

const book = ref<Book | null>(null);

const showSettings = ref(false);
const currentPage = ref(0);
const pages = ref<string[]>([]);
const totalPages = ref(0);
const isLoading = ref(false);
const progress = ref(0);


const contentRef = ref<HTMLElement>();
// Touch handling
// Используем composable для свайпов
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeNavigation(
  prevPage,
  nextPage,
  {
    disabled: () => showSettings.value
  }
);

onMounted(() => {
  loadBook();
  void updatePages('onMounted');

  // Исправляем высоту viewport для мобильных браузеров
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);

  // Добавляем обработчик кнопок громкости для навигации
  window.addEventListener('keydown', handleVolumeKeys);
});

// Функция для установки правильной высоты viewport
function setViewportHeight() {
  // Проверяем поддержку dvh
  if (!CSS.supports('height', '100dvh')) {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}

// Обработчик кнопок громкости для навигации по страницам
function handleVolumeKeys(event: KeyboardEvent) {
  // Поддержка различных кодов клавиш громкости
  const volumeDownCodes = ['AudioVolumeDown', 'VolumeDown']; // Уменьшение громкости
  const volumeUpCodes = ['AudioVolumeUp', 'VolumeUp'];       // Увеличение громкости

  if (volumeDownCodes.includes(event.code) || volumeUpCodes.includes(event.code)) {
    event.preventDefault(); // Предотвращаем изменение громкости

    if (volumeDownCodes.includes(event.code)) {
      // Volume Down - предыдущая страница
      prevPage();
    } else if (volumeUpCodes.includes(event.code)) {
      // Volume Up - следующая страница
      nextPage();
    }
  }
}



// Очищаем обработчики событий при размонтировании
onUnmounted(() => {
  window.removeEventListener('resize', setViewportHeight);
  window.removeEventListener('orientationchange', setViewportHeight);
  window.removeEventListener('keydown', handleVolumeKeys);
});




const themeClass = computed(() => {
  return `theme-${theme.value}`;
});

const currentPageContent = computed(() => {
  return (pages.value[currentPage.value] || '').replace(/[’‘`]/g, "'")
});

const wrappedPageContent = computed(() => {
  const content = currentPageContent.value;
  if (!content) return '';

  // Разбиваем текст на слова и обрамляем каждое слово в span
  return wrapContentToWords(content);
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




function savePosition() {
  if (book.value?.id) {
    localStorage.setItem(`book-position-${book.value.id}`, currentPage.value.toString());
  }
}

async function updatePages(src: string) {
  console.log('>>>>>>>>>>>updatePages called', src);
  if (!book.value) return;
  console.log('fontSize.value:', fontSize.value);

  if (isLoading.value) {
    console.log('>>>>>>>>>>>updatePages called, but isLoading is true');
    return;
  };

  // Проверяем кеш перед пересчетом
  const cached = loadPagesFromCache(book.value.id, fontSize.value);
  if (cached && cached.pages.length > 0) {
    console.log(`Загружены страницы из кеша: ${cached.pages.length} страниц`);
    pages.value = cached.pages;
    totalPages.value = cached.totalPages;
    isLoading.value = false;
    return;
  }

  // Показываем прелоадер только если нет кеша
  isLoading.value = true;

  // Умная разбивка на страницы
  const content = getBookContent(book.value.id);
  if (!content || content.trim().length === 0) {
    console.warn('Book content is empty!');
    pages.value = ['Нет содержимого для отображения'];
    totalPages.value = 1;
    isLoading.value = false;
    return;
  }

  // РЕАЛЬНАЯ пагинация основанная на размерах экрана
  console.log(`=== REAL PAGINATION DEBUG ===`);
  console.log(`Font size: ${fontSize.value}px`);
  console.log('Original content length:', content.length);

  // Ждем, пока DOM элементы будут готовы
  await nextTick();

  // Получаем реальные размеры контейнера

  const newPages = await useTextPages(content, {
    container: contentRef.value as HTMLElement,
    measurer: document.getElementById('reader-measurer') as HTMLElement,
    wordsPerStep: 3,
    onProgress: (progressValue) => {
      progress.value = Math.round(progressValue);
    }
  });



  pages.value = newPages;
  totalPages.value = newPages.length;

  console.log(`=== FINAL RESULT ===`);
  console.log(`Created ${newPages.length} pages`);

  // Сохраняем пересчитанные страницы в кеш
  savePagesToCache(book.value.id, fontSize.value, newPages);

  // Проверяем, что текущая страница не выходит за границы
  if (currentPage.value >= totalPages.value) {
    currentPage.value = Math.max(0, totalPages.value - 1);
  }

  // Скрываем прелоадер
  isLoading.value = false;
}

function nextPage() {
  scrollToTop('.swipe-container');
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    savePosition();
  }
}

function prevPage() {
  scrollToTop('.swipe-container');
  if (currentPage.value > 0) {
    currentPage.value--;
    savePosition();
  }
}

function goBack() {
  savePosition();
  void router.push('/');
}
</script>

<style scoped>
.reader-page {
  height: 100vh;
  height: 100dvh;
  /* Новый CSS стандарт для динамической высоты viewport */
  overflow: hidden;
}

/* Фоллбек для браузеров без поддержки dvh */
@supports not (height: 100dvh) {
  .reader-page {
    height: calc(var(--vh, 1vh) * 100);
  }
}

/* Фоллбек для браузеров без поддержки dvh */
@supports not (height: 100dvh) {
  .reader-page {
    height: calc(var(--vh, 1vh) * 100);
  }
}

.reader-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
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

.fullscreen-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-color, #ffffff);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: var(--text-color, #333333);
  min-width: 200px;
}

.page-content {
  line-height: 1.6;
  text-align: justify;
  white-space: pre-wrap;
  word-break: break-word;
  height: 100%;
  overflow: hidden;
}

.clickable-word {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 1px 2px;
  border-radius: 3px;
}

.clickable-word:hover {
  background-color: rgba(0, 123, 255, 0.1);
  text-decoration: underline;
}

.clickable-word-clicked {
  font-weight: bold !important;
  color: red !important;
  background-color: rgba(0, 123, 255, 0.1) !important;
  text-decoration: underline !important;
}

.full-height {
  height: 100vh;
  height: 100dvh;
}

/* Фоллбек для браузеров без поддержки dvh */
@supports not (height: 100dvh) {
  .full-height {
    height: calc(var(--vh, 1vh) * 100);
  }
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

.theme-dark .page-nav-left:hover,
.theme-dark .page-nav-right:hover {
  background: rgba(255, 255, 255, 0.1);
}

.theme-dark .page-nav-left:active,
.theme-dark .page-nav-right:active {
  background: rgba(255, 255, 255, 0.2);
}

.theme-sepia .reader-header,
.theme-sepia .page-indicator {
  background: rgba(92, 75, 55, 0.05);
  border-color: rgba(92, 75, 55, 0.1);
}

.theme-sepia .page-nav-left:hover,
.theme-sepia .page-nav-right:hover {
  background: rgba(92, 75, 55, 0.1);
}

.theme-sepia .page-nav-left:active,
.theme-sepia .page-nav-right:active {
  background: rgba(92, 75, 55, 0.2);
}

/* Стили прелоадера для разных тем */
.theme-dark .loader-content {
  background: var(--bg-color, #1a1a1a);
  color: var(--text-color, #e0e0e0);
}

.theme-sepia .loader-content {
  background: var(--bg-color, #f7f3e9);
  color: var(--text-color, #5c4b37);
}
</style>
