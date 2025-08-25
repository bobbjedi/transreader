import { useQuasar } from 'quasar';

export interface Book {
  id: string;
  title: string;
  content: string;
  pages: number;
  size: number;
  fileName: string;
}

export function useBookManager() {
  const $q = useQuasar();

  /**
   * Получить все книги из localStorage
   */
  function getAllBooks(): Book[] {
    const savedBooks = localStorage.getItem('reader-books');
    return savedBooks ? JSON.parse(savedBooks) : [];
  }

  /**
   * Сохранить книги в localStorage
   */
  function saveBooks(books: Book[]): void {
    localStorage.setItem('reader-books', JSON.stringify(books));
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
        // Удаляем книгу из списка
        const updatedBooks = books.filter(book => book.id !== id);
        saveBooks(updatedBooks);

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
    const books = getAllBooks();
    books.push(book);
    saveBooks(books);
  }

  /**
   * Получить книгу по ID
   */
  function getBookById(id: string): Book | undefined {
    const books = getAllBooks();
    return books.find(book => book.id === id);
  }

  return {
    getAllBooks,
    saveBooks,
    deleteBookById,
    addBook,
    getBookById
  };
}
