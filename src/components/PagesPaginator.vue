<template>
    <!-- Индикатор страницы -->
    <div class="page-indicator">
        <div class="page-nav-left" @click="onPrevPage">
            <q-icon name="chevron_left" class="nav-icon" />
        </div>
        <div class="page-info">
            {{ currentPage + 1 }} / {{ totalPages }}
        </div>
        <div class="page-nav-right" @click="onNextPage">
            <q-icon name="chevron_right" class="nav-icon" />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    currentPage: number;
    totalPages: number;
}>();

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
</script>

<style scoped>
.page-indicator {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px;
    background: rgba(0, 0, 0, 0.05);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 14px;
    color: var(--text-secondary);
    height: 50px;
}

.page-info {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-weight: 500;
    pointer-events: none;
    z-index: 2;
}

.page-nav-left,
.page-nav-right {
    position: absolute;
    top: 0;
    height: 100%;
    width: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
}

.page-nav-left {
    left: 0;
    justify-content: flex-start;
    padding-left: 16px;
}

.page-nav-right {
    right: 0;
    justify-content: flex-end;
    padding-right: 16px;
}

.nav-icon {
    opacity: 0.6;
    transition: opacity 0.2s ease;
    pointer-events: none;
}

.page-nav-left:hover .nav-icon,
.page-nav-right:hover .nav-icon {
    opacity: 1;
}

.page-nav-left:hover,
.page-nav-right:hover {
    background: rgba(0, 0, 0, 0.1);
}

.page-nav-left:active,
.page-nav-right:active {
    background: rgba(0, 0, 0, 0.2);
}
</style>