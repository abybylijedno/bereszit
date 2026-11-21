<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import UpdateBanner from '@/components/UpdateBanner.vue'

const tabs = [
  { to: '/fonetyka', label: 'Fonetyka', icon: 'M2.5 12C5 9.5 7 8 9 8c1.5 0 2.5 1 3 1.5C12.5 9 13.5 8 15 8c2 0 4 1.5 6.5 4-2.5 3-5 5.5-9.5 5.5S5 15 2.5 12ZM2.5 12c4.5 1.4 14.5 1.4 19 0' },
  { to: '/gramatyka', label: 'Gramatyka', icon: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM8 17h11' },
  { to: '/slowa', label: 'Słowa', icon: 'M4 5h16v11H9l-5 4V5z' },
  { to: '/ustawienia', label: 'Ustawienia', icon: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6' },
]
</script>

<template>
  <a class="skip-link" href="#content">Przejdź do treści</a>
  <div class="shell">
    <nav class="tabs" aria-label="Główna nawigacja">
      <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" custom v-slot="{ href, navigate, isActive }">
        <!-- Custom link: the tab stays "current" on nested routes too (e.g. /litery/nazwy). -->
        <a
          :href="href"
          class="tab"
          :class="{ 'router-link-active': isActive }"
          :aria-current="isActive ? 'page' : undefined"
          @click="navigate"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            <path :d="tab.icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ tab.label }}</span>
        </a>
      </RouterLink>
    </nav>

    <main id="content" tabindex="-1">
      <RouterView />
    </main>
  </div>
  <UpdateBanner />
</template>

<style scoped>
.shell {
  min-height: 100dvh;
}

main {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem 1rem calc(var(--nav-h) + 2rem + env(safe-area-inset-bottom));
}
main:focus {
  outline: none;
}

.tabs {
  position: fixed;
  z-index: 10;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: var(--surface);
  border-top: 2px solid var(--border);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab {
  flex: 1 1 0;
  /* Five tabs must fit in 320 px: the label may shrink and, if needed, wrap. */
  min-width: 0;
  min-height: var(--nav-h);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.25rem 0.1rem;
  font-size: clamp(0.62rem, 3.1vw, 0.8rem);
  font-weight: 600;
  color: var(--text);
  text-align: center;
  overflow-wrap: anywhere;
  text-decoration: none;
}

.tab.router-link-active {
  color: var(--on-primary);
  background: var(--primary);
}

@media (min-width: 56rem) {
  main {
    margin-left: 12rem;
    padding-bottom: 2rem;
    max-width: 52rem;
  }
  .tabs {
    top: 0;
    right: auto;
    bottom: 0;
    width: 11rem;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.25rem;
    padding: 1rem 0.5rem;
    border-top: 0;
    border-right: 2px solid var(--border);
  }
  .tab {
    flex: none;
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.6rem;
    min-height: 48px;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 1rem;
  }
}
</style>
