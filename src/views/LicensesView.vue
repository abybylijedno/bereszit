<script setup lang="ts">
/**
 * Licenses of the open-source packages shipped in the app. The data comes from
 * `npm run licenses` (scripts/licenses.mjs); every package keeps its full license text.
 */
import { RouterLink } from 'vue-router'
import licenses from '@/data/licenses.json'

const { packages, texts } = licenses
</script>

<template>
  <section>
    <h1>Licencje</h1>
    <p>
      Bereszit korzysta z bibliotek o otwartym kodzie. Poniżej znajdziesz ich nazwy, wersje i pełne
      teksty licencji. Dziękujemy ich autorom.
    </p>
    <p>
      Tekst biblijny pochodzi z Mechon Mamre i jest własnością publiczną. Opisano go w
      <RouterLink to="/ustawienia">Ustawieniach</RouterLink>.
    </p>

    <h2>Biblioteki ({{ packages.length }})</h2>
    <ul class="packages">
      <li v-for="pkg in packages" :key="pkg.name">
        <details>
          <summary>
            <strong>{{ pkg.name }}</strong> {{ pkg.version }}, licencja {{ pkg.license }}
          </summary>
          <pre lang="en">{{ texts[pkg.text] }}</pre>
        </details>
      </li>
    </ul>

    <p><RouterLink to="/ustawienia">Wróć do ustawień</RouterLink></p>
  </section>
</template>

<style scoped>
.packages {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
details {
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
}
summary {
  min-height: 44px;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  overflow-wrap: anywhere;
}
pre {
  margin: 0;
  padding: 0.75rem 0.9rem;
  max-width: 80ch;
  border-top: 1px solid var(--border);
  font: inherit;
  font-size: 0.9rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
