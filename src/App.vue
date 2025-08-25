<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { wordListTranslates } from './composables/useTranslate';

const $q = useQuasar();

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof Element) {
    if (target.classList.contains('clickable-word')) {
      $q.notify({
        html: true,
        message: `<div><center> <b>${target.textContent?.toUpperCase()}</b></center></div>
        <div><i>${wordListTranslates(target.textContent!).join(' | ')}</i></div>
        `,
        position: 'top',
        timeout: 5000,
        color: 'primary',
        textColor: 'white',
        actions: [
          {
            icon: 'close',
            color: 'white',
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
