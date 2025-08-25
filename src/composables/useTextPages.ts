interface PaginateOptions {
  container: HTMLElement;  // сам контейнер
  measurer: HTMLElement;   // элемент для измерения текста
  wordsPerStep?: number;   // сколько слов добавляем за раз
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
  const text = normalizeTextPreserveParagraphs(content);

  // Небольшая задержка чтобы прелоадер успел показаться
  await sleep(100);

  console.log('updatePages called, book content length:', text.length);

  // Умная разбивка на страницы
  const newPages: string[] = [];

  if (!text || text.trim().length === 0) {
    console.warn('Text is empty!');
    return ['Нет содержимого для отображения'];
  }

  // РЕАЛЬНАЯ пагинация основанная на размерах экрана
  console.log(`=== REAL PAGINATION DEBUG ===`);
  console.log('Original content length:', text.length);

  // Ждем, пока DOM элементы будут готовы
  await sleep(100);

  if (!options.container) {
    console.error('Container not available, using fallback pagination');
    return ['Нет содержимого для отображения'];
  }
  // Получаем реальные размеры контейнера
  const containerRect = options.container.getBoundingClientRect();
  // const containerWidth = containerRect.width - 40; // отступы
  const containerHeight = containerRect.height; // отступы + header

  // console.log(`Container size: ${containerWidth}x${containerHeight}px`);

  // Создаем временный элемент для измерения текста
  const measurer = options.measurer;
  measurer.style.display = 'block';
  const prevPosition = options.container.style.position;
  options.container.style.position = 'fixed';
  await sleep(100);
  // document.body.appendChild(measurer);

  console.log('Created measurer');

  // Разбиваем на предложения для точной пагинации
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  console.log(`Found ${sentences.length} sentences`);

  let currentPageText = '';
  let sentenceIndex = 0;

  while (sentenceIndex < sentences.length) {
    // Пробуем добавить следующее предложение
    const testText = currentPageText + (currentPageText ? ' ' : '') + sentences[sentenceIndex];
    measurer.textContent = testText;

    const textHeight = measurer.scrollHeight;
    console.log(`Testing sentence ${sentenceIndex}, height: ${textHeight}px, containerHeight: ${containerHeight}px`);

    // Если текст помещается на страницу
    if (textHeight <= containerHeight) {
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


    // Добавляем последнюю страницу
    if (currentPageText.trim().length > 0) {
      newPages.push(currentPageText.trim());
      console.log(`Final page ${newPages.length} with ${currentPageText.length} chars`);
    }

    options.container.style.position = prevPosition;
    measurer.style.display = 'none';

    await sleep(100);
  }
  console.log('New pages:', newPages);
  return newPages;
}

