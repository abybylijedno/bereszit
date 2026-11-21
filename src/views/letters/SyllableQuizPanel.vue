<script setup lang="ts">
/** Quiz: a letter with a vowel is shown, the user types its Polish phonetics. */
import { nextTick, ref } from 'vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { getSyllables, type Syllable } from '@/lib/letterData'
import { stats } from '@/lib/stats'

const syllables = getSyllables()

const session = useQuizSession<Syllable>({
  bucket: 'syllables',
  getPool: () => syllables,
  keyOf: (s) => s.hebrew,
})
const { phase, current, index, total, score, mistakes, lastCorrect } = session

const answer = ref('')
const input = ref<HTMLInputElement | null>(null)
const weakest = ref<Syllable[]>([])

const refreshWeakest = () => {
  weakest.value = stats
    .weakest('syllables', 5)
    .map((key) => syllables.find((s) => s.hebrew === key))
    .filter((s): s is Syllable => !!s)
}
refreshWeakest()

const focusInput = async () => {
  await nextTick()
  input.value?.focus()
}

const start = () => {
  session.start()
  answer.value = ''
  focusInput()
}

/** One form, one button: first it checks the answer, then it moves on. */
const submit = () => {
  if (phase.value === 'asking') {
    session.answer(answer.value.trim() === current.value!.phonetics)
  } else if (phase.value === 'answered') {
    const newPhase = session.next()
    answer.value = ''
    if (newPhase === 'done') refreshWeakest()
    else focusInput()
  }
}

const again = () => {
  session.backToIntro()
  refreshWeakest()
}
</script>

<template>
  <div>
    <h2>Litery z nikudem</h2>

    <div v-if="phase === 'intro'">
      <p>
        Zobaczysz literę z samogłoską (nikudem). Wpisz, jak się ją czyta, na przykład „bi". Wielkość
        liter ma znaczenie: Het zapisujemy jako wielkie „H", a Kaf jako małe „h". Sesja ma 10 pytań
        i nie ma limitu czasu.
      </p>
      <p v-if="weakest.length">
        Najtrudniejsze dla Ciebie:
        <template v-for="(s, i) in weakest" :key="s.hebrew">
          <span lang="he" dir="rtl" class="mini-glyph">{{ s.hebrew }}</span
          >{{ i < weakest.length - 1 ? ', ' : '.' }}
        </template>
      </p>
      <p><button type="button" class="btn btn-primary" @click="start">Zaczynamy</button></p>
    </div>

    <form v-else-if="phase !== 'done'" @submit.prevent="submit">
      <p class="progress">Pytanie {{ index + 1 }} z {{ total }}</p>
      <p class="glyph" lang="he" dir="rtl" role="img" aria-label="Hebrajska litera z nikudem">
        {{ current?.hebrew }}
      </p>
      <label for="syllable-answer">Jak się to czyta?</label>
      <input
        id="syllable-answer"
        ref="input"
        v-model="answer"
        type="text"
        class="field"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        :readonly="phase === 'answered'"
      />

      <div aria-live="polite" class="feedback">
        <template v-if="phase === 'answered'">
          <p v-if="lastCorrect" class="status ok">Poprawnie!</p>
          <p v-else class="status bad">
            Błąd. Poprawna odpowiedź: <strong>{{ current?.phonetics }}</strong>
          </p>
        </template>
      </div>

      <p>
        <button type="submit" class="btn btn-primary">
          {{ phase === 'asking' ? 'Sprawdź' : session.isLast.value ? 'Pokaż wynik' : 'Dalej' }}
        </button>
      </p>
    </form>

    <div v-else>
      <p class="score" role="status">Wynik: {{ score }} z {{ total }}</p>
      <template v-if="mistakes.length">
        <h3>Do powtórki</h3>
        <ul class="mistakes">
          <li v-for="m in mistakes" :key="m.item.hebrew">
            <span lang="he" dir="rtl" class="mini-glyph">{{ m.item.hebrew }}</span> –
            {{ m.item.phonetics }}
          </li>
        </ul>
      </template>
      <p v-else>Bez błędów, świetnie!</p>
      <p>
        <button type="button" class="btn btn-primary" @click="start">Jeszcze raz</button>
        <button type="button" class="btn" @click="again">Koniec</button>
      </p>
    </div>
  </div>
</template>
