import { ref, watch } from 'vue';


export type Theme = 'light' | 'dark' | 'sepia';


export const fontSize = ref<number>(16);
export const theme = ref<Theme>('light');

function saveSettings() {
  console.log('saveSettings', fontSize.value, theme.value);
  localStorage.setItem('reader-font-size', fontSize.value.toString());
  localStorage.setItem('reader-theme', theme.value);
}

watch([fontSize, theme], () => saveSettings());


function loadSettings() {
  const savedFontSize = localStorage.getItem('reader-font-size');
  const savedTheme = localStorage.getItem('reader-theme') as Theme;

  if (savedFontSize) fontSize.value = parseInt(savedFontSize);
  if (savedTheme) theme.value = savedTheme || 'light' as Theme;
}

loadSettings();

