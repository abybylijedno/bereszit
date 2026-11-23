<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <section>
    <h1 class="sr-only">Słowa</h1>
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </section>
</template>
