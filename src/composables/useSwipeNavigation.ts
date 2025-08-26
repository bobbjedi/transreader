import { ref } from 'vue';

export function useSwipeNavigation(
    onPrevPage: () => void,
    onNextPage: () => void,
    options: {
        minSwipeDistance?: number;
        maxVerticalDistance?: number;
        disabled?: () => boolean;
    } = {}
) {
    const {
        minSwipeDistance = 50,
        maxVerticalDistance = 100,
        disabled = () => false
    } = options;

    const touchStartX = ref(0);
    const touchStartY = ref(0);
    const isSwiping = ref(false);

    // Обработчик начала касания
    function handleTouchStart(event: TouchEvent) {
        if (disabled() || !event.touches[0]) return;

        touchStartX.value = event.touches[0].clientX;
        touchStartY.value = event.touches[0].clientY;
        isSwiping.value = false;
    }

    // Обработчик движения пальца
    function handleTouchMove(event: TouchEvent) {
        if (disabled() || !event.touches[0]) return;

        const deltaX = Math.abs(event.touches[0].clientX - touchStartX.value);
        const deltaY = Math.abs(event.touches[0].clientY - touchStartY.value);

        if (deltaX > 10 || deltaY > 10) {
            isSwiping.value = true;
        }
    }

    // Обработчик окончания касания
    function handleTouchEnd(event: TouchEvent) {
        if (disabled() || !isSwiping.value || !event.changedTouches[0]) return;

        const deltaX = event.changedTouches[0].clientX - touchStartX.value;
        const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartY.value);

        // Проверяем, что это горизонтальный свайп
        if (Math.abs(deltaX) > minSwipeDistance && deltaY < maxVerticalDistance) {
            if (deltaX > 0) {
                onPrevPage();
            } else {
                onNextPage();
            }
        }

        isSwiping.value = false;
    }

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        isSwiping
    };
}
