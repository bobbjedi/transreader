interface PaginateOptions {
  container: HTMLElement;  // сам контейнер
  measurer: HTMLElement;   // элемент для измерения текста
  wordsPerStep?: number;   // сколько слов добавляем за раз
  onProgress?: (progress: number) => void; // колбэк прогресса
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Нормализует текст, сохраняя абзацы */
export function normalizeTextPreserveParagraphs(text: string): string {
  let cleaned = text.replace(/&[a-z]+;/gi, ' ');          // HTML сущности
  cleaned = cleaned.replace(/[\u00A0\u2000-\u200B\u202F\u205F]/g, ' '); // спецсимволы
  cleaned = cleaned.replace(/\r\n|\r/g, '\n');            // приводим переносы к \n
  cleaned = cleaned.replace(/\n{2,}/g, '\n');             // множественные \n → один
  cleaned = cleaned.replace(/[ \t]+/g, ' ');              // лишние пробелы внутри строк
  return cleaned.trim();
}

/** Пагинация прямо в контейнере */
export const useTextPages = async (content: string, options: PaginateOptions): Promise<string[]> => {

  // Умная разбивка на страницы
  // const content = normalizeTextPreserveParagraphs(book.value.content);
  // console.log('Normalized content:', content);
  const newPages: string[] = [];
  if (!content || content.trim().length === 0) {
    return [];
  }

  // Ждем, пока DOM элементы будут готовы
  await sleep(100);

  // Получаем реальные размеры контейнера

  const container = options.container;
  if (!container) {
    console.error('Container not available, using fallback pagination');
    return [];
  }

  const style = getComputedStyle(container);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);

  const visibleHeight = container.clientHeight - paddingTop - paddingBottom + 10; // + 10 для зазора на лишнюю строку
  console.log('Контентная высота без паддингов:', visibleHeight);


  // console.log(`Container size: ${containerWidth}x${containerHeight}px`);

  // Создаем временный элемент для измерения текста
  const measurer = document.getElementById('reader-measurer') as HTMLElement;
  measurer.style.display = 'block';
  measurer.style.visibility = 'hidden';
  const prevPosition = container.style.position;
  container.style.position = 'fixed';
  await sleep(100);
  // document.body.appendChild(measurer);

  // console.log('Created text measurer');

  const sentences = splitByWords(content, options.wordsPerStep || 5);
  // console.log(`Found ${sentences.length} words`);

  let currentPageText = '';
  let sentenceIndex = 0;

  console.log('Start counting pages...');
  while (sentenceIndex < sentences.length) {
    if (sentenceIndex % 5000 === 0) {
      const progress = (sentenceIndex / sentences.length) * 100;
      options.onProgress?.(progress);
      await sleep(1);
    }

    // Пробуем добавить следующее предложение
    const testText = currentPageText + (currentPageText ? ' ' : '') + sentences[sentenceIndex];
    measurer.textContent = testText;
    const textHeight = measurer.scrollHeight;
    // console.log(`Testing sentence ${sentenceIndex}, height: ${textHeight}px, visibleHeight: ${visibleHeight}px`);

    // Если текст помещается на страницу
    if (textHeight <= visibleHeight) {
      currentPageText = testText;
      sentenceIndex++;
    } else {
      // Текст не помещается
      if (currentPageText.length > 0) {
        // Сохраняем текущую страницу
        newPages.push(currentPageText.trim());
        // console.log(`Page ${newPages.length} completed with ${currentPageText.length} chars`);
        currentPageText = '';
      } else {
        // Даже одно предложение не помещается - принудительно добавляем
        newPages.push((sentences[sentenceIndex] || '').trim());
        // console.log(`Page ${newPages.length} - forced single sentence`);
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

  return newPages;
}



export function splitByWords(text: string, wordsPerPage = 5): string[] {
  // Разделяем текст на слова (учитываем пробелы и переносы)
  text = text.replace(/\n\n/g, '\n');
  const words = text.split(/ /).filter(w => w.length > 0);
  const pages: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerPage) {
    const page = words.slice(i, i + wordsPerPage).join(' ');
    pages.push(page);
  }

  return pages;
}
