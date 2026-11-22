import { createRouter, createWebHashHistory, RouterView } from 'vue-router'

/**
 * Hash history: GitHub Pages has no SPA fallback, so deep links must live in the hash.
 */
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/fonetyka' },
    {
      path: '/fonetyka',
      component: () => import('@/views/PhoneticsView.vue'),
      meta: { title: 'Fonetyka' },
      // Links from before the tab was merged carried ?tryb=...; those meant the text modes.
      redirect: (to) =>
        to.query.tryb ? { path: '/fonetyka/teksty', query: to.query } : '/fonetyka/alfabet',
      children: [
        {
          path: 'alfabet',
          name: 'phonetics-alphabet',
          component: () => import('@/views/phonetics/AlphabetPanel.vue'),
        },
        {
          path: 'nazwy',
          name: 'phonetics-names',
          component: () => import('@/views/phonetics/NameQuizPanel.vue'),
        },
        {
          path: 'nikud',
          name: 'phonetics-nikud',
          component: () => import('@/views/phonetics/SyllableQuizPanel.vue'),
        },
        {
          path: 'teksty',
          name: 'phonetics-texts',
          component: () => import('@/views/phonetics/TextsPanel.vue'),
        },
      ],
    },
    // Old links: Litery, Quiz and Konwerter are now parts of Fonetyka.
    { path: '/litery', redirect: '/fonetyka/alfabet' },
    { path: '/litery/nazwy', redirect: '/fonetyka/nazwy' },
    { path: '/litery/nikud', redirect: '/fonetyka/nikud' },
    { path: '/quiz', redirect: { path: '/fonetyka/teksty', query: { tryb: 'quiz' } } },
    { path: '/konwerter', redirect: { path: '/fonetyka/teksty', query: { tryb: 'konwerter' } } },
    {
      path: '/gramatyka',
      component: () => import('@/views/GrammarView.vue'),
      meta: { title: 'Gramatyka' },
      redirect: '/gramatyka/sciagawki',
      children: [
        {
          path: 'sciagawki',
          name: 'grammar-cheatsheets',
          component: () => import('@/views/grammar/CheatsheetsPanel.vue'),
        },
        {
          path: 'cwiczenia',
          name: 'grammar-exercises',
          component: () => import('@/views/grammar/ExercisesPanel.vue'),
        },
      ],
    },
    {
      path: '/slowa',
      component: () => import('@/views/WordsView.vue'),
      meta: { title: 'Słowa' },
      redirect: '/slowa/czasowniki',
      children: [
        {
          path: 'czasowniki',
          name: 'words-verbs',
          component: () => import('@/views/words/WordListPanel.vue'),
          props: { kind: 'verbs' },
        },
        {
          path: 'rzeczowniki',
          name: 'words-nouns',
          component: () => import('@/views/words/WordListPanel.vue'),
          props: { kind: 'nouns' },
        },
      ],
    },
    {
      // A parent route keeps the "Ustawienia" tab current on its subpages too.
      path: '/ustawienia',
      component: RouterView,
      children: [
        {
          path: '',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: { title: 'Ustawienia' },
        },
        {
          path: 'licencje',
          name: 'licenses',
          component: () => import('@/views/LicensesView.vue'),
          meta: { title: 'Licencje' },
        },
      ],
    },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title as string} – Bereszit`
})

export default router
