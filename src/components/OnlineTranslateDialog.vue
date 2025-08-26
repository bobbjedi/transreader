<template>
  <div class="translate-dialog-container">
    <!-- Прозрачная кнопка вверху справа -->
    <q-btn flat round dense icon="translate" class="translate-btn" @click="showDialog = true" :style="{ opacity: 0.5 }"
      :color="btnColor" />

    <!-- Maximize диалог -->
    <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down"
      class="translate-dialog">
      <div class="swipe-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
        @touchend="handleTouchEnd">
        <q-card class="translate-card">
          <q-card-section class="translate-header">
            <div class="text-bold notranslate flex items-center justify-between" translate="no">
              <span :class="headerClassColor">{{ headerMessage }}</span>
              <q-btn flat round dense icon="close" @click="showDialog = false" class="close-btn notranslate"
                translate="no" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="translate-content">
            <div v-if="sentences.length === 0" class="text-section">
              <div class="text-label">Нет текста для перевода</div>
            </div>

            <div v-else class="sentences-container">
              <div v-for="(sentence, index) in sentences" :key="index" class="sentence-pair">
                <div class="text-section notranslate" translate="no" :style="{ fontSize: fontSize + 'px' }">
                  <div class="text-original" v-html="wrapContentToWords(sentence.original)"></div>
                </div>

                <div class="text-section" :style="{ fontSize: fontSize + 'px' }">
                  <div class="text-translation" v-if="isBrowserTranslateActive">{{ sentence.original }}</div>
                  <div class="text-translation" v-else>{{ sentence.translation }}</div>
                </div>

                <q-separator v-if="index < sentences.length - 1" />
              </div>
            </div>
          </q-card-section>
          <PagesPaginator :current-page="currentPage" :total-pages="totalPages" @prev-page="onPrevPage"
            @next-page="onNextPage" />
          <q-card-actions class="translate-actions">
            <q-btn label="Закрыть" color="primary" unelevated @click="showDialog = false"
              class="full-width close-action-btn notranslate" translate="no" />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>


  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { translatePhrase, wrapContentToWords } from 'src/composables/useTranslate';
import { useOnlineStatus } from 'src/composables/useIsOnline';
import PagesPaginator from './PagesPaginator.vue';
import { fontSize } from 'src/composables/useReaderSettings';
import { useSwipeNavigation } from 'src/composables/useSwipeNavigation';

const { isOnline, isBrowserTranslateActive } = useOnlineStatus();


const btnColor = computed(() => {
  if (!isOnline.value) {
    return 'negative';
  }
  if (!isBrowserTranslateActive.value) {
    return 'warning';
  }
  return 'positive';
});

const headerClassColor = computed(() => {
  if (!isOnline.value) {
    return 'text-negative';
  }
  if (!isBrowserTranslateActive.value) {
    return 'text-warning';
  }
  return 'text-positive';
})

const headerMessage = computed(() => {
  if (!isOnline.value) {
    return 'Интернета нет (низкокачественный перевод)';
  }
  if (!isBrowserTranslateActive.value) {
    return 'Включите "Перевости страницу" в браузере';
  }
  return 'Онлайн перевод активен';
})

interface Props {
  pageText: string;
  currentPage: number;
  totalPages: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'prevPage'): void;
  (e: 'nextPage'): void;
}>();

const onPrevPage = () => {
  emit('prevPage');
}

const onNextPage = () => {
  emit('nextPage');
}

const showDialog = ref(false);

// Используем composable для свайпов
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeNavigation(
  onPrevPage,
  onNextPage,
  {
    disabled: () => showDialog.value === false
  }
);
const sentences = ref<Array<{ original: string; translation: string }>>([]);

// Разбиваем текст на предложения и переводим каждое
const processText = () => {
  if (!props.pageText || !props.pageText.trim() || showDialog.value === false) {
    sentences.value = [];
    return;
  }

  // Разбиваем по точкам, восклицательным и вопросительным знакам
  const sentenceRegex = /[.!?]+/g;
  const textParts = props.pageText.split(sentenceRegex);

  const newSentences: Array<{ original: string; translation: string }> = [];

  for (let i = 0; i < textParts.length; i++) {
    const part = textParts[i]?.trim();
    if (part) {
      try {
        const translation = translatePhrase(part);
        newSentences.push({
          original: part,
          translation: translation
        });
      } catch (error) {
        console.error('Ошибка перевода предложения:', error);
        newSentences.push({
          original: part,
          translation: 'Ошибка перевода'
        });
      }
    }
  }

  sentences.value = newSentences;
};

// Следим за изменениями текста страницы
watch(() => props.pageText, processText, { immediate: true });

// Обновляем перевод при открытии диалога
watch(showDialog, processText);
</script>

<style scoped>
.swipe-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
