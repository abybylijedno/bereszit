<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const modes = [
  { to: '/fonetyka/alfabet', label: 'Alfabet' },
  { to: '/fonetyka/nazwy', label: 'Nazwy liter' },
  { to: '/fonetyka/nikud', label: 'Litery z nikudem' },
  { to: '/fonetyka/teksty', label: 'Teksty' },
]
</script>

<template>
  <section>
    <h1 class="sr-only">Fonetyka</h1>
    <nav class="subnav" aria-label="Rodzaje ćwiczeń z fonetyki">
      <RouterLink
        v-for="mode in modes"
        :key="mode.to"
        :to="mode.to"
        class="subnav-link"
        active-class="is-active"
      >
        {{ mode.label }}
      </RouterLink>
    </nav>
    <RouterView />
  </section>
</template>
