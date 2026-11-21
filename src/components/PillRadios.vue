<script setup lang="ts" generic="T extends string">
/**
 * A group of radio buttons drawn as pills, with a visible group label (the legend).
 * Used for choosing a mode: "Tryb" in Fonetyka, "Źródło tekstu" in TextSource.
 */
import { useId } from 'vue'

defineProps<{
  legend: string
  options: { value: T; label: string }[]
}>()

const model = defineModel<T>({ required: true })
const name = useId()
</script>

<template>
  <fieldset class="pills">
    <legend>{{ legend }}</legend>
    <label v-for="option in options" :key="option.value" class="pill">
      <input v-model="model" type="radio" :name="name" :value="option.value" />
      <span>{{ option.label }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
fieldset.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border: 0;
  padding: 0;
  margin: 0 0 1rem;
}
legend {
  font-weight: 600;
  padding: 0;
  margin-bottom: 0.4rem;
}

.pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin: 0;
  padding: 0.4rem 1rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  cursor: pointer;
}
.pill input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: pointer;
}
.pill:has(input:checked) {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}
.pill:has(input:focus-visible) {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
</style>
