const fs = require('fs');
const rawArray = JSON.parse(fs.readFileSync('dictionary.json', 'utf8'));
const dict = {};

rawArray.forEach(item => {
  // отрезаем транскрипцию в скобках
  const ruClean = item.ru.replace(/\[.*?\]\s*—\s*/, '');
  const translations = ruClean.split(',').map(s => s.trim().toLowerCase());
  
  dict[item.en.toLowerCase()] = translations.filter(t => t.trim());
});

fs.writeFileSync('dictionary_transformed.json', JSON.stringify(dict, null, 2));