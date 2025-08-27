<template>
    <div class="word-test">
        <q-card v-if="currentWord" class="test-card">
            <!-- Заголовок с прогрессом -->
            <q-card-section class="text-center bg-primary text-white">
                <div class="text-h6">Тест: Угадайте перевод</div>
                <div class="text-caption">
                    Прогресс: {{ currentWord.c }}/5 ✨
                </div>
            </q-card-section>

            <!-- Английское слово -->
            <q-card-section class="text-center q-py-xl">
                <div class="english-word text-h6 text-weight-bold text-primary">
                    {{ currentWord.w.toUpperCase() }}
                </div>
                <div class="text-caption text-grey-6 q-mt-sm">
                    Выберите правильный перевод:
                </div>
            </q-card-section>

            <!-- Варианты ответов -->
            <q-card-section class="q-pt-none">
                <div class="row q-gutter-sm">
                    <div v-for="(option, index) in answerOptions" :key="index" class="col-12 col-sm-6">
                        <q-btn :class="getOptionClass(option)" :disable="hasAnswered" size="md" :label="option"
                            @click="selectAnswer(option)" class="full-width q-py-sm answer-btn text-body2" />
                    </div>
                </div>
            </q-card-section>

            <!-- Результат -->
            <q-card-section v-if="hasAnswered" class="text-center">
                <div v-if="isLastAnswerCorrect" class="text-positive">
                    <q-icon name="check_circle" size="2rem" />
                    <div class="text-h6 q-mt-sm">Правильно! 🎉</div>
                    <div class="text-body2">
                        Прогресс: {{ currentWord.c }}/5
                    </div>
                </div>

                <div v-else class="text-negative">
                    <q-icon name="cancel" size="2rem" />
                    <div class="text-h6 q-mt-sm">Неправильно 😔</div>
                    <div class="text-body2">
                        Правильный ответ: <strong>{{ correctAnswer }}</strong>
                    </div>
                    <div class="text-caption text-grey-6">
                        Прогресс сброшен на 0
                    </div>
                </div>

                <q-btn color="primary" label="Следующее слово" @click="nextWord" class="q-mt-md" />
            </q-card-section>

            <!-- Если слово изучено -->
            <q-card-section v-if="currentWord.c >= 5" class="text-center bg-positive text-white">
                <q-icon name="school" size="3rem" />
                <div class="text-h6 q-mt-sm">Слово изучено! 🎓</div>
                <div class="text-body2">
                    Это слово удалено из словаря для изучения
                </div>
            </q-card-section>
        </q-card>

        <!-- Нет слов для изучения -->
        <q-card v-else class="text-center q-pa-xl">
            <q-icon name="sentiment_satisfied" size="4rem" class="text-positive" />
            <div class="text-h6 q-mt-md">Нет слов для изучения</div>
            <div class="text-body2 text-grey-6 q-mt-sm">
                Кликайте на слова во время чтения, чтобы добавить их в словарь!
            </div>
            <q-btn color="primary" label="Вернуться к книгам" icon="library_books" @click="$emit('goToBooks')"
                class="q-mt-md" />
        </q-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVocabulary } from 'src/composables/useVocabulary';
import { wordListTranslates } from 'src/composables/useTranslate';
import rawDict from 'src/composables/dictionary_transformed.json';

// Emits
defineEmits(['goToBooks']);

// Composables
const {
    getWordForTest,
    incrementCounter,
    resetCounter,
} = useVocabulary();

// Reactive data
const currentWord = ref<{ w: string; c: number } | null>(null);
const answerOptions = ref<string[]>([]);
const correctAnswer = ref<string>('');
const hasAnswered = ref(false);
const isLastAnswerCorrect = ref(false);
const selectedAnswer = ref<string>('');

// Словарь для случайных неправильных ответов
const dictionary = rawDict as Record<string, string[]>;
const allTranslations = ref<string[]>([]);

// Computed
const getOptionClass = computed(() => (option: string) => {
    if (!hasAnswered.value) {
        return 'bg-grey-2';
    }

    if (option === correctAnswer.value) {
        return 'bg-positive text-white';
    }

    if (option === selectedAnswer.value && option !== correctAnswer.value) {
        return 'bg-negative text-white';
    }

    return 'bg-grey-2';
});

// Methods
const loadRandomTranslations = () => {
    // Собираем все переводы из словаря для случайного выбора
    const translations = new Set<string>();

    Object.values(dictionary).forEach(wordTranslations => {
        wordTranslations.forEach(translation => {
            translations.add(translation);
        });
    });

    allTranslations.value = Array.from(translations);
};

const generateAnswerOptions = (word: string): string[] => {
    const correctTranslations = wordListTranslates(word);
    const correct = correctTranslations.join(', ') || word;
    correctAnswer.value = correct;

    // Выбираем 3 случайных неправильных перевода
    const wrongAnswers: string[] = [];
    const shuffledTranslations = [...allTranslations.value].sort(() => Math.random() - 0.5);

    for (const translation of shuffledTranslations) {
        if (translation !== correct && !correctTranslations.includes(translation)) {
            wrongAnswers.push(translation);
            if (wrongAnswers.length === 3) break;
        }
    }

    // Если не хватает неправильных ответов, добавляем заглушки
    while (wrongAnswers.length < 3) {
        wrongAnswers.push(`[перевод ${wrongAnswers.length + 1}]`);
    }

    // Перемешиваем все варианты
    const options = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);
    return options;
};

const loadNewWord = () => {
    const word = getWordForTest();
    if (word) {
        currentWord.value = word;
        answerOptions.value = generateAnswerOptions(word.w);
        hasAnswered.value = false;
        selectedAnswer.value = '';
    } else {
        currentWord.value = null;
    }
};

const selectAnswer = (answer: string) => {
    if (hasAnswered.value) return;

    selectedAnswer.value = answer;
    hasAnswered.value = true;
    isLastAnswerCorrect.value = answer === correctAnswer.value;

    if (currentWord.value) {
        if (isLastAnswerCorrect.value) {
            incrementCounter(currentWord.value.w);
            // Обновляем локальные данные
            currentWord.value.c++;
        } else {
            resetCounter(currentWord.value.w);
            // Обновляем локальные данные
            currentWord.value.c = 0;
        }
    }
};

const nextWord = () => {
    loadNewWord();
};

// Lifecycle
onMounted(() => {
    loadRandomTranslations();
    loadNewWord();
});
</script>

<style scoped>
.word-test {
    width: 100%;
}

.test-card {
    border-radius: 16px;
    overflow: hidden;
}

.english-word {
    font-family: 'Roboto', sans-serif;
    letter-spacing: 2px;
}

.answer-btn {
    border-radius: 12px;
    transition: all 0.3s ease;
    font-weight: 500;
    white-space: normal;
    word-wrap: break-word;
    line-height: 1.3;
    min-height: 48px;
}

.answer-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bg-grey-2 {
    background-color: #ffffff !important;
    color: #333 !important;
    border: 1px solid #e0e0e0;
}

.body--dark .bg-grey-2 {
    background-color: #424242 !important;
    color: #ffffff !important;
    border: 1px solid #616161;
}
</style>
