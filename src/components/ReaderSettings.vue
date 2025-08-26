<template>
  <q-slide-transition>
    <div v-show="show" class="settings-panel">
      <q-card class="settings-card">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1 q-mb-md">Настройки чтения</div>

          <div class="q-mb-md">
            <q-item-label class="q-mb-sm">Размер шрифта: {{ fontSize }}px</q-item-label>
            <q-slider v-model="fontSize" :min="12" :max="28" :step="1" @update:model-value="onFontSizeChange"
              color="primary" />
          </div>

          <div class="q-mb-md">
            <q-item-label class="q-mb-sm">Тема</q-item-label>
            <q-btn-toggle v-model="theme" :options="[
              { label: 'Светлая', value: 'light' },
              { label: 'Темная', value: 'dark' },
              { label: 'Сепия', value: 'sepia' }
            ]" color="primary" toggle-color="accent" unelevated spread />
          </div>

          <div class="row q-gutter-sm">
            <q-btn label="Закрыть" @click="$emit('close')" color="primary" flat class="col notranslate"
              translate="no" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-slide-transition>
</template>

<script setup lang="ts">
import { fontSize, theme } from 'src/composables/useReaderSettings';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'fontSizeChanged'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onFontSizeChange() {
  emit('fontSizeChanged');
}
</script>

<style scoped>
.settings-panel {
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  z-index: 200;
}

.settings-card {
  background: var(--bg-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Улучшаем видимость кнопок переключения темы */
.settings-card .q-btn-toggle .q-btn {
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
  background: rgba(255, 255, 255, 0.8) !important;
  color: #333 !important;
}

.settings-card .q-btn-toggle .q-btn--active {
  background: var(--q-accent) !important;
  color: white !important;
  border-color: var(--q-accent) !important;
}

/* Дополнительные стили для темной темы */
.theme-dark .settings-card .q-btn-toggle .q-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #e0e0e0 !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.theme-dark .settings-card .q-btn-toggle .q-btn--active {
  background: var(--q-accent) !important;
  color: white !important;
}

/* Стили для темы сепия */
.theme-sepia .settings-card .q-btn-toggle .q-btn {
  background: rgba(92, 75, 55, 0.1) !important;
  color: #5c4b37 !important;
  border-color: rgba(92, 75, 55, 0.3) !important;
}

.theme-sepia .settings-card .q-btn-toggle .q-btn--active {
  background: var(--q-accent) !important;
  color: white !important;
}
</style>
