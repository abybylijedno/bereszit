<script setup lang="ts">
import { ref } from 'vue'

const hebrewText = ref('')
const emit = defineEmits(['next'])

function next() {
  if (!hebrewText.value.trim()) {
    alert('Proszę wpisać hebrajski tekst przed przejściem dalej.')
    return
  }

  // this function emits an event to the parent component with hebrewText
  emit('next', hebrewText.value)
}
</script>

<template>
  <form class="pure-form">
    <p>Wpisz lub wklej w poniższe pole hebrajski tekst, a następnie kliknij "Dalej"</p>

    <textarea
      class="pure-input-1"
      v-model="hebrewText"
      placeholder="Tutaj wpisz hebrajski tekst"
      style="direction: rtl"
    />

    <p>
      <button type="button" class="pure-button" @click="next">Dalej</button>
    </p>
  </form>
</template>

<style scoped>
textarea {
  min-height: 8rem;
  resize: vertical;
  font-size: 1.6rem;
  padding: 0.1rem;
}
</style>
