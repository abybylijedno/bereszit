<script setup lang="ts">
/**
 * Exercises on the small words of the grammar sheets (article and conjunction, prepositions,
 * pronouns, pronominal suffixes): translate a word, build a word, name the beginning of a word.
 */
import { computed, nextTick, ref } from 'vue'
import AffixWord from '@/components/AffixWord.vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { analyze } from '@/lib/converter'
import {
  itemsFor,
  prepare,
  WORD_TOPIC_LABELS,
  type Prepared,
  type WordItem,
  type WordTopic,
} from '@/lib/grammar/wordQuiz'
import { stats } from '@/lib/stats'

const props = defineProps<{ topic: WordTopic }>()

const session = useQuizSession<WordItem>({
  bucket: 'grammar',
  getPool: () => itemsFor(props.topic),
  keyOf: (item) => item.key,
})
const { phase, current, index, total, score, mistakes, lastCorrect } = session

const prepared = ref<Prepared>({ question: '', choices: [], correct: '', hebrew: false })
const chosen = ref<string | null>(null)
const showAffix = ref(false)
const nextButton = ref<HTMLButtonElement | null>(null)
const weakest = ref<WordItem[]>([])

const answered = computed(() => phase.value === 'answered')
const hasAffix = computed(() => !!(current.value?.prefix || current.value?.suffix))
/** Build questions give the Polish meaning; the other kinds show the Hebrew word. */
const showsWord = computed(() => current.value?.kind !== 'build')
const phonetics = (he: string) =>
  analyze(he)
    .map((w) => w.phonetics)
    .join(' ')

const refreshWeakest = () => {
  const all = itemsFor(props.topic)
  const seen = new Set<string>()
  weakest.value = stats
    .weakest('grammar', 30)
    .filter((key) => key.startsWith(`${props.topic}:`))
    .map((key) => all.find((item) => item.key === key))
    .filter((item): item is WordItem => !!item && !seen.has(item.he) && !!seen.add(item.he))
    .slice(0, 5)
}
refreshWeakest()

const prepareQuestion = () => {
  chosen.value = null
  if (current.value) prepared.value = prepare(current.value)
}

const start = () => {
  session.start()
  prepareQuestion()
}

const pick = async (value: string) => {
  if (phase.value !== 'asking') return
  chosen.value = value
  session.answer(value === prepared.value.correct)
  await nextTick()
  nextButton.value?.focus()
}

const next = () => {
  if (session.next() === 'done') refreshWeakest()
  else prepareQuestion()
}

const backToStart = () => {
  session.backToIntro()
  refreshWeakest()
}

const INTRO: Record<WordTopic, string> = {
  przedimek:
    'Rozpoznajesz przedimek, partykułę pytającą i spójnik na początku słów, w tym słowa, w których początkowa litera nie jest spójnikiem.',
  przyimki: 'Ćwiczysz przyimki zapisywane razem ze słowem: bet, lamed, kaf i mem.',
  zaimki: 'Ćwiczysz zaimki wskazujące, pytające i osobowe.',
  przyrostki: 'Ćwiczysz przyrostki zaimkowe: „mój koń", „twoje konie" i tak dalej.',
}
</script>

<template>
  <div>
    <h3>Ćwiczenia: {{ WORD_TOPIC_LABELS[topic].toLowerCase() }}</h3>

    <div v-if="phase === 'intro'">
      <p>
        {{ INTRO[topic] }} Pytania są różne: raz widzisz słowo i wybierasz jego znaczenie, raz
        widzisz znaczenie i wybierasz słowo. Sesja ma 10 pytań i nie ma limitu czasu. Słowa, które
        sprawiają Ci kłopot, będą wracać częściej.
      </p>
      <p v-if="weakest.length">
        Najtrudniejsze dla Ciebie:
        <template v-for="(item, i) in weakest" :key="item.key">
          <span lang="he" dir="rtl" class="mini-glyph">{{ item.he }}</span> ({{ item.pl }}){{
            i < weakest.length - 1 ? ', ' : '.'
          }}
        </template>
      </p>
      <p><button type="button" class="btn btn-primary" @click="start">Zaczynamy</button></p>
    </div>

    <div v-else-if="phase !== 'done'">
      <p class="progress">Pytanie {{ index + 1 }} z {{ total }}</p>

      <template v-if="showsWord && current">
        <p class="word">
          <AffixWord
            v-if="hasAffix && (showAffix || answered)"
            :word="current.he"
            :prefix="current.prefix"
            :suffix="current.suffix"
          />
          <span v-else lang="he" dir="rtl">{{ current.he }}</span>
        </p>
        <p v-if="hasAffix">
          <label class="check">
            <input v-model="showAffix" type="checkbox" />
            Zaznacz dodatek kolorem
          </label>
        </p>
      </template>
      <p id="question">{{ prepared.question }}</p>

      <div class="choices" role="group" aria-labelledby="question">
        <button
          v-for="value in prepared.choices"
          :key="value"
          type="button"
          class="btn choice"
          :class="{
            right: answered && value === prepared.correct,
            wrong: answered && value === chosen && value !== prepared.correct,
            hebrew: prepared.hebrew,
          }"
          :lang="prepared.hebrew ? 'he' : undefined"
          :dir="prepared.hebrew ? 'rtl' : undefined"
          :aria-disabled="answered ? 'true' : undefined"
          @click="pick(value)"
        >
          <span v-if="answered && value === prepared.correct" aria-hidden="true">✓ </span>
          <span v-else-if="answered && value === chosen" aria-hidden="true">✗ </span>
          {{ value }}
        </button>
      </div>

      <div aria-live="polite" class="feedback">
        <template v-if="answered && current">
          <p v-if="lastCorrect" class="status ok">Poprawnie!</p>
          <p v-else class="status bad">Błąd.</p>
          <p>
            <span lang="he" dir="rtl" class="mini-glyph">{{ current.he }}</span> (wymowa:
            {{ phonetics(current.he) }}) znaczy: {{ current.pl }}.
            <template v-if="current.answer && current.kind !== 'translate'">
              Początek słowa: {{ current.answer }}.
            </template>
          </p>
        </template>
      </div>
      <p v-if="answered">
        <button ref="nextButton" type="button" class="btn btn-primary" @click="next">
          {{ session.isLast.value ? 'Pokaż wynik' : 'Dalej' }}
        </button>
      </p>
    </div>

    <div v-else>
      <p class="score" role="status">Wynik: {{ score }} z {{ total }}</p>
      <template v-if="mistakes.length">
        <h4>Do powtórki</h4>
        <ul class="mistakes">
          <li v-for="m in mistakes" :key="m.item.key">
            <span lang="he" dir="rtl" class="mini-glyph">{{ m.item.he }}</span> – {{ m.item.pl }}
          </li>
        </ul>
      </template>
      <p v-else>Bez błędów, świetnie!</p>
      <p>
        <button type="button" class="btn btn-primary" @click="start">Jeszcze raz</button>
        <button type="button" class="btn" @click="backToStart">Koniec</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.word {
  /* The longest words (e.g. "מֵאֶרֶץ יִשְׂרָאֵל") must fit in 320px. */
  font-size: clamp(2rem, 9vw, 3.5rem);
  overflow-wrap: anywhere;
  line-height: 1.4;
  margin: 0;
  text-align: center;
}
.check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}
.choice {
  width: 100%;
  overflow-wrap: anywhere;
}
.choice.hebrew {
  font-size: 1.8rem;
}
</style>
