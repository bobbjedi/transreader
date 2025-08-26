<template>
    <q-btn flat round dense :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" size="30" @click="toggleFullscreen"
        class="header-btn notranslate" translate="no">
        <q-tooltip>{{ isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим' }}</q-tooltip>
    </q-btn>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isFullscreen = ref(false);

// Функция переключения полноэкранного режима
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Входим в полноэкранный режим
        document.documentElement.requestFullscreen().then(() => {
            isFullscreen.value = true;
        }).catch((err) => {
            console.error('Ошибка входа в полноэкранный режим:', err);
            $q.notify({
                type: 'negative',
                message: 'Не удалось войти в полноэкранный режим',
                position: 'top'
            });
        });
    } else {
        // Выходим из полноэкранного режима
        document.exitFullscreen().then(() => {
            isFullscreen.value = false;
        }).catch((err) => {
            console.error('Ошибка выхода из полноэкранного режима:', err);
        });
    }
}

// Обработчик изменения полноэкранного режима
function handleFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
    // Добавляем обработчики полноэкранного режима
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
});

onUnmounted(() => {
    // Удаляем обработчики полноэкранного режима
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
});
</script>

<style scoped>
.header-btn {
    transition: all 0.2s ease;
}

.header-btn:hover {
    transform: scale(1.1);
}
</style>
