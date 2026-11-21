<script setup lang="ts">
/**
 * Quiz: the user pastes Hebrew text, then types the Polish phonetics of every word.
 * Each word is checked when its field loses focus; "Sprawdź!" checks all of them.
 */
import { computed, reactive, ref } from 'vue'
import { diffChars, type Change } from 'diff'
import { convert } from '@/lib/converter'
import { splitWords } from '@/lib/words'
import TextSource from '@/components/TextSource.vue'

const hebrewInput = ref('')
const words = ref<string[] | null>(null)
const answers = reactive<string[]>([])
const diffs = reactive<Array<Change[] | undefined>>([])
const revealed = reactive<boolean[]>([])
const error = ref('')

const start = () => {
  const list = splitWords(hebrewInput.value)
  if (list.length === 0) {
    error.value = 'Wpisz hebrajski tekst, zanim przejdziesz dalej.'
    return
  }
  error.value = ''
  answers.splice(0, answers.length)
  diffs.splice(0, diffs.length)
  revealed.splice(0, revealed.length)
  words.value = list
}

const reset = () => {
  words.value = null
}

const isCorrect = (i: number) => !!diffs[i] && diffs[i]!.every((p) => !p.added && !p.removed)

const checkSingle = (i: number) => {
  const answer = answers[i] ?? ''
  if (!answer.trim()) {
    diffs[i] = undefined
    return
  }
  diffs[i] = diffChars(answer, convert(words.value![i]!))
}

const checkAll = () => {
  words.value?.forEach((_, i) => checkSingle(i))
}

const reveal = (i: number) => {
  revealed[i] = true
}

const summary = computed(() => {
  const total = words.value?.length ?? 0
  const checked = diffs.filter(Boolean).length
  const correct = words.value ? words.value.filter((_, i) => isCorrect(i)).length : 0
  return { total, checked, correct }
})
</script>

<template>
  <section>
    <h1>Quiz</h1>

    <form v-if="!words" @submit.prevent="start">
      <p>
        Wpisz lub wklej hebrajski tekst z nikudem. Potem wpiszesz wymowę każdego wyrazu
        osobno.
      </p>
      <TextSource v-model="hebrewInput" :error="error" />
      <p><button type="submit" class="btn btn-primary">Dalej</button></p>
    </form>

    <div v-else>
      <p>
        Każda karta to jeden hebrajski wyraz. Wpisz jego wymowę. Wynik pojawi się po
        przejściu do następnego pola albo po kliknięciu „Sprawdź!".
      </p>

      <ol class="cards">
        <li v-for="(word, i) in words" :key="i" class="card">
          <p class="he-word" lang="he" dir="rtl">{{ word }}</p>
          <label :for="`answer-${i}`">Wymowa wyrazu {{ i + 1 }}</label>
          <input
            :id="`answer-${i}`"
            v-model="answers[i]"
            type="text"
            class="field"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            @blur="checkSingle(i)"
          />
          <div class="result" aria-live="polite">
            <template v-if="diffs[i]">
              <p v-if="isCorrect(i)" class="status ok">
                <span aria-hidden="true">✅</span> Poprawnie
              </p>
              <template v-else>
                <p class="status bad"><span aria-hidden="true">❌</span> Błąd</p>
                <p class="diff">
                  <template v-for="(part, k) in diffs[i]" :key="k">
                    <ins v-if="part.added" class="should-be"
                      ><span class="sr-only">brakuje: </span>{{ part.value }}</ins
                    >
                    <del v-else-if="part.removed" class="shouldnt-be"
                      ><span class="sr-only">do usunięcia: </span>{{ part.value }}</del
                    >
                    <span v-else>{{ part.value }}</span>
                  </template>
                </p>
              </template>
            </template>
            <p v-if="revealed[i]" class="answer">
              Poprawna wymowa: <strong>{{ convert(word) }}</strong>
            </p>
          </div>
          <button v-if="!revealed[i]" type="button" class="btn" @click="reveal(i)">
            Pokaż odpowiedź<span class="sr-only"> dla wyrazu {{ i + 1 }}</span>
          </button>
        </li>
      </ol>

      <p class="summary" role="status">
        Sprawdzono {{ summary.checked }} z {{ summary.total }}, poprawnie: {{ summary.correct }}.
      </p>
      <p class="actions">
        <button type="button" class="btn btn-primary" @click="checkAll">Sprawdź!</button>
        <button type="button" class="btn" @click="reset">Od nowa</button>
      </p>
    </div>
  </section>
</template>

<style scoped>
label {
  display: block;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}

.cards {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}

.he-word {
  font-size: 2.2rem;
  margin: 0;
  text-align: right;
}

.result p {
  margin: 0.4rem 0;
}

.status {
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.4rem;
  display: inline-block;
}
.status.ok {
  color: var(--ok-text);
  background: var(--ok-bg);
}
.status.bad {
  color: var(--bad-text);
  background: var(--bad-bg);
}

.should-be,
.shouldnt-be {
  padding: 0.1rem 0.15rem;
  font-weight: 700;
}
.should-be {
  background: var(--ok-bg);
  color: var(--ok-text);
  text-decoration: underline;
}
.shouldnt-be {
  background: var(--bad-bg);
  color: var(--bad-text);
  text-decoration: line-through;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
