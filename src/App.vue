<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const tabs = [
  { to: '/quiz', label: 'Quiz', icon: 'M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.1-1.5 2.4M12 17.5v.5M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0' },
  { to: '/litery', label: 'Litery', icon: 'M5 19 12 5l7 14M8 14h8' },
  { to: '/konwerter', label: 'Konwerter', icon: 'M4 8h13l-3-3M20 16H7l3 3' },
  { to: '/ustawienia', label: 'Ustawienia', icon: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6' },
]
</script>

<template>
  <a class="skip-link" href="#content">Przejdź do treści</a>
  <div class="shell">
    <nav class="tabs" aria-label="Główna nawigacja">
      <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
          <path :d="tab.icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>

    <main id="content" tabindex="-1">
      <header class="app-header">
        <img src="/icon.svg" alt="" width="32" height="32" />
        <div>
          <p class="brand">Bereszit</p>
          <p class="tagline">Pomocnik przy nauce czytania hebrajskiego</p>
        </div>
      </header>
      <RouterView />
      <footer>Marek Sierociński, 2025</footer>
    </main>
  </div>
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

.app-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
}
.app-header p {
  margin: 0;
}
.brand {
  font-size: 1.4rem;
  font-weight: 700;
}
.tagline {
  color: var(--muted);
  font-size: 0.9rem;
}

footer {
  margin-top: 4rem;
  font-size: 0.85rem;
  color: var(--muted);
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
  flex: 1;
  min-height: var(--nav-h);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
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
    bottom: auto;
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
