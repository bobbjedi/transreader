<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="showHeader" elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          📚 Читалка
        </q-toolbar-title>

        <q-btn flat dense round :icon="isUIThemeDark() ? 'light_mode' : 'dark_mode'"
          :aria-label="isUIThemeDark() ? 'Светлая тема' : 'Темная тема'" @click="toggleUITheme" />

        <q-btn flat dense round icon="home" aria-label="Главная" @click="goHome" />
      </q-toolbar>
    </q-header>

    <q-drawer v-if="showHeader" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Читалка
        </q-item-label>

        <q-item clickable @click="goHome" :active="$route.path === '/'">
          <q-item-section avatar>
            <q-icon name="home" class="notranslate" translate="no" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Главная</q-item-label>
            <q-item-label caption>Выбор книг</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header>
          Мои книги
        </q-item-label>

        <q-item v-for="book in recentBooks" :key="book.id" clickable @click="openBook(book)">
          <q-item-section avatar>
            <q-icon name="book" class="notranslate" translate="no" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ book.title }}</q-item-label>
            <q-item-label caption>{{ book.pages }} страниц</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="recentBooks.length === 0">
          <q-item-section>
            <q-item-label class="text-grey">Нет загруженных книг</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'src/composables/useTheme';
import type { BookMetadata } from 'src/composables/useBookManager';


const route = useRoute();
const router = useRouter();
const { loadUITheme, toggleUITheme, isUIThemeDark } = useTheme();

const leftDrawerOpen = ref(false);
const recentBooks = ref<BookMetadata[]>([]);

// Показываем хедер только на главной странице
const showHeader = computed(() => {
  return !route.path.includes('/reader/');
});

onMounted(() => {
  loadRecentBooks();
  loadUITheme();
});

function loadRecentBooks() {
  const savedBooks = localStorage.getItem('reader-books');
  if (savedBooks) {
    recentBooks.value = JSON.parse(savedBooks).slice(0, 5); // Показываем только последние 5 книг
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function goHome() {
  void router.push('/');
  leftDrawerOpen.value = false;
}

function openBook(book: BookMetadata) {
  localStorage.setItem('current-book', JSON.stringify(book));
  void router.push(`/reader/${book.id}`);
  leftDrawerOpen.value = false;
}
</script>
