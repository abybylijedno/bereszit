<script setup lang="ts">
/**
 * This view requires as an input "hebrewText" prop.
 * When it gets it, the hebrew text is split into words.
 * Next, the table if displayed with columns as follows:
 * - Hebrew word
 * - Input field for user to type pronunciation
 * - Empty div where diffed result will be shown
 * On the bottom, there is a "Sprawdź!" button.
 * When clicked, the app converts each Hebrew word into pronunciation,
 * diffs it with user input, and shows the diffed result in the third column.
 */

import { reactive, watch } from 'vue'
import { FINISH_WORD } from '@/lib/constants'
import { convert } from '@/lib/converter'
import { diffChars } from 'diff'

const props = defineProps<{
  hebrewText: string
}>()

const emits = defineEmits<{
  (e: 'reset'): void
}>()

const hebrewWords = reactive<string[]>([])
const userPronunciations = reactive<string[]>([])
const differences = reactive<
  Array<Array<{ value: string; added?: boolean; removed?: boolean }> | undefined>
>([])

// When props.hebrewText is received, split it into words
watch(
  () => props.hebrewText,
  (newText) => {
    // Split words by FINISH_WORD characters
    const words: string[] = []
    let currentWord = ''
    for (const char of newText) {
      const charCode = char.charCodeAt(0)
      // console.debug('Char:', char, charCode, charCode.toString(16))
      if (FINISH_WORD.includes(charCode)) {
        if (currentWord) {
          words.push(currentWord)
          currentWord = ''
        }
      } else {
        currentWord += char
      }
    }
    if (currentWord) {
      words.push(currentWord)
    }
    hebrewWords.splice(0, hebrewWords.length, ...words)
  },
  { immediate: true },
)

const checkSingle = (index: number) => {
  const userPronunciation = userPronunciations[index] || ''
  if (!userPronunciation.trim()) {
    differences[index] = undefined
    return
  }

  const hebrewWord = hebrewWords[index]
  const appPronunciation = hebrewWord?.trim() ? convert(hebrewWord) : ''

  differences[index] = diffChars(userPronunciation, appPronunciation)
}

const check = () => {
  for (let i = 0; i < hebrewWords.length; i++) {
    checkSingle(i)
  }
}

const reset = () => {
  hebrewWords.splice(0, hebrewWords.length)
  userPronunciations.splice(0, userPronunciations.length)
  differences.splice(0, differences.length)
  emits('reset')
}

const areNoMistakes = (wordDiffs: Array<{ value: string; added?: boolean; removed?: boolean }>) => {
  return wordDiffs.every((part) => !part.added && !part.removed)
}
</script>

<template>
  <p>
    Każdy wiersz w tabelce poniżej odpowiada jednemu hebrajskiemu wyrazowi z podanego tekstu. Wpisz
    w polu swoją wymowę, a następnie kliknij przycisk "Sprawdź!", aby przekonać się jak Ci poszło.
  </p>
  <p>Gardłowe dźwięki pisz z wielkiej litery.</p>
  <table class="pure-table pure-table-bordered">
    <thead>
      <tr>
        <th>Hebrajski wyraz</th>
        <th>Wymowa (twoja odpowiedź)</th>
        <th>Wynik</th>
      </tr>
    </thead>
    <tbody class="pure-form">
      <tr v-for="(word, index) in hebrewWords" :key="index">
        <td style="direction: rtl">{{ word }}</td>
        <td>
          <input
            type="text"
            class="pure-input"
            v-model="userPronunciations[index]"
            @blur="checkSingle(index)"
          />
        </td>
        <td>
          <span v-if="differences[index] && areNoMistakes(differences[index])">✅</span>
          <span v-else-if="differences[index]">❌</span>
          &nbsp;
          <span v-for="(part, partIndex) in differences[index]" :key="partIndex">
            <span v-if="part.added" class="char-should-be">{{ part.value }}</span>
            <span v-else-if="part.removed" class="char-shouldnt-be">{{ part.value }}</span>
            <span v-else>{{ part.value }}</span>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
  <p style="margin-top: 1rem; text-align: right">
    <button type="button" class="pure-button pure-button-primary" @click="check">Sprawdź!</button>
    &nbsp;
    <button type="button" class="pure-button" @click="reset">Od nowa</button>
  </p>
</template>

<style scoped>
tbody > tr > td:first-of-type {
  font-size: 2rem;
}

.char-should-be,
.char-shouldnt-be {
  padding: 0.1rem;
}

.char-should-be {
  background-color: #a6f3a6;
}

.char-shouldnt-be {
  background-color: #f3a6a6;
}
</style>
