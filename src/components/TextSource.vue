<script setup lang="ts">
/**
 * Shared "source of Hebrew text" field used by Quiz and Converter.
 * For now it offers only pasting/typing; picking a passage and drawing one
 * (Tanakh books) will be added here later, so both views get them at once.
 */
import { useId } from 'vue'

const text = defineModel<string>({ required: true })

defineProps<{
  label?: string
  /** Validation message; when set the field is marked invalid. */
  error?: string
  rows?: number
}>()

const id = useId()
</script>

<template>
  <div class="text-source">
    <label :for="id">{{ label ?? 'Hebrajski tekst' }}</label>
    <textarea
      :id="id"
      v-model="text"
      class="field he-input"
      lang="he"
      dir="rtl"
      :rows="rows ?? 5"
      :aria-describedby="error ? `${id}-error` : undefined"
      :aria-invalid="error ? 'true' : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
label {
  display: block;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}

.he-input {
  font-size: 1.6rem;
  min-height: 8rem;
  resize: vertical;
}

.error {
  color: var(--bad-text);
  background: var(--bad-bg);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}
</style>
