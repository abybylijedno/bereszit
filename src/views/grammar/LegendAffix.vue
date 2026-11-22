<script setup lang="ts">
/** Explains the highlight colour; large text so that the colour reaches 4.5:1 (see CLAUDE.md). */
defineProps<{ what: string }>()
</script>

<template>
  <p class="legend"><span class="sample">Ten kolor</span> oznacza {{ what }}.</p>
</template>

<style scoped>
.sample {
  color: var(--affix);
  font-size: 1.5rem;
}
</style>
