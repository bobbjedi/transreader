import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Лендинг на корне (без layout)
  {
    path: '/',
    component: () => import('pages/IndexPage.vue')
  },

  // Приложение с layout
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AppPage.vue') },
      { path: 'reader/:id', component: () => import('pages/ReaderPage.vue') },
      { path: 'vocabulary', component: () => import('pages/VocabularyPage.vue') }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
