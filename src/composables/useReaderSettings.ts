import { ref, watch } from 'vue';


export type Theme = 'light' | 'dark' | 'sepia';


export const fontSize = ref<number>(16);
export const theme = ref<Theme>('light');
export const brightness = ref<number>(100); // в процентах, по умолчанию 100%

function saveSettings() {
  console.log('saveSettings', fontSize.value, theme.value, brightness.value);
  localStorage.setItem('reader-font-size', fontSize.value.toString());
  localStorage.setItem('reader-theme', theme.value);
  localStorage.setItem('reader-brightness', brightness.value.toString());
}

watch([fontSize, theme, brightness], () => saveSettings());


function loadSettings() {
  const savedFontSize = localStorage.getItem('reader-font-size');
  const savedTheme = localStorage.getItem('reader-theme') as Theme;
  const savedBrightness = localStorage.getItem('reader-brightness');

  if (savedFontSize) fontSize.value = parseInt(savedFontSize);
  if (savedTheme) theme.value = savedTheme || 'light' as Theme;
  if (savedBrightness) brightness.value = parseInt(savedBrightness);
}

loadSettings();

