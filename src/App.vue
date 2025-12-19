<script setup lang="ts">
import { ref } from 'vue'
import { convert } from './lib/converter'

const hebrewText = ref('')
const convertedText = ref('')

function convertText() {
  convertedText.value = convert(hebrewText.value)
}
</script>

<template>
  <p>Hebrajski:</p>
  <textarea v-model="hebrewText" placeholder="Tutaj wpisz hebrajski tekst" />

  <button @click="convertText">Konwertuj tekst</button>

  <p>Przekonwertowany tekst:</p>
  <div>{{ convertedText }}</div>
</template>

<style scoped></style>
