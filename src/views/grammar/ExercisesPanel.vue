<script setup lang="ts">
/**
 * Verb exercises (strong verb קטל, any of the seven verb forms). Two kinds of questions are
 * mixed: "which form is this word?" and "which word has this description?".
 */
import { computed, nextTick, ref } from 'vue'
import PillRadios from '@/components/PillRadios.vue'
import RootWord from '@/components/RootWord.vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { analyze } from '@/lib/converter'
import { PARADIGM_ROOT, type VerbForm } from '@/lib/grammar/verbParadigm'
import {
  allDescriptions,
  allForms,
  buildChoices,
  contextFor,
  describeForm,
  fixedPart,
  FORM_LABELS,
  formsFor,
  questionKey,
  questionsFor,
  recognizeChoices,
  TOPIC_LABELS,
  type Context,
  type FormChoice,
  type Question,
  type VerbTopic,
} from '@/lib/grammar/verbQuiz'
import { stats } from '@/lib/stats'

const topic = ref<VerbTopic>('perfectum')
const topicOptions = (Object.keys(TOPIC_LABELS) as VerbTopic[]).map((value) => ({
  value,
  label: TOPIC_LABELS[value],
}))
const binyan = ref<FormChoice>('kal')
const formOptions = (Object.keys(FORM_LABELS) as FormChoice[]).map((value) => ({
  value,
  label: FORM_LABELS[value],
}))
const pool = computed(() => formsFor(topic.value, binyan.value))
/** What a description has to name; the rest is fixed by the question. */
const ctx = computed(() => contextFor(topic.value, binyan.value))
const fixed = computed(() => fixedPart(topic.value, binyan.value))
/** Lists of mistakes show everything, because they are not tied to one choice. */
const FULL: Context = { tense: true, binyan: true }

const session = useQuizSession<Question>({
  bucket: 'grammar',
  getPool: () => questionsFor(topic.value, binyan.value),
  keyOf: questionKey,
})
const { phase, current, index, total, score, mistakes, lastCorrect } = session

const form = computed(() => current.value?.form)
const kind = computed(() => current.value?.kind)
const choices = ref<string[]>([])
const correctChoice = ref('')
const chosen = ref<string | null>(null)
const showAffixes = ref(false)
const nextButton = ref<HTMLButtonElement | null>(null)
const weakest = ref<VerbForm[]>([])

const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
const answered = computed(() => phase.value === 'answered')
const currentLabel = computed(() => (form.value ? describeForm(form.value, ctx.value) : ''))

const refreshWeakest = () => {
  weakest.value = stats
    .weakest('grammar', 10)
    .map((key) => allForms.find((f) => f.id === key.split(':')[0]))
    .filter((f, i, all): f is VerbForm => !!f && all.indexOf(f) === i)
    .slice(0, 5)
}
refreshWeakest()

const prepare = () => {
  chosen.value = null
  const f = form.value
  if (!f) return
  if (kind.value === 'recognize') {
    correctChoice.value = describeForm(f, ctx.value)
    choices.value = recognizeChoices(f, pool.value, ctx.value)
  } else {
    correctChoice.value = f.he
    choices.value = buildChoices(f, pool.value)
  }
}

const start = () => {
  session.start()
  prepare()
}

const pick = async (value: string) => {
  if (phase.value !== 'asking') return
  chosen.value = value
  session.answer(value === correctChoice.value)
  await nextTick()
  nextButton.value?.focus()
}

const next = () => {
  if (session.next() === 'done') refreshWeakest()
  else prepare()
}

const backToStart = () => {
  session.backToIntro()
  refreshWeakest()
}

/** Wrong answers explain the right one; a word spelled the same may fit two descriptions. */
const explanation = computed(() => {
  const f = form.value
  if (!f) return ''
  return allDescriptions(f, pool.value, ctx.value).join(' lub ')
})
</script>

<template>
  <div>
    <h2>
      Ćwiczenia: czasownik <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span>
    </h2>

    <div v-if="phase === 'intro'">
      <p>
        Ćwiczysz odmianę czasownika mocnego. Wybierz formę czasownika i czas. Pytania są dwojakie:
        raz widzisz słowo i wybierasz, jaka to forma (osoba, rodzaj, liczba), raz widzisz opis i
        wybierasz słowo. Sesja ma 10 pytań i nie ma limitu czasu. Formy, które sprawiają Ci kłopot,
        będą wracać częściej.
      </p>
      <PillRadios v-model="binyan" legend="Forma czasownika" :options="formOptions" />
      <PillRadios v-model="topic" legend="Temat" :options="topicOptions" />
      <p v-if="weakest.length">
        Najtrudniejsze dla Ciebie:
        <template v-for="(f, i) in weakest" :key="f.id">
          <span lang="he" dir="rtl" class="mini-glyph">{{ f.he }}</span> ({{
            describeForm(f, FULL)
          }}){{ i < weakest.length - 1 ? ', ' : '.' }}
        </template>
      </p>
      <p><button type="button" class="btn btn-primary" @click="start">Zaczynamy</button></p>
    </div>

    <div v-else-if="phase !== 'done'">
      <p class="progress">Pytanie {{ index + 1 }} z {{ total }}</p>

      <template v-if="kind === 'recognize'">
        <p class="word">
          <RootWord v-if="showAffixes || answered" :word="form!.he" :root="PARADIGM_ROOT" />
          <span v-else lang="he" dir="rtl">{{ form?.he }}</span>
        </p>
        <p>
          <label class="check">
            <input v-model="showAffixes" type="checkbox" />
            Zaznacz dodatki kolorem
          </label>
        </p>
        <p id="question">
          Jaka to forma czasownika <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span
          ><template v-if="fixed"> ({{ fixed }})</template>?
        </p>
      </template>
      <p v-else id="question">
        Które słowo to: <strong>{{ currentLabel }}</strong
        ><template v-if="fixed"> ({{ fixed }})</template>?
      </p>

      <div class="choices" role="group" aria-labelledby="question">
        <button
          v-for="value in choices"
          :key="value"
          type="button"
          class="btn choice"
          :class="{
            right: answered && value === correctChoice,
            wrong: answered && value === chosen && value !== correctChoice,
            hebrew: kind === 'build',
          }"
          :lang="kind === 'build' ? 'he' : undefined"
          :dir="kind === 'build' ? 'rtl' : undefined"
          :aria-disabled="answered ? 'true' : undefined"
          @click="pick(value)"
        >
          <span v-if="answered && value === correctChoice" aria-hidden="true">✓ </span>
          <span v-else-if="answered && value === chosen" aria-hidden="true">✗ </span>
          {{ value }}
        </button>
      </div>

      <div aria-live="polite" class="feedback">
        <template v-if="answered">
          <p v-if="lastCorrect" class="status ok">Poprawnie!</p>
          <p v-else class="status bad">Błąd.</p>
          <p>
            <span lang="he" dir="rtl" class="mini-glyph">{{ form?.he }}</span> (wymowa:
            {{ phonetics(form!.he) }}) to: {{ explanation }}
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
        <h3>Do powtórki</h3>
        <ul class="mistakes">
          <li v-for="m in mistakes" :key="questionKey(m.item)">
            <span lang="he" dir="rtl" class="mini-glyph">{{ m.item.form.he }}</span> –
            {{ describeForm(m.item.form, FULL) }}
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
  font-size: 3.5rem;
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
}
.choice.hebrew {
  font-size: 1.8rem;
}
</style>
