import { ref, computed } from 'vue';
import { brightness } from './useReaderSettings';

export function useBrightnessGesture() {
    const isBrightnessAdjusting = ref(false);
    const showBrightnessIndicator = ref(false);
    let brightnessStartY = 0;
    let brightnessStartValue = 100;
    let indicatorTimeout: NodeJS.Timeout | null = null;

    // Правая зона для управления яркостью (последние 100px справа)
    const BRIGHTNESS_ZONE_WIDTH = 100;
    const MIN_BRIGHTNESS = 20;
    const MAX_BRIGHTNESS = 150;
    const BRIGHTNESS_SENSITIVITY = 0.5; // Чувствительность жеста

    const isInBrightnessZone = (x: number, screenWidth: number): boolean => {
        return x > screenWidth - BRIGHTNESS_ZONE_WIDTH;
    };

    const handleBrightnessTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        if (!touch) return false;

        const screenWidth = window.innerWidth;

        if (isInBrightnessZone(touch.clientX, screenWidth)) {
            isBrightnessAdjusting.value = true;
            brightnessStartY = touch.clientY;
            brightnessStartValue = brightness.value;
            showBrightnessIndicator.value = true;

            // Предотвращаем другие события
            event.preventDefault();
            return true;
        }

        return false;
    };

    const handleBrightnessTouchMove = (event: TouchEvent) => {
        if (!isBrightnessAdjusting.value) return false;

        const touch = event.touches[0];
        if (!touch) return false;

        const deltaY = brightnessStartY - touch.clientY; // Инвертируем: вверх = ярче
        const brightnessChange = deltaY * BRIGHTNESS_SENSITIVITY;
        const newBrightness = Math.max(
            MIN_BRIGHTNESS,
            Math.min(MAX_BRIGHTNESS, brightnessStartValue + brightnessChange)
        );

        brightness.value = Math.round(newBrightness);

        event.preventDefault();
        return true;
    };

    const handleBrightnessTouchEnd = () => {
        if (!isBrightnessAdjusting.value) return false;

        isBrightnessAdjusting.value = false;

        // Скрываем индикатор через 1.5 секунды
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
        }
        indicatorTimeout = setTimeout(() => {
            showBrightnessIndicator.value = false;
        }, 1500);

        return true;
    };

    const brightnessPercentage = computed(() => {
        return Math.round(((brightness.value - MIN_BRIGHTNESS) / (MAX_BRIGHTNESS - MIN_BRIGHTNESS)) * 100);
    });

    return {
        isBrightnessAdjusting,
        showBrightnessIndicator,
        brightnessPercentage,
        handleBrightnessTouchStart,
        handleBrightnessTouchMove,
        handleBrightnessTouchEnd,
        isInBrightnessZone
    };
}
