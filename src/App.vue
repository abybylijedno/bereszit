<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import PathBar from '@/components/PathBar.vue'
import UpdateBanner from '@/components/UpdateBanner.vue'
import { SECTIONS, sectionTarget } from '@/lib/navigation'
</script>

<template>
  <a class="skip-link" href="#content">Przejdź do treści</a>
  <div class="shell">
    <!-- Wide screens: the tabs live in the sidebar. On a phone the path bar has them. -->
    <nav class="tabs" aria-label="Główna nawigacja">
      <RouterLink
        v-for="section in SECTIONS"
        :key="section.id"
        :to="sectionTarget(section.id)"
        custom
        v-slot="{ href, navigate }"
      >
        <a
          :href="href"
          class="tab"
          :class="{ 'router-link-active': $route.path.startsWith(`/${section.id}`) }"
          :aria-current="$route.path.startsWith(`/${section.id}`) ? 'page' : undefined"
          @click="navigate"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            <path
              :d="section.icon"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ section.label }}</span>
        </a>
      </RouterLink>
    </nav>

    <PathBar />

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
  padding: calc(var(--path-h) + env(safe-area-inset-top) + 1rem) 1rem
    calc(2rem + env(safe-area-inset-bottom));
}
main:focus {
  outline: none;
}

.tabs {
  display: none;
}

@media (min-width: 56rem) {
  main {
    margin-left: 12rem;
    padding: calc(var(--path-h) + 1rem) 1rem 2rem;
    max-width: 52rem;
  }
  .tabs {
    position: fixed;
    z-index: 10;
    top: 0;
    bottom: 0;
    left: 0;
    width: 11rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.25rem;
    padding: 1rem 0.5rem;
    background: var(--surface);
    border-right: 2px solid var(--border);
  }
  .tab {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 48px;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    text-decoration: none;
  }
  .tab.router-link-active {
    color: var(--on-primary);
    background: var(--primary);
  }
}
</style>
