<script setup lang="ts">
/** Quiz: a Hebrew letter is shown, the user picks its name from 4 buttons. */
import { nextTick, ref } from 'vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { getAlphabet, type LetterInfo } from '@/lib/letterData'
import { makeChoices } from '@/lib/quiz'
import { stats } from '@/lib/stats'

const alphabet = getAlphabet()
const names = alphabet.map((l) => l.name)

const session = useQuizSession<LetterInfo>({
  bucket: 'names',
  getPool: () => alphabet,
  keyOf: (l) => l.hebrew,
})
const { phase, current, index, total, score, mistakes, lastCorrect } = session

const choices = ref<string[]>([])
const chosen = ref<string | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)
const weakest = ref<LetterInfo[]>([])

const refreshWeakest = () => {
  weakest.value = stats
    .weakest('names', 5)
    .map((key) => alphabet.find((l) => l.hebrew === key))
    .filter((l): l is LetterInfo => !!l)
}
refreshWeakest()

const prepare = () => {
  chosen.value = null
  if (current.value) choices.value = makeChoices(current.value.name, names)
}

const start = () => {
  session.start()
  prepare()
}

const pick = async (name: string) => {
  if (phase.value !== 'asking') return
  chosen.value = name
  session.answer(name === current.value!.name)
  await nextTick()
  nextButton.value?.focus()
}

const next = () => {
  if (session.next() === 'done') refreshWeakest()
  else prepare()
}

const again = () => {
  session.backToIntro()
  refreshWeakest()
}
</script>

<template>
  <div>
    <h2>Nazwy liter</h2>

    <div v-if="phase === 'intro'">
      <p>
        Zobaczysz hebrajską literę. Wybierz jej nazwę. Sesja ma 10 pytań i nie ma limitu czasu.
        Litery, które sprawiają Ci kłopot, będą wracać częściej.
      </p>
      <p v-if="weakest.length">
        Najtrudniejsze dla Ciebie:
        <template v-for="(l, i) in weakest" :key="l.hebrew">
          <span lang="he" dir="rtl" class="mini-glyph">{{ l.hebrew }}</span> ({{ l.name
          }}){{ i < weakest.length - 1 ? ', ' : '.' }}
        </template>
      </p>
      <p><button type="button" class="btn btn-primary" @click="start">Zaczynamy</button></p>
    </div>

    <div v-else-if="phase !== 'done'">
      <p class="progress">Pytanie {{ index + 1 }} z {{ total }}</p>
      <p class="glyph" lang="he" dir="rtl" role="img" aria-label="Hebrajska litera">
        {{ current?.hebrew }}
      </p>
      <p id="name-question">Jak nazywa się ta litera?</p>
      <div class="choices" role="group" aria-labelledby="name-question">
        <button
          v-for="name in choices"
          :key="name"
          type="button"
          class="btn choice"
          :class="{
            right: phase === 'answered' && name === current?.name,
            wrong: phase === 'answered' && name === chosen && name !== current?.name,
          }"
          :aria-disabled="phase === 'answered' ? 'true' : undefined"
          @click="pick(name)"
        >
          <span v-if="phase === 'answered' && name === current?.name" aria-hidden="true">✓ </span>
          <span v-else-if="phase === 'answered' && name === chosen" aria-hidden="true">✗ </span>
          {{ name }}
        </button>
      </div>

      <div aria-live="polite" class="feedback">
        <template v-if="phase === 'answered'">
          <p v-if="lastCorrect" class="status ok">Poprawnie!</p>
          <p v-else class="status bad">Błąd. To jest {{ current?.name }}.</p>
        </template>
      </div>
      <p v-if="phase === 'answered'">
        <button ref="nextButton" type="button" class="btn btn-primary" @click="next">
          {{ session.isLast.value ? 'Pokaż wynik' : 'Dalej' }}
        </button>
      </p>
    </div>

    <div v-else>
      <p class="score" role="status">Wynik: {{ score }} z {{ total }}</p>
      <template v-if="mistakes.length">
        <h3>Do powtórki</h3>
        <ul class="mistakes">
          <li v-for="m in mistakes" :key="m.item.hebrew">
            <span lang="he" dir="rtl" class="mini-glyph">{{ m.item.hebrew }}</span> – {{ m.item.name }}
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
