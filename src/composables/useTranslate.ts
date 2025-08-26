import rawDict from './dictionary_transformed.json';

const raw = rawDict as Record<string, string[]>

const dictionary = new Map<string, string[]>();
for (const word in raw) {
  dictionary.set(word, raw[word]!);
}

const _translateWord = (word: string): string => {
  return wordListTranslates(word)[0] || word;
};


export const translatePhrase = (text: string) => {
  text = text.replace(/[’‘`]/g, "'");

  // 1. Разбиваем текст на слова, пробелы и знаки препинания
  const tokens = text.match(/[a-zA-Z]+(?:['’][a-zA-Z]+)?|[^a-zA-Z\s]+|\s+/g) || [];

  let wordIndex = 0;
  const wordMap: string[] = [];

  const articles = ['a', 'an', 'the'];

  // 2. Заменяем слова на шаблоны {{#i}} и сохраняем их в wordMap
  const templatedTokens = tokens
    .filter(token => !articles.includes(token.toLowerCase()))
    .map(token => {
      if (/^[a-zA-Z']+$/.test(token)) {
        wordMap.push(token);
        return `{{#${wordIndex++}}}`;
      }
      return token;
    });

  let templatedText = templatedTokens.join('');
  // 3. Заменяем шаблоны на переводы
  wordMap.forEach((word, index) => {
    const re = new RegExp(`{{#${index}}}`);
    templatedText = templatedText.replace(re, _translateWord(word));
  });

  return templatedText;
};


export const wordListTranslates = (word: string): string[] => {
  const lower = word.toLowerCase();
  const translations = dictionary.get(word.toLowerCase());
  if (translations) {
    return translations;
  }

  let baseWord = lower;

  // Простейший вариант: удаляем множественное число
  if (lower.endsWith('ies')) {
    baseWord = lower.slice(0, -3) + 'y';
  } else if (lower.endsWith('es')) {
    baseWord = lower.slice(0, -2);
  } else if (lower.endsWith('s')) {
    baseWord = lower.slice(0, -1);
  }

  const baseTranslations = dictionary.get(baseWord);
  if (baseTranslations) {
    return baseTranslations;
  }

  return [word];
}


export const wrapContentToWords = (content: string) => {
  return content.replace(/\b[a-zA-Z]+(?:['-][a-zA-Z]+)*\b/g, (word) => {
    return `<span class="clickable-word" data-word="${word}">${word}</span>`;
  });
}
