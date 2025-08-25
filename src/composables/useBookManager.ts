import { useQuasar } from 'quasar';
import { usePageCache } from './usePageCache';

// Метаданные книги (хранятся в reader-books)
export interface BookMetadata {
  id: string;
  title: string;
  pages: number;
  size: number;
  fileName: string;
  addedAt: number;
}

// Полная книга с контентом (для совместимости)
export interface Book extends BookMetadata {
  content: string;
}

// Контент книги (хранится отдельно)
export interface BookContent {
  id: string;
  content: string;
}

export function useBookManager() {
  const $q = useQuasar();
  const { clearBookCache } = usePageCache();

  /**
   * Получить все метаданные книг
   */
  function getAllBooksMetadata(): BookMetadata[] {
    const savedBooks = localStorage.getItem('reader-books');
    return savedBooks ? JSON.parse(savedBooks) : [];
  }

  /**
   * Получить все книги с контентом (для совместимости)
   */
  function getAllBooks(): Book[] {
    const metadata = getAllBooksMetadata();
    return metadata.map(meta => {
      const content = getBookContent(meta.id);
      return {
        ...meta,
        content: content || ''
      };
    });
  }

  /**
   * Получить контент книги по ID
   */
  function getBookContent(bookId: string): string | null {
    const contentKey = `reader-book-content-${bookId}`;
    return localStorage.getItem(contentKey);
  }

  /**
   * Сохранить контент книги
   */
  function saveBookContent(bookId: string, content: string): void {
    const contentKey = `reader-book-content-${bookId}`;
    localStorage.setItem(contentKey, content);
  }

  /**
   * Удалить контент книги
   */
  function deleteBookContent(bookId: string): void {
    const contentKey = `reader-book-content-${bookId}`;
    localStorage.removeItem(contentKey);
  }

  /**
   * Сохранить метаданные книг
   */
  function saveBooksMetadata(metadata: BookMetadata[]): void {
    localStorage.setItem('reader-books', JSON.stringify(metadata));
  }

  /**
   * Сохранить книги (для совместимости)
   */
  function saveBooks(books: Book[]): void {
    // Разделяем на метаданные и контент
    const metadata: BookMetadata[] = books.map(book => ({
      id: book.id,
      title: book.title,
      pages: book.pages,
      size: book.size,
      fileName: book.fileName,
      addedAt: book.addedAt || Date.now()
    }));

    // Сохраняем метаданные
    saveBooksMetadata(metadata);

    // Сохраняем контент отдельно
    books.forEach(book => {
      saveBookContent(book.id, book.content);
    });
  }

  /**
   * Удалить книгу по ID
   */
  function deleteBookById(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const books = getAllBooks();
      const bookToDelete = books.find(book => book.id === id);

      if (!bookToDelete) {
        $q.notify({
          type: 'negative',
          message: 'Книга не найдена',
          position: 'top'
        });
        resolve(false);
        return;
      }

      // Показываем диалог подтверждения
      $q.dialog({
        title: 'Удаление книги',
        message: `Вы уверены, что хотите удалить книгу "${bookToDelete.title}"?`,
        cancel: true,
        persistent: true,
        ok: {
          label: 'Удалить',
          color: 'negative'
        }
      }).onOk(() => {
        // Удаляем метаданные книги
        const metadata = getAllBooksMetadata();
        const updatedMetadata = metadata.filter(book => book.id !== id);
        saveBooksMetadata(updatedMetadata);

        // Удаляем контент книги
        deleteBookContent(id);

        // Очищаем кеш страниц для удаляемой книги
        clearBookCache(id);

        // Очищаем current-book если удаляется активная книга
        const currentBook = localStorage.getItem('current-book');
        if (currentBook) {
          const currentBookData = JSON.parse(currentBook);
          if (currentBookData.id === id) {
            localStorage.removeItem('current-book');
          }
        }

        $q.notify({
          type: 'positive',
          message: `Книга "${bookToDelete.title}" удалена`,
          position: 'top'
        });

        resolve(true);
      }).onCancel(() => {
        resolve(false);
      });
    });
  }

  /**
   * Добавить книгу
   */
  function addBook(book: Book): void {
    // Создаем метаданные
    const metadata: BookMetadata = {
      id: book.id,
      title: book.title,
      pages: book.pages,
      size: book.size,
      fileName: book.fileName,
      addedAt: Date.now()
    };

    // Добавляем метаданные
    const existingMetadata = getAllBooksMetadata();
    existingMetadata.push(metadata);
    saveBooksMetadata(existingMetadata);

    // Сохраняем контент отдельно
    saveBookContent(book.id, book.content);
  }

  /**
   * Получить книгу по ID
   */
  function getBookById(id: string): Book | undefined {
    const metadata = getAllBooksMetadata();
    const bookMeta = metadata.find(book => book.id === id);

    if (!bookMeta) return undefined;

    const content = getBookContent(id);
    if (!content) return undefined;

    return {
      ...bookMeta,
      content
    };
  }

  /**
   * Очистить все данные книг (старый и новый формат)
   */
  function clearAllBooksData(): void {
    // Очищаем старый формат
    localStorage.removeItem('reader-books');

    // Очищаем контент всех книг
    const keys = Object.keys(localStorage);
    const contentKeys = keys.filter(key => key.startsWith('reader-book-content-'));
    contentKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('Очищены все данные книг');
  }

  return {
    getAllBooks,
    getAllBooksMetadata,
    getBookContent,
    saveBooks,
    saveBooksMetadata,
    saveBookContent,
    deleteBookById,
    deleteBookContent,
    addBook,
    getBookById,
    clearAllBooksData
  };
}
