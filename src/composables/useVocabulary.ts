import { ref, computed, readonly } from 'vue'

// Типы данных
interface VocabularyWord {
    w: string // слово
    c: number // счетчик правильных ответов подряд (0-5)
}

interface VocabularyStats {
    totalWordsAdded: number
    totalWordsLearned: number
    currentStreak: number
}

interface VocabularyData {
    vocabulary: VocabularyWord[]
    stats: VocabularyStats
}

// Ключ для хранения в LocalStorage
const VOCABULARY_STORAGE_KEY = 'transreader_vocabulary'

// Reactive данные
const vocabulary = ref<VocabularyWord[]>([])
const stats = ref<VocabularyStats>({
    totalWordsAdded: 0,
    totalWordsLearned: 0,
    currentStreak: 0
})

// Загрузка данных из LocalStorage
const loadVocabulary = (): void => {
    try {
        const stored = localStorage.getItem(VOCABULARY_STORAGE_KEY)
        if (stored) {
            const data: VocabularyData = JSON.parse(stored)
            vocabulary.value = data.vocabulary || []
            stats.value = data.stats || {
                totalWordsAdded: 0,
                totalWordsLearned: 0,
                currentStreak: 0
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки словаря:', error)
        vocabulary.value = []
        stats.value = {
            totalWordsAdded: 0,
            totalWordsLearned: 0,
            currentStreak: 0
        }
    }
}

// Сохранение данных в LocalStorage
const saveVocabulary = (): void => {
    try {
        const data: VocabularyData = {
            vocabulary: vocabulary.value,
            stats: stats.value
        }
        localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Ошибка сохранения словаря:', error)
    }
}

// Добавление слова в словарь
const addWord = (word: string): boolean => {
    const normalizedWord = word.toLowerCase().trim()

    // Проверяем, есть ли уже такое слово
    const existingWord = vocabulary.value.find(item => item.w === normalizedWord)
    if (existingWord) {
        return false // Слово уже есть в словаре
    }

    // Добавляем новое слово
    vocabulary.value.push({
        w: normalizedWord,
        c: 0
    })

    // Обновляем статистику
    stats.value.totalWordsAdded++

    saveVocabulary()
    return true // Слово добавлено
}

// Увеличение счетчика при правильном ответе
const incrementCounter = (word: string): void => {
    const normalizedWord = word.toLowerCase().trim()
    const wordItem = vocabulary.value.find(item => item.w === normalizedWord)

    if (wordItem) {
        wordItem.c++

        // Если достигли 5 правильных ответов - удаляем слово
        if (wordItem.c >= 5) {
            removeWord(normalizedWord)
            stats.value.totalWordsLearned++
        }

        stats.value.currentStreak++
        saveVocabulary()
    }
}

// Сброс счетчика при неправильном ответе
const resetCounter = (word: string): void => {
    const normalizedWord = word.toLowerCase().trim()
    const wordItem = vocabulary.value.find(item => item.w === normalizedWord)

    if (wordItem) {
        wordItem.c = 0
        stats.value.currentStreak = 0
        saveVocabulary()
    }
}

// Удаление слова из словаря
const removeWord = (word: string): boolean => {
    const normalizedWord = word.toLowerCase().trim()
    const index = vocabulary.value.findIndex(item => item.w === normalizedWord)

    if (index !== -1) {
        vocabulary.value.splice(index, 1)
        saveVocabulary()
        return true
    }

    return false
}

// Получение слова для тестирования (приоритет словам с меньшим счетчиком)
const getWordForTest = (): VocabularyWord | null => {
    if (vocabulary.value.length === 0) {
        return null
    }

    // Сортируем по счетчику (слова с меньшим счетчиком идут первыми)
    const sortedWords = [...vocabulary.value].sort((a, b) => a.c - b.c)

    // Берем слова с минимальным счетчиком
    const minCount = sortedWords[0]!.c
    const wordsWithMinCount = sortedWords.filter(word => word.c === minCount)

    // Возвращаем случайное слово из слов с минимальным счетчиком
    const randomIndex = Math.floor(Math.random() * wordsWithMinCount.length)
    return wordsWithMinCount[randomIndex] || null
}

// Получение информации о слове
const getWordInfo = (word: string): VocabularyWord | null => {
    const normalizedWord = word.toLowerCase().trim()
    return vocabulary.value.find(item => item.w === normalizedWord) || null
}

// Проверка, есть ли слово в словаре
const hasWord = (word: string): boolean => {
    const normalizedWord = word.toLowerCase().trim()
    return vocabulary.value.some(item => item.w === normalizedWord)
}

// Очистка всего словаря
const clearVocabulary = (): void => {
    vocabulary.value = []
    stats.value = {
        totalWordsAdded: 0,
        totalWordsLearned: 0,
        currentStreak: 0
    }
    saveVocabulary()
}

// Computed свойства
const totalWords = computed(() => vocabulary.value.length)
const wordsToReview = computed(() => vocabulary.value.filter(word => word.c === 0).length)
const averageProgress = computed(() => {
    if (vocabulary.value.length === 0) return 0
    const totalProgress = vocabulary.value.reduce((sum, word) => sum + word.c, 0)
    return Math.round((totalProgress / (vocabulary.value.length * 5)) * 100)
})

// Composable функция
export const useVocabulary = () => {
    // Загружаем данные при первом использовании
    if (vocabulary.value.length === 0) {
        loadVocabulary()
    }

    return {
        // Данные
        vocabulary: readonly(vocabulary),
        stats: readonly(stats),

        // Computed
        totalWords,
        wordsToReview,
        averageProgress,

        // Методы
        addWord,
        incrementCounter,
        resetCounter,
        removeWord,
        getWordForTest,
        getWordInfo,
        hasWord,
        clearVocabulary,
        loadVocabulary,
        saveVocabulary
    }
}
