<template>
  <div class="translate-dialog-container" v-if="isOnline">
    <!-- Прозрачная кнопка вверху справа -->
    <q-btn flat round dense icon="translate" class="translate-btn" @click="showDialog = true" :style="{ opacity: 0.3 }"
      color="positive" />


    <!-- Maximize диалог -->
    <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down"
      class="translate-dialog">
      <q-card class="translate-card">
        <q-card-section class="translate-header">
          <div class="text-bold notranslate flex items-center justify-between" translate="no">
            <span :class="{
              'text-negative': !isBrowserTranslateActive,
              'text-positive': isBrowserTranslateActive
            }">{{
              isBrowserTranslateActive
                ? 'Браузерный перевод активен'
                : 'Для работы включите браузерный перевод'
            }}</span>
            <q-btn flat round dense icon="close" @click="showDialog = false" class="close-btn" />
          </div>
        </q-card-section>

        <q-card-section class="translate-content">
          <div v-if="sentences.length === 0" class="text-section">
            <div class="text-label">Нет текста для перевода</div>
          </div>

          <div v-else class="sentences-container">
            <div v-for="(sentence, index) in sentences" :key="index" class="sentence-pair">
              <div class="text-section notranslate" translate="no">
                <div class="text-original" v-html="wrapContentToWords(sentence.original)"></div>
              </div>

              <div class="text-section">
                <div class="text-translation">{{ sentence.original }}</div>
              </div>

              <q-separator v-if="index < sentences.length - 1" class="q-my-md" />
            </div>
          </div>
        </q-card-section>

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

const { isOnline, isBrowserTranslateActive } = useOnlineStatus();

interface Props {
  pageText: string;
}

const props = defineProps<Props>();

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

<style scoped>
.translate-btn {
  position: fixed;
  top: 46px;
  right: 16px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease;
}

.translate-btn:hover {
  opacity: 0.8 !important;
}

.sentences-container {
  /* max-height: 90vh; */
  overflow-y: auto;
}

.sentence-pair {
  margin-bottom: 20px;
}

.sentence-pair:last-child {
  margin-bottom: 0;
}

.text-section {
  margin-bottom: 3px;
}

.text-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--q-primary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-original,
.text-translation {
  background: var(--q-bg-color);
  padding: 0 16px;
  border-radius: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  border-left: 4px solid var(--q-primary);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.text-translation {
  border-left-color: var(--q-secondary);
}
</style>
