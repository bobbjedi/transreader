<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { wordListTranslates } from './composables/useTranslate';
import { useOnlineStatus } from './composables/useIsOnline';
import { useVocabulary } from './composables/useVocabulary';

const $q = useQuasar();

const { isOnline } = useOnlineStatus();
const { addWord } = useVocabulary();

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof Element) {
    if (target.classList.contains('clickable-word')) {
      // Сохраняем слово в словарь (если его еще нет)
      const word = target.textContent;
      if (word) {
        addWord(word);
      }

      $q.notify({
        html: true,
        message: `
        <div><center> <b class="notranslate" translate="no">${target.textContent?.toUpperCase()}</b></center></div>
        <div display="${isOnline.value ? 'block' : 'none'}"><center> Browser translate: <i>${target.textContent?.toUpperCase()}</i></center></div>
        <div><i>${wordListTranslates(target.textContent!).join(' | ')}</i></div>
        `,
        position: 'top',
        timeout: 2000,
        color: 'primary',
        textColor: 'white',
        actions: [
          {
            icon: 'close',
            color: 'white',
            class: 'notranslate',
            translate: 'no',
            round: false,
            handler: () => {
              target.classList.remove('clickable-word-clicked');
            }
          }
        ]
      });
    }
  }
});
</script>
