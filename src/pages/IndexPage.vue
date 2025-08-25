<template>
  <q-page class="flex column items-center justify-center q-pa-md">
    <div class="text-h4 q-mb-lg text-center">
      📚 Мобильная читалка
    </div>

    <div class="column q-gutter-md" style="max-width: 400px; width: 100%;">
      <!-- Выбор файла -->
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Выберите книгу</div>
          <q-file v-model="selectedFile" label="Выберите файл (FB2, TXT)" accept=".fb2,.txt" filled :loading="isLoading"
            @update:model-value="handleFileSelect">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>
      </q-card>

      <!-- Список загруженных книг -->
      <q-card v-if="books.length > 0" class="q-pa-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Мои книги</div>
          <q-list separator>
            <q-item v-for="book in books" :key="book.id" clickable @click="openBook(book)" class="q-py-sm">
              <q-item-section>
                <q-item-label>{{ book.title }}</q-item-label>
                <q-item-label caption>
                  {{ book.pages }} страниц • {{ formatFileSize(book.size) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" color="negative" @click.stop="handleDeleteBook(book.id)"
                  class="q-mr-sm">
                  <q-tooltip>Удалить книгу</q-tooltip>
                </q-btn>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Настройки -->
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Настройки</div>

          <div class="q-mb-md">
            <q-item-label class="q-mb-sm">Размер шрифта: {{ fontSize }}px</q-item-label>
            <q-slider v-model="fontSize" :min="12" :max="24" :step="1" label color="primary" />
          </div>

          <div class="q-mb-md">
            <q-item-label class="q-mb-sm">Тема</q-item-label>
            <q-btn-toggle v-model="theme" :options="[
              { label: 'Светлая', value: 'light' },
              { label: 'Темная', value: 'dark' },
              { label: 'Сепия', value: 'sepia' }
            ]" color="primary" text-color="primary" toggle-color="primary" unelevated spread />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useBookManager, type Book } from 'src/composables/useBookManager';

const router = useRouter();
const $q = useQuasar();
const { getAllBooks, deleteBookById, addBook } = useBookManager();

const selectedFile = ref<File | null>(null);
const isLoading = ref(false);
const books = ref<Book[]>([]);
const fontSize = ref(16);
const theme = ref('light');

onMounted(() => {
  loadSettings();
  loadBooks();
});

function loadSettings() {
  const savedFontSize = localStorage.getItem('reader-font-size');
  const savedTheme = localStorage.getItem('reader-theme');

  if (savedFontSize) fontSize.value = parseInt(savedFontSize);
  if (savedTheme) theme.value = savedTheme;
}

function saveSettings() {
  localStorage.setItem('reader-font-size', fontSize.value.toString());
  localStorage.setItem('reader-theme', theme.value);
}

function loadBooks() {
  books.value = getAllBooks();
}

async function handleFileSelect(file: File | null) {
  if (!file) return;

  isLoading.value = true;

  try {
    const content = await readFile(file);
    const parsedBook = parseBook(file, content);

    addBook(parsedBook);
    books.value = getAllBooks();

    $q.notify({
      type: 'positive',
      message: `Книга "${parsedBook.title}" успешно загружена`,
      position: 'top'
    });

    // Автоматически открываем книгу
    openBook(parsedBook);

  } catch (error) {
    console.error('Error processing file:', error);
    $q.notify({
      type: 'negative',
      message: 'Ошибка при обработке файла',
      position: 'top'
    });
  } finally {
    isLoading.value = false;
    selectedFile.value = null;
  }
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

function parseBook(file: File, content: string): Book {
  const id = Date.now().toString();
  let title = file.name.replace(/\.(fb2|txt)$/i, '');
  let cleanContent = content;

  // Парсинг FB2
  if (file.name.toLowerCase().endsWith('.fb2')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');

    // Проверяем на ошибки парсинга
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.warn('FB2 parsing error, treating as plain text');
      cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } else {
      // Отладочная информация о структуре документа
      console.log('FB2 Document structure:');
      console.log('Root element:', doc.documentElement.tagName);
      console.log('Child elements:', Array.from(doc.documentElement.children).map(el => el.tagName));

      // Извлекаем заголовок
      const titleElement = doc.querySelector('book-title') ||
        doc.querySelector('title-info book-title') ||
        doc.querySelector('title');
      if (titleElement) {
        title = titleElement.textContent?.trim() || title;
      }

      // Извлекаем текст из различных возможных структур FB2
      let paragraphs: Element[] = [];

      // Пробуем различные селекторы для извлечения текста
      const selectors = [
        'body p',
        'section p',
        'body section p',
        'FictionBook body section p',
        'text p',
        'p',
        'section',
        'body section',
        'text section',
        'FictionBook section'
      ];

      for (const selector of selectors) {
        paragraphs = Array.from(doc.querySelectorAll(selector));
        if (paragraphs.length > 0) {
          console.log(`Found ${paragraphs.length} elements with selector: ${selector}`);
          break;
        }
      }

      if (paragraphs.length > 0) {
        cleanContent = paragraphs
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 3) // Минимум 3 символа
          .join('\n\n');
      } else {
        // Если не нашли ничего, попробуем извлечь весь текст
        console.log('No structured elements found, trying to extract all text');

        // Пробуем разные корневые элементы
        const rootCandidates = [
          doc.querySelector('body'),
          doc.querySelector('FictionBook'),
          doc.querySelector('text'),
          doc.documentElement
        ];

        for (const root of rootCandidates) {
          if (root) {
            const allText = root.textContent || '';
            if (allText.trim().length > 100) { // Минимум 100 символов
              cleanContent = allText
                .replace(/\s+/g, ' ') // Заменяем множественные пробелы
                .replace(/(.{100})/g, '$1\n\n') // Разбиваем на абзацы каждые 100 символов
                .trim();
              console.log(`Extracted text from root element, length: ${cleanContent.length}`);
              break;
            }
          }
        }
      }

      // Если все еще пусто, попробуем парсить как обычный XML/HTML
      if (!cleanContent || cleanContent.length < 50) {
        console.log('Fallback: parsing as plain XML');
        cleanContent = content
          .replace(/<[^>]*>/g, ' ') // Удаляем все теги
          .replace(/\s+/g, ' ') // Заменяем множественные пробелы
          .trim();
      }
    }

    console.log(`FB2 parsed: title="${title}", content length=${cleanContent.length}`);
  }

  // Разбиваем на страницы (примерно 1000 символов на страницу)
  const wordsPerPage = 250;
  const words = cleanContent.split(/\s+/);
  const pages = Math.ceil(words.length / wordsPerPage);

  return {
    id,
    title,
    content: cleanContent,
    pages,
    size: file.size,
    fileName: file.name
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function openBook(book: Book) {
  saveSettings();
  localStorage.setItem('current-book', JSON.stringify(book));
  localStorage.setItem('reader-settings', JSON.stringify({
    fontSize: fontSize.value,
    theme: theme.value
  }));
  void router.push(`/reader/${book.id}`);
}

async function handleDeleteBook(bookId: string) {
  const success = await deleteBookById(bookId);
  if (success) {
    // Обновляем список книг после удаления
    books.value = getAllBooks();
  }
}
</script>
