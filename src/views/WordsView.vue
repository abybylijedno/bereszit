<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const modes = [
  { to: '/slowa/czasowniki', label: 'Czasowniki' },
  { to: '/slowa/rzeczowniki', label: 'Rzeczowniki' },
]
</script>

<template>
  <section>
    <h1>Słowa</h1>
    <nav class="subnav" aria-label="Rodzaje słów">
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
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </section>
</template>
