<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const modes = [
  { to: '/litery', label: 'Alfabet', exact: true },
  { to: '/litery/nazwy', label: 'Nazwy liter' },
  { to: '/litery/nikud', label: 'Litery z nikudem' },
]
</script>

<template>
  <section>
    <h1>Litery</h1>
    <nav class="modes" aria-label="Tryby ćwiczenia liter">
      <RouterLink
        v-for="mode in modes"
        :key="mode.to"
        :to="mode.to"
        class="mode"
        :exact-active-class="'is-active'"
        :active-class="mode.exact ? '' : 'is-active'"
      >
        {{ mode.label }}
      </RouterLink>
    </nav>
    <RouterView />
  </section>
</template>

<style scoped>
.modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.mode {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0.4rem 1rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  background: var(--surface);
  font-weight: 600;
  text-decoration: none;
}
.mode.is-active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}
</style>
