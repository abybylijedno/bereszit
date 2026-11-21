import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * Hash history: GitHub Pages has no SPA fallback, so deep links must live in the hash.
 */
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/quiz' },
    { path: '/quiz', name: 'quiz', component: () => import('@/views/QuizView.vue'), meta: { title: 'Quiz' } },
    {
      path: '/litery',
      component: () => import('@/views/LettersView.vue'),
      meta: { title: 'Litery' },
      children: [
        { path: '', name: 'letters', component: () => import('@/views/letters/AlphabetPanel.vue') },
        { path: 'nazwy', name: 'letters-names', component: () => import('@/views/letters/NameQuizPanel.vue') },
        { path: 'nikud', name: 'letters-nikud', component: () => import('@/views/letters/SyllableQuizPanel.vue') },
      ],
    },
    { path: '/konwerter', name: 'converter', component: () => import('@/views/ConverterView.vue'), meta: { title: 'Konwerter' } },
    { path: '/ustawienia', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { title: 'Ustawienia' } },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title as string} – Bereszit`
})

export default router
