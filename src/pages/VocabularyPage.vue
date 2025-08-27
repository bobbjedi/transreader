<template>
    <q-page class="vocabulary-page notranslate" translate="no">
        <div class="container q-pa-sm">
            <!-- Заголовок -->
            <div class="text-center q-mb-xl">
                <div class="text-h4 q-mb-md">
                    📚 Мой Словарь
                </div>
                <div class="text-body1 text-grey-6">
                    Изучайте слова через интерактивные тесты
                </div>
            </div>

            <!-- Статистика -->
            <q-list class="q-mb-xl">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="library_books" color="primary" size="md" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Всего слов в изучении</q-item-label>
                        <q-item-label caption>Добавлено из книг</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-badge color="primary" :label="totalWords" />
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="refresh" color="orange" size="md" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Нужно повторить</q-item-label>
                        <q-item-label caption>Слова с нулевым прогрессом</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-badge color="orange" :label="wordsToReview" />
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="school" color="positive" size="md" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Изучено</q-item-label>
                        <q-item-label caption>Слова удалены как выученные</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-badge color="positive" :label="stats.totalWordsLearned" />
                    </q-item-section>
                </q-item>
            </q-list>

            <!-- Тест слов -->
            <WordTest @go-to-books="goToBooks" />

            <!-- Информация о словах (опционально) -->
            <q-card v-if="vocabulary.length > 0" class="q-mt-xl">
                <q-card-section>
                    <div class="text-h6 q-mb-md">📝 Мои слова</div>
                    <div class="row q-gutter-sm">
                        <q-chip v-for="word in vocabulary.slice(0, 10)" :key="word.w" :color="getChipColor(word.c)"
                            text-color="white" :label="`${word.w} (${word.c}/5)`" />
                        <q-chip v-if="vocabulary.length > 10" color="grey" text-color="white"
                            :label="`... еще ${vocabulary.length - 10}`" />
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useVocabulary } from 'src/composables/useVocabulary';
import WordTest from 'src/components/WordTest.vue';

const router = useRouter();

// Vocabulary composable
const {
    vocabulary,
    stats,
    totalWords,
    wordsToReview
} = useVocabulary();

function goToBooks() {
    void router.push('/app');
}

// Цвет чипа в зависимости от прогресса
function getChipColor(count: number): string {
    if (count === 0) return 'red';
    if (count === 1) return 'orange';
    if (count === 2) return 'amber';
    if (count === 3) return 'lime';
    if (count === 4) return 'light-green';
    return 'green';
}
</script>

<style scoped>
.vocabulary-page {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
}

.body--dark .vocabulary-page {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.container {
    width: 100%;
    max-width: none;
}
</style>