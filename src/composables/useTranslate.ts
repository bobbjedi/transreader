import rawDict from './dictionary_transformed.json';

const raw = rawDict as Record<string, string[]>

const dictionary = new Map<string, string[]>();
for (const word in raw) {
  dictionary.set(word, raw[word]!);
}

export const translateWord = (word: string): string => {
  const lower = word.toLowerCase();
  let translation = dictionary.get(lower)?.[0];

  // Если слово не найдено
  if (!translation) {
    let baseWord = lower;

    // Простейший вариант: удаляем множественное число
    if (lower.endsWith('ies')) {
      baseWord = lower.slice(0, -3) + 'y';
    } else if (lower.endsWith('es')) {
      baseWord = lower.slice(0, -2);
    } else if (lower.endsWith('s')) {
      baseWord = lower.slice(0, -1);
    }

    const baseTranslation = dictionary.get(baseWord)?.[0];
    if (baseTranslation) {
      translation = `${baseTranslation}[мн]`;
    } else {
      translation = word; // ничего не нашли
    }
  }

  // Сохраняем регистр исходного слова
  if (word === word.toUpperCase()) {
    return translation.toUpperCase();
  } else if (word[0]?.toUpperCase() === word[0]) {
    return translation[0]?.toUpperCase() + translation.slice(1);
  } else {
    return translation;
  }
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
    templatedText = templatedText.replace(re, translateWord(word));
  });

  return templatedText;
};



