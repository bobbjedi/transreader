import rawDict from './dictionary_transformed.json';

const raw = rawDict as Record<string, string[]>

const dictionary = new Map<string, string[]>();
for (const word in raw) {
  dictionary.set(word, raw[word]!);
}

export const translateWord = (word: string): string => {
  const lower = word.toLowerCase();
  const translation = dictionary.get(lower)?.[0] || word;
  if (word === word.toUpperCase()) {
    return translation.toUpperCase();
  } else if (word[0]?.toUpperCase() === word[0]) {
    return translation[0]?.toUpperCase() + translation.slice(1);
  } else {
    return translation;
  }
}

export const translatePhrase = (text: string) => {
  const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
  const words = cleaned.split(/\s+/).filter(Boolean);

  let translatedText = text;

  words.forEach(word => {
    const re = new RegExp(`\\b${word}\\b`, 'g');
    translatedText = translatedText.replace(re, translateWord(word));
  });

  return translatedText;
}


