<script setup lang="ts">
/**
 * Converter: Hebrew text in, Polish phonetics out, updated live.
 * Interlinear layout: every word shows the Hebrew above its phonetics.
 * Selecting a word shows a letter-by-letter breakdown.
 */
import { computed, ref, watch } from 'vue'
import { analyze } from '@/lib/converter'
import TextSource from '@/components/TextSource.vue'

const hebrewText = ref('')
const selected = ref<number | null>(null)
const copyStatus = ref('')

const words = computed(() => analyze(hebrewText.value))
const selectedWord = computed(() => (selected.value === null ? null : words.value[selected.value]))
const allPhonetics = computed(() => words.value.map((w) => w.phonetics).join(' '))

// A new text invalidates the selected word and the "copied" message.
watch(hebrewText, () => {
  selected.value = null
  copyStatus.value = ''
})

const toggle = (i: number) => {
  selected.value = selected.value === i ? null : i
}

const copy = async () => {
  try {
    await navigator.clipboard.writeText(allPhonetics.value)
    copyStatus.value = 'Skopiowano wymowę do schowka.'
  } catch {
    copyStatus.value = 'Nie udało się skopiować. Zaznacz tekst i skopiuj go ręcznie.'
  }
}
</script>

<template>
  <section>
    <h1>Konwerter</h1>
    <p>
      Wpisz lub wklej hebrajski tekst z nikudem. Pod każdym wyrazem zobaczysz jego wymowę. Wybierz
      wyraz, aby zobaczyć, jak powstała wymowa litera po literze.
    </p>

    <TextSource v-model="hebrewText" />

    <div v-if="words.length" class="output">
      <h2>Wymowa</h2>
      <ol class="words" dir="rtl" aria-label="Wyrazy z wymową">
        <li v-for="(word, i) in words" :key="i">
          <button
            type="button"
            class="word"
            :aria-expanded="selected === i"
            :aria-controls="selected === i ? 'breakdown' : undefined"
            @click="toggle(i)"
          >
            <span class="he" lang="he" dir="rtl">{{ word.hebrew }}</span>
            <span class="ph" lang="pl" dir="ltr">{{ word.phonetics }}</span>
          </button>
        </li>
      </ol>

      <section v-if="selectedWord" id="breakdown" class="card breakdown" aria-labelledby="breakdown-title">
        <h3 id="breakdown-title">
          Rozbiór wyrazu <span lang="he" dir="rtl">{{ selectedWord.hebrew }}</span>
        </h3>
        <p v-if="selectedWord.isYHWH">
          To imię Boże. Nie czyta się go literami, tylko jako całość: <strong>adonai</strong>.
        </p>
        <table v-else>
          <caption class="sr-only">
            Litery wyrazu i ich wymowa
          </caption>
          <thead>
            <tr>
              <th scope="col">Litera</th>
              <th scope="col">Nazwa</th>
              <th scope="col">Wymowa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(letter, k) in selectedWord.letters" :key="k">
              <td class="glyph" lang="he" dir="rtl">{{ letter.hebrew }}</td>
              <td>{{ letter.name }}</td>
              <td>
                <template v-if="letter.phonetics">{{ letter.phonetics }}</template>
                <em v-else>cicha (bez dźwięku)</em>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <p class="actions">
        <button type="button" class="btn" @click="copy">Kopiuj wymowę</button>
      </p>
      <p class="copy-status" role="status">{{ copyStatus }}</p>
    </div>
    <p v-else-if="hebrewText.trim()" role="status">
      Nie znaleziono hebrajskich liter w podanym tekście.
    </p>
  </section>
</template>

<style scoped>
.output {
  margin-top: 1.5rem;
}

.words {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 0.5rem;
}

.word {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 44px;
  min-height: 44px;
  padding: 0.4rem 0.7rem;
  font: inherit;
  color: var(--text);
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
}
.word[aria-expanded='true'] {
  background: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}

.he {
  font-size: 2rem;
}
.ph {
  font-size: 1.05rem;
  font-weight: 600;
}

.breakdown {
  margin-top: 1rem;
}
.breakdown h3 {
  margin-top: 0;
}

table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  text-align: left;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
}
.glyph {
  font-size: 1.8rem;
  text-align: right;
}

.actions {
  margin-top: 1rem;
}
.copy-status {
  min-height: 1.6em;
}
</style>
