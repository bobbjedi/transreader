<template>
    <div class="app-page">
        <!-- Hero секция -->
        <div class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">📚 Мои книги</h1>
                    <p class="hero-subtitle">Загружайте книги в форматах FB2 и TXT для изучения языков</p>
                </div>
            </div>
        </div>

        <!-- Основной контент -->
        <div class="main-content">
            <div class="container">
                <!-- Загрузка файла -->
                <div class="upload-section">
                    <div class="upload-card">
                        <div class="upload-content">
                            <div class="upload-info">
                                <q-icon name="cloud_upload" size="24px" color="primary" />
                                <div>
                                    <div class="upload-title">Загрузить книгу</div>
                                    <div class="upload-description">FB2, TXT файлы</div>
                                </div>
                            </div>
                            
                            <q-file 
                                v-model="selectedFile" 
                                label="Выберите файл" 
                                accept=".fb2,.txt" 
                                :loading="isLoading" 
                                @update:model-value="handleFileSelect"
                                class="upload-input"
                                outlined
                                dense
                            >
                                <template v-slot:prepend>
                                    <q-icon name="attach_file" />
                                </template>
                            </q-file>
                        </div>
                    </div>
                </div>

                <!-- Список книг -->
                <div v-if="books.length > 0" class="books-section">
                    <div class="section-header">
                        <h2 class="section-title">Загруженные книги</h2>
                        <p class="section-subtitle">{{ books.length }} {{ books.length === 1 ? 'книга' : books.length <
                            5 ? 'книги' : 'книг' }}</p>
                    </div>

                    <q-list class="books-list" bordered separator>
                        <q-item v-for="book in books" :key="book.id" clickable @click="openBook(book)"
                            class="book-item">
                            <q-item-section avatar>
                                <q-avatar color="primary" text-color="white" size="40px">
                                    <q-icon name="book" />
                                </q-avatar>
                            </q-item-section>

                            <q-item-section>
                                <q-item-label class="book-title">{{ book.title }}</q-item-label>
                                <q-item-label caption class="book-meta">
                                    {{ book.pages }} страниц • {{ formatFileSize(book.size) }}
                                </q-item-label>
                            </q-item-section>

                            <q-item-section side>
                                <div class="book-actions">
                                    <q-btn flat round dense icon="edit" color="primary"
                                        @click.stop="handleRenameBook(book)" size="sm">
                                        <q-tooltip>Переименовать</q-tooltip>
                                    </q-btn>
                                    <q-btn flat round dense icon="delete" color="negative"
                                        @click.stop="handleDeleteBook(book.id)" size="sm">
                                        <q-tooltip>Удалить</q-tooltip>
                                    </q-btn>
                                    <q-icon name="chevron_right" color="grey-5" />
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Пустое состояние -->
                <div v-else class="empty-state">
                    <div class="empty-icon">
                        <q-icon name="library_books" size="80px" />
                    </div>
                    <h3 class="empty-title">Библиотека пуста</h3>
                    <p class="empty-description">
                        Загрузите первую книгу в поддерживаемом формате, чтобы начать изучение языков
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { Book } from 'src/composables/useBookManager';
import { useBookManager, type BookMetadata } from 'src/composables/useBookManager';

const router = useRouter();
const $q = useQuasar();
const { getAllBooksMetadata, deleteBookById, addBook, saveBooksMetadata } = useBookManager();

const selectedFile = ref<File | null>(null);
const isLoading = ref(false);
const books = ref<BookMetadata[]>([]);
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
    books.value = getAllBooksMetadata();
}

async function handleFileSelect(file: File | null) {
    if (!file) return;

    isLoading.value = true;

    try {
        const content = await readFile(file);
        const parsedBook = parseBook(file, content);

        addBook(parsedBook);
        books.value = getAllBooksMetadata();

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
        fileName: file.name,
        addedAt: Date.now()
    };
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function openBook(book: BookMetadata) {
    saveSettings();
    localStorage.setItem('current-book', JSON.stringify(book));
    localStorage.setItem('reader-settings', JSON.stringify({
        fontSize: fontSize.value,
        theme: theme.value
    }));
    void router.push(`/app/reader/${book.id}`);
}

async function handleDeleteBook(bookId: string) {
    const success = await deleteBookById(bookId);
    if (success) {
        // Обновляем список книг после удаления
        books.value = getAllBooksMetadata();
    }
}

async function handleRenameBook(book: BookMetadata) {
    const newTitle = await new Promise<string | undefined>((resolve) => {
        $q.dialog({
            title: 'Переименовать книгу',
            message: 'Введите новое название:',
            prompt: {
                model: book.title,
                type: 'text',
                isValid: (val: string) => val.length > 0 && val.length <= 100
            },
            cancel: true,
            persistent: true,
            ok: {
                label: 'Сохранить',
                color: 'primary'
            }
        }).onOk((value: string) => {
            resolve(value);
        }).onCancel(() => {
            resolve(undefined);
        });
    });

    if (newTitle && newTitle.trim() && newTitle !== book.title) {
        try {
            // Получаем все метаданные
            const allMetadata = getAllBooksMetadata();
            const bookIndex = allMetadata.findIndex(b => b.id === book.id);

            if (bookIndex !== -1) {
                // Обновляем название
                allMetadata[bookIndex] = {
                    ...allMetadata[bookIndex],
                    title: newTitle.trim()
                } as BookMetadata;

                // Сохраняем обновленные метаданные
                saveBooksMetadata(allMetadata);

                // Обновляем список книг
                books.value = getAllBooksMetadata();

                $q.notify({
                    type: 'positive',
                    message: `Книга переименована в "${newTitle.trim()}"`,
                    position: 'top'
                });
            }
        } catch (error) {
            console.error('Ошибка при переименовании книги:', error);
            $q.notify({
                type: 'negative',
                message: 'Ошибка при переименовании книги',
                position: 'top'
            });
        }
    }
}
</script>

<style scoped>
.app-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Hero секция */
.hero-section {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 40px 0;
    text-align: center;
}

.hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1e293b;
}

.hero-subtitle {
    font-size: 1.1rem;
    color: #475569;
    margin: 0;
}

/* Основной контент */
.main-content {
    padding: 60px 0;
}

/* Секция загрузки */
.upload-section {
  margin-bottom: 40px;
}

.upload-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.upload-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.upload-description {
  color: #64748b;
  font-size: 0.85rem;
}

.upload-input {
  flex: 1;
  max-width: 280px;
}

/* Секция книг */
.books-section {
    margin-bottom: 40px;
}

.section-header {
    text-align: center;
    margin-bottom: 40px;
}

.section-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1e293b;
}

.section-subtitle {
    color: #64748b;
    margin: 0;
}

.books-list {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    max-width: 800px;
    margin: 0 auto;
}

.book-item {
    transition: all 0.2s ease;
}

.book-item:hover {
    background: #f8fafc;
}

.book-title {
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}

.book-meta {
    color: #64748b !important;
    font-size: 0.85rem;
}

.book-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* Пустое состояние */
.empty-state {
    text-align: center;
    padding: 80px 20px;
}

.empty-icon {
    width: 120px;
    height: 120px;
    background: #f1f5f9;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 32px;
    color: #94a3b8;
}

.empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #475569;
}

.empty-description {
    color: #64748b;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
}

/* Мобильная адаптивность */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }

    .upload-card {
        padding: 16px;
        margin: 0 16px;
    }
    
    .upload-content {
        flex-direction: column;
        gap: 16px;
    }
    
    .upload-info {
        justify-content: center;
    }

    .books-list {
        margin: 0 16px;
        border-radius: 8px;
    }

    .main-content {
        padding: 40px 0;
    }

    .upload-section {
        margin-bottom: 40px;
    }
}

/* Темная тема */
.body--dark .app-page {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
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

.body--dark .upload-card {
    background: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
}

.body--dark .upload-title {
    color: #f8fafc;
}

.body--dark .upload-description {
    color: #cbd5e1;
}

.body--dark .section-title {
    color: #f8fafc;
}

.body--dark .section-subtitle {
    color: #cbd5e1;
}

.body--dark .books-list {
    background: #1e293b;
    border-color: #334155;
}

.body--dark .book-item:hover {
    background: #334155;
}

.body--dark .book-title {
    color: #f8fafc;
}

.body--dark .book-meta {
    color: #cbd5e1 !important;
}

.body--dark .empty-icon {
    background: #334155;
    color: #64748b;
}

.body--dark .empty-title {
    color: #cbd5e1;
}

.body--dark .empty-description {
    color: #94a3b8;
}
</style>
