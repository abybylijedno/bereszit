<script setup lang="ts">
/**
 * Verb exercises (strong verb קטל, any of the seven verb forms). Two kinds of questions are
 * mixed: "which form is this word?" and "which word has this description?".
 */
import { computed, nextTick, ref, watch } from 'vue'
import PillRadios from '@/components/PillRadios.vue'
import RootWord from '@/components/RootWord.vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { analyze } from '@/lib/converter'
import { rootsFor } from '@/lib/grammar/strongVerbs'
import { PARADIGM_ROOT, type VerbForm } from '@/lib/grammar/verbParadigm'
import {
  allDescriptions,
  allForms,
  buildChoices,
  contextFor,
  describeForm,
  fixedPart,
  poolOf,
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

/** The verb form comes from the path bar; the tense starts as the topic of the bar. */
const props = defineProps<{ tense: 'perfectum' | 'imperfectum'; binyan: FormChoice }>()

const topic = ref<VerbTopic>(props.tense)
const topicOptions = (Object.keys(TOPIC_LABELS) as VerbTopic[]).map((value) => ({
  value,
  label: TOPIC_LABELS[value],
}))
const binyan = computed(() => props.binyan)
/** Regular verbs that work in the chosen verb form. */
const roots = computed(() => rootsFor(binyan.value))

/** What a description has to name; the rest is fixed by the question. */
const ctx = computed(() => contextFor(topic.value, binyan.value))
const fixed = computed(() => fixedPart(topic.value, binyan.value))
/** Lists of mistakes show everything, because they are not tied to one choice. */
const FULL: Context = { tense: true, binyan: true }

const session = useQuizSession<Question>({
  bucket: 'grammar',
  getPool: () => questionsFor(topic.value, binyan.value, roots.value),
  keyOf: questionKey,
})
const { phase, current, index, total, score, mistakes, lastCorrect } = session

/** Another verb form in the path bar means other questions: back to the start, settings stay. */
watch(
  () => props.binyan,
  () => session.backToIntro(),
)

const form = computed(() => current.value?.form)
const kind = computed(() => current.value?.kind)
const choices = ref<string[]>([])
const correctChoice = ref('')
const chosen = ref<string | null>(null)
const showAffixes = ref(false)
const nextButton = ref<HTMLButtonElement | null>(null)
const weakest = ref<VerbForm[]>([])

/** The root of the current question: the verb it is made from, or the paradigm verb. */
const rootLetters = computed(() => current.value?.root?.letters ?? PARADIGM_ROOT)
const rootHe = computed(() => current.value?.root?.he ?? PARADIGM_ROOT)
const rootMeaning = computed(() => current.value?.root?.pl)
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
  const q = current.value
  if (!f || !q) return
  const forms = poolOf(q, topic.value, binyan.value)
  if (kind.value === 'recognize') {
    correctChoice.value = describeForm(f, ctx.value)
    choices.value = recognizeChoices(f, forms, ctx.value)
  } else {
    correctChoice.value = f.he
    choices.value = buildChoices(f, forms)
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
  return allDescriptions(f, poolOf(current.value!, topic.value, binyan.value), ctx.value).join(
    ' lub ',
  )
})
</script>

<template>
  <div>
    <h3>Ćwiczenia: odmiana czasownika</h3>

    <div v-if="phase === 'intro'">
      <p>
        Ćwiczysz odmianę czasowników mocnych, czyli takich, w których żadna litera rdzenia nie
        zmienia odmiany. Czasownik jest za każdym razem inny (losujemy go), a formę czasownika
        wybierasz na pasku u góry. Pytania są dwojakie: raz widzisz słowo i wybierasz, jaka to forma
        (osoba, rodzaj, liczba), raz widzisz opis i wybierasz słowo. Sesja ma 10 pytań i nie ma
        limitu czasu. Formy, które sprawiają Ci kłopot, będą wracać częściej.
      </p>
      <p class="note">
        Do wyboru jest {{ roots.length }} czasowników z listy w zakładce „Słowa", bez „słabych"
        liter. Polskie znaczenie pokazujemy przy pytaniu.
      </p>
      <PillRadios v-model="topic" legend="Czas" :options="topicOptions" />
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
          <RootWord v-if="showAffixes || answered" :word="form!.he" :root="rootLetters" />
          <span v-else lang="he" dir="rtl">{{ form?.he }}</span>
        </p>
        <p>
          <label class="check">
            <input v-model="showAffixes" type="checkbox" />
            Zaznacz dodatki kolorem
          </label>
        </p>
        <p id="question">
          Jaka to forma czasownika <span lang="he" dir="rtl">{{ rootHe }}</span
          ><template v-if="rootMeaning"> („{{ rootMeaning }}")</template
          ><template v-if="fixed"> ({{ fixed }})</template>?
        </p>
      </template>
      <p v-else id="question">
        Które słowo to: <strong>{{ currentLabel }}</strong
        ><template v-if="fixed"> ({{ fixed }})</template>, od czasownika
        <span lang="he" dir="rtl">{{ rootHe }}</span
        ><template v-if="rootMeaning"> („{{ rootMeaning }}")</template>?
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
        <h4>Do powtórki</h4>
        <ul class="mistakes">
          <li v-for="m in mistakes" :key="questionKey(m.item)">
            <span lang="he" dir="rtl" class="mini-glyph">{{ m.item.form.he }}</span> –
            {{ describeForm(m.item.form, FULL) }}
            <template v-if="m.item.root">
              (od <span lang="he" dir="rtl">{{ m.item.root.he }}</span
              >)</template
            >
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
  /* The longest forms (Hitpael, 2nd person plural) must fit in 320px; wide screens get 3.5rem. */
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
}
.choice.hebrew {
  font-size: 1.8rem;
}
</style>
