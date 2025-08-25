import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

// Тип темы для UI
export type UITheme = 'light' | 'dark';

// Реактивная переменная для текущей темы UI
const currentUITheme = ref<UITheme>('light');

export function useTheme() {
    const $q = useQuasar();

    // Загружаем сохраненную тему при инициализации
    const loadUITheme = () => {
        const savedTheme = localStorage.getItem('reader-ui-theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            currentUITheme.value = savedTheme as UITheme;
        }
        applyUITheme(currentUITheme.value);
    };

    // Применяем тему к Quasar
    const applyUITheme = (theme: UITheme) => {
        $q.dark.set(theme === 'dark');
    };

    // Переключаем тему
    const toggleUITheme = () => {
        currentUITheme.value = currentUITheme.value === 'light' ? 'dark' : 'light';
        saveUITheme();
        applyUITheme(currentUITheme.value);
    };

    // Устанавливаем конкретную тему
    const setUITheme = (theme: UITheme) => {
        currentUITheme.value = theme;
        saveUITheme();
        applyUITheme(theme);
    };

    // Сохраняем тему в localStorage
    const saveUITheme = () => {
        localStorage.setItem('reader-ui-theme', currentUITheme.value);
    };

    // Отслеживаем изменения темы
    watch(currentUITheme, (newTheme) => {
        applyUITheme(newTheme);
    });

    return {
        currentUITheme,
        loadUITheme,
        toggleUITheme,
        setUITheme,
        isUIThemeDark: () => currentUITheme.value === 'dark'
    };
}
