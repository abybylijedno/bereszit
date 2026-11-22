<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const sections = [
  { to: '/gramatyka/sciagawki', label: 'Ściągawki' },
  { to: '/gramatyka/cwiczenia', label: 'Ćwiczenia' },
]
</script>

<template>
  <section>
    <h1>Gramatyka</h1>
    <nav class="subnav" aria-label="Części gramatyki">
      <RouterLink
        v-for="section in sections"
        :key="section.to"
        :to="section.to"
        class="subnav-link"
        active-class="is-active"
      >
        {{ section.label }}
      </RouterLink>
    </nav>
    <RouterView />
  </section>
</template>
