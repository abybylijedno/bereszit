<script setup lang="ts">
import { ref, reactive } from 'vue'
import { convert } from './lib/converter'
import { diffWords } from 'diff'

const hebrewText = ref('')
const userPronunciation = ref('')

const diffedText = reactive<Array<{ value: string; added?: boolean; removed?: boolean }>>([])
const diffedResult = ref('')

function check() {
  const appPronunciation = convert(hebrewText.value)
  const diffs = diffWords(userPronunciation.value, appPronunciation)
  diffedText.splice(0, diffedText.length, ...diffs)

  // @ts-expect-error TS2532
  if (diffs.length === 1 && !diffs[0].added && !diffs[0].removed) {
    diffedResult.value = 'Wszystko dobrze! Brawo! 🤓'
  } else {
    diffedResult.value = ''
  }
}
</script>

<template>
  <main>
    <header>
      <h1>
        <img src="/icon.svg" alt="Bereszit" style="height: 1em; margin-bottom: -0.1em" /> Bereszit
      </h1>
      <p>Pomocnik przy nauce czytania hebrajskiego</p>
    </header>

    <section class="pure-form">
      <p>Hebrajski:</p>
      <textarea
        class="pure-input-1"
        v-model="hebrewText"
        placeholder="Tutaj wpisz hebrajski tekst"
        style="direction: rtl"
      />

      <p>Napisz jakbyś to wypowiedział(a):</p>
      <textarea
        class="pure-input-1"
        v-model="userPronunciation"
        placeholder="Tutaj wpisz jakbyś to wypowiedział(a). Gardłowe dźwięki, pisz z wielkiej litery."
      />

      <p>
        <button class="pure-button" @click="check">Sprawdź!</button>
      </p>
    </section>

    <section></section>

    <p>Wynik: {{ diffedResult }}</p>
    <div>
      <span
        v-for="(part, index) in diffedText"
        :key="index"
        :style="{
          backgroundColor: part.added ? '#a6f3a6' : part.removed ? '#f3a6a6' : 'transparent',
        }"
      >
        {{ part.value }}
      </span>
    </div>

    <footer>Marek Sierociński, 2025</footer>
  </main>
</template>

<style scoped>
main {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}

textarea {
  min-height: 6rem;
  resize: vertical;
  font-size: 1.6rem;
  padding: 0.1rem;
}
footer {
  margin-top: 5rem;
  font-size: 0.8rem;
  text-align: left;
  color: #ccc;
}
</style>
