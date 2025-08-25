export interface CachedPages {
  bookId: string;
  fontSize: number;
  pages: string[];
  totalPages: number;
  cachedAt: number;
}

export function usePageCache() {
  const CACHE_PREFIX = 'reader-pages-cache-';
  const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах

  /**
   * Генерирует ключ кеша для книги и размера шрифта
   */
  function getCacheKey(bookId: string): string {
    return `${CACHE_PREFIX}${bookId}`;
  }

  /**
   * Сохраняет пересчитанные страницы в кеш
   */
  function savePagesToCache(bookId: string, fontSize: number, pages: string[]): void {
    const cacheData: CachedPages = {
      bookId,
      fontSize,
      pages,
      totalPages: pages.length,
      cachedAt: Date.now()
    };

    const cacheKey = getCacheKey(bookId);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`Сохранены страницы в кеш: ${cacheKey}, страниц: ${pages.length}`);
    } catch (error) {
      console.error('Ошибка сохранения в кеш:', error);
      // Если места нет, очищаем старые кеши
      clearExpiredCaches();
    }
  }

  /**
   * Загружает пересчитанные страницы из кеша
   */
  function loadPagesFromCache(bookId: string, fontSize: number): CachedPages | null {
    const cacheKey = getCacheKey(bookId);

    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cacheData: CachedPages = JSON.parse(cached);

      // Проверяем срок действия кеша
      const now = Date.now();
      if (now - cacheData.cachedAt > CACHE_EXPIRY) {
        // Кеш устарел, удаляем его
        localStorage.removeItem(cacheKey);
        console.log(`Кеш устарел и удален: ${cacheKey}`);
        return null;
      }

      // Проверяем соответствие данных
      if (cacheData.bookId !== bookId || cacheData.fontSize !== fontSize) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`Загружены страницы из кеша: ${cacheKey}, страниц: ${cacheData.pages.length}`);
      return cacheData;
    } catch (error) {
      console.error('Ошибка загрузки из кеша:', error);
      // Удаляем поврежденный кеш
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  /**
   * Проверяет есть ли кеш для данной книги и размера шрифта
   */
  function hasCachedPages(bookId: string, fontSize: number): boolean {
    return loadPagesFromCache(bookId, fontSize) !== null;
  }

  /**
   * Удаляет кеш для конкретной книги (все размеры шрифта)
   */
  function clearBookCache(bookId: string): void {
    const keys = Object.keys(localStorage);
    const bookCacheKeys = keys.filter(key =>
      key.startsWith(CACHE_PREFIX) && key.includes(`-${bookId}-`)
    );

    bookCacheKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Удален кеш: ${key}`);
    });
  }

  /**
   * Удаляет все устаревшие кеши
   */
  function clearExpiredCaches(): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    const now = Date.now();

    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheData: CachedPages = JSON.parse(cached);
          if (now - cacheData.cachedAt > CACHE_EXPIRY) {
            localStorage.removeItem(key);
            console.log(`Удален устаревший кеш: ${key}`);
          }
        }
      } catch {
        // Удаляем поврежденный кеш
        localStorage.removeItem(key);
        console.log(`Удален поврежденный кеш: ${key}`);
      }
    });
  }

  /**
   * Получает информацию о размере кеша
   */
  function getCacheInfo(): { totalCaches: number; totalSize: number } {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    let totalSize = 0;
    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });

    return {
      totalCaches: cacheKeys.length,
      totalSize
    };
  }

  /**
   * Получает информацию о кеше конкретной книги
   */
  function getBookCacheInfo(bookId: string): { caches: number; size: number; currentFontSize: number | undefined } {
    const keys = Object.keys(localStorage);
    const bookCacheKeys = keys.filter(key =>
      key.startsWith(CACHE_PREFIX) && key.includes(`-${bookId}-`)
    );

    let totalSize = 0;
    let currentFontSize: number | undefined;

    bookCacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
        // Извлекаем размер шрифта из ключа
        const fontSizeMatch = key.match(/-(\d+)$/);
        if (fontSizeMatch && fontSizeMatch[1]) {
          currentFontSize = parseInt(fontSizeMatch[1]);
        }
      }
    });

    return {
      caches: bookCacheKeys.length,
      size: totalSize,
      currentFontSize
    };
  }

  /**
   * Очищает весь кеш страниц
   */
  function clearAllCache(): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`Очищен весь кеш страниц: ${cacheKeys.length} записей`);
  }

  return {
    savePagesToCache,
    loadPagesFromCache,
    hasCachedPages,
    clearBookCache,
    clearExpiredCaches,
    getCacheInfo,
    getBookCacheInfo,
    clearAllCache
  };
}

