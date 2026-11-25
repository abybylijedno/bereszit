<script setup lang="ts">
/** Chooses the pattern verb whose forms fill the tables and examples of the cheat sheets. */
import { usePatternVerb } from '@/composables/usePatternVerb'

const { root, choose, options } = usePatternVerb()
</script>

<template>
  <div class="picker">
    <label for="pattern-verb">Czasownik wzorcowy</label>
    <select
      id="pattern-verb"
      :value="root.letters"
      @change="choose(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="r in options" :key="r.letters" :value="r.letters">{{ r.pl }}</option>
    </select>
    <p class="root">
      Rdzeń: <span lang="he" dir="rtl" class="he">{{ root.he }}</span
      >. Tabele i przykłady poniżej są odmianą tego czasownika.
    </p>
  </div>
</template>

<style scoped>
.picker {
  display: grid;
  /* The select is as wide as its longest option unless the column is capped. */
  grid-template-columns: minmax(0, 1fr);
  gap: 0.25rem;
  margin: 0 0 1rem;
}
label {
  font-weight: 600;
}
select {
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0 0.6rem;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text);
  font: inherit;
}
.root {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--muted);
}
.he {
  font-size: 1.4rem;
  color: var(--text);
}
</style>
