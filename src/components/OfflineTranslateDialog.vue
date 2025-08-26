<template>
  <div class="translate-dialog-container" v-if="!isOnline">
    <!-- Прозрачная кнопка вверху справа -->
    <q-btn flat round dense icon="translate" class="translate-btn" @click="showDialog = true" :style="{ opacity: 0.3 }"
      color="negative" />


    <!-- Maximize диалог -->
    <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down"
      class="translate-dialog">
      <q-card class="translate-card">
        <q-card-section class="translate-header">
          <div class="text-h6">Перевод
            <q-btn flat round dense icon="close" @click="showDialog = false" class="close-btn" />
          </div>
        </q-card-section>

        <q-card-section class="translate-content">
          <div v-if="sentences.length === 0" class="text-section">
            <div class="text-label">Нет текста для перевода</div>
          </div>

          <div v-else class="sentences-container">
            <div v-for="(sentence, index) in sentences" :key="index" class="sentence-pair">
              <div class="text-section">
                <div class="text-original" v-html="wrapContentToWords(sentence.original)"></div>
              </div>

              <div class="text-section">
                <div class="text-translation">{{ sentence.translation }}</div>
              </div>

              <q-separator v-if="index < sentences.length - 1" />
            </div>
          </div>
        </q-card-section>

        <PagesPaginator :current-page="currentPage" :total-pages="totalPages" @prev-page="onPrevPage"
          @next-page="onNextPage" />

        <q-card-actions class="translate-actions">
          <q-btn label="Закрыть" color="primary" unelevated @click="showDialog = false"
            class="full-width close-action-btn" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { translatePhrase, wrapContentToWords } from 'src/composables/useTranslate';
import { useOnlineStatus } from 'src/composables/useIsOnline';
import PagesPaginator from './PagesPaginator.vue';

const { isOnline } = useOnlineStatus();

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

<style scoped></style>
